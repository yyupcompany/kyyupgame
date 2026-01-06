<template>
  <UnifiedCenterLayout>
    <div class="center-container document-collaboration">
    <el-page-header @back="goBack" class="page-header">
      <template #content>
        <span class="page-title">文档协作</span>
  </UnifiedCenterLayout>
</template>
    </el-page-header>

    <el-card v-loading="loading" class="detail-card">
      <!-- 文档基本信息 -->
      <div class="document-header">
        <div class="header-left">
          <h1 class="document-title">{{ document.title }}</h1>
          <div class="document-meta">
            <el-tag :type="getStatusType(document.status)">
              {{ getStatusLabel(document.status) }}
            </el-tag>
            <span class="meta-item">
              <el-icon><User /></el-icon>
              所有者: {{ document.ownerName || '未知' }}
            </span>
            <span class="meta-item">
              <el-icon><Calendar /></el-icon>
              截止时间: {{ formatDate(document.deadline) }}
            </span>
            <span class="meta-item">
              <el-icon><Clock /></el-icon>
              更新时间: {{ formatDate(document.updatedAt) }}
            </span>
          </div>
        </div>
        <div class="header-right">
          <el-progress
            type="circle"
            :percentage="document.progress"
            :width="80"
            :color="getProgressColor(document.progress)"
          />
        </div>
      </div>

      <el-divider />

      <!-- 标签页 -->
      <el-tabs v-model="activeTab">
        <!-- 文档内容 -->
        <el-tab-pane label="文档内容" name="content">
          <div class="content-container">
            <div class="markdown-preview" v-html="renderedContent"></div>
          </div>
        </el-tab-pane>

        <!-- 协作管理 -->
        <el-tab-pane label="协作管理" name="collaboration">
          <div class="collaboration-container">
            <!-- 分配文档 -->
            <el-card class="action-card">
              <template #header>
                <span>分配文档</span>
              </template>
              <el-form :model="assignForm" label-width="100px">
                <el-form-item label="分配给">
                  <el-select v-model="assignForm.assignedTo" placeholder="请选择用户" style="width: 100%">
                    <el-option
                      v-for="user in users"
                      :key="user.id"
                      :label="user.name"
                      :value="user.id"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="截止时间">
                  <el-date-picker
                    v-model="assignForm.deadline"
                    type="datetime"
                    placeholder="请选择截止时间"
                    style="width: 100%"
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
                    <el-icon><Share /></el-icon>
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
                    style="width: 100%"
                  >
                    <el-option
                      v-for="user in users"
                      :key="user.id"
                      :label="user.name"
                      :value="user.id"
                    />
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
                    <el-icon><Check /></el-icon>
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
                    <el-icon><Check /></el-icon>
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
              <el-badge :value="comments.length" class="comment-badge" />
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
                    <el-avatar :size="40">{{ comment.userName?.charAt(0) }}</el-avatar>
                    <div class="comment-info">
                      <div class="comment-user">{{ comment.userName }}</div>
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
                style="margin-top: var(--text-sm)"
              >
                <el-icon><ChatDotRound /></el-icon>
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
              <el-badge :value="versions.length" class="version-badge" />
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
                    <p>创建人: {{ version.creatorName || '未知' }}</p>
                    <p>进度: {{ version.progress }}%</p>
                  </div>
                  <div class="version-actions">
                    <el-button size="small" @click="handleViewVersion(version)">
                      <el-icon><View /></el-icon>
                      查看
                    </el-button>
                    <el-button size="small" @click="handleRestoreVersion(version)">
                      <el-icon><RefreshLeft /></el-icon>
                      恢复
                    </el-button>
                  </div>
                </el-card>
              </el-timeline-item>
            </el-timeline>

            <el-button type="primary" @click="handleCreateVersion" style="margin-top: var(--text-2xl)">
              <el-icon><Plus /></el-icon>
              创建新版本
            </el-button>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'

import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  User, Calendar, Clock, Share, Check, ChatDotRound,
  View, RefreshLeft, Plus
} from '@element-plus/icons-vue';
import { marked } from 'marked';
import {
  getInstanceById,
  assignDocument,
  submitForReview,
  reviewDocument,
  getComments,
  addComment,
  getVersionHistory,
  createVersion
} from '@/api/endpoints/document-instances';

const router = useRouter();
const route = useRoute();

// 数据
const loading = ref(false);
const activeTab = ref('content');

const document = ref<any>({
  id: 0,
  title: '',
  content: '',
  status: 'draft',
  progress: 0,
  deadline: null,
  updatedAt: null
});

const users = ref<any[]>([
  { id: 1, name: '张老师' },
  { id: 2, name: '李老师' },
  { id: 3, name: '王园长' }
]);

const comments = ref<any[]>([]);
const versions = ref<any[]>([]);

const assignForm = ref({
  assignedTo: null,
  deadline: null,
  message: ''
});

const submitForm = ref({
  reviewers: [],
  message: ''
});

const reviewForm = ref({
  approved: true,
  comment: ''
});

const newComment = ref('');

const assigning = ref(false);
const submitting = ref(false);
const reviewing = ref(false);
const commenting = ref(false);

// 计算属性
const renderedContent = computed(() => {
  if (!document.value.content) return '';
  return marked(document.value.content);
});

const canSubmit = computed(() => {
  return document.value.progress === 100 && 
         (document.value.status === 'draft' || document.value.status === 'filling');
});

const canReview = computed(() => {
  return document.value.status === 'review';
  // TODO: 检查当前用户是否为审核人
});

// 方法
const goBack = () => {
  router.back();
};

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    draft: 'info',
    filling: 'warning',
    review: 'primary',
    approved: 'success',
    rejected: 'danger',
    completed: 'success'
  };
  return map[status] || 'info';
};

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    draft: '草稿',
    filling: '填写中',
    review: '审核中',
    approved: '已通过',
    rejected: '已拒绝',
    completed: '已完成'
  };
  return map[status] || status;
};

const getProgressColor = (progress: number) => {
  if (progress >= 90) return 'var(--success-color)';
  if (progress >= 70) return 'var(--warning-color)';
  if (progress >= 50) return 'var(--danger-color)';
  return 'var(--info-color)';
};

const formatDate = (date: string | Date | null) => {
  if (!date) return '-';
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const handleAssign = async () => {
  if (!assignForm.value.assignedTo) {
    ElMessage.warning('请选择分配对象');
    return;
  }

  assigning.value = true;
  try {
    const response = await assignDocument(document.value.id, assignForm.value);
    if (response.success) {
      ElMessage.success('分配成功');
      loadDocument();
    }
  } catch (error) {
    ElMessage.error('分配失败');
  } finally {
    assigning.value = false;
  }
};

const handleSubmit = async () => {
  if (submitForm.value.reviewers.length === 0) {
    ElMessage.warning('请选择审核人');
    return;
  }

  submitting.value = true;
  try {
    const response = await submitForReview(document.value.id, submitForm.value);
    if (response.success) {
      ElMessage.success('提交审核成功');
      loadDocument();
    }
  } catch (error) {
    ElMessage.error('提交审核失败');
  } finally {
    submitting.value = false;
  }
};

const handleReview = async () => {
  if (!reviewForm.value.comment) {
    ElMessage.warning('请输入审核意见');
    return;
  }

  reviewing.value = true;
  try {
    const response = await reviewDocument(document.value.id, reviewForm.value);
    if (response.success) {
      ElMessage.success(reviewForm.value.approved ? '审核通过' : '审核拒绝');
      loadDocument();
    }
  } catch (error) {
    ElMessage.error('审核失败');
  } finally {
    reviewing.value = false;
  }
};

const handleAddComment = async () => {
  if (!newComment.value.trim()) {
    ElMessage.warning('请输入评论内容');
    return;
  }

  commenting.value = true;
  try {
    const response = await addComment(document.value.id, { content: newComment.value });
    if (response.success) {
      ElMessage.success('评论成功');
      newComment.value = '';
      loadComments();
    }
  } catch (error) {
    ElMessage.error('评论失败');
  } finally {
    commenting.value = false;
  }
};

const handleViewVersion = (version: any) => {
  router.push(`/document-instances/${version.id}`);
};

const handleRestoreVersion = async (version: any) => {
  ElMessage.info('恢复版本功能开发中...');
};

const handleCreateVersion = async () => {
  try {
    const response = await createVersion(document.value.id);
    if (response.success) {
      ElMessage.success('创建新版本成功');
      loadVersionHistory();
    }
  } catch (error) {
    ElMessage.error('创建新版本失败');
  }
};

// 加载数据
const loadDocument = async () => {
  loading.value = true;
  try {
    const id = route.params.id as string;
    const response = await getInstanceById(id);
    if (response.success) {
      document.value = response.data;
    }
  } catch (error) {
    console.error('加载文档失败:', error);
    ElMessage.error('加载文档失败');
  } finally {
    loading.value = false;
  }
};

const loadComments = async () => {
  try {
    const id = route.params.id as string;
    const response = await getComments(id);
    if (response.success) {
      comments.value = response.data.comments;
    }
  } catch (error) {
    console.error('加载评论失败:', error);
  }
};

const loadVersionHistory = async () => {
  try {
    const id = route.params.id as string;
    const response = await getVersionHistory(id);
    if (response.success) {
      versions.value = response.data.versions;
    }
  } catch (error) {
    console.error('加载版本历史失败:', error);
  }
};

onMounted(() => {
  loadDocument();
  loadComments();
  loadVersionHistory();
});
</script>

<style scoped lang="scss">
.document-collaboration {
  padding: var(--text-2xl);

  .page-header {
    margin-bottom: var(--text-2xl);
  }

  .detail-card {
    .document-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      .header-left {
        flex: 1;

        .document-title {
          margin: 0 0 var(--text-sm) 0;
          font-size: var(--text-3xl);
        }

        .document-meta {
          display: flex;
          align-items: center;
          gap: var(--text-lg);
          flex-wrap: wrap;

          .meta-item {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
            color: var(--text-secondary);
          }
        }
      }
    }

    .content-container {
      padding: var(--text-2xl);
      background: var(--bg-hover);
      border-radius: var(--spacing-xs);

      .markdown-preview {
        background: white;
        padding: var(--spacing-8xl);
        border-radius: var(--spacing-xs);
        min-height: 400px;
      }
    }

    .collaboration-container {
      .action-card {
        margin-bottom: var(--text-2xl);
      }
    }

    .comments-container {
      .comments-list {
        margin-bottom: var(--spacing-8xl);

        .comment-item {
          padding: var(--text-lg);
          border-bottom: var(--z-index-dropdown) solid #eee;

          .comment-header {
            display: flex;
            gap: var(--text-sm);
            margin-bottom: var(--text-sm);

            .comment-info {
              .comment-user {
                font-weight: bold;
                margin-bottom: var(--spacing-xs);
              }

              .comment-time {
                font-size: var(--text-sm);
                color: var(--text-tertiary);
              }
            }
          }

          .comment-content {
            padding-left: var(--spacing-13xl);
            line-height: 1.6;
          }
        }
      }
    }

    .versions-container {
      .version-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--text-sm);

        h4 {
          margin: 0;
        }
      }

      .version-info {
        margin-bottom: var(--text-sm);

        p {
          margin: var(--spacing-xs) 0;
          color: var(--text-secondary);
        }
      }

      .version-actions {
        display: flex;
        gap: var(--spacing-sm);
      }
    }
  }
}
</style>

