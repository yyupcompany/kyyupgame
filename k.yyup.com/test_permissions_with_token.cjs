#!/usr/bin/env node

/**
 * 使用已有token测试用户权限和菜单
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testWithToken() {
  try {
    console.log('🔍 测试用户权限和菜单获取...');

    // 使用浏览器的token (如果存在的话)
    // 或者我们可以先尝试获取一个有效的token
    let token = localStorage?.getItem?.('kindergarten_token') ||
               process.env.TEST_TOKEN ||
               'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE2MzE0ODQ4MDAsImV4cCI6MTYzMTQ4ODQwMH0.test';

    // 如果没有token，尝试使用基本的测试账号
    if (!token) {
      console.log('🔐 尝试登录获取token...');
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        username: 'admin',
        password: '123456'
      });

      if (loginResponse.data.success) {
        token = loginResponse.data.data.token;
        console.log('✅ 登录成功，获取到token');
      } else {
        console.error('❌ 登录失败:', loginResponse.data.message);
        return;
      }
    }

    console.log('✅ 使用token:', token.substring(0, 20) + '...');

    // 设置请求头
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 获取用户角色
    console.log('\n👤 获取用户角色...');
    try {
      const rolesResponse = await axios.get(`${BASE_URL}/api/dynamic-permissions/user-roles`, { headers });
      if (rolesResponse.data.success) {
        console.log('✅ 用户角色:', rolesResponse.data.data.map(r => `${r.name}(${r.code})`));
      }
    } catch (err) {
      console.warn('⚠️ 获取用户角色失败:', err.response?.data?.message);
    }

    // 获取用户权限
    console.log('\n🔑 获取用户权限...');
    try {
      const permissionsResponse = await axios.get(`${BASE_URL}/api/dynamic-permissions/user-permissions`, { headers });
      if (permissionsResponse.data.success) {
        console.log(`✅ 用户权限数量: ${permissionsResponse.data.data.length}`);
        console.log('🔍 权限示例:', permissionsResponse.data.data.slice(0, 3).map(p => `${p.name}(${p.code})`));
      }
    } catch (err) {
      console.warn('⚠️ 获取用户权限失败:', err.response?.data?.message);
    }

    // 获取用户菜单
    console.log('\n📋 获取用户菜单...');
    try {
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

        // 检查是否有教师相关菜单
        const teacherMenus = menuData.filter(category =>
          category.name.includes('Teacher') ||
          category.chinese_name?.includes('教师') ||
          (category.children && category.children.some(menu =>
            menu.path.includes('teacher-center') ||
            menu.name.includes('Teacher') ||
            menu.chinese_name?.includes('教师')
          ))
        );

        console.log(`\n🎯 教师相关菜单: ${teacherMenus.length}`);
        teacherMenus.forEach(menu => {
          console.log(`   - ${menu.chinese_name || menu.name}`);
        });

        // 检查是否有家长相关菜单
        const parentMenus = menuData.filter(category =>
          category.name.includes('Parent') ||
          category.chinese_name?.includes('家长') ||
          (category.children && category.children.some(menu =>
            menu.path.includes('parent-center') ||
            menu.name.includes('Parent') ||
            menu.chinese_name?.includes('家长')
          ))
        );

        console.log(`\n👨‍👩‍👧‍👦 家长相关菜单: ${parentMenus.length}`);
        parentMenus.forEach(menu => {
          console.log(`   - ${menu.chinese_name || menu.name}`);
        });

      } else {
        console.error('❌ 获取用户菜单失败:', menuResponse.data.message);
      }
    } catch (err) {
      console.error('❌ 获取用户菜单出错:', err.message);
      if (err.response) {
        console.error('响应数据:', err.response.data);
      }
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应数据:', error.response.data);
    }
  }
}

// 运行测试
testWithToken();