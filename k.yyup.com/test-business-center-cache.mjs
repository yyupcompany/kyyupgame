/**
 * 业务中心缓存问题调试
 * 测试第一次和第二次访问的差异
 */

import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

async function testBusinessCenterCache() {
  console.log('🔍 业务中心缓存问题调试\n');
  
  try {
    // 步骤1: 登录获取token
    console.log('📍 步骤1: 登录获取token');
    console.log('='.repeat(60));
    
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginRes.data.data.token;
    console.log(`✅ Token: ${token.substring(0, 50)}...\n`);
    
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    
    // 步骤2: 第一次访问 - 获取用户权限
    console.log('📍 步骤2: 第一次访问 - 获取用户权限');
    console.log('='.repeat(60));
    
    try {
      const permRes1 = await axios.get(
        `${API_BASE}/dynamic-permissions/user-permissions`,
        { headers }
      );
      
      console.log('✅ 第一次获取权限成功');
      console.log(`   权限数量: ${permRes1.data.data?.permissions?.length || 0}`);
      console.log(`   路由数量: ${permRes1.data.data?.routes?.length || 0}`);
      
      // 检查是否有业务中心权限
      const hasBusinessCenter = permRes1.data.data?.permissions?.some(p => 
        p.code === 'BUSINESS_CENTER_VIEW' || p.path === '/centers/business'
      );
      console.log(`   业务中心权限: ${hasBusinessCenter ? '✅ 有' : '❌ 无'}\n`);
      
    } catch (error) {
      console.log('❌ 第一次获取权限失败:', error.response?.data || error.message);
    }
    
    // 步骤3: 第二次访问 - 获取用户权限（模拟缓存）
    console.log('📍 步骤3: 第二次访问 - 获取用户权限（模拟缓存）');
    console.log('='.repeat(60));
    
    try {
      const permRes2 = await axios.get(
        `${API_BASE}/dynamic-permissions/user-permissions`,
        { headers }
      );
      
      console.log('✅ 第二次获取权限成功');
      console.log(`   权限数量: ${permRes2.data.data?.permissions?.length || 0}`);
      console.log(`   路由数量: ${permRes2.data.data?.routes?.length || 0}`);
      
      const hasBusinessCenter = permRes2.data.data?.permissions?.some(p => 
        p.code === 'BUSINESS_CENTER_VIEW' || p.path === '/centers/business'
      );
      console.log(`   业务中心权限: ${hasBusinessCenter ? '✅ 有' : '❌ 无'}\n`);
      
    } catch (error) {
      console.log('❌ 第二次获取权限失败:', error.response?.data || error.message);
    }
    
    // 步骤4: 检查权限 - 第一次
    console.log('📍 步骤4: 检查业务中心权限 - 第一次');
    console.log('='.repeat(60));
    
    try {
      const checkRes1 = await axios.post(
        `${API_BASE}/dynamic-permissions/check-permission`,
        { path: '/centers/business' },
        { headers }
      );
      
      console.log('✅ 第一次权限检查成功');
      console.log(`   有权限: ${checkRes1.data.data?.hasPermission ? '✅ 是' : '❌ 否'}`);
      console.log(`   消息: ${checkRes1.data.message}\n`);
      
    } catch (error) {
      console.log('❌ 第一次权限检查失败:', error.response?.data || error.message);
    }
    
    // 步骤5: 检查权限 - 第二次
    console.log('📍 步骤5: 检查业务中心权限 - 第二次');
    console.log('='.repeat(60));
    
    try {
      const checkRes2 = await axios.post(
        `${API_BASE}/dynamic-permissions/check-permission`,
        { path: '/centers/business' },
        { headers }
      );
      
      console.log('✅ 第二次权限检查成功');
      console.log(`   有权限: ${checkRes2.data.data?.hasPermission ? '✅ 是' : '❌ 否'}`);
      console.log(`   消息: ${checkRes2.data.message}\n`);
      
    } catch (error) {
      console.log('❌ 第二次权限检查失败:', error.response?.data || error.message);
    }
    
    // 步骤6: 获取业务中心数据 - 第一次
    console.log('📍 步骤6: 获取业务中心数据 - 第一次');
    console.log('='.repeat(60));
    
    try {
      const timelineRes1 = await axios.get(
        `${API_BASE}/business-center/timeline`,
        { headers }
      );
      
      console.log('✅ 第一次获取timeline成功');
      console.log(`   数据: ${JSON.stringify(timelineRes1.data).substring(0, 100)}...\n`);
      
    } catch (error) {
      console.log('❌ 第一次获取timeline失败:', error.response?.data || error.message);
      console.log(`   状态码: ${error.response?.status}`);
      console.log(`   错误详情: ${JSON.stringify(error.response?.data, null, 2)}\n`);
    }
    
    // 步骤7: 获取业务中心数据 - 第二次
    console.log('📍 步骤7: 获取业务中心数据 - 第二次');
    console.log('='.repeat(60));
    
    try {
      const timelineRes2 = await axios.get(
        `${API_BASE}/business-center/timeline`,
        { headers }
      );
      
      console.log('✅ 第二次获取timeline成功');
      console.log(`   数据: ${JSON.stringify(timelineRes2.data).substring(0, 100)}...\n`);
      
    } catch (error) {
      console.log('❌ 第二次获取timeline失败:', error.response?.data || error.message);
      console.log(`   状态码: ${error.response?.status}`);
      console.log(`   错误详情: ${JSON.stringify(error.response?.data, null, 2)}\n`);
    }
    
    // 步骤8: 获取基础信息 - 第一次
    console.log('📍 步骤8: 获取基础信息 - 第一次');
    console.log('='.repeat(60));
    
    try {
      const basicRes1 = await axios.get(
        `${API_BASE}/kindergarten/basic-info`,
        { headers }
      );
      
      console.log('✅ 第一次获取基础信息成功');
      console.log(`   幼儿园名称: ${basicRes1.data.data?.name}`);
      console.log(`   学生数: ${basicRes1.data.data?.studentCount}`);
      console.log(`   教师数: ${basicRes1.data.data?.teacherCount}\n`);
      
    } catch (error) {
      console.log('❌ 第一次获取基础信息失败:', error.response?.data || error.message);
    }
    
    // 步骤9: 获取基础信息 - 第二次
    console.log('📍 步骤9: 获取基础信息 - 第二次');
    console.log('='.repeat(60));
    
    try {
      const basicRes2 = await axios.get(
        `${API_BASE}/kindergarten/basic-info`,
        { headers }
      );
      
      console.log('✅ 第二次获取基础信息成功');
      console.log(`   幼儿园名称: ${basicRes2.data.data?.name}`);
      console.log(`   学生数: ${basicRes2.data.data?.studentCount}`);
      console.log(`   教师数: ${basicRes2.data.data?.teacherCount}\n`);
      
    } catch (error) {
      console.log('❌ 第二次获取基础信息失败:', error.response?.data || error.message);
    }
    
    // 步骤10: 测试动态路由
    console.log('📍 步骤10: 测试动态路由');
    console.log('='.repeat(60));
    
    try {
      const routesRes = await axios.get(
        `${API_BASE}/dynamic-permissions/dynamic-routes`,
        { headers }
      );
      
      console.log('✅ 获取动态路由成功');
      console.log(`   路由数量: ${routesRes.data.data?.length || 0}`);
      
      // 查找业务中心路由
      const businessRoute = routesRes.data.data?.find(r => 
        r.path === 'centers/business' || r.path === '/centers/business'
      );
      
      if (businessRoute) {
        console.log('✅ 找到业务中心路由:');
        console.log(`   路径: ${businessRoute.path}`);
        console.log(`   名称: ${businessRoute.name}`);
        console.log(`   权限: ${businessRoute.meta?.permission}`);
      } else {
        console.log('❌ 未找到业务中心路由');
      }
      
    } catch (error) {
      console.log('❌ 获取动态路由失败:', error.response?.data || error.message);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ 测试完成！');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ 测试出错:', error.message);
    if (error.response) {
      console.error('   响应数据:', error.response.data);
    }
  }
}

testBusinessCenterCache();

