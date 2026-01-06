<template>
  <div class="element-recognition">
    <!-- 控制面板 -->
    <div class="control-panel">
      <div class="panel-header">
        <h3>元素识别与选择</h3>
        <div class="panel-actions">
          <el-button @click="startSelection" type="primary" :disabled="isSelecting">
            <el-icon><Aim /></el-icon>
            {{ isSelecting ? '选择中...' : '开始选择' }}
          </el-button>
          <el-button @click="stopSelection" :disabled="!isSelecting">
            <el-icon><Close /></el-icon>
            停止选择
          </el-button>
          <el-button @click="clearSelection">
            <el-icon><Delete /></el-icon>
            清空选择
          </el-button>
        </div>
      </div>

      <!-- 选择模式配置 -->
      <div class="selection-config">
        <el-form :model="selectionConfig" label-position="top" size="small">
          <el-row :gutter="16">
            <el-col :span="6">
              <el-form-item label="选择模式">
                <el-select v-model="selectionConfig.mode" @change="handleModeChange">
                  <el-option label="点击选择" value="click" />
                  <el-option label="悬停选择" value="hover" />
                  <el-option label="框选多个" value="box" />
                  <el-option label="智能识别" value="smart" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="目标类型">
                <el-select v-model="selectionConfig.targetType" multiple placeholder="全部类型">
                  <el-option label="按钮" value="button" />
                  <el-option label="链接" value="link" />
                  <el-option label="输入框" value="input" />
                  <el-option label="下拉框" value="select" />
                  <el-option label="文本" value="text" />
                  <el-option label="图片" value="image" />
                  <el-option label="表单" value="form" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="选择器优先级">
                <el-select v-model="selectionConfig.selectorPriority">
                  <el-option label="ID优先" value="id" />
                  <el-option label="Class优先" value="class" />
                  <el-option label="属性优先" value="attribute" />
                  <el-option label="结构优先" value="structure" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="生成策略">
                <el-select v-model="selectionConfig.strategy">
                  <el-option label="最简化" value="minimal" />
                  <el-option label="最稳定" value="stable" />
                  <el-option label="最精确" value="precise" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- 快捷工具 -->
      <div class="quick-tools">
        <el-button-group>
          <el-button @click="inspectElement" :disabled="!isSelecting">
            <el-icon><Search /></el-icon>
            检查元素
          </el-button>
          <el-button @click="generateOptimalSelector" :disabled="selectedElements.length === 0">
            <el-icon><MagicStick /></el-icon>
            优化选择器
          </el-button>
          <el-button @click="testSelector" :disabled="!currentSelector">
            <el-icon><VideoPlay /></el-icon>
            测试选择器
          </el-button>
          <el-button @click="exportSelectors" :disabled="selectedElements.length === 0">
            <el-icon><Download /></el-icon>
            导出选择器
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 选择状态指示器 -->
    <div class="selection-indicator" v-if="isSelecting">
      <div class="indicator-content">
        <el-icon class="indicator-icon"><Aim /></el-icon>
        <span class="indicator-text">
          {{ selectionConfig.mode === 'click' ? '点击页面元素进行选择' : 
             selectionConfig.mode === 'hover' ? '悬停在元素上进行选择' : 
             selectionConfig.mode === 'box' ? '拖拽框选多个元素' : 
             '移动鼠标，AI将智能识别元素' }}
        </span>
        <el-button size="small" @click="stopSelection">停止</el-button>
      </div>
    </div>

    <!-- 已选择元素列表 -->
    <div class="selected-elements" v-if="selectedElements.length > 0">
      <div class="elements-header">
        <h4>已选择元素 ({{ selectedElements.length }})</h4>
        <div class="elements-actions">
          <el-button size="small" @click="selectAll" v-if="selectionConfig.mode === 'smart'">
            全选同类
          </el-button>
          <el-button size="small" @click="clearSelection">
            清空
          </el-button>
        </div>
      </div>

      <div class="elements-list">
        <div 
          v-for="(element, index) in selectedElements"
          :key="index"
          class="element-item"
          :class="{ 'active': activeElementIndex === index }"
          @click="selectElementItem(index)"
          @mouseenter="highlightElement(element)"
          @mouseleave="unhighlightElement(element)"
        >
          <div class="element-preview">
            <div class="element-type-badge">
              <el-tag :type="getElementTypeColor(element.tagName)">
                {{ element.tagName.toLowerCase() }}
              </el-tag>
            </div>
            <div class="element-content">
              <div class="element-text" v-if="element.textContent">
                {{ truncateText(element.textContent, 50) }}
              </div>
              <div class="element-attributes" v-if="element.attributes">
                <span 
                  v-for="(value, key) in element.attributes"
                  :key="key"
                  class="attribute-tag"
                  v-if="['id', 'class', 'name', 'type'].includes(key)"
                >
                  {{ key }}="{{ value }}"
                </span>
              </div>
            </div>
          </div>

          <div class="element-selectors">
            <div class="selector-group">
              <label>推荐选择器:</label>
              <div class="selector-options">
                <div 
                  v-for="(selector, sIndex) in element.selectors"
                  :key="sIndex"
                  class="selector-option"
                  :class="{ 'selected': element.selectedSelectorIndex === sIndex }"
                  @click.stop="selectSelector(index, sIndex)"
                >
                  <code class="selector-text">{{ selector.value }}</code>
                  <div class="selector-info">
                    <el-tag size="small" :type="getSelectorTypeColor(selector.type)">
                      {{ selector.type }}
                    </el-tag>
                    <span class="selector-score">{{ selector.score }}/100</span>
                    <el-button 
                      size="small" 
                      @click.stop="copySelector(selector.value)"
                      text
                    >
                      <el-icon><DocumentCopy /></el-icon>
                    </el-button>
                    <el-button 
                      size="small" 
                      @click.stop="testSingleSelector(selector.value)"
                      text
                    >
                      <el-icon><VideoPlay /></el-icon>
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="element-actions">
            <el-button size="small" @click.stop="locateElement(element)">
              <el-icon><Position /></el-icon>
              定位
            </el-button>
            <el-button size="small" @click.stop="inspectElementDetails(element)">
              <el-icon><View /></el-icon>
              详情
            </el-button>
            <el-button size="small" @click.stop="removeElement(index)" type="danger">
              <el-icon><Delete /></el-icon>
              移除
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- DOM检查器 -->
    <div class="dom-inspector" v-if="inspectedElement">
      <DOMInspector 
        :element="inspectedElement"
        @selector-generated="handleSelectorGenerated"
        @element-modified="handleElementModified"
      />
    </div>

    <!-- 选择器测试结果 -->
    <div class="selector-test-results" v-if="testResults">
      <div class="test-header">
        <h4>选择器测试结果</h4>
        <el-button size="small" @click="testResults = null">关闭</el-button>
      </div>
      <div class="test-content">
        <div class="test-summary">
          <el-tag :type="testResults.success ? 'success' : 'danger'">
            {{ testResults.success ? '测试成功' : '测试失败' }}
          </el-tag>
          <span class="match-count">匹配 {{ testResults.matchCount }} 个元素</span>
        </div>
        <div class="test-details" v-if="testResults.details">
          <pre>{{ JSON.stringify(testResults.details, null, 2) }}</pre>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-if="selectedElements.length === 0 && !isSelecting">
      <el-empty description="暂无选择的元素">
        <el-button type="primary" @click="startSelection">
          <el-icon><Aim /></el-icon>
          开始选择元素
        </el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, defineEmits, defineExpose } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Aim,
  Close,
  Delete,
  Search,
  MagicStick,
  VideoPlay,
  Download,
  DocumentCopy,
  Position,
  View
} from '@element-plus/icons-vue'
import DOMInspector from '../../../components/ai/website/DOMInspector.vue'
import { useElementSelection } from '@/composables/useElementSelection'

// 定义 emits
const emit = defineEmits(['element-selected', 'selector-generated'])

// 组合式API
const {
  startElementSelection,
  stopElementSelection,
  generateSelector,
  testSelector: testSelectorAPI,
  optimizeSelector
} = useElementSelection()

// 响应式数据
const isSelecting = ref(false)
const selectedElements = ref<any[]>([])
const activeElementIndex = ref(-1)
const inspectedElement = ref<any>(null)
const testResults = ref<any>(null)

// 选择配置
const selectionConfig = reactive({
  mode: 'click',
  targetType: [],
  selectorPriority: 'id',
  strategy: 'stable'
})

// 计算属性
const currentSelector = computed(() => {
  const activeElement = selectedElements.value[activeElementIndex.value]
  if (activeElement && activeElement.selectors && activeElement.selectedSelectorIndex >= 0) {
    return activeElement.selectors[activeElement.selectedSelectorIndex].value
  }
  return null
})

// 方法定义
const startSelection = async () => {
  try {
    isSelecting.value = true
    await startElementSelection(selectionConfig)
    
    // 监听元素选择事件
    document.addEventListener('element-selected', handleElementSelected)
    
    ElMessage.success('元素选择模式已启动')
  } catch (error) {
    ElMessage.error('启动选择模式失败：' + error.message)
    isSelecting.value = false
  }
}

const stopSelection = () => {
  isSelecting.value = false
  stopElementSelection()
  document.removeEventListener('element-selected', handleElementSelected)
  ElMessage.info('元素选择模式已停止')
}

const clearSelection = () => {
  selectedElements.value = []
  activeElementIndex.value = -1
  inspectedElement.value = null
  testResults.value = null
  ElMessage.success('已清空选择的元素')
}

const handleModeChange = () => {
  if (isSelecting.value) {
    stopSelection()
    startSelection()
  }
}

// 元素选择处理
const handleElementSelected = (event: any) => {
  const element = event.detail
  addSelectedElement(element)
}

const addSelectedElement = async (element: any) => {
  try {
    // 生成多个选择器选项
    const selectors = await generateMultipleSelectors(element)
    
    const elementData = {
      ...element,
      selectors,
      selectedSelectorIndex: 0,
      timestamp: Date.now()
    }
    
    selectedElements.value.push(elementData)
    activeElementIndex.value = selectedElements.value.length - 1
    
    emit('element-selected', elementData)
    
    ElMessage.success(`已选择 ${element.tagName} 元素`)
  } catch (error) {
    ElMessage.error('处理选择的元素失败：' + error.message)
  }
}

const generateMultipleSelectors = async (element: any) => {
  const selectors = []
  
  try {
    // ID选择器
    if (element.id) {
      selectors.push({
        type: 'id',
        value: `#${element.id}`,
        score: 95
      })
    }
    
    // Class选择器
    if (element.className) {
      const classes = element.className.split(' ').filter(cls => cls.trim())
      if (classes.length > 0) {
        selectors.push({
          type: 'class',
          value: `.${classes.join('.')}`,
          score: 80
        })
      }
    }
    
    // 属性选择器
    if (element.name) {
      selectors.push({
        type: 'attribute',
        value: `[name="${element.name}"]`,
        score: 85
      })
    }
    
    if (element.type) {
      selectors.push({
        type: 'attribute',
        value: `[type="${element.type}"]`,
        score: 70
      })
    }
    
    // 结构选择器
    const structuralSelector = await generateStructuralSelector(element)
    if (structuralSelector) {
      selectors.push({
        type: 'structural',
        value: structuralSelector,
        score: 60
      })
    }
    
    // 文本选择器
    if (element.textContent && element.textContent.trim()) {
      selectors.push({
        type: 'text',
        value: `text="${element.textContent.trim()}"`,
        score: 50
      })
    }
    
    // 排序选择器（按分数降序）
    return selectors.sort((a, b) => b.score - a.score)
  } catch (error) {
    console.error('生成选择器失败:', error)
    return [{
      type: 'fallback',
      value: element.tagName.toLowerCase(),
      score: 30
    }]
  }
}

const generateStructuralSelector = async (element: any) => {
  // 生成基于DOM结构的选择器
  let selector = element.tagName.toLowerCase()
  let parent = element.parentElement
  
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

// 元素操作
const selectElementItem = (index: number) => {
  activeElementIndex.value = index
}

const selectSelector = (elementIndex: number, selectorIndex: number) => {
  selectedElements.value[elementIndex].selectedSelectorIndex = selectorIndex
  emit('selector-generated', selectedElements.value[elementIndex].selectors[selectorIndex].value)
}

const highlightElement = (element: any) => {
  // 高亮页面上的元素
  try {
    const targetElement = document.querySelector(getCurrentSelector(element))
    if (targetElement) {
      targetElement.style.outline = '2px solid var(--primary-color)'
      targetElement.style.outlineOffset = '2px'
    }
  } catch (error) {
    console.error('高亮元素失败:', error)
  }
}

const unhighlightElement = (element: any) => {
  // 取消高亮
  try {
    const targetElement = document.querySelector(getCurrentSelector(element))
    if (targetElement) {
      targetElement.style.outline = ''
      targetElement.style.outlineOffset = ''
    }
  } catch (error) {
    console.error('取消高亮失败:', error)
  }
}

const locateElement = (element: any) => {
  try {
    const selector = getCurrentSelector(element)
    const targetElement = document.querySelector(selector)
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      highlightElement(element)
      setTimeout(() => unhighlightElement(element), 3000)
    }
  } catch (error) {
    ElMessage.error('定位元素失败：' + error.message)
  }
}

const inspectElementDetails = (element: any) => {
  inspectedElement.value = element
}

const removeElement = (index: number) => {
  selectedElements.value.splice(index, 1)
  if (activeElementIndex.value >= selectedElements.value.length) {
    activeElementIndex.value = selectedElements.value.length - 1
  }
}

// 工具方法
const inspectElement = () => {
  ElMessage.info('检查元素功能开发中...')
}

const generateOptimalSelector = async () => {
  try {
    for (let i = 0; i < selectedElements.value.length; i++) {
      const element = selectedElements.value[i]
      const optimizedSelector = await optimizeSelector(element)
      
      if (optimizedSelector) {
        element.selectors.unshift({
          type: 'optimized',
          value: optimizedSelector,
          score: 100
        })
        element.selectedSelectorIndex = 0
      }
    }
    
    ElMessage.success('选择器优化完成')
  } catch (error) {
    ElMessage.error('优化选择器失败：' + error.message)
  }
}

const testSelector = async () => {
  if (!currentSelector.value) return
  
  try {
    const result = await testSelectorAPI(currentSelector.value)
    testResults.value = result
    
    if (result.success) {
      ElMessage.success(`选择器测试成功，匹配 ${result.matchCount} 个元素`)
    } else {
      ElMessage.error('选择器测试失败')
    }
  } catch (error) {
    ElMessage.error('测试选择器失败：' + error.message)
  }
}

const testSingleSelector = async (selector: string) => {
  try {
    const result = await testSelectorAPI(selector)
    testResults.value = result
  } catch (error) {
    ElMessage.error('测试选择器失败：' + error.message)
  }
}

const exportSelectors = () => {
  const selectorsData = selectedElements.value.map(element => ({
    tagName: element.tagName,
    selector: getCurrentSelector(element),
    attributes: element.attributes,
    textContent: element.textContent
  }))
  
  const blob = new Blob([JSON.stringify(selectorsData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `selectors-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  
  ElMessage.success('选择器已导出')
}

const selectAll = async () => {
  // 智能选择同类元素
  ElMessage.info('智能选择功能开发中...')
}

const copySelector = async (selector: string) => {
  try {
    await navigator.clipboard.writeText(selector)
    ElMessage.success('选择器已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 事件处理
const handleSelectorGenerated = (selector: string) => {
  emit('selector-generated', selector)
}

const handleElementModified = (element: any) => {
  // 更新选择的元素
  const index = selectedElements.value.findIndex(el => el.timestamp === element.timestamp)
  if (index >= 0) {
    selectedElements.value[index] = element
  }
}

// 工具函数
const getCurrentSelector = (element: any) => {
  if (element.selectors && element.selectedSelectorIndex >= 0) {
    return element.selectors[element.selectedSelectorIndex].value
  }
  return element.tagName?.toLowerCase() || 'div'
}

const getElementTypeColor = (tagName: string) => {
  const colorMap = {
    button: 'primary',
    input: 'success',
    select: 'warning',
    a: 'info',
    div: '',
    span: '',
    p: 'info'
  }
  return colorMap[tagName?.toLowerCase()] || ''
}

const getSelectorTypeColor = (type: string) => {
  const colorMap = {
    id: 'success',
    class: 'primary',
    attribute: 'warning',
    structural: 'info',
    text: '',
    optimized: 'danger'
  }
  return colorMap[type] || ''
}

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// 暴露方法给父组件
defineExpose({
  startSelection,
  stopSelection,
  clearSelection
})

// 生命周期
onMounted(() => {
  // 初始化
})

onUnmounted(() => {
  stopSelection()
})
</script>

<style lang="scss" scoped>
.element-recognition {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--text-lg);
}

.control-panel {
  background: white;
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--spacing-sm);
  padding: var(--text-lg);

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--text-lg);

    h3 {
      margin: 0;
      color: var(--text-primary);
    }

    .panel-actions {
      display: flex;
      gap: var(--spacing-sm);
    }
  }

  .selection-config {
    margin-bottom: var(--text-lg);

    :deep(.el-form-item__label) {
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }
  }

  .quick-tools {
    border-top: var(--border-width-base) solid var(--border-color);
    padding-top: var(--text-lg);
  }
}

.selection-indicator {
  position: fixed;
  top: var(--text-2xl);
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  background: var(--primary-color);
  color: white;
  padding: var(--text-sm) var(--text-2xl);
  border-radius: 25px;
  box-shadow: 0 var(--spacing-xs) var(--text-2xl) var(--shadow-medium);

  .indicator-content {
    display: flex;
    align-items: center;
    gap: var(--text-sm);

    .indicator-icon {
      animation: pulse 2s infinite;
    }

    .indicator-text {
      font-size: var(--text-base);
    }
  }
}

.selected-elements {
  background: white;
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--spacing-sm);
  padding: var(--text-lg);

  .elements-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--text-lg);

    h4 {
      margin: 0;
      color: var(--text-primary);
    }

    .elements-actions {
      display: flex;
      gap: var(--spacing-sm);
    }
  }

  .elements-list {
    max-height: 500px;
    overflow-y: auto;

    .element-item {
      border: var(--border-width-base) solid var(--border-color);
      border-radius: var(--radius-md);
      padding: var(--text-sm);
      margin-bottom: var(--text-sm);
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        border-color: var(--primary-color);
        background: var(--bg-light);
      }

      &.active {
        border-color: var(--primary-color);
        background: var(--primary-light);
      }

      .element-preview {
        display: flex;
        align-items: flex-start;
        gap: var(--text-sm);
        margin-bottom: var(--text-sm);

        .element-type-badge {
          flex-shrink: 0;
        }

        .element-content {
          flex: 1;
          min-width: 0;

          .element-text {
            font-size: var(--text-base);
            color: var(--text-primary);
            margin-bottom: var(--spacing-xs);
            word-break: break-all;
          }

          .element-attributes {
            display: flex;
            flex-wrap: wrap;
            gap: var(--spacing-xs);

            .attribute-tag {
              font-size: var(--text-xs);
              color: var(--text-secondary);
              background: var(--bg-light);
              padding: var(--spacing-sm) 6px;
              border-radius: var(--radius-xs);
              font-family: monospace;
            }
          }
        }
      }

      .element-selectors {
        margin-bottom: var(--text-sm);

        .selector-group {
          label {
            display: block;
            font-size: var(--text-sm);
            color: var(--text-secondary);
            margin-bottom: var(--spacing-sm);
            font-weight: 600;
          }

          .selector-options {
            .selector-option {
              border: var(--border-width-base) solid var(--border-color);
              border-radius: var(--spacing-xs);
              padding: var(--spacing-sm);
              margin-bottom: var(--spacing-lg);
              cursor: pointer;
              transition: all 0.2s ease;

              &:hover {
                border-color: var(--primary-color);
              }

              &.selected {
                border-color: var(--primary-color);
                background: var(--primary-light);
              }

              .selector-text {
                display: block;
                font-family: monospace;
                font-size: var(--text-sm);
                background: var(--bg-gray-light);
                padding: var(--spacing-xs) 6px;
                border-radius: var(--radius-xs);
                margin-bottom: var(--spacing-xs);
                word-break: break-all;
              }

              .selector-info {
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                font-size: var(--text-xs);

                .selector-score {
                  color: var(--text-secondary);
                }
              }
            }
          }
        }
      }

      .element-actions {
        display: flex;
        gap: var(--spacing-sm);
      }
    }
  }
}

.dom-inspector {
  background: white;
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--spacing-sm);
  padding: var(--text-lg);
}

.selector-test-results {
  background: white;
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--spacing-sm);
  padding: var(--text-lg);

  .test-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--text-sm);

    h4 {
      margin: 0;
      color: var(--text-primary);
    }
  }

  .test-content {
    .test-summary {
      display: flex;
      align-items: center;
      gap: var(--text-sm);
      margin-bottom: var(--text-sm);

      .match-count {
        font-size: var(--text-base);
        color: var(--text-secondary);
      }
    }

    .test-details {
      pre {
        background: var(--bg-light);
        padding: var(--text-sm);
        border-radius: var(--spacing-xs);
        font-size: var(--text-xs);
        overflow-x: auto;
      }
    }
  }
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style>