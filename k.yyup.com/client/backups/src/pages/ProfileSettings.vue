<template>
  <div class="profile-settings-container">
    <!-- 页面头部 -->
    <div class="settings-header">
      <div class="header-content">
        <div class="page-title">
          <h1>个人设置</h1>
          <p>管理您的基本账户设置</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="saveSettings" :loading="saving">
            <el-icon><Check /></el-icon>
            保存更改
          </el-button>
        </div>
      </div>
    </div>

    <!-- 设置内容 -->
    <div class="settings-content">
      <el-row :gutter="24">
        <!-- 个人信息设置 -->
        <el-col :span="24">
          <div class="settings-panel">
            <!-- 基本信息 -->
            <div class="setting-section">
              <el-card shadow="never">
                <template #header>
                  <div class="section-header">
                    <h3>基本信息</h3>
                    <p>管理您的基本账户信息</p>
                  </div>
                </template>

                <el-form :model="userForm" label-width="120px" :rules="userRules" ref="userFormRef">
                  <el-form-item label="用户名" prop="username">
                    <el-input v-model="userForm.username" disabled>
                      <template #suffix>
                        <el-tooltip content="用户名不可修改" placement="top">
                          <el-icon><InfoFilled /></el-icon>
                        </el-tooltip>
                      </template>
                    </el-input>
                  </el-form-item>

                  <el-form-item label="真实姓名" prop="realName">
                    <el-input v-model="userForm.realName" placeholder="请输入真实姓名" />
                  </el-form-item>

                  <el-form-item label="邮箱地址" prop="email">
                    <el-input v-model="userForm.email" placeholder="请输入邮箱地址" />
                  </el-form-item>

                  <el-form-item label="手机号码" prop="phone">
                    <el-input v-model="userForm.phone" placeholder="请输入手机号码" />
                  </el-form-item>
                </el-form>
              </el-card>
            </div>

            <!-- 密码修改 -->
            <div class="setting-section">
              <el-card shadow="never">
                <template #header>
                  <div class="section-header">
                    <h3>密码修改</h3>
                    <p>定期更换密码以保护账户安全</p>
                  </div>
                </template>

                <el-form :model="passwordForm" label-width="120px" :rules="passwordRules" ref="passwordFormRef">
                  <el-form-item label="当前密码" prop="currentPassword">
                    <el-input v-model="passwordForm.currentPassword" type="password" show-password placeholder="请输入当前密码" />
                  </el-form-item>

                  <el-form-item label="新密码" prop="newPassword">
                    <el-input v-model="passwordForm.newPassword" type="password" show-password placeholder="请输入新密码" />
                  </el-form-item>

                  <el-form-item label="确认密码" prop="confirmPassword">
                    <el-input v-model="passwordForm.confirmPassword" type="password" show-password placeholder="请再次输入新密码" />
                  </el-form-item>

                  <el-form-item>
                    <el-button type="primary" @click="changePassword" :loading="changingPassword">
                      修改密码
                    </el-button>
                    <el-button @click="resetPasswordForm">重置</el-button>
                  </el-form-item>
                </el-form>
              </el-card>
            </div>


          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElForm } from 'element-plus'
import { Check, InfoFilled } from '@element-plus/icons-vue'

// 路由
const router = useRouter()

// 响应式数据
const saving = ref(false)
const changingPassword = ref(false)
const userFormRef = ref<InstanceType<typeof ElForm>>()
const passwordFormRef = ref<InstanceType<typeof ElForm>>()

// 表单数据
const userForm = reactive({
  username: 'admin',
  realName: '管理员',
  email: 'admin@example.com',
  phone: '13800138000'
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单验证规则
const userRules = {
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 方法
const saveSettings = async () => {
  if (!userFormRef.value) return

  try {
    await userFormRef.value.validate()
    saving.value = true

    // 模拟保存API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('个人信息保存成功')
  } catch (error) {
    ElMessage.error('保存失败，请检查输入信息')
  } finally {
    saving.value = false
  }
}

const changePassword = async () => {
  if (!passwordFormRef.value) return

  try {
    await passwordFormRef.value.validate()
    changingPassword.value = true

    // 模拟修改密码API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('密码修改成功')
    resetPasswordForm()
  } catch (error) {
    ElMessage.error('密码修改失败，请检查输入信息')
  } finally {
    changingPassword.value = false
  }
}

const resetPasswordForm = () => {
  Object.assign(passwordForm, {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  passwordFormRef.value?.clearValidate()
}

// 生命周期
onMounted(() => {
  // 加载用户基本信息
  console.log('加载用户基本信息')
})
</script>

<style lang="scss">
.profile-settings-container {
  padding: var(--text-2xl);
  max-width: 1400px;
  margin: 0 auto;
}

.settings-header {
  margin-bottom: var(--text-3xl);
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    
    .page-title {
      h1 {
        font-size: var(--text-3xl);
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 var(--spacing-sm) 0;
      }
      
      p {
        color: var(--text-secondary);
        margin: 0;
      }
    }
    
    .header-actions {
      display: flex;
      gap: var(--text-sm);
    }
  }
}

.settings-content {
  .settings-panel {
    .setting-section {
      margin-bottom: var(--text-3xl);

      .section-header {
        h3 {
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 var(--spacing-sm) 0;
        }

        p {
          color: var(--text-secondary);
          margin: 0;
        }
      }
    }
  }
}



@media (max-width: var(--breakpoint-md)) {
  .profile-settings-container {
    padding: var(--text-lg);
  }

  .settings-header .header-content {
    flex-direction: column;
    gap: var(--text-lg);
    align-items: flex-start;
  }
}
</style>
