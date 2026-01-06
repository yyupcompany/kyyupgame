<template>
  <div class="screenshot-analysis">
    <!-- 分析控制面板 -->
    <div class="analysis-panel">
      <div class="panel-header">
        <h3>截图分析</h3>
        <div class="panel-actions">
          <el-button @click="captureNew" type="primary">
            <UnifiedIcon name="default" />
            重新截图
          </el-button>
          <el-button @click="startAnalysis" :loading="analyzing" :disabled="!hasScreenshot">
            <UnifiedIcon name="Search" />
            开始分析
          </el-button>
          <el-button @click="clearAnalysis" :disabled="!analysisResult">
            <UnifiedIcon name="Delete" />
            清空分析
          </el-button>
        </div>
      </div>

      <!-- 分析配置 -->
      <div class="analysis-config">
        <el-form :model="analysisConfig" label-position="top" size="small">
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="分析类型">
                <el-select v-model="analysisConfig.type" placeholder="选择分析类型">
                  <el-option label="元素识别" value="elements" />
                  <el-option label="文本提取" value="text" />
                  <el-option label="表单识别" value="forms" />
                  <el-option label="按钮识别" value="buttons" />
                  <el-option label="链接识别" value="links" />
                  <el-option label="全面分析" value="comprehensive" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="识别精度">
                <el-select v-model="analysisConfig.precision" placeholder="选择精度">
                  <el-option label="快速" value="fast" />
                  <el-option label="标准" value="standard" />
                  <el-option label="精确" value="precise" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="语言">
                <el-select v-model="analysisConfig.language" placeholder="选择语言">
                  <el-option label="中文" value="zh" />
                  <el-option label="英文" value="en" />
                  <el-option label="自动检测" value="auto" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </div>

    <!-- 截图显示区域 -->
    <div class="screenshot-container" v-if="screenshotData">
      <div class="screenshot-wrapper">
        <div class="screenshot-image-container" ref="screenshotImageRef">
          <img 
            :src="screenshotData" 
            alt="页面截图" 
            class="screenshot-image"
            @load="handleImageLoad"
            @click="handleImageClick"
          />
          
          <!-- 元素标注层 -->
          <div class="annotation-layer" v-if="analysisResult">
            <div
              v-for="(element, index) in detectedElements"
              :key="index"
              class="element-annotation"
              :class="`type-${element.type}`"
              :style="getElementStyle(element)"
              @click="selectElement(element)"
              @mouseenter="highlightElement(element)"
              @mouseleave="unhighlightElement(element)"
            >
              <div class="element-label">
                <span class="element-type">{{ getElementTypeLabel(element.type) }}</span>
                <span class="element-confidence">{{ Math.round(element.confidence * 100) }}%</span>
              </div>
              <div class="element-tooltip" v-if="element.tooltip">
                {{ element.tooltip }}
              </div>
            </div>
          </div>

          <!-- 选择区域 -->
          <div 
            class="selection-area" 
            v-if="selectionArea"
            :style="getSelectionStyle(selectionArea)"
          >
            <div class="selection-info">
              {{ selectionArea.width }}x{{ selectionArea.height }}
            </div>
          </div>
        </div>

        <!-- 图片工具栏 -->
        <div class="image-toolbar">
          <el-button-group>
            <el-button @click="zoomIn" :disabled="zoomLevel >= 3">
              <UnifiedIcon name="default" />
            </el-button>
            <el-button @click="zoomOut" :disabled="zoomLevel <= 0.5">
              <UnifiedIcon name="default" />
            </el-button>
            <el-button @click="resetZoom">
              <UnifiedIcon name="Refresh" />
            </el-button>
          </el-button-group>
          <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
        </div>
      </div>
    </div>

    <!-- 分析结果面板 -->
    <div class="results-panel" v-if="analysisResult">
      <div class="results-header">
        <h4>分析结果</h4>
        <div class="results-stats">
          <el-tag>检测到 {{ detectedElements.length }} 个元素</el-tag>
          <el-tag type="success">耗时 {{ analysisTime }}ms</el-tag>
        </div>
      </div>

      <!-- 结果标签页 -->
      <el-tabs v-model="resultTab" class="result-tabs">
        <!-- 元素列表 -->
        <el-tab-pane label="元素列表" name="elements">
          <div class="elements-list">
            <div 
              v-for="(element, index) in detectedElements"
              :key="index"
              class="element-item"
              :class="{ 'selected': selectedElementIndex === index }"
              @click="selectElementFromList(element, index)"
            >
              <div class="element-header">
                <el-tag :type="getElementTagType(element.type)">
                  {{ getElementTypeLabel(element.type) }}
                </el-tag>
                <span class="element-confidence">
                  置信度: {{ Math.round(element.confidence * 100) }}%
                </span>
              </div>
              <div class="element-content">
                <p class="element-text" v-if="element.text">
                  <strong>文本:</strong> {{ element.text }}
                </p>
                <p class="element-selector" v-if="element.selector">
                  <strong>选择器:</strong> 
                  <code>{{ element.selector }}</code>
                  <el-button 
                    size="small" 
                    @click.stop="copySelector(element.selector)"
                    text
                  >
                    <UnifiedIcon name="default" />
                  </el-button>
                </p>
                <div class="element-properties" v-if="element.properties">
                  <strong>属性:</strong>
                  <el-tag 
                    v-for="(value, key) in element.properties"
                    :key="key"
                    size="small"
                    class="property-tag"
                  >
                    {{ key }}: {{ value }}
                  </el-tag>
                </div>
              </div>
              <div class="element-actions">
                <el-button size="small" @click.stop="highlightElement(element)">
                  高亮
                </el-button>
                <el-button size="small" @click.stop="generateActions(element)">
                  生成操作
                </el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 文本内容 -->
        <el-tab-pane label="文本内容" name="text">
          <div class="text-content">
            <el-input
              v-model="extractedText"
              type="textarea"
              :rows="10"
              placeholder="提取的文本内容..."
              readonly
            />
            <div class="text-actions">
              <el-button @click="copyText">复制文本</el-button>
              <el-button @click="downloadText">下载文本</el-button>
            </div>
          </div>
        </el-tab-pane>

        <!-- 结构分析 -->
        <el-tab-pane label="结构分析" name="structure">
          <div class="structure-analysis">
            <el-tree
              :data="pageStructure"
              :props="treeProps"
              node-key="id"
              default-expand-all
              @node-click="handleNodeClick"
            >
              <template #default="{ node, data }">
                <span class="tree-node">
                  <el-tag size="small" :type="getNodeTagType(data.type)">
                    {{ data.tag }}
                  </el-tag>
                  <span class="node-text">{{ data.text || data.selector }}</span>
                </span>
              </template>
            </el-tree>
          </div>
        </el-tab-pane>

        <!-- 操作建议 -->
        <el-tab-pane label="操作建议" name="suggestions">
          <div class="suggestions-list">
            <div 
              v-for="(suggestion, index) in actionSuggestions"
              :key="index"
              class="suggestion-item"
            >
              <div class="suggestion-header">
                <UnifiedIcon name="default" />
                <span class="suggestion-title">{{ suggestion.title }}</span>
                <el-tag :type="suggestion.priority === 'high' ? 'danger' : 'info'">
                  {{ suggestion.priority === 'high' ? '高优先级' : '普通' }}
                </el-tag>
              </div>
              <p class="suggestion-description">{{ suggestion.description }}</p>
              <div class="suggestion-actions">
                <el-button size="small" @click="applySuggestion(suggestion)">
                  应用建议
                </el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-if="!screenshotData && !analyzing">
      <el-empty description="暂无截图数据">
        <el-button type="primary" @click="captureNew">
          <UnifiedIcon name="default" />
          开始截图
        </el-button>
      </el-empty>
    </div>

    <!-- 加载状态 -->
    <div class="loading-state" v-if="analyzing">
      <el-loading 
        element-loading-text="正在分析截图..." 
        element-loading-background="var(--white-alpha-80)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick, defineEmits, defineExpose } from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
import {
  Camera,
  Search,
  Delete,
  ZoomIn,
  ZoomOut,
  RefreshRight,
  DocumentCopy,
  Position,
  Edit,
  Guide
} from '@element-plus/icons-vue'
import { useScreenshotAnalysis } from '@/composables/useScreenshotAnalysis'

// 定义 emits
const emit = defineEmits(['element-detected', 'analysis-complete'])

// 组合式API
const {
  captureScreenshot,
  analyzeScreenshot,
  extractText,
  generateSelector
} = useScreenshotAnalysis()

// 响应式数据
const screenshotData = ref<string>('')
const analyzing = ref(false)
const analysisResult = ref<any>(null)
const analysisTime = ref(0)
const selectedElementIndex = ref(-1)
const resultTab = ref('elements')
const zoomLevel = ref(1)
const selectionArea = ref<any>(null)

// 组件引用
const screenshotImageRef = ref<HTMLElement>()

// 分析配置
const analysisConfig = reactive({
  type: 'comprehensive',
  precision: 'standard',
  language: 'auto'
})

// 树形结构配置
const treeProps = {
  children: 'children',
  label: 'text'
}

// 计算属性
const hasScreenshot = computed(() => !!screenshotData.value)

const detectedElements = computed(() => {
  return analysisResult.value?.elements || []
})

const extractedText = computed(() => {
  return analysisResult.value?.text || ''
})

const pageStructure = computed(() => {
  return analysisResult.value?.structure || []
})

const actionSuggestions = computed(() => {
  return analysisResult.value?.suggestions || []
})

// 方法定义
const captureNew = async () => {
  try {
    const screenshot = await captureScreenshot()
    screenshotData.value = screenshot
    analysisResult.value = null
    selectedElementIndex.value = -1
    ElMessage.success('截图获取成功')
  } catch (error) {
    ElMessage.error('截图失败：' + error.message)
  }
}

const startAnalysis = async () => {
  if (!screenshotData.value) {
    ElMessage.warning('请先获取截图')
    return
  }

  try {
    analyzing.value = true
    const startTime = Date.now()
    
    const result = await analyzeScreenshot(screenshotData.value, analysisConfig)
    
    analysisResult.value = result
    analysisTime.value = Date.now() - startTime
    
    emit('element-detected', detectedElements.value)
    emit('analysis-complete', result)
    
    ElMessage.success(`分析完成，检测到 ${detectedElements.value.length} 个元素`)
  } catch (error) {
    ElMessage.error('分析失败：' + error.message)
  } finally {
    analyzing.value = false
  }
}

const clearAnalysis = () => {
  analysisResult.value = null
  selectedElementIndex.value = -1
  selectionArea.value = null
  ElMessage.success('分析结果已清空')
}

// 图片操作
const handleImageLoad = () => {
  resetZoom()
}

const handleImageClick = (event: MouseEvent) => {
  const rect = (event.target as HTMLElement).getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  // 创建选择区域
  startSelection(x, y)
}

const startSelection = (x: number, y: number) => {
  selectionArea.value = {
    x,
    y,
    width: 0,
    height: 0
  }
}

const zoomIn = () => {
  if (zoomLevel.value < 3) {
    zoomLevel.value += 0.25
  }
}

const zoomOut = () => {
  if (zoomLevel.value > 0.5) {
    zoomLevel.value -= 0.25
  }
}

const resetZoom = () => {
  zoomLevel.value = 1
}

// 元素操作
const selectElement = (element: any) => {
  const index = detectedElements.value.indexOf(element)
  selectElementFromList(element, index)
}

const selectElementFromList = (element: any, index: number) => {
  selectedElementIndex.value = index
  highlightElement(element)
}

const highlightElement = (element: any) => {
  // 高亮显示元素
  console.log('高亮元素:', element)
}

const unhighlightElement = (element: any) => {
  // 取消高亮
  console.log('取消高亮:', element)
}

const generateActions = (element: any) => {
  // 生成操作建议
  const actions = []
  
  if (element.type === 'button') {
    actions.push({ type: 'click', description: '点击按钮' })
  } else if (element.type === 'input') {
    actions.push({ type: 'fill', description: '填写内容' })
  } else if (element.type === 'link') {
    actions.push({ type: 'click', description: '点击链接' })
  }
  
  ElMessage.info(`为 ${getElementTypeLabel(element.type)} 生成了 ${actions.length} 个操作建议`)
}

// 工具方法
const getElementStyle = (element: any) => {
  return {
    left: `${element.bbox.x}px`,
    top: `${element.bbox.y}px`,
    width: `${element.bbox.width}px`,
    height: `${element.bbox.height}px`,
    transform: `scale(${zoomLevel.value})`
  }
}

const getSelectionStyle = (selection: any) => {
  return {
    left: `${selection.x}px`,
    top: `${selection.y}px`,
    width: `${selection.width}px`,
    height: `${selection.height}px`
  }
}

const getElementTypeLabel = (type: string) => {
  const typeMap = {
    button: '按钮',
    input: '输入框',
    link: '链接',
    text: '文本',
    image: '图片',
    form: '表单',
    div: '容器',
    span: '行内元素',
    h1: '标题1',
    h2: '标题2',
    h3: '标题3'
  }
  return typeMap[type] || type
}

const getElementTagType = (type: string) => {
  const tagTypeMap = {
    button: 'primary',
    input: 'success',
    link: 'warning',
    text: 'info',
    image: 'danger'
  }
  return tagTypeMap[type] || 'info'
}

const getNodeTagType = (type: string) => {
  return getElementTagType(type)
}

const copySelector = async (selector: string) => {
  try {
    await navigator.clipboard.writeText(selector)
    ElMessage.success('选择器已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const copyText = async () => {
  try {
    await navigator.clipboard.writeText(extractedText.value)
    ElMessage.success('文本已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const downloadText = () => {
  const blob = new Blob([extractedText.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `extracted-text-${Date.now()}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

const handleNodeClick = (data: any) => {
  console.log('节点点击:', data)
}

const applySuggestion = (suggestion: any) => {
  ElMessage.info(`应用建议: ${suggestion.title}`)
}

// 暴露的方法
const startExtractionMode = () => {
  analysisConfig.type = 'text'
  if (screenshotData.value) {
    startAnalysis()
  }
}

// 暴露方法给父组件
defineExpose({
  startExtractionMode,
  captureNew,
  startAnalysis
})
</script>

<style lang="scss" scoped>
.screenshot-analysis {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--text-lg);
}

.analysis-panel {
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

  .analysis-config {
    :deep(.el-form-item__label) {
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }
  }
}

.screenshot-container {
  flex: 1;
  background: white;
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--spacing-sm);
  padding: var(--text-lg);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap;

  .screenshot-wrapper {
    height: 100%;
    display: flex;
    flex-direction: column;

    .screenshot-image-container {
      flex: 1;
      position: relative;
      overflow: auto;
      border: var(--border-width-base) solid #eee;
      border-radius: var(--spacing-xs);

      .screenshot-image {
        max-width: 100%;
        height: auto;
        display: block;
        transform-origin: top left;
        transition: transform 0.3s ease;
      }

      .annotation-layer {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;

        .element-annotation {
          position: absolute;
          border: 2px solid;
          pointer-events: all;
          cursor: pointer;
          transition: all 0.3s ease;

          &.type-button {
            border-color: var(--primary-color);
          }

          &.type-input {
            border-color: var(--success-color);
          }

          &.type-link {
            border-color: var(--warning-color);
          }

          &.type-text {
            border-color: var(--info-color);
          }

          &:hover {
            border-width: auto;
            box-shadow: 0 0 10px var(--shadow-heavy);

            .element-label {
              opacity: 1;
            }
          }

          .element-label {
            position: absolute;
            top: -var(--text-3xl);
            left: 0;
            background: var(--black-alpha-80);
            color: white;
            padding: var(--spacing-sm) 6px;
            border-radius: var(--radius-xs);
            font-size: var(--text-xs);
            white-space: nowrap;
            opacity: 0;
            transition: opacity 0.3s ease;

            .element-confidence {
              margin-left: var(--spacing-xs);
              opacity: 0.8;
            }
          }

          .element-tooltip {
            position: absolute;
            bottom: -var(--text-3xl);
            left: 0;
            background: var(--black-alpha-80);
            color: white;
            padding: var(--spacing-sm) 6px;
            border-radius: var(--radius-xs);
            font-size: var(--text-xs);
            max-max-max-width: 200px; width: 100%; width: 100%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }

      .selection-area {
        position: absolute;
        border: 2px dashed var(--primary-color);
        background: rgba(64, 158, 255, 0.1);
        pointer-events: none;

        .selection-info {
          position: absolute;
          top: -var(--text-3xl);
          left: 0;
          background: var(--primary-color);
          color: white;
          padding: var(--spacing-sm) 6px;
          border-radius: var(--radius-xs);
          font-size: var(--text-xs);
        }
      }
    }

    .image-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: var(--spacing-sm);
      padding: var(--spacing-sm) 0;

      .zoom-level {
        font-size: var(--text-sm);
        color: var(--text-secondary);
      }
    }
  }
}

.results-panel {
  background: white;
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--spacing-sm);
  padding: var(--text-lg);
  max-min-height: 60px; height: auto;
  overflow: hidden;

  .results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--text-lg);

    h4 {
      margin: 0;
      color: var(--text-primary);
    }

    .results-stats {
      display: flex;
      gap: var(--spacing-sm);
    }
  }

  .result-tabs {
    height: calc(100% - 60px);

    :deep(.el-tabs__content) {
      height: calc(100% - 40px);
      overflow: auto;
    }
  }
}

.elements-list {
  .element-item {
    border: var(--border-width-base) solid var(--border-color);
    border-radius: var(--radius-md);
    padding: var(--text-sm);
    margin-bottom: var(--spacing-sm);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      border-color: var(--primary-color);
      background: var(--bg-light);
    }

    &.selected {
      border-color: var(--primary-color);
      background: var(--primary-light);
    }

    .element-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-sm);

      .element-confidence {
        font-size: var(--text-sm);
        color: var(--text-secondary);
      }
    }

    .element-content {
      margin-bottom: var(--spacing-sm);

      p {
        margin: var(--spacing-xs) 0;
        font-size: var(--text-sm);

        strong {
          color: var(--text-primary);
        }

        code {
          background: var(--bg-light);
          padding: var(--spacing-sm) var(--spacing-xs);
          border-radius: var(--radius-xs);
          font-size: var(--text-xs);
        }
      }

      .element-properties {
        .property-tag {
          margin: var(--spacing-sm) var(--spacing-xs) 2px 0;
        }
      }
    }

    .element-actions {
      display: flex;
      gap: var(--spacing-sm);
    }
  }
}

.text-content {
  .text-actions {
    margin-top: var(--text-sm);
    display: flex;
    gap: var(--spacing-sm);
  }
}

.structure-analysis {
  max-min-height: 60px; height: auto;
  overflow: auto;

  .tree-node {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);

    .node-text {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 200px;
    }
  }
}

.suggestions-list {
  .suggestion-item {
    border: var(--border-width-base) solid var(--border-color);
    border-radius: var(--radius-md);
    padding: var(--text-sm);
    margin-bottom: var(--text-sm);

    .suggestion-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-sm);

      .suggestion-title {
        font-weight: 600;
        color: var(--text-primary);
      }
    }

    .suggestion-description {
      margin: 0 0 var(--spacing-sm) 0;
      color: var(--text-secondary);
      font-size: var(--text-base);
    }

    .suggestion-actions {
      display: flex;
      gap: var(--spacing-sm);
    }
  }
}

.empty-state,
.loading-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>