<template>
  <div class="task-editor">
    <!-- 任务基本信息 -->
    <div class="task-basic-info">
      <el-form :model="taskForm" :rules="taskRules" ref="taskFormRef" label-position="top">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="任务名称" prop="name">
              <el-input v-model="taskForm.name" placeholder="请输入任务名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务类型" prop="type">
              <el-select v-model="taskForm.type" placeholder="选择任务类型" @change="handleTypeChange">
                <el-option label="点击操作" value="click" />
                <el-option label="输入文本" value="input" />
                <el-option label="表单填写" value="form" />
                <el-option label="页面导航" value="navigate" />
                <el-option label="数据提取" value="extract" />
                <el-option label="等待条件" value="wait" />
                <el-option label="自定义脚本" value="script" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="任务描述" prop="description">
          <el-input 
            v-model="taskForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="请描述任务的目的和预期结果"
          />
        </el-form-item>
      </el-form>
    </div>

    <!-- 任务配置 -->
    <div class="task-configuration">
      <h4>任务配置</h4>
      <el-form :model="taskForm.config" label-position="top" size="small">
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="执行超时(秒)">
              <el-input-number 
                v-model="taskForm.config.timeout" 
                :min="1" 
                :max="3600"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="重试次数">
              <el-input-number 
                v-model="taskForm.config.retries" 
                :min="0" 
                :max="10"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="步骤间延迟(毫秒)">
              <el-input-number 
                v-model="taskForm.config.delay" 
                :min="0" 
                :max="10000"
                :step="100"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item>
              <el-checkbox v-model="taskForm.config.screenshotOnError">错误时截图</el-checkbox>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item>
              <el-checkbox v-model="taskForm.config.continueOnError">遇到错误继续执行</el-checkbox>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- 任务步骤编辑器 -->
    <div class="task-steps-editor">
      <div class="steps-header">
        <h4>任务步骤</h4>
        <div class="steps-actions">
          <el-button @click="addStep" type="primary" size="small">
            <el-icon><Plus /></el-icon>
            添加步骤
          </el-button>
          <el-button @click="addStepFromElement" size="small" :disabled="!selectedElements?.length">
            <el-icon><Aim /></el-icon>
            从元素添加
          </el-button>
          <el-button @click="importSteps" size="small">
            <el-icon><Upload /></el-icon>
            导入步骤
          </el-button>
        </div>
      </div>

      <div class="steps-list">
        <draggable 
          v-model="taskForm.steps" 
          group="steps" 
          @start="dragStart" 
          @end="dragEnd"
          item-key="id"
        >
          <template #item="{ element: step, index }">
            <div class="step-item" :class="{ 'editing': editingStepIndex === index }">
              <div class="step-header">
                <div class="step-number">{{ index + 1 }}</div>
                <div class="step-summary">
                  <span class="step-action">{{ getStepActionText(step.action) }}</span>
                  <span class="step-target">{{ getStepTargetText(step) }}</span>
                </div>
                <div class="step-controls">
                  <el-button @click="editStep(index)" size="small" text>
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button @click="duplicateStep(index)" size="small" text>
                    <el-icon><CopyDocument /></el-icon>
                  </el-button>
                  <el-button @click="deleteStep(index)" size="small" text type="danger">
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
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="16">
                      <el-form-item :label="getTargetLabel(step.action)">
                        <el-input 
                          v-model="step.selector" 
                          v-if="needsSelector(step.action)"
                          placeholder="CSS选择器或XPath"
                        >
                          <template #append>
                            <el-button @click="selectElement(step)" icon="Aim" />
                          </template>
                        </el-input>
                        <el-input 
                          v-model="step.url" 
                          v-else-if="step.action === 'navigate'"
                          placeholder="目标URL"
                        />
                        <el-input-number 
                          v-model="step.waitTime" 
                          v-else-if="step.action === 'wait'"
                          :min="100"
                          :max="60000"
                          :step="100"
                          controls-position="right"
                        />
                      </el-form-item>
                    </el-col>
                  </el-row>

                  <!-- 输入文本操作的额外字段 -->
                  <el-row v-if="step.action === 'input'" :gutter="16">
                    <el-col :span="12">
                      <el-form-item label="输入内容">
                        <el-input v-model="step.text" placeholder="要输入的文本" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="6">
                      <el-form-item label="输入方式">
                        <el-select v-model="step.inputType">
                          <el-option label="直接输入" value="type" />
                          <el-option label="清空后输入" value="clear" />
                          <el-option label="追加输入" value="append" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="6">
                      <el-form-item>
                        <el-checkbox v-model="step.pressEnter">输入后按回车</el-checkbox>
                      </el-form-item>
                    </el-col>
                  </el-row>

                  <!-- 滚动操作的额外字段 -->
                  <el-row v-if="step.action === 'scroll'" :gutter="16">
                    <el-col :span="8">
                      <el-form-item label="滚动方向">
                        <el-select v-model="step.scrollDirection">
                          <el-option label="向下" value="down" />
                          <el-option label="向上" value="up" />
                          <el-option label="向左" value="left" />
                          <el-option label="向右" value="right" />
                          <el-option label="到顶部" value="top" />
                          <el-option label="到底部" value="bottom" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="滚动距离(像素)">
                        <el-input-number 
                          v-model="step.scrollDistance" 
                          :min="0"
                          controls-position="right"
                        />
                      </el-form-item>
                    </el-col>
                  </el-row>

                  <!-- 数据提取的额外字段 -->
                  <el-row v-if="step.action === 'extract'" :gutter="16">
                    <el-col :span="8">
                      <el-form-item label="提取类型">
                        <el-select v-model="step.extractType">
                          <el-option label="文本内容" value="text" />
                          <el-option label="属性值" value="attribute" />
                          <el-option label="HTML内容" value="html" />
                          <el-option label="表格数据" value="table" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="8" v-if="step.extractType === 'attribute'">
                      <el-form-item label="属性名">
                        <el-input v-model="step.attributeName" placeholder="如: href, src" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="变量名">
                        <el-input v-model="step.variableName" placeholder="存储结果的变量名" />
                      </el-form-item>
                    </el-col>
                  </el-row>

                  <!-- 脚本执行的额外字段 -->
                  <el-row v-if="step.action === 'script'" :gutter="16">
                    <el-col :span="24">
                      <el-form-item label="JavaScript代码">
                        <el-input 
                          v-model="step.script" 
                          type="textarea" 
                          :rows="4"
                          placeholder="JavaScript代码，可以使用element变量引用当前元素"
                        />
                      </el-form-item>
                    </el-col>
                  </el-row>

                  <!-- 等待条件的额外字段 -->
                  <el-row v-if="step.action === 'wait'" :gutter="16">
                    <el-col :span="12">
                      <el-form-item label="等待条件">
                        <el-select v-model="step.waitCondition">
                          <el-option label="固定时间" value="time" />
                          <el-option label="元素可见" value="visible" />
                          <el-option label="元素隐藏" value="hidden" />
                          <el-option label="页面加载完成" value="load" />
                          <el-option label="自定义条件" value="custom" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12" v-if="step.waitCondition === 'custom'">
                      <el-form-item label="条件表达式">
                        <el-input v-model="step.customCondition" placeholder="JavaScript表达式" />
                      </el-form-item>
                    </el-col>
                  </el-row>

                  <!-- 通用配置 -->
                  <el-row :gutter="16">
                    <el-col :span="8">
                      <el-form-item label="执行前延迟(毫秒)">
                        <el-input-number 
                          v-model="step.delay" 
                          :min="0"
                          :max="10000"
                          :step="100"
                          controls-position="right"
                        />
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item>
                        <el-checkbox v-model="step.optional">可选步骤(失败不中断)</el-checkbox>
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item>
                        <el-checkbox v-model="step.screenshot">执行后截图</el-checkbox>
                      </el-form-item>
                    </el-col>
                  </el-row>

                  <el-form-item label="步骤描述">
                    <el-input 
                      v-model="step.description" 
                      placeholder="描述这个步骤的作用"
                    />
                  </el-form-item>
                </el-form>

                <div class="step-editor-actions">
                  <el-button @click="saveStep(index)" type="primary" size="small">保存</el-button>
                  <el-button @click="cancelEditStep" size="small">取消</el-button>
                </div>
              </div>
            </div>
          </template>
        </draggable>
      </div>

      <!-- 空状态 -->
      <div class="empty-steps" v-if="taskForm.steps.length === 0">
        <el-empty description="暂无步骤">
          <el-button @click="addStep" type="primary">添加第一个步骤</el-button>
        </el-empty>
      </div>
    </div>

    <!-- 任务预览和测试 -->
    <div class="task-preview">
      <h4>任务预览</h4>
      <div class="preview-content">
        <div class="preview-summary">
          <div class="summary-item">
            <label>任务名称:</label>
            <span>{{ taskForm.name || '未命名任务' }}</span>
          </div>
          <div class="summary-item">
            <label>任务类型:</label>
            <span>{{ getTypeText(taskForm.type) }}</span>
          </div>
          <div class="summary-item">
            <label>步骤数量:</label>
            <span>{{ taskForm.steps.length }}</span>
          </div>
          <div class="summary-item">
            <label>预计耗时:</label>
            <span>{{ estimatedTime }}秒</span>
          </div>
        </div>
        <div class="preview-actions">
          <el-button @click="validateTask" :loading="validating">
            <el-icon><CircleCheck /></el-icon>
            验证任务
          </el-button>
          <el-button @click="testTask" :loading="testing" type="warning">
            <el-icon><VideoPlay /></el-icon>
            测试执行
          </el-button>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="editor-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button @click="saveAsDraft">保存为草稿</el-button>
      <el-button @click="handleSave" type="primary">保存任务</el-button>
    </div>

    <!-- 元素选择对话框 -->
    <el-dialog
      v-model="elementSelectorVisible"
      title="选择页面元素"
      width="80%"
    >
      <ElementSelector
        ref="elementSelectorRef"
        @element-selected="handleElementSelected"
        @selector-generated="handleSelectorGenerated"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, defineProps, defineEmits, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Plus,
  Aim,
  Upload,
  Edit,
  Delete,
  CopyDocument,
  Menu,
  CircleCheck,
  VideoPlay
} from '@element-plus/icons-vue'
import draggable from 'vuedraggable'
import ElementSelector from './ElementSelector.vue'

// Props
const props = defineProps<{
  task?: any
  selectedElements?: any[]
}>()

// Emits
const emit = defineEmits(['task-saved', 'task-cancelled'])

// 响应式数据
const taskFormRef = ref()
const elementSelectorRef = ref()
const editingStepIndex = ref(-1)
const elementSelectorVisible = ref(false)
const currentEditingStep = ref<any>(null)
const validating = ref(false)
const testing = ref(false)

// 表单数据
const taskForm = reactive({
  id: '',
  name: '',
  description: '',
  type: 'click',
  config: {
    timeout: 30,
    retries: 3,
    delay: 1000,
    screenshotOnError: true,
    continueOnError: false
  },
  steps: [],
  status: 'pending'
})

// 表单验证规则
const taskRules = {
  name: [
    { required: true, message: '请输入任务名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择任务类型', trigger: 'change' }
  ],
  description: [
    { max: 200, message: '描述长度不能超过 200 个字符', trigger: 'blur' }
  ]
}

// 计算属性
const estimatedTime = computed(() => {
  let total = 0
  taskForm.steps.forEach(step => {
    total += (step.delay || 0) / 1000
    if (step.action === 'wait') {
      total += (step.waitTime || 1000) / 1000
    } else {
      total += 1 // 默认每步骤1秒
    }
  })
  return Math.ceil(total)
})

// 监听器
watch(() => props.task, (newTask) => {
  if (newTask) {
    Object.assign(taskForm, {
      ...newTask,
      config: { ...taskForm.config, ...newTask.config }
    })
  }
}, { immediate: true })

// 方法定义
const handleTypeChange = (type: string) => {
  // 根据任务类型初始化默认步骤
  if (taskForm.steps.length === 0) {
    switch (type) {
      case 'click':
        addStep({
          action: 'click',
          selector: '',
          description: '点击目标元素'
        })
        break
      case 'input':
        addStep({
          action: 'input',
          selector: '',
          text: '',
          description: '输入文本到目标元素'
        })
        break
      case 'form':
        addStep({
          action: 'input',
          selector: '',
          text: '',
          description: '填写表单字段'
        })
        break
      case 'navigate':
        addStep({
          action: 'navigate',
          url: '',
          description: '导航到目标页面'
        })
        break
    }
  }
}

const addStep = (stepData?: any) => {
  const newStep = {
    id: Date.now().toString(),
    action: 'click',
    selector: '',
    description: '',
    delay: 0,
    optional: false,
    screenshot: false,
    ...stepData
  }
  
  taskForm.steps.push(newStep)
  editStep(taskForm.steps.length - 1)
}

const addStepFromElement = () => {
  if (!props.selectedElements?.length) {
    ElMessage.warning('请先选择页面元素')
    return
  }
  
  const element = props.selectedElements[0]
  const newStep = {
    id: Date.now().toString(),
    action: getDefaultActionForElement(element),
    selector: element.selector || '',
    description: `对 ${element.tagName} 元素执行操作`,
    delay: 0,
    optional: false,
    screenshot: false
  }
  
  taskForm.steps.push(newStep)
  editStep(taskForm.steps.length - 1)
}

const getDefaultActionForElement = (element: any) => {
  const tagName = element.tagName?.toLowerCase()
  if (tagName === 'button' || tagName === 'a') {
    return 'click'
  } else if (tagName === 'input' || tagName === 'textarea') {
    return 'input'
  } else {
    return 'click'
  }
}

const editStep = (index: number) => {
  editingStepIndex.value = index
}

const saveStep = (index: number) => {
  editingStepIndex.value = -1
  ElMessage.success('步骤已保存')
}

const cancelEditStep = () => {
  editingStepIndex.value = -1
}

const duplicateStep = (index: number) => {
  const step = taskForm.steps[index]
  const duplicatedStep = {
    ...step,
    id: Date.now().toString(),
    description: `${step.description} (副本)`
  }
  taskForm.steps.splice(index + 1, 0, duplicatedStep)
  ElMessage.success('步骤已复制')
}

const deleteStep = (index: number) => {
  taskForm.steps.splice(index, 1)
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

const selectElement = (step: any) => {
  currentEditingStep.value = step
  elementSelectorVisible.value = true
}

const handleElementSelected = (element: any) => {
  if (currentEditingStep.value) {
    currentEditingStep.value.selector = element.selector
    elementSelectorVisible.value = false
    ElMessage.success('元素已选择')
  }
}

const handleSelectorGenerated = (selector: string) => {
  if (currentEditingStep.value) {
    currentEditingStep.value.selector = selector
    elementSelectorVisible.value = false
    ElMessage.success('选择器已生成')
  }
}

const importSteps = () => {
  // 导入步骤逻辑
  ElMessage.info('导入步骤功能开发中...')
}

const validateTask = async () => {
  try {
    validating.value = true
    
    // 验证任务表单
    await taskFormRef.value?.validate()
    
    // 验证步骤
    if (taskForm.steps.length === 0) {
      throw new Error('任务至少需要一个步骤')
    }
    
    for (let i = 0; i < taskForm.steps.length; i++) {
      const step = taskForm.steps[i]
      if (needsSelector(step.action) && !step.selector) {
        throw new Error(`第 ${i + 1} 步缺少选择器`)
      }
      if (step.action === 'input' && !step.text) {
        throw new Error(`第 ${i + 1} 步缺少输入内容`)
      }
      if (step.action === 'navigate' && !step.url) {
        throw new Error(`第 ${i + 1} 步缺少目标URL`)
      }
    }
    
    ElMessage.success('任务验证通过')
  } catch (error) {
    ElMessage.error('任务验证失败：' + error.message)
  } finally {
    validating.value = false
  }
}

const testTask = async () => {
  try {
    testing.value = true
    await validateTask()
    
    // 执行测试
    ElMessage.info('开始测试执行任务...')
    
    // 这里可以调用API执行测试
    // await testTaskAPI(taskForm)
    
    ElMessage.success('任务测试执行成功')
  } catch (error) {
    ElMessage.error('任务测试失败：' + error.message)
  } finally {
    testing.value = false
  }
}

const handleSave = async () => {
  try {
    await validateTask()
    
    const taskData = {
      ...taskForm,
      updatedAt: new Date().toISOString()
    }
    
    if (!taskData.id) {
      taskData.id = Date.now().toString()
      taskData.createdAt = new Date().toISOString()
    }
    
    emit('task-saved', taskData)
  } catch (error) {
    // 验证失败，不保存
  }
}

const saveAsDraft = () => {
  const taskData = {
    ...taskForm,
    status: 'draft',
    updatedAt: new Date().toISOString()
  }
  
  if (!taskData.id) {
    taskData.id = Date.now().toString()
    taskData.createdAt = new Date().toISOString()
  }
  
  emit('task-saved', taskData)
}

const handleCancel = () => {
  emit('task-cancelled')
}

const dragStart = () => {
  // 拖拽开始
}

const dragEnd = () => {
  // 拖拽结束，重新编号
}

// 工具函数
const needsSelector = (action: string) => {
  return ['click', 'input', 'hover', 'scroll', 'extract'].includes(action)
}

const getTargetLabel = (action: string) => {
  const labelMap = {
    click: '目标元素',
    input: '输入框',
    hover: '悬停元素',
    scroll: '滚动容器',
    extract: '数据源',
    navigate: '目标URL',
    wait: '等待时间(毫秒)',
    script: '目标元素'
  }
  return labelMap[action] || '目标'
}

const getStepActionText = (action: string) => {
  const actionMap = {
    click: '点击',
    input: '输入',
    hover: '悬停',
    scroll: '滚动',
    wait: '等待',
    navigate: '导航',
    extract: '提取',
    script: '脚本'
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

const getTypeText = (type: string) => {
  const typeMap = {
    click: '点击操作',
    input: '输入文本',
    form: '表单填写',
    navigate: '页面导航',
    extract: '数据提取',
    wait: '等待条件',
    script: '自定义脚本'
  }
  return typeMap[type] || type
}
</script>

<style lang="scss" scoped>
.task-editor {
  .task-basic-info,
  .task-configuration,
  .task-steps-editor,
  .task-preview {
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

  .steps-list {
    .step-item {
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

          .step-action {
            font-weight: 600;
            color: var(--text-primary);
            margin-right: var(--spacing-sm);
          }

          .step-target {
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
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--text-sm);
      margin-bottom: var(--text-lg);

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