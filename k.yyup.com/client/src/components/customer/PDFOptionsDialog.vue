<template>
  <el-dialog
    v-model="dialogVisible"
    title="PDF报告生成选项"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form :model="formData" label-width="120px">
      <!-- 生成模式 -->
      <el-form-item label="生成模式">
        <el-radio-group v-model="formData.mode">
          <el-radio label="single">
            <div class="radio-content">
              <UnifiedIcon name="default" />
              <span>单个教师</span>
            </div>
            <div class="radio-description">为单个教师生成独立PDF报告</div>
          </el-radio>
          <el-radio label="batch">
            <div class="radio-content">
              <span>👥 批量生成</span>
            </div>
            <div class="radio-description">为多个教师分别生成PDF报告</div>
          </el-radio>
          <el-radio label="merged">
            <div class="radio-content">
              <span>📁 合并PDF</span>
            </div>
            <div class="radio-description">将所有教师报告合并为一个PDF</div>
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 教师选择 -->
      <el-form-item label="选择教师" v-if="formData.mode !== 'merged'">
        <el-select
          v-model="formData.teacherIds"
          :multiple="formData.mode === 'batch'"
          placeholder="请选择教师"
          class="full-width"
          filterable
        >
          <el-option
            v-for="teacher in teachers"
            :key="teacher.id"
            :label="teacher.name"
            :value="teacher.id"
          >
            <div class="teacher-option">
              <span class="teacher-name">{{ teacher.name }}</span>
              <span class="teacher-info">{{ teacher.position || '教师' }}</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>

      <!-- 内容选项 -->
      <el-form-item label="报告内容">
        <el-checkbox-group v-model="formData.contentOptions">
          <el-checkbox label="includeCharts">
            <div class="checkbox-content">
              <span>📈 包含图表</span>
            </div>
          </el-checkbox>
          <el-checkbox label="includeDetailedData">
            <div class="checkbox-content">
              <span>📊 包含详细数据</span>
            </div>
          </el-checkbox>
          <el-checkbox label="includeRecommendations">
            <div class="checkbox-content">
              <span>📝 包含改进建议</span>
            </div>
          </el-checkbox>
          <el-checkbox label="includeComparison">
            <div class="checkbox-content">
              <span>📉 包含对比分析</span>
            </div>
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <!-- 时间范围 -->
      <el-form-item label="统计时间范围">
        <el-date-picker
          v-model="formData.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          class="full-width"
        />
      </el-form-item>

      <!-- 报告标题 -->
      <el-form-item label="报告标题">
        <el-input
          v-model="formData.title"
          placeholder="请输入报告标题（可选）"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="generating">
          <span v-if="!generating">📄 </span>生成PDF
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
// 移除图标导入 - 使用Element Plus全局注册的图标组件

interface Teacher {
  id: number
  name: string
  position?: string
}

interface PDFOptions {
  mode: 'single' | 'batch' | 'merged'
  teacherIds: number | number[]
  contentOptions: string[]
  dateRange: [Date, Date] | null
  title: string
}

interface Props {
  modelValue: boolean
  teachers: Teacher[]
  statistics?: any
  aiAnalysis?: any
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', options: PDFOptions): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const generating = ref(false)

const formData = ref<PDFOptions>({
  mode: 'merged',
  teacherIds: [],
  contentOptions: ['includeCharts', 'includeDetailedData', 'includeRecommendations'],
  dateRange: null,
  title: ''
})

// 监听模式变化，重置教师选择
watch(() => formData.value.mode, (newMode) => {
  if (newMode === 'single') {
    formData.value.teacherIds = props.teachers[0]?.id || 0
  } else if (newMode === 'batch') {
    formData.value.teacherIds = []
  } else {
    formData.value.teacherIds = []
  }
})

const handleClose = () => {
  dialogVisible.value = false
}

const handleConfirm = () => {
  // 验证
  if (formData.value.mode === 'single' && !formData.value.teacherIds) {
    ElMessage.warning('请选择教师')
    return
  }

  if (formData.value.mode === 'batch' && (!Array.isArray(formData.value.teacherIds) || formData.value.teacherIds.length === 0)) {
    ElMessage.warning('请至少选择一个教师')
    return
  }

  if (formData.value.contentOptions.length === 0) {
    ElMessage.warning('请至少选择一个报告内容选项')
    return
  }

  // 构建选项对象
  const options: any = {
    mode: formData.value.mode,
    includeCharts: formData.value.contentOptions.includes('includeCharts'),
    includeDetailedData: formData.value.contentOptions.includes('includeDetailedData'),
    includeRecommendations: formData.value.contentOptions.includes('includeRecommendations'),
    includeComparison: formData.value.contentOptions.includes('includeComparison')
  }

  if (formData.value.mode === 'single') {
    options.teacherId = formData.value.teacherIds
  } else if (formData.value.mode === 'batch') {
    options.teacherIds = formData.value.teacherIds
  }

  if (formData.value.dateRange) {
    options.startDate = formData.value.dateRange[0]
    options.endDate = formData.value.dateRange[1]
  }

  if (formData.value.title) {
    options.title = formData.value.title
  }

  emit('confirm', options)
  handleClose()
}
</script>

<style scoped lang="scss">
.radio-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: 500;
}

.radio-description {
  margin-left: var(--text-3xl);
  font-size: var(--text-sm);
  color: var(--el-text-color-secondary);
  margin-top: var(--spacing-xs);
}

.el-radio {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: var(--text-lg);
  padding: var(--text-sm);
  border: var(--border-width) solid var(--el-border-color);
  border-radius: var(--spacing-sm);
  transition: all var(--transition-normal);

  &:hover {
    border-color: rgba(99, 102, 241, 0.4);
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%);
    box-shadow: 0 var(--spacing-xs) var(--text-sm) rgba(99, 102, 241, 0.15);
  }

  &.is-checked {
    border-color: rgba(99, 102, 241, 0.6);
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%);
    box-shadow: 0 var(--spacing-xs) var(--text-sm) rgba(99, 102, 241, 0.2);
  }
}

.teacher-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.teacher-name {
  font-weight: 500;
}

.teacher-info {
  font-size: var(--text-sm);
  color: var(--el-text-color-secondary);
}

.checkbox-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.el-checkbox {
  margin-bottom: var(--text-sm);
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: background 0.3s;

  &:hover {
    background: var(--el-fill-color-light);
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--text-sm);
}
.full-width {
  width: 100%;
}
</style>

