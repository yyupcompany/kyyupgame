import { QueryTypes } from 'sequelize';
import { sequelize } from '../../init';

/**
 * 日程创建参数
 */
export interface CreateScheduleDto {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
}

/**
 * 日程更新参数
 */
export interface UpdateScheduleDto {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
}

/**
 * 日程查询参数
 */
export interface ScheduleQueryParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  location?: string;
  userId?: number;
}

export interface Schedule {
  id: number;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  user?: {
    id: number;
    username: string;
    realName: string;
  };
}

export class ScheduleService {
  /**
   * 创建日程
   */
  async createSchedule(data: CreateScheduleDto, userId: number): Promise<Schedule> {
    const transaction = await sequelize.transaction();

    try {
      const result = await sequelize.query(
        `INSERT INTO schedules 
         (title, description, start_time, end_time, location, user_id, created_at, updated_at)
         VALUES (:title, :description, :startTime, :endTime, :location, :userId, NOW(), NOW())`,
        {
          replacements: {
            title: data.title,
            description: data.description || null,
            startTime: data.startTime,
            endTime: data.endTime,
            location: data.location || null,
            userId
          },
          type: QueryTypes.INSERT,
          transaction
        }
      );

      const scheduleId = result[0];
      
      await transaction.commit();
      
      return this.getScheduleById(scheduleId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 获取日程列表
   */
  async getSchedules(params: ScheduleQueryParams = {}): Promise<{
    schedules: Schedule[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      location,
      userId
    } = params;

    const offset = (page - 1) * limit;
    
    // 构建查询条件
    let whereConditions = ['s.deleted_at IS NULL'];
    const replacements: any = { limit, offset };

    if (startDate) {
      whereConditions.push('s.start_time >= :startDate');
      replacements.startDate = startDate;
    }

    if (endDate) {
      whereConditions.push('s.end_time <= :endDate');
      replacements.endDate = endDate;
    }

    if (location) {
      whereConditions.push('s.location LIKE :location');
      replacements.location = `%${location}%`;
    }

    if (userId) {
      whereConditions.push('s.user_id = :userId');
      replacements.userId = userId;
    }

    const whereClause = whereConditions.join(' AND ');

    // 获取总数
    const countResult = await sequelize.query(
      `SELECT COUNT(*) as total
      FROM schedules s
      WHERE ${whereClause}`,
      {
        replacements,
        type: QueryTypes.SELECT
      }
    );

    const total = (countResult[0] as any)?.total || 0;

    // 获取数据
    const schedules = await sequelize.query(
      `SELECT 
        s.*,
        u.id as user_id,
        u.username as user_username,
        u.real_name as user_real_name
      FROM schedules s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE ${whereClause}
      ORDER BY s.start_time ASC
      LIMIT :limit OFFSET :offset`,
      {
        replacements,
        type: QueryTypes.SELECT
      }
    );

    return {
      schedules: schedules.map(this.formatSchedule),
      total: Number(total),
      page,
      limit
    };
  }

  /**
   * 根据ID获取日程
   */
  async getScheduleById(id: number): Promise<Schedule> {
    const schedules = await sequelize.query(
      `SELECT 
        s.*,
        u.id as user_id,
        u.username as user_username,
        u.real_name as user_real_name
      FROM schedules s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.id = :id AND s.deleted_at IS NULL`,
      {
        replacements: { id },
        type: QueryTypes.SELECT
      }
    );

    if (!schedules.length) {
      throw new Error('日程不存在');
    }

    return this.formatSchedule(schedules[0]);
  }

  /**
   * 更新日程
   */
  async updateSchedule(id: number, data: UpdateScheduleDto): Promise<Schedule> {
    const transaction = await sequelize.transaction();

    try {
      // 检查日程是否存在
      await this.getScheduleById(id);

      // 构建更新字段
      const updateFields = [];
      const replacements: any = { id };

      if (data.title !== undefined) {
        updateFields.push('title = :title');
        replacements.title = data.title;
      }

      if (data.description !== undefined) {
        updateFields.push('description = :description');
        replacements.description = data.description;
      }

      if (data.startTime !== undefined) {
        updateFields.push('start_time = :startTime');
        replacements.startTime = data.startTime;
      }

      if (data.endTime !== undefined) {
        updateFields.push('end_time = :endTime');
        replacements.endTime = data.endTime;
      }

      if (data.location !== undefined) {
        updateFields.push('location = :location');
        replacements.location = data.location;
      }

      if (updateFields.length === 0) {
        await transaction.rollback();
        return this.getScheduleById(id);
      }

      updateFields.push('updated_at = NOW()');

      await sequelize.query(
        `UPDATE schedules SET ${updateFields.join(', ')} WHERE id = :id`,
        {
          replacements,
          type: QueryTypes.UPDATE,
          transaction
        }
      );

      await transaction.commit();
      
      return this.getScheduleById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 删除日程
   */
  async deleteSchedule(id: number): Promise<void> {
    const transaction = await sequelize.transaction();

    try {
      // 检查日程是否存在
      await this.getScheduleById(id);

      await sequelize.query(
        'UPDATE schedules SET deleted_at = NOW() WHERE id = :id',
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
   * 获取日程统计
   */
  async getScheduleStatistics(userId?: number): Promise<{
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  }> {
    let whereClause = 'deleted_at IS NULL';
    const replacements: any = {};

    if (userId) {
      whereClause += ' AND user_id = :userId';
      replacements.userId = userId;
    }

    const result = await sequelize.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN DATE(start_time) = CURDATE() THEN 1 ELSE 0 END) as today,
        SUM(CASE WHEN YEARWEEK(start_time, 1) = YEARWEEK(CURDATE(), 1) THEN 1 ELSE 0 END) as thisWeek,
        SUM(CASE WHEN YEAR(start_time) = YEAR(CURDATE()) AND MONTH(start_time) = MONTH(CURDATE()) THEN 1 ELSE 0 END) as thisMonth
      FROM schedules 
      WHERE ${whereClause}`,
      {
        replacements,
        type: QueryTypes.SELECT
      }
    );

    const stats = (result[0] as any) || {};
    return {
      total: Number(stats.total) || 0,
      today: Number(stats.today) || 0,
      thisWeek: Number(stats.thisWeek) || 0,
      thisMonth: Number(stats.thisMonth) || 0
    };
  }

  /**
   * 获取日历视图数据
   */
  async getCalendarView(year: number, month: number, userId?: number): Promise<Schedule[]> {
    // 输入验证
    if (year < 1900 || year > 2100) {
      throw new Error('年份必须在1900-2100之间');
    }
    if (month < 1 || month > 12) {
      throw new Error('月份必须在1-12之间');
    }

    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    
    // 安全计算该月的最后一天，防止无效日期
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
    
    // 验证生成的日期是否有效
    const testDate = new Date(endDate);
    if (testDate.getDate() !== lastDay) {
      throw new Error(`无效的日期: ${endDate}`);
    }

    console.log(`[日历视图] 查询范围: ${startDate} 到 ${endDate} (${lastDay}天)`);

    let whereClause = 's.deleted_at IS NULL AND s.start_time >= :startDate AND s.start_time <= :endDate';
    const replacements: any = { startDate, endDate };

    if (userId) {
      whereClause += ' AND s.user_id = :userId';
      replacements.userId = userId;
    }

    const schedules = await sequelize.query(
      `SELECT 
        s.*,
        u.id as user_id,
        u.username as user_username,
        u.real_name as user_real_name
      FROM schedules s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE ${whereClause}
      ORDER BY s.start_time ASC`,
      {
        replacements,
        type: QueryTypes.SELECT
      }
    );

    return schedules.map(this.formatSchedule);
  }

  /**
   * 格式化日程数据
   */
  private formatSchedule(row: any): Schedule {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      startTime: row.start_time,
      endTime: row.end_time,
      location: row.location,
      userId: row.user_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
      user: row.user_username ? {
        id: row.user_id,
        username: row.user_username,
        realName: row.user_real_name
      } : undefined
    };
  }
}

// 导出服务实例
export default new ScheduleService(); 