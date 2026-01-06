<template>
  <div class="game-card" :class="`theme-${game.themeType}`" @click="$emit('play', game.gameKey)">
    <div class="game-icon">
      {{ getGameIcon(game.gameKey) }}
    </div>
    <div class="game-info">
      <h3>{{ game.gameName }}</h3>
      <p class="description">{{ game.description }}</p>
      <div class="stats" v-if="game.userProgress">
        <span class="stat-item">
          <el-icon><Star /></el-icon>
          {{ game.userProgress.totalStars }}
        </span>
        <span class="stat-item">
          <el-icon><Trophy /></el-icon>
          {{ game.userProgress.bestScore }}
        </span>
        <span class="stat-item">
          <el-icon><VideoPlay /></el-icon>
          {{ game.userProgress.playCount }}次
        </span>
      </div>
    </div>
    <div class="play-btn">
      <el-icon><CaretRight /></el-icon>
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
    'princess-garden': '🌸',
    'space-hunt': '🚀',
    'animal-observer': '🦁',
    'princess-memory': '💎',
    'dino-memory': '🦖',
    'fruit-sequence': '🍎',
    'doll-house': '🏠',
    'robot-factory': '🤖',
    'color-sort': '🎨'
  }
  return icons[gameKey] || '🎮'
}
</script>

<style scoped lang="scss">
.game-card {
  background: white;
  border-radius: var(--text-lg);
  padding: var(--text-3xl);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 3px solid transparent;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(90deg, var(--primary-color) 0%, #764ba2 100%);
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover {
    transform: translateY(-var(--spacing-sm));
    box-shadow: 0 var(--text-sm) var(--text-3xl) var(--shadow-medium);
    border-color: var(--primary-color);

    &::before {
      opacity: 1;
    }

    .play-btn {
      transform: scale(1.1);
      background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
    }
  }

  &.theme-girl {
    &::before {
      background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
    }
  }

  &.theme-boy {
    &::before {
      background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
    }
  }

  .game-icon {
    font-size: 64px;
    text-align: center;
    margin-bottom: var(--text-lg);
  }

  .game-info {
    padding-bottom: var(--spacing-15xl); // 为播放按钮留出空间
    
    h3 {
      font-size: var(--text-2xl);
      color: var(--text-primary);
      margin: 0 0 var(--spacing-sm) 0;
      text-align: center;
    }

    .description {
      font-size: var(--text-base);
      color: var(--info-color);
      margin: 0 0 var(--text-lg) 0;
      text-align: center;
      min-height: 40px;
    }

    .stats {
      display: flex;
      justify-content: space-around;
      padding: var(--text-sm) var(--text-lg);
      border-top: 1px solid var(--border-color);
      margin-top: var(--spacing-sm);

      .stat-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-lg);
        font-size: 15px;
        font-weight: 600;
        color: var(--text-primary); // 深色，更清晰
        text-shadow: 0 1px 2px var(--shadow-light); // 添加阴影

        .el-icon {
          color: #ffd700;
          font-size: var(--text-xl);
          filter: drop-shadow(0 1px 2px rgba(255, 215, 0, 0.3));
        }
      }
    }
  }

  .play-btn {
    position: absolute;
    bottom: var(--text-3xl);
    right: 50%;
    transform: translateX(50%); // 居中显示
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 28px;
    transition: all 0.3s;
    box-shadow: 0 6px var(--text-lg) rgba(102, 126, 234, 0.5);
    z-index: 10; // 确保在最上层
    
    &:hover {
      transform: translateX(50%) scale(1.15);
      box-shadow: 0 var(--spacing-sm) var(--text-2xl) rgba(102, 126, 234, 0.6);
    }
  }
}
</style>




