import { Request, Response } from 'express';
import { sequelize } from '../init';
import { successResponse, errorResponse } from '../utils/response-handler';
import { getTenantDatabaseName } from '../utils/tenant-database-helper';

/**
 * 数据库迁移控制器
 * 用于执行数据库表结构更新
 */
export class MigrationController {
  
  /**
   * 执行活动海报相关表的迁移
   */
  static async migrateActivityPosterTables(req: Request, res: Response) {
    try {
      console.log('开始执行活动海报相关表迁移...');
      // 获取租户数据库名称（共享连接池模式）
      const tenantDb = getTenantDatabaseName(req);

      // 1. 在activities表中添加海报相关字段（逐个添加，避免重复）
      const columnsToAdd = [
        { name: 'poster_id', sql: 'ADD COLUMN poster_id INT NULL COMMENT \'关联的主海报ID\'' },
        { name: 'poster_url', sql: 'ADD COLUMN poster_url VARCHAR(500) NULL COMMENT \'主海报URL\'' },
        { name: 'share_poster_url', sql: 'ADD COLUMN share_poster_url VARCHAR(500) NULL COMMENT \'分享海报URL\'' },
        { name: 'marketing_config', sql: 'ADD COLUMN marketing_config JSON NULL COMMENT \'营销配置信息(团购、积分、分享等)\'' },
        { name: 'publish_status', sql: 'ADD COLUMN publish_status TINYINT NOT NULL DEFAULT 0 COMMENT \'发布状态 - 0:草稿 1:已发布 2:已暂停\'' },
        { name: 'share_count', sql: 'ADD COLUMN share_count INT NOT NULL DEFAULT 0 COMMENT \'分享次数\'' },
        { name: 'view_count', sql: 'ADD COLUMN view_count INT NOT NULL DEFAULT 0 COMMENT \'浏览次数\'' }
      ];

      for (const column of columnsToAdd) {
        try {
          // 检查字段是否已存在
          const columnExists = await sequelize.query(`
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = '${tenantDb}'
            AND TABLE_NAME = 'activities'
            AND COLUMN_NAME = '${column.name}'
          `);

          if ((columnExists[0] as any[]).length === 0) {
            await sequelize.query(`ALTER TABLE ${tenantDb}.activities ${column.sql}`);
            console.log(`✅ 添加字段 ${column.name} 成功`);
          } else {
            console.log(`⚠️ 字段 ${column.name} 已存在，跳过`);
          }
        } catch (error) {
          console.error(`❌ 添加字段 ${column.name} 失败:`, error);
          // 继续处理其他字段
        }
      }

      // 2. 创建活动海报关联表
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS ${tenantDb}.activity_posters (
          id INT PRIMARY KEY AUTO_INCREMENT COMMENT '关联ID',
          activity_id INT NOT NULL COMMENT '活动ID',
          poster_id INT NOT NULL COMMENT '海报ID',
          poster_type ENUM('main', 'share', 'detail', 'preview') NOT NULL DEFAULT 'main' COMMENT '海报类型',
          is_active BOOLEAN NOT NULL DEFAULT true COMMENT '是否启用',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_activity_id (activity_id),
          INDEX idx_poster_id (poster_id),
          INDEX idx_activity_poster_type (activity_id, poster_type)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活动海报关联表'
      `);

      // 3. 创建活动分享记录表
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS ${tenantDb}.activity_shares (
          id INT PRIMARY KEY AUTO_INCREMENT COMMENT '分享记录ID',
          activity_id INT NOT NULL COMMENT '活动ID',
          poster_id INT NULL COMMENT '分享的海报ID',
          share_channel ENUM('wechat', 'weibo', 'qq', 'link', 'qrcode', 'other') NOT NULL COMMENT '分享渠道',
          share_url VARCHAR(500) NULL COMMENT '分享链接',
          sharer_id INT NULL COMMENT '分享者ID',
          share_ip VARCHAR(45) NULL COMMENT '分享者IP',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_activity_id (activity_id),
          INDEX idx_share_channel (share_channel),
          INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活动分享记录表'
      `);

      console.log('✅ 活动海报相关表迁移完成');

      return successResponse(res, {
        message: '活动海报相关表迁移成功',
        tables: ['activities (新增字段)', 'activity_posters', 'activity_shares']
      });

    } catch (error) {
      console.error('迁移失败:', error);
      return errorResponse(res, '数据库迁移失败: ' + (error as Error).message);
    }
  }

  /**
   * 修复AI记忆表结构
   */
  static async fixAIMemoriesTable(req: Request, res: Response) {
    try {
      console.log('开始修复AI记忆表结构...');
      // 获取租户数据库名称（共享连接池模式）
      const tenantDb = getTenantDatabaseName(req);

      // 1. 检查ai_memories表是否存在
      const tableExists = await sequelize.query(`
        SHOW TABLES LIKE 'ai_memories'
      `);

      if ((tableExists[0] as any[]).length === 0) {
        // 创建ai_memories表
        await sequelize.query(`
          CREATE TABLE ${tenantDb}.ai_memories (
            id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'AI记忆ID',
            user_id INT NOT NULL COMMENT '用户ID',
            conversation_id VARCHAR(255) NULL COMMENT '会话ID',
            content TEXT NOT NULL COMMENT '记忆内容',
            importance FLOAT NOT NULL DEFAULT 0.5 COMMENT '重要性评分',
            memory_type ENUM('short_term', 'long_term', 'working') NOT NULL DEFAULT 'short_term' COMMENT '记忆类型',
            embedding LONGBLOB NULL COMMENT '向量嵌入',
            expires_at TIMESTAMP NULL COMMENT '过期时间',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_user_id (user_id),
            INDEX idx_conversation_id (conversation_id),
            INDEX idx_memory_type (memory_type),
            INDEX idx_importance (importance)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI记忆表'
        `);
        console.log('✅ 创建ai_memories表成功');
      } else {
        // 表存在，检查并添加缺失的字段
        const fieldsToCheck = [
          { name: 'user_id', sql: 'ADD COLUMN user_id INT NOT NULL COMMENT \'用户ID\' AFTER id' },
          { name: 'conversation_id', sql: 'ADD COLUMN conversation_id VARCHAR(255) NULL COMMENT \'会话ID\' AFTER user_id' },
          { name: 'content', sql: 'ADD COLUMN content TEXT NOT NULL COMMENT \'记忆内容\' AFTER conversation_id' },
          { name: 'importance', sql: 'ADD COLUMN importance FLOAT NOT NULL DEFAULT 0.5 COMMENT \'重要性评分\' AFTER content' },
          { name: 'memory_type', sql: 'ADD COLUMN memory_type ENUM(\'short_term\', \'long_term\', \'working\') NOT NULL DEFAULT \'short_term\' COMMENT \'记忆类型\' AFTER importance' },
          { name: 'embedding', sql: 'ADD COLUMN embedding LONGBLOB NULL COMMENT \'向量嵌入\' AFTER memory_type' },
          { name: 'expires_at', sql: 'ADD COLUMN expires_at TIMESTAMP NULL COMMENT \'过期时间\' AFTER embedding' }
        ];

        for (const field of fieldsToCheck) {
          try {
            const fieldExists = await sequelize.query(`
              SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
              WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'ai_memories'
              AND COLUMN_NAME = '${field.name}'
            `);

            if ((fieldExists[0] as any[]).length === 0) {
              await sequelize.query(`ALTER TABLE ${tenantDb}.ai_memories ${field.sql}`);
              console.log(`✅ 添加字段 ${field.name} 成功`);
            } else {
              console.log(`⚠️ 字段 ${field.name} 已存在，跳过`);
            }
          } catch (error) {
            console.error(`❌ 添加字段 ${field.name} 失败:`, error);
          }
        }

        // 创建索引（如果不存在）
        const indexes = [
          { name: 'idx_user_id', sql: 'ADD INDEX idx_user_id (user_id)' },
          { name: 'idx_conversation_id', sql: 'ADD INDEX idx_conversation_id (conversation_id)' },
          { name: 'idx_memory_type', sql: 'ADD INDEX idx_memory_type (memory_type)' },
          { name: 'idx_importance', sql: 'ADD INDEX idx_importance (importance)' }
        ];

        for (const index of indexes) {
          try {
            const indexExists = await sequelize.query(`
              SHOW INDEX FROM ${tenantDb}.ai_memories WHERE Key_name = '${index.name}'
            `);

            if ((indexExists[0] as any[]).length === 0) {
              await sequelize.query(`ALTER TABLE ai_memories ${index.sql}`);
              console.log(`✅ 添加索引 ${index.name} 成功`);
            } else {
              console.log(`⚠️ 索引 ${index.name} 已存在，跳过`);
            }
          } catch (error) {
            console.error(`❌ 添加索引 ${index.name} 失败:`, error);
          }
        }
      }

      console.log('✅ AI记忆表结构修复完成');

      return successResponse(res, {
        message: 'AI记忆表结构修复成功',
        table: 'ai_memories'
      });

    } catch (error) {
      console.error('AI记忆表修复失败:', error);
      return errorResponse(res, 'AI记忆表修复失败: ' + (error as Error).message);
    }
  }

  /**
   * 检查迁移状态
   */
  static async checkMigrationStatus(req: Request, res: Response) {
    try {
      // 获取租户数据库名称（共享连接池模式）
      const tenantDb = getTenantDatabaseName(req);

      // 检查activities表是否有新字段
      const activitiesColumns = await sequelize.query(`
        SHOW COLUMNS FROM ${tenantDb}.activities LIKE 'poster_id'
      `);

      // 检查activity_posters表是否存在
      const activityPostersExists = await sequelize.query(`
        SHOW TABLES LIKE 'activity_posters'
      `);

      // 检查activity_shares表是否存在
      const activitySharesExists = await sequelize.query(`
        SHOW TABLES LIKE 'activity_shares'
      `);

      const status = {
        activitiesTableUpdated: (activitiesColumns[0] as any[]).length > 0,
        activityPostersTableExists: (activityPostersExists[0] as any[]).length > 0,
        activitySharesTableExists: (activitySharesExists[0] as any[]).length > 0
      };

      const allMigrated = status.activitiesTableUpdated && 
                         status.activityPostersTableExists && 
                         status.activitySharesTableExists;

      return successResponse(res, {
        migrationStatus: allMigrated ? 'completed' : 'pending',
        details: status
      });

    } catch (error) {
      console.error('检查迁移状态失败:', error);
      return errorResponse(res, '检查迁移状态失败: ' + (error as Error).message);
    }
  }

  /**
   * 回滚迁移
   */
  static async rollbackMigration(req: Request, res: Response) {
    try {
      console.log('开始回滚活动海报相关表迁移...');
      // 获取租户数据库名称（共享连接池模式）
      const tenantDb = getTenantDatabaseName(req);

      // 删除新创建的表
      await sequelize.query(`DROP TABLE IF EXISTS ${tenantDb}.activity_shares`);
      await sequelize.query(`DROP TABLE IF EXISTS ${tenantDb}.activity_posters`);

      // 删除activities表中的新字段
      await sequelize.query(`
        ALTER TABLE ${tenantDb}.activities
        DROP COLUMN IF EXISTS view_count,
        DROP COLUMN IF EXISTS share_count,
        DROP COLUMN IF EXISTS publish_status,
        DROP COLUMN IF EXISTS marketing_config,
        DROP COLUMN IF EXISTS share_poster_url,
        DROP COLUMN IF EXISTS poster_url,
        DROP COLUMN IF EXISTS poster_id
      `);

      console.log('✅ 迁移回滚完成');

      return successResponse(res, {
        message: '迁移回滚成功'
      });

    } catch (error) {
      console.error('回滚失败:', error);
      return errorResponse(res, '迁移回滚失败: ' + (error as Error).message);
    }
  }
}
