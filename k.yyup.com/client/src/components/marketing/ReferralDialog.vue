<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
    >
      <el-form-item label="推荐人" prop="referrerId" v-if="!referral">
        <el-select
          v-model="form.referrerId"
          placeholder="选择推荐人"
          filterable
          remote
          :remote-method="searchUsers"
          :loading="searching"
          style="width: 100%"
        >
          <el-option
            v-for="user in userOptions"
            :key="user.id"
            :label="`${user.name} (${user.phone})`"
            :value="user.id"
          >
            <div class="user-option">
              <el-avatar :size="24" :src="user.avatar">
                {{ user.name?.charAt(0) }}
              </el-avatar>
              <div class="user-info">
                <div class="name">{{ user.name }}</div>
                <div class="phone">{{ user.phone }}</div>
              </div>
            </div>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="被推荐人" prop="refereeId">
        <el-select
          v-model="form.refereeId"
          placeholder="选择被推荐人"
          filterable
          remote
          :remote-method="searchUsers"
          :loading="searching"
          style="width: 100%"
        >
          <el-option
            v-for="user in userOptions"
            :key="user.id"
            :label="`${user.name} (${user.phone})`"
            :value="user.id"
          >
            <div class="user-option">
              <el-avatar :size="24" :src="user.avatar">
                {{ user.name?.charAt(0) }}
              </el-avatar>
              <div class="user-info">
                <div class="name">{{ user.name }}</div>
                <div class="phone">{{ user.phone }}</div>
              </div>
            </div>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="奖励金额" prop="rewardAmount">
        <el-input-number
          v-model="form.rewardAmount"
          :min="0"
          :max="10000"
          :step="10"
          placeholder="输入奖励金额"
          style="width: 100%"
        />
        <span class="unit-label">元</span>
      </el-form-item>

      <el-form-item label="推荐码" prop="referralCode" v-if="!referral">
        <el-input
          v-model="form.referralCode"
          placeholder="自动生成推荐码"
          readonly
        >
          <template #append>
            <el-button @click="generateCode">生成</el-button>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="关联活动" prop="activityId">
        <el-select
          v-model="form.activityId"
          placeholder="选择关联活动"
          clearable
          style="width: 100%"
        >
          <el-option
            v-for="activity in activities"
            :key="activity.id"
            :label="activity.title"
            :value="activity.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="备注" prop="notes">
        <el-input
          v-model="form.notes"
          type="textarea"
          :rows="3"
          placeholder="输入推荐备注信息"
          maxlength="500"
          show-word-limit
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
import { ref, reactive, watch, onMounted } from 'vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { request } from '@/utils/request'
import { REFERRAL_ENDPOINTS } from '@/api/endpoints/marketing'

interface Props {
  modelValue: boolean
  referral?: any
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'success'])

const visible = ref(false)
const loading = ref(false)
const searching = ref(false)
const formRef = ref<FormInstance>()
const userOptions = ref<any[]>([])
const activities = ref<any[]>([])

// 表单数据
const form = reactive({
  referrerId: undefined as number | undefined,
  refereeId: undefined as number | undefined,
  rewardAmount: 0,
  referralCode: '',
  activityId: undefined as number | undefined,
  notes: ''
})

// 表单验证规则
const rules: FormRules = {
  referrerId: [
    { required: true, message: '请选择推荐人', trigger: 'change' }
  ],
  refereeId: [
    { required: true, message: '请选择被推荐人', trigger: 'change' }
  ],
  rewardAmount: [
    { required: true, message: '请输入奖励金额', trigger: 'blur' },
    { type: 'number', min: 0, message: '奖励金额不能小于0', trigger: 'blur' }
  ],
  referralCode: [
    { required: true, message: '请生成推荐码', trigger: 'blur' }
  ]
}

// 计算属性
const dialogTitle = computed(() => {
  return props.referral ? '编辑推荐记录' : '创建推荐记录'
})

// 监听器
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    if (props.referral) {
      // 编辑模式，填充表单数据
      Object.assign(form, {
        referrerId: props.referral.referrerId,
        refereeId: props.referral.refereeId,
        rewardAmount: props.referral.rewardAmount,
        referralCode: props.referral.referralCode,
        activityId: props.referral.activityId,
        notes: props.referral.notes || ''
      })
    } else {
      // 新建模式，重置表单
      resetForm()
      generateCode()
    }
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 方法
const loadActivities = async () => {
  try {
    const response = await request.get('/api/activities', {
      params: { pageSize: 100 }
    })
    if (response.success) {
      activities.value = response.data.items
    }
  } catch (error) {
    console.error('加载活动列表失败:', error)
  }
}

const searchUsers = async (query: string) => {
  if (!query) {
    userOptions.value = []
    return
  }

  try {
    searching.value = true
    const response = await request.get('/api/users/search', {
      params: { query, pageSize: 20 }
    })
    if (response.success) {
      userOptions.value = response.data
    }
  } catch (error) {
    console.error('搜索用户失败:', error)
  } finally {
    searching.value = false
  }
}

const generateCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  form.referralCode = result
}

const resetForm = () => {
  Object.assign(form, {
    referrerId: undefined,
    refereeId: undefined,
    rewardAmount: 0,
    referralCode: '',
    activityId: undefined,
    notes: ''
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

    const isEdit = !!props.referral
    const url = isEdit
      ? REFERRAL_ENDPOINTS.UPDATE(props.referral.id)
      : REFERRAL_ENDPOINTS.CREATE
    const method = isEdit ? 'put' : 'post'

    const response = await request[method](url, form)

    if (response.success) {
      ElMessage.success(`推荐记录${isEdit ? '更新' : '创建'}成功`)
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

// 生命周期
onMounted(() => {
  loadActivities()
})
</script>

<style scoped lang="scss">
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
}

.user-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);

  .user-info {
    .name {
      font-weight: 600;
      color: #303133;
    }

    .phone {
      font-size: var(--text-xs);
      color: #909399;
    }
  }
}

.unit-label {
  margin-left: 12px;
  color: #909399;
}
</style>