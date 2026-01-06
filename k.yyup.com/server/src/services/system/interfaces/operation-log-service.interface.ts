/**
 * 操作日志服务接口定义
 */

export interface OperationLogData {
  userId: number;          // 操作用户ID
  username?: string;       // 操作用户名
  module: string;          // 操作模块
  action: string;          // 操作动作
  method: string;          // HTTP方法
  path: string;            // 请求路径
  ip: string;              // 操作IP
  userAgent?: string;      // 用户代理
  requestData?: any;       // 请求数据
  responseData?: any;      // 响应数据
  status: number;          // 状态码
  duration?: number;       // 操作耗时（毫秒）
  error?: string;          // 错误信息
}

export interface OperationLog extends OperationLogData {
  id: number;
  createdAt: Date;
}

export interface OperationLogQuery {
  userId?: number;
  module?: string;
  action?: string;
  startTime?: Date;
  endTime?: Date;
  status?: number;
  page?: number;
  pageSize?: number;
}

export interface IOperationLogService {
  /**
   * 记录操作日志
   * @param logData 日志数据
   */
  createLog(logData: OperationLogData): Promise<OperationLog>;
  
  /**
   * 查询操作日志
   * @param query 查询条件
   */
  queryLogs(query: OperationLogQuery): Promise<{
    total: number;
    items: OperationLog[];
    page: number;
    pageSize: number;
  }>;
  
  /**
   * 获取日志详情
   * @param id 日志ID
   */
  getLogById(id: number): Promise<OperationLog>;
  
  /**
   * 删除操作日志
   * @param id 日志ID
   */
  deleteLog(id: number): Promise<boolean>;
  
  /**
   * 清理过期日志
   * @param days 保留天数
   */
  cleanExpiredLogs(days: number): Promise<number>;
} 