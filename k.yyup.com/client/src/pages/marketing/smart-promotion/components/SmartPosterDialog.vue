<template>
  <el-dialog
    v-model="dialogVisible"
    title="🎨 AI智能海报生成"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="poster-dialog-content">
      <!-- 步骤指示器 -->
      <el-steps :active="currentStep" align-center class="steps">
        <el-step title="选择活动" icon="Calendar" />
        <el-step title="设置偏好" icon="Setting" />
        <el-step title="生成海报" icon="Picture" />
      </el-steps>

      <!-- 步骤1: 选择活动 -->
      <div v-if="currentStep === 0" class="step-content">
        <h3>选择要推广的活动</h3>
        <div class="activity-selection">
          <el-select
            v-model="selectedActivityId"
            placeholder="请选择活动"
            style="width: 100%"
            filterable
            @change="handleActivityChange"
          >
            <el-option
              v-for="activity in activities"
              :key="activity.id"
              :label="activity.title"
              :value="activity.id"
            >
              <div class="activity-option">
                <div class="activity-title">{{ activity.title }}</div>
                <div class="activity-time">{{ formatDate(activity.startTime) }}</div>
              </div>
            </el-option>
          </el-select>

          <!-- 活动详情预览 -->
          <div v-if="selectedActivity" class="activity-preview">
            <h4>活动详情</h4>
            <div class="activity-info">
              <p><strong>活动名称：</strong>{{ selectedActivity.title }}</p>
              <p><strong>活动描述：</strong>{{ selectedActivity.description }}</p>
              <p><strong>活动时间：</strong>{{ formatDate(selectedActivity.startTime) }} 至 {{ formatDate(selectedActivity.endTime) }}</p>
              <p><strong>活动地点：</strong>{{ selectedActivity.location }}</p>
              <p><strong>参与人数：</strong>{{ selectedActivity.capacity }}人</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 步骤2: 设置偏好 -->
      <div v-if="currentStep === 1" class="step-content">
        <h3>设置海报偏好</h3>
        <el-form :model="preferences" label-width="120px">
          <el-form-item label="目标受众">
            <el-radio-group v-model="preferences.targetAudience">
              <el-radio value="parents">家长群体</el-radio>
              <el-radio value="teachers">教师群体</el-radio>
              <el-radio value="community">社区群体</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="海报风格">
            <el-radio-group v-model="preferences.style">
              <el-radio value="professional">专业商务</el-radio>
              <el-radio value="friendly">亲切友好</el-radio>
              <el-radio value="urgent">紧迫感</el-radio>
              <el-radio value="festive">节日庆典</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="包含元素">
            <el-checkbox-group v-model="includedElements">
              <el-checkbox value="qr">二维码</el-checkbox>
              <el-checkbox value="pricing">价格信息</el-checkbox>
              <el-checkbox value="incentives">推广激励</el-checkbox>
              <el-checkbox value="urgency">紧迫感文案</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="推广码">
            <el-input
              v-model="referralCode"
              placeholder="请输入推广码"
              :disabled="!selectedActivity"
            >
              <template #append>
                <el-button @click="generateReferralCode" :loading="generatingCode">
                  {{ referralCode ? '重新生成' : '生成推广码' }}
                </el-button>
              </template>
            </el-input>
            <div class="help-text">推广码用于追踪推广效果和计算奖励</div>
          </el-form-item>
        </el-form>
      </div>

      <!-- 步骤3: 生成海报 -->
      <div v-if="currentStep === 2" class="step-content">
        <div v-if="generating" class="generating-state">
          <div class="loading-animation">
            <UnifiedIcon name="default" />
          </div>
          <h3>AI正在为您生成专业推广海报...</h3>
          <div class="progress-steps">
            <div class="progress-step" :class="{ active: generationStep >= 1 }">
              <UnifiedIcon name="Edit" />
              <span>生成推广文案</span>
            </div>
            <div class="progress-step" :class="{ active: generationStep >= 2 }">
              <UnifiedIcon name="default" />
              <span>设计海报布局</span>
            </div>
            <div class="progress-step" :class="{ active: generationStep >= 3 }">
              <UnifiedIcon name="default" />
              <span>生成推广素材</span>
            </div>
          </div>
          <div class="tips">
            <p>💡 AI正在分析活动特点，为您量身定制推广方案</p>
            <p>🎨 根据您的偏好设置，生成最适合的海报风格</p>
            <p>📱 同时生成配套的社交媒体推广文案</p>
          </div>
        </div>

        <div v-else-if="generatedPoster" class="generation-result">
          <h3>🎉 海报生成成功！</h3>
          <div class="result-preview">
            <div class="poster-preview">
              <img :src="generatedPoster.posterUrl" alt="生成的海报" />
            </div>
            <div class="result-info">
              <div class="analytics">
                <h4>📊 预期效果</h4>
                <div class="metric">
                  <span>预估触达：</span>
                  <span class="value">{{ generatedPoster.analytics.estimatedReach }}人</span>
                </div>
                <div class="metric">
                  <span>预估转化：</span>
                  <span class="value">{{ generatedPoster.analytics.estimatedConversion }}人</span>
                </div>
                <div class="channels">
                  <span>推荐渠道：</span>
                  <el-tag 
                    v-for="channel in generatedPoster.analytics.suggestedChannels" 
                    :key="channel"
                    size="small"
                    style="margin-left: var(--spacing-sm);"
                  >
                    {{ channel }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="generation-ready">
          <h3>准备生成海报</h3>
          <div class="summary">
            <p><strong>活动：</strong>{{ selectedActivity?.title }}</p>
            <p><strong>目标受众：</strong>{{ getAudienceText(preferences.targetAudience) }}</p>
            <p><strong>海报风格：</strong>{{ getStyleText(preferences.style) }}</p>
            <p><strong>推广码：</strong>{{ referralCode }}</p>
          </div>
          <el-button type="primary" size="large" @click="startGeneration">
            <UnifiedIcon name="default" />
            开始生成AI海报
          </el-button>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button v-if="currentStep > 0" @click="prevStep">上一步</el-button>
        <el-button 
          v-if="currentStep < 2" 
          type="primary" 
          @click="nextStep"
          :disabled="!canProceed"
        >
          下一步
        </el-button>
        <el-button 
          v-if="currentStep === 2 && generatedPoster" 
          type="primary" 
          @click="confirmGeneration"
        >
          确认使用
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Calendar, Setting, Picture, Loading, Edit, Share, MagicStick } from '@element-plus/icons-vue'
import { smartPromotionApi } from '@/api/modules/smart-promotion'
import { getActivityPlans } from '@/api/modules/activity'
import { generateReferralCode } from '@/api/modules/marketing'

// Props & Emits
const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'poster-generated': [poster: any]
}>()

// 响应式数据
const dialogVisible = ref(false)
const currentStep = ref(0)
const generating = ref(false)
const generationStep = ref(0)
const generatingCode = ref(false)

const activities = ref<any[]>([])
const selectedActivityId = ref<number>()
const selectedActivity = ref<any>(null)
const referralCode = ref('')
const generatedPoster = ref<any>(null)

const preferences = ref({
  targetAudience: 'parents',
  style: 'friendly'
})

const includedElements = ref(['qr', 'incentives'])

// 计算属性
const canProceed = computed(() => {
  if (currentStep.value === 0) {
    return selectedActivityId.value && selectedActivity.value
  }
  if (currentStep.value === 1) {
    return referralCode.value && preferences.value.targetAudience && preferences.value.style
  }
  return true
})

// 监听器
watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
  if (val) {
    loadActivities()
  }
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

// 页面初始化
onMounted(() => {
  if (props.modelValue) {
    loadActivities()
  }
})

/**
 * 加载活动列表
 */
const loadActivities = async () => {
  try {
    const res = await getActivityPlans({ page: 1, pageSize: 100 })
    if (res.success) {
      activities.value = res.data.items || []
    }
  } catch (error) {
    ElMessage.error('加载活动列表失败')
  }
}

/**
 * 处理活动选择
 */
const handleActivityChange = (activityId: number) => {
  selectedActivity.value = activities.value.find(a => a.id === activityId)
  // 清空之前的推广码
  referralCode.value = ''
}

/**
 * 生成推广码
 */
const generateReferralCode = async () => {
  if (!selectedActivity.value) {
    ElMessage.warning('请先选择活动')
    return
  }

  try {
    generatingCode.value = true
    const res = await generateReferralCode({
      activity_id: selectedActivity.value.id,
      title: `${selectedActivity.value.title}推广`,
      description: `推广${selectedActivity.value.title}活动`,
      validity_days: 30,
      usage_limit: 1000
    })

    if (res.success) {
      referralCode.value = res.data.referral_code
      ElMessage.success('推广码生成成功')
    }
  } catch (error) {
    ElMessage.error('生成推广码失败')
  } finally {
    generatingCode.value = false
  }
}

/**
 * 下一步
 */
const nextStep = () => {
  if (canProceed.value) {
    currentStep.value++
  }
}

/**
 * 上一步
 */
const prevStep = () => {
  currentStep.value--
}

/**
 * 开始生成海报
 */
const startGeneration = async () => {
  try {
    generating.value = true
    generationStep.value = 0

    // 模拟生成步骤
    setTimeout(() => generationStep.value = 1, 1000)
    setTimeout(() => generationStep.value = 2, 2000)
    setTimeout(() => generationStep.value = 3, 3000)

    const res = await smartPromotionApi.generateCompletePoster({
      activityId: selectedActivityId.value!,
      referralCode: referralCode.value,
      preferences: {
        ...preferences.value,
        includeQR: includedElements.value.includes('qr'),
        includePricing: includedElements.value.includes('pricing')
      }
    })

    if (res.success) {
      generatedPoster.value = res.data
      ElMessage.success('AI海报生成成功！')
    }
  } catch (error) {
    ElMessage.error('生成海报失败')
  } finally {
    generating.value = false
  }
}

/**
 * 确认生成
 */
const confirmGeneration = () => {
  emit('poster-generated', generatedPoster.value)
  handleClose()
}

/**
 * 关闭对话框
 */
const handleClose = () => {
  dialogVisible.value = false
  // 重置状态
  currentStep.value = 0
  generating.value = false
  generationStep.value = 0
  generatedPoster.value = null
  selectedActivityId.value = undefined
  selectedActivity.value = null
  referralCode.value = ''
}

/**
 * 格式化日期
 */
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

/**
 * 获取受众文本
 */
const getAudienceText = (audience: string) => {
  const map = {
    parents: '家长群体',
    teachers: '教师群体',
    community: '社区群体'
  }
  return map[audience as keyof typeof map] || audience
}

/**
 * 获取风格文本
 */
const getStyleText = (style: string) => {
  const map = {
    professional: '专业商务',
    friendly: '亲切友好',
    urgent: '紧迫感',
    festive: '节日庆典'
  }
  return map[style as keyof typeof map] || style
}
</script>

<style scoped lang="scss">
.poster-dialog-content {
  .steps {
    margin-bottom: var(--spacing-3xl);
  }

  .step-content {
    min-min-height: 60px; height: auto;

    h3 {
      margin-bottom: var(--text-3xl);
      color: #2c3e50;
      text-align: center;
    }
  }

  .activity-selection {
    .activity-option {
      .activity-title {
        font-weight: bold;
      }
      .activity-time {
        font-size: var(--text-sm);
        color: var(--text-tertiary);
      }
    }

    .activity-preview {
      margin-top: var(--text-3xl);
      padding: var(--text-lg);
      background: var(--bg-gray-light);
      border-radius: var(--spacing-sm);

      h4 {
        margin-bottom: var(--text-sm);
        color: #2c3e50;
      }

      .activity-info p {
        margin: var(--spacing-sm) 0;
        line-height: 1.6;
      }
    }
  }

  .help-text {
    font-size: var(--text-sm);
    color: var(--text-tertiary);
    margin-top: var(--spacing-xs);
  }

  .generating-state {
    text-align: center;

    .loading-animation {
      margin-bottom: var(--text-3xl);

      .rotating {
        font-size: var(--text-5xl);
        color: var(--primary-color);
        animation: rotate 2s linear infinite;
      }
    }

    h3 {
      margin-bottom: var(--spacing-3xl);
      color: var(--primary-color);
    }

    .progress-steps {
      display: flex;
      justify-content: center;
      gap: var(--spacing-6xl);
      margin-bottom: var(--spacing-3xl);

      .progress-step {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--spacing-sm);
        opacity: 0.3;
        transition: opacity 0.3s;

        &.active {
          opacity: 1;
          color: var(--primary-color);
        }

        .el-icon {
          font-size: var(--text-3xl);
        }

        span {
          font-size: var(--text-base);
        }
      }
    }

    .tips {
      text-align: left;
      max-width: 100%; max-width: 400px;
      margin: 0 auto;

      p {
        margin: var(--spacing-sm) 0;
        color: var(--text-secondary);
        font-size: var(--text-base);
      }
    }
  }

  .generation-result {
    text-align: center;

    .result-preview {
      display: flex;
      gap: var(--text-3xl);
      margin-top: var(--text-3xl);

      .poster-preview {
        flex: 1;

        img {
          max-width: 100%;
          max-min-height: 60px; height: auto;
          border-radius: var(--spacing-sm);
          box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-light);
        }
      }

      .result-info {
        flex: 1;
        text-align: left;

        .analytics {
          background: var(--bg-gray-light);
          padding: var(--text-lg);
          border-radius: var(--spacing-sm);

          h4 {
            margin-bottom: var(--text-lg);
            color: #2c3e50;
          }

          .metric {
            display: flex;
            justify-content: space-between;
            margin-bottom: var(--text-sm);

            .value {
              font-weight: bold;
              color: #e74c3c;
            }
          }

          .channels {
            margin-top: var(--text-lg);
          }
        }
      }
    }
  }

  .generation-ready {
    text-align: center;

    .summary {
      background: var(--bg-gray-light);
      padding: var(--text-3xl);
      border-radius: var(--spacing-sm);
      margin: var(--text-3xl) 0;
      text-align: left;

      p {
        margin: var(--spacing-sm) 0;
        line-height: 1.6;
      }
    }
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
