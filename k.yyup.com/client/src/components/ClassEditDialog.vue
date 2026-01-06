<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑班级' : '新建班级'"
    width="800px"
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form 
      :model="formData" 
      :rules="formRules" 
      ref="formRef" 
      label-width="120px"
      class="class-form"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="班级名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入班级名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="班级编号" prop="code">
            <el-input v-model="formData.code" placeholder="请输入班级编号" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="年龄组" prop="ageGroup">
            <el-select v-model="formData.ageGroup" placeholder="选择年龄组" class="full-width">
              <el-option label="小班 (3-4岁)" value="SMALL" />
              <el-option label="中班 (4-5岁)" value="MEDIUM" />
              <el-option label="大班 (5-6岁)" value="LARGE" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="班级容量" prop="capacity">
            <el-input-number
              v-model="formData.capacity"
              :min="10"
              :max="50"
              placeholder="班级容量"
              class="full-width"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="主班教师" prop="teacherId">
            <el-select v-model="formData.teacherId" placeholder="选择主班教师" class="full-width">
              <el-option
                v-for="teacher in teacherList"
                :key="teacher.id"
                :label="teacher.name"
                :value="teacher.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="班级状态" prop="status">
            <el-select v-model="formData.status" placeholder="选择状态" class="full-width">
              <el-option label="正常" value="ACTIVE" />
              <el-option label="暂停" value="INACTIVE" />
              <el-option label="毕业" value="GRADUATED" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="开班日期" prop="startDate">
            <el-date-picker
              v-model="formData.startDate"
              type="date"
              placeholder="选择开班日期"
              class="full-width"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="结班日期" prop="endDate">
            <el-date-picker
              v-model="formData.endDate"
              type="date"
              placeholder="选择结班日期"
              class="full-width"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="班级描述" prop="description">
        <el-input 
          v-model="formData.description" 
          type="textarea" 
          :rows="3"
          placeholder="请输入班级描述"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">
          {{ isEdit ? '更新' : '创建' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

// 组件属性
interface Props {
  modelValue: boolean
  classData?: any
  teacherList?: any[]
}

const props = withDefaults(defineProps<Props>(), {
  teacherList: () => []
})

// 组件事件
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', data: any): void
}>()

// 表单引用
const formRef = ref<FormInstance>()
const saving = ref(false)

// 弹窗可见性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 是否编辑模式
const isEdit = computed(() => !!props.classData?.id)

// 表单数据
const formData = ref({
  name: '',
  code: '',
  ageGroup: '',
  capacity: 25,
  teacherId: '',
  status: 'ACTIVE',
  startDate: '',
  endDate: '',
  description: ''
})

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入班级名称', trigger: 'blur' },
    { min: 2, max: 20, message: '班级名称长度为2-20个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入班级编号', trigger: 'blur' },
    { pattern: /^[A-Z0-9]+$/, message: '班级编号只能包含大写字母和数字', trigger: 'blur' }
  ],
  ageGroup: [
    { required: true, message: '请选择年龄组', trigger: 'change' }
  ],
  capacity: [
    { required: true, message: '请输入班级容量', trigger: 'change' }
  ],
  teacherId: [
    { required: true, message: '请选择主班教师', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择班级状态', trigger: 'change' }
  ],
  startDate: [
    { required: true, message: '请选择开班日期', trigger: 'change' }
  ]
}

// 监听班级数据变化
watch(() => props.classData, (newData) => {
  if (newData) {
    formData.value = {
      name: newData.name || '',
      code: newData.code || '',
      ageGroup: newData.ageGroup || '',
      capacity: newData.capacity || 25,
      teacherId: newData.teacherId || '',
      status: newData.status || 'ACTIVE',
      startDate: newData.startDate || '',
      endDate: newData.endDate || '',
      description: newData.description || ''
    }
  }
}, { immediate: true })

// 重置表单
const resetForm = () => {
  formData.value = {
    name: '',
    code: '',
    ageGroup: '',
    capacity: 25,
    teacherId: '',
    status: 'ACTIVE',
    startDate: '',
    endDate: '',
    description: ''
  }
  formRef.value?.clearValidate()
}

// 处理取消
const handleCancel = () => {
  dialogVisible.value = false
}

// 处理保存
const handleSave = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    saving.value = true

    const submitData = { ...formData.value }
    if (isEdit.value && props.classData?.id) {
      submitData.id = props.classData.id
    }

    emit('save', submitData)
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    saving.value = false
  }
}

// 处理关闭
const handleClosed = () => {
  resetForm()
}

// 暴露方法给测试使用
defineExpose({
  resetForm,
  formRef,
  form
})
</script>

<style scoped>
.class-form {
  padding: 0 var(--spacing-xl);
}

.dialog-footer {
  text-align: right;
}

.el-form-item {
  margin-bottom: var(--spacing-xl);
}

.full-width {
  width: 100%;
}
</style>