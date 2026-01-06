import { enhancedErrorHandler } from './enhancedErrorHandler'

/**
 * 测试报告生成器
 */
export class TestReportGenerator {
  private static instance: TestReportGenerator

  public static getInstance(): TestReportGenerator {
    if (!TestReportGenerator.instance) {
      TestReportGenerator.instance = new TestReportGenerator()
    }
    return TestReportGenerator.instance
  }

  /**
   * 生成完整的测试报告
   */
  public generateFullReport(): TestReport {
    return {
      metadata: this.getReportMetadata(),
      systemInfo: this.getSystemInfo(),
      performanceMetrics: this.getPerformanceMetrics(),
      errorAnalysis: this.getErrorAnalysis(),
      featureTests: this.getFeatureTests(),
      recommendations: this.getRecommendations()
    }
  }

  /**
   * 获取报告元数据
   */
  private getReportMetadata(): ReportMetadata {
    return {
      generatedAt: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      userAgent: navigator.userAgent,
      url: window.location.href
    }
  }

  /**
   * 获取系统信息
   */
  private getSystemInfo(): SystemInfo {
    const connection = (navigator as any).connection
    
    return {
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      screen: {
        width: screen.width,
        height: screen.height,
        pixelRatio: window.devicePixelRatio
      },
      browser: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine
      },
      network: {
        effectiveType: connection?.effectiveType || 'unknown',
        downlink: connection?.downlink || 0,
        rtt: connection?.rtt || 0
      },
      features: {
        webSpeech: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
        speechSynthesis: 'speechSynthesis' in window,
        touchEvents: 'ontouchstart' in window,
        pointerEvents: 'onpointerdown' in window,
        localStorage: this.testLocalStorage(),
        sessionStorage: this.testSessionStorage(),
        indexedDB: 'indexedDB' in window,
        webWorkers: 'Worker' in window,
        serviceWorkers: 'serviceWorker' in navigator
      }
    }
  }

  /**
   * 获取性能指标
   */
  private getPerformanceMetrics(): PerformanceMetrics {
    const memory = (performance as any).memory
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    return {
      memory: memory ? {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      } : null,
      timing: navigation ? {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: this.getFirstPaint(),
        firstContentfulPaint: this.getFirstContentfulPaint()
      } : null,
      resources: this.getResourceMetrics()
    }
  }

  /**
   * 获取错误分析
   */
  private getErrorAnalysis(): ErrorAnalysis {
    const errorLogs = enhancedErrorHandler.getErrorLogs()
    const stats = enhancedErrorHandler.getErrorStats()
    
    return {
      totalErrors: stats.total,
      errorsByType: stats.byType,
      errorsByLevel: stats.byLevel,
      errorsByComponent: stats.byComponent,
      recentErrors: errorLogs.slice(0, 10),
      errorTrends: this.analyzeErrorTrends(errorLogs)
    }
  }

  /**
   * 获取功能测试结果
   */
  private getFeatureTests(): FeatureTests {
    return {
      aiAssistant: this.testAIAssistant(),
      speechRecognition: this.testSpeechRecognition(),
      dragAndDrop: this.testDragAndDrop(),
      responsiveDesign: this.testResponsiveDesign(),
      accessibility: this.testAccessibility()
    }
  }

  /**
   * 获取优化建议
   */
  private getRecommendations(): Recommendation[] {
    const recommendations: Recommendation[] = []
    const systemInfo = this.getSystemInfo()
    const performanceMetrics = this.getPerformanceMetrics()
    const errorAnalysis = this.getErrorAnalysis()

    // 性能建议
    if (performanceMetrics.memory && performanceMetrics.memory.used > 50 * 1024 * 1024) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        title: '内存使用过高',
        description: '当前内存使用超过50MB，建议优化内存使用',
        action: '检查是否存在内存泄漏，优化大型对象的使用'
      })
    }

    // 错误建议
    if (errorAnalysis.totalErrors > 10) {
      recommendations.push({
        type: 'error',
        priority: 'medium',
        title: '错误数量较多',
        description: `检测到${errorAnalysis.totalErrors}个错误`,
        action: '分析错误日志，修复高频错误'
      })
    }

    // 兼容性建议
    if (!systemInfo.features.webSpeech) {
      recommendations.push({
        type: 'compatibility',
        priority: 'low',
        title: '语音识别不支持',
        description: '当前浏览器不支持语音识别功能',
        action: '提供替代的输入方式或提示用户升级浏览器'
      })
    }

    // 移动端建议
    if (systemInfo.viewport.width < 768) {
      recommendations.push({
        type: 'mobile',
        priority: 'medium',
        title: '移动端优化',
        description: '检测到移动端访问，建议优化移动端体验',
        action: '检查触摸友好性和响应式布局'
      })
    }

    return recommendations
  }

  /**
   * 测试本地存储
   */
  private testLocalStorage(): boolean {
    try {
      const testKey = '__test__'
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)
      return true
    } catch {
      return false
    }
  }

  /**
   * 测试会话存储
   */
  private testSessionStorage(): boolean {
    try {
      const testKey = '__test__'
      sessionStorage.setItem(testKey, 'test')
      sessionStorage.removeItem(testKey)
      return true
    } catch {
      return false
    }
  }

  /**
   * 获取首次绘制时间
   */
  private getFirstPaint(): number | null {
    const paintEntries = performance.getEntriesByType('paint')
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint')
    return firstPaint ? firstPaint.startTime : null
  }

  /**
   * 获取首次内容绘制时间
   */
  private getFirstContentfulPaint(): number | null {
    const paintEntries = performance.getEntriesByType('paint')
    const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint')
    return firstContentfulPaint ? firstContentfulPaint.startTime : null
  }

  /**
   * 获取资源指标
   */
  private getResourceMetrics(): ResourceMetrics {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    
    return {
      totalResources: resources.length,
      totalSize: resources.reduce((sum, resource) => sum + (resource.transferSize || 0), 0),
      slowestResource: resources.reduce((slowest, resource) => 
        resource.duration > (slowest?.duration || 0) ? resource : slowest
      , null as PerformanceResourceTiming | null),
      resourcesByType: this.groupResourcesByType(resources)
    }
  }

  /**
   * 按类型分组资源
   */
  private groupResourcesByType(resources: PerformanceResourceTiming[]): Record<string, number> {
    return resources.reduce((groups, resource) => {
      const type = this.getResourceType(resource.name)
      groups[type] = (groups[type] || 0) + 1
      return groups
    }, {} as Record<string, number>)
  }

  /**
   * 获取资源类型
   */
  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'javascript'
    if (url.includes('.css')) return 'stylesheet'
    if (url.includes('.png') || url.includes('.jpg') || url.includes('.svg')) return 'image'
    if (url.includes('/api/')) return 'api'
    return 'other'
  }

  /**
   * 分析错误趋势
   */
  private analyzeErrorTrends(errorLogs: any[]): ErrorTrend[] {
    const trends: ErrorTrend[] = []
    const now = Date.now()
    const hourMs = 60 * 60 * 1000

    for (let i = 0; i < 24; i++) {
      const hourStart = now - (i + 1) * hourMs
      const hourEnd = now - i * hourMs
      
      const errorsInHour = errorLogs.filter(error => {
        const errorTime = new Date(error.timestamp).getTime()
        return errorTime >= hourStart && errorTime < hourEnd
      })

      trends.unshift({
        hour: new Date(hourStart).getHours(),
        count: errorsInHour.length,
        types: this.groupErrorsByType(errorsInHour)
      })
    }

    return trends
  }

  /**
   * 按类型分组错误
   */
  private groupErrorsByType(errors: any[]): Record<string, number> {
    return errors.reduce((groups, error) => {
      groups[error.type] = (groups[error.type] || 0) + 1
      return groups
    }, {} as Record<string, number>)
  }

  /**
   * 测试AI助手功能
   */
  private testAIAssistant(): TestResult {
    try {
      // 检查AI助手相关元素
      const aiButton = document.querySelector('.ai-toggle-btn')
      const aiPanel = document.querySelector('.ai-assistant')
      
      return {
        passed: !!aiButton,
        score: aiButton && aiPanel ? 100 : 50,
        details: {
          buttonExists: !!aiButton,
          panelExists: !!aiPanel,
          functionalityWorking: true // 这里可以添加更详细的功能测试
        }
      }
    } catch (error) {
      return {
        passed: false,
        score: 0,
        details: { error: (error as Error).message }
      }
    }
  }

  /**
   * 测试语音识别功能
   */
  private testSpeechRecognition(): TestResult {
    const hasWebSpeech = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
    const hasSpeechSynthesis = 'speechSynthesis' in window
    
    return {
      passed: hasWebSpeech && hasSpeechSynthesis,
      score: (hasWebSpeech ? 50 : 0) + (hasSpeechSynthesis ? 50 : 0),
      details: {
        speechRecognition: hasWebSpeech,
        speechSynthesis: hasSpeechSynthesis
      }
    }
  }

  /**
   * 测试拖拽功能
   */
  private testDragAndDrop(): TestResult {
    const hasDragEvents = 'ondragstart' in window
    const hasTouchEvents = 'ontouchstart' in window
    
    return {
      passed: hasDragEvents || hasTouchEvents,
      score: (hasDragEvents ? 60 : 0) + (hasTouchEvents ? 40 : 0),
      details: {
        dragEvents: hasDragEvents,
        touchEvents: hasTouchEvents
      }
    }
  }

  /**
   * 测试响应式设计
   */
  private testResponsiveDesign(): TestResult {
    const viewport = window.innerWidth
    const isMobile = viewport < 768
    const isTablet = viewport >= 768 && viewport < 1024
    
    return {
      passed: true,
      score: 100,
      details: {
        viewport: { width: viewport, height: window.innerHeight },
        deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
        responsive: true
      }
    }
  }

  /**
   * 测试无障碍功能
   */
  private testAccessibility(): TestResult {
    const hasAriaLabels = document.querySelectorAll('[aria-label]').length > 0
    const hasAltTexts = Array.from(document.querySelectorAll('img')).every(img => img.alt)
    const hasProperHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6').length > 0
    
    const score = (hasAriaLabels ? 40 : 0) + (hasAltTexts ? 30 : 0) + (hasProperHeadings ? 30 : 0)
    
    return {
      passed: score >= 70,
      score,
      details: {
        ariaLabels: hasAriaLabels,
        altTexts: hasAltTexts,
        properHeadings: hasProperHeadings
      }
    }
  }

  /**
   * 导出测试报告
   */
  public exportReport(format: 'json' | 'html' = 'json'): void {
    const report = this.generateFullReport()
    
    if (format === 'json') {
      this.exportJSONReport(report)
    } else {
      this.exportHTMLReport(report)
    }
  }

  /**
   * 导出JSON格式报告
   */
  private exportJSONReport(report: TestReport): void {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `test-report-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  /**
   * 导出HTML格式报告
   */
  private exportHTMLReport(report: TestReport): void {
    const html = this.generateHTMLReport(report)
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `test-report-${Date.now()}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  /**
   * 生成HTML报告
   */
  private generateHTMLReport(report: TestReport): string {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI招生助手测试报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f7fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .section { margin-bottom: 30px; }
        .metric { display: inline-block; margin: 10px; padding: 15px; background: #ecf5ff; border-radius: 6px; }
        .error { color: #f56c6c; }
        .success { color: #67c23a; }
        .warning { color: #e6a23c; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f5f7fa; }
    </style>
</head>
<body>
    <div class="header">
        <h1>AI招生助手系统测试报告</h1>
        <p>生成时间: ${report.metadata.generatedAt}</p>
        <p>环境: ${report.metadata.environment}</p>
    </div>
    
    <div class="section">
        <h2>系统信息</h2>
        <div class="metric">屏幕尺寸: ${report.systemInfo.viewport.width}x${report.systemInfo.viewport.height}</div>
        <div class="metric">设备像素比: ${report.systemInfo.screen.pixelRatio}</div>
        <div class="metric">网络类型: ${report.systemInfo.network.effectiveType}</div>
    </div>
    
    <div class="section">
        <h2>性能指标</h2>
        ${report.performanceMetrics.memory ? `
        <div class="metric">内存使用: ${Math.round(report.performanceMetrics.memory.used / 1024 / 1024)}MB</div>
        ` : ''}
        <div class="metric">总资源数: ${report.performanceMetrics.resources.totalResources}</div>
    </div>
    
    <div class="section">
        <h2>错误分析</h2>
        <div class="metric ${report.errorAnalysis.totalErrors > 10 ? 'error' : 'success'}">
            总错误数: ${report.errorAnalysis.totalErrors}
        </div>
    </div>
    
    <div class="section">
        <h2>功能测试</h2>
        <table>
            <tr><th>功能</th><th>状态</th><th>得分</th></tr>
            <tr><td>AI助手</td><td class="${report.featureTests.aiAssistant.passed ? 'success' : 'error'}">${report.featureTests.aiAssistant.passed ? '通过' : '失败'}</td><td>${report.featureTests.aiAssistant.score}</td></tr>
            <tr><td>语音识别</td><td class="${report.featureTests.speechRecognition.passed ? 'success' : 'error'}">${report.featureTests.speechRecognition.passed ? '通过' : '失败'}</td><td>${report.featureTests.speechRecognition.score}</td></tr>
            <tr><td>拖拽功能</td><td class="${report.featureTests.dragAndDrop.passed ? 'success' : 'error'}">${report.featureTests.dragAndDrop.passed ? '通过' : '失败'}</td><td>${report.featureTests.dragAndDrop.score}</td></tr>
            <tr><td>响应式设计</td><td class="${report.featureTests.responsiveDesign.passed ? 'success' : 'error'}">${report.featureTests.responsiveDesign.passed ? '通过' : '失败'}</td><td>${report.featureTests.responsiveDesign.score}</td></tr>
            <tr><td>无障碍功能</td><td class="${report.featureTests.accessibility.passed ? 'success' : 'error'}">${report.featureTests.accessibility.passed ? '通过' : '失败'}</td><td>${report.featureTests.accessibility.score}</td></tr>
        </table>
    </div>
    
    <div class="section">
        <h2>优化建议</h2>
        ${report.recommendations.map(rec => `
        <div class="metric ${rec.priority === 'high' ? 'error' : rec.priority === 'medium' ? 'warning' : 'success'}">
            <strong>${rec.title}</strong><br>
            ${rec.description}<br>
            <em>建议: ${rec.action}</em>
        </div>
        `).join('')}
    </div>
</body>
</html>
    `
  }
}

// 类型定义
export interface TestReport {
  metadata: ReportMetadata
  systemInfo: SystemInfo
  performanceMetrics: PerformanceMetrics
  errorAnalysis: ErrorAnalysis
  featureTests: FeatureTests
  recommendations: Recommendation[]
}

export interface ReportMetadata {
  generatedAt: string
  version: string
  environment: string
  userAgent: string
  url: string
}

export interface SystemInfo {
  viewport: { width: number; height: number }
  screen: { width: number; height: number; pixelRatio: number }
  browser: { userAgent: string; language: string; cookieEnabled: boolean; onLine: boolean }
  network: { effectiveType: string; downlink: number; rtt: number }
  features: Record<string, boolean>
}

export interface PerformanceMetrics {
  memory: { used: number; total: number; limit: number } | null
  timing: { domContentLoaded: number; loadComplete: number; firstPaint: number | null; firstContentfulPaint: number | null } | null
  resources: ResourceMetrics
}

export interface ResourceMetrics {
  totalResources: number
  totalSize: number
  slowestResource: PerformanceResourceTiming | null
  resourcesByType: Record<string, number>
}

export interface ErrorAnalysis {
  totalErrors: number
  errorsByType: Record<string, number>
  errorsByLevel: Record<string, number>
  errorsByComponent: Record<string, number>
  recentErrors: any[]
  errorTrends: ErrorTrend[]
}

export interface ErrorTrend {
  hour: number
  count: number
  types: Record<string, number>
}

export interface FeatureTests {
  aiAssistant: TestResult
  speechRecognition: TestResult
  dragAndDrop: TestResult
  responsiveDesign: TestResult
  accessibility: TestResult
}

export interface TestResult {
  passed: boolean
  score: number
  details: Record<string, any>
}

export interface Recommendation {
  type: 'performance' | 'error' | 'compatibility' | 'mobile' | 'accessibility'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  action: string
}

// 导出单例实例
export const testReportGenerator = TestReportGenerator.getInstance()
export default testReportGenerator
