<template>
  <div class="data-import-workflow">
    <el-card class="workflow-card">
      <template #header>
        <div class="card-header">
          <h3>数据导入工作流</h3>
          <el-tag :type="getStatusType(currentStep)">
            {{ getStepName(currentStep) }}
          </el-tag>
        </div>
      </template>

      <!-- 步骤指示器 -->
      <el-steps :active="currentStep" finish-status="success" class="workflow-steps">
        <el-step title="权限验证" description="检查导入权限"></el-step>
        <el-step title="文件上传" description="上传数据文件"></el-step>
        <el-step title="数据解析" description="解析文件内容"></el-step>
        <el-step title="字段映射" description="配置字段映射"></el-step>
        <el-step title="数据预览" description="预览导入数据"></el-step>
        <el-step title="执行导入" description="批量插入数据"></el-step>
        <el-step title="完成" description="查看导入结果"></el-step>
      </el-steps>

      <!-- 步骤内容 -->
      <div class="step-content">
        <!-- 步骤1: 权限验证 -->
        <div v-if="currentStep === 0" class="step-panel">
          <PermissionCheck
            @permission-checked="handlePermissionChecked"
            @error="handleError"
          />
        </div>

        <!-- 步骤2: 文件上传 -->
        <div v-if="currentStep === 1" class="step-panel">
          <FileUpload
            :import-type="importType"
            @file-uploaded="handleFileUploaded"
            @error="handleError"
          />
        </div>

        <!-- 步骤3: 数据解析 -->
        <div v-if="currentStep === 2" class="step-panel">
          <DataParser
            :file-path="filePath"
            :import-type="importType"
            @data-parsed="handleDataParsed"
            @error="handleError"
          />
        </div>

        <!-- 步骤4: 字段映射 -->
        <div v-if="currentStep === 3" class="step-panel">
          <FieldMapping
            :document-fields="documentFields"
            :import-type="importType"
            @mapping-configured="handleMappingConfigured"
            @error="handleError"
          />
        </div>

        <!-- 步骤5: 数据预览 -->
        <div v-if="currentStep === 4" class="step-panel">
          <DataPreview
            :data="parsedData"
            :field-mappings="fieldMappings"
            :import-type="importType"
            @preview-confirmed="handlePreviewConfirmed"
            @back="currentStep = 3"
            @error="handleError"
          />
        </div>

        <!-- 步骤6: 执行导入 -->
        <div v-if="currentStep === 5" class="step-panel">
          <ImportExecution
            :data="validatedData"
            :field-mappings="fieldMappings"
            :import-type="importType"
            @import-completed="handleImportCompleted"
            @error="handleError"
          />
        </div>

        <!-- 步骤7: 完成 -->
        <div v-if="currentStep === 6" class="step-panel">
          <ImportResult
            :result="importResult"
            @restart="restartWorkflow"
            @close="$emit('close')"
          />
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="workflow-actions">
        <el-button 
          v-if="currentStep > 0 && currentStep < 6" 
          @click="previousStep"
          :disabled="loading"
        >
          上一步
        </el-button>
        
        <el-button 
          v-if="currentStep < 6" 
          type="primary" 
          @click="nextStep"
          :disabled="!canProceed || loading"
          :loading="loading"
        >
          {{ currentStep === 5 ? '执行导入' : '下一步' }}
        </el-button>

        <el-button @click="$emit('close')">
          {{ currentStep === 6 ? '关闭' : '取消' }}
        </el-button>
      </div>
    </el-card>

    <!-- 错误提示 -->
    <el-alert
      v-if="errorMessage"
      :title="errorMessage"
      type="error"
      show-icon
      closable
      @close="errorMessage = ''"
      class="error-alert"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import PermissionCheck from './steps/PermissionCheck.vue'
import FileUpload from './steps/FileUpload.vue'
import DataParser from './steps/DataParser.vue'
import FieldMapping from './steps/FieldMapping.vue'
import DataPreview from './steps/DataPreview.vue'
import ImportExecution from './steps/ImportExecution.vue'
import ImportResult from './steps/ImportResult.vue'
import { useWorkflowTransparency } from '@/utils/workflow-transparency'

// Props
interface Props {
  visible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: false
})

// Emits
const emit = defineEmits<{
  close: []
  completed: [result: any]
}>()

// 响应式数据
const currentStep = ref(0)
const loading = ref(false)
const errorMessage = ref('')

// 工作流数据
const importType = ref('')
const hasPermission = ref(false)
const filePath = ref('')
const parsedData = ref<any[]>([])
const documentFields = ref<string[]>([])
const fieldMappings = ref<any[]>([])
const validatedData = ref<any[]>([])
const importResult = ref<any>(null)

// 🎯 工作流透明度控制
const {
  startDataImportWorkflow,
  endDataImportWorkflow,
  endAllWorkflows
} = useWorkflowTransparency()

// 计算属性
const canProceed = computed(() => {
  switch (currentStep.value) {
    case 0: return hasPermission.value
    case 1: return filePath.value !== ''
    case 2: return parsedData.value.length > 0
    case 3: return fieldMappings.value.length > 0
    case 4: return validatedData.value.length > 0
    case 5: return false // 执行导入步骤不需要手动进行
    default: return false
  }
})

// 方法
const getStatusType = (step: number) => {
  if (step < currentStep.value) return 'success'
  if (step === currentStep.value) return 'primary'
  return 'info'
}

const getStepName = (step: number) => {
  const names = [
    '权限验证', '文件上传', '数据解析', 
    '字段映射', '数据预览', '执行导入', '完成'
  ]
  return names[step] || '未知步骤'
}

const nextStep = () => {
  if (canProceed.value && currentStep.value < 6) {
    currentStep.value++

    // 🎯 在关键步骤启动透明度控制
    if (currentStep.value === 2) { // 数据解析步骤
      startDataImportWorkflow('parsing')
    } else if (currentStep.value === 3) { // 字段映射步骤
      endDataImportWorkflow('parsing')
      startDataImportWorkflow('mapping')
    } else if (currentStep.value === 4) { // 数据预览步骤
      endDataImportWorkflow('mapping')
      startDataImportWorkflow('preview')
    } else if (currentStep.value === 5) { // 执行导入步骤
      endDataImportWorkflow('preview')
      startDataImportWorkflow('execution')
    }
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    // 🎯 返回上一步时结束当前步骤的透明度
    const stepNames = ['', '', 'parsing', 'mapping', 'preview', 'execution'];
    if (stepNames[currentStep.value]) {
      endDataImportWorkflow(stepNames[currentStep.value])
    }

    currentStep.value--

    // 🎯 启动上一步的透明度（如果需要）
    if (currentStep.value >= 2 && stepNames[currentStep.value]) {
      startDataImportWorkflow(stepNames[currentStep.value])
    }
  }
}

const restartWorkflow = () => {
  // 🎯 重启工作流时结束所有透明度状态
  endAllWorkflows()

  currentStep.value = 0
  importType.value = ''
  hasPermission.value = false
  filePath.value = ''
  parsedData.value = []
  documentFields.value = []
  fieldMappings.value = []
  validatedData.value = []
  importResult.value = null
  errorMessage.value = ''
}

// 事件处理
const handlePermissionChecked = (data: any) => {
  importType.value = data.importType
  hasPermission.value = data.hasPermission
  
  if (hasPermission.value) {
    ElMessage.success('权限验证通过')
    nextStep()
  } else {
    ElMessage.error('权限验证失败')
  }
}

const handleFileUploaded = (data: any) => {
  filePath.value = data.filePath
  ElMessage.success('文件上传成功')
  nextStep()
}

const handleDataParsed = (data: any) => {
  parsedData.value = data.data
  documentFields.value = data.fields
  ElMessage.success(`解析成功，共${data.totalRecords}条记录`)
  nextStep()
}

const handleMappingConfigured = (data: any) => {
  fieldMappings.value = data.fieldMappings
  ElMessage.success('字段映射配置完成')
  nextStep()
}

const handlePreviewConfirmed = (data: any) => {
  validatedData.value = data.validRecords
  ElMessage.success(`数据验证完成，${data.validRecords}条记录可导入`)
  nextStep()
}

const handleImportCompleted = (result: any) => {
  // 🎯 导入完成时结束透明度状态
  endDataImportWorkflow('execution')

  importResult.value = result
  ElMessage.success('数据导入完成')
  nextStep()
  emit('completed', result)
}

const handleError = (error: string) => {
  // 🎯 发生错误时结束所有透明度状态
  endAllWorkflows()

  errorMessage.value = error
  loading.value = false
  ElMessage.error(error)
}

// 🎯 生命周期管理
onMounted(() => {
  console.log('🎯 数据导入工作流组件已挂载')
})

onUnmounted(() => {
  // 🎯 组件卸载时确保清理所有透明度状态
  console.log('🎯 数据导入工作流组件卸载，清理透明度状态')
  endAllWorkflows()
})
</script>

<style scoped>
.data-import-workflow {
  max-width: 100%; max-width: 1200px;
  margin: 0 auto;
}

.workflow-card {
  margin-bottom: var(--spacing-xl);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.workflow-steps {
  margin: var(--spacing-8xl) 0;
}

.step-content {
  min-min-height: 60px; height: auto;
  padding: var(--spacing-xl) 0;
}

.step-panel {
  background: var(--bg-gray-light);
  border-radius: var(--spacing-sm);
  padding: var(--spacing-xl);
  min-min-height: 60px; height: auto;
}

.workflow-actions {
  display: flex;
  justify-content: center;
  gap: var(--text-sm);
  padding: var(--spacing-xl) 0;
  border-top: var(--z-index-dropdown) solid #ebeef5;
  margin-top: var(--spacing-xl);
}

.error-alert {
  margin-top: var(--spacing-xl);
}

@media (max-width: var(--breakpoint-md)) {
  .workflow-steps {
    margin: var(--spacing-xl) 0;
  }
  
  .step-content {
    min-min-height: 60px; height: auto;
  }
  
  .step-panel {
    padding: var(--spacing-4xl);
    min-min-height: 60px; height: auto;
  }
}
</style>
