/**
 * 实时测试教师菜单API
 * 模拟教师登录并获取菜单权限
 */

import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

async function testTeacherMenuLive() {
  try {
    console.log('🔍 实时测试教师菜单API...\n');

    // 1. 教师登录
    console.log('1️⃣ 教师账号登录...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      username: 'teacher',
      password: 'password'
    });

    if (!loginResponse.data.success) {
      console.log('❌ 登录失败:', loginResponse.data.message);
      return;
    }

    const token = loginResponse.data.data.token;
    console.log('✅ 教师登录成功\n');

    // 2. 获取菜单权限
    console.log('2️⃣ 获取菜单权限...');
    const menuResponse = await axios.get(`${API_BASE}/auth-permissions/menu`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!menuResponse.data.success) {
      console.log('❌ 获取菜单失败:', menuResponse.data.message);
      return;
    }

    const menuTree = menuResponse.data.data;
    console.log(`✅ 获取菜单成功，权限数量: ${menuTree.length}\n`);

    // 3. 分析菜单结构
    console.log('📊 菜单结构分析:');
    const categories = menuTree.filter((m: any) => m.type === 'category');
    const menus = menuTree.filter((m: any) => m.type === 'menu');
    const pages = menuTree.filter((m: any) => m.type === 'page');

    console.log(`  Category: ${categories.length}`);
    console.log(`  Menu: ${menus.length}`);
    console.log(`  Page: ${pages.length}`);

    // 4. 显示菜单列表
    console.log('\n📋 菜单列表 (前20个):');
    menuTree.slice(0, 20).forEach((m: any) => {
      console.log(`  - ${m.code} (${m.chinese_name || m.name}) [${m.type}]`);
    });

    console.log('\n✅ 测试完成 - 教师菜单显示正常！');
  } catch (error: any) {
    console.error('❌ 错误:', error.response?.data || error.message);
  }
}

testTeacherMenuLive();

