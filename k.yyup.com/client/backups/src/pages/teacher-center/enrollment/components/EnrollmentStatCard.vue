<template>
  <el-card class="enrollment-stat-card" shadow="hover">
    <div class="card-content">
      <div class="card-icon" :style="{ backgroundColor: color + '20', color: color }">
        <el-icon>
          <component :is="icon" />
        </el-icon>
      </div>
      <div class="card-info">
        <div class="card-value">{{ value }}</div>
        <div class="card-title">{{ title }}</div>
        <div class="card-description">{{ description }}</div>
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
  description?: string
}

defineProps<Props>()
</script>

<style lang="scss" scoped>
.enrollment-stat-card {
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  .card-content {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
  }

  .card-icon {
    width: var(--size-icon-lg);
    height: var(--size-icon-lg);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-xl);
    flex-shrink: 0;
  }

  .card-info {
    flex: 1;

    .card-value {
      font-size: var(--text-2xl);
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1;
      margin-bottom: var(--spacing-xs);
    }

    .card-title {
      font-size: var(--text-sm);
      color: var(--text-primary);
      font-weight: 500;
      margin-bottom: var(--spacing-sm);
    }

    .card-description {
      font-size: var(--text-xs);
      color: var(--text-secondary);
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .enrollment-stat-card {
    .card-content {
      gap: var(--spacing-md);
    }

    .card-icon {
      width: var(--size-icon-md);
      height: var(--size-icon-md);
      font-size: var(--text-lg);
    }

    .card-info {
      .card-value {
        font-size: var(--text-xl);
      }

      .card-title {
        font-size: var(--text-xs);
      }

      .card-description {
        font-size: var(--text-2xs);
      }
    }
  }
}
</style>

