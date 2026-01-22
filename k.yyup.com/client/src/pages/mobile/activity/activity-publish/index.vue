<template>
  <MobileCenterLayout title="发布活动" back-path="/mobile/activity/activity-index">
    <div class="activity-publish-mobile">
      <!-- 活动预览卡片 -->
      <div class="preview-card">
        <div class="preview-header">
          <h3>{{ activity.name }}</h3>
          <van-tag type="warning">待发布</van-tag>
        </div>
        <div class="preview-info">
          <div class="info-row">
            <van-icon name="clock-o" />
            <span>{{ formatDateRange(activity.startDate, activity.endDate) }}</span>
          </div>
          <div class="info-row">
            <van-icon name="location-o" />
            <span>{{ activity.location || '待定' }}</span>
          </div>
        </div>
      </div>

      <!-- 发布设置 -->
      <van-cell-group inset title="发布设置">
        <van-cell center title="立即发布">
          <template #right-icon>
            <van-switch v-model="publishSettings.publishNow" size="20" />
          </template>
        </van-cell>

        <van-field
          v-if="!publishSettings.publishNow"
          v-model="publishSettings.scheduledTimeDisplay"
          is-link
          readonly
          label="定时发布"
          placeholder="选择发布时间"
          @click="showDatePicker = true"
        />
      </van-cell-group>

      <!-- 发布渠道 -->
      <van-cell-group inset title="发布渠道">
        <van-checkbox-group v-model="publishSettings.channels">
          <van-cell
            v-for="channel in channelOptions"
            :key="channel.value"
            clickable
            @click="toggleChannel(channel.value)"
          >
            <template #icon>
              <van-icon :name="channel.icon" size="24" :color="channel.color" style="margin-right: 12px" />
            </template>
            <template #title>
              <div class="channel-info">
                <span class="channel-name">{{ channel.label }}</span>
                <span class="channel-desc">{{ channel.desc }}</span>
              </div>
            </template>
            <template #right-icon>
              <van-checkbox :name="channel.value" />
            </template>
          </van-cell>
        </van-checkbox-group>
      </van-cell-group>

      <!-- 分享设置 -->
      <van-cell-group inset title="分享设置">
        <van-cell center title="允许转发分享">
          <template #right-icon>
            <van-switch v-model="publishSettings.allowShare" size="20" />
          </template>
        </van-cell>

        <van-cell center title="显示报名人数">
          <template #right-icon>
            <van-switch v-model="publishSettings.showRegistrationCount" size="20" />
          </template>
        </van-cell>

        <van-cell center title="报名后发送短信通知">
          <template #right-icon>
            <van-switch v-model="publishSettings.sendSms" size="20" />
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 报名页面预览 -->
      <div class="page-preview-section">
        <h3 class="section-title">报名页面预览</h3>
        <div class="page-preview">
          <div class="phone-frame">
            <div class="phone-screen">
              <div class="preview-content">
                <div class="preview-banner"></div>
                <div class="preview-title">{{ activity.name }}</div>
                <div class="preview-meta">
                  <span>📅 {{ activity.startDate }}</span>
                  <span>📍 {{ activity.location }}</span>
                </div>
                <div class="preview-btn">立即报名</div>
              </div>
            </div>
          </div>
        </div>
        <van-button plain type="primary" size="small" block @click="previewPage">
          查看完整预览
        </van-button>
      </div>

      <!-- 分享链接 -->
      <van-cell-group inset title="分享链接">
        <van-field
          v-model="shareLink"
          readonly
          label="报名链接"
          center
        >
          <template #button>
            <van-button size="small" type="primary" @click="copyLink">复制</van-button>
          </template>
        </van-field>
        <van-cell center title="生成分享海报" is-link @click="generatePoster" />
        <van-cell center title="生成报名二维码" is-link @click="generateQRCode" />
      </van-cell-group>

      <!-- 底部操作 -->
      <div class="submit-section">
        <van-button plain type="default" @click="saveDraft">
          保存草稿
        </van-button>
        <van-button type="primary" @click="handlePublish">
          {{ publishSettings.publishNow ? '立即发布' : '定时发布' }}
        </van-button>
      </div>

      <!-- 时间选择器 -->
      <van-popup v-model:show="showDatePicker" position="bottom" round>
        <van-date-picker
          v-model="publishSettings.scheduledTimeParts"
          title="选择发布时间"
          :min-date="minDate"
          @confirm="onDateConfirm"
          @cancel="showDatePicker = false"
        />
      </van-popup>
    </div>
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showLoadingToast, closeToast, showSuccessToast, showConfirmDialog } from 'vant'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'

const router = useRouter()
const route = useRoute()

// 活动信息
const activity = reactive({
  id: route.query.id || '1',
  name: '春季亲子运动会',
  startDate: '2025-03-15',
  endDate: '2025-03-15',
  location: '学校运动场'
})

// 发布设置
const publishSettings = reactive({
  publishNow: true,
  scheduledTime: '',
  scheduledTimeDisplay: '',
  scheduledTimeParts: [] as string[],
  channels: ['wechat', 'website'] as string[],
  allowShare: true,
  showRegistrationCount: true,
  sendSms: false
})

const showDatePicker = ref(false)
const minDate = new Date()
const shareLink = ref('https://k.yyup.cc/activity/register?id=1')

// 发布渠道选项
const channelOptions = [
  { value: 'wechat', label: '微信公众号', desc: '推送到关注用户', icon: 'chat-o', color: '#07c160' },
  { value: 'website', label: '学校官网', desc: '展示在活动列表', icon: 'wap-home-o', color: '#1989fa' },
  { value: 'sms', label: '短信通知', desc: '发送给家长', icon: 'comment-o', color: '#ff976a' },
  { value: 'poster', label: '活动海报', desc: '生成分享图片', icon: 'photo-o', color: '#ee0a24' }
]

const formatDateRange = (start: string, end: string) => {
  if (!start) return '待定'
  const startStr = new Date(start).toLocaleDateString('zh-CN')
  if (!end || start === end) return startStr
  const endStr = new Date(end).toLocaleDateString('zh-CN')
  return `${startStr} ~ ${endStr}`
}

const toggleChannel = (value: string) => {
  const index = publishSettings.channels.indexOf(value)
  if (index > -1) {
    publishSettings.channels.splice(index, 1)
  } else {
    publishSettings.channels.push(value)
  }
}

const onDateConfirm = ({ selectedValues }: any) => {
  publishSettings.scheduledTimeParts = selectedValues
  publishSettings.scheduledTime = selectedValues.join('-')
  publishSettings.scheduledTimeDisplay = publishSettings.scheduledTime
  showDatePicker.value = false
}

const previewPage = () => {
  // 打开活动预览页面
  if (activity.id) {
    router.push(`/mobile/activity/activity-detail/${activity.id}?preview=true`)
  } else {
    showToast('请先保存活动信息')
  }
}

const copyLink = () => {
  navigator.clipboard?.writeText(shareLink.value)
  showSuccessToast('已复制链接')
}

const generatePoster = () => {
  showToast('海报生成中...')
}

const generateQRCode = () => {
  showToast('二维码生成中...')
}

const saveDraft = async () => {
  showLoadingToast({ message: '保存中...', forbidClick: true })
  await new Promise(resolve => setTimeout(resolve, 1000))
  closeToast()
  showSuccessToast('已保存')
}

const handlePublish = async () => {
  if (publishSettings.channels.length === 0) {
    showToast('请至少选择一个发布渠道')
    return
  }

  try {
    await showConfirmDialog({
      title: '确认发布',
      message: publishSettings.publishNow
        ? '确定立即发布该活动？'
        : `确定在 ${publishSettings.scheduledTimeDisplay} 发布该活动？`
    })
    
    showLoadingToast({ message: '发布中...', forbidClick: true })
    await new Promise(resolve => setTimeout(resolve, 1500))
    closeToast()
    showSuccessToast('发布成功')
    setTimeout(() => {
      router.push('/mobile/activity/activity-index')
    }, 1000)
  } catch {
    // 用户取消
  }
}

onMounted(() => {
  // 加载活动数据
})
</script>

<style scoped lang="scss">
.activity-publish-mobile {
  min-height: 100vh;
  background: #f7f8fa;
  padding: 12px 0 100px 0;

  .preview-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    margin: 0 12px 12px;
    padding: 16px;
    border-radius: 12px;
    color: #fff;

    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }
    }

    .preview-info {
      .info-row {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        margin-bottom: 6px;
        opacity: 0.9;
      }
    }
  }

  .van-cell-group {
    margin-bottom: 12px;
  }

  .channel-info {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .channel-name {
      font-size: 14px;
      color: #333;
    }

    .channel-desc {
      font-size: 12px;
      color: #999;
    }
  }

  .section-title {
    font-size: 14px;
    font-weight: 500;
    color: #969799;
    padding: 0 16px;
    margin-bottom: 12px;
  }

  .page-preview-section {
    padding: 12px;
    background: #fff;
    margin-bottom: 12px;

    .page-preview {
      display: flex;
      justify-content: center;
      margin-bottom: 12px;

      .phone-frame {
        width: 160px;
        height: 280px;
        background: #333;
        border-radius: 24px;
        padding: 8px;

        .phone-screen {
          width: 100%;
          height: 100%;
          background: #fff;
          border-radius: 16px;
          overflow: hidden;

          .preview-content {
            padding: 8px;

            .preview-banner {
              height: 60px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 8px;
              margin-bottom: 8px;
            }

            .preview-title {
              font-size: 12px;
              font-weight: 600;
              color: #333;
              margin-bottom: 4px;
            }

            .preview-meta {
              font-size: 9px;
              color: #999;
              margin-bottom: 8px;

              span {
                display: block;
                margin-bottom: 2px;
              }
            }

            .preview-btn {
              background: #1989fa;
              color: #fff;
              text-align: center;
              padding: 6px;
              border-radius: 4px;
              font-size: 10px;
            }
          }
        }
      }
    }
  }

  .submit-section {
    position: fixed;
    bottom: 60px;
    left: 0;
    right: 0;
    padding: 12px 16px;
    background: #fff;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    gap: 12px;

    .van-button {
      flex: 1;
    }
  }
}
</style>
