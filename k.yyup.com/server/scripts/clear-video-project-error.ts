/**
 * 清除视频项目的错误状态
 * 用于修复显示历史错误消息的项目
 */

import { VideoProject, VideoProjectStatus } from '../src/models/video-project.model';
import { sequelize } from '../src/config/database';
import { Op } from 'sequelize';

async function clearProjectError() {
  try {
    console.log('🔧 开始清除视频项目错误状态...');

    // 连接数据库
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 查找所有有错误消息的项目
    const projects = await VideoProject.findAll({
      where: {
        errorMessage: {
          [Op.ne]: null
        }
      }
    });

    console.log(`📊 找到 ${projects.length} 个有错误消息的项目`);

    if (projects.length === 0) {
      console.log('✅ 没有需要清理的项目');
      process.exit(0);
    }

    // 显示项目列表
    console.log('\n📋 项目列表:');
    projects.forEach((project, index) => {
      console.log(`${index + 1}. ID: ${project.id}, 标题: ${project.title}`);
      console.log(`   状态: ${project.status}`);
      console.log(`   错误: ${project.errorMessage}`);
      console.log('');
    });

    // 清除所有项目的错误消息
    const updateCount = await VideoProject.update(
      {
        errorMessage: null,
        status: VideoProjectStatus.DRAFT // 重置为草稿状态
      },
      {
        where: {
          errorMessage: {
            [Op.ne]: null
          }
        }
      }
    );

    console.log(`✅ 成功清除 ${updateCount[0]} 个项目的错误状态`);
    console.log('✅ 项目已重置为草稿状态，可以重新生成配音');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ 清除错误状态失败:', error.message);
    process.exit(1);
  }
}

// 运行脚本
clearProjectError();

