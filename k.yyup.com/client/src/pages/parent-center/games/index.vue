<template>
  <div class="games-center">
    <div class="header">
      <h1><UnifiedIcon name="game" /> 游戏中心</h1>
      <p class="subtitle">精品脑力训练游戏，寓教于乐</p>
    </div>

    <div class="game-categories">
      <!-- 专注力游戏 -->
      <div class="category-section">
        <div class="category-header">
          <h2><UnifiedIcon name="target" /> 专注力训练</h2>
          <p>锻炼孩子的观察力和注意力</p>
        </div>
        <div class="game-grid">
          <GameCard
            v-for="game in attentionGames"
            :key="game.gameKey"
            :game="game"
            @play="handlePlayGame"
          />
        </div>
      </div>

      <!-- 记忆力游戏 -->
      <div class="category-section">
        <div class="category-header">
          <h2><UnifiedIcon name="brain" /> 记忆力训练</h2>
          <p>提升孩子的记忆力和反应力</p>
        </div>
        <div class="game-grid">
          <GameCard
            v-for="game in memoryGames"
            :key="game.gameKey"
            :game="game"
            @play="handlePlayGame"
          />
        </div>
      </div>

      <!-- 逻辑思维游戏 -->
      <div class="category-section">
        <div class="category-header">
          <h2><UnifiedIcon name="game" /> 逻辑思维训练</h2>
          <p>培养孩子的逻辑思维和分类能力</p>
        </div>
        <div class="game-grid">
          <GameCard
            v-for="game in logicGames"
            :key="game.gameKey"
            :game="game"
            @play="handlePlayGame"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { gamesApi } from '@/api/games'
import GameCard from './components/GameCard.vue'

const router = useRouter()
const games = ref<any[]>([])
const loading = ref(true)

const attentionGames = computed(() => 
  games.value.filter(g => g.gameType === 'attention')
)

const memoryGames = computed(() => 
  games.value.filter(g => g.gameType === 'memory')
)

const logicGames = computed(() => 
  games.value.filter(g => g.gameType === 'logic')
)

const loadGames = async () => {
  try {
    loading.value = true
    const response = await gamesApi.getGameList()
    
    // 🔍 调试日志
    console.log('🔍 完整API响应:', response)
    console.log('🔍 response.data:', response.data)
    console.log('🔍 response.data?.success:', response.data?.success)
    console.log('🔍 response.data?.data:', response.data?.data)
    
    if (response.data?.success) {
      games.value = response.data.data
      console.log('✅ 设置games数组:', games.value)
      console.log('🎮 游戏数量:', games.value.length)
    } else {
      console.warn('⚠️ API响应success不为true')
      console.log('⚠️ 尝试直接使用response.data')
      if (Array.isArray(response.data)) {
        games.value = response.data
        console.log('✅ 直接使用data数组:', games.value.length)
      }
    }
  } catch (error: any) {
    console.error('❌ 加载游戏失败:', error)
    ElMessage.error('加载游戏列表失败')
  } finally {
    loading.value = false
  }
}

const handlePlayGame = (gameKey: string) => {
  router.push(`/parent-center/games/play/${gameKey}`)
}

onMounted(() => {
  loadGames()
})
</script>

<style scoped lang="scss">
/* 使用设计令牌 */

/* ==================== 游戏中心页面 ==================== */
.games-center {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--el-color-primary) 0%, var(--el-color-primary-light-3) 100%);
  padding: var(--spacing-5xl) var(--spacing-xl);

  .header {
    text-align: center;
    color: white;
    margin-bottom: var(--spacing-3xl);

    h1 {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
      font-size: var(--text-4xl);
      font-weight: 600;
      margin: 0;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    }

    .subtitle {
      font-size: var(--text-xl);
      margin: var(--spacing-2xl) 0 0 0;
      opacity: 0.9;
    }
  }

  .game-categories {
    max-width: var(--breakpoint-2xl);
    margin: 0 auto;

    .category-section {
      background: var(--bg-card);
      border-radius: var(--radius-2xl);
      padding: var(--spacing-2xl);
      margin-bottom: var(--spacing-2xl);
      box-shadow: var(--shadow-xl);
      transition: all var(--transition-base);

      &:hover {
        box-shadow: var(--shadow-2xl);
        transform: translateY(-4px);
      }

      .category-header {
        margin-bottom: var(--spacing-xl);
        padding-bottom: var(--spacing-md);
        border-bottom: 1px solid var(--border-color-lighter);

        h2 {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--el-text-color-primary);
          margin: 0 0 var(--spacing-xs) 0;

          &::before {
            content: '';
            display: inline-block;
            width: var(--spacing-xs);
            height: var(--spacing-xl);
            background: linear-gradient(180deg, var(--el-color-primary) 0%, var(--el-color-primary-light-3) 100%);
            border-radius: var(--spacing-xs);
          }
        }

        p {
          font-size: var(--text-base);
          color: var(--el-text-color-secondary);
          margin: 0;
          padding-left: var(--spacing-lg);
        }
      }

      .game-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: var(--spacing-lg);
      }
    }
  }

  /* ==================== 响应式设计 ==================== */
  @media (max-width: var(--breakpoint-md)) {
    padding: var(--spacing-2xl) var(--spacing-md);

    .header {
      h1 {
        font-size: var(--text-2xl);
      }

      .subtitle {
        font-size: var(--text-base);
      }
    }

    .game-categories .category-section {
      padding: var(--spacing-lg);

      .category-header h2 {
        font-size: var(--text-lg);
      }

      .game-grid {
        grid-template-columns: 1fr;
      }
    }
  }
}

/* ==================== 暗色模式支持 ==================== */
@media (prefers-color-scheme: dark) {
  :root {
    /* 设计令牌会自动适配暗色模式 */
  }
}
</style>




