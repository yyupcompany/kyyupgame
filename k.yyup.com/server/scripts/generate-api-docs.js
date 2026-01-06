#!/usr/bin/env node

/**
 * API文档生成脚本
 * 从路由文件中提取API信息，生成详细的API文档
 */

const fs = require('fs');
const path = require('path');

console.log('📚 开始生成API文档...');

// 配置
const ROUTES_DIR = path.join(__dirname, '../src/routes');
const OUTPUT_FILE = path.join(__dirname, '../api-documentation.md');

// 存储API信息
const apiData = {
  categories: {},
  totalApis: 0,
  authenticated: 0,
  public: 0
};

// 颜色输出
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`
};

// 扫描路由文件
function scanRouteFiles(dir, category = 'root') {
  if (!fs.existsSync(dir)) {
    return;
  }

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanRouteFiles(fullPath, file);
    } else if (file.endsWith('.routes.ts')) {
      extractApiInfo(fullPath, category);
    }
  }
}

// 提取API信息
function extractApiInfo(filePath, category) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath, '.routes.ts');

    // 初始化分类
    if (!apiData.categories[category]) {
      apiData.categories[category] = [];
    }

    // 提取路由信息
    const routeRegex = /router\.(get|post|put|patch|delete)\s*\(\s*['"]([^'"]+)['"]\s*,?\s*([^)]*)\)/g;
    let match;

    while ((match = routeRegex.exec(content)) !== null) {
      const [, method, path, handlerStr] = match;

      const api = {
        method: method.toUpperCase(),
        path,
        category,
        file: fileName,
        handler: handlerStr.trim() || 'anonymous',
        description: extractDescription(content, method, path),
        parameters: extractParameters(content, method, path),
        responses: extractResponses(content, method, path),
        requiresAuth: checkAuthentication(content),
        permissions: extractPermissions(content, method, path)
      };

      apiData.categories[category].push(api);
      apiData.totalApis++;

      if (api.requiresAuth) {
        apiData.authenticated++;
      } else {
        apiData.public++;
      }
    }
  } catch (error) {
    console.log(colors.red(`提取API信息失败 ${filePath}: ${error.message}`));
  }
}

// 提取API描述
function extractDescription(content, method, path) {
  // 尝试从Swagger注释中提取描述
  const swaggerRegex = new RegExp(`/\\*\\*[\\s\\S]*?@swagger[\\s\\S]*?${method}\\s*${path}[\\s\\S]*?\\*\\/`, 'i');
  const swaggerMatch = content.match(swaggerRegex);

  if (swaggerMatch) {
    const descMatch = swaggerMatch[0].match(/description['"]?\s*:\s*['"]([^'"]+)['"]/i);
    if (descMatch) {
      return descMatch[1];
    }
  }

  // 从注释中提取简单描述
  const commentRegex = new RegExp(`//\\s*${method}\\s*${path}\\s*[-\\s]*([^\n]+)`, 'i');
  const commentMatch = content.match(commentRegex);

  return commentMatch ? commentMatch[1].trim() : `${method} ${path}`;
}

// 提取参数信息
function extractParameters(content, method, path) {
  const swaggerRegex = new RegExp(`/\\*\\*[\\s\\S]*?@swagger[\\s\\S]*?${method}\\s*${path}[\\s\\S]*?\\*\\/`, 'i');
  const swaggerMatch = content.match(swaggerRegex);

  if (swaggerMatch) {
    const params = [];
    // 简化的参数提取
    const paramMatches = swaggerMatch[0].matchAll(/@param\s*{([^}]+)}\s*(\w+)\s*-\s*([^\n]+)/g);

    for (const match of paramMatches) {
      params.push({
        type: match[1],
        name: match[2],
        description: match[3].trim()
      });
    }

    return params;
  }

  return [];
}

// 提取响应信息
function extractResponses(content, method, path) {
  const swaggerRegex = new RegExp(`/\\*\\*[\\s\\S]*?@swagger[\\s\\S]*?${method}\\s*${path}[\\s\\S]*?\\*\\/`, 'i');
  const swaggerMatch = content.match(swaggerRegex);

  if (swaggerMatch) {
    const responses = {};
    // 简化的响应提取
    const responseMatches = swaggerMatch[0].matchAll(/@returns\s*{([^}]+)}\s*(\d+)\s*-\s*([^\n]+)/g);

    for (const match of responseMatches) {
      responses[match[2]] = {
        type: match[1],
        description: match[3].trim()
      };
    }

    return responses;
  }

  return {
    '200': { type: 'object', description: '成功响应' },
    '400': { type: 'object', description: '请求参数错误' },
    '401': { type: 'object', description: '未授权访问' },
    '500': { type: 'object', description: '服务器内部错误' }
  };
}

// 检查是否需要认证
function checkAuthentication(content) {
  // 检查是否有认证中间件
  const authPatterns = [
    'authenticateToken',
    'requireAuth',
    'jwtAuth',
    'authMiddleware',
    'checkAuth',
    'verifyToken'
  ];

  return authPatterns.some(pattern => content.includes(pattern));
}

// 提取权限信息
function extractPermissions(content, method, path) {
  const permissionPatterns = [
    /checkPermission\(['"]([^'"]+)['"]\)/g,
    /requirePermission\(['"]([^'"]+)['"]\)/g,
    /hasPermission\(['"]([^'"]+)['"]\)/g
  ];

  const permissions = [];

  for (const pattern of permissionPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      permissions.push(match[1]);
    }
  }

  return permissions;
}

// 生成Markdown文档
function generateDocumentation() {
  const authRate = apiData.totalApis > 0 ? ((apiData.authenticated / apiData.totalApis) * 100).toFixed(1) : 0;

  const doc = `# API接口文档

## 📋 概览

- **总API数量**: ${apiData.totalApis}
- **需要认证**: ${apiData.authenticated} (${authRate}%)
- **公开接口**: ${apiData.public}
- **分类数量**: ${Object.keys(apiData.categories).length}

## 🔐 认证说明

大部分API接口需要在请求头中包含JWT Token：

\`\`\`http
Authorization: Bearer <your-jwt-token>
\`\`\`

## 📂 接口分类

${Object.entries(apiData.categories).map(([category, apis]) => `
### ${category}

${apis.map(api => `
#### ${api.method} ${api.path}

**文件**: \`${api.file}.routes.ts\`

**描述**: ${api.description}

**认证**: ${api.requiresAuth ? '✅ 需要' : '❌ 不需要'}

${api.permissions.length > 0 ? `**权限**: ${api.permissions.join(', ')}` : ''}

**参数**:
${api.parameters.length > 0 ? api.parameters.map(param =>
  `- \`${param.name}\` (${param.type}): ${param.description}`
).join('\n') : '- 无参数'}

**响应**:
${Object.entries(api.responses).map(([code, response]) =>
  `- \`${code}\`: ${response.description} (${response.type})`
).join('\n')}

---
`).join('\n')}
`).join('\n')}

## 📊 统计信息

| 分类 | API数量 | 认证比例 |
|------|---------|----------|
${Object.entries(apiData.categories).map(([category, apis]) => {
  const authCount = apis.filter(api => api.requiresAuth).length;
  const authRate = ((authCount / apis.length) * 100).toFixed(1);
  return `| ${category} | ${apis.length} | ${authRate}% |`;
}).join('\n')}

## 🔧 开发指南

### 1. 添加新API

1. 在对应的路由文件中添加新的路由定义
2. 添加Swagger注释文档
3. 实现认证和权限检查（如需要）
4. 编写相应的控制器和服务

### 2. API版本控制

- 当前API版本: v1
- 版本控制通过URL路径实现 (如: \`/api/v1/users\`)
- 向后兼容性保证

### 3. 错误处理

所有API响应都遵循统一格式：

\`\`\`json
{
  "success": true,
  "data": {},
  "message": "操作成功",
  "code": 0
}
\`\`\`

### 4. 分页

列表接口支持分页参数：

- \`page\`: 页码 (从1开始)
- \`limit\`: 每页数量 (默认20，最大100)

响应格式：
\`\`\`json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
\`\`\`

## 🧪 测试

可以使用以下工具测试API：

1. **Swagger UI**: http://localhost:3000/api-docs
2. **Postman**: 导入API文档集合
3. **curl**: 命令行测试

### curl示例

\`\`\`bash
# 获取用户列表
curl -H "Authorization: Bearer YOUR_TOKEN" \\
     http://localhost:3000/api/users

# 创建用户
curl -X POST \\
     -H "Content-Type: application/json" \\
     -H "Authorization: Bearer YOUR_TOKEN" \\
     -d '{"name":"张三","email":"zhangsan@example.com"}' \\
     http://localhost:3000/api/users
\`\`\`

---

*文档生成时间: ${new Date().toLocaleString('zh-CN')}*
*脚本版本: 1.0.0*
`;

  return doc;
}

// 主执行函数
function main() {
  console.log(colors.blue('🔍 扫描路由文件...'));

  // 扫描所有路由文件
  scanRouteFiles(ROUTES_DIR);

  console.log(colors.blue('📝 生成API文档...'));

  // 生成文档
  const documentation = generateDocumentation();

  // 保存文档
  try {
    fs.writeFileSync(OUTPUT_FILE, documentation, 'utf8');
    console.log(colors.green(`✅ 文档已保存: ${OUTPUT_FILE}`));

    // 显示摘要
    console.log(colors.cyan('\n📊 文档摘要:'));
    console.log(`- 总API数量: ${apiData.totalApis}`);
    console.log(`- 分类数量: ${Object.keys(apiData.categories).length}`);
    console.log(`- 需要认证: ${apiData.authenticated}`);
    console.log(`- 公开接口: ${apiData.public}`);
  } catch (error) {
    console.log(colors.red(`❌ 保存文档失败: ${error.message}`));
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = { main, apiData };