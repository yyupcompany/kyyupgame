<template>
  <div class="quota-statistics">
        <el-row :gutter="20">
          <el-col :span="6">
        <el-card shadow="hover" class="statistic-card">
          <div class="statistic-content">
            <div class="statistic-title">总名额</div>
            <div class="statistic-value">{{ statistics.totalQuota || 0 }}</div>
            </div>
        </el-card>
          </el-col>
          <el-col :span="6">
        <el-card shadow="hover" class="statistic-card">
          <div class="statistic-content">
            <div class="statistic-title">已分配</div>
            <div class="statistic-value">{{ statistics.usedQuota || 0 }}</div>
            </div>
        </el-card>
          </el-col>
          <el-col :span="6">
        <el-card shadow="hover" class="statistic-card">
          <div class="statistic-content">
            <div class="statistic-title">剩余名额</div>
            <div class="statistic-value">{{ statistics.remainingQuota || 0 }}</div>
            </div>
        </el-card>
          </el-col>
          <el-col :span="6">
        <el-card shadow="hover" class="statistic-card">
          <div class="statistic-content">
            <div class="statistic-title">使用率</div>
            <div class="statistic-value">{{ usageRate }}%</div>
              </div>
        </el-card>
          </el-col>
        </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ENROLLMENT_QUOTA_ENDPOINTS } from '@/api/endpoints'
import { request } from '@/utils/request'
import type { ApiResponse } from '@/api/endpoints'

const props = defineProps({
  planId: {
    type: Number,
    required: true
  }
})

// 统计数据
const statistics = ref({
  totalQuota: 0,
  usedQuota: 0,
  remainingQuota: 0
})

// 计算使用率
const usageRate = computed(() => {
  if (!statistics.value.totalQuota) return 0
  return ((statistics.value.usedQuota / statistics.value.totalQuota) * 100).toFixed(2)
})

// 获取名额统计数据
const fetchStatistics = async () => {
  try {
    const res: ApiResponse = await request.get(ENROLLMENT_QUOTA_ENDPOINTS.STATISTICS(props.planId))
    if (res.data) {
      statistics.value = res.data
    }
  } catch (error) {
    console.error('获取名额统计失败:', error)
  }
}

onMounted(() => {
  fetchStatistics()
})
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';

.quota-statistics {
  margin-bottom: var(--text-2xl);
}

.statistic-card {
  text-align: center;
}

.statistic-content {
  padding: var(--spacing-sm) 0;
}

.statistic-title {
  font-size: var(--text-sm);
  color: var(--text-regular);
  margin-bottom: var(--spacing-2xl);
}

.statistic-value {
  font-size: var(--text-2xl);
  font-weight: bold;
  color: var(--text-primary);
}
</style> 