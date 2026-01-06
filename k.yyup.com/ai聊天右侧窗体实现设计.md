# AI聊天右侧窗体实现设计

## 🎯 项目概述

基于现有的幼儿园管理系统，实现一个智能的AI聊天右侧窗体，提供上下文感知的AI助手功能。该窗体将集成到MainLayout中，形成左（侧边栏）-中（主内容）-右（AI助手）的三栏布局。

## 🏗️ 架构设计

### 1. 布局结构
```
┌─────────────────────────────────────────────────────────────┐
│                    头部导航栏                                │
│  [Logo] [面包屑]           [YY-AI] [主题] [用户]            │
├─────────────┬─────────────────────────┬─────────────────────┤
│             │                         │                     │
│   侧边栏     │       主内容区域         │    AI聊天窗体       │
│  (320px)    │        (flex:1)        │     (400px)        │
│             │                         │                     │
│  - 导航菜单  │  - 页面内容             │  - 聊天界面         │
│  - 用户信息  │  - 数据表格             │  - 上下文感知       │
│  - 系统设置  │  - 表单操作             │  - 记忆管理         │
│             │                         │  - 快捷操作         │
│             │                         │                     │
└─────────────┴─────────────────────────┴─────────────────────┘
```

### 2. 技术栈
- **前端框架**: Vue 3 + TypeScript + Composition API
- **状态管理**: Pinia (已有用户状态、新增AI状态)
- **UI组件**: Element Plus
- **样式方案**: SCSS + CSS Variables
- **后端接口**: 已有的AI聊天接口 `/api/ai/chat`
- **记忆存储**: 本地存储 + 后端向量数据库

## 🔧 核心功能设计

### 1. 头部导航集成
```vue
<!-- MainLayout.vue 头部导航增强 -->
<div class="navbar-right">
  <!-- YY-AI 按钮 -->
  <button 
    class="ai-toggle-btn"
    :class="{ 'active': aiPanelVisible }"
    @click="toggleAIPanel"
    title="AI助手"
  >
    <el-icon><Robot /></el-icon>
    <span>YY-AI</span>
    <div class="ai-status-indicator" :class="aiStatus"></div>
  </button>
  
  <!-- 其他导航项 -->
  <div class="theme-selector">...</div>
  <div class="user-menu">...</div>
</div>
```

### 2. 三栏布局实现
```scss
.app-container {
  display: grid;
  grid-template-columns: 320px 1fr 0px; // 默认AI面板隐藏
  transition: grid-template-columns 0.3s ease;
  
  &.ai-panel-visible {
    grid-template-columns: 320px 1fr 400px; // AI面板显示
  }
  
  // 响应式适配
  @media (max-width: 1200px) {
    &.ai-panel-visible {
      grid-template-columns: 320px 1fr 350px;
    }
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr; // 移动端单栏
    
    &.ai-panel-visible {
      .ai-panel {
        position: fixed;
        right: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        z-index: 2000;
      }
    }
  }
}
```

### 3. AI聊天窗体组件
```vue
<!-- AIPanel.vue -->
<template>
  <div class="ai-panel" :class="{ 'visible': visible }">
    <!-- 头部 -->
    <div class="ai-panel-header">
      <div class="ai-title">
        <el-icon><Robot /></el-icon>
        <span>YY-AI助手</span>
        <div class="context-indicator" :title="currentContext">
          {{ contextIcon }}
        </div>
      </div>
      <div class="ai-actions">
        <el-button size="small" @click="clearChat">清空</el-button>
        <el-button size="small" @click="togglePanel">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
    </div>
    
    <!-- 聊天区域 -->
    <div class="ai-chat-area" ref="chatArea">
      <div class="context-banner" v-if="currentPageContext">
        <el-icon><InfoFilled /></el-icon>
        <span>当前页面: {{ currentPageContext.title }}</span>
        <span class="permissions">权限: {{ userPermissionsSummary }}</span>
      </div>
      
      <div class="message-list">
        <div 
          v-for="message in messages" 
          :key="message.id"
          class="message-item"
          :class="message.role"
        >
          <div class="message-content">{{ message.content }}</div>
          <div class="message-time">{{ formatTime(message.timestamp) }}</div>
        </div>
      </div>
    </div>
    
    <!-- 输入区域 -->
    <div class="ai-input-area">
      <div class="quick-actions">
        <el-button size="small" @click="insertQuickQuery('查询当前页面数据')">
          查询数据
        </el-button>
        <el-button size="small" @click="insertQuickQuery('分析当前页面')">
          页面分析
        </el-button>
        <el-button size="small" @click="insertQuickQuery('操作建议')">
          操作建议
        </el-button>
      </div>
      
      <div class="input-wrapper">
        <el-input
          v-model="inputMessage"
          type="textarea"
          :rows="3"
          placeholder="输入您的问题..."
          @keydown.ctrl.enter="sendMessage"
          @keydown.meta.enter="sendMessage"
        />
        <el-button 
          type="primary" 
          @click="sendMessage"
          :loading="sending"
          :disabled="!inputMessage.trim()"
        >
          发送
        </el-button>
      </div>
    </div>
  </div>
</template>
```

## 📊 状态管理设计

### 1. AI状态Store
```typescript
// stores/ai-chat.ts
export const useAIChatStore = defineStore('ai-chat', {
  state: () => ({
    // 面板状态
    panelVisible: false,
    panelWidth: 400,
    
    // 聊天状态
    messages: [] as AIMessage[],
    currentSessionId: null as string | null,
    sending: false,
    
    // 上下文状态
    currentPageContext: null as PageContext | null,
    userPermissions: [] as string[],
    
    // 记忆管理
    memoryEnabled: true,
    maxMemoryLines: 500,
    memoryData: [] as MemoryItem[]
  }),
  
  getters: {
    // 获取当前页面的上下文信息
    contextSummary: (state) => {
      if (!state.currentPageContext) return '无上下文'
      return `${state.currentPageContext.title} - ${state.currentPageContext.route}`
    },
    
    // 获取用户权限摘要
    permissionsSummary: (state) => {
      return state.userPermissions.slice(0, 3).join(', ') + 
             (state.userPermissions.length > 3 ? '...' : '')
    }
  },
  
  actions: {
    // 切换面板显示
    togglePanel() {
      this.panelVisible = !this.panelVisible
      localStorage.setItem('ai-panel-visible', String(this.panelVisible))
    },
    
    // 更新页面上下文
    updatePageContext(route: RouteLocationNormalized, userStore: any) {
      this.currentPageContext = {
        route: route.path,
        title: this.getPageTitle(route.path),
        permissions: userStore.userPermissions,
        timestamp: new Date().toISOString()
      }
      this.userPermissions = userStore.userPermissions
    },
    
    // 发送消息
    async sendMessage(content: string) {
      if (!content.trim() || this.sending) return
      
      this.sending = true
      
      // 添加用户消息
      const userMessage: AIMessage = {
        id: generateId(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date().toISOString()
      }
      this.messages.push(userMessage)
      
      try {
        // 调用AI接口
        const response = await aiApi.chat({
          message: content,
          context: {
            route: this.currentPageContext?.route,
            permissions: this.userPermissions,
            sessionId: this.currentSessionId
          }
        })
        
        // 添加AI回复
        const aiMessage: AIMessage = {
          id: generateId(),
          role: 'assistant',
          content: response.data.message,
          timestamp: new Date().toISOString()
        }
        this.messages.push(aiMessage)
        
        // 更新记忆
        this.updateMemory(userMessage, aiMessage)
        
      } catch (error) {
        console.error('AI聊天错误:', error)
        // 添加错误消息
        this.messages.push({
          id: generateId(),
          role: 'assistant',
          content: '抱歉，AI服务暂时不可用，请稍后再试。',
          timestamp: new Date().toISOString()
        })
      } finally {
        this.sending = false
      }
    }
  }
})
```

## 🧠 记忆管理系统

### 1. 本地记忆存储
```typescript
interface MemoryItem {
  id: string
  userMessage: string
  aiResponse: string
  context: PageContext
  timestamp: string
  importance: number // 1-10，重要性评分
}

class LocalMemoryManager {
  private readonly STORAGE_KEY = 'ai-chat-memory'
  private readonly MAX_ITEMS = 500
  
  // 添加记忆
  addMemory(item: MemoryItem) {
    const memories = this.getMemories()
    memories.unshift(item)
    
    // 保持最大数量限制
    if (memories.length > this.MAX_ITEMS) {
      memories.splice(this.MAX_ITEMS)
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(memories))
  }
  
  // 搜索相关记忆
  searchRelevantMemories(query: string, context: PageContext): MemoryItem[] {
    const memories = this.getMemories()
    
    return memories
      .filter(memory => {
        // 上下文匹配
        const contextMatch = memory.context.route === context.route
        // 内容相似性（简单关键词匹配）
        const contentMatch = this.calculateSimilarity(query, memory.userMessage) > 0.3
        
        return contextMatch || contentMatch
      })
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 5)
  }
}
```

### 2. 后端向量记忆集成
```typescript
// 与现有的AI记忆服务集成
class VectorMemoryManager {
  async storeMemory(content: string, context: PageContext) {
    try {
      await aiMemoryApi.createMemory({
        content,
        context: JSON.stringify(context),
        userId: userStore.userInfo?.id,
        type: 'chat_interaction'
      })
    } catch (error) {
      console.error('向量记忆存储失败:', error)
    }
  }
  
  async searchSimilarMemories(query: string): Promise<string[]> {
    try {
      const response = await aiMemoryApi.searchMemories({
        query,
        limit: 3,
        threshold: 0.7
      })
      
      return response.data.map(item => item.content)
    } catch (error) {
      console.error('向量记忆搜索失败:', error)
      return []
    }
  }
}
```

## 🎨 UI/UX设计

### 1. 视觉设计
```scss
.ai-panel {
  width: 400px;
  height: 100vh;
  background: var(--bg-card);
  border-left: var(--border-primary);
  display: flex;
  flex-direction: column;
  
  // 玻璃态效果
  backdrop-filter: blur(16px);
  box-shadow: var(--shadow-lg);
  
  .ai-panel-header {
    padding: 1rem;
    border-bottom: var(--border-primary);
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .ai-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      color: var(--text-primary);
      
      .context-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--color-success);
        animation: pulse 2s infinite;
      }
    }
  }
  
  .ai-chat-area {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    
    .context-banner {
      background: var(--color-info-light);
      padding: 0.75rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      
      .permissions {
        color: var(--text-secondary);
        margin-left: auto;
      }
    }
    
    .message-item {
      margin-bottom: 1rem;
      
      &.user {
        .message-content {
          background: var(--color-primary);
          color: white;
          margin-left: 2rem;
          border-radius: 18px 18px 4px 18px;
        }
      }
      
      &.assistant {
        .message-content {
          background: var(--bg-secondary);
          color: var(--text-primary);
          margin-right: 2rem;
          border-radius: 18px 18px 18px 4px;
        }
      }
      
      .message-content {
        padding: 0.75rem 1rem;
        line-height: 1.5;
        word-wrap: break-word;
      }
      
      .message-time {
        font-size: 0.75rem;
        color: var(--text-secondary);
        margin-top: 0.25rem;
        text-align: right;
      }
    }
  }
  
  .ai-input-area {
    padding: 1rem;
    border-top: var(--border-primary);
    
    .quick-actions {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      flex-wrap: wrap;
      
      .el-button {
        font-size: 0.75rem;
        padding: 0.25rem 0.5rem;
      }
    }
    
    .input-wrapper {
      display: flex;
      gap: 0.5rem;
      align-items: flex-end;
      
      .el-textarea {
        flex: 1;
      }
    }
  }
}

// 头部AI按钮样式
.ai-toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
  
  &.active {
    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
    
    .ai-status-indicator {
      background: #00ff88;
    }
  }
  
  .ai-status-indicator {
    position: absolute;
    top: -2px;
    right: -2px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #ffd700;
    animation: pulse 2s infinite;
  }
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
```

## 🔄 集成流程

### 1. MainLayout.vue 修改
1. 添加AI面板状态管理
2. 修改布局结构为三栏
3. 集成头部AI按钮
4. 添加响应式适配

### 2. 路由监听
```typescript
// 在MainLayout中监听路由变化
watch(route, (newRoute) => {
  aiChatStore.updatePageContext(newRoute, userStore)
}, { immediate: true })
```

### 3. 权限集成
```typescript
// 确保AI功能的权限控制
const canUseAI = computed(() => {
  return userStore.hasPermission('AI_CHAT_ACCESS') || userStore.isAdmin
})
```

## 📱 响应式适配

### 1. 桌面端 (>1200px)
- 完整三栏布局
- AI面板固定400px宽度
- 支持拖拽调整宽度

### 2. 平板端 (768px-1200px)
- 三栏布局，AI面板350px
- 主内容区域自适应
- 保持所有功能

### 3. 移动端 (<768px)
- AI面板全屏覆盖
- 滑动手势支持
- 简化快捷操作

## 🚀 实施计划

### Phase 1: 基础布局 (1-2天)
- [ ] 修改MainLayout三栏布局
- [ ] 创建AIPanel基础组件
- [ ] 添加头部AI按钮

### Phase 2: 聊天功能 (2-3天)
- [ ] 实现聊天界面
- [ ] 集成AI接口调用
- [ ] 添加消息管理

### Phase 3: 上下文感知 (2天)
- [ ] 实现页面上下文获取
- [ ] 权限信息集成
- [ ] 智能建议功能

### Phase 4: 记忆系统 (2-3天)
- [ ] 本地记忆存储
- [ ] 向量记忆集成
- [ ] 记忆搜索功能

### Phase 5: 优化完善 (1-2天)
- [ ] 响应式适配
- [ ] 性能优化
- [ ] 用户体验优化

## 📋 技术要点

1. **状态持久化**: 面板状态、聊天记录本地存储
2. **性能优化**: 虚拟滚动、消息分页加载
3. **错误处理**: 网络异常、AI服务不可用的降级处理
4. **安全考虑**: 用户权限验证、敏感信息过滤
5. **可扩展性**: 插件化架构，支持未来功能扩展

这个设计充分利用了现有的技术栈和后端服务，实现了一个功能完整、用户体验优秀的AI聊天助手。
