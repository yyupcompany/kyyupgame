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
.fruit-sequence-game {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--warning-light-bg) 0%, var(--warning-color) 50%, var(--success-light-bg) 100%);
  display: flex;
  align-items: center;
  justify-content: center;

  .game-container {
    width: 95%;
    max-width: 100%; max-width: 1200px;
    height: 90vh;
    background: var(--bg-color);
    border-radius: var(--text-3xl);
    box-shadow: var(--shadow-xl);
    display: flex;
    flex-direction: column;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;

    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--text-2xl) 30px;
      background: linear-gradient(135deg, var(--warning-light-bg) 0%, var(--warning-color) 100%);
      border-bottom: var(--spacing-xs) solid var(--warning-color-transparent);

      .left-controls {
        display: flex;
        gap: var(--text-sm);
      }

      .game-stats {
        display: flex;
        gap: var(--text-3xl);
        align-items: center;

        .stat-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-size: var(--text-2xl);
          font-weight: bold;
          color: var(--warning-color);

          &.lives {
            font-size: var(--text-3xl);
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
      padding: var(--spacing-10xl);
      position: relative;

      .fruits-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: var(--text-3xl);
        max-width: 100%; max-width: 900px;
        margin-bottom: var(--spacing-10xl);

        .fruit-item {
          position: relative;
          max-width: 150px; width: 100%;
          min-height: 60px; height: auto;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

          img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            filter: drop-shadow(var(--shadow-sm));
            transition: all 0.3s;
          }

          .fruit-glow {
            position: absolute;
            inset: -10px;
            border-radius: 50%;
            opacity: 0;
            transition: opacity 0.3s;
          }

          &:hover {
            transform: scale(1.1);

            img {
              filter: drop-shadow(var(--shadow-md));
            }
          }

          &.active {
            transform: scale(1.3);
            z-index: var(--z-index-sticky);

            .fruit-glow {
              opacity: 1;
              background: radial-gradient(circle, var(--warning-color-transparent) 0%, transparent 70%);
              animation: glow-pulse 0.8s ease-in-out;
            }

            img {
              filter: drop-shadow(0 0 var(--text-2xl) var(--warning-glow));
            }
          }

          &.selected {
            opacity: 0.6;
          }

          &.correct {
            animation: correct-bounce 0.5s ease;

            .fruit-glow {
              opacity: 1;
              background: radial-gradient(circle, var(--success-color-transparent) 0%, transparent 70%);
            }
          }

          &.wrong {
            animation: wrong-shake 0.5s ease;

            .fruit-glow {
              opacity: 1;
              background: radial-gradient(circle, var(--danger-color-transparent) 0%, transparent 70%);
            }
          }
        }
      }

      .game-status {
        text-align: center;

        .status-text {
          h2 {
            font-size: var(--spacing-3xl);
            color: var(--warning-color);
            margin: 0 0 var(--text-lg) 0;
          }

          p {
            font-size: var(--text-xl);
            color: var(--text-regular);
            margin: var(--spacing-sm) 0;
          }

          .sequence-display, .progress-display {
            font-size: var(--text-3xl);
            color: var(--text-primary);

            .highlight {
              font-size: var(--text-4xl);
              font-weight: bold;
              color: var(--warning-color);
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
      gap: var(--text-3xl);
      padding: var(--text-2xl);
      background: var(--warning-light-bg);
      border-top: var(--transform-drop) solid var(--warning-color-transparent);

      .toolbar-label {
        font-size: var(--text-base);
        font-weight: 500;
        color: var(--text-primary);
        margin-right: var(--text-lg);
      }
      
      :deep(.el-button.is-circle) {
        width: auto;
        min-height: 32px; height: auto;
        font-size: var(--text-2xl);
      }
    }
  }
}

.help-content {
  h2 {
    color: var(--primary-color);
    font-size: var(--text-3xl);
    margin: 0 0 var(--spacing-sm) 0;
  }

  .game-intro {
    font-size: var(--text-lg);
    color: var(--text-regular);
    margin-bottom: var(--text-3xl);
    padding: var(--text-sm);
    background: var(--bg-hover);
    border-radius: var(--spacing-sm);
  }

  .help-section {
    margin-bottom: var(--text-3xl);

    h3 {
      font-size: var(--text-xl);
      color: var(--text-primary);
      margin: 0 0 var(--text-sm) 0;
      padding-bottom: var(--spacing-sm);
      border-bottom: var(--transform-drop) solid var(--border-color);
    }

    ol, ul {
      margin: 0;
      padding-left: var(--text-3xl);

      li {
        margin-bottom: var(--spacing-sm);
        line-height: 1.6;
        color: var(--text-regular);

        strong {
          color: var(--primary-color);
        }
      }
    }

    .tip {
      margin-top: var(--text-sm);
      padding: var(--spacing-sm) var(--text-sm);
      background: var(--warning-light-bg);
      border-left: var(--spacing-xs) solid var(--warning-color);
      color: var(--warning-color);
      font-size: var(--text-base);
      border-radius: var(--spacing-xs);
    }

    &.tips {
      background: var(--info-light-bg);
      padding: var(--text-lg);
      border-radius: var(--spacing-sm);
      border: var(--spacing-xs) solid var(--info-color);

      h3 {
        color: var(--text-secondary);
        border-bottom-color: var(--info-color);
      }

      ul li {
        color: var(--text-primary);
      }
    }
  }
}

.settings-panel {
  .setting-item {
    margin-bottom: var(--text-3xl);

    label {
      display: block;
      margin-bottom: var(--text-sm);
      font-size: var(--text-lg);
      font-weight: 500;
      color: var(--text-primary);
    }
  }
}

.results-content {
  text-align: center;

  .stars {
    display: flex;
    justify-content: center;
    gap: var(--text-lg);
    margin-bottom: var(--spacing-3xl);

    .star {
      font-size: 64px;
      opacity: 0.3;
      transition: all 0.3s;

      &.active {
        opacity: 1;
        animation: star-pop 0.5s ease;
      }
    }
  }

  .result-stats {
    display: flex;
    justify-content: space-around;
    margin-bottom: var(--spacing-3xl);

    .stat {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);

      .label {
        font-size: var(--text-base);
        color: var(--text-secondary);
      }

      .value {
        font-size: var(--spacing-3xl);
        font-weight: bold;
        color: var(--warning-color);
      }
    }
  }

  .result-actions {
    display: flex;
    justify-content: center;
    gap: var(--text-lg);
  }
}

@keyframes glow-pulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.2); opacity: 1; }
}

@keyframes correct-bounce {
  0% { transform: scale(1); }
  50% { transform: scale(1.3) rotate(15deg); }
  100% { transform: scale(1) rotate(0deg); }
}

@keyframes wrong-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(var(--position-negative-2xl)); }
  75% { transform: translateX(var(--z-index-sticky)); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

@keyframes success-bounce {
  0% { transform: scale(0.5); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes star-pop {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.3) rotate(180deg); }
  100% { transform: scale(1) rotate(360deg); opacity: 1; }
}
/* 响应式对话框样式 */
.responsive-dialog {
  @media (max-width: var(--breakpoint-md)) {
    width: 95% !important;
    max-width: none !important;
    margin: 0 auto !important;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    &.dialog-large { width: 85% !important; max-width: 100%; max-width: 100%; max-width: 500px !important; }
    &.dialog-medium { width: 80% !important; max-width: 100%; max-width: 450px !important; }
    &.dialog-small { width: 75% !important; max-width: 100%; max-width: 380px !important; }
  }

  @media (min-width: 1025px) {
    &.dialog-large { width: 100%; max-width: 600px !important; }
    &.dialog-medium { width: 500px !important; }
    &.dialog-small { width: 100%; max-width: 400px !important; }
  }
}
</style>




