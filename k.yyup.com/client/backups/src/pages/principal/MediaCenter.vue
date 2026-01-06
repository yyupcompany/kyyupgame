<template>
  <div class="media-center">
    <CenterContainer
      title="新媒体中心"
      :tabs="tabs"
      default-tab="overview"
      v-model:activeTab="activeTab"
      :show-header="false"
      :show-actions="false"
      :sync-url="false"
      @create="handleQuickCreate"
      @tab-change="handleTabChange"
    >
    <!-- 概览标签页 -->
    <template #tab-overview>
      <div class="media-center">
        <!-- 功能卡片 -->
        <div class="feature-cards">
          <div class="feature-card feature-card--copywriting" @click="handleFeatureClick('copywriting')">
            <div class="card-icon">
              <el-icon><Edit /></el-icon>
            </div>
            <div class="card-content">
              <h3>文案创作</h3>
              <p>AI智能生成营销文案、活动宣传、节日祝福等内容</p>
              <div class="card-stats">
                <span>支持7大平台</span>
                <span>7种文案类型</span>
              </div>
            </div>
          </div>

          <div class="feature-card feature-card--article" @click="handleFeatureClick('article')">
            <div class="card-icon">
              <el-icon><Document /></el-icon>
            </div>
            <div class="card-content">
              <h3>图文创作</h3>
              <p>生成图文并茂的推广内容，包含配图建议和排版方案</p>
              <div class="card-stats">
                <span>6大平台</span>
                <span>智能配图</span>
              </div>
            </div>
          </div>

          <div class="feature-card feature-card--video" @click="handleFeatureClick('video')">
            <div class="card-icon">
              <el-icon><VideoCamera /></el-icon>
            </div>
            <div class="card-content">
              <h3>视频创作</h3>
              <p>AI生成视频脚本，支持文生视频和首帧生视频</p>
              <div class="card-stats">
                <span>7大平台</span>
                <span>3种创作模式</span>
              </div>
            </div>
          </div>

          <div class="feature-card feature-card--tts" @click="handleFeatureClick('tts')">
            <div class="card-icon">
              <el-icon><Microphone /></el-icon>
            </div>
            <div class="card-content">
              <h3>文字转语音</h3>
              <p>将文字内容转换为自然流畅的语音，支持多种音色</p>
              <div class="card-stats">
                <span>6种音色</span>
                <span>4种格式</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 最近创作 -->
        <div class="recent-section">
          <div class="section-header">
            <h3>最近创作</h3>
            <el-button text @click="showAllHistoryDialog = true">查看全部</el-button>
          </div>
          <div class="recent-list">
            <div
              v-for="item in recentCreations"
              :key="item.id"
              class="recent-item"
            >
              <div class="recent-icon">
                <el-icon v-if="item.type === 'copywriting'"><Edit /></el-icon>
                <el-icon v-else-if="item.type === 'article'"><Document /></el-icon>
                <el-icon v-else><VideoCamera /></el-icon>
              </div>
              <div class="recent-info">
                <h4>{{ item.title }}</h4>
                <div class="recent-meta">
                  <el-tag size="small" :type="getTypeTagType(item.type)">
                    {{ getTypeLabel(item.type) }}
                  </el-tag>
                  <span class="recent-time">{{ formatTime(item.createdAt) }}</span>
                </div>
              </div>
              <div class="recent-actions">
                <el-button size="small" text @click="viewCreation(item)">查看</el-button>
                <el-button size="small" text @click="editCreation(item)">编辑</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 文案创作标签页 -->
    <template #tab-copywriting>
      <CopywritingCreator @content-created="handleContentCreated" />
    </template>

    <!-- 图文创作标签页 -->
    <template #tab-article>
      <ArticleCreator @content-created="handleContentCreated" />
    </template>

    <!-- 视频创作标签页 -->
    <template #tab-video>
      <VideoCreator @content-created="handleContentCreated" />
    </template>

    <!-- 文字转语音标签页 -->
    <template #tab-tts>
      <TextToSpeech @audio-created="handleAudioCreated" />
    </template>

    <!-- 创作历史标签页 -->
    <template #tab-history>
      <div class="history-content">
        <div class="history-header">
          <div class="history-filters">
            <el-select v-model="historyFilter.type" placeholder="内容类型" clearable style="width: 120px">
              <el-option label="全部" value="" />
              <el-option label="文案" value="copywriting" />
              <el-option label="图文" value="article" />
              <el-option label="视频" value="video" />
            </el-select>
            <el-select v-model="historyFilter.platform" placeholder="发布平台" clearable style="width: 120px">
              <el-option label="全部平台" value="" />
              <el-option label="微信" value="wechat" />
              <el-option label="抖音" value="douyin" />
              <el-option label="小红书" value="xiaohongshu" />
            </el-select>
            <el-input
              v-model="historyFilter.keyword"
              placeholder="搜索标题"
              clearable
              style="width: 200px"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          <div class="history-actions">
            <el-button @click="exportHistory">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
            <el-button type="danger" @click="clearHistory">
              <el-icon><Delete /></el-icon>
              清空
            </el-button>
          </div>
        </div>

        <div class="history-list">
          <div
            v-for="item in filteredHistory"
            :key="item.id"
            class="history-item"
          >
            <div class="history-item-header">
              <div class="history-item-left">
                <div class="history-icon">
                  <el-icon v-if="item.type === 'copywriting'"><Edit /></el-icon>
                  <el-icon v-else-if="item.type === 'article'"><Document /></el-icon>
                  <el-icon v-else><VideoCamera /></el-icon>
                </div>
                <div class="history-info">
                  <h4 class="history-title">{{ item.title }}</h4>
                  <div class="history-meta">
                    <el-tag size="small" :type="getTypeTagType(item.type)">
                      {{ getTypeLabel(item.type) }}
                    </el-tag>
                    <span class="history-platform">{{ item.platform }}</span>
                    <span class="history-time">{{ formatTime(item.createdAt) }}</span>
                  </div>
                </div>
              </div>
              <div class="history-actions">
                <el-button size="small" @click="viewCreation(item)">查看</el-button>
                <el-button size="small" @click="editCreation(item)">编辑</el-button>
                <el-button size="small" @click="copyCreation(item)">复制</el-button>
                <el-button size="small" type="danger" @click="deleteCreation(item)">删除</el-button>
              </div>
            </div>
            <div class="history-preview" v-if="item.preview">
              {{ item.preview }}
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- AI智能创作对话框 -->
    <el-dialog
      v-model="showQuickCreateDialog"
      title="AI智能创作"
      width="600px"
    >
      <div class="quick-create">
        <div class="create-options">
          <div
            class="create-option"
            :class="{ active: quickCreateType === 'copywriting' }"
            @click="quickCreateType = 'copywriting'"
          >
            <el-icon class="option-icon"><Edit /></el-icon>
            <div class="option-content">
              <h3>文案创作</h3>
              <p>AI智能生成营销文案、活动宣传等</p>
            </div>
          </div>

          <div
            class="create-option"
            :class="{ active: quickCreateType === 'article' }"
            @click="quickCreateType = 'article'"
          >
            <el-icon class="option-icon"><Document /></el-icon>
            <div class="option-content">
              <h3>图文创作</h3>
              <p>生成图文并茂的推广内容</p>
            </div>
          </div>

          <div
            class="create-option"
            :class="{ active: quickCreateType === 'video' }"
            @click="quickCreateType = 'video'"
          >
            <el-icon class="option-icon"><VideoCamera /></el-icon>
            <div class="option-content">
              <h3>视频创作</h3>
              <p>AI生成视频脚本和视频内容</p>
            </div>
          </div>
        </div>

        <div class="quick-form" v-if="quickCreateType">
          <el-form :model="quickForm" label-width="100px">
            <el-form-item label="内容主题">
              <el-input
                v-model="quickForm.topic"
                placeholder="请输入要创作的内容主题，如：春季招生活动"
              />
            </el-form-item>

            <el-form-item label="目标平台">
              <el-select
                v-model="quickForm.platform"
                placeholder="选择发布平台"
                style="width: 100%"
              >
                <el-option label="微信朋友圈" value="wechat_moments" />
                <el-option label="小红书" value="xiaohongshu" />
                <el-option label="抖音" value="douyin" />
              </el-select>
            </el-form-item>

            <el-form-item label="内容风格">
              <el-select
                v-model="quickForm.style"
                placeholder="选择内容风格"
                style="width: 100%"
              >
                <el-option label="温馨亲切" value="warm" />
                <el-option label="专业权威" value="professional" />
                <el-option label="活泼有趣" value="lively" />
                <el-option label="简洁明了" value="concise" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showQuickCreateDialog = false">取消</el-button>
          <el-button
            type="primary"
            @click="handleQuickCreateSubmit"
            :disabled="!quickCreateType || !quickForm.topic || !quickForm.platform"
            :loading="quickCreating"
          >
            {{ quickCreating ? '创作中...' : '开始创作' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 模板库对话框 -->
    <el-dialog
      v-model="showTemplateLibrary"
      title="模板库"
      width="800px"
    >
      <div class="template-library">
        <p>模板库功能开发中...</p>
      </div>
    </el-dialog>





    <!-- 查看全部历史对话框 -->
    <el-dialog
      v-model="showAllHistoryDialog"
      title="全部创作历史"
      width="1200px"
      :destroy-on-close="true"
    >
      <div class="all-history-content">
        <div class="history-header">
          <div class="history-filters">
            <el-select v-model="allHistoryFilter.type" placeholder="内容类型" clearable style="width: 120px">
              <el-option label="全部" value="" />
              <el-option label="文案" value="copywriting" />
              <el-option label="图文" value="article" />
              <el-option label="视频" value="video" />
            </el-select>
            <el-select v-model="allHistoryFilter.platform" placeholder="发布平台" clearable style="width: 120px">
              <el-option label="全部平台" value="" />
              <el-option label="微信" value="微信" />
              <el-option label="抖音" value="抖音" />
              <el-option label="小红书" value="小红书" />
            </el-select>
            <el-input
              v-model="allHistoryFilter.keyword"
              placeholder="搜索标题"
              clearable
              style="width: 200px"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button @click="refreshAllHistory">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
          <div class="history-actions">
            <el-button @click="exportAllHistory">
              <el-icon><Download /></el-icon>
              导出全部
            </el-button>
          </div>
        </div>

        <div class="history-table">
          <el-table :data="filteredAllHistory" style="width: 100%" max-height="500">
            <el-table-column prop="title" label="标题" min-width="200" />
            <el-table-column prop="type" label="类型" width="80">
              <template #default="{ row }">
                <el-tag :type="getTypeTagType(row.type)" size="small">
                  {{ getTypeLabel(row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="platform" label="平台" width="100" />
            <el-table-column prop="createdAt" label="创建时间" width="120">
              <template #default="{ row }">
                {{ formatTime(row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button size="small" @click="viewCreation(row)">查看</el-button>
                <el-button size="small" @click="editCreation(row)">编辑</el-button>
                <el-button size="small" @click="copyCreation(row)">复制</el-button>
                <el-button size="small" type="danger" @click="deleteCreation(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>
    </CenterContainer>

    <!-- 查看内容对话框 -->
  <el-dialog
    v-model="showViewDialog"
    :title="`查看${getTypeLabel(viewingItem?.type || '')}内容`"
    width="800px"
    :destroy-on-close="true"
  >
    <div class="view-content" v-if="viewingItem">
      <div class="content-header">
        <div class="content-meta">
          <h3>{{ viewingItem.title }}</h3>
          <div class="meta-tags">
            <el-tag :type="getTypeTagType(viewingItem.type)">
              {{ getTypeLabel(viewingItem.type) }}
            </el-tag>
            <el-tag type="info">{{ viewingItem.platform }}</el-tag>
            <el-tag type="info">{{ formatTime(viewingItem.createdAt) }}</el-tag>
          </div>
        </div>
      </div>

      <div class="content-body">
        <div class="content-section">
          <h4>内容预览</h4>
          <div class="content-preview">
            {{ viewingItem.content || viewingItem.preview || '暂无内容预览' }}
          </div>
        </div>

        <div class="content-section" v-if="viewingItem.keywords">
          <h4>关键词</h4>
          <div class="keywords">
            <el-tag
              v-for="keyword in viewingItem.keywords"
              :key="keyword"
              size="small"
              style="margin-right: var(--spacing-sm); margin-bottom: var(--spacing-sm);"
            >
              {{ keyword }}
            </el-tag>
          </div>
        </div>

        <div class="content-section" v-if="viewingItem.settings">
          <h4>创作设置</h4>
          <div class="settings-info">
            <div class="setting-item" v-if="viewingItem.settings.style">
              <span class="setting-label">内容风格：</span>
              <span class="setting-value">{{ getStyleLabel(viewingItem.settings.style) }}</span>
            </div>
            <div class="setting-item" v-if="viewingItem.settings.length">
              <span class="setting-label">内容长度：</span>
              <span class="setting-value">{{ viewingItem.settings.length }}</span>
            </div>
            <div class="setting-item" v-if="viewingItem.settings.tone">
              <span class="setting-label">语调：</span>
              <span class="setting-value">{{ viewingItem.settings.tone }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="showViewDialog = false">关闭</el-button>
        <el-button type="primary" @click="editFromView">编辑内容</el-button>
        <el-button @click="copyContent">复制内容</el-button>
        <el-button v-if="viewingItem && viewingItem.type === 'video'" type="success" @click="downloadViewingVideo">下载视频</el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 编辑内容对话框 -->
  <el-dialog
    v-model="showEditDialog"
    :title="`编辑${getTypeLabel(editingItem?.type || '')}内容`"
    width="900px"
    :destroy-on-close="true"
  >
    <div class="edit-content" v-if="editingItem">
      <el-form ref="editFormRef" :model="editForm" label-width="80px">
        <el-form-item label="标题" required>
          <el-input v-model="editForm.title" placeholder="请输入内容标题" />
        </el-form-item>

        <el-form-item label="内容" required>
          <el-input
            v-model="editForm.content"
            type="textarea"
            :rows="8"
            placeholder="请输入内容"
          />
        </el-form-item>

        <el-form-item label="平台">
          <el-input v-model="editForm.platform" placeholder="发布平台" />
        </el-form-item>

        <el-form-item label="关键词">
          <el-input
            v-model="editForm.keywordsText"
            placeholder="请输入关键词，用逗号分隔"
          />
        </el-form-item>

        <el-form-item label="风格">
          <el-select v-model="editForm.style" placeholder="选择内容风格">
            <el-option label="温馨亲切" value="warm" />
            <el-option label="专业权威" value="professional" />
            <el-option label="活泼有趣" value="lively" />
            <el-option label="简洁明了" value="concise" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="saveEdit" :loading="saving">保存修改</el-button>
      </div>
    </template>
  </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  MagicStick,
  Collection,
  Edit,
  Document,
  VideoCamera,
  Microphone,
  Search,
  Download,
  Delete,
  Refresh
} from '@element-plus/icons-vue'
import CenterContainer from '@/components/centers/CenterContainer.vue'
import CopywritingCreator from './media-center/CopywritingCreatorTimeline.vue'
import ArticleCreator from './media-center/ArticleCreator.vue'
import VideoCreator from './media-center/VideoCreatorTimeline.vue'
import TextToSpeech from './media-center/TextToSpeechTimeline.vue'
import {
  getRecentCreations,
  getCreationHistory,
  deleteContent,
  type MediaContent
} from '@/api/modules/media-center'

// 响应式数据
const activeTab = ref('overview')
const showQuickCreateDialog = ref(false)
const showTemplateLibrary = ref(false)
const quickCreating = ref(false)
const quickCreateType = ref('')

// 查看和编辑对话框
const showViewDialog = ref(false)
const showEditDialog = ref(false)
const showAllHistoryDialog = ref(false)
const viewingItem = ref(null)
const editingItem = ref(null)
const saving = ref(false)

// 快速创作表单
const quickForm = ref({
  topic: '',
  platform: '',
  style: 'warm'
})

// 历史筛选
const historyFilter = ref({
  type: '',
  platform: '',
  keyword: ''
})

// 查看全部历史筛选
const allHistoryFilter = ref({
  type: '',
  platform: '',
  keyword: ''
})

// 编辑表单
const editForm = ref({
  title: '',
  content: '',
  platform: '',
  keywordsText: '',
  style: 'warm'
})

const editFormRef = ref(null)

// 标签页配置
const tabs = ref([
  { key: 'overview', label: '概览', icon: 'Dashboard' },
  { key: 'copywriting', label: '文案创作', icon: 'Edit' },
  { key: 'article', label: '图文创作', icon: 'Document' },
  { key: 'video', label: '视频创作', icon: 'VideoCamera' },
  { key: 'tts', label: '文字转语音', icon: 'Microphone' },
  { key: 'history', label: '创作历史', icon: 'Clock' }
])

// 数据从后端获取
const recentCreations = ref<MediaContent[]>([])
const creationHistory = ref<MediaContent[]>([])
const loading = ref(false)

// 计算属性
const filteredHistory = computed(() => {
  let filtered = creationHistory.value

  if (historyFilter.value.type) {
    filtered = filtered.filter(item => item.type === historyFilter.value.type)
  }

  if (historyFilter.value.platform) {
    filtered = filtered.filter(item =>
      item.platform.toLowerCase().includes(historyFilter.value.platform.toLowerCase())
    )
  }

  if (historyFilter.value.keyword) {
    filtered = filtered.filter(item =>
      item.title.toLowerCase().includes(historyFilter.value.keyword.toLowerCase())
    )
  }

  return filtered
})

const filteredAllHistory = computed(() => {
  let filtered = creationHistory.value

  if (allHistoryFilter.value.type) {
    filtered = filtered.filter(item => item.type === allHistoryFilter.value.type)
  }

  if (allHistoryFilter.value.platform) {
    filtered = filtered.filter(item =>
      item.platform.toLowerCase().includes(allHistoryFilter.value.platform.toLowerCase())
    )
  }

  if (allHistoryFilter.value.keyword) {
    filtered = filtered.filter(item =>
      item.title.toLowerCase().includes(allHistoryFilter.value.keyword.toLowerCase())
    )
  }

  return filtered
})

// 方法
const handleTabChange = (tab: string) => {
  console.log('切换到标签页:', tab)
}

const handleQuickCreate = () => {
  showQuickCreateDialog.value = true
}

const handleQuickCreateSubmit = async () => {
  if (!quickCreateType.value || !quickForm.value.topic || !quickForm.value.platform) {
    ElMessage.warning('请填写完整信息')
    return
  }

  quickCreating.value = true

  try {
    // 切换到对应的标签页
    activeTab.value = quickCreateType.value

    // 等待组件渲染
    await new Promise(resolve => setTimeout(resolve, 100))

    showQuickCreateDialog.value = false
    ElMessage.success('已切换到创作页面，请继续完善信息')
  } catch (error) {
    console.error('快速创作失败:', error)
    ElMessage.error('操作失败，请重试')
  } finally {
    quickCreating.value = false
  }
}

const handleContentCreated = (content: any) => {
  // 添加到历史记录
  const newItem: any = {
    id: Date.now(),
    title: content.title,
    type: content.type,
    platform: content.platform,
    createdAt: new Date(),
    preview: content.preview
  }
  if ((content as any).projectId) newItem.projectId = (content as any).projectId
  if ((content as any).finalVideoUrl) newItem.finalVideoUrl = (content as any).finalVideoUrl

  creationHistory.value.unshift(newItem)
  recentCreations.value.unshift(newItem)

  // 保持最近创作只显示3条
  if (recentCreations.value.length > 3) {
    recentCreations.value = recentCreations.value.slice(0, 3)
  }

  ElMessage.success('内容创作完成！')
}

const handleAudioCreated = (audio: any) => {
  // 添加到历史记录
  const newItem = {
    id: Date.now(),
    title: `语音_${audio.voice}_${audio.speed}x`,
    type: 'tts',
    platform: '语音文件',
    createdAt: new Date(),
    preview: audio.text.substring(0, 50) + '...'
  }

  creationHistory.value.unshift(newItem)
  recentCreations.value.unshift(newItem)

  // 保持最近创作只显示3条
  if (recentCreations.value.length > 3) {
    recentCreations.value = recentCreations.value.slice(0, 3)
  }

  ElMessage.success('语音生成完成！')
}

const getTypeTagType = (type: string) => {
  const types = {
    copywriting: 'primary',
    article: 'success',
    video: 'warning',
    tts: 'info'
  }
  return types[type as keyof typeof types] || 'info'
}

const getTypeLabel = (type: string) => {
  const labels = {
    copywriting: '文案',
    article: '图文',
    video: '视频',
    tts: '语音'
  }
  return labels[type as keyof typeof labels] || type
}

const formatTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 1000))}分钟前`
  } else if (diff < 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 60 * 1000))}小时前`
  } else {
    return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`
  }
}

const viewCreation = (item: any) => {
  console.log('viewCreation 被调用:', item)

  // 确保项目有完整的数据
  if (!item) {
    ElMessage.error('无法查看：项目数据不存在')
    return
  }

  // 如果项目没有完整的content，尝试从recentCreations中找到完整数据
  let fullItem = item
  if (!item.content && item.id) {
    const foundItem = recentCreations.value.find(r => r.id === item.id)
    if (foundItem) {
      fullItem = foundItem
    }
  }

  viewingItem.value = fullItem
  showViewDialog.value = true

  console.log('设置后状态:', {
    showViewDialog: showViewDialog.value,
    viewingItem: viewingItem.value,
    hasContent: !!fullItem.content
  })

  // 强制触发Vue的响应式更新
  nextTick(() => {
    console.log('nextTick后的状态:', {
      showViewDialog: showViewDialog.value,
      dialogExists: !!document.querySelector('.el-dialog')
    })
  })
}

const testViewDialog = () => {
  console.log('测试查看功能被点击')
  console.log('当前状态:', {
    showViewDialog: showViewDialog.value,
    viewingItem: viewingItem.value,
    recentCreations: recentCreations.value
  })

  if (recentCreations.value && recentCreations.value.length > 0) {
    console.log('使用第一个创作项目进行测试')
    viewCreation(recentCreations.value[0])
  } else {
    console.log('没有创作数据，创建测试数据')
    const testItem = {
      id: 999,
      title: '测试查看功能',
      type: 'copywriting',
      platform: '测试平台',
      content: '这是一个测试内容，用于验证查看功能是否正常工作。',
      createdAt: new Date(),
      keywords: ['测试', '查看功能'],
      settings: {
        style: 'warm',
        length: '中等',
        tone: '友好'
      }
    }
    viewCreation(testItem)
  }
}

// AI生成服务
const aiGenerationService = {
  // 调用后端AI专家工具
  async callAIExpert(messages: any[]) {
    try {
      console.log('🤖 调用AI专家工具:', messages)

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
      console.log('✅ AI专家工具响应:', result)

      return result
    } catch (error) {
      console.error('❌ AI专家工具调用失败:', error)
      throw error
    }
  },

  // 生成文案
  async generateCopywriting(params: {
    platform: string
    type: string
    topic: string
    style: string
    keyInfo: string
    wordCount: number
  }) {
    const prompt = `请为幼儿园创作一篇${this.getPlatformLabel(params.platform)}的${this.getTypeLabel(params.type)}文案。

**创作要求：**
- 主题：${params.topic}
- 风格：${params.style}
- 关键信息：${params.keyInfo}
- 字数要求：约${params.wordCount}字
- 平台特色：请确保文案符合${this.getPlatformLabel(params.platform)}的特色和用户习惯

**输出格式：**
请提供以下内容：
1. 主要文案内容
2. 建议的话题标签（3-5个）
3. 发布时间建议
4. 互动引导语

请确保文案温馨专业，具有吸引力，能够有效传达幼儿园的教育理念和优势。`

    const messages = [
      {
        role: 'user',
        content: prompt
      }
    ]

    return await this.callAIExpert(messages)
  },

  // 生成图文内容
  async generateArticle(params: {
    platform: string
    type: string
    title: string
    content: string
    length: string
    imageRequirements: string[]
  }) {
    const prompt = `请为幼儿园创作一篇${this.getPlatformLabel(params.platform)}的${this.getTypeLabel(params.type)}图文内容。

**创作要求：**
- 文章标题：${params.title}
- 核心内容：${params.content}
- 文章长度：${params.length}
- 配图需求：${params.imageRequirements.join('、')}

**输出格式：**
请提供以下内容：
1. 完整的文章内容（包含标题、正文、结尾）
2. 配图建议（描述每张图片的内容和位置）
3. 排版建议（段落结构、重点标注等）
4. SEO关键词建议
5. 互动元素建议（投票、问答等）

请确保内容专业有趣，图文并茂，能够吸引家长关注并产生互动。`

    const messages = [
      {
        role: 'user',
        content: prompt
      }
    ]

    return await this.callAIExpert(messages)
  },

  // 生成视频脚本
  async generateVideoScript(params: {
    platform: string
    type: string
    topic: string
    duration: string
    mode: string
    description: string
  }) {
    const prompt = `请为幼儿园创作一个${this.getPlatformLabel(params.platform)}的${this.getTypeLabel(params.type)}视频脚本。

**创作要求：**
- 视频主题：${params.topic}
- 视频时长：${params.duration}
- 创作模式：${params.mode === 'script' ? '脚本创作' : '视频生成'}
- 内容描述：${params.description}

**输出格式：**
请提供以下内容：
1. 完整的视频脚本（分镜头描述）
2. 每个镜头的时间安排
3. 画面描述和拍摄建议
4. 配音文案和音效建议
5. 后期制作要点
6. 发布优化建议

请确保脚本生动有趣，符合平台特色，能够有效展示幼儿园的特色和优势。`

    const messages = [
      {
        role: 'user',
        content: prompt
      }
    ]

    return await this.callAIExpert(messages)
  },

  // 辅助方法
  getPlatformLabel(platform: string) {
    const platformMap: Record<string, string> = {
      'wechat_moments': '微信朋友圈',
      'wechat_official': '微信公众号',
      'weibo': '微博',
      'xiaohongshu': '小红书',
      'douyin': '抖音',
      'kuaishou': '快手',
      'bilibili': 'B站'
    }
    return platformMap[platform] || platform
  },

  getTypeLabel(type: string) {
    const typeMap: Record<string, string> = {
      'enrollment': '招生宣传',
      'activity': '活动推广',
      'festival': '节日祝福',
      'daily': '日常分享',
      'education': '教育理念',
      'parenting': '育儿知识',
      'campus': '校园生活',
      'teacher': '教师风采'
    }
    return typeMap[type] || type
  }
}

const editCreation = (item: any) => {
  console.log('editCreation 被调用:', item)

  // 确保项目有完整的数据
  if (!item) {
    ElMessage.error('无法编辑：项目数据不存在')
    return
  }

  // 如果项目没有完整的content，尝试从recentCreations中找到完整数据
  let fullItem = item
  if (!item.content && item.id) {
    const foundItem = recentCreations.value.find(r => r.id === item.id)
    if (foundItem) {
      fullItem = foundItem
    }
  }

  editingItem.value = fullItem
  editForm.value = {
    title: fullItem.title,
    content: fullItem.content || fullItem.preview || '',
    platform: fullItem.platform,
    keywordsText: fullItem.keywords ? fullItem.keywords.join(', ') : '',
    style: fullItem.settings?.style || 'warm'
  }
  showEditDialog.value = true

  console.log('编辑对话框状态:', {
    showEditDialog: showEditDialog.value,
    editingItem: editingItem.value,
    editForm: editForm.value
  })
}

const copyCreation = (item: any) => {
  const content = item.content || item.preview || ''
  navigator.clipboard.writeText(content).then(() => {
    ElMessage.success('内容已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制')
  })
}

const deleteCreation = async (item: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这个创作内容吗？', '确认删除', {
      type: 'warning'
    })

    // 调用后端API删除
    const response = await deleteContent(item.id)
    if (response.success) {
      // 从本地列表中移除
      const index = creationHistory.value.findIndex(h => h.id === item.id)
      if (index > -1) {
        creationHistory.value.splice(index, 1)
      }

      const recentIndex = recentCreations.value.findIndex(r => r.id === item.id)
      if (recentIndex > -1) {
        recentCreations.value.splice(recentIndex, 1)
      }

      ElMessage.success('删除成功')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const exportHistory = () => {
  ElMessage.info('导出功能开发中...')
}

const clearHistory = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有创作历史吗？此操作不可恢复。', '确认清空', {
      type: 'warning'
    })

    creationHistory.value = []
    recentCreations.value = []

    ElMessage.success('历史记录已清空')
  } catch {
    // 用户取消清空
  }
}

// 新增方法
const getStyleLabel = (style: string) => {
  const labels = {
    warm: '温馨亲切',
    professional: '专业权威',
    lively: '活泼有趣',
    concise: '简洁明了'
  }
  return labels[style as keyof typeof labels] || style
}

const editFromView = () => {
  if (viewingItem.value) {
    showViewDialog.value = false
    editCreation(viewingItem.value)
  }
}

const copyContent = () => {
  if (viewingItem.value) {
    copyCreation(viewingItem.value)
  }
}

const downloadViewingVideo = async () => {
  if (!viewingItem.value) return
  try {
    const item: any = viewingItem.value as any
    if (item.type !== 'video') {
      ElMessage.warning('当前内容不是视频')
      return
    }
    const token =
      localStorage.getItem('kindergarten_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('auth_token') || ''

    if (item.projectId) {
      const res = await fetch(`/api/video-creation/projects/${item.projectId}/download`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.redirected && res.url) {
        window.open(res.url, '_blank')
        ElMessage.success('开始下载视频')
        return
      }
      if (!res.ok) throw new Error(`下载失败(${res.status})`)
      const blob = await res.blob()
      const cd = res.headers.get('Content-Disposition') || ''
      const m = cd.match(/filename\*=UTF-8''([^;]+)/i) || cd.match(/filename="?([^";]+)"?/i)
      const filename = m ? decodeURIComponent(m[1]) : `${item.title || 'video'}.mp4`
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
      ElMessage.success('开始下载视频')
      return
    }

    if (item.finalVideoUrl) {
      if (/^https?:\/\//i.test(item.finalVideoUrl)) {
        window.open(item.finalVideoUrl, '_blank')
        ElMessage.success('开始下载视频')
        return
      }
      window.open(item.finalVideoUrl, '_blank')
      ElMessage.info('已尝试打开视频直链；若失败，请到“视频创作”页面下载')
      return
    }

    ElMessage.warning('该视频暂无可下载文件')
  } catch (e) {
    console.error('下载视频失败:', e)
    ElMessage.error('下载失败，请稍后再试')
  }
}


const saveEdit = async () => {
  if (!editForm.value.title || !editForm.value.content) {
    ElMessage.warning('请填写标题和内容')
    return
  }

  saving.value = true

  try {
    // 更新数据
    const index = creationHistory.value.findIndex(item => item.id === editingItem.value?.id)
    if (index > -1) {
      const updatedItem = {
        ...creationHistory.value[index],
        title: editForm.value.title,
        content: editForm.value.content,
        platform: editForm.value.platform,
        keywords: editForm.value.keywordsText ? editForm.value.keywordsText.split(',').map(k => k.trim()) : [],
        settings: {
          ...creationHistory.value[index].settings,
          style: editForm.value.style
        },
        preview: editForm.value.content.substring(0, 50) + '...'
      }

      creationHistory.value[index] = updatedItem

      // 同时更新最近创作列表
      const recentIndex = recentCreations.value.findIndex(item => item.id === editingItem.value?.id)
      if (recentIndex > -1) {
        recentCreations.value[recentIndex] = updatedItem
      }
    }

    showEditDialog.value = false
    ElMessage.success('内容已保存')
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

const refreshAllHistory = () => {
  ElMessage.success('历史记录已刷新')
}

const exportAllHistory = () => {
  const data = filteredAllHistory.value.map(item => ({
    标题: item.title,
    类型: getTypeLabel(item.type),
    平台: item.platform,
    内容: item.content || item.preview,
    创建时间: new Date(item.createdAt).toLocaleString()
  }))

  const csv = [
    Object.keys(data[0]).join(','),
    ...data.map(row => Object.values(row).map(val => `"${val}"`).join(','))
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `创作历史_${new Date().toISOString().split('T')[0]}.csv`
  link.click()

  ElMessage.success('导出成功')
}

// 功能卡片点击处理
const handleFeatureClick = (featureType) => {
  activeTab.value = featureType

  const featureNames = {
    copywriting: '文案创作',
    article: '图文创作',
    video: '视频创作',
    tts: '文字转语音'
  }

  ElMessage.success(`已切换到${featureNames[featureType]}页面`)
}

// 加载最近创作
const loadRecentCreations = async () => {
  try {
    loading.value = true
    const response = await getRecentCreations(10)
    if (response.success && response.data) {
      recentCreations.value = response.data
    }
  } catch (error) {
    console.error('加载最近创作失败:', error)
    ElMessage.error('加载最近创作失败')
  } finally {
    loading.value = false
  }
}

// 加载创作历史
const loadCreationHistory = async () => {
  try {
    loading.value = true
    const response = await getCreationHistory({
      type: historyFilter.value.type as any,
      platform: historyFilter.value.platform,
      keyword: historyFilter.value.keyword,
      page: 1,
      pageSize: 100
    })
    if (response.success && response.data) {
      creationHistory.value = response.data.items
    }
  } catch (error) {
    console.error('加载创作历史失败:', error)
    ElMessage.error('加载创作历史失败')
  } finally {
    loading.value = false
  }
}

// 页面初始化
onMounted(async () => {
  console.log('新媒体中心已加载')
  // 加载数据
  await Promise.all([
    loadRecentCreations(),
    loadCreationHistory()
  ])
})
</script>

<style scoped lang="scss">
.media-center {
  background: transparent;
  width: 100%;
  max-width: 100%;
  flex: 1 1 auto;
  min-height: 100%;
}

.welcome-section {
  background: var(--bg-color, var(--bg-white));
  border-radius: var(--radius-md);
  padding: var(--text-3xl);
  margin-bottom: var(--text-3xl);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--shadow-sm);
}

.feature-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--text-2xl);
  margin-bottom: var(--text-3xl);
}

.feature-card {
  background: var(--bg-color, var(--bg-white));
  border-radius: var(--radius-md);
  padding: var(--text-2xl);
  box-shadow: var(--shadow-sm);
  border: var(--border-width-base) solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
}

.recent-section {
  background: var(--bg-color, var(--bg-white));
  border-radius: var(--radius-md);
  padding: var(--text-3xl);
  box-shadow: var(--shadow-sm);
}

.history-content {
  background: var(--bg-color, var(--bg-white));
  width: 100%;
  min-height: 100%;
}

.history-item {
  background: var(--bg-color, var(--bg-white));
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--text-lg);
  margin-bottom: var(--text-sm);
}
</style>




