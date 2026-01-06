/**
 * 短信服务相关类型定义
 * 用于阿里云短信SDK集成和验证码功能
 */

// ==================== 枚举类型 ====================

/**
 * 验证码类型枚举
 */
export enum VerificationCodeType {
  /** 注册 */
  REGISTER = 'register',
  /** 登录 */
  LOGIN = 'login',
  /** 找回密码 */
  RESET_PASSWORD = 'reset_password',
  /** 绑定手机号 */
  BIND_PHONE = 'bind_phone',
  /** 拼团注册 */
  GROUP_BUY_REGISTER = 'group_buy_register',
  /** 活动报名 */
  ACTIVITY_REGISTRATION = 'activity_registration',
  /** 支付验证 */
  PAYMENT_VERIFY = 'payment_verify',
}

/**
 * 短信发送状态枚举
 */
export enum SmsStatus {
  /** 发送成功 */
  SUCCESS = 'success',
  /** 发送失败 */
  FAILED = 'failed',
  /** 待发送 */
  PENDING = 'pending',
  /** 已送达 */
  DELIVERED = 'delivered',
}

// ==================== 配置类型 ====================

/**
 * 阿里云短信配置
 */
export interface AliyunSmsConfig {
  /** AccessKey ID */
  accessKeyId: string;
  /** AccessKey Secret */
  accessKeySecret: string;
  /** 签名名称 */
  signName: string;
  /** 模板CODE */
  templateCode: string;
  /** 区域（默认cn-hangzhou） */
  regionId?: string;
  /** 端点（可选） */
  endpoint?: string;
}

/**
 * 验证码配置
 */
export interface VerificationCodeConfig {
  /** 验证码长度（默认6位） */
  length?: number;
  /** 有效期（秒，默认300秒=5分钟） */
  expiresIn?: number;
  /** 重发间隔（秒，默认60秒） */
  resendInterval?: number;
  /** 每日发送上限（默认10次） */
  dailyLimit?: number;
  /** 是否仅数字（默认true） */
  onlyDigits?: boolean;
}

// ==================== 请求类型 ====================

/**
 * 发送验证码请求参数
 */
export interface SendVerificationCodeDto {
  /** 手机号 */
  phone: string;
  /** 验证码类型 */
  type: VerificationCodeType;
  /** 场景描述（可选） */
  scene?: string;
  /** IP地址（用于限流） */
  ip?: string;
}

/**
 * 验证验证码请求参数
 */
export interface VerifyCodeDto {
  /** 手机号 */
  phone: string;
  /** 验证码 */
  code: string;
  /** 验证码类型 */
  type: VerificationCodeType;
  /** 验证后是否自动失效（默认true） */
  autoExpire?: boolean;
}

/**
 * 验证码注册请求参数
 */
export interface RegisterByCodeDto {
  /** 姓名 */
  name: string;
  /** 手机号 */
  phone: string;
  /** 验证码 */
  verificationCode: string;
  /** 来源（如：group_buy） */
  source?: string;
  /** 关联ID（如：团购ID） */
  referenceId?: number;
  /** 邀请码 */
  inviteCode?: string;
  /** 孩子姓名（可选） */
  childName?: string;
  /** 孩子年龄（可选） */
  childAge?: number;
}

/**
 * 简单注册请求参数（无验证码）
 */
export interface RegisterSimpleDto {
  /** 姓名 */
  name: string;
  /** 手机号（可选） */
  phone?: string;
  /** 来源 */
  source?: string;
  /** 关联ID */
  referenceId?: number;
  /** 邀请码 */
  inviteCode?: string;
}

// ==================== 响应类型 ====================

/**
 * 发送验证码响应
 */
export interface SendCodeResponse {
  /** 是否成功 */
  success: boolean;
  /** 消息 */
  message: string;
  /** 数据 */
  data?: {
    /** 有效期（秒） */
    expiresIn: number;
    /** 下次可发送时间（秒） */
    canResendIn: number;
    /** 今日剩余次数 */
    remainingToday?: number;
  };
}

/**
 * 验证验证码响应
 */
export interface VerifyCodeResponse {
  /** 是否验证成功 */
  isValid: boolean;
  /** 消息 */
  message?: string;
  /** 错误代码 */
  errorCode?: string;
}

/**
 * 注册成功响应
 */
export interface RegisterResponse {
  /** 是否成功 */
  success: boolean;
  /** 消息 */
  message: string;
  /** 数据 */
  data: {
    /** 用户ID */
    userId: number;
    /** JWT Token */
    token: string;
    /** 用户信息 */
    userInfo: {
      id: number;
      name: string;
      phone: string;
      role: string;
    };
    /** 是否自动加入团购 */
    autoJoinGroup?: boolean;
  };
}

// ==================== 存储类型 ====================

/**
 * 验证码缓存数据
 */
export interface CodeCacheData {
  /** 验证码 */
  code: string;
  /** 手机号 */
  phone: string;
  /** 类型 */
  type: VerificationCodeType;
  /** 创建时间 */
  createdAt: number;
  /** 过期时间 */
  expiresAt: number;
  /** 尝试次数 */
  attempts?: number;
  /** 最大尝试次数（默认3次） */
  maxAttempts?: number;
}

/**
 * 发送记录
 */
export interface SmsSendRecord {
  /** 记录ID */
  id?: number;
  /** 手机号 */
  phone: string;
  /** 验证码类型 */
  type: VerificationCodeType;
  /** 验证码（加密存储） */
  code?: string;
  /** 发送状态 */
  status: SmsStatus;
  /** 模板CODE */
  templateCode: string;
  /** 模板参数（JSON） */
  templateParam?: string;
  /** 发送时间 */
  sentAt: Date | string;
  /** 响应消息 */
  responseMessage?: string;
  /** 请求ID（阿里云返回） */
  requestId?: string;
  /** 业务ID（阿里云返回） */
  bizId?: string;
  /** IP地址 */
  ip?: string;
  /** 创建时间 */
  createdAt?: Date | string;
}

// ==================== Service 层接口 ====================

/**
 * 短信服务接口
 */
export interface ISmsService {
  /**
   * 发送验证码短信
   */
  sendVerificationCode(dto: SendVerificationCodeDto): Promise<SendCodeResponse>;

  /**
   * 验证验证码
   */
  verifyCode(dto: VerifyCodeDto): Promise<VerifyCodeResponse>;

  /**
   * 生成验证码
   */
  generateCode(length?: number, onlyDigits?: boolean): string;

  /**
   * 保存验证码到缓存
   */
  saveCod牙ToCache(phone: string, code: string, type: VerificationCodeType, expiresIn: number): Promise<void>;

  /**
   * 从缓存获取验证码
   */
  getCodeFromCache(phone: string, type: VerificationCodeType): Promise<CodeCacheData | null>;

  /**
   * 删除缓存中的验证码
   */
  deleteCodeFromCache(phone: string, type: VerificationCodeType): Promise<void>;

  /**
   * 检查发送频率限制
   */
  checkRateLimit(phone: string): Promise<boolean>;

  /**
   * 记录发送历史
   */
  recordSendHistory(record: SmsSendRecord): Promise<void>;
}

// ==================== 错误类型 ====================

/**
 * 短信服务错误代码
 */
export enum SmsErrorCode {
  /** 手机号无效 */
  INVALID_PHONE = 'INVALID_PHONE',
  /** 验证码无效 */
  INVALID_CODE = 'INVALID_CODE',
  /** 验证码已过期 */
  CODE_EXPIRED = 'CODE_EXPIRED',
  /** 验证码错误 */
  CODE_MISMATCH = 'CODE_MISMATCH',
  /** 发送失败 */
  SEND_FAILED = 'SEND_FAILED',
  /** 发送频率过高 */
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  /** 每日限额已用完 */
  DAILY_LIMIT_EXCEEDED = 'DAILY_LIMIT_EXCEEDED',
  /** 配置错误 */
  CONFIG_ERROR = 'CONFIG_ERROR',
  /** 网络错误 */
  NETWORK_ERROR = 'NETWORK_ERROR',
  /** 尝试次数过多 */
  TOO_MANY_ATTEMPTS = 'TOO_MANY_ATTEMPTS',
}

/**
 * 短信服务异常
 */
export interface SmsError extends Error {
  /** 错误代码 */
  code: SmsErrorCode;
  /** 错误详情 */
  details?: Record<string, any>;
}

// ==================== 工具类型 ====================

/**
 * 手机号验证结果
 */
export interface PhoneValidationResult {
  /** 是否有效 */
  isValid: boolean;
  /** 格式化后的手机号（+86前缀） */
  formatted?: string;
  /** 错误信息 */
  error?: string;
}

/**
 * 短信模板参数
 */
export interface SmsTemplateParam {
  /** 验证码 */
  code?: string;
  /** 产品名称 */
  product?: string;
  /** 自定义参数 */
  [key: string]: string | undefined;
}

/**
 * 批量发送配置
 */
export interface BulkSendConfig {
  /** 手机号列表 */
  phones: string[];
  /** 模板CODE */
  templateCode: string;
  /** 模板参数（每个手机号对应一个参数对象） */
  templateParams: SmsTemplateParam[];
  /** 签名名称 */
  signName: string;
}

// ==================== 统计类型 ====================

/**
 * 短信发送统计
 */
export interface SmsStatistics {
  /** 今日发送总数 */
  todayTotal: number;
  /** 今日成功数 */
  todaySuccess: number;
  /** 今日失败数 */
  todayFailed: number;
  /** 成功率 */
  successRate: number;
  /** 按类型统计 */
  byType: Record<VerificationCodeType, number>;
  /** 按状态统计 */
  byStatus: Record<SmsStatus, number>;
}

/**
 * 手机号发送限制信息
 */
export interface PhoneLimit {
  /** 手机号 */
  phone: string;
  /** 今日已发送次数 */
  todayCount: number;
  /** 今日剩余次数 */
  remainingToday: number;
  /** 上次发送时间 */
  lastSentAt?: Date | string;
  /** 下次可发送时间 */
  nextAvailableAt?: Date | string;
  /** 是否被限制 */
  isLimited: boolean;
}
