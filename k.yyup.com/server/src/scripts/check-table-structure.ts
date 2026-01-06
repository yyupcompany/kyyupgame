#!/usr/bin/env ts-node
import { sequelize } from '../init';

async function checkTableStructure() {
  try {
    console.log('🔍 检查数据库表结构...');
    
    // 检查roles表结构
    const [rolesColumns] = await sequelize.query("DESCRIBE roles");
    console.log('📋 roles表结构:', rolesColumns);
    
    // 检查permissions表结构
    const [permissionsColumns] = await sequelize.query("DESCRIBE permissions");
    console.log('📋 permissions表结构:', permissionsColumns);
    
    // 检查现有数据
    const [existingRoles] = await sequelize.query("SELECT * FROM roles LIMIT 5");
    console.log('📋 现有roles数据:', existingRoles);
    
    const [existingPermissions] = await sequelize.query("SELECT * FROM permissions LIMIT 5");
    console.log('📋 现有permissions数据:', existingPermissions);
    
  } catch (error) {
    console.error('❌ 检查表结构失败:', error);
  } finally {
    await sequelize.close();
  }
}

checkTableStructure();