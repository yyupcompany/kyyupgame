import { Todo, TodoAttributes, TodoStatus } from '../../models/todo.model';
import { Schedule, ScheduleAttributes } from '../../models/schedule.model';
import { User } from '../../models/user.model';
import { ApiError } from '../../utils/apiError';
import { PaginationOptions } from '../../types/pagination';
import { Op, QueryTypes } from 'sequelize';
import { Class } from '../../models/class.model';
import { ScheduleCreationAttributes } from '../../models/schedule.model';
import { TodoCreationAttributes } from '../../models/todo.model';
import { sequelize } from '../../init';

interface TodoFilters {
  status?: TodoStatus;
  keyword?: string;
}

interface DateRangeOptions {
  startDate?: Date;
  endDate?: Date;
}

export class DashboardService {
  /**
   * 获取仪表盘统计数据
   * @param userId 用户ID
   */
  async getDashboardStats(userId: number): Promise<any> {
    const todoCount = await Todo.count({ where: { userId, status: TodoStatus.PENDING } });
    
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todaySchedules = await Schedule.findAll({
      where: {
        userId,
        startTime: {
          [Op.gte]: startOfDay,
        },
        endTime: {
          [Op.lte]: endOfDay,
        },
      },
      order: [['startTime', 'ASC']],
    });

    return {
      todoCount,
      todaySchedules,
      quickStats: {
        pendingTasks: todoCount,
        meetingsToday: todaySchedules.length,
        notifications: 0, // Placeholder
      },
    };
  }

  /**
   * 获取待办事项列表
   * @param userId 用户ID
   * @param options 分页选项
   * @param filters 过滤条件
   */
  async getTodos(userId: number, options: PaginationOptions, filters: TodoFilters): Promise<{ rows: Todo[], count: number }> {
    const { page = 1, pageSize = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    
    const where: any = { userId };
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.keyword) {
      where.title = { [Op.like]: `%${filters.keyword}%` };
    }

    return Todo.findAndCountAll({
      where,
      limit: Number(pageSize) > 0 ? Number(pageSize) : 10,
      offset: Number(page) > 0 ? (Number(page) - 1) * Number(pageSize) : 0,
      order: [[sortBy, sortOrder]],
    });
  }

  /**
   * 创建待办事项
   * @param data 待办事项数据
   */
  async createTodo(data: TodoCreationAttributes): Promise<Todo> {
    if (!data.title || !data.userId) {
      throw ApiError.badRequest('标题和用户ID是必填项');
    }
    return Todo.create(data);
  }

  /**
   * 更新待办事项状态
   * @param todoId 待办事项ID
   * @param status 新的状态
   * @param userId 用户ID
   */
  async updateTodoStatus(todoId: number, status: TodoStatus, userId: number): Promise<Todo | null> {
    const todo = await Todo.findOne({ where: { id: todoId, userId } });
    if (todo) {
      todo.status = status;
      if (status === TodoStatus.COMPLETED) {
        todo.completedDate = new Date();
      }
      await todo.save();
    }
    return todo;
  }

  /**
   * 删除待办事项
   * @param todoId 待办事项ID
   * @param userId 用户ID
   */
  async deleteTodo(todoId: number, userId: number): Promise<boolean> {
    const result = await Todo.destroy({ where: { id: todoId, userId } });
    return result > 0;
  }

  /**
   * 获取日程列表
   * @param userId 用户ID
   * @param options 日期范围选项
   */
  async getSchedules(userId: number, options: DateRangeOptions): Promise<any[]> {
    // 使用原生查询，因为数据库表结构与模型不完全匹配
    let whereClause = 'WHERE user_id = :userId AND deleted_at IS NULL';
    const replacements: any = { userId };
    
    if (options.startDate) {
      whereClause += ' AND start_time >= :startDate';
      replacements.startDate = options.startDate;
    }
    if (options.endDate) {
      whereClause += ' AND end_time <= :endDate';
      replacements.endDate = options.endDate;
    }

    const query = `
      SELECT 
        id,
        title,
        description,
        start_time as startTime,
        end_time as endTime,
        location,
        user_id as userId,
        created_at as createdAt,
        updated_at as updatedAt
      FROM schedules 
      ${whereClause}
      ORDER BY start_time ASC
    `;

    return sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements
    });
  }

  /**
   * 创建日程安排
   * @param data 日程数据
   */
  async createSchedule(data: ScheduleCreationAttributes): Promise<Schedule> {
    if (!data.title || !data.startTime || !data.userId) {
      throw ApiError.badRequest('标题、开始时间和用户ID是必填项');
    }
    return Schedule.create(data);
  }

  /**
   * 获取班级概览信息
   */
  async getClassesOverview(): Promise<any> {
    // 使用原生查询，因为数据库表结构与模型字段名不完全匹配
    const query = `
      SELECT
        id,
        name,
        code,
        type,
        grade,
        capacity,
        current_student_count as studentCount,
        classroom,
        status,
        created_at as createdAt,
        updated_at as updatedAt
      FROM classes
      WHERE deleted_at IS NULL
      ORDER BY type ASC, name ASC
    `;

    return sequelize.query(query, {
      type: QueryTypes.SELECT
    });
  }

  /**
   * 获取即将毕业人数统计
   * @param tenantDb 租户数据库名
   * @returns 毕业人数统计信息
   */
  async getUpcomingGraduationStats(tenantDb: string): Promise<any> {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12

    // 判断是今年9月还是明年9月
    let targetYear: number;
    let targetLabel: string;

    if (currentMonth < 9) {
      // 当前月份在9月之前，统计今年9月毕业人数
      targetYear = currentYear;
      targetLabel = `${currentYear}年9月`;
    } else {
      // 当前月份在9月及之后，统计明年9月毕业人数
      targetYear = currentYear + 1;
      targetLabel = `${currentYear + 1}年9月`;
    }

    // 查询目标年份9月毕业的学生人数
    const query = `
      SELECT COUNT(*) as count
      FROM ${tenantDb}.students
      WHERE deleted_at IS NULL
        AND graduation_date IS NOT NULL
        AND (
          (graduation_year = :targetYear)
          OR (YEAR(graduation_date) = :targetYear AND MONTH(graduation_date) = 9)
        )
    `;

    const [result] = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements: { targetYear }
    }) as [Record<string, any>];

    return {
      label: targetLabel,
      year: targetYear,
      count: parseInt(result?.count) || 0,
      month: 9
    };
  }

  /**
   * 获取预报名人数统计
   * @param tenantDb 租户数据库名
   * @returns 预报名统计信息（春季3月和秋季9月）
   */
  async getPreEnrollmentStats(tenantDb: string): Promise<any> {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12

    // 计算今年的春季和秋季
    let springYear = currentYear;
    let autumnYear = currentYear;

    // 如果当前月份超过3月，春季统计明年
    if (currentMonth > 3) {
      springYear = currentYear + 1;
    }

    // 如果当前月份超过9月，秋季统计明年
    if (currentMonth > 9) {
      autumnYear = currentYear + 1;
    }

    // 查询春季(3月)预报名人数
    const springQuery = `
      SELECT COUNT(*) as count
      FROM ${tenantDb}.enrollment_applications ea
      INNER JOIN ${tenantDb}.enrollment_plans ep ON ea.plan_id = ep.id
      WHERE ea.deleted_at IS NULL
        AND ep.deleted_at IS NULL
        AND ep.year = :springYear
        AND ep.semester = 1
        AND ea.status = 'approved'
    `;

    // 查询秋季(9月)预报名人数
    const autumnQuery = `
      SELECT COUNT(*) as count
      FROM ${tenantDb}.enrollment_applications ea
      INNER JOIN ${tenantDb}.enrollment_plans ep ON ea.plan_id = ep.id
      WHERE ea.deleted_at IS NULL
        AND ep.deleted_at IS NULL
        AND ep.year = :autumnYear
        AND ep.semester = 2
        AND ea.status = 'approved'
    `;

    const [springResult, autumnResult] = await Promise.all([
      sequelize.query(springQuery, {
        type: QueryTypes.SELECT,
        replacements: { springYear }
      }),
      sequelize.query(autumnQuery, {
        type: QueryTypes.SELECT,
        replacements: { autumnYear }
      })
    ]) as [Record<string, any>[], Record<string, any>[]];

    return {
      spring: {
        label: `${springYear}年3月`,
        year: springYear,
        month: 3,
        semester: 1,
        count: parseInt(springResult[0]?.count) || 0
      },
      autumn: {
        label: `${autumnYear}年9月`,
        year: autumnYear,
        month: 9,
        semester: 2,
        count: parseInt(autumnResult[0]?.count) || 0
      }
    };
  }
}

// 导出服务实例
export default new DashboardService();