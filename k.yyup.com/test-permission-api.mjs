/**
 * 测试权限API
 */

import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

async function testPermissionAPI() {
  try {
    console.log('🔐 测试权限API\n');
    
    // 1. 登录获取token
    console.log('📍 步骤1: 登录获取token');
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginRes.data.data.token;
    console.log(`✅ Token: ${token.substring(0, 50)}...\n`);
    
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    
    // 2. 测试权限检查API
    console.log('📍 步骤2: 测试权限检查API');
    console.log('='.repeat(60));
    
    const testPaths = [
      '/centers/business',
      'centers/business',
      '/business-center',
      '/centers/business/'
    ];
    
    for (const path of testPaths) {
      console.log(`\n测试路径: "${path}"`);
      
      try {
        const res = await axios.post(
          `${API_BASE}/dynamic-permissions/check-permission`,
          { path },
          { headers }
        );
        
        console.log(`   结果: ${res.data.data.hasPermission ? '✅ 有权限' : '❌ 无权限'}`);
        console.log(`   消息: ${res.data.message}`);
        
        if (res.data.data.hasPermission) {
          console.log(`   ✅ 找到匹配的权限！`);
        }
      } catch (error) {
        console.log(`   ❌ 错误: ${error.response?.data?.message || error.message}`);
      }
    }
    
    // 3. 查询数据库中的业务中心权限
    console.log('\n\n📍 步骤3: 查询数据库中的业务中心权限');
    console.log('='.repeat(60));
    
    const { Sequelize } = await import('sequelize');
    const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
      host: 'dbconn.sealoshzh.site',
      port: 43906,
      dialect: 'mysql',
      logging: false
    });
    
    await sequelize.authenticate();
    
    const [permissions] = await sequelize.query(`
      SELECT id, name, code, path, type, status
      FROM permissions 
      WHERE code LIKE '%BUSINESS%CENTER%' OR name LIKE '%业务%中心%'
      ORDER BY id
    `);
    
    console.log(`\n找到 ${permissions.length} 个业务中心相关权限:\n`);
    permissions.forEach(p => {
      console.log(`ID: ${p.id}`);
      console.log(`   名称: ${p.name}`);
      console.log(`   代码: ${p.code}`);
      console.log(`   路径: ${p.path || '❌ 空'}`);
      console.log(`   类型: ${p.type || '❌ 空'}`);
      console.log(`   状态: ${p.status === 1 ? '✅ 启用' : '❌ 禁用'}`);
      console.log('');
    });
    
    await sequelize.close();
    
    console.log('✅ 测试完成！');
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
    if (error.response) {
      console.error('   响应:', error.response.data);
    }
  }
}

testPermissionAPI();

