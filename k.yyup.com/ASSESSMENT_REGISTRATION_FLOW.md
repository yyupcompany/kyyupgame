# 测评流程 - 完成后生成报告时注册

## 🎯 目标

**实现测评流程**:
1. ✅ 匿名用户可以浏览测评目录
2. ✅ 匿名用户可以开始测评（无需登录）
3. ✅ 匿名用户可以完整填写测评问卷
4. ✅ 填写完毕后，生成报告时弹出注册框
5. ✅ 注册成功后自动登录并生成报告
6. ✅ 已登录用户直接生成报告

---

## 📊 用户流程

### 匿名用户流程
```
1. 访问系统 (无token)
   ↓
2. 浏览测评目录 (允许)
   ↓
3. 点击"开始测评"按钮 (允许，无需登录)
   ↓
4. 进入测评页面 (允许)
   ↓
5. 填写测评问卷 (允许)
   ↓
6. 点击"提交并生成报告"按钮
   ↓
7. 检查用户是否登录
   ├─ 未登录 → 弹出注册框
   ├─ 已登录 → 直接生成报告
   ↓
8. 填写注册信息
   ↓
9. 点击"注册并登录"
   ↓
10. 后端验证并创建账户
    ↓
11. 自动登录
    ↓
12. 生成报告
    ↓
13. 显示报告结果
```

### 已登录用户流程
```
1. 访问系统 (有token)
   ↓
2. 浏览测评目录 (允许)
   ↓
3. 点击"开始测评"按钮 (允许)
   ↓
4. 进入测评页面 (允许)
   ↓
5. 填写测评问卷 (允许)
   ↓
6. 点击"提交并生成报告"按钮
   ↓
7. 直接生成报告 (无需注册)
   ↓
8. 显示报告结果
```

---

## 🛠️ 实现步骤

### 第一步: 修改路由守卫 - 允许匿名访问测评

**文件**: `client/src/router/index.ts`

```typescript
// 修改路由守卫，允许匿名用户访问测评页面
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  let token = localStorage.getItem('kindergarten_token')
  
  // 允许匿名访问的页面列表
  const allowAnonymousPages = [
    '/login',
    '/403',
    '/404',
    '/500',
    '/error',
    '/assessment',              // 测评目录
    '/assessment-detail',       // 测评详情
    '/assessment/:id',          // 测评页面（允许匿名）
    '/parent-center',           // 家长中心（只读）
    '/parent-center/child',     // 孩子信息（只读）
    '/parent-center/growth',    // 成长记录（只读）
  ]
  
  // 检查是否是允许匿名访问的页面
  const isAnonymousAllowed = allowAnonymousPages.some(path => {
    if (path.includes(':')) {
      // 处理动态路由
      const regex = new RegExp('^' + path.replace(/:[^/]+/g, '[^/]+') + '$')
      return regex.test(to.path)
    }
    return to.path.startsWith(path)
  })
  
  // 如果是允许匿名访问的页面，直接通过
  if (isAnonymousAllowed) {
    return next()
  }
  
  // 其他页面需要登录
  if (\!token) {
    return next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
  
  // 继续原有的权限检查...
  next()
})
```

### 第二步: 创建测评页面组件

**文件**: `client/src/pages/parent-center/assessment-detail.vue`

```vue
<template>
  <div class="assessment-page">
    <\!-- 测评标题 -->
    <div class="assessment-header">
      <h1>{{ assessment.title }}</h1>
      <p>{{ assessment.description }}</p>
    </div>

    <\!-- 测评问卷 -->
    <div v-if="\!submitted" class="assessment-form">
      <el-form
        ref="formRef"
        :model="answers"
        label-width="auto"
      >
        <div v-for="(question, index) in assessment.questions" :key="question.id" class="question-item">
          <el-form-item :label="`${index + 1}. ${question.text}`" :prop="`q${question.id}`">
            <el-radio-group v-model="answers[`q${question.id}`]">
              <el-radio 
                v-for="option in question.options" 
                :key="option.id"
                :label="option.value"
              >
                {{ option.text }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </div>
      </el-form>

      <\!-- 提交按钮 -->
      <div class="form-actions">
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          提交并生成报告
        </el-button>
      </div>
    </div>

    <\!-- 测评结果 -->
    <div v-else class="assessment-result">
      <el-result
        icon="success"
        title="测评完成"
        sub-title="您的测评已提交，报告已生成"
      >
        <template #extra>
          <el-button type="primary" @click="viewReport">查看报告</el-button>
          <el-button @click="handleReset">重新测评</el-button>
        </template>
      </el-result>
    </div>

    <\!-- 注册弹框 -->
    <RegisterModal
      ref="registerModal"
      @success="handleRegisterSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import RegisterModal from '@/components/RegisterModal.vue'
import { getAssessment, submitAssessment } from '@/api/modules/assessment'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const registerModal = ref()
const formRef = ref()

const assessmentId = route.params.id as string
const assessment = ref<any>(null)
const answers = reactive<Record<string, any>>({})
const submitted = ref(false)
const submitting = ref(false)
const reportId = ref<string>('')

// 加载测评
onMounted(async () => {
  try {
    const res = await getAssessment(assessmentId)
    if (res.success) {
      assessment.value = res.data
      // 初始化答案对象
      assessment.value.questions.forEach((q: any) => {
        answers[`q${q.id}`] = ''
      })
    }
  } catch (error) {
    ElMessage.error('加载测评失败')
  }
})

// 重置表单
const handleReset = () => {
  submitted.value = false
  formRef.value?.resetFields()
  assessment.value.questions.forEach((q: any) => {
    answers[`q${q.id}`] = ''
  })
}

// 提交测评
const handleSubmit = async () => {
  if (\!formRef.value) return

  try {
    // 验证表单
    await formRef.value.validate()

    submitting.value = true

    // 检查用户是否登录
    if (\!userStore.isAuthenticated) {
      // 未登录，弹出注册框
      ElMessage.info('请先注册账户以保存您的测评报告')
      registerModal.value?.open()
      return
    }

    // 已登录，直接提交
    await submitAssessmentAndGenerateReport()
  } catch (error: any) {
    ElMessage.error(error.message || '提交失败')
  } finally {
    submitting.value = false
  }
}

// 提交测评并生成报告
const submitAssessmentAndGenerateReport = async () => {
  try {
    const res = await submitAssessment({
      assessment_id: assessmentId,
      answers: answers,
      user_id: userStore.user?.id
    })

    if (res.success) {
      reportId.value = res.data.report_id
      submitted.value = true
      ElMessage.success('测评已提交，报告已生成')
    } else {
      throw new Error(res.message || '提交失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '生成报告失败')
  }
}

// 注册成功后的回调
const handleRegisterSuccess = async () => {
  ElMessage.success('注册成功，正在生成报告...')
  // 注册成功后，userStore已经更新，直接提交
  await submitAssessmentAndGenerateReport()
}

// 查看报告
const viewReport = () => {
  router.push(`/assessment-report/${reportId.value}`)
}
</script>

<style scoped lang="scss">
.assessment-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;

  .assessment-header {
    margin-bottom: 30px;
    text-align: center;

    h1 {
      font-size: 24px;
      margin-bottom: 10px;
    }

    p {
      color: #666;
      font-size: 14px;
    }
  }

  .assessment-form {
    background: #fff;
    padding: 20px;
    border-radius: 4px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

    .question-item {
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid #eee;

      &:last-child {
        border-bottom: none;
      }
    }

    .form-actions {
      margin-top: 30px;
      text-align: center;

      .el-button {
        margin: 0 10px;
      }
    }
  }

  .assessment-result {
    background: #fff;
    padding: 40px;
    border-radius: 4px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    text-align: center;
  }
}
</style>
```

### 第三步: 修改注册弹框 - 支持测评场景

**文件**: `client/src/components/RegisterModal.vue`

```vue
<template>
  <el-dialog
    v-model="visible"
    title="注册账户"
    width="500px"
    @close="handleClose"
  >
    <div class="register-tip">
      <el-alert
        title="保存您的测评报告"
        type="info"
        description="注册账户后，您的测评报告将被保存，您可以随时查看和分享"
        :closable="false"
      />
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" placeholder="请输入用户名" />
      </el-form-item>
      
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" placeholder="请输入邮箱" />
      </el-form-item>
      
      <el-form-item label="密码" prop="password">
        <el-input v-model="form.password" type="password" placeholder="请输入密码" />
      </el-form-item>
      
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input v-model="form.confirmPassword" type="password" placeholder="请确认密码" />
      </el-form-item>
      
      <el-form-item label="真实姓名" prop="realName">
        <el-input v-model="form.realName" placeholder="请输入真实姓名" />
      </el-form-item>
      
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入手机号" />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleRegister" :loading="loading">
        注册并保存报告
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { register, login } from '@/api/modules/user'

const emit = defineEmits(['success', 'close'])
const userStore = useUserStore()

const visible = ref(false)
const loading = ref(false)
const formRef = ref()

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  realName: '',
  phone: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度3-20个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value \!== form.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ]
}

const open = () => {
  visible.value = true
}

const handleClose = () => {
  visible.value = false
  emit('close')
}

const handleRegister = async () => {
  if (\!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    loading.value = true
    
    // 1. 注册
    const registerRes = await register({
      username: form.username,
      email: form.email,
      password: form.password,
      real_name: form.realName,
      phone: form.phone,
      role: 'parent'
    })
    
    if (\!registerRes.success) {
      throw new Error(registerRes.message || '注册失败')
    }
    
    ElMessage.success('注册成功，正在登录...')
    
    // 2. 自动登录
    const loginRes = await login({
      username: form.username,
      password: form.password
    })
    
    if (\!loginRes.success) {
      throw new Error(loginRes.message || '登录失败')
    }
    
    // 3. 保存token和用户信息
    localStorage.setItem('kindergarten_token', loginRes.data.token)
    localStorage.setItem('kindergarten_user_info', JSON.stringify(loginRes.data.userInfo))
    
    // 4. 更新用户store
    await userStore.setUser(loginRes.data.userInfo)
    
    ElMessage.success('登录成功')
    
    // 5. 关闭弹框并触发成功事件
    visible.value = false
    emit('success')
    
  } catch (error: any) {
    ElMessage.error(error.message || '注册失败')
  } finally {
    loading.value = false
  }
}

defineExpose({
  open
})
</script>

<style scoped lang="scss">
.register-tip {
  margin-bottom: 20px;
}
</style>
```

---

## 📋 需要修改的文件清单

### 前端修改
1. ✅ `client/src/router/index.ts` - 修改路由守卫，允许匿名访问测评页面
2. ✅ `client/src/pages/parent-center/assessment-detail.vue` - 创建测评页面
3. ✅ `client/src/components/RegisterModal.vue` - 修改注册弹框
4. ✅ `client/src/api/modules/assessment.ts` - 添加测评API

### 后端修改
1. ✅ `server/src/routes/assessment.ts` - 添加测评路由
2. ✅ `server/src/controllers/assessment.controller.ts` - 实现测评逻辑
3. ✅ `server/src/services/assessment.service.ts` - 测评业务逻辑

---

## 🎯 关键流程

### 1. 浏览测评目录
- ✅ 允许匿名访问
- ✅ 显示所有测评

### 2. 开始测评
- ✅ 允许匿名访问
- ✅ 无需登录

### 3. 填写测评问卷
- ✅ 允许匿名填写
- ✅ 前端验证

### 4. 提交并生成报告
- ✅ 检查用户是否登录
- ✅ 未登录 → 弹出注册框
- ✅ 已登录 → 直接生成报告

### 5. 注册并保存报告
- ✅ 注册成功
- ✅ 自动登录
- ✅ 生成报告
- ✅ 显示报告

---

## 📊 允许匿名访问的页面

### ✅ 允许匿名访问（完全功能）
- `/assessment` - 测评目录
- `/assessment-detail/:id` - 测评详情
- `/assessment/:id` - 测评页面（可以完整填写）

### ⚠️ 需要登录才能保存（生成报告）
- 提交测评时需要登录
- 如果未登录，弹出注册框

---

## 💡 关键点

1. **测评页面允许匿名访问** - 用户可以完整填写问卷
2. **生成报告时检查登录状态** - 未登录则弹出注册框
3. **注册成功后自动登录** - 无缝体验
4. **自动生成报告** - 注册成功后立即生成
5. **报告与用户关联** - 已登录用户的报告被保存

---

**方案完成**: 2025-11-14 ✅  
**状态**: 就绪  
**优先级**: 🔴 高
