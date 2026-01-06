<template>
  <van-popup
    v-model:show="dialogVisible"
    position="bottom"
    :style="{ height: '70%' }"
    round
  >
    <div class="edit-class-dialog">
      <!-- 头部 -->
      <div class="dialog-header">
        <van-nav-bar
          :title="isEdit ? '编辑班级' : '新建班级'"
          left-text="取消"
          right-text="保存"
          @click-left="handleClose"
          @click-right="handleSave"
        />
      </div>

      <!-- 表单内容 -->
      <div class="dialog-content">
        <van-form @submit="handleSave" ref="formRef">
          <van-cell-group inset>
            <van-field
              v-model="formData.name"
              name="name"
              label="班级名称"
              placeholder="请输入班级名称"
              :rules="[{ required: true, message: '请输入班级名称' }]"
            />

            <van-field
              v-model="formData.grade"
              name="grade"
              label="年级"
              placeholder="请选择年级"
              readonly
              is-link
              @click="showGradePicker = true"
              :rules="[{ required: true, message: '请选择年级' }]"
            >
              <template #input>
                <span>{{ gradeLabel }}</span>
              </template>
            </van-field>

            <van-field
              v-model.number="formData.maxCapacity"
              name="maxCapacity"
              label="最大容量"
              type="number"
              placeholder="请输入最大容量"
              :rules="[{ required: true, message: '请输入最大容量' }]"
            />

            <van-field
              v-model="formData.room"
              name="room"
              label="教室"
              placeholder="请输入教室"
              :rules="[{ required: true, message: '请输入教室' }]"
            />

            <van-field
              v-model="formData.status"
              name="status"
              label="状态"
              placeholder="请选择状态"
              readonly
              is-link
              @click="showStatusPicker = true"
              :rules="[{ required: true, message: '请选择状态' }]"
            >
              <template #input>
                <span>{{ statusLabel }}</span>
              </template>
            </van-field>
          </van-cell-group>
        </van-form>
      </div>

      <!-- 年级选择器 -->
      <van-popup v-model:show="showGradePicker" position="bottom">
        <van-picker
          :columns="gradeOptions"
          @confirm="onGradeConfirm"
          @cancel="showGradePicker = false"
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
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { personnelCenterApi, type Class } from '@/api/personnel-center'

interface Props {
  modelValue: boolean
  classData: Class | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  refresh: []
}>()

// 响应式数据
const formRef = ref()
const showGradePicker = ref(false)
const showStatusPicker = ref(false)

const formData = ref({
  id: '',
  name: '',
  grade: '',
  maxCapacity: 0,
  room: '',
  status: 'active'
})

// 年级选项
const gradeOptions = [
  { text: '小班', value: 'small' },
  { text: '中班', value: 'medium' },
  { text: '大班', value: 'large' }
]

// 状态选项
const statusOptions = [
  { text: '正常', value: 'active' },
  { text: '暂停', value: 'inactive' }
]

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isEdit = computed(() => !!props.classData?.id)

const gradeLabel = computed(() => {
  const option = gradeOptions.find(opt => opt.value === formData.value.grade)
  return option?.text || '请选择'
})

const statusLabel = computed(() => {
  const option = statusOptions.find(opt => opt.value === formData.value.status)
  return option?.text || '请选择'
})

// 监听弹窗显示状态
watch(() => props.modelValue, (visible) => {
  if (visible && props.classData) {
    // 编辑模式：填充数据
    formData.value = {
      id: props.classData.id || '',
      name: props.classData.name || '',
      grade: props.classData.grade || '',
      maxCapacity: props.classData.maxCapacity || 0,
      room: props.classData.room || '',
      status: props.classData.status || 'active'
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
    id: '',
    name: '',
    grade: '',
    maxCapacity: 0,
    room: '',
    status: 'active'
  }
}

const onGradeConfirm = ({ selectedOptions }: any) => {
  formData.value.grade = selectedOptions[0].value
  showGradePicker.value = false
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

    let response
    if (isEdit.value) {
      // 更新班级
      response = await personnelCenterApi.updateClass(formData.value.id, formData.value)
      if (response.success) {
        showToast('班级信息更新成功')
      }
    } else {
      // 创建班级
      response = await personnelCenterApi.createClass(formData.value)
      if (response.success) {
        showToast('班级创建成功')
      }
    }

    emit('refresh')
    handleClose()
  } catch (error) {
    console.error('保存班级失败:', error)
    showToast('保存失败')
  } finally {
    closeToast()
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

.edit-class-dialog {
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
}
</style>
