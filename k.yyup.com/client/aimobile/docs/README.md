# 📱 移动端AI专家工作流系统

## 🎯 项目概述

移动端AI专家工作流系统是一个专门为幼儿园设计的智能助手应用，支持复杂任务的自动分解、多专家协作、工具集成和结果整合。系统具备类似Claude的多轮任务执行能力，能够智能规划和执行复杂的业务流程。

## ✨ 核心特性

### 🧠 智能任务规划
- **自然语言任务理解** - 支持复杂任务描述的自动解析
- **动态执行计划生成** - 根据任务需求智能生成执行步骤
- **依赖关系管理** - 自动处理步骤间的依赖和执行顺序
- **上下文保持** - 在整个执行过程中维护任务上下文

### 👥 多专家协作系统
- **13个专业AI专家** - 覆盖幼儿园运营的各个方面
- **Smart Expert系统** (7个) - 活动策划、招生营销、教育评估、成本分析、风险评估、创意设计、课程教学
- **Expert Consultation系统** (6个) - 招生策划、心理学、投资分析、园长管理、执行教师、家长体验
- **智能专家调度** - 根据任务需求自动选择和调度专家

### 🛠️ 工具集成能力
- **图片生成** - 支持活动海报、宣传材料等图片创作
- **文档生成** - 自动生成报告、方案、计划等文档
- **数据可视化** - 生成图表和数据分析结果
- **历史数据分析** - 基于历史数据的智能分析和预测

### 📱 移动端优化
- **PWA支持** - 可安装到主屏幕，支持离线使用
- **触觉反馈** - 丰富的触觉交互体验
- **手势导航** - 支持滑动返回等移动端手势
- **性能优化** - 电池管理、内存优化、网络优化
- **响应式设计** - 适配各种移动设备屏幕

## 🏗️ 系统架构

```
aimobile/
├── components/          # UI组件
├── services/           # 核心服务层
├── stores/             # 状态管理
├── types/              # 类型定义
├── config/             # 配置文件
├── router/             # 路由系统
├── pages/              # 页面组件
├── styles/             # 样式文件
└── docs/               # 项目文档
```

## 🚀 快速开始

### 环境要求
- Node.js 16+
- Vue 3
- TypeScript
- Vite

### 安装依赖
```bash
cd lazy-ai-substitute-project/client/aimobile
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

## 📚 使用示例

### 复杂任务执行示例
```typescript
// 用户输入复杂任务
const taskDescription = `
创建2025年9月开学活动策划：
- 30人参会
- 预算1000元
- 需要活动主题、海报、流程、预算分析
`

// AI自动生成执行计划并执行
const plan = await aiTaskPlannerService.generatePlan(taskDescription)
const result = await aiTaskPlannerService.executePlan(plan.id)

// 获得完整结果
console.log(result.artifacts) // 包含文档、图片、数据等
```

### 专家咨询示例
```typescript
// 与课程教学专家对话
const response = await mobileAPIService.callSmartExpert({
  expert_id: 'curriculum_expert',
  task: '为3-4岁儿童设计音乐课程',
  context: '新老师教学指导'
})
```

## 🔧 配置说明

### 专家配置
专家配置位于 `config/mobile-workflow.config.ts`，可以调整：
- 模型参数（temperature、maxTokens等）
- 移动端优化选项
- 超时设置

### 存储配置
支持多种存储方式：
- 内存存储（临时数据）
- 会话存储（页面级数据）
- 本地存储（持久化数据）
- IndexedDB（大量数据）
- Cache API（离线缓存）

## 📖 详细文档

- [📁 目录结构说明](./directory-structure.md)
- [🔧 服务层文档](./services.md)
- [🎨 组件文档](./components.md)
- [📱 移动端特性](./mobile-features.md)
- [🔌 API接口文档](./api.md)
- [🎯 最佳实践](./best-practices.md)

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系我们

- 项目地址: [GitHub Repository](https://github.com/your-repo)
- 问题反馈: [Issues](https://github.com/your-repo/issues)
- 邮箱: support@example.com

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和用户！

---

*最后更新: 2025-01-10*
