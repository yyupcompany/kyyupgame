<template>
  <van-popup
    v-model:show="dialogVisible"
    position="bottom"
    :style="{ height: '85%' }"
    round
  >
    <div class="edit-student-dialog">
      <!-- 头部 -->
      <div class="dialog-header">
        <van-nav-bar
          :title="isEdit ? '编辑学生' : '新增学生'"
          left-text="取消"
          right-text="保存"
          @click-left="handleClose"
          @click-right="handleSave"
        />
      </div>

      <!-- 表单内容 -->
      <div class="dialog-content">
        <van-form @submit="handleSave" ref="formRef">
          <!-- 基本信息 -->
          <van-cell-group inset title="基本信息">
            <van-field
              v-model="formData.name"
              name="name"
              label="姓名"
              placeholder="请输入学生姓名"
              :rules="[{ required: true, message: '请输入学生姓名' }]"
            />

            <van-field
              v-model="formData.studentId"
              name="studentId"
              label="学号"
              placeholder="请输入学号"
              :rules="[
                { required: true, message: '请输入学号' },
                { pattern: /^[A-Z]{2}\d{8}$/, message: '学号格式：2字母+8数字' }
              ]"
            />

            <van-field
              name="gender"
              label="性别"
              readonly
              is-link
              @click="showGenderPicker = true"
            >
              <template #input>
                <span>{{ formData.gender === 'male' ? '男' : formData.gender === 'female' ? '女' : '请选择' }}</span>
              </template>
            </van-field>

            <van-field
              name="birthDate"
              label="出生日期"
              readonly
              is-link
              @click="showBirthDatePicker = true"
            >
              <template #input>
                <span>{{ formData.birthDate || '请选择' }}</span>
              </template>
            </van-field>
          </van-cell-group>

          <!-- 班级信息 -->
          <van-cell-group inset title="班级信息">
            <van-field
              name="classId"
              label="班级"
              readonly
              is-link
              @click="showClassPicker = true"
            >
              <template #input>
                <span>{{ getClassName(formData.classId) }}</span>
              </template>
            </van-field>

            <van-field
              name="enrollmentDate"
              label="入学时间"
              readonly
              is-link
              @click="showEnrollmentDatePicker = true"
            >
              <template #input>
                <span>{{ formData.enrollmentDate || '请选择' }}</span>
              </template>
            </van-field>
          </van-cell-group>

          <!-- 家长信息 -->
          <van-cell-group inset title="家长信息">
            <van-field
              v-model="formData.parentName"
              name="parentName"
              label="家长姓名"
              placeholder="请输入家长姓名"
              :rules="[{ required: true, message: '请输入家长姓名' }]"
            />

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
              name="relationship"
              label="与学生关系"
              readonly
              is-link
              @click="showRelationshipPicker = true"
            >
              <template #input>
                <span>{{ formatRelationship(formData.relationship) }}</span>
              </template>
            </van-field>

            <van-field
              v-model="formData.address"
              name="address"
              label="家庭地址"
              type="textarea"
              rows="2"
              placeholder="请输入家庭地址"
            />
          </van-cell-group>

          <!-- 其他信息 -->
          <van-cell-group inset title="其他信息">
            <van-field
              v-model="formData.notes"
              name="notes"
              label="特殊说明"
              type="textarea"
              rows="3"
              placeholder="如过敏史、特殊照顾事项等"
            />

            <van-field name="healthStatus" label="健康状况">
              <template #input>
                <van-checkbox-group v-model="formData.healthStatus" direction="horizontal">
                  <van-checkbox name="healthy" shape="square">身体健康</van-checkbox>
                  <van-checkbox name="allergy" shape="square">有过敏史</van-checkbox>
                  <van-checkbox name="medication" shape="square">需要服药</van-checkbox>
                  <van-checkbox name="special_care" shape="square">特殊照顾</van-checkbox>
                </van-checkbox-group>
              </template>
            </van-field>
          </van-cell-group>
        </van-form>
      </div>

      <!-- 性别选择器 -->
      <van-popup v-model:show="showGenderPicker" position="bottom">
        <van-picker
          :columns="genderOptions"
          @confirm="onGenderConfirm"
          @cancel="showGenderPicker = false"
        />
      </van-popup>

      <!-- 出生日期选择器 -->
      <van-popup v-model:show="showBirthDatePicker" position="bottom">
        <van-datetime-picker
          v-model="birthDatePickerValue"
          type="date"
          title="选择出生日期"
          :min-date="minDate"
          :max-date="maxDate"
          @confirm="onBirthDateConfirm"
          @cancel="showBirthDatePicker = false"
        />
      </van-popup>

      <!-- 班级选择器 -->
      <van-popup v-model:show="showClassPicker" position="bottom">
        <van-picker
          :columns="classOptions"
          @confirm="onClassConfirm"
          @cancel="showClassPicker = false"
        />
      </van-popup>

      <!-- 入学时间选择器 -->
      <van-popup v-model:show="showEnrollmentDatePicker" position="bottom">
        <van-datetime-picker
          v-model="enrollmentDatePickerValue"
          type="date"
          title="选择入学时间"
          :min-date="minEnrollmentDate"
          :max-date="maxDate"
          @confirm="onEnrollmentDateConfirm"
          @cancel="showEnrollmentDatePicker = false"
        />
      </van-popup>

      <!-- 关系选择器 -->
      <van-popup v-model:show="showRelationshipPicker" position="bottom">
        <van-picker
          :columns="relationshipOptions"
          @confirm="onRelationshipConfirm"
          @cancel="showRelationshipPicker = false"
        />
      </van-popup>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { personnelCenterApi } from '@/api/personnel-center'

interface Student {
  id?: number
  name?: string
  studentId?: string
  gender?: string
  birthDate?: string
  classId?: string
  enrollmentDate?: string
  parentName?: string
  phone?: string
  relationship?: string
  address?: string
  notes?: string
  healthStatus?: string[]
}

interface Props {
  modelValue: boolean
  studentData: Student | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  refresh: []
}>()

// 响应式数据
const formRef = ref()
const showGenderPicker = ref(false)
const showBirthDatePicker = ref(false)
const showClassPicker = ref(false)
const showEnrollmentDatePicker = ref(false)
const showRelationshipPicker = ref(false)

// 日期选择器绑定值
const birthDatePickerValue = ref(new Date())
const enrollmentDatePickerValue = ref(new Date())

// 日期范围
const minDate = new Date(2015, 0, 1)
const maxDate = new Date()
const minEnrollmentDate = new Date(2020, 0, 1)

const formData = ref<Student>({
  name: '',
  studentId: '',
  gender: 'male',
  birthDate: '',
  classId: '',
  enrollmentDate: '',
  parentName: '',
  phone: '',
  relationship: 'mother',
  address: '',
  notes: '',
  healthStatus: ['healthy']
})

// 选项数据
const genderOptions = [
  { text: '男', value: 'male' },
  { text: '女', value: 'female' }
]

const classOptions = [
  { text: '小班A班', value: '1' },
  { text: '小班B班', value: '2' },
  { text: '中班A班', value: '3' },
  { text: '中班B班', value: '4' },
  { text: '大班A班', value: '5' },
  { text: '大班B班', value: '6' }
]

const relationshipOptions = [
  { text: '父亲', value: 'father' },
  { text: '母亲', value: 'mother' },
  { text: '爷爷', value: 'grandfather' },
  { text: '奶奶', value: 'grandmother' },
  { text: '其他', value: 'other' }
]

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isEdit = computed(() => !!props.studentData?.id)

// 辅助函数
const getClassName = (classId?: string) => {
  const option = classOptions.find(opt => opt.value === classId)
  return option?.text || '请选择'
}

const formatRelationship = (relationship?: string) => {
  const option = relationshipOptions.find(opt => opt.value === relationship)
  return option?.text || '请选择'
}

// 监听弹窗显示状态
watch(() => props.modelValue, (visible) => {
  if (visible && props.studentData) {
    // 编辑模式：填充数据
    formData.value = {
      id: props.studentData.id,
      name: props.studentData.name || '',
      studentId: props.studentData.studentId || '',
      gender: props.studentData.gender || 'male',
      birthDate: props.studentData.birthDate || '',
      classId: props.studentData.classId || '',
      enrollmentDate: props.studentData.enrollmentDate || '',
      parentName: props.studentData.parentName || '',
      phone: props.studentData.phone || '',
      relationship: props.studentData.relationship || 'mother',
      address: props.studentData.address || '',
      notes: props.studentData.notes || '',
      healthStatus: props.studentData.healthStatus || ['healthy']
    }

    // 初始化日期选择器
    if (props.studentData.birthDate) {
      birthDatePickerValue.value = new Date(props.studentData.birthDate)
    }
    if (props.studentData.enrollmentDate) {
      enrollmentDatePickerValue.value = new Date(props.studentData.enrollmentDate)
    }
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
    studentId: '',
    gender: 'male',
    birthDate: '',
    classId: '',
    enrollmentDate: '',
    parentName: '',
    phone: '',
    relationship: 'mother',
    address: '',
    notes: '',
    healthStatus: ['healthy']
  }
  birthDatePickerValue.value = new Date()
  enrollmentDatePickerValue.value = new Date()
}

// 选择器确认处理
const onGenderConfirm = ({ selectedOptions }: any) => {
  formData.value.gender = selectedOptions[0].value
  showGenderPicker.value = false
}

const onBirthDateConfirm = (value: Date) => {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  formData.value.birthDate = `${year}-${month}-${day}`
  showBirthDatePicker.value = false
}

const onClassConfirm = ({ selectedOptions }: any) => {
  formData.value.classId = selectedOptions[0].value
  showClassPicker.value = false
}

const onEnrollmentDateConfirm = (value: Date) => {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  formData.value.enrollmentDate = `${year}-${month}-${day}`
  showEnrollmentDatePicker.value = false
}

const onRelationshipConfirm = ({ selectedOptions }: any) => {
  formData.value.relationship = selectedOptions[0].value
  showRelationshipPicker.value = false
}

const handleSave = async () => {
  try {
    // 验证表单
    await formRef.value.validate()

    showLoadingToast({ message: '保存中...', forbidClick: true })

    let response
    if (isEdit.value) {
      // 更新学生
      response = await personnelCenterApi.updateStudent(String(formData.value.id), formData.value)
      if (response.success) {
        showToast('学生信息更新成功')
      }
    } else {
      // 创建学生
      response = await personnelCenterApi.createStudent(formData.value)
      if (response.success) {
        showToast('学生创建成功')
      }
    }

    emit('refresh')
    handleClose()
  } catch (error) {
    console.error('保存学生失败:', error)
    showToast('保存失败')
  } finally {
    closeToast()
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

.edit-student-dialog {
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

  :deep(.van-checkbox-group) {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }
}
</style>
