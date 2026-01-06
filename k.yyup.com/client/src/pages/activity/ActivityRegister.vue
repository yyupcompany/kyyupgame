<template>
  <div class="activity-register-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <UnifiedIcon name="default" />
      <p>加载中...</p>
    </div>

    <!-- 活动信息 -->
    <div v-else-if="activity" class="register-container">
      <!-- 活动海报 -->
      <div class="activity-header">
        <img 
          v-if="activity.posterUrl || activity.poster_url" 
          :src="activity.posterUrl || activity.poster_url" 
          alt="活动海报"
          class="activity-poster"
        />
        <div class="activity-title-overlay">
          <h1 class="activity-title">{{ activity.title }}</h1>
          <div class="activity-status" :class="`status-${activity.status}`">
            {{ getStatusText(activity.status) }}
          </div>
        </div>
      </div>

      <!-- 活动基本信息 -->
      <el-card class="info-card" shadow="never">
        <template #header>
          <div class="card-header">
            <UnifiedIcon name="default" />
            <span>活动信息</span>
          </div>
        </template>
        
        <el-descriptions :column="1" border>
          <el-descriptions-item label="活动时间">
            <UnifiedIcon name="default" />
            {{ formatDateTime(activity.startTime) }} - {{ formatDateTime(activity.endTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="活动地点">
            <UnifiedIcon name="default" />
            {{ activity.location }}
          </el-descriptions-item>
          <el-descriptions-item label="活动容量">
            <UnifiedIcon name="default" />
            {{ activity.registeredCount || 0 }} / {{ activity.capacity }} 人
            <el-progress 
              :percentage="getCapacityPercentage(activity)" 
              :color="getCapacityColor(activity)"
              :show-text="false"
              style="margin-top: var(--spacing-sm);"
            />
          </el-descriptions-item>
          <el-descriptions-item label="活动费用">
            <UnifiedIcon name="default" />
            <span v-if="activity.fee > 0" class="fee-price">¥{{ activity.fee }}</span>
            <span v-else class="fee-free">免费</span>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 营销配置信息 -->
      <el-card v-if="marketingConfig" class="marketing-card" shadow="never">
        <template #header>
          <div class="card-header">
            <UnifiedIcon name="default" />
            <span>优惠活动</span>
          </div>
        </template>

        <!-- 团购信息 -->
        <div v-if="marketingConfig.groupBuy?.enabled" class="marketing-item">
          <div class="marketing-label">
            <el-tag type="danger" effect="dark">团购优惠</el-tag>
          </div>
          <div class="marketing-content">
            <p>团购价: <span class="highlight-price">¥{{ marketingConfig.groupBuy.price }}</span></p>
            <p>成团人数: {{ marketingConfig.groupBuy.minCount }}人</p>
          </div>
        </div>

        <!-- 积分信息 -->
        <div v-if="marketingConfig.points?.enabled" class="marketing-item">
          <div class="marketing-label">
            <el-tag type="warning" effect="dark">积分奖励</el-tag>
          </div>
          <div class="marketing-content">
            <p>报名赠送: {{ marketingConfig.points.register }}积分</p>
            <p>分享赠送: {{ marketingConfig.points.share }}积分</p>
          </div>
        </div>

        <!-- 优惠券信息 -->
        <div v-if="marketingConfig.coupon?.enabled" class="marketing-item">
          <div class="marketing-label">
            <el-tag type="success" effect="dark">优惠券</el-tag>
          </div>
          <div class="marketing-content">
            <p>{{ marketingConfig.coupon.name }}</p>
            <p>满{{ marketingConfig.coupon.minAmount }}减{{ marketingConfig.coupon.discount }}</p>
          </div>
        </div>

        <!-- 分销信息 -->
        <div v-if="marketingConfig.distribution?.enabled" class="marketing-item">
          <div class="marketing-label">
            <el-tag type="info" effect="dark">分销奖励</el-tag>
          </div>
          <div class="marketing-content">
            <p>一级分销: {{ marketingConfig.distribution.level1 }}%</p>
            <p>二级分销: {{ marketingConfig.distribution.level2 }}%</p>
          </div>
        </div>
      </el-card>

      <!-- 活动描述 -->
      <el-card v-if="activity.description" class="description-card" shadow="never">
        <template #header>
          <div class="card-header">
            <UnifiedIcon name="default" />
            <span>活动详情</span>
          </div>
        </template>
        <div class="activity-description" v-html="activity.description"></div>
      </el-card>

      <!-- 活动议程 -->
      <el-card v-if="activity.agenda" class="agenda-card" shadow="never">
        <template #header>
          <div class="card-header">
            <UnifiedIcon name="default" />
            <span>活动议程</span>
          </div>
        </template>
        <div class="activity-agenda" v-html="activity.agenda"></div>
      </el-card>

      <!-- 报名表单 -->
      <el-card class="register-form-card" shadow="never">
        <template #header>
          <div class="card-header">
            <UnifiedIcon name="Edit" />
            <span>报名信息</span>
          </div>
        </template>

        <el-form
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          label-width="100px"
          label-position="top"
        >
          <el-form-item label="家长姓名" prop="parentName">
            <el-input 
              v-model="registerForm.parentName" 
              placeholder="请输入家长姓名"
              :prefix-icon="User"
            />
          </el-form-item>

          <el-form-item label="联系电话" prop="parentPhone">
            <el-input 
              v-model="registerForm.parentPhone" 
              placeholder="请输入联系电话"
              :prefix-icon="Phone"
              maxlength="11"
            />
          </el-form-item>

          <el-form-item label="学生姓名" prop="studentName">
            <el-input 
              v-model="registerForm.studentName" 
              placeholder="请输入学生姓名"
              :prefix-icon="User"
            />
          </el-form-item>

          <el-form-item label="学生年龄" prop="studentAge">
            <el-input-number 
              v-model="registerForm.studentAge" 
              :min="2" 
              :max="8"
              placeholder="请输入学生年龄"
            />
          </el-form-item>

          <el-form-item label="特殊需求" prop="specialNeeds">
            <el-input 
              v-model="registerForm.specialNeeds" 
              type="textarea"
              :rows="3"
              placeholder="如有特殊需求请填写（选填）"
            />
          </el-form-item>

          <!-- 支付方式选择 -->
          <el-form-item label="支付方式" prop="paymentMethod">
            <el-radio-group v-model="registerForm.paymentMethod">
              <el-radio label="normal">
                原价支付 ¥{{ activity.fee }}
              </el-radio>
              <el-radio 
                v-if="marketingConfig?.groupBuy?.enabled" 
                label="groupBuy"
              >
                团购支付 ¥{{ marketingConfig.groupBuy.price }}
                <el-tag size="small" type="danger">需{{ marketingConfig.groupBuy.minCount }}人成团</el-tag>
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item>
            <el-button 
              type="primary" 
              size="large" 
              :loading="submitting"
              @click="handleSubmit"
              style="width: 100%;"
            >
              <UnifiedIcon name="Check" />
              {{ submitting ? '提交中...' : '立即报名' }}
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 分享者信息 -->
      <div v-if="sharerInfo" class="sharer-info">
        <el-alert
          :title="`由 ${sharerInfo.realName || sharerInfo.username} 分享`"
          type="info"
          :closable="false"
          show-icon
        />
      </div>
    </div>

    <!-- 错误状态 -->
    <el-result
      v-else-if="error"
      icon="error"
      title="加载失败"
      :sub-title="error"
    >
      <template #extra>
        <el-button type="primary" @click="loadActivity">重新加载</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { 
  Loading, InfoFilled, Clock, Location, User, Money, Present, 
  Document, List, Edit, Check, Phone 
} from '@element-plus/icons-vue'
import { request } from '@/utils/request'

// 路由
const route = useRoute()
const router = useRouter()

// 活动ID和分享者ID
const activityId = ref<number>(0)
const sharerId = ref<number | null>(null)

// 数据状态
const loading = ref(true)
const submitting = ref(false)
const error = ref('')
const activity = ref<any>(null)
const sharerInfo = ref<any>(null)

// 营销配置
const marketingConfig = computed(() => {
  if (!activity.value?.marketingConfig) return null
  try {
    return typeof activity.value.marketingConfig === 'string' 
      ? JSON.parse(activity.value.marketingConfig)
      : activity.value.marketingConfig
  } catch {
    return null
  }
})

// 报名表单
const registerFormRef = ref<FormInstance>()
const registerForm = reactive({
  parentName: '',
  parentPhone: '',
  studentName: '',
  studentAge: 4,
  specialNeeds: '',
  paymentMethod: 'normal'
})

// 表单验证规则
const registerRules: FormRules = {
  parentName: [
    { required: true, message: '请输入家长姓名', trigger: 'blur' }
  ],
  parentPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  studentName: [
    { required: true, message: '请输入学生姓名', trigger: 'blur' }
  ],
  studentAge: [
    { required: true, message: '请输入学生年龄', trigger: 'blur' }
  ]
}

// 加载活动详情
const loadActivity = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await request.get(`/api/activities/${activityId.value}`)

    if (response.success) {
      activity.value = response.data

      // 如果有分享者ID，加载分享者信息
      if (sharerId.value) {
        await loadSharerInfo()
      }
    } else {
      error.value = response.message || '加载活动失败'
    }
  } catch (err: any) {
    error.value = err.message || '加载活动失败'
    ElMessage.error(error.value)
  } finally {
    loading.value = false
  }
}

// 加载分享者信息
const loadSharerInfo = async () => {
  try {
    const response = await request.get(`/api/users/${sharerId.value}`)
    if (response.success) {
      sharerInfo.value = response.data
    }
  } catch (err) {
    console.error('加载分享者信息失败:', err)
  }
}

// 提交报名
const handleSubmit = async () => {
  if (!registerFormRef.value) return

  await registerFormRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      submitting.value = true

      const registrationData = {
        activityId: activityId.value,
        contactName: registerForm.parentName,
        contactPhone: registerForm.parentPhone,
        childName: registerForm.studentName,
        childAge: registerForm.studentAge,
        specialNeeds: registerForm.specialNeeds,
        paymentMethod: registerForm.paymentMethod,
        sharerId: sharerId.value, // 分享者ID
        fee: registerForm.paymentMethod === 'groupBuy'
          ? marketingConfig.value?.groupBuy?.price
          : activity.value.fee
      }

      const response = await request.post('/activity-registrations', registrationData)

      if (response.success) {
        await ElMessageBox.alert(
          '报名成功！我们会尽快与您联系确认。',
          '报名成功',
          {
            confirmButtonText: '确定',
            type: 'success'
          }
        )

        // 重置表单
        registerFormRef.value?.resetFields()

        // 刷新活动信息
        await loadActivity()
      } else {
        ElMessage.error(response.message || '报名失败')
      }
    } catch (err: any) {
      ElMessage.error(err.message || '报名失败')
    } finally {
      submitting.value = false
    }
  })
}

// 格式化日期时间
const formatDateTime = (dateTime: string | Date) => {
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

// 获取状态文本
const getStatusText = (status: number) => {
  const statusMap: Record<number, string> = {
    0: '计划中',
    1: '报名中',
    2: '已满员',
    3: '进行中',
    4: '已结束',
    5: '已取消'
  }
  return statusMap[status] || '未知'
}

// 获取容量百分比
const getCapacityPercentage = (activity: any) => {
  const registered = activity.registeredCount || 0
  const capacity = activity.capacity || 1
  return Math.min(Math.round((registered / capacity) * 100), 100)
}

// 获取容量颜色
const getCapacityColor = (activity: any) => {
  const percentage = getCapacityPercentage(activity)
  if (percentage >= 100) return 'var(--danger-color)'
  if (percentage >= 80) return 'var(--warning-color)'
  return 'var(--success-color)'
}

// 初始化
onMounted(() => {
  // 从路由参数获取活动ID和分享者ID
  activityId.value = parseInt(route.params.id as string)
  sharerId.value = route.query.sharerId ? parseInt(route.query.sharerId as string) : null

  if (!activityId.value) {
    error.value = '活动ID无效'
    loading.value = false
    return
  }

  loadActivity()
})
</script>

<style scoped lang="scss">
.activity-register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
  padding: var(--text-2xl);

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    color: white;

    .el-icon {
      font-size: var(--text-5xl);
      margin-bottom: var(--text-lg);
    }
  }

  .register-container {
    max-width: 100%; max-width: 800px;
    margin: 0 auto;
  }

  .activity-header {
    position: relative;
    border-radius: var(--text-sm);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    margin-bottom: var(--text-2xl);
    box-shadow: 0 var(--spacing-sm) var(--text-3xl) var(--shadow-medium);

    .activity-poster {
      width: 100%;
      min-height: 60px; height: auto;
      object-fit: cover;
      display: block;
    }

    .activity-title-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(to top, var(--black-alpha-80), transparent);
      padding: var(--spacing-8xl) var(--text-2xl) var(--text-2xl);
      color: white;

      .activity-title {
        font-size: var(--text-3xl);
        font-weight: bold;
        margin: 0 0 10px 0;
        text-shadow: 2px 2px var(--spacing-xs) var(--black-alpha-50);
      }

      .activity-status {
        display: inline-block;
        padding: var(--spacing-lg) var(--text-lg);
        border-radius: var(--text-2xl);
        font-size: var(--text-base);
        font-weight: 500;

        &.status-1 {
          background: var(--success-color);
          color: white;
        }

        &.status-2 {
          background: var(--warning-color);
          color: white;
        }

        &.status-4 {
          background: var(--info-color);
          color: white;
        }
      }
    }
  }

  .info-card,
  .marketing-card,
  .description-card,
  .agenda-card,
  .register-form-card {
    margin-bottom: var(--text-2xl);
    border-radius: var(--text-sm);
    box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-light);

    :deep(.el-card__header) {
      background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
      color: white;
      border-bottom: none;
      padding: var(--text-lg) var(--text-2xl);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: var(--text-xl);
      font-weight: 600;
    }
  }

  .fee-price {
    color: var(--danger-color);
    font-size: var(--text-3xl);
    font-weight: bold;
  }

  .fee-free {
    color: var(--success-color);
    font-size: var(--text-xl);
    font-weight: bold;
  }

  .marketing-card {
    .marketing-item {
      padding: var(--text-lg);
      background: var(--bg-hover);
      border-radius: var(--spacing-sm);
      margin-bottom: var(--text-sm);

      &:last-child {
        margin-bottom: 0;
      }

      .marketing-label {
        margin-bottom: var(--spacing-sm);
      }

      .marketing-content {
        p {
          margin: var(--spacing-xs) 0;
          color: var(--text-regular);

          .highlight-price {
            color: var(--danger-color);
            font-size: var(--text-2xl);
            font-weight: bold;
          }
        }
      }
    }
  }

  .activity-description,
  .activity-agenda {
    line-height: 1.8;
    color: var(--text-regular);

    :deep(p) {
      margin: var(--spacing-sm) 0;
    }

    :deep(ul), :deep(ol) {
      padding-left: var(--text-2xl);
      margin: var(--spacing-sm) 0;
    }
  }

  .sharer-info {
    margin-top: var(--text-2xl);

    :deep(.el-alert) {
      border-radius: var(--spacing-sm);
    }
  }
}

// 移动端适配
@media (max-width: var(--breakpoint-md)) {
  .activity-register-page {
    padding: var(--spacing-2xl);

    .activity-header {
      .activity-poster {
        min-height: 60px; height: auto;
      }

      .activity-title-overlay {
        .activity-title {
          font-size: var(--text-2xl);
        }
      }
    }

    .info-card,
    .marketing-card,
    .description-card,
    .agenda-card,
    .register-form-card {
      margin-bottom: var(--text-sm);
    }
  }
}
</style>


