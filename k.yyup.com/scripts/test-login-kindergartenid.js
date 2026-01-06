#!/usr/bin/env node

/**
 * 测试登录API是否返回kindergartenId
 */

import fetch from 'node-fetch';

async function testLogin() {
  console.log('🔐 测试登录API是否返回kindergartenId...\n');

  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: '123456'
      })
    });

    const data = await response.json();

    console.log('📊 登录响应:\n');
    console.log(JSON.stringify(data, null, 2));
    console.log();

    if (data.success && data.data) {
      console.log('✅ 登录成功\n');
      
      console.log('👤 用户信息:');
      console.log(`   ID: ${data.data.user.id}`);
      console.log(`   用户名: ${data.data.user.username}`);
      console.log(`   角色: ${data.data.user.role}`);
      console.log(`   kindergartenId: ${data.data.user.kindergartenId || '❌ 未返回'}`);
      console.log();

      if (data.data.user.kindergartenId) {
        console.log('✅ kindergartenId 已返回！');
        console.log(`   值: ${data.data.user.kindergartenId}`);
        console.log();
        console.log('📝 前端应该保存这个值到 localStorage');
        console.log('   localStorage.setItem("kindergarten_user_info", JSON.stringify(user))');
        console.log();
      } else {
        console.log('❌ kindergartenId 未返回');
        console.log('   需要检查后端登录逻辑');
        console.log();
      }
    } else {
      console.log('❌ 登录失败');
      console.log(`   错误: ${data.message || '未知错误'}`);
      console.log();
    }

  } catch (error) {
    console.error('❌ 测试失败:');
    console.error('   错误:', error.message);
    console.log();
    console.log('💡 提示: 请确保后端服务器正在运行 (http://localhost:3000)');
    console.log();
  }
}

testLogin();

