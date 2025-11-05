import { saveSetting, loadSetting } from './db';

const DB_FILE_NAME = 'sisgead-database.json';
const HANDLE_KEY = 'fileSystemDirectoryHandle';

/**
 * Checks if the File System Access API is supported by the browser.
 * @returns {boolean} True if the browser supports the API, otherwise false.
 */
export const isFileSystemApiSupported = (): boolean => 'showDirectoryPicker' in window;

/**
 * Prompts the user to select a directory for storing the application database.
 * The selected directory handle is then persisted in IndexedDB for future sessions.
 * @returns {Promise<FileSystemDirectoryHandle | null>} The directory handle if the user selects a directory, otherwise null.
 */
export const requestDirectoryHandle = async (): Promise<FileSystemDirectoryHandle | null> => {
  if (!isFileSystemApiSupported()) {
    alert('Seu navegador não suporta a API de Acesso ao Sistema de Arquivos. Tente usar o Chrome ou Edge.');
    return null;
  }
  try {
    // FIX: Cast window to `any` to access the non-standard `showDirectoryPicker` method.
    // This resolves a TypeScript error where the property is not found on the standard Window type.
    const handle = await (window as any).showDirectoryPicker();
    await saveSetting(HANDLE_KEY, handle);
    return handle;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
        console.log('User cancelled the directory picker.');
    } else {
        console.error('Error requesting directory handle:', err);
    }
    return null;
  }
};

/**
 * Retrieves the stored directory handle from IndexedDB.
 * @returns {Promise<FileSystemDirectoryHandle | null>} The stored handle, or null if not found.
 */
export const getStoredDirectoryHandle = async (): Promise<FileSystemDirectoryHandle | null> => {
  return await loadSetting<FileSystemDirectoryHandle>(HANDLE_KEY);
};

/**
 * Checks if the app has permission to read and write to the directory.
 * Only checks existing permission, does NOT request new permissions.
 * @param {FileSystemDirectoryHandle} handle The directory handle to check permission for.
 * @returns {Promise<boolean>} True if permission is already granted, otherwise false.
 */
export const checkPermission = async (handle: FileSystemDirectoryHandle): Promise<boolean> => {
  const options = { mode: 'readwrite' as const };
  try {
    // Check if permission is already granted
    // FIX: Cast handle to `any` to access the non-standard `queryPermission` method.
    return (await (handle as any).queryPermission(options)) === 'granted';
  } catch (error) {
    console.warn('Permission check failed:', error);
    return false;
  }
};

/**
 * Requests permission to read and write to the directory.
 * MUST be called only during user interaction (e.g., button click).
 * @param {FileSystemDirectoryHandle} handle The directory handle to request permission for.
 * @returns {Promise<boolean>} True if permission is granted, otherwise false.
 */
export const requestPermission = async (handle: FileSystemDirectoryHandle): Promise<boolean> => {
  const options = { mode: 'readwrite' as const };
  try {
    // Request permission (requires user activation)
    // FIX: Cast handle to `any` to access the non-standard `requestPermission` method.
    return (await (handle as any).requestPermission(options)) === 'granted';
  } catch (error) {
    console.warn('Permission request failed:', error);
    return false;
  }
};

/**
 * Verifies if the application has read/write permission for the given directory handle.
 * Only checks existing permission by default. Use allowRequest=true during user interactions.
 * @param {FileSystemDirectoryHandle} handle The directory handle to verify.
 * @param {boolean} allowRequest Whether to request permission if not granted. Default: false.
 * @returns {Promise<boolean>} True if permission is granted, otherwise false.
 */
export const verifyPermission = async (handle: FileSystemDirectoryHandle, allowRequest: boolean = false): Promise<boolean> => {
  // First check existing permission
  if (await checkPermission(handle)) {
    return true;
  }
  
  // Only request if explicitly allowed and during user interaction
  if (allowRequest) {
    return await requestPermission(handle);
  }
  
  return false;
};

/**
 * Reads and parses the JSON database file from the specified directory.
 * @template T The expected type of the parsed data.
 * @param {FileSystemDirectoryHandle} handle The directory handle.
 * @returns {Promise<T | null>} The parsed data object, or null if the file doesn't exist or an error occurs.
 */
export const readFile = async <T>(handle: FileSystemDirectoryHandle): Promise<T | null> => {
  try {
    const fileHandle = await handle.getFileHandle(DB_FILE_NAME, { create: false });
    const file = await fileHandle.getFile();
    const content = await file.text();
    return JSON.parse(content) as T;
  } catch (err) {
    // It's not an error if the file doesn't exist on the first run in a new directory.
    if (err instanceof DOMException && err.name === 'NotFoundError') {
        return null;
    }
    console.error('Error reading file from handle:', err);
    return null;
  }
};

/**
 * Writes the entire application state to the JSON database file in the specified directory.
 * This creates the file if it doesn't exist.
 * @param {FileSystemDirectoryHandle} handle The directory handle.
 * @param {any} data The complete data object to serialize and save.
 * @returns {Promise<boolean>} True if the write was successful, otherwise false.
 */
export const writeFile = async (handle: FileSystemDirectoryHandle, data: any): Promise<boolean> => {
  try {
    const fileHandle = await handle.getFileHandle(DB_FILE_NAME, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(data, null, 2));
    await writable.close();
    return true;
  } catch (err) {
    console.error('Error writing file to handle:', err);
    alert('Não foi possível salvar no arquivo. Verifique as permissões da pasta e o espaço em disco.');
    return false;
  }
};

/**
 * Removes the stored directory handle from IndexedDB.
 * This is used when the handle becomes invalid or the user disconnects.
 */
export const clearStoredDirectoryHandle = async (): Promise<void> => {
  await saveSetting(HANDLE_KEY, null);
};