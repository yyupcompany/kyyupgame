'use strict';

/**
 * 扩展 creative_curriculums 表
 * 添加互动多媒体课程所需的字段
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🎬 开始添加互动多媒体课程字段...');

    try {
      // 检查表是否存在
      const tables = await queryInterface.showAllTables();
      if (!tables.includes('creative_curriculums')) {
        console.log('⚠️ creative_curriculums 表不存在，跳过迁移');
        return;
      }

      // 添加 media 字段 - 存储图片和视频数据
      await queryInterface.addColumn('creative_curriculums', 'media', {
        type: Sequelize.JSON,
        allowNull: true,
        comment: '媒体数据 (图片和视频)',
        defaultValue: null
      }).catch(err => {
        if (err.message.includes('already exists')) {
          console.log('⚠️ media 字段已存在');
        } else {
          throw err;
        }
      });

      // 添加 metadata 字段 - 存储生成元数据
      await queryInterface.addColumn('creative_curriculums', 'metadata', {
        type: Sequelize.JSON,
        allowNull: true,
        comment: '元数据 (生成时间、模型、状态、进度)',
        defaultValue: null
      }).catch(err => {
        if (err.message.includes('already exists')) {
          console.log('⚠️ metadata 字段已存在');
        } else {
          throw err;
        }
      });

      // 添加 courseAnalysis 字段 - 存储课程分析结果
      await queryInterface.addColumn('creative_curriculums', 'courseAnalysis', {
        type: Sequelize.JSON,
        allowNull: true,
        comment: '课程分析结果',
        defaultValue: null
      }).catch(err => {
        if (err.message.includes('already exists')) {
          console.log('⚠️ courseAnalysis 字段已存在');
        } else {
          throw err;
        }
      });

      // 添加 curriculumType 字段 - 区分课程类型
      await queryInterface.addColumn('creative_curriculums', 'curriculumType', {
        type: Sequelize.ENUM('standard', 'interactive'),
        allowNull: false,
        defaultValue: 'standard',
        comment: '课程类型'
      }).catch(err => {
        if (err.message.includes('already exists')) {
          console.log('⚠️ curriculumType 字段已存在');
        } else {
          throw err;
        }
      });

      console.log('✅ 互动多媒体课程字段添加成功');
    } catch (error) {
      console.error('❌ 迁移失败:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log('🔄 回滚互动多媒体课程字段...');

    try {
      const tables = await queryInterface.showAllTables();
      if (!tables.includes('creative_curriculums')) {
        console.log('⚠️ creative_curriculums 表不存在，跳过回滚');
        return;
      }

      // 移除字段
      await queryInterface.removeColumn('creative_curriculums', 'media').catch(err => {
        if (err.message.includes('does not exist')) {
          console.log('⚠️ media 字段不存在');
        } else {
          throw err;
        }
      });

      await queryInterface.removeColumn('creative_curriculums', 'metadata').catch(err => {
        if (err.message.includes('does not exist')) {
          console.log('⚠️ metadata 字段不存在');
        } else {
          throw err;
        }
      });

      await queryInterface.removeColumn('creative_curriculums', 'courseAnalysis').catch(err => {
        if (err.message.includes('does not exist')) {
          console.log('⚠️ courseAnalysis 字段不存在');
        } else {
          throw err;
        }
      });

      await queryInterface.removeColumn('creative_curriculums', 'curriculumType').catch(err => {
        if (err.message.includes('does not exist')) {
          console.log('⚠️ curriculumType 字段不存在');
        } else {
          throw err;
        }
      });

      console.log('✅ 回滚成功');
    } catch (error) {
      console.error('❌ 回滚失败:', error);
      throw error;
    }
  }
};

