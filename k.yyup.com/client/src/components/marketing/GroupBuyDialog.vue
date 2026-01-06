<template>
  <el-dialog
    v-model="visible"
    :title="isCreating ? '开团设置' : '参团确认'"
    width="600px"
    :before-close="handleClose"
  >
    <!-- 活动信息展示 -->
    <div class="activity-info" v-if="activity">
      <div class="activity-header">
        <h3>{{ activity.title }}</h3>
        <div class="activity-meta">
          <span class="price-info">
            <span class="original-price">¥{{ activity.price }}</span>
            <span class="group-price">¥{{ groupPrice }}</span>
            <span class="discount">立减¥{{ (activity.price - groupPrice).toFixed(2) }}</span>
          </span>
        </div>
      </div>
    </div>

    <!-- 开团表单 -->
    <div v-if="isCreating" class="group-form">
      <el-form :model="groupForm" :rules="groupRules" ref="groupFormRef" label-width="100px">
        <el-form-item label="目标人数" prop="targetPeople">
          <el-input-number
            v-model="groupForm.targetPeople"
            :min="2"
            :max="50"
            placeholder="成团所需人数"
          />
          <div class="form-tip">至少{{ groupForm.targetPeople }}人即可成团</div>
        </el-form-item>

        <el-form-item label="最大人数" prop="maxPeople">
          <el-input-number
            v-model="groupForm.maxPeople"
            :min="groupForm.targetPeople"
            :max="100"
            placeholder="团购最大人数"
          />
          <div class="form-tip">团购最多允许{{ groupForm.maxPeople }}人参与</div>
        </el-form-item>

        <el-form-item label="团购时长" prop="deadlineHours">
          <el-select v-model="groupForm.deadlineHours" placeholder="选择团购时长">
            <el-option label="6小时" :value="6" />
            <el-option label="12小时" :value="12" />
            <el-option label="24小时" :value="24" />
            <el-option label="48小时" :value="48" />
            <el-option label="72小时" :value="72" />
          </el-select>
          <div class="form-tip">团购持续{{ groupForm.deadlineHours }}小时</div>
        </el-form-item>

        <el-form-item label="团购价格" prop="groupPrice">
          <el-input-number
            v-model="groupForm.groupPrice"
            :min="0"
            :max="activity?.price || 9999"
            :precision="2"
            placeholder="团购优惠价格"
          />
          <div class="form-tip">团购成功后的优惠价格</div>
        </el-form-item>
      </el-form>
    </div>

    <!-- 参团信息 -->
    <div v-else class="join-info">
      <div class="group-status">
        <div class="progress-info">
          <div class="people-info">
            <span class="current">{{ currentGroupBuy?.currentPeople || 0 }}</span>
            <span class="separator">/</span>
            <span class="target">{{ currentGroupBuy?.targetPeople || 0 }}</span>
            <span class="unit">人</span>
          </div>
          <div class="progress-bar">
            <el-progress
              :percentage="progressPercentage"
              :color="progressColor"
              :show-text="false"
            />
          </div>
        </div>

        <div class="time-info">
          <el-icon><Timer /></el-icon>
          <span v-if="remainingTime > 0">
            剩余时间：{{ formatTime(remainingTime) }}
          </span>
          <span v-else class="expired">团购已过期</span>
        </div>
      </div>

      <div class="group-leader" v-if="currentGroupBuy?.groupLeader">
        <el-avatar :size="40" :src="currentGroupBuy.groupLeader.avatar">
          {{ currentGroupBuy.groupLeader.name?.charAt(0) }}
        </el-avatar>
        <div class="leader-info">
          <div class="name">{{ currentGroupBuy.groupLeader.name }}</div>
          <div class="role">团长</div>
        </div>
      </div>
    </div>

    <!-- 底部操作 -->
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :loading="loading"
          :disabled="!canSubmit"
          @click="handleSubmit"
        >
          {{ isCreating ? '立即开团' : '立即参团' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Timer } from '@element-plus/icons-vue'
import { request } from '@/utils/request'

interface Props {
  visible: boolean
  activity: any
  isCreating?: boolean
  currentGroupBuy?: any
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success', data: any): void
}

const props = withDefaults(defineProps<Props>(), {
  isCreating: true,
  currentGroupBuy: null,
})

const emit = defineEmits<Emits>()

// 响应式数据
const loading = ref(false)
const groupFormRef = ref()

const groupForm = ref({
  targetPeople: 2,
  maxPeople: 50,
  deadlineHours: 24,
  groupPrice: 0,
})

const groupRules = {
  targetPeople: [
    { required: true, message: '请输入目标人数', trigger: 'blur' },
    { type: 'number', min: 2, max: 50, message: '目标人数必须在2-50人之间', trigger: 'blur' }
  ],
  maxPeople: [
    { required: true, message: '请输入最大人数', trigger: 'blur' },
    { type: 'number', min: 2, max: 100, message: '最大人数必须在2-100人之间', trigger: 'blur' }
  ],
  deadlineHours: [
    { required: true, message: '请选择团购时长', trigger: 'change' }
  ],
  groupPrice: [
    { required: true, message: '请输入团购价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '团购价格必须大于等于0', trigger: 'blur' }
  ]
}

// 计算属性
const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const groupPrice = computed(() => {
  return props.isCreating ? groupForm.value.groupPrice : (props.currentGroupBuy?.groupPrice || 0)
})

const progressPercentage = computed(() => {
  if (!props.currentGroupBuy) return 0
  return Math.min((props.currentGroupBuy.currentPeople / props.currentGroupBuy.targetPeople) * 100, 100)
})

const progressColor = computed(() => {
  if (progressPercentage.value >= 100) return '#67c23a'
  if (progressPercentage.value >= 50) return '#e6a23c'
  return '#f56c6c'
})

const remainingTime = computed(() => {
  if (!props.currentGroupBuy) return 0
  return new Date(props.currentGroupBuy.deadline).getTime() - Date.now()
})

const canSubmit = computed(() => {
  if (loading.value) return false
  if (props.isCreating) {
    return groupForm.value.targetPeople > 0 && groupForm.value.groupPrice >= 0
  } else {
    return props.currentGroupBuy?.canJoin && remainingTime.value > 0
  }
})

// 方法
const handleClose = () => {
  visible.value = false
  resetForm()
}

const resetForm = () => {
  if (groupFormRef.value) {
    groupFormRef.value.resetFields()
  }
  groupForm.value = {
    targetPeople: 2,
    maxPeople: 50,
    deadlineHours: 24,
    groupPrice: 0,
  }
}

const handleSubmit = async () => {
  if (!props.activity) {
    ElMessage.error('活动信息不存在')
    return
  }

  try {
    loading.value = true

    if (props.isCreating) {
      // 开团
      await groupFormRef.value?.validate()

      const response = await request.post('/api/marketing/group-buy', {
        activityId: props.activity.id,
        ...groupForm.value
      })

      if (response.success) {
        ElMessage.success('开团成功！')
        emit('success', response.data)
        handleClose()
      } else {
        throw new Error(response.message || '开团失败')
      }
    } else {
      // 参团
      const response = await request.post(`/api/marketing/group-buy/${props.currentGroupBuy.id}/join`, {})

      if (response.success) {
        ElMessage.success('参团成功！')
        emit('success', response.data)
        handleClose()
      } else {
        throw new Error(response.message || '参团失败')
      }
    }
  } catch (error: any) {
    console.error('操作失败:', error)
    ElMessage.error(error.message || '操作失败，请重试')
  } finally {
    loading.value = false
  }
}

const formatTime = (milliseconds: number): string => {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60))
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  } else {
    return `${minutes}分钟`
  }
}

// 监听器
watch(() => props.visible, (newVal) => {
  if (newVal && props.activity && props.isCreating) {
    // 初始化团购价格
    const marketingConfig = props.activity.marketingConfig || {}
    const groupBuyConfig = marketingConfig.groupBuy || {}
    groupForm.value.groupPrice = groupBuyConfig.price || props.activity.price || 0
    groupForm.value.targetPeople = groupBuyConfig.minPeople || 2
    groupForm.value.maxPeople = groupBuyConfig.maxPeople || 50
  }
})

onMounted(() => {
  // 定时更新剩余时间
  const timer = setInterval(() => {
    if (props.visible && !props.isCreating && remainingTime.value > 0) {
      // 强制更新
    }
  }, 1000)

  onBeforeUnmount(() => {
    clearInterval(timer)
  })
})
</script>

<style scoped lang="scss">
.activity-info {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: var(--spacing-lg);
  margin-bottom: 20px;
  color: white;

  .activity-header {
    h3 {
      margin: 0 0 8px 0;
      font-size: var(--text-lg);
      font-weight: 600;
    }

    .activity-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .price-info {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);

        .original-price {
          font-size: var(--text-sm);
          text-decoration: line-through;
          opacity: 0.8;
        }

        .group-price {
          font-size: var(--text-xl);
          font-weight: 700;
        }

        .discount {
          background: rgba(255, 255, 255, 0.2);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: var(--text-xs);
        }
      }
    }
  }
}

.group-form {
  .form-tip {
    font-size: var(--text-xs);
    color: #909399;
    margin-top: 4px;
  }
}

.join-info {
  .group-status {
    background: #f8f9fa;
    border-radius: 8px;
    padding: var(--spacing-md);
    margin-bottom: 16px;

    .progress-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;

      .people-info {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);

        .current {
          font-size: var(--text-2xl);
          font-weight: 700;
          color: #409eff;
        }

        .separator {
          font-size: var(--text-base);
          color: #909399;
        }

        .target {
          font-size: var(--text-base);
          color: #909399;
        }

        .unit {
          font-size: var(--text-sm);
          color: #909399;
        }
      }

      .progress-bar {
        flex: 1;
        max-width: 200px;
      }
    }

    .time-info {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: var(--text-sm);
      color: #666;

      .expired {
        color: #f56c6c;
      }
    }
  }

  .group-leader {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background: white;
    border-radius: 8px;
    border: 1px solid #e4e7ed;

    .leader-info {
      .name {
        font-size: var(--text-sm);
        font-weight: 600;
        color: #303133;
      }

      .role {
        font-size: var(--text-xs);
        color: #909399;
        margin-top: 2px;
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
}
</style>