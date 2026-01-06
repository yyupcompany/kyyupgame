<template>
  <MobileMainLayout title="绩效考核" :show-nav-bar="true" :show-back="true"
    :show-tab-bar="true">
    <div class="performance-rewards-page">
      <van-cell-group inset>
        <div class="performance-overview">
          <div class="overview-item"><div class="value">{{ performance.score }}</div><div class="label">综合评分</div></div>
          <div class="overview-item"><div class="value">{{ performance.rank }}</div><div class="label">团队排名</div></div>
          <div class="overview-item"><div class="value">{{ performance.reward }}</div><div class="label">本月奖励</div></div>
        </div>
      </van-cell-group>
      <van-cell-group inset title="考核项目">
        <van-cell v-for="item in items" :key="item.id" :title="item.name" :value="`${item.score}/${item.total}`">
          <template #label><van-progress :percentage="(item.score / item.total) * 100" /></template>
        </van-cell>
      </van-cell-group>
    </div>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MobileMainLayout from "@/components/mobile/layouts/MobileMainLayout.vue"
import { showLoadingToast, closeToast, showToast } from 'vant'
import { request } from '@/utils/request'

interface PerformanceData {
  score: number
  rank: number
  reward: string
}

interface PerformanceItem {
  id: number
  name: string
  score: number
  total: number
}

const loading = ref(false)
const performance = ref<PerformanceData>({ score: 0, rank: 0, reward: '¥0' })
const items = ref<PerformanceItem[]>([])

const loadPerformance = async () => {
  try {
    loading.value = true
    showLoadingToast({ message: '加载中...', forbidClick: true })
    
    const response = await request.get('/principal-performance')
    
    if (response.success && response.data) {
      performance.value = {
        score: response.data.score || 0,
        rank: response.data.rank || 0,
        reward: `¥${response.data.reward || 0}`
      }
      
      items.value = response.data.items?.map((item: any) => ({
        id: item.id,
        name: item.name,
        score: item.score,
        total: item.total || 100
      })) || []
    }
  } catch (error) {
    console.error('加载绩效数据失败:', error)
    showToast('加载失败，请重试')
  } finally {
    loading.value = false
    closeToast()
  }
}

onMounted(() => {
  loadPerformance()
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';
.performance-rewards-page {
  min-height: 100vh;
  background-color: var(--bg-color-page);
  padding-bottom: 20px;
}
.performance-overview {
  display: flex;
  padding: var(--spacing-lg) 0;
  .overview-item {
    flex: 1;
    text-align: center;
    .value { font-size: var(--text-2xl); font-weight: bold; margin-bottom: 8px; }
    .label { font-size: var(--text-sm); color: var(--text-secondary); }
  }
}
</style>

