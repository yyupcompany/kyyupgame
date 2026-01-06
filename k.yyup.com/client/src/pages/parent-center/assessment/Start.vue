<template>
  <div class="assessment-start-page">
    <div class="container">
      <div class="header">
        <h1>2-6岁儿童发育商测评</h1>
        <p class="subtitle">免费测评，专业报告，助力孩子成长</p>
      </div>

      <el-card class="form-card">
        <el-form :model="form" :rules="rules" ref="formRef" label-width="var(--spacing-2xl)">
          <el-form-item label="孩子姓名" prop="childName">
            <el-input v-model="form.childName" placeholder="请输入孩子姓名" />
          </el-form-item>

          <el-form-item label="孩子年龄" prop="childAge">
            <el-input-number
              v-model="form.childAge"
              :min="24"
              :max="72"
              placeholder="请输入年龄（月）"
              class="width-full"
            />
            <div class="age-tip">请输入24-72个月（2-6岁）</div>
          </el-form-item>

          <el-form-item label="孩子性别" prop="childGender">
            <el-radio-group v-model="form.childGender">
              <el-radio label="male">男</el-radio>
              <el-radio label="female">女</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="form.phone" placeholder="请输入联系电话（用于接收报告）" />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" size="large" @click="handleStart" :loading="loading">
              开始测评
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <div class="features">
        <h2>测评说明</h2>
        <ul>
          <li>测评免费，无需注册</li>
          <li>包含专注力、记忆力、逻辑思维等6个维度</li>
          <li>完成测评后生成专业报告</li>
          <li>报告包含AI生成的成长建议</li>
          <li>一个月内可重复测评</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { assessmentApi } from '@/api/assessment'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref()
const loading = ref(false)

const form = reactive({
  childName: '',
  childAge: 36,
  childGender: 'male' as 'male' | 'female',
  phone: ''
})

const rules = {
  childName: [
    { required: true, message: '请输入孩子姓名', trigger: 'blur' }
  ],
  childAge: [
    { required: true, message: '请输入孩子年龄', trigger: 'blur' },
    { type: 'number', min: 24, max: 72, message: '年龄必须在24-72个月之间', trigger: 'blur' }
  ],
  childGender: [
    { required: true, message: '请选择孩子性别', trigger: 'change' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

const handleStart = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return

    loading.value = true
    try {
      // ✅ 传递userId以确保记录与用户关联
      const requestData: any = {
        childName: form.childName,
        childAge: form.childAge,
        childGender: form.childGender,
        phone: form.phone
      }
      
      // 如果用户已登录，传递userId
      if (userStore.userId) {
        requestData.userId = userStore.userId
      }
      
      console.log('开始测评请求:', requestData)
      const response = await assessmentApi.startAssessment(requestData)

      console.log('API响应:', response)
      if (response.data?.success) {
        ElMessage.success('测评开始成功')
        const recordId = response.data.data.id
        console.log('跳转到测评页面:', `/parent-center/assessment/doing/${recordId}`)
        router.push(`/parent-center/assessment/doing/${recordId}`)
      } else {
        ElMessage.error(response.data?.message || '开始测评失败')
      }
    } catch (error: any) {
      console.error('开始测评失败:', error)
      ElMessage.error(error.message || '开始测评失败')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped lang="scss">
.assessment-start-page {
  // 工具类
  .width-full {
    width: 100%;
  }
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
  padding: var(--spacing-xl) var(--spacing-2xl);
  position: relative;
  overflow: hidden;

  // 添加装饰性背景图案
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -10%;
    width: var(--spacing-3xl);
    height: var(--spacing-3xl);
    background: radial-gradient(circle, var(--glass-bg-light) 0%, transparent 70%);
    border-radius: var(--radius-full);
    animation: float 20s ease-in-out infinite;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: -5%;
    width: var(--spacing-2xl);
    height: var(--spacing-2xl);
    background: radial-gradient(circle, var(--glass-bg-heavy) 0%, transparent 70%);
    border-radius: var(--radius-full);
    animation: float 15s ease-in-out infinite reverse;
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0) rotate(0deg);
    }
    50% {
      transform: translateY(-var(--spacing-lg)) rotate(10deg);
    }
  }

  .container {
    max-width: var(--container-xl);
    margin: 0 auto;
    position: relative;
    z-index: 10;

    .header {
      text-align: center;
      color: var(--text-on-primary);
      margin-bottom: var(--spacing-xl);
      text-shadow: 0 2px var(--spacing-xs) var(--shadow-light);

      h1 {
        font-size: var(--text-xl);
        margin-bottom: var(--spacing-sm);
        font-weight: 600;
        letter-spacing: var(--spacing-xs);
      }

      .subtitle {
        font-size: var(--text-base);
        opacity: 0.95;
        font-weight: 300;
      }
    }

    .form-card {
      margin-bottom: var(--spacing-xl);
      box-shadow: var(--shadow-md);
      border-radius: var(--radius-lg);
      transition: transform 0.3s ease, box-shadow 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }

      :deep(.el-card__body) {
        padding: var(--spacing-xl);
      }

      .age-tip {
        font-size: var(--text-sm);
        color: var(--text-secondary);
        margin-top: var(--spacing-sm);
      }

      :deep(.el-button--primary) {
        width: 100%;
        height: var(--spacing-xl);
        font-size: var(--text-base);
        font-weight: 500;
        border-radius: var(--radius-md);
        background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
        border: none;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px var(--glow-primary);
        }
      }
    }

    .features {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      padding: var(--spacing-xl);
      box-shadow: var(--shadow-md);

      h2 {
        margin-bottom: var(--spacing-lg);
        color: var(--text-primary);
        font-size: var(--text-xl);
        font-weight: 600;
      }

      ul {
        list-style: none;
        padding: 0;

        li {
          padding: var(--spacing-md) 0;
          border-bottom: var(--spacing-xs) solid var(--border-color);
          color: var(--text-secondary);
          font-size: var(--text-base);
          transition: all 0.2s ease;

          &:last-child {
            border-bottom: none;
          }

          &:hover {
            color: var(--primary-color);
            transform: translateX(2px);
          }

          &:before {
            content: '✓';
            color: var(--primary-color);
            margin-right: var(--spacing-md);
            font-weight: bold;
            font-size: var(--text-base);
            display: inline-block;
            width: var(--icon-sm);
            height: var(--spacing-lg);
            line-height: var(--spacing-lg);
            text-align: center;
            background: var(--primary-light-bg);
            border-radius: var(--radius-full);
          }
        }
      }
    }
  }
}
</style>

