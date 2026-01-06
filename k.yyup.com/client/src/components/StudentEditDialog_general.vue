<template>
  <el-dialog
    v-model="visible"
    :title="student ? '编辑学生' : '新增学生'"
    width="800px"
    :close-on-click-modal="false"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="学生姓名" prop="name">
            <el-input v-model="form.name" placeholder="请输入学生姓名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="性别" prop="gender">
            <el-select v-model="form.gender" placeholder="选择性别" class="full-width">
              <el-option label="男" value="MALE" />
              <el-option label="女" value="FEMALE" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="出生日期" prop="birthDate">
            <el-date-picker
              v-model="form.birthDate"
              type="date"
              placeholder="选择出生日期"
              class="full-width"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="所属班级" prop="classId">
            <el-select v-model="form.classId" placeholder="选择班级" class="full-width">
              <el-option
                v-for="cls in classList"
                :key="cls.id"
                :label="cls.name"
                :value="cls.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="家长姓名" prop="guardian.name">
            <el-input v-model="form.guardian.name" placeholder="请输入家长姓名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="家长电话" prop="guardian.phone">
            <el-input v-model="form.guardian.phone" placeholder="请输入家长电话" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="备注">
        <el-input
          v-model="form.notes"
          type="textarea"
          :rows="3"
          placeholder="请输入备注"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSave">
          {{ student ? '更新' : '创建' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { createStudent, updateStudent } from '@/api/modules/student'
import type { Student, StudentCreateParams } from '@/api/modules/student'

interface Props {
  modelValue: boolean
  student?: Student | null
  classList?: Array<{ id: string; name: string }>
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success', data: Student): void
}

const props = withDefaults(defineProps<Props>(), {
  student: null,
  classList: () => []
})

const emit = defineEmits<Emits>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const loading = ref(false)
const formRef = ref<FormInstance>()

const form = ref({
  name: '',
  gender: 'MALE' as 'MALE' | 'FEMALE',
  birthDate: '',
  classId: '',
  guardian: {
    name: '',
    phone: ''
  },
  notes: ''
})

const rules = {
  name: [
    { required: true, message: '请输入学生姓名', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  birthDate: [
    { required: true, message: '请选择出生日期', trigger: 'change' }
  ],
  'guardian.name': [
    { required: true, message: '请输入家长姓名', trigger: 'blur' }
  ],
  'guardian.phone': [
    { required: true, message: '请输入家长电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

// 重置表单函数 - 需要先定义
const resetForm = () => {
  form.value = {
    name: '',
    gender: 'MALE',
    birthDate: '',
    classId: '',
    guardian: {
      name: '',
      phone: ''
    },
    notes: ''
  }
  formRef.value?.resetFields()
}

// 监听学生数据变化
watch(() => props.student, (newStudent) => {
  if (newStudent) {
    form.value = {
      name: newStudent.name || '',
      gender: newStudent.gender || 'MALE',
      birthDate: newStudent.birthDate || '',
      classId: newStudent.classId || '',
      guardian: {
        name: newStudent.guardian?.name || '',
        phone: newStudent.guardian?.phone || ''
      },
      notes: newStudent.notes || ''
    }
  } else {
    resetForm()
  }
}, { immediate: true })

const handleCancel = () => {
  visible.value = false
  resetForm()
}

const handleSave = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    const studentData: StudentCreateParams = {
      name: form.value.name,
      gender: form.value.gender,
      birthDate: form.value.birthDate,
      guardian: {
        name: form.value.guardian.name,
        relationship: '家长', // 默认关系
        phone: form.value.guardian.phone
      },
      enrollmentDate: new Date().toISOString().split('T')[0], // 格式化为 YYYY-MM-DD
      classId: form.value.classId || undefined,
      notes: form.value.notes || undefined
    }
    
    let response
    if (props.student?.id) {
      // 更新学生
      response = await updateStudent(props.student.id, studentData)
    } else {
      // 创建学生
      response = await createStudent(studentData)
    }
    
    if (response.success || response.data) {
      ElMessage.success(props.student ? '学生信息更新成功' : '学生创建成功')
      emit('success', response.data)
      visible.value = false
      resetForm()
    } else {
      ElMessage.error(response.message || '操作失败')
    }
  } catch (error) {
    console.error('保存学生信息失败:', error)
    ElMessage.error('保存学生信息失败')
  } finally {
    loading.value = false
  }
}

// 暴露方法给测试使用
defineExpose({
  resetForm,
  formRef,
  form
})
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

.full-width {
  width: 100%;
}
</style>