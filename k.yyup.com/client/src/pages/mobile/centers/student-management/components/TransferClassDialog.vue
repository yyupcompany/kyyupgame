<template>
  <van-dialog
    v-model:show="dialogVisible"
    title="学生转班"
    show-cancel-button
    :before-close="handleClose"
    class="transfer-dialog"
  >
    <div class="content" v-if="student">
      <!-- 当前学生信息 -->
      <div class="student-info">
        <van-cell-group inset>
          <van-cell title="学生姓名" :value="student.name" />
          <van-cell title="当前班级" :value="student.className || '未分班'" />
          <van-cell title="学号" :value="student.studentNo" />
        </van-cell-group>
      </div>

      <!-- 选择新班级 -->
      <div class="class-selection">
        <van-cell-group inset>
          <van-field
            v-model="selectedClassName"
            label="新班级"
            placeholder="请选择新班级"
            readonly
            is-link
            @click="showClassPicker = true"
          />
        </van-cell-group>
      </div>

      <!-- 转班原因 -->
      <div class="transfer-reason">
        <van-cell-group inset>
          <van-field
            v-model="reason"
            label="转班原因"
            placeholder="请输入转班原因"
            type="textarea"
            rows="3"
            maxlength="200"
            show-word-limit
          />
        </van-cell-group>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <van-button @click="handleClose">取消</van-button>
        <van-button
          type="primary"
          @click="handleConfirm"
          :loading="saving"
          :disabled="!selectedClassId"
        >
          确认转班
        </van-button>
      </div>
    </template>

    <!-- 班级选择器 -->
    <van-popup v-model:show="showClassPicker" position="bottom">
      <van-picker
        :columns="classPickerOptions"
        @confirm="onClassConfirm"
        @cancel="showClassPicker = false"
      />
    </van-popup>
  </van-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
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
  (e: 'confirm', data: { classId: string; reason: string }): void
}

const props = withDefaults(defineProps<Props>(), {
  student: null,
  classList: () => []
})

const emit = defineEmits<Emits>()

// 响应式数据
const showClassPicker = ref(false)
const saving = ref(false)
const selectedClassId = ref('')
const selectedClassName = ref('')
const reason = ref('')

// 计算属性
const dialogVisible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

const classPickerOptions = computed(() => {
  return props.classList
    .filter(cls => cls.id !== props.student?.classId) // 排除当前班级
    .map(cls => ({ text: cls.name, value: cls.id }))
})

// 监听器
watch(() => props.show, (show) => {
  if (show) {
    initData()
  }
})

// 方法
const initData = () => {
  selectedClassId.value = ''
  selectedClassName.value = ''
  reason.value = ''
}

const handleClose = () => {
  dialogVisible.value = false
}

const handleConfirm = async () => {
  if (!selectedClassId.value) {
    showToast('请选择新班级')
    return
  }

  saving.value = true
  try {
    emit('confirm', {
      classId: selectedClassId.value,
      reason: reason.value
    })
  } finally {
    saving.value = false
  }
}

const onClassConfirm = ({ selectedOptions }: any) => {
  selectedClassId.value = selectedOptions[0]?.value || ''
  selectedClassName.value = selectedOptions[0]?.text || ''
  showClassPicker.value = false
}
</script>

<style lang="scss" scoped>
.transfer-dialog {
  .content {
    padding: 0 16px;

    .student-info,
    .class-selection,
    .transfer-reason {
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
  max-height: 60vh;
  overflow-y: auto;
}

:deep(.van-cell-group) {
  margin: 0;
}

:deep(.van-cell) {
  padding: var(--spacing-md) 16px;
}

:deep(.van-field__label) {
  width: 70px;
}
</style>