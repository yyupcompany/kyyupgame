/**
 * 删除GPT-3.5模型配置脚本
 */
const { Sequelize } = require('sequelize');

// 数据库连接配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: console.log
});

async function deleteGPTModel() {
  try {
    console.log('🔗 连接数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    // 先查看要删除的模型
    console.log('🔍 查看GPT-3.5模型信息...');
    const [beforeResults] = await sequelize.query(`
      SELECT id, name, display_name, is_default, status
      FROM ai_model_config 
      WHERE name = 'gpt-3.5-turbo'
    `);
    
    console.log('📋 删除前的GPT-3.5模型信息:');
    console.table(beforeResults);
    
    if (beforeResults.length > 0) {
      // 删除GPT-3.5模型
      console.log('🗑️ 正在删除GPT-3.5模型...');
      const [deleteResult] = await sequelize.query(`
        DELETE FROM ai_model_config 
        WHERE name = 'gpt-3.5-turbo'
      `);
      
      console.log('✅ GPT-3.5模型已删除');
      
      // 确认删除结果
      console.log('🔍 查看删除后的默认模型...');
      const [afterResults] = await sequelize.query(`
        SELECT id, name, display_name, is_default, status
        FROM ai_model_config 
        WHERE model_type = 'text' AND status = 'active' AND is_default = true
        ORDER BY created_at DESC
      `);
      
      console.log('📋 删除后的默认文本模型:');
      console.table(afterResults);
      
      // 查看豆包模型的参数配置
      console.log('🔍 查看豆包Seed-1.6模型参数...');
      const [doubaoResults] = await sequelize.query(`
        SELECT 
          id,
          name,
          display_name,
          model_parameters,
          is_default
        FROM ai_model_config 
        WHERE name = 'doubao-seed-1-6-thinking-250715'
      `);
      
      console.log('📋 豆包Seed-1.6模型详细信息:');
      doubaoResults.forEach(model => {
        console.log(`ID: ${model.id}`);
        console.log(`名称: ${model.name}`);
        console.log(`显示名称: ${model.display_name}`);
        console.log(`是否默认: ${model.is_default}`);
        console.log(`模型参数:`, JSON.stringify(model.model_parameters, null, 2));
      });
      
    } else {
      console.log('❌ 未找到GPT-3.5模型');
    }
    
  } catch (error) {
    console.error('❌ 操作失败:', error);
  } finally {
    await sequelize.close();
    console.log('🔒 数据库连接已关闭');
  }
}

// 执行删除操作
deleteGPTModel()
  .then(() => {
    console.log('✅ 脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 脚本执行失败:', error);
    process.exit(1);
  });
