#!/usr/bin/env ts-node
import { sequelize } from '../init';
import { QueryInterface } from 'sequelize';

async function runMissingFeaturesSeed() {
  try {
    console.log('🌱 开始添加缺失功能权限...');
    
    // 获取QueryInterface
    const queryInterface = sequelize.getQueryInterface();
    
    // 导入并运行缺失功能权限种子文件
    const missingFeaturesSeedFile = require('../seeders/20240318000002-add-missing-features.ts');
    
    console.log('🚀 执行缺失功能权限种子文件...');
    await missingFeaturesSeedFile.up(queryInterface);
    
    console.log('✅ 缺失功能权限添加完成！');
    
  } catch (error) {
    console.error('❌ 缺失功能权限种子文件执行失败:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

runMissingFeaturesSeed();