/**
 * Jest全局设置文件
 */

// 告诉ESLint关于jest全局变量
/* global jest */
// 允许require语句
/* eslint-disable @typescript-eslint/no-var-requires */

// 设置测试环境变量
process.env.NODE_ENV = 'test';

// 导入数据库模拟模块并全局替换
jest.mock('./src/config/database', () => {
  return require('./tests/mocks/database.mock');
});

// 全局替换Sequelize实例
jest.mock('sequelize', () => {
  const actualSequelize = jest.requireActual('sequelize');
  const { sequelize } = require('./tests/mocks/database.mock');
  
  return {
    ...actualSequelize,
    // 导出内存数据库实例
    __mockSequelize: sequelize
  };
}); 