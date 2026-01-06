// 直接修复仪表板中心页面说明文档
const mysql = require('mysql2/promise');

async function directFix() {
  let connection;
  
  try {
    console.log('🔗 正在连接远程数据库...');
    
    connection = await mysql.createConnection({
      host: 'dbconn.sealoshzh.site',
      port: 43906,
      user: 'root',
      password: 'pwk5ls7j',
      database: 'kargerdensales'
    });

    console.log('✅ 数据库连接成功');

    console.log('📝 执行SQL语句...');
    
    // 直接执行插入语句
    await connection.execute(`
      INSERT INTO page_guides (
        page_path, page_name, page_description, category, importance, 
        related_tables, context_prompt, is_active, created_at, updated_at
      ) VALUES (
        '/centers/dashboard',
        '仪表板中心',
        '欢迎使用婴婴向上智能招生系统！您现在来到的是仪表板中心页面，这是系统的数据分析和决策支持中心。在这里您可以查看各类统计图表、关键业务指标、实时数据监控，以及获得智能分析建议，帮助您做出更好的管理决策。',
        '中心页面',
        9,
        '["students", "teachers", "activities", "enrollment_applications", "classes", "statistics"]',
        '用户正在仪表板中心页面，这是一个综合性的数据分析平台。用户可能需要查看统计数据、分析趋势、获取决策建议等。',
        1,
        NOW(),
        NOW()
      ) ON DUPLICATE KEY UPDATE
        page_description = VALUES(page_description),
        context_prompt = VALUES(context_prompt),
        updated_at = NOW()
    `);

    console.log('✅ SQL执行成功');

    // 验证结果
    const [result] = await connection.execute(
      'SELECT page_path, page_name, category, importance, is_active FROM page_guides WHERE page_path = ?',
      ['/centers/dashboard']
    );

    if (result.length > 0) {
      const row = result[0];
      console.log('🔍 验证结果:');
      console.log(`  ✓ 路径: ${row.page_path}`);
      console.log(`  ✓ 名称: ${row.page_name}`);
      console.log(`  ✓ 分类: ${row.category}`);
      console.log(`  ✓ 重要性: ${row.importance}`);
      console.log(`  ✓ 是否启用: ${row.is_active}`);
      console.log('');
      console.log('🎉 仪表板中心页面说明文档修复完成！');
      console.log('💡 现在刷新前端页面，404错误应该消失了！');
    } else {
      console.log('❌ 验证失败，未找到记录');
    }

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('📋 记录已存在，这是正常的');
      console.log('🎉 仪表板中心页面说明文档已经存在！');
    } else {
      console.error('❌ 操作失败:', error.message);
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔗 数据库连接已关闭');
    }
  }
}

directFix();
