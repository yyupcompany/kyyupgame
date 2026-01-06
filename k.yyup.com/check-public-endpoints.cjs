const fs = require('fs');
const path = require('path');

/**
 * 检查并修复公开接口的标注
 * 识别不需要认证的公开接口，并在Swagger文档中正确标注
 */

const routesDir = path.join(__dirname, 'server/src/routes');

// 常见的公开接口模式
const publicEndpointPatterns = [
  // 健康检查
  /health|ping|status/i,
  // 系统信息
  /system.*info|version/i,
  // 公开访问的数据
  /public|公开/i,
  // 登录认证
  /login|auth|register|forgot|reset/i,
  // 基础数据查询（如果是公开的）
  /\/api\/[^\/]*$|\/kindergarten\/basic-info/i,
  // 示例和测试接口
  /example|demo|test/i
];

// 应该是公开的接口路径
const knownPublicPaths = [
  '/health',
  '/ping',
  '/status',
  '/system/health',
  '/system/info',
  '/system/version',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/refresh',
  '/auth/logout',
  '/api/kindergarten/basic-info',
  '/example',
  '/demo'
];

function checkPublicEndpointsInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    let hasGlobalAuth = /router\.use\s*\(\s*verifyToken\s*\)(?!\s*\/\/)/.test(content);
    let publicEndpoints = [];
    let missingAnnotations = [];
    let incorrectAnnotations = [];

    // 查找路由定义
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // 匹配路由定义
      const routeMatch = line.match(/router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/);
      if (routeMatch) {
        const method = routeMatch[1].toUpperCase();
        const path = routeMatch[2];
        const fullPath = path.startsWith('/') ? path : `/${path}`;

        // 检查是否是公开接口
        const isPublic = knownPublicPaths.includes(fullPath) ||
                        publicEndpointPatterns.some(pattern => pattern.test(fullPath));

        if (isPublic) {
          // 查找对应的Swagger注释
          let swaggerStart = -1;
          let swaggerEnd = -1;

          // 向上查找Swagger注释
          for (let j = i - 1; j >= 0; j--) {
            if (lines[j].trim().startsWith('/**')) {
              swaggerStart = j;
            } else if (swaggerStart !== -1 && lines[j].trim() === '') {
              swaggerEnd = j + 1;
              break;
            } else if (swaggerStart !== -1 && !lines[j].trim().startsWith('*')) {
              swaggerEnd = j + 1;
              break;
            }
          }

          if (swaggerStart === -1) {
            missingAnnotations.push({
              method,
              path: fullPath,
              line: i + 1,
              issue: 'no_swagger'
            });
          } else {
            // 检查Swagger注释中是否有security部分
            const swaggerContent = lines.slice(swaggerStart, i).join('\n');
            const hasSecurity = /security\s*:/i.test(swaggerContent);

            if (hasSecurity) {
              // 公开接口不应该有security部分
              incorrectAnnotations.push({
                method,
                path: fullPath,
                line: swaggerStart + 1,
                issue: 'has_security_when_public'
              });
            } else {
              // 检查是否有公开接口的明确标注
              const hasPublicAnnotation = /公开|public|免认证|no auth/i.test(swaggerContent);
              if (!hasPublicAnnotation) {
                missingAnnotations.push({
                  method,
                  path: fullPath,
                  line: swaggerStart + 1,
                  issue: 'missing_public_annotation'
                });
              }
            }
          }

          publicEndpoints.push({ method, path: fullPath, line: i + 1 });
        }
      }
    }

    return {
      hasGlobalAuth,
      publicEndpoints,
      missingAnnotations,
      incorrectAnnotations
    };
  } catch (error) {
    console.error(`❌ 错误处理文件 ${filePath}:`, error.message);
    return { error: error.message };
  }
}

function scanPublicEndpoints(dir) {
  if (!fs.existsSync(dir)) {
    console.error(`❌ 目录不存在: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir);
  let publicEndpointCount = 0;
  let missingAnnotationCount = 0;
  let incorrectAnnotationCount = 0;
  let filesWithPublicEndpoints = 0;
  let scannedCount = 0;

  console.log('🔍 扫描并检查公开接口的标注...\n');

  const allPublicEndpoints = [];
  const filesNeedingFix = [];

  for (const file of files) {
    if (file.endsWith('.routes.ts')) {
      const filePath = path.join(dir, file);
      scannedCount++;

      const result = checkPublicEndpointsInFile(filePath);

      if (result.error) {
        console.log(`❌ 处理错误: ${file} - ${result.error}`);
        continue;
      }

      if (result.publicEndpoints.length > 0) {
        filesWithPublicEndpoints++;
        publicEndpointCount += result.publicEndpoints.length;

        console.log(`📂 ${file}:`);
        console.log(`   - 全局认证: ${result.hasGlobalAuth ? '✅ 已启用' : '❌ 未启用'}`);
        console.log(`   - 公开接口数: ${result.publicEndpoints.length}`);

        for (const endpoint of result.publicEndpoints) {
          console.log(`     * ${endpoint.method} ${endpoint.path}`);
          allPublicEndpoints.push({
            file,
            ...endpoint
          });
        }

        if (result.missingAnnotations.length > 0) {
          missingAnnotationCount += result.missingAnnotations.length;
          console.log(`   - ⚠️  缺少公开标注: ${result.missingAnnotations.length}处`);
          filesNeedingFix.push({
            file,
            filePath,
            issues: result.missingAnnotations
          });
        }

        if (result.incorrectAnnotations.length > 0) {
          incorrectAnnotationCount += result.incorrectAnnotations.length;
          console.log(`   - ❌ 错误的认证标注: ${result.incorrectAnnotations.length}处`);
          filesNeedingFix.push({
            file,
            filePath,
            issues: result.incorrectAnnotations
          });
        }

        console.log('');
      }
    }
  }

  console.log(`📊 统计结果:`);
  console.log(`   - 扫描文件数: ${scannedCount}`);
  console.log(`   - 包含公开接口的文件: ${filesWithPublicEndpoints}`);
  console.log(`   - 公开接口总数: ${publicEndpointCount}`);
  console.log(`   - 缺少公开标注: ${missingAnnotationCount}`);
  console.log(`   - 错误的认证标注: ${incorrectAnnotationCount}`);

  if (filesNeedingFix.length > 0) {
    console.log(`\n🔧 需要修复的文件:`);
    for (const fileIssue of filesNeedingFix) {
      console.log(`   - ${fileIssue.file}:`);
      for (const issue of fileIssue.issues) {
        switch (issue.issue) {
          case 'no_swagger':
            console.log(`     * 第${issue.line}行: 缺少Swagger文档`);
            break;
          case 'missing_public_annotation':
            console.log(`     * 第${issue.line}行: 缺少公开接口标注`);
            break;
          case 'has_security_when_public':
            console.log(`     * 第${issue.line}行: 公开接口不应包含security部分`);
            break;
        }
      }
    }

    console.log(`\n💡 修复建议:`);
    console.log(`   1. 为缺少Swagger文档的公开接口添加完整的Swagger注释`);
    console.log(`   2. 在公开接口的Swagger注释中添加"公开接口"或"免认证"标注`);
    console.log(`   3. 移除公开接口Swagger注释中的security部分`);
    console.log(`   4. 对于使用全局认证的文件，考虑在公开接口前移除认证中间件`);

    // 生成修复报告
    const reportPath = path.join(process.cwd(), 'public-endpoints-report.md');
    const reportContent = generateFixReport(filesNeedingFix, allPublicEndpoints);
    fs.writeFileSync(reportPath, reportContent, 'utf8');
    console.log(`\n📄 详细修复报告已生成: ${reportPath}`);
  } else {
    console.log(`\n✅ 所有公开接口的标注都是正确的！`);
  }
}

function generateFixReport(filesNeedingFix, allPublicEndpoints) {
  const content = `# 公开接口修复报告

## 概述
- 检测时间: ${new Date().toISOString()}
- 需要修复的文件: ${filesNeedingFix.length}
- 公开接口总数: ${allPublicEndpoints.length}

## 需要修复的文件

${filesNeedingFix.map(file => `
### ${file.file}

**文件路径:** \`${file.filePath}\`

**问题列表:**
${file.issues.map(issue => {
  const issueMap = {
    'no_swagger': '缺少Swagger文档',
    'missing_public_annotation': '缺少公开接口标注',
    'has_security_when_public': '公开接口包含security部分'
  };
  return `- 第${issue.line}行: ${issueMap[issue.issue]} (${issue.method} ${issue.path})`;
}).join('\n')}
`).join('\n')}

## 所有发现的公开接口

| 文件 | 方法 | 路径 | 行号 |
|------|------|------|------|
${allPublicEndpoints.map(endpoint =>
  `| ${endpoint.file} | ${endpoint.method} | ${endpoint.path} | ${endpoint.line} |`
).join('\n')}

## 修复指南

### 1. 添加Swagger文档
对于缺少Swagger文档的接口，请添加以下格式的注释：

\`\`\`javascript
/**
 * @swagger
 *  /api/example:
 *    get:
 *      summary: 示例接口（公开接口）
 *      tags: [Public]
 *      description: 这是一个公开访问的示例接口，无需认证
 *      responses:
 *        200:
 *          description: 成功响应
 */
router.get('/example', exampleController.example);
\`\`\`

### 2. 标注公开接口
在接口的summary或description中明确标注：
- "(公开接口)"
- "(免认证)"
- "Public endpoint"
- "No authentication required"

### 3. 移除security部分
公开接口不应该包含security字段，请删除类似以下内容：

\`\`\`
security:
  - bearerAuth: []
\`\`\`

### 4. 处理全局认证
如果文件启用了全局认证 \`router.use(verifyToken);\`，对于公开接口需要：

\`\`\`javascript
// 方法1: 为公开接口单独处理
router.get('/public-endpoint', (req, res, next) => {
  // 跳过认证检查
  req.skipAuth = true;
  next();
}, publicController.handler);

// 方法2: 使用条件认证中间件
const conditionalAuth = (req, res, next) => {
  if (req.path === '/public-endpoint') {
    return next();
  }
  return verifyToken(req, res, next);
};
router.use(conditionalAuth);
\`\`\`
`;

  return content;
}

// 开始执行
console.log('🚀 开始检查公开接口的标注...\n');
console.log('📋 公开接口识别规则:');
console.log('   - 健康检查: /health, /ping, /status');
console.log('   - 系统信息: /system/info, /system/version');
console.log('   - 认证接口: /auth/login, /auth/register');
console.log('   - 基础数据: /api/kindergarten/basic-info');
console.log('   - 示例接口: /example, /demo');
console.log('   - 明确标注: "公开"、"public"、"免认证"\n');

scanPublicEndpoints(routesDir);