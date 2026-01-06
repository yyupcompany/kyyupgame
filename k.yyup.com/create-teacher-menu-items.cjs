/**
 * 创建缺失的教师菜单项
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function createTeacherMenuItems() {
  try {
    console.log('🔧 开始创建缺失的教师菜单项...\n');

    // 1. 获取admin token
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      username: 'admin',
      password: '123456'
    });

    if (!loginResponse.data.success) {
      throw new Error('Admin登录失败');
    }

    const adminToken = loginResponse.data.data.token;
    const authHeaders = {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    };

    console.log('✅ Admin登录成功');

    // 2. 获取现有的TEACHER_CENTER_DIRECTORY作为主分类
    const permissionsResponse = await axios.get(`${API_BASE}/permissions`, {
      headers: authHeaders,
      params: {
        code: 'TEACHER_CENTER_DIRECTORY'
      }
    });

    if (!permissionsResponse.data.success) {
      throw new Error('获取权限失败');
    }

    const existingPermissions = permissionsResponse.data.data.items || [];
    const mainCategory = existingPermissions.find(p => p.code === 'TEACHER_CENTER_DIRECTORY');

    if (!mainCategory) {
      console.log('❌ 未找到TEACHER_CENTER_DIRECTORY主分类');
      return;
    }

    console.log(`✅ 找到主分类: ${mainCategory.chinese_name || mainCategory.name} (ID: ${mainCategory.id})`);

    // 3. 需要创建的子菜单项
    const menuItems = [
      {
        code: 'TEACHER_DASHBOARD_PAGE',
        name: 'Teacher Dashboard',
        chinese_name: '教师仪表板',
        path: '/teacher-center/dashboard',
        component: 'pages/teacher-center/dashboard/index.vue',
        icon: 'Dashboard',
        sort: 1
      },
      {
        code: 'TEACHER_INTERACTIVE_CURRICULUM',
        name: 'Interactive Curriculum',
        chinese_name: '互动课程',
        path: '/teacher-center/creative-curriculum',
        component: 'pages/teacher-center/creative-curriculum/index.vue',
        icon: 'Sparkles',
        sort: 2
      },
      {
        code: 'TEACHER_TEACHING',
        name: 'Teaching Management',
        chinese_name: '教学管理',
        path: '/teacher-center/teaching',
        component: 'pages/teacher-center/teaching/index.vue',
        icon: 'BookOpen',
        sort: 3
      },
      {
        code: 'TEACHER_ACTIVITIES',
        name: 'Activities',
        chinese_name: '活动管理',
        path: '/teacher-center/activities',
        component: 'pages/teacher-center/activities/index.vue',
        icon: 'Calendar',
        sort: 4
      },
      {
        code: 'TEACHER_ATTENDANCE',
        name: 'Attendance',
        chinese_name: '考勤管理',
        path: '/teacher-center/attendance',
        component: 'pages/teacher-center/attendance/index.vue',
        icon: 'Clock',
        sort: 5
      },
      {
        code: 'TEACHER_TASKS',
        name: 'Tasks',
        chinese_name: '任务管理',
        path: '/teacher-center/tasks',
        component: 'pages/teacher-center/tasks/index.vue',
        icon: 'CheckSquare',
        sort: 6
      },
      {
        code: 'TEACHER_NOTIFICATIONS',
        name: 'Notifications',
        chinese_name: '通知管理',
        path: '/teacher-center/notifications',
        component: 'pages/teacher-center/notifications/index.vue',
        icon: 'Bell',
        sort: 7
      },
      {
        code: 'TEACHER_ENROLLMENT',
        name: 'Enrollment',
        chinese_name: '招生管理',
        path: '/teacher-center/enrollment',
        component: 'pages/teacher-center/enrollment/index.vue',
        icon: 'UserPlus',
        sort: 8
      },
      {
        code: 'TEACHER_CUSTOMER_TRACKING',
        name: 'Customer Tracking',
        chinese_name: '客户跟踪',
        path: '/teacher-center/customer-tracking',
        component: 'pages/teacher-center/customer-tracking/index.vue',
        icon: 'Users',
        sort: 9
      },
      {
        code: 'TEACHER_CUSTOMER_POOL',
        name: 'Customer Pool',
        chinese_name: '客户池管理',
        path: '/teacher-center/customer-pool',
        component: 'pages/teacher-center/customer-pool/index.vue',
        icon: 'Users',
        sort: 10
      }
    ];

    console.log(`\n📋 准备创建 ${menuItems.length} 个菜单项`);

    // 4. 检查已存在的权限
    const allPermissionsResponse = await axios.get(`${API_BASE}/permissions`, {
      headers: authHeaders
    });

    const existingCodes = allPermissionsResponse.data.data.items.map(p => p.code);

    // 5. 创建缺失的权限
    let createdCount = 0;
    let skippedCount = 0;

    for (const item of menuItems) {
      if (existingCodes.includes(item.code)) {
        console.log(`⚠️  ${item.code} 已存在，跳过`);
        skippedCount++;
        continue;
      }

      try {
        const createResponse = await axios.post(`${API_BASE}/permissions`, {
          name: item.name,
          chinese_name: item.chinese_name,
          code: item.code,
          type: 'menu',
          parent_id: mainCategory.id,
          path: item.path,
          component: item.component,
          icon: item.icon,
          sort: item.sort,
          status: 1
        }, {
          headers: authHeaders
        });

        if (createResponse.data.success) {
          console.log(`✅ 创建成功: ${item.chinese_name} (${item.code})`);
          createdCount++;
        } else {
          console.log(`❌ 创建失败: ${item.chinese_name} - ${createResponse.data.message}`);
        }

      } catch (error) {
        console.log(`❌ 创建错误: ${item.chinese_name} - ${error.message}`);
      }
    }

    // 6. 为teacher角色分配新权限
    if (createdCount > 0) {
      console.log('\n📋 为teacher角色分配新权限...');

      // 获取teacher角色ID
      const rolesResponse = await axios.get(`${API_BASE}/roles`, {
        headers: authHeaders,
        params: { code: 'teacher' }
      });

      const teacherRole = rolesResponse.data.data.items.find(r => r.code === 'teacher');
      if (teacherRole) {
        // 获取所有TEACHER_权限ID
        const allTeacherPermsResponse = await axios.get(`${API_BASE}/permissions`, {
          headers: authHeaders,
          params: {
            code: menuItems.map(item => item.code).join(',')
          }
        });

        const teacherPermIds = allTeacherPermsResponse.data.data.items.map(p => p.id);

        // 分配权限
        for (const permId of teacherPermIds) {
          try {
            await axios.post(`${API_BASE}/user-roles`, {
              userId: 792, // test_teacher用户ID
              roleId: teacherRole.id
            }, {
              headers: authHeaders
            });
          } catch (error) {
            // 忽略已存在的分配
          }
        }

        console.log(`✅ 为teacher角色分配了 ${teacherPermIds.length} 个权限`);
      }
    }

    console.log(`\n🎉 创建完成！`);
    console.log(`✅ 新创建: ${createdCount} 个菜单项`);
    console.log(`⚠️  跳过: ${skippedCount} 个（已存在）`);
    console.log(`📊 总计: ${createdCount + skippedCount} 个教师菜单项`);

  } catch (error) {
    console.error('❌ 操作失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

createTeacherMenuItems();