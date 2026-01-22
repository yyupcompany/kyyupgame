<template>
  <div class="training-activities">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">训练活动</h1>
        <p class="page-description">探索适合孩子的训练活动</p>
      </div>
      <div class="header-actions">
        <el-button v-if="showRecommendations" type="warning" @click="clearRecommendations">
          <el-icon><Close /></el-icon>
          清除推荐
        </el-button>
        <el-button type="primary" @click="viewRecommended">
          <el-icon><Star /></el-icon>
          查看推荐
        </el-button>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="filters-section">
      <el-card class="filters-card">
        <el-form :model="filters" label-position="top" @submit.prevent="handleFilter">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="6">
              <el-form-item label="活动类型">
                <el-select
                  v-model="filters.type"
                  placeholder="选择类型"
                  clearable
                  @change="handleFilter"
                >
                  <el-option label="认知" :value="ActivityType.COGNITIVE" />
                  <el-option label="运动" :value="ActivityType.MOTOR" />
                  <el-option label="语言" :value="ActivityType.LANGUAGE" />
                  <el-option label="社交" :value="ActivityType.SOCIAL" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :xs="24" :sm="12" :md="6">
              <el-form-item label="难度等级">
                <el-select
                  v-model="filters.difficulty"
                  placeholder="选择难度"
                  clearable
                  @change="handleFilter"
                >
                  <el-option label="简单" :value="DifficultyLevel.EASY" />
                  <el-option label="中等" :value="DifficultyLevel.MEDIUM" />
                  <el-option label="困难" :value="DifficultyLevel.HARD" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :xs="24" :sm="12" :md="6">
              <el-form-item label="年龄段">
                <el-select
                  v-model="ageRange"
                  placeholder="选择年龄段"
                  clearable
                  @change="handleAgeRangeChange"
                >
                  <el-option label="2-3岁" :value="{ min: 2, max: 3 }" />
                  <el-option label="3-4岁" :value="{ min: 3, max: 4 }" />
                  <el-option label="4-5岁" :value="{ min: 4, max: 5 }" />
                  <el-option label="5-6岁" :value="{ min: 5, max: 6 }" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :xs="24" :sm="12" :md="6">
              <el-form-item label="搜索">
                <el-input
                  v-model="searchKeyword"
                  placeholder="搜索活动名称"
                  @keyup.enter="handleFilter"
                >
                  <template #append>
                    <el-button @click="handleFilter">
                      <el-icon><Search /></el-icon>
                    </el-button>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
    </div>

    <!-- 活动列表 -->
    <div class="activities-content">
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="6" animated />
      </div>

      <div v-else-if="activities.length === 0" class="empty-state">
        <el-empty description="暂无符合条件的活动">
          <el-button type="primary" @click="clearFilters">清除筛选条件</el-button>
        </el-empty>
      </div>

      <div v-else class="activities-grid">
        <div
          v-for="activity in activities"
          :key="activity.id"
          class="activity-card"
          @click="viewActivityDetail(activity.id)"
        >
          <div class="activity-header">
            <div class="activity-image">
              <img v-if="activity.imageUrl" :src="activity.imageUrl" :alt="activity.name" />
              <div v-else class="placeholder-image">
                <el-icon size="40"><Picture /></el-icon>
              </div>
            </div>
            <div class="activity-type">
              <el-tag :type="getActivityTypeColor(activity.type)" size="small">
                {{ getActivityTypeLabel(activity.type) }}
              </el-tag>
            </div>
          </div>

          <div class="activity-body">
            <h3 class="activity-name">{{ activity.name }}</h3>
            <p class="activity-description">{{ activity.description }}</p>

            <div class="activity-meta">
              <div class="meta-item">
                <el-icon><Clock /></el-icon>
                <span>{{ activity.duration }} 分钟</span>
              </div>
              <div class="meta-item">
                <el-icon><TrendCharts /></el-icon>
                <span>{{ getDifficultyLabel(activity.difficulty) }}</span>
              </div>
              <div class="meta-item">
                <el-icon><User /></el-icon>
                <span>{{ activity.ageRange.min }}-{{ activity.ageRange.max }}岁</span>
              </div>
            </div>

            <div v-if="activity.tags.length > 0" class="activity-tags">
              <el-tag
                v-for="tag in activity.tags.slice(0, 3)"
                :key="tag"
                size="small"
                type="info"
                effect="plain"
              >
                {{ tag }}
              </el-tag>
              <el-tag v-if="activity.tags.length > 3" size="small" type="info" effect="plain">
                +{{ activity.tags.length - 3 }}
              </el-tag>
            </div>
          </div>

          <div class="activity-footer">
            <el-button type="primary" plain size="small" @click.stop="startActivity(activity.id)">
              开始训练
            </el-button>
            <el-button type="default" plain size="small" @click.stop="addToPlan(activity.id)">
              添加到计划
            </el-button>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="total > pageSize" class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[12, 24, 48]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 活动详情对话框 -->
    <el-dialog
      v-model="showActivityDialog"
      :title="selectedActivity?.name"
      width="80%"
      max-width="800px"
      destroy-on-close
    >
      <div v-if="selectedActivity" class="activity-detail">
        <div class="detail-image">
          <img v-if="selectedActivity.imageUrl" :src="selectedActivity.imageUrl" :alt="selectedActivity.name" />
          <div v-else class="placeholder-image-large">
            <el-icon size="80"><Picture /></el-icon>
          </div>
        </div>

        <div class="detail-content">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="类型">
              <el-tag :type="getActivityTypeColor(selectedActivity.type)">
                {{ getActivityTypeLabel(selectedActivity.type) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="难度">
              <el-tag :type="getDifficultyColor(selectedActivity.difficulty)">
                {{ getDifficultyLabel(selectedActivity.difficulty) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="时长">{{ selectedActivity.duration }} 分钟</el-descriptions-item>
            <el-descriptions-item label="年龄段">
              {{ selectedActivity.ageRange.min }}-{{ selectedActivity.ageRange.max }}岁
            </el-descriptions-item>
          </el-descriptions>

          <div class="detail-section">
            <h4>活动目标</h4>
            <ul>
              <li v-for="objective in selectedActivity.objectives" :key="objective">{{ objective }}</li>
            </ul>
          </div>

          <div class="detail-section">
            <h4>所需材料</h4>
            <ul>
              <li v-for="material in selectedActivity.materials" :key="material">{{ material }}</li>
            </ul>
          </div>

          <div class="detail-section">
            <h4>活动说明</h4>
            <ol>
              <li v-for="(instruction, index) in selectedActivity.instructions" :key="index">
                {{ instruction }}
              </li>
            </ol>
          </div>

          <div v-if="selectedActivity.tags.length > 0" class="detail-section">
            <h4>标签</h4>
            <div class="tags-list">
              <el-tag
                v-for="tag in selectedActivity.tags"
                :key="tag"
                class="tag-item"
                type="info"
                effect="plain"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showActivityDialog = false">取消</el-button>
          <el-button type="primary" @click="startActivity(selectedActivity?.id)">
            开始训练
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加到计划对话框 -->
    <el-dialog v-model="showPlanDialog" title="添加到训练计划" width="500px">
      <el-form :model="planForm" label-width="100px">
        <el-form-item label="选择孩子" required>
          <el-select v-model="planForm.childId" placeholder="请选择孩子" style="width: 100%">
            <el-option
              v-for="child in children"
              :key="child.id"
              :label="child.name"
              :value="child.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="计划日期" required>
          <el-date-picker
            v-model="planForm.scheduledDate"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showPlanDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmAddToPlan">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Close,
  Star,
  Search,
  Picture,
  Clock,
  TrendCharts,
  User
} from '@element-plus/icons-vue'
import {
  trainingApi,
  type TrainingActivity,
  ActivityType,
  DifficultyLevel,
  type ActivityQueryParams
} from '@/api/modules/training'

const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(false)
const activities = ref<TrainingActivity[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)
const selectedActivity = ref<TrainingActivity | null>(null)
const showActivityDialog = ref(false)
const showPlanDialog = ref(false)
const children = ref<Array<{ id: string; name: string }>>([]) // 这里应该从用户数据获取

// 筛选器
const filters = ref<ActivityQueryParams>({
  type: undefined,
  difficulty: undefined,
  minAge: undefined,
  maxAge: undefined,
  search: undefined
})

const ageRange = ref<{ min: number; max: number } | null>(null)
const searchKeyword = ref('')
const showRecommendations = computed(() => route.query.recommended === 'true')

// 添加到计划表单
const planForm = ref({
  childId: '',
  scheduledDate: '',
  activityId: ''
})

// 获取活动列表
const fetchActivities = async () => {
  try {
    loading.value = true
    const params: ActivityQueryParams = {
      ...filters.value,
      page: currentPage.value,
      pageSize: pageSize.value
    }

    if (showRecommendations.value) {
      // 如果是推荐视图，获取推荐活动
      // 这里假设有一个默认的childId，实际应该从用户选择或上下文获取
      const response = await trainingApi.getRecommendedActivities('default-child-id')
      activities.value = response.data
      total.value = response.data.length
    } else {
      // 普通视图
      const response = await trainingApi.getActivities(params)
      activities.value = response.data.activities
      total.value = response.data.total
    }
  } catch (error) {
    console.error('获取活动列表失败:', error)
    ElMessage.error('加载活动列表失败')
  } finally {
    loading.value = false
  }
}

// 处理筛选
const handleFilter = () => {
  currentPage.value = 1
  fetchActivities()
}

// 处理年龄段变化
const handleAgeRangeChange = (value: { min: number; max: number } | null) => {
  if (value) {
    filters.value.minAge = value.min
    filters.value.maxAge = value.max
  } else {
    filters.value.minAge = undefined
    filters.value.maxAge = undefined
  }
  handleFilter()
}

// 搜索关键词处理
watch(searchKeyword, (newVal) => {
  filters.value.search = newVal || undefined
})

// 清除筛选条件
const clearFilters = () => {
  filters.value = {
    type: undefined,
    difficulty: undefined,
    minAge: undefined,
    maxAge: undefined,
    search: undefined
  }
  ageRange.value = null
  searchKeyword.value = ''
  handleFilter()
}

// 查看推荐活动
const viewRecommended = () => {
  router.push('/training-center/activities?recommended=true')
}

// 清除推荐视图
const clearRecommendations = () => {
  router.push('/training-center/activities')
}

// 查看活动详情
const viewActivityDetail = async (id: string) => {
  try {
    const response = await trainingApi.getActivityDetail(id)
    selectedActivity.value = response.data
    showActivityDialog.value = true
  } catch (error) {
    console.error('获取活动详情失败:', error)
    ElMessage.error('获取活动详情失败')
  }
}

// 开始活动
const startActivity = (activityId?: string) => {
  if (!activityId) return

  showActivityDialog.value = false
  // 这里可以跳转到活动执行页面
  router.push(`/training-center/activity/${activityId}/start`)
}

// 添加到计划
const addToPlan = (activityId: string) => {
  planForm.value.activityId = activityId
  showPlanDialog.value = true
}

// 确认添加到计划
const confirmAddToPlan = async () => {
  if (!planForm.value.childId || !planForm.value.scheduledDate) {
    ElMessage.warning('请填写完整信息')
    return
  }

  try {
    // 这里应该调用创建计划的API
    await trainingApi.createPlan({
      name: `训练计划 - ${new Date().toLocaleDateString()}`,
      description: '',
      childId: planForm.value.childId,
      activities: [{
        activityId: planForm.value.activityId,
        scheduledDate: planForm.value.scheduledDate
      }],
      goals: [],
      status: 'not_started' as any,
      startDate: planForm.value.scheduledDate
    })

    ElMessage.success('已添加到训练计划')
    showPlanDialog.value = false
    planForm.value = { childId: '', scheduledDate: '', activityId: '' }
  } catch (error) {
    console.error('添加到计划失败:', error)
    ElMessage.error('添加到计划失败')
  }
}

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchActivities()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchActivities()
}

// 工具函数
const getActivityTypeColor = (type: ActivityType) => {
  const colors = {
    [ActivityType.COGNITIVE]: 'primary',
    [ActivityType.MOTOR]: 'success',
    [ActivityType.LANGUAGE]: 'warning',
    [ActivityType.SOCIAL]: 'danger'
  }
  return colors[type] || 'default'
}

const getActivityTypeLabel = (type: ActivityType) => {
  const labels = {
    [ActivityType.COGNITIVE]: '认知',
    [ActivityType.MOTOR]: '运动',
    [ActivityType.LANGUAGE]: '语言',
    [ActivityType.SOCIAL]: '社交'
  }
  return labels[type] || '未知'
}

const getDifficultyColor = (difficulty: DifficultyLevel) => {
  const colors = {
    [DifficultyLevel.EASY]: 'success',
    [DifficultyLevel.MEDIUM]: 'warning',
    [DifficultyLevel.HARD]: 'danger'
  }
  return colors[difficulty] || 'default'
}

const getDifficultyLabel = (difficulty: DifficultyLevel) => {
  const labels = {
    [DifficultyLevel.EASY]: '简单',
    [DifficultyLevel.MEDIUM]: '中等',
    [DifficultyLevel.HARD]: '困难'
  }
  return labels[difficulty] || '未知'
}

// 页面挂载时获取数据
onMounted(() => {
  fetchActivities()
})
</script>

<style lang="scss" scoped>
.training-activities {
  padding: var(--spacing-lg);
  background-color: var(--bg-card);
  min-height: 100vh;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--spacing-xl);

    .header-left {
      .page-title {
        font-size: var(--font-size-extra-large);
        color: var(--text-primary);
        margin: 0 0 var(--spacing-xs) 0;
        font-weight: 600;
      }

      .page-description {
        font-size: var(--font-size-base);
        color: var(--text-regular);
        margin: 0;
      }
    }

    .header-actions {
      display: flex;
      gap: var(--spacing-sm);
    }
  }

  .filters-section {
    margin-bottom: var(--spacing-xl);

    .filters-card {
      :deep(.el-card__body) {
        padding: var(--spacing-lg);
      }
    }
  }

  .activities-content {
    .loading-container {
      padding: var(--spacing-xl);
    }

    .empty-state {
      padding: var(--spacing-xl);
      text-align: center;
    }

    .activities-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-xl);

      .activity-card {
        background: var(--card-bg);
        border-radius: var(--border-radius-lg);
        overflow: hidden;
        box-shadow: var(--box-shadow-light);
        transition: all 0.3s ease;
        cursor: pointer;

        &:hover {
          transform: translateY(-4px);
          box-shadow: var(--box-shadow-base);
        }

        .activity-header {
          position: relative;
          height: 180px;

          .activity-image {
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: var(--el-fill-color-lighter);

            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }

            .placeholder-image {
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: var(--text-placeholder);
            }
          }

          .activity-type {
            position: absolute;
            top: var(--spacing-md);
            right: var(--spacing-md);
          }
        }

        .activity-body {
          padding: var(--spacing-lg);

          .activity-name {
            font-size: var(--font-size-large);
            color: var(--text-primary);
            margin: 0 0 var(--spacing-sm) 0;
            font-weight: 600;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .activity-description {
            font-size: var(--font-size-base);
            color: var(--text-regular);
            margin: 0 0 var(--spacing-md) 0;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            line-height: 1.5;
          }

          .activity-meta {
            display: flex;
            gap: var(--spacing-md);
            margin-bottom: var(--spacing-md);
            flex-wrap: wrap;

            .meta-item {
              display: flex;
              align-items: center;
              gap: var(--spacing-xs);
              font-size: var(--font-size-small);
              color: var(--text-secondary);

              .el-icon {
                font-size: var(--text-sm);
              }
            }
          }

          .activity-tags {
            display: flex;
            gap: var(--spacing-xs);
            flex-wrap: wrap;
            margin-bottom: var(--spacing-md);
          }
        }

        .activity-footer {
          padding: var(--spacing-md) var(--spacing-lg);
          border-top: 1px solid var(--el-border-color-lighter);
          display: flex;
          gap: var(--spacing-sm);

          .el-button {
            flex: 1;
          }
        }
      }
    }

    .pagination-container {
      display: flex;
      justify-content: center;
      padding: var(--spacing-xl) 0;
    }
  }

  .activity-detail {
    .detail-image {
      margin-bottom: var(--spacing-lg);
      text-align: center;

      img {
        max-width: 100%;
        max-height: 300px;
        border-radius: var(--border-radius-lg);
        object-fit: cover;
      }

      .placeholder-image-large {
        width: 100%;
        height: 300px;
        background: var(--el-fill-color-lighter);
        border-radius: var(--border-radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-placeholder);
      }
    }

    .detail-content {
      .detail-section {
        margin-top: var(--spacing-lg);

        h4 {
          font-size: var(--font-size-large);
          color: var(--text-primary);
          margin: 0 0 var(--spacing-sm) 0;
        }

        ul, ol {
          margin: 0;
          padding-left: var(--spacing-lg);

          li {
            margin-bottom: var(--spacing-xs);
            color: var(--text-regular);
            line-height: 1.6;
          }
        }

        .tags-list {
          display: flex;
          gap: var(--spacing-sm);
          flex-wrap: wrap;
          margin-top: var(--spacing-sm);

          .tag-item {
            margin: 0;
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .training-activities {
    padding: var(--spacing-md);

    .page-header {
      flex-direction: column;
      gap: var(--spacing-md);
      align-items: flex-start;
    }

    .activities-grid {
      grid-template-columns: 1fr;
      gap: var(--spacing-md);

      .activity-card {
        .activity-header {
          height: 150px;
        }

        .activity-body {
          padding: var(--spacing-md);
        }
      }
    }
  }
}
</style>