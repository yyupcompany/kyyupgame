<template>
  <el-dialog
    v-model="visible"
    title="学生转班"
    width="500px"
    :close-on-click-modal="false"
  >
    <div v-if="student" class="transfer-info">
      <h3>学生信息</h3>
      <p><strong>姓名：</strong>{{ student.name }}</p>
      <p><strong>当前班级：</strong>{{ student.currentClassName || '未分配' }}</p>
      
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" class="transfer-form">
        <el-form-item label="目标班级" prop="newClassId">
          <el-select v-model="form.newClassId" placeholder="选择目标班级" style="width: 100%">
            <el-option
              v-for="cls in availableClasses"
              :key="cls.id"
              :label="cls.name"
              :value="cls.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="转班原因">
          <el-input
            v-model="form.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入转班原因（可选）"
          />
        </el-form-item>
      </el-form>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleTransfer">
          确认转班
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FormInstance } from 'element-plus'

interface Student {
  id: string
  name: string
  currentClassName?: string
  currentClassId?: string
}

interface ClassInfo {
  id: string
  name: string
}

interface Props {
  modelValue: boolean
  student?: Student | null
  classList?: ClassInfo[]
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'transfer', data: { studentId: string; newClassId: string; reason?: string }): void
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
  newClassId: '',
  reason: ''
})

const rules = {
  newClassId: [
    { required: true, message: '请选择目标班级', trigger: 'change' }
  ]
}

// 过滤掉当前班级
const availableClasses = computed(() => {
  if (!props.student || !props.classList) return []
  return props.classList.filter(cls => cls.id !== props.student?.currentClassId)
})

// 重置表单
const resetForm = () => {
  form.value = {
    newClassId: '',
    reason: ''
  }
  formRef.value?.resetFields()
}

// 监听对话框显示状态
watch(visible, (newVisible) => {
  if (!newVisible) {
    resetForm()
  }
})

const handleCancel = () => {
  visible.value = false
}

const handleTransfer = async () => {
  if (!formRef.value || !props.student) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    emit('transfer', {
      studentId: props.student.id,
      newClassId: form.value.newClassId,
      reason: form.value.reason
    })
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.transfer-info {
  margin-bottom: var(--text-2xl);
}

.transfer-info h3 {
  margin: 0 0 15px 0;
  color: var(--el-text-color-primary);
}

.transfer-info p {
  margin: var(--spacing-sm) 0;
  color: var(--el-text-color-regular);
}

.transfer-form {
  margin-top: var(--text-2xl);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}
</style>