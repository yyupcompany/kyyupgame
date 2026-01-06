const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

async function updateMenuOrder() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔄 开始更新菜单排序...\n');
    
    // 用户要求的新排序
    const newOrder = [
      { name: 'Dashboard Center', chinese_name: '仪表板中心', sort: 1 },
      { name: 'Personnel Center', chinese_name: '人员中心', sort: 2 },
      { name: 'Enrollment Center', chinese_name: '招生中心', sort: 3 },
      { name: 'Marketing Center', chinese_name: '营销中心', sort: 4 },
      { name: 'Activity Center', chinese_name: '活动中心', sort: 5 },
      { name: 'Media Center', chinese_name: '新媒体中心', sort: 6 },
      { name: '任务中心', chinese_name: '任务中心', sort: 7 }, // 这个用中文名匹配
      { name: 'Script Center', chinese_name: '话术中心', sort: 8 },
      { name: 'FinanceCenter', chinese_name: '财务中心', sort: 9 }, // 财务中心有多个，选择主要的
      { name: 'AI Center', chinese_name: 'AI中心', sort: 10 },
      { name: '系统管理', chinese_name: '系统中心', sort: 11 } // 系统管理对应系统中心
    ];
    
    console.log('📋 执行更新操作:');
    
    for (const item of newOrder) {
      try {
        // 根据name或chinese_name匹配
        const [result] = await connection.execute(`
          UPDATE permissions 
          SET sort = ?, updated_at = NOW() 
          WHERE type = 'category' 
          AND (name = ? OR chinese_name = ?)
          AND status = 1
        `, [item.sort, item.name, item.chinese_name]);
        
        if (result.affectedRows > 0) {
          console.log(`✅ 更新成功: ${item.chinese_name} → 排序 ${item.sort} (影响 ${result.affectedRows} 行)`);
        } else {
          console.log(`⚠️ 未找到匹配项: ${item.name} / ${item.chinese_name}`);
        }
      } catch (error) {
        console.error(`❌ 更新失败: ${item.chinese_name} - ${error.message}`);
      }
    }
    
    // 验证更新结果
    console.log('\n🔍 验证更新结果:');
    const [categories] = await connection.execute(`
      SELECT id, name, chinese_name, code, sort, status 
      FROM permissions 
      WHERE type='category' AND status=1
      ORDER BY sort ASC
    `);
    
    console.log('更新后的排序:');
    console.log('排序 | 名称 | 中文名 | 代码');
    console.log('-----|------|-------|-----');
    categories.forEach(cat => {
      console.log(`${cat.sort} | ${cat.name} | ${cat.chinese_name || 'N/A'} | ${cat.code}`);
    });
    
    console.log('\n✅ 菜单排序更新完成！');
    
  } catch (error) {
    console.error('❌ 更新菜单排序失败:', error.message);
  } finally {
    await connection.end();
  }
}

updateMenuOrder().catch(console.error);
