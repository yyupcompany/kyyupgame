<template>
  <div class="plan-edit">
    <!-- 头部导航 -->
    <div class="page-header">
      <van-nav-bar
        title="编辑训练计划"
        left-arrow
        @click-left="$router.go(-1)"
        fixed
        placeholder
      />
    </div>

    <!-- 编辑表单 -->
    <div class="form-content">
      <van-form @submit="onSubmit">
        <!-- 基本信息 -->
        <div class="form-section">
          <h3>基本信息</h3>

          <van-field
            v-model="form.name"
            name="name"
            label="计划名称"
            placeholder="请输入训练计划名称"
            :rules="[{ required: true, message: '请输入计划名称' }]"
            required
          />

          <van-field
            v-model="form.description"
            name="description"
            label="计划描述"
            type="textarea"
            placeholder="请输入计划描述（可选）"
            rows="3"
          />

          <van-field
            name="status"
            label="计划状态"
            readonly
            @click="showStatusPicker = true"
            :value="getStatusLabel(form.status)"
          />
        </div>

        <!-- 目标能力 -->
        <div class="form-section">
          <h3>目标能力</h3>
          <div class="ability-tags">
            <van-tag
              v-for="ability in availableAbilities"
              :key="ability.value"
              :type="form.targetAbilities.includes(ability.value) ? 'primary' : 'default'"
              plain
              size="medium"
              @click="toggleAbility(ability.value)"
            >
              {{ ability.label }}
            </van-tag>
          </div>
        </div>

        <!-- 活动选择 -->
        <div class="form-section">
          <h3>训练活动</h3>
          <div class="activity-selection">
            <div class="selected-count">
              已选择 {{ selectedActivities.length }} 个活动
            </div>

            <div class="filter-bar">
              <van-button
                size="small"
                :type="activeType === 'all' ? 'primary' : 'default'"
                @click="activeType = 'all'"
              >
                全部
              </van-button>
              <van-button
                v-for="type in activityTypes"
                :key="type.value"
                size="small"
                :type="activeType === type.value ? 'primary' : 'default'"
                @click="activeType = type.value"
              >
                {{ type.label }}
              </van-button>
            </div>

            <div class="activity-list">
              <div
                v-for="activity in filteredActivities"
                :key="activity.id"
                class="activity-item"
                :class="{ selected: selectedActivities.includes(activity.id) }"
                @click="toggleActivity(activity.id)"
              >
                <div class="activity-info">
                  <div class="activity-name">{{ activity.name }}</div>
                  <div class="activity-meta">
                    <van-tag :type="getTypeColor(activity.type)" size="small">
                      {{ getTypeLabel(activity.type) }}
                    </van-tag>
                    <span class="difficulty">难度 {{ activity.difficulty }}</span>
                    <span class="age">{{ activity.ageRange }}</span>
                  </div>
                </div>
                <van-icon
                  :name="selectedActivities.includes(activity.id) ? 'success' : 'circle'"
                  :color="selectedActivities.includes(activity.id) ? '#52c41a' : '#ddd'"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 训练设置 -->
        <div class="form-section">
          <h3>训练设置</h3>

          <van-field
            name="difficulty"
            label="训练难度"
            placeholder="请选择训练难度"
            readonly
            @click="showDifficultyPicker = true"
            :value="getDifficultyLabel(form.difficulty)"
          />

          <van-field
            name="frequency"
            label="训练频率"
            placeholder="请选择训练频率"
            readonly
            @click="showFrequencyPicker = true"
            :value="getFrequencyLabel(form.frequency)"
          />

          <van-field
            name="duration"
            label="训练时长"
            placeholder="请选择每日训练时长"
            readonly
            @click="showDurationPicker = true"
            :value="form.duration + '分钟'"
          />
        </div>
      </van-form>
    </div>

    <!-- 底部操作 -->
    <div class="action-buttons">
      <van-button
        type="danger"
        plain
        block
        size="large"
        @click="deletePlan"
        :loading="deleting"
      >
        删除计划
      </van-button>
      <van-button
        type="primary"
        block
        size="large"
        @click="onSubmit"
        :loading="submitting"
        :disabled="selectedActivities.length === 0"
      >
        保存修改
      </van-button>
    </div>

    <!-- 选择器弹窗 -->
    <!-- 状态选择 -->
    <van-popup v-model:show="showStatusPicker" position="bottom">
      <van-picker
        :columns="statusColumns"
        @confirm="onStatusConfirm"
        @cancel="showStatusPicker = false"
        title="选择计划状态"
      />
    </van-popup>

    <!-- 难度选择 -->
    <van-popup v-model:show="showDifficultyPicker" position="bottom">
      <van-picker
        :columns="difficultyColumns"
        @confirm="onDifficultyConfirm"
        @cancel="showDifficultyPicker = false"
        title="选择训练难度"
      />
    </van-popup>

    <!-- 频率选择 -->
    <van-popup v-model:show="showFrequencyPicker" position="bottom">
      <van-picker
        :columns="frequencyColumns"
        @confirm="onFrequencyConfirm"
        @cancel="showFrequencyPicker = false"
        title="选择训练频率"
      />
    </van-popup>

    <!-- 时长选择 -->
    <van-popup v-model:show="showDurationPicker" position="bottom">
      <van-picker
        :columns="durationColumns"
        @confirm="onDurationConfirm"
        @cancel="showDurationPicker = false"
        title="选择训练时长"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showLoadingToast, showSuccessToast, showFailToast, showConfirmDialog } from 'vant'
import { trainingApi } from '@/api/modules/training'

const route = useRoute()
const router = useRouter()

// 表单数据
const form = ref({
  name: '',
  description: '',
  status: 'active',
  targetAbilities: [] as string[],
  activityIds: [] as number[],
  difficulty: 'medium',
  frequency: 'daily',
  duration: 20
})

// 原始数据（用于比较变化）
const originalForm = ref<any>({})

// 状态
const submitting = ref(false)
const deleting = ref(false)
const selectedActivities = ref<number[]>([])
const activeType = ref('all')
const showStatusPicker = ref(false)
const showDifficultyPicker = ref(false)
const showFrequencyPicker = ref(false)
const showDurationPicker = ref(false)

// 选项数据
const availableAbilities = [
  { label: '注意力', value: 'attention' },
  { label: '记忆力', value: 'memory' },
  { label: '逻辑思维', value: 'logic' },
  { label: '语言能力', value: 'language' },
  { label: '运动协调', value: 'motor' },
  { label: '社交能力', value: 'social' }
]

const activityTypes = [
  { label: '认知训练', value: 'cognitive' },
  { label: '运动训练', value: 'motor' },
  { label: '语言训练', value: 'language' },
  { label: '社交训练', value: 'social' }
]

const mockActivities = [
  { id: 1, name: '注意力训练 - 找不同', type: 'cognitive', difficulty: 2, ageRange: '3-6岁' },
  { id: 2, name: '记忆力训练 - 记忆卡片', type: 'cognitive', difficulty: 1, ageRange: '3-5岁' },
  { id: 3, name: '逻辑思维训练 - 拼图', type: 'cognitive', difficulty: 3, ageRange: '4-6岁' },
  { id: 4, name: '语言表达训练 - 讲故事', type: 'language', difficulty: 2, ageRange: '3-6岁' },
  { id: 5, name: '社交互动训练 - 角色扮演', type: 'social', difficulty: 2, ageRange: '4-6岁' },
  { id: 6, name: '运动协调训练 - 平衡木', type: 'motor', difficulty: 2, ageRange: '3-6岁' }
]

const statusColumns = [
  { text: '进行中', value: 'active' },
  { text: '已完成', value: 'completed' },
  { text: '已暂停', value: 'paused' }
]

const difficultyColumns = [
  { text: '简单', value: 'easy' },
  { text: '中等', value: 'medium' },
  { text: '困难', value: 'hard' }
]

const frequencyColumns = [
  { text: '每日', value: 'daily' },
  { text: '每周3次', value: 'weekly' },
  { text: '每周2次', value: 'biweekly' },
  { text: '每周1次', value: 'monthly' }
]

const durationColumns = [15, 20, 25, 30, 45, 60].map(min => ({
  text: `${min}分钟`,
  value: min
}))

// 计算属性
const filteredActivities = computed(() => {
  if (activeType.value === 'all') {
    return mockActivities
  }
  return mockActivities.filter(activity => activity.type === activeType.value)
})

const hasChanges = computed(() => {
  return JSON.stringify(form.value) !== JSON.stringify(originalForm.value)
})

// 方法
const toggleAbility = (ability: string) => {
  const index = form.value.targetAbilities.indexOf(ability)
  if (index > -1) {
    form.value.targetAbilities.splice(index, 1)
  } else {
    form.value.targetAbilities.push(ability)
  }
}

const toggleActivity = (activityId: number) => {
  const index = selectedActivities.value.indexOf(activityId)
  if (index > -1) {
    selectedActivities.value.splice(index, 1)
  } else {
    selectedActivities.value.push(activityId)
  }
  form.value.activityIds = selectedActivities.value
}

const getTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    cognitive: '认知',
    motor: '运动',
    language: '语言',
    social: '社交'
  }
  return typeMap[type] || type
}

const getTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    cognitive: 'primary',
    motor: 'success',
    language: 'warning',
    social: 'danger'
  }
  return colorMap[type] || 'default'
}

const getDifficultyLabel = (difficulty: string) => {
  const labelMap: Record<string, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return labelMap[difficulty] || difficulty
}

const getFrequencyLabel = (frequency: string) => {
  const labelMap: Record<string, string> = {
    daily: '每日',
    weekly: '每周3次',
    biweekly: '每周2次',
    monthly: '每周1次'
  }
  return labelMap[frequency] || frequency
}

const getStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    active: '进行中',
    completed: '已完成',
    paused: '已暂停'
  }
  return labelMap[status] || status
}

const onStatusConfirm = ({ selectedValues }: any) => {
  form.value.status = selectedValues[0].value
  showStatusPicker.value = false
}

const onDifficultyConfirm = ({ selectedValues }: any) => {
  form.value.difficulty = selectedValues[0].value
  showDifficultyPicker.value = false
}

const onFrequencyConfirm = ({ selectedValues }: any) => {
  form.value.frequency = selectedValues[0].value
  showFrequencyPicker.value = false
}

const onDurationConfirm = ({ selectedValues }: any) => {
  form.value.duration = selectedValues[0].value
  showDurationPicker.value = false
}

const loadPlanDetail = async () => {
  try {
    showLoadingToast('加载中...')
    const planId = route.params.id

    // 这里应该调用实际的API
    // const response = await trainingApi.getPlanDetail(planId)

    // 模拟数据
    const mockPlanData = {
      id: planId,
      name: '认知能力提升计划',
      description: '通过系统的认知训练，提升孩子的注意力、记忆力和逻辑思维能力',
      status: 'active',
      targetAbilities: ['attention', 'memory', 'logic'],
      activityIds: [1, 2, 3],
      difficulty: 'medium',
      frequency: 'daily',
      duration: 20
    }

    // 填充表单
    form.value = { ...mockPlanData }
    selectedActivities.value = mockPlanData.activityIds
    originalForm.value = JSON.parse(JSON.stringify(mockPlanData))

  } catch (error) {
    console.error('加载计划详情失败:', error)
    showFailToast('加载失败')
  }
}

const onSubmit = async () => {
  try {
    if (form.value.activityIds.length === 0) {
      showFailToast('请至少选择一个训练活动')
      return
    }

    submitting.value = true
    showLoadingToast('保存中...')

    const planId = route.params.id

    // 这里应该调用实际的API
    // await trainingApi.updatePlan(planId, form.value)

    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 1500))

    showSuccessToast('修改成功')
    router.push(`/training-center/plan-detail/${planId}`)

  } catch (error) {
    console.error('保存失败:', error)
    showFailToast('保存失败，请重试')
  } finally {
    submitting.value = false
  }
}

const deletePlan = async () => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: '确定要删除这个训练计划吗？此操作不可撤销。',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      confirmButtonColor: '#ee0a24'
    })

    deleting.value = true
    showLoadingToast('删除中...')

    const planId = route.params.id

    // 这里应该调用实际的API
    // await trainingApi.deletePlan(planId)

    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    showSuccessToast('删除成功')
    router.push('/training-center/plans')

  } catch (error) {
    if (error.action !== 'cancel') {
      console.error('删除失败:', error)
      showFailToast('删除失败，请重试')
    }
  } finally {
    deleting.value = false
  }
}

// 页面离开守卫
const onBeforeLeave = () => {
  if (hasChanges.value) {
    // 在实际应用中，这里可以显示确认对话框
    return '您有未保存的修改，确定要离开吗？'
  }
}

// 生命周期
onMounted(() => {
  loadPlanDetail()
})

// 如果使用 Vue Router，可以添加路由守卫
// onBeforeRouteLeave(onBeforeLeave)
</script>

<style scoped lang="scss">
.plan-edit {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 140px;
}

.page-header {
  :deep(.van-nav-bar) {
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.form-content {
  padding: var(--spacing-md);

  .form-section {
    background: white;
    border-radius: 12px;
    padding: var(--spacing-lg);
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    h3 {
      color: #333;
      font-size: var(--text-lg);
      font-weight: 600;
      margin: 0 0 20px 0;
    }

    :deep(.van-field) {
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .ability-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);

    .van-tag {
      cursor: pointer;
      transition: all 0.3s;

      &.van-tag--primary {
        transform: scale(1.05);
      }
    }
  }

  .activity-selection {
    .selected-count {
      color: #666;
      font-size: var(--text-sm);
      margin-bottom: 12px;
    }

    .filter-bar {
      display: flex;
      gap: var(--spacing-sm);
      margin-bottom: 16px;
      overflow-x: auto;
      padding-bottom: 8px;

      .van-button {
        flex-shrink: 0;
      }
    }

    .activity-list {
      .activity-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--spacing-md);
        border: 1px solid #e8e8e8;
        border-radius: 8px;
        margin-bottom: 12px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          border-color: #1989fa;
          background: #f0f9ff;
        }

        &.selected {
          border-color: #52c41a;
          background: #f6ffed;
        }

        .activity-info {
          flex: 1;

          .activity-name {
            font-size: var(--text-base);
            font-weight: 600;
            color: #333;
            margin-bottom: 8px;
          }

          .activity-meta {
            display: flex;
            gap: var(--spacing-md);
            align-items: center;

            .difficulty, .age {
              font-size: var(--text-xs);
              color: #666;
            }
          }
        }

        .van-icon {
          font-size: var(--text-xl);
        }
      }
    }
  }
}

.action-buttons {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--spacing-md);
  background: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);

  .van-button {
    width: 100%;
  }
}
</style>