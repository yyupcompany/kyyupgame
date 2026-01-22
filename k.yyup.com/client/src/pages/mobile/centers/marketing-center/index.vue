<template>
  <MobileCenterLayout title="营销中心" back-path="/mobile/centers">
    <template #right>
      <van-icon name="plus" size="20" @click="handleCreateCampaign" />
    </template>

    <div class="marketing-center-mobile">
      <!-- 统计卡片 -->
      <div class="stats-section">
        <van-grid :column-num="2" :gutter="12">
          <van-grid-item v-for="stat in statsData" :key="stat.key" class="stat-card">
            <div class="stat-content">
              <van-icon :name="stat.icon" :color="stat.color" size="24" />
              <div class="stat-value">{{ stat.value }}<span class="unit">{{ stat.unit }}</span></div>
              <div class="stat-label">{{ stat.label }}</div>
              <div class="stat-trend" v-if="stat.trend !== undefined">
                <van-tag size="medium" :type="stat.trend >= 0 ? 'success' : 'danger'">
                  {{ stat.trend >= 0 ? '+' : '' }}{{ stat.trend }}%
                </van-tag>
              </div>
            </div>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 核心功能 -->
      <div class="features-section">
        <div class="section-title">营销核心功能</div>
        <van-grid :column-num="2" :gutter="12">
          <van-grid-item
            v-for="feature in features"
            :key="feature.key"
            class="feature-card"
            @click="navigateToFeature(feature.key)"
          >
            <div class="feature-content">
              <div class="feature-icon">{{ feature.emoji }}</div>
              <div class="feature-info">
                <div class="feature-name">{{ feature.name }}</div>
                <div class="feature-desc">{{ feature.desc }}</div>
              </div>
            </div>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 活动列表 -->
      <div class="campaigns-section">
        <div class="section-header">
          <span class="section-title">营销活动</span>
          <van-button size="medium" plain @click="viewAllCampaigns">查看全部</van-button>
        </div>

        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <van-list
            v-model:loading="loading"
            :finished="finished"
            finished-text="没有更多了"
            @load="onLoad"
          >
            <div v-if="campaigns.length === 0 && !loading" class="empty-state">
              <van-empty description="暂无营销活动" />
            </div>
            <div
              v-for="item in campaigns"
              :key="item.id"
              class="campaign-card"
              @click="viewCampaign(item)"
            >
              <div class="card-header">
                <div class="card-title">{{ item.name }}</div>
                <van-tag size="medium" :type="getStatusType(item.status)">
                  {{ getStatusLabel(item.status) }}
                </van-tag>
              </div>
              <div class="card-content">
                <div class="info-item">
                  <span class="label">活动类型</span>
                  <span class="value">{{ item.type }}</span>
                </div>
                <div class="info-item">
                  <span class="label">活动时间</span>
                  <span class="value">{{ item.startDate }} ~ {{ item.endDate }}</span>
                </div>
              </div>
              <div class="card-stats">
                <div class="stat-item">
                  <div class="stat-num">{{ item.participants }}</div>
                  <div class="stat-label">参与人数</div>
                </div>
                <div class="stat-item">
                  <div class="stat-num">{{ item.conversions }}</div>
                  <div class="stat-label">转化数</div>
                </div>
                <div class="stat-item">
                  <div class="stat-num">{{ item.conversionRate }}%</div>
                  <div class="stat-label">转化率</div>
                </div>
              </div>
            </div>
          </van-list>
        </van-pull-refresh>
      </div>
    </div>
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'

const router = useRouter()

// 状态
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

// 数据
const campaigns = ref<any[]>([])

// 统计数据
const statsData = reactive([
  { key: 'active', label: '活跃活动', value: 5, unit: '个', icon: 'fire-o', color: '#6366f1', trend: 25 },
  { key: 'customers', label: '本月新客户', value: 128, unit: '人', icon: 'friends-o', color: '#10b981', trend: 18 },
  { key: 'conversion', label: '转化率', value: 32.5, unit: '%', icon: 'chart-trending-o', color: '#f59e0b', trend: 5 },
  { key: 'roi', label: '营销ROI', value: 285, unit: '%', icon: 'gold-coin-o', color: '#3b82f6', trend: 12 }
])

// 功能模块
const features = [
  { key: 'channels', name: '渠道管理', desc: '线上线下渠道配置', emoji: '🎯' },
  { key: 'referrals', name: '老带新', desc: '推荐奖励管理', emoji: '👥' },
  { key: 'conversions', name: '转化跟踪', desc: '客户转化分析', emoji: '📊' },
  { key: 'analysis', name: '效果分析', desc: '营销数据报表', emoji: '📈' }
]

// 初始化
onMounted(() => {
  loadCampaigns()
})

// 加载活动
const loadCampaigns = async () => {
  try {
    loading.value = true
    // TODO: 调用API
    campaigns.value = [
      { id: 1, name: '春季招生优惠活动', type: '招生促销', status: 'active', startDate: '2026-01-01', endDate: '2026-03-31', participants: 256, conversions: 45, conversionRate: 17.6 },
      { id: 2, name: '老带新奖励计划', type: '转介绍', status: 'active', startDate: '2026-01-01', endDate: '2026-12-31', participants: 89, conversions: 23, conversionRate: 25.8 },
      { id: 3, name: '开学季体验课', type: '体验活动', status: 'ended', startDate: '2025-09-01', endDate: '2025-09-30', participants: 156, conversions: 52, conversionRate: 33.3 }
    ]
    finished.value = true
  } catch (error) {
    console.error('加载活动失败:', error)
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 刷新
const onRefresh = () => loadCampaigns()
const onLoad = () => { finished.value = true }

// 状态映射
const getStatusType = (status: string) => {
  const map: Record<string, string> = { active: 'success', pending: 'warning', ended: 'default', paused: 'danger' }
  return map[status] || 'default'
}

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = { active: '进行中', pending: '待开始', ended: '已结束', paused: '已暂停' }
  return map[status] || '未知'
}

// 操作
const handleCreateCampaign = () => showToast('创建营销活动')
const navigateToFeature = (key: string) => showToast(`进入${key}功能`)
const viewAllCampaigns = () => showToast('查看全部活动')
const viewCampaign = (item: any) => showToast(`查看活动: ${item.name}`)
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;
@import '@/styles/mixins/responsive-mobile.scss';
.marketing-center-mobile {
  min-height: 100vh;
  background: var(--van-background-2);
  padding-bottom: 20px;
}

.stats-section {
  padding: 12px;
}

.stat-card {
  :deep(.van-grid-item__content) {
    padding: 12px;
    background: var(--van-background);
    border-radius: 8px;
  }
}

.stat-content {
  text-align: center;
  
  .stat-value {
    font-size: 22px;
    font-weight: 600;
    color: var(--van-text-color);
    margin: 6px 0 2px;
    
    .unit {
      font-size: 12px;
      font-weight: normal;
      margin-left: 2px;
    }
  }
  
  .stat-label {
    font-size: 12px;
    color: var(--van-text-color-2);
  }
  
  .stat-trend {
    margin-top: 4px;
  }
}

.features-section {
  padding: 0 12px 12px;
  
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--van-text-color);
    margin-bottom: 12px;
  }
}

.feature-card {
  :deep(.van-grid-item__content) {
    padding: 0;
    background: transparent;
  }
  
  .feature-content {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--van-background);
    border-radius: 8px;
    width: 100%;
    
    .feature-icon {
      font-size: 28px;
    }
    
    .feature-info {
      flex: 1;
      
      .feature-name {
        font-size: 14px;
        font-weight: 500;
        color: var(--van-text-color);
      }
      
      .feature-desc {
        font-size: 11px;
        color: var(--van-text-color-3);
        margin-top: 2px;
      }
    }
  }
}

.campaigns-section {
  padding: 0 12px;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--van-text-color);
    }
  }
}

.campaign-card {
  background: var(--van-background);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    
    .card-title {
      font-size: 15px;
      font-weight: 500;
      color: var(--van-text-color);
    }
  }
  
  .card-content {
    margin-bottom: 10px;
    
    .info-item {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      margin-bottom: 6px;
      
      .label {
        color: var(--van-text-color-2);
      }
      
      .value {
        color: var(--van-text-color);
      }
    }
  }
  
  .card-stats {
    display: flex;
    justify-content: space-around;
    padding-top: 10px;
    border-top: 1px solid var(--van-border-color);
    
    .stat-item {
      text-align: center;
      
      .stat-num {
        font-size: 18px;
        font-weight: 600;
        color: var(--van-primary-color);
      }
      
      .stat-label {
        font-size: 11px;
        color: var(--van-text-color-3);
        margin-top: 2px;
      }
    }
  }
}

.empty-state {
  padding: 40px 0;
}
</style>
