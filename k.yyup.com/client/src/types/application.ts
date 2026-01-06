/**
 * 申请状态枚举
 */
export enum ApplicationStatus {
  PENDING = 'pending',       // 待审核
  APPROVED = 'approved',     // 已通过
  REJECTED = 'rejected',     // 已拒绝
  CANCELLED = 'cancelled'    // 已取消
}

/**
 * 拒绝原因枚举
 */
export enum RejectReason {
  QUOTA_FULL = 'quotaFull',          // 名额已满
  AGE_NOT_MATCH = 'ageNotMatch',     // 年龄不符
  INCOMPLETE_INFO = 'incompleteInfo', // 信息不完整
  OTHER = 'other'                     // 其他原因
}

/**
 * 申请信息接口
 */
export interface ApplicationInfo {
  id: number;
  studentName: string;
  studentAge: number;
  parentName: string;
  contactPhone: string;
  className: string;
  applicationType: string;
  status: ApplicationStatus;
  applyTime: string;
  additionalInfo?: string;
  reviewTime: string | null;
  enrollmentDate: string | null;
  rejectReason: RejectReason | null;
  remark: string | null;
}

/**
 * 创建申请参数
 */
export interface ApplicationCreateParams {
  studentName: string;
  studentAge: number;
  parentName: string;
  contactPhone: string;
  className?: string;
  applicationType: string;
  additionalInfo?: string;
}

/**
 * 审核申请参数
 */
export interface ApplicationReviewParams {
  id: number;
  status: ApplicationStatus;
  enrollmentDate?: string;
  rejectReason?: RejectReason;
  remark?: string;
}

/**
 * 申请过滤参数
 */
export interface ApplicationFilter {
  studentName?: string;
  status?: ApplicationStatus;
  dateRange: [string, string] | null;
  className?: string;
}

/**
 * 批量处理表单
 */
export interface BatchForm {
  ids: number[];
  status: ApplicationStatus;
  enrollmentDate: string | Date | null;
  rejectReason: RejectReason | null;
  remark: string;
}

/**
 * 申请列表响应
 */
export interface ApplicationListResponse {
  items: ApplicationInfo[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 申请状态映射到UI标签类型
 */
export const applicationStatusTagMap: Record<ApplicationStatus, 'success' | 'warning' | 'info' | 'danger'> = {
  [ApplicationStatus.APPROVED]: 'success',
  [ApplicationStatus.PENDING]: 'warning',
  [ApplicationStatus.REJECTED]: 'danger',
  [ApplicationStatus.CANCELLED]: 'info'
};

/**
 * 申请状态文本映射
 */
export const applicationStatusTextMap: Record<ApplicationStatus, string> = {
  [ApplicationStatus.APPROVED]: '已通过',
  [ApplicationStatus.PENDING]: '待审核',
  [ApplicationStatus.REJECTED]: '已拒绝',
  [ApplicationStatus.CANCELLED]: '已取消'
};

/**
 * 拒绝原因文本映射
 */
export const rejectReasonTextMap: Record<RejectReason, string> = {
  [RejectReason.QUOTA_FULL]: '名额已满',
  [RejectReason.AGE_NOT_MATCH]: '年龄不符',
  [RejectReason.INCOMPLETE_INFO]: '信息不完整',
  [RejectReason.OTHER]: '其他原因'
}; 