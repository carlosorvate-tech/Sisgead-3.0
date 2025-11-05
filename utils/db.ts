import { openDB, type IDBPDatabase } from 'idb';
// FIX: Import AllData from the central types file.
import { type AuditRecord, type TeamProposal, type TeamComposition, type AllData } from '../types';
import { AUDIT_LOG_KEY, PROPOSAL_LOG_KEY, TEAMS_KEY } from '../constants';

const DB_NAME = 'sisgead-db';
const DB_VERSION = 1;
const AUDIT_LOG_STORE = 'auditLog';
const PROPOSAL_LOG_STORE = 'proposalLog';
const TEAMS_STORE = 'teams';
const SETTINGS_STORE = 'settings';

interface SisgeadDB {
    [AUDIT_LOG_STORE]: AuditRecord[];
    [PROPOSAL_LOG_STORE]: TeamProposal[];
    [TEAMS_STORE]: TeamComposition[];
    [SETTINGS_STORE]: any;
}

let dbPromise: Promise<IDBPDatabase<SisgeadDB>>;

const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<SisgeadDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore(AUDIT_LOG_STORE);
        db.createObjectStore(PROPOSAL_LOG_STORE);
        db.createObjectStore(TEAMS_STORE);
        db.createObjectStore(SETTINGS_STORE);
      },
    });
  }
  return dbPromise;
};

initDB();

export const saveAllData = async (data: AllData): Promise<void> => {
    const db = await dbPromise;
    const tx = db.transaction([AUDIT_LOG_STORE, PROPOSAL_LOG_STORE, TEAMS_STORE], 'readwrite');
    await Promise.all([
        tx.objectStore(AUDIT_LOG_STORE).put(data.auditLog, AUDIT_LOG_KEY),
        tx.objectStore(PROPOSAL_LOG_STORE).put(data.proposalLog, PROPOSAL_LOG_KEY),
        tx.objectStore(TEAMS_STORE).put(data.teams, TEAMS_KEY),
    ]);
    await tx.done;
};

export const getAllData = async (): Promise<AllData> => {
    const db = await dbPromise;
    const [auditLog, proposalLog, teams] = await Promise.all([
        db.get(AUDIT_LOG_STORE, AUDIT_LOG_KEY),
        db.get(PROPOSAL_LOG_STORE, PROPOSAL_LOG_KEY),
        db.get(TEAMS_STORE, TEAMS_KEY)
    ]);
    return {
        auditLog: auditLog || [],
        proposalLog: proposalLog || [],
        teams: teams || [],
    };
};

export const saveSetting = async (key: string, value: any): Promise<void> => {
  const db = await dbPromise;
  const tx = db.transaction(SETTINGS_STORE, 'readwrite');
  await tx.objectStore(SETTINGS_STORE).put(value, key);
  await tx.done;
};

export const loadSetting = async <T>(key: string): Promise<T | undefined> => {
  const db = await dbPromise;
  return db.get(SETTINGS_STORE, key);
};