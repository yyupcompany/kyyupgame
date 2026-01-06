// 检查 /centers/marketing 下四个子页面的页面感知说明状态
// 仅查询，不执行任何增删改操作

const mysql = require('mysql2/promise');

async function checkPageGuides() {
  let connection;
  try {
    console.log('🔗 连接远程数据库...');
    connection = await mysql.createConnection({
      host: 'dbconn.sealoshzh.site',
      port: 43906,
      user: 'root',
      password: 'pwk5ls7j',
      database: 'kargerdensales'
    });
    console.log('✅ 数据库连接成功');

    // 定义需要检查的四个子页面路径
    const targetPaths = [
      '/centers/marketing/channels',
      '/centers/marketing/referrals', 
      '/centers/marketing/conversions',
      '/centers/marketing/funnel'
    ];

    console.log('\n📋 检查营销中心四个子页面的页面感知状态...\n');

    const results = {
      existing: [],
      missing: []
    };

    for (const path of targetPaths) {
      console.log(`🔍 检查: ${path}`);
      
      // 查询 page_guides
      const [pageRows] = await connection.execute(
        'SELECT id, page_name, page_description, category, importance, related_tables, context_prompt, is_active FROM page_guides WHERE page_path = ?',
        [path]
      );

      if (pageRows.length > 0) {
        const page = pageRows[0];
        console.log(`   ✅ 已存在: ${page.page_name} (ID: ${page.id})`);
        console.log(`      分类: ${page.category}, 重要性: ${page.importance}, 状态: ${page.is_active ? '启用' : '禁用'}`);
        
        // 查询对应的 sections
        const [sectionRows] = await connection.execute(
          'SELECT section_name, section_description, sort_order FROM page_guide_sections WHERE page_guide_id = ? AND is_active = 1 ORDER BY sort_order',
          [page.id]
        );
        
        if (sectionRows.length > 0) {
          console.log(`      功能区块 (${sectionRows.length}个):`);
          sectionRows.forEach(section => {
            console.log(`        ${section.sort_order}. ${section.section_name}: ${section.section_description}`);
          });
        } else {
          console.log(`      ⚠️  无功能区块`);
        }
        
        results.existing.push({
          path,
          page,
          sections: sectionRows
        });
      } else {
        console.log(`   ❌ 缺失页面感知记录`);
        results.missing.push(path);
      }
      console.log('');
    }

    // 汇总报告
    console.log('📊 检查结果汇总:');
    console.log(`   ✅ 已配置页面感知: ${results.existing.length}/${targetPaths.length}`);
    console.log(`   ❌ 缺失页面感知: ${results.missing.length}/${targetPaths.length}`);
    
    if (results.missing.length > 0) {
      console.log('\n🚨 缺失的页面:');
      results.missing.forEach(path => {
        console.log(`   - ${path}`);
      });
      console.log('\n💡 建议: 需要通过MCP浏览器实际访问这些页面，了解功能后创建准确的页面感知说明');
    }

    if (results.existing.length > 0) {
      console.log('\n✅ 已配置的页面:');
      results.existing.forEach(item => {
        console.log(`   - ${item.path}: ${item.page.page_name} (${item.sections.length}个功能区块)`);
      });
    }

  } catch (err) {
    console.error('❌ 检查失败:', err.message || err);
    process.exitCode = 1;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔗 数据库连接已关闭');
    }
  }
}

checkPageGuides();
