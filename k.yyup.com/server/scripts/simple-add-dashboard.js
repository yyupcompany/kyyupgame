// 简单的数据库插入脚本
const mysql = require('mysql2/promise');
require('dotenv').config();

async function addDashboardGuide() {
  let connection;
  
  try {
    console.log('🔗 连接数据库...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ 数据库连接成功');

    // 检查是否已存在
    const [existing] = await connection.execute(
      'SELECT id FROM page_guides WHERE page_path = ?',
      ['/centers/dashboard']
    );

    if (existing.length > 0) {
      console.log('📋 记录已存在，更新数据...');
      await connection.execute(`
        UPDATE page_guides SET 
          page_name = ?,
          page_description = ?,
          category = ?,
          importance = ?,
          related_tables = ?,
          context_prompt = ?,
          is_active = ?,
          updated_at = NOW()
        WHERE page_path = ?
      `, [
        '仪表板中心',
        '欢迎使用婴婴向上智能招生系统！您现在来到的是仪表板中心页面，这是系统的数据分析和决策支持中心。在这里您可以查看各类统计图表、关键业务指标、实时数据监控，以及获得智能分析建议，帮助您做出更好的管理决策。',
        '中心页面',
        9,
        JSON.stringify(['students', 'teachers', 'activities', 'enrollment_applications', 'classes', 'statistics']),
        '用户正在仪表板中心页面，这是一个综合性的数据分析平台。用户可能需要查看统计数据、分析趋势、获取决策建议等。',
        1,
        '/centers/dashboard'
      ]);
      console.log('✅ 记录更新成功');
    } else {
      console.log('📋 创建新记录...');
      await connection.execute(`
        INSERT INTO page_guides (
          page_path, page_name, page_description, category, importance,
          related_tables, context_prompt, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        '/centers/dashboard',
        '仪表板中心',
        '欢迎使用婴婴向上智能招生系统！您现在来到的是仪表板中心页面，这是系统的数据分析和决策支持中心。在这里您可以查看各类统计图表、关键业务指标、实时数据监控，以及获得智能分析建议，帮助您做出更好的管理决策。',
        '中心页面',
        9,
        JSON.stringify(['students', 'teachers', 'activities', 'enrollment_applications', 'classes', 'statistics']),
        '用户正在仪表板中心页面，这是一个综合性的数据分析平台。用户可能需要查看统计数据、分析趋势、获取决策建议等。',
        1
      ]);
      console.log('✅ 记录创建成功');
    }

    // 验证数据
    const [result] = await connection.execute(
      'SELECT page_path, page_name, category, importance, is_active FROM page_guides WHERE page_path = ?',
      ['/centers/dashboard']
    );

    if (result.length > 0) {
      const row = result[0];
      console.log('🔍 验证结果:');
      console.log(`  - 路径: ${row.page_path}`);
      console.log(`  - 名称: ${row.page_name}`);
      console.log(`  - 分类: ${row.category}`);
      console.log(`  - 重要性: ${row.importance}`);
      console.log(`  - 是否启用: ${row.is_active}`);
      console.log('✅ 仪表板中心页面说明文档添加完成！');
      console.log('🎉 现在刷新页面，404错误应该消失了！');
    } else {
      console.log('❌ 验证失败，数据未找到');
    }

  } catch (error) {
    console.error('❌ 操作失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔗 数据库连接已关闭');
    }
  }
}

// 执行脚本
addDashboardGuide();
