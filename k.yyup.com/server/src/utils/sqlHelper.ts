import { QueryTypes, Transaction } from 'sequelize';
import { sequelize } from '../init';

/**
 * SQL辅助工具类
 * 提供常用的数据库操作方法
 */
export class SqlHelper {
  /**
   * 检查记录是否存在
   * @param table 表名
   * @param field 字段名
   * @param value 字段值
   * @param options 选项
   * @returns 是否存在
   */
  static async recordExists(
    table: string, 
    field: string, 
    value: any, 
    options: { 
      whereAddition?: string, 
      transaction?: Transaction,
      replacements?: Record<string, any>
    } = {}
  ): Promise<boolean> {
    const { whereAddition = '', transaction, replacements = {} } = options;
    const whereClause = `${field} = :value ${whereAddition ? 'AND ' + whereAddition : ''}`;
    const finalReplacements = { value, ...replacements };

    // 使用直接导入的sequelize实例
    const result = await sequelize.query(
      `SELECT 1 FROM ${table} WHERE ${whereClause} LIMIT 1`,
      {
        replacements: finalReplacements,
        type: QueryTypes.SELECT,
        transaction
      }
    );
    
    const rows = result as unknown as any[];
    return rows.length > 0;
  }

  /**
   * 获取单条记录
   * @param table 表名
   * @param field 字段名
   * @param value 字段值
   * @param options 选项
   * @returns 记录对象或null
   */
  static async getRecord(
    table: string, 
    field: string, 
    value: any, 
    options: { 
      fields?: string[],
      whereAddition?: string, 
      transaction?: Transaction,
      replacements?: Record<string, any>
    } = {}
  ): Promise<Record<string, any> | null> {
    const { fields = ['*'], whereAddition = '', transaction, replacements = {} } = options;
    const whereClause = `${field} = :value ${whereAddition ? 'AND ' + whereAddition : ''}`;
    const finalReplacements = { value, ...replacements };

    // 使用直接导入的sequelize实例
    const result = await sequelize.query(
      `SELECT ${fields.join(', ')} FROM ${table} WHERE ${whereClause} LIMIT 1`,
      {
        replacements: finalReplacements,
        type: QueryTypes.SELECT,
        transaction
      }
    );
    
    const rows = result as unknown as Record<string, any>[];
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * 获取多条记录
   * @param table 表名
   * @param options 选项
   * @returns 返回记录数组
   */
  static async getRecords(
    table: string,
    options: {
      fields?: string[],
      where?: string,
      replacements?: Record<string, any>,
      orderBy?: string,
      orderDir?: 'ASC' | 'DESC',
      limit?: number,
      offset?: number,
      transaction?: Transaction
    } = {}
  ): Promise<Record<string, any>[]> {
    const { 
      fields = ['*'], 
      where = '', 
      replacements = {}, 
      orderBy = 'id', 
      orderDir = 'DESC',
      limit,
      offset,
      transaction 
    } = options;

    let sql = `SELECT ${fields.join(', ')} FROM ${table}`;
    if (where) {
      sql += ` WHERE ${where}`;
    }
    sql += ` ORDER BY ${orderBy} ${orderDir}`;
    
    if (limit !== undefined) {
      sql += ` LIMIT ${limit}`;
      if (offset !== undefined) {
        sql += ` OFFSET ${offset}`;
      }
    }

    // 使用直接导入的sequelize实例
    const result = await sequelize.query(sql, {
      replacements,
      type: QueryTypes.SELECT,
      transaction
    });
    
    return result as unknown as Record<string, any>[];
  }

  /**
   * 获取记录总数
   * @param table 表名
   * @param options 选项
   * @returns 记录总数
   */
  static async getCount(
    table: string,
    options: {
      where?: string,
      replacements?: Record<string, any>,
      transaction?: Transaction
    } = {}
  ): Promise<number> {
    const { where = '', replacements = {}, transaction } = options;

    let sql = `SELECT COUNT(*) as total FROM ${table}`;
    if (where) {
      sql += ` WHERE ${where}`;
    }

    // 使用直接导入的sequelize实例
    const result = await sequelize.query(sql, {
      replacements,
      type: QueryTypes.SELECT,
      transaction
    });
    
    const rows = result as unknown as Record<string, any>[];
    return rows.length > 0 ? Number(rows[0].total) : 0;
  }

  /**
   * 软删除记录
   * @param table 表名
   * @param field 字段名
   * @param value 字段值
   * @param options 选项
   * @returns 影响的行数
   */
  static async softDelete(
    table: string, 
    field: string, 
    value: any, 
    options: { 
      whereAddition?: string, 
      transaction?: Transaction,
      replacements?: Record<string, any>
    } = {}
  ): Promise<number> {
    const { whereAddition = '', transaction, replacements = {} } = options;
    const whereClause = `${field} = :value ${whereAddition ? 'AND ' + whereAddition : ''} AND deleted_at IS NULL`;
    const finalReplacements = { value, ...replacements };

    // 使用直接导入的sequelize实例
    const result = await sequelize.query(
      `UPDATE ${table} SET deleted_at = NOW(), updated_at = NOW() WHERE ${whereClause}`,
      {
        replacements: finalReplacements,
        type: QueryTypes.UPDATE,
        transaction
      }
    ) as unknown as [any, number];
    
    return result[1];
  }

  /**
   * 物理删除记录
   * @param table 表名
   * @param field 字段名
   * @param value 字段值
   * @param options 选项
   * @returns 影响的行数
   */
  static async hardDelete(
    table: string, 
    field: string, 
    value: any, 
    options: { 
      whereAddition?: string, 
      transaction?: Transaction,
      replacements?: Record<string, any>
    } = {}
  ): Promise<number> {
    const { whereAddition = '', transaction, replacements = {} } = options;
    const whereClause = `${field} = :value ${whereAddition ? 'AND ' + whereAddition : ''}`;
    const finalReplacements = { value, ...replacements };
    
    // 使用直接导入的sequelize实例
    const result = await sequelize.query(
      `DELETE FROM ${table} WHERE ${whereClause}`,
      {
        replacements: finalReplacements,
        type: QueryTypes.DELETE,
        transaction
      }
    ) as unknown as [any, number];
    
    return result[1];
  }

  /**
   * 更新记录
   * @param table 表名
   * @param data 更新的数据
   * @param where 条件子句或对象条件
   * @param options 选项
   * @returns 影响的行数
   */
  static async update(
    table: string,
    data: Record<string, any>,
    where: string | Record<string, any>,
    options: {
      transaction?: Transaction,
      replacements?: Record<string, any>
    } = {}
  ): Promise<number> {
    const { transaction, replacements = {} } = options;
    
    // 构建SET子句
    const sets = Object.keys(data).map(key => `${key} = :${key}`);
    
    // 处理条件参数，支持字符串或对象
    let whereClause: string;
    const finalReplacements = { ...data, ...replacements };
    
    if (typeof where === 'string') {
      whereClause = where;
    } else {
      whereClause = Object.keys(where).map(key => `${key} = :where_${key}`).join(' AND ');
      Object.keys(where).forEach(key => {
        finalReplacements[`where_${key}`] = where[key];
      });
    }

    const sql = `UPDATE ${table} SET ${sets.join(', ')} WHERE ${whereClause}`;

    // 使用直接导入的sequelize实例
    const result = await sequelize.query(sql, {
      replacements: finalReplacements,
      type: QueryTypes.UPDATE,
      transaction
    }) as unknown as [any, number];
    
    return result[1];
  }

  /**
   * 插入记录
   * @param table 表名
   * @param data 插入的数据
   * @param options 选项
   * @returns 插入结果
   */
  static async insert(
    table: string,
    data: Record<string, any>,
    options: {
      transaction?: Transaction
    } = {}
  ): Promise<{insertId: number, affectedRows: number}> {
    const { transaction } = options;
    
    const fields = Object.keys(data);
    const values = fields.map(field => `:${field}`);
    
    const sql = `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${values.join(', ')})`;

    // 使用直接导入的sequelize实例
    const result = await sequelize.query(sql, {
      replacements: data,
      type: QueryTypes.INSERT,
      transaction
    }) as unknown as [any, number];
    
    return {
      insertId: (result[0] as any)?.insertId || result[0],
      affectedRows: result[1]
    };
  }

  /**
   * 将驼峰命名转换为下划线命名
   * @param obj 对象
   * @returns 转换后的对象
   */
  static camelToSnake(obj: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      result[snakeKey] = value;
    }
    return result;
  }

  /**
   * 将下划线命名转换为驼峰命名
   * @param obj 对象
   * @returns 转换后的对象
   */
  static snakeToCamel(obj: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = value;
    }
    return result;
  }

  /**
   * 获取分页参数
   * @param page 页码
   * @param pageSize 每页大小
   * @returns 分页参数
   */
  static getPaginationParams(page = 1, pageSize = 10): { offset: number, limit: number } {
    const offset = (page - 1) * pageSize;
    return { offset, limit: pageSize };
  }

  /**
   * 批量插入
   * @param table 表名
   * @param fields 字段数组
   * @param values 值数组
   * @param transaction 事务
   * @returns 插入结果
   */
  static async batchInsert(
    table: string,
    fields: string[],
    values: any[][],
    transaction?: Transaction
  ): Promise<any> {
    if (values.length === 0) return null;
    
    const placeholders = values.map(() => `(${fields.map(() => '?').join(', ')})`).join(', ');
    const sql = `INSERT INTO ${table} (${fields.join(', ')}) VALUES ${placeholders}`;
    const flatValues = values.flat();

    // 使用直接导入的sequelize实例
    const result = await sequelize.query(sql, {
      replacements: flatValues,
      type: QueryTypes.INSERT,
      transaction
    });
    
    return result;
  }

  /**
   * 执行原生SQL查询
   * @param sql SQL语句
   * @param options 选项
   * @returns 查询结果
   */
  static async rawQuery(
    sql: string,
    options: {
      replacements?: Record<string, any>,
      type?: QueryTypes,
      transaction?: Transaction
    } = {}
  ): Promise<any> {
    const { replacements = {}, type = QueryTypes.SELECT, transaction } = options;

    // 使用直接导入的sequelize实例
    const result = await sequelize.query(sql, {
      replacements,
      type,
      transaction
    });
    
    return result;
  }

  /**
   * 创建IN子句
   * @param field 字段名
   * @param values 值数组
   * @returns IN子句字符串
   */
  static createInClause(field: string, values: any[]): string {
    if (values.length === 0) return '1=0'; // 空数组返回永假条件
    const placeholders = values.map((_, index) => `:in_${index}`).join(', ');
    return `${field} IN (${placeholders})`;
  }

  /**
   * 创建BETWEEN子句
   * @param field 字段名
   * @param start 开始值
   * @param end 结束值
   * @returns BETWEEN子句字符串
   */
  static createBetweenClause(field: string, start: any, end: any): string {
    return `${field} BETWEEN :start AND :end`;
  }

  /**
   * 创建LIKE搜索子句
   * @param fields 字段数组
   * @param keyword 关键词
   * @returns LIKE子句字符串
   */
  static createLikeClause(fields: string[], keyword: string): string {
    if (fields.length === 0) return '1=1';
    const conditions = fields.map(field => `${field} LIKE :keyword`);
    return `(${conditions.join(' OR ')})`;
  }
}

export default SqlHelper; 