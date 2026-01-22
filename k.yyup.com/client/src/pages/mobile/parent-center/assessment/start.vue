<template>
  <MobileSubPageLayout title="开始测评" back-path="/mobile/parent-center">
    <div class="mobile-assessment-start">
      <!-- 头部信息 -->
      <div class="header-section">
        <div class="title-area">
          <h1 class="main-title">2-6岁儿童发育商测评</h1>
          <p class="subtitle">免费测评，专业报告，助力孩子成长</p>
        </div>
      </div>

      <!-- 表单卡片 -->
      <van-cell-group class="form-group" inset>
        <van-field
          v-model="form.childName"
          name="childName"
          label="孩子姓名"
          placeholder="请输入孩子姓名"
          :rules="[{ required: true, message: '请输入孩子姓名' }]"
          left-icon="contact"
        />

        <van-field
          v-model="form.childAge"
          name="childAge"
          label="孩子年龄"
          placeholder="请输入年龄（月）"
          type="number"
          left-icon="calendar-o"
          :rules="[
            { required: true, message: '请输入孩子年龄' },
            { pattern: /^(2[4-9]|[3-6][0-9]|7[0-2])$/, message: '年龄必须在24-72个月之间' }
          ]"
        />
        <div class="age-tip">请输入24-72个月（2-6岁）</div>

        <van-field name="childGender" label="孩子性别" left-icon="manager">
          <template #input>
            <van-radio-group v-model="form.childGender" direction="horizontal">
              <van-radio name="male">男</van-radio>
              <van-radio name="female">女</van-radio>
            </van-radio-group>
          </template>
        </van-field>

        <van-field
          v-model="form.phone"
          name="phone"
          label="联系电话"
          placeholder="请输入联系电话（用于接收报告）"
          type="tel"
          left-icon="phone"
          :rules="[
            { required: true, message: '请输入联系电话' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
          ]"
        />
      </van-cell-group>

      <!-- 开始测评按钮 -->
      <div class="action-section">
        <van-button
          type="primary"
          block
          round
          size="large"
          :loading="loading"
          @click="handleStart"
          class="start-btn"
        >
          开始测评
        </van-button>
      </div>

      <!-- 测评说明 -->
      <van-cell-group class="info-section" inset>
        <van-cell class="info-header">
          <template #title>
            <div class="header-title">
              <van-icon name="info-o" />
              <span>测评说明</span>
            </div>
          </template>
        </van-cell>

        <div class="features-list">
          <div class="feature-item" v-for="(feature, index) in features" :key="index">
            <van-icon name="success" class="feature-icon" />
            <span class="feature-text">{{ feature }}</span>
          </div>
        </div>
      </van-cell-group>
    </div>
  </MobileSubPageLayout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Toast } from 'vant'
import MobileSubPageLayout from '@/components/mobile/layouts/MobileSubPageLayout.vue'
import { assessmentApi } from '@/api/assessment'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)

const form = reactive({
  childName: '',
  childAge: '',
  childGender: 'male' as 'male' | 'female',
  phone: ''
})

const features = [
  '测评免费，无需注册',
  '包含专注力、记忆力、逻辑思维等6个维度',
  '完成测评后生成专业报告',
  '报告包含AI生成的成长建议',
  '一个月内可重复测评'
]

const handleStart = async () => {
  // 表单验证
  if (!form.childName.trim()) {
    Toast('请输入孩子姓名')
    return
  }

  if (!form.childAge) {
    Toast('请输入孩子年龄')
    return
  }

  const age = parseInt(form.childAge)
  if (isNaN(age) || age < 24 || age > 72) {
    Toast('年龄必须在24-72个月之间')
    return
  }

  if (!form.phone.trim()) {
    Toast('请输入联系电话')
    return
  }

  if (!/^1[3-9]\d{9}$/.test(form.phone)) {
    Toast('请输入正确的手机号码')
    return
  }

  loading.value = true
  Toast.loading({
    message: '正在开始测评...',
    forbidClick: true,
    duration: 0
  })

  try {
    // 构建请求参数
    const requestData: any = {
      childName: form.childName.trim(),
      childAge: age,
      childGender: form.childGender,
      phone: form.phone.trim()
    }

    // 如果用户已登录，传递userId
    if (userStore.userId) {
      requestData.userId = userStore.userId
    }

    console.log('开始测评请求:', requestData)
    const response = await assessmentApi.startAssessment(requestData)

    console.log('API响应:', response)
    if (response.data?.success) {
      Toast.clear()
      Toast.success('测评开始成功')
      const recordId = response.data.data.id
      console.log('跳转到测评页面:', `/mobile/parent-center/assessment/doing/${recordId}`)

      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        router.push(`/mobile/parent-center/assessment/doing/${recordId}`)
      }, 1000)
    } else {
      Toast.clear()
      Toast.fail(response.data?.message || '开始测评失败')
    }
  } catch (error: any) {
    Toast.clear()
    console.error('开始测评失败:', error)
    Toast.fail(error.message || '开始测评失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';

.mobile-assessment-start {
  min-height: calc(100vh - var(--mobile-header-height) - var(--mobile-footer-height));
  background: linear-gradient(135deg, var(--van-primary-color) 0%, #667eea 100%);
  padding-bottom: var(--van-padding-xl);

  .header-section {
    padding: var(--van-padding-xl) var(--van-padding-md) var(--van-padding-lg);
    text-align: center;
    color: white;

    .title-area {
      .main-title {
        font-size: var(--text-2xl);
        font-weight: 600;
        margin: 0 0 var(--van-padding-sm) 0;
        line-height: 1.3;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .subtitle {
        font-size: var(--text-sm);
        margin: 0;
        opacity: 0.9;
        line-height: 1.4;
      }
    }
  }

  .form-group {
    margin-bottom: var(--van-padding-lg);

    .age-tip {
      padding: var(--van-padding-xs) var(--van-padding-md);
      font-size: var(--text-xs);
      color: var(--van-text-color-3);
      background: var(--van-background-color-light);
    }
  }

  .action-section {
    padding: 0 var(--van-padding-md);
    margin-bottom: var(--van-padding-lg);

    .start-btn {
      background: linear-gradient(135deg, var(--van-primary-color) 0%, #667eea 100%);
      border: none;
      height: 50px;
      font-size: var(--text-base);
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(32, 126, 255, 0.3);

      &:active {
        transform: translateY(1px);
      }
    }
  }

  .info-section {
    .info-header {
      background: var(--van-background-color-light);

      .header-title {
        display: flex;
        align-items: center;
        gap: var(--van-padding-xs);
        font-weight: 600;
        font-size: var(--text-base);
        color: var(--van-text-color);

        .van-icon {
          color: var(--van-primary-color);
        }
      }
    }

    .features-list {
      padding: var(--van-padding-md);

      .feature-item {
        display: flex;
        align-items: center;
        gap: var(--van-padding-sm);
        padding: var(--van-padding-sm) 0;
        border-bottom: 1px solid var(--van-border-color);
        color: var(--van-text-color-2);

        &:last-child {
          border-bottom: none;
        }

        .feature-icon {
          color: var(--van-success-color);
          font-size: var(--text-base);
          flex-shrink: 0;
        }

        .feature-text {
          font-size: var(--text-sm);
          line-height: 1.4;
        }
      }
    }
  }
}

// 深色主题适配
@media (prefers-color-scheme: dark) {
  .mobile-assessment-start {
    background: linear-gradient(135deg, var(--van-primary-color) 0%, #4a5568 100%);
  }
}

// 大屏幕适配
@media (min-width: 768px) {
  .mobile-assessment-start {
    max-width: 768px;
    margin: 0 auto;

    .header-section {
      .title-area {
        .main-title {
          font-size: var(--text-3xl);
        }

        .subtitle {
          font-size: var(--text-base);
        }
      }
    }
  }
}
</style>