/**
 * 消息格式化工具函数
 * 从 AIAssistant.vue 第3933-3990行提取
 *
 * 🎯 核心功能：
 * ├─ Markdown解析和渲染
 * ├─ 组件数据提取和解析
 * ├─ 时间格式化和相对时间
 * ├─ 文本处理和关键词高亮
 * └─ 消息类型检测和分类
 *
 * 📝 消息格式化：
 * ├─ formatMessage() - Markdown解析和HTML清理
 * ├─ getTextContent() - 提取纯文本内容
 * ├─ stripHtml() - 清理HTML标签
 * ├─ truncateText() - 文本截断
 * └─ highlightKeywords() - 关键词高亮
 *
 * 🧩 组件数据处理：
 * ├─ getComponentData() - 提取组件数据
 * ├─ parseComponentData() - 解析组件数据
 * ├─ detectMessageType() - 检测消息类型
 * └─ hasCodeBlock() - 检测代码块
 *
 * ⏰ 时间处理：
 * ├─ formatTime() - 格式化时间
 * ├─ formatRelativeTime() - 相对时间格式化
 * └─ calculateReadingTime() - 计算阅读时间
 *
 * 🔍 内容分析：
 * ├─ extractCodeBlocks() - 提取代码块
 * ├─ hasCodeBlock() - 检测代码块
 * ├─ detectMessageType() - 消息类型检测
 * └─ calculateReadingTime() - 阅读时间计算
 *
 * 💡 使用示例：
 * import { formatMessage, parseComponentData, formatRelativeTime } from './messageFormatting'
 *
 * const html = formatMessage(markdownText)
 * const { hasComponent, componentData } = parseComponentData(text)
 * const timeStr = formatRelativeTime(timestamp)
 */

import { marked } from 'marked'
import DOMPurify from 'dompurify'

// 格式化消息内容
export const formatMessage = (content: any): string => {
  try {
    // 如果内容为空或null，返回空字符串
    if (!content) return ''
    
    // 如果不是字符串，尝试转换为字符串
    if (typeof content !== 'string') {
      content = String(content)
    }

    // 使用 marked 解析 Markdown，并用 DOMPurify 清理
    const html = marked(content)
    return DOMPurify.sanitize(html)
  } catch (error) {
    console.error('格式化消息失败:', error)
    return typeof content === 'string' ? content : '消息格式错误'
  }
}

// 获取组件数据
export const getComponentData = (content: string): any[] | null => {
  try {
    const match = content.match(/\[COMPONENTS\]\s*([\s\S]*?)\s*\[\/COMPONENTS\]/)
    if (match && match[1]) {
      const componentData = JSON.parse(match[1].trim())
      return Array.isArray(componentData) ? componentData : [componentData]
    }
    const parsed = parseComponentData(content)
    if (parsed.hasComponent && parsed.componentData) {
      return Array.isArray(parsed.componentData) ? parsed.componentData : [parsed.componentData]
    }
  } catch (error) {
    console.error('解析组件数据失败:', error)
  }
  return null
}

// 解析组件数据
export const parseComponentData = (text: string) => {
  try {
    // 查找组件标记
    const componentMatch = text.match(/\[COMPONENT:([^\]]+)\]/g)
    if (!componentMatch) {
      return { hasComponent: false, componentData: null, textContent: text }
    }

    // 提取组件数据
    const componentStr = componentMatch[0].replace(/\[COMPONENT:|\]/g, '')
    const componentData = JSON.parse(componentStr)

    // 移除组件标记，获取纯文本内容
    const textContent = text.replace(/\[COMPONENT:[^\]]+\]/g, '').trim()

    return {
      hasComponent: true,
      componentData,
      textContent
    }
  } catch (error) {
    console.warn('解析组件数据失败:', error)
    return { hasComponent: false, componentData: null, textContent: text }
  }
}

// 获取文本内容（去除组件标记）
export const getTextContent = (content: string): string => {
  return content.replace(/\[COMPONENTS\][\s\S]*?\[\/COMPONENTS\]/g, '').trim()
}

// 格式化时间
export const formatTime = (timestamp: string): string => {
  try {
    const date = new Date(timestamp)
    const now = new Date()

    // 如果是今天，只显示时间
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // 否则显示日期和时间
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return ''
  }
}

// 格式化时间戳为相对时间
export const formatRelativeTime = (timestamp: string | Date): string => {
  try {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    // 小于1分钟显示"刚刚"
    if (diff < 60000) {
      return '刚刚'
    }
    
    // 小于1小时显示分钟
    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}分钟前`
    }
    
    // 小于24小时显示小时
    if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}小时前`
    }
    
    // 超过24小时显示具体时间
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('格式化相对时间失败:', error)
    return ''
  }
}

// 清理HTML标签
export const stripHtml = (html: string): string => {
  try {
    const div = document.createElement('div')
    div.innerHTML = html
    return div.textContent || div.innerText || ''
  } catch (error) {
    console.error('清理HTML失败:', error)
    return html
  }
}

// 截断文本
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (!text || text.length <= maxLength) {
    return text
  }
  return text.substring(0, maxLength) + '...'
}

// 高亮关键词
export const highlightKeywords = (text: string, keywords: string[]): string => {
  if (!keywords || keywords.length === 0) {
    return text
  }
  
  let result = text
  keywords.forEach(keyword => {
    if (keyword.trim()) {
      const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
      result = result.replace(regex, '<mark>$1</mark>')
    }
  })
  
  return result
}

// 检测是否包含代码块
export const hasCodeBlock = (content: string): boolean => {
  return /```[\s\S]*?```/.test(content) || /`[^`]+`/.test(content)
}

// 提取代码块
export const extractCodeBlocks = (content: string): Array<{ language: string; code: string }> => {
  const codeBlocks: Array<{ language: string; code: string }> = []
  const regex = /```(\w+)?\n([\s\S]*?)```/g
  let match
  
  while ((match = regex.exec(content)) !== null) {
    codeBlocks.push({
      language: match[1] || 'text',
      code: match[2].trim()
    })
  }
  
  return codeBlocks
}

// 检测消息类型
export const detectMessageType = (content: string): 'text' | 'code' | 'component' | 'mixed' => {
  const hasCode = hasCodeBlock(content)
  const hasComponent = parseComponentData(content).hasComponent
  
  if (hasComponent && hasCode) return 'mixed'
  if (hasComponent) return 'component'
  if (hasCode) return 'code'
  return 'text'
}

// 计算阅读时间（按中文200字/分钟，英文250词/分钟）
export const calculateReadingTime = (content: string): number => {
  const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length
  const englishWords = content.replace(/[\u4e00-\u9fa5]/g, '').split(/\s+/).filter(word => word.length > 0).length
  
  const chineseTime = chineseChars / 200 // 200字/分钟
  const englishTime = englishWords / 250 // 250词/分钟
  
  return Math.max(1, Math.ceil(chineseTime + englishTime))
}
