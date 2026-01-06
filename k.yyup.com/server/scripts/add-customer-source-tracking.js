/**
 * 添加客户来源追踪字段
 * 执行: node server/scripts/add-customer-source-tracking.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function addCustomerSourceTracking() {
  let connection;
  
  try {
    console.log('🔄 连接数据库...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
      port: parseInt(process.env.DB_PORT || '43906'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'pwk5l57j',
      database: process.env.DB_NAME || 'kindergarten_db'
    });
    
    console.log('✅ 数据库连接成功\n');
    
    // 1. 更新 activity_registrations 表
    console.log('📝 步骤1: 更新 activity_registrations 表...');
    
    const activityRegistrationsFields = [
      {
        name: 'share_by',
        sql: 'ADD COLUMN share_by INT COMMENT "分享者ID（老师或园长）" AFTER source'
      },
      {
        name: 'share_type',
        sql: 'ADD COLUMN share_type VARCHAR(20) COMMENT "分享类型: teacher/principal/wechat/qrcode" AFTER share_by'
      },
      {
        name: 'source_type',
        sql: 'ADD COLUMN source_type VARCHAR(50) COMMENT "来源类型: ACTIVITY_ONLINE/ACTIVITY_OFFLINE等" AFTER share_type'
      },
      {
        name: 'source_detail',
        sql: 'ADD COLUMN source_detail JSON COMMENT "来源详情（JSON格式）" AFTER source_type'
      },
      {
        name: 'auto_assigned',
        sql: 'ADD COLUMN auto_assigned BOOLEAN DEFAULT FALSE COMMENT "是否自动分配给老师" AFTER source_detail'
      }
    ];
    
    for (const field of activityRegistrationsFields) {
      try {
        // 检查字段是否已存在
        const [columns] = await connection.query(
          `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'activity_registrations' AND COLUMN_NAME = ?`,
          [process.env.DB_NAME || 'kindergarten_db', field.name]
        );
        
        if (columns.length === 0) {
          await connection.query(`ALTER TABLE activity_registrations ${field.sql}`);
          console.log(`  ✅ 添加字段: ${field.name}`);
        } else {
          console.log(`  ⏭️  字段已存在: ${field.name}`);
        }
      } catch (error) {
        console.error(`  ❌ 添加字段失败 ${field.name}:`, error.message);
      }
    }
    
    // 添加索引
    try {
      await connection.query(
        'CREATE INDEX idx_activity_registrations_share_by ON activity_registrations(share_by)'
      );
      console.log('  ✅ 添加索引: idx_activity_registrations_share_by');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('  ⏭️  索引已存在: idx_activity_registrations_share_by');
      } else {
        console.error('  ❌ 添加索引失败:', error.message);
      }
    }
    
    try {
      await connection.query(
        'CREATE INDEX idx_activity_registrations_source_type ON activity_registrations(source_type)'
      );
      console.log('  ✅ 添加索引: idx_activity_registrations_source_type');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('  ⏭️  索引已存在: idx_activity_registrations_source_type');
      } else {
        console.error('  ❌ 添加索引失败:', error.message);
      }
    }
    
    console.log('✅ activity_registrations 表更新完成\n');
    
    // 2. 更新 teacher_customers 表
    console.log('📝 步骤2: 更新 teacher_customers 表...');
    
    const teacherCustomersFields = [
      {
        name: 'source_type',
        sql: 'ADD COLUMN source_type VARCHAR(50) COMMENT "来源类型: ACTIVITY_ONLINE/ACTIVITY_OFFLINE等" AFTER source'
      },
      {
        name: 'source_id',
        sql: 'ADD COLUMN source_id INT COMMENT "来源ID（活动ID、报名ID等）" AFTER source_type'
      },
      {
        name: 'source_detail',
        sql: 'ADD COLUMN source_detail JSON COMMENT "来源详情（JSON格式）" AFTER source_id'
      },
      {
        name: 'auto_assigned',
        sql: 'ADD COLUMN auto_assigned BOOLEAN DEFAULT FALSE COMMENT "是否自动分配" AFTER source_detail'
      }
    ];
    
    for (const field of teacherCustomersFields) {
      try {
        // 检查字段是否已存在
        const [columns] = await connection.query(
          `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'teacher_customers' AND COLUMN_NAME = ?`,
          [process.env.DB_NAME || 'kindergarten_db', field.name]
        );
        
        if (columns.length === 0) {
          await connection.query(`ALTER TABLE teacher_customers ${field.sql}`);
          console.log(`  ✅ 添加字段: ${field.name}`);
        } else {
          console.log(`  ⏭️  字段已存在: ${field.name}`);
        }
      } catch (error) {
        console.error(`  ❌ 添加字段失败 ${field.name}:`, error.message);
      }
    }
    
    // 添加索引
    try {
      await connection.query(
        'CREATE INDEX idx_teacher_customers_source_type ON teacher_customers(source_type)'
      );
      console.log('  ✅ 添加索引: idx_teacher_customers_source_type');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('  ⏭️  索引已存在: idx_teacher_customers_source_type');
      } else {
        console.error('  ❌ 添加索引失败:', error.message);
      }
    }
    
    try {
      await connection.query(
        'CREATE INDEX idx_teacher_customers_source_id ON teacher_customers(source_id)'
      );
      console.log('  ✅ 添加索引: idx_teacher_customers_source_id');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('  ⏭️  索引已存在: idx_teacher_customers_source_id');
      } else {
        console.error('  ❌ 添加索引失败:', error.message);
      }
    }
    
    console.log('✅ teacher_customers 表更新完成\n');
    
    // 3. 验证字段
    console.log('📝 步骤3: 验证字段...');
    
    const [activityFields] = await connection.query(
      `SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_COMMENT
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'activity_registrations'
       AND COLUMN_NAME IN ('share_by', 'share_type', 'source_type', 'source_detail', 'auto_assigned')`,
      [process.env.DB_NAME || 'kindergarten_db']
    );
    
    console.log('\n  activity_registrations 表字段:');
    activityFields.forEach(field => {
      console.log(`    - ${field.COLUMN_NAME}: ${field.COLUMN_TYPE} (${field.COLUMN_COMMENT})`);
    });
    
    const [customerFields] = await connection.query(
      `SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_COMMENT
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'teacher_customers'
       AND COLUMN_NAME IN ('source_type', 'source_id', 'source_detail', 'auto_assigned')`,
      [process.env.DB_NAME || 'kindergarten_db']
    );
    
    console.log('\n  teacher_customers 表字段:');
    customerFields.forEach(field => {
      console.log(`    - ${field.COLUMN_NAME}: ${field.COLUMN_TYPE} (${field.COLUMN_COMMENT})`);
    });
    
    console.log('\n✅ 所有字段添加成功！');
    
  } catch (error) {
    console.error('\n❌ 执行失败:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 数据库连接已关闭');
    }
  }
}

// 执行脚本
addCustomerSourceTracking();

