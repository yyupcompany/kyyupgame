/**
 * 双因素认证（2FA）服务
 *
 * 实现TOTP（基于时间的一次性密码）双因素认证：
 * - 生成TOTP密钥
 * - 生成二维码（用于绑定验证器APP）
 * - 验证TOTP码
 * - 生成备用恢复码
 * - 加密存储敏感信息
 */

import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import crypto from 'crypto';
import { encryptField, decryptField } from '../utils/encryption.util';

/**
 * TOTP密钥信息
 */
export interface TOTPSecret {
  base32: string;          // Base32编码的密钥
  otpauthUrl: string;      // OTPAuth URL（用于生成二维码）
  qrCode: string;          // 二维码图片（Data URL）
}

/**
 * 备用恢复码
 */
export type BackupCodes = string[];

/**
 * 2FA设置信息
 */
export interface TwoFactorSetup {
  secret: TOTPSecret;
  backupCodes: BackupCodes;
  verificationToken: string;  // 临时验证令牌
}

/**
 * 2FA验证结果
 */
export interface TwoFactorVerifyResult {
  success: boolean;
  message: string;
  userId?: number;
}

/**
 * 双因素认证服务
 */
export class TwoFactorService {
  private readonly issuer: string = 'k.yyup.cc';
  private readonly algorithm: string = 'sha256';
  private readonly digits: number = 6;
  private readonly period: number = 30; // 30秒周期
  private readonly window: number = 2;  // 允许±2个周期的时间偏差
  private readonly backupCodeCount: number = 10; // 备用码数量

  /**
   * 生成新的TOTP密钥
   */
  generateSecret(username: string): TOTPSecret {
    const secret = speakeasy.generateSecret({
      name: `${this.issuer} (${username})`,
      issuer: this.issuer,
      length: 32,
      algorithm: this.algorithm as any
    });

    return {
      base32: secret.base32,
      otpauthUrl: secret.otpauth_url,
      qrCode: ''  // 稍后生成
    };
  }

  /**
   * 生成二维码（异步）
   */
  async generateQRCode(otpauthUrl: string): Promise<string> {
    try {
      return await qrcode.toDataURL(otpauthUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (error) {
      console.error('生成二维码失败:', error.message);
      throw new Error('生成二维码失败');
    }
  }

  /**
   * 生成完整的2FA设置信息
   */
  async generateSetup(username: string): Promise<TwoFactorSetup> {
    // 生成TOTP密钥
    const secretInfo = this.generateSecret(username);

    // 生成二维码
    secretInfo.qrCode = await this.generateQRCode(secretInfo.otpauthUrl);

    // 生成备用恢复码
    const backupCodes = this.generateBackupCodes();

    // 生成临时验证令牌（用于确认设置成功）
    const verificationToken = crypto.randomBytes(32).toString('hex');

    return {
      secret: secretInfo,
      backupCodes,
      verificationToken
    };
  }

  /**
   * 验证TOTP码
   */
  verifyToken(secretBase32: string, token: string): boolean {
    try {
      return speakeasy.totp.verify({
        secret: secretBase32,
        encoding: 'base32',
        token,
        algorithm: this.algorithm as any,
        digits: this.digits,
        period: this.period,
        window: this.window
      });
    } catch (error) {
      console.error('验证TOTP失败:', error.message);
      return false;
    }
  }

  /**
   * 验证备用恢复码
   */
  verifyBackupCode(storedCodes: string, providedCode: string): boolean {
    try {
      const codes: BackupCodes = JSON.parse(decryptField(storedCodes) || '[]');
      return codes.includes(providedCode);
    } catch (error) {
      console.error('验证备用码失败:', error.message);
      return false;
    }
  }

  /**
   * 使用并移除备用恢复码
   */
  async useBackupCode(storedCodes: string, providedCode: string): Promise<string> {
    try {
      const codes: BackupCodes = JSON.parse(decryptField(storedCodes) || '[]');
      const index = codes.indexOf(providedCode);

      if (index === -1) {
        throw new Error('无效的备用恢复码');
      }

      // 移除已使用的备用码
      codes.splice(index, 1);

      // 重新加密并返回
      return encryptField(JSON.stringify(codes));
    } catch (error) {
      console.error('使用备用码失败:', error.message);
      throw error;
    }
  }

  /**
   * 生成备用恢复码
   */
  generateBackupCodes(): BackupCodes {
    const codes: string[] = [];

    for (let i = 0; i < this.backupCodeCount; i++) {
      // 生成8位字母数字混合码（易读易记）
      const code = crypto.randomBytes(4).toString('base64')
        .replace(/[^a-zA-Z0-9]/g, '')
        .substring(0, 8)
        .toUpperCase();

      codes.push(code);
    }

    return codes;
  }

  /**
   * 加密并存储TOTP密钥
   */
  encryptSecret(secretBase32: string): string {
    return encryptField(secretBase32);
  }

  /**
   * 解密TOTP密钥
   */
  decryptSecret(encryptedSecret: string): string | null {
    return decryptField(encryptedSecret);
  }

  /**
   * 加密并存储备用恢复码
   */
  encryptBackupCodes(backupCodes: BackupCodes): string {
    return encryptField(JSON.stringify(backupCodes));
  }

  /**
   * 格式化备用恢复码（用于显示）
   */
  formatBackupCodes(backupCodes: BackupCodes): string[] {
    return backupCodes.map((code, index) => {
      // 格式：XXXX-XXXX（每4位一组）
      return `${code.substring(0, 4)}-${code.substring(4)}`;
    });
  }

  /**
   * 获取支持的验证器APP列表
   */
  getSupportedAuthenticators(): Array<{ name: string; url: string }> {
    return [
      {
        name: 'Google Authenticator',
        url: 'https://apps.apple.com/app/google-authenticator/id388497605'
      },
      {
        name: 'Microsoft Authenticator',
        url: 'https://apps.apple.com/app/microsoft-authenticator/id983156458'
      },
      {
        name: 'Authy',
        url: 'https://apps.apple.com/app/authy/id494652078'
      },
      {
        name: 'LastPass Authenticator',
        url: 'https://apps.apple.com/app/lastpass-authenticator/id735906825'
      },
      {
        name: '1Password',
        url: 'https://apps.apple.com/app/1password-password-manager/id568903335'
      }
    ];
  }

  /**
   * 获取使用说明
   */
  getSetupInstructions(): string[] {
    return [
      '1. 下载并安装验证器APP（推荐 Google Authenticator 或 Authy）',
      '2. 在验证器APP中扫描下方二维码',
      '3. 输入验证器APP显示的6位数字验证码',
      '4. 验证成功后，请妥善保存备用恢复码',
      '5. 备用恢复码用于手机丢失或无法使用验证器时登录',
      '6. 每个备用恢复码只能使用一次'
    ];
  }

  /**
   * 验证设置流程（三步验证）
   */
  async verifySetup(
    secretBase32: string,
    token: string,
    backupCodes: BackupCodes
  ): Promise<{ success: boolean; message: string }> {
    // 步骤1: 验证TOTP码
    const isValidToken = this.verifyToken(secretBase32, token);
    if (!isValidToken) {
      return {
        success: false,
        message: '验证码错误，请重试'
      };
    }

    // 步骤2: 验证备用码格式
    if (!Array.isArray(backupCodes) || backupCodes.length !== this.backupCodeCount) {
      return {
        success: false,
        message: '备用恢复码格式错误'
      };
    }

    // 步骤3: 验证备用码唯一性
    const uniqueCodes = new Set(backupCodes);
    if (uniqueCodes.size !== backupCodes.length) {
      return {
        success: false,
        message: '备用恢复码存在重复'
      };
    }

    return {
      success: true,
      message: '双因素认证设置成功'
    };
  }

  /**
   * 获取当前时间窗口
   */
  getCurrentTimeWindow(): number {
    return Math.floor(Date.now() / 1000 / this.period);
  }

  /**
   * 计算剩余时间（秒）
   */
  getRemainingSeconds(): number {
    const currentTime = Math.floor(Date.now() / 1000);
    return this.period - (currentTime % this.period);
  }
}

/**
 * 导出单例实例
 */
export const twoFactorService = new TwoFactorService();

/**
 * 导出配置
 */
export default {
  TwoFactorService,
  twoFactorService
};
