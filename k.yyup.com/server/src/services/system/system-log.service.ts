import { SystemLog, SystemLogAttributes, SystemLogCreationAttributes, LogLevel, SystemLogType, SystemLogStatus } from '../../models/system-log.model';
import { Op, WhereOptions } from 'sequelize';

// 服务内部的分页和排序选项接口
interface LogQueryOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// 日志过滤条件接口
interface LogFilterParams {
  level?: LogLevel;
  type?: SystemLogType;
  status?: SystemLogStatus;
  userId?: number;
  moduleName?: string;
  startDate?: Date;
  endDate?: Date;
  keyword?: string;
}

export class SystemLogService {
  /**
   * 创建日志
   * @param data 日志数据
   * @returns 创建的日志
   */
  async createLog(data: SystemLogCreationAttributes): Promise<SystemLog> {
    return SystemLog.create(data);
  }

  /**
   * 批量创建日志
   * @param data 日志数据数组
   * @returns 创建的日志数组
   */
  async createLogBatch(data: SystemLogCreationAttributes[]): Promise<SystemLog[]> {
    return SystemLog.bulkCreate(data);
  }

  /**
   * 获取日志列表
   * @param options 分页和排序选项
   * @param filters 过滤条件
   * @returns 日志列表和总数
   */
  async getLogs(
    options: LogQueryOptions,
    filters: LogFilterParams
  ): Promise<{ rows: SystemLog[]; count: number }> {
    const { page = 1, pageSize = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = options;
    const offset = (page - 1) * pageSize;

    const where: any = {};

    if (filters.level) where.level = filters.level;
    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;
    if (filters.userId) where.userId = filters.userId;
    if (filters.moduleName) where.moduleName = { [Op.like]: `%${filters.moduleName}%` };

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt[Op.gte] = filters.startDate;
      if (filters.endDate) where.createdAt[Op.lte] = filters.endDate;
    }

    if (filters.keyword) {
      where[Op.or] = [
        { message: { [Op.like]: `%${filters.keyword}%` } },
        { username: { [Op.like]: `%${filters.keyword}%` } },
        { ipAddress: { [Op.like]: `%${filters.keyword}%` } },
      ];
    }

    return SystemLog.findAndCountAll({
      where,
      limit: pageSize,
      offset,
      order: [[sortBy, sortOrder]],
    });
  }

  /**
   * 获取日志详情
   * @param id 日志ID
   * @returns 日志详情
   */
  async getLogById(id: number): Promise<SystemLog> {
    const log = await SystemLog.findByPk(id);
    if (!log) {
      throw new Error('日志不存在'); // 或者使用自定义的ApiError
    }
    return log;
  }

  /**
   * 删除日志
   * @param id 日志ID
   * @returns 是否成功
   */
  async deleteLog(id: number): Promise<boolean> {
    const result = await SystemLog.destroy({ where: { id } });
    return result > 0;
  }

  /**
   * 批量删除日志
   * @param ids 日志ID数组
   * @returns 删除数量
   */
  async batchDeleteLogs(ids: number[]): Promise<number> {
    return SystemLog.destroy({
      where: { id: { [Op.in]: ids } },
    });
  }

  /**
   * 清空日志
   * @param type 可选的日志类型
   * @returns 删除数量
   */
  async clearLogs(type?: SystemLogType): Promise<number> {
    const where: any = {};
    if (type) {
      where.type = type;
    }
    return SystemLog.destroy({ where });
  }

  /**
   * 导出日志
   * @param filters 过滤条件
   * @returns 日志列表（用于导出）
   */
  async exportLogs(filters: LogFilterParams): Promise<SystemLog[]> {
    const options: LogQueryOptions = { sortBy: 'createdAt', sortOrder: 'DESC' };
    // 忽略分页，导出所有匹配的日志
    const { rows } = await this.getLogs({ ...options, page: 1, pageSize: 99999 }, filters);
    return rows;
  }
}

// 导出服务实例
export default new SystemLogService();