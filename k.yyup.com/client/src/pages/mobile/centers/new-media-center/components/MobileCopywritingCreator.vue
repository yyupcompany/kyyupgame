<template>
  <div class="mobile-copywriting-creator">
    <div class="creator-header">
      <h3>AI文案创作</h3>
      <p>选择平台和场景，AI为您生成专业的幼儿园营销文案</p>
    </div>

    <van-form @submit="generateCopywriting" class="creator-form">
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

      <!-- 文案类型 -->
      <van-cell-group inset class="form-group">
        <van-field
          v-model="typeLabel"
          is-link
          readonly
          name="type"
          label="文案类型"
          placeholder="选择文案类型"
          @click="showTypePicker = true"
        />
      </van-cell-group>

      <!-- 内容主题 -->
      <van-cell-group inset class="form-group">
        <van-field
          v-model="formData.topic"
          name="topic"
          label="内容主题"
          type="textarea"
          :autosize="{ minHeight: 80, maxHeight: 200 }"
          placeholder="请输入具体主题，如：春季招生、亲子运动会等"
          maxlength="100"
          show-word-limit
        />
      </van-cell-group>

      <!-- 文案风格 -->
      <van-cell-group inset class="form-group">
        <van-field name="style" label="文案风格">
          <template #input>
            <van-radio-group v-model="formData.style" direction="horizontal">
              <van-radio name="warm">温馨</van-radio>
              <van-radio name="professional">专业</van-radio>
              <van-radio name="lively">活泼</van-radio>
              <van-radio name="concise">简洁</van-radio>
            </van-radio-group>
          </template>
        </van-field>
      </van-cell-group>

      <!-- 关键信息 -->
      <van-cell-group inset class="form-group">
        <van-field
          v-model="formData.keyInfo"
          name="keyInfo"
          label="关键信息"
          type="textarea"
          :autosize="{ minHeight: 100, maxHeight: 200 }"
          placeholder="请输入需要突出的关键信息，如：地址、电话、优惠政策等"
          maxlength="500"
          show-word-limit
        />
        <van-cell>
          <van-checkbox v-model="useBasicInfo" @change="handleBasicInfoToggle">
            使用幼儿园基础信息
          </van-checkbox>
        </van-cell>
      </van-cell-group>

      <!-- 字数要求 -->
      <van-cell-group inset class="form-group">
        <van-field name="wordCount" label="字数要求">
          <template #input>
            <van-slider
              v-model="formData.wordCount"
              :min="50"
              :max="500"
              :step="50"
              bar-height="4px"
              active-color="var(--primary-color)"
            >
              <template #button>
                <div class="slider-button">{{ formData.wordCount }}</div>
              </template>
            </van-slider>
          </template>
        </van-field>
        <van-cell title="当前设置" :value="`${formData.wordCount} 字`" />
      </van-cell-group>

      <!-- 快速模板 -->
      <div class="quick-templates">
        <h4>快速模板</h4>
        <div class="template-list">
          <div
            v-for="template in quickTemplates"
            :key="template.id"
            class="template-item"
            @click="useTemplate(template)"
          >
            <div class="template-title">{{ template.title }}</div>
            <div class="template-desc">{{ template.description }}</div>
          </div>
        </div>
      </div>

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
          生成文案
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
      close-icon="cross"
    >
      <div class="result-popup">
        <div class="result-header">
          <h3>生成结果</h3>
          <div class="result-tags">
            <van-tag type="primary">{{ getPlatformLabel(formData.platform) }}</van-tag>
            <van-tag type="success">{{ getTypeLabel(formData.type) }}</van-tag>
            <van-tag type="default">{{ getContentWordCount(generatedContent) }}字</van-tag>
          </div>
        </div>

        <div class="result-content">
          <div v-if="generating" class="generating-state">
            <van-loading size="24px">AI正在创作中...</van-loading>
            <div class="progress-text">{{ progressText }}</div>
          </div>

          <div v-else-if="generatedContent" class="generated-content">
            <van-tabs v-model:active="previewActiveTab" shrink>
              <van-tab title="文本" name="text">
                <div class="text-preview">
                  <p class="content-text">{{ generatedContent }}</p>
                </div>
              </van-tab>
              <van-tab title="朋友圈预览" name="wechat">
                <div class="wechat-preview">
                  <div class="wechat-header">
                    <div class="user-avatar">🏫</div>
                    <div class="user-info">
                      <div class="user-name">{{ schoolInfo.name }}</div>
                      <div class="post-time">刚刚</div>
                    </div>
                  </div>
                  <div class="wechat-content">{{ generatedContent }}</div>
                  <div class="wechat-footer">
                    <van-icon name="like-o" />
                    <van-icon name="comment-o" />
                    <van-icon name="share" />
                  </div>
                </div>
              </van-tab>
              <van-tab title="分析" name="analysis" v-if="contentAnalysis">
                <div class="content-analysis">
                  <van-cell-group>
                    <van-cell title="字数统计" :value="`${getContentWordCount(generatedContent)}字`" />
                    <van-cell title="情感倾向" :value="contentAnalysis.sentiment" />
                    <van-cell title="关键词" :value="contentAnalysis.keywords?.join('、')" />
                  </van-cell-group>
                  <div class="suggestions" v-if="contentAnalysis.suggestions">
                    <h4>优化建议</h4>
                    <div v-for="suggestion in contentAnalysis.suggestions" :key="suggestion" class="suggestion-item">
                      • {{ suggestion }}
                    </div>
                  </div>
                </div>
              </van-tab>
            </van-tabs>
          </div>

          <div v-else class="empty-state">
            <van-empty description="暂无生成内容" />
          </div>
        </div>

        <div class="result-actions" v-if="generatedContent && !generating">
          <van-button round plain @click="regenerate">重新生成</van-button>
          <van-button round plain type="primary" @click="copyToClipboard">复制文案</van-button>
          <van-button round type="primary" @click="saveContent">保存文案</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { showToast, showSuccessToast, showFailToast } from 'vant'

// 响应式数据
const generating = ref(false)
const generatedContent = ref('')
const contentAnalysis = ref<any>(null)
const progressText = ref('')
const showResultPopup = ref(false)
const previewActiveTab = ref('text')

// 弹窗显示
const showPlatformPicker = ref(false)
const showTypePicker = ref(false)

// 学校信息
const schoolInfo = ref({
  name: '阳光幼儿园',
  avatar: '',
  logo: '',
  phone: '400-123-4567',
  address: '北京市朝阳区xxx街道xxx号'
})

// 表单数据
const formData = ref({
  platform: '',
  type: '',
  topic: '',
  style: 'warm',
  keyInfo: '',
  wordCount: 150
})

// 基础信息相关
const useBasicInfo = ref(false)
const kindergartenInfo = ref<any>(null)

// 平台选项
const platformColumns = [
  { text: '微信朋友圈', value: 'wechat_moments' },
  { text: '微博', value: 'weibo' },
  { text: 'QQ空间', value: 'qzone' },
  { text: '小红书', value: 'xiaohongshu' },
  { text: '抖音', value: 'douyin' },
  { text: '快手', value: 'kuaishou' },
  { text: '今日头条', value: 'toutiao' }
]

// 类型选项
const typeColumns = [
  { text: '招生宣传', value: 'enrollment' },
  { text: '活动推广', value: 'activity' },
  { text: '节日祝福', value: 'festival' },
  { text: '日常分享', value: 'daily' },
  { text: '课程介绍', value: 'course' },
  { text: '师资介绍', value: 'teacher' },
  { text: '环境展示', value: 'environment' }
]

// 快速模板
const quickTemplates = ref([
  {
    id: 1,
    title: '春季招生',
    description: '春季招生活动宣传文案',
    data: {
      platform: 'wechat_moments',
      type: 'enrollment',
      topic: '春季招生活动',
      style: 'warm'
    }
  },
  {
    id: 2,
    title: '亲子活动',
    description: '亲子活动推广文案',
    data: {
      platform: 'xiaohongshu',
      type: 'activity',
      topic: '亲子手工制作活动',
      style: 'lively'
    }
  },
  {
    id: 3,
    title: '节日祝福',
    description: '节日祝福温馨文案',
    data: {
      platform: 'wechat_moments',
      type: 'festival',
      topic: '新年祝福',
      style: 'warm'
    }
  }
])

// 计算属性
const canGenerate = computed(() => {
  return formData.value.platform && formData.value.type && formData.value.topic
})

const platformLabel = computed(() => {
  const platform = platformColumns.find(p => p.value === formData.value.platform)
  return platform?.text || ''
})

const typeLabel = computed(() => {
  const type = typeColumns.find(t => t.value === formData.value.type)
  return type?.text || ''
})

// 方法
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

const getContentWordCount = (content: string) => {
  return content.length
}

// 处理基础信息勾选
const handleBasicInfoToggle = (checked: boolean) => {
  if (checked && kindergartenInfo.value) {
    const basicInfo = buildBasicInfoText()
    if (formData.value.keyInfo) {
      formData.value.keyInfo = basicInfo + '\n' + formData.value.keyInfo
    } else {
      formData.value.keyInfo = basicInfo
    }
  }
}

// 构建基础信息文本
const buildBasicInfoText = () => {
  if (!kindergartenInfo.value) return ''
  const info = kindergartenInfo.value
  const parts: string[] = []
  if (info.name) parts.push(`园所：${info.name}`)
  if (info.address) parts.push(`地址：${info.address}`)
  if (info.phone) parts.push(`电话：${info.phone}`)
  return parts.join('\n')
}

// 使用模板
const useTemplate = (template: any) => {
  Object.assign(formData.value, template.data)
  showToast('已应用模板')
}

// 构建AI提示词
const buildPrompt = () => {
  const platformText = getPlatformLabel(formData.value.platform)
  const typeText = getTypeLabel(formData.value.type)
  const styleMap: Record<string, string> = {
    warm: '温馨亲切',
    professional: '专业严谨',
    lively: '活泼有趣',
    concise: '简洁明了'
  }
  const styleText = styleMap[formData.value.style] || '温馨亲切'

  let prompt = `请为幼儿园生成一段${platformText}平台的文案。

**发布平台**：${platformText}
**文案类型**：${typeText}
**内容主题**：${formData.value.topic}
**文案风格**：${styleText}
**字数要求**：约${formData.value.wordCount}字

`

  if (formData.value.keyInfo) {
    prompt += `**关键信息**：\n${formData.value.keyInfo}\n\n`
  }

  prompt += `**要求**：
1. 文案要符合${platformText}平台的特点和用户习惯
2. 使用${styleText}的语气风格
3. 内容要吸引家长注意，突出幼儿园的特色和优势
4. 适当使用emoji增加趣味性
5. 包含合适的hashtag
6. 字数控制在${formData.value.wordCount}字左右

请直接输出文案内容，不要有多余的解释。`

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
      buffer = lines.pop() || '' // 保留不完整的行

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))

            if (data.type === 'answer_chunk' && data.content) {
              fullContent += data.content
              // 更新进度显示
              generatedContent.value = fullContent
              progressText.value = `已生成 ${fullContent.length} 字...`
            } else if (data.type === 'error') {
              throw new Error(data.error || 'AI生成出错')
            } else if (data.type === 'done') {
              // 生成完成
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

// 解析AI响应获取分析数据
const parseAIResponse = (content: string) => {
  // 简单的字数统计
  const wordCount = content.length

  // 情感倾向分析（简单版）
  const positiveWords = ['快乐', '温馨', '爱', '成长', '幸福', '美好', '优秀', '专业']
  const sentimentScore = positiveWords.filter(word => content.includes(word)).length
  let sentiment = '中性'
  if (sentimentScore >= 3) sentiment = '积极向上'
  else if (sentimentScore >= 1) sentiment = '积极'

  // 提取关键词（简单版）
  const keywords = [
    '幼儿园', '招生', '教育', '孩子', '成长', '学习', '活动',
    '师资', '环境', '课程', '亲子', '快乐', '专业'
  ].filter(word => content.includes(word))

  // 生成优化建议
  const suggestions: string[] = []
  if (wordCount < 100) {
    suggestions.push('文案较短，可以增加更多详细信息')
  }
  if (!content.includes('地址') && !content.includes('电话')) {
    suggestions.push('建议添加幼儿园联系方式')
  }
  if (!content.match(/[🎉🌸✨💕❤️🎨]/)) {
    suggestions.push('可以添加更多emoji增加趣味性')
  }
  if (keywords.length < 3) {
    suggestions.push('建议使用更多相关关键词')
  }

  return {
    wordCount,
    sentiment,
    keywords,
    suggestions
  }
}

// 生成文案
const generateCopywriting = async () => {
  if (!canGenerate.value) {
    showToast('请填写完整信息')
    return
  }

  generating.value = true
  progressText.value = '正在连接AI...'
  generatedContent.value = ''
  contentAnalysis.value = null
  showResultPopup.value = true
  previewActiveTab.value = 'text'

  try {
    // 构建提示词
    const prompt = buildPrompt()

    // 调用AI API
    progressText.value = 'AI正在创作中...'
    const content = await callAIExpert(prompt)

    if (!content || content.trim().length === 0) {
      throw new Error('AI生成内容为空')
    }

    generatedContent.value = content

    // 分析生成的内容
    contentAnalysis.value = parseAIResponse(content)

    showSuccessToast('文案生成成功！')
  } catch (error: any) {
    console.error('生成失败:', error)
    showFailToast(error.message || '生成失败，请重试')
    generatedContent.value = ''
    contentAnalysis.value = null
  } finally {
    generating.value = false
    progressText.value = ''
  }
}

// 重新生成
const regenerate = () => {
  generateCopywriting()
}

// 复制到剪贴板
const copyToClipboard = () => {
  navigator.clipboard.writeText(generatedContent.value).then(() => {
    showSuccessToast('已复制到剪贴板')
  })
}

// 保存内容
const saveContent = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch('/api/new-media-center/content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        type: 'copywriting',
        platform: formData.value.platform,
        contentType: formData.value.type,
        topic: formData.value.topic,
        style: formData.value.style,
        content: generatedContent.value,
        wordCount: getContentWordCount(generatedContent.value),
        analysis: contentAnalysis.value,
        metadata: {
          keyInfo: formData.value.keyInfo,
          targetWordCount: formData.value.wordCount
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

// 获取幼儿园信息
const fetchKindergartenInfo = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch('/api/kindergartens/1', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (response.ok) {
      const data = await response.json()
      if (data.success) {
        kindergartenInfo.value = data.data
        schoolInfo.value = {
          name: data.data.name || '阳光幼儿园',
          avatar: data.data.logoUrl || '',
          logo: data.data.logoUrl || '',
          phone: data.data.phone || '400-123-4567',
          address: data.data.address || '北京市朝阳区xxx街道xxx号'
        }
      }
    }
  } catch (error) {
    console.error('获取幼儿园信息失败:', error)
  }
}

onMounted(() => {
  fetchKindergartenInfo()
})
</script>

<style lang="scss" scoped>
@import '@/styles/design-tokens.scss';

.mobile-copywriting-creator {
  background: var(--bg-color-page);

  .creator-header {
    padding: var(--app-gap);
    background: var(--bg-card);
    margin-bottom: var(--app-gap);
    text-align: center;

    h3 {
      font-size: var(--text-lg);
      font-weight: var(--font-semibold);
      color: var(--text-primary);
      margin-bottom: var(--app-gap-xs);
    }

    p {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      margin: 0;
    }
  }

  .creator-form {
    padding-bottom: var(--app-gap);
  }

  .form-group {
    margin-bottom: var(--app-gap);
  }

  .quick-templates {
    padding: var(--app-gap);
    background: var(--bg-card);
    margin: var(--app-gap) 0;

    h4 {
      font-size: var(--text-base);
      font-weight: var(--font-semibold);
      margin-bottom: var(--app-gap);
      color: var(--text-primary);
    }

    .template-list {
      display: grid;
      gap: var(--app-gap-sm);

      .template-item {
        padding: var(--app-gap-sm);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        background: var(--bg-secondary);
        cursor: pointer;
        transition: all var(--transition-base);

        &:active {
          transform: scale(0.98);
          background: var(--bg-hover);
        }

        .template-title {
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
          color: var(--text-primary);
          margin-bottom: var(--app-gap-xs);
        }

        .template-desc {
          font-size: var(--text-xs);
          color: var(--text-secondary);
        }
      }
    }
  }

  .action-buttons {
    padding: var(--app-gap);
  }

  .slider-button {
    width: 26px;
    height: 26px;
    background: var(--primary-color);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-xs);
    font-weight: var(--font-medium);
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
        gap: var(--app-gap);

        .progress-text {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }
      }

      .generated-content {
        .text-preview {
          padding: var(--app-gap);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          min-height: 200px;

          .content-text {
            font-size: var(--text-base);
            line-height: var(--leading-relaxed);
            color: var(--text-primary);
            white-space: pre-wrap;
          }
        }

        .wechat-preview {
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          padding: var(--app-gap);
          min-height: 200px;

          .wechat-header {
            display: flex;
            gap: var(--app-gap-sm);
            margin-bottom: var(--app-gap);

            .user-avatar {
              width: 40px;
              height: 40px;
              background: var(--primary-color);
              border-radius: var(--radius-md);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: var(--text-xl);
            }

            .user-info {
              flex: 1;

              .user-name {
                font-size: var(--text-sm);
                font-weight: var(--font-medium);
                color: var(--text-primary);
              }

              .post-time {
                font-size: var(--text-xs);
                color: var(--text-secondary);
              }
            }
          }

          .wechat-content {
            font-size: var(--text-base);
            line-height: var(--leading-relaxed);
            color: var(--text-primary);
            margin-bottom: var(--app-gap);
          }

          .wechat-footer {
            display: flex;
            gap: var(--app-gap-lg);
            padding-top: var(--app-gap-sm);
            border-top: 1px solid var(--border-color);
            color: var(--text-secondary);
          }
        }

        .content-analysis {
          .suggestions {
            margin-top: var(--app-gap);

            h4 {
              font-size: var(--text-sm);
              font-weight: var(--font-medium);
              margin-bottom: var(--app-gap-sm);
            }

            .suggestion-item {
              font-size: var(--text-sm);
              color: var(--text-secondary);
              padding: var(--app-gap-xs) 0;
              line-height: var(--leading-normal);
            }
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

// 弹出层样式
:deep(.van-picker) {
  --van-picker-cancel-text: var(--text-secondary);
}
</style>
