'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('开始为ai_messages表添加message_type字段...');
    
    try {
      // 检查message_type字段是否已存在
      const tableDescription = await queryInterface.describeTable('ai_messages');
      
      if (!tableDescription.message_type) {
        console.log('添加message_type字段...');
        
        // 添加message_type字段
        await queryInterface.addColumn('ai_messages', 'message_type', {
          type: Sequelize.ENUM('text', 'image', 'file', 'system', 'error'),
          allowNull: false,
          defaultValue: 'text',
          comment: '消息类型'
        });
        
        console.log('message_type字段添加成功');
      } else {
        console.log('message_type字段已存在，跳过添加');
      }
      
      // 检查tokens字段是否存在
      if (!tableDescription.tokens) {
        console.log('添加tokens字段...');
        
        await queryInterface.addColumn('ai_messages', 'tokens', {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: 'AI响应消耗的token数量'
        });
        
        console.log('tokens字段添加成功');
      } else {
        console.log('tokens字段已存在，跳过添加');
      }
      
      // 检查metadata字段是否存在
      if (!tableDescription.metadata) {
        console.log('添加metadata字段...');
        
        await queryInterface.addColumn('ai_messages', 'metadata', {
          type: Sequelize.JSON,
          allowNull: true,
          comment: '消息元数据'
        });
        
        console.log('metadata字段添加成功');
      } else {
        console.log('metadata字段已存在，跳过添加');
      }
      
      // 检查parent_message_id字段是否存在
      if (!tableDescription.parent_message_id) {
        console.log('添加parent_message_id字段...');
        
        await queryInterface.addColumn('ai_messages', 'parent_message_id', {
          type: Sequelize.STRING(36),
          allowNull: true,
          comment: '父消息ID，用于消息回复关系'
        });
        
        console.log('parent_message_id字段添加成功');
      } else {
        console.log('parent_message_id字段已存在，跳过添加');
      }
      
      console.log('ai_messages表字段更新完成！');
      
    } catch (error) {
      console.error('添加字段时出错:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('开始回滚ai_messages表字段更改...');
    
    try {
      // 删除添加的字段
      await queryInterface.removeColumn('ai_messages', 'parent_message_id');
      await queryInterface.removeColumn('ai_messages', 'metadata');
      await queryInterface.removeColumn('ai_messages', 'tokens');
      await queryInterface.removeColumn('ai_messages', 'message_type');
      
      console.log('ai_messages表字段回滚完成');
    } catch (error) {
      console.error('回滚字段时出错:', error);
      throw error;
    }
  }
};
