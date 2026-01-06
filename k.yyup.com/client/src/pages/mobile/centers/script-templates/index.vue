<template>
  <MobileMainLayout
    title="话术模板管理"
    @back="handleBack"
  >
    <div class="script-templates-mobile">
      <!-- 搜索和筛选栏 -->
      <van-sticky>
        <div class="search-filter-section">
          <van-search
            v-model="queryParams.keyword"
            placeholder="搜索话术标题或关键词"
            @search="handleQuery"
            @clear="handleQuery"
            show-action
            shape="round"
          />

          <div class="filter-tabs">
            <van-tabs
              v-model:active="activeCategory"
              @change="handleCategoryChange"
              shrink
              sticky
              offset-top="54px"
            >
              <van-tab title="全部" name="" />
              <van-tab title="问候语" name="greeting" />
              <van-tab title="介绍话术" name="introduction" />
              <van-tab title="常见问答" name="qa" />
              <van-tab title="邀约话术" name="invitation" />
              <van-tab title="结束语" name="closing" />
              <van-tab title="其他" name="other" />
            </van-tabs>
          </div>

          <div class="filter-actions">
            <van-dropdown-menu>
              <van-dropdown-item
                v-model="queryParams.status"
                :options="statusOptions"
                @change="handleQuery"
                title="状态筛选"
              />
            </van-dropdown-menu>
          </div>
        </div>
      </van-sticky>

      <!-- 统计卡片 -->
      <div class="stats-section">
        <van-grid :column-num="2" :gutter="12">
          <van-grid-item
            v-for="stat in categoryStats"
            :key="stat.category"
            class="stat-item"
          >
            <div class="stat-content">
              <div class="stat-title">{{ getCategoryLabel(stat.category) }}</div>
              <div class="stat-value">{{ stat.count }}</div>
              <div class="stat-detail">
                <span>使用 {{ stat.totalUsage }}次</span>
                <span>成功率 {{ stat.avgSuccessRate }}%</span>
              </div>
            </div>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 操作栏 -->
      <div class="action-bar">
        <div class="selected-info" v-if="selectedIds.length > 0">
          已选择 {{ selectedIds.length }} 项
        </div>
        <div class="action-buttons">
          <van-button
            v-if="selectedIds.length > 0"
            type="danger"
            size="small"
            @click="handleBatchDelete"
          >
            批量删除
          </van-button>
          <van-button
            type="primary"
            size="small"
            icon="plus"
            @click="handleCreate"
          >
            新建话术
          </van-button>
        </div>
      </div>

      <!-- 话术列表 -->
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
          class="template-list"
        >
          <van-cell-group inset v-for="template in templateList" :key="template.id">
            <van-swipe-cell>
              <van-cell>
                <!-- 选择框 -->
                <template #title>
                  <div class="template-header">
                    <van-checkbox
                      :model-value="selectedIds.includes(template.id)"
                      @update:model-value="(checked) => {
                        if (checked) {
                          selectedIds.push(template.id)
                        } else {
                          const index = selectedIds.indexOf(template.id)
                          if (index > -1) selectedIds.splice(index, 1)
                        }
                      }"
                      @click.stop
                    />
                    <span class="template-title">{{ template.title }}</span>
                    <van-tag
                      :type="getCategoryTagType(template.category)"
                      size="small"
                    >
                      {{ getCategoryLabel(template.category) }}
                    </van-tag>
                  </div>
                </template>

                <!-- 内容预览 -->
                <template #label>
                  <div class="template-content">
                    <div class="keywords">
                      <van-tag
                        v-for="keyword in template.keywords.split(',').slice(0, 3)"
                        :key="keyword"
                        size="small"
                        plain
                        type="primary"
                      >
                        {{ keyword.trim() }}
                      </van-tag>
                      <span v-if="template.keywords.split(',').length > 3" class="more-keywords">
                        +{{ template.keywords.split(',').length - 3 }}
                      </span>
                    </div>
                    <div class="content-preview">
                      {{ template.content }}
                    </div>
                    <div class="template-meta">
                      <div class="meta-item">
                        <van-icon name="fire" />
                        <span>使用 {{ template.usageCount }}次</span>
                      </div>
                      <div class="meta-item">
                        <van-icon name="chart-trending-o" />
                        <span>成功率 {{ template.successRate }}%</span>
                      </div>
                      <div class="meta-item">
                        <van-rate
                          v-model="template.priority"
                          :size="12"
                          :count="10"
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                </template>

                <!-- 状态开关和操作按钮 -->
                <template #right-icon>
                  <div class="template-actions">
                    <van-switch
                      v-model="template.status"
                      active-value="active"
                      inactive-value="inactive"
                      size="small"
                      @change="handleStatusChange(template)"
                      @click.stop
                    />
                    <div class="action-buttons-inline">
                      <van-button
                        type="primary"
                        size="mini"
                        plain
                        @click.stop="handleTest(template)"
                      >
                        测试
                      </van-button>
                      <van-button
                        type="primary"
                        size="mini"
                        plain
                        @click.stop="handleEdit(template)"
                      >
                        编辑
                      </van-button>
                    </div>
                  </div>
                </template>
              </van-cell>

              <!-- 右滑删除 -->
              <template #right>
                <van-button
                  square
                  type="danger"
                  text="删除"
                  style="height: 100%"
                  @click="handleDelete(template)"
                />
              </template>
            </van-swipe-cell>
          </van-cell-group>
        </van-list>
      </van-pull-refresh>

      <!-- 空状态 -->
      <van-empty
        v-if="!loading && templateList.length === 0"
        description="暂无话术模板"
        image="search"
      >
        <van-button type="primary" @click="handleCreate">创建第一个话术</van-button>
      </van-empty>
    </div>

    <!-- 创建/编辑话术弹窗 -->
    <van-popup
      v-model:show="dialogVisible"
      position="bottom"
      :style="{ height: '80%' }"
      round
    >
      <div class="form-popup">
        <van-nav-bar
          :title="dialogTitle"
          left-arrow
          @click-left="dialogVisible = false"
        >
          <template #right>
            <van-button
              type="primary"
              size="small"
              :loading="submitting"
              @click="handleSubmit"
            >
              保存
            </van-button>
          </template>
        </van-nav-bar>

        <div class="form-content">
          <van-form ref="formRef" @submit="handleSubmit">
            <van-cell-group inset>
              <van-field
                v-model="formData.title"
                label="话术标题"
                placeholder="请输入话术标题"
                required
                :rules="[{ required: true, message: '请输入话术标题' }]"
              />

              <van-field
                v-model="formData.category"
                label="分类"
                placeholder="请选择分类"
                required
                readonly
                clickable
                @click="showCategoryPicker = true"
                :rules="[{ required: true, message: '请选择分类' }]"
              />

              <van-field
                v-model="formData.keywords"
                label="关键词"
                type="textarea"
                placeholder="请输入关键词，多个关键词用逗号分隔"
                rows="3"
                required
                :rules="[{ required: true, message: '请输入关键词' }]"
              >
                <template #button>
                  <van-button size="mini" type="primary" @click="insertSampleKeywords">
                    示例
                  </van-button>
                </template>
              </van-field>

              <van-field
                v-model="formData.content"
                label="话术内容"
                type="textarea"
                placeholder="请输入话术内容"
                rows="6"
                required
                :rules="[{ required: true, message: '请输入话术内容' }]"
              />

              <van-cell title="优先级" :value="`当前: ${formData.priority}`">
                <template #right-icon>
                  <van-slider
                    v-model="formData.priority"
                    :min="1"
                    :max="10"
                    :step="1"
                    style="width: 120px"
                  />
                </template>
              </van-cell>

              <van-cell title="状态">
                <template #right-icon>
                  <van-radio-group v-model="formData.status" direction="horizontal">
                    <van-radio name="active">启用</van-radio>
                    <van-radio name="inactive">禁用</van-radio>
                  </van-radio-group>
                </template>
              </van-cell>
            </van-cell-group>
          </van-form>
        </div>
      </div>
    </van-popup>

    <!-- 分类选择器 -->
    <van-popup v-model:show="showCategoryPicker" position="bottom">
      <van-picker
        :columns="categoryOptions"
        @confirm="onCategoryConfirm"
        @cancel="showCategoryPicker = false"
      />
    </van-popup>

    <!-- 测试话术弹窗 -->
    <van-popup
      v-model:show="testDialogVisible"
      position="bottom"
      :style="{ height: '60%' }"
      round
    >
      <div class="test-popup">
        <van-nav-bar
          title="测试话术匹配"
          left-arrow
          @click-left="testDialogVisible = false"
        />

        <div class="test-content">
          <van-cell-group inset>
            <van-field
              v-model="testInput"
              label="测试输入"
              type="textarea"
              placeholder="请输入客户可能说的话"
              rows="3"
            />
            <van-button
              type="primary"
              block
              @click="handleTestMatch"
              :loading="testLoading"
            >
              测试匹配
            </van-button>
          </van-cell-group>

          <div v-if="testResult" class="test-result">
            <van-cell-group inset>
              <van-cell :title="`匹配得分: ${testResult.score}`">
                <template #right-icon>
                  <van-tag
                    :type="testResult.score > 5 ? 'success' : 'warning'"
                  >
                    {{ testResult.score > 5 ? '匹配度高' : '匹配度低' }}
                  </van-tag>
                </template>
              </van-cell>

              <van-cell
                v-if="testResult.matchedKeywords.length > 0"
                title="匹配的关键词"
              >
                <template #label>
                  <van-tag
                    v-for="kw in testResult.matchedKeywords"
                    :key="kw"
                    type="primary"
                    size="small"
                    style="margin: 2px"
                  >
                    {{ kw }}
                  </van-tag>
                </template>
              </van-cell>

              <van-cell
                v-if="testResult.template"
                title="匹配的话术"
                :label="testResult.template.content"
              />
            </van-cell-group>
          </div>
        </div>
      </div>
    </van-popup>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog, showLoadingToast, closeToast } from 'vant'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'
import {
  getScriptTemplates,
  createScriptTemplate,
  updateScriptTemplate,
  deleteScriptTemplate,
  batchDeleteScriptTemplates,
  matchScriptTemplate,
  getScriptCategoryStats,
  type ScriptTemplate,
  type ScriptTemplateQuery,
  type ScriptTemplateForm,
  type ScriptMatchResult
} from '@/api/endpoints/script-template'

// 路由
const router = useRouter()

// 查询参数
const queryParams = reactive<ScriptTemplateQuery>({
  page: 1,
  pageSize: 10,
  category: '',
  status: '',
  keyword: ''
})

// 列表数据
const templateList = ref<ScriptTemplate[]>([])
const total = ref(0)
const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const selectedIds = ref<number[]>([])

// 统计数据
const categoryStats = ref<any[]>([])

// 分类相关
const activeCategory = ref('')
const showCategoryPicker = ref(false)
const categoryOptions = [
  { text: '问候语', value: 'greeting' },
  { text: '介绍话术', value: 'introduction' },
  { text: '常见问答', value: 'qa' },
  { text: '邀约话术', value: 'invitation' },
  { text: '结束语', value: 'closing' },
  { text: '其他', value: 'other' }
]

const statusOptions = [
  { text: '全部状态', value: '' },
  { text: '启用', value: 'active' },
  { text: '禁用', value: 'inactive' }
]

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formData = reactive<ScriptTemplateForm>({
  title: '',
  category: '',
  keywords: '',
  content: '',
  priority: 5,
  status: 'active'
})
const submitting = ref(false)
const editingId = ref<number | null>(null)

// 测试对话框
const testDialogVisible = ref(false)
const testInput = ref('')
const testResult = ref<ScriptMatchResult | null>(null)
const testLoading = ref(false)

// 获取分类标签
const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    greeting: '问候语',
    introduction: '介绍话术',
    qa: '常见问答',
    invitation: '邀约话术',
    closing: '结束语',
    other: '其他'
  }
  return labels[category] || category
}

// 获取分类标签类型
const getCategoryTagType = (category: string) => {
  const types: Record<string, any> = {
    greeting: 'success',
    introduction: 'primary',
    qa: 'info',
    invitation: 'warning',
    closing: 'danger',
    other: 'default'
  }
  return types[category] || 'default'
}

// 加载数据
const loadData = async (isRefresh = false) => {
  if (isRefresh) {
    queryParams.page = 1
    finished.value = false
  }

  loading.value = true
  try {
    const res = await getScriptTemplates(queryParams)
    if (isRefresh) {
      templateList.value = res.data.items
    } else {
      templateList.value.push(...res.data.items)
    }
    total.value = res.data.total

    if (templateList.value.length >= total.value) {
      finished.value = true
    }
  } catch (error) {
    showToast('加载话术模板失败')
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 加载统计数据
const loadStats = async () => {
  try {
    const res = await getScriptCategoryStats()
    categoryStats.value = res.data
  } catch (error) {
    console.error('加载统计数据失败', error)
  }
}

// 下拉刷新
const onRefresh = () => {
  loadData(true)
  loadStats()
}

// 加载更多
const onLoad = () => {
  if (!finished.value) {
    queryParams.page++
    loadData()
  }
}

// 查询
const handleQuery = () => {
  loadData(true)
}

// 分类切换
const handleCategoryChange = (value: string) => {
  queryParams.category = value
  handleQuery()
}

// 重置
const handleReset = () => {
  queryParams.category = ''
  queryParams.status = ''
  queryParams.keyword = ''
  activeCategory.value = ''
  handleQuery()
}

// 创建
const handleCreate = () => {
  dialogTitle.value = '新建话术'
  editingId.value = null
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: ScriptTemplate) => {
  dialogTitle.value = '编辑话术'
  editingId.value = row.id
  Object.assign(formData, {
    title: row.title,
    category: row.category,
    keywords: row.keywords,
    content: row.content,
    priority: row.priority,
    status: row.status
  })
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row: ScriptTemplate) => {
  try {
    await showConfirmDialog({
      title: '提示',
      message: `确定要删除话术"${row.title}"吗？`
    })
    await deleteScriptTemplate(row.id)
    showToast('删除成功')
    loadData(true)
    loadStats()
  } catch (error: any) {
    if (error !== 'cancel') {
      showToast('删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    showToast('请先选择要删除的话术')
    return
  }

  try {
    await showConfirmDialog({
      title: '提示',
      message: `确定要删除选中的 ${selectedIds.value.length} 条话术吗？`
    })
    await batchDeleteScriptTemplates(selectedIds.value)
    showToast('批量删除成功')
    selectedIds.value = []
    loadData(true)
    loadStats()
  } catch (error: any) {
    if (error !== 'cancel') {
      showToast('批量删除失败')
    }
  }
}

// 状态切换
const handleStatusChange = async (row: ScriptTemplate) => {
  try {
    await updateScriptTemplate(row.id, {
      title: row.title,
      category: row.category,
      keywords: row.keywords,
      content: row.content,
      priority: row.priority,
      status: row.status
    })
    showToast('状态更新成功')
  } catch (error) {
    showToast('状态更新失败')
    // 恢复原状态
    row.status = row.status === 'active' ? 'inactive' : 'active'
  }
}

// 测试话术
const handleTest = (row: ScriptTemplate) => {
  testInput.value = ''
  testResult.value = null
  testDialogVisible.value = true
}

// 测试匹配
const handleTestMatch = async () => {
  if (!testInput.value.trim()) {
    showToast('请输入测试内容')
    return
  }

  testLoading.value = true
  try {
    const res = await matchScriptTemplate({
      userInput: testInput.value
    })
    testResult.value = res.data
  } catch (error) {
    showToast('测试失败')
  } finally {
    testLoading.value = false
  }
}

// 提交表单
const handleSubmit = async () => {
  // 表单验证
  if (!formData.title.trim()) {
    showToast('请输入话术标题')
    return
  }
  if (!formData.category) {
    showToast('请选择分类')
    return
  }
  if (!formData.keywords.trim()) {
    showToast('请输入关键词')
    return
  }
  if (!formData.content.trim()) {
    showToast('请输入话术内容')
    return
  }

  submitting.value = true
  const loadingToast = showLoadingToast({
    message: editingId.value ? '更新中...' : '创建中...',
    forbidClick: true,
    duration: 0
  })

  try {
    if (editingId.value) {
      await updateScriptTemplate(editingId.value, formData)
      showToast('更新成功')
    } else {
      await createScriptTemplate(formData)
      showToast('创建成功')
    }
    dialogVisible.value = false
    loadData(true)
    loadStats()
  } catch (error) {
    showToast(editingId.value ? '更新失败' : '创建失败')
  } finally {
    submitting.value = false
    closeToast()
  }
}

// 分类选择确认
const onCategoryConfirm = ({ selectedValues }: { selectedValues: string[] }) => {
  formData.category = selectedValues[0]
  showCategoryPicker.value = false
}

// 插入示例关键词
const insertSampleKeywords = () => {
  const examples = {
    greeting: '你好,您好,喂,请问',
    introduction: '介绍,介绍一下,什么是,我想了解',
    qa: '怎么样,如何,什么时间,多少钱,在哪里',
    invitation: '参加,报名,邀请,有兴趣吗',
    closing: '再见,谢谢,不客气,还有什么问题',
    other: '好的,明白,知道了'
  }
  const category = formData.category as keyof typeof examples
  if (examples[category]) {
    formData.keywords = examples[category]
  }
}

// 重置表单
const resetForm = () => {
  formData.title = ''
  formData.category = ''
  formData.keywords = ''
  formData.content = ''
  formData.priority = 5
  formData.status = 'active'
}

// 返回
const handleBack = () => {
  router.back()
}

// 初始化
onMounted(() => {
  loadData(true)
  loadStats()
})
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';
.script-templates-mobile {
  min-height: 100vh;
  background: var(--van-background-color-light);

  .search-filter-section {
    background: white;
    padding: var(--spacing-sm) 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .filter-tabs {
      margin: var(--spacing-sm) 0;

      :deep(.van-tabs__nav) {
        padding-bottom: 0;
      }
    }

    .filter-actions {
      display: flex;
      justify-content: flex-end;
    }
  }

  .stats-section {
    padding: var(--spacing-md);

    .stat-item {
      text-align: center;

      .stat-content {
        .stat-title {
          font-size: var(--van-font-size-md);
          color: var(--van-text-color-2);
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: var(--van-font-size-xl);
          font-weight: 600;
          color: var(--van-primary-color);
          margin-bottom: 4px;
        }

        .stat-detail {
          font-size: var(--van-font-size-sm);
          color: var(--van-text-color-3);
          display: flex;
          justify-content: space-between;
          gap: var(--spacing-sm);
        }
      }
    }
  }

  .action-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md);
    background: white;
    margin: var(--spacing-sm) 12px;
    border-radius: 8px;

    .selected-info {
      font-size: var(--van-font-size-sm);
      color: var(--van-primary-color);
    }

    .action-buttons {
      display: flex;
      gap: var(--spacing-sm);
    }
  }

  .template-list {
    padding: 0 12px;

    .van-cell-group {
      margin-bottom: 12px;
    }

    .template-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      margin-bottom: 8px;

      .template-title {
        flex: 1;
        font-weight: 600;
        font-size: var(--van-font-size-md);
      }
    }

    .template-content {
      .keywords {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-xs);
        margin-bottom: 8px;

        .more-keywords {
          font-size: var(--van-font-size-xs);
          color: var(--van-text-color-2);
        }
      }

      .content-preview {
        color: var(--van-text-color-2);
        font-size: var(--van-font-size-sm);
        line-height: 1.4;
        margin-bottom: 8px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .template-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: var(--van-font-size-xs);
        color: var(--van-text-color-3);

        .meta-item {
          display: flex;
          align-items: center;
          gap: 2px;
        }
      }
    }

    .template-actions {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
      align-items: flex-end;

      .action-buttons-inline {
        display: flex;
        gap: var(--spacing-xs);
      }
    }
  }
}

.form-popup {
  height: 100%;
  display: flex;
  flex-direction: column;

  .form-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-md) 0;
  }
}

.test-popup {
  height: 100%;
  display: flex;
  flex-direction: column;

  .test-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-md) 0;

    .test-result {
      margin-top: 16px;
    }
  }
}

// 响应式适配
@media (min-width: 768px) {
  .script-templates-mobile {
    max-width: 768px;
    margin: 0 auto;
  }
}
</style>