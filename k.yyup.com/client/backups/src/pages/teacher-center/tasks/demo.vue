<template>
  <UnifiedCenterLayout
    title="页面标题"
    description="页面描述"
    icon="User"
  >
    <div class="center-container teacher-tasks">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1>
            <el-icon><List /></el-icon>
            任务中心
          </h1>
          <p>管理您的日常任务，提高工作效率</p>
        </div>
        <div class="header-actions">
          <el-button type="primary">
            <el-icon><Plus /></el-icon>
            新建任务
          </el-button>
          <el-button>
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>
    </div>

    <!-- 团队协作概览 -->
    <div class="team-collaboration">
      <el-card>
        <template #header>
          <div class="card-header">
            <span class="card-title">
              <el-icon><User /></el-icon>
              团队协作概览
            </span>
            <el-tag type="primary" size="small">12位成员</el-tag>
          </div>
  </UnifiedCenterLayout>
</template>

        <div class="team-grid">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="6" :lg="6">
              <div class="team-item">
                <div class="team-value">3</div>
                <div class="team-label">共享任务</div>
                <div class="team-trend info">需要协作完成</div>
              </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="6">
              <div class="team-item">
                <div class="team-value">2</div>
                <div class="team-label">待我审批</div>
                <div class="team-trend warning">需要处理</div>
              </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="6">
              <div class="team-item">
                <div class="team-value">1</div>
                <div class="team-label">紧急截止</div>
                <div class="team-trend danger">需要关注</div>
              </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6" :lg="6">
              <div class="team-item">
                <div class="team-value">#4</div>
                <div class="team-label">我的排名</div>
                <div class="team-trend success">本月完成度</div>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>
    </div>

    <!-- 统计与进度综合区域 -->
    <div class="stats-progress-section">
      <el-row :gutter="32">
        <!-- 左侧：任务统计 -->
        <el-col :xs="24" :sm="24" :md="10" :lg="8">
          <el-card class="stats-card">
            <template #header>
              <div class="card-header">
                <span class="card-title">
                  <el-icon><DataAnalysis /></el-icon>
                  任务统计
                </span>
              </div>
            </template>
            
            <div class="stats-grid-compact">
              <div class="stat-item-horizontal">
                <div class="stat-icon total">
                  <el-icon><List /></el-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-value">15</div>
                  <div class="stat-label">全部任务</div>
                </div>
              </div>
              
              <div class="stat-item-horizontal">
                <div class="stat-icon completed">
                  <el-icon><Check /></el-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-value">10</div>
                  <div class="stat-label">已完成</div>
                </div>
              </div>
              
              <div class="stat-item-horizontal">
                <div class="stat-icon pending">
                  <el-icon><Clock /></el-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-value">4</div>
                  <div class="stat-label">进行中</div>
                </div>
              </div>
              
              <div class="stat-item-horizontal">
                <div class="stat-icon overdue">
                  <el-icon><Warning /></el-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-value">1</div>
                  <div class="stat-label">已逾期</div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <!-- 右侧：完成率进度 -->
        <el-col :xs="24" :sm="24" :md="14" :lg="16">
          <el-card class="progress-card">
            <template #header>
              <div class="card-header">
                <span class="card-title">
                  <el-icon><TrendCharts /></el-icon>
                  完成进度
                </span>
                <span class="progress-percentage" style="color: var(--success-color);">
                  67%
                </span>
              </div>
            </template>

            <div class="progress-content-enhanced">
              <div class="progress-main">
                <el-progress
                  :percentage="67"
                  :stroke-width="16"
                  :show-text="false"
                  color="var(--success-color)"
                  class="main-progress-bar"
                />
              </div>
              
              <div class="progress-stats-enhanced">
                <div class="progress-item-enhanced">
                  <div class="progress-icon">
                    <el-icon><Calendar /></el-icon>
                  </div>
                  <div class="progress-info">
                    <span class="progress-label">本周完成</span>
                    <span class="progress-number">8</span>
                  </div>
                </div>
                <div class="progress-item-enhanced">
                  <div class="progress-icon">
                    <el-icon><Calendar /></el-icon>
                  </div>
                  <div class="progress-info">
                    <span class="progress-label">本月完成</span>
                    <span class="progress-number">25</span>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 任务列表 -->
    <div class="tasks-list">
      <el-card>
        <template #header>
          <div class="card-header">
            <span class="card-title">任务列表</span>
            <div class="list-actions">
              <el-button size="small">筛选</el-button>
              <el-button size="small">排序</el-button>
            </div>
          </div>
        </template>
        
        <div class="task-items">
          <div class="task-item">
            <div class="task-info">
              <div class="task-title">准备下周的教学计划</div>
              <div class="task-description">制定详细的教学内容和活动安排</div>
            </div>
            <div class="task-meta">
              <el-tag size="small" type="warning">进行中</el-tag>
              <span class="due-date">2024-01-15</span>
            </div>
          </div>
          
          <div class="task-item">
            <div class="task-info">
              <div class="task-title completed">批改学生作业</div>
              <div class="task-description">完成本周所有学生作业的批改工作</div>
            </div>
            <div class="task-meta">
              <el-tag size="small" type="success">已完成</el-tag>
              <span class="due-date">2024-01-12</span>
            </div>
          </div>
          
          <div class="task-item">
            <div class="task-info">
              <div class="task-title">家长会准备</div>
              <div class="task-description">准备家长会的演示材料和讨论议题</div>
            </div>
            <div class="task-meta">
              <el-tag size="small" type="danger">紧急</el-tag>
              <span class="due-date overdue">2024-01-10</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'

import {
  List,
  Plus,
  Refresh,
  Check,
  Clock,
  Warning,
  DataAnalysis,
  TrendCharts,
  Calendar,
  User
} from '@element-plus/icons-vue'
</script>

<style lang="scss" scoped>
@import '@/styles/index.scss';

.teacher-tasks {
  padding: var(--spacing-3xl);
  background-color: var(--el-bg-color-page);
  min-height: 100vh;
  width: 100%;
  max-width: 100%;
  flex: 1 1 auto;
}

.page-header {
  margin-bottom: var(--spacing-3xl);
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    
    .header-left {
      h1 {
        font-size: var(--text-3xl);
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin: 0 0 var(--spacing-sm) 0;
        display: flex;
        align-items: center;
        gap: var(--text-sm);
      }
      
      p {
        color: var(--el-text-color-secondary);
        margin: 0;
        font-size: var(--text-lg);
      }
    }
    
    .header-actions {
      display: flex;
      gap: var(--text-sm);
    }
  }
}

.team-collaboration {
  margin-bottom: var(--spacing-3xl);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .card-title {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }

  .team-item {
    text-align: center;
    padding: var(--text-3xl) var(--text-2xl);
    border-radius: var(--text-sm);
    background: var(--el-bg-color);
    border: var(--border-width-base) solid var(--el-border-color-light);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 var(--spacing-sm) var(--text-3xl) rgba(0, 0, 0, 0.12);
      border-color: var(--el-color-primary);
    }

    .team-value {
      font-size: var(--spacing-3xl);
      font-weight: 700;
      color: var(--el-text-color-primary);
      margin-bottom: var(--text-sm);
      line-height: 1;
    }

    .team-label {
      font-size: var(--text-base);
      color: var(--el-text-color-regular);
      margin-bottom: var(--spacing-sm);
      font-weight: 500;
    }

    .team-trend {
      font-size: var(--text-sm);
      padding: var(--spacing-xs) var(--text-sm);
      border-radius: var(--text-lg);
      display: inline-block;
      font-weight: 500;

      &.info {
        background: rgba(64, 158, 255, 0.1);
        color: var(--el-color-primary);
      }

      &.warning {
        background: rgba(230, 162, 60, 0.1);
        color: var(--el-color-warning);
      }

      &.danger {
        background: rgba(245, 108, 108, 0.1);
        color: var(--el-color-danger);
      }

      &.success {
        background: rgba(103, 194, 58, 0.1);
        color: var(--el-color-success);
      }
    }
  }
}

// 统计与进度综合区域
.stats-progress-section {
  margin-bottom: var(--spacing-3xl);

  .stats-card, .progress-card {
    height: 100%;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .card-title {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-size: var(--text-lg);
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      .progress-percentage {
        font-size: var(--text-3xl);
        font-weight: 700;
        margin-left: var(--text-lg);
      }
    }
  }

  .stats-grid-compact {
    display: flex;
    flex-direction: column;
    gap: var(--text-lg);

    .stat-item-horizontal {
      display: flex;
      align-items: center;
      padding: var(--text-lg);
      background: var(--el-bg-color);
      border-radius: var(--text-sm);
      border: var(--border-width-base) solid var(--el-border-color-lighter);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 var(--spacing-xs) var(--text-lg) var(--black-alpha-8);
        border-color: var(--el-color-primary-light-5);
      }

      .stat-icon {
        width: var(--icon-size); height: var(--icon-size);
        border-radius: var(--text-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: var(--text-lg);
        font-size: var(--text-2xl);

        &.total {
          background: rgba(64, 158, 255, 0.1);
          color: var(--el-color-primary);
        }

        &.completed {
          background: rgba(103, 194, 58, 0.1);
          color: var(--el-color-success);
        }

        &.pending {
          background: rgba(230, 162, 60, 0.1);
          color: var(--el-color-warning);
        }

        &.overdue {
          background: rgba(245, 108, 108, 0.1);
          color: var(--el-color-danger);
        }
      }

      .stat-content {
        flex: 1;

        .stat-value {
          font-size: var(--text-3xl);
          font-weight: 700;
          color: var(--el-text-color-primary);
          line-height: 1;
          margin-bottom: var(--spacing-xs);
        }

        .stat-label {
          font-size: var(--text-base);
          color: var(--el-text-color-regular);
          font-weight: 500;
        }
      }
    }
  }

  .progress-content-enhanced {
    .progress-main {
      margin-bottom: var(--text-3xl);

      .main-progress-bar {
        :deep(.el-progress-bar__outer) {
          border-radius: var(--spacing-sm);
          background-color: var(--el-fill-color-light);
        }

        :deep(.el-progress-bar__inner) {
          border-radius: var(--spacing-sm);
          transition: all 0.3s ease;
        }
      }
    }

    .progress-stats-enhanced {
      display: flex;
      gap: var(--text-3xl);

      .progress-item-enhanced {
        display: flex;
        align-items: center;
        flex: 1;
        padding: var(--text-lg);
        background: var(--el-bg-color);
        border-radius: var(--text-sm);
        border: var(--border-width-base) solid var(--el-border-color-lighter);

        .progress-icon {
          width: var(--icon-size); height: var(--icon-size);
          border-radius: var(--radius-xl);
          background: rgba(64, 158, 255, 0.1);
          color: var(--el-color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: var(--text-sm);
          font-size: var(--text-lg);
        }

        .progress-info {
          flex: 1;

          .progress-label {
            display: block;
            font-size: var(--text-sm);
            color: var(--el-text-color-secondary);
            margin-bottom: var(--spacing-xs);
          }

          .progress-number {
            font-size: var(--text-2xl);
            font-weight: 600;
            color: var(--el-text-color-primary);
          }
        }
      }
    }
  }
}

// 任务列表
.tasks-list {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .card-title {
      font-weight: 600;
      font-size: var(--text-lg);
    }

    .list-actions {
      display: flex;
      gap: var(--spacing-sm);
    }
  }

  .task-items {
    display: flex;
    flex-direction: column;
    gap: var(--text-lg);
  }

  .task-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--text-2xl);
    background: var(--el-bg-color);
    border-radius: var(--text-sm);
    border: var(--border-width-base) solid var(--el-border-color-lighter);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-var(--border-width-base));
      box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--black-alpha-8);
      border-color: var(--el-color-primary-light-7);
    }

    .task-info {
      flex: 1;

      .task-title {
        font-weight: 500;
        margin-bottom: var(--spacing-xs);
        font-size: var(--text-lg);
        color: var(--el-text-color-primary);

        &.completed {
          text-decoration: line-through;
          opacity: 0.6;
        }
      }

      .task-description {
        font-size: var(--text-base);
        color: var(--el-text-color-secondary);
      }
    }

    .task-meta {
      display: flex;
      align-items: center;
      gap: var(--text-sm);

      .due-date {
        font-size: var(--text-base);
        color: var(--el-text-color-regular);

        &.overdue {
          color: var(--el-color-danger);
          font-weight: 500;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .teacher-tasks {
    padding: var(--text-2xl);
  }

  .page-header .header-content {
    flex-direction: column;
    gap: var(--text-lg);
    align-items: flex-start;
  }

  .stats-progress-section {
    .progress-stats-enhanced {
      flex-direction: column;
      gap: var(--text-lg);
    }
  }

  .task-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--text-sm);

    .task-meta {
      align-self: flex-end;
    }
  }
}
</style>
