/**
 * 智能路由服务
 * 直接在前端处理页面跳转请求，无需调用AI服务
 */

import { Router } from 'vue-router'
import { ElMessage } from 'element-plus'

export interface RouteMatch {
  id: string
  title: string
  route: string
  confidence: number // 匹配度 0-1
  keywords: string[]
}

export class SmartRouterService {
  private router: Router
  
  // 完整的路由映射表
  private routeMap: RouteMatch[] = [
    // 工作台和仪表板
    {
      id: 'dashboard',
      title: '工作台',
      route: '/dashboard',
      confidence: 0,
      keywords: ['工作台', '仪表板', 'dashboard', '首页', '主页', '主界面']
    },
    
    // 业务中心
    {
      id: 'activity-center',
      title: '活动中心',
      route: '/centers/activity',
      confidence: 0,
      keywords: ['活动中心', '活动管理', '活动', 'activity', '活动页面', '活动页']
    },
    {
      id: 'marketing-center',
      title: '营销中心',
      route: '/centers/marketing',
      confidence: 0,
      keywords: ['营销中心', '营销管理', '营销', 'marketing', '营销页面', '营销页']
    },
    {
      id: 'ai-center',
      title: 'AI中心',
      route: '/centers/ai',
      confidence: 0,
      keywords: ['AI中心', 'ai中心', '人工智能', 'ai', '智能中心', 'AI页面', 'ai页面']
    },
    {
      id: 'media-center',
      title: '新媒体中心',
      route: '/principal/media-center',
      confidence: 0,
      keywords: ['新媒体中心', '媒体中心', '新媒体', '媒体', 'media', '新媒体页面', '媒体页面']
    },
    {
      id: 'system-center',
      title: '系统中心',
      route: '/centers/system',
      confidence: 0,
      keywords: ['系统中心', '系统管理', '系统', 'system', '系统页面', '系统页', '设置']
    },
    {
      id: 'enrollment-center',
      title: '招生中心',
      route: '/centers/enrollment',
      confidence: 0,
      keywords: ['招生中心', '招生管理', '招生', 'enrollment', '招生页面', '招生页']
    },
    {
      id: 'personnel-center',
      title: '人员中心',
      route: '/centers/personnel',
      confidence: 0,
      keywords: ['人员中心', '人事中心', '人员管理', '人事管理', '人员', '人事', 'personnel', '人员页面']
    },
    {
      id: 'script-center',
      title: '话术中心',
      route: '/centers/script',
      confidence: 0,
      keywords: ['话术中心', '话术管理', '话术', 'script', '话术页面', '话术页']
    },
    {
      id: 'finance-center',
      title: '财务中心',
      route: '/centers/finance',
      confidence: 0,
      keywords: ['财务中心', '财务管理', '财务', 'finance', '财务页面', '财务页', '资金']
    },
    {
      id: 'customer-pool-center',
      title: '客户池中心',
      route: '/centers/customer-pool',
      confidence: 0,
      keywords: ['客户池中心', '客户池', '客户管理', '客户', 'customer', '客户页面', '客户页']
    },
    {
      id: 'task-center',
      title: '任务中心',
      route: '/centers/task',
      confidence: 0,
      keywords: ['任务中心', '任务管理', '任务', 'task', '任务页面', '任务页', '待办']
    },
    {
      id: 'analytics-center',
      title: '分析中心',
      route: '/centers/analytics',
      confidence: 0,
      keywords: ['分析中心', '数据分析', '分析', 'analytics', '统计', '分析页面', '数据页面']
    },
    
    // 管理页面
    {
      id: 'class',
      title: '班级管理',
      route: '/class',
      confidence: 0,
      keywords: ['班级管理', '班级', 'class', '班级页面', '班级页']
    },
    {
      id: 'student',
      title: '学生管理',
      route: '/student',
      confidence: 0,
      keywords: ['学生管理', '学生', 'student', '学生页面', '学生页', '学员']
    },
    {
      id: 'teacher',
      title: '教师管理',
      route: '/teacher',
      confidence: 0,
      keywords: ['教师管理', '教师', 'teacher', '教师页面', '教师页', '老师', '老师管理']
    },
    {
      id: 'parent',
      title: '家长管理',
      route: '/parent',
      confidence: 0,
      keywords: ['家长管理', '家长', 'parent', '家长页面', '家长页']
    },
    {
      id: 'enrollment-plan',
      title: '招生计划',
      route: '/enrollment-plan',
      confidence: 0,
      keywords: ['招生计划', '计划', 'plan', '招生计划页面', '计划页面']
    },
    {
      id: 'application',
      title: '申请管理',
      route: '/application',
      confidence: 0,
      keywords: ['申请管理', '申请', 'application', '申请页面', '申请页']
    },
    {
      id: 'statistics',
      title: '统计页面',
      route: '/statistics',
      confidence: 0,
      keywords: ['统计页面', '统计', 'statistics', '数据统计', '报表']
    }
  ]

  constructor(router: Router) {
    this.router = router
  }

  /**
   * 智能匹配用户输入的跳转请求
   * @param userInput 用户输入的自然语言
   * @returns 匹配结果，如果成功则返回路由信息，否则返回null
   */
  public smartMatch(userInput: string): RouteMatch | null {
    // 清理和标准化输入
    const cleanInput = this.cleanUserInput(userInput)
    
    // 如果输入为空，返回null
    if (!cleanInput) {
      return null
    }

    // 为每个路由计算匹配度
    const matches = this.routeMap.map(route => {
      const confidence = this.calculateConfidence(cleanInput, route.keywords)
      return {
        ...route,
        confidence
      }
    })

    // 按匹配度排序，取最高的
    matches.sort((a, b) => b.confidence - a.confidence)
    
    const bestMatch = matches[0]
    
    // 设置最低匹配阈值
    const CONFIDENCE_THRESHOLD = 0.3
    
    if (bestMatch && bestMatch.confidence >= CONFIDENCE_THRESHOLD) {
      return bestMatch
    }

    return null
  }

  /**
   * 执行智能跳转
   * @param userInput 用户输入
   * @returns 是否成功跳转
   */
  public async smartNavigate(userInput: string): Promise<boolean> {
    const match = this.smartMatch(userInput)
    
    if (match) {
      try {
        await this.router.push(match.route)
        ElMessage.success(`已跳转到：${match.title}`)
        return true
      } catch (error) {
        console.error('路由跳转失败:', error)
        ElMessage.error('页面跳转失败')
        return false
      }
    } else {
      // 提供建议
      const suggestions = this.getSuggestions(userInput)
      if (suggestions.length > 0) {
        ElMessage.warning(`未找到匹配的页面。您是否想要跳转到：${suggestions.slice(0, 3).map(s => s.title).join('、')}？`)
      } else {
        ElMessage.warning('未找到匹配的页面，请检查输入')
      }
      return false
    }
  }

  /**
   * 获取跳转建议
   */
  public getSuggestions(userInput: string, limit = 5): RouteMatch[] {
    const cleanInput = this.cleanUserInput(userInput)
    
    if (!cleanInput) {
      return []
    }

    const matches = this.routeMap.map(route => {
      const confidence = this.calculateConfidence(cleanInput, route.keywords)
      return {
        ...route,
        confidence
      }
    })

    return matches
      .filter(match => match.confidence > 0.1) // 更宽松的阈值用于建议
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit)
  }

  /**
   * 检查输入是否为跳转请求
   */
  public static isNavigationRequest(userInput: string): boolean {
    const cleanInput = userInput.toLowerCase().trim()
    
    const navigationKeywords = [
      '跳转', '打开', '进入', '去', '到', '访问', '切换', '导航',
      '跳转到', '打开页面', '进入页面', '去页面', '到页面',
      'go to', 'open', 'navigate', 'switch to', 'visit'
    ]

    return navigationKeywords.some(keyword => cleanInput.includes(keyword))
  }

  /**
   * 清理用户输入
   */
  private cleanUserInput(input: string): string {
    return input
      .toLowerCase()
      .trim()
      .replace(/[请帮我]/g, '')
      .replace(/[跳转到|打开|进入|去|到|访问|切换到|导航到]/g, '')
      .replace(/[页面|页|中心|管理]/g, '')
      .trim()
  }

  /**
   * 计算匹配度
   */
  private calculateConfidence(input: string, keywords: string[]): number {
    let maxConfidence = 0

    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase()
      const inputLower = input.toLowerCase()
      
      // 完全匹配
      if (inputLower === keywordLower) {
        maxConfidence = Math.max(maxConfidence, 1.0)
        continue
      }
      
      // 包含匹配
      if (inputLower.includes(keywordLower)) {
        maxConfidence = Math.max(maxConfidence, 0.8)
        continue
      }
      
      if (keywordLower.includes(inputLower)) {
        maxConfidence = Math.max(maxConfidence, 0.7)
        continue
      }
      
      // 编辑距离匹配（模糊匹配）
      const similarity = this.calculateSimilarity(inputLower, keywordLower)
      if (similarity > 0.6) {
        maxConfidence = Math.max(maxConfidence, similarity * 0.6)
      }
    }

    return maxConfidence
  }

  /**
   * 计算字符串相似度
   */
  private calculateSimilarity(str1: string, str2: string): number {
    if (str1.length === 0 || str2.length === 0) {
      return 0
    }

    const maxLength = Math.max(str1.length, str2.length)
    const distance = this.levenshteinDistance(str1, str2)
    
    return (maxLength - distance) / maxLength
  }

  /**
   * 计算编辑距离
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = []
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }
    
    return matrix[str2.length][str1.length]
  }

  /**
   * 获取所有可用路由
   */
  public getAllRoutes(): RouteMatch[] {
    return this.routeMap.map(route => ({
      ...route,
      confidence: 0
    }))
  }

  /**
   * 添加自定义路由
   */
  public addCustomRoute(route: Omit<RouteMatch, 'confidence'>): void {
    this.routeMap.push({
      ...route,
      confidence: 0
    })
  }
}