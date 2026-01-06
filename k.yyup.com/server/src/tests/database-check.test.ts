import { sequelize } from '../init';
import { QueryTypes } from 'sequelize';

// 检查远程数据库中的AI模型配置
describe('Database AI Model Configuration Check', () => {
  beforeAll(async () => {
    try {
      await sequelize.authenticate();
      console.log('✅ 数据库连接成功');
    } catch (error) {
      console.error('❌ 数据库连接失败:', error);
      throw error;
    }
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('应该能够查询ai_model_config表结构', async () => {
    try {
      const result = await sequelize.query(
        'DESCRIBE ai_model_config',
        { type: QueryTypes.SELECT }
      );
      
      console.log('📋 ai_model_config表结构:');
      console.table(result);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    } catch (error) {
      console.error('查询表结构失败:', error);
      throw error;
    }
  });

  test('应该能够查询ai_model_config表中的所有记录', async () => {
    try {
      const result = await sequelize.query(
        'SELECT * FROM ai_model_config ORDER BY id',
        { type: QueryTypes.SELECT }
      );
      
      console.log('📊 ai_model_config表中的所有记录:');
      console.log(`总记录数: ${result.length}`);
      
      if (result.length > 0) {
        result.forEach((record: any, index) => {
          console.log(`\n记录 ${index + 1}:`);
          console.log(`  ID: ${record.id}`);
          console.log(`  名称: ${record.name}`);
          console.log(`  显示名称: ${record.display_name}`);
          console.log(`  提供商: ${record.provider}`);
          console.log(`  模型类型: ${record.model_type}`);
          console.log(`  端点URL: ${record.endpoint_url}`);
          console.log(`  API密钥: ${record.api_key?.substring(0, 8)}...`);
          console.log(`  状态: ${record.status}`);
          console.log(`  是否默认: ${record.is_default}`);
          console.log(`  创建时间: ${record.created_at}`);
          console.log(`  更新时间: ${record.updated_at}`);
        });
      } else {
        console.log('⚠️ 表中没有记录');
      }
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    } catch (error) {
      console.error('查询记录失败:', error);
      throw error;
    }
  });

  test('应该能够查询豆包模型配置', async () => {
    try {
      const result = await sequelize.query(
        `SELECT * FROM ai_model_config 
         WHERE provider = 'bytedance_doubao' 
         ORDER BY id`,
        { type: QueryTypes.SELECT }
      );
      
      console.log('🤖 豆包模型配置:');
      console.log(`豆包模型数量: ${result.length}`);
      
      if (result.length > 0) {
        result.forEach((record: any, index) => {
          console.log(`\n豆包模型 ${index + 1}:`);
          console.log(`  ID: ${record.id}`);
          console.log(`  名称: ${record.name}`);
          console.log(`  显示名称: ${record.display_name}`);
          console.log(`  模型类型: ${record.model_type}`);
          console.log(`  端点URL: ${record.endpoint_url}`);
          console.log(`  API密钥: ${record.api_key?.substring(0, 8)}...`);
          console.log(`  状态: ${record.status}`);
          console.log(`  是否默认: ${record.is_default}`);
          console.log(`  模型参数: ${record.model_parameters}`);
        });
      } else {
        console.log('⚠️ 未找到豆包模型配置');
      }
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    } catch (error) {
      console.error('查询豆包模型失败:', error);
      throw error;
    }
  });

  test('应该能够查询特定的豆包1.6 thinking模型', async () => {
    try {
      const result = await sequelize.query(
        `SELECT * FROM ai_model_config 
         WHERE name = 'doubao-seed-1-6-thinking-250615'`,
        { type: QueryTypes.SELECT }
      );
      
      console.log('🧠 豆包1.6 Thinking模型配置:');
      
      if (result.length > 0) {
        const model = result[0] as any;
        console.log('✅ 找到豆包1.6 Thinking模型:');
        console.log(`  ID: ${model.id}`);
        console.log(`  名称: ${model.name}`);
        console.log(`  显示名称: ${model.display_name}`);
        console.log(`  提供商: ${model.provider}`);
        console.log(`  模型类型: ${model.model_type}`);
        console.log(`  端点URL: ${model.endpoint_url}`);
        console.log(`  API密钥: ${model.api_key?.substring(0, 8)}...`);
        console.log(`  状态: ${model.status}`);
        console.log(`  是否默认: ${model.is_default}`);
        console.log(`  模型参数: ${model.model_parameters}`);
        console.log(`  创建时间: ${model.created_at}`);
        console.log(`  更新时间: ${model.updated_at}`);
        
        expect(model.name).toBe('doubao-seed-1-6-thinking-250615');
        expect(model.provider).toBe('bytedance_doubao');
        expect(model.status).toBe('active');
      } else {
        console.log('❌ 未找到豆包1.6 Thinking模型配置');
        console.log('💡 需要在数据库中添加该模型配置');
      }
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    } catch (error) {
      console.error('查询特定豆包模型失败:', error);
      throw error;
    }
  });

  test('应该能够查询活跃状态的模型', async () => {
    try {
      const result = await sequelize.query(
        `SELECT * FROM ai_model_config 
         WHERE status = 'active' 
         ORDER BY is_default DESC, id ASC`,
        { type: QueryTypes.SELECT }
      );
      
      console.log('🟢 活跃状态的模型:');
      console.log(`活跃模型数量: ${result.length}`);
      
      if (result.length > 0) {
        result.forEach((record: any, index) => {
          console.log(`\n活跃模型 ${index + 1}:`);
          console.log(`  ID: ${record.id}`);
          console.log(`  名称: ${record.name}`);
          console.log(`  显示名称: ${record.display_name}`);
          console.log(`  提供商: ${record.provider}`);
          console.log(`  是否默认: ${record.is_default ? '是' : '否'}`);
        });
      } else {
        console.log('⚠️ 未找到活跃状态的模型');
      }
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    } catch (error) {
      console.error('查询活跃模型失败:', error);
      throw error;
    }
  });

  test('应该能够测试AI模型缓存服务的数据库加载', async () => {
    try {
      // 模拟AIModelCacheService的数据库查询
      const result = await sequelize.query(`
        SELECT
          id, name, display_name, provider, model_type, endpoint_url,
          api_key, model_parameters, status, is_default
        FROM ai_model_config
        WHERE status = 'active'
        ORDER BY is_default DESC, created_at ASC
      `, { type: QueryTypes.SELECT });

      console.log('🔄 模拟AI模型缓存服务的数据库加载:');
      console.log(`查询到 ${result.length} 个活跃模型`);

      if (result.length > 0) {
        const models = result as any[];
        
        console.log('\n📋 模型列表:');
        models.forEach((model, index) => {
          console.log(`${index + 1}. ${model.name} (${model.provider})`);
          console.log(`   显示名称: ${model.display_name}`);
          console.log(`   类型: ${model.model_type}`);
          console.log(`   默认: ${model.is_default ? '是' : '否'}`);
          console.log(`   端点: ${model.endpoint_url}`);
          console.log(`   API密钥: ${model.api_key?.substring(0, 8)}...`);
          
          // 解析模型参数
          try {
            if (model.model_parameters) {
              const params = typeof model.model_parameters === 'string' 
                ? JSON.parse(model.model_parameters) 
                : model.model_parameters;
              console.log(`   参数: ${JSON.stringify(params)}`);
            }
          } catch (e) {
            console.log(`   参数解析失败: ${model.model_parameters}`);
          }
          console.log('');
        });

        // 检查是否有豆包模型
        const doubaoModels = models.filter(m => m.name.includes('doubao'));
        console.log(`🤖 豆包模型数量: ${doubaoModels.length}`);
        
        // 检查是否有默认模型
        const defaultModels = models.filter(m => m.is_default);
        console.log(`⭐ 默认模型数量: ${defaultModels.length}`);
        
        if (defaultModels.length > 0) {
          console.log(`默认模型: ${defaultModels[0].name}`);
        }
      } else {
        console.log('⚠️ 数据库中没有活跃的AI模型配置');
        console.log('💡 这可能是为什么AI专家系统使用fallback配置的原因');
      }
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    } catch (error) {
      console.error('模拟缓存服务查询失败:', error);
      throw error;
    }
  });
});
