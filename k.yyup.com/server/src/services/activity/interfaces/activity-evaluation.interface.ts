/**
 * 活动评价服务接口定义
 */

export interface ActivityEvaluationData {
  activityId: number;          // 活动ID
  userId: number;              // 用户ID
  rating: number;              // 评分(1-5)
  content: string;             // 评价内容
  tags?: string[];             // 标签
  images?: string[];           // 图片
  isAnonymous?: boolean;       // 是否匿名
  status: 'pending' | 'published' | 'rejected'; // 状态
}

export interface ActivityEvaluation extends ActivityEvaluationData {
  id: number;
  userName?: string;           // 用户名
  userAvatar?: string;         // 用户头像
  activityName?: string;       // 活动名称
  likes?: number;              // 点赞数
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityEvaluationQuery {
  activityId?: number;
  userId?: number;
  minRating?: number;
  maxRating?: number;
  status?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export interface ActivityEvaluationStats {
  activityId: number;
  totalCount: number;
  avgRating: number;
  ratingDistribution: {
    [rating: number]: number;  // 评分分布，如 { "1": 5, "2": 10, ... }
  };
  tagStats: {
    [tag: string]: number;     // 标签统计，如 { "服务好": 20, "环境好": 15, ... }
  };
}

export interface IActivityEvaluationService {
  /**
   * 创建活动评价
   * @param data 评价数据
   */
  createEvaluation(data: ActivityEvaluationData): Promise<ActivityEvaluation>;
  
  /**
   * 获取评价详情
   * @param id 评价ID
   */
  getEvaluationById(id: number): Promise<ActivityEvaluation>;
  
  /**
   * 更新评价
   * @param id 评价ID
   * @param data 评价数据
   */
  updateEvaluation(id: number, data: Partial<ActivityEvaluationData>): Promise<ActivityEvaluation>;
  
  /**
   * 删除评价
   * @param id 评价ID
   */
  deleteEvaluation(id: number): Promise<boolean>;
  
  /**
   * 审核评价
   * @param id 评价ID
   * @param approved 是否通过
   * @param rejectReason 拒绝原因
   */
  reviewEvaluation(id: number, approved: boolean, rejectReason?: string): Promise<ActivityEvaluation>;
  
  /**
   * 查询评价列表
   * @param query 查询条件
   */
  queryEvaluations(query: ActivityEvaluationQuery): Promise<{
    total: number;
    items: ActivityEvaluation[];
    page: number;
    pageSize: number;
  }>;
  
  /**
   * 获取活动评价统计
   * @param activityId 活动ID
   */
  getActivityEvaluationStats(activityId: number): Promise<ActivityEvaluationStats>;
  
  /**
   * 点赞评价
   * @param id 评价ID
   * @param userId 用户ID
   */
  likeEvaluation(id: number, userId: number): Promise<boolean>;
  
  /**
   * 取消点赞
   * @param id 评价ID
   * @param userId 用户ID
   */
  unlikeEvaluation(id: number, userId: number): Promise<boolean>;
} 