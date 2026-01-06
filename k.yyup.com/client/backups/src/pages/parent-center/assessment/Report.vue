<template>
  <div class="assessment-report-page" ref="reportRef">
    <div class="container">
      <!-- 报告头部 -->
      <div class="report-header">
        <h1>发育商测评报告</h1>
        <div class="child-info">
          <span>{{ reportData.overall?.childName }}</span>
          <span>{{ reportData.overall?.age }}个月</span>
          <el-tag type="success" size="large">
            DQ: {{ reportData.overall?.dq }}
          </el-tag>
        </div>
      </div>

      <!-- 总体评价 -->
      <el-card class="section-card">
        <template #header>
          <h2>总体评价</h2>
        </template>
        <div class="overall-score">
          <div class="score-circle">
            <div class="score-value">{{ reportData.overall?.dq }}</div>
            <div class="score-label">发育商</div>
          </div>
          <div class="score-details">
            <div class="score-item">
              <span>总分</span>
              <strong>{{ reportData.overall?.totalScore }}/{{ reportData.overall?.maxScore }}</strong>
            </div>
            <div class="score-item">
              <span>测评日期</span>
              <strong>{{ formatDate(reportData.overall?.assessmentDate) }}</strong>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 各维度得分雷达图 -->
      <el-card class="section-card">
        <template #header>
          <h2>各维度得分</h2>
        </template>
        <div ref="chartRef" class="chart-container"></div>
      </el-card>

      <!-- 优势分析 -->
      <el-card v-if="reportData.strengths?.length" class="section-card">
        <template #header>
          <h2>优势分析</h2>
        </template>
        <div class="strengths-list">
          <el-tag
            v-for="(strength, index) in reportData.strengths"
            :key="index"
            type="success"
            size="large"
            class="strength-tag"
          >
            {{ strength }}
          </el-tag>
        </div>
      </el-card>

      <!-- AI生成的报告内容 -->
      <el-card class="section-card">
        <template #header>
          <h2>专业评估</h2>
        </template>
        <div class="ai-report-content" v-html="formatReportContent(reportData.aiReport)"></div>
      </el-card>

      <!-- 成长建议 -->
      <el-card v-if="reportData.recommendations?.length" class="section-card">
        <template #header>
          <h2>成长建议</h2>
        </template>
        <ul class="recommendations-list">
          <li v-for="(recommendation, index) in reportData.recommendations" :key="index">
            {{ recommendation }}
          </li>
        </ul>
      </el-card>

      <!-- 日常活动建议 -->
      <el-card v-if="reportData.dailyActivities?.length" class="section-card">
        <template #header>
          <h2>日常活动建议</h2>
        </template>
        <ul class="activities-list">
          <li v-for="(activity, index) in reportData.dailyActivities" :key="index">
            {{ activity }}
          </li>
        </ul>
      </el-card>

      <!-- 行动召唤区域（转化入口） -->
      <el-card class="section-card cta-section">
        <div class="cta-content">
          <div class="cta-main">
            <h2>想让孩子获得更好的成长？</h2>
            <p class="cta-subtitle">专业的教育团队，为您的孩子量身定制成长方案</p>
            <div class="cta-buttons">
              <el-button type="primary" size="large" class="cta-primary" @click="handleBookExperience">
                <el-icon><Calendar /></el-icon>
                预约体验课
              </el-button>
              <el-button type="success" size="large" class="cta-secondary" @click="handleConsultKindergarten">
                <el-icon><Phone /></el-icon>
                咨询园所
              </el-button>
            </div>
            <div class="social-proof">
              <span class="proof-text">已有 <strong>{{ socialProofCount }}</strong> 位家长预约体验课</span>
            </div>
          </div>
          <div class="cta-features">
            <div class="feature-item">
              <el-icon class="feature-icon"><Star /></el-icon>
              <div class="feature-content">
                <h4>专业师资</h4>
                <p>资深幼教团队，个性化指导</p>
              </div>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon"><School /></el-icon>
              <div class="feature-content">
                <h4>科学课程</h4>
                <p>基于测评结果，定制课程方案</p>
              </div>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon"><TrendCharts /></el-icon>
              <div class="feature-content">
                <h4>成长追踪</h4>
                <p>定期测评，见证孩子成长</p>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 园所价值展示 -->
      <el-card class="section-card kindergarten-showcase">
        <template #header>
          <h2>为什么选择我们？</h2>
        </template>
        <div class="showcase-content">
          <div class="showcase-grid">
            <div class="showcase-item">
              <div class="showcase-icon">
                <el-icon size="40"><Star /></el-icon>
              </div>
              <h3>专业师资团队</h3>
              <p>拥有10年以上教学经验的资深幼教团队，为每个孩子提供个性化指导</p>
            </div>
            <div class="showcase-item">
              <div class="showcase-icon">
                <el-icon size="40"><School /></el-icon>
              </div>
              <h3>科学课程体系</h3>
              <p>基于儿童发展心理学，设计符合2-6岁孩子成长规律的课程方案</p>
            </div>
            <div class="showcase-item">
              <div class="showcase-icon">
                <el-icon size="40"><TrendCharts /></el-icon>
              </div>
              <h3>成长追踪服务</h3>
              <p>每月定期测评，实时追踪孩子成长轨迹，提供专业成长建议</p>
            </div>
            <div class="showcase-item">
              <div class="showcase-icon">
                <el-icon size="40"><Calendar /></el-icon>
              </div>
              <h3>丰富活动体验</h3>
              <p>定期举办亲子活动、户外探索、艺术创作等，培养孩子综合能力</p>
            </div>
          </div>
          
          <!-- 家长评价 -->
          <div class="testimonials">
            <h3>家长评价</h3>
            <div class="testimonials-list">
              <div class="testimonial-item">
                <div class="testimonial-content">
                  <p>"这里的老师很专业，孩子在这里进步很大，特别是专注力和逻辑思维有了明显提升。"</p>
                </div>
                <div class="testimonial-author">
                  <span class="author-name">张妈妈</span>
                  <span class="author-child">孩子：5岁</span>
                </div>
              </div>
              <div class="testimonial-item">
                <div class="testimonial-content">
                  <p>"测评报告很详细，给出了很多实用的建议。现在孩子每个月都会来这里测评，能看到明显的成长轨迹。"</p>
                </div>
                <div class="testimonial-author">
                  <span class="author-name">李爸爸</span>
                  <span class="author-child">孩子：4岁</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 分享区域 -->
      <el-card class="section-card share-section">
        <template #header>
          <h2>分享报告</h2>
        </template>
        <div class="share-content">
          <div class="qr-code-container">
            <img v-if="reportData.qrCodeUrl" :src="reportData.qrCodeUrl" alt="二维码" class="qr-code" />
            <p class="qr-tip">扫码查看报告</p>
          </div>
          
          <!-- 分享统计（已注册用户） -->
          <div v-if="isRegistered && shareStats" class="share-stats">
            <div class="stat-item">
              <div class="stat-value">{{ shareStats.shareCount }}</div>
              <div class="stat-label">分享次数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ shareStats.scanCount }}</div>
              <div class="stat-label">扫码人数</div>
            </div>
            <div class="stat-item highlight">
              <div class="stat-value">{{ shareStats.conversionCount }}</div>
              <div class="stat-label">完成测评</div>
            </div>
            <div class="stat-item reward">
              <div class="stat-value">{{ shareStats.rewardPoints }}</div>
              <div class="stat-label">奖励积分</div>
            </div>
          </div>

          <!-- 分享激励提示 -->
          <div v-if="isRegistered" class="share-incentive">
            <el-alert type="success" :closable="false">
              <template #title>
                <strong>分享有奖！</strong>
                <p>每邀请1位好友完成测评，您可获得10积分奖励</p>
                <p>积分可兑换体验课优惠券、免费测评等福利</p>
              </template>
            </el-alert>
          </div>

          <div class="share-actions">
            <el-button type="primary" @click="handleShare('moments')">
              <el-icon><Share /></el-icon>
              分享到朋友圈
            </el-button>
            <el-button type="success" @click="handleShare('wechat')">
              <el-icon><ChatLineRound /></el-icon>
              分享给好友
            </el-button>
            <el-button @click="downloadReport">下载报告</el-button>
            <el-button @click="captureScreenshot">生成截图</el-button>
            <el-button @click="copyShareLink">复制链接</el-button>
          </div>
        </div>
      </el-card>

      <!-- 注册引导（未注册用户） -->
      <el-card v-if="!isRegistered" class="section-card register-guide">
        <template #header>
          <h2>注册账号，获取更多服务</h2>
        </template>
        <div class="register-content">
          <p>注册后可查看历史测评记录、成长追踪和更多专业建议</p>
          <el-button type="primary" size="large" @click="goToRegister">立即注册</el-button>
        </div>
      </el-card>
    </div>

    <!-- 预约体验课对话框 -->
    <el-dialog v-model="bookDialogVisible" title="预约体验课" width="500px">
      <el-form :model="bookForm" label-width="100px">
        <el-form-item label="家长姓名" required>
          <el-input v-model="bookForm.parentName" placeholder="请输入您的姓名" />
        </el-form-item>
        <el-form-item label="联系电话" required>
          <el-input v-model="bookForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="孩子姓名">
          <el-input v-model="bookForm.childName" disabled />
        </el-form-item>
        <el-form-item label="预约日期" required>
          <el-date-picker
            v-model="bookForm.preferredDate"
            type="date"
            placeholder="请选择日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="bookForm.notes" type="textarea" placeholder="如有特殊需求，请填写" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="bookDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitBooking">提交预约</el-button>
      </template>
    </el-dialog>

    <!-- 咨询园所对话框 -->
    <el-dialog v-model="consultDialogVisible" title="咨询园所" width="500px">
      <el-form :model="consultForm" label-width="100px">
        <el-form-item label="家长姓名" required>
          <el-input v-model="consultForm.parentName" placeholder="请输入您的姓名" />
        </el-form-item>
        <el-form-item label="联系电话" required>
          <el-input v-model="consultForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="孩子姓名">
          <el-input v-model="consultForm.childName" disabled />
        </el-form-item>
        <el-form-item label="咨询内容" required>
          <el-input
            v-model="consultForm.consultContent"
            type="textarea"
            :rows="4"
            placeholder="请输入您想咨询的问题"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="consultDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitConsultation">提交咨询</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Calendar, Phone, Star, School, TrendCharts, Share, ChatLineRound } from '@element-plus/icons-vue'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElDialog, ElForm, ElFormItem, ElInput, ElInputNumber, ElDatePicker, ElAlert } from 'element-plus'
import { assessmentApi } from '@/api/assessment'
import { assessmentShareApi } from '@/api/assessment-share'
import * as echarts from 'echarts'
import { useUserStore } from '@/stores/user'
import request from '@/utils/request'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const recordId = ref<number>(parseInt(route.params.recordId as string))
const reportData = ref<any>({})
const reportRef = ref<HTMLElement | null>(null)
const chartRef = ref<HTMLElement | null>(null)
const loading = ref(true)
const socialProofCount = ref(128) // 模拟数据，实际应从API获取
const shareStats = ref<any>(null)
const kindergartenInfo = ref<any>(null)

// 预约体验课对话框
const bookDialogVisible = ref(false)
const consultDialogVisible = ref(false)
const bookForm = ref({
  parentName: '',
  phone: '',
  childName: reportData.value.overall?.childName || '',
  preferredDate: '',
  notes: ''
})

const consultForm = ref({
  parentName: '',
  phone: '',
  childName: reportData.value.overall?.childName || '',
  consultContent: ''
})

// 预约体验课
const handleBookExperience = () => {
  if (!isRegistered.value) {
    ElMessage.warning('请先注册账号')
    router.push('/register')
    return
  }
  bookForm.value.childName = reportData.value.overall?.childName || ''
  bookDialogVisible.value = true
}

// 咨询园所
const handleConsultKindergarten = () => {
  consultForm.value.childName = reportData.value.overall?.childName || ''
  consultDialogVisible.value = true
}

// 提交预约
const submitBooking = async () => {
  try {
    // 这里应该调用预约API
    ElMessage.success('预约成功！我们的老师会在24小时内联系您')
    bookDialogVisible.value = false
    // 可以跳转到活动页面或显示确认信息
  } catch (error: any) {
    ElMessage.error('预约失败，请稍后重试')
  }
}

// 提交咨询
const submitConsultation = async () => {
  try {
    // 这里应该调用咨询API
    await request.post('/api/enrollment-consultations', {
      parentName: consultForm.value.parentName,
      childName: consultForm.value.childName,
      contactPhone: consultForm.value.phone,
      consultContent: consultForm.value.consultContent,
      sourceChannel: 'assessment_report',
      sourceDetail: JSON.stringify({
        recordId: recordId.value,
        assessmentType: 'development_quotient'
      })
    })
    ElMessage.success('咨询提交成功！我们的老师会在24小时内联系您')
    consultDialogVisible.value = false
  } catch (error: any) {
    ElMessage.error('提交失败，请稍后重试')
  }
}

const isRegistered = computed(() => !!userStore.userInfo)

// 加载报告
const loadReport = async () => {
  try {
    loading.value = true
    const response = await assessmentApi.getReport(recordId.value)
    if (response.data?.success) {
      reportData.value = response.data.data.content || {}
      
      // 如果报告未生成，等待一下再重试
      if (!reportData.value.overall) {
        setTimeout(() => {
          loadReport()
        }, 2000)
        return
      }

      // 生成雷达图
      setTimeout(() => {
        renderChart()
      }, 500)

      // 加载分享统计（已注册用户）
      if (isRegistered.value) {
        loadShareStats()
      }

      // 加载园所信息
      loadKindergartenInfo()
    } else {
      ElMessage.error('获取报告失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取报告失败')
  } finally {
    loading.value = false
  }
}

// 渲染雷达图
const renderChart = () => {
  if (!chartRef.value || !reportData.value.dimensions) return

  const chart = echarts.init(chartRef.value)
  const dimensions = reportData.value.dimensions
  const dimensionNames = Object.keys(dimensions).map(key => {
    const map: Record<string, string> = {
      attention: '专注力',
      memory: '记忆力',
      logic: '逻辑思维',
      language: '语言能力',
      motor: '精细动作',
      social: '社交能力'
    }
    return map[key] || key
  })

  const values = Object.values(dimensions).map((score: any) => {
    const maxScore = score.maxScore || 100
    const actualScore = score.score || 0
    return maxScore > 0 ? (actualScore / maxScore) * 100 : 0
  })

  const option = {
    radar: {
      indicator: dimensionNames.map(name => ({ name, max: 100 })),
      center: ['50%', '50%'],
      radius: '70%'
    },
    series: [{
      type: 'radar',
      data: [{
        value: values,
        name: '得分',
        areaStyle: {
          color: 'rgba(64, 158, 255, 0.3)'
        },
        lineStyle: {
          color: 'var(--primary-color)'
        }
      }]
    }]
  }

  chart.setOption(option)
}

// 格式化日期
const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

// 格式化报告内容
const formatReportContent = (content?: string) => {
  if (!content) return '报告生成中...'
  return content.replace(/\n/g, '<br>')
}

// 下载报告
const downloadReport = async () => {
  try {
    await captureScreenshot()
    ElMessage.success('报告下载成功')
  } catch (error) {
    ElMessage.error('下载失败')
  }
}

// 生成截图（使用html2canvas或fallback方案）
const captureScreenshot = async () => {
  if (!reportRef.value) return

  try {
    // 检查是否安装了html2canvas
    let html2canvas: any
    try {
      html2canvas = await import('html2canvas')
    } catch (error) {
      ElMessage.warning('截图功能需要安装html2canvas，请使用下载报告功能')
      return
    }

    const canvas = await html2canvas.default(reportRef.value, {
      backgroundColor: 'var(--bg-color)',
      scale: 2
    })

    const link = document.createElement('a')
    link.download = `测评报告_${reportData.value.overall?.childName}_${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    
    ElMessage.success('截图已保存')
  } catch (error) {
    console.error('截图失败:', error)
    ElMessage.error('截图失败，请尝试下载报告')
  }
}

// 加载分享统计
const loadShareStats = async () => {
  try {
    const response = await assessmentShareApi.getShareStats(recordId.value)
    if (response.data?.success) {
      shareStats.value = response.data.data
    }
  } catch (error) {
    console.error('加载分享统计失败:', error)
  }
}

// 处理分享
const handleShare = async (channel: 'wechat' | 'moments') => {
  try {
    await assessmentShareApi.recordShare({
      recordId: recordId.value,
      shareChannel: channel === 'moments' ? 'moments' : 'wechat',
      sharePlatform: 'wechat'
    })
    
    // 复制分享链接
    await copyShareLink()
    
    ElMessage.success(channel === 'moments' ? '链接已复制，请分享到朋友圈' : '链接已复制，请分享给好友')
  } catch (error: any) {
    ElMessage.error('分享失败')
  }
}

// 复制分享链接
const copyShareLink = async () => {
  try {
    const shareUrl = `${window.location.origin}/parent-center/assessment/report/${recordId.value}${userStore.userInfo ? `?ref=${userStore.userInfo.id}` : ''}`
    await navigator.clipboard.writeText(shareUrl)
    ElMessage.success('链接已复制到剪贴板')
    
    // 记录分享
    if (isRegistered.value) {
      await assessmentShareApi.recordShare({
        recordId: recordId.value,
        shareChannel: 'link'
      }).catch(() => {})
    }
  } catch (error) {
    ElMessage.error('复制失败，请手动复制')
  }
}

// 前往注册
const goToRegister = () => {
  router.push(`/register?redirect=${encodeURIComponent(route.fullPath)}`)
}

onMounted(() => {
  loadReport()
})
</script>

<style scoped lang="scss">
.assessment-report-page {
  min-height: 100vh;
  background: var(--bg-hover);
  padding: var(--text-2xl);

  .container {
    max-width: 1000px;
    margin: 0 auto;
    background: white;
    border-radius: var(--spacing-sm);
    padding: var(--spacing-10xl);

    .report-header {
      text-align: center;
      margin-bottom: var(--spacing-10xl);
      padding-bottom: var(--text-2xl);
      border-bottom: 2px solid var(--border-color);

      h1 {
        margin-bottom: var(--text-2xl);
        color: var(--text-primary);
      }

      .child-info {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: var(--text-2xl);
        font-size: var(--text-xl);
        color: var(--text-secondary);
      }
    }

    .section-card {
      margin-bottom: var(--spacing-8xl);

      h2 {
        margin: 0;
        color: var(--text-primary);
      }

      .overall-score {
        display: flex;
        justify-content: space-around;
        align-items: center;
        padding: var(--spacing-10xl) 0;

        .score-circle {
          width: 150px;
          height: 150px;
          border-radius: var(--radius-full);
          border: var(--spacing-sm) solid var(--primary-color);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          .score-value {
            font-size: var(--text-5xl);
            font-weight: bold;
            color: var(--primary-color);
          }

          .score-label {
            font-size: var(--text-base);
            color: var(--text-secondary);
          }
        }

        .score-details {
          .score-item {
            margin-bottom: var(--spacing-4xl);
            display: flex;
            justify-content: space-between;
            min-width: 200px;

            span {
              color: var(--text-secondary);
            }

            strong {
              color: var(--text-primary);
            }
          }
        }
      }

      .chart-container {
        width: 100%;
        height: 400px;
      }

      .strengths-list {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-2xl);

        .strength-tag {
          font-size: var(--text-lg);
          padding: var(--spacing-sm) var(--text-lg);
        }
      }

      .ai-report-content {
        line-height: 1.8;
        color: var(--text-regular);
        font-size: var(--text-lg);
      }

      .recommendations-list,
      .activities-list {
        list-style: none;
        padding: 0;

        li {
          padding: var(--spacing-2xl) 0;
          border-bottom: var(--border-width-base) solid #eee;
          color: var(--text-regular);
          line-height: 1.8;

          &:last-child {
            border-bottom: none;
          }

          &:before {
            content: '•';
            color: var(--primary-color);
            margin-right: var(--spacing-2xl);
            font-weight: bold;
          }
        }
      }

      .share-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--text-2xl);

        .qr-code-container {
          text-align: center;

          .qr-code {
            width: 200px;
            height: 200px;
            border: var(--border-width-base) solid var(--border-color);
            border-radius: var(--spacing-sm);
          }

          .qr-tip {
            margin-top: var(--spacing-2xl);
            color: var(--text-secondary);
          }
        }

        .share-actions {
          display: flex;
          gap: var(--spacing-2xl);
        }
      }

      &.register-guide {
        background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
        color: white;

        h2 {
          color: white;
        }

        .register-content {
          text-align: center;
          padding: var(--text-2xl) 0;

          p {
            margin-bottom: var(--text-2xl);
            font-size: var(--text-lg);
          }
        }
      }
    }
  }
}
</style>

