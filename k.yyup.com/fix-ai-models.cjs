/**
 * 数据库AI模型配置检查和修复脚本
 */
const mysql = require('mysql2/promise');

// 数据库配置（从之前的配置文件推断）
const dbConfig = {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  user: 'root',
  password: 'pwk5ls7j',
  database: 'kargerdensales'
};

async function checkAndFixAIModels() {
  let connection;
  
  try {
    console.log('🔌 连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');

    // 1. 检查ai_model_config表是否存在
    console.log('\n1️⃣ 检查ai_model_config表...');
    const [tables] = await connection.query("SHOW TABLES LIKE 'ai_model_config'");
    if (tables.length === 0) {
      console.log('❌ ai_model_config表不存在');
      return;
    }
    console.log('✅ ai_model_config表存在');

    // 2. 检查表结构
    console.log('\n2️⃣ 检查表结构...');
    const [columns] = await connection.query('DESCRIBE ai_model_config');
    console.log('📋 表结构:');
    console.table(columns);

    // 3. 检查现有记录
    console.log('\n3️⃣ 检查现有AI模型记录...');
    const [models] = await connection.query('SELECT * FROM ai_model_config ORDER BY id');
    console.log(`📊 当前模型数量: ${models.length}`);
    
    if (models.length > 0) {
      console.log('📋 现有模型列表:');
      models.forEach((model, index) => {
        console.log(`${index + 1}. ${model.name} (${model.provider}) - ${model.status} - Default: ${model.is_default ? 'Yes' : 'No'}`);
        console.log(`   端点: ${model.endpoint_url}`);
        console.log(`   API密钥: ${model.api_key ? '已配置' : '未配置'}`);
        console.log('');
      });
    } else {
      console.log('⚠️ 没有找到任何AI模型配置');
      
      // 4. 如果没有模型，创建默认的豆包模型配置
      console.log('\n4️⃣ 创建默认豆包模型配置...');
      
      const defaultModel = {
        name: 'doubao-seed-1-6-thinking-250615',
        display_name: '豆包思维链模型',
        provider: 'bytedance_doubao',
        model_type: 'text',
        api_version: 'v3',
        endpoint_url: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
        api_key: '1c155dc7-0cec-441b-9b00-0fb8ccc16089',
        model_parameters: JSON.stringify({
          temperature: 0.7,
          max_tokens: 4000,
          top_p: 0.9,
          frequency_penalty: 0,
          presence_penalty: 0
        }),
        description: '字节跳动豆包AI思维链模型，支持复杂推理和思考过程',
        capabilities: JSON.stringify(['text_generation', 'thinking_chain', 'reasoning', 'function_calling']),
        max_tokens: 4000,
        status: 'active',
        is_default: 1,
        creator_id: 1
      };

      try {
        const [result] = await connection.query(`
          INSERT INTO ai_model_config (
            name, display_name, provider, model_type, api_version, 
            endpoint_url, api_key, model_parameters, description, 
            capabilities, max_tokens, status, is_default, creator_id, 
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
          defaultModel.name,
          defaultModel.display_name,
          defaultModel.provider,
          defaultModel.model_type,
          defaultModel.api_version,
          defaultModel.endpoint_url,
          defaultModel.api_key,
          defaultModel.model_parameters,
          defaultModel.description,
          defaultModel.capabilities,
          defaultModel.max_tokens,
          defaultModel.status,
          defaultModel.is_default,
          defaultModel.creator_id
        ]);

        console.log('✅ 默认豆包模型配置创建成功');
        console.log('   插入ID:', result.insertId);
        
        // 验证插入结果
        const [newModels] = await connection.query('SELECT * FROM ai_model_config WHERE id = ?', [result.insertId]);
        if (newModels.length > 0) {
          console.log('📋 新创建的模型配置:');
          console.table(newModels[0]);
        }
        
      } catch (error) {
        console.log('❌ 创建默认模型配置失败:', error.message);
        
        // 如果是因为enum类型不匹配，尝试修复
        if (error.message.includes('enum') || error.message.includes('ENUM')) {
          console.log('\n🔧 尝试修复model_type字段...');
          try {
            // 检查当前enum值
            const [enumInfo] = await connection.query(`
              SELECT COLUMN_TYPE 
              FROM INFORMATION_SCHEMA.COLUMNS 
              WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'ai_model_config' AND COLUMN_NAME = 'model_type'
            `, [dbConfig.database]);
            
            console.log('当前model_type ENUM值:', enumInfo[0]?.COLUMN_TYPE);
            
            // 如果没有'text'值，添加它
            if (!enumInfo[0]?.COLUMN_TYPE.includes("'text'")) {
              await connection.query(`
                ALTER TABLE ai_model_config 
                MODIFY COLUMN model_type ENUM('text','speech','image','video','multimodal') NOT NULL
              `);
              console.log('✅ model_type字段已修复');
              
              // 重新尝试插入
              const [retryResult] = await connection.query(`
                INSERT INTO ai_model_config (
                  name, display_name, provider, model_type, api_version, 
                  endpoint_url, api_key, model_parameters, description, 
                  capabilities, max_tokens, status, is_default, creator_id, 
                  created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
              `, [
                defaultModel.name,
                defaultModel.display_name,
                defaultModel.provider,
                defaultModel.model_type,
                defaultModel.api_version,
                defaultModel.endpoint_url,
                defaultModel.api_key,
                defaultModel.model_parameters,
                defaultModel.description,
                defaultModel.capabilities,
                defaultModel.max_tokens,
                defaultModel.status,
                defaultModel.is_default,
                defaultModel.creator_id
              ]);
              
              console.log('✅ 重试插入成功，插入ID:', retryResult.insertId);
            }
          } catch (fixError) {
            console.log('❌ 修复字段失败:', fixError.message);
          }
        }
      }
    }

    // 5. 检查是否有默认模型
    console.log('\n5️⃣ 检查默认模型...');
    const [defaultModels] = await connection.query('SELECT * FROM ai_model_config WHERE is_default = 1 AND status = ?', ['active']);
    
    if (defaultModels.length === 0) {
      console.log('⚠️ 没有找到默认模型');
      
      // 将第一个active模型设为默认
      const [activeModels] = await connection.query('SELECT * FROM ai_model_config WHERE status = ? ORDER BY id LIMIT 1', ['active']);
      if (activeModels.length > 0) {
        await connection.query('UPDATE ai_model_config SET is_default = 1 WHERE id = ?', [activeModels[0].id]);
        console.log(`✅ 已将模型 ${activeModels[0].name} 设为默认模型`);
      }
    } else {
      console.log(`✅ 找到默认模型: ${defaultModels[0].name}`);
    }

    // 6. 最终验证
    console.log('\n6️⃣ 最终验证...');
    const [finalModels] = await connection.query('SELECT id, name, provider, status, is_default FROM ai_model_config ORDER BY id');
    console.log('📊 最终模型配置状态:');
    console.table(finalModels);

    console.log('\n🎉 AI模型配置检查和修复完成！');

  } catch (error) {
    console.error('❌ 操作失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

// 运行检查和修复
checkAndFixAIModels().catch(console.error);