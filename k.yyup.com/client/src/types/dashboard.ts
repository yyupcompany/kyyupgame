/**
 * 数据分析仪表盘相关类型定义
 */

// 综合统计数据接口
export interface DashboardOverview {
  totalEnrollmentCount: number;      // 总招生人数
  currentEnrollmentCount: number;    // 当前招生人数
  targetCompletionRate: number;      // 目标完成率
  consultationCount: number;         // 咨询数量
  applicationCount: number;          // 申请数量
  conversionRate: number;            // 转化率
  activityCount: number;             // 活动数量
  adImpressionCount: number;         // 广告展示次数
  adClickCount: number;              // 广告点击次数
  recentUpdatedAt?: string;          // 最近更新时间
}

// 招生渠道分析接口
export interface ChannelAnalysis {
  channelName: string;               // 渠道名称
  consultationCount: number;         // 咨询数量
  applicationCount: number;          // 申请数量
  conversionRate: number;            // 转化率
  enrollmentCount: number;           // 招生人数
  costPerEnrollment?: number;        // 单招成本
  roi?: number;                      // 投资回报率
}

// 活动效果分析接口
export interface ActivityAnalysis {
  activityName: string;              // 活动名称
  activityType: string;              // 活动类型
  participantCount: number;          // 参与人数
  consultationCount: number;         // 咨询数量
  applicationCount: number;          // 申请数量
  conversionRate: number;            // 转化率
  enrollmentCount: number;           // 招生人数
  costPerEnrollment?: number;        // 单招成本
}

// 咨询转化漏斗接口
export interface ConversionFunnel {
  stage: string;                     // 阶段名称
  count: number;                     // 数量
  conversionRate: number;            // 转化率
  previousStageDropRate?: number;    // 上一阶段流失率
}

// 招生趋势数据接口
export interface EnrollmentTrend {
  date: string;                      // 日期
  consultationCount: number;         // 咨询数量
  applicationCount: number;          // 申请数量
  enrollmentCount: number;           // 招生人数
}

// 同比环比数据接口
export interface PeriodComparison {
  metric: string;                    // 指标名称
  currentValue: number;              // 当前值
  previousValue: number;             // 上期值
  yearOnYearValue?: number;          // 同比值
  percentageChange: number;          // 变化百分比
  trend: 'up' | 'down' | 'stable';   // 趋势
}

// 招生预测数据接口
export interface EnrollmentForecast {
  date: string;                      // 日期
  predictedValue: number;            // 预测值
  lowerBound?: number;               // 下限
  upperBound?: number;               // 上限
  actualValue?: number;              // 实际值（如果有）
}

// 班级招生分析接口
export interface ClassAnalysis {
  className: string;                 // 班级名称
  quota: number;                     // 名额
  enrolledCount: number;             // 已招生人数
  remainingQuota: number;            // 剩余名额
  fillRate: number;                  // 填充率
  competitionRate?: number;          // 竞争率（申请人数/名额）
}

// 招生影响因素接口
export interface InfluenceFactor {
  factorName: string;                // 因素名称
  correlation: number;               // 相关性系数
  impact: 'high' | 'medium' | 'low'; // 影响程度
  trend: 'up' | 'down' | 'stable';   // 趋势
}

// 报表模板接口
export interface ReportTemplate {
  id: number;                        // 模板ID
  name: string;                      // 模板名称
  description?: string;              // 模板描述
  type: string;                      // 模板类型
  format: 'pdf' | 'excel' | 'word';  // 格式
  sections: ReportSection[];         // 报表区块
  createdAt: string;                 // 创建时间
  updatedAt: string;                 // 更新时间
  createdBy: number;                 // 创建人ID
}

// 报表区块接口
export interface ReportSection {
  title: string;                     // 区块标题
  type: 'table' | 'chart' | 'text';  // 区块类型
  dataSource: string;                // 数据源
  options?: Record<string, any>;     // 配置选项
}

// 报表接口
export interface Report {
  id: number;                        // 报表ID
  name: string;                      // 报表名称
  templateId: number;                // 模板ID
  format: 'pdf' | 'excel' | 'word';  // 格式
  parameters?: Record<string, any>;  // 报表参数
  fileUrl?: string;                  // 文件URL
  status: 'processing' | 'completed' | 'failed'; // 状态
  createdAt: string;                 // 创建时间
  createdBy: number;                 // 创建人ID
}

// 报表定时任务接口
export interface ReportSchedule {
  id: number;                        // 定时任务ID
  templateId: number;                // 模板ID
  name: string;                      // 任务名称
  frequency: 'daily' | 'weekly' | 'monthly'; // 频率
  dayOfWeek?: number;                // 星期几（weekly时）
  dayOfMonth?: number;               // 每月几号（monthly时）
  time: string;                      // 时间
  parameters?: Record<string, any>;  // 报表参数
  recipients: string[];              // 收件人
  isActive: boolean;                 // 是否激活
  lastRunAt?: string;                // 上次运行时间
  nextRunAt?: string;                // 下次运行时间
  createdBy: number;                 // 创建人ID
}

/**
 * 仪表盘统计数据 - 对齐后端API /api/dashboard/stats
 */
export interface DashboardStats {
  userCount: number;
  kindergartenCount: number;
  studentCount: number;
  enrollmentCount: number;
  activityCount: number;
  teacherCount?: number;
  classCount?: number;
  enrollmentRate?: number;
  attendanceRate?: number;
  graduationRate?: number;
}

/**
 * 仪表盘概览数据 - 对齐后端API /api/dashboard/overview
 */
export interface DashboardOverview {
  totalUsers: number;
  totalKindergartens: number;
  totalStudents: number;
  totalApplications: number;
  recentActivities: RecentActivity[];
}

/**
 * 近期活动数据
 */
export interface RecentActivity {
  id: number;
  type: string;
  description: string;
  time: string;
}

/**
 * 即将到来的事件
 */
export interface UpcomingEvent {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  type: 'activity' | 'meeting' | 'enrollment' | 'other';
  location?: string;
  participants?: number;
}

/**
 * 趋势数据
 */
export interface TrendData {
  date: string;
  value: number;
}

/**
 * 仪表盘趋势数据
 */
export interface DashboardTrends {
  enrollment: TrendData[];
  attendance: TrendData[];
  revenue: TrendData[];
}

/**
 * 仪表盘通知
 */
export interface DashboardNotice {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  createdAt: string;
  expiredAt?: string;
  isRead: boolean;
}

/**
 * 仪表盘待办事项
 */
export interface DashboardTodo {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  assignee?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 仪表盘数据
 */
export interface DashboardData {
  stats: DashboardStats;
  trends: DashboardTrends;
  notices: DashboardNotice[];
  todos: DashboardTodo[];
} 