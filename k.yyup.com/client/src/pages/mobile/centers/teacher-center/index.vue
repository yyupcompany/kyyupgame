<template>
  <MobileSubPageLayout title="教师中心" back-path="/mobile/centers">
    <div class="mobile-teacher-center">
      <!-- 教师信息卡片 -->
      <div class="teacher-card">
        <div class="teacher-avatar">
          <van-icon name="manager-o" size="48" color="#1677ff" />
        </div>
        <div class="teacher-info">
          <div class="teacher-name">{{ teacherInfo.name }}</div>
          <div class="teacher-role">{{ teacherInfo.role }}</div>
          <div class="teacher-class">负责班级：{{ teacherInfo.classes.join('、') }}</div>
        </div>
        <van-icon name="arrow" color="#999" @click="goToProfile" />
      </div>

      <!-- 快捷统计 -->
      <div class="quick-stats">
        <div class="stat-item" @click="goTo('/mobile/teacher-center/tasks')">
          <div class="stat-value">{{ stats.pendingTasks }}</div>
          <div class="stat-label">待办任务</div>
        </div>
        <div class="stat-item" @click="goTo('/mobile/teacher-center/activities')">
          <div class="stat-value">{{ stats.todayActivities }}</div>
          <div class="stat-label">今日活动</div>
        </div>
        <div class="stat-item" @click="goTo('/mobile/teacher-center/notifications')">
          <div class="stat-value">{{ stats.unreadNotifications }}</div>
          <div class="stat-label">未读通知</div>
        </div>
        <div class="stat-item" @click="goTo('/mobile/teacher-center/attendance')">
          <div class="stat-value">{{ stats.todayAttendance }}%</div>
          <div class="stat-label">出勤率</div>
        </div>
      </div>

      <!-- 常用功能 -->
      <div class="section">
        <div class="section-title">常用功能</div>
        <div class="function-grid">
          <div class="function-item" @click="goTo('/mobile/teacher-center/tasks')">
            <div class="function-icon" style="background: linear-gradient(135deg, #1677ff, #69b1ff)">
              <van-icon name="todo-list-o" size="24" color="#fff" />
            </div>
            <div class="function-name">任务管理</div>
          </div>
          <div class="function-item" @click="goTo('/mobile/teacher-center/activities')">
            <div class="function-icon" style="background: linear-gradient(135deg, #52c41a, #95de64)">
              <van-icon name="calendar-o" size="24" color="#fff" />
            </div>
            <div class="function-name">活动管理</div>
          </div>
          <div class="function-item" @click="goTo('/mobile/teacher-center/attendance')">
            <div class="function-icon" style="background: linear-gradient(135deg, #faad14, #ffd666)">
              <van-icon name="clock-o" size="24" color="#fff" />
            </div>
            <div class="function-name">考勤管理</div>
          </div>
          <div class="function-item" @click="goTo('/mobile/teacher-center/notifications')">
            <div class="function-icon" style="background: linear-gradient(135deg, #ff4d4f, #ff7875)">
              <van-icon name="bell" size="24" color="#fff" />
            </div>
            <div class="function-name">通知中心</div>
          </div>
        </div>
      </div>

      <!-- 教学工作 -->
      <div class="section">
        <div class="section-title">教学工作</div>
        <div class="function-grid">
          <div class="function-item" @click="goTo('/mobile/teacher-center/teaching')">
            <div class="function-icon" style="background: linear-gradient(135deg, #722ed1, #b37feb)">
              <van-icon name="notes-o" size="24" color="#fff" />
            </div>
            <div class="function-name">课程跟踪</div>
          </div>
          <div class="function-item" @click="goTo('/mobile/teacher-center/creative-curriculum')">
            <div class="function-icon" style="background: linear-gradient(135deg, #13c2c2, #5cdbd3)">
              <van-icon name="bulb-o" size="24" color="#fff" />
            </div>
            <div class="function-name">创意课程</div>
          </div>
          <div class="function-item" @click="goTo('/mobile/teacher-center/class-contacts')">
            <div class="function-icon" style="background: linear-gradient(135deg, #eb2f96, #ff85c0)">
              <van-icon name="friends-o" size="24" color="#fff" />
            </div>
            <div class="function-name">班级通讯</div>
          </div>
          <div class="function-item" @click="goTo('/mobile/teacher-center/dashboard')">
            <div class="function-icon" style="background: linear-gradient(135deg, #2f54eb, #85a5ff)">
              <van-icon name="bar-chart-o" size="24" color="#fff" />
            </div>
            <div class="function-name">工作台</div>
          </div>
        </div>
      </div>

      <!-- 招生与业绩 -->
      <div class="section">
        <div class="section-title">招生与业绩</div>
        <div class="function-grid">
          <div class="function-item" @click="goTo('/mobile/teacher-center/enrollment')">
            <div class="function-icon" style="background: linear-gradient(135deg, #fa541c, #ff7a45)">
              <van-icon name="user-o" size="24" color="#fff" />
            </div>
            <div class="function-name">招生中心</div>
          </div>
          <div class="function-item" @click="goTo('/mobile/teacher-center/customer-tracking')">
            <div class="function-icon" style="background: linear-gradient(135deg, #a0d911, #d3f261)">
              <van-icon name="guide-o" size="24" color="#fff" />
            </div>
            <div class="function-name">客户跟踪</div>
          </div>
          <div class="function-item" @click="goTo('/mobile/teacher-center/customer-pool')">
            <div class="function-icon" style="background: linear-gradient(135deg, #1890ff, #40a9ff)">
              <van-icon name="orders-o" size="24" color="#fff" />
            </div>
            <div class="function-name">客户池</div>
          </div>
          <div class="function-item" @click="goTo('/mobile/teacher-center/performance-rewards')">
            <div class="function-icon" style="background: linear-gradient(135deg, #f5222d, #ff4d4f)">
              <van-icon name="gold-coin-o" size="24" color="#fff" />
            </div>
            <div class="function-name">业绩奖励</div>
          </div>
        </div>
      </div>

      <!-- 快捷操作 -->
      <div class="section">
        <div class="section-title">快捷操作</div>
        <van-cell-group inset>
          <van-cell title="发布通知" icon="volume-o" is-link @click="handleQuickAction('notification')" />
          <van-cell title="创建任务" icon="add-o" is-link @click="handleQuickAction('task')" />
          <van-cell title="记录考勤" icon="clock-o" is-link @click="handleQuickAction('attendance')" />
          <van-cell title="联系家长" icon="phone-o" is-link @click="handleQuickAction('contact')" />
        </van-cell-group>
      </div>
    </div>
  </MobileSubPageLayout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import MobileSubPageLayout from '@/components/mobile/layouts/MobileSubPageLayout.vue'

const router = useRouter()

// 教师信息
const teacherInfo = reactive({
  name: '李老师',
  role: '主班老师',
  classes: ['小班一班', '中班二班']
})

// 统计数据
const stats = reactive({
  pendingTasks: 5,
  todayActivities: 2,
  unreadNotifications: 8,
  todayAttendance: 96
})

const goTo = (path: string) => {
  router.push(path)
}

const goToProfile = () => {
  showToast('个人资料页面')
}

const handleQuickAction = (action: string) => {
  const actionMap: Record<string, string> = {
    notification: '/mobile/teacher-center/notifications',
    task: '/mobile/teacher-center/tasks/create',
    attendance: '/mobile/teacher-center/attendance',
    contact: '/mobile/teacher-center/class-contacts'
  }
  if (actionMap[action]) {
    router.push(actionMap[action])
  } else {
    showToast('功能开发中')
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/mixins/responsive-mobile.scss';


.mobile-teacher-center {
  /* Layout removed - handled by MobileSubPageLayout */
}

.teacher-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: linear-gradient(135deg, #1677ff, #4096ff);
  margin: 12px;
  padding: 20px;
  border-radius: 12px;
  color: #fff;

  .teacher-avatar {
    width: 64px;
    height: 64px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .teacher-info {
    flex: 1;

    .teacher-name {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .teacher-role {
      font-size: 14px;
      opacity: 0.9;
      margin-bottom: 4px;
    }

    .teacher-class {
      font-size: 12px;
      opacity: 0.8;
    }
  }
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 0 12px;
  margin-bottom: 16px;

  .stat-item {
    background: #fff;
    border-radius: 8px;
    padding: 12px 8px;
    text-align: center;

    .stat-value {
      font-size: 20px;
      font-weight: bold;
      color: #1677ff;
    }

    .stat-label {
      font-size: 11px;
      color: #999;
      margin-top: 4px;
    }
  }
}

.section {
  margin-bottom: 16px;

  .section-title {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    padding: 12px 16px 8px;
  }
}

.function-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 0 12px;

  .function-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 12px 0;

    .function-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .function-name {
      font-size: 12px;
      color: #333;
    }
  }
}
</style>
