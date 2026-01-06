/**
 * 检查TTS音色配置
 */

import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';
import * as path from 'path';

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '.env') });

async function checkTTSVoices() {
  console.log('🔍 检查TTS音色配置\n');
  console.log('=' .repeat(60));

  // 创建数据库连接
  const sequelize = new Sequelize({
    host: '8.138.115.138',
    port: 3306,
    database: 'kindergarten_management',
    username: 'root',
    password: 'Yyup@2024',
    dialect: 'mysql',
    logging: false
  });

  try {
    // 测试连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 查询TTS音色配置
    const [voices] = await sequelize.query(`
      SELECT 
        id,
        name,
        display_name,
        voice_id,
        category,
        gender,
        description,
        is_active,
        is_default
      FROM tts_voices
      WHERE is_active = 1
      ORDER BY category, id
    `);

    console.log(`📊 找到 ${(voices as any[]).length} 个激活的音色\n`);

    // 按类别分组显示
    const voicesByCategory: { [key: string]: any[] } = {};
    (voices as any[]).forEach((voice: any) => {
      if (!voicesByCategory[voice.category]) {
        voicesByCategory[voice.category] = [];
      }
      voicesByCategory[voice.category].push(voice);
    });

    // 显示每个类别的音色
    Object.keys(voicesByCategory).forEach((category) => {
      console.log(`\n📁 类别: ${category}`);
      console.log('-'.repeat(60));
      
      voicesByCategory[category].forEach((voice: any) => {
        console.log(`  ${voice.is_default ? '⭐' : '  '} ${voice.display_name} (${voice.name})`);
        console.log(`     ID: ${voice.voice_id}`);
        console.log(`     性别: ${voice.gender}`);
        console.log(`     描述: ${voice.description || '无'}`);
        console.log('');
      });
    });

    // 查询视频项目使用的音色
    console.log('\n📹 视频项目音色使用情况');
    console.log('-'.repeat(60));
    
    const [projects] = await sequelize.query(`
      SELECT 
        id,
        title,
        voice_style,
        status
      FROM video_projects
      ORDER BY created_at DESC
      LIMIT 5
    `);

    if ((projects as any[]).length > 0) {
      (projects as any[]).forEach((project: any) => {
        console.log(`  项目: ${project.title}`);
        console.log(`     音色: ${project.voice_style || '未设置'}`);
        console.log(`     状态: ${project.status}`);
        console.log('');
      });
    } else {
      console.log('  暂无视频项目');
    }

    // 查询TTS V3配置
    console.log('\n🔧 TTS V3配置');
    console.log('-'.repeat(60));
    
    const [ttsConfigs] = await sequelize.query(`
      SELECT 
        name,
        display_name,
        model_type,
        provider,
        api_version,
        endpoint_url,
        status,
        is_default
      FROM ai_model_config
      WHERE model_type = 'tts' AND status = 'active'
      ORDER BY is_default DESC, id DESC
    `);

    if ((ttsConfigs as any[]).length > 0) {
      (ttsConfigs as any[]).forEach((config: any) => {
        console.log(`  ${config.is_default ? '⭐' : '  '} ${config.display_name} (${config.name})`);
        console.log(`     提供商: ${config.provider}`);
        console.log(`     版本: ${config.api_version}`);
        console.log(`     端点: ${config.endpoint_url}`);
        console.log(`     状态: ${config.status}`);
        console.log('');
      });
    } else {
      console.log('  暂无TTS配置');
    }

  } catch (error: any) {
    console.error('❌ 错误:', error.message);
    console.error(error.stack);
  } finally {
    await sequelize.close();
  }
}

// 运行检查
checkTTSVoices().catch(console.error);

