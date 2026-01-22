<template>
  <MobileSubPageLayout title="活动列表" back-path="/mobile/parent-center">
    <div class="parent-activities">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1>活动列表</h1>
        <p>查看和报名幼儿园活动</p>
      </div>

      <!-- 活动筛选 -->
      <div class="filter-section">
        <van-form @submit="loadActivities">
          <van-cell-group inset>
            <van-field
              v-model="filters.type"
              name="activityType"
              label="活动类型"
              placeholder="请选择活动类型"
              readonly
              is-link
              @click="showActivityTypePicker = true"
            />
            <van-field
              v-model="filters.status"
              name="activityStatus"
              label="活动状态"
              placeholder="请选择活动状态"
              readonly
              is-link
              @click="showActivityStatusPicker = true"
            />
          </van-cell-group>
          
          <div class="filter-actions">
            <van-button 
              type="primary" 
              native-type="submit" 
              block 
              :loading="loading"
              @click="loadActivities"
            >
              查询
            </van-button>
            <van-button 
              type="default" 
              block 
              @click="resetFilters"
            >
              重置
            </van-button>
          </div>
        </van-form>
      </div>

      <!-- 活动列表 -->
      <div class="activities-list">
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <van-list
            v-model:loading="loading"
            :finished="finished"
            finished-text="没有更多了"
            @load="onLoad"
          >
            <div 
              v-for="activity in activities" 
              :key="activity.id" 
              class="activity-card"
              @click="viewDetail(activity.id)"
            >
              <van-card
                :thumb="activity.image || '/default-activity.png'"
                :title="activity.title"
                :desc="activity.description"
                :centered="false"
              >
                <!-- 活动图片和状态标签 -->
                <template #thumb>
                  <div class="activity-image-wrapper">
                    <van-image
                      :src="activity.image || '/default-activity.png'"
                      fit="cover"
                      width="100%"
                      height="120"
                      :error-icon="defaultImageIcon"
                    >
                      <template #error>
                        <div class="image-error">
                          <van-icon name="photo-fail" size="40" />
                        </div>
                      </template>
                    </van-image>
                    <div 
                      class="activity-tag" 
                      :class="`tag-${activity.status}`"
                    >
                      {{ getStatusText(activity.status) }}
                    </div>
                  </div>
                </template>

                <!-- 活动内容 -->
                <template #desc>
                  <div class="activity-content">
                    <div class="activity-info">
                      <div class="info-item">
                        <van-icon name="clock-o" />
                        <span>{{ activity.time }}</span>
                      </div>
                      <div class="info-item">
                        <van-icon name="location-o" />
                        <span>{{ activity.location }}</span>
                      </div>
                      <div class="info-item">
                        <van-icon name="friends-o" />
                        <span>{{ activity.registered }}/{{ activity.capacity }}人</span>
                      </div>
                    </div>
                    <p class="activity-desc">{{ activity.description }}</p>
                  </div>
                </template>

                <!-- 活动操作按钮 -->
                <template #footer>
                  <div class="activity-actions">
                    <van-button 
                      type="primary" 
                      size="small" 
                      plain
                      @click.stop="viewDetail(activity.id)"
                    >
                      查看详情
                    </van-button>
                    <van-button 
                      v-if="activity.status === 2" 
                      type="success" 
                      size="small" 
                      @click.stop="register(activity.id)"
                    >
                      立即报名
                    </van-button>
                  </div>
                </template>
              </van-card>
            </div>
          </van-list>
        </van-pull-refresh>
      </div>

      <!-- 空状态 -->
      <van-empty 
        v-if="!loading && activities.length === 0"
        description="暂无活动数据"
        image="https://fastly.jsdelivr.net/npm/@vant/assets/custom-empty-image.png"
      />
    </div>

    <!-- 活动类型选择器 -->
    <van-popup v-model:show="showActivityTypePicker" position="bottom">
      <van-picker
        :columns="activityTypeColumns"
        @confirm="onActivityTypeConfirm"
        @cancel="showActivityTypePicker = false"
      />
    </van-popup>

    <!-- 活动状态选择器 -->
    <van-popup v-model:show="showActivityStatusPicker" position="bottom">
      <van-picker
        :columns="activityStatusColumns"
        @confirm="onActivityStatusConfirm"
        @cancel="showActivityStatusPicker = false"
      />
    </van-popup>

    <!-- 悬浮返回顶部按钮 -->
    <van-back-top right="20" bottom="80" />
  </MobileSubPageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import MobileSubPageLayout from '@/components/mobile/layouts/MobileSubPageLayout.vue'
import { getActivityList } from '@/api/modules/activity'
import type { Activity, ActivityQueryParams } from '@/api/modules/activity'

const router = useRouter()

// 筛选条件
const filters = ref({
  type: '',
  status: ''
})

// 分页数据
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 活动列表
const activities = ref<Activity[]>([])

// 状态管理
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

// 弹窗控制
const showActivityTypePicker = ref(false)
const showActivityStatusPicker = ref(false)

// 默认图标
const defaultImageIcon = 'photo-fail'

// 活动类型选项
const activityTypeColumns = [
  { text: '全部', value: '' },
  { text: '户外活动', value: 'outdoor' },
  { text: '亲子活动', value: 'family' },
  { text: '节日庆典', value: 'festival' },
  { text: '教育讲座', value: 'education' }
]

// 活动状态选项
const activityStatusColumns = [
  { text: '全部', value: '' },
  { text: '报名中', value: 2 },
  { text: '进行中', value: 3 },
  { text: '已结束', value: 4 }
]

// 状态文本映射
const getStatusText = (status: number) => {
  const statusMap: Record<number, string> = {
    0: '草稿',
    1: '未开始',
    2: '报名中',
    3: '进行中',
    4: '已结束',
    5: '已取消'
  }
  return statusMap[status] || '未知'
}

// 加载活动列表
const loadActivities = async (isRefresh = false) => {
  if (loading.value && !isRefresh) return

  loading.value = true
  finished.value = false

  try {
    const params: ActivityQueryParams = {
      page: isRefresh ? 1 : currentPage.value,
      size: pageSize.value
    }

    // 添加筛选条件
    if (filters.value.type) {
      params.activityType = getActivityTypeValue(filters.value.type)
    }
    if (filters.value.status) {
      params.status = Number(filters.value.status)
    }

    const response = await getActivityList(params)
    
    if (response.success && response.data) {
      const newActivities = response.data.items || []
      
      if (isRefresh) {
        activities.value = newActivities
        currentPage.value = 1
      } else {
        activities.value.push(...newActivities)
      }
      
      total.value = response.data.total || 0
      finished.value = activities.value.length >= total.value
      
      if (!isRefresh) {
        currentPage.value++
      }
    }
  } catch (error) {
    console.error('加载活动列表失败:', error)
    showToast('加载失败，请重试')
    
    // 加载失败时使用模拟数据
    if (activities.value.length === 0) {
      activities.value = getMockActivities()
      finished.value = true
    }
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 获取活动类型数值
const getActivityTypeValue = (typeText: string): number => {
  const typeMap: Record<string, number> = {
    'outdoor': 1,
    'family': 3,
    'festival': 6,
    'education': 7
  }
  return typeMap[typeText] || 1
}

// 模拟数据
const getMockActivities = (): Activity[] => {
  return [
    {
      id: 1,
      title: '秋游活动',
      activityType: 1,
      status: 2,
      startTime: '2024-11-05 09:00',
      endTime: '2024-11-05 12:00',
      location: '森林公园',
      capacity: 50,
      registered: 32,
      coverImage: '/images/activity-1.jpg',
      description: '带孩子们走进大自然，感受秋天的美好，体验户外探索的乐趣。',
      registrationStartTime: '2024-10-20',
      registrationEndTime: '2024-11-03',
      needsApproval: 0,
      createdAt: '2024-10-15',
      updatedAt: '2024-10-15'
    },
    {
      id: 2,
      title: '亲子运动会',
      activityType: 3,
      status: 2,
      startTime: '2024-11-10 14:00',
      endTime: '2024-11-10 17:00',
      location: '幼儿园操场',
      capacity: 100,
      registered: 78,
      coverImage: '/images/activity-2.jpg',
      description: '增进亲子感情，锻炼身体素质，体验团队合作的重要。',
      registrationStartTime: '2024-10-25',
      registrationEndTime: '2024-11-08',
      needsApproval: 0,
      createdAt: '2024-10-20',
      updatedAt: '2024-10-20'
    },
    {
      id: 3,
      title: '消防安全讲座',
      activityType: 7,
      status: 3,
      startTime: '2024-11-15 10:00',
      endTime: '2024-11-15 11:30',
      location: '多功能厅',
      capacity: 80,
      registered: 45,
      coverImage: '/images/activity-3.jpg',
      description: '专业的消防员为家长和孩子们讲解消防安全知识，提高安全意识。',
      registrationStartTime: '2024-11-01',
      registrationEndTime: '2024-11-14',
      needsApproval: 0,
      createdAt: '2024-10-25',
      updatedAt: '2024-10-25'
    }
  ]
}

// 下拉刷新
const onRefresh = () => {
  currentPage.value = 1
  activities.value = []
  finished.value = false
  loadActivities(true)
}

// 上拉加载
const onLoad = () => {
  if (!finished.value) {
    loadActivities()
  }
}

// 重置筛选
const resetFilters = () => {
  filters.value = {
    type: '',
    status: ''
  }
  currentPage.value = 1
  activities.value = []
  finished.value = false
  loadActivities(true)
}

// 活动类型确认
const onActivityTypeConfirm = ({ selectedValues }: any) => {
  filters.value.type = selectedValues[0]
  showActivityTypePicker.value = false
  currentPage.value = 1
  activities.value = []
  finished.value = false
  loadActivities(true)
}

// 活动状态确认
const onActivityStatusConfirm = ({ selectedValues }: any) => {
  filters.value.status = selectedValues[0]
  showActivityStatusPicker.value = false
  currentPage.value = 1
  activities.value = []
  finished.value = false
  loadActivities(true)
}

// 查看详情
const viewDetail = (id: number) => {
  router.push(`/mobile/parent-center/activities/${id}`)
}

// 报名活动
const register = async (id: number) => {
  try {
    await showConfirmDialog({
      title: '确认报名',
      message: '确定要报名参加这个活动吗？',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })

    // 跳转到报名页面
    router.push(`/mobile/parent-center/activity-registration?activityId=${id}`)
  } catch {
    // 用户取消报名
  }
}

// 计算活动时间显示
const activityTime = computed(() => {
  return (activity: Activity) => {
    const startTime = new Date(activity.startTime)
    const endTime = new Date(activity.endTime)
    const formatDate = (date: Date) => {
      return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    }
    return `${formatDate(startTime)} - ${formatDate(endTime)}`
  }
})

onMounted(() => {
  // 主题检测
  const detectTheme = () => {
    const htmlTheme = document.documentElement.getAttribute('data-theme')
    // isDark.value = htmlTheme === 'dark'
  }
  detectTheme()
  loadActivities(true)
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

.parent-activities {
  padding: var(--spacing-md);
  padding-bottom: 80px;
  min-height: 100vh;
  background: var(--van-background-color-light);

  .page-header {
    margin-bottom: 16px;
    text-align: center;

    h1 {
      font-size: var(--text-2xl);
      font-weight: 600;
      color: var(--van-text-color);
      margin-bottom: 8px;
    }

    p {
      font-size: var(--text-sm);
      color: var(--van-text-color-2);
      margin: 0;
    }
  }

  .filter-section {
    margin-bottom: 16px;

    .filter-actions {
      display: flex;
      gap: var(--spacing-sm);
      padding: var(--spacing-md);

      .van-button {
        flex: 1;
      }
    }
  }

  .activities-list {
    .activity-card {
      margin-bottom: 12px;
      border-radius: 8px;
      overflow: hidden;
      background: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      &:last-child {
        margin-bottom: 0;
      }

      .van-card {
        background: white;
      }

      .activity-image-wrapper {
        position: relative;
        width: 100px;
        height: 120px;
        border-radius: 8px;
        overflow: hidden;

        .image-error {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100%;
          background: var(--van-gray-2);
          color: var(--van-gray-5);
        }

        .activity-tag {
          position: absolute;
          top: 8px;
          right: 8px;
          padding: var(--spacing-xs) 8px;
          border-radius: 12px;
          font-size: var(--text-xs);
          font-weight: 500;
          color: white;
          backdrop-filter: blur(4px);

          &.tag-2 {
            background: var(--van-success-color);
          }

          &.tag-3 {
            background: var(--van-primary-color);
          }

          &.tag-4 {
            background: var(--van-info-color);
          }

          &.tag-5 {
            background: var(--van-danger-color);
          }
        }
      }

      .activity-content {
        flex: 1;

        .activity-info {
          margin-bottom: 8px;

          .info-item {
            display: flex;
            align-items: center;
            font-size: var(--text-xs);
            color: var(--van-text-color-2);
            margin-bottom: 4px;

            &:last-child {
              margin-bottom: 0;
            }

            .van-icon {
              margin-right: 4px;
              color: var(--van-primary-color);
              font-size: var(--text-sm);
            }

            span {
              line-height: 1.4;
            }
          }
        }

        .activity-desc {
          font-size: var(--text-sm);
          color: var(--van-text-color-2);
          line-height: 1.6;
          margin: 0;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
        }
      }

      .activity-actions {
        display: flex;
        gap: var(--spacing-sm);
        justify-content: flex-end;

        .van-button {
          border-radius: 16px;
          font-weight: 500;
        }
      }
    }
  }
}

// 响应式优化
@media (min-width: 768px) {
  .parent-activities {
    max-width: 768px;
    margin: 0 auto;
  }
}
</style>