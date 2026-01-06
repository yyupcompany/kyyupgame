<template>
  <div class="payment-reminder-settings-page">
    <div class="page-header">
      <h1>收费提醒设置</h1>
      <p>配置缴费到期提醒规则和模板</p>
    </div>

    <!-- 提醒规则设置 -->
    <el-card class="settings-card">
      <template #header>
        <span>提醒规则设置</span>
      </template>

      <el-form :model="settings" label-width="150px">
        <el-divider content-position="left">基础设置</el-divider>
        
        <el-form-item label="启用自动提醒">
          <el-switch v-model="settings.autoReminder" />
          <span class="form-tip">开启后系统将自动发送缴费提醒</span>
        </el-form-item>

        <el-form-item label="提醒时间">
          <el-time-picker
            v-model="settings.reminderTime"
            placeholder="选择提醒时间"
            format="HH:mm"
          />
          <span class="form-tip">每天发送提醒的时间</span>
        </el-form-item>

        <el-divider content-position="left">提前提醒设置</el-divider>

        <el-form-item label="提前提醒天数">
          <el-checkbox-group v-model="settings.advanceReminderDays">
            <el-checkbox :label="1">提前1天</el-checkbox>
            <el-checkbox :label="3">提前3天</el-checkbox>
            <el-checkbox :label="7">提前7天</el-checkbox>
            <el-checkbox :label="15">提前15天</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-divider content-position="left">逾期提醒设置</el-divider>

        <el-form-item label="逾期提醒间隔">
          <el-input-number v-model="settings.overdueReminderInterval" :min="1" :max="30" />
          <span class="form-tip">天（逾期后每隔几天提醒一次）</span>
        </el-form-item>

        <el-form-item label="最大提醒次数">
          <el-input-number v-model="settings.maxReminderCount" :min="1" :max="10" />
          <span class="form-tip">次（超过此次数后不再提醒）</span>
        </el-form-item>

        <el-divider content-position="left">提醒方式</el-divider>

        <el-form-item label="提醒渠道">
          <el-checkbox-group v-model="settings.reminderChannels">
            <el-checkbox label="sms">短信</el-checkbox>
            <el-checkbox label="wechat">微信</el-checkbox>
            <el-checkbox label="app">APP推送</el-checkbox>
            <el-checkbox label="email">邮件</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSaveSettings" :loading="saving">
            保存设置
          </el-button>
          <el-button @click="handleResetSettings">
            恢复默认
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 提醒模板管理 -->
    <el-card class="templates-card">
      <template #header>
        <div class="card-header">
          <span>提醒模板管理</span>
          <el-button type="primary" size="small" @click="showTemplateDialog = true">
            <UnifiedIcon name="Plus" />
            新建模板
          </el-button>
        </div>
      </template>

      <div class="table-wrapper">
<el-table class="responsive-table" :data="templates" style="width: 100%">
        <el-table-column prop="name" label="模板名称" width="200" />
        <el-table-column prop="type" label="模板类型" width="150">
          <template #default="{ row }">
            <el-tag>{{ getTemplateTypeLabel(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="channel" label="发送渠道" width="120">
          <template #default="{ row }">
            {{ getChannelLabel(row.channel) }}
          </template>
        </el-table-column>
        <el-table-column prop="content" label="模板内容" min-width="300" show-overflow-tooltip />
        <el-table-column prop="isDefault" label="默认模板" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.isDefault" type="success">是</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleEditTemplate(row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="!row.isDefault"
              type="success"
              size="small"
              @click="handleSetDefault(row)"
            >
              设为默认
            </el-button>
            <el-button
              v-if="!row.isDefault"
              type="danger"
              size="small"
              @click="handleDeleteTemplate(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
</div>
    </el-card>

    <!-- 模板编辑对话框 -->
    <el-dialog
      v-model="showTemplateDialog"
      :title="editingTemplate.id ? '编辑模板' : '新建模板'"
      width="700px"
    >
      <el-form :model="editingTemplate" label-width="100px">
        <el-form-item label="模板名称">
          <el-input v-model="editingTemplate.name" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="模板类型">
          <el-select v-model="editingTemplate.type" placeholder="选择模板类型" style="width: 100%">
            <el-option label="提前提醒" value="advance" />
            <el-option label="到期提醒" value="due" />
            <el-option label="逾期提醒" value="overdue" />
          </el-select>
        </el-form-item>
        <el-form-item label="发送渠道">
          <el-select v-model="editingTemplate.channel" placeholder="选择发送渠道" style="width: 100%">
            <el-option label="短信" value="sms" />
            <el-option label="微信" value="wechat" />
            <el-option label="APP推送" value="app" />
            <el-option label="邮件" value="email" />
          </el-select>
        </el-form-item>
        <el-form-item label="模板内容">
          <el-input
            v-model="editingTemplate.content"
            type="textarea"
            :rows="6"
            placeholder="请输入模板内容，可使用变量：{studentName}、{amount}、{dueDate}、{overdueDays}"
          />
        </el-form-item>
        <el-form-item label="变量说明">
          <div class="variable-tips">
            <p><code>{studentName}</code> - 学生姓名</p>
            <p><code>{amount}</code> - 缴费金额</p>
            <p><code>{dueDate}</code> - 到期日期</p>
            <p><code>{overdueDays}</code> - 逾期天数</p>
            <p><code>{feeItem}</code> - 费用项目</p>
          </div>
        </el-form-item>
        <el-form-item label="示例预览">
          <div class="template-preview">
            {{ previewTemplate(editingTemplate.content) }}
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showTemplateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveTemplate" :loading="savingTemplate">
          保存模板
        </el-button>
      </template>
    </el-dialog>

    <!-- 提醒记录 -->
    <el-card class="records-card">
      <template #header>
        <div class="card-header">
          <span>最近提醒记录</span>
          <el-button size="small" @click="loadReminderRecords">
            <UnifiedIcon name="Refresh" />
            刷新
          </el-button>
        </div>
      </template>

      <el-table class="responsive-table" :data="reminderRecords" style="width: 100%">
        <el-table-column prop="studentName" label="学生姓名" width="120" />
        <el-table-column prop="feeItem" label="费用项目" width="150" />
        <el-table-column prop="amount" label="金额" width="100">
          <template #default="{ row }">
            ¥{{ formatMoney(row.amount) }}
          </template>
        </el-table-column>
        <el-table-column prop="reminderType" label="提醒类型" width="120">
          <template #default="{ row }">
            <el-tag>{{ getTemplateTypeLabel(row.reminderType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="channel" label="发送渠道" width="100">
          <template #default="{ row }">
            {{ getChannelLabel(row.channel) }}
          </template>
        </el-table-column>
        <el-table-column prop="sendTime" label="发送时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.sendTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="发送状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'success' ? 'success' : 'danger'">
              {{ row.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import { get, post, put, del } from '@/utils/request'

// 数据
const saving = ref(false)
const savingTemplate = ref(false)
const templates = ref([])
const reminderRecords = ref([])

const settings = ref({
  autoReminder: false,
  reminderTime: null,
  advanceReminderDays: [3, 7],
  overdueReminderInterval: 3,
  maxReminderCount: 5,
  reminderChannels: ['sms', 'wechat']
})

const showTemplateDialog = ref(false)
const editingTemplate = ref<any>({
  name: '',
  type: 'advance',
  channel: 'sms',
  content: '',
  isDefault: false
})

// 方法
const loadSettings = async () => {
  try {
    const response = await get('/finance/payment-reminder-settings')
    if (response.success) {
      settings.value = response.data
    }
  } catch (error) {
    console.error('加载设置失败:', error)
  }
}

const loadTemplates = async () => {
  try {
    const response = await get('/finance/payment-reminder-templates')
    if (response.success) {
      templates.value = response.data
    }
  } catch (error) {
    console.error('加载模板失败:', error)
  }
}

const loadReminderRecords = async () => {
  try {
    const response = await get('/finance/payment-reminder-records', {
      page: 1,
      pageSize: 10
    })
    if (response.success) {
      reminderRecords.value = response.data.items || []
    }
  } catch (error) {
    console.error('加载提醒记录失败:', error)
  }
}

const handleSaveSettings = async () => {
  try {
    saving.value = true
    const response = await put('/finance/payment-reminder-settings', settings.value)
    if (response.success) {
      ElMessage.success('设置保存成功')
    }
  } catch (error) {
    console.error('保存设置失败:', error)
    ElMessage.error('保存设置失败')
  } finally {
    saving.value = false
  }
}

const handleResetSettings = () => {
  settings.value = {
    autoReminder: false,
    reminderTime: null,
    advanceReminderDays: [3, 7],
    overdueReminderInterval: 3,
    maxReminderCount: 5,
    reminderChannels: ['sms', 'wechat']
  }
}

const handleEditTemplate = (template: any) => {
  editingTemplate.value = { ...template }
  showTemplateDialog.value = true
}

const handleSaveTemplate = async () => {
  try {
    savingTemplate.value = true
    const response = editingTemplate.value.id
      ? await put(`/finance/payment-reminder-templates/${editingTemplate.value.id}`, editingTemplate.value)
      : await post('/finance/payment-reminder-templates', editingTemplate.value)
    
    if (response.success) {
      ElMessage.success('模板保存成功')
      showTemplateDialog.value = false
      loadTemplates()
    }
  } catch (error) {
    console.error('保存模板失败:', error)
    ElMessage.error('保存模板失败')
  } finally {
    savingTemplate.value = false
  }
}

const handleSetDefault = async (template: any) => {
  try {
    const response = await put(`/finance/payment-reminder-templates/${template.id}/set-default`, {})
    if (response.success) {
      ElMessage.success('已设为默认模板')
      loadTemplates()
    }
  } catch (error) {
    console.error('设置默认模板失败:', error)
    ElMessage.error('设置失败')
  }
}

const handleDeleteTemplate = async (template: any) => {
  try {
    await ElMessageBox.confirm('确定删除该模板吗？', '确认', { type: 'warning' })
    
    const response = await del(`/finance/payment-reminder-templates/${template.id}`)
    if (response.success) {
      ElMessage.success('模板已删除')
      loadTemplates()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const previewTemplate = (content: string) => {
  if (!content) return ''
  return content
    .replace('{studentName}', '张小明')
    .replace('{amount}', '1500.00')
    .replace('{dueDate}', '2024-12-31')
    .replace('{overdueDays}', '5')
    .replace('{feeItem}', '学费')
}

const getTemplateTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    'advance': '提前提醒',
    'due': '到期提醒',
    'overdue': '逾期提醒'
  }
  return typeMap[type] || type
}

const getChannelLabel = (channel: string) => {
  const channelMap: Record<string, string> = {
    'sms': '短信',
    'wechat': '微信',
    'app': 'APP推送',
    'email': '邮件'
  }
  return channelMap[channel] || channel
}

const formatMoney = (amount: number) => {
  return amount?.toFixed(2) || '0.00'
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

onMounted(() => {
  loadSettings()
  loadTemplates()
  loadReminderRecords()
})
</script>

<style scoped lang="scss">
.payment-reminder-settings-page {
  padding: var(--text-3xl);

  .page-header {
    margin-bottom: var(--text-3xl);

    h1 {
      margin: 0 0 var(--spacing-sm) 0;
      font-size: var(--text-3xl);
      font-weight: 600;
      color: var(--text-primary);
    }

    p {
      margin: 0;
      font-size: var(--text-base);
      color: var(--info-color);
    }
  }

  .settings-card,
  .templates-card,
  .records-card {
    margin-bottom: var(--text-lg);

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .form-tip {
    margin-left: var(--spacing-sm);
    font-size: var(--text-sm);
    color: var(--info-color);
  }

  .variable-tips {
    padding: var(--text-sm);
    background: var(--bg-hover);
    border-radius: var(--spacing-xs);

    p {
      margin: var(--spacing-xs) 0;
      font-size: var(--text-sm);
      color: var(--text-regular);

      code {
        padding: var(--spacing-sm) 6px;
        background: var(--border-color-light);
        border-radius: var(--radius-xs);
        font-family: monospace;
      }
    }
  }

  .template-preview {
    padding: var(--text-sm);
    background: #f0f9ff;
    border: var(--border-width-base) solid #b3d8ff;
    border-radius: var(--spacing-xs);
    color: var(--primary-color);
    font-size: var(--text-sm);
    line-height: 1.6;
  }
}
</style>

