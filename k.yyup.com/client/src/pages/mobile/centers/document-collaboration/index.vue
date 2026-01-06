<template>
  <MobileMainLayout
    :title="pageTitle"
    :show-back="true"
    @back="handleBack"
  >
    <div class="mobile-document-collaboration">
      <!-- 文档列表（当没有ID时显示） -->
      <div v-if="!hasDocumentId" class="document-list-container">
        <!-- 搜索栏 -->
        <van-search
          v-model="searchKeyword"
          placeholder="搜索文档标题..."
          show-action
          @search="handleSearch"
          @clear="handleClearSearch"
        >
          <template #action>
            <van-button size="small" type="primary" @click="showFilterPopup = true">
              筛选
            </van-button>
          </template>
        </van-search>

        <!-- 文档列表 -->
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <van-list
            v-model:loading="listLoading"
            :finished="finished"
            finished-text="没有更多了"
            @load="onLoad"
          >
            <div
              v-for="instance in instances"
              :key="instance.id"
              class="document-item"
              @click="handleSelectDocument(instance)"
            >
              <div class="document-header">
                <div class="document-title">{{ instance.title || '未命名文档' }}</div>
                <van-tag :type="getStatusType(instance.status)" size="small">
                  {{ getStatusLabel(instance.status) }}
                </van-tag>
              </div>

              <div class="document-progress">
                <div class="progress-text">进度: {{ instance.progress || 0 }}%</div>
                <van-progress
                  :percentage="instance.progress || 0"
                  :color="getProgressColor(instance.progress || 0)"
                  stroke-width="4px"
                />
              </div>

              <div class="document-meta">
                <div class="meta-item">
                  <van-icon name="clock-o" size="14" />
                  {{ formatDate(instance.updatedAt) }}
                </div>
                <div class="meta-item" v-if="instance.deadline">
                  <van-icon name="calendar-o" size="14" />
                  截止: {{ formatDate(instance.deadline) }}
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <van-empty
              v-if="instances.length === 0 && !listLoading"
              description="暂无协作文档"
              image="default"
            />
          </van-list>
        </van-pull-refresh>

        <!-- 分页控制 -->
        <div class="pagination-controls" v-if="pagination.total > 0">
          <van-pagination
            v-model="pagination.page"
            :total-items="pagination.total"
            :items-per-page="pagination.pageSize"
            @change="handlePageChange"
          />
        </div>
      </div>

      <!-- 文档详情和协作（当有ID时显示） -->
      <div v-else class="document-detail-container">
        <van-pull-refresh v-model="refreshing" @refresh="onRefreshDocument">
          <!-- 文档基本信息 -->
          <van-cell-group inset class="document-header-card">
            <div class="document-header">
              <div class="document-title">{{ document.title || '未命名文档' }}</div>
              <van-circle
                :current-rate="document.progress || 0"
                :rate="document.progress || 0"
                :speed="100"
                :stroke-width="60"
                :size="60"
                layer-color="#ebedf0"
                :color="getProgressColor(document.progress || 0)"
              >
                <template #default="{ rate }">
                  <div class="progress-circle-text">{{ rate }}%</div>
                </template>
              </van-circle>
            </div>

            <van-cell
              v-for="item in documentMeta"
              :key="item.label"
              :title="item.label"
              :value="item.value"
            >
              <template #icon>
                <van-icon :name="item.icon" size="16" />
              </template>
              <template #right-icon v-if="item.tag">
                <van-tag :type="item.tagType" size="small">{{ item.tag }}</van-tag>
              </template>
            </van-cell>
          </van-cell-group>

          <!-- 标签页 -->
          <van-tabs v-model:active="activeTab" @change="handleTabChange" sticky>
            <!-- 文档内容 -->
            <van-tab title="文档内容" name="content">
              <div class="content-container">
                <div v-if="document.content" class="markdown-preview" v-html="renderedContent"></div>
                <van-empty v-else description="文档内容为空" image="default" />
              </div>
            </van-tab>

            <!-- 协作管理 -->
            <van-tab title="协作管理" name="collaboration">
              <div class="collaboration-container">
                <!-- 分配文档 -->
                <van-cell-group inset v-if="canAssign" class="action-card">
                  <div class="card-title">分配文档</div>
                  <van-form @submit="handleAssign">
                    <van-field
                      v-model="assignForm.assignedToName"
                      name="assignedTo"
                      label="分配给"
                      placeholder="请选择用户"
                      readonly
                      clickable
                      @click="showUserSelector = true"
                      :rules="[{ required: true, message: '请选择分配对象' }]"
                    />
                    <van-field
                      v-model="assignForm.deadline"
                      name="deadline"
                      label="截止时间"
                      placeholder="请选择截止时间"
                      readonly
                      clickable
                      @click="showDeadlinePicker = true"
                    />
                    <van-field
                      v-model="assignForm.message"
                      name="message"
                      label="备注"
                      type="textarea"
                      placeholder="请输入备注信息"
                      rows="3"
                    />
                    <div class="form-actions">
                      <van-button
                        type="primary"
                        native-type="submit"
                        :loading="assigning"
                        block
                      >
                        分配
                      </van-button>
                    </div>
                  </van-form>
                </van-cell-group>

                <!-- 提交审核 -->
                <van-cell-group inset v-if="canSubmit" class="action-card">
                  <div class="card-title">提交审核</div>
                  <van-form @submit="handleSubmit">
                    <van-field
                      v-model="submitForm.reviewersName"
                      name="reviewers"
                      label="审核人"
                      placeholder="请选择审核人"
                      readonly
                      clickable
                      @click="showReviewerSelector = true"
                      :rules="[{ required: true, message: '请选择审核人' }]"
                    />
                    <van-field
                      v-model="submitForm.message"
                      name="message"
                      label="说明"
                      type="textarea"
                      placeholder="请输入提交说明"
                      rows="3"
                    />
                    <div class="form-actions">
                      <van-button
                        type="success"
                        native-type="submit"
                        :loading="submitting"
                        block
                      >
                        提交审核
                      </van-button>
                    </div>
                  </van-form>
                </van-cell-group>

                <!-- 审核文档 -->
                <van-cell-group inset v-if="canReview" class="action-card">
                  <div class="card-title">审核文档</div>
                  <van-form @submit="handleReview">
                    <van-field name="approved" label="审核结果">
                      <template #input>
                        <van-radio-group v-model="reviewForm.approved" direction="horizontal">
                          <van-radio name="true">通过</van-radio>
                          <van-radio name="false">拒绝</van-radio>
                        </van-radio-group>
                      </template>
                    </van-field>
                    <van-field
                      v-model="reviewForm.comment"
                      name="comment"
                      label="审核意见"
                      type="textarea"
                      placeholder="请输入审核意见"
                      rows="4"
                      :rules="[{ required: true, message: '请输入审核意见' }]"
                    />
                    <div class="form-actions">
                      <van-button
                        :type="reviewForm.approved === 'true' ? 'success' : 'danger'"
                        native-type="submit"
                        :loading="reviewing"
                        block
                      >
                        提交审核结果
                      </van-button>
                    </div>
                  </van-form>
                </van-cell-group>
              </div>
            </van-tab>

            <!-- 评论讨论 -->
            <van-tab name="comments">
              <template #title>
                评论讨论 <van-badge :content="comments.length" v-if="comments.length > 0" />
              </template>
              <div class="comments-container">
                <!-- 评论列表 -->
                <div class="comments-list">
                  <div v-if="comments.length === 0" class="empty-comments">
                    <van-empty description="暂无评论" image="default" />
                  </div>
                  <div v-else>
                    <div
                      v-for="comment in comments"
                      :key="comment.id"
                      class="comment-item"
                    >
                      <div class="comment-header">
                        <div class="comment-avatar">{{ comment.userName?.charAt(0) || 'U' }}</div>
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
                  <van-field
                    v-model="newComment"
                    type="textarea"
                    placeholder="输入您的评论..."
                    rows="3"
                    maxlength="500"
                    show-word-limit
                  />
                  <van-button
                    type="primary"
                    @click="handleAddComment"
                    :loading="commenting"
                    block
                  >
                    发表评论
                  </van-button>
                </div>
              </div>
            </van-tab>

            <!-- 版本历史 -->
            <van-tab name="versions">
              <template #title>
                版本历史 <van-badge :content="versions.length" v-if="versions.length > 0" />
              </template>
              <div class="versions-container">
                <van-steps direction="vertical" :active="versions.length - 1">
                  <van-step v-for="version in versions" :key="version.id">
                    <div class="version-header">
                      <div class="version-title">版本 {{ version.version }}</div>
                      <van-tag :type="getStatusType(version.status)" size="small">
                        {{ getStatusLabel(version.status) }}
                      </van-tag>
                    </div>
                    <div class="version-info">
                      <div class="version-item">
                        <van-icon name="user-o" size="14" />
                        创建人: {{ version.createdBy || '未知' }}
                      </div>
                      <div class="version-item">
                        <van-icon name="chart-trending-o" size="14" />
                        进度: {{ version.progress || 0 }}%
                      </div>
                      <div class="version-item" v-if="version.title">
                        <van-icon name="description" size="14" />
                        标题: {{ version.title }}
                      </div>
                      <div class="version-item">
                        <van-icon name="clock-o" size="14" />
                        {{ formatDate(version.createdAt) }}
                      </div>
                    </div>
                    <div class="version-actions">
                      <van-button size="small" @click="handleViewVersion(version)">
                        <van-icon name="eye-o" size="14" />
                        查看
                      </van-button>
                      <van-button size="small" @click="handleRestoreVersion(version)">
                        <van-icon name="replay" size="14" />
                        恢复
                      </van-button>
                    </div>
                  </van-step>
                </van-steps>

                <van-button
                  type="primary"
                  @click="handleCreateVersion"
                  block
                  class="create-version-btn"
                >
                  <van-icon name="plus" size="14" />
                  创建新版本
                </van-button>
              </div>
            </van-tab>
          </van-tabs>
        </van-pull-refresh>
      </div>

      <!-- 用户选择弹窗 -->
      <van-popup v-model:show="showUserSelector" position="bottom" round>
        <van-picker
          :columns="userColumns"
          @confirm="onUserConfirm"
          @cancel="showUserSelector = false"
        />
      </van-popup>

      <!-- 审核人选择弹窗 -->
      <van-popup v-model:show="showReviewerSelector" position="bottom" round>
        <van-picker
          :columns="userColumns"
          multiple
          @confirm="onReviewerConfirm"
          @cancel="showReviewerSelector = false"
        />
      </van-popup>

      <!-- 截止时间选择弹窗 -->
      <van-popup v-model:show="showDeadlinePicker" position="bottom" round>
        <van-date-picker
          v-model="deadlineDate"
          type="datetime"
          title="选择截止时间"
          @confirm="onDeadlineConfirm"
          @cancel="showDeadlinePicker = false"
        />
      </van-popup>

      <!-- 筛选弹窗 -->
      <van-popup v-model:show="showFilterPopup" position="bottom" round>
        <van-form @submit="handleFilter">
          <div class="filter-header">
            <div class="filter-title">筛选条件</div>
          </div>
          <van-field name="status" label="状态">
            <template #input>
              <van-radio-group v-model="filterStatus" direction="horizontal">
                <van-radio name="">全部</van-radio>
                <van-radio name="draft">草稿</van-radio>
                <van-radio name="filling">填写中</van-radio>
                <van-radio name="review">审核中</van-radio>
                <van-radio name="approved">已通过</van-radio>
                <van-radio name="rejected">已拒绝</van-radio>
                <van-radio name="completed">已完成</van-radio>
              </van-radio-group>
            </template>
          </van-field>
          <div class="filter-actions">
            <van-button type="primary" native-type="submit" block>应用筛选</van-button>
          </div>
        </van-form>
      </van-popup>
    </div>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  showToast,
  showConfirmDialog,
  showFailToast,
  showSuccessToast
} from 'vant'
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
  updateInstance,
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
const refreshing = ref(false)
const finished = ref(false)
const activeTab = ref('content')

// 文档列表相关
const instances = ref<DocumentInstance[]>([])
const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0
})
const searchKeyword = ref('')
const filterStatus = ref('')
const showFilterPopup = ref(false)

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

// 表单数据
const assignForm = ref({
  assignedTo: null as number | null,
  assignedToName: '',
  deadline: null as string | null,
  message: ''
})

const submitForm = ref({
  reviewers: [] as number[],
  reviewersName: '',
  message: ''
})

const reviewForm = ref({
  approved: 'true',
  comment: ''
})

const newComment = ref('')

// 加载状态
const assigning = ref(false)
const submitting = ref(false)
const reviewing = ref(false)
const commenting = ref(false)

// 弹窗状态
const showUserSelector = ref(false)
const showReviewerSelector = ref(false)
const showDeadlinePicker = ref(false)
const deadlineDate = ref(new Date())

// 计算属性
const hasDocumentId = computed(() => {
  return !!getDocumentId()
})

const pageTitle = computed(() => {
  return hasDocumentId.value ? '文档协作' : '协作文档'
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

const documentMeta = computed(() => [
  {
    label: '状态',
    value: getStatusLabel(document.value.status),
    icon: 'label-o',
    tag: getStatusLabel(document.value.status),
    tagType: getStatusType(document.value.status)
  },
  {
    label: '所有者',
    value: document.value.ownerName || '未知',
    icon: 'user-o'
  },
  {
    label: '分配给',
    value: document.value.assignedToName || '未分配',
    icon: 'friends-o'
  },
  {
    label: '截止时间',
    value: formatDate(document.value.deadline),
    icon: 'calendar-o'
  },
  {
    label: '更新时间',
    value: formatDate(document.value.updatedAt),
    icon: 'clock-o'
  },
  {
    label: '版本',
    value: `v${document.value.version}`,
    icon: 'description'
  }
])

const userColumns = computed(() => {
  return users.value.map(user => ({
    text: user.realName || user.username,
    value: user.id
  }))
})

const canAssign = computed(() => {
  const currentUserId = userStore.userInfo?.id
  return document.value.ownerId === currentUserId ||
         userStore.userInfo?.role === 'admin' ||
         userStore.userInfo?.role === 'ADMIN'
})

const canSubmit = computed(() => {
  return (document.value.progress || 0) === 100 &&
         (document.value.status === 'draft' || document.value.status === 'filling')
})

const canReview = computed(() => {
  return document.value.status === 'review'
})

// 工具方法
const goBack = () => {
  if (hasDocumentId.value) {
    router.push({
      path: '/mobile/centers/document-collaboration'
    })
  } else {
    router.back()
  }
}

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    draft: 'default',
    filling: 'warning',
    review: 'primary',
    approved: 'success',
    rejected: 'danger',
    completed: 'success'
  }
  return map[status] || 'default'
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
  if (progress >= 90) return '#07c160'
  if (progress >= 70) return '#ff976a'
  if (progress >= 50) return '#ee0a24'
  return '#1989fa'
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

const getDocumentId = (): string | null => {
  const id = route.query.id || route.params.id
  if (id) {
    return String(id)
  }
  return null
}

// 文档列表相关方法
const onRefresh = () => {
  finished.value = false
  pagination.value.page = 1
  loadInstances()
}

const onLoad = () => {
  if (pagination.value.page === 1) {
    loadInstances()
  } else {
    loadInstances()
  }
}

const loadInstances = async () => {
  if (refreshing.value) {
    pagination.value.page = 1
    instances.value = []
  }

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

    console.log('📋 加载移动端文档列表，参数:', params)
    const response = await getInstances(params)

    if (response.success && response.data) {
      const newItems = response.data.items || []

      if (refreshing.value) {
        instances.value = newItems
      } else {
        instances.value.push(...newItems)
      }

      pagination.value.total = response.data.total || 0

      finished.value = instances.value.length >= pagination.value.total
    } else {
      showFailToast(response.message || '加载文档列表失败')
    }
  } catch (error: any) {
    console.error('加载文档列表失败:', error)
    const errorMessage = error?.response?.data?.error?.details || error?.message || '加载文档列表失败'
    showFailToast(errorMessage)
  } finally {
    listLoading.value = false
    refreshing.value = false
  }
}

const handleSearch = (value: string) => {
  searchKeyword.value = value
  onRefresh()
}

const handleClearSearch = () => {
  searchKeyword.value = ''
  onRefresh()
}

const handleSelectDocument = (instance: DocumentInstance) => {
  router.push({
    path: '/mobile/centers/document-collaboration',
    query: { id: instance.id }
  })
}

const handlePageChange = (page: number) => {
  pagination.value.page = page
  loadInstances()
}

const handleFilter = () => {
  showFilterPopup.value = false
  onRefresh()
}

// 文档详情相关方法
const onRefreshDocument = () => {
  loadDocument()
}

const loadDocument = async () => {
  const id = getDocumentId()
  if (!id) {
    showToast('缺少文档ID参数')
    return
  }

  loading.value = true
  try {
    const response = await getInstanceById(id)
    if (response.success && response.data) {
      document.value = response.data as any
    } else {
      showFailToast(response.message || '加载文档失败')
    }
  } catch (error: any) {
    console.error('加载文档失败:', error)
    showFailToast(error?.message || '加载文档失败')
  } finally {
    loading.value = false
  }
}

const loadUsers = async () => {
  try {
    const response = await getUserList({ pageSize: 1000 })
    if (response.success && response.data) {
      users.value = response.data.items || response.data.list || []
    }
  } catch (error) {
    console.error('加载用户列表失败:', error)
    users.value = []
  }
}

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

// 协作操作方法
const handleAssign = async () => {
  if (!assignForm.value.assignedTo) {
    showToast('请选择分配对象')
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
      showSuccessToast('分配成功')
      assignForm.value = {
        assignedTo: null,
        assignedToName: '',
        deadline: null,
        message: ''
      }
      await loadDocument()
    } else {
      showFailToast(response.message || '分配失败')
    }
  } catch (error: any) {
    console.error('分配失败:', error)
    showFailToast(error?.message || '分配失败')
  } finally {
    assigning.value = false
  }
}

const handleSubmit = async () => {
  if (submitForm.value.reviewers.length === 0) {
    showToast('请选择审核人')
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
      showSuccessToast('提交审核成功')
      submitForm.value = {
        reviewers: [],
        reviewersName: '',
        message: ''
      }
      await loadDocument()
    } else {
      showFailToast(response.message || '提交审核失败')
    }
  } catch (error: any) {
    console.error('提交审核失败:', error)
    showFailToast(error?.message || '提交审核失败')
  } finally {
    submitting.value = false
  }
}

const handleReview = async () => {
  if (!reviewForm.value.comment.trim()) {
    showToast('请输入审核意见')
    return
  }

  const id = getDocumentId()
  if (!id) return

  reviewing.value = true
  try {
    const response = await reviewDocument(id, {
      approved: reviewForm.value.approved === 'true',
      comment: reviewForm.value.comment
    })

    if (response.success) {
      showSuccessToast(reviewForm.value.approved === 'true' ? '审核通过' : '审核拒绝')
      reviewForm.value = {
        approved: 'true',
        comment: ''
      }
      await loadDocument()
    } else {
      showFailToast(response.message || '审核失败')
    }
  } catch (error: any) {
    console.error('审核失败:', error)
    showFailToast(error?.message || '审核失败')
  } finally {
    reviewing.value = false
  }
}

const handleAddComment = async () => {
  if (!newComment.value.trim()) {
    showToast('请输入评论内容')
    return
  }

  const id = getDocumentId()
  if (!id) return

  commenting.value = true
  try {
    const response = await addComment(id, { content: newComment.value })

    if (response.success) {
      showSuccessToast('评论成功')
      newComment.value = ''
      await loadComments()
    } else {
      showFailToast(response.message || '评论失败')
    }
  } catch (error: any) {
    console.error('评论失败:', error)
    showFailToast(error?.message || '评论失败')
  } finally {
    commenting.value = false
  }
}

const handleViewVersion = (version: DocumentInstance) => {
  router.push({
    path: '/mobile/centers/document-collaboration',
    query: { id: version.id }
  })
}

const handleRestoreVersion = async (version: DocumentInstance) => {
  const id = getDocumentId()
  if (!id) return

  try {
    await showConfirmDialog({
      title: '确认恢复',
      message: `确定要恢复版本 v${version.version} 吗？当前版本将被覆盖。`,
    })

    // 显示加载提示
    showLoadingToast({
      message: '正在恢复版本...',
      forbidClick: true,
      duration: 0
    })

    // 使用updateInstance来恢复版本内容
    const response = await updateInstance(id, {
      title: version.title,
      content: version.content,
      filledVariables: version.filledVariables
    })

    closeToast()

    if (response.success) {
      showSuccessToast('版本恢复成功')
      // 重新加载文档和版本历史
      await loadDocument()
      await loadVersionHistory()
    } else {
      showFailToast(response.message || '版本恢复失败')
    }
  } catch (error: any) {
    closeToast()
    if (error !== 'cancel') {
      console.error('恢复版本失败:', error)
      showFailToast(error?.message || '版本恢复失败')
    }
  }
}

const handleCreateVersion = async () => {
  const id = getDocumentId()
  if (!id) return

  try {
    const response = await createVersion(id)

    if (response.success) {
      showSuccessToast('创建新版本成功')
      await loadVersionHistory()
      await loadDocument()
    } else {
      showFailToast(response.message || '创建新版本失败')
    }
  } catch (error: any) {
    console.error('创建新版本失败:', error)
    showFailToast(error?.message || '创建新版本失败')
  }
}

// 事件处理
const handleTabChange = (name: string) => {
  if (name === 'comments') {
    loadComments()
  } else if (name === 'versions') {
    loadVersionHistory()
  }
}

const onUserConfirm = ({ selectedOptions }: any) => {
  const option = selectedOptions[0]
  assignForm.value.assignedTo = option.value
  assignForm.value.assignedToName = option.text
  showUserSelector.value = false
}

const onReviewerConfirm = ({ selectedOptions }: any) => {
  submitForm.value.reviewers = selectedOptions.map((option: any) => option.value)
  submitForm.value.reviewersName = selectedOptions.map((option: any) => option.text).join(', ')
  showReviewerSelector.value = false
}

const onDeadlineConfirm = (value: Date) => {
  assignForm.value.deadline = value.toISOString().slice(0, 19).replace('T', ' ')
  showDeadlinePicker.value = false
}

// 监听路由变化
watch(() => route.query.id, () => {
  if (hasDocumentId.value) {
    loadDocument()
    loadComments()
    loadVersionHistory()
  } else {
    instances.value = []
    pagination.value.page = 1
    loadInstances()
  }
})

// 生命周期
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
@import '@/styles/mobile-base.scss';
.mobile-document-collaboration {
  min-height: 100vh;
  background: var(--van-background-color-light);
  padding-bottom: var(--van-padding-md);

  // 文档列表容器
  .document-list-container {
    .document-item {
      margin: var(--van-padding-sm) var(--van-padding-md);
      background: white;
      border-radius: var(--van-radius-md);
      padding: var(--van-padding-md);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .document-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--van-padding-sm);

        .document-title {
          flex: 1;
          font-size: var(--van-font-size-lg);
          font-weight: var(--van-font-bold);
          color: var(--van-text-color);
          margin-right: var(--van-padding-sm);
          line-height: 1.4;
        }
      }

      .document-progress {
        margin-bottom: var(--van-padding-sm);

        .progress-text {
          font-size: var(--van-font-size-sm);
          color: var(--van-text-color-2);
          margin-bottom: var(--van-padding-xs);
        }
      }

      .document-meta {
        display: flex;
        flex-wrap: wrap;
        gap: var(--van-padding-md);
        font-size: var(--van-font-size-xs);
        color: var(--van-text-color-2);

        .meta-item {
          display: flex;
          align-items: center;
          gap: var(--van-padding-xs);
        }
      }

      &:active {
        background: var(--van-background-color-light);
      }
    }

    .pagination-controls {
      padding: var(--van-padding-md);
      text-align: center;
    }
  }

  // 文档详情容器
  .document-detail-container {
    .document-header-card {
      margin-bottom: var(--van-padding-md);

      .document-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--van-padding-md);

        .document-title {
          flex: 1;
          font-size: var(--van-font-size-xl);
          font-weight: var(--van-font-bold);
          color: var(--van-text-color);
          margin-right: var(--van-padding-md);
          line-height: 1.4;
        }

        .progress-circle-text {
          font-size: var(--van-font-size-xs);
          font-weight: var(--van-font-bold);
          color: var(--van-text-color);
        }
      }
    }

    // 内容区域
    .content-container {
      padding: var(--van-padding-md);
      min-height: 200px;
      background: white;
      margin: var(--van-padding-md);
      border-radius: var(--van-radius-md);

      .markdown-preview {
        color: var(--van-text-color);
        line-height: 1.8;

        :deep(h1), :deep(h2), :deep(h3) {
          color: var(--van-text-color);
          margin: var(--van-padding-lg) 0 var(--van-padding-md) 0;
        }

        :deep(p) {
          margin-bottom: var(--van-padding-md);
        }

        :deep(ul), :deep(ol) {
          margin-left: var(--van-padding-lg);
          margin-bottom: var(--van-padding-md);
        }
      }
    }

    // 协作管理
    .collaboration-container {
      .action-card {
        margin-bottom: var(--van-padding-md);

        .card-title {
          padding: var(--van-padding-md);
          font-size: var(--van-font-size-lg);
          font-weight: var(--van-font-bold);
          color: var(--van-text-color);
          border-bottom: 1px solid var(--van-border-color);
        }

        .form-actions {
          padding: var(--van-padding-md);
          padding-top: 0;
        }
      }
    }

    // 评论区域
    .comments-container {
      .comments-list {
        max-height: 400px;
        overflow-y: auto;
        background: white;
        margin: var(--van-padding-md);
        border-radius: var(--van-radius-md);

        .empty-comments {
          padding: var(--van-padding-xl);
          text-align: center;
        }

        .comment-item {
          padding: var(--van-padding-md);
          border-bottom: 1px solid var(--van-border-color);

          &:last-child {
            border-bottom: none;
          }

          .comment-header {
            display: flex;
            align-items: center;
            gap: var(--van-padding-md);
            margin-bottom: var(--van-padding-sm);

            .comment-avatar {
              width: 40px;
              height: 40px;
              border-radius: 50%;
              background: var(--van-primary-color);
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: var(--van-font-size-lg);
              font-weight: var(--van-font-bold);
              flex-shrink: 0;
            }

            .comment-info {
              flex: 1;

              .comment-user {
                font-weight: var(--van-font-bold);
                color: var(--van-text-color);
                margin-bottom: var(--van-padding-xs);
              }

              .comment-time {
                font-size: var(--van-font-size-xs);
                color: var(--van-text-color-3);
              }
            }
          }

          .comment-content {
            color: var(--van-text-color);
            line-height: 1.6;
            white-space: pre-wrap;
            margin-left: 56px;
          }
        }
      }

      .add-comment {
        margin: var(--van-padding-md);
        background: white;
        border-radius: var(--van-radius-md);
        padding: var(--van-padding-md);
      }
    }

    // 版本历史
    .versions-container {
      padding: var(--van-padding-md);

      .version-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--van-padding-sm);

        .version-title {
          font-weight: var(--van-font-bold);
          color: var(--van-text-color);
        }
      }

      .version-info {
        margin-bottom: var(--van-padding-md);

        .version-item {
          display: flex;
          align-items: center;
          gap: var(--van-padding-xs);
          font-size: var(--van-font-size-sm);
          color: var(--van-text-color-2);
          margin-bottom: var(--van-padding-xs);
        }
      }

      .version-actions {
        display: flex;
        gap: var(--van-padding-sm);
      }

      .create-version-btn {
        margin-top: var(--van-padding-lg);
      }
    }
  }

  // 弹窗样式
  .filter-header {
    padding: var(--van-padding-md);
    border-bottom: 1px solid var(--van-border-color);

    .filter-title {
      font-size: var(--van-font-size-lg);
      font-weight: var(--van-font-bold);
      color: var(--van-text-color);
      text-align: center;
    }
  }

  .filter-actions {
    padding: var(--van-padding-md);
    padding-top: 0;
  }
}

// 响应式适配
@media (min-width: 768px) {
  .mobile-document-collaboration {
    max-width: 768px;
    margin: 0 auto;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  }
}
</style>