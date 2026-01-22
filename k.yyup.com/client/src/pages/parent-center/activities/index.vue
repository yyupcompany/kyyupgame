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
/* 使用设计令牌 */

/* ==================== 家长活动页面 ==================== */
.parent-activities {
  padding: var(--spacing-xl);
  max-width: var(--breakpoint-2xl);
  margin: 0 auto;

  .page-header {
    margin-bottom: var(--spacing-xl);
    padding-bottom: var(--spacing-md);
    border-bottom: 1px solid var(--border-color-lighter);

    h1 {
      font-size: var(--text-xl);
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin-bottom: var(--spacing-xs);
    }

    p {
      font-size: var(--text-sm);
      color: var(--el-text-color-secondary);
    }
  }

  /* ==================== 筛选区域 ==================== */
  .filter-section {
    background: var(--bg-card);
    padding: var(--spacing-lg);
    border-radius: var(--radius-lg);
    margin-bottom: var(--spacing-xl);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-color-lighter);

    :deep(.el-form) {
      .el-form-item {
        margin-bottom: 0;
      }

      .el-form-item__label {
        font-weight: 500;
        color: var(--el-text-color-primary);
      }

      .el-select .el-input__wrapper {
        border-radius: var(--radius-md);
      }
    }
  }

  /* ==================== 活动列表 ==================== */
  .activities-list {
    .activity-card {
      margin-bottom: var(--spacing-lg);
      cursor: pointer;
      transition: all var(--transition-base);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border-color-lighter);

      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);
        border-color: var(--el-color-primary-light-3);
      }

      :deep(.el-card__body) {
        padding: 0;
      }

      /* ==================== 活动图片 ==================== */
      .activity-image {
        position: relative;
        height: 160px;
        overflow: hidden;

        .el-image {
          width: 100%;
          height: 100%;
          transition: all var(--transition-base);
        }

        &:hover .el-image {
          transform: scale(1.05);
        }

        .image-slot {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100%;
          background: var(--el-fill-color-light);
          color: var(--el-text-color-secondary);
          font-size: var(--text-2xl);
        }

        .activity-tag {
          position: absolute;
          top: var(--spacing-sm);
          right: var(--spacing-sm);
          padding: 4px var(--spacing-sm);
          border-radius: var(--radius-sm);
          font-size: var(--text-xs);
          font-weight: 500;
          color: white;
          box-shadow: var(--shadow-sm);

          &.tag-open {
            background: var(--el-color-success);
          }

          &.tag-closed {
            background: var(--el-color-info);
          }

          &.tag-full {
            background: var(--el-color-danger);
          }
        }
      }

      /* ==================== 活动内容 ==================== */
      .activity-content {
        padding: var(--spacing-md);

        .activity-title {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--el-text-color-primary);
          margin-bottom: var(--spacing-sm);
          line-height: var(--leading-tight);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .activity-info {
          margin-bottom: var(--spacing-sm);

          .info-item {
            display: flex;
            align-items: center;
            font-size: var(--text-xs);
            color: var(--el-text-color-secondary);
            margin-bottom: var(--spacing-xs);

            &:last-child {
              margin-bottom: 0;
            }

            :deep(.el-icon) {
              margin-right: var(--spacing-xs);
              color: var(--el-text-color-secondary);
              flex-shrink: 0;
            }

            span {
              line-height: var(--leading-normal);
            }
          }
        }

        .activity-desc {
          font-size: var(--text-xs);
          color: var(--el-text-color-secondary);
          line-height: var(--leading-normal);
          margin-bottom: var(--spacing-md);
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
        }

        .activity-actions {
          display: flex;
          gap: var(--spacing-xs);

          :deep(.el-button) {
            flex: 1;
            border-radius: var(--radius-sm);
            font-weight: 500;
            transition: all var(--transition-base);

            &:hover {
              transform: translateY(-2px);
            }
          }
        }
      }
    }
  }

  /* ==================== 分页 ==================== */
  .pagination {
    display: flex;
    justify-content: center;
    margin-top: var(--spacing-xl);
    padding-top: var(--spacing-lg);
    border-top: 1px solid var(--border-color-lighter);
  }

  /* ==================== 响应式设计 ==================== */
  @media (max-width: var(--breakpoint-md)) {
    padding: var(--spacing-md);

    .filter-section {
      padding: var(--spacing-md);

      :deep(.el-form) {
        flex-direction: column;

        .el-form-item {
          margin-bottom: var(--spacing-sm);
        }
      }
    }

    .activities-list .activity-card {
      margin-bottom: var(--spacing-md);

      .activity-image {
        height: 140px;
      }
    }
  }
}

/* ==================== 暗色模式支持 ==================== */
@media (prefers-color-scheme: dark) {
  :root {
    /* 设计令牌会自动适配暗色模式 */
  }
}
</style>





