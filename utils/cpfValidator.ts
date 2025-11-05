// 🆔 SISGEAD 2.0 - Enhanced CPF Validator
// Sistema robusto de validação CPF com integração institucional

export interface CPFValidationResult {
  isValid: boolean;
  formatted: string;
  errors: string[];
  warnings: string[];
  institutionalData?: {
    hasInstitutionalAccess: boolean;
    tenantId?: string;
    role?: string;
    permissions?: string[];
  };
}

export interface CPFValidationOptions {
  allowMasked: boolean;
  requireInstitutionalData: boolean;
  checkBlacklist: boolean;
  formatOutput: boolean;
}

export class EnhancedCPFValidator {
  private static instance: EnhancedCPFValidator;
  private institutionalDatabase: Map<string, any> = new Map();
  private blacklist: Set<string> = new Set();
  private validationCache: Map<string, CPFValidationResult> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  public static getInstance(): EnhancedCPFValidator {
    if (!EnhancedCPFValidator.instance) {
      EnhancedCPFValidator.instance = new EnhancedCPFValidator();
    }
    return EnhancedCPFValidator.instance;
  }

  private constructor() {
    this.initializeInstitutionalDatabase();
    this.initializeBlacklist();
  }

  /**
   * Validates a CPF with comprehensive checks
   */
  public validateCPF(
    cpf: string, 
    options: Partial<CPFValidationOptions> = {}
  ): CPFValidationResult {
    const config: CPFValidationOptions = {
      allowMasked: true,
      requireInstitutionalData: false,
      checkBlacklist: true,
      formatOutput: true,
      ...options
    };

    const result: CPFValidationResult = {
      isValid: false,
      formatted: '',
      errors: [],
      warnings: []
    };

    try {
      // 1. Input validation and sanitization
      const sanitized = this.sanitizeCPF(cpf);
      if (!sanitized) {
        result.errors.push('CPF não fornecido ou inválido');
        return result;
      }

      // 2. Check cache first
      const cacheKey = `${sanitized}_${JSON.stringify(config)}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      // 3. Format validation
      const formatValidation = this.validateFormat(sanitized, config.allowMasked);
      if (!formatValidation.isValid) {
        result.errors.push(...formatValidation.errors);
        return result;
      }

      const cleanCPF = formatValidation.cleanCPF;

      // 4. Length validation
      if (cleanCPF.length !== 11) {
        result.errors.push('CPF deve conter exatamente 11 dígitos');
        return result;
      }

      // 5. Known invalid patterns
      if (this.isKnownInvalidPattern(cleanCPF)) {
        result.errors.push('CPF com padrão inválido (sequência repetida)');
        return result;
      }

      // 6. Digit verification (Luhn-like algorithm for CPF)
      const digitValidation = this.validateDigits(cleanCPF);
      if (!digitValidation.isValid) {
        result.errors.push('Dígitos verificadores do CPF são inválidos');
        return result;
      }

      // 7. Blacklist check
      if (config.checkBlacklist && this.blacklist.has(cleanCPF)) {
        result.errors.push('CPF está na lista de bloqueados');
        return result;
      }

      // 8. Institutional data check
      if (config.requireInstitutionalData) {
        const institutionalData = this.getInstitutionalData(cleanCPF);
        if (!institutionalData) {
          result.warnings.push('CPF não encontrado na base institucional');
        } else {
          result.institutionalData = institutionalData;
        }
      }

      // 9. Success - CPF is valid
      result.isValid = true;
      result.formatted = config.formatOutput ? this.formatCPF(cleanCPF) : cleanCPF;

      // Add to cache
      this.addToCache(cacheKey, result);

      return result;

    } catch (error) {
      result.errors.push(`Erro na validação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      return result;
    }
  }

  /**
   * Validates CPF specifically for admin access
   */
  public validateAdminCPF(cpf: string, requiredRole?: string): CPFValidationResult {
    const result = this.validateCPF(cpf, {
      requireInstitutionalData: true,
      checkBlacklist: true,
      formatOutput: true
    });

    if (!result.isValid) {
      return result;
    }

    const institutional = result.institutionalData;
    if (!institutional?.hasInstitutionalAccess) {
      result.isValid = false;
      result.errors.push('CPF não possui acesso administrativo');
      return result;
    }

    if (requiredRole && institutional.role !== requiredRole && institutional.role !== 'super_admin') {
      result.isValid = false;
      result.errors.push(`Acesso negado. Função requerida: ${requiredRole}`);
      return result;
    }

    return result;
  }

  /**
   * Batch validation for multiple CPFs
   */
  public validateBatch(cpfs: string[], options?: Partial<CPFValidationOptions>): Map<string, CPFValidationResult> {
    const results = new Map<string, CPFValidationResult>();

    for (const cpf of cpfs) {
      results.set(cpf, this.validateCPF(cpf, options));
    }

    return results;
  }

  // 🔧 Private Helper Methods

  private sanitizeCPF(cpf: string): string | null {
    if (!cpf || typeof cpf !== 'string') {
      return null;
    }

    // Remove all non-numeric characters except dots and dashes
    return cpf.trim().replace(/[^\d.-]/g, '');
  }

  private validateFormat(cpf: string, allowMasked: boolean): { isValid: boolean; errors: string[]; cleanCPF: string } {
    const errors: string[] = [];
    
    // Check if it's masked format (XXX.XXX.XXX-XX)
    const maskedPattern = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    const unmaskedPattern = /^\d{11}$/;

    if (maskedPattern.test(cpf)) {
      if (!allowMasked) {
        errors.push('Formato mascarado não permitido');
        return { isValid: false, errors, cleanCPF: '' };
      }
      return { 
        isValid: true, 
        errors: [], 
        cleanCPF: cpf.replace(/[.-]/g, '') 
      };
    }

    if (unmaskedPattern.test(cpf)) {
      return { isValid: true, errors: [], cleanCPF: cpf };
    }

    errors.push('Formato de CPF inválido. Use XXX.XXX.XXX-XX ou apenas números');
    return { isValid: false, errors, cleanCPF: '' };
  }

  private isKnownInvalidPattern(cpf: string): boolean {
    // Check for repeated digits (like 11111111111)
    if (cpf.split('').every(digit => digit === cpf[0])) {
      return true;
    }

    // Known invalid CPFs
    const knownInvalid = [
      '12345678901',
      '11111111111',
      '22222222222',
      '33333333333',
      '44444444444',
      '55555555555',
      '66666666666',
      '77777777777',
      '88888888888',
      '99999999999',
      '00000000000'
    ];

    return knownInvalid.includes(cpf);
  }

  private validateDigits(cpf: string): { isValid: boolean } {
    // CPF digit validation algorithm
    const digits = cpf.split('').map(Number);
    
    // First verification digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += digits[i] * (10 - i);
    }
    let remainder = sum % 11;
    const firstDigit = remainder < 2 ? 0 : 11 - remainder;

    if (firstDigit !== digits[9]) {
      return { isValid: false };
    }

    // Second verification digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += digits[i] * (11 - i);
    }
    remainder = sum % 11;
    const secondDigit = remainder < 2 ? 0 : 11 - remainder;

    if (secondDigit !== digits[10]) {
      return { isValid: false };
    }

    return { isValid: true };
  }

  private formatCPF(cpf: string): string {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  // 🏢 Institutional Data Management

  private initializeInstitutionalDatabase(): void {
    // Load from localStorage or initialize with demo data
    const stored = localStorage.getItem('sisgead_institutional_cpf_db');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.institutionalDatabase = new Map(data);
      } catch (error) {
        console.warn('Error loading institutional CPF database:', error);
        this.createDemoInstitutionalData();
      }
    } else {
      this.createDemoInstitutionalData();
    }
  }

  private createDemoInstitutionalData(): void {
    // Demo admin users for testing
    const demoAdmins = [
      {
        cpf: '12345678901',
        hasInstitutionalAccess: true,
        tenantId: 'default',
        role: 'super_admin',
        permissions: ['*'],
        name: 'Admin Sistema',
        email: 'admin@sisgead.com'
      },
      {
        cpf: '11111111111', // Will be blocked by pattern validation
        hasInstitutionalAccess: false,
        tenantId: null,
        role: 'guest',
        permissions: []
      }
    ];

    for (const admin of demoAdmins) {
      this.institutionalDatabase.set(admin.cpf, admin);
    }

    this.persistInstitutionalDatabase();
  }

  private getInstitutionalData(cpf: string): any {
    return this.institutionalDatabase.get(cpf);
  }

  public addInstitutionalUser(cpf: string, userData: any): boolean {
    try {
      const validation = this.validateCPF(cpf, { formatOutput: false });
      if (!validation.isValid) {
        return false;
      }

      this.institutionalDatabase.set(validation.formatted.replace(/[.-]/g, ''), userData);
      this.persistInstitutionalDatabase();
      this.clearCache(); // Clear cache since data changed
      
      return true;
    } catch (error) {
      console.error('Error adding institutional user:', error);
      return false;
    }
  }

  public removeInstitutionalUser(cpf: string): boolean {
    try {
      const cleaned = cpf.replace(/[.-]/g, '');
      const success = this.institutionalDatabase.delete(cleaned);
      
      if (success) {
        this.persistInstitutionalDatabase();
        this.clearCache();
      }
      
      return success;
    } catch (error) {
      console.error('Error removing institutional user:', error);
      return false;
    }
  }

  private persistInstitutionalDatabase(): void {
    try {
      const data = Array.from(this.institutionalDatabase.entries());
      localStorage.setItem('sisgead_institutional_cpf_db', JSON.stringify(data));
    } catch (error) {
      console.error('Error persisting institutional database:', error);
    }
  }

  // 🚫 Blacklist Management

  private initializeBlacklist(): void {
    const stored = localStorage.getItem('sisgead_cpf_blacklist');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.blacklist = new Set(data);
      } catch (error) {
        console.warn('Error loading CPF blacklist:', error);
      }
    }
  }

  public addToBlacklist(cpf: string): boolean {
    try {
      const cleaned = cpf.replace(/[.-]/g, '');
      this.blacklist.add(cleaned);
      this.persistBlacklist();
      this.clearCache();
      return true;
    } catch (error) {
      console.error('Error adding to blacklist:', error);
      return false;
    }
  }

  public removeFromBlacklist(cpf: string): boolean {
    try {
      const cleaned = cpf.replace(/[.-]/g, '');
      const success = this.blacklist.delete(cleaned);
      
      if (success) {
        this.persistBlacklist();
        this.clearCache();
      }
      
      return success;
    } catch (error) {
      console.error('Error removing from blacklist:', error);
      return false;
    }
  }

  public isBlacklisted(cpf: string): boolean {
    const cleaned = cpf.replace(/[.-]/g, '');
    return this.blacklist.has(cleaned);
  }

  private persistBlacklist(): void {
    try {
      const data = Array.from(this.blacklist);
      localStorage.setItem('sisgead_cpf_blacklist', JSON.stringify(data));
    } catch (error) {
      console.error('Error persisting blacklist:', error);
    }
  }

  // 🧹 Cache Management

  private getFromCache(key: string): CPFValidationResult | null {
    const cached = this.validationCache.get(key);
    if (cached) {
      // Check if cache is still valid (simple timestamp check would be added here)
      return cached;
    }
    return null;
  }

  private addToCache(key: string, result: CPFValidationResult): void {
    // In a real implementation, you'd add timestamp and TTL logic
    this.validationCache.set(key, result);
    
    // Simple cache size limit
    if (this.validationCache.size > 1000) {
      const firstKey = this.validationCache.keys().next().value;
      this.validationCache.delete(firstKey);
    }
  }

  private clearCache(): void {
    this.validationCache.clear();
  }

  // 📊 Statistics & Health

  public getStatistics() {
    return {
      institutionalUsers: this.institutionalDatabase.size,
      blacklistedCPFs: this.blacklist.size,
      cacheSize: this.validationCache.size,
      cacheHitRate: 0, // Would be calculated with proper metrics
    };
  }

  public healthCheck(): { status: 'healthy' | 'warning' | 'error'; issues: string[] } {
    const issues: string[] = [];
    
    if (this.institutionalDatabase.size === 0) {
      issues.push('Nenhum usuário institucional cadastrado');
    }
    
    if (this.validationCache.size > 500) {
      issues.push('Cache de validação muito grande');
    }
    
    const status = issues.length === 0 ? 'healthy' : 
                   issues.length <= 1 ? 'warning' : 'error';
    
    return { status, issues };
  }

  // 🔧 Utility Methods

  public static formatCPFDisplay(cpf: string): string {
    const cleaned = cpf.replace(/[.-]/g, '');
    if (cleaned.length !== 11) return cpf;
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  public static cleanCPF(cpf: string): string {
    return cpf.replace(/[.-]/g, '');
  }

  public static maskCPF(cpf: string, showLast4: boolean = true): string {
    const cleaned = cpf.replace(/[.-]/g, '');
    if (cleaned.length !== 11) return cpf;
    
    if (showLast4) {
      return `***.***.**${cleaned.slice(-2)}`;
    } else {
      return '***.***.***-**';
    }
  }
}

// 🎯 Export singleton instance and utilities
export const cpfValidator = EnhancedCPFValidator.getInstance();
export const formatCPF = EnhancedCPFValidator.formatCPFDisplay;
export const cleanCPF = EnhancedCPFValidator.cleanCPF;
export const maskCPF = EnhancedCPFValidator.maskCPF;