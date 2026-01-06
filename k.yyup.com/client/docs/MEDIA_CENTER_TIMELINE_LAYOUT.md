# 新媒体中心Timeline布局改造文档

## 📋 改造概述

将新媒体中心的所有创作页面改造为类似业务中心的Timeline布局样式，提供清晰的步骤引导，让用户更容易理解创作流程。

### 改造目标

- ✅ 统一的左右分栏布局（左侧Timeline + 右侧内容）
- ✅ 清晰的步骤流程展示
- ✅ 直观的进度状态指示
- ✅ 更好的用户体验和引导

---

## 🎯 已完成的改造

### 1. **文案创作** ✅ 已完成

**文件**: `client/src/pages/principal/media-center/CopywritingCreatorTimeline.vue`

**步骤流程**:
1. 步骤1: 选择平台和类型
2. 步骤2: 填写创作信息
3. 步骤3: 生成文案
4. 步骤4: 预览和编辑
5. 步骤5: 保存和使用

**特点**:
- 左侧显示5个步骤的timeline
- 右侧显示当前步骤的详细内容
- 支持步骤间导航（只能访问已完成或当前步骤）
- 每个步骤有明确的状态（待处理/进行中/已完成）

### 2. **文字转语音** ✅ 已完成

**文件**: `client/src/pages/principal/media-center/TextToSpeechTimeline.vue`

**步骤流程**:
1. 步骤1: 输入文本
2. 步骤2: 选择音色
3. 步骤3: 调节参数
4. 步骤4: 生成语音
5. 步骤5: 预览和下载

**特点**:
- 清晰的5步流程
- 音色选择可视化（带图标）
- 实时参数调节
- 音频预览和下载

### 3. **图文创作** ⏳ 待改造

**建议步骤流程**:
1. 步骤1: 选择平台和类型
2. 步骤2: 填写创作信息
3. 步骤3: 生成图文
4. 步骤4: 预览和编辑
5. 步骤5: 保存和发布

### 4. **视频创作** ⏳ 待改造

**建议步骤流程**:
1. 步骤1: 选择平台和类型
2. 步骤2: 填写创作信息
3. 步骤3: 生成脚本
4. 步骤4: 预览和编辑
5. 步骤5: 保存和使用

---

## 🎨 Timeline布局结构

### 布局比例

```
┌─────────────────────────────────────────────────────────┐
│  Timeline区域 (320px)  │  内容区域 (flex: 1)            │
│                        │                                 │
│  ┌──────────────────┐ │  ┌───────────────────────────┐ │
│  │ 步骤1: 标题      │ │  │ 当前步骤的详细内容         │ │
│  │ 描述             │ │  │                           │ │
│  │ [进行中]         │ │  │ 表单、输入、预览等         │ │
│  └──────────────────┘ │  │                           │ │
│         │             │  │                           │ │
│  ┌──────────────────┐ │  │                           │ │
│  │ 步骤2: 标题      │ │  │                           │ │
│  │ 描述             │ │  │                           │ │
│  │ [待处理]         │ │  │                           │ │
│  └──────────────────┘ │  └───────────────────────────┘ │
│         │             │                                 │
│  ┌──────────────────┐ │                                 │
│  │ 步骤3: 标题      │ │                                 │
│  │ 描述             │ │                                 │
│  │ [待处理]         │ │                                 │
│  └──────────────────┘ │                                 │
└─────────────────────────────────────────────────────────┘
```

### 核心CSS结构

```scss
.xxx-timeline {
  display: flex;
  height: calc(100vh - 120px);
  gap: 24px;
  background: var(--el-bg-color-page);
}

.timeline-section {
  flex: 0 0 320px;  // 固定宽度320px
  background: var(--el-bg-color);
  border-radius: 12px;
  padding: 24px;
  overflow-y: auto;
}

.content-section {
  flex: 1;  // 占据剩余空间
  background: var(--el-bg-color);
  border-radius: 12px;
  padding: 32px;
  overflow-y: auto;
}
```

---

## 🔧 Timeline组件结构

### 步骤定义

```typescript
const steps = ref([
  {
    id: 1,
    title: '步骤标题',
    description: '步骤描述',
    status: 'in-progress'  // 'pending' | 'in-progress' | 'completed'
  },
  // ... 更多步骤
])
```

### 步骤状态

| 状态 | 说明 | 颜色 | 图标 |
|------|------|------|------|
| `pending` | 待处理 | 灰色 | 数字 |
| `in-progress` | 进行中 | 橙色 | Loading图标 |
| `completed` | 已完成 | 绿色 | Check图标 |

### 步骤导航逻辑

```typescript
// 只能访问已完成或当前步骤
const goToStep = (stepId: number) => {
  const targetStep = steps.value.find(s => s.id === stepId)
  if (targetStep && (targetStep.status === 'completed' || targetStep.status === 'in-progress')) {
    currentStep.value = stepId
  }
}

// 下一步
const nextStep = () => {
  // 标记当前步骤为完成
  const current = steps.value.find(s => s.id === currentStep.value)
  if (current) current.status = 'completed'
  
  // 移动到下一步
  currentStep.value++
  
  // 标记下一步为进行中
  const next = steps.value.find(s => s.id === currentStep.value)
  if (next) next.status = 'in-progress'
}

// 上一步
const prevStep = () => {
  // 标记当前步骤为待处理
  const current = steps.value.find(s => s.id === currentStep.value)
  if (current) current.status = 'pending'
  
  // 移动到上一步
  currentStep.value--
  
  // 标记上一步为进行中
  const prev = steps.value.find(s => s.id === currentStep.value)
  if (prev) prev.status = 'in-progress'
}
```

---

## 📝 改造步骤指南

### 步骤1: 创建Timeline版本文件

复制现有组件，重命名为 `XXXTimeline.vue`

### 步骤2: 定义步骤流程

根据业务逻辑定义5个步骤：
```typescript
const steps = ref([
  { id: 1, title: '...', description: '...', status: 'in-progress' },
  { id: 2, title: '...', description: '...', status: 'pending' },
  { id: 3, title: '...', description: '...', status: 'pending' },
  { id: 4, title: '...', description: '...', status: 'pending' },
  { id: 5, title: '...', description: '...', status: 'pending' }
])
```

### 步骤3: 重构模板结构

```vue
<template>
  <div class="xxx-timeline">
    <!-- 左侧Timeline -->
    <div class="timeline-section">
      <div class="timeline-header">
        <h3>功能标题</h3>
        <p>5步完成XXX</p>
      </div>
      
      <div class="timeline-container">
        <div v-for="(step, index) in steps" :key="step.id" 
             class="timeline-item"
             :class="{ active: currentStep === step.id, ... }">
          <!-- Timeline项内容 -->
        </div>
      </div>
    </div>

    <!-- 右侧内容 -->
    <div class="content-section">
      <div v-show="currentStep === 1" class="step-content">
        <!-- 步骤1内容 -->
      </div>
      <div v-show="currentStep === 2" class="step-content">
        <!-- 步骤2内容 -->
      </div>
      <!-- ... 更多步骤 -->
    </div>
  </div>
</template>
```

### 步骤4: 添加步骤导航

在每个步骤底部添加导航按钮：
```vue
<div class="step-actions">
  <el-button size="large" @click="prevStep" v-if="currentStep > 1">
    <el-icon class="el-icon--left"><ArrowLeft /></el-icon>
    上一步
  </el-button>
  <el-button type="primary" size="large" @click="nextStep" v-if="currentStep < steps.length">
    下一步
    <el-icon class="el-icon--right"><ArrowRight /></el-icon>
  </el-button>
</div>
```

### 步骤5: 复制Timeline样式

从 `CopywritingCreatorTimeline.vue` 或 `TextToSpeechTimeline.vue` 复制样式部分

### 步骤6: 更新MediaCenter.vue

```typescript
import XXX from './media-center/XXXTimeline.vue'
```

---

## 🎯 设计原则

### 1. 步骤数量

建议每个功能都设计为 **5个步骤**，保持一致性：
- 步骤1: 选择/输入基础信息
- 步骤2: 配置详细参数
- 步骤3: 生成/处理
- 步骤4: 预览/编辑
- 步骤5: 保存/使用

### 2. 步骤命名

- 使用动词开头：选择、填写、生成、预览、保存
- 简洁明了，不超过8个字
- 描述要具体，说明该步骤要做什么

### 3. 状态管理

- 初始状态：第1步为 `in-progress`，其他为 `pending`
- 完成步骤：标记为 `completed`
- 当前步骤：标记为 `in-progress`
- 只能访问已完成或当前步骤

### 4. 用户体验

- 提供清晰的进度指示
- 支持前后导航
- 关键操作有确认提示
- 错误状态有明确提示
- 成功状态有视觉反馈

---

## 📊 改造进度

| 功能 | 状态 | 文件 | 步骤数 |
|------|------|------|--------|
| 文案创作 | ✅ 已完成 | `CopywritingCreatorTimeline.vue` | 5 |
| 文字转语音 | ✅ 已完成 | `TextToSpeechTimeline.vue` | 5 |
| 图文创作 | ⏳ 待改造 | `ArticleCreatorTimeline.vue` | 5 |
| 视频创作 | ⏳ 待改造 | `VideoCreatorTimeline.vue` | 5 |

---

## 🚀 使用方法

### 访问页面

1. 登录系统
2. 进入"新媒体中心"
3. 点击对应的创作标签页

### 创作流程

1. **左侧Timeline**: 查看整体流程和当前进度
2. **右侧内容**: 完成当前步骤的操作
3. **步骤导航**: 使用"上一步"/"下一步"按钮导航
4. **点击步骤**: 可以直接跳转到已完成的步骤

---

## 📚 参考文件

### 已完成的Timeline组件

1. **业务中心**: `client/src/pages/centers/BusinessCenter.vue`
   - 最原始的timeline布局参考
   - 完整的样式和交互逻辑

2. **文案创作**: `client/src/pages/principal/media-center/CopywritingCreatorTimeline.vue`
   - 完整的5步流程
   - AI生成集成
   - 预览和编辑功能

3. **文字转语音**: `client/src/pages/principal/media-center/TextToSpeechTimeline.vue`
   - 简洁的5步流程
   - 参数配置
   - 音频预览和下载

### 样式参考

- Timeline样式: 所有timeline组件的 `<style>` 部分
- 业务中心样式: `client/src/pages/centers/BusinessCenter.vue` (line 423-700)

---

## ✅ 验证清单

改造完成后，请验证以下内容：

- [ ] 左侧timeline正确显示所有步骤
- [ ] 步骤状态正确切换（pending → in-progress → completed）
- [ ] 点击步骤可以正确导航
- [ ] "上一步"/"下一步"按钮工作正常
- [ ] 每个步骤的内容正确显示
- [ ] 表单验证正常工作
- [ ] API调用正常
- [ ] 生成/预览功能正常
- [ ] 保存功能正常
- [ ] 样式在不同屏幕尺寸下正常显示

---

**创建时间**: 当前会话  
**状态**: 文案创作和文字转语音已完成，图文创作和视频创作待改造  
**版本**: 1.0.0

