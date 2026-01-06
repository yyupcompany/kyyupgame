/**
 * 通过API为教师用户分配角色
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function assignTeacherRolesViaAPI() {
  try {
    console.log('🔧 开始通过API为教师用户分配角色...\n');

    // 1. 先获取admin token
    console.log('📋 步骤1: 获取admin token...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      username: 'admin',
      password: '123456'
    });

    if (!loginResponse.data.success) {
      throw new Error('Admin登录失败: ' + loginResponse.data.message);
    }

    const adminToken = loginResponse.data.data.token;
    const authHeaders = {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    };

    console.log('✅ Admin登录成功');

    // 2. 获取所有用户，找到教师相关用户
    console.log('\n📋 步骤2: 查找教师用户...');
    const usersResponse = await axios.get(`${API_BASE}/users`, {
      headers: authHeaders
    });

    if (!usersResponse.data.success) {
      throw new Error('获取用户列表失败: ' + usersResponse.data.message);
    }

    const allUsers = usersResponse.data.data.items || [];
    const teacherUsers = allUsers.filter(user =>
      user.username && (
        user.username.toLowerCase().includes('teacher') ||
        user.username.includes('教师') ||
        user.realName && (
          user.realName.toLowerCase().includes('teacher') ||
          user.realName.includes('教师')
        )
      )
    );

    console.log(`找到 ${teacherUsers.length} 个教师用户:`);
    teacherUsers.forEach(user => {
      console.log(`  - ${user.username} (${user.realName || '无姓名'}) - ID: ${user.id}`);
    });

    if (teacherUsers.length === 0) {
      console.log('⚠️  未找到任何教师用户');
      return;
    }

    // 3. 获取角色列表，找到teacher角色
    console.log('\n📋 步骤3: 查找teacher角色...');
    const rolesResponse = await axios.get(`${API_BASE}/roles`, {
      headers: authHeaders
    });

    if (!rolesResponse.data.success) {
      throw new Error('获取角色列表失败: ' + rolesResponse.data.message);
    }

    const allRoles = rolesResponse.data.data.items || [];
    const teacherRole = allRoles.find(role => role.code === 'teacher');

    if (!teacherRole) {
      console.log('❌ 未找到teacher角色');
      return;
    }

    console.log(`✅ 找到teacher角色: ${teacherRole.name} (ID: ${teacherRole.id})`);

    // 4. 为每个教师用户分配角色
    console.log('\n📋 步骤4: 为教师用户分配角色...');
    let assignedCount = 0;
    let skippedCount = 0;

    for (const user of teacherUsers) {
      try {
        // 检查用户当前角色
        const userDetailResponse = await axios.get(`${API_BASE}/users/${user.id}`, {
          headers: authHeaders
        });

        if (userDetailResponse.data.success && userDetailResponse.data.data) {
          const userRoles = userDetailResponse.data.data.roles || [];
          const hasTeacherRole = userRoles.some(role => role.code === 'teacher');

          if (hasTeacherRole) {
            console.log(`⚠️  用户 ${user.username} 已有teacher角色，跳过`);
            skippedCount++;
            continue;
          }
        }

        // 分配角色
        const assignResponse = await axios.post(`${API_BASE}/user-roles`, {
          userId: user.id,
          roleId: teacherRole.id
        }, {
          headers: authHeaders
        });

        if (assignResponse.data.success) {
          console.log(`✅ 成功为 ${user.username} 分配teacher角色`);
          assignedCount++;
        } else {
          console.log(`⚠️  为 ${user.username} 分配角色失败: ${assignResponse.data.message}`);
        }

      } catch (error) {
        console.log(`⚠️  为 ${user.username} 分配角色时出错: ${error.message}`);
      }
    }

    console.log(`\n🎉 角色分配完成！`);
    console.log(`✅ 成功分配: ${assignedCount} 个用户`);
    console.log(`⚠️  跳过: ${skippedCount} 个用户（已存在）`);
    console.log(`📊 总计: ${assignedCount + skippedCount} 个教师用户`);

  } catch (error) {
    console.error('❌ API操作失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

assignTeacherRolesViaAPI();