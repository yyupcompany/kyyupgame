<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    title="发起通话"
    width="500px"
    :before-close="handleClose"
  >
    <div class="make-call-content">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="80px"
        label-position="top"
      >
        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
          <!-- 快速拨号 -->
          <el-tab-pane label="快速拨号" name="quick">
            <el-form-item label="电话号码" prop="phoneNumber">
              <el-input
                v-model="formData.phoneNumber"
                placeholder="请输入电话号码"
                clearable
                @keyup.enter="handleQuickCall"
              >
                <template #prepend>
                  <el-select
                    v-model="formData.countryCode"
                    style="width: 100px"
                    placeholder="区号"
                  >
                    <el-option label="+86" value="86" />
                    <el-option label="+1" value="1" />
                    <el-option label="+852" value="852" />
                    <el-option label="+886" value="886" />
                    <el-option label="+81" value="81" />
                  </el-select>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="备注姓名">
              <el-input
                v-model="formData.contactName"
                placeholder="可选，便于识别通话对象"
                clearable
              />
            </el-form-item>

            <el-form-item label="选择分机" prop="extension">
              <el-select
                v-model="formData.extension"
                placeholder="请选择要使用的分机"
                style="width: 100%"
                :disabled="!availableExtensions.length"
              >
                <el-option
                  v-for="ext in availableExtensions"
                  :key="ext.id"
                  :label="`${ext.id} - ${ext.name}`"
                  :value="ext.id"
                  :disabled="ext.status !== 'online'"
                >
                  <div class="extension-option">
                    <span>{{ ext.id }} - {{ ext.name }}</span>
                    <el-tag
                      :type="ext.status === 'online' ? 'success' : 'danger'"
                      size="small"
                    >
                      {{ ext.status === 'online' ? '在线' : '离线' }}
                    </el-tag>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                size="large"
                style="width: 100%"
                :loading="calling"
                @click="handleQuickCall"
              >
                <LucideIcon name="Phone" :size="16" />
                立即拨打
              </el-button>
            </el-form-item>
          </el-tab-pane>

          <!-- 联系人选择 -->
          <el-tab-pane label="联系人" name="contacts">
            <div class="contacts-section">
              <div class="contacts-search">
                <el-input
                  v-model="contactSearch"
                  placeholder="搜索联系人..."
                  clearable
                >
                  <template #prefix>
                    <LucideIcon name="Search" :size="14" />
                  </template>
                </el-input>
              </div>

              <div class="contacts-list">
                <div
                  v-for="contact in filteredContacts"
                  :key="contact.id"
                  class="contact-item"
                  @click="selectContact(contact)"
                >
                  <div class="contact-avatar">
                    {{ contact.name.charAt(0) }}
                  </div>
                  <div class="contact-info">
                    <div class="contact-name">{{ contact.name }}</div>
                    <div class="contact-phone">{{ contact.phone }}</div>
                  </div>
                  <div class="contact-tags">
                    <el-tag
                      v-for="tag in contact.tags"
                      :key="tag"
                      size="small"
                      type="info"
                    >
                      {{ tag }}
                    </el-tag>
                  </div>
                </div>
              </div>

              <div v-if="filteredContacts.length === 0" class="no-contacts">
                <LucideIcon name="Users" :size="48" />
                <p>暂无联系人</p>
              </div>
            </div>
          </el-tab-pane>

          <!-- 通话记录 -->
          <el-tab-pane label="通话记录" name="history">
            <div class="call-history-section">
              <div class="history-filters">
                <el-select v-model="historyFilter" size="small" style="width: 120px">
                  <el-option label="全部" value="all" />
                  <el-option label="已接通" value="connected" />
                  <el-option label="未接通" value="missed" />
                </el-select>
              </div>

              <div class="history-list">
                <div
                  v-for="record in filteredHistory"
                  :key="record.id"
                  class="history-item"
                  @click="callFromHistory(record)"
                >
                  <div class="history-icon">
                    <el-icon :color="getHistoryIconColor(record.status)">
                      <LucideIcon :name="getHistoryIcon(record.status)" :size="16" />
                    </el-icon>
                  </div>
                  <div class="history-info">
                    <div class="history-contact">
                      {{ record.contactName || record.phoneNumber }}
                    </div>
                    <div class="history-time">
                      {{ formatDateTime(record.startTime) }}
                    </div>
                  </div>
                  <div class="history-duration">
                    {{ formatDuration(record.duration) }}
                  </div>
                  <div class="history-action">
                    <el-button size="small" type="primary" circle>
                      <LucideIcon name="Phone" :size="12" />
                    </el-button>
                  </div>
                </div>
              </div>

              <div v-if="filteredHistory.length === 0" class="no-history">
                <LucideIcon name="PhoneCall" :size="48" />
                <p>暂无通话记录</p>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-form>

      <!-- 快速拨号键盘 -->
      <div v-if="activeTab === 'quick'" class="dialer-keypad">
        <div class="keypad-grid">
          <div
            v-for="key in keypadKeys"
            :key="key.value"
            class="keypad-button"
            @click="handleKeypadPress(key.value)"
          >
            <div class="key-main">{{ key.main }}</div>
            <div v-if="key.sub" class="key-sub">{{ key.sub }}</div>
          </div>
        </div>
        <div class="keypad-actions">
          <el-button size="large" @click="handleBackspace">
            <LucideIcon name="Delete" :size="16" />
          </el-button>
          <el-button size="large" type="danger" @click="handleClear">
            <LucideIcon name="X" :size="16" />
          </el-button>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          @click="handleMakeCall"
          :loading="calling"
          :disabled="!formData.phoneNumber"
        >
          拨打电话
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import LucideIcon from '@/components/icons/LucideIcon.vue'

interface Contact {
  id: string
  name: string
  phone: string
  tags: string[]
}

interface CallRecord {
  id: string
  phoneNumber: string
  contactName?: string
  startTime: Date
  duration?: number
  status: 'connected' | 'missed'
}

interface Extension {
  id: string
  name: string
  status: 'online' | 'offline'
}

interface Props {
  visible: boolean
  contacts: Contact[]
  extensions: Extension[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [visible: boolean]
  call: [data: { phoneNumber: string; contactName?: string; extension: string }]
}>()

// 响应式数据
const formRef = ref<FormInstance>()
const calling = ref(false)
const activeTab = ref('quick')
const contactSearch = ref('')
const historyFilter = ref('all')

const formData = reactive({
  countryCode: '86',
  phoneNumber: '',
  contactName: '',
  extension: ''
})

const formRules: FormRules = {
  phoneNumber: [
    { required: true, message: '请输入电话号码', trigger: 'blur' },
    { pattern: /^\d+$/, message: '请输入有效的电话号码', trigger: 'blur' }
  ],
  extension: [
    { required: true, message: '请选择分机', trigger: 'change' }
  ]
}

// 拨号键盘配置
const keypadKeys = [
  { main: '1', sub: '' },
  { main: '2', sub: 'ABC' },
  { main: '3', sub: 'DEF' },
  { main: '4', sub: 'GHI' },
  { main: '5', sub: 'JKL' },
  { main: '6', sub: 'MNO' },
  { main: '7', sub: 'PQRS' },
  { main: '8', sub: 'TUV' },
  { main: '9', sub: 'WXYZ' },
  { main: '*', sub: '' },
  { main: '0', sub: '+' },
  { main: '#', sub: '' }
]

// 模拟数据
const callHistory = ref<CallRecord[]>([
  {
    id: '1',
    phoneNumber: '13800138000',
    contactName: '张三',
    startTime: new Date(Date.now() - 3600000),
    duration: 180,
    status: 'connected'
  },
  {
    id: '2',
    phoneNumber: '13900139000',
    startTime: new Date(Date.now() - 7200000),
    duration: 0,
    status: 'missed'
  }
])

// 计算属性
const availableExtensions = computed(() => {
  return props.extensions.filter(ext => ext.status === 'online')
})

const filteredContacts = computed(() => {
  if (!contactSearch.value) return props.contacts

  const search = contactSearch.value.toLowerCase()
  return props.contacts.filter(contact =>
    contact.name.toLowerCase().includes(search) ||
    contact.phone.includes(search)
  )
})

const filteredHistory = computed(() => {
  if (historyFilter.value === 'all') return callHistory.value
  return callHistory.value.filter(record => record.status === historyFilter.value)
})

// 监听对话框显示状态
watch(() => props.visible, (visible) => {
  if (visible) {
    resetForm()
  }
})

// 方法
const resetForm = () => {
  formData.phoneNumber = ''
  formData.contactName = ''
  formData.extension = availableExtensions.value[0]?.id || ''
  contactSearch.value = ''
  historyFilter.value = 'all'
  activeTab.value = 'quick'
}

const handleTabChange = (tabName: string) => {
  activeTab.value = tabName
}

const handleQuickCall = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    await makeCall()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const handleMakeCall = async () => {
  await makeCall()
}

const makeCall = async () => {
  if (!formData.phoneNumber) {
    ElMessage.warning('请输入电话号码')
    return
  }

  if (!formData.extension) {
    ElMessage.warning('请选择分机')
    return
  }

  calling.value = true

  try {
    // 构建完整的电话号码
    const fullPhoneNumber = `+${formData.countryCode}${formData.phoneNumber}`

    emit('call', {
      phoneNumber: fullPhoneNumber,
      contactName: formData.contactName,
      extension: formData.extension
    })

    ElMessage.success('正在发起通话...')

    // 延迟关闭对话框
    setTimeout(() => {
      handleClose()
    }, 1000)
  } catch (error) {
    console.error('发起通话失败:', error)
    ElMessage.error('发起通话失败')
  } finally {
    calling.value = false
  }
}

const selectContact = (contact: Contact) => {
  formData.phoneNumber = contact.phone.replace(/\D/g, '')
  formData.contactName = contact.name
  activeTab.value = 'quick'
}

const callFromHistory = (record: CallRecord) => {
  formData.phoneNumber = record.phoneNumber.replace(/\D/g, '')
  formData.contactName = record.contactName
  activeTab.value = 'quick'
}

const handleKeypadPress = (key: string) => {
  if (formData.phoneNumber.length < 20) {
    formData.phoneNumber += key
  }
}

const handleBackspace = () => {
  formData.phoneNumber = formData.phoneNumber.slice(0, -1)
}

const handleClear = () => {
  formData.phoneNumber = ''
}

const getHistoryIcon = (status: string) => {
  return status === 'connected' ? 'Phone' : 'PhoneMissed'
}

const getHistoryIconColor = (status: string) => {
  return status === 'connected' ? 'var(--success-color)' : 'var(--danger-color)'
}

const formatDateTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(hours / 24)

  if (hours < 1) {
    return '刚刚'
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

const formatDuration = (seconds?: number) => {
  if (!seconds) return '未接通'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const handleClose = () => {
  emit('update:visible', false)
}
</script>

<style scoped lang="scss">
.make-call-content {
  .extension-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .contacts-section,
  .call-history-section {
    .contacts-search,
    .history-filters {
      margin-bottom: var(--text-lg);
    }

    .contacts-list,
    .history-list {
      max-height: 300px;
      overflow-y: auto;
      border: var(--border-width-base) solid var(--border-primary, var(--border-color));
      border-radius: var(--spacing-sm);
    }

    .contact-item,
    .history-item {
      display: flex;
      align-items: center;
      padding: var(--text-sm) var(--text-lg);
      border-bottom: var(--border-width-base) solid var(--border-primary, var(--border-color));
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background: var(--bg-secondary, #f9fafb);
      }

      &:last-child {
        border-bottom: none;
      }
    }

    .contact-avatar {
      width: var(--icon-size); height: var(--icon-size);
      border-radius: var(--radius-full);
      background: var(--primary-color, var(--primary-color));
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      margin-right: var(--text-sm);
    }

    .contact-info,
    .history-info {
      flex: 1;

      .contact-name,
      .history-contact {
        font-weight: 500;
        color: var(--text-primary, var(--text-primary));
        margin-bottom: var(--spacing-xs);
      }

      .contact-phone,
      .history-time {
        font-size: var(--text-sm);
        color: var(--text-secondary, var(--text-secondary));
      }
    }

    .contact-tags {
      display: flex;
      gap: var(--spacing-xs);
      flex-wrap: wrap;
    }

    .history-icon {
      width: var(--spacing-3xl);
      height: var(--spacing-3xl);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: var(--text-sm);
    }

    .history-duration {
      font-size: var(--text-base);
      color: var(--text-secondary, var(--text-secondary));
      margin-right: var(--text-sm);
      min-width: 50px;
      text-align: right;
    }

    .history-action {
      // 通话操作按钮
    }
  }

  .no-contacts,
  .no-history {
    text-align: center;
    padding: var(--spacing-10xl);
    color: var(--text-secondary, var(--text-secondary));

    p {
      margin-top: var(--text-sm);
      margin-bottom: 0;
    }
  }
}

.dialer-keypad {
  margin-top: var(--text-2xl);
  padding-top: var(--text-2xl);
  border-top: var(--border-width-base) solid var(--border-primary, var(--border-color));

  .keypad-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-sm);
    margin-bottom: var(--text-sm);

    .keypad-button {
      aspect-ratio: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: var(--bg-secondary, #f9fafb);
      border: var(--border-width-base) solid var(--border-primary, var(--border-color));
      border-radius: var(--spacing-sm);
      cursor: pointer;
      transition: all 0.2s;
      user-select: none;

      &:hover {
        background: var(--primary-color, var(--primary-color));
        border-color: var(--primary-color, var(--primary-color));
        color: white;
      }

      &:active {
        transform: scale(0.95);
      }

      .key-main {
        font-size: var(--text-2xl);
        font-weight: 600;
        line-height: 1;
      }

      .key-sub {
        font-size: var(--text-2xs);
        opacity: 0.7;
        margin-top: var(--spacing-sm);
      }
    }
  }

  .keypad-actions {
    display: flex;
    gap: var(--spacing-sm);
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--text-sm);
}

// 暗黑主题
.dark {
  .contacts-list,
  .history-list {
    background: rgba(30, 41, 59, 0.8);
    border-color: rgba(71, 85, 105, 0.3);
  }

  .contact-item:hover,
  .history-item:hover {
    background: rgba(71, 85, 105, 0.2);
  }

  .keypad-button {
    background: rgba(71, 85, 105, 0.2);
    border-color: rgba(71, 85, 105, 0.3);
    color: var(--white-alpha-90);

    &:hover {
      background: var(--primary-color, var(--primary-color));
      border-color: var(--primary-color, var(--primary-color));
      color: white;
    }
  }
}

// html.dark 兼容性
html.dark {
  .contacts-list,
  .history-list {
    background: rgba(30, 41, 59, 0.8);
    border-color: rgba(71, 85, 105, 0.3);
  }

  .contact-item:hover,
  .history-item:hover {
    background: rgba(71, 85, 105, 0.2);
  }

  .keypad-button {
    background: rgba(71, 85, 105, 0.2);
    border-color: rgba(71, 85, 105, 0.3);
    color: var(--white-alpha-90);

    &:hover {
      background: var(--primary-color, var(--primary-color));
      border-color: var(--primary-color, var(--primary-color));
      color: white;
    }
  }
}
</style>