<template>
  <MobileCenterLayout title="评估中心" back-path="/mobile/centers">
    <template #right>
      <van-icon name="plus" size="20" @click="handleCreate" />
    </template>

    <div class="assessment-center-mobile">
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

      <!-- 评估类型 -->
      <div class="types-section">
        <div class="section-title">评估类型</div>
        <van-grid :column-num="4" :gutter="8">
          <van-grid-item v-for="type in assessmentTypes" :key="type.key" @click="selectType(type.key)">
            <div class="type-icon">{{ type.emoji }}</div>
            <span class="type-label">{{ type.label }}</span>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 标签页 -->
      <van-tabs v-model:active="activeTab" sticky offset-top="46">
        <!-- 待评估 -->
        <van-tab title="待评估" name="pending">
          <div class="tab-content">
            <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
              <van-list
                v-model:loading="loading"
                :finished="finished"
                finished-text="没有更多了"
                @load="onLoad"
              >
                <div v-if="pendingList.length === 0 && !loading" class="empty-state">
                  <van-empty description="暂无待评估项目" />
                </div>
                <div v-for="item in pendingList" :key="item.id" class="assessment-card" @click="startAssessment(item)">
                  <div class="card-header">
                    <div class="card-title">{{ item.name }}</div>
                    <van-tag size="medium" type="warning">待评估</van-tag>
                  </div>
                  <div class="card-content">
                    <div class="info-row">
                      <van-icon name="user-o" size="14" />
                      <span>{{ item.targetName }}</span>
                    </div>
                    <div class="info-row">
                      <van-icon name="label-o" size="14" />
                      <span>{{ item.type }}</span>
                    </div>
                    <div class="info-row">
                      <van-icon name="clock-o" size="14" />
                      <span>截止: {{ item.deadline }}</span>
                    </div>
                  </div>
                  <div class="card-actions">
                    <van-button size="medium" type="primary" @click.stop="startAssessment(item)">
                      开始评估
                    </van-button>
                  </div>
                </div>
              </van-list>
            </van-pull-refresh>
          </div>
        </van-tab>

        <!-- 已完成 -->
        <van-tab title="已完成" name="completed">
          <div class="tab-content">
            <div class="completed-list">
              <div v-for="item in completedList" :key="item.id" class="completed-card" @click="viewResult(item)">
                <div class="result-score" :class="getScoreClass(item.score)">{{ item.score }}</div>
                <div class="result-info">
                  <div class="result-name">{{ item.name }}</div>
                  <div class="result-meta">{{ item.targetName }} · {{ item.completedAt }}</div>
                </div>
                <van-icon name="arrow" color="#c0c4cc" />
              </div>
              <van-empty v-if="completedList.length === 0" description="暂无已完成评估" />
            </div>
          </div>
        </van-tab>
      </van-tabs>
    </div>
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { showToast } from 'vant'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'

// 状态
const activeTab = ref('pending')
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

// 数据
const pendingList = ref<any[]>([])
const completedList = ref<any[]>([])

// 统计数据
const statsData = reactive([
  { key: 'pending', label: '待评估', value: 8, icon: 'todo-list-o', color: '#f59e0b' },
  { key: 'completed', label: '已完成', value: 45, icon: 'passed', color: '#10b981' },
  { key: 'students', label: '已评学生', value: 120, icon: 'friends-o', color: '#6366f1' },
  { key: 'average', label: '平均分', value: 88, icon: 'star-o', color: '#3b82f6' }
])

// 评估类型
const assessmentTypes = [
  { key: 'development', label: '发展评估', emoji: '📈' },
  { key: 'behavior', label: '行为评估', emoji: '🎯' },
  { key: 'ability', label: '能力评估', emoji: '💪' },
  { key: 'health', label: '健康评估', emoji: '❤️' }
]

// 初始化
onMounted(() => {
  loadPendingList()
  loadCompletedList()
})

// 加载数据
const loadPendingList = async () => {
  loading.value = true
  pendingList.value = [
    { id: 1, name: '月度发展评估', targetName: '张小明', type: '发展评估', deadline: '2026-01-15' },
    { id: 2, name: '行为习惯评估', targetName: '李小红', type: '行为评估', deadline: '2026-01-10' }
  ]
  loading.value = false
  finished.value = true
}

const loadCompletedList = async () => {
  completedList.value = [
    { id: 3, name: '期末综合评估', targetName: '王小华', score: 95, completedAt: '2026-01-05' },
    { id: 4, name: '能力发展评估', targetName: '赵小强', score: 88, completedAt: '2026-01-03' }
  ]
}

// 刷新
const onRefresh = async () => {
  await loadPendingList()
  refreshing.value = false
}

const onLoad = () => { finished.value = true }

// 分数样式
const getScoreClass = (score: number) => {
  if (score >= 90) return 'score-high'
  if (score >= 70) return 'score-medium'
  return 'score-low'
}

// 操作
const handleCreate = () => showToast('创建评估')
const selectType = (key: string) => showToast(`选择${key}类型`)
const startAssessment = (item: any) => showToast(`开始评估: ${item.name}`)
const viewResult = (item: any) => showToast(`查看结果: ${item.name}`)
</script>

<style scoped lang="scss">
@import '@/styles/mixins/responsive-mobile.scss';


.assessment-center-mobile {
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

.types-section {
  padding: 0 12px 12px;
  
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--van-text-color);
    margin-bottom: 12px;
  }
  
  .type-icon {
    font-size: 24px;
    margin-bottom: 4px;
  }
  
  .type-label {
    font-size: 11px;
    color: var(--van-text-color-2);
  }
}

.tab-content {
  padding: 12px;
}

.assessment-card {
  background: var(--van-background);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    
    .card-title {
      font-size: 15px;
      font-weight: 500;
      color: var(--van-text-color);
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
  
  .card-actions {
    display: flex;
    justify-content: flex-end;
    padding-top: 10px;
    border-top: 1px solid var(--van-border-color);
  }
}

.completed-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--van-background);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  
  .result-score {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 600;
    color: #fff;
    
    &.score-high { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
    &.score-medium { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
    &.score-low { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
  }
  
  .result-info {
    flex: 1;
    
    .result-name {
      font-size: 15px;
      font-weight: 500;
      color: var(--van-text-color);
    }
    
    .result-meta {
      font-size: 12px;
      color: var(--van-text-color-3);
      margin-top: 4px;
    }
  }
}

.empty-state {
  padding: 40px 0;
}
</style>
