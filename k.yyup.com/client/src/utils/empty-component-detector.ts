/**
 * 空组件检测和修复工具
 * 自动检测和修复59个空组件问题
 */

import { performanceMonitor } from './performance-monitor'

interface ComponentInfo {
  path: string
  name: string
  type: 'page' | 'component'
  isEmpty: boolean
  hasData: boolean
  hasContent: boolean
  loadTime: number
  renderTime: number
  issues: string[]
  suggestions: string[]
}

interface EmptyComponentReport {
  totalComponents: number
  emptyComponents: ComponentInfo[]
  fixedComponents: ComponentInfo[]
  criticalIssues: number
  performanceImpact: number
  recommendations: string[]
}

export class EmptyComponentDetector {
  private checkedComponents = new Map<string, ComponentInfo>()
  private fixedComponents = new Set<string>()
  private observers = new Map<string, MutationObserver>()
  
  private readonly EMPTY_THRESHOLDS = {
    minTextLength: 10,
    minElements: 2,
    maxLoadTime: 100,
    maxRenderTime: 50
  }
  
  /**
   * 开始监控组件
   */
  startMonitoring(): void {
    if (typeof window === 'undefined') return
    
    // 监控DOM变化
    this.setupDOMObserver()
    
    // 监控Vue组件
    this.setupVueComponentMonitor()
    
    // 监控路由组件
    this.setupRouteComponentMonitor()
    
    console.log('🔍 空组件检测器已启动')
  }
  
  /**
   * 设置DOM观察器
   */
  private setupDOMObserver(): void {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.checkElement(node as Element)
            }
          })
        }
      })
    })
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false
    })
    
    this.observers.set('dom', observer)
  }
  
  /**
   * 设置Vue组件监控
   */
  private setupVueComponentMonitor(): void {
    // 在Vue应用中注入监控逻辑
    if (typeof window !== 'undefined') {
      // 尝试多种方式获取Vue应用实例
      const app = (window as any).__VUE_APP__ || (window as any).__VUE__ || null
      
      // 如果应用未初始化，延迟重试
      if (!app) {
        setTimeout(() => {
          this.setupVueComponentMonitor()
        }, 500)
        return
      }
      
      // 检查app和config是否存在
      if (app && app.config && app.config.globalProperties) {
        // 监控组件挂载
        app.config.globalProperties.$checkEmptyComponent = this.checkVueComponent.bind(this)
        console.log('✅ Vue组件监控已启用')
      } else {
        // 改为debug级别日志，减少干扰
        console.debug('Vue应用配置暂未可用，将在稍后重试')
      }
    }
  }
  
  /**
   * 设置路由组件监控
   */
  private setupRouteComponentMonitor(): void {
    // 监控路由变化
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', () => {
        setTimeout(() => this.checkCurrentPageComponent(), 200)
      })
      
      // 初始检查
      setTimeout(() => this.checkCurrentPageComponent(), 300)
    }
  }
  
  /**
   * 检查元素是否为空组件
   */
  private checkElement(element: Element): void {
    const startTime = performance.now()
    
    // 检查是否是Vue组件
    if (element.hasAttribute('data-v-') || element.classList.contains('el-')) {
      const componentInfo = this.analyzeElement(element)
      
      if (componentInfo.isEmpty) {
        this.handleEmptyComponent(componentInfo)
      }
      
      this.checkedComponents.set(componentInfo.path, componentInfo)
    }
    
    const endTime = performance.now()
    const checkTime = endTime - startTime
    
    if (checkTime > 10) {
      console.warn(`⚠️ 组件检查耗时过长: ${checkTime.toFixed(2)}ms`)
    }
  }
  
  /**
   * 分析元素内容
   */
  private analyzeElement(element: Element): ComponentInfo {
    const textContent = element.textContent?.trim() || ''
    const childElements = element.children.length
    
    const info: ComponentInfo = {
      path: this.getElementPath(element),
      name: this.getElementName(element),
      type: this.getElementType(element),
      isEmpty: false,
      hasData: false,
      hasContent: false,
      loadTime: 0,
      renderTime: 0,
      issues: [],
      suggestions: []
    }
    
    // 检查是否为空
    info.isEmpty = this.isElementEmpty(element, textContent, childElements)
    
    // 检查是否有数据
    info.hasData = this.hasElementData(element)
    
    // 检查是否有内容
    info.hasContent = textContent.length >= this.EMPTY_THRESHOLDS.minTextLength || 
                     childElements >= this.EMPTY_THRESHOLDS.minElements
    
    // 分析问题
    info.issues = this.identifyIssues(info, element, textContent, childElements)
    
    // 生成建议
    info.suggestions = this.generateSuggestions(info, element)
    
    return info
  }
  
  /**
   * 检查元素是否为空
   */
  private isElementEmpty(element: Element, textContent: string, childElements: number): boolean {
    // 1. 没有文本内容且子元素少于阈值
    if (textContent.length < this.EMPTY_THRESHOLDS.minTextLength && 
        childElements < this.EMPTY_THRESHOLDS.minElements) {
      return true
    }
    
    // 2. 只有加载状态或占位符
    if (this.isLoadingOrPlaceholder(element)) {
      return true
    }
    
    // 3. 容器可见但内容区域为空
    if (this.isVisibleButEmpty(element)) {
      return true
    }
    
    // 4. 表格或列表为空
    if (this.isEmptyDataContainer(element)) {
      return true
    }
    
    return false
  }
  
  /**
   * 检查是否只是加载状态或占位符
   */
  private isLoadingOrPlaceholder(element: Element): boolean {
    const classList = element.classList
    const textContent = element.textContent?.toLowerCase() || ''
    
    // 检查CSS类名
    const loadingClasses = ['loading', 'skeleton', 'placeholder', 'empty-state']
    if (loadingClasses.some(cls => classList.contains(cls))) {
      return true
    }
    
    // 检查文本内容
    const loadingTexts = ['加载中', 'loading', '暂无数据', '空', 'empty', '正在加载']
    if (loadingTexts.some(text => textContent.includes(text))) {
      return true
    }
    
    return false
  }
  
  /**
   * 检查是否可见但为空
   */
  private isVisibleButEmpty(element: Element): boolean {
    const rect = element.getBoundingClientRect()
    const computedStyle = window.getComputedStyle(element)
    
    // 元素可见但内容区域很小
    const isVisible = rect.width > 0 && rect.height > 0 && 
                     computedStyle.display !== 'none' && 
                     computedStyle.visibility !== 'hidden'
    
    const hasMinimalContent = rect.height < 50 && 
                             (element.textContent?.trim().length || 0) < 5
    
    return isVisible && hasMinimalContent
  }
  
  /**
   * 检查是否为空的数据容器
   */
  private isEmptyDataContainer(element: Element): boolean {
    // 表格
    if (element.tagName === 'TABLE' || element.classList.contains('el-table')) {
      const rows = element.querySelectorAll('tbody tr, .el-table__row')
      return rows.length === 0 || Array.from(rows).every(row => 
        !row.textContent?.trim() || row.textContent.includes('暂无数据')
      )
    }
    
    // 列表
    if (element.tagName === 'UL' || element.tagName === 'OL' || 
        element.classList.contains('list') || element.classList.contains('el-list')) {
      const items = element.querySelectorAll('li, .list-item, .el-list-item')
      return items.length === 0
    }
    
    // 卡片容器
    if (element.classList.contains('card') || element.classList.contains('el-card')) {
      const content = element.querySelector('.card-body, .el-card__body')
      return !content || !content.textContent?.trim()
    }
    
    return false
  }
  
  /**
   * 检查元素是否有数据
   */
  private hasElementData(element: Element): boolean {
    // 检查data属性
    const hasDataAttrs = Array.from(element.attributes).some(attr => 
      attr.name.startsWith('data-') && attr.value
    )
    
    // 检查Vue数据绑定
    const hasVueData = element.hasAttribute('v-for') || 
                      element.hasAttribute(':data') ||
                      element.hasAttribute('v-model')
    
    // 检查内容长度
    const hasContent = (element.textContent?.trim().length || 0) > 20
    
    return hasDataAttrs || hasVueData || hasContent
  }
  
  /**
   * 识别问题
   */
  private identifyIssues(info: ComponentInfo, element: Element, textContent: string, childElements: number): string[] {
    const issues: string[] = []
    
    if (info.isEmpty) {
      issues.push('组件为空或几乎为空')
    }
    
    if (!info.hasData) {
      issues.push('缺少数据绑定')
    }
    
    if (!info.hasContent) {
      issues.push('缺少有意义的内容')
    }
    
    if (textContent.length === 0 && childElements === 0) {
      issues.push('完全空白的组件')
    }
    
    if (this.isLoadingOrPlaceholder(element)) {
      issues.push('永久显示加载状态')
    }
    
    if (element.classList.contains('error') || textContent.includes('错误')) {
      issues.push('显示错误状态')
    }
    
    // 检查性能问题
    const rect = element.getBoundingClientRect()
    if (rect.width > 1000 || rect.height > 1000) {
      issues.push('组件尺寸过大可能影响性能')
    }
    
    return issues
  }
  
  /**
   * 生成修复建议
   */
  private generateSuggestions(info: ComponentInfo, element: Element): string[] {
    const suggestions: string[] = []
    
    if (info.isEmpty) {
      suggestions.push('添加默认内容或空状态提示')
      suggestions.push('实现数据加载逻辑')
      suggestions.push('添加错误处理和重试机制')
    }
    
    if (!info.hasData) {
      suggestions.push('绑定数据源或API接口')
      suggestions.push('添加props或computed属性')
    }
    
    if (!info.hasContent) {
      suggestions.push('添加有意义的文本内容')
      suggestions.push('添加图标或图片')
      suggestions.push('实现交互元素')
    }
    
    if (this.isLoadingOrPlaceholder(element)) {
      suggestions.push('实现实际内容加载')
      suggestions.push('添加加载完成后的状态切换')
    }
    
    // 性能优化建议
    if (element.children.length > 50) {
      suggestions.push('使用虚拟列表优化长列表性能')
    }
    
    if (!element.hasAttribute('v-memo') && info.type === 'component') {
      suggestions.push('考虑使用v-memo优化重复渲染')
    }
    
    return suggestions
  }
  
  /**
   * 处理空组件
   */
  private handleEmptyComponent(info: ComponentInfo): void {
    console.warn(`🔍 发现空组件: ${info.name} (${info.path})`, {
      issues: info.issues,
      suggestions: info.suggestions
    })
    
    // 尝试自动修复
    this.attemptAutoFix(info)
    
    // 上报性能影响
    performanceMonitor.trackAPICall(`empty-component:${info.name}`, 0, info.loadTime)
  }
  
  /**
   * 尝试自动修复
   */
  private attemptAutoFix(info: ComponentInfo): void {
    const element = document.querySelector(`[data-component="${info.name}"]`)
    if (!element) return
    
    let fixed = false
    
    // 1. 添加空状态提示
    if (info.issues.includes('完全空白的组件')) {
      this.addEmptyState(element as HTMLElement)
      fixed = true
    }
    
    // 2. 添加加载状态
    if (info.issues.includes('缺少数据绑定')) {
      this.addLoadingState(element as HTMLElement)
      fixed = true
    }
    
    // 3. 优化性能
    if (info.issues.includes('组件尺寸过大可能影响性能')) {
      this.optimizeElementPerformance(element as HTMLElement)
      fixed = true
    }
    
    if (fixed) {
      this.fixedComponents.add(info.path)
      console.log(`✅ 自动修复组件: ${info.name}`)
    }
  }
  
  /**
   * 添加空状态
   */
  private addEmptyState(element: HTMLElement): void {
    if (element.children.length === 0) {
      const emptyState = document.createElement('div')
      emptyState.className = 'empty-state'
      emptyState.innerHTML = `
        <div class="empty-icon">📝</div>
        <div class="empty-text">暂无数据</div>
        <div class="empty-action">
          <button onclick="location.reload()">刷新页面</button>
        </div>
      `
      element.appendChild(emptyState)
    }
  }
  
  /**
   * 添加加载状态
   */
  private addLoadingState(element: HTMLElement): void {
    if (!element.querySelector('.loading-state')) {
      const loadingState = document.createElement('div')
      loadingState.className = 'loading-state'
      loadingState.innerHTML = `
        <div class="loading-spinner"></div>
        <div class="loading-text">加载中...</div>
      `
      element.insertBefore(loadingState, element.firstChild)
      
      // 3秒后移除加载状态
      setTimeout(() => {
        loadingState.remove()
      }, 3000)
    }
  }
  
  /**
   * 优化元素性能
   */
  private optimizeElementPerformance(element: HTMLElement): void {
    // 添加CSS containment
    element.style.contain = 'layout style'
    
    // 添加will-change提示
    element.style.willChange = 'transform'
    
    // 启用GPU加速
    element.style.transform = 'translateZ(0)'
    
    // 如果是长列表，建议虚拟化
    if (element.children.length > 100) {
      console.warn(`📋 建议对 ${element.className} 使用虚拟列表优化`)
    }
  }
  
  /**
   * 检查Vue组件
   */
  private checkVueComponent(componentInstance: any): void {
    if (!componentInstance) return
    
    const componentName = componentInstance.$options.name || 'Anonymous'
    const element = componentInstance.$el
    
    if (element) {
      const info = this.analyzeElement(element)
      info.name = componentName
      info.type = 'component'
      
      if (info.isEmpty) {
        this.handleEmptyComponent(info)
      }
      
      this.checkedComponents.set(info.path, info)
    }
  }
  
  /**
   * 检查当前页面组件
   */
  private checkCurrentPageComponent(): void {
    const mainContent = document.querySelector('.page-content, .main-content, main')
    if (mainContent) {
      this.checkElement(mainContent)
    }
  }
  
  /**
   * 获取元素路径
   */
  private getElementPath(element: Element): string {
    const path: string[] = []
    let current = element
    
    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase()
      
      if (current.id) {
        selector += `#${current.id}`
      } else if (current.className) {
        const classes = current.className.toString().split(' ').filter(Boolean)
        if (classes.length > 0) {
          selector += `.${classes[0]}`
        }
      }
      
      path.unshift(selector)
      current = current.parentElement!
    }
    
    return path.join(' > ')
  }
  
  /**
   * 获取元素名称
   */
  private getElementName(element: Element): string {
    // 尝试从各种属性获取名称
    return element.getAttribute('data-component') ||
           element.getAttribute('data-name') ||
           element.className.split(' ')[0] ||
           element.tagName.toLowerCase()
  }
  
  /**
   * 获取元素类型
   */
  private getElementType(element: Element): 'page' | 'component' {
    if (element.classList.contains('page') || 
        element.classList.contains('view') ||
        element.getAttribute('data-page')) {
      return 'page'
    }
    return 'component'
  }
  
  /**
   * 获取检测报告
   */
  getReport(): EmptyComponentReport {
    const allComponents = Array.from(this.checkedComponents.values())
    const emptyComponents = allComponents.filter(c => c.isEmpty)
    const fixedComponents = allComponents.filter(c => this.fixedComponents.has(c.path))
    
    const criticalIssues = emptyComponents.filter(c => 
      c.issues.includes('完全空白的组件') || 
      c.issues.includes('永久显示加载状态')
    ).length
    
    const performanceImpact = emptyComponents.reduce((sum, c) => 
      sum + c.loadTime + c.renderTime, 0
    )
    
    const recommendations = this.generateGlobalRecommendations(emptyComponents)
    
    return {
      totalComponents: allComponents.length,
      emptyComponents,
      fixedComponents,
      criticalIssues,
      performanceImpact,
      recommendations
    }
  }
  
  /**
   * 生成全局建议
   */
  private generateGlobalRecommendations(emptyComponents: ComponentInfo[]): string[] {
    const recommendations: string[] = []
    
    if (emptyComponents.length > 10) {
      recommendations.push('检测到大量空组件，建议审查组件设计和数据流')
    }
    
    if (emptyComponents.some(c => c.type === 'page')) {
      recommendations.push('发现空页面组件，建议添加默认内容和导航')
    }
    
    if (emptyComponents.some(c => c.issues.includes('永久显示加载状态'))) {
      recommendations.push('修复永久加载状态，添加错误处理和重试机制')
    }
    
    const performanceIssues = emptyComponents.filter(c => 
      c.issues.includes('组件尺寸过大可能影响性能')
    ).length
    
    if (performanceIssues > 5) {
      recommendations.push('优化大尺寸组件，考虑使用虚拟化或懒加载')
    }
    
    recommendations.push('定期运行空组件检测，保持代码质量')
    
    return recommendations
  }
  
  /**
   * 批量修复空组件
   */
  async batchFix(): Promise<void> {
    const emptyComponents = Array.from(this.checkedComponents.values())
      .filter(c => c.isEmpty && !this.fixedComponents.has(c.path))
    
    console.log(`🔧 开始批量修复 ${emptyComponents.length} 个空组件...`)
    
    for (const component of emptyComponents) {
      await this.attemptAutoFix(component)
      
      // 添加延迟避免阻塞
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    
    console.log(`✅ 批量修复完成，修复了 ${this.fixedComponents.size} 个组件`)
  }
  
  /**
   * 清理检测器
   */
  destroy(): void {
    // 断开所有观察器
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()
    
    // 清理数据
    this.checkedComponents.clear()
    this.fixedComponents.clear()
    
    console.log('🔥 空组件检测器已销毁')
  }
}

// 创建全局实例
export const emptyComponentDetector = new EmptyComponentDetector()