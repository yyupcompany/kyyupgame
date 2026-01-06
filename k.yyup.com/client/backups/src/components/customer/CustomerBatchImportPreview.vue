<template>
  <el-dialog
    v-model="visible"
    title="批量导入预览"
    width="90%"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>

    <!-- 预览内容 -->
    <div v-else class="preview-container">
      <!-- 数据统计卡片 -->
      <div class="stats-cards">
        <div class="stat-card total">
          <div class="stat-value">{{ preview?.totalRows || 0 }}</div>
          <div class="stat-label">总数据条数</div>
        </div>
        <div class="stat-card valid">
          <div class="stat-value">{{ preview?.validRows || 0 }}</div>
          <div class="stat-label">有效数据</div>
        </div>
        <div class="stat-card invalid">
          <div class="stat-value">{{ preview?.invalidRows || 0 }}</div>
          <div class="stat-label">无效数据</div>
        </div>
        <div class="stat-card rate">
          <div class="stat-value">{{ validRate }}%</div>
          <div class="stat-label">有效率</div>
        </div>
      </div>

      <!-- 字段映射表 -->
      <div class="section">
        <h3>📋 字段映射关系</h3>
        <el-table :data="preview?.fieldMappings || []" stripe size="small" max-height="300">
          <el-table-column prop="excelColumn" label="Excel列" width="150" />
          <el-table-column prop="dbField" label="数据库字段" width="150" />
          <el-table-column prop="confidence" label="置信度" width="100">
            <template #default="{ row }">
              <el-progress :percentage="Math.round(row.confidence * 100)" :color="getConfidenceColor(row.confidence)" />
            </template>
          </el-table-column>
          <el-table-column prop="willImport" label="是否导入" width="100">
            <template #default="{ row }">
              <el-tag :type="row.willImport ? 'success' : 'info'">
                {{ row.willImport ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="reason" label="说明" show-overflow-tooltip />
        </el-table>
      </div>

      <!-- 将被导入的字段 -->
      <div class="section">
        <h3>✅ 将被导入的字段</h3>
        <div class="field-list">
          <el-tag v-for="field in preview?.importedFields" :key="field" type="success" effect="light">
            {{ field }}
          </el-tag>
        </div>
      </div>

      <!-- 不会被导入的字段 -->
      <div v-if="preview?.skippedFields?.length" class="section">
        <h3>❌ 不会被导入的字段</h3>
        <el-alert
          v-for="item in preview?.skippedFields"
          :key="item.field"
          :title="`${item.field}: ${item.reason}`"
          type="warning"
          :closable="false"
          style="margin-bottom: var(--spacing-2xl)"
        />
      </div>

      <!-- 数据预览 -->
      <div class="section">
        <h3>🔍 数据预览（前5条）</h3>
        <el-table :data="preview?.preview || []" stripe size="small" max-height="300">
          <el-table-column
            v-for="(value, key) in (preview?.preview?.[0] || {})"
            :key="key"
            :prop="key"
            :label="key"
            show-overflow-tooltip
          />
        </el-table>
      </div>

      <!-- 警告信息 -->
      <div v-if="preview?.warnings?.length" class="section">
        <el-alert
          v-for="(warning, idx) in preview?.warnings"
          :key="idx"
          :title="warning"
          type="warning"
          :closable="false"
          style="margin-bottom: var(--spacing-2xl)"
        />
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="importing" @click="handleConfirm">
        确认导入
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { request } from '@/utils/request'

interface FieldMapping {
  excelColumn: string
  dbField: string
  confidence: number
  willImport: boolean
  reason?: string
}

interface PreviewData {
  totalRows: number
  validRows: number
  invalidRows: number
  fieldMappings: FieldMapping[]
  importedFields: string[]
  skippedFields: Array<{ field: string; reason: string }>
  preview: any[]
  warnings: string[]
}

const visible = ref(false)
const loading = ref(false)
const importing = ref(false)
const preview = ref<PreviewData | null>(null)
const fileBuffer = ref<Buffer | null>(null)

const validRate = computed(() => {
  if (!preview.value || preview.value.totalRows === 0) return 0
  return Math.round((preview.value.validRows / preview.value.totalRows) * 100)
})

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 0.9) return 'var(--success-color)'
  if (confidence >= 0.7) return 'var(--warning-color)'
  return 'var(--danger-color)'
}

const openPreview = async (file: File) => {
  try {
    loading.value = true
    visible.value = true

    const formData = new FormData()
    formData.append('file', file)

    const response = await request.post('/api/batch-import/customer-preview', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (response.data?.success) {
      preview.value = response.data.data
      ElMessage.success('预览数据加载成功')
    } else {
      ElMessage.error(response.data?.message || '预览失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '预览失败')
  } finally {
    loading.value = false
  }
}

const handleConfirm = async () => {
  try {
    importing.value = true
    // TODO: 调用导入API
    ElMessage.success('导入成功')
    visible.value = false
  } catch (error: any) {
    ElMessage.error(error.message || '导入失败')
  } finally {
    importing.value = false
  }
}

const handleClose = () => {
  visible.value = false
  preview.value = null
}

defineExpose({
  openPreview
})
</script>

<style scoped lang="scss">
.loading-container {
  padding: var(--text-2xl);
}

.preview-container {
  padding: var(--text-2xl);
  max-height: 70vh;
  overflow-y: auto;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-4xl);
  margin-bottom: var(--spacing-8xl);

  .stat-card {
    padding: var(--text-2xl);
    border-radius: var(--spacing-sm);
    text-align: center;
    color: white;

    .stat-value {
      font-size: var(--text-3xl);
      font-weight: bold;
      margin-bottom: var(--spacing-2xl);
    }

    .stat-label {
      font-size: var(--text-base);
      opacity: 0.9;
    }

    &.total {
      background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
    }

    &.valid {
      background: linear-gradient(135deg, var(--success-color) 0%, var(--success-light) 100%);
    }

    &.invalid {
      background: linear-gradient(135deg, var(--danger-color) 0%, var(--danger-light) 100%);
    }

    &.rate {
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
    }
  }
}

.section {
  margin-bottom: var(--spacing-8xl);

  h3 {
    margin-bottom: var(--spacing-4xl);
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--text-primary);
  }

  .field-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-2xl);
  }
}
</style>

