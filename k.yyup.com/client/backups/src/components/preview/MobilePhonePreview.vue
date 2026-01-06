<template>
  <div class="mobile-phone-preview-modal" v-if="visible" @click.self="handleClose">
    <div class="modal-content">
      <div class="modal-header">
        <h3>移动端预览</h3>
        <div class="device-switcher">
          <el-radio-group v-model="selectedDevice" size="small">
            <el-radio-button label="iphone">iPhone</el-radio-button>
            <el-radio-button label="android">Android</el-radio-button>
          </el-radio-group>
        </div>
        <el-button class="close-btn" type="text" @click="handleClose">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>

      <div class="modal-body">
        <!-- iPhone 预览 -->
        <div v-if="selectedDevice === 'iphone'" class="phone-frame iphone-frame">
          <div class="phone-notch"></div>
          <div class="phone-screen">
            <div class="status-bar">
              <span class="time">9:41</span>
              <div class="status-icons">
                <span class="signal">●●●●</span>
                <span class="wifi">📶</span>
                <span class="battery">🔋 100%</span>
              </div>
            </div>
            <div class="screen-content">
              <slot></slot>
            </div>
          </div>
          <div class="phone-home-indicator"></div>
        </div>

        <!-- Android 预览 -->
        <div v-else class="phone-frame android-frame">
          <div class="phone-camera"></div>
          <div class="phone-screen">
            <div class="status-bar android-status">
              <span class="time">9:41</span>
              <div class="status-icons">
                <span class="signal">📶</span>
                <span class="wifi">📡</span>
                <span class="battery">🔋</span>
              </div>
            </div>
            <div class="screen-content">
              <slot></slot>
            </div>
          </div>
          <div class="android-nav-bar">
            <div class="nav-btn">◁</div>
            <div class="nav-btn">○</div>
            <div class="nav-btn">▢</div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <div class="share-actions">
          <el-button type="primary" @click="handleCopyLink">
            <el-icon><Link /></el-icon>
            复制链接
          </el-button>
          <el-button @click="handleDownloadQR">
            <el-icon><Download /></el-icon>
            下载二维码
          </el-button>
          <el-button @click="handleShare">
            <el-icon><Share /></el-icon>
            分享
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Close, Link, Download, Share } from '@element-plus/icons-vue'

interface Props {
  visible: boolean
  shareUrl?: string
  qrCodeUrl?: string
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  shareUrl: '',
  qrCodeUrl: ''
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'close': []
}>()

const selectedDevice = ref<'iphone' | 'android'>('iphone')

const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}

const handleCopyLink = async () => {
  if (!props.shareUrl) {
    ElMessage.warning('分享链接不存在')
    return
  }

  try {
    await navigator.clipboard.writeText(props.shareUrl)
    ElMessage.success('链接已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败，请手动复制')
  }
}

const handleDownloadQR = () => {
  if (!props.qrCodeUrl) {
    ElMessage.warning('二维码不存在')
    return
  }

  const link = document.createElement('a')
  link.href = props.qrCodeUrl
  link.download = 'activity-qrcode.png'
  link.click()
  ElMessage.success('二维码下载成功')
}

const handleShare = () => {
  if (navigator.share && props.shareUrl) {
    navigator.share({
      title: '活动分享',
      text: '快来参加我们的活动吧！',
      url: props.shareUrl
    }).then(() => {
      ElMessage.success('分享成功')
    }).catch(() => {
      ElMessage.info('分享已取消')
    })
  } else {
    handleCopyLink()
  }
}
</script>

<style lang="scss" scoped>
.mobile-phone-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--black-alpha-70);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(var(--spacing-xs));

  .modal-content {
    background: var(--bg-white);
    border-radius: var(--text-lg);
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 var(--text-2xl) 60px var(--shadow-heavy);
  }

  .modal-header {
    padding: var(--text-2xl) var(--text-3xl);
    border-bottom: var(--border-width-base) solid #eee;
    display: flex;
    align-items: center;
    justify-content: space-between;

    h3 {
      margin: 0;
      font-size: var(--text-xl);
      font-weight: 600;
      color: var(--text-primary);
    }

    .device-switcher {
      flex: 1;
      display: flex;
      justify-content: center;
    }

    .close-btn {
      font-size: var(--text-2xl);
      color: var(--text-tertiary);
      padding: var(--spacing-xs);

      &:hover {
        color: var(--text-primary);
      }
    }
  }

  .modal-body {
    flex: 1;
    padding: var(--spacing-10xl) var(--text-2xl);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: auto;
  }

  .phone-frame {
    position: relative;
    border-radius: 36px;
    box-shadow: 0 10px 40px var(--shadow-heavy);
    overflow: hidden;
  }

  // iPhone 样式
  .iphone-frame {
    width: 375px;
    height: 667px;
    background: #000;
    border: var(--text-sm) solid #1f1f1f;

    .phone-notch {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 200px;
      height: 30px;
      background: #000;
      border-radius: 0 0 var(--text-2xl) var(--text-2xl);
      z-index: 10;
    }

    .phone-screen {
      width: 100%;
      height: calc(100% - var(--text-2xl));
      background: var(--bg-white);
      overflow: hidden;
    }

    .phone-home-indicator {
      position: absolute;
      bottom: var(--spacing-sm);
      left: 50%;
      transform: translateX(-50%);
      width: 13var(--spacing-xs);
      height: 5px;
      background: var(--bg-white);
      border-radius: var(--radius-xs);
      opacity: 0.3;
    }
  }

  // Android 样式
  .android-frame {
    width: 360px;
    height: 640px;
    background: #2c2c2c;
    border: 10px solid #2c2c2c;

    .phone-camera {
      position: absolute;
      top: var(--spacing-sm);
      left: 50%;
      transform: translateX(-50%);
      width: var(--text-sm);
      height: var(--text-sm);
      background: #1a1a1a;
      border-radius: var(--radius-full);
      z-index: 10;
    }

    .phone-screen {
      width: 100%;
      height: calc(100% - 40px);
      background: var(--bg-white);
      overflow: hidden;
      margin-top: var(--text-2xl);
    }

    .android-nav-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: var(--button-height-xl);
      background: #000;
      display: flex;
      align-items: center;
      justify-content: space-around;

      .nav-btn {
        color: var(--bg-white);
        font-size: var(--text-2xl);
        opacity: 0.7;
        cursor: pointer;

        &:hover {
          opacity: 1;
        }
      }
    }
  }

  .status-bar {
    height: var(--button-height-lg);
    padding: 0 var(--text-lg);
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #f8f8f8;
    font-size: var(--text-sm);
    color: var(--text-primary);

    &.android-status {
      background: var(--bg-white);
      border-bottom: var(--border-width-base) solid #eee;
    }

    .time {
      font-weight: 600;
    }

    .status-icons {
      display: flex;
      gap: var(--spacing-sm);
      align-items: center;
    }
  }

  .screen-content {
    height: calc(100% - 4var(--spacing-xs));
    overflow-y: auto;
    background: var(--bg-white);
  }

  .modal-footer {
    padding: var(--text-2xl) var(--text-3xl);
    border-top: var(--border-width-base) solid #eee;

    .share-actions {
      display: flex;
      gap: var(--text-sm);
      justify-content: center;
    }
  }
}
</style>

