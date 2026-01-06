<template>
  <div class="mobile-register-container">
    <div class="register-content">
      <!-- 顶部标题 -->
      <div class="register-header">
        <van-icon name="arrow-left" class="back-icon" @click="goBack" />
        <h1>用户注册</h1>
        <p class="subtitle">{{ tenantName }}</p>
      </div>

      <!-- 步骤指示器 -->
      <van-steps :active="currentStep" class="register-steps">
        <van-step>选择角色</van-step>
        <van-step>填写信息</van-step>
        <van-step>完成注册</van-step>
      </van-steps>

      <!-- 步骤1: 选择角色 -->
      <div v-if="currentStep === 0" class="step-content">
        <div class="role-cards">
          <div
            v-for="role in availableRoles"
            :key="role.code"
            class="role-card"
            :class="{ selected: selectedRole === role.code }"
            @click="selectRole(role.code)"
          >
            <div class="role-icon">{{ role.icon }}</div>
            <div class="role-info">
              <h4>{{ role.name }}</h4>
              <p>{{ role.description }}</p>
            </div>
            <div class="role-check" v-if="selectedRole === role.code">✓</div>
          </div>
        </div>
        <van-button block type="primary" :disabled="!selectedRole" @click="nextStep">
          下一步
        </van-button>
      </div>

      <!-- 步骤2: 填写信息 -->
      <div v-if="currentStep === 1" class="step-content">
        <van-form ref="formRef" @submit="handleSubmit">
          <!-- 手机号 -->
          <van-field
            v-model="formData.phone"
            label="手机号"
            placeholder="请输入手机号"
            :rules="[{ required: true, message: '请输入手机号' }]"
            readonly
          />

          <!-- 姓名 -->
          <van-field
            v-model="formData.realName"
            label="姓名"
            placeholder="请输入您的姓名"
            :rules="[{ required: true, message: '请输入姓名' }]"
          />

          <!-- 幼儿园选择 -->
          <van-field
            v-if="selectedRole !== 'principal'"
            v-model="formData.kindergartenName"
            is-link
            readonly
            label="幼儿园"
            placeholder="请选择幼儿园"
            :rules="[{ required: true, message: '请选择幼儿园' }]"
            @click="showKindergartenPicker = true"
          />

          <!-- 班级选择 -->
          <van-field
            v-if="selectedRole !== 'principal'"
            v-model="formData.className"
            is-link
            readonly
            label="班级"
            placeholder="请选择班级"
            :rules="[{ required: true, message: '请选择班级' }]"
            :disabled="!formData.kindergartenId"
            @click="formData.kindergartenId && (showClassPicker = true)"
          />

          <!-- 教师特有字段 -->
          <template v-if="selectedRole === 'teacher'">
            <van-field v-model="formData.teacherTitle" label="职称" placeholder="如：主班教师" />
          </template>

          <!-- 家长特有字段 -->
          <template v-if="selectedRole === 'parent'">
            <van-field
              v-model="formData.childName"
              label="孩子姓名"
              placeholder="请输入孩子姓名"
              :rules="[{ required: true, message: '请输入孩子姓名' }]"
            />
            <van-field
              v-model="formData.childRelationName"
              is-link
              readonly
              label="与孩子关系"
              placeholder="请选择关系"
              @click="showRelationPicker = true"
            />
          </template>

          <div class="form-actions">
            <van-button plain @click="prevStep">上一步</van-button>
            <van-button type="primary" :loading="loading" native-type="submit">
              提交注册
            </van-button>
          </div>
        </van-form>
      </div>

      <!-- 步骤3: 完成注册 -->
      <div v-if="currentStep === 2" class="step-content success-content">
        <div class="success-icon">🎉</div>
        <h2>注册成功！</h2>
        <p v-if="approvalStatus === 'pending'" class="pending-tip">
          您的申请已提交，请等待管理员审核通过后即可使用完整功能。
        </p>
        <p v-else class="approved-tip">
          欢迎加入{{ tenantName }}！
        </p>
        <van-button block type="primary" @click="goToHome">
          进入首页
        </van-button>
      </div>
    </div>

    <!-- 幼儿园选择器 -->
    <van-popup v-model:show="showKindergartenPicker" position="bottom" round>
      <van-picker
        :columns="kindergartenColumns"
        @confirm="onKindergartenConfirm"
        @cancel="showKindergartenPicker = false"
      />
    </van-popup>

    <!-- 班级选择器 -->
    <van-popup v-model:show="showClassPicker" position="bottom" round>
      <van-picker
        :columns="classColumns"
        @confirm="onClassConfirm"
        @cancel="showClassPicker = false"
      />
    </van-popup>

    <!-- 关系选择器 -->
    <van-popup v-model:show="showRelationPicker" position="bottom" round>
      <van-picker
        :columns="relationColumns"
        @confirm="onRelationConfirm"
        @cancel="showRelationPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import type { FormInstance } from 'vant'
import { useAuthStore } from '@/store/modules/auth'
import { useUserStore } from '@/stores/user'
import { kindergartenApi } from '@/api/modules/kindergarten'

const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()
const formRef = ref<FormInstance>()
const loading = ref(false)
const currentStep = ref(0)
const selectedRole = ref<string>('')
const approvalStatus = ref<string>('pending')

// 选择器状态
const showKindergartenPicker = ref(false)
const showClassPicker = ref(false)
const showRelationPicker = ref(false)

// 数据
const kindergartens = ref<any[]>([])
const classes = ref<any[]>([])

// 租户信息
const tenantName = computed(() => authStore.pendingRegistration?.tenantName || '幼儿园')

// 可用角色
const availableRoles = computed(() => {
  const allRoles = [
    { code: 'principal', name: '园长', icon: '👨‍💼', description: '管理园所的全部事务' },
    { code: 'teacher', name: '教师', icon: '👩‍🏫', description: '负责班级教学和管理' },
    { code: 'parent', name: '家长', icon: '👨‍👩‍👧', description: '查看孩子的成长记录' }
  ]
  const codes = authStore.pendingRegistration?.availableRoles || ['principal', 'teacher', 'parent']
  return allRoles.filter(r => codes.includes(r.code))
})

// 表单数据
const formData = ref({
  phone: authStore.pendingRegistration?.phone || '',
  realName: authStore.pendingRegistration?.realName || '',
  kindergartenId: null as number | null,
  kindergartenName: '',
  classId: null as number | null,
  className: '',
  teacherTitle: '',
  childName: '',
  childRelation: 'parent',
  childRelationName: ''
})

// 选择器列数据
const kindergartenColumns = computed(() =>
  kindergartens.value.map(k => ({ text: k.name, value: k.id }))
)

const classColumns = computed(() =>
  classes.value.map(c => ({ text: c.name, value: c.id }))
)

const relationColumns = [
  { text: '父亲', value: 'father' },
  { text: '母亲', value: 'mother' },
  { text: '爷爷', value: 'grandfather' },
  { text: '奶奶', value: 'grandmother' },
  { text: '其他', value: 'other' }
]

// 选择角色
const selectRole = (roleCode: string) => {
  selectedRole.value = roleCode
}

// 下一步
const nextStep = () => {
  if (currentStep.value < 2) {
    currentStep.value++
  }
}

// 上一步
const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// 返回
const goBack = () => {
  if (currentStep.value > 0) {
    prevStep()
  } else {
    router.back()
  }
}

// 幼儿园选择确认
const onKindergartenConfirm = async ({ selectedOptions }: any) => {
  const selected = selectedOptions[0]
  formData.value.kindergartenId = selected.value
  formData.value.kindergartenName = selected.text
  formData.value.classId = null
  formData.value.className = ''
  showKindergartenPicker.value = false

  // 加载班级
  try {
    const res = await kindergartenApi.getKindergartenClasses(selected.value)
    classes.value = res.data?.items || res.data || []
  } catch (error) {
    console.error('加载班级失败:', error)
  }
}

// 班级选择确认
const onClassConfirm = ({ selectedOptions }: any) => {
  const selected = selectedOptions[0]
  formData.value.classId = selected.value
  formData.value.className = selected.text
  showClassPicker.value = false
}

// 关系选择确认
const onRelationConfirm = ({ selectedOptions }: any) => {
  const selected = selectedOptions[0]
  formData.value.childRelation = selected.value
  formData.value.childRelationName = selected.text
  showRelationPicker.value = false
}

// 加载幼儿园列表
const loadKindergartens = async () => {
  try {
    const res = await kindergartenApi.getKindergartenList()
    kindergartens.value = res.data?.items || res.data || []
  } catch (error) {
    console.error('加载幼儿园失败:', error)
  }
}

// 提交注册
const handleSubmit = async () => {
  loading.value = true
  try {
    const result = await authStore.completeRegistration({
      role: selectedRole.value,
      realName: formData.value.realName,
      kindergartenId: formData.value.kindergartenId || undefined,
      classId: formData.value.classId || undefined,
      teacherTitle: formData.value.teacherTitle || undefined,
      childName: formData.value.childName || undefined,
      childRelation: formData.value.childRelation || undefined
    })

    approvalStatus.value = result?.approvalStatus || 'pending'
    currentStep.value = 2
    showToast({ type: 'success', message: '注册成功！' })
  } catch (error: any) {
    showToast({ type: 'fail', message: error.message || '注册失败' })
  } finally {
    loading.value = false
  }
}

// 进入首页
const goToHome = async () => {
  // 保存用户信息
  const currentUser = authStore.user
  if (currentUser) {
    const normalizedRole = (currentUser.role || 'user').toLowerCase()
    const userInfo = {
      token: authStore.token,
      username: currentUser.username || '',
      displayName: currentUser.realName || currentUser.username || '',
      role: normalizedRole,
      roles: currentUser.roles || [currentUser.role],
      permissions: currentUser.permissions || [],
      email: currentUser.email,
      avatar: currentUser.avatar,
      id: currentUser.id,
      isAdmin: normalizedRole === 'admin',
      status: 'active'
    }

    userStore.setUserInfo(userInfo)
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
    localStorage.setItem('kindergarten_token', authStore.token || '')
    localStorage.setItem('access_token', authStore.token || '')
    localStorage.setItem('user_role', normalizedRole)
  }

  await router.replace('/mobile/ai-chat')
}

// 初始化
onMounted(() => {
  // 检查是否有待注册信息
  if (!authStore.pendingRegistration) {
    showToast('请先登录')
    router.replace('/mobile/login')
    return
  }

  formData.value.phone = authStore.pendingRegistration.phone || ''
  formData.value.realName = authStore.pendingRegistration.realName || ''

  loadKindergartens()
})
</script>

<style scoped lang="scss">
.mobile-register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-content {
  background: white;
  border-radius: 16px;
  padding: 24px;
  min-height: calc(100vh - 40px);
}

.register-header {
  text-align: center;
  margin-bottom: 24px;
  position: relative;

  .back-icon {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    font-size: 24px;
    cursor: pointer;
  }

  h1 {
    font-size: 24px;
    color: #323233;
    margin-bottom: 8px;
  }

  .subtitle {
    color: #969799;
    font-size: 14px;
  }
}

.register-steps {
  margin-bottom: 24px;
}

.step-content {
  padding: 16px 0;
}

.role-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;

  .role-card {
    display: flex;
    align-items: center;
    padding: 16px;
    border: 2px solid #ebedf0;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s;
    position: relative;

    &.selected {
      border-color: #1989fa;
      background: #ecf5ff;
    }

    .role-icon {
      font-size: 36px;
      margin-right: 16px;
    }

    .role-info {
      flex: 1;

      h4 {
        font-size: 16px;
        color: #323233;
        margin-bottom: 4px;
      }

      p {
        font-size: 13px;
        color: #969799;
      }
    }

    .role-check {
      width: 24px;
      height: 24px;
      background: #1989fa;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    }
  }
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;

  .van-button {
    flex: 1;
  }
}

.success-content {
  text-align: center;
  padding: 40px 20px;

  .success-icon {
    font-size: 64px;
    margin-bottom: 16px;
  }

  h2 {
    font-size: 24px;
    color: #323233;
    margin-bottom: 12px;
  }

  .pending-tip {
    color: #ff976a;
    font-size: 14px;
    margin-bottom: 24px;
  }

  .approved-tip {
    color: #07c160;
    font-size: 14px;
    margin-bottom: 24px;
  }
}
</style>

