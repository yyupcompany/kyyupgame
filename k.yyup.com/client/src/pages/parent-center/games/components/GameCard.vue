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
.game-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  cursor: pointer;
  transition: all var(--transition-slow) var(--ease-in-out);
  border: var(--border-width-base) solid transparent;
  position: relative;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: var(--spacing-sm);
    background: linear-gradient(90deg, var(--primary-color) 0%, var(--gradient-purple-end) 100%);
    opacity: 0;
    transition: opacity var(--transition-slow);
  }

  &:hover {
    transform: translateY(-var(--spacing-sm));
    box-shadow: 0 var(--spacing-sm) var(--spacing-2xl) var(--shadow-lg);
    border-color: var(--primary-color);

    &::before {
      opacity: 1;
    }

    .play-btn {
      transform: scale(1.1);
      background: var(--gradient-primary);
    }
  }

  &.theme-girl {
    &::before {
      background: linear-gradient(90deg, var(--gradient-warning-start) 0%, var(--gradient-warning-end) 100%);
    }
  }

  &.theme-boy {
    &::before {
      background: linear-gradient(90deg, var(--gradient-primary-start) 0%, var(--gradient-primary-end) 100%);
    }
  }

  .game-icon {
    font-size: var(--icon-xl);
    text-align: center;
    margin-bottom: var(--spacing-lg);
  }

  .game-info {
    padding-bottom: var(--spacing-4xl); // 为播放按钮留出空间

    h3 {
      font-size: var(--text-2xl);
      color: var(--text-primary);
      margin: 0 0 var(--spacing-sm) 0;
      text-align: center;
    }

    .description {
      font-size: var(--text-base);
      color: var(--text-secondary);
      margin: 0 0 var(--spacing-lg) 0;
      text-align: center;
      min-height: var(--spacing-2xl);
    }

    .stats {
      display: flex;
      justify-content: space-around;
      padding: var(--spacing-sm) var(--spacing-lg);
      border-top: var(--border-width-base) solid var(--border-color);
      margin-top: var(--spacing-sm);

      .stat-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-size: var(--text-sm);
        font-weight: var(--font-semibold);
        color: var(--text-primary);
        text-shadow: var(--text-shadow-sm);

        .el-icon {
          color: var(--warning-color);
          font-size: var(--text-xl);
          filter: drop-shadow(var(--text-shadow-sm));
        }
      }
    }
  }

  .play-btn {
    position: absolute;
    bottom: var(--spacing-xl);
    right: 50%;
    transform: translateX(50%); // 居中显示
    width: var(--spacing-4xl);
    height: var(--spacing-4xl);
    border-radius: var(--radius-full);
    background: var(--gradient-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-on-primary);
    font-size: var(--text-2xl);
    transition: all var(--transition-slow);
    box-shadow: 0 var(--spacing-sm) var(--spacing-lg) var(--glow-primary);
    z-index: var(--z-sticky);

    &:hover {
      transform: translateX(50%) scale(1.15);
      box-shadow: 0 var(--spacing-sm) var(--spacing-2xl) var(--glow-primary);
    }
  }
}
</style>




