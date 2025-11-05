/**
 * SISGEAD Premium 3.0 - Institution Service
 * Gerencia CRUD de instituições
 */

import {
  Institution,
  CreateInstitutionData,
  UpdateInstitutionData,
  DEFAULT_INSTITUTION_SETTINGS,
  INITIAL_INSTITUTION_STATS,
  InstitutionType
} from '../../types/premium';
import { authService } from './authService';

/**
 * InstitutionService - CRUD de instituições
 */
class InstitutionService {
  private static instance: InstitutionService;
  private readonly STORAGE_KEY = 'premium-institutions';

  private constructor() {}

  /**
   * Singleton instance
   */
  public static getInstance(): InstitutionService {
    if (!InstitutionService.instance) {
      InstitutionService.instance = new InstitutionService();
    }
    return InstitutionService.instance;
  }

  /**
   * Cria nova instituição
   */
  public async create(data: CreateInstitutionData): Promise<Institution> {
    try {
      console.log('🏢 InstitutionService - Criando instituição:', data);
      
      // Validar dados
      if (!data.name || !data.contact?.email) {
        console.error('❌ Dados obrigatórios faltando:', { name: data.name, email: data.contact?.email });
        throw new Error('Dados obrigatórios faltando');
      }

      // Gerar slug único
      const slug = this.generateSlug(data.name);
      console.log('📝 Slug gerado:', slug);

      // Verificar se slug já existe
      const exists = await this.slugExists(slug);
      if (exists) {
        console.error('❌ Slug já existe:', slug);
        throw new Error('Já existe uma instituição com este nome');
      }

      // Criar instituição
      const institution: Institution = {
        id: this.generateId(),
        name: data.name,
        slug,
        cnpj: data.cnpj,
        type: data.type,
        description: data.description,
        address: data.address,
        contact: data.contact,
        settings: {
          ...DEFAULT_INSTITUTION_SETTINGS,
          ...data.settings
        },
        stats: INITIAL_INSTITUTION_STATS,
        isActive: true,
        createdAt: new Date().toISOString(),
        createdBy: data.createdBy
      };

      console.log('💾 Salvando instituição:', institution);

      // Salvar
      await this.save(institution);

      console.log('✅ Instituição criada com sucesso!');
      return institution;
    } catch (error) {
      console.error('❌ Erro ao criar instituição:', error);
      throw error;
    }
  }

  /**
   * Obtém instituição por ID
   */
  public async getById(id: string): Promise<Institution | null> {
    const institutions = await this.loadAll();
    return institutions[id] || null;
  }

  /**
   * Obtém instituição por slug
   */
  public async getBySlug(slug: string): Promise<Institution | null> {
    const institutions = await this.loadAll();
    return Object.values(institutions).find(i => i.slug === slug) || null;
  }

  /**
   * Atualiza instituição
   */
  public async update(
    id: string,
    data: UpdateInstitutionData
  ): Promise<{
    success: boolean;
    institution?: Institution;
    error?: string;
  }> {
    try {
      const institution = await this.getById(id);
      if (!institution) {
        return { success: false, error: 'Instituição não encontrada' };
      }

      // Atualizar campos
      const updated: Institution = {
        ...institution,
        ...data,
        address: data.address ? { ...institution.address, ...data.address } : institution.address,
        contact: data.contact ? { ...institution.contact, ...data.contact } : institution.contact,
        settings: data.settings ? { ...institution.settings, ...data.settings } : institution.settings,
        updatedAt: new Date().toISOString(),
        updatedBy: data.updatedBy
      };

      // Se nome mudou, atualizar slug
      if (data.name && data.name !== institution.name) {
        updated.slug = this.generateSlug(data.name);
      }

      await this.save(updated);

      return { success: true, institution: updated };
    } catch (error) {
      console.error('Erro ao atualizar instituição:', error);
      return { success: false, error: 'Erro ao atualizar instituição' };
    }
  }

  /**
   * Atualiza estatísticas da instituição
   */
  public async updateStats(id: string): Promise<void> {
    const institution = await this.getById(id);
    if (!institution) return;

    // Calcular estatísticas
    const organizations = await this.countOrganizations(id);
    const users = await this.countUsers(id);
    const assessments = await this.countAssessments(id);

    institution.stats = {
      ...institution.stats,
      totalOrganizations: organizations,
      totalActiveUsers: users.active,
      totalInactiveUsers: users.inactive,
      totalAssessments: assessments.total,
      totalCompletedAssessments: assessments.completed,
      completionRate: assessments.total > 0 
        ? (assessments.completed / assessments.total) * 100 
        : 0,
      lastUpdated: new Date().toISOString()
    };

    await this.save(institution);
  }

  /**
   * Salva instituição no storage
   */
  private async save(institution: Institution): Promise<void> {
    const institutions = await this.loadAll();
    institutions[institution.id] = institution;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(institutions));
  }

  /**
   * Carrega todas as instituições
   */
  private async loadAll(): Promise<Record<string, Institution>> {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  }

  /**
   * Gera ID único
   */
  private generateId(): string {
    return `inst_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Gera slug a partir do nome
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9]+/g, '-') // Substitui não-alfanuméricos por -
      .replace(/^-+|-+$/g, ''); // Remove - do início e fim
  }

  /**
   * Verifica se slug já existe
   */
  private async slugExists(slug: string): Promise<boolean> {
    const institution = await this.getBySlug(slug);
    return institution !== null;
  }

  /**
   * Conta organizações da instituição
   */
  private async countOrganizations(institutionId: string): Promise<number> {
    const data = localStorage.getItem('premium-organizations');
    if (!data) return 0;

    const organizations = JSON.parse(data);
    return Object.values(organizations).filter(
      (org: any) => org.institutionId === institutionId
    ).length;
  }

  /**
   * Conta usuários da instituição
   */
  private async countUsers(institutionId: string): Promise<{
    active: number;
    inactive: number;
  }> {
    const data = localStorage.getItem('premium-users');
    if (!data) return { active: 0, inactive: 0 };

    const users = JSON.parse(data);
    const institutionUsers = Object.values(users).filter(
      (user: any) => user.institutionId === institutionId
    );

    return {
      active: institutionUsers.filter((u: any) => u.isActive).length,
      inactive: institutionUsers.filter((u: any) => !u.isActive).length
    };
  }

  /**
   * Conta avaliações da instituição
   */
  private async countAssessments(institutionId: string): Promise<{
    total: number;
    completed: number;
  }> {
    // Por ora, retorna 0 - será implementado quando integrarmos com avaliações existentes
    return { total: 0, completed: 0 };
  }
}

// Export singleton instance
export const institutionService = InstitutionService.getInstance();
