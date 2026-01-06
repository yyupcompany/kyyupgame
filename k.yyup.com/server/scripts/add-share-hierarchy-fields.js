/**
 * 添加分享层级字段到activity_shares表
 */

const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'kargerdensales',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'Yyup@2024',
  {
    host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
    port: parseInt(process.env.DB_PORT || '43906', 10),
    dialect: 'mysql',
    logging: console.log
  }
);

async function addShareHierarchyFields() {
  try {
    console.log('🔄 开始添加分享层级字段...\n');

    // 检查字段是否已存在
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME || 'kargerdensales'}' 
      AND TABLE_NAME = 'activity_shares' 
      AND COLUMN_NAME IN ('parent_sharer_id', 'share_level')
    `);

    if (results.length > 0) {
      console.log('✅ 字段已存在，跳过添加');
      return;
    }

    // 添加parent_sharer_id字段
    console.log('📝 添加 parent_sharer_id 字段...');
    await sequelize.query(`
      ALTER TABLE activity_shares 
      ADD COLUMN parent_sharer_id INT NULL 
      COMMENT '上级分享者ID（用于记录分享层级关系）' 
      AFTER share_ip
    `);
    console.log('✅ parent_sharer_id 字段添加成功');

    // 添加share_level字段
    console.log('📝 添加 share_level 字段...');
    await sequelize.query(`
      ALTER TABLE activity_shares 
      ADD COLUMN share_level INT NOT NULL DEFAULT 1 
      COMMENT '分享层级（1=一级分享，2=二级分享，3=三级分享）' 
      AFTER parent_sharer_id
    `);
    console.log('✅ share_level 字段添加成功');

    // 添加索引
    console.log('📝 添加索引...');
    
    try {
      await sequelize.query(`
        ALTER TABLE activity_shares 
        ADD INDEX idx_activity_shares_parent_sharer_id (parent_sharer_id)
      `);
      console.log('✅ idx_activity_shares_parent_sharer_id 索引添加成功');
    } catch (error) {
      if (error.message.includes('Duplicate key name')) {
        console.log('⚠️  idx_activity_shares_parent_sharer_id 索引已存在');
      } else {
        throw error;
      }
    }

    try {
      await sequelize.query(`
        ALTER TABLE activity_shares
        ADD INDEX idx_activity_shares_sharer_level (sharer_id, share_level)
      `);
      console.log('✅ idx_activity_shares_sharer_level 索引添加成功');
    } catch (error) {
      if (error.message.includes('Duplicate key name')) {
        console.log('⚠️  idx_activity_shares_sharer_level 索引已存在');
      } else {
        throw error;
      }
    }

    try {
      await sequelize.query(`
        ALTER TABLE activity_shares
        ADD INDEX idx_activity_shares_activity_level (activity_id, share_level)
      `);
      console.log('✅ idx_activity_shares_activity_level 索引添加成功');
    } catch (error) {
      if (error.message.includes('Duplicate key name')) {
        console.log('⚠️  idx_activity_shares_activity_level 索引已存在');
      } else {
        throw error;
      }
    }

    // 添加外键约束
    console.log('📝 添加外键约束...');
    try {
      await sequelize.query(`
        ALTER TABLE activity_shares 
        ADD CONSTRAINT fk_activity_shares_parent_sharer 
        FOREIGN KEY (parent_sharer_id) 
        REFERENCES users(id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
      `);
      console.log('✅ 外键约束添加成功');
    } catch (error) {
      if (error.message.includes('Duplicate foreign key')) {
        console.log('⚠️  外键约束已存在');
      } else {
        throw error;
      }
    }

    console.log('\n🎉 分享层级字段添加完成！');

  } catch (error) {
    console.error('\n❌ 添加字段失败:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 运行脚本
addShareHierarchyFields()
  .then(() => {
    console.log('\n✅ 脚本执行成功');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 脚本执行失败:', error);
    process.exit(1);
  });

