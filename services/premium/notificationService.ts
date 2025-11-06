/**
 * SISGEAD Premium 3.0 - Notification Service
 * Sistema de notificações multi-tenant
 */

import type { User } from '../../types/premium/user';

export enum NotificationType {
  ASSESSMENT_PENDING = 'assessment_pending',
  ASSESSMENT_APPROVED = 'assessment_approved',
  ASSESSMENT_REJECTED = 'assessment_rejected',
  MEMBER_ADDED = 'member_added',
  MEMBER_REMOVED = 'member_removed',
  MEMBER_TRANSFERRED = 'member_transferred',
  KPI_ALERT = 'kpi_alert'
}

export interface Notification {
  id: string;
  institutionId: string;
  organizationId: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
}

class NotificationService {
  private static instance: NotificationService;
  private readonly STORAGE_KEY = 'premium-notifications';

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async notify(
    userId: string,
    institutionId: string,
    organizationId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, any>
  ): Promise<Notification> {
    const notification: Notification = {
      id: crypto.randomUUID(),
      institutionId,
      organizationId,
      userId,
      type,
      title,
      message,
      data,
      isRead: false,
      createdAt: new Date()
    };

    const notifications = await this.loadAll();
    notifications.push(notification);
    await this.saveAll(notifications);

    console.log(`📧 Notificação enviada: ${title} para ${userId}`);
    return notification;
  }

  async getForUser(userId: string, institutionId: string): Promise<Notification[]> {
    const notifications = await this.loadAll();
    return notifications
      .filter(n => n.userId === userId && n.institutionId === institutionId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markAsRead(notificationId: string): Promise<void> {
    const notifications = await this.loadAll();
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      await this.saveAll(notifications);
    }
  }

  private async loadAll(): Promise<Notification[]> {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return parsed.map((n: any) => ({
      ...n,
      createdAt: new Date(n.createdAt)
    }));
  }

  private async saveAll(notifications: Notification[]): Promise<void> {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notifications));
  }
}

export const notificationService = NotificationService.getInstance();
