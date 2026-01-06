<template>
  <div class="register-container">
    <div class="register-card">
      <!-- 头部Logo和标题 -->
      <div class="register-header">
        <div class="logo-section">
          <img :src="logoStore.currentLogoUrl" :alt="logoStore.logoText" class="logo" />
          <h1 class="system-title">{{ logoStore.logoText }}</h1>
        </div>
        <h2 class="register-title">用户注册</h2>
        <p class="register-subtitle">创建您的账户，开始使用系统</p>
      </div>

      <!-- 注册表单 -->
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        class="register-form"
        label-width="0"
        size="large"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="请输入用户名"
            clearable
          >
            <template #prefix>
              <span :style="{ color: 'var(--text-muted)' }">👤</span>
            </template>
          </el-input>
        </el-form-item>

        <!-- 邮箱 -->
        <el-form-item prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="请输入邮箱地址"
            clearable
          >
            <template #prefix>
              <span :style="{ color: 'var(--text-muted)' }">📧</span>
            </template>
          </el-input>
        </el-form-item>

        <!-- 手机号 -->
        <el-form-item prop="phone">
          <el-input
            v-model="registerForm.phone"
            placeholder="请输入手机号码"
            clearable
          >
            <template #prefix>
              <span :style="{ color: 'var(--text-muted)' }">📱</span>
            </template>
          </el-input>
        </el-form-item>

        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
            clearable
          >
            <template #prefix>
              <span :style="{ color: 'var(--text-muted)' }">🔒</span>
            </template>
          </el-input>
        </el-form-item>

        <!-- 确认密码 -->
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请确认密码"
            show-password
            clearable
          >
            <template #prefix>
              <span :style="{ color: 'var(--text-muted)' }">🔐</span>
            </template>
          </el-input>
        </el-form-item>

        <!-- 角色选择 -->
        <el-form-item prop="role">
          <el-select
            v-model="registerForm.role"
            placeholder="请选择用户角色"
            style="width: 100%"
            @change="handleRoleChange"
          >
            <el-option
              v-for="role in roleOptions"
              :key="role.value"
              :label="role.label"
              :value="role.value"
            >
              <span style="float: left">{{ role.icon }} {{ role.label }}</span>
              <span :style="{ float: 'right', color: 'var(--text-muted)', fontSize: '13px' }">
                {{ role.description }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>

        <!-- 教师专用字段 -->
        <template v-if="registerForm.role === 'teacher'">
          <!-- 幼儿园选择 -->
          <el-form-item prop="kindergartenId">
            <el-select
              v-model="registerForm.kindergartenId"
              placeholder="请选择幼儿园"
              style="width: 100%"
              @change="handleKindergartenChange"
              :loading="loadingKindergartens"
            >
              <el-option
                v-for="kindergarten in kindergartens"
                :key="kindergarten.id"
                :label="kindergarten.name"
                :value="kindergarten.id"
              />
            </el-select>
          </el-form-item>

          <!-- 班级选择 -->
          <el-form-item prop="classId">
            <el-select
              v-model="registerForm.classId"
              placeholder="请选择班级"
              style="width: 100%"
              :disabled="!registerForm.kindergartenId"
              :loading="loadingClasses"
            >
              <el-option
                v-for="classItem in filteredClasses"
                :key="classItem.id"
                :label="classItem.name"
                :value="classItem.id"
              />
            </el-select>
          </el-form-item>

          <!-- 教师职称（可选） -->
          <el-form-item prop="teacherTitle">
            <el-input
              v-model="registerForm.teacherTitle"
              placeholder="请输入教师职称（可选）"
              clearable
            >
              <template #prefix>
                <span :style="{ color: 'var(--text-muted)' }">👨‍🏫</span>
              </template>
            </el-input>
          </el-form-item>

          <!-- 教学科目（可选） -->
          <el-form-item prop="teachingSubjects">
            <el-select
              v-model="registerForm.teachingSubjects"
              placeholder="请选择教学科目（可选）"
              style="width: 100%"
              multiple
              filterable
              allow-create
              default-first-option
            >
              <el-option
                v-for="subject in subjectOptions"
                :key="subject"
                :label="subject"
                :value="subject"
              />
            </el-select>
          </el-form-item>
        </template>

        <!-- 验证码 -->
        <el-form-item prop="captcha">
          <div class="captcha-container">
            <el-input
              v-model="registerForm.captcha"
              placeholder="请输入验证码"
              style="flex: 1; margin-right: var(--text-sm)"
            >
              <template #prefix>
                <span :style="{ color: 'var(--text-muted)' }">🔢</span>
              </template>
            </el-input>
            <div class="captcha-code" @click="refreshCaptcha">
              {{ captchaCode }}
            </div>
          </div>
        </el-form-item>

        <!-- 同意条款 -->
        <el-form-item prop="agreement">
          <el-checkbox v-model="registerForm.agreement">
            我已阅读并同意
            <el-link type="primary" @click="showTerms = true">《用户协议》</el-link>
            和
            <el-link type="primary" @click="showPrivacy = true">《隐私政策》</el-link>
          </el-checkbox>
        </el-form-item>

        <!-- 注册按钮 -->
        <el-form-item>
          <el-button
            type="primary"
            class="register-button"
            :loading="registering"
            @click="handleRegister"
          >
            {{ registering ? '注册中...' : '立即注册' }}
          </el-button>
        </el-form-item>

        <!-- 登录链接 -->
        <div class="login-link">
          <span>已有账户？</span>
          <el-link type="primary" @click="goToLogin">立即登录</el-link>
        </div>
      </el-form>
    </div>

    <!-- 用户协议对话框 -->
    <el-dialog
      v-model="showTerms"
      title="用户协议"
      width="600px"
      :before-close="handleClose"
    >
      <div class="terms-content">
        <h3>1. 服务条款</h3>
        <p>欢迎使用幼儿园管理系统。在使用本系统前，请仔细阅读以下条款。</p>
        
        <h3>2. 用户责任</h3>
        <p>用户应当妥善保管账户信息，不得将账户借给他人使用。</p>
        
        <h3>3. 数据安全</h3>
        <p>我们承诺保护用户数据安全，不会泄露用户隐私信息。</p>
        
        <h3>4. 服务变更</h3>
        <p>我们保留随时修改或终止服务的权利，恕不另行通知。</p>
      </div>
      <template #footer>
        <el-button @click="showTerms = false">关闭</el-button>
        <el-button type="primary" @click="showTerms = false">同意</el-button>
      </template>
    </el-dialog>

    <!-- 隐私政策对话框 -->
    <el-dialog
      v-model="showPrivacy"
      title="隐私政策"
      width="600px"
      :before-close="handleClose"
    >
      <div class="privacy-content">
        <h3>1. 信息收集</h3>
        <p>我们仅收集为提供服务所必需的用户信息。</p>
        
        <h3>2. 信息使用</h3>
        <p>收集的信息仅用于系统功能实现和服务改进。</p>
        
        <h3>3. 信息保护</h3>
        <p>我们采用行业标准的安全措施保护用户信息。</p>
        
        <h3>4. 信息共享</h3>
        <p>未经用户同意，我们不会与第三方共享用户信息。</p>
      </div>
      <template #footer>
        <el-button @click="showPrivacy = false">关闭</el-button>
        <el-button type="primary" @click="showPrivacy = false">同意</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { request } from '@/utils/request'
import { useLogoStore } from '@/stores/logo'

const router = useRouter()
const logoStore = useLogoStore()

// 加载 Logo 配置
onMounted(async () => {
  logoStore.loadLogoConfig()
  refreshCaptcha()
  await loadRegistrationFormData()
})

// 响应式数据
const registerFormRef = ref()
const registering = ref(false)
const showTerms = ref(false)
const showPrivacy = ref(false)
const captchaCode = ref('')

// 表单数据相关状态
const kindergartens = ref([])
const classes = ref([])
const loadingKindergartens = ref(false)
const loadingClasses = ref(false)

// 注册表单数据
const registerForm = reactive({
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  role: '',
  captcha: '',
  agreement: false,
  // 教师专用字段
  kindergartenId: '',
  classId: '',
  teacherTitle: '',
  teachingSubjects: []
})

// 角色选项
const roleOptions = [
  {
    value: 'parent',
    label: '家长',
    icon: '👨‍👩‍👧‍👦',
    description: '学生家长'
  },
  {
    value: 'teacher',
    label: '教师',
    icon: '👩‍🏫',
    description: '任课教师'
  },
  {
    value: 'admin',
    label: '管理员',
    icon: '👨‍💼',
    description: '系统管理员'
  },
  {
    value: 'principal',
    label: '园长',
    icon: '👨‍💼',
    description: '幼儿园园长'
  }
]

// 教学科目选项
const subjectOptions = [
  '语文', '数学', '英语', '科学', '美术', '音乐', '体育', '舞蹈',
  '手工', '游戏', '生活技能', '社会', '健康', '阅读', '书法'
]

// 计算属性 - 根据选择的幼儿园过滤班级
const filteredClasses = computed(() => {
  if (!registerForm.kindergartenId) {
    return []
  }
  return classes.value.filter(cls => cls.kindergartenId === registerForm.kindergartenId)
})

// 表单验证规则
const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, message: '用户名只能包含字母、数字、下划线和中文', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
    { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/, message: '密码必须包含大小写字母和数字', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  role: [
    { required: true, message: '请选择用户角色', trigger: 'change' }
  ],
  // 教师专用字段验证
  kindergartenId: [
    {
      validator: (rule, value, callback) => {
        if (registerForm.role === 'teacher' && !value) {
          callback(new Error('教师注册必须选择幼儿园'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  classId: [
    {
      validator: (rule, value, callback) => {
        if (registerForm.role === 'teacher' && !value) {
          callback(new Error('教师注册必须选择班级'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value.toLowerCase() !== captchaCode.value.toLowerCase()) {
          callback(new Error('验证码错误'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  agreement: [
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('请阅读并同意用户协议和隐私政策'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

// 获取注册表单数据
const loadRegistrationFormData = async () => {
  try {
    const response = await request.get('/auth/register/form-data')
    if (response.success) {
      kindergartens.value = response.data.kindergartens || []
      classes.value = response.data.classes || []
      console.log('注册表单数据加载成功:', response.data)
    }
  } catch (error) {
    console.error('加载注册表单数据失败:', error)
    ElMessage.warning('加载幼儿园和班级数据失败，请刷新页面重试')
  }
}

// 处理角色变化
const handleRoleChange = (value) => {
  // 清除教师专用字段
  if (value !== 'teacher') {
    registerForm.kindergartenId = ''
    registerForm.classId = ''
    registerForm.teacherTitle = ''
    registerForm.teachingSubjects = []
  }

  // 清除验证错误
  if (registerFormRef.value) {
    registerFormRef.value.clearValidate(['kindergartenId', 'classId'])
  }
}

// 处理幼儿园变化
const handleKindergartenChange = (value) => {
  // 清除班级选择
  registerForm.classId = ''

  // 清除班级验证错误
  if (registerFormRef.value) {
    registerFormRef.value.clearValidate(['classId'])
  }
}

// 生成验证码
const generateCaptcha = () => {
  const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
  let result = ''
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 刷新验证码
const refreshCaptcha = () => {
  captchaCode.value = generateCaptcha()
}

// 处理注册
const handleRegister = async () => {
  if (!registerFormRef.value) return

  try {
    await registerFormRef.value.validate()
    registering.value = true

    // 构建注册数据
    const registerData = {
      username: registerForm.username,
      email: registerForm.email,
      phone: registerForm.phone || undefined,
      password: registerForm.password,
      role: registerForm.role,
      realName: registerForm.realName || registerForm.username,
    }

    // 如果是教师，添加教师专用字段
    if (registerForm.role === 'teacher') {
      registerData.kindergartenId = parseInt(registerForm.kindergartenId)
      registerData.classId = parseInt(registerForm.classId)
      registerData.teacherTitle = registerForm.teacherTitle || undefined
      registerData.teachingSubjects = registerForm.teachingSubjects.length > 0
        ? registerForm.teachingSubjects
        : undefined
    }

    console.log('提交注册数据:', registerData)

    // 调用注册API
    const response = await request.post('/auth/register', registerData)

    registering.value = false

    if (response.success) {
      const message = response.data.message || '注册成功！您的账户已创建，请等待管理员审核激活。'

      ElMessageBox.confirm(
        message,
        '注册成功',
        {
          confirmButtonText: '前往登录',
          cancelButtonText: '继续注册',
          type: 'success'
        }
      ).then(() => {
        goToLogin()
      }).catch(() => {
        // 重置表单
        resetForm()
      })
    } else {
      ElMessage.error(response.message || '注册失败')
    }

  } catch (error) {
    registering.value = false
    console.error('注册失败:', error)

    // 处理不同类型的错误
    let errorMessage = '注册失败，请重试'

    if (error.response) {
      const { data, status } = error.response

      if (status === 400) {
        errorMessage = data.message || '请求参数错误'
      } else if (status === 409) {
        errorMessage = data.message || '用户名或邮箱已存在'
      } else if (status === 500) {
        errorMessage = '服务器内部错误，请稍后重试'
      }
    } else if (error.message) {
      errorMessage = error.message
    }

    ElMessage.error(errorMessage)
  }
}

// 重置表单
const resetForm = () => {
  registerFormRef.value?.resetFields()
  Object.assign(registerForm, {
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '',
    captcha: '',
    agreement: false,
    // 教师专用字段
    kindergartenId: '',
    classId: '',
    teacherTitle: '',
    teachingSubjects: []
  })
  refreshCaptcha()
}

// 跳转到登录页
const goToLogin = () => {
  router.push('/login')
}

// 对话框关闭处理
const handleClose = (done) => {
  done()
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-gradient, linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%));
  padding: var(--text-2xl);
}

.register-card {
  width: 100%;
  max-width: 100%; max-width: 480px;
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  padding: var(--spacing-10xl);
  position: relative;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.register-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: var(--spacing-xs);
  background: var(--primary-gradient, linear-gradient(90deg, var(--primary-color), #764ba2));
}

.register-header {
  text-align: center;
  margin-bottom: var(--spacing-3xl);
}

.logo-section {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--text-3xl);
}

.logo {
  width: var(--icon-size); height: var(--icon-size);
  margin-right: var(--text-sm);
}

.system-title {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.register-title {
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.register-subtitle {
  color: var(--text-muted);
  font-size: var(--text-base);
  margin: 0;
}

.register-form {
  margin-top: var(--spacing-3xl);
}

.register-form .el-form-item {
  margin-bottom: var(--text-2xl);
}

.register-form .el-input {
  height: var(--button-height-xl);
}

.register-form .el-input__inner {
  height: var(--button-height-xl);
  line-height: var(--button-height-xl);
  border-radius: var(--radius-md);
  border: var(--border-width-base) solid var(--border-color);
  transition: all 0.3s;
}

.register-form .el-input__inner:focus {
  border-color: var(--primary-color);
  box-shadow: var(--focus-shadow);
}

.captcha-container {
  display: flex;
  align-items: center;
}

.captcha-code {
  max-width: 100px; width: 100%;
  height: var(--button-height-xl);
  background: var(--bg-secondary);
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--primary-color);
  cursor: pointer;
  user-select: none;
  transition: all 0.3s;
}

.captcha-code:hover {
  background: var(--primary-light);
  border-color: var(--primary-color);
}

.register-button {
  width: 100%;
  height: var(--button-height-xl);
  font-size: var(--text-lg);
  font-weight: 600;
  border-radius: var(--radius-md);
  background: var(--primary-gradient, linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%));
  border: none;
  transition: all 0.3s;
}

.register-button:hover {
  transform: translateY(var(--transform-hover-lift));
  box-shadow: var(--primary-shadow);
}

.login-link {
  text-align: center;
  margin-top: var(--text-3xl);
  color: var(--text-muted);
  font-size: var(--text-base);
}

.login-link .el-link {
  margin-left: var(--spacing-sm);
  font-weight: 600;
}

.terms-content,
.privacy-content {
  max-min-height: 60px; height: auto;
  overflow-y: auto;
  padding: var(--text-lg);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.terms-content h3,
.privacy-content h3 {
  color: var(--text-primary);
  font-size: var(--text-lg);
  margin: var(--text-lg) 0 var(--spacing-sm) 0;
}

.terms-content h3:first-child,
.privacy-content h3:first-child {
  margin-top: 0;
}

.terms-content p,
.privacy-content p {
  color: var(--text-secondary);
  font-size: var(--text-base);
  line-height: 1.6;
  margin: 0 0 var(--text-sm) 0;
}

@media (max-width: var(--breakpoint-md)) {
  .register-container {
    padding: var(--text-sm);
  }
  
  .register-card {
    padding: var(--text-3xl);
  }
  
  .register-title {
    font-size: var(--text-3xl);
  }
  
  .captcha-container {
    flex-direction: column;
    gap: var(--text-sm);
  }
  
  .captcha-code {
    width: 100%;
  }
}
</style>
