<template>
  <van-dialog
    v-model:show="dialogVisible"
    :title="isEdit ? '编辑学生' : '新增学生'"
    show-cancel-button
    :before-close="handleClose"
    class="student-edit-dialog"
  >
    <div class="form-container">
      <van-form @submit="handleSubmit" ref="formRef">
        <!-- 基本信息 -->
        <van-cell-group title="基本信息" inset>
          <van-field
            v-model="formData.name"
            name="name"
            label="姓名"
            placeholder="请输入学生姓名"
            :rules="[{ required: true, message: '请输入学生姓名' }]"
          />

          <van-field
            v-model="formData.studentNo"
            name="studentNo"
            label="学号"
            placeholder="请输入学号"
            :rules="[{ required: true, message: '请输入学号' }]"
          />

          <van-field
            name="gender"
            label="性别"
            placeholder="请选择性别"
            readonly
            is-link
            @click="showGenderPicker = true"
            :value="genderText"
          >
            <template #right-icon>
              <van-icon name="arrow" />
            </template>
          </van-field>

          <van-field
            v-model="birthDateText"
            name="birthDate"
            label="出生日期"
            placeholder="请选择出生日期"
            readonly
            is-link
            @click="showBirthDatePicker = true"
          />

          <van-field
            name="classId"
            label="班级"
            placeholder="请选择班级"
            readonly
            is-link
            @click="showClassPicker = true"
            :value="className"
          >
            <template #right-icon>
              <van-icon name="arrow" />
            </template>
          </van-field>

          <van-field
            v-model="formData.householdAddress"
            name="address"
            label="家庭住址"
            placeholder="请输入家庭住址"
            type="textarea"
            rows="2"
          />

          <van-field
            name="status"
            label="状态"
            placeholder="请选择状态"
            readonly
            is-link
            @click="showStatusPicker = true"
            :value="statusText"
          >
            <template #right-icon>
              <van-icon name="arrow" />
            </template>
          </van-field>
        </van-cell-group>

        <!-- 健康信息 -->
        <van-cell-group title="健康信息" inset>
          <van-field
            v-model="formData.allergyHistory"
            name="allergyHistory"
            label="过敏史"
            placeholder="请输入过敏史，多个用逗号分隔"
            type="textarea"
            rows="2"
          />

          <van-field
            v-model="formData.specialNeeds"
            name="specialNeeds"
            label="特殊需求"
            placeholder="请输入特殊需求"
            type="textarea"
            rows="2"
          />
        </van-cell-group>

        <!-- 家长信息 -->
        <van-cell-group title="家长信息" inset>
          <van-field
            v-model="formData.guardianName"
            name="guardianName"
            label="家长姓名"
            placeholder="请输入家长姓名"
          />

          <van-field
            v-model="formData.guardianPhone"
            name="guardianPhone"
            label="联系电话"
            placeholder="请输入联系电话"
            type="tel"
          />

          <van-field
            v-model="formData.guardianOccupation"
            name="guardianOccupation"
            label="职业"
            placeholder="请输入职业"
          />

          <van-field
            name="relationship"
            label="与孩子关系"
            placeholder="请选择关系"
            readonly
            is-link
            @click="showRelationshipPicker = true"
            :value="relationshipText"
          >
            <template #right-icon>
              <van-icon name="arrow" />
            </template>
          </van-field>
        </van-cell-group>

        <!-- 其他信息 -->
        <van-cell-group title="其他信息" inset>
          <van-field
            v-model="formData.interests"
            name="interests"
            label="兴趣爱好"
            placeholder="请输入兴趣爱好，多个用逗号分隔"
          />

          <van-field
            v-model="formData.remark"
            name="remark"
            label="备注"
            placeholder="请输入备注信息"
            type="textarea"
            rows="3"
          />
        </van-cell-group>
      </van-form>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <van-button @click="handleClose">取消</van-button>
        <van-button type="primary" @click="handleSubmit" :loading="saving">
          {{ isEdit ? '更新' : '创建' }}
        </van-button>
      </div>
    </template>

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
      <van-date-picker
        v-model="birthDateValue"
        @confirm="onBirthDateConfirm"
        @cancel="showBirthDatePicker = false"
        :max-date="maxDate"
        :min-date="minDate"
      />
    </van-popup>

    <!-- 班级选择器 -->
    <van-popup v-model:show="showClassPicker" position="bottom">
      <van-picker
        :columns="classPickerOptions"
        @confirm="onClassConfirm"
        @cancel="showClassPicker = false"
      />
    </van-popup>

    <!-- 状态选择器 -->
    <van-popup v-model:show="showStatusPicker" position="bottom">
      <van-picker
        :columns="statusOptions"
        @confirm="onStatusConfirm"
        @cancel="showStatusPicker = false"
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
  </van-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { showToast } from 'vant'
import type { Student } from '@/api/modules/student'
import type { Class } from '@/api/modules/class'

interface Props {
  show: boolean
  student?: Student | null
  classList: Class[]
}

interface Emits {
  (e: 'update:show', value: boolean): void
  (e: 'save', data: any): void
}

const props = withDefaults(defineProps<Props>(), {
  student: null,
  classList: () => []
})

const emit = defineEmits<Emits>()

// 响应式数据
const formRef = ref()
const saving = ref(false)
const showGenderPicker = ref(false)
const showBirthDatePicker = ref(false)
const showClassPicker = ref(false)
const showStatusPicker = ref(false)
const showRelationshipPicker = ref(false)
const birthDateValue = ref(new Date())

// 表单数据
const formData = reactive({
  name: '',
  studentNo: '',
  gender: '',
  birthDate: '',
  classId: '',
  householdAddress: '',
  status: 'ACTIVE',
  allergyHistory: '',
  specialNeeds: '',
  guardianName: '',
  guardianPhone: '',
  guardianOccupation: '',
  relationship: '',
  interests: '',
  remark: ''
})

// 选项数据
const genderOptions = [
  { text: '男', value: 'MALE' },
  { text: '女', value: 'FEMALE' }
]

const statusOptions = [
  { text: '在读', value: 'ACTIVE' },
  { text: '毕业', value: 'GRADUATED' },
  { text: '转校', value: 'TRANSFERRED' },
  { text: '休学', value: 'SUSPENDED' }
]

const relationshipOptions = [
  { text: '父亲', value: 'FATHER' },
  { text: '母亲', value: 'MOTHER' },
  { text: '爷爷', value: 'GRANDFATHER' },
  { text: '奶奶', value: 'GRANDMOTHER' },
  { text: '外公', value: 'MATERNAL_GRANDFATHER' },
  { text: '外婆', value: 'MATERNAL_GRANDMOTHER' },
  { text: '其他', value: 'OTHER' }
]

// 计算属性
const dialogVisible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

const isEdit = computed(() => !!props.student)

const genderText = computed(() => {
  const option = genderOptions.find(item => item.value === formData.gender)
  return option?.text || ''
})

const className = computed(() => {
  const cls = props.classList.find(item => item.id === formData.classId)
  return cls?.name || ''
})

const statusText = computed(() => {
  const option = statusOptions.find(item => item.value === formData.status)
  return option?.text || ''
})

const relationshipText = computed(() => {
  const option = relationshipOptions.find(item => item.value === formData.relationship)
  return option?.text || ''
})

const birthDateText = computed(() => {
  return formData.birthDate ? new Date(formData.birthDate).toLocaleDateString('zh-CN') : ''
})

const classPickerOptions = computed(() => [
  { text: '请选择班级', value: '' },
  ...props.classList.map(cls => ({ text: cls.name, value: cls.id }))
])

const maxDate = new Date()
const minDate = new Date(maxDate.getFullYear() - 20, maxDate.getMonth(), maxDate.getDate())

// 监听器
watch(() => props.show, (show) => {
  if (show) {
    initFormData()
  }
})

// 方法
const initFormData = () => {
  if (props.student) {
    Object.assign(formData, {
      name: props.student.name || '',
      studentNo: props.student.studentNo || '',
      gender: props.student.gender || '',
      birthDate: props.student.birthDate || '',
      classId: props.student.classId || '',
      householdAddress: props.student.householdAddress || '',
      status: props.student.status || 'ACTIVE',
      allergyHistory: props.student.allergyHistory || '',
      specialNeeds: props.student.specialNeeds || '',
      guardianName: props.student.guardian?.name || '',
      guardianPhone: props.student.guardian?.phone || '',
      guardianOccupation: props.student.guardian?.occupation || '',
      relationship: props.student.guardian?.relationship || '',
      interests: props.student.interests || '',
      remark: props.student.remark || ''
    })

    if (props.student.birthDate) {
      birthDateValue.value = new Date(props.student.birthDate)
    }
  } else {
    // 重置表单
    Object.keys(formData).forEach(key => {
      formData[key as keyof typeof formData] = ''
    })
    formData.status = 'ACTIVE'
    birthDateValue.value = new Date()
  }
}

const handleClose = () => {
  dialogVisible.value = false
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    saving.value = true

    const saveData = {
      ...formData,
      guardian: {
        name: formData.guardianName,
        phone: formData.guardianPhone,
        occupation: formData.guardianOccupation,
        relationship: formData.relationship
      }
    }

    // 移除不需要的字段
    delete (saveData as any).guardianName
    delete (saveData as any).guardianPhone
    delete (saveData as any).guardianOccupation
    delete (saveData as any).relationship

    emit('save', saveData)
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    saving.value = false
  }
}

// 选择器确认事件
const onGenderConfirm = ({ selectedOptions }: any) => {
  formData.gender = selectedOptions[0]?.value || ''
  showGenderPicker.value = false
}

const onBirthDateConfirm = () => {
  formData.birthDate = birthDateValue.value.toISOString().split('T')[0]
  showBirthDatePicker.value = false
}

const onClassConfirm = ({ selectedOptions }: any) => {
  formData.classId = selectedOptions[0]?.value || ''
  showClassPicker.value = false
}

const onStatusConfirm = ({ selectedOptions }: any) => {
  formData.status = selectedOptions[0]?.value || 'ACTIVE'
  showStatusPicker.value = false
}

const onRelationshipConfirm = ({ selectedOptions }: any) => {
  formData.relationship = selectedOptions[0]?.value || ''
  showRelationshipPicker.value = false
}

// 生命周期
onMounted(() => {
  if (props.show) {
    initFormData()
  }
})
</script>

<style lang="scss" scoped>
.student-edit-dialog {
  .form-container {
    max-height: 70vh;
    overflow-y: auto;
    padding: 0 16px;

    .van-cell-group {
      margin-bottom: 16px;
    }
  }

  .dialog-footer {
    display: flex;
    gap: var(--spacing-md);
    padding: var(--spacing-md);

    .van-button {
      flex: 1;
    }
  }
}

:deep(.van-dialog__content) {
  padding: 0;
}

:deep(.van-cell-group__title) {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--van-text-color);
  padding: var(--spacing-md) 16px 8px;
}

:deep(.van-cell) {
  padding: var(--spacing-md) 16px;
}

:deep(.van-field__label) {
  width: 80px;
}
</style>