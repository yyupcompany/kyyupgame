/**
 * 活动计划服务接口定义
 */

export interface ActivityPlanData {
  name: string;                   // 活动名称
  description: string;            // 活动描述
  type: string;                   // 活动类型
  startTime: Date;                // 开始时间
  endTime: Date;                  // 结束时间
  location: string;               // 活动地点
  capacity: number;               // 活动容量
  fee?: number;                   // 活动费用
  registrationStartTime: Date;    // 报名开始时间
  registrationEndTime: Date;      // 报名结束时间
  targetAudience?: string;        // 目标受众
  status: 'draft' | 'published' | 'cancelled' | 'completed';  // 活动状态
  cover?: string;                 // 封面图片
  agenda?: any;                   // 活动议程
  organizer?: string;             // 组织者
  contacts?: string[];            // 联系人
}

export interface ActivityPlan extends ActivityPlanData {
  id: number;
  currentRegistrations: number;   // 当前报名人数
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityPlanQuery {
  name?: string;
  type?: string;
  status?: string;
  startTimeFrom?: Date;
  startTimeTo?: Date;
  registrationStatus?: 'upcoming' | 'ongoing' | 'closed';
  page?: number;
  pageSize?: number;
}

export interface IActivityPlanService {
  /**
   * 创建活动计划
   * @param data 活动计划数据
   */
  createActivityPlan(data: ActivityPlanData): Promise<ActivityPlan>;
  
  /**
   * 获取活动计划详情
   * @param id 活动计划ID
   */
  getActivityPlanById(id: number): Promise<ActivityPlan>;
  
  /**
   * 更新活动计划
   * @param id 活动计划ID
   * @param data 活动计划数据
   */
  updateActivityPlan(id: number, data: Partial<ActivityPlanData>): Promise<ActivityPlan>;
  
  /**
   * 删除活动计划
   * @param id 活动计划ID
   */
  deleteActivityPlan(id: number): Promise<boolean>;
  
  /**
   * 查询活动计划列表
   * @param query 查询条件
   */
  queryActivityPlans(query: ActivityPlanQuery): Promise<{
    total: number;
    items: ActivityPlan[];
    page: number;
    pageSize: number;
  }>;
  
  /**
   * 发布活动计划
   * @param id 活动计划ID
   */
  publishActivityPlan(id: number): Promise<ActivityPlan>;
  
  /**
   * 取消活动计划
   * @param id 活动计划ID
   * @param reason 取消原因
   */
  cancelActivityPlan(id: number, reason: string): Promise<ActivityPlan>;
  
  /**
   * 完成活动计划
   * @param id 活动计划ID
   */
  completeActivityPlan(id: number): Promise<ActivityPlan>;
} 