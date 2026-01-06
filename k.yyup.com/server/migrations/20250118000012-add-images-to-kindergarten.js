'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 为 kindergartens 表添加图片相关字段
    
    await queryInterface.addColumn('kindergartens', 'logo_url', {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: '幼儿园logo图片URL'
    });
    
    await queryInterface.addColumn('kindergartens', 'cover_images', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: '园区配图URLs，JSON格式存储多张图片'
    });
    
    await queryInterface.addColumn('kindergartens', 'contact_person', {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: '联系人姓名'
    });
    
    await queryInterface.addColumn('kindergartens', 'consultation_phone', {
      type: Sequelize.STRING(20),
      allowNull: true,
      comment: '咨询电话'
    });
    
    console.log('✅ 已为 kindergartens 表添加图片和联系人字段');
  },

  async down(queryInterface, Sequelize) {
    // 回滚操作
    await queryInterface.removeColumn('kindergartens', 'logo_url');
    await queryInterface.removeColumn('kindergartens', 'cover_images');
    await queryInterface.removeColumn('kindergartens', 'contact_person');
    await queryInterface.removeColumn('kindergartens', 'consultation_phone');
    
    console.log('✅ 已回滚 kindergartens 表的字段添加');
  }
};
