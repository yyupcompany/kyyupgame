/**
 * AI助手消息队列管理器
 * 防止并发发送，按顺序处理消息
 */

import { ref, computed } from 'vue'

// 消息项接口
export interface MessageQueueItem {
  id: string                    // 唯一标识
  content: string               // 消息内容
  timestamp: number             // 入队时间
  priority: number              // 优先级（数字越小优先级越高）
  onResolve: (result: any) => void  // 成功回调
  onReject: (error: any) => void    // 失败回调
}

// 队列状态
export enum QueueStatus {
  IDLE = 'idle',
  PROCESSING = 'processing',
  PAUSED = 'paused'
}

export class MessageQueueManager {
  // 消息队列
  private queue: MessageQueueItem[] = []

  // 状态
  private _status = ref<QueueStatus>(QueueStatus.IDLE)
  get status() { return this._status.value }
  set status(v) { this._status.value = v }

  // 统计
  private _processedCount = ref(0)
  get processedCount() { return this._processedCount.value }

  private _failedCount = ref(0)
  get failedCount() { return this._failedCount.value }

  private _totalCount = ref(0)
  get totalCount() { return this._totalCount.value }

  // 处理中的消息
  private processingItem: MessageQueueItem | null = null

  // 配置
  private config: {
    maxQueueSize: number           // 最大队列长度
    processDelay: number           // 处理延迟（毫秒）
    autoProcess: boolean           // 是否自动处理
  }

  constructor(config?: Partial<{
    maxQueueSize: number
    processDelay: number
    autoProcess: boolean
  }>) {
    this.config = {
      maxQueueSize: config?.maxQueueSize ?? 50,      // 默认最大50条
      processDelay: config?.processDelay ?? 100,     // 默认100ms延迟
      autoProcess: config?.autoProcess ?? true       // 默认自动处理
    }
  }

  // 是否可以添加消息
  get canAdd(): boolean {
    return this.queue.length < this.config.maxQueueSize
  }

  // 当前队列长度
  get length(): number {
    return this.queue.length
  }

  // 是否正在处理
  get isProcessing(): boolean {
    return this.status === QueueStatus.PROCESSING
  }

  // 队列是否为空
  get isEmpty(): boolean {
    return this.queue.length === 0
  }

  // 添加消息到队列
  enqueue(
    content: string,
    onResolve: (result: any) => void,
    onReject: (error: any) => void,
    priority: number = 0
  ): string {
    // 检查队列是否已满
    if (!this.canAdd) {
      const error = new Error('消息队列已满，请稍后再试')
      onReject(error)
      throw error
    }

    const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const item: MessageQueueItem = {
      id,
      content,
      timestamp: Date.now(),
      priority,
      onResolve,
      onReject
    }

    // 根据优先级插入队列
    if (this.queue.length === 0 || priority >= this.queue[this.queue.length - 1].priority) {
      // 优先级较高或队列为空，添加到末尾
      this.queue.push(item)
    } else {
      // 找到合适的位置插入
      let insertIndex = this.queue.length - 1
      while (insertIndex >= 0 && this.queue[insertIndex].priority > priority) {
        insertIndex--
      }
      this.queue.splice(insertIndex + 1, 0, item)
    }

    this._totalCount++

    console.log(`[消息队列] 添加消息 "${content.substring(0, 30)}..."，队列长度: ${this.queue.length}`)

    // 如果启用自动处理且当前空闲，开始处理
    if (this.config.autoProcess && this.status === QueueStatus.IDLE) {
      this.processNext()
    }

    return id
  }

  // 优先级快捷方法
  addHighPriority(content: string, onResolve: (result: any) => void, onReject: (error: any) => void) {
    return this.enqueue(content, onResolve, onReject, -1)  // 高优先级
  }

  addNormalPriority(content: string, onResolve: (result: any) => void, onReject: (error: any) => void) {
    return this.enqueue(content, onResolve, onReject, 0)  // 普通优先级
  }

  addLowPriority(content: string, onResolve: (result: any) => void, onReject: (error: any) => void) {
    return this.enqueue(content, onResolve, onReject, 1)  // 低优先级
  }

  // 处理下一条消息
  private async processNext() {
    if (this.queue.length === 0) {
      this.status = QueueStatus.IDLE
      this.processingItem = null
      console.log('[消息队列] 队列已空，停止处理')
      return
    }

    // 取出下一条消息
    const item = this.queue.shift()!
    this.processingItem = item
    this.status = QueueStatus.PROCESSING

    console.log(`[消息队列] 开始处理消息 "${item.content.substring(0, 30)}..."，剩余: ${this.queue.length}`)

    // 延迟处理（给用户视觉反馈时间）
    await this.delay(this.config.processDelay)

    // 标记处理开始
    const startTime = Date.now()

    try {
      // 这里需要外部提供处理函数
      // 通过事件机制通知外部处理
      const result = await this.executeMessageHandler(item.content)

      // 计算处理耗时
      const duration = Date.now() - startTime
      console.log(`[消息队列] 消息处理完成，耗时: ${duration}ms`)

      // 通知成功
      item.onResolve(result)
      this._processedCount++

    } catch (error) {
      console.error(`[消息队列] 消息处理失败:`, error)
      item.onReject(error)
      this._failedCount++
    }

    // 继续处理下一条
    this.processNext()
  }

  // 消息处理器（需要外部设置）
  private messageHandler: ((content: string) => Promise<any>) | null = null

  // 设置消息处理器
  setMessageHandler(handler: (content: string) => Promise<any>) {
    this.messageHandler = handler
    console.log('[消息队列] 消息处理器已设置')
  }

  // 执行消息处理
  private async executeMessageHandler(content: string): Promise<any> {
    if (!this.messageHandler) {
      throw new Error('消息处理器未设置')
    }
    return this.messageHandler(content)
  }

  // 取消特定消息
  cancel(id: string): boolean {
    const index = this.queue.findIndex(item => item.id === id)
    if (index === -1) return false

    const item = this.queue[index]
    this.queue.splice(index, 1)

    // 通知取消
    item.onReject(new Error('消息已被取消'))

    console.log(`[消息队列] 取消消息: ${id}`)
    return true
  }

  // 清空队列
  clear() {
    // 拒绝所有待处理的消息
    for (const item of this.queue) {
      item.onReject(new Error('队列已清空'))
    }

    this.queue = []
    this.status = QueueStatus.IDLE
    this.processingItem = null

    console.log('[消息队列] 队列已清空')
  }

  // 暂停处理
  pause() {
    this.status = QueueStatus.PAUSED
    console.log('[消息队列] 处理已暂停')
  }

  // 恢复处理
  resume() {
    if (this.status === QueueStatus.PAUSED && this.queue.length > 0) {
      this.processNext()
    }
  }

  // 延迟辅助函数
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // 获取队列统计
  getStats() {
    return {
      status: this.status,
      queueLength: this.queue.length,
      processedCount: this._processedCount,
      failedCount: this._failedCount,
      totalCount: this._totalCount,
      isProcessing: this.isProcessing,
      canAdd: this.canAdd,
      processingItem: this.processingItem?.id || null
    }
  }

  // 获取队列预览（用于调试）
  getQueuePreview() {
    return this.queue.map((item, index) => ({
      index,
      id: item.id,
      content: item.content.substring(0, 50),
      priority: item.priority,
      timestamp: new Date(item.timestamp).toLocaleTimeString()
    }))
  }

  // 销毁
  destroy() {
    this.clear()
    this._processedCount = 0
    this._failedCount = 0
    this._totalCount = 0
    console.log('[消息队列] 实例已销毁')
  }
}

// 导出单例
let globalQueueManager: MessageQueueManager | null = null

export function getGlobalMessageQueueManager(config?: Parameters<typeof MessageQueueManager>[0]): MessageQueueManager {
  if (!globalQueueManager) {
    globalQueueManager = new MessageQueueManager(config)
  }
  return globalQueueManager
}

export function destroyGlobalMessageQueueManager() {
  if (globalQueueManager) {
    globalQueueManager.destroy()
    globalQueueManager = null
  }
}
