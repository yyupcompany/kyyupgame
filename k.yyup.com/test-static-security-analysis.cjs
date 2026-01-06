#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 静态安全代码分析检查...\n');

// 检查认证中间件是否已修复
function checkAuthMiddleware() {
  console.log('📋 检查认证中间件修复状态...');

  try {
    const authMiddlewarePath = path.join(__dirname, 'server/src/middlewares/auth.middleware.ts');

    if (!fs.existsSync(authMiddlewarePath)) {
      console.log('❌ 认证中间件文件不存在');
      return false;
    }

    const content = fs.readFileSync(authMiddlewarePath, 'utf8');

    // 检查是否还有危险的localhost绕过
    if (content.includes("req.headers.host?.includes('localhost')") ||
        content.includes("req.headers.host?.includes('127.0.0.1')")) {
      console.log('❌ 危险: 仍有localhost认证绕过代码');
      return false;
    }

    // 检查是否已修复为安全的测试token方式
    if (content.includes('dev_bypass_token_for_testing_only')) {
      console.log('✅ 认证中间件已修复: 使用安全的测试token');
      return true;
    }

    console.log('⚠️  认证中间件状态不明');
    return false;

  } catch (error) {
    console.log('❌ 检查认证中间件时出错:', error.message);
    return false;
  }
}

// 检查路由文件中的语法错误
function checkRouteFiles() {
  console.log('\n📋 检查路由文件语法...');

  const routeDir = path.join(__dirname, 'server/src/routes');
  let errorCount = 0;
  let fileCount = 0;

  try {
    const files = fs.readdirSync(routeDir).filter(f => f.endsWith('.routes.ts'));

    for (const file of files) {
      fileCount++;
      const filePath = path.join(routeDir, file);
      const content = fs.readFileSync(filePath, 'utf8');

      // 检查常见的语法错误模式
      const issues = [];

      // 检查缺少括号的路由定义
      const routeMatches = content.match(/router\.(get|post|put|delete|patch)\([^)]*\,\s*[^)]*\)??\s*;/g);
      if (routeMatches) {
        for (const match of routeMatches) {
          const openParens = (match.match(/\(/g) || []).length;
          const closeParens = (match.match(/\)/g) || []).length;
          if (openParens !== closeParens) {
            issues.push('缺少括号的路由定义');
          }
        }
      }

      // 检查未闭合的函数调用
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('router.') && !line.endsWith(';') && !line.endsWith(')')) {
          // 可能是未闭合的行
          const nextLine = lines[i + 1]?.trim();
          if (nextLine && !nextLine.startsWith(')') && !nextLine.startsWith(';')) {
            issues.push(`第${i+1}行可能未闭合`);
          }
        }
      }

      if (issues.length > 0) {
        console.log(`❌ ${file}: 发现 ${issues.length} 个问题`);
        errorCount += issues.length;
      } else {
        console.log(`✅ ${file}: 语法检查通过`);
      }
    }

    console.log(`\n📊 路由文件检查结果: ${fileCount - errorCount}/${fileCount} 个文件通过`);
    return errorCount === 0;

  } catch (error) {
    console.log('❌ 检查路由文件时出错:', error.message);
    return false;
  }
}

// 检查权限系统的简化状态
function checkPermissionSystem() {
  console.log('\n📋 检查权限系统简化状态...');

  try {
    // 检查是否移除了复杂的权限缓存控制器
    const cacheControllerPath = path.join(__dirname, 'server/src/controllers/permission-cache.controller.ts');
    if (fs.existsSync(cacheControllerPath)) {
      console.log('❌ 权限缓存控制器仍存在，应该已移除');
      return false;
    } else {
      console.log('✅ 权限缓存控制器已移除');
    }

    // 检查权限缓存服务的简化
    const cacheServicePath = path.join(__dirname, 'server/src/services/permission-cache.service.ts');
    if (fs.existsSync(cacheServicePath)) {
      const content = fs.readFileSync(cacheServicePath, 'utf8');
      if (content.includes('getDynamicRoutes') || content.includes('checkPathPermission')) {
        console.log('❌ 权限缓存服务仍包含动态路由方法');
        return false;
      } else {
        console.log('✅ 权限缓存服务已简化');
      }
    }

    // 检查前端权限存储的简化
    const permissionStorePath = path.join(__dirname, 'client/src/stores/permissions.ts');
    if (fs.existsSync(permissionStorePath)) {
      const content = fs.readFileSync(permissionStorePath, 'utf8');
      if (content.includes('hasPermission') && content.includes('userPermissions')) {
        console.log('✅ 前端权限存储已简化');
      } else {
        console.log('⚠️  前端权限存储状态不明');
      }
    }

    return true;

  } catch (error) {
    console.log('❌ 检查权限系统时出错:', error.message);
    return false;
  }
}

// 主检查函数
function runStaticSecurityAnalysis() {
  console.log('开始静态安全代码分析检查...\n');

  const results = {
    authMiddleware: checkAuthMiddleware(),
    routeFiles: checkRouteFiles(),
    permissionSystem: checkPermissionSystem()
  };

  console.log('\n🎯 静态安全分析总结:');
  console.log(`✅ 认证中间件修复: ${results.authMiddleware ? '通过' : '失败'}`);
  console.log(`✅ 路由文件语法: ${results.routeFiles ? '通过' : '失败'}`);
  console.log(`✅ 权限系统简化: ${results.permissionSystem ? '通过' : '失败'}`);

  const passCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;

  console.log(`\n📊 总体通过率: ${passCount}/${totalCount} (${(passCount/totalCount*100).toFixed(1)}%)`);

  if (passCount === totalCount) {
    console.log('\n🎉 所有静态安全检查通过！系统修复成功。');
    console.log('\n🚀 建议下一步操作:');
    console.log('1. 启动服务器进行完整的功能测试');
    console.log('2. 运行端到端测试验证修复效果');
    console.log('3. 进行性能测试确保系统稳定性');
  } else {
    console.log('\n⚠️  仍有问题需要解决，请根据上述检查结果进行修复。');
  }

  return passCount === totalCount;
}

// 运行检查
runStaticSecurityAnalysis();