# 视频制作功能文档索引

## 📚 文档列表

### 1. [技术文档](./VIDEO_CREATION_TECHNICAL_DOCUMENTATION.md)
**完整的技术实现文档**

包含内容：
- ✅ 功能概述和业务流程
- ✅ 技术架构（前端+后端）
- ✅ 前端实现详解（响应式变量、核心方法、条件渲染）
- ✅ 后端实现详解（数据模型、控制器方法）
- ✅ 数据流转图
- ✅ API接口文档（10个核心接口）
- ✅ 数据库设计（表结构、JSON字段）
- ✅ 已知问题汇总
- ✅ 故障排查指南

**适用人群**：开发人员、架构师

---

### 2. [问题追踪](./VIDEO_CREATION_ISSUES_TRACKING.md)
**详细的问题追踪和修复记录**

包含内容：
- ✅ 问题总览表格（6个问题）
- ✅ 每个问题的详细分析
- ✅ 根本原因和技术分析
- ✅ 修复方案（带完整代码）
- ✅ 测试步骤
- ✅ 调试指南
- ✅ 待办事项清单

**适用人群**：开发人员、测试人员、运维人员

---

### 3. [测试指南](./VIDEO_CREATION_TIMELINE_TEST_GUIDE.md)
**完整的测试流程和检查清单**

包含内容：
- ✅ 7步完整流程测试
- ✅ 项目恢复测试（3个场景）
- ✅ 重新生成功能测试（3个场景）
- ✅ 已知问题和解决方案
- ✅ 测试检查清单
- ✅ 测试记录表格

**适用人群**：测试人员、QA

---

### 4. [快速参考](./VIDEO_CREATION_QUICK_REFERENCE.md)
**功能快速查询手册**

包含内容：
- ✅ 7步流程概览
- ✅ 每个步骤的输入输出
- ✅ 数据流转图
- ✅ 关键字段说明
- ✅ 常见问题FAQ
- ✅ 技术支持指南

**适用人群**：所有用户

---

## 🎯 快速导航

### 我想了解...

#### 功能如何使用？
→ 查看 [快速参考](./VIDEO_CREATION_QUICK_REFERENCE.md)

#### 技术如何实现？
→ 查看 [技术文档](./VIDEO_CREATION_TECHNICAL_DOCUMENTATION.md)

#### 如何测试功能？
→ 查看 [测试指南](./VIDEO_CREATION_TIMELINE_TEST_GUIDE.md)

#### 遇到问题怎么办？
→ 查看 [问题追踪](./VIDEO_CREATION_ISSUES_TRACKING.md)

---

## 🐛 当前已知问题

| 问题 | 状态 | 文档位置 |
|------|------|----------|
| 配音显示"共0个音频" | ✅ 已修复 | [问题追踪 #1](./VIDEO_CREATION_ISSUES_TRACKING.md#1-配音显示共0个音频) |
| 分镜视频卡片不显示 | ✅ 已修复 | [问题追踪 #2](./VIDEO_CREATION_ISSUES_TRACKING.md#2-分镜视频卡片不显示) |
| 流程卡死无法继续 | ✅ 已修复 | [问题追踪 #3](./VIDEO_CREATION_ISSUES_TRACKING.md#3-流程卡死无法继续) |
| 项目恢复步骤错误 | ✅ 已修复 | [问题追踪 #4](./VIDEO_CREATION_ISSUES_TRACKING.md#4-项目恢复步骤错误) |
| 数据类型不匹配 | ✅ 已修复 | [问题追踪 #5](./VIDEO_CREATION_ISSUES_TRACKING.md#5-数据类型不匹配) |

---

## 🔧 故障排查

### 问题：配音或分镜数据不显示

**快速检查**：
1. 刷新页面（Ctrl+Shift+R 强制刷新）
2. 查看步骤4的灰色调试框
3. 打开控制台查看日志
4. 检查后端服务是否运行

**详细步骤**：
→ 查看 [技术文档 - 故障排查](./VIDEO_CREATION_TECHNICAL_DOCUMENTATION.md#故障排查)

---

### 问题：流程卡住无法继续

**快速检查**：
1. 确认当前步骤是否有"继续"按钮
2. 检查是否有错误提示
3. 查看控制台是否有错误

**详细步骤**：
→ 查看 [问题追踪 #3](./VIDEO_CREATION_ISSUES_TRACKING.md#3-流程卡死无法继续)

---

### 问题：刷新后数据丢失

**快速检查**：
1. 确认后端服务运行
2. 检查数据库连接
3. 查看控制台恢复日志

**详细步骤**：
→ 查看 [问题追踪 #4](./VIDEO_CREATION_ISSUES_TRACKING.md#4-项目恢复步骤错误)

---

## 📊 技术架构概览

```
┌─────────────────────────────────────────────────────────┐
│                      前端 (Vue 3)                        │
│  VideoCreatorTimeline.vue                               │
│  - 7步Timeline流程                                       │
│  - 项目自动保存和恢复                                    │
│  - 实时进度轮询                                          │
└─────────────────┬───────────────────────────────────────┘
                  │ HTTP API
┌─────────────────▼───────────────────────────────────────┐
│                   后端 (Express.js)                      │
│  video-creation.controller.ts                           │
│  - 项目管理                                              │
│  - 脚本生成                                              │
│  - 配音合成                                              │
│  - 分镜生成                                              │
│  - 视频合成                                              │
└─────────────────┬───────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼────────┐  ┌──────▼──────────┐
│  MySQL数据库    │  │  AI服务         │
│  video_projects│  │  - 火山引擎TTS   │
│  - scriptData  │  │  - Video Gen    │
│  - audioData   │  │  - VOD          │
│  - sceneVideos │  │                 │
└────────────────┘  └─────────────────┘
```

详细架构：
→ 查看 [技术文档 - 技术架构](./VIDEO_CREATION_TECHNICAL_DOCUMENTATION.md#技术架构)

---

## 🚀 快速开始

### 开发环境启动

```bash
# 1. 启动后端服务
npm run start:backend

# 2. 启动前端服务
npm run start:frontend

# 3. 访问页面
http://localhost:5173/centers/media
```

### 测试流程

```bash
# 1. 运行测试
npm run test:e2e

# 2. 查看测试报告
npm run test:report
```

详细步骤：
→ 查看 [测试指南](./VIDEO_CREATION_TIMELINE_TEST_GUIDE.md)

---

## 📝 API接口速查

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/video-creation/projects` | POST | 创建项目 |
| `/api/video-creation/unfinished` | GET | 获取未完成项目 |
| `/api/video-creation/projects/:id/script` | POST | 生成脚本 |
| `/api/video-creation/projects/:id/audio` | POST | 生成配音 |
| `/api/video-creation/projects/:id/scenes` | POST | 生成分镜 |
| `/api/video-creation/projects/:id/merge` | POST | 合并视频 |
| `/api/video-creation/projects/:id/status` | GET | 获取状态 |

完整API文档：
→ 查看 [技术文档 - API接口](./VIDEO_CREATION_TECHNICAL_DOCUMENTATION.md#api接口)

---

## 🔍 调试工具

### 前端调试

**步骤4调试框**：
- 显示当前步骤
- 显示分镜数量
- 显示生成状态

**控制台日志**：
```javascript
🔍 检查分镜数据: { hasSceneVideos: true, isArray: true, length: 3 }
✅ 恢复分镜数据: 3 个场景视频
```

### 后端调试

**查询数据库**：
```bash
node scripts/check-video-projects.cjs
```

**查看日志**：
```bash
cd server && npm run dev
```

详细调试指南：
→ 查看 [问题追踪 - 调试指南](./VIDEO_CREATION_ISSUES_TRACKING.md#调试指南)

---

## 📞 获取帮助

### 报告问题

请提供以下信息：
1. 浏览器控制台截图
2. 步骤4调试框截图
3. Network面板的API响应
4. 操作步骤描述

### 联系方式

- 技术支持：开发团队
- 文档维护：开发团队
- 问题反馈：GitHub Issues

---

## 📅 更新日志

### 2025-01-XX (最新)
- ✅ **移除调试代码，清理页面** (commit: 7efa9e9)
  - 移除步骤4的灰色调试框
  - 简化控制台日志输出
  - 保留关键的错误和成功日志
  - 用户验证通过后的清理工作

### 2025-01-XX
- ✅ **修复数据类型不匹配问题** (commit: 89fec40)
  - 添加JSON字符串自动解析逻辑
  - 支持string和array两种数据格式
  - 彻底解决配音和分镜数据恢复问题
  - 这是问题#1和#2的根本原因

### 2025-01-XX (早期)
- ✅ 添加完整技术文档
- ✅ 添加问题追踪文档
- ✅ 修复配音数据恢复问题
- ✅ 修复分镜卡片显示问题
- ✅ 修复流程卡死问题
- ✅ 添加调试工具

---

## 🎯 下一步计划

- [ ] 移除调试代码（问题解决后）
- [ ] 添加单元测试
- [ ] 优化性能
- [ ] 添加更多音色选项
- [ ] 支持视频编辑功能

---

**最后更新**: 2025-01-XX  
**文档版本**: 1.0  
**维护者**: 开发团队

