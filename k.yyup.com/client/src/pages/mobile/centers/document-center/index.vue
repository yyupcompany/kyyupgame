<template>
  <MobileMainLayout
    title="文档中心"
    :show-back="true"
  >
    <div class="mobile-document-center">
      <!-- 头部概览 -->
      <div class="overview-section">
        <div class="overview-header">
          <h2>文档管理中心</h2>
          <p>管理文档模板和实例，支持实时协作编辑</p>
        </div>

        <!-- 统计卡片 -->
        <div class="stats-grid">
          <van-grid :column-num="2" :gutter="12">
            <van-grid-item>
              <div class="stat-item">
                <div class="stat-value">{{ templateTotal }}</div>
                <div class="stat-label">模板总数</div>
              </div>
            </van-grid-item>
            <van-grid-item>
              <div class="stat-item">
                <div class="stat-value">{{ instanceTotal }}</div>
                <div class="stat-label">实例总数</div>
              </div>
            </van-grid-item>
            <van-grid-item>
              <div class="stat-item">
                <div class="stat-value">{{ completedInstances }}</div>
                <div class="stat-label">已完成</div>
              </div>
            </van-grid-item>
            <van-grid-item>
              <div class="stat-item">
                <div class="stat-value">{{ completionRate }}%</div>
                <div class="stat-label">完成率</div>
              </div>
            </van-grid-item>
          </van-grid>
        </div>
      </div>

      <!-- 标签页 -->
      <van-tabs v-model:active="activeTab" sticky :offset-top="46">
        <!-- 文档模板标签页 -->
        <van-tab title="文档模板" name="templates">
          <div class="tab-content">
            <!-- 搜索栏 -->
            <div class="search-section">
              <van-search
                v-model="templateKeyword"
                placeholder="搜索模板名称..."
                @search="loadTemplates(1)"
                @clear="loadTemplates(1)"
              />
            </div>

            <!-- 筛选栏 -->
            <div class="filter-section">
              <van-dropdown-menu>
                <van-dropdown-item
                  v-model="templateCategory"
                  :options="categoryOptions"
                  title="分类筛选"
                  @change="loadTemplates(1)"
                />
              </van-dropdown-menu>
              <van-button
                size="small"
                type="primary"
                icon="replay"
                @click="refreshTemplates"
              >
                刷新
              </van-button>
            </div>

            <!-- 模板列表 -->
            <van-pull-refresh v-model="templatesRefreshing" @refresh="refreshTemplates">
              <van-list
                v-model:loading="templatesLoading"
                :finished="templatesFinished"
                finished-text="没有更多了"
                @load="loadTemplates"
              >
                <div
                  v-for="template in templates"
                  :key="template.id"
                  class="template-card"
                  @click="viewTemplate(template)"
                >
                  <div class="card-header">
                    <div class="template-info">
                      <h3 class="template-name">{{ template.name }}</h3>
                      <van-tag type="primary" size="small">{{ template.category }}</van-tag>
                    </div>
                    <div class="template-meta">
                      <span class="template-code">{{ template.code }}</span>
                    </div>
                  </div>

                  <div class="card-body">
                    <div class="template-stats">
                      <span class="stat-item">
                        <van-icon name="description" />
                        使用 {{ template.useCount }} 次
                      </span>
                      <span class="stat-item">
                        <van-icon name="label" />
                        v{{ template.version }}
                      </span>
                    </div>
                  </div>

                  <div class="card-actions">
                    <van-button
                      size="small"
                      type="primary"
                      plain
                      @click.stop="createInstanceFromTemplate(template)"
                    >
                      创建实例
                    </van-button>
                    <van-button
                      size="small"
                      type="success"
                      plain
                      @click.stop="viewTemplate(template)"
                    >
                      查看
                    </van-button>
                  </div>
                </div>
              </van-list>
            </van-pull-refresh>
          </div>
        </van-tab>

        <!-- 文档实例标签页 -->
        <van-tab title="文档实例" name="instances">
          <div class="tab-content">
            <!-- 搜索栏 -->
            <div class="search-section">
              <van-search
                v-model="instanceKeyword"
                placeholder="搜索实例标题..."
                @search="loadInstances(1)"
                @clear="loadInstances(1)"
              />
            </div>

            <!-- 筛选栏 -->
            <div class="filter-section">
              <van-dropdown-menu>
                <van-dropdown-item
                  v-model="instanceStatus"
                  :options="statusOptions"
                  title="状态筛选"
                  @change="loadInstances(1)"
                />
              </van-dropdown-menu>
              <van-button
                size="small"
                type="primary"
                icon="replay"
                @click="refreshInstances"
              >
                刷新
              </van-button>
            </div>

            <!-- 实例列表 -->
            <van-pull-refresh v-model="instancesRefreshing" @refresh="refreshInstances">
              <van-list
                v-model:loading="instancesLoading"
                :finished="instancesFinished"
                finished-text="没有更多了"
                @load="loadInstances"
              >
                <div
                  v-for="instance in instances"
                  :key="instance.id"
                  class="instance-card"
                  @click="editInstance(instance)"
                >
                  <div class="card-header">
                    <div class="instance-info">
                      <h3 class="instance-title">{{ instance.title }}</h3>
                      <van-tag :type="getStatusType(instance.status)" size="small">
                        {{ getStatusLabel(instance.status) }}
                      </van-tag>
                    </div>
                  </div>

                  <div class="card-body">
                    <div class="progress-section">
                      <div class="progress-label">
                        完成度: {{ parseFloat(instance.completionRate || 0) }}%
                      </div>
                      <van-progress
                        :percentage="parseFloat(instance.completionRate || 0)"
                        :color="getProgressColor(parseFloat(instance.completionRate || 0))"
                        stroke-width="6"
                      />
                    </div>

                    <div class="instance-meta">
                      <span class="meta-item">
                        <van-icon name="clock-o" />
                        {{ formatDate(instance.updatedAt) }}
                      </span>
                    </div>
                  </div>

                  <div class="card-actions">
                    <van-button
                      size="small"
                      type="primary"
                      plain
                      @click.stop="editInstance(instance)"
                    >
                      编辑
                    </van-button>
                    <van-button
                      size="small"
                      type="danger"
                      plain
                      @click.stop="deleteInstance(instance)"
                    >
                      删除
                    </van-button>
                  </div>
                </div>
              </van-list>
            </van-pull-refresh>
          </div>
        </van-tab>
      </van-tabs>

      <!-- 创建实例弹窗 -->
      <van-popup
        v-model:show="createInstanceDialogVisible"
        position="bottom"
        round
        :style="{ height: '70%' }"
      >
        <div class="create-instance-popup">
          <div class="popup-header">
            <h3>从模板创建实例</h3>
            <van-button
              type="primary"
              size="small"
              @click="createInstanceDialogVisible = false"
            >
              取消
            </van-button>
          </div>

          <van-form @submit="confirmCreateInstance">
            <van-cell-group inset>
              <van-field
                v-model="newInstanceForm.templateName"
                label="模板名称"
                readonly
              />
              <van-field
                v-model="newInstanceForm.title"
                label="实例标题"
                placeholder="输入文档实例标题"
                required
                :rules="[{ required: true, message: '请输入实例标题' }]"
              />
              <van-field
                v-model="newInstanceForm.deadline"
                label="截止时间"
                placeholder="选择截止时间"
                readonly
                @click="showDeadlinePicker = true"
              />
              <van-field name="assignedTo" label="分配给">
                <template #input>
                  <van-radio-group v-model="newInstanceForm.assignedTo" direction="horizontal">
                    <van-radio name="self">我自己</van-radio>
                    <van-radio name="other">其他用户</van-radio>
                  </van-radio-group>
                </template>
              </van-field>
            </van-cell-group>

            <div class="popup-actions">
              <van-button
                type="primary"
                size="large"
                native-type="submit"
                :loading="createInstanceLoading"
                block
              >
                创建实例
              </van-button>
            </div>
          </van-form>
        </div>
      </van-popup>

      <!-- 时间选择器 -->
      <van-popup v-model:show="showDeadlinePicker" position="bottom">
        <van-date-picker
          v-model="deadlineDate"
          title="选择截止时间"
          :min-date="new Date()"
          @confirm="onDeadlineConfirm"
          @cancel="showDeadlinePicker = false"
        />
      </van-popup>
    </div>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'
import { getTemplates, getTemplateById, type Template } from '@/api/endpoints/document-templates'
import {
  getInstances,
  createInstance as createInstanceAPI,
  deleteInstance as deleteInstanceAPI,
  type DocumentInstance
} from '@/api/endpoints/document-instances'

// 路由
const router = useRouter()
const route = useRoute()

// 标签页
const activeTab = ref('templates')

// 模板相关
const templates = ref<Template[]>([])
const templatesLoading = ref(false)
const templatesRefreshing = ref(false)
const templatesFinished = ref(false)
const templatePage = ref(1)
const templatePageSize = ref(10)
const templateTotal = ref(0)
const templateKeyword = ref('')
const templateCategory = ref('')

// 实例相关
const instances = ref<DocumentInstance[]>([])
const instancesLoading = ref(false)
const instancesRefreshing = ref(false)
const instancesFinished = ref(false)
const instancePage = ref(1)
const instancePageSize = ref(10)
const instanceTotal = ref(0)
const instanceKeyword = ref('')
const instanceStatus = ref('')

// 创建实例弹窗
const createInstanceDialogVisible = ref(false)
const createInstanceLoading = ref(false)
const showDeadlinePicker = ref(false)
const deadlineDate = ref(new Date())
const newInstanceForm = ref({
  templateId: 0,
  templateName: '',
  title: '',
  deadline: '',
  assignedTo: 'self'
})

// 统计数据
const completedInstances = ref(0)
const completionRate = ref(0)

// 分类选项
const categoryOptions = [
  { text: '全部分类', value: '' },
  { text: '检查表', value: 'checklist' },
  { text: '报告', value: 'report' },
  { text: '计划', value: 'plan' },
  { text: '总结', value: 'summary' }
]

// 状态选项
const statusOptions = [
  { text: '全部状态', value: '' },
  { text: '草稿', value: 'draft' },
  { text: '待审核', value: 'pending_review' },
  { text: '已批准', value: 'approved' },
  { text: '已拒绝', value: 'rejected' },
  { text: '已归档', value: 'archived' }
]

// 加载模板列表
const loadTemplates = async (page: number = templatePage.value) => {
  if (templatesLoading.value && page === templatePage.value) return

  try {
    templatesLoading.value = true
    const response = await getTemplates({
      page,
      pageSize: templatePageSize.value,
      keyword: templateKeyword.value,
      category: templateCategory.value
    })

    if (response.items) {
      if (page === 1) {
        templates.value = response.items
      } else {
        templates.value.push(...response.items)
      }

      templateTotal.value = response.total || 0
      templatePage.value = page

      // 判断是否加载完成
      templatesFinished.value = templates.value.length >= templateTotal.value
    }
  } catch (error) {
    console.error('加载模板列表失败:', error)
    showToast('加载模板列表失败')
  } finally {
    templatesLoading.value = false
    templatesRefreshing.value = false
  }
}

// 加载实例列表
const loadInstances = async (page: number = instancePage.value) => {
  if (instancesLoading.value && page === instancePage.value) return

  try {
    instancesLoading.value = true
    const response = await getInstances({
      page,
      pageSize: instancePageSize.value,
      keyword: instanceKeyword.value,
      status: instanceStatus.value
    })

    if (response.items) {
      if (page === 1) {
        instances.value = response.items
      } else {
        instances.value.push(...response.items)
      }

      instanceTotal.value = response.total || 0
      instancePage.value = page

      // 判断是否加载完成
      instancesFinished.value = instances.value.length >= instanceTotal.value

      // 计算统计数据
      calculateStatistics()
    }
  } catch (error) {
    console.error('加载实例列表失败:', error)
    showToast('加载实例列表失败')
  } finally {
    instancesLoading.value = false
    instancesRefreshing.value = false
  }
}

// 计算统计数据
const calculateStatistics = () => {
  const completed = instances.value.filter(i =>
    i.status === 'approved' || i.status === 'completed'
  ).length
  completedInstances.value = completed

  const totalCompletion = instances.value.reduce((sum, i) =>
    sum + parseFloat(i.completionRate?.toString() || '0'), 0
  )
  completionRate.value = instances.value.length > 0
    ? Math.round(totalCompletion / instances.value.length)
    : 0
}

// 刷新模板
const refreshTemplates = () => {
  templatesRefreshing.value = true
  templatePage.value = 1
  templatesFinished.value = false
  loadTemplates(1)
}

// 刷新实例
const refreshInstances = () => {
  instancesRefreshing.value = true
  instancePage.value = 1
  instancesFinished.value = false
  loadInstances(1)
}

// 创建实例
const createInstanceFromTemplate = (template: Template) => {
  newInstanceForm.value = {
    templateId: template.id,
    templateName: template.name,
    title: `${template.name}实例 - ${new Date().toLocaleString()}`,
    deadline: '',
    assignedTo: 'self'
  }
  createInstanceDialogVisible.value = true
}

// 确认创建实例
const confirmCreateInstance = async () => {
  if (!newInstanceForm.value.title.trim()) {
    showToast('请输入实例标题')
    return
  }

  try {
    createInstanceLoading.value = true
    const response = await createInstanceAPI({
      templateId: newInstanceForm.value.templateId,
      title: newInstanceForm.value.title,
      deadline: newInstanceForm.value.deadline
    })

    showToast('实例创建成功')
    createInstanceDialogVisible.value = false

    // 刷新实例列表
    instancePage.value = 1
    instancesFinished.value = false
    await loadInstances(1)

    // 切换到实例标签页
    activeTab.value = 'instances'
  } catch (error) {
    console.error('创建实例失败:', error)
    showToast('创建实例失败')
  } finally {
    createInstanceLoading.value = false
  }
}

// 编辑实例
const editInstance = (instance: DocumentInstance) => {
  showToast('编辑功能开发中...')
  // TODO: 实现编辑功能
  // router.push(`/mobile/document-center/instance/${instance.id}`)
}

// 删除实例
const deleteInstance = async (instance: DocumentInstance) => {
  try {
    await showConfirmDialog({
      title: '删除确认',
      message: `确定要删除实例"${instance.title}"吗？`,
      type: 'warning'
    })

    await deleteInstanceAPI(instance.id)
    showToast('删除成功')

    // 刷新实例列表
    instancePage.value = 1
    instancesFinished.value = false
    await loadInstances(1)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除实例失败:', error)
      showToast('删除失败')
    }
  }
}

// 查看模板
const viewTemplate = (template: Template) => {
  showToast('查看功能开发中...')
  // TODO: 实现查看功能
  // router.push(`/mobile/document-center/template/${template.id}`)
}

// 截止时间确认
const onDeadlineConfirm = (value: Date) => {
  newInstanceForm.value.deadline = value.toISOString()
  showDeadlinePicker.value = false
}

// 获取状态标签
const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: '草稿',
    pending_review: '待审核',
    approved: '已批准',
    rejected: '已拒绝',
    archived: '已归档'
  }
  return statusMap[status] || status
}

// 获取状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    draft: 'default',
    pending_review: 'warning',
    approved: 'success',
    rejected: 'danger',
    archived: 'default'
  }
  return typeMap[status] || 'default'
}

// 获取进度条颜色
const getProgressColor = (percentage: number) => {
  if (percentage >= 100) return '#07c160'
  if (percentage >= 75) return '#ff976a'
  if (percentage >= 50) return '#1989fa'
  return '#ee0a24'
}

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 页面加载
onMounted(async () => {
  await loadTemplates()
  await loadInstances()
  
  // 检查是否有 createFrom 参数，如果有则自动打开创建对话框
  const createFrom = route.query.createFrom
  if (createFrom) {
    const templateId = Number(createFrom)
    // 查找对应的模板
    const template = templates.value.find(t => t.id === templateId)
    if (template) {
      createInstanceFromTemplate(template)
    } else {
      // 如果本地列表中没有，则请求接口获取
      try {
        const response = await getTemplateById(String(templateId))
        if (response.success && response.data) {
          createInstanceFromTemplate(response.data)
        }
      } catch (error) {
        console.error('加载模板失败:', error)
      }
    }
  }
})
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';
.mobile-document-center {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: var(--van-tabbar-height);
}

.overview-section {
  background: var(--card-bg);
  padding: var(--spacing-md);
  margin-bottom: 8px;

  .overview-header {
    margin-bottom: 20px;
    text-align: center;

    h2 {
      margin: 0 0 8px 0;
      font-size: var(--text-xl);
      color: #323233;
    }

    p {
      margin: 0;
      color: #969799;
      font-size: var(--text-sm);
    }
  }

  .stats-grid {
    .stat-item {
      text-align: center;

      .stat-value {
        font-size: var(--text-2xl);
        font-weight: bold;
        color: #1989fa;
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: var(--text-xs);
        color: #969799;
      }
    }
  }
}

.tab-content {
  background: var(--card-bg);
  min-height: calc(100vh - 200px);
}

.search-section {
  padding: var(--spacing-md) 16px;
  background: var(--card-bg);
  border-bottom: 1px solid #ebedf0;
}

.filter-section {
  padding: var(--spacing-md) 16px;
  background: var(--card-bg);
  border-bottom: 1px solid #ebedf0;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);

  .van-dropdown-menu {
    flex: 1;
  }
}

.template-card,
.instance-card {
  margin: var(--spacing-sm) 16px;
  padding: var(--spacing-md);
  background: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
  }

  .card-header {
    margin-bottom: 12px;

    .template-info,
    .instance-info {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      .template-name,
      .instance-title {
        margin: 0 0 8px 0;
        font-size: var(--text-base);
        font-weight: 600;
        color: #323233;
        flex: 1;
        margin-right: 12px;
        line-height: 1.4;
      }
    }

    .template-meta {
      .template-code {
        font-size: var(--text-xs);
        color: #969799;
        font-family: monospace;
      }
    }
  }

  .card-body {
    margin-bottom: 16px;

    .template-stats {
      display: flex;
      gap: var(--spacing-md);

      .stat-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        font-size: var(--text-xs);
        color: #969799;

        .van-icon {
          font-size: var(--text-sm);
        }
      }
    }

    .progress-section {
      margin-bottom: 12px;

      .progress-label {
        font-size: var(--text-xs);
        color: #969799;
        margin-bottom: 6px;
      }

      .van-progress {
        margin-bottom: 8px;
      }
    }

    .instance-meta {
      .meta-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        font-size: var(--text-xs);
        color: #969799;

        .van-icon {
          font-size: var(--text-sm);
        }
      }
    }
  }

  .card-actions {
    display: flex;
    gap: var(--spacing-sm);
    justify-content: flex-end;

    .van-button {
      min-width: 70px;
    }
  }
}

.create-instance-popup {
  height: 100%;
  display: flex;
  flex-direction: column;

  .popup-header {
    padding: var(--spacing-md);
    border-bottom: 1px solid #ebedf0;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
      font-size: var(--text-lg);
      color: #323233;
    }
  }

  .van-form {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-md) 0;
  }

  .popup-actions {
    padding: var(--spacing-md);
    border-top: 1px solid #ebedf0;
  }
}

// 响应式适配
@media (min-width: 768px) {
  .mobile-document-center {
    max-width: 768px;
    margin: 0 auto;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  }
}
</style>
