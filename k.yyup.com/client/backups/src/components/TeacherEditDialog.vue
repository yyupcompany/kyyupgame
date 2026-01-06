<template>
  <el-dialog
    v-model="visible"
    :title="teacher ? '编辑教师' : '新增教师'"
    width="800px"
    :close-on-click-modal="false"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="教师姓名" prop="name">
            <el-input v-model="form.name" placeholder="请输入教师姓名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="性别" prop="gender">
            <el-select v-model="form.gender" placeholder="选择性别" style="width: 100%">
              <el-option label="男" value="MALE" />
              <el-option label="女" value="FEMALE" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="form.phone" placeholder="请输入联系电话" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" placeholder="请输入邮箱" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="工号" prop="employeeId">
            <el-input v-model="form.employeeId" placeholder="请输入工号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="职称" prop="title">
            <el-input v-model="form.title" placeholder="请输入职称" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="类型" prop="type">
            <el-select v-model="form.type" placeholder="选择类型" style="width: 100%">
              <el-option label="全职" value="FULL_TIME" />
              <el-option label="兼职" value="PART_TIME" />
              <el-option label="合同工" value="CONTRACT" />
              <el-option label="实习生" value="INTERN" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="部门" prop="department">
            <el-select v-model="form.department" placeholder="选择部门" style="width: 100%">
              <el-option label="教学部" value="教学部" />
              <el-option label="保育部" value="保育部" />
              <el-option label="后勤部" value="后勤部" />
              <el-option label="行政部" value="行政部" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="入职时间" prop="hireDate">
            <el-date-picker
              v-model="form.hireDate"
              type="date"
              placeholder="选择入职时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-select v-model="form.status" placeholder="选择状态" style="width: 100%">
              <el-option label="在职" value="ACTIVE" />
              <el-option label="请假" value="LEAVE" />
              <el-option label="离职" value="RESIGNED" />
              <el-option label="停职" value="SUSPENDED" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="技能标签">
        <el-input v-model="skillsInput" placeholder="请输入技能，用逗号分隔" />
        <div v-if="form.skills && form.skills.length > 0" class="skills-tags">
          <el-tag
            v-for="skill in form.skills"
            :key="skill"
            closable
            @close="removeSkill(skill)"
            style="margin-right: var(--spacing-sm); margin-top: var(--spacing-sm);"
          >
            {{ skill }}
          </el-tag>
        </div>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSave">
          {{ teacher ? '更新' : '创建' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'

interface Teacher {
  id: string
  name: string
  gender: 'MALE' | 'FEMALE'
  phone: string
  email?: string
  employeeId?: string
  title?: string
  type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN'
  department?: string
  hireDate: string
  status: 'ACTIVE' | 'LEAVE' | 'RESIGNED' | 'SUSPENDED'
  skills?: string[]
}

interface Props {
  modelValue: boolean
  teacher?: Teacher | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', data: any): void
}

const props = withDefaults(defineProps<Props>(), {
  teacher: null
})

const emit = defineEmits<Emits>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const loading = ref(false)
const formRef = ref<FormInstance>()
const skillsInput = ref('')

const form = ref({
  name: '',
  gender: 'MALE' as 'MALE' | 'FEMALE',
  phone: '',
  email: '',
  employeeId: '',
  title: '',
  type: 'FULL_TIME' as 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN',
  department: '',
  hireDate: '',
  status: 'ACTIVE' as 'ACTIVE' | 'LEAVE' | 'RESIGNED' | 'SUSPENDED',
  skills: [] as string[]
})

const rules = {
  name: [
    { required: true, message: '请输入教师姓名', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择教师类型', trigger: 'change' }
  ],
  hireDate: [
    { required: true, message: '请选择入职时间', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 重置表单函数 - 需要先定义
const resetForm = () => {
  form.value = {
    name: '',
    gender: 'MALE',
    phone: '',
    email: '',
    employeeId: '',
    title: '',
    type: 'FULL_TIME',
    department: '',
    hireDate: '',
    status: 'ACTIVE',
    skills: []
  }
  skillsInput.value = ''
  formRef.value?.resetFields()
}

// 监听教师数据变化
watch(() => props.teacher, (newTeacher) => {
  if (newTeacher) {
    form.value = {
      name: newTeacher.name || '',
      gender: newTeacher.gender || 'MALE',
      phone: newTeacher.phone || '',
      email: newTeacher.email || '',
      employeeId: newTeacher.employeeId || '',
      title: newTeacher.title || '',
      type: newTeacher.type || 'FULL_TIME',
      department: newTeacher.department || '',
      hireDate: newTeacher.hireDate || '',
      status: newTeacher.status || 'ACTIVE',
      skills: newTeacher.skills || []
    }
    skillsInput.value = (newTeacher.skills || []).join(',')
  } else {
    resetForm()
  }
}, { immediate: true })

// 监听技能输入变化
watch(skillsInput, (newValue) => {
  if (newValue) {
    form.value.skills = newValue.split(',').map(skill => skill.trim()).filter(skill => skill)
  } else {
    form.value.skills = []
  }
})

const removeSkill = (skill: string) => {
  const index = form.value.skills.indexOf(skill)
  if (index > -1) {
    form.value.skills.splice(index, 1)
    skillsInput.value = form.value.skills.join(',')
  }
}

const handleCancel = () => {
  visible.value = false
  resetForm()
}

const handleSave = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    emit('save', { ...form.value })
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

.skills-tags {
  margin-top: var(--spacing-sm);
}
</style>