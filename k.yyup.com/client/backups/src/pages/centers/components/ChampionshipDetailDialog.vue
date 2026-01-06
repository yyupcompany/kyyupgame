<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="900px"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    @close="handleClose"
  >
    <div class="championship-detail-content" v-loading="loading">
      <!-- 创建/编辑锦标赛表单 -->
      <div v-if="isCreateMode" class="championship-form-section">
        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="120px"
          label-position="left"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="锦标赛名称" prop="championship_name">
                <el-input v-model="formData.championship_name" placeholder="请输入锦标赛名称" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="锦标赛类型" prop="championship_type">
                <el-select v-model="formData.championship_type" placeholder="请选择类型">
                  <el-option label="脑科学竞赛" value="brain_science" />
                  <el-option label="综合能力赛" value="comprehensive" />
                  <el-option label="户外挑战赛" value="outdoor_challenge" />
                  <el-option label="创意展示赛" value="creative_display" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="比赛日期" prop="championship_date">
                <el-date-picker
                  v-model="formData.championship_date"
                  type="date"
                  placeholder="选择比赛日期"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="比赛地点" prop="location">
                <el-input v-model="formData.location" placeholder="请输入比赛地点" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="目标参与人数" prop="target_participant_count">
                <el-input-number
                  v-model="formData.target_participant_count"
                  :min="1"
                  :max="1000"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="预算金额" prop="budget_amount">
                <el-input-number
                  v-model="formData.budget_amount"
                  :min="0"
                  :precision="2"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="奖项描述" prop="awards_description">
            <el-input
              v-model="formData.awards_description"
              type="textarea"
              :rows="3"
              placeholder="请输入奖项设置描述"
            />
          </el-form-item>

          <el-form-item label="备注" prop="notes">
            <el-input
              v-model="formData.notes"
              type="textarea"
              :rows="2"
              placeholder="请输入备注信息"
            />
          </el-form-item>
        </el-form>
      </div>

      <!-- 锦标赛详情展示 -->
      <div v-else class="championship-info-section">
        <!-- 基本信息 -->
        <div class="basic-info-section">
          <div class="section-header">
            <h3>基本信息</h3>
            <div class="header-actions">
              <el-button size="small" @click="refreshDetail">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </div>
          
          <div class="basic-info-grid">
            <div class="info-item">
              <span class="label">锦标赛名称：</span>
              <span class="value">{{ championshipDetail?.championship_name || '--' }}</span>
            </div>
            <div class="info-item">
              <span class="label">比赛类型：</span>
              <span class="value">{{ getTypeText(championshipDetail?.championship_type) }}</span>
            </div>
            <div class="info-item">
              <span class="label">比赛日期：</span>
              <span class="value">{{ championshipDetail?.championship_date || '--' }}</span>
            </div>
            <div class="info-item">
              <span class="label">比赛地点：</span>
              <span class="value">{{ championshipDetail?.location || '--' }}</span>
            </div>
            <div class="info-item">
              <span class="label">参与人数：</span>
              <span class="value">{{ championshipDetail?.participant_count || 0 }} / {{ championshipDetail?.target_participant_count || 0 }}人</span>
            </div>
            <div class="info-item">
              <span class="label">完成状态：</span>
              <span class="value">
                <el-tag :type="getStatusType(championshipDetail?.completion_status)">
                  {{ getStatusText(championshipDetail?.completion_status) }}
                </el-tag>
              </span>
            </div>
          </div>
        </div>

        <!-- 达标率统计 -->
        <div class="achievement-stats-section">
          <div class="section-header">
            <h3>达标率统计</h3>
          </div>
          
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-label">神童计划达标率</div>
              <div class="stat-value primary">{{ championshipDetail?.brain_science_achievement_rate || 0 }}%</div>
              <el-progress 
                :percentage="championshipDetail?.brain_science_achievement_rate || 0" 
                :stroke-width="6"
                :show-text="false"
                color="var(--primary-color)"
              />
            </div>
            <div class="stat-item">
              <div class="stat-label">课程内容达标率</div>
              <div class="stat-value success">{{ championshipDetail?.course_content_achievement_rate || 0 }}%</div>
              <el-progress 
                :percentage="championshipDetail?.course_content_achievement_rate || 0" 
                :stroke-width="6"
                :show-text="false"
                color="var(--success-color)"
              />
            </div>
            <div class="stat-item">
              <div class="stat-label">户外训练达标率</div>
              <div class="stat-value warning">{{ championshipDetail?.outdoor_training_achievement_rate || 0 }}%</div>
              <el-progress 
                :percentage="championshipDetail?.outdoor_training_achievement_rate || 0" 
                :stroke-width="6"
                :show-text="false"
                color="var(--warning-color)"
              />
            </div>
            <div class="stat-item">
              <div class="stat-label">外出活动达标率</div>
              <div class="stat-value info">{{ championshipDetail?.external_display_achievement_rate || 0 }}%</div>
              <el-progress 
                :percentage="championshipDetail?.external_display_achievement_rate || 0" 
                :stroke-width="6"
                :show-text="false"
                color="var(--info-color)"
              />
            </div>
          </div>
        </div>

        <!-- 财务信息 -->
        <div class="financial-info-section" v-if="championshipDetail?.budget_amount">
          <div class="section-header">
            <h3>财务信息</h3>
          </div>
          
          <div class="financial-info-grid">
            <div class="info-item">
              <span class="label">预算金额：</span>
              <span class="value">¥{{ championshipDetail?.budget_amount || 0 }}</span>
            </div>
            <div class="info-item">
              <span class="label">实际花费：</span>
              <span class="value">¥{{ championshipDetail?.actual_cost || 0 }}</span>
            </div>
            <div class="info-item">
              <span class="label">预算执行率：</span>
              <span class="value">{{ getBudgetExecutionRate() }}%</span>
            </div>
          </div>
        </div>

        <!-- 其他信息 -->
        <div class="other-info-section">
          <div class="section-header">
            <h3>其他信息</h3>
          </div>
          
          <div class="other-info-content">
            <div class="info-block" v-if="championshipDetail?.awards_description">
              <div class="block-title">奖项设置</div>
              <div class="block-content">{{ championshipDetail.awards_description }}</div>
            </div>
            <div class="info-block" v-if="championshipDetail?.media_coverage">
              <div class="block-title">媒体报道</div>
              <div class="block-content">{{ championshipDetail.media_coverage }}</div>
            </div>
            <div class="info-block" v-if="championshipDetail?.results_summary">
              <div class="block-title">结果总结</div>
              <div class="block-content">{{ championshipDetail.results_summary }}</div>
            </div>
            <div class="info-block" v-if="championshipDetail?.notes">
              <div class="block-title">备注</div>
              <div class="block-content">{{ championshipDetail.notes }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!isCreateMode && !championshipDetail" class="empty-state">
        <el-empty description="暂无数据" />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button v-if="isCreateMode" type="primary" @click="handleSubmit" :loading="submitting">
          创建锦标赛
        </el-button>
        <el-button v-else type="primary" @click="updateStatus" :loading="submitting">
          更新状态
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { teachingCenterApi } from '@/api/endpoints/teaching-center'

interface Props {
  modelValue: boolean
  championshipData: any
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  refresh: []
}>()

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const championshipDetail = ref(null)
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive({
  championship_name: '',
  championship_type: '',
  championship_date: '',
  location: '',
  target_participant_count: 100,
  budget_amount: 0,
  awards_description: '',
  notes: ''
})

// 表单验证规则
const formRules: FormRules = {
  championship_name: [
    { required: true, message: '请输入锦标赛名称', trigger: 'blur' }
  ],
  championship_type: [
    { required: true, message: '请选择锦标赛类型', trigger: 'change' }
  ],
  championship_date: [
    { required: true, message: '请选择比赛日期', trigger: 'change' }
  ],
  location: [
    { required: true, message: '请输入比赛地点', trigger: 'blur' }
  ]
}

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isCreateMode = computed(() => !props.championshipData)

const dialogTitle = computed(() => {
  return isCreateMode.value ? '创建锦标赛' : `${props.championshipData?.championship_name || ''} - 详情`
})

// 监听弹窗显示状态
watch(() => props.modelValue, (visible) => {
  if (visible) {
    if (isCreateMode.value) {
      resetForm()
    } else if (props.championshipData?.id) {
      loadChampionshipDetail()
    }
  }
})

// 方法
const handleClose = () => {
  emit('update:modelValue', false)
}

const refreshDetail = () => {
  if (props.championshipData?.id) {
    loadChampionshipDetail()
  }
}

const resetForm = () => {
  Object.assign(formData, {
    championship_name: '',
    championship_type: '',
    championship_date: '',
    location: '',
    target_participant_count: 100,
    budget_amount: 0,
    awards_description: '',
    notes: ''
  })
  formRef.value?.clearValidate()
}

const getTypeText = (type: string) => {
  const typeMap = {
    brain_science: '脑科学竞赛',
    comprehensive: '综合能力赛',
    outdoor_challenge: '户外挑战赛',
    creative_display: '创意展示赛'
  }
  return typeMap[type] || type
}

const getStatusText = (status: string) => {
  const statusMap = {
    'not_started': '未开始',
    'in_progress': '进行中',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return statusMap[status] || status
}

const getStatusType = (status: string) => {
  const typeMap = {
    'not_started': 'info',
    'in_progress': 'warning',
    'completed': 'success',
    'cancelled': 'danger'
  }
  return typeMap[status] || 'info'
}

const getBudgetExecutionRate = () => {
  const budget = championshipDetail.value?.budget_amount || 0
  const actual = championshipDetail.value?.actual_cost || 0
  return budget > 0 ? Math.round((actual / budget) * 100) : 0
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    const response = await teachingCenterApi.createChampionship(formData)
    if (response.success) {
      ElMessage.success('锦标赛创建成功')
      emit('refresh')
      handleClose()
    }
  } catch (error) {
    console.error('创建锦标赛失败:', error)
    ElMessage.error('创建失败')
  } finally {
    submitting.value = false
  }
}

const updateStatus = async () => {
  try {
    const { value: status } = await ElMessageBox.prompt('请选择新状态', '更新锦标赛状态', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputType: 'select',
      inputOptions: {
        'not_started': '未开始',
        'in_progress': '进行中',
        'completed': '已完成',
        'cancelled': '已取消'
      }
    })

    submitting.value = true
    const response = await teachingCenterApi.updateChampionshipStatus(
      props.championshipData.id,
      { status }
    )
    
    if (response.success) {
      ElMessage.success('状态更新成功')
      emit('refresh')
      loadChampionshipDetail()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('更新状态失败:', error)
      ElMessage.error('更新失败')
    }
  } finally {
    submitting.value = false
  }
}

const loadChampionshipDetail = async () => {
  try {
    loading.value = true
    const response = await teachingCenterApi.getChampionshipDetails(props.championshipData.id)
    if (response.success) {
      championshipDetail.value = response.data
    }
  } catch (error) {
    console.error('加载锦标赛详情失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/design-tokens.scss';

.championship-detail-content {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--text-lg);

    h3 {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--text-primary);
    }

    .header-actions {
      display: flex;
      gap: var(--spacing-sm);
    }
  }

  // 表单部分
  .championship-form-section {
    .el-form {
      .el-form-item {
        margin-bottom: var(--text-2xl);
      }
    }
  }

  // 详情展示部分
  .championship-info-section {
    .basic-info-section,
    .achievement-stats-section,
    .financial-info-section,
    .other-info-section {
      margin-bottom: var(--text-3xl);
      padding: var(--text-lg);
      background: var(--el-bg-color-page);
      border-radius: var(--radius-md);
      border: var(--border-width-base) solid var(--border-color);
    }

    .basic-info-grid,
    .financial-info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--text-lg);

      .info-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);

        .label {
          font-size: var(--text-base);
          color: var(--text-secondary);
          white-space: nowrap;
          min-width: 100px;
        }

        .value {
          font-size: var(--text-base);
          font-weight: 500;
          color: var(--text-primary);
        }
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--text-2xl);

      .stat-item {
        text-align: center;
        padding: var(--text-lg);
        background: var(--el-bg-color);
        border-radius: var(--radius-md);
        border: var(--border-width-base) solid var(--border-color);

        .stat-label {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          margin-bottom: var(--spacing-sm);
        }

        .stat-value {
          font-size: var(--text-3xl);
          font-weight: 600;
          margin-bottom: var(--text-sm);

          &.primary {
            color: var(--el-color-primary);
          }

          &.success {
            color: var(--el-color-success);
          }

          &.warning {
            color: var(--el-color-warning);
          }

          &.info {
            color: var(--el-color-info);
          }
        }

        .el-progress {
          margin-top: var(--spacing-sm);
        }
      }
    }

    .other-info-content {
      display: flex;
      flex-direction: column;
      gap: var(--text-lg);

      .info-block {
        .block-title {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-sm);
        }

        .block-content {
          font-size: var(--text-base);
          color: var(--text-secondary);
          line-height: 1.6;
          padding: var(--text-sm);
          background: var(--el-bg-color);
          border-radius: var(--radius-sm);
          border: var(--border-width-base) solid var(--border-color);
        }
      }
    }
  }

  .empty-state {
    padding: var(--spacing-10xl);
    text-align: center;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--text-sm);
}

// 移动端适配
@media (max-width: var(--breakpoint-md)) {
  .championship-detail-content {
    .basic-info-grid,
    .financial-info-grid {
      grid-template-columns: 1fr;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: var(--text-sm);

      .stat-item {
        padding: var(--text-sm);

        .stat-value {
          font-size: var(--text-2xl);
        }
      }
    }
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .championship-detail-content {
    .stats-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
