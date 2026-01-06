<template>
  <div class="article-creator">
    <div class="creator-header">
      <h3>AI图文创作</h3>
      <p>生成图文并茂的推广内容，包含配图建议和排版方案</p>
    </div>

    <div class="creator-content">
      <!-- 左侧配置面板 -->
      <div class="config-panel">
        <el-form :model="formData" label-width="100px" @submit.prevent>
          <el-form-item label="发布平台">
            <el-select v-model="formData.platform" placeholder="选择发布平台">
              <el-option label="微信公众号" value="wechat_official" />
              <el-option label="小红书" value="xiaohongshu" />
              <el-option label="知乎" value="zhihu" />
              <el-option label="今日头条" value="toutiao" />
              <el-option label="百家号" value="baijiahao" />
              <el-option label="搜狐号" value="sohu" />
            </el-select>
          </el-form-item>

          <el-form-item label="内容类型">
            <el-select v-model="formData.type" placeholder="选择内容类型">
              <el-option label="招生宣传" value="enrollment" />
              <el-option label="活动推广" value="activity" />
              <el-option label="教育理念" value="education" />
              <el-option label="课程介绍" value="course" />
              <el-option label="师资介绍" value="teacher" />
              <el-option label="环境展示" value="environment" />
              <el-option label="家长分享" value="parent_share" />
            </el-select>
          </el-form-item>

          <el-form-item label="文章标题">
            <el-input 
              v-model="formData.title"
              placeholder="请输入文章标题"
              maxlength="50"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="核心内容">
            <div class="content-section">
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
                v-model="formData.content"
                type="textarea"
                :rows="4"
                placeholder="请描述要表达的核心内容和要点"
                maxlength="800"
                show-word-limit
              />
            </div>
          </el-form-item>

          <el-form-item label="文章长度">
            <el-radio-group v-model="formData.length">
              <el-radio value="short">短文（500-800字）</el-radio>
              <el-radio value="medium">中文（800-1500字）</el-radio>
              <el-radio value="long">长文（1500-3000字）</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="配图需求">
            <el-checkbox-group v-model="formData.imageTypes">
              <el-checkbox value="cover">封面图</el-checkbox>
              <el-checkbox value="content">内容配图</el-checkbox>
              <el-checkbox value="ending">结尾图</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item>
            <el-button 
              type="primary" 
              @click="generateArticle"
              :loading="generating"
              :disabled="!canGenerate"
              size="large"
              style="width: 100%"
            >
              <el-icon><MagicStick /></el-icon>
              {{ generating ? 'AI创作中...' : '生成图文' }}
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
          <h4>图文预览</h4>
          <div class="preview-actions" v-if="generatedArticle">
            <el-button size="small" @click="regenerate">
              <el-icon><Refresh /></el-icon>
              重新生成
            </el-button>
            <el-button size="small" @click="exportArticle">
              <el-icon><Download /></el-icon>
              导出文档
            </el-button>
            <el-button size="small" type="primary" @click="saveContent">
              <el-icon><Check /></el-icon>
              保存图文
            </el-button>
          </div>
        </div>

        <div class="preview-content">
          <div v-if="generating" class="generating-state">
            <el-icon class="loading-icon"><Loading /></el-icon>
            <p>AI正在为您创作图文内容...</p>
            <div class="progress-text">{{ progressText }}</div>
          </div>

          <div v-else-if="generatedArticle" class="generated-article">
            <!-- 文章标题 -->
            <h2 class="article-title">{{ generatedArticle.title }}</h2>
            
            <!-- 文章信息 -->
            <div class="article-meta">
              <el-tag>{{ getPlatformLabel(formData.platform) }}</el-tag>
              <el-tag type="success">{{ getTypeLabel(formData.type) }}</el-tag>
              <span class="word-count">约{{ generatedArticle.wordCount }}字</span>
            </div>

            <!-- 生成的配图 -->
            <div v-if="generatedArticle.generatedImages?.length" class="generated-images-section">
              <h4>AI生成的配图 ({{ generatedArticle.imageCount }}张)</h4>
              <div class="generated-images">
                <div
                  v-for="(image, index) in generatedArticle.generatedImages"
                  :key="index"
                  class="generated-image-item"
                >
                  <div class="image-container">
                    <img :src="image.url" :alt="image.description" />
                    <div class="image-overlay">
                      <el-button size="small" @click="downloadImage(image.url)">下载</el-button>
                      <el-button size="small" @click="copyImageUrl(image.url)">复制链接</el-button>
                    </div>
                  </div>
                  <div class="image-info">
                    <p class="image-type">{{ getImageTypeLabel(image.type) }}</p>
                    <p class="image-desc">{{ image.description }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 文章正文 -->
            <div class="article-content">
              <div v-html="generatedArticle.content"></div>
            </div>

            <!-- 配图建议（如果没有生成图片时显示） -->
            <div v-if="!generatedArticle.generatedImages?.length && generatedArticle.images?.length" class="images-section">
              <h4>配图建议</h4>
              <div class="image-suggestions">
                <div
                  v-for="(image, index) in generatedArticle.images"
                  :key="index"
                  class="image-item"
                >
                  <div class="image-placeholder">
                    <el-icon><Picture /></el-icon>
                    <p>图{{ index + 1 }}</p>
                  </div>
                  <div class="image-desc">{{ image }}</div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <el-icon><Document /></el-icon>
            <p>请填写左侧信息，开始AI图文创作</p>
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
  Download,
  Check,
  Loading,
  Document,
  Picture
} from '@element-plus/icons-vue'

// 导入文生图API
import { AutoImageApi } from '@/api/auto-image'

// 导入request工具用于API调用
import { request } from '@/utils/request'

// 创建API实例
const autoImageApi = new AutoImageApi()

// 组件事件
const emit = defineEmits(['content-created'])

// 响应式数据
const generating = ref(false)
const generatedArticle = ref(null)
const progressText = ref('')

// 表单数据
const formData = ref({
  platform: '',
  type: '',
  title: '',
  content: '',
  length: 'medium',
  imageTypes: ['cover', 'content']
})

// 基础信息相关
const useBasicInfo = ref(false)
const kindergartenInfo = ref(null)

// 快速模板
const quickTemplates = ref([
  {
    id: 1,
    title: '招生宣传图文',
    description: '幼儿园招生宣传长图文',
    data: {
      platform: 'wechat_official',
      type: 'enrollment',
      title: '春季招生开始啦！',
      content: '介绍幼儿园的教育理念、师资力量、环境设施等',
      length: 'medium'
    }
  },
  {
    id: 2,
    title: '活动回顾图文',
    description: '活动精彩回顾图文',
    data: {
      platform: 'xiaohongshu',
      type: 'activity',
      title: '亲子运动会精彩回顾',
      content: '记录活动精彩瞬间，分享孩子们的快乐时光',
      length: 'short'
    }
  }
])

// 计算属性
const canGenerate = computed(() => {
  return formData.value.platform && formData.value.type && formData.value.title && formData.value.content
})

// 方法
// 获取幼儿园基础信息
const fetchKindergartenInfo = async () => {
  try {
    const response = await request.get('/kindergartens/1')
    if (response.success && response.data) {
      kindergartenInfo.value = response.data
    }
  } catch (error) {
    console.error('获取幼儿园信息失败:', error)
  }
}

// 处理基础信息勾选
const handleBasicInfoToggle = (checked: boolean) => {
  if (checked && kindergartenInfo.value) {
    const basicInfo = buildBasicInfoText()
    if (formData.value.content) {
      formData.value.content = basicInfo + '\n\n' + formData.value.content
    } else {
      formData.value.content = basicInfo
    }
  } else if (!checked) {
    // 移除基础信息
    const basicInfo = buildBasicInfoText()
    formData.value.content = formData.value.content.replace(basicInfo, '').replace(/^\n+/, '')
  }
}

// 构建基础信息文本
const buildBasicInfoText = () => {
  if (!kindergartenInfo.value) return ''

  const info = kindergartenInfo.value
  const parts = []

  if (info.name) parts.push(`【园所名称】${info.name}`)
  if (info.address) parts.push(`【园所地址】${info.address}`)
  if (info.phone) parts.push(`【联系电话】${info.phone}`)
  if (info.consultationPhone && info.consultationPhone !== info.phone) {
    parts.push(`【咨询电话】${info.consultationPhone}`)
  }
  if (info.principal) parts.push(`【园长】${info.principal}`)
  if (info.description) {
    const shortDesc = info.description.length > 150
      ? info.description.substring(0, 150) + '...'
      : info.description
    parts.push(`【园所简介】${shortDesc}`)
  }
  if (info.features) parts.push(`【特色课程】${info.features}`)
  if (info.philosophy) parts.push(`【办学理念】${info.philosophy}`)

  return parts.join('\n')
}

const generateArticle = async () => {
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
      console.log('✅ AI生成图文结果:', aiResponse)

      // 解析AI响应并生成内容
      progressText.value = '正在解析生成结果...'
      const parsedArticle = parseAIArticleResponse(aiResponse)

      // 生成配图
      progressText.value = '正在生成配图...'
      const articleWithImages = await generateArticleImages(parsedArticle)

      generatedArticle.value = articleWithImages

      // 根据图片生成结果显示不同的成功消息
      if (articleWithImages.imageCount > 0) {
        ElMessage.success(`图文生成成功！已生成 ${articleWithImages.imageCount} 张配图`)
      } else {
        ElMessage.success('图文生成成功！（配图生成失败，已提供文字建议）')
      }
    } else {
      throw new Error('AI响应格式错误')
    }
  } catch (error) {
    console.error('❌ 图文生成失败:', error)
    ElMessage.error('生成失败，请重试')

    // 如果AI调用失败，回退到模拟内容
    console.log('🔄 回退到模拟内容生成...')
    await simulateGeneration()
    generatedArticle.value = generateMockArticle()
  } finally {
    generating.value = false
    progressText.value = ''
  }
}

// AI专家工具调用
const callAIExpert = async () => {
  const prompt = buildArticlePrompt()
  console.log('🤖 调用AI专家生成图文:', prompt)

  const messages = [
    {
      role: 'user',
      content: prompt
    }
  ]

  try {
    // 使用request工具调用AI API，会自动添加认证token
    const result = await request.post('/ai/expert/smart-chat', {
      messages: messages
    })

    console.log('✅ AI专家响应:', result)

    return result
  } catch (error) {
    console.error('❌ AI专家调用失败:', error)
    throw error
  }
}

// 构建图文创作提示词
const buildArticlePrompt = () => {
  const platformMap = {
    'wechat_official': '微信公众号',
    'xiaohongshu': '小红书',
    'zhihu': '知乎',
    'toutiao': '今日头条',
    'weibo': '微博'
  }

  const typeMap = {
    'education': '教育理念',
    'parenting': '育儿知识',
    'activity': '活动报道',
    'campus': '校园生活',
    'teacher': '教师风采',
    'child_development': '儿童发展'
  }

  const lengthMap = {
    'short': '800-1200字',
    'medium': '1200-2000字',
    'long': '2000-3000字'
  }

  const platform = platformMap[formData.value.platform] || formData.value.platform
  const type = typeMap[formData.value.type] || formData.value.type
  const length = lengthMap[formData.value.length] || formData.value.length
  const imageReqs = formData.value.imageTypes?.join('、') || '无特殊要求'

  return `你是一位专业的幼儿园新媒体内容创作专家，请为幼儿园创作一篇${platform}的${type}图文内容。

**创作要求：**
- 发布平台：${platform}
- 内容类型：${type}
- 文章标题：${formData.value.title}
- 核心内容：${formData.value.content}
- 文章长度：${length}
- 配图需求：${imageReqs}

**输出格式：**
请提供以下内容：
1. 完整的文章内容（包含标题、正文、结尾）
2. 配图建议（描述每张图片的内容和位置）
3. 排版建议（段落结构、重点标注等）
4. SEO关键词建议
5. 互动元素建议（投票、问答等）

**注意事项：**
- 确保内容专业有趣，图文并茂
- 语言要温馨专业，符合幼儿园形象
- 内容要有教育价值，能够吸引家长关注
- 适当使用emoji和格式化文本增强可读性
- 包含适当的互动引导

请直接输出图文内容，不需要额外的解释说明。`
}

// 解析AI图文响应
const parseAIArticleResponse = (aiResponse: string) => {
  try {
    const content = aiResponse.trim()

    // 分割内容为不同部分
    const sections = content.split('\n\n').filter(section => section.trim())

    // 提取主要内容
    let mainContent = content
    let imageDescriptions = []
    let layoutSuggestions = []
    let keywords = []

    // 简单的内容解析
    for (const section of sections) {
      if (section.includes('配图') || section.includes('图片')) {
        imageDescriptions.push(section)
      } else if (section.includes('排版') || section.includes('格式')) {
        layoutSuggestions.push(section)
      } else if (section.includes('关键词') || section.includes('SEO')) {
        const keywordMatches = section.match(/[\u4e00-\u9fa5]{2,}/g)
        if (keywordMatches) {
          keywords.push(...keywordMatches.slice(0, 5))
        }
      }
    }

    return {
      content: mainContent,
      images: imageDescriptions.length > 0 ? imageDescriptions : [
        '封面图：展示文章主题的温馨画面',
        '内容配图：相关的教育场景或活动照片',
        '结尾图：幼儿园logo或联系方式'
      ],
      layout: layoutSuggestions.length > 0 ? layoutSuggestions : [
        '使用清晰的段落结构',
        '重要信息用加粗或颜色突出',
        '适当使用列表和分点说明'
      ],
      seo: keywords.length > 0 ? keywords : ['幼儿园', '教育', '儿童发展', '家长'],
      engagement: ['文末添加互动问题', '鼓励家长分享经验', '提供咨询联系方式']
    }
  } catch (error) {
    console.error('解析AI图文响应失败:', error)
    return {
      content: aiResponse,
      images: ['封面图：展示文章主题', '内容配图：相关场景照片'],
      layout: ['清晰的段落结构', '重点信息突出显示'],
      seo: ['幼儿园', '教育', '儿童发展'],
      engagement: ['文末互动问题', '鼓励分享']
    }
  }
}

// 生成文章配图
const generateArticleImages = async (article: any) => {
  try {
    console.log('🎨 开始生成文章配图...')

    const imagePromises = []
    const generatedImages = []

    // 根据用户选择的配图需求生成图片（优化：逐个生成避免并发限制）
    if (formData.value.imageTypes.includes('cover')) {
      console.log('🎨 生成封面图...')
      const coverPrompt = `${formData.value.title || ''} ${formData.value.content || ''}`.trim()

      const coverImagePromise = autoImageApi.generateImage({
        prompt: coverPrompt,
        category: 'poster',
        style: 'natural',
        size: '1024x768',
        quality: 'hd',
        watermark: false
      }).then(response => {
        if (response.success && response.data.imageUrl) {
          console.log('✅ 封面图生成成功:', response.data.imageUrl)
          return {
            type: 'cover',
            url: response.data.imageUrl,
            description: '文章封面图',
            prompt: coverPrompt
          }
        }
        return null
      }).catch(error => {
        console.error('❌ 封面图生成失败:', error)
        // 提供更详细的错误信息
        if (error.message?.includes('timeout')) {
          console.error('封面图生成超时，可能是网络问题或AI服务繁忙')
        }
        return null
      })

      imagePromises.push(coverImagePromise)
    }

    if (formData.value.imageTypes.includes('content')) {
      console.log('🎨 生成内容配图...')
      const contentPrompt = `${formData.value.title || ''} ${formData.value.content || ''}`.trim()

      const contentImagePromise = autoImageApi.generateImage({
        prompt: contentPrompt,
        category: 'activity',
        style: 'natural',
        size: '1024x768',
        quality: 'standard',
        watermark: false
      }).then(response => {
        if (response.success && response.data.imageUrl) {
          console.log('✅ 内容配图生成成功:', response.data.imageUrl)
          return {
            type: 'content',
            url: response.data.imageUrl,
            description: '文章内容配图',
            prompt: contentPrompt
          }
        }
        return null
      }).catch(error => {
        console.error('❌ 内容配图生成失败:', error)
        return null
      })

      imagePromises.push(contentImagePromise)
    }

    if (formData.value.imageTypes.includes('ending')) {
      console.log('🎨 生成结尾图...')
      const endingPrompt = `幼儿园logo设计，联系我们，咨询报名，温馨提示，简洁设计`

      const endingImagePromise = autoImageApi.generateImage({
        prompt: endingPrompt,
        category: 'template',
        style: 'natural',
        size: '1024x512',
        quality: 'standard',
        watermark: false
      }).then(response => {
        if (response.success && response.data.imageUrl) {
          console.log('✅ 结尾图生成成功:', response.data.imageUrl)
          return {
            type: 'ending',
            url: response.data.imageUrl,
            description: '文章结尾图',
            prompt: endingPrompt
          }
        }
        return null
      }).catch(error => {
        console.error('❌ 结尾图生成失败:', error)
        return null
      })

      imagePromises.push(endingImagePromise)
    }

    // 等待所有图片生成完成（使用 allSettled 避免单个失败影响整体）
    const results = await Promise.allSettled(imagePromises)
    const validImages = results
      .filter(result => result.status === 'fulfilled' && result.value !== null)
      .map(result => (result as PromiseFulfilledResult<any>).value)

    const failedCount = results.length - validImages.length
    if (failedCount > 0) {
      console.warn(`⚠️ ${failedCount} 张图片生成失败，成功生成 ${validImages.length} 张配图`)
    } else {
      console.log(`✅ 成功生成 ${validImages.length} 张配图`)
    }

    // 将生成的图片添加到文章中
    return {
      ...article,
      generatedImages: validImages,
      imageCount: validImages.length
    }

  } catch (error) {
    console.error('❌ 配图生成过程失败:', error)
    // 如果配图生成失败，返回原文章内容
    return {
      ...article,
      generatedImages: [],
      imageCount: 0
    }
  }
}

const simulateGeneration = async () => {
  const steps = [
    '正在分析需求...',
    '正在构思文章结构...',
    '正在生成文章内容...',
    '正在设计配图方案...',
    '正在优化排版布局...'
  ]

  for (let i = 0; i < steps.length; i++) {
    progressText.value = steps[i]
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}

const generateMockArticle = () => {
  return {
    title: formData.value.title,
    wordCount: formData.value.length === 'short' ? 650 : formData.value.length === 'medium' ? 1200 : 2100,
    coverImage: formData.value.imageTypes.includes('cover') ? {
      description: '温馨的幼儿园环境，孩子们在快乐玩耍',
      size: '900x500px',
      style: '温馨明亮',
      elements: '幼儿园建筑、绿植、孩子们'
    } : null,
    content: `
      <h3>🌟 为什么选择我们？</h3>
      <p>我们幼儿园秉承"快乐成长，全面发展"的教育理念，为每一个孩子提供最优质的学前教育服务。</p>
      
      <h3>🎨 特色课程</h3>
      <p>• <strong>创意美术</strong>：激发孩子的想象力和创造力</p>
      <p>• <strong>音乐启蒙</strong>：培养孩子的艺术素养</p>
      <p>• <strong>体能训练</strong>：增强孩子的身体素质</p>
      <p>• <strong>双语教学</strong>：开拓孩子的国际视野</p>
      
      <h3>👩‍🏫 师资力量</h3>
      <p>我们拥有一支专业、爱心、责任心强的教师团队，每位老师都具备专业的学前教育背景和丰富的教学经验。</p>
      
      <h3>🏫 环境设施</h3>
      <p>园区环境优美，设施齐全，为孩子们提供安全、舒适的学习和生活环境。</p>
      
      <h3>📞 联系我们</h3>
      <p>如果您对我们的幼儿园感兴趣，欢迎随时联系我们，我们将竭诚为您服务！</p>
    `,
    contentImages: formData.value.imageTypes.includes('content') ? [
      { description: '孩子们在美术课上认真创作的场景' },
      { description: '音乐课上孩子们快乐歌唱的画面' },
      { description: '户外体能训练的精彩瞬间' }
    ] : []
  }
}

const useTemplate = (template: any) => {
  Object.assign(formData.value, template.data)
  ElMessage.success('模板已应用')
}

const regenerate = () => {
  generateArticle()
}

const exportArticle = () => {
  ElMessage.info('导出功能开发中...')
}

const saveContent = () => {
  if (!generatedArticle.value) return
  
  const content = {
    type: 'article',
    title: generatedArticle.value.title,
    platform: getPlatformLabel(formData.value.platform),
    content: generatedArticle.value.content,
    preview: `${generatedArticle.value.title} - ${generatedArticle.value.wordCount}字图文内容`
  }
  
  emit('content-created', content)
  ElMessage.success('图文已保存')
}

const getPlatformLabel = (platform: string) => {
  const labels = {
    'wechat_official': '微信公众号',
    'xiaohongshu': '小红书',
    'zhihu': '知乎',
    'toutiao': '今日头条',
    'baijiahao': '百家号',
    'sohu': '搜狐号'
  }
  return labels[platform as keyof typeof labels] || platform
}

const getTypeLabel = (type: string) => {
  const labels = {
    'enrollment': '招生宣传',
    'activity': '活动推广',
    'education': '教育理念',
    'course': '课程介绍',
    'teacher': '师资介绍',
    'environment': '环境展示',
    'parent_share': '家长分享'
  }
  return labels[type as keyof typeof labels] || type
}

// 获取图片类型标签
const getImageTypeLabel = (type: string) => {
  const labels = {
    'cover': '封面图',
    'content': '内容配图',
    'ending': '结尾图'
  }
  return labels[type as keyof typeof labels] || type
}

// 下载图片
const downloadImage = (imageUrl: string) => {
  const link = document.createElement('a')
  link.href = imageUrl
  link.download = `generated-image-${Date.now()}.jpg`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  ElMessage.success('图片下载已开始')
}

// 复制图片链接
const copyImageUrl = async (imageUrl: string) => {
  try {
    await navigator.clipboard.writeText(imageUrl)
    ElMessage.success('图片链接已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败，请手动复制')
  }
}

// 页面初始化
onMounted(() => {
  console.log('图文创作组件已加载')
  fetchKindergartenInfo()
})
</script>

<style lang="scss" scoped>
.article-creator {
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

        .generated-article {
          .article-title {
            margin: 0 0 var(--text-lg) 0;
            font-size: var(--text-3xl);
            font-weight: 600;
            color: var(--text-primary);
            line-height: 1.4;
          }

          .article-meta {
            display: flex;
            align-items: center;
            gap: var(--text-sm);
            margin-bottom: var(--text-3xl);
            padding-bottom: var(--text-lg);
            border-bottom: var(--border-width-base) solid var(--bg-gray-light);

            .word-count {
              font-size: var(--text-base);
              color: var(--info-color);
            }
          }

          .generated-images-section {
            margin-bottom: var(--spacing-3xl);

            h4 {
              margin: 0 0 var(--text-lg) 0;
              font-size: var(--text-lg);
              font-weight: 600;
              color: var(--text-primary);
            }

            .generated-images {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
              gap: var(--text-2xl);

              .generated-image-item {
                background: var(--bg-gray-light);
                border-radius: var(--text-sm);
                overflow: hidden;
                box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);

                .image-container {
                  position: relative;
                  width: 100%;
                  height: 200px;
                  overflow: hidden;

                  img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.3s ease;
                  }

                  &:hover img {
                    transform: scale(1.05);
                  }

                  .image-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: var(--black-alpha-70);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: var(--spacing-sm);
                    opacity: 0;
                    transition: opacity 0.3s ease;

                    .el-button {
                      background: var(--white-alpha-90);
                      border: none;
                      color: var(--text-primary);

                      &:hover {
                        background: white;
                      }
                    }
                  }

                  &:hover .image-overlay {
                    opacity: 1;
                  }
                }

                .image-info {
                  padding: var(--text-sm);

                  .image-type {
                    margin: 0 0 var(--spacing-xs) 0;
                    font-size: var(--text-base);
                    font-weight: 600;
                    color: var(--primary-color);
                  }

                  .image-desc {
                    margin: 0;
                    font-size: var(--text-sm);
                    color: var(--text-regular);
                    line-height: 1.4;
                  }
                }
              }
            }
          }

          .cover-section {
            margin-bottom: var(--spacing-3xl);

            h4 {
              margin: 0 0 var(--text-lg) 0;
              font-size: var(--text-lg);
              font-weight: 600;
              color: var(--text-primary);
            }

            .image-suggestion {
              display: flex;
              gap: var(--text-lg);
              padding: var(--text-lg);
              background: var(--bg-gray-light);
              border-radius: var(--spacing-sm);

              .image-placeholder {
                width: 120px;
                height: 80px;
                background: #e9ecef;
                border-radius: var(--radius-md);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: var(--info-color);

                .el-icon {
                  font-size: var(--text-3xl);
                  margin-bottom: var(--spacing-xs);
                }

                p {
                  margin: 0;
                  font-size: var(--text-sm);
                  text-align: center;
                  padding: 0 var(--spacing-sm);
                }
              }

              .image-details {
                flex: 1;

                p {
                  margin: 0 0 var(--spacing-sm) 0;
                  font-size: var(--text-base);
                  color: var(--text-regular);

                  &:last-child {
                    margin-bottom: 0;
                  }

                  strong {
                    color: var(--text-primary);
                  }
                }
              }
            }
          }

          .article-content {
            margin-bottom: var(--spacing-3xl);
            line-height: 1.8;

            :deep(h3) {
              margin: var(--text-3xl) 0 var(--text-sm) 0;
              font-size: var(--text-xl);
              font-weight: 600;
              color: var(--text-primary);
            }

            :deep(p) {
              margin: 0 0 var(--text-lg) 0;
              font-size: var(--text-base);
              color: var(--text-primary);
            }

            :deep(strong) {
              color: var(--primary-color);
              font-weight: 600;
            }
          }

          .images-section {
            h4 {
              margin: 0 0 var(--text-lg) 0;
              font-size: var(--text-lg);
              font-weight: 600;
              color: var(--text-primary);
            }

            .image-suggestions {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: var(--text-lg);

              .image-item {
                padding: var(--text-lg);
                background: var(--bg-gray-light);
                border-radius: var(--spacing-sm);
                text-align: center;

                .image-placeholder {
                  width: 100%;
                  height: 120px;
                  background: #e9ecef;
                  border-radius: var(--radius-md);
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  color: var(--info-color);
                  margin-bottom: var(--text-sm);

                  .el-icon {
                    font-size: var(--spacing-3xl);
                    margin-bottom: var(--spacing-sm);
                  }

                  p {
                    margin: 0;
                    font-size: var(--text-base);
                  }
                }

                .image-desc {
                  font-size: var(--text-base);
                  color: var(--text-regular);
                  line-height: 1.4;
                }
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
  .article-creator {
    .creator-content {
      flex-direction: column;

      .config-panel {
        width: 100%;
        max-height: 400px;
      }

      .preview-panel {
        min-height: 500px;
      }
    }
  }
}
</style>
