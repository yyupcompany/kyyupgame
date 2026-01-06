<template>
  <el-dialog
    v-model="visible"
    title="分享拼团"
    width="500px"
    @close="handleClose"
  >
    <div class="share-modal">
      <div class="share-tip">
        <el-alert
          title="分享给好友，邀请更多人参团"
          type="info"
          :closable="false"
          show-icon
        />
      </div>

      <!-- 分享链接 -->
      <div class="share-section">
        <h4 class="section-title">分享链接</h4>
        <div class="link-box">
          <el-input
            v-model="shareUrl"
            readonly
            class="share-input"
          >
            <template #append>
              <el-button @click="handleCopyLink">
                <el-icon><DocumentCopy /></el-icon>
                复制
              </el-button>
            </template>
          </el-input>
        </div>
      </div>

      <!-- 二维码 -->
      <div class="share-section">
        <h4 class="section-title">扫码参团</h4>
        <div class="qrcode-box">
          <div v-if="qrcodeLoading" class="qrcode-loading">
            <el-icon class="is-loading"><Loading /></el-icon>
            <p>生成中...</p>
          </div>
          <img
            v-else
            :src="qrcodeUrl"
            alt="团购二维码"
            class="qrcode-image"
          />
          <el-button
            type="primary"
            size="small"
            @click="handleDownloadQrcode"
          >
            <el-icon><Download /></el-icon>
            下载二维码
          </el-button>
        </div>
      </div>

      <!-- 分享渠道 -->
      <div class="share-section">
        <h4 class="section-title">分享到</h4>
        <div class="share-channels">
          <div
            v-for="channel in channels"
            :key="channel.key"
            class="channel-item"
            @click="handleShareChannel(channel.key)"
          >
            <div class="channel-icon" :style="{ background: channel.color }">
              <el-icon :size="24">
                <component :is="channel.icon" />
              </el-icon>
            </div>
            <span class="channel-name">{{ channel.name }}</span>
          </div>
        </div>
      </div>

      <!-- 分享预览 -->
      <div v-if="groupBuy" class="share-preview">
        <h4 class="section-title">分享预览</h4>
        <div class="preview-card">
          <img
            v-if="groupBuy.activity?.coverImage"
            :src="groupBuy.activity.coverImage"
            alt="封面"
            class="preview-cover"
          />
          <div class="preview-content">
            <h3 class="preview-title">
              【拼团优惠】{{ groupBuy.activity?.title }}
            </h3>
            <p class="preview-desc">
              原价¥{{ groupBuy.originalPrice }}，{{ groupBuy.targetPeople }}人成团立享优惠！
              还差{{ groupBuy.targetPeople - groupBuy.currentPeople }}人即可成团
            </p>
            <div class="preview-price">
              <span class="current-price">¥{{ groupBuy.groupPrice }}</span>
              <span class="original-price">¥{{ groupBuy.originalPrice }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { DocumentCopy, Loading, Download, Share, ChatLineSquare, Link as LinkIcon } from '@element-plus/icons-vue'
import { request } from '@/utils/request'

interface Props {
  modelValue: boolean
  groupBuyId: number
  groupBuy?: any
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const visible = ref(props.modelValue)
const qrcodeLoading = ref(false)
const qrcodeUrl = ref('')

// 分享渠道
const channels = [
  {
    key: 'wechat',
    name: '微信',
    icon: ChatLineSquare,
    color: '#07c160'
  },
  {
    key: 'link',
    name: '复制链接',
    icon: LinkIcon,
    color: '#409eff'
  },
  {
    key: 'qrcode',
    name: '二维码',
    icon: Share,
    color: '#909399'
  }
]

// 生成分享链接
const shareUrl = computed(() => {
  const baseUrl = window.location.origin
  const inviteCode = generateInviteCode()
  return `${baseUrl}/group-buy/${props.groupBuyId}?inviteCode=${inviteCode}&from=share`
})

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    loadQrcode()
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 生成邀请码（简单实现）
const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

// 加载二维码
const loadQrcode = async () => {
  try {
    qrcodeLoading.value = true
    // 实际项目中应该调用后端API生成二维码
    // 这里使用第三方二维码API作为示例
    const encodedUrl = encodeURIComponent(shareUrl.value)
    qrcodeUrl.value = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedUrl}`
    
    // 记录分享行为
    await request.post(`/api/marketing/group-buy/${props.groupBuyId}/share`, {
      shareChannel: 'qrcode'
    })
  } catch (error) {
    console.error('加载二维码失败:', error)
  } finally {
    qrcodeLoading.value = false
  }
}

// 复制链接
const handleCopyLink = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    ElMessage.success('链接已复制到剪贴板')
    
    // 记录分享行为
    await request.post(`/api/marketing/group-buy/${props.groupBuyId}/share`, {
      shareChannel: 'link'
    })
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败，请手动复制')
  }
}

// 下载二维码
const handleDownloadQrcode = () => {
  const link = document.createElement('a')
  link.href = qrcodeUrl.value
  link.download = `group-buy-${props.groupBuyId}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  ElMessage.success('二维码已下载')
}

// 分享到渠道
const handleShareChannel = async (channel: string) => {
  try {
    await request.post(`/api/marketing/group-buy/${props.groupBuyId}/share`, {
      shareChannel: channel
    })

    switch (channel) {
      case 'wechat':
        ElMessage.info('请使用微信扫描二维码分享')
        break
      case 'link':
        handleCopyLink()
        break
      case 'qrcode':
        handleDownloadQrcode()
        break
      default:
        ElMessage.info('功能开发中...')
    }
  } catch (error) {
    console.error('分享失败:', error)
  }
}

// 关闭弹窗
const handleClose = () => {
  visible.value = false
}

onMounted(() => {
  if (props.modelValue) {
    loadQrcode()
  }
})
</script>

<style scoped lang="scss">
.share-modal {
  .share-tip {
    margin-bottom: 24px;
  }

  .share-section {
    margin-bottom: 24px;

    .section-title {
      font-size: var(--text-base);
      font-weight: bold;
      margin-bottom: 12px;
      color: #303133;
    }
  }

  .link-box {
    .share-input {
      :deep(.el-input__inner) {
        font-family: monospace;
        font-size: var(--text-xs);
      }
    }
  }

  .qrcode-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);

    .qrcode-loading {
      width: 200px;
      height: 200px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: 2px dashed #dcdfe6;
      border-radius: 8px;
      color: #909399;

      .el-icon {
        font-size: var(--text-4xl);
        margin-bottom: 8px;
      }
    }

    .qrcode-image {
      width: 200px;
      height: 200px;
      border: 1px solid #dcdfe6;
      border-radius: 8px;
    }
  }

  .share-channels {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: var(--spacing-md);

    .channel-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background: #f5f7fa;
        transform: translateY(-2px);
      }

      .channel-icon {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      }

      .channel-name {
        font-size: var(--text-sm);
        color: #606266;
      }
    }
  }

  .share-preview {
    .preview-card {
      border: 1px solid #dcdfe6;
      border-radius: 8px;
      overflow: hidden;

      .preview-cover {
        width: 100%;
        height: 150px;
        object-fit: cover;
      }

      .preview-content {
        padding: var(--spacing-md);

        .preview-title {
          font-size: var(--text-base);
          font-weight: bold;
          margin-bottom: 8px;
          color: #303133;
        }

        .preview-desc {
          font-size: var(--text-sm);
          color: #606266;
          line-height: 1.6;
          margin-bottom: 12px;
        }

        .preview-price {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);

          .current-price {
            font-size: var(--text-2xl);
            font-weight: bold;
            color: #f56c6c;
          }

          .original-price {
            font-size: var(--text-base);
            color: #909399;
            text-decoration: line-through;
          }
        }
      }
    }
  }
}
</style>
