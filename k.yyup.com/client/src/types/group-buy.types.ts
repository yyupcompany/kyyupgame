/**
 * 拼团相关前端类型定义
 * 用于Vue组件、API调用和Store状态管理
 */

// ==================== 枚举类型 ====================

/**
 * 团购状态枚举
 */
export enum GroupBuyStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  EXPIRED = 'expired',
}

/**
 * 团购成员状态枚举
 */
export enum GroupBuyMemberStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

/**
 * 支付状态枚举
 */
export enum PaymentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  REFUNDED = 'refunded',
}

/**
 * 分享渠道枚举
 */
export enum ShareChannel {
  WECHAT = 'wechat',
  WEIBO = 'weibo',
  QQ = 'qq',
  LINK = 'link',
  QRCODE = 'qrcode',
  OTHER = 'other',
}

// ==================== 数据模型类型 ====================

/**
 * 活动信息
 */
export interface ActivityInfo {
  id: number;
  title: string;
  coverImage?: string;
  startTime: string | Date;
  endTime?: string | Date;
  location?: string;
}

/**
 * 团员信息
 */
export interface MemberInfo {
  id: number;
  userId: number;
  name: string;
  avatar?: string;
  joinTime: string | Date;
  isLeader: boolean;
  status: GroupBuyMemberStatus;
  paymentStatus: PaymentStatus;
  paymentAmount?: number;
}

/**
 * 团员信息（脱敏版）
 */
export interface MaskedMemberInfo {
  name: string;
  joinTime: string | Date;
  isLeader: boolean;
}

/**
 * 团购基础信息
 */
export interface GroupBuyInfo {
  id: number;
  activityId: number;
  groupLeaderId: number;
  groupCode: string;
  targetPeople: number;
  currentPeople: number;
  maxPeople: number;
  groupPrice: number;
  originalPrice: number;
  deadline: string | Date;
  status: GroupBuyStatus;
  shareCount: number;
  viewCount: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

/**
 * 团购详情
 */
export interface GroupBuyDetail extends GroupBuyInfo {
  activity: ActivityInfo;
  members: MemberInfo[];
  remainingTime: number;
  canJoin: boolean;
  discountAmount: number;
  savingsPercent: number;
  progress: number;
}

/**
 * 团购公开详情（游客模式）
 */
export interface GroupBuyPublicDetail {
  id: number;
  activity: ActivityInfo;
  groupCode: string;
  targetPeople: number;
  currentPeople: number;
  groupPrice: number;
  originalPrice: number;
  deadline: string | Date;
  status: GroupBuyStatus;
  remainingTime: number;
  canJoin: boolean;
  members: MaskedMemberInfo[];
  discountAmount: number;
  savingsPercent: number;
  requireLogin: boolean;
}

/**
 * 分享信息
 */
export interface ShareInfo {
  shareUrl: string;
  shareQrCode: string;
  shareTitle: string;
  shareDescription: string;
  shareCover?: string;
  inviteCode?: string;
}

// ==================== API请求类型 ====================

/**
 * 创建团购请求
 */
export interface CreateGroupBuyRequest {
  activityId: number;
  targetPeople?: number;
  maxPeople?: number;
  groupPrice?: number;
  deadlineHours?: number;
  leaderName?: string;
  leaderPhone?: string;
  childName?: string;
  childAge?: number;
}

/**
 * 参团请求
 */
export interface JoinGroupBuyRequest {
  inviteCode?: string;
  inviterId?: number;
}

/**
 * 分享请求
 */
export interface ShareGroupBuyRequest {
  shareChannel: ShareChannel;
}

/**
 * 团购列表查询参数
 */
export interface GroupBuyListQuery {
  activityId?: number;
  userId?: number;
  status?: string;
  page?: number;
  pageSize?: number;
}

// ==================== API响应类型 ====================

/**
 * 创建团购响应
 */
export interface CreateGroupBuyResponse {
  success: boolean;
  message: string;
  data: GroupBuyInfo;
}

/**
 * 参团成功响应
 */
export interface JoinGroupBuyResponse {
  success: boolean;
  message: string;
  data: {
    memberId: number;
    groupBuy: {
      id: number;
      currentPeople: number;
      targetPeople: number;
      status: GroupBuyStatus;
      isCompleted: boolean;
    };
    paymentRequired: boolean;
    paymentAmount: number;
    paymentDeadline: string | Date;
  };
}

/**
 * 团购列表响应
 */
export interface GroupBuyListResponse {
  success: boolean;
  message: string;
  data: {
    items: GroupBuyInfo[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

/**
 * 团购详情响应
 */
export interface GroupBuyDetailResponse {
  success: boolean;
  message: string;
  data: GroupBuyDetail;
}

/**
 * 团购公开详情响应
 */
export interface GroupBuyPublicDetailResponse {
  success: boolean;
  message: string;
  data: GroupBuyPublicDetail;
  requireLogin?: boolean;
}

/**
 * 分享响应
 */
export interface ShareGroupBuyResponse {
  success: boolean;
  message: string;
  data: ShareInfo;
}

// ==================== 组件Props类型 ====================

/**
 * GroupBuyDetail 组件Props
 */
export interface GroupBuyDetailProps {
  /** 团购ID */
  groupBuyId?: number | string;
  /** 是否显示分享按钮 */
  showShareButton?: boolean;
  /** 是否显示团员列表 */
  showMemberList?: boolean;
  /** 是否自动刷新 */
  autoRefresh?: boolean;
  /** 刷新间隔（毫秒） */
  refreshInterval?: number;
}

/**
 * QuickRegisterModal 组件Props
 */
export interface QuickRegisterModalProps {
  /** 是否显示弹窗 */
  visible: boolean;
  /** 团购ID（用于关联） */
  groupBuyId?: number;
  /** 邀请码 */
  inviteCode?: string;
  /** 邀请人ID */
  inviterId?: number;
  /** 标题文字 */
  title?: string;
  /** 是否显示孩子信息字段 */
  showChildFields?: boolean;
}

/**
 * ShareModal 组件Props
 */
export interface ShareModalProps {
  /** 是否显示弹窗 */
  visible: boolean;
  /** 团购ID */
  groupBuyId: number;
  /** 团购标题 */
  title: string;
  /** 团购描述 */
  description?: string;
  /** 封面图 */
  coverImage?: string;
  /** 可用分享渠道 */
  availableChannels?: ShareChannel[];
}

/**
 * MemberList 组件Props
 */
export interface MemberListProps {
  /** 团员列表 */
  members: MemberInfo[] | MaskedMemberInfo[];
  /** 目标人数 */
  targetPeople: number;
  /** 是否显示支付状态 */
  showPaymentStatus?: boolean;
  /** 是否显示占位符 */
  showPlaceholders?: boolean;
  /** 布局方式 */
  layout?: 'horizontal' | 'vertical' | 'grid';
  /** 每行显示数量 */
  columns?: number;
}

/**
 * GroupBuyCard 组件Props
 */
export interface GroupBuyCardProps {
  /** 团购信息 */
  groupBuy: GroupBuyInfo;
  /** 是否显示活动信息 */
  showActivity?: boolean;
  /** 是否显示进度条 */
  showProgress?: boolean;
  /** 卡片样式 */
  variant?: 'default' | 'compact' | 'detailed';
}

/**
 * GroupBuyProgress 组件Props
 */
export interface GroupBuyProgressProps {
  /** 当前人数 */
  currentPeople: number;
  /** 目标人数 */
  targetPeople: number;
  /** 进度百分比 */
  progress?: number;
  /** 是否显示百分比 */
  showPercent?: boolean;
  /** 是否显示数字 */
  showNumbers?: boolean;
  /** 进度条颜色 */
  color?: string;
  /** 是否显示动画 */
  animated?: boolean;
}

// ==================== 组件Emits类型 ====================

/**
 * QuickRegisterModal 组件Emits
 */
export interface QuickRegisterModalEmits {
  /** 更新visible状态 */
  (e: 'update:visible', value: boolean): void;
  /** 注册成功 */
  (e: 'register-success', data: { userId: number; token: string }): void;
  /** 注册失败 */
  (e: 'register-error', error: Error): void;
  /** 取消注册 */
  (e: 'cancel'): void;
}

/**
 * ShareModal 组件Emits
 */
export interface ShareModalEmits {
  /** 更新visible状态 */
  (e: 'update:visible', value: boolean): void;
  /** 分享成功 */
  (e: 'share-success', channel: ShareChannel): void;
  /** 分享失败 */
  (e: 'share-error', error: Error): void;
  /** 复制成功 */
  (e: 'copy-success', url: string): void;
}

/**
 * MemberList 组件Emits
 */
export interface MemberListEmits {
  /** 点击成员 */
  (e: 'member-click', member: MemberInfo | MaskedMemberInfo): void;
  /** 点击占位符 */
  (e: 'placeholder-click'): void;
  /** 长按成员 */
  (e: 'member-longpress', member: MemberInfo | MaskedMemberInfo): void;
}

/**
 * GroupBuyCard 组件Emits
 */
export interface GroupBuyCardEmits {
  /** 点击卡片 */
  (e: 'click', groupBuy: GroupBuyInfo): void;
  /** 点击参团按钮 */
  (e: 'join', groupBuyId: number): void;
  /** 点击分享按钮 */
  (e: 'share', groupBuyId: number): void;
}

// ==================== Store状态类型 ====================

/**
 * 团购Store状态
 */
export interface GroupBuyState {
  /** 当前团购详情 */
  currentGroupBuy: GroupBuyDetail | null;
  /** 团购列表 */
  groupBuyList: GroupBuyInfo[];
  /** 我的团购列表 */
  myGroupBuys: GroupBuyInfo[];
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 总数 */
  total: number;
  /** 当前页 */
  page: number;
  /** 每页条数 */
  pageSize: number;
}

/**
 * 团购Store Getters
 */
export interface GroupBuyGetters {
  /** 是否正在加载 */
  isLoading: (state: GroupBuyState) => boolean;
  /** 是否有错误 */
  hasError: (state: GroupBuyState) => boolean;
  /** 获取团购进度 */
  getGroupBuyProgress: (state: GroupBuyState) => (id: number) => number | undefined;
  /** 获取剩余人数 */
  getRemainingSlots: (state: GroupBuyState) => (id: number) => number | undefined;
  /** 是否可以参团 */
  canJoinGroupBuy: (state: GroupBuyState) => (id: number) => boolean;
}

/**
 * 团购Store Actions
 */
export interface GroupBuyActions {
  /** 获取团购列表 */
  fetchGroupBuyList(query: GroupBuyListQuery): Promise<void>;
  /** 获取团购详情 */
  fetchGroupBuyDetail(id: number): Promise<void>;
  /** 获取公开详情 */
  fetchPublicDetail(id: number): Promise<void>;
  /** 创建团购 */
  createGroupBuy(data: CreateGroupBuyRequest): Promise<GroupBuyInfo>;
  /** 参与团购 */
  joinGroupBuy(id: number, data: JoinGroupBuyRequest): Promise<void>;
  /** 分享团购 */
  shareGroupBuy(id: number, data: ShareGroupBuyRequest): Promise<ShareInfo>;
  /** 刷新当前团购 */
  refreshCurrent(): Promise<void>;
  /** 清除错误 */
  clearError(): void;
  /** 重置状态 */
  resetState(): void;
}

// ==================== 工具类型 ====================

/**
 * 倒计时选项
 */
export interface CountdownOptions {
  /** 截止时间 */
  deadline: string | Date | number;
  /** 更新间隔（毫秒） */
  interval?: number;
  /** 格式化函数 */
  format?: (time: CountdownTime) => string;
  /** 完成回调 */
  onFinish?: () => void;
}

/**
 * 倒计时时间
 */
export interface CountdownTime {
  /** 天数 */
  days: number;
  /** 小时 */
  hours: number;
  /** 分钟 */
  minutes: number;
  /** 秒数 */
  seconds: number;
  /** 总毫秒数 */
  totalMilliseconds: number;
  /** 是否已结束 */
  isFinished: boolean;
}

/**
 * 格式化选项
 */
export interface FormatOptions {
  /** 是否显示货币符号 */
  showCurrency?: boolean;
  /** 货币符号 */
  currencySymbol?: string;
  /** 小数位数 */
  decimals?: number;
  /** 千分位分隔符 */
  thousandsSeparator?: string;
}

/**
 * 验证规则
 */
export interface ValidationRule {
  /** 是否必填 */
  required?: boolean;
  /** 最小长度 */
  minLength?: number;
  /** 最大长度 */
  maxLength?: number;
  /** 正则表达式 */
  pattern?: RegExp;
  /** 自定义验证函数 */
  validator?: (value: any) => boolean | string;
  /** 错误消息 */
  message?: string;
}

/**
 * 表单字段
 */
export interface FormField<T = any> {
  /** 字段名 */
  name: string;
  /** 标签 */
  label: string;
  /** 字段值 */
  value: T;
  /** 验证规则 */
  rules?: ValidationRule[];
  /** 错误消息 */
  error?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 占位符 */
  placeholder?: string;
}

// ==================== Composable类型 ====================

/**
 * useGroupBuy Composable返回值
 */
export interface UseGroupBuyReturn {
  /** 团购详情 */
  groupBuy: Ref<GroupBuyDetail | null>;
  /** 加载状态 */
  loading: Ref<boolean>;
  /** 错误信息 */
  error: Ref<string | null>;
  /** 获取详情 */
  fetchDetail: (id: number) => Promise<void>;
  /** 参团 */
  join: (data: JoinGroupBuyRequest) => Promise<void>;
  /** 分享 */
  share: (channel: ShareChannel) => Promise<ShareInfo>;
  /** 刷新 */
  refresh: () => Promise<void>;
}

/**
 * useCountdown Composable返回值
 */
export interface UseCountdownReturn {
  /** 剩余时间 */
  time: Ref<CountdownTime>;
  /** 格式化文本 */
  formattedTime: ComputedRef<string>;
  /** 是否已结束 */
  isFinished: ComputedRef<boolean>;
  /** 开始倒计时 */
  start: () => void;
  /** 停止倒计时 */
  stop: () => void;
  /** 重置 */
  reset: () => void;
}

/**
 * useShare Composable返回值
 */
export interface UseShareReturn {
  /** 分享信息 */
  shareInfo: Ref<ShareInfo | null>;
  /** 加载状态 */
  loading: Ref<boolean>;
  /** 生成分享信息 */
  generateShareInfo: (groupBuyId: number) => Promise<void>;
  /** 复制链接 */
  copyLink: () => Promise<boolean>;
  /** 下载二维码 */
  downloadQrCode: () => Promise<boolean>;
  /** 分享到渠道 */
  shareToChannel: (channel: ShareChannel) => Promise<void>;
}

// ==================== 类型导入引用 ====================

import type { Ref, ComputedRef } from 'vue';
