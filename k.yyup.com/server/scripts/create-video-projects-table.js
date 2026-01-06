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
    logging: console.log
  }
);

async function createVideoProjectsTable() {
  try {
    console.log('🔧 创建video_projects表...\n');

    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 检查表是否已存在
    const [tables] = await sequelize.query(`
      SHOW TABLES LIKE 'video_projects'
    `);

    if (tables.length > 0) {
      console.log('⚠️  表已存在，是否要删除并重新创建？');
      console.log('   如需重新创建，请手动删除表后再运行此脚本');
      console.log('   DROP TABLE video_projects;');
      await sequelize.close();
      return;
    }

    // 创建表
    console.log('📝 创建video_projects表...');
    await sequelize.query(`
      CREATE TABLE video_projects (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '视频项目ID',
        userId INT NOT NULL COMMENT '用户ID',
        title VARCHAR(100) NOT NULL COMMENT '视频标题',
        description TEXT NULL COMMENT '视频描述',
        platform ENUM('douyin', 'kuaishou', 'wechat_video', 'xiaohongshu', 'bilibili') NOT NULL COMMENT '发布平台',
        videoType ENUM('enrollment', 'activity', 'course', 'environment', 'teacher', 'student') NOT NULL COMMENT '视频类型',
        duration INT NOT NULL DEFAULT 30 COMMENT '视频时长（秒）',
        style ENUM('warm', 'professional', 'lively', 'elegant') NOT NULL DEFAULT 'warm' COMMENT '视频风格',
        status ENUM('draft', 'generating_script', 'generating_audio', 'generating_video', 'editing', 'completed', 'failed') NOT NULL DEFAULT 'draft' COMMENT '项目状态',
        topic VARCHAR(200) NOT NULL COMMENT '视频主题',
        keyPoints TEXT NULL COMMENT '关键信息点',
        targetAudience VARCHAR(50) NOT NULL DEFAULT 'parents' COMMENT '目标受众',
        voiceStyle VARCHAR(50) NOT NULL DEFAULT 'alloy' COMMENT '配音风格',
        scriptData JSON NULL COMMENT '脚本数据',
        audioData JSON NULL COMMENT '音频数据',
        videoData JSON NULL COMMENT '视频数据',
        sceneVideos TEXT NULL COMMENT '场景视频JSON字符串',
        finalVideoUrl VARCHAR(500) NULL COMMENT '最终视频URL',
        finalVideoPath VARCHAR(500) NULL COMMENT '最终视频路径',
        finalVideoId VARCHAR(200) NULL COMMENT 'VOD视频ID',
        coverImageUrl VARCHAR(500) NULL COMMENT '封面图URL',
        metadata JSON NULL COMMENT '元数据',
        errorMessage TEXT NULL COMMENT '错误信息',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        INDEX idx_user_id (userId),
        INDEX idx_status (status),
        INDEX idx_created_at (createdAt),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='视频项目表'
    `);

    console.log('✅ 表创建成功！\n');

    // 验证表结构
    console.log('📋 验证表结构...');
    const [columns] = await sequelize.query(`
      DESCRIBE video_projects
    `);

    console.log('字段列表:');
    columns.forEach(col => {
      console.log(`  ✓ ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    console.log('');

    console.log('✅ video_projects表创建完成！');
    console.log('');
    console.log('📊 表信息:');
    console.log(`   - 字段数量: ${columns.length}`);
    console.log('   - 索引: userId, status, createdAt');
    console.log('   - 外键: userId -> users(id)');
    console.log('');

    await sequelize.close();

  } catch (error) {
    console.error('❌ 创建表失败:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createVideoProjectsTable();

