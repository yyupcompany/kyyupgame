# 🎨 组件文档

## 🎯 组件概述

移动端AI专家工作流系统的UI组件采用Vue 3 Composition API设计，专门为移动端优化，提供流畅的用户体验和丰富的交互功能。

## 📋 组件列表

| 组件名称 | 文件 | 主要功能 | 复杂度 |
|---------|------|---------|--------|
| 智能任务执行器 | `SmartTaskExecutor.vue` | 类似Claude的多轮任务执行 | 高 |
| 专家工作流 | `MobileExpertWorkflow.vue` | 多专家协作工作流 | 高 |
| 专家聊天 | `MobileExpertChat.vue` | 专家一对一对话 | 中 |
| 移动端首页 | `MobileHome.vue` | 应用主页面 | 中 |
| 应用容器 | `App.vue` | 应用根组件 | 低 |

## 🧠 智能任务执行器 (SmartTaskExecutor.vue)

### 功能概述
系统的核心组件，实现类似Claude的智能任务执行能力，支持复杂任务的自动分解、规划和执行。

### 核心特性

#### 1. 任务输入界面
```vue
<template>
  <div class="task-input-section">
    <textarea 
      v-model="taskDescription"
      placeholder="描述您的复杂任务..."
      class="task-textarea"
    />
    
    <!-- 快速示例 -->
    <div class="quick-examples">
      <span 
        v-for="example in quickExamples" 
        :key="example.id"
        @click="useExample(example)"
      >
        {{ example.name }}
      </span>
    </div>
  </div>
</template>
```

#### 2. 执行计划预览
- **计划元数据** - 复杂度、预计时长、步骤数
- **步骤详情** - 每个步骤的名称、描述、依赖关系
- **资源需求** - 所需专家和工具列表

#### 3. 实时执行监控
```vue
<template>
  <div class="execution-process">
    <!-- 整体进度 -->
    <div class="overall-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${overallProgress}%` }"/>
      </div>
    </div>
    
    <!-- 当前步骤 -->
    <div class="current-step">
      <div class="step-icon">🔄</div>
      <div class="step-info">
        <h4>{{ currentStep.name }}</h4>
        <p>{{ currentStep.description }}</p>
      </div>
    </div>
    
    <!-- 执行时间线 -->
    <div class="execution-timeline">
      <div v-for="step in steps" :class="['timeline-step', step.status]">
        <!-- 步骤状态和结果 -->
      </div>
    </div>
  </div>
</template>
```

#### 4. 结果展示
- **执行摘要** - 成功率、执行时长、完成步骤
- **生成内容** - 文档、图片、数据可视化
- **改进建议** - AI生成的优化建议
- **操作按钮** - 下载、分享、新建任务

### 状态管理
```typescript
// 响应式数据
const taskDescription = ref('')
const executionPlan = ref<ExecutionPlan | null>(null)
const executionResult = ref<ExecutionResult | null>(null)
const isExecuting = ref(false)
const currentStep = ref<TaskStep | null>(null)
const overallProgress = ref(0)

// 核心方法
const startExecution = async () => {
  const plan = await aiTaskPlannerService.generatePlan(taskDescription.value)
  executionPlan.value = plan
}

const executePlan = async () => {
  isExecuting.value = true
  const result = await aiTaskPlannerService.executePlan(
    executionPlan.value.id,
    (step, progress) => {
      currentStep.value = step
      overallProgress.value = progress
    }
  )
  executionResult.value = result
  isExecuting.value = false
}
```

### 移动端优化
- **触觉反馈** - 按钮点击振动反馈
- **手势支持** - 滑动操作
- **响应式设计** - 适配各种屏幕尺寸
- **性能优化** - 虚拟滚动、懒加载

## 🔄 专家工作流 (MobileExpertWorkflow.vue)

### 功能概述
提供多专家协作的工作流执行界面，支持预定义工作流的创建、执行和监控。

### 核心特性

#### 1. 工作流选择
```vue
<template>
  <div class="workflow-templates">
    <div 
      v-for="template in workflowTemplates" 
      :key="template.id"
      class="template-card"
      @click="selectTemplate(template)"
    >
      <div class="template-icon">{{ template.icon }}</div>
      <h3>{{ template.name }}</h3>
      <p>{{ template.description }}</p>
      <div class="template-meta">
        <span>{{ template.steps.length }}个步骤</span>
        <span>{{ template.estimatedTime }}分钟</span>
      </div>
    </div>
  </div>
</template>
```

#### 2. 参数配置
- **动态表单** - 根据工作流模板生成配置表单
- **参数验证** - 实时验证用户输入
- **默认值** - 智能推荐默认参数

#### 3. 执行监控
```vue
<template>
  <div class="workflow-execution">
    <!-- 步骤进度 -->
    <div class="steps-progress">
      <div 
        v-for="(step, index) in workflow.steps" 
        :key="step.id"
        :class="['step-item', getStepStatus(step)]"
      >
        <div class="step-number">{{ index + 1 }}</div>
        <div class="step-content">
          <h4>{{ step.name }}</h4>
          <div v-if="step.result" class="step-result">
            {{ formatResult(step.result) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
```

### 工作流模板
```typescript
const workflowTemplates = ref([
  {
    id: 'activity_planning',
    name: '活动策划',
    icon: '🎯',
    description: '完整的活动策划流程',
    steps: [
      { id: 'theme', name: '主题设计', agent: 'activity_planner' },
      { id: 'budget', name: '预算分析', agent: 'cost_analyst' },
      { id: 'risk', name: '风险评估', agent: 'risk_assessor' }
    ],
    estimatedTime: 15
  },
  {
    id: 'recruitment',
    name: '招生策略',
    icon: '📈',
    description: '招生营销策略制定',
    steps: [
      { id: 'market', name: '市场分析', agent: 'marketing_expert' },
      { id: 'strategy', name: '策略设计', agent: 'marketing_expert' },
      { id: 'content', name: '内容创作', agent: 'creative_designer' }
    ],
    estimatedTime: 20
  }
])
```

## 💬 专家聊天 (MobileExpertChat.vue)

### 功能概述
提供与AI专家的一对一对话界面，支持文本和语音输入，实时响应。

### 核心特性

#### 1. 专家选择
```vue
<template>
  <div class="expert-selector">
    <div 
      v-for="expert in availableExperts" 
      :key="expert.id"
      :class="['expert-card', { active: selectedExpert?.id === expert.id }]"
      @click="selectExpert(expert)"
    >
      <div class="expert-avatar">{{ expert.icon }}</div>
      <div class="expert-info">
        <h4>{{ expert.name }}</h4>
        <p>{{ expert.description }}</p>
        <div class="expert-stats">
          <span>⭐ {{ expert.rating }}</span>
          <span>{{ expert.usageCount }}次咨询</span>
        </div>
      </div>
    </div>
  </div>
</template>
```

#### 2. 对话界面
```vue
<template>
  <div class="chat-container">
    <!-- 消息列表 -->
    <div class="message-list" ref="messageList">
      <div 
        v-for="message in messages" 
        :key="message.id"
        :class="['message', message.sender]"
      >
        <div class="message-avatar">
          <img v-if="message.sender === 'expert'" :src="selectedExpert.avatar">
          <div v-else class="user-avatar">👤</div>
        </div>
        <div class="message-content">
          <div class="message-text">{{ message.text }}</div>
          <div class="message-time">{{ formatTime(message.timestamp) }}</div>
        </div>
      </div>
    </div>
    
    <!-- 输入区域 -->
    <div class="input-area">
      <div class="input-container">
        <textarea 
          v-model="inputText"
          placeholder="输入您的问题..."
          @keydown.enter.prevent="sendMessage"
        />
        <button 
          class="voice-btn"
          @touchstart="startVoiceInput"
          @touchend="stopVoiceInput"
        >
          🎤
        </button>
        <button 
          class="send-btn"
          @click="sendMessage"
          :disabled="!inputText.trim()"
        >
          发送
        </button>
      </div>
    </div>
  </div>
</template>
```

#### 3. 语音输入
```typescript
const startVoiceInput = () => {
  if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition()
    recognition.lang = 'zh-CN'
    recognition.continuous = false
    recognition.interimResults = false
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      inputText.value = transcript
    }
    
    recognition.start()
    isRecording.value = true
  }
}
```

### 消息处理
```typescript
const sendMessage = async () => {
  if (!inputText.value.trim() || !selectedExpert.value) return
  
  // 添加用户消息
  const userMessage = {
    id: generateId(),
    sender: 'user',
    text: inputText.value,
    timestamp: Date.now()
  }
  messages.value.push(userMessage)
  
  // 清空输入
  const question = inputText.value
  inputText.value = ''
  
  // 显示专家正在输入
  showTypingIndicator.value = true
  
  try {
    // 调用专家API
    const response = await mobileAPIService.callSmartExpert({
      expert_id: selectedExpert.value.id,
      task: question,
      context: getConversationContext()
    })
    
    // 添加专家回复
    const expertMessage = {
      id: generateId(),
      sender: 'expert',
      text: response.advice,
      timestamp: Date.now()
    }
    messages.value.push(expertMessage)
    
  } catch (error) {
    // 错误处理
    showError('专家暂时无法回复，请稍后重试')
  } finally {
    showTypingIndicator.value = false
    scrollToBottom()
  }
}
```

## 🏠 移动端首页 (MobileHome.vue)

### 功能概述
应用的主页面，提供快速操作入口、专家推荐、最近活动和使用统计。

### 核心特性

#### 1. 状态栏
```vue
<template>
  <div class="status-bar">
    <div class="status-left">
      <span class="time">{{ currentTime }}</span>
    </div>
    <div class="status-right">
      <span class="network-status">{{ networkIcon }}</span>
      <span class="battery">🔋</span>
    </div>
  </div>
</template>
```

#### 2. 快速操作
```vue
<template>
  <div class="quick-actions">
    <div class="action-grid">
      <div 
        v-for="action in quickActions" 
        :key="action.id"
        class="action-card"
        @click="handleQuickAction(action)"
      >
        <div class="action-icon">{{ action.icon }}</div>
        <div class="action-content">
          <h3>{{ action.title }}</h3>
          <p>{{ action.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
```

#### 3. 专家推荐
- **轮播展示** - 推荐专家卡片轮播
- **使用统计** - 显示专家使用次数和评分
- **快速咨询** - 一键进入专家对话

#### 4. 最近活动
- **活动列表** - 显示最近的工作流执行记录
- **状态标识** - 完成、进行中、失败状态
- **快速操作** - 查看详情、继续执行

#### 5. 浮动操作按钮
```vue
<template>
  <div class="fab-container">
    <button 
      class="fab-main"
      :class="{ expanded: fabExpanded }"
      @click="toggleFab"
    >
      {{ fabExpanded ? '✕' : '➕' }}
    </button>
    
    <div v-if="fabExpanded" class="fab-actions">
      <button class="fab-action" @click="startWorkflow">
        <span class="fab-icon">🎯</span>
        <span class="fab-text">新工作流</span>
      </button>
      <button class="fab-action" @click="startChat">
        <span class="fab-icon">💬</span>
        <span class="fab-text">专家聊天</span>
      </button>
    </div>
  </div>
</template>
```

## 📱 应用容器 (App.vue)

### 功能概述
应用的根组件，负责全局状态管理、路由转场、通知显示等。

### 核心特性

#### 1. 路由转场
```vue
<template>
  <router-view v-slot="{ Component, route }">
    <transition 
      :name="transitionName" 
      mode="out-in"
    >
      <keep-alive :include="keepAliveComponents">
        <component :is="Component" :key="route.path" />
      </keep-alive>
    </transition>
  </router-view>
</template>
```

#### 2. 全局通知
```vue
<template>
  <div class="notification-container">
    <transition-group name="notification">
      <div 
        v-for="notification in notifications" 
        :key="notification.id"
        :class="['notification-item', notification.type]"
      >
        <!-- 通知内容 -->
      </div>
    </transition-group>
  </div>
</template>
```

#### 3. 网络状态
```vue
<template>
  <div v-if="!isOnline" class="offline-banner">
    📡 当前离线，部分功能可能受限
  </div>
</template>
```

## 🎨 样式设计

### 设计原则
- **移动优先** - 专为移动端设计
- **触摸友好** - 44px最小触摸目标
- **性能优化** - GPU加速动画
- **无障碍** - 支持屏幕阅读器

### 主题系统
```css
:root {
  --primary-color: #667eea;
  --secondary-color: #f093fb;
  --success-color: #28a745;
  --warning-color: #ffc107;
  --error-color: #dc3545;
}

[data-theme="dark"] {
  --background: #121212;
  --surface: #1e1e1e;
  --text-primary: #ffffff;
}
```

### 动画效果
- **页面转场** - 滑动、淡入淡出
- **组件动画** - 弹性、缩放
- **加载动画** - 骨架屏、进度条
- **交互反馈** - 涟漪效果、触觉反馈

## 🔧 开发指南

### 组件开发规范
1. **使用Composition API** - 更好的逻辑复用
2. **TypeScript支持** - 完整的类型定义
3. **响应式设计** - 适配各种屏幕
4. **性能优化** - 懒加载、虚拟滚动
5. **错误处理** - 友好的错误提示

### 测试策略
- **单元测试** - 组件逻辑测试
- **集成测试** - 组件交互测试
- **E2E测试** - 完整流程测试
- **性能测试** - 渲染性能测试

---

*组件设计遵循现代前端开发最佳实践，确保代码的可维护性、可测试性和用户体验的一致性。*
