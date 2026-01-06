<template>
  <van-popup
    v-model:show="dialogVisible"
    position="bottom"
    :style="{ height: '85%' }"
    round
  >
    <div class="teacher-edit-dialog">
      <!-- 头部 -->
      <div class="dialog-header">
        <van-nav-bar
          :title="isEdit ? '编辑教师' : '添加教师'"
          left-text="取消"
          right-text="保存"
          @click-left="handleClose"
          @click-right="handleSave"
        />
      </div>

      <!-- 表单内容 -->
      <div class="dialog-content">
        <van-form @submit="handleSave" ref="formRef">
          <van-cell-group inset title="基本信息">
            <van-field
              v-model="formData.name"
              name="name"
              label="姓名"
              placeholder="请输入教师姓名"
              :rules="[{ required: true, message: '请输入教师姓名' }]"
            />

            <van-field name="gender" label="性别" readonly is-link @click="showGenderPicker = true">
              <template #input>
                <span>{{ formData.gender === 'MALE' ? '男' : formData.gender === 'FEMALE' ? '女' : '请选择' }}</span>
              </template>
            </van-field>

            <van-field
              v-model="formData.phone"
              name="phone"
              label="联系电话"
              type="tel"
              placeholder="请输入联系电话"
              :rules="[
                { required: true, message: '请输入联系电话' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
              ]"
            />

            <van-field
              v-model="formData.email"
              name="email"
              label="电子邮箱"
              type="email"
              placeholder="请输入电子邮箱"
              :rules="[
                { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '请输入正确的邮箱' }
              ]"
            />
          </van-cell-group>

          <van-cell-group inset title="工作信息">
            <van-field name="position" label="职位" readonly is-link @click="showPositionPicker = true">
              <template #input>
                <span>{{ positionText || '请选择' }}</span>
              </template>
            </van-field>

            <van-field
              v-model="formData.employeeId"
              name="employeeId"
              label="教师编号"
              placeholder="请输入教师编号"
            />

            <van-field
              v-model="formData.department"
              name="department"
              label="部门"
              placeholder="请输入部门"
            />
          </van-cell-group>

          <van-cell-group inset title="其他信息">
            <van-field
              v-model="formData.title"
              name="title"
              label="职称"
              placeholder="请输入职称"
            />

            <van-field
              v-model="formData.hireDate"
              name="hireDate"
              label="入职日期"
              readonly
              is-link
              @click="showDatePicker = true"
            >
              <template #input>
                <span>{{ formData.hireDate || '请选择' }}</span>
              </template>
            </van-field>

            <van-field
              name="status"
              label="状态"
              readonly
              is-link
              @click="showStatusPicker = true"
            >
              <template #input>
                <span>{{ statusText || '请选择' }}</span>
              </template>
            </van-field>
          </van-cell-group>
        </van-form>
      </div>

      <!-- 性别选择器 -->
      <van-popup v-model:show="showGenderPicker" position="bottom">
        <van-picker
          :columns="genderColumns"
          @confirm="onGenderConfirm"
          @cancel="showGenderPicker = false"
        />
      </van-popup>

      <!-- 职位选择器 -->
      <van-popup v-model:show="showPositionPicker" position="bottom">
        <van-picker
          :columns="positionColumns"
          @confirm="onPositionConfirm"
          @cancel="showPositionPicker = false"
        />
      </van-popup>

      <!-- 日期选择器 -->
      <van-popup v-model:show="showDatePicker" position="bottom">
        <van-datetime-picker
          v-model="selectedDate"
          type="date"
          :min-date="minDate"
          :max-date="maxDate"
          @confirm="onDateConfirm"
          @cancel="showDatePicker = false"
        />
      </van-popup>

      <!-- 状态选择器 -->
      <van-popup v-model:show="showStatusPicker" position="bottom">
        <van-picker
          :columns="statusColumns"
          @confirm="onStatusConfirm"
          @cancel="showStatusPicker = false"
        />
      </van-popup>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { createTeacher, updateTeacher } from '@/api/modules/teacher'

interface Teacher {
  id?: string
  name?: string
  gender?: 'MALE' | 'FEMALE'
  phone?: string
  email?: string
  position?: string
  employeeId?: string
  department?: string
  title?: string
  hireDate?: string
  status?: string
  kindergartenId?: string
}

interface Props {
  modelValue: boolean
  teacherData: Teacher | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  refresh: []
}>()

// 响应式数据
const formRef = ref()
const showGenderPicker = ref(false)
const showPositionPicker = ref(false)
const showDatePicker = ref(false)
const showStatusPicker = ref(false)

const selectedDate = ref(new Date())
const minDate = new Date(1990, 0, 1)
const maxDate = new Date()

const formData = ref<Teacher>({
  name: '',
  gender: 'MALE',
  phone: '',
  email: '',
  position: 'TEACHER',
  employeeId: '',
  department: '',
  title: '',
  hireDate: '',
  status: 'ACTIVE',
  kindergartenId: ''
})

// 选项数据
const genderColumns = [
  { text: '男', value: 'MALE' },
  { text: '女', value: 'FEMALE' }
]

const positionColumns = [
  { text: '教师', value: 'TEACHER' },
  { text: '主班老师', value: 'HEAD_TEACHER' },
  { text: '配班老师', value: 'ASSISTANT_TEACHER' },
  { text: '保育员', value: 'CAREGIVER' },
  { text: '园长', value: 'PRINCIPAL' },
  { text: '保教主任', value: 'EDUCATION_DIRECTOR' }
]

const statusColumns = [
  { text: '在职', value: 'ACTIVE' },
  { text: '离职', value: 'INACTIVE' },
  { text: '试用期', value: 'PROBATION' },
  { text: '休假', value: 'ON_LEAVE' }
]

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isEdit = computed(() => !!props.teacherData?.id)

const positionText = computed(() => {
  const position = positionColumns.find(p => p.value === formData.value.position)
  return position?.text || ''
})

const statusText = computed(() => {
  const status = statusColumns.find(s => s.value === formData.value.status)
  return status?.text || ''
})

// 监听弹窗显示状态
watch(() => props.modelValue, (visible) => {
  if (visible && props.teacherData) {
    // 编辑模式：填充数据
    formData.value = { ...props.teacherData }
  } else if (visible) {
    // 新建模式：重置表单
    resetForm()
  }
})

// 方法
const handleClose = () => {
  emit('update:modelValue', false)
}

const resetForm = () => {
  formData.value = {
    name: '',
    gender: 'MALE',
    phone: '',
    email: '',
    position: 'TEACHER',
    employeeId: '',
    department: '',
    title: '',
    hireDate: '',
    status: 'ACTIVE',
    kindergartenId: ''
  }
}

// 选择器确认处理
const onGenderConfirm = ({ selectedOptions }: any) => {
  formData.value.gender = selectedOptions[0].value
  showGenderPicker.value = false
}

const onPositionConfirm = ({ selectedOptions }: any) => {
  formData.value.position = selectedOptions[0].value
  showPositionPicker.value = false
}

const onDateConfirm = (value: Date) => {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  formData.value.hireDate = `${year}-${month}-${day}`
  showDatePicker.value = false
}

const onStatusConfirm = ({ selectedOptions }: any) => {
  formData.value.status = selectedOptions[0].value
  showStatusPicker.value = false
}

const handleSave = async () => {
  try {
    // 验证表单
    await formRef.value.validate()

    showLoadingToast({ message: '保存中...', forbidClick: true })

    if (isEdit.value) {
      // 更新教师
      await updateTeacher(props.teacherData!.id!, formData.value)
      showToast('教师信息更新成功')
    } else {
      // 创建教师
      await createTeacher(formData.value as any)
      showToast('教师添加成功')
    }

    emit('refresh')
    handleClose()
  } catch (error: any) {
    console.error('保存教师失败:', error)
    showToast(error.message || '保存失败')
  } finally {
    closeToast()
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

.teacher-edit-dialog {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f7f8fa;

  .dialog-header {
    flex-shrink: 0;
  }

  .dialog-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-md) 0;
  }

  :deep(.van-cell-group) {
    margin-bottom: 12px;
  }

  :deep(.van-cell-group__title) {
    font-weight: 600;
    color: var(--primary-color);
  }
}
</style>
