<template>
  <MobileSubPageLayout title="AI 创建课程" back-path="/mobile/teacher-center">
    <div class="ai-create-container">
      <!-- 欢迎引导 -->
      <div v-if="currentStep === 0" class="welcome-section">
        <div class="welcome-content">
          <div class="welcome-icon">🎓</div>
          <h2>AI 课程生成器</h2>
          <p>只需简单描述你想要的课程，AI 将为你生成完整的互动教学内容</p>

          <!-- 快速开始步骤 -->
          <div class="steps-container">
            <div class="step-item" v-for="(step, index) in steps" :key="index">
              <div class="step-number">{{ index + 1 }}</div>
              <div class="step-content">
                <h4>{{ step.title }}</h4>
                <p>{{ step.description }}</p>
              </div>
            </div>
          </div>

          <!-- 示例提示 -->
          <div class="examples-section">
            <h4>💡 示例模板</h4>
            <div class="example-list">
              <div
                v-for="example in examples"
                :key="example.id"
                class="example-item"
                @click="selectExample(example)"
              >
                <div class="example-icon">{{ example.icon }}</div>
                <div class="example-info">
                  <div class="example-title">{{ example.title }}</div>
                  <div class="example-desc">{{ example.description }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 开始按钮 -->
          <van-button
            type="primary"
            size="large"
            block
            @click="nextStep"
            class="start-btn"
          >
            开始创建课程
          </van-button>
        </div>
      </div>

      <!-- 课程需求表单 -->
      <div v-else-if="currentStep === 1" class="form-section">
        <div class="step-header">
          <van-steps :active="1" direction="horizontal">
            <van-step>开始</van-step>
            <van-step>描述需求</van-step>
            <van-step>AI生成</van-step>
            <van-step>完成</van-step>
          </van-steps>
        </div>

        <div class="form-content">
          <!-- 课程基本信息 -->
          <van-cell-group inset>
            <van-field
              v-model="formData.name"
              name="name"
              label="课程名称"
              placeholder="给你的课程起个名字"
              :rules="[{ required: true, message: '请输入课程名称' }]"
            />

            <van-field
              v-model="formData.description"
              name="description"
              label="详细描述"
              placeholder="详细描述课程内容、教学目标等"
              type="textarea"
              rows="4"
              maxlength="500"
              show-word-limit
            />
          </van-cell-group>

          <!-- 教学设置 -->
          <van-cell-group inset title="教学设置">
            <van-field
              name="ageGroup"
              label="年龄段"
              placeholder="选择适合的年龄段"
              readonly
              is-link
              @click="showAgeGroupPicker = true"
              :value="ageGroupText"
            />

            <van-field
              name="domain"
              label="课程领域"
              placeholder="选择课程所属领域"
              readonly
              is-link
              @click="showDomainPicker = true"
              :value="domainText"
            />

            <van-field
              name="duration"
              label="课程时长"
              placeholder="预计课程时长"
              readonly
              is-link
              @click="showDurationPicker = true"
              :value="durationText"
            />

            <van-field
              v-model="formData.objectives"
              name="objectives"
              label="教学目标"
              placeholder="输入教学目标，多个用逗号分隔"
            />

            <van-field
              v-model="formData.keywords"
              name="keywords"
              label="关键词"
              placeholder="输入关键词，帮助AI更好地生成"
            />
          </van-cell-group>

          <!-- 高级设置 -->
          <van-cell-group inset title="高级设置">
            <van-field name="template" label="使用模板">
              <template #input>
                <van-radio-group v-model="formData.useTemplate" direction="horizontal">
                  <van-radio name="yes">是</van-radio>
                  <van-radio name="no">否</van-radio>
                </van-radio-group>
              </template>
            </van-field>

            <van-field
              v-model="formData.specialRequirements"
              name="specialRequirements"
              label="特殊要求"
              placeholder="如有特殊需求请在此说明"
              type="textarea"
              rows="2"
            />
          </van-cell-group>

          <!-- AI 助手对话 -->
          <van-cell-group inset title="AI 助手">
            <div class="ai-assistant">
              <div class="messages">
                <div
                  v-for="(message, index) in aiMessages"
                  :key="index"
                  :class="['message', message.role]"
                >
                  <div class="message-avatar">
                    <van-icon v-if="message.role === 'user'" name="contact" />
                    <van-icon v-else name="chat-o" />
                  </div>
                  <div class="message-content">
                    <div class="message-text">{{ message.content }}</div>
                    <div class="message-time">{{ message.time }}</div>
                  </div>
                </div>
              </div>

              <div class="ai-input">
                <van-field
                  v-model="aiInput"
                  placeholder="向AI助手提问..."
                  @keyup.enter="sendToAI"
                >
                  <template #button>
                    <van-button size="small" type="primary" @click="sendToAI">
                      发送
                    </van-button>
                  </template>
                </van-field>
              </div>
            </div>
          </van-cell-group>
        </div>

        <!-- 底部操作栏 -->
        <div class="form-actions">
          <van-button @click="prevStep">上一步</van-button>
          <van-button
            type="primary"
            :loading="isGenerating"
            @click="generateCourse"
            :disabled="!canGenerate"
          >
            {{ isGenerating ? '生成中...' : '开始生成' }}
          </van-button>
        </div>
      </div>

      <!-- AI 生成进度 -->
      <div v-else-if="currentStep === 2" class="generating-section">
        <div class="generating-content">
          <div class="ai-status">
            <div class="ai-avatar">
              <van-icon name="chat-o" size="48" />
            </div>
            <h3>AI 正在生成课程</h3>
            <p>{{ generationStatus }}</p>
          </div>

          <!-- 生成进度 -->
          <div class="progress-section">
            <van-circle
              :rate="generationProgress"
              :speed="100"
              :text="generationProgress + '%'"
              layer-color="#ebedf0"
              color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            />
          </div>

          <!-- 生成步骤 -->
          <div class="generation-steps">
            <div
              v-for="(step, index) in generationSteps"
              :key="index"
              :class="['generation-step', { active: index <= currentGenerationStep }]"
            >
              <div class="step-icon">
                <van-icon v-if="step.completed" name="success" color="#07c160" />
                <van-loading v-else-if="step.active" size="16" />
                <van-icon v-else name="circle" />
              </div>
              <div class="step-info">
                <div class="step-title">{{ step.title }}</div>
                <div class="step-desc">{{ step.description }}</div>
              </div>
            </div>
          </div>

          <!-- AI 思考过程 -->
          <div v-if="aiThinking" class="ai-thinking">
            <div class="thinking-header">
              <van-icon name="light" />
              <span>AI 思考过程</span>
            </div>
            <div class="thinking-content">{{ aiThinking }}</div>
          </div>

          <!-- 取消按钮 -->
          <van-button
            v-if="!generationComplete"
            type="default"
            block
            @click="cancelGeneration"
            class="cancel-btn"
          >
            取消生成
          </van-button>
        </div>
      </div>

      <!-- 生成完成 -->
      <div v-else-if="currentStep === 3" class="complete-section">
        <div class="complete-content">
          <div class="success-icon">
            <van-icon name="success" size="64" color="#07c160" />
          </div>
          <h3>课程生成完成！</h3>
          <p>{{ generatedCourse?.name }} 已成功生成</p>

          <!-- 预览卡片 -->
          <div class="preview-card">
            <div class="preview-thumbnail">
              <van-image
                :src="generatedCourse?.thumbnail"
                width="100%"
                height="120"
                fit="cover"
              />
            </div>
            <div class="preview-info">
              <h4>{{ generatedCourse?.name }}</h4>
              <p>{{ generatedCourse?.description }}</p>
              <div class="preview-tags">
                <van-tag type="primary" size="small">AI生成</van-tag>
                <van-tag type="success" size="small">{{ domainText }}</van-tag>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="complete-actions">
            <van-button
              type="primary"
              size="large"
              block
              @click="previewCourse"
              icon="eye-o"
            >
              预览课程
            </van-button>
            <van-button
              type="success"
              size="large"
              block
              @click="startLesson"
              icon="play"
            >
              一键上课
            </van-button>
            <van-button
              type="default"
              size="large"
              block
              @click="editCourse"
              icon="edit"
            >
              编辑课程
            </van-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 选择器弹窗 -->
    <van-popup v-model:show="showAgeGroupPicker" position="bottom">
      <van-picker
        :columns="ageGroupOptions"
        @confirm="onAgeGroupConfirm"
        @cancel="showAgeGroupPicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showDomainPicker" position="bottom">
      <van-picker
        :columns="domainOptions"
        @confirm="onDomainConfirm"
        @cancel="showDomainPicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showDurationPicker" position="bottom">
      <van-picker
        :columns="durationOptions"
        @confirm="onDurationConfirm"
        @cancel="showDurationPicker = false"
      />
    </van-popup>
  </MobileSubPageLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import MobileSubPageLayout from '@/components/mobile/layouts/MobileSubPageLayout.vue'

const router = useRouter()

// 响应式数据
const currentStep = ref(0)
const isGenerating = ref(false)
const generationComplete = ref(false)
const generationProgress = ref(0)
const currentGenerationStep = ref(0)
const generationStatus = ref('')
const aiThinking = ref('')
const generatedCourse = ref(null)

// 选择器状态
const showAgeGroupPicker = ref(false)
const showDomainPicker = ref(false)
const showDurationPicker = ref(false)

// 表单数据
const formData = reactive({
  name: '',
  description: '',
  ageGroup: '',
  domain: '',
  duration: '',
  objectives: '',
  keywords: '',
  useTemplate: 'yes',
  specialRequirements: ''
})

// AI对话
const aiInput = ref('')
const aiMessages = ref([
  {
    role: 'assistant',
    content: '你好！我是AI课程助手，可以帮助你创建精美的互动课程。请告诉我你想要创建什么样的课程？',
    time: '刚刚'
  }
])

// 配置数据
const steps = [
  {
    title: '描述课程',
    description: '输入课程的基本信息和需求'
  },
  {
    title: '选择参数',
    description: '设置年龄段、领域等参数'
  },
  {
    title: 'AI 生成',
    description: 'AI自动生成课程代码和素材'
  }
]

const examples = [
  {
    id: 1,
    icon: '🔢',
    title: '数字认知游戏',
    description: '适合3-4岁幼儿的数字1-10认知互动游戏',
    prompt: '创建一个数字认知的互动游戏课程，适合3-4岁幼儿，包含卡通风格的图片和音效'
  },
  {
    id: 2,
    icon: '🎨',
    title: '创意美术课',
    description: '春天主题的绘画创作课程，包含色彩认知',
    prompt: '生成一个春天主题的创意美术课程，适合4-5岁幼儿，包含色彩认知和绘画指导'
  },
  {
    id: 3,
    icon: '🎵',
    title: '音乐节拍',
    description: '基础音乐节奏训练，培养音乐感知能力',
    prompt: '创建一个音乐节拍训练课程，适合5-6岁幼儿，包含简单的节奏游戏和音乐欣赏'
  },
  {
    id: 4,
    icon: '📖',
    title: '古诗学习',
    description: '经典古诗词的互动学习，包含朗诵和解析',
    prompt: '生成一个关于《春晓》古诗的互动课程，适合4-5岁幼儿，包含卡通风格的图片和朗诵视频'
  }
]

const ageGroupOptions = [
  { text: '3-4岁', value: '3-4' },
  { text: '4-5岁', value: '4-5' },
  { text: '5-6岁', value: '5-6' }
]

const domainOptions = [
  { text: '健康', value: 'health' },
  { text: '语言', value: 'language' },
  { text: '社会', value: 'social' },
  { text: '科学', value: 'science' },
  { text: '艺术', value: 'art' }
]

const durationOptions = [
  { text: '15分钟', value: '15' },
  { text: '30分钟', value: '30' },
  { text: '45分钟', value: '45' },
  { text: '60分钟', value: '60' }
]

const generationSteps = [
  {
    title: '分析需求',
    description: '理解课程要求，确定生成方向',
    completed: false,
    active: false
  },
  {
    title: '设计结构',
    description: '设计课程结构和教学流程',
    completed: false,
    active: false
  },
  {
    title: '生成代码',
    description: '生成HTML/CSS/JS互动代码',
    completed: false,
    active: false
  },
  {
    title: '制作素材',
    description: '生成图片、音视频等教学素材',
    completed: false,
    active: false
  },
  {
    title: '优化完善',
    description: '优化课程效果和用户体验',
    completed: false,
    active: false
  }
]

// 计算属性
const canGenerate = computed(() => {
  return formData.name && formData.description && formData.ageGroup && formData.domain
})

const ageGroupText = computed(() => {
  const option = ageGroupOptions.find(item => item.value === formData.ageGroup)
  return option?.text || ''
})

const domainText = computed(() => {
  const option = domainOptions.find(item => item.value === formData.domain)
  return option?.text || ''
})

const durationText = computed(() => {
  const option = durationOptions.find(item => item.value === formData.duration)
  return option?.text || ''
})

// 方法
const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const selectExample = (example: any) => {
  formData.name = example.title
  formData.description = example.description
  nextStep()
}

const onAgeGroupConfirm = ({ selectedOptions }: any) => {
  formData.ageGroup = selectedOptions[0]?.value || ''
  showAgeGroupPicker.value = false
}

const onDomainConfirm = ({ selectedOptions }: any) => {
  formData.domain = selectedOptions[0]?.value || ''
  showDomainPicker.value = false
}

const onDurationConfirm = ({ selectedOptions }: any) => {
  formData.duration = selectedOptions[0]?.value || ''
  showDurationPicker.value = false
}

const sendToAI = () => {
  if (!aiInput.value.trim()) return

  // 添加用户消息
  aiMessages.value.push({
    role: 'user',
    content: aiInput.value,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  })

  // 模拟AI回复
  setTimeout(() => {
    const responses = [
      '很好的想法！我会根据你的需求来设计课程。',
      '这个主题很适合幼儿学习，我会加入更多互动元素。',
      '明白了！我会确保课程内容既有趣又富有教育意义。',
      '收到！我会为你生成一个精美的互动课程。'
    ]

    aiMessages.value.push({
      role: 'assistant',
      content: responses[Math.floor(Math.random() * responses.length)],
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    })
  }, 1000)

  aiInput.value = ''
}

const generateCourse = async () => {
  currentStep.value = 2
  isGenerating.value = true
  generationProgress.value = 0
  currentGenerationStep.value = 0

  // 模拟生成过程
  for (let i = 0; i < generationSteps.length; i++) {
    currentGenerationStep.value = i
    generationSteps[i].active = true
    generationStatus.value = generationSteps[i].description

    // 模拟AI思考
    if (i === 0) {
      aiThinking.value = '正在分析课程需求：' + formData.description + '，适合年龄段：' + ageGroupText.value
    } else if (i === 1) {
      aiThinking.value = '设计课程结构：包含导入、探索、实践、总结四个环节'
    } else if (i === 2) {
      aiThinking.value = '生成互动代码：HTML结构、CSS样式、JavaScript交互逻辑'
    }

    await new Promise(resolve => setTimeout(resolve, 2000))

    generationSteps[i].active = false
    generationSteps[i].completed = true
    generationProgress.value = ((i + 1) / generationSteps.length) * 100
  }

  // 生成完成
  generationComplete.value = true
  isGenerating.value = false
  generationStatus.value = '课程生成完成！'

  // 模拟生成的课程
  generatedCourse.value = {
    id: Date.now(),
    name: formData.name,
    description: formData.description,
    domain: formData.domain,
    ageGroup: formData.ageGroup,
    thumbnail: 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(formData.name),
    isAI: true
  }

  setTimeout(() => {
    currentStep.value = 3
  }, 1000)
}

const cancelGeneration = () => {
  showConfirmDialog({
    title: '确认取消',
    message: '确定要取消课程生成吗？'
  }).then(() => {
    isGenerating.value = false
    currentStep.value = 1
    showToast('已取消生成')
  }).catch(() => {
    // 用户取消
  })
}

const previewCourse = () => {
  router.push(`/mobile/teacher-center/creative-curriculum/preview/${generatedCourse.value?.id}`)
}

const startLesson = () => {
  router.push(`/mobile/teacher-center/creative-curriculum/lesson/${generatedCourse.value?.id}`)
}

const editCourse = () => {
  router.push(`/mobile/teacher-center/creative-curriculum/edit/${generatedCourse.value?.id}`)
}

// 生命周期
onMounted(() => {
  // 主题检测
  const detectTheme = () => {
    const htmlTheme = document.documentElement.getAttribute('data-theme')
    // isDark.value = htmlTheme === 'dark'
  }
  detectTheme()
  // 可以在这里加载一些初始化数据
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

.ai-create-container {
  min-height: 100vh;
  background: var(--van-background-color-light);
}

.welcome-section {
  padding: var(--spacing-lg);

  .welcome-content {
    text-align: center;

    .welcome-icon {
      font-size: 64px;
      margin-bottom: var(--spacing-lg);
    }

    h2 {
      font-size: var(--text-2xl);
      font-weight: 600;
      color: var(--van-text-color);
      margin-bottom: var(--spacing-md);
    }

    p {
      font-size: var(--text-sm);
      color: var(--van-text-color-2);
      line-height: 1.5;
      margin-bottom: 32px;
    }
  }

  .steps-container {
    margin-bottom: 32px;

    .step-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: var(--spacing-lg);
      padding: var(--spacing-md);
      background: white;
      border-radius: var(--spacing-sm);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .step-number {
        width: var(--spacing-2xl);
        height: var(--spacing-2xl);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-xs);
        font-weight: 600;
        margin-right: var(--spacing-md);
        flex-shrink: 0;
      }

      .step-content {
        text-align: left;

        h4 {
          margin: 0 0 4px 0;
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--van-text-color);
        }

        p {
          margin: 0;
          font-size: var(--text-sm);
          color: var(--van-text-color-2);
          line-height: 1.4;
        }
      }
    }
  }

  .examples-section {
    margin-bottom: 32px;
    text-align: left;

    h4 {
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--van-text-color);
      margin-bottom: var(--spacing-lg);
    }

    .example-list {
      .example-item {
        display: flex;
        align-items: center;
        padding: var(--spacing-md);
        margin-bottom: var(--spacing-sm);
        background: white;
        border-radius: var(--spacing-sm);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        cursor: pointer;

        .example-icon {
          font-size: var(--text-2xl);
          margin-right: var(--spacing-md);
        }

        .example-info {
          flex: 1;

          .example-title {
            font-size: var(--text-sm);
            font-weight: 600;
            color: var(--van-text-color);
            margin-bottom: var(--spacing-xs);
          }

          .example-desc {
            font-size: var(--text-xs);
            color: var(--van-text-color-2);
            line-height: 1.3;
          }
        }
      }
    }
  }

  .start-btn {
    height: 50px;
    font-size: var(--text-base);
    font-weight: 600;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: var(--spacing-md);
  }
}

.form-section {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding-top: var(--spacing-md);

  .step-header {
    background: white;
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-md);
    border-radius: var(--spacing-sm);
  }

  .form-content {
    flex: 1;
    overflow-y: auto;
    padding: 0 12px;

    .ai-assistant {
      padding: var(--spacing-md);
      background: #f8f9fa;
      border-radius: var(--spacing-sm);

      .messages {
        max-height: 200px;
        overflow-y: auto;
        margin-bottom: var(--spacing-md);

        .message {
          display: flex;
          margin-bottom: var(--spacing-md);

          &.user {
            flex-direction: row-reverse;

            .message-avatar {
              background: var(--van-primary-color);
              color: white;
            }
          }

          .message-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #e1e1e1;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 8px;
          }

          .message-content {
            max-width: 70%;

            .message-text {
              background: white;
              padding: var(--spacing-sm) 12px;
              border-radius: var(--spacing-md);
              font-size: var(--text-sm);
              line-height: 1.4;
            }

            .message-time {
              font-size: var(--spacing-md);
              color: var(--van-text-color-3);
              margin-top: var(--spacing-xs);
              text-align: right;
            }
          }
        }
      }
    }
  }

  .form-actions {
    display: flex;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background: white;
    border-top: 1px solid #ebedf0;

    .van-button {
      flex: 1;
    }
  }
}

.generating-section {
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;

  .generating-content {
    text-align: center;
    width: 100%;
    max-width: 320px;

    .ai-status {
      margin-bottom: 32px;

      .ai-avatar {
        width: 80px;
        height: 80px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        margin: 0 auto 16px;
      }

      h3 {
        font-size: var(--text-xl);
        font-weight: 600;
        color: var(--van-text-color);
        margin-bottom: var(--spacing-sm);
      }

      p {
        font-size: var(--text-sm);
        color: var(--van-text-color-2);
      }
    }

    .progress-section {
      margin-bottom: 32px;
    }

    .generation-steps {
      text-align: left;
      margin-bottom: 32px;

      .generation-step {
        display: flex;
        align-items: flex-start;
        margin-bottom: var(--spacing-lg);
        padding: var(--spacing-md);
        background: white;
        border-radius: var(--spacing-sm);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

        &.active {
          border-left: 3px solid var(--van-primary-color);
        }

        .step-icon {
          margin-right: var(--spacing-md);
          margin-top: var(--spacing-xs);
        }

        .step-info {
          flex: 1;

          .step-title {
            font-size: var(--text-sm);
            font-weight: 600;
            color: var(--van-text-color);
            margin-bottom: var(--spacing-xs);
          }

          .step-desc {
            font-size: var(--text-xs);
            color: var(--van-text-color-2);
            line-height: 1.3;
          }
        }
      }
    }

    .ai-thinking {
      background: #f8f9fa;
      padding: var(--spacing-md);
      border-radius: var(--spacing-sm);
      margin-bottom: 32px;
      text-align: left;

      .thinking-header {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-size: var(--text-xs);
        font-weight: 600;
        color: var(--van-primary-color);
        margin-bottom: var(--spacing-sm);
      }

      .thinking-content {
        font-size: var(--text-sm);
        color: var(--van-text-color-2);
        line-height: 1.4;
      }
    }

    .cancel-btn {
      background: white;
      color: var(--van-text-color-2);
      border: 1px solid #ebedf0;
    }
  }
}

.complete-section {
  padding: var(--spacing-lg);

  .complete-content {
    text-align: center;

    .success-icon {
      margin-bottom: var(--spacing-lg);
    }

    h3 {
      font-size: var(--text-xl);
      font-weight: 600;
      color: var(--van-text-color);
      margin-bottom: var(--spacing-sm);
    }

    p {
      font-size: var(--text-sm);
      color: var(--van-text-color-2);
      margin-bottom: var(--spacing-2xl);
    }
  }

  .preview-card {
    display: flex;
    background: white;
    border-radius: var(--spacing-sm);
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-2xl);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .preview-thumbnail {
      width: 80px;
      height: 80px;
      border-radius: var(--spacing-sm);
      overflow: hidden;
      margin-right: var(--spacing-md);
      flex-shrink: 0;
    }

    .preview-info {
      flex: 1;
      text-align: left;

      h4 {
        margin: 0 0 4px 0;
        font-size: var(--text-base);
        font-weight: 600;
        color: var(--van-text-color);
      }

      p {
        margin: 0 0 8px 0;
        font-size: var(--text-sm);
        color: var(--van-text-color-2);
        line-height: 1.3;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .preview-tags {
        display: flex;
        gap: var(--spacing-sm);
      }
    }
  }

  .complete-actions {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);

    .van-button {
      height: 48px;
      font-size: var(--text-base);
      font-weight: 600;
      border-radius: var(--spacing-md);
    }
  }
}

:deep(.van-cell-group) {
  margin-bottom: var(--spacing-md);
}

:deep(.van-steps) {
  .van-step__title {
    font-size: var(--text-xs);
  }
}

/* ==================== 暗色模式支持 ==================== */
@media (prefers-color-scheme: dark) {
  :root {
    /* 设计令牌会自动适配暗色模式 */
  }
}
</style>