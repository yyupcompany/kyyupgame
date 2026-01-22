<template>
  <MobileCenterLayout title="督查中心" back-path="/mobile/centers">
    <template #right>
      <van-icon name="plus" size="20" @click="handleCreate" />
    </template>

    <div class="inspection-center-mobile">
      <!-- 统计卡片 -->
      <div class="stats-section">
        <van-grid :column-num="2" :gutter="12">
          <van-grid-item v-for="stat in statsData" :key="stat.key" class="stat-card">
            <div class="stat-content">
              <van-icon :name="stat.icon" :color="stat.color" size="24" />
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 快捷功能 -->
      <div class="quick-actions">
        <div class="section-title">快捷功能</div>
        <van-grid :column-num="4" :gutter="8">
          <van-grid-item v-for="action in quickActions" :key="action.key" @click="handleAction(action.key)">
            <van-icon :name="action.icon" :color="action.color" size="24" />
            <span class="action-label">{{ action.label }}</span>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 标签页 -->
      <van-tabs v-model:active="activeTab" sticky offset-top="46">
        <!-- 检查任务 -->
        <van-tab title="检查任务" name="tasks">
          <div class="tab-content">
            <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
              <van-list
                v-model:loading="loading"
                :finished="finished"
                finished-text="没有更多了"
                @load="onLoad"
              >
                <div v-if="tasks.length === 0 && !loading" class="empty-state">
                  <van-empty description="暂无检查任务" />
                </div>
                <div v-for="item in tasks" :key="item.id" class="task-card" @click="viewTask(item)">
                  <div class="card-header">
                    <div class="card-title">{{ item.name }}</div>
                    <van-tag size="medium" :type="getStatusType(item.status)">
                      {{ getStatusLabel(item.status) }}
                    </van-tag>
                  </div>
                  <div class="card-content">
                    <div class="info-row">
                      <van-icon name="clock-o" size="14" />
                      <span>{{ item.scheduledDate }}</span>
                    </div>
                    <div class="info-row">
                      <van-icon name="location-o" size="14" />
                      <span>{{ item.location }}</span>
                    </div>
                    <div class="info-row">
                      <van-icon name="user-o" size="14" />
                      <span>{{ item.inspector }}</span>
                    </div>
                  </div>
                  <div class="card-actions">
                    <van-button size="medium" type="primary" plain @click.stop="startInspection(item)">
                      开始检查
                    </van-button>
                    <van-button size="medium" plain @click.stop="viewDetail(item)">
                      查看详情
                    </van-button>
                  </div>
                </div>
              </van-list>
            </van-pull-refresh>
          </div>
        </van-tab>

        <!-- 检查记录 -->
        <van-tab title="检查记录" name="records">
          <div class="tab-content">
            <div class="record-list">
              <div v-for="item in records" :key="item.id" class="record-card" @click="viewRecord(item)">
                <div class="record-header">
                  <div class="record-title">{{ item.name }}</div>
                  <div class="record-score" :class="getScoreClass(item.score)">{{ item.score }}分</div>
                </div>
                <div class="record-meta">
                  <span>{{ item.date }}</span>
                  <span>{{ item.inspector }}</span>
                </div>
                <div class="record-issues" v-if="item.issueCount > 0">
                  <van-icon name="warning-o" color="#f59e0b" size="14" />
                  <span>发现 {{ item.issueCount }} 个问题</span>
                </div>
              </div>
              <van-empty v-if="records.length === 0" description="暂无检查记录" />
            </div>
          </div>
        </van-tab>
      </van-tabs>
    </div>
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'

const router = useRouter()

// 状态
const activeTab = ref('tasks')
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

// 数据
const tasks = ref<any[]>([])
const records = ref<any[]>([])

// 统计数据
const statsData = reactive([
  { key: 'pending', label: '待检查', value: 5, icon: 'todo-list-o', color: '#f59e0b' },
  { key: 'completed', label: '已完成', value: 28, icon: 'passed', color: '#10b981' },
  { key: 'issues', label: '待整改', value: 3, icon: 'warning-o', color: '#ef4444' },
  { key: 'score', label: '平均分', value: 92, icon: 'star-o', color: '#6366f1' }
])

// 快捷操作
const quickActions = [
  { key: 'create', label: '新建任务', icon: 'add-o', color: '#6366f1' },
  { key: 'scan', label: '扫码检查', icon: 'scan', color: '#10b981' },
  { key: 'report', label: '生成报告', icon: 'description', color: '#f59e0b' },
  { key: 'stats', label: '数据统计', icon: 'chart-trending-o', color: '#3b82f6' }
]

// 初始化
onMounted(() => {
  loadTasks()
  loadRecords()
})

// 加载任务
const loadTasks = async () => {
  loading.value = true
  tasks.value = [
    { id: 1, name: '食堂卫生安全检查', status: 'pending', scheduledDate: '2026-01-08 09:00', location: '食堂', inspector: '王园长' },
    { id: 2, name: '消防设施检查', status: 'in_progress', scheduledDate: '2026-01-07 14:00', location: '全园', inspector: '安全主管' },
    { id: 3, name: '教室环境检查', status: 'completed', scheduledDate: '2026-01-06 10:00', location: '各班教室', inspector: '教务主任' }
  ]
  loading.value = false
  finished.value = true
}

// 加载记录
const loadRecords = async () => {
  records.value = [
    { id: 1, name: '教室环境检查', date: '2026-01-06', inspector: '教务主任', score: 95, issueCount: 1 },
    { id: 2, name: '户外设施安全检查', date: '2026-01-05', inspector: '安全主管', score: 88, issueCount: 3 },
    { id: 3, name: '食品安全检查', date: '2026-01-03', inspector: '后勤主管', score: 98, issueCount: 0 }
  ]
}

// 刷新
const onRefresh = async () => {
  await Promise.all([loadTasks(), loadRecords()])
  refreshing.value = false
}

const onLoad = () => { finished.value = true }

// 状态映射
const getStatusType = (status: string) => {
  const map: Record<string, string> = { pending: 'warning', in_progress: 'primary', completed: 'success' }
  return map[status] || 'default'
}

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = { pending: '待检查', in_progress: '进行中', completed: '已完成' }
  return map[status] || '未知'
}

const getScoreClass = (score: number) => {
  if (score >= 90) return 'score-high'
  if (score >= 70) return 'score-medium'
  return 'score-low'
}

// 操作
const handleCreate = () => showToast('新建检查任务')
const handleAction = (key: string) => showToast(`执行${key}操作`)
const viewTask = (item: any) => showToast(`查看任务: ${item.name}`)
const viewDetail = (item: any) => showToast(`查看详情: ${item.name}`)
const startInspection = (item: any) => showToast(`开始检查: ${item.name}`)
const viewRecord = (item: any) => showToast(`查看记录: ${item.name}`)
</script>

<style scoped lang="scss">
@import '@/styles/mixins/responsive-mobile.scss';


.inspection-center-mobile {
  min-height: 100vh;
  background: var(--van-background-2);
}

.stats-section {
  padding: 12px;
}

.stat-card {
  :deep(.van-grid-item__content) {
    padding: 12px;
    background: var(--van-background);
    border-radius: 8px;
  }
}

.stat-content {
  text-align: center;
  
  .stat-value {
    font-size: 22px;
    font-weight: 600;
    color: var(--van-text-color);
    margin: 6px 0 2px;
  }
  
  .stat-label {
    font-size: 12px;
    color: var(--van-text-color-2);
  }
}

.quick-actions {
  padding: 12px;
  background: var(--van-background);
  margin: 0 12px 12px;
  border-radius: 8px;
  
  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--van-text-color);
    margin-bottom: 12px;
  }
  
  .action-label {
    font-size: 11px;
    color: var(--van-text-color-2);
    margin-top: 4px;
  }
}

.tab-content {
  padding: 12px;
}

.task-card,
.record-card {
  background: var(--van-background);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  
  .card-header,
  .record-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    
    .card-title,
    .record-title {
      font-size: 15px;
      font-weight: 500;
      color: var(--van-text-color);
    }
    
    .record-score {
      font-size: 18px;
      font-weight: 600;
      
      &.score-high { color: #10b981; }
      &.score-medium { color: #f59e0b; }
      &.score-low { color: #ef4444; }
    }
  }
  
  .card-content {
    margin-bottom: 10px;
    
    .info-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--van-text-color-2);
      margin-bottom: 6px;
    }
  }
  
  .record-meta {
    font-size: 12px;
    color: var(--van-text-color-3);
    margin-bottom: 8px;
    
    span + span {
      margin-left: 12px;
    }
  }
  
  .record-issues {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #f59e0b;
    padding-top: 8px;
    border-top: 1px solid var(--van-border-color);
  }
  
  .card-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    padding-top: 10px;
    border-top: 1px solid var(--van-border-color);
  }
}

.empty-state {
  padding: 40px 0;
}
</style>
