const { Sequelize } = require('sequelize');

// 数据库配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5l57j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: console.log
});

async function createTable() {
  try {
    const sql = `
    CREATE TABLE IF NOT EXISTS ai_billing_records (
      id INT AUTO_INCREMENT PRIMARY KEY COMMENT '计费记录ID',
      user_id INT NOT NULL COMMENT '用户ID',
      model_id INT NOT NULL COMMENT '模型ID',
      usage_id INT NOT NULL COMMENT '关联的使用记录ID',
      billing_type ENUM('token', 'second', 'count', 'character') NOT NULL COMMENT '计费类型',
      quantity DECIMAL(12, 2) NOT NULL DEFAULT 0 COMMENT '计量数量',
      unit VARCHAR(20) NOT NULL COMMENT '计量单位',
      input_tokens INT DEFAULT 0 COMMENT '输入Token数',
      output_tokens INT DEFAULT 0 COMMENT '输出Token数',
      duration_seconds DECIMAL(10, 2) DEFAULT 0 COMMENT '时长(秒)',
      image_count INT DEFAULT 0 COMMENT '图片数量',
      character_count INT DEFAULT 0 COMMENT '字符数',
      input_price DECIMAL(12, 8) DEFAULT 0 COMMENT '输入单价',
      output_price DECIMAL(12, 8) DEFAULT 0 COMMENT '输出单价',
      unit_price DECIMAL(12, 8) NOT NULL COMMENT '统一单价',
      total_cost DECIMAL(10, 6) NOT NULL COMMENT '总费用',
      currency VARCHAR(10) DEFAULT 'USD' COMMENT '货币单位',
      billing_status ENUM('pending', 'calculated', 'billed', 'paid', 'failed', 'refunded') DEFAULT 'pending' COMMENT '计费状态',
      billing_time DATETIME COMMENT '计费时间',
      payment_time DATETIME COMMENT '支付时间',
      billing_cycle VARCHAR(20) COMMENT '计费周期',
      remark TEXT COMMENT '备注信息',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
      FOREIGN KEY (model_id) REFERENCES ai_model_config(id) ON UPDATE CASCADE ON DELETE RESTRICT,
      FOREIGN KEY (usage_id) REFERENCES ai_model_usage(id) ON UPDATE CASCADE ON DELETE CASCADE,
      UNIQUE KEY idx_billing_usage_id (usage_id),
      KEY idx_billing_user_id (user_id),
      KEY idx_billing_model_id (model_id),
      KEY idx_billing_status (billing_status),
      KEY idx_billing_time (billing_time),
      KEY idx_billing_cycle (billing_cycle),
      KEY idx_billing_created_at (created_at),
      KEY idx_billing_user_cycle (user_id, billing_cycle),
      KEY idx_billing_user_status (user_id, billing_status)
    ) COMMENT='AI计费记录表'
    `;

    await sequelize.query(sql);
    console.log('✅ ai_billing_records 表创建成功');
    process.exit(0);
  } catch (error) {
    console.error('❌ 创建表失败:', error.message);
    process.exit(1);
  }
}

createTable();

