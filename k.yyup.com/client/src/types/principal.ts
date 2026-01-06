/**
 * 客户池统计数据
 */
export interface CustomerPoolStats {
  total: number;
  assigned: number;
  unassigned: number;
  followUpToday: number;
  newToday: number;
  conversionRate: number;
}

/**
 * 客户池列表项
 */
export interface CustomerPoolItem {
  id: string;
  name: string;
  phone: string;
  source: string;
  status: string;
  assignee?: string;
  lastFollowUp?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 客户分配请求
 */
export interface CustomerPoolAssignment {
  customerId: string;
  assigneeId: string;
}

/**
 * 业绩统计数据
 */
export interface PerformanceStats {
  totalRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  customerCount: number;
  conversionRate: number;
  averageValue: number;
}

/**
 * 业绩排名数据
 */
export interface PerformanceRanking {
  userId: string;
  name: string;
  avatar?: string;
  revenue: number;
  customerCount: number;
  conversionRate: number;
  rank: number;
}

/**
 * 业绩详情数据
 */
export interface PerformanceDetail {
  id: string;
  userId: string;
  name: string;
  type: string;
  amount: number;
  date: string;
  status: string;
  description?: string;
}

/**
 * 提成规则
 */
export interface CommissionRule {
  id: string;
  name: string;
  type: string;
  threshold: number;
  rate: number;
  startDate: string;
  endDate?: string;
  isActive: boolean;
}

/**
 * 业绩目标
 */
export interface PerformanceGoal {
  id: string;
  userId: string;
  type: string;
  target: number;
  current: number;
  period: string;
  startDate: string;
  endDate: string;
}

/**
 * 提成模拟结果
 */
export interface CommissionSimulation {
  revenue: number;
  commission: number;
  details: Array<{
    rule: CommissionRule;
    amount: number;
    commission: number;
  }>;
}

/**
 * 客户详情
 */
export interface CustomerDetail extends CustomerPoolItem {
  age?: number;
  gender?: string;
  address?: string;
  email?: string;
  childName?: string;
  childAge?: number;
  childGender?: string;
  notes?: string;
  tags?: string[];
  followUpRecords: FollowUpRecord[];
}

/**
 * 跟进记录
 */
export interface FollowUpRecord {
  id: string;
  customerId: string;
  userId: string;
  type: string;
  content: string;
  nextFollowUpDate?: string;
  createdAt: string;
}

/**
 * 业绩规则
 */
export interface PerformanceRule {
  id: string;
  name: string;
  type: string;
  conditions: any[];
  rewards: any[];
  startDate: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 海报模板
 */
export interface PosterTemplate {
  id: string;
  name: string;
  thumbnail: string;
  width: number;
  height: number;
  elements: any[];
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * 海报生成参数
 */
export interface PosterGeneration {
  templateId: string;
  data: Record<string, any>;
  format?: 'png' | 'jpg';
  quality?: number;
} 