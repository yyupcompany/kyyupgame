<template>
  <MobileCenterLayout title="文档中心" back-path="/mobile/centers">
    <template #right>
      <van-icon name="plus" size="20" @click="handleCreate" />
    </template>

    <div class="document-center-mobile">
      <!-- 统计卡片 -->
      <div class="stats-section">
        <van-grid :column-num="2" :gutter="12">
          <van-grid-item v-for="stat in statsData" :key="stat.key" class="stat-card">
            <div class="stat-content">
              <van-icon :name="stat.icon" :color="stat.color" size="24" />
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 标签页 -->
      <van-tabs v-model:active="activeTab" sticky offset-top="46">
        <!-- 文档模板 -->
        <van-tab title="文档模板" name="templates">
          <div class="tab-content">
            <!-- 搜索栏 -->
            <van-search
              v-model="templateKeyword"
              placeholder="搜索模板名称"
              @search="loadTemplates"
              @clear="loadTemplates"
            />
            
            <!-- 分类筛选 -->
            <div class="filter-bar">
              <van-dropdown-menu>
                <van-dropdown-item v-model="templateCategory" :options="categoryOptions" @change="loadTemplates" />
              </van-dropdown-menu>
            </div>

            <!-- 模板列表 -->
            <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
              <van-list
                v-model:loading="loading"
                :finished="finished"
                finished-text="没有更多了"
                @load="onLoad"
              >
                <div v-if="templates.length === 0 && !loading" class="empty-state">
                  <van-empty description="暂无文档模板" />
                </div>
                <div
                  v-for="item in templates"
                  :key="item.id"
                  class="template-card"
                  @click="viewTemplate(item)"
                >
                  <div class="card-header">
                    <div class="card-icon">
                      <van-icon name="description" size="24" color="#6366f1" />
                    </div>
                    <div class="card-info">
                      <div class="card-title">{{ item.name }}</div>
                      <div class="card-meta">
                        <van-tag size="medium" :type="getCategoryType(item.category)">
                          {{ getCategoryLabel(item.category) }}
                        </van-tag>
                        <span class="use-count">已使用 {{ item.useCount || 0 }} 次</span>
                      </div>
                    </div>
                  </div>
                  <div class="card-actions">
                    <van-button size="medium" type="primary" plain @click.stop="createInstance(item)">
                      创建实例
                    </van-button>
                    <van-button size="medium" plain @click.stop="viewTemplate(item)">
                      查看
                    </van-button>
                  </div>
                </div>
              </van-list>
            </van-pull-refresh>
          </div>
        </van-tab>

        <!-- 文档实例 -->
        <van-tab title="文档实例" name="instances">
          <div class="tab-content">
            <!-- 搜索栏 -->
            <van-search
              v-model="instanceKeyword"
              placeholder="搜索实例标题"
              @search="loadInstances"
              @clear="loadInstances"
            />

            <!-- 状态筛选 -->
            <div class="filter-bar">
              <van-dropdown-menu>
                <van-dropdown-item v-model="instanceStatus" :options="statusOptions" @change="loadInstances" />
              </van-dropdown-menu>
            </div>

            <!-- 实例列表 -->
            <van-pull-refresh v-model="instanceRefreshing" @refresh="onInstanceRefresh">
              <van-list
                v-model:loading="instanceLoading"
                :finished="instanceFinished"
                finished-text="没有更多了"
                @load="onInstanceLoad"
              >
                <div v-if="instances.length === 0 && !instanceLoading" class="empty-state">
                  <van-empty description="暂无文档实例" />
                </div>
                <div
                  v-for="item in instances"
                  :key="item.id"
                  class="instance-card"
                  @click="viewInstance(item)"
                >
                  <div class="card-header">
                    <div class="card-icon">
                      <van-icon name="notes-o" size="24" color="#10b981" />
                    </div>
                    <div class="card-info">
                      <div class="card-title">{{ item.title }}</div>
                      <div class="card-meta">
                        <van-tag size="medium" :type="getStatusType(item.status)">
                          {{ getStatusLabel(item.status) }}
                        </van-tag>
                        <span class="create-time">{{ formatDate(item.createdAt) }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="card-footer">
                    <span class="template-name">模板: {{ item.templateName || '未知' }}</span>
                    <span class="creator">创建者: {{ item.creatorName || '未知' }}</span>
                  </div>
                  <div class="card-actions">
                    <van-button size="medium" type="primary" plain @click.stop="editInstance(item)">
                      编辑
                    </van-button>
                    <van-button size="medium" type="success" plain @click.stop="collaborateInstance(item)">
                      协作
                    </van-button>
                  </div>
                </div>
              </van-list>
            </van-pull-refresh>
          </div>
        </van-tab>
      </van-tabs>
    </div>
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'
// 类型定义（模拟，待API模块开发后替换）
interface DocumentTemplate {
  id: number
  name: string
  code?: string
  category: string
  useCount?: number
  version?: string
}

interface DocumentInstance {
  id: number
  title: string
  status: string
  templateName?: string
  creatorName?: string
  createdAt: string
}

const router = useRouter()

// 状态
const activeTab = ref('templates')
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const instanceLoading = ref(false)
const instanceFinished = ref(false)
const instanceRefreshing = ref(false)

// 搜索和筛选
const templateKeyword = ref('')
const templateCategory = ref('')
const instanceKeyword = ref('')
const instanceStatus = ref('')

// 分页
const templatePage = ref(1)
const instancePage = ref(1)
const pageSize = 10

// 数据
const templates = ref<DocumentTemplate[]>([])
const instances = ref<DocumentInstance[]>([])

// 统计数据
const statsData = reactive([
  { key: 'templates', label: '文档模板', value: 0, icon: 'description', color: '#6366f1' },
  { key: 'instances', label: '文档实例', value: 0, icon: 'notes-o', color: '#10b981' },
  { key: 'drafts', label: '草稿', value: 0, icon: 'edit', color: '#f59e0b' },
  { key: 'published', label: '已发布', value: 0, icon: 'checked', color: '#3b82f6' }
])

// 下拉选项
const categoryOptions = [
  { text: '全部分类', value: '' },
  { text: '检查表', value: 'checklist' },
  { text: '报告', value: 'report' },
  { text: '计划', value: 'plan' },
  { text: '总结', value: 'summary' }
]

const statusOptions = [
  { text: '全部状态', value: '' },
  { text: '草稿', value: 'draft' },
  { text: '已发布', value: 'published' },
  { text: '已归档', value: 'archived' }
]

// 初始化
onMounted(() => {
  loadStats()
  loadTemplates()
})

// 加载统计数据
const loadStats = async () => {
  try {
    // TODO: 调用API获取统计数据
    statsData[0].value = 15
    statsData[1].value = 48
    statsData[2].value = 12
    statsData[3].value = 36
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 加载模板列表
const loadTemplates = async () => {
  try {
    loading.value = true
    // TODO: 替换为真实API调用
    // const res = await getDocumentTemplates({ page: templatePage.value, pageSize, keyword: templateKeyword.value, category: templateCategory.value })
    templates.value = [
      { id: 1, name: '教学周计划模板', category: 'plan', useCount: 45 },
      { id: 2, name: '安全检查表', category: 'checklist', useCount: 32 },
      { id: 3, name: '月度工作总结', category: 'summary', useCount: 28 },
      { id: 4, name: '活动评估报告', category: 'report', useCount: 15 }
    ]
    finished.value = true
  } catch (error) {
    console.error('加载模板失败:', error)
    showToast('加载模板失败')
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 加载实例列表
const loadInstances = async () => {
  try {
    instanceLoading.value = true
    // TODO: 替换为真实API调用
    instances.value = [
      { id: 1, title: '2026年1月教学周计划', status: 'published', templateName: '教学周计划模板', creatorName: '王老师', createdAt: '2026-01-06' },
      { id: 2, title: '消防安全检查记录', status: 'draft', templateName: '安全检查表', creatorName: '李主任', createdAt: '2026-01-05' },
      { id: 3, title: '12月工作总结', status: 'published', templateName: '月度工作总结', creatorName: '张园长', createdAt: '2025-12-31' }
    ]
    instanceFinished.value = true
  } catch (error) {
    console.error('加载实例失败:', error)
    showToast('加载实例失败')
  } finally {
    instanceLoading.value = false
    instanceRefreshing.value = false
  }
}

// 下拉刷新
const onRefresh = () => {
  templatePage.value = 1
  finished.value = false
  loadTemplates()
}

const onInstanceRefresh = () => {
  instancePage.value = 1
  instanceFinished.value = false
  loadInstances()
}

// 加载更多
const onLoad = () => {
  templatePage.value++
  loadTemplates()
}

const onInstanceLoad = () => {
  instancePage.value++
  loadInstances()
}

// 分类映射
const getCategoryType = (category: string) => {
  const typeMap: Record<string, string> = {
    checklist: 'primary',
    report: 'success',
    plan: 'warning',
    summary: 'danger'
  }
  return typeMap[category] || 'default'
}

const getCategoryLabel = (category: string) => {
  const labelMap: Record<string, string> = {
    checklist: '检查表',
    report: '报告',
    plan: '计划',
    summary: '总结'
  }
  return labelMap[category] || '其他'
}

// 状态映射
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    draft: 'warning',
    published: 'success',
    archived: 'default'
  }
  return typeMap[status] || 'default'
}

const getStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    draft: '草稿',
    published: '已发布',
    archived: '已归档'
  }
  return labelMap[status] || '未知'
}

// 日期格式化
const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

// 操作方法
const handleCreate = () => {
  showToast('创建新文档')
}

const viewTemplate = (template: DocumentTemplate) => {
  router.push(`/mobile/centers/template-detail/${template.id}`)
}

const createInstance = async (template: DocumentTemplate) => {
  try {
    await showConfirmDialog({
      title: '创建文档实例',
      message: `确定要使用模板"${template.name}"创建新的文档实例吗？`
    })
    // TODO: 调用API创建实例
    showToast('创建成功')
    activeTab.value = 'instances'
    onInstanceRefresh()
  } catch {
    // 用户取消
  }
}

const viewInstance = (instance: DocumentInstance) => {
  router.push(`/mobile/document-instance/detail/${instance.id}`)
}

const editInstance = (instance: DocumentInstance) => {
  router.push(`/mobile/document-instance/edit/${instance.id}`)
}

const collaborateInstance = (instance: DocumentInstance) => {
  router.push(`/mobile/centers/document-collaboration?id=${instance.id}`)
}
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;
@import '@/styles/mixins/responsive-mobile.scss';
.document-center-mobile {
  min-height: 100vh;
  background: var(--van-background-2);
}

.stats-section {
  padding: 12px;
}

.stat-card {
  :deep(.van-grid-item__content) {
    padding: 12px;
    background: var(--van-background);
    border-radius: 8px;
  }
}

.stat-content {
  text-align: center;
  
  .stat-value {
    font-size: 24px;
    font-weight: 600;
    color: var(--van-text-color);
    margin: 8px 0 4px;
  }
  
  .stat-label {
    font-size: 12px;
    color: var(--van-text-color-2);
  }
}

.tab-content {
  min-height: 300px;
}

.filter-bar {
  padding: 0 12px 12px;
  
  :deep(.van-dropdown-menu__bar) {
    background: transparent;
    box-shadow: none;
  }
}

.template-card,
.instance-card {
  margin: 12px;
  padding: 12px;
  background: var(--van-background);
  border-radius: 8px;
  
  .card-header {
    display: flex;
    gap: 12px;
    margin-bottom: 8px;
    
    .card-icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(99, 102, 241, 0.1);
      border-radius: 8px;
    }
    
    .card-info {
      flex: 1;
      
      .card-title {
        font-size: 15px;
        font-weight: 500;
        color: var(--van-text-color);
        margin-bottom: 4px;
      }
      
      .card-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .use-count,
        .create-time {
          font-size: 12px;
          color: var(--van-text-color-3);
        }
      }
    }
  }
  
  .card-footer {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--van-text-color-3);
    margin-bottom: 8px;
    padding-top: 8px;
    border-top: 1px solid var(--van-border-color);
  }
  
  .card-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    padding-top: 8px;
    border-top: 1px solid var(--van-border-color);
  }
}

.instance-card {
  .card-icon {
    background: rgba(16, 185, 129, 0.1) !important;
  }
}

.empty-state {
  padding: 40px 0;
}
</style>
