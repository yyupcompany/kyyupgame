import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  user: 'root',
  password: 'pwk5ls7j',
  database: 'kargerdensales'
};

async function queryDatabaseStructure() {
  try {
    console.log('🔍 正在查询数据库结构和数据...\n');
    
    const connection = await mysql.createConnection(dbConfig);
    
    // 查询关键表的结构和数据
    const keyTables = [
      'students', 'teachers', 'parents', 'classes', 
      'enrollment_plans', 'activities', 'users', 'ai_conversations'
    ];
    
    for (const tableName of keyTables) {
      console.log(`\n📋 表: ${tableName.toUpperCase()}`);
      console.log('=' .repeat(60));
      
      try {
        // 查询表结构
        const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
        console.log('🏗️  表结构:');
        columns.forEach(col => {
          console.log(`  ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `[${col.Key}]` : ''}`);
        });
        
        // 查询数据条数
        const [countResult] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`📊 数据条数: ${countResult[0].count}`);
        
        // 查询前3条数据示例
        if (countResult[0].count > 0) {
          const [sampleData] = await connection.execute(`SELECT * FROM ${tableName} LIMIT 3`);
          console.log('📄 数据示例:');
          sampleData.forEach((row, index) => {
            console.log(`  [${index + 1}] ${JSON.stringify(row, null, 2)}`);
          });
        }
        
      } catch (error) {
        console.log(`❌ 查询表 ${tableName} 失败: ${error.message}`);
      }
    }
    
    // 查询一些关键统计信息
    console.log('\n\n📈 关键统计信息');
    console.log('=' .repeat(60));
    
    try {
      // 学生统计
      const [studentStats] = await connection.execute(`
        SELECT 
          COUNT(*) as total_students,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_students
        FROM students
      `);
      console.log(`👥 学生: 总数 ${studentStats[0].total_students}, 活跃 ${studentStats[0].active_students || 'N/A'}`);
      
      // 教师统计
      const [teacherStats] = await connection.execute(`SELECT COUNT(*) as total_teachers FROM teachers`);
      console.log(`👨‍🏫 教师: 总数 ${teacherStats[0].total_teachers}`);
      
      // 班级统计
      const [classStats] = await connection.execute(`SELECT COUNT(*) as total_classes FROM classes`);
      console.log(`🏫 班级: 总数 ${classStats[0].total_classes}`);
      
      // 招生计划统计
      const [enrollmentStats] = await connection.execute(`SELECT COUNT(*) as total_plans FROM enrollment_plans`);
      console.log(`📋 招生计划: 总数 ${enrollmentStats[0].total_plans}`);
      
      // 活动统计
      const [activityStats] = await connection.execute(`SELECT COUNT(*) as total_activities FROM activities`);
      console.log(`🎯 活动: 总数 ${activityStats[0].total_activities}`);
      
      // AI对话统计
      const [aiStats] = await connection.execute(`SELECT COUNT(*) as total_conversations FROM ai_conversations`);
      console.log(`🤖 AI对话: 总数 ${aiStats[0].total_conversations}`);
      
    } catch (error) {
      console.log(`❌ 查询统计信息失败: ${error.message}`);
    }
    
    // 查询最近的一些活动
    console.log('\n\n🕒 最近活动');
    console.log('=' .repeat(60));
    
    try {
      const [recentActivities] = await connection.execute(`
        SELECT id, title, start_date, status, created_at 
        FROM activities 
        ORDER BY created_at DESC 
        LIMIT 5
      `);
      
      if (recentActivities.length > 0) {
        recentActivities.forEach(activity => {
          console.log(`📅 ${activity.title} (${activity.status}) - ${activity.start_date}`);
        });
      } else {
        console.log('暂无活动数据');
      }
      
    } catch (error) {
      console.log(`❌ 查询最近活动失败: ${error.message}`);
    }
    
    await connection.end();
    console.log('\n✅ 数据库查询完成');
    
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
  }
}

queryDatabaseStructure();
