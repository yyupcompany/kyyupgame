#!/usr/bin/env node

/**
 * 检查数据库权限表重复记录
 * 只检查不修改，需要手动核对每一条重复记录
 */

const { Sequelize, DataTypes } = require('sequelize');

// 数据库连接配置
const sequelize = new Sequelize('kindergarten_management', 'root', '123456', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false // 关闭SQL日志
});

async function checkPermissionDuplicates() {
  try {
    console.log('🔍 检查权限表重复记录...\n');
    
    // 1. 检查重复的路径
    console.log('📍 检查重复的路径 (path):');
    const [duplicatePaths] = await sequelize.query(`
      SELECT path, COUNT(*) as count, GROUP_CONCAT(id) as ids, GROUP_CONCAT(name) as names
      FROM permissions 
      WHERE path IS NOT NULL AND path != '' 
      GROUP BY path 
      HAVING COUNT(*) > 1
      ORDER BY count DESC, path
    `);
    
    if (duplicatePaths.length > 0) {
      console.log(`发现 ${duplicatePaths.length} 个重复路径:\n`);
      duplicatePaths.forEach((item, index) => {
        console.log(`${index + 1}. 路径: ${item.path}`);
        console.log(`   重复次数: ${item.count}`);
        console.log(`   记录ID: ${item.ids}`);
        console.log(`   权限名称: ${item.names}`);
        console.log('   ---');
      });
    } else {
      console.log('✅ 没有发现重复的路径\n');
    }
    
    // 2. 检查重复的权限名称
    console.log('📝 检查重复的权限名称 (name):');
    const [duplicateNames] = await sequelize.query(`
      SELECT name, COUNT(*) as count, GROUP_CONCAT(id) as ids, GROUP_CONCAT(path) as paths
      FROM permissions 
      WHERE name IS NOT NULL AND name != '' 
      GROUP BY name 
      HAVING COUNT(*) > 1
      ORDER BY count DESC, name
    `);
    
    if (duplicateNames.length > 0) {
      console.log(`发现 ${duplicateNames.length} 个重复名称:\n`);
      duplicateNames.forEach((item, index) => {
        console.log(`${index + 1}. 名称: ${item.name}`);
        console.log(`   重复次数: ${item.count}`);
        console.log(`   记录ID: ${item.ids}`);
        console.log(`   路径: ${item.paths}`);
        console.log('   ---');
      });
    } else {
      console.log('✅ 没有发现重复的名称\n');
    }
    
    // 3. 检查重复的权限代码
    console.log('🔑 检查重复的权限代码 (code):');
    const [duplicateCodes] = await sequelize.query(`
      SELECT code, COUNT(*) as count, GROUP_CONCAT(id) as ids, GROUP_CONCAT(name) as names
      FROM permissions 
      WHERE code IS NOT NULL AND code != '' 
      GROUP BY code 
      HAVING COUNT(*) > 1
      ORDER BY count DESC, code
    `);
    
    if (duplicateCodes.length > 0) {
      console.log(`发现 ${duplicateCodes.length} 个重复代码:\n`);
      duplicateCodes.forEach((item, index) => {
        console.log(`${index + 1}. 代码: ${item.code}`);
        console.log(`   重复次数: ${item.count}`);
        console.log(`   记录ID: ${item.ids}`);
        console.log(`   权限名称: ${item.names}`);
        console.log('   ---');
      });
    } else {
      console.log('✅ 没有发现重复的代码\n');
    }
    
    // 4. 显示具体的重复记录详情
    if (duplicatePaths.length > 0 || duplicateNames.length > 0 || duplicateCodes.length > 0) {
      console.log('📋 重复记录详细信息:');
      console.log('需要手动核对以下记录，决定保留哪些、删除哪些:\n');
      
      // 获取所有重复记录的详细信息
      const allDuplicateIds = new Set();
      
      duplicatePaths.forEach(item => {
        item.ids.split(',').forEach(id => allDuplicateIds.add(id));
      });
      duplicateNames.forEach(item => {
        item.ids.split(',').forEach(id => allDuplicateIds.add(id));
      });
      duplicateCodes.forEach(item => {
        item.ids.split(',').forEach(id => allDuplicateIds.add(id));
      });
      
      if (allDuplicateIds.size > 0) {
        const [duplicateRecords] = await sequelize.query(`
          SELECT id, name, code, path, type, parent_id, component, icon, sort, status, created_at, updated_at
          FROM permissions 
          WHERE id IN (${Array.from(allDuplicateIds).join(',')})
          ORDER BY path, name, id
        `);
        
        console.log('重复记录详情:');
        console.table(duplicateRecords);
      }
    }
    
    // 5. 生成手动清理建议
    console.log('\n💡 手动清理建议:');
    console.log('1. 对于重复的路径，通常保留ID最小的记录（最早创建的）');
    console.log('2. 对于功能相同但名称略有不同的权限，选择名称最准确的');
    console.log('3. 删除明显的测试数据或临时数据');
    console.log('4. 保留有实际业务意义的权限记录');
    console.log('5. 删除前先备份数据库');
    
    console.log('\n⚠️ 注意事项:');
    console.log('- 删除权限前检查是否有角色关联 (role_permissions表)');
    console.log('- 删除权限前检查是否有用户关联');
    console.log('- 建议先在测试环境验证');
    
    // 6. 生成备份命令
    console.log('\n💾 备份命令:');
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    console.log(`mysqldump -u root -p kindergarten_management permissions > permissions_backup_${timestamp}.sql`);
    
  } catch (error) {
    console.error('❌ 检查过程中出现错误:', error);
  } finally {
    await sequelize.close();
  }
}

// 运行检查
if (require.main === module) {
  checkPermissionDuplicates();
}

module.exports = { checkPermissionDuplicates };
