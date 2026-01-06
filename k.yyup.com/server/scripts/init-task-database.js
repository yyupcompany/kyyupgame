const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// 加载环境变量
require('dotenv').config();

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kindergarten_management',
  charset: 'utf8mb4'
};

async function initTaskDatabase() {
  let connection;
  
  try {
    console.log('🚀 开始初始化任务管理数据库...');
    
    // 创建数据库连接
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 读取SQL文件
    const sqlFilePath = path.join(__dirname, 'create-task-tables.sql');
    const sqlContent = await fs.readFile(sqlFilePath, 'utf8');
    
    // 分割SQL语句（按分号分割，忽略注释）
    const sqlStatements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => {
        // 过滤空语句和注释
        if (!stmt || stmt.length === 0) return false;
        if (stmt.startsWith('--')) return false;
        if (stmt.startsWith('/*')) return false;
        // 只保留CREATE TABLE语句
        return stmt.toUpperCase().includes('CREATE TABLE');
      });
    
    console.log(`📝 准备执行 ${sqlStatements.length} 条SQL语句`);
    
    // 执行SQL语句
    for (let i = 0; i < sqlStatements.length; i++) {
      const statement = sqlStatements[i];
      if (statement.trim()) {
        try {
          await connection.execute(statement);
          
          // 提取表名用于显示
          const tableMatch = statement.match(/CREATE TABLE.*?`?(\w+)`?\s*\(/i);
          const tableName = tableMatch ? tableMatch[1] : `语句${i + 1}`;
          
          console.log(`✅ 成功创建表: ${tableName}`);
        } catch (error) {
          console.error(`❌ 执行SQL语句失败: ${statement.substring(0, 50)}...`);
          console.error(`错误信息: ${error.message}`);
        }
      }
    }
    
    // 验证表是否创建成功
    console.log('\n🔍 验证表创建情况...');
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME, TABLE_COMMENT 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME LIKE 'task%'
      ORDER BY TABLE_NAME
    `, [dbConfig.database]);
    
    console.log('\n📋 任务相关表列表:');
    tables.forEach(table => {
      console.log(`  - ${table.TABLE_NAME}: ${table.TABLE_COMMENT}`);
    });
    
    // 插入一些初始数据
    await insertInitialData(connection);
    
    console.log('\n🎉 任务管理数据库初始化完成！');
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

async function insertInitialData(connection) {
  console.log('\n📦 插入初始数据...');
  
  try {
    // 插入任务模板
    const templates = [
      {
        name: '招生宣传材料制作',
        description: '制作招生相关的宣传材料，包括海报、宣传册等',
        type: 'enrollment',
        category: '宣传制作',
        template_content: JSON.stringify({
          subtasks: [
            { title: '收集素材和资料', estimated_hours: 2 },
            { title: '设计初稿', estimated_hours: 4 },
            { title: '审核和修改', estimated_hours: 2 },
            { title: '最终确认和输出', estimated_hours: 1 }
          ],
          requirements: '需要突出幼儿园特色，风格温馨活泼',
          acceptance_criteria: '设计稿通过园长审核，符合品牌形象'
        }),
        default_priority: 'high',
        default_estimated_hours: 9,
        created_by: 1
      },
      {
        name: '亲子活动策划',
        description: '策划和组织亲子互动活动',
        type: 'activity',
        category: '活动策划',
        template_content: JSON.stringify({
          subtasks: [
            { title: '确定活动主题和形式', estimated_hours: 1 },
            { title: '制定活动方案', estimated_hours: 3 },
            { title: '准备活动物料', estimated_hours: 2 },
            { title: '活动现场执行', estimated_hours: 4 },
            { title: '活动总结和反馈收集', estimated_hours: 1 }
          ],
          requirements: '活动要有教育意义，适合不同年龄段',
          acceptance_criteria: '活动顺利进行，家长满意度达到90%以上'
        }),
        default_priority: 'medium',
        default_estimated_hours: 11,
        created_by: 1
      },
      {
        name: '教学计划制定',
        description: '制定月度或周度教学计划',
        type: 'daily',
        category: '教学管理',
        template_content: JSON.stringify({
          subtasks: [
            { title: '分析教学目标', estimated_hours: 1 },
            { title: '设计教学活动', estimated_hours: 3 },
            { title: '准备教学材料', estimated_hours: 2 },
            { title: '制定评估方案', estimated_hours: 1 }
          ],
          requirements: '符合教育大纲要求，适合儿童发展特点',
          acceptance_criteria: '教学计划完整，可操作性强'
        }),
        default_priority: 'medium',
        default_estimated_hours: 7,
        created_by: 1
      }
    ];
    
    for (const template of templates) {
      await connection.execute(`
        INSERT INTO task_templates (name, description, type, category, template_content, default_priority, default_estimated_hours, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        template.name,
        template.description,
        template.type,
        template.category,
        template.template_content,
        template.default_priority,
        template.default_estimated_hours,
        template.created_by
      ]);
      
      console.log(`  ✅ 插入模板: ${template.name}`);
    }
    
    console.log('📦 初始数据插入完成');
    
  } catch (error) {
    console.error('❌ 插入初始数据失败:', error.message);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initTaskDatabase();
}

module.exports = { initTaskDatabase };
