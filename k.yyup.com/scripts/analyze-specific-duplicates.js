#!/usr/bin/env node

/**
 * 分析具体的重复权限记录
 * 提供详细的对比信息，帮助手动决策
 */

const { Sequelize } = require('sequelize');

// 数据库连接配置
const sequelize = new Sequelize('kindergarten_management', 'root', '123456', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false
});

async function analyzeSpecificDuplicates() {
  try {
    console.log('🔍 分析具体重复权限记录...\n');
    
    // 1. 分析重复路径的详细情况
    await analyzeDuplicatePaths();
    
    // 2. 分析重复名称的详细情况
    await analyzeDuplicateNames();
    
    // 3. 检查角色权限关联
    await checkRolePermissionRelations();
    
  } catch (error) {
    console.error('❌ 分析过程中出现错误:', error);
  } finally {
    await sequelize.close();
  }
}

async function analyzeDuplicatePaths() {
  console.log('📍 重复路径详细分析:');
  console.log('='.repeat(60));
  
  const [duplicatePaths] = await sequelize.query(`
    SELECT path, COUNT(*) as count
    FROM permissions 
    WHERE path IS NOT NULL AND path != '' 
    GROUP BY path 
    HAVING COUNT(*) > 1
    ORDER BY path
  `);
  
  for (const pathGroup of duplicatePaths) {
    console.log(`\n🔗 路径: ${pathGroup.path} (${pathGroup.count} 条记录)`);
    
    const [records] = await sequelize.query(`
      SELECT id, name, code, type, parent_id, component, icon, sort, status, created_at, updated_at
      FROM permissions 
      WHERE path = '${pathGroup.path}'
      ORDER BY id
    `);
    
    console.log('详细记录:');
    records.forEach((record, index) => {
      console.log(`  ${index + 1}. ID: ${record.id}`);
      console.log(`     名称: ${record.name}`);
      console.log(`     代码: ${record.code}`);
      console.log(`     类型: ${record.type}`);
      console.log(`     父级ID: ${record.parent_id || '无'}`);
      console.log(`     组件: ${record.component || '无'}`);
      console.log(`     图标: ${record.icon || '无'}`);
      console.log(`     排序: ${record.sort}`);
      console.log(`     状态: ${record.status}`);
      console.log(`     创建时间: ${record.created_at}`);
      console.log(`     更新时间: ${record.updated_at}`);
      
      // 检查是否有角色关联
      const [roleCount] = await sequelize.query(`
        SELECT COUNT(*) as count FROM role_permissions WHERE permission_id = ${record.id}
      `);
      console.log(`     角色关联: ${roleCount[0].count} 个角色`);
      console.log('     ---');
    });
    
    // 提供删除建议
    console.log('💡 建议:');
    if (records.length === 2) {
      const older = records[0];
      const newer = records[1];
      
      if (older.name === newer.name && older.code === newer.code) {
        console.log(`   建议保留: ID ${older.id} (较早创建)`);
        console.log(`   建议删除: ID ${newer.id} (重复记录)`);
      } else {
        console.log('   需要手动判断，记录内容不完全相同');
      }
    } else {
      console.log('   多条重复记录，需要仔细核对');
    }
  }
}

async function analyzeDuplicateNames() {
  console.log('\n\n📝 重复名称详细分析:');
  console.log('='.repeat(60));
  
  const [duplicateNames] = await sequelize.query(`
    SELECT name, COUNT(*) as count
    FROM permissions 
    WHERE name IS NOT NULL AND name != '' 
    GROUP BY name 
    HAVING COUNT(*) > 1
    ORDER BY name
  `);
  
  for (const nameGroup of duplicateNames) {
    console.log(`\n📋 名称: ${nameGroup.name} (${nameGroup.count} 条记录)`);
    
    const [records] = await sequelize.query(`
      SELECT id, name, code, path, type, parent_id, created_at
      FROM permissions 
      WHERE name = '${nameGroup.name.replace(/'/g, "''")}'
      ORDER BY id
    `);
    
    console.log('详细记录:');
    records.forEach((record, index) => {
      console.log(`  ${index + 1}. ID: ${record.id}, 代码: ${record.code}, 路径: ${record.path || '无'}, 类型: ${record.type}`);
    });
    
    // 检查路径是否不同
    const uniquePaths = [...new Set(records.map(r => r.path).filter(p => p))];
    if (uniquePaths.length > 1) {
      console.log(`⚠️ 注意: 相同名称但路径不同: ${uniquePaths.join(', ')}`);
    }
  }
}

async function checkRolePermissionRelations() {
  console.log('\n\n🔗 角色权限关联检查:');
  console.log('='.repeat(60));
  
  // 获取所有重复记录的ID
  const [allDuplicates] = await sequelize.query(`
    SELECT id FROM permissions WHERE id IN (
      SELECT id FROM permissions WHERE path IN (
        SELECT path FROM permissions 
        WHERE path IS NOT NULL AND path != '' 
        GROUP BY path HAVING COUNT(*) > 1
      )
      UNION
      SELECT id FROM permissions WHERE name IN (
        SELECT name FROM permissions 
        WHERE name IS NOT NULL AND name != '' 
        GROUP BY name HAVING COUNT(*) > 1
      )
    )
  `);
  
  console.log(`检查 ${allDuplicates.length} 个重复权限的角色关联...\n`);
  
  for (const duplicate of allDuplicates) {
    const [relations] = await sequelize.query(`
      SELECT rp.role_id, r.name as role_name, p.name as permission_name, p.path
      FROM role_permissions rp
      JOIN roles r ON rp.role_id = r.id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.permission_id = ${duplicate.id}
    `);
    
    if (relations.length > 0) {
      console.log(`权限ID ${duplicate.id} (${relations[0].permission_name}) 被以下角色使用:`);
      relations.forEach(rel => {
        console.log(`  - 角色: ${rel.role_name} (ID: ${rel.role_id})`);
      });
      console.log('');
    }
  }
}

// 生成手动删除SQL的辅助函数
function generateDeleteSQL() {
  console.log('\n\n📝 手动删除SQL模板:');
  console.log('='.repeat(60));
  console.log(`
-- 删除权限记录的步骤：
-- 1. 先删除角色权限关联
DELETE FROM role_permissions WHERE permission_id = [要删除的权限ID];

-- 2. 再删除权限记录
DELETE FROM permissions WHERE id = [要删除的权限ID];

-- 示例：删除权限ID为123的记录
-- DELETE FROM role_permissions WHERE permission_id = 123;
-- DELETE FROM permissions WHERE id = 123;

-- 注意：请根据上面的分析结果，替换具体的ID
  `);
}

// 运行分析
if (require.main === module) {
  analyzeSpecificDuplicates().then(() => {
    generateDeleteSQL();
  });
}

module.exports = { analyzeSpecificDuplicates };
