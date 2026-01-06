# 匿名访问方案 - 家长可以浏览但需要注册才能操作

## 🎯 目标

**实现匿名访问流程**:
1. ✅ 匿名用户可以浏览测评目录和所有功能页面
2. ✅ 匿名用户点击操作按钮时弹出注册框
3. ✅ 注册成功后自动登录并继续操作
4. ✅ 已登录用户正常使用所有功能

---

## 📊 实现方案

### 方案概述

```
访问系统
  ├─ 有token → 正常登录用户 → 所有功能可用
  ├─ 无token → 匿名用户
  │   ├─ 浏览页面 → 允许访问（只读）
  │   ├─ 点击操作按钮 → 弹出注册框
  │   ├─ 注册成功 → 自动登录
  │   └─ 继续操作 → 正常使用
  └─ 特殊页面 → 始终需要登录
      ├─ /login → 登录页
      ├─ /403 → 权限不足
      ├─ /404 → 页面不存在
      └─ /500 → 服务器错误
```

---

## 🛠️ 实现步骤

### 第一步: 修改路由守卫 - 允许匿名访问

**文件**: `client/src/router/index.ts`

**修改内容**:
```typescript
// 修改路由守卫，允许匿名用户访问特定页面
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
    '/assessment',           // 测评目录
    '/assessment-detail',    // 测评详情
    '/parent-center',        // 家长中心（只读）
    '/parent-center/child',  // 孩子信息（只读）
    '/parent-center/growth', // 成长记录（只读）
  ]
  
  // 检查是否是允许匿名访问的页面
  const isAnonymousAllowed = allowAnonymousPages.some(path => to.path.startsWith(path))
  
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

### 第二步: 创建注册弹框组件

**文件**: `client/src/components/RegisterModal.vue`

```vue
<template>
  <el-dialog
    v-model="visible"
    title="注册账户"
    width="500px"
    @close="handleClose"
  >
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
        注册并登录
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
```

### 第三步: 创建操作拦截指令

**文件**: `client/src/directives/require-auth.ts`

```typescript
import { DirectiveBinding } from 'vue'
import { useUserStore } from '@/stores/user'

export const vRequireAuth = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const userStore = useUserStore()
    
    // 如果用户已登录，不做任何处理
    if (userStore.isAuthenticated) {
      return
    }
    
    // 如果用户未登录，添加点击拦截
    el.addEventListener('click', (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      
      // 触发注册弹框
      const registerModal = binding.value
      if (typeof registerModal === 'function') {
        registerModal()
      }
    })
    
    // 添加样式提示
    el.style.cursor = 'pointer'
    el.style.opacity = '0.7'
  }
}
```

### 第四步: 在页面中使用

**文件**: `client/src/pages/parent-center/assessment.vue`

```vue
<template>
  <div class="assessment-page">
    <\!-- 测评列表 -->
    <div class="assessment-list">
      <div 
        v-for="item in assessments" 
        :key="item.id"
        class="assessment-card"
      >
        <h3>{{ item.title }}</h3>
        <p>{{ item.description }}</p>
        
        <\!-- 操作按钮 - 需要登录 -->
        <el-button
          v-require-auth="openRegisterModal"
          type="primary"
          @click="handleStartAssessment(item.id)"
        >
          开始测评
        </el-button>
      </div>
    </div>
    
    <\!-- 注册弹框 -->
    <RegisterModal
      ref="registerModal"
      @success="handleRegisterSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import RegisterModal from '@/components/RegisterModal.vue'
import { vRequireAuth } from '@/directives/require-auth'

const router = useRouter()
const userStore = useUserStore()
const registerModal = ref()

const assessments = ref([
  { id: 1, title: '语言发展评估', description: '评估孩子的语言能力' },
  { id: 2, title: '认知发展评估', description: '评估孩子的认知能力' },
  { id: 3, title: '社交能力评估', description: '评估孩子的社交能力' },
])

const openRegisterModal = () => {
  registerModal.value?.open()
}

const handleStartAssessment = (assessmentId: number) => {
  // 如果已登录，直接开始测评
  if (userStore.isAuthenticated) {
    router.push(`/assessment/${assessmentId}`)
  }
}

const handleRegisterSuccess = () => {
  // 注册成功后，重新加载页面或继续操作
  ElMessage.success('注册成功，现在可以开始测评了')
}
</script>
```

---

## 📋 需要修改的文件清单

### 前端修改
1. ✅ `client/src/router/index.ts` - 修改路由守卫，允许匿名访问
2. ✅ `client/src/components/RegisterModal.vue` - 创建注册弹框组件
3. ✅ `client/src/directives/require-auth.ts` - 创建操作拦截指令
4. ✅ `client/src/pages/parent-center/assessment.vue` - 使用指令和弹框
5. ✅ `client/src/main.ts` - 注册指令

### 后端修改
1. ✅ `server/src/routes/auth.ts` - 添加注册接口
2. ✅ `server/src/controllers/auth.controller.ts` - 实现注册逻辑
3. ✅ `server/src/middlewares/auth.middleware.ts` - 允许匿名访问特定路由

---

## 🎯 用户流程

### 匿名用户流程
```
1. 访问系统 (无token)
   ↓
2. 浏览测评目录 (允许)
   ↓
3. 点击"开始测评"按钮
   ↓
4. 弹出注册框
   ↓
5. 填写注册信息
   ↓
6. 点击"注册并登录"
   ↓
7. 后端验证并创建账户
   ↓
8. 自动登录
   ↓
9. 关闭弹框
   ↓
10. 继续操作 (开始测评)
```

### 已登录用户流程
```
1. 访问系统 (有token)
   ↓
2. 浏览测评目录 (允许)
   ↓
3. 点击"开始测评"按钮
   ↓
4. 直接开始测评 (无需注册)
```

---

## 🔐 安全考虑

### 1. 匿名访问的限制
- ✅ 只能浏览（只读）
- ✅ 不能修改数据
- ✅ 不能删除数据
- ✅ 不能访问敏感信息

### 2. 操作权限检查
- ✅ 后端必须验证用户身份
- ✅ 不能依赖前端权限检查
- ✅ 所有修改操作都需要token

### 3. 注册验证
- ✅ 邮箱唯一性检查
- ✅ 用户名唯一性检查
- ✅ 密码强度检查
- ✅ 手机号格式检查

---

## 📊 允许匿名访问的页面

```
✅ 允许匿名访问（只读）:
  ├─ /login - 登录页
  ├─ /assessment - 测评目录
  ├─ /assessment-detail/:id - 测评详情
  ├─ /parent-center - 家长中心
  ├─ /parent-center/child - 孩子信息
  ├─ /parent-center/growth - 成长记录
  └─ /parent-center/activities - 活动列表

❌ 需要登录（写操作）:
  ├─ /assessment/:id - 开始测评
  ├─ /parent-center/child/edit - 编辑孩子信息
  ├─ /parent-center/growth/add - 添加成长记录
  ├─ /parent-center/activities/:id/register - 报名活动
  └─ 所有其他需要修改数据的操作
```

---

## 💡 关键点

1. **路由守卫** - 允许匿名访问特定页面
2. **注册弹框** - 在需要操作时弹出
3. **操作拦截** - 使用指令拦截按钮点击
4. **自动登录** - 注册成功后自动登录
5. **后端验证** - 所有操作都需要后端验证

---

**方案完成**: 2025-11-14 ✅  
**状态**: 就绪  
**优先级**: 🔴 高
