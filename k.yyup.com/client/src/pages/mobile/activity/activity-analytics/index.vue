<template>
  <MobileCenterLayout title="活动分析" back-path="/mobile/activity/activity-index">
    <template #right>
      <van-icon name="share-o" size="20" @click="handleExport" />
    </template>

    <div class="activity-analytics-mobile">
      <!-- 活动选择 -->
      <div class="activity-selector">
        <van-dropdown-menu>
          <van-dropdown-item v-model="selectedActivityId" :options="activityOptions" @change="handleActivityChange" />
        </van-dropdown-menu>
      </div>

      <!-- 数据概览 -->
      <div class="overview-section">
        <h3 class="section-title">数据概览</h3>
        <van-grid :column-num="2" :gutter="12" :border="false">
          <van-grid-item>
            <div class="overview-card">
              <div class="card-value">{{ overview.totalParticipants }}</div>
              <div class="card-label">总参与人数</div>
              <div class="card-trend up">
                <van-icon name="arrow-up" /> +12%
              </div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="overview-card">
              <div class="card-value">{{ overview.checkinRate }}%</div>
              <div class="card-label">签到率</div>
              <div class="card-trend up">
                <van-icon name="arrow-up" /> +5%
              </div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="overview-card">
              <div class="card-value">¥{{ overview.totalRevenue }}</div>
              <div class="card-label">总收入</div>
              <div class="card-trend up">
                <van-icon name="arrow-up" /> +8%
              </div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="overview-card">
              <div class="card-value">{{ overview.averageRating }}</div>
              <div class="card-label">平均评分</div>
              <div class="card-trend">
                <van-rate v-model="overview.averageRating" allow-half readonly size="12" />
              </div>
            </div>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 报名趋势 -->
      <div class="trend-section">
        <div class="section-header">
          <h3 class="section-title">报名趋势</h3>
          <van-tabs v-model:active="trendPeriod" class="period-tabs">
            <van-tab title="7天" name="7d" />
            <van-tab title="30天" name="30d" />
          </van-tabs>
        </div>
        <div class="chart-placeholder">
          <div class="mini-chart">
            <div
              v-for="(item, index) in trendData"
              :key="index"
              class="chart-bar"
              :style="{ height: item.value + '%' }"
            >
              <span class="bar-value">{{ item.count }}</span>
            </div>
          </div>
          <div class="chart-labels">
            <span v-for="(item, index) in trendData" :key="index">{{ item.label }}</span>
          </div>
        </div>
      </div>

      <!-- 参与者分布 -->
      <div class="distribution-section">
        <h3 class="section-title">参与者分布</h3>
        <van-cell-group inset>
          <van-cell v-for="item in distributionData" :key="item.label">
            <template #title>
              <div class="distribution-item">
                <span class="item-label">{{ item.label }}</span>
                <van-progress
                  :percentage="item.percentage"
                  :stroke-width="8"
                  :show-pivot="false"
                  :color="item.color"
                  class="item-progress"
                />
                <span class="item-value">{{ item.count }}人 ({{ item.percentage }}%)</span>
              </div>
            </template>
          </van-cell>
        </van-cell-group>
      </div>

      <!-- 评价统计 -->
      <div class="evaluation-section">
        <h3 class="section-title">评价统计</h3>
        <van-cell-group inset>
          <van-cell title="总评价数" :value="evaluation.totalCount + '条'" />
          <van-cell title="平均评分">
            <template #value>
              <van-rate v-model="evaluation.averageRating" allow-half readonly size="16" />
              <span class="rating-text">{{ evaluation.averageRating }}分</span>
            </template>
          </van-cell>
          <van-cell title="满意度" :value="evaluation.satisfactionRate + '%'" />
        </van-cell-group>

        <!-- 评分分布 -->
        <div class="rating-distribution">
          <div
            v-for="(item, index) in ratingDistribution"
            :key="index"
            class="rating-row"
          >
            <span class="star-label">{{ 5 - index }}星</span>
            <van-progress
              :percentage="item.percentage"
              :stroke-width="8"
              :show-pivot="false"
              color="#ffd21e"
              class="rating-progress"
            />
            <span class="rating-count">{{ item.count }}</span>
          </div>
        </div>
      </div>

      <!-- 最近评价 -->
      <div class="recent-reviews-section">
        <h3 class="section-title">最近评价</h3>
        <div class="review-list">
          <div
            v-for="review in recentReviews"
            :key="review.id"
            class="review-card"
          >
            <div class="review-header">
              <van-image
                round
                width="32"
                height="32"
                :src="review.avatar"
              >
                <template #error>
                  <van-icon name="user-o" size="20" />
                </template>
              </van-image>
              <div class="reviewer-info">
                <span class="reviewer-name">{{ review.userName }}</span>
                <van-rate v-model="review.rating" allow-half readonly size="12" />
              </div>
              <span class="review-time">{{ formatDate(review.createTime) }}</span>
            </div>
            <p class="review-content">{{ review.content }}</p>
          </div>
        </div>
      </div>
    </div>
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { showToast } from 'vant'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'

const route = useRoute()

// 数据
const selectedActivityId = ref(route.query.id as string || '1')
const trendPeriod = ref('7d')

// 活动选项
const activityOptions = [
  { text: '春季亲子运动会', value: '1' },
  { text: '科学实验体验课', value: '2' },
  { text: '校园开放日活动', value: '3' }
]

// 数据概览
const overview = ref({
  totalParticipants: 156,
  checkinRate: 92,
  totalRevenue: 7800,
  averageRating: 4.5
})

// 报名趋势数据
const trendData = ref([
  { label: '03/09', count: 12, value: 40 },
  { label: '03/10', count: 25, value: 80 },
  { label: '03/11', count: 18, value: 60 },
  { label: '03/12', count: 32, value: 100 },
  { label: '03/13', count: 28, value: 88 },
  { label: '03/14', count: 22, value: 70 },
  { label: '03/15', count: 19, value: 62 }
])

// 参与者分布
const distributionData = ref([
  { label: '小班', count: 42, percentage: 27, color: '#1989fa' },
  { label: '中班', count: 58, percentage: 37, color: '#07c160' },
  { label: '大班', count: 56, percentage: 36, color: '#ff976a' }
])

// 评价统计
const evaluation = ref({
  totalCount: 89,
  averageRating: 4.5,
  satisfactionRate: 95
})

// 评分分布
const ratingDistribution = ref([
  { count: 52, percentage: 58 },
  { count: 28, percentage: 32 },
  { count: 6, percentage: 7 },
  { count: 2, percentage: 2 },
  { count: 1, percentage: 1 }
])

// 最近评价
const recentReviews = ref([
  {
    id: '1',
    userName: '张妈妈',
    avatar: '',
    rating: 5,
    content: '活动组织得很好，孩子玩得很开心，希望多举办这样的活动！',
    createTime: '2025-03-15 14:30:00'
  },
  {
    id: '2',
    userName: '李爸爸',
    avatar: '',
    rating: 4.5,
    content: '整体不错，就是人有点多，排队等了一会儿。',
    createTime: '2025-03-15 12:15:00'
  },
  {
    id: '3',
    userName: '王妈妈',
    avatar: '',
    rating: 5,
    content: '非常棒的活动，老师们都很负责，孩子很喜欢！',
    createTime: '2025-03-15 10:00:00'
  }
])

const handleActivityChange = () => {
  // 重新加载数据
  showToast('切换活动')
}

const handleExport = () => {
  showToast('导出报告功能开发中')
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  // 加载数据
})
</script>

<style scoped lang="scss">
.activity-analytics-mobile {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 20px;

  .activity-selector {
    background: #fff;
    margin-bottom: 12px;
  }

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin: 0 0 12px 0;
    padding-left: 8px;
    border-left: 3px solid #1989fa;
  }

  // 数据概览
  .overview-section {
    padding: 12px;
    background: #fff;
    margin-bottom: 12px;

    .overview-card {
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%);
      padding: 16px;
      border-radius: 12px;
      text-align: center;

      .card-value {
        font-size: 24px;
        font-weight: bold;
        color: #333;
      }

      .card-label {
        font-size: 12px;
        color: #999;
        margin-top: 4px;
      }

      .card-trend {
        font-size: 12px;
        color: #999;
        margin-top: 8px;

        &.up {
          color: #07c160;
        }

        &.down {
          color: #ee0a24;
        }
      }
    }
  }

  // 报名趋势
  .trend-section {
    padding: 12px;
    background: #fff;
    margin-bottom: 12px;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .period-tabs {
        :deep(.van-tabs__wrap) {
          height: 32px;
        }

        :deep(.van-tab) {
          padding: 0 12px;
          font-size: 12px;
        }
      }
    }

    .chart-placeholder {
      padding: 16px 0;

      .mini-chart {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        height: 100px;
        padding: 0 8px;

        .chart-bar {
          flex: 1;
          margin: 0 4px;
          background: linear-gradient(180deg, #1989fa 0%, #69b7ff 100%);
          border-radius: 4px 4px 0 0;
          position: relative;
          min-height: 10px;
          transition: height 0.3s;

          .bar-value {
            position: absolute;
            top: -20px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 11px;
            color: #666;
          }
        }
      }

      .chart-labels {
        display: flex;
        justify-content: space-between;
        padding: 8px 8px 0;

        span {
          font-size: 10px;
          color: #999;
        }
      }
    }
  }

  // 参与者分布
  .distribution-section {
    padding: 12px;
    background: #fff;
    margin-bottom: 12px;

    .distribution-item {
      display: flex;
      align-items: center;
      gap: 12px;

      .item-label {
        width: 40px;
        font-size: 14px;
        color: #333;
      }

      .item-progress {
        flex: 1;
      }

      .item-value {
        width: 80px;
        text-align: right;
        font-size: 12px;
        color: #666;
      }
    }
  }

  // 评价统计
  .evaluation-section {
    padding: 12px;
    background: #fff;
    margin-bottom: 12px;

    .rating-text {
      margin-left: 8px;
      font-size: 14px;
      color: #ff976a;
    }

    .rating-distribution {
      padding: 12px;
      background: #f7f8fa;
      border-radius: 8px;
      margin-top: 12px;

      .rating-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;

        &:last-child {
          margin-bottom: 0;
        }

        .star-label {
          width: 32px;
          font-size: 12px;
          color: #666;
        }

        .rating-progress {
          flex: 1;
        }

        .rating-count {
          width: 30px;
          text-align: right;
          font-size: 12px;
          color: #999;
        }
      }
    }
  }

  // 最近评价
  .recent-reviews-section {
    padding: 12px;
    background: #fff;

    .review-list {
      .review-card {
        padding: 12px;
        background: #f7f8fa;
        border-radius: 8px;
        margin-bottom: 12px;

        &:last-child {
          margin-bottom: 0;
        }

        .review-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;

          .reviewer-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 4px;

            .reviewer-name {
              font-size: 14px;
              font-weight: 500;
              color: #333;
            }
          }

          .review-time {
            font-size: 11px;
            color: #999;
          }
        }

        .review-content {
          margin: 0;
          font-size: 13px;
          color: #666;
          line-height: 1.5;
        }
      }
    }
  }
}
</style>
