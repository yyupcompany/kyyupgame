<template>
  <el-card class="teaching-stat-card" shadow="hover">
    <div class="card-content">
      <div class="card-icon" :style="{ backgroundColor: color + '20', color: color }">
        <UnifiedIcon name="default" />
      </div>
      <div class="card-info">
        <div class="card-value">{{ value }}{{ suffix }}</div>
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
  suffix?: string
}

withDefaults(defineProps<Props>(), {
  suffix: ''
})
</script>

<style lang="scss" scoped>
.teaching-stat-card {
  cursor: pointer;
  transition: var(--transition-base);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .card-content {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
  }

  .card-icon {
    width: auto;
    min-height: 60px; height: auto;
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-2xl);
  }

  .card-info {
    flex: 1;

    .card-value {
      font-size: var(--text-3xl);
      font-weight: var(--font-bold);
      color: var(--text-primary);
      line-height: var(--leading-none);
      margin-bottom: var(--spacing-xs);
    }

    .card-title {
      font-size: var(--text-base);
      color: var(--text-secondary);
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .teaching-stat-card {
    .card-content {
      gap: var(--spacing-md);
    }

    .card-icon {
      width: 4var(--spacing-sm);
      height: 4var(--spacing-sm);
      font-size: var(--text-xl);
    }

    .card-info {
      .card-value {
        font-size: var(--text-2xl);
      }

      .card-title {
        font-size: var(--text-sm);
      }
    }
  }
}
</style>
