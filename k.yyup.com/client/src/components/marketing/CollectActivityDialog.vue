<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="700px"
    :before-close="handleClose"
  >
    <!-- 活动信息展示 -->
    <div class="activity-info" v-if="activity">
      <div class="activity-header">
        <h3>{{ activity.title }}</h3>
        <div class="activity-meta">
          <div class="collect-info">
            <div class="progress-container">
              <div class="progress-info">
                <span class="current">{{ collectActivity?.currentCount || 0 }}</span>
                <span class="separator">/</span>
                <span class="target">{{ collectActivity?.targetCount || 0 }}</span>
                <span class="unit">人</span>
              </div>
              <div class="progress-bar">
                <el-progress
                  :percentage="progressPercentage"
                  :color="progressColor"
                  :show-text="false"
                />
              </div>
              <div class="progress-text">{{ progressPercentage.toFixed(1) }}%</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 积攒码展示 -->
      <div class="collect-code" v-if="collectActivity && collectActivity.collectCode">
        <div class="code-container">
          <span class="code-label">积攒码：</span>
          <span class="code-value">{{ collectActivity.collectCode }}</span>
          <el-button size="small" @click="copyCollectCode">
            <el-icon><CopyDocument /></el-icon>
            复制
          </el-button>
        </div>
        <div class="code-qrcode" v-if="showQRCode">
          <div ref="qrcodeRef"></div>
        </div>
      </div>
    </div>

    <!-- 积攒详情 -->
    <div class="collect-details">
      <el-tabs v-model="activeTab">
        <!-- 基本信息 -->
        <el-tab-pane label="基本信息" name="basic">
          <div class="basic-info">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="目标人数">
                {{ collectActivity?.targetCount || 0 }} 人
              </el-descriptions-item>
              <el-descriptions-item label="当前积攒">
                {{ collectActivity?.currentCount || 0 }} 人
              </el-descriptions-item>
              <el-descriptions-item label="完成度">
                {{ progressPercentage.toFixed(1) }}%
              </el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag :type="statusTagType">{{ statusText }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="奖励类型">
                {{ rewardTypeText }}
              </el-descriptions-item>
              <el-descriptions-item label="奖励内容">
                {{ collectActivity?.rewardValue || 'N/A' }}
              </el-descriptions-item>
              <el-descriptions-item label="截止时间" :span="2">
                {{ formatDeadline(collectActivity?.deadline) }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-tab-pane>

        <!-- 助力记录 -->
        <el-tab-pane label="助力记录" name="helpers">
          <div class="helper-list">
            <el-table :data="helperRecords" v-loading="loadingHelpers">
              <el-table-column prop="helperName" label="助力者" width="120" />
              <el-table-column prop="helpTime" label="助力时间" width="180">
                <template #default="{ row }">
                  {{ formatTime(row.helpTime) }}
                </template>
              </el-table-column>
              <el-table-column prop="ip" label="IP地址" width="120" />
              <el-table-column label="操作" width="100">
                <template #default="{ row }">
                  <el-button size="small" type="text" @click="viewHelperDetail(row)">
                    详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <div class="load-more" v-if="hasMoreHelpers">
              <el-button @click="loadMoreHelpers" :loading="loadingHelpers">
                加载更多
              </el-button>
            </div>
          </div>
        </el-tab-pane>

        <!-- 分享设置 -->
        <el-tab-pane label="分享设置" name="share">
          <div class="share-settings">
            <el-form label-width="120px">
              <el-form-item label="分享标题">
                <el-input
                  v-model="shareSettings.title"
                  placeholder="请输入分享标题"
                  maxlength="100"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="分享描述">
                <el-input
                  v-model="shareSettings.description"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入分享描述"
                  maxlength="200"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="分享图片">
                <div class="share-image-upload">
                  <el-upload
                    class="upload-demo"
                    action="#"
                    :show-file-list="false"
                    :before-upload="handleImageUpload"
                  >
                    <el-button size="small" type="primary">选择图片</el-button>
                  </el-upload>
                  <div class="image-preview" v-if="shareSettings.imageUrl">
                    <img :src="shareSettings.imageUrl" alt="分享图片" />
                  </div>
                </div>
              </el-form-item>

              <el-form-item label="分享链接">
                <div class="share-link">
                  <el-input
                    v-model="shareLink"
                    readonly
                    placeholder="生成分享链接后显示"
                  >
                    <template #append>
                      <el-button @click="copyShareLink">
                        <el-icon><CopyDocument /></el-icon>
                      </el-button>
                    </template>
                  </el-input>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 设置管理 -->
        <el-tab-pane label="设置管理" name="settings" v-if="isOwner">
          <div class="settings-management">
            <el-form :model="collectSettings" :rules="collectRules" ref="collectFormRef" label-width="120px">
              <el-form-item label="目标人数" prop="targetCount">
                <el-input-number
                  v-model="collectSettings.targetCount"
                  :min="1"
                  :max="1000"
                  placeholder="积攒目标人数"
                />
              </el-form-item>

              <el-form-item label="奖励类型" prop="rewardType">
                <el-select v-model="collectSettings.rewardType" placeholder="选择奖励类型">
                  <el-option label="折扣优惠" value="discount" />
                  <el-option label="赠送礼品" value="gift" />
                  <el-option label="免费参与" value="free" />
                  <el-option label="积分奖励" value="points" />
                </el-select>
              </el-form-item>

              <el-form-item label="奖励内容" prop="rewardValue">
                <el-input
                  v-model="collectSettings.rewardValue"
                  placeholder="输入奖励具体内容"
                />
              </el-form-item>

              <el-form-item label="截止时间" prop="deadline">
                <el-date-picker
                  v-model="collectSettings.deadline"
                  type="datetime"
                  placeholder="选择截止时间"
                  style="width: 100%"
                />
              </el-form-item>
            </el-form>

            <div class="settings-actions">
              <el-button @click="resetSettings">重置</el-button>
              <el-button type="primary" @click="saveSettings" :loading="saving">
                保存设置
              </el-button>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 底部操作 -->
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="primary" @click="handleHelp" v-if="collectActivity && !hasHelped">
          立即助力
        </el-button>
        <el-button type="success" @click="shareActivity">
          分享活动
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CopyDocument } from '@element-plus/icons-vue'
import { request } from '@/utils/request'
import QRCode from 'qrcode'

interface Props {
  visible: boolean
  activity: any
  collectActivity?: any
  isOwner?: boolean
  hasHelped?: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success', data: any): void
}

const props = withDefaults(defineProps<Props>(), {
  isOwner: false,
  hasHelped: false
})

const emit = defineEmits<Emits>()

// 响应式数据
const loadingHelpers = ref(false)
const activeTab = ref('basic')
const helperRecords = ref([])
const hasMoreHelpers = ref(true)
const saving = ref(false)
const showQRCode = ref(false)
const qrcodeRef = ref()

const collectFormRef = ref()

const collectSettings = ref({
  targetCount: 0,
  rewardType: 'discount',
  rewardValue: '',
  deadline: ''
})

const collectRules = {
  targetCount: [
    { required: true, message: '请输入目标人数', trigger: 'blur' },
    { type: 'number', min: 1, max: 1000, message: '目标人数必须在1-1000人之间', trigger: 'blur' }
  ],
  rewardType: [
    { required: true, message: '请选择奖励类型', trigger: 'change' }
  ],
  rewardValue: [
    { required: true, message: '请输入奖励内容', trigger: 'blur' }
  ],
  deadline: [
    { required: true, message: '请选择截止时间', trigger: 'change' }
  ]
}

const shareSettings = ref({
  title: '',
  description: '',
  imageUrl: ''
})

// 计算属性
const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const dialogTitle = computed(() => {
  if (props.isOwner) return '积攒活动管理'
  return '积攒活动详情'
})

const progressPercentage = computed(() => {
  if (!props.collectActivity) return 0
  return Math.min((props.collectActivity.currentCount / props.collectActivity.targetCount) * 100, 100)
})

const progressColor = computed(() => {
  if (progressPercentage.value >= 100) return '#67c23a'
  if (progressPercentage.value >= 50) return '#e6a23c'
  return '#f56c6c'
})

const statusText = computed(() => {
  if (!props.collectActivity) return '未知'
  const statusMap = {
    'active': '进行中',
    'completed': '已完成',
    'expired': '已过期',
    'cancelled': '已取消'
  }
  return statusMap[props.collectActivity.status] || '未知'
})

const statusTagType = computed(() => {
  if (!props.collectActivity) return 'info'
  const typeMap = {
    'active': 'success',
    'completed': 'primary',
    'expired': 'warning',
    'cancelled': 'danger'
  }
  return typeMap[props.collectActivity.status] || 'info'
})

const rewardTypeText = computed(() => {
  if (!props.collectActivity) return 'N/A'
  const typeMap = {
    'discount': '折扣优惠',
    'gift': '赠送礼品',
    'free': '免费参与',
    'points': '积分奖励'
  }
  return typeMap[props.collectActivity.rewardType] || 'N/A'
})

const shareLink = computed(() => {
  if (!props.collectActivity) return ''
  return `${window.location.origin}/activity/${props.collectActivity.activityId}/collect?code=${props.collectActivity.collectCode}`
})

// 方法
const handleClose = () => {
  visible.value = false
  resetData()
}

const resetData = () => {
  activeTab.value = 'basic'
  helperRecords.value = []
  hasMoreHelpers.value = true
  showQRCode.value = false
}

const copyCollectCode = async () => {
  if (!props.collectActivity?.collectCode) return

  try {
    await navigator.clipboard.writeText(props.collectActivity.collectCode)
    ElMessage.success('积攒码已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败，请手动复制')
  }
}

const copyShareLink = async () => {
  try {
    await navigator.clipboard.writeText(shareLink.value)
    ElMessage.success('分享链接已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败，请手动复制')
  }
}

const generateQRCode = () => {
  if (!props.collectActivity?.collectCode) return

  try {
    const canvas = document.createElement('canvas')
    QRCode.toCanvas(canvas, shareLink.value, {
      width: 200,
      height: 200,
      margin: 2
    })

    if (qrcodeRef.value) {
      qrcodeRef.value.innerHTML = ''
      qrcodeRef.value.appendChild(canvas)
    }
  } catch (error) {
    console.error('生成二维码失败:', error)
  }
}

const loadHelperRecords = async () => {
  if (!props.collectActivity) return

  loadingHelpers.value = true
  try {
    // 这里应该调用实际的API
    const mockData = [
      {
        helperName: '张三',
        helpTime: new Date(Date.now() - 3600000),
        ip: '192.168.1.1'
      },
      {
        helperName: '李四',
        helpTime: new Date(Date.now() - 7200000),
        ip: '192.168.1.2'
      }
    ]

    helperRecords.value = mockData
    hasMoreHelpers.value = mockData.length >= 10
  } catch (error) {
    console.error('Failed to load helper records:', error)
    ElMessage.error('加载助力记录失败')
  } finally {
    loadingHelpers.value = false
  }
}

const loadMoreHelpers = async () => {
  // 这里应该调用实际的API加载更多记录
  ElMessage.info('已加载所有记录')
  hasMoreHelpers.value = false
}

const viewHelperDetail = (helper: any) => {
  ElMessageBox.alert(`
    <div>
      <p><strong>助力者：</strong>${helper.helperName}</p>
      <p><strong>助力时间：</strong>${formatTime(helper.helpTime)}</p>
      <p><strong>IP地址：</strong>${helper.ip}</p>
      <p><strong>用户代理：</strong>${helper.userAgent || 'N/A'}</p>
    </div>
  `, '助力者详情')
}

const handleImageUpload = (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    shareSettings.value.imageUrl = e.target?.result as string
  }
  reader.readAsDataURL(file)
  return false
}

const resetSettings = () => {
  if (props.collectActivity) {
    collectSettings.value = {
      targetCount: props.collectActivity.targetCount,
      rewardType: props.collectActivity.rewardType,
      rewardValue: props.collectActivity.rewardValue,
      deadline: props.collectActivity.deadline
    }
  }
  collectFormRef.value?.resetFields()
}

const saveSettings = async () => {
  if (!collectFormRef.value) return

  try {
    await collectFormRef.value.validate()

    saving.value = true
    // 这里应该调用实际的API保存设置
    console.log('Saving collect settings:', collectSettings.value)

    await new Promise(resolve => setTimeout(resolve, 1000))

    ElMessage.success('设置保存成功')
  } catch (error: any) {
    console.error('Failed to save settings:', error)
    ElMessage.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

const handleHelp = async () => {
  if (!props.collectActivity) return

  try {
    // 这里应该调用实际的API
    await new Promise(resolve => setTimeout(resolve, 1000))

    ElMessage.success('助力成功！')
    emit('success', { action: 'help' })
  } catch (error) {
    console.error('Failed to help:', error)
    ElMessage.error('助力失败，请重试')
  }
}

const shareActivity = async () => {
  if (!props.collectActivity) return

  try {
    // 生成分享链接
    const link = shareLink.value

    if (navigator.share) {
      // 使用原生分享API
      await navigator.share({
        title: shareSettings.value.title || props.activity.title,
        text: shareSettings.value.description || '快来帮我积攒助力吧！',
        url: link
      })
    } else {
      // 复制链接到剪贴板
      await copyShareLink()
    }
  } catch (error) {
    console.error('分享失败:', error)
  }
}

const formatTime = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleString('zh-CN')
}

const formatDeadline = (deadline: string | Date): string => {
  if (!deadline) return '无限制'
  return formatTime(deadline)
}

// 监听器
watch(() => props.visible, (newVal) => {
  if (newVal && props.collectActivity) {
    loadHelperRecords()
    resetSettings()

    // 生成默认分享设置
    shareSettings.value = {
      title: `请帮我助力！${props.activity.title}`,
      description: `我正在参加${props.activity.title}活动，需要${props.collectActivity.targetCount}人积攒才能获得奖励，快来帮我助力吧！`,
      imageUrl: ''
    }
  }
})

watch(() => activeTab.value, (newTab) => {
  if (newTab === 'share' && !shareSettings.value.imageUrl) {
    // 切换到分享tab时生成二维码
    setTimeout(() => {
      showQRCode.value = true
      generateQRCode()
    }, 100)
  }
})
</script>

<style lang="scss" scoped>
.activity-info {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: var(--spacing-lg);
  margin-bottom: 20px;
  color: white;

  .activity-header {
    h3 {
      margin: 0 0 12px 0;
      font-size: var(--text-lg);
      font-weight: 600;
    }

    .activity-meta {
      .collect-info {
        .progress-container {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);

          .progress-info {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);

            .current {
              font-size: var(--text-2xl);
              font-weight: 700;
            }

            .separator {
              font-size: var(--text-base);
              opacity: 0.8;
            }

            .target {
              font-size: var(--text-base);
              opacity: 0.8;
            }

            .unit {
              font-size: var(--text-sm);
              opacity: 0.8;
            }
          }

          .progress-bar {
            flex: 1;
            max-width: 200px;
          }

          .progress-text {
            font-size: var(--text-lg);
            font-weight: 600;
          }
        }
      }
    }
  }
}

.collect-code {
  margin-top: 16px;
  padding: var(--spacing-md);
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;

  .code-container {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);

    .code-label {
      font-weight: 600;
    }

    .code-value {
      flex: 1;
      font-size: var(--text-base);
      font-weight: 700;
      letter-spacing: 1px;
    }
  }

  .code-qrcode {
    margin-top: 16px;
    display: flex;
    justify-content: center;

    canvas {
      border-radius: 8px;
      background: white;
      padding: var(--spacing-sm);
    }
  }
}

.collect-details {
  margin-top: 20px;
}

.helper-list {
  .load-more {
    margin-top: 16px;
    text-align: center;
  }
}

.share-settings {
  .share-image-upload {
    .upload-demo {
      margin-bottom: 12px;
    }

    .image-preview {
      img {
        max-width: 200px;
        max-height: 150px;
        border-radius: 8px;
      }
    }
  }

  .share-link {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }
}

.settings-management {
  .settings-actions {
    margin-top: 24px;
    text-align: right;
    gap: var(--spacing-md);
    display: flex;
    justify-content: flex-end;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
}
</style>