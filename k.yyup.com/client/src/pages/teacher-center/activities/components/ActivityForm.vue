<template>
  <el-dialog
    :model-value="visible"
    :title="isEdit ? '编辑活动' : '新建活动'"
    width="700px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="活动标题" prop="title">
        <el-input v-model="formData.title" placeholder="请输入活动标题" />
      </el-form-item>

      <el-form-item label="活动类型" prop="type">
        <el-select v-model="formData.type" placeholder="请选择活动类型">
          <el-option label="教学活动" value="teaching" />
          <el-option label="户外活动" value="outdoor" />
          <el-option label="节日庆典" value="festival" />
          <el-option label="家长活动" value="parent" />
        </el-select>
      </el-form-item>

      <el-form-item label="活动日期" prop="date">
        <el-date-picker
          v-model="formData.date"
          type="date"
          placeholder="选择活动日期"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="活动时间" prop="timeRange">
        <el-time-picker
          v-model="formData.timeRange"
          is-range
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="活动地点" prop="location">
        <el-input v-model="formData.location" placeholder="请输入活动地点" />
      </el-form-item>

      <el-form-item label="活动描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="4"
          placeholder="请输入活动描述"
        />
      </el-form-item>

      <el-form-item label="参与对象">
        <el-checkbox-group v-model="formData.targetGroups">
          <el-checkbox label="小班">小班</el-checkbox>
          <el-checkbox label="中班">中班</el-checkbox>
          <el-checkbox label="大班">大班</el-checkbox>
          <el-checkbox label="家长">家长</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="最大人数">
        <el-input-number
          v-model="formData.maxParticipants"
          :min="1"
          :max="200"
          placeholder="不限制"
        />
      </el-form-item>

      <el-form-item label="报名截止">
        <el-date-picker
          v-model="formData.registrationDeadline"
          type="datetime"
          placeholder="选择报名截止时间"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="活动状态" v-if="isEdit">
        <el-select v-model="formData.status">
          <el-option label="即将开始" value="upcoming" />
          <el-option label="进行中" value="ongoing" />
          <el-option label="已完成" value="completed" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
      </el-form-item>

      <el-form-item label="备注">
        <el-input
          v-model="formData.notes"
          type="textarea"
          :rows="2"
          placeholder="其他备注信息"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading">
        {{ isEdit ? '更新' : '创建' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'

// Props
interface Activity {
  id?: number
  title: string
  type: string
  date: string
  startTime: string
  endTime: string
  location: string
  description: string
  targetGroups?: string[]
  maxParticipants?: number
  registrationDeadline?: string
  status?: string
  notes?: string
}

interface Props {
  visible: boolean
  activity?: Activity | null
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  activity: null
})

// Emits
const emit = defineEmits<{
  'close': []
  'submit': [data: Activity]
}>()

// 响应式数据
const formRef = ref<FormInstance>()
const loading = ref(false)

const formData = reactive({
  title: '',
  type: '',
  date: '',
  timeRange: [] as Date[],
  location: '',
  description: '',
  targetGroups: [] as string[],
  maxParticipants: undefined as number | undefined,
  registrationDeadline: '',
  status: 'upcoming',
  notes: ''
})

// 计算属性
const isEdit = computed(() => !!props.activity?.id)

// 表单验证规则
const formRules: FormRules = {
  title: [
    { required: true, message: '请输入活动标题', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择活动类型', trigger: 'change' }
  ],
  date: [
    { required: true, message: '请选择活动日期', trigger: 'change' }
  ],
  timeRange: [
    { required: true, message: '请选择活动时间', trigger: 'change' }
  ],
  location: [
    { required: true, message: '请输入活动地点', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入活动描述', trigger: 'blur' }
  ]
}

// 方法
const resetForm = () => {
  Object.assign(formData, {
    title: '',
    type: '',
    date: '',
    timeRange: [],
    location: '',
    description: '',
    targetGroups: [],
    maxParticipants: undefined,
    registrationDeadline: '',
    status: 'upcoming',
    notes: ''
  })
}

const loadActivityData = (activity: Activity) => {
  Object.assign(formData, {
    title: activity.title,
    type: activity.type,
    date: activity.date,
    timeRange: [
      new Date(`2000-01-01 ${activity.startTime}`),
      new Date(`2000-01-01 ${activity.endTime}`)
    ],
    location: activity.location,
    description: activity.description,
    targetGroups: activity.targetGroups || [],
    maxParticipants: activity.maxParticipants,
    registrationDeadline: activity.registrationDeadline || '',
    status: activity.status || 'upcoming',
    notes: activity.notes || ''
  })
}

const handleClose = () => {
  resetForm()
  emit('close')
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    // 构建提交数据
    const submitData: Activity = {
      title: formData.title,
      type: formData.type,
      date: formData.date,
      startTime: formData.timeRange[0]?.toTimeString().slice(0, 5) || '',
      endTime: formData.timeRange[1]?.toTimeString().slice(0, 5) || '',
      location: formData.location,
      description: formData.description,
      targetGroups: formData.targetGroups,
      maxParticipants: formData.maxParticipants,
      registrationDeadline: formData.registrationDeadline,
      status: formData.status,
      notes: formData.notes
    }

    if (isEdit.value && props.activity?.id) {
      submitData.id = props.activity.id
    }

    emit('submit', submitData)
    ElMessage.success(isEdit.value ? '活动更新成功' : '活动创建成功')
    handleClose()
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    loading.value = false
  }
}

// 监听活动数据变化
watch(
  () => props.activity,
  (newActivity) => {
    if (newActivity && props.visible) {
      loadActivityData(newActivity)
    }
  },
  { immediate: true }
)

// 监听对话框显示状态
watch(
  () => props.visible,
  (visible) => {
    if (visible && props.activity) {
      loadActivityData(props.activity)
    } else if (!visible) {
      resetForm()
    }
  }
)
</script>

<style lang="scss" scoped>
.el-form {
  .el-form-item {
    margin-bottom: var(--text-2xl);
  }
}
</style>
