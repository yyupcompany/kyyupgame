<template>
  <div class="element-selector">
    <!-- 选择模式切换 -->
    <div class="selector-modes">
      <el-radio-group v-model="selectorMode" @change="handleModeChange">
        <el-radio-button value="visual">可视化选择</el-radio-button>
        <el-radio-button value="manual">手动输入</el-radio-button>
        <el-radio-button value="smart">智能识别</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 可视化选择模式 -->
    <div class="visual-selector" v-if="selectorMode === 'visual'">
      <div class="visual-controls">
        <el-button @click="startVisualSelection" type="primary" :disabled="isSelecting">
          <UnifiedIcon name="default" />
          开始选择元素
        </el-button>
        <el-button @click="stopVisualSelection" :disabled="!isSelecting">
          <UnifiedIcon name="Close" />
          停止选择
        </el-button>
        <el-button @click="captureScreenshot">
          <UnifiedIcon name="default" />
          截图选择
        </el-button>
      </div>

      <!-- 选择指示器 -->
      <div class="selection-indicator" v-if="isSelecting">
        <el-alert 
          title="选择模式已启用" 
          description="请在页面上点击要选择的元素" 
          type="info" 
          show-icon 
          :closable="false"
        />
      </div>

      <!-- 当前选择的元素 -->
      <div class="selected-element" v-if="selectedElement">
        <h4>已选择元素</h4>
        <div class="element-info">
          <div class="element-preview">
            <el-tag :type="getElementTypeColor(selectedElement.tagName)">
              {{ selectedElement.tagName.toLowerCase() }}
            </el-tag>
            <span class="element-text">{{ getElementDisplayText(selectedElement) }}</span>
          </div>
          <div class="element-properties">
            <div class="property-item" v-if="selectedElement.id">
              <label>ID:</label>
              <code>{{ selectedElement.id }}</code>
            </div>
            <div class="property-item" v-if="selectedElement.className">
              <label>Class:</label>
              <code>{{ selectedElement.className }}</code>
            </div>
            <div class="property-item" v-if="selectedElement.textContent">
              <label>文本:</label>
              <span>{{ truncateText(selectedElement.textContent, 50) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 手动输入模式 -->
    <div class="manual-selector" v-if="selectorMode === 'manual'">
      <div class="manual-controls">
        <el-form label-position="top">
          <el-form-item label="选择器类型">
            <el-select v-model="manualSelectorType" @change="handleSelectorTypeChange">
              <el-option label="CSS选择器" value="css" />
              <el-option label="XPath" value="xpath" />
              <el-option label="属性选择器" value="attribute" />
              <el-option label="文本选择器" value="text" />
            </el-select>
          </el-form-item>
          
          <el-form-item :label="getSelectorTypeLabel()">
            <el-input 
              v-model="manualSelectorValue" 
              :placeholder="getSelectorPlaceholder()"
              @input="handleManualSelectorChange"
            >
              <template #append>
                <el-button @click="testManualSelector" :loading="testing">测试</el-button>
              </template>
            </el-input>
          </el-form-item>
        </el-form>
      </div>

      <!-- 快速选择器生成 -->
      <div class="quick-selectors">
        <h4>快速生成选择器</h4>
        <div class="quick-options">
          <el-row :gutter="12">
            <el-col :span="8">
              <el-input v-model="quickId" placeholder="元素ID">
                <template #prepend>#</template>
                <template #append>
                  <el-button @click="generateQuickSelector('id')" size="small">生成</el-button>
                </template>
              </el-input>
            </el-col>
            <el-col :span="8">
              <el-input v-model="quickClass" placeholder="CSS类名">
                <template #prepend>.</template>
                <template #append>
                  <el-button @click="generateQuickSelector('class')" size="small">生成</el-button>
                </template>
              </el-input>
            </el-col>
            <el-col :span="8">
              <el-input v-model="quickText" placeholder="文本内容">
                <template #append>
                  <el-button @click="generateQuickSelector('text')" size="small">生成</el-button>
                </template>
              </el-input>
            </el-col>
          </el-row>
        </div>
      </div>

      <!-- 测试结果 -->
      <div class="test-results" v-if="testResult">
        <el-alert 
          :title="testResult.success ? '测试成功' : '测试失败'" 
          :description="testResult.message"
          :type="testResult.success ? 'success' : 'error'"
          show-icon
        />
        <div class="matched-elements" v-if="testResult.success && testResult.elements">
          <p>匹配到 {{ testResult.elements.length }} 个元素:</p>
          <div class="elements-list">
            <div 
              v-for="(element, index) in testResult.elements.slice(0, 5)"
              :key="index"
              class="element-item"
              @click="selectTestElement(element)"
            >
              <el-tag size="small">{{ element.tagName.toLowerCase() }}</el-tag>
              <span>{{ getElementDisplayText(element) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 智能识别模式 -->
    <div class="smart-selector" v-if="selectorMode === 'smart'">
      <div class="smart-controls">
        <el-form label-position="top">
          <el-form-item label="描述目标元素">
            <el-input 
              v-model="smartDescription" 
              type="textarea"
              :rows="3"
              placeholder="用自然语言描述要选择的元素，例如：'登录按钮'、'用户名输入框'、'第一个链接'"
              @input="handleSmartDescriptionChange"
            />
          </el-form-item>
          <el-form-item>
            <el-button @click="startSmartSelection" type="primary" :loading="smartAnalyzing">
              <UnifiedIcon name="default" />
              智能识别
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 智能识别结果 -->
      <div class="smart-results" v-if="smartResults.length > 0">
        <h4>识别结果</h4>
        <div class="results-list">
          <div 
            v-for="(result, index) in smartResults"
            :key="index"
            class="result-item"
            :class="{ 'selected': selectedSmartResult === index }"
            @click="selectSmartResult(index)"
          >
            <div class="result-header">
              <el-tag :type="getConfidenceType(result.confidence)">
                置信度: {{ Math.round(result.confidence * 100) }}%
              </el-tag>
              <span class="result-description">{{ result.description }}</span>
            </div>
            <div class="result-selector">
              <code>{{ result.selector }}</code>
              <el-button @click.stop="testSmartSelector(result)" size="small" text>
                <UnifiedIcon name="default" />
                测试
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 生成的选择器列表 -->
    <div class="generated-selectors" v-if="generatedSelectors.length > 0">
      <h4>可选选择器</h4>
      <div class="selectors-list">
        <div 
          v-for="(selector, index) in generatedSelectors"
          :key="index"
          class="selector-item"
          :class="{ 'selected': selectedSelectorIndex === index }"
          @click="selectGeneratedSelector(index)"
        >
          <div class="selector-header">
            <el-tag :type="getSelectorTypeColor(selector.type)" size="small">
              {{ getSelectorTypeText(selector.type) }}
            </el-tag>
            <span class="selector-score">得分: {{ selector.score }}/100</span>
          </div>
          <div class="selector-value">
            <code>{{ selector.value }}</code>
            <div class="selector-actions">
              <el-button @click.stop="copySelectorValue(selector.value)" size="small" text>
                <UnifiedIcon name="default" />
              </el-button>
              <el-button @click.stop="testGeneratedSelector(selector)" size="small" text>
                <UnifiedIcon name="default" />
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="selector-footer">
      <div class="footer-info">
        <span v-if="finalSelector">
          当前选择器: <code>{{ finalSelector }}</code>
        </span>
      </div>
      <div class="footer-actions">
        <el-button @click="handleCancel">取消</el-button>
        <el-button @click="handleConfirm" type="primary" :disabled="!finalSelector">
          确认选择
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, defineEmits, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Aim,
  Close,
  Camera,
  MagicStick,
  VideoPlay,
  DocumentCopy
} from '@element-plus/icons-vue'
import { useElementSelection } from '@/composables/useElementSelection'
import { useSmartSelection } from '@/composables/useSmartSelection'

// Emits
const emit = defineEmits(['element-selected', 'selector-generated', 'cancelled'])

// 组合式API
const {
  startSelection,
  stopSelection,
  generateSelectors
} = useElementSelection()

const {
  analyzeDescription,
  findElementsByDescription
} = useSmartSelection()

// 响应式数据
const selectorMode = ref('visual')
const isSelecting = ref(false)
const selectedElement = ref<any>(null)
const manualSelectorType = ref('css')
const manualSelectorValue = ref('')
const testing = ref(false)
const testResult = ref<any>(null)
const smartDescription = ref('')
const smartAnalyzing = ref(false)
const smartResults = ref<any[]>([])
const selectedSmartResult = ref(-1)
const generatedSelectors = ref<any[]>([])
const selectedSelectorIndex = ref(-1)

// 快速选择器生成
const quickId = ref('')
const quickClass = ref('')
const quickText = ref('')

// 计算属性
const finalSelector = computed(() => {
  if (selectedSelectorIndex.value >= 0) {
    return generatedSelectors.value[selectedSelectorIndex.value]?.value
  }
  if (selectedSmartResult.value >= 0) {
    return smartResults.value[selectedSmartResult.value]?.selector
  }
  if (manualSelectorValue.value && selectorMode.value === 'manual') {
    return manualSelectorValue.value
  }
  return ''
})

// 方法定义
const handleModeChange = () => {
  // 清理状态
  selectedElement.value = null
  generatedSelectors.value = []
  selectedSelectorIndex.value = -1
  testResult.value = null
  smartResults.value = []
  selectedSmartResult.value = -1
  
  if (isSelecting.value) {
    stopVisualSelection()
  }
}

const startVisualSelection = () => {
  isSelecting.value = true
  startSelection({
    mode: 'click',
    callback: handleElementSelected
  })
  ElMessage.info('请点击页面上的元素进行选择')
}

const stopVisualSelection = () => {
  isSelecting.value = false
  stopSelection()
}

const handleElementSelected = async (element: any) => {
  selectedElement.value = element
  isSelecting.value = false
  
  try {
    // 生成多种选择器选项
    const selectors = await generateSelectors(element)
    generatedSelectors.value = selectors
    selectedSelectorIndex.value = 0 // 默认选择第一个
    
    emit('element-selected', element)
    ElMessage.success('元素已选择，已生成多种选择器选项')
  } catch (error) {
    ElMessage.error('生成选择器失败：' + error.message)
  }
}

const captureScreenshot = () => {
  // 截图选择功能
  ElMessage.info('截图选择功能开发中...')
}

const handleSelectorTypeChange = () => {
  manualSelectorValue.value = ''
  testResult.value = null
}

const handleManualSelectorChange = () => {
  testResult.value = null
}

const testManualSelector = async () => {
  if (!manualSelectorValue.value) {
    ElMessage.warning('请输入选择器')
    return
  }

  try {
    testing.value = true
    const elements = await testSelector(manualSelectorValue.value)
    
    testResult.value = {
      success: true,
      message: `找到 ${elements.length} 个匹配元素`,
      elements
    }
  } catch (error) {
    testResult.value = {
      success: false,
      message: error.message,
      elements: []
    }
  } finally {
    testing.value = false
  }
}

const testSelector = async (selector: string) => {
  try {
    let elements = []
    
    if (manualSelectorType.value === 'xpath') {
      const result = document.evaluate(
        selector,
        document,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
      )
      for (let i = 0; i < result.snapshotLength; i++) {
        elements.push(result.snapshotItem(i))
      }
    } else {
      elements = Array.from(document.querySelectorAll(selector))
    }
    
    return elements.map(el => ({
      tagName: el.tagName,
      textContent: el.textContent?.trim(),
      id: el.id,
      className: el.className,
      element: el
    }))
  } catch (error) {
    throw new Error('选择器语法错误或未找到匹配元素')
  }
}

const generateQuickSelector = (type: string) => {
  let selector = ''
  
  switch (type) {
    case 'id':
      if (quickId.value) {
        selector = `#${quickId.value}`
        manualSelectorType.value = 'css'
      }
      break
    case 'class':
      if (quickClass.value) {
        selector = `.${quickClass.value.split(' ').join('.')}`
        manualSelectorType.value = 'css'
      }
      break
    case 'text':
      if (quickText.value) {
        selector = `//*[contains(text(), "${quickText.value}")]`
        manualSelectorType.value = 'xpath'
      }
      break
  }
  
  if (selector) {
    manualSelectorValue.value = selector
    testManualSelector()
  }
}

const selectTestElement = (element: any) => {
  selectedElement.value = element
  emit('element-selected', element)
}

const handleSmartDescriptionChange = () => {
  smartResults.value = []
  selectedSmartResult.value = -1
}

const startSmartSelection = async () => {
  if (!smartDescription.value.trim()) {
    ElMessage.warning('请输入元素描述')
    return
  }

  try {
    smartAnalyzing.value = true
    
    // 使用AI分析描述并查找元素
    const results = await findElementsByDescription(smartDescription.value)
    
    smartResults.value = results
    selectedSmartResult.value = results.length > 0 ? 0 : -1
    
    if (results.length === 0) {
      ElMessage.warning('未找到匹配的元素，请尝试更详细的描述')
    } else {
      ElMessage.success(`找到 ${results.length} 个可能的匹配元素`)
    }
  } catch (error) {
    ElMessage.error('智能识别失败：' + error.message)
  } finally {
    smartAnalyzing.value = false
  }
}

const selectSmartResult = (index: number) => {
  selectedSmartResult.value = index
  const result = smartResults.value[index]
  
  // 模拟选择对应的元素
  selectedElement.value = {
    selector: result.selector,
    description: result.description
  }
}

const testSmartSelector = async (result: any) => {
  try {
    const elements = await testSelector(result.selector)
    ElMessage.success(`选择器测试成功，找到 ${elements.length} 个元素`)
  } catch (error) {
    ElMessage.error('选择器测试失败：' + error.message)
  }
}

const selectGeneratedSelector = (index: number) => {
  selectedSelectorIndex.value = index
}

const testGeneratedSelector = async (selector: any) => {
  try {
    const elements = await testSelector(selector.value)
    ElMessage.success(`选择器测试成功，找到 ${elements.length} 个元素`)
  } catch (error) {
    ElMessage.error('选择器测试失败：' + error.message)
  }
}

const copySelectorValue = async (value: string) => {
  try {
    await navigator.clipboard.writeText(value)
    ElMessage.success('选择器已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const handleConfirm = () => {
  if (finalSelector.value) {
    emit('selector-generated', finalSelector.value)
    if (selectedElement.value) {
      emit('element-selected', selectedElement.value)
    }
  }
}

const handleCancel = () => {
  emit('cancelled')
}

// 工具函数
const getElementTypeColor = (tagName: string) => {
  const colorMap = {
    button: 'primary',
    input: 'success',
    a: 'warning',
    div: 'info',
    span: 'info'
  }
  return colorMap[tagName?.toLowerCase()] || 'info'
}

const getElementDisplayText = (element: any) => {
  if (element.textContent) {
    return truncateText(element.textContent, 30)
  }
  if (element.id) {
    return `#${element.id}`
  }
  if (element.className) {
    return `.${element.className.split(' ')[0]}`
  }
  return element.tagName?.toLowerCase() || 'element'
}

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const getSelectorTypeLabel = () => {
  const labelMap = {
    css: 'CSS选择器',
    xpath: 'XPath表达式',
    attribute: '属性选择器',
    text: '文本选择器'
  }
  return labelMap[manualSelectorType.value] || '选择器'
}

const getSelectorPlaceholder = () => {
  const placeholderMap = {
    css: '例如: .button, #submit, [data-id="123"]',
    xpath: '例如: //button[@class="submit"], //input[@name="username"]',
    attribute: '例如: [data-testid="login-button"]',
    text: '例如: //button[text()="登录"]'
  }
  return placeholderMap[manualSelectorType.value] || ''
}

const getConfidenceType = (confidence: number) => {
  if (confidence >= 0.8) return 'success'
  if (confidence >= 0.6) return 'warning'
  return 'danger'
}

const getSelectorTypeColor = (type: string) => {
  const colorMap = {
    id: 'success',
    class: 'primary',
    attribute: 'warning',
    xpath: 'info',
    text: 'danger'
  }
  return colorMap[type] || 'info'
}

const getSelectorTypeText = (type: string) => {
  const textMap = {
    id: 'ID',
    class: 'Class',
    attribute: '属性',
    xpath: 'XPath',
    text: '文本'
  }
  return textMap[type] || type
}

// 生命周期
onMounted(() => {
  // 监听页面元素点击
  document.addEventListener('element-clicked', handleElementSelected)
})

onUnmounted(() => {
  document.removeEventListener('element-clicked', handleElementSelected)
  if (isSelecting.value) {
    stopVisualSelection()
  }
})
</script>

<style lang="scss" scoped>
.element-selector {
  .selector-modes {
    margin-bottom: var(--spacing-xl);
    text-align: center;
  }

  .visual-selector,
  .manual-selector,
  .smart-selector {
    margin-bottom: var(--spacing-xl);
  }

  .visual-controls,
  .manual-controls,
  .smart-controls {
    margin-bottom: var(--text-lg);
  }

  .selection-indicator {
    margin: var(--text-lg) 0;
  }

  .selected-element {
    border: var(--border-width) solid var(--border-color);
    border-radius: var(--radius-md);
    padding: var(--text-lg);
    margin: var(--text-lg) 0;

    h4 {
      margin: 0 0 var(--text-sm) 0;
      color: var(--text-primary);
      font-size: var(--text-base);
      font-weight: 600;
    }

    .element-info {
      .element-preview {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-sm);

        .element-text {
          color: var(--text-secondary);
          font-size: var(--text-base);
        }
      }

      .element-properties {
        .property-item {
          display: flex;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-xs);
          font-size: var(--text-sm);

          label {
            font-weight: 600;
            color: var(--text-secondary);
            min-width: auto;
          }

          code {
            background: var(--bg-light);
            padding: var(--spacing-sm) var(--spacing-xs);
            border-radius: var(--radius-xs);
            font-size: var(--text-xs);
          }

          span {
            color: var(--text-primary);
          }
        }
      }
    }
  }

  .quick-selectors {
    margin: var(--text-lg) 0;

    h4 {
      margin: 0 0 var(--text-sm) 0;
      color: var(--text-primary);
      font-size: var(--text-base);
      font-weight: 600;
    }
  }

  .test-results {
    margin: var(--text-lg) 0;

    .matched-elements {
      margin-top: var(--text-sm);

      .elements-list {
        .element-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-lg) var(--spacing-sm);
          border: var(--border-width) solid var(--border-color);
          border-radius: var(--spacing-xs);
          margin-bottom: var(--spacing-xs);
          cursor: pointer;
          transition: all var(--transition-normal) ease;

          &:hover {
            border-color: var(--primary-color);
            background: var(--bg-light);
          }

          span {
            font-size: var(--text-sm);
            color: var(--text-secondary);
          }
        }
      }
    }
  }

  .smart-results,
  .generated-selectors {
    margin: var(--spacing-xl) 0;

    h4 {
      margin: 0 0 var(--text-sm) 0;
      color: var(--text-primary);
      font-size: var(--text-base);
      font-weight: 600;
    }

    .results-list,
    .selectors-list {
      .result-item,
      .selector-item {
        border: var(--border-width) solid var(--border-color);
        border-radius: var(--radius-md);
        padding: var(--text-sm);
        margin-bottom: var(--spacing-sm);
        cursor: pointer;
        transition: all var(--transition-normal) ease;

        &:hover {
          border-color: var(--primary-color);
        }

        &.selected {
          border-color: var(--primary-color);
          background: var(--primary-light);
        }

        .result-header,
        .selector-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-lg);

          .result-description {
            color: var(--text-primary);
            font-size: var(--text-base);
          }

          .selector-score {
            color: var(--text-secondary);
            font-size: var(--text-sm);
          }
        }

        .result-selector,
        .selector-value {
          display: flex;
          justify-content: space-between;
          align-items: center;

          code {
            flex: 1;
            background: var(--bg-light);
            padding: var(--spacing-xs) 6px;
            border-radius: var(--radius-xs);
            font-size: var(--text-xs);
            margin-right: var(--spacing-sm);
            overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .selector-actions {
            display: flex;
            gap: var(--spacing-xs);
          }
        }
      }
    }
  }

  .selector-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--text-lg) 0;
    border-top: var(--z-index-dropdown) solid var(--border-color);
    margin-top: var(--spacing-xl);

    .footer-info {
      flex: 1;

      code {
        background: var(--bg-light);
        padding: var(--spacing-xs) 6px;
        border-radius: var(--radius-xs);
        font-size: var(--text-sm);
      }
    }

    .footer-actions {
      display: flex;
      gap: var(--spacing-sm);
    }
  }
}
</style>