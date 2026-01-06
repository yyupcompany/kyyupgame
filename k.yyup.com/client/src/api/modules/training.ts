import { request } from '@/utils/request'
import { API_PREFIX } from '../endpoints/base'

// API端点常量
export const TRAINING_ENDPOINTS = {
  // 训练概览
  OVERVIEW: `${API_PREFIX}/training/overview`,

  // 训练活动
  ACTIVITIES: `${API_PREFIX}/training/activities`,
  ACTIVITY_DETAIL: (id: string) => `${API_PREFIX}/training/activities/${id}`,

  // 训练计划
  PLANS: `${API_PREFIX}/training/plans`,
  PLAN_DETAIL: (id: string) => `${API_PREFIX}/training/plans/${id}`,
  PLAN_STATUS: (id: string) => `${API_PREFIX}/training/plans/${id}/status`,
  COMPLETE_ACTIVITY: (planId: string, activityId: string) => `${API_PREFIX}/training/plans/${planId}/activities/${activityId}/complete`,

  // 训练记录
  RECORDS: `${API_PREFIX}/training/records`,
  RECORD_DETAIL: (id: string) => `${API_PREFIX}/training/records/${id}`,

  // 成就系统
  ACHIEVEMENTS: `${API_PREFIX}/training/achievements`,
  ACHIEVEMENT_DETAIL: (id: string) => `${API_PREFIX}/training/achievements/${id}`,
  UNLOCK_ACHIEVEMENT: (id: string) => `${API_PREFIX}/training/achievements/${id}/unlock`,

  // 推荐和统计
  RECOMMENDATIONS: (childId: string) => `${API_PREFIX}/training/recommendations/${childId}`,
  STATS: (childId: string) => `${API_PREFIX}/training/stats/${childId}`
} as const

// 训练活动类型枚举
export enum ActivityType {
  COGNITIVE = 'cognitive',      // 认知
  MOTOR = 'motor',              // 运动
  LANGUAGE = 'language',        // 语言
  SOCIAL = 'social'             // 社交
}

// 难度等级枚举
export enum DifficultyLevel {
  EASY = 'easy',                // 简单
  MEDIUM = 'medium',            // 中等
  HARD = 'hard'                 // 困难
}

// 训练计划状态枚举
export enum PlanStatus {
  NOT_STARTED = 'not_started',  // 未开始
  IN_PROGRESS = 'in_progress',  // 进行中
  PAUSED = 'paused',            // 已暂停
  COMPLETED = 'completed'       // 已完成
}

// 训练活动接口
export interface TrainingActivity {
  id: string
  name: string
  description: string
  type: ActivityType
  difficulty: DifficultyLevel
  duration: number              // 分钟
  ageRange: {
    min: number
    max: number
  }
  objectives: string[]
  materials: string[]
  instructions: string[]
  imageUrl?: string
  videoUrl?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

// 训练计划接口
export interface TrainingPlan {
  id: string
  name: string
  description: string
  childId: string
  activities: {
    activityId: string
    scheduledDate: string
    completedAt?: string
    score?: number
    notes?: string
  }[]
  goals: string[]
  status: PlanStatus
  startDate: string
  endDate?: string
  createdAt: string
  updatedAt: string
}

// 训练记录接口
export interface TrainingRecord {
  id: string
  planId: string
  activityId: string
  childId: string
  duration: number              // 实际训练时长（分钟）
  score: number                 // 得分 (0-100)
  completedAt: string
  feedback: {
    strengths: string[]         // 优势
    improvements: string[]      // 改进建议
    nextSteps: string[]         // 下一步
  }
  attachments: {
    type: 'image' | 'video'
    url: string
    description?: string
  }[]
  notes?: string
}

// 成就接口
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: string
  points: number
  requirement: {
    type: 'completion_count' | 'score_average' | 'streak_days' | 'total_time'
    value: number
    description: string
  }
  unlockedAt?: string
  progress: number              // 0-100
  isUnlocked: boolean
}

// 今日训练任务统计
export interface TodayTasksStats {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  totalDuration: number         // 总时长（分钟）
  estimatedTime: number         // 预估剩余时间（分钟）
}

// 训练概览
export interface TrainingOverview {
  todayTasks: TodayTasksStats
  weeklyProgress: {
    completed: number
    total: number
    percentage: number
  }
  monthlyStats: {
    totalSessions: number
    totalMinutes: number
    averageScore: number
    streakDays: number
  }
  recentAchievements: Achievement[]
  nextActivity?: {
    id: string
    name: string
    type: ActivityType
    duration: number
  }
}

// 训练活动查询参数
export interface ActivityQueryParams {
  type?: ActivityType
  difficulty?: DifficultyLevel
  minAge?: number
  maxAge?: number
  search?: string
  page?: number
  pageSize?: number
}

// 训练计划查询参数
export interface PlanQueryParams {
  childId?: string
  status?: PlanStatus
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}

// 训练记录查询参数
export interface RecordQueryParams {
  childId?: string
  activityId?: string
  planId?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}

// API响应类型
export type TrainingActivitiesResponse = {
  activities: TrainingActivity[]
  total: number
  page: number
  pageSize: number
}

export type TrainingPlansResponse = {
  plans: TrainingPlan[]
  total: number
  page: number
  pageSize: number
}

export type TrainingRecordsResponse = {
  records: TrainingRecord[]
  total: number
  page: number
  pageSize: number
}

export type AchievementsResponse = {
  achievements: Achievement[]
  categories: string[]
  totalPoints: number
  unlockedCount: number
  totalCount: number
}

// 训练中心API
export const trainingApi = {
  // 训练概览
  getOverview: (childId?: string) =>
    request.get<TrainingOverview>(TRAINING_ENDPOINTS.OVERVIEW, { params: { childId } }),

  // 训练活动
  getActivities: (params?: ActivityQueryParams) =>
    request.get<TrainingActivitiesResponse>(TRAINING_ENDPOINTS.ACTIVITIES, { params }),

  getActivityDetail: (id: string) =>
    request.get<TrainingActivity>(TRAINING_ENDPOINTS.ACTIVITY_DETAIL(id)),

  // 训练计划
  getPlans: (params?: PlanQueryParams) =>
    request.get<TrainingPlansResponse>(TRAINING_ENDPOINTS.PLANS, { params }),

  getPlanDetail: (id: string) =>
    request.get<TrainingPlan>(TRAINING_ENDPOINTS.PLAN_DETAIL(id)),

  createPlan: (data: Omit<TrainingPlan, 'id' | 'createdAt' | 'updatedAt'>) =>
    request.post<TrainingPlan>(TRAINING_ENDPOINTS.PLANS, data),

  updatePlan: (id: string, data: Partial<TrainingPlan>) =>
    request.put<TrainingPlan>(TRAINING_ENDPOINTS.PLAN_DETAIL(id), data),

  updatePlanStatus: (id: string, status: PlanStatus) =>
    request.patch<TrainingPlan>(TRAINING_ENDPOINTS.PLAN_STATUS(id), { status }),

  deletePlan: (id: string) =>
    request.delete(TRAINING_ENDPOINTS.PLAN_DETAIL(id)),

  // 训练记录
  getRecords: (params?: RecordQueryParams) =>
    request.get<TrainingRecordsResponse>(TRAINING_ENDPOINTS.RECORDS, { params }),

  getRecordDetail: (id: string) =>
    request.get<TrainingRecord>(TRAINING_ENDPOINTS.RECORD_DETAIL(id)),

  createRecord: (data: Omit<TrainingRecord, 'id'>) =>
    request.post<TrainingRecord>(TRAINING_ENDPOINTS.RECORDS, data),

  // 成就系统
  getAchievements: (childId?: string) =>
    request.get<AchievementsResponse>(TRAINING_ENDPOINTS.ACHIEVEMENTS, { params: { childId } }),

  getAchievementDetail: (id: string) =>
    request.get<Achievement>(TRAINING_ENDPOINTS.ACHIEVEMENT_DETAIL(id)),

  unlockAchievement: (id: string) =>
    request.post<Achievement>(TRAINING_ENDPOINTS.UNLOCK_ACHIEVEMENT(id)),

  // 活动完成
  completeActivity: (planId: string, activityId: string, data: {
    duration: number
    score: number
    notes?: string
    attachments?: Array<{
      type: 'image' | 'video'
      url: string
      description?: string
    }>
  }) =>
    request.post<TrainingRecord>(TRAINING_ENDPOINTS.COMPLETE_ACTIVITY(planId, activityId), data),

  // 获取推荐活动
  getRecommendedActivities: (childId: string) =>
    request.get<TrainingActivity[]>(TRAINING_ENDPOINTS.RECOMMENDATIONS(childId)),

  // 获取训练统计数据
  getTrainingStats: (childId: string, period: 'week' | 'month' | 'quarter' | 'year') =>
    request.get<{
      totalSessions: number
      totalMinutes: number
      averageScore: number
      completionRate: number
      activityDistribution: Record<ActivityType, number>
      progressTrend: Array<{
        date: string
        score: number
        duration: number
      }>
    }>(TRAINING_ENDPOINTS.STATS(childId), { params: { period } })
}