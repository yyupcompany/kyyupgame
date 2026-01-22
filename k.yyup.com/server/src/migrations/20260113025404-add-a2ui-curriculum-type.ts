import { QueryInterface, DataTypes } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface) => {
    // 修改ENUM类型添加'a2ui'选项
    await queryInterface.sequelize.query(`
      ALTER TABLE creative_curriculums 
      MODIFY COLUMN curriculum_type ENUM('standard', 'interactive', 'a2ui') 
      DEFAULT 'standard' 
      COMMENT '课程类型 (standard=标准, interactive=互动, a2ui=AI搭积木)'
    `);
    console.log('✅ curriculum_type ENUM已更新，添加了a2ui类型');
  },
  
  down: async (queryInterface: QueryInterface) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE creative_curriculums 
      MODIFY COLUMN curriculum_type ENUM('standard', 'interactive') 
      DEFAULT 'standard' 
      COMMENT '课程类型'
    `);
  }
};
