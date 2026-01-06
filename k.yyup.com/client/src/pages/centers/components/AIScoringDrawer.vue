<template>
  <el-drawer
    v-model="visible"
    title="🤖 全园AI预评分分析"
    direction="rtl"
    size="650px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="!isAnalyzing"
    @opened="handleOpened"
    class="ai-scoring-drawer"
  >
    <!-- 时间限制提示 -->
    <el-alert
      v-if="!canStart"
      type="warning"
      :closable="false"
      class="time-limit-alert"
    >
      <template #title>
        <div class="alert-title">
          <UnifiedIcon name="default" />
          <span>距离下次可评分还有 {{ remainingDays }} 天</span>
        </div>
      </template>
      <div class="alert-content">
        上次评分时间：{{ formatDateTime(lastScoringTime) }}<br>
        下次可评分时间：{{ formatDateTime(nextAvailableTime) }}
      </div>
    </el-alert>

    <!-- 重要提示 -->
    <el-alert
      v-if="!isAnalyzing && canStart"
      type="info"
      :closable="false"
      class="important-alert"
    >
      <template #title>
        <strong>📢 重要提示</strong>
      </template>
      <div class="important-alert-content">
        1. 本次分析预计需要 <strong class="time-warning">10分钟</strong><br>
        2. 分析过程中<strong class="refresh-warning">请勿刷新网页</strong><br>
        3. 分析期间<strong>请勿关闭此抽屉</strong><br>
        4. 系统将自动保存分析结果
      </div>
    </el-alert>

    <!-- 分析进行中提示 -->
    <el-alert
      v-if="isAnalyzing"
      type="warning"
      :closable="false"
      class="analyzing-alert"
    >
      <template #title>
        <div class="analyzing-alert-title">
          <UnifiedIcon name="default" />
          <strong>AI分析进行中，请勿刷新网页！</strong>
        </div>
      </template>
      <div class="analyzing-alert-content">
        预计剩余时间：{{ estimatedTimeRemaining }}
      </div>
    </el-alert>

    <!-- 总体进度 -->
    <div v-if="isAnalyzing || isCompleted" class="progress-section">
      <div class="progress-header">
        <span class="label">总体进度</span>
        <span class="stats">
          {{ progress.completed }}/{{ progress.total }} 
          (成功{{ progress.completed - progress.failed }}, 失败{{ progress.failed }})
        </span>
      </div>
      <el-progress
        :percentage="progress.progress"
        :status="getProgressStatus()"
        :stroke-width="20"
      />
      <div class="progress-stats">
        <el-tag type="success" size="small">已完成: {{ progress.completed }}</el-tag>
        <el-tag type="primary" size="small">进行中: {{ progress.running }}</el-tag>
        <el-tag type="info" size="small">等待中: {{ progress.pending }}</el-tag>
        <el-tag v-if="progress.failed > 0" type="danger" size="small">
          失败: {{ progress.failed }}
        </el-tag>
      </div>
    </div>

    <!-- 文档列表 -->
    <div class="documents-section">
      <div class="section-title">
        📄 文档分析列表 ({{ documents.length }}个)
      </div>
      
      <el-scrollbar max-height="calc(100vh - 450px)">
        <div class="document-list">
          <div
            v-for="doc in documents"
            :key="doc.id"
            class="document-item"
            :class="`status-${doc.status}`"
          >
            <!-- 状态图标 -->
            <div class="status-icon">
              <UnifiedIcon name="default" />
              <UnifiedIcon name="default" />
              <UnifiedIcon name="Check" />
              <UnifiedIcon name="Close" />
            </div>

            <!-- 文档信息 -->
            <div class="document-info">
              <div class="document-name">{{ doc.title || doc.name }}</div>
              <div class="document-meta">
                <el-tag size="small" type="info">{{ doc.templateName }}</el-tag>
                <span class="time">{{ formatDate(doc.createdAt) }}</span>
              </div>
            </div>

            <!-- 结果展示 -->
            <div v-if="doc.status === 'completed' && doc.score !== null" class="document-result">
              <div class="score-badge" :class="getScoreClass(doc.score)">
                {{ doc.score }}分
              </div>
              <el-button
                type="primary"
                link
                size="small"
                @click="viewDetail(doc)"
              >
                查看详情
              </el-button>
            </div>
            <div v-else-if="doc.status === 'running'" class="document-status">
              <span class="analyzing-text">分析中...</span>
            </div>
            <div v-else-if="doc.status === 'failed'" class="document-status">
              <el-tag type="danger" size="small">分析失败</el-tag>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </div>

    <!-- 底部操作按钮 -->
    <template #footer>
      <div class="drawer-footer">
        <div class="footer-left">
          <span v-if="isCompleted" class="completion-time">
            完成时间：{{ completionTime }}
          </span>
        </div>
        <div class="footer-right">
          <el-button
            v-if="!isAnalyzing && !isCompleted"
            @click="handleClose"
          >
            取消
          </el-button>
          <el-button
            v-if="!isAnalyzing && canStart && !isCompleted"
            type="primary"
            :loading="isStarting"
            @click="handleStart"
          >
            <UnifiedIcon name="default" />
            开始AI分析
          </el-button>
          <el-button
            v-if="isCompleted"
            type="success"
            @click="exportReport"
          >
            <UnifiedIcon name="Download" />
            导出报告
          </el-button>
          <el-button
            v-if="isCompleted"
            @click="handleClose"
          >
            关闭
          </el-button>
        </div>
      </div>
    </template>
  </el-drawer>

  <!-- 详情对话框 -->
  <ScoreDetailDialog
    v-model:visible="detailDialogVisible"
    :document="currentDocument"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Clock, Loading, CircleCheck, CircleClose, MagicStick, Download
} from '@element-plus/icons-vue';
import { ConcurrentTaskManager, type ProgressInfo } from '@/utils/concurrent-task-manager';
import { request } from '@/utils/request';
import ScoreDetailDialog from './ScoreDetailDialog.vue';

const visible = defineModel<boolean>('visible');

// 状态数据
const canStart = ref(false);
const lastScoringTime = ref<Date | null>(null);
const nextAvailableTime = ref<Date | null>(null);
const remainingDays = ref(0);

const isStarting = ref(false);
const isAnalyzing = ref(false);
const isCompleted = ref(false);
const completionTime = ref('');

const documents = ref<any[]>([]);
const progress = ref<ProgressInfo>({
  total: 0,
  completed: 0,
  failed: 0,
  running: 0,
  pending: 0,
  progress: 0
});

const detailDialogVisible = ref(false);
const currentDocument = ref<any>(null);

let taskManager: ConcurrentTaskManager<any> | null = null;

// 格式化时间
const formatDateTime = (date: Date | null) => {
  if (!date) return '--';
  return new Date(date).toLocaleString('zh-CN');
};

const formatDate = (date: string) => {
  if (!date) return '--';
  return new Date(date).toLocaleDateString('zh-CN');
};

// 预计剩余时间
const estimatedTimeRemaining = computed(() => {
  if (!progress.value.total) return '--';
  const avgTimePerDoc = 8; // 假设每个文档8秒
  const remaining = progress.value.pending + progress.value.running;
  const seconds = remaining * avgTimePerDoc;
  const minutes = Math.ceil(seconds / 60);
  return `约${minutes}分钟`;
});

// 进度状态
const getProgressStatus = () => {
  if (progress.value.failed > 0 && progress.value.progress === 100) {
    return 'warning';
  }
  if (progress.value.progress === 100) {
    return 'success';
  }
  return undefined;
};

// 评分等级样式
const getScoreClass = (score: number) => {
  if (score >= 90) return 'excellent';
  if (score >= 80) return 'good';
  if (score >= 70) return 'average';
  if (score >= 60) return 'poor';
  return 'unqualified';
};

// 检查可用性
const checkAvailability = async () => {
  try {
    const res = await request.get('/ai-scoring/check-availability');
    canStart.value = res.data.canStart;
    lastScoringTime.value = res.data.lastScoringTime 
      ? new Date(res.data.lastScoringTime) 
      : null;
    nextAvailableTime.value = res.data.nextAvailableTime 
      ? new Date(res.data.nextAvailableTime) 
      : null;
    remainingDays.value = res.data.remainingDays || 0;
  } catch (error) {
    console.error('检查评分权限失败:', error);
    ElMessage.error('检查评分权限失败');
  }
};

// 加载文档列表
const loadDocuments = async () => {
  try {
    const res = await request.get('/document-instances', {
      params: {
        pageSize: 1000
      }
    });
    
    documents.value = (res.data.list || []).map((doc: any) => ({
      ...doc,
      status: 'pending',
      score: null,
      result: null
    }));
  } catch (error) {
    console.error('加载文档列表失败:', error);
    ElMessage.error('加载文档列表失败');
  }
};

// 抽屉打开时
const handleOpened = async () => {
  await checkAvailability();
  await loadDocuments();
};

// 开始分析
const handleStart = async () => {
  try {
    await ElMessageBox.confirm(
      '本次AI分析预计需要10分钟，分析过程中请勿刷新网页或关闭抽屉。确定要开始吗？',
      '确认开始AI分析',
      {
        confirmButtonText: '开始分析',
        cancelButtonText: '取消',
        type: 'warning',
        distinguishCancelAndClose: true
      }
    );

    if (documents.value.length === 0) {
      ElMessage.warning('没有可分析的文档');
      return;
    }

    isStarting.value = true;

    // 创建任务管理器
    taskManager = new ConcurrentTaskManager({
      concurrency: 3,
      retryLimit: 2,
      retryDelay: 1000,
      onProgress: (progressInfo) => {
        progress.value = progressInfo;
      },
      onTaskComplete: (result) => {
        const doc = documents.value.find(d => d.id === result.id);
        if (doc && result.result) {
          doc.status = 'completed';
          doc.score = result.result.score;
          doc.grade = result.result.grade;
          doc.result = result.result;
        }
      },
      onTaskFail: (result) => {
        const doc = documents.value.find(d => d.id === result.id);
        if (doc) {
          doc.status = 'failed';
        }
      }
    });

    // 添加所有文档为任务
    documents.value.forEach(doc => {
      taskManager!.addTask({
        id: doc.id,
        name: doc.title || doc.name,
        execute: () => analyzeDocument(doc)
      });
    });

    isStarting.value = false;
    isAnalyzing.value = true;

    // 开始执行
    await taskManager.executeAll();

    // 完成
    isAnalyzing.value = false;
    isCompleted.value = true;
    completionTime.value = new Date().toLocaleString('zh-CN');

    // 记录本次评分时间
    try {
      await request.post('/ai-scoring/record-time');
    } catch (error) {
      console.error('记录评分时间失败:', error);
    }

    const stats = taskManager.getStats();
    ElMessage.success(
      `AI分析完成！成功 ${stats.completed - stats.failed} 个，失败 ${stats.failed} 个`
    );

  } catch (error) {
    if (error === 'cancel') {
      return;
    }
    isStarting.value = false;
    isAnalyzing.value = false;
    console.error('AI分析失败:', error);
    ElMessage.error('AI分析失败');
  }
};

// 分析单个文档
const analyzeDocument = async (doc: any) => {
  // 更新文档状态为运行中
  doc.status = 'running';
  
  try {
    const res = await request.post('/ai-scoring/analyze', {
      documentInstanceId: doc.id,
      documentTemplateId: doc.templateId,
      templateType: doc.templateType,
      templateName: doc.templateName,
      content: doc.content
    });

    return res.data;
  } catch (error) {
    console.error(`文档 ${doc.title || doc.name} 分析失败:`, error);
    throw error;
  }
};

// 查看详情
const viewDetail = (doc: any) => {
  currentDocument.value = doc;
  detailDialogVisible.value = true;
};

// 导出报告
const exportReport = () => {
  ElMessage.info('导出报告功能开发中...');
};

// 关闭抽屉
const handleClose = () => {
  if (isAnalyzing.value) {
    ElMessageBox.confirm(
      'AI分析正在进行中，关闭将丢失分析进度。确定要关闭吗？',
      '警告',
      {
        confirmButtonText: '强制关闭',
        cancelButtonText: '继续分析',
        type: 'warning'
      }
    ).then(() => {
      visible.value = false;
      resetState();
    }).catch(() => {
      // 取消关闭
    });
  } else {
    visible.value = false;
    if (isCompleted.value) {
      resetState();
    }
  }
};

// 重置状态
const resetState = () => {
  isAnalyzing.value = false;
  isCompleted.value = false;
  isStarting.value = false;
  progress.value = {
    total: 0,
    completed: 0,
    failed: 0,
    running: 0,
    pending: 0,
    progress: 0
  };
  documents.value.forEach(doc => {
    doc.status = 'pending';
    doc.score = null;
    doc.result = null;
  });
};

// 防止页面刷新
const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  if (isAnalyzing.value) {
    e.preventDefault();
    e.returnValue = '';
  }
};

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload);
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload);
});
</script>

<style scoped lang="scss">
.ai-scoring-drawer {
  :deep(.el-drawer__body) {
    padding: var(--spacing-2xl);
  }
}

.progress-section {
  margin-bottom: var(--spacing-2xl);
  padding: var(--spacing-lg);
  background: var(--bg-hover);
  border-radius: var(--radius-sm);

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-md);

    .label {
      font-weight: var(--font-medium);
      font-size: var(--text-base);
      color: var(--text-primary);
    }

    .stats {
      font-size: var(--text-base);
      color: var(--text-regular);
    }
  }

  .progress-stats {
    display: flex;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-md);
    flex-wrap: wrap;
  }
}

.documents-section {
  .section-title {
    font-size: var(--text-lg);
    font-weight: var(--font-medium);
    margin-bottom: var(--spacing-lg);
    color: var(--text-primary);
  }

  .document-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .document-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    background: var(--bg-card);
    border: 1px solid var(--border-color-light);
    border-radius: var(--radius-sm);
    transition: all var(--transition-slow) var(--ease-in-out);

    &.status-pending {
      border-color: var(--border-color-light);
      background: var(--bg-tertiary);
    }

    &.status-running {
      border-color: var(--primary-color);
      background: var(--primary-light-bg);
    }

    &.status-completed {
      border-color: var(--success-color);
      background: var(--success-light-bg);
    }

    &.status-failed {
      border-color: var(--danger-color);
      background: var(--danger-light-bg);
    }

    .status-icon {
      font-size: var(--text-2xl);
      flex-shrink: 0;

      .pending-icon {
        color: var(--info-color);
      }

      .running-icon {
        color: var(--primary-color);
      }

      .success-icon {
        color: var(--success-color);
      }

      .error-icon {
        color: var(--danger-color);
      }
    }

    .document-info {
      flex: 1;
      min-width: 0;

      .document-name {
        font-weight: 500;
        margin-bottom: var(--spacing-lg);
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .document-meta {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-size: var(--text-sm);
        color: var(--info-color);

        .time {
          flex-shrink: 0;
        }
      }
    }

    .document-result {
      display: flex;
      align-items: center;
      gap: var(--text-sm);
      flex-shrink: 0;

      .score-badge {
        padding: var(--spacing-sm) var(--text-lg);
        border-radius: var(--text-2xl);
        font-weight: bold;
        font-size: var(--text-lg);
        white-space: nowrap;

        &.excellent {
          background: var(--success-color);
          color: white;
        }

        &.good {
          background: var(--primary-color);
          color: white;
        }

        &.average {
          background: var(--warning-color);
          color: white;
        }

        &.poor {
          background: var(--danger-color);
          color: white;
        }

        &.unqualified {
          background: var(--info-color);
          color: white;
        }
      }
    }

    .document-status {
      flex-shrink: 0;
    }

    .analyzing-text {
      color: var(--primary-color);
      font-size: var(--text-base);
    }
  }
}

.drawer-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg) 0 0;
  border-top: 1px solid var(--border-color);

  .footer-left {
    .completion-time {
      font-size: var(--text-base);
      color: var(--text-regular);
    }
  }

  .footer-right {
    display: flex;
    gap: var(--text-sm);
  }
}

// 替换内联样式的CSS类
.time-limit-alert {
  margin-bottom: var(--spacing-2xl);
}

.alert-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.alert-content {
  margin-top: var(--spacing-sm);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
}

.important-alert {
  margin-bottom: var(--spacing-2xl);
}

.important-alert-content {
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);

  .time-warning {
    color: var(--warning-color);
  }

  .refresh-warning {
    color: var(--danger-color);
  }
}

.analyzing-alert {
  margin-bottom: var(--spacing-2xl);
}

.analyzing-alert-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.analyzing-alert-content {
  font-size: var(--text-sm);
  margin-top: var(--spacing-sm);
}
</style>

