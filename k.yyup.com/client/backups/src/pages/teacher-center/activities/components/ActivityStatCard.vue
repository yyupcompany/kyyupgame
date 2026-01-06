<template>
  <el-card class="activity-stat-card" shadow="hover">
    <div class="card-content">
      <div class="card-icon" :style="{ backgroundColor: color + '20', color: color }">
        <el-icon>
          <component :is="icon" />
        </el-icon>
      </div>
      <div class="card-info">
        <div class="card-value">{{ value }}</div>
        <div class="card-title">{{ title }}</div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
interface Props {
  title: string
  value: number
  icon: string
  color: string
}

defineProps<Props>()
</script>

<style lang="scss" scoped>
.activity-stat-card {
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 var(--spacing-sm) 25px var(--shadow-light);
  }
  
  .card-content {
    display: flex;
    align-items: center;
    gap: var(--text-lg);
  }
  
  .card-icon {
    width: var(--icon-size); height: var(--icon-size);
    border-radius: var(--text-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-3xl);
  }
  
  .card-info {
    flex: 1;
    
    .card-value {
      font-size: var(--text-3xl);
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1;
      margin-bottom: var(--spacing-xs);
    }
    
    .card-title {
      font-size: var(--text-base);
      color: var(--text-secondary);
    }
  }
}
</style>
