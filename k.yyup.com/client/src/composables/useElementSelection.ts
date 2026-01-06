import { ref } from 'vue'
import { ElMessage } from 'element-plus'

export interface ElementInfo {
  tagName: string
  id: string
  className: string
  textContent: string
  attributes: Record<string, string>
  selector: string
  position: DOMRect
  confidence: number
}

export interface SelectorOption {
  type: 'id' | 'class' | 'attribute' | 'xpath' | 'text' | 'structural'
  value: string
  score: number
  description?: string
}

export function useElementSelection() {
  const isSelecting = ref(false)
  const selectedElements = ref<ElementInfo[]>([])
  const currentElement = ref<ElementInfo | null>(null)
  const selectionMode = ref<'click' | 'hover' | 'box' | 'smart'>('click')

  let selectionCallback: ((element: ElementInfo) => void) | null = null
  let originalCursor: string = ''
  let highlightOverlay: HTMLElement | null = null

  // 开始元素选择
  const startElementSelection = (config: {
    mode?: 'click' | 'hover' | 'box' | 'smart'
    callback?: (element: ElementInfo) => void
  } = {}) => {
    if (isSelecting.value) {
      stopElementSelection()
    }

    isSelecting.value = true
    selectionMode.value = config.mode || 'click'
    selectionCallback = config.callback || null

    // 保存原始光标样式
    originalCursor = document.body.style.cursor
    document.body.style.cursor = 'crosshair'

    // 创建高亮覆盖层
    createHighlightOverlay()

    // 添加事件监听器
    document.addEventListener('mousemove', handleMouseMove, true)
    document.addEventListener('click', handleElementClick, true)
    document.addEventListener('keydown', handleKeyDown, true)

    if (selectionMode.value === 'hover') {
      document.addEventListener('mouseenter', handleMouseEnter, true)
    }

    ElMessage.info('元素选择模式已启动，按 ESC 键退出')
  }

  // 停止元素选择
  const stopElementSelection = () => {
    if (!isSelecting.value) return

    isSelecting.value = false
    selectionCallback = null

    // 恢复光标样式
    document.body.style.cursor = originalCursor

    // 移除高亮覆盖层
    removeHighlightOverlay()

    // 移除事件监听器
    document.removeEventListener('mousemove', handleMouseMove, true)
    document.removeEventListener('click', handleElementClick, true)
    document.removeEventListener('keydown', handleKeyDown, true)
    document.removeEventListener('mouseenter', handleMouseEnter, true)
  }

  // 创建高亮覆盖层
  const createHighlightOverlay = () => {
    highlightOverlay = document.createElement('div')
    highlightOverlay.id = 'element-selection-overlay'
    highlightOverlay.style.cssText = `
      position: fixed;
      pointer-events: none;
      border: 2px solid #409eff;
      background: rgba(64, 158, 255, 0.1);
      z-index: 999999;
      display: none;
    `
    document.body.appendChild(highlightOverlay)
  }

  // 移除高亮覆盖层
  const removeHighlightOverlay = () => {
    if (highlightOverlay) {
      document.body.removeChild(highlightOverlay)
      highlightOverlay = null
    }
  }

  // 鼠标移动处理
  const handleMouseMove = (event: MouseEvent) => {
    if (!isSelecting.value || !highlightOverlay) return

    const target = event.target as HTMLElement
    if (!target || target === highlightOverlay) return

    const rect = target.getBoundingClientRect()
    highlightOverlay.style.display = 'block'
    highlightOverlay.style.left = rect.left + 'px'
    highlightOverlay.style.top = rect.top + 'px'
    highlightOverlay.style.width = rect.width + 'px'
    highlightOverlay.style.height = rect.height + 'px'
  }

  // 元素点击处理
  const handleElementClick = (event: MouseEvent) => {
    if (!isSelecting.value) return

    event.preventDefault()
    event.stopPropagation()

    const target = event.target as HTMLElement
    if (!target) return

    const elementInfo = analyzeElement(target)
    selectElement(elementInfo)
  }

  // 鼠标悬停处理
  const handleMouseEnter = (event: MouseEvent) => {
    if (!isSelecting.value || selectionMode.value !== 'hover') return

    const target = event.target as HTMLElement
    if (!target) return

    const elementInfo = analyzeElement(target)
    selectElement(elementInfo)
  }

  // 键盘事件处理
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      stopElementSelection()
      ElMessage.info('已退出元素选择模式')
    }
  }

  // 分析元素
  const analyzeElement = (element: HTMLElement): ElementInfo => {
    const rect = element.getBoundingClientRect()
    const attributes: Record<string, string> = {}

    // 收集属性
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i]
      attributes[attr.name] = attr.value
    }

    // 生成最佳选择器
    const selector = generateBestSelector(element)

    return {
      tagName: element.tagName,
      id: element.id,
      className: element.className,
      textContent: element.textContent?.trim() || '',
      attributes,
      selector,
      position: rect,
      confidence: calculateConfidence(element)
    }
  }

  // 选择元素
  const selectElement = (elementInfo: ElementInfo) => {
    currentElement.value = elementInfo
    selectedElements.value.push(elementInfo)

    if (selectionCallback) {
      selectionCallback(elementInfo)
    }

    // 触发自定义事件
    document.dispatchEvent(new CustomEvent('element-selected', {
      detail: elementInfo
    }))

    // 在点击模式下，选择后自动停止
    if (selectionMode.value === 'click') {
      stopElementSelection()
    }
  }

  // 生成最佳选择器
  const generateBestSelector = (element: HTMLElement): string => {
    // ID选择器优先级最高
    if (element.id) {
      return `#${element.id}`
    }

    // 尝试使用唯一的class组合
    if (element.className) {
      const classes = element.className.split(' ').filter(cls => cls.trim())
      if (classes.length > 0) {
        const classSelector = `.${classes.join('.')}`
        if (document.querySelectorAll(classSelector).length === 1) {
          return classSelector
        }
      }
    }

    // 尝试使用属性选择器
    const uniqueAttributes = ['name', 'data-testid', 'data-id', 'aria-label']
    for (const attr of uniqueAttributes) {
      const value = element.getAttribute(attr)
      if (value) {
        const attrSelector = `[${attr}="${value}"]`
        if (document.querySelectorAll(attrSelector).length === 1) {
          return attrSelector
        }
      }
    }

    // 生成结构化选择器
    return generateStructuralSelector(element)
  }

  // 生成结构化选择器
  const generateStructuralSelector = (element: HTMLElement): string => {
    const parts = []
    let current: HTMLElement | null = element

    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase()
      
      // 添加ID
      if (current.id) {
        selector += `#${current.id}`
        parts.unshift(selector)
        break
      }

      // 添加类名
      if (current.className) {
        const classes = current.className.split(' ').filter(cls => cls.trim())
        if (classes.length > 0) {
          selector += `.${classes[0]}`
        }
      }

      // 添加nth-child
      const parent = current.parentElement
      if (parent) {
        const siblings = Array.from(parent.children).filter(
          child => child.tagName === current!.tagName
        )
        if (siblings.length > 1) {
          const index = siblings.indexOf(current) + 1
          selector += `:nth-child(${index})`
        }
      }

      parts.unshift(selector)
      current = current.parentElement
    }

    return parts.join(' > ')
  }

  // 计算选择器置信度
  const calculateConfidence = (element: HTMLElement): number => {
    let score = 0

    // ID存在 +40分
    if (element.id) score += 40

    // 有意义的class +20分
    if (element.className) {
      const classes = element.className.split(' ').filter(cls => cls.trim())
      if (classes.some(cls => !cls.includes('hover') && !cls.includes('focus'))) {
        score += 20
      }
    }

    // 有文本内容 +15分
    if (element.textContent?.trim()) score += 15

    // 有name属性 +10分
    if (element.getAttribute('name')) score += 10

    // 有data-*属性 +10分
    if (Array.from(element.attributes).some(attr => attr.name.startsWith('data-'))) {
      score += 10
    }

    // 可交互元素 +5分
    const interactiveElements = ['button', 'input', 'select', 'textarea', 'a']
    if (interactiveElements.includes(element.tagName.toLowerCase())) {
      score += 5
    }

    return Math.min(score, 100)
  }

  // 生成多种选择器选项
  const generateSelector = async (element: HTMLElement): Promise<SelectorOption[]> => {
    const selectors: SelectorOption[] = []

    // ID选择器
    if (element.id) {
      selectors.push({
        type: 'id',
        value: `#${element.id}`,
        score: 95,
        description: '基于ID的唯一选择器'
      })
    }

    // Class选择器
    if (element.className) {
      const classes = element.className.split(' ').filter(cls => cls.trim())
      if (classes.length > 0) {
        selectors.push({
          type: 'class',
          value: `.${classes.join('.')}`,
          score: 80,
          description: '基于CSS类的选择器'
        })

        // 单一class选择器
        classes.forEach(cls => {
          selectors.push({
            type: 'class',
            value: `.${cls}`,
            score: 70,
            description: `基于单个类 ${cls} 的选择器`
          })
        })
      }
    }

    // 属性选择器
    const importantAttributes = ['name', 'type', 'data-testid', 'data-id', 'aria-label']
    importantAttributes.forEach(attr => {
      const value = element.getAttribute(attr)
      if (value) {
        selectors.push({
          type: 'attribute',
          value: `[${attr}="${value}"]`,
          score: 85,
          description: `基于${attr}属性的选择器`
        })
      }
    })

    // 文本选择器
    if (element.textContent?.trim()) {
      const text = element.textContent.trim()
      if (text.length < 50) {
        selectors.push({
          type: 'text',
          value: `//*[text()="${text}"]`,
          score: 60,
          description: '基于文本内容的XPath选择器'
        })
      }
    }

    // 结构化选择器
    const structuralSelector = generateStructuralSelector(element)
    selectors.push({
      type: 'structural',
      value: structuralSelector,
      score: 50,
      description: '基于DOM结构的选择器'
    })

    // 按分数排序
    return selectors.sort((a, b) => b.score - a.score)
  }

  // 优化选择器
  const optimizeSelector = async (element: HTMLElement): Promise<string> => {
    const selectors = await generateSelector(element)
    
    // 测试每个选择器的唯一性
    for (const selector of selectors) {
      try {
        let elements: NodeListOf<Element>
        
        if (selector.type === 'text') {
          // XPath选择器
          const result = document.evaluate(
            selector.value,
            document,
            null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
            null
          )
          if (result.snapshotLength === 1) {
            return selector.value
          }
        } else {
          // CSS选择器
          elements = document.querySelectorAll(selector.value)
          if (elements.length === 1) {
            return selector.value
          }
        }
      } catch (error) {
        console.warn('选择器测试失败:', selector.value, error)
      }
    }

    // 如果没有唯一选择器，返回分数最高的
    return selectors[0]?.value || element.tagName.toLowerCase()
  }

  // 测试选择器
  const testSelector = async (selector: string): Promise<{
    success: boolean
    count: number
    elements: Element[]
    message: string
  }> => {
    try {
      let elements: Element[] = []

      if (selector.startsWith('//') || selector.includes('text()')) {
        // XPath选择器
        const result = document.evaluate(
          selector,
          document,
          null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
          null
        )
        
        for (let i = 0; i < result.snapshotLength; i++) {
          elements.push(result.snapshotItem(i) as Element)
        }
      } else {
        // CSS选择器
        elements = Array.from(document.querySelectorAll(selector))
      }

      return {
        success: true,
        count: elements.length,
        elements: elements.slice(0, 10), // 最多返回10个元素
        message: `找到 ${elements.length} 个匹配元素`
      }
    } catch (error: any) {
      return {
        success: false,
        count: 0,
        elements: [],
        message: `选择器错误: ${error.message}`
      }
    }
  }

  // 清空选择
  const clearSelection = () => {
    selectedElements.value = []
    currentElement.value = null
  }

  return {
    // 状态
    isSelecting,
    selectedElements,
    currentElement,
    selectionMode,

    // 方法
    startElementSelection,
    stopElementSelection,
    generateSelector,
    optimizeSelector,
    testSelector,
    clearSelection
  }
}