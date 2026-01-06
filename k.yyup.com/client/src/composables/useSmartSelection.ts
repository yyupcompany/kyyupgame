import { ref } from 'vue'

export interface SmartSelectionResult {
  selector: string
  description: string
  confidence: number
  reasoning: string
  element?: HTMLElement
}

export function useSmartSelection() {
  const isAnalyzing = ref(false)
  const analysisHistory = ref<string[]>([])

  // 分析描述并查找元素
  const analyzeDescription = async (description: string): Promise<string> => {
    try {
      isAnalyzing.value = true
      
      // 模拟AI分析过程
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // 保存到历史记录
      if (!analysisHistory.value.includes(description)) {
        analysisHistory.value.unshift(description)
        if (analysisHistory.value.length > 10) {
          analysisHistory.value = analysisHistory.value.slice(0, 10)
        }
      }
      
      // 简单的关键词匹配和选择器生成
      const keywords = description.toLowerCase()
      let analysis = ''
      
      if (keywords.includes('登录') || keywords.includes('login')) {
        analysis = '检测到登录相关操作，建议查找包含"登录"、"login"文本的按钮或链接'
      } else if (keywords.includes('用户名') || keywords.includes('username')) {
        analysis = '检测到用户名输入需求，建议查找name属性为"username"或id包含"user"的输入框'
      } else if (keywords.includes('密码') || keywords.includes('password')) {
        analysis = '检测到密码输入需求，建议查找type为"password"的输入框'
      } else if (keywords.includes('按钮') || keywords.includes('button')) {
        analysis = '检测到按钮操作需求，建议查找button标签或具有按钮样式的元素'
      } else if (keywords.includes('输入框') || keywords.includes('input')) {
        analysis = '检测到输入操作需求，建议查找input或textarea元素'
      } else if (keywords.includes('链接') || keywords.includes('link')) {
        analysis = '检测到链接操作需求，建议查找a标签元素'
      } else if (keywords.includes('第一个') || keywords.includes('first')) {
        analysis = '检测到位置描述，建议使用:first-child或:nth-child(1)选择器'
      } else if (keywords.includes('最后一个') || keywords.includes('last')) {
        analysis = '检测到位置描述，建议使用:last-child选择器'
      } else {
        analysis = '建议使用更具体的描述，如"登录按钮"、"用户名输入框"等'
      }
      
      return analysis
    } catch (error) {
      throw new Error('分析失败：' + (error as Error).message)
    } finally {
      isAnalyzing.value = false
    }
  }

  // 根据描述查找元素
  const findElementsByDescription = async (description: string): Promise<SmartSelectionResult[]> => {
    try {
      isAnalyzing.value = true
      
      // 模拟AI分析
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const results: SmartSelectionResult[] = []
      const keywords = description.toLowerCase()
      
      // 模拟智能查找逻辑
      if (keywords.includes('登录') || keywords.includes('login')) {
        results.push(
          {
            selector: 'button:contains("登录")',
            description: '包含"登录"文本的按钮',
            confidence: 0.92,
            reasoning: '基于文本内容匹配找到登录按钮'
          },
          {
            selector: '#login-btn',
            description: 'ID为login-btn的元素',
            confidence: 0.88,
            reasoning: 'ID命名符合登录按钮的常见模式'
          },
          {
            selector: '.btn-login',
            description: '具有btn-login类的按钮',
            confidence: 0.85,
            reasoning: 'CSS类名符合登录按钮的命名规范'
          }
        )
      } else if (keywords.includes('用户名') || keywords.includes('username')) {
        results.push(
          {
            selector: 'input[name="username"]',
            description: 'name属性为username的输入框',
            confidence: 0.95,
            reasoning: '标准的用户名输入框命名'
          },
          {
            selector: '#username',
            description: 'ID为username的输入框',
            confidence: 0.90,
            reasoning: 'ID命名符合用户名输入框的常见模式'
          },
          {
            selector: 'input[placeholder*="用户名"]',
            description: '占位符包含"用户名"的输入框',
            confidence: 0.85,
            reasoning: '基于占位符文本匹配'
          }
        )
      } else if (keywords.includes('密码') || keywords.includes('password')) {
        results.push(
          {
            selector: 'input[type="password"]',
            description: '密码类型的输入框',
            confidence: 0.98,
            reasoning: '标准的密码输入框类型'
          },
          {
            selector: 'input[name="password"]',
            description: 'name属性为password的输入框',
            confidence: 0.95,
            reasoning: '标准的密码输入框命名'
          }
        )
      } else if (keywords.includes('按钮')) {
        // 查找页面上的按钮
        const buttons = document.querySelectorAll('button, input[type="button"], input[type="submit"]')
        buttons.forEach((button, index) => {
          if (index < 3) { // 最多返回3个结果
            const text = button.textContent?.trim() || '按钮'
            results.push({
              selector: generateSelectorForElement(button as HTMLElement),
              description: `页面按钮: ${text}`,
              confidence: 0.80 - index * 0.05,
              reasoning: `页面第${index + 1}个按钮元素`,
              element: button as HTMLElement
            })
          }
        })
      } else if (keywords.includes('输入框')) {
        // 查找页面上的输入框
        const inputs = document.querySelectorAll('input[type="text"], input[type="email"], textarea')
        inputs.forEach((input, index) => {
          if (index < 3) {
            const placeholder = (input as HTMLInputElement).placeholder || '输入框'
            results.push({
              selector: generateSelectorForElement(input as HTMLElement),
              description: `输入框: ${placeholder}`,
              confidence: 0.80 - index * 0.05,
              reasoning: `页面第${index + 1}个输入框元素`,
              element: input as HTMLElement
            })
          }
        })
      } else if (keywords.includes('链接')) {
        // 查找页面上的链接
        const links = document.querySelectorAll('a[href]')
        links.forEach((link, index) => {
          if (index < 3) {
            const text = link.textContent?.trim() || '链接'
            results.push({
              selector: generateSelectorForElement(link as HTMLElement),
              description: `链接: ${text}`,
              confidence: 0.75 - index * 0.05,
              reasoning: `页面第${index + 1}个链接元素`,
              element: link as HTMLElement
            })
          }
        })
      }
      
      // 如果没找到结果，提供通用建议
      if (results.length === 0) {
        results.push({
          selector: '*',
          description: '未找到匹配元素',
          confidence: 0.1,
          reasoning: '请尝试更具体的描述，如"红色按钮"、"第一个输入框"等'
        })
      }
      
      return results.sort((a, b) => b.confidence - a.confidence)
      
    } catch (error) {
      throw new Error('智能查找失败：' + (error as Error).message)
    } finally {
      isAnalyzing.value = false
    }
  }

  // 为元素生成选择器
  const generateSelectorForElement = (element: HTMLElement): string => {
    // ID选择器优先
    if (element.id) {
      return `#${element.id}`
    }
    
    // Class选择器
    if (element.className) {
      const classes = element.className.split(' ').filter(cls => cls.trim())
      if (classes.length > 0) {
        return `.${classes[0]}`
      }
    }
    
    // 属性选择器
    if (element.getAttribute('name')) {
      return `[name="${element.getAttribute('name')}"]`
    }
    
    // 标签选择器 + nth-child
    const parent = element.parentElement
    if (parent) {
      const siblings = Array.from(parent.children).filter(child => 
        child.tagName === element.tagName
      )
      if (siblings.length > 1) {
        const index = siblings.indexOf(element) + 1
        return `${element.tagName.toLowerCase()}:nth-child(${index})`
      }
    }
    
    return element.tagName.toLowerCase()
  }

  // 获取分析历史
  const getAnalysisHistory = () => {
    return analysisHistory.value
  }

  // 清除历史记录
  const clearHistory = () => {
    analysisHistory.value = []
  }

  return {
    // 状态
    isAnalyzing,
    analysisHistory,

    // 方法
    analyzeDescription,
    findElementsByDescription,
    getAnalysisHistory,
    clearHistory
  }
}