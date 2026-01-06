# 🤖 AI助手功能前后端架构分析报告

## 📋 项目概述

### 系统定位
本项目是一个基于Vue 3 + Express.js的幼儿园管理系统，集成了先进的AI助手功能。AI助手作为系统的核心智能化组件，为用户提供自然语言交互、智能数据查询、页面操作指导等功能。

### 核心价值
- **智能化管理**: 通过AI助手简化复杂的管理操作
- **自然语言交互**: 用户可以用中文与系统对话
- **数据洞察**: AI自动分析数据并提供业务建议
- **操作指导**: 智能引导用户完成各种管理任务

## 🏗️ 整体架构设计

### 架构模式
采用**前后端分离 + 微服务化AI模块**的架构模式：

```
┌─────────────────────────────────────────────────────────────┐
│                    前端层 (Vue 3)                           │
├─────────────────────────────────────────────────────────────┤
│  AI助手组件  │  页面感知  │  智能路由  │  状态管理(Pinia)    │
└─────────────────────────────────────────────────────────────┘
                              │
                         HTTP/WebSocket
                              │
┌─────────────────────────────────────────────────────────────┐
│                   API网关层 (Express.js)                    │
├─────────────────────────────────────────────────────────────┤
│    路由分发    │    认证中间件    │    权限控制    │    CORS   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    AI服务层                                 │
├─────────────────────────────────────────────────────────────┤
│ 统一智能引擎 │ 模型管理 │ Function Calling │ 记忆系统      │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   数据持久层                                │
├─────────────────────────────────────────────────────────────┤
│    MySQL数据库    │    Redis缓存    │    文件存储           │
└─────────────────────────────────────────────────────────────┘
```

### 技术栈选择

#### 前端技术栈
- **框架**: Vue 3.5.14 + TypeScript
- **UI库**: Element Plus 2.3.1
- **状态管理**: Pinia 3.0.2
- **路由**: Vue Router 4.5.1
- **构建工具**: Vite 4.5.14
- **移动端**: Vant 4.9.19

#### 后端技术栈
- **框架**: Express.js 5.1.0 + TypeScript
- **ORM**: Sequelize 6.37.7
- **数据库**: MySQL 8.0
- **缓存**: Redis (通过模型缓存)
- **认证**: JWT + RBAC权限控制
- **文件处理**: Multer 2.0.1

#### AI集成技术栈
- **AI服务商**: 字节跳动豆包AI
- **主要模型**: 
  - `doubao-seed-1-6-thinking-250615` (思维链对话)
  - `doubao-seedream-3-0-t2i-250415` (文生图)
  - `doubao-seedance-1-0-pro-250528` (专业分析)
- **Function Calling**: 支持工具调用
- **向量搜索**: 记忆系统集成

## 🎯 核心组件设计

### 1. 统一智能决策中心
**位置**: `server/src/services/ai-operator/unified-intelligence.service.ts`

**核心功能**:
- **三级智能处理**: 直接响应(毫秒级) → 轻量级模型(秒级) → 完整AI处理
- **意图识别**: 自动识别用户请求类型
- **工具选择**: 智能选择最适合的处理工具
- **结果整合**: 统一封装和返回处理结果

**架构特点**:
```typescript
interface UnifiedIntelligenceResponse {
  success: boolean;
  data: {
    message: string;
    toolExecutions: ToolExecution[];
    uiComponents: UIComponent[];
    recommendations: string[];
    analysis: {
      intent: string;
      complexity: 'simple' | 'medium' | 'complex';
      complexityScore: number;
    }
  };
  metadata: {
    processingTime: number;
    modelUsed: string;
    tokensUsed: number;
  };
}
```

### 2. AI模型配置与缓存系统
**位置**: `server/src/services/ai-model-cache.service.ts`

**核心功能**:
- **模型配置管理**: 动态加载和管理AI模型配置
- **智能缓存**: 1小时缓存周期，自动更新
- **Fallback机制**: 数据库不可用时使用硬编码配置
- **模型选择**: 根据任务类型自动选择最适合的模型

**缓存策略**:
```typescript
class AIModelCacheService {
  private modelCache: Map<string, AIModelConfig> = new Map();
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1小时
  
  async getModelByName(modelName: string): Promise<AIModelConfig | null>
  async getDefaultModel(): Promise<AIModelConfig | null>
  async refreshCache(): Promise<void>
}
```

### 3. Function Calling工具系统
**位置**: `server/src/services/ai/tool-calling.service.ts`

**支持的工具类型**:
- **数据查询工具**: 智能SQL生成和执行
- **页面操作工具**: 自动化页面交互
- **业务分析工具**: 数据分析和报告生成
- **UI组件渲染**: 动态生成界面组件

**工具调用流程**:
```typescript
interface ToolFunction {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, any>;
    required: string[];
  };
}

interface ToolResult {
  name: string;
  status: "success" | "error";
  result: any;
  error?: string;
}
```

### 4. 六维记忆系统
**位置**: `server/src/services/memory/six-dimension-memory.service.ts`

**记忆维度**:
- **核心记忆**: 用户基本信息和偏好
- **情节记忆**: 具体事件和交互历史
- **语义记忆**: 知识和概念理解
- **程序记忆**: 操作技能和流程
- **工作记忆**: 当前会话上下文
- **元记忆**: 记忆管理和优化

**数据结构**:
```sql
-- 核心记忆表
CREATE TABLE core_memories (
  id UUID PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  persona_value TEXT NOT NULL,
  human_value TEXT NOT NULL,
  metadata JSON DEFAULT '{}'
);

-- 情节记忆表  
CREATE TABLE episodic_memories (
  id UUID PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(255) NOT NULL,
  summary TEXT NOT NULL,
  details TEXT NOT NULL,
  summary_embedding JSON,
  details_embedding JSON
);
```

## 🖥️ 前端AI组件架构

### 1. AI助手主组件
**位置**: `client/src/components/ai-assistant/AIAssistant.vue`

**组件特性**:
- **响应式设计**: 支持桌面端和移动端
- **实时对话**: WebSocket连接支持流式响应
- **多模态交互**: 文本、语音、图片支持
- **上下文感知**: 自动获取当前页面信息

**核心功能模块**:
```vue
<template>
  <div class="ai-assistant-container">
    <!-- AI助手头部 -->
    <div class="ai-header">
      <div class="function-tools-indicator">
        <span class="tools-count">12</span> <!-- 可用工具数量 -->
      </div>
    </div>
    
    <!-- 聊天消息区域 -->
    <div class="chat-area">
      <div class="message-list">
        <!-- 消息渲染 -->
      </div>
    </div>
    
    <!-- 输入区域 -->
    <div class="input-area">
      <!-- 快捷操作按钮 -->
      <!-- 文本输入框 -->
      <!-- 语音输入按钮 -->
    </div>
  </div>
</template>
```

### 2. 页面感知服务
**位置**: `client/src/services/page-awareness.service.ts`

**核心功能**:
- **路由监听**: 自动检测页面切换
- **上下文提取**: 获取当前页面的业务上下文
- **智能介绍**: 根据页面内容生成AI介绍
- **动态更新**: 实时更新AI助手的上下文信息

### 3. 智能路由服务
**位置**: `client/src/services/smart-router.service.ts`

**功能特点**:
- **意图识别**: 识别用户的导航意图
- **路由匹配**: 智能匹配目标页面
- **快速响应**: 毫秒级页面跳转
- **降级处理**: 失败时回退到AI服务

## 🔧 后端API架构

### 1. AI路由系统
**位置**: `server/src/routes/ai/index.ts`

**路由结构**:
```typescript
// 主要AI路由
router.use('/unified', unifiedIntelligenceRoutes);     // 统一智能系统
router.use('/models', modelRoutes);                    // 模型管理
router.use('/conversations', conversationRoutes);      // 对话管理
router.use('/memory', memoryRoutes);                   // 记忆系统
router.use('/smart-expert', smartExpertRoutes);       // 智能专家
router.use('/analytics', analyticsRoutes);            // AI分析
```

### 2. 统一智能接口
**端点**: `POST /api/ai/unified/unified-chat`

**请求格式**:
```json
{
  "message": "查询最近一个月的活动统计",
  "userId": "123",
  "context": {
    "pagePath": "/centers/activity",
    "role": "admin",
    "enableTools": true,
    "enableWebSearch": false
  }
}
```

**响应格式**:
```json
{
  "success": true,
  "data": {
    "message": "根据查询结果...",
    "toolExecutions": [
      {
        "toolName": "query_data",
        "parameters": {...},
        "result": {...}
      }
    ],
    "uiComponents": [...],
    "recommendations": [...]
  },
  "metadata": {
    "processingTime": 1250,
    "modelUsed": "doubao-seed-1-6-thinking-250615",
    "tokensUsed": 1024
  }
}
```

### 3. 权限控制中间件
**位置**: `server/src/middlewares/rbac.middleware.ts`

**权限级别**:
```typescript
enum PermissionLevel {
  READ = 'read',
  WRITE = 'write', 
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

const ROLE_PERMISSIONS = {
  admin: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.ADMIN],
  teacher: [PermissionLevel.READ, PermissionLevel.WRITE],
  parent: [PermissionLevel.READ]
};
```

## 📊 数据库设计

### 1. AI核心表结构

#### AI模型配置表 (ai_model_config)
```sql
CREATE TABLE ai_model_config (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  provider VARCHAR(100) NOT NULL,
  model_type ENUM('text', 'image', 'audio', 'multimodal'),
  endpoint_url TEXT NOT NULL,
  api_key VARCHAR(500) NOT NULL,
  model_parameters JSON,
  status ENUM('active', 'inactive', 'deprecated'),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### AI对话表 (ai_conversations)
```sql
CREATE TABLE ai_conversations (
  id VARCHAR(255) PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(500),
  summary TEXT,
  last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  message_count INT DEFAULT 0,
  is_archived BOOLEAN DEFAULT FALSE,
  -- 页面感知缓存字段
  last_page_path VARCHAR(255),
  page_context TEXT,
  last_page_update_at TIMESTAMP,
  used_memory_ids JSON
);
```

#### AI消息表 (ai_messages)
```sql
CREATE TABLE ai_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  conversation_id VARCHAR(255) NOT NULL,
  user_id INT,
  role ENUM('user', 'assistant', 'system', 'tool'),
  content TEXT NOT NULL,
  message_type ENUM('text', 'image', 'audio', 'tool_call', 'tool_result'),
  metadata JSON,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. AI查询系统表

#### AI查询历史表 (ai_query_history)
```sql
CREATE TABLE ai_query_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  query_text TEXT NOT NULL,
  query_hash VARCHAR(64) NOT NULL,
  query_type ENUM('data_query', 'ai_response'),
  response_data JSON,
  response_text TEXT,
  generated_sql TEXT,
  execution_time_ms INT,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT
);
```

#### AI查询缓存表 (ai_query_cache)
```sql
CREATE TABLE ai_query_cache (
  id INT PRIMARY KEY AUTO_INCREMENT,
  query_hash VARCHAR(64) NOT NULL UNIQUE,
  natural_query TEXT NOT NULL,
  context_hash VARCHAR(64) NOT NULL,
  generated_sql TEXT NOT NULL,
  result_data JSON NOT NULL,
  result_metadata JSON NOT NULL,
  hit_count INT DEFAULT 0,
  last_hit_at TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  is_valid BOOLEAN DEFAULT TRUE
);
```

### 3. 页面感知系统表

#### 页面指南表 (page_guides)
```sql
CREATE TABLE page_guides (
  id INT PRIMARY KEY AUTO_INCREMENT,
  page_path VARCHAR(255) NOT NULL UNIQUE,
  page_name VARCHAR(100) NOT NULL,
  page_description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  importance INT NOT NULL DEFAULT 5,
  related_tables JSON,
  context_prompt TEXT,
  is_active BOOLEAN DEFAULT TRUE
);
```

## 🔒 安全与权限机制

### 1. 认证体系
- **JWT Token**: 用户身份认证
- **Token刷新**: 自动续期机制
- **多端登录**: 支持同时多设备登录

### 2. 权限控制
- **RBAC模型**: 基于角色的访问控制
- **细粒度权限**: 页面级、功能级、数据级权限
- **动态权限**: 根据用户角色动态加载权限

### 3. AI安全机制
- **输入验证**: 防止恶意输入和注入攻击
- **输出过滤**: 敏感信息过滤和脱敏
- **访问限制**: API调用频率限制
- **审计日志**: 完整的操作日志记录

## ⚡ 性能优化策略

### 1. 缓存机制
- **模型缓存**: AI模型配置1小时缓存
- **查询缓存**: 相同查询结果缓存
- **页面缓存**: 页面感知信息缓存
- **Redis缓存**: 热点数据缓存

### 2. 响应优化
- **三级处理**: 直接响应 → 轻量级 → 完整处理
- **流式响应**: 支持Server-Sent Events
- **异步处理**: 长时间任务异步执行
- **并发控制**: 合理的并发限制

### 3. 资源管理
- **连接池**: 数据库连接池优化
- **内存管理**: 及时释放不用的资源
- **文件管理**: 临时文件自动清理
- **监控告警**: 资源使用监控

## 📈 系统监控与运维

### 1. 性能监控
- **响应时间**: API响应时间监控
- **错误率**: 系统错误率统计
- **资源使用**: CPU、内存、磁盘监控
- **AI调用**: 模型调用次数和成功率

### 2. 日志系统
- **结构化日志**: JSON格式日志
- **分级日志**: ERROR、WARN、INFO、DEBUG
- **日志轮转**: 自动日志文件轮转
- **日志分析**: 日志聚合和分析

### 3. 运维工具
- **健康检查**: `/api/ai/health` 端点
- **状态监控**: 系统状态实时监控
- **自动重启**: 异常情况自动恢复
- **备份策略**: 数据定期备份

---

## 📝 总结

本AI助手系统采用现代化的前后端分离架构，集成了先进的AI技术，具有以下特点：

### 🎯 技术优势
1. **模块化设计**: 高内聚、低耦合的组件设计
2. **智能化处理**: 三级智能处理机制，平衡性能和功能
3. **扩展性强**: 支持新AI模型和功能的快速集成
4. **用户体验**: 自然语言交互，降低使用门槛

### 🚀 创新特性
1. **统一智能引擎**: 集成多种AI能力的统一处理中心
2. **六维记忆系统**: 全面的用户记忆和上下文管理
3. **页面感知**: 智能感知用户当前操作环境
4. **Function Calling**: 支持AI主动调用系统功能

### 📊 业务价值
1. **效率提升**: 自动化处理减少人工操作
2. **决策支持**: AI分析提供数据洞察
3. **用户友好**: 自然语言交互降低学习成本
4. **智能化管理**: 全面提升幼儿园管理智能化水平

该架构为幼儿园管理系统提供了强大的AI能力支撑，实现了真正的智能化管理。

---

# 🖥️ 前端AI组件详细分析

## 1. AI助手主组件架构

### 组件层次结构
```
AIAssistant.vue (主组件)
├── AI助手头部区域
│   ├── 标题和状态指示器
│   ├── 功能工具计数器 (12个工具)
│   ├── 上下文感知指示器
│   └── 操作按钮组 (统计、会话列表)
├── 聊天消息区域
│   ├── 欢迎消息展示
│   ├── 消息列表渲染
│   ├── 打字机效果显示
│   ├── 工具调用结果展示
│   └── 思考过程可视化
├── 快捷操作区域
│   ├── 智能建议按钮
│   ├── 常用功能快捷键
│   ├── 页面操作指导
│   └── 数据查询模板
└── 输入交互区域
    ├── 文本输入框
    ├── 语音输入按钮
    ├── 发送控制逻辑
    └── 输入状态管理
```

### 核心状态管理
```typescript
// 主要响应式状态
const messages = ref<Message[]>([])           // 消息列表
const sending = ref(false)                    // 发送状态
const currentInput = ref('')                  // 当前输入
const autoExecute = ref(true)                 // 自动执行开关
const webSearch = ref(false)                  // 网络搜索开关
const currentPageContext = ref<any>({})       // 页面上下文
const conversations = ref<Conversation[]>([]) // 会话列表

// AI响应状态
const currentAIResponse = ref({
  visible: false,
  content: '',
  isThinking: false,
  thinkingText: '',
  isTyping: false
})

// 工具执行状态
const toolExecutions = ref<ToolExecution[]>([])
const showToolResults = ref(false)
```

### 智能路由集成
```typescript
// 前端智能路由处理
if (SmartRouterService.isNavigationRequest(messageContent)) {
  console.log('🎯 检测到页面跳转请求，优先使用前端智能路由处理')

  const routingThinkingText = `检测到页面跳转请求："${messageContent}"\n\n🚀 正在使用前端智能路由进行处理：\n1. 分析用户的导航意图\n2. 匹配本地页面路由表\n3. 执行页面跳转操作\n\n这样可以实现毫秒级响应，无需等待AI服务...`

  startCursorAIResponse()
  await showThinkingPhase(routingThinkingText)

  const navigationResult = await smartRouter.smartNavigate(messageContent)

  if (navigationResult) {
    const successText = `✅ 前端智能路由处理成功\n\n已为您完成页面跳转到：**${navigationResult}**\n\n⚡ 响应时间：<50ms（前端处理）\n💡 这比AI服务快约100倍！`
    await showFinalAnswer(successText)
    return
  }
}
```

## 2. 页面感知服务实现

### 自动上下文获取
```typescript
// 页面感知服务
class PageAwarenessService {
  // 监听路由变化
  watchRouteChanges() {
    watch(route, async (newRoute) => {
      await this.updatePageContext(newRoute.path)
      await this.notifyAIAssistant(newRoute)
    })
  }

  // 获取页面上下文
  async getPageContext(pagePath: string) {
    try {
      const response = await api.get(`/api/page-guides/context/${encodeURIComponent(pagePath)}`)
      return {
        pageName: response.data.pageName,
        pageDescription: response.data.pageDescription,
        relatedTables: response.data.relatedTables,
        contextPrompt: response.data.contextPrompt,
        sections: response.data.sections || []
      }
    } catch (error) {
      console.warn('获取页面上下文失败:', error)
      return null
    }
  }

  // 智能页面介绍
  async generatePageIntroduction(pageContext: any) {
    if (!pageContext) return null

    return {
      title: `📍 当前页面：${pageContext.pageName}`,
      description: pageContext.pageDescription,
      features: pageContext.sections.map(section => ({
        name: section.sectionName,
        description: section.sectionDescription,
        features: section.features
      })),
      suggestions: this.generateSmartSuggestions(pageContext)
    }
  }
}
```

### 智能建议生成
```typescript
// 根据页面上下文生成智能建议
generateSmartSuggestions(pageContext: any): string[] {
  const suggestions = []

  // 基于页面类型的建议
  if (pageContext.pagePath.includes('/centers/activity')) {
    suggestions.push(
      '查询最近一个月的活动统计',
      '创建新的活动计划',
      '查看活动参与情况分析',
      '生成活动效果报告'
    )
  } else if (pageContext.pagePath.includes('/centers/enrollment')) {
    suggestions.push(
      '查询招生进度统计',
      '分析招生渠道效果',
      '生成招生数据报告',
      '查看待处理的报名申请'
    )
  }

  // 基于用户角色的建议
  const userRole = userStore.userInfo?.role
  if (userRole === 'admin') {
    suggestions.push('查看系统整体运营数据', '生成管理决策报告')
  } else if (userRole === 'teacher') {
    suggestions.push('查看我的班级情况', '查询学生成长记录')
  }

  return suggestions
}
```

## 3. 状态管理架构

### Pinia Store设计
```typescript
// AI助手状态管理
export const useAIAssistantStore = defineStore('aiAssistant', {
  state: () => ({
    // 会话管理
    currentConversationId: null as string | null,
    conversations: [] as Conversation[],

    // 消息管理
    messages: [] as Message[],
    isLoading: false,

    // AI配置
    selectedModel: 'doubao-seed-1-6-thinking-250615',
    enableTools: true,
    enableWebSearch: false,

    // 页面感知
    currentPageContext: {} as any,
    pageIntroduction: null as any,

    // 工具执行
    toolExecutions: [] as ToolExecution[],
    showToolResults: false,

    // 性能统计
    responseStats: {
      averageResponseTime: 0,
      totalQueries: 0,
      successRate: 0
    }
  }),

  getters: {
    // 当前会话的消息
    currentMessages: (state) =>
      state.messages.filter(msg => msg.conversationId === state.currentConversationId),

    // 可用的AI模型
    availableModels: () => [
      { name: 'doubao-seed-1-6-thinking-250615', displayName: '豆包思维链模型' },
      { name: 'doubao-seedance-1-0-pro-250528', displayName: '豆包专业模型' }
    ],

    // 工具执行统计
    toolExecutionStats: (state) => ({
      totalExecutions: state.toolExecutions.length,
      successfulExecutions: state.toolExecutions.filter(t => t.status === 'success').length,
      failedExecutions: state.toolExecutions.filter(t => t.status === 'error').length
    })
  },

  actions: {
    // 发送消息
    async sendMessage(content: string, context?: any) {
      this.isLoading = true
      try {
        const response = await aiApi.sendMessage({
          message: content,
          conversationId: this.currentConversationId,
          context: { ...this.currentPageContext, ...context }
        })

        this.messages.push(...response.messages)
        this.toolExecutions.push(...response.toolExecutions)

        return response
      } finally {
        this.isLoading = false
      }
    },

    // 更新页面上下文
    async updatePageContext(pagePath: string) {
      const context = await pageAwarenessService.getPageContext(pagePath)
      this.currentPageContext = context || {}

      if (context) {
        this.pageIntroduction = await pageAwarenessService.generatePageIntroduction(context)
      }
    },

    // 创建新会话
    async createConversation(title?: string) {
      const conversation = await aiApi.createConversation({ title })
      this.conversations.unshift(conversation)
      this.currentConversationId = conversation.id
      return conversation
    }
  }
})
```

## 4. 用户交互界面设计

### 响应式布局
```scss
.ai-assistant-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--ai-bg-color);
  border-radius: 12px;
  overflow: hidden;

  // 移动端适配
  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 0;
    z-index: 1000;
  }

  .ai-header {
    padding: 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    .ai-title {
      display: flex;
      align-items: center;
      gap: 12px;

      .function-tools-indicator {
        display: flex;
        align-items: center;
        gap: 4px;
        background: rgba(255, 255, 255, 0.2);
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;

        .tools-count {
          font-weight: bold;
          color: #ffd700;
        }
      }
    }
  }

  .chat-area {
    flex: 1;
    overflow-y: auto;
    padding: 16px;

    .message-list {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .message-item {
        display: flex;
        gap: 12px;

        &.user {
          flex-direction: row-reverse;

          .message-content {
            background: #007bff;
            color: white;
            border-radius: 18px 18px 4px 18px;
          }
        }

        &.assistant {
          .message-content {
            background: #f8f9fa;
            border-radius: 18px 18px 18px 4px;

            // 打字机效果
            &.typing {
              position: relative;

              &::after {
                content: '|';
                animation: blink 1s infinite;
              }
            }
          }
        }
      }
    }
  }

  .quick-actions {
    padding: 12px 16px;
    border-top: 1px solid #e9ecef;

    .action-buttons {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;

      .action-btn {
        padding: 6px 12px;
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 16px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: #e9ecef;
          transform: translateY(-1px);
        }
      }
    }
  }

  .input-area {
    padding: 16px;
    border-top: 1px solid #e9ecef;

    .input-container {
      display: flex;
      gap: 8px;
      align-items: flex-end;

      .text-input {
        flex: 1;
        min-height: 40px;
        max-height: 120px;
        padding: 10px 16px;
        border: 1px solid #dee2e6;
        border-radius: 20px;
        resize: none;
        font-family: inherit;

        &:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }
      }

      .send-btn {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #007bff;
        color: white;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;

        &:hover:not(:disabled) {
          background: #0056b3;
          transform: scale(1.05);
        }

        &:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }
      }
    }
  }
}

// 打字机效果动画
@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

// 思考过程动画
@keyframes thinking {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.thinking-indicator {
  animation: thinking 1.5s ease-in-out infinite;
}
```

### 工具调用结果展示
```vue
<template>
  <div class="tool-execution-results" v-if="showToolResults">
    <div class="results-header">
      <h4>🔧 工具执行结果</h4>
      <el-button size="small" @click="showToolResults = false">收起</el-button>
    </div>

    <div class="results-list">
      <div
        v-for="execution in toolExecutions"
        :key="execution.id"
        class="execution-item"
        :class="{ success: execution.status === 'success', error: execution.status === 'error' }"
      >
        <div class="execution-header">
          <span class="tool-name">{{ execution.toolName }}</span>
          <span class="execution-time">{{ execution.executionTime }}ms</span>
          <el-tag :type="execution.status === 'success' ? 'success' : 'danger'" size="small">
            {{ execution.status }}
          </el-tag>
        </div>

        <div class="execution-details" v-if="execution.result">
          <!-- 数据查询结果 -->
          <div v-if="execution.toolName === 'query_data'" class="query-result">
            <el-table :data="execution.result.data" size="small" max-height="300">
              <el-table-column
                v-for="column in execution.result.columns"
                :key="column.name"
                :prop="column.name"
                :label="column.label"
                :width="column.width"
              />
            </el-table>
          </div>

          <!-- 页面操作结果 -->
          <div v-else-if="execution.toolName === 'navigate_to_page'" class="navigation-result">
            <p>✅ 已成功导航到：{{ execution.result.targetPage }}</p>
            <p>📍 页面路径：{{ execution.result.path }}</p>
          </div>

          <!-- 组件渲染结果 -->
          <div v-else-if="execution.toolName === 'render_component'" class="component-result">
            <component :is="execution.result.componentName" v-bind="execution.result.props" />
          </div>

          <!-- 通用结果展示 -->
          <div v-else class="generic-result">
            <pre>{{ JSON.stringify(execution.result, null, 2) }}</pre>
          </div>
        </div>

        <div class="execution-error" v-if="execution.error">
          <el-alert type="error" :title="execution.error" show-icon />
        </div>
      </div>
    </div>
  </div>
</template>
```

## 5. 性能优化实现

### 虚拟滚动优化
```typescript
// 大量消息的虚拟滚动实现
import { VirtualList } from '@tanstack/vue-virtual'

const virtualListProps = computed(() => ({
  height: chatAreaHeight.value,
  itemSize: (index: number) => messageHeights.value[index] || 80,
  items: messages.value,
  overscan: 5
}))

// 消息高度缓存
const messageHeights = ref<Record<number, number>>({})

const updateMessageHeight = (index: number, height: number) => {
  messageHeights.value[index] = height
}
```

### 防抖输入处理
```typescript
// 输入防抖，避免频繁触发
const debouncedInput = debounce((value: string) => {
  // 实时保存草稿
  saveDraft(value)

  // 智能建议更新
  updateSmartSuggestions(value)
}, 300)

watch(currentInput, debouncedInput)
```

### 懒加载会话历史
```typescript
// 会话历史懒加载
const loadMoreConversations = async () => {
  if (loadingMore.value || !hasMore.value) return

  loadingMore.value = true
  try {
    const response = await aiApi.getConversations({
      offset: conversations.value.length,
      limit: 20
    })

    conversations.value.push(...response.conversations)
    hasMore.value = response.hasMore
  } finally {
    loadingMore.value = false
  }
}

// 滚动到底部时自动加载
const { arrivedState } = useScroll(conversationListRef)
watch(() => arrivedState.bottom, (isBottom) => {
  if (isBottom) {
    loadMoreConversations()
  }
})
```

这个前端AI组件分析展示了一个完整的、现代化的AI助手前端实现，具有良好的用户体验、性能优化和可维护性。

---

# 🔧 后端AI服务详细分析

## 1. 服务层架构设计

### 核心服务模块
```
AI服务层架构
├── 统一智能服务 (UnifiedIntelligenceService)
│   ├── 意图识别引擎
│   ├── 复杂度评估器
│   ├── 工具选择器
│   └── 结果整合器
├── AI模型服务 (AIModelService)
│   ├── 模型配置管理
│   ├── 模型缓存系统
│   ├── 负载均衡器
│   └── 故障转移机制
├── 对话管理服务 (ConversationService)
│   ├── 会话生命周期管理
│   ├── 消息持久化
│   ├── 上下文维护
│   └── 历史记录管理
├── 记忆系统服务 (MemoryService)
│   ├── 六维记忆管理
│   ├── 向量相似度搜索
│   ├── 记忆优化算法
│   └── 记忆过期清理
└── 工具调用服务 (ToolCallingService)
    ├── Function Calling执行器
    ├── 工具注册中心
    ├── 参数验证器
    └── 结果格式化器
```

### 统一智能服务实现
```typescript
// 统一智能决策中心
export class UnifiedIntelligenceService {

  /**
   * 三级智能处理架构
   * Level 1: 直接响应 (毫秒级)
   * Level 2: 轻量级模型 (秒级)
   * Level 3: 完整AI处理 (多秒级)
   */
  async processRequest(request: UserRequest): Promise<IntelligenceResponse> {
    const startTime = Date.now()

    try {
      // ===== 第一级：直接响应检索 =====
      console.log('🚀 [Level-1] 尝试直接响应检索...')
      const action = this.extractActionFromQuery(request.content)
      if (action) {
        const directResponse = await directResponseService.executeDirectAction(action, request.content)
        if (directResponse.success) {
          console.log(`✅ [Level-1] 直接响应成功 - 耗时: ${directResponse.processingTime}ms`)
          return this.createSuccessResponse(directResponse, Date.now() - startTime)
        }
      }

      // ===== 第二级：提示词分级检索 =====
      console.log('🔍 [Level-2] 进行复杂度评估和分级检索...')
      const complexityResult = await this.evaluateQueryComplexity(request.content)
      console.log(`📊 [Level-2] 复杂度评估: ${complexityResult.level} (${complexityResult.score})`)

      if (complexityResult.level === 'simple' || complexityResult.level === 'medium') {
        const lightResponse = await this.processWithLightModel(request, complexityResult)
        if (lightResponse.success) {
          console.log(`✅ [Level-2] 轻量级处理成功`)
          return lightResponse
        }
      }

      // ===== 第三级：完整AI处理 =====
      console.log('🤖 [Level-3] 启动完整AI处理流程...')
      return await this.processWithFullAI(request)

    } catch (error) {
      console.error('❌ [UnifiedIntelligence] 处理失败:', error)
      return this.createErrorResponse(error as Error, Date.now() - startTime)
    }
  }

  /**
   * 复杂度评估算法
   */
  private async evaluateQueryComplexity(query: string): Promise<ComplexityResult> {
    const indicators = {
      // 长度指标
      length: query.length > 100 ? 0.3 : query.length / 100 * 0.3,

      // 关键词复杂度
      keywords: this.analyzeKeywordComplexity(query),

      // 语法复杂度
      syntax: this.analyzeSyntaxComplexity(query),

      // 领域专业度
      domain: this.analyzeDomainComplexity(query)
    }

    const totalScore = Object.values(indicators).reduce((sum, score) => sum + score, 0)

    let level: 'simple' | 'medium' | 'complex'
    if (totalScore < 0.3) level = 'simple'
    else if (totalScore < 0.7) level = 'medium'
    else level = 'complex'

    return {
      level,
      score: totalScore,
      indicators,
      reasoning: this.generateComplexityReasoning(indicators, level)
    }
  }

  /**
   * 智能工具选择器
   */
  private async selectOptimalTools(intent: string, context: any): Promise<ToolSelection[]> {
    const availableTools = await this.getAvailableTools()
    const selectedTools: ToolSelection[] = []

    // 基于意图的工具映射
    const intentToolMap = {
      'data_query': ['query_data', 'analyze_data', 'visualize_data'],
      'navigation': ['navigate_to_page', 'get_page_structure'],
      'task_management': ['create_todo_list', 'update_task_status'],
      'analysis': ['call_expert', 'generate_report'],
      'operation': ['render_component', 'execute_action']
    }

    const recommendedTools = intentToolMap[intent] || []

    for (const toolName of recommendedTools) {
      const tool = availableTools.find(t => t.name === toolName)
      if (tool && this.isToolApplicable(tool, context)) {
        selectedTools.push({
          tool,
          priority: this.calculateToolPriority(tool, intent, context),
          estimatedExecutionTime: this.estimateExecutionTime(tool, context)
        })
      }
    }

    // 按优先级排序
    return selectedTools.sort((a, b) => b.priority - a.priority)
  }
}
```

## 2. AI模型管理服务

### 模型配置管理
```typescript
// AI模型配置服务
export class AIModelConfigService {
  private static instance: AIModelConfigService
  private modelCache = new Map<string, AIModelConfig>()

  /**
   * 获取模型配置（支持缓存）
   */
  async getModelConfig(modelName: string): Promise<AIModelConfig | null> {
    // 检查缓存
    if (this.modelCache.has(modelName)) {
      const cached = this.modelCache.get(modelName)!
      if (this.isCacheValid(cached)) {
        return cached
      }
    }

    // 从数据库加载
    try {
      const model = await AIModelConfig.findOne({
        where: {
          name: modelName,
          status: ModelStatus.ACTIVE
        }
      })

      if (model) {
        this.modelCache.set(modelName, model)
        return model
      }
    } catch (error) {
      console.error('获取模型配置失败:', error)
    }

    // 使用fallback配置
    return this.getFallbackModel(modelName)
  }

  /**
   * 动态模型选择
   */
  async selectOptimalModel(task: AITask): Promise<AIModelConfig> {
    const candidates = await this.getAvailableModels(task.type)

    // 评估每个模型的适用性
    const evaluations = await Promise.all(
      candidates.map(async model => ({
        model,
        score: await this.evaluateModelFitness(model, task),
        cost: this.calculateCost(model, task),
        latency: this.estimateLatency(model, task)
      }))
    )

    // 综合评分选择最优模型
    const optimal = evaluations.reduce((best, current) => {
      const bestScore = this.calculateOverallScore(best)
      const currentScore = this.calculateOverallScore(current)
      return currentScore > bestScore ? current : best
    })

    console.log(`🎯 选择最优模型: ${optimal.model.name} (评分: ${optimal.score})`)
    return optimal.model
  }

  /**
   * 模型健康检查
   */
  async performHealthCheck(model: AIModelConfig): Promise<HealthCheckResult> {
    const startTime = Date.now()

    try {
      // 发送测试请求
      const testResponse = await axios.post(model.endpointUrl, {
        model: model.name,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10
      }, {
        headers: {
          'Authorization': `Bearer ${model.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      })

      const responseTime = Date.now() - startTime

      return {
        status: 'healthy',
        responseTime,
        lastChecked: new Date(),
        details: {
          statusCode: testResponse.status,
          hasValidResponse: !!testResponse.data
        }
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        lastChecked: new Date(),
        error: (error as Error).message,
        details: {
          errorType: error.constructor.name,
          statusCode: (error as any).response?.status
        }
      }
    }
  }
}
```

### 模型缓存系统
```typescript
// 高性能模型缓存服务
export class AIModelCacheService {
  private static instance: AIModelCacheService
  private cache: Map<ModelType, CachedModelData> = new Map()
  private readonly CACHE_DURATION = 60 * 60 * 1000 // 1小时
  private isUpdating: Set<ModelType> = new Set()

  static getInstance(): AIModelCacheService {
    if (!AIModelCacheService.instance) {
      AIModelCacheService.instance = new AIModelCacheService()
    }
    return AIModelCacheService.instance
  }

  /**
   * 获取指定类型的模型列表（带缓存）
   */
  async getModels(modelType: ModelType): Promise<AIModelConfig[]> {
    const cached = this.cache.get(modelType)
    const now = new Date()

    // 检查缓存是否有效
    if (cached && now < cached.expiresAt) {
      console.log(`🎯 使用缓存的${modelType}模型数据`)
      return cached.models
    }

    // 缓存过期，更新
    return await this.updateCache(modelType)
  }

  /**
   * 预热缓存
   */
  async warmupCache(): Promise<void> {
    console.log('🔥 开始预热AI模型缓存...')

    const modelTypes: ModelType[] = ['text', 'image', 'audio', 'multimodal']

    await Promise.all(
      modelTypes.map(async type => {
        try {
          await this.updateCache(type)
          console.log(`✅ ${type}模型缓存预热完成`)
        } catch (error) {
          console.error(`❌ ${type}模型缓存预热失败:`, error)
        }
      })
    )

    console.log('🎉 AI模型缓存预热完成')
  }

  /**
   * 智能缓存更新
   */
  private async updateCache(modelType: ModelType): Promise<AIModelConfig[]> {
    // 防止并发更新
    if (this.isUpdating.has(modelType)) {
      console.log(`⏳ ${modelType}模型缓存正在更新中，等待完成...`)
      await this.waitForUpdate(modelType)
      return this.cache.get(modelType)?.models || []
    }

    this.isUpdating.add(modelType)

    try {
      console.log(`🔄 更新${modelType}模型缓存...`)

      const models = await AIModelConfig.findAll({
        where: {
          modelType,
          status: ModelStatus.ACTIVE
        },
        order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
      })

      // 更新缓存
      this.cache.set(modelType, {
        models,
        cachedAt: new Date(),
        expiresAt: new Date(Date.now() + this.CACHE_DURATION)
      })

      console.log(`✅ ${modelType}模型缓存更新完成，共${models.length}个模型`)
      return models

    } finally {
      this.isUpdating.delete(modelType)
    }
  }
}
```

## 3. Function Calling工具系统

### 工具注册与管理
```typescript
// Function Calling工具调用服务
export class ToolCallingService {
  private registeredTools = new Map<string, ToolFunction>()

  constructor() {
    this.registerDefaultTools()
  }

  /**
   * 注册默认工具集
   */
  private registerDefaultTools(): void {
    // 数据查询工具
    this.registerTool({
      name: 'query_data',
      description: '执行数据库查询，支持自然语言转SQL',
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "自然语言查询描述" },
          tables: { type: "array", description: "涉及的数据表", items: { type: "string" } },
          filters: { type: "object", description: "查询过滤条件" }
        },
        required: ["query"]
      }
    })

    // 页面操作工具
    // 注意：navigate_to_page 已移除

    // UI组件渲染工具
    this.registerTool({
      name: 'render_component',
      description: '渲染UI组件',
      parameters: {
        type: "object",
        properties: {
          componentType: {
            type: "string",
            description: "组件类型",
            enum: ["chart", "table", "form", "card", "list"]
          },
          data: { type: "object", description: "组件数据" },
          config: { type: "object", description: "组件配置" }
        },
        required: ["componentType", "data"]
      }
    })

    // 任务管理工具
    this.registerTool({
      name: 'create_task_list',
      description: '创建任务列表',
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "任务列表标题" },
          tasks: {
            type: "array",
            description: "任务列表",
            items: {
              type: "object",
              properties: {
                title: { type: "string", description: "任务标题" },
                description: { type: "string", description: "任务描述" },
                priority: { type: "string", enum: ["high", "medium", "low"] },
                dueDate: { type: "string", description: "截止日期" }
              },
              required: ["title"]
            }
          }
        },
        required: ["title", "tasks"]
      }
    })
  }

  /**
   * 执行工具调用
   */
  async executeTool(functionCall: FunctionCall): Promise<ToolResult> {
    const { name, arguments: argsStr } = functionCall

    try {
      const args = JSON.parse(argsStr)
      console.log(`🔧 执行工具调用: ${name}`, args)

      const startTime = Date.now()
      let result: any

      switch (name) {
        case 'query_data':
          result = await this.executeDataQuery(args)
          break
        case 'navigate_to_page':
          result = await this.executeNavigation(args)
          break
        case 'render_component':
          result = await this.executeComponentRender(args)
          break
        case 'create_task_list':
          result = await this.executeTaskCreation(args)
          break
        default:
          throw new Error(`未知工具: ${name}`)
      }

      const executionTime = Date.now() - startTime

      return {
        name,
        status: "success",
        result,
        executionTime,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error(`❌ 工具调用失败: ${name}`, error)
      return {
        name,
        status: "error",
        result: null,
        error: (error as Error).message,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * 数据查询工具实现
   */
  private async executeDataQuery(args: any): Promise<any> {
    const { query, tables, filters } = args

    // 使用AI查询服务生成SQL
    const aiQueryService = new AIQueryService()
    const sqlResult = await aiQueryService.generateSQL(query, { tables, filters })

    if (!sqlResult.success) {
      throw new Error(`SQL生成失败: ${sqlResult.error}`)
    }

    // 执行SQL查询
    const queryResult = await aiQueryService.executeSQL(sqlResult.sql)

    return {
      query: query,
      generatedSQL: sqlResult.sql,
      data: queryResult.data,
      columns: queryResult.columns,
      totalRows: queryResult.totalRows,
      executionTime: queryResult.executionTime
    }
  }

  // 注意：页面导航工具已移除
}
```

## 4. 对话管理服务

### 会话生命周期管理
```typescript
// 对话管理服务
export class ConversationService {

  /**
   * 创建新会话
   */
  async createConversation(params: CreateConversationParams): Promise<AIConversation> {
    const conversationId = this.generateConversationId()

    const conversation = await AIConversation.create({
      id: conversationId,
      userId: params.userId,
      title: params.title || '新对话',
      summary: null,
      lastMessageAt: new Date(),
      messageCount: 0,
      isArchived: false,
      // 页面感知字段
      lastPagePath: params.context?.pagePath || null,
      pageContext: params.context ? JSON.stringify(params.context) : null,
      lastPageUpdateAt: new Date()
    })

    console.log(`✅ 创建新会话: ${conversationId}`)
    return conversation
  }

  /**
   * 添加消息到会话
   */
  async addMessage(conversationId: string, message: AddMessageParams): Promise<AIMessage> {
    const conversation = await this.getConversation(conversationId)
    if (!conversation) {
      throw new Error(`会话不存在: ${conversationId}`)
    }

    // 创建消息记录
    const aiMessage = await AIMessage.create({
      conversationId,
      userId: message.userId,
      role: message.role,
      content: message.content,
      messageType: message.messageType || 'text',
      metadata: message.metadata ? JSON.stringify(message.metadata) : null,
      isDeleted: false
    })

    // 更新会话统计
    await conversation.update({
      lastMessageAt: new Date(),
      messageCount: conversation.messageCount + 1,
      // 如果是用户消息且没有标题，生成标题
      title: conversation.title === '新对话' && message.role === 'user'
        ? this.generateConversationTitle(message.content)
        : conversation.title
    })

    // 异步更新会话摘要
    this.updateConversationSummary(conversationId).catch(console.error)

    return aiMessage
  }

  /**
   * 智能会话摘要生成
   */
  private async updateConversationSummary(conversationId: string): Promise<void> {
    try {
      const messages = await AIMessage.findAll({
        where: { conversationId, isDeleted: false },
        order: [['createdAt', 'ASC']],
        limit: 20 // 只取最近20条消息
      })

      if (messages.length < 3) return // 消息太少不生成摘要

      const conversationText = messages
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n')

      // 使用AI生成摘要
      const modelService = AIModelCacheService.getInstance()
      const model = await modelService.getModelByName('doubao-seed-1-6-thinking-250615')

      if (model) {
        const summaryResponse = await axios.post(model.endpointUrl, {
          model: model.name,
          messages: [
            {
              role: 'system',
              content: '请为以下对话生成一个简洁的摘要，不超过100字：'
            },
            {
              role: 'user',
              content: conversationText
            }
          ],
          max_tokens: 200,
          temperature: 0.3
        }, {
          headers: {
            'Authorization': `Bearer ${model.apiKey}`,
            'Content-Type': 'application/json'
          }
        })

        const summary = summaryResponse.data.choices[0]?.message?.content
        if (summary) {
          await AIConversation.update(
            { summary },
            { where: { id: conversationId } }
          )
        }
      }
    } catch (error) {
      console.error('更新会话摘要失败:', error)
    }
  }

  /**
   * 会话上下文优化
   */
  async optimizeConversationContext(conversationId: string): Promise<OptimizedContext> {
    const conversation = await this.getConversation(conversationId)
    if (!conversation) {
      throw new Error(`会话不存在: ${conversationId}`)
    }

    // 获取最近的消息
    const recentMessages = await AIMessage.findAll({
      where: { conversationId, isDeleted: false },
      order: [['createdAt', 'DESC']],
      limit: 10
    })

    // 获取相关记忆
    const memoryService = getMemorySystem()
    const relevantMemories = await memoryService.searchRelevantMemories(
      conversation.userId.toString(),
      recentMessages[0]?.content || '',
      { limit: 5 }
    )

    // 构建优化的上下文
    const optimizedContext = {
      conversationSummary: conversation.summary,
      recentMessages: recentMessages.reverse(), // 按时间正序
      relevantMemories,
      pageContext: conversation.pageContext ? JSON.parse(conversation.pageContext) : null,
      userPreferences: await this.getUserPreferences(conversation.userId),
      contextTokens: this.calculateContextTokens(recentMessages, relevantMemories)
    }

    return optimizedContext
  }
}
```

这个后端AI服务分析展示了一个完整的、可扩展的AI服务架构，具有良好的性能、可靠性和可维护性。

---

# 🤖 AI模型集成详细分析

## 1. 豆包AI模型集成架构

### 模型配置体系
```typescript
// 豆包AI模型配置
interface DoubaoModelConfig {
  // 基础配置
  name: string                    // 模型名称
  displayName: string            // 显示名称
  provider: 'bytedance_doubao'   // 提供商
  modelType: ModelType           // 模型类型

  // 连接配置
  endpointUrl: string            // API端点
  apiKey: string                 // API密钥
  apiVersion: string             // API版本

  // 模型参数
  modelParameters: {
    temperature?: number         // 温度参数 (0-1)
    maxTokens?: number          // 最大token数
    topP?: number               // Top-P采样
    topK?: number               // Top-K采样
    frequencyPenalty?: number   // 频率惩罚
    presencePenalty?: number    // 存在惩罚
    contextWindow?: number      // 上下文窗口大小
  }

  // 功能配置
  capabilities: string[]         // 支持的功能
  supportsFunctionCalling: boolean // 是否支持Function Calling
  supportsStreaming: boolean     // 是否支持流式输出
  supportsMultimodal: boolean    // 是否支持多模态

  // 状态配置
  status: ModelStatus           // 模型状态
  isDefault: boolean           // 是否为默认模型
  priority: number             // 优先级

  // 限制配置
  rateLimits: {
    requestsPerMinute: number   // 每分钟请求数限制
    tokensPerMinute: number     // 每分钟token数限制
    dailyQuota: number          // 每日配额
  }
}

// 当前集成的豆包模型
const DOUBAO_MODELS: DoubaoModelConfig[] = [
  {
    name: 'doubao-seed-1-6-thinking-250615',
    displayName: '豆包思维链模型 1.6',
    provider: 'bytedance_doubao',
    modelType: 'text',
    endpointUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    apiKey: process.env.DOUBAO_API_KEY,
    apiVersion: 'v3',
    modelParameters: {
      temperature: 0.7,
      maxTokens: 4000,
      topP: 0.9,
      contextWindow: 32000
    },
    capabilities: ['chat', 'function_calling', 'thinking_chain'],
    supportsFunctionCalling: true,
    supportsStreaming: true,
    supportsMultimodal: false,
    status: 'active',
    isDefault: true,
    priority: 10,
    rateLimits: {
      requestsPerMinute: 60,
      tokensPerMinute: 100000,
      dailyQuota: 1000000
    }
  },
  {
    name: 'doubao-seedream-3-0-t2i-250415',
    displayName: '豆包文生图模型 3.0',
    provider: 'bytedance_doubao',
    modelType: 'image',
    endpointUrl: 'https://ark.cn-beijing.volces.com/api/v3/images/generations',
    apiKey: process.env.DOUBAO_IMAGE_API_KEY,
    apiVersion: 'v3',
    modelParameters: {
      size: '1024x768',
      quality: 'standard',
      style: 'natural'
    },
    capabilities: ['text_to_image', 'image_generation'],
    supportsFunctionCalling: false,
    supportsStreaming: false,
    supportsMultimodal: true,
    status: 'active',
    isDefault: false,
    priority: 8,
    rateLimits: {
      requestsPerMinute: 10,
      tokensPerMinute: 0,
      dailyQuota: 100
    }
  },
  {
    name: 'doubao-seedance-1-0-pro-250528',
    displayName: '豆包专业分析模型',
    provider: 'bytedance_doubao',
    modelType: 'text',
    endpointUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    apiKey: process.env.DOUBAO_PRO_API_KEY,
    apiVersion: 'v3',
    modelParameters: {
      temperature: 0.3,
      maxTokens: 8000,
      topP: 0.95,
      contextWindow: 64000
    },
    capabilities: ['analysis', 'reasoning', 'professional_tasks'],
    supportsFunctionCalling: true,
    supportsStreaming: true,
    supportsMultimodal: false,
    status: 'active',
    isDefault: false,
    priority: 9,
    rateLimits: {
      requestsPerMinute: 30,
      tokensPerMinute: 50000,
      dailyQuota: 500000
    }
  }
]
```

### 智能模型选择器
```typescript
// 模型选择服务
export class ModelSelectorService {

  /**
   * 基于任务类型智能选择模型
   */
  async selectModelForTask(task: AITask): Promise<AIModelConfig> {
    const taskAnalysis = await this.analyzeTask(task)
    const availableModels = await this.getAvailableModels(task.type)

    // 模型评分算法
    const modelScores = await Promise.all(
      availableModels.map(async model => ({
        model,
        score: await this.calculateModelScore(model, taskAnalysis),
        reasoning: this.generateSelectionReasoning(model, taskAnalysis)
      }))
    )

    // 选择最高分模型
    const bestModel = modelScores.reduce((best, current) =>
      current.score > best.score ? current : best
    )

    console.log(`🎯 智能模型选择结果:`, {
      selectedModel: bestModel.model.name,
      score: bestModel.score,
      reasoning: bestModel.reasoning,
      alternatives: modelScores.filter(m => m !== bestModel).map(m => ({
        model: m.model.name,
        score: m.score
      }))
    })

    return bestModel.model
  }

  /**
   * 任务分析
   */
  private async analyzeTask(task: AITask): Promise<TaskAnalysis> {
    return {
      complexity: this.assessComplexity(task),
      domain: this.identifyDomain(task),
      outputType: this.determineOutputType(task),
      urgency: this.assessUrgency(task),
      resourceRequirements: this.estimateResourceRequirements(task),
      qualityRequirements: this.assessQualityRequirements(task)
    }
  }

  /**
   * 模型评分算法
   */
  private async calculateModelScore(
    model: AIModelConfig,
    analysis: TaskAnalysis
  ): Promise<number> {
    let score = 0

    // 能力匹配度 (40%)
    const capabilityScore = this.calculateCapabilityMatch(model, analysis)
    score += capabilityScore * 0.4

    // 性能指标 (25%)
    const performanceScore = await this.calculatePerformanceScore(model, analysis)
    score += performanceScore * 0.25

    // 成本效益 (20%)
    const costScore = this.calculateCostEfficiency(model, analysis)
    score += costScore * 0.2

    // 可用性 (10%)
    const availabilityScore = await this.calculateAvailabilityScore(model)
    score += availabilityScore * 0.1

    // 历史表现 (5%)
    const historyScore = await this.calculateHistoryScore(model, analysis.domain)
    score += historyScore * 0.05

    return Math.min(score, 1.0) // 确保分数不超过1
  }

  /**
   * 能力匹配度计算
   */
  private calculateCapabilityMatch(model: AIModelConfig, analysis: TaskAnalysis): number {
    const requiredCapabilities = this.getRequiredCapabilities(analysis)
    const modelCapabilities = new Set(model.capabilities)

    const matchCount = requiredCapabilities.filter(cap =>
      modelCapabilities.has(cap)
    ).length

    const matchRatio = matchCount / requiredCapabilities.length

    // 特殊能力加分
    let bonus = 0
    if (analysis.outputType === 'function_call' && model.supportsFunctionCalling) {
      bonus += 0.2
    }
    if (analysis.urgency === 'high' && model.supportsStreaming) {
      bonus += 0.1
    }

    return Math.min(matchRatio + bonus, 1.0)
  }
}
```

## 2. Function Calling深度集成

### Function Calling架构设计
```typescript
// Function Calling集成服务
export class FunctionCallingIntegrationService {

  /**
   * 豆包模型Function Calling调用
   */
  async callDoubaoWithFunctions(
    messages: ChatMessage[],
    functions: ToolFunction[],
    model: AIModelConfig
  ): Promise<FunctionCallingResponse> {

    const requestPayload = {
      model: model.name,
      messages: messages,
      tools: functions.map(func => ({
        type: 'function',
        function: {
          name: func.name,
          description: func.description,
          parameters: func.parameters
        }
      })),
      tool_choice: 'auto', // 让模型自动决定是否调用工具
      temperature: model.modelParameters?.temperature || 0.7,
      max_tokens: model.modelParameters?.maxTokens || 4000,
      top_p: model.modelParameters?.topP || 0.9
    }

    console.log('🔧 发送Function Calling请求到豆包模型:', {
      model: model.name,
      messageCount: messages.length,
      functionCount: functions.length,
      toolChoice: requestPayload.tool_choice
    })

    try {
      const response = await axios.post(model.endpointUrl, requestPayload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${model.apiKey}`
        },
        timeout: 60000
      })

      const choice = response.data.choices[0]
      const message = choice.message

      // 检查是否有工具调用
      if (message.tool_calls && message.tool_calls.length > 0) {
        console.log(`🎯 模型决定调用 ${message.tool_calls.length} 个工具`)

        // 执行工具调用
        const toolResults = await this.executeToolCalls(message.tool_calls)

        // 将工具结果添加到对话中
        const updatedMessages = [
          ...messages,
          message,
          ...toolResults.map(result => ({
            role: 'tool' as const,
            content: JSON.stringify(result.result),
            tool_call_id: result.toolCallId
          }))
        ]

        // 再次调用模型获取最终回复
        const finalResponse = await this.callDoubaoWithFunctions(
          updatedMessages,
          functions,
          model
        )

        return {
          message: finalResponse.message,
          toolCalls: message.tool_calls,
          toolResults: toolResults,
          usage: {
            promptTokens: response.data.usage.prompt_tokens + (finalResponse.usage?.promptTokens || 0),
            completionTokens: response.data.usage.completion_tokens + (finalResponse.usage?.completionTokens || 0),
            totalTokens: response.data.usage.total_tokens + (finalResponse.usage?.totalTokens || 0)
          }
        }
      } else {
        // 没有工具调用，直接返回回复
        console.log('💬 模型直接回复，未调用工具')
        return {
          message: message.content,
          toolCalls: [],
          toolResults: [],
          usage: {
            promptTokens: response.data.usage.prompt_tokens,
            completionTokens: response.data.usage.completion_tokens,
            totalTokens: response.data.usage.total_tokens
          }
        }
      }

    } catch (error) {
      console.error('❌ Function Calling调用失败:', error)
      throw new Error(`豆包模型调用失败: ${(error as Error).message}`)
    }
  }

  /**
   * 执行工具调用
   */
  private async executeToolCalls(toolCalls: any[]): Promise<ToolExecutionResult[]> {
    const results: ToolExecutionResult[] = []

    for (const toolCall of toolCalls) {
      const startTime = Date.now()

      try {
        console.log(`🔧 执行工具: ${toolCall.function.name}`)

        const toolResult = await this.executeSingleTool(
          toolCall.function.name,
          JSON.parse(toolCall.function.arguments)
        )

        results.push({
          toolCallId: toolCall.id,
          toolName: toolCall.function.name,
          result: toolResult,
          status: 'success',
          executionTime: Date.now() - startTime
        })

        console.log(`✅ 工具执行成功: ${toolCall.function.name} (${Date.now() - startTime}ms)`)

      } catch (error) {
        console.error(`❌ 工具执行失败: ${toolCall.function.name}`, error)

        results.push({
          toolCallId: toolCall.id,
          toolName: toolCall.function.name,
          result: null,
          status: 'error',
          error: (error as Error).message,
          executionTime: Date.now() - startTime
        })
      }
    }

    return results
  }

  /**
   * 执行单个工具
   */
  private async executeSingleTool(toolName: string, args: any): Promise<any> {
    const toolCallingService = new ToolCallingService()

    const result = await toolCallingService.executeTool({
      name: toolName,
      arguments: JSON.stringify(args)
    })

    if (result.status === 'error') {
      throw new Error(result.error || '工具执行失败')
    }

    return result.result
  }
}
```

### 工具定义与注册
```typescript
// 系统工具定义
export const SYSTEM_TOOLS: ToolFunction[] = [
  {
    name: 'query_database',
    description: '查询数据库获取业务数据，支持复杂的关联查询和统计分析',
    parameters: {
      type: "object",
      properties: {
        query_type: {
          type: "string",
          description: "查询类型",
          enum: ["student_info", "activity_stats", "enrollment_data", "teacher_performance", "financial_report"]
        },
        filters: {
          type: "object",
          description: "查询过滤条件",
          properties: {
            date_range: {
              type: "object",
              properties: {
                start_date: { type: "string", format: "date" },
                end_date: { type: "string", format: "date" }
              }
            },
            class_id: { type: "integer", description: "班级ID" },
            teacher_id: { type: "integer", description: "教师ID" },
            status: { type: "string", description: "状态筛选" }
          }
        },
        aggregation: {
          type: "object",
          description: "聚合统计配置",
          properties: {
            group_by: { type: "array", items: { type: "string" } },
            metrics: { type: "array", items: { type: "string" } },
            sort_by: { type: "string" },
            limit: { type: "integer", minimum: 1, maximum: 1000 }
          }
        }
      },
      required: ["query_type"]
    }
  },

  {
    name: 'generate_visualization',
    description: '根据数据生成可视化图表，支持多种图表类型',
    parameters: {
      type: "object",
      properties: {
        chart_type: {
          type: "string",
          description: "图表类型",
          enum: ["line", "bar", "pie", "scatter", "heatmap", "radar"]
        },
        data: {
          type: "array",
          description: "图表数据",
          items: { type: "object" }
        },
        config: {
          type: "object",
          description: "图表配置",
          properties: {
            title: { type: "string", description: "图表标题" },
            x_axis: { type: "string", description: "X轴字段" },
            y_axis: { type: "string", description: "Y轴字段" },
            color_field: { type: "string", description: "颜色分组字段" },
            theme: { type: "string", enum: ["light", "dark"], default: "light" }
          }
        }
      },
      required: ["chart_type", "data"]
    }
  },

  {
    name: 'create_smart_report',
    description: '基于数据分析结果创建智能报告',
    parameters: {
      type: "object",
      properties: {
        report_type: {
          type: "string",
          description: "报告类型",
          enum: ["daily_summary", "weekly_analysis", "monthly_report", "custom_analysis"]
        },
        data_sources: {
          type: "array",
          description: "数据源列表",
          items: { type: "string" }
        },
        analysis_focus: {
          type: "array",
          description: "分析重点",
          items: {
            type: "string",
            enum: ["trends", "anomalies", "comparisons", "predictions", "recommendations"]
          }
        },
        output_format: {
          type: "string",
          description: "输出格式",
          enum: ["markdown", "html", "pdf", "json"],
          default: "markdown"
        }
      },
      required: ["report_type", "data_sources"]
    }
  },

  {
    name: 'execute_page_action',
    description: '执行页面操作，如导航、表单填写、按钮点击等',
    parameters: {
      type: "object",
      properties: {
        action_type: {
          type: "string",
          description: "操作类型",
          enum: ["navigate", "click", "input", "select", "submit", "screenshot"]
        },
        target: {
          type: "object",
          description: "操作目标",
          properties: {
            page_path: { type: "string", description: "目标页面路径" },
            element_selector: { type: "string", description: "元素选择器" },
            element_text: { type: "string", description: "元素文本" }
          }
        },
        parameters: {
          type: "object",
          description: "操作参数",
          properties: {
            input_value: { type: "string", description: "输入值" },
            select_option: { type: "string", description: "选择选项" },
            wait_time: { type: "integer", description: "等待时间(ms)" }
          }
        }
      },
      required: ["action_type", "target"]
    }
  }
]
```

## 3. 模型性能监控与优化

### 性能监控系统
```typescript
// AI模型性能监控服务
export class AIModelMonitoringService {
  private metricsCollector = new Map<string, ModelMetrics>()

  /**
   * 记录模型调用指标
   */
  async recordModelCall(
    modelName: string,
    callData: ModelCallData
  ): Promise<void> {
    const metrics = this.metricsCollector.get(modelName) || this.initializeMetrics(modelName)

    // 更新指标
    metrics.totalCalls++
    metrics.totalTokens += callData.tokensUsed
    metrics.totalLatency += callData.responseTime
    metrics.averageLatency = metrics.totalLatency / metrics.totalCalls

    if (callData.success) {
      metrics.successfulCalls++
    } else {
      metrics.failedCalls++
      metrics.errors.push({
        timestamp: new Date(),
        error: callData.error,
        context: callData.context
      })
    }

    metrics.successRate = metrics.successfulCalls / metrics.totalCalls
    metrics.lastUpdated = new Date()

    this.metricsCollector.set(modelName, metrics)

    // 异步持久化到数据库
    this.persistMetrics(modelName, metrics).catch(console.error)

    // 检查是否需要告警
    this.checkAlerts(modelName, metrics)
  }

  /**
   * 获取模型性能报告
   */
  async getPerformanceReport(
    modelName?: string,
    timeRange?: TimeRange
  ): Promise<PerformanceReport> {
    const models = modelName
      ? [modelName]
      : Array.from(this.metricsCollector.keys())

    const reports = await Promise.all(
      models.map(async name => {
        const metrics = await this.getModelMetrics(name, timeRange)
        return {
          modelName: name,
          metrics,
          analysis: await this.analyzeModelPerformance(metrics),
          recommendations: await this.generateRecommendations(metrics)
        }
      })
    )

    return {
      timestamp: new Date(),
      timeRange,
      models: reports,
      summary: this.generateSummary(reports)
    }
  }

  /**
   * 模型性能分析
   */
  private async analyzeModelPerformance(metrics: ModelMetrics): Promise<PerformanceAnalysis> {
    const analysis: PerformanceAnalysis = {
      healthStatus: 'healthy',
      issues: [],
      strengths: [],
      trends: await this.analyzeTrends(metrics)
    }

    // 成功率分析
    if (metrics.successRate < 0.95) {
      analysis.healthStatus = 'warning'
      analysis.issues.push({
        type: 'low_success_rate',
        severity: metrics.successRate < 0.9 ? 'high' : 'medium',
        description: `成功率较低: ${(metrics.successRate * 100).toFixed(1)}%`,
        recommendation: '检查API配置和网络连接'
      })
    } else {
      analysis.strengths.push('高成功率')
    }

    // 延迟分析
    if (metrics.averageLatency > 5000) {
      analysis.healthStatus = 'warning'
      analysis.issues.push({
        type: 'high_latency',
        severity: metrics.averageLatency > 10000 ? 'high' : 'medium',
        description: `平均延迟较高: ${metrics.averageLatency}ms`,
        recommendation: '考虑优化请求参数或切换到更快的模型'
      })
    } else if (metrics.averageLatency < 2000) {
      analysis.strengths.push('低延迟响应')
    }

    // Token使用分析
    const avgTokensPerCall = metrics.totalTokens / metrics.totalCalls
    if (avgTokensPerCall > 3000) {
      analysis.issues.push({
        type: 'high_token_usage',
        severity: 'low',
        description: `平均Token使用量较高: ${avgTokensPerCall.toFixed(0)}`,
        recommendation: '优化提示词长度和上下文管理'
      })
    }

    return analysis
  }

  /**
   * 自动优化建议
   */
  private async generateRecommendations(metrics: ModelMetrics): Promise<OptimizationRecommendation[]> {
    const recommendations: OptimizationRecommendation[] = []

    // 基于性能指标的建议
    if (metrics.averageLatency > 3000) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        title: '优化响应时间',
        description: '当前平均响应时间较长，建议采取以下措施：',
        actions: [
          '减少输入token数量',
          '使用更轻量级的模型',
          '启用流式输出',
          '优化网络连接'
        ],
        expectedImpact: '响应时间可减少30-50%'
      })
    }

    if (metrics.successRate < 0.95) {
      recommendations.push({
        type: 'reliability',
        priority: 'high',
        title: '提高调用成功率',
        description: '检测到较多失败请求，建议：',
        actions: [
          '检查API密钥有效性',
          '实现重试机制',
          '添加熔断器',
          '监控API配额使用情况'
        ],
        expectedImpact: '成功率可提升至98%以上'
      })
    }

    // 基于使用模式的建议
    const peakHours = this.identifyPeakUsageHours(metrics)
    if (peakHours.length > 0) {
      recommendations.push({
        type: 'optimization',
        priority: 'medium',
        title: '负载均衡优化',
        description: `检测到高峰使用时段: ${peakHours.join(', ')}`,
        actions: [
          '在高峰期启用缓存',
          '预热常用查询结果',
          '考虑使用多个API密钥轮换',
          '实现请求队列管理'
        ],
        expectedImpact: '高峰期性能提升20-30%'
      })
    }

    return recommendations
  }
}
```

这个AI模型集成分析展示了一个完整的、企业级的AI模型集成方案，具有良好的性能监控、自动优化和故障处理能力。

---

# 🗄️ 数据库设计详细分析

## 1. AI核心数据表设计

### AI模型配置表 (ai_model_config)
```sql
CREATE TABLE `ai_model_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL UNIQUE COMMENT '模型名称，如 doubao-seed-1-6-thinking-250615',
  `display_name` varchar(255) NOT NULL COMMENT '显示名称，如 豆包思维链模型',
  `provider` varchar(100) NOT NULL COMMENT '提供商，如 bytedance_doubao',
  `model_type` enum('text','image','audio','multimodal') NOT NULL COMMENT '模型类型',
  `api_version` varchar(50) DEFAULT 'v1' COMMENT 'API版本',
  `endpoint_url` text NOT NULL COMMENT 'API端点URL',
  `api_key` varchar(500) NOT NULL COMMENT 'API密钥',

  -- 模型参数配置
  `model_parameters` json DEFAULT NULL COMMENT '模型参数配置',
  /*
  模型参数JSON结构示例:
  {
    "temperature": 0.7,
    "maxTokens": 4000,
    "topP": 0.9,
    "topK": 50,
    "frequencyPenalty": 0,
    "presencePenalty": 0,
    "contextWindow": 32000
  }
  */

  -- 功能配置
  `capabilities` json DEFAULT NULL COMMENT '支持的功能列表',
  /*
  功能列表JSON结构示例:
  ["chat", "function_calling", "thinking_chain", "analysis"]
  */

  `supports_function_calling` boolean DEFAULT FALSE COMMENT '是否支持Function Calling',
  `supports_streaming` boolean DEFAULT FALSE COMMENT '是否支持流式输出',
  `supports_multimodal` boolean DEFAULT FALSE COMMENT '是否支持多模态',

  -- 状态管理
  `status` enum('active','inactive','deprecated','maintenance') DEFAULT 'active',
  `is_default` boolean DEFAULT FALSE COMMENT '是否为默认模型',
  `priority` int(11) DEFAULT 5 COMMENT '优先级，数值越大优先级越高',

  -- 限制配置
  `rate_limits` json DEFAULT NULL COMMENT '速率限制配置',
  /*
  速率限制JSON结构示例:
  {
    "requestsPerMinute": 60,
    "tokensPerMinute": 100000,
    "dailyQuota": 1000000
  }
  */

  -- 监控字段
  `last_health_check` timestamp NULL COMMENT '最后健康检查时间',
  `health_status` enum('healthy','warning','unhealthy') DEFAULT 'healthy',
  `total_calls` bigint DEFAULT 0 COMMENT '总调用次数',
  `successful_calls` bigint DEFAULT 0 COMMENT '成功调用次数',
  `average_response_time` decimal(8,2) DEFAULT 0 COMMENT '平均响应时间(ms)',

  -- 时间戳
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_model_name` (`name`),
  KEY `idx_provider` (`provider`),
  KEY `idx_model_type` (`model_type`),
  KEY `idx_status` (`status`),
  KEY `idx_is_default` (`is_default`),
  KEY `idx_priority` (`priority`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI模型配置表';
```

### AI对话表 (ai_conversations)
```sql
CREATE TABLE `ai_conversations` (
  `id` varchar(255) NOT NULL COMMENT '会话ID，UUID格式',
  `user_id` int(11) NOT NULL COMMENT '用户ID，关联users表',
  `title` varchar(500) DEFAULT NULL COMMENT '会话标题',
  `summary` text DEFAULT NULL COMMENT '会话摘要，AI自动生成',

  -- 消息统计
  `message_count` int(11) DEFAULT 0 COMMENT '消息数量',
  `last_message_at` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '最后消息时间',

  -- 页面感知缓存字段 (性能优化)
  `last_page_path` varchar(255) DEFAULT NULL COMMENT '最后访问的页面路径',
  `page_context` text DEFAULT NULL COMMENT '页面上下文信息JSON',
  `last_page_update_at` timestamp NULL COMMENT '页面上下文最后更新时间',
  `used_memory_ids` json DEFAULT NULL COMMENT '已使用的记忆ID列表',

  -- 会话配置
  `model_config` json DEFAULT NULL COMMENT '会话使用的模型配置',
  /*
  模型配置JSON结构示例:
  {
    "primaryModel": "doubao-seed-1-6-thinking-250615",
    "fallbackModel": "doubao-seedance-1-0-pro-250528",
    "enableFunctionCalling": true,
    "enableWebSearch": false,
    "temperature": 0.7
  }
  */

  -- 状态管理
  `is_archived` boolean DEFAULT FALSE COMMENT '是否已归档',
  `is_pinned` boolean DEFAULT FALSE COMMENT '是否置顶',
  `tags` json DEFAULT NULL COMMENT '会话标签',

  -- 统计信息
  `total_tokens_used` bigint DEFAULT 0 COMMENT '总Token使用量',
  `total_cost` decimal(10,4) DEFAULT 0 COMMENT '总成本',
  `average_response_time` decimal(8,2) DEFAULT 0 COMMENT '平均响应时间',

  -- 时间戳
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_last_message_at` (`last_message_at`),
  KEY `idx_is_archived` (`is_archived`),
  KEY `idx_is_pinned` (`is_pinned`),
  KEY `idx_created_at` (`created_at`),

  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI对话会话表';
```

### AI消息表 (ai_messages)
```sql
CREATE TABLE `ai_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `conversation_id` varchar(255) NOT NULL COMMENT '会话ID',
  `user_id` int(11) DEFAULT NULL COMMENT '用户ID，系统消息时为NULL',
  `role` enum('user','assistant','system','tool') NOT NULL COMMENT '消息角色',
  `content` longtext NOT NULL COMMENT '消息内容',

  -- 消息类型和格式
  `message_type` enum('text','image','audio','tool_call','tool_result','thinking') DEFAULT 'text',
  `content_format` enum('plain','markdown','html','json') DEFAULT 'plain',

  -- 工具调用相关
  `tool_calls` json DEFAULT NULL COMMENT '工具调用信息',
  /*
  工具调用JSON结构示例:
  [
    {
      "id": "call_123",
      "type": "function",
      "function": {
        "name": "query_data",
        "arguments": "{\"query\": \"查询学生信息\"}"
      }
    }
  ]
  */

  `tool_call_id` varchar(255) DEFAULT NULL COMMENT '工具调用ID，用于tool角色消息',

  -- 元数据
  `metadata` json DEFAULT NULL COMMENT '消息元数据',
  /*
  元数据JSON结构示例:
  {
    "model": "doubao-seed-1-6-thinking-250615",
    "tokensUsed": 150,
    "responseTime": 1200,
    "temperature": 0.7,
    "functionCallsExecuted": 2,
    "pageContext": "/centers/activity"
  }
  */

  -- 状态管理
  `is_deleted` boolean DEFAULT FALSE COMMENT '是否已删除',
  `is_edited` boolean DEFAULT FALSE COMMENT '是否已编辑',
  `edit_history` json DEFAULT NULL COMMENT '编辑历史',

  -- 质量评估
  `quality_score` decimal(3,2) DEFAULT NULL COMMENT '消息质量评分 0-1',
  `user_feedback` enum('positive','negative','neutral') DEFAULT NULL COMMENT '用户反馈',
  `feedback_reason` varchar(500) DEFAULT NULL COMMENT '反馈原因',

  -- 时间戳
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_conversation_id` (`conversation_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_role` (`role`),
  KEY `idx_message_type` (`message_type`),
  KEY `idx_is_deleted` (`is_deleted`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_tool_call_id` (`tool_call_id`),

  FOREIGN KEY (`conversation_id`) REFERENCES `ai_conversations` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI消息表';
```

## 2. 六维记忆系统数据表

### 核心记忆表 (core_memories)
```sql
CREATE TABLE `core_memories` (
  `id` varchar(36) NOT NULL COMMENT '记忆ID，UUID格式',
  `user_id` varchar(255) NOT NULL COMMENT '用户ID',

  -- 人格记忆 (Persona Memory)
  `persona_value` text NOT NULL DEFAULT '' COMMENT 'AI助手的人格特征和行为模式',
  `persona_limit` int(11) DEFAULT 2000 COMMENT '人格记忆字符限制',

  -- 人类记忆 (Human Memory)
  `human_value` text NOT NULL DEFAULT '' COMMENT '用户的个人信息、偏好和特征',
  `human_limit` int(11) DEFAULT 2000 COMMENT '人类记忆字符限制',

  -- 元数据
  `metadata` json DEFAULT '{}' COMMENT '记忆元数据',
  /*
  元数据JSON结构示例:
  {
    "importance": 0.8,
    "lastAccessed": "2024-01-15T10:30:00Z",
    "accessCount": 15,
    "source": "conversation",
    "tags": ["preference", "behavior", "context"]
  }
  */

  -- 时间戳
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_id` (`user_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='核心记忆表';
```

### 情节记忆表 (episodic_memories)
```sql
CREATE TABLE `episodic_memories` (
  `id` varchar(36) NOT NULL COMMENT '记忆ID，UUID格式',
  `user_id` varchar(255) NOT NULL COMMENT '用户ID',
  `event_type` varchar(255) NOT NULL COMMENT '事件类型',
  `summary` text NOT NULL COMMENT '事件摘要',
  `details` text NOT NULL COMMENT '事件详细信息',
  `actor` enum('user','assistant','system') NOT NULL COMMENT '事件主体',

  -- 记忆层次结构
  `tree_path` json NOT NULL DEFAULT '[]' COMMENT '记忆树路径',
  /*
  树路径JSON结构示例:
  ["conversation_123", "topic_education", "subtopic_enrollment"]
  */

  -- 时间信息
  `occurred_at` timestamp NOT NULL COMMENT '事件发生时间',

  -- 向量嵌入 (用于相似度搜索)
  `summary_embedding` json DEFAULT NULL COMMENT '摘要向量嵌入',
  `details_embedding` json DEFAULT NULL COMMENT '详情向量嵌入',

  -- 重要性和衰减
  `importance` decimal(3,2) DEFAULT 0.5 COMMENT '重要性评分 0-1',
  `decay_factor` decimal(3,2) DEFAULT 1.0 COMMENT '衰减因子',
  `last_accessed` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '最后访问时间',
  `access_count` int(11) DEFAULT 0 COMMENT '访问次数',

  -- 关联信息
  `related_memories` json DEFAULT NULL COMMENT '相关记忆ID列表',
  `conversation_id` varchar(255) DEFAULT NULL COMMENT '关联的对话ID',
  `message_id` int(11) DEFAULT NULL COMMENT '关联的消息ID',

  -- 时间戳
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_event_type` (`event_type`),
  KEY `idx_occurred_at` (`occurred_at`),
  KEY `idx_importance` (`importance`),
  KEY `idx_last_accessed` (`last_accessed`),
  KEY `idx_conversation_id` (`conversation_id`),
  KEY `idx_message_id` (`message_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='情节记忆表';
```

### 语义记忆表 (semantic_memories)
```sql
CREATE TABLE `semantic_memories` (
  `id` varchar(36) NOT NULL COMMENT '记忆ID，UUID格式',
  `user_id` varchar(255) NOT NULL COMMENT '用户ID',
  `concept` varchar(500) NOT NULL COMMENT '概念或知识点',
  `definition` text NOT NULL COMMENT '定义或解释',
  `category` varchar(100) NOT NULL COMMENT '知识分类',

  -- 知识结构
  `parent_concepts` json DEFAULT NULL COMMENT '父概念列表',
  `child_concepts` json DEFAULT NULL COMMENT '子概念列表',
  `related_concepts` json DEFAULT NULL COMMENT '相关概念列表',

  -- 向量嵌入
  `concept_embedding` json DEFAULT NULL COMMENT '概念向量嵌入',
  `definition_embedding` json DEFAULT NULL COMMENT '定义向量嵌入',

  -- 知识质量
  `confidence` decimal(3,2) DEFAULT 0.5 COMMENT '置信度 0-1',
  `source_reliability` decimal(3,2) DEFAULT 0.5 COMMENT '来源可靠性 0-1',
  `verification_status` enum('unverified','verified','disputed') DEFAULT 'unverified',

  -- 使用统计
  `usage_count` int(11) DEFAULT 0 COMMENT '使用次数',
  `last_used` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT '最后使用时间',

  -- 来源信息
  `source_type` enum('conversation','document','web','manual') NOT NULL COMMENT '来源类型',
  `source_reference` text DEFAULT NULL COMMENT '来源引用',

  -- 时间戳
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_concept` (`concept`),
  KEY `idx_category` (`category`),
  KEY `idx_confidence` (`confidence`),
  KEY `idx_last_used` (`last_used`),
  KEY `idx_source_type` (`source_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='语义记忆表';
```

## 3. AI查询系统数据表

### AI查询历史表 (ai_query_history)
```sql
CREATE TABLE `ai_query_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT '用户ID',
  `query_text` text NOT NULL COMMENT '查询内容',
  `query_hash` varchar(64) NOT NULL COMMENT '查询内容的MD5哈希值',
  `query_type` enum('data_query','ai_response','function_call') NOT NULL COMMENT '查询类型',

  -- 查询结果
  `response_data` json DEFAULT NULL COMMENT '查询结果数据',
  `response_text` text DEFAULT NULL COMMENT 'AI回答文本',
  `generated_sql` text DEFAULT NULL COMMENT '生成的SQL语句',

  -- 执行信息
  `execution_time_ms` int(11) DEFAULT NULL COMMENT '执行时间(毫秒)',
  `tokens_used` int(11) DEFAULT NULL COMMENT '使用的Token数量',
  `model_used` varchar(255) DEFAULT NULL COMMENT '使用的AI模型',

  -- 状态和质量
  `success` boolean DEFAULT TRUE COMMENT '是否执行成功',
  `error_message` text DEFAULT NULL COMMENT '错误信息',
  `quality_score` decimal(3,2) DEFAULT NULL COMMENT '结果质量评分',
  `user_rating` tinyint DEFAULT NULL COMMENT '用户评分 1-5',

  -- 上下文信息
  `context_data` json DEFAULT NULL COMMENT '查询上下文',
  /*
  上下文JSON结构示例:
  {
    "pagePath": "/centers/activity",
    "userRole": "admin",
    "sessionId": "session_123",
    "previousQueries": ["query1", "query2"],
    "relatedTables": ["activities", "students"]
  }
  */

  -- 缓存信息
  `cache_hit` boolean DEFAULT FALSE COMMENT '是否命中缓存',
  `cache_key` varchar(255) DEFAULT NULL COMMENT '缓存键',

  -- 时间戳
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_query_hash` (`query_hash`),
  KEY `idx_query_type` (`query_type`),
  KEY `idx_success` (`success`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_cache_key` (`cache_key`),

  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI查询历史表';
```

### AI查询缓存表 (ai_query_cache)
```sql
CREATE TABLE `ai_query_cache` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `query_hash` varchar(64) NOT NULL UNIQUE COMMENT '查询哈希值',
  `natural_query` text NOT NULL COMMENT '自然语言查询',
  `context_hash` varchar(64) NOT NULL COMMENT '上下文哈希值',
  `generated_sql` text NOT NULL COMMENT '生成的SQL语句',

  -- 缓存结果
  `result_data` json NOT NULL COMMENT '查询结果数据',
  `result_metadata` json NOT NULL COMMENT '结果元数据',
  /*
  结果元数据JSON结构示例:
  {
    "totalRows": 150,
    "columnsInfo": [
      {"name": "student_name", "type": "varchar", "description": "学生姓名"},
      {"name": "class_name", "type": "varchar", "description": "班级名称"}
    ],
    "executionTime": 250,
    "warnings": []
  }
  */

  -- 缓存统计
  `hit_count` int(11) DEFAULT 0 COMMENT '命中次数',
  `last_hit_at` timestamp NULL COMMENT '最后命中时间',

  -- 缓存管理
  `expires_at` timestamp NOT NULL COMMENT '过期时间',
  `is_valid` boolean DEFAULT TRUE COMMENT '是否有效',
  `invalidation_reason` varchar(255) DEFAULT NULL COMMENT '失效原因',

  -- 质量指标
  `accuracy_score` decimal(3,2) DEFAULT NULL COMMENT '准确性评分',
  `performance_score` decimal(3,2) DEFAULT NULL COMMENT '性能评分',

  -- 时间戳
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_query_context` (`query_hash`, `context_hash`),
  KEY `idx_expires_at` (`expires_at`),
  KEY `idx_is_valid` (`is_valid`),
  KEY `idx_hit_count` (`hit_count`),
  KEY `idx_last_hit_at` (`last_hit_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI查询缓存表';
```

## 4. 页面感知系统数据表

### 页面指南表 (page_guides)
```sql
CREATE TABLE `page_guides` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `page_path` varchar(255) NOT NULL UNIQUE COMMENT '页面路径',
  `page_name` varchar(100) NOT NULL COMMENT '页面名称',
  `page_description` text NOT NULL COMMENT '页面详细描述',
  `category` varchar(50) NOT NULL COMMENT '页面分类',

  -- 重要性和优先级
  `importance` int(11) NOT NULL DEFAULT 5 COMMENT '页面重要性 1-10',
  `priority` int(11) DEFAULT 5 COMMENT '显示优先级',

  -- 关联信息
  `related_tables` json NOT NULL COMMENT '页面相关的数据库表',
  /*
  相关表JSON结构示例:
  [
    {"table": "activities", "description": "活动数据表", "operations": ["read", "write"]},
    {"table": "students", "description": "学生信息表", "operations": ["read"]}
  ]
  */

  `parent_pages` json DEFAULT NULL COMMENT '父页面列表',
  `child_pages` json DEFAULT NULL COMMENT '子页面列表',

  -- AI上下文
  `context_prompt` text DEFAULT NULL COMMENT 'AI上下文提示词',
  `smart_suggestions` json DEFAULT NULL COMMENT '智能建议列表',
  /*
  智能建议JSON结构示例:
  [
    {"text": "查询最近一个月的活动统计", "type": "query", "priority": 10},
    {"text": "创建新的活动计划", "type": "action", "priority": 8}
  ]
  */

  -- 权限控制
  `required_permissions` json DEFAULT NULL COMMENT '访问所需权限',
  `role_restrictions` json DEFAULT NULL COMMENT '角色限制',

  -- 使用统计
  `visit_count` int(11) DEFAULT 0 COMMENT '访问次数',
  `last_visited` timestamp NULL COMMENT '最后访问时间',
  `avg_stay_time` int(11) DEFAULT 0 COMMENT '平均停留时间(秒)',

  -- 状态管理
  `is_active` boolean DEFAULT TRUE COMMENT '是否启用',
  `is_featured` boolean DEFAULT FALSE COMMENT '是否为特色页面',

  -- 时间戳
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_page_path` (`page_path`),
  KEY `idx_category` (`category`),
  KEY `idx_importance` (`importance`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_visit_count` (`visit_count`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='页面指南表';
```

这个数据库设计分析展示了一个完整的、可扩展的AI系统数据存储方案，具有良好的性能、一致性和可维护性。

---

# 🎯 AI功能特性详细分析

## 1. 智能对话系统

### 多轮对话管理
```typescript
// 对话上下文管理器
export class ConversationContextManager {
  private contextWindow = 32000 // Token限制
  private maxMessages = 20      // 最大消息数

  /**
   * 智能上下文优化
   * 根据重要性和相关性动态调整上下文内容
   */
  async optimizeContext(
    conversationId: string,
    currentQuery: string
  ): Promise<OptimizedContext> {

    // 1. 获取会话历史
    const conversation = await this.getConversation(conversationId)
    const messages = await this.getRecentMessages(conversationId, this.maxMessages)

    // 2. 计算消息重要性
    const messageImportance = await Promise.all(
      messages.map(async msg => ({
        message: msg,
        importance: await this.calculateMessageImportance(msg, currentQuery),
        tokenCount: this.estimateTokenCount(msg.content)
      }))
    )

    // 3. 智能筛选消息
    const selectedMessages = this.selectOptimalMessages(
      messageImportance,
      this.contextWindow * 0.7 // 为新消息预留30%空间
    )

    // 4. 获取相关记忆
    const memoryService = getMemorySystem()
    const relevantMemories = await memoryService.searchRelevantMemories(
      conversation.userId.toString(),
      currentQuery,
      { limit: 5, threshold: 0.7 }
    )

    // 5. 构建优化上下文
    return {
      conversationSummary: conversation.summary,
      selectedMessages: selectedMessages.map(item => item.message),
      relevantMemories,
      pageContext: this.parsePageContext(conversation.pageContext),
      userProfile: await this.getUserProfile(conversation.userId),
      totalTokens: selectedMessages.reduce((sum, item) => sum + item.tokenCount, 0)
    }
  }

  /**
   * 消息重要性计算
   */
  private async calculateMessageImportance(
    message: AIMessage,
    currentQuery: string
  ): Promise<number> {
    let importance = 0.5 // 基础重要性

    // 时间衰减 (越新越重要)
    const ageInHours = (Date.now() - message.createdAt.getTime()) / (1000 * 60 * 60)
    const timeDecay = Math.exp(-ageInHours / 24) // 24小时半衰期
    importance += timeDecay * 0.2

    // 角色权重
    const roleWeights = {
      'user': 0.8,      // 用户消息很重要
      'assistant': 0.6, // AI回复中等重要
      'system': 0.3,    // 系统消息较低重要性
      'tool': 0.4       // 工具结果中等重要性
    }
    importance += roleWeights[message.role] * 0.3

    // 内容相关性 (与当前查询的相似度)
    const similarity = await this.calculateSimilarity(message.content, currentQuery)
    importance += similarity * 0.3

    // 工具调用加分
    if (message.toolCalls && message.toolCalls.length > 0) {
      importance += 0.2
    }

    // 用户反馈加分
    if (message.userFeedback === 'positive') {
      importance += 0.1
    } else if (message.userFeedback === 'negative') {
      importance -= 0.1
    }

    return Math.max(0, Math.min(1, importance))
  }
}
```

### 智能意图识别
```typescript
// 意图识别服务
export class IntentRecognitionService {
  private intentPatterns = new Map<string, IntentPattern[]>()

  constructor() {
    this.initializeIntentPatterns()
  }

  /**
   * 识别用户意图
   */
  async recognizeIntent(query: string, context?: any): Promise<IntentResult> {
    const normalizedQuery = this.normalizeQuery(query)

    // 1. 基于规则的快速识别
    const ruleBasedResult = this.recognizeByRules(normalizedQuery)
    if (ruleBasedResult.confidence > 0.8) {
      return ruleBasedResult
    }

    // 2. 基于AI的深度识别
    const aiBasedResult = await this.recognizeByAI(query, context)

    // 3. 结果融合
    return this.fuseResults(ruleBasedResult, aiBasedResult)
  }

  /**
   * 初始化意图模式
   */
  private initializeIntentPatterns(): void {
    // 数据查询意图
    this.intentPatterns.set('data_query', [
      {
        patterns: [/查询|查看|统计|分析|报告/g, /数据|信息|情况|状态/g],
        keywords: ['学生', '教师', '活动', '招生', '财务', '班级'],
        confidence: 0.9
      },
      {
        patterns: [/多少|几个|数量|总计/g],
        keywords: ['人数', '次数', '金额', '比例'],
        confidence: 0.85
      }
    ])

    // 页面导航意图
    this.intentPatterns.set('navigation', [
      {
        patterns: [/打开|进入|跳转|导航|去/g, /页面|界面|模块|中心/g],
        keywords: ['活动中心', '招生管理', '学生管理', '教师管理'],
        confidence: 0.95
      },
      {
        patterns: [/回到|返回|退出/g],
        keywords: ['首页', '上一页', '主页'],
        confidence: 0.9
      }
    ])

    // 操作执行意图
    this.intentPatterns.set('operation', [
      {
        patterns: [/创建|新建|添加|录入/g],
        keywords: ['活动', '学生', '教师', '班级', '计划'],
        confidence: 0.9
      },
      {
        patterns: [/修改|编辑|更新|变更/g],
        keywords: ['信息', '资料', '状态', '设置'],
        confidence: 0.85
      },
      {
        patterns: [/删除|移除|取消/g],
        keywords: ['记录', '数据', '文件'],
        confidence: 0.8
      }
    ])

    // 分析建议意图
    this.intentPatterns.set('analysis', [
      {
        patterns: [/分析|评估|建议|推荐/g],
        keywords: ['趋势', '效果', '改进', '优化', '策略'],
        confidence: 0.85
      },
      {
        patterns: [/预测|预估|展望/g],
        keywords: ['招生', '发展', '需求', '风险'],
        confidence: 0.8
      }
    ])

    // 帮助支持意图
    this.intentPatterns.set('help', [
      {
        patterns: [/帮助|协助|指导|教程/g],
        keywords: ['如何', '怎么', '操作', '使用'],
        confidence: 0.9
      },
      {
        patterns: [/问题|错误|故障|异常/g],
        keywords: ['解决', '修复', '处理'],
        confidence: 0.85
      }
    ])
  }

  /**
   * 基于规则的意图识别
   */
  private recognizeByRules(query: string): IntentResult {
    let bestMatch: IntentResult = {
      intent: 'unknown',
      confidence: 0,
      entities: [],
      reasoning: '未匹配到明确意图'
    }

    for (const [intent, patterns] of this.intentPatterns) {
      for (const pattern of patterns) {
        let score = 0
        let matchedPatterns = 0
        let matchedKeywords = 0

        // 检查模式匹配
        for (const regex of pattern.patterns) {
          if (regex.test(query)) {
            matchedPatterns++
            score += 0.4
          }
        }

        // 检查关键词匹配
        for (const keyword of pattern.keywords) {
          if (query.includes(keyword)) {
            matchedKeywords++
            score += 0.3
          }
        }

        // 计算最终置信度
        const confidence = Math.min(
          score * pattern.confidence,
          pattern.confidence
        )

        if (confidence > bestMatch.confidence) {
          bestMatch = {
            intent,
            confidence,
            entities: this.extractEntities(query, pattern.keywords),
            reasoning: `匹配模式: ${matchedPatterns}, 关键词: ${matchedKeywords}`,
            matchDetails: {
              matchedPatterns,
              matchedKeywords,
              totalPatterns: pattern.patterns.length,
              totalKeywords: pattern.keywords.length
            }
          }
        }
      }
    }

    return bestMatch
  }

  /**
   * 基于AI的意图识别
   */
  private async recognizeByAI(query: string, context?: any): Promise<IntentResult> {
    try {
      const modelService = AIModelCacheService.getInstance()
      const model = await modelService.getModelByName('doubao-seed-1-6-thinking-250615')

      if (!model) {
        throw new Error('AI模型不可用')
      }

      const prompt = this.buildIntentRecognitionPrompt(query, context)

      const response = await axios.post(model.endpointUrl, {
        model: model.name,
        messages: [
          { role: 'system', content: prompt.system },
          { role: 'user', content: prompt.user }
        ],
        temperature: 0.3,
        max_tokens: 500
      }, {
        headers: {
          'Authorization': `Bearer ${model.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      const result = JSON.parse(response.data.choices[0].message.content)

      return {
        intent: result.intent,
        confidence: result.confidence,
        entities: result.entities || [],
        reasoning: result.reasoning,
        aiGenerated: true
      }

    } catch (error) {
      console.error('AI意图识别失败:', error)
      return {
        intent: 'unknown',
        confidence: 0,
        entities: [],
        reasoning: 'AI识别失败',
        error: (error as Error).message
      }
    }
  }
}
```

## 2. Function Calling工具调用

### 智能工具选择
```typescript
// 工具选择策略
export class ToolSelectionStrategy {

  /**
   * 基于意图和上下文选择最优工具组合
   */
  async selectOptimalTools(
    intent: IntentResult,
    context: any,
    availableTools: ToolFunction[]
  ): Promise<ToolSelectionResult> {

    const selections: ToolSelection[] = []

    // 根据意图类型选择工具
    switch (intent.intent) {
      case 'data_query':
        selections.push(...await this.selectDataQueryTools(intent, context, availableTools))
        break

      case 'navigation':
        selections.push(...await this.selectNavigationTools(intent, context, availableTools))
        break

      case 'operation':
        selections.push(...await this.selectOperationTools(intent, context, availableTools))
        break

      case 'analysis':
        selections.push(...await this.selectAnalysisTools(intent, context, availableTools))
        break

      default:
        selections.push(...await this.selectGeneralTools(intent, context, availableTools))
    }

    // 工具依赖性分析
    const optimizedSelections = await this.optimizeToolDependencies(selections)

    // 执行顺序优化
    const orderedSelections = this.optimizeExecutionOrder(optimizedSelections)

    return {
      selectedTools: orderedSelections,
      totalEstimatedTime: orderedSelections.reduce((sum, sel) => sum + sel.estimatedTime, 0),
      confidence: this.calculateOverallConfidence(orderedSelections),
      reasoning: this.generateSelectionReasoning(intent, orderedSelections)
    }
  }

  /**
   * 数据查询工具选择
   */
  private async selectDataQueryTools(
    intent: IntentResult,
    context: any,
    availableTools: ToolFunction[]
  ): Promise<ToolSelection[]> {
    const selections: ToolSelection[] = []

    // 主查询工具
    const queryTool = availableTools.find(tool => tool.name === 'query_database')
    if (queryTool) {
      selections.push({
        tool: queryTool,
        priority: 10,
        estimatedTime: 2000,
        parameters: this.buildQueryParameters(intent, context),
        reasoning: '执行数据库查询获取基础数据'
      })
    }

    // 数据可视化工具
    if (this.shouldGenerateVisualization(intent, context)) {
      const vizTool = availableTools.find(tool => tool.name === 'generate_visualization')
      if (vizTool) {
        selections.push({
          tool: vizTool,
          priority: 8,
          estimatedTime: 1500,
          dependsOn: ['query_database'],
          parameters: this.buildVisualizationParameters(intent, context),
          reasoning: '基于查询结果生成可视化图表'
        })
      }
    }

    // 智能分析工具
    if (this.shouldPerformAnalysis(intent, context)) {
      const analysisTool = availableTools.find(tool => tool.name === 'create_smart_report')
      if (analysisTool) {
        selections.push({
          tool: analysisTool,
          priority: 6,
          estimatedTime: 3000,
          dependsOn: ['query_database'],
          parameters: this.buildAnalysisParameters(intent, context),
          reasoning: '对查询结果进行深度分析和报告生成'
        })
      }
    }

    return selections
  }

  /**
   * 工具依赖性优化
   */
  private async optimizeToolDependencies(
    selections: ToolSelection[]
  ): Promise<ToolSelection[]> {
    // 构建依赖图
    const dependencyGraph = this.buildDependencyGraph(selections)

    // 检查循环依赖
    const cycles = this.detectCycles(dependencyGraph)
    if (cycles.length > 0) {
      console.warn('检测到工具循环依赖:', cycles)
      // 移除导致循环的工具
      return this.resolveCycles(selections, cycles)
    }

    // 拓扑排序
    const sortedSelections = this.topologicalSort(selections, dependencyGraph)

    // 并行执行优化
    return this.optimizeParallelExecution(sortedSelections)
  }

  /**
   * 执行顺序优化
   */
  private optimizeExecutionOrder(selections: ToolSelection[]): ToolSelection[] {
    // 按优先级和依赖关系排序
    return selections.sort((a, b) => {
      // 首先按依赖关系排序
      if (a.dependsOn?.includes(b.tool.name)) return 1
      if (b.dependsOn?.includes(a.tool.name)) return -1

      // 然后按优先级排序
      return b.priority - a.priority
    })
  }
}
```

### 工具执行引擎
```typescript
// 工具执行引擎
export class ToolExecutionEngine {
  private executionQueue = new Map<string, ToolExecution>()
  private results = new Map<string, ToolResult>()

  /**
   * 批量执行工具
   */
  async executeBatch(
    selections: ToolSelection[],
    progressCallback?: (progress: ExecutionProgress) => void
  ): Promise<BatchExecutionResult> {

    const startTime = Date.now()
    const totalTools = selections.length
    let completedTools = 0

    const results: ToolExecutionResult[] = []
    const errors: ToolExecutionError[] = []

    try {
      // 按执行顺序处理工具
      for (const selection of selections) {
        const executionId = this.generateExecutionId()

        // 更新进度
        progressCallback?.({
          currentTool: selection.tool.name,
          completedTools,
          totalTools,
          progress: completedTools / totalTools,
          estimatedTimeRemaining: this.estimateRemainingTime(selections, completedTools)
        })

        try {
          // 检查依赖
          await this.waitForDependencies(selection.dependsOn || [])

          // 执行工具
          const result = await this.executeSingleTool(
            executionId,
            selection,
            progressCallback
          )

          results.push(result)
          this.results.set(selection.tool.name, result)
          completedTools++

        } catch (error) {
          const executionError: ToolExecutionError = {
            toolName: selection.tool.name,
            error: (error as Error).message,
            timestamp: new Date(),
            parameters: selection.parameters,
            stackTrace: (error as Error).stack
          }

          errors.push(executionError)

          // 根据错误处理策略决定是否继续
          if (this.shouldStopOnError(selection, error as Error)) {
            break
          }
        }
      }

      // 最终进度更新
      progressCallback?.({
        currentTool: 'completed',
        completedTools: totalTools,
        totalTools,
        progress: 1,
        estimatedTimeRemaining: 0
      })

      return {
        success: errors.length === 0,
        results,
        errors,
        executionTime: Date.now() - startTime,
        summary: this.generateExecutionSummary(results, errors)
      }

    } catch (error) {
      return {
        success: false,
        results,
        errors: [...errors, {
          toolName: 'batch_execution',
          error: (error as Error).message,
          timestamp: new Date()
        }],
        executionTime: Date.now() - startTime,
        summary: '批量执行失败'
      }
    }
  }

  /**
   * 执行单个工具
   */
  private async executeSingleTool(
    executionId: string,
    selection: ToolSelection,
    progressCallback?: (progress: ExecutionProgress) => void
  ): Promise<ToolExecutionResult> {

    const startTime = Date.now()

    // 创建执行记录
    const execution: ToolExecution = {
      id: executionId,
      toolName: selection.tool.name,
      parameters: selection.parameters,
      status: 'running',
      startTime: new Date(),
      estimatedDuration: selection.estimatedTime
    }

    this.executionQueue.set(executionId, execution)

    try {
      console.log(`🔧 开始执行工具: ${selection.tool.name}`)

      // 参数验证
      this.validateParameters(selection.tool, selection.parameters)

      // 执行工具逻辑
      let result: any
      switch (selection.tool.name) {
        case 'query_database':
          result = await this.executeQueryDatabase(selection.parameters, progressCallback)
          break

        case 'generate_visualization':
          result = await this.executeGenerateVisualization(selection.parameters, progressCallback)
          break

        case 'create_smart_report':
          result = await this.executeCreateSmartReport(selection.parameters, progressCallback)
          break

        case 'execute_page_action':
          result = await this.executePageAction(selection.parameters, progressCallback)
          break

        default:
          throw new Error(`未知工具: ${selection.tool.name}`)
      }

      const executionTime = Date.now() - startTime

      // 更新执行记录
      execution.status = 'completed'
      execution.endTime = new Date()
      execution.actualDuration = executionTime
      execution.result = result

      console.log(`✅ 工具执行成功: ${selection.tool.name} (${executionTime}ms)`)

      return {
        toolName: selection.tool.name,
        status: 'success',
        result,
        executionTime,
        parameters: selection.parameters,
        metadata: {
          executionId,
          estimatedTime: selection.estimatedTime,
          actualTime: executionTime,
          efficiency: selection.estimatedTime / executionTime
        }
      }

    } catch (error) {
      const executionTime = Date.now() - startTime

      // 更新执行记录
      execution.status = 'failed'
      execution.endTime = new Date()
      execution.actualDuration = executionTime
      execution.error = (error as Error).message

      console.error(`❌ 工具执行失败: ${selection.tool.name}`, error)

      throw error
    }
  }
}
```

这个AI功能特性分析展示了一个完整的、智能化的AI助手功能实现，具有强大的意图识别、工具调用和执行管理能力。

---

# 🔒 安全与权限控制详细分析

## 1. 用户认证与授权体系

### JWT认证机制
```typescript
// JWT认证服务
export class JWTAuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
  private readonly JWT_EXPIRES_IN = '24h'
  private readonly REFRESH_TOKEN_EXPIRES_IN = '7d'

  /**
   * 生成访问令牌
   */
  generateAccessToken(user: User): string {
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      permissions: user.permissions,
      // AI系统特定字段
      aiEnabled: user.aiEnabled || false,
      aiQuotaLimit: user.aiQuotaLimit || 1000,
      aiModelAccess: user.aiModelAccess || ['basic']
    }

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
      issuer: 'kindergarten-ai-system',
      audience: 'ai-assistant-users'
    })
  }

  /**
   * 生成刷新令牌
   */
  generateRefreshToken(userId: number): string {
    const payload = {
      userId,
      type: 'refresh',
      timestamp: Date.now()
    }

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN
    })
  }

  /**
   * 验证访问令牌
   */
  verifyAccessToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as JWTPayload

      // 检查令牌是否即将过期 (30分钟内)
      const expirationTime = decoded.exp * 1000
      const thirtyMinutes = 30 * 60 * 1000

      if (expirationTime - Date.now() < thirtyMinutes) {
        console.log('令牌即将过期，建议刷新')
      }

      return decoded
    } catch (error) {
      console.error('令牌验证失败:', error)
      return null
    }
  }

  /**
   * 令牌刷新
   */
  async refreshToken(refreshToken: string): Promise<TokenRefreshResult> {
    try {
      const decoded = jwt.verify(refreshToken, this.JWT_SECRET) as any

      if (decoded.type !== 'refresh') {
        throw new Error('无效的刷新令牌类型')
      }

      // 获取用户信息
      const user = await User.findByPk(decoded.userId)
      if (!user) {
        throw new Error('用户不存在')
      }

      // 检查用户状态
      if (user.status !== 'active') {
        throw new Error('用户账户已被禁用')
      }

      // 生成新的访问令牌
      const newAccessToken = this.generateAccessToken(user)
      const newRefreshToken = this.generateRefreshToken(user.id)

      return {
        success: true,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: this.JWT_EXPIRES_IN
      }

    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      }
    }
  }
}
```

### RBAC权限控制
```typescript
// 基于角色的访问控制 (RBAC)
export enum Role {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  PRINCIPAL = 'principal',
  TEACHER = 'teacher',
  PARENT = 'parent',
  STUDENT = 'student'
}

export enum PermissionLevel {
  READ = 'read',
  WRITE = 'write',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

// AI系统特定权限
export enum AIPermission {
  AI_CHAT = 'ai_chat',
  AI_QUERY = 'ai_query',
  AI_FUNCTION_CALL = 'ai_function_call',
  AI_MODEL_CONFIG = 'ai_model_config',
  AI_MEMORY_ACCESS = 'ai_memory_access',
  AI_ANALYTICS = 'ai_analytics',
  AI_ADMIN = 'ai_admin'
}

// 角色权限映射
export const ROLE_PERMISSIONS: Record<Role, PermissionLevel[]> = {
  [Role.SUPER_ADMIN]: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.ADMIN, PermissionLevel.SUPER_ADMIN],
  [Role.ADMIN]: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.ADMIN],
  [Role.PRINCIPAL]: [PermissionLevel.READ, PermissionLevel.WRITE],
  [Role.TEACHER]: [PermissionLevel.READ, PermissionLevel.WRITE],
  [Role.PARENT]: [PermissionLevel.READ],
  [Role.STUDENT]: [PermissionLevel.READ]
}

// AI权限映射
export const AI_ROLE_PERMISSIONS: Record<Role, AIPermission[]> = {
  [Role.SUPER_ADMIN]: [
    AIPermission.AI_CHAT,
    AIPermission.AI_QUERY,
    AIPermission.AI_FUNCTION_CALL,
    AIPermission.AI_MODEL_CONFIG,
    AIPermission.AI_MEMORY_ACCESS,
    AIPermission.AI_ANALYTICS,
    AIPermission.AI_ADMIN
  ],
  [Role.ADMIN]: [
    AIPermission.AI_CHAT,
    AIPermission.AI_QUERY,
    AIPermission.AI_FUNCTION_CALL,
    AIPermission.AI_MEMORY_ACCESS,
    AIPermission.AI_ANALYTICS
  ],
  [Role.PRINCIPAL]: [
    AIPermission.AI_CHAT,
    AIPermission.AI_QUERY,
    AIPermission.AI_FUNCTION_CALL,
    AIPermission.AI_ANALYTICS
  ],
  [Role.TEACHER]: [
    AIPermission.AI_CHAT,
    AIPermission.AI_QUERY,
    AIPermission.AI_FUNCTION_CALL
  ],
  [Role.PARENT]: [
    AIPermission.AI_CHAT,
    AIPermission.AI_QUERY
  ],
  [Role.STUDENT]: [
    AIPermission.AI_CHAT
  ]
}

/**
 * RBAC中间件
 */
export function rbacMiddleware(
  requiredPermission: PermissionLevel | AIPermission,
  options: RBACOptions = {}
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 检查用户是否已认证
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: '用户未认证',
          code: 'UNAUTHORIZED'
        })
      }

      const user = req.user as JWTPayload
      const userRole = user.role as Role

      // 检查基础权限
      let hasPermission = false

      if (Object.values(PermissionLevel).includes(requiredPermission as PermissionLevel)) {
        hasPermission = ROLE_PERMISSIONS[userRole]?.includes(requiredPermission as PermissionLevel) || false
      } else if (Object.values(AIPermission).includes(requiredPermission as AIPermission)) {
        hasPermission = AI_ROLE_PERMISSIONS[userRole]?.includes(requiredPermission as AIPermission) || false
      }

      if (!hasPermission) {
        // 记录安全违规
        await logSecurityViolation({
          userId: user.id,
          action: 'permission_denied',
          resource: requiredPermission,
          userRole,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          timestamp: new Date()
        })

        return res.status(403).json({
          success: false,
          error: '权限不足',
          code: 'FORBIDDEN',
          requiredPermission,
          userRole
        })
      }

      // 检查资源级权限
      if (options.resourceCheck) {
        const resourcePermission = await options.resourceCheck(req, user)
        if (!resourcePermission) {
          return res.status(403).json({
            success: false,
            error: '资源访问权限不足',
            code: 'RESOURCE_FORBIDDEN'
          })
        }
      }

      // 检查AI配额限制
      if (Object.values(AIPermission).includes(requiredPermission as AIPermission)) {
        const quotaCheck = await checkAIQuota(user.id)
        if (!quotaCheck.allowed) {
          return res.status(429).json({
            success: false,
            error: 'AI使用配额已用完',
            code: 'QUOTA_EXCEEDED',
            quotaInfo: quotaCheck
          })
        }
      }

      next()

    } catch (error) {
      console.error('RBAC中间件错误:', error)
      res.status(500).json({
        success: false,
        error: '权限检查失败',
        code: 'RBAC_ERROR'
      })
    }
  }
}
```

## 2. API安全机制

### 请求验证与限流
```typescript
// API安全中间件
export class APISecurityMiddleware {

  /**
   * 请求签名验证
   */
  static requestSignatureValidation() {
    return (req: Request, res: Response, next: NextFunction) => {
      // 跳过GET请求的签名验证
      if (req.method === 'GET') {
        return next()
      }

      const signature = req.headers['x-signature'] as string
      const timestamp = req.headers['x-timestamp'] as string
      const nonce = req.headers['x-nonce'] as string

      if (!signature || !timestamp || !nonce) {
        return res.status(400).json({
          success: false,
          error: '缺少必要的安全头部',
          code: 'MISSING_SECURITY_HEADERS'
        })
      }

      // 检查时间戳 (5分钟内有效)
      const requestTime = parseInt(timestamp)
      const currentTime = Date.now()
      const timeDiff = Math.abs(currentTime - requestTime)

      if (timeDiff > 5 * 60 * 1000) {
        return res.status(400).json({
          success: false,
          error: '请求时间戳过期',
          code: 'TIMESTAMP_EXPIRED'
        })
      }

      // 验证签名
      const expectedSignature = this.generateSignature(
        req.body,
        timestamp,
        nonce,
        req.user?.id?.toString() || 'anonymous'
      )

      if (signature !== expectedSignature) {
        return res.status(400).json({
          success: false,
          error: '请求签名验证失败',
          code: 'INVALID_SIGNATURE'
        })
      }

      next()
    }
  }

  /**
   * 生成请求签名
   */
  private static generateSignature(
    body: any,
    timestamp: string,
    nonce: string,
    userId: string
  ): string {
    const bodyString = JSON.stringify(body)
    const signatureString = `${bodyString}${timestamp}${nonce}${userId}`

    return crypto
      .createHmac('sha256', process.env.API_SECRET_KEY || 'default-secret')
      .update(signatureString)
      .digest('hex')
  }

  /**
   * 请求频率限制
   */
  static rateLimiting() {
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15分钟
      max: (req: Request) => {
        // 根据用户角色设置不同的限制
        const user = req.user as JWTPayload
        if (!user) return 100 // 未认证用户

        const roleLimits = {
          [Role.SUPER_ADMIN]: 1000,
          [Role.ADMIN]: 500,
          [Role.PRINCIPAL]: 300,
          [Role.TEACHER]: 200,
          [Role.PARENT]: 100,
          [Role.STUDENT]: 50
        }

        return roleLimits[user.role as Role] || 100
      },
      message: (req: Request) => ({
        success: false,
        error: '请求频率过高，请稍后再试',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(15 * 60) // 秒
      }),
      standardHeaders: true,
      legacyHeaders: false,
      // 根据用户ID限制，而不是IP
      keyGenerator: (req: Request) => {
        const user = req.user as JWTPayload
        return user ? `user_${user.id}` : req.ip
      }
    })

    return limiter
  }

  /**
   * AI特定的频率限制
   */
  static aiRateLimiting() {
    const aiLimiter = rateLimit({
      windowMs: 60 * 1000, // 1分钟
      max: (req: Request) => {
        const user = req.user as JWTPayload
        if (!user) return 0 // 未认证用户不能使用AI

        // 根据用户角色设置AI调用限制
        const aiLimits = {
          [Role.SUPER_ADMIN]: 100,
          [Role.ADMIN]: 60,
          [Role.PRINCIPAL]: 40,
          [Role.TEACHER]: 30,
          [Role.PARENT]: 20,
          [Role.STUDENT]: 10
        }

        return aiLimits[user.role as Role] || 10
      },
      message: {
        success: false,
        error: 'AI调用频率过高，请稍后再试',
        code: 'AI_RATE_LIMIT_EXCEEDED'
      },
      keyGenerator: (req: Request) => {
        const user = req.user as JWTPayload
        return `ai_user_${user.id}`
      }
    })

    return aiLimiter
  }
}
```

### 输入验证与清理
```typescript
// 输入验证服务
export class InputValidationService {

  /**
   * AI查询输入验证
   */
  static validateAIQuery(query: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      sanitizedInput: query
    }

    // 长度检查
    if (!query || query.trim().length === 0) {
      result.isValid = false
      result.errors.push('查询内容不能为空')
      return result
    }

    if (query.length > 2000) {
      result.isValid = false
      result.errors.push('查询内容过长，最多2000字符')
      return result
    }

    // 危险内容检测
    const dangerousPatterns = [
      /DROP\s+TABLE/i,
      /DELETE\s+FROM/i,
      /UPDATE\s+.*\s+SET/i,
      /INSERT\s+INTO/i,
      /TRUNCATE/i,
      /ALTER\s+TABLE/i,
      /CREATE\s+TABLE/i,
      /<script[^>]*>/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\s*\(/i,
      /setTimeout\s*\(/i,
      /setInterval\s*\(/i
    ]

    for (const pattern of dangerousPatterns) {
      if (pattern.test(query)) {
        result.isValid = false
        result.errors.push('查询内容包含潜在危险代码')
        break
      }
    }

    // 敏感信息检测
    const sensitivePatterns = [
      /password/i,
      /secret/i,
      /token/i,
      /api[_-]?key/i,
      /private[_-]?key/i,
      /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/, // 信用卡号
      /\b\d{11}\b/, // 手机号
      /\b\d{18}\b/  // 身份证号
    ]

    for (const pattern of sensitivePatterns) {
      if (pattern.test(query)) {
        result.errors.push('查询内容可能包含敏感信息')
        // 不直接拒绝，但记录警告
        break
      }
    }

    // 内容清理
    result.sanitizedInput = this.sanitizeInput(query)

    return result
  }

  /**
   * 输入内容清理
   */
  private static sanitizeInput(input: string): string {
    // 移除HTML标签
    let sanitized = input.replace(/<[^>]*>/g, '')

    // 转义特殊字符
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')

    // 移除多余空白
    sanitized = sanitized.replace(/\s+/g, ' ').trim()

    return sanitized
  }

  /**
   * Function Calling参数验证
   */
  static validateFunctionCallParameters(
    toolName: string,
    parameters: any,
    toolDefinition: ToolFunction
  ): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      sanitizedInput: parameters
    }

    try {
      // 使用Joi进行参数验证
      const schema = this.buildJoiSchema(toolDefinition.parameters)
      const { error, value } = schema.validate(parameters)

      if (error) {
        result.isValid = false
        result.errors = error.details.map(detail => detail.message)
        return result
      }

      result.sanitizedInput = value

      // 工具特定的安全检查
      switch (toolName) {
        case 'query_database':
          return this.validateDatabaseQueryParams(value)

        case 'execute_page_action':
          return this.validatePageActionParams(value)

        case 'generate_visualization':
          return this.validateVisualizationParams(value)

        default:
          return result
      }

    } catch (error) {
      result.isValid = false
      result.errors.push('参数验证失败: ' + (error as Error).message)
      return result
    }
  }

  /**
   * 数据库查询参数验证
   */
  private static validateDatabaseQueryParams(params: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      sanitizedInput: params
    }

    // 检查查询类型是否在允许列表中
    const allowedQueryTypes = [
      'student_info',
      'activity_stats',
      'enrollment_data',
      'teacher_performance',
      'financial_report'
    ]

    if (!allowedQueryTypes.includes(params.query_type)) {
      result.isValid = false
      result.errors.push(`不支持的查询类型: ${params.query_type}`)
    }

    // 检查过滤条件
    if (params.filters) {
      // 日期范围检查
      if (params.filters.date_range) {
        const { start_date, end_date } = params.filters.date_range
        if (start_date && end_date) {
          const startDate = new Date(start_date)
          const endDate = new Date(end_date)
          const daysDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)

          if (daysDiff > 365) {
            result.isValid = false
            result.errors.push('查询时间范围不能超过365天')
          }
        }
      }

      // 限制查询结果数量
      if (params.aggregation && params.aggregation.limit) {
        if (params.aggregation.limit > 1000) {
          result.sanitizedInput.aggregation.limit = 1000
          result.errors.push('查询结果数量已限制为1000条')
        }
      }
    }

    return result
  }
}
```

## 3. 数据安全与隐私保护

### 敏感数据加密
```typescript
// 数据加密服务
export class DataEncryptionService {
  private readonly ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key'
  private readonly ALGORITHM = 'aes-256-gcm'

  /**
   * 加密敏感数据
   */
  encrypt(data: string): EncryptedData {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipher(this.ALGORITHM, this.ENCRYPTION_KEY)
    cipher.setAAD(Buffer.from('ai-system-data'))

    let encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const authTag = cipher.getAuthTag()

    return {
      encryptedData: encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    }
  }

  /**
   * 解密敏感数据
   */
  decrypt(encryptedData: EncryptedData): string {
    const decipher = crypto.createDecipher(this.ALGORITHM, this.ENCRYPTION_KEY)
    decipher.setAAD(Buffer.from('ai-system-data'))
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'))

    let decrypted = decipher.update(encryptedData.encryptedData, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  }

  /**
   * 哈希敏感数据 (不可逆)
   */
  hash(data: string, salt?: string): string {
    const actualSalt = salt || crypto.randomBytes(16).toString('hex')
    const hash = crypto.pbkdf2Sync(data, actualSalt, 10000, 64, 'sha512')
    return `${actualSalt}:${hash.toString('hex')}`
  }

  /**
   * 验证哈希
   */
  verifyHash(data: string, hashedData: string): boolean {
    const [salt, hash] = hashedData.split(':')
    const verifyHash = crypto.pbkdf2Sync(data, salt, 10000, 64, 'sha512')
    return hash === verifyHash.toString('hex')
  }
}
```

### 数据脱敏处理
```typescript
// 数据脱敏服务
export class DataMaskingService {

  /**
   * 脱敏用户敏感信息
   */
  static maskUserData(userData: any): any {
    const masked = { ...userData }

    // 手机号脱敏
    if (masked.phone) {
      masked.phone = this.maskPhone(masked.phone)
    }

    // 身份证号脱敏
    if (masked.idCard) {
      masked.idCard = this.maskIdCard(masked.idCard)
    }

    // 邮箱脱敏
    if (masked.email) {
      masked.email = this.maskEmail(masked.email)
    }

    // 地址脱敏
    if (masked.address) {
      masked.address = this.maskAddress(masked.address)
    }

    // 移除敏感字段
    delete masked.password
    delete masked.apiKey
    delete masked.secretKey

    return masked
  }

  /**
   * 手机号脱敏
   */
  private static maskPhone(phone: string): string {
    if (phone.length !== 11) return phone
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
  }

  /**
   * 身份证号脱敏
   */
  private static maskIdCard(idCard: string): string {
    if (idCard.length !== 18) return idCard
    return idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2')
  }

  /**
   * 邮箱脱敏
   */
  private static maskEmail(email: string): string {
    const [username, domain] = email.split('@')
    if (username.length <= 2) return email

    const maskedUsername = username.charAt(0) +
      '*'.repeat(username.length - 2) +
      username.charAt(username.length - 1)

    return `${maskedUsername}@${domain}`
  }

  /**
   * 地址脱敏
   */
  private static maskAddress(address: string): string {
    // 保留省市，脱敏详细地址
    const parts = address.split(/[省市区县]/)
    if (parts.length >= 3) {
      return parts.slice(0, 2).join('') + '省市****'
    }
    return address.substring(0, 6) + '****'
  }

  /**
   * AI对话内容脱敏
   */
  static maskAIConversation(content: string): string {
    let masked = content

    // 手机号脱敏
    masked = masked.replace(/1[3-9]\d{9}/g, (match) =>
      match.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    )

    // 身份证号脱敏
    masked = masked.replace(/\d{17}[\dX]/g, (match) =>
      match.replace(/(\d{6})\d{8}(\d{3}[\dX])/, '$1********$2')
    )

    // 邮箱脱敏
    masked = masked.replace(/[\w.-]+@[\w.-]+\.\w+/g, (match) => {
      const [username, domain] = match.split('@')
      const maskedUsername = username.charAt(0) +
        '*'.repeat(Math.max(0, username.length - 2)) +
        username.charAt(username.length - 1)
      return `${maskedUsername}@${domain}`
    })

    return masked
  }
}
```

这个安全与权限分析展示了一个完整的、多层次的安全防护体系，确保AI系统的安全性和用户数据的隐私保护。

---

# ⚡ 性能优化详细分析

## 1. 缓存机制优化

### 多层缓存架构
```typescript
// 多层缓存管理器
export class MultiLevelCacheManager {
  private l1Cache = new Map<string, CacheItem>() // 内存缓存 (L1)
  private l2Cache: Redis.Redis                   // Redis缓存 (L2)
  private l3Cache: DatabaseCache                 // 数据库缓存 (L3)

  constructor() {
    this.l2Cache = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3
    })

    this.l3Cache = new DatabaseCache()
    this.initializeCacheWarming()
  }

  /**
   * 智能缓存获取
   */
  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    const cacheKey = this.buildCacheKey(key, options)

    try {
      // L1缓存检查 (内存)
      const l1Result = this.l1Cache.get(cacheKey)
      if (l1Result && !this.isExpired(l1Result)) {
        console.log(`🎯 L1缓存命中: ${cacheKey}`)
        this.updateAccessStats(cacheKey, 'L1')
        return l1Result.data as T
      }

      // L2缓存检查 (Redis)
      const l2Result = await this.l2Cache.get(cacheKey)
      if (l2Result) {
        const parsedData = JSON.parse(l2Result)
        console.log(`🎯 L2缓存命中: ${cacheKey}`)

        // 回填L1缓存
        this.l1Cache.set(cacheKey, {
          data: parsedData,
          timestamp: Date.now(),
          ttl: options.ttl || 300000 // 5分钟默认TTL
        })

        this.updateAccessStats(cacheKey, 'L2')
        return parsedData as T
      }

      // L3缓存检查 (数据库)
      if (options.enableL3Cache) {
        const l3Result = await this.l3Cache.get(cacheKey)
        if (l3Result) {
          console.log(`🎯 L3缓存命中: ${cacheKey}`)

          // 回填L2和L1缓存
          await this.l2Cache.setex(cacheKey, 3600, JSON.stringify(l3Result)) // 1小时
          this.l1Cache.set(cacheKey, {
            data: l3Result,
            timestamp: Date.now(),
            ttl: options.ttl || 300000
          })

          this.updateAccessStats(cacheKey, 'L3')
          return l3Result as T
        }
      }

      console.log(`❌ 缓存未命中: ${cacheKey}`)
      this.updateAccessStats(cacheKey, 'MISS')
      return null

    } catch (error) {
      console.error('缓存获取失败:', error)
      return null
    }
  }

  /**
   * 智能缓存设置
   */
  async set<T>(
    key: string,
    data: T,
    options: CacheSetOptions = {}
  ): Promise<void> {
    const cacheKey = this.buildCacheKey(key, options)
    const ttl = options.ttl || 300000 // 5分钟默认

    try {
      // 数据大小检查
      const dataSize = JSON.stringify(data).length

      // L1缓存 (小数据 < 1MB)
      if (dataSize < 1024 * 1024) {
        this.l1Cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl
        })
      }

      // L2缓存 (中等数据 < 10MB)
      if (dataSize < 10 * 1024 * 1024) {
        await this.l2Cache.setex(
          cacheKey,
          Math.floor(ttl / 1000),
          JSON.stringify(data)
        )
      }

      // L3缓存 (大数据或长期缓存)
      if (options.enableL3Cache || options.longTerm) {
        await this.l3Cache.set(cacheKey, data, {
          ttl: options.longTerm ? 24 * 60 * 60 * 1000 : ttl // 24小时或指定TTL
        })
      }

      console.log(`✅ 缓存设置成功: ${cacheKey} (${dataSize} bytes)`)

    } catch (error) {
      console.error('缓存设置失败:', error)
    }
  }

  /**
   * 缓存预热
   */
  private async initializeCacheWarming(): Promise<void> {
    console.log('🔥 开始缓存预热...')

    const warmupTasks = [
      this.warmupAIModels(),
      this.warmupUserPermissions(),
      this.warmupPageGuides(),
      this.warmupFrequentQueries()
    ]

    await Promise.allSettled(warmupTasks)
    console.log('🎉 缓存预热完成')
  }

  /**
   * AI模型缓存预热
   */
  private async warmupAIModels(): Promise<void> {
    try {
      const models = await AIModelConfig.findAll({
        where: { status: 'active' }
      })

      for (const model of models) {
        await this.set(`ai_model:${model.name}`, model, {
          ttl: 60 * 60 * 1000, // 1小时
          enableL3Cache: true
        })
      }

      console.log(`✅ AI模型缓存预热完成: ${models.length}个模型`)
    } catch (error) {
      console.error('AI模型缓存预热失败:', error)
    }
  }

  /**
   * 缓存统计和监控
   */
  getCacheStats(): CacheStats {
    const l1Stats = this.getL1Stats()
    const l2Stats = this.getL2Stats()

    return {
      l1Cache: l1Stats,
      l2Cache: l2Stats,
      overall: {
        totalRequests: l1Stats.requests + l2Stats.requests,
        totalHits: l1Stats.hits + l2Stats.hits,
        hitRate: (l1Stats.hits + l2Stats.hits) / (l1Stats.requests + l2Stats.requests),
        memoryUsage: l1Stats.memoryUsage,
        redisConnections: l2Stats.connections
      }
    }
  }
}
```

### 查询结果缓存
```typescript
// AI查询缓存优化
export class AIQueryCacheOptimizer {
  private cacheManager: MultiLevelCacheManager
  private queryAnalyzer: QueryAnalyzer

  constructor() {
    this.cacheManager = new MultiLevelCacheManager()
    this.queryAnalyzer = new QueryAnalyzer()
  }

  /**
   * 智能查询缓存
   */
  async getCachedQueryResult(
    query: string,
    context: any,
    userId: number
  ): Promise<CachedQueryResult | null> {

    // 生成缓存键
    const cacheKey = this.generateQueryCacheKey(query, context, userId)

    // 检查缓存
    const cached = await this.cacheManager.get<CachedQueryResult>(cacheKey)
    if (cached) {
      // 更新命中统计
      await this.updateCacheHitStats(cacheKey)
      return cached
    }

    return null
  }

  /**
   * 缓存查询结果
   */
  async cacheQueryResult(
    query: string,
    context: any,
    userId: number,
    result: any,
    metadata: QueryMetadata
  ): Promise<void> {

    const cacheKey = this.generateQueryCacheKey(query, context, userId)

    // 分析查询特征
    const queryFeatures = await this.queryAnalyzer.analyzeQuery(query, context)

    // 确定缓存策略
    const cacheStrategy = this.determineCacheStrategy(queryFeatures, metadata)

    const cachedResult: CachedQueryResult = {
      query,
      result,
      metadata,
      timestamp: new Date(),
      hitCount: 0,
      queryFeatures,
      cacheStrategy
    }

    // 根据策略设置缓存
    await this.cacheManager.set(cacheKey, cachedResult, {
      ttl: cacheStrategy.ttl,
      enableL3Cache: cacheStrategy.persistent,
      longTerm: cacheStrategy.longTerm
    })

    // 异步更新缓存表
    this.updateCacheTable(cacheKey, cachedResult).catch(console.error)
  }

  /**
   * 确定缓存策略
   */
  private determineCacheStrategy(
    features: QueryFeatures,
    metadata: QueryMetadata
  ): CacheStrategy {

    let ttl = 5 * 60 * 1000 // 默认5分钟
    let persistent = false
    let longTerm = false

    // 基于查询类型调整策略
    switch (features.queryType) {
      case 'statistical':
        // 统计查询结果相对稳定
        ttl = 30 * 60 * 1000 // 30分钟
        persistent = true
        break

      case 'real_time':
        // 实时查询结果变化快
        ttl = 1 * 60 * 1000 // 1分钟
        break

      case 'historical':
        // 历史数据查询结果稳定
        ttl = 2 * 60 * 60 * 1000 // 2小时
        persistent = true
        longTerm = true
        break

      case 'configuration':
        // 配置类查询结果很稳定
        ttl = 24 * 60 * 60 * 1000 // 24小时
        persistent = true
        longTerm = true
        break
    }

    // 基于数据变化频率调整
    if (features.dataVolatility === 'low') {
      ttl *= 2 // 低变化率数据缓存时间翻倍
    } else if (features.dataVolatility === 'high') {
      ttl /= 2 // 高变化率数据缓存时间减半
    }

    // 基于查询复杂度调整
    if (metadata.executionTime > 5000) {
      // 执行时间超过5秒的复杂查询，延长缓存时间
      ttl *= 1.5
      persistent = true
    }

    return {
      ttl,
      persistent,
      longTerm,
      reasoning: this.generateCacheReasoning(features, metadata, ttl)
    }
  }

  /**
   * 智能缓存失效
   */
  async invalidateRelatedCaches(
    dataChange: DataChangeEvent
  ): Promise<void> {

    const affectedCacheKeys = await this.findAffectedCaches(dataChange)

    console.log(`🗑️ 数据变更影响 ${affectedCacheKeys.length} 个缓存项`)

    // 批量失效缓存
    const invalidationTasks = affectedCacheKeys.map(async (cacheKey) => {
      try {
        await this.cacheManager.delete(cacheKey)
        await this.markCacheInvalid(cacheKey, dataChange.reason)
      } catch (error) {
        console.error(`缓存失效失败: ${cacheKey}`, error)
      }
    })

    await Promise.allSettled(invalidationTasks)
  }

  /**
   * 缓存性能监控
   */
  async getCachePerformanceReport(): Promise<CachePerformanceReport> {
    const stats = this.cacheManager.getCacheStats()

    // 获取热点查询
    const hotQueries = await this.getHotQueries()

    // 获取缓存效率分析
    const efficiencyAnalysis = await this.analyzeCacheEfficiency()

    // 生成优化建议
    const optimizationSuggestions = this.generateOptimizationSuggestions(
      stats,
      hotQueries,
      efficiencyAnalysis
    )

    return {
      timestamp: new Date(),
      cacheStats: stats,
      hotQueries,
      efficiencyAnalysis,
      optimizationSuggestions,
      summary: this.generatePerformanceSummary(stats, efficiencyAnalysis)
    }
  }
}
```

## 2. 响应时间优化

### 异步处理优化
```typescript
// 异步任务管理器
export class AsyncTaskManager {
  private taskQueue = new Map<string, AsyncTask>()
  private workers = new Map<string, Worker>()
  private maxConcurrentTasks = 10

  /**
   * 提交异步任务
   */
  async submitTask<T>(
    taskType: string,
    taskData: any,
    options: TaskOptions = {}
  ): Promise<TaskSubmissionResult<T>> {

    const taskId = this.generateTaskId()
    const priority = options.priority || TaskPriority.NORMAL

    const task: AsyncTask = {
      id: taskId,
      type: taskType,
      data: taskData,
      priority,
      status: TaskStatus.PENDING,
      createdAt: new Date(),
      estimatedDuration: options.estimatedDuration || 5000,
      maxRetries: options.maxRetries || 3,
      retryCount: 0
    }

    this.taskQueue.set(taskId, task)

    // 立即尝试执行
    this.processTaskQueue()

    return {
      taskId,
      status: 'submitted',
      estimatedCompletion: new Date(Date.now() + task.estimatedDuration)
    }
  }

  /**
   * 处理任务队列
   */
  private async processTaskQueue(): Promise<void> {
    const runningTasks = Array.from(this.taskQueue.values())
      .filter(task => task.status === TaskStatus.RUNNING).length

    if (runningTasks >= this.maxConcurrentTasks) {
      return // 已达到最大并发数
    }

    // 获取待处理任务，按优先级排序
    const pendingTasks = Array.from(this.taskQueue.values())
      .filter(task => task.status === TaskStatus.PENDING)
      .sort((a, b) => b.priority - a.priority)

    const availableSlots = this.maxConcurrentTasks - runningTasks
    const tasksToProcess = pendingTasks.slice(0, availableSlots)

    for (const task of tasksToProcess) {
      this.executeTask(task).catch(error => {
        console.error(`任务执行失败: ${task.id}`, error)
      })
    }
  }

  /**
   * 执行单个任务
   */
  private async executeTask(task: AsyncTask): Promise<void> {
    task.status = TaskStatus.RUNNING
    task.startedAt = new Date()

    try {
      console.log(`🚀 开始执行任务: ${task.type} (${task.id})`)

      let result: any

      switch (task.type) {
        case 'ai_analysis':
          result = await this.executeAIAnalysis(task.data)
          break

        case 'data_export':
          result = await this.executeDataExport(task.data)
          break

        case 'report_generation':
          result = await this.executeReportGeneration(task.data)
          break

        case 'batch_processing':
          result = await this.executeBatchProcessing(task.data)
          break

        default:
          throw new Error(`未知任务类型: ${task.type}`)
      }

      task.status = TaskStatus.COMPLETED
      task.completedAt = new Date()
      task.result = result

      console.log(`✅ 任务完成: ${task.type} (${task.id})`)

      // 通知任务完成
      await this.notifyTaskCompletion(task)

    } catch (error) {
      console.error(`❌ 任务执行失败: ${task.type} (${task.id})`, error)

      task.retryCount++

      if (task.retryCount < task.maxRetries) {
        // 重试任务
        task.status = TaskStatus.PENDING
        task.error = (error as Error).message

        // 延迟重试
        setTimeout(() => {
          this.processTaskQueue()
        }, Math.pow(2, task.retryCount) * 1000) // 指数退避

      } else {
        // 任务失败
        task.status = TaskStatus.FAILED
        task.error = (error as Error).message
        task.completedAt = new Date()

        await this.notifyTaskFailure(task)
      }
    }
  }

  /**
   * AI分析任务执行
   */
  private async executeAIAnalysis(data: any): Promise<any> {
    const { query, context, userId } = data

    // 使用统一智能服务
    const intelligenceService = new UnifiedIntelligenceService()

    const result = await intelligenceService.processRequest({
      content: query,
      userId: userId.toString(),
      conversationId: context.conversationId || 'async-task',
      context
    })

    return {
      analysis: result.data.message,
      toolExecutions: result.data.toolExecutions,
      processingTime: result.metadata.processingTime
    }
  }

  /**
   * 获取任务状态
   */
  async getTaskStatus(taskId: string): Promise<TaskStatusResult> {
    const task = this.taskQueue.get(taskId)

    if (!task) {
      return {
        found: false,
        error: '任务不存在'
      }
    }

    const result: TaskStatusResult = {
      found: true,
      taskId: task.id,
      type: task.type,
      status: task.status,
      createdAt: task.createdAt,
      progress: this.calculateTaskProgress(task)
    }

    if (task.