<template>
  <MobileCenterLayout title="活动中心" back-path="/mobile/centers">
    <template #right>
      <van-icon name="plus" size="20" @click="handleCreate" />
    </template>

    <div class="activity-center-mobile">
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

      <!-- 标签页 -->
      <van-tabs v-model:active="activeTab" sticky offset-top="46">
        <!-- 进行中活动 -->
        <van-tab title="进行中" name="ongoing">
          <div class="tab-content">
            <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
              <van-list
                v-model:loading="loading"
                :finished="finished"
                finished-text="没有更多了"
                @load="onLoad"
              >
                <div v-if="activities.length === 0 && !loading" class="empty-state">
                  <van-empty description="暂无进行中活动" />
                </div>
                <div
                  v-for="item in activities"
                  :key="item.id"
                  class="activity-card"
                  @click="viewActivity(item)"
                >
                  <div class="card-cover" v-if="item.coverUrl">
                    <img :src="item.coverUrl" :alt="item.name" @error="handleImageError" />
                    <van-tag class="status-tag" :type="getStatusType(item.status)">
                      {{ getStatusLabel(item.status) }}
                    </van-tag>
                  </div>
                  <div class="card-content">
                    <div class="card-title">{{ item.name }}</div>
                    <div class="card-meta">
                      <div class="meta-item">
                        <van-icon name="clock-o" size="14" />
                        <span>{{ item.startDate }} ~ {{ item.endDate }}</span>
                      </div>
                      <div class="meta-item">
                        <van-icon name="location-o" size="14" />
                        <span>{{ item.location }}</span>
                      </div>
                    </div>
                    <div class="card-footer">
                      <div class="participants">
                        <van-icon name="friends-o" size="14" />
                        <span>{{ item.participants }}/{{ item.maxParticipants }}人</span>
                      </div>
                      <van-button size="medium" type="primary" plain @click.stop="manageActivity(item)">
                        管理
                      </van-button>
                    </div>
                  </div>
                </div>
              </van-list>
            </van-pull-refresh>
          </div>
        </van-tab>

        <!-- 即将开始 -->
        <van-tab title="即将开始" name="upcoming">
          <div class="tab-content">
            <div class="upcoming-list">
              <div v-for="item in upcomingActivities" :key="item.id" class="upcoming-card" @click="viewActivity(item)">
                <div class="countdown">
                  <div class="count-value">{{ item.daysToStart }}</div>
                  <div class="count-label">天后开始</div>
                </div>
                <div class="activity-info">
                  <div class="activity-name">{{ item.name }}</div>
                  <div class="activity-date">{{ item.startDate }}</div>
                </div>
                <van-icon name="arrow" color="#c0c4cc" />
              </div>
              <van-empty v-if="upcomingActivities.length === 0" description="暂无即将开始的活动" />
            </div>
          </div>
        </van-tab>

        <!-- 已结束 -->
        <van-tab title="已结束" name="ended">
          <div class="tab-content">
            <div class="ended-list">
              <div v-for="item in endedActivities" :key="item.id" class="ended-card" @click="viewActivity(item)">
                <div class="activity-info">
                  <div class="activity-name">{{ item.name }}</div>
                  <div class="activity-stats">
                    <span>参与: {{ item.participants }}人</span>
                    <span>评分: {{ item.rating }}分</span>
                  </div>
                </div>
                <van-button size="medium" plain @click.stop="viewReport(item)">查看报告</van-button>
              </div>
              <van-empty v-if="endedActivities.length === 0" description="暂无已结束活动" />
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
const activeTab = ref('ongoing')
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

// 数据
const activities = ref<any[]>([])
const upcomingActivities = ref<any[]>([])
const endedActivities = ref<any[]>([])

// 统计数据
const statsData = reactive([
  { key: 'total', label: '本月活动', value: 12, icon: 'fire-o', color: '#6366f1' },
  { key: 'ongoing', label: '进行中', value: 3, icon: 'play-circle-o', color: '#10b981' },
  { key: 'participants', label: '参与人数', value: 450, icon: 'friends-o', color: '#f59e0b' },
  { key: 'rating', label: '平均评分', value: 4.8, icon: 'star-o', color: '#3b82f6' }
])

// 初始化
onMounted(() => {
  loadActivities()
})

// 加载活动
const loadActivities = async () => {
  loading.value = true
  activities.value = [
    { id: 1, name: '春季运动会', status: 'ongoing', startDate: '2026-01-05', endDate: '2026-01-10', location: '操场', participants: 180, maxParticipants: 200, coverUrl: '' },
    { id: 2, name: '亲子手工活动', status: 'ongoing', startDate: '2026-01-07', endDate: '2026-01-07', location: '美工室', participants: 35, maxParticipants: 40, coverUrl: '' }
  ]
  upcomingActivities.value = [
    { id: 3, name: '元宵节庆祝活动', startDate: '2026-02-15', daysToStart: 39 },
    { id: 4, name: '家长开放日', startDate: '2026-02-20', daysToStart: 44 }
  ]
  endedActivities.value = [
    { id: 5, name: '元旦联欢会', participants: 220, rating: 4.9 },
    { id: 6, name: '圣诞主题活动', participants: 185, rating: 4.7 }
  ]
  loading.value = false
  finished.value = true
}

// 刷新
const onRefresh = async () => {
  await loadActivities()
  refreshing.value = false
}

const onLoad = () => { finished.value = true }

// 图片错误处理
const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
}

// 状态映射
const getStatusType = (status: string) => {
  const map: Record<string, string> = { ongoing: 'success', upcoming: 'warning', ended: 'default' }
  return map[status] || 'default'
}

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = { ongoing: '进行中', upcoming: '即将开始', ended: '已结束' }
  return map[status] || '未知'
}

// 操作
const handleCreate = () => showToast('创建新活动')
const viewActivity = (item: any) => showToast(`查看活动: ${item.name}`)
const manageActivity = (item: any) => showToast(`管理活动: ${item.name}`)
const viewReport = (item: any) => showToast(`查看活动报告: ${item.name}`)
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;
@import '@/styles/mixins/responsive-mobile.scss';
.activity-center-mobile {
  @include mobile-layout;
  min-height: 100vh;
  background: var(--van-background-2);
}

.stats-section {
  @include mobile-padding(12px);

  @include mobile-sm {
    padding: 16px;
  }

  @include mobile-lg {
    padding: 20px;
  }
}

.stat-card {
  :deep(.van-grid-item__content) {
    @include mobile-card;
    padding: 12px;

    @include mobile-sm {
      padding: 16px;
    }

    @include mobile-lg {
      padding: 20px;
    }
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

.tab-content {
  padding: 12px;
}

.activity-card {
  background: var(--van-background);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
  
  .card-cover {
    position: relative;
    height: 120px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .status-tag {
      position: absolute;
      top: 8px;
      right: 8px;
    }
  }
  
  .card-content {
    padding: 12px;
    
    .card-title {
      font-size: 16px;
      font-weight: 500;
      color: var(--van-text-color);
      margin-bottom: 8px;
    }
    
    .card-meta {
      margin-bottom: 10px;
      
      .meta-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: var(--van-text-color-2);
        margin-bottom: 4px;
      }
    }
    
    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 10px;
      border-top: 1px solid var(--van-border-color);
      
      .participants {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        color: var(--van-text-color);
      }
    }
  }
}

.upcoming-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--van-background);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  
  .countdown {
    width: 50px;
    text-align: center;
    
    .count-value {
      font-size: 24px;
      font-weight: 600;
      color: var(--van-primary-color);
    }
    
    .count-label {
      font-size: 11px;
      color: var(--van-text-color-3);
    }
  }
  
  .activity-info {
    flex: 1;
    
    .activity-name {
      font-size: 15px;
      font-weight: 500;
      color: var(--van-text-color);
    }
    
    .activity-date {
      font-size: 12px;
      color: var(--van-text-color-3);
      margin-top: 4px;
    }
  }
}

.ended-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--van-background);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  
  .activity-info {
    flex: 1;
    
    .activity-name {
      font-size: 15px;
      font-weight: 500;
      color: var(--van-text-color);
    }
    
    .activity-stats {
      font-size: 12px;
      color: var(--van-text-color-3);
      margin-top: 4px;
      
      span + span {
        margin-left: 12px;
      }
    }
  }
}

.empty-state {
  padding: 40px 0;
}
</style>
