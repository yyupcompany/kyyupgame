/**
 * 检查动态路由API返回的数据
 */

import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

async function checkDynamicRoutes() {
  console.log('🔍 检查动态路由API\n');
  
  try {
    // 登录
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginRes.data.data.token;
    const headers = { 'Authorization': `Bearer ${token}` };
    
    console.log('✅ 登录成功\n');
    
    // 获取动态路由
    console.log('📍 获取动态路由');
    console.log('='.repeat(60));
    
    const routesRes = await axios.get(
      `${API_BASE}/dynamic-permissions/dynamic-routes`,
      { headers }
    );
    
    const routes = routesRes.data.data;
    console.log(`总路由数: ${routes.length}\n`);
    
    // 查找业务中心相关路由
    console.log('查找业务中心相关路由:');
    const businessRoutes = routes.filter(r => 
      r.path?.includes('business') || 
      r.name?.includes('Business') ||
      r.meta?.title?.includes('业务')
    );
    
    if (businessRoutes.length > 0) {
      console.log(`✅ 找到 ${businessRoutes.length} 个业务中心相关路由:\n`);
      businessRoutes.forEach((route, index) => {
        console.log(`${index + 1}. ${route.name || '未命名'}`);
        console.log(`   路径: ${route.path}`);
        console.log(`   标题: ${route.meta?.title || '无'}`);
        console.log(`   权限: ${route.meta?.permission || '无'}`);
        console.log(`   组件: ${route.component || '无'}`);
        console.log('');
      });
    } else {
      console.log('❌ 未找到业务中心相关路由\n');
    }
    
    // 获取所有路由
    console.log('📍 获取所有路由（all-routes）');
    console.log('='.repeat(60));
    
    const allRoutesRes = await axios.get(
      `${API_BASE}/dynamic-permissions/all-routes`,
      { headers }
    );
    
    const allRoutes = allRoutesRes.data.data;
    console.log(`总路由数: ${allRoutes.length}\n`);
    
    // 查找业务中心
    const businessInAll = allRoutes.filter(r => 
      r.path?.includes('business') || 
      r.name?.includes('Business') ||
      r.meta?.title?.includes('业务')
    );
    
    if (businessInAll.length > 0) {
      console.log(`✅ 在all-routes中找到 ${businessInAll.length} 个业务中心相关路由:\n`);
      businessInAll.forEach((route, index) => {
        console.log(`${index + 1}. ${route.name || '未命名'}`);
        console.log(`   路径: ${route.path}`);
        console.log(`   标题: ${route.meta?.title || '无'}`);
        console.log(`   权限: ${route.meta?.permission || '无'}`);
        console.log('');
      });
    } else {
      console.log('❌ 在all-routes中未找到业务中心相关路由\n');
    }
    
    // 获取用户权限
    console.log('📍 获取用户权限');
    console.log('='.repeat(60));
    
    const permRes = await axios.get(
      `${API_BASE}/dynamic-permissions/user-permissions`,
      { headers }
    );
    
    const permissions = permRes.data.data?.permissions || [];
    console.log(`总权限数: ${permissions.length}\n`);
    
    // 查找业务中心权限
    const businessPerms = permissions.filter(p => 
      p.code?.includes('BUSINESS') || 
      p.name?.includes('业务') ||
      p.path?.includes('business')
    );
    
    if (businessPerms.length > 0) {
      console.log(`✅ 找到 ${businessPerms.length} 个业务中心相关权限:\n`);
      businessPerms.forEach((perm, index) => {
        console.log(`${index + 1}. ${perm.name}`);
        console.log(`   代码: ${perm.code}`);
        console.log(`   路径: ${perm.path || '无'}`);
        console.log(`   类型: ${perm.type || '无'}`);
        console.log('');
      });
    } else {
      console.log('❌ 未找到业务中心相关权限\n');
    }
    
    // 检查权限
    console.log('📍 检查业务中心权限');
    console.log('='.repeat(60));
    
    const checkRes = await axios.post(
      `${API_BASE}/dynamic-permissions/check-permission`,
      { path: '/centers/business' },
      { headers }
    );
    
    console.log(`路径: /centers/business`);
    console.log(`有权限: ${checkRes.data.data?.hasPermission ? '✅ 是' : '❌ 否'}`);
    console.log(`消息: ${checkRes.data.message}\n`);
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
    if (error.response) {
      console.error('响应:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

checkDynamicRoutes();

