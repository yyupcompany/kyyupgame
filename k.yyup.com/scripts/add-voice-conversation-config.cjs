/**
 * 添加语音对话配置到数据库
 * 
 * 包括：
 * 1. LLM配置（已验证可用）
 * 2. TTS配置（使用数据库已有配置）
 * 3. ASR配置（待验证）
 */

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: false
});

async function addVoiceConversationConfig() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 1. 检查LLM配置是否已存在
    console.log('📊 检查LLM配置...');
    const [llmConfigs] = await sequelize.query(`
      SELECT id, name, display_name, status, is_default
      FROM ai_model_config
      WHERE name = 'doubao-seed-1-6-flash-250715'
      LIMIT 1
    `);

    if (llmConfigs.length > 0) {
      console.log('✅ LLM配置已存在:');
      console.log(`   ID: ${llmConfigs[0].id}`);
      console.log(`   名称: ${llmConfigs[0].display_name}`);
      console.log(`   状态: ${llmConfigs[0].status}`);
      console.log(`   默认: ${llmConfigs[0].is_default ? '是' : '否'}`);
      
      // 确保是激活状态
      if (llmConfigs[0].status !== 'active') {
        console.log('\n🔧 激活LLM配置...');
        await sequelize.query(`
          UPDATE ai_model_config
          SET status = 'active'
          WHERE id = ${llmConfigs[0].id}
        `);
        console.log('✅ LLM配置已激活');
      }
    } else {
      console.log('⚠️  LLM配置不存在，需要添加');
    }

    // 2. 检查TTS配置
    console.log('\n📊 检查TTS配置...');
    const [ttsConfigs] = await sequelize.query(`
      SELECT id, name, display_name, endpoint_url, status
      FROM ai_model_config
      WHERE name LIKE '%tts%' AND name LIKE '%volcengine%'
      LIMIT 3
    `);

    if (ttsConfigs.length > 0) {
      console.log(`✅ 找到 ${ttsConfigs.length} 个TTS配置:`);
      ttsConfigs.forEach((config, index) => {
        console.log(`\n   ${index + 1}. ${config.display_name}`);
        console.log(`      ID: ${config.id}`);
        console.log(`      名称: ${config.name}`);
        console.log(`      端点: ${config.endpoint_url}`);
        console.log(`      状态: ${config.status}`);
      });
    } else {
      console.log('⚠️  未找到TTS配置');
    }

    // 3. 检查ASR配置
    console.log('\n📊 检查ASR配置...');
    const [asrConfigs] = await sequelize.query(`
      SELECT id, name, display_name, endpoint_url, status
      FROM ai_model_config
      WHERE name LIKE '%asr%' OR name LIKE '%speech%'
      LIMIT 3
    `);

    if (asrConfigs.length > 0) {
      console.log(`✅ 找到 ${asrConfigs.length} 个ASR配置:`);
      asrConfigs.forEach((config, index) => {
        console.log(`\n   ${index + 1}. ${config.display_name}`);
        console.log(`      ID: ${config.id}`);
        console.log(`      名称: ${config.name}`);
        console.log(`      端点: ${config.endpoint_url}`);
        console.log(`      状态: ${config.status}`);
      });
    } else {
      console.log('⚠️  未找到ASR配置，需要添加');
      
      // 添加ASR配置
      console.log('\n🔧 添加ASR配置...');
      await sequelize.query(`
        INSERT INTO ai_model_config (
          name,
          display_name,
          provider,
          model_type,
          endpoint_url,
          api_key,
          model_parameters,
          status,
          is_default,
          description,
          created_at,
          updated_at
        ) VALUES (
          'volcengine-asr-streaming',
          '火山引擎流式语音识别',
          'bytedance_doubao',
          'speech',
          'wss://openspeech.bytedance.com/api/v3/asr',
          '3251d95f-1039-4daa-9afa-eb3bfe345552',
          JSON_OBJECT(
            'format', 'pcm',
            'sampleRate', 16000,
            'language', 'zh-CN',
            'resourceId', 'volc.bigasr.sauc.duration'
          ),
          'active',
          1,
          '火山引擎流式语音识别服务，用于实时语音转文字',
          NOW(),
          NOW()
        )
      `);
      console.log('✅ ASR配置已添加');
    }

    // 4. 创建语音对话配置表（如果不存在）
    console.log('\n📊 检查语音对话配置表...');
    const [tables] = await sequelize.query(`
      SHOW TABLES LIKE 'voice_conversation_configs'
    `);

    if (tables.length === 0) {
      console.log('🔧 创建语音对话配置表...');
      await sequelize.query(`
        CREATE TABLE voice_conversation_configs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL COMMENT '配置名称',
          description TEXT COMMENT '配置描述',
          asr_model_id INT COMMENT 'ASR模型ID',
          llm_model_id INT COMMENT 'LLM模型ID',
          tts_model_id INT COMMENT 'TTS模型ID',
          system_prompt TEXT COMMENT '系统提示词',
          max_tokens INT DEFAULT 200 COMMENT '最大Token数',
          temperature DECIMAL(3,2) DEFAULT 0.7 COMMENT '温度参数',
          status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '状态',
          is_default TINYINT(1) DEFAULT 0 COMMENT '是否默认配置',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_status (status),
          INDEX idx_is_default (is_default)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='语音对话配置表'
      `);
      console.log('✅ 语音对话配置表已创建');
    } else {
      console.log('✅ 语音对话配置表已存在');
    }

    // 5. 添加默认语音对话配置
    console.log('\n📊 检查默认语音对话配置...');
    const [voiceConfigs] = await sequelize.query(`
      SELECT * FROM voice_conversation_configs WHERE is_default = 1 LIMIT 1
    `);

    if (voiceConfigs.length === 0) {
      console.log('🔧 添加默认语音对话配置...');
      
      // 获取模型ID
      const [llmModel] = await sequelize.query(`
        SELECT id FROM ai_model_config WHERE name = 'doubao-seed-1-6-flash-250715' LIMIT 1
      `);
      const [ttsModel] = await sequelize.query(`
        SELECT id FROM ai_model_config WHERE name LIKE '%volcengine-tts%' LIMIT 1
      `);
      const [asrModel] = await sequelize.query(`
        SELECT id FROM ai_model_config WHERE name LIKE '%asr%' LIMIT 1
      `);

      const llmModelId = llmModel.length > 0 ? llmModel[0].id : null;
      const ttsModelId = ttsModel.length > 0 ? ttsModel[0].id : null;
      const asrModelId = asrModel.length > 0 ? asrModel[0].id : null;

      await sequelize.query(`
        INSERT INTO voice_conversation_configs (
          name,
          description,
          asr_model_id,
          llm_model_id,
          tts_model_id,
          system_prompt,
          max_tokens,
          temperature,
          status,
          is_default
        ) VALUES (
          '幼儿园招生顾问',
          '专业的幼儿园招生电话咨询服务',
          ${asrModelId},
          ${llmModelId},
          ${ttsModelId},
          '你是一位专业的幼儿园招生顾问，负责通过电话与家长沟通。请保持友好、专业的态度，简洁回答问题。主要职责包括：1. 介绍幼儿园的基本情况和特色；2. 解答家长关于招生、费用、课程等方面的问题；3. 引导家长预约参观或报名；4. 记录家长的联系方式和需求。请用简洁、亲切的语言回答，每次回复控制在100字以内。',
          200,
          0.7,
          'active',
          1
        )
      `);
      console.log('✅ 默认语音对话配置已添加');
    } else {
      console.log('✅ 默认语音对话配置已存在');
    }

    // 6. 显示最终配置
    console.log('\n' + '='.repeat(80));
    console.log('📊 最终配置总结');
    console.log('='.repeat(80));

    const [finalConfig] = await sequelize.query(`
      SELECT 
        vc.id,
        vc.name,
        vc.description,
        asr.name as asr_model,
        llm.name as llm_model,
        tts.name as tts_model,
        vc.status
      FROM voice_conversation_configs vc
      LEFT JOIN ai_model_config asr ON vc.asr_model_id = asr.id
      LEFT JOIN ai_model_config llm ON vc.llm_model_id = llm.id
      LEFT JOIN ai_model_config tts ON vc.tts_model_id = tts.id
      WHERE vc.is_default = 1
      LIMIT 1
    `);

    if (finalConfig.length > 0) {
      const config = finalConfig[0];
      console.log('\n✅ 默认语音对话配置:');
      console.log(`   配置ID: ${config.id}`);
      console.log(`   配置名称: ${config.name}`);
      console.log(`   描述: ${config.description}`);
      console.log(`   ASR模型: ${config.asr_model || '未配置'}`);
      console.log(`   LLM模型: ${config.llm_model || '未配置'}`);
      console.log(`   TTS模型: ${config.tts_model || '未配置'}`);
      console.log(`   状态: ${config.status}`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('🎉 配置添加完成！');
    console.log('='.repeat(80));
    console.log('\n💡 下一步:');
    console.log('   1. 创建语音对话服务 (voice-conversation.service.ts)');
    console.log('   2. 集成到SIP呼叫中心 (sip-udp.service.ts)');
    console.log('   3. 测试完整流程');
    console.log('\n' + '='.repeat(80));

  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error('详细错误:', error);
  } finally {
    await sequelize.close();
  }
}

addVoiceConversationConfig();

