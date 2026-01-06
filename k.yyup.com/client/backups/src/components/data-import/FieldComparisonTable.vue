<template>
  <div class="field-comparison-container">
    <!-- 📊 摘要信息 -->
    <div class="summary-section">
      <div class="summary-header">
        <h3>📊 字段映射分析结果</h3>
        <el-tag :type="summary.canProceed ? 'success' : 'danger'" size="large">
          {{ summary.canProceed ? '✅ 可以导入' : '❌ 需要处理' }}
        </el-tag>
      </div>
      
      <div class="summary-stats">
        <div class="stat-item">
          <span class="stat-number">{{ summary.totalSourceFields }}</span>
          <span class="stat-label">文档字段总数</span>
        </div>
        <div class="stat-item success">
          <span class="stat-number">{{ summary.willImportCount }}</span>
          <span class="stat-label">将导入字段</span>
        </div>
        <div class="stat-item warning">
          <span class="stat-number">{{ summary.willIgnoreCount }}</span>
          <span class="stat-label">将忽略字段</span>
        </div>
        <div class="stat-item danger" v-if="summary.missingRequiredCount > 0">
          <span class="stat-number">{{ summary.missingRequiredCount }}</span>
          <span class="stat-label">缺少必填字段</span>
        </div>
      </div>

      <div class="user-message">
        <el-alert 
          :title="summary.recommendation" 
          :description="summary.userFriendlyMessage"
          :type="summary.canProceed ? 'success' : 'error'"
          show-icon
          :closable="false"
        />
      </div>
    </div>

    <!-- 📋 详细对比表 -->
    <div class="comparison-tables">
      <!-- ✅ 将导入的字段 -->
      <div class="table-section" v-if="comparisonTable.willImport.length > 0">
        <h4 class="section-title success">
          <el-icon><Check /></el-icon>
          将导入的字段 ({{ comparisonTable.willImport.length }})
        </h4>
        <el-table :data="comparisonTable.willImport" stripe>
          <el-table-column prop="sourceField" label="文档字段" width="150" />
          <el-table-column prop="targetField" label="数据库字段" width="150" />
          <el-table-column prop="description" label="字段说明" />
          <el-table-column prop="dataType" label="数据类型" width="100" />
          <el-table-column prop="sampleValue" label="示例值" width="120" />
          <el-table-column label="匹配度" width="100">
            <template #default="{ row }">
              <el-progress 
                :percentage="Math.round(row.confidence * 100)" 
                :color="getConfidenceColor(row.confidence)"
                :stroke-width="8"
              />
            </template>
          </el-table-column>
          <el-table-column label="必填" width="60">
            <template #default="{ row }">
              <el-tag :type="row.required ? 'danger' : 'info'" size="small">
                {{ row.required ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- ❌ 将忽略的字段 -->
      <div class="table-section" v-if="comparisonTable.willIgnore.length > 0">
        <h4 class="section-title warning">
          <el-icon><Warning /></el-icon>
          将忽略的字段 ({{ comparisonTable.willIgnore.length }})
        </h4>
        <el-table :data="comparisonTable.willIgnore" stripe>
          <el-table-column prop="sourceField" label="文档字段" width="150" />
          <el-table-column prop="reason" label="忽略原因" />
          <el-table-column prop="suggestion" label="建议" />
          <el-table-column prop="sampleValue" label="示例值" width="120" />
        </el-table>
        <div class="ignore-notice">
          <el-alert 
            title="💡 温馨提示" 
            description="这些字段将被忽略，不会影响数据导入。如果您需要导入这些字段，请调整文档中的字段名称。"
            type="info"
            show-icon
            :closable="false"
          />
        </div>
      </div>

      <!-- ⚠️ 冲突字段 -->
      <div class="table-section" v-if="comparisonTable.conflicts.length > 0">
        <h4 class="section-title danger">
          <el-icon><QuestionFilled /></el-icon>
          需要确认的字段 ({{ comparisonTable.conflicts.length }})
        </h4>
        <el-table :data="comparisonTable.conflicts" stripe>
          <el-table-column prop="sourceField" label="文档字段" width="150" />
          <el-table-column prop="suggestedTarget" label="建议映射" width="150" />
          <el-table-column prop="reason" label="需要确认的原因" />
          <el-table-column label="匹配度" width="100">
            <template #default="{ row }">
              <el-progress 
                :percentage="Math.round(row.confidence * 100)" 
                color="var(--warning-color)"
                :stroke-width="8"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="{ row, $index }">
              <el-button 
                type="primary" 
                size="small"
                @click="confirmMapping(row, $index)"
              >
                确认映射
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 🚫 缺少的必填字段 -->
      <div class="table-section" v-if="comparisonTable.missing.length > 0">
        <h4 class="section-title danger">
          <el-icon><Close /></el-icon>
          缺少的必填字段 ({{ comparisonTable.missing.length }})
        </h4>
        <el-table :data="comparisonTable.missing" stripe>
          <el-table-column prop="targetField" label="必填字段" width="150" />
          <el-table-column prop="description" label="字段说明" />
          <el-table-column prop="dataType" label="数据类型" width="100" />
          <el-table-column label="默认值" width="120">
            <template #default="{ row }">
              <el-tag v-if="row.canUseDefault" type="success" size="small">
                {{ row.defaultValue || '系统默认' }}
              </el-tag>
              <el-tag v-else type="danger" size="small">
                需要提供
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
        <div class="missing-notice">
          <el-alert 
            title="⚠️ 重要提醒" 
            description="这些是必填字段，必须在文档中提供才能继续导入。请在您的文档中添加这些字段，或联系管理员了解详情。"
            type="error"
            show-icon
            :closable="false"
          />
        </div>
      </div>
    </div>

    <!-- 🎯 操作按钮 -->
    <div class="action-buttons">
      <el-button size="large" @click="$emit('cancel')">
        取消导入
      </el-button>
      <el-button 
        type="primary" 
        size="large" 
        :disabled="!summary.canProceed"
        @click="confirmImport"
      >
        {{ summary.canProceed ? '确认导入' : '无法导入' }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Check, Warning, QuestionFilled, Close } from '@element-plus/icons-vue'

// Props
interface Props {
  comparisonTable: {
    willImport: any[]
    willIgnore: any[]
    missing: any[]
    conflicts: any[]
  }
  summary: {
    totalSourceFields: number
    willImportCount: number
    willIgnoreCount: number
    missingRequiredCount: number
    conflictsCount: number
    canProceed: boolean
    recommendation: string
    userFriendlyMessage: string
  }
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  cancel: []
  confirm: [mappings: any[]]
}>()

// Methods
const getConfidenceColor = (confidence: number) => {
  if (confidence >= 0.9) return 'var(--success-color)'
  if (confidence >= 0.7) return 'var(--warning-color)'
  return 'var(--danger-color)'
}

const confirmMapping = (conflict: any, index: number) => {
  // TODO: 处理冲突字段的确认逻辑
  console.log('确认映射:', conflict)
}

const confirmImport = () => {
  // 生成最终的字段映射
  const finalMappings = props.comparisonTable.willImport.map(item => ({
    sourceField: item.sourceField,
    targetField: item.targetField,
    required: item.required,
    dataType: item.dataType
  }))
  
  emit('confirm', finalMappings)
}
</script>

<style scoped>
.field-comparison-container {
  padding: var(--text-2xl);
  background: var(--bg-gray-light);
  border-radius: var(--spacing-sm);
}

.summary-section {
  background: white;
  padding: var(--text-2xl);
  border-radius: var(--spacing-sm);
  margin-bottom: var(--text-2xl);
  box-shadow: 0 2px var(--spacing-xs) var(--black-alpha-10);
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-2xl);
}

.summary-stats {
  display: flex;
  gap: var(--text-2xl);
  margin-bottom: var(--text-2xl);
}

.stat-item {
  text-align: center;
  padding: var(--spacing-4xl);
  border-radius: var(--spacing-sm);
  background: var(--bg-secondary);
  min-width: 120px;
}

.stat-item.success { background: #f0f9ff; border-left: var(--spacing-xs) solid var(--success-color); }
.stat-item.warning { background: #fefce8; border-left: var(--spacing-xs) solid var(--warning-color); }
.stat-item.danger { background: #fef2f2; border-left: var(--spacing-xs) solid var(--danger-color); }

.stat-number {
  display: block;
  font-size: var(--text-3xl);
  font-weight: bold;
  color: var(--text-primary);
}

.stat-label {
  display: block;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-top: var(--spacing-base);
}

.comparison-tables {
  display: flex;
  flex-direction: column;
  gap: var(--text-2xl);
}

.table-section {
  background: white;
  padding: var(--text-2xl);
  border-radius: var(--spacing-sm);
  box-shadow: 0 2px var(--spacing-xs) var(--black-alpha-10);
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-4xl);
  font-size: var(--text-lg);
}

.section-title.success { color: var(--success-color); }
.section-title.warning { color: var(--warning-color); }
.section-title.danger { color: var(--danger-color); }

.ignore-notice,
.missing-notice {
  margin-top: var(--spacing-4xl);
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: var(--text-2xl);
  margin-top: var(--spacing-8xl);
  padding: var(--text-2xl);
  background: white;
  border-radius: var(--spacing-sm);
  box-shadow: 0 2px var(--spacing-xs) var(--black-alpha-10);
}
</style>
