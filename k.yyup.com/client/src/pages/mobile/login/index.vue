<template>
  <div class="mobile-login-page">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>
      <div class="bg-circle bg-circle-3"></div>
    </div>

    <!-- 主容器 -->
    <div class="login-container">
      <!-- Logo和标题 -->
      <div class="login-header">
        <div class="logo">
          <img src="/src/assets/logo.png" alt="Logo" />
        </div>
        <h1 class="title">智慧幼儿园管理系统</h1>
        <p class="subtitle">移动端登录</p>
      </div>

      <!-- 登录表单 -->
      <van-form @submit="handleLogin" ref="loginFormRef">
        <van-cell-group inset class="form-group">
          <!-- 租户代码输入（可选） -->
          <van-field
            v-model="loginForm.tenantCode"
            name="tenantCode"
            label="租户代码"
            placeholder="选填（如k001）"
            :rules="tenantCodeRules"
            clearable
            :error-message="errors.tenantCode"
          >
            <template #left-icon>
              <van-icon name="shop-o" />
            </template>
          </van-field>

          <!-- 用户名输入 -->
          <van-field
            v-model="loginForm.username"
            name="username"
            label="用户名"
            placeholder="请输入用户名"
            :rules="usernameRules"
            clearable
            autocomplete="username"
          >
            <template #left-icon>
              <van-icon name="user-o" />
            </template>
          </van-field>

          <!-- 密码输入 -->
          <van-field
            v-model="loginForm.password"
            name="password"
            type="password"
            label="密码"
            placeholder="请输入密码"
            :rules="passwordRules"
            clearable
            autocomplete="current-password"
          >
            <template #left-icon>
              <van-icon name="lock" />
            </template>
          </van-field>
        </van-cell-group>

        <!-- 登录按钮 -->
        <div class="login-actions">
          <van-button
            round
            block
            type="primary"
            native-type="submit"
            :loading="loading"
            loading-text="登录中..."
            size="large"
          >
            登录
          </van-button>
        </div>
      </van-form>

      <!-- 快捷登录 -->
      <div class="quick-login">
        <div class="quick-login-title">
          <van-divider>快捷登录</van-divider>
        </div>
        <div class="quick-login-buttons">
          <van-button
            type="primary"
            @click="handleQuickLogin('admin')"
          >
            管理员
          </van-button>
          <van-button
            type="success"
            @click="handleQuickLogin('principal')"
          >
            园长
          </van-button>
          <van-button
            type="warning"
            @click="handleQuickLogin('teacher')"
          >
            教师
          </van-button>
          <van-button
            type="default"
            @click="handleQuickLogin('parent')"
          >
            家长
          </van-button>
        </div>
      </div>

      <!-- 环境信息 -->
      <div class="environment-info">
        <van-tag type="primary" size="large">
          {{ environmentInfo.text }}
        </van-tag>
      </div>
    </div>

    <!-- 租户选择弹窗 -->
    <van-popup
      v-model:show="showTenantSelection"
      position="bottom"
      round
      :style="{ height: '60%' }"
    >
      <div class="tenant-selection">
        <div class="tenant-header">
          <h3>选择租户</h3>
          <van-button
            type="primary"
            size="small"
            @click="showTenantSelection = false"
          >
            关闭
          </van-button>
        </div>
        <p class="tenant-subtitle">您的账号关联了多个租户，请选择要登录的租户</p>

        <van-radio-group v-model="selectedTenantCode">
          <van-cell-group>
            <van-cell
              v-for="tenant in availableTenants"
              :key="tenant.tenantCode"
              clickable
              @click="selectTenant(tenant)"
            >
              <template #title>
                <div class="tenant-info">
                  <div class="tenant-name">{{ tenant.tenantName }}</div>
                  <div class="tenant-code">代码: {{ tenant.tenantCode }}</div>
                </div>
              </template>
              <template #right-icon>
                <van-radio :name="tenant.tenantCode" />
              </template>
            </van-cell>
          </van-cell-group>
        </van-radio-group>

        <div class="tenant-actions">
          <van-button
            type="primary"
            block
            :disabled="!selectedTenantCode"
            @click="confirmTenantSelection"
          >
            确认选择
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showSuccessToast, showLoadingToast, closeToast } from 'vant'
import { useUserStore } from '@/stores/user'
import { mobileAIBridge } from '@/utils/mobile-ai-bridge'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 表单数据
const loginForm = reactive({
  tenantCode: '',
  username: '',
  password: ''
})

// 表单引用
const loginFormRef = ref()

// 错误信息
const errors = reactive({
  tenantCode: ''
})

// 加载状态
const loading = ref(false)

// 租户选择相关
const showTenantSelection = ref(false)
const availableTenants = ref<any[]>([])
const selectedTenantCode = ref('')

// 快捷登录账号
const QUICK_LOGIN_ACCOUNTS = {
  admin: { username: 'admin', password: '123456' },
  principal: { username: 'principal', password: '123456' },
  teacher: { username: 'teacher', password: '123456' },
  parent: { username: 'test_parent', password: '123456' }
}

// 表单验证规则
const tenantCodeRules = [
  {
    validator: (value: string) => {
      if (!value) return true // 租户代码可选
      return /^[a-zA-Z0-9]{3,10}$/.test(value)
    },
    message: '租户代码格式不正确（3-10位字母数字）'
  }
]

const usernameRules = [
  { required: true, message: '请输入用户名' },
  { pattern: /^[a-zA-Z0-9_]{3,20}$/, message: '用户名格式不正确' }
]

const passwordRules = [
  { required: true, message: '请输入密码' },
  { min: 6, message: '密码至少6位' }
]

// 环境信息
const environmentInfo = computed(() => {
  const env = mobileAIBridge.getEnvironmentInfo()
  return {
    environment: env.environment,
    hostname: env.hostname,
    text: env.environment === 'tenant' ? `租户环境 (${env.hostname})` : '本地环境'
  }
})

/**
 * 处理登录提交
 */
const handleLogin = async () => {
  try {
    loading.value = true
    errors.tenantCode = ''

    console.log('📝 [移动端登录] 尝试登录', {
      username: loginForm.username,
      tenantCode: loginForm.tenantCode || '未指定',
      environment: environmentInfo.value.environment
    })

    // 调用登录
    const result = await userStore.login({
      username: loginForm.username,
      password: loginForm.password
    })

    if (result) {
      showSuccessToast('登录成功')

      // 保存租户代码
      if (loginForm.tenantCode) {
        localStorage.setItem('tenant_code', loginForm.tenantCode)
        console.log('✅ [移动端登录] 租户代码已保存:', loginForm.tenantCode)
      }

      // 跳转到移动端首页
      setTimeout(() => {
        const redirect = (route.query.redirect as string) || '/mobile/centers'
        router.push(redirect)
      }, 500)
    }
  } catch (error: any) {
    console.error('❌ [移动端登录] 登录失败:', error)

    // 检查是否需要租户选择
    if (error.message?.includes('租户') || error.message?.includes('tenant')) {
      // TODO: 显示租户选择弹窗
      showToast('需要选择租户')
    } else {
      showToast(error.message || '登录失败')
    }
  } finally {
    loading.value = false
  }
}

/**
 * 快捷登录
 */
const handleQuickLogin = (role: string) => {
  const account = QUICK_LOGIN_ACCOUNTS[role as keyof typeof QUICK_LOGIN_ACCOUNTS]
  if (account) {
    loginForm.username = account.username
    loginForm.password = account.password

    console.log('⚡ [移动端登录] 快捷登录:', role)

    // 自动提交
    setTimeout(() => {
      handleLogin()
    }, 300)
  }
}

/**
 * 选择租户
 */
const selectTenant = (tenant: any) => {
  selectedTenantCode.value = tenant.tenantCode
  console.log('🏢 [移动端登录] 选择租户:', tenant)
}

/**
 * 确认租户选择
 */
const confirmTenantSelection = () => {
  if (selectedTenantCode.value) {
    loginForm.tenantCode = selectedTenantCode.value
    showTenantSelection.value = false
    showToast(`已选择租户: ${selectedTenantCode.value}`)
  }
}

// 组件挂载
onMounted(() => {
  console.log('📱 [移动端登录] 页面加载', {
    environment: environmentInfo.value
  })

  // 从URL参数获取租户代码
  const urlParams = new URLSearchParams(window.location.search)
  const urlTenantCode = urlParams.get('tenantCode')

  if (urlTenantCode) {
    loginForm.tenantCode = urlTenantCode
    console.log('✅ [移动端登录] 从URL获取租户代码:', urlTenantCode)
  }

  // 检查本地存储的租户代码
  const savedTenantCode = localStorage.getItem('tenant_code')
  if (savedTenantCode && !loginForm.tenantCode) {
    loginForm.tenantCode = savedTenantCode
    console.log('✅ [移动端登录] 从本地存储获取租户代码:', savedTenantCode)
  }
})
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';

.mobile-login-page {
  /* 强制使用动态视口高度铺满整个屏幕 */
  height: 100dvh;
  /* 兼容不支持 dvh 的浏览器 */
  @supports not (height: 100dvh) {
    height: 100vh;
  }
  /* 添加安全区域支持 */
  height: calc(100dvh + env(safe-area-inset-top) + env(safe-area-inset-bottom));
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  /* 防止iOS橡皮筋效果 */
  overscroll-behavior-y: none;

  // 背景装饰
  .bg-decoration {
    position: absolute;
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
        width: min(300px, 50vw);
        height: min(300px, 50vw);
        top: -100px;
        right: -50px;
      }

      &.bg-circle-2 {
        width: min(200px, 40vw);
        height: min(200px, 40vw);
        bottom: 100px;
        left: -50px;
      }

      &.bg-circle-3 {
        width: min(150px, 30vw);
        height: min(150px, 30vw);
        top: 50%;
        right: 10%;
      }
    }
  }

  // 主容器
  .login-container {
    position: relative;
    z-index: 1;
    /* 顶部和底部添加安全区域 */
    padding: max(
      env(safe-area-inset-top) + var(--spacing-xl, 20px),
      var(--spacing-xl, 20px)
    ) var(--spacing-xl, 20px)
    max(
      env(safe-area-inset-bottom) + var(--spacing-xl, 20px),
      var(--spacing-xl, 20px)
    );
    /* 铺满父容器 */
    height: 100%;
    display: flex;
    flex-direction: column;
    /* 内容垂直居中 */
    justify-content: center;
    gap: var(--spacing-lg, 16px);
    /* 允许内容过多时滚动 */
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  // 头部
  .login-header {
    text-align: center;
    margin-bottom: var(--spacing-lg, 16px);
    /* 移除margin-top，让flex居中处理 */
    flex-shrink: 0;

    .logo {
      width: min(80px, 18vw);
      height: min(80px, 18vw);
      margin: 0 auto var(--spacing-md, 12px);
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

      img {
        width: min(50px, 12vw);
        height: min(50px, 12vw);
        object-fit: contain;
      }
    }

    .title {
      /* 响应式字体大小 */
      font-size: clamp(18px, 5vw, 24px);
      font-weight: bold;
      color: var(--text-white, #ffffff);
      margin: 0 0 var(--spacing-sm, 8px);
      line-height: 1.3;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .subtitle {
      font-size: clamp(12px, 3vw, 14px);
      color: rgba(255, 255, 255, 0.9);
      margin: 0;
    }
  }

  // 表单
  .form-group {
    margin-bottom: var(--spacing-md, 12px);
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: var(--border-radius-lg, 12px);
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);

    :deep(.van-field) {
      padding: var(--spacing-md, 12px) var(--spacing-lg, 16px);
    }

    :deep(.van-field__label) {
      font-size: clamp(12px, 3vw, 14px);
    }

    :deep(.van-field__control) {
      font-size: clamp(14px, 4vw, 16px);
    }
  }

  // 登录按钮
  .login-actions {
    margin-bottom: var(--spacing-lg, 16px);

    .van-button {
      /* 响应式高度 */
      height: clamp(44px, 12vw, 52px);
      font-size: clamp(14px, 4vw, 16px);
      font-weight: bold;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);

      &--loading-color {
        color: var(--text-white, #ffffff);
      }

      &:active {
        transform: scale(0.98);
        transition: transform 0.1s;
      }
    }
  }

  // 快捷登录
  .quick-login {
    margin-bottom: var(--spacing-lg, 16px);

    .quick-login-title {
      margin-bottom: var(--spacing-md, 12px);

      :deep(.van-divider) {
        color: rgba(255, 255, 255, 0.8);
        font-size: clamp(12px, 3vw, 14px);

        :deep(.van-divider__content) {
          padding: 0 var(--spacing-md, 12px);
        }
      }
    }

    .quick-login-buttons {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--spacing-md, 12px);

      .van-button {
        /* 响应式尺寸 */
        height: clamp(44px, 11vw, 50px);
        font-size: clamp(13px, 3.8vw, 15px);
        font-weight: 600;
        /* 大圆角 */
        border-radius: var(--border-radius-xl, 16px);
        /* 半透明背景 */
        background: rgba(255, 255, 255, 0.2);
        border: 1.5px solid rgba(255, 255, 255, 0.3);
        /* 柔和阴影 */
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        /* 过渡效果 */
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(10px);

        /* 不同类型按钮的渐变 */
        &.van-button--primary {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%);
          border-color: rgba(102, 126, 234, 0.5);
          color: #ffffff;

          &:hover {
            background: linear-gradient(135deg, rgba(102, 126, 234, 1) 0%, rgba(118, 75, 162, 1) 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
          }

          &:active {
            transform: translateY(0) scale(0.96);
          }
        }

        &.van-button--success {
          background: linear-gradient(135deg, rgba(103, 194, 58, 0.9) 0%, rgba(82, 196, 26, 0.9) 100%);
          border-color: rgba(103, 194, 58, 0.5);
          color: #ffffff;

          &:hover {
            background: linear-gradient(135deg, rgba(103, 194, 58, 1) 0%, rgba(82, 196, 26, 1) 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(103, 194, 58, 0.4);
          }

          &:active {
            transform: translateY(0) scale(0.96);
          }
        }

        &.van-button--warning {
          background: linear-gradient(135deg, rgba(230, 162, 60, 0.9) 0%, rgba(246, 189, 22, 0.9) 100%);
          border-color: rgba(230, 162, 60, 0.5);
          color: #ffffff;

          &:hover {
            background: linear-gradient(135deg, rgba(230, 162, 60, 1) 0%, rgba(246, 189, 22, 1) 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(230, 162, 60, 0.4);
          }

          &:active {
            transform: translateY(0) scale(0.96);
          }
        }

        &.van-button--default {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.4);
          color: #ffffff;

          &:hover {
            background: rgba(255, 255, 255, 0.35);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255, 255, 255, 0.2);
          }

          &:active {
            transform: translateY(0) scale(0.96);
          }
        }
      }
    }
  }

  // 环境信息
  .environment-info {
    text-align: center;
    margin-top: var(--spacing-sm, 8px);
    margin-bottom: var(--spacing-md, 12px);

    :deep(.van-tag) {
      background: rgba(255, 255, 255, 0.25);
      color: var(--text-white, #ffffff);
      border-color: rgba(255, 255, 255, 0.4);
      font-size: clamp(10px, 2.5vw, 12px);
      padding: var(--spacing-xs) 12px;
      backdrop-filter: blur(10px);
    }
  }

  // 租户选择弹窗
  .tenant-selection {
    padding: var(--spacing-lg);

    .tenant-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-md);

      h3 {
        margin: 0;
        font-size: var(--text-lg);
        font-weight: bold;
      }
    }

    .tenant-subtitle {
      color: var(--text-secondary);
      font-size: var(--text-sm);
      margin-bottom: var(--spacing-lg);
    }

    .tenant-info {
      .tenant-name {
        font-size: var(--text-base);
        font-weight: bold;
        color: var(--text-primary);
      }

      .tenant-code {
        font-size: var(--text-xs);
        color: var(--text-secondary);
        margin-top: 4px;
      }
    }

    .tenant-actions {
      margin-top: var(--spacing-lg);
    }
  }
}
</style>
