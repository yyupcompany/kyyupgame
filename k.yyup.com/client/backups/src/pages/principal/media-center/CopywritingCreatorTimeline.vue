<template>
  <div class="copywriting-creator-timeline">
    <!-- 左侧Timeline区域 -->
    <div class="timeline-section">
      <div class="timeline-header">
        <h3>AI文案创作</h3>
        <p>5步完成专业文案创作</p>
      </div>
      
      <div class="timeline-container">
        <div
          v-for="(step, index) in steps"
          :key="step.id"
          class="timeline-item"
          :class="{
            'active': currentStep === step.id,
            'completed': step.status === 'completed',
            'in-progress': step.status === 'in-progress',
            'pending': step.status === 'pending'
          }"
          @click="goToStep(step.id)"
        >
          <div class="timeline-marker">
            <div class="timeline-dot">
              <el-icon v-if="step.status === 'completed'"><Check /></el-icon>
              <el-icon v-else-if="step.status === 'in-progress'"><Loading /></el-icon>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div class="timeline-line" v-if="index < steps.length - 1"></div>
          </div>
          
          <div class="timeline-content">
            <div class="timeline-title">{{ step.title }}</div>
            <div class="timeline-description">{{ step.description }}</div>
            <div class="timeline-meta">
              <span class="timeline-status" :class="step.status">
                {{ getStatusText(step.status) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧内容区域 -->
    <div class="content-section">
      <!-- 步骤1: 选择平台和类型 -->
      <div v-show="currentStep === 1" class="step-content">
        <div class="step-header">
          <h3>步骤1: 选择平台和类型</h3>
          <p>选择文案发布平台和内容类型</p>
        </div>

        <el-form :model="formData" label-width="100px" class="step-form">
          <el-form-item label="发布平台" required>
            <el-select v-model="formData.platform" placeholder="请选择平台" size="large">
              <el-option label="微信朋友圈" value="wechat_moments">
                <span class="option-icon">📱</span> 微信朋友圈
              </el-option>
              <el-option label="微信公众号" value="wechat_official">
                <span class="option-icon">📰</span> 微信公众号
              </el-option>
              <el-option label="微博" value="weibo">
                <span class="option-icon">🐦</span> 微博
              </el-option>
              <el-option label="小红书" value="xiaohongshu">
                <span class="option-icon">📕</span> 小红书
              </el-option>
              <el-option label="抖音" value="douyin">
                <span class="option-icon">🎵</span> 抖音
              </el-option>
              <el-option label="快手" value="kuaishou">
                <span class="option-icon">⚡</span> 快手
              </el-option>
              <el-option label="B站" value="bilibili">
                <span class="option-icon">📺</span> B站
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="内容类型" required>
            <el-select v-model="formData.type" placeholder="请选择类型" size="large">
              <el-option label="招生宣传" value="enrollment">
                <span class="option-icon">🎓</span> 招生宣传
              </el-option>
              <el-option label="活动推广" value="activity">
                <span class="option-icon">🎉</span> 活动推广
              </el-option>
              <el-option label="节日祝福" value="festival">
                <span class="option-icon">🎊</span> 节日祝福
              </el-option>
              <el-option label="日常分享" value="daily">
                <span class="option-icon">📝</span> 日常分享
              </el-option>
              <el-option label="教育理念" value="education">
                <span class="option-icon">💡</span> 教育理念
              </el-option>
              <el-option label="育儿知识" value="parenting">
                <span class="option-icon">👶</span> 育儿知识
              </el-option>
              <el-option label="校园生活" value="campus">
                <span class="option-icon">🏫</span> 校园生活
              </el-option>
            </el-select>
          </el-form-item>

          <div class="step-actions">
            <el-button type="primary" size="large" @click="nextStep" :disabled="!formData.platform || !formData.type">
              下一步
              <el-icon class="el-icon--right"><ArrowRight /></el-icon>
            </el-button>
          </div>
        </el-form>
      </div>

      <!-- 步骤2: 填写创作信息 -->
      <div v-show="currentStep === 2" class="step-content">
        <div class="step-header">
          <h3>步骤2: 填写创作信息</h3>
          <p>填写文案主题、风格和其他要求</p>
        </div>

        <el-form :model="formData" label-width="100px" class="step-form">
          <el-form-item label="主题内容" required>
            <el-input 
              v-model="formData.topic"
              type="textarea"
              :rows="4"
              placeholder="请输入文案主题，如：春季招生、六一儿童节亲子活动等"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="文案风格">
            <el-radio-group v-model="formData.style" size="large">
              <el-radio-button value="warm">😊 温馨亲切</el-radio-button>
              <el-radio-button value="professional">👔 专业权威</el-radio-button>
              <el-radio-button value="lively">🎈 活泼有趣</el-radio-button>
              <el-radio-button value="concise">📋 简洁明了</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="关键信息">
            <el-input 
              v-model="formData.keyInfo"
              type="textarea"
              :rows="3"
              placeholder="请输入需要突出的关键信息，如：地址、电话、优惠政策等"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="字数要求">
            <div class="word-count-slider">
              <el-slider
                v-model="formData.wordCount"
                :min="50"
                :max="500"
                :step="50"
                show-stops
              />
              <div class="word-count-display">
                当前设置：<strong>{{ formData.wordCount }}</strong> 字
              </div>
            </div>
          </el-form-item>

          <el-form-item label="包含基础信息">
            <el-switch v-model="includeBasicInfo" />
            <span class="form-tip" style="margin-left: var(--text-sm); color: var(--info-color); font-size: var(--text-sm);">
              自动在文案中包含幼儿园名称、地址、联系方式等信息
            </span>
          </el-form-item>

          <el-form-item v-if="includeBasicInfo" label="信息选项">
            <el-checkbox-group v-model="basicInfoOptions">
              <el-checkbox label="includeName">幼儿园名称</el-checkbox>
              <el-checkbox label="includeAddress">园区地址</el-checkbox>
              <el-checkbox label="includeContact">联系方式</el-checkbox>
              <el-checkbox label="includeDescription">园区简介</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <div class="step-actions">
            <el-button size="large" @click="prevStep">
              <el-icon class="el-icon--left"><ArrowLeft /></el-icon>
              上一步
            </el-button>
            <el-button type="primary" size="large" @click="nextStep" :disabled="!formData.topic">
              下一步
              <el-icon class="el-icon--right"><ArrowRight /></el-icon>
            </el-button>
          </div>
        </el-form>
      </div>

      <!-- 步骤3: 生成文案 -->
      <div v-show="currentStep === 3" class="step-content">
        <div class="step-header">
          <h3>步骤3: 生成文案</h3>
          <p>AI正在为您创作专业文案</p>
        </div>

        <div class="generation-area">
          <div v-if="!generatedContent && !generating" class="generation-prompt">
            <el-icon class="prompt-icon"><MagicStick /></el-icon>
            <h4>准备就绪</h4>
            <p>点击下方按钮开始生成文案</p>
            <el-button type="primary" size="large" @click="generateCopywriting">
              <el-icon class="el-icon--left"><MagicStick /></el-icon>
              开始生成
            </el-button>
          </div>

          <div v-else-if="generating" class="generating-state">
            <el-icon class="loading-icon"><Loading /></el-icon>
            <h4>AI创作中...</h4>
            <p>正在根据您的要求生成专业文案</p>
            <el-progress :percentage="generationProgress" :stroke-width="8" />
          </div>

          <div v-else-if="generatedContent" class="generation-success">
            <el-result icon="success" title="文案生成成功！" sub-title="正在自动跳转到预览页面...">
              <template #extra>
                <div class="auto-redirect-hint">
                  <el-icon class="loading-icon"><Loading /></el-icon>
                  <span>1秒后自动跳转...</span>
                </div>
              </template>
            </el-result>
          </div>
        </div>

        <div class="step-actions" v-if="!generating">
          <el-button size="large" @click="prevStep">
            <el-icon class="el-icon--left"><ArrowLeft /></el-icon>
            上一步
          </el-button>
        </div>
      </div>

      <!-- 步骤4: 预览和编辑 -->
      <div v-show="currentStep === 4" class="step-content">
        <div class="step-header">
          <h3>步骤4: 预览和编辑</h3>
          <p>查看生成的文案效果，可以进行编辑调整</p>
        </div>

        <div class="preview-area">
          <div class="preview-mode-selector">
            <el-radio-group v-model="previewMode" size="large">
              <el-radio-button value="text">📝 文本预览</el-radio-button>
              <el-radio-button value="wechat">📱 朋友圈预览</el-radio-button>
            </el-radio-group>
          </div>

          <div v-if="previewMode === 'text'" class="text-preview">
            <el-input
              v-model="generatedContent"
              type="textarea"
              :rows="15"
              placeholder="生成的文案将显示在这里"
            />
          </div>

          <div v-else-if="previewMode === 'wechat'" class="wechat-preview">
            <WeChatMomentsPreview :content="generatedContent" :topic="formData.topic" />
          </div>
        </div>

        <div class="step-actions">
          <el-button size="large" @click="prevStep">
            <el-icon class="el-icon--left"><ArrowLeft /></el-icon>
            上一步
          </el-button>
          <el-button type="primary" size="large" @click="nextStep">
            下一步
            <el-icon class="el-icon--right"><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>

      <!-- 步骤5: 保存和使用 -->
      <div v-show="currentStep === 5" class="step-content">
        <div class="step-header">
          <h3>步骤5: 保存和使用</h3>
          <p>复制文案或保存到历史记录</p>
        </div>

        <div class="save-area">
          <el-result icon="success" title="文案创作完成！" sub-title="您可以复制文案或保存到历史记录">
            <template #extra>
              <div class="action-buttons">
                <el-button type="primary" size="large" @click="copyToClipboard">
                  <el-icon class="el-icon--left"><CopyDocument /></el-icon>
                  复制文案
                </el-button>
                <el-button type="success" size="large" @click="saveContent">
                  <el-icon class="el-icon--left"><Check /></el-icon>
                  保存到历史
                </el-button>
                <el-button size="large" @click="resetForm">
                  <el-icon class="el-icon--left"><Refresh /></el-icon>
                  创作新文案
                </el-button>
              </div>
            </template>
          </el-result>

          <div class="content-summary">
            <el-descriptions title="文案信息" :column="2" border>
              <el-descriptions-item label="发布平台">{{ getPlatformLabel(formData.platform) }}</el-descriptions-item>
              <el-descriptions-item label="内容类型">{{ getTypeLabel(formData.type) }}</el-descriptions-item>
              <el-descriptions-item label="主题">{{ formData.topic }}</el-descriptions-item>
              <el-descriptions-item label="风格">{{ getStyleLabel(formData.style) }}</el-descriptions-item>
              <el-descriptions-item label="字数">{{ generatedContent?.length || 0 }} 字</el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ new Date().toLocaleString() }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </div>

        <div class="step-actions">
          <el-button size="large" @click="prevStep">
            <el-icon class="el-icon--left"><ArrowLeft /></el-icon>
            上一步
          </el-button>
        </div>
      </div>
    </div>

    <!-- AI帮助按钮 -->
    <PageHelpButton :help-content="copywritingHelp" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Check,
  Loading,
  ArrowRight,
  ArrowLeft,
  MagicStick,
  Refresh,
  CopyDocument
} from '@element-plus/icons-vue'
import WeChatMomentsPreview from '@/components/preview/WeChatMomentsPreview.vue'
import PageHelpButton from '@/components/common/PageHelpButton.vue'
import { request } from '@/utils/request'
import { kindergartenInfoService } from '@/services/kindergarten-info.service'

// Props and Emits
const emit = defineEmits(['content-created'])

// AI帮助内容
const copywritingHelp = {
  title: 'AI文案创作使用指南',
  description: '通过AI智能生成专业的幼儿园活动文案，支持多平台、多类型内容创作。AI会自动包含您的幼儿园基础信息（名称、地址、联系方式等）。',
  features: [
    '支持微信、微博、小红书等多个平台',
    '自动生成招生、活动、节日等多种类型文案',
    'AI自动注入幼儿园基础信息',
    '可自定义风格和关键信息',
    '一键生成配图和话题标签'
  ],
  steps: [
    '步骤1：选择发布平台和内容类型',
    '步骤2：填写主题、风格和关键信息',
    '步骤3：点击生成，AI自动创作文案',
    '步骤4：预览效果，可编辑调整',
    '步骤5：复制或保存文案后发布'
  ],
  tips: [
    '建议勾选"包含基础信息"，让家长更容易联系您',
    '可以在生成后手动编辑文案内容',
    'AI会根据平台特点调整文案风格',
    '生成的话题标签可以提高曝光率'
  ]
}

// 步骤定义
const steps = ref([
  {
    id: 1,
    title: '选择平台和类型',
    description: '选择文案发布平台和内容类型',
    status: 'in-progress'
  },
  {
    id: 2,
    title: '填写创作信息',
    description: '填写主题、风格和关键信息',
    status: 'pending'
  },
  {
    id: 3,
    title: '生成文案',
    description: 'AI智能生成专业文案',
    status: 'pending'
  },
  {
    id: 4,
    title: '预览和编辑',
    description: '查看效果并进行调整',
    status: 'pending'
  },
  {
    id: 5,
    title: '保存和使用',
    description: '复制或保存文案',
    status: 'pending'
  }
])

// 当前步骤
const currentStep = ref(1)

// 表单数据
const formData = ref({
  platform: '',
  type: '',
  topic: '',
  style: 'warm',
  keyInfo: '',
  wordCount: 200
})

// 生成状态
const generating = ref(false)
const generationProgress = ref(0)
const generatedContent = ref('')
const previewMode = ref('text')

// 基础信息配置
const includeBasicInfo = ref(true) // 默认包含基础信息
const basicInfoOptions = ref(['includeName', 'includeAddress', 'includeContact']) // 默认选项

// 步骤导航
const goToStep = (stepId: number) => {
  // 只能前往已完成或当前步骤
  const targetStep = steps.value.find(s => s.id === stepId)
  if (targetStep && (targetStep.status === 'completed' || targetStep.status === 'in-progress')) {
    currentStep.value = stepId
  }
}

const nextStep = () => {
  if (currentStep.value < steps.value.length) {
    // 标记当前步骤为完成
    const current = steps.value.find(s => s.id === currentStep.value)
    if (current) current.status = 'completed'

    // 移动到下一步
    currentStep.value++

    // 标记下一步为进行中
    const next = steps.value.find(s => s.id === currentStep.value)
    if (next) next.status = 'in-progress'
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    // 标记当前步骤为待处理
    const current = steps.value.find(s => s.id === currentStep.value)
    if (current) current.status = 'pending'

    // 移动到上一步
    currentStep.value--

    // 标记上一步为进行中
    const prev = steps.value.find(s => s.id === currentStep.value)
    if (prev) prev.status = 'in-progress'
  }
}

// 生成文案
const generateCopywriting = async () => {
  generating.value = true
  generationProgress.value = 0

  // 模拟进度
  const progressInterval = setInterval(() => {
    if (generationProgress.value < 90) {
      generationProgress.value += 10
    }
  }, 300)

  try {
    // 调用AI生成（buildPrompt现在是异步的）
    const prompt = await buildPrompt()
    console.log('📝 生成文案提示词:', prompt)

    const result = await request.post('/ai/expert/smart-chat', {
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    if (result.success && result.data?.content) {
      generatedContent.value = result.data.content
      generationProgress.value = 100
      ElMessage.success('文案生成成功！')

      // 等待一下让用户看到成功提示，然后自动跳转到预览步骤
      setTimeout(() => {
        nextStep()
      }, 1000)
    } else {
      throw new Error('生成失败')
    }
  } catch (error) {
    console.error('生成文案失败:', error)
    ElMessage.error('生成失败，请重试')
    // 使用模拟数据
    generatedContent.value = generateMockContent()
    generationProgress.value = 100

    // 即使使用模拟数据也自动跳转
    setTimeout(() => {
      nextStep()
    }, 1000)
  } finally {
    clearInterval(progressInterval)
    generating.value = false
  }
}

// 构建提示词（支持异步）
const buildPrompt = async () => {
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
    'campus': '校园生活'
  }

  const styleMap = {
    'warm': '温馨亲切',
    'professional': '专业权威',
    'lively': '活泼有趣',
    'concise': '简洁明了'
  }

  const platform = platformMap[formData.value.platform as keyof typeof platformMap] || formData.value.platform
  const type = typeMap[formData.value.type as keyof typeof typeMap] || formData.value.type
  const style = styleMap[formData.value.style as keyof typeof styleMap] || formData.value.style

  let prompt = `你是一位专业的幼儿园新媒体运营专家，请为幼儿园创作一篇适合${platform}发布的${type}文案。

要求：
1. 主题：${formData.value.topic}
2. 风格：${style}
3. 字数：约${formData.value.wordCount}字
${formData.value.keyInfo ? `4. 关键信息：${formData.value.keyInfo}` : ''}`

  // 如果勾选了包含基础信息
  if (includeBasicInfo.value) {
    try {
      const options = {
        includeName: basicInfoOptions.value.includes('includeName'),
        includeAddress: basicInfoOptions.value.includes('includeAddress'),
        includeContact: basicInfoOptions.value.includes('includeContact'),
        includeDescription: basicInfoOptions.value.includes('includeDescription')
      }

      const basicInfoText = await kindergartenInfoService.formatForAIPrompt(options)

      if (basicInfoText) {
        prompt += `\n\n幼儿园基础信息：\n${basicInfoText}\n\n请在文案中自然地融入以上幼儿园信息。`
      }
    } catch (error) {
      console.warn('获取幼儿园基础信息失败:', error)
    }
  }

  prompt += `\n\n请直接输出文案内容，不需要额外说明。`

  return prompt
}

// 生成模拟内容
const generateMockContent = () => {
  const seasonOpening = getCurrentSeasonOpening()
  const topic = formData.value.topic

  return `${seasonOpening}

🎉【${topic}】

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

#${topic} #幼儿园 #优质教育`
}

// 获取当前季节开场白
const getCurrentSeasonOpening = () => {
  const month = new Date().getMonth() + 1
  const topic = formData.value.topic.toLowerCase()

  // 优先匹配主题关键词
  if (topic.includes('六一') || topic.includes('儿童节')) {
    return '☀️夏日炎炎，孩子们的笑声最动听！'
  }
  if (topic.includes('春') || topic.includes('招生')) {
    return '🌸春暖花开，正是孩子们成长的好时节！'
  }
  if (topic.includes('秋')) {
    return '🍂秋高气爽，收获成长的季节！'
  }
  if (topic.includes('冬') || topic.includes('圣诞') || topic.includes('新年')) {
    return '❄️冬日温暖，陪伴孩子快乐成长！'
  }

  // 根据月份判断
  if (month >= 3 && month <= 5) {
    return '🌸春暖花开，正是孩子们成长的好时节！'
  } else if (month >= 6 && month <= 8) {
    return '☀️夏日炎炎，孩子们的笑声最动听！'
  } else if (month >= 9 && month <= 11) {
    return '🍂秋高气爽，收获成长的季节！'
  } else {
    return '❄️冬日温暖，陪伴孩子快乐成长！'
  }
}

// 重新生成
const regenerate = () => {
  generatedContent.value = ''
  generateCopywriting()
}

// 复制到剪贴板
const copyToClipboard = () => {
  if (navigator.clipboard && generatedContent.value) {
    navigator.clipboard.writeText(generatedContent.value).then(() => {
      ElMessage.success('文案已复制到剪贴板')
    }).catch(() => {
      ElMessage.error('复制失败')
    })
  }
}

// 保存内容
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
  ElMessage.success('文案已保存到历史记录')
}

// 重置表单
const resetForm = () => {
  formData.value = {
    platform: '',
    type: '',
    topic: '',
    style: 'warm',
    keyInfo: '',
    wordCount: 200
  }
  generatedContent.value = ''
  currentStep.value = 1

  // 重置步骤状态
  steps.value.forEach((step, index) => {
    if (index === 0) {
      step.status = 'in-progress'
    } else {
      step.status = 'pending'
    }
  })

  ElMessage.success('已重置，可以开始新的创作')
}

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap = {
    'completed': '已完成',
    'in-progress': '进行中',
    'pending': '待处理'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

// 获取平台标签
const getPlatformLabel = (platform: string) => {
  const platformMap = {
    'wechat_moments': '微信朋友圈',
    'wechat_official': '微信公众号',
    'weibo': '微博',
    'xiaohongshu': '小红书',
    'douyin': '抖音',
    'kuaishou': '快手',
    'bilibili': 'B站'
  }
  return platformMap[platform as keyof typeof platformMap] || platform
}

// 获取类型标签
const getTypeLabel = (type: string) => {
  const typeMap = {
    'enrollment': '招生宣传',
    'activity': '活动推广',
    'festival': '节日祝福',
    'daily': '日常分享',
    'education': '教育理念',
    'parenting': '育儿知识',
    'campus': '校园生活'
  }
  return typeMap[type as keyof typeof typeMap] || type
}

// 获取风格标签
const getStyleLabel = (style: string) => {
  const styleMap = {
    'warm': '温馨亲切',
    'professional': '专业权威',
    'lively': '活泼有趣',
    'concise': '简洁明了'
  }
  return styleMap[style as keyof typeof styleMap] || style
}
</script>

<style scoped lang="scss">
.copywriting-creator-timeline {
  display: flex;
  height: calc(100vh - 120px);
  gap: var(--text-3xl);
  background: var(--el-bg-color-page);
}

// 左侧Timeline区域 (40%宽度)
.timeline-section {
  flex: 0 0 40%;
  max-width: 480px;
  min-width: 360px;
  background: var(--el-bg-color);
  border-radius: var(--text-sm);
  padding: var(--text-3xl);
  box-shadow: 0 2px var(--text-sm) var(--black-alpha-8);
  overflow-y: auto;
  border: var(--border-width-base) solid var(--el-border-color-light);

  // 暗黑模式优化
  html.dark & {
    background: var(--white-alpha-5);
    border-color: var(--white-alpha-10);
  }
}

.timeline-header {
  margin-bottom: var(--text-3xl);

  h3 {
    font-size: var(--text-2xl);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 var(--spacing-sm) 0;

    // 暗黑模式优化
    html.dark & {
      color: var(--white-alpha-95);
    }
  }

  p {
    font-size: var(--text-base);
    color: var(--el-text-color-secondary);
    margin: 0;

    // 暗黑模式优化
    html.dark & {
      color: rgba(255, 255, 255, 0.65);
    }
  }
}

.timeline-container {
  position: relative;
}

.timeline-item {
  display: flex;
  margin-bottom: var(--text-3xl);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(var(--spacing-xs));
  }

  &.active {
    .timeline-content {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%);
      border-color: rgba(99, 102, 241, 0.4);
      box-shadow: 0 var(--spacing-xs) var(--text-sm) rgba(99, 102, 241, 0.15);
    }

    .timeline-dot {
      background: linear-gradient(135deg, var(--primary-color), var(--ai-primary));
      color: white;
      transform: scale(1.2);
      box-shadow: 0 var(--spacing-xs) var(--text-sm) rgba(99, 102, 241, 0.3);
    }
  }

  &.completed .timeline-dot {
    background: linear-gradient(135deg, var(--success-color), #059669);
    color: white;
    box-shadow: 0 2px var(--spacing-sm) rgba(16, 185, 129, 0.3);
  }

  &.in-progress .timeline-dot {
    background: linear-gradient(135deg, var(--warning-color), #d97706);
    color: white;
    box-shadow: 0 2px var(--spacing-sm) rgba(245, 158, 11, 0.3);
  }

  &.pending .timeline-dot {
    background: var(--el-fill-color);
    color: var(--el-text-color-secondary);
  }
}

.timeline-marker {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: var(--text-lg);
}

.timeline-dot {
  width: var(--icon-size); height: var(--icon-size);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: var(--text-base);
  transition: all 0.3s ease;
  z-index: 1;
}

.timeline-line {
  width: 2px;
  flex: 1;
  min-height: var(--button-height-lg);
  background: var(--el-border-color);
  margin-top: var(--spacing-sm);
}

.timeline-content {
  flex: 1;
  padding: var(--text-sm) var(--text-lg);
  border: var(--border-width-base) solid var(--el-border-color-lighter);
  border-radius: var(--spacing-sm);
  background: var(--el-bg-color);
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--el-color-primary-light-7);
    box-shadow: 0 2px var(--spacing-sm) var(--black-alpha-8);
  }

  // 暗黑模式优化
  html.dark & {
    background: var(--white-alpha-3);
    border-color: var(--white-alpha-8);

    &:hover {
      background: var(--white-alpha-5);
      border-color: var(--el-color-primary);
      box-shadow: 0 2px var(--spacing-sm) var(--shadow-heavy);
    }
  }
}

.timeline-title {
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: var(--spacing-xs);
  font-size: var(--text-base);

  // 暗黑模式优化
  html.dark & {
    color: var(--white-alpha-90);
  }
}

.timeline-description {
  font-size: var(--text-sm);
  color: var(--el-text-color-regular);
  margin-bottom: var(--spacing-sm);

  // 暗黑模式优化
  html.dark & {
    color: var(--white-alpha-60);
  }
}

.timeline-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.timeline-status {
  padding: var(--spacing-sm) var(--spacing-sm);
  border-radius: var(--text-sm);
  font-size: var(--text-xs);
  font-weight: 500;

  &.completed {
    background: rgba(16, 185, 129, 0.1);
    color: var(--success-color);
    border: var(--border-width-base) solid rgba(16, 185, 129, 0.2);
  }

  &.in-progress {
    background: rgba(245, 158, 11, 0.1);
    color: var(--warning-color);
    border: var(--border-width-base) solid rgba(245, 158, 11, 0.2);
  }

  &.pending {
    background: rgba(107, 114, 128, 0.1);
    color: var(--text-secondary);
    border: var(--border-width-base) solid rgba(107, 114, 128, 0.2);
  }
}

// 右侧内容区域 (60%宽度)
.content-section {
  flex: 1;
  background: var(--el-bg-color);
  border-radius: var(--text-sm);
  padding: var(--spacing-3xl);
  box-shadow: 0 2px var(--text-sm) var(--black-alpha-8);
  overflow-y: auto;
  border: var(--border-width-base) solid var(--el-border-color-light);

  // 暗黑模式优化
  html.dark & {
    background: var(--white-alpha-5);
    border-color: var(--white-alpha-10);
  }
}

.step-content {
  max-width: 800px;
  margin: 0 auto;
}

.step-header {
  margin-bottom: var(--spacing-3xl);

  h3 {
    font-size: var(--text-3xl);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 var(--spacing-sm) 0;

    // 暗黑模式优化
    html.dark & {
      color: var(--white-alpha-95);
    }
  }

  p {
    font-size: var(--text-base);
    color: var(--el-text-color-secondary);
    margin: 0;

    // 暗黑模式优化
    html.dark & {
      color: rgba(255, 255, 255, 0.65);
    }
  }
}

.step-form {
  .el-form-item {
    margin-bottom: var(--text-3xl);
  }

  // 暗黑模式下的表单优化
  html.dark & {
    :deep(.el-input__wrapper) {
      background-color: var(--white-alpha-8);
      box-shadow: 0 0 0 var(--border-width-base) var(--glass-bg-medium) inset;

      &:hover {
        box-shadow: 0 0 0 var(--border-width-base) var(--glass-bg-heavy) inset;
      }

      &.is-focus {
        box-shadow: 0 0 0 var(--border-width-base) var(--el-color-primary) inset;
      }
    }

    :deep(.el-input__inner),
    :deep(.el-textarea__inner) {
      color: var(--white-alpha-90);
      background-color: transparent;

      &::placeholder {
        color: var(--white-alpha-40);
      }
    }

    :deep(.el-select .el-input__inner) {
      color: var(--white-alpha-90);
    }

    :deep(.el-form-item__label) {
      color: rgba(255, 255, 255, 0.85);
    }
  }
}

.step-actions {
  display: flex;
  justify-content: space-between;
  margin-top: var(--spacing-3xl);
  padding-top: var(--text-3xl);
  border-top: var(--border-width-base) solid var(--el-border-color-lighter);
}

.option-icon {
  margin-right: var(--spacing-sm);
}

.word-count-slider {
  width: 100%;

  .word-count-display {
    margin-top: var(--text-sm);
    text-align: center;
    font-size: var(--text-base);
    color: var(--el-text-color-regular);

    strong {
      color: var(--el-color-primary);
      font-size: var(--text-lg);
    }
  }
}

.generation-area,
.preview-area,
.save-area {
  min-height: 400px;
}

.generation-prompt,
.generating-state {
  text-align: center;
  padding: var(--spacing-15xl) var(--text-2xl);

  .prompt-icon,
  .loading-icon {
    font-size: var(--text-6xl);
    color: var(--el-color-primary);
    margin-bottom: var(--text-3xl);
  }

  h4 {
    font-size: var(--text-2xl);
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 var(--text-sm) 0;
  }

  p {
    font-size: var(--text-base);
    color: var(--el-text-color-secondary);
    margin: 0 0 var(--text-3xl) 0;
  }
}

.generation-success {
  .action-buttons {
    display: flex;
    gap: var(--text-sm);
    justify-content: center;
    flex-wrap: wrap;
  }

  .auto-redirect-hint {
    display: flex;
    align-items: center;
    gap: var(--text-sm);
    justify-content: center;
    font-size: var(--text-base);
    color: var(--el-text-color-secondary);

    .loading-icon {
      font-size: var(--text-2xl);
      color: var(--el-color-primary);
      animation: rotate 1s linear infinite;
    }

    html.dark & {
      color: rgba(255, 255, 255, 0.65);
    }
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.preview-mode-selector {
  margin-bottom: var(--text-3xl);
  text-align: center;
}

.text-preview {
  margin-top: var(--text-3xl);
}

.wechat-preview {
  margin-top: var(--text-3xl);
  display: flex;
  justify-content: center;
}

.content-summary {
  margin-top: var(--spacing-3xl);
}
</style>


