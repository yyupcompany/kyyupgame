<template>
  <div class="enrollment-chart">
    <div class="chart-header">
      <h3>招生统计图表</h3>
    </div>
    <div class="chart-content">
      <div class="chart-placeholder">
        <el-icon size="48" :color="'var(--primary-color)'">
          <TrendCharts />
        </el-icon>
        <p>招生数据图表</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrendCharts } from '@element-plus/icons-vue'
</script>

<style scoped lang="scss">
.enrollment-chart {
  padding: var(--spacing-lg);
  background: var(--bg-card);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);

  .chart-header {
    margin-bottom: var(--spacing-md);
    
    h3 {
      margin: 0;
      color: var(--text-primary);
      font-size: var(--font-size-lg);
      font-weight: 600;
    }
  }

  .chart-content {
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;

    .chart-placeholder {
      text-align: center;
      color: var(--text-secondary);

      p {
        margin-top: var(--spacing-sm);
        font-size: var(--font-size-md);
      }
    }
  }
}
</style>
