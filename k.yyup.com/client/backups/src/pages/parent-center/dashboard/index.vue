<template>
  <UnifiedCenterLayout
    title="家长工作台"
    :description="`欢迎回来，${parentName} - 孩子的成长，我们一起守护`"
    icon="User"
  >
    <template #stats>
      <StatCard
        title="我的孩子"
        :value="childrenCount"
        unit="个"
        icon-name="user"
        type="primary"
        clickable
        @click="goToChildren"
      />
      <StatCard
        title="测评记录"
        :value="assessmentCount"
        unit="次"
        icon-name="document"
        type="success"
      />
      <StatCard
        title="活动报名"
        :value="activityCount"
        unit="个"
        icon-name="calendar"
        type="warning"
        clickable
        @click="goToActivities"
      />
      <StatCard
        title="未读消息"
        :value="messageCount"
        unit="条"
        icon-name="message"
        type="danger"
        clickable
        @click="goToNotifications"
      />
    </template>

    <div class="main-content">
      <el-row :gutter="20">
        <!-- 左侧：最近活动 -->
        <el-col :span="12">
          <el-card class="content-card">
            <template #header>
              <div class="card-header">
                <span>最近活动</span>
                <el-button text type="primary" @click="goToActivities">查看更多</el-button>
              </div>
            </template>
            <div v-if="recentActivities.length > 0">
              <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
                <div class="activity-title">{{ activity.title }}</div>
                <div class="activity-time">{{ activity.time }}</div>
              </div>
            </div>
            <el-empty v-else description="暂无活动" />
          </el-card>
        </el-col>

        <!-- 右侧：最新通知 -->
        <el-col :span="12">
          <el-card class="content-card">
            <template #header>
              <div class="card-header">
                <span>最新通知</span>
                <el-button text type="primary" @click="goToNotifications">查看更多</el-button>
              </div>
            </template>
            <div v-if="recentNotifications.length > 0">
              <div v-for="notification in recentNotifications" :key="notification.id" class="notification-item">
                <div class="notification-title">{{ notification.title }}</div>
                <div class="notification-time">{{ notification.time }}</div>
              </div>
            </div>
            <el-empty v-else description="暂无通知" />
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: var(--text-2xl);">
        <!-- 孩子成长概览 -->
        <el-col :span="24">
          <el-card class="content-card">
            <template #header>
              <div class="card-header">
                <span>孩子成长概览</span>
                <el-button text type="primary" @click="goToChildren">管理孩子</el-button>
              </div>
            </template>
            <div v-if="children.length > 0" class="children-list">
              <div v-for="child in children" :key="child.id" class="child-card">
                <el-avatar :size="60" :src="child.avatar">{{ child.name.charAt(0) }}</el-avatar>
                <div class="child-info">
                  <div class="child-name">{{ child.name }}</div>
                  <div class="child-class">{{ child.className }}</div>
                </div>
                <el-button type="primary" size="small" @click="viewChildGrowth(child.id)">
                  查看成长
                </el-button>
              </div>
            </div>
            <el-empty v-else description="暂无孩子信息" />
          </el-card>
        </el-col>
      </el-row>
    </div>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { User, Document, Calendar, Message } from '@element-plus/icons-vue'
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'
import StatCard from '@/components/common/StatCard.vue'

const router = useRouter()

// 家长信息
const parentName = ref('家长')
const childrenCount = ref(0)
const assessmentCount = ref(0)
const activityCount = ref(0)
const messageCount = ref(0)

// 孩子列表
const children = ref<any[]>([])

// 最近活动
const recentActivities = ref<any[]>([])

// 最新通知
const recentNotifications = ref<any[]>([])

// 加载数据
const loadData = async () => {
  // TODO: 从API加载数据
  parentName.value = localStorage.getItem('user_name') || '家长'
  childrenCount.value = 2
  assessmentCount.value = 5
  activityCount.value = 3
  messageCount.value = 2

  children.value = [
    { id: 1, name: '张小明', className: '大班一班', avatar: '' },
    { id: 2, name: '张小红', className: '中班二班', avatar: '' }
  ]

  recentActivities.value = [
    { id: 1, title: '秋游活动', time: '2024-11-05 09:00' },
    { id: 2, title: '亲子运动会', time: '2024-11-10 14:00' }
  ]

  recentNotifications.value = [
    { id: 1, title: '明天停课通知', time: '2024-10-30 10:00' },
    { id: 2, title: '家长会通知', time: '2024-10-28 15:30' }
  ]
}

// 导航方法
const goToActivities = () => router.push('/parent-center/activities')
const goToNotifications = () => router.push('/parent-center/notifications')
const goToChildren = () => router.push('/parent-center/children')
const viewChildGrowth = (childId: number) => router.push(`/parent-center/children/growth/${childId}`)

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';

.parent-dashboard {
  .welcome-section {
    margin-bottom: var(--spacing-8xl);

    h1 {
      font-size: var(--text-3xl);
      font-weight: 600;
      color: var(--color-text-primary);
      margin-bottom: var(--spacing-2xl);
    }

    .subtitle {
      font-size: var(--text-base);
      color: var(--color-text-secondary);
    }
  }

  .quick-stats {
    margin-bottom: var(--text-2xl);

    .stat-card {
      display: flex;
      align-items: center;
      padding: var(--text-2xl);
      background: white;
      border-radius: var(--spacing-sm);
      box-shadow: 0 2px var(--text-sm) 0 var(--shadow-light);

      .stat-icon {
        margin-right: var(--text-2xl);
      }

      .stat-content {
        .stat-value {
          font-size: var(--spacing-3xl);
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1;
          margin-bottom: var(--spacing-sm);
        }

        .stat-label {
          font-size: var(--text-base);
          color: var(--info-color);
        }
      }
    }
  }

  .content-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .activity-item,
    .notification-item {
      padding: var(--text-sm) 0;
      border-bottom: var(--border-width-base) solid var(--border-color-lighter);

      &:last-child {
        border-bottom: none;
      }

      .activity-title,
      .notification-title {
        font-size: var(--text-base);
        color: var(--text-primary);
        margin-bottom: var(--spacing-lg);
      }

      .activity-time,
      .notification-time {
        font-size: var(--text-sm);
        color: var(--info-color);
      }
    }

    .children-list {
      display: flex;
      gap: var(--text-2xl);

      .child-card {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: var(--text-2xl);
        border: var(--border-width-base) solid var(--border-color-lighter);
        border-radius: var(--spacing-sm);

        .child-info {
          margin: var(--spacing-4xl) 0;
          text-align: center;

          .child-name {
            font-size: var(--text-lg);
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: var(--spacing-lg);
          }

          .child-class {
            font-size: var(--text-base);
            color: var(--info-color);
          }
        }
      }
    }
  }
}
</style>





