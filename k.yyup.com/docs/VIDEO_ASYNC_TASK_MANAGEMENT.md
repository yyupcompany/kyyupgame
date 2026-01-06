# 视频创作异步任务管理系统

## 📋 概述

本文档描述了视频创作功能的异步任务管理系统，解决了AI生成任务耗时长、用户体验差的问题。

## 🎯 解决的问题

### 问题1: 前端请求超时
- **现象**: AI生成脚本需要30-60秒，前端10秒超时
- **影响**: 用户看到错误提示，但后端实际已完成
- **解决**: 增加超时时间到60秒，使用轮询机制

### 问题2: 无进度反馈
- **现象**: 用户不知道任务是否在进行中
- **影响**: 用户可能误以为卡住而关闭页面
- **解决**: 实时显示进度条和进度消息

### 问题3: 刷新页面丢失状态
- **现象**: 用户刷新页面后无法继续查看进度
- **影响**: 用户体验差，无法追踪任务状态
- **解决**: 数据库记录任务状态，页面加载时恢复

### 问题4: 任务完成无通知
- **现象**: 任务完成后用户不知道
- **影响**: 用户需要手动刷新查看
- **解决**: 任务完成后显示通知，提供跳转链接

## 🏗️ 架构设计

### 1. 数据库层

#### 新增字段（video_projects表）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `progress` | INT | 任务进度(0-100) |
| `progressMessage` | VARCHAR(500) | 进度消息 |
| `completedAt` | DATETIME | 完成时间 |
| `notified` | BOOLEAN | 是否已通知用户 |

#### 迁移脚本
```bash
cd server && node scripts/add-video-project-progress-fields.js
```

### 2. 后端API层

#### 新增API端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/video-creation/projects/:projectId/status` | GET | 获取项目状态（轮询） |
| `/api/video-creation/unfinished` | GET | 获取未完成项目列表 |
| `/api/video-creation/projects/:projectId/notified` | POST | 标记为已通知 |

#### 控制器改进

**进度更新**:
```typescript
// 开始生成时
await project.update({ 
  status: VideoProjectStatus.GENERATING_SCRIPT,
  progress: 10,
  progressMessage: '正在准备生成脚本...'
});

// 完成时
await project.update({
  scriptData: script,
  status: VideoProjectStatus.DRAFT,
  progress: 100,
  progressMessage: '脚本生成完成',
  completedAt: new Date(),
});
```

### 3. 前端层

#### 专用axios实例

创建了`videoCreationService`，超时时间60秒：

```typescript
const videoCreationService = axios.create({
  baseURL: getApiBaseURL(),
  timeout: 60000, // 60秒超时
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json; charset=utf-8'
  }
})
```

#### 轮询机制

```typescript
// 每3秒轮询一次项目状态
const startPolling = () => {
  isPolling.value = true
  pollingTimer = window.setInterval(() => {
    pollProjectStatus()
  }, 3000)
}

// 获取项目状态
const pollProjectStatus = async () => {
  const response = await videoCreationRequest.get(
    `/video-creation/projects/${projectId.value}/status`
  )
  
  // 更新进度
  realProgress.value = response.data.progress
  realProgressMessage.value = response.data.progressMessage
  
  // 检查是否完成
  if (response.data.status === 'DRAFT') {
    stopPolling()
    ElNotification({
      title: '脚本生成完成',
      message: '您的视频脚本已生成，请查看并确认',
      type: 'success'
    })
  }
}
```

#### 任务恢复

```typescript
// 页面加载时检查未完成项目
onMounted(() => {
  checkUnfinishedProjects()
})

const checkUnfinishedProjects = async () => {
  const response = await videoCreationRequest.get('/video-creation/unfinished')
  
  if (response.data.length > 0) {
    ElMessageBox.confirm(
      `您有一个未完成的视频项目，是否继续制作？`,
      '发现未完成项目',
      {
        confirmButtonText: '继续制作',
        cancelButtonText: '新建项目'
      }
    ).then(() => {
      // 恢复项目状态
      projectId.value = project.id
      currentStep.value = getStepFromStatus(project.status)
      startPolling()
    })
  }
}
```

## 🔄 完整流程

### 1. 创建项目
```
用户填写表单 → 点击"开始创作" → 创建项目 → 进入步骤2
```

### 2. 生成脚本（异步）
```
发起生成请求 → 启动轮询 → 显示进度条 → 每3秒查询状态 → 完成后通知
```

### 3. 用户刷新页面
```
页面加载 → 检查未完成项目 → 提示用户 → 恢复状态 → 继续轮询
```

### 4. 任务完成
```
后端更新状态 → 前端轮询检测 → 停止轮询 → 显示通知 → 标记已通知
```

## 📊 状态流转

```
DRAFT (草稿)
  ↓
GENERATING_SCRIPT (生成脚本中) ← 轮询此状态
  ↓
DRAFT (脚本完成) → 通知用户
  ↓
GENERATING_AUDIO (生成配音中) ← 轮询此状态
  ↓
GENERATING_VIDEO (生成视频中) ← 轮询此状态
  ↓
EDITING (编辑中)
  ↓
COMPLETED (完成) → 通知用户
```

## 🎨 用户体验改进

### 1. 实时进度反馈
- ✅ 显示真实进度百分比（0-100）
- ✅ 显示进度消息（"正在生成脚本..."）
- ✅ 进度条动画效果

### 2. 等待提示
- ✅ 显示"脚本生成中，请稍候...这可能需要30-60秒"
- ✅ 加载动画
- ✅ 禁用操作按钮防止重复提交

### 3. 任务恢复
- ✅ 页面加载时检查未完成项目
- ✅ 提示用户是否继续
- ✅ 自动恢复到对应步骤

### 4. 完成通知
- ✅ 桌面通知（ElNotification）
- ✅ 提供"点击查看"链接
- ✅ 自动跳转到结果页面

## 🔧 配置说明

### 超时时间配置

| 服务类型 | 超时时间 | 说明 |
|---------|---------|------|
| 普通请求 | 10秒 | 适用于快速响应的API |
| 视频创作 | 60秒 | 适用于AI生成任务 |
| AI服务 | 600秒 | 适用于复杂AI任务 |

### 轮询配置

| 参数 | 值 | 说明 |
|------|---|------|
| 轮询间隔 | 3秒 | 平衡实时性和服务器压力 |
| 最大轮询次数 | 无限制 | 直到任务完成或失败 |
| 错误重试 | 继续轮询 | 单次失败不影响整体流程 |

## 📝 使用示例

### 前端调用

```typescript
// 1. 创建项目
const response = await videoCreationRequest.post('/video-creation/projects', formData)
projectId.value = response.data.projectId

// 2. 生成脚本（异步）
generateScript() // 不等待完成

// 3. 启动轮询
startPolling()

// 4. 轮询会自动检测完成并通知用户
```

### 后端实现

```typescript
// 1. 更新进度
await project.update({ 
  progress: 50,
  progressMessage: '正在生成第2段脚本...'
})

// 2. 完成任务
await project.update({
  status: VideoProjectStatus.DRAFT,
  progress: 100,
  progressMessage: '脚本生成完成',
  completedAt: new Date()
})
```

## 🚀 部署说明

### 1. 数据库迁移
```bash
cd server
node scripts/add-video-project-progress-fields.js
```

### 2. 重启服务
```bash
# 停止现有服务
npm run stop

# 启动所有服务
npm run start:all
```

### 3. 验证功能
1. 访问 http://localhost:5173
2. 进入"新媒体中心" → "视频创作"
3. 填写表单并点击"开始创作"
4. 观察进度条和进度消息
5. 刷新页面验证任务恢复功能

## 📈 性能优化

### 1. 轮询优化
- 使用3秒间隔，平衡实时性和服务器压力
- 任务完成后立即停止轮询
- 页面卸载时自动停止轮询

### 2. 数据库优化
- 为`status`字段添加索引
- 为`userId`和`status`组合添加索引
- 限制查询结果数量（最多10条）

### 3. 前端优化
- 使用专用axios实例，避免影响其他请求
- 轮询失败不影响用户操作
- 进度条使用CSS动画，减少JS计算

## 🐛 故障排除

### 问题1: 轮询不停止
**原因**: 状态判断逻辑错误
**解决**: 检查`pollProjectStatus`中的状态判断

### 问题2: 进度不更新
**原因**: 后端未更新progress字段
**解决**: 确保后端在每个阶段都更新progress

### 问题3: 通知不显示
**原因**: ElNotification未正确导入
**解决**: 检查import语句

## 📚 相关文档

- [视频创作功能说明](./VIDEO_CREATION_VOD_INTEGRATION.md)
- [AI Bridge架构](./AI_BRIDGE_VOD_ARCHITECTURE.md)
- [API文档](http://localhost:3000/api-docs)

---

**最后更新**: 当前会话
**状态**: ✅ 已实现并测试

