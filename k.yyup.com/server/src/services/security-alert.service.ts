/**
 * 安全事件告警服务
 * 
 * 等保三级合规要求：
 * - 应对安全事件进行实时监测和告警
 * - 应记录安全事件的发生时间、类型、严重程度
 * - 应支持多种告警方式
 * 
 * 告警场景：
 * - 登录失败次数过多
 * - 异常IP访问
 * - 权限越权操作
 * - 敏感数据访问
 * - 系统异常
 */

import { secureAuditLogService, AuditLogLevel, AuditLogCategory } from './secure-audit-log.service';

/**
 * 安全事件类型
 */
export enum SecurityEventType {
  // 认证安全事件
  LOGIN_BRUTE_FORCE = 'login_brute_force',         // 暴力破解尝试
  ACCOUNT_LOCKED = 'account_locked',               // 账户被锁定
  MFA_BYPASS_ATTEMPT = 'mfa_bypass_attempt',       // MFA绕过尝试
  INVALID_TOKEN = 'invalid_token',                 // 无效令牌
  TOKEN_EXPIRED = 'token_expired',                 // 令牌过期
  SESSION_HIJACK_ATTEMPT = 'session_hijack_attempt', // 会话劫持尝试
  
  // 访问控制事件
  UNAUTHORIZED_ACCESS = 'unauthorized_access',     // 未授权访问
  PRIVILEGE_ESCALATION = 'privilege_escalation',   // 权限提升尝试
  IP_BLACKLISTED = 'ip_blacklisted',              // 黑名单IP访问
  IP_NOT_WHITELISTED = 'ip_not_whitelisted',      // 非白名单IP访问关键资源
  
  // 数据安全事件
  SENSITIVE_DATA_ACCESS = 'sensitive_data_access', // 敏感数据访问
  DATA_EXPORT_LARGE = 'data_export_large',         // 大量数据导出
  SQL_INJECTION_ATTEMPT = 'sql_injection_attempt', // SQL注入尝试
  XSS_ATTEMPT = 'xss_attempt',                     // XSS攻击尝试
  
  // 系统安全事件
  SYSTEM_ERROR = 'system_error',                   // 系统错误
  CONFIG_CHANGE = 'config_change',                 // 配置变更
  AUDIT_LOG_TAMPER = 'audit_log_tamper',          // 审计日志篡改
  KEY_ROTATION = 'key_rotation',                   // 密钥轮换
  
  // 运维安全事件
  ADMIN_LOGIN = 'admin_login',                     // 管理员登录
  AFTER_HOURS_ACCESS = 'after_hours_access',       // 非工作时间访问
  UNUSUAL_ACTIVITY = 'unusual_activity'            // 异常活动
}

/**
 * 告警级别
 */
export enum AlertLevel {
  INFO = 'info',         // 信息
  WARNING = 'warning',   // 警告
  CRITICAL = 'critical', // 严重
  EMERGENCY = 'emergency' // 紧急
}

/**
 * 告警通道
 */
export enum AlertChannel {
  LOG = 'log',           // 日志记录
  EMAIL = 'email',       // 邮件通知
  SMS = 'sms',           // 短信通知
  WEBHOOK = 'webhook',   // Webhook回调
  DING_TALK = 'dingtalk' // 钉钉通知
}

/**
 * 安全告警配置
 */
interface AlertConfig {
  enabled: boolean;
  channels: AlertChannel[];
  emailRecipients?: string[];
  smsRecipients?: string[];
  webhookUrl?: string;
  dingTalkWebhook?: string;
  // 告警阈值
  thresholds: {
    loginFailuresBeforeAlert: number;
    sensitiveDataAccessPerMinute: number;
    dataExportSizeLimit: number; // MB
  };
}

/**
 * 安全事件
 */
interface SecurityEvent {
  type: SecurityEventType;
  level: AlertLevel;
  message: string;
  timestamp: Date;
  userId?: number;
  username?: string;
  ipAddress?: string;
  userAgent?: string;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, any>;
}

/**
 * 默认配置
 */
const defaultConfig: AlertConfig = {
  enabled: process.env.SECURITY_ALERT_ENABLED !== 'false',
  channels: [AlertChannel.LOG],
  emailRecipients: (process.env.ALERT_EMAIL_RECIPIENTS || '').split(',').filter(e => e),
  smsRecipients: (process.env.ALERT_SMS_RECIPIENTS || '').split(',').filter(e => e),
  webhookUrl: process.env.ALERT_WEBHOOK_URL,
  dingTalkWebhook: process.env.ALERT_DINGTALK_WEBHOOK,
  thresholds: {
    loginFailuresBeforeAlert: parseInt(process.env.ALERT_LOGIN_FAILURES || '3', 10),
    sensitiveDataAccessPerMinute: parseInt(process.env.ALERT_SENSITIVE_ACCESS_RATE || '10', 10),
    dataExportSizeLimit: parseInt(process.env.ALERT_DATA_EXPORT_SIZE || '100', 10)
  }
};

/**
 * 安全事件告警服务
 */
export class SecurityAlertService {
  private static instance: SecurityAlertService;
  private config: AlertConfig;
  private loginFailureCache: Map<string, { count: number; lastFailure: Date }> = new Map();
  private sensitiveAccessCache: Map<string, number[]> = new Map(); // userId -> timestamps

  private constructor() {
    this.config = { ...defaultConfig };
    this.startCleanupTimer();
  }

  static getInstance(): SecurityAlertService {
    if (!SecurityAlertService.instance) {
      SecurityAlertService.instance = new SecurityAlertService();
    }
    return SecurityAlertService.instance;
  }

  /**
   * 启动缓存清理定时器
   */
  private startCleanupTimer(): void {
    // 每5分钟清理过期的缓存
    setInterval(() => {
      this.cleanupCache();
    }, 5 * 60 * 1000);
  }

  /**
   * 清理过期缓存
   */
  private cleanupCache(): void {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    // 清理登录失败缓存
    for (const [key, value] of this.loginFailureCache.entries()) {
      if (value.lastFailure.getTime() < oneHourAgo) {
        this.loginFailureCache.delete(key);
      }
    }

    // 清理敏感访问缓存
    for (const [key, timestamps] of this.sensitiveAccessCache.entries()) {
      const validTimestamps = timestamps.filter(t => t > oneHourAgo);
      if (validTimestamps.length === 0) {
        this.sensitiveAccessCache.delete(key);
      } else {
        this.sensitiveAccessCache.set(key, validTimestamps);
      }
    }
  }

  /**
   * 确定告警级别
   */
  private determineAlertLevel(eventType: SecurityEventType): AlertLevel {
    const levelMap: Partial<Record<SecurityEventType, AlertLevel>> = {
      [SecurityEventType.LOGIN_BRUTE_FORCE]: AlertLevel.CRITICAL,
      [SecurityEventType.ACCOUNT_LOCKED]: AlertLevel.WARNING,
      [SecurityEventType.MFA_BYPASS_ATTEMPT]: AlertLevel.EMERGENCY,
      [SecurityEventType.SESSION_HIJACK_ATTEMPT]: AlertLevel.EMERGENCY,
      [SecurityEventType.PRIVILEGE_ESCALATION]: AlertLevel.CRITICAL,
      [SecurityEventType.SQL_INJECTION_ATTEMPT]: AlertLevel.EMERGENCY,
      [SecurityEventType.XSS_ATTEMPT]: AlertLevel.CRITICAL,
      [SecurityEventType.AUDIT_LOG_TAMPER]: AlertLevel.EMERGENCY,
      [SecurityEventType.SYSTEM_ERROR]: AlertLevel.CRITICAL,
      [SecurityEventType.UNAUTHORIZED_ACCESS]: AlertLevel.WARNING,
      [SecurityEventType.IP_NOT_WHITELISTED]: AlertLevel.WARNING,
      [SecurityEventType.SENSITIVE_DATA_ACCESS]: AlertLevel.INFO,
      [SecurityEventType.ADMIN_LOGIN]: AlertLevel.INFO,
      [SecurityEventType.CONFIG_CHANGE]: AlertLevel.WARNING
    };

    return levelMap[eventType] || AlertLevel.INFO;
  }

  /**
   * 转换为审计日志级别
   */
  private toAuditLogLevel(level: AlertLevel): AuditLogLevel {
    const map: Record<AlertLevel, AuditLogLevel> = {
      [AlertLevel.INFO]: AuditLogLevel.INFO,
      [AlertLevel.WARNING]: AuditLogLevel.WARNING,
      [AlertLevel.CRITICAL]: AuditLogLevel.ERROR,
      [AlertLevel.EMERGENCY]: AuditLogLevel.CRITICAL
    };
    return map[level];
  }

  /**
   * 发送告警
   */
  async alert(event: Omit<SecurityEvent, 'timestamp' | 'level'>): Promise<void> {
    if (!this.config.enabled) return;

    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: new Date(),
      level: this.determineAlertLevel(event.type)
    };

    // 记录到审计日志
    await this.logToAuditLog(fullEvent);

    // 根据配置的通道发送告警
    for (const channel of this.config.channels) {
      try {
        await this.sendToChannel(channel, fullEvent);
      } catch (error) {
        console.error(`[安全告警] 发送到 ${channel} 失败:`, error);
      }
    }
  }

  /**
   * 记录到审计日志
   */
  private async logToAuditLog(event: SecurityEvent): Promise<void> {
    await secureAuditLogService.log(
      this.toAuditLogLevel(event.level),
      AuditLogCategory.SECURITY,
      `[安全告警] ${event.message}`,
      {
        userId: event.userId,
        username: event.username,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        resourceType: event.resourceType,
        resourceId: event.resourceId,
        details: {
          eventType: event.type,
          alertLevel: event.level,
          ...event.details
        }
      }
    );
  }

  /**
   * 发送到指定通道
   */
  private async sendToChannel(channel: AlertChannel, event: SecurityEvent): Promise<void> {
    switch (channel) {
      case AlertChannel.LOG:
        this.logAlert(event);
        break;
      case AlertChannel.WEBHOOK:
        await this.sendWebhook(event);
        break;
      case AlertChannel.DING_TALK:
        await this.sendDingTalk(event);
        break;
      case AlertChannel.EMAIL:
        await this.sendEmail(event);
        break;
      case AlertChannel.SMS:
        await this.sendSMS(event);
        break;
    }
  }

  /**
   * 控制台日志
   */
  private logAlert(event: SecurityEvent): void {
    const levelIcons: Record<AlertLevel, string> = {
      [AlertLevel.INFO]: 'ℹ️',
      [AlertLevel.WARNING]: '⚠️',
      [AlertLevel.CRITICAL]: '🔴',
      [AlertLevel.EMERGENCY]: '🚨'
    };

    const icon = levelIcons[event.level];
    console.log(`${icon} [安全告警] [${event.level.toUpperCase()}] ${event.message}`, {
      type: event.type,
      userId: event.userId,
      ipAddress: event.ipAddress,
      timestamp: event.timestamp.toISOString()
    });
  }

  /**
   * 发送 Webhook
   */
  private async sendWebhook(event: SecurityEvent): Promise<void> {
    if (!this.config.webhookUrl) return;

    try {
      const response = await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: event.type,
          level: event.level,
          message: event.message,
          timestamp: event.timestamp.toISOString(),
          details: {
            userId: event.userId,
            username: event.username,
            ipAddress: event.ipAddress,
            ...event.details
          }
        })
      });

      if (!response.ok) {
        console.error('[安全告警] Webhook发送失败:', response.status);
      }
    } catch (error) {
      console.error('[安全告警] Webhook发送异常:', error);
    }
  }

  /**
   * 发送钉钉通知
   */
  private async sendDingTalk(event: SecurityEvent): Promise<void> {
    if (!this.config.dingTalkWebhook) return;

    const levelText: Record<AlertLevel, string> = {
      [AlertLevel.INFO]: '信息',
      [AlertLevel.WARNING]: '警告',
      [AlertLevel.CRITICAL]: '严重',
      [AlertLevel.EMERGENCY]: '紧急'
    };

    try {
      await fetch(this.config.dingTalkWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          msgtype: 'markdown',
          markdown: {
            title: `安全告警 - ${levelText[event.level]}`,
            text: `### 🚨 安全告警\n\n` +
              `**级别**: ${levelText[event.level]}\n\n` +
              `**类型**: ${event.type}\n\n` +
              `**消息**: ${event.message}\n\n` +
              `**时间**: ${event.timestamp.toISOString()}\n\n` +
              `**IP**: ${event.ipAddress || '未知'}\n\n` +
              `**用户**: ${event.username || '未知'}`
          }
        })
      });
    } catch (error) {
      console.error('[安全告警] 钉钉通知发送失败:', error);
    }
  }

  /**
   * 发送邮件（需要配置邮件服务）
   */
  private async sendEmail(event: SecurityEvent): Promise<void> {
    // TODO: 集成邮件服务
    console.log('[安全告警] 邮件通知功能待实现');
  }

  /**
   * 发送短信（需要配置短信服务）
   */
  private async sendSMS(event: SecurityEvent): Promise<void> {
    // TODO: 集成短信服务
    console.log('[安全告警] 短信通知功能待实现');
  }

  // ========== 便捷方法 ==========

  /**
   * 记录登录失败
   */
  async recordLoginFailure(
    identifier: string, // 用户名或手机号
    ipAddress: string,
    userAgent?: string
  ): Promise<void> {
    const key = `${identifier}:${ipAddress}`;
    const existing = this.loginFailureCache.get(key) || { count: 0, lastFailure: new Date() };
    existing.count++;
    existing.lastFailure = new Date();
    this.loginFailureCache.set(key, existing);

    // 达到阈值时发送告警
    if (existing.count >= this.config.thresholds.loginFailuresBeforeAlert) {
      await this.alert({
        type: SecurityEventType.LOGIN_BRUTE_FORCE,
        message: `检测到可能的暴力破解攻击：${identifier} 在短时间内登录失败 ${existing.count} 次`,
        username: identifier,
        ipAddress,
        userAgent,
        details: {
          failureCount: existing.count,
          threshold: this.config.thresholds.loginFailuresBeforeAlert
        }
      });
    }
  }

  /**
   * 账户锁定告警
   */
  async alertAccountLocked(
    userId: number,
    username: string,
    ipAddress: string,
    reason: string
  ): Promise<void> {
    await this.alert({
      type: SecurityEventType.ACCOUNT_LOCKED,
      message: `账户 ${username} 已被锁定: ${reason}`,
      userId,
      username,
      ipAddress,
      details: { reason }
    });
  }

  /**
   * 未授权访问告警
   */
  async alertUnauthorizedAccess(
    userId: number | undefined,
    username: string | undefined,
    ipAddress: string,
    resource: string,
    action: string
  ): Promise<void> {
    await this.alert({
      type: SecurityEventType.UNAUTHORIZED_ACCESS,
      message: `未授权访问: ${username || '匿名用户'} 试图 ${action} ${resource}`,
      userId,
      username,
      ipAddress,
      resourceType: resource,
      details: { action }
    });
  }

  /**
   * 敏感数据访问告警
   */
  async alertSensitiveDataAccess(
    userId: number,
    username: string,
    ipAddress: string,
    dataType: string,
    dataId: string
  ): Promise<void> {
    // 记录访问
    const userKey = String(userId);
    const timestamps = this.sensitiveAccessCache.get(userKey) || [];
    timestamps.push(Date.now());
    this.sensitiveAccessCache.set(userKey, timestamps);

    // 检查是否超过阈值
    const oneMinuteAgo = Date.now() - 60 * 1000;
    const recentCount = timestamps.filter(t => t > oneMinuteAgo).length;

    if (recentCount >= this.config.thresholds.sensitiveDataAccessPerMinute) {
      await this.alert({
        type: SecurityEventType.SENSITIVE_DATA_ACCESS,
        message: `用户 ${username} 在1分钟内访问了 ${recentCount} 次敏感数据`,
        userId,
        username,
        ipAddress,
        resourceType: dataType,
        resourceId: dataId,
        details: {
          accessCount: recentCount,
          threshold: this.config.thresholds.sensitiveDataAccessPerMinute
        }
      });
    }
  }

  /**
   * IP未在白名单告警
   */
  async alertIPNotWhitelisted(
    ipAddress: string,
    resource: string,
    userAgent?: string
  ): Promise<void> {
    await this.alert({
      type: SecurityEventType.IP_NOT_WHITELISTED,
      message: `非白名单IP访问关键资源: ${ipAddress} -> ${resource}`,
      ipAddress,
      userAgent,
      resourceType: resource,
      details: { reason: 'IP not in whitelist' }
    });
  }

  /**
   * 系统错误告警
   */
  async alertSystemError(
    errorMessage: string,
    errorStack?: string,
    context?: Record<string, any>
  ): Promise<void> {
    await this.alert({
      type: SecurityEventType.SYSTEM_ERROR,
      message: `系统错误: ${errorMessage}`,
      details: {
        error: errorMessage,
        stack: errorStack,
        ...context
      }
    });
  }

  /**
   * 配置变更告警
   */
  async alertConfigChange(
    userId: number,
    username: string,
    configKey: string,
    oldValue: any,
    newValue: any,
    ipAddress?: string
  ): Promise<void> {
    await this.alert({
      type: SecurityEventType.CONFIG_CHANGE,
      message: `配置变更: ${username} 修改了 ${configKey}`,
      userId,
      username,
      ipAddress,
      resourceType: 'config',
      resourceId: configKey,
      details: {
        configKey,
        oldValue,
        newValue
      }
    });
  }

  /**
   * 管理员登录告警
   */
  async alertAdminLogin(
    userId: number,
    username: string,
    ipAddress: string,
    userAgent?: string
  ): Promise<void> {
    await this.alert({
      type: SecurityEventType.ADMIN_LOGIN,
      message: `管理员登录: ${username}`,
      userId,
      username,
      ipAddress,
      userAgent
    });
  }

  /**
   * 获取当前配置
   */
  getConfig(): AlertConfig {
    return { ...this.config };
  }

  /**
   * 更新配置
   */
  updateConfig(updates: Partial<AlertConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}

// 导出单例
export const securityAlertService = SecurityAlertService.getInstance();
export default securityAlertService;
