/**
 * SISGEAD 3.0 Premium - Multi-Tenant Isolation Tests
 * Testes E2E garantindo isolamento total entre organizações
 * 
 * OBJETIVO: Garantir que Org A NUNCA vê dados de Org B
 */

import { assessmentService } from '../services/premium/assessmentService';
import { teamMemberService } from '../services/premium/teamMemberService';
import { auditService } from '../services/premium/auditService';
import { kpiService } from '../services/premium/kpiService';
import {
  AssessmentType,
  AssessmentStatus,
  MemberRole,
  RemovalReason,
  KPIPeriod,
  AuditEventType,
  AuditSeverity
} from '../types/premium';

/**
 * Configuração de teste
 */
const TEST_CONFIG = {
  // Instituição 1
  institution1: {
    id: 'inst-test-001',
    org1: 'org-test-001-a',
    org2: 'org-test-001-b',
    team1: 'team-test-001-a-1',
    team2: 'team-test-001-b-1',
    user1: 'user-test-001-a-1',
    user2: 'user-test-001-b-1',
    admin1: 'admin-test-001-a',
    admin2: 'admin-test-001-b'
  },
  // Instituição 2 (isolamento inter-institucional)
  institution2: {
    id: 'inst-test-002',
    org1: 'org-test-002-a',
    team1: 'team-test-002-a-1',
    user1: 'user-test-002-a-1',
    admin1: 'admin-test-002-a'
  }
};

/**
 * Testes de Isolamento de Assessments
 */
export async function testAssessmentIsolation(): Promise<void> {
  console.log('🧪 Testando isolamento de Assessments...');

  const { institution1, institution2 } = TEST_CONFIG;

  // Criar assessment na Org A da Instituição 1
  const assessmentOrgA = await assessmentService.create({
    userId: institution1.user1,
    organizationId: institution1.org1,
    type: AssessmentType.DISC,
    settings: {
      requireApproval: false,
      allowReassessment: true,
      notifyOnCompletion: false,
      notifyOnApproval: false
    },
    title: 'Assessment Org A - Test'
  }, institution1.id, institution1.admin1);

  // Criar assessment na Org B da Instituição 1
  const assessmentOrgB = await assessmentService.create({
    userId: institution1.user2,
    organizationId: institution1.org2,
    type: AssessmentType.DISC,
    settings: {
      requireApproval: false,
      allowReassessment: true,
      notifyOnCompletion: false,
      notifyOnApproval: false
    },
    title: 'Assessment Org B - Test'
  }, institution1.id, institution1.admin2);

  // Criar assessment na Instituição 2
  const assessmentInst2 = await assessmentService.create({
    userId: institution2.user1,
    organizationId: institution2.org1,
    type: AssessmentType.DISC,
    settings: {
      requireApproval: false,
      allowReassessment: true,
      notifyOnCompletion: false,
      notifyOnApproval: false
    },
    title: 'Assessment Inst 2 - Test'
  }, institution2.id, institution2.admin1);

  // TESTE 1: Org A não deve ver assessment de Org B
  const orgAList = await assessmentService.list({
    institutionId: institution1.id,
    organizationId: institution1.org1
  });

  const foundOrgBInOrgA = orgAList.some(a => a.id === assessmentOrgB.id);
  if (foundOrgBInOrgA) {
    throw new Error('❌ FALHA: Org A conseguiu ver assessment de Org B!');
  }
  console.log('✅ SUCESSO: Org A não vê assessments de Org B');

  // TESTE 2: Org B não deve ver assessment de Org A
  const orgBList = await assessmentService.list({
    institutionId: institution1.id,
    organizationId: institution1.org2
  });

  const foundOrgAInOrgB = orgBList.some(a => a.id === assessmentOrgA.id);
  if (foundOrgAInOrgB) {
    throw new Error('❌ FALHA: Org B conseguiu ver assessment de Org A!');
  }
  console.log('✅ SUCESSO: Org B não vê assessments de Org A');

  // TESTE 3: Instituição 1 não deve ver dados de Instituição 2
  const inst1List = await assessmentService.list({
    institutionId: institution1.id
  });

  const foundInst2InInst1 = inst1List.some(a => a.id === assessmentInst2.id);
  if (foundInst2InInst1) {
    throw new Error('❌ FALHA: Instituição 1 conseguiu ver assessment de Instituição 2!');
  }
  console.log('✅ SUCESSO: Isolamento inter-institucional funcionando');

  // TESTE 4: getById deve retornar null para org errada
  const wrongOrgAccess = await assessmentService.getById(
    assessmentOrgA.id,
    institution1.id,
    institution1.org2 // Tentando acessar assessment de Org A usando Org B
  );

  if (wrongOrgAccess !== null) {
    throw new Error('❌ FALHA: getById não validou organizationId!');
  }
  console.log('✅ SUCESSO: getById valida organizationId corretamente');

  // TESTE 5: getById deve retornar null para instituição errada
  const wrongInstAccess = await assessmentService.getById(
    assessmentOrgA.id,
    institution2.id // Tentando acessar com instituição errada
  );

  if (wrongInstAccess !== null) {
    throw new Error('❌ FALHA: getById não validou institutionId!');
  }
  console.log('✅ SUCESSO: getById valida institutionId corretamente');

  console.log('✅ Todos os testes de isolamento de Assessments passaram!\n');
}

/**
 * Testes de Isolamento de Team Members
 */
export async function testTeamMemberIsolation(): Promise<void> {
  console.log('🧪 Testando isolamento de Team Members...');

  const { institution1, institution2 } = TEST_CONFIG;

  // Adicionar membro na Org A
  const memberOrgA = await teamMemberService.addMember({
    teamId: institution1.team1,
    userId: institution1.user1,
    role: MemberRole.MEMBER,
    allowReassessment: true
  }, institution1.id, institution1.org1, institution1.admin1);

  // Adicionar membro na Org B
  const memberOrgB = await teamMemberService.addMember({
    teamId: institution1.team2,
    userId: institution1.user2,
    role: MemberRole.MEMBER,
    allowReassessment: true
  }, institution1.id, institution1.org2, institution1.admin2);

  // Adicionar membro na Instituição 2
  const memberInst2 = await teamMemberService.addMember({
    teamId: institution2.team1,
    userId: institution2.user1,
    role: MemberRole.MEMBER,
    allowReassessment: true
  }, institution2.id, institution2.org1, institution2.admin1);

  // TESTE 1: Org A não deve ver membros de Org B
  const orgAMembers = await teamMemberService.list({
    institutionId: institution1.id,
    organizationId: institution1.org1
  });

  const foundOrgBMemberInOrgA = orgAMembers.some(m => m.id === memberOrgB.id);
  if (foundOrgBMemberInOrgA) {
    throw new Error('❌ FALHA: Org A conseguiu ver membro de Org B!');
  }
  console.log('✅ SUCESSO: Org A não vê membros de Org B');

  // TESTE 2: Instituição 1 não deve ver membros de Instituição 2
  const inst1Members = await teamMemberService.list({
    institutionId: institution1.id
  });

  const foundInst2MemberInInst1 = inst1Members.some(m => m.id === memberInst2.id);
  if (foundInst2MemberInInst1) {
    throw new Error('❌ FALHA: Instituição 1 conseguiu ver membro de Instituição 2!');
  }
  console.log('✅ SUCESSO: Isolamento inter-institucional de membros funcionando');

  // TESTE 3: getById deve validar multi-tenant
  const wrongOrgMember = await teamMemberService.getById(
    memberOrgA.id,
    institution1.id,
    institution1.org2
  );

  if (wrongOrgMember !== null) {
    throw new Error('❌ FALHA: getById de member não validou organizationId!');
  }
  console.log('✅ SUCESSO: getById de member valida organizationId');

  console.log('✅ Todos os testes de isolamento de Team Members passaram!\n');
}

/**
 * Testes de Isolamento de Audit Logs
 */
export async function testAuditLogIsolation(): Promise<void> {
  console.log('🧪 Testando isolamento de Audit Logs...');

  const { institution1, institution2 } = TEST_CONFIG;

  // Criar alguns eventos de auditoria
  await auditService.log({
    eventType: AuditEventType.MEMBER_ADDED,
    severity: AuditSeverity.INFO,
    actorId: institution1.admin1,
    details: {
      description: 'Test audit log Org A',
      action: 'test'
    }
  }, institution1.id, institution1.org1);

  await auditService.log({
    eventType: AuditEventType.MEMBER_ADDED,
    severity: AuditSeverity.INFO,
    actorId: institution1.admin2,
    details: {
      description: 'Test audit log Org B',
      action: 'test'
    }
  }, institution1.id, institution1.org2);

  await auditService.log({
    eventType: AuditEventType.MEMBER_ADDED,
    severity: AuditSeverity.INFO,
    actorId: institution2.admin1,
    details: {
      description: 'Test audit log Inst 2',
      action: 'test'
    }
  }, institution2.id, institution2.org1);

  // TESTE 1: Org A não deve ver logs de Org B
  const orgALogs = await auditService.list({
    institutionId: institution1.id,
    organizationId: institution1.org1
  });

  const hasOrgBLog = orgALogs.some(log =>
    log.details.description?.includes('Org B')
  );

  if (hasOrgBLog) {
    throw new Error('❌ FALHA: Org A conseguiu ver audit logs de Org B!');
  }
  console.log('✅ SUCESSO: Org A não vê audit logs de Org B');

  // TESTE 2: Instituição 1 não deve ver logs de Instituição 2
  const inst1Logs = await auditService.list({
    institutionId: institution1.id
  });

  const hasInst2Log = inst1Logs.some(log =>
    log.details.description?.includes('Inst 2')
  );

  if (hasInst2Log) {
    throw new Error('❌ FALHA: Instituição 1 conseguiu ver audit logs de Instituição 2!');
  }
  console.log('✅ SUCESSO: Isolamento inter-institucional de audit logs funcionando');

  console.log('✅ Todos os testes de isolamento de Audit Logs passaram!\n');
}

/**
 * Testes de Transferência Inter-Org (DECISÃO: SEM aprovação)
 */
export async function testInterOrgTransfer(): Promise<void> {
  console.log('🧪 Testando transferências inter-organizacionais...');

  const { institution1 } = TEST_CONFIG;

  // Criar membro na Org A
  const member = await teamMemberService.addMember({
    teamId: institution1.team1,
    userId: institution1.user1,
    role: MemberRole.MEMBER,
    allowReassessment: true
  }, institution1.id, institution1.org1, institution1.admin1);

  // TESTE: Transferir de Org A para Org B (DECISÃO: Sem aprovação)
  const transferred = await teamMemberService.transferMember({
    memberId: member.id,
    toTeamId: institution1.team2,
    toOrganizationId: institution1.org2,
    reason: 'Teste de transferência inter-org',
    transferredBy: institution1.admin1,
    keepAssessment: true,
    requestReassessment: false
  }, institution1.id);

  // Validar que membro agora pertence à Org B
  if (transferred.organizationId !== institution1.org2) {
    throw new Error('❌ FALHA: Membro não foi transferido para Org B!');
  }
  console.log('✅ SUCESSO: Transferência inter-org realizada sem aprovação');

  // Validar que transferência está no histórico
  if (transferred.transferHistory.length === 0) {
    throw new Error('❌ FALHA: Histórico de transferência não foi registrado!');
  }
  console.log('✅ SUCESSO: Histórico de transferência registrado');

  // Validar que Org A não vê mais o membro
  const orgAMembers = await teamMemberService.list({
    institutionId: institution1.id,
    organizationId: institution1.org1
  });

  const stillInOrgA = orgAMembers.some(m => m.id === member.id);
  if (stillInOrgA) {
    throw new Error('❌ FALHA: Membro ainda aparece na Org A após transferência!');
  }
  console.log('✅ SUCESSO: Membro não aparece mais na org de origem');

  // Validar que Org B agora vê o membro
  const orgBMembers = await teamMemberService.list({
    institutionId: institution1.id,
    organizationId: institution1.org2
  });

  const nowInOrgB = orgBMembers.some(m => m.id === transferred.id);
  if (!nowInOrgB) {
    throw new Error('❌ FALHA: Membro não aparece na Org B após transferência!');
  }
  console.log('✅ SUCESSO: Membro aparece na org de destino');

  console.log('✅ Todos os testes de transferência inter-org passaram!\n');
}

/**
 * Teste de Soft Delete e Retenção
 */
export async function testSoftDeleteRetention(): Promise<void> {
  console.log('🧪 Testando soft delete e retenção de 1 ano...');

  const { institution1 } = TEST_CONFIG;

  // Criar e remover membro
  const member = await teamMemberService.addMember({
    teamId: institution1.team1,
    userId: institution1.user1,
    role: MemberRole.MEMBER
  }, institution1.id, institution1.org1, institution1.admin1);

  const removed = await teamMemberService.removeMember({
    memberId: member.id,
    reason: RemovalReason.RESIGNATION,
    details: 'Teste de soft delete',
    removedBy: institution1.admin1
  }, institution1.id, institution1.org1);

  // TESTE 1: Membro deve ter deletedAt e expiresAt
  if (!removed.deletedAt || !removed.expiresAt) {
    throw new Error('❌ FALHA: Soft delete não definiu deletedAt ou expiresAt!');
  }
  console.log('✅ SUCESSO: Soft delete define datas corretamente');

  // TESTE 2: expiresAt deve ser deletedAt + 365 dias
  const expectedExpiry = new Date(removed.deletedAt);
  expectedExpiry.setDate(expectedExpiry.getDate() + 365);

  const actualExpiry = new Date(removed.expiresAt);
  const daysDiff = Math.abs(
    (actualExpiry.getTime() - expectedExpiry.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysDiff > 1) {
    throw new Error('❌ FALHA: expiresAt não é deletedAt + 365 dias!');
  }
  console.log('✅ SUCESSO: Retenção de 1 ano (365 dias) configurada');

  // TESTE 3: Membro removido não deve aparecer em listagens padrão
  const activeMembers = await teamMemberService.list({
    institutionId: institution1.id,
    organizationId: institution1.org1,
    includeArchived: false
  });

  const foundRemoved = activeMembers.some(m => m.id === member.id);
  if (foundRemoved) {
    throw new Error('❌ FALHA: Membro removido aparece em listagem padrão!');
  }
  console.log('✅ SUCESSO: Membros removidos não aparecem em listagens padrão');

  // TESTE 4: Membro removido deve aparecer com includeArchived=true
  const allMembers = await teamMemberService.list({
    institutionId: institution1.id,
    organizationId: institution1.org1,
    includeArchived: true
  });

  const foundWithArchived = allMembers.some(m => m.id === member.id);
  if (!foundWithArchived) {
    throw new Error('❌ FALHA: Membro removido não aparece com includeArchived=true!');
  }
  console.log('✅ SUCESSO: Membros removidos aparecem com includeArchived=true');

  console.log('✅ Todos os testes de soft delete e retenção passaram!\n');
}

/**
 * Executar todos os testes
 */
export async function runAllTests(): Promise<void> {
  console.log('\n🚀 INICIANDO TESTES DE ISOLAMENTO MULTI-TENANT\n');
  console.log('═'.repeat(60) + '\n');

  try {
    await testAssessmentIsolation();
    await testTeamMemberIsolation();
    await testAuditLogIsolation();
    await testInterOrgTransfer();
    await testSoftDeleteRetention();

    console.log('═'.repeat(60));
    console.log('\n✅ TODOS OS TESTES PASSARAM! Multi-tenant isolation funcionando perfeitamente.\n');
    console.log('Decisões implementadas:');
    console.log('  ✅ Isolamento total entre organizações');
    console.log('  ✅ Isolamento total entre instituições');
    console.log('  ✅ Transferências inter-org sem aprovação');
    console.log('  ✅ Soft delete com retenção de 1 ano');
    console.log('  ✅ Histórico de transferências mantido');
    console.log('\n');

  } catch (error) {
    console.error('\n❌ ERRO NOS TESTES:');
    console.error(error);
    console.log('\n');
    throw error;
  }
}

// Exportar para uso em console/debug
if (typeof window !== 'undefined') {
  (window as any).runMultiTenantTests = runAllTests;
  console.log('💡 Para executar os testes, use: runMultiTenantTests()');
}
