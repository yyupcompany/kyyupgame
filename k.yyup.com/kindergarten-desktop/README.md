# 幼儿园管理系统桌面版

基于Electron + Vue 3 + Node.js的现代化幼儿园综合管理平台桌面应用。

## 🚀 项目特性

- **桌面应用**: 基于Electron，支持Windows/Linux/macOS跨平台部署
- **现代前端**: Vue 3 + Composition API + Element Plus + Vite
- **强大后端**: Node.js + Express + SQLite数据库
- **安全认证**: JWT令牌认证 + bcrypt密码加密
- **丰富功能**: 学生管理、班级管理、考勤统计、活动管理等
- **美观界面**: 响应式设计，支持自定义主题
- **本地数据**: SQLite数据库，数据完全本地化

## 📋 系统要求

- **Node.js**: >= 18.0.0
- **操作系统**: Windows 10+, Linux (Ubuntu 18.04+), macOS 10.14+
- **内存**: 建议 >= 4GB
- **存储空间**: >= 500MB

## 🛠️ 安装步骤

### 1. 克隆项目
```bash
git clone [项目地址]
cd kindergarten-desktop
```

### 2. 安装依赖
```bash
npm install
```

### 3. 开发模式启动
```bash
npm run dev
```

这将同时启动：
- Vite开发服务器 (前端热重载)
- Electron主进程 (桌面应用窗口)

## 🎯 使用指南

### 默认登录信息
- **用户名**: admin
- **密码**: 123456

### 主要功能模块

#### 1. 仪表板
- 系统概览和统计信息
- 快速操作入口
- 最新动态展示

#### 2. 学生管理
- 学生信息录入
- 班级分配
- 学籍管理

#### 3. 班级管理
- 班级创建和配置
- 教师分配
- 课程安排

#### 4. 考勤管理
- 每日考勤记录
- 考勤统计报表
- 请假审批

#### 5. 活动管理
- 活动创建和发布
- 报名管理
- 活动总结

#### 6. 系统设置
- 用户权限管理
- 系统参数配置
- 数据备份恢复

## 🔧 开发命令

### 开发相关
```bash
npm run dev          # 启动开发模式
npm run dev:renderer # 仅启动前端开发服务器
npm run dev:main     # 仅启动Electron主进程
```

### 构建相关
```bash
npm run build        # 构建前端和主进程
npm run build:renderer # 构建前端代码
npm run build:main   # 构建主进程代码
```

### 打包分发
```bash
npm run dist         # 构建并打包（当前平台）
npm run dist:win     # 打包Windows版本
npm run dist:linux   # 打包Linux版本
npm run start        # 启动打包后的应用
```

### 代码质量
```bash
npm run test         # 运行测试
npm run lint         # 代码检查
npm run typecheck    # TypeScript类型检查
```

## 📁 项目结构

```
kindergarten-desktop/
├── src/
│   ├── main/                 # Electron主进程
│   │   ├── index.js         # 主进程入口
│   │   ├── database.js      # SQLite数据库管理
│   │   └── server.js        # 嵌入式Express服务器
│   ├── preload/             # 预加载脚本
│   │   └── index.js         # 安全IPC桥梁
│   └── renderer/            # 渲染进程（Vue应用）
│       ├── main.js          # Vue应用入口
│       ├── App.vue          # 根组件
│       ├── pages/           # 页面组件
│       ├── components/      # 通用组件
│       ├── stores/          # Pinia状态管理
│       ├── router/          # Vue Router路由
│       ├── api/             # API调用封装
│       └── utils/           # 工具函数
├── public/                  # 静态资源
├── data/                    # 数据存储目录
├── release/                 # 打包输出目录
├── dist/                    # 构建输出目录
├── package.json            # 项目配置
├── vite.config.js          # Vite配置
├── tsconfig.json           # TypeScript配置
└── README.md               # 项目说明
```

## 🔒 安全特性

- **进程隔离**: Electron上下文隔离，防止恶意代码
- **安全IPC**: 通过预加载脚本提供安全的API接口
- **数据加密**: 用户密码使用bcrypt加密存储
- **令牌认证**: JWT令牌验证用户身份
- **输入验证**: 前后端双重数据验证

## 💾 数据管理

### SQLite数据库
- 自动创建数据库和表结构
- 支持数据备份和恢复
- 数据完整性保证

### 数据备份
```bash
# 应用内备份：系统设置 -> 数据备份
# 手动备份：复制 data/database.db 文件
```

## 🎨 界面特性

- **自定义标题栏**: Electron原生窗口集成
- **响应式布局**: 适配不同屏幕尺寸
- **主题支持**: 明暗主题切换
- **通知系统**: 系统通知提醒
- **快捷键**: 常用操作快捷键支持

## 🔄 更新升级

### 自动更新
- 支持应用内检查更新
- 增量更新减少下载量
- 回滚机制保证稳定性

### 手动更新
```bash
# 下载最新版本
npm install

# 重新构建
npm run build

# 打包新版本
npm run dist
```

## 🐛 故障排除

### 常见问题

**1. 应用启动失败**
```bash
# 检查Node.js版本
node --version  # 需要 >= 18.0.0

# 清理并重新安装依赖
npm run clean
npm install
```

**2. 数据库连接问题**
```bash
# 检查数据目录权限
ls -la data/

# 重新初始化数据库
rm data/database.db
npm run dev
```

**3. 端口冲突**
```bash
# 查找占用端口的进程
lsof -i :3000

# 终止进程
kill -9 [PID]
```

**4. 打包失败**
```bash
# 清理构建缓存
npm run clean
npm run build
```

### 日志查看
- **主进程日志**: 开发者工具 -> Console
- **渲染进程日志**: 应用内日志查看器
- **系统日志**: `logs/app.log`

## 📞 技术支持

- **文档**: [项目文档链接]
- **问题反馈**: [GitHub Issues链接]
- **技术交流**: [技术讨论群链接]

## 📄 许可证

本项目采用 ISC 许可证，详见 [LICENSE](LICENSE) 文件。

## 🤝 贡献指南

欢迎提交Pull Request和Issue！

1. Fork本项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

---

**开发团队**: Kindergarten Team
**最后更新**: 2025年11月
**版本**: v1.0.0