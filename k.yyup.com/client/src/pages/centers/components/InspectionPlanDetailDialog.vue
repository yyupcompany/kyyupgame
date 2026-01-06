<template>
  <el-dialog
    v-model="dialogVisible"
    title="检查计划详情"
    width="900px"
    @close="handleClose"
  >
    <div v-loading="loading">
      <!-- 基本信息 -->
      <el-descriptions :column="2" border>
        <el-descriptions-item label="检查类型">
          {{ planDetail.inspectionTypeName }}
        </el-descriptions-item>
        <el-descriptions-item label="计划日期">
          {{ planDetail.plannedDate }}
        </el-descriptions-item>
        <el-descriptions-item label="负责人">
          {{ planDetail.responsiblePerson || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="联系电话">
          {{ planDetail.contactPhone || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="检查状态">
          <el-tag :type="getStatusType(planDetail.status)">
            {{ getStatusLabel(planDetail.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatDate(planDetail.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          {{ planDetail.notes || '-' }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 检查类型详情 -->
      <el-divider>检查类型详情</el-divider>
      <el-descriptions :column="2" border v-if="planDetail.inspectionType">
        <el-descriptions-item label="检查部门">
          {{ planDetail.inspectionType.department }}
        </el-descriptions-item>
        <el-descriptions-item label="检查频率">
          {{ planDetail.inspectionType.frequency }}
        </el-descriptions-item>
        <el-descriptions-item label="检查时长">
          {{ planDetail.inspectionType.duration }}天
        </el-descriptions-item>
        <el-descriptions-item label="分类">
          {{ getCategoryLabel(planDetail.inspectionType.category) }}
        </el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">
          {{ planDetail.inspectionType.description }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 检查要求 -->
      <el-divider v-if="planDetail.inspectionType?.requirements">检查要求</el-divider>
      <div
        v-if="planDetail.inspectionType?.requirements"
        class="requirements-content"
        v-html="planDetail.inspectionType.requirements"
      ></div>

      <!-- 所需文档 -->
      <el-divider v-if="planDetail.inspectionType?.requiredDocuments?.length">所需文档</el-divider>
      <div v-if="planDetail.inspectionType?.requiredDocuments?.length" class="documents-list">
        <el-tag
          v-for="(doc, index) in planDetail.inspectionType.requiredDocuments"
          :key="index"
          style="margin-right: var(--spacing-sm); margin-bottom: var(--spacing-sm)"
        >
          {{ doc }}
        </el-tag>
      </div>

      <!-- 检查标准 -->
      <el-divider v-if="planDetail.inspectionType?.standards?.length">检查标准</el-divider>
      <div class="table-wrapper">
<el-table class="responsive-table"
        v-if="planDetail.inspectionType?.standards?.length"
        :data="planDetail.inspectionType.standards"
        border
        style="margin-top: var(--text-lg)"
      >
        <el-table-column prop="item" label="检查项" min-width="200" />
        <el-table-column prop="standard" label="标准要求" min-width="300" />
        <el-table-column prop="score" label="分值" width="100" align="center" />
      </el-table>
</div>

      <!-- 任务列表 -->
      <el-divider>相关任务</el-divider>
      <el-table class="responsive-table"
        :data="planDetail.tasks"
        border
        style="margin-top: var(--text-lg)"
      >
        <el-table-column prop="taskName" label="任务名称" min-width="200" />
        <el-table-column prop="assignee" label="负责人" width="120" />
        <el-table-column prop="deadline" label="截止日期" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="120">
          <template #default="{ row }">
            <el-progress :percentage="row.progress || 0" :stroke-width="8" />
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!planDetail.tasks || planDetail.tasks.length === 0" description="暂无任务" />
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
      <el-button type="primary" @click="handleEdit">
        <UnifiedIcon name="Edit" />
        编辑
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Edit } from '@element-plus/icons-vue'
import { get } from '@/utils/request'

interface Props {
  visible: boolean
  planId?: number | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'edit', plan: any): void
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  planId: null
})

const emit = defineEmits<Emits>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const loading = ref(false)
const planDetail = ref<any>({})

// 加载计划详情
const loadPlanDetail = async () => {
  if (!props.planId) return

  try {
    loading.value = true
    const response = await get(`/inspection/plans/${props.planId}`)
    if (response.success) {
      planDetail.value = response.data || {}
    }
  } catch (error) {
    console.error('加载计划详情失败:', error)
    ElMessage.error('加载计划详情失败')
  } finally {
    loading.value = false
  }
}

// 获取状态标签
const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': '待开始',
    'preparing': '准备中',
    'in_progress': '进行中',
    'completed': '已完成',
    'overdue': '已逾期'
  }
  return statusMap[status] || status
}

// 获取状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    'pending': 'info',
    'preparing': 'warning',
    'in_progress': 'primary',
    'completed': 'success',
    'overdue': 'danger'
  }
  return typeMap[status] || 'info'
}

// 获取分类标签
const getCategoryLabel = (category: string) => {
  const categoryMap: Record<string, string> = {
    'annual': '年度检查',
    'special': '专项检查',
    'routine': '常态化督导'
  }
  return categoryMap[category] || category
}

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

// 编辑
const handleEdit = () => {
  emit('edit', planDetail.value)
  handleClose()
}

// 关闭对话框
const handleClose = () => {
  emit('update:visible', false)
}

// 监听对话框打开
watch(() => props.visible, (val) => {
  if (val) {
    loadPlanDetail()
  } else {
    planDetail.value = {}
  }
})
</script>

<style scoped lang="scss">
.requirements-content {
  padding: var(--text-lg);
  background: var(--bg-hover);
  border-radius: var(--spacing-xs);
  line-height: 1.8;

  :deep(ul) {
    margin: 0;
    padding-left: var(--text-2xl);
  }

  :deep(li) {
    margin-bottom: var(--spacing-sm);
  }
}

.documents-list {
  padding: var(--text-lg);
  background: var(--bg-hover);
  border-radius: var(--spacing-xs);
}
</style>

