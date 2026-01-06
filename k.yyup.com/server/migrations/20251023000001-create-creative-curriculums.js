'use strict';

/**
 * 创建创意课程表 (creative_curriculums)
 * 用于存储教师创建的AI生成课程
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS creative_curriculums (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '课程ID',
        kindergarten_id INT NOT NULL COMMENT '幼儿园ID',
        creator_id INT NOT NULL COMMENT '创建者ID',
        name VARCHAR(255) NOT NULL COMMENT '课程名称',
        description LONGTEXT COMMENT '课程描述',
        domain VARCHAR(50) NOT NULL DEFAULT 'general' COMMENT '课程领域',
        age_group VARCHAR(50) DEFAULT '3-6' COMMENT '年龄段',
        html_code LONGTEXT NOT NULL COMMENT 'HTML代码',
        css_code LONGTEXT COMMENT 'CSS代码',
        js_code LONGTEXT COMMENT 'JavaScript代码',
        schedule JSON COMMENT '课程表',
        status VARCHAR(50) NOT NULL DEFAULT 'draft' COMMENT '状态',
        view_count INT NOT NULL DEFAULT 0 COMMENT '浏览次数',
        use_count INT NOT NULL DEFAULT 0 COMMENT '使用次数',
        tags JSON COMMENT '标签',
        thumbnail VARCHAR(500) COMMENT '缩略图URL',
        is_public BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否公开',
        remark LONGTEXT COMMENT '备注',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        deleted_at DATETIME COMMENT '删除时间',
        FOREIGN KEY (kindergarten_id) REFERENCES kindergartens(id) ON DELETE CASCADE,
        FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_kindergarten_id (kindergarten_id),
        INDEX idx_creator_id (creator_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='创意课程表'
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS creative_curriculums');
  }
};

