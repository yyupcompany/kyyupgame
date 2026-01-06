/**
 * 修复中心页面权限 - 将menu类型的中心转换为category类型
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../server/.env') });

// 数据库配置
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

async function fixCenterPermissions() {
  try {
    console.log('🔧 开始修复中心页面权限...\n');

    // 需要转换为category的中心页面（menu类型，路径以/centers/开头）
    const centersToFix = [
      { id: 3002, name: '人事中心', path: '/centers/personnel' },
      { id: 3005, name: '营销中心', path: '/centers/marketing' },
      { id: 3006, name: 'AI中心', path: '/centers/ai' },
      { id: 2013, name: '系统中心', path: '/centers/system' },
      { id: 3074, name: '财务中心', path: '/centers/finance' },
      { id: 3073, name: '分析中心', path: '/centers/analytics' },
      { id: 5001, name: '检查中心', path: '/centers/inspection' }
    ];

    console.log('📋 将以下menu类型的中心转换为category类型:');
    centersToFix.forEach((center, index) => {
      console.log(`  ${index + 1}. ${center.name} (ID: ${center.id}) - ${center.path}`);
    });

    console.log('\n⚠️  这将修改数据库中的权限类型，是否继续？');
    console.log('如果确认，请手动执行以下SQL语句：\n');

    // 生成SQL语句
    const updateSql = centersToFix.map(center => 
      `UPDATE permissions SET type = 'category' WHERE id = ${center.id};`
    ).join('\n');

    console.log(updateSql);

    console.log('\n或者执行以下批量更新：');
    const ids = centersToFix.map(c => c.id).join(',');
    console.log(`UPDATE permissions SET type = 'category' WHERE id IN (${ids});`);

    // 检查admin角色是否已有这些权限
    console.log('\n📋 检查admin角色权限关联:');
    const [adminRole] = await sequelize.query(`
      SELECT id FROM roles WHERE code = 'admin' AND deleted_at IS NULL
    `);
    
    if (adminRole.length === 0) {
      console.log('❌ 未找到admin角色');
      return;
    }
    
    const adminRoleId = adminRole[0].id;

    for (const center of centersToFix) {
      const [existing] = await sequelize.query(`
        SELECT id FROM role_permissions 
        WHERE role_id = ${adminRoleId} AND permission_id = ${center.id}
      `);
      
      if (existing.length > 0) {
        console.log(`  ✅ ${center.name} - admin角色已有权限`);
      } else {
        console.log(`  ⚠️  ${center.name} - admin角色缺少权限，需要添加`);
        console.log(`     INSERT INTO role_permissions (role_id, permission_id) VALUES (${adminRoleId}, ${center.id});`);
      }
    }

    console.log('\n✅ 检查完成');
    console.log('\n💡 建议操作步骤:');
    console.log('1. 备份数据库');
    console.log('2. 执行上述UPDATE语句，将menu类型转换为category');
    console.log('3. 如有缺失权限，执行INSERT语句添加权限关联');
    console.log('4. 重启后端服务');
    console.log('5. 刷新前端页面，检查侧边栏是否显示13个中心');
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

fixCenterPermissions();

