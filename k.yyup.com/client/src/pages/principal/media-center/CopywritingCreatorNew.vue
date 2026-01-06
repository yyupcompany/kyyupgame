<template>
  <div class="copywriting-creator">
    <div class="creator-header">
      <h3>AI文案创作</h3>
      <p>智能生成适合各大平台的专业文案内容</p>
    </div>

    <div class="creator-content">
      <!-- 左侧配置面板 -->
      <div class="config-panel">
        <el-form :model="formData" label-width="80px">
          <el-form-item label="发布平台">
            <el-select v-model="formData.platform" placeholder="请选择平台">
              <el-option label="微信朋友圈" value="wechat_moments" />
              <el-option label="微博" value="weibo" />
              <el-option label="小红书" value="xiaohongshu" />
              <el-option label="抖音" value="douyin" />
            </el-select>
          </el-form-item>

          <el-form-item label="内容类型">
            <el-select v-model="formData.type" placeholder="请选择类型">
              <el-option label="招生宣传" value="enrollment" />
              <el-option label="活动推广" value="activity" />
              <el-option label="节日祝福" value="festival" />
              <el-option label="日常分享" value="daily" />
            </el-select>
          </el-form-item>

          <el-form-item label="主题内容">
            <el-input 
              v-model="formData.topic"
              type="textarea"
              :rows="3"
              placeholder="请输入文案主题，如：春季招生、亲子活动等"
            />
          </el-form-item>

          <el-form-item label="文案风格">
            <el-radio-group v-model="formData.style">
              <el-radio value="warm">温馨亲切</el-radio>
              <el-radio value="professional">专业权威</el-radio>
              <el-radio value="lively">活泼有趣</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="字数要求">
            <div class="word-count-slider">
              <el-slider 
                v-model="formData.wordCount"
                :min="50"
                :max="500"
                :step="50"
                show-stops
                show-input
              />
              <div class="word-count-display">
                当前设置：{{ formData.wordCount }} 字
              </div>
            </div>
          </el-form-item>

          <el-form-item>
            <el-button 
              type="primary" 
              @click="generateCopywriting"
              :loading="generating"
              size="large"
              style="width: 100%"
            >
              {{ generating ? 'AI创作中...' : '生成文案' }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 右侧预览面板 -->
      <div class="preview-panel">
        <div class="preview-header">
          <h4>预览效果</h4>
          <div class="preview-actions" v-if="generatedContent">
            <el-button size="small" @click="regenerate">重新生成</el-button>
            <el-button size="small" @click="copyToClipboard">复制文案</el-button>
          </div>
        </div>

        <div class="preview-content">
          <div v-if="generating" class="generating-state">
            <UnifiedIcon name="default" />
            <p>AI正在为您创作文案...</p>
          </div>

          <div v-else-if="generatedContent" class="generated-content">
            <!-- 预览模式切换 -->
            <div class="preview-mode-selector">
              <el-radio-group v-model="previewMode" size="small">
                <el-radio-button value="text">📝 文本预览</el-radio-button>
                <el-radio-button value="wechat">📱 朋友圈预览</el-radio-button>
                <el-radio-button value="poster">🎨 海报预览</el-radio-button>
              </el-radio-group>
            </div>
            
            <!-- 文本预览 -->
            <div v-if="previewMode === 'text'" class="text-preview">
              <div class="content-text">{{ generatedContent }}</div>
            </div>

            <!-- 微信朋友圈预览 -->
            <div v-else-if="previewMode === 'wechat'" class="wechat-preview-container">
              <WeChatMomentsPreview
                :content="generatedContent"
                :userName="'阳光幼儿园'"
                :userAvatar="'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='"
              />
            </div>

            <!-- 海报预览 -->
            <div v-else-if="previewMode === 'poster'" class="poster-preview-container">
              <PosterPreview 
                :content="generatedContent"
                :theme="posterTheme"
                :schoolName="'阳光幼儿园'"
                @theme-change="handleThemeChange"
              />
            </div>
          </div>

          <div v-else class="empty-state">
            <UnifiedIcon name="Edit" />
            <p>请填写左侧信息，开始AI文案创作</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading, Edit } from '@element-plus/icons-vue'
import WeChatMomentsPreview from '@/components/preview/WeChatMomentsPreview.vue'
import PosterPreview from '@/components/preview/PosterPreview.vue'

// 响应式数据
const generating = ref(false)
const generatedContent = ref('')
const previewMode = ref('wechat')
const posterTheme = ref('warm')

const formData = ref({
  platform: 'wechat_moments',
  type: 'enrollment',
  topic: '',
  style: 'warm',
  wordCount: 200
})

// 计算属性
const canGenerate = computed(() => {
  return formData.value.platform && formData.value.type && formData.value.topic
})

// 获取当前季节描述
const getCurrentSeasonOpening = () => {
  const month = new Date().getMonth() + 1 // 1-12
  const topic = formData.value.topic.toLowerCase()

  // 根据主题关键词优先匹配
  if (topic.includes('春') || topic.includes('spring')) {
    return '🌸春暖花开，正是孩子们成长的好时节！'
  } else if (topic.includes('夏') || topic.includes('summer') || topic.includes('六一')) {
    return '☀️夏日炎炎，孩子们的笑声最动听！'
  } else if (topic.includes('秋') || topic.includes('autumn') || topic.includes('fall')) {
    return '🍂秋高气爽，收获成长的季节！'
  } else if (topic.includes('冬') || topic.includes('winter') || topic.includes('圣诞') || topic.includes('新年')) {
    return '❄️冬日暖阳，温馨的成长时光！'
  }

  // 根据当前月份匹配
  if (month >= 3 && month <= 5) {
    return '🌸春暖花开，正是孩子们成长的好时节！'
  } else if (month >= 6 && month <= 8) {
    return '☀️夏日炎炎，孩子们的笑声最动听！'
  } else if (month >= 9 && month <= 11) {
    return '🍂秋高气爽，收获成长的季节！'
  } else {
    return '❄️冬日暖阳，温馨的成长时光！'
  }
}

// 生成动态的活动描述
const generateDynamicActivityDescription = () => {
  const topic = formData.value.topic

  const descriptions = [
    `今天在${topic}中，看到小朋友们认真投入的样子，真的很感动。`,
    `${topic}圆满举行！孩子们的表现超出了我们的期待。`,
    `在${topic}现场，每个孩子都展现出了独特的魅力。`,
    `${topic}带给孩子们无限的欢乐和成长。`,
    `参加${topic}的小朋友们都收获满满！`
  ]

  // 基于主题内容保持一致性
  const index = topic.length % descriptions.length
  return descriptions[index]
}

// 方法
const generateCopywriting = async () => {
  if (!canGenerate.value) {
    ElMessage.warning('请填写完整信息')
    return
  }

  generating.value = true

  try {
    // 模拟AI生成
    await new Promise(resolve => setTimeout(resolve, 2000))

    const seasonOpening = getCurrentSeasonOpening()
    const activityDesc = generateDynamicActivityDescription()
    const topic = formData.value.topic

    generatedContent.value = `${seasonOpening}

${activityDesc}他们专注的眼神，天真的笑容，每一个瞬间都让我们感受到教育的美好。

我们相信，每一个孩子都是独特的花朵，在阳光幼儿园这片沃土上，他们将绽放出最美丽的光彩！✨

#${topic} #幼儿园生活 #快乐成长 #教育分享

欢迎家长朋友们分享您家宝贝的成长故事！`

    ElMessage.success('文案生成成功！')
  } catch (error) {
    ElMessage.error('生成失败，请重试')
  } finally {
    generating.value = false
  }
}

const regenerate = () => {
  generateCopywriting()
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(generatedContent.value)
    ElMessage.success('文案已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败，请手动复制')
  }
}

const handleThemeChange = (theme: string) => {
  posterTheme.value = theme
}

// 组件事件
const emit = defineEmits(['content-created'])
</script>

<style lang="scss" scoped>
.copywriting-creator {
  height: 100%;
  display: flex;
  flex-direction: column;

  .creator-header {
    padding: var(--text-3xl);
    background: white;
    border-bottom: var(--z-index-dropdown) solid var(--bg-gray-light);

    h3 {
      margin: 0 0 var(--spacing-sm) 0;
      font-size: var(--text-2xl);
      font-weight: 600;
      color: var(--text-primary);
    }

    p {
      margin: 0;
      color: var(--text-regular);
      font-size: var(--text-base);
    }
  }

  .creator-content {
    flex: 1;
    display: flex;
    gap: var(--text-3xl);
    padding: var(--text-3xl);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;

    .config-panel {
      width: 100%; max-width: 400px;
      background: white;
      border-radius: var(--text-sm);
      padding: var(--text-3xl);
      box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
      overflow-y: auto;

      .el-form-item {
        margin-bottom: var(--text-2xl);

        .el-select,
        .el-input {
          width: 100%;
        }
      }

      .word-count-slider {
        .word-count-display {
          margin-top: var(--spacing-sm);
          font-size: var(--text-base);
          color: var(--text-regular);
          text-align: center;
        }
      }
    }

    .preview-panel {
      flex: 1;
      background: white;
      border-radius: var(--text-sm);
      box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
      display: flex;
      flex-direction: column;

      .preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--text-3xl);
        border-bottom: var(--z-index-dropdown) solid var(--bg-gray-light);

        h4 {
          margin: 0;
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--text-primary);
        }

        .preview-actions {
          display: flex;
          gap: var(--spacing-sm);
        }
      }

      .preview-content {
        flex: 1;
        padding: var(--text-3xl);
        overflow-y: auto;

        .generating-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60px; height: auto;
          text-align: center;

          .loading-icon {
            font-size: var(--text-5xl);
            color: var(--primary-color);
            animation: spin 2s linear infinite;
            margin-bottom: var(--text-lg);
          }

          p {
            margin: 0;
            font-size: var(--text-lg);
            color: var(--text-primary);
          }
        }

        .generated-content {
          .preview-mode-selector {
            margin-bottom: var(--text-2xl);
            text-align: center;

            .el-radio-group {
              background: var(--bg-gray-light);
              border-radius: var(--spacing-sm);
              padding: var(--spacing-xs);
            }
          }

          .text-preview {
            .content-text {
              background: var(--bg-gray-light);
              border-radius: var(--spacing-sm);
              padding: var(--text-2xl);
              line-height: 1.8;
              font-size: var(--text-base);
              color: var(--text-primary);
              white-space: pre-line;
              border-left: var(--spacing-xs) solid var(--primary-color);
            }
          }

          .wechat-preview-container {
            display: flex;
            justify-content: center;
            padding: var(--text-2xl);
            background: var(--bg-gray-light);
            border-radius: var(--text-sm);
          }

          .poster-preview-container {
            display: flex;
            justify-content: center;
            padding: var(--text-2xl);
            background: var(--bg-gray-light);
            border-radius: var(--text-sm);
          }
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60px; height: auto;
          color: var(--info-color);
          text-align: center;

          .el-icon {
            font-size: var(--text-6xl);
            margin-bottom: var(--text-lg);
          }

          p {
            margin: 0;
            font-size: var(--text-lg);
          }
        }
      }
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
