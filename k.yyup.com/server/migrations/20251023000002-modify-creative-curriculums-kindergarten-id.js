'use strict';

/**
 * 修改创意课程表 - 允许kindergartenId为null
 * 支持没有关联幼儿园的用户保存课程
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE creative_curriculums 
      MODIFY COLUMN kindergarten_id INT NULL COMMENT '幼儿园ID'
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE creative_curriculums 
      MODIFY COLUMN kindergarten_id INT NOT NULL COMMENT '幼儿园ID'
    `);
  }
};

