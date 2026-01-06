/**
 * AI动态数据处理测试
 * 测试流式响应、大文件处理、并发请求等动态场景
 */

import { 
// 控制台错误检测
let consoleSpy: any

beforeEach(() => {
  // 监听控制台错误
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  // 验证没有控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
})

describe, it, expect, vi, beforeEach } from 'vitest'
import { aiService, get, post, put, del } from '@/utils/request'
import { aiApi } from '@/api/ai'

// 使用统一的Mock配置
import { setupRequestMock } from '../../mocks/request.mock'
setupRequestMock()

// 模拟流式AI响应
const createMockStreamResponse = (chunks: Array<{ type?: string; content?: string; role?: string }>) => {
  return async function* () {
    for (const chunk of chunks) {
      yield chunk
      await new Promise(resolve => setTimeout(resolve, 100)) // 模拟流式延迟
    }
  }
}

// 真实的流式聊天响应数据
const mockStreamChatResponse = createMockStreamResponse([
  { type: 'start' },
  { role: 'assistant', content: '我' },
  { role: 'assistant', content: '正在' },
  { role: 'assistant', content: '为您' },
  { role: 'assistant', content: '分析' },
  { role: 'assistant', content: '这个' },
  { role: 'assistant', content: '问题' },
  { role: 'assistant', content: '...' },
  { type: 'thinking' },
  { role: 'assistant', content: '根据' },
  { role: 'assistant', content: '您的' },
  { role: 'assistant', content: '描述，' },
  { role: 'assistant', content: '这' },
  { role: 'assistant', content: '是' },
  { role: 'assistant', content: '一个' },
  { role: 'assistant', content: '关于' },
  { role: 'assistant', content: '幼儿园' },
  { role: 'assistant', content: '管理' },
  { role: 'assistant', content: '的问题。' },
  { type: 'end' }
])

// 大文件处理响应数据
const mockLargeFileProcessingResponse = {
  success: true,
  data: {
    job_id: 'job_large_file_' + Date.now(),
    status: 'processing',
    file_info: {
      name: 'large_dataset.csv',
      size: 52428800, // 50MB
      type: 'text/csv',
      lines_count: 500000,
      estimated_processing_time: 180, // 3分钟
      chunks_processed: 0,
      total_chunks: 500
    },
    processing_config: {
      chunk_size: 1000,
      parallel_workers: 4,
      memory_limit: '2GB',
      timeout: 600
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}

// 大文件处理完成响应
const mockLargeFileProcessingCompleteResponse = {
  success: true,
  data: {
    job_id: 'job_large_file_' + Date.now(),
    status: 'completed',
    file_info: {
      name: 'large_dataset.csv',
      size: 52428800,
      type: 'text/csv',
      lines_count: 500000,
      processed_lines: 500000,
      chunks_processed: 500,
      total_chunks: 500
    },
    results: {
      summary: {
        total_records: 500000,
        successful_records: 498750,
        failed_records: 1250,
        processing_time: 165,
        accuracy: 99.75
      },
      insights: [
        {
          category: 'student_performance',
          key_findings: '85%的学生表现良好',
          confidence: 0.92
        },
        {
          category: 'attendance_patterns',
          key_findings: '出勤率趋势稳定',
          confidence: 0.88
        }
      ],
      generated_reports: [
        {
          type: 'performance_analysis',
          file_url: 'https://example.com/reports/performance.pdf',
          size: 2048576
        },
        {
          type: 'attendance_summary',
          file_url: 'https://example.com/reports/attendance.pdf',
          size: 1024000
        }
      ]
    },
    completed_at: new Date().toISOString()
  }
}

// 并发请求配置
const concurrentRequestsConfig = {
  maxConcurrent: 10,
  timeoutMs: 30000,
  retryAttempts: 3
}

describe('AI Dynamic Processing Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Streaming AI Responses', () => {
    it('should handle streaming chat responses correctly', async () => {
      vi.mocked(aiService.streamChat).mockReturnValue(mockStreamChatResponse())

      const request = {
        model: 'gpt-4',
        messages: [{ role: 'user', content: '请分析幼儿园管理的关键指标' }],
        stream: true
      }

      const stream = aiService.streamChat('/ai/chat/stream', request)
      const chunks = []

      for await (const chunk of stream) {
        chunks.push(chunk)
      }

      // 验证流式响应结构
      expect(chunks.length).toBeGreaterThan(0)

      // 验证开始标记
      expect(chunks[0]).toHaveProperty('type', 'start')

      // 验证内容块
      const contentChunks = chunks.filter(chunk => chunk.content)
      expect(contentChunks.length).toBeGreaterThan(0)

      // 验证结束标记
      expect(chunks[chunks.length - 1]).toHaveProperty('type', 'end')

      // 验证流式内容拼接
      const fullContent = contentChunks
        .map(chunk => chunk.content)
        .join('')

      expect(fullContent).toContain('幼儿园')
      expect(fullContent).toContain('管理')
    })

    it('should handle real-time streaming with proper delays', async () => {
      const chunks = [
        { type: 'start' },
        { role: 'assistant', content: '正在' },
        { type: 'thinking' },
        { role: 'assistant', content: '处理' },
        { role: 'assistant', content: '您的' },
        { role: 'assistant', content: '请求...' },
        { type: 'end' }
      ]

      const streamGenerator = createMockStreamResponse(chunks)
      const stream = streamGenerator()
      const startTime = Date.now()
      const receivedChunks = []

      for await (const chunk of stream) {
        receivedChunks.push(chunk)
      }

      const endTime = Date.now()
      const totalTime = endTime - startTime

      // 验证所有块都被接收
      expect(receivedChunks).toEqual(chunks)

      // 验证流式延迟（每个块100ms，总共600ms）
      expect(totalTime).toBeGreaterThan(500)
      expect(totalTime).toBeLessThan(1000) // 允许一些误差
    })

    it('should handle streaming errors gracefully', async () => {
      const errorStream = async function* () {
        yield { type: 'start' }
        yield { role: 'assistant', content: '开始处理...' }
        throw new Error('Stream connection lost')
      }

      vi.mocked(aiService.streamChat).mockReturnValue(errorStream())

      const chunks = []
      let errorCaught = false

      try {
        for await (const chunk of aiService.streamChat('/ai/chat/stream', {})) {
          chunks.push(chunk)
        }
      } catch (error) {
        errorCaught = true
        expect(error.message).toBe('Stream connection lost')
      }

      expect(errorCaught).toBe(true)
      expect(chunks.length).toBe(2)
      expect(chunks[0].type).toBe('start')
      expect(chunks[1].content).toBe('开始处理...')
    })

    it('should handle streaming with different content types', async () => {
      const mixedStream = async function* () {
        yield { type: 'start' }
        yield { role: 'assistant', content: '文本响应', content_type: 'text' }
        yield { role: 'assistant', content: { data: 'JSON数据' }, content_type: 'json' }
        yield { role: 'assistant', content: '<code>代码片段</code>', content_type: 'code' }
        yield { type: 'end' }
      }

      vi.mocked(aiService.streamChat).mockReturnValue(mixedStream())

      const chunks = []
      for await (const chunk of aiService.streamChat('/ai/chat/stream', {})) {
        chunks.push(chunk)
      }

      const textChunk = chunks.find(c => c.content_type === 'text')
      const jsonChunk = chunks.find(c => c.content_type === 'json')
      const codeChunk = chunks.find(c => c.content_type === 'code')

      expect(textChunk).toBeDefined()
      expect(jsonChunk).toBeDefined()
      expect(codeChunk).toBeDefined()
      expect(jsonChunk.content.data).toBe('JSON数据')
    })
  })

  describe('Large File Processing', () => {
    it('should handle large file processing initiation', async () => {
      vi.mocked(post).mockResolvedValue(mockLargeFileProcessingResponse)

      const fileRequest = {
        file_name: 'large_dataset.csv',
        file_size: 52428800, // 50MB
        processing_options: {
          chunk_size: 1000,
          analysis_types: ['sentiment', 'trends', 'patterns'],
          output_format: 'json'
        }
      }

      const response = await post('/ai/file/processing/start', fileRequest)

      // 验证响应结构
      expect(response.success).toBe(true)
      expect(response.data.job_id).toBeDefined()
      expect(response.data.status).toBe('processing')

      // 验证文件信息
      const fileInfo = response.data.file_info
      expect(fileInfo.name).toBe('large_dataset.csv')
      expect(fileInfo.size).toBe(52428800)
      expect(fileInfo.lines_count).toBe(500000)
      expect(fileInfo.estimated_processing_time).toBe(180)

      // 验证处理配置
      const config = response.data.processing_config
      expect(config.chunk_size).toBe(1000)
      expect(config.parallel_workers).toBe(4)
      expect(config.memory_limit).toBe('2GB')
    })

    it('should handle large file processing progress updates', async () => {
      const progressResponses = [
        { progress: 0.1, chunks_processed: 50, current_line: 10000 },
        { progress: 0.25, chunks_processed: 125, current_line: 25000 },
        { progress: 0.5, chunks_processed: 250, current_line: 50000 },
        { progress: 0.75, chunks_processed: 375, current_line: 75000 },
        { progress: 0.9, chunks_processed: 450, current_line: 90000 }
      ]

      vi.mocked(get).mockImplementation((url) => {
        const jobId = url.split('/').pop()
        const progressIndex = parseInt(jobId.split('_').pop()) || 0

        if (progressIndex < progressResponses.length) {
          return Promise.resolve({
            success: true,
            data: {
              job_id: jobId,
              status: 'processing',
              progress: progressResponses[progressIndex].progress,
              chunks_processed: progressResponses[progressIndex].chunks_processed,
              current_line: progressResponses[progressIndex].current_line,
              estimated_remaining_time: Math.ceil((1 - progressResponses[progressIndex].progress) * 180)
            }
          })
        }

        return Promise.resolve(mockLargeFileProcessingCompleteResponse)
      })

      // 模拟进度检查
      const jobId = 'job_progress_0'
      let finalStatus

      for (let i = 0; i <= progressResponses.length; i++) {
        const response = await get(`/ai/file/processing/status/job_progress_${i}`)

        if (response.data.status === 'completed') {
          finalStatus = response.data
          break
        }

        expect(response.data.progress).toBe(progressResponses[i]?.progress || 1)
      }

      expect(finalStatus.status).toBe('completed')
    })

    it('should handle large file processing completion', async () => {
      vi.mocked(get).mockResolvedValue(mockLargeFileProcessingCompleteResponse)

      const jobId = 'job_large_file_' + Date.now()
      const response = await get(`/ai/file/processing/status/${jobId}`)

      // 验证完成状态
      expect(response.success).toBe(true)
      expect(response.data.status).toBe('completed')
      expect(response.data.completed_at).toBeDefined()

      // 验证处理结果摘要
      const summary = response.data.results.summary
      expect(summary.total_records).toBe(500000)
      expect(summary.successful_records).toBe(498750)
      expect(summary.failed_records).toBe(1250)
      expect(summary.accuracy).toBe(99.75)

      // 验证洞察
      const insights = response.data.results.insights
      expect(Array.isArray(insights)).toBe(true)
      expect(insights.length).toBeGreaterThan(0)

      insights.forEach(insight => {
        expect(typeof insight.category).toBe('string')
        expect(typeof insight.key_findings).toBe('string')
        expect(typeof insight.confidence).toBe('number')
        expect(insight.confidence).toBeGreaterThanOrEqual(0)
        expect(insight.confidence).toBeLessThanOrEqual(1)
      })

      // 验证生成的报告
      const reports = response.data.results.generated_reports
      expect(Array.isArray(reports)).toBe(true)

      reports.forEach(report => {
        expect(typeof report.type).toBe('string')
        expect(typeof report.file_url).toBe('string')
        expect(typeof report.size).toBe('number')
        expect(report.file_url).toMatch(/^https?:\/\//)
      })
    })

    it('should handle large file processing errors', async () => {
      const errorResponse = {
        success: false,
        code: 422,
        message: '文件处理失败',
        error: {
          code: 'PROCESSING_ERROR',
          message: '文件格式不支持或损坏',
          type: 'file_processing',
          details: {
            job_id: 'job_error_' + Date.now(),
            stage: 'validation'
          }
        }
      }

      vi.mocked(get).mockResolvedValue(errorResponse)

      const response = await get('/ai/file/processing/status/job_error_123')

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('PROCESSING_ERROR')
      expect(response.error.type).toBe('file_processing')
      expect(response.error.details).toBeDefined()
      expect(response.error.details.job_id).toBeDefined()
      expect(response.error.details.stage).toBe('validation')
    })

    it('should handle memory-efficient chunked processing', async () => {
      const memoryEfficientResponse = {
        success: true,
        data: {
          job_id: 'job_memory_efficient_' + Date.now(),
          processing_strategy: 'memory_efficient',
          chunks_info: {
            total_chunks: 1000,
            chunk_size: 1000,
            memory_usage_per_chunk: 1048576, // 1MB per chunk
            max_concurrent_chunks: 5,
            peak_memory_usage: 5242880, // 5MB peak
            gc_frequency: 'per_chunk'
          },
          performance_metrics: {
            processing_speed: 5000, // lines per second
            memory_efficiency: 0.95,
            cpu_usage: 0.6,
            io_wait: 0.1
          }
        }
      }

      vi.mocked(post).mockResolvedValue(memoryEfficientResponse)

      const config = {
        file_size: 104857600, // 100MB
        memory_limit: 10485760, // 10MB limit
        processing_strategy: 'memory_efficient'
      }

      const response = await post('/ai/file/processing/start-memory-efficient', config)

      const chunksInfo = response.data.chunks_info
      expect(chunksInfo.total_chunks).toBe(1000)
      expect(chunksInfo.memory_usage_per_chunk).toBe(1048576)
      expect(chunksInfo.max_concurrent_chunks).toBe(5)
      expect(chunksInfo.peak_memory_usage).toBeLessThan(config.memory_limit)

      const metrics = response.data.performance_metrics
      expect(metrics.memory_efficiency).toBeGreaterThan(0.9)
      expect(metrics.processing_speed).toBeGreaterThan(0)
    })
  })

  describe('Concurrent AI Requests', () => {
    it('should handle multiple concurrent chat requests', async () => {
      const concurrentRequests = Array.from({ length: 5 }, (_, i) => ({
        model: 'gpt-4',
        messages: [{ role: 'user', content: `Request ${i + 1}: 请生成测试内容` }],
        request_id: `req_${Date.now()}_${i}`
      }))

      // Mock并发响应
      vi.mocked(post).mockImplementation((url, data) => {
        return Promise.resolve({
          success: true,
          data: {
            content: `Response to ${data.messages[0].content}`,
            request_id: data.request_id,
            processing_time: Math.random() * 1000 + 500,
            model: data.model,
            timestamp: new Date().toISOString()
          }
        })
      })

      const startTime = Date.now()
      const responses = await Promise.all(
        concurrentRequests.map(req => post('/ai/chat/completions', req))
      )
      const endTime = Date.now()

      // 验证所有请求都成功
      expect(responses).toHaveLength(5)
      responses.forEach((response, index) => {
        expect(response.success).toBe(true)
        expect(response.data.content).toContain(`Request ${index + 1}`)
        expect(response.data.request_id).toBe(concurrentRequests[index].request_id)
      })

      // 验证并发执行（总时间应该小于串行执行时间）
      const totalTime = endTime - startTime
      expect(totalTime).toBeLessThan(2000) // 应该远小于5个串行请求的时间
    })

    it('should handle concurrent requests with rate limiting', async () => {
      let requestCount = 0
      const maxRequestsPerMinute = 3

      vi.mocked(post).mockImplementation(async (url, data) => {
        requestCount++

        if (requestCount > maxRequestsPerMinute) {
          return Promise.reject({
            status: 429,
            data: {
              success: false,
              code: 429,
              message: 'Rate limit exceeded',
              error: {
                code: 'RATE_LIMIT_EXCEEDED',
                retry_after: 60
              }
            }
          })
        }

        await new Promise(resolve => setTimeout(resolve, 100)) // 模拟处理时间
        return Promise.resolve({
          success: true,
          data: { content: 'Response content', request_id: data.request_id }
        })
      })

      const requests = Array.from({ length: 5 }, (_, i) => ({
        request_id: `req_concurrent_${i}`,
        messages: [{ role: 'user', content: `Message ${i}` }]
      }))

      const responses = []
      const errors = []

      await Promise.allSettled(
        requests.map(req => post('/ai/chat/completions', req))
      ).then(results => {
        results.forEach(result => {
          if (result.status === 'fulfilled') {
            responses.push(result.value)
          } else {
            errors.push(result.reason)
          }
        })
      })

      expect(responses.length).toBe(maxRequestsPerMinute)
      expect(errors.length).toBe(2)
      expect(errors.every(error => error.status === 429)).toBe(true)
    })

    it('should handle batch processing with queue management', async () => {
      const batchRequests = Array.from({ length: 20 }, (_, i) => ({
        id: `batch_req_${i}`,
        content: `Batch item ${i}`,
        priority: i % 3 === 0 ? 'high' : 'normal'
      }))

      const processedOrder = []
      let processingSlot = 0

      vi.mocked(post).mockImplementation(async (url, data) => {
        processingSlot++

        if (processingSlot > concurrentRequestsConfig.maxConcurrent) {
          await new Promise(resolve => setTimeout(resolve, 200)) // 等待队列
        }

        processedOrder.push(data.id)
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50))
        processingSlot--

        return Promise.resolve({
          success: true,
          data: {
            id: data.id,
            result: `Processed ${data.content}`,
            processing_time: Math.random() * 200 + 50,
            queue_position: Math.max(0, processingSlot - concurrentRequestsConfig.maxConcurrent)
          }
        })
      })

      // 分批处理请求
      const batchSize = 5
      const allResponses = []

      for (let i = 0; i < batchRequests.length; i += batchSize) {
        const batch = batchRequests.slice(i, i + batchSize)
        const batchResponses = await Promise.all(
          batch.map(req => post('/ai/batch/process', req))
        )
        allResponses.push(...batchResponses)
      }

      // 验证所有请求都被处理
      expect(allResponses).toHaveLength(20)
      allResponses.forEach(response => {
        expect(response.success).toBe(true)
        expect(response.data.result).toContain('Processed')
      })

      // 验证处理顺序和并发控制
      expect(processedOrder).toHaveLength(20)
    })
  })

  describe('Dynamic Memory Management', () => {
    it('should handle memory-intensive AI operations', async () => {
      const memoryIntensiveResponse = {
        success: true,
        data: {
          operation_id: 'mem_intensive_' + Date.now(),
          operation_type: 'embedding_generation',
          memory_usage: {
            initial_memory: 104857600, // 100MB
            peak_memory: 1073741824, // 1GB
            final_memory: 104857600, // 回到初始值
            memory_freed: 966367641,
            gc_collections: 3
          },
          processing_stats: {
            total_items: 10000,
            batch_size: 100,
            batches_processed: 100,
            average_batch_time: 150,
            memory_efficiency: 0.92
          }
        }
      }

      vi.mocked(post).mockResolvedValue(memoryIntensiveResponse)

      const request = {
        operation: 'generate_embeddings',
        items: Array.from({ length: 10000 }, (_, i) => ({ id: i, text: `Item ${i} text` })),
        memory_limit: 1073741824 // 1GB limit
      }

      const response = await post('/ai/memory-intensive/operation', request)

      const memoryUsage = response.data.memory_usage
      expect(memoryUsage.peak_memory).toBeLessThanOrEqual(request.memory_limit)
      expect(memoryUsage.memory_freed).toBeGreaterThan(0)
      expect(memoryUsage.gc_collections).toBeGreaterThan(0)

      const stats = response.data.processing_stats
      expect(stats.memory_efficiency).toBeGreaterThan(0.9)
      expect(stats.batches_processed).toBe(100)
    })

    it('should handle adaptive memory management', async () => {
      const adaptiveResponses = [
        {
          batch_size: 1000,
          memory_usage: 524288000, // 500MB
          efficiency: 0.85,
          recommendation: 'increase_batch_size'
        },
        {
          batch_size: 2000,
          memory_usage: 838860800, // 800MB
          efficiency: 0.92,
          recommendation: 'optimal'
        },
        {
          batch_size: 3000,
          memory_usage: 1073741824, // 1GB
          efficiency: 0.88,
          recommendation: 'decrease_batch_size'
        }
      ]

      vi.mocked(post).mockImplementation((url, data) => {
        const responseIndex = Math.floor(Math.random() * adaptiveResponses.length)
        return Promise.resolve({
          success: true,
          data: {
            current_batch_size: data.batch_size,
            ...adaptiveResponses[responseIndex],
            next_batch_size: adaptiveResponses[responseIndex].recommendation === 'increase_batch_size'
              ? data.batch_size * 1.5
              : adaptiveResponses[responseIndex].recommendation === 'decrease_batch_size'
              ? data.batch_size * 0.75
              : data.batch_size
          }
        })
      })

      let currentBatchSize = 1000
      const maxMemoryLimit = 1073741824 // 1GB

      for (let i = 0; i < 5; i++) {
        const response = await post('/ai/adaptive/batch-process', {
          data: Array.from({ length: currentBatchSize }, (_, j) => ({ id: j, text: `Data ${j}` })),
          batch_size: currentBatchSize,
          memory_limit: maxMemoryLimit
        })

        expect(response.data.memory_usage).toBeLessThanOrEqual(maxMemoryLimit)

        currentBatchSize = response.data.next_batch_size
        expect(currentBatchSize).toBeGreaterThan(0)
      }
    })
  })

  describe('Real-time Processing Feedback', () => {
    it('should provide real-time processing updates', async () => {
      const realTimeUpdates = [
        { stage: 'initialization', progress: 0, message: '开始处理...' },
        { stage: 'validation', progress: 0.1, message: '验证文件格式...' },
        { stage: 'processing', progress: 0.3, message: '处理数据中...' },
        { stage: 'analysis', progress: 0.7, message: '分析结果...' },
        { stage: 'finalization', progress: 0.9, message: '生成报告...' },
        { stage: 'completed', progress: 1.0, message: '处理完成！' }
      ]

      vi.mocked(get).mockImplementation((url) => {
        const progressIndex = parseInt(url.split('/').pop()) || 0
        if (progressIndex < realTimeUpdates.length) {
          return Promise.resolve({
            success: true,
            data: {
              job_id: 'realtime_job',
              ...realTimeUpdates[progressIndex],
              timestamp: new Date().toISOString()
            }
          })
        }
        return Promise.resolve({
          success: true,
          data: realTimeUpdates[realTimeUpdates.length - 1]
        })
      })

      const updates = []
      for (let i = 0; i < realTimeUpdates.length; i++) {
        const response = await get(`/ai/processing/realtime/${i}`)
        updates.push(response.data)
      }

      expect(updates).toHaveLength(6)

      // 验证进度递增
      updates.forEach((update, index) => {
        expect(update.progress).toBe(realTimeUpdates[index].progress)
        expect(update.stage).toBe(realTimeUpdates[index].stage)
        expect(typeof update.message).toBe('string')
      })

      // 验证最终状态
      expect(updates[updates.length - 1].stage).toBe('completed')
      expect(updates[updates.length - 1].progress).toBe(1.0)
    })

    it('should handle processing cancellation', async () => {
      const cancelResponse = {
        success: true,
        data: {
          job_id: 'job_to_cancel',
          status: 'cancelled',
          cancellation_info: {
            cancelled_at: new Date().toISOString(),
            progress_at_cancellation: 0.45,
            stage: 'processing',
            cleanup_completed: true,
            resources_released: {
              memory_freed: 268435456, // 256MB
              temp_files_deleted: 15,
              processes_terminated: 3
            }
          }
        }
      }

      vi.mocked(post).mockResolvedValue(cancelResponse)

      const response = await post('/ai/processing/cancel', {
        job_id: 'job_to_cancel',
        reason: 'user_request'
      })

      expect(response.data.status).toBe('cancelled')
      expect(response.data.cancellation_info.progress_at_cancellation).toBe(0.45)
      expect(response.data.cancellation_info.cleanup_completed).toBe(true)
      expect(response.data.cancellation_info.resources_released.memory_freed).toBeGreaterThan(0)
    })
  })

  describe('Performance Optimization', () => {
    it('should implement intelligent caching for repeated requests', async () => {
      const cacheHits = []

      vi.mocked(post).mockImplementation((url, data) => {
        const cacheKey = `${data.model}_${JSON.stringify(data.messages)}`

        if (cacheHits.includes(cacheKey)) {
          return Promise.resolve({
            success: true,
            data: {
              content: 'Cached response',
              cached: true,
              cache_hit: true,
              processing_time: 5 // 极快的缓存响应
            }
          })
        }

        cacheHits.push(cacheKey)
        return Promise.resolve({
          success: true,
          data: {
            content: 'Fresh response',
            cached: false,
            cache_hit: false,
            processing_time: 1500
          }
        })
      })

      const request = {
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Explain kindergarten education' }]
      }

      // 第一次请求
      const response1 = await post('/ai/chat/completions', request)
      expect(response1.data.cached).toBe(false)
      expect(response1.data.processing_time).toBe(1500)

      // 第二次相同请求
      const response2 = await post('/ai/chat/completions', request)
      expect(response2.data.cached).toBe(true)
      expect(response2.data.cache_hit).toBe(true)
      expect(response2.data.processing_time).toBe(5)
    })

    it('should implement request deduplication', async () => {
      let activeRequests = new Map()

      vi.mocked(post).mockImplementation(async (url, data) => {
        const requestId = `${data.model}_${JSON.stringify(data.messages)}`

        if (activeRequests.has(requestId)) {
          // 等待现有请求完成
          return activeRequests.get(requestId)
        }

        const requestPromise = new Promise(resolve => {
          setTimeout(() => {
            resolve({
              success: true,
              data: {
                content: 'Deduplicated response',
                request_id: requestId,
                processing_time: 1000
              }
            })
          }, 1000)
        })

        activeRequests.set(requestId, requestPromise)
        return requestPromise
      })

      const request = {
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'What is early childhood education?' }]
      }

      // 同时发送多个相同请求
      const startTime = Date.now()
      const responses = await Promise.all([
        post('/ai/chat/completions', request),
        post('/ai/chat/completions', request),
        post('/ai/chat/completions', request)
      ])
      const endTime = Date.now()

      // 验证去重工作正常
      expect(responses).toHaveLength(3)
      responses.forEach(response => {
        expect(response.data.content).toBe('Deduplicated response')
        expect(response.data.request_id).toBeDefined()
      })

      // 验证只处理了一次（时间应该接近1秒而不是3秒）
      expect(endTime - startTime).toBeLessThan(1500)
    })
  })
})