<template>
  <div class="mobile-article-creator">
    <div class="creator-header">
      <h3>AI图文创作</h3>
      <p>生成图文并茂的推广内容，包含配图建议和排版方案</p>
    </div>

    <van-form @submit="generateArticle" class="creator-form">
      <!-- 发布平台 -->
      <van-cell-group inset class="form-group">
        <van-field
          v-model="platformLabel"
          is-link
          readonly
          name="platform"
          label="发布平台"
          placeholder="选择发布平台"
          @click="showPlatformPicker = true"
        />
      </van-cell-group>

      <!-- 内容类型 -->
      <van-cell-group inset class="form-group">
        <van-field
          v-model="typeLabel"
          is-link
          readonly
          name="type"
          label="内容类型"
          placeholder="选择内容类型"
          @click="showTypePicker = true"
        />
      </van-cell-group>

      <!-- 文章标题 -->
      <van-cell-group inset class="form-group">
        <van-field
          v-model="formData.title"
          name="title"
          label="文章标题"
          placeholder="请输入文章标题"
          maxlength="50"
          show-word-limit
        />
      </van-cell-group>

      <!-- 核心内容 -->
      <van-cell-group inset class="form-group">
        <van-field
          v-model="formData.content"
          name="content"
          label="核心内容"
          type="textarea"
          :autosize="{ minHeight: 120, maxHeight: 250 }"
          placeholder="请描述要表达的核心内容和要点"
          maxlength="800"
          show-word-limit
        />
      </van-cell-group>

      <!-- 文章长度 -->
      <van-cell-group inset class="form-group">
        <van-field name="length" label="文章长度">
          <template #input>
            <van-radio-group v-model="formData.length" direction="horizontal">
              <van-radio name="short">短文</van-radio>
              <van-radio name="medium">中文</van-radio>
              <van-radio name="long">长文</van-radio>
            </van-radio-group>
          </template>
        </van-field>
      </van-cell-group>

      <!-- 配图需求 -->
      <van-cell-group inset class="form-group">
        <van-field name="imageTypes" label="配图需求">
          <template #input>
            <van-checkbox-group v-model="formData.imageTypes" direction="horizontal">
              <van-checkbox name="cover">封面</van-checkbox>
              <van-checkbox name="content">内容</van-checkbox>
              <van-checkbox name="ending">结尾</van-checkbox>
            </van-checkbox-group>
          </template>
        </van-field>
      </van-cell-group>

      <!-- 生成按钮 -->
      <div class="action-buttons">
        <van-button
          round
          block
          type="primary"
          native-type="submit"
          :loading="generating"
          :disabled="!canGenerate"
          loading-text="AI创作中..."
        >
          生成图文
        </van-button>
      </div>
    </van-form>

    <!-- 平台选择弹窗 -->
    <van-popup v-model:show="showPlatformPicker" position="bottom" round>
      <van-picker
        :columns="platformColumns"
        @confirm="onPlatformConfirm"
        @cancel="showPlatformPicker = false"
      />
    </van-popup>

    <!-- 类型选择弹窗 -->
    <van-popup v-model:show="showTypePicker" position="bottom" round>
      <van-picker
        :columns="typeColumns"
        @confirm="onTypeConfirm"
        @cancel="showTypePicker = false"
      />
    </van-popup>

    <!-- 生成结果弹窗 -->
    <van-popup
      v-model:show="showResultPopup"
      position="bottom"
      :style="{ height: '80%' }"
      round
      closeable
    >
      <div class="result-popup">
        <div class="result-header">
          <h3>生成结果</h3>
          <div class="result-tags">
            <van-tag type="primary">{{ getPlatformLabel(formData.platform) }}</van-tag>
            <van-tag type="success">{{ getTypeLabel(formData.type) }}</van-tag>
          </div>
        </div>

        <div class="result-content">
          <div v-if="generating" class="generating-state">
            <van-loading size="24px">AI正在创作中...</van-loading>
          </div>

          <div v-else-if="generatedArticle" class="generated-article">
            <van-tabs v-model:active="previewActiveTab" shrink>
              <van-tab title="内容" name="content">
                <div class="article-preview">
                  <h4 class="article-title">{{ generatedArticle.title }}</h4>
                  <div class="article-meta">
                    <span class="word-count">约{{ generatedArticle.wordCount }}字</span>
                  </div>
                  <div class="article-content" v-html="generatedArticle.content"></div>
                </div>
              </van-tab>
              <van-tab title="配图建议" name="images">
                <div class="image-suggestions">
                  <div
                    v-for="(image, index) in generatedArticle.images"
                    :key="index"
                    class="image-item"
                  >
                    <div class="image-placeholder">
                      <van-icon name="photo-o" size="32" />
                      <p>图{{ index + 1 }}</p>
                    </div>
                    <p class="image-desc">{{ image }}</p>
                  </div>
                </div>
              </van-tab>
            </van-tabs>
          </div>

          <div v-else class="empty-state">
            <van-empty description="暂无生成内容" />
          </div>
        </div>

        <div class="result-actions" v-if="generatedArticle && !generating">
          <van-button round plain @click="regenerate">重新生成</van-button>
          <van-button round plain type="primary" @click="copyToClipboard">复制内容</van-button>
          <van-button round type="primary" @click="saveContent">保存图文</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { showToast, showSuccessToast } from 'vant'

const generating = ref(false)
const generatedArticle = ref<any>(null)
const showResultPopup = ref(false)
const previewActiveTab = ref('content')

const showPlatformPicker = ref(false)
const showTypePicker = ref(false)

const formData = ref({
  platform: '',
  type: '',
  title: '',
  content: '',
  length: 'medium',
  imageTypes: [] as string[]
})

const platformColumns = [
  { text: '微信公众号', value: 'wechat_official' },
  { text: '小红书', value: 'xiaohongshu' },
  { text: '知乎', value: 'zhihu' },
  { text: '今日头条', value: 'toutiao' },
  { text: '百家号', value: 'baijiahao' },
  { text: '搜狐号', value: 'sohu' }
]

const typeColumns = [
  { text: '招生宣传', value: 'enrollment' },
  { text: '活动推广', value: 'activity' },
  { text: '教育理念', value: 'education' },
  { text: '课程介绍', value: 'course' },
  { text: '师资介绍', value: 'teacher' },
  { text: '环境展示', value: 'environment' },
  { text: '家长分享', value: 'parent_share' }
]

const canGenerate = computed(() => {
  return formData.value.platform && formData.value.type && formData.value.content
})

const platformLabel = computed(() => {
  const platform = platformColumns.find(p => p.value === formData.value.platform)
  return platform?.text || ''
})

const typeLabel = computed(() => {
  const type = typeColumns.find(t => t.value === formData.value.type)
  return type?.text || ''
})

const onPlatformConfirm = ({ selectedOptions }: any) => {
  formData.value.platform = selectedOptions[0].value
  showPlatformPicker.value = false
}

const onTypeConfirm = ({ selectedOptions }: any) => {
  formData.value.type = selectedOptions[0].value
  showTypePicker.value = false
}

const getPlatformLabel = (value: string) => {
  const platform = platformColumns.find(p => p.value === value)
  return platform?.text || ''
}

const getTypeLabel = (value: string) => {
  const type = typeColumns.find(t => t.value === value)
  return type?.text || ''
}

// 构建AI提示词
const buildPrompt = () => {
  const platformText = getPlatformLabel(formData.value.platform)
  const typeText = getTypeLabel(formData.value.type)

  const lengthMap: Record<string, string> = {
    short: '短文（约300-500字）',
    medium: '中等篇幅（约800-1200字）',
    long: '长文（约1500-2000字）'
  }
  const lengthText = lengthMap[formData.value.length] || '中等篇幅'

  let prompt = `请为幼儿园生成一篇图文文章。

**发布平台**：${platformText}
**内容类型**：${typeText}
**文章标题**：${formData.value.title || '请生成一个吸引人的标题'}
**核心内容**：${formData.value.content}
**文章长度**：${lengthText}

`

  if (formData.value.imageTypes && formData.value.imageTypes.length > 0) {
    const imageTypeMap: Record<string, string> = {
      cover: '封面配图',
      content: '内容配图',
      ending: '结尾配图'
    }
    const imageTypesText = formData.value.imageTypes
      .map((t: string) => imageTypeMap[t] || t)
      .join('、')
    prompt += `**配图需求**：需要${imageTypesText}\n\n`
  }

  prompt += `**要求**：
1. 文章要符合${platformText}平台的风格和特点
2. 标题要吸引人，符合${typeText}主题
3. 内容要有条理，分段清晰，易于阅读
4. 每段开头要有明确的小标题或引导语
5. 使用适合的emoji和格式标记
6. 最后请提供配图建议

请按以下格式输出：
---
【标题】文章标题

【正文】
文章正文内容...

【配图建议】
1. 封面图建议：...
2. 内容配图建议：...
---`

  return prompt
}

// 调用AI专家
const callAIExpert = async (prompt: string): Promise<string> => {
  const token = localStorage.getItem('token')

  const response = await fetch('/api/ai/unified/stream-chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept': 'text/event-stream'
    },
    body: JSON.stringify({ message: prompt })
  })

  if (!response.ok) {
    throw new Error(`API请求失败: ${response.status}`)
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('无法获取响应流')
  }

  const decoder = new TextDecoder()
  let fullContent = ''
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))

            if (data.type === 'answer_chunk' && data.content) {
              fullContent += data.content
            } else if (data.type === 'error') {
              throw new Error(data.error || 'AI生成出错')
            }
          } catch (e) {
            console.warn('解析SSE数据失败:', line, e)
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }

  return fullContent
}

// 解析AI响应
const parseAIResponse = (fullContent: string) => {
  let title = formData.value.title || '精彩文章标题'
  let content = ''
  let rawImages: string[] = []

  // 尝试解析结构化响应
  const titleMatch = fullContent.match(/【标题】([^\n]+)/)
  if (titleMatch) {
    title = titleMatch[1].trim()
  }

  const contentMatch = fullContent.match(/【正文】([\s\S]+?)(?=【配图建议】|$)/)
  if (contentMatch) {
    content = contentMatch[1].trim()
  } else {
    content = fullContent
  }

  const imagesMatch = fullContent.match(/【配图建议】([\s\S]+)/)
  if (imagesMatch) {
    const imageLines = imagesMatch[1]
      .split('\n')
      .map((line: string) => line.replace(/^\d+[\.\、]\s*/, '').trim())
      .filter((line: string) => line.length > 0)
    rawImages = imageLines
  }

  // 格式化内容为HTML
  const formattedContent = content
    .split('\n\n')
    .map((para: string) => {
      if (para.startsWith('#')) {
        return `<h3>${para.replace(/^#+\s*/, '')}</h3>`
      }
      return `<p>${para.replace(/\n/g, '<br>')}</p>`
    })
    .join('')

  // 统计字数
  const wordCount = content.replace(/[<>\s]/g, '').length

  // 生成默认配图建议
  const images = rawImages.length > 0 ? rawImages : [
    '幼儿园外观或标志性建筑',
    '孩子们活动或学习的场景',
    '温馨的教学环境',
    '孩子们的笑脸特写'
  ]

  return {
    title,
    wordCount,
    content: formattedContent,
    images
  }
}

const generateArticle = async () => {
  if (!canGenerate.value) {
    showToast('请填写完整信息')
    return
  }

  generating.value = true
  generatedArticle.value = null
  showResultPopup.value = true

  try {
    const prompt = buildPrompt()
    const fullContent = await callAIExpert(prompt)

    if (!fullContent || fullContent.trim().length === 0) {
      throw new Error('AI生成内容为空')
    }

    const parsed = parseAIResponse(fullContent)
    generatedArticle.value = parsed

    showSuccessToast('图文生成成功！')
  } catch (error: any) {
    console.error('生成失败:', error)
    showFailToast(error.message || '生成失败，请重试')
  } finally {
    generating.value = false
  }
}

const regenerate = () => {
  generateArticle()
}

const copyToClipboard = () => {
  if (generatedArticle.value) {
    const textContent = generatedArticle.value.content.replace(/<[^>]*>/g, '\n').replace(/\n+/g, '\n\n')
    navigator.clipboard.writeText(textContent).then(() => {
      showSuccessToast('已复制到剪贴板')
    })
  }
}

const saveContent = async () => {
  if (!generatedArticle.value) {
    showToast('没有可保存的内容')
    return
  }

  try {
    const token = localStorage.getItem('token')
    const response = await fetch('/api/new-media-center/content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        type: 'article',
        platform: formData.value.platform,
        contentType: formData.value.type,
        title: generatedArticle.value.title,
        content: generatedArticle.value.content,
        wordCount: generatedArticle.value.wordCount,
        images: generatedArticle.value.images,
        metadata: {
          length: formData.value.length,
          imageTypes: formData.value.imageTypes
        }
      })
    })

    if (response.ok) {
      const data = await response.json()
      if (data.success) {
        showSuccessToast('内容已保存')
      } else {
        showFailToast(data.message || '保存失败')
      }
    } else {
      showFailToast('保存失败，请重试')
    }
  } catch (error) {
    console.error('保存失败:', error)
    showFailToast('保存失败，请重试')
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/design-tokens.scss';

.mobile-article-creator {
  background: var(--bg-color-page);

  .creator-header {
    padding: var(--app-gap);
    background: var(--bg-card);
    margin-bottom: var(--app-gap);
    text-align: center;

    h3 {
      font-size: var(--text-lg);
      font-weight: var(--font-semibold);
      margin-bottom: var(--app-gap-xs);
    }

    p {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      margin: 0;
    }
  }

  .form-group {
    margin-bottom: var(--app-gap);
  }

  .action-buttons {
    padding: var(--app-gap);
  }

  .result-popup {
    height: 100%;
    display: flex;
    flex-direction: column;

    .result-header {
      padding: var(--app-gap);
      border-bottom: 1px solid var(--border-color);

      h3 {
        font-size: var(--text-lg);
        font-weight: var(--font-semibold);
        margin-bottom: var(--app-gap-sm);
      }

      .result-tags {
        display: flex;
        gap: var(--app-gap-xs);
      }
    }

    .result-content {
      flex: 1;
      overflow-y: auto;
      padding: var(--app-gap);

      .generating-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 200px;
      }

      .article-preview {
        .article-title {
          font-size: var(--text-xl);
          font-weight: var(--font-semibold);
          margin-bottom: var(--app-gap-sm);
          color: var(--text-primary);
        }

        .article-meta {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          margin-bottom: var(--app-gap);
        }

        .article-content {
          font-size: var(--text-base);
          line-height: var(--leading-relaxed);
          color: var(--text-primary);
        }
      }

      .image-suggestions {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--app-gap);

        .image-item {
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          padding: var(--app-gap);
          text-align: center;

          .image-placeholder {
            height: 100px;
            background: var(--bg-hover);
            border-radius: var(--radius-sm);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: var(--app-gap-xs);
            margin-bottom: var(--app-gap-sm);
            color: var(--text-secondary);
          }

          .image-desc {
            font-size: var(--text-sm);
            color: var(--text-secondary);
            margin: 0;
          }
        }
      }
    }

    .result-actions {
      padding: var(--app-gap);
      border-top: 1px solid var(--border-color);
      display: flex;
      gap: var(--app-gap-sm);

      .van-button {
        flex: 1;
      }
    }
  }
}
</style>
