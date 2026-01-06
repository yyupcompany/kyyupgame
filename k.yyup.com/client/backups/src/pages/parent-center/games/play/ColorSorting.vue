<template>
  <div class="color-sorting-game">
    <!-- 顶部栏 -->
    <div class="game-header">
      <div class="header-left">
        <el-button circle @click="handleBack"><el-icon><ArrowLeft /></el-icon></el-button>
        <el-button circle @click="handlePause" :type="isPaused ? 'warning' : 'default'">
          <el-icon v-if="isPaused"><VideoPlay /></el-icon>
          <el-icon v-else><VideoPause /></el-icon>
        </el-button>
        <el-button circle @click="showHelp = true" type="info"><el-icon><QuestionFilled /></el-icon></el-button>
      </div>
      
      <div class="header-center">
        <div class="game-info">
          <span class="level-badge">第{{ currentLevel }}关</span>
          <span class="score">得分：{{ score }}</span>
          <span class="combo" v-if="combo > 1">🔥 {{ combo }}连击</span>
        </div>
      </div>
      
      <div class="header-right">
        <div class="lives">❤️ × {{ lives }}</div>
      </div>
    </div>

    <!-- 游戏主区域 -->
    <div class="game-container">
      <div class="game-title">
        <h2>🎨 颜色分类达人</h2>
        <p>把物品拖到对应颜色的篮子里！</p>
      </div>

      <!-- 传送带区域 -->
      <div class="conveyor-belt">
        <div class="belt-line"></div>
        <div
          v-for="item in conveyorItems"
          :key="item.id"
          class="conveyor-item"
          :class="{ grabbed: grabbedItem?.id === item.id }"
          :style="{ left: item.position + '%' }"
          @mousedown="handleGrabItem(item)"
          @touchstart="handleGrabItem(item)"
        >
          <div class="item-icon" :style="{ color: item.color }">
            {{ item.icon }}
          </div>
        </div>
      </div>

      <!-- 分类篮子 -->
      <div class="baskets-container">
        <div
          v-for="basket in baskets"
          :key="basket.color"
          class="basket"
          :class="{ active: dragOverBasket === basket.color }"
          :style="{ borderColor: basket.color }"
          @dragover.prevent
          @drop="handleDrop(basket)"
          @dragenter="dragOverBasket = basket.color"
          @dragleave="dragOverBasket = ''"
        >
          <div class="basket-icon" :style="{ color: basket.color }">🧺</div>
          <div class="basket-label" :style="{ color: basket.color }">{{ basket.name }}</div>
          <div class="basket-count">{{ basket.count }}</div>
        </div>
      </div>

      <!-- 底部控制 -->
      <div class="game-controls">
        <el-button type="primary" @click="handleSpeedControl" :disabled="slowDownLeft === 0">
          <el-icon><Timer /></el-icon>
          减速 ({{ slowDownLeft }})
        </el-button>
        <el-button @click="handleRestart">
          <el-icon><RefreshRight /></el-icon>
          重新开始
        </el-button>
      </div>
    </div>

    <!-- 帮助说明 -->
    <el-dialog v-model="showHelp" title="🎮 游戏说明" width="600px">
      <div class="help-content">
        <h2>🎨 颜色分类达人</h2>
        <p class="game-intro">按颜色对传送带上的物品进行分类，培养分类思维和反应能力</p>
        
        <div class="help-section">
          <h3>📖 游戏规则</h3>
          <ol>
            <li>物品会在传送带上移动</li>
            <li>点击物品并拖拽到对应颜色的收纳箱</li>
            <li>分类正确得分，分类错误扣生命</li>
            <li>在时间内完成目标数量即可过关</li>
          </ol>
        </div>

        <div class="help-section">
          <h3>🎯 游戏目标</h3>
          <ul>
            <li>正确识别物品颜色</li>
            <li>快速分类到对应箱子</li>
            <li>达到目标分类数量</li>
          </ul>
        </div>

        <div class="help-section">
          <h3>📈 难度递增</h3>
          <ul>
            <li><strong>第1-2关</strong>: {{ GameConfigManager.getDifficultyDescription(1).colors }}种颜色，速度{{ GameConfigManager.getDifficultyDescription(1).speed === 'slow' ? '慢' : GameConfigManager.getDifficultyDescription(1).speed === 'medium' ? '中' : '快' }}</li>
            <li><strong>第3-4关</strong>: {{ GameConfigManager.getDifficultyDescription(3).colors }}种颜色，速度{{ GameConfigManager.getDifficultyDescription(3).speed === 'slow' ? '慢' : GameConfigManager.getDifficultyDescription(3).speed === 'medium' ? '中' : '快' }}</li>
            <li><strong>第5关+</strong>: {{ GameConfigManager.getDifficultyDescription(5).colors }}种颜色，速度{{ GameConfigManager.getDifficultyDescription(5).speed === 'slow' ? '慢' : GameConfigManager.getDifficultyDescription(5).speed === 'medium' ? '中' : '快' }}</li>
          </ul>
          <p class="tip">💡 传送带速度随关卡递增</p>
        </div>

        <div class="help-section">
          <h3>🎮 特殊机制</h3>
          <ul>
            <li><strong>⚡ 传送带</strong>: 速度随关卡递增</li>
            <li><strong>🎯 目标数</strong>: 每关需要分类的物品数</li>
            <li><strong>❤️ 生命值</strong>: 分类错误扣生命</li>
          </ul>
        </div>

        <div class="help-section tips">
          <h3>💡 游戏技巧</h3>
          <ul>
            <li>提前看好目标物品的颜色</li>
            <li>手指准备好对应的收纳箱位置</li>
            <li>不要等到最后一刻才拖拽</li>
            <li>多种颜色时先处理常见的</li>
          </ul>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="showHelp = false" size="large">知道了</el-button>
      </template>
    </el-dialog>

    <!-- 完成弹窗 -->
    <el-dialog v-model="showCompletionDialog" title="🎉 颜色大师！" width="400px">
      <div class="completion-content">
        <div class="stars">
          <el-icon v-for="i in starsEarned" :key="i" class="star"><StarFilled /></el-icon>
        </div>
        <div class="score-info">
          <p>最终得分：{{ score }}</p>
          <p>准确率：{{ accuracy }}%</p>
          <p class="grade">{{ getGrade() }}</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="handleNextLevel" type="primary">下一关</el-button>
        <el-button @click="handleBack">返回大厅</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { audioManager } from '../utils/audioManager'
import { ArrowLeft, VideoPause, VideoPlay, Timer, RefreshRight, StarFilled, QuestionFilled } from '@element-plus/icons-vue'
import GameConfigManager from '@/config/game-config'

const router = useRouter()

const currentLevel = ref(1)
const score = ref(0)
const lives = ref(GameConfigManager.getGeneralConfig().defaultLives)
const combo = ref(0)
const slowDownLeft = ref(GameConfigManager.getLevelConfig().slowDownUses)
const correctSorts = ref(0)
const wrongSorts = ref(0)
const showCompletionDialog = ref(false)
const starsEarned = ref(0)
const isPaused = ref(false)
const showHelp = ref(false)
const grabbedItem = ref<any>(null)
const dragOverBasket = ref('')

interface ConveyorItem {
  id: number
  icon: string
  color: string
  colorName: string
  position: number
}

const conveyorItems = ref<ConveyorItem[]>([])
let nextItemId = 0

const COLOR_ITEMS = {
  red: [{ icon: '🍎', name: '苹果' }, { icon: '🚗', name: '汽车' }, { icon: '❤️', name: '爱心' }],
  orange: [{ icon: '🍊', name: '橙子' }, { icon: '🎃', name: '南瓜' }, { icon: '🦊', name: '狐狸' }],
  yellow: [{ icon: '🍌', name: '香蕉' }, { icon: '☀️', name: '太阳' }, { icon: '🐥', name: '小鸡' }],
  green: [{ icon: '🍀', name: '叶子' }, { icon: '🐸', name: '青蛙' }, { icon: '🥒', name: '黄瓜' }],
  blue: [{ icon: '💙', name: '心' }, { icon: '🌊', name: '海洋' }, { icon: '🫐', name: '蓝莓' }],
  purple: [{ icon: '🍇', name: '葡萄' }, { icon: '💜', name: '心' }, { icon: '🦄', name: '独角兽' }]
}

const baskets = ref(GameConfigManager.getGameConfig('colorSorting').colors.map(color => ({ ...color, count: 0 })))

const activeBaskets = computed(() => {
  return GameConfigManager.getLevelBaskets(currentLevel.value).map((basket, index) => ({
    ...basket,
    count: baskets.value[index]?.count || 0
  }))
})

const accuracy = computed(() => {
  const total = correctSorts.value + wrongSorts.value
  return total > 0 ? Math.round((correctSorts.value / total) * 100) : 100
})

let spawnInterval: number | null = null
let moveInterval: number | null = null

onMounted(() => {
  // 初始化设计令牌CSS变量
  DesignTokenManager.applyCSSVariables()

  initLevel()
  playVoice('game-start')
  // 播放BGM
  audioManager.playBGM('/uploads/games/audio/bgm/color-sorting-bgm.mp3')
})

onUnmounted(() => {
  if (spawnInterval) clearInterval(spawnInterval)
  if (moveInterval) clearInterval(moveInterval)
  // 停止BGM
  audioManager.dispose()
})

const initLevel = () => {
  conveyorItems.value = []
  correctSorts.value = 0
  wrongSorts.value = 0
  combo.value = 0
  
  startSpawning()
  startMoving()
}

const startSpawning = () => {
  spawnInterval = window.setInterval(() => {
    if (isPaused.value || conveyorItems.value.length >= GameConfigManager.getLevelConfig().maxItems) return
    spawnItem()
  }, GameConfigManager.getGameConfig('colorSorting').conveyor.spawnInterval)
}

const spawnItem = () => {
  const basket = activeBaskets.value[Math.floor(Math.random() * activeBaskets.value.length)]
  const items = COLOR_ITEMS[basket.colorKey as keyof typeof COLOR_ITEMS]
  const item = items[Math.floor(Math.random() * items.length)]
  
  conveyorItems.value.push({
    id: nextItemId++,
    icon: item.icon,
    color: basket.color,
    colorName: basket.name,
    position: -5
  })
}

const startMoving = () => {
  moveInterval = window.setInterval(() => {
    if (isPaused.value) return
    
    conveyorItems.value.forEach(item => {
      item.position += GameConfigManager.getLevelSpeed(currentLevel.value)
      
      if (item.position > 105) {
        handleMissedItem(item)
      }
    })
    
    conveyorItems.value = conveyorItems.value.filter(item => item.position <= 105)
  }, 50)
}

const handleGrabItem = (item: ConveyorItem) => {
  grabbedItem.value = item
}

const handleDrop = (basket: any) => {
  if (!grabbedItem.value) return
  
  const item = grabbedItem.value
  
  if (item.colorName === basket.name) {
    correctSorts.value++
    combo.value++
    score.value += GameConfigManager.calculateScore('correct', combo.value)
    basket.count++
    
    playSound('correct')
    playVoice('correct')
    ElMessage.success(`+${GameConfigManager.calculateScore('correct', combo.value)}分！`)
    
    if (correctSorts.value >= GameConfigManager.getGeneralConfig().baseScore / 5) { // 20个正确 = 1000分基础分 / 5
      handleLevelComplete()
    }
  } else {
    wrongSorts.value++
    combo.value = 0
    lives.value--
    
    playSound('wrong')
    ElMessage.error('颜色不对哦！')
    
    if (lives.value <= 0) {
      handleGameOver()
    }
  }
  
  conveyorItems.value = conveyorItems.value.filter(i => i.id !== item.id)
  grabbedItem.value = null
  dragOverBasket.value = ''
}

const handleMissedItem = (item: ConveyorItem) => {
  lives.value--
  combo.value = 0
  
  if (lives.value <= 0) {
    handleGameOver()
  }
}

const handleSpeedControl = () => {
  if (slowDownLeft.value === 0) return
  slowDownLeft.value--
  ElMessage.success('⏱️ 传送带减速10秒！')
}

const handleLevelComplete = () => {
  if (spawnInterval) clearInterval(spawnInterval)
  if (moveInterval) clearInterval(moveInterval)
  
  starsEarned.value = GameConfigManager.calculateStars(accuracy.value, lives.value)
  
  playVoice('level-complete')
  showCompletionDialog.value = true
}

const handleGameOver = () => {
  if (spawnInterval) clearInterval(spawnInterval)
  if (moveInterval) clearInterval(moveInterval)
  ElMessage.error('游戏结束！')
}

const getGrade = () => {
  return GameConfigManager.getAchievementText(starsEarned.value)
}

const handleNextLevel = () => {
  currentLevel.value++
  lives.value = GameConfigManager.getGeneralConfig().defaultLives
  slowDownLeft.value = GameConfigManager.getLevelConfig().slowDownUses
  showCompletionDialog.value = false
  initLevel()
}

const handleRestart = () => {
  currentLevel.value = 1
  score.value = 0
  lives.value = GameConfigManager.getGeneralConfig().defaultLives
  slowDownLeft.value = GameConfigManager.getLevelConfig().slowDownUses
  initLevel()
}

const handlePause = () => {
  isPaused.value = !isPaused.value
  
  if (isPaused.value) {
    ElMessage.info('游戏已暂停')
    audioManager.pauseBGM()
  } else {
    ElMessage.success('游戏继续')
    audioManager.resumeBGM()
  }
}

const handleBack = () => router.push('/parent-center/games')

const playSound = (type: string) => {
  const audio = new Audio(`/uploads/games/audio/sfx/${type}.mp3`)
  audio.volume = GameConfigManager.getVolumeConfig().backgroundMusic.volume
  audio.play().catch(() => {})
}

const playVoice = (type: string) => {
  const audio = new Audio(`/uploads/games/audio/voices/color-sorting/${type}.mp3`)
  audio.volume = GameConfigManager.getVolumeConfig().voice.volume
  audio.play().catch(() => {})
}
</script>

<style scoped lang="scss">
.help-content {
  h2 { color: var(--warning-color); font-size: var(--text-3xl); margin: 0 0 var(--spacing-sm) 0; }
  .game-intro { font-size: var(--text-lg); color: var(--text-regular); margin-bottom: var(--text-3xl); padding: var(--text-sm); background: var(--bg-hover); border-radius: var(--spacing-sm); }
  .help-section { margin-bottom: var(--text-3xl);
    h3 { font-size: var(--text-xl); color: var(--text-primary); margin: 0 0 var(--text-sm) 0; padding-bottom: var(--spacing-sm); border-bottom: 2px solid var(--border-color-light); }
    ol, ul { margin: 0; padding-left: var(--text-3xl);
      li { margin-bottom: var(--spacing-sm); line-height: 1.6; color: var(--text-regular); strong { color: var(--warning-color); } }
    }
    .tip { margin-top: var(--text-sm); padding: var(--spacing-sm) var(--text-sm); background: var(--warning-light-bg); border-left: var(--spacing-xs) solid var(--warning-color); color: var(--warning-color); font-size: var(--text-base); border-radius: var(--spacing-xs); }
    &.tips { background: var(--bg-white); padding: var(--text-lg); border-radius: var(--spacing-sm); border: 2px solid var(--warning-color);
      h3 { color: var(--warning-color); border-bottom-color: var(--warning-color); }
      ul li { color: var(--warning-color); }
    }
  }
}

.color-sorting-game {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--warning-light-bg) 0%, #ffe0b2 50%, #ffcc80 100%);
  padding: var(--text-2xl);
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  padding: var(--spacing-lg) var(--text-xl);
  border-radius: var(--text-2xl);
  box-shadow: 0 var(--spacing-xs) var(--spacing-xl) rgba(255, 152, 0, 0.3);
  margin-bottom: var(--text-2xl);

  .game-info {
    display: flex;
    gap: var(--text-2xl);
    align-items: center;

    .level-badge {
      background: linear-gradient(135deg, var(--warning-color), #f57c00);
      color: white;
      padding: var(--spacing-sm) var(--text-2xl);
      border-radius: var(--text-2xl);
      font-weight: bold;
    }

    .score, .combo {
      font-size: var(--text-xl);
      font-weight: bold;
      color: var(--warning-color);
    }
  }

  .lives {
    font-size: var(--text-2xl);
    font-weight: bold;
    color: var(--danger-color);
  }
}

.game-title {
  text-align: center;
  margin-bottom: var(--spacing-3xl);

  h2 {
    font-size: var(--text-4xl);
    color: var(--warning-color);
    text-shadow: var(--spacing-xs) var(--spacing-xs) var(--spacing-xs) rgba(255, 152, 0, 0.3);
  }

  p {
    font-size: var(--text-xl);
    color: var(--text-secondary);
  }
}

.conveyor-belt {
  position: relative;
  height: var(--size-32);
  background: linear-gradient(to bottom, var(--text-primary), #555, var(--text-primary));
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-3xl);
  overflow: hidden;
  box-shadow: inset 0 var(--spacing-xs) var(--spacing-lg) var(--shadow-heavy);

  .belt-line {
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: var(--spacing-xs);
    background: repeating-linear-gradient(90deg, #ffa500 0px, #ffa500 var(--text-2xl), transparent var(--text-2xl), transparent 40px);
    animation: belt-move 2s linear infinite;
  }

  .conveyor-item {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    cursor: grab;
    transition: all 0.2s ease;

    &.grabbed {
      cursor: grabbing;
      transform: translateY(-50%) scale(1.2);
    }

    .item-icon {
      font-size: var(--text-6xl);
      filter: drop-shadow(0 var(--spacing-xs) var(--spacing-xs) rgba(0, 0, 0, 0.3));
    }
  }
}

.baskets-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(var(--size-30), 1fr));
  gap: var(--text-2xl);
  margin-bottom: var(--spacing-3xl);
}

.basket {
  background: rgba(255, 255, 255, 0.9);
  padding: var(--spacing-3xl) var(--text-2xl);
  border-radius: var(--text-2xl);
  border: var(--spacing-xs) dashed var(--border-color-light);
  text-align: center;
  transition: all 0.3s ease;

  &.active {
    transform: scale(1.1);
    box-shadow: 0 var(--spacing-sm) var(--spacing-2xl) var(--shadow-heavy);
  }

  .basket-icon {
    font-size: var(--text-5xl);
    margin-bottom: var(--spacing-sm);
  }

  .basket-label {
    font-size: var(--text-xl);
    font-weight: bold;
    margin-bottom: var(--spacing-sm);
  }

  .basket-count {
    font-size: var(--text-3xl);
    font-weight: bold;
    color: var(--text-secondary);
  }
}

.game-controls {
  display: flex;
  justify-content: center;
  gap: var(--text-2xl);

  .el-button {
    padding: var(--spacing-lg) var(--spacing-3xl);
    border-radius: var(--radius-2xl);
  }
}

@keyframes belt-move {
  0% { background-position: 0 0; }
  100% { background-position: var(--size-10) 0; }
}
</style>

