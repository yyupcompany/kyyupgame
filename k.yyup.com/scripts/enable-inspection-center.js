#!/usr/bin/env node

/**
 * 启用督查中心 (Inspection Center)
 * 
 * 功能:
 * 1. 检查督查中心权限是否存在
 * 2. 如果不存在则创建权限记录
 * 3. 为Admin角色分配督查中心权限
 * 4. 验证权限配置
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// 测试用户凭据
const TEST_USER = {
  username: 'admin',
  password: 'admin123'
};

async function main() {
  console.log('🚀 开始启用督查中心...\n');

  try {
    // 1. 登录获取token
    console.log('🔐 步骤1: 登录系统...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, TEST_USER);
    
    if (!loginResponse.data.success) {
      throw new Error('登录失败: ' + loginResponse.data.message);
    }

    const token = loginResponse.data.data.token;
    console.log('✅ 登录成功\n');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. 检查督查中心权限是否存在
    console.log('🔍 步骤2: 检查督查中心权限...');
    let inspectionPermission = null;
    
    try {
      const permissionsResponse = await axios.get(`${API_BASE_URL}/permissions`, { headers });
      const permissions = permissionsResponse.data.data || [];
      
      inspectionPermission = permissions.find(p => 
        p.code === 'INSPECTION_CENTER' || 
        p.id === 5001 ||
        p.path === '/centers/inspection'
      );
      
      if (inspectionPermission) {
        console.log('✅ 督查中心权限已存在:');
        console.log(`   ID: ${inspectionPermission.id}`);
        console.log(`   名称: ${inspectionPermission.chinese_name || inspectionPermission.name}`);
        console.log(`   代码: ${inspectionPermission.code}`);
        console.log(`   路径: ${inspectionPermission.path}`);
        console.log(`   状态: ${inspectionPermission.status === 1 ? '启用' : '禁用'}\n`);
        
        // 如果状态是禁用的，需要启用
        if (inspectionPermission.status !== 1) {
          console.log('⚠️ 督查中心权限已禁用，正在启用...');
          await axios.put(
            `${API_BASE_URL}/permissions/${inspectionPermission.id}`,
            { status: 1 },
            { headers }
          );
          console.log('✅ 督查中心权限已启用\n');
        }
      } else {
        console.log('⚠️ 督查中心权限不存在，需要创建\n');
      }
    } catch (error) {
      console.log('⚠️ 检查权限时出错，继续创建新权限...\n');
    }

    // 3. 如果权限不存在，创建权限
    if (!inspectionPermission) {
      console.log('📋 步骤3: 创建督查中心权限...');
      
      const permissionData = {
        id: 5001,
        name: 'Inspection Center',
        chinese_name: '督查中心',
        code: 'INSPECTION_CENTER',
        type: 'menu',
        parent_id: null,
        path: '/centers/inspection',
        component: 'InspectionCenter',
        file_path: 'pages/centers/InspectionCenter.vue',
        permission: 'INSPECTION_CENTER',
        icon: 'inspection',
        sort: 13,
        status: 1
      };

      try {
        const createResponse = await axios.post(
          `${API_BASE_URL}/permissions`,
          permissionData,
          { headers }
        );
        
        if (createResponse.data.success) {
          inspectionPermission = createResponse.data.data;
          console.log('✅ 督查中心权限创建成功');
          console.log(`   ID: ${inspectionPermission.id}\n`);
        } else {
          throw new Error('创建权限失败: ' + createResponse.data.message);
        }
      } catch (error) {
        if (error.response?.status === 409) {
          console.log('⚠️ 权限已存在（ID冲突），尝试获取现有权限...\n');
          // 重新获取权限列表
          const permissionsResponse = await axios.get(`${API_BASE_URL}/permissions`, { headers });
          inspectionPermission = permissionsResponse.data.data.find(p => p.code === 'INSPECTION_CENTER');
        } else {
          throw error;
        }
      }
    }

    // 4. 为Admin角色分配督查中心权限
    console.log('👤 步骤4: 为Admin角色分配督查中心权限...');
    
    try {
      // 获取Admin角色
      const rolesResponse = await axios.get(`${API_BASE_URL}/roles`, { headers });
      const adminRole = rolesResponse.data.data?.find(r => r.code === 'ADMIN' || r.name === 'Admin');
      
      if (!adminRole) {
        throw new Error('找不到Admin角色');
      }

      console.log(`   Admin角色ID: ${adminRole.id}`);

      // 检查是否已分配权限
      const rolePermissionsResponse = await axios.get(
        `${API_BASE_URL}/roles/${adminRole.id}/permissions`,
        { headers }
      );
      
      const hasPermission = rolePermissionsResponse.data.data?.some(
        p => p.id === inspectionPermission.id || p.code === 'INSPECTION_CENTER'
      );

      if (hasPermission) {
        console.log('✅ Admin角色已拥有督查中心权限\n');
      } else {
        // 分配权限
        await axios.post(
          `${API_BASE_URL}/roles/${adminRole.id}/permissions`,
          { permissionIds: [inspectionPermission.id] },
          { headers }
        );
        console.log('✅ 已为Admin角色分配督查中心权限\n');
      }
    } catch (error) {
      console.log('⚠️ 分配权限时出错:', error.message);
      console.log('   可能需要手动在数据库中添加role_permissions记录\n');
    }

    // 5. 验证配置
    console.log('🔍 步骤5: 验证督查中心配置...');
    
    try {
      // 获取用户权限
      const userPermissionsResponse = await axios.get(
        `${API_BASE_URL}/dynamic-permissions/user-permissions`,
        { headers }
      );
      
      const userPermissions = userPermissionsResponse.data.data || [];
      const hasInspectionCenter = userPermissions.some(
        p => p.code === 'INSPECTION_CENTER' || p.path === '/centers/inspection'
      );

      if (hasInspectionCenter) {
        console.log('✅ 督查中心已在用户权限列表中');
      } else {
        console.log('⚠️ 督查中心不在用户权限列表中');
        console.log('   可能需要重新登录或刷新权限缓存');
      }
    } catch (error) {
      console.log('⚠️ 验证权限时出错:', error.message);
    }

    console.log('\n🎉 督查中心启用完成！\n');
    console.log('📋 下一步:');
    console.log('   1. 重新登录系统');
    console.log('   2. 检查侧边栏是否显示"督查中心"');
    console.log('   3. 访问 http://k.yyup.cc/centers/inspection 测试页面\n');

  } catch (error) {
    console.error('\n❌ 启用督查中心失败:');
    console.error('   错误:', error.message);
    if (error.response) {
      console.error('   响应状态:', error.response.status);
      console.error('   响应数据:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

main();

