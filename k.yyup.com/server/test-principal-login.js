/**
 * 测试园长登录的脚本
 * 查询现有园长用户或创建测试园长账号
 */

import * as dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

// 加载环境变量
dotenv.config();

// 数据库配置
const sequelize = new Sequelize(
  process.env.DB_NAME || '',
  process.env.DB_USER || '',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql',
    logging: console.log,
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },
    dialectOptions: {
      charset: 'utf8mb4',
      collation: 'utf8mb4_unicode_ci',
      ssl: {
        rejectUnauthorized: false
      }
    }
  }
);

// 定义模型
const User = sequelize.define('User', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: Sequelize.STRING(50),
  email: Sequelize.STRING(100),
  password: Sequelize.STRING(255),
  status: Sequelize.TINYINT,
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
});

const Role = sequelize.define('Role', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: Sequelize.STRING(50),
  code: Sequelize.STRING(50),
}, {
  tableName: 'roles',
  timestamps: true,
  underscored: true,
});

const UserRole = sequelize.define('UserRole', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: Sequelize.INTEGER,
  roleId: Sequelize.INTEGER,
}, {
  tableName: 'user_roles',
  timestamps: true,
  underscored: true,
});

async function testPrincipalLogin() {
  try {
    console.log('🔧 开始测试园长登录...');

    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 查找principal角色
    const principalRole = await Role.findOne({ where: { code: 'principal' } });

    if (!principalRole) {
      throw new Error('❌ 未找到principal角色');
    }

    console.log(`📋 找到principal角色: ID=${principalRole.id}, 名称=${principalRole.name}`);

    // 查询现有的园长用户
    console.log('\n🔍 查询现有的园长用户...');
    const existingPrincipals = await sequelize.query(`
      SELECT u.id, u.username, u.email, u.status
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      WHERE ur.role_id = :roleId
    `, {
      replacements: { roleId: principalRole.id },
      type: Sequelize.QueryTypes.SELECT
    });

    if (existingPrincipals.length > 0) {
      console.log('✅ 找到现有的园长用户:');
      console.table(existingPrincipals);

      // 找到一个活跃的园长用户
      const activePrincipal = existingPrincipals.find(u => u.status === 1);
      if (activePrincipal) {
        console.log(`\n🎯 可以使用以下账号测试登录:`);
        console.log(`用户名: ${activePrincipal.username}`);
        console.log(`邮箱: ${activePrincipal.email}`);
        console.log(`密码: 需要重置或联系管理员`);
      }
    } else {
      console.log('❌ 未找到现有的园长用户');

      // 检查是否有测试用户数据
      console.log('\n🔍 检查是否有测试用户数据...');
      const testUser = await User.findOne({
        where: { username: 'principal' }
      });

      if (testUser) {
        console.log('✅ 找到principal测试用户，为其分配园长角色...');
        await UserRole.create({
          userId: testUser.id,
          roleId: principalRole.id
        });
        console.log('🎉 已为principal用户分配园长角色！');
        console.log(`用户名: principal`);
        console.log(`密码: principal123 (默认)`);
      } else {
        console.log('❌ 未找到principal测试用户');
        console.log('\n💡 建议创建测试园长账号:');
        console.log('1. 运行种子数据脚本: npm run seed-data:basic');
        console.log('2. 或手动创建园长用户');
      }
    }

    console.log('\n🌐 前端登录页面:');
    console.log('URL: http://localhost:5173/login');
    console.log('后端API: http://localhost:3000/api/auth/login');

  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('\n🔌 数据库连接已关闭');
  }
}

// 执行测试
testPrincipalLogin()
  .then(() => {
    console.log('🔌 测试脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 测试脚本执行失败:', error);
    process.exit(1);
  });