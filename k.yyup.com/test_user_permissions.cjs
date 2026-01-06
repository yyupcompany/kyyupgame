#!/usr/bin/env node

/**
 * 测试用户权限和菜单
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testUserPermissions() {
  try {
    console.log('🔍 测试用户权限和菜单获取...');

    // 模拟登录获取token - 使用一个测试用户
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'admin',  // 使用管理员账号测试
      password: 'admin123'
    });

    if (!loginResponse.data.success) {
      console.error('❌ 登录失败:', loginResponse.data.message);
      return;
    }

    const token = loginResponse.data.data.token;
    console.log('✅ 登录成功，获取到token');

    // 设置请求头
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 获取用户角色
    console.log('\n👤 获取用户角色...');
    const rolesResponse = await axios.get(`${BASE_URL}/api/dynamic-permissions/user-roles`, { headers });

    if (rolesResponse.data.success) {
      console.log('✅ 用户角色:', rolesResponse.data.data.map(r => `${r.name}(${r.code})`));
    } else {
      console.error('❌ 获取用户角色失败:', rolesResponse.data.message);
    }

    // 获取用户权限
    console.log('\n🔑 获取用户权限...');
    const permissionsResponse = await axios.get(`${BASE_URL}/api/dynamic-permissions/user-permissions`, { headers });

    if (permissionsResponse.data.success) {
      console.log(`✅ 用户权限数量: ${permissionsResponse.data.data.length}`);
      console.log('🔍 权限列表:', permissionsResponse.data.data.slice(0, 5).map(p => `${p.name}(${p.code})`));
    } else {
      console.error('❌ 获取用户权限失败:', permissionsResponse.data.message);
    }

    // 获取用户菜单
    console.log('\n📋 获取用户菜单...');
    const menuResponse = await axios.get(`${BASE_URL}/api/dynamic-permissions/user-menu`, { headers });

    if (menuResponse.data.success) {
      const menuData = menuResponse.data.data;
      console.log(`✅ 用户菜单数量: ${menuData.length}`);

      // 打印菜单结构
      menuData.forEach((category, index) => {
        console.log(`\n📁 ${index + 1}. ${category.chinese_name || category.name} (${category.type})`);
        if (category.children && category.children.length > 0) {
          category.children.forEach((menu, menuIndex) => {
            console.log(`   📄 ${menuIndex + 1}. ${menu.chinese_name || menu.name} - ${menu.path}`);

            if (menu.children && menu.children.length > 0) {
              menu.children.forEach((submenu, submenuIndex) => {
                console.log(`      🔗 ${submenuIndex + 1}. ${submenu.chinese_name || submenu.name} - ${submenu.path}`);
              });
            }
          });
        }
      });

    } else {
      console.error('❌ 获取用户菜单失败:', menuResponse.data.message);
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应数据:', error.response.data);
    }
  }
}

// 运行测试
testUserPermissions();