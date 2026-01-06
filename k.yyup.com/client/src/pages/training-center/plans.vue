<template>
  <div class="training-plans">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">训练计划</h1>
        <p class="page-description">管理孩子的训练计划</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          创建计划
        </el-button>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="filters-section">
      <el-card class="filters-card">
        <el-form :model="filters" label-position="top" @submit.prevent="handleFilter">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="6">
              <el-form-item label="孩子">
                <el-select
                  v-model="filters.childId"
                  placeholder="选择孩子"
                  clearable
                  @change="handleFilter"
                >
                  <el-option
                    v-for="child in children"
                    :key="child.id"
                    :label="child.name"
                    :value="child.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :xs="24" :sm="12" :md="6">
              <el-form-item label="计划状态">
                <el-select
                  v-model="filters.status"
                  placeholder="选择状态"
                  clearable
                  @change="handleFilter"
                >
                  <el-option label="未开始" :value="PlanStatus.NOT_STARTED" />
                  <el-option label="进行中" :value="PlanStatus.IN_PROGRESS" />
                  <el-option label="已暂停" :value="PlanStatus.PAUSED" />
                  <el-option label="已完成" :value="PlanStatus.COMPLETED" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item label="时间范围">
                <el-date-picker
                  v-model="dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  @change="handleDateRangeChange"
                />
              </el-form-item>
            </el-col>

            <el-col :xs="24" :sm="12" :md="4">
              <el-form-item label=" ">
                <el-button type="primary" @click="handleFilter">
                  <el-icon><Search /></el-icon>
                  筛选
                </el-button>
                <el-button @click="clearFilters">重置</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
    </div>

    <!-- 计划列表 -->
    <div class="plans-content">
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="6" animated />
      </div>

      <div v-else-if="plans.length === 0" class="empty-state">
        <el-empty description="暂无训练计划">
          <el-button type="primary" @click="showCreateDialog = true">创建第一个计划</el-button>
        </el-empty>
      </div>

      <div v-else class="plans-grid">
        <div
          v-for="plan in plans"
          :key="plan.id"
          class="plan-card"
        >
          <div class="plan-header">
            <h3 class="plan-name">{{ plan.name }}</h3>
            <el-tag :type="getStatusColor(plan.status)" size="small">
              {{ getStatusLabel(plan.status) }}
            </el-tag>
          </div>

          <div class="plan-body">
            <p class="plan-description">{{ plan.description || '暂无描述' }}</p>

            <div class="plan-info">
              <div class="info-item">
                <span class="label">孩子：</span>
                <span class="value">{{ getChildName(plan.childId) }}</span>
              </div>
              <div class="info-item">
                <span class="label">开始时间：</span>
                <span class="value">{{ formatDate(plan.startDate) }}</span>
              </div>
              <div class="info-item" v-if="plan.endDate">
                <span class="label">结束时间：</span>
                <span class="value">{{ formatDate(plan.endDate) }}</span>
              </div>
              <div class="info-item">
                <span class="label">活动数量：</span>
                <span class="value">{{ plan.activities.length }} 个</span>
              </div>
            </div>

            <div class="plan-progress">
              <div class="progress-header">
                <span>完成进度</span>
                <span class="progress-text">{{ getProgress(plan) }}%</span>
              </div>
              <el-progress
                :percentage="getProgress(plan)"
                :stroke-width="8"
                :show-text="false"
              />
            </div>

            <div v-if="plan.goals.length > 0" class="plan-goals">
              <h4>训练目标</h4>
              <ul>
                <li v-for="goal in plan.goals.slice(0, 2)" :key="goal">{{ goal }}</li>
                <li v-if="plan.goals.length > 2">还有 {{ plan.goals.length - 2 }} 个目标...</li>
              </ul>
            </div>
          </div>

          <div class="plan-footer">
            <el-button type="primary" plain size="small" @click="viewPlanDetail(plan.id)">
              查看详情
            </el-button>
            <el-dropdown @command="(command) => handlePlanAction(command, plan.id)">
              <el-button type="default" plain size="small">
                更多 <el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">编辑计划</el-dropdown-item>
                  <el-dropdown-item
                    v-if="plan.status === PlanStatus.NOT_STARTED"
                    command="start"
                  >
                    开始执行
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="plan.status === PlanStatus.IN_PROGRESS"
                    command="pause"
                  >
                    暂停计划
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="plan.status === PlanStatus.PAUSED"
                    command="resume"
                  >
                    继续执行
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="plan.status !== PlanStatus.COMPLETED"
                    command="complete"
                  >
                    标记完成
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="plan.status === PlanStatus.COMPLETED"
                    command="restart"
                  >
                    重新开始
                  </el-dropdown-item>
                  <el-dropdown-item divided command="delete">删除计划</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
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

    <!-- 创建计划对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="创建训练计划"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-width="100px"
      >
        <el-form-item label="计划名称" prop="name">
          <el-input
            v-model="createForm.name"
            placeholder="请输入计划名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="孩子" prop="childId">
          <el-select v-model="createForm.childId" placeholder="请选择孩子" style="width: 100%">
            <el-option
              v-for="child in children"
              :key="child.id"
              :label="child.name"
              :value="child.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="计划描述">
          <el-input
            v-model="createForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入计划描述（可选）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker
            v-model="createForm.startDate"
            type="date"
            placeholder="选择开始日期"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="结束日期">
          <el-date-picker
            v-model="createForm.endDate"
            type="date"
            placeholder="选择结束日期（可选）"
            style="width: 100%"
            :disabled-date="(date) => {
              return createForm.startDate && date < new Date(createForm.startDate)
            }"
          />
        </el-form-item>

        <el-form-item label="训练目标">
          <div class="goals-input">
            <el-input
              v-for="(goal, index) in createForm.goals"
              :key="index"
              v-model="createForm.goals[index]"
              placeholder="输入训练目标"
              class="goal-item"
            >
              <template #append>
                <el-button
                  v-if="createForm.goals.length > 1"
                  @click="removeGoal(index)"
                  icon="Delete"
                />
              </template>
            </el-input>
            <el-button
              type="primary"
              plain
              @click="addGoal"
              style="width: 100%; margin-top: var(--spacing-sm)"
            >
              <el-icon><Plus /></el-icon>
              添加目标
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="选择活动">
          <el-button type="primary" plain @click="showActivitySelector = true">
            <el-icon><Grid /></el-icon>
            选择活动
          </el-button>
          <div v-if="selectedActivities.length > 0" class="selected-activities">
            <el-tag
              v-for="activity in selectedActivities"
              :key="activity.id"
              closable
              @close="removeActivity(activity.id)"
              class="activity-tag"
            >
              {{ activity.name }}
            </el-tag>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmCreatePlan" :loading="creating">
            创建计划
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 活动选择器 -->
    <el-dialog
      v-model="showActivitySelector"
      title="选择训练活动"
      width="800px"
      destroy-on-close
    >
      <div class="activity-selector">
        <el-input
          v-model="activitySearchKeyword"
          placeholder="搜索活动名称"
          @input="searchActivities"
          style="margin-bottom: var(--spacing-md)"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <div class="activity-list">
          <div
            v-for="activity in availableActivities"
            :key="activity.id"
            class="activity-item"
            :class="{ selected: isActivitySelected(activity.id) }"
            @click="toggleActivity(activity)"
          >
            <div class="activity-info">
              <h4>{{ activity.name }}</h4>
              <p>{{ activity.description }}</p>
              <div class="activity-meta">
                <el-tag size="small" :type="getActivityTypeColor(activity.type)">
                  {{ getActivityTypeLabel(activity.type) }}
                </el-tag>
                <span class="duration">{{ activity.duration }}分钟</span>
              </div>
            </div>
            <div class="activity-check">
              <el-checkbox :model-value="isActivitySelected(activity.id)" />
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showActivitySelector = false">取消</el-button>
          <el-button type="primary" @click="confirmActivitySelection">
            确定选择 ({{ selectedActivities.length }})
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  Plus,
  Search,
  ArrowDown,
  Grid,
  Delete
} from '@element-plus/icons-vue'
import {
  trainingApi,
  type TrainingPlan,
  type TrainingActivity,
  PlanStatus,
  ActivityType,
  type PlanQueryParams
} from '@/api/modules/training'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const creating = ref(false)
const plans = ref<TrainingPlan[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)
const children = ref<Array<{ id: string; name: string }>>([]) // 应该从用户数据获取

// 筛选器
const filters = ref<PlanQueryParams>({
  childId: undefined,
  status: undefined,
  startDate: undefined,
  endDate: undefined
})

const dateRange = ref<[Date, Date] | null>(null)

// 对话框状态
const showCreateDialog = ref(false)
const showActivitySelector = ref(false)

// 表单数据
const createFormRef = ref<FormInstance>()
const createForm = reactive({
  name: '',
  childId: '',
  description: '',
  startDate: '',
  endDate: '',
  goals: ['']
})

const createRules: FormRules = {
  name: [
    { required: true, message: '请输入计划名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  childId: [
    { required: true, message: '请选择孩子', trigger: 'change' }
  ],
  startDate: [
    { required: true, message: '请选择开始日期', trigger: 'change' }
  ]
}

// 活动选择相关
const selectedActivities = ref<TrainingActivity[]>([])
const availableActivities = ref<TrainingActivity[]>([])
const activitySearchKeyword = ref('')

// 获取计划列表
const fetchPlans = async () => {
  try {
    loading.value = true
    const params: PlanQueryParams = {
      ...filters.value,
      page: currentPage.value,
      pageSize: pageSize.value
    }

    const response = await trainingApi.getPlans(params)
    plans.value = response.data.plans
    total.value = response.data.total
  } catch (error) {
    console.error('获取计划列表失败:', error)
    ElMessage.error('加载计划列表失败')
  } finally {
    loading.value = false
  }
}

// 处理筛选
const handleFilter = () => {
  currentPage.value = 1
  fetchPlans()
}

// 处理日期范围变化
const handleDateRangeChange = (dates: [Date, Date] | null) => {
  if (dates) {
    filters.value.startDate = dates[0].toISOString().split('T')[0]
    filters.value.endDate = dates[1].toISOString().split('T')[0]
  } else {
    filters.value.startDate = undefined
    filters.value.endDate = undefined
  }
  handleFilter()
}

// 清除筛选条件
const clearFilters = () => {
  filters.value = {
    childId: undefined,
    status: undefined,
    startDate: undefined,
    endDate: undefined
  }
  dateRange.value = null
  handleFilter()
}

// 获取进度
const getProgress = (plan: TrainingPlan) => {
  if (plan.activities.length === 0) return 0
  const completed = plan.activities.filter(a => a.completedAt).length
  return Math.round((completed / plan.activities.length) * 100)
}

// 获取状态颜色
const getStatusColor = (status: PlanStatus) => {
  const colors = {
    [PlanStatus.NOT_STARTED]: 'info',
    [PlanStatus.IN_PROGRESS]: 'primary',
    [PlanStatus.PAUSED]: 'warning',
    [PlanStatus.COMPLETED]: 'success'
  }
  return colors[status] || 'default'
}

// 获取状态标签
const getStatusLabel = (status: PlanStatus) => {
  const labels = {
    [PlanStatus.NOT_STARTED]: '未开始',
    [PlanStatus.IN_PROGRESS]: '进行中',
    [PlanStatus.PAUSED]: '已暂停',
    [PlanStatus.COMPLETED]: '已完成'
  }
  return labels[status] || '未知'
}

// 获取孩子名称
const getChildName = (childId: string) => {
  const child = children.value.find(c => c.id === childId)
  return child ? child.name : '未知孩子'
}

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 查看计划详情
const viewPlanDetail = (planId: string) => {
  router.push(`/training-center/plans/${planId}`)
}

// 处理计划操作
const handlePlanAction = async (command: string, planId: string) => {
  try {
    switch (command) {
      case 'edit':
        router.push(`/training-center/plans/${planId}/edit`)
        break
      case 'start':
        await trainingApi.updatePlanStatus(planId, PlanStatus.IN_PROGRESS)
        ElMessage.success('计划已开始')
        fetchPlans()
        break
      case 'pause':
        await trainingApi.updatePlanStatus(planId, PlanStatus.PAUSED)
        ElMessage.success('计划已暂停')
        fetchPlans()
        break
      case 'resume':
        await trainingApi.updatePlanStatus(planId, PlanStatus.IN_PROGRESS)
        ElMessage.success('计划已恢复')
        fetchPlans()
        break
      case 'complete':
        await ElMessageBox.confirm('确定要标记此计划为完成吗？', '确认操作', {
          type: 'warning'
        })
        await trainingApi.updatePlanStatus(planId, PlanStatus.COMPLETED)
        ElMessage.success('计划已完成')
        fetchPlans()
        break
      case 'restart':
        await ElMessageBox.confirm('确定要重新开始此计划吗？', '确认操作', {
          type: 'warning'
        })
        await trainingApi.updatePlanStatus(planId, PlanStatus.NOT_STARTED)
        ElMessage.success('计划已重置')
        fetchPlans()
        break
      case 'delete':
        await ElMessageBox.confirm('删除后无法恢复，确定要删除吗？', '确认删除', {
          type: 'error'
        })
        await trainingApi.deletePlan(planId)
        ElMessage.success('计划已删除')
        fetchPlans()
        break
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('操作失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

// 添加训练目标
const addGoal = () => {
  createForm.goals.push('')
}

// 移除训练目标
const removeGoal = (index: number) => {
  createForm.goals.splice(index, 1)
}

// 搜索活动
const searchActivities = async () => {
  try {
    const response = await trainingApi.getActivities({
      search: activitySearchKeyword.value,
      pageSize: 50
    })
    availableActivities.value = response.data.activities
  } catch (error) {
    console.error('搜索活动失败:', error)
  }
}

// 检查活动是否已选择
const isActivitySelected = (activityId: string) => {
  return selectedActivities.value.some(a => a.id === activityId)
}

// 切换活动选择
const toggleActivity = (activity: TrainingActivity) => {
  const index = selectedActivities.value.findIndex(a => a.id === activity.id)
  if (index > -1) {
    selectedActivities.value.splice(index, 1)
  } else {
    selectedActivities.value.push(activity)
  }
}

// 移除已选择的活动
const removeActivity = (activityId: string) => {
  const index = selectedActivities.value.findIndex(a => a.id === activityId)
  if (index > -1) {
    selectedActivities.value.splice(index, 1)
  }
}

// 确认活动选择
const confirmActivitySelection = () => {
  showActivitySelector.value = false
}

// 确认创建计划
const confirmCreatePlan = async () => {
  if (!createFormRef.value) return

  try {
    await createFormRef.value.validate()
    creating.value = true

    const planData = {
      name: createForm.name,
      description: createForm.description,
      childId: createForm.childId,
      activities: selectedActivities.value.map(activity => ({
        activityId: activity.id,
        scheduledDate: createForm.startDate
      })),
      goals: createForm.goals.filter(goal => goal.trim()),
      status: PlanStatus.NOT_STARTED,
      startDate: createForm.startDate,
      endDate: createForm.endDate || undefined
    }

    await trainingApi.createPlan(planData)
    ElMessage.success('计划创建成功')
    showCreateDialog.value = false
    resetCreateForm()
    fetchPlans()
  } catch (error) {
    console.error('创建计划失败:', error)
    ElMessage.error('创建计划失败')
  } finally {
    creating.value = false
  }
}

// 重置创建表单
const resetCreateForm = () => {
  createForm.name = ''
  createForm.childId = ''
  createForm.description = ''
  createForm.startDate = ''
  createForm.endDate = ''
  createForm.goals = ['']
  selectedActivities.value = []
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

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchPlans()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchPlans()
}

// 页面挂载时获取数据
onMounted(() => {
  fetchPlans()
  searchActivities()
})
</script>

<style lang="scss" scoped>
.training-plans {
  padding: var(--spacing-lg);
  background-color: var(--bg-color);
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
  }

  .filters-section {
    margin-bottom: var(--spacing-xl);

    .filters-card {
      :deep(.el-card__body) {
        padding: var(--spacing-lg);
      }
    }
  }

  .plans-content {
    .loading-container {
      padding: var(--spacing-xl);
    }

    .empty-state {
      padding: var(--spacing-xl);
      text-align: center;
    }

    .plans-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-xl);

      .plan-card {
        background: var(--card-bg);
        border-radius: var(--border-radius-lg);
        box-shadow: var(--box-shadow-light);
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-4px);
          box-shadow: var(--box-shadow-base);
        }

        .plan-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-md) var(--spacing-lg);

          .plan-name {
            font-size: var(--font-size-large);
            color: var(--text-primary);
            margin: 0;
            font-weight: 600;
            flex: 1;
            margin-right: var(--spacing-md);
          }
        }

        .plan-body {
          padding: 0 var(--spacing-lg) var(--spacing-lg) var(--spacing-lg);

          .plan-description {
            color: var(--text-regular);
            margin: 0 0 var(--spacing-md) 0;
            line-height: 1.6;
          }

          .plan-info {
            margin-bottom: var(--spacing-md);

            .info-item {
              display: flex;
              margin-bottom: var(--spacing-xs);
              font-size: var(--font-size-small);

              .label {
                color: var(--text-secondary);
                min-width: 80px;
              }

              .value {
                color: var(--text-primary);
                font-weight: 500;
              }
            }
          }

          .plan-progress {
            margin-bottom: var(--spacing-md);

            .progress-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: var(--spacing-xs);
              font-size: var(--font-size-small);

              .progress-text {
                color: var(--el-color-primary);
                font-weight: 600;
              }
            }
          }

          .plan-goals {
            h4 {
              font-size: var(--font-size-base);
              color: var(--text-primary);
              margin: 0 0 var(--spacing-sm) 0;
            }

            ul {
              margin: 0;
              padding-left: var(--spacing-lg);

              li {
                font-size: var(--font-size-small);
                color: var(--text-regular);
                margin-bottom: var(--spacing-xs);
                line-height: 1.5;
              }
            }
          }
        }

        .plan-footer {
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

  .goals-input {
    .goal-item {
      margin-bottom: var(--spacing-sm);
    }
  }

  .selected-activities {
    margin-top: var(--spacing-md);
    display: flex;
    gap: var(--spacing-xs);
    flex-wrap: wrap;

    .activity-tag {
      margin: 0;
    }
  }

  .activity-selector {
    .activity-list {
      max-height: 400px;
      overflow-y: auto;
      border: 1px solid var(--el-border-color-lighter);
      border-radius: var(--border-radius-base);

      .activity-item {
        display: flex;
        align-items: center;
        padding: var(--spacing-md);
        border-bottom: 1px solid var(--el-border-color-lighter);
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          background-color: var(--el-fill-color-light);
        }

        &.selected {
          background-color: var(--el-color-primary-light-9);
        }

        &:last-child {
          border-bottom: none;
        }

        .activity-info {
          flex: 1;

          h4 {
            margin: 0 0 var(--spacing-xs) 0;
            font-size: var(--font-size-base);
            color: var(--text-primary);
          }

          p {
            margin: 0 0 var(--spacing-xs) 0;
            font-size: var(--font-size-small);
            color: var(--text-secondary);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .activity-meta {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);

            .duration {
              font-size: var(--font-size-small);
              color: var(--text-secondary);
            }
          }
        }

        .activity-check {
          margin-left: var(--spacing-md);
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .training-plans {
    padding: var(--spacing-md);

    .page-header {
      flex-direction: column;
      gap: var(--spacing-md);
      align-items: flex-start;
    }

    .plans-grid {
      grid-template-columns: 1fr;
      gap: var(--spacing-md);

      .plan-card {
        .plan-header {
          padding: var(--spacing-md);
        }

        .plan-body {
          padding: 0 var(--spacing-md) var(--spacing-md) var(--spacing-md);
        }

        .plan-footer {
          padding: var(--spacing-sm) var(--spacing-md);
        }
      }
    }
  }
}
</style>