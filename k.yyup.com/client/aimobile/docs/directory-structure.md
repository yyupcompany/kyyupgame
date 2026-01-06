# 📁 目录结构说明

## 🏗️ 整体架构

```
aimobile/
├── components/                 # 🎨 UI组件
│   ├── MobileExpertWorkflow.vue    # 专家工作流组件
│   ├── MobileExpertChat.vue        # 专家聊天组件
│   └── SmartTaskExecutor.vue       # 智能任务执行器
├── services/                   # ⚙️ 核心服务层
│   ├── mobile-api.service.ts       # API通信服务
│   ├── mobile-storage.service.ts   # 数据存储服务
│   ├── mobile-notification.service.ts # 通知服务
│   ├── mobile-workflow-engine.service.ts # 工作流引擎
│   ├── ai-task-planner.service.ts  # AI任务规划器
│   └── tool-integration.service.ts # 工具集成服务
├── stores/                     # 📊 状态管理
│   ├── mobile-workflow.ts          # 工作流状态
│   └── mobile-agents.ts            # 专家状态
├── types/                      # 📝 类型定义
│   ├── mobile-workflow.ts          # 工作流类型
│   └── mobile-agents.ts            # 专家类型
├── config/                     # ⚙️ 配置文件
│   └── mobile-workflow.config.ts   # 工作流配置
├── router/                     # 🧭 路由系统
│   └── index.ts                    # 路由配置
├── pages/                      # 📄 页面组件
│   ├── MobileHome.vue              # 移动端首页
│   ├── ExpertWorkflow.vue          # 工作流页面
│   ├── ExpertChat.vue              # 聊天页面
│   ├── ExpertList.vue              # 专家列表
│   ├── WorkflowHistory.vue         # 历史记录
│   ├── Settings.vue                # 设置页面
│   ├── Profile.vue                 # 个人中心
│   ├── Notifications.vue           # 通知页面
│   └── Help.vue                    # 帮助中心
├── styles/                     # 🎨 样式文件
│   ├── mobile.css                  # 移动端核心样式
│   └── animations.css              # 动画样式
├── docs/                       # 📚 项目文档
│   ├── README.md                   # 项目说明
│   ├── directory-structure.md      # 目录结构
│   ├── services.md                 # 服务层文档
│   ├── components.md               # 组件文档
│   ├── mobile-features.md          # 移动端特性
│   ├── api.md                      # API文档
│   └── best-practices.md           # 最佳实践
├── main.ts                     # 🚀 应用入口
├── App.vue                     # 📱 应用容器
├── package.json                # 📦 依赖配置
├── tsconfig.json               # 🔧 TypeScript配置
├── vite.config.ts              # ⚡ Vite配置
└── index.html                  # 🌐 HTML模板
```

## 📂 详细说明

### 🎨 Components (组件层)

#### `MobileExpertWorkflow.vue`
- **功能**: 多专家协作工作流界面
- **特性**: 专家选择、任务输入、执行监控、结果展示
- **依赖**: `mobile-workflow-engine.service.ts`

#### `MobileExpertChat.vue`
- **功能**: 专家一对一聊天界面
- **特性**: 实时对话、语音输入、快速回复、历史记录
- **依赖**: `mobile-api.service.ts`

#### `SmartTaskExecutor.vue`
- **功能**: 智能任务执行器（类似Claude的多轮执行）
- **特性**: 任务理解、计划生成、执行监控、结果整合
- **依赖**: `ai-task-planner.service.ts`, `tool-integration.service.ts`

### ⚙️ Services (服务层)

#### `mobile-api.service.ts`
- **功能**: 与后端API通信
- **特性**: 
  - Smart Expert调用
  - Expert Consultation调用
  - 网络状态管理
  - 离线队列处理
  - 重试机制

#### `mobile-storage.service.ts`
- **功能**: 数据持久化管理
- **特性**:
  - 多层存储（内存、会话、本地、IndexedDB、Cache API）
  - 数据压缩和加密
  - 离线同步
  - 过期清理

#### `mobile-notification.service.ts`
- **功能**: 通知系统
- **特性**:
  - 本地通知
  - 推送通知
  - 应用内通知
  - 定时提醒
  - 权限管理

#### `mobile-workflow-engine.service.ts`
- **功能**: 工作流执行引擎
- **特性**:
  - 步骤执行
  - 状态管理
  - 错误处理
  - 性能监控

#### `ai-task-planner.service.ts`
- **功能**: AI任务规划器（核心智能）
- **特性**:
  - 任务理解和分解
  - 动态计划生成
  - 专家和工具编排
  - 上下文管理
  - 结果整合

#### `tool-integration.service.ts`
- **功能**: 工具集成服务
- **特性**:
  - 图片生成（DALL-E等）
  - 文档生成
  - 数据可视化
  - 历史记录管理

### 📊 Stores (状态管理)

#### `mobile-workflow.ts`
- **功能**: 工作流状态管理
- **状态**: 执行状态、步骤进度、结果缓存

#### `mobile-agents.ts`
- **功能**: 专家状态管理
- **状态**: 专家列表、对话历史、使用统计

### 📝 Types (类型定义)

#### `mobile-workflow.ts`
- **定义**: 工作流相关类型
- **包含**: WorkflowDefinition, WorkflowStep, WorkflowResults等

#### `mobile-agents.ts`
- **定义**: 专家系统类型
- **包含**: AgentType, ExpertConfig, 13个专家的详细配置

### ⚙️ Config (配置文件)

#### `mobile-workflow.config.ts`
- **功能**: 工作流配置
- **包含**: 模型参数、移动端优化、性能设置

### 🧭 Router (路由系统)

#### `index.ts`
- **功能**: 移动端路由配置
- **特性**: 
  - 页面转场动画
  - 手势导航
  - 深度链接
  - 路由缓存

### 📄 Pages (页面组件)

#### `MobileHome.vue`
- **功能**: 移动端首页
- **特性**: 快速操作、专家推荐、最近活动、使用统计

#### `ExpertWorkflow.vue`
- **功能**: 工作流页面
- **特性**: 工作流创建和执行

#### `ExpertChat.vue`
- **功能**: 聊天页面
- **特性**: 专家对话界面

#### 其他页面
- `ExpertList.vue` - 专家列表和详情
- `WorkflowHistory.vue` - 历史记录查看
- `Settings.vue` - 应用设置
- `Profile.vue` - 个人中心
- `Notifications.vue` - 通知管理
- `Help.vue` - 帮助文档

### 🎨 Styles (样式文件)

#### `mobile.css`
- **功能**: 移动端核心样式
- **特性**: 
  - CSS变量系统
  - 响应式设计
  - 触摸优化
  - 安全区域适配

#### `animations.css`
- **功能**: 动画样式
- **特性**:
  - 页面转场动画
  - 组件动画
  - 加载动画
  - 交互反馈动画

## 🔄 数据流

```
用户输入 → SmartTaskExecutor → AITaskPlanner → 
  ↓
专家调用 (mobile-api.service) ← → 后端专家系统
  ↓
工具调用 (tool-integration.service) ← → 外部工具API
  ↓
结果整合 → 存储 (mobile-storage.service) → 通知 (mobile-notification.service)
  ↓
UI更新 → 用户查看结果
```

## 📱 移动端特性

### PWA支持
- Service Worker注册
- 离线缓存
- 安装提示
- 更新管理

### 性能优化
- 懒加载
- 代码分割
- 图片优化
- 内存管理

### 用户体验
- 触觉反馈
- 手势导航
- 响应式设计
- 无障碍支持

## 🔧 开发工具

### 构建工具
- **Vite** - 快速构建工具
- **TypeScript** - 类型安全
- **Vue 3** - 现代前端框架

### 开发辅助
- **ESLint** - 代码规范
- **Prettier** - 代码格式化
- **Husky** - Git钩子

### 调试工具
- **Vue DevTools** - Vue调试
- **Chrome DevTools** - 移动端调试
- **性能监控** - 内置性能追踪

---

*这个目录结构设计遵循了现代前端开发的最佳实践，确保代码的可维护性、可扩展性和性能优化。*
