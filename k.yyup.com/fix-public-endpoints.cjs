const fs = require('fs');
const path = require('path');

/**
 * 修复公开接口的Swagger标注
 * 自动添加公开接口标注，移除不必要的security部分
 */

const routesDir = path.join(__dirname, 'server/src/routes');

// 公开接口标注文本
const publicAnnotations = {
  'health': '（健康检查-公开接口）',
  'ping': '（健康检查-公开接口）',
  'status': '（状态检查-公开接口）',
  'version': '（版本信息-公开接口）',
  'info': '（系统信息-公开接口）',
  'login': '（登录认证-公开接口）',
  'register': '（用户注册-公开接口）',
  'forgot': '（忘记密码-公开接口）',
  'reset': '（重置密码-公开接口）',
  'refresh': '（令牌刷新-公开接口）',
  'logout': '（退出登录-公开接口）',
  'public': '（公开接口）',
  'test': '（测试接口-公开接口）',
  'demo': '（示例接口-公开接口）',
  'example': '（示例接口-公开接口）',
  'stats': '（统计信息-公开接口）',
  'conversion': '（转化跟踪-公开接口）',
  'track': '（跟踪接口-公开接口）',
  'webhook': '（Webhook-公开接口）'
};

function detectPublicType(path) {
  for (const [key, annotation] of Object.entries(publicAnnotations)) {
    if (path.toLowerCase().includes(key)) {
      return annotation;
    }
  }
  return '（公开接口）';
}

function fixPublicEndpointsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let modified = false;
    let fixCount = 0;

    // 查找路由定义和对应的Swagger注释
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // 匹配路由定义
      const routeMatch = line.match(/router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/);
      if (routeMatch) {
        const method = routeMatch[1].toUpperCase();
        const path = routeMatch[2];

        // 判断是否是公开接口（基于路径模式）
        const isPublic =
          path.includes('health') ||
          path.includes('ping') ||
          path.includes('status') ||
          path.includes('version') ||
          path.includes('info') ||
          path.includes('login') ||
          path.includes('register') ||
          path.includes('forgot') ||
          path.includes('reset') ||
          path.includes('refresh') ||
          path.includes('logout') ||
          path.includes('public') ||
          path.includes('test') ||
          path.includes('demo') ||
          path.includes('example') ||
          path.includes('stats') ||
          path.includes('conversion') ||
          path.includes('track');

        if (isPublic) {
          // 向上查找Swagger注释开始位置
          let swaggerStart = -1;
          for (let j = i - 1; j >= 0; j--) {
            if (lines[j].trim().startsWith('/**')) {
              swaggerStart = j;
            } else if (swaggerStart !== -1 && !lines[j].trim().startsWith('*') && !lines[j].trim().startsWith('/**')) {
              break;
            }
          }

          if (swaggerStart !== -1) {
            // 分析Swagger注释内容
            let swaggerEnd = i;
            let summaryLine = -1;
            let securityStart = -1;
            let securityEnd = -1;
            let hasPublicAnnotation = false;

            for (let j = swaggerStart; j < swaggerEnd; j++) {
              const swaggerLine = lines[j].trim();

              // 查找summary行
              if (swaggerLine.includes('summary:')) {
                summaryLine = j;
              }

              // 查找security部分
              if (swaggerLine.startsWith('security:')) {
                securityStart = j;
                // 查找security结束位置
                for (let k = j + 1; k < swaggerEnd; k++) {
                  if (lines[k].trim().startsWith('responses:') ||
                      lines[k].trim().startsWith('parameters:') ||
                      lines[k].trim().match(/^\s*\w+\s*:/)) {
                    securityEnd = k;
                    break;
                  }
                }
                if (securityEnd === -1) securityEnd = swaggerEnd;
              }

              // 检查是否已有公开标注
              if (swaggerLine.includes('公开接口') ||
                  swaggerLine.includes('免认证') ||
                  swaggerLine.includes('Public') ||
                  swaggerLine.includes('no auth')) {
                hasPublicAnnotation = true;
              }
            }

            // 修复summary行
            if (summaryLine !== -1 && !hasPublicAnnotation) {
              const publicAnnotation = detectPublicType(path);
              const oldSummaryLine = lines[summaryLine];
              lines[summaryLine] = oldSummaryLine.replace(
                /summary:\s*['"`][^'"`]*['"`]/,
                (match) => {
                  const summary = match.match(/['"`]([^'"`]*)['"`]/)[1];
                  return `summary: '${summary}${publicAnnotation}'`;
                }
              );
              modified = true;
              fixCount++;
            }

            // 移除security部分
            if (securityStart !== -1 && securityEnd !== -1) {
              lines.splice(securityStart, securityEnd - securityStart);
              i -= (securityEnd - securityStart); // 调整索引
              modified = true;
              fixCount++;
            }

            // 检查是否有security部分需要移除（多行的情况）
            for (let j = swaggerStart; j < swaggerEnd; j++) {
              if (lines[j].trim().includes('security:')) {
                // 删除整个security块
                let k = j;
                while (k < swaggerEnd &&
                       (lines[k].trim().startsWith('security:') ||
                        lines[k].trim().startsWith('- bearerAuth:') ||
                        lines[k].trim().match(/^\s*-\s*bearerAuth\s*:\s*\[\]/))) {
                  k++;
                }
                lines.splice(j, k - j);
                i -= (k - j);
                modified = true;
                fixCount++;
                break;
              }
            }
          }
        }
      }
    }

    // 写回文件
    if (modified) {
      fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
      console.log(`✅ 修复公开接口: ${path.relative(process.cwd(), filePath)} (${fixCount}处)`);
      return { fixed: true, fixCount };
    }

    return { fixed: false, reason: 'no_fixes_needed' };
  } catch (error) {
    console.error(`❌ 错误处理文件 ${filePath}:`, error.message);
    return { fixed: false, reason: 'error', error: error.message };
  }
}

function scanAndFixPublicEndpoints(dir) {
  if (!fs.existsSync(dir)) {
    console.error(`❌ 目录不存在: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir);
  let fixedCount = 0;
  let totalFixes = 0;
  let noFixesCount = 0;
  let errorCount = 0;
  let scannedCount = 0;

  console.log('🔧 自动修复公开接口的Swagger标注...\n');

  // 优先处理重要的公开接口文件
  const priorityFiles = [
    'system.routes.ts',
    'auth.routes.ts',
    'api.routes.ts',
    'health.routes.ts'
  ];

  const otherFiles = files.filter(file =>
    file.endsWith('.routes.ts') && !priorityFiles.includes(file)
  );

  // 按优先级排序
  const sortedFiles = [
    ...priorityFiles.filter(file => files.includes(file)),
    ...otherFiles
  ];

  for (const file of sortedFiles) {
    if (file.endsWith('.routes.ts')) {
      const filePath = path.join(dir, file);
      scannedCount++;

      const result = fixPublicEndpointsInFile(filePath);

      if (result.fixed) {
        fixedCount++;
        totalFixes += result.fixCount;
      } else {
        switch (result.reason) {
          case 'no_fixes_needed':
            console.log(`ℹ️  无需修复: ${file}`);
            noFixesCount++;
            break;
          case 'error':
            console.log(`❌ 处理错误: ${file} - ${result.error}`);
            errorCount++;
            break;
          default:
            console.log(`ℹ️  无需处理: ${file}`);
        }
      }
    }
  }

  console.log(`\n📊 修复统计:`);
  console.log(`   - 扫描文件数: ${scannedCount}`);
  console.log(`   - 修复文件数: ${fixedCount}`);
  console.log(`   - 修复总数: ${totalFixes}`);
  console.log(`   - 无需修复: ${noFixesCount}`);
  console.log(`   - 处理错误: ${errorCount}`);

  if (fixedCount > 0) {
    console.log(`\n✨ 成功修复 ${fixedCount} 个文件中的 ${totalFixes} 处公开接口标注!`);
    console.log(`\n📋 修复内容:`);
    console.log(`   - 自动添加"公开接口"标注到summary中`);
    console.log(`   - 移除不必要的security部分`);
    console.log(`   - 根据接口路径智能识别接口类型`);
  } else {
    console.log(`\nℹ️  所有公开接口的标注都已经正确。`);
  }

  // 生成修复报告
  const reportPath = path.join(process.cwd(), 'public-endpoints-fix-report.md');
  const reportContent = generateFixReport(fixedCount, totalFixes, scannedCount);
  fs.writeFileSync(reportPath, reportContent, 'utf8');
  console.log(`\n📄 修复报告已生成: ${reportPath}`);
}

function generateFixReport(fixedCount, totalFixes, scannedCount) {
  return `# 公开接口修复报告

## 修复概况
- 修复时间: ${new Date().toISOString()}
- 扫描文件数: ${scannedCount}
- 修复文件数: ${fixedCount}
- 修复总数: ${totalFixes}

## 修复内容
1. **自动添加公开接口标注**
   - 在接口summary中添加类型标识
   - 例如："健康检查（公开接口）"、"版本信息（公开接口）"

2. **移除security部分**
   - 删除公开接口的security字段
   - 确保Swagger文档正确反映接口的公开特性

3. **智能识别接口类型**
   - 根据路径关键词自动识别接口类型
   - 健康检查、系统信息、认证接口等

## 接口类型映射
\`\`\`
health/ping/status → 健康检查-公开接口
version/info → 系统信息-公开接口
login/register/forgot/reset → 认证相关-公开接口
test/demo/example → 测试示例-公开接口
stats/conversion/track → 统计跟踪-公开接口
其他 → 公开接口
\`\`\`

## 注意事项
- 修复仅针对明确识别为公开的接口
- 保留了原有的业务逻辑和权限控制
- 修复后的接口将在Swagger文档中明确标注为公开接口

## 建议后续操作
1. 验证修复后的接口文档正确性
2. 确认公开接口确实不需要认证
3. 检查是否有遗漏的公开接口
4. 考虑添加接口访问日志和限制
`;
}

// 开始执行
console.log('🚀 开始自动修复公开接口的Swagger标注...\n');
console.log('🔧 修复规则:');
console.log('   - 自动识别公开接口（基于路径模式）');
console.log('   - 在summary中添加接口类型标注');
console.log('   - 移除不必要的security部分');
console.log('   - 智能识别接口类型（健康检查、系统信息等）\n');

scanAndFixPublicEndpoints(routesDir);