<template>
  <MobileCenterLayout title="活动证书" back-path="/mobile/activity/activity-index">
    <div class="activity-certificate-mobile">
      <!-- 筛选 -->
      <van-dropdown-menu>
        <van-dropdown-item v-model="filterActivity" :options="activityOptions" @change="onFilter" />
        <van-dropdown-item v-model="filterStatus" :options="statusOptions" @change="onFilter" />
      </van-dropdown-menu>

      <!-- 证书列表 -->
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
          <div class="certificate-list">
            <div v-for="item in certificateList" :key="item.id" class="certificate-card" @click="viewCertificate(item)">
              <div class="certificate-preview">
                <van-image :src="item.previewUrl || 'https://via.placeholder.com/120x80'" width="120" height="80" fit="cover" radius="4" />
                <van-tag :type="getStatusTagType(item.status)" class="status-tag">{{ getStatusLabel(item.status) }}</van-tag>
              </div>
              <div class="certificate-info">
                <div class="certificate-title">{{ item.activityTitle }}</div>
                <div class="certificate-meta">
                  <van-icon name="user-o" />
                  <span>{{ item.participantName }}</span>
                </div>
                <div class="certificate-meta">
                  <van-icon name="clock-o" />
                  <span>{{ formatDate(item.createdAt) }}</span>
                </div>
              </div>
              <div class="certificate-actions" @click.stop>
                <van-button size="mini" icon="down" @click="downloadCertificate(item)" v-if="item.status === 'generated'" />
                <van-button size="mini" icon="share-o" @click="shareCertificate(item)" v-if="item.status === 'generated'" />
              </div>
            </div>
          </div>
          <van-empty v-if="certificateList.length === 0 && !loading" description="暂无证书" />
        </van-list>
      </van-pull-refresh>

      <!-- 生成证书按钮 -->
      <div class="generate-bar">
        <van-button type="primary" block icon="add-o" @click="handleGenerate">生成证书</van-button>
      </div>
    </div>

    <!-- 证书预览 -->
    <van-popup v-model:show="showPreview" position="center" :style="{ width: '90%', borderRadius: '8px' }" closeable>
      <div class="preview-popup" v-if="currentCertificate">
        <div class="popup-title">证书预览</div>
        <van-image :src="currentCertificate.previewUrl || 'https://via.placeholder.com/300x200'" width="100%" fit="contain" />
        <div class="certificate-detail">
          <p><strong>活动:</strong> {{ currentCertificate.activityTitle }}</p>
          <p><strong>参与者:</strong> {{ currentCertificate.participantName }}</p>
          <p><strong>生成时间:</strong> {{ formatDate(currentCertificate.createdAt) }}</p>
        </div>
        <div class="preview-actions">
          <van-button type="primary" block @click="downloadCertificate(currentCertificate)">下载证书</van-button>
          <van-button plain block @click="shareCertificate(currentCertificate)">分享证书</van-button>
        </div>
      </div>
    </van-popup>

    <!-- 生成证书弹窗 -->
    <van-popup v-model:show="showGenerate" position="bottom" round :style="{ height: '60%' }" closeable>
      <div class="generate-popup">
        <div class="popup-title">生成证书</div>
        <van-form @submit="onGenerateSubmit">
          <van-cell-group inset>
            <van-field v-model="generateForm.activityName" is-link readonly label="选择活动" placeholder="请选择" required @click="showActivityPicker = true" />
            <van-field v-model="generateForm.participantName" is-link readonly label="参与者" placeholder="请选择" required @click="showParticipantPicker = true" />
            <van-field v-model="generateForm.templateName" is-link readonly label="证书模板" placeholder="请选择" required @click="showTemplatePicker = true" />
          </van-cell-group>
          <div class="generate-actions">
            <van-button type="primary" block native-type="submit" :loading="generating">生成证书</van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <van-popup v-model:show="showActivityPicker" position="bottom" round>
      <van-picker title="选择活动" :columns="activityPickerOptions" @confirm="onActivityConfirm" @cancel="showActivityPicker = false" />
    </van-popup>

    <van-popup v-model:show="showParticipantPicker" position="bottom" round>
      <van-picker title="选择参与者" :columns="participantPickerOptions" @confirm="onParticipantConfirm" @cancel="showParticipantPicker = false" />
    </van-popup>

    <van-popup v-model:show="showTemplatePicker" position="bottom" round>
      <van-picker title="选择模板" :columns="templatePickerOptions" @confirm="onTemplateConfirm" @cancel="showTemplatePicker = false" />
    </van-popup>
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { showToast, showSuccessToast, showLoadingToast, closeToast, showFailToast } from 'vant'
import type { TagType } from 'vant'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'

const filterActivity = ref('')
const filterStatus = ref('')
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

const activityOptions = [
  { text: '全部活动', value: '' },
  { text: '开放日活动', value: '1' },
  { text: '亲子运动会', value: '2' }
]

const statusOptions = [
  { text: '全部状态', value: '' },
  { text: '已生成', value: 'generated' },
  { text: '生成中', value: 'generating' }
]

interface Certificate {
  id: number
  activityId: number
  activityTitle: string
  participantName: string
  previewUrl?: string
  status: string
  createdAt: string
}

const certificateList = ref<Certificate[]>([])
const showPreview = ref(false)
const currentCertificate = ref<Certificate | null>(null)

const getStatusTagType = (status: string): TagType => {
  return status === 'generated' ? 'success' : 'warning'
}

const getStatusLabel = (status: string) => {
  return status === 'generated' ? '已生成' : '生成中'
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const loadData = async () => {
  return [
    { id: 1, activityId: 1, activityTitle: '开放日活动', participantName: '小明', previewUrl: 'https://via.placeholder.com/300x200/1989fa', status: 'generated', createdAt: '2025-01-05' },
    { id: 2, activityId: 1, activityTitle: '开放日活动', participantName: '小红', previewUrl: 'https://via.placeholder.com/300x200/07c160', status: 'generated', createdAt: '2025-01-05' },
    { id: 3, activityId: 2, activityTitle: '亲子运动会', participantName: '小刚', status: 'generating', createdAt: '2025-01-06' }
  ]
}

const onLoad = async () => {
  loading.value = true
  certificateList.value = await loadData()
  loading.value = false
  finished.value = true
}

const onRefresh = async () => {
  finished.value = false
  await onLoad()
  refreshing.value = false
}

const onFilter = () => { onRefresh() }

const viewCertificate = (item: Certificate) => {
  currentCertificate.value = item
  showPreview.value = true
}

const downloadCertificate = (item: Certificate) => {
  showToast('下载中...')
  setTimeout(() => showSuccessToast('下载成功'), 1000)
}

const shareCertificate = async (item: Certificate) => {
  const shareUrl = `${window.location.origin}/certificate/${item.id}`
  const shareText = `恭喜${item.participantName}获得“${item.activityTitle}”证书！`
  
  // 尝试使用浏览器原生分享API
  if (navigator.share) {
    try {
      await navigator.share({
        title: `${item.participantName}的证书`,
        text: shareText,
        url: shareUrl
      })
      showSuccessToast('分享成功')
    } catch (error) {
      // 用户取消分享或分享失败，复制链接
      await copyToClipboard(shareUrl)
    }
  } else {
    // 浏览器不支持原生分享，复制链接
    await copyToClipboard(shareUrl)
  }
}

// 复制到剪贴板
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    showSuccessToast('链接已复制')
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    showSuccessToast('链接已复制')
  }
}

// 生成证书
const showGenerate = ref(false)
const showActivityPicker = ref(false)
const showParticipantPicker = ref(false)
const showTemplatePicker = ref(false)
const generating = ref(false)

const activityPickerOptions = [{ text: '开放日活动', value: 1 }, { text: '亲子运动会', value: 2 }]
const participantPickerOptions = [{ text: '小明', value: 1 }, { text: '小红', value: 2 }, { text: '小刚', value: 3 }]
const templatePickerOptions = [{ text: '标准证书', value: 1 }, { text: '精美证书', value: 2 }]

const generateForm = reactive({ activityId: 0, activityName: '', participantId: 0, participantName: '', templateId: 0, templateName: '' })

const handleGenerate = () => {
  generateForm.activityId = 0
  generateForm.activityName = ''
  generateForm.participantId = 0
  generateForm.participantName = ''
  generateForm.templateId = 0
  generateForm.templateName = ''
  showGenerate.value = true
}

const onActivityConfirm = ({ selectedOptions }: any) => {
  showActivityPicker.value = false
  if (selectedOptions[0]) { generateForm.activityId = selectedOptions[0].value; generateForm.activityName = selectedOptions[0].text }
}

const onParticipantConfirm = ({ selectedOptions }: any) => {
  showParticipantPicker.value = false
  if (selectedOptions[0]) { generateForm.participantId = selectedOptions[0].value; generateForm.participantName = selectedOptions[0].text }
}

const onTemplateConfirm = ({ selectedOptions }: any) => {
  showTemplatePicker.value = false
  if (selectedOptions[0]) { generateForm.templateId = selectedOptions[0].value; generateForm.templateName = selectedOptions[0].text }
}

const onGenerateSubmit = async () => {
  if (!generateForm.activityId || !generateForm.participantId || !generateForm.templateId) {
    showToast('请填写完整信息')
    return
  }
  generating.value = true
  await new Promise(r => setTimeout(r, 2000))
  generating.value = false
  showGenerate.value = false
  showSuccessToast('证书生成成功')
  onRefresh()
}

onMounted(() => { onLoad() })
</script>

<style scoped lang="scss">
.activity-certificate-mobile {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 70px;
}

.certificate-list {
  padding: 12px;
}

.certificate-card {
  display: flex;
  gap: 12px;
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;

  .certificate-preview {
    position: relative;
    flex-shrink: 0;
    .status-tag { position: absolute; top: 4px; left: 4px; }
  }

  .certificate-info {
    flex: 1;
    min-width: 0;
    .certificate-title { font-size: 15px; font-weight: 500; margin-bottom: 4px; }
    .certificate-meta { font-size: 12px; color: #969799; display: flex; align-items: center; gap: 4px; margin-top: 4px; }
  }

  .certificate-actions {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
}

.generate-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: #fff;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.06);
}

.preview-popup, .generate-popup {
  padding: 16px;
  .popup-title { font-size: 18px; font-weight: 500; text-align: center; margin-bottom: 16px; }
  .certificate-detail { padding: 12px 0; p { margin: 4px 0; font-size: 14px; color: #646566; } }
  .preview-actions, .generate-actions { padding: 16px 0; display: flex; flex-direction: column; gap: 8px; }
}
</style>
