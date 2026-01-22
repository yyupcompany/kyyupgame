<template>
  <div class="fruit-sequence-game">
    <!-- 游戏容器 -->
    <div class="game-container">
      <!-- 顶部栏 -->
      <div class="top-bar">
        <div class="left-controls">
          <el-button @click="handleBack" circle size="large">
            <UnifiedIcon name="default" />
          </el-button>
          <el-button @click="handlePause" circle size="large" :type="isPaused ? 'warning' : 'default'">
            <UnifiedIcon name="default" />
            <UnifiedIcon name="default" />
          </el-button>
          <el-button @click="showSettings = true" circle size="large">
            <UnifiedIcon name="default" />
          </el-button>
          <el-button @click="showHelp = true" circle size="large" type="info">
            <UnifiedIcon name="default" />
          </el-button>
        </div>
        
        <div class="game-stats">
          <div class="stat-item">
            <UnifiedIcon name="default" />
            <span>{{ score }}</span>
          </div>
          <div class="stat-item lives">
            <span v-for="i in 3" :key="i">
              {{ i <= lives ? '❤️' : '🖤' }}
            </span>
          </div>
          <div class="stat-item">
            <span>关卡 {{ currentLevel }}</span>
          </div>
        </div>
      </div>

      <!-- 游戏主体 -->
      <div class="game-content">
        <!-- 水果展示区域 -->
        <div class="fruits-container">
          <div
            v-for="(fruit, index) in visibleFruits"
            :key="index"
            class="fruit-item"
            :class="{
              'active': activeFruitIndex === index,
              'selected': selectedFruits.includes(index),
              'correct': feedbackState === 'correct' && lastSelectedIndex === index,
              'wrong': feedbackState === 'wrong' && lastSelectedIndex === index
            }"
            @click="handleFruitClick(index)"
          >
            <img :src="buildItemUrl(`${fruit}.png`, 'fruits')" :alt="getFruitName(fruit)" />
            <div class="fruit-glow"></div>
          </div>
        </div>

        <!-- 状态提示 -->
        <div class="game-status">
          <div v-if="gameState === 'demo'" class="status-text pulse">
            <h2>请记住顺序！</h2>
            <div class="sequence-display">
              序列长度：<span class="highlight">{{ currentSequence.length }}</span>
            </div>
          </div>
          
          <div v-if="gameState === 'playing'" class="status-text">
            <h2>请按顺序点击水果</h2>
            <div class="progress-display">
              已完成：<span class="highlight">{{ selectedFruits.length }}</span> / {{ currentSequence.length }}
            </div>
          </div>
          
          <div v-if="gameState === 'success'" class="status-text success-animation">
            <h2>🎉 太棒了！</h2>
            <p>进入下一关...</p>
          </div>
          
          <div v-if="gameState === 'gameover'" class="status-text gameover-animation">
            <h2>游戏结束</h2>
            <p>最高关卡：{{ currentLevel }}</p>
            <el-button type="primary" @click="handleRestart" size="large">
              再来一次
            </el-button>
          </div>
        </div>
      </div>

      <!-- 底部工具栏 -->
      <div class="bottom-toolbar">
        <el-button @click="toggleBGM" circle size="large">
          <UnifiedIcon name="default" />
          <UnifiedIcon name="default" />
        </el-button>
        <span class="toolbar-label">{{ bgmPlaying ? '音乐开' : '音乐关' }}</span>
        
        <el-button @click="toggleSFX" circle size="large">
          <UnifiedIcon name="default" />
          <UnifiedIcon name="default" />
        </el-button>
        <span class="toolbar-label">{{ sfxEnabled ? '音效开' : '音效关' }}</span>
        
        <el-button @click="handleRestart" :disabled="gameState === 'demo' || gameState === 'playing'" circle size="large">
          <UnifiedIcon name="Refresh" />
        </el-button>
        <span class="toolbar-label">重新开始</span>
      </div>
    </div>

    <!-- 帮助说明 -->
    <el-dialog v-model="showHelp" title="🎮 游戏说明" class="responsive-dialog dialog-large">
      <div class="help-content">
        <h2>🍎 水果记忆大师</h2>
        <p class="game-intro">这是一个锻炼记忆力和反应力的Simon Says风格序列记忆游戏</p>
        
        <div class="help-section">
          <h3>📖 游戏规则</h3>
          <ol>
            <li>游戏会按顺序点亮水果，请仔细观察并记住顺序</li>
            <li>演示完成后，按照刚才看到的顺序点击水果</li>
            <li>点击正确会获得分数，点击错误会失去生命值</li>
            <li>失去3次生命值后游戏结束</li>
          </ol>
        </div>

        <div class="help-section">
          <h3>🎯 游戏目标</h3>
          <ul>
            <li>记住水果的点亮顺序</li>
            <li>按正确顺序重复点击</li>
            <li>挑战更高关卡，测试记忆极限</li>
          </ul>
        </div>

        <div class="help-section">
          <h3>📈 难度递增</h3>
          <ul>
            <li><strong>第1关</strong>: 3个水果，序列长度3</li>
            <li><strong>第2关</strong>: 4个水果，序列长度4</li>
            <li><strong>第3关</strong>: 5个水果，序列长度5</li>
            <li><strong>第7关+</strong>: 9个水果，序列长度9+</li>
          </ul>
          <p class="tip">💡 每通过一关，水果数量和序列长度都会增加</p>
        </div>

        <div class="help-section">
          <h3>🎮 控制按钮</h3>
          <ul>
            <li><strong>⏸️ 暂停</strong>: 暂停游戏，点击后变为▶️继续</li>
            <li><strong>⚙️ 设置</strong>: 调节音乐、音效、语音音量</li>
            <li><strong>❓ 帮助</strong>: 查看游戏说明（当前页面）</li>
            <li><strong>🔄 重新开始</strong>: 从第1关重新开始</li>
          </ul>
        </div>

        <div class="help-section tips">
          <h3>💡 游戏技巧</h3>
          <ul>
            <li>集中注意力观察演示</li>
            <li>可以小声重复水果名称帮助记忆</li>
            <li>序列长了可以分段记忆</li>
            <li>不要着急，想清楚再点击</li>
          </ul>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="showHelp = false" size="large">知道了</el-button>
      </template>
    </el-dialog>

    <!-- 设置面板 -->
    <el-dialog v-model="showSettings" title="游戏设置" class="responsive-dialog dialog-medium">
      <div class="settings-panel">
        <div class="setting-item">
          <label>🎵 背景音乐</label>
          <el-slider v-model="bgmVolume" :min="0" :max="100" @change="handleVolumeChange" />
        </div>
        <div class="setting-item">
          <label>🔊 音效音量</label>
          <el-slider v-model="sfxVolume" :min="0" :max="100" @change="handleVolumeChange" />
        </div>
        <div class="setting-item">
          <label>🗣️ 语音音量</label>
          <el-slider v-model="voiceVolume" :min="0" :max="100" @change="handleVolumeChange" />
        </div>
      </div>
    </el-dialog>

    <!-- 结果弹窗 -->
    <el-dialog v-model="showResults" title="🎉 游戏结果" class="responsive-dialog dialog-large" :close-on-click-modal="false">
      <div class="results-content">
        <div class="stars">
          <span v-for="i in 3" :key="i" class="star" :class="{ active: i <= earnedStars }">
            ⭐
          </span>
        </div>
        <div class="result-stats">
          <div class="stat">
            <span class="label">得分</span>
            <span class="value">{{ finalScore }}</span>
          </div>
          <div class="stat">
            <span class="label">最高关卡</span>
            <span class="value">{{ currentLevel }}</span>
          </div>
          <div class="stat">
            <span class="label">准确率</span>
            <span class="value">{{ accuracy }}%</span>
          </div>
        </div>
        <div class="result-actions">
          <el-button @click="handleRestart" type="primary" size="large">再玩一次</el-button>
          <el-button @click="handleBack" size="large">返回大厅</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Back, VideoPause, Setting, Star, RefreshRight,
  VideoPlay, Mute, Bell, MuteNotification, QuestionFilled, Headset
} from '@element-plus/icons-vue'
import { audioManager } from '../utils/audioManager'
import { buildBGMUrl, buildSFXUrl, buildVoiceUrl, buildItemUrl } from '@/utils/oss-url-builder'
import { gamesApi } from '@/api/games'

const router = useRouter()

// 游戏状态
type GameState = 'demo' | 'playing' | 'success' | 'gameover'
const gameState = ref<GameState>('demo')

// 水果列表（12种）
const allFruits = ['apple', 'banana', 'strawberry', 'grape', 'orange', 'watermelon', 
                   'cherry', 'pineapple', 'peach', 'lemon', 'kiwi', 'mango']

// 当前使用的水果（根据关卡）
const visibleFruits = ref<string[]>([])

// 游戏数据
const score = ref(0)
const lives = ref(3)
const currentLevel = ref(1)
const currentSequence = ref<number[]>([])
const selectedFruits = ref<number[]>([])
const activeFruitIndex = ref<number>(-1)
const feedbackState = ref<'correct' | 'wrong' | null>(null)
const lastSelectedIndex = ref<number>(-1)

// 音频设置
const bgmPlaying = ref(true)
const sfxEnabled = ref(true)
const bgmVolume = ref(50)
const sfxVolume = ref(80)
const voiceVolume = ref(100)
const showSettings = ref(false)
const showHelp = ref(false)

// 结果显示
const showResults = ref(false)
const finalScore = ref(0)
const earnedStars = ref(0)
const accuracy = ref(100)

// 获取水果中文名
const getFruitName = (fruit: string): string => {
  const names: Record<string, string> = {
    apple: '苹果', banana: '香蕉', strawberry: '草莓', grape: '葡萄',
    orange: '橙子', watermelon: '西瓜', cherry: '樱桃', pineapple: '菠萝',
    peach: '桃子', lemon: '柠檬', kiwi: '猕猴桃', mango: '芒果'
  }
  return names[fruit] || fruit
}

// 初始化游戏
const initGame = () => {
  score.value = 0
  lives.value = 3
  currentLevel.value = 1
  
  // 根据关卡选择水果数量（每关+1个，3-9个）
  const fruitCount = Math.min(2 + currentLevel.value, 9)
  visibleFruits.value = [...allFruits].sort(() => Math.random() - 0.5).slice(0, fruitCount)
  
  startNewRound()
}

// 开始新一轮
const startNewRound = () => {
  selectedFruits.value = []
  feedbackState.value = null
  
  // 生成序列（长度 = 2 + 当前关卡）
  const sequenceLength = Math.min(2 + currentLevel.value, 12)
  currentSequence.value = []
  for (let i = 0; i < sequenceLength; i++) {
    currentSequence.value.push(Math.floor(Math.random() * visibleFruits.value.length))
  }
  
  // 播放演示
  playDemo()
}

// 播放序列演示
const playDemo = async () => {
  gameState.value = 'demo'

  // 播放语音
  await audioManager.playVoice(buildVoiceUrl('fruit-demo-start.mp3', 'fruit-sequence'))

  // 依次高亮水果
  for (let i = 0; i < currentSequence.value.length; i++) {
    const fruitIndex = currentSequence.value[i]
    activeFruitIndex.value = fruitIndex

    // 播放水果名称音效
    if (sfxEnabled.value) {
      audioManager.playSFX('fruit-highlight', buildSFXUrl('fruit-highlight.mp3'), sfxVolume.value / 100)
    }

    await new Promise(resolve => setTimeout(resolve, 800))
    activeFruitIndex.value = -1
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  // 演示完成，进入玩家输入阶段
  gameState.value = 'playing'
  await audioManager.playVoice(buildVoiceUrl('your-turn.mp3', 'fruit-sequence'))
}

// 玩家点击水果
const handleFruitClick = async (index: number) => {
  // 暂停时不能点击
  if (isPaused.value) {
    ElMessage.warning('游戏已暂停，请先恢复')
    return
  }
  
  if (gameState.value !== 'playing') return
  if (selectedFruits.value.includes(index)) return
  
  selectedFruits.value.push(index)
  lastSelectedIndex.value = index
  
  const expectedIndex = currentSequence.value[selectedFruits.value.length - 1]
  
  // 检查是否正确
  if (index === expectedIndex) {
    // 正确
    feedbackState.value = 'correct'
    if (sfxEnabled.value) {
      audioManager.playSFX('correct', buildSFXUrl('correct.mp3'), sfxVolume.value / 100)
    }

    // 检查是否完成整个序列
    if (selectedFruits.value.length === currentSequence.value.length) {
      await handleLevelComplete()
    }

    setTimeout(() => {
      feedbackState.value = null
    }, 500)

  } else {
    // 错误
    feedbackState.value = 'wrong'
    lives.value--

    if (sfxEnabled.value) {
      audioManager.playSFX('wrong', buildSFXUrl('wrong.mp3'), sfxVolume.value / 100)
    }

    await audioManager.playVoice(buildVoiceUrl('try-again.mp3', 'fruit-sequence'))
    
    setTimeout(() => {
      feedbackState.value = null
    }, 500)
    
    if (lives.value <= 0) {
      await handleGameOver()
    } else {
      // 重新开始当前轮
      await new Promise(resolve => setTimeout(resolve, 1000))
      startNewRound()
    }
  }
}

// 关卡完成
const handleLevelComplete = async () => {
  console.log('🎉 关卡完成！当前关卡:', currentLevel.value)

  gameState.value = 'success'
  score.value += currentLevel.value * 100

  if (sfxEnabled.value) {
    audioManager.playSFX('level-complete', buildSFXUrl('level-complete.mp3'), sfxVolume.value / 100)
  }

  await audioManager.playVoice(buildVoiceUrl('level-complete.mp3', 'fruit-sequence'))
  
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // 进入下一关
  currentLevel.value++
  console.log('📈 进入下一关:', currentLevel.value)
  
  // 更新可见水果数量（每关+1个）
  const fruitCount = Math.min(2 + currentLevel.value, 9)
  console.log('🍎 新的水果数量:', fruitCount, '之前:', visibleFruits.value.length)
  
  // 总是重新生成水果列表以增加难度
  visibleFruits.value = [...allFruits].sort(() => Math.random() - 0.5).slice(0, fruitCount)
  console.log('🍎 水果列表已更新，数量:', visibleFruits.value.length)
  
  startNewRound()
}

// 游戏结束
const handleGameOver = async () => {
  gameState.value = 'gameover'
  finalScore.value = score.value

  // 计算星级和准确率
  earnedStars.value = currentLevel.value >= 10 ? 3 : currentLevel.value >= 5 ? 2 : 1
  accuracy.value = 100

  if (sfxEnabled.value) {
    audioManager.playSFX('gameover', buildSFXUrl('gameover.mp3'), sfxVolume.value / 100)
  }

  await audioManager.playVoice(buildVoiceUrl('gameover.mp3', 'fruit-sequence'))
  
  // 保存游戏记录
  try {
    await gamesApi.saveGameRecord({
      gameKey: 'fruit-sequence',
      levelNumber: currentLevel.value,
      score: score.value,
      timeSpent: 0, // TODO: 添加计时
      accuracy: accuracy.value,
      mistakes: 3 - lives.value,
      comboMax: currentLevel.value,
      gameData: {
        maxSequenceLength: currentSequence.value.length
      }
    })
  } catch (error) {
    console.error('保存游戏记录失败:', error)
  }
  
  showResults.value = true
}

// 重新开始
const handleRestart = () => {
  showResults.value = false
  initGame()
}

// 返回大厅
const handleBack = () => {
  router.push('/parent-center/games')
}

// 暂停
// 暂停状态
const isPaused = ref(false)

const handlePause = () => {
  isPaused.value = !isPaused.value
  
  if (isPaused.value) {
    ElMessage.info('游戏已暂停')
    if (bgmPlaying.value) {
      audioManager.pauseBGM()
    }
  } else {
    ElMessage.success('游戏继续')
    if (bgmPlaying.value) {
      audioManager.resumeBGM()
    }
  }
}

// 音量控制
const toggleBGM = () => {
  bgmPlaying.value = !bgmPlaying.value
  if (bgmPlaying.value) {
    audioManager.playBGM(buildBGMUrl('fruit-memory-bgm.mp3'))
  } else {
    audioManager.stopBGM()
  }
}

const toggleSFX = () => {
  sfxEnabled.value = !sfxEnabled.value
}

const handleVolumeChange = () => {
  audioManager.setVolumes(
    bgmVolume.value / 100,
    voiceVolume.value / 100,
    sfxVolume.value / 100
  )
}

onMounted(() => {
  initGame()
  // 播放BGM
  audioManager.playBGM(buildBGMUrl('fruit-memory-bgm.mp3'))
})

onBeforeUnmount(() => {
  audioManager.dispose()
})
</script>

<style scoped lang="scss">
/* 使用设计令牌 */

/* ==================== 水果记忆游戏页面 ==================== */
.fruit-sequence-game {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--el-color-warning-light-9) 0%, var(--el-color-warning-light-7) 50%, var(--el-color-success-light-9) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);

  .game-container {
    width: 95%;
    max-width: 1200px;
    height: 90vh;
    background: var(--bg-card);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-2xl);
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md) var(--spacing-xl);
      background: linear-gradient(135deg, var(--el-color-warning-light-8) 0%, var(--el-color-warning) 100%);
      border-bottom: 2px solid var(--el-color-warning-light-5);

      .left-controls {
        display: flex;
        gap: var(--spacing-sm);

        :deep(.el-button.is-circle) {
          width: 44px;
          height: 44px;
          background: white;
          border: none;
          box-shadow: var(--shadow-sm);

          &:hover {
            box-shadow: var(--shadow-md);
            transform: scale(1.05);
          }
        }
      }

      .game-stats {
        display: flex;
        gap: var(--spacing-xl);
        align-items: center;

        .stat-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--el-color-warning-dark-2);

          :deep(.el-icon) {
            font-size: var(--text-xl);
          }

          &.lives {
            font-size: var(--text-xl);
          }
        }
      }
    }

    .game-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-2xl);
      position: relative;

      .fruits-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: var(--spacing-lg);
        max-width: 900px;
        margin-bottom: var(--spacing-xl);

        .fruit-item {
          position: relative;
          max-width: 150px;
          width: 100%;
          aspect-ratio: 1;
          cursor: pointer;
          transition: all var(--transition-base);
          display: flex;
          align-items: center;
          justify-content: center;

          img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            filter: drop-shadow(var(--shadow-sm));
            transition: all var(--transition-base);
          }

          .fruit-glow {
            position: absolute;
            inset: -10px;
            border-radius: 50%;
            opacity: 0;
            transition: opacity var(--transition-base);
          }

          &:hover {
            transform: scale(1.05);

            img {
              filter: drop-shadow(var(--shadow-md));
            }
          }

          &.active {
            transform: scale(1.15);
            z-index: 1;

            .fruit-glow {
              opacity: 1;
              background: radial-gradient(circle, rgba(230, 162, 60, 0.3) 0%, transparent 70%);
              animation: glow-pulse 0.8s ease-in-out infinite;
            }

            img {
              filter: drop-shadow(0 0 20px var(--el-color-warning));
            }
          }

          &.selected {
            opacity: 0.5;
          }

          &.correct {
            animation: correct-bounce 0.5s ease;

            .fruit-glow {
              opacity: 1;
              background: radial-gradient(circle, rgba(103, 194, 58, 0.3) 0%, transparent 70%);
            }
          }

          &.wrong {
            animation: wrong-shake 0.5s ease;

            .fruit-glow {
              opacity: 1;
              background: radial-gradient(circle, rgba(245, 108, 108, 0.3) 0%, transparent 70%);
            }
          }
        }
      }

      .game-status {
        text-align: center;

        .status-text {
          h2 {
            font-size: var(--text-xl);
            color: var(--el-color-warning-dark-2);
            margin: 0 0 var(--spacing-md) 0;
          }

          p {
            font-size: var(--text-base);
            color: var(--el-text-color-secondary);
            margin: var(--spacing-sm) 0;
          }

          .sequence-display,
          .progress-display {
            font-size: var(--text-lg);
            color: var(--el-text-color-primary);

            .highlight {
              font-size: var(--text-2xl);
              font-weight: 600;
              color: var(--el-color-warning);
            }
          }

          &.pulse {
            animation: pulse 1.5s ease-in-out infinite;
          }

          &.success-animation {
            animation: success-bounce 0.6s ease;
          }

          &.gameover-animation {
            animation: fade-in 0.5s ease;
          }
        }
      }
    }

    .bottom-toolbar {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: var(--spacing-lg);
      padding: var(--spacing-md) var(--spacing-xl);
      background: var(--el-color-warning-light-9);
      border-top: 1px solid var(--el-color-warning-light-5);

      .toolbar-label {
        font-size: var(--text-sm);
        font-weight: 500;
        color: var(--el-text-color-secondary);
        margin-right: var(--spacing-sm);
      }

      :deep(.el-button.is-circle) {
        width: 40px;
        height: 40px;
        background: white;
        border: none;
        box-shadow: var(--shadow-sm);

        &:hover {
          box-shadow: var(--shadow-md);
        }
      }
    }
  }
}

.help-content {
  h2 {
    color: var(--el-color-primary);
    font-size: var(--text-xl);
    margin: 0 0 var(--spacing-md) 0;
  }

  .game-intro {
    font-size: var(--text-base);
    color: var(--el-text-color-secondary);
    margin-bottom: var(--spacing-lg);
    padding: var(--spacing-md);
    background: var(--el-fill-color-light);
    border-radius: var(--radius-md);
    line-height: var(--leading-relaxed);
  }

  .help-section {
    margin-bottom: var(--spacing-lg);

    h3 {
      font-size: var(--text-base);
      color: var(--el-text-color-primary);
      margin: 0 0 var(--spacing-sm) 0;
      padding-bottom: var(--spacing-xs);
      border-bottom: 1px solid var(--border-color-lighter);
    }

    ol,
    ul {
      margin: 0;
      padding-left: var(--spacing-xl);

      li {
        margin-bottom: var(--spacing-xs);
        line-height: var(--leading-relaxed);
        color: var(--el-text-color-secondary);

        strong {
          color: var(--el-color-primary);
        }
      }
    }

    .tip {
      margin-top: var(--spacing-sm);
      padding: var(--spacing-sm) var(--spacing-md);
      background: var(--el-color-warning-light-9);
      border-left: 3px solid var(--el-color-warning);
      color: var(--el-color-warning-dark-2);
      font-size: var(--text-sm);
      border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
    }

    &.tips {
      background: var(--el-fill-color-light);
      padding: var(--spacing-md);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color-lighter);

      h3 {
        color: var(--el-text-color-primary);
        border-bottom-color: var(--el-color-info-light-5);
      }

      ul li {
        color: var(--el-text-color-secondary);
      }
    }
  }
}

.settings-panel {
  .setting-item {
    margin-bottom: var(--spacing-lg);

    label {
      display: block;
      margin-bottom: var(--spacing-sm);
      font-size: var(--text-base);
      font-weight: 500;
      color: var(--el-text-color-primary);
    }
  }
}

.results-content {
  text-align: center;

  .stars {
    display: flex;
    justify-content: center;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-xl);

    .star {
      font-size: 48px;
      opacity: 0.3;
      transition: all var(--transition-base);

      &.active {
        opacity: 1;
        animation: star-pop 0.5s ease;
      }
    }
  }

  .result-stats {
    display: flex;
    justify-content: space-around;
    margin-bottom: var(--spacing-xl);

    .stat {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
      align-items: center;

      .label {
        font-size: var(--text-sm);
        color: var(--el-text-color-secondary);
      }

      .value {
        font-size: var(--text-xl);
        font-weight: 600;
        color: var(--el-color-warning);
      }
    }
  }

  .result-actions {
    display: flex;
    justify-content: center;
    gap: var(--spacing-md);
  }
}

/* ==================== 动画关键帧 ==================== */
@keyframes glow-pulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.1); opacity: 1; }
}

@keyframes correct-bounce {
  0% { transform: scale(1); }
  50% { transform: scale(1.2) rotate(5deg); }
  100% { transform: scale(1) rotate(0deg); }
}

@keyframes wrong-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

@keyframes success-bounce {
  0% { transform: scale(0.5); opacity: 0; }
  60% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes star-pop {
  0% { transform: scale(0) rotate(-180deg); opacity: 0; }
  60% { transform: scale(1.2) rotate(10deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

/* ==================== 响应式对话框样式 ==================== */
.responsive-dialog {
  @media (max-width: var(--breakpoint-md)) {
    width: 90% !important;
    max-width: none !important;
    margin: 0 auto !important;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    &.dialog-large { width: 80% !important; max-width: 500px !important; }
    &.dialog-medium { width: 70% !important; max-width: 450px !important; }
    &.dialog-small { width: 60% !important; max-width: 380px !important; }
  }

  @media (min-width: 1025px) {
    &.dialog-large { width: 100%; max-width: 560px !important; }
    &.dialog-medium { width: 480px !important; }
    &.dialog-small { width: 100%; max-width: 400px !important; }
  }
}

/* ==================== 响应式设计 ==================== */
@media (max-width: var(--breakpoint-md)) {
  .fruit-sequence-game {
    padding: var(--spacing-sm);

    .game-container {
      height: 95vh;

      .top-bar {
        padding: var(--spacing-sm) var(--spacing-md);

        .game-stats {
          gap: var(--spacing-md);

          .stat-item {
            font-size: var(--text-sm);
          }
        }
      }

      .game-content {
        padding: var(--spacing-md);

        .fruits-container {
          grid-template-columns: repeat(3, 1fr);
          gap: var(--spacing-sm);

          .fruit-item {
            max-width: 100px;
          }
        }
      }

      .bottom-toolbar {
        gap: var(--spacing-sm);
        padding: var(--spacing-sm);

        .toolbar-label {
          display: none;
        }
      }
    }
  }
}
</style>




