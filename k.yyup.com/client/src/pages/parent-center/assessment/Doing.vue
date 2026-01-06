<template>
  <div class="assessment-doing-page">
    <div class="container">
      <div class="header">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
        </div>
        <div class="progress-info">
          <span>第 {{ currentIndex + 1 }} 题 / 共 {{ questions.length }} 题</span>
          <span>已完成 {{ Math.round(progress) }}%</span>
        </div>
      </div>

      <div v-if="currentQuestion" class="question-container">
        <el-card class="question-card">
          <div class="question-header">
            <h2>{{ currentQuestion.title }}</h2>
            <el-tag :type="getDimensionTagType(currentQuestion.dimension)">
              {{ getDimensionName(currentQuestion.dimension) }}
            </el-tag>
          </div>

          <!-- 语音播报控制 -->
          <div v-if="currentQuestion.audioUrl" class="audio-control">
            <audio
              ref="audioPlayer"
              :src="currentQuestion.audioUrl"
              @ended="onAudioEnded"
              @error="onAudioError"
            ></audio>
            <el-button
              :type="audioPlaying ? 'warning' : 'primary'"
              :icon="audioPlaying ? 'VideoPause' : 'VideoPlay'"
              @click="toggleAudio"
              circle
              size="large"
              class="audio-btn"
            >
            </el-button>
            <span class="audio-hint">{{ audioPlaying ? '播放中...' : '点击播放语音提示' }}</span>
            <el-button
              v-if="!audioPlaying && hasPlayedOnce"
              @click="replayAudio"
              size="small"
              text
            >
              <UnifiedIcon name="Refresh" /> 重播
            </el-button>
          </div>

          <div class="question-content">
            <!-- 问答类型题目 -->
            <div v-if="currentQuestion.questionType === 'qa'" class="qa-content">
              <!-- 题目配图 -->
              <div v-if="currentQuestion.imageUrl" class="question-image">
                <el-image
                  :src="currentQuestion.imageUrl"
                  fit="contain"
                  class="max-width-full max-height-400"
                  :preview-src-list="[currentQuestion.imageUrl]"
                >
                  <template #error>
                    <div class="image-slot">
                      <UnifiedIcon name="default" />
                      <span>图片加载失败</span>
                    </div>
                  </template>
                </el-image>
              </div>
              
              <!-- 题目描述 -->
              <div v-if="currentQuestion.content.description" class="question-description">
                <el-alert :closable="false" type="info">
                  {{ currentQuestion.content.description }}
                </el-alert>
              </div>
              
              <div v-if="currentQuestion.content.options" class="options">
                <el-radio-group v-model="currentAnswer" @change="handleAnswerChange">
                  <el-radio
                    v-for="(option, index) in currentQuestion.content.options"
                    :key="index"
                    :label="option.value"
                    class="option-item"
                  >
                    {{ option.label }}
                  </el-radio>
                </el-radio-group>
              </div>
            </div>

            <!-- 互动游戏类型题目 -->
            <div v-else-if="currentQuestion.questionType === 'game' || currentQuestion.questionType === 'interactive'">
              <GameComponent
                :question="currentQuestion"
                :game-config="currentQuestion.gameConfig"
                @answer="handleGameAnswer"
              />
            </div>
          </div>

          <div class="question-actions">
            <el-button v-if="currentIndex > 0" @click="previousQuestion">上一题</el-button>
            <el-button
              type="primary"
              @click="nextQuestion"
              :disabled="!hasAnswer"
              :loading="submitting"
            >
              {{ currentIndex === questions.length - 1 ? '完成测评' : '下一题' }}
            </el-button>
          </div>
        </el-card>
      </div>

      <div v-else class="loading-container">
        <el-loading :loading="loadingQuestions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Picture, VideoPlay, VideoPause, Refresh } from '@element-plus/icons-vue'
import { assessmentApi } from '@/api/assessment'
import GameComponent from './components/GameComponent.vue'

const route = useRoute()
const router = useRouter()

const recordId = ref<number>(parseInt(route.params.recordId as string))
const questions = ref<any[]>([])
const currentIndex = ref(0)
const answers = ref<Record<number, any>>({})
const currentAnswer = ref<any>(null)
const submitting = ref(false)
const loadingQuestions = ref(true)

// 音频播放相关
const audioPlayer = ref<HTMLAudioElement | null>(null)
const audioPlaying = ref(false)
const hasPlayedOnce = ref(false)

const currentQuestion = computed(() => questions.value[currentIndex.value])
const progress = computed(() => {
  if (questions.value.length === 0) return 0
  return ((currentIndex.value + 1) / questions.value.length) * 100
})
const hasAnswer = computed(() => {
  if (!currentQuestion.value) return false
  return answers.value[currentQuestion.value.id] !== undefined
})

// 获取题目列表
const loadQuestions = async () => {
  try {
    loadingQuestions.value = true
    const record = await assessmentApi.getRecord(recordId.value)
    if (!record.data?.success) {
      throw new Error('获取测评记录失败')
    }

    const assessmentRecord = record.data.data
    const configId = assessmentRecord.configId
    const ageGroup = getAgeGroup(assessmentRecord.childAge)

    // 获取所有维度的题目
    const dimensions = ['attention', 'memory', 'logic', 'language', 'motor', 'social']
    const allQuestions: any[] = []

    for (const dimension of dimensions) {
      const response = await assessmentApi.getQuestions(configId, ageGroup, dimension)
      if (response.data?.success && response.data?.data) {
        // 解析题目数据，确保content和gameConfig正确解析
        const parsedQuestions = response.data.data.map((q: any) => {
          // 解析content（可能是JSON字符串）
          let content = q.content
          if (typeof content === 'string') {
            try {
              content = JSON.parse(content)
            } catch (e) {
              console.warn('解析content失败:', e)
            }
          }
          
          // 解析gameConfig（可能是JSON字符串）
          let gameConfig = q.gameConfig
          if (gameConfig && typeof gameConfig === 'string') {
            try {
              gameConfig = JSON.parse(gameConfig)
            } catch (e) {
              console.warn('解析gameConfig失败:', e)
            }
          }
          
          return {
            ...q,
            content,
            gameConfig
          }
        })
        
        allQuestions.push(...parsedQuestions)
      }
    }

    // 按sortOrder排序
    questions.value = allQuestions.sort((a, b) => a.sortOrder - b.sortOrder)
    
    // 初始化当前答案
    if (questions.value.length > 0) {
      currentAnswer.value = answers.value[currentQuestion.value.id] || null
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载题目失败')
    router.back()
  } finally {
    loadingQuestions.value = false
  }
}

// 获取年龄段
const getAgeGroup = (ageInMonths: number): string => {
  if (ageInMonths >= 24 && ageInMonths < 36) return '24-36'
  if (ageInMonths >= 36 && ageInMonths < 48) return '36-48'
  if (ageInMonths >= 48 && ageInMonths < 60) return '48-60'
  if (ageInMonths >= 60 && ageInMonths <= 72) return '60-72'
  return '24-36'
}

// 获取维度名称
const getDimensionName = (dimension: string): string => {
  const map: Record<string, string> = {
    attention: '专注力',
    memory: '记忆力',
    logic: '逻辑思维',
    language: '语言能力',
    motor: '精细动作',
    social: '社交能力'
  }
  return map[dimension] || dimension
}

// 获取维度标签类型
const getDimensionTagType = (dimension: string): string => {
  const map: Record<string, string> = {
    attention: 'success',
    memory: 'warning',
    logic: 'danger',
    language: 'info',
    motor: '',
    social: 'success'
  }
  return map[dimension] || ''
}

// 处理答案变化
const handleAnswerChange = () => {
  if (currentQuestion.value) {
    answers.value[currentQuestion.value.id] = currentAnswer.value
  }
}

// 处理游戏答案
const handleGameAnswer = (answer: any) => {
  if (currentQuestion.value) {
    answers.value[currentQuestion.value.id] = answer
    currentAnswer.value = answer
  }
}

// 上一题
const previousQuestion = () => {
  if (currentIndex.value > 0) {
    stopAudio()
    currentIndex.value--
    currentAnswer.value = answers.value[currentQuestion.value.id] || null
  }
}

// 音频播放控制
const toggleAudio = () => {
  if (!audioPlayer.value) return
  
  if (audioPlaying.value) {
    audioPlayer.value.pause()
    audioPlaying.value = false
  } else {
    audioPlayer.value.play()
    audioPlaying.value = true
    hasPlayedOnce.value = true
  }
}

const replayAudio = () => {
  if (!audioPlayer.value) return
  audioPlayer.value.currentTime = 0
  audioPlayer.value.play()
  audioPlaying.value = true
}

const onAudioEnded = () => {
  audioPlaying.value = false
}

const onAudioError = (e: Event) => {
  console.error('音频加载失败:', e)
  audioPlaying.value = false
}

const stopAudio = () => {
  if (audioPlayer.value) {
    audioPlayer.value.pause()
    audioPlayer.value.currentTime = 0
    audioPlaying.value = false
  }
}

// 监听题目切换，自动播放音频
watch(currentQuestion, async (newQuestion) => {
  if (newQuestion?.audioUrl) {
    stopAudio()
    hasPlayedOnce.value = false
    
    // 等待DOM更新后自动播放
    await nextTick()
    setTimeout(() => {
      if (audioPlayer.value) {
        audioPlayer.value.play().catch(() => {
          // 自动播放失败（浏览器限制），需要用户手动点击
          console.log('自动播放被阻止，请手动点击播放按钮')
        })
        audioPlaying.value = true
        hasPlayedOnce.value = true
      }
    }, 300)
  }
})

// 下一题
const nextQuestion = async () => {
  if (!currentQuestion.value) return

  // 停止当前音频
  stopAudio()

  // 保存当前答案
  if (currentAnswer.value !== null) {
    answers.value[currentQuestion.value.id] = currentAnswer.value
  }

  // 如果是最后一题，完成测评
  if (currentIndex.value === questions.value.length - 1) {
    await completeAssessment()
    return
  }

  // 移动到下一题
  currentIndex.value++
  currentAnswer.value = answers.value[currentQuestion.value.id] || null
}

// 完成测评
const completeAssessment = async () => {
  try {
    submitting.value = true

    // 提交所有答案
    for (const [questionId, answer] of Object.entries(answers.value)) {
      await assessmentApi.submitAnswer({
        recordId: recordId.value,
        questionId: parseInt(questionId),
        answer: answer
      })
    }

    // 完成测评
    const response = await assessmentApi.completeAssessment(recordId.value)
    if (response.data?.success) {
      ElMessage.success('测评完成！正在生成报告...')
      // 等待一下让后端生成报告
      setTimeout(() => {
        router.push(`/parent-center/assessment/report/${recordId.value}`)
      }, 1000)
    } else {
      ElMessage.error(response.data?.message || '完成测评失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '完成测评失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadQuestions()
})

// 组件卸载时停止音频
onBeforeUnmount(() => {
  stopAudio()
})
</script>

<style scoped lang="scss">
.assessment-doing-page {
  // 工具类
  .max-width-full {
    max-width: 100%;
  }
  .max-height-400 {
    max-height: var(--spacing-4xl);
  }
  min-height: 100vh;
  background: var(--bg-hover);
  padding: var(--spacing-2xl);

  .container {
    max-max-width: var(--container-lg);
    margin: 0 auto;

    .header {
      background: var(--bg-card);
      border-radius: var(--radius-md);
      padding: var(--spacing-lg);
      margin-bottom: var(--spacing-lg);

      .progress-bar {
        width: 100%;
        height: var(--spacing-sm);
        background: var(--border-color);
        border-radius: var(--radius-md);
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        margin-bottom: var(--spacing-md);

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary-color) 0%, var(--primary-color) 100%);
          transition: width 0.3s;
        }
      }

      .progress-info {
        display: flex;
        justify-content: space-between;
        font-size: var(--text-sm);
        color: var(--text-secondary);
      }
    }

    .question-container {
      .question-card {
        .audio-control {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-md);
          padding: var(--spacing-lg);
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
          border-radius: var(--radius-md);
          margin-bottom: var(--spacing-lg);

          audio {
            display: none;
          }

          .audio-btn {
            width: 40px;
            height: var(--spacing-xl);
            box-shadow: 0 2px 8px var(--glow-primary);

            &:hover {
              transform: scale(1.05);
            }
          }

          .audio-hint {
            color: var(--text-on-primary);
            font-size: var(--text-base);
            font-weight: 500;
          }

          .el-button--text {
            color: var(--text-on-primary);
            &:hover {
              color: var(--warning-color);
            }
          }
        }
        
        .question-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-lg);

          h2 {
            margin: 0;
            font-size: var(--text-lg);
            color: var(--text-primary);
          }
        }

        .question-content {
          min-height: var(--spacing-3xl);
          padding: var(--spacing-lg) 0;

          .qa-content {
            .question-image {
              margin-bottom: var(--spacing-lg);
              text-align: center;

              .image-slot {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: var(--spacing-2xl);
                background: var(--bg-hover);
                border-radius: var(--radius-md);

                .el-icon {
                  font-size: var(--text-xl);
                  color: var(--text-secondary);
                  margin-bottom: var(--spacing-md);
                }

                span {
                  color: var(--text-secondary);
                  font-size: var(--text-base);
                }
              }
            }

            .question-description {
              margin-bottom: var(--spacing-lg);
            }

            .options {
              .option-item {
                display: block;
                margin-bottom: var(--spacing-lg);
                padding: var(--spacing-lg);
                border: var(--border-width-base, 1px) solid var(--border-color);
                border-radius: var(--radius-md);
                cursor: pointer;
                transition: all 0.3s;

                &:hover {
                  border-color: var(--primary-color);
                  background: var(--accent-marketing-light);
                }
              }
            }
          }
        }

        .question-actions {
          display: flex;
          justify-content: space-between;
          margin-top: var(--spacing-xl);
          padding-top: var(--spacing-lg);
          border-top: var(--border-width-base, 1px) solid var(--border-color);
        }
      }
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: var(--spacing-4xl);
    }
  }
}
</style>

