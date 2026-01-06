const { Sequelize } = require('sequelize');

// 数据库配置
const sequelize = new Sequelize('yyup_kindergarten', 'yyup_main', 'Yyup2024!@#$', {
  host: 'rm-cn-pe33w21ii0009s6o.rwlb.rds.aliyuncs.com',
  dialect: 'mysql',
  logging: false
});

async function checkVideoProjects() {
  try {
    console.log('🔍 连接数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 查询最近的视频项目
    const [projects] = await sequelize.query(`
      SELECT 
        id, 
        title, 
        status, 
        progress, 
        progressMessage,
        LENGTH(scriptData) as scriptDataLength,
        LENGTH(audioData) as audioDataLength,
        LENGTH(sceneVideos) as sceneVideosLength,
        createdAt, 
        updatedAt 
      FROM video_projects 
      ORDER BY createdAt DESC 
      LIMIT 5
    `);

    console.log('📋 最近的5个视频项目:\n');
    projects.forEach((project, index) => {
      console.log(`${index + 1}. 项目ID: ${project.id}`);
      console.log(`   标题: ${project.title || '未设置'}`);
      console.log(`   状态: ${project.status}`);
      console.log(`   进度: ${project.progress}%`);
      console.log(`   进度消息: ${project.progressMessage || '无'}`);
      console.log(`   脚本数据长度: ${project.scriptDataLength || 0} 字节`);
      console.log(`   配音数据长度: ${project.audioDataLength || 0} 字节`);
      console.log(`   分镜数据长度: ${project.sceneVideosLength || 0} 字节`);
      console.log(`   创建时间: ${project.createdAt}`);
      console.log(`   更新时间: ${project.updatedAt}`);
      console.log('');
    });

    // 查询最新项目的详细数据
    if (projects.length > 0) {
      const latestProjectId = projects[0].id;
      console.log(`\n🔍 查询最新项目 (ID: ${latestProjectId}) 的详细数据:\n`);

      const [detailData] = await sequelize.query(`
        SELECT 
          scriptData,
          audioData,
          sceneVideos
        FROM video_projects 
        WHERE id = ?
      `, {
        replacements: [latestProjectId]
      });

      if (detailData.length > 0) {
        const detail = detailData[0];

        // 解析脚本数据
        if (detail.scriptData) {
          try {
            const scriptData = JSON.parse(detail.scriptData);
            console.log('📝 脚本数据:');
            console.log(`   标题: ${scriptData.title || '未设置'}`);
            console.log(`   场景数量: ${scriptData.scenes?.length || 0}`);
            if (scriptData.scenes && scriptData.scenes.length > 0) {
              console.log('   场景列表:');
              scriptData.scenes.forEach((scene, idx) => {
                console.log(`     ${idx + 1}. ${scene.sceneTitle || `场景${idx + 1}`} (${scene.duration}秒)`);
              });
            }
            console.log('');
          } catch (e) {
            console.log('   ❌ 脚本数据解析失败:', e.message);
          }
        } else {
          console.log('📝 脚本数据: 无\n');
        }

        // 解析配音数据
        if (detail.audioData) {
          try {
            const audioData = JSON.parse(detail.audioData);
            console.log('🎤 配音数据:');
            console.log(`   配音数量: ${audioData.length || 0}`);
            if (audioData.length > 0) {
              console.log('   配音列表:');
              audioData.forEach((audio, idx) => {
                console.log(`     ${idx + 1}. 场景${audio.sceneNumber}: ${audio.narration?.substring(0, 30)}...`);
                console.log(`        音频URL: ${audio.audioUrl || '无'}`);
                console.log(`        时长: ${audio.duration}秒`);
              });
            }
            console.log('');
          } catch (e) {
            console.log('   ❌ 配音数据解析失败:', e.message);
          }
        } else {
          console.log('🎤 配音数据: 无\n');
        }

        // 解析分镜数据
        if (detail.sceneVideos) {
          try {
            const sceneVideos = JSON.parse(detail.sceneVideos);
            console.log('🎬 分镜数据:');
            console.log(`   分镜数量: ${sceneVideos.length || 0}`);
            if (sceneVideos.length > 0) {
              console.log('   分镜列表:');
              sceneVideos.forEach((scene, idx) => {
                console.log(`     ${idx + 1}. ${scene.sceneTitle || `场景${idx + 1}`}`);
                console.log(`        视频URL: ${scene.videoUrl || '无'}`);
                console.log(`        场景索引: ${scene.sceneIndex}`);
              });
            }
            console.log('');
          } catch (e) {
            console.log('   ❌ 分镜数据解析失败:', e.message);
          }
        } else {
          console.log('🎬 分镜数据: 无\n');
        }
      }
    }

    console.log('✅ 查询完成');
  } catch (error) {
    console.error('❌ 查询失败:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkVideoProjects();

