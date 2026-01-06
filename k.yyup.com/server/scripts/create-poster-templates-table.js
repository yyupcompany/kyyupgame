const path = require('path');
const { Sequelize } = require('sequelize');

// 创建数据库连接
const sequelize = new Sequelize('kindergarten_system', 'root', '123456', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false
});

async function createPosterTemplatesTable() {
  try {
    console.log('🚀 开始创建海报模板表...');
    
    // 创建poster_templates表
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS poster_templates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL COMMENT '模板名称',
        description VARCHAR(500) NULL COMMENT '模板描述',
        category VARCHAR(50) NULL COMMENT '模板分类',
        width INT NOT NULL DEFAULT 1024 COMMENT '模板宽度（像素）',
        height INT NOT NULL DEFAULT 1024 COMMENT '模板高度（像素）',
        background VARCHAR(255) NULL COMMENT '背景图片URL或颜色值',
        thumbnail VARCHAR(255) NULL COMMENT '缩略图URL',
        kindergarten_id INT NULL COMMENT '幼儿园ID（为空表示系统模板）',
        status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
        usage_count INT NOT NULL DEFAULT 0 COMMENT '使用次数',
        remark VARCHAR(500) NULL COMMENT '备注',
        creator_id INT NULL COMMENT '创建人ID',
        updater_id INT NULL COMMENT '更新人ID',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        INDEX idx_category (category),
        INDEX idx_status (status),
        INDEX idx_kindergarten_id (kindergarten_id),
        INDEX idx_creator_id (creator_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='海报模板表'
    `);
    
    console.log('✅ poster_templates表创建成功');
    
    // 创建poster_elements表
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS poster_elements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        template_id INT NOT NULL COMMENT '模板ID',
        element_type ENUM('text', 'image', 'shape', 'qrcode') NOT NULL COMMENT '元素类型',
        content TEXT NULL COMMENT '元素内容',
        style JSON NULL COMMENT '样式配置',
        position JSON NOT NULL COMMENT '位置信息',
        size JSON NOT NULL COMMENT '尺寸信息',
        layer_index INT NOT NULL DEFAULT 0 COMMENT '图层索引',
        is_locked BOOLEAN NOT NULL DEFAULT false COMMENT '是否锁定',
        is_visible BOOLEAN NOT NULL DEFAULT true COMMENT '是否可见',
        creator_id INT NULL COMMENT '创建人ID',
        updater_id INT NULL COMMENT '更新人ID',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        INDEX idx_template_id (template_id),
        INDEX idx_element_type (element_type),
        FOREIGN KEY (template_id) REFERENCES poster_templates(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='海报元素表'
    `);
    
    console.log('✅ poster_elements表创建成功');
    
    // 插入测试数据
    console.log('🔄 插入测试数据...');
    
    const testTemplates = [
      {
        name: '春季运动会海报',
        description: 'AI生成的春季运动会海报模板',
        category: 'sports',
        width: 1024,
        height: 1024,
        background: 'https://example.com/spring-sports-bg.jpg',
        thumbnail: 'https://example.com/spring-sports-thumb.jpg',
        status: 1,
        usage_count: 0,
        kindergarten_id: 1,
        creator_id: 1,
        updater_id: 1,
        remark: '通过AI海报编辑器创建'
      },
      {
        name: '六一儿童节庆典',
        description: 'AI生成的六一儿童节庆典海报模板',
        category: 'festival',
        width: 1024,
        height: 1024,
        background: 'https://example.com/childrens-day-bg.jpg',
        thumbnail: 'https://example.com/childrens-day-thumb.jpg',
        status: 1,
        usage_count: 0,
        kindergarten_id: 1,
        creator_id: 1,
        updater_id: 1,
        remark: '通过AI海报编辑器创建'
      },
      {
        name: '亲子手工时光',
        description: 'AI生成的亲子手工制作活动海报模板',
        category: 'activity',
        width: 1024,
        height: 1024,
        background: 'https://example.com/craft-time-bg.jpg',
        thumbnail: 'https://example.com/craft-time-thumb.jpg',
        status: 1,
        usage_count: 0,
        kindergarten_id: 1,
        creator_id: 1,
        updater_id: 1,
        remark: '通过AI海报编辑器创建'
      },
      {
        name: '小小科学家',
        description: 'AI生成的科学实验课海报模板',
        category: 'education',
        width: 1024,
        height: 1024,
        background: 'https://example.com/science-bg.jpg',
        thumbnail: 'https://example.com/science-thumb.jpg',
        status: 1,
        usage_count: 0,
        kindergarten_id: 1,
        creator_id: 1,
        updater_id: 1,
        remark: '通过AI海报编辑器创建'
      }
    ];
    
    for (const template of testTemplates) {
      await sequelize.query(`
        INSERT INTO poster_templates (
          name, description, category, width, height, background, thumbnail,
          status, usage_count, kindergarten_id, creator_id, updater_id, remark
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, {
        replacements: [
          template.name, template.description, template.category,
          template.width, template.height, template.background, template.thumbnail,
          template.status, template.usage_count, template.kindergarten_id,
          template.creator_id, template.updater_id, template.remark
        ]
      });
    }
    
    console.log('✅ 测试数据插入成功');
    
    // 验证数据
    const [results] = await sequelize.query('SELECT COUNT(*) as count FROM poster_templates');
    console.log(`📊 当前海报模板数量: ${results[0].count}`);
    
    console.log('🎉 海报模板表创建和数据初始化完成！');
    
  } catch (error) {
    console.error('❌ 创建海报模板表失败:', error);
    throw error;
  }
}

// 运行脚本
if (require.main === module) {
  createPosterTemplatesTable()
    .then(() => {
      console.log('✅ 脚本执行成功');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ 脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = { createPosterTemplatesTable };
