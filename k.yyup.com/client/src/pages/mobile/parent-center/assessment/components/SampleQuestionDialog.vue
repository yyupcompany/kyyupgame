<template>
  <van-popup
    v-model:show="dialogVisible"
    position="bottom"
    :style="{ height: '80%' }"
    round
  >
    <div class="sample-dialog">
      <!-- 头部 -->
      <div class="dialog-header">
        <van-nav-bar
          :title="title"
          left-text="关闭"
          @click-left="handleClose"
        />
      </div>

      <!-- 内容 -->
      <div class="dialog-content">
        <!-- 学科测评样题 -->
        <div v-if="type === 'academic' && subject" class="sample-content">
          <!-- 语文样题 -->
          <div v-if="subject === 'chinese'" class="sample-item">
            <h4>语文样题</h4>
            <div class="sample-question">
              <p class="question-text">请选择下列词语的正确读音：</p>
              <van-radio-group v-model="selectedOption">
                <van-radio name="option1" class="sample-option">
                  学习 (xué xí)
                </van-radio>
                <van-radio name="option2" class="sample-option">
                  学习 (xué xi)
                </van-radio>
                <van-radio name="option3" class="sample-option">
                  学习 (xuè xí)
                </van-radio>
                <van-radio name="option4" class="sample-option">
                  学习 (xuě xi)
                </van-radio>
              </van-radio-group>
            </div>

            <van-button type="primary" block @click="showAnswer" class="submit-btn">
              查看答案
            </van-button>

            <van-collapse v-model="showCorrectAnswer" class="answer-collapse">
              <van-collapse-item title="正确答案" name="answer">
                <div class="correct-answer">
                  <p><strong>正确答案：</strong>学习 (xué xí)</p>
                  <p><strong>解析：</strong>"学"字读音为xué（二声），"习"字读音为xí（二声）。</p>
                </div>
              </van-collapse-item>
            </van-collapse>
          </div>

          <!-- 数学家题 -->
          <div v-else-if="subject === 'math'" class="sample-item">
            <h4>数学样题</h4>
            <div class="sample-question">
              <p class="question-text">计算：25 + 37 = ?</p>
              <van-radio-group v-model="selectedOption">
                <van-radio name="option1" class="sample-option">
                  52
                </van-radio>
                <van-radio name="option2" class="sample-option">
                  62
                </van-radio>
                <van-radio name="option3" class="sample-option">
                  72
                </van-radio>
                <van-radio name="option4" class="sample-option">
                  42
                </van-radio>
              </van-radio-group>
            </div>

            <van-button type="primary" block @click="showAnswer" class="submit-btn">
              查看答案
            </van-button>

            <van-collapse v-model="showCorrectAnswer" class="answer-collapse">
              <van-collapse-item title="正确答案" name="answer">
                <div class="correct-answer">
                  <p><strong>正确答案：</strong>62</p>
                  <p><strong>解析：</strong>25 + 37 = 62，个位5+7=12（进1），十位2+3+1=6。</p>
                </div>
              </van-collapse-item>
            </van-collapse>
          </div>

          <!-- 英语样题 -->
          <div v-else-if="subject === 'english'" class="sample-item">
            <h4>英语样题</h4>
            <div class="sample-question">
              <p class="question-text">What color is the sky?</p>
              <van-radio-group v-model="selectedOption">
                <van-radio name="option1" class="sample-option">
                  Red
                </van-radio>
                <van-radio name="option2" class="sample-option">
                  Blue
                </van-radio>
                <van-radio name="option3" class="sample-option">
                  Green
                </van-radio>
                <van-radio name="option4" class="sample-option">
                  Yellow
                </van-radio>
              </van-radio-group>
            </div>

            <van-button type="primary" block @click="showAnswer" class="submit-btn">
              查看答案
            </van-button>

            <van-collapse v-model="showCorrectAnswer" class="answer-collapse">
              <van-collapse-item title="正确答案" name="answer">
                <div class="correct-answer">
                  <p><strong>正确答案：</strong>Blue</p>
                  <p><strong>解析：</strong>天空是蓝色的，英文为"Blue"。</p>
                </div>
              </van-collapse-item>
            </van-collapse>
          </div>
        </div>

        <!-- 幼小衔接样题 -->
        <div v-else-if="type === 'school-readiness'" class="sample-content">
          <div class="sample-item">
            <h4>样题1：注意力测试</h4>
            <div class="sample-question">
              <p class="question-text">请找出下列数字中不同的一个：</p>
              <div class="number-grid">
                <span class="number-item">2</span>
                <span class="number-item">4</span>
                <span class="number-item">6</span>
                <span class="number-item">9</span>
                <span class="number-item">8</span>
              </div>
              <van-radio-group v-model="selectedOption" class="options-list">
                <van-radio name="option1" class="sample-option">
                  2
                </van-radio>
                <van-radio name="option2" class="sample-option">
                  9
                </van-radio>
                <van-radio name="option3" class="sample-option">
                  6
                </van-radio>
                <van-radio name="option4" class="sample-option">
                  8
                </van-radio>
              </van-radio-group>
            </div>

            <van-button type="primary" block @click="showAnswer" class="submit-btn">
              查看答案
            </van-button>

            <van-collapse v-model="showCorrectAnswer" class="answer-collapse">
              <van-collapse-item title="正确答案" name="answer">
                <div class="correct-answer">
                  <p><strong>正确答案：</strong>9</p>
                  <p><strong>解析：</strong>其他数字都是偶数（2、4、6、8），只有9是奇数。</p>
                </div>
              </van-collapse-item>
            </van-collapse>
          </div>

          <div class="sample-item">
            <h4>样题2：逻辑思维测试</h4>
            <div class="sample-question">
              <p class="question-text">请接着画图：</p>
              <div class="pattern-sequence">
                <div class="pattern-item">
                  <span class="pattern-circle"></span>
                  <span class="pattern-circle"></span>
                </div>
                <div class="pattern-item">
                  <span class="pattern-circle"></span>
                  <span class="pattern-circle"></span>
                  <span class="pattern-circle"></span>
                </div>
                <div class="pattern-item">
                  <span class="pattern-circle"></span>
                  <span class="pattern-circle"></span>
                  <span class="pattern-circle"></span>
                  <span class="pattern-circle"></span>
                </div>
                <div class="pattern-item question">
                  <span>?</span>
                </div>
              </div>
              <van-radio-group v-model="selectedOption2" class="options-list">
                <van-radio name="option1" class="sample-option">
                  5个圆
                </van-radio>
                <van-radio name="option2" class="sample-option">
                  2个圆
                </van-radio>
                <van-radio name="option3" class="sample-option">
                  3个圆
                </van-radio>
                <van-radio name="option4" class="sample-option">
                  6个圆
                </van-radio>
              </van-radio-group>
            </div>

            <van-button type="primary" block @click="showAnswer2" class="submit-btn">
              查看答案
            </van-button>

            <van-collapse v-model="showCorrectAnswer2" class="answer-collapse">
              <van-collapse-item title="正确答案" name="answer">
                <div class="correct-answer">
                  <p><strong>正确答案：</strong>5个圆</p>
                  <p><strong>解析：</strong>规律是每次增加1个圆：2个→3个→4个→5个。</p>
                </div>
              </van-collapse-item>
            </van-collapse>
          </div>
        </div>

        <!-- 发展评估样题 -->
        <div v-else-if="type === 'development'" class="sample-content">
          <div class="sample-item">
            <h4>样题：社交能力评估</h4>
            <div class="sample-question">
              <p class="question-text">当看到其他小朋友在玩游戏时，孩子通常会：</p>
              <van-radio-group v-model="selectedOption" class="options-list">
                <van-radio name="option1" class="sample-option">
                  站在旁边观看，不主动参与
                </van-radio>
                <van-radio name="option2" class="sample-option">
                  主动询问是否可以一起玩
                </van-radio>
                <van-radio name="option3" class="sample-option">
                  直接抢玩具或推搡
                </van-radio>
                <van-radio name="option4" class="sample-option">
                  跑开去找其他事情做
                </van-radio>
              </van-radio-group>
            </div>

            <van-button type="primary" block @click="showAnswer" class="submit-btn">
              查看答案
            </van-button>

            <van-collapse v-model="showCorrectAnswer" class="answer-collapse">
              <van-collapse-item title="正确答案" name="answer">
                <div class="correct-answer">
                  <p><strong>最佳选项：</strong>主动询问是否可以一起玩</p>
                  <p><strong>解析：</strong>这反映了良好的社交能力和沟通技巧，是孩子社交发展的重要指标。</p>
                </div>
              </van-collapse-item>
            </van-collapse>
          </div>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  modelValue: boolean
  type?: 'academic' | 'school-readiness' | 'development'
  subject?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// 响应式数据
const selectedOption = ref('')
const selectedOption2 = ref('')
const showCorrectAnswer = ref([])
const showCorrectAnswer2 = ref([])

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const title = computed(() => {
  if (props.type === 'academic') {
    return '学科测评样题展示'
  } else if (props.type === 'school-readiness') {
    return '幼小衔接测评样题展示'
  } else if (props.type === 'development') {
    return '发展评估样题展示'
  }
  return '样题展示'
})

// 监听弹窗打开状态，重置选项
watch(() => props.modelValue, (visible) => {
  if (visible) {
    selectedOption.value = ''
    selectedOption2.value = ''
    showCorrectAnswer.value = []
    showCorrectAnswer2.value = []
  }
})

// 方法
const handleClose = () => {
  emit('update:modelValue', false)
}

const showAnswer = () => {
  if (!selectedOption.value) {
    return
  }
  showCorrectAnswer.value = ['answer']
}

const showAnswer2 = () => {
  if (!selectedOption2.value) {
    return
  }
  showCorrectAnswer2.value = ['answer']
}
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

.sample-dialog {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f7f8fa;

  .dialog-header {
    flex-shrink: 0;
  }

  .dialog-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-md);
  }

  .sample-content {
    .sample-item {
      background: white;
      border-radius: 8px;
      padding: var(--spacing-md);
      margin-bottom: 16px;

      h4 {
        font-size: var(--text-lg);
        font-weight: 600;
        color: var(--van-text-primary);
        margin-bottom: 16px;
      }

      .sample-question {
        .question-text {
          font-size: var(--text-base);
          color: var(--van-text-primary);
          margin-bottom: 16px;
          line-height: 1.6;
        }

        .sample-option {
          padding: var(--spacing-md) 0;
          display: block;
        }

        .number-grid {
          display: flex;
          gap: var(--spacing-md);
          margin: var(--spacing-md) 0;
          padding: var(--spacing-md);
          background: #f7f8fa;
          border-radius: 8px;

          .number-item {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            background: white;
            border-radius: 50%;
            font-size: var(--text-lg);
            font-weight: 600;
            color: var(--van-primary-color);
          }
        }

        .pattern-sequence {
          display: flex;
          align-items: center;
          justify-content: space-around;
          margin: var(--spacing-md) 0;
          padding: var(--spacing-md);
          background: #f7f8fa;
          border-radius: 8px;

          .pattern-item {
            display: flex;
            gap: var(--spacing-xs);

            &.question {
              width: 60px;
              height: 60px;
              border: 2px dashed var(--van-primary-color);
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: var(--text-2xl);
              color: var(--van-primary-color);
            }

            .pattern-circle {
              width: 12px;
              height: 12px;
              background: var(--van-primary-color);
              border-radius: 50%;
            }
          }
        }

        .options-list {
          margin-top: 12px;
        }
      }

      .submit-btn {
        margin-top: 16px;
      }

      .answer-collapse {
        margin-top: 16px;

        .correct-answer {
          padding: var(--spacing-md);
          background: #f0f9ff;
          border-radius: 8px;
          line-height: 1.8;

          p {
            margin: var(--spacing-xs) 0;

            strong {
              color: var(--van-primary-color);
            }
          }
        }
      }
    }
  }
}
</style>
