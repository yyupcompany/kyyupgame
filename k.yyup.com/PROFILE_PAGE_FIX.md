# Profile 页面 API 修复说明

## 问题描述

用户在访问 `http://127.0.0.1:5173/profile` 时遇到以下错误：

1. **错误 1**: `Request failed with status code 500` - `/user/profile` 返回 500
   - 原因：数据库查询试图获取不存在的 `avatar` 字段
   
2. **错误 2**: `Request failed with status code 404` - `/usage-center/my-usage` 返回 404
   - 原因：Vite 代理路径配置问题

## 修复方案

### 修复 1: 解决路由冲突 

**问题**：两个不同的文件都在处理 `/user/profile` 请求：
- `server/src/routes/user-profile.routes.ts` - 使用 ORM，有 bug
- `server/src/routes/user.routes.ts` - 使用原生 SQL，正确

**解决方案**：
- ✅ 移除了 `user-profile.routes.ts` 的路由注册
- ✅ 保留了 `user.routes.ts` 的实现（更完善）
- ✅ 添加了增强的错误日志，便于诊断

**修改文件**：`server/src/routes/index.ts`

### 修复 2: 解决 Vite 代理问题

**问题**：
- 前端发送请求到 `/api/usage-center/my-usage` (通过 axios baseURL)
- Vite 代理应该转发到后端的 `/usage-center/my-usage` (不带 `/api`)
- 但 Vite 配置中没有 rewrite 规则

**解决方案**：
- ✅ 在所有 Vite 配置文件中添加 `rewrite` 规则：
  ```javascript
  rewrite: (path) => path.replace(/^\/api/, '')
  ```

**修改文件**：
- `client/vite.config.ts`
- `client/vite.config.k-yyup.ts`
- `client/vite.config.turbo.ts`

### 修复 3: 增强日志记录

在以下控制器中添加详细的日志记录：
- `server/src/controllers/user-profile.controller.ts` - getProfile()
- `server/src/controllers/usage-center.controller.ts` - getMyUsage() 和 getUserUsageDetail()

这样便于诊断未来的问题。

## 测试步骤

1. **启动后端服务**（如果未运行）：
   ```bash
   cd server
   npm run dev
   ```

2. **启动前端服务**（如果未运行）：
   ```bash
   cd client
   npm run dev
   ```

   或直接刷新浏览器：
   ```
   http://127.0.0.1:5173/profile
   ```

3. **验证修复**：
   - 页面应该显示用户信息
   - 控制台不应该显示 404 或 500 错误
   - 应该能看到用量统计数据

## 相关 API 端点

- **GET /user/profile** - 获取当前用户信息
  - 返回：用户基本信息、角色、状态等
  
- **GET /usage-center/my-usage** - 获取用户使用统计
  - 参数：`startDate`, `endDate`
  - 返回：用量统计、按类型统计、最近使用记录等

## 后续观察

如果仍然遇到问题，检查以下几点：

1. ✅ 后端服务是否正常运行（端口 3000 或 3001）
2. ✅ 数据库连接是否正常
3. ✅ 认证 token 是否有效（JWT token）
4. ✅ 检查浏览器控制台的详细错误日志

