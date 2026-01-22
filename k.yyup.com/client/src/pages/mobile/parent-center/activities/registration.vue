<template>
  <MobileSubPageLayout title="活动报名" back-path="/mobile/parent-center">
    <div class="activity-registration" v-if="activity">
      <!-- 活动信息摘要 -->
      <div class="activity-summary">
        <van-card
          :thumb="activity.coverImage || '/default-activity.png'"
          :title="activity.title"
          :desc="activity.description"
        >
          <template #thumb>
            <van-image
              :src="activity.coverImage || '/default-activity.png'"
              fit="cover"
              width="100%"
              height="120"
              :error-icon="defaultImageIcon"
            />
          </template>
          <template #desc>
            <div class="activity-info">
              <div class="info-item">
                <van-icon name="clock-o" />
                <span>{{ formatActivityTime(activity.startTime, activity.endTime) }}</span>
              </div>
              <div class="info-item">
                <van-icon name="location-o" />
                <span>{{ activity.location }}</span>
              </div>
              <div class="info-item">
                <van-icon name="friends-o" />
                <span>{{ activity.registeredCount || 0 }}/{{ activity.capacity }}人</span>
              </div>
            </div>
          </template>
        </van-card>
      </div>

      <!-- 报名表单 -->
      <div class="registration-form">
        <h2>报名信息</h2>
        <van-form @submit="handleSubmit" ref="formRef">
          <van-cell-group inset>
            <van-field
              v-model="form.childName"
              name="childName"
              label="孩子姓名"
              placeholder="请输入孩子的真实姓名"
              :rules="[
                { required: true, message: '请输入孩子姓名' },
                { pattern: /^[\u4e00-\u9fa5a-zA-Z]{2,10}$/, message: '请输入2-10位中文或英文字符' }
              ]"
            />
            <van-field
              v-model="form.childAge"
              name="childAge"
              label="孩子年龄"
              placeholder="请输入孩子年龄"
              type="number"
              :rules="[
                { required: true, message: '请输入孩子年龄' },
                { pattern: /^[1-9]\d*$/, message: '请输入正确的年龄' },
                { validator: validateAge, message: '年龄必须在1-12岁之间' }
              ]"
            />
            <van-field
              v-model="form.childGenderText"
              name="childGender"
              label="孩子性别"
              placeholder="请选择孩子性别"
              readonly
              is-link
              @click="showGenderPicker = true"
              :rules="[{ required: true, message: '请选择孩子性别' }]"
            />
            <van-field
              v-model="form.attendeeCount"
              name="attendeeCount"
              label="参与人数"
              placeholder="请输入参与人数"
              type="number"
              :rules="[
                { required: true, message: '请输入参与人数' },
                { pattern: /^[1-9]\d*$/, message: '参与人数至少为1人' },
                { validator: validateAttendeeCount, message: '参与人数超过剩余名额' }
              ]"
            />
            <van-field
              v-model="form.contactName"
              name="contactName"
              label="联系人姓名"
              placeholder="请输入联系人姓名"
              :rules="[
                { required: true, message: '请输入联系人姓名' },
                { pattern: /^[\u4e00-\u9fa5a-zA-Z]{2,10}$/, message: '请输入2-10位中文或英文字符' }
              ]"
            />
            <van-field
              v-model="form.contactPhone"
              name="contactPhone"
              label="联系电话"
              placeholder="请输入联系电话"
              type="tel"
              :rules="[
                { required: true, message: '请输入联系电话' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
              ]"
            />
            <van-field
              v-model="form.specialNeeds"
              name="specialNeeds"
              label="特殊需求"
              placeholder="如有特殊需求请说明（可选）"
              type="textarea"
              rows="3"
              maxlength="200"
              show-word-limit
            />
          </van-cell-group>

          <!-- 家长信息 -->
          <van-cell-group inset v-if="userStore.userInfo">
            <van-cell title="家长姓名" :value="userStore.userInfo.name" />
            <van-cell title="家长手机" :value="userStore.userInfo.phone" />
            <van-cell title="学生姓名" :value="userStore.studentName || '暂无'" />
          </van-cell-group>

          <!-- 活动须知 -->
          <van-cell-group inset>
            <van-cell>
              <template #title>
                <div class="notice-title">
                  <van-icon name="info-o" />
                  <span>活动须知</span>
                </div>
              </template>
              <template #label>
                <div class="notice-content">
                  <p>1. 请确保填写的信息真实有效</p>
                  <p>2. 活动当天请准时到达现场</p>
                  <p>3. 如需取消报名，请提前24小时通知</p>
                  <p>4. 活动期间请服从工作人员安排</p>
                  <p v-if="activity.fee && activity.fee > 0">5. 活动费用：¥{{ activity.fee }}，现场支付</p>
                </div>
              </template>
            </van-cell>
          </van-cell-group>

          <!-- 同意条款 -->
          <van-cell-group inset>
            <van-cell>
              <template #title>
                <van-checkbox v-model="agreeTerms" shape="square">
                  我已阅读并同意
                  <span class="terms-link" @click.stop="showTerms = true">《活动报名协议》</span>
                  和
                  <span class="terms-link" @click.stop="showPrivacy = true">《隐私政策》</span>
                </van-checkbox>
              </template>
            </van-cell>
          </van-cell-group>

          <!-- 提交按钮 -->
          <div class="submit-section">
            <van-button 
              type="primary" 
              size="large" 
              block 
              native-type="submit"
              :loading="submitting"
              :disabled="!agreeTerms"
            >
              确认报名
            </van-button>
          </div>
        </van-form>
      </div>
    </div>

    <!-- 加载状态 -->
    <van-loading v-else-if="loading" type="spinner" color="var(--van-primary-color)" vertical>
      加载中...
    </van-loading>

    <!-- 错误状态 -->
    <van-empty 
      v-else-if="error"
      description="活动信息加载失败"
      image="error"
    >
      <van-button type="primary" @click="loadActivityInfo">重新加载</van-button>
    </van-empty>

    <!-- 性别选择器 -->
    <van-popup v-model:show="showGenderPicker" position="bottom">
      <van-picker
        :columns="genderColumns"
        @confirm="onGenderConfirm"
        @cancel="showGenderPicker = false"
      />
    </van-popup>

    <!-- 活动协议弹窗 -->
    <van-popup v-model:show="showTerms" position="bottom" :style="{ height: '80%' }">
      <div class="terms-dialog">
        <div class="dialog-header">
          <h3>活动报名协议</h3>
          <van-button type="default" size="small" @click="showTerms = false">
            关闭
          </van-button>
        </div>
        <div class="dialog-content">
          <div class="terms-content">
            <h4>第一条 总则</h4>
            <p>为确保活动顺利进行，保障参与者的合法权益，特制定本协议。</p>
            
            <h4>第二条 报名须知</h4>
            <p>1. 参与者需提供真实有效的个人信息</p>
            <p>2. 活动名额有限，报名成功以收到确认通知为准</p>
            <p>3. 活动费用如有变化，将提前通知</p>
            
            <h4>第三条 权利义务</h4>
            <p>1. 参与者应按时参加活动，服从工作人员安排</p>
            <p>2. 如需取消报名，请提前24小时通知</p>
            <p>3. 活动期间注意安全，遵守相关规定</p>
            
            <h4>第四条 免责声明</h4>
            <p>1. 因不可抗力导致活动取消，主办方不承担责任</p>
            <p>2. 参与者因个人原因造成的人身伤害，责任自负</p>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 隐私政策弹窗 -->
    <van-popup v-model:show="showPrivacy" position="bottom" :style="{ height: '80%' }">
      <div class="privacy-dialog">
        <div class="dialog-header">
          <h3>隐私政策</h3>
          <van-button type="default" size="small" @click="showPrivacy = false">
            关闭
          </van-button>
        </div>
        <div class="dialog-content">
          <div class="privacy-content">
            <h4>信息收集</h4>
            <p>我们收集您的个人信息仅用于活动报名和组织，包括姓名、电话、孩子信息等。</p>
            
            <h4>信息使用</h4>
            <p>收集的信息将用于：</p>
            <p>1. 活动报名确认</p>
            <p>2. 活动通知发送</p>
            <p>3. 紧急情况联系</p>
            
            <h4>信息保护</h4>
            <p>我们采取严格的安全措施保护您的个人信息，不会向第三方泄露。</p>
            
            <h4>信息存储</h4>
            <p>您的信息将被安全存储，仅在必要时用于活动相关事宜。</p>
          </div>
        </div>
      </div>
    </van-popup>
  </MobileSubPageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import MobileSubPageLayout from '@/components/mobile/layouts/MobileSubPageLayout.vue'
import { getActivityDetail, createRegistration } from '@/api/modules/activity'
import { useUserStore } from '@/stores/user'
import type { Activity } from '@/api/modules/activity'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 活动信息
const activity = ref<Activity | null>(null)
const loading = ref(false)
const error = ref(false)

// 表单数据
const form = ref({
  childName: '',
  childAge: '',
  childGender: 0,
  childGenderText: '',
  attendeeCount: '1',
  contactName: '',
  contactPhone: '',
  specialNeeds: ''
})

// 表单引用
const formRef = ref()

// 状态管理
const submitting = ref(false)
const agreeTerms = ref(false)
const showGenderPicker = ref(false)
const showTerms = ref(false)
const showPrivacy = ref(false)

// 默认图标
const defaultImageIcon = 'photo-fail'

// 性别选项
const genderColumns = [
  { text: '男', value: 1 },
  { text: '女', value: 2 }
]

// 计算属性
const activityId = computed(() => Number(route.query.activityId))
const remainingCapacity = computed(() => {
  if (!activity.value) return 0
  return activity.value.capacity - (activity.value.registeredCount || 0)
})

// 方法
const loadActivityInfo = async () => {
  if (!activityId.value) {
    error.value = true
    return
  }

  loading.value = true
  error.value = false

  try {
    const response = await getActivityDetail(activityId.value)
    if (response.success && response.data) {
      activity.value = response.data
      
      // 检查是否还可以报名
      if (activity.value.status !== 2 || remainingCapacity.value <= 0) {
        showToast('该活动已停止报名或已满员')
        router.back()
        return
      }
      
      // 填充用户信息
      if (userStore.userInfo) {
        form.value.contactName = userStore.userInfo.name || ''
        form.value.contactPhone = userStore.userInfo.phone || ''
      }
    } else {
      error.value = true
    }
  } catch (error) {
    console.error('加载活动信息失败:', error)
    error.value = true
    
    // 使用模拟数据
    activity.value = getMockActivity()
  } finally {
    loading.value = false
  }
}

const getMockActivity = (): Activity => {
  return {
    id: activityId.value || 1,
    title: '秋季亲子运动会',
    activityType: 3,
    status: 2,
    startTime: '2024-11-15 09:00',
    endTime: '2024-11-15 12:00',
    location: '幼儿园操场',
    capacity: 100,
    registeredCount: 78,
    fee: 0,
    description: '这是一场充满乐趣的亲子运动会，通过各项体育活动增进亲子感情。',
    registrationStartTime: '2024-11-01',
    registrationEndTime: '2024-11-13',
    needsApproval: 0,
    createdAt: '2024-10-20',
    updatedAt: '2024-11-01'
  }
}

const formatActivityTime = (startTime: string, endTime: string) => {
  const start = new Date(startTime)
  const end = new Date(endTime)
  const formatDate = (date: Date) => {
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
  return `${formatDate(start)} - ${formatDate(end)}`
}

const onGenderConfirm = ({ selectedValues }: any) => {
  form.value.childGender = selectedValues[0]
  form.value.childGenderText = selectedValues[0] === 1 ? '男' : '女'
  showGenderPicker.value = false
}

// 表单验证
const validateAge = (value: string) => {
  const age = Number(value)
  return age >= 1 && age <= 12
}

const validateAttendeeCount = (value: string) => {
  const count = Number(value)
  return count <= remainingCapacity.value
}

const handleSubmit = async () => {
  if (!agreeTerms.value) {
    showToast('请先同意活动协议')
    return
  }

  try {
    await showConfirmDialog({
      title: '确认报名',
      message: '确定要提交报名信息吗？',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })

    submitting.value = true

    const registrationData = {
      activityId: activityId.value,
      childName: form.value.childName,
      childAge: Number(form.value.childAge),
      childGender: form.value.childGender,
      attendeeCount: Number(form.value.attendeeCount),
      contactName: form.value.contactName,
      contactPhone: form.value.contactPhone,
      specialNeeds: form.value.specialNeeds
    }

    const response = await createRegistration(registrationData)
    
    if (response.success) {
      showToast('报名成功！')
      
      // 跳转到报名成功页面或活动详情
      setTimeout(() => {
        router.replace(`/mobile/parent-center/activities/${activityId.value}`)
      }, 1500)
    } else {
      showToast(response.message || '报名失败，请重试')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('报名提交失败:', error)
      showToast('报名失败，请重试')
    }
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  // 主题检测
  const detectTheme = () => {
    const htmlTheme = document.documentElement.getAttribute('data-theme')
    // isDark.value = htmlTheme === 'dark'
  }
  detectTheme()
  loadActivityInfo()
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';
.activity-registration {
  padding-bottom: 100px;

  .activity-summary {
    margin-bottom: var(--spacing-lg);

    .activity-info {
      .info-item {
        display: flex;
        align-items: center;
        font-size: var(--text-xs);
        color: var(--van-text-color-2);
        margin-bottom: var(--spacing-xs);

        &:last-child {
          margin-bottom: 0;
        }

        .van-icon {
          margin-right: var(--spacing-xs);
          color: var(--van-primary-color);
          font-size: var(--text-sm);
        }

        span {
          line-height: 1.4;
        }
      }
    }
  }

  .registration-form {
    h2 {
      padding: var(--spacing-md);
      margin: 0;
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--van-text-color);
    }

    .notice-title {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-weight: 500;

      .van-icon {
        color: var(--van-primary-color);
      }
    }

    .notice-content {
      p {
        margin: var(--spacing-xs) 0;
        font-size: var(--text-xs);
        color: var(--van-text-color-2);
        line-height: 1.5;
      }
    }

    .terms-link {
      color: var(--van-primary-color);
      text-decoration: underline;
    }

    .submit-section {
      margin: var(--spacing-lg) 16px 80px 16px;

      .van-button {
        border-radius: var(--spacing-2xl);
        height: 50px;
        font-size: var(--text-base);
        font-weight: 500;
      }
    }
  }
}

.terms-dialog,
.privacy-dialog {
  height: 100%;
  display: flex;
  flex-direction: column;

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--van-gray-3);

    h3 {
      margin: 0;
      font-size: var(--text-base);
      font-weight: 600;
    }
  }

  .dialog-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-md);

    .terms-content,
    .privacy-content {
      h4 {
        margin: var(--spacing-md) 0 8px 0;
        font-size: var(--text-sm);
        font-weight: 600;
        color: var(--van-text-color);
      }

      p {
        margin: var(--spacing-sm) 0;
        font-size: var(--text-sm);
        line-height: 1.6;
        color: var(--van-text-color-2);
      }
    }
  }
}

// 响应式优化
@media (min-width: 768px) {
  .activity-registration {
    max-width: 768px;
    margin: 0 auto;
  }
}

/* ==================== 暗色模式支持 ==================== */
@media (prefers-color-scheme: dark) {
  :root {
    /* 设计令牌会自动适配暗色模式 */
  }
}
</style>