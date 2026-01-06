import { SystemConfig, ConfigValueType } from '../../models/system-config.model';
import { ApiError } from '../../utils/apiError';
import { QueryTypes, Transaction } from 'sequelize';
import { sequelize } from '../../init';

/**
 * 系统配置创建参数
 */
export interface CreateSystemConfigDto {
  groupKey: string;
  configKey: string;
  configValue: string;
  valueType: ConfigValueType;
  description: string;
  isSystem?: boolean;
  isReadonly?: boolean;
  sortOrder?: number;
  creatorId?: number;
}

/**
 * 系统配置更新参数
 */
export interface UpdateSystemConfigDto {
  groupKey?: string;
  configKey?: string;
  configValue?: string;
  valueType?: ConfigValueType;
  description?: string;
  isSystem?: boolean;
  isReadonly?: boolean;
  sortOrder?: number;
  updaterId?: number;
}

/**
 * 系统配置查询参数
 */
export interface SystemConfigQueryParams {
  groupKey?: string;
  keyword?: string;
  isSystem?: boolean;
  isReadonly?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export class SystemConfigService {
  /**
   * 创建系统配置
   */
  async createSystemConfig(data: CreateSystemConfigDto): Promise<SystemConfig> {
    const transaction = await sequelize.transaction();
    
    try {
      // 检查配置键是否已存在
      const existingConfig = await sequelize.query(
        `SELECT id FROM system_configs 
         WHERE group_key = :groupKey AND config_key = :configKey`,
        {
          replacements: { groupKey: data.groupKey, configKey: data.configKey },
          type: QueryTypes.SELECT,
          transaction
        }
      );

      if (existingConfig.length > 0) {
        throw ApiError.badRequest('配置键已存在');
      }

      // 创建配置
      const [result] = await sequelize.query(
        `INSERT INTO system_configs 
         (group_key, config_key, config_value, description, is_system, created_at, updated_at)
         VALUES (:groupKey, :configKey, :configValue, :description, :isSystem, NOW(), NOW())`,
        {
          replacements: {
            groupKey: data.groupKey,
            configKey: data.configKey,
            configValue: data.configValue,
            description: data.description,
            isSystem: data.isSystem || false
          },
          type: QueryTypes.INSERT,
          transaction
        }
      );

      await transaction.commit();

      // 返回创建的配置
      return await this.getSystemConfigById(result as number);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 获取系统配置列表
   */
  async getSystemConfigs(params: SystemConfigQueryParams): Promise<{
    rows: SystemConfig[];
    count: number;
  }> {
    const {
      groupKey,
      keyword,
      isSystem,
      isReadonly,
      page = 1,
      pageSize = 10,
      sortBy = 'updated_at',
      sortOrder = 'DESC'
    } = params;

    // 构建查询条件
    const conditions: string[] = [];
    const replacements: Record<string, any> = {};

    if (groupKey) {
      conditions.push('sc.group_key = :groupKey');
      replacements.groupKey = groupKey;
    }

    if (keyword) {
      conditions.push('(sc.config_key LIKE :keyword OR sc.description LIKE :keyword)');
      replacements.keyword = `%${keyword}%`;
    }

    if (isSystem !== undefined) {
      conditions.push('sc.is_system = :isSystem');
      replacements.isSystem = isSystem;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 计数查询
    const countQuery = `
      SELECT COUNT(*) as total
      FROM system_configs sc
      ${whereClause}
    `;

    // 数据查询
    const offset = (page - 1) * pageSize;
    const dataQuery = `
      SELECT 
        sc.id,
        sc.group_key as groupKey,
        sc.config_key as configKey,
        sc.config_value as configValue,
        sc.description,
        sc.is_system as isSystem,
        sc.created_at,
        sc.updated_at
      FROM system_configs sc
      ${whereClause}
      ORDER BY sc.${sortBy} ${sortOrder}
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
      ...item
    }));

    return { rows: rows as SystemConfig[], count: Number(count) };
  }

  /**
   * 获取系统配置详情
   */
  async getSystemConfigById(id: number): Promise<SystemConfig> {
    const query = `
      SELECT 
        sc.id,
        sc.group_key as groupKey,
        sc.config_key as configKey,
        sc.config_value as configValue,
        sc.description,
        sc.is_system as isSystem,
        sc.created_at,
        sc.updated_at
      FROM system_configs sc
      WHERE sc.id = :id
    `;

    const results = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.SELECT
    });

    const resultList = Array.isArray(results) ? results : [];
    const configData = resultList.length > 0 ? resultList[0] as Record<string, any> : null;

    if (!configData) {
      throw ApiError.notFound('系统配置不存在');
    }

    // 构造返回对象
    const config = {
      ...configData
    };

    return config as any;
  }

  /**
   * 更新系统配置
   */
  async updateSystemConfig(id: number, data: UpdateSystemConfigDto): Promise<SystemConfig> {
    const transaction = await sequelize.transaction();

    try {
      // 检查配置是否存在
      const existingConfig = await this.getSystemConfigById(id);

      // 如果更新配置键，检查是否冲突
      if (data.groupKey || data.configKey) {
        const groupKey = data.groupKey || existingConfig.groupKey;
        const configKey = data.configKey || existingConfig.configKey;

        const conflictConfig = await sequelize.query(
          `SELECT id FROM system_configs 
           WHERE group_key = :groupKey AND config_key = :configKey 
           AND id != :id`,
          {
            replacements: { groupKey, configKey, id },
            type: QueryTypes.SELECT,
            transaction
          }
        );

        if (conflictConfig.length > 0) {
          throw ApiError.badRequest('配置键已存在');
        }
      }

      // 构建更新字段
      const updateFields: string[] = [];
      const replacements: Record<string, any> = { id };

      if (data.groupKey !== undefined) {
        updateFields.push('group_key = :groupKey');
        replacements.groupKey = data.groupKey;
      }
      if (data.configKey !== undefined) {
        updateFields.push('config_key = :configKey');
        replacements.configKey = data.configKey;
      }
      if (data.configValue !== undefined) {
        updateFields.push('config_value = :configValue');
        replacements.configValue = data.configValue;
      }
      if (data.description !== undefined) {
        updateFields.push('description = :description');
        replacements.description = data.description;
      }
      if (data.isSystem !== undefined) {
        updateFields.push('is_system = :isSystem');
        replacements.isSystem = data.isSystem;
      }

      updateFields.push('updated_at = NOW()');

      // 执行更新
      await sequelize.query(
        `UPDATE system_configs SET ${updateFields.join(', ')} WHERE id = :id`,
        {
          replacements,
          type: QueryTypes.UPDATE,
          transaction
        }
      );

      await transaction.commit();

      // 返回更新后的配置
      return await this.getSystemConfigById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 删除系统配置
   */
  async deleteSystemConfig(id: number): Promise<void> {
    const transaction = await sequelize.transaction();

    try {
      // 检查配置是否存在
      const existingConfig = await this.getSystemConfigById(id);

      // 检查是否为系统配置
      if (existingConfig.isSystem) {
        throw ApiError.badRequest('系统配置不能删除');
      }

      // 硬删除（因为表中没有deleted_at字段）
      await sequelize.query(
        `DELETE FROM system_configs WHERE id = :id`,
        {
          replacements: { id },
          type: QueryTypes.DELETE,
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
   * 根据配置键获取配置值
   */
  async getConfigValue(groupKey: string, configKey: string): Promise<string | null> {
    const query = `
      SELECT config_value as value 
      FROM system_configs 
      WHERE group_key = :groupKey AND config_key = :configKey
    `;

    const results = await sequelize.query(query, {
      replacements: { groupKey, configKey },
      type: QueryTypes.SELECT
    });

    const resultList = Array.isArray(results) ? results : [];
    const configData = resultList.length > 0 ? resultList[0] as Record<string, any> : null;

    return configData ? configData.value : null;
  }
}

// 导出服务实例
export default new SystemConfigService(); 