/**
 * 创建用量配额表
 */

import { sequelize } from '../init';
import { QueryTypes } from 'sequelize';

async function createUsageQuotasTable() {
  console.log('🚀 开始创建用量配额表...\n');

  try {
    // 检查表是否已存在
    const tables = await sequelize.query(
      `SHOW TABLES LIKE 'usage_quotas'`,
      { type: QueryTypes.SELECT }
    ) as any[];

    if (tables.length > 0) {
      console.log('ℹ️  usage_quotas表已存在，跳过创建\n');
      return;
    }

    // 创建表
    await sequelize.query(`
      CREATE TABLE usage_quotas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        monthly_quota INT DEFAULT 10000 COMMENT '每月调用次数配额',
        monthly_cost_quota DECIMAL(10, 6) DEFAULT 100.000000 COMMENT '每月费用配额(元)',
        warning_enabled TINYINT(1) DEFAULT 0 COMMENT '是否启用预警',
        warning_threshold INT DEFAULT 80 COMMENT '预警阈值(%)',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_id (user_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用量配额表';
    `, { type: QueryTypes.RAW });

    console.log('✅ usage_quotas表创建成功\n');

    // 创建索引
    await sequelize.query(`
      CREATE INDEX idx_user_id ON usage_quotas(user_id);
    `, { type: QueryTypes.RAW });

    console.log('✅ 索引创建成功\n');

    console.log('🎉 用量配额表创建完成！');

  } catch (error) {
    console.error('❌ 创建用量配额表失败:', error);
    throw error;
  }
}

// 执行脚本
if (require.main === module) {
  createUsageQuotasTable()
    .then(() => {
      console.log('\n✅ 脚本执行成功');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ 脚本执行失败:', error);
      process.exit(1);
    });
}

export { createUsageQuotasTable };

