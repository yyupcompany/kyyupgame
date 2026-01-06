<template>
  <div class="student-form">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
      size="default"
      @submit.prevent="submitForm"
    >
      <!-- 基本信息区域 -->
      <el-card class="form-section" shadow="never">
        <template #header>
          <div class="section-header">
            <UnifiedIcon name="default" />
            <span>基本信息</span>
          </div>
        </template>

        <el-row :gutter="32">
          <el-col :span="8">
            <el-form-item label="学生姓名" prop="name">
              <el-input 
                v-model="formData.name" 
                placeholder="请输入学生姓名"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="学号" prop="studentId">
              <el-input 
                v-model="formData.studentId" 
                placeholder="ST + 8位数字"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="formData.gender">
                <el-radio value="男">男</el-radio>
                <el-radio value="女">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="32">
          <el-col :span="8">
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
          <el-col :span="8">
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
          <el-col :span="8">
            <el-form-item label="班级" prop="classId">
              <el-select 
                v-model="formData.classId" 
                placeholder="请选择班级" 
                class="full-width"
                clearable
              >
                <el-option label="小班A班" value="1" />
                <el-option label="小班B班" value="2" />
                <el-option label="中班A班" value="3" />
                <el-option label="中班B班" value="4" />
                <el-option label="大班A班" value="5" />
                <el-option label="大班B班" value="6" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- 家长信息区域 -->
      <el-card class="form-section" shadow="never">
        <template #header>
          <div class="section-header">
            <UnifiedIcon name="default" />
            <span>家长信息</span>
          </div>
        </template>

        <el-row :gutter="32">
          <el-col :span="8">
            <el-form-item label="家长姓名" prop="parentName">
              <el-input 
                v-model="formData.parentName" 
                placeholder="请输入家长姓名"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="联系电话" prop="phone">
              <el-input 
                v-model="formData.phone" 
                placeholder="请输入手机号码"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="与学生关系" prop="relationship">
              <el-select 
                v-model="formData.relationship" 
                placeholder="请选择关系" 
                class="full-width"
              >
                <el-option label="父亲" value="father" />
                <el-option label="母亲" value="mother" />
                <el-option label="爷爷" value="grandfather" />
                <el-option label="奶奶" value="grandmother" />
                <el-option label="外公" value="maternal_grandfather" />
                <el-option label="外婆" value="maternal_grandmother" />
                <el-option label="其他监护人" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="32">
          <el-col :span="12">
            <el-form-item label="家庭地址" prop="address">
              <el-input 
                v-model="formData.address" 
                placeholder="请输入详细家庭地址"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="紧急联系人" prop="emergencyContact">
              <el-input 
                v-model="formData.emergencyContact" 
                placeholder="紧急联系人姓名及电话"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- 健康信息区域 -->
      <el-card class="form-section" shadow="never">
        <template #header>
          <div class="section-header">
            <UnifiedIcon name="Check" />
            <span>健康信息</span>
          </div>
        </template>

        <el-row :gutter="32">
          <el-col :span="24">
            <el-form-item label="健康状况" prop="healthStatus">
              <el-checkbox-group v-model="formData.healthStatus">
                <el-checkbox value="healthy">身体健康</el-checkbox>
                <el-checkbox value="allergy">有过敏史</el-checkbox>
                <el-checkbox value="medication">需要服药</el-checkbox>
                <el-checkbox value="special_care">需要特殊照顾</el-checkbox>
                <el-checkbox value="dietary_restrictions">饮食限制</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="32">
          <el-col :span="12">
            <el-form-item label="过敏信息" prop="allergyInfo">
              <el-input 
                v-model="formData.allergyInfo"
                type="textarea"
                :rows="2"
                placeholder="如有过敏，请详细说明过敏原"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="服药信息" prop="medicationInfo">
              <el-input 
                v-model="formData.medicationInfo"
                type="textarea"
                :rows="2"
                placeholder="如需服药，请说明药物名称、用量和时间"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- 其他信息区域 -->
      <el-card class="form-section" shadow="never">
        <template #header>
          <div class="section-header">
            <UnifiedIcon name="default" />
            <span>其他信息</span>
          </div>
        </template>

        <el-row :gutter="32">
          <el-col :span="24">
            <el-form-item label="特殊说明" prop="notes">
              <el-input
                v-model="formData.notes"
                type="textarea"
                :rows="3"
                placeholder="其他需要说明的情况（兴趣爱好、性格特点、注意事项等）"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="32">
          <el-col :span="12">
            <el-form-item label="兴趣爱好" prop="hobbies">
              <el-select 
                v-model="formData.hobbies" 
                multiple
                placeholder="选择学生的兴趣爱好" 
                class="full-width"
              >
                <el-option label="画画" value="drawing" />
                <el-option label="唱歌" value="singing" />
                <el-option label="跳舞" value="dancing" />
                <el-option label="运动" value="sports" />
                <el-option label="读书" value="reading" />
                <el-option label="搭积木" value="building_blocks" />
                <el-option label="手工制作" value="crafts" />
                <el-option label="音乐" value="music" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性格特点" prop="personality">
              <el-select 
                v-model="formData.personality" 
                multiple
                placeholder="选择学生的性格特点" 
                class="full-width"
              >
                <el-option label="活泼开朗" value="cheerful" />
                <el-option label="内向安静" value="introverted" />
                <el-option label="好奇心强" value="curious" />
                <el-option label="独立自主" value="independent" />
                <el-option label="善于合作" value="cooperative" />
                <el-option label="有耐心" value="patient" />
                <el-option label="容易紧张" value="anxious" />
                <el-option label="适应力强" value="adaptable" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- 表单操作按钮 -->
      <div class="form-actions">
        <el-button @click="resetForm" size="large">重置表单</el-button>
        <el-button @click="saveAsDraft" size="large">保存草稿</el-button>
        <el-button 
          type="primary" 
          @click="submitForm" 
          :loading="submitting"
          size="large"
        >
          提交保存
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { User, Avatar, DocumentChecked, Document } from '@element-plus/icons-vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'

interface StudentFormData {
  id?: number
  name: string
  studentId: string
  gender: string
  birthDate: string
  enrollmentDate: string
  classId: string
  parentName: string
  phone: string
  relationship: string
  address: string
  emergencyContact: string
  healthStatus: string[]
  allergyInfo: string
  medicationInfo: string
  notes: string
  hobbies: string[]
  personality: string[]
}

interface Props {
  initialData?: Partial<StudentFormData>
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false
})

const emit = defineEmits<{
  'submit': [data: StudentFormData]
  'save-draft': [data: StudentFormData]
  'reset': []
}>()

const formRef = ref<FormInstance>()
const submitting = ref(false)

// 表单数据
const formData = reactive<StudentFormData>({
  name: '',
  studentId: '',
  gender: '男',
  birthDate: '',
  enrollmentDate: '',
  classId: '',
  parentName: '',
  phone: '',
  relationship: 'mother',
  address: '',
  emergencyContact: '',
  healthStatus: ['healthy'],
  allergyInfo: '',
  medicationInfo: '',
  notes: '',
  hobbies: [],
  personality: []
})

// 表单验证规则
const rules: FormRules = {
  name: [
    { required: true, message: '请输入学生姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '姓名长度应在2-10个字符', trigger: 'blur' }
  ],
  studentId: [
    { required: true, message: '请输入学号', trigger: 'blur' },
    { pattern: /^ST\d{8}$/, message: '学号格式为：ST + 8位数字', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  birthDate: [
    { required: true, message: '请选择出生日期', trigger: 'change' }
  ],
  enrollmentDate: [
    { required: true, message: '请选择入学时间', trigger: 'change' }
  ],
  classId: [
    { required: true, message: '请选择班级', trigger: 'change' }
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

// 初始化表单数据
const initFormData = () => {
  if (props.initialData) {
    Object.assign(formData, props.initialData)
  }
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  
  // 重置为初始数据或默认值
  Object.assign(formData, {
    name: '',
    studentId: '',
    gender: '男',
    birthDate: '',
    enrollmentDate: '',
    classId: '',
    parentName: '',
    phone: '',
    relationship: 'mother',
    address: '',
    emergencyContact: '',
    healthStatus: ['healthy'],
    allergyInfo: '',
    medicationInfo: '',
    notes: '',
    hobbies: [],
    personality: []
  })
  
  initFormData()
  emit('reset')
  ElMessage.success('表单已重置')
}

// 保存草稿
const saveAsDraft = () => {
  emit('save-draft', { ...formData })
  ElMessage.success('草稿已保存')
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    emit('submit', { ...formData })
    ElMessage.success('学生信息提交成功！')
    
    // 可选：提交成功后重置表单
    // resetForm()
  } catch (error) {
    console.error('表单验证失败:', error)
    ElMessage.error('请检查表单信息后重试')
  } finally {
    submitting.value = false
  }
}

// 计算年龄
const calculateAge = computed(() => {
  if (!formData.birthDate) return 0
  const today = new Date()
  const birthDate = new Date(formData.birthDate)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
})

// 初始化
initFormData()
</script>

<style scoped>
.student-form {
  max-width: 100%; max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-2xl);
}

.form-section {
  margin-bottom: var(--spacing-2xl);
}

.form-section:last-of-type {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: var(--font-semibold);
  font-size: var(--text-lg);
  color: var(--primary-color);
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-2xl);
  padding: var(--spacing-xl) 0;
  border-top: var(--border-width-base) solid var(--border-color-lighter);
}

:deep(.el-card__header) {
  background-color: var(--bg-secondary);
  border-bottom: var(--border-width-base) solid var(--primary-color);
}

:deep(.el-form-item__label) {
  font-weight: var(--font-medium);
  color: var(--text-regular);
}

:deep(.el-checkbox-group) {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
}

:deep(.el-select .el-input__wrapper) {
  background-color: var(--bg-card);
}

:deep(.el-input__wrapper) {
  transition: var(--transition-base);
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 var(--border-width-base) var(--primary-color) inset;
}

:deep(.el-textarea__inner) {
  transition: var(--transition-base);
}

:deep(.el-textarea__inner:hover) {
  border-color: var(--primary-color);
}

@media (max-width: var(--breakpoint-md)) {
  .student-form {
    padding: var(--spacing-lg);
  }

  .el-col {
    margin-bottom: var(--spacing-lg);
  }

  .form-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .form-actions .el-button {
    margin-bottom: var(--spacing-sm);
  }
}

.full-width {
  width: 100%;
}
</style>