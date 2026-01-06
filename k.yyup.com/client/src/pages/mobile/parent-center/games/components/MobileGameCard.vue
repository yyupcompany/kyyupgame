<template>
  <van-card
    :class="['mobile-game-card', `theme-${game.themeType || 'default'}`]"
    :thumb="gameIcon"
    @click="$emit('play', game.gameKey)"
  >
    <template #title>
      <div class="game-title">
        <h3>{{ game.gameName }}</h3>
        <van-tag
          v-if="game.difficulty"
          :type="difficultyType"
          size="small"
        >
          {{ game.difficulty }}
        </van-tag>
      </div>
    </template>

    <template #desc>
      <p class="game-description">{{ game.description }}</p>

      <!-- 游戏元信息 -->
      <div class="game-meta" v-if="game.ageRange || game.duration">
        <van-tag v-if="game.ageRange" type="primary" plain size="small">
          {{ game.ageRange }}
        </van-tag>
        <van-tag v-if="game.duration" type="success" plain size="small">
          {{ game.duration }}
        </van-tag>
      </div>

      <!-- 游戏统计 -->
      <div class="game-stats" v-if="game.userProgress">
        <div class="stat-item">
          <van-icon name="star-o" color="#ff976a" />
          <span>{{ game.userProgress.totalStars || 0 }}星</span>
        </div>
        <div class="stat-item">
          <van-icon name="award-o" color="#07c160" />
          <span>{{ game.userProgress.bestScore || 0 }}分</span>
        </div>
        <div class="stat-item">
          <van-icon name="play-circle-o" color="#1989fa" />
          <span>{{ game.userProgress.playCount || 0 }}次</span>
        </div>
      </div>
    </template>

    <template #footer>
      <van-button
        type="primary"
        size="small"
        icon="play-circle-o"
        round
        block
        @click.stop="$emit('play', game.gameKey)"
      >
        开始游戏
      </van-button>
    </template>
  </van-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  game: any
}>()

const emit = defineEmits<{
  play: [gameKey: string]
}>()

// 游戏图标
const gameIcon = computed(() => {
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
  return icons[props.game.gameKey] || '🎮'
})

// 难度标签类型
const difficultyType = computed(() => {
  const difficulty = props.game.difficulty?.toLowerCase()
  switch (difficulty) {
    case '简单':
    case 'easy':
      return 'success'
    case '中等':
    case 'medium':
      return 'warning'
    case '困难':
    case 'hard':
      return 'danger'
    default:
      return 'primary'
  }
})
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';

.mobile-game-card {
  margin-bottom: 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  background: var(--card-bg);

  &:active {
    transform: scale(0.98);
    box-shadow: 0 1px 8px rgba(0, 0, 0, 0.12);
  }

  ::v-deep(.van-card__thumb) {
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-4xl);
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    border-radius: 12px;
    margin-right: 12px;
  }

  ::v-deep(.van-card__content) {
    padding: var(--spacing-md);
  }

  .game-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    h3 {
      margin: 0;
      font-size: var(--text-base);
      color: var(--text-primary);
      font-weight: 600;
      flex: 1;
      margin-right: 8px;
    }
  }

  .game-description {
    margin: 0 0 8px 0;
    font-size: var(--text-sm);
    color: var(--text-primary);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }

  .game-meta {
    display: flex;
    gap: 6px;
    margin-bottom: 8px;
    flex-wrap: wrap;
  }

  .game-stats {
    display: flex;
    gap: var(--spacing-md);
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid #f0f0f0;

    .stat-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: var(--text-xs);
      color: var(--text-primary);

      .van-icon {
        font-size: var(--text-sm);
      }
    }
  }

  ::v-deep(.van-card__footer) {
    padding: 0 12px 12px 12px;
  }

  // 主题样式
  &.theme-girl {
    ::v-deep(.van-card__thumb) {
      background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
    }

    ::v-deep(.van-button--primary) {
      background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
      border-color: transparent;
    }
  }

  &.theme-boy {
    ::v-deep(.van-card__thumb) {
      background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
    }

    ::v-deep(.van-button--primary) {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      border-color: transparent;
    }
  }

  &.theme-default {
    ::v-deep(.van-button--primary) {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-color: transparent;
    }
  }
}

// 响应式适配
@media (max-width: 375px) {
  .mobile-game-card {
    ::v-deep(.van-card__thumb) {
      width: 50px;
      height: 50px;
      font-size: var(--text-3xl);
    }

    .game-title h3 {
      font-size: var(--text-base);
    }

    .game-description {
      font-size: var(--text-xs);
    }

    .game-stats {
      gap: var(--spacing-sm);

      .stat-item {
        font-size: 11px;
      }
    }
  }
}
</style>