#!/usr/bin/env node

/**
 * 权限系统诊断脚本
 * 检查权限API、菜单生成和路由映射问题
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 配置
const API_BASE_URL = 'http://localhost:3000';
const FRONTEND_URL = 'http://localhost:5173';

// 测试用户账号
const TEST_USERS = [
  { username: 'admin', password: 'admin123', expectedRole: 'admin' },
  { username: 'principal', password: 'principal123', expectedRole: 'principal' },
  { username: 'teacher', password: 'teacher123', expectedRole: 'teacher' },
  { username: 'parent', password: 'parent123', expectedRole: 'parent' }
];

class PermissionDiagnostic {
  constructor() {
    this.tokens = new Map();
    this.results = {
      login: {},
      permissions: {},
      menu: {},
      routes: {}
    };
  }

  // 延迟函数
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 登录获取token
  async login(user) {
    try {
      console.log(`🔐 尝试登录用户: ${user.username}`);

      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username: user.username,
        password: user.password
      });

      if (response.data.success && response.data.data?.token) {
        const token = response.data.data.token;
        const userData = response.data.data.user;

        this.tokens.set(user.username, {
          token,
          user: userData,
          role: userData.role || user.expectedRole
        });

        console.log(`✅ ${user.username} 登录成功, 角色: ${userData.role || user.expectedRole}`);
        this.results.login[user.username] = { success: true, role: userData.role || user.expectedRole };
        return true;
      } else {
        console.log(`❌ ${user.username} 登录失败:`, response.data.message);
        this.results.login[user.username] = { success: false, error: response.data.message };
        return false;
      }
    } catch (error) {
      console.log(`💥 ${user.username} 登录错误:`, error.message);
      this.results.login[user.username] = { success: false, error: error.message };
      return false;
    }
  }

  // 获取用户权限
  async getUserPermissions(username) {
    const tokenData = this.tokens.get(username);
    if (!tokenData) {
      console.log(`❌ 用户 ${username} 未登录`);
      return false;
    }

    try {
      console.log(`🔑 获取用户 ${username} 权限...`);

      const response = await axios.get(`${API_BASE_URL}/auth-permissions/user-permissions`, {
        headers: {
          'Authorization': `Bearer ${tokenData.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        const permissions = response.data.data || [];
        console.log(`✅ ${username} 权限数量: ${permissions.length}`);

        // 统计权限类型
        const typeStats = {};
        permissions.forEach(p => {
          typeStats[p.type] = (typeStats[p.type] || 0) + 1;
        });
        console.log(`📊 ${username} 权限类型分布:`, typeStats);

        this.results.permissions[username] = {
          success: true,
          count: permissions.length,
          types: typeStats,
          permissions: permissions.slice(0, 5) // 只保存前5个作为示例
        };
        return true;
      } else {
        console.log(`❌ ${username} 获取权限失败:`, response.data.message);
        this.results.permissions[username] = { success: false, error: response.data.message };
        return false;
      }
    } catch (error) {
      console.log(`💥 ${username} 获取权限错误:`, error.response?.data || error.message);
      this.results.permissions[username] = { success: false, error: error.message };
      return false;
    }
  }

  // 获取用户菜单
  async getUserMenu(username) {
    const tokenData = this.tokens.get(username);
    if (!tokenData) {
      console.log(`❌ 用户 ${username} 未登录`);
      return false;
    }

    try {
      console.log(`📋 获取用户 ${username} 菜单...`);

      const response = await axios.get(`${API_BASE_URL}/auth-permissions/user-menu`, {
        headers: {
          'Authorization': `Bearer ${tokenData.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        const menuItems = response.data.data || [];
        console.log(`✅ ${username} 菜单数量: ${menuItems.length}`);

        // 分析菜单结构
        const analyzeMenu = (items, level = 0) => {
          const stats = { categories: 0, menus: 0, pages: 0, total: 0 };
          const indent = '  '.repeat(level);

          items.forEach(item => {
            stats.total++;
            if (item.type === 'category') stats.categories++;
            else if (item.type === 'menu') stats.menus++;
            else if (item.type === 'page') stats.pages++;

            console.log(`${indent}- ${item.name || item.chinese_name} (${item.type}): ${item.path || 'N/A'}`);

            if (item.children && item.children.length > 0) {
              const childStats = analyzeMenu(item.children, level + 1);
              Object.keys(childStats).forEach(key => {
                if (key !== 'total') stats[key] += childStats[key];
              });
            }
          });

          return stats;
        };

        const menuStats = analyzeMenu(menuItems);
        console.log(`📊 ${username} 菜单统计:`, menuStats);

        this.results.menu[username] = {
          success: true,
          count: menuItems.length,
          stats: menuStats,
          menuItems: menuItems.slice(0, 3) // 只保存前3个作为示例
        };
        return true;
      } else {
        console.log(`❌ ${username} 获取菜单失败:`, response.data.message);
        this.results.menu[username] = { success: false, error: response.data.message };
        return false;
      }
    } catch (error) {
      console.log(`💥 ${username} 获取菜单错误:`, error.response?.data || error.message);
      this.results.menu[username] = { success: false, error: error.message };
      return false;
    }
  }

  // 测试权限检查
  async testPermissionCheck(username, testPath) {
    const tokenData = this.tokens.get(username);
    if (!tokenData) {
      console.log(`❌ 用户 ${username} 未登录`);
      return false;
    }

    try {
      console.log(`🔍 测试 ${username} 访问路径: ${testPath}`);

      const response = await axios.post(`${API_BASE_URL}/dynamic-permissions/check-permission`,
        { path: testPath },
        {
          headers: {
            'Authorization': `Bearer ${tokenData.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        const hasPermission = response.data.data?.hasPermission;
        console.log(`${hasPermission ? '✅' : '❌'} ${username} ${hasPermission ? '有权限' : '无权限'}访问: ${testPath}`);
        return hasPermission;
      } else {
        console.log(`❌ 权限检查失败:`, response.data.message);
        return false;
      }
    } catch (error) {
      console.log(`💥 权限检查错误:`, error.response?.data || error.message);
      return false;
    }
  }

  // 检查前端路由文件
  checkFrontendRoutes() {
    try {
      console.log(`🔍 检查前端路由配置...`);

      const routeFiles = [
        'client/src/router/dynamic-routes.ts',
        'client/src/router/optimized-routes.ts',
        'client/src/router/index.ts'
      ];

      const routeInfo = {};

      routeFiles.forEach(file => {
        const filePath = path.join(__dirname, '..', file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          const lineCount = content.split('\n').length;
          routeInfo[file] = { exists: true, lineCount };
          console.log(`📄 ${file}: ${lineCount} 行`);
        } else {
          routeInfo[file] = { exists: false };
          console.log(`❌ ${file}: 文件不存在`);
        }
      });

      this.results.routes = routeInfo;
      return routeInfo;
    } catch (error) {
      console.log(`💥 检查路由文件错误:`, error.message);
      return {};
    }
  }

  // 生成诊断报告
  generateReport() {
    console.log(`\n📋 权限系统诊断报告`);
    console.log(`=` * 50);

    // 登录结果
    console.log(`\n🔐 登录测试结果:`);
    Object.keys(this.results.login).forEach(username => {
      const result = this.results.login[username];
      console.log(`  ${username}: ${result.success ? '✅ 成功' : '❌ 失败'} ${result.role ? `(${result.role})` : ''}`);
      if (!result.success) {
        console.log(`    错误: ${result.error}`);
      }
    });

    // 权限结果
    console.log(`\n🔑 权限获取结果:`);
    Object.keys(this.results.permissions).forEach(username => {
      const result = this.results.permissions[username];
      console.log(`  ${username}: ${result.success ? '✅' : '❌'} ${result.success ? `${result.count} 个权限` : result.error}`);
      if (result.success && result.types) {
        console.log(`    类型分布: ${JSON.stringify(result.types)}`);
      }
    });

    // 菜单结果
    console.log(`\n📋 菜单获取结果:`);
    Object.keys(this.results.menu).forEach(username => {
      const result = this.results.menu[username];
      console.log(`  ${username}: ${result.success ? '✅' : '❌'} ${result.success ? `${result.count} 个菜单项` : result.error}`);
      if (result.success && result.stats) {
        console.log(`    统计: ${JSON.stringify(result.stats)}`);
      }
    });

    // 路由文件检查
    console.log(`\n🛣️ 路由文件检查:`);
    Object.keys(this.results.routes).forEach(file => {
      const result = this.results.routes[file];
      console.log(`  ${file}: ${result.exists ? '✅' : '❌'} ${result.exists ? `${result.lineCount} 行` : '文件不存在'}`);
    });

    // 保存详细报告
    const reportPath = path.join(__dirname, 'permission-diagnostic-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n💾 详细报告已保存到: ${reportPath}`);
  }

  // 主诊断流程
  async run() {
    console.log(`🚀 开始权限系统诊断...`);
    console.log(`后端API: ${API_BASE_URL}`);
    console.log(`前端URL: ${FRONTEND_URL}\n`);

    try {
      // 1. 检查前端路由文件
      this.checkFrontendRoutes();

      // 2. 登录测试用户
      console.log(`\n🔐 开始登录测试...`);
      for (const user of TEST_USERS) {
        await this.login(user);
        await this.delay(500); // 避免请求过快
      }

      // 3. 获取权限和菜单
      console.log(`\n🔑 开始权限测试...`);
      for (const username of this.tokens.keys()) {
        await this.getUserPermissions(username);
        await this.getUserMenu(username);
        await this.delay(500); // 避免请求过快
      }

      // 4. 测试一些常见路径的权限
      console.log(`\n🔍 开始路径权限测试...`);
      const testPaths = [
        '/dashboard',
        '/centers',
        '/centers/personnel',
        '/centers/activity',
        '/centers/enrollment',
        '/centers/ai',
        '/parent-center',
        '/teacher-center'
      ];

      for (const username of this.tokens.keys()) {
        for (const path of testPaths) {
          await this.testPermissionCheck(username, path);
          await this.delay(200); // 避免请求过快
        }
        console.log(''); // 空行分隔不同用户
      }

      // 5. 生成报告
      this.generateReport();

    } catch (error) {
      console.log(`💥 诊断过程出错:`, error.message);
    }

    console.log(`\n✅ 权限系统诊断完成！`);
  }
}

// 运行诊断
if (require.main === module) {
  const diagnostic = new PermissionDiagnostic();
  diagnostic.run().catch(console.error);
}

module.exports = PermissionDiagnostic;