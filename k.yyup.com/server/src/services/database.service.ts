import mysql from 'mysql2/promise';
import { getDatabaseConfig } from '../config/database-unified';

export class DatabaseService {
  private pool: mysql.Pool;

  constructor() {
    const dbConfig = getDatabaseConfig();
    
    this.pool = mysql.createPool({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database,
      charset: 'utf8mb4',
      connectionLimit: 10
    });
  }

  /**
   * 执行查询
   */
  async query(sql: string, params: any[] = []): Promise<any> {
    try {
      const [rows] = await this.pool.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('Database query error:', error);
      console.error('SQL:', sql);
      console.error('Params:', params);
      throw error;
    }
  }

  /**
   * 执行事务
   */
  async transaction(callback: (connection: mysql.PoolConnection) => Promise<any>): Promise<any> {
    const connection = await this.pool.getConnection();
    
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * 获取单条记录
   */
  async findOne(sql: string, params: any[] = []): Promise<any> {
    const rows = await this.query(sql, params);
    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
  }

  /**
   * 获取多条记录
   */
  async findMany(sql: string, params: any[] = []): Promise<any[]> {
    const rows = await this.query(sql, params);
    return Array.isArray(rows) ? rows : [];
  }

  /**
   * 插入记录
   */
  async insert(table: string, data: Record<string, any>): Promise<any> {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const placeholders = fields.map(() => '?').join(', ');
    
    const sql = `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders})`;
    return await this.query(sql, values);
  }

  /**
   * 更新记录
   */
  async update(table: string, data: Record<string, any>, where: string, whereParams: any[] = []): Promise<any> {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    
    const sql = `UPDATE ${table} SET ${setClause} WHERE ${where}`;
    return await this.query(sql, [...values, ...whereParams]);
  }

  /**
   * 删除记录
   */
  async delete(table: string, where: string, whereParams: any[] = []): Promise<any> {
    const sql = `DELETE FROM ${table} WHERE ${where}`;
    return await this.query(sql, whereParams);
  }

  /**
   * 检查连接
   */
  async checkConnection(): Promise<boolean> {
    try {
      await this.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('Database connection check failed:', error);
      return false;
    }
  }

  /**
   * 关闭连接池
   */
  async close(): Promise<void> {
    await this.pool.end();
  }

  /**
   * 获取连接池状态
   */
  getPoolStatus() {
    return {
      connectionLimit: 10,
      status: 'active'
    };
  }
}
