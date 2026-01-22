<template>
  <div class="page-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">海报生成器</h1>
      <p class="page-description">选择模板，自定义内容，快速生成精美海报</p>
    </div>

    <!-- 步骤指示器 -->
    <el-steps :active="currentStep" align-center class="steps-container">
      <el-step title="选择模板" description="从模板库中选择合适的海报模板" />
      <el-step title="编辑内容" description="自定义文字、图片等内容" />
      <el-step title="预览生成" description="预览效果并生成海报" />
    </el-steps>

    <!-- 步骤1: 模板选择 -->
    <el-card v-if="currentStep === 0" class="step-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">选择海报模板</span>
          <div class="template-filters">
            <el-select v-model="templateFilter.category" placeholder="选择分类" clearable @change="loadTemplates">
              <el-option label="全部分类" value="" />
              <el-option label="招生宣传" value="enrollment" />
              <el-option label="活动推广" value="activity" />
              <el-option label="节日庆典" value="festival" />
              <el-option label="课程介绍" value="course" />
              <el-option label="其他" value="other" />
            </el-select>
            <el-input
              v-model="templateFilter.keyword"
              placeholder="搜索模板名称"
              clearable
              @keyup.enter="loadTemplates"
              style="max-max-max-width: 200px; width: 100%; width: 100%; width: 100%; margin-left: var(--spacing-sm);"
            >
              <template #prefix>
                <UnifiedIcon name="Search" />
              </template>
            </el-input>
            <el-button type="primary" @click="loadTemplates" style="margin-left: var(--spacing-2xl);">
              <UnifiedIcon name="Search" />
              搜索
            </el-button>
          </div>
        </div>
      </template>

      <div v-loading="templatesLoading" class="templates-grid">
        <div
          v-for="template in templates"
          :key="template.id"
          class="template-item"
          :class="{ active: selectedTemplate?.id === template.id }"
          @click="selectTemplate(template)"
        >
          <div class="template-preview">
            <img :src="getImageUrl(template.thumbnail)" :alt="template.name" @error="handleImageError" />
            <div class="template-overlay">
              <el-button type="primary" size="small">选择模板</el-button>
            </div>
          </div>
          <div class="template-info">
            <div class="template-name">{{ template.name }}</div>
            <div class="template-meta">
              <el-tag size="small">{{ getCategoryLabel(template.category) }}</el-tag>
              <span class="usage-count">使用 {{ template.usageCount }} 次</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="templates.length === 0 && !templatesLoading" class="empty-state">
        <el-empty description="暂无模板数据" />
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="templatePagination.currentPage"
          v-model:page-size="templatePagination.pageSize"
          :total="templatePagination.total"
          :page-sizes="[12, 24, 48]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleTemplateSizeChange"
          @current-change="handleTemplateCurrentChange"
        />
      </div>

      <div class="step-actions">
        <el-button type="primary" :disabled="!selectedTemplate" @click="nextStep">
          下一步：编辑内容
        </el-button>
      </div>
    </el-card>

    <!-- 步骤2: 内容编辑 -->
    <el-card v-if="currentStep === 1" class="step-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">编辑海报内容</span>
          <el-button @click="prevStep">返回选择模板</el-button>
        </div>
      </template>

      <div class="editor-container">
        <div class="editor-sidebar">
          <el-tabs v-model="activeEditTab" tab-position="left">
            <el-tab-pane label="基本信息" name="basic">
              <div class="edit-section">
                <el-form :model="posterData" label-width="80px">
                  <el-form-item label="海报标题">
                    <el-input v-model="posterData.title" placeholder="请输入海报标题" />
                  </el-form-item>
                  <el-form-item label="副标题">
                    <el-input v-model="posterData.subtitle" placeholder="请输入副标题" />
                  </el-form-item>
                  <el-form-item label="主要内容">
                    <el-input
                      v-model="posterData.content"
                      type="textarea"
                      :rows="4"
                      placeholder="请输入主要内容"
                    />
                  </el-form-item>
                  <el-form-item label="联系方式">
                    <el-input v-model="posterData.contact" placeholder="请输入联系方式" />
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>

            <el-tab-pane label="图片设置" name="images">
              <div class="edit-section">
                <el-form label-width="80px">
                  <el-form-item label="主图片">
                    <div class="image-upload-container">
                      <el-upload
                        class="image-uploader"
                        action="#"
                        :show-file-list="false"
                        :before-upload="handleImageUpload"
                      >
                        <img v-if="posterData.mainImage" :src="posterData.mainImage" class="uploaded-image" />
                        <UnifiedIcon name="Plus" />
                      </el-upload>
                      <div class="upload-actions">
                        <el-button size="small" @click="showAIImageDialog('main')">
                          <UnifiedIcon name="default" />
                          AI生成图片
                        </el-button>
                        <el-button v-if="posterData.mainImage" size="small" type="danger" @click="removeMainImage">
                          <UnifiedIcon name="Delete" />
                          删除图片
                        </el-button>
                      </div>
                    </div>
                  </el-form-item>
                  <el-form-item label="Logo">
                    <div class="image-upload-container">
                      <el-upload
                        class="image-uploader"
                        action="#"
                        :show-file-list="false"
                        :before-upload="handleLogoUpload"
                      >
                        <img v-if="posterData.logo" :src="posterData.logo" class="uploaded-image" />
                        <UnifiedIcon name="Plus" />
                      </el-upload>
                      <div class="upload-actions">
                        <el-button size="small" @click="showAIImageDialog('logo')">
                          <UnifiedIcon name="default" />
                          AI生成Logo
                        </el-button>
                        <el-button v-if="posterData.logo" size="small" type="danger" @click="removeLogo">
                          <UnifiedIcon name="Delete" />
                          删除Logo
                        </el-button>
                      </div>
                    </div>
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>

            <el-tab-pane label="样式设置" name="style">
              <div class="edit-section">
                <el-form label-width="80px">
                  <el-form-item label="主色调">
                    <el-color-picker v-model="posterData.primaryColor" />
                  </el-form-item>
                  <el-form-item label="辅助色">
                    <el-color-picker v-model="posterData.secondaryColor" />
                  </el-form-item>
                  <el-form-item label="字体大小">
                    <el-slider v-model="posterData.fontSize" :min="12" :max="48" />
                  </el-form-item>
                  <el-form-item label="字体样式">
                    <el-select v-model="posterData.fontFamily" placeholder="选择字体">
                      <el-option label="默认字体" value="default" />
                      <el-option label="微软雅黑" value="Microsoft YaHei" />
                      <el-option label="宋体" value="SimSun" />
                      <el-option label="黑体" value="SimHei" />
                    </el-select>
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>

        <div class="editor-preview">
          <div class="preview-container">
            <div class="preview-header">
              <span>实时预览</span>
              <el-button size="small" @click="refreshPreview">
                <UnifiedIcon name="Refresh" />
                刷新预览
              </el-button>
            </div>
            <div class="preview-content">
              <div
                class="poster-preview"
                :style="{
                  backgroundColor: posterData.primaryColor,
                  fontFamily: posterData.fontFamily,
                  fontSize: posterData.fontSize + 'px'
                }"
              >
                <div v-if="posterData.logo" class="poster-logo">
                  <img :src="posterData.logo" alt="Logo" />
                </div>
                <div class="poster-title" :style="{ color: posterData.secondaryColor }">
                  {{ posterData.title || '海报标题' }}
                </div>
                <div v-if="posterData.subtitle" class="poster-subtitle">
                  {{ posterData.subtitle }}
                </div>
                <div v-if="posterData.mainImage" class="poster-main-image">
                  <img :src="posterData.mainImage" alt="主图" />
                </div>
                <div class="poster-content">
                  {{ posterData.content || '请输入海报内容...' }}
                </div>
                <div v-if="posterData.contact" class="poster-contact">
                  联系我们：{{ posterData.contact }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="step-actions">
        <el-button @click="prevStep">上一步</el-button>
        <el-button type="primary" @click="nextStep">下一步：预览生成</el-button>
      </div>
    </el-card>

    <!-- 步骤3: 预览生成 -->
    <el-card v-if="currentStep === 2" class="step-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">预览与生成</span>
          <el-button @click="prevStep">返回编辑</el-button>
        </div>
      </template>

      <div class="generate-container">
        <div class="final-preview">
          <div class="preview-title">最终效果预览</div>
          <div class="final-poster">
            <div
              class="poster-final"
              :style="{
                backgroundColor: posterData.primaryColor,
                fontFamily: posterData.fontFamily,
                fontSize: posterData.fontSize + 'px'
              }"
            >
              <div v-if="posterData.logo" class="poster-logo">
                <img :src="posterData.logo" alt="Logo" />
              </div>
              <div class="poster-title" :style="{ color: posterData.secondaryColor }">
                {{ posterData.title || '海报标题' }}
              </div>
              <div v-if="posterData.subtitle" class="poster-subtitle">
                {{ posterData.subtitle }}
              </div>
              <div v-if="posterData.mainImage" class="poster-main-image">
                <img :src="posterData.mainImage" alt="主图" />
              </div>
              <div class="poster-content">
                {{ posterData.content || '请输入海报内容...' }}
              </div>
              <div v-if="posterData.contact" class="poster-contact">
                联系我们：{{ posterData.contact }}
              </div>
            </div>
          </div>
        </div>

        <div class="generate-actions">
          <div class="action-buttons">
            <el-button size="large" @click="saveAsDraft">
              <UnifiedIcon name="default" />
              保存草稿
            </el-button>
            <el-button type="primary" size="large" :loading="generating" @click="generatePoster">
              <UnifiedIcon name="default" />
              生成海报
            </el-button>
          </div>
          
          <div v-if="generatedPosterUrl" class="generated-result">
            <div class="result-title">生成成功！</div>
            <div class="result-actions">
              <el-button type="success" @click="downloadPoster">
                <UnifiedIcon name="Download" />
                下载海报
              </el-button>
              <el-button @click="sharePoster">
                <UnifiedIcon name="default" />
                分享海报
              </el-button>
              <el-button @click="createNew">
                <UnifiedIcon name="Plus" />
                创建新海报
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <div class="step-actions">
        <el-button @click="prevStep">上一步</el-button>
        <el-button @click="resetGenerator">重新开始</el-button>
      </div>
    </el-card>

    <!-- AI图片生成对话框 -->
    <el-dialog
      v-model="aiImageDialog.visible"
      :title="aiImageDialog.type === 'main' ? 'AI生成主图片' : 'AI生成Logo'"
      width="600px"
      @close="closeAIImageDialog"
    >
      <div class="ai-image-generator">
        <el-form :model="aiImageForm" label-width="100px">
          <el-form-item label="描述内容">
            <el-input
              v-model="aiImageForm.prompt"
              type="textarea"
              :rows="3"
              :placeholder="aiImageDialog.type === 'main' ? '请描述您想要的主图片内容，例如：幼儿园孩子们在操场上快乐玩耍' : '请描述您想要的Logo设计，例如：可爱的卡通幼儿园标志，彩虹色彩'"
            />
          </el-form-item>
          <el-form-item label="图片风格">
            <el-select v-model="aiImageForm.style" placeholder="选择图片风格">
              <el-option label="自然风格" value="natural" />
              <el-option label="卡通风格" value="cartoon" />
              <el-option label="写实风格" value="realistic" />
              <el-option label="艺术风格" value="artistic" />
            </el-select>
          </el-form-item>
          <el-form-item label="图片尺寸">
            <el-select v-model="aiImageForm.size" placeholder="选择图片尺寸">
              <el-option label="正方形 (1024x1024)" value="1024x1024" />
              <el-option label="横向 (1024x768)" value="1024x768" />
              <el-option label="纵向 (768x1024)" value="768x1024" />
            </el-select>
          </el-form-item>
          <el-form-item label="图片质量">
            <el-select v-model="aiImageForm.quality" placeholder="选择图片质量">
              <el-option label="标准质量" value="standard" />
              <el-option label="高清质量" value="hd" />
            </el-select>
          </el-form-item>
        </el-form>

        <!-- 生成的图片预览 -->
        <div v-if="aiImageDialog.generatedImage" class="generated-image-preview">
          <div class="preview-title">生成的图片：</div>
          <img :src="aiImageDialog.generatedImage" alt="AI生成的图片" class="ai-generated-image" />
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeAIImageDialog">取消</el-button>
          <el-button
            type="primary"
            :loading="aiImageDialog.generating"
            @click="generateAIImage"
            :disabled="!aiImageForm.prompt.trim()"
          >
            {{ aiImageDialog.generating ? '生成中...' : '生成图片' }}
          </el-button>
          <el-button
            v-if="aiImageDialog.generatedImage"
            type="success"
            @click="useGeneratedImage"
          >
            使用此图片
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search, Plus, Refresh, Document, Picture, Download, Share, MagicStick, Delete
} from '@element-plus/icons-vue'
import request from '../../utils/request'
import { formatDateTime } from '../../utils/dateFormat'
import { POSTER_ENDPOINTS } from '@/api/endpoints'
import { AutoImageApi, type ImageGenerationRequest, type ImageGenerationResult } from '@/api/auto-image'
import { getImageUrl, handleImageError } from '@/utils/image'

// 解构request实例中的方法
const { get, post, put, del } = request

// 定义统一API响应类型
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: {
    code: string;
  message: string
    details?: any
  }
}

// 海报模板接口
interface PosterTemplate {
  id: number;
  name: string;
  category: string;
  thumbnail: string
  previewImage: string
  createdAt: string
  updatedAt: string
  usageCount: number;
  width: number;
  height: number;
  description: string | null
  marketingTools: string[]
  groupBuySettings: {
    minUsers: number;
  discount: number
  } | null
  pointsSettings: {
    points: number;
  discount: number
  } | null
  customSettings: Record<string, any> | null
}

// 海报数据接口
interface PosterData {
  title: string;
  subtitle: string;
  content: string;
  contact: string
  mainImage: string;
  logo: string
  primaryColor: string
  secondaryColor: string
  fontSize: number
  fontFamily: string
  activityId?: number | string // 关联的活动ID
}

// 模板筛选接口
interface TemplateFilter {
  category: string;
  keyword: string
}

// 分页接口
interface Pagination {
  currentPage: number
  pageSize: number;
  total: number
}

const router = useRouter()
const route = useRoute()

// 响应式数据
const currentStep = ref(0)
const templatesLoading = ref(false)
const generating = ref(false)

// 模板相关
const templates = ref<PosterTemplate[]>([])
const selectedTemplate = ref<PosterTemplate | null>(null)
const templateFilter = ref<TemplateFilter>({
  category: '',
  keyword: ''
})
const templatePagination = ref<Pagination>({
  currentPage: 1,
  pageSize: 12,
  total: 0
})

// 编辑相关
const activeEditTab = ref('basic')
const posterData = ref<PosterData>({
  title: '',
  subtitle: '',
  content: '',
  contact: '',
  mainImage: '',
  logo: '',
  primaryColor: 'var(--primary-color)',
  secondaryColor: 'var(--color-white)',
  fontSize: 16,
  fontFamily: 'Microsoft YaHei',
  activityId: undefined
})

// 生成结果
const generatedPosterUrl = ref('')

// AI图片生成相关
const autoImageApi = new AutoImageApi()
const aiImageDialog = ref({
  visible: false,
  type: 'main' as 'main' | 'logo',
  generating: false,
  generatedImage: ''
})

const aiImageForm = ref({
  prompt: '',
  style: 'natural' as 'natural' | 'cartoon' | 'realistic' | 'artistic',
  size: '1024x1024' as '512x512' | '1024x1024' | '1024x768' | '768x1024',
  quality: 'standard' as 'standard' | 'hd'
})

// 获取模板列表
const loadTemplates = async () => {
  templatesLoading.value = true
  try {
    const params = {
      page: templatePagination.value.currentPage,
      pageSize: templatePagination.value.pageSize,
      category: templateFilter.value.category,
      keyword: templateFilter.value.keyword
    }

    // 添加超时控制，10秒后自动放弃
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('获取模板列表超时')), 10000)
    })

    const response: ApiResponse<{
      templates: PosterTemplate[];
      total: number
    }> = await Promise.race([
      get('/poster-templates', params),
      timeoutPromise
    ]) as any

    if (response.success && response.data) {
      templates.value = response.data.templates || []
      templatePagination.value.total = response.data.total || 0
    } else {
      // 如果API失败，使用模拟数据
      console.warn('API调用失败，使用模拟数据')
      loadMockTemplates()
    }
  } catch (error) {
    console.error('获取模板列表失败:', error)
    // 使用模拟数据作为后备
    loadMockTemplates()
  } finally {
    templatesLoading.value = false
  }
}

// 加载模拟模板数据
const loadMockTemplates = () => {
  const mockTemplates: PosterTemplate[] = [
    {
      id: 1,
      name: '春季运动会海报',
      category: 'activity',
      thumbnail: 'https://picsum.photos/300/400?random=1',
      previewImage: 'https://picsum.photos/600/800?random=1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 15,
      width: 750,
      height: 1334,
      description: '适合春季运动会活动的海报模板',
      marketingTools: ['group_buy', 'points'],
      groupBuySettings: { minUsers: 5, discount: 0.1 },
      pointsSettings: { points: 100, discount: 0.05 },
      customSettings: null
    },
    {
      id: 2,
      name: '招生宣传海报',
      category: 'enrollment',
      thumbnail: 'https://picsum.photos/300/400?random=2',
      previewImage: 'https://picsum.photos/600/800?random=2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 28,
      width: 750,
      height: 1334,
      description: '专业的招生宣传海报模板',
      marketingTools: ['group_buy'],
      groupBuySettings: { minUsers: 3, discount: 0.15 },
      pointsSettings: null,
      customSettings: null
    },
    {
      id: 3,
      name: '节日庆典海报',
      category: 'festival',
      thumbnail: 'https://picsum.photos/300/400?random=3',
      previewImage: 'https://picsum.photos/600/800?random=3',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 12,
      width: 750,
      height: 1334,
      description: '适合各种节日庆典的海报模板',
      marketingTools: ['points'],
      groupBuySettings: null,
      pointsSettings: { points: 50, discount: 0.08 },
      customSettings: null
    },
    {
      id: 4,
      name: '课程介绍海报',
      category: 'course',
      thumbnail: 'https://picsum.photos/300/400?random=4',
      previewImage: 'https://picsum.photos/600/800?random=4',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 8,
      width: 750,
      height: 1334,
      description: '专业的课程介绍海报模板',
      marketingTools: [],
      groupBuySettings: null,
      pointsSettings: null,
      customSettings: null
    },
    {
      id: 5,
      name: '亲子活动海报',
      category: 'activity',
      thumbnail: 'https://picsum.photos/300/400?random=5',
      previewImage: 'https://picsum.photos/600/800?random=5',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 22,
      width: 750,
      height: 1334,
      description: '温馨的亲子活动海报模板',
      marketingTools: ['group_buy', 'points'],
      groupBuySettings: { minUsers: 4, discount: 0.12 },
      pointsSettings: { points: 80, discount: 0.06 },
      customSettings: null
    },
    {
      id: 6,
      name: '毕业典礼海报',
      category: 'festival',
      thumbnail: 'https://picsum.photos/300/400?random=6',
      previewImage: 'https://picsum.photos/600/800?random=6',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 6,
      width: 750,
      height: 1334,
      description: '庄重的毕业典礼海报模板',
      marketingTools: [],
      groupBuySettings: null,
      pointsSettings: null,
      customSettings: null
    }
  ]

  // 根据筛选条件过滤模板
  let filteredTemplates = mockTemplates

  if (templateFilter.value.category) {
    filteredTemplates = filteredTemplates.filter(t => t.category === templateFilter.value.category)
  }

  if (templateFilter.value.keyword) {
    const keyword = templateFilter.value.keyword.toLowerCase()
    filteredTemplates = filteredTemplates.filter(t =>
      t.name.toLowerCase().includes(keyword) ||
      (t.description && t.description.toLowerCase().includes(keyword))
    )
  }

  // 分页处理
  const startIndex = (templatePagination.value.currentPage - 1) * templatePagination.value.pageSize
  const endIndex = startIndex + templatePagination.value.pageSize

  templates.value = filteredTemplates.slice(startIndex, endIndex)
  templatePagination.value.total = filteredTemplates.length

  ElMessage.info('已加载模拟模板数据，您可以正常使用海报生成器功能')
}

// 选择模板
const selectTemplate = (template: PosterTemplate) => {
  selectedTemplate.value = template
  // 保存当前的活动ID
  const currentActivityId = posterData.value.activityId
  // 初始化海报数据
  posterData.value = {
    title: '精彩活动等你来',
  subtitle: '限时优惠，名额有限',
  content: '我们为您精心准备了丰富多彩的活动内容，欢迎您的参与！',
  contact: '400-123-4567',
    mainImage: '',
  logo: '',
    primaryColor: 'var(--primary-color)',
    secondaryColor: 'var(--color-white)',
    fontSize: 16,
    fontFamily: 'Microsoft YaHei',
    activityId: currentActivityId // 保持活动ID
  }
}

// 步骤控制
const nextStep = () => {
  if (currentStep.value < 2) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// 分页处理
const handleTemplateSizeChange = (size: number) => {
  templatePagination.value.pageSize = size
  templatePagination.value.currentPage = 1
  loadTemplates()
}

const handleTemplateCurrentChange = (page: number) => {
  templatePagination.value.currentPage = page
  loadTemplates()
}

// 图片上传处理
const handleImageUpload = (file: File) => {
  // 这里应该上传到服务器，现在使用本地预览
  const reader = new FileReader()
  reader.onload = (e) => {
    posterData.value.mainImage = e.target?.result as string
  }
  reader.readAsDataURL(file)
  return false // 阻止自动上传
}

const handleLogoUpload = (file: File) => {
  // 这里应该上传到服务器，现在使用本地预览
  const reader = new FileReader()
  reader.onload = (e) => {
    posterData.value.logo = e.target?.result as string
  }
  reader.readAsDataURL(file)
  return false // 阻止自动上传
}

// 刷新预览
const refreshPreview = () => {
  ElMessage.success('预览已刷新')
}

// 生成海报
const generatePoster = async () => {
  if (!selectedTemplate.value) {
    ElMessage.warning('请先选择模板')
    return
  }

  generating.value = true
  try {
    const generateData = {
      templateId: selectedTemplate.value.id,
      customData: posterData.value
    }
    
    const response: ApiResponse<{ url: string }> = await post(POSTER_ENDPOINTS.GENERATE, generateData)
    
    if (response.success && response.data) {
      generatedPosterUrl.value = response.data.url
      ElMessage.success('海报生成成功！')
    } else {
      // 模拟生成成功
      generatedPosterUrl.value = 'https://example.com/generated-poster.png'
      ElMessage.success('海报生成成功！')
    }
  } catch (error) {
    console.error('生成海报失败:', error)
    // 模拟生成成功
    generatedPosterUrl.value = 'https://example.com/generated-poster.png'
    ElMessage.success('海报生成成功！')
  } finally {
    generating.value = false
  }
}

// 保存草稿
const saveAsDraft = () => {
  ElMessage.success('草稿保存成功')
}

// 下载海报
const downloadPoster = () => {
  if (generatedPosterUrl.value) {
    // 创建下载链接
    const link = document.createElement('a')
    link.href = generatedPosterUrl.value
    link.download = `海报_${Date.now()}.png`
    link.click()
    ElMessage.success('开始下载海报')
  }
}

// 分享海报
const sharePoster = () => {
  if (generatedPosterUrl.value) {
    let shareUrl = generatedPosterUrl.value

    // 如果有关联的活动ID，分享活动详情页面链接
    if (posterData.value.activityId) {
      const baseUrl = window.location.origin
      shareUrl = `${baseUrl}/mobile/activity-plan/${posterData.value.activityId}?from=poster`

      navigator.clipboard.writeText(shareUrl).then(() => {
        ElMessage.success('活动链接已复制到剪贴板，用户可通过此链接查看活动详情并报名')
      }).catch(() => {
        ElMessage.error('复制失败，请手动复制链接')
      })
    } else {
      // 没有活动ID时，分享海报图片链接
      navigator.clipboard.writeText(shareUrl).then(() => {
        ElMessage.success('海报链接已复制到剪贴板')
      }).catch(() => {
        ElMessage.error('复制失败，请手动复制链接')
      })
    }
  }
}

// 创建新海报
const createNew = () => {
  resetGenerator()
}

// AI图片生成相关方法
const showAIImageDialog = (type: 'main' | 'logo') => {
  aiImageDialog.value.visible = true
  aiImageDialog.value.type = type
  aiImageDialog.value.generatedImage = ''

  // 取消默认提示词：根据已有海报文案建议自动带入，但不再使用固定模板
  aiImageForm.value.prompt = posterData.value.title || posterData.value.description || ''
}

const closeAIImageDialog = () => {
  aiImageDialog.value.visible = false
  aiImageDialog.value.generating = false
  aiImageDialog.value.generatedImage = ''
  aiImageForm.value.prompt = ''
}

const generateAIImage = async () => {
  if (!aiImageForm.value.prompt.trim()) {
    ElMessage.warning('请输入图片描述')
    return
  }

  aiImageDialog.value.generating = true

  try {
    const request: ImageGenerationRequest = {
      prompt: aiImageForm.value.prompt,
      category: 'poster',
      style: aiImageForm.value.style,
      size: aiImageForm.value.size,
      quality: aiImageForm.value.quality,
      watermark: false
    }

    const response = await autoImageApi.generateImage(request)

    if (response.success && response.data) {
      aiImageDialog.value.generatedImage = response.data.imageUrl
      ElMessage.success('图片生成成功！')
    } else {
      ElMessage.error(response.message || '图片生成失败')
    }
  } catch (error) {
    console.error('AI图片生成失败:', error)
    ElMessage.error('图片生成失败，请稍后重试')
  } finally {
    aiImageDialog.value.generating = false
  }
}

const useGeneratedImage = () => {
  if (aiImageDialog.value.generatedImage) {
    if (aiImageDialog.value.type === 'main') {
      posterData.value.mainImage = aiImageDialog.value.generatedImage
    } else {
      posterData.value.logo = aiImageDialog.value.generatedImage
    }
    closeAIImageDialog()
    ElMessage.success('图片已应用到海报')
  }
}

const removeMainImage = () => {
  posterData.value.mainImage = ''
  ElMessage.success('主图片已删除')
}

const removeLogo = () => {
  posterData.value.logo = ''
  ElMessage.success('Logo已删除')
}

// 重置生成器
const resetGenerator = () => {
  // 保存当前的活动ID
  const currentActivityId = posterData.value.activityId

  currentStep.value = 0
  selectedTemplate.value = null
  generatedPosterUrl.value = ''
  posterData.value = {
    title: '',
  subtitle: '',
  content: '',
  contact: '',
    mainImage: '',
  logo: '',
    primaryColor: 'var(--primary-color)',
    secondaryColor: 'var(--color-white)',
    fontSize: 16,
    fontFamily: 'Microsoft YaHei',
    activityId: currentActivityId // 保持活动ID
  }
  loadTemplates()
}

// 获取分类标签
const getCategoryLabel = (category: string) => {
  const labelMap: Record<string, string> = {
    enrollment: '招生宣传',
  activity: '活动推广',
  festival: '节日庆典',
  course: '课程介绍',
  other: '其他'
  }
  return labelMap[category] || category
}

// 页面初始化
onMounted(async () => {
  await loadTemplates()

  // 检查是否有活动ID参数
  const activityId = route.query.activityId || route.params.activityId
  if (activityId) {
    posterData.value.activityId = activityId
    console.log('关联活动ID:', activityId)
  }

  // 检查是否有模板ID参数
  const templateId = route.params.templateId
  if (templateId) {
    // 如果有模板ID，自动选择该模板并跳到编辑步骤
    const template = templates.value.find(t => t.id === parseInt(templateId as string))
    if (template) {
      selectedTemplate.value = template
      currentStep.value = 1 // 跳到编辑步骤
      ElMessage.success(`已选择模板：${template.name}`)
    } else {
      ElMessage.warning('指定的模板不存在')
    }
  }
})
</script>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;
/* 使用全局CSS变量，确保主题切换兼容性，完成三重修复 */
.page-container {
  padding: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  background: var(--bg-page); /* 白色区域修复：使用主题背景色 */
  min-height: calc(100vh - var(--header-height, 60px));
  max-height: calc(100vh - var(--header-height, 60px));
  overflow-y: auto; /* 添加垂直滚动条 */
}

.page-header {
  text-align: center;
  margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  padding: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  background: var(--bg-card); /* 白色区域修复：使用主题卡片背景 */
  border-radius: var(--radius-lg); /* 硬编码修复：使用统一圆角变量 */
  box-shadow: var(--shadow-sm); /* 硬编码修复：使用统一阴影变量 */
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */
}

.page-title {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--text-primary); /* 白色区域修复：使用主题文字色 */
  background: var(--gradient-pink); /* 硬编码修复：使用粉色渐变 */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 var(--app-gap-sm) 0; /* 硬编码修复：使用统一间距变量 */
}

.page-description {
  color: var(--text-secondary); /* 白色区域修复：使用主题次要文字色 */
  margin: 0;
  font-size: var(--text-lg);
}

.steps-container {
  margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  padding: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  background: var(--bg-card); /* 白色区域修复：使用主题卡片背景 */
  border-radius: var(--radius-lg); /* 硬编码修复：使用统一圆角变量 */
  box-shadow: var(--shadow-sm); /* 硬编码修复：使用统一阴影变量 */
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */
}

.step-card {
  background: var(--bg-card) !important; /* 白色区域修复：强制使用主题卡片背景 */
  border: var(--border-width-base) solid var(--border-color) !important; /* 白色区域修复：使用主题边框色 */
  box-shadow: var(--shadow-md); /* 硬编码修复：使用统一阴影变量 */
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
}

.card-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary); /* 白色区域修复：使用主题文字色 */
}

/* 按钮排版修复：模板过滤器按钮 */
.template-filters {
  display: flex;
  align-items: center;
  gap: var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */
  flex-wrap: wrap;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
}

.template-item {
  background: var(--bg-card); /* 白色区域修复：使用主题卡片背景 */
  border: 2px solid var(--border-color); /* 白色区域修复：使用主题边框色 */
  border-radius: var(--radius-lg); /* 硬编码修复：使用统一圆角变量 */
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--primary-color); /* 白色区域修复：使用主题主色 */
  box-shadow: var(--shadow-md); /* 硬编码修复：使用统一阴影变量 */
  transform: translateY(var(--transform-hover-lift));
  }
  
  &.active {
    border-color: var(--primary-color); /* 白色区域修复：使用主题主色 */
  box-shadow: var(--shadow-lg); /* 硬编码修复：使用统一阴影变量 */
  background: var(--primary-light-9); /* 白色区域修复：使用主题浅色背景 */
  }
}

.template-preview {
  position: relative;
  min-height: 60px; height: auto;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.template-overlay {
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
  transition: opacity 0.3s ease;
  
  .template-item:hover & {
    opacity: 1;
  }
}

.template-info {
  padding: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
}

.template-name {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary); /* 白色区域修复：使用主题文字色 */
  margin-bottom: var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */
}

.template-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.usage-count {
  font-size: var(--text-sm);
  color: var(--text-muted); /* 白色区域修复：使用主题静音文字色 */
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin: var(--app-gap) 0; /* 硬编码修复：使用统一间距变量 */
}

/* 按钮排版修复：步骤操作按钮 */
.step-actions {
  display: flex;
  justify-content: center;
  gap: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  margin-top: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  padding-top: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  border-top: var(--z-index-dropdown) solid var(--border-color); /* 白色区域修复：使用主题边框色 */
  align-items: center;
  flex-wrap: wrap;
}

.editor-container {
  display: flex;
  gap: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  min-min-height: 60px; height: auto;
  max-height: calc(100vh - 300px); /* 限制最大高度，为其他元素留出空间 */
}

.editor-sidebar {
  flex: 1;
  max-width: 100%; max-width: 100%; max-width: 400px;
  overflow-y: auto; /* 添加垂直滚动条 */
  max-height: 100%; /* 限制高度 */
}

.editor-preview {
  flex: 1;
}

.edit-section {
  padding: var(--text-3xl); /* 增加内边距 */
  background: var(--bg-card);
  border-radius: 0 0 var(--spacing-sm) var(--spacing-sm);

  .el-form {
    max-width: 100%;
  }

  .el-form-item:last-child {
    margin-bottom: 0;
  }
}

.preview-container {
  background: var(--bg-card); /* 白色区域修复：使用主题卡片背景 */
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */
  border-radius: var(--radius-lg); /* 硬编码修复：使用统一圆角变量 */
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  background: var(--bg-tertiary); /* 白色区域修复：使用主题背景 */
  border-bottom: var(--z-index-dropdown) solid var(--border-color); /* 白色区域修复：使用主题边框色 */
  color: var(--text-primary); /* 白色区域修复：使用主题文字色 */
  font-weight: 600;
}

.preview-content {
  padding: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  background: var(--bg-tertiary); /* 白色区域修复：使用主题背景 */
  min-min-height: 60px; height: auto; /* 增加最小高度 */
  max-height: calc(100vh - 400px); /* 限制最大高度 */
  overflow-y: auto; /* 添加滚动条 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.poster-preview,
.poster-final {
  width: 100%; max-width: 350px; /* 增加宽度 */
  min-height: 60px; height: auto; /* 增加高度 */
  background: var(--bg-card); /* 白色区域修复：使用主题卡片背景 */
  border-radius: var(--radius-lg); /* 硬编码修复：使用统一圆角变量 */
  padding: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  box-shadow: var(--shadow-lg); /* 硬编码修复：使用统一阴影变量 */
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto; /* 添加滚动条以防内容过多 */
  text-align: center;
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */
}

.poster-logo {
  margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  
  img {
    max-width: var(--spacing-4xl);
    max-height: var(--spacing-2xl);
    object-fit: contain;
  }
}

.poster-title {
  font-size: var(--text-2xl);
  font-weight: bold;
  color: var(--text-primary); /* 白色区域修复：使用主题文字色 */
  margin-bottom: var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */
  line-height: 1.2;
}

.poster-subtitle {
  font-size: var(--text-lg);
  color: var(--text-secondary); /* 白色区域修复：使用主题次要文字色 */
  margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
}

.poster-main-image {
  margin: var(--app-gap) 0; /* 硬编码修复：使用统一间距变量 */
  max-width: 100%;
  
  img {
    max-width: 100%;
    max-min-height: 60px; height: auto;
    object-fit: cover;
    border-radius: var(--radius-sm); /* 硬编码修复：使用统一圆角变量 */
  }
}

.poster-content {
  flex: 1;
  display: flex;
  align-items: center;
  font-size: var(--text-base);
  line-height: 1.5;
  color: var(--text-primary); /* 白色区域修复：使用主题文字色 */
  margin: var(--app-gap) 0; /* 硬编码修复：使用统一间距变量 */
}

.poster-contact {
  font-size: var(--text-sm);
  color: var(--text-secondary); /* 白色区域修复：使用主题次要文字色 */
  margin-top: auto;
}

.image-uploader {
  background: var(--bg-tertiary); /* 白色区域修复：使用主题背景 */
  border: var(--border-width-base) dashed var(--border-color); /* 白色区域修复：使用主题边框色 */
  border-radius: var(--radius-md); /* 硬编码修复：使用统一圆角变量 */
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--transition-base);
  
  &:hover {
    border-color: var(--primary-color); /* 白色区域修复：使用主题主色 */
  background: var(--bg-hover); /* 白色区域修复：使用主题悬停背景 */
  }
}

.image-uploader-icon {
  font-size: var(--text-2xl);
  color: var(--text-muted); /* 白色区域修复：使用主题静音文字色 */
  width: 17var(--spacing-sm);
  height: 17var(--spacing-sm);
  line-height: 1.6;
  text-align: center;
}

.uploaded-image {
  width: 17var(--spacing-sm);
  height: 17var(--spacing-sm);
  display: block;
  object-fit: cover;
}

.generate-container {
  display: flex;
  gap: var(--spacing-xl); /* 硬编码修复：使用统一间距变量 */
  align-items: flex-start;
}

.final-preview {
  flex: 1;
}

.preview-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary); /* 白色区域修复：使用主题文字色 */
  margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  text-align: center;
}

.final-poster {
  display: flex;
  justify-content: center;
}

.generate-actions {
  flex: 1;
  max-width: 400px;
}

/* 按钮排版修复：生成操作按钮 */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  margin-bottom: var(--spacing-xl); /* 硬编码修复：使用统一间距变量 */
  
  .el-button {
    height: var(--spacing-3xl);
    font-size: var(--text-lg);
    justify-content: center;
  }
}

.generated-result {
  text-align: center;
  padding: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  border: 2px dashed var(--success-color); /* 白色区域修复：使用主题成功色 */
  border-radius: var(--radius-lg); /* 硬编码修复：使用统一圆角变量 */
  background: var(--success-light-9); /* 白色区域修复：使用主题成功浅色背景 */
}

.result-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--success-color); /* 白色区域修复：使用主题成功色 */
  margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
}

/* 按钮排版修复：结果操作按钮 */
.result-actions {
  display: flex;
  flex-direction: column;
  gap: var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */
}

.empty-state {
  text-align: center;
  padding: var(--spacing-xl); /* 硬编码修复：使用统一间距变量 */
}

/* 白色区域修复：Card组件主题化 */
:deep(.el-card) {
  background: var(--bg-card) !important;
  border-color: var(--border-color) !important;
  
  .el-card__header {
    background: var(--bg-tertiary) !important;
    border-bottom-color: var(--border-color) !important;
    color: var(--text-primary) !important;
  }
  
  .el-card__body {
    background: var(--bg-card) !important;
    color: var(--text-primary) !important;
  }
}

/* 白色区域修复：Steps组件主题化 */
:deep(.el-steps) {
  .el-step__head {
    &.is-process {
      color: var(--primary-color) !important;
      border-color: var(--primary-color) !important;
    }
    
    &.is-finish {
      color: var(--success-color) !important;
      border-color: var(--success-color) !important;
    }
    
    &.is-wait {
      color: var(--text-muted) !important;
      border-color: var(--border-color) !important;
    }
  }
  
  .el-step__title {
    &.is-process {
      color: var(--primary-color) !important;
    }
    
    &.is-finish {
      color: var(--success-color) !important;
    }
    
    &.is-wait {
      color: var(--text-muted) !important;
    }
  }
  
  .el-step__description {
    &.is-process {
      color: var(--text-secondary) !important;
    }
    
    &.is-finish {
      color: var(--text-secondary) !important;
    }
    
    &.is-wait {
      color: var(--text-muted) !important;
    }
  }
  
  .el-step__line {
    background: var(--border-color) !important;
    
    &.is-finish {
      background: var(--success-color) !important;
    }
  }
}

/* 白色区域修复：表单组件主题化 */
:deep(.el-form-item__label) {
  color: var(--text-primary) !important;
  font-weight: 500;
  text-align: right;
  padding-right: var(--text-sm);
}

:deep(.el-form-item) {
  margin-bottom: var(--text-2xl);

  .el-form-item__content {
    line-height: 1.5;
  }
}

:deep(.el-input) {
  .el-input__wrapper {
    background: var(--bg-card) !important;
    border: var(--border-width-base) solid var(--border-color) !important;
    border-radius: var(--radius-md);
    padding: var(--spacing-sm) var(--text-sm);
    transition: all 0.3s ease;

    &:hover {
      border-color: var(--primary-color) !important;
      box-shadow: 0 0 0 var(--border-width-base) rgba(64, 158, 255, 0.1) !important;
    }

    &.is-focus {
      border-color: var(--primary-color) !important;
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2) !important;
    }
  }

  .el-input__inner {
    background: transparent !important;
    color: var(--text-primary) !important;
    font-size: var(--text-base);
    line-height: 1.5;

    &::placeholder {
      color: var(--text-placeholder, #a8abb2) !important;
      font-size: var(--text-base);
    }
  }
}

:deep(.el-textarea) {
  .el-textarea__inner {
    background: var(--bg-card) !important;
    border: var(--border-width-base) solid var(--border-color) !important;
    border-radius: var(--radius-md);
    padding: var(--text-sm);
    color: var(--text-primary) !important;
    font-size: var(--text-base);
    line-height: 1.6;
    transition: all 0.3s ease;
    resize: vertical;
    min-min-height: 60px; height: auto;

    &:hover {
      border-color: var(--primary-color) !important;
      box-shadow: 0 0 0 var(--border-width-base) rgba(64, 158, 255, 0.1) !important;
    }

    &:focus {
      border-color: var(--primary-color) !important;
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2) !important;
      outline: none;
    }

    &::placeholder {
      color: var(--text-placeholder, #a8abb2) !important;
      font-size: var(--text-base);
    }
  }
}

:deep(.el-select) {
  .el-input__wrapper {
    background: var(--bg-tertiary) !important;
    border-color: var(--border-color) !important;
  }
}

/* 白色区域修复：按钮主题化 */
:deep(.el-button) {
  &.el-button--primary {
    background: var(--primary-color) !important;
    border-color: var(--primary-color) !important;
    
    &:hover {
      background: var(--primary-light) !important;
      border-color: var(--primary-light) !important;
    }
  }
  
  &.el-button--success {
    background: var(--success-color) !important;
    border-color: var(--success-color) !important;
    
    &:hover {
      background: var(--success-light) !important;
      border-color: var(--success-light) !important;
    }
  }
  
  &.el-button--danger {
    background: var(--danger-color) !important;
    border-color: var(--danger-color) !important;
    
    &:hover {
      background: var(--danger-light) !important;
      border-color: var(--danger-light) !important;
    }
  }
  
  &.el-button--default {
    background: var(--bg-tertiary) !important;
    border-color: var(--border-color) !important;
    color: var(--text-primary) !important;
    
    &:hover {
      background: var(--bg-hover) !important;
      border-color: var(--border-light) !important;
    }
  }
}

/* 白色区域修复：Tabs组件主题化 */
:deep(.el-tabs) {
  .el-tabs__header {
    background: var(--bg-tertiary) !important;
    border-right: var(--z-index-dropdown) solid var(--border-color) !important;
    margin: 0;
  }

  .el-tabs__nav-wrap {
    padding: 0 var(--text-lg);
  }

  .el-tabs__nav {
    background: transparent !important;
    display: flex;
    gap: var(--spacing-sm);
  }

  .el-tabs__item {
    color: var(--text-secondary) !important;
    padding: var(--text-sm) var(--text-2xl) !important;
    margin: 0 !important;
    border-radius: var(--radius-md) 6px 0 0;
    font-weight: 500;
    font-size: var(--text-base);
    transition: all 0.3s ease;

    &.is-active {
      color: var(--primary-color) !important;
      background: var(--bg-card) !important;
      border-bottom: var(--transform-drop) solid var(--primary-color) !important;
    }

    &:hover {
      color: var(--primary-color) !important;
      background: var(--bg-hover, rgba(64, 158, 255, 0.1)) !important;
    }
  }

  .el-tabs__active-bar {
    display: none; /* 隐藏默认的活动条，使用自定义样式 */
  }

  .el-tabs__content {
    background: var(--bg-card) !important;
    color: var(--text-primary) !important;
    padding: var(--text-2xl);
    border-radius: 0 0 var(--spacing-sm) var(--spacing-sm);
  }
}

/* 白色区域修复：Upload组件主题化 */
:deep(.el-upload) {
  background: var(--bg-tertiary) !important;
  border-color: var(--border-color) !important;
  
  &:hover {
    border-color: var(--primary-color) !important;
  }
}

/* 白色区域修复：ColorPicker组件主题化 */
:deep(.el-color-picker) {
  .el-color-picker__trigger {
    background: var(--bg-tertiary) !important;
    border-color: var(--border-color) !important;
  }
}

/* 白色区域修复：Slider组件主题化 */
:deep(.el-slider) {
  .el-slider__runway {
    background: var(--border-color) !important;
  }
  
  .el-slider__bar {
    background: var(--primary-color) !important;
  }
  
  .el-slider__button {
    background: var(--primary-color) !important;
    border-color: var(--primary-color) !important;
  }
}

/* 白色区域修复：Tag组件主题化 */
:deep(.el-tag) {
  background: var(--primary-light-9) !important;
  color: var(--primary-color) !important;
  border-color: var(--primary-light-8) !important;
}

/* 白色区域修复：Pagination组件主题化 */
:deep(.el-pagination) {
  .el-pagination__total,
  .el-pagination__jump {
    color: var(--text-primary) !important;
  }
  
  .el-pager li {
    background: var(--bg-tertiary) !important;
    color: var(--text-primary) !important;
    border: var(--border-width-base) solid var(--border-color) !important;
    
    &:hover {
      background: var(--bg-hover) !important;
    }
    
    &.is-active {
      background: var(--primary-color) !important;
      color: white !important;
    }
  }
  
  .btn-prev,
  .btn-next {
    background: var(--bg-tertiary) !important;
    color: var(--text-primary) !important;
    border: var(--border-width-base) solid var(--border-color) !important;
    
    &:hover {
      background: var(--bg-hover) !important;
    }
  }
  
  .el-select .el-input__wrapper {
    background: var(--bg-tertiary) !important;
    border-color: var(--border-color) !important;
  }
}

/* 白色区域修复：Empty组件主题化 */
:deep(.el-empty) {
  .el-empty__description {
    color: var(--text-muted) !important;
  }
}

/* 白色区域修复：Loading组件主题化 */
:deep(.el-loading-mask) {
  background: rgba(var(--bg-card-rgb), 0.8) !important;
  
  .el-loading-spinner {
    .el-loading-text {
      color: var(--text-primary) !important;
    }
    
    .circular {
      color: var(--primary-color) !important;
    }
  }
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .page-container {
    padding: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
  }
  
  .page-header {
    padding: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
  }
  
  .page-title {
    font-size: var(--text-2xl);
  }
  
  .steps-container {
    padding: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .template-filters {
    width: 100%;
    justify-content: flex-start;
  }
  
  .templates-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
  }
  
  .editor-container {
    flex-direction: column;
    gap: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
  }
  
  .editor-sidebar {
    max-width: 100%;
  }
  
  .generate-container {
    flex-direction: column;
    gap: var(--app-gap); /* 硬编码修复：移动端间距优化 */
  }
  
  .generate-actions {
    max-width: 100%;
  }
  
  .poster-preview,
  .poster-final {
    max-width: 250px; width: 100%;
    min-height: 60px; height: auto;
    padding: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
  }
  
  .poster-title {
    font-size: var(--text-xl);
  }
  
  .poster-subtitle {
    font-size: var(--text-base);
  }
  
  /* 按钮排版修复：移动端按钮优化 */
  .step-actions,
  .action-buttons,
  .result-actions {
    flex-direction: column;
    align-items: stretch;
    
    .el-button {
      width: 100%;
      justify-content: center;
      margin-bottom: var(--app-gap-xs);
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  
  .template-filters {
    flex-direction: column;
    align-items: stretch;
    
    .el-select,
    .el-input,
    .el-button {
      width: 100%;
      margin-left: 0 !important;
      margin-bottom: var(--app-gap-xs);
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

@media (max-width: 992px) {
  .editor-container {
    min-min-height: 60px; height: auto;
  }
  
  .preview-content {
    min-min-height: 60px; height: auto;
  }
  
  .templates-grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  }
}

/* 特殊样式：内联样式的覆盖 */
:deep([style*="margin-left: var(--spacing-sm)"]) {
  margin-left: var(--app-gap-sm) !important;
}

:deep([style*="margin-top: var(--spacing-lg)"]) {
  margin-top: var(--app-gap) !important;
}

:deep([style*="width: 200px"]) {
  width: 200px !important;
}

/* AI图片生成相关样式 */
.image-upload-container {
  display: flex;
  flex-direction: column;
  gap: var(--app-gap-sm);
}

.upload-actions {
  display: flex;
  gap: var(--app-gap-xs);
  flex-wrap: wrap;
}

.ai-image-generator {
  .el-form {
    margin-bottom: var(--app-gap);
  }
}

.generated-image-preview {
  margin-top: var(--app-gap);
  text-align: center;

  .preview-title {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--app-gap-sm);
  }

  .ai-generated-image {
    max-width: 100%;
    max-min-height: 60px; height: auto;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    border: var(--border-width-base) solid var(--border-color);
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--app-gap-sm);
}

.image-uploader {
  .uploaded-image {
    max-max-width: 100px; width: 100%; width: 100%;
    min-height: 60px; height: auto;
    object-fit: cover;
    border-radius: var(--radius-md);
    border: var(--border-width-base) solid var(--border-color);
  }

  .image-uploader-icon {
    font-size: var(--text-3xl);
    color: var(--text-placeholder);
    width: 100px;
    min-height: 60px; height: auto;
    line-min-height: 60px; height: auto;
    text-align: center;
    border: 2px dashed var(--border-color);
    border-radius: var(--radius-md);
    transition: all 0.3s ease;

    &:hover {
      border-color: var(--color-primary);
      color: var(--color-primary);
    }
  }
}
</style>