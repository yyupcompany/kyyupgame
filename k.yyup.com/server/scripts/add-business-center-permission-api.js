/**
 * 通过API添加业务中心权限脚本
 * 适用于远端数据库环境
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// 管理员登录凭据（请根据实际情况修改）
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

async function addBusinessCenterPermissionViaAPI() {
  try {
    console.log('🚀 开始通过API添加业务中心权限...');

    // 1. 管理员登录获取token
    console.log('🔐 管理员登录...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, ADMIN_CREDENTIALS);
    
    if (!loginResponse.data.success) {
      throw new Error('登录失败: ' + loginResponse.data.message);
    }

    const token = loginResponse.data.data.token;
    console.log('✅ 登录成功，获取到token');

    // 设置请求头
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. 检查权限是否已存在
    console.log('🔍 检查业务中心权限是否已存在...');
    try {
      const checkResponse = await axios.get(`${API_BASE_URL}/permissions`, { headers });
      const existingPermission = checkResponse.data.data?.find(p => p.code === 'BUSINESS_CENTER_VIEW');
      
      if (existingPermission) {
        console.log('⚠️ 业务中心权限已存在，ID:', existingPermission.id);
        return existingPermission;
      }
    } catch (error) {
      console.log('⚠️ 检查权限时出错，继续添加新权限...');
    }

    // 3. 添加业务中心权限
    console.log('📋 添加业务中心权限...');
    const permissionData = {
      name: 'Business Center',
      code: 'BUSINESS_CENTER_VIEW',
      type: 'menu',
      path: '/centers/business',
      component: 'pages/centers/BusinessCenter.vue',
      icon: 'Briefcase',
      sort: 15
    };

    const addPermissionResponse = await axios.post(`${API_BASE_URL}/permissions`, permissionData, { headers });
    
    if (!addPermissionResponse.data.success) {
      throw new Error('添加权限失败: ' + addPermissionResponse.data.message);
    }

    const permissionId = addPermissionResponse.data.data.id;
    console.log('✅ 业务中心权限添加成功，ID:', permissionId);

    // 4. 获取管理员和园长角色
    console.log('👥 获取角色信息...');
    const rolesResponse = await axios.get(`${API_BASE_URL}/roles`, { headers });
    
    if (!rolesResponse.data.success) {
      throw new Error('获取角色失败: ' + rolesResponse.data.message);
    }

    const roles = Array.isArray(rolesResponse.data.data) ? rolesResponse.data.data : rolesResponse.data;
    const adminRole = roles.find(r => r.code === 'admin' || r.name === 'admin' || r.name === '管理员');
    const principalRole = roles.find(r => r.code === 'principal' || r.name === 'principal' || r.name === '园长');

    console.log('找到角色:');
    if (adminRole) console.log(`  - 管理员: ${adminRole.name} (ID: ${adminRole.id})`);
    if (principalRole) console.log(`  - 园长: ${principalRole.name} (ID: ${principalRole.id})`);

    // 5. 为角色分配权限
    const rolesToAssign = [adminRole, principalRole].filter(Boolean);
    let assignedCount = 0;

    for (const role of rolesToAssign) {
      try {
        console.log(`🔗 为角色 ${role.name} 分配业务中心权限...`);
        
        const assignResponse = await axios.post(`${API_BASE_URL}/role-permissions`, {
          roleId: role.id,
          permissionId: permissionId
        }, { headers });

        if (assignResponse.data.success) {
          console.log(`✅ 成功为角色 ${role.name} 分配权限`);
          assignedCount++;
        } else {
          console.log(`⚠️ 为角色 ${role.name} 分配权限失败: ${assignResponse.data.message}`);
        }
      } catch (error) {
        if (error.response?.status === 409) {
          console.log(`⚠️ 角色 ${role.name} 已有此权限，跳过`);
        } else {
          console.log(`❌ 为角色 ${role.name} 分配权限时出错:`, error.message);
        }
      }
    }

    // 6. 验证权限分配
    console.log('\n📊 验证权限分配结果...');
    try {
      const verifyResponse = await axios.get(`${API_BASE_URL}/permissions/${permissionId}/roles`, { headers });
      if (verifyResponse.data.success) {
        const assignedRoles = verifyResponse.data.data;
        console.log('🎯 权限分配结果:');
        assignedRoles.forEach(role => {
          console.log(`  ✅ ${role.name} -> 业务中心权限`);
        });
      }
    } catch (error) {
      console.log('⚠️ 验证权限分配时出错，但权限可能已成功分配');
    }

    // 7. 输出总结
    console.log('\n🎉 业务中心权限配置完成！');
    console.log(`📋 权限ID: ${permissionId}`);
    console.log(`👥 分配给 ${assignedCount} 个角色`);
    console.log(`🔗 访问路径: /centers/business`);
    console.log(`📄 组件路径: pages/centers/BusinessCenter.vue`);
    console.log(`🎨 图标: Briefcase`);

    return { permissionId, assignedCount };

  } catch (error) {
    console.error('❌ 添加业务中心权限失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
    throw error;
  }
}

// 执行脚本
if (require.main === module) {
  addBusinessCenterPermissionViaAPI()
    .then(() => {
      console.log('\n✅ 脚本执行成功！');
      console.log('🌐 现在可以访问 http://localhost:5173/centers/business 查看业务中心页面');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ 脚本执行失败:', error.message);
      process.exit(1);
    });
}

module.exports = { addBusinessCenterPermissionViaAPI };
