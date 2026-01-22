<template>
  <MobileCenterLayout title="活动统计" back-path="/mobile/activity/activity-index">
    <div class="activity-statistics-mobile">
      <!-- 筛选 -->
      <van-dropdown-menu>
        <van-dropdown-item v-model="filterTime" :options="timeOptions" @change="loadData" />
        <van-dropdown-item v-model="filterType" :options="typeOptions" @change="loadData" />
      </van-dropdown-menu>

      <!-- 数据概览 -->
      <div class="overview-section">
        <div class="overview-grid">
          <div class="overview-card">
            <div class="card-value">{{ overview.totalActivities }}</div>
            <div class="card-label">总活动数</div>
          </div>
          <div class="overview-card">
            <div class="card-value">{{ overview.totalParticipants }}</div>
            <div class="card-label">总参与人数</div>
          </div>
          <div class="overview-card">
            <div class="card-value">{{ overview.avgAttendance }}%</div>
            <div class="card-label">平均出席率</div>
          </div>
          <div class="overview-card">
            <div class="card-value">{{ overview.avgSatisfaction }}/5</div>
            <div class="card-label">平均满意度</div>
          </div>
        </div>
      </div>

      <!-- 活动类型分布 -->
      <van-cell-group inset title="活动类型分布">
        <div class="chart-placeholder">
          <div v-for="item in typeDistribution" :key="item.type" class="distribution-item">
            <div class="item-label">{{ item.type }}</div>
            <div class="item-bar">
              <div class="bar-fill" :style="{ width: item.percentage + '%' }" />
            </div>
            <div class="item-value">{{ item.count }} ({{ item.percentage }}%)</div>
          </div>
        </div>
      </van-cell-group>

      <!-- 参与度趋势 -->
      <van-cell-group inset title="参与度趋势（近六个月）">
        <div class="trend-chart">
          <div v-for="item in trendData" :key="item.month" class="trend-bar">
            <div class="bar" :style="{ height: (item.count / maxTrend) * 100 + '%' }">
              <span class="bar-value">{{ item.count }}</span>
            </div>
            <div class="bar-label">{{ item.month }}</div>
          </div>
        </div>
      </van-cell-group>

      <!-- 活动排行榜 -->
      <van-cell-group inset title="活动排行榜">
        <van-tabs v-model:active="rankTab">
          <van-tab title="参与度">
            <div class="rank-list">
              <div v-for="(item, index) in participationRank" :key="item.id" class="rank-item">
                <div class="rank-number" :class="{ top: index < 3 }">{{ index + 1 }}</div>
                <div class="rank-info">
                  <div class="rank-title">{{ item.title }}</div>
                  <div class="rank-detail">{{ item.participants }}人参与 · 出席率 {{ item.attendance }}%</div>
                </div>
                <van-tag type="primary">{{ item.score }}分</van-tag>
              </div>
            </div>
          </van-tab>
          <van-tab title="满意度">
            <div class="rank-list">
              <div v-for="(item, index) in satisfactionRank" :key="item.id" class="rank-item">
                <div class="rank-number" :class="{ top: index < 3 }">{{ index + 1 }}</div>
                <div class="rank-info">
                  <div class="rank-title">{{ item.title }}</div>
                  <div class="rank-detail">{{ item.evaluations }}人评价</div>
                </div>
                <van-rate v-model="item.rating" readonly allow-half size="12" />
              </div>
            </div>
          </van-tab>
        </van-tabs>
      </van-cell-group>
    </div>
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'

const filterTime = ref('month')
const filterType = ref('')
const rankTab = ref(0)

const timeOptions = [
  { text: '本月', value: 'month' },
  { text: '本季度', value: 'quarter' },
  { text: '本年', value: 'year' }
]

const typeOptions = [
  { text: '全部类型', value: '' },
  { text: '开放日', value: 'open-day' },
  { text: '家长会', value: 'parent-meeting' },
  { text: '亲子活动', value: 'family' }
]

const overview = reactive({
  totalActivities: 48,
  totalParticipants: 1256,
  avgAttendance: 86,
  avgSatisfaction: 4.3
})

const typeDistribution = ref([
  { type: '开放日', count: 15, percentage: 31 },
  { type: '家长会', count: 12, percentage: 25 },
  { type: '亲子活动', count: 10, percentage: 21 },
  { type: '招生宣讲', count: 8, percentage: 17 },
  { type: '其他', count: 3, percentage: 6 }
])

const trendData = ref([
  { month: '8月', count: 180 },
  { month: '9月', count: 220 },
  { month: '10月', count: 195 },
  { month: '11月', count: 250 },
  { month: '12月', count: 210 },
  { month: '1月', count: 201 }
])

const maxTrend = computed(() => Math.max(...trendData.value.map(d => d.count)))

const participationRank = ref([
  { id: 1, title: '亲子运动会', participants: 120, attendance: 95, score: 98 },
  { id: 2, title: '开放日活动', participants: 85, attendance: 88, score: 92 },
  { id: 3, title: '新年联欢会', participants: 78, attendance: 92, score: 88 },
  { id: 4, title: '家长会', participants: 65, attendance: 85, score: 82 }
])

const satisfactionRank = ref([
  { id: 1, title: '亲子运动会', evaluations: 98, rating: 4.8 },
  { id: 2, title: '新年联欢会', evaluations: 72, rating: 4.6 },
  { id: 3, title: '开放日活动', evaluations: 65, rating: 4.5 },
  { id: 4, title: '家长会', evaluations: 58, rating: 4.2 }
])

const loadData = () => {
  // 加载数据
}

onMounted(() => { loadData() })
</script>

<style scoped lang="scss">
.activity-statistics-mobile {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 20px;
}

.overview-section {
  padding: 12px;

  .overview-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .overview-card {
    background: linear-gradient(135deg, #1989fa 0%, #07c160 100%);
    border-radius: 8px;
    padding: 16px;
    color: #fff;
    text-align: center;

    .card-value {
      font-size: 24px;
      font-weight: 600;
    }

    .card-label {
      font-size: 12px;
      opacity: 0.9;
      margin-top: 4px;
    }
  }
}

.chart-placeholder {
  padding: 12px 16px;

  .distribution-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;

    .item-label {
      width: 60px;
      font-size: 13px;
      color: #646566;
    }

    .item-bar {
      flex: 1;
      height: 16px;
      background: #ebedf0;
      border-radius: 8px;
      overflow: hidden;

      .bar-fill {
        height: 100%;
        background: linear-gradient(90deg, #1989fa, #07c160);
        border-radius: 8px;
      }
    }

    .item-value {
      width: 80px;
      text-align: right;
      font-size: 12px;
      color: #969799;
    }
  }
}

.trend-chart {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 150px;
  padding: 12px 16px;

  .trend-bar {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 40px;

    .bar {
      width: 24px;
      background: linear-gradient(180deg, #1989fa, #07c160);
      border-radius: 4px 4px 0 0;
      display: flex;
      justify-content: center;
      min-height: 20px;

      .bar-value {
        font-size: 10px;
        color: #fff;
        transform: translateY(-14px);
      }
    }

    .bar-label {
      font-size: 11px;
      color: #969799;
      margin-top: 4px;
    }
  }
}

.rank-list {
  padding: 8px 0;

  .rank-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;

    .rank-number {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #ebedf0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 500;

      &.top {
        background: linear-gradient(135deg, #ff9800, #f44336);
        color: #fff;
      }
    }

    .rank-info {
      flex: 1;

      .rank-title {
        font-size: 14px;
        color: #323233;
      }

      .rank-detail {
        font-size: 12px;
        color: #969799;
        margin-top: 2px;
      }
    }
  }
}
</style>
