#!/usr/bin/env ts-node
import { sequelize } from '../init';
import { QueryInterface } from 'sequelize';

async function runAISeed() {
  try {
    console.log('🌱 开始添加AI功能权限...');
    
    // 获取QueryInterface
    const queryInterface = sequelize.getQueryInterface();
    
    // 导入并运行AI权限种子文件
    const aiSeedFile = require('../seeders/20240318000001-add-ai-permissions.ts');
    
    console.log('🚀 执行AI权限种子文件...');
    await aiSeedFile.up(queryInterface);
    
    console.log('✅ AI功能权限添加完成！');
    
  } catch (error) {
    console.error('❌ AI权限种子文件执行失败:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

runAISeed();