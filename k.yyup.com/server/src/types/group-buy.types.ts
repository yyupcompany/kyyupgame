/**
 * 拼团相关类型定义
 * 用于Controller、Service和API层的类型安全
 */

// ==================== 枚举类型 ====================

/**
 * 团购状态枚举
 */
export enum GroupBuyStatus {
  /** 待确认（刚创建） */
  PENDING = 'pending',
  /** 进行中 */
  IN_PROGRESS = 'in_progress',
  /** 已完成（成团） */
  COMPLETED = 'completed',
  /** 失败（未达成团人数） */
  FAILED = 'failed',
  /** 已过期 */
  EXPIRED = 'expired',
}

/**
 * 团购成员状态枚举
 */
export enum GroupBuyMemberStatus {
  /** 待确认 */
  PENDING = 'pending',
  /** 已确认 */
  CONFIRMED = 'confirmed',
  /** 已取消 */
  CANCELLED = 'cancelled',
}

/**
 * 支付状态枚举
 */
export enum PaymentStatus {
  /** 未支付 */
  UNPAID = 'unpaid',
  /** 已支付 */
  PAID = 'paid',
  /** 已退款 */
  REFUNDED = 'refunded',
}

/**
 * 分享渠道枚举
 */
export enum ShareChannel {
  /** 微信 */
  WECHAT = 'wechat',
  /** 微博 */
  WEIBO = 'weibo',
  /** QQ */
  QQ = 'qq',
  /** 复制链接 */
  LINK = 'link',
  /** 二维码 */
  QRCODE = 'qrcode',
  /** 其他 */
  OTHER = 'other',
}

// ==================== Service 层接口类型 ====================

/**
 * 创建团购请求参数
 */
export interface CreateGroupBuyDto {
  /** 活动ID */
  activityId: number;
  /** 开团者用户ID */
  groupLeaderId: number;
  /** 成团目标人数（默认2人） */
  targetPeople?: number;
  /** 最大参团人数（默认50人） */
  maxPeople?: number;
  /** 团购价格 */
  groupPrice?: number;
  /** 团购时限（小时）默认24小时 */
  deadlineHours?: number;
}

/**
 * 参与团购请求参数
 */
export interface JoinGroupBuyDto {
  /** 团购ID */
  groupBuyId: number;
  /** 用户ID */
  userId: number;
  /** 邀请码（可选） */
  inviteCode?: string;
  /** 邀请人ID（可选） */
  inviterId?: number;
}

/**
 * 团购列表查询参数
 */
export interface GroupBuyListQuery {
  /** 活动ID筛选 */
  activityId?: number;
  /** 用户ID筛选 */
  userId?: number;
  /** 状态筛选 */
  status?: string;
  /** 页码 */
  page: number;
  /** 每页条数 */
  pageSize: number;
}

/**
 * 分享团购请求参数
 */
export interface ShareGroupBuyDto {
  /** 团购ID */
  groupBuyId: number;
  /** 分享渠道 */
  shareChannel: ShareChannel;
  /** 分享者用户ID（可选） */
  userId?: number;
}

// ==================== 响应数据类型 ====================

/**
 * 团购基础信息
 */
export interface GroupBuyInfo {
  /** 团购ID */
  id: number;
  /** 活动ID */
  activityId: number;
  /** 团长ID */
  groupLeaderId: number;
  /** 团购码 */
  groupCode: string;
  /** 目标人数 */
  targetPeople: number;
  /** 当前人数 */
  currentPeople: number;
  /** 最大人数 */
  maxPeople: number;
  /** 团购价格 */
  groupPrice: number;
  /** 原价 */
  originalPrice: number;
  /** 截止时间 */
  deadline: Date | string;
  /** 状态 */
  status: GroupBuyStatus;
  /** 分享次数 */
  shareCount: number;
  /** 浏览次数 */
  viewCount: number;
  /** 创建时间 */
  createdAt: Date | string;
  /** 更新时间 */
  updatedAt: Date | string;
}

/**
 * 活动信息（简化）
 */
export interface ActivityInfo {
  /** 活动ID */
  id: number;
  /** 活动标题 */
  title: string;
  /** 封面图 */
  coverImage?: string;
  /** 开始时间 */
  startTime: Date | string;
  /** 结束时间 */
  endTime?: Date | string;
  /** 地点 */
  location?: string;
}

/**
 * 团员信息
 */
export interface MemberInfo {
  /** 成员ID */
  id: number;
  /** 用户ID */
  userId: number;
  /** 用户姓名 */
  name: string;
  /** 头像 */
  avatar?: string;
  /** 参团时间 */
  joinTime: Date | string;
  /** 是否为团长 */
  isLeader: boolean;
  /** 参团状态 */
  status: GroupBuyMemberStatus;
  /** 支付状态 */
  paymentStatus: PaymentStatus;
  /** 支付金额 */
  paymentAmount?: number;
}

/**
 * 团员信息（脱敏版）
 */
export interface MaskedMemberInfo {
  /** 脱敏姓名（如：张先生） */
  name: string;
  /** 参团时间 */
  joinTime: Date | string;
  /** 是否为团长 */
  isLeader: boolean;
}

/**
 * 团购详情响应
 */
export interface GroupBuyDetailResponse extends GroupBuyInfo {
  /** 关联活动信息 */
  activity: ActivityInfo;
  /** 团员列表 */
  members: MemberInfo[];
  /** 剩余时间（毫秒） */
  remainingTime: number;
  /** 是否可以参团 */
  canJoin: boolean;
  /** 优惠金额 */
  discountAmount: number;
  /** 优惠百分比 */
  savingsPercent: number;
  /** 进度百分比 */
  progress: number;
}

/**
 * 团购公开详情响应（游客模式）
 */
export interface GroupBuyPublicDetailResponse {
  /** 团购ID */
  id: number;
  /** 活动信息 */
  activity: ActivityInfo;
  /** 团购码 */
  groupCode: string;
  /** 目标人数 */
  targetPeople: number;
  /** 当前人数 */
  currentPeople: number;
  /** 团购价格 */
  groupPrice: number;
  /** 原价 */
  originalPrice: number;
  /** 截止时间 */
  deadline: Date | string;
  /** 状态 */
  status: GroupBuyStatus;
  /** 剩余时间（毫秒） */
  remainingTime: number;
  /** 是否可以参团 */
  canJoin: boolean;
  /** 团员列表（脱敏） */
  members: MaskedMemberInfo[];
  /** 优惠金额 */
  discountAmount: number;
  /** 优惠百分比 */
  savingsPercent: number;
  /** 是否需要登录 */
  requireLogin: boolean;
}

/**
 * 分享信息响应
 */
export interface ShareInfoResponse {
  /** 分享链接 */
  shareUrl: string;
  /** 二维码地址 */
  shareQrCode: string;
  /** 分享标题 */
  shareTitle: string;
  /** 分享描述 */
  shareDescription: string;
  /** 分享封面 */
  shareCover?: string;
  /** 邀请码 */
  inviteCode?: string;
}

/**
 * 团购列表响应
 */
export interface GroupBuyListResponse {
  /** 团购列表 */
  items: GroupBuyInfo[];
  /** 总数 */
  total: number;
  /** 当前页 */
  page: number;
  /** 每页条数 */
  pageSize: number;
  /** 总页数 */
  totalPages: number;
}

/**
 * 参团成功响应
 */
export interface JoinGroupBuyResponse {
  /** 成员ID */
  memberId: number;
  /** 团购信息 */
  groupBuy: {
    id: number;
    currentPeople: number;
    targetPeople: number;
    status: GroupBuyStatus;
    isCompleted: boolean;
  };
  /** 是否需要支付 */
  paymentRequired: boolean;
  /** 支付金额 */
  paymentAmount: number;
  /** 支付截止时间 */
  paymentDeadline: Date | string;
}

// ==================== Controller 请求类型 ====================

/**
 * 创建团购请求体
 */
export interface CreateGroupBuyRequest {
  /** 活动ID */
  activityId: number;
  /** 成团目标人数 */
  targetPeople?: number;
  /** 最大参团人数 */
  maxPeople?: number;
  /** 团购价格 */
  groupPrice?: number;
  /** 团购时限（小时） */
  deadlineHours?: number;
  /** 开团者姓名（扩展字段） */
  leaderName?: string;
  /** 开团者手机号（扩展字段） */
  leaderPhone?: string;
  /** 孩子姓名（扩展字段） */
  childName?: string;
  /** 孩子年龄（扩展字段） */
  childAge?: number;
}

/**
 * 参团请求体
 */
export interface JoinGroupBuyRequest {
  /** 邀请码 */
  inviteCode?: string;
  /** 邀请人ID */
  inviterId?: number;
}

/**
 * 分享请求体
 */
export interface ShareGroupBuyRequest {
  /** 分享渠道 */
  shareChannel: ShareChannel;
}

// ==================== 业务逻辑类型 ====================

/**
 * 活动营销配置 - 团购部分
 */
export interface GroupBuyConfig {
  /** 是否启用 */
  enabled: boolean;
  /** 最少成团人数 */
  minPeople: number;
  /** 最大参团人数 */
  maxPeople?: number;
  /** 团购价格 */
  price: number;
  /** 原价 */
  originalPrice: number;
  /** 团购时限（小时） */
  deadlineHours: number;
}

/**
 * 阶梯拼团价配置（扩展）
 */
export interface GroupBuyTier {
  /** 成团人数 */
  people: number;
  /** 对应价格 */
  price: number;
}

/**
 * 团购统计信息
 */
export interface GroupBuyStatistics {
  /** 总开团数 */
  totalGroups: number;
  /** 成功成团数 */
  successGroups: number;
  /** 失败数 */
  failedGroups: number;
  /** 成团率 */
  successRate: number;
  /** 总参团人数 */
  totalMembers: number;
  /** 平均成团时长（小时） */
  avgCompletionTime: number;
}

/**
 * 邀请关系追踪
 */
export interface InviteRelation {
  /** 邀请码 */
  inviteCode: string;
  /** 邀请人ID */
  inviterId: number;
  /** 被邀请人ID */
  inviteeId: number;
  /** 团购ID */
  groupBuyId: number;
  /** 邀请时间 */
  inviteTime: Date | string;
  /** 是否成功参团 */
  isJoined: boolean;
}

// ==================== 工具函数类型 ====================

/**
 * 数据脱敏配置
 */
export interface MaskConfig {
  /** 是否脱敏姓名 */
  maskName?: boolean;
  /** 是否脱敏手机号 */
  maskPhone?: boolean;
  /** 是否隐藏详细信息 */
  hideDetails?: boolean;
}

/**
 * 邀请码生成选项
 */
export interface InviteCodeOptions {
  /** 长度（默认8位） */
  length?: number;
  /** 前缀 */
  prefix?: string;
  /** 是否仅大写字母 */
  uppercase?: boolean;
}

// ==================== 事件通知类型 ====================

/**
 * 团购事件类型
 */
export enum GroupBuyEventType {
  /** 新成员加入 */
  MEMBER_JOINED = 'member_joined',
  /** 成团成功 */
  GROUP_COMPLETED = 'group_completed',
  /** 即将过期 */
  GROUP_EXPIRING = 'group_expiring',
  /** 已过期 */
  GROUP_EXPIRED = 'group_expired',
  /** 支付成功 */
  PAYMENT_SUCCESS = 'payment_success',
  /** 退款完成 */
  REFUND_COMPLETED = 'refund_completed',
}

/**
 * 团购事件数据
 */
export interface GroupBuyEvent {
  /** 事件类型 */
  type: GroupBuyEventType;
  /** 团购ID */
  groupBuyId: number;
  /** 活动ID */
  activityId: number;
  /** 触发用户ID */
  userId?: number;
  /** 事件数据 */
  data: Record<string, any>;
  /** 事件时间 */
  timestamp: Date | string;
}

// ==================== 错误类型 ====================

/**
 * 团购业务错误代码
 */
export enum GroupBuyErrorCode {
  /** 活动不存在 */
  ACTIVITY_NOT_FOUND = 'ACTIVITY_NOT_FOUND',
  /** 团购不存在 */
  GROUP_NOT_FOUND = 'GROUP_NOT_FOUND',
  /** 团购已满 */
  GROUP_FULL = 'GROUP_FULL',
  /** 团购已过期 */
  GROUP_EXPIRED = 'GROUP_EXPIRED',
  /** 已经参团 */
  ALREADY_JOINED = 'ALREADY_JOINED',
  /** 无法参团 */
  CANNOT_JOIN = 'CANNOT_JOIN',
  /** 价格无效 */
  INVALID_PRICE = 'INVALID_PRICE',
  /** 人数无效 */
  INVALID_PEOPLE_COUNT = 'INVALID_PEOPLE_COUNT',
}

/**
 * 团购业务异常
 */
export interface GroupBuyError extends Error {
  /** 错误代码 */
  code: GroupBuyErrorCode;
  /** 错误详情 */
  details?: Record<string, any>;
}
