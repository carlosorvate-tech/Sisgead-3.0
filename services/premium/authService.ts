/**
 * SISGEAD Premium 3.0 - Authentication Service
 * Gerencia autenticação, sessões e controle de acesso multi-tenant
 */

import {
  User,
  Institution,
  Organization,
  AuthSession,
  AuthResult,
  LoginCredentials,
  PasswordChangeData,
  Version,
  CreateUserData,
  UserRole,
  DEFAULT_PRIVILEGES
} from '../../types/premium';
import { tenantManager } from './tenantManager';

/**
 * AuthService - Gerencia autenticação e sessões
 */
class AuthService {
  private static instance: AuthService;
  private currentSession: AuthSession | null = null;
  private readonly SESSION_KEY = 'sisgead-premium-session';
  private readonly VERSION_KEY = 'sisgead-version';

  private constructor() {
    // Tenta restaurar sessão ao inicializar
    this.restoreSession();
  }

  /**
   * Singleton instance
   */
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Realiza login do usuário
   */
  public async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      // 1. Validar credenciais
      const user = await this.validateCredentials(
        credentials.cpf,
        credentials.password
      );

      if (!user) {
        return {
          success: false,
          error: 'CPF ou senha inválidos'
        };
      }

      // 2. Verificar se usuário está ativo
      if (!user.isActive) {
        return {
          success: false,
          error: 'Usuário inativo. Contate o administrador.'
        };
      }

      // 3. Verificar se conta está bloqueada
      if (user.security.isLocked) {
        return {
          success: false,
          error: 'Conta bloqueada devido a múltiplas tentativas de login. Contate o administrador.'
        };
      }

      // 4. Verificar se requer alteração de senha
      if (user.security.requirePasswordChange) {
        return {
          success: false,
          requiresPasswordChange: true,
          error: 'É necessário alterar sua senha antes de continuar'
        };
      }

      // 5. Verificar 2FA se habilitado
      if (user.security.twoFactorEnabled) {
        return {
          success: false,
          requires2FA: true,
          error: 'Autenticação de dois fatores necessária'
        };
      }

      // 6. Carregar contexto institucional
      const institution = await this.loadInstitution(user.institutionId);
      if (!institution) {
        return {
          success: false,
          error: 'Instituição não encontrada'
        };
      }

      const organizations = await this.loadOrganizations(user.organizationIds);

      // 7. Criar sessão
      const session: AuthSession = {
        user,
        institution,
        organizations,
        token: this.generateToken(user),
        expiresAt: Date.now() + (8 * 60 * 60 * 1000), // 8 horas
        createdAt: new Date().toISOString()
      };

      // 8. Salvar sessão
      this.currentSession = session;
      this.saveSession(session);

      // 9. Configurar contexto do tenant
      tenantManager.setContext({
        institutionId: user.institutionId,
        organizationIds: user.organizationIds,
        userId: user.id,
        userRole: user.role,
        privileges: user.privileges
      });

      // 10. Atualizar última atividade
      await this.updateLastActivity(user.id);

      // 11. Resetar tentativas de login falhadas
      await this.resetFailedAttempts(user.id);

      return {
        success: true,
        session
      };
    } catch (error) {
      console.error('Erro no login:', error);
      return {
        success: false,
        error: 'Erro ao realizar login. Tente novamente.'
      };
    }
  }

  /**
   * Realiza logout do usuário
   */
  public logout(): void {
    // Limpar sessão
    this.currentSession = null;
    localStorage.removeItem(this.SESSION_KEY);
    
    // Limpar contexto do tenant
    tenantManager.clearContext();
  }

  /**
   * Verifica se há sessão ativa
   */
  public isAuthenticated(): boolean {
    if (!this.currentSession) {
      return false;
    }

    // Verificar se sessão expirou
    if (Date.now() > this.currentSession.expiresAt) {
      this.logout();
      return false;
    }

    return true;
  }

  /**
   * Obtém sessão atual
   */
  public getCurrentSession(): AuthSession | null {
    return this.currentSession;
  }

  /**
   * Obtém usuário atual
   */
  public getCurrentUser(): User | null {
    return this.currentSession?.user || null;
  }

  /**
   * Obtém instituição atual
   */
  public getCurrentInstitution(): Institution | null {
    return this.currentSession?.institution || null;
  }

  /**
   * Valida credenciais do usuário
   */
  private async validateCredentials(
    cpf: string,
    password: string
  ): Promise<User | null> {
    // Carregar usuários do storage
    const users = await this.loadUsers();
    
    // Buscar usuário por CPF (sem formatação)
    const user = users.find(u => u.profile.cpf === cpf);
    
    if (!user) {
      return null;
    }

    // Validar senha (simulado - em produção usar bcrypt)
    const isPasswordValid = await this.validatePassword(
      password,
      user.security.passwordHash
    );

    if (!isPasswordValid) {
      // Incrementar tentativas falhadas
      await this.incrementFailedAttempts(user.id);
      return null;
    }

    return user;
  }

  /**
   * Valida senha (simulado)
   */
  private async validatePassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    // Em produção, usar bcrypt.compare(password, hash)
    // Por ora, comparação simples para desenvolvimento
    return password === hash;
  }

  /**
   * Carrega instituição
   */
  private async loadInstitution(
    institutionId: string
  ): Promise<Institution | null> {
    const institutionsData = localStorage.getItem('premium-institutions');
    if (!institutionsData) {
      return null;
    }

    const institutions = JSON.parse(institutionsData);
    return institutions[institutionId] || null;
  }

  /**
   * Carrega organizações do usuário
   */
  private async loadOrganizations(
    organizationIds: string[]
  ): Promise<Organization[]> {
    const organizationsData = localStorage.getItem('premium-organizations');
    if (!organizationsData) {
      return [];
    }

    const organizations = JSON.parse(organizationsData);
    return organizationIds
      .map(id => organizations[id])
      .filter(org => org !== undefined);
  }

  /**
   * Carrega todos os usuários
   */
  private async loadUsers(): Promise<User[]> {
    const usersData = localStorage.getItem('premium-users');
    if (!usersData) {
      return [];
    }

    const users = JSON.parse(usersData);
    return Object.values(users);
  }

  /**
   * Gera token de sessão
   */
  private generateToken(user: User): string {
    // Em produção, usar JWT
    // Por ora, token simples
    return `${user.id}_${Date.now()}_${Math.random().toString(36)}`;
  }

  /**
   * Salva sessão no localStorage
   */
  private saveSession(session: AuthSession): void {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
  }

  /**
   * Restaura sessão do localStorage
   */
  private restoreSession(): void {
    const sessionData = localStorage.getItem(this.SESSION_KEY);
    if (!sessionData) {
      return;
    }

    try {
      const session: AuthSession = JSON.parse(sessionData);
      
      // Verificar se expirou
      if (Date.now() > session.expiresAt) {
        localStorage.removeItem(this.SESSION_KEY);
        return;
      }

      this.currentSession = session;
      
      // Restaurar contexto do tenant
      tenantManager.setContext({
        institutionId: session.user.institutionId,
        organizationIds: session.user.organizationIds,
        userId: session.user.id,
        userRole: session.user.role,
        privileges: session.user.privileges
      });
    } catch (error) {
      console.error('Erro ao restaurar sessão:', error);
      localStorage.removeItem(this.SESSION_KEY);
    }
  }

  /**
   * Atualiza última atividade do usuário
   */
  private async updateLastActivity(userId: string): Promise<void> {
    const usersData = localStorage.getItem('premium-users');
    if (!usersData) return;

    const users = JSON.parse(usersData);
    if (users[userId]) {
      users[userId].lastActivityAt = new Date().toISOString();
      localStorage.setItem('premium-users', JSON.stringify(users));
    }
  }

  /**
   * Incrementa tentativas de login falhadas
   */
  private async incrementFailedAttempts(userId: string): Promise<void> {
    const usersData = localStorage.getItem('premium-users');
    if (!usersData) return;

    const users = JSON.parse(usersData);
    if (users[userId]) {
      users[userId].security.failedLoginAttempts += 1;
      
      // Bloquear após 5 tentativas
      if (users[userId].security.failedLoginAttempts >= 5) {
        users[userId].security.isLocked = true;
        users[userId].security.lastLockoutDate = new Date().toISOString();
      }
      
      localStorage.setItem('premium-users', JSON.stringify(users));
    }
  }

  /**
   * Reseta tentativas de login falhadas
   */
  private async resetFailedAttempts(userId: string): Promise<void> {
    const usersData = localStorage.getItem('premium-users');
    if (!usersData) return;

    const users = JSON.parse(usersData);
    if (users[userId]) {
      users[userId].security.failedLoginAttempts = 0;
      localStorage.setItem('premium-users', JSON.stringify(users));
    }
  }

  /**
   * Altera senha do usuário
   */
  public async changePassword(data: PasswordChangeData): Promise<{
    success: boolean;
    error?: string;
  }> {
    const usersData = localStorage.getItem('premium-users');
    if (!usersData) {
      return { success: false, error: 'Usuários não encontrados' };
    }

    const users = JSON.parse(usersData);
    const user = users[data.userId];

    if (!user) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    // Validar senha atual
    const isCurrentPasswordValid = await this.validatePassword(
      data.currentPassword,
      user.security.passwordHash
    );

    if (!isCurrentPasswordValid) {
      return { success: false, error: 'Senha atual incorreta' };
    }

    // Validar nova senha
    if (data.newPassword !== data.confirmPassword) {
      return { success: false, error: 'As senhas não coincidem' };
    }

    if (data.newPassword.length < 8) {
      return { success: false, error: 'A senha deve ter no mínimo 8 caracteres' };
    }

    // Atualizar senha
    user.security.passwordHash = data.newPassword; // Em produção: bcrypt.hash
    user.security.lastPasswordChange = new Date().toISOString();
    user.security.requirePasswordChange = false;

    localStorage.setItem('premium-users', JSON.stringify(users));

    return { success: true };
  }

  /**
   * Verifica preferência de versão
   */
  public getVersionPreference(): Version {
    const version = localStorage.getItem(this.VERSION_KEY);
    return (version === 'premium' ? 'premium' : 'standard') as Version;
  }

  /**
   * Define preferência de versão
   */
  public setVersionPreference(version: Version): void {
    localStorage.setItem(this.VERSION_KEY, version);
  }

  /**
   * Verifica se é primeiro acesso (precisa configurar Premium)
   */
  public isFirstTimeSetup(): boolean {
    const institutions = localStorage.getItem('premium-institutions');
    return !institutions || institutions === '{}' || institutions === '[]';
  }

  /**
   * Cria usuário master inicial
   */
  public async createMasterUser(data: CreateUserData): Promise<{
    success: boolean;
    user?: User;
    error?: string;
  }> {
    try {
      // Validar dados
      if (!data.profile.cpf || !data.profile.email || !data.password) {
        return { success: false, error: 'Dados incompletos' };
      }

      // Verificar se CPF já existe
      const users = await this.loadUsers();
      const cpfExists = users.some(u => u.profile.cpf === data.profile.cpf);
      
      if (cpfExists) {
        return { success: false, error: 'CPF já cadastrado' };
      }

      // Criar usuário
      const user: User = {
        id: this.generateUserId(),
        institutionId: data.institutionId,
        organizationIds: data.organizationIds,
        profile: data.profile,
        role: UserRole.MASTER,
        privileges: DEFAULT_PRIVILEGES[UserRole.MASTER],
        security: {
          passwordHash: data.password, // Em produção: bcrypt.hash
          lastPasswordChange: new Date().toISOString(),
          requirePasswordChange: false,
          twoFactorEnabled: false,
          failedLoginAttempts: 0,
          isLocked: false
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        createdBy: 'system'
      };

      // Salvar usuário
      const usersData = localStorage.getItem('premium-users');
      const users_obj = usersData ? JSON.parse(usersData) : {};
      users_obj[user.id] = user;
      localStorage.setItem('premium-users', JSON.stringify(users_obj));

      return { success: true, user };
    } catch (error) {
      console.error('Erro ao criar usuário master:', error);
      return { success: false, error: 'Erro ao criar usuário' };
    }
  }

  /**
   * Atualiza o institutionId de um usuário
   * Usado após criar a instituição no wizard para vincular o master user
   */
  public async updateUserInstitution(userId: string, institutionId: string): Promise<boolean> {
    try {
      const usersData = localStorage.getItem('premium-users');
      if (!usersData) return false;

      const users = JSON.parse(usersData);
      if (!users[userId]) return false;

      users[userId].institutionId = institutionId;
      localStorage.setItem('premium-users', JSON.stringify(users));
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar instituição do usuário:', error);
      return false;
    }
  }

  /**
   * Gera ID único para usuário
   */
  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
