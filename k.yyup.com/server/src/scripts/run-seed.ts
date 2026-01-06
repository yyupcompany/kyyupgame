#!/usr/bin/env ts-node
import { sequelize } from '../init';
import { QueryInterface } from 'sequelize';

async function runSeed() {
  try {
    console.log('🌱 开始运行数据库种子文件...');
    
    // 获取QueryInterface
    const queryInterface = sequelize.getQueryInterface();
    
    // 导入并运行seed文件
    const seedFile = require('../seeders/20240318000000-init.ts');
    
    console.log('🚀 执行种子文件...');
    await seedFile.up(queryInterface);
    
    console.log('✅ 种子文件执行完成！');
    console.log('📋 已添加14个菜单权限');
    console.log('👤 已创建超级管理员用户 (admin/admin123)');
    
  } catch (error) {
    console.error('❌ 种子文件执行失败:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// 导出函数供其他模块使用
export { runSeed };

// 如果直接运行此文件
if (require.main === module) {
  runSeed();
}