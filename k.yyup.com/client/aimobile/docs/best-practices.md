# 🎯 最佳实践指南

## 🎯 开发最佳实践

### 📱 移动端开发原则

#### 1. 移动优先设计
```typescript
// ✅ 好的做法：移动优先的响应式设计
const useResponsiveDesign = () => {
  const isMobile = ref(window.innerWidth <= 768)
  const isTablet = ref(window.innerWidth > 768 && window.innerWidth <= 1024)
  
  // 监听屏幕尺寸变化
  const updateScreenSize = () => {
    isMobile.value = window.innerWidth <= 768
    isTablet.value = window.innerWidth > 768 && window.innerWidth <= 1024
  }
  
  onMounted(() => {
    window.addEventListener('resize', updateScreenSize)
  })
  
  return { isMobile, isTablet }
}

// ❌ 避免：桌面优先的设计思路
```

#### 2. 触摸友好的交互
```css
/* ✅ 好的做法：44px最小触摸目标 */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  padding: 12px;
  margin: 8px;
}

/* ✅ 好的做法：触摸状态反馈 */
.button {
  transition: all 0.2s ease;
}

.button:active {
  transform: scale(0.95);
  background-color: var(--primary-dark);
}

/* ❌ 避免：过小的触摸目标 */
.small-button {
  width: 20px;
  height: 20px;
}
```

#### 3. 性能优化
```typescript
// ✅ 好的做法：懒加载组件
const LazyComponent = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 3000
})

// ✅ 好的做法：虚拟滚动
const useVirtualScroll = (items: Ref<any[]>, itemHeight: number) => {
  const containerHeight = ref(400)
  const scrollTop = ref(0)
  
  const visibleItems = computed(() => {
    const start = Math.floor(scrollTop.value / itemHeight)
    const end = Math.min(start + Math.ceil(containerHeight.value / itemHeight) + 1, items.value.length)
    return items.value.slice(start, end).map((item, index) => ({
      ...item,
      index: start + index
    }))
  })
  
  return { visibleItems, scrollTop }
}
```

### 🧠 AI专家系统最佳实践

#### 1. 智能任务规划
```typescript
// ✅ 好的做法：结构化的任务描述
const createTaskPlan = async (description: string) => {
  // 1. 任务预处理
  const preprocessedTask = preprocessTaskDescription(description)
  
  // 2. 意图识别
  const intent = await identifyTaskIntent(preprocessedTask)
  
  // 3. 参数提取
  const parameters = extractTaskParameters(preprocessedTask)
  
  // 4. 生成执行计划
  const plan = await generateExecutionPlan(intent, parameters)
  
  return plan
}

// ✅ 好的做法：上下文管理
class TaskContext {
  private context: Map<string, any> = new Map()
  
  set(key: string, value: any): void {
    this.context.set(key, {
      value,
      timestamp: Date.now(),
      type: typeof value
    })
  }
  
  get(key: string): any {
    const item = this.context.get(key)
    return item?.value
  }
  
  // 清理过期上下文
  cleanup(maxAge: number = 3600000): void { // 1小时
    const now = Date.now()
    for (const [key, item] of this.context.entries()) {
      if (now - item.timestamp > maxAge) {
        this.context.delete(key)
      }
    }
  }
}
```

#### 2. 专家调用优化
```typescript
// ✅ 好的做法：专家调用缓存
class ExpertCallCache {
  private cache = new Map<string, CacheItem>()
  
  private generateCacheKey(expertId: string, task: string, context?: string): string {
    return `${expertId}:${hashString(task + (context || ''))}`
  }
  
  async callExpert(expertId: string, task: string, context?: string): Promise<ExpertResponse> {
    const cacheKey = this.generateCacheKey(expertId, task, context)
    
    // 检查缓存
    const cached = this.cache.get(cacheKey)
    if (cached && cached.expiry > Date.now()) {
      return cached.data
    }
    
    // 调用专家
    const response = await mobileAPIService.callSmartExpert({
      expert_id: expertId,
      task,
      context
    })
    
    // 缓存结果（5分钟）
    this.cache.set(cacheKey, {
      data: response,
      expiry: Date.now() + 5 * 60 * 1000
    })
    
    return response
  }
}

// ✅ 好的做法：并行专家调用
const callExpertsInParallel = async (calls: ExpertCall[]): Promise<ExpertResponse[]> => {
  const promises = calls.map(call => 
    expertCallCache.callExpert(call.expertId, call.task, call.context)
  )
  
  return Promise.allSettled(promises).then(results => 
    results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        console.error(`专家调用失败: ${calls[index].expertId}`, result.reason)
        return null
      }
    }).filter(Boolean)
  )
}
```

### 🔄 工作流设计最佳实践

#### 1. 工作流定义
```typescript
// ✅ 好的做法：清晰的工作流结构
interface WorkflowDefinition {
  id: string
  name: string
  description: string
  version: string
  steps: WorkflowStep[]
  metadata: {
    author: string
    createdAt: string
    tags: string[]
    estimatedDuration: number
    complexity: 'low' | 'medium' | 'high'
  }
}

// ✅ 好的做法：步骤依赖管理
const validateWorkflowDependencies = (workflow: WorkflowDefinition): boolean => {
  const stepIds = new Set(workflow.steps.map(step => step.id))
  
  for (const step of workflow.steps) {
    for (const dependency of step.dependencies) {
      if (!stepIds.has(dependency)) {
        throw new Error(`步骤 ${step.id} 依赖的步骤 ${dependency} 不存在`)
      }
    }
  }
  
  // 检查循环依赖
  return !hasCyclicDependencies(workflow.steps)
}
```

#### 2. 错误处理和重试
```typescript
// ✅ 好的做法：智能重试策略
class RetryStrategy {
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error
        
        if (attempt === maxRetries) {
          break
        }
        
        // 指数退避
        const delay = baseDelay * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    throw lastError
  }
}

// ✅ 好的做法：降级处理
const executeStepWithFallback = async (step: WorkflowStep): Promise<StepResult> => {
  try {
    return await executeStep(step)
  } catch (error) {
    console.warn(`步骤 ${step.id} 执行失败，尝试降级处理`, error)
    
    // 尝试降级方案
    if (step.fallback) {
      return await executeFallbackStep(step.fallback)
    }
    
    // 返回默认结果
    return {
      stepId: step.id,
      status: 'failed',
      error: error.message,
      result: getDefaultResult(step.type)
    }
  }
}
```

### 💾 数据管理最佳实践

#### 1. 存储策略
```typescript
// ✅ 好的做法：分层存储策略
class DataManager {
  // 热数据：内存存储
  private memoryCache = new Map<string, any>()
  
  // 温数据：会话存储
  private sessionStorage = window.sessionStorage
  
  // 冷数据：本地存储
  private localStorage = window.localStorage
  
  // 大数据：IndexedDB
  private indexedDB: IDBDatabase
  
  async store(key: string, data: any, strategy: StorageStrategy): Promise<void> {
    switch (strategy) {
      case 'hot':
        this.memoryCache.set(key, data)
        break
      case 'warm':
        this.sessionStorage.setItem(key, JSON.stringify(data))
        break
      case 'cold':
        this.localStorage.setItem(key, JSON.stringify(data))
        break
      case 'archive':
        await this.storeInIndexedDB(key, data)
        break
    }
  }
}

// ✅ 好的做法：数据压缩
const compressData = (data: any): string => {
  const jsonString = JSON.stringify(data)
  
  // 对于大数据使用压缩
  if (jsonString.length > 10000) {
    return LZString.compress(jsonString)
  }
  
  return jsonString
}
```

#### 2. 缓存管理
```typescript
// ✅ 好的做法：LRU缓存实现
class LRUCache<T> {
  private capacity: number
  private cache = new Map<string, T>()
  
  constructor(capacity: number) {
    this.capacity = capacity
  }
  
  get(key: string): T | undefined {
    if (this.cache.has(key)) {
      // 移动到最后（最近使用）
      const value = this.cache.get(key)!
      this.cache.delete(key)
      this.cache.set(key, value)
      return value
    }
    return undefined
  }
  
  set(key: string, value: T): void {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.capacity) {
      // 删除最久未使用的项
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    
    this.cache.set(key, value)
  }
}
```

### 🎨 UI/UX最佳实践

#### 1. 组件设计
```vue
<!-- ✅ 好的做法：可复用的组件设计 -->
<template>
  <div class="expert-card" :class="cardClasses">
    <div class="expert-avatar">
      <img v-if="expert.avatar" :src="expert.avatar" :alt="expert.name">
      <div v-else class="avatar-placeholder">{{ expert.icon }}</div>
    </div>
    
    <div class="expert-info">
      <h3>{{ expert.name }}</h3>
      <p>{{ expert.description }}</p>
      
      <div class="expert-stats">
        <span class="rating">⭐ {{ expert.rating }}</span>
        <span class="usage">{{ expert.usageCount }}次咨询</span>
      </div>
    </div>
    
    <div class="expert-actions">
      <slot name="actions" :expert="expert">
        <button @click="$emit('chat', expert)">开始对话</button>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  expert: Expert
  size?: 'small' | 'medium' | 'large'
  variant?: 'default' | 'compact' | 'detailed'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  variant: 'default'
})

const emit = defineEmits<{
  chat: [expert: Expert]
  favorite: [expert: Expert]
}>()

const cardClasses = computed(() => [
  `expert-card--${props.size}`,
  `expert-card--${props.variant}`
])
</script>
```

#### 2. 状态管理
```typescript
// ✅ 好的做法：Pinia状态管理
export const useWorkflowStore = defineStore('workflow', () => {
  // 状态
  const activeWorkflows = ref<Workflow[]>([])
  const executionHistory = ref<ExecutionResult[]>([])
  const isExecuting = ref(false)
  
  // 计算属性
  const runningWorkflows = computed(() => 
    activeWorkflows.value.filter(w => w.status === 'running')
  )
  
  const completedWorkflows = computed(() => 
    activeWorkflows.value.filter(w => w.status === 'completed')
  )
  
  // 操作
  const startWorkflow = async (definition: WorkflowDefinition) => {
    isExecuting.value = true
    
    try {
      const workflow = await workflowEngine.executeWorkflow(definition)
      activeWorkflows.value.push(workflow)
      return workflow
    } finally {
      isExecuting.value = false
    }
  }
  
  const stopWorkflow = async (workflowId: string) => {
    const workflow = activeWorkflows.value.find(w => w.id === workflowId)
    if (workflow) {
      await workflowEngine.stopWorkflow(workflowId)
      workflow.status = 'stopped'
    }
  }
  
  // 持久化
  const saveToStorage = () => {
    mobileStorageService.set('workflows', {
      active: activeWorkflows.value,
      history: executionHistory.value
    }, { type: StorageType.LOCAL })
  }
  
  const loadFromStorage = async () => {
    const data = await mobileStorageService.get('workflows', StorageType.LOCAL)
    if (data) {
      activeWorkflows.value = data.active || []
      executionHistory.value = data.history || []
    }
  }
  
  return {
    // 状态
    activeWorkflows: readonly(activeWorkflows),
    executionHistory: readonly(executionHistory),
    isExecuting: readonly(isExecuting),
    
    // 计算属性
    runningWorkflows,
    completedWorkflows,
    
    // 操作
    startWorkflow,
    stopWorkflow,
    saveToStorage,
    loadFromStorage
  }
})
```

### 🔒 安全最佳实践

#### 1. 数据安全
```typescript
// ✅ 好的做法：敏感数据加密
class SecureStorage {
  private encryptionKey: string
  
  constructor() {
    this.encryptionKey = this.generateEncryptionKey()
  }
  
  encrypt(data: string): string {
    // 使用AES加密
    return CryptoJS.AES.encrypt(data, this.encryptionKey).toString()
  }
  
  decrypt(encryptedData: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey)
    return bytes.toString(CryptoJS.enc.Utf8)
  }
  
  secureStore(key: string, data: any): void {
    const jsonString = JSON.stringify(data)
    const encrypted = this.encrypt(jsonString)
    localStorage.setItem(key, encrypted)
  }
  
  secureRetrieve(key: string): any {
    const encrypted = localStorage.getItem(key)
    if (!encrypted) return null
    
    try {
      const decrypted = this.decrypt(encrypted)
      return JSON.parse(decrypted)
    } catch (error) {
      console.error('数据解密失败:', error)
      return null
    }
  }
}
```

#### 2. API安全
```typescript
// ✅ 好的做法：请求签名
class APISecurityManager {
  private apiKey: string
  private secretKey: string
  
  generateSignature(method: string, url: string, body: string, timestamp: number): string {
    const message = `${method}\n${url}\n${body}\n${timestamp}`
    return CryptoJS.HmacSHA256(message, this.secretKey).toString()
  }
  
  secureRequest(config: RequestConfig): RequestConfig {
    const timestamp = Date.now()
    const signature = this.generateSignature(
      config.method,
      config.url,
      config.body || '',
      timestamp
    )
    
    return {
      ...config,
      headers: {
        ...config.headers,
        'X-API-Key': this.apiKey,
        'X-Timestamp': timestamp.toString(),
        'X-Signature': signature
      }
    }
  }
}
```

### 📊 监控和调试最佳实践

#### 1. 性能监控
```typescript
// ✅ 好的做法：性能指标收集
class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  
  startMeasure(name: string): string {
    const id = `${name}_${Date.now()}_${Math.random()}`
    performance.mark(`${id}_start`)
    return id
  }
  
  endMeasure(id: string): number {
    performance.mark(`${id}_end`)
    performance.measure(id, `${id}_start`, `${id}_end`)
    
    const measure = performance.getEntriesByName(id)[0]
    const duration = measure.duration
    
    this.metrics.push({
      name: id.split('_')[0],
      duration,
      timestamp: Date.now()
    })
    
    // 清理性能标记
    performance.clearMarks(`${id}_start`)
    performance.clearMarks(`${id}_end`)
    performance.clearMeasures(id)
    
    return duration
  }
  
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }
  
  getAverageTime(name: string): number {
    const relevantMetrics = this.metrics.filter(m => m.name === name)
    if (relevantMetrics.length === 0) return 0
    
    const total = relevantMetrics.reduce((sum, m) => sum + m.duration, 0)
    return total / relevantMetrics.length
  }
}
```

#### 2. 错误追踪
```typescript
// ✅ 好的做法：结构化错误日志
class ErrorTracker {
  private errors: ErrorLog[] = []
  
  logError(error: Error, context?: any): void {
    const errorLog: ErrorLog = {
      id: generateId(),
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      context: context ? JSON.stringify(context) : undefined
    }
    
    this.errors.push(errorLog)
    
    // 发送到错误监控服务
    this.sendToErrorService(errorLog)
    
    // 本地存储（用于离线时）
    this.saveToLocalStorage()
  }
  
  private async sendToErrorService(errorLog: ErrorLog): Promise<void> {
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorLog)
      })
    } catch (error) {
      console.warn('无法发送错误日志到服务器:', error)
    }
  }
}
```

---

*这些最佳实践基于现代前端开发经验和移动端应用的特殊需求，遵循这些实践可以确保代码质量、性能和用户体验。*
