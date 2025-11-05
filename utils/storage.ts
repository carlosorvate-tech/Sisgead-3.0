/**
 * @license
 * Copyright 2024 INFINITUS Sistemas Inteligentes LTDA.
 * CNPJ: 09.371.580/0001-06
 *
 * Este código é propriedade da INFINITUS Sistemas Inteligentes LTDA.
 * A cópia, distribuição, modificação ou uso não autorizado deste código,
 * no todo ou em parte, é estritamente proibido.
 * Todos os direitos reservados.
 */
import { type AuditRecord, type TeamProposal, type TeamComposition } from '../types';

// NOTE: This file is now only used for one-time migration of legacy data.
// All new data persistence is handled by utils/db.ts (IndexedDB) and utils/fileSystem.ts.

export function loadFromStorage<T>(key: string, validator: (data: any) => data is T, defaultValue: T): T {
    try {
        const rawData = localStorage.getItem(key);
        if (rawData) {
            const parsedData = JSON.parse(rawData);
            if (validator(parsedData)) {
                return parsedData;
            } else {
                console.warn(`Data from "${key}" failed validation. Using default.`);
                return defaultValue;
            }
        }
        return defaultValue;
    } catch (e) {
        console.error(`Failed to load or parse from localStorage key "${key}":`, e);
        return defaultValue;
    }
}

export function removeFromStorage(key: string): void {
    try {
        localStorage.removeItem(key);
    } catch (e) {
        console.error(`Failed to remove from localStorage key "${key}":`, e);
    }
}

// Type Guards for Validation
export const isValidAuditLog = (data: any): data is AuditRecord[] => {
    return Array.isArray(data) && data.every(item => typeof item === 'object' && 'id' in item && 'name' in item && 'cpf' in item);
};

export const isValidProposalLog = (data: any): data is TeamProposal[] => {
    return Array.isArray(data) && data.every(item => typeof item === 'object' && 'id' in item && 'query' in item && 'response' in item);
};

export const isValidTeamsLog = (data: any): data is TeamComposition[] => {
    return Array.isArray(data) && data.every(item => typeof item === 'object' && 'id' in item && 'name' in item && Array.isArray(item.members));
};
// bycao (ogrorvatigão) 2025