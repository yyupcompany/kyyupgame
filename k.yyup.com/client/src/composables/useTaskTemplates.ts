import { ref } from 'vue'
import { ElMessage } from 'element-plus'

export interface TaskTemplate {
  id: string
  name: string
  description: string
  category: 'web' | 'form' | 'data' | 'test' | 'custom'
  complexity: 'simple' | 'medium' | 'complex'
  steps: any[]
  parameters: any[]
  config: {
    executionMode: 'sequential' | 'parallel' | 'conditional'
    errorHandling: 'stop' | 'continue' | 'retry'
    timeout: number
    enableLogging: boolean
    screenshotOnError: boolean
    allowParameterization: boolean
  }
  usageCount: number
  version: string
  status: 'draft' | 'published' | 'archived'
  createdAt: string
  updatedAt: string
}

export function useTaskTemplates() {
  const taskTemplates = ref<TaskTemplate[]>([])
  const isLoading = ref(false)

  // 初始化一些示例模板
  const initializeSampleTemplates = () => {
    const sampleTemplates: TaskTemplate[] = [
      {
        id: '1',
        name: '网站登录模板',
        description: '通用的网站登录流程模板，支持用户名密码登录',
        category: 'web',
        complexity: 'simple',
        steps: [
          {
            id: '1',
            name: '打开登录页面',
            action: 'navigate',
            url: '{{loginUrl}}',
            description: '导航到登录页面',
            delay: 0,
            optional: false,
            screenshot: false,
            enableParameterization: true
          },
          {
            id: '2',
            name: '输入用户名',
            action: 'input',
            selector: 'input[name="username"]',
            text: '{{username}}',
            description: '输入用户名',
            delay: 500,
            optional: false,
            screenshot: false,
            enableParameterization: true
          },
          {
            id: '3',
            name: '输入密码',
            action: 'input',
            selector: 'input[type="password"]',
            text: '{{password}}',
            description: '输入密码',
            delay: 500,
            optional: false,
            screenshot: false,
            enableParameterization: true
          },
          {
            id: '4',
            name: '点击登录按钮',
            action: 'click',
            selector: 'button[type="submit"]',
            description: '点击登录按钮',
            delay: 0,
            optional: false,
            screenshot: true,
            enableParameterization: false
          }
        ],
        parameters: [
          {
            id: '1',
            name: 'loginUrl',
            type: 'url',
            defaultValue: 'https://example.com/login',
            description: '登录页面URL',
            required: true,
            validation: ''
          },
          {
            id: '2',
            name: 'username',
            type: 'string',
            defaultValue: '',
            description: '用户名',
            required: true,
            validation: '^[a-zA-Z0-9_]+$'
          },
          {
            id: '3',
            name: 'password',
            type: 'string',
            defaultValue: '',
            description: '密码',
            required: true,
            validation: ''
          }
        ],
        config: {
          executionMode: 'sequential',
          errorHandling: 'stop',
          timeout: 60,
          enableLogging: true,
          screenshotOnError: true,
          allowParameterization: true
        },
        usageCount: 25,
        version: '1.0.0',
        status: 'published',
        createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 5).toISOString()
      },
      {
        id: '2',
        name: '表单数据提取',
        description: '提取页面中的表单数据，包括所有输入字段的值',
        category: 'data',
        complexity: 'medium',
        steps: [
          {
            id: '1',
            name: '等待页面加载',
            action: 'wait',
            waitTime: 2000,
            description: '等待页面完全加载',
            delay: 0,
            optional: false,
            screenshot: false,
            enableParameterization: false
          },
          {
            id: '2',
            name: '提取表单数据',
            action: 'extract',
            selector: 'form input, form select, form textarea',
            extractType: 'attribute',
            attributeName: 'value',
            variableName: 'formData',
            description: '提取所有表单字段的值',
            delay: 0,
            optional: false,
            screenshot: true,
            enableParameterization: false
          }
        ],
        parameters: [],
        config: {
          executionMode: 'sequential',
          errorHandling: 'continue',
          timeout: 30,
          enableLogging: true,
          screenshotOnError: true,
          allowParameterization: false
        },
        usageCount: 12,
        version: '1.1.0',
        status: 'published',
        createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: '3',
        name: '页面性能测试',
        description: '测试页面的加载性能和响应时间',
        category: 'test',
        complexity: 'complex',
        steps: [
          {
            id: '1',
            name: '记录开始时间',
            action: 'script',
            script: 'window.startTime = Date.now();',
            description: '记录测试开始时间',
            delay: 0,
            optional: false,
            screenshot: false,
            enableParameterization: false
          },
          {
            id: '2',
            name: '导航到目标页面',
            action: 'navigate',
            url: '{{targetUrl}}',
            description: '导航到要测试的页面',
            delay: 0,
            optional: false,
            screenshot: false,
            enableParameterization: true
          },
          {
            id: '3',
            name: '等待页面完全加载',
            action: 'wait',
            waitCondition: 'load',
            description: '等待页面加载完成',
            delay: 0,
            optional: false,
            screenshot: false,
            enableParameterization: false
          },
          {
            id: '4',
            name: '计算加载时间',
            action: 'script',
            script: 'window.loadTime = Date.now() - window.startTime; console.log("页面加载时间:", window.loadTime, "ms");',
            description: '计算并记录页面加载时间',
            delay: 0,
            optional: false,
            screenshot: true,
            enableParameterization: false
          }
        ],
        parameters: [
          {
            id: '1',
            name: 'targetUrl',
            type: 'url',
            defaultValue: 'https://example.com',
            description: '要测试的页面URL',
            required: true,
            validation: ''
          }
        ],
        config: {
          executionMode: 'sequential',
          errorHandling: 'stop',
          timeout: 120,
          enableLogging: true,
          screenshotOnError: true,
          allowParameterization: true
        },
        usageCount: 8,
        version: '2.0.0',
        status: 'published',
        createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
      }
    ]

    taskTemplates.value = sampleTemplates
  }

  // 创建模板
  const createTemplate = async (templateData: Partial<TaskTemplate>): Promise<TaskTemplate> => {
    try {
      isLoading.value = true

      const template: TaskTemplate = {
        id: Date.now().toString(),
        name: templateData.name || '未命名模板',
        description: templateData.description || '',
        category: templateData.category || 'custom',
        complexity: templateData.complexity || 'simple',
        steps: templateData.steps || [],
        parameters: templateData.parameters || [],
        config: {
          executionMode: 'sequential',
          errorHandling: 'stop',
          timeout: 60,
          enableLogging: true,
          screenshotOnError: true,
          allowParameterization: false,
          ...templateData.config
        },
        usageCount: 0,
        version: '1.0.0',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      taskTemplates.value.push(template)
      ElMessage.success('模板创建成功')
      return template

    } catch (error) {
      ElMessage.error('创建模板失败：' + (error as Error).message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 更新模板
  const updateTemplate = async (template: TaskTemplate): Promise<void> => {
    try {
      isLoading.value = true

      const index = taskTemplates.value.findIndex(t => t.id === template.id)
      if (index >= 0) {
        taskTemplates.value[index] = {
          ...template,
          updatedAt: new Date().toISOString()
        }
        ElMessage.success('模板更新成功')
      } else {
        throw new Error('模板不存在')
      }

    } catch (error) {
      ElMessage.error('更新模板失败：' + (error as Error).message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 删除模板
  const deleteTemplate = async (templateId: string): Promise<void> => {
    try {
      isLoading.value = true

      const index = taskTemplates.value.findIndex(t => t.id === templateId)
      if (index >= 0) {
        taskTemplates.value.splice(index, 1)
        ElMessage.success('模板删除成功')
      } else {
        throw new Error('模板不存在')
      }

    } catch (error) {
      ElMessage.error('删除模板失败：' + (error as Error).message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 复制模板
  const duplicateTemplate = async (templateId: string): Promise<TaskTemplate> => {
    try {
      const originalTemplate = taskTemplates.value.find(t => t.id === templateId)
      if (!originalTemplate) {
        throw new Error('模板不存在')
      }

      const duplicatedTemplate = {
        ...originalTemplate,
        id: Date.now().toString(),
        name: `${originalTemplate.name} (副本)`,
        usageCount: 0,
        status: 'draft' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      taskTemplates.value.push(duplicatedTemplate)
      ElMessage.success('模板复制成功')
      return duplicatedTemplate

    } catch (error) {
      ElMessage.error('复制模板失败：' + (error as Error).message)
      throw error
    }
  }

  // 执行模板
  const executeTemplate = async (templateId: string, _parameters?: Record<string, any>): Promise<void> => {
    try {
      const template = taskTemplates.value.find(t => t.id === templateId)
      if (!template) {
        throw new Error('模板不存在')
      }

      // 增加使用次数
      template.usageCount++
      template.updatedAt = new Date().toISOString()

      // 模拟执行过程
      ElMessage.info('开始执行模板：' + template.name)
      
      // 这里可以调用实际的任务执行逻辑
      // await executeTaskFromTemplate(template, parameters)

    } catch (error) {
      ElMessage.error('执行模板失败：' + (error as Error).message)
      throw error
    }
  }

  // 导入模板
  const importTemplates = async (importedTemplates: TaskTemplate[]): Promise<void> => {
    try {
      isLoading.value = true

      importedTemplates.forEach(template => {
        // 生成新的ID避免冲突
        template.id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
        template.createdAt = new Date().toISOString()
        template.updatedAt = new Date().toISOString()
        template.usageCount = 0
        template.status = 'draft'

        taskTemplates.value.push(template)
      })

      ElMessage.success(`成功导入 ${importedTemplates.length} 个模板`)

    } catch (error) {
      ElMessage.error('导入模板失败：' + (error as Error).message)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 导出模板
  const exportTemplates = async (templateIds: string[]): Promise<TaskTemplate[]> => {
    try {
      const templates = taskTemplates.value.filter(t => templateIds.includes(t.id))
      
      // 清理敏感信息
      const exportData = templates.map(template => ({
        ...template,
        usageCount: 0, // 重置使用次数
        exportedAt: new Date().toISOString()
      }))

      return exportData

    } catch (error) {
      ElMessage.error('导出模板失败：' + (error as Error).message)
      throw error
    }
  }

  // 发布模板
  const publishTemplate = async (templateId: string): Promise<void> => {
    try {
      const template = taskTemplates.value.find(t => t.id === templateId)
      if (!template) {
        throw new Error('模板不存在')
      }

      template.status = 'published'
      template.updatedAt = new Date().toISOString()
      
      ElMessage.success('模板发布成功')

    } catch (error) {
      ElMessage.error('发布模板失败：' + (error as Error).message)
      throw error
    }
  }

  // 归档模板
  const archiveTemplate = async (templateId: string): Promise<void> => {
    try {
      const template = taskTemplates.value.find(t => t.id === templateId)
      if (!template) {
        throw new Error('模板不存在')
      }

      template.status = 'archived'
      template.updatedAt = new Date().toISOString()
      
      ElMessage.success('模板已归档')

    } catch (error) {
      ElMessage.error('归档模板失败：' + (error as Error).message)
      throw error
    }
  }

  // 初始化
  initializeSampleTemplates()

  return {
    // 状态
    taskTemplates,
    isLoading,

    // 方法
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    executeTemplate,
    importTemplates,
    exportTemplates,
    publishTemplate,
    archiveTemplate
  }
}