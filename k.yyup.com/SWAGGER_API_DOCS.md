# 📚 Swagger API 文档服务

## 概述

已为后端 API 集成了完整的 Swagger/OpenAPI 文档服务，提供交互式 API 测试界面。

## 🚀 快速开始

### 1. 启动后端服务器

```bash
cd server
npm run build
npm start
```

### 2. 访问 Swagger 文档

在浏览器中打开以下任一地址：

- **🎯 交互式界面**: http://localhost:3000/api/docs
- **JSON 规范**: http://localhost:3000/api/docs.json
- **YAML 规范**: http://localhost:3000/api/docs.yaml

## 📖 功能特性

### ✨ 交互式 API 文档
- 查看所有 API 端点和描述
- 查看请求和响应示例
- 查看参数和数据模型定义

### 🧪 直接测试 API
在 Swagger UI 中直接测试 API，无需使用 Postman 或其他工具：

1. 找到要测试的 API 端点
2. 点击 "Try it out" 按钮
3. 填入必要的参数
4. 点击 "Execute" 发送请求
5. 查看响应结果

### 🔐 认证支持
- 支持 JWT Bearer Token 认证
- 在 Swagger UI 右上角点击 "Authorize" 按钮
- 输入 JWT token：`Bearer <your_token_here>`

### 📥 下载规范
- 下载 OpenAPI JSON 规范
- 下载 OpenAPI YAML 规范
- 导入到其他工具（如 Postman、Insomnia）

## 📁 API 端点示例

所有模块的 API 都已自动文档化：

### 🤖 AI 模块
```
GET  /api/ai-analysis
POST /api/ai-billing
GET  /api/ai-conversation
... (更多端点)
```

### 🔐 认证和权限
```
POST /api/auth/login
GET  /api/auth/logout
GET  /api/permissions
POST /api/roles
... (更多端点)
```

### 👤 用户管理
```
GET    /api/users
POST   /api/users
GET    /api/users/{id}
PUT    /api/users/{id}
DELETE /api/users/{id}
... (更多端点)
```

### 📚 招生管理
```
GET    /api/enrollment
POST   /api/enrollment
GET    /api/enrollment-plans
POST   /api/enrollment-applications
... (更多端点)
```

### 🎯 活动管理
```
GET    /api/activities
POST   /api/activities
GET    /api/activity-plans
POST   /api/activity-registrations
... (更多端点)
```

### ... 以及所有其他模块的 API

## 🔧 测试工作流程

### 步骤 1: 获取认证 Token

1. 找到 `/api/auth/login` 或相应的登录端点
2. 在 "Try it out" 中输入用户名和密码
3. 执行请求
4. 从响应中复制 JWT token

### 步骤 2: 设置认证

1. 点击 Swagger UI 右上角的 "Authorize" 按钮
2. 输入：`Bearer <copied_token>`
3. 点击 "Authorize"
4. 关闭对话框

### 步骤 3: 测试 API

现在所有需要认证的 API 都会自动使用该 token：

1. 选择任意 API 端点
2. 点击 "Try it out"
3. 填入必要参数
4. 点击 "Execute"
5. 查看响应

## 📊 支持的 HTTP 方法

- ✅ GET - 获取资源
- ✅ POST - 创建资源
- ✅ PUT - 更新资源
- ✅ DELETE - 删除资源
- ✅ PATCH - 部分更新

## 🔍 故障排查

### 问题: 访问 /api/docs 显示 404

**解决方案**:
- 确保后端服务器正在运行（`npm start`）
- 检查是否在正确的端口（默认 3000）
- 检查控制台是否有错误信息

### 问题: API 返回 401 Unauthorized

**解决方案**:
- 检查是否正确设置了 JWT token
- 验证 token 是否已过期
- 尝试重新登录获取新 token

### 问题: 参数验证失败

**解决方案**:
- 检查参数类型是否正确
- 查看 API 文档中的示例值
- 验证必填字段是否已填入

### 问题: 跨域 (CORS) 错误

**解决方案**:
- CORS 已在后端配置
- 如果错误仍然出现，检查浏览器控制台
- 可能需要在浏览器中禁用 CORS 检查（仅用于开发）

## 🎓 最佳实践

### 1. 使用环境变量
```javascript
// 在测试前设置正确的基础 URL
const API_BASE = process.env.API_URL || 'http://localhost:3000';
```

### 2. 保存请求
使用 Swagger UI 的 "Save" 功能保存常用的请求

### 3. 检查响应
始终检查响应的 HTTP 状态码和错误消息

### 4. 测试错误情况
不仅测试成功的请求，也测试各种错误情况

## 📈 API 统计

目前支持 **230+** 个 API 端点，分布在以下模块中：

| 模块 | 端点数 | 说明 |
|------|-------|------|
| AI | 15+ | AI 相关功能 |
| Auth | 8 | 认证和权限 |
| Users | 12+ | 用户管理 |
| Enrollment | 13+ | 招生管理 |
| Activity | 11+ | 活动管理 |
| Teaching | 8+ | 教学管理 |
| Business | 13+ | 业务管理 |
| System | 15+ | 系统管理 |
| Marketing | 7+ | 营销管理 |
| Content | 16+ | 内容管理 |
| Other | 50+ | 杂项功能 |

## 🔄 更新 API 文档

当添加或修改 API 端点时：

1. 在路由文件中添加 JSDoc 注释（使用 `@swagger` 标签）
2. 重新启动后端服务器
3. 刷新 Swagger UI 界面
4. 新的 API 会自动出现在文档中

### 示例：添加新 API 文档

```typescript
/**
 * @swagger
 * /api/new-endpoint:
 *   get:
 *     tags: [MyModule]
 *     summary: 获取新数据
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
```

## 💡 高级用法

### 导出为 Postman Collection

1. 访问 http://localhost:3000/api/docs.json
2. 复制全部内容
3. 在 Postman 中：Import → Paste Raw Text
4. 即可导入所有 API

### 使用 ReDoc 查看

如果你想使用 ReDoc（另一个 OpenAPI 文档工具）：

```html
<!-- 在浏览器中打开 -->
<!DOCTYPE html>
<html>
  <head>
    <title>API Docs</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
    <style>
      body {
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <redoc spec-url='http://localhost:3000/api/docs.json'></redoc>
    <script src="https://cdn.jsdelivr.net/npm/redoc@latest/bundles/redoc.standalone.js"> </script>
  </body>
</html>
```

## 🚀 生产部署

在生产环境中：

1. 确保 Swagger 文档仅在需要时启用
2. 可以通过环境变量控制是否启用文档
3. 使用环保护（API 密钥、IP 限制等）

```typescript
// 在 swagger.middleware.ts 中
if (process.env.ENABLE_SWAGGER !== 'false') {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));
}
```

## 📞 获取帮助

- 查看 OpenAPI 3.0 规范：https://spec.openapis.org/oas/v3.0.3
- Swagger 官方文档：https://swagger.io/docs/
- 问题或建议：请在项目中提交 Issue

---

**当前版本**: 1.0  
**最后更新**: 2024-11-23  
**状态**: ✅ 完全集成并测试

