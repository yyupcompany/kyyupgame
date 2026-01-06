<template>
  <div class="copywriting-creator">
    <div class="creator-header">
      <h3>AI文案创作</h3>
      <p>选择平台和场景，AI为您生成专业的幼儿园营销文案</p>
    </div>

    <div class="creator-content">
      <!-- 左侧配置面板 -->
      <div class="config-panel">
        <el-form :model="formData" label-width="100px" @submit.prevent>
          <el-form-item label="发布平台">
            <el-select v-model="formData.platform" placeholder="选择发布平台" @change="handlePlatformChange">
              <el-option-group label="社交平台">
                <el-option label="微信朋友圈" value="wechat_moments" />
                <el-option label="微博" value="weibo" />
                <el-option label="QQ空间" value="qzone" />
              </el-option-group>
              <el-option-group label="内容平台">
                <el-option label="小红书" value="xiaohongshu" />
                <el-option label="抖音" value="douyin" />
                <el-option label="快手" value="kuaishou" />
                <el-option label="今日头条" value="toutiao" />
              </el-option-group>
            </el-select>
          </el-form-item>

          <el-form-item label="文案类型">
            <el-select v-model="formData.type" placeholder="选择文案类型">
              <el-option label="招生宣传" value="enrollment" />
              <el-option label="活动推广" value="activity" />
              <el-option label="节日祝福" value="festival" />
              <el-option label="日常分享" value="daily" />
              <el-option label="课程介绍" value="course" />
              <el-option label="师资介绍" value="teacher" />
              <el-option label="环境展示" value="environment" />
            </el-select>
          </el-form-item>

          <el-form-item label="内容主题">
            <el-input 
              v-model="formData.topic"
              placeholder="请输入具体主题，如：春季招生、亲子运动会等"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="文案风格">
            <el-radio-group v-model="formData.style">
              <el-radio value="warm">温馨亲切</el-radio>
              <el-radio value="professional">专业权威</el-radio>
              <el-radio value="lively">活泼有趣</el-radio>
              <el-radio value="concise">简洁明了</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="关键信息">
            <div class="key-info-section">
              <div class="basic-info-toggle">
                <el-checkbox
                  v-model="useBasicInfo"
                  @change="handleBasicInfoToggle"
                  style="margin-bottom: var(--spacing-2xl);"
                >
                  使用幼儿园基础信息
                </el-checkbox>
              </div>
              <el-input
                v-model="formData.keyInfo"
                type="textarea"
                :rows="3"
                placeholder="请输入需要突出的关键信息，如：地址、电话、优惠政策等"
                maxlength="500"
                show-word-limit
              />
            </div>
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
              :disabled="!canGenerate"
              size="large"
              style="width: 100%"
            >
              <el-icon><MagicStick /></el-icon>
              {{ generating ? 'AI创作中...' : '生成文案' }}
            </el-button>
          </el-form-item>
        </el-form>

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
      </div>

      <!-- 右侧预览面板 -->
      <div class="preview-panel">
        <div class="preview-header">
          <h4>文案预览</h4>
          <div class="preview-actions" v-if="generatedContent">
            <el-button size="small" @click="regenerate">
              <el-icon><Refresh /></el-icon>
              重新生成
            </el-button>
            <el-button size="small" @click="copyToClipboard">
              <el-icon><CopyDocument /></el-icon>
              复制文案
            </el-button>
            <el-button size="small" type="primary" @click="saveContent">
              <el-icon><Check /></el-icon>
              保存文案
            </el-button>
          </div>
        </div>

        <div class="preview-content">
          <div v-if="generating" class="generating-state">
            <el-icon class="loading-icon"><Loading /></el-icon>
            <p>AI正在为您创作文案...</p>
            <div class="progress-text">{{ progressText }}</div>
          </div>

          <div v-else-if="generatedContent" class="generated-content">
            <div class="platform-info">
              <el-tag>{{ getPlatformLabel(formData.platform) }}</el-tag>
              <el-tag type="success">{{ getTypeLabel(formData.type) }}</el-tag>
              <span class="word-count">{{ getContentWordCount(generatedContent) }}字</span>
            </div>

            <!-- 预览模式切换 -->
            <div class="preview-mode-selector">
              <el-radio-group v-model="previewMode" size="small">
                <el-radio-button value="text">📝 文本预览</el-radio-button>
                <el-radio-button value="wechat">📱 朋友圈预览</el-radio-button>
                <el-radio-button value="poster">🎨 海报预览</el-radio-button>
              </el-radio-group>
            </div>

            <!-- 文本预览 -->
            <div v-if="previewMode === 'text'" class="content-text wechat-style">
              <div class="content-preview">
                <div class="preview-label">📝 文案内容：</div>
                <div class="wechat-content">
                  {{ generatedContent }}
                </div>
              </div>
            </div>

            <!-- 微信朋友圈预览 -->
            <div v-else-if="previewMode === 'wechat'" class="wechat-preview-container">
              <WeChatMomentsPreview
                :content="generatedContent"
                :userName="schoolInfo.name"
                :userAvatar="schoolInfo.avatar"
                :images="previewImages"
              />
            </div>

            <!-- 海报预览 -->
            <div v-else-if="previewMode === 'poster'" class="poster-preview-container">
              <PosterPreview
                :content="generatedContent"
                :theme="posterTheme"
                :schoolName="schoolInfo.name"
                :logoUrl="schoolInfo.logo"
                :phone="schoolInfo.phone"
                :address="schoolInfo.address"
                @theme-change="handleThemeChange"
              />
            </div>

            <div class="content-analysis" v-if="contentAnalysis">
              <h5>📊 内容分析</h5>
              <div class="analysis-item">
                <span class="label">字数统计：</span>
                <span class="value">{{ getContentWordCount(generatedContent) }}字</span>
              </div>
              <div class="analysis-item">
                <span class="label">情感倾向：</span>
                <span class="value">{{ contentAnalysis.sentiment }}</span>
              </div>
              <div class="analysis-item">
                <span class="label">关键词：</span>
                <span class="value">{{ contentAnalysis.keywords?.join('、') }}</span>
              </div>
              <div class="analysis-item">
                <span class="label">优化建议：</span>
                <div class="suggestions">
                  <div v-for="suggestion in contentAnalysis.suggestions" :key="suggestion" class="suggestion-item">
                    • {{ suggestion }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <el-icon><Edit /></el-icon>
            <p>请填写左侧信息，开始AI文案创作</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  MagicStick,
  Refresh,
  CopyDocument,
  Check,
  Loading,
  Edit
} from '@element-plus/icons-vue'

// 导入AI API
import { AutoImageApi } from '@/api/auto-image'

// 导入预览组件
import WeChatMomentsPreview from '@/components/preview/WeChatMomentsPreview.vue'
import PosterPreview from '@/components/preview/PosterPreview.vue'

// 组件事件
const emit = defineEmits(['content-created'])

// 响应式数据
const generating = ref(false)
const generatedContent = ref('')
const contentAnalysis = ref(null)
const progressText = ref('')

// 预览相关数据
const previewMode = ref('wechat') // 'text' | 'wechat' | 'poster'
const posterTheme = ref('warm')
const previewImages = ref<string[]>([])

// 学校信息
const schoolInfo = ref({
  name: '阳光幼儿园',
  // 使用 1x1 透明 PNG 的 base64 编码作为占位符，避免404错误
  avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
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
const kindergartenInfo = ref(null)

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

// 方法
const handlePlatformChange = () => {
  console.log('平台变更:', formData.value.platform)
}

// 获取幼儿园基础信息
const fetchKindergartenInfo = async () => {
  try {
    const response = await request.get('/kindergartens/1')
    if (response.success && response.data) {
      kindergartenInfo.value = response.data
      // 更新学校信息用于预览
      schoolInfo.value = {
        name: response.data.name || '阳光幼儿园',
        avatar: response.data.logoUrl || schoolInfo.value.avatar,
        logo: response.data.logoUrl || schoolInfo.value.logo,
        phone: response.data.phone || response.data.consultationPhone || '400-123-4567',
        address: response.data.address || '北京市朝阳区xxx街道xxx号'
      }
    }
  } catch (error) {
    console.error('获取幼儿园信息失败:', error)
  }
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
  } else if (!checked) {
    // 移除基础信息
    const basicInfo = buildBasicInfoText()
    formData.value.keyInfo = formData.value.keyInfo.replace(basicInfo, '').replace(/^\n+/, '')
  }
}

// 构建基础信息文本
const buildBasicInfoText = () => {
  if (!kindergartenInfo.value) return ''

  const info = kindergartenInfo.value
  const parts = []

  if (info.name) parts.push(`园所名称：${info.name}`)
  if (info.address) parts.push(`地址：${info.address}`)
  if (info.phone) parts.push(`电话：${info.phone}`)
  if (info.consultationPhone && info.consultationPhone !== info.phone) {
    parts.push(`咨询电话：${info.consultationPhone}`)
  }
  if (info.principal) parts.push(`园长：${info.principal}`)
  if (info.description) {
    const shortDesc = info.description.length > 100
      ? info.description.substring(0, 100) + '...'
      : info.description
    parts.push(`园所简介：${shortDesc}`)
  }
  if (info.features) parts.push(`特色课程：${info.features}`)
  if (info.philosophy) parts.push(`办学理念：${info.philosophy}`)

  return parts.join('\n')
}

const generateCopywriting = async () => {
  if (!canGenerate.value) {
    ElMessage.warning('请填写完整信息')
    return
  }

  generating.value = true
  progressText.value = '正在连接AI专家...'

  try {
    // 调用真实的AI API
    progressText.value = '正在分析需求...'
    const result = await callAIExpert()

    if (result && result.success && result.message) {
      const aiResponse = result.message
      console.log('✅ AI生成结果:', aiResponse)

      // 解析AI响应并生成内容
      progressText.value = '正在解析生成结果...'
      generatedContent.value = parseAIResponse(aiResponse)
      contentAnalysis.value = generateAnalysisFromAI(aiResponse)

      ElMessage.success('文案生成成功！')
    } else {
      throw new Error('AI响应格式错误')
    }
  } catch (error) {
    console.error('❌ 文案生成失败:', error)
    ElMessage.error('生成失败，请重试')

    // 如果AI调用失败，回退到模拟内容
    console.log('🔄 回退到模拟内容生成...')
    await simulateGeneration()
    generatedContent.value = generateMockContent()
    contentAnalysis.value = generateMockAnalysis()
  } finally {
    generating.value = false
    progressText.value = ''
  }
}

// AI专家工具调用
const callAIExpert = async () => {
  const prompt = buildPrompt()
  console.log('🤖 调用AI专家生成文案:', prompt)

  const messages = [
    {
      role: 'user',
      content: prompt
    }
  ]

  try {
    const response = await fetch('/api/ai/expert/smart-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messages
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log('✅ AI专家响应:', result)

    return result
  } catch (error) {
    console.error('❌ AI专家调用失败:', error)
    throw error
  }
}

// 解析AI响应
const parseAIResponse = (aiResponse: string) => {
  try {
    // 尝试解析JSON格式的响应
    let parsedResponse
    try {
      parsedResponse = JSON.parse(aiResponse)
    } catch {
      // 如果不是JSON格式，按文本处理
      parsedResponse = null
    }

    let mainContent = ''
    let tags = []
    let publishTime = '建议在上午9-11点或下午3-5点发布'
    let engagement = '欢迎家长朋友们在评论区分享您的想法！'

    if (parsedResponse && typeof parsedResponse === 'object') {
      // 处理JSON格式的响应
      mainContent = parsedResponse.content || parsedResponse.text || parsedResponse.copywriting || ''
      tags = parsedResponse.tags || parsedResponse.hashtags || []
      publishTime = parsedResponse.publishTime || parsedResponse.timing || publishTime
      engagement = parsedResponse.engagement || parsedResponse.cta || engagement
    } else {
      // 处理纯文本响应
      const content = aiResponse.trim()
      const lines = content.split('\n').filter(line => line.trim())

      // 查找主要文案内容
      const contentLines = []
      const tagLines = []

      for (const line of lines) {
        if (line.startsWith('#')) {
          // 提取标签
          const tagMatches = line.match(/#[\u4e00-\u9fa5a-zA-Z0-9]+/g)
          if (tagMatches) {
            tagLines.push(...tagMatches.map(tag => tag.substring(1)))
          }
        } else if (!line.startsWith('**') && !line.includes('建议') && !line.includes('发布时间')) {
          contentLines.push(line)
        }
      }

      mainContent = contentLines.join('\n')
      tags = tagLines.length > 0 ? tagLines : ['幼儿园', '教育', '成长']
    }

    // 格式化为微信朋友圈适用的文本格式
    const formattedContent = formatForWeChatMoments(mainContent, tags, engagement)

    return formattedContent
  } catch (error) {
    console.error('解析AI响应失败:', error)
    // 返回格式化的默认内容
    return formatForWeChatMoments(
      aiResponse || '🌸 温馨提示：AI生成的精彩内容即将呈现！',
      ['幼儿园', '教育', '成长'],
      '欢迎家长朋友们在评论区分享您的想法！'
    )
  }
}

// 格式化为微信朋友圈格式
const formatForWeChatMoments = (content: string, tags: string[], engagement: string) => {
  let formattedText = ''

  // 主要内容
  if (content) {
    formattedText += content.trim()
  }

  // 添加换行和标签
  if (tags && tags.length > 0) {
    formattedText += '\n\n'
    formattedText += tags.map(tag => `#${tag}`).join(' ')
  }

  // 添加互动引导
  if (engagement) {
    formattedText += '\n\n'
    formattedText += engagement
  }

  // 添加一些适合朋友圈的emoji装饰
  if (formattedText && !formattedText.includes('🌸') && !formattedText.includes('✨')) {
    formattedText = '✨ ' + formattedText
  }

  return formattedText
}

// 从AI响应生成分析
const generateAnalysisFromAI = (aiResponse: string) => {
  const wordCount = aiResponse.length

  return {
    wordCount: wordCount,
    readingTime: Math.ceil(wordCount / 200),
    sentiment: '积极正面',
    keywords: ['幼儿园', '教育', '成长', '专业'],
    suggestions: [
      '内容温馨专业，符合幼儿园形象',
      '建议配合相关图片增强视觉效果',
      '可以在适当位置添加联系方式'
    ]
  }
}

const simulateGeneration = async () => {
  const steps = [
    '正在分析需求...',
    '正在匹配平台特色...',
    '正在生成创意内容...',
    '正在优化文案结构...',
    '正在完善细节...'
  ]

  for (let i = 0; i < steps.length; i++) {
    progressText.value = steps[i]
    await new Promise(resolve => setTimeout(resolve, 800))
  }
}

const buildPrompt = () => {
  const platformMap = {
    'wechat_moments': '微信朋友圈',
    'wechat_official': '微信公众号',
    'weibo': '微博',
    'xiaohongshu': '小红书',
    'douyin': '抖音',
    'kuaishou': '快手',
    'bilibili': 'B站'
  }

  const typeMap = {
    'enrollment': '招生宣传',
    'activity': '活动推广',
    'festival': '节日祝福',
    'daily': '日常分享',
    'education': '教育理念',
    'parenting': '育儿知识',
    'campus': '校园生活',
    'teacher': '教师风采'
  }

  const styleMap = {
    'warm': '温馨亲切',
    'professional': '专业权威',
    'lively': '活泼有趣',
    'concise': '简洁明了'
  }

  const platform = platformMap[formData.value.platform] || formData.value.platform
  const type = typeMap[formData.value.type] || formData.value.type
  const style = styleMap[formData.value.style] || formData.value.style

  return `你是一位专业的幼儿园新媒体运营专家，请为幼儿园创作一篇适合${platform}发布的${type}文案。

**创作要求：**
- 发布平台：${platform}
- 内容类型：${type}
- 主题：${formData.value.topic}
- 风格：${style}
- 关键信息：${formData.value.keyInfo}
- 字数要求：约${formData.value.wordCount}字

**平台特色要求：**
${getPlatformRequirements(formData.value.platform)}

**输出格式要求：**
请直接输出一段完整的、适合微信朋友圈发布的文案内容，包含：
1. 主要文案内容（温馨有趣，符合字数要求）
2. 在文案末尾添加3-5个相关话题标签（格式：#标签名）
3. 在最后添加一句互动引导语

**文案风格要求：**
- 语言温馨亲切，符合幼儿园形象
- 适当使用emoji表情符号增强表现力
- 内容要有吸引力，能够引起家长共鸣
- 语言自然流畅，适合朋友圈阅读
- 避免过度营销，注重情感共鸣

**示例格式：**
🌸春暖花开，正是孩子们成长的好时节！今天在幼儿园里，看到小朋友们认真学习的样子，真的很感动...

#幼儿园生活 #快乐成长 #教育分享

欢迎家长朋友们分享您家宝贝的成长故事！

请直接输出完整的文案内容，不要包含任何解释说明或格式标记。`
}

// 获取平台特色要求
const getPlatformRequirements = (platform: string) => {
  const requirements = {
    'wechat_moments': '- 适合朋友圈分享，内容要简洁有趣\n- 多使用emoji和图片配合\n- 避免过度营销，注重情感共鸣',
    'wechat_official': '- 内容可以相对详细，支持长文\n- 注重专业性和权威性\n- 可以包含更多教育理念和方法',
    'weibo': '- 内容要简洁明了，突出重点\n- 适当使用热门话题标签\n- 注重时效性和话题性',
    'xiaohongshu': '- 内容要精美有质感\n- 多使用emoji和分段\n- 注重实用性和分享价值',
    'douyin': '- 内容要生动有趣，适合视频配音\n- 语言要口语化，易于理解\n- 注重节奏感和吸引力',
    'kuaishou': '- 内容要真实接地气\n- 语言要朴实自然\n- 注重情感表达和共鸣',
    'bilibili': '- 内容要有趣有料\n- 可以适当使用网络用语\n- 注重知识性和娱乐性结合'
  }

  return requirements[platform] || '- 确保内容符合平台特色和用户习惯'
}

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
  const seasonOpening = getCurrentSeasonOpening()

  const descriptions = [
    `今天在${topic}中，看到小朋友们认真投入的样子，真的很感动。`,
    `${topic}圆满举行！孩子们的表现超出了我们的期待。`,
    `在${topic}现场，每个孩子都展现出了独特的魅力。`,
    `${topic}带给孩子们无限的欢乐和成长。`,
    `参加${topic}的小朋友们都收获满满！`
  ]

  // 随机选择一个描述，但基于主题内容保持一致性
  const index = topic.length % descriptions.length
  return descriptions[index]
}

const generateMockContent = () => {
  const seasonOpening = getCurrentSeasonOpening()
  const activityDesc = generateDynamicActivityDescription()
  const topic = formData.value.topic

  const contents = {
    enrollment: `${seasonOpening}

${topic}正在火热进行中！我们幼儿园环境优美，师资力量雄厚，采用先进的教育理念，为3-6岁的小朋友提供最优质的学前教育。

✨ 特色亮点：
🎨 创意美术课程，激发孩子想象力
🎵 音乐启蒙教育，培养艺术素养
🏃‍♀️ 户外体能训练，增强体质
📚 双语教学环境，开拓国际视野

现在报名享受早鸟优惠，还有精美礼品相送！
名额有限，欢迎预约参观！

📞 咨询电话：400-123-4567
📍 地址：XX市XX区XX路123号

#${topic} #幼儿园 #优质教育`,

    activity: `${seasonOpening}

🎉【${topic}】精彩回顾！

${activityDesc}他们专注的眼神，天真的笑容，每一个瞬间都让我们感受到教育的美好。

🎨 活动亮点：
• 孩子们积极参与，展现创造力
• 亲子互动温馨，增进感情
• 专业老师指导，寓教于乐
• 精彩瞬间记录，留下美好回忆

我们相信，每一个孩子都是独特的花朵，在阳光幼儿园这片沃土上，他们将绽放出最美丽的光彩！✨

#${topic} #幼儿园生活 #快乐成长

欢迎家长朋友们分享您家宝贝的成长故事！`,

    festival: `${seasonOpening}

🎊【${topic}】特别祝福！

感谢各位家长一直以来的信任与支持，在这个特殊的日子里，我们向所有的小朋友和家长们送上最真挚的祝福！

愿在这个美好的时刻：
🌟 每个小朋友都健康快乐成长
🌟 每个家庭都幸福美满
🌟 我们的大家庭更加温暖和谐

让我们一起期待更多精彩的活动和美好的时光！

#${topic} #幼儿园 #温馨祝福

祝愿大家节日快乐，万事如意！🎈`
  }

  return contents[formData.value.type as keyof typeof contents] || contents.enrollment
}

const generateMockAnalysis = () => {
  return {
    sentiment: '积极正面',
    keywords: ['幼儿园', '教育', '孩子', '家长', '活动'],
    scenarios: ['朋友圈分享', '群发推广', '官方宣传']
  }
}

const useTemplate = (template: any) => {
  Object.assign(formData.value, template.data)
  ElMessage.success('模板已应用')
}

const regenerate = () => {
  generateCopywriting()
}

const copyToClipboard = () => {
  if (navigator.clipboard && generatedContent.value) {
    navigator.clipboard.writeText(generatedContent.value).then(() => {
      ElMessage.success('文案已复制到剪贴板')
    }).catch(() => {
      ElMessage.error('复制失败')
    })
  }
}

const saveContent = () => {
  if (!generatedContent.value) return
  
  const content = {
    type: 'copywriting',
    title: formData.value.topic || '未命名文案',
    platform: getPlatformLabel(formData.value.platform),
    content: generatedContent.value,
    preview: generatedContent.value.substring(0, 100) + '...'
  }
  
  emit('content-created', content)
  ElMessage.success('文案已保存')
}

const getPlatformLabel = (platform: string) => {
  const labels = {
    'wechat_moments': '微信朋友圈',
    'weibo': '微博',
    'xiaohongshu': '小红书',
    'douyin': '抖音',
    'kuaishou': '快手',
    'toutiao': '今日头条',
    'qzone': 'QQ空间'
  }
  return labels[platform as keyof typeof labels] || platform
}

const getTypeLabel = (type: string) => {
  const labels = {
    'enrollment': '招生宣传',
    'activity': '活动推广',
    'festival': '节日祝福',
    'daily': '日常分享',
    'course': '课程介绍',
    'teacher': '师资介绍',
    'environment': '环境展示'
  }
  return labels[type as keyof typeof labels] || type
}

// 计算内容字数（排除emoji和特殊字符）
const getContentWordCount = (content: string) => {
  if (!content) return 0

  // 移除emoji和特殊符号，只计算中文、英文、数字
  const cleanContent = content
    .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
    .replace(/[#@\s\n\r]/g, '')
    .trim()

  return cleanContent.length
}

// 处理海报主题切换
const handleThemeChange = (theme: string) => {
  posterTheme.value = theme
}

// 页面初始化
onMounted(() => {
  console.log('文案创作组件已加载')
  fetchKindergartenInfo()
})
</script>

<style lang="scss" scoped>
.copywriting-creator {
  height: 100%;
  display: flex;
  flex-direction: column;

  .creator-header {
    padding: var(--text-3xl);
    background: white;
    border-bottom: var(--border-width-base) solid var(--bg-gray-light);

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
    overflow: hidden;

    .config-panel {
      width: 400px;
      background: white;
      border-radius: var(--text-sm);
      padding: var(--text-3xl);
      box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
      overflow-y: auto;

      .el-form {
        .el-form-item {
          margin-bottom: var(--text-2xl);

          .el-select,
          .el-input {
            width: 100%;
          }
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

      .quick-templates {
        margin-top: var(--spacing-3xl);
        padding-top: var(--text-3xl);
        border-top: var(--border-width-base) solid var(--bg-gray-light);

        h4 {
          margin: 0 0 var(--text-lg) 0;
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--text-primary);
        }

        .template-list {
          .template-item {
            padding: var(--text-sm);
            border: var(--border-width-base) solid #e9ecef;
            border-radius: var(--spacing-sm);
            margin-bottom: var(--spacing-sm);
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
              border-color: var(--primary-color);
              background: #f0f7ff;
            }

            .template-title {
              font-size: var(--text-base);
              font-weight: 500;
              color: var(--text-primary);
              margin-bottom: var(--spacing-xs);
            }

            .template-desc {
              font-size: var(--text-sm);
              color: var(--info-color);
            }
          }
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
        border-bottom: var(--border-width-base) solid var(--bg-gray-light);

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
          height: 300px;
          text-align: center;

          .loading-icon {
            font-size: var(--text-5xl);
            color: var(--primary-color);
            animation: spin 2s linear infinite;
            margin-bottom: var(--text-lg);
          }

          p {
            margin: 0 0 var(--spacing-sm) 0;
            font-size: var(--text-lg);
            color: var(--text-primary);
          }

          .progress-text {
            font-size: var(--text-base);
            color: var(--info-color);
          }
        }

        .generated-content {
          .platform-info {
            display: flex;
            align-items: center;
            gap: var(--text-sm);
            margin-bottom: var(--text-2xl);

            .word-count {
              font-size: var(--text-base);
              color: var(--info-color);
            }
          }

          .content-text {
            margin-bottom: var(--text-3xl);

            &.wechat-style {
              .content-preview {
                background: var(--bg-gray-light);
                border-radius: var(--text-sm);
                padding: var(--text-2xl);
                border: var(--border-width-base) solid #e9ecef;

                .preview-label {
                  font-size: var(--text-base);
                  color: var(--text-regular);
                  margin-bottom: var(--text-sm);
                  font-weight: 500;
                }

                .wechat-content {
                  background: white;
                  border-radius: var(--spacing-sm);
                  padding: var(--text-lg);
                  line-height: 1.6;
                  font-size: var(--text-base);
                  color: var(--text-primary);
                  white-space: pre-line;
                  box-shadow: 0 var(--border-width-base) 3px var(--shadow-light);
                  border-left: 3px solid #07c160;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
                }
              }
            }
          }

          .preview-mode-selector {
            margin-bottom: var(--text-2xl);
            text-align: center;

            .el-radio-group {
              background: var(--bg-gray-light);
              border-radius: var(--spacing-sm);
              padding: var(--spacing-xs);
            }
          }

          .wechat-preview-container {
            display: flex;
            justify-content: center;
            margin-bottom: var(--text-3xl);
            padding: var(--text-2xl);
            background: var(--bg-gray-light);
            border-radius: var(--text-sm);
          }

          .poster-preview-container {
            display: flex;
            justify-content: center;
            margin-bottom: var(--text-3xl);
            padding: var(--text-2xl);
            background: var(--bg-gray-light);
            border-radius: var(--text-sm);
          }

          .content-analysis {
            background: #f0f7ff;
            border-radius: var(--spacing-sm);
            padding: var(--text-lg);

            h5 {
              margin: 0 0 var(--text-sm) 0;
              font-size: var(--text-base);
              font-weight: 600;
              color: var(--text-primary);
            }

            .analysis-item {
              display: flex;
              margin-bottom: var(--spacing-sm);
              font-size: var(--text-base);

              &:last-child {
                margin-bottom: 0;
              }

              .label {
                color: var(--text-regular);
                min-width: 80px;
                flex-shrink: 0;
              }

              .value {
                color: var(--text-primary);
                flex: 1;
              }

              .suggestions {
                flex: 1;

                .suggestion-item {
                  margin-bottom: var(--spacing-xs);
                  color: var(--text-regular);
                  font-size: var(--text-sm);
                  line-height: 1.4;

                  &:last-child {
                    margin-bottom: 0;
                  }
                }
              }
                width: 80px;
                flex-shrink: 0;
              }

              .value {
                color: var(--text-primary);
                flex: 1;
              }
            }
          }
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
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

// 响应式设计
@media (max-width: var(--breakpoint-lg)) {
  .copywriting-creator {
    .creator-content {
      flex-direction: column;

      .config-panel {
        width: 100%;
        max-height: 400px;
      }

      .preview-panel {
        min-height: 400px;
      }
    }
  }
}
</style>
