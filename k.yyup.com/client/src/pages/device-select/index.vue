<template>
  <div class="device-select-page">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>
      <div class="bg-circle bg-circle-3"></div>
    </div>

    <!-- 主容器 -->
    <div class="select-container">
      <!-- Logo和标题 -->
      <div class="select-header">
        <div class="logo">
          <img src="/src/assets/logo.png" alt="Logo" />
        </div>
        <h1 class="title">智慧幼儿园管理系统</h1>
        <p class="subtitle">请选择您的设备类型</p>
      </div>

      <!-- 设备选择卡片 -->
      <div class="device-cards">
        <!-- 移动端卡片 -->
        <div class="device-card mobile-card" @click="selectDevice('mobile')">
          <div class="card-icon">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="12" y="4" width="40" height="56" rx="4" fill="currentColor" opacity="0.2"/>
              <rect x="14" y="6" width="36" height="52" rx="2" fill="currentColor"/>
              <circle cx="32" cy="53" r="1.5" fill="white"/>
            </svg>
          </div>
          <h3 class="card-title">移动端</h3>
          <p class="card-desc">适用于手机、平板等触屏设备</p>
          <div class="card-features">
            <span class="feature">触屏优化</span>
            <span class="feature">简洁界面</span>
            <span class="feature">快捷操作</span>
          </div>
          <van-button round type="primary" size="large" block>
            进入移动端
          </van-button>
        </div>

        <!-- 桌面端卡片 -->
        <div class="device-card desktop-card" @click="selectDevice('pc')">
          <div class="card-icon">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="8" width="56" height="36" rx="3" fill="currentColor" opacity="0.2"/>
              <rect x="6" y="10" width="52" height="32" rx="2" fill="currentColor"/>
              <rect x="24" y="46" width="16" height="4" rx="1" fill="currentColor"/>
              <rect x="20" y="50" width="24" height="4" rx="1" fill="currentColor" opacity="0.6"/>
            </svg>
          </div>
          <h3 class="card-title">桌面端</h3>
          <p class="card-desc">适用于电脑、笔记本等设备</p>
          <div class="card-features">
            <span class="feature">完整功能</span>
            <span class="feature">高效管理</span>
            <span class="feature">数据分析</span>
          </div>
          <van-button round type="success" size="large" block>
            进入桌面端
          </van-button>
        </div>
      </div>

      <!-- 自动检测提示 -->
      <div class="auto-detect-tip">
        <van-icon name="info-o" />
        <span>系统已自动检测您的设备类型，推荐使用 {{ recommendedDevice === 'mobile' ? '移动端' : '桌面端' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getDeviceType, forceDeviceType } from '@/utils/device-detect'
import type { DeviceType } from '@/utils/device-detect'

const router = useRouter()

// 检测的设备类型
const detectedDevice = computed<DeviceType>(() => getDeviceType())

// 推荐的设备类型
const recommendedDevice = computed<DeviceType>(() => {
  // 平板设备推荐使用移动端
  if (detectedDevice.value === 'tablet') {
    return 'mobile'
  }
  return detectedDevice.value
})

/**
 * 选择设备类型
 */
const selectDevice = (device: 'mobile' | 'pc') => {
  console.log('📱 用户选择设备类型:', device)

  // 强制使用选择的设备类型
  forceDeviceType(device)

  // 保存选择到 localStorage
  localStorage.setItem('user_selected_device', device)

  // 跳转到对应页面
  if (device === 'mobile') {
    // 检查是否已登录
    const token = localStorage.getItem('token')
    if (token) {
      router.push('/mobile/centers')
    } else {
      router.push('/mobile/login')
    }
  } else {
    // 桌面端
    const token = localStorage.getItem('token')
    if (token) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }
}

onMounted(() => {
  console.log('📱 设备选择页面加载', {
    detected: detectedDevice.value,
    recommended: recommendedDevice.value,
    userAgent: navigator.userAgent.substring(0, 100),
    screenWidth: window.innerWidth
  })

  // 如果用户之前选择过，自动跳转
  const savedDevice = localStorage.getItem('user_selected_device') as DeviceType | null
  if (savedDevice && (savedDevice === 'mobile' || savedDevice === 'pc')) {
    console.log('📱 检测到之前的设备选择:', savedDevice)
    // 延迟跳转，让用户看到页面
    setTimeout(() => {
      selectDevice(savedDevice)
    }, 500)
  }
})
</script>

<style scoped lang="scss">
.device-select-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl, 20px);

  // 背景装饰
  .bg-decoration {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    z-index: 0;
    pointer-events: none;

    .bg-circle {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);

      &.bg-circle-1 {
        width: 300px;
        height: 300px;
        top: -100px;
        right: -50px;
      }

      &.bg-circle-2 {
        width: 200px;
        height: 200px;
        bottom: 100px;
        left: -50px;
      }

      &.bg-circle-3 {
        width: 150px;
        height: 150px;
        top: 50%;
        right: 10%;
      }
    }
  }

  // 主容器
  .select-container {
    position: relative;
    z-index: 1;
    max-width: 900px;
    width: 100%;
  }

  // 头部
  .select-header {
    text-align: center;
    margin-bottom: var(--spacing-xxl, 40px);

    .logo {
      width: 80px;
      height: 80px;
      margin: 0 auto var(--spacing-md, 12px);
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

      img {
        width: 50px;
        height: 50px;
      }
    }

    .title {
      font-size: clamp(20px, 4vw, 28px);
      font-weight: bold;
      color: var(--text-white, #ffffff);
      margin: 0 0 var(--spacing-sm, 8px);
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .subtitle {
      font-size: clamp(14px, 2.5vw, 16px);
      color: rgba(255, 255, 255, 0.9);
      margin: 0;
    }
  }

  // 设备卡片
  .device-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--spacing-xl, 20px);

    .device-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: var(--border-radius-xl, 16px);
      padding: var(--spacing-xl, 20px);
      text-align: center;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      }

      &:active {
        transform: translateY(-2px) scale(0.98);
      }

      .card-icon {
        width: 80px;
        height: 80px;
        margin: 0 auto var(--spacing-lg, 16px);
        color: var(--primary-color, #5b8def);
        display: flex;
        align-items: center;
        justify-content: center;

        svg {
          width: 100%;
          height: 100%;
        }
      }

      .card-title {
        font-size: clamp(18px, 3vw, 20px);
        font-weight: bold;
        color: var(--text-primary, #333);
        margin: 0 0 var(--spacing-sm, 8px);
      }

      .card-desc {
        font-size: clamp(12px, 2vw, 14px);
        color: var(--text-secondary, #666);
        margin: 0 0 var(--spacing-md, 12px);
      }

      .card-features {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-xs, 4px);
        justify-content: center;
        margin-bottom: var(--spacing-lg, 16px);

        .feature {
          font-size: 11px;
          padding: var(--spacing-xs) 8px;
          background: var(--bg-light, #f0f0f0);
          color: var(--text-secondary, #666);
          border-radius: 12px;
        }
      }

      .van-button {
        height: 44px;
        font-size: var(--text-base);
        font-weight: 600;
      }
    }

    .mobile-card {
      .card-icon {
        color: #5b8def;
      }
    }

    .desktop-card {
      .card-icon {
        color: #67c23a;
      }
    }
  }

  // 自动检测提示
  .auto-detect-tip {
    margin-top: var(--spacing-xl, 20px);
    padding: var(--spacing-md, 12px) var(--spacing-lg, 16px);
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    border-radius: var(--border-radius-lg, 12px);
    color: rgba(255, 255, 255, 0.9);
    font-size: clamp(12px, 2vw, 14px);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm, 8px);

    .van-icon {
      font-size: var(--text-base);
    }
  }
}

// 移动端响应式
@media (max-width: var(--breakpoint-md)) {
  .device-select-page {
    padding: var(--spacing-md, 12px);

    .device-cards {
      grid-template-columns: 1fr;

      .device-card {
        .card-icon {
          width: 60px;
          height: 60px;
        }
      }
    }
  }
}
</style>
