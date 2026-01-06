const mysql = require('mysql2/promise');
require('dotenv').config();

async function addDashboardCenter() {
  let connection;
  
  try {
    console.log('🔗 连接远程数据库...');
    
    // 创建数据库连接
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      connectTimeout: 60000,
      acquireTimeout: 60000,
      timeout: 60000
    });

    console.log('✅ 远程数据库连接成功');

    // 仪表板中心页面数据
    const dashboardCenterGuide = {
      page_path: '/centers/dashboard',
      page_name: '仪表板中心',
      page_description: '欢迎使用婴婴向上智能招生系统！您现在来到的是仪表板中心页面，这是系统的数据分析和决策支持中心。在这里您可以查看各类统计图表、关键业务指标、实时数据监控，以及获得智能分析建议，帮助您做出更好的管理决策。',
      category: '中心页面',
      importance: 9,
      related_tables: JSON.stringify(['students', 'teachers', 'activities', 'enrollment_applications', 'classes', 'statistics']),
      context_prompt: '用户正在仪表板中心页面，这是一个综合性的数据分析平台。用户可能需要查看统计数据、分析趋势、获取决策建议等。'
    };

    console.log('📝 添加仪表板中心页面说明文档...');

    // 使用 REPLACE INTO 来插入或更新数据
    const insertSql = `
      REPLACE INTO page_guides (
        page_path, page_name, page_description, category, importance, 
        related_tables, context_prompt, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    await connection.execute(insertSql, [
      dashboardCenterGuide.page_path,
      dashboardCenterGuide.page_name,
      dashboardCenterGuide.page_description,
      dashboardCenterGuide.category,
      dashboardCenterGuide.importance,
      dashboardCenterGuide.related_tables,
      dashboardCenterGuide.context_prompt,
      1 // is_active
    ]);

    console.log(`✅ 成功添加页面说明文档: ${dashboardCenterGuide.page_path} - ${dashboardCenterGuide.page_name}`);

    // 查询确认
    console.log('🔍 查询确认数据...');
    const [results] = await connection.execute(
      "SELECT page_path, page_name, category, importance FROM page_guides WHERE page_path = '/centers/dashboard'"
    );

    if (results.length > 0) {
      const row = results[0];
      console.log('✅ 确认数据已存在:');
      console.log(`  - 路径: ${row.page_path}`);
      console.log(`  - 名称: ${row.page_name}`);
      console.log(`  - 分类: ${row.category}`);
      console.log(`  - 重要性: ${row.importance}`);
    } else {
      console.log('❌ 数据未找到，可能插入失败');
    }

    console.log('✅ 仪表板中心页面说明文档添加完成！');

  } catch (error) {
    console.error('❌ 操作失败:', error.message);
    if (error.code) {
      console.error('错误代码:', error.code);
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔗 数据库连接已关闭');
    }
  }
}

// 执行脚本
addDashboardCenter();
