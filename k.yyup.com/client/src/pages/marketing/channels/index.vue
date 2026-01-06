<template>
  <div class="marketing-channels page-container">
    <PageHeader title="渠道">
      <template #actions>
        <el-button type="primary" @click="openCreate">
          <UnifiedIcon name="Plus" />
          新建渠道
        </el-button>
      </template>
    </PageHeader>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-value">{{ stats.totalChannels }}</div>
        <div class="stat-label">总渠道数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.activeChannels }}</div>
        <div class="stat-label">活跃渠道</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.monthlyLeads }}</div>
        <div class="stat-label">本月引流</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.conversionRate }}%</div>
        <div class="stat-label">平均转化率</div>
      </div>
    </div>

    <div class="app-card">
      <div class="search-section">
        <el-form :inline="true" :model="filters">
          <el-form-item label="关键词">
            <el-input
              v-model="filters.keyword"
              placeholder="渠道名/UTM来源"
              clearable
              style="max-width: 200px; width: 100%"
              @keyup.enter="loadList"
            />
          </el-form-item>
          <el-form-item label="渠道类型">
            <el-select v-model="filters.channelType" clearable placeholder="选择类型" style="max-max-width: 150px; width: 100%; width: 100%">
              <el-option label="线上" value="online" />
              <el-option label="线下" value="offline" />
              <el-option label="推荐" value="referral" />
              <el-option label="广告" value="advertisement" />
            </el-select>
          </el-form-item>
          <el-form-item label="标签">
            <el-select v-model="filters.tag" clearable placeholder="选择标签" style="width: 150px">
              <el-option v-for="tag in availableTags" :key="tag" :label="tag" :value="tag" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadList">
              <UnifiedIcon name="Search" />
              查询
            </el-button>
            <el-button @click="reset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="table-wrapper">
<el-table class="responsive-table" :data="list" v-loading="loading" style="width:100%" @sort-change="handleSort">
        <el-table-column prop="channelName" label="渠道名称" width="180" show-overflow-tooltip fixed="left" />
        <el-table-column prop="channelType" label="类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getChannelTypeTag(row.channelType)">{{ getChannelTypeText(row.channelType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="utmSource" label="UTM来源" width="120" show-overflow-tooltip />
        <el-table-column label="访问/线索" width="120" sortable="custom" prop="visitCount" align="center">
          <template #default="{ row }">
            <div class="metrics-cell">
              <div>{{ row.visitCount || 0 }}/{{ row.leadCount || 0 }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="转化数/率" width="120" sortable="custom" prop="conversionRate" align="center">
          <template #default="{ row }">
            <div class="metrics-cell">
              <div>{{ row.conversionCount || 0 }}</div>
              <div class="conversion-rate">{{ formatNumber(row.conversionRate, 1) }}%</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="成本/ROI" width="120" align="center">
          <template #default="{ row }">
            <div class="metrics-cell">
              <div>¥{{ formatCurrency(row.cost) }}</div>
              <div class="roi" :class="{ positive: formatNumber(row.roi) > 0 }">{{ formatNumber(row.roi, 1) }}%</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="联系人" width="150" align="center">
          <template #default="{ row }">
            <div class="contacts-cell">
              <el-button size="small" text @click="manageContacts(row)">
                管理联系人 ({{ (row.contacts || []).length }})
              </el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="标签" width="180" align="center">
          <template #default="{ row }">
            <div class="tags-cell">
              <el-tag
                v-for="tag in (row.tags || []).filter(t => t && t.trim()).slice(0, 2)"
                :key="tag"
                :type="getTagType(tag)"
                size="small"
                style="margin-right: var(--spacing-xs)"
              >
                {{ tag }}
              </el-tag>
              <el-button v-if="(row.tags || []).filter(t => t && t.trim()).length > 2" size="small" text>
                +{{ (row.tags || []).filter(t => t && t.trim()).length - 2 }}
              </el-button>
              <el-button size="small" text @click="manageTags(row)">
                <UnifiedIcon name="Edit" />
              </el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="{ row }">
            <el-button size="small" @click="viewMetrics(row)">
              <UnifiedIcon name="default" />
              指标
            </el-button>
            <el-button size="small" type="primary" @click="edit(row)">
              <UnifiedIcon name="Edit" />
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="deleteChannel(row)">
              <UnifiedIcon name="Delete" />
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
</div>

      <div class="pagination-section">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10,20,50,100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadList"
          @current-change="loadList"
        />
      </div>
    </div>

    <!-- 渠道编辑对话框 -->
    <ChannelEditDialog
      v-model="editDialogVisible"
      :channel="currentChannel"
      @success="handleEditSuccess"
    />

    <!-- 联系人管理对话框 -->
    <ContactManageDialog
      v-model="contactDialogVisible"
      :channel="currentChannel"
      @success="loadList"
    />

    <!-- 标签管理对话框 -->
    <TagManageDialog
      v-model="tagDialogVisible"
      :channel="currentChannel"
      @success="loadList"
    />

    <!-- 指标详情对话框 -->
    <MetricsDialog
      v-model="metricsDialogVisible"
      :channel="currentChannel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Edit, Delete, TrendCharts } from '@element-plus/icons-vue'
import PageHeader from '@/components/common/PageHeader.vue'
import ChannelEditDialog from './components/ChannelEditDialog.vue'
import ContactManageDialog from './components/ContactManageDialog.vue'
import TagManageDialog from './components/TagManageDialog.vue'
import MetricsDialog from './components/MetricsDialog.vue'
import request from '@/utils/request'

// 数据状态
const loading = ref(false)
const list = ref<any[]>([])
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })
const filters = reactive({
  keyword: '',
  tag: '',
  channelType: '',
  sortField: '',
  sortOrder: ''
})

// 统计数据
const stats = reactive({
  totalChannels: 0,
  activeChannels: 0,
  monthlyLeads: 0,
  conversionRate: 0
})

// 对话框状态
const editDialogVisible = ref(false)
const contactDialogVisible = ref(false)
const tagDialogVisible = ref(false)
const metricsDialogVisible = ref(false)
const currentChannel = ref<any>(null)

// 可用标签
const availableTags = ref<string[]>([])

// 计算属性
const channelTypeOptions = [
  { label: '线上', value: 'online' },
  { label: '线下', value: 'offline' },
  { label: '推荐', value: 'referral' },
  { label: '广告', value: 'advertisement' }
]

// 方法
const loadList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: filters.keyword,
      tag: filters.tag,
      channelType: filters.channelType,
      sortField: filters.sortField,
      sortOrder: filters.sortOrder
    }

    const res = await request.get('/api/marketing/channels', params)
    list.value = res.data?.items || []
    pagination.total = res.data?.total || 0

    // 更新统计数据
    updateStats()
  } catch (e: any) {
    console.error(e)
    ElMessage.error(e.message || '加载渠道列表失败')
  } finally {
    loading.value = false
  }
}

const updateStats = () => {
  stats.totalChannels = list.value.length
  stats.activeChannels = list.value.filter(item => item.status === 'active').length
  stats.monthlyLeads = list.value.reduce((sum, item) => sum + (item.leadCount || 0), 0)
  const totalConversions = list.value.reduce((sum, item) => sum + (item.conversionCount || 0), 0)
  const totalLeads = list.value.reduce((sum, item) => sum + (item.leadCount || 0), 0)
  stats.conversionRate = totalLeads > 0 ? Math.round((totalConversions / totalLeads) * 100 * 10) / 10 : 0
}

const loadAvailableTags = async () => {
  try {
    const res = await request.get('/api/marketing/channels/tags')
    availableTags.value = res.data?.items || []
  } catch (e: any) {
    console.error('加载标签失败:', e)
    // 如果API不存在，使用默认标签
    if (e.response?.status === 404) {
      availableTags.value = ['重要', '推荐', '热门', '新渠道', '高转化', '低成本']
    }
  }
}

const openCreate = () => {
  currentChannel.value = null
  editDialogVisible.value = true
}

const edit = (row: any) => {
  currentChannel.value = { ...row }
  editDialogVisible.value = true
}

const deleteChannel = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除渠道"${row.channelName}"吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await request.delete(`/api/marketing/channels/${row.id}`)
    ElMessage.success('删除成功')
    loadList()
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error(e.message || '删除失败')
    }
  }
}

const manageContacts = (row: any) => {
  currentChannel.value = { ...row }
  contactDialogVisible.value = true
}

const manageTags = (row: any) => {
  currentChannel.value = { ...row }
  tagDialogVisible.value = true
}

const viewMetrics = (row: any) => {
  currentChannel.value = { ...row }
  metricsDialogVisible.value = true
}

const handleEditSuccess = () => {
  editDialogVisible.value = false
  loadList()
}

const handleSort = ({ prop, order }: any) => {
  filters.sortField = prop
  filters.sortOrder = order === 'ascending' ? 'asc' : order === 'descending' ? 'desc' : ''
  loadList()
}

const reset = () => {
  Object.assign(filters, {
    keyword: '',
    tag: '',
    channelType: '',
    sortField: '',
    sortOrder: ''
  })
  loadList()
}

// 辅助方法
const getChannelTypeTag = (type: string) => {
  const typeMap: Record<string, string> = {
    online: 'primary',
    offline: 'success',
    referral: 'warning',
    advertisement: 'info'
  }
  return typeMap[type] || 'info'  // 返回默认值'info'而不是空字符串
}

const getChannelTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    online: '线上',
    offline: '线下',
    referral: '推荐',
    advertisement: '广告'
  }
  return typeMap[type] || type
}

// 数值格式化函数
const formatNumber = (value: any, precision: number = 0): string => {
  // 安全检查：处理 undefined、null 和非数字值
  if (value === undefined || value === null) {
    return '0'
  }

  const num = Number(value)
  if (isNaN(num)) {
    return '0'
  }

  return num.toFixed(precision)
}

const formatCurrency = (value: any): string => {
  const num = Number(value || 0)
  if (isNaN(num)) {
    return '0'
  }
  return num.toLocaleString()
}

// 标签类型获取函数
const getTagType = (tag: string): string => {
  if (!tag || typeof tag !== 'string') {
    return 'info'
  }

  // 根据标签内容返回不同类型
  const tagLower = tag.toLowerCase()
  if (tagLower.includes('重要') || tagLower.includes('优先')) {
    return 'danger'
  } else if (tagLower.includes('推荐') || tagLower.includes('热门')) {
    return 'warning'
  } else if (tagLower.includes('新') || tagLower.includes('活跃')) {
    return 'success'
  } else {
    return 'info'
  }
}

// 生命周期
onMounted(() => {
  loadList()
  loadAvailableTags()
})
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.marketing-channels {
  .stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);
  }

  .stat-card {
    background: var(--color-bg-container);
    border: var(--border-width-base) solid var(--color-border-light);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-lg);
    text-align: center;
    transition: all 0.3s ease;

    &:hover {
      border-color: var(--color-primary);
      box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-light);
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 600;
      color: var(--color-primary);
      margin-bottom: var(--spacing-sm);
    }

    .stat-label {
      color: var(--color-text-secondary);
      font-size: 0.875rem;
    }
  }

  .search-section {
    margin-bottom: var(--spacing-lg);
    padding: var(--spacing-lg);
    background: var(--color-bg-soft);
    border-radius: var(--border-radius-md);
  }

  .metrics-cell {
    text-align: center;

    .conversion-rate {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
      margin-top: var(--spacing-sm);
    }

    .roi {
      font-size: 0.75rem;
      margin-top: var(--spacing-sm);

      &.positive {
        color: var(--color-success);
      }
    }
  }

  .contacts-cell {
    text-align: center;
  }

  .tags-cell {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
  }

  .pagination-section {
    margin-top: var(--spacing-lg);
    display: flex;
    justify-content: center;
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .marketing-channels {
    .stats-cards {
      grid-template-columns: repeat(2, 1fr);
      gap: var(--spacing-md);
    }

    .search-section {
      .el-form {
        .el-form-item {
          margin-bottom: var(--spacing-md);

          .el-input,
          .el-select {
            width: 100% !important;
          }
        }
      }
    }

    .el-table {
      .el-table-column {
        &:not(.is-left) {
          display: none;
        }
      }
    }
  }
}
</style>

