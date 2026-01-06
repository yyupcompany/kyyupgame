/**
 * 活动管理相关类型定义
 */

// 活动状态枚举
export enum ActivityStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  ONGOING = 'ONGOING',
  UPCOMING = 'UPCOMING',
  ENDED = 'ENDED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// 活动类型枚举
export enum ActivityType {
  CULTURAL = '文化活动',
  SPORTS = '体育活动',
  ART = '艺术活动',
  EDUCATION = '教育活动',
  PARENT_CHILD = '亲子活动',
  OTHER = '其他活动'
}

// 活动参与者出席状态枚举
export enum AttendanceStatus {
  CONFIRMED = '已确认',
  UNCONFIRMED = '未确认',
  CANCELLED = '已取消',
  ABSENT = '缺席'
}

// 活动图片类型
export interface ActivityImage {
  id: string;
  url: string;
  title?: string;
}

// 活动参与者类型
export interface ActivityParticipant {
  id: string;
  studentName: string;
  className: string;
  registerTime: string;
  attendanceStatus: string;
}

// 活动基本信息
export interface Activity {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  status: ActivityStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// 活动创建请求
export interface ActivityCreateRequest {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
}

// 活动更新请求
export interface ActivityUpdateRequest {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  status?: ActivityStatus;
}

// 活动报名请求
export interface ActivityRegistrationRequest {
  activityId: string;
  studentIds: string[];
  parentNote?: string;
}

// 获取El-Tag类型的映射函数类型
export type TagType = 'success' | 'warning' | 'info' | 'danger' | 'primary';

// 状态到标签类型的映射
export const ActivityStatusTagMap: Record<ActivityStatus, TagType> = {
  [ActivityStatus.DRAFT]: 'info',
  [ActivityStatus.PENDING]: 'warning',
  [ActivityStatus.ONGOING]: 'success',
  [ActivityStatus.UPCOMING]: 'warning',
  [ActivityStatus.ENDED]: 'info',
  [ActivityStatus.COMPLETED]: 'info',
  [ActivityStatus.CANCELLED]: 'danger'
};

// 出席状态到标签类型的映射
export const AttendanceStatusTagMap: Record<AttendanceStatus, TagType> = {
  [AttendanceStatus.CONFIRMED]: 'success',
  [AttendanceStatus.UNCONFIRMED]: 'warning',
  [AttendanceStatus.CANCELLED]: 'info',
  [AttendanceStatus.ABSENT]: 'danger'
};

/**
 * 活动过滤参数
 */
export interface ActivityFilter {
  title?: string;
  status?: string;
  dateRange: [string, string] | null;
}

/**
 * 活动列表响应
 */
export interface ActivityListResponse {
  items: Activity[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 活动详情（包含关联数据）
 */
export interface ActivityDetail extends Activity {
  participants?: Array<{
    id: string;
    name: string;
    avatar?: string;
    role: string;
  }>;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  comments?: Array<{
    id: string;
    content: string;
    createdBy: string;
    createdAt: string;
  }>;
}

/**
 * 活动详情响应
 */
export interface ActivityDetailResponse {
  activity: Activity;
  evaluations?: ActivityEvaluation[];
}

/**
 * 活动评价接口
 */
export interface ActivityEvaluation {
  id: string;
  activityId: string;
  teacherId: string;
  teacherName: string;
  content: string;
  images?: string[];
  rating: number;
  createdAt: string;
}

/**
 * 活动状态文本映射
 */
export const activityStatusTextMap: Record<string, string> = {
  '进行中': '进行中',
  '即将开始': '即将开始',
  '已结束': '已结束',
  '已取消': '已取消'
}; 