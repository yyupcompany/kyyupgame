#!/usr/bin/env ts-node
import { sequelize } from '../init';
import { QueryInterface } from 'sequelize';

async function runAssessmentSeed() {
  try {
    console.log('🌱 开始运行测评系统种子数据...');
    
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    const queryInterface = sequelize.getQueryInterface();
    
    // 检查是否已经存在数据
    const [existingConfigs] = await sequelize.query('SELECT COUNT(*) as count FROM assessment_configs');
    const count = (existingConfigs as any[])[0]?.count || 0;
    
    if (count > 0) {
      console.log(`⚠️  已存在 ${count} 条测评配置，是否继续？(这将添加重复数据)`);
      console.log('💡 如需清空现有数据，请手动删除后重新运行');
    }
    
    // 运行种子数据
    console.log('📋 执行种子数据: 添加测评题库...');
    const seedFile = await import('../seeders/20250127000001-seed-assessment-data');
    await seedFile.up(queryInterface);
    console.log('✅ 种子数据执行完成');
    
    // 验证数据
    const [configs] = await sequelize.query('SELECT COUNT(*) as count FROM assessment_configs');
    const [questions] = await sequelize.query('SELECT COUNT(*) as count FROM assessment_questions');
    
    console.log('');
    console.log('📊 数据统计:');
    console.log(`   - 测评配置: ${(configs as any[])[0]?.count || 0} 条`);
    console.log(`   - 测评题目: ${(questions as any[])[0]?.count || 0} 条`);
    console.log('');
    console.log('🎉 测评系统种子数据初始化完成！');
    
  } catch (error: any) {
    console.error('❌ 种子数据执行失败:', error);
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

runAssessmentSeed();
