<template>
  <el-dialog
    v-model="visible"
    title="沟通记录"
    width="800px"
    :close-on-click-modal="false"
  >
    <div v-if="parent" class="contact-records">
      <div class="parent-info">
        <h3>家长信息</h3>
        <p><strong>姓名：</strong>{{ parent.name }}</p>
        <p><strong>电话：</strong>{{ parent.phone }}</p>
      </div>

      <div class="records-section">
        <div class="section-header">
          <h3>沟通记录</h3>
          <el-button type="primary" @click="handleAddRecord">
            <el-icon><Plus /></el-icon>
            添加记录
          </el-button>
        </div>

        <div v-if="recordsList.length === 0" class="empty-state">
          <p>暂无沟通记录</p>
        </div>

        <div v-else class="records-list">
          <div
            v-for="record in recordsList"
            :key="record.id"
            class="record-item"
          >
            <div class="record-header">
              <div class="record-info">
                <span class="record-title">{{ record.title }}</span>
                <span class="record-type">{{ record.type }}</span>
              </div>
              <div class="record-meta">
                <span class="record-time">{{ formatDate(record.time) }}</span>
                <span class="record-creator">{{ record.creator }}</span>
              </div>
            </div>
            <div v-if="record.content" class="record-content">
              {{ record.content }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加记录对话框 -->
    <el-dialog
      v-model="recordDialogVisible"
      title="添加沟通记录"
      width="500px"
      append-to-body
    >
      <el-form :model="recordForm" :rules="recordRules" ref="recordFormRef" label-width="100px">
        <el-form-item label="沟通类型" prop="type">
          <el-select v-model="recordForm.type" placeholder="选择沟通类型" style="width: 100%">
            <el-option label="电话沟通" value="电话沟通" />
            <el-option label="微信沟通" value="微信沟通" />
            <el-option label="面谈" value="面谈" />
            <el-option label="活动反馈" value="活动反馈" />
            <el-option label="问题处理" value="问题处理" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="recordForm.title" placeholder="请输入记录标题" />
        </el-form-item>
        <el-form-item label="沟通内容" prop="content">
          <el-input
            v-model="recordForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入详细的沟通内容"
          />
        </el-form-item>
        <el-form-item label="沟通时间" prop="time">
          <el-date-picker
            v-model="recordForm.time"
            type="datetime"
            placeholder="选择沟通时间"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="recordDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="recordSaving" @click="saveRecord">
            添加
          </el-button>
        </div>
      </template>
    </el-dialog>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'

interface Parent {
  id: number | string
  name: string
  phone: string
}

interface ContactRecord {
  id: number | string
  title: string
  content?: string
  time: string
  type: string
  creator: string
}

interface Props {
  modelValue: boolean
  parent?: Parent | null
  records?: ContactRecord[]
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'add', data: any): void
}

const props = withDefaults(defineProps<Props>(), {
  parent: null,
  records: () => []
})

const emit = defineEmits<Emits>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const recordsList = ref<ContactRecord[]>([])
const recordDialogVisible = ref(false)
const recordSaving = ref(false)
const recordFormRef = ref<FormInstance>()

const recordForm = ref({
  type: '',
  title: '',
  content: '',
  time: ''
})

const recordRules = {
  type: [
    { required: true, message: '请选择沟通类型', trigger: 'change' }
  ],
  title: [
    { required: true, message: '请输入记录标题', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入沟通内容', trigger: 'blur' }
  ],
  time: [
    { required: true, message: '请选择沟通时间', trigger: 'change' }
  ]
}

// 监听records变化
watch(() => props.records, (newRecords) => {
  recordsList.value = [...(newRecords || [])]
}, { immediate: true })

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN')
}

const handleAddRecord = () => {
  recordForm.value = {
    type: '',
    title: '',
    content: '',
    time: new Date().toISOString()
  }
  recordDialogVisible.value = true
}

const saveRecord = async () => {
  if (!recordFormRef.value) return
  
  try {
    await recordFormRef.value.validate()
    recordSaving.value = true
    
    const recordData = {
      ...recordForm.value,
      followupType: recordForm.value.type,
      followupDate: recordForm.value.time
    }
    
    emit('add', recordData)
    recordDialogVisible.value = false
    ElMessage.success('沟通记录添加成功')
  } catch (error) {
    console.error('保存沟通记录失败:', error)
  } finally {
    recordSaving.value = false
  }
}

const handleClose = () => {
  visible.value = false
}
</script>

<style scoped>
.contact-records {
  padding: var(--spacing-lg) 0;
}

.parent-info {
  margin-bottom: var(--spacing-8xl);
  padding: var(--spacing-4xl);
  background: var(--el-bg-color-page);
  border-radius: var(--spacing-sm);
}

.parent-info h3 {
  margin: 0 0 10px 0;
  color: var(--el-text-color-primary);
}

.parent-info p {
  margin: var(--spacing-base) 0;
  color: var(--el-text-color-regular);
}

.records-section {
  margin-top: var(--text-2xl);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4xl);
}

.section-header h3 {
  margin: 0;
  color: var(--el-text-color-primary);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-10xl) 0;
  color: var(--el-text-color-placeholder);
}

.records-list {
  max-height: 400px;
  overflow-y: auto;
}

.record-item {
  padding: var(--spacing-4xl);
  margin-bottom: var(--spacing-2xl);
  background: var(--el-bg-color-page);
  border-radius: var(--spacing-sm);
  border: var(--border-width-base) solid var(--el-border-color-light);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-sm);
}

.record-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.record-title {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.record-type {
  padding: var(--spacing-sm) var(--spacing-sm);
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%);
  color: var(--primary-color);
  border: var(--border-width-base) solid rgba(99, 102, 241, 0.2);
  border-radius: var(--spacing-xs);
  font-size: var(--text-xs);
}

.record-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--spacing-xs);
}

.record-time {
  font-size: var(--text-xs);
  color: var(--el-text-color-secondary);
}

.record-creator {
  font-size: var(--text-xs);
  color: var(--el-text-color-placeholder);
}

.record-content {
  color: var(--el-text-color-regular);
  line-height: 1.5;
  white-space: pre-wrap;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}
</style>