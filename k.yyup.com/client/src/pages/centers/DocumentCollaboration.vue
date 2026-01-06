<template>
  <UnifiedCenterLayout
    title="文档协作"
    description="多人协作编辑文档，支持实时同步和版本管理"
  >
    <template #header-actions>
      <el-button @click="goBack">
        <UnifiedIcon name="ArrowLeft" />
        返回
      </el-button>
    </template>

    <div class="center-container document-collaboration">
      <!-- 文档列表（当没有ID时显示） -->
      <div v-if="!hasDocumentId" class="document-list-container">
        <el-card>
          <template #header>
            <div class="list-header">
              <h2>选择文档</h2>
              <div class="list-actions">
                <el-input
                  v-model="searchKeyword"
                  placeholder="搜索文档标题..."
                  style="width: 300px; margin-right: 12px;"
                  clearable
                  @input="handleSearch"
                >
                  <template #prefix>
                    <UnifiedIcon name="Search" />
                  </template>
                </el-input>
                <el-select 
                  v-model="filterStatus" 
                  placeholder="状态筛选" 
                  clearable 
                  style="width: 150px;"
                  @change="loadInstances"
                >
                  <el-option label="全部状态" value="" />
                  <el-option label="草稿" value="draft" />
                  <el-option label="填写中" value="filling" />
                  <el-option label="审核中" value="review" />
                  <el-option label="已通过" value="approved" />
                  <el-option label="已拒绝" value="rejected" />
                  <el-option label="已完成" value="completed" />
                </el-select>
              </div>
            </div>
          </template>

          <el-table
            v-loading="listLoading"
            :data="instances"
            style="width: 100%"
            @row-click="handleSelectDocument"
            class="document-list-table"
          >
            <el-table-column prop="title" label="文档标题" min-width="200" />
            <el-table-column prop="status" label="状态" width="120">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ getStatusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="progress" label="进度" width="120">
              <template #default="{ row }">
                <el-progress :percentage="row.progress || 0" :color="getProgressColor(row.progress || 0)" />
              </template>
            </el-table-column>
            <el-table-column prop="updatedAt" label="更新时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.updatedAt) }}
              </template>
            </el-table-column>
            <el-table-column prop="deadline" label="截止时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.deadline) }}
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-container">
            <el-pagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.pageSize"
              :total="pagination.total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handlePageChange"
            />
          </div>
        </el-card>
      </div>

      <!-- 文档详情和协作（当有ID时显示） -->
      <el-card v-else v-loading="loading" class="detail-card">
        <!-- 文档基本信息 -->
        <div class="document-header">
          <div class="header-left">
            <h1 class="document-title">{{ document.title || '未命名文档' }}</h1>
            <div class="document-meta">
              <el-tag :type="getStatusType(document.status)">
                {{ getStatusLabel(document.status) }}
              </el-tag>
              <span class="meta-item">
                <UnifiedIcon name="User" />
                所有者: {{ document.ownerName || '未知' }}
              </span>
              <span class="meta-item" v-if="document.assignedToName">
                <UnifiedIcon name="UserFilled" />
                分配给: {{ document.assignedToName }}
              </span>
              <span class="meta-item" v-if="document.deadline">
                <UnifiedIcon name="Calendar" />
                截止时间: {{ formatDate(document.deadline) }}
              </span>
              <span class="meta-item">
                <UnifiedIcon name="Clock" />
                更新时间: {{ formatDate(document.updatedAt) }}
              </span>
              <span class="meta-item" v-if="document.version">
                <UnifiedIcon name="Document" />
                版本: v{{ document.version }}
              </span>
            </div>
          </div>
          <div class="header-right">
            <el-progress
              type="circle"
              :percentage="document.progress || 0"
              :width="80"
              :color="getProgressColor(document.progress || 0)"
            />
          </div>
        </div>

        <el-divider />

        <!-- 标签页 -->
        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
          <!-- 文档内容 -->
          <el-tab-pane label="文档内容" name="content">
            <div class="content-container">
              <div class="markdown-preview" v-html="renderedContent"></div>
              <div v-if="!document.content" class="empty-content">
                <el-empty description="文档内容为空" />
              </div>
            </div>
          </el-tab-pane>

          <!-- 协作管理 -->
          <el-tab-pane label="协作管理" name="collaboration">
            <div class="collaboration-container">
              <!-- 分配文档 -->
              <el-card class="action-card" v-if="canAssign">
                <template #header>
                  <span>分配文档</span>
                </template>
                <el-form :model="assignForm" label-width="100px">
                  <el-form-item label="分配给">
                    <el-select 
                      v-model="assignForm.assignedTo" 
                      placeholder="请选择用户" 
                      filterable
                      style="width: 100%"
                      :loading="usersLoading"
                    >
                      <el-option
                        v-for="user in users"
                        :key="user.id"
                        :label="user.realName || user.username"
                        :value="user.id"
                      >
                        <span>{{ user.realName || user.username }}</span>
                        <span style="color: var(--text-muted); font-size: var(--text-xs); margin-left: 8px;">
                          ({{ user.role }})
                        </span>
                      </el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="截止时间">
                    <el-date-picker
                      v-model="assignForm.deadline"
                      type="datetime"
                      placeholder="请选择截止时间"
                      style="width: 100%"
                      format="YYYY-MM-DD HH:mm"
                      value-format="YYYY-MM-DD HH:mm:ss"
                    />
                  </el-form-item>
                  <el-form-item label="备注">
                    <el-input
                      v-model="assignForm.message"
                      type="textarea"
                      :rows="3"
                      placeholder="请输入备注信息"
                    />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="handleAssign" :loading="assigning">
                      <UnifiedIcon name="Share" />
                      分配
                    </el-button>
                  </el-form-item>
                </el-form>
              </el-card>

              <!-- 提交审核 -->
              <el-card class="action-card" v-if="canSubmit">
                <template #header>
                  <span>提交审核</span>
                </template>
                <el-form :model="submitForm" label-width="100px">
                  <el-form-item label="审核人">
                    <el-select
                      v-model="submitForm.reviewers"
                      multiple
                      placeholder="请选择审核人"
                      filterable
                      style="width: 100%"
                      :loading="usersLoading"
                    >
                      <el-option
                        v-for="user in users"
                        :key="user.id"
                        :label="user.realName || user.username"
                        :value="user.id"
                      >
                        <span>{{ user.realName || user.username }}</span>
                        <span style="color: var(--text-muted); font-size: var(--text-xs); margin-left: 8px;">
                          ({{ user.role }})
                        </span>
                      </el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="说明">
                    <el-input
                      v-model="submitForm.message"
                      type="textarea"
                      :rows="3"
                      placeholder="请输入提交说明"
                    />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="success" @click="handleSubmit" :loading="submitting">
                      <UnifiedIcon name="Check" />
                      提交审核
                    </el-button>
                  </el-form-item>
                </el-form>
              </el-card>

              <!-- 审核文档 -->
              <el-card class="action-card" v-if="canReview">
                <template #header>
                  <span>审核文档</span>
                </template>
                <el-form :model="reviewForm" label-width="100px">
                  <el-form-item label="审核结果">
                    <el-radio-group v-model="reviewForm.approved">
                      <el-radio :label="true">通过</el-radio>
                      <el-radio :label="false">拒绝</el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item label="审核意见">
                    <el-input
                      v-model="reviewForm.comment"
                      type="textarea"
                      :rows="4"
                      placeholder="请输入审核意见"
                    />
                  </el-form-item>
                  <el-form-item>
                    <el-button
                      :type="reviewForm.approved ? 'success' : 'danger'"
                      @click="handleReview"
                      :loading="reviewing"
                    >
                      <UnifiedIcon name="Check" />
                      提交审核结果
                    </el-button>
                  </el-form-item>
                </el-form>
              </el-card>
            </div>
          </el-tab-pane>

          <!-- 评论讨论 -->
          <el-tab-pane name="comments">
            <template #label>
              <span>
                评论讨论
                <el-badge :value="comments.length" class="comment-badge" v-if="comments.length > 0" />
              </span>
            </template>
            <div class="comments-container">
              <!-- 评论列表 -->
              <div class="comments-list">
                <div v-if="comments.length === 0" class="empty-comments">
                  <el-empty description="暂无评论" />
                </div>
                <div v-else>
                  <div
                    v-for="comment in comments"
                    :key="comment.id"
                    class="comment-item"
                  >
                    <div class="comment-header">
                      <el-avatar :size="40">{{ comment.userName?.charAt(0) || 'U' }}</el-avatar>
                      <div class="comment-info">
                        <div class="comment-user">{{ comment.userName || '未知用户' }}</div>
                        <div class="comment-time">{{ formatDate(comment.createdAt) }}</div>
                      </div>
                    </div>
                    <div class="comment-content">{{ comment.content }}</div>
                  </div>
                </div>
              </div>

              <!-- 添加评论 -->
              <div class="add-comment">
                <el-input
                  v-model="newComment"
                  type="textarea"
                  :rows="4"
                  placeholder="输入您的评论..."
                />
                <el-button
                  type="primary"
                  @click="handleAddComment"
                  :loading="commenting"
                  style="margin-top: var(--spacing-sm)"
                >
                  <UnifiedIcon name="ChatDotRound" />
                  发表评论
                </el-button>
              </div>
            </div>
          </el-tab-pane>

          <!-- 版本历史 -->
          <el-tab-pane name="versions">
            <template #label>
              <span>
                版本历史
                <el-badge :value="versions.length" class="version-badge" v-if="versions.length > 0" />
              </span>
            </template>
            <div class="versions-container">
              <el-timeline>
                <el-timeline-item
                  v-for="version in versions"
                  :key="version.id"
                  :timestamp="formatDate(version.createdAt)"
                  placement="top"
                >
                  <el-card>
                    <div class="version-header">
                      <h4>版本 {{ version.version }}</h4>
                      <el-tag :type="getStatusType(version.status)">
                        {{ getStatusLabel(version.status) }}
                      </el-tag>
                    </div>
                    <div class="version-info">
                      <p>创建人: {{ version.createdBy || '未知' }}</p>
                      <p>进度: {{ version.progress || 0 }}%</p>
                      <p v-if="version.title">标题: {{ version.title }}</p>
                    </div>
                    <div class="version-actions">
                      <el-button size="small" @click="handleViewVersion(version)">
                        <UnifiedIcon name="View" />
                        查看
                      </el-button>
                      <el-button size="small" @click="handleRestoreVersion(version)">
                        <UnifiedIcon name="RefreshLeft" />
                        恢复
                      </el-button>
                    </div>
                  </el-card>
                </el-timeline-item>
              </el-timeline>

              <el-button type="primary" @click="handleCreateVersion" style="margin-top: var(--spacing-xl)">
                <UnifiedIcon name="Plus" />
                创建新版本
              </el-button>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'

import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { marked } from 'marked'
import {
  getInstanceById,
  getInstances,
  assignDocument,
  submitForReview,
  reviewDocument,
  getComments,
  addComment,
  getVersionHistory,
  createVersion,
  type DocumentInstance
} from '@/api/endpoints/document-instances'
import { getUserList } from '@/api/modules/user'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 数据
const loading = ref(false)
const listLoading = ref(false)
const activeTab = ref('content')
const usersLoading = ref(false)

// 文档列表相关
const instances = ref<DocumentInstance[]>([])
const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0
})
const searchKeyword = ref('')
const filterStatus = ref('')

const document = ref<DocumentInstance & { ownerName?: string; assignedToName?: string }>({
  id: 0,
  title: '',
  content: '',
  status: 'draft',
  progress: 0,
  deadline: undefined,
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  templateId: 0,
  kindergartenId: 0,
  filledVariables: {},
  ownerId: 0,
  version: 1,
  createdBy: 0
})

const users = ref<any[]>([])
const comments = ref<any[]>([])
const versions = ref<DocumentInstance[]>([])

const assignForm = ref({
  assignedTo: null as number | null,
  deadline: null as string | null,
  message: ''
})

const submitForm = ref({
  reviewers: [] as number[],
  message: ''
})

const reviewForm = ref({
  approved: true,
  comment: ''
})

const newComment = ref('')

const assigning = ref(false)
const submitting = ref(false)
const reviewing = ref(false)
const commenting = ref(false)

// 计算属性
const hasDocumentId = computed(() => {
  return !!getDocumentId()
})

const renderedContent = computed(() => {
  if (!document.value.content) return ''
  try {
    return marked(document.value.content)
  } catch (error) {
    console.error('Markdown渲染失败:', error)
    return document.value.content
  }
})

const canAssign = computed(() => {
  // 只有文档所有者或管理员可以分配
  const currentUserId = userStore.userInfo?.id
  return document.value.ownerId === currentUserId || 
         userStore.userInfo?.role === 'admin' ||
         userStore.userInfo?.role === 'ADMIN'
})

const canSubmit = computed(() => {
  // 进度100%且状态为草稿或填写中时可以提交
  return (document.value.progress || 0) === 100 && 
         (document.value.status === 'draft' || document.value.status === 'filling')
})

const canReview = computed(() => {
  // 状态为审核中时可以审核
  return document.value.status === 'review'
  // TODO: 检查当前用户是否为审核人
})

// 方法
const goBack = () => {
  if (hasDocumentId.value) {
    // 如果有ID，清除ID返回列表
    router.push({
      path: '/centers/document-collaboration'
    })
  } else {
    // 如果没有ID，返回上一页
    router.back()
  }
}

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    draft: 'info',
    filling: 'warning',
    review: 'primary',
    approved: 'success',
    rejected: 'danger',
    completed: 'success'
  }
  return map[status] || 'info'
}

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    draft: '草稿',
    filling: '填写中',
    review: '审核中',
    approved: '已通过',
    rejected: '已拒绝',
    completed: '已完成'
  }
  return map[status] || status
}

const getProgressColor = (progress: number) => {
  if (progress >= 90) return 'var(--success-color)'
  if (progress >= 70) return 'var(--warning-color)'
  if (progress >= 50) return 'var(--danger-color)'
  return 'var(--info-color)'
}

const formatDate = (date: string | Date | null | undefined) => {
  if (!date) return '-'
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return '-'
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  } catch (error) {
    return '-'
  }
}

// 获取文档ID（从query参数或params）
const getDocumentId = (): string | null => {
  const id = route.query.id || route.params.id
  if (id) {
    return String(id)
  }
  return null
}

// 加载文档列表
const loadInstances = async () => {
  listLoading.value = true
  try {
    const params: any = {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      sortBy: 'updatedAt',
      sortOrder: 'DESC'
    }

    if (filterStatus.value) {
      params.status = filterStatus.value
    }

    if (searchKeyword.value) {
      params.keyword = searchKeyword.value
    }

    console.log('📋 加载文档列表，参数:', params)
    const response = await getInstances(params)
    console.log('📋 文档列表响应:', response)
    
    if (response.success) {
      console.log('📋 响应数据:', response.data)
      console.log('📋 文档项数量:', response.data?.items?.length || 0)
      console.log('📋 总数:', response.data?.total || 0)
      
      instances.value = response.data.items || []
      pagination.value.total = response.data.total || 0
      
      console.log('📋 设置后的实例数量:', instances.value.length)
      console.log('📋 设置后的总数:', pagination.value.total)
    } else {
      console.error('加载文档列表失败:', response.message || response.error)
      ElMessage.error(response.message || '加载文档列表失败')
    }
  } catch (error: any) {
    console.error('加载文档列表失败:', error)
    const errorMessage = error?.response?.data?.error?.details || error?.message || '加载文档列表失败'
    ElMessage.error(errorMessage)
  } finally {
    listLoading.value = false
  }
}

// 点击文档项，跳转到协作页面
const handleSelectDocument = (instance: DocumentInstance) => {
  router.push({
    path: '/centers/document-collaboration',
    query: { id: instance.id }
  })
}

// 搜索
const handleSearch = () => {
  pagination.value.page = 1
  loadInstances()
}

// 分页变化
const handlePageChange = (page: number) => {
  pagination.value.page = page
  loadInstances()
}

const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
  pagination.value.page = 1
  loadInstances()
}

// 加载文档
const loadDocument = async () => {
  const id = getDocumentId()
  if (!id) {
    ElMessage.warning('缺少文档ID参数')
    return
  }

  loading.value = true
  try {
    const response = await getInstanceById(id)
    if (response.success && response.data) {
      document.value = response.data as any
    } else {
      ElMessage.error(response.message || '加载文档失败')
    }
  } catch (error: any) {
    console.error('加载文档失败:', error)
    ElMessage.error(error?.message || '加载文档失败')
  } finally {
    loading.value = false
  }
}

// 加载用户列表
const loadUsers = async () => {
  usersLoading.value = true
  try {
    const response = await getUserList({ pageSize: 1000 })
    if (response.success && response.data) {
      users.value = response.data.items || response.data.list || []
    }
  } catch (error) {
    console.error('加载用户列表失败:', error)
    // 使用默认用户列表作为fallback
    users.value = []
  } finally {
    usersLoading.value = false
  }
}

// 加载评论
const loadComments = async () => {
  const id = getDocumentId()
  if (!id) return

  try {
    const response = await getComments(id)
    if (response.success && response.data) {
      comments.value = response.data.comments || []
    }
  } catch (error) {
    console.error('加载评论失败:', error)
  }
}

// 加载版本历史
const loadVersionHistory = async () => {
  const id = getDocumentId()
  if (!id) return

  try {
    const response = await getVersionHistory(id)
    if (response.success && response.data) {
      versions.value = response.data.versions || []
    }
  } catch (error) {
    console.error('加载版本历史失败:', error)
  }
}

// 分配文档
const handleAssign = async () => {
  if (!assignForm.value.assignedTo) {
    ElMessage.warning('请选择分配对象')
    return
  }

  const id = getDocumentId()
  if (!id) return

  assigning.value = true
  try {
    const response = await assignDocument(id, {
      assignedTo: assignForm.value.assignedTo!,
      deadline: assignForm.value.deadline || undefined,
      message: assignForm.value.message || undefined
    })
    
    if (response.success) {
      ElMessage.success('分配成功')
      assignForm.value = {
        assignedTo: null,
        deadline: null,
        message: ''
      }
      await loadDocument()
    } else {
      ElMessage.error(response.message || '分配失败')
    }
  } catch (error: any) {
    console.error('分配失败:', error)
    ElMessage.error(error?.message || '分配失败')
  } finally {
    assigning.value = false
  }
}

// 提交审核
const handleSubmit = async () => {
  if (submitForm.value.reviewers.length === 0) {
    ElMessage.warning('请选择审核人')
    return
  }

  const id = getDocumentId()
  if (!id) return

  submitting.value = true
  try {
    const response = await submitForReview(id, {
      reviewers: submitForm.value.reviewers,
      message: submitForm.value.message || undefined
    })
    
    if (response.success) {
      ElMessage.success('提交审核成功')
      submitForm.value = {
        reviewers: [],
        message: ''
      }
      await loadDocument()
    } else {
      ElMessage.error(response.message || '提交审核失败')
    }
  } catch (error: any) {
    console.error('提交审核失败:', error)
    ElMessage.error(error?.message || '提交审核失败')
  } finally {
    submitting.value = false
  }
}

// 审核文档
const handleReview = async () => {
  if (!reviewForm.value.comment.trim()) {
    ElMessage.warning('请输入审核意见')
    return
  }

  const id = getDocumentId()
  if (!id) return

  reviewing.value = true
  try {
    const response = await reviewDocument(id, {
      approved: reviewForm.value.approved,
      comment: reviewForm.value.comment
    })
    
    if (response.success) {
      ElMessage.success(reviewForm.value.approved ? '审核通过' : '审核拒绝')
      reviewForm.value = {
        approved: true,
        comment: ''
      }
      await loadDocument()
    } else {
      ElMessage.error(response.message || '审核失败')
    }
  } catch (error: any) {
    console.error('审核失败:', error)
    ElMessage.error(error?.message || '审核失败')
  } finally {
    reviewing.value = false
  }
}

// 添加评论
const handleAddComment = async () => {
  if (!newComment.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }

  const id = getDocumentId()
  if (!id) return

  commenting.value = true
  try {
    const response = await addComment(id, { content: newComment.value })
    
    if (response.success) {
      ElMessage.success('评论成功')
      newComment.value = ''
      await loadComments()
    } else {
      ElMessage.error(response.message || '评论失败')
    }
  } catch (error: any) {
    console.error('评论失败:', error)
    ElMessage.error(error?.message || '评论失败')
  } finally {
    commenting.value = false
  }
}

// 查看版本
const handleViewVersion = (version: DocumentInstance) => {
  router.push({
    path: '/centers/document-collaboration',
    query: { id: version.id }
  })
}

// 恢复版本
const handleRestoreVersion = async (version: DocumentInstance) => {
  try {
    await ElMessageBox.confirm(
      `确定要恢复版本 v${version.version} 吗？当前版本将被覆盖。`,
      '确认恢复',
      {
        type: 'warning'
      }
    )
    
    // TODO: 实现版本恢复功能
    ElMessage.info('版本恢复功能开发中...')
  } catch {
    // 用户取消
  }
}

// 创建新版本
const handleCreateVersion = async () => {
  const id = getDocumentId()
  if (!id) return

  try {
    const response = await createVersion(id)
    
    if (response.success) {
      ElMessage.success('创建新版本成功')
      await loadVersionHistory()
      await loadDocument()
    } else {
      ElMessage.error(response.message || '创建新版本失败')
    }
  } catch (error: any) {
    console.error('创建新版本失败:', error)
    ElMessage.error(error?.message || '创建新版本失败')
  }
}

// 标签页切换
const handleTabChange = (tab: string) => {
  if (tab === 'comments') {
    loadComments()
  } else if (tab === 'versions') {
    loadVersionHistory()
  }
}

// 监听路由变化
watch(() => route.query.id, () => {
  if (hasDocumentId.value) {
    loadDocument()
    loadComments()
    loadVersionHistory()
  } else {
    loadInstances()
  }
})

onMounted(() => {
  if (hasDocumentId.value) {
    loadUsers()
    loadDocument()
    loadComments()
    loadVersionHistory()
  } else {
    loadInstances()
  }
})
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.document-collaboration {
  width: 100%;
  min-height: 100%;
  padding: var(--spacing-md);
  overflow: visible;
  
  // 确保内容可以完整显示
  display: flex;
  flex-direction: column;

  // 文档列表容器
  .document-list-container {
    width: 100%;

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h2 {
        margin: 0;
        font-size: var(--text-xl);
        font-weight: var(--font-bold, 600);
        color: var(--text-primary);
      }

      .list-actions {
        display: flex;
        align-items: center;
      }
    }

    .document-list-table {
      cursor: pointer;

      :deep(.el-table__row) {
        &:hover {
          background-color: var(--bg-hover);
        }
      }
    }

    .pagination-container {
      margin-top: var(--spacing-lg);
      display: flex;
      justify-content: flex-end;
    }
  }

  .detail-card {
    width: 100%;
    min-height: auto;
    margin-bottom: var(--spacing-lg);
    flex-shrink: 0;

    :deep(.el-card__body) {
      padding: var(--spacing-lg);
      overflow: visible;
    }
  }

  .document-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--spacing-lg);
    width: 100%;

    .header-left {
      flex: 1;
      min-width: 0;

      .document-title {
        margin: 0 0 var(--spacing-md) 0;
        font-size: var(--text-2xl);
        font-weight: var(--font-bold, 600);
        color: var(--text-primary);
        word-wrap: break-word;
        word-break: break-all;
      }

      .document-meta {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-md);
        align-items: center;

        .meta-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: var(--text-sm);
          color: var(--text-secondary);
          white-space: nowrap;
        }
      }
    }

    .header-right {
      flex-shrink: 0;
    }
  }

  // 内容区域
  .content-container {
    min-height: 200px;
    padding: var(--spacing-lg);
    background: var(--bg-tertiary);
    border-radius: var(--radius-md);

    .markdown-preview {
      color: var(--text-primary);
      line-height: 1.8;

      :deep(h1), :deep(h2), :deep(h3) {
        color: var(--text-primary);
        margin-top: var(--spacing-lg);
        margin-bottom: var(--spacing-md);
      }

      :deep(p) {
        margin-bottom: var(--spacing-md);
      }

      :deep(ul), :deep(ol) {
        margin-left: var(--spacing-lg);
        margin-bottom: var(--spacing-md);
      }
    }

    .empty-content {
      padding: var(--spacing-3xl);
      text-align: center;
    }
  }

  // 协作管理
  .collaboration-container {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);

    .action-card {
      :deep(.el-card__header) {
        font-weight: 600;
        color: var(--text-primary);
      }
    }
  }

  // 评论区域
  .comments-container {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);

    .comments-list {
      max-height: 500px;
      overflow-y: auto;
      padding: var(--spacing-md);
      background: var(--bg-tertiary);
      border-radius: var(--radius-md);

      .empty-comments {
        padding: var(--spacing-3xl);
        text-align: center;
      }

      .comment-item {
        padding: var(--spacing-md);
        margin-bottom: var(--spacing-md);
        background: var(--bg-card);
        border-radius: var(--radius-md);
        border: 1px solid var(--border-color);

        .comment-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-sm);

          .comment-info {
            flex: 1;

            .comment-user {
              font-weight: 600;
              color: var(--text-primary);
              margin-bottom: var(--spacing-xs);
            }

            .comment-time {
              font-size: var(--text-xs);
              color: var(--text-muted);
            }
          }
        }

        .comment-content {
          color: var(--text-primary);
          line-height: 1.6;
          white-space: pre-wrap;
        }
      }
    }

    .add-comment {
      padding: var(--spacing-md);
      background: var(--bg-card);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);
    }
  }

  // 版本历史
  .versions-container {
    padding: var(--spacing-lg);

    .version-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-md);

      h4 {
        margin: 0;
        color: var(--text-primary);
      }
    }

    .version-info {
      margin-bottom: var(--spacing-md);
      color: var(--text-secondary);
      font-size: var(--text-sm);

      p {
        margin: var(--spacing-xs) 0;
      }
    }

    .version-actions {
      display: flex;
      gap: var(--spacing-sm);
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .document-collaboration {
    padding: var(--spacing-sm);

    .document-header {
      flex-direction: column;
      align-items: stretch;

      .header-right {
        align-self: center;
        margin-top: var(--spacing-md);
      }
    }
  }
}
</style>
