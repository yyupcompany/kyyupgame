<template>
  <div class="notification-settings">
    <div class="settings-header">
      <h3>通知设置</h3>
      <el-button type="primary" @click="handleSave" :loading="saving">
        保存设置
      </el-button>
    </div>

    <el-tabs v-model="activeTab" class="settings-tabs">
      <!-- 基础设置 -->
      <el-tab-pane label="基础设置" name="basic">
        <div class="settings-section">
          <h4>默认发送方式</h4>
          <el-checkbox-group v-model="settings.defaultSendMethods">
            <el-checkbox label="system">站内消息</el-checkbox>
            <el-checkbox label="sms">短信通知</el-checkbox>
            <el-checkbox label="email">邮件通知</el-checkbox>
            <el-checkbox label="wechat">微信通知</el-checkbox>
          </el-checkbox-group>
        </div>

        <div class="settings-section">
          <h4>自动发送设置</h4>
          <el-form :model="settings" label-width="120px">
            <el-form-item label="活动提醒">
              <el-switch v-model="settings.autoReminder" />
              <span class="setting-desc">活动开始前自动发送提醒通知</span>
            </el-form-item>
            
            <el-form-item label="提醒时间" v-if="settings.autoReminder">
              <el-select v-model="settings.reminderTime" placeholder="选择提醒时间">
                <el-option label="1小时前" value="1h" />
                <el-option label="2小时前" value="2h" />
                <el-option label="1天前" value="1d" />
                <el-option label="2天前" value="2d" />
                <el-option label="1周前" value="1w" />
              </el-select>
            </el-form-item>

            <el-form-item label="报名确认">
              <el-switch v-model="settings.autoConfirmation" />
              <span class="setting-desc">报名成功后自动发送确认通知</span>
            </el-form-item>

            <el-form-item label="状态变更">
              <el-switch v-model="settings.autoStatusChange" />
              <span class="setting-desc">活动状态变更时自动通知相关人员</span>
            </el-form-item>
          </el-form>
        </div>

        <div class="settings-section">
          <h4>发送频率限制</h4>
          <el-form :model="settings" label-width="120px">
            <el-form-item label="每日限制">
              <el-input-number 
                v-model="settings.dailyLimit" 
                :min="1" 
                :max="1000"
                placeholder="每日最大发送数量"
              />
              <span class="setting-desc">条/天</span>
            </el-form-item>

            <el-form-item label="每小时限制">
              <el-input-number 
                v-model="settings.hourlyLimit" 
                :min="1" 
                :max="100"
                placeholder="每小时最大发送数量"
              />
              <span class="setting-desc">条/小时</span>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <!-- 短信设置 -->
      <el-tab-pane label="短信设置" name="sms">
        <div class="settings-section">
          <h4>短信服务配置</h4>
          <el-form :model="settings.sms" label-width="120px">
            <el-form-item label="服务商">
              <el-select v-model="settings.sms.provider" placeholder="选择短信服务商">
                <el-option label="阿里云" value="aliyun" />
                <el-option label="腾讯云" value="tencent" />
                <el-option label="华为云" value="huawei" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>

            <el-form-item label="AccessKey">
              <el-input 
                v-model="settings.sms.accessKey" 
                placeholder="请输入AccessKey"
                show-password
              />
            </el-form-item>

            <el-form-item label="SecretKey">
              <el-input 
                v-model="settings.sms.secretKey" 
                placeholder="请输入SecretKey"
                show-password
              />
            </el-form-item>

            <el-form-item label="签名">
              <el-input 
                v-model="settings.sms.signature" 
                placeholder="请输入短信签名"
              />
            </el-form-item>
          </el-form>
        </div>

        <div class="settings-section">
          <h4>短信模板</h4>
          <div class="template-list">
            <div 
              v-for="template in settings.sms.templates" 
              :key="template.type"
              class="template-item"
            >
              <div class="template-header">
                <span class="template-type">{{ getTemplateTypeLabel(template.type) }}</span>
                <el-button size="small" @click="editTemplate(template)">编辑</el-button>
              </div>
              <div class="template-content">{{ template.content }}</div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 邮件设置 -->
      <el-tab-pane label="邮件设置" name="email">
        <div class="settings-section">
          <h4>邮件服务配置</h4>
          <el-form :model="settings.email" label-width="120px">
            <el-form-item label="SMTP服务器">
              <el-input 
                v-model="settings.email.smtpHost" 
                placeholder="请输入SMTP服务器地址"
              />
            </el-form-item>

            <el-form-item label="端口">
              <el-input-number 
                v-model="settings.email.smtpPort" 
                :min="1" 
                :max="65535"
                placeholder="SMTP端口"
              />
            </el-form-item>

            <el-form-item label="发件人邮箱">
              <el-input 
                v-model="settings.email.fromEmail" 
                placeholder="请输入发件人邮箱"
              />
            </el-form-item>

            <el-form-item label="发件人密码">
              <el-input 
                v-model="settings.email.password" 
                placeholder="请输入邮箱密码或授权码"
                show-password
              />
            </el-form-item>

            <el-form-item label="SSL加密">
              <el-switch v-model="settings.email.ssl" />
            </el-form-item>
          </el-form>
        </div>

        <div class="settings-section">
          <h4>邮件模板</h4>
          <div class="template-list">
            <div 
              v-for="template in settings.email.templates" 
              :key="template.type"
              class="template-item"
            >
              <div class="template-header">
                <span class="template-type">{{ getTemplateTypeLabel(template.type) }}</span>
                <el-button size="small" @click="editTemplate(template)">编辑</el-button>
              </div>
              <div class="template-subject">主题：{{ template.subject }}</div>
              <div class="template-content">{{ template.content }}</div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 微信设置 -->
      <el-tab-pane label="微信设置" name="wechat">
        <div class="settings-section">
          <h4>微信公众号配置</h4>
          <el-form :model="settings.wechat" label-width="120px">
            <el-form-item label="AppID">
              <el-input 
                v-model="settings.wechat.appId" 
                placeholder="请输入微信公众号AppID"
              />
            </el-form-item>

            <el-form-item label="AppSecret">
              <el-input 
                v-model="settings.wechat.appSecret" 
                placeholder="请输入微信公众号AppSecret"
                show-password
              />
            </el-form-item>

            <el-form-item label="Token">
              <el-input 
                v-model="settings.wechat.token" 
                placeholder="请输入Token"
              />
            </el-form-item>
          </el-form>
        </div>

        <div class="settings-section">
          <h4>模板消息</h4>
          <div class="template-list">
            <div 
              v-for="template in settings.wechat.templates" 
              :key="template.type"
              class="template-item"
            >
              <div class="template-header">
                <span class="template-type">{{ getTemplateTypeLabel(template.type) }}</span>
                <el-button size="small" @click="editTemplate(template)">编辑</el-button>
              </div>
              <div class="template-id">模板ID：{{ template.templateId }}</div>
              <div class="template-content">{{ template.content }}</div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 模板编辑对话框 -->
    <el-dialog
      v-model="templateDialogVisible"
      title="编辑模板"
      width="600px"
    >
      <el-form
        v-if="currentTemplate"
        :model="currentTemplate"
        label-width="100px"
      >
        <el-form-item label="模板类型">
          <span>{{ getTemplateTypeLabel(currentTemplate.type) }}</span>
        </el-form-item>

        <el-form-item v-if="currentTemplate.subject !== undefined" label="邮件主题">
          <el-input v-model="currentTemplate.subject" placeholder="请输入邮件主题" />
        </el-form-item>

        <el-form-item v-if="currentTemplate.templateId !== undefined" label="模板ID">
          <el-input v-model="currentTemplate.templateId" placeholder="请输入微信模板ID" />
        </el-form-item>

        <el-form-item label="模板内容">
          <el-input
            v-model="currentTemplate.content"
            type="textarea"
            :rows="6"
            placeholder="请输入模板内容"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="templateDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveTemplate">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

interface NotificationSettings {
  defaultSendMethods: string[]
  autoReminder: boolean
  reminderTime: string
  autoConfirmation: boolean
  autoStatusChange: boolean
  dailyLimit: number
  hourlyLimit: number
  sms: {
    provider: string
    accessKey: string
    secretKey: string
    signature: string
    templates: Array<{
      type: string
      content: string
    }>
  }
  email: {
    smtpHost: string
    smtpPort: number
    fromEmail: string
    password: string
    ssl: boolean
    templates: Array<{
      type: string
      subject: string
      content: string
    }>
  }
  wechat: {
    appId: string
    appSecret: string
    token: string
    templates: Array<{
      type: string
      templateId: string
      content: string
    }>
  }
}

const activeTab = ref('basic')
const saving = ref(false)
const templateDialogVisible = ref(false)
const currentTemplate = ref<any>(null)

const settings = reactive<NotificationSettings>({
  defaultSendMethods: ['system'],
  autoReminder: true,
  reminderTime: '1d',
  autoConfirmation: true,
  autoStatusChange: true,
  dailyLimit: 500,
  hourlyLimit: 50,
  sms: {
    provider: 'aliyun',
    accessKey: '',
    secretKey: '',
    signature: '',
    templates: [
      { type: 'activity_reminder', content: '【幼儿园】亲爱的{parentName}家长，您报名的"{activityName}"活动将于{startTime}开始，请准时参加！' },
      { type: 'registration_notice', content: '【幼儿园】恭喜您！{studentName}已成功报名"{activityName}"活动，活动时间：{startTime}。' }
    ]
  },
  email: {
    smtpHost: '',
    smtpPort: 587,
    fromEmail: '',
    password: '',
    ssl: true,
    templates: [
      { 
        type: 'activity_reminder', 
        subject: '活动提醒 - {activityName}',
        content: '亲爱的{parentName}家长，\n\n您报名的"{activityName}"活动将于{startTime}在{location}举行，请准时参加！\n\n如有疑问，请联系我们。\n\n幼儿园'
      },
      { 
        type: 'registration_notice', 
        subject: '报名成功 - {activityName}',
        content: '亲爱的{parentName}家长，\n\n恭喜您！{studentName}已成功报名"{activityName}"活动。\n\n活动详情：\n时间：{startTime}\n地点：{location}\n\n期待您的参与！\n\n幼儿园'
      }
    ]
  },
  wechat: {
    appId: '',
    appSecret: '',
    token: '',
    templates: [
      { 
        type: 'activity_reminder', 
        templateId: '',
        content: '活动名称：{activityName}\n开始时间：{startTime}\n活动地点：{location}\n温馨提示：请准时参加'
      },
      { 
        type: 'registration_notice', 
        templateId: '',
        content: '学生姓名：{studentName}\n活动名称：{activityName}\n报名状态：成功\n活动时间：{startTime}'
      }
    ]
  }
})

onMounted(() => {
  loadSettings()
})

const loadSettings = async () => {
  try {
    // 这里应该从API加载设置
    console.log('加载通知设置')
  } catch (error) {
    console.error('加载设置失败:', error)
  }
}

const handleSave = async () => {
  try {
    saving.value = true
    
    // 这里应该调用API保存设置
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('设置保存成功')
  } catch (error) {
    console.error('保存设置失败:', error)
    ElMessage.error('保存设置失败')
  } finally {
    saving.value = false
  }
}

const getTemplateTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    activity_reminder: '活动提醒',
    registration_notice: '报名通知',
    activity_cancel: '活动取消',
    activity_change: '活动变更',
    system_notice: '系统通知'
  }
  return typeMap[type] || type
}

const editTemplate = (template: any) => {
  currentTemplate.value = { ...template }
  templateDialogVisible.value = true
}

const saveTemplate = () => {
  if (!currentTemplate.value) return
  
  // 更新对应的模板
  const { type } = currentTemplate.value
  
  if (activeTab.value === 'sms') {
    const index = settings.sms.templates.findIndex(t => t.type === type)
    if (index !== -1) {
      settings.sms.templates[index] = { ...currentTemplate.value }
    }
  } else if (activeTab.value === 'email') {
    const index = settings.email.templates.findIndex(t => t.type === type)
    if (index !== -1) {
      settings.email.templates[index] = { ...currentTemplate.value }
    }
  } else if (activeTab.value === 'wechat') {
    const index = settings.wechat.templates.findIndex(t => t.type === type)
    if (index !== -1) {
      settings.wechat.templates[index] = { ...currentTemplate.value }
    }
  }
  
  templateDialogVisible.value = false
  ElMessage.success('模板更新成功')
}
</script>

<style scoped>
.notification-settings {
  padding: var(--spacing-xl);
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.settings-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.settings-tabs {
  margin-top: var(--spacing-xl);
}

.settings-section {
  margin-bottom: var(--spacing-8xl);
  padding: var(--spacing-xl);
  background: var(--bg-gray-light);
  border-radius: var(--spacing-sm);
}

.settings-section h4 {
  margin: 0 0 var(--text-lg) 0;
  color: var(--text-primary);
  font-size: var(--text-lg);
  font-weight: 600;
}

.setting-desc {
  margin-left: var(--spacing-2xl);
  color: var(--text-secondary);
  font-size: var(--text-sm);
}

.template-list {
  display: flex;
  flex-direction: column;
  gap: var(--text-lg);
}

.template-item {
  background: var(--bg-white);
  border: var(--border-width) solid var(--border-color-light);
  border-radius: var(--spacing-sm);
  padding: var(--text-lg);
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-sm);
}

.template-type {
  font-weight: 600;
  color: var(--text-primary);
}

.template-subject,
.template-id {
  color: var(--text-secondary);
  font-size: var(--text-base);
  margin-bottom: var(--spacing-sm);
}

.template-content {
  color: var(--text-primary);
  line-height: 1.5;
  background: var(--bg-hover);
  padding: var(--text-sm);
  border-radius: var(--spacing-xs);
  font-size: var(--text-base);
}

.dialog-footer {
  text-align: right;
}
</style>
