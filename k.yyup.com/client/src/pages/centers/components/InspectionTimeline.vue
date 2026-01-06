<template>
  <div class="inspection-timeline" v-loading="loading">
    <div v-if="plans.length === 0" class="empty-state">
      <el-empty description="暂无检查计划" />
    </div>

    <!-- 按月份分组的折叠面板 -->
    <el-collapse v-else v-model="activeMonths" class="month-collapse">
      <el-collapse-item
        v-for="(group, month) in groupedByMonth"
        :key="month"
        :name="month"
        class="month-group"
      >
        <template #title>
          <div class="month-header">
            <div class="month-info">
              <UnifiedIcon name="default" />
              <span class="month-label">{{ formatMonthLabel(month) }}</span>
              <el-tag type="info" size="small" class="count-tag">
                {{ group.length }} 个检查
              </el-tag>
              <el-tag v-if="getMonthDocumentCount(month) > 0" type="success" size="small" class="count-tag">
                {{ getMonthDocumentCount(month) }} 个文档
              </el-tag>
            </div>
            <div class="month-stats">
              <el-tag v-if="getMonthStats(group).pending > 0" type="info" size="small">
                待开始 {{ getMonthStats(group).pending }}
              </el-tag>
              <el-tag v-if="getMonthStats(group).preparing > 0" type="warning" size="small">
                准备中 {{ getMonthStats(group).preparing }}
              </el-tag>
              <el-tag v-if="getMonthStats(group).inProgress > 0" type="primary" size="small">
                进行中 {{ getMonthStats(group).inProgress }}
              </el-tag>
              <el-tag v-if="getMonthStats(group).completed > 0" type="success" size="small">
                已完成 {{ getMonthStats(group).completed }}
              </el-tag>
            </div>
          </div>
        </template>

        <!-- 月份内的文档列表 -->
        <div v-if="getMonthDocuments(month).length > 0" class="month-documents">
          <el-divider content-position="left">
            <UnifiedIcon name="default" />
            <span style="margin-left: var(--spacing-sm);">本月文档 ({{ getMonthDocuments(month).length }})</span>
          </el-divider>
          <div class="document-list">
            <el-card
              v-for="doc in getMonthDocuments(month)"
              :key="doc.id"
              class="document-card"
              shadow="hover"
              @click="handleDocumentClick(doc)"
            >
              <div class="document-header">
                <div class="document-title">
                  <UnifiedIcon name="default" />
                  <span>{{ doc.title }}</span>
                </div>
                <el-tag :type="getDocumentStatusType(doc.status)" size="small">
                  {{ getDocumentStatusLabel(doc.status) }}
                </el-tag>
              </div>
              <div class="document-info">
                <div class="info-item">
                  <span class="label">模板类型:</span>
                  <span class="value">{{ doc.template?.name || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">完成率:</span>
                  <el-progress
                    :percentage="Number(doc.completionRate) || 0"
                    :stroke-width="6"
                    :show-text="true"
                    :format="() => `${doc.completionRate || 0}%`"
                  />
                </div>
                <div class="info-item" v-if="doc.deadline">
                  <span class="label">截止日期:</span>
                  <div class="deadline-editor" @click.stop>
                    <span
                      v-if="editingDocumentId !== doc.id"
                      class="deadline-value editable"
                      @click="startEditDeadline(doc)"
                    >
                      {{ formatDate(doc.deadline.toString()) }}
                      <UnifiedIcon name="Edit" />
                    </span>
                    <el-date-picker
                      v-else
                      v-model="editingDeadline"
                      type="date"
                      placeholder="选择截止日期"
                      size="small"
                      format="YYYY-MM-DD"
                      value-format="YYYY-MM-DD"
                      @change="saveDeadline(doc)"
                      @blur="cancelEditDeadline"
                      style="max-width: 150px; width: 100%"
                    />
                  </div>
                </div>
              </div>
            </el-card>
          </div>
        </div>

        <!-- 月份内的时间轴 -->
        <el-timeline class="month-timeline">
          <el-timeline-item
            v-for="plan in group"
            :key="plan.id"
            :timestamp="formatDate(plan.planDate)"
            :type="getTimelineType(plan.status)"
            :color="getTimelineColor(plan.status)"
            :size="plan.status === 'in_progress' ? 'large' : 'normal'"
            placement="top"
          >
            <el-card class="timeline-card" :class="getCardClass(plan.status)" @click="handlePlanClick(plan)">
              <div class="card-header">
                <div class="title-section">
                  <h3 class="plan-title">{{ plan.inspectionType?.name }}</h3>
                  <el-tag :type="getCategoryTagType(plan.inspectionType?.category)" size="small">
                    {{ getCategoryLabel(plan.inspectionType?.category) }}
                  </el-tag>
                </div>
                <el-tag :type="getStatusTagType(plan.status)" size="large">
                  {{ getStatusLabel(plan.status) }}
                </el-tag>
              </div>

              <div class="card-content">
                <div class="info-row">
                  <span class="label">检查部门:</span>
                  <span class="value">{{ plan.inspectionType?.department || '-' }}</span>
                </div>
                <div class="info-row">
                  <span class="label">检查频次:</span>
                  <span class="value">{{ plan.inspectionType?.frequency || '-' }}</span>
                </div>
                <div class="info-row">
                  <span class="label">检查时长:</span>
                  <span class="value">{{ plan.inspectionType?.duration ? `${plan.inspectionType.duration}天` : '-' }}</span>
                </div>
                <div v-if="plan.notes" class="info-row">
                  <span class="label">备注:</span>
                  <span class="value">{{ plan.notes }}</span>
                </div>
                <div v-if="plan.result" class="info-row">
                  <span class="label">检查结果:</span>
                  <span class="value">{{ plan.result }}</span>
                </div>
                <div v-if="plan.score" class="info-row">
                  <span class="label">检查得分:</span>
                  <span class="value score">{{ plan.score }}分</span>
                  <span v-if="plan.grade" class="grade">{{ plan.grade }}</span>
                </div>
              </div>

              <div class="card-footer">
                <div class="footer-info">
                  <UnifiedIcon name="default" />
                  <span>计划日期: {{ formatDate(plan.planDate) }}</span>
                  <span v-if="plan.actualDate" class="actual-date">
                    | 实际日期: {{ formatDate(plan.actualDate) }}
                  </span>
                </div>
                <div class="footer-actions">
                  <el-button link type="primary" size="small" class="action-button" @click.stop="handleEdit(plan)">
                    <UnifiedIcon name="Edit" />
                    编辑
                  </el-button>
                  <el-button link type="success" size="small" class="action-button" @click.stop="handleViewTasks(plan)">
                    <UnifiedIcon name="default" />
                    任务
                  </el-button>
                  <el-button 
                    v-if="plan.status === 'completed'" 
                    link 
                    type="warning" 
                    size="small" 
                    class="action-button" 
                    @click.stop="$emit('print-record', plan)"
                  >
                    <UnifiedIcon name="default" />
                    打印
                  </el-button>
                </div>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Calendar, Edit, List, Files, Document, Printer } from '@element-plus/icons-vue';
import { InspectionPlan } from '@/api/endpoints/inspection';

// 文档接口
interface DocumentInstance {
  id: number;
  title: string;
  status: string;
  completionRate: number;
  deadline?: Date;
  templateId: number;
  template?: {
    name: string;
    category: string;
  };
}

// Props
interface Props {
  plans: InspectionPlan[];
  documents?: DocumentInstance[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  documents: () => [],
  loading: false
});

// Emits
const emit = defineEmits<{
  'plan-click': [plan: InspectionPlan];
  'edit': [plan: InspectionPlan];
  'view-tasks': [plan: InspectionPlan];
  'view-document': [document: DocumentInstance];
  'update-deadline': [documentId: number, deadline: string];
  'print-record': [plan: InspectionPlan];
}>();

// 默认展开的月份（默认全部收缩）
const activeMonths = ref<string[]>([]);

// 内联编辑截止日期
const editingDocumentId = ref<number | null>(null);
const editingDeadline = ref<string>('');

// 排序后的计划
const sortedPlans = computed(() => {
  return [...props.plans].sort((a, b) => {
    return new Date(a.planDate).getTime() - new Date(b.planDate).getTime();
  });
});

// 按月份分组检查计划
const groupedByMonth = computed(() => {
  const groups: Record<string, InspectionPlan[]> = {};

  sortedPlans.value.forEach(plan => {
    const date = new Date(plan.planDate);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(plan);
  });

  return groups;
});

// 按月份分组文档
const documentsByMonth = computed(() => {
  const groups: Record<string, DocumentInstance[]> = {};

  // 确保 documents 存在且是数组
  if (!props.documents || !Array.isArray(props.documents)) {
    return groups;
  }

  props.documents.forEach(doc => {
    if (doc && doc.deadline) {
      const date = new Date(doc.deadline);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(doc);
    }
  });

  return groups;
});

// 格式化月份标签
const formatMonthLabel = (monthKey: string) => {
  const [year, month] = monthKey.split('-');
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  return `${year}年 ${monthNames[parseInt(month) - 1]}`;
};

// 获取月份统计
const getMonthStats = (plans: InspectionPlan[]) => {
  return {
    pending: plans.filter(p => p.status === 'pending').length,
    preparing: plans.filter(p => p.status === 'preparing').length,
    inProgress: plans.filter(p => p.status === 'in_progress').length,
    completed: plans.filter(p => p.status === 'completed').length
  };
};

// 获取月份的文档数量
const getMonthDocumentCount = (monthKey: string) => {
  return documentsByMonth.value[monthKey]?.length || 0;
};

// 获取月份的文档列表
const getMonthDocuments = (monthKey: string) => {
  return documentsByMonth.value[monthKey] || [];
};

// 获取文档状态标签类型
const getDocumentStatusType = (status: string) => {
  const types: Record<string, any> = {
    draft: 'info',
    pending_review: 'warning',
    approved: 'success',
    rejected: 'danger',
    archived: ''
  };
  return types[status] || 'info';
};

// 获取文档状态标签
const getDocumentStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    draft: '草稿',
    pending_review: '待审核',
    approved: '已审核',
    rejected: '已拒绝',
    archived: '已归档'
  };
  return labels[status] || status;
};

// 处理文档点击
const handleDocumentClick = (document: DocumentInstance) => {
  emit('view-document', document);
};

// 开始编辑截止日期
const startEditDeadline = (document: DocumentInstance) => {
  editingDocumentId.value = document.id;
  editingDeadline.value = document.deadline ? new Date(document.deadline).toISOString().split('T')[0] : '';
};

// 保存截止日期
const saveDeadline = (document: DocumentInstance) => {
  if (editingDeadline.value) {
    emit('update-deadline', document.id, editingDeadline.value);
  }
  cancelEditDeadline();
};

// 取消编辑截止日期
const cancelEditDeadline = () => {
  editingDocumentId.value = null;
  editingDeadline.value = '';
};

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return '-';
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// 获取Timeline类型
const getTimelineType = (status: string) => {
  const types: Record<string, any> = {
    pending: 'info',
    preparing: 'warning',
    in_progress: 'primary',
    completed: 'success',
    overdue: 'danger'
  };
  return types[status] || 'info';
};

// 获取Timeline颜色
const getTimelineColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'var(--info-color)',
    preparing: 'var(--warning-color)',
    in_progress: 'var(--primary-color)',
    completed: 'var(--success-color)',
    overdue: 'var(--danger-color)'
  };
  return colors[status] || 'var(--info-color)';
};

// 获取卡片类名
const getCardClass = (status: string) => {
  return `status-${status}`;
};

// 获取类别标签
const getCategoryLabel = (category?: string) => {
  const labels: Record<string, string> = {
    annual: '年度检查',
    special: '专项检查',
    routine: '常态化督导'
  };
  return labels[category || ''] || category;
};

// 获取类别标签类型
const getCategoryTagType = (category?: string) => {
  const types: Record<string, any> = {
    annual: 'danger',
    special: 'warning',
    routine: 'info'
  };
  return types[category || ''] || '';
};

// 获取状态标签
const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: '待开始',
    preparing: '准备中',
    in_progress: '进行中',
    completed: '已完成',
    overdue: '已逾期'
  };
  return labels[status] || status;
};

// 获取状态标签类型
const getStatusTagType = (status: string) => {
  const types: Record<string, any> = {
    pending: 'info',
    preparing: 'warning',
    in_progress: 'primary',
    completed: 'success',
    overdue: 'danger'
  };
  return types[status] || '';
};

// 事件处理
const handlePlanClick = (plan: InspectionPlan) => {
  emit('plan-click', plan);
};

const handleEdit = (plan: InspectionPlan) => {
  emit('edit', plan);
};

const handleViewTasks = (plan: InspectionPlan) => {
  emit('view-tasks', plan);
};
</script>

<style scoped lang="scss">
.inspection-timeline {
  padding: var(--text-2xl) 0;

  .empty-state {
    padding: var(--spacing-15xl) 0;
    text-align: center;
  }

  .month-collapse {
    border: none;

    .month-group {
      margin-bottom: var(--text-2xl);
      border: var(--border-width-base) solid var(--border-color-lighter);
      border-radius: var(--spacing-sm);
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;

      :deep(.el-collapse-item__header) {
        background: linear-gradient(135deg, var(--bg-container) 0%, var(--bg-white) 100%);
        border: none;
        padding: var(--text-lg) var(--text-2xl);
        font-size: var(--text-lg);
        font-weight: 500;
        transition: all 0.3s;

        &:hover {
          background: linear-gradient(135deg, #ecf5ff 0%, var(--bg-white) 100%);
        }

        &.is-active {
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
          color: white;

          .month-header {
            .month-info {
              .month-icon,
              .month-label {
                color: white;
              }
            }
          }
        }
      }

      :deep(.el-collapse-item__wrap) {
        border: none;
        background: var(--bg-tertiary);
      }

      :deep(.el-collapse-item__content) {
        padding: var(--text-2xl);
      }

      .month-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding-right: var(--text-2xl);

        .month-info {
          display: flex;
          align-items: center;
          gap: var(--text-sm);

          .month-icon {
            font-size: var(--text-2xl);
            color: var(--primary-color);
          }

          .month-label {
            font-size: var(--text-lg);
            font-weight: 600;
            color: var(--text-primary);
          }

          .count-tag {
            font-weight: 500;
          }
        }

        .month-stats {
          display: flex;
          gap: var(--spacing-sm);
          flex-wrap: wrap;
        }
      }
    }
  }

  .month-documents {
    margin-bottom: var(--text-2xl);
    padding: var(--text-2xl);
    background: var(--bg-hover);
    border-radius: var(--spacing-sm);

    .document-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: var(--text-lg);
      margin-top: var(--text-lg);

      .document-card {
        cursor: pointer;
        transition: all 0.3s;
        border-left: var(--spacing-xs) solid var(--success-color);

        &:hover {
          transform: translateY(var(--transform-hover-lift));
          box-shadow: 0 var(--spacing-xs) var(--text-sm) rgba(103, 194, 58, 0.2);
        }

        .document-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--text-sm);

          .document-title {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            font-size: var(--text-base);
            font-weight: 600;
            color: var(--text-primary);

            .el-icon {
              color: var(--success-color);
            }
          }
        }

        .document-info {
          .info-item {
            display: flex;
            align-items: center;
            margin-bottom: var(--spacing-sm);
            font-size: var(--text-sm);

            .label {
              color: var(--info-color);
              min-width: auto;
            }

            .value {
              color: var(--text-regular);
              flex: 1;
            }

            .deadline-editor {
              flex: 1;
              display: flex;
              align-items: center;

              .deadline-value {
                color: var(--text-regular);
                cursor: default;

                &.editable {
                  cursor: pointer;
                  padding: var(--spacing-xs) var(--spacing-sm);
                  border-radius: var(--spacing-xs);
                  transition: all 0.3s;
                  display: inline-flex;
                  align-items: center;
                  gap: var(--spacing-xs);

                  .edit-icon {
                    font-size: var(--text-sm);
                    color: var(--info-color);
                    opacity: 0;
                    transition: opacity 0.3s;
                  }

                  &:hover {
                    background: #f0f9ff;
                    color: var(--primary-color);

                    .edit-icon {
                      opacity: 1;
                      color: var(--primary-color);
                    }
                  }
                }
              }
            }

            .el-progress {
              flex: 1;
            }
          }
        }
      }
    }
  }

  .month-timeline {
    background: white;
    padding: var(--text-2xl);
    border-radius: var(--spacing-sm);
  }

  .timeline-card {
    cursor: pointer;
    transition: all 0.3s;
    border-left: var(--spacing-xs) solid transparent;

    &:hover {
      box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-medium);
      transform: translateY(var(--transform-hover-lift));
    }

    &.status-pending {
      border-left-color: var(--info-color);
    }

    &.status-preparing {
      border-left-color: var(--warning-color);
    }

    &.status-in_progress {
      border-left-color: var(--primary-color);
      box-shadow: 0 2px var(--spacing-sm) rgba(64, 158, 255, 0.2);
    }

    &.status-completed {
      border-left-color: var(--success-color);
      opacity: 0.9;
    }

    &.status-overdue {
      border-left-color: var(--danger-color);
      background: #fef0f0;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--text-lg);

      .title-section {
        display: flex;
        align-items: center;
        gap: var(--text-sm);

        .plan-title {
          font-size: var(--text-xl);
          font-weight: bold;
          margin: 0;
          color: var(--text-primary);
        }
      }
    }

    .card-content {
      margin-bottom: var(--text-lg);

      .info-row {
        display: flex;
        align-items: center;
        margin-bottom: var(--spacing-sm);
        font-size: var(--text-base);

        .label {
          color: var(--info-color);
          min-width: auto;
        }

        .value {
          color: var(--text-regular);
          flex: 1;

          &.score {
            font-size: var(--text-lg);
            font-weight: bold;
            color: var(--primary-color);
          }
        }

        .grade {
          margin-left: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-sm);
          background: #f0f9ff;
          color: var(--primary-color);
          border-radius: var(--spacing-xs);
          font-size: var(--text-sm);
        }
      }
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: var(--text-sm);
      border-top: var(--z-index-dropdown) solid var(--border-color-lighter);

      .footer-info {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-size: var(--text-sm);
        color: var(--info-color);

        .actual-date {
          color: var(--success-color);
        }
      }

      .footer-actions {
        display: flex;
        gap: var(--spacing-sm);

        .action-button {
          font-size: var(--text-base) !important;
          min-width: auto;
          padding: var(--spacing-xs) var(--spacing-sm) !important;

          .el-icon {
            font-size: var(--text-base);
            margin-right: var(--spacing-xs);
          }
        }
      }
    }
  }
}

:deep(.el-timeline-item__timestamp) {
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--text-regular);
}

:deep(.el-timeline-item__node--large) {
  width: var(--text-lg);
  height: var(--text-lg);
}
</style>

