<template>
  <MobileMainLayout
    title="测评进行中"
    :show-back="false"
    :show-footer="true"
    content-padding="var(--app-gap)"
  >
    <div class="mobile-assessment-doing">
      <!-- 进度条 -->
      <div class="progress-section">
        <van-progress
          :percentage="progressPercentage"
          stroke-width="6"
          color="var(--van-primary-color)"
          track-color="var(--van-gray-3)"
          :show-pivot="false"
        />
        <div class="progress-info">
          <span class="question-info">第 {{ currentIndex + 1 }} 题 / 共 {{ questions.length }} 题</span>
          <span class="percentage-info">已完成 {{ Math.round(progressPercentage) }}%</span>
        </div>
      </div>

      <!-- 题目内容 -->
      <div v-if="currentQuestion" class="question-section">
        <van-cell-group inset>
          <!-- 题目头部 -->
          <van-cell class="question-header">
            <template #title>
              <div class="question-title">
                <h2>{{ currentQuestion.title }}</h2>
                <van-tag
                  :type="getDimensionTagType(currentQuestion.dimension)"
                  size="small"
                >
                  {{ getDimensionName(currentQuestion.dimension) }}
                </van-tag>
              </div>
            </template>
          </van-cell>

          <!-- 语音播报控制 -->
          <van-cell
            v-if="currentQuestion.audioUrl"
            class="audio-control"
          >
            <template #default>
              <div class="audio-section">
                <audio
                  ref="audioPlayer"
                  :src="currentQuestion.audioUrl"
                  @ended="onAudioEnded"
                  @error="onAudioError"
                ></audio>
                <van-button
                  :type="audioPlaying ? 'warning' : 'primary'"
                  :icon="audioPlaying ? 'pause' : 'play-circle-o'"
                  round
                  size="large"
                  @click="toggleAudio"
                  class="audio-btn"
                />
                <div class="audio-info">
                  <span class="audio-hint">
                    {{ audioPlaying ? '播放中...' : '点击播放语音提示' }}
                  </span>
                  <van-button
                    v-if="!audioPlaying && hasPlayedOnce"
                    size="mini"
                    plain
                    @click="replayAudio"
                    class="replay-btn"
                  >
                    <van-icon name="replay" />
                    重播
                  </van-button>
                </div>
              </div>
            </template>
          </van-cell>

          <!-- 题目内容 -->
          <van-cell class="question-content">
            <template #default>
              <!-- 问答类型题目 -->
              <div v-if="currentQuestion.questionType === 'qa'" class="qa-content">
                <!-- 题目配图 -->
                <div
                  v-if="currentQuestion.imageUrl"
                  class="question-image"
                >
                  <van-image
                    :src="currentQuestion.imageUrl"
                    fit="contain"
                    class="question-img"
                    :preview-src-list="[currentQuestion.imageUrl]"
                  >
                    <template #error>
                      <div class="image-error">
                        <van-icon name="photo-fail" size="32" />
                        <span>图片加载失败</span>
                      </div>
                    </template>
                  </van-image>
                </div>

                <!-- 题目描述 -->
                <div
                  v-if="currentQuestion.content?.description"
                  class="question-description"
                >
                  <van-notice-bar
                    :text="currentQuestion.content.description"
                    color="#1989fa"
                    background="#ecf5ff"
                    left-icon="info-o"
                  />
                </div>

                <!-- 选择题选项 -->
                <div
                  v-if="currentQuestion.content?.options"
                  class="options-list"
                >
                  <van-radio-group
                    v-model="currentAnswer"
                    @change="handleAnswerChange"
                  >
                    <van-cell
                      v-for="(option, index) in currentQuestion.content.options"
                      :key="index"
                      clickable
                      :class="['option-item', { 'selected': currentAnswer === option.value }]"
                      @click="selectOption(option.value)"
                    >
                      <template #icon>
                        <van-radio :name="option.value" />
                      </template>
                      <template #title>
                        <span class="option-label">{{ option.label }}</span>
                      </template>
                    </van-cell>
                  </van-radio-group>
                </div>
              </div>

              <!-- 互动游戏类型题目 -->
              <div
                v-else-if="currentQuestion.questionType === 'game' || currentQuestion.questionType === 'interactive'"
                class="game-content"
              >
                <div class="game-placeholder">
                  <van-icon name="games-o" size="48" />
                  <p>互动游戏题目</p>
                  <p class="game-desc">{{ currentQuestion.description || '请完成互动游戏题目' }}</p>
                </div>
              </div>
            </template>
          </van-cell>
        </van-cell-group>
      </div>

      <!-- 加载状态 -->
      <div v-else class="loading-section">
        <van-loading size="24px" vertical>加载题目中...</van-loading>
      </div>

      <!-- 操作按钮 -->
      <div v-if="currentQuestion" class="action-section">
        <div class="action-buttons">
          <van-button
            v-if="currentIndex > 0"
            size="large"
            @click="previousQuestion"
            class="prev-btn"
          >
            <van-icon name="arrow-left" />
            上一题
          </van-button>

          <van-button
            type="primary"
            size="large"
            :disabled="!hasAnswer"
            :loading="submitting"
            @click="nextQuestion"
            class="next-btn"
          >
            {{ currentIndex === questions.length - 1 ? '完成测评' : '下一题' }}
            <van-icon name="arrow" />
          </van-button>
        </div>
      </div>
    </div>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Toast, Dialog } from 'vant'
import { assessmentApi } from '@/api/assessment'

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

// 计算属性
const currentQuestion = computed(() => questions.value[currentIndex.value])
const progressPercentage = computed(() => {
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
    Toast.loading({
      message: '加载题目中...',
      forbidClick: true,
      duration: 0
    })

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

    Toast.clear()
  } catch (error: any) {
    Toast.clear()
    Toast.fail(error.message || '加载题目失败')
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
    motor: 'primary',
    social: 'success'
  }
  return map[dimension] || ''
}

// 选择选项
const selectOption = (value: any) => {
  currentAnswer.value = value
  handleAnswerChange()
}

// 处理答案变化
const handleAnswerChange = () => {
  if (currentQuestion.value) {
    answers.value[currentQuestion.value.id] = currentAnswer.value
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
  Toast.fail('音频加载失败')
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

// 上一题
const previousQuestion = () => {
  if (currentIndex.value > 0) {
    stopAudio()
    currentIndex.value--
    currentAnswer.value = answers.value[currentQuestion.value.id] || null
  }
}

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
    await Dialog.confirm({
      title: '确认完成',
      message: '确定要完成测评吗？完成后将生成专业报告。',
      confirmButtonText: '完成测评',
      cancelButtonText: '继续答题',
      confirmButtonColor: 'var(--van-primary-color)'
    }).then(() => {
      completeAssessment()
    }).catch(() => {
      // 用户选择继续答题
    })
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
    Toast.loading({
      message: '正在提交答案...',
      forbidClick: true,
      duration: 0
    })

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
      Toast.clear()
      Toast.success('测评完成！正在生成报告...')
      // 等待一下让后端生成报告
      setTimeout(() => {
        router.push(`/mobile/parent-center/assessment/report/${recordId.value}`)
      }, 1500)
    } else {
      Toast.clear()
      Toast.fail(response.data?.message || '完成测评失败')
    }
  } catch (error: any) {
    Toast.clear()
    Toast.fail(error.message || '完成测评失败')
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
@import '@/styles/mobile-base.scss';

.mobile-assessment-doing {
  min-height: calc(100vh - var(--mobile-header-height) - var(--mobile-footer-height));
  background: var(--van-background-color-light);
  padding-bottom: var(--van-padding-xl);

  .progress-section {
    background: var(--card-bg);
    padding: var(--van-padding-md);
    margin-bottom: var(--van-padding-md);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    .progress-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: var(--van-padding-sm);

      .question-info {
        font-size: var(--text-sm);
        color: var(--van-text-color-2);
      }

      .percentage-info {
        font-size: var(--text-sm);
        color: var(--van-primary-color);
        font-weight: 600;
      }
    }
  }

  .question-section {
    margin-bottom: var(--van-padding-md);

    .question-header {
      .question-title {
        h2 {
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--van-text-color);
          margin: 0 0 var(--van-padding-sm) 0;
          line-height: 1.4;
        }
      }
    }

    .audio-control {
      .audio-section {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: var(--van-padding-md);
        padding: var(--van-padding-md);
        background: linear-gradient(135deg, var(--van-primary-color) 0%, #667eea 100%);
        border-radius: var(--van-radius-lg);
        margin: var(--van-padding-md) 0;

        audio {
          display: none;
        }

        .audio-btn {
          width: 60px;
          height: 60px;
          background: var(--card-bg);
          color: var(--van-primary-color);
          border: none;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

          .van-icon {
            font-size: var(--text-3xl);
          }
        }

        .audio-info {
          text-align: center;
          color: white;

          .audio-hint {
            font-size: var(--text-sm);
            font-weight: 500;
            display: block;
            margin-bottom: var(--van-padding-xs);
          }

          .replay-btn {
            color: white;
            border-color: rgba(255, 255, 255, 0.6);
            font-size: var(--text-xs);
            padding: 2px 8px;
            height: 24px;

            &:active {
              background: rgba(255, 255, 255, 0.1);
            }
          }
        }
      }
    }

    .question-content {
      padding: var(--van-padding-md);

      .qa-content {
        .question-image {
          margin-bottom: var(--van-padding-lg);
          text-align: center;

          .question-img {
            max-width: 100%;
            max-height: 200px;
            border-radius: var(--van-radius-md);
            overflow: hidden;
          }

          .image-error {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 120px;
            background: var(--van-gray-1);
            border-radius: var(--van-radius-md);
            color: var(--van-text-color-3);

            .van-icon {
              margin-bottom: var(--van-padding-xs);
            }

            span {
              font-size: var(--text-sm);
            }
          }
        }

        .question-description {
          margin-bottom: var(--van-padding-lg);
        }

        .options-list {
          .option-item {
            margin-bottom: var(--van-padding-sm);
            border: 1px solid var(--van-border-color);
            border-radius: var(--van-radius-md);
            transition: all 0.2s;

            &:last-child {
              margin-bottom: 0;
            }

            &.selected {
              border-color: var(--van-primary-color);
              background: var(--van-primary-color-light);
            }

            &:active {
              transform: scale(0.98);
            }

            .option-label {
              font-size: var(--text-base);
              line-height: 1.4;
            }
          }
        }
      }

      .game-content {
        .game-placeholder {
          text-align: center;
          padding: var(--van-padding-xl) var(--van-padding-md);
          color: var(--van-text-color-2);

          .van-icon {
            color: var(--van-primary-color);
            margin-bottom: var(--van-padding-md);
          }

          p {
            margin: var(--van-padding-sm) 0;
            font-size: var(--text-base);

            &.game-desc {
              font-size: var(--text-sm);
              color: var(--van-text-color-3);
            }
          }
        }
      }
    }
  }

  .loading-section {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    color: var(--van-text-color-2);
  }

  .action-section {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--card-bg);
    padding: var(--van-padding-md);
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
    z-index: 100;

    .action-buttons {
      display: flex;
      gap: var(--van-padding-md);

      .prev-btn,
      .next-btn {
        flex: 1;
        height: 44px;
        font-size: var(--text-base);
        border-radius: var(--van-radius-md);

        .van-icon {
          margin: 0 var(--van-padding-xs);
        }
      }

      .prev-btn {
        color: var(--van-text-color-2);
        border-color: var(--van-border-color);
      }

      .next-btn {
        background: linear-gradient(135deg, var(--van-primary-color) 0%, #667eea 100%);
        border: none;
        font-weight: 600;
      }
    }
  }
}

// 为固定底部按钮留出空间
.mobile-assessment-doing {
  padding-bottom: 80px;
}

// 响应式适配
@media (max-width: 375px) {
  .mobile-assessment-doing {
    .question-section {
      .question-content {
        .qa-content {
          .options-list {
            .option-item {
              .option-label {
                font-size: var(--text-sm);
              }
            }
          }
        }
      }
    }
  }
}

// 大屏幕适配
@media (min-width: 768px) {
  .mobile-assessment-doing {
    max-width: 768px;
    margin: 0 auto;

    .action-section {
      .action-buttons {
        max-width: 600px;
        margin: 0 auto;
      }
    }
  }
}
</style>