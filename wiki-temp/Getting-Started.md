# 快速开始

## 🚀 环境要求

- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0
- **MySQL**: >= 8.0
- **操作系统**: Linux, macOS, Windows
- **内存**: 建议 >= 8GB

## 📦 安装步骤

### 1. 克隆项目
```bash
git clone https://github.com/your-repo.git
cd kyyupgame
```

### 2. 安装依赖
```bash
# 安装所有依赖
npm run install:all

# 或者分别安装
cd client && npm install
cd server && npm install
```

### 3. 数据库设置
```bash
# 配置数据库连接
cp server/.env.example server/.env

# 编辑数据库配置
nano server/.env
```

### 4. 初始化数据库
```bash
# 完整初始化
npm run seed-data:complete

# 检查数据库状态
npm run db:migrate
```

### 5. 启动服务
```bash
# 并发启动前后端（推荐）
npm run start:all

# 或者分别启动
npm run start:frontend  # 前端服务 (端口 5173)
npm run start:backend   # 后端服务 (端口 3000)
```

## 🌐 访问地址

- **前端应用**: http://localhost:5173
- **API 文档**: http://localhost:3000/api-docs
- **API 接口**: http://localhost:3000/api

## 🔧 开发工具

### 代码检查
```bash
npm run lint          # 代码风格检查
npm run typecheck     # TypeScript 类型检查
npm run validate      # 完整验证
```

### 测试
```bash
npm test              # 运行所有测试
npm run test:unit     # 单元测试
npm run test:e2e      # E2E 测试
npm run test:coverage # 测试覆盖率
```

### 构建
```bash
npm run build         # 生产构建
npm run clean         # 清理构建文件
```

## 🆘 常见问题

### 端口占用
```bash
# 检查端口占用
lsof -i :3000
lsof -i :5173

# 清理端口
npm run clean
```

### 数据库连接失败
```bash
# 检查数据库服务
systemctl status mysql

# 重新连接
cd server && npm run db:migrate
```

### 依赖安装失败
```bash
# 清理并重新安装
npm run clean:all
npm run install:all
```

---
*更多问题请查看 [Development Guide](Development-Guide.md)*
