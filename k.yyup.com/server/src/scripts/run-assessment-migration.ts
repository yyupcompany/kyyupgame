#!/usr/bin/env ts-node
import { sequelize } from '../init';
import { QueryInterface } from 'sequelize';

async function runAssessmentMigration() {
  try {
    console.log('🚀 开始运行测评系统数据库迁移...');
    
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    const queryInterface = sequelize.getQueryInterface();
    
    // 运行迁移1: 创建测评表
    console.log('📋 执行迁移: 创建测评表...');
    const migration1 = await import('../migrations/20250127000001-create-assessment-tables');
    await migration1.up(queryInterface);
    console.log('✅ 测评表创建完成');
    
    // 运行迁移2: 创建分享表
    console.log('📋 执行迁移: 创建分享表...');
    const migration2 = await import('../migrations/20250127000002-create-assessment-share-tables');
    await migration2.up(queryInterface);
    console.log('✅ 分享表创建完成');
    
    console.log('🎉 所有迁移执行完成！');
    
  } catch (error: any) {
    console.error('❌ 迁移执行失败:', error);
    console.error('错误详情:', error.message);
    if (error.stack) {
      console.error('错误堆栈:', error.stack);
    }
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

runAssessmentMigration();
