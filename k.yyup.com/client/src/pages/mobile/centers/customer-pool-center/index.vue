<template>
  <MobileMainLayout 
    title="客户池中心" 
    :show-back="true"
    :show-footer="true"
    content-padding="var(--app-gap)"
  >
    <div class="page">
      <van-grid :column-num="2" :border="false">
        <van-grid-item><div class="stat-value">{{ stats.totalCustomers }}</div><div class="stat-label">总客户</div></van-grid-item>
        <van-grid-item><div class="stat-value">{{ stats.unassignedCustomers }}</div><div class="stat-label">未分配</div></van-grid-item>
      </van-grid>
      <van-tabs v-model:active="activeTab" sticky>
        <van-tab title="全部" name="all">
          <van-list v-model:loading="loading" :finished="finished" @load="loadCustomers">
            <van-cell v-for="cust in customers" :key="cust.id" :title="cust.name" :label="cust.phone" is-link />
          </van-list>
        </van-tab>
        <van-tab title="未分配" name="unassigned" />
      </van-tabs>
    </div>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'
import { showLoadingToast, closeToast, showToast } from 'vant'
import { request } from '@/utils/request'
import { CUSTOMER_ENDPOINTS } from '@/api/endpoints'

const activeTab = ref('all')
const loading = ref(false)
const finished = ref(false)
const stats = ref({ totalCustomers: 0, unassignedCustomers: 0 })
const customers = ref<any[]>([])

const loadCustomers = async () => {
  try {
    const response = await request.get(CUSTOMER_ENDPOINTS.BASE, {
      params: { page: 1, pageSize: 100 }
    })
    if (response.success && response.data) {
      customers.value = response.data.items || response.data.list || response.data || []
      finished.value = true
    }
  } catch (error) {
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  showLoadingToast({ message: '加载中...', forbidClick: true })
  const statsRes = await request.get(CUSTOMER_ENDPOINTS.STATS)
  if (statsRes.success) stats.value = statsRes.data
  closeToast()
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

.page { 
  min-height: 100vh; 
  background-color: var(--van-background-color-light);
  
  .stat-value { 
    font-size: var(--text-2xl); 
    font-weight: bold; 
    margin-bottom: 8px;
    color: var(--text-color);
  }
  
  .stat-label { 
    font-size: var(--text-sm); 
    color: var(--text-color-secondary); 
  }
}
</style>
