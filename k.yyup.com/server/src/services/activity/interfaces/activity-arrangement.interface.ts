/**
 * 活动安排服务接口
 */

import { PaginationParams } from '../../../types/common';

/**
 * 活动安排查询参数
 */
export interface ActivityArrangementQueryParams extends PaginationParams {
  planId?: number; // 活动计划ID
  title?: string; // 标题关键字
  activityType?: number; // 活动类型
  status?: number; // 状态
  startDateRange?: [Date, Date]; // 开始日期范围
  endDateRange?: [Date, Date]; // 结束日期范围
  searchText?: string; // 全文搜索关键字
}

/**
 * 活动安排创建参数
 */
export interface ActivityArrangementCreateParams {
  planId: number; // 所属活动计划ID
  title: string; // 活动标题
  activityType: number; // 活动类型
  location: string; // 活动地点
  startTime: Date; // 开始时间
  endTime: Date; // 结束时间
  participantCount: number; // 预计参与人数
  targetAge?: string; // 目标年龄段
  objectives?: string; // 活动目标
  contentOutline?: string; // 内容大纲
  materials?: string; // 所需材料
  emergencyPlan?: string; // 应急预案
  status?: number; // 状态: 0-未开始, 1-筹备中
  remark?: string; // 备注
  staffArrangements?: ActivityStaffArrangementParams[]; // 人员安排
  resourceConfigs?: ActivityResourceConfigParams[]; // 资源配置
}

/**
 * 活动安排更新参数
 */
export interface ActivityArrangementUpdateParams {
  title?: string; // 活动标题
  activityType?: number; // 活动类型
  location?: string; // 活动地点
  startTime?: Date; // 开始时间
  endTime?: Date; // 结束时间
  participantCount?: number; // 预计参与人数
  targetAge?: string; // 目标年龄段
  objectives?: string; // 活动目标
  contentOutline?: string; // 内容大纲
  materials?: string; // 所需材料
  emergencyPlan?: string; // 应急预案
  status?: number; // 状态
  remark?: string; // 备注
}

/**
 * 活动人员安排参数
 */
export interface ActivityStaffArrangementParams {
  id?: number; // 更新时使用
  userId: number; // 用户ID
  role: string; // 角色: 'leader' | 'assistant' | 'security' | 'photographer' | 'other'
  responsibilities?: string; // 职责描述
  remark?: string; // 备注
}

/**
 * 活动资源配置参数
 */
export interface ActivityResourceConfigParams {
  id?: number; // 更新时使用
  name: string; // 资源名称
  quantity: number; // 数量
  category: string; // 类别: 'equipment' | 'material' | 'venue' | 'other'
  remark?: string; // 备注
}

/**
 * 活动评价创建参数
 */
export interface ActivityEvaluationParams {
  content: string; // 评价内容
  rating: number; // 评分 (1-5)
  achievements?: string; // 成果
  improvements?: string; // 改进建议
  photos?: string[]; // 照片URL数组
  remark?: string; // 备注
}

/**
 * 活动安排统计信息
 */
export interface ActivityArrangementStats {
  total: number; // 总活动数
  completed: number; // 已完成
  ongoing: number; // 进行中
  upcoming: number; // 即将开始
  cancelled: number; // 已取消
  byType: Record<number, number>; // 按类型统计
}

/**
 * 活动安排服务接口
 */
export interface IActivityArrangementService {
  /**
   * 创建活动安排
   * @param params 创建参数
   * @param currentUserId 当前用户ID
   * @returns 创建的活动安排
   */
  createArrangement(params: ActivityArrangementCreateParams, currentUserId: number): Promise<any>;

  /**
   * 获取单个活动安排详情
   * @param id 活动安排ID
   * @param withStaff 是否包含人员安排
   * @param withResources 是否包含资源配置
   * @returns 活动安排详情
   */
  getArrangement(id: number, withStaff?: boolean, withResources?: boolean): Promise<any>;

  /**
   * 更新活动安排
   * @param id 活动安排ID
   * @param params 更新参数
   * @param currentUserId 当前用户ID
   * @returns 更新后的活动安排
   */
  updateArrangement(id: number, params: ActivityArrangementUpdateParams, currentUserId: number): Promise<any>;

  /**
   * 删除活动安排
   * @param id 活动安排ID
   * @returns 操作结果
   */
  deleteArrangement(id: number): Promise<boolean>;

  /**
   * 查询活动安排列表
   * @param params 查询参数
   * @returns 活动安排列表和总数
   */
  getArrangements(params: ActivityArrangementQueryParams): Promise<{rows: any[], count: number}>;

  /**
   * 变更活动安排状态
   * @param id 活动安排ID
   * @param status 新状态
   * @param currentUserId 当前用户ID
   * @returns 更新后的活动安排
   */
  changeStatus(id: number, status: number, currentUserId: number): Promise<any>;

  /**
   * 添加/更新活动人员安排
   * @param arrangementId 活动安排ID
   * @param staffParams 人员安排参数数组
   * @param currentUserId 当前用户ID
   * @returns 操作结果
   */
  updateStaffArrangements(arrangementId: number, staffParams: ActivityStaffArrangementParams[], currentUserId: number): Promise<any[]>;

  /**
   * 删除活动人员安排
   * @param staffId 人员安排ID
   * @returns 操作结果
   */
  deleteStaffArrangement(staffId: number): Promise<boolean>;

  /**
   * 添加/更新活动资源配置
   * @param arrangementId 活动安排ID
   * @param resourceParams 资源配置参数数组
   * @param currentUserId 当前用户ID
   * @returns 操作结果
   */
  updateResourceConfigs(arrangementId: number, resourceParams: ActivityResourceConfigParams[], currentUserId: number): Promise<any[]>;

  /**
   * 删除活动资源配置
   * @param resourceId 资源配置ID
   * @returns 操作结果
   */
  deleteResourceConfig(resourceId: number): Promise<boolean>;

  /**
   * 提交活动评价
   * @param arrangementId 活动安排ID
   * @param params 评价参数
   * @param currentUserId 当前用户ID
   * @returns 创建的评价
   */
  submitEvaluation(arrangementId: number, params: ActivityEvaluationParams, currentUserId: number): Promise<any>;

  /**
   * 获取活动计划下的统计信息
   * @param planId 活动计划ID
   * @returns 统计信息
   */
  getArrangementStats(planId: number): Promise<ActivityArrangementStats>;

  /**
   * 复制活动安排
   * @param sourceId 源活动安排ID
   * @param targetPlanId 目标计划ID (可选，默认与源相同)
   * @param currentUserId 当前用户ID
   * @returns 复制的活动安排
   */
  duplicateArrangement(sourceId: number, targetPlanId: number | null, currentUserId: number): Promise<any>;

  /**
   * 检查时间冲突
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @param excludeId 排除的活动安排ID
   * @returns 是否存在冲突
   */
  checkTimeConflicts(startTime: Date, endTime: Date, excludeId?: number): Promise<{hasConflict: boolean, conflictArrangements: any[]}>;
} 