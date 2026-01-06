const { sequelize } = require('../dist/config/database');

async function createVolcengineASRTable() {
  try {
    console.log('🔧 创建火山引擎ASR配置表...');
    
    // 创建表
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS volcengine_asr_configs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL COMMENT '配置名称',
        app_id VARCHAR(50) NOT NULL COMMENT '火山引擎AppID',
        api_key VARCHAR(200) NOT NULL COMMENT '火山引擎API Key',
        ws_url VARCHAR(200) NOT NULL DEFAULT 'wss://openspeech.bytedance.com/api/v3/sauc/bigmodel' COMMENT 'WebSocket URL',
        resource_id VARCHAR(100) NOT NULL DEFAULT 'volc.bigasr.sauc.duration' COMMENT '资源ID',
        cluster_name VARCHAR(50) NOT NULL DEFAULT 'volcengine_input_common' COMMENT '集群名称',
        sample_rate INT NOT NULL DEFAULT 16000 COMMENT '采样率',
        format VARCHAR(20) NOT NULL DEFAULT 'pcm' COMMENT '音频格式',
        bits INT NOT NULL DEFAULT 16 COMMENT '位深度',
        channel INT NOT NULL DEFAULT 1 COMMENT '声道数',
        language VARCHAR(20) NOT NULL DEFAULT 'zh-CN' COMMENT '语言',
        enable_punc BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否启用标点符号',
        model_name VARCHAR(50) NOT NULL DEFAULT 'bigmodel' COMMENT '模型名称',
        is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否激活',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY idx_name (name),
        KEY idx_is_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='火山引擎ASR配置表'
    `);
    
    console.log('✅ 表创建成功');
    
    // 插入默认配置
    await sequelize.query(`
      INSERT IGNORE INTO volcengine_asr_configs (name, app_id, api_key) 
      VALUES ('默认配置', '7563592522', 'e1545f0e-1d6f-4e70-aab3-3c5fdbec0700')
    `);
    
    console.log('✅ 默认配置插入成功');
    
    // 查询验证
    const [results] = await sequelize.query('SELECT * FROM volcengine_asr_configs');
    console.log('\n📊 当前配置:');
    console.table(results);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
}

createVolcengineASRTable();

