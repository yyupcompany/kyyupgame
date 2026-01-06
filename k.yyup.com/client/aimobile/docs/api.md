# 🔌 API接口文档

## 🎯 API概述

移动端AI专家工作流系统通过RESTful API与后端13个专家系统通信，支持Smart Expert和Expert Consultation两套系统，提供完整的AI专家咨询和工作流执行能力。

## 🏗️ API架构

```
移动端应用
    ↓
mobile-api.service.ts (API服务层)
    ↓
后端API网关 (/api/)
    ↓
┌─────────────────┬─────────────────┐
│  Smart Expert   │ Expert Consultation │
│     (7个)       │      (6个)      │
└─────────────────┴─────────────────┘
```

## 📋 专家系统列表

### Smart Expert系统 (7个)
| 专家ID | 专家名称 | 数据表 | 主要功能 |
|--------|----------|--------|----------|
| `activity_planner` | 活动策划专家 | `activity_planning_data` | 活动策划、流程设计 |
| `marketing_expert` | 招生营销专家 | `marketing_data` | 招生策略、市场分析 |
| `education_expert` | 教育评估专家 | 临时数据 | 教育评估、质量分析 |
| `cost_analyst` | 成本分析专家 | 临时数据 | 成本分析、预算规划 |
| `risk_assessor` | 风险评估专家 | 临时数据 | 风险识别、安全评估 |
| `creative_designer` | 创意设计专家 | 临时数据 | 创意设计、视觉方案 |
| `curriculum_expert` | 课程教学专家 | 临时数据 | 课程设计、教学指导 |

### Expert Consultation系统 (6个)
| 专家类型 | 专家名称 | 主要功能 |
|----------|----------|----------|
| `planner` | 招生策划专家 | 招生计划制定 |
| `psychologist` | 心理学专家 | 儿童心理分析 |
| `investor` | 投资分析专家 | 投资决策分析 |
| `director` | 园长管理专家 | 管理策略指导 |
| `teacher` | 执行教师专家 | 教学实践指导 |
| `parent` | 家长体验专家 | 家长关系管理 |

## 🔌 Smart Expert API

### 接口地址
```
POST /api/ai/expert/smart-chat
```

### 请求格式
```typescript
interface SmartExpertRequest {
  expert_id: AgentType
  task: string
  context?: string
  user_id?: string
  session_id?: string
}
```

### 请求示例
```json
{
  "expert_id": "activity_planner",
  "task": "策划一个30人参加的春游活动，预算控制在1000元以内",
  "context": "幼儿园大班春季活动",
  "user_id": "user_123",
  "session_id": "session_456"
}
```

### 响应格式
```typescript
interface SmartExpertResponse {
  success: boolean
  advice: string
  expert_name: string
  timestamp: string
  confidence?: number
  suggestions?: string[]
  data_used?: any
  execution_log?: string[]
}
```

### 响应示例
```json
{
  "success": true,
  "advice": "基于您的需求，我为您设计了一个30人春游活动方案：\n\n**活动主题：** 春天的发现之旅\n\n**活动地点：** 市郊生态公园\n\n**预算分析：**\n- 交通费用：600元（大巴租赁）\n- 门票费用：300元（10元/人）\n- 餐饮费用：100元（简单点心和水）\n- 总计：1000元\n\n**活动流程：**\n1. 上午9:00 集合出发\n2. 上午10:00 到达公园，安全教育\n3. 上午10:30-11:30 自然观察活动\n4. 下午12:00-13:00 野餐时间\n5. 下午13:30-14:30 游戏活动\n6. 下午15:00 返程\n\n**安全措施：**\n- 配备2名老师和4名家长志愿者\n- 准备急救包和常用药品\n- 建立紧急联系机制",
  "expert_name": "活动策划专家",
  "timestamp": "2025-01-10T10:30:00Z",
  "confidence": 0.95,
  "suggestions": [
    "建议提前一周通知家长准备物品",
    "可以考虑增加摄影记录环节",
    "建议准备雨天备选方案"
  ],
  "execution_log": [
    "分析用户需求：30人春游活动，预算1000元",
    "查询历史活动数据：找到3个相似活动案例",
    "计算预算分配：交通60%，门票30%，其他10%",
    "设计活动流程：考虑儿童年龄特点和安全因素",
    "生成安全建议：基于风险评估结果"
  ]
}
```

## 🔌 Expert Consultation API

### 接口地址
```
POST /api/expert-consultation
```

### 请求格式
```typescript
interface ExpertConsultationRequest {
  expert_type: ExpertConsultationType
  question: string
  context?: string
  user_id?: string
}
```

### 请求示例
```json
{
  "expert_type": "psychologist",
  "question": "3岁孩子在幼儿园总是哭闹，不愿意参加集体活动，应该如何处理？",
  "context": "新入园儿童适应问题",
  "user_id": "user_123"
}
```

### 响应格式
```typescript
interface ExpertConsultationResponse {
  success: boolean
  expert_type: string
  answer: string
  confidence: number
  follow_up_questions?: string[]
  resources?: string[]
  timestamp: string
}
```

### 响应示例
```json
{
  "success": true,
  "expert_type": "psychologist",
  "answer": "3岁儿童的分离焦虑是正常现象，建议采用以下策略：\n\n**理解原因：**\n- 分离焦虑是3岁儿童的正常发展阶段\n- 对新环境的恐惧和不安全感\n- 对家长的依恋关系强烈\n\n**应对策略：**\n1. **渐进适应法：** 逐步延长在园时间\n2. **安抚物品：** 允许带一件家里的小物品\n3. **建立信任：** 老师多给予关注和安抚\n4. **家园配合：** 家长态度要坚定温和\n\n**具体建议：**\n- 送园时不要偷偷离开，要正式告别\n- 接园时间要准时，建立信任感\n- 在家多谈论幼儿园的积极方面\n- 与老师保持密切沟通\n\n一般需要2-4周的适应期，请耐心等待。",
  "confidence": 0.92,
  "follow_up_questions": [
    "孩子在家的表现如何？",
    "之前有过类似的分离经历吗？",
    "家长的情绪状态如何？"
  ],
  "resources": [
    "《幼儿分离焦虑应对指南》",
    "《3-6岁儿童心理发展特点》"
  ],
  "timestamp": "2025-01-10T10:35:00Z"
}
```

## 🛠️ 工具集成API

### 图片生成API
```typescript
// 内部调用，不直接暴露给前端
interface ImageGenerationRequest {
  prompt: string
  style?: 'realistic' | 'cartoon' | 'professional' | 'artistic'
  size?: '512x512' | '1024x1024' | '1024x1792'
  quality?: 'standard' | 'hd'
}

interface ImageGenerationResponse {
  images: Array<{
    url: string
    prompt: string
    size: string
    style: string
  }>
  usage: {
    totalTokens: number
    cost: number
  }
}
```

### 文档生成API
```typescript
interface DocumentGenerationRequest {
  title: string
  content: Record<string, any>
  template?: 'report' | 'proposal' | 'plan' | 'summary'
  format?: 'markdown' | 'html' | 'pdf'
}

interface DocumentGenerationResponse {
  document: {
    title: string
    content: string
    format: string
    downloadUrl?: string
  }
  metadata: {
    wordCount: number
    pageCount: number
    generatedAt: string
  }
}
```

## 🔄 API调用流程

### 1. 基础调用流程
```typescript
// 1. 创建请求
const request: SmartExpertRequest = {
  expert_id: 'activity_planner',
  task: '策划春游活动',
  context: '30人，预算1000元'
}

// 2. 发送请求
const response = await mobileAPIService.callSmartExpert(request)

// 3. 处理响应
if (response.success) {
  console.log('专家建议:', response.advice)
} else {
  console.error('请求失败')
}
```

### 2. 工作流调用流程
```typescript
// 工作流中的专家调用
const executeExpertStep = async (step: WorkflowStep) => {
  const request = {
    expert_id: step.agent.type,
    task: step.inputs.task,
    context: JSON.stringify(step.inputs.context)
  }
  
  const response = await mobileAPIService.callSmartExpert(request)
  
  return {
    stepId: step.id,
    result: response.advice,
    confidence: response.confidence,
    timestamp: response.timestamp
  }
}
```

## 🔒 错误处理

### 错误码定义
| 错误码 | 错误类型 | 描述 | 处理建议 |
|--------|----------|------|----------|
| 400 | 请求错误 | 参数格式错误 | 检查请求参数 |
| 401 | 认证失败 | 用户未认证 | 重新登录 |
| 403 | 权限不足 | 无访问权限 | 联系管理员 |
| 404 | 资源不存在 | 专家不存在 | 检查专家ID |
| 429 | 请求过频 | 超出限流 | 稍后重试 |
| 500 | 服务器错误 | 内部错误 | 联系技术支持 |
| 503 | 服务不可用 | 专家服务离线 | 稍后重试 |

### 错误响应格式
```typescript
interface ErrorResponse {
  success: false
  error: {
    code: number
    message: string
    details?: string
    timestamp: string
  }
}
```

### 错误处理示例
```typescript
try {
  const response = await mobileAPIService.callSmartExpert(request)
  return response
} catch (error) {
  if (error.code === 429) {
    // 限流错误，延迟重试
    await new Promise(resolve => setTimeout(resolve, 5000))
    return this.callSmartExpert(request)
  } else if (error.code === 503) {
    // 服务不可用，使用缓存或降级处理
    return this.getFallbackResponse(request)
  } else {
    // 其他错误，显示用户友好提示
    throw new Error('专家暂时无法回复，请稍后重试')
  }
}
```

## 📊 API性能优化

### 缓存策略
```typescript
class APICache {
  private cache = new Map<string, CacheItem>()
  
  async get(key: string): Promise<any> {
    const item = this.cache.get(key)
    if (item && item.expiry > Date.now()) {
      return item.data
    }
    return null
  }
  
  set(key: string, data: any, ttl: number = 300000) { // 5分钟默认TTL
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl
    })
  }
}
```

### 请求合并
```typescript
class RequestBatcher {
  private pending = new Map<string, Promise<any>>()
  
  async batchRequest(key: string, requestFn: () => Promise<any>): Promise<any> {
    if (this.pending.has(key)) {
      return this.pending.get(key)
    }
    
    const promise = requestFn()
    this.pending.set(key, promise)
    
    try {
      const result = await promise
      return result
    } finally {
      this.pending.delete(key)
    }
  }
}
```

### 离线队列
```typescript
class OfflineQueue {
  private queue: QueueItem[] = []
  
  add(request: APIRequest): void {
    this.queue.push({
      id: generateId(),
      request,
      timestamp: Date.now(),
      retryCount: 0
    })
    this.saveToStorage()
  }
  
  async processQueue(): Promise<void> {
    while (this.queue.length > 0) {
      const item = this.queue.shift()!
      try {
        await this.executeRequest(item.request)
      } catch (error) {
        if (item.retryCount < 3) {
          item.retryCount++
          this.queue.unshift(item) // 重新加入队列
        }
      }
    }
  }
}
```

## 📈 API监控

### 性能指标
- **响应时间** - 平均响应时间和P95响应时间
- **成功率** - API调用成功率
- **错误率** - 各类错误的发生率
- **并发数** - 同时进行的API调用数量

### 监控实现
```typescript
class APIMonitor {
  private metrics = {
    totalRequests: 0,
    successRequests: 0,
    errorRequests: 0,
    totalResponseTime: 0
  }
  
  recordRequest(duration: number, success: boolean): void {
    this.metrics.totalRequests++
    this.metrics.totalResponseTime += duration
    
    if (success) {
      this.metrics.successRequests++
    } else {
      this.metrics.errorRequests++
    }
  }
  
  getMetrics() {
    return {
      ...this.metrics,
      averageResponseTime: this.metrics.totalResponseTime / this.metrics.totalRequests,
      successRate: this.metrics.successRequests / this.metrics.totalRequests,
      errorRate: this.metrics.errorRequests / this.metrics.totalRequests
    }
  }
}
```

---

*API接口设计遵循RESTful规范，提供清晰的接口定义、完善的错误处理和性能优化，确保移动端应用能够稳定、高效地与后端专家系统通信。*
