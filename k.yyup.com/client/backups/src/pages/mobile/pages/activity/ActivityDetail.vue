<template>
  <MobileLayout
    :title="activity.title"
    :show-back="true"
    :show-share="true"
    @back="handleBack"
    @share="handleShare"
  >
    <!-- 活动海报 -->
    <div class="activity-poster">
      <img 
        :src="activity.posterUrl || '/default-poster.jpg'" 
        :alt="activity.title"
        class="poster-image"
        @error="handleImageError"
      />
      <div class="poster-overlay">
        <h1 class="activity-title">{{ activity.title }}</h1>
        <div class="activity-status" :class="statusClass">
          {{ statusText }}
        </div>
      </div>
    </div>

    <!-- 活动信息 -->
    <div class="activity-info">
      <div class="info-section">
        <div class="info-item">
          <svg class="info-icon" viewBox="0 0 24 24">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.7L16.2,16.2Z"/>
          </svg>
          <div class="info-content">
            <div class="info-label">活动时间</div>
            <div class="info-value">{{ formatDateTime(activity.startTime) }} - {{ formatDateTime(activity.endTime) }}</div>
          </div>
        </div>

        <div class="info-item">
          <svg class="info-icon" viewBox="0 0 24 24">
            <path d="M12,2C8.13,2 5,5.13 5,9C5,14.25 12,22 12,22S19,14.25 19,9C19,5.13 15.87,2 12,2M12,11.5C10.62,11.5 9.5,10.38 9.5,9C9.5,7.62 10.62,6.5 12,6.5C13.38,6.5 14.5,7.62 14.5,9C14.5,10.38 13.38,11.5 12,11.5Z"/>
          </svg>
          <div class="info-content">
            <div class="info-label">活动地点</div>
            <div class="info-value">{{ activity.location }}</div>
          </div>
        </div>

        <div class="info-item">
          <svg class="info-icon" viewBox="0 0 24 24">
            <path d="M16,4C16.88,4 17.67,4.5 18,5.26L19,7H20A2,2 0 0,1 22,9V19A2,2 0 0,1 20,21H4A2,2 0 0,1 2,19V9A2,2 0 0,1 4,7H5L6,5.26C6.33,4.5 7.12,4 8,4H16M16.5,13.5A2.5,2.5 0 0,0 14,16A2.5,2.5 0 0,0 16.5,18.5A2.5,2.5 0 0,0 19,16A2.5,2.5 0 0,0 16.5,13.5M4,9V19H20V9H4Z"/>
          </svg>
          <div class="info-content">
            <div class="info-label">参与人数</div>
            <div class="info-value">限{{ activity.maxParticipants }}人</div>
          </div>
        </div>

        <div class="info-item">
          <svg class="info-icon" viewBox="0 0 24 24">
            <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z"/>
          </svg>
          <div class="info-content">
            <div class="info-label">活动费用</div>
            <div class="info-value">
              <span v-if="activity.isFree" class="free-tag">免费</span>
              <span v-else class="price">¥{{ activity.price }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 团购信息 -->
      <div v-if="activity.groupBuyEnabled" class="group-buy-section">
        <h3 class="section-title">🎉 团购优惠</h3>
        <div class="group-buy-info">
          <div class="group-buy-item">
            <span class="label">团购人数：</span>
            <span class="value">{{ activity.groupBuyMinCount }}人</span>
          </div>
          <div class="group-buy-item">
            <span class="label">团购价格：</span>
            <span class="value price">¥{{ activity.groupBuyPrice }}</span>
          </div>
          <div class="group-buy-item">
            <span class="label">团购截止：</span>
            <span class="value">{{ formatDateTime(activity.groupBuyDeadline) }}</span>
          </div>
        </div>
      </div>

      <!-- 活动描述 -->
      <div class="description-section">
        <h3 class="section-title">活动详情</h3>
        <div class="description-content" v-html="activity.description"></div>
      </div>
    </div>

    <!-- 报名按钮 -->
    <div class="action-buttons">
      <button 
        v-if="!isRegistered" 
        class="register-btn" 
        :disabled="!canRegister"
        @click="handleRegister"
      >
        {{ registerButtonText }}
      </button>
      <button 
        v-else 
        class="registered-btn" 
        disabled
      >
        已报名
      </button>
      
      <button class="share-btn" @click="handleShare">
        分享活动
      </button>
    </div>

    <!-- 报名表单弹窗 -->
    <div v-if="showRegisterForm" class="register-modal" @click="closeRegisterForm">
      <div class="register-form" @click.stop>
        <h3>报名参加活动</h3>
        <form @submit.prevent="submitRegistration">
          <div class="form-group">
            <label>姓名</label>
            <input v-model="registerForm.name" type="text" required placeholder="请输入您的姓名">
          </div>
          <div class="form-group">
            <label>手机号</label>
            <input v-model="registerForm.phone" type="tel" required placeholder="请输入手机号">
          </div>
          <div class="form-group">
            <label>备注</label>
            <textarea v-model="registerForm.notes" placeholder="其他需要说明的信息（可选）"></textarea>
          </div>
          <div class="form-actions">
            <button type="button" @click="closeRegisterForm">取消</button>
            <button type="submit" :disabled="submitting">
              {{ submitting ? '提交中...' : '确认报名' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 成功提示 -->
    <div v-if="showSuccessModal" class="success-modal" @click="closeSuccessModal">
      <div class="success-content" @click.stop>
        <div class="success-icon">✅</div>
        <h3>报名成功！</h3>
        <p>您已成功报名参加活动</p>
        <div class="success-actions">
          <button @click="generatePoster" class="poster-btn">
            🎨 生成专属海报
          </button>
          <button @click="closeSuccessModal" class="close-btn">
            关闭
          </button>
        </div>
      </div>
    </div>

    <!-- 海报生成弹窗 -->
    <div v-if="showPosterModal" class="poster-modal" @click="closePosterModal">
      <div class="poster-content" @click.stop>
        <h3>专属海报生成中...</h3>
        <div class="poster-preview">
          <img v-if="generatedPoster" :src="generatedPoster" alt="专属海报" />
          <div v-else class="poster-loading">
            <div class="loading-spinner"></div>
            <p>正在为您生成专属海报...</p>
          </div>
        </div>
        <div class="poster-actions" v-if="generatedPoster">
          <button @click="downloadPoster" class="download-btn">
            📥 下载海报
          </button>
          <button @click="sharePoster" class="share-poster-btn">
            📤 分享海报
          </button>
          <button @click="closePosterModal" class="close-btn">
            关闭
          </button>
        </div>
      </div>
    </div>

    <!-- AI聊天助手 -->
    <AIChatButton />
  </MobileLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { get, post } from '@/utils/request'
import { ACTIVITY_PLAN_ENDPOINTS } from '@/api/endpoints'
import { useMobileStore } from '../../stores/mobile'
import MobileLayout from '../../layouts/MobileLayout.vue'
import AIChatButton from '../../components/common/AIChatButton.vue'

const route = useRoute()
const router = useRouter()
const mobileStore = useMobileStore()
const activityId = route.params.id

// 获取分享参数
const shareBy = ref(null)
const shareType = ref(null)

// 响应式数据
const activity = ref({
  id: null,
  title: '测试发布功能活动',
  description: '这是一个测试发布功能的活动',
  startTime: '2025-08-10T00:00:00',
  endTime: '2025-08-11T00:00:00',
  location: '测试地点',
  maxParticipants: 1,
  isFree: false,
  price: 0,
  groupBuyEnabled: true,
  groupBuyMinCount: 3,
  groupBuyPrice: 30,
  groupBuyDeadline: '2025-07-09T00:00:00',
  posterUrl: null,
  status: 'published'
})

const isRegistered = ref(false)
const showRegisterForm = ref(false)
const showSuccessModal = ref(false)
const showPosterModal = ref(false)
const submitting = ref(false)
const generatedPoster = ref(null)

const registerForm = ref({
  name: '',
  phone: '',
  notes: ''
})

// 计算属性
const statusClass = computed(() => {
  switch (activity.value.status) {
    case 'published': return 'status-published'
    case 'draft': return 'status-draft'
    case 'ended': return 'status-ended'
    default: return 'status-unknown'
  }
})

const statusText = computed(() => {
  switch (activity.value.status) {
    case 'published': return '报名中'
    case 'draft': return '未发布'
    case 'ended': return '已结束'
    default: return '未知状态'
  }
})

const canRegister = computed(() => {
  return activity.value.status === 'published' && !isRegistered.value
})

const registerButtonText = computed(() => {
  if (activity.value.status !== 'published') return '活动未开始'
  if (isRegistered.value) return '已报名'
  return '立即报名'
})

// 方法
const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadActivity = async () => {
  try {
    const response = await get(ACTIVITY_PLAN_ENDPOINTS.GET_BY_ID(activityId))
    if (response.success && response.data) {
      // 映射后端字段到前端期望的字段
      const mappedData = {
        ...response.data,
        startDate: response.data.start_date || response.data.startDate,
        endDate: response.data.end_date || response.data.endDate,
        startTime: response.data.start_date || response.data.startDate || response.data.startTime,
        endTime: response.data.end_date || response.data.endDate || response.data.endTime,
        createdAt: response.data.created_at || response.data.createdAt,
        updatedAt: response.data.updated_at || response.data.updatedAt
      }
      activity.value = { ...activity.value, ...mappedData }
    }
  } catch (error) {
    console.error('加载活动详情失败:', error)
    // 使用模拟数据进行演示
    console.log('使用模拟数据进行演示')
    activity.value = {
      ...activity.value,
      id: activityId,
      title: '测试发布功能活动',
      description: '这是一个测试发布功能的活动，欢迎大家参加！我们将提供丰富的活动内容和精美的礼品。',
      status: 'published'
    }
  }
}

const handleRegister = () => {
  showRegisterForm.value = true
}

const closeRegisterForm = () => {
  showRegisterForm.value = false
  registerForm.value = { name: '', phone: '', notes: '' }
}

const submitRegistration = async () => {
  if (!registerForm.value.name || !registerForm.value.phone) {
    mobileStore.showToast('请填写姓名和手机号', 'warning')
    return
  }

  submitting.value = true

  try {
    // 报名API调用（包含分享参数）
    const response = await post(`/activity-plans/${activityId}/register`, {
      name: registerForm.value.name,
      phone: registerForm.value.phone,
      notes: registerForm.value.notes,
      // 包含分享追踪参数
      shareBy: shareBy.value,
      shareType: shareType.value
    })
    
    if (response.success) {
      isRegistered.value = true
      showRegisterForm.value = false
      showSuccessModal.value = true
      mobileStore.showToast('报名成功！', 'success')
    } else {
      mobileStore.showToast(response.message || '报名失败，请重试', 'error')
    }
  } catch (error) {
    console.error('报名失败:', error)
    mobileStore.showToast('报名失败，请重试', 'error')
  } finally {
    submitting.value = false
  }
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
}

const generatePoster = async () => {
  showSuccessModal.value = false
  showPosterModal.value = true
  
  // 模拟海报生成
  setTimeout(() => {
    generatedPoster.value = '/api/posters/generated-poster.jpg'
    mobileStore.showToast('海报生成成功！', 'success')
  }, 2000)
}

const closePosterModal = () => {
  showPosterModal.value = false
  generatedPoster.value = null
}

const downloadPoster = () => {
  if (generatedPoster.value) {
    const link = document.createElement('a')
    link.href = generatedPoster.value
    link.download = `${activity.value.title}-专属海报.jpg`
    link.click()
    mobileStore.showToast('海报下载成功', 'success')
  }
}

const sharePoster = async () => {
  if (generatedPoster.value) {
    await mobileStore.share({
      title: `${activity.value.title} - 专属海报`,
      description: '快来参加这个精彩的活动吧！',
      url: window.location.href,
      imageUrl: generatedPoster.value
    })
  }
}

const handleShare = async () => {
  const shareInfo = {
    title: activity.value.title,
    description: activity.value.description,
    url: window.location.href,
    imageUrl: activity.value.posterUrl
  }
  
  await mobileStore.share(shareInfo)
}

const handleBack = () => {
  router.back()
}

const handleImageError = (e) => {
  e.target.src = '/default-poster.jpg'
}

onMounted(() => {
  // 初始化分享参数
  if (route.query.shareBy) {
    shareBy.value = Number(route.query.shareBy)
  }
  if (route.query.shareType) {
    shareType.value = String(route.query.shareType)
  }
  console.log('分享者ID:', shareBy.value)
  console.log('分享类型:', shareType.value)

  loadActivity()
})
</script>

<style scoped>
.mobile-activity-detail {
  min-height: 100vh;
  background: var(--bg-secondary);
  padding-bottom: var(--spacing-20xl);
}

.activity-poster {
  position: relative;
  height: 250px;
  overflow: hidden;
}

.poster-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.poster-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, var(--black-alpha-70));
  padding: var(--text-2xl);
  color: white;
}

.activity-title {
  font-size: var(--text-2xl);
  font-weight: bold;
  margin: 0 0 var(--spacing-sm) 0;
}

.activity-status {
  display: inline-block;
  padding: var(--spacing-xs) var(--text-sm);
  border-radius: var(--text-sm);
  font-size: var(--text-sm);
  font-weight: bold;
}

.status-published {
  background: #4CAF50;
  color: white;
}

.status-draft {
  background: #FF9800;
  color: white;
}

.status-ended {
  background: #9E9E9E;
  color: white;
}

.activity-info {
  background: white;
  margin: -10px 0 0 0;
  border-radius: var(--radius-xl) 10px 0 0;
  padding: var(--text-2xl);
  padding-bottom: calc(100px + env(safe-area-inset-bottom));
}

.info-section {
  margin-bottom: var(--text-2xl);
}

.info-item {
  display: flex;
  align-items: center;
  padding: var(--text-sm) 0;
  border-bottom: var(--border-width-base) solid var(--bg-gray-light);
}

.info-item:last-child {
  border-bottom: none;
}

.info-icon {
  width: var(--text-2xl);
  height: var(--text-2xl);
  margin-right: var(--text-sm);
  fill: var(--text-secondary);
  flex-shrink: 0;
}

.info-content {
  flex: 1;
}

.info-label {
  font-size: var(--text-base);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.info-value {
  font-size: var(--text-lg);
  color: var(--text-primary);
  font-weight: 500;
}

.free-tag {
  background: #4CAF50;
  color: white;
  padding: var(--spacing-sm) var(--spacing-sm);
  border-radius: var(--spacing-xs);
  font-size: var(--text-sm);
}

.price {
  color: #FF5722;
  font-weight: bold;
}

.group-buy-section {
  background: #FFF3E0;
  border-radius: var(--spacing-sm);
  padding: var(--text-lg);
  margin: var(--text-2xl) 0;
}

.section-title {
  font-size: var(--text-lg);
  font-weight: bold;
  margin: 0 0 var(--text-sm) 0;
  color: var(--text-primary);
}

.group-buy-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.group-buy-item {
  display: flex;
  justify-content: space-between;
}

.group-buy-item .label {
  color: var(--text-secondary);
}

.group-buy-item .value {
  font-weight: 500;
}

.description-section {
  margin-top: var(--text-2xl);
}

.description-content {
  line-height: 1.6;
  color: var(--text-secondary);
  margin-top: var(--text-sm);
}

.action-buttons {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: var(--text-lg);
  padding-bottom: calc(var(--text-lg) + env(safe-area-inset-bottom));
  box-shadow: 0 -2px 10px var(--black-alpha-10);
  display: flex;
  gap: var(--text-sm);
  z-index: 100;
}

.register-btn, .registered-btn, .share-btn {
  flex: 1;
  min-height: var(--button-height-xl);
  padding: var(--text-base) var(--text-lg);
  border: none;
  border-radius: var(--text-sm);
  font-size: var(--text-lg);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.register-btn {
  background: #4CAF50;
  color: white;

  &:active:not(:disabled) {
    background: #45a049;
    transform: scale(0.98);
  }
}

.register-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.registered-btn {
  background: #9E9E9E;
  color: white;
  cursor: not-allowed;
  opacity: 0.8;
}

.share-btn {
  background: #2196F3;
  color: white;

  &:active {
    background: #1976d2;
    transform: scale(0.98);
  }
}

/* 弹窗样式 */
.register-modal, .success-modal, .poster-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--black-alpha-50);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--text-2xl);
}

.register-form, .success-content, .poster-content {
  background: white;
  border-radius: var(--text-sm);
  padding: var(--text-3xl);
  width: 100%;
  max-width: 400px;
}

.form-group {
  margin-bottom: var(--text-lg);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-lg);
  font-weight: 500;
  color: var(--text-primary);
}

.form-group input, .form-group textarea {
  width: 100%;
  padding: var(--text-sm);
  border: var(--border-width-base) solid #ddd;
  border-radius: var(--radius-md);
  font-size: var(--text-lg);
}

.form-group textarea {
  height: 80px;
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: var(--text-sm);
  margin-top: var(--text-2xl);
}

.form-actions button {
  flex: 1;
  padding: var(--text-sm);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-lg);
  cursor: pointer;
}

.form-actions button[type="button"] {
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.form-actions button[type="submit"] {
  background: #4CAF50;
  color: white;
}

.form-actions button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.success-icon {
  font-size: var(--text-5xl);
  text-align: center;
  margin-bottom: var(--text-lg);
}

.success-content h3 {
  text-align: center;
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--text-primary);
}

.success-content p {
  text-align: center;
  color: var(--text-secondary);
  margin: 0 0 var(--text-2xl) 0;
}

.success-actions {
  display: flex;
  flex-direction: column;
  gap: var(--text-sm);
}

.poster-btn {
  background: #FF5722;
  color: white;
  padding: var(--text-sm);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-lg);
  cursor: pointer;
}

.close-btn {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  padding: var(--text-sm);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-lg);
  cursor: pointer;
}

.poster-preview {
  text-align: center;
  margin: var(--text-2xl) 0;
}

.poster-preview img {
  max-width: 100%;
  border-radius: var(--spacing-sm);
}

.poster-loading {
  padding: var(--spacing-10xl) var(--text-2xl);
}

.loading-spinner {
  width: var(--icon-size); height: var(--icon-size);
  border: var(--spacing-xs) solid #f3f3f3;
  border-top: var(--spacing-xs) solid #4CAF50;
  border-radius: var(--radius-full);
  animation: spin 1s linear infinite;
  margin: 0 auto var(--text-lg);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.poster-actions {
  display: flex;
  flex-direction: column;
  gap: var(--text-sm);
}

.download-btn, .share-poster-btn {
  background: #4CAF50;
  color: white;
  padding: var(--text-sm);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-lg);
  cursor: pointer;
}

.share-poster-btn {
  background: #2196F3;
}

/* 响应式设计 */
@media (max-width: 375px) {
  .action-buttons {
    padding: var(--text-sm);
    padding-bottom: calc(var(--text-sm) + env(safe-area-inset-bottom));
    gap: var(--spacing-sm);
  }

  .register-btn, .registered-btn, .share-btn {
    min-height: var(--button-height-lg);
    padding: var(--text-sm) var(--text-base);
    font-size: var(--text-base);
  }

  .activity-info {
    padding: var(--text-lg);
    padding-bottom: calc(90px + env(safe-area-inset-bottom));
  }

  .activity-poster {
    height: 200px;
  }

  .activity-title {
    font-size: var(--text-xl);
  }
}

@media (max-width: 320px) {
  .action-buttons {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .register-btn, .registered-btn, .share-btn {
    flex: none;
    width: 100%;
  }

  .activity-info {
    padding-bottom: calc(140px + env(safe-area-inset-bottom));
  }
}

/* 横屏适配 */
@media (orientation: landscape) and (max-height: 500px) {
  .activity-poster {
    height: 150px;
  }

  .action-buttons {
    position: relative;
    margin-top: var(--text-2xl);
    box-shadow: none;
    border-top: var(--border-width-base) solid var(--bg-gray-light);
  }

  .activity-info {
    padding-bottom: var(--text-2xl);
  }
}

/* 大屏幕移动设备 */
@media (min-width: 41var(--spacing-xs)) and (max-width: 76var(--spacing-sm)) {
  .action-buttons {
    padding: var(--text-2xl);
    padding-bottom: calc(var(--text-2xl) + env(safe-area-inset-bottom));
    gap: var(--text-lg);
  }

  .register-btn, .registered-btn, .share-btn {
    min-height: 52px;
    padding: var(--text-lg) var(--text-2xl);
    font-size: var(--text-md);
  }
}
</style>
