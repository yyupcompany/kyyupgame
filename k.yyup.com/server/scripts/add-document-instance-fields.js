const { Sequelize } = require('sequelize');

// 数据库配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: console.log
});

async function addFields() {
  try {
    console.log('🔌 连接数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    const fieldsToAdd = [
      { name: 'started_at', type: 'DATETIME', comment: '开始填写时间' },
      { name: 'completed_at', type: 'DATETIME', comment: '完成时间' },
      { name: 'reviewers', type: 'JSON', comment: '审核人ID列表（JSON格式）' },
      { name: 'attachments', type: 'JSON', comment: '附件列表（JSON格式）' },
      { name: 'tags', type: 'JSON', comment: '标签（JSON数组）' },
      { name: 'metadata', type: 'JSON', comment: '元数据（JSON格式）' }
    ];

    for (const field of fieldsToAdd) {
      try {
        console.log(`📝 添加 ${field.name} 字段...`);
        await sequelize.query(`
          ALTER TABLE document_instances
          ADD COLUMN ${field.name} ${field.type} NULL COMMENT '${field.comment}'
        `);
        console.log(`✅ ${field.name} 字段添加成功`);
      } catch (error) {
        if (error.message.includes('Duplicate column name')) {
          console.log(`ℹ️  ${field.name} 字段已存在，跳过`);
        } else {
          throw error;
        }
      }
    }

    console.log('🎉 所有字段添加完成！');
  } catch (error) {
    console.error('❌ 错误:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

addFields();

