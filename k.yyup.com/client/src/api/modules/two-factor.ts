/**
 * 双因素认证（2FA）API客户端
 */

import { request } from '@/utils/request';

export interface TwoFactorSetupResponse {
  qrCode: string;
  backupCodes: string[];
  verificationToken: string;
  instructions: string[];
  authenticators: Array<{ name: string; url: string }>;
}

export interface TwoFactorStatusResponse {
  enabled: boolean;
  enabledAt: string | null;
  remainingBackupCodes: number;
}

export interface TwoFactorVerifyRequest {
  token: string;
  secret: string;
  backupCodes: string[];
  verificationToken: string;
}

/**
 * 2FA API客户端
 */
export const twoFactorApi = {
  /**
   * 初始化2FA设置
   */
  setup(): Promise<{ success: boolean; data: TwoFactorSetupResponse }> {
    return request.post('/api/auth/2fa/setup');
  },

  /**
   * 验证并启用2FA
   */
  verifyAndEnable(data: TwoFactorVerifyRequest): Promise<{ success: boolean; message: string; data?: any }> {
    return request.post('/api/auth/2fa/verify', data);
  },

  /**
   * 禁用2FA
   */
  disable(password: string, token?: string): Promise<{ success: boolean; message: string }> {
    return request.post('/api/auth/2fa/disable', { password, token });
  },

  /**
   * 登录时验证2FA
   */
  verifyLogin(userId: number, token: string, useBackupCode = false): Promise<{ success: boolean; data?: any }> {
    return request.post('/api/auth/2fa/verify-login', { userId, token, useBackupCode });
  },

  /**
   * 获取2FA状态
   */
  getStatus(): Promise<{ success: boolean; data: TwoFactorStatusResponse }> {
    return request.get('/api/auth/2fa/status');
  },

  /**
   * 获取支持的验证器APP
   */
  getAuthenticators(): Promise<{ success: boolean; data: any }> {
    return request.get('/api/auth/2fa/authenticators');
  }
};

export default twoFactorApi;
