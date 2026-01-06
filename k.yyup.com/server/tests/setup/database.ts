/**
 * 数据库测试设置工具
 * 
 * 功能：
 * - 测试数据库初始化
 * - 数据清理
 * - 事务管理
 * - 测试数据隔离
 */

import { Pool } from 'pg';
import { config } from '../../src/config/database';

// 测试数据库配置
const testDbConfig = {
  ...config,
  database: process.env.TEST_DATABASE_NAME || 'kindergarten_test',
  // 使用独立的测试数据库避免污染生产数据
};

let testDbPool: Pool;

/**
 * 设置测试数据库
 */
export async function setupTestDatabase(): Promise<void> {
  try {
    // 创建测试数据库连接池
    testDbPool = new Pool(testDbConfig);
    
    // 测试连接
    const client = await testDbPool.connect();
    await client.query('SELECT NOW()');
    client.release();
    
    console.log('✅ 测试数据库连接成功');
    
    // 初始化测试数据库结构
    await initializeTestSchema();
    
    // 插入基础测试数据
    await seedTestData();
    
  } catch (error) {
    console.error('❌ 测试数据库设置失败:', error);
    throw error;
  }
}

/**
 * 清理测试数据库
 */
export async function cleanupTestDatabase(): Promise<void> {
  try {
    if (testDbPool) {
      // 清理所有测试数据
      await clearAllTestData();
      
      // 关闭连接池
      await testDbPool.end();
      console.log('✅ 测试数据库清理完成');
    }
  } catch (error) {
    console.error('❌ 测试数据库清理失败:', error);
    throw error;
  }
}

/**
 * 初始化测试数据库结构
 */
async function initializeTestSchema(): Promise<void> {
  const client = await testDbPool.connect();
  
  try {
    // 开始事务
    await client.query('BEGIN');
    
    // 创建用户表
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        permissions TEXT[],
        name VARCHAR(100),
        phone VARCHAR(20),
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 创建教师表
    await client.query(`
      CREATE TABLE IF NOT EXISTS teachers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        phone VARCHAR(20),
        subject VARCHAR(50),
        hire_date DATE,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 创建班级表
    await client.query(`
      CREATE TABLE IF NOT EXISTS classes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        teacher_id INTEGER REFERENCES teachers(id),
        grade_level VARCHAR(20),
        capacity INTEGER DEFAULT 30,
        current_students INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 创建学生表
    await client.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        gender VARCHAR(10),
        birth_date DATE,
        class_id INTEGER REFERENCES classes(id),
        parent_name VARCHAR(100),
        parent_phone VARCHAR(20),
        parent_email VARCHAR(100),
        address TEXT,
        enrollment_date DATE,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 创建活动表
    await client.query(`
      CREATE TABLE IF NOT EXISTS activities (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        activity_type VARCHAR(50),
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        location VARCHAR(200),
        capacity INTEGER,
        current_registrations INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'active',
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 创建AI对话表
    await client.query(`
      CREATE TABLE IF NOT EXISTS ai_conversations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        title VARCHAR(200),
        context JSONB,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 创建AI消息表
    await client.query(`
      CREATE TABLE IF NOT EXISTS ai_messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER REFERENCES ai_conversations(id),
        role VARCHAR(20) NOT NULL, -- 'user' or 'assistant'
        content TEXT NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 提交事务
    await client.query('COMMIT');
    
    console.log('✅ 测试数据库结构初始化完成');
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * 插入基础测试数据
 */
async function seedTestData(): Promise<void> {
  const client = await testDbPool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 插入系统管理员用户
    await client.query(`
      INSERT INTO users (username, email, password_hash, role, permissions, name)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (username) DO NOTHING
    `, [
      'admin',
      'admin@test.com',
      '$2b$10$hash', // 实际应用中应该是真实的密码哈希
      'admin',
      ['*'],
      '系统管理员'
    ]);
    
    // 插入测试教师用户
    await client.query(`
      INSERT INTO users (username, email, password_hash, role, permissions, name)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (username) DO NOTHING
    `, [
      'teacher1',
      'teacher1@test.com',
      '$2b$10$hash',
      'teacher',
      ['students:read', 'classes:read', 'activities:read'],
      '测试教师1'
    ]);
    
    await client.query('COMMIT');
    console.log('✅ 基础测试数据插入完成');
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * 清理所有测试数据
 */
async function clearAllTestData(): Promise<void> {
  const client = await testDbPool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 按依赖关系顺序删除数据
    const tables = [
      'ai_messages',
      'ai_conversations',
      'activities',
      'students',
      'classes',
      'teachers',
      'users'
    ];
    
    for (const table of tables) {
      await client.query(`DELETE FROM ${table} WHERE id > 0`);
    }
    
    // 重置序列
    for (const table of tables) {
      await client.query(`ALTER SEQUENCE ${table}_id_seq RESTART WITH 1`);
    }
    
    await client.query('COMMIT');
    console.log('✅ 测试数据清理完成');
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * 获取测试数据库连接
 */
export function getTestDbPool(): Pool {
  if (!testDbPool) {
    throw new Error('测试数据库未初始化，请先调用 setupTestDatabase()');
  }
  return testDbPool;
}

/**
 * 执行测试查询
 */
export async function executeTestQuery(query: string, params?: any[]): Promise<any> {
  const client = await testDbPool.connect();
  try {
    const result = await client.query(query, params);
    return result;
  } finally {
    client.release();
  }
}

/**
 * 开始测试事务
 */
export async function beginTestTransaction(): Promise<any> {
  const client = await testDbPool.connect();
  await client.query('BEGIN');
  return client;
}

/**
 * 回滚测试事务
 */
export async function rollbackTestTransaction(client: any): Promise<void> {
  try {
    await client.query('ROLLBACK');
  } finally {
    client.release();
  }
}

/**
 * 提交测试事务
 */
export async function commitTestTransaction(client: any): Promise<void> {
  try {
    await client.query('COMMIT');
  } finally {
    client.release();
  }
}
