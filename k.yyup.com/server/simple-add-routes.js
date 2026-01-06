const mysql = require('mysql2/promise');

async function addAIRoutes() {
  let connection;
  try {
    console.log('🔗 正在连接数据库...');
    connection = await mysql.createConnection({
      host: 'dbconn.sealoshzh.site',
      port: 43906,
      user: 'root',
      password: 'kargerdensales',
      database: 'kargerdensales'
    });
    console.log('✅ 数据库连接成功');

    // 查找AI助手的父级ID
    console.log('🔍 查找AI助手父级路由...');
    const [aiParent] = await connection.execute(`
      SELECT id, name, chinese_name, path
      FROM permissions 
      WHERE chinese_name = 'AI中心' OR name = 'AI中心' OR path = '/centers/ai'
      LIMIT 1
    `);
    
    if (aiParent.length === 0) {
      console.error('❌ 找不到AI中心父级路由');
      return;
    }
    
    const parentId = aiParent[0].id;
    console.log(`✅ 找到AI中心父级路由，ID: ${parentId}, 名称: ${aiParent[0].chinese_name}`);
    
    // 获取当前最大的sort值
    const [maxSort] = await connection.execute(`
      SELECT MAX(sort) as max_sort FROM permissions WHERE parent_id = ?
    `, [parentId]);
    
    let currentSort = (maxSort[0].max_sort || 0) + 10;
    console.log(`📊 当前最大sort值: ${maxSort[0].max_sort}, 新的sort值从: ${currentSort} 开始`);
    
    // 检查并添加AI数据分析路由
    const [existingAnalytics] = await connection.execute(`
      SELECT id FROM permissions WHERE path = '/ai/analytics' OR chinese_name = 'AI数据分析'
    `);
    
    if (existingAnalytics.length === 0) {
      console.log('➕ 添加AI数据分析路由...');
      await connection.execute(`
        INSERT INTO permissions (
          name, chinese_name, code, type, parent_id, path, component, file_path,
          permission, icon, sort, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        'AI数据分析',
        'AI数据分析', 
        'AI_ANALYTICS',
        'menu',
        parentId,
        '/ai/analytics',
        'pages/ai/analytics/index.vue',
        'pages/ai/analytics/index.vue',
        'AI_ANALYTICS',
        'DataAnalysis',
        currentSort,
        1
      ]);
      console.log('✅ AI数据分析路由添加成功');
      currentSort += 10;
    } else {
      console.log('⚠️ AI数据分析路由已存在');
    }
    
    // 检查并添加AI模型管理路由
    const [existingModels] = await connection.execute(`
      SELECT id FROM permissions WHERE path = '/ai/models' OR chinese_name = 'AI模型管理'
    `);
    
    if (existingModels.length === 0) {
      console.log('➕ 添加AI模型管理路由...');
      await connection.execute(`
        INSERT INTO permissions (
          name, chinese_name, code, type, parent_id, path, component, file_path,
          permission, icon, sort, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        'AI模型管理',
        'AI模型管理',
        'AI_MODELS',
        'menu',
        parentId,
        '/ai/models',
        'pages/ai/models/index.vue',
        'pages/ai/models/index.vue',
        'AI_MODELS',
        'Setting',
        currentSort,
        1
      ]);
      console.log('✅ AI模型管理路由添加成功');
      currentSort += 10;
    } else {
      console.log('⚠️ AI模型管理路由已存在');
    }
    
    // 检查并添加AI预测分析路由
    const [existingPredictions] = await connection.execute(`
      SELECT id FROM permissions WHERE path = '/ai/predictions' OR chinese_name = 'AI预测分析'
    `);
    
    if (existingPredictions.length === 0) {
      console.log('➕ 添加AI预测分析路由...');
      await connection.execute(`
        INSERT INTO permissions (
          name, chinese_name, code, type, parent_id, path, component, file_path,
          permission, icon, sort, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        'AI预测分析',
        'AI预测分析',
        'AI_PREDICTIONS',
        'menu',
        parentId,
        '/ai/predictions',
        'pages/ai/predictions/index.vue',
        'pages/ai/predictions/index.vue',
        'AI_PREDICTIONS',
        'TrendCharts',
        currentSort,
        1
      ]);
      console.log('✅ AI预测分析路由添加成功');
    } else {
      console.log('⚠️ AI预测分析路由已存在');
    }
    
    console.log('🎉 AI路由添加完成！');
    
  } catch (error) {
    console.error('❌ 操作失败:', error.message);
    console.error('错误详情:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

addAIRoutes();
