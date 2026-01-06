// 修复远程数据库中的仪表板中心页面说明文档
const mysql = require('mysql2/promise');

async function fixRemoteDashboard() {
  let connection;
  
  try {
    console.log('🔗 连接远程数据库 kargerdensales...');
    
    // 使用确切的远程数据库配置
    connection = await mysql.createConnection({
      host: 'dbconn.sealoshzh.site',
      port: 43906,
      user: 'root',
      password: 'pwk5ls7j',
      database: 'kargerdensales',
      connectTimeout: 60000,
      acquireTimeout: 60000,
      timeout: 60000
    });

    console.log('✅ 远程数据库连接成功');

    // 首先检查表是否存在
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'page_guides'"
    );

    if (tables.length === 0) {
      console.log('❌ page_guides 表不存在');
      return;
    }

    console.log('✅ page_guides 表存在');

    // 检查是否已存在记录
    const [existing] = await connection.execute(
      'SELECT id, page_name FROM page_guides WHERE page_path = ?',
      ['/centers/dashboard']
    );

    if (existing.length > 0) {
      console.log('📋 记录已存在，更新数据...');
      console.log(`当前记录: ID=${existing[0].id}, 名称=${existing[0].page_name}`);
      
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
      'SELECT page_path, page_name, category, importance, is_active, created_at FROM page_guides WHERE page_path = ?',
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
      console.log(`  - 创建时间: ${row.created_at}`);
      console.log('');
      console.log('✅ 仪表板中心页面说明文档修复完成！');
      console.log('🎉 现在刷新页面，404错误应该消失了！');
    } else {
      console.log('❌ 验证失败，数据未找到');
    }

    // 显示所有页面说明文档
    console.log('');
    console.log('📋 当前所有页面说明文档:');
    const [allGuides] = await connection.execute(
      'SELECT page_path, page_name, category FROM page_guides ORDER BY category, page_path'
    );
    
    allGuides.forEach(guide => {
      console.log(`  - ${guide.page_path}: ${guide.page_name} (${guide.category})`);
    });

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
fixRemoteDashboard();
