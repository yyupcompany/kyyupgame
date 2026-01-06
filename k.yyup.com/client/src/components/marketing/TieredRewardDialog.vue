<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
    >
      <el-form-item label="奖励类型" prop="type">
        <el-select
          v-model="form.type"
          placeholder="选择奖励类型"
          style="width: 100%"
          @change="handleTypeChange"
        >
          <el-option label="报名奖励" value="registration" />
          <el-option label="团购奖励" value="group_buy" />
          <el-option label="积攒奖励" value="collect_reward" />
          <el-option label="推荐奖励" value="referral" />
        </el-select>
      </el-form-item>

      <el-form-item label="关联活动" prop="activityId">
        <el-select
          v-model="form.activityId"
          placeholder="选择关联活动"
          filterable
          style="width: 100%"
        >
          <el-option
            v-for="activity in filteredActivities"
            :key="activity.id"
            :label="activity.title"
            :value="activity.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="阶梯层级" prop="tier">
        <el-input-number
          v-model="form.tier"
          :min="1"
          :max="2"
          placeholder="选择阶梯层级"
          style="width: 100%"
        />
        <div class="form-tip">最多支持2级阶梯奖励</div>
      </el-form-item>

      <el-form-item label="触发条件" prop="targetValue">
        <el-input-number
          v-model="form.targetValue"
          :min="1"
          placeholder="输入触发条件数值"
          style="width: 100%"
        />
        <span class="unit-label">{{ getConditionUnit(form.type) }}</span>
      </el-form-item>

      <el-form-item label="奖励类型" prop="rewardType">
        <el-select
          v-model="form.rewardType"
          placeholder="选择奖励类型"
          style="width: 100%"
          @change="handleRewardTypeChange"
        >
          <el-option label="折扣优惠" value="discount" />
          <el-option label="赠送礼品" value="gift" />
          <el-option label="现金返还" value="cashback" />
          <el-option label="积分奖励" value="points" />
          <el-option label="免费名额" value="free" />
        </el-select>
      </el-form-item>

      <el-form-item label="奖励内容" prop="rewardValue">
        <el-input
          v-if="form.rewardType === 'gift'"
          v-model="form.rewardValue"
          placeholder="输入礼品名称"
        />
        <el-input-number
          v-else-if="form.rewardType === 'discount'"
          v-model="form.rewardValue"
          :min="1"
          :max="99"
          placeholder="折扣百分比"
          style="width: 100%"
        />
        <el-input-number
          v-else-if="form.rewardType === 'cashback'"
          v-model="form.rewardValue"
          :min="0"
          :max="10000"
          placeholder="返还金额"
          style="width: 100%"
        />
        <el-input-number
          v-else-if="form.rewardType === 'points'"
          v-model="form.rewardValue"
          :min="1"
          placeholder="积分数量"
          style="width: 100%"
        />
        <el-input
          v-else
          v-model="form.rewardValue"
          placeholder="输入奖励具体内容"
        />
        <span class="unit-label">{{ getRewardUnit(form.rewardType) }}</span>
      </el-form-item>

      <el-form-item label="奖励描述" prop="rewardDescription">
        <el-input
          v-model="form.rewardDescription"
          type="textarea"
          :rows="3"
          placeholder="输入奖励描述文字"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="最大获奖人数" prop="maxWinners">
        <el-input-number
          v-model="form.maxWinners"
          :min="1"
          placeholder="限制最大获奖人数，留空表示无限制"
          style="width: 100%"
        />
        <div class="form-tip">留空表示不限制获奖人数</div>
      </el-form-item>

      <el-form-item label="过期时间" prop="expiryDate">
        <el-date-picker
          v-model="form.expiryDate"
          type="datetime"
          placeholder="选择奖励过期时间"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 100%"
        />
        <div class="form-tip">留空表示永不过期</div>
      </el-form-item>

      <el-form-item label="启用状态" prop="isActive">
        <el-switch
          v-model="form.isActive"
          active-text="启用"
          inactive-text="禁用"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted } from 'vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { request } from '@/utils/request'
import { TIERED_REWARD_ENDPOINTS } from '@/api/endpoints/marketing'

interface Props {
  modelValue: boolean
  reward?: any
  activities: any[]
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'success'])

const visible = ref(false)
const loading = ref(false)
const formRef = ref<FormInstance>()

// 表单数据
const form = reactive({
  type: '',
  activityId: undefined as number | undefined,
  tier: 1,
  targetValue: 0,
  rewardType: '',
  rewardValue: '',
  rewardDescription: '',
  maxWinners: undefined as number | undefined,
  expiryDate: '',
  isActive: true
})

// 表单验证规则
const rules: FormRules = {
  type: [
    { required: true, message: '请选择奖励类型', trigger: 'change' }
  ],
  activityId: [
    { required: true, message: '请选择关联活动', trigger: 'change' }
  ],
  tier: [
    { required: true, message: '请选择阶梯层级', trigger: 'blur' },
    { type: 'number', min: 1, max: 2, message: '阶梯层级必须在1-2之间', trigger: 'blur' }
  ],
  targetValue: [
    { required: true, message: '请输入触发条件', trigger: 'blur' },
    { type: 'number', min: 1, message: '触发条件必须大于0', trigger: 'blur' }
  ],
  rewardType: [
    { required: true, message: '请选择奖励类型', trigger: 'change' }
  ],
  rewardValue: [
    { required: true, message: '请输入奖励内容', trigger: 'blur' }
  ],
  rewardDescription: [
    { required: true, message: '请输入奖励描述', trigger: 'blur' }
  ]
}

// 计算属性
const dialogTitle = computed(() => {
  return props.reward ? '编辑阶梯奖励' : '创建阶梯奖励'
})

const filteredActivities = computed(() => {
  if (!form.type) return props.activities
  // 根据奖励类型过滤相应的活动
  return props.activities.filter(activity => {
    return activity.marketingConfig && activity.marketingConfig[form.type]?.enabled
  })
})

// 监听器
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    if (props.reward) {
      // 编辑模式，填充表单数据
      Object.assign(form, {
        type: props.reward.type,
        activityId: props.reward.activityId,
        tier: props.reward.tier,
        targetValue: props.reward.targetValue,
        rewardType: props.reward.rewardType,
        rewardValue: props.reward.rewardValue,
        rewardDescription: props.reward.rewardDescription,
        maxWinners: props.reward.maxWinners,
        expiryDate: props.reward.expiryDate,
        isActive: props.reward.isActive
      })
    } else {
      // 新建模式，重置表单
      resetForm()
    }
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 方法
const resetForm = () => {
  Object.assign(form, {
    type: '',
    activityId: undefined,
    tier: 1,
    targetValue: 0,
    rewardType: '',
    rewardValue: '',
    rewardDescription: '',
    maxWinners: undefined,
    expiryDate: '',
    isActive: true
  })
  formRef.value?.clearValidate()
}

const handleClose = () => {
  resetForm()
}

const handleCancel = () => {
  visible.value = false
  resetForm()
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    loading.value = true

    const isEdit = !!props.reward
    const url = isEdit
      ? TIERED_REWARD_ENDPOINTS.UPDATE(props.reward.id)
      : TIERED_REWARD_ENDPOINTS.CREATE
    const method = isEdit ? 'put' : 'post'

    // 处理奖励值
    let processedRewardValue = form.rewardValue
    if (form.rewardType === 'discount' || form.rewardType === 'cashback' || form.rewardType === 'points') {
      processedRewardValue = String(form.rewardValue)
    }

    const payload = {
      ...form,
      rewardValue: processedRewardValue
    }

    const response = await request[method](url, payload)

    if (response.success) {
      ElMessage.success(`阶梯奖励${isEdit ? '更新' : '创建'}成功`)
      emit('success', response.data)
      visible.value = false
      resetForm()
    } else {
      throw new Error(response.message || '操作失败')
    }
  } catch (error: any) {
    if (error.message) {
      ElMessage.error(error.message)
    }
  } finally {
    loading.value = false
  }
}

const handleTypeChange = () => {
  // 清空关联活动
  form.activityId = undefined
}

const handleRewardTypeChange = () => {
  // 清空奖励内容
  form.rewardValue = ''
}

const getConditionUnit = (type: string) => {
  const unitMap: Record<string, string> = {
    'registration': '人报名',
    'group_buy': '人成团',
    'collect_reward': '人积攒',
    'referral': '人推荐'
  }
  return unitMap[type] || '个'
}

const getRewardUnit = (type: string) => {
  const unitMap: Record<string, string> = {
    'discount': '%',
    'gift': '',
    'cashback': '元',
    'points': '积分',
    'free': ''
  }
  return unitMap[type] || ''
}
</script>

<style scoped lang="scss">
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
}

.unit-label {
  margin-left: 12px;
  color: #909399;
}

.form-tip {
  margin-top: 4px;
  font-size: var(--text-xs);
  color: #909399;
}
</style>