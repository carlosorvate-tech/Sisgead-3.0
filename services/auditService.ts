// 📊 SISGEAD 2.0 - Basic Audit Service
// Sistema de auditoria e logging para compliance multi-tenant

import type { 
  AuditLog, 
  AuditAction, 
  AuditCategory,
  InstitutionalUser 
} from '../types/institutional';
import { tenantManager } from './tenantManager';
import { tenantStorage } from '../utils/tenantStorage';

export interface AuditEvent {
  action: AuditAction;
  resource: string;
  resourceId?: string;
  oldValue?: any;
  newValue?: any;
  metadata?: Record<string, any>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  category?: AuditCategory;
}

export interface AuditQueryOptions {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  action?: AuditAction;
  category?: AuditCategory;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  resource?: string;
  limit?: number;
  offset?: number;
}

export interface AuditStatistics {
  totalLogs: number;
  logsByAction: Record<AuditAction, number>;
  logsByCategory: Record<AuditCategory, number>;
  logsBySeverity: Record<string, number>;
  recentActivity: AuditLog[];
  topUsers: Array<{ userId: string; count: number; name?: string }>;
  criticalAlerts: AuditLog[];
}

export class AuditService {
  private static instance: AuditService;
  private auditBuffer: AuditLog[] = [];
  private bufferSize = 100;
  private flushInterval = 30000; // 30 seconds
  private flushTimer: NodeJS.Timeout | null = null;
  
  public static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  private constructor() {
    this.startFlushTimer();
    this.setupStorageListener();
  }

  // 📝 Core Logging Methods

  /**
   * Log an audit event
   */
  public log(event: AuditEvent): string {
    try {
      const currentTenant = tenantManager.getCurrentTenant();
      const currentUser = this.getCurrentUser();
      
      const auditLog: AuditLog = {
        id: this.generateAuditId(),
        tenantId: currentTenant?.id || 'default',
        userId: currentUser?.id || 'anonymous',
        action: event.action,
        resource: event.resource,
        resourceId: event.resourceId,
        timestamp: new Date(),
        ipAddress: this.getClientIP(),
        userAgent: this.getUserAgent(),
        oldValue: event.oldValue,
        newValue: event.newValue,
        metadata: {
          tenantName: currentTenant?.displayName,
          userName: currentUser?.name,
          ...event.metadata
        },
        severity: event.severity || this.calculateSeverity(event.action, event.category),
        category: event.category || this.categorizeAction(event.action)
      };

      // Add to buffer for batch processing
      this.auditBuffer.push(auditLog);
      
      // Flush immediately for critical events
      if (auditLog.severity === 'critical') {
        this.flushBuffer();
      }

      // Auto-flush if buffer is full
      if (this.auditBuffer.length >= this.bufferSize) {
        this.flushBuffer();
      }

      return auditLog.id;
    } catch (error) {
      console.error('Error logging audit event:', error);
      return '';
    }
  }

  /**
   * Log authentication events
   */
  public logAuth(action: 'login' | 'logout' | 'login_failed', metadata?: Record<string, any>): string {
    return this.log({
      action,
      resource: 'authentication',
      category: 'authentication',
      severity: action === 'login_failed' ? 'medium' : 'low',
      metadata: {
        timestamp: new Date().toISOString(),
        ...metadata
      }
    });
  }

  /**
   * Log data access events
   */
  public logDataAccess(
    action: 'read' | 'create' | 'update' | 'delete',
    resource: string,
    resourceId?: string,
    oldValue?: any,
    newValue?: any
  ): string {
    return this.log({
      action,
      resource,
      resourceId,
      oldValue,
      newValue,
      category: 'data_access',
      severity: action === 'delete' ? 'high' : action === 'read' ? 'low' : 'medium'
    });
  }

  /**
   * Log configuration changes
   */
  public logConfigChange(
    resource: string,
    oldValue: any,
    newValue: any,
    metadata?: Record<string, any>
  ): string {
    return this.log({
      action: 'update',
      resource,
      oldValue,
      newValue,
      category: 'configuration',
      severity: 'high',
      metadata
    });
  }

  /**
   * Log security events
   */
  public logSecurity(
    action: AuditAction,
    description: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'high'
  ): string {
    return this.log({
      action,
      resource: 'security',
      category: 'security',
      severity,
      metadata: {
        description,
        timestamp: new Date().toISOString()
      }
    });
  }

  // 🔍 Query & Retrieval Methods

  /**
   * Query audit logs with filters
   */
  public async queryLogs(options: AuditQueryOptions = {}): Promise<AuditLog[]> {
    try {
      // Ensure buffer is flushed before querying
      this.flushBuffer();
      
      const currentTenantId = tenantManager.getCurrentTenant()?.id || 'default';
      const allLogs = this.getAllStoredLogs(currentTenantId);
      
      let filteredLogs = allLogs;

      // Apply filters
      if (options.startDate) {
        filteredLogs = filteredLogs.filter(log => 
          new Date(log.timestamp) >= options.startDate!
        );
      }

      if (options.endDate) {
        filteredLogs = filteredLogs.filter(log => 
          new Date(log.timestamp) <= options.endDate!
        );
      }

      if (options.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === options.userId);
      }

      if (options.action) {
        filteredLogs = filteredLogs.filter(log => log.action === options.action);
      }

      if (options.category) {
        filteredLogs = filteredLogs.filter(log => log.category === options.category);
      }

      if (options.severity) {
        filteredLogs = filteredLogs.filter(log => log.severity === options.severity);
      }

      if (options.resource) {
        filteredLogs = filteredLogs.filter(log => 
          log.resource.toLowerCase().includes(options.resource!.toLowerCase())
        );
      }

      // Sort by timestamp (newest first)
      filteredLogs.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // Apply pagination
      const offset = options.offset || 0;
      const limit = options.limit || 100;
      
      return filteredLogs.slice(offset, offset + limit);
    } catch (error) {
      console.error('Error querying audit logs:', error);
      return [];
    }
  }

  /**
   * Get recent audit activity
   */
  public async getRecentActivity(limit: number = 20): Promise<AuditLog[]> {
    return this.queryLogs({ 
      limit,
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
    });
  }

  /**
   * Get critical alerts
   */
  public async getCriticalAlerts(limit: number = 10): Promise<AuditLog[]> {
    return this.queryLogs({ 
      severity: 'critical',
      limit,
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
    });
  }

  // 📊 Analytics & Statistics

  /**
   * Generate audit statistics
   */
  public async generateStatistics(days: number = 30): Promise<AuditStatistics> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const logs = await this.queryLogs({ startDate, limit: 10000 });

    const stats: AuditStatistics = {
      totalLogs: logs.length,
      logsByAction: {} as Record<AuditAction, number>,
      logsByCategory: {} as Record<AuditCategory, number>,
      logsBySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
      recentActivity: await this.getRecentActivity(10),
      topUsers: [],
      criticalAlerts: await this.getCriticalAlerts(5)
    };

    // Count by action
    logs.forEach(log => {
      stats.logsByAction[log.action] = (stats.logsByAction[log.action] || 0) + 1;
      stats.logsByCategory[log.category] = (stats.logsByCategory[log.category] || 0) + 1;
      stats.logsBySeverity[log.severity] = (stats.logsBySeverity[log.severity] || 0) + 1;
    });

    // Calculate top users
    const userCounts = new Map<string, number>();
    logs.forEach(log => {
      userCounts.set(log.userId, (userCounts.get(log.userId) || 0) + 1);
    });

    stats.topUsers = Array.from(userCounts.entries())
      .map(([userId, count]) => ({
        userId,
        count,
        name: logs.find(log => log.userId === userId)?.metadata?.userName || 'Unknown'
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return stats;
  }

  // 🧹 Maintenance & Cleanup

  /**
   * Clean up old audit logs
   */
  public async cleanupOldLogs(retentionDays: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
      const currentTenantId = tenantManager.getCurrentTenant()?.id || 'default';
      const allLogs = this.getAllStoredLogs(currentTenantId);
      
      const logsToKeep = allLogs.filter(log => 
        new Date(log.timestamp) >= cutoffDate
      );
      
      const removedCount = allLogs.length - logsToKeep.length;
      
      // Store cleaned logs
      tenantStorage.setItem('audit_logs', logsToKeep);
      
      this.log({
        action: 'system_access',
        resource: 'audit_logs',
        category: 'system',
        severity: 'low',
        metadata: {
          operation: 'cleanup',
          removedCount,
          retentionDays
        }
      });

      return removedCount;
    } catch (error) {
      console.error('Error cleaning up audit logs:', error);
      return 0;
    }
  }

  /**
   * Export audit logs
   */
  public async exportLogs(
    options: AuditQueryOptions = {},
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    try {
      const logs = await this.queryLogs({ ...options, limit: 50000 });
      
      if (format === 'csv') {
        return this.convertToCSV(logs);
      }
      
      return JSON.stringify(logs, null, 2);
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      return '';
    }
  }

  // 🔧 Private Helper Methods

  private flushBuffer(): void {
    if (this.auditBuffer.length === 0) return;

    try {
      const currentTenantId = tenantManager.getCurrentTenant()?.id || 'default';
      const existingLogs = this.getAllStoredLogs(currentTenantId);
      
      const updatedLogs = [...existingLogs, ...this.auditBuffer];
      
      // Keep only recent logs in memory (last 1000)
      const logsToStore = updatedLogs
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 1000);
      
      tenantStorage.setItem('audit_logs', logsToStore);
      
      this.auditBuffer = [];
    } catch (error) {
      console.error('Error flushing audit buffer:', error);
    }
  }

  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    this.flushTimer = setInterval(() => {
      this.flushBuffer();
    }, this.flushInterval);
  }

  private setupStorageListener(): void {
    window.addEventListener('beforeunload', () => {
      this.flushBuffer();
    });

    window.addEventListener('tenantChanged', () => {
      this.flushBuffer();
    });
  }

  private generateAuditId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentUser(): InstitutionalUser | null {
    // Get current user from existing system or tenant manager
    const userData = localStorage.getItem('sisgead_user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return {
          id: user.id || user.cpf || 'anonymous',
          tenantId: tenantManager.getCurrentTenant()?.id || 'default',
          cpf: user.cpf || '',
          name: user.name || 'Unknown User',
          email: user.email || '',
          role: user.isAdmin ? 'tenant_admin' : 'evaluator',
          permissions: [],
          isActive: true,
          createdAt: new Date()
        };
      } catch (error) {
        console.warn('Error parsing user data for audit:', error);
      }
    }
    return null;
  }

  private getClientIP(): string {
    // In a real application, this would get the actual client IP
    // For now, return a placeholder
    return '127.0.0.1';
  }

  private getUserAgent(): string {
    return navigator.userAgent;
  }

  private calculateSeverity(action: AuditAction, category?: AuditCategory): 'low' | 'medium' | 'high' | 'critical' {
    if (category === 'security') return 'high';
    if (action === 'delete') return 'high';
    if (action === 'login_failed') return 'medium';
    if (action === 'create' || action === 'update') return 'medium';
    return 'low';
  }

  private categorizeAction(action: AuditAction): AuditCategory {
    if (['login', 'logout', 'login_failed'].includes(action)) return 'authentication';
    if (['create', 'read', 'update', 'delete'].includes(action)) return 'data_access';
    if (action === 'permission_change' || action === 'config_change') return 'configuration';
    if (action === 'system_access' || action === 'data_breach_attempt') return 'security';
    return 'system';
  }

  private getAllStoredLogs(tenantId: string): AuditLog[] {
    try {
      return tenantStorage.getItem('audit_logs', false, []) || [];
    } catch (error) {
      console.error('Error retrieving stored audit logs:', error);
      return [];
    }
  }

  private convertToCSV(logs: AuditLog[]): string {
    if (logs.length === 0) return '';

    const headers = [
      'ID', 'Tenant ID', 'User ID', 'Action', 'Resource', 'Resource ID',
      'Timestamp', 'IP Address', 'Severity', 'Category', 'Description'
    ];

    const rows = logs.map(log => [
      log.id,
      log.tenantId,
      log.userId,
      log.action,
      log.resource,
      log.resourceId || '',
      log.timestamp.toISOString(),
      log.ipAddress || '',
      log.severity,
      log.category,
      log.metadata?.description || ''
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
  }

  // 📊 Public Statistics & Health Methods

  public getServiceStatistics() {
    return {
      bufferSize: this.auditBuffer.length,
      maxBufferSize: this.bufferSize,
      flushIntervalMs: this.flushInterval,
      isTimerActive: this.flushTimer !== null
    };
  }

  public healthCheck(): { status: 'healthy' | 'warning' | 'error'; issues: string[] } {
    const issues: string[] = [];
    
    if (this.auditBuffer.length >= this.bufferSize * 0.8) {
      issues.push('Buffer de auditoria próximo do limite');
    }
    
    if (!this.flushTimer) {
      issues.push('Timer de flush não está ativo');
    }
    
    const status = issues.length === 0 ? 'healthy' : 
                   issues.length <= 1 ? 'warning' : 'error';
    
    return { status, issues };
  }

  // 🧹 Cleanup method for component unmounting
  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flushBuffer();
  }
}

// 🎯 Export singleton instance
export const auditService = AuditService.getInstance();