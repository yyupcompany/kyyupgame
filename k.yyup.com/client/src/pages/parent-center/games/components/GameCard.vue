<template>
  <div class="game-card" :class="`theme-${game.themeType}`" @click="$emit('play', game.gameKey)">
    <div class="game-icon">
      <UnifiedIcon :name="getGameIcon(game.gameKey)" />
    </div>
    <div class="game-info">
      <h3>{{ game.gameName }}</h3>
      <p class="description">{{ game.description }}</p>
      <div class="stats" v-if="game.userProgress">
        <span class="stat-item">
          <UnifiedIcon name="default" />
          {{ game.userProgress.totalStars }}
        </span>
        <span class="stat-item">
          <UnifiedIcon name="default" />
          {{ game.userProgress.bestScore }}
        </span>
        <span class="stat-item">
          <UnifiedIcon name="default" />
          {{ game.userProgress.playCount }}次
        </span>
      </div>
    </div>
    <div class="play-btn">
      <UnifiedIcon name="default" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Star, Trophy, CaretRight, VideoPlay } from '@element-plus/icons-vue'

defineProps<{
  game: any
}>()

defineEmits<{
  play: [gameKey: string]
}>()

const getGameIcon = (gameKey: string): string => {
  const icons: Record<string, string> = {
    'princess-garden': 'flower',
    'space-hunt': 'rocket',
    'animal-observer': 'lion',
    'princess-memory': 'gem',
    'dino-memory': 'dinosaur',
    'fruit-sequence': 'fruit-apple',
    'doll-house': 'house-alt',
    'robot-factory': 'robot',
    'color-sort': 'palette'
  }
  return icons[gameKey] || 'game'
}
</script>

<style scoped lang="scss">
/* 使用设计令牌 */

/* ==================== 游戏卡片组件 ==================== */
.game-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  cursor: pointer;
  transition: all var(--transition-base);
  border: 1px solid var(--border-color-lighter);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--el-color-primary) 0%, var(--el-color-primary-light-3) 100%);
    opacity: 0;
    transition: opacity var(--transition-base);
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: var(--el-color-primary-light-3);

    &::before {
      opacity: 1;
    }

    .play-btn {
      transform: translateX(50%) scale(1.1);
      background: linear-gradient(135deg, var(--el-color-primary) 0%, var(--el-color-primary-light-3) 100%);
    }
  }

  &.theme-girl {
    &::before {
      background: linear-gradient(90deg, var(--el-color-warning) 0%, var(--el-color-warning-light-3) 100%);
    }
  }

  &.theme-boy {
    &::before {
      background: linear-gradient(90deg, var(--el-color-primary) 0%, var(--el-color-primary-light-3) 100%);
    }
  }

  .game-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    margin: 0 auto var(--spacing-md);
    background: linear-gradient(135deg, var(--el-color-primary-light-8) 0%, var(--el-color-primary-light-9) 100%);
    border-radius: var(--radius-full);
    font-size: var(--text-2xl);
    color: var(--el-color-primary);

    :deep(.el-icon) {
      font-size: var(--text-2xl);
    }
  }

  .game-info {
    padding-bottom: var(--spacing-3xl);

    h3 {
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin: 0 0 var(--spacing-xs) 0;
      text-align: center;
      line-height: var(--leading-tight);
    }

    .description {
      font-size: var(--text-xs);
      color: var(--el-text-color-secondary);
      margin: 0 0 var(--spacing-md) 0;
      text-align: center;
      line-height: var(--leading-normal);
      min-height: 40px;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }

    .stats {
      display: flex;
      justify-content: space-around;
      padding-top: var(--spacing-sm);
      margin-top: var(--spacing-sm);
      border-top: 1px solid var(--border-color-lighter);

      .stat-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        font-size: var(--text-xs);
        font-weight: 500;
        color: var(--el-text-color-secondary);

        :deep(.el-icon) {
          color: var(--el-color-warning);
          font-size: var(--text-base);
        }
      }
    }
  }

  .play-btn {
    position: absolute;
    bottom: var(--spacing-md);
    left: 50%;
    transform: translateX(-50%);
    width: 48px;
    height: 48px;
    border-radius: var(--radius-full);
    background: linear-gradient(135deg, var(--el-color-primary) 0%, var(--el-color-primary-light-3) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: var(--text-lg);
    transition: all var(--transition-base);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
    z-index: 1;

    :deep(.el-icon) {
      font-size: var(--text-lg);
    }

    &:hover {
      transform: translateX(-50%) scale(1.15);
      box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
    }
  }
}
</style>




