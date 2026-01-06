<template>
  <el-dialog
    v-model="dialogVisible"
    title="AI智能分配"
    width="900px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="ai-assign-dialog">
      <!-- 步骤1：加载中 -->
      <div v-if="loading" class="loading-state">
        <UnifiedIcon name="default" />
        <p class="loading-text">AI正在分析教师能力和客户需求...</p>
        <p class="loading-subtext">这可能需要几秒钟时间</p>
      </div>

      <!-- 步骤2：显示推荐结果 -->
      <div v-else-if="recommendations.length > 0" class="recommendations-state">
        <div class="recommendations-header">
          <el-alert
            type="success"
            :closable="false"
            show-icon
          >
            <template #title>
              <span class="alert-title">
                AI已为您推荐 {{ recommendations.length }} 位最适合的教师
              </span>
            </template>
          </el-alert>
        </div>

        <div class="recommendations-list">
          <div
            v-for="(rec, index) in recommendations"
            :key="rec.teacherId"
            class="recommendation-card"
            :class="{ 'selected': selectedTeacherId === rec.teacherId }"
            @click="selectTeacher(rec.teacherId)"
          >
            <div class="card-header">
              <div class="teacher-info">
                <el-avatar :size="48" :src="rec.teacher?.avatar || ''">
                  {{ rec.teacher?.name?.charAt(0) || '?' }}
                </el-avatar>
                <div class="teacher-details">
                  <h3 class="teacher-name">
                    {{ rec.teacher?.name || '未知教师' }}
                    <el-tag v-if="index === 0" type="success" size="small" effect="dark">
                      最佳推荐
                    </el-tag>
                  </h3>
                  <p class="teacher-position">{{ rec.teacher?.position || '教师' }}</p>
                </div>
              </div>
              <div class="match-score">
                <el-progress
                  type="circle"
                  :percentage="rec.matchScore"
                  :width="60"
                  :stroke-width="6"
                  :color="getScoreColor(rec.matchScore)"
                >
                  <template #default="{ percentage }">
                    <span class="score-text">{{ percentage }}%</span>
                  </template>
                </el-progress>
                <p class="score-label">匹配度</p>
              </div>
            </div>

            <div class="card-body">
              <div class="stats-row">
                <div class="stat-item">
                  <span class="stat-label">当前负责</span>
                  <span class="stat-value">{{ rec.currentLoad || 0 }}人</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">转化率</span>
                  <span class="stat-value">{{ rec.conversionRate || 0 }}%</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">班级人数</span>
                  <span class="stat-value">{{ rec.classSize || 0 }}人</span>
                </div>
              </div>

              <div class="reason-section">
                <h4 class="reason-title">
                  <UnifiedIcon name="default" />
                  AI推荐理由
                </h4>
                <p class="reason-text">{{ rec.reason }}</p>
              </div>
            </div>

            <div v-if="selectedTeacherId === rec.teacherId" class="selected-indicator">
              <UnifiedIcon name="Check" />
            </div>
          </div>
        </div>
      </div>

      <!-- 步骤3：错误状态 -->
      <div v-else-if="error" class="error-state">
        <el-result
          icon="error"
          title="获取推荐失败"
          :sub-title="error"
        >
          <template #extra>
            <el-button type="primary" @click="loadRecommendations">
              重新获取
            </el-button>
          </template>
        </el-result>
      </div>

      <!-- 步骤4：空状态 -->
      <div v-else class="empty-state">
        <el-empty description="暂无推荐结果" />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :loading="assigning"
          :disabled="!selectedTeacherId"
          @click="handleConfirm"
        >
          确认分配
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading, MagicStick, Check } from '@element-plus/icons-vue'
import { post } from '@/utils/request'

interface Props {
  modelValue: boolean
  customerIds: number[]
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const loading = ref(false)
const assigning = ref(false)
const error = ref('')
const recommendations = ref<any[]>([])
const selectedTeacherId = ref<number | null>(null)

// 监听对话框打开，自动加载推荐
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    loadRecommendations()
  } else {
    // 关闭时重置状态
    resetState()
  }
})

const loadRecommendations = async () => {
  if (props.customerIds.length === 0) {
    error.value = '请先选择要分配的客户'
    return
  }

  loading.value = true
  error.value = ''
  recommendations.value = []
  selectedTeacherId.value = null

  try {
    const response = await post('/ai/smart-assign', {
      customerIds: props.customerIds
    })

    if (response.success && response.data) {
      const rawRecommendations = response.data.recommendations || []

      // 转换后端数据结构为前端期望的格式
      recommendations.value = rawRecommendations.map((rec: any) => ({
        teacherId: rec.recommendedTeacher?.id || 0,
        teacher: {
          name: rec.recommendedTeacher?.name || '未知教师',
          avatar: '', // 后端暂未返回avatar,使用空字符串
          position: '教师'
        },
        matchScore: rec.recommendedTeacher?.matchScore || 0,
        reason: rec.recommendedTeacher?.reasons?.join('；') || '暂无推荐理由',
        currentLoad: rec.recommendedTeacher?.currentStats?.totalCustomers || 0,
        conversionRate: rec.recommendedTeacher?.currentStats?.conversionRate || 0,
        classSize: rec.recommendedTeacher?.currentStats?.classSize || 0
      }))

      // 默认选中第一个推荐
      if (recommendations.value.length > 0) {
        selectedTeacherId.value = recommendations.value[0].teacherId
      }
    } else {
      error.value = response.message || '获取推荐失败'
    }
  } catch (err: any) {
    console.error('获取AI推荐失败:', err)
    error.value = err.message || '网络错误，请稍后重试'
  } finally {
    loading.value = false
  }
}

const selectTeacher = (teacherId: number) => {
  selectedTeacherId.value = teacherId
}

const handleConfirm = async () => {
  if (!selectedTeacherId.value) {
    ElMessage.warning('请选择一位教师')
    return
  }

  assigning.value = true

  try {
    const response = await post('/api/ai/batch-assign', {
      customerIds: props.customerIds,
      teacherId: selectedTeacherId.value
    })

    if (response.success) {
      ElMessage.success('分配成功')
      emit('success')
    } else {
      ElMessage.error(response.message || '分配失败')
    }
  } catch (err: any) {
    console.error('批量分配失败:', err)
    ElMessage.error(err.message || '分配失败，请稍后重试')
  } finally {
    assigning.value = false
  }
}

const handleClose = () => {
  emit('cancel')
  dialogVisible.value = false
}

const resetState = () => {
  loading.value = false
  assigning.value = false
  error.value = ''
  recommendations.value = []
  selectedTeacherId.value = null
}

const getScoreColor = (score: number) => {
  if (score >= 90) return 'var(--success-color)'
  if (score >= 75) return 'var(--primary-color)'
  if (score >= 60) return 'var(--warning-color)'
  return 'var(--danger-color)'
}
</script>

<style scoped>
.ai-assign-dialog {
  min-min-height: 60px; height: auto;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-15xl) var(--spacing-xl);
}

.loading-text {
  margin-top: var(--text-3xl);
  font-size: var(--text-lg);
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.loading-subtext {
  margin-top: var(--spacing-sm);
  font-size: var(--text-base);
  color: var(--el-text-color-secondary);
}

/* 推荐结果 */
.recommendations-state {
  padding: 0;
}

.recommendations-header {
  margin-bottom: var(--spacing-xl);
}

.alert-title {
  font-size: var(--text-base);
  font-weight: 500;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: var(--text-lg);
  max-min-height: 60px; height: auto;
  overflow-y: auto;
}

/* 推荐卡片 */
.recommendation-card {
  position: relative;
  padding: var(--spacing-xl);
  border: 2px solid var(--el-border-color);
  border-radius: var(--text-sm);
  background: var(--el-bg-color);
  cursor: pointer;
  transition: all var(--transition-normal) ease;
}

.recommendation-card:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 var(--spacing-xs) var(--text-sm) rgba(64, 158, 255, 0.15);
  transform: translateY(var(--transform-hover-lift));
}

.recommendation-card.selected {
  border-color: rgba(99, 102, 241, 0.6);
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%);
  box-shadow: 0 var(--spacing-xs) var(--text-lg) rgba(99, 102, 241, 0.25);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-lg);
}

.teacher-info {
  display: flex;
  align-items: center;
  gap: var(--text-sm);
}

.teacher-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.teacher-name {
  margin: 0;
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.teacher-position {
  margin: 0;
  font-size: var(--text-base);
  color: var(--el-text-color-secondary);
}

.match-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.score-text {
  font-size: var(--text-base);
  font-weight: 600;
}

.score-label {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--el-text-color-secondary);
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: var(--text-lg);
}

.stats-row {
  display: flex;
  gap: var(--text-3xl);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--el-text-color-secondary);
}

.stat-value {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--el-color-primary);
}

.reason-section {
  padding: var(--text-sm);
  background: var(--el-fill-color-light);
  border-radius: var(--spacing-sm);
}

.reason-title {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.reason-text {
  margin: 0;
  font-size: var(--text-base);
  line-height: 1.6;
  color: var(--el-text-color-regular);
}

.selected-indicator {
  position: absolute;
  top: var(--text-lg);
  right: var(--text-lg);
  width: var(--spacing-3xl);
  height: var(--spacing-3xl);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-color-primary);
  color: var(--text-on-primary);
  border-radius: var(--radius-full);
}

/* 错误和空状态 */
.error-state,
.empty-state {
  padding: var(--spacing-10xl) var(--spacing-xl);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--text-sm);
}
</style>

