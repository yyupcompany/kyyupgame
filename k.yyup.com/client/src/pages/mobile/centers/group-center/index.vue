<template>
  <MobileMainLayout
    title="集团中心"
    :show-back="false"
    :show-footer="true"
  >
    <div class="group-center">
      <!-- 集团概览 -->
      <div class="overview-section">
        <van-cell-group inset>
          <div class="overview-header">
            <van-icon name="building-o" size="20" />
            <span class="overview-title">集团概览</span>
          </div>
        </van-cell-group>

        <div class="overview-cards">
          <div class="overview-card primary">
            <div class="card-value">{{ groupOverview.totalKindergartens }}</div>
            <div class="card-label">园区总数</div>
          </div>
          <div class="overview-card success">
            <div class="card-value">{{ groupOverview.totalStudents }}</div>
            <div class="card-label">在园学生</div>
          </div>
          <div class="overview-card warning">
            <div class="card-value">{{ groupOverview.totalTeachers }}</div>
            <div class="card-label">教职工数</div>
          </div>
          <div class="overview-card info">
            <div class="card-value">{{ groupOverview.totalClasses }}</div>
            <div class="card-label">班级总数</div>
          </div>
        </div>
      </div>

      <!-- 园区列表 -->
      <div class="kindergartens-section">
        <div class="section-header">
          <van-icon name="shop-o" />
          <span class="section-title">园区管理</span>
        </div>

        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <van-list
            v-model:loading="loading"
            :finished="finished"
            finished-text="没有更多了"
            @load="onLoad"
          >
            <div
              v-for="kindergarten in kindergartens"
              :key="kindergarten.id"
              class="kindergarten-card"
              @click="handleKindergartenClick(kindergarten)"
            >
              <div class="card-header">
                <div class="kindergarten-name">{{ kindergarten.name }}</div>
                <van-tag
                  :type="getStatusType(kindergarten.status)"
                  size="small"
                >
                  {{ kindergarten.statusText }}
                </van-tag>
              </div>

              <div class="card-stats">
                <div class="stat-item">
                  <van-icon name="friends-o" size="14" />
                  <span>学生: {{ kindergarten.studentCount }}</span>
                </div>
                <div class="stat-item">
                  <van-icon name="manager-o" size="14" />
                  <span>教师: {{ kindergarten.teacherCount }}</span>
                </div>
                <div class="stat-item">
                  <van-icon name="home-o" size="14" />
                  <span>班级: {{ kindergarten.classCount }}</span>
                </div>
              </div>

              <div class="card-footer">
                <span class="update-time">{{ kindergarten.updateTime }}</span>
                <van-icon name="arrow" />
              </div>
            </div>
          </van-list>
        </van-pull-refresh>
      </div>

      <!-- 集团统计 -->
      <div class="statistics-section">
        <div class="section-header">
          <van-icon name="chart-trending-o" />
          <span class="section-title">数据统计</span>
        </div>

        <div class="chart-container">
          <div class="chart-card">
            <h4 class="chart-title">学生增长趋势</h4>
            <div class="chart-placeholder">
              <van-icon name="bar-chart-o" size="48" />
              <p>学生数量变化趋势</p>
              <small>数据加载中...</small>
            </div>
          </div>

          <div class="chart-card">
            <h4 class="chart-title">园区分布</h4>
            <div class="chart-placeholder">
              <van-icon name="location-o" size="48" />
              <p>各区域园区分布情况</p>
              <small>数据加载中...</small>
            </div>
          </div>
        </div>
      </div>

      <!-- 快速操作 -->
      <div class="actions-section">
        <div class="section-header">
          <van-icon name="setting-o" />
          <span class="section-title">快速操作</span>
        </div>

        <van-grid :column-num="2" :gutter="12">
          <van-grid-item
            v-for="action in quickActions"
            :key="action.key"
            @click="handleQuickAction(action.key)"
          >
            <div class="action-card">
              <van-icon :name="action.icon" size="24" />
              <span class="action-title">{{ action.title }}</span>
            </div>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 底部间距 -->
      <div class="bottom-spacer"></div>
    </div>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'

const router = useRouter()

// 集团概览数据
const groupOverview = reactive({
  totalKindergartens: 12,
  totalStudents: 3456,
  totalTeachers: 234,
  totalClasses: 89
})

// 园区列表数据
const kindergartens = ref([
  {
    id: 1,
    name: '阳光幼儿园',
    status: 'active',
    statusText: '正常运营',
    studentCount: 456,
    teacherCount: 32,
    classCount: 12,
    updateTime: '2025-01-05'
  },
  {
    id: 2,
    name: '快乐童年幼儿园',
    status: 'active',
    statusText: '正常运营',
    studentCount: 389,
    teacherCount: 28,
    classCount: 10,
    updateTime: '2025-01-05'
  },
  {
    id: 3,
    name: '新星幼儿园',
    status: 'warning',
    statusText: '待审核',
    studentCount: 234,
    teacherCount: 18,
    classCount: 6,
    updateTime: '2025-01-04'
  }
])

// 快速操作
const quickActions = ref([
  { key: 'add-kindergarten', title: '添加园区', icon: 'add-o' },
  { key: 'batch-import', title: '批量导入', icon: 'upgrade' },
  { key: 'data-export', title: '数据导出', icon: 'down' },
  { key: 'settings', title: '集团设置', icon: 'setting-o' }
])

// 加载状态
const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)

// 获取状态标签类型
function getStatusType(status: string): string {
  const typeMap: Record<string, string> = {
    'active': 'success',
    'warning': 'warning',
    'error': 'danger'
  }
  return typeMap[status] || 'default'
}

// 点击园区卡片
function handleKindergartenClick(kindergarten: any) {
  showToast(`查看 ${kindergarten.name} 详情`)
}

// 快速操作
function handleQuickAction(action: string) {
  switch (action) {
    case 'add-kindergarten':
      showToast('添加新园区')
      break
    case 'batch-import':
      showToast('批量导入数据')
      break
    case 'data-export':
      showToast('导出集团数据')
      break
    case 'settings':
      showToast('集团设置')
      break
  }
}

// 下拉刷新
const onRefresh = () => {
  setTimeout(() => {
    refreshing.value = false
    showToast('刷新成功')
  }, 1000)
}

// 上拉加载
const onLoad = () => {
  setTimeout(() => {
    loading.value = false
    finished.value = true
  }, 1000)
}
</script>

<style lang="scss" scoped>
@import '@/styles/design-tokens.scss';

.group-center {
  min-height: 100vh;
  padding: var(--app-gap);
  background: var(--bg-color-page);

  // 概览区域
  .overview-section {
    margin-bottom: var(--app-gap);

    .overview-header {
      display: flex;
      align-items: center;
      gap: var(--app-gap-sm);
      padding: var(--app-gap);

      .overview-title {
        font-size: var(--text-lg);
        font-weight: var(--font-semibold);
        color: var(--text-primary);
      }
    }

    .overview-cards {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--app-gap-sm);
      padding: 0 var(--app-gap);

      .overview-card {
        background: var(--bg-color);
        border-radius: var(--border-radius-md);
        padding: var(--app-gap);
        text-align: center;
        box-shadow: var(--shadow-sm);

        .card-value {
          font-size: var(--text-2xl);
          font-weight: var(--font-bold);
          margin-bottom: var(--app-gap-xs);
        }

        .card-label {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }

        &.primary .card-value { color: var(--primary-color); }
        &.success .card-value { color: var(--success-color); }
        &.warning .card-value { color: var(--warning-color); }
        &.info .card-value { color: var(--info-color); }
      }
    }
  }

  // 区域标题
  .section-header {
    display: flex;
    align-items: center;
    gap: var(--app-gap-sm);
    margin-bottom: var(--app-gap-sm);
    padding: 0 var(--app-gap);

    .section-title {
      font-size: var(--text-base);
      font-weight: var(--font-medium);
      color: var(--text-primary);
    }
  }

  // 园区列表
  .kindergartens-section {
    margin-bottom: var(--app-gap);

    .kindergarten-card {
      background: var(--bg-color);
      border-radius: var(--border-radius-md);
      padding: var(--app-gap);
      margin-bottom: var(--app-gap-sm);
      box-shadow: var(--shadow-sm);
      cursor: pointer;

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--app-gap);

        .kindergarten-name {
          font-size: var(--text-base);
          font-weight: var(--font-medium);
          color: var(--text-primary);
        }
      }

      .card-stats {
        display: flex;
        gap: var(--app-gap);
        margin-bottom: var(--app-gap-sm);

        .stat-item {
          display: flex;
          align-items: center;
          gap: var(--app-gap-xs);
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }
      }

      .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: var(--app-gap-sm);
        border-top: 1px solid var(--border-color-light);

        .update-time {
          font-size: var(--text-xs);
          color: var(--text-tertiary);
        }
      }
    }
  }

  // 统计图表
  .statistics-section {
    margin-bottom: var(--app-gap);

    .chart-container {
      padding: 0 var(--app-gap);

      .chart-card {
        background: var(--bg-color);
        border-radius: var(--border-radius-md);
        padding: var(--app-gap);
        margin-bottom: var(--app-gap-sm);
        box-shadow: var(--shadow-sm);

        .chart-title {
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
          color: var(--text-primary);
          margin-bottom: var(--app-gap);
        }

        .chart-placeholder {
          text-align: center;
          padding: var(--app-gap-xl) 0;

          p {
            margin: var(--app-gap) 0 var(--app-gap-xs);
            color: var(--text-secondary);
          }

          small {
            color: var(--text-tertiary);
          }
        }
      }
    }
  }

  // 快速操作
  .actions-section {
    margin-bottom: var(--app-gap);

    .action-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--app-gap-sm);
      padding: var(--app-gap);
      background: var(--bg-color);
      border-radius: var(--border-radius-md);
      box-shadow: var(--shadow-sm);

      .action-title {
        font-size: var(--text-sm);
        color: var(--text-primary);
      }
    }
  }

  // 底部间距
  .bottom-spacer {
    height: var(--app-gap-xxl);
  }
}

// 暗黑模式适配
:global([data-theme="dark"]) {
  .group-center {
    .overview-card,
    .kindergarten-card,
    .chart-card,
    .action-card {
      background: var(--bg-color-dark);
    }
  }
}
</style>
