const axios = require('axios');

async function testAttendancePermission() {
  try {
    console.log('🔍 测试考勤中心权限配置...\n');

    // 测试动态路由API
    console.log('📋 测试动态路由API...');
    const routesResponse = await axios.get('http://localhost:3000/api/dynamic-permissions/dynamic-routes', {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (routesResponse.data.success && routesResponse.data.data) {
      const attendanceRoutes = routesResponse.data.data.filter(route =>
        route.name === 'Attendance Center' ||
        route.chineseName === '考勤中心' ||
        route.code === 'ATTENDANCE_CENTER'
      );

      if (attendanceRoutes.length > 0) {
        console.log('✅ 找到考勤中心路由配置:');
        attendanceRoutes.forEach(route => {
          console.log(`  - 名称: ${route.name} (${route.chineseName})`);
          console.log(`  - 路径: ${route.path}`);
          console.log(`  - 组件: ${route.component}`);
          console.log(`  - 权限: ${route.permission}`);
          console.log(`  - 图标: ${route.icon}`);
          console.log(`  - 排序: ${route.sort}`);
          console.log('  ---');
        });
      } else {
        console.log('❌ 未找到考勤中心路由配置');
      }

      // 检查子路由
      const attendanceSubRoutes = routesResponse.data.data.filter(route =>
        route.parentId && attendanceRoutes.some(parent => parent.id === route.parentId)
      );

      if (attendanceSubRoutes.length > 0) {
        console.log(`✅ 找到 ${attendanceSubRoutes.length} 个考勤中心子路由:`);
        attendanceSubRoutes.forEach(route => {
          console.log(`  - ${route.name} (${route.chineseName})`);
        });
      }
    }

    // 测试用户权限API（不需要登录的公共接口）
    console.log('\n📋 测试权限检查API...');
    try {
      const checkResponse = await axios.post('http://localhost:3000/api/dynamic-permissions/check-permission', {
        permission: 'attendance:center:view'
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('权限检查响应:', checkResponse.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('⚠️  权限检查API需要登录（这是正常的）');
      } else {
        console.log('❌ 权限检查API测试失败:', error.message);
      }
    }

    console.log('\n🎉 考勤中心权限配置测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testAttendancePermission();