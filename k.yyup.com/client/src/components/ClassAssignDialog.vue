<template>
  <el-dialog
    v-model="visible"
    title="班级分配"
    width="600px"
    :close-on-click-modal="false"
  >
    <div v-if="teacher" class="assign-info">
      <h3>教师信息</h3>
      <p><strong>姓名：</strong>{{ teacher.name }}</p>
      <p><strong>工号：</strong>{{ teacher.employeeId || '暂无' }}</p>
      <p><strong>当前班级：</strong>
        <span v-if="teacher.classNames && teacher.classNames.length > 0">
          {{ teacher.classNames.join(', ') }}
        </span>
        <span v-else class="text-muted">未分配</span>
      </p>
      
      <el-form :model="form" ref="formRef" label-width="100px" class="assign-form">
        <el-form-item label="分配班级">
          <el-checkbox-group v-model="form.classIds">
            <el-checkbox
              v-for="cls in classList"
              :key="cls.id"
              :label="cls.id"
              :value="cls.id"
            >
              {{ cls.name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入分配备注（可选）"
          />
        </el-form-item>
      </el-form>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleAssign">
          确认分配
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FormInstance } from 'element-plus'

interface Teacher {
  id: string
  name: string
  employeeId?: string
  classIds?: string[]
  classNames?: string[]
}

interface ClassInfo {
  id: string
  name: string
}

interface Props {
  modelValue: boolean
  teacher?: Teacher | null
  classList?: ClassInfo[]
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'assign', data: { teacherId: string; classIds: string[]; remark?: string }): void
}

const props = withDefaults(defineProps<Props>(), {
  teacher: null,
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
  classIds: [] as string[],
  remark: ''
})

const resetForm = () => {
  form.value = {
    classIds: [],
    remark: ''
  }
}

// 监听教师数据变化
watch(() => props.teacher, (newTeacher) => {
  if (newTeacher) {
    form.value.classIds = [...(newTeacher.classIds || [])]
    form.value.remark = ''
  } else {
    resetForm()
  }
}, { immediate: true })

// 监听对话框显示状态
watch(visible, (newVisible) => {
  if (!newVisible) {
    resetForm()
  }
})

const handleCancel = () => {
  visible.value = false
}

const handleAssign = async () => {
  if (!props.teacher) return
  
  try {
    loading.value = true
    
    emit('assign', {
      teacherId: props.teacher.id,
      classIds: form.value.classIds,
      remark: form.value.remark
    })
  } catch (error) {
    console.error('分配失败:', error)
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
.assign-info {
  margin-bottom: var(--spacing-xl);
}

.assign-info h3 {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--el-text-color-primary);
}

.assign-info p {
  margin: var(--spacing-sm) 0;
  color: var(--el-text-color-regular);
}

.assign-form {
  margin-top: var(--spacing-xl);
}

.text-muted {
  color: var(--el-text-color-disabled);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

:deep(.el-checkbox-group) {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
</style>