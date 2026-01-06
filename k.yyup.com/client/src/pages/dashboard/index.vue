<template>
  <UnifiedCenterLayout
    title="综合工作台"
    description="这里是幼儿园管理系统的核心枢纽，您可以快速总览各业务中心数据与入口，掌握园区运营状况"
  >
    <div class="center-container dashboard-center">
      <!-- 主要内容区域 -->
      <div class="dashboard-main-content">
        <!-- 核心统计卡片 -->
        <div class="stats-section">
          <div class="stats-grid-unified">
            <StatCard
              title="在读学生"
              :value="dashboardStats.studentCount || 0"
              unit="人"
              :trend="trends.studentTrend.value"
              trend-text="较上月"
              icon-name="user"
              type="primary"
              :loading="loading"
              clickable
              @click="navigateToCenter('/student')"
            />
            <StatCard
              title="教职员工"
              :value="dashboardStats.teacherCount || 0"
              unit="人"
              :trend="trends.teacherTrend.value"
              trend-text="较上月"
              icon-name="users"
              type="success"
              :loading="loading"
              clickable
              @click="navigateToCenter('/teacher')"
            />
            <StatCard
              title="班级总数"
              :value="dashboardStats.classCount || 0"
              unit="个"
              :trend="trends.classTrend.value"
              trend-text="较上月"
              icon-name="home"
              type="warning"
              :loading="loading"
              clickable
              @click="navigateToCenter('/class')"
            />
            <StatCard
              title="招生数量"
              :value="dashboardStats.enrollmentCount || 0"
              unit="人"
              :trend="trends.enrollmentTrend.value"
              trend-text="较上月"
              icon-name="user-plus"
              type="info"
              :loading="loading"
              clickable
              @click="navigateToCenter('/centers/enrollment')"
            />
            <StatCard
              v-if="graduationStats"
              :title="`${graduationStats.label || '本年'}毕业`"
              :value="graduationStats.count || 0"
              unit="人"
              :description="`即将毕业人数`"
              icon-name="graduation-cap"
              type="warning"
              :loading="loading"
            />
            <StatCard
              v-if="preEnrollmentStats?.spring"
              :title="`${preEnrollmentStats.spring.label || '春季'}预报名`"
              :value="preEnrollmentStats.spring.count || 0"
              unit="人"
              :description="`春季预报名人数`"
              icon-name="calendar-check"
              type="success"
              :loading="loading"
            />
            <StatCard
              v-if="preEnrollmentStats?.autumn"
              :title="`${preEnrollmentStats.autumn.label || '秋季'}预报名`"
              :value="preEnrollmentStats.autumn.count || 0"
              unit="人"
              :description="`秋季预报名人数`"
              icon-name="calendar-check"
              type="primary"
              :loading="loading"
            />
          </div>
        </div>

        <!-- 业务中心入口 -->
        <div class="centers-section">
          <div class="section-header">
            <h3>业务中心</h3>
            <p>快速访问各业务功能模块</p>
          </div>
          <div class="centers-grid">
            <div class="center-card" @click="navigateToCenter('/centers/enrollment')">
              <div class="center-icon enrollment">
                <UnifiedIcon name="enrollment" />
              </div>
              <div class="center-info">
                <h4>招生中心</h4>
                <p>管理招生计划、处理入学申请</p>
              </div>
              <div class="center-arrow">
                <UnifiedIcon name="ArrowRight" />
              </div>
            </div>

            <div class="center-card" @click="navigateToCenter('/centers/teaching')">
              <div class="center-icon teaching">
                <UnifiedIcon name="book-open" />
              </div>
              <div class="center-info">
                <h4>教学中心</h4>
                <p>课程管理、教学安排</p>
              </div>
              <div class="center-arrow">
                <UnifiedIcon name="ArrowRight" />
              </div>
            </div>

            <div class="center-card" @click="navigateToCenter('/centers/activity')">
              <div class="center-icon activity">
                <UnifiedIcon name="activity" />
              </div>
              <div class="center-info">
                <h4>活动中心</h4>
                <p>活动策划、组织执行</p>
              </div>
              <div class="center-arrow">
                <UnifiedIcon name="ArrowRight" />
              </div>
            </div>

            <div class="center-card" @click="navigateToCenter('/centers/finance')">
              <div class="center-icon finance">
                <UnifiedIcon name="finance" />
              </div>
              <div class="center-info">
                <h4>财务中心</h4>
                <p>收费管理、财务统计</p>
              </div>
              <div class="center-arrow">
                <UnifiedIcon name="ArrowRight" />
              </div>
            </div>

            <div class="center-card" @click="navigateToCenter('/centers/marketing')">
              <div class="center-icon marketing">
                <UnifiedIcon name="marketing" />
              </div>
              <div class="center-info">
                <h4>营销中心</h4>
                <p>推广活动、客户关系</p>
              </div>
              <div class="center-arrow">
                <UnifiedIcon name="ArrowRight" />
              </div>
            </div>

            <div class="center-card" @click="navigateToCenter('/centers/ai')">
              <div class="center-icon ai">
                <UnifiedIcon name="ai-brain" />
              </div>
              <div class="center-info">
                <h4>AI中心</h4>
                <p>智能助手、数据分析</p>
              </div>
              <div class="center-arrow">
                <UnifiedIcon name="ArrowRight" />
              </div>
            </div>
          </div>
        </div>

        <!-- 快速操作和待办事项 -->
        <div class="quick-todo-section">
          <div class="quick-actions">
            <div class="section-header">
              <h3>快速操作</h3>
            </div>
            <div class="actions-grid">
              <div class="action-item" @click="handleQuickAction('add-student')">
                <div class="action-icon">
                  <UnifiedIcon name="students" />
                </div>
                <span>新增学生</span>
              </div>
              <div class="action-item" @click="handleQuickAction('add-teacher')">
                <div class="action-icon">
                  <UnifiedIcon name="teachers" />
                </div>
                <span>新增教师</span>
              </div>
              <div class="action-item" @click="handleQuickAction('create-activity')">
                <div class="action-icon">
                  <UnifiedIcon name="activity" />
                </div>
                <span>创建活动</span>
              </div>
              <div class="action-item" @click="handleQuickAction('send-notice')">
                <div class="action-icon">
                  <UnifiedIcon name="notifications" />
                </div>
                <span>发布通知</span>
              </div>
            </div>
          </div>

          <div class="todo-section">
            <div class="section-header">
              <h3>待办事项</h3>
              <el-link type="primary" @click="viewAllTodos">查看全部</el-link>
            </div>
            <div class="todo-list">
              <div v-if="loading" class="loading-placeholder">
                <el-skeleton :rows="3" animated />
              </div>
              <div v-else-if="todoList.length === 0" class="empty-todo">
                <el-empty description="暂无待办事项" :image-size="80" />
              </div>
              <div v-else>
                <div
                  v-for="todo in todoList.slice(0, 5)"
                  :key="todo.id"
                  class="todo-item"
                  @click="handleTodoClick(todo)"
                >
                  <div class="todo-content">
                    <div class="todo-title">{{ todo.title }}</div>
                    <div class="todo-time">{{ formatTime(todo.dueDate) }}</div>
                  </div>
                  <div class="todo-status" :class="todo.status">
                    <el-tag :type="getTodoStatusType(todo.status)" size="small">
                      {{ getTodoStatusText(todo.status) }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

// 组件导入
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'
import StatCard from '@/components/centers/StatCard.vue'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'

// API导入
import * as dashboardApi from '@/api/modules/dashboard'
import type { DashboardStats, Todo, GraduationStats, PreEnrollmentStats } from '@/api/modules/dashboard'

// 路由
const router = useRouter()

// 响应式数据
const loading = ref(false)
const dashboardStats = ref<DashboardStats>({
  userCount: 0,
  kindergartenCount: 0,
  studentCount: 0,
  enrollmentCount: 0,
  activityCount: 0,
  teacherCount: 0,
  classCount: 0
})
const todoList = ref<Todo[]>([])

// 趋势数据 - 对应 API 返回的字段
const trends = ref({
  studentTrend: { value: 0, direction: 'up' },
  teacherTrend: { value: 0, direction: 'up' },
  classTrend: { value: 0, direction: 'up' },
  enrollmentTrend: { value: 0, direction: 'up' }
})

// 新增统计数据
const graduationStats = ref<GraduationStats>({
  label: '',
  year: new Date().getFullYear(),
  count: 0,
  month: 9
})

const preEnrollmentStats = ref<PreEnrollmentStats>({
  spring: {
    label: '',
    year: new Date().getFullYear(),
    month: 3,
    semester: 1,
    count: 0
  },
  autumn: {
    label: '',
    year: new Date().getFullYear(),
    month: 9,
    semester: 2,
    count: 0
  }
})

// 计算属性
// const currentUser = computed(() => userStore.user || { name: '管理员', role: 'admin' })

// 获取时间问候语
// const getCurrentTimeGreeting = () => {
//   const hour = new Date().getHours()
//   if (hour < 12) return '早上好'
//   if (hour < 18) return '下午好'
//   return '晚上好'
// }

// 格式化时间
const formatTime = (date?: Date) => {
  if (!date) return '无截止时间'
  return new Date(date).toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取待办事项状态类型
const getTodoStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': 'warning',
    'in_progress': 'primary',
    'completed': 'success',
    'cancelled': 'info'
  }
  return statusMap[status] || 'info'
}

// 获取待办事项状态文本
const getTodoStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': '待处理',
    'in_progress': '进行中',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return statusMap[status] || '未知'
}

// 获取仪表盘数据
const fetchDashboardData = async () => {
  try {
    loading.value = true

    // 并行获取数据
    const [statsRes, todoRes, graduationRes, preEnrollmentRes] = await Promise.all([
      dashboardApi.getDashboardStats(),
      dashboardApi.getTodos({ page: 1, pageSize: 5 }),
      dashboardApi.getGraduationStats(),
      dashboardApi.getPreEnrollmentStats()
    ])

    if (statsRes.success && statsRes.data) {
      dashboardStats.value = statsRes.data
    }

    // 处理待办事项数据
    if (todoRes.success && todoRes.data) {
      todoList.value = todoRes.data.items || []
    }

    // 获取毕业统计数据
    if (graduationRes.success && graduationRes.data) {
      graduationStats.value = graduationRes.data
    }

    // 获取预报名统计数据
    if (preEnrollmentRes.success && preEnrollmentRes.data) {
      preEnrollmentStats.value = preEnrollmentRes.data
    }

  } catch (error) {
    console.error('获取仪表盘数据失败:', error)
    ElMessage.error('获取仪表盘数据失败')
  } finally {
    loading.value = false
  }
}

// 刷新所有数据
// const refreshAllData = async () => {
//   refreshing.value = true
//   try {
//     await fetchDashboardData()
//     ElMessage.success('数据刷新成功')
//   } catch (error) {
//     ElMessage.error('数据刷新失败')
//   } finally {
//     refreshing.value = false
//   }
// }

// 导航到中心
const navigateToCenter = (path: string) => {
  router.push(path)
}

// 处理快速操作
const handleQuickAction = (command: string) => {
  switch (command) {
    case 'add-student':
      // 跳转到学生管理页面
      router.push('/student')
      break
    case 'add-teacher':
      // 跳转到教师管理页面
      router.push('/teacher')
      break
    case 'create-activity':
      // 跳转到活动管理页面
      router.push('/activity')
      break
    case 'send-notice':
      // 跳转到通知管理页面
      router.push('/notifications')
      break
  }
}

// 处理待办事项点击
const handleTodoClick = (todo: Todo) => {
  // 跳转到待办事项页面，并带上id参数
  router.push({ path: '/todo', query: { id: todo.id.toString() } })
}

// 查看所有待办事项
const viewAllTodos = () => {
  router.push('/todo')
}

// 组件挂载
onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

.dashboard-center {
  // 统计卡片网格布局
  .stats-section {
    margin-bottom: var(--spacing-xl);
    
    .stats-grid-unified {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--spacing-lg);
      
      // 响应式布局
      @media (max-width: 1400px) {
        grid-template-columns: repeat(2, 1fr);
      }
      
      @media (max-width: var(--breakpoint-md)) {
        grid-template-columns: 1fr;
      }
    }
  }

  .welcome-banner {
    background: var(--gradient-primary);
    border-radius: var(--radius-xl);
    color: #ffffff;
    padding: var(--spacing-3xl);
    margin-bottom: var(--spacing-xl);
    display: flex;
    justify-content: space-between;
    align-items: center;

    .welcome-content {
      h2 {
        margin: 0 0 var(--spacing-sm) 0;
        font-size: var(--text-2xl);
        font-weight: 600;
      }

      p {
        margin: 0;
        opacity: 0.9;
        font-size: var(--text-base);
      }
    }

    .welcome-stats {
      display: flex;
      gap: var(--spacing-xl);

      .stat-item {
        text-align: center;

        .stat-value {
          font-size: var(--text-3xl);
          font-weight: 700;
          margin-bottom: var(--spacing-xs);
        }

        .stat-label {
          font-size: var(--text-sm);
          opacity: 0.8;
        }
      }
    }
  }

  .centers-section {
    margin-bottom: var(--spacing-xl);

    .centers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--spacing-lg);

      .center-card {
        background: var(--bg-primary);
        border: 1px solid var(--border-light);
        border-radius: var(--radius-lg);
        padding: var(--spacing-lg);
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: var(--spacing-md);

        &:hover {
          border-color: var(--primary-color);
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }

        .center-icon {
          width: var(--icon-md, 48px); height: var(--icon-md, 48px);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-3xl);

          &.enrollment {
            background: var(--primary-light-bg);
            color: var(--primary-color);
          }

          &.teaching {
            background: var(--success-light-bg);
            color: var(--success-color);
          }

          &.activity {
            background: var(--warning-light-bg);
            color: var(--warning-color);
          }

          &.finance {
            background: var(--info-light-bg);
            color: var(--info-color);
          }

          &.marketing {
            background: var(--danger-light-bg);
            color: var(--danger-color);
          }

          &.ai {
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-marketing, #8B5CF6) 100%);
            color: #ffffff;
          }
        }

        .center-info {
          flex: 1;

          h4 {
            margin: 0 0 var(--spacing-xs) 0;
            font-size: var(--text-lg);
            font-weight: 600;
            color: var(--text-primary);
          }

          p {
            margin: 0;
            font-size: var(--text-sm);
            color: var(--text-secondary);
          }
        }

        .center-arrow {
          color: var(--text-tertiary);
          transition: transform 0.3s ease;
        }

        &:hover .center-arrow {
          transform: translateX(var(--spacing-xs));
        }
      }
    }
  }

  .quick-todo-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-xl);

    .quick-actions {
      .actions-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--spacing-md);

        .action-item {
          background: var(--bg-primary);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          padding: var(--spacing-md);
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-sm);
          text-align: center;

          &:hover {
            border-color: var(--primary-color);
            box-shadow: var(--shadow-sm);
          }

          .action-icon {
            width: var(--icon-md, 48px); height: var(--icon-md, 48px);
            border-radius: var(--radius-md);
            background: var(--primary-light-bg);
            color: var(--primary-color);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: var(--text-2xl);
          }

          span {
            font-size: var(--text-sm);
            color: var(--text-primary);
          }
        }
      }
    }

    .todo-section {
      .todo-list {
        background: var(--bg-primary);
        border: 1px solid var(--border-light);
        border-radius: var(--radius-md);
        padding: var(--spacing-md);

        .todo-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-sm) 0;
          cursor: pointer;
          border-bottom: 1px solid var(--border-color-lighter);
          transition: background-color 0.3s ease;

          &:last-child {
            border-bottom: none;
          }

          &:hover {
            background: var(--bg-secondary);
            margin: 0 calc(-1 * var(--spacing-md));
            padding-left: var(--spacing-md);
            padding-right: var(--spacing-md);
            border-radius: var(--radius-sm);
          }

          .todo-content {
            .todo-title {
              font-size: var(--text-sm);
              color: var(--text-primary);
              margin-bottom: var(--spacing-xs);
            }

            .todo-time {
              font-size: var(--text-xs);
              color: var(--text-tertiary);
            }
          }
        }

        .empty-todo, .loading-placeholder {
          padding: var(--spacing-lg);
          text-align: center;
        }
      }
    }
  }
}

// 🎯 增强的响应式设计
@media (max-width: var(--breakpoint-2xl)) {
  .dashboard-center {
    .centers-section .centers-grid {
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    }
  }
}

@media (max-width: var(--breakpoint-xl)) {
  .dashboard-center {
    .quick-todo-section {
      grid-template-columns: 1fr;
      gap: var(--spacing-lg);
    }

    .welcome-banner {
      .welcome-stats {
        gap: var(--spacing-lg);
      }
    }
  }
}

@media (max-width: var(--breakpoint-lg)) {
  .dashboard-center {
    .welcome-banner {
      padding: var(--spacing-xl);

      .welcome-stats {
        flex-direction: column;
        gap: var(--spacing-md);
        text-align: center;
      }
    }

    .centers-section {
      .centers-grid {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: var(--spacing-md);
      }
    }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .dashboard-center {
    .welcome-banner {
      flex-direction: column;
      text-align: center;
      padding: var(--spacing-lg);
      gap: var(--spacing-lg);

      .welcome-content {
        h2 {
          font-size: var(--text-xl);
        }
      }

      .welcome-stats {
        width: 100%;
        justify-content: space-around;

        .stat-item {
          .stat-value {
            font-size: var(--text-2xl);
          }
        }
      }
    }

    .centers-section {
      .centers-grid {
        grid-template-columns: 1fr;
        gap: var(--spacing-md);
      }
    }

    .quick-todo-section {
      .quick-actions {
        .actions-grid {
          grid-template-columns: 1fr;
        }
      }
    }
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .dashboard-center {
    .welcome-banner {
      padding: var(--spacing-md);

      .welcome-content {
        h2 {
          font-size: var(--text-lg);
        }

        p {
          font-size: var(--text-sm);
        }
      }

      .welcome-stats {
        .stat-item {
          .stat-value {
            font-size: var(--text-xl);
          }

          .stat-label {
            font-size: var(--text-xs);
          }
        }
      }
    }

    .centers-section {
      .center-card {
        padding: var(--spacing-md);

        .center-icon {
          width: var(--icon-md, 48px); height: var(--icon-md, 48px);
          font-size: var(--text-2xl);
        }

        .center-info h4 {
          font-size: var(--text-base);
        }

        .center-info p {
          font-size: var(--text-sm);
        }
      }
    }

    .quick-todo-section {
      .quick-actions {
        .actions-grid {
          gap: var(--spacing-sm);

          .action-item {
            padding: var(--spacing-sm);

            .action-icon {
              width: var(--icon-md, 48px); height: var(--icon-md, 48px);
              font-size: var(--text-xl);
            }

            span {
              font-size: var(--text-xs);
            }
          }
        }
      }
    }
  }
}
</style>