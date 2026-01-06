/**
 * 活动报名服务接口定义
 */

export interface ActivityRegistrationData {
  activityId: number;             // 活动ID
  userId: number;                 // 用户ID
  participantName: string;        // 参与者姓名
  participantPhone: string;       // 参与者电话
  participantEmail?: string;      // 参与者邮箱
  participantCount: number;       // 参与人数
  status: 'pending' | 'confirmed' | 'cancelled' | 'attended' | 'absent'; // 状态
  remark?: string;                // 备注
  formData?: any;                 // 表单数据
  paymentStatus?: 'unpaid' | 'paid' | 'refunded'; // 支付状态
  paymentAmount?: number;         // 支付金额
  paymentTime?: Date;             // 支付时间
}

export interface ActivityRegistration extends ActivityRegistrationData {
  id: number;
  registrationTime: Date;         // 报名时间
  confirmationTime?: Date;        // 确认时间
  cancellationTime?: Date;        // 取消时间
  cancellationReason?: string;    // 取消原因
  checkInTime?: Date;             // 签到时间
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityRegistrationQuery {
  activityId?: number;
  userId?: number;
  participantName?: string;
  participantPhone?: string;
  status?: string;
  paymentStatus?: string;
  registrationTimeFrom?: Date;
  registrationTimeTo?: Date;
  page?: number;
  pageSize?: number;
}

export interface IActivityRegistrationService {
  /**
   * 创建活动报名
   * @param data 报名数据
   */
  createRegistration(data: ActivityRegistrationData): Promise<ActivityRegistration>;
  
  /**
   * 获取报名详情
   * @param id 报名ID
   */
  getRegistrationById(id: number): Promise<ActivityRegistration>;
  
  /**
   * 更新报名信息
   * @param id 报名ID
   * @param data 报名数据
   */
  updateRegistration(id: number, data: Partial<ActivityRegistrationData>): Promise<ActivityRegistration>;
  
  /**
   * 取消报名
   * @param id 报名ID
   * @param reason 取消原因
   */
  cancelRegistration(id: number, reason: string): Promise<ActivityRegistration>;
  
  /**
   * 确认报名
   * @param id 报名ID
   */
  confirmRegistration(id: number): Promise<ActivityRegistration>;
  
  /**
   * 活动签到
   * @param id 报名ID
   */
  checkInRegistration(id: number): Promise<ActivityRegistration>;
  
  /**
   * 标记缺席
   * @param id 报名ID
   */
  markAbsent(id: number): Promise<ActivityRegistration>;
  
  /**
   * 查询报名列表
   * @param query 查询条件
   */
  queryRegistrations(query: ActivityRegistrationQuery): Promise<{
    total: number;
    items: ActivityRegistration[];
    page: number;
    pageSize: number;
  }>;
  
  /**
   * 获取用户的报名记录
   * @param userId 用户ID
   * @param status 报名状态
   */
  getUserRegistrations(userId: number, status?: string): Promise<ActivityRegistration[]>;
  
  /**
   * 获取活动的报名记录
   * @param activityId 活动ID
   * @param status 报名状态
   */
  getActivityRegistrations(activityId: number, status?: string): Promise<ActivityRegistration[]>;
} 