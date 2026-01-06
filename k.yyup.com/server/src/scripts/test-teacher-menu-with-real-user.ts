/**
 * 用真实教师账号测试菜单API
 */

import axios from 'axios';
import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';

dotenv.config({ path: 'server/.env' });

const API_BASE = 'http://localhost:3000/api';

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

async function testTeacherMenuWithRealUser() {
  try {
    console.log('🔍 用真实教师账号测试菜单API...\n');

    // 1. 从数据库获取教师账号
    console.log('1️⃣ 从数据库获取教师账号...');
    const [teachers] = await sequelize.query(`
      SELECT u.id, u.username, u.email
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE r.code = 'teacher'
      LIMIT 1
    `) as any[];

    if (teachers.length === 0) {
      console.log('❌ 没有找到教师账号');
      return;
    }

    const teacher = teachers[0];
    console.log(`✅ 找到教师账号: ${teacher.username}\n`);

    // 2. 尝试用该账号登录（使用用户ID直接生成token）
    console.log('2️⃣ 生成教师token...');
    const tokenResponse = await axios.post(`${API_BASE}/auth/generate-test-token`, {
      userId: teacher.id
    }).catch(() => null);

    if (!tokenResponse) {
      console.log('⚠️ 无法生成测试token，尝试直接调用菜单API...');
      // 直接用用户ID调用菜单API（如果支持）
      return;
    }

    const token = tokenResponse.data.data.token;
    console.log('✅ Token生成成功\n');

    // 3. 获取菜单权限
    console.log('3️⃣ 获取菜单权限...');
    const menuResponse = await axios.get(`${API_BASE}/auth-permissions/menu`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!menuResponse.data.success) {
      console.log('❌ 获取菜单失败:', menuResponse.data.message);
      return;
    }

    const menuTree = menuResponse.data.data;
    console.log(`✅ 获取菜单成功，权限数量: ${menuTree.length}\n`);

    // 4. 分析菜单
    console.log('📊 菜单分析:');
    const categories = menuTree.filter((m: any) => m.type === 'category');
    const menus = menuTree.filter((m: any) => m.type === 'menu');
    const pages = menuTree.filter((m: any) => m.type === 'page');

    console.log(`  Category: ${categories.length}`);
    console.log(`  Menu: ${menus.length}`);
    console.log(`  Page: ${pages.length}`);

    // 5. 显示菜单
    console.log('\n📋 菜单列表 (前20个):');
    menuTree.slice(0, 20).forEach((m: any) => {
      console.log(`  - ${m.code} (${m.chinese_name || m.name})`);
    });

    console.log('\n✅ 测试完成！');
  } catch (error: any) {
    console.error('❌ 错误:', error.response?.data || error.message);
  } finally {
    await sequelize.close();
  }
}

testTeacherMenuWithRealUser();

