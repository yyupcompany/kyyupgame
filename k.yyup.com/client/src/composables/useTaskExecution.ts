import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { websiteAutomationApi, AutomationTask } from '../api/endpoints/websiteAutomation'

export interface TaskStep {
  id: string
  action: string
  selector?: string
  text?: string
  url?: string
  waitTime?: number
  script?: string
  description: string
  delay: number
  optional: boolean
  screenshot: boolean
}

export interface Task {
  id: string
  name: string
  description: string
  type: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused'
  progress: number
  currentStep: number
  steps: TaskStep[]
  config: {
    timeout: number
    retries: number
    delay: number
    screenshotOnError: boolean
    continueOnError: boolean
  }
  logs: any[]
  createdAt: string
  updatedAt: string
}

export function useTaskExecution() {
  const tasks = ref<Task[]>([])
  const runningTasks = ref<Task[]>([])
  const executionQueue = ref<string[]>([])

  // 创建任务
  const createTask = (taskData: Partial<Task>): Task => {
    const task: Task = {
      id: Date.now().toString(),
      name: taskData.name || '未命名任务',
      description: taskData.description || '',
      type: taskData.type || 'custom',
      status: 'pending',
      progress: 0,
      currentStep: 0,
      steps: taskData.steps || [],
      config: {
        timeout: 30,
        retries: 3,
        delay: 1000,
        screenshotOnError: true,
        continueOnError: false,
        ...taskData.config
      },
      logs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    tasks.value.push(task)
    return task
  }

  // 更新任务
  const updateTask = (taskData: Task) => {
    const index = tasks.value.findIndex(t => t.id === taskData.id)
    if (index >= 0) {
      tasks.value[index] = {
        ...taskData,
        updatedAt: new Date().toISOString()
      }
    }
  }

  // 删除任务
  const deleteTask = async (taskId: string) => {
    const index = tasks.value.findIndex(t => t.id === taskId)
    if (index >= 0) {
      const task = tasks.value[index]
      
      // 如果任务正在运行，先停止
      if (task.status === 'running') {
        await stopTask(taskId)
      }
      
      tasks.value.splice(index, 1)
    }
  }

  // 执行任务
  const executeTask = async (taskId: string): Promise<void> => {
    const task = tasks.value.find(t => t.id === taskId)
    if (!task) {
      throw new Error('任务不存在')
    }

    if (task.status === 'running') {
      throw new Error('任务正在执行中')
    }

    try {
      task.status = 'running'
      task.progress = 0
      task.currentStep = 0
      task.logs = []
      
      addTaskLog(task, 'info', '开始执行任务')
      runningTasks.value.push(task)

      // 执行每个步骤
      for (let i = 0; i < task.steps.length; i++) {
        const step = task.steps[i]
        task.currentStep = i

        try {
          addTaskLog(task, 'info', `执行步骤 ${i + 1}: ${step.description || step.action}`)

          // 执行前延迟
          if (step.delay > 0) {
            await sleep(step.delay)
          }

          // 执行步骤
          await executeStep(task, step)

          // 更新进度
          task.progress = Math.round(((i + 1) / task.steps.length) * 100)

          addTaskLog(task, 'success', `步骤 ${i + 1} 执行完成`)

          // 执行后截图
          if (step.screenshot) {
            addTaskLog(task, 'info', `步骤 ${i + 1} 截图已保存`)
          }

        } catch (error) {
          addTaskLog(task, 'error', `步骤 ${i + 1} 执行失败: ${(error as Error).message}`)

          if (!step.optional && !task.config.continueOnError) {
            throw error
          }
        }

        // 检查是否被暂停或停止
        if ((task.status as any) === 'paused') {
          addTaskLog(task, 'warning', '任务已暂停')
          return
        }

        if ((task.status as any) === 'failed') {
          throw new Error('任务被停止')
        }
      }

      // 任务完成
      task.status = 'completed'
      task.progress = 100
      addTaskLog(task, 'success', '任务执行完成')

    } catch (error) {
      task.status = 'failed'
      addTaskLog(task, 'error', `任务执行失败: ${(error as Error).message}`)
      
      if (task.config.screenshotOnError) {
        addTaskLog(task, 'info', '错误截图已保存')
      }
      
      throw error
    } finally {
      // 从运行列表中移除
      const runningIndex = runningTasks.value.findIndex(t => t.id === taskId)
      if (runningIndex >= 0) {
        runningTasks.value.splice(runningIndex, 1)
      }
      
      task.updatedAt = new Date().toISOString()
    }
  }

  // 执行单个步骤
  const executeStep = async (_task: Task, step: TaskStep): Promise<void> => {
    switch (step.action) {
      case 'click':
        await executeClickStep(step)
        break
      case 'input':
        await executeInputStep(step)
        break
      case 'navigate':
        await executeNavigateStep(step)
        break
      case 'wait':
        await executeWaitStep(step)
        break
      case 'extract':
        await executeExtractStep(step)
        break
      case 'script':
        await executeScriptStep(step)
        break
      case 'hover':
        await executeHoverStep(step)
        break
      case 'scroll':
        await executeScrollStep(step)
        break
      default:
        throw new Error(`不支持的操作类型: ${step.action}`)
    }
  }

  // 具体步骤执行函数
  const executeClickStep = async (step: TaskStep) => {
    if (!step.selector) {
      throw new Error('点击操作需要选择器')
    }

    const element = document.querySelector(step.selector)
    if (!element) {
      throw new Error(`未找到元素: ${step.selector}`)
    }

    (element as HTMLElement).click()
  }

  const executeInputStep = async (step: TaskStep) => {
    if (!step.selector) {
      throw new Error('输入操作需要选择器')
    }

    const element = document.querySelector(step.selector) as HTMLInputElement
    if (!element) {
      throw new Error(`未找到输入元素: ${step.selector}`)
    }

    if (step.text !== undefined) {
      element.value = step.text
      element.dispatchEvent(new Event('input', { bubbles: true }))
      element.dispatchEvent(new Event('change', { bubbles: true }))
    }
  }

  const executeNavigateStep = async (step: TaskStep) => {
    if (!step.url) {
      throw new Error('导航操作需要URL')
    }

    window.location.href = step.url
    
    // 等待页面加载
    await new Promise((resolve) => {
      const checkLoaded = () => {
        if (document.readyState === 'complete') {
          resolve(true)
        } else {
          setTimeout(checkLoaded, 100)
        }
      }
      checkLoaded()
    })
  }

  const executeWaitStep = async (step: TaskStep) => {
    const waitTime = step.waitTime || 1000
    await sleep(waitTime)
  }

  const executeExtractStep = async (step: TaskStep) => {
    if (!step.selector) {
      throw new Error('提取操作需要选择器')
    }

    const elements = document.querySelectorAll(step.selector)
    const results = Array.from(elements).map(el => ({
      text: el.textContent?.trim(),
      html: el.innerHTML,
      href: (el as HTMLAnchorElement).href,
      src: (el as HTMLImageElement).src
    }))

    return results
  }

  const executeScriptStep = async (step: TaskStep) => {
    if (!step.script) {
      throw new Error('脚本步骤需要脚本内容')
    }

    // 安全执行自定义脚本
    try {
      const func = new Function('document', 'window', step.script)
      return func(document, window)
    } catch (error) {
      throw new Error(`脚本执行失败: ${(error as Error).message}`)
    }
  }

  const executeHoverStep = async (step: TaskStep) => {
    if (!step.selector) {
      throw new Error('悬停操作需要选择器')
    }

    const element = document.querySelector(step.selector)
    if (!element) {
      throw new Error(`未找到元素: ${step.selector}`)
    }

    const event = new MouseEvent('mouseenter', {
      view: window,
      bubbles: true,
      cancelable: true
    })
    element.dispatchEvent(event)
  }

  const executeScrollStep = async (step: TaskStep) => {
    if (step.selector) {
      const element = document.querySelector(step.selector)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // 暂停任务
  const pauseTask = async (taskId: string) => {
    const task = tasks.value.find(t => t.id === taskId)
    if (task && task.status === 'running') {
      task.status = 'paused'
      addTaskLog(task, 'warning', '任务已暂停')
    }
  }

  // 停止任务
  const stopTask = async (taskId: string) => {
    const task = tasks.value.find(t => t.id === taskId)
    if (task && ['running', 'paused'].includes(task.status)) {
      task.status = 'failed'
      addTaskLog(task, 'error', '任务已停止')
      
      // 从运行列表中移除
      const runningIndex = runningTasks.value.findIndex(t => t.id === taskId)
      if (runningIndex >= 0) {
        runningTasks.value.splice(runningIndex, 1)
      }
    }
  }

  // 获取任务状态
  const getTaskStatus = async (taskId: string) => {
    const task = tasks.value.find(t => t.id === taskId)
    if (!task) {
      throw new Error('任务不存在')
    }

    return {
      id: task.id,
      status: task.status,
      progress: task.progress,
      currentStep: task.currentStep,
      logs: task.logs.slice(-10) // 返回最近10条日志
    }
  }

  // 导出任务
  const exportTasks = async (taskList: Task[]) => {
    return taskList.map(task => ({
      ...task,
      exportedAt: new Date().toISOString()
    }))
  }

  // 导入任务
  const importTasks = async (importedTasks: Task[]) => {
    importedTasks.forEach(task => {
      task.id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
      task.status = 'pending'
      task.progress = 0
      task.currentStep = 0
      task.logs = []
      task.createdAt = new Date().toISOString()
      task.updatedAt = new Date().toISOString()
      
      tasks.value.push(task)
    })
  }

  // 工具函数
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const addTaskLog = (task: Task, level: 'info' | 'success' | 'warning' | 'error', message: string) => {
    task.logs.push({
      id: Date.now().toString(),
      level,
      message,
      timestamp: new Date().toISOString()
    })

    // 保持日志数量在合理范围内
    if (task.logs.length > 100) {
      task.logs = task.logs.slice(-50)
    }
  }

  // 初始化一些示例任务
  const initializeSampleTasks = () => {
    const sampleTasks = [
      {
        name: '网站登录测试',
        description: '自动登录到测试网站',
        type: 'form',
        steps: [
          {
            id: '1',
            action: 'navigate',
            url: 'https://example.com/login',
            description: '打开登录页面',
            delay: 0,
            optional: false,
            screenshot: false
          },
          {
            id: '2',
            action: 'input',
            selector: '#username',
            text: 'testuser',
            description: '输入用户名',
            delay: 500,
            optional: false,
            screenshot: false
          },
          {
            id: '3',
            action: 'input',
            selector: '#password',
            text: 'password123',
            description: '输入密码',
            delay: 500,
            optional: false,
            screenshot: false
          },
          {
            id: '4',
            action: 'click',
            selector: '#login-button',
            description: '点击登录按钮',
            delay: 0,
            optional: false,
            screenshot: true
          }
        ]
      }
    ]

    sampleTasks.forEach(taskData => createTask(taskData))
  }

  // API集成方法
  const loadTasksFromAPI = async () => {
    try {
      const response = await websiteAutomationApi.getAllTasks()
      if (response.success && response.data) {
        // 将API返回的任务转换为本地格式
        const apiTasks = response.data.map((apiTask: AutomationTask) => ({
          id: apiTask.id,
          name: apiTask.name,
          description: apiTask.description || '',
          type: 'api',
          status: apiTask.status as any,
          progress: apiTask.progress,
          currentStep: 0,
          steps: apiTask.steps,
          config: apiTask.config || {
            timeout: 60,
            retries: 3,
            delay: 1000,
            screenshotOnError: true,
            continueOnError: false
          },
          logs: [],
          createdAt: apiTask.createdAt,
          updatedAt: apiTask.updatedAt
        }))
        tasks.value = apiTasks
      }
    } catch (error) {
      ElMessage.error('加载任务失败：' + (error as Error).message)
    }
  }

  const saveTaskToAPI = async (task: Task) => {
    try {
      const apiTask = {
        name: task.name,
        description: task.description,
        url: task.steps.find(s => s.url)?.url || '',
        steps: task.steps,
        config: task.config
      }

      const response = await websiteAutomationApi.createTask(apiTask)
      if (response.success && response.data) {
        // 更新本地任务ID
        task.id = response.data.id
        ElMessage.success('任务保存成功')
      }
    } catch (error) {
      ElMessage.error('保存任务失败：' + (error as Error).message)
    }
  }

  const executeTaskViaAPI = async (taskId: string) => {
    try {
      const response = await websiteAutomationApi.executeTask(taskId)
      if (response.success) {
        ElMessage.success('任务已开始执行')
        // 更新本地任务状态
        const task = tasks.value.find(t => t.id === taskId)
        if (task) {
          task.status = 'running'
          task.progress = 0
        }
        return response.data
      }
    } catch (error) {
      ElMessage.error('执行任务失败：' + (error as Error).message)
      throw error
    }
  }

  const stopTaskViaAPI = async (taskId: string) => {
    try {
      const response = await websiteAutomationApi.stopTask(taskId)
      if (response.success) {
        ElMessage.success('任务已停止')
        // 更新本地任务状态
        const task = tasks.value.find(t => t.id === taskId)
        if (task) {
          task.status = 'paused'
        }
      }
    } catch (error) {
      ElMessage.error('停止任务失败：' + (error as Error).message)
    }
  }

  // 初始化
  initializeSampleTasks()

  return {
    // 状态
    tasks,
    runningTasks,
    executionQueue,

    // 方法
    createTask,
    updateTask,
    deleteTask,
    executeTask,
    pauseTask,
    stopTask,
    getTaskStatus,
    exportTasks,
    importTasks,
    
    // API集成方法
    loadTasksFromAPI,
    saveTaskToAPI,
    executeTaskViaAPI,
    stopTaskViaAPI
  }
}