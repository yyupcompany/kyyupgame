<template>
  <div class="device-mode-switcher">
    <el-card class="mode-card">
      <template #header>
        <div class="card-header">
          <span>设备模式切换</span>
          <el-tag :type="currentMode === 'pc' ? 'success' : 'warning'">
            {{ currentMode === 'pc' ? '桌面模式' : '移动模式' }}
          </el-tag>
        </div>
      </template>
      
      <div class="mode-info">
        <p><strong>当前设备信息：</strong></p>
        <ul>
          <li>设备类型：{{ deviceInfo.isPc ? 'PC' : deviceInfo.isMobile ? '移动设备' : '平板' }}</li>
          <li>屏幕尺寸：{{ deviceInfo.screenWidth }} x {{ deviceInfo.screenHeight }}</li>
          <li>User Agent：{{ deviceInfo.userAgent.substring(0, 50) }}...</li>
          <li>强制桌面模式：{{ isForceDesktop ? '是' : '否' }}</li>
        </ul>
      </div>
      
      <div class="mode-actions">
        <el-button 
          type="primary" 
          :disabled="currentMode === 'pc'"
          @click="switchToDesktop"
        >
          切换到桌面模式
        </el-button>
        <el-button 
          type="warning" 
          :disabled="currentMode !== 'pc' || !isForceDesktop"
          @click="switchToMobile"
        >
          切换到移动模式
        </el-button>
      </div>
      
      <div class="mode-tips">
        <el-alert
          title="提示"
          type="info"
          :closable="false"
          show-icon
        >
          <p>• 桌面模式：适合PC端操作，功能完整</p>
          <p>• 移动模式：适合手机/平板，界面简化</p>
          <p>• 可通过URL参数 ?forceDesktop=1 强制桌面模式</p>
        </el-alert>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  getDeviceInfo, 
  getDeviceType, 
  setForceDesktopMode, 
  isForceDesktopMode 
} from '@/utils/device-detection'

const router = useRouter()
const deviceInfo = ref(getDeviceInfo())
const currentMode = ref(getDeviceType())
const isForceDesktop = ref(isForceDesktopMode())

// 切换到桌面模式
const switchToDesktop = () => {
  setForceDesktopMode(true)
  // 刷新页面以应用新的设备模式
  window.location.reload()
}

// 切换到移动模式
const switchToMobile = () => {
  setForceDesktopMode(false)
  // 刷新页面以应用新的设备模式
  window.location.reload()
}

onMounted(() => {
  // 更新设备信息
  deviceInfo.value = getDeviceInfo()
  currentMode.value = getDeviceType()
  isForceDesktop.value = isForceDesktopMode()
})
</script>

<style scoped>
.device-mode-switcher {
  max-width: 600px;
  margin: var(--spacing-xl) auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mode-info {
  margin-bottom: var(--spacing-xl);
}

.mode-info ul {
  margin: var(--spacing-2xl) 0;
  padding-left: var(--spacing-xl);
}

.mode-info li {
  margin: var(--spacing-base) 0;
  font-size: var(--text-base);
}

.mode-actions {
  margin-bottom: var(--spacing-xl);
  text-align: center;
}

.mode-actions .el-button {
  margin: 0 var(--spacing-sm);
}

.mode-tips .el-alert {
  margin-top: var(--spacing-2xl);
}

.mode-tips p {
  margin: var(--spacing-base) 0;
  font-size: var(--text-sm);
}
</style>
