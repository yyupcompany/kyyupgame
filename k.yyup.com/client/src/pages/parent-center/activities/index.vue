<template>
  <div class="parent-activities">
    <div class="page-header">
      <h1>活动列表</h1>
      <p>查看和报名幼儿园活动</p>
    </div>

    <div class="filter-section">
      <el-form :inline="true" :model="filters">
        <el-form-item label="活动类型">
          <el-select v-model="filters.type" placeholder="全部" clearable>
            <el-option label="全部" value="" />
            <el-option label="户外活动" value="outdoor" />
            <el-option label="亲子活动" value="family" />
            <el-option label="节日庆典" value="festival" />
            <el-option label="教育讲座" value="education" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动状态">
          <el-select v-model="filters.status" placeholder="全部" clearable>
            <el-option label="全部" value="" />
            <el-option label="报名中" value="open" />
            <el-option label="已结束" value="closed" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadActivities">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="activities-list">
      <el-row :gutter="20">
        <el-col v-for="activity in activities" :key="activity.id" :span="8">
          <el-card class="activity-card" shadow="hover">
            <div class="activity-image">
              <el-image :src="activity.image" fit="cover">
                <template #error>
                  <div class="image-slot">
                    <UnifiedIcon name="default" />
                  </div>
                </template>
              </el-image>
              <div class="activity-tag" :class="`tag-${activity.status}`">
                {{ getStatusText(activity.status) }}
              </div>
            </div>
            <div class="activity-content">
              <h3 class="activity-title">{{ activity.title }}</h3>
              <div class="activity-info">
                <div class="info-item">
                  <UnifiedIcon name="default" />
                  <span>{{ activity.time }}</span>
                </div>
                <div class="info-item">
                  <UnifiedIcon name="default" />
                  <span>{{ activity.location }}</span>
                </div>
                <div class="info-item">
                  <UnifiedIcon name="default" />
                  <span>{{ activity.registered }}/{{ activity.capacity }}</span>
                </div>
              </div>
              <p class="activity-desc">{{ activity.description }}</p>
              <div class="activity-actions">
                <el-button type="primary" size="small" @click="viewDetail(activity.id)">
                  查看详情
                </el-button>
                <el-button 
                  v-if="activity.status === 'open'" 
                  type="success" 
                  size="small" 
                  @click="register(activity.id)"
                >
                  立即报名
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[6, 12, 24]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="loadActivities"
        @size-change="loadActivities"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Picture, Clock, Location, UserFilled } from '@element-plus/icons-vue'
import imageLoader from '@/utils/image-loader'

const router = useRouter()

// 筛选条件
const filters = ref({
  type: '',
  status: ''
})

// 分页
const currentPage = ref(1)
const pageSize = ref(6)
const total = ref(0)

// 活动列表
const activities = ref<any[]>([])

// 加载活动列表
const loadActivities = async () => {
  // TODO: 从API加载数据
  activities.value = [
    {
      id: 1,
      title: '秋游活动',
      type: 'outdoor',
      status: 'open',
      time: '2024-11-05 09:00',
      location: '森林公园',
      capacity: 50,
      registered: 32,
      image: imageLoader.getActivityImage('activity-1.jpg'),
      description: '带孩子们走进大自然，感受秋天的美好...'
    },
    {
      id: 2,
      title: '亲子运动会',
      type: 'family',
      status: 'open',
      time: '2024-11-10 14:00',
      location: '幼儿园操场',
      capacity: 100,
      registered: 78,
      image: imageLoader.getActivityImage('activity-2.jpg'),
      description: '增进亲子感情，锻炼身体素质...'
    }
  ]
  total.value = 10
}

// 重置筛选
const resetFilters = () => {
  filters.value = {
    type: '',
    status: ''
  }
  loadActivities()
}

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    open: '报名中',
    closed: '已结束',
    full: '已满员'
  }
  return statusMap[status] || status
}

// 查看详情
const viewDetail = (id: number) => {
  router.push(`/parent-center/activities/${id}`)
}

// 报名活动
const register = (id: number) => {
  router.push(`/parent-center/activity-registration?activityId=${id}`)
}

onMounted(() => {
  loadActivities()
})
</script>

<style scoped lang="scss">
.parent-activities {
  padding: var(--spacing-xl);

  .page-header {
    margin-bottom: var(--spacing-xl);

    h1 {
      font-size: var(--text-2xl);
      font-weight: var(--font-semibold);
      color: var(--text-primary);
      margin-bottom: var(--spacing-sm);
    }

    p {
      font-size: var(--text-base);
      color: var(--text-secondary);
    }
  }

  .filter-section {
    background: var(--bg-card);
    padding: var(--spacing-xl);
    border-radius: var(--radius-lg);
    margin-bottom: var(--spacing-xl);
    box-shadow: var(--shadow-sm);
  }

  .activities-list {
    .activity-card {
      margin-bottom: var(--spacing-xl);
      cursor: pointer;
      transition: var(--card-transition);
      border-radius: var(--radius-lg);
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap;
      box-shadow: var(--shadow-md);

      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);
      }

      .activity-image {
        position: relative;
        height: var(--spacing-5xl);
        overflow: hidden;
        border-radius: var(--radius-lg) var(--radius-lg) 0 0;

        .el-image {
          width: 100%;
          height: 100%;
          transition: var(--transition-slow);
        }

        .image-slot {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100%;
          background: var(--bg-hover);
          color: var(--text-secondary);
          font-size: var(--text-3xl);

          .el-icon {
            font-size: var(--icon-lg);
          }
        }

        .activity-tag {
          position: absolute;
          top: var(--spacing-sm);
          right: var(--spacing-sm);
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--radius-md);
          font-size: var(--text-xs);
          font-weight: var(--font-medium);
          color: var(--text-on-primary);
          box-shadow: var(--shadow-sm);

          &.tag-open {
            background: var(--success-color);
          }

          &.tag-closed {
            background: var(--info-color);
          }

          &.tag-full {
            background: var(--danger-color);
          }
        }
      }

      .activity-content {
        padding: var(--spacing-lg);

        .activity-title {
          font-size: var(--text-lg);
          font-weight: var(--font-semibold);
          color: var(--text-primary);
          margin-bottom: var(--spacing-sm);
          line-height: var(--leading-tight);
        }

        .activity-info {
          margin-bottom: var(--spacing-sm);

          .info-item {
            display: flex;
            align-items: center;
            font-size: var(--text-sm);
            color: var(--text-regular);
            margin-bottom: var(--spacing-xs);

            &:last-child {
              margin-bottom: 0;
            }

            .el-icon {
              margin-right: var(--spacing-sm);
              color: var(--primary-color);
              flex-shrink: 0;
              font-size: var(--icon-sm);
            }

            span {
              line-height: var(--leading-snug);
            }
          }
        }

        .activity-desc {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          line-height: var(--leading-relaxed);
          margin-bottom: var(--spacing-lg);
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
        }

        .activity-actions {
          display: flex;
          gap: var(--spacing-sm);

          .el-button {
            border-radius: var(--radius-md);
            font-weight: var(--font-medium);
            transition: var(--transition-fast);
          }
        }
      }
    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    margin-top: var(--spacing-2xl);
  }
}

/* 响应式优化 */
@media (max-width: var(--breakpoint-md)) {
  .parent-activities {
    padding: var(--spacing-md);

    .activities-list {
      .el-col {
        &:not(:last-child) {
          .activity-card {
            margin-bottom: var(--spacing-md);
          }
        }
      }
    }
  }
}
</style>





