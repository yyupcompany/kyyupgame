#!/usr/bin/env ts-node
import { sequelize } from '../init';

async function runAIQuerySeed() {
  try {
    console.log('🌱 开始添加AI查询系统权限和路由...');
    
    // 获取QueryInterface
    const queryInterface = sequelize.getQueryInterface();
    
    // 导入并运行AI查询权限种子文件
    const aiQuerySeedFile = require('../seeders/20240320000001-add-ai-query-permissions.ts');
    
    console.log('🚀 执行AI查询权限种子文件...');
    await aiQuerySeedFile.up(queryInterface);
    
    console.log('✅ AI查询系统权限和路由添加完成！');
    
  } catch (error) {
    console.error('❌ AI查询权限种子文件执行失败:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

runAIQuerySeed();