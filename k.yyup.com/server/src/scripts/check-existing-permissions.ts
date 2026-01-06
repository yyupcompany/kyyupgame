#!/usr/bin/env ts-node
import { sequelize } from '../init';

async function checkExistingPermissions() {
  try {
    console.log('🔍 检查现有权限...');
    
    // 查看所有招生相关权限
    const [enrollmentPermissions] = await sequelize.query(
      `SELECT code, name, parent_id FROM permissions WHERE code LIKE '%enrollment%' OR code LIKE '%application%' ORDER BY code`
    );
    
    console.log('\n📋 招生相关权限:');
    console.table(enrollmentPermissions);
    
    // 查看所有海报相关权限
    const [posterPermissions] = await sequelize.query(
      `SELECT code, name, parent_id FROM permissions WHERE code LIKE '%poster%' ORDER BY code`
    );
    
    console.log('\n🎨 海报相关权限:');
    console.table(posterPermissions);
    
    // 查看所有营销相关权限
    const [marketingPermissions] = await sequelize.query(
      `SELECT code, name, parent_id FROM permissions WHERE code LIKE '%marketing%' ORDER BY code`
    );
    
    console.log('\n📈 营销相关权限:');
    console.table(marketingPermissions);
    
    console.log('\n✅ 检查完成！');
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

checkExistingPermissions();