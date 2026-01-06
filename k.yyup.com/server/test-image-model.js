const { sequelize } = require('./src/init');

(async () => {
  try {
    const [results] = await sequelize.query(`
      SELECT id, name, displayName, provider, endpointUrl, 
             SUBSTRING(apiKey, 1, 30) as apiKeyPrefix, modelType, status
      FROM ai_model_configs 
      WHERE name LIKE '%seedream%' AND status = 'active'
      LIMIT 5
    `);
    
    console.log('找到的豆包图片模型配置:');
    console.log(JSON.stringify(results, null, 2));
    
    if (results.length > 0) {
      const config = results[0];
      console.log('\n========== 使用的主配置 ==========');
      console.log('名称:', config.name);
      console.log('显示名:', config.displayName);
      console.log('端点:', config.endpointUrl);
      console.log('密钥前缀:', config.apiKeyPrefix);
      console.log('类型:', config.modelType);
    }
    
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
