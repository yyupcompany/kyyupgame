/**
 * 修复业务中心权限的path字段
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, 'server/.env') });

// 远程数据库配置
const sequelize = new Sequelize(
  process.env.DB_NAME || 'kargerdensales',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'pwk5ls7j',
  {
    host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
    port: parseInt(process.env.DB_PORT || '43906'),
    dialect: 'mysql',
    logging: false
  }
);

async function fixPermission() {
  try {
    console.log('🔗 连接远程数据库...\n');
    
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');
    
    // 1. 查询当前权限状态
    console.log('📋 步骤1: 查询BUSINESS_CENTER_VIEW权限');
    console.log('='.repeat(60));
    const [permissions] = await sequelize.query(`
      SELECT id, name, code, path, type, status
      FROM permissions 
      WHERE code = 'BUSINESS_CENTER_VIEW'
    `);
    
    if (permissions.length > 0) {
      const perm = permissions[0];
      console.log('当前权限状态:');
      console.log(`   ID: ${perm.id}`);
      console.log(`   名称: ${perm.name}`);
      console.log(`   代码: ${perm.code}`);
      console.log(`   路径: ${perm.path || '❌ 空'}`);
      console.log(`   类型: ${perm.type || '❌ 空'}`);
      console.log(`   状态: ${perm.status === 1 ? '✅ 启用' : '❌ 禁用'}`);
      
      // 2. 更新权限
      console.log('\n📋 步骤2: 更新权限path和type字段');
      console.log('='.repeat(60));
      
      const [result] = await sequelize.query(`
        UPDATE permissions 
        SET path = '/centers/business',
            type = 'page',
            updated_at = NOW()
        WHERE code = 'BUSINESS_CENTER_VIEW'
      `);
      
      console.log(`✅ 更新成功！影响行数: ${result.affectedRows || result.changedRows || 1}`);
      
      // 3. 验证更新
      console.log('\n📋 步骤3: 验证更新结果');
      console.log('='.repeat(60));
      const [updated] = await sequelize.query(`
        SELECT id, name, code, path, type, status, updated_at
        FROM permissions 
        WHERE code = 'BUSINESS_CENTER_VIEW'
      `);
      
      if (updated.length > 0) {
        const updatedPerm = updated[0];
        console.log('更新后的权限:');
        console.log(`   ID: ${updatedPerm.id}`);
        console.log(`   名称: ${updatedPerm.name}`);
        console.log(`   代码: ${updatedPerm.code}`);
        console.log(`   路径: ${updatedPerm.path} ${updatedPerm.path ? '✅' : '❌'}`);
        console.log(`   类型: ${updatedPerm.type} ${updatedPerm.type ? '✅' : '❌'}`);
        console.log(`   状态: ${updatedPerm.status === 1 ? '✅ 启用' : '❌ 禁用'}`);
        console.log(`   更新时间: ${updatedPerm.updated_at}`);
        
        if (updatedPerm.path === '/centers/business' && updatedPerm.type === 'page') {
          console.log('\n🎉 权限修复成功！');
          console.log('\n📝 下一步操作:');
          console.log('   1. 清除浏览器缓存和localStorage');
          console.log('   2. 重新登录系统');
          console.log('   3. 访问业务中心: http://localhost:5173/centers/business');
        } else {
          console.log('\n⚠️  权限更新可能未生效，请检查数据库');
        }
      }
      
    } else {
      console.log('❌ 未找到BUSINESS_CENTER_VIEW权限');
    }
    
    console.log('\n✅ 修复完成！');
    
  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    if (error.original) {
      console.error('   详细错误:', error.original.message);
    }
  } finally {
    await sequelize.close();
    console.log('\n👋 数据库连接已关闭');
  }
}

fixPermission();

