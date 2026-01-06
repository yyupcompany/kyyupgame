<template>
  <div class="smart-promotion-center">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <UnifiedIcon name="default" />
          AI智能推广中心
        </h1>
        <p class="page-description">
          让AI为您生成专业推广海报，智能优化传播策略，实现快速裂变增长
        </p>
      </div>
      
      <!-- 快速统计 -->
      <div class="quick-stats">
        <div class="stat-card">
          <div class="stat-value">{{ rewardData.totalEarnings || 0 }}</div>
          <div class="stat-label">总收益 (元)</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ promotionStats.totalReferrals || 0 }}</div>
          <div class="stat-label">推广人数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ rewardData.currentLevel || 'bronze' }}</div>
          <div class="stat-label">当前等级</div>
        </div>
      </div>
    </div>

    <!-- 主要功能区域 -->
    <div class="main-content">
      <el-row :gutter="24">
        <!-- 左侧：AI海报生成 -->
        <el-col :span="16">
          <el-card class="poster-generation-card">
            <template #header>
              <div class="card-header">
                <h3>🎨 AI智能海报生成</h3>
                <el-button type="primary" @click="showPosterDialog = true">
                  <UnifiedIcon name="Plus" />
                  一键生成海报
                </el-button>
              </div>
            </template>

            <!-- 海报预览区域 -->
            <div class="poster-preview-area" v-if="generatedPoster">
              <div class="poster-container">
                <img :src="generatedPoster.posterUrl" alt="生成的推广海报" class="poster-image" />
                <div class="poster-actions">
                  <el-button @click="downloadPoster">
                    <UnifiedIcon name="Download" />
                    下载海报
                  </el-button>
                  <el-button @click="sharePoster">
                    <UnifiedIcon name="default" />
                    分享海报
                  </el-button>
                  <el-button @click="regeneratePoster">
                    <UnifiedIcon name="Refresh" />
                    重新生成
                  </el-button>
                </div>
              </div>
              
              <!-- 配套推广文案 -->
              <div class="social-content" v-if="generatedPoster.socialContent">
                <h4>📱 配套推广文案</h4>
                <el-tabs v-model="activeContentTab">
                  <el-tab-pane label="朋友圈" name="moments">
                    <div class="content-text">{{ generatedPoster.socialContent.wechatMoments }}</div>
                    <el-button size="small" @click="copyContent(generatedPoster.socialContent.wechatMoments)">
                      复制文案
                    </el-button>
                  </el-tab-pane>
                  <el-tab-pane label="微信群" name="group">
                    <div class="content-text">{{ generatedPoster.socialContent.wechatGroup }}</div>
                    <el-button size="small" @click="copyContent(generatedPoster.socialContent.wechatGroup)">
                      复制文案
                    </el-button>
                  </el-tab-pane>
                  <el-tab-pane label="私聊" name="personal">
                    <div class="content-text">{{ generatedPoster.socialContent.personalMessage }}</div>
                    <el-button size="small" @click="copyContent(generatedPoster.socialContent.personalMessage)">
                      复制文案
                    </el-button>
                  </el-tab-pane>
                </el-tabs>
              </div>
            </div>

            <!-- 空状态 -->
            <div class="empty-state" v-else>
              <el-empty description="还没有生成海报">
                <el-button type="primary" @click="showPosterDialog = true">
                  开始生成第一张海报
                </el-button>
              </el-empty>
            </div>
          </el-card>
        </el-col>

        <!-- 右侧：推广数据和激励 -->
        <el-col :span="8">
          <!-- 奖励等级卡片 -->
          <el-card class="reward-card" v-if="rewardData">
            <template #header>
              <h3>💰 推广奖励</h3>
            </template>
            
            <div class="reward-level">
              <div class="level-badge" :class="rewardData.currentLevel">
                {{ getLevelTitle(rewardData.currentLevel) }}
              </div>
              <div class="level-progress">
                <el-progress 
                  :percentage="rewardData.nextLevelProgress" 
                  :stroke-width="8"
                  :show-text="false"
                />
                <div class="progress-text">
                  距离下一等级还需 {{ Math.ceil((100 - rewardData.nextLevelProgress) / 100 * 20) }} 人
                </div>
              </div>
            </div>

            <div class="reward-stats">
              <div class="stat-item">
                <span class="label">总收益</span>
                <span class="value">¥{{ rewardData.totalEarnings }}</span>
              </div>
              <div class="stat-item">
                <span class="label">待结算</span>
                <span class="value">¥{{ rewardData.pendingRewards }}</span>
              </div>
              <div class="stat-item">
                <span class="label">预估月收入</span>
                <span class="value">¥{{ rewardData.estimatedMonthlyIncome }}</span>
              </div>
            </div>

            <el-button type="primary" block @click="generateIncentive">
              获取个性化激励建议
            </el-button>
          </el-card>

          <!-- 传播数据卡片 -->
          <el-card class="viral-card" style="margin-top: var(--text-lg);">
            <template #header>
              <h3>📊 传播数据</h3>
            </template>
            
            <div class="viral-stats" v-if="viralData">
              <div class="stat-row">
                <span>总触达人数</span>
                <span class="highlight">{{ viralData.totalReach }}</span>
              </div>
              <div class="stat-row">
                <span>病毒系数</span>
                <span class="highlight">{{ viralData.viralCoefficient.toFixed(2) }}</span>
              </div>
              <div class="stat-row">
                <span>转化率</span>
                <span class="highlight">{{ calculateConversionRate() }}%</span>
              </div>
            </div>

            <el-button type="primary" block @click="optimizeStrategy" :loading="optimizing">
              AI优化传播策略
            </el-button>
          </el-card>

          <!-- 个性化建议卡片 -->
          <el-card class="incentive-card" style="margin-top: var(--text-lg);" v-if="incentiveData">
            <template #header>
              <h3>🎯 个性化建议</h3>
            </template>
            
            <div class="incentive-content">
              <div class="social-recognition" v-if="incentiveData.socialRecognition">
                <el-alert 
                  :title="incentiveData.socialRecognition" 
                  type="success" 
                  :closable="false"
                  show-icon
                />
              </div>

              <div class="recommended-actions" v-if="incentiveData.recommendedActions">
                <h4>推荐行动</h4>
                <ul>
                  <li v-for="action in incentiveData.recommendedActions" :key="action">
                    {{ action }}
                  </li>
                </ul>
              </div>

              <div class="bonus-opportunities" v-if="incentiveData.bonusOpportunities">
                <h4>奖金机会</h4>
                <div class="bonus-item" v-for="bonus in incentiveData.bonusOpportunities" :key="bonus.title">
                  <div class="bonus-title">{{ bonus.title }}</div>
                  <div class="bonus-reward">奖励: {{ bonus.reward }}</div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- AI海报生成对话框 -->
    <SmartPosterDialog 
      v-model="showPosterDialog"
      @poster-generated="handlePosterGenerated"
    />

    <!-- 策略优化结果对话框 -->
    <StrategyOptimizationDialog
      v-model="showOptimizationDialog"
      :optimization-data="optimizationData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { MagicStick, Plus, Download, Share, Refresh } from '@element-plus/icons-vue'
import SmartPosterDialog from './components/SmartPosterDialog.vue'
import StrategyOptimizationDialog from './components/StrategyOptimizationDialog.vue'
import { smartPromotionApi } from '@/api/modules/smart-promotion'

// 响应式数据
const showPosterDialog = ref(false)
const showOptimizationDialog = ref(false)
const activeContentTab = ref('moments')
const optimizing = ref(false)

const generatedPoster = ref<any>(null)
const rewardData = ref<any>(null)
const promotionStats = ref<any>({})
const viralData = ref<any>(null)
const incentiveData = ref<any>(null)
const optimizationData = ref<any>(null)

// 页面初始化
onMounted(async () => {
  await loadInitialData()
})

/**
 * 加载初始数据
 */
const loadInitialData = async () => {
  try {
    // 并行加载数据
    const [rewardRes, statsRes] = await Promise.all([
      smartPromotionApi.calculateReward(),
      smartPromotionApi.getPromotionStats()
    ])

    if (rewardRes.success) {
      rewardData.value = rewardRes.data
    }

    if (statsRes.success) {
      promotionStats.value = statsRes.data
    }
  } catch (error) {
    console.error('加载初始数据失败:', error)
  }
}

/**
 * 处理海报生成完成
 */
const handlePosterGenerated = (poster: any) => {
  generatedPoster.value = poster
  ElMessage.success('AI海报生成成功！')
}

/**
 * 下载海报
 */
const downloadPoster = () => {
  if (generatedPoster.value?.downloadUrls?.jpg) {
    const link = document.createElement('a')
    link.href = generatedPoster.value.downloadUrls.jpg
    link.download = `推广海报_${Date.now()}.jpg`
    link.click()
    ElMessage.success('海报下载成功！')
  }
}

/**
 * 分享海报
 */
const sharePoster = () => {
  // 实现分享逻辑
  ElMessage.info('分享功能开发中...')
}

/**
 * 重新生成海报
 */
const regeneratePoster = () => {
  showPosterDialog.value = true
}

/**
 * 复制推广文案
 */
const copyContent = async (content: string) => {
  try {
    await navigator.clipboard.writeText(content)
    ElMessage.success('文案已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

/**
 * 生成个性化激励建议
 */
const generateIncentive = async () => {
  try {
    const res = await smartPromotionApi.generatePersonalizedIncentive()
    if (res.success) {
      incentiveData.value = res.data
      ElMessage.success('个性化建议生成成功！')
    }
  } catch (error) {
    ElMessage.error('生成激励建议失败')
  }
}

/**
 * 优化传播策略
 */
const optimizeStrategy = async () => {
  if (!generatedPoster.value?.referralCode) {
    ElMessage.warning('请先生成推广海报')
    return
  }

  try {
    optimizing.value = true
    
    // 先获取传播数据
    const viralRes = await smartPromotionApi.trackViralSpread(generatedPoster.value.referralCode)
    if (viralRes.success) {
      viralData.value = viralRes.data
    }

    // 然后优化策略
    const optimizeRes = await smartPromotionApi.optimizeViralStrategy(generatedPoster.value.referralCode)
    if (optimizeRes.success) {
      optimizationData.value = optimizeRes.data
      showOptimizationDialog.value = true
      ElMessage.success('传播策略优化完成！')
    }
  } catch (error) {
    ElMessage.error('优化传播策略失败')
  } finally {
    optimizing.value = false
  }
}

/**
 * 获取等级标题
 */
const getLevelTitle = (level: string) => {
  const titles = {
    bronze: '铜牌推广员',
    silver: '银牌推广员',
    gold: '金牌推广员',
    diamond: '钻石推广员'
  }
  return titles[level as keyof typeof titles] || '新手推广员'
}

/**
 * 计算转化率
 */
const calculateConversionRate = () => {
  if (!viralData.value?.conversionFunnel) return 0
  const { views, payments } = viralData.value.conversionFunnel
  return views > 0 ? ((payments / views) * 100).toFixed(1) : 0
}
</script>

<style scoped lang="scss">
.smart-promotion-center {
  padding: var(--text-3xl);
  background: var(--bg-hover);
  min-height: 100vh;
}

.page-header {
  background: white;
  padding: var(--spacing-3xl);
  border-radius: var(--text-sm);
  margin-bottom: var(--text-3xl);
  box-shadow: 0 2px var(--text-sm) var(--shadow-light);

  .header-content {
    text-align: center;
    margin-bottom: var(--spacing-3xl);

    .page-title {
      font-size: var(--spacing-3xl);
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: var(--text-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--text-sm);
    }

    .page-description {
      font-size: var(--text-lg);
      color: #7f8c8d;
      margin: 0;
    }
  }

  .quick-stats {
    display: flex;
    justify-content: center;
    gap: var(--spacing-6xl);

    .stat-card {
      text-align: center;

      .stat-value {
        font-size: var(--text-3xl);
        font-weight: bold;
        color: #e74c3c;
        margin-bottom: var(--spacing-sm);
      }

      .stat-label {
        font-size: var(--text-base);
        color: #95a5a6;
      }
    }
  }
}

.poster-generation-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
      font-size: var(--text-xl);
      color: #2c3e50;
    }
  }

  .poster-preview-area {
    .poster-container {
      text-align: center;
      margin-bottom: var(--text-3xl);

      .poster-image {
        max-width: 100%;
        max-min-height: 60px; height: auto;
        border-radius: var(--spacing-sm);
        box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-light);
        margin-bottom: var(--text-lg);
      }

      .poster-actions {
        display: flex;
        justify-content: center;
        gap: var(--text-sm);
      }
    }

    .social-content {
      h4 {
        margin-bottom: var(--text-lg);
        color: #2c3e50;
      }

      .content-text {
        background: var(--bg-gray-light);
        padding: var(--text-lg);
        border-radius: var(--spacing-sm);
        margin-bottom: var(--text-sm);
        line-height: 1.6;
        white-space: pre-wrap;
      }
    }
  }

  .empty-state {
    text-align: center;
    padding: var(--spacing-12xl) 0;
  }
}

.reward-card {
  .reward-level {
    text-align: center;
    margin-bottom: var(--text-3xl);

    .level-badge {
      display: inline-block;
      padding: var(--spacing-sm) var(--text-lg);
      border-radius: var(--text-2xl);
      font-weight: bold;
      margin-bottom: var(--text-lg);

      &.bronze { background: #cd7f32; color: white; }
      &.silver { background: #c0c0c0; color: white; }
      &.gold { background: #ffd700; color: var(--text-primary); }
      &.diamond { background: #b9f2ff; color: var(--text-primary); }
    }

    .level-progress {
      .progress-text {
        font-size: var(--text-sm);
        color: #7f8c8d;
        margin-top: var(--spacing-sm);
      }
    }
  }

  .reward-stats {
    margin-bottom: var(--text-3xl);

    .stat-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: var(--text-sm);

      .label {
        color: #7f8c8d;
      }

      .value {
        font-weight: bold;
        color: #e74c3c;
      }
    }
  }
}

.viral-card {
  .viral-stats {
    margin-bottom: var(--text-3xl);

    .stat-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: var(--text-sm);

      .highlight {
        font-weight: bold;
        color: #3498db;
      }
    }
  }
}

.incentive-card {
  .incentive-content {
    .social-recognition {
      margin-bottom: var(--text-lg);
    }

    h4 {
      margin: var(--text-lg) 0 var(--spacing-sm) 0;
      color: #2c3e50;
      font-size: var(--text-base);
    }

    ul {
      margin: 0;
      padding-left: var(--text-2xl);

      li {
        margin-bottom: var(--spacing-xs);
        font-size: var(--text-base);
        color: #5a6c7d;
      }
    }

    .bonus-item {
      background: var(--bg-gray-light);
      padding: var(--text-sm);
      border-radius: var(--radius-md);
      margin-bottom: var(--spacing-sm);

      .bonus-title {
        font-weight: bold;
        margin-bottom: var(--spacing-xs);
      }

      .bonus-reward {
        font-size: var(--text-sm);
        color: #e74c3c;
      }
    }
  }
}
</style>
