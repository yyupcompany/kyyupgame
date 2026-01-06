import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { request } from '@/api/request'

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

  private constructor() {
    this.initRouteWatcher()
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
  private initRouteWatcher() {
    const route = useRoute()
    
    // 监听路由变化
    this.routeWatcher = watch(
      () => route.path,
      async (newPath) => {
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
      
      const response = await request.get(`/page-guides/by-path/${encodedPath}`)
      
      if (response.data && response.data.success) {
        const pageGuide = response.data.data as PageGuide
        this.currentPageGuide.value = pageGuide
        
        console.log('✅ 页面说明文档加载成功:', pageGuide.pageName)
        
        // 通知所有监听器
        this.notifyPageChange(pageGuide)
        
        return pageGuide
      } else {
        console.log('❌ 未找到页面说明文档:', pagePath)
        this.currentPageGuide.value = null
        this.notifyPageChange(null)
        return null
      }
    } catch (error: any) {
      console.error('❌ 加载页面说明文档失败:', error)
      
      // 如果是404错误，说明页面没有说明文档，这是正常的
      if (error.response?.status === 404) {
        console.log('📝 页面暂无说明文档:', pagePath)
        this.currentPageGuide.value = null
        this.notifyPageChange(null)
      } else {
        console.error('🚨 页面说明文档服务异常:', error.message)
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
   * 通知页面变化
   */
  private notifyPageChange(pageGuide: PageGuide | null) {
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
    introduction += `${pageGuide.pageDescription}\n\n`
    
    if (pageGuide.sections && pageGuide.sections.length > 0) {
      introduction += `**功能板块：**\n`
      pageGuide.sections.forEach((section, index) => {
        introduction += `${index + 1}. **${section.sectionName}**：${section.sectionDescription}\n`
        
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
  public getCurrentPageContext(): any {
    const pageGuide = this.currentPageGuide.value
    if (!pageGuide) {
      return null
    }
    
    return {
      pagePath: pageGuide.pagePath,
      pageName: pageGuide.pageName,
      category: pageGuide.category,
      relatedTables: pageGuide.relatedTables,
      contextPrompt: pageGuide.contextPrompt,
      sections: pageGuide.sections?.map(section => ({
        name: section.sectionName,
        description: section.sectionDescription,
        features: section.features
      }))
    }
  }

  /**
   * 销毁服务
   */
  public destroy() {
    if (this.routeWatcher) {
      this.routeWatcher()
      this.routeWatcher = null
    }
    
    this.pageChangeListeners = []
    this.currentPageGuide.value = null
  }
}

/**
 * 页面感知服务实例
 */
export const pageAwarenessService = PageAwarenessService.getInstance()

/**
 * 页面感知组合式函数
 */
export function usePageAwareness() {
  const service = PageAwarenessService.getInstance()
  
  return {
    currentPageGuide: service.currentPageGuide,
    loadPageGuide: service.loadPageGuide.bind(service),
    onPageChange: service.onPageChange.bind(service),
    offPageChange: service.offPageChange.bind(service),
    generatePageIntroduction: service.generatePageIntroduction.bind(service),
    getCurrentPageContext: service.getCurrentPageContext.bind(service)
  }
}
