/**
 * 手动添加数据库索引脚本
 * 绕过Sequelize迁移系统，直接执行SQL
 */

const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: console.log
  }
);

async function addIndexes() {
  console.log('🚀 [索引] 开始添加性能优化索引...');

  try {
    await sequelize.authenticate();
    console.log('✅ [索引] 数据库连接成功');

    const indexes = [
      // AI消息表索引
      {
        table: 'ai_messages',
        name: 'idx_ai_messages_conversation_id',
        sql: 'CREATE INDEX idx_ai_messages_conversation_id ON ai_messages(conversation_id)'
      },
      {
        table: 'ai_messages',
        name: 'idx_ai_messages_user_created',
        sql: 'CREATE INDEX idx_ai_messages_user_created ON ai_messages(user_id, created_at)'
      },
      {
        table: 'ai_messages',
        name: 'idx_ai_messages_role',
        sql: 'CREATE INDEX idx_ai_messages_role ON ai_messages(role)'
      },

      // AI对话表索引
      {
        table: 'ai_conversations',
        name: 'idx_ai_conversations_user_status',
        sql: 'CREATE INDEX idx_ai_conversations_user_status ON ai_conversations(user_id, status)'
      },
      {
        table: 'ai_conversations',
        name: 'idx_ai_conversations_updated',
        sql: 'CREATE INDEX idx_ai_conversations_updated ON ai_conversations(updated_at)'
      },

      // 学生表索引
      {
        table: 'students',
        name: 'idx_students_status',
        sql: 'CREATE INDEX idx_students_status ON students(status)'
      },
      {
        table: 'students',
        name: 'idx_students_class',
        sql: 'CREATE INDEX idx_students_class ON students(class_id)'
      },
      {
        table: 'students',
        name: 'idx_students_kindergarten',
        sql: 'CREATE INDEX idx_students_kindergarten ON students(kindergarten_id)'
      },

      // 活动表索引
      {
        table: 'activities',
        name: 'idx_activities_time_range',
        sql: 'CREATE INDEX idx_activities_time_range ON activities(start_time, end_time)'
      },
      {
        table: 'activities',
        name: 'idx_activities_status',
        sql: 'CREATE INDEX idx_activities_status ON activities(status)'
      },
      {
        table: 'activities',
        name: 'idx_activities_kindergarten',
        sql: 'CREATE INDEX idx_activities_kindergarten ON activities(kindergarten_id)'
      },

      // 教师表索引
      {
        table: 'teachers',
        name: 'idx_teachers_status',
        sql: 'CREATE INDEX idx_teachers_status ON teachers(status)'
      },
      {
        table: 'teachers',
        name: 'idx_teachers_kindergarten',
        sql: 'CREATE INDEX idx_teachers_kindergarten ON teachers(kindergarten_id)'
      },

      // 班级表索引
      {
        table: 'classes',
        name: 'idx_classes_kindergarten',
        sql: 'CREATE INDEX idx_classes_kindergarten ON classes(kindergarten_id)'
      },
      {
        table: 'classes',
        name: 'idx_classes_status',
        sql: 'CREATE INDEX idx_classes_status ON classes(status)'
      },

      // 招生申请表索引
      {
        table: 'enrollment_applications',
        name: 'idx_enrollment_applications_status',
        sql: 'CREATE INDEX idx_enrollment_applications_status ON enrollment_applications(status)'
      },
      {
        table: 'enrollment_applications',
        name: 'idx_enrollment_applications_kindergarten',
        sql: 'CREATE INDEX idx_enrollment_applications_kindergarten ON enrollment_applications(kindergarten_id)'
      },
      {
        table: 'enrollment_applications',
        name: 'idx_enrollment_applications_created',
        sql: 'CREATE INDEX idx_enrollment_applications_created ON enrollment_applications(created_at)'
      }
    ];

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const index of indexes) {
      try {
        console.log(`📊 [索引] 添加 ${index.table}.${index.name}...`);
        await sequelize.query(index.sql);
        successCount++;
        console.log(`✅ [索引] ${index.table}.${index.name} 添加成功`);
      } catch (error) {
        if (error.message.includes('Duplicate key name')) {
          skipCount++;
          console.log(`⚠️ [索引] ${index.table}.${index.name} 已存在，跳过`);
        } else {
          errorCount++;
          console.error(`❌ [索引] ${index.table}.${index.name} 添加失败:`, error.message);
        }
      }
    }

    console.log('\n📊 [索引] 添加完成统计:');
    console.log(`  ✅ 成功: ${successCount}`);
    console.log(`  ⚠️ 跳过: ${skipCount}`);
    console.log(`  ❌ 失败: ${errorCount}`);
    console.log(`  📝 总计: ${indexes.length}`);

    if (errorCount === 0) {
      console.log('\n✅ [索引] 所有索引添加完成！');
    } else {
      console.log('\n⚠️ [索引] 部分索引添加失败，请检查错误信息');
    }

  } catch (error) {
    console.error('❌ [索引] 执行失败:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('✅ [索引] 数据库连接已关闭');
  }
}

// 执行
addIndexes()
  .then(() => {
    console.log('✅ [索引] 脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ [索引] 脚本执行失败:', error);
    process.exit(1);
  });

