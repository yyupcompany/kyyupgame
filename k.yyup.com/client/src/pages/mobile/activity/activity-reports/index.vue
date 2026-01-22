<template>
  <MobileCenterLayout title="活动报告" back-path="/mobile/activity/activity-index">
    <div class="activity-reports-mobile">
      <!-- 操作按钮 -->
      <div class="action-bar">
        <van-button type="primary" size="small" icon="plus" @click="handleCreate">生成报告</van-button>
      </div>

      <!-- 筛选 -->
      <van-dropdown-menu>
        <van-dropdown-item v-model="filterType" :options="typeOptions" @change="onFilter" />
        <van-dropdown-item v-model="filterStatus" :options="statusOptions" @change="onFilter" />
      </van-dropdown-menu>

      <!-- 报告列表 -->
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
          <div class="report-list">
            <div v-for="item in reportList" :key="item.id" class="report-card" @click="viewReport(item)">
              <div class="card-icon">
                <van-icon name="description" size="32" :color="getTypeColor(item.type)" />
              </div>
              <div class="card-content">
                <div class="card-title">{{ item.title }}</div>
                <div class="card-info">
                  <van-tag size="medium" :type="getTypeTagType(item.type)">{{ getTypeLabel(item.type) }}</van-tag>
                  <span class="date">{{ formatDate(item.createdAt) }}</span>
                </div>
                <div class="card-meta">
                  <span v-if="item.activityTitle">活动: {{ item.activityTitle }}</span>
                  <span v-else>全部活动</span>
                </div>
              </div>
              <div class="card-actions" @click.stop>
                <van-button size="mini" icon="down" @click="downloadReport(item)" />
                <van-button size="mini" icon="share-o" @click="shareReport(item)" />
              </div>
            </div>
          </div>
          <van-empty v-if="reportList.length === 0 && !loading" description="暂无报告" />
        </van-list>
      </van-pull-refresh>
    </div>

    <!-- 生成报告弹窗 -->
    <van-popup v-model:show="showCreate" position="bottom" round :style="{ height: '60%' }" closeable>
      <div class="create-popup">
        <div class="popup-title">生成报告</div>
        <van-form @submit="onCreateSubmit">
          <van-cell-group inset>
            <van-field v-model="createForm.title" label="报告标题" placeholder="请输入报告标题" required :rules="[{ required: true }]" />
            <van-field v-model="createForm.typeName" is-link readonly label="报告类型" placeholder="请选择" required @click="showTypePicker = true" />
            <van-field v-model="createForm.activityName" is-link readonly label="活动范围" placeholder="全部活动" @click="showActivityPicker = true" />
            <van-field v-model="createForm.dateRange" is-link readonly label="时间范围" placeholder="请选择" @click="showDatePicker = true" />
          </van-cell-group>
          <div class="create-actions">
            <van-button type="primary" block native-type="submit" :loading="creating">生成报告</van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <van-popup v-model:show="showTypePicker" position="bottom" round>
      <van-picker title="选择报告类型" :columns="reportTypeOptions" @confirm="onTypeConfirm" @cancel="showTypePicker = false" />
    </van-popup>

    <van-popup v-model:show="showActivityPicker" position="bottom" round>
      <van-picker title="选择活动" :columns="activityPickerOptions" @confirm="onActivityConfirm" @cancel="showActivityPicker = false" />
    </van-popup>
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { showToast, showSuccessToast, showFailToast } from 'vant'
import type { TagType } from 'vant'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'

const filterType = ref('')
const filterStatus = ref('')
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

const typeOptions = [
  { text: '全部类型', value: '' },
  { text: '活动总结', value: 'summary' },
  { text: '数据分析', value: 'analytics' },
  { text: '参与度报告', value: 'participation' }
]

const statusOptions = [
  { text: '全部状态', value: '' },
  { text: '已生成', value: 'completed' },
  { text: '生成中', value: 'generating' }
]

const reportTypeOptions = [
  { text: '活动总结', value: 'summary' },
  { text: '数据分析', value: 'analytics' },
  { text: '参与度报告', value: 'participation' }
]

const activityPickerOptions = [
  { text: '全部活动', value: '' },
  { text: '开放日活动', value: '1' },
  { text: '家长会', value: '2' }
]

interface Report {
  id: number
  title: string
  type: string
  activityId?: number
  activityTitle?: string
  createdAt: string
  status: string
}

const reportList = ref<Report[]>([])

const getTypeColor = (type: string) => {
  const map: Record<string, string> = { summary: '#1989fa', analytics: '#07c160', participation: '#ff9800' }
  return map[type] || '#969799'
}

const getTypeTagType = (type: string): TagType => {
  const map: Record<string, TagType> = { summary: 'primary', analytics: 'success', participation: 'warning' }
  return map[type] || 'default'
}

const getTypeLabel = (type: string) => {
  const map: Record<string, string> = { summary: '总结', analytics: '分析', participation: '参与度' }
  return map[type] || '其他'
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const loadData = async () => {
  const mockData: Report[] = [
    { id: 1, title: '1月活动总结报告', type: 'summary', createdAt: '2025-01-06 10:00:00', status: 'completed' },
    { id: 2, title: '开放日活动分析', type: 'analytics', activityId: 1, activityTitle: '开放日活动', createdAt: '2025-01-05 14:30:00', status: 'completed' },
    { id: 3, title: '参与度报告', type: 'participation', createdAt: '2025-01-04 09:00:00', status: 'completed' }
  ]
  return mockData
}

const onLoad = async () => {
  loading.value = true
  const data = await loadData()
  reportList.value = data
  loading.value = false
  finished.value = true
}

const onRefresh = async () => {
  finished.value = false
  await onLoad()
  refreshing.value = false
}

const onFilter = () => { onRefresh() }

const viewReport = (item: Report) => {
  showToast('查看报告: ' + item.title)
}

const downloadReport = (item: Report) => {
  showToast('下载报告: ' + item.title)
}

const shareReport = async (item: Report) => {
  const shareUrl = `${window.location.origin}/report/${item.id}`
  const shareText = `查看「${item.title}」活动报告`
  
  // 尝试使用浏览器原生分享API
  if (navigator.share) {
    try {
      await navigator.share({
        title: item.title,
        text: shareText,
        url: shareUrl
      })
      showSuccessToast('分享成功')
    } catch (error) {
      await copyToClipboard(shareUrl)
    }
  } else {
    await copyToClipboard(shareUrl)
  }
}

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

// 创建报告
const showCreate = ref(false)
const showTypePicker = ref(false)
const showActivityPicker = ref(false)
const showDatePicker = ref(false)
const creating = ref(false)

const createForm = reactive({
  title: '',
  type: '',
  typeName: '',
  activityId: '',
  activityName: '',
  dateRange: ''
})

const handleCreate = () => {
  createForm.title = ''
  createForm.type = ''
  createForm.typeName = ''
  createForm.activityId = ''
  createForm.activityName = ''
  createForm.dateRange = ''
  showCreate.value = true
}

const onTypeConfirm = ({ selectedOptions }: any) => {
  showTypePicker.value = false
  if (selectedOptions[0]) {
    createForm.type = selectedOptions[0].value
    createForm.typeName = selectedOptions[0].text
  }
}

const onActivityConfirm = ({ selectedOptions }: any) => {
  showActivityPicker.value = false
  if (selectedOptions[0]) {
    createForm.activityId = selectedOptions[0].value
    createForm.activityName = selectedOptions[0].text
  }
}

const onCreateSubmit = async () => {
  if (!createForm.title || !createForm.type) {
    showToast('请填写完整信息')
    return
  }
  creating.value = true
  await new Promise(r => setTimeout(r, 1500))
  creating.value = false
  showCreate.value = false
  showSuccessToast('报告生成成功')
  onRefresh()
}

onMounted(() => { onLoad() })
</script>

<style scoped lang="scss">
.activity-reports-mobile {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 20px;
}

.action-bar {
  padding: 12px 16px;
  background: #fff;
}

.report-list {
  padding: 12px;
}

.report-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;

  .card-icon {
    width: 48px;
    height: 48px;
    background: #f7f8fa;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .card-content {
    flex: 1;
    min-width: 0;

    .card-title {
      font-size: 15px;
      font-weight: 500;
      color: #323233;
      margin-bottom: 4px;
    }

    .card-info {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
      .date { font-size: 12px; color: #969799; }
    }

    .card-meta {
      font-size: 12px;
      color: #969799;
    }
  }

  .card-actions {
    display: flex;
    gap: 4px;
  }
}

.create-popup {
  padding: 16px;
  .popup-title { font-size: 18px; font-weight: 500; text-align: center; margin-bottom: 16px; }
  .create-actions { padding: 16px 0; }
}
</style>
