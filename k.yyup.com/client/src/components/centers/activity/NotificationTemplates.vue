<template>
  <div class="notification-templates">
    <div class="templates-header">
      <h3>通知模板</h3>
      <el-button type="primary" @click="handleCreateTemplate">
        <UnifiedIcon name="Plus" />
        新建模板
      </el-button>
    </div>

    <div class="templates-grid">
      <div
        v-for="template in templates"
        :key="template.id"
        class="template-card"
        @click="handleSelectTemplate(template)"
      >
        <div class="template-header">
          <h4>{{ template.name }}</h4>
          <el-dropdown @command="handleTemplateAction">
            <UnifiedIcon name="default" />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :command="{ action: 'edit', template }">编辑</el-dropdown-item>
                <el-dropdown-item :command="{ action: 'copy', template }">复制</el-dropdown-item>
                <el-dropdown-item :command="{ action: 'delete', template }" divided>删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        
        <div class="template-type">
          <el-tag :type="getTypeColor(template.type)">{{ getTypeLabel(template.type) }}</el-tag>
        </div>
        
        <div class="template-content">
          {{ template.content }}
        </div>
        
        <div class="template-footer">
          <span class="usage-count">使用次数: {{ template.usageCount }}</span>
          <span class="update-time">{{ formatDate(template.updatedAt) }}</span>
        </div>
      </div>
    </div>

    <!-- 模板编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑模板' : '新建模板'"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="templateForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="模板名称" prop="name">
          <el-input v-model="templateForm.name" placeholder="请输入模板名称" />
        </el-form-item>

        <el-form-item label="模板类型" prop="type">
          <el-select v-model="templateForm.type" placeholder="请选择模板类型" class="full-width">
            <el-option label="活动提醒" value="activity_reminder" />
            <el-option label="报名通知" value="registration_notice" />
            <el-option label="活动取消" value="activity_cancel" />
            <el-option label="活动变更" value="activity_change" />
            <el-option label="系统通知" value="system_notice" />
          </el-select>
        </el-form-item>

        <el-form-item label="模板内容" prop="content">
          <el-input
            v-model="templateForm.content"
            type="textarea"
            :rows="8"
            placeholder="请输入模板内容，可使用变量：{activityName}、{startTime}、{location}等"
          />
        </el-form-item>

        <el-form-item label="变量说明">
          <div class="variables-help">
            <el-tag v-for="variable in availableVariables" :key="variable.key" size="small">
              {{ variable.key }}: {{ variable.description }}
            </el-tag>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveTemplate" :loading="saving">
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, MoreFilled } from '@element-plus/icons-vue'

interface NotificationTemplate {
  id: string
  name: string
  type: string
  content: string
  usageCount: number
  createdAt: string
  updatedAt: string
}

const emit = defineEmits<{
  'select': [template: NotificationTemplate]
}>()

const templates = ref<NotificationTemplate[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const saving = ref(false)
const formRef = ref()

const templateForm = reactive({
  id: '',
  name: '',
  type: '',
  content: ''
})

const rules = {
  name: [
    { required: true, message: '请输入模板名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择模板类型', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入模板内容', trigger: 'blur' }
  ]
}

const availableVariables = [
  { key: '{activityName}', description: '活动名称' },
  { key: '{startTime}', description: '开始时间' },
  { key: '{endTime}', description: '结束时间' },
  { key: '{location}', description: '活动地点' },
  { key: '{parentName}', description: '家长姓名' },
  { key: '{studentName}', description: '学生姓名' },
  { key: '{contactPhone}', description: '联系电话' }
]

onMounted(() => {
  loadTemplates()
})

const loadTemplates = async () => {
  try {
    // 模拟数据
    templates.value = [
      {
        id: '1',
        name: '活动报名成功通知',
        type: 'registration_notice',
        content: '亲爱的{parentName}家长，您为{studentName}报名的"{activityName}"活动已成功，活动时间：{startTime}，地点：{location}。请准时参加！',
        usageCount: 25,
        createdAt: '2024-01-15',
        updatedAt: '2024-01-20'
      },
      {
        id: '2',
        name: '活动提醒通知',
        type: 'activity_reminder',
        content: '温馨提醒：您报名的"{activityName}"活动将于{startTime}在{location}举行，请提前10分钟到达现场。',
        usageCount: 18,
        createdAt: '2024-01-10',
        updatedAt: '2024-01-18'
      },
      {
        id: '3',
        name: '活动取消通知',
        type: 'activity_cancel',
        content: '很抱歉通知您，原定于{startTime}举行的"{activityName}"活动因故取消，我们将尽快安排补偿活动。给您带来的不便敬请谅解！',
        usageCount: 3,
        createdAt: '2024-01-08',
        updatedAt: '2024-01-12'
      }
    ]
  } catch (error) {
    console.error('加载模板失败:', error)
    ElMessage.error('加载模板失败')
  }
}

const getTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    activity_reminder: '活动提醒',
    registration_notice: '报名通知',
    activity_cancel: '活动取消',
    activity_change: '活动变更',
    system_notice: '系统通知'
  }
  return typeMap[type] || type
}

const getTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    activity_reminder: 'primary',
    registration_notice: 'success',
    activity_cancel: 'danger',
    activity_change: 'warning',
    system_notice: 'info'
  }
  return colorMap[type] || 'info'
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const handleCreateTemplate = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleSelectTemplate = (template: NotificationTemplate) => {
  emit('select', template)
}

const handleTemplateAction = async ({ action, template }: { action: string, template: NotificationTemplate }) => {
  switch (action) {
    case 'edit':
      isEdit.value = true
      Object.assign(templateForm, template)
      dialogVisible.value = true
      break
    case 'copy':
      isEdit.value = false
      Object.assign(templateForm, {
        ...template,
        id: '',
        name: `${template.name} - 副本`
      })
      dialogVisible.value = true
      break
    case 'delete':
      try {
        await ElMessageBox.confirm('确定要删除这个模板吗？', '确认删除', {
          type: 'warning'
        })
        // 这里应该调用删除API
        ElMessage.success('模板删除成功')
        loadTemplates()
      } catch {
        // 用户取消删除
      }
      break
  }
}

const resetForm = () => {
  Object.assign(templateForm, {
    id: '',
    name: '',
    type: '',
    content: ''
  })
  formRef.value?.clearValidate()
}

const handleSaveTemplate = async () => {
  try {
    await formRef.value?.validate()
    
    saving.value = true
    
    // 这里应该调用保存API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success(isEdit.value ? '模板更新成功' : '模板创建成功')
    dialogVisible.value = false
    loadTemplates()
  } catch (error) {
    console.error('保存模板失败:', error)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.notification-templates {
  padding: var(--spacing-xl);
}

.templates-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.templates-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-xl);
}

.template-card {
  background: var(--bg-white);
  border: var(--border-width) solid var(--border-color-light);
  border-radius: var(--spacing-sm);
  padding: var(--text-lg);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.template-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 2px var(--text-sm) var(--shadow-light);
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-sm);
}

.template-header h4 {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--text-lg);
}

.more-icon {
  color: var(--info-color);
  cursor: pointer;
}

.more-icon:hover {
  color: var(--primary-color);
}

.template-type {
  margin-bottom: var(--text-sm);
}

.template-content {
  color: var(--text-secondary);
  font-size: var(--text-base);
  line-height: 1.5;
  margin-bottom: var(--text-lg);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.template-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-sm);
  color: var(--info-color);
}

.variables-help {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.variables-help .el-tag {
  margin: 0;
}

.dialog-footer {
  text-align: right;
}
.full-width {
  width: 100%;
}
</style>
