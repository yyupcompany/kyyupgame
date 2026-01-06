<template>
  <el-dialog
    v-model="visible"
    title="批量数据导入"
    width="900px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <!-- 步骤指示器 -->
    <el-steps :active="currentStep" finish-status="success" align-center class="import-steps">
      <el-step title="上传文件" />
      <el-step title="预览数据" />
      <el-step title="补充字段" />
      <el-step title="导入完成" />
    </el-steps>

    <!-- 步骤1: 上传文件 -->
    <div v-if="currentStep === 0" class="step-content">
      <div class="upload-section">
        <el-upload
          ref="uploadRef"
          class="upload-dragger"
          drag
          :auto-upload="false"
          :limit="1"
          :on-change="handleFileChange"
          :on-exceed="handleExceed"
          accept=".xlsx,.xls,.csv"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持 .xlsx, .xls, .csv 格式，文件大小不超过 10MB
            </div>
          </template>
        </el-upload>

        <!-- 实体类型选择 -->
        <div class="entity-select">
          <el-form-item label="数据类型">
            <el-select v-model="entityType" placeholder="请选择要导入的数据类型">
              <el-option label="学生" value="students" />
              <el-option label="教师" value="teachers" />
              <el-option label="班级" value="classes" />
              <el-option label="活动" value="activities" />
              <el-option label="待办事项" value="todos" />
              <el-option label="家长" value="parents" />
            </el-select>
          </el-form-item>
        </div>

        <!-- 下载模板按钮 -->
        <div class="template-download">
          <el-button type="primary" link @click="downloadTemplate">
            <el-icon><download /></el-icon>
            下载导入模板
          </el-button>
        </div>
      </div>
    </div>

    <!-- 步骤2: 预览数据 -->
    <div v-if="currentStep === 1" class="step-content">
      <div class="preview-summary">
        <el-alert
          :title="`共 ${previewData?.totalRows || 0} 行数据，有效 ${previewData?.validRows || 0} 行，无效 ${previewData?.invalidRows || 0} 行`"
          type="info"
          :closable="false"
        />
      </div>

      <el-table
        :data="previewData?.data || []"
        style="width: 100%; margin-top: var(--text-2xl)"
        max-height="400"
        border
      >
        <el-table-column prop="row" label="行号" width="80" />
        <el-table-column label="数据" min-width="300">
          <template #default="{ row }">
            <div class="data-preview">
              {{ JSON.stringify(row.data) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.errors.length === 0" type="success">有效</el-tag>
            <el-tag v-else type="danger">无效</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="错误信息" min-width="200">
          <template #default="{ row }">
            <div v-if="row.errors.length > 0" class="error-messages">
              <div v-for="(error, index) in row.errors" :key="index" class="error-item">
                {{ error }}
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 步骤3: 补充字段 -->
    <div v-if="currentStep === 2" class="step-content">
      <el-alert
        title="检测到缺失字段，请补充以下信息"
        type="warning"
        :closable="false"
        style="margin-bottom: var(--text-2xl)"
      />

      <el-form :model="supplementData" label-width="120px">
        <el-form-item
          v-for="field in previewData?.missingFields || []"
          :key="field"
          :label="getFieldLabel(field)"
        >
          <el-input
            v-model="supplementData[field]"
            :placeholder="`请输入${getFieldLabel(field)}`"
          />
          
          <!-- 显示推荐值 -->
          <div v-if="hasRecommendations(field)" class="field-recommendations">
            <span class="recommendation-label">推荐值：</span>
            <el-tag
              v-for="(rec, index) in getRecommendations(field)"
              :key="index"
              type="primary"
              effect="plain"
              class="recommendation-tag"
              @click="applyRecommendation(field, rec.value)"
            >
              {{ rec.value }} ({{ rec.percentage }}%)
            </el-tag>
          </div>
        </el-form-item>
      </el-form>
    </div>

    <!-- 步骤4: 导入完成 -->
    <div v-if="currentStep === 3" class="step-content">
      <el-result
        :icon="importResult?.success ? 'success' : 'error'"
        :title="importResult?.success ? '导入成功' : '导入失败'"
      >
        <template #sub-title>
          <div class="import-summary">
            <p>总计: {{ importResult?.total || 0 }} 条</p>
            <p>成功: {{ importResult?.succeeded || 0 }} 条</p>
            <p>失败: {{ importResult?.failed || 0 }} 条</p>
          </div>
        </template>
        <template #extra>
          <el-button type="primary" @click="handleClose">完成</el-button>
          <el-button v-if="importResult?.failed > 0" @click="showErrors">查看错误</el-button>
        </template>
      </el-result>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button v-if="currentStep > 0 && currentStep < 3" @click="prevStep">上一步</el-button>
        <el-button
          v-if="currentStep < 2"
          type="primary"
          :loading="loading"
          :disabled="!canProceed"
          @click="nextStep"
        >
          下一步
        </el-button>
        <el-button
          v-if="currentStep === 2"
          type="primary"
          :loading="loading"
          @click="executeImport"
        >
          开始导入
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { UploadInstance, UploadRawFile } from 'element-plus'
import { batchImportApi } from '@/api/modules/batch-import'

// Props
interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}>()

// 响应式数据
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const currentStep = ref(0)
const loading = ref(false)
const uploadRef = ref<UploadInstance>()
const selectedFile = ref<File | null>(null)
const entityType = ref('students')
const previewData = ref<any>(null)
const supplementData = ref<Record<string, any>>({})
const importResult = ref<any>(null)

// 计算属性
const canProceed = computed(() => {
  if (currentStep.value === 0) {
    return selectedFile.value !== null && entityType.value !== ''
  }
  if (currentStep.value === 1) {
    return previewData.value !== null
  }
  return true
})

// 方法
function handleFileChange(file: any) {
  selectedFile.value = file.raw
  console.log('📄 [批量导入] 选择文件:', file.name)
}

function handleExceed() {
  ElMessage.warning('只能上传一个文件')
}

async function downloadTemplate() {
  if (!entityType.value) {
    ElMessage.warning('请先选择数据类型')
    return
  }

  try {
    loading.value = true
    await batchImportApi.downloadTemplate(entityType.value)
    ElMessage.success('模板下载成功')
  } catch (error) {
    console.error('下载模板失败:', error)
    ElMessage.error('下载模板失败')
  } finally {
    loading.value = false
  }
}

async function nextStep() {
  if (currentStep.value === 0) {
    // 上传并预览
    await uploadAndPreview()
  } else if (currentStep.value === 1) {
    // 检查是否有缺失字段
    if (previewData.value?.missingFields?.length > 0) {
      currentStep.value++
    } else {
      // 没有缺失字段，直接导入
      await executeImport()
    }
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

async function uploadAndPreview() {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择文件')
    return
  }

  try {
    loading.value = true
    const result = await batchImportApi.previewImport(selectedFile.value, entityType.value)
    
    if (result.success) {
      previewData.value = result.data
      currentStep.value++
      ElMessage.success('文件解析成功')
    } else {
      ElMessage.error(result.message || '文件解析失败')
    }
  } catch (error: any) {
    console.error('预览失败:', error)
    ElMessage.error(error.message || '预览失败')
  } finally {
    loading.value = false
  }
}

async function executeImport() {
  try {
    loading.value = true
    
    // 合并补充数据到每一行
    const dataToImport = previewData.value.data.map((row: any) => ({
      ...row.data,
      ...supplementData.value
    }))

    const result = await batchImportApi.executeImport(entityType.value, dataToImport)
    
    if (result.success) {
      importResult.value = result.data
      currentStep.value = 3
      
      if (result.data.failed === 0) {
        ElMessage.success('批量导入成功')
        emit('success')
      } else {
        ElMessage.warning(`导入完成，成功 ${result.data.succeeded} 条，失败 ${result.data.failed} 条`)
      }
    } else {
      ElMessage.error(result.message || '导入失败')
    }
  } catch (error: any) {
    console.error('导入失败:', error)
    ElMessage.error(error.message || '导入失败')
  } finally {
    loading.value = false
  }
}

function handleClose() {
  visible.value = false
  // 重置状态
  currentStep.value = 0
  selectedFile.value = null
  previewData.value = null
  supplementData.value = {}
  importResult.value = null
}

function getFieldLabel(fieldName: string): string {
  // 这里可以根据字段名返回中文标签
  const labelMap: Record<string, string> = {
    type: '类型',
    grade: '年级',
    head_teacher_id: '班主任',
    name: '名称',
    code: '编号'
  }
  return labelMap[fieldName] || fieldName
}

function hasRecommendations(field: string): boolean {
  return previewData.value?.recommendations?.[field]?.recommendations?.length > 0
}

function getRecommendations(field: string) {
  return previewData.value?.recommendations?.[field]?.recommendations || []
}

function applyRecommendation(field: string, value: any) {
  supplementData.value[field] = value
  ElMessage.success(`已应用推荐值: ${value}`)
}

function showErrors() {
  const errors = importResult.value?.errors || []
  const errorMessages = errors.map((err: any) => 
    `第 ${err.row} 行: ${err.error}`
  ).join('\n')
  
  ElMessageBox.alert(errorMessages, '导入错误详情', {
    confirmButtonText: '确定',
    type: 'error'
  })
}
</script>

<style scoped lang="scss">
.import-steps {
  margin-bottom: var(--spacing-8xl);
}

.step-content {
  min-height: 400px;
  padding: var(--text-2xl) 0;
}

.upload-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--text-2xl);

  .upload-dragger {
    width: 100%;
  }

  .entity-select {
    width: 300px;
  }

  .template-download {
    margin-top: var(--spacing-2xl);
  }
}

.preview-summary {
  margin-bottom: var(--text-2xl);
}

.data-preview {
  font-size: var(--text-sm);
  color: var(--text-regular);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.error-messages {
  .error-item {
    font-size: var(--text-sm);
    color: var(--danger-color);
    margin-bottom: var(--spacing-xs);
  }
}

.field-recommendations {
  margin-top: var(--spacing-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;

  .recommendation-label {
    font-size: var(--text-sm);
    color: var(--info-color);
  }

  .recommendation-tag {
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 var(--spacing-xs) var(--spacing-sm) var(--shadow-light);
    }
  }
}

.import-summary {
  p {
    margin: var(--spacing-sm) 0;
    font-size: var(--text-base);
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-2xl);
}
</style>

