<template>
  <div class="follow-record">
    <!-- 跟进记录列表 -->
    <div class="record-list">
      <div class="list-header">
        <h3>跟进记录</h3>
        <el-button type="primary" size="small" @click="showAddDialog = true">
          <el-icon><Plus /></el-icon>
          新增跟进
        </el-button>
      </div>

      <div class="timeline-container" v-loading="loading">
        <el-timeline v-if="records.length > 0">
          <el-timeline-item
            v-for="record in records"
            :key="record.id"
            :timestamp="formatTime(record.followTime)"
            placement="top"
            :type="getTimelineType(record.result)"
          >
            <el-card class="record-card">
              <div class="record-header">
                <div class="record-info">
                  <span class="follow-method">{{ getMethodText(record.method) }}</span>
                  <el-tag :type="getResultType(record.result)" size="small">
                    {{ getResultText(record.result) }}
                  </el-tag>
                </div>
                <div class="record-actions">
                  <el-button size="small" text @click="editRecord(record)">
                    编辑
                  </el-button>
                  <el-button size="small" text type="danger" @click="deleteRecord(record)">
                    删除
                  </el-button>
                </div>
              </div>
              <div class="record-content">
                <p><strong>跟进内容：</strong>{{ record.content }}</p>
                <p v-if="record.feedback"><strong>客户反馈：</strong>{{ record.feedback }}</p>
                <p v-if="record.nextFollowTime">
                  <strong>下次跟进：</strong>
                  <span :class="{ 'text-danger': isOverdue(record.nextFollowTime) }">
                    {{ formatTime(record.nextFollowTime) }}
                  </span>
                </p>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
        <el-empty v-else description="暂无跟进记录" />
      </div>
    </div>

    <!-- 新增/编辑跟进对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingRecord ? '编辑跟进记录' : '新增跟进记录'"
      width="600px"
      :before-close="handleCloseDialog"
    >
      <el-form :model="followForm" :rules="followRules" ref="followFormRef" label-width="100px">
        <el-form-item label="跟进方式" prop="method">
          <el-radio-group v-model="followForm.method">
            <el-radio label="phone">电话</el-radio>
            <el-radio label="wechat">微信</el-radio>
            <el-radio label="visit">上门</el-radio>
            <el-radio label="online">在线</el-radio>
            <el-radio label="other">其他</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="跟进内容" prop="content">
          <el-input
            v-model="followForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入跟进内容"
          />
        </el-form-item>
        <el-form-item label="客户反馈" prop="feedback">
          <el-input
            v-model="followForm.feedback"
            type="textarea"
            :rows="3"
            placeholder="请输入客户反馈"
          />
        </el-form-item>
        <el-form-item label="跟进结果" prop="result">
          <el-select v-model="followForm.result" placeholder="选择跟进结果" style="width: 100%">
            <el-option label="有意向" value="interested" />
            <el-option label="需考虑" value="considering" />
            <el-option label="无意向" value="not_interested" />
            <el-option label="已成交" value="success" />
            <el-option label="已流失" value="lost" />
          </el-select>
        </el-form-item>
        <el-form-item label="下次跟进" prop="nextFollowTime">
          <el-date-picker
            v-model="followForm.nextFollowTime"
            type="datetime"
            placeholder="选择下次跟进时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="followForm.remark"
            type="textarea"
            :rows="2"
            placeholder="其他备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleCloseDialog">取消</el-button>
        <el-button type="primary" @click="submitFollow" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// Props
interface FollowRecord {
  id: string
  customerId: string
  method: string
  content: string
  feedback: string
  result: string
  followTime: string
  nextFollowTime: string
  remark: string
}

interface Props {
  customerId: string
  records?: FollowRecord[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  records: () => [],
  loading: false
})

// Emits
const emit = defineEmits<{
  'add-record': [record: Omit<FollowRecord, 'id'>]
  'update-record': [record: FollowRecord]
  'delete-record': [recordId: string]
  'refresh': []
}>()

// 响应式数据
const showAddDialog = ref(false)
const submitting = ref(false)
const editingRecord = ref<FollowRecord | null>(null)
const records = ref<FollowRecord[]>([])

// 跟进表单
const followForm = reactive({
  method: 'phone',
  content: '',
  feedback: '',
  result: '',
  nextFollowTime: null,
  remark: ''
})

const followRules = {
  method: [{ required: true, message: '请选择跟进方式', trigger: 'change' }],
  content: [{ required: true, message: '请输入跟进内容', trigger: 'blur' }],
  result: [{ required: true, message: '请选择跟进结果', trigger: 'change' }]
}

const followFormRef = ref()

// 方法
const getMethodText = (method: string) => {
  const texts = {
    phone: '电话',
    wechat: '微信',
    visit: '上门',
    online: '在线',
    other: '其他'
  }
  return texts[method] || method
}

const getResultText = (result: string) => {
  const texts = {
    interested: '有意向',
    considering: '需考虑',
    not_interested: '无意向',
    success: '已成交',
    lost: '已流失'
  }
  return texts[result] || result
}

const getResultType = (result: string) => {
  const types = {
    interested: 'success',
    considering: 'warning',
    not_interested: 'info',
    success: 'success',
    lost: 'danger'
  }
  return types[result] || ''
}

const getTimelineType = (result: string) => {
  const types = {
    interested: 'success',
    considering: 'warning',
    not_interested: 'info',
    success: 'success',
    lost: 'danger'
  }
  return types[result] || 'primary'
}

const formatTime = (time: string) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const isOverdue = (time: string) => {
  if (!time) return false
  return new Date(time) < new Date()
}

const editRecord = (record: FollowRecord) => {
  editingRecord.value = record
  Object.assign(followForm, {
    method: record.method,
    content: record.content,
    feedback: record.feedback,
    result: record.result,
    nextFollowTime: record.nextFollowTime ? new Date(record.nextFollowTime) : null,
    remark: record.remark
  })
  showAddDialog.value = true
}

const deleteRecord = async (record: FollowRecord) => {
  try {
    await ElMessageBox.confirm('确定要删除这条跟进记录吗？', '确认删除', {
      type: 'warning'
    })
    emit('delete-record', record.id)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消删除
  }
}

const submitFollow = async () => {
  if (!followFormRef.value) return
  
  try {
    await followFormRef.value.validate()
    submitting.value = true
    
    const recordData = {
      customerId: props.customerId,
      method: followForm.method,
      content: followForm.content,
      feedback: followForm.feedback,
      result: followForm.result,
      followTime: new Date().toISOString(),
      nextFollowTime: followForm.nextFollowTime ? followForm.nextFollowTime.toISOString() : '',
      remark: followForm.remark
    }
    
    if (editingRecord.value) {
      emit('update-record', { ...recordData, id: editingRecord.value.id })
      ElMessage.success('跟进记录更新成功')
    } else {
      emit('add-record', recordData)
      ElMessage.success('跟进记录添加成功')
    }
    
    handleCloseDialog()
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  Object.assign(followForm, {
    method: 'phone',
    content: '',
    feedback: '',
    result: '',
    nextFollowTime: null,
    remark: ''
  })
  followFormRef.value?.resetFields()
  editingRecord.value = null
}

const handleCloseDialog = () => {
  resetForm()
  showAddDialog.value = false
}

// 生命周期
onMounted(() => {
  records.value = props.records
})
</script>

<style scoped>
.follow-record {
  height: 100%;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-2xl);
}

.list-header h3 {
  margin: 0;
  font-size: var(--text-lg);
  color: var(--text-primary);
}

.timeline-container {
  max-height: 600px;
  overflow-y: auto;
}

.record-card {
  margin-bottom: var(--spacing-2xl);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-2xl);
}

.record-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-2xl);
}

.follow-method {
  font-weight: bold;
  color: var(--primary-color);
}

.record-actions {
  display: flex;
  gap: var(--spacing-base);
}

.record-content p {
  margin: var(--spacing-base) 0;
  line-height: 1.5;
}

.text-danger {
  color: var(--danger-color);
}
</style>
