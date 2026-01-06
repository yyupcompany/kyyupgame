import { sequelize } from './src/init';

(async () => {
  try {
    const [results] = await sequelize.query(`
      SELECT id, name, displayName, endpointUrl, apiKey
      FROM ai_model_configs 
      WHERE name = 'doubao-seedream-4-5-251128' AND status = 'active'
    `) as any[];
    
    if (results.length > 0) {
      const config = results[0];
      console.log('完整配置:');
      console.log(JSON.stringify({
        name: config.name,
        displayName: config.displayName,
        endpointUrl: config.endpointUrl,
        apiKey: config.apiKey
      }, null, 2));
    }
    
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
