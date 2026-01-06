/**
 * 修复TTS模型的model_type
 * 将doubao-tts-bigmodel的model_type改为'speech'
 */

const { Sequelize } = require('sequelize');

// 数据库配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: false
});

async function fixModelType() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');
    
    // 先查看当前配置
    console.log('📊 当前 doubao-tts-bigmodel 配置:\n');
    const [beforeModels] = await sequelize.query(`
      SELECT id, name, model_type, status, endpoint_url
      FROM ai_model_config
      WHERE name = 'doubao-tts-bigmodel'
    `);
    
    if (beforeModels.length === 0) {
      console.log('❌ 未找到 doubao-tts-bigmodel 模型');
      return;
    }
    
    const before = beforeModels[0];
    console.log(`   ID: ${before.id}`);
    console.log(`   名称: ${before.name}`);
    console.log(`   模型类型: ${before.model_type}`);
    console.log(`   状态: ${before.status}`);
    console.log(`   端点URL: ${before.endpoint_url}\n`);
    
    // 检查是否需要修改
    if (before.model_type === 'speech' && before.status === 'active') {
      console.log('✅ 模型配置已正确，无需修改');
      return;
    }
    
    // 修改 model_type 和 status
    console.log('📝 修复模型配置...\n');
    const [updateResult] = await sequelize.query(`
      UPDATE ai_model_config
      SET 
        model_type = 'speech',
        status = 'active'
      WHERE name = 'doubao-tts-bigmodel'
    `);
    
    console.log(`✅ 已更新配置，影响行数: ${updateResult.affectedRows || 0}\n`);
    
    // 验证更新结果
    const [afterModels] = await sequelize.query(`
      SELECT id, name, model_type, status, endpoint_url
      FROM ai_model_config
      WHERE name = 'doubao-tts-bigmodel'
    `);
    
    const after = afterModels[0];
    console.log('📊 更新后的配置:');
    console.log(`   ID: ${after.id}`);
    console.log(`   名称: ${after.name}`);
    console.log(`   模型类型: ${after.model_type} ${after.model_type === 'speech' ? '✅' : '❌'}`);
    console.log(`   状态: ${after.status} ${after.status === 'active' ? '✅' : '❌'}`);
    console.log(`   端点URL: ${after.endpoint_url}\n`);
    
    // 检查是否有其他 active 的 speech 模型
    console.log('📋 检查其他 speech 模型:\n');
    const [otherModels] = await sequelize.query(`
      SELECT id, name, model_type, status
      FROM ai_model_config
      WHERE model_type = 'speech' AND id != ${after.id}
      ORDER BY id
    `);
    
    if (otherModels.length > 0) {
      console.log(`   找到 ${otherModels.length} 个其他 speech 模型:`);
      otherModels.forEach(m => {
        console.log(`   - ${m.name} (ID: ${m.id}, 状态: ${m.status})`);
      });
      
      const activeOthers = otherModels.filter(m => m.status === 'active');
      if (activeOthers.length > 0) {
        console.log(`\n⚠️ 警告: 有 ${activeOthers.length} 个其他 active 状态的 speech 模型`);
        console.log('   text-to-speech.controller.ts 会查询第一个找到的 active speech 模型');
        console.log('   建议将其他模型设为 inactive，或确保 doubao-tts-bigmodel 的 ID 最小');
      }
    } else {
      console.log('   ✅ 没有其他 speech 模型');
    }
    
    console.log('\n✅ 配置修复完成！');
    console.log('\n📋 下一步:');
    console.log('   1. 重启后端服务');
    console.log('   2. 运行测试: node test-local-tts-api.cjs');
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

fixModelType();

