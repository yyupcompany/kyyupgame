import { DatabaseService } from './database.service';
import { TaskLogService } from './task-log.service';

// 简化的任务接口
export interface Task {
  id?: number;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  type?: string;
  creator_id: number;
  assignee_id?: number;
  progress: number;
  due_date?: Date;
  completed_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface TaskFilters {
  status?: string;
  priority?: string;
  type?: string;
  assignee_id?: number;
  creator_id?: number;
  related_type?: string;
  related_id?: number;
  keyword?: string;
}

export interface TaskQueryOptions {
  page: number;
  limit: number;
  filters: TaskFilters;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
}

export class TaskService {
  private db: DatabaseService;
  private logService: TaskLogService;

  constructor() {
    this.db = new DatabaseService();
    this.logService = new TaskLogService();
  }

  /**
   * 获取任务列表
   */
  async getTasks(options: TaskQueryOptions) {
    const { page, limit, filters, sortBy, sortOrder } = options;
    const offset = (page - 1) * limit;

    // 构建WHERE条件
    const conditions: string[] = [];
    const params: any[] = [];

    if (filters.status) {
      conditions.push('status = ?');
      params.push(filters.status);
    }

    if (filters.priority) {
      conditions.push('priority = ?');
      params.push(filters.priority);
    }

    if (filters.assignee_id) {
      conditions.push('assignee_id = ?');
      params.push(filters.assignee_id);
    }

    if (filters.creator_id) {
      conditions.push('creator_id = ?');
      params.push(filters.creator_id);
    }

    if (filters.type) {
      conditions.push('type = ?');
      params.push(filters.type);
    }

    if (filters.keyword) {
      conditions.push('(title LIKE ? OR description LIKE ?)');
      params.push(`%${filters.keyword}%`, `%${filters.keyword}%`);
    }

    // 验证排序字段
    const allowedSortFields = ['id', 'title', 'status', 'priority', 'created_at', 'updated_at', 'due_date'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    // 构建SQL查询
    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    
    // 查询总数
    const countSql = `SELECT COUNT(*) as total FROM tasks ${whereClause}`;
    const countResult = await this.db.query(countSql, params);
    const total = countResult[0]?.total || 0;

    // 查询数据
    const dataSql = `SELECT * FROM tasks ${whereClause} ORDER BY ${safeSortBy} ${safeSortOrder} LIMIT ${parseInt(limit as unknown as string)} OFFSET ${offset}`;
    const tasks = await this.db.query(dataSql, params);

    return {
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 根据ID获取任务详情
   */
  async getTaskById(id: number): Promise<any | null> {
    const tasks = await this.db.query('SELECT * FROM tasks WHERE id = ?', [id]);
    return tasks.length > 0 ? tasks[0] : null;
  }

  /**
   * 获取任务统计
   */
  async getTaskStats(filters?: number | { userId?: number; dateRange?: number; groupBy?: string }) {
    let assignee_id: number | undefined;
    if (typeof filters === 'number') {
      assignee_id = filters;
    } else if (filters && typeof filters === 'object') {
      assignee_id = filters.userId;
    }

    const whereClause = assignee_id ? 'WHERE assignee_id = ?' : '';
    const params = assignee_id ? [assignee_id] : [];

    const [totalResult] = await this.db.query(`SELECT COUNT(*) as count FROM tasks ${whereClause}`, params);
    const [pendingResult] = await this.db.query(`SELECT COUNT(*) as count FROM tasks WHERE status = 'pending' ${whereClause ? 'AND ' + whereClause.replace('WHERE', '') : ''}`, params);
    const [inProgressResult] = await this.db.query(`SELECT COUNT(*) as count FROM tasks WHERE status = 'in_progress' ${whereClause ? 'AND ' + whereClause.replace('WHERE', '') : ''}`, params);
    const [completedResult] = await this.db.query(`SELECT COUNT(*) as count FROM tasks WHERE status = 'completed' ${whereClause ? 'AND ' + whereClause.replace('WHERE', '') : ''}`, params);

    const total = totalResult?.count || 0;
    const completed = completedResult?.count || 0;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      totalTasks: total,
      pendingTasks: pendingResult?.count || 0,
      inProgressTasks: inProgressResult?.count || 0,
      completedTasks: completed,
      overdueTasks: 0,
      completionRate,
      overdueRate: 0,
      avgCompletionTime: 0
    };
  }

  /**
   * 创建任务
   */
  async createTask(taskData: any): Promise<any> {
    const result = await this.db.query(
      'INSERT INTO tasks (title, description, priority, status, type, creator_id, assignee_id, progress, due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [taskData.title, taskData.description || '', taskData.priority || 'medium', taskData.status || 'pending', taskData.type || 'general', taskData.creator_id, taskData.assignee_id || null, 0, taskData.due_date || null]
    );
    return { id: result.insertId, ...taskData };
  }

  /**
   * 更新任务
   */
  async updateTask(taskId: number, updateData: any, userId?: number): Promise<any> {
    const fields: string[] = [];
    const values: any[] = [];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'id') {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(taskId);
    await this.db.query(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.getTaskById(taskId);
  }

  /**
   * 删除任务
   */
  async deleteTask(taskId: number, userId?: number): Promise<void> {
    await this.db.query('DELETE FROM tasks WHERE id = ?', [taskId]);
  }

  /**
   * 更新任务状态
   */
  async updateTaskStatus(taskId: number, status: string, userId?: number): Promise<any> {
    await this.db.query('UPDATE tasks SET status = ? WHERE id = ?', [status, taskId]);
    return this.getTaskById(taskId);
  }

  /**
   * 更新任务进度
   */
  async updateTaskProgress(taskId: number, progress: number, userId?: number): Promise<any> {
    await this.db.query('UPDATE tasks SET progress = ? WHERE id = ?', [progress, taskId]);
    return this.getTaskById(taskId);
  }

  /**
   * 从模板创建任务
   */
  async createTaskFromTemplate(templateId: number, data: any, userId?: number): Promise<any> {
    // TODO: 实现从模板创建任务的逻辑
    const taskData = {
      ...data,
      creator_id: userId || data.creator_id
    };
    return this.createTask(taskData);
  }

  /**
   * 获取任务统计（按日期分组）
   */
  async getTaskStatsByDateRange(filters: any): Promise<any> {
    // TODO: 实现日期范围统计
    const userId = typeof filters === 'number' ? filters : filters?.userId;
    return this.getTaskStats(userId);
  }
}
