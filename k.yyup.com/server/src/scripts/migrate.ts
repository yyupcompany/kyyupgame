#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// 使用统一的数据库配置
import { getDatabaseConfig } from '../config/database-unified';
const dbConfig = getDatabaseConfig();

// SQLite不支持时区设置，需要特殊处理
const sequelizeOptions: any = {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: dbConfig.dialect,
  storage: dbConfig.storage, // 用于SQLite
  logging: console.log,
  define: dbConfig.define,
  pool: dbConfig.pool,
};

// SQLite不支持时区设置
if (dbConfig.dialect !== 'sqlite' && dbConfig.timezone) {
  sequelizeOptions.timezone = dbConfig.timezone;
}

const sequelize = new Sequelize(
  dbConfig.database || '',
  dbConfig.username || '',
  dbConfig.password || '',
  sequelizeOptions
);

async function runMigrations() {
  try {
    console.log('开始运行数据库迁移...');
    
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('数据库连接成功');
    
    // 创建migrations表来记录已执行的迁移
    // 根据数据库类型使用不同的语法
    if (dbConfig.dialect === 'sqlite') {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS \`migrations\` (
          \`name\` VARCHAR(255) NOT NULL,
          \`executed_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (\`name\`)
        );
      `);
    } else {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS \`migrations\` (
          \`name\` VARCHAR(255) NOT NULL,
          \`executed_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (\`name\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
    }
    
    // 获取所有迁移文件
    const migrationsDir = path.join(__dirname, '../migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js'))
      .sort();
    
    console.log(`发现 ${migrationFiles.length} 个迁移文件`);
    
    // 获取已执行的迁移
    const [executedMigrations] = await sequelize.query('SELECT name FROM migrations');
    const executedNames = (executedMigrations as any[]).map(m => m.name);
    
    // 执行未执行的迁移
    for (const file of migrationFiles) {
      if (executedNames.includes(file)) {
        console.log(`跳过已执行的迁移: ${file}`);
        continue;
      }
      
      console.log(`执行迁移: ${file}`);
      
      try {
        const migrationPath = path.join(migrationsDir, file);
        const migration = require(migrationPath);
        
        if (migration.up) {
          await migration.up(sequelize.getQueryInterface(), sequelize.constructor);
          
          // 记录迁移已执行
          await sequelize.query('INSERT INTO migrations (name) VALUES (?)', {
            replacements: [file]
          });
          
          console.log(`✅ 迁移 ${file} 执行成功`);
        } else {
          console.log(`⚠️  迁移 ${file} 没有 up 方法`);
        }
      } catch (error) {
        console.error(`❌ 迁移 ${file} 执行失败:`, error);
        throw error;
      }
    }
    
    console.log('🎉 所有迁移执行完成');
    
  } catch (error) {
    console.error('迁移过程中发生错误:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

runMigrations();