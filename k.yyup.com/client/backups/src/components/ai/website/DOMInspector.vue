<template>
  <div class="dom-inspector">
    <div class="inspector-header">
      <h4>DOM检查器</h4>
      <div class="inspector-actions">
        <el-button size="small" @click="refreshElement">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button size="small" @click="exportElementData">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
        <el-button size="small" @click="closeInspector">
          <el-icon><Close /></el-icon>
          关闭
        </el-button>
      </div>
    </div>

    <div class="inspector-content" v-if="element">
      <!-- 基本信息 -->
      <div class="basic-info">
        <h5>基本信息</h5>
        <div class="info-grid">
          <div class="info-item">
            <label>标签名:</label>
            <span class="tag-name">{{ element.tagName }}</span>
          </div>
          <div class="info-item">
            <label>类型:</label>
            <span>{{ element.type || '无' }}</span>
          </div>
          <div class="info-item">
            <label>ID:</label>
            <span class="element-id">{{ element.id || '无' }}</span>
          </div>
          <div class="info-item">
            <label>Class:</label>
            <span class="element-classes">{{ element.className || '无' }}</span>
          </div>
        </div>
      </div>

      <!-- 文本内容 -->
      <div class="text-content" v-if="element.textContent">
        <h5>文本内容</h5>
        <div class="text-display">
          <el-input
            v-model="elementText"
            type="textarea"
            :rows="3"
            readonly
            resize="none"
          />
        </div>
      </div>

      <!-- 属性列表 -->
      <div class="attributes-section">
        <h5>属性列表</h5>
        <div class="attributes-list">
          <div 
            v-for="(value, key) in elementAttributes"
            :key="key"
            class="attribute-item"
          >
            <div class="attribute-key">{{ key }}</div>
            <div class="attribute-value">
              <el-input
                v-model="elementAttributes[key]"
                size="small"
                @change="handleAttributeChange(key, $event)"
              >
                <template #append>
                  <el-button 
                    size="small" 
                    @click="copyAttributeValue(value)"
                    icon="DocumentCopy"
                  />
                </template>
              </el-input>
            </div>
          </div>
          
          <!-- 添加新属性 -->
          <div class="add-attribute">
            <el-input
              v-model="newAttributeKey"
              placeholder="属性名"
              size="small"
              style="width: 120px; margin-right: var(--spacing-sm);"
            />
            <el-input
              v-model="newAttributeValue"
              placeholder="属性值"
              size="small"
              style="width: 120px; margin-right: var(--spacing-sm);"
            />
            <el-button size="small" @click="addAttribute" type="primary">
              <el-icon><Plus /></el-icon>
              添加
            </el-button>
          </div>
        </div>
      </div>

      <!-- 样式信息 -->
      <div class="styles-section">
        <h5>计算样式</h5>
        <div class="styles-filter">
          <el-input
            v-model="styleFilter"
            placeholder="过滤样式属性..."
            size="small"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="styles-list">
          <div 
            v-for="(value, property) in filteredComputedStyles"
            :key="property"
            class="style-item"
          >
            <div class="style-property">{{ property }}</div>
            <div class="style-value">{{ value }}</div>
          </div>
        </div>
      </div>

      <!-- 位置信息 -->
      <div class="position-info">
        <h5>位置信息</h5>
        <div class="position-grid">
          <div class="position-item">
            <label>X坐标:</label>
            <span>{{ elementPosition.x }}px</span>
          </div>
          <div class="position-item">
            <label>Y坐标:</label>
            <span>{{ elementPosition.y }}px</span>
          </div>
          <div class="position-item">
            <label>宽度:</label>
            <span>{{ elementPosition.width }}px</span>
          </div>
          <div class="position-item">
            <label>高度:</label>
            <span>{{ elementPosition.height }}px</span>
          </div>
        </div>
      </div>

      <!-- 层次结构 -->
      <div class="hierarchy-section">
        <h5>DOM层次</h5>
        <div class="hierarchy-tree">
          <div class="hierarchy-path">
            <span 
              v-for="(ancestor, index) in domPath"
              :key="index"
              class="path-item"
              @click="inspectAncestor(ancestor)"
            >
              {{ ancestor.tagName.toLowerCase() }}
              <span v-if="ancestor.id" class="path-id">#{{ ancestor.id }}</span>
              <span v-if="ancestor.className" class="path-class">.{{ ancestor.className.split(' ')[0] }}</span>
              <el-icon v-if="index < domPath.length - 1" class="path-separator"><ArrowRight /></el-icon>
            </span>
          </div>
        </div>
      </div>

      <!-- 选择器生成器 -->
      <div class="selector-generator">
        <h5>选择器生成器</h5>
        <div class="generator-options">
          <el-checkbox-group v-model="selectorTypes">
            <el-checkbox label="id">ID选择器</el-checkbox>
            <el-checkbox label="class">Class选择器</el-checkbox>
            <el-checkbox label="attribute">属性选择器</el-checkbox>
            <el-checkbox label="structural">结构选择器</el-checkbox>
            <el-checkbox label="text">文本选择器</el-checkbox>
          </el-checkbox-group>
        </div>
        <div class="generated-selectors">
          <div 
            v-for="selector in generatedSelectors"
            :key="selector.type"
            class="selector-item"
          >
            <div class="selector-label">{{ getSelectorLabel(selector.type) }}:</div>
            <div class="selector-value">
              <el-input
                :value="selector.value"
                readonly
                size="small"
              >
                <template #append>
                  <el-button 
                    size="small" 
                    @click="copySelector(selector.value)"
                    icon="DocumentCopy"
                  />
                  <el-button 
                    size="small" 
                    @click="testSelector(selector.value)"
                    icon="VideoPlay"
                  />
                </template>
              </el-input>
            </div>
          </div>
        </div>
        <div class="generator-actions">
          <el-button @click="generateSelectors" type="primary">
            <el-icon><MagicStick /></el-icon>
            生成选择器
          </el-button>
          <el-button @click="optimizeSelectors">
            <el-icon><Tools /></el-icon>
            优化选择器
          </el-button>
        </div>
      </div>

      <!-- 事件监听器 -->
      <div class="events-section">
        <h5>事件监听器</h5>
        <div class="events-list">
          <div 
            v-for="event in elementEvents"
            :key="event.type"
            class="event-item"
          >
            <div class="event-type">{{ event.type }}</div>
            <div class="event-count">{{ event.listeners.length }} 个监听器</div>
            <el-button size="small" @click="toggleEventDetails(event.type)">
              {{ expandedEvents.includes(event.type) ? '收起' : '展开' }}
            </el-button>
          </div>
          <div 
            v-for="event in elementEvents"
            :key="`${event.type}-details`"
            v-show="expandedEvents.includes(event.type)"
            class="event-details"
          >
            <div 
              v-for="(listener, index) in event.listeners"
              :key="index"
              class="listener-item"
            >
              <pre>{{ listener }}</pre>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作面板 -->
      <div class="actions-panel">
        <h5>操作面板</h5>
        <div class="action-buttons">
          <el-button @click="highlightElement" type="primary">
            <el-icon><Aim /></el-icon>
            高亮元素
          </el-button>
          <el-button @click="scrollToElement">
            <el-icon><Position /></el-icon>
            滚动到元素
          </el-button>
          <el-button @click="simulateClick">
            <el-icon><Mouse /></el-icon>
            模拟点击
          </el-button>
          <el-button @click="simulateHover">
            <el-icon><View /></el-icon>
            模拟悬停
          </el-button>
          <el-button @click="captureScreenshot">
            <el-icon><Camera /></el-icon>
            截图元素
          </el-button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-else>
      <el-empty description="未选择元素" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, defineProps, defineEmits } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Refresh,
  Download,
  Close,
  Search,
  Plus,
  ArrowRight,
  MagicStick,
  Tools,
  DocumentCopy,
  VideoPlay,
  Aim,
  Position,
  Mouse,
  View,
  Camera
} from '@element-plus/icons-vue'

// Props
const props = defineProps<{
  element: any
}>()

// Emits
const emit = defineEmits(['selector-generated', 'element-modified', 'close'])

// 响应式数据
const elementText = ref('')
const elementAttributes = reactive({})
const newAttributeKey = ref('')
const newAttributeValue = ref('')
const styleFilter = ref('')
const selectorTypes = ref(['id', 'class', 'attribute'])
const generatedSelectors = ref([])
const expandedEvents = ref([])

// 计算属性
const elementPosition = computed(() => {
  if (!props.element?.getBoundingClientRect) {
    return { x: 0, y: 0, width: 0, height: 0 }
  }
  
  const rect = props.element.getBoundingClientRect()
  return {
    x: Math.round(rect.left),
    y: Math.round(rect.top),
    width: Math.round(rect.width),
    height: Math.round(rect.height)
  }
})

const domPath = computed(() => {
  if (!props.element) return []
  
  const path = []
  let current = props.element
  
  while (current && current !== document.body) {
    path.unshift(current)
    current = current.parentElement
  }
  
  return path
})

const filteredComputedStyles = computed(() => {
  if (!props.element) return {}
  
  const computedStyles = window.getComputedStyle(props.element)
  const styles = {}
  
  for (let i = 0; i < computedStyles.length; i++) {
    const property = computedStyles[i]
    if (!styleFilter.value || property.includes(styleFilter.value)) {
      styles[property] = computedStyles.getPropertyValue(property)
    }
  }
  
  return styles
})

const elementEvents = computed(() => {
  // 获取元素的事件监听器（这里模拟数据）
  return [
    { type: 'click', listeners: ['function() { ... }'] },
    { type: 'mouseenter', listeners: ['function() { ... }'] },
    { type: 'mouseleave', listeners: ['function() { ... }'] }
  ]
})

// 监听器
watch(() => props.element, (newElement) => {
  if (newElement) {
    updateElementData()
  }
}, { immediate: true })

// 方法定义
const updateElementData = () => {
  if (!props.element) return
  
  // 更新文本内容
  elementText.value = props.element.textContent || ''
  
  // 更新属性
  Object.keys(elementAttributes).forEach(key => {
    delete elementAttributes[key]
  })
  
  if (props.element.attributes) {
    for (let i = 0; i < props.element.attributes.length; i++) {
      const attr = props.element.attributes[i]
      elementAttributes[attr.name] = attr.value
    }
  }
}

const refreshElement = () => {
  updateElementData()
  ElMessage.success('元素数据已刷新')
}

const exportElementData = () => {
  const data = {
    tagName: props.element.tagName,
    id: props.element.id,
    className: props.element.className,
    attributes: elementAttributes,
    textContent: elementText.value,
    position: elementPosition.value,
    computedStyles: filteredComputedStyles.value
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `element-data-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  
  ElMessage.success('元素数据已导出')
}

const closeInspector = () => {
  emit('close')
}

// 属性操作
const handleAttributeChange = (key: string, value: string) => {
  try {
    props.element.setAttribute(key, value)
    emit('element-modified', props.element)
    ElMessage.success(`属性 ${key} 已更新`)
  } catch (error) {
    ElMessage.error(`更新属性失败: ${error.message}`)
  }
}

const addAttribute = () => {
  if (!newAttributeKey.value || !newAttributeValue.value) {
    ElMessage.warning('请输入属性名和属性值')
    return
  }
  
  try {
    props.element.setAttribute(newAttributeKey.value, newAttributeValue.value)
    elementAttributes[newAttributeKey.value] = newAttributeValue.value
    
    newAttributeKey.value = ''
    newAttributeValue.value = ''
    
    emit('element-modified', props.element)
    ElMessage.success('属性已添加')
  } catch (error) {
    ElMessage.error(`添加属性失败: ${error.message}`)
  }
}

const copyAttributeValue = async (value: string) => {
  try {
    await navigator.clipboard.writeText(value)
    ElMessage.success('属性值已复制')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 层次结构操作
const inspectAncestor = (ancestor: Element) => {
  emit('element-modified', ancestor)
}

// 选择器生成
const generateSelectors = () => {
  const selectors = []
  
  if (selectorTypes.value.includes('id') && props.element.id) {
    selectors.push({
      type: 'id',
      value: `#${props.element.id}`
    })
  }
  
  if (selectorTypes.value.includes('class') && props.element.className) {
    const classes = props.element.className.split(' ').filter(cls => cls.trim())
    if (classes.length > 0) {
      selectors.push({
        type: 'class',
        value: `.${classes.join('.')}`
      })
    }
  }
  
  if (selectorTypes.value.includes('attribute')) {
    Object.keys(elementAttributes).forEach(attr => {
      if (['name', 'type', 'data-testid'].includes(attr)) {
        selectors.push({
          type: 'attribute',
          value: `[${attr}="${elementAttributes[attr]}"]`
        })
      }
    })
  }
  
  if (selectorTypes.value.includes('structural')) {
    const structuralSelector = generateStructuralSelector()
    if (structuralSelector) {
      selectors.push({
        type: 'structural',
        value: structuralSelector
      })
    }
  }
  
  if (selectorTypes.value.includes('text') && elementText.value.trim()) {
    selectors.push({
      type: 'text',
      value: `text="${elementText.value.trim()}"`
    })
  }
  
  generatedSelectors.value = selectors
  ElMessage.success(`生成了 ${selectors.length} 个选择器`)
}

const generateStructuralSelector = () => {
  let selector = props.element.tagName.toLowerCase()
  let parent = props.element.parentElement
  
  while (parent && parent !== document.body) {
    if (parent.id) {
      selector = `#${parent.id} ${selector}`
      break
    } else if (parent.className) {
      const classes = parent.className.split(' ').filter(cls => cls.trim())[0]
      if (classes) {
        selector = `.${classes} ${selector}`
      }
    }
    parent = parent.parentElement
  }
  
  return selector
}

const optimizeSelectors = () => {
  // 优化选择器逻辑
  const optimized = generatedSelectors.value.map(selector => {
    // 简化选择器
    let value = selector.value
    
    // 移除不必要的类名
    if (selector.type === 'class') {
      const classes = value.substring(1).split('.')
      const filteredClasses = classes.filter(cls => 
        !cls.includes('hover') && 
        !cls.includes('focus') && 
        !cls.includes('active')
      )
      value = `.${filteredClasses.join('.')}`
    }
    
    return { ...selector, value }
  })
  
  generatedSelectors.value = optimized
  ElMessage.success('选择器已优化')
}

const copySelector = async (selector: string) => {
  try {
    await navigator.clipboard.writeText(selector)
    emit('selector-generated', selector)
    ElMessage.success('选择器已复制')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const testSelector = (selector: string) => {
  try {
    const elements = document.querySelectorAll(selector)
    ElMessage.success(`选择器匹配到 ${elements.length} 个元素`)
  } catch (error) {
    ElMessage.error(`选择器测试失败: ${error.message}`)
  }
}

const getSelectorLabel = (type: string) => {
  const labels = {
    id: 'ID选择器',
    class: 'Class选择器',
    attribute: '属性选择器',
    structural: '结构选择器',
    text: '文本选择器'
  }
  return labels[type] || type
}

// 事件操作
const toggleEventDetails = (eventType: string) => {
  const index = expandedEvents.value.indexOf(eventType)
  if (index >= 0) {
    expandedEvents.value.splice(index, 1)
  } else {
    expandedEvents.value.push(eventType)
  }
}

// 操作面板
const highlightElement = () => {
  props.element.style.outline = '3px solid var(--primary-color)'
  props.element.style.outlineOffset = '2px'
  
  setTimeout(() => {
    props.element.style.outline = ''
    props.element.style.outlineOffset = ''
  }, 3000)
  
  ElMessage.success('元素已高亮')
}

const scrollToElement = () => {
  props.element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  ElMessage.success('已滚动到元素')
}

const simulateClick = () => {
  props.element.click()
  ElMessage.success('已模拟点击')
}

const simulateHover = () => {
  const event = new MouseEvent('mouseenter', {
    view: window,
    bubbles: true,
    cancelable: true
  })
  props.element.dispatchEvent(event)
  ElMessage.success('已模拟悬停')
}

const captureScreenshot = () => {
  // 截图元素的逻辑
  ElMessage.info('截图功能开发中...')
}
</script>

<style lang="scss" scoped>
.dom-inspector {
  background: white;
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--spacing-sm);
  overflow: hidden;
}

.inspector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--text-sm) var(--text-lg);
  background: var(--bg-light);
  border-bottom: var(--border-width-base) solid var(--border-color);

  h4 {
    margin: 0;
    color: var(--text-primary);
  }

  .inspector-actions {
    display: flex;
    gap: var(--spacing-sm);
  }
}

.inspector-content {
  padding: var(--text-lg);
  max-height: 600px;
  overflow-y: auto;

  > div {
    margin-bottom: var(--text-2xl);

    h5 {
      margin: 0 0 var(--text-sm) 0;
      color: var(--text-primary);
      font-size: var(--text-base);
      font-weight: 600;
      padding-bottom: var(--spacing-sm);
      border-bottom: var(--border-width-base) solid var(--border-color);
    }
  }
}

.basic-info {
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-sm);

    .info-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);

      label {
        font-size: var(--text-sm);
        color: var(--text-secondary);
        min-width: 60px;
      }

      .tag-name {
        font-weight: 600;
        color: var(--primary-color);
      }

      .element-id {
        font-family: monospace;
        background: var(--bg-light);
        padding: var(--spacing-sm) var(--spacing-xs);
        border-radius: var(--radius-xs);
      }

      .element-classes {
        font-family: monospace;
        background: var(--bg-light);
        padding: var(--spacing-sm) var(--spacing-xs);
        border-radius: var(--radius-xs);
        font-size: var(--text-xs);
      }
    }
  }
}

.text-display {
  .el-textarea {
    :deep(.el-textarea__inner) {
      font-size: var(--text-sm);
      font-family: monospace;
    }
  }
}

.attributes-list {
  .attribute-item {
    display: flex;
    align-items: center;
    gap: var(--text-sm);
    margin-bottom: var(--spacing-sm);

    .attribute-key {
      min-width: 100px;
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--text-primary);
    }

    .attribute-value {
      flex: 1;
    }
  }

  .add-attribute {
    display: flex;
    align-items: center;
    margin-top: var(--text-sm);
    padding-top: var(--text-sm);
    border-top: var(--border-width-base) solid var(--border-color);
  }
}

.styles-filter {
  margin-bottom: var(--text-sm);
}

.styles-list {
  max-height: 200px;
  overflow-y: auto;
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--spacing-xs);

  .style-item {
    display: flex;
    align-items: center;
    padding: var(--spacing-lg) var(--text-sm);
    border-bottom: var(--border-width-base) solid var(--bg-gray);

    &:last-child {
      border-bottom: none;
    }

    .style-property {
      min-width: 150px;
      font-size: var(--text-xs);
      font-weight: 600;
      color: var(--text-primary);
    }

    .style-value {
      flex: 1;
      font-size: var(--text-xs);
      color: var(--text-secondary);
      font-family: monospace;
    }
  }
}

.position-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-sm);

  .position-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-lg) var(--spacing-sm);
    background: var(--bg-light);
    border-radius: var(--spacing-xs);

    label {
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }

    span {
      font-weight: 600;
      color: var(--text-primary);
    }
  }
}

.hierarchy-tree {
  .hierarchy-path {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    flex-wrap: wrap;

    .path-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-xs) var(--spacing-sm);
      background: var(--bg-light);
      border-radius: var(--spacing-xs);
      cursor: pointer;
      font-size: var(--text-sm);
      transition: all 0.2s ease;

      &:hover {
        background: var(--primary-light);
        color: var(--primary-color);
      }

      .path-id {
        color: var(--success-color);
        font-weight: 600;
      }

      .path-class {
        color: var(--warning-color);
      }
    }

    .path-separator {
      font-size: var(--text-sm);
      color: var(--text-muted);
    }
  }
}

.generator-options {
  margin-bottom: var(--text-sm);
}

.generated-selectors {
  .selector-item {
    display: flex;
    align-items: center;
    gap: var(--text-sm);
    margin-bottom: var(--spacing-sm);

    .selector-label {
      min-width: 100px;
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--text-primary);
    }

    .selector-value {
      flex: 1;
    }
  }
}

.generator-actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--text-sm);
}

.events-list {
  .event-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-sm) var(--text-sm);
    background: var(--bg-light);
    border-radius: var(--spacing-xs);
    margin-bottom: var(--spacing-lg);

    .event-type {
      font-weight: 600;
      color: var(--text-primary);
    }

    .event-count {
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }
  }

  .event-details {
    margin-bottom: var(--text-sm);
    padding-left: var(--text-2xl);

    .listener-item {
      background: var(--bg-gray-light);
      border-radius: var(--spacing-xs);
      margin-bottom: var(--spacing-xs);

      pre {
        margin: 0;
        padding: var(--spacing-sm);
        font-size: var(--text-xs);
        overflow-x: auto;
      }
    }
  }
}

.action-buttons {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.empty-state {
  padding: var(--spacing-10xl) var(--text-2xl);
  text-align: center;
}
</style>