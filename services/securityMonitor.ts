// 🛡️ SISGEAD 2.0 - Security Monitor Service
// Sistema avançado de monitoramento de segurança e detecção de ameaças

import type { 
  SecureSession, 
  SecurityEvent, 
  ThreatAssessment, 
  ThreatFactor,
  SecurityRecommendation,
  MFAChallenge,
  MFADevice,
  IPAccessRule,
  AccessDecision,
  SecurityEventType,
  SecuritySettings
} from '../types/security';
import { auditService } from './auditService';

class SecurityMonitorService {
  private static instance: SecurityMonitorService;
  private securityEvents: SecurityEvent[] = [];
  private activeSessions: Map<string, SecureSession> = new Map();
  private ipRules: IPAccessRule[] = [];
  private mfaChallenges: Map<string, MFAChallenge> = new Map();
  private suspiciousIPs: Set<string> = new Set();
  private failedAttempts: Map<string, { count: number; lastAttempt: Date }> = new Map();

  private constructor() {
    this.initializeDefaults();
    this.startBackgroundTasks();
  }

  public static getInstance(): SecurityMonitorService {
    if (!SecurityMonitorService.instance) {
      SecurityMonitorService.instance = new SecurityMonitorService();
    }
    return SecurityMonitorService.instance;
  }

  // 🔍 Threat Detection
  public detectAnomalousActivity(
    userId: string, 
    action: string, 
    context: {
      ipAddress: string;
      userAgent: string;
      tenantId: string;
      timestamp?: Date;
      metadata?: Record<string, any>;
    }
  ): ThreatAssessment {
    const factors: ThreatFactor[] = [];
    let baseRisk = 0;

    // 📍 Geolocation Analysis
    const geoFactor = this.analyzeGeolocation(userId, context.ipAddress);
    if (geoFactor) {
      factors.push(geoFactor);
      baseRisk += geoFactor.value * geoFactor.weight;
    }

    // ⚡ Velocity Analysis  
    const velocityFactor = this.analyzeVelocity(userId, action, context.timestamp);
    if (velocityFactor) {
      factors.push(velocityFactor);
      baseRisk += velocityFactor.value * velocityFactor.weight;
    }

    // 🖥️ Device Fingerprint Analysis
    const deviceFactor = this.analyzeDeviceFingerprint(userId, context.userAgent);
    if (deviceFactor) {
      factors.push(deviceFactor);
      baseRisk += deviceFactor.value * deviceFactor.weight;
    }

    // 🕐 Time-based Analysis
    const timeFactor = this.analyzeTimePatterns(userId, context.timestamp);
    if (timeFactor) {
      factors.push(timeFactor);
      baseRisk += timeFactor.value * timeFactor.weight;
    }

    // 🎭 Behavioral Analysis
    const behaviorFactor = this.analyzeBehavioralPatterns(userId, action, context.metadata);
    if (behaviorFactor) {
      factors.push(behaviorFactor);
      baseRisk += behaviorFactor.value * behaviorFactor.weight;
    }

    // Calculate final risk score (0-100)
    const riskScore = Math.min(100, Math.max(0, baseRisk));
    
    const assessment: ThreatAssessment = {
      riskScore,
      level: this.getRiskLevel(riskScore),
      factors,
      recommendations: this.generateRecommendations(riskScore, factors, action),
      shouldBlock: riskScore > 80,
      shouldAlert: riskScore > 60
    };

    // Log security event
    this.logSecurityEvent({
      type: this.getEventTypeForAction(action),
      severity: assessment.level === 'critical' ? 'critical' : 
               assessment.level === 'high' ? 'error' : 
               assessment.level === 'medium' ? 'warning' : 'info',
      userId,
      tenantId: context.tenantId,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      description: `${action} performed with risk score ${riskScore}`,
      metadata: {
        riskScore,
        factors: factors.map(f => ({ type: f.type, value: f.value })),
        action,
        ...context.metadata
      }
    });

    return assessment;
  }

  // 🔐 Multi-Factor Authentication
  public async initiateMFA(
    userId: string, 
    tenantId: string,
    preferredMethod?: 'totp' | 'sms' | 'email'
  ): Promise<MFAChallenge> {
    const challengeId = this.generateSecureId();
    const method = preferredMethod || 'totp';
    
    const challenge: MFAChallenge = {
      id: challengeId,
      userId,
      tenantId,
      method,
      challenge: this.generateMFAChallenge(method),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      attemptsRemaining: 3,
      createdAt: new Date()
    };

    this.mfaChallenges.set(challengeId, challenge);

    // Send challenge to user based on method
    await this.deliverMFAChallenge(challenge);

    this.logSecurityEvent({
      type: 'mfa_challenge',
      severity: 'info',
      userId,
      tenantId,
      ipAddress: '',
      description: `MFA challenge initiated using ${method}`,
      metadata: { challengeId, method }
    });

    return challenge;
  }

  public validateMFA(challengeId: string, response: string): boolean {
    const challenge = this.mfaChallenges.get(challengeId);
    
    if (!challenge) {
      return false;
    }

    if (challenge.expiresAt < new Date()) {
      this.mfaChallenges.delete(challengeId);
      return false;
    }

    if (challenge.attemptsRemaining <= 0) {
      this.mfaChallenges.delete(challengeId);
      return false;
    }

    const isValid = this.verifyMFAResponse(challenge, response);
    
    if (isValid) {
      this.mfaChallenges.delete(challengeId);
      this.logSecurityEvent({
        type: 'mfa_success',
        severity: 'info',
        userId: challenge.userId,
        tenantId: challenge.tenantId,
        ipAddress: '',
        description: 'MFA validation successful',
        metadata: { challengeId, method: challenge.method }
      });
    } else {
      challenge.attemptsRemaining--;
      this.logSecurityEvent({
        type: 'mfa_failure',
        severity: 'warning',
        userId: challenge.userId,
        tenantId: challenge.tenantId,
        ipAddress: '',
        description: 'MFA validation failed',
        metadata: { 
          challengeId, 
          method: challenge.method,
          attemptsRemaining: challenge.attemptsRemaining
        }
      });
    }

    return isValid;
  }

  // 🔒 Session Security
  public createSecureSession(
    userId: string,
    tenantId: string,
    ipAddress: string,
    userAgent: string
  ): SecureSession {
    const sessionId = this.generateSecureId();
    
    const session: SecureSession = {
      id: sessionId,
      userId,
      tenantId,
      ipAddress,
      userAgent,
      location: this.getLocationFromIP(ipAddress),
      isActive: true,
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
      createdAt: new Date(),
      lastActivityAt: new Date(),
      riskScore: 0,
      securityFlags: []
    };

    // Calculate initial risk score
    const threatAssessment = this.detectAnomalousActivity(userId, 'session_create', {
      ipAddress,
      userAgent,
      tenantId
    });
    
    session.riskScore = threatAssessment.riskScore;
    session.securityFlags = this.generateSecurityFlags(threatAssessment);

    this.activeSessions.set(sessionId, session);

    this.logSecurityEvent({
      type: 'session_created',
      severity: session.riskScore > 50 ? 'warning' : 'info',
      userId,
      tenantId,
      sessionId,
      ipAddress,
      userAgent,
      description: 'Secure session created',
      metadata: { 
        sessionId, 
        riskScore: session.riskScore,
        location: session.location
      }
    });

    return session;
  }

  public validateSessionSecurity(sessionId: string): { valid: boolean; session?: SecureSession; reason?: string } {
    const session = this.activeSessions.get(sessionId);
    
    if (!session) {
      return { valid: false, reason: 'Session not found' };
    }

    if (!session.isActive) {
      return { valid: false, reason: 'Session is inactive' };
    }

    if (session.expiresAt < new Date()) {
      session.isActive = false;
      this.logSecurityEvent({
        type: 'session_expired',
        severity: 'info',
        userId: session.userId,
        tenantId: session.tenantId,
        sessionId,
        ipAddress: session.ipAddress,
        description: 'Session expired naturally',
        metadata: { sessionId }
      });
      return { valid: false, reason: 'Session expired' };
    }

    // Update last activity
    session.lastActivityAt = new Date();

    return { valid: true, session };
  }

  // 🌐 IP Access Control
  public validateIPAccess(ipAddress: string, tenantId: string): AccessDecision {
    const globalRules = this.ipRules.filter(rule => !rule.tenantId && rule.isActive);
    const tenantRules = this.ipRules.filter(rule => rule.tenantId === tenantId && rule.isActive);
    
    const allRules = [...tenantRules, ...globalRules];
    const riskFactors: string[] = [];
    
    // Check if IP is in suspicious list
    if (this.suspiciousIPs.has(ipAddress)) {
      riskFactors.push('IP marked as suspicious');
    }

    // Check failed attempts
    const failures = this.failedAttempts.get(ipAddress);
    if (failures && failures.count > 5) {
      riskFactors.push(`${failures.count} failed attempts from this IP`);
    }

    // Apply rules
    for (const rule of allRules) {
      if (this.matchesIPPattern(ipAddress, rule.ipPattern)) {
        const decision: AccessDecision = {
          allowed: rule.type === 'whitelist',
          reason: rule.description,
          matchedRule: rule,
          riskFactors,
          recommendations: this.generateIPRecommendations(rule, riskFactors)
        };
        
        this.logSecurityEvent({
          type: decision.allowed ? 'login_success' : 'login_failure',
          severity: decision.allowed ? 'info' : 'warning',
          tenantId,
          ipAddress,
          description: `IP access ${decision.allowed ? 'allowed' : 'denied'}: ${rule.description}`,
          metadata: { 
            ruleId: rule.id,
            ruleType: rule.type,
            riskFactors: riskFactors.length
          }
        });
        
        return decision;
      }
    }

    // Default allow if no rules match and no risk factors
    const defaultDecision: AccessDecision = {
      allowed: riskFactors.length === 0,
      reason: riskFactors.length > 0 ? 'Risk factors detected' : 'No matching rules, default allow',
      riskFactors,
      recommendations: riskFactors.length > 0 ? 
        [{ action: 'challenge_mfa', priority: 'medium', reason: 'Risk factors present', autoApply: true }] : 
        []
    };

    return defaultDecision;
  }

  // 📊 Security Events & Logging
  public logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp' | 'resolved'>): void {
    const securityEvent: SecurityEvent = {
      id: this.generateSecureId(),
      timestamp: new Date(),
      resolved: false,
      ...event
    };

    this.securityEvents.push(securityEvent);

    // Also log to audit service for compliance
    auditService.log({
      action: 'update' as any,
      resource: 'security',
      resourceId: event.type,
      category: 'security',
      severity: event.severity === 'critical' ? 'high' : 
              event.severity === 'error' ? 'medium' : 'low',
      metadata: {
        eventType: event.type,
        securityEvent: true,
        securityUserId: event.userId,
        securityDescription: event.description,
        ...event.metadata
      }
    });

    // Auto-resolve low severity info events
    if (event.severity === 'info') {
      securityEvent.resolved = true;
      securityEvent.resolvedAt = new Date();
    }

    // Trigger alerts for high severity events
    if (event.severity === 'critical' || event.severity === 'error') {
      this.triggerSecurityAlert(securityEvent);
    }
  }

  public getSecurityEvents(filters?: {
    tenantId?: string;
    userId?: string;
    type?: SecurityEventType;
    severity?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): SecurityEvent[] {
    let filtered = [...this.securityEvents];

    if (filters) {
      if (filters.tenantId) {
        filtered = filtered.filter(e => e.tenantId === filters.tenantId);
      }
      if (filters.userId) {
        filtered = filtered.filter(e => e.userId === filters.userId);
      }
      if (filters.type) {
        filtered = filtered.filter(e => e.type === filters.type);
      }
      if (filters.severity) {
        filtered = filtered.filter(e => e.severity === filters.severity);
      }
      if (filters.startDate) {
        filtered = filtered.filter(e => e.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        filtered = filtered.filter(e => e.timestamp <= filters.endDate!);
      }
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (filters?.limit) {
      filtered = filtered.slice(0, filters.limit);
    }

    return filtered;
  }

  // 🎯 Risk Analysis Helpers
  private analyzeGeolocation(userId: string, ipAddress: string): ThreatFactor | null {
    // Mock geolocation analysis - in real implementation, use GeoIP service
    const location = this.getLocationFromIP(ipAddress);
    
    if (!location) return null;

    // Check if location is unusual for this user
    const userSessions = Array.from(this.activeSessions.values())
      .filter(s => s.userId === userId);
    
    const usualCountries = new Set(
      userSessions
        .map(s => s.location?.country)
        .filter(Boolean)
    );

    if (usualCountries.size > 0 && !usualCountries.has(location.country)) {
      return {
        type: 'geolocation',
        weight: 0.3,
        description: `Login from unusual country: ${location.country}`,
        value: 25
      };
    }

    return null;
  }

  private analyzeVelocity(userId: string, action: string, timestamp: Date = new Date()): ThreatFactor | null {
    const recentEvents = this.securityEvents
      .filter(e => 
        e.userId === userId && 
        timestamp.getTime() - e.timestamp.getTime() < 60000 // Last minute
      );

    if (recentEvents.length > 10) {
      return {
        type: 'velocity',
        weight: 0.4,
        description: `High velocity: ${recentEvents.length} actions in 1 minute`,
        value: Math.min(50, recentEvents.length * 3)
      };
    }

    return null;
  }

  private analyzeDeviceFingerprint(userId: string, userAgent: string): ThreatFactor | null {
    const userSessions = Array.from(this.activeSessions.values())
      .filter(s => s.userId === userId);
    
    const knownUserAgents = new Set(userSessions.map(s => s.userAgent));
    
    if (knownUserAgents.size > 0 && !knownUserAgents.has(userAgent)) {
      return {
        type: 'device_fingerprint',
        weight: 0.2,
        description: 'Login from new device',
        value: 15
      };
    }

    return null;
  }

  private analyzeTimePatterns(userId: string, timestamp: Date = new Date()): ThreatFactor | null {
    const hour = timestamp.getHours();
    
    // Consider 2 AM - 6 AM as unusual hours
    if (hour >= 2 && hour <= 6) {
      return {
        type: 'time_based',
        weight: 0.1,
        description: `Login during unusual hours: ${hour}:00`,
        value: 10
      };
    }

    return null;
  }

  private analyzeBehavioralPatterns(userId: string, action: string, metadata?: Record<string, any>): ThreatFactor | null {
    // Mock behavioral analysis - in real implementation, use ML models
    const recentActions = this.securityEvents
      .filter(e => e.userId === userId && e.timestamp.getTime() > Date.now() - 24 * 60 * 60 * 1000)
      .map(e => e.type);

    // Detect unusual action patterns
    if (action === 'data_export' && recentActions.filter(a => a === 'data_export').length > 3) {
      return {
        type: 'behavioral',
        weight: 0.35,
        description: 'Multiple data exports detected',
        value: 30
      };
    }

    return null;
  }

  private getRiskLevel(score: number): 'safe' | 'low' | 'medium' | 'high' | 'critical' {
    if (score < 10) return 'safe';
    if (score < 25) return 'low';
    if (score < 50) return 'medium';
    if (score < 75) return 'high';
    return 'critical';
  }

  private generateRecommendations(score: number, factors: ThreatFactor[], action: string): SecurityRecommendation[] {
    const recommendations: SecurityRecommendation[] = [];

    if (score > 80) {
      recommendations.push({
        action: 'block_ip',
        priority: 'high',
        reason: 'Critical risk score detected',
        autoApply: true
      });
    } else if (score > 50) {
      recommendations.push({
        action: 'challenge_mfa',
        priority: 'medium',
        reason: 'Elevated risk requires additional verification',
        autoApply: true
      });
    }

    if (factors.some(f => f.type === 'geolocation')) {
      recommendations.push({
        action: 'alert_admin',
        priority: 'medium',
        reason: 'Login from unusual location',
        autoApply: false
      });
    }

    if (factors.some(f => f.type === 'velocity')) {
      recommendations.push({
        action: 'force_logout',
        priority: 'high',
        reason: 'High velocity attack pattern detected',
        autoApply: false
      });
    }

    return recommendations;
  }

  // 🔧 Utility Methods
  private generateSecureId(): string {
    return 'sec_' + Math.random().toString(36).substr(2, 16) + Date.now().toString(36);
  }

  private generateMFAChallenge(method: 'totp' | 'sms' | 'email'): string {
    if (method === 'totp') {
      return Math.random().toString(36).substr(2, 32); // TOTP secret
    }
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
  }

  private async deliverMFAChallenge(challenge: MFAChallenge): Promise<void> {
    // Mock delivery - in real implementation, integrate with SMS/Email services
    console.log(`MFA Challenge delivered via ${challenge.method}: ${challenge.challenge}`);
  }

  private verifyMFAResponse(challenge: MFAChallenge, response: string): boolean {
    // Mock verification - in real implementation, verify TOTP or compare codes
    return response === challenge.challenge || response === '123456'; // Mock valid code
  }

  private getLocationFromIP(ipAddress: string): { country: string; region: string; city: string } | undefined {
    // Mock geolocation - in real implementation, use MaxMind GeoIP2 or similar
    if (ipAddress.startsWith('192.168.') || ipAddress.startsWith('127.')) {
      return { country: 'Brasil', region: 'São Paulo', city: 'São Paulo' };
    }
    return { country: 'Brasil', region: 'Rio de Janeiro', city: 'Rio de Janeiro' };
  }

  private matchesIPPattern(ip: string, pattern: string): boolean {
    // Simple CIDR matching - in real implementation, use proper CIDR library
    if (pattern.includes('/')) {
      const [network, bits] = pattern.split('/');
      // Simplified CIDR matching
      return ip.startsWith(network.split('.').slice(0, Math.floor(parseInt(bits) / 8)).join('.'));
    }
    return ip === pattern;
  }

  private generateSecurityFlags(assessment: ThreatAssessment) {
    return assessment.factors.map(factor => ({
      type: factor.type as any,
      severity: assessment.level === 'critical' ? 'high' : assessment.level === 'high' ? 'medium' : 'low' as any,
      description: factor.description,
      detectedAt: new Date()
    }));
  }

  private generateIPRecommendations(rule: IPAccessRule, riskFactors: string[]): SecurityRecommendation[] {
    const recommendations: SecurityRecommendation[] = [];
    
    if (rule.type === 'blacklist') {
      recommendations.push({
        action: 'block_ip',
        priority: 'high',
        reason: 'IP matches blacklist rule',
        autoApply: true
      });
    }

    if (riskFactors.length > 0) {
      recommendations.push({
        action: 'challenge_mfa',
        priority: 'medium',
        reason: 'Risk factors detected for this IP',
        autoApply: true
      });
    }

    return recommendations;
  }

  private getEventTypeForAction(action: string): SecurityEventType {
    const actionMap: Record<string, SecurityEventType> = {
      'login': 'login_success',
      'logout': 'session_expired',
      'session_create': 'session_created',
      'data_export': 'data_export',
      'config_change': 'configuration_change',
      'privilege_change': 'privilege_escalation'
    };
    
    return actionMap[action] || 'suspicious_activity';
  }

  private triggerSecurityAlert(event: SecurityEvent): void {
    // Mock alert system - in real implementation, integrate with notification services
    console.warn(`🚨 SECURITY ALERT: ${event.type} - ${event.description}`, event);
  }

  private initializeDefaults(): void {
    // Add some default IP rules
    this.ipRules.push({
      id: 'default-localhost',
      ipPattern: '127.0.0.1',
      type: 'whitelist',
      description: 'Localhost access',
      isActive: true,
      createdAt: new Date(),
      createdBy: 'system'
    });

    this.ipRules.push({
      id: 'default-private-networks',
      ipPattern: '192.168.0.0/16',
      type: 'whitelist',
      description: 'Private network access',
      isActive: true,
      createdAt: new Date(),
      createdBy: 'system'
    });
  }

  private startBackgroundTasks(): void {
    // Clean expired sessions every 30 minutes
    setInterval(() => {
      const now = new Date();
      for (const [sessionId, session] of this.activeSessions.entries()) {
        if (session.expiresAt < now && session.isActive) {
          session.isActive = false;
          this.logSecurityEvent({
            type: 'session_expired',
            severity: 'info',
            userId: session.userId,
            tenantId: session.tenantId,
            sessionId,
            ipAddress: session.ipAddress,
            description: 'Session expired (background cleanup)',
            metadata: { sessionId, cleanupType: 'background' }
          });
        }
      }
    }, 30 * 60 * 1000);

    // Clean old security events every hour (keep last 30 days)
    setInterval(() => {
      const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      this.securityEvents = this.securityEvents.filter(e => e.timestamp > cutoff);
    }, 60 * 60 * 1000);

    // Reset failed attempt counters every hour
    setInterval(() => {
      this.failedAttempts.clear();
    }, 60 * 60 * 1000);
  }
}

export const securityMonitor = SecurityMonitorService.getInstance();