<template>
  <MobileMainLayout
    :title="activity?.title || '活动详情'"
    :show-back="true"
    :show-footer="true"
    content-padding="var(--app-gap)"
  >
    <div class="activity-detail" v-if="activity">
      <!-- 活动封面图 -->
      <div class="activity-cover">
        <van-image
          :src="activity.coverImage || '/default-activity.png'"
          fit="cover"
          width="100%"
          height="200"
          :error-icon="defaultImageIcon"
        >
          <template #error>
            <div class="image-error">
              <van-icon name="photo-fail" size="40" />
            </div>
          </template>
        </van-image>
        <div class="activity-status" :class="`status-${activity.status}`">
          {{ getStatusText(activity.status) }}
        </div>
      </div>

      <!-- 活动基本信息 -->
      <div class="activity-info">
        <h1 class="activity-title">{{ activity.title }}</h1>
        
        <van-cell-group inset>
          <van-cell title="活动时间" :value="formatActivityTime(activity.startTime, activity.endTime)" />
          <van-cell title="活动地点" :value="activity.location" />
          <van-cell title="活动容量" :value="`${activity.registeredCount || 0}/${activity.capacity}人`" />
          <van-cell title="活动费用" :value="activity.fee ? `¥${activity.fee}` : '免费'" />
          <van-cell title="报名时间" :value="formatRegistrationTime(activity.registrationStartTime, activity.registrationEndTime)" />
          <van-cell title="是否需要审核" :value="activity.needsApproval ? '是' : '否'" />
        </van-cell-group>
      </div>

      <!-- 活动描述 -->
      <div class="activity-description" v-if="activity.description">
        <h2>活动描述</h2>
        <div class="description-content" v-html="activity.description"></div>
      </div>

      <!-- 活动议程 -->
      <div class="activity-agenda" v-if="activity.agenda">
        <h2>活动议程</h2>
        <div class="agenda-content" v-html="activity.agenda"></div>
      </div>

      <!-- 报名信息 -->
      <div class="registration-info" v-if="showRegistrationInfo">
        <h2>报名信息</h2>
        <van-cell-group inset>
          <van-cell title="当前报名人数" :value="`${activity.registeredCount || 0}人`" />
          <van-cell title="剩余名额" :value="`${remainingCapacity}人`" />
          <van-cell title="报名截止时间" :value="formatDateTime(activity.registrationEndTime)" />
        </van-cell-group>

        <!-- 报名进度条 -->
        <div class="registration-progress">
          <div class="progress-label">报名进度</div>
          <van-progress 
            :percentage="registrationProgress" 
            :stroke-width="8"
            color="var(--van-primary-color)"
          />
          <div class="progress-text">
            {{ activity.registeredCount || 0 }} / {{ activity.capacity }}人
          </div>
        </div>
      </div>

      <!-- 参与记录 -->
      <div class="participation-record" v-if="userRegistration">
        <h2>我的参与记录</h2>
        <van-cell-group inset>
          <van-cell title="报名时间" :value="formatDateTime(userRegistration.createdAt)" />
          <van-cell title="报名状态" :value="getRegistrationStatusText(userRegistration.status)" />
          <van-cell title="参与人数" :value="`${userRegistration.attendeeCount}人`" />
          <van-cell 
            v-if="userRegistration.checkinTime" 
            title="签到时间" 
            :value="formatDateTime(userRegistration.checkinTime)" 
          />
        </van-cell-group>

        <!-- 签到按钮 -->
        <div class="checkin-section" v-if="canCheckIn">
          <van-button 
            type="success" 
            size="large" 
            block 
            @click="handleCheckIn"
            :loading="checkInLoading"
          >
            立即签到
          </van-button>
        </div>

        <!-- 评价按钮 -->
        <div class="evaluation-section" v-if="canEvaluate">
          <van-button 
            type="primary" 
            size="large" 
            block 
            @click="showEvaluationDialog = true"
          >
            活动评价
          </van-button>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="activity-actions">
        <van-button 
          v-if="canRegister" 
          type="primary" 
          size="large" 
          block 
          @click="showRegistrationDialog = true"
          :loading="registrationLoading"
        >
          立即报名
        </van-button>
        <van-button 
          v-else-if="isRegistered && !userRegistration?.checkinTime && activity.status === 3"
          type="success" 
          size="large" 
          block 
          @click="handleCheckIn"
          :loading="checkInLoading"
        >
          立即签到
        </van-button>
        <van-button 
          v-else-if="isRegistered"
          type="default" 
          size="large" 
          block 
          disabled
        >
          {{ getActionButtonText() }}
        </van-button>

        <!-- 分享按钮 -->
        <van-button 
          type="default" 
          size="large" 
          block 
          @click="handleShare"
          icon="share-o"
        >
          分享活动
        </van-button>
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
      <van-button type="primary" @click="loadActivityDetail">重新加载</van-button>
    </van-empty>

    <!-- 报名弹窗 -->
    <van-popup v-model:show="showRegistrationDialog" position="bottom" :style="{ height: '80%' }">
      <div class="registration-dialog">
        <div class="dialog-header">
          <h3>活动报名</h3>
          <van-button type="default" size="small" @click="showRegistrationDialog = false">
            取消
          </van-button>
        </div>
        <div class="dialog-content">
          <van-form @submit="handleRegistration">
            <van-cell-group inset>
              <van-field
                v-model="registrationForm.childName"
                name="childName"
                label="孩子姓名"
                placeholder="请输入孩子姓名"
                :rules="[{ required: true, message: '请输入孩子姓名' }]"
              />
              <van-field
                v-model="registrationForm.childAge"
                name="childAge"
                label="孩子年龄"
                placeholder="请输入孩子年龄"
                type="number"
                :rules="[{ required: true, message: '请输入孩子年龄' }]"
              />
              <van-field
                v-model="registrationForm.childGenderText"
                name="childGender"
                label="孩子性别"
                placeholder="请选择孩子性别"
                readonly
                is-link
                @click="showGenderPicker = true"
                :rules="[{ required: true, message: '请选择孩子性别' }]"
              />
              <van-field
                v-model="registrationForm.attendeeCount"
                name="attendeeCount"
                label="参与人数"
                placeholder="请输入参与人数"
                type="number"
                :rules="[{ required: true, message: '请输入参与人数' }]"
              />
              <van-field
                v-model="registrationForm.specialNeeds"
                name="specialNeeds"
                label="特殊需求"
                placeholder="如有特殊需求请说明"
                type="textarea"
                rows="3"
              />
            </van-cell-group>
            <div class="dialog-actions">
              <van-button type="primary" native-type="submit" block :loading="registrationLoading">
                确认报名
              </van-button>
            </div>
          </van-form>
        </div>
      </div>
    </van-popup>

    <!-- 性别选择器 -->
    <van-popup v-model:show="showGenderPicker" position="bottom">
      <van-picker
        :columns="genderColumns"
        @confirm="onGenderConfirm"
        @cancel="showGenderPicker = false"
      />
    </van-popup>

    <!-- 评价弹窗 -->
    <van-popup v-model:show="showEvaluationDialog" position="bottom" :style="{ height: '70%' }">
      <div class="evaluation-dialog">
        <div class="dialog-header">
          <h3>活动评价</h3>
          <van-button type="default" size="small" @click="showEvaluationDialog = false">
            取消
          </van-button>
        </div>
        <div class="dialog-content">
          <van-form @submit="handleEvaluation">
            <van-cell-group inset>
              <van-field name="rating" label="评分">
                <template #input>
                  <van-rate 
                    v-model="evaluationForm.rating" 
                    :size="25"
                    color="#ffd21e"
                    void-icon="star"
                    void-color="#eee"
                  />
                </template>
              </van-field>
              <van-field
                v-model="evaluationForm.content"
                name="content"
                label="评价内容"
                placeholder="请输入您的评价"
                type="textarea"
                rows="4"
                :rules="[{ required: true, message: '请输入评价内容' }]"
              />
            </van-cell-group>
            <div class="dialog-actions">
              <van-button type="primary" native-type="submit" block :loading="evaluationLoading">
                提交评价
              </van-button>
            </div>
          </van-form>
        </div>
      </div>
    </van-popup>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'
import { 
  getActivityDetail, 
  createRegistration, 
  type Activity 
} from '@/api/modules/activity'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 活动数据
const activity = ref<Activity | null>(null)
const loading = ref(false)
const error = ref(false)

// 用户报名记录
const userRegistration = ref(null)

// 弹窗控制
const showRegistrationDialog = ref(false)
const showGenderPicker = ref(false)
const showEvaluationDialog = ref(false)

// 表单数据
const registrationForm = ref({
  childName: '',
  childAge: '',
  childGender: 0,
  childGenderText: '',
  attendeeCount: '1',
  specialNeeds: ''
})

const evaluationForm = ref({
  rating: 5,
  content: ''
})

// 加载状态
const registrationLoading = ref(false)
const checkInLoading = ref(false)
const evaluationLoading = ref(false)

// 默认图标
const defaultImageIcon = 'photo-fail'

// 性别选项
const genderColumns = [
  { text: '男', value: 1 },
  { text: '女', value: 2 }
]

// 计算属性
const activityId = computed(() => Number(route.params.id))
const remainingCapacity = computed(() => {
  if (!activity.value) return 0
  return activity.value.capacity - (activity.value.registeredCount || 0)
})

const registrationProgress = computed(() => {
  if (!activity.value) return 0
  return Math.round(((activity.value.registeredCount || 0) / activity.value.capacity) * 100)
})

const canRegister = computed(() => {
  if (!activity.value || !userStore.isLoggedIn) return false
  return activity.value.status === 2 && remainingCapacity.value > 0 && !isRegistered.value
})

const isRegistered = computed(() => {
  return !!userRegistration.value
})

const canCheckIn = computed(() => {
  return isRegistered.value && 
         !userRegistration.value?.checkinTime && 
         activity.value?.status === 3
})

const canEvaluate = computed(() => {
  return isRegistered.value && 
         activity.value?.status === 4 && 
         !userRegistration.value?.hasEvaluated
})

const showRegistrationInfo = computed(() => {
  return activity.value && activity.value.status <= 3
})

// 方法
const loadActivityDetail = async () => {
  if (!activityId.value) return

  loading.value = true
  error.value = false

  try {
    const response = await getActivityDetail(activityId.value)
    if (response.success && response.data) {
      activity.value = response.data
    } else {
      error.value = true
    }
  } catch (error) {
    console.error('加载活动详情失败:', error)
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
    description: '这是一场充满乐趣的亲子运动会，通过各项体育活动增进亲子感情，培养孩子们的团队合作精神。',
    agenda: '09:00-09:30 签到入场\n09:30-10:00 开幕式\n10:00-11:30 亲子游戏\n11:30-12:00 颁奖仪式',
    registrationStartTime: '2024-11-01',
    registrationEndTime: '2024-11-13',
    needsApproval: 0,
    createdAt: '2024-10-20',
    updatedAt: '2024-11-01'
  }
}

const getStatusText = (status: number) => {
  const statusMap: Record<number, string> = {
    0: '草稿',
    1: '未开始',
    2: '报名中',
    3: '进行中',
    4: '已结束',
    5: '已取消'
  }
  return statusMap[status] || '未知'
}

const getRegistrationStatusText = (status: number) => {
  const statusMap: Record<number, string> = {
    0: '待审核',
    1: '已确认',
    2: '已拒绝',
    3: '已取消',
    4: '已签到',
    5: '未出席'
  }
  return statusMap[status] || '未知'
}

const formatActivityTime = (startTime: string, endTime: string) => {
  const start = new Date(startTime)
  const end = new Date(endTime)
  const formatDate = (date: Date) => {
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
  return `${formatDate(start)} - ${formatDate(end)}`
}

const formatRegistrationTime = (startTime: string, endTime: string) => {
  const start = new Date(startTime)
  const end = new Date(endTime)
  return `${start.getMonth() + 1}月${start.getDate()}日 - ${end.getMonth() + 1}月${end.getDate()}日`
}

const formatDateTime = (dateTime: string) => {
  const date = new Date(dateTime)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

const getActionButtonText = () => {
  if (userRegistration.value?.checkinTime) return '已签到'
  if (activity.value?.status === 4) return '已结束'
  if (remainingCapacity.value === 0) return '已满员'
  return '已报名'
}

const onGenderConfirm = ({ selectedValues }: any) => {
  registrationForm.value.childGender = selectedValues[0]
  registrationForm.value.childGenderText = selectedValues[0] === 1 ? '男' : '女'
  showGenderPicker.value = false
}

const handleRegistration = async () => {
  if (!activity.value) return

  try {
    await showConfirmDialog({
      title: '确认报名',
      message: '确定要报名参加这个活动吗？',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })

    registrationLoading.value = true

    const registrationData = {
      activityId: activity.value.id,
      childName: registrationForm.value.childName,
      childAge: Number(registrationForm.value.childAge),
      childGender: registrationForm.value.childGender,
      attendeeCount: Number(registrationForm.value.attendeeCount),
      specialNeeds: registrationForm.value.specialNeeds
    }

    // 调用报名API
    const response = await createRegistration(registrationData)
    
    if (response.success) {
      showToast('报名成功！')
      showRegistrationDialog.value = false
      
      // 更新活动信息
      if (activity.value) {
        activity.value.registeredCount = (activity.value.registeredCount || 0) + 1
      }
      
      // 重新加载详情
      await loadActivityDetail()
    } else {
      showToast(response.message || '报名失败，请重试')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('报名失败:', error)
      showToast('报名失败，请重试')
    }
  } finally {
    registrationLoading.value = false
  }
}

const handleCheckIn = async () => {
  try {
    await showConfirmDialog({
      title: '确认签到',
      message: '确定要签到吗？',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })

    checkInLoading.value = true

    // 调用签到API
    // TODO: 实现签到API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    showToast('签到成功！')
    
    // 更新签到状态
    if (userRegistration.value) {
      userRegistration.value.checkinTime = new Date().toISOString()
      userRegistration.value.status = 4
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('签到失败:', error)
      showToast('签到失败，请重试')
    }
  } finally {
    checkInLoading.value = false
  }
}

const handleEvaluation = async () => {
  try {
    if (evaluationForm.value.rating === 0) {
      showToast('请选择评分')
      return
    }

    if (!evaluationForm.value.content.trim()) {
      showToast('请输入评价内容')
      return
    }

    evaluationLoading.value = true

    // 调用评价API
    // TODO: 实现评价API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    showToast('评价提交成功！')
    showEvaluationDialog.value = false
    
    // 更新评价状态
    if (userRegistration.value) {
      userRegistration.value.hasEvaluated = true
    }
  } catch (error) {
    console.error('评价提交失败:', error)
    showToast('评价提交失败，请重试')
  } finally {
    evaluationLoading.value = false
  }
}

const handleShare = async () => {
  try {
    // 检查是否支持分享API
    if (navigator.share) {
      await navigator.share({
        title: activity.value?.title,
        text: activity.value?.description,
        url: window.location.href
      })
    } else {
      // 复制链接到剪贴板
      await navigator.clipboard.writeText(window.location.href)
      showToast('链接已复制到剪贴板')
    }
  } catch (error) {
    console.error('分享失败:', error)
    showToast('分享失败')
  }
}

onMounted(() => {
  loadActivityDetail()
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';
.activity-detail {
  padding-bottom: 100px;

  .activity-cover {
    position: relative;
    width: 100%;
    height: 200px;

    .image-error {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      background: var(--van-gray-2);
      color: var(--van-gray-5);
    }

    .activity-status {
      position: absolute;
      top: 16px;
      right: 16px;
      padding: 6px 12px;
      border-radius: 16px;
      font-size: var(--text-xs);
      font-weight: 500;
      color: white;
      backdrop-filter: blur(4px);

      &.status-2 {
        background: var(--van-success-color);
      }

      &.status-3 {
        background: var(--van-primary-color);
      }

      &.status-4 {
        background: var(--van-info-color);
      }

      &.status-5 {
        background: var(--van-danger-color);
      }
    }
  }

  .activity-info {
    margin-bottom: 16px;

    .activity-title {
      padding: var(--spacing-md);
      margin: 0;
      font-size: var(--text-xl);
      font-weight: 600;
      color: var(--van-text-color);
      text-align: center;
    }
  }

  .activity-description,
  .activity-agenda {
    margin-bottom: 16px;

    h2 {
      padding: 0 16px;
      margin: 0 0 12px 0;
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--van-text-color);
    }

    .description-content,
    .agenda-content {
      padding: 0 16px;
      font-size: var(--text-sm);
      line-height: 1.6;
      color: var(--van-text-color-2);
      white-space: pre-wrap;
    }
  }

  .registration-info {
    margin-bottom: 16px;

    h2 {
      padding: 0 16px;
      margin: 0 0 12px 0;
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--van-text-color);
    }

    .registration-progress {
      margin: var(--spacing-md);
      padding: var(--spacing-md);
      background: var(--card-bg);
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .progress-label {
        margin-bottom: 8px;
        font-size: var(--text-sm);
        font-weight: 500;
        color: var(--van-text-color);
      }

      .progress-text {
        margin-top: 8px;
        font-size: var(--text-xs);
        color: var(--van-text-color-2);
        text-align: right;
      }
    }
  }

  .participation-record {
    margin-bottom: 16px;

    h2 {
      padding: 0 16px;
      margin: 0 0 12px 0;
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--van-text-color);
    }

    .checkin-section,
    .evaluation-section {
      margin: var(--spacing-md);
    }
  }

  .activity-actions {
    position: fixed;
    bottom: 60px;
    left: 0;
    right: 0;
    padding: var(--spacing-md);
    background: var(--card-bg);
    border-top: 1px solid var(--van-gray-3);
    display: flex;
    gap: var(--spacing-md);

    .van-button {
      flex: 1;
      border-radius: 24px;
    }
  }
}

.registration-dialog,
.evaluation-dialog {
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
    padding: var(--spacing-md) 0;

    .dialog-actions {
      padding: var(--spacing-md);
    }
  }
}

// 响应式优化
@media (min-width: 768px) {
  .activity-detail {
    max-width: 768px;
    margin: 0 auto;

    .activity-actions {
      max-width: 768px;
      left: 50%;
      transform: translateX(-50%);
    }
  }
}
</style>