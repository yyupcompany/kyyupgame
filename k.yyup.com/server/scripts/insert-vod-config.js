const { Sequelize } = require('sequelize');
const path = require('path');

// 加载环境变量
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// 创建数据库连接
const sequelize = new Sequelize(
  process.env.DB_NAME || 'kindergarten_management',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'Zhu@1234',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql',
    logging: false
  }
);

async function insertVODConfig() {
  try {
    console.log('🔍 正在检查并插入火山引擎VOD配置...\n');

    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 1. 查询现有的火山引擎配置，获取API密钥
    console.log('📋 查询现有火山引擎配置...');
    const [existingConfigs] = await sequelize.query(`
      SELECT 
        id,
        name,
        display_name,
        model_type,
        provider,
        api_key,
        endpoint_url
      FROM ai_model_config
      WHERE provider = 'bytedance_doubao' AND status = 'active'
      LIMIT 1
    `);

    if (existingConfigs.length === 0) {
      console.log('❌ 未找到火山引擎配置，无法获取API密钥');
      console.log('请先配置火山引擎的其他服务（如视频生成、TTS等）');
      process.exit(1);
    }

    const existingConfig = existingConfigs[0];
    console.log(`✅ 找到现有配置: ${existingConfig.display_name}`);
    console.log(`   API密钥: ${existingConfig.api_key.substring(0, 20)}...`);
    console.log(`   端点: ${existingConfig.endpoint_url}\n`);

    // 2. 检查是否已存在VOD配置
    console.log('📋 检查VOD配置是否已存在...');
    const [vodConfigs] = await sequelize.query(`
      SELECT id, name, display_name
      FROM ai_model_config
      WHERE model_type = 'vod' OR name LIKE '%vod%'
    `);

    if (vodConfigs.length > 0) {
      console.log('⚠️  VOD配置已存在:');
      vodConfigs.forEach(config => {
        console.log(`   - ${config.name}: ${config.display_name}`);
      });
      console.log('\n是否要更新现有配置？(y/n)');
      console.log('提示: 直接运行脚本将跳过已存在的配置\n');
      
      // 这里简单跳过，如果需要更新可以手动删除后重新运行
      console.log('✅ 跳过插入，使用现有配置');
      await sequelize.close();
      return;
    }

    // 3. 检查并添加 'vod' 类型到枚举
    console.log('📝 检查 model_type 枚举...');
    const [tableInfo] = await sequelize.query(`
      SHOW COLUMNS FROM ai_model_config WHERE Field = 'model_type'
    `);

    const currentEnum = tableInfo[0].Type;
    console.log(`   当前枚举: ${currentEnum}`);

    if (!currentEnum.includes('vod')) {
      console.log('📝 添加 vod 类型到枚举...');
      await sequelize.query(`
        ALTER TABLE ai_model_config
        MODIFY COLUMN model_type ENUM('text','speech','image','video','multimodal','embedding','search','vod') NOT NULL
      `);
      console.log('✅ 枚举类型已更新\n');
    } else {
      console.log('✅ vod 类型已存在\n');
    }

    // 4. 插入VOD配置
    console.log('📝 插入火山引擎VOD配置...');

    // 从现有配置中提取基础端点URL
    const baseEndpoint = existingConfig.endpoint_url.replace(/\/api\/v3\/.*$/, '');
    const vodEndpoint = `${baseEndpoint}/api/v3/vod`;

    const insertQuery = `
      INSERT INTO ai_model_config (
        name,
        display_name,
        model_type,
        provider,
        api_version,
        endpoint_url,
        api_key,
        status,
        is_default,
        max_tokens,
        description,
        created_at,
        updated_at
      ) VALUES (
        'volcengine-vod-service',
        '火山引擎视频点播服务 (VOD)',
        'vod',
        'bytedance_doubao',
        'v3',
        '${vodEndpoint}',
        '${existingConfig.api_key}',
        'active',
        1,
        NULL,
        '火山引擎视频点播服务，提供视频上传、剪辑、合成、转码等功能。支持视频片段合并、音频添加、格式转换等专业视频处理能力。',
        NOW(),
        NOW()
      )
    `;

    await sequelize.query(insertQuery);
    console.log('✅ VOD配置插入成功！\n');

    // 5. 验证插入结果
    console.log('📋 验证插入结果...');
    const [newConfig] = await sequelize.query(`
      SELECT 
        id,
        name,
        display_name,
        model_type,
        provider,
        endpoint_url,
        status,
        is_default,
        description
      FROM ai_model_config
      WHERE model_type = 'vod'
      ORDER BY created_at DESC
      LIMIT 1
    `);

    if (newConfig.length > 0) {
      const config = newConfig[0];
      console.log('✅ VOD配置详情:');
      console.log(`   ID: ${config.id}`);
      console.log(`   名称: ${config.name}`);
      console.log(`   显示名称: ${config.display_name}`);
      console.log(`   类型: ${config.model_type}`);
      console.log(`   提供商: ${config.provider}`);
      console.log(`   端点: ${config.endpoint_url}`);
      console.log(`   状态: ${config.status}`);
      console.log(`   默认: ${config.is_default ? '是' : '否'}`);
      console.log(`   描述: ${config.description}`);
      console.log('');
    }

    // 6. 显示所有火山引擎配置
    console.log('📊 当前所有火山引擎配置:');
    console.log('═════════════════════════════════════════════════════════════');
    const [allConfigs] = await sequelize.query(`
      SELECT 
        id,
        name,
        display_name,
        model_type,
        status,
        is_default
      FROM ai_model_config
      WHERE provider LIKE '%volc%' OR provider LIKE '%bytedance%'
      ORDER BY 
        CASE model_type
          WHEN 'text' THEN 1
          WHEN 'image' THEN 2
          WHEN 'video' THEN 3
          WHEN 'speech' THEN 4
          WHEN 'vod' THEN 5
          WHEN 'search' THEN 6
          ELSE 7
        END,
        created_at DESC
    `);

    allConfigs.forEach((config, index) => {
      const defaultMark = config.is_default ? ' [默认]' : '';
      const statusMark = config.status === 'active' ? '✅' : '❌';
      console.log(`${index + 1}. ${statusMark} ${config.display_name}${defaultMark}`);
      console.log(`   类型: ${config.model_type} | 名称: ${config.name}`);
      console.log('');
    });

    console.log('═════════════════════════════════════════════════════════════');
    console.log(`✅ 总计: ${allConfigs.length} 个配置`);
    console.log('');

    // 7. 使用建议
    console.log('💡 使用建议:');
    console.log('─────────────────────────────────────────────────────────────');
    console.log('1. VOD服务已配置完成，可以在视频制作流程中使用');
    console.log('2. 支持的功能:');
    console.log('   - 视频上传到VOD');
    console.log('   - 多个视频片段合并');
    console.log('   - 为视频添加音频轨道');
    console.log('   - 视频格式转码');
    console.log('   - 查询处理任务状态');
    console.log('');
    console.log('3. 调用方式:');
    console.log('   - 后端: 使用 vodService (server/src/services/volcengine/vod.service.ts)');
    console.log('   - API: POST /api/video-creation/projects/:projectId/merge');
    console.log('');
    console.log('4. 测试建议:');
    console.log('   - 访问媒体中心 -> 视频创作');
    console.log('   - 使用Timeline布局完成7步视频制作流程');
    console.log('   - 在步骤5会自动调用VOD服务进行视频剪辑合成');
    console.log('');

    await sequelize.close();
    console.log('✅ 配置完成！');

  } catch (error) {
    console.error('❌ 插入VOD配置失败:', error.message);
    console.error(error);
    process.exit(1);
  }
}

insertVODConfig();

