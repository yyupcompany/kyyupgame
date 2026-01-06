import { Todo, TodoPriority, TodoStatus } from '../../models/todo.model';
import { ApiError } from '../../utils/apiError';
import { QueryTypes, Transaction } from 'sequelize';
import { sequelize } from '../../init';

/**
 * 待办事项创建参数
 */
export interface CreateTodoDto {
  title: string;
  description?: string;
  priority?: TodoPriority;
  status?: TodoStatus;
  dueDate?: Date;
  userId: number;
  assignedTo?: number;
  tags?: string[];
  relatedId?: number;
  relatedType?: string;
  notify?: boolean;
  notifyTime?: Date;
}

/**
 * 待办事项更新参数
 */
export interface UpdateTodoDto {
  title?: string;
  description?: string;
  priority?: TodoPriority;
  status?: TodoStatus;
  dueDate?: Date;
  completedDate?: Date;
  assignedTo?: number;
  tags?: string[];
  relatedId?: number;
  relatedType?: string;
  notify?: boolean;
  notifyTime?: Date;
}

/**
 * 待办事项查询参数
 */
export interface TodoQueryParams {
  userId?: number;
  assignedTo?: number;
  status?: TodoStatus;
  priority?: TodoPriority;
  keyword?: string;
  tags?: string[];
  relatedType?: string;
  dueDateStart?: Date;
  dueDateEnd?: Date;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export class TodoService {
  /**
   * 创建待办事项
   */
  async createTodo(data: CreateTodoDto): Promise<Todo> {
    const transaction = await sequelize.transaction();
    
    try {
      // 创建待办事项
      const [result] = await sequelize.query(
        `INSERT INTO todos 
         (title, description, priority, status, due_date, user_id, assigned_to, 
          tags, related_id, related_type, notify, notify_time, created_at, updated_at)
         VALUES (:title, :description, :priority, :status, :dueDate, :userId, :assignedTo,
                 :tags, :relatedId, :relatedType, :notify, :notifyTime, NOW(), NOW())`,
        {
          replacements: {
            title: data.title,
            description: data.description || null,
            priority: data.priority || TodoPriority.MEDIUM,
            status: data.status || TodoStatus.PENDING,
            dueDate: data.dueDate || null,
            userId: data.userId,
            assignedTo: data.assignedTo || null,
            tags: data.tags ? JSON.stringify(data.tags) : null,
            relatedId: data.relatedId || null,
            relatedType: data.relatedType || null,
            notify: data.notify || false,
            notifyTime: data.notifyTime || null
          },
          type: QueryTypes.INSERT,
          transaction
        }
      );

      await transaction.commit();

      // 返回创建的待办事项
      return await this.getTodoById(result as number);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 获取待办事项列表
   */
  async getTodos(params: TodoQueryParams): Promise<{
    rows: Todo[];
    count: number;
  }> {
    const {
      userId,
      assignedTo,
      status,
      priority,
      keyword,
      tags,
      relatedType,
      dueDateStart,
      dueDateEnd,
      page = 1,
      pageSize = 10,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = params;

    // 构建查询条件
    const conditions: string[] = ['t.deleted_at IS NULL'];
    const replacements: Record<string, any> = {};

    if (userId) {
      conditions.push('(t.user_id = :userId OR t.assigned_to = :userId)');
      replacements.userId = userId;
    }

    if (assignedTo) {
      conditions.push('t.assigned_to = :assignedTo');
      replacements.assignedTo = assignedTo;
    }

    if (status) {
      conditions.push('t.status = :status');
      replacements.status = status;
    }

    if (priority) {
      conditions.push('t.priority = :priority');
      replacements.priority = priority;
    }

    if (keyword) {
      conditions.push('(t.title LIKE :keyword OR t.description LIKE :keyword)');
      replacements.keyword = `%${keyword}%`;
    }

    if (tags && tags.length > 0) {
      const tagConditions = tags.map((_, index) => `JSON_CONTAINS(t.tags, :tag${index})`);
      conditions.push(`(${tagConditions.join(' OR ')})`);
      tags.forEach((tag, index) => {
        replacements[`tag${index}`] = JSON.stringify(tag);
      });
    }

    if (relatedType) {
      conditions.push('t.related_type = :relatedType');
      replacements.relatedType = relatedType;
    }

    if (dueDateStart) {
      conditions.push('t.due_date >= :dueDateStart');
      replacements.dueDateStart = dueDateStart;
    }

    if (dueDateEnd) {
      conditions.push('t.due_date <= :dueDateEnd');
      replacements.dueDateEnd = dueDateEnd;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 计数查询
    const countQuery = `
      SELECT COUNT(*) as total
      FROM todos t
      ${whereClause}
    `;

    // 数据查询
    const offset = (page - 1) * pageSize;
    const dataQuery = `
      SELECT 
        t.*,
        creator.id as creator_id,
        creator.username as creator_username,
        creator.real_name as creator_real_name,
        assignee.id as assignee_id,
        assignee.username as assignee_username,
        assignee.real_name as assignee_real_name
      FROM todos t
      LEFT JOIN users creator ON t.user_id = creator.id
      LEFT JOIN users assignee ON t.assigned_to = assignee.id
      ${whereClause}
      ORDER BY t.${sortBy} ${sortOrder}
      LIMIT :limit OFFSET :offset
    `;

    replacements.limit = pageSize;
    replacements.offset = offset;

    // 执行查询
    const [countResult, dataResult] = await Promise.all([
      sequelize.query(countQuery, {
        replacements,
        type: QueryTypes.SELECT
      }),
      sequelize.query(dataQuery, {
        replacements,
        type: QueryTypes.SELECT
      })
    ]);

    const countList = Array.isArray(countResult) ? countResult : [];
    const count = countList.length > 0 ? (countList[0] as Record<string, any>).total : 0;

    const dataList = Array.isArray(dataResult) ? dataResult : [];
    const rows = dataList.map((item: any) => ({
      ...item,
      tags: item.tags ? (
        typeof item.tags === 'string' 
          ? (item.tags.startsWith('[') ? JSON.parse(item.tags) : item.tags.split(',').map(t => t.trim()))
          : Array.isArray(item.tags) ? item.tags : null
      ) : null,
      user: item.creator_id ? {
        id: item.creator_id,
        username: item.creator_username,
        realName: item.creator_real_name
      } : null,
      assignee: item.assignee_id ? {
        id: item.assignee_id,
        username: item.assignee_username,
        realName: item.assignee_real_name
      } : null
    }));

    return { rows: rows as Todo[], count: Number(count) };
  }

  /**
   * 获取待办事项详情
   */
  async getTodoById(id: number): Promise<Todo> {
    const query = `
      SELECT 
        t.*,
        creator.id as creator_id,
        creator.username as creator_username,
        creator.real_name as creator_real_name,
        assignee.id as assignee_id,
        assignee.username as assignee_username,
        assignee.real_name as assignee_real_name
      FROM todos t
      LEFT JOIN users creator ON t.user_id = creator.id
      LEFT JOIN users assignee ON t.assigned_to = assignee.id
      WHERE t.id = :id AND t.deleted_at IS NULL
    `;

    const results = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.SELECT
    });

    const resultList = Array.isArray(results) ? results : [];
    const todoData = resultList.length > 0 ? resultList[0] as Record<string, any> : null;

    if (!todoData) {
      throw ApiError.notFound('待办事项不存在');
    }

    // 构造返回对象
    const todo = {
      ...todoData,
      tags: todoData.tags ? JSON.parse(todoData.tags) : null,
      user: todoData.creator_id ? {
        id: todoData.creator_id,
        username: todoData.creator_username,
        realName: todoData.creator_real_name
      } : null,
      assignee: todoData.assignee_id ? {
        id: todoData.assignee_id,
        username: todoData.assignee_username,
        realName: todoData.assignee_real_name
      } : null
    };

    return todo as any;
  }

  /**
   * 更新待办事项
   */
  async updateTodo(id: number, data: UpdateTodoDto): Promise<Todo> {
    const transaction = await sequelize.transaction();

    try {
      // 检查待办事项是否存在
      const existingTodo = await this.getTodoById(id);

      // 构建更新字段
      const updateFields: string[] = [];
      const replacements: Record<string, any> = { id };

      if (data.title !== undefined) {
        updateFields.push('title = :title');
        replacements.title = data.title;
      }
      if (data.description !== undefined) {
        updateFields.push('description = :description');
        replacements.description = data.description;
      }
      if (data.priority !== undefined) {
        updateFields.push('priority = :priority');
        replacements.priority = data.priority;
      }
      if (data.status !== undefined) {
        updateFields.push('status = :status');
        replacements.status = data.status;
        
        // 如果状态改为完成，设置完成时间
        if (data.status === TodoStatus.COMPLETED) {
          updateFields.push('completed_date = NOW()');
        }
      }
      if (data.dueDate !== undefined) {
        updateFields.push('due_date = :dueDate');
        replacements.dueDate = data.dueDate;
      }
      if (data.completedDate !== undefined) {
        updateFields.push('completed_date = :completedDate');
        replacements.completedDate = data.completedDate;
      }
      if (data.assignedTo !== undefined) {
        updateFields.push('assigned_to = :assignedTo');
        replacements.assignedTo = data.assignedTo;
      }
      if (data.tags !== undefined) {
        updateFields.push('tags = :tags');
        replacements.tags = data.tags ? JSON.stringify(data.tags) : null;
      }
      if (data.relatedId !== undefined) {
        updateFields.push('related_id = :relatedId');
        replacements.relatedId = data.relatedId;
      }
      if (data.relatedType !== undefined) {
        updateFields.push('related_type = :relatedType');
        replacements.relatedType = data.relatedType;
      }
      if (data.notify !== undefined) {
        updateFields.push('notify = :notify');
        replacements.notify = data.notify;
      }
      if (data.notifyTime !== undefined) {
        updateFields.push('notify_time = :notifyTime');
        replacements.notifyTime = data.notifyTime;
      }

      updateFields.push('updated_at = NOW()');

      // 执行更新
      await sequelize.query(
        `UPDATE todos SET ${updateFields.join(', ')} WHERE id = :id`,
        {
          replacements,
          type: QueryTypes.UPDATE,
          transaction
        }
      );

      await transaction.commit();

      // 返回更新后的待办事项
      return await this.getTodoById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 标记待办事项为完成
   */
  async markTodoCompleted(id: number): Promise<Todo> {
    return await this.updateTodo(id, {
      status: TodoStatus.COMPLETED,
      completedDate: new Date()
    });
  }

  /**
   * 删除待办事项
   */
  async deleteTodo(id: number): Promise<void> {
    const transaction = await sequelize.transaction();

    try {
      // 检查待办事项是否存在
      await this.getTodoById(id);

      // 软删除
      await sequelize.query(
        `UPDATE todos SET deleted_at = NOW() WHERE id = :id`,
        {
          replacements: { id },
          type: QueryTypes.UPDATE,
          transaction
        }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 获取用户的待办事项统计
   */
  async getTodoStats(userId: number): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    overdue: number;
  }> {
    const query = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as inProgress,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN (due_date < NOW() AND status != 'COMPLETED') THEN 1 ELSE 0 END) as overdue
      FROM todos 
      WHERE (user_id = :userId OR assigned_to = :userId) AND deleted_at IS NULL
    `;

    const results = await sequelize.query(query, {
      replacements: { userId },
      type: QueryTypes.SELECT
    });

    const resultList = Array.isArray(results) ? results : [];
    const stats = resultList.length > 0 ? resultList[0] as Record<string, any> : {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      overdue: 0
    };

    return {
      total: Number(stats.total),
      pending: Number(stats.pending),
      inProgress: Number(stats.inProgress),
      completed: Number(stats.completed),
      overdue: Number(stats.overdue)
    };
  }
}

// 导出服务实例
export default new TodoService();