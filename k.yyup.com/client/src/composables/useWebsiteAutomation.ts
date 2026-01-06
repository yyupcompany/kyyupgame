import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { websiteAutomationApi, AutomationTask as ApiAutomationTask, AutomationStatistics, ElementAnalysisResult } from '../api/endpoints/websiteAutomation'

export interface AutomationTask extends ApiAutomationTask {
  currentStep?: number
  logs?: any[]
}

export interface ExecutionRecord {
  id: string
  taskId: string
  taskName: string
  description: string
  status: 'success' | 'error' | 'running' | 'pending'
  details: any
  createdAt: string
  duration?: number
}

export function useWebsiteAutomation() {
  const isReady = ref(true)
  const selectedElement = ref<any>(null)
  const selectedElements = ref<any[]>([])
  const executionHistory = ref<ExecutionRecord[]>([])
  const currentTask = ref<AutomationTask | null>(null)

  // 截图相关
  const captureScreenshot = async (url?: string, options?: any): Promise<string> => {
    try {
      if (url) {
        // 调用API进行远程截图
        const response = await websiteAutomationApi.captureScreenshot(url, options)
        if (response.success && response.data) {
          return response.data.screenshot
        }
        throw new Error(response.message || '截图失败')
      } else {
        // 本地截图模拟
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        
        // 模拟截图数据
        ctx!.fillStyle = '#f0f0f0'
        ctx!.fillRect(0, 0, canvas.width, canvas.height)
        ctx!.fillStyle = '#333'
        ctx!.font = '20px Arial'
        ctx!.fillText('模拟页面截图', 50, 50)
        
        return canvas.toDataURL('image/png')
      }
    } catch (error) {
      throw new Error('截图失败：' + (error as Error).message)
    }
  }

  // 元素分析
  const analyzeElement = async (element: any): Promise<any> => {
    try {
      if (!element) {
        throw new Error('未选择元素')
      }

      const analysis = {
        tagName: element.tagName,
        id: element.id,
        className: element.className,
        textContent: element.textContent?.trim(),
        attributes: {} as any,
        computedStyle: {} as any,
        position: element.getBoundingClientRect(),
        selectors: [] as any[]
      }

      // 分析属性
      if (element.attributes) {
        for (let i = 0; i < element.attributes.length; i++) {
          const attr = element.attributes[i]
          analysis.attributes[attr.name] = attr.value
        }
      }

      // 生成选择器
      if (element.id) {
        analysis.selectors.push({
          type: 'id',
          value: `#${element.id}`,
          score: 95
        })
      }

      if (element.className) {
        const classes = element.className.split(' ').filter((cls: string) => cls.trim())
        if (classes.length > 0) {
          analysis.selectors.push({
            type: 'class',
            value: `.${classes.join('.')}`,
            score: 80
          })
        }
      }

      return analysis
    } catch (error) {
      throw new Error('元素分析失败：' + (error as Error).message)
    }
  }

  // 执行操作
  const executeAction = async (action: string, params: any = {}): Promise<any> => {
    try {
      const record: ExecutionRecord = {
        id: Date.now().toString(),
        taskId: params.taskId || 'manual',
        taskName: params.taskName || '手动操作',
        description: `执行${action}操作`,
        status: 'running',
        details: { action, params },
        createdAt: new Date().toISOString()
      }

      executionHistory.value.unshift(record)

      // 模拟执行过程
      await new Promise(resolve => setTimeout(resolve, 1000))

      switch (action) {
        case 'click':
          await simulateClick(params)
          break
        case 'input':
          await simulateInput(params)
          break
        case 'navigate':
          await simulateNavigate(params)
          break
        case 'extract':
          return await simulateExtract(params)
        case 'wait':
          await simulateWait(params)
          break
        default:
          throw new Error('不支持的操作类型')
      }

      // 更新执行记录
      record.status = 'success'
      record.duration = Date.now() - new Date(record.createdAt).getTime()
      
      return { success: true, record }
    } catch (error) {
      // 更新失败记录
      const failedRecord = executionHistory.value.find(r => r.id === Date.now().toString())
      if (failedRecord) {
        failedRecord.status = 'error'
        failedRecord.details.error = (error as Error).message
      }
      
      throw error
    }
  }

  // 模拟操作函数
  const simulateClick = async (params: any) => {
    if (params.selector) {
      const element = document.querySelector(params.selector)
      if (element) {
        (element as HTMLElement).click()
      } else {
        throw new Error('未找到目标元素')
      }
    }
  }

  const simulateInput = async (params: any) => {
    if (params.selector && params.text) {
      const element = document.querySelector(params.selector) as HTMLInputElement
      if (element) {
        element.value = params.text
        element.dispatchEvent(new Event('input', { bubbles: true }))
      } else {
        throw new Error('未找到输入框元素')
      }
    }
  }

  const simulateNavigate = async (params: any) => {
    if (params.url) {
      window.location.href = params.url
    }
  }

  const simulateExtract = async (params: any) => {
    if (params.selector) {
      const elements = document.querySelectorAll(params.selector)
      const results = Array.from(elements).map(el => ({
        text: el.textContent?.trim(),
        html: el.innerHTML,
        attributes: Object.fromEntries(
          Array.from(el.attributes).map(attr => [(attr as any).name, (attr as any).value])
        )
      }))
      return results
    }
    return []
  }

  const simulateWait = async (params: any) => {
    const duration = params.duration || 1000
    await new Promise(resolve => setTimeout(resolve, duration))
  }

  // 加载历史记录
  const loadHistory = async (taskId?: string) => {
    try {
      if (taskId) {
        // 加载特定任务的执行历史
        const response = await websiteAutomationApi.getTaskHistory(taskId)
        if (response.success && response.data) {
          const historyRecords: ExecutionRecord[] = response.data.map((item: any) => ({
            id: item.id,
            taskId: item.taskId,
            taskName: 'Task Execution',
            description: item.status,
            status: item.status === 'completed' ? 'success' : 
                   item.status === 'failed' ? 'error' : item.status as any,
            details: item.result ? JSON.parse(item.result) : {},
            createdAt: item.startTime,
            duration: item.endTime ? new Date(item.endTime).getTime() - new Date(item.startTime).getTime() : undefined
          }))
          executionHistory.value = historyRecords
        }
      } else {
        // 模拟加载所有历史记录
        const mockHistory: ExecutionRecord[] = [
          {
            id: '1',
            taskId: 'task1',
            taskName: '登录测试',
            description: '自动登录系统',
            status: 'success',
            details: { action: 'login', params: { username: 'test' } },
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            duration: 5000
          },
          {
            id: '2',
            taskId: 'task2',
            taskName: '数据提取',
            description: '提取页面数据',
            status: 'success',
            details: { action: 'extract', params: { selector: '.data' } },
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            duration: 3000
          }
        ]
        executionHistory.value = mockHistory
      }
    } catch (error) {
      ElMessage.error('加载历史记录失败：' + (error as Error).message)
    }
  }

  // 新增API方法
  const analyzePageElements = async (url: string, screenshot?: string, config?: any): Promise<ElementAnalysisResult | null> => {
    try {
      const response = await websiteAutomationApi.analyzePageElements(url, screenshot, config)
      if (response.success && response.data) {
        return response.data
      }
      throw new Error(response.message || '页面分析失败')
    } catch (error) {
      ElMessage.error('页面分析失败：' + (error as Error).message)
      return null
    }
  }

  const findElementByDescription = async (url: string, description: string, screenshot?: string) => {
    try {
      const response = await websiteAutomationApi.findElementByDescription(url, description, screenshot)
      if (response.success && response.data) {
        return response.data
      }
      throw new Error(response.message || '智能查找失败')
    } catch (error) {
      ElMessage.error('智能查找失败：' + (error as Error).message)
      return null
    }
  }

  const getStatistics = async (): Promise<AutomationStatistics | null> => {
    try {
      const response = await websiteAutomationApi.getStatistics()
      if (response.success && response.data) {
        return response.data
      }
      throw new Error(response.message || '获取统计数据失败')
    } catch (error) {
      ElMessage.error('获取统计数据失败：' + (error as Error).message)
      return null
    }
  }

  // 清理历史记录
  const clearHistory = () => {
    executionHistory.value = []
  }

  // 导出历史记录
  const exportHistory = () => {
    const data = JSON.stringify(executionHistory.value, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `automation-history-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return {
    // 状态
    isReady,
    selectedElement,
    selectedElements,
    executionHistory,
    currentTask,

    // 方法
    captureScreenshot,
    analyzeElement,
    executeAction,
    loadHistory,
    clearHistory,
    exportHistory,
    
    // 新增API方法
    analyzePageElements,
    findElementByDescription,
    getStatistics
  }
}