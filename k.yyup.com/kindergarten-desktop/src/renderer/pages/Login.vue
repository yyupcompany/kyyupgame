<template>
  <div class="login-container">
    <div class="login-card">
      <!-- 应用标题 -->
      <div class="login-header">
        <div class="logo">
          <el-icon size="48" color="#409eff">
            <School />
          </el-icon>
        </div>
        <h1 class="title">幼儿园管理系统</h1>
        <p class="subtitle">专业的幼儿园综合管理平台</p>
        <p class="version" v-if="isElectron">桌面版 v{{ appVersion }}</p>
      </div>

      <!-- 登录表单 -->
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
            :prefix-icon="User"
            clearable
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            :prefix-icon="Lock"
            show-password
            clearable
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="isLoading"
            class="login-button"
            @click="handleLogin"
          >
            {{ isLoading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 快捷操作 -->
      <div class="quick-actions">
        <el-button text type="info" @click="showDefaultCredentials">
          <el-icon><InfoFilled /></el-icon>
          查看默认账号
        </el-button>
        <el-button text type="primary" @click="showHelp" v-if="isElectron">
          <el-icon><QuestionFilled /></el-icon>
          使用帮助
        </el-button>
      </div>
    </div>

    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>

    <!-- 默认账号对话框 -->
    <el-dialog
      v-model="showCredentialsDialog"
      title="默认登录账号"
      width="400px"
    >
      <div class="credentials-info">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="用户名">admin</el-descriptions-item>
          <el-descriptions-item label="密码">123456</el-descriptions-item>
          <el-descriptions-item label="角色">系统管理员</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="showCredentialsDialog = false">关闭</el-button>
        <el-button type="primary" @click="useDefaultCredentials">
          使用默认账号
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Lock, School, InfoFilled, QuestionFilled } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 响应式数据
const loginFormRef = ref(null)
const isLoading = ref(false)
const isElectron = ref(false)
const appVersion = ref('1.0.0')
const showCredentialsDialog = ref(false)

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: ''
})

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 50, message: '用户名长度为 2-50 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 50, message: '密码长度为 6-50 个字符', trigger: 'blur' }
  ]
}

// 检查是否在Electron环境中
onMounted(async () => {
  isElectron.value = typeof window !== 'undefined' && window.electronAPI

  if (isElectron.value) {
    try {
      appVersion.value = await window.electronAPI.getAppVersion()
    } catch (error) {
      console.error('获取应用版本失败:', error)
    }
  }

  // 如果已经登录，重定向到仪表板
  if (authStore.isAuthenticated) {
    const redirect = route.query.redirect || '/dashboard'
    router.push(redirect)
  }
})

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    // 验证表单
    await loginFormRef.value.validate()

    isLoading.value = true

    // 调用登录接口
    const result = await authStore.login(loginForm)

    ElMessage.success('登录成功')

    // 重定向到目标页面
    const redirect = route.query.redirect || '/dashboard'
    router.push(redirect)

  } catch (error) {
    console.error('登录失败:', error)

    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('登录失败，请检查用户名和密码')
    }
  } finally {
    isLoading.value = false
  }
}

// 显示默认账号
const showDefaultCredentials = () => {
  showCredentialsDialog.value = true
}

// 使用默认账号
const useDefaultCredentials = () => {
  loginForm.username = 'admin'
  loginForm.password = '123456'
  showCredentialsDialog.value = false
  ElMessage.success('已填入默认账号信息')
}

// 显示帮助
const showHelp = () => {
  ElMessageBox.alert(
    '幼儿园管理系统桌面版使用指南：\n\n' +
    '1. 首次登录请使用默认账号：admin/123456\n' +
    '2. 系统支持热重载，修改代码后保存即可生效\n' +
    '3. 数据保存在本地SQLite数据库中\n' +
    '4. 支持文件上传和数据导入导出功能\n\n' +
    '如遇问题，请联系技术支持。',
    '使用帮助',
    {
      type: 'info',
      confirmButtonText: '知道了'
    }
  )
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.login-card {
  width: 400px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  z-index: 10;
  position: relative;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  margin-bottom: 16px;
}

.title {
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 14px;
  color: #7f8c8d;
  margin: 0 0 4px 0;
}

.version {
  font-size: 12px;
  color: #95a5a6;
  margin: 0;
}

.login-form {
  margin-bottom: 24px;
}

.login-form .el-form-item {
  margin-bottom: 24px;
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
}

.quick-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.credentials-info {
  margin: 20px 0;
}

.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
}

.shape-1 {
  width: 200px;
  height: 200px;
  background: #409eff;
  top: 10%;
  left: 10%;
  animation: float 6s ease-in-out infinite;
}

.shape-2 {
  width: 150px;
  height: 150px;
  background: #67c23a;
  top: 60%;
  right: 10%;
  animation: float 8s ease-in-out infinite reverse;
}

.shape-3 {
  width: 100px;
  height: 100px;
  background: #e6a23c;
  bottom: 20%;
  left: 20%;
  animation: float 4s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(10deg);
  }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-card {
    width: 90%;
    padding: 30px 20px;
    margin: 20px;
  }

  .title {
    font-size: 24px;
  }

  .quick-actions {
    flex-direction: column;
    gap: 8px;
  }
}

/* Element Plus 组件样式覆盖 */
.login-card :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.login-card :deep(.el-button--primary) {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}
</style>