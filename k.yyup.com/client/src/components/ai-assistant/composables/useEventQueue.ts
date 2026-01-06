import { ref, nextTick } from 'vue'

/**
 * 事件队列管理器
 * 用于批量处理SSE事件，减少Vue响应式触发次数，提升性能
 */

export interface QueuedEvent {
  type: string
  data: any
  timestamp: number
}

export interface EventQueueOptions {
  batchSize?: number // 每批处理的事件数量，默认10
  flushInterval?: number // 自动刷新间隔（毫秒），默认50ms
  maxQueueSize?: number // 最大队列长度，默认1000
}

export function useEventQueue(options: EventQueueOptions = {}) {
  const {
    batchSize = 10,
    flushInterval = 50,
    maxQueueSize = 1000
  } = options

  // 事件队列
  const eventQueue = ref<QueuedEvent[]>([])
  
  // 处理中标志
  const isProcessing = ref(false)
  
  // 自动刷新定时器
  let flushTimer: number | null = null
  
  // 统计信息
  const stats = ref({
    totalEvents: 0,
    processedEvents: 0,
    droppedEvents: 0,
    batchCount: 0
  })

  /**
   * 添加事件到队列
   */
  const enqueue = (type: string, data: any) => {
    // 检查队列是否已满
    if (eventQueue.value.length >= maxQueueSize) {
      console.warn(`⚠️ [EventQueue] 队列已满，丢弃事件: ${type}`)
      stats.value.droppedEvents++
      return
    }

    // 添加事件到队列
    eventQueue.value.push({
      type,
      data,
      timestamp: Date.now()
    })
    
    stats.value.totalEvents++
    
    // 如果队列达到批量大小，立即处理
    if (eventQueue.value.length >= batchSize) {
      flush()
    } else {
      // 否则设置定时器，在一定时间后自动刷新
      scheduleFlush()
    }
  }

  /**
   * 调度刷新
   */
  const scheduleFlush = () => {
    if (flushTimer !== null) {
      return // 已经有定时器在运行
    }
    
    flushTimer = window.setTimeout(() => {
      flush()
      flushTimer = null
    }, flushInterval)
  }

  /**
   * 刷新队列，批量处理事件
   */
  const flush = async () => {
    if (isProcessing.value || eventQueue.value.length === 0) {
      return
    }

    // 清除定时器
    if (flushTimer !== null) {
      clearTimeout(flushTimer)
      flushTimer = null
    }

    isProcessing.value = true

    try {
      // 取出一批事件
      const batch = eventQueue.value.splice(0, batchSize)
      
      console.log(`📦 [EventQueue] 批量处理 ${batch.length} 个事件`)
      
      // 返回这批事件供处理
      stats.value.processedEvents += batch.length
      stats.value.batchCount++
      
      // 等待下一个tick，确保DOM更新在一个tick内完成
      await nextTick()
      
      return batch
    } finally {
      isProcessing.value = false
      
      // 如果队列中还有事件，继续处理
      if (eventQueue.value.length > 0) {
        scheduleFlush()
      }
    }
  }

  /**
   * 处理队列中的所有事件
   */
  const processQueue = async (handler: (events: QueuedEvent[]) => void | Promise<void>) => {
    while (eventQueue.value.length > 0) {
      const batch = await flush()
      if (batch && batch.length > 0) {
        await handler(batch)
      }
    }
  }

  /**
   * 清空队列
   */
  const clear = () => {
    eventQueue.value = []
    if (flushTimer !== null) {
      clearTimeout(flushTimer)
      flushTimer = null
    }
    console.log('🧹 [EventQueue] 队列已清空')
  }

  /**
   * 获取队列状态
   */
  const getStatus = () => {
    return {
      queueLength: eventQueue.value.length,
      isProcessing: isProcessing.value,
      stats: { ...stats.value }
    }
  }

  /**
   * 重置统计信息
   */
  const resetStats = () => {
    stats.value = {
      totalEvents: 0,
      processedEvents: 0,
      droppedEvents: 0,
      batchCount: 0
    }
  }

  return {
    // 方法
    enqueue,
    flush,
    processQueue,
    clear,
    getStatus,
    resetStats,
    
    // 状态
    eventQueue,
    isProcessing,
    stats
  }
}

/**
 * 创建一个简单的事件处理器
 * 用于将事件队列与实际的事件处理逻辑连接
 */
export function createEventHandler(
  queue: ReturnType<typeof useEventQueue>,
  handlers: Record<string, (data: any) => void | Promise<void>>
) {
  return async () => {
    await queue.processQueue(async (events) => {
      for (const event of events) {
        const handler = handlers[event.type]
        if (handler) {
          try {
            await handler(event.data)
          } catch (error) {
            console.error(`❌ [EventQueue] 处理事件失败: ${event.type}`, error)
          }
        } else {
          console.warn(`⚠️ [EventQueue] 未找到事件处理器: ${event.type}`)
        }
      }
    })
  }
}

/**
 * 使用示例：
 * 
 * const eventQueue = useEventQueue({
 *   batchSize: 10,
 *   flushInterval: 50
 * })
 * 
 * // 添加事件到队列
 * eventQueue.enqueue('content_update', { content: 'Hello' })
 * eventQueue.enqueue('thinking', 'AI is thinking...')
 * 
 * // 创建事件处理器
 * const handleEvents = createEventHandler(eventQueue, {
 *   content_update: (data) => {
 *     console.log('Content:', data.content)
 *   },
 *   thinking: (data) => {
 *     console.log('Thinking:', data)
 *   }
 * })
 * 
 * // 定期处理队列
 * setInterval(handleEvents, 100)
 */

