import { DatabaseService } from './database.service';

export interface TaskLog {
  id?: number;
  task_id: number;
  user_id: number;
  action: string;
  old_value?: any;
  new_value?: any;
  description?: string;
  ip_address?: string;
  user_agent?: string;
  created_at?: Date;
}

export class TaskLogService {
  private db: DatabaseService;

  constructor() {
    this.db = new DatabaseService();
  }

  /**
   * 记录任务操作日志
   */
  async logAction(
    taskId: number,
    userId: number,
    action: string,
    oldValue: any = null,
    newValue: any = null,
    description?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const query = `
      INSERT INTO task_logs (
        task_id, user_id, action, old_value, new_value, description, ip_address, user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      taskId,
      userId,
      action,
      oldValue ? JSON.stringify(oldValue) : null,
      newValue ? JSON.stringify(newValue) : null,
      description,
      ipAddress,
      userAgent
    ];

    await this.db.query(query, params);
  }

  /**
   * 获取任务操作日志
   */
  async getTaskLogs(taskId: number, options: { page?: number; limit?: number } = {}): Promise<any> {
    const { page = 1, limit = 50 } = options;
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        tl.*,
        u.name as user_name,
        u.avatar as user_avatar
      FROM task_logs tl
      LEFT JOIN users u ON tl.user_id = u.id
      WHERE tl.task_id = ?
      ORDER BY tl.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const logs = await this.db.query(query, [taskId, limit, offset]);

    // 查询总数
    const countQuery = 'SELECT COUNT(*) as total FROM task_logs WHERE task_id = ?';
    const [countResult] = await this.db.query(countQuery, [taskId]);
    const total = countResult.total;

    // 处理日志数据
    const processedLogs = logs.map((log: any) => ({
      ...log,
      old_value: log.old_value ? JSON.parse(log.old_value) : null,
      new_value: log.new_value ? JSON.parse(log.new_value) : null
    }));

    return {
      data: processedLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 获取用户操作日志
   */
  async getUserLogs(userId: number, options: { page?: number; limit?: number } = {}): Promise<any> {
    const { page = 1, limit = 50 } = options;
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        tl.*,
        t.title as task_title,
        u.name as user_name
      FROM task_logs tl
      LEFT JOIN tasks t ON tl.task_id = t.id
      LEFT JOIN users u ON tl.user_id = u.id
      WHERE tl.user_id = ?
      ORDER BY tl.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const logs = await this.db.query(query, [userId, limit, offset]);

    // 查询总数
    const countQuery = 'SELECT COUNT(*) as total FROM task_logs WHERE user_id = ?';
    const [countResult] = await this.db.query(countQuery, [userId]);
    const total = countResult.total;

    // 处理日志数据
    const processedLogs = logs.map((log: any) => ({
      ...log,
      old_value: log.old_value ? JSON.parse(log.old_value) : null,
      new_value: log.new_value ? JSON.parse(log.new_value) : null
    }));

    return {
      data: processedLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 获取操作统计
   */
  async getActionStats(taskId?: number, userId?: number, dateRange?: number) {
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (taskId) {
      whereClause += ' AND task_id = ?';
      params.push(taskId);
    }

    if (userId) {
      whereClause += ' AND user_id = ?';
      params.push(userId);
    }

    if (dateRange) {
      whereClause += ' AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)';
      params.push(dateRange);
    }

    const query = `
      SELECT 
        action,
        COUNT(*) as count,
        DATE(created_at) as date
      FROM task_logs
      ${whereClause}
      GROUP BY action, DATE(created_at)
      ORDER BY date DESC, count DESC
    `;

    return await this.db.query(query, params);
  }

  /**
   * 清理旧日志
   */
  async cleanupOldLogs(daysToKeep: number = 90): Promise<number> {
    const query = `
      DELETE FROM task_logs 
      WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
    `;

    const result = await this.db.query(query, [daysToKeep]);
    return result.affectedRows;
  }

  /**
   * 获取最近的操作日志
   */
  async getRecentLogs(limit: number = 20): Promise<TaskLog[]> {
    const query = `
      SELECT 
        tl.*,
        t.title as task_title,
        u.name as user_name,
        u.avatar as user_avatar
      FROM task_logs tl
      LEFT JOIN tasks t ON tl.task_id = t.id
      LEFT JOIN users u ON tl.user_id = u.id
      ORDER BY tl.created_at DESC
      LIMIT ?
    `;

    const logs = await this.db.query(query, [limit]);

    return logs.map((log: any) => ({
      ...log,
      old_value: log.old_value ? JSON.parse(log.old_value) : null,
      new_value: log.new_value ? JSON.parse(log.new_value) : null
    }));
  }

  /**
   * 导出任务日志
   */
  async exportTaskLogs(taskId: number, format: 'json' | 'csv' = 'json'): Promise<any> {
    const query = `
      SELECT 
        tl.*,
        u.name as user_name
      FROM task_logs tl
      LEFT JOIN users u ON tl.user_id = u.id
      WHERE tl.task_id = ?
      ORDER BY tl.created_at ASC
    `;

    const logs = await this.db.query(query, [taskId]);

    const processedLogs = logs.map((log: any) => ({
      ...log,
      old_value: log.old_value ? JSON.parse(log.old_value) : null,
      new_value: log.new_value ? JSON.parse(log.new_value) : null
    }));

    if (format === 'csv') {
      return this.convertToCSV(processedLogs);
    }

    return processedLogs;
  }

  /**
   * 转换为CSV格式
   */
  private convertToCSV(logs: any[]): string {
    if (logs.length === 0) return '';

    const headers = ['时间', '用户', '操作', '描述', 'IP地址'];
    const csvRows = [headers.join(',')];

    logs.forEach(log => {
      const row = [
        log.created_at,
        log.user_name || '',
        log.action,
        log.description || '',
        log.ip_address || ''
      ];
      csvRows.push(row.map(field => `"${field}"`).join(','));
    });

    return csvRows.join('\n');
  }

  /**
   * 批量记录日志
   */
  async logBatchActions(logs: Partial<TaskLog>[]): Promise<void> {
    if (logs.length === 0) return;

    const query = `
      INSERT INTO task_logs (
        task_id, user_id, action, old_value, new_value, description, ip_address, user_agent
      ) VALUES ?
    `;

    const values = logs.map(log => [
      log.task_id,
      log.user_id,
      log.action,
      log.old_value ? JSON.stringify(log.old_value) : null,
      log.new_value ? JSON.stringify(log.new_value) : null,
      log.description,
      log.ip_address,
      log.user_agent
    ]);

    await this.db.query(query, [values]);
  }
}
