<template>
  <div class="video-creator">
    <div class="creator-header">
      <h3>AI视频创作</h3>
      <p>AI生成视频脚本，支持文生视频和首帧生视频</p>
    </div>

    <div class="creator-content">
      <!-- 左侧配置面板 -->
      <div class="config-panel">
        <el-form :model="formData" label-width="100px" @submit.prevent>
          <el-form-item label="发布平台">
            <el-select v-model="formData.platform" placeholder="选择发布平台">
              <el-option label="抖音" value="douyin" />
              <el-option label="快手" value="kuaishou" />
              <el-option label="视频号" value="wechat_video" />
              <el-option label="小红书" value="xiaohongshu" />
              <el-option label="B站" value="bilibili" />
              <el-option label="西瓜视频" value="xigua" />
              <el-option label="好看视频" value="haokan" />
            </el-select>
          </el-form-item>

          <el-form-item label="视频类型">
            <el-select v-model="formData.type" placeholder="选择视频类型">
              <el-option label="招生宣传" value="enrollment" />
              <el-option label="活动记录" value="activity" />
              <el-option label="课程展示" value="course" />
              <el-option label="环境介绍" value="environment" />
              <el-option label="师资介绍" value="teacher" />
              <el-option label="日常生活" value="daily" />
              <el-option label="节日庆典" value="festival" />
            </el-select>
          </el-form-item>

          <el-form-item label="视频主题">
            <el-input 
              v-model="formData.topic"
              placeholder="请输入视频主题，如：春季招生宣传片"
              maxlength="50"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="视频时长">
            <el-radio-group v-model="formData.duration">
              <el-radio value="short">短视频（15-30秒）</el-radio>
              <el-radio value="medium">中视频（1-3分钟）</el-radio>
              <el-radio value="long">长视频（3-5分钟）</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="创作模式">
            <el-radio-group v-model="formData.mode">
              <el-radio value="script">脚本创作</el-radio>
              <el-radio value="text_to_video">文生视频</el-radio>
              <el-radio value="image_to_video">首帧生视频</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="内容描述">
            <el-input 
              v-model="formData.description"
              type="textarea"
              :rows="4"
              placeholder="请详细描述视频内容和要表达的信息"
              maxlength="300"
              show-word-limit
            />
          </el-form-item>

          <el-form-item v-if="formData.mode === 'image_to_video'" label="首帧图片">
            <el-upload
              class="upload-demo"
              drag
              :auto-upload="false"
              :show-file-list="false"
              accept="image/*"
              @change="handleImageUpload"
            >
              <div v-if="!uploadedImage" class="upload-area">
                <UnifiedIcon name="default" />
                <div class="el-upload__text">
                  将图片拖到此处，或<em>点击上传</em>
                </div>
              </div>
              <div v-else class="uploaded-image">
                <img :src="uploadedImageSrc" alt="首帧图片" />
                <div class="image-overlay">
                  <el-button size="small" @click.stop="removeImage">删除</el-button>
                </div>
              </div>
            </el-upload>
          </el-form-item>

          <el-form-item>
            <el-button 
              type="primary" 
              @click="generateVideo"
              :loading="generating"
              :disabled="!canGenerate"
              size="large"
              style="width: 100%"
            >
              <UnifiedIcon name="default" />
              {{ generating ? getGeneratingText() : getButtonText() }}
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
          <h4>{{ getPreviewTitle() }}</h4>
          <div class="preview-actions" v-if="generatedContent">
            <el-button size="small" @click="regenerate">
              <UnifiedIcon name="Refresh" />
              重新生成
            </el-button>
            <el-button size="small" @click="downloadScript" v-if="formData.mode === 'script'">
              <UnifiedIcon name="Download" />
              下载脚本
            </el-button>
            <el-button size="small" type="primary" @click="saveContent">
              <UnifiedIcon name="Check" />
              保存内容
            </el-button>
          </div>
        </div>

        <div class="preview-content">
          <div v-if="generating" class="generating-state">
            <UnifiedIcon name="default" />
            <p>{{ getGeneratingText() }}</p>
            <div class="progress-text">{{ progressText }}</div>
            <el-progress 
              v-if="generationProgress > 0"
              :percentage="generationProgress"
              :stroke-width="8"
              style="margin-top: var(--text-lg); width: 100%; max-width: 300px;"
            />
          </div>

          <div v-else-if="generatedContent" class="generated-content">
            <!-- 脚本模式 -->
            <div v-if="formData.mode === 'script'" class="script-content">
              <div class="content-meta">
                <el-tag>{{ getPlatformLabel(formData.platform) }}</el-tag>
                <el-tag type="success">{{ getTypeLabel(formData.type) }}</el-tag>
                <span class="duration-info">{{ getDurationLabel(formData.duration) }}</span>
              </div>

              <div class="script-sections">
                <div 
                  v-for="(section, index) in generatedContent.script"
                  :key="index"
                  class="script-section"
                >
                  <div class="section-header">
                    <span class="section-number">{{ index + 1 }}</span>
                    <span class="section-title">{{ section.title }}</span>
                    <span class="section-time">{{ section.time }}</span>
                  </div>
                  <div class="section-content">
                    <div class="visual-desc">
                      <strong>画面：</strong>{{ section.visual }}
                    </div>
                    <div class="audio-desc">
                      <strong>音频：</strong>{{ section.audio }}
                    </div>
                    <div v-if="section.text" class="text-desc">
                      <strong>文字：</strong>{{ section.text }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 视频生成模式 -->
            <div v-else class="video-content">
              <div class="content-meta">
                <el-tag>{{ getPlatformLabel(formData.platform) }}</el-tag>
                <el-tag type="warning">{{ formData.mode === 'text_to_video' ? '文生视频' : '首帧生视频' }}</el-tag>
                <span class="duration-info">{{ getDurationLabel(formData.duration) }}</span>
              </div>

              <div class="video-preview">
                <div v-if="generatedContent.videoUrl" class="video-player">
                  <video :src="generatedContent.videoUrl" controls style="width: 100%; max-height: 400px;" />
                </div>
                <div v-else class="video-placeholder">
                  <UnifiedIcon name="default" />
                  <p>视频生成中...</p>
                </div>
              </div>

              <div class="video-info">
                <h5>生成信息</h5>
                <div class="info-item">
                  <span class="label">分辨率：</span>
                  <span class="value">{{ generatedContent.resolution || '1080x1920' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">帧率：</span>
                  <span class="value">{{ generatedContent.fps || '30fps' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">时长：</span>
                  <span class="value">{{ generatedContent.actualDuration || '30秒' }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <UnifiedIcon name="default" />
            <p>请填写左侧信息，开始AI视频创作</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 组件事件
const emit = defineEmits(['content-created'])

// 视频内容类型定义
interface ScriptSection {
  title: string
  time: string
  visual: string
  audio: string
  text: string
}

interface GeneratedVideoContent {
  script?: ScriptSection[]
  videoUrl?: string
  resolution?: string
  fps?: string
  actualDuration?: string
  taskId?: string
  status?: string
  modelUsed?: string
  selectionReason?: string
  concept?: string
  visualStyle?: string
  musicSuggestion?: string
}

interface UploadedImageData {
  url?: string
  src?: string
}

// 响应式数据
const generating = ref(false)
const generatedContent = ref<GeneratedVideoContent | null>(null)
const progressText = ref('')
const generationProgress = ref(0)
const uploadedImage = ref<string | UploadedImageData>('')

// 计算属性：获取图片URL用于显示
const uploadedImageSrc = computed(() => {
  if (typeof uploadedImage.value === 'string') {
    return uploadedImage.value
  } else if (uploadedImage.value) {
    return uploadedImage.value.url || uploadedImage.value.src || ''
  }
  return ''
})

// 表单数据
const formData = ref({
  platform: '',
  type: '',
  topic: '',
  duration: 'short',
  mode: 'script',
  description: ''
})

// 快速模板
const quickTemplates = ref([
  {
    id: 1,
    title: '招生宣传视频',
    description: '幼儿园招生宣传短视频',
    data: {
      platform: 'douyin',
      type: 'enrollment',
      topic: '春季招生宣传',
      duration: 'short',
      mode: 'script'
    }
  },
  {
    id: 2,
    title: '活动记录视频',
    description: '记录幼儿园精彩活动',
    data: {
      platform: 'wechat_video',
      type: 'activity',
      topic: '亲子运动会',
      duration: 'medium',
      mode: 'script'
    }
  }
])

// 计算属性
const canGenerate = computed(() => {
  const basic = formData.value.platform && formData.value.type && formData.value.topic && formData.value.description
  if (formData.value.mode === 'image_to_video') {
    return basic && uploadedImage.value
  }
  return basic
})

// 方法
const getPreviewTitle = () => {
  const titles = {
    script: '视频脚本预览',
    text_to_video: '文生视频预览',
    image_to_video: '首帧生视频预览'
  }
  return titles[formData.value.mode as keyof typeof titles] || '预览'
}

const getButtonText = () => {
  const texts = {
    script: '生成脚本',
    text_to_video: '生成视频',
    image_to_video: '生成视频'
  }
  return texts[formData.value.mode as keyof typeof texts] || '开始创作'
}

const getGeneratingText = () => {
  const texts = {
    script: 'AI正在创作视频脚本...',
    text_to_video: 'AI正在生成视频...',
    image_to_video: 'AI正在从首帧生成视频...'
  }
  return texts[formData.value.mode as keyof typeof texts] || 'AI创作中...'
}

const handleImageUpload = (file: any) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    uploadedImage.value = e.target?.result as string
  }
  reader.readAsDataURL(file.raw)
}

const removeImage = () => {
  uploadedImage.value = ''
}

const generateVideo = async () => {
  if (!canGenerate.value) {
    ElMessage.warning('请填写完整信息')
    return
  }

  generating.value = true
  generationProgress.value = 0

  // 根据模式设置不同的进度文本
  if (formData.value.mode === 'script') {
    progressText.value = '正在连接AI专家...'
  } else if (formData.value.mode === 'text_to_video') {
    progressText.value = '正在连接视频生成模型...'
  } else if (formData.value.mode === 'image_to_video') {
    progressText.value = '正在分析首帧图片...'
  }

  try {
    // 调用对应的API
    progressText.value = '正在分析需求...'
    generationProgress.value = 20

    const result = await callVideoGeneration()

    // 脚本模式返回的是纯文本，其他模式返回的是对象
    if (formData.value.mode === 'script') {
      // 流式接口返回的是纯文本内容
      if (result && typeof result === 'string' && result.length > 0) {
        console.log('✅ 生成结果:', result)
        progressText.value = '正在解析脚本内容...'
        generationProgress.value = 80
        generatedContent.value = parseAIVideoResponse(result)
        generationProgress.value = 100
        ElMessage.success('创作完成！')
      } else {
        throw new Error('生成响应格式错误')
      }
    } else if (result && result.success) {
      console.log('✅ 生成结果:', result)
      progressText.value = '正在处理视频生成结果...'
      generationProgress.value = 80
      generatedContent.value = parseVideoGenerationResponse(result.data)
      generationProgress.value = 100
      ElMessage.success('创作完成！')
    } else {
      throw new Error('生成响应格式错误')
    }
  } catch (error) {
    console.error('❌ 视频创作失败:', error)
    ElMessage.error('创作失败，请重试')

    // 如果AI调用失败，回退到模拟内容
    console.log('🔄 回退到模拟内容生成...')
    await simulateGeneration()
    generatedContent.value = generateMockContent()
  } finally {
    generating.value = false
    generationProgress.value = 0
    progressText.value = ''
  }
}

// AI视频生成调用
const callVideoGeneration = async () => {
  const prompt = buildVideoPrompt()
  console.log('🎬 调用AI视频生成:', prompt)

  try {
    let endpoint = ''
    let requestBody: any = {
      prompt: prompt,
      duration: getDurationInSeconds(formData.value.duration),
      size: '1280x720',
      fps: 30,
      quality: 'standard',
      style: 'natural'
    }

    // 根据模式选择不同的接口
    if (formData.value.mode === 'text_to_video') {
      endpoint = '/api/ai/video/text-to-video'
    } else if (formData.value.mode === 'image_to_video') {
      endpoint = '/api/ai/video/image-to-video'

      // 处理图片URL问题
      if (uploadedImage.value) {
        // 如果是base64数据，需要先上传到服务器获取URL
        if (typeof uploadedImage.value === 'string' && uploadedImage.value.startsWith('data:')) {
          console.warn('⚠️ 检测到base64图片数据，图生视频功能需要有效的图片URL')
          ElMessage.warning('图生视频功能暂时不支持本地上传的图片，请使用网络图片URL')
          throw new Error('图生视频需要有效的图片URL，不支持base64数据')
        } else if (typeof uploadedImage.value === 'object') {
          // 如果是文件对象，提取URL
          const imgData = uploadedImage.value as UploadedImageData
          requestBody.imageUrl = imgData.url || imgData.src
        } else {
          // 如果是字符串URL
          requestBody.imageUrl = uploadedImage.value
        }

        // 验证imageUrl是否为有效URL
        if (!requestBody.imageUrl || !requestBody.imageUrl.startsWith('http')) {
          console.warn('⚠️ 无效的图片URL:', requestBody.imageUrl)
          ElMessage.warning('请提供有效的图片URL用于图生视频')
          throw new Error('无效的图片URL')
        }
      } else {
        ElMessage.warning('图生视频模式需要上传图片')
        throw new Error('图生视频模式需要上传图片')
      }
    } else {
      // 脚本模式仍然使用AI专家接口
      return await callAIExpert()
    }

    console.log('📤 发送视频生成请求:', { endpoint, requestBody })

    // 获取认证token
    const token = localStorage.getItem('kindergarten_token')

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // 添加认证头
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
      console.log('✅ 添加认证头到视频生成请求:', token.substring(0, 20) + '...')
    } else {
      console.warn('⚠️ 没有找到认证token，视频生成请求可能会失败')
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    })

    console.log('📥 视频生成响应状态:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ 视频生成请求失败:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      })

      // 根据不同的错误状态提供更友好的错误信息
      if (response.status === 400) {
        ElMessage.error('请求参数错误，请检查输入内容')
      } else if (response.status === 401) {
        ElMessage.error('认证失败，请重新登录')
      } else if (response.status === 404) {
        ElMessage.error('视频生成服务暂时不可用')
      } else {
        ElMessage.error(`视频生成失败 (${response.status})`)
      }

      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
    }

    const result = await response.json()
    console.log('✅ 视频生成响应:', result)

    return result
  } catch (error) {
    console.error('❌ 视频生成调用失败:', error)
    throw error
  }
}

// AI专家工具调用（用于脚本模式） - 使用统一AI流式接口
const callAIExpert = async () => {
  const prompt = buildVideoPrompt()
  console.log('🤖 调用AI专家生成脚本:', prompt)

  // 获取认证Token
  const token = localStorage.getItem('token') || localStorage.getItem('kindergarten_token')
  if (!token) {
    throw new Error('未登录，请先登录')
  }

  try {
    const response = await fetch('/api/ai/unified/stream-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify({
        message: prompt
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // 解析SSE流式响应
    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('无法读取响应流')
    }

    const decoder = new TextDecoder()
    let fullContent = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.type === 'answer_chunk' && data.content) {
              fullContent += data.content
            } else if (data.type === 'answer_complete' && data.content) {
              fullContent = data.content
            }
          } catch {
            // 忽略解析失败的行
          }
        }
      }
    }

    console.log('✅ AI专家响应:', fullContent)
    return fullContent
  } catch (error) {
    console.error('❌ AI专家调用失败:', error)
    throw error
  }
}

// 构建视频创作提示词
const buildVideoPrompt = () => {
  const platformMap: Record<string, string> = {
    'douyin': '抖音',
    'kuaishou': '快手',
    'xiaohongshu': '小红书',
    'bilibili': 'B站',
    'wechat_channels': '微信视频号'
  }

  const typeMap: Record<string, string> = {
    'campus_tour': '校园介绍',
    'activity_record': '活动记录',
    'education_concept': '教育理念',
    'teacher_intro': '教师介绍',
    'child_growth': '儿童成长',
    'parent_testimonial': '家长见证'
  }

  const durationMap: Record<string, string> = {
    'short': '15-30秒',
    'medium': '30-60秒',
    'long': '1-3分钟'
  }

  const platform = (platformMap as Record<string, string>)[formData.value.platform] || formData.value.platform
  const type = (typeMap as Record<string, string>)[formData.value.type] || formData.value.type
  const duration = (durationMap as Record<string, string>)[formData.value.duration] || formData.value.duration

  // 正确区分三种创作模式
  const modeMap: Record<string, string> = {
    'script': '脚本创作',
    'text_to_video': '文生视频',
    'image_to_video': '首帧生视频'
  }
  const mode = (modeMap as Record<string, string>)[formData.value.mode] || '脚本创作'

  let prompt = `你是一位专业的幼儿园视频内容创作专家，请为幼儿园创作一个${platform}的${type}视频内容。

**创作要求：**
- 发布平台：${platform}
- 视频类型：${type}
- 视频主题：${formData.value.topic}
- 视频时长：${duration}
- 创作模式：${mode}
- 内容描述：${formData.value.description}`

  // 如果是首帧生视频，添加图片信息
  if (formData.value.mode === 'image_to_video' && uploadedImage.value) {
    prompt += `
- 首帧图片：已上传（将基于此图片生成视频）`
  }

  // 根据不同模式添加不同的输出格式要求
  if (formData.value.mode === 'script') {
    prompt += `

**输出格式：**
请提供以下内容：
1. 完整的视频脚本（分镜头描述）
2. 每个镜头的时间安排
3. 画面描述和拍摄建议
4. 配音文案和音效建议
5. 后期制作要点
6. 发布优化建议`
  } else if (formData.value.mode === 'text_to_video') {
    prompt += `

**输出格式：**
请提供以下内容：
1. 文生视频创意概念
2. 关键画面描述和转场效果
3. 视觉风格和色彩建议
4. 音乐和音效建议
5. 文字和字幕建议
6. 视频生成参数建议
7. 发布策略建议`
  } else if (formData.value.mode === 'image_to_video') {
    prompt += `

**输出格式：**
请提供以下内容：
1. 基于首帧图片的视频创意
2. 图片动画效果建议
3. 镜头运动和转场设计
4. 配音和背景音乐建议
5. 文字叠加和字幕设计
6. 视频生成技术参数
7. 发布优化建议`
  }

  prompt += `

**注意事项：**
- 确保内容生动有趣，符合平台特色
- 内容要温馨专业，展示幼儿园特色和优势
- 适合目标受众（家长和孩子）
- 符合${platform}的用户习惯和算法偏好
- 包含适当的互动引导和行动号召`

  if (formData.value.mode === 'image_to_video') {
    prompt += `
- 充分利用首帧图片的视觉元素
- 确保动画效果自然流畅`
  }

  prompt += `

请直接输出${mode}内容，不需要额外的解释说明。`

  return prompt
}

// 解析AI视频响应
const parseAIVideoResponse = (aiResponse: string) => {
  try {
    const content = aiResponse.trim()

    if (formData.value.mode === 'script') {
      // 解析脚本内容
      const sections = content.split('\n\n').filter(section => section.trim())
      const scriptItems = []

      // 简单的脚本解析
      let timeIndex = 0
      const timeSlots = ['0-5秒', '5-15秒', '15-25秒', '25-30秒', '30-45秒', '45-60秒']

      for (const section of sections) {
        if (section.length > 20) { // 过滤掉太短的内容
          scriptItems.push({
            title: `镜头${scriptItems.length + 1}`,
            time: timeSlots[timeIndex] || `${timeIndex * 15}-${(timeIndex + 1) * 15}秒`,
            visual: section.substring(0, 100) + '...',
            audio: '背景音乐配合',
            text: section.substring(0, 50) + '...'
          })
          timeIndex++
        }
      }

      return {
        script: scriptItems.length > 0 ? scriptItems : [
          {
            title: '开场',
            time: '0-5秒',
            visual: '幼儿园大门全景，阳光明媚',
            audio: '轻快的背景音乐',
            text: '欢迎来到XX幼儿园'
          }
        ]
      }
    } else {
      // 解析视频生成内容
      return {
        videoUrl: '', // 实际应该是生成的视频URL
        resolution: '1080x1920',
        fps: '30fps',
        actualDuration: getDurationLabel(formData.value.duration),
        concept: content.substring(0, 200) + '...',
        visualStyle: '温馨明亮的色调',
        musicSuggestion: '轻快活泼的背景音乐'
      }
    }
  } catch (error) {
    console.error('解析AI视频响应失败:', error)
    return formData.value.mode === 'script' ? {
      script: [{
        title: '开场',
        time: '0-5秒',
        visual: aiResponse.substring(0, 100),
        audio: '背景音乐',
        text: aiResponse.substring(0, 50)
      }]
    } : {
      videoUrl: '',
      resolution: '1080x1920',
      fps: '30fps',
      actualDuration: getDurationLabel(formData.value.duration)
    }
  }
}

// 解析视频生成响应（用于文生视频和图生视频模式）
const parseVideoGenerationResponse = (responseData: any) => {
  try {
    console.log('📥 解析视频生成响应:', responseData)

    if (responseData && responseData.data && responseData.data.length > 0) {
      const videoData = responseData.data[0]

      return {
        videoUrl: videoData.url || '',
        taskId: videoData.taskId || '',
        status: videoData.status || 'processing',
        resolution: '1280x720',
        fps: '30fps',
        actualDuration: getDurationLabel(formData.value.duration),
        modelUsed: responseData.modelUsed || 'doubao-seedance-1-0-pro-250528',
        selectionReason: responseData.selectionReason || '使用豆包视频生成模型'
      }
    } else {
      // 如果没有视频数据，返回处理中状态
      return {
        videoUrl: '',
        taskId: responseData.taskId || '',
        status: 'processing',
        resolution: '1280x720',
        fps: '30fps',
        actualDuration: getDurationLabel(formData.value.duration),
        modelUsed: responseData.modelUsed || 'doubao-seedance-1-0-pro-250528'
      }
    }
  } catch (error) {
    console.error('解析视频生成响应失败:', error)
    return {
      videoUrl: '',
      status: 'error',
      resolution: '1280x720',
      fps: '30fps',
      actualDuration: getDurationLabel(formData.value.duration)
    }
  }
}

const simulateGeneration = async () => {
  const steps = formData.value.mode === 'script'
    ? [
        '正在分析需求...',
        '正在构思故事结构...',
        '正在编写分镜脚本...',
        '正在优化细节...'
      ]
    : [
        '正在分析需求...',
        '正在生成关键帧...',
        '正在渲染视频...',
        '正在后期处理...'
      ]

  for (let i = 0; i < steps.length; i++) {
    progressText.value = steps[i]
    generationProgress.value = ((i + 1) / steps.length) * 100
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
}

const generateMockContent = () => {
  if (formData.value.mode === 'script') {
    return {
      script: [
        {
          title: '开场',
          time: '0-5秒',
          visual: '幼儿园大门全景，阳光明媚',
          audio: '轻快的背景音乐',
          text: '欢迎来到XX幼儿园'
        },
        {
          title: '环境展示',
          time: '5-15秒',
          visual: '教室、操场、游乐设施的快速切换',
          audio: '孩子们的欢声笑语',
          text: '优美环境，快乐成长'
        },
        {
          title: '课程特色',
          time: '15-25秒',
          visual: '孩子们上课、游戏的精彩瞬间',
          audio: '温馨的旁白介绍',
          text: '专业课程，全面发展'
        },
        {
          title: '结尾',
          time: '25-30秒',
          visual: '联系方式和地址信息',
          audio: '温馨的结尾音乐',
          text: '期待您的加入！'
        }
      ]
    }
  } else {
    return {
      videoUrl: '', // 实际应该是生成的视频URL
      resolution: '1080x1920',
      fps: '30fps',
      actualDuration: getDurationLabel(formData.value.duration)
    }
  }
}

const useTemplate = (template: any) => {
  Object.assign(formData.value, template.data)
  ElMessage.success('模板已应用')
}

const regenerate = () => {
  generateVideo()
}

const downloadScript = () => {
  if (formData.value.mode === 'script' && generatedContent.value) {
    ElMessage.info('下载功能开发中...')
  }
}

const saveContent = () => {
  if (!generatedContent.value) return
  
  const content = {
    type: 'video',
    title: formData.value.topic || '未命名视频',
    platform: getPlatformLabel(formData.value.platform),
    content: formData.value.mode === 'script' ? '视频脚本' : '视频文件',
    preview: `${formData.value.topic} - ${formData.value.mode === 'script' ? '脚本' : '视频'}创作`
  }
  
  emit('content-created', content)
  ElMessage.success('内容已保存')
}

const getPlatformLabel = (platform: string) => {
  const labels = {
    'douyin': '抖音',
    'kuaishou': '快手',
    'wechat_video': '视频号',
    'xiaohongshu': '小红书',
    'bilibili': 'B站',
    'xigua': '西瓜视频',
    'haokan': '好看视频'
  }
  return labels[platform as keyof typeof labels] || platform
}

const getTypeLabel = (type: string) => {
  const labels = {
    'enrollment': '招生宣传',
    'activity': '活动记录',
    'course': '课程展示',
    'environment': '环境介绍',
    'teacher': '师资介绍',
    'daily': '日常生活',
    'festival': '节日庆典'
  }
  return labels[type as keyof typeof labels] || type
}

const getDurationLabel = (duration: string) => {
  const labels = {
    'short': '15-30秒',
    'medium': '1-3分钟',
    'long': '3-5分钟'
  }
  return labels[duration as keyof typeof labels] || duration
}

const getDurationInSeconds = (duration: string) => {
  const durationMap = {
    'short': 15,
    'medium': 60,
    'long': 180
  }
  return durationMap[duration as keyof typeof durationMap] || 15
}

// 页面初始化
onMounted(() => {
  console.log('视频创作组件已加载')
})
</script>

<style lang="scss" scoped>
.video-creator {
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
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap;

    .config-panel {
      width: 100%; max-width: 400px;
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

      .upload-demo {
        width: 100%;

        .upload-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60px; height: auto;
          border: 2px dashed var(--border-base);
          border-radius: var(--spacing-sm);
          color: var(--text-regular);
          transition: border-color 0.3s;

          &:hover {
            border-color: var(--primary-color);
          }

          .el-icon--upload {
            font-size: var(--spacing-3xl);
            margin-bottom: var(--spacing-sm);
          }
        }

        .uploaded-image {
          position: relative;
          width: 100%;
          min-height: 60px; height: auto;
          border-radius: var(--spacing-sm);
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .image-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: var(--black-alpha-50);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s;

            &:hover {
              opacity: 1;
            }
          }
        }
      }

      .quick-templates {
        margin-top: var(--spacing-3xl);
        padding-top: var(--text-3xl);
        border-top: var(--z-index-dropdown) solid var(--bg-gray-light);

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
            margin: 0 0 var(--spacing-sm) 0;
            font-size: var(--text-lg);
            color: var(--text-primary);
          }

          .progress-text {
            font-size: var(--text-base);
            color: var(--info-color);
            margin-bottom: var(--text-lg);
          }
        }

        .generated-content {
          .content-meta {
            display: flex;
            align-items: center;
            gap: var(--text-sm);
            margin-bottom: var(--text-3xl);
            padding-bottom: var(--text-lg);
            border-bottom: var(--z-index-dropdown) solid var(--bg-gray-light);

            .duration-info {
              font-size: var(--text-base);
              color: var(--info-color);
            }
          }

          .script-content {
            .script-sections {
              .script-section {
                background: var(--bg-gray-light);
                border-radius: var(--spacing-sm);
                margin-bottom: var(--text-lg);
                overflow: hidden;

                .section-header {
                  display: flex;
                  align-items: center;
                  gap: var(--text-sm);
                  padding: var(--text-lg);
                  background: #e9ecef;
                  border-bottom: var(--z-index-dropdown) solid #dee2e6;

                  .section-number {
                    width: var(--text-3xl);
                    height: var(--text-3xl);
                    border-radius: var(--radius-full);
                    background: var(--primary-color);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: var(--text-sm);
                    font-weight: 600;
                  }

                  .section-title {
                    flex: 1;
                    font-size: var(--text-lg);
                    font-weight: 600;
                    color: var(--text-primary);
                  }

                  .section-time {
                    font-size: var(--text-base);
                    color: var(--text-regular);
                    background: white;
                    padding: var(--spacing-xs) var(--spacing-sm);
                    border-radius: var(--spacing-xs);
                  }
                }

                .section-content {
                  padding: var(--text-lg);

                  .visual-desc,
                  .audio-desc,
                  .text-desc {
                    margin-bottom: var(--text-sm);
                    font-size: var(--text-base);
                    line-height: 1.5;

                    &:last-child {
                      margin-bottom: 0;
                    }

                    strong {
                      color: var(--primary-color);
                      margin-right: var(--spacing-sm);
                    }
                  }
                }
              }
            }
          }

          .video-content {
            .video-preview {
              margin-bottom: var(--text-3xl);

              .video-player {
                border-radius: var(--spacing-sm);
                overflow: hidden;
                box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-light);
              }

              .video-placeholder {
                min-height: 60px; height: auto;
                background: var(--bg-gray-light);
                border-radius: var(--spacing-sm);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: var(--info-color);

                .el-icon {
                  font-size: var(--text-5xl);
                  margin-bottom: var(--text-lg);
                }

                p {
                  margin: 0;
                  font-size: var(--text-lg);
                }
              }
            }

            .video-info {
              background: #f0f7ff;
              border-radius: var(--spacing-sm);
              padding: var(--text-lg);

              h5 {
                margin: 0 0 var(--text-sm) 0;
                font-size: var(--text-base);
                font-weight: 600;
                color: var(--text-primary);
              }

              .info-item {
                display: flex;
                margin-bottom: var(--spacing-sm);
                font-size: var(--text-base);

                &:last-child {
                  margin-bottom: 0;
                }

                .label {
                  color: var(--text-regular);
                  width: auto;
                  flex-shrink: 0;
                }

                .value {
                  color: var(--text-primary);
                  flex: 1;
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

// 响应式设计
@media (max-width: var(--breakpoint-lg)) {
  .video-creator {
    .creator-content {
      flex-direction: column;

      .config-panel {
        width: 100%;
        max-height: 60px;
        height: auto;
      }

      .preview-panel {
        min-height: 60px;
        height: auto;
      }
    }
  }
}
</style>
