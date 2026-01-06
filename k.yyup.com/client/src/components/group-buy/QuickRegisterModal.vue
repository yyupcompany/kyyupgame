<template>
  <el-dialog
    v-model="visible"
    title="快速注册参团"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="quick-register-modal">
      <div class="tip-section">
        <el-alert
          title="仅需填写简单信息即可享受拼团优惠"
          type="success"
          :closable="false"
          show-icon
        />
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
        class="register-form"
      >
        <el-form-item label="姓名" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入您的姓名"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <div class="phone-input-wrapper">
            <el-input
              v-model="form.phone"
              placeholder="请输入手机号"
              :prefix-icon="Phone"
              clearable
              maxlength="11"
              style="flex: 1"
            />
            <el-button
              :disabled="codeSending || countdown > 0"
              :loading="codeSending"
              @click="handleSendCode"
              style="margin-left: 12px; width: 120px"
            >
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="验证码" prop="verificationCode">
          <el-input
            v-model="form.verificationCode"
            placeholder="请输入验证码"
            clearable
            maxlength="6"
          />
        </el-form-item>

        <el-form-item label="孩子姓名" prop="childName">
          <el-input
            v-model="form.childName"
            placeholder="选填，方便后续关联"
            clearable
          />
        </el-form-item>

        <el-form-item label="孩子年龄" prop="childAge">
          <el-input-number
            v-model="form.childAge"
            :min="0"
            :max="10"
            placeholder="选填"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item prop="agreement">
          <el-checkbox v-model="form.agreement">
            我已阅读并同意
            <el-link type="primary" @click.prevent="showAgreement = true">
              《用户协议》
            </el-link>
            和
            <el-link type="primary" @click.prevent="showPrivacy = true">
              《隐私政策》
            </el-link>
          </el-checkbox>
        </el-form-item>
      </el-form>

      <div class="login-link">
        已有账号？
        <el-link type="primary" @click="handleGoLogin">
          直接登录
        </el-link>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button
        type="primary"
        :loading="submitting"
        @click="handleSubmit"
      >
        立即参团
      </el-button>
    </template>

    <!-- 用户协议弹窗 -->
    <el-dialog
      v-model="showAgreement"
      title="用户协议"
      width="600px"
      append-to-body
    >
      <div class="agreement-content">
        <p>这是用户协议内容...</p>
      </div>
    </el-dialog>

    <!-- 隐私政策弹窗 -->
    <el-dialog
      v-model="showPrivacy"
      title="隐私政策"
      width="600px"
      append-to-body
    >
      <div class="privacy-content">
        <p>这是隐私政策内容...</p>
      </div>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { User, Phone } from '@element-plus/icons-vue'
import { request } from '@/utils/request'
import { useUserStore } from '@/stores/user'

interface Props {
  modelValue: boolean
  groupBuyId: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'success': []
}>()

const router = useRouter()
const userStore = useUserStore()

const visible = ref(props.modelValue)
const formRef = ref<FormInstance>()
const submitting = ref(false)
const showAgreement = ref(false)
const showPrivacy = ref(false)

const form = ref({
  name: '',
  phone: '',
  verificationCode: '',  // 短信验证码
  childName: '',
  childAge: undefined as number | undefined,
  agreement: false
})

// 验证码状态
const codeSending = ref(false)
const countdown = ref(0)
let countdownTimer: ReturnType<typeof setInterval> | null = null

// 表单验证规则
const validatePhone = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('请输入手机号'))
  } else if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('请输入正确的手机号'))
  } else {
    callback()
  }
}

const validateAgreement = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('请阅读并同意用户协议和隐私政策'))
  } else {
    callback()
  }
}

const rules: FormRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在2-20个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, validator: validatePhone, trigger: 'blur' }
  ],
  verificationCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位数字', trigger: 'blur' }
  ],
  agreement: [
    { required: true, validator: validateAgreement, trigger: 'change' }
  ]
}

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
  // 关闭时清理倒计时
  if (!val && countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
    countdown.value = 0
  }
})

// 发送验证码
const handleSendCode = async () => {
  // 验证手机号格式
  if (!/^1[3-9]\d{9}$/.test(form.value.phone)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }

  try {
    codeSending.value = true
    
    // 调用短信代理API（代理到统一认证中心）
    const response = await request.post('/api/sms/send-code', {
      phone: form.value.phone,
      type: 'group_buy_register',
      scene: '团购快速注册'
    })

    if (response.success) {
      ElMessage.success('验证码已发送')
      
      // 开始倒计时60秒
      countdown.value = 60
      countdownTimer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0 && countdownTimer) {
          clearInterval(countdownTimer)
          countdownTimer = null
        }
      }, 1000)
    } else {
      ElMessage.error(response.message || '发送失败，请重试')
    }
  } catch (error: any) {
    console.error('发送验证码失败:', error)
    ElMessage.error(error.message || '发送失败，请重试')
  } finally {
    codeSending.value = false
  }
}

// 提交注册
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    submitting.value = true

    // 调用验证码注册API（代理到统一认证中心）
    const response = await request.post('/api/auth/register-by-code', {
      name: form.value.name,
      phone: form.value.phone,
      verificationCode: form.value.verificationCode,
      childName: form.value.childName || undefined,
      childAge: form.value.childAge || undefined,
      source: 'group_buy',
      referenceId: props.groupBuyId
    })

    if (response.success) {
      // 保存用户信息
      userStore.setToken(response.data.token)
      userStore.setUser(response.data.userInfo)

      ElMessage.success('注册成功！')
      emit('success')
      handleClose()
    } else {
      ElMessage.error(response.message || '注册失败，请重试')
    }
  } catch (error: any) {
    console.error('注册失败:', error)
    ElMessage.error(error.message || '注册失败，请重试')
  } finally {
    submitting.value = false
  }
}

// 关闭弹窗
const handleClose = () => {
  visible.value = false
  formRef.value?.resetFields()
  
  // 清理倒计时
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
    countdown.value = 0
  }
}

// 跳转登录
const handleGoLogin = () => {
  handleClose()
  router.push({
    path: '/login',
    query: { redirect: router.currentRoute.value.fullPath }
  })
}
</script>

<style scoped lang="scss">
.quick-register-modal {
  .tip-section {
    margin-bottom: 20px;
  }

  .register-form {
    margin-top: 20px;

    .phone-input-wrapper {
      display: flex;
      align-items: center;
      width: 100%;
    }
  }

  .login-link {
    text-align: center;
    margin-top: 16px;
    color: #909399;
  }
}

.agreement-content,
.privacy-content {
  max-height: 400px;
  overflow-y: auto;
  padding: var(--spacing-md);
  line-height: 1.8;

  p {
    margin-bottom: 12px;
  }
}
</style>
