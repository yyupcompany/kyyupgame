<template>
  <el-dialog
    v-model="visible"
    title="编辑学生信息"
    width="700px"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      size="default"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="学生姓名" prop="name">
            <el-input v-model="formData.name" placeholder="请输入学生姓名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="学号" prop="studentId">
            <el-input v-model="formData.studentId" placeholder="请输入学号" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="性别" prop="gender">
            <el-radio-group v-model="formData.gender">
              <el-radio value="男">男</el-radio>
              <el-radio value="女">女</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="出生日期" prop="birthDate">
            <el-date-picker
              v-model="formData.birthDate"
              type="date"
              placeholder="选择出生日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              class="full-width"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="班级" prop="classId">
            <el-select v-model="formData.classId" placeholder="请选择班级" class="full-width">
              <el-option label="小班A班" value="1" />
              <el-option label="小班B班" value="2" />
              <el-option label="中班A班" value="3" />
              <el-option label="中班B班" value="4" />
              <el-option label="大班A班" value="5" />
              <el-option label="大班B班" value="6" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="入学时间" prop="enrollmentDate">
            <el-date-picker
              v-model="formData.enrollmentDate"
              type="date"
              placeholder="选择入学时间"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              class="full-width"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">家长信息</el-divider>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="家长姓名" prop="parentName">
            <el-input v-model="formData.parentName" placeholder="请输入家长姓名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="formData.phone" placeholder="请输入联系电话" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="与学生关系" prop="relationship">
            <el-select v-model="formData.relationship" placeholder="请选择关系" class="full-width">
              <el-option label="父亲" value="father" />
              <el-option label="母亲" value="mother" />
              <el-option label="爷爷" value="grandfather" />
              <el-option label="奶奶" value="grandmother" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="家庭地址" prop="address">
            <el-input v-model="formData.address" placeholder="请输入家庭地址" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">其他信息</el-divider>

      <el-form-item label="特殊说明" prop="notes">
        <el-input
          v-model="formData.notes"
          type="textarea"
          :rows="3"
          placeholder="请输入特殊说明（如过敏史、特殊照顾事项等）"
        />
      </el-form-item>

      <el-form-item label="健康状况" prop="healthStatus">
        <el-checkbox-group v-model="formData.healthStatus">
          <el-checkbox value="healthy">身体健康</el-checkbox>
          <el-checkbox value="allergy">有过敏史</el-checkbox>
          <el-checkbox value="medication">需要服药</el-checkbox>
          <el-checkbox value="special_care">需要特殊照顾</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button @click="resetForm">重置</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">
          保存
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'

interface StudentForm {
  id?: number
  name: string
  studentId: string
  gender: string
  birthDate: string
  classId: string
  enrollmentDate: string
  parentName: string
  phone: string
  relationship: string
  address: string
  notes: string
  healthStatus: string[]
}

interface Props {
  modelValue: boolean
  studentData?: Partial<StudentForm>
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  studentData: () => ({})
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submit': [data: StudentForm]
}>()

const formRef = ref<FormInstance>()
const submitting = ref(false)

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 表单数据
const formData = ref<StudentForm>({
  name: '',
  studentId: '',
  gender: '男',
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

// 表单验证规则
const rules: FormRules = {
  name: [
    { required: true, message: '请输入学生姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '姓名长度应在2-10个字符', trigger: 'blur' }
  ],
  studentId: [
    { required: true, message: '请输入学号', trigger: 'blur' },
    { pattern: /^[A-Z]{2}\d{8}$/, message: '学号格式为：ST + 8位数字', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  birthDate: [
    { required: true, message: '请选择出生日期', trigger: 'change' }
  ],
  classId: [
    { required: true, message: '请选择班级', trigger: 'change' }
  ],
  enrollmentDate: [
    { required: true, message: '请选择入学时间', trigger: 'change' }
  ],
  parentName: [
    { required: true, message: '请输入家长姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  relationship: [
    { required: true, message: '请选择与学生关系', trigger: 'change' }
  ]
}

// 重置表单数据函数 - 需要先定义
const resetFormData = () => {
  formData.value = {
    name: '',
    studentId: '',
    gender: '男',
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
}

const closeDialog = () => {
  visible.value = false
}

const resetForm = () => {
  formRef.value?.resetFields()
  resetFormData()
}

// 监听传入的学生数据
watch(() => props.studentData, (newData) => {
  if (newData && Object.keys(newData).length > 0) {
    Object.assign(formData.value, newData)
  }
}, { immediate: true, deep: true })

// 监听对话框打开状态
watch(visible, (newVal) => {
  if (newVal && props.studentData) {
    // 重置并填充表单数据
    resetFormData()
    Object.assign(formData.value, props.studentData)
  }
})

const submitForm = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    emit('submit', { ...formData.value })
    ElMessage.success('保存成功！')
    closeDialog()
  } catch (error) {
    console.error('表单验证失败:', error)
    ElMessage.error('请检查表单信息')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--text-sm);
}

:deep(.el-form-item__label) {
  font-weight: 600;
}

:deep(.el-divider__text) {
  font-weight: 600;
  color: var(--primary-color);
}

:deep(.el-checkbox-group) {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-4xl);
}
.full-width {
  width: 100%;
}
</style>