// 📚 EXEMPLO DE USO - Storage Adapter Pattern
// Este arquivo demonstra como usar a nova camada de armazenamento

import { StorageFactory } from './storage/Factory';
import { DISCCalculator } from './core/disc/calculator';
import type { DISCAnswers } from './core/disc/calculator';

// Tipos simplificados para exemplo (usariam os tipos reais do projeto)
interface Document {
  id: string;
  title: string;
  content: any;
  type: string;
  author: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

interface Team {
  id: string;
  name: string;
  organizationId: string;
  members: string[];
}

interface Organization {
  id: string;
  name: string;
}

// ────────────────────────────────────────────────────────────
// 1️⃣ INICIALIZAÇÃO AUTOMÁTICA
// ────────────────────────────────────────────────────────────

// O factory detecta automaticamente o modo:
// - Browser comum: IndexedDB (LocalStorageAdapter)
// - Electron app: SQLite (futuro)
// - Web com backend: API REST (futuro)

const storage = StorageFactory.create();

console.log(`Modo de storage: ${storage.name}`);
// Output: "IndexedDB Storage" (no navegador)
// Output: "SQLite Storage" (no Electron - futuro)
// Output: "API Storage" (na web hospedada - futuro)

// ────────────────────────────────────────────────────────────
// 2️⃣ OPERAÇÕES BÁSICAS
// ────────────────────────────────────────────────────────────

async function exemplosBasicos() {
  
  // SALVAR dados
  const documento: Document = {
    id: crypto.randomUUID(),
    title: 'Relatório DISC - Equipe Alpha',
    content: { scores: { D: 85, I: 60, S: 45, C: 70 } },
    type: 'disc-report',
    author: { id: 'user-123', name: 'João Silva' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  await storage.save(`documents:${documento.id}`, documento);
  console.log('✅ Documento salvo!');
  
  
  // RECUPERAR dados
  const retrieved = await storage.get<Document>(`documents:${documento.id}`);
  console.log('📄 Documento:', retrieved?.title);
  
  
  // LISTAR documentos por padrão
  const allDocs = await storage.list('documents:*');
  console.log(`📚 Total de documentos: ${allDocs.length}`);
  
  
  // EXCLUIR documento
  await storage.delete(`documents:${documento.id}`);
  console.log('🗑️ Documento removido!');
}

// ────────────────────────────────────────────────────────────
// 3️⃣ QUERIES AVANÇADAS
// ────────────────────────────────────────────────────────────

async function exemplosQueries() {
  
  // FILTRAR por tipo e data
  const recentReports = await storage.query<Document>({
    collection: 'documents',
    filters: [
      { field: 'type', operator: 'eq', value: 'disc-report' },
      { 
        field: 'metadata.createdAt', 
        operator: 'gte', 
        value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 dias
      }
    ],
    sort: { field: 'metadata.createdAt', direction: 'desc' },
    limit: 10
  });
  
  console.log(`📊 Relatórios recentes: ${recentReports.length}`);
  
  
  // BUSCAR equipes de uma organização
  const teams = await storage.query<Team>({
    collection: 'teams',
    filters: [
      { field: 'organizationId', operator: 'eq', value: 'org-456' }
    ]
  });
  
  console.log(`👥 Equipes da organização: ${teams.length}`);
}

// ────────────────────────────────────────────────────────────
// 4️⃣ TRANSAÇÕES (Operações Atômicas)
// ────────────────────────────────────────────────────────────

async function exemploTransacao() {
  
  const team: Team = {
    id: crypto.randomUUID(),
    name: 'Equipe Marketing',
    organizationId: 'org-789',
    members: ['user-1', 'user-2', 'user-3']
  };
  
  const org: Organization = {
    id: 'org-789',
    name: 'Empresa XYZ',
    // ... outros campos
  };
  
  try {
    // Salvar equipe E organização atomicamente
    await storage.transaction([
      { type: 'save', key: `teams:${team.id}`, data: team },
      { type: 'save', key: `organizations:${org.id}`, data: org }
    ]);
    
    console.log('✅ Equipe e organização criadas com sucesso!');
    
  } catch (error) {
    // Se falhar, NADA é salvo (rollback automático)
    console.error('❌ Erro na transação:', error);
  }
}

// ────────────────────────────────────────────────────────────
// 5️⃣ ESTATÍSTICAS
// ────────────────────────────────────────────────────────────

async function exibirEstatisticas() {
  
  const stats = await storage.getStats();
  
  console.log('📊 Estatísticas do Storage:');
  console.log(`   Total de chaves: ${stats.totalKeys}`);
  console.log(`   Tamanho total: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Coleções:`);
  
  for (const [collection, count] of Object.entries(stats.collections)) {
    console.log(`   - ${collection}: ${count} registros`);
  }
}

// ────────────────────────────────────────────────────────────
// 6️⃣ INTEGRAÇÃO COM DISC CALCULATOR
// ────────────────────────────────────────────────────────────

async function exemploCompletoDISC() {
  
  // Usuário responde questionário
  const answers: DISCAnswers = {
    1: 'A', 2: 'B', 3: 'D', 4: 'C', 5: 'A',
    6: 'B', 7: 'C', 8: 'A', 9: 'D', 10: 'B',
    11: 'A', 12: 'C', 13: 'B', 14: 'D', 15: 'A',
    16: 'C', 17: 'B', 18: 'A', 19: 'D', 20: 'C',
    21: 'B', 22: 'A', 23: 'C', 24: 'D'
  };
  
  // Validar respostas
  const validation = DISCCalculator.validateAnswers(answers);
  if (!validation.valid) {
    console.error('❌ Respostas inválidas:', validation.errors);
    return;
  }
  
  // Calcular perfil DISC
  const profile = DISCCalculator.calculate(answers);
  
  console.log('🎯 Perfil DISC calculado:');
  console.log(`   Código: ${profile.profileCode}`);
  console.log(`   Primário: ${profile.primaryProfile}`);
  console.log(`   Intensidade: ${profile.intensity}`);
  console.log(`   Pontuações: D=${profile.scores.D} I=${profile.scores.I} S=${profile.scores.S} C=${profile.scores.C}`);
  
  
  // Salvar resultado completo
  const userId = 'user-999';
  const result = {
    userId,
    profile,
    answers,
    calculatedAt: new Date().toISOString()
  };
  
  await storage.save(`disc-results:${userId}`, result);
  console.log('💾 Resultado salvo com sucesso!');
  
  
  // Recuperar depois
  const saved = await storage.get(`disc-results:${userId}`);
  console.log(`📖 Perfil salvo: ${saved?.profile.profileCode}`);
}

// ────────────────────────────────────────────────────────────
// 7️⃣ MIGRAÇÃO FUTURA (Browser → Servidor)
// ────────────────────────────────────────────────────────────

async function exemploMigracao() {
  
  // O MESMO CÓDIGO funciona em todos os modos!
  // Não precisa mudar NADA quando migrar para servidor
  
  // Hoje (Browser - IndexedDB):
  const storage = StorageFactory.create(); // → LocalStorageAdapter
  await storage.save('key', { data: 'value' });
  
  // Amanhã (Electron - SQLite):
  // const storage = StorageFactory.create(); // → SQLiteAdapter
  // await storage.save('key', { data: 'value' });
  
  // Futuro (Web - API):
  // const storage = StorageFactory.create(); // → APIAdapter
  // await storage.save('key', { data: 'value' });
  
  // 🎉 SEM MUDANÇAS NO CÓDIGO!
}

// ────────────────────────────────────────────────────────────
// 8️⃣ USO EM COMPONENTES REACT
// ────────────────────────────────────────────────────────────

/*
import React, { useEffect, useState } from 'react';
import { StorageFactory } from '../storage/Factory';

export function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const storage = StorageFactory.create();
  
  useEffect(() => {
    async function loadDocuments() {
      const docs = await storage.query<Document>({
        collection: 'documents',
        sort: { field: 'metadata.createdAt', direction: 'desc' }
      });
      setDocuments(docs);
    }
    
    loadDocuments();
  }, []);
  
  async function handleDelete(id: string) {
    await storage.delete(`documents:${id}`);
    setDocuments(prev => prev.filter(d => d.id !== id));
  }
  
  return (
    <div>
      {documents.map(doc => (
        <div key={doc.id}>
          <h3>{doc.title}</h3>
          <button onClick={() => handleDelete(doc.id)}>Excluir</button>
        </div>
      ))}
    </div>
  );
}
*/

// ────────────────────────────────────────────────────────────
// 🚀 EXECUTAR EXEMPLOS
// ────────────────────────────────────────────────────────────

async function main() {
  console.log('🎯 SISGEAD 3.0 - Storage Adapter Pattern\n');
  
  await exemplosBasicos();
  console.log('\n───────────────────────────────────────\n');
  
  await exemplosQueries();
  console.log('\n───────────────────────────────────────\n');
  
  await exemploTransacao();
  console.log('\n───────────────────────────────────────\n');
  
  await exibirEstatisticas();
  console.log('\n───────────────────────────────────────\n');
  
  await exemploCompletoDISC();
  console.log('\n───────────────────────────────────────\n');
}

// Execute no console do navegador:
// main().then(() => console.log('✅ Exemplos concluídos!'));

export {
  exemplosBasicos,
  exemplosQueries,
  exemploTransacao,
  exibirEstatisticas,
  exemploCompletoDISC,
  exemploMigracao
};
