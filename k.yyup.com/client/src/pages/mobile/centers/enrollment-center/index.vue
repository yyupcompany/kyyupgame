<template>
  <MobileCenterLayout title="招生中心" back-path="/mobile/centers">
    <template #right>
      <van-icon name="plus" size="20" @click="handleCreate" />
    </template>

    <div class="enrollment-center-mobile">
      <!-- 统计卡片 -->
      <div class="stats-section">
        <van-grid :column-num="2" :gutter="12">
          <van-grid-item v-for="stat in statsData" :key="stat.key" class="stat-card" @click="handleStatClick(stat.key)">
            <div class="stat-content">
              <van-icon :name="stat.icon" :color="stat.color" size="24" />
              <div class="stat-value">{{ stat.value }}<span class="unit">{{ stat.unit }}</span></div>
              <div class="stat-label">{{ stat.label }}</div>
              <div class="stat-trend" v-if="stat.trend !== undefined">
                <van-tag size="medium" :type="stat.trend >= 0 ? 'success' : 'danger'">
                  {{ stat.trend >= 0 ? '+' : '' }}{{ stat.trend }}%
                </van-tag>
              </div>
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
        <!-- 咨询列表 -->
        <van-tab title="咨询管理" name="consultations">
          <div class="tab-content">
            <van-search v-model="searchKeyword" placeholder="搜索咨询记录" @search="loadConsultations" />
            
            <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
              <van-list
                v-model:loading="loading"
                :finished="finished"
                finished-text="没有更多了"
                @load="onLoad"
              >
                <div v-if="consultations.length === 0 && !loading" class="empty-state">
                  <van-empty description="暂无咨询记录" />
                </div>
                <div
                  v-for="item in consultations"
                  :key="item.id"
                  class="consultation-card"
                  @click="viewConsultation(item)"
                >
                  <div class="card-header">
                    <div class="card-avatar">
                      <van-icon name="user-o" size="20" />
                    </div>
                    <div class="card-info">
                      <div class="card-title">{{ item.parentName }}</div>
                      <div class="card-subtitle">{{ item.childName }} · {{ item.childAge }}岁</div>
                    </div>
                    <van-tag size="medium" :type="getStatusType(item.status)">
                      {{ getStatusLabel(item.status) }}
                    </van-tag>
                  </div>
                  <div class="card-content">
                    <div class="info-row">
                      <van-icon name="phone-o" size="14" />
                      <span>{{ item.phone }}</span>
                    </div>
                    <div class="info-row">
                      <van-icon name="clock-o" size="14" />
                      <span>{{ formatDate(item.createdAt) }}</span>
                    </div>
                  </div>
                  <div class="card-actions">
                    <van-button size="medium" type="primary" plain @click.stop="followUp(item)">跟进</van-button>
                    <van-button size="medium" plain @click.stop="callParent(item)">拨打电话</van-button>
                  </div>
                </div>
              </van-list>
            </van-pull-refresh>
          </div>
        </van-tab>

        <!-- 报名列表 -->
        <van-tab title="报名管理" name="registrations">
          <div class="tab-content">
            <van-pull-refresh v-model="regRefreshing" @refresh="onRegRefresh">
              <van-list
                v-model:loading="regLoading"
                :finished="regFinished"
                finished-text="没有更多了"
                @load="onRegLoad"
              >
                <div v-if="registrations.length === 0 && !regLoading" class="empty-state">
                  <van-empty description="暂无报名记录" />
                </div>
                <div
                  v-for="item in registrations"
                  :key="item.id"
                  class="registration-card"
                  @click="viewRegistration(item)"
                >
                  <div class="card-header">
                    <div class="card-info">
                      <div class="card-title">{{ item.childName }}</div>
                      <div class="card-subtitle">{{ item.className }} · {{ item.parentName }}</div>
                    </div>
                    <van-tag size="medium" :type="getRegStatusType(item.status)">
                      {{ getRegStatusLabel(item.status) }}
                    </van-tag>
                  </div>
                  <div class="card-footer">
                    <span>报名时间: {{ formatDate(item.registeredAt) }}</span>
                    <span>入园日期: {{ item.enrollmentDate }}</span>
                  </div>
                </div>
              </van-list>
            </van-pull-refresh>
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
const activeTab = ref('consultations')
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const regLoading = ref(false)
const regFinished = ref(false)
const regRefreshing = ref(false)
const searchKeyword = ref('')

// 数据
const consultations = ref<any[]>([])
const registrations = ref<any[]>([])

// 统计数据
const statsData = reactive([
  { key: 'total', label: '总咨询数', value: 256, unit: '人', icon: 'friends-o', color: '#6366f1', trend: 12 },
  { key: 'registered', label: '已报名', value: 89, unit: '人', icon: 'passed', color: '#10b981', trend: 8 },
  { key: 'trial', label: '试听中', value: 23, unit: '人', icon: 'clock-o', color: '#f59e0b', trend: -5 },
  { key: 'conversion', label: '转化率', value: 34.8, unit: '%', icon: 'chart-trending-o', color: '#3b82f6', trend: 3 }
])

// 快捷操作
const quickActions = [
  { key: 'add', label: '新增咨询', icon: 'add-o', color: '#6366f1' },
  { key: 'followup', label: '今日跟进', icon: 'todo-list-o', color: '#10b981' },
  { key: 'trial', label: '试听安排', icon: 'calendar-o', color: '#f59e0b' },
  { key: 'analysis', label: '数据分析', icon: 'chart-trending-o', color: '#3b82f6' }
]

// 初始化
onMounted(() => {
  loadConsultations()
})

// 加载咨询列表
const loadConsultations = async () => {
  try {
    loading.value = true
    // TODO: 调用API
    consultations.value = [
      { id: 1, parentName: '张女士', childName: '张小明', childAge: 3, phone: '138****1234', status: 'pending', createdAt: '2026-01-07 10:30' },
      { id: 2, parentName: '李先生', childName: '李小红', childAge: 4, phone: '139****5678', status: 'following', createdAt: '2026-01-06 14:20' },
      { id: 3, parentName: '王女士', childName: '王小华', childAge: 3, phone: '137****9012', status: 'trial', createdAt: '2026-01-05 09:15' }
    ]
    finished.value = true
  } catch (error) {
    console.error('加载咨询失败:', error)
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 加载报名列表
const loadRegistrations = async () => {
  try {
    regLoading.value = true
    // TODO: 调用API
    registrations.value = [
      { id: 1, childName: '张小明', className: '小班1班', parentName: '张女士', status: 'confirmed', registeredAt: '2026-01-05', enrollmentDate: '2026-02-01' },
      { id: 2, childName: '李小红', className: '中班2班', parentName: '李先生', status: 'pending', registeredAt: '2026-01-04', enrollmentDate: '2026-02-15' }
    ]
    regFinished.value = true
  } catch (error) {
    console.error('加载报名失败:', error)
  } finally {
    regLoading.value = false
    regRefreshing.value = false
  }
}

// 刷新
const onRefresh = () => loadConsultations()
const onRegRefresh = () => loadRegistrations()
const onLoad = () => { finished.value = true }
const onRegLoad = () => { regFinished.value = true }

// 状态映射
const getStatusType = (status: string) => {
  const map: Record<string, string> = { pending: 'warning', following: 'primary', trial: 'success', converted: 'success', lost: 'default' }
  return map[status] || 'default'
}

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = { pending: '待跟进', following: '跟进中', trial: '试听中', converted: '已转化', lost: '已流失' }
  return map[status] || '未知'
}

const getRegStatusType = (status: string) => {
  const map: Record<string, string> = { pending: 'warning', confirmed: 'success', cancelled: 'danger' }
  return map[status] || 'default'
}

const getRegStatusLabel = (status: string) => {
  const map: Record<string, string> = { pending: '待确认', confirmed: '已确认', cancelled: '已取消' }
  return map[status] || '未知'
}

const formatDate = (dateStr: string) => dateStr?.split(' ')[0] || ''

// 操作
const handleCreate = () => showToast('新增咨询')
const handleStatClick = (key: string) => showToast(`查看${key}详情`)
const handleAction = (key: string) => showToast(`执行${key}操作`)
const viewConsultation = (item: any) => showToast(`查看咨询: ${item.parentName}`)
const viewRegistration = (item: any) => showToast(`查看报名: ${item.childName}`)
const followUp = (item: any) => showToast(`跟进: ${item.parentName}`)
const callParent = (item: any) => window.location.href = `tel:${item.phone?.replace(/\*/g, '')}`
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;
@import '@/styles/mixins/responsive-mobile.scss';
.enrollment-center-mobile {
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
    
    .unit {
      font-size: 12px;
      font-weight: normal;
      margin-left: 2px;
    }
  }
  
  .stat-label {
    font-size: 12px;
    color: var(--van-text-color-2);
  }
  
  .stat-trend {
    margin-top: 4px;
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
  min-height: 300px;
}

.consultation-card,
.registration-card {
  margin: 12px;
  padding: 14px;
  background: var(--van-background);
  border-radius: 12px;
  border: 1px solid var(--van-border-color);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  transition: transform 0.12s ease, box-shadow 0.12s ease, background-color 0.12s ease;
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
  
  &:active {
    transform: scale(0.99);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  }
  
  .card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
    
    .card-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.18), rgba(16, 185, 129, 0.14));
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--van-primary-color);
    }
    
    .card-info {
      flex: 1;
      min-width: 0;
      
      .card-title {
        font-size: 15px;
        font-weight: 600;
        color: var(--van-text-color);
        line-height: 1.2;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .card-subtitle {
        font-size: 12px;
        color: var(--van-text-color-3);
        margin-top: 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
  
  .card-content {
    display: flex;
    gap: 16px;
    margin-bottom: 10px;
    
    .info-row {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: var(--van-text-color-2);
    }
  }
  
  .card-footer {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--van-text-color-3);
    padding-top: 8px;
    border-top: 1px solid var(--van-border-color);
  }
  
  .card-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    padding-top: 10px;
    border-top: 1px solid var(--van-border-color);
    
    :deep(.van-button) {
      border-radius: 10px;
      padding: 0 12px;
    }
  }
}

/* 深色主题下：让卡片与页面底色有层级对比（避免“融在一起”） */
:deep(.theme-dark) {
  .consultation-card,
  .registration-card {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(148, 163, 184, 0.18);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.28);
    
    &:active {
      box-shadow: 0 8px 18px rgba(0, 0, 0, 0.34);
    }
  }
}

.empty-state {
  padding: 40px 0;
}
</style>
