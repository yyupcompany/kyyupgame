# Mock测试服务器使用指南

## 📋 概述

基于完整的Swagger API文档，我们创建了两个版本的Mock测试服务器，用于前端开发和测试：

- **基础版Mock服务器**: 简单的CRUD操作模拟
- **高级版Mock服务器**: 智能数据生成和复杂查询支持

## 🚀 快速开始

### 1. 确保API文档是最新的
```bash
npm run docs:generate
```

### 2. 启动Mock服务器

#### 启动高级版（推荐）
```bash
npm run mock:start
# 或
npm run mock:advanced
```

#### 启动基础版
```bash
npm run mock:basic
```

#### 开发模式（详细日志）
```bash
npm run mock:dev
```

### 3. 访问Mock服务器
- **服务首页**: http://localhost:3001
- **健康检查**: http://localhost:3001/health
- **Mock数据概览**: http://localhost:3001/mock-data
- **API文档**: http://localhost:3000/api-docs

## 📊 功能特性

### 基础版Mock服务器 (mock-server.js)

**特点**:
- 简单的CRUD操作
- 预定义的示例数据
- 基本的分页和查询
- 轻量级，启动快速

**适用场景**:
- 快速原型开发
- 简单的API测试
- 前端界面调试

### 高级版Mock服务器 (advanced-mock-server.js)

**特点**:
- 🧠 **智能数据生成**: 基于Swagger Schema自动生成符合规范的数据
- 🔍 **高级查询**: 支持搜索、过滤、排序、分页
- 📊 **数据关系**: 维护数据之间的关联关系
- 🎯 **中文数据**: 生成符合中国用户习惯的姓名、地址、电话等

**适用场景**:
- 复杂业务逻辑测试
- 前后端集成测试
- 性能测试数据准备
- 演示和培训

## 🔧 配置选项

### 命令行参数

```bash
node scripts/start-mock-server.js [选项]

选项:
  --basic              启动基础版mock服务器
  --advanced           启动高级版mock服务器 (默认)
  --port=<端口>        指定端口号 (默认: 3001)
  --verbose, -v        显示详细日志
  --help, -h           显示帮助信息
```

### 环境变量

```bash
MOCK_PORT=3002 npm run mock:start  # 指定端口
NODE_ENV=development               # 开发模式
```

## 📡 API端点示例

### 认证相关
```bash
# 登录
POST http://localhost:3001/api/auth/login
{
  "username": "admin",
  "password": "123456"
}

# 登出
POST http://localhost:3001/api/auth/logout
```

### 用户管理
```bash
# 获取用户列表
GET http://localhost:3001/api/users?page=1&pageSize=10&search=张

# 获取用户详情
GET http://localhost:3001/api/users/1

# 创建用户
POST http://localhost:3001/api/users
{
  "username": "newuser",
  "email": "newuser@example.com",
  "name": "新用户",
  "role": "teacher"
}

# 更新用户
PUT http://localhost:3001/api/users/1
{
  "name": "更新的姓名",
  "email": "updated@example.com"
}

# 删除用户
DELETE http://localhost:3001/api/users/1
```

### 学生管理
```bash
# 获取学生列表（支持高级查询）
GET http://localhost:3001/api/students?classId=1&gender=male&sortBy=name&sortOrder=asc

# 创建学生
POST http://localhost:3001/api/students
{
  "name": "小明",
  "studentId": "S001",
  "birthDate": "2019-05-15",
  "gender": "male",
  "classId": 1
}
```

## 🎯 高级功能

### 智能数据生成

高级版Mock服务器会根据字段名和Schema类型智能生成数据：

- **姓名字段**: 自动生成中文姓名
- **邮箱字段**: 生成格式正确的邮箱地址
- **电话字段**: 生成中国手机号格式
- **地址字段**: 生成中国地址格式
- **日期字段**: 生成合理的日期范围
- **枚举字段**: 从定义的选项中随机选择

### 高级查询支持

```bash
# 搜索查询
GET /api/students?search=小明

# 字段过滤
GET /api/students?classId=1&status=active

# 排序
GET /api/students?sortBy=name&sortOrder=desc

# 分页
GET /api/students?page=2&pageSize=20

# 组合查询
GET /api/students?search=小&classId=1&sortBy=birthDate&sortOrder=asc&page=1&pageSize=10
```

### 数据持久化

Mock服务器在运行期间会保持数据状态：
- 创建的数据会保存在内存中
- 更新和删除操作会实时反映
- 重启服务器后数据会重置

## 🔍 调试和监控

### 健康检查
```bash
GET http://localhost:3001/health
```

返回服务器状态和统计信息：
```json
{
  "status": "up",
  "service": "advanced-mock-server",
  "port": 3001,
  "timestamp": "2024-12-12T10:30:00.000Z",
  "apiCount": 715,
  "dataStats": {
    "users": 10,
    "students": 20,
    "teachers": 8
  }
}
```

### 数据概览
```bash
GET http://localhost:3001/mock-data
```

查看当前Mock数据的统计信息和示例。

## 🛠️ 开发和扩展

### 添加自定义数据

编辑对应的Mock服务器文件，在 `mockDatabase` 或 `mockData` 中添加自定义数据。

### 添加特殊路由

在服务器文件中添加特殊的路由处理逻辑，例如复杂的业务逻辑模拟。

### 数据生成规则

修改 `MockDataGenerator` 类来自定义数据生成规则。

## 📝 注意事项

1. **数据重置**: 重启服务器后所有数据会重置为初始状态
2. **端口冲突**: 如果默认端口被占用，系统会自动寻找可用端口
3. **性能考虑**: 大量数据时建议使用分页查询
4. **CORS支持**: 已启用CORS，支持跨域请求

## 🤝 与真实API的切换

在前端代码中，可以通过环境变量轻松切换：

```javascript
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3001/api'  // Mock服务器
  : 'http://localhost:3000/api'; // 真实API服务器
```

## 📞 支持

如果遇到问题或需要添加新功能，请：
1. 检查swagger文档是否最新
2. 查看服务器日志输出
3. 使用 `--verbose` 参数获取详细信息

---

*Mock服务器基于最新的API文档自动生成，确保与真实API保持同步。*
