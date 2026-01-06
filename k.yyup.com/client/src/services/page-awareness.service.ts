import { ref, watch } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import request from '../utils/request'
import { pageElementScannerService } from './page-element-scanner.service'

/**
 * 页面说明文档接口
 */
export interface PageGuide {
  id: number
  pagePath: string
  pageName: string
  pageDescription: string
  category: string
  importance: number
  relatedTables: string[]
  contextPrompt: string
  sections: PageGuideSection[]
}

/**
 * 页面功能板块接口
 */
export interface PageGuideSection {
  id: number
  sectionName: string
  sectionDescription: string
  sectionPath?: string
  features: string[]
  sortOrder: number
}

/**
 * 页面感知服务
 */
export class PageAwarenessService {
  private static instance: PageAwarenessService

  // 当前页面说明文档
  public currentPageGuide = ref<PageGuide | null>(null)

  // 页面变化监听器
  private pageChangeListeners: Array<(pageGuide: PageGuide | null) => void> = []

  // 路由监听器
  private routeWatcher: any = null

  // 是否已初始化
  private initialized = false

  // 🎯 用户控制状态
  private userEnabled = true // 用户手动控制
  private workflowSuppressed = false // 工作流抑制

  private constructor() {
    // 不在构造函数中初始化路由监听器
  }

  public static getInstance(): PageAwarenessService {
    if (!PageAwarenessService.instance) {
      PageAwarenessService.instance = new PageAwarenessService()
    }
    return PageAwarenessService.instance
  }

  /**
   * 初始化路由监听器
   */
  public initRouteWatcher(route: RouteLocationNormalizedLoaded) {
    if (this.initialized) {
      return
    }

    this.initialized = true

    // 监听路由变化
    this.routeWatcher = watch(
      () => route.path,
      async (newPath: string) => {
        console.log('🔍 页面路径变化:', newPath)
        await this.loadPageGuide(newPath)
      },
      { immediate: true }
    )
  }

  /**
   * 加载页面说明文档
   */
  public async loadPageGuide(pagePath: string): Promise<PageGuide | null> {
    try {
      console.log('📖 开始加载页面说明文档:', pagePath)

      // 编码路径以处理特殊字符
      const encodedPath = encodeURIComponent(pagePath)

      // 首先尝试从AI知识库获取文档
      let response;
      try {
        // 使用静默请求，避免AI知识库404产生错误日志
        // 使用默认API基础URL
        const apiBaseUrl = '/api'

        const aiResponse = await fetch(`${apiBaseUrl}/ai-knowledge/by-page/${encodedPath}?_t=${Date.now()}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('kindergarten_token') || ''}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (aiResponse.ok) {
          const data = await aiResponse.json()
          response = data
          console.log('✅ 从AI知识库获取文档成功')
        } else if (aiResponse.status === 404) {
          // AI知识库无文档，静默尝试page-guides
          console.log('🔄 AI知识库无文档，尝试page-guides...')
          response = await request.get(`/page-guides/by-path/${encodedPath}`)
          console.log('✅ 从page-guides获取文档成功')
        } else {
          throw new Error(`AI知识库请求失败: ${aiResponse.status}`)
        }
      } catch (aiError: any) {
        // 任何错误都尝试page-guides作为fallback
        console.log('🔄 AI知识库不可用，尝试page-guides...')
        response = await request.get(`/page-guides/by-path/${encodedPath}`)
        console.log('✅ 从page-guides获取文档成功')
      }

      if (response.success && response.data) {
        const pageGuide = response.data as PageGuide
        this.currentPageGuide.value = pageGuide

        console.log('✅ 页面说明文档加载成功:', pageGuide.pageName)

        // 通知所有监听器
        this.notifyPageChange(pageGuide)

        return pageGuide
      } else {
        this.currentPageGuide.value = null
        this.notifyPageChange(null)
        return null
      }
    } catch (error: any) {
      console.warn('❌ 加载页面说明文档失败:', error)

      // 如果是404错误，说明页面没有说明文档，这是正常的
      if (error.response?.status === 404) {
        console.log('📝 页面暂无说明文档:', pagePath)
        this.currentPageGuide.value = null
        this.notifyPageChange(null)
      } else {
        console.warn('🚨 页面说明文档服务异常:', error.message)
      }

      return null
    }
  }

  /**
   * 添加页面变化监听器
   */
  public onPageChange(listener: (pageGuide: PageGuide | null) => void) {
    this.pageChangeListeners.push(listener)
    
    // 如果当前已有页面说明文档，立即通知
    if (this.currentPageGuide.value) {
      listener(this.currentPageGuide.value)
    }
  }

  /**
   * 移除页面变化监听器
   */
  public offPageChange(listener: (pageGuide: PageGuide | null) => void) {
    const index = this.pageChangeListeners.indexOf(listener)
    if (index > -1) {
      this.pageChangeListeners.splice(index, 1)
    }
  }

  /**
   * 🎯 设置用户启用状态
   */
  public setUserEnabled(enabled: boolean): void {
    this.userEnabled = enabled
    console.log(`🎯 用户${enabled ? '开启' : '关闭'}页面感知功能`)

    // 如果用户关闭了功能，清除当前页面介绍
    if (!enabled) {
      this.clearCurrentPageIntroduction()
    }
  }

  /**
   * 🎯 设置工作流抑制状态
   */
  public setWorkflowSuppressed(suppressed: boolean): void {
    this.workflowSuppressed = suppressed
    console.log(`🎯 工作流${suppressed ? '抑制' : '恢复'}页面感知功能`)
  }

  /**
   * 🎯 判断是否应该抑制页面介绍
   */
  private shouldSuppressPageIntro(): boolean {
    // 优先级：用户手动关闭 > 工作流抑制 > 其他条件
    if (!this.userEnabled) {
      console.log('🚫 页面感知被用户关闭')
      return true
    }

    if (this.workflowSuppressed) {
      console.log('🎯 页面感知被工作流抑制')
      return true
    }

    // 检查其他抑制条件...
    return false
  }

  /**
   * 🎯 清除当前页面介绍消息
   */
  private clearCurrentPageIntroduction(): void {
    // 通知AI助手清除页面介绍消息
    this.pageChangeListeners.forEach(listener => {
      try {
        listener(null) // 传递null表示清除
      } catch (error) {
        console.error('清除页面介绍失败:', error)
      }
    })
  }

  /**
   * 通知页面变化
   */
  private notifyPageChange(pageGuide: PageGuide | null) {
    // 🎯 检查是否应该抑制页面介绍
    if (this.shouldSuppressPageIntro()) {
      return // 直接返回，不触发页面介绍
    }

    // 正常情况下才触发页面介绍
    this.pageChangeListeners.forEach(listener => {
      try {
        listener(pageGuide)
      } catch (error) {
        console.error('页面变化监听器执行失败:', error)
      }
    })
  }

  /**
   * 生成页面介绍消息
   */
  public generatePageIntroduction(pageGuide: PageGuide): string {
    let introduction = `🎯 **${pageGuide.pageName}**\n\n`
    
    // 处理 pageDescription，可能为空或undefined
    if (pageGuide.pageDescription && pageGuide.pageDescription !== 'undefined') {
      introduction += `${pageGuide.pageDescription}\n\n`
    }
    
    if (pageGuide.sections && pageGuide.sections.length > 0) {
      introduction += `**功能板块：**\n`
      pageGuide.sections.forEach((section, index) => {
        // 处理来自AI知识库的数据结构
        const sectionName = (section as any).title || section.sectionName || `功能模块${index + 1}`
        const sectionDesc = (section as any).content || section.sectionDescription || '暂无描述'
        
        introduction += `${index + 1}. **${sectionName}**：${sectionDesc.substring(0, 100)}${sectionDesc.length > 100 ? '...' : ''}\n`
        
        if (section.features && section.features.length > 0) {
          introduction += `   - 特性：${section.features.join('、')}\n`
        }
      })
      introduction += '\n'
    }
    
    introduction += `我可以帮助您了解和使用这个页面的各项功能。有什么问题请随时询问！`
    
    return introduction
  }

  /**
   * 获取当前页面的上下文信息（用于AI请求）
   */
  public async getCurrentPageContext(): Promise<any> {
    const pageGuide = this.currentPageGuide.value
    
    // 获取实时页面结构信息
    const [pageState, availableActions] = await Promise.all([
      pageElementScannerService.getCurrentPageState(),
      pageElementScannerService.getAvailableActions()
    ])
    
    const context = {
      // 基础页面信息
      pagePath: pageGuide?.pagePath || window.location.pathname,
      pageName: pageGuide?.pageName || document.title,
      category: pageGuide?.category || 'unknown',
      relatedTables: pageGuide?.relatedTables || [],
      contextPrompt: pageGuide?.contextPrompt || '',
      sections: pageGuide?.sections?.map((section: any) => ({
        name: section.sectionName,
        description: section.sectionDescription,
        features: section.features
      })) || [],
      
      // 实时页面结构
      currentState: {
        url: pageState.url,
        title: pageState.title,
        forms: pageState.forms.map(f => ({
          name: f.name,
          type: f.type,
          label: f.label,
          required: f.required,
          selector: f.selector
        })),
        buttons: pageState.buttons.map(b => ({
          text: b.text,
          selector: b.selector,
          isInteractive: b.isInteractive
        })),
        links: pageState.links.map(l => ({
          text: l.text,
          href: l.href,
          selector: l.selector
        })),
        inputs: pageState.inputs.map(i => ({
          type: i.type,
          placeholder: i.placeholder,
          selector: i.selector
        })),
        mainContent: pageState.mainContent.substring(0, 200) + '...',
        notifications: pageState.notifications,
        errors: pageState.errors
      },
      
      // 可用操作
      availableActions: availableActions.map(a => ({
        type: a.type,
        element: a.element,
        description: a.description,
        selector: a.selector
      }))
    }
    
    console.log('🎯 增强页面上下文已生成:', {
      基础信息: !!pageGuide,
      表单数: context.currentState.forms.length,
      按钮数: context.currentState.buttons.length,
      可用操作: context.availableActions.length
    })
    
    return context
  }

  /**
   * 清理资源
   */
  public cleanup() {
    if (this.routeWatcher) {
      this.routeWatcher()
      this.routeWatcher = null
    }
    this.initialized = false
  }

  /**
   * 🎯 获取当前状态
   */
  public getStatus() {
    return {
      userEnabled: this.userEnabled,
      workflowSuppressed: this.workflowSuppressed,
      effectivelyEnabled: this.userEnabled && !this.workflowSuppressed,
      currentPageGuide: this.currentPageGuide.value
    }
  }

  /**
   * 销毁服务
   */
  public destroy() {
    this.cleanup()
    this.pageChangeListeners = []
    this.currentPageGuide.value = null
  }
}

/**
 * 页面感知服务实例
 */
export const pageAwarenessService = PageAwarenessService.getInstance()


