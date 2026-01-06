#!/usr/bin/env ts-node
import { sequelize } from '../init';
import { QueryInterface } from 'sequelize';

async function runPosterMarketingSeed() {
  try {
    console.log('🌱 开始添加海报管理和营销管理功能权限...');
    
    // 获取QueryInterface
    const queryInterface = sequelize.getQueryInterface();
    
    // 导入并运行海报营销权限种子文件
    const posterMarketingSeedFile = require('../seeders/20240318000003-add-poster-marketing-features.ts');
    
    console.log('🚀 执行海报营销权限种子文件...');
    await posterMarketingSeedFile.up(queryInterface);
    
    console.log('✅ 海报管理和营销管理功能权限添加完成！');
    
  } catch (error) {
    console.error('❌ 海报营销权限种子文件执行失败:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

runPosterMarketingSeed();