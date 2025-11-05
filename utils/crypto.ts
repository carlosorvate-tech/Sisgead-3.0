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
import { type Scores } from '../types';

// Hashing Function for Data Integrity
export async function createVerificationHash(data: { name: string; cpf: string; scores: Scores }): Promise<string> {
    const dataString = `${data.name.trim()}|${data.cpf.replace(/\D/g, '')}|D:${data.scores.D}|I:${data.scores.I}|S:${data.scores.S}|C:${data.scores.C}`;
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(dataString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex.slice(0, 16); // Return a shorter hash
}
// bycao (ogrorvatigão) 2025