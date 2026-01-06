<template>
  <div class="task-template-editor">
    <!-- 模板基本信息 -->
    <div class="template-basic-info">
      <el-form :model="templateForm" :rules="templateRules" ref="templateFormRef" label-position="top">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="模板名称" prop="name">
              <el-input v-model="templateForm.name" placeholder="请输入模板名称" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="分类" prop="category">
              <el-select v-model="templateForm.category" placeholder="选择分类">
                <el-option label="网页操作" value="web" />
                <el-option label="表单处理" value="form" />
                <el-option label="数据提取" value="data" />
                <el-option label="自动化测试" value="test" />
                <el-option label="自定义" value="custom" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="复杂度" prop="complexity">
              <el-select v-model="templateForm.complexity" placeholder="选择复杂度">
                <el-option label="简单" value="simple" />
                <el-option label="中等" value="medium" />
                <el-option label="复杂" value="complex" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="模板描述" prop="description">
          <el-input 
            v-model="templateForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="请描述这个模板的用途和使用场景"
          />
        </el-form-item>
      </el-form>
    </div>

    <!-- 模板配置 -->
    <div class="template-configuration">
      <h4>模板配置</h4>
      <el-form :model="templateForm.config" label-position="top" size="small">
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="执行模式">
              <el-select v-model="templateForm.config.executionMode">
                <el-option label="顺序执行" value="sequential" />
                <el-option label="并行执行" value="parallel" />
                <el-option label="条件执行" value="conditional" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="失败处理">
              <el-select v-model="templateForm.config.errorHandling">
                <el-option label="立即停止" value="stop" />
                <el-option label="继续执行" value="continue" />
                <el-option label="重试执行" value="retry" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="超时时间(秒)">
              <el-input-number 
                v-model="templateForm.config.timeout" 
                :min="1" 
                :max="3600"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item>
              <el-checkbox v-model="templateForm.config.enableLogging">启用详细日志</el-checkbox>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item>
              <el-checkbox v-model="templateForm.config.screenshotOnError">错误时自动截图</el-checkbox>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item>
              <el-checkbox v-model="templateForm.config.allowParameterization">允许参数化</el-checkbox>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- 参数定义 -->
    <div class="template-parameters" v-if="templateForm.config.allowParameterization">
      <div class="parameters-header">
        <h4>参数定义</h4>
        <el-button @click="addParameter" type="primary" size="small">
          <el-icon><Plus /></el-icon>
          添加参数
        </el-button>
      </div>
      
      <div class="parameters-list">
        <div 
          v-for="(param, index) in templateForm.parameters"
          :key="param.id || index"
          class="parameter-item"
        >
          <el-form :model="param" label-position="top" size="small">
            <el-row :gutter="12">
              <el-col :span="6">
                <el-form-item label="参数名">
                  <el-input v-model="param.name" placeholder="参数名称" />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="类型">
                  <el-select v-model="param.type">
                    <el-option label="文本" value="string" />
                    <el-option label="数字" value="number" />
                    <el-option label="布尔" value="boolean" />
                    <el-option label="URL" value="url" />
                    <el-option label="选择器" value="selector" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="默认值">
                  <el-input v-model="param.defaultValue" placeholder="默认值" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="描述">
                  <el-input v-model="param.description" placeholder="参数说明" />
                </el-form-item>
              </el-col>
              <el-col :span="2">
                <el-form-item label=" ">
                  <el-button @click="removeParameter(index)" size="small" type="danger">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="12">
              <el-col :span="6">
                <el-checkbox v-model="param.required">必填参数</el-checkbox>
              </el-col>
              <el-col :span="18">
                <el-form-item label="验证规则" v-if="param.type === 'string'">
                  <el-input v-model="param.validation" placeholder="正则表达式验证" />
                </el-form-item>
                <el-form-item label="取值范围" v-else-if="param.type === 'number'">
                  <el-input-number v-model="param.min" placeholder="最小值" size="small" style="width: 120px;" />
                  <span style="margin: 0 var(--spacing-sm);">到</span>
                  <el-input-number v-model="param.max" placeholder="最大值" size="small" style="width: 120px;" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
      </div>
    </div>

    <!-- 模板步骤 -->
    <div class="template-steps">
      <div class="steps-header">
        <h4>模板步骤</h4>
        <div class="steps-actions">
          <el-button @click="addTemplateStep" type="primary" size="small">
            <el-icon><Plus /></el-icon>
            添加步骤
          </el-button>
          <el-button @click="importStepsFromFile" size="small">
            <el-icon><Upload /></el-icon>
            导入步骤
          </el-button>
          <el-button @click="generateStepsFromAI" size="small">
            <el-icon><MagicStick /></el-icon>
            AI生成
          </el-button>
        </div>
      </div>

      <div class="steps-list">
        <draggable 
          v-model="templateForm.steps" 
          group="template-steps" 
          @start="dragStart" 
          @end="dragEnd"
          item-key="id"
        >
          <template #item="{ element: step, index }">
            <div class="template-step-item" :class="{ 'editing': editingStepIndex === index }">
              <div class="step-header">
                <div class="step-number">{{ index + 1 }}</div>
                <div class="step-summary">
                  <span class="step-title">{{ step.name || getStepActionText(step.action) }}</span>
                  <span class="step-description">{{ step.description || getStepTargetText(step) }}</span>
                </div>
                <div class="step-controls">
                  <el-button @click="editTemplateStep(index)" size="small" text>
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button @click="duplicateTemplateStep(index)" size="small" text>
                    <el-icon><CopyDocument /></el-icon>
                  </el-button>
                  <el-button @click="deleteTemplateStep(index)" size="small" text type="danger">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                  <el-icon class="drag-handle"><Menu /></el-icon>
                </div>
              </div>

              <!-- 步骤详细编辑 -->
              <div class="step-editor" v-if="editingStepIndex === index">
                <el-form :model="step" label-position="top" size="small">
                  <el-row :gutter="16">
                    <el-col :span="8">
                      <el-form-item label="步骤名称">
                        <el-input v-model="step.name" placeholder="步骤名称" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="操作类型">
                        <el-select v-model="step.action" @change="handleStepActionChange(step)">
                          <el-option label="点击" value="click" />
                          <el-option label="输入文本" value="input" />
                          <el-option label="悬停" value="hover" />
                          <el-option label="滚动" value="scroll" />
                          <el-option label="等待" value="wait" />
                          <el-option label="导航" value="navigate" />
                          <el-option label="提取数据" value="extract" />
                          <el-option label="执行脚本" value="script" />
                          <el-option label="条件判断" value="condition" />
                          <el-option label="循环" value="loop" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="目标元素/条件">
                        <el-input 
                          v-model="step.selector" 
                          placeholder="CSS选择器、XPath或条件表达式"
                        >
                          <template #append>
                            <el-button @click="selectElementForStep(step)" icon="Aim" />
                          </template>
                        </el-input>
                      </el-form-item>
                    </el-col>
                  </el-row>

                  <!-- 动态字段根据操作类型显示 -->
                  <component 
                    :is="getStepConfigComponent(step.action)"
                    v-model="step"
                    :parameters="templateForm.parameters"
                  />

                  <el-form-item label="步骤描述">
                    <el-input 
                      v-model="step.description" 
                      placeholder="描述这个步骤的作用和目的"
                    />
                  </el-form-item>

                  <el-row :gutter="16">
                    <el-col :span="6">
                      <el-form-item>
                        <el-checkbox v-model="step.optional">可选步骤</el-checkbox>
                      </el-form-item>
                    </el-col>
                    <el-col :span="6">
                      <el-form-item>
                        <el-checkbox v-model="step.screenshot">执行后截图</el-checkbox>
                      </el-form-item>
                    </el-col>
                    <el-col :span="6">
                      <el-form-item>
                        <el-checkbox v-model="step.enableParameterization">支持参数化</el-checkbox>
                      </el-form-item>
                    </el-col>
                    <el-col :span="6">
                      <el-form-item label="执行延迟(毫秒)">
                        <el-input-number 
                          v-model="step.delay" 
                          :min="0"
                          :max="10000"
                          :step="100"
                          controls-position="right"
                        />
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-form>

                <div class="step-editor-actions">
                  <el-button @click="saveTemplateStep(index)" type="primary" size="small">保存</el-button>
                  <el-button @click="cancelEditTemplateStep" size="small">取消</el-button>
                </div>
              </div>
            </div>
          </template>
        </draggable>
      </div>

      <!-- 空状态 -->
      <div class="empty-steps" v-if="templateForm.steps.length === 0">
        <el-empty description="暂无步骤">
          <el-button @click="addTemplateStep" type="primary">添加第一个步骤</el-button>
        </el-empty>
      </div>
    </div>

    <!-- 模板预览和验证 -->
    <div class="template-preview">
      <h4>模板预览</h4>
      <div class="preview-content">
        <div class="preview-summary">
          <div class="summary-grid">
            <div class="summary-item">
              <label>模板名称:</label>
              <span>{{ templateForm.name || '未命名模板' }}</span>
            </div>
            <div class="summary-item">
              <label>分类:</label>
              <span>{{ getCategoryText(templateForm.category) }}</span>
            </div>
            <div class="summary-item">
              <label>复杂度:</label>
              <span>{{ getComplexityText(templateForm.complexity) }}</span>
            </div>
            <div class="summary-item">
              <label>步骤数量:</label>
              <span>{{ templateForm.steps.length }}</span>
            </div>
            <div class="summary-item">
              <label>参数数量:</label>
              <span>{{ templateForm.parameters?.length || 0 }}</span>
            </div>
            <div class="summary-item">
              <label>预计耗时:</label>
              <span>{{ estimatedTime }}秒</span>
            </div>
          </div>
        </div>
        <div class="preview-actions">
          <el-button @click="validateTemplate" :loading="validating">
            <el-icon><CircleCheck /></el-icon>
            验证模板
          </el-button>
          <el-button @click="previewTemplate" :loading="previewing">
            <el-icon><View /></el-icon>
            预览执行
          </el-button>
          <el-button @click="exportTemplate">
            <el-icon><Download /></el-icon>
            导出模板
          </el-button>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="editor-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button @click="saveAsDraft">保存为草稿</el-button>
      <el-button @click="handleSave" type="primary">保存模板</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, defineProps, defineEmits, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Plus,
  Upload,
  MagicStick,
  Edit,
  Delete,
  CopyDocument,
  Menu,
  CircleCheck,
  View,
  Download
} from '@element-plus/icons-vue'
import draggable from 'vuedraggable'

// 动态组件导入
const StepConfigComponents = {
  ClickStepConfig: () => import('./step-configs/ClickStepConfig.vue'),
  InputStepConfig: () => import('./step-configs/InputStepConfig.vue'),
  NavigateStepConfig: () => import('./step-configs/NavigateStepConfig.vue'),
  ExtractStepConfig: () => import('./step-configs/ExtractStepConfig.vue'),
  ConditionStepConfig: () => import('./step-configs/ConditionStepConfig.vue'),
  LoopStepConfig: () => import('./step-configs/LoopStepConfig.vue'),
  DefaultStepConfig: () => import('./step-configs/DefaultStepConfig.vue')
}

// Props
const props = defineProps<{
  task?: any
}>()

// Emits
const emit = defineEmits(['task-saved', 'task-cancelled'])

// 响应式数据
const templateFormRef = ref()
const editingStepIndex = ref(-1)
const validating = ref(false)
const previewing = ref(false)

// 表单数据
const templateForm = reactive({
  id: '',
  name: '',
  description: '',
  category: 'web',
  complexity: 'simple',
  config: {
    executionMode: 'sequential',
    errorHandling: 'stop',
    timeout: 60,
    enableLogging: true,
    screenshotOnError: true,
    allowParameterization: false
  },
  parameters: [],
  steps: [],
  version: '1.0.0',
  status: 'draft'
})

// 表单验证规则
const templateRules = {
  name: [
    { required: true, message: '请输入模板名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  complexity: [
    { required: true, message: '请选择复杂度', trigger: 'change' }
  ]
}

// 计算属性
const estimatedTime = computed(() => {
  let total = 0
  templateForm.steps.forEach(step => {
    total += (step.delay || 0) / 1000
    if (step.action === 'wait') {
      total += (step.waitTime || 1000) / 1000
    } else {
      total += 2 // 默认每步骤2秒
    }
  })
  return Math.ceil(total)
})

// 监听器
watch(() => props.task, (newTask) => {
  if (newTask) {
    Object.assign(templateForm, {
      ...newTask,
      config: { ...templateForm.config, ...newTask.config },
      parameters: newTask.parameters || [],
      steps: newTask.steps || []
    })
  }
}, { immediate: true })

// 方法定义
const addParameter = () => {
  templateForm.parameters.push({
    id: Date.now().toString(),
    name: '',
    type: 'string',
    defaultValue: '',
    description: '',
    required: false,
    validation: ''
  })
}

const removeParameter = (index: number) => {
  templateForm.parameters.splice(index, 1)
}

const addTemplateStep = () => {
  const newStep = {
    id: Date.now().toString(),
    name: '',
    action: 'click',
    selector: '',
    description: '',
    delay: 0,
    optional: false,
    screenshot: false,
    enableParameterization: false
  }
  
  templateForm.steps.push(newStep)
  editTemplateStep(templateForm.steps.length - 1)
}

const editTemplateStep = (index: number) => {
  editingStepIndex.value = index
}

const saveTemplateStep = (index: number) => {
  editingStepIndex.value = -1
  ElMessage.success('步骤已保存')
}

const cancelEditTemplateStep = () => {
  editingStepIndex.value = -1
}

const duplicateTemplateStep = (index: number) => {
  const step = templateForm.steps[index]
  const duplicatedStep = {
    ...step,
    id: Date.now().toString(),
    name: `${step.name} (副本)`
  }
  templateForm.steps.splice(index + 1, 0, duplicatedStep)
  ElMessage.success('步骤已复制')
}

const deleteTemplateStep = (index: number) => {
  templateForm.steps.splice(index, 1)
  if (editingStepIndex.value === index) {
    editingStepIndex.value = -1
  } else if (editingStepIndex.value > index) {
    editingStepIndex.value--
  }
  ElMessage.success('步骤已删除')
}

const handleStepActionChange = (step: any) => {
  // 根据操作类型重置相关字段
  step.selector = ''
  step.text = ''
  step.url = ''
  step.waitTime = 1000
  step.script = ''
}

const getStepConfigComponent = (action: string) => {
  const componentMap = {
    click: 'ClickStepConfig',
    input: 'InputStepConfig',
    navigate: 'NavigateStepConfig',
    extract: 'ExtractStepConfig',
    condition: 'ConditionStepConfig',
    loop: 'LoopStepConfig'
  }
  
  const componentName = componentMap[action] || 'DefaultStepConfig'
  return StepConfigComponents[componentName]
}

const selectElementForStep = (step: any) => {
  // 打开元素选择器
  ElMessage.info('元素选择功能开发中...')
}

const importStepsFromFile = () => {
  ElMessage.info('导入步骤功能开发中...')
}

const generateStepsFromAI = () => {
  ElMessage.info('AI生成步骤功能开发中...')
}

const validateTemplate = async () => {
  try {
    validating.value = true
    
    // 验证表单
    await templateFormRef.value?.validate()
    
    // 验证步骤
    if (templateForm.steps.length === 0) {
      throw new Error('模板至少需要一个步骤')
    }
    
    // 验证参数
    if (templateForm.config.allowParameterization && templateForm.parameters.length > 0) {
      for (let param of templateForm.parameters) {
        if (!param.name) {
          throw new Error('参数名称不能为空')
        }
      }
    }
    
    ElMessage.success('模板验证通过')
  } catch (error) {
    ElMessage.error('模板验证失败：' + error.message)
  } finally {
    validating.value = false
  }
}

const previewTemplate = async () => {
  try {
    previewing.value = true
    await validateTemplate()
    
    ElMessage.info('开始预览模板执行...')
    
    // 这里可以调用API预览执行
    // await previewTemplateAPI(templateForm)
    
    ElMessage.success('模板预览完成')
  } catch (error) {
    ElMessage.error('模板预览失败：' + error.message)
  } finally {
    previewing.value = false
  }
}

const exportTemplate = () => {
  const templateData = {
    ...templateForm,
    exportedAt: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(templateData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `template-${templateForm.name}-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  
  ElMessage.success('模板已导出')
}

const handleSave = async () => {
  try {
    await validateTemplate()
    
    const templateData = {
      ...templateForm,
      updatedAt: new Date().toISOString()
    }
    
    if (!templateData.id) {
      templateData.id = Date.now().toString()
      templateData.createdAt = new Date().toISOString()
    }
    
    emit('task-saved', templateData)
  } catch (error) {
    // 验证失败，不保存
  }
}

const saveAsDraft = () => {
  const templateData = {
    ...templateForm,
    status: 'draft',
    updatedAt: new Date().toISOString()
  }
  
  if (!templateData.id) {
    templateData.id = Date.now().toString()
    templateData.createdAt = new Date().toISOString()
  }
  
  emit('task-saved', templateData)
}

const handleCancel = () => {
  emit('task-cancelled')
}

const dragStart = () => {
  // 拖拽开始
}

const dragEnd = () => {
  // 拖拽结束
}

// 工具函数
const getStepActionText = (action: string) => {
  const actionMap = {
    click: '点击',
    input: '输入',
    hover: '悬停',
    scroll: '滚动',
    wait: '等待',
    navigate: '导航',
    extract: '提取',
    script: '脚本',
    condition: '条件',
    loop: '循环'
  }
  return actionMap[action] || action
}

const getStepTargetText = (step: any) => {
  if (step.selector) return step.selector
  if (step.url) return step.url
  if (step.waitTime) return `${step.waitTime}ms`
  if (step.text) return `"${step.text}"`
  return '未设置'
}

const getCategoryText = (category: string) => {
  const categoryMap = {
    web: '网页操作',
    form: '表单处理',
    data: '数据提取',
    test: '自动化测试',
    custom: '自定义'
  }
  return categoryMap[category] || category
}

const getComplexityText = (complexity: string) => {
  const complexityMap = {
    simple: '简单',
    medium: '中等',
    complex: '复杂'
  }
  return complexityMap[complexity] || complexity
}
</script>

<style lang="scss" scoped>
.task-template-editor {
  .template-basic-info,
  .template-configuration,
  .template-parameters,
  .template-steps,
  .template-preview {
    margin-bottom: var(--text-3xl);
    padding: var(--text-lg);
    background: white;
    border: var(--border-width-base) solid var(--border-color);
    border-radius: var(--spacing-sm);

    h4 {
      margin: 0 0 var(--text-lg) 0;
      color: var(--text-primary);
      font-size: var(--text-lg);
      font-weight: 600;
    }
  }

  .parameters-header,
  .steps-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--text-lg);

    .steps-actions {
      display: flex;
      gap: var(--spacing-sm);
    }
  }

  .parameter-item {
    border: var(--border-width-base) solid var(--border-color);
    border-radius: var(--radius-md);
    padding: var(--text-sm);
    margin-bottom: var(--text-sm);
  }

  .steps-list {
    .template-step-item {
      border: var(--border-width-base) solid var(--border-color);
      border-radius: var(--radius-md);
      margin-bottom: var(--spacing-sm);
      transition: all 0.3s ease;

      &.editing {
        border-color: var(--primary-color);
        box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
      }

      .step-header {
        display: flex;
        align-items: center;
        padding: var(--text-sm);
        cursor: pointer;

        &:hover {
          background: var(--bg-light);
        }

        .step-number {
          width: var(--icon-size); height: var(--icon-size);
          border-radius: var(--radius-full);
          background: var(--primary-color);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: var(--text-base);
          margin-right: var(--text-sm);
          flex-shrink: 0;
        }

        .step-summary {
          flex: 1;
          min-width: 0;

          .step-title {
            display: block;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: var(--spacing-sm);
          }

          .step-description {
            display: block;
            color: var(--text-secondary);
            font-size: var(--text-sm);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        .step-controls {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);

          .drag-handle {
            cursor: move;
            color: var(--text-muted);
            margin-left: var(--spacing-sm);
          }
        }
      }

      .step-editor {
        border-top: var(--border-width-base) solid var(--border-color);
        padding: var(--text-lg);
        background: var(--bg-light);

        .step-editor-actions {
          display: flex;
          gap: var(--spacing-sm);
          margin-top: var(--text-lg);
          padding-top: var(--text-lg);
          border-top: var(--border-width-base) solid var(--border-color);
        }
      }
    }
  }

  .empty-steps {
    text-align: center;
    padding: var(--spacing-10xl) var(--text-2xl);
  }

  .preview-content {
    .preview-summary {
      margin-bottom: var(--text-lg);

      .summary-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: var(--text-sm);

        .summary-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);

          label {
            font-weight: 600;
            color: var(--text-secondary);
            min-width: 80px;
          }

          span {
            color: var(--text-primary);
          }
        }
      }
    }

    .preview-actions {
      display: flex;
      gap: var(--spacing-sm);
    }
  }

  .editor-footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--text-sm);
    padding: var(--text-lg) 0;
    border-top: var(--border-width-base) solid var(--border-color);
  }
}
</style>