import { sequelize } from '../init';

async function fixSystemConfigsTable() {
  try {
    console.log('🔧 开始修复 system_configs 表结构...');
    
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    // 检查表是否存在
    const [tables] = await sequelize.query("SHOW TABLES LIKE 'system_configs'");
    
    if (tables.length === 0) {
      console.log('❌ system_configs 表不存在，创建新表...');
      await createNewTable();
      return;
    }
    
    console.log('✅ system_configs 表存在，检查字段结构...');
    
    // 检查表结构
    const [columns] = await sequelize.query("DESCRIBE system_configs");
    console.log('\n当前表结构:');
    console.table(columns);
    
    const columnNames = (columns as any[]).map(col => col.Field);
    
    // 检查是否有新的字段结构
    const hasNewStructure = columnNames.includes('group_key') && 
                           columnNames.includes('config_key') && 
                           columnNames.includes('config_value');
    
    if (hasNewStructure) {
      console.log('✅ 表结构已是最新版本');
      return;
    }
    
    console.log('🔄 表结构需要更新，开始修复...');
    
    // 备份现有数据
    console.log('📦 备份现有数据...');
    await sequelize.query('CREATE TABLE IF NOT EXISTS system_configs_backup AS SELECT * FROM system_configs');
    
    // 删除旧表
    console.log('🗑️ 删除旧表...');
    await sequelize.query('DROP TABLE system_configs');
    
    // 创建新表
    await createNewTable();
    
    // 尝试从备份恢复数据
    try {
      const [backupData] = await sequelize.query('SELECT COUNT(*) as count FROM system_configs_backup');
      const count = (backupData as any[])[0].count;
      
      if (count > 0) {
        console.log(`🔄 发现 ${count} 条备份数据，开始迁移...`);
        await sequelize.query(`
          INSERT INTO system_configs (group_key, config_key, config_value, value_type, description, is_system, created_at, updated_at)
          SELECT 
            COALESCE(category, 'general') as group_key,
            COALESCE(\`key\`, CONCAT('config_', id)) as config_key,
            COALESCE(value, '') as config_value,
            'string' as value_type,
            COALESCE(description, '') as description,
            COALESCE(is_system, false) as is_system,
            COALESCE(created_at, NOW()) as created_at,
            COALESCE(updated_at, NOW()) as updated_at
          FROM system_configs_backup
        `);
        console.log('✅ 数据迁移完成');
      }
    } catch (error) {
      console.log('⚠️ 数据迁移失败，使用默认配置:', (error as Error).message);
    }
    
    // 删除备份表
    await sequelize.query('DROP TABLE IF EXISTS system_configs_backup');
    
    console.log('🎉 system_configs 表修复完成！');
    
    // 验证修复结果
    const [newColumns] = await sequelize.query("DESCRIBE system_configs");
    console.log('\n修复后的表结构:');
    console.table(newColumns);
    
    const [data] = await sequelize.query("SELECT * FROM system_configs LIMIT 5");
    console.log('\n表数据（前5条）:');
    console.table(data);
    
  } catch (error) {
    console.error('❌ 修复过程中发生错误:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

async function createNewTable() {
  console.log('📝 创建新的 system_configs 表...');
  
  await sequelize.query(`
    CREATE TABLE system_configs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      group_key VARCHAR(50) NOT NULL COMMENT '配置分组键名',
      config_key VARCHAR(100) NOT NULL COMMENT '配置项键名',
      config_value TEXT NOT NULL COMMENT '配置项值',
      value_type VARCHAR(20) NOT NULL DEFAULT 'string' COMMENT '值类型: string, number, boolean, json',
      description VARCHAR(200) NOT NULL COMMENT '配置描述',
      is_system BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否系统配置',
      is_readonly BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否只读配置',
      sort_order INT NOT NULL DEFAULT 0 COMMENT '排序顺序',
      creator_id INT NULL COMMENT '创建人ID',
      updater_id INT NULL COMMENT '更新人ID',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
      deleted_at DATETIME NULL COMMENT '删除时间',
      UNIQUE KEY unique_group_config_key (group_key, config_key)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  
  console.log('✅ 新表创建完成');
  
  // 插入默认配置
  await insertDefaultConfigs();
}

async function insertDefaultConfigs() {
  console.log('📝 插入默认配置...');
  
  const defaultConfigs = [
    ['security', 'sessionTimeout', '24', 'number', '会话超时时间（小时）', true],
    ['basic', 'siteName', '幼儿园管理系统', 'string', '网站名称', false],
    ['basic', 'siteDescription', '专业的幼儿园管理系统', 'string', '网站描述', false],
    ['basic', 'contactEmail', 'admin@kindergarten.com', 'string', '联系邮箱', false],
    ['basic', 'contactPhone', '400-123-4567', 'string', '联系电话', false],
    ['system', 'maintenanceMode', 'false', 'boolean', '维护模式', true],
    ['system', 'allowRegistration', 'true', 'boolean', '允许注册', true],
    ['ai', 'defaultModel', 'gpt-3.5-turbo', 'string', '默认AI模型', true],
    ['ai', 'maxTokens', '2000', 'number', '最大Token数', true],
    ['ai', 'temperature', '0.7', 'number', 'AI温度参数', true]
  ];
  
  for (const config of defaultConfigs) {
    await sequelize.query(`
      INSERT IGNORE INTO system_configs 
      (group_key, config_key, config_value, value_type, description, is_system, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, {
      replacements: config
    });
  }
  
  console.log('✅ 默认配置插入完成');
}

// 运行修复
fixSystemConfigsTable().catch(console.error);
