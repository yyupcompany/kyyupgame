const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';
const ADMIN_USERNAME = 'test_admin';
const ADMIN_PASSWORD = 'admin123';

async function analyzeDuplicateMenus() {
  console.log('\n' + '='.repeat(70));
  console.log('🔍 园长侧边栏重复菜单分析');
  console.log('='.repeat(70) + '\n');

  try {
    // 登录
    console.log('📍 步骤1: 园长登录');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD
    });

    if (!loginResponse.data.success) {
      console.log('❌ 登录失败');
      return;
    }

    const authToken = loginResponse.data.data.token;
    console.log('✅ 登录成功\n');

    // 获取动态路由
    console.log('📍 步骤2: 获取动态路由');
    const routesResponse = await axios.get(
      `${API_BASE_URL}/dynamic-permissions/dynamic-routes`,
      {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }
    );

    const data = routesResponse.data.data;
    const routes = data.routes || [];
    
    console.log(`✅ 获取到 ${routes.length} 个路由\n`);

    // 过滤中心类路由
    const centerRoutes = routes.filter(route => {
      const path = route.path || '';
      const name = route.name || route.chinese_name || '';
      return (
        path.includes('/centers/') || 
        path.includes('-center') ||
        name.includes('Center') ||
        name.includes('中心')
      );
    });

    console.log('📍 步骤3: 分析重复菜单\n');
    console.log(`找到 ${centerRoutes.length} 个中心类路由\n`);

    // 按名称分组
    const menuGroups = {};
    centerRoutes.forEach(route => {
      const name = route.chinese_name || route.name;
      if (!menuGroups[name]) {
        menuGroups[name] = [];
      }
      menuGroups[name].push(route);
    });

    // 找出重复的菜单
    console.log('🔴 重复菜单列表:\n');
    let duplicateCount = 0;
    
    Object.entries(menuGroups).forEach(([name, routes]) => {
      if (routes.length > 1) {
        duplicateCount++;
        console.log(`${duplicateCount}. ${name} - 出现 ${routes.length} 次`);
        console.log('   ' + '─'.repeat(60));
        
        routes.forEach((route, index) => {
          console.log(`   版本 ${index + 1}:`);
          console.log(`   - 路径: ${route.path}`);
          console.log(`   - 组件: ${route.component || route.file_path || '未指定'}`);
          console.log(`   - 子菜单: ${route.children ? route.children.length : 0}个`);
          console.log(`   - 权限ID: ${route.id}`);
          console.log(`   - 权限代码: ${route.code || route.permission || '未指定'}`);
          
          if (route.children && route.children.length > 0) {
            console.log(`   - 子菜单列表:`);
            route.children.forEach((child, idx) => {
              console.log(`     ${idx + 1}. ${child.chinese_name || child.name} (${child.path})`);
            });
          }
          console.log('');
        });
        console.log('');
      }
    });

    if (duplicateCount === 0) {
      console.log('   ✅ 没有发现重复菜单\n');
    } else {
      console.log(`   ⚠️  共发现 ${duplicateCount} 个重复菜单\n`);
    }

    // 显示所有唯一菜单
    console.log('📍 步骤4: 所有唯一菜单列表\n');
    console.log('✅ 唯一菜单 (只出现一次):\n');
    
    let uniqueCount = 0;
    Object.entries(menuGroups).forEach(([name, routes]) => {
      if (routes.length === 1) {
        uniqueCount++;
        const route = routes[0];
        console.log(`${uniqueCount}. ${name}`);
        console.log(`   路径: ${route.path}`);
        console.log(`   子菜单: ${route.children ? route.children.length : 0}个`);
        console.log('');
      }
    });

    // 统计总结
    console.log('=' .repeat(70));
    console.log('📊 统计总结\n');
    console.log(`总菜单数: ${centerRoutes.length}个`);
    console.log(`唯一菜单: ${uniqueCount}个`);
    console.log(`重复菜单: ${duplicateCount}个`);
    console.log(`实际应显示: ${uniqueCount + duplicateCount}个`);
    console.log(`多余显示: ${centerRoutes.length - (uniqueCount + duplicateCount)}个`);
    console.log('=' .repeat(70) + '\n');

    // 建议
    console.log('💡 优化建议:\n');
    
    if (duplicateCount > 0) {
      console.log('1. 移除重复菜单:');
      Object.entries(menuGroups).forEach(([name, routes]) => {
        if (routes.length > 1) {
          console.log(`\n   ${name}:`);
          
          // 找出完整版（有子菜单的）
          const fullVersion = routes.find(r => r.children && r.children.length > 0);
          const simpleVersion = routes.find(r => !r.children || r.children.length === 0);
          
          if (fullVersion && simpleVersion) {
            console.log(`   ✅ 保留: ${fullVersion.path} (${fullVersion.children.length}个子菜单)`);
            console.log(`   ❌ 移除: ${simpleVersion.path} (无子菜单)`);
          } else {
            console.log(`   ⚠️  需要手动判断保留哪个版本`);
            routes.forEach((r, idx) => {
              console.log(`      版本${idx + 1}: ${r.path} (${r.children ? r.children.length : 0}个子菜单)`);
            });
          }
        }
      });
      
      console.log('\n2. 统一路径规范:');
      console.log('   - 园长使用: /centers/* (完整版)');
      console.log('   - 教师使用: /teacher-center/* (简化版)');
      
      console.log('\n3. 修改权限配置:');
      console.log('   - 检查权限表中是否有重复的权限记录');
      console.log('   - 确保每个菜单只有一个权限记录');
    } else {
      console.log('   ✅ 菜单结构良好，无需优化');
    }

  } catch (error) {
    console.error('\n❌ 分析失败:', error.message);
    if (error.response) {
      console.error('   响应状态:', error.response.status);
    }
  }
}

// 运行分析
analyzeDuplicateMenus();

