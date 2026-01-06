/**
 * 用户模型扩展类型声明
 *
 * 添加双因素认证（2FA）相关字段类型
 */

declare module '../models/user' {
  interface User {
    two_fa_enabled?: boolean;
    two_fa_secret?: string;
    two_fa_backup_codes?: string;
    two_fa_enabled_at?: Date;
  }
}

export {};
