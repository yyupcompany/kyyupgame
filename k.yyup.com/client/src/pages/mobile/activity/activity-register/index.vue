<template>
  <MobileCenterLayout title="活动报名" :back-path="backPath">
    <div class="activity-register-mobile">
      <!-- 活动信息卡片 -->
      <div class="activity-card">
        <div class="card-header">
          <h3>{{ activity.name }}</h3>
          <van-tag :type="getStatusType(activity.status)">
            {{ getStatusLabel(activity.status) }}
          </van-tag>
        </div>
        <div class="card-info">
          <div class="info-item">
            <van-icon name="clock-o" />
            <span>{{ formatDateRange(activity.startDate, activity.endDate) }}</span>
          </div>
          <div class="info-item">
            <van-icon name="location-o" />
            <span>{{ activity.location || '待定' }}</span>
          </div>
          <div class="info-item">
            <van-icon name="friends-o" />
            <span>剩余名额: {{ remainingSlots }}人</span>
          </div>
          <div class="info-item" v-if="activity.fee > 0">
            <van-icon name="gold-coin-o" />
            <span>费用: ¥{{ activity.fee }}</span>
          </div>
        </div>
      </div>

      <!-- 报名表单 -->
      <van-form @submit="onSubmit" @failed="onFailed">
        <van-cell-group inset title="报名信息">
          <van-field
            v-model="form.userName"
            name="userName"
            label="姓名"
            placeholder="请输入您的姓名"
            :rules="[{ required: true, message: '请输入姓名' }]"
          />

          <van-field
            v-model="form.phone"
            name="phone"
            label="手机号"
            type="tel"
            placeholder="请输入手机号"
            :rules="[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
            ]"
          />

          <van-field
            v-model="form.childName"
            name="childName"
            label="孩子姓名"
            placeholder="请输入孩子姓名"
            :rules="[{ required: true, message: '请输入孩子姓名' }]"
          />

          <van-field
            v-model="form.className"
            is-link
            readonly
            name="className"
            label="班级"
            placeholder="请选择班级"
            @click="showClassPicker = true"
          />

          <van-field
            v-model="form.participantCount"
            name="participantCount"
            label="参与人数"
            type="digit"
            placeholder="包括家长和孩子"
            :rules="[{ required: true, message: '请输入参与人数' }]"
          />
        </van-cell-group>

        <van-cell-group inset title="其他信息">
          <van-field
            v-model="form.emergencyContact"
            name="emergencyContact"
            label="紧急联系人"
            placeholder="请输入紧急联系人姓名"
          />

          <van-field
            v-model="form.emergencyPhone"
            name="emergencyPhone"
            label="紧急电话"
            type="tel"
            placeholder="请输入紧急联系电话"
          />

          <van-field
            v-model="form.remark"
            name="remark"
            label="备注"
            type="textarea"
            rows="2"
            autosize
            placeholder="如有特殊情况请备注（如过敏史等）"
          />
        </van-cell-group>

        <!-- 协议 -->
        <div class="agreement-section">
          <van-checkbox v-model="form.agreed" shape="square" icon-size="16">
            <span class="agreement-text">
              我已阅读并同意
              <a @click.stop="showAgreement">《活动报名须知》</a>
            </span>
          </van-checkbox>
        </div>

        <!-- 费用摘要 -->
        <div class="fee-summary" v-if="activity.fee > 0">
          <div class="fee-row">
            <span>活动费用</span>
            <span>¥{{ activity.fee }} × {{ form.participantCount || 1 }}</span>
          </div>
          <div class="fee-row total">
            <span>合计</span>
            <span class="total-amount">¥{{ totalFee }}</span>
          </div>
        </div>

        <!-- 提交按钮 -->
        <div class="submit-section">
          <van-button
            round
            block
            type="primary"
            native-type="submit"
            :disabled="!form.agreed || remainingSlots <= 0"
          >
            {{ remainingSlots <= 0 ? '报名已满' : activity.fee > 0 ? `确认支付 ¥${totalFee}` : '确认报名' }}
          </van-button>
        </div>
      </van-form>

      <!-- 班级选择器 -->
      <van-popup v-model:show="showClassPicker" position="bottom" round>
        <van-picker
          :columns="classOptions"
          @confirm="onClassConfirm"
          @cancel="showClassPicker = false"
        />
      </van-popup>

      <!-- 协议弹窗 -->
      <van-popup
        v-model:show="agreementVisible"
        position="bottom"
        round
        closeable
        :style="{ height: '70%' }"
      >
        <div class="agreement-content">
          <h3>活动报名须知</h3>
          <div class="agreement-body">
            <p>1. 请确保报名信息真实准确，以便我们提供更好的服务。</p>
            <p>2. 报名成功后，请按时参加活动，如需取消请提前24小时联系我们。</p>
            <p>3. 活动期间请配合工作人员安排，注意安全。</p>
            <p>4. 如遇不可抗力因素导致活动取消，我们将及时通知并安排退款。</p>
            <p>5. 报名即表示同意授权我们在活动期间拍摄的照片/视频用于宣传。</p>
          </div>
          <van-button type="primary" block round @click="agreementVisible = false">
            我已阅读
          </van-button>
        </div>
      </van-popup>
    </div>
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showLoadingToast, closeToast, showSuccessToast } from 'vant'
import type { TagType } from 'vant'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'

const router = useRouter()
const route = useRoute()

const activityId = computed(() => route.query.id as string)
const backPath = computed(() => `/mobile/activity/activity-detail/${activityId.value}` || '/mobile/activity/activity-index')

// 活动信息
const activity = reactive({
  id: '',
  name: '',
  startDate: '',
  endDate: '',
  location: '',
  status: 'upcoming',
  participantCount: 0,
  maxParticipants: 0,
  fee: 0
})

// 表单数据
const form = reactive({
  userName: '',
  phone: '',
  childName: '',
  className: '',
  participantCount: '2',
  emergencyContact: '',
  emergencyPhone: '',
  remark: '',
  agreed: false
})

// 弹窗状态
const showClassPicker = ref(false)
const agreementVisible = ref(false)

// 班级选项
const classOptions = [
  { text: '小班', value: 'small' },
  { text: '中班', value: 'middle' },
  { text: '大班', value: 'big' }
]

// 计算属性
const remainingSlots = computed(() => {
  return Math.max(0, (activity.maxParticipants || 0) - (activity.participantCount || 0))
})

const totalFee = computed(() => {
  return activity.fee * (parseInt(form.participantCount) || 1)
})

// 方法
const loadActivity = async () => {
  // 模拟数据
  Object.assign(activity, {
    id: activityId.value,
    name: '春季亲子运动会',
    startDate: '2025-03-15',
    endDate: '2025-03-15',
    location: '学校运动场',
    status: 'upcoming',
    participantCount: 28,
    maxParticipants: 50,
    fee: 0
  })
}

const formatDateRange = (start: string, end: string) => {
  if (!start) return '待定'
  const startStr = new Date(start).toLocaleDateString('zh-CN')
  if (!end || start === end) return startStr
  const endStr = new Date(end).toLocaleDateString('zh-CN')
  return `${startStr} ~ ${endStr}`
}

const getStatusType = (status: string): TagType => {
  const types: Record<string, TagType> = {
    ongoing: 'success',
    upcoming: 'primary',
    ended: 'default'
  }
  return types[status] || 'default'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    ongoing: '进行中',
    upcoming: '即将开始',
    ended: '已结束'
  }
  return labels[status] || status
}

const onClassConfirm = ({ selectedOptions }: any) => {
  form.className = selectedOptions[0]?.text || ''
  showClassPicker.value = false
}

const showAgreement = () => {
  agreementVisible.value = true
}

const onSubmit = async () => {
  if (!form.agreed) {
    showToast('请先同意报名须知')
    return
  }

  try {
    showLoadingToast({ message: '提交中...', forbidClick: true })
    // TODO: 调用API提交报名
    const registrationData = {
      activityId: activityId.value,
      userName: form.userName,
      phone: form.phone,
      childName: form.childName,
      className: form.className,
      participantCount: parseInt(form.participantCount),
      emergencyContact: form.emergencyContact,
      emergencyPhone: form.emergencyPhone,
      remark: form.remark
    }
    console.log('提交报名:', registrationData)
    await new Promise(resolve => setTimeout(resolve, 1000))
    closeToast()
    showSuccessToast('报名成功')
    setTimeout(() => {
      router.push('/mobile/activity/activity-index')
    }, 1000)
  } catch (error) {
    closeToast()
    showToast('报名失败')
  }
}

const onFailed = (errorInfo: any) => {
  console.log('验证失败:', errorInfo)
  showToast('请填写必填项')
}

onMounted(() => {
  loadActivity()
})
</script>

<style scoped lang="scss">
.activity-register-mobile {
  min-height: 100vh;
  background: #f7f8fa;
  padding: 12px 0 100px 0;

  .activity-card {
    background: linear-gradient(135deg, #1989fa 0%, #07c160 100%);
    margin: 0 12px 12px;
    padding: 16px;
    border-radius: 12px;
    color: #fff;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }
    }

    .card-info {
      .info-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        margin-bottom: 6px;
        opacity: 0.9;
      }
    }
  }

  .van-cell-group {
    margin-bottom: 12px;
  }

  .agreement-section {
    padding: 12px 16px;

    .agreement-text {
      font-size: 13px;
      color: #666;

      a {
        color: #1989fa;
      }
    }
  }

  .fee-summary {
    background: #fff;
    margin: 0 12px 12px;
    padding: 16px;
    border-radius: 8px;

    .fee-row {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      color: #666;
      margin-bottom: 8px;

      &.total {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px dashed #eee;
        font-weight: 600;
        color: #333;

        .total-amount {
          color: #ee0a24;
          font-size: 20px;
        }
      }
    }
  }

  .submit-section {
    position: fixed;
    bottom: 60px;
    left: 0;
    right: 0;
    padding: 12px 16px;
    background: #fff;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  }

  .agreement-content {
    padding: 20px;

    h3 {
      text-align: center;
      font-size: 18px;
      margin-bottom: 20px;
    }

    .agreement-body {
      max-height: 300px;
      overflow-y: auto;
      margin-bottom: 20px;

      p {
        font-size: 14px;
        color: #666;
        line-height: 1.8;
        margin: 0 0 12px 0;
      }
    }
  }
}
</style>
