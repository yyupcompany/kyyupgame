<template>
  <el-dialog
    v-model="visible"
    title="批量导入确认"
    width="80%"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <div class="batch-import-confirm">
      <!-- 操作摘要 -->
      <el-card class="summary-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>📋 导入摘要</span>
          </div>
        </template>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-statistic title="总记录数" :value="confirmationData.data_summary?.total_records || 0" />
          </el-col>
          <el-col :span="6">
            <el-statistic 
              title="有效记录" 
              :value="confirmationData.data_summary?.valid_records || 0"
              value-style="color: #67C23A"
            />
          </el-col>
          <el-col :span="6">
            <el-statistic 
              title="无效记录" 
              :value="confirmationData.data_summary?.invalid_records || 0"
              value-style="color: #F56C6C"
            />
          </el-col>
          <el-col :span="6">
            <el-statistic 
              title="成功率" 
              :value="confirmationData.data_summary?.success_rate || 0"
              suffix="%"
              value-style="color: #409EFF"
            />
          </el-col>
        </el-row>
      </el-card>

      <!-- 字段映射 -->
      <el-card class="mapping-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>🔗 字段映射</span>
          </div>
        </template>
        <el-table :data="confirmationData.field_mappings || []" style="width: 100%">
          <el-table-column prop="sourceField" label="文档字段" width="200" />
          <el-table-column prop="targetField" label="数据库字段" width="200" />
          <el-table-column prop="confidence" label="置信度" width="120">
            <template #default="scope">
              <el-progress 
                :percentage="Math.round(scope.row.confidence * 100)" 
                :color="getConfidenceColor(scope.row.confidence)"
                :stroke-width="8"
              />
            </template>
          </el-table-column>
          <el-table-column prop="dataType" label="数据类型" width="120">
            <template #default="scope">
              <el-tag :type="getTypeTagType(scope.row.dataType)">
                {{ scope.row.dataType }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="required" label="必填" width="80">
            <template #default="scope">
              <el-icon v-if="scope.row.required" color="#F56C6C">
                <Star />
              </el-icon>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 数据预览 -->
      <el-card class="preview-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>👀 数据预览</span>
            <span class="preview-note">（显示前3条记录）</span>
          </div>
        </template>
        <el-tabs v-model="activeTab">
          <el-tab-pane label="原始数据" name="original">
            <el-table :data="confirmationData.sample_data?.sample_records || []" style="width: 100%">
              <el-table-column 
                v-for="field in confirmationData.sample_data?.original_fields || []"
                :key="field"
                :prop="field"
                :label="field"
                min-width="120"
                show-overflow-tooltip
              />
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="转换后数据" name="transformed">
            <el-table :data="confirmationData.sample_data?.transformed_sample || []" style="width: 100%">
              <el-table-column 
                v-for="(value, key) in (confirmationData.sample_data?.transformed_sample?.[0] || {})"
                :key="key"
                :prop="key"
                :label="key"
                min-width="120"
                show-overflow-tooltip
              />
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-card>

      <!-- 验证错误 -->
      <el-card 
        v-if="confirmationData.validation_errors?.length > 0" 
        class="error-card" 
        shadow="never"
      >
        <template #header>
          <div class="card-header">
            <span>⚠️ 验证错误</span>
            <span class="error-count">（{{ confirmationData.validation_errors.length }} 条）</span>
          </div>
        </template>
        <el-collapse>
          <el-collapse-item 
            v-for="(error, index) in confirmationData.validation_errors.slice(0, 5)"
            :key="index"
            :title="`第 ${error.originalIndex + 1} 行数据`"
          >
            <div class="error-detail">
              <p><strong>原始数据：</strong></p>
              <pre>{{ JSON.stringify(error.originalData, null, 2) }}</pre>
              <p><strong>错误信息：</strong></p>
              <ul>
                <li v-for="err in error.errors" :key="err" class="error-item">
                  {{ err }}
                </li>
              </ul>
            </div>
          </el-collapse-item>
        </el-collapse>
        <div v-if="confirmationData.validation_errors.length > 5" class="more-errors">
          还有 {{ confirmationData.validation_errors.length - 5 }} 条错误未显示...
        </div>
      </el-card>

      <!-- 执行计划 -->
      <el-card class="plan-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>⚡ 执行计划</span>
          </div>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="目标表">
            {{ confirmationData.operation_details?.table_name }}
          </el-descriptions-item>
          <el-descriptions-item label="业务中心">
            {{ confirmationData.operation_details?.business_center }}
          </el-descriptions-item>
          <el-descriptions-item label="API端点">
            {{ confirmationData.operation_details?.api_endpoint }}
          </el-descriptions-item>
          <el-descriptions-item label="批次大小">
            {{ confirmationData.operation_details?.batch_size || 100 }}
          </el-descriptions-item>
          <el-descriptions-item label="预计时间">
            {{ confirmationData.execution_plan?.estimated_time }}
          </el-descriptions-item>
          <el-descriptions-item label="批次数量">
            {{ confirmationData.execution_plan?.batch_count }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button 
          v-if="confirmationData.field_mappings?.length > 0"
          @click="handleAdjustMapping"
        >
          调整映射
        </el-button>
        <el-button 
          type="primary" 
          @click="handleConfirm"
          :disabled="!canConfirm"
          :loading="importing"
        >
          {{ importing ? '导入中...' : '确认导入' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Star } from '@element-plus/icons-vue'

interface Props {
  visible: boolean
  confirmationData: any
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'confirm', data: any): void
  (e: 'cancel'): void
  (e: 'adjust-mapping', data: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const activeTab = ref('original')
const importing = ref(false)

// 计算是否可以确认导入
const canConfirm = computed(() => {
  const validRecords = props.confirmationData.data_summary?.valid_records || 0
  return validRecords > 0
})

// 获取置信度颜色
const getConfidenceColor = (confidence: number) => {
  if (confidence >= 0.9) return '#67C23A'
  if (confidence >= 0.7) return '#E6A23C'
  return '#F56C6C'
}

// 获取数据类型标签类型
const getTypeTagType = (dataType: string) => {
  switch (dataType) {
    case 'string': return ''
    case 'number': return 'success'
    case 'boolean': return 'info'
    case 'date': return 'warning'
    default: return ''
  }
}

// 处理确认导入
const handleConfirm = async () => {
  if (!canConfirm.value) {
    ElMessage.warning('没有有效记录可以导入')
    return
  }

  importing.value = true
  
  try {
    emit('confirm', props.confirmationData)
  } catch (error) {
    console.error('导入确认失败:', error)
    ElMessage.error('导入确认失败')
  } finally {
    importing.value = false
  }
}

// 处理取消
const handleCancel = () => {
  emit('cancel')
  emit('update:visible', false)
}

// 处理调整映射
const handleAdjustMapping = () => {
  emit('adjust-mapping', props.confirmationData)
}
</script>

<style scoped>
.batch-import-confirm {
  max-height: 70vh;
  overflow-y: auto;
}

.summary-card,
.mapping-card,
.preview-card,
.error-card,
.plan-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.preview-note {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: normal;
}

.error-count {
  font-size: 12px;
  color: #F56C6C;
  font-weight: normal;
}

.error-detail {
  padding: 10px;
  background-color: #fef0f0;
  border-radius: var(--spacing-xs);
}

.error-detail pre {
  background-color: #f5f5f5;
  padding: var(--spacing-sm);
  border-radius: var(--spacing-xs);
  font-size: 12px;
  overflow-x: auto;
}

.error-item {
  color: #F56C6C;
  margin: var(--spacing-xs) 0;
}

.more-errors {
  text-align: center;
  color: var(--text-secondary);
  font-size: 12px;
  margin-top: 10px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
