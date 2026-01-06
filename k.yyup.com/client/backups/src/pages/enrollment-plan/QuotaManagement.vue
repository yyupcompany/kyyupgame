<template>
  <div class="page-container">
    <el-page-header @back="goBack" :title="`招生计划 #${planId}`">
      <template #content>
        <span class="page-title">名额管理</span>
      </template>
      <template #extra>
        <el-button-group>
          <el-button type="primary" @click="openAddQuotaDialog">
            <el-icon><Plus /></el-icon>添加名额
          </el-button>
          <el-button type="primary" @click="openBatchAddDialog">
            <el-icon><Files /></el-icon>批量添加
          </el-button>
          <el-button type="warning" @click="openBatchAdjustDialog" :disabled="!hasSelectedRows">
            <el-icon><Edit /></el-icon>批量调整
          </el-button>
          <el-button type="danger" @click="handleBatchDelete" :disabled="!hasSelectedRows">
            <el-icon><Delete /></el-icon>批量删除
          </el-button>
          <el-button @click="handleExport">
            <el-icon><Download /></el-icon>导出
          </el-button>
        </el-button-group>
      </template>
    </el-page-header>

    <div class="content-section">
      <!-- 统计卡片 -->
      <QuotaStatistics :planId="planId" />
      
      <!-- 筛选和搜索 -->
      <el-card shadow="hover" class="filter-card">
        <el-form :model="queryParams" inline>
          <el-form-item label="班级名称">
            <el-input v-model="queryParams.className" placeholder="输入班级名称" clearable />
          </el-form-item>
          <el-form-item label="年龄段">
            <el-select v-model="queryParams.ageRange" placeholder="选择年龄段" clearable>
              <el-option v-for="age in ageRangeOptions" :key="age" :label="age" :value="age" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchQuotas">查询</el-button>
            <el-button @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 数据表格 -->
      <el-card shadow="hover" class="table-card">
        <el-table
          v-loading="loading"
          :data="quotaList"
          border
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" :width="tableColumnSelection" />
          <el-table-column type="index" :width="tableColumnIndex" label="#" />
          <el-table-column prop="className" label="班级名称" sortable />
          <el-table-column prop="ageRange" label="年龄段" sortable :width="tableColumnMd" />
          <el-table-column prop="totalQuota" label="总名额" sortable :width="tableColumnSm" />
          <el-table-column prop="usedQuota" label="已使用" :width="tableColumnSm" />
          <el-table-column prop="remainingQuota" label="剩余" :width="tableColumnSm" />
          <el-table-column prop="usageRate" label="使用率" :width="tableColumnMd">
            <template #default="scope">
              <el-progress 
                :percentage="scope.row.usageRate" 
                :color="getProgressColor(scope.row.usageRate)"
              />
            </template>
          </el-table-column>
          <el-table-column prop="lastUpdated" label="更新时间" :width="tableColumnLg" sortable />
          <el-table-column label="操作" :width="tableColumnXl" fixed="right">
            <template #default="scope">
              <el-button-group>
                <el-button type="primary" link @click="openEditDialog(scope.row)">
                  <el-icon><Edit /></el-icon>编辑
                </el-button>
                <el-button type="primary" link @click="openAdjustDialog(scope.row)">
                  <el-icon><DocumentAdd /></el-icon>调整
                </el-button>
                <el-button type="danger" link @click="handleDelete(scope.row)">
                  <el-icon><Delete /></el-icon>删除
                </el-button>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="queryParams.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 添加/编辑名额对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加班级名额' : '编辑班级名额'"
      :width="dialogWidthSm"
    >
      <el-form
        ref="quotaFormRef"
        :model="quotaForm"
        :rules="rules"
        :label-width="formLabelWidth"
      >
        <el-form-item label="班级名称" prop="className">
          <el-input v-model="quotaForm.className" placeholder="请输入班级名称" />
        </el-form-item>
        <el-form-item label="年龄段" prop="ageRange">
          <el-select v-model="quotaForm.ageRange" placeholder="请选择年龄段" style="width: 100%">
            <el-option v-for="age in ageRangeOptions" :key="age" :label="age" :value="age" />
          </el-select>
        </el-form-item>
        <el-form-item label="招生名额" prop="totalQuota">
          <el-input-number v-model="quotaForm.totalQuota" :min="1" :max="100" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitQuotaForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 批量添加名额对话框 -->
    <el-dialog
      v-model="batchDialogVisible"
      title="批量添加班级名额"
      :width="dialogWidthLg"
    >
      <el-form
        ref="batchFormRef"
        :model="batchForm"
        :rules="batchRules"
        :label-width="formLabelWidth"
      >
        <el-form-item label="班级名额" prop="quotas">
          <div v-for="(item, index) in batchForm.quotas" :key="index" class="batch-item">
            <el-row :gutter="rowGutter">
              <el-col :span="8">
                <el-form-item
                  :prop="`quotas.${index}.className`"
                  :rules="[{ required: true, message: '请输入班级名称', trigger: 'blur' }]"
                  label-width="0"
                >
                  <el-input v-model="item.className" placeholder="班级名称" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item
                  :prop="`quotas.${index}.ageRange`"
                  :rules="[{ required: true, message: '请选择年龄段', trigger: 'change' }]"
                  label-width="0"
                >
                  <el-select v-model="item.ageRange" placeholder="年龄段" style="width: 100%">
                    <el-option v-for="age in ageRangeOptions" :key="age" :label="age" :value="age" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item
                  :prop="`quotas.${index}.totalQuota`"
                  :rules="[{ required: true, message: '请输入名额数', trigger: 'blur' }]"
                  label-width="0"
                >
                  <el-input-number v-model="item.totalQuota" :min="1" :max="100" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="2">
                <el-button type="danger" icon="Delete" circle @click="removeQuota(index)" />
              </el-col>
            </el-row>
          </div>
          <div class="batch-actions">
            <el-button type="primary" @click="addQuotaItem">
              <el-icon><Plus /></el-icon>添加一行
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitBatchForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 批量调整名额对话框 -->
    <el-dialog
      v-model="adjustDialogVisible"
      :title="isMultipleAdjust ? '批量调整名额' : '调整名额'"
      :width="dialogWidthSm"
    >
      <el-form
        ref="adjustFormRef"
        :model="adjustForm"
        :rules="adjustRules"
        :label-width="formLabelWidth"
      >
        <el-form-item label="调整类型" prop="adjustmentType">
          <el-radio-group v-model="adjustForm.adjustmentType">
            <el-radio value="increase">增加</el-radio>
            <el-radio value="decrease">减少</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="调整数量" prop="adjustmentValue">
          <el-input-number v-model="adjustForm.adjustmentValue" :min="1" :max="100" style="width: 100%" />
        </el-form-item>
        <el-form-item label="调整原因" prop="reason">
          <el-input v-model="adjustForm.reason" type="textarea" :rows="3" placeholder="请输入调整原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="adjustDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAdjustForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
//@ts-nocheck
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Plus, Edit, Delete, Download, Files, DocumentAdd } from '@element-plus/icons-vue'
import { get, post, put, del } from '@/utils/request'
import { ENROLLMENT_QUOTA_ENDPOINTS, ENROLLMENT_PLAN_ENDPOINTS } from '@/api/endpoints'
import { ErrorHandler } from '@/utils/errorHandler'
import QuotaStatistics from '@/components/enrollment/QuotaStatistics.vue'

const router = useRouter()
const route = useRoute()

// 计划ID
const planId = computed(() => Number(route.params.id || route.params.planId))

// 类型定义
interface EnrollmentQuota {
  id: number
  className: string
  ageRange: string
  totalQuota: number
  usedQuota: number
  remainingQuota: number
  usageRate: number
  lastUpdated: string
}

interface EnrollmentQuotaQueryParams {
  planId: number
  page: number
  pageSize: number
  className?: string
  ageRange?: string
}

// 响应式数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 表格数据
const quotaList = ref<EnrollmentQuota[]>([])
const total = ref(0)
const loading = ref(false)
const selectedRows = ref<EnrollmentQuota[]>([])

// 查询参数
const queryParams = reactive<EnrollmentQuotaQueryParams>({
  planId: planId.value,
  page: 1,
  pageSize: 10,
  className: '',
  ageRange: ''
})

// 年龄段选项
const ageRangeOptions = [
  '2-3岁',
  '3-4岁',
  '4-5岁',
  '5-6岁',
  '6-7岁'
]

// 对话框控制
const dialogVisible = ref(false)
const batchDialogVisible = ref(false)
const adjustDialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const isMultipleAdjust = ref(false)

// 表单对象
const quotaFormRef = ref<FormInstance>()
const batchFormRef = ref<FormInstance>()
const adjustFormRef = ref<FormInstance>()

// 表单数据
const quotaForm = reactive<{
  id?: number
  className: string
  ageRange: string
  totalQuota: number
}>({
  className: '',
  ageRange: '',
  totalQuota: 30
})

// 批量添加表单
const batchForm = reactive<{
  quotas: Array<{
    className: string
    ageRange: string
    totalQuota: number
  }>
}>({
  quotas: [
    { className: '', ageRange: '', totalQuota: 30 }
  ]
})

// 调整名额表单
const adjustForm = reactive<{
  quotaIds: number[]
  adjustmentType: 'increase' | 'decrease'
  adjustmentValue: number;
  reason: string
}>({
  quotaIds: [],
  adjustmentType: 'increase',
  adjustmentValue: 1,
  reason: ''
})

// 表单验证规则
const rules = reactive<FormRules>({
  className: [
    { required: true, message: '请输入班级名称', trigger: 'blur' }
  ],
  ageRange: [
    { required: true, message: '请选择年龄段', trigger: 'change' }
  ],
  totalQuota: [
    { required: true, message: '请输入招生名额', trigger: 'blur' },
    { type: 'number', min: 1, message: '名额必须大于0', trigger: 'blur' }
  ]
})

// 批量表单验证规则
const batchRules = reactive<FormRules>({
  quotas: [
    { required: true, message: '请至少添加一个班级', trigger: 'blur' }
  ]
})

// 调整表单验证规则
const adjustRules = reactive<FormRules>({
  adjustmentType: [
    { required: true, message: '请选择调整类型', trigger: 'change' }
  ],
  adjustmentValue: [
    { required: true, message: '请输入调整数量', trigger: 'blur' },
    { type: 'number', min: 1, message: '调整数量必须大于0', trigger: 'blur' }
  ],
  reason: [
    { required: true, message: '请输入调整原因', trigger: 'blur' }
  ]
})

// 计算是否有选中行
const hasSelectedRows = computed(() => selectedRows.value.length > 0)

// 获取进度条颜色
const getProgressColor = (percentage: number) => {
  if (percentage < 60) return 'var(--success-color)'
  if (percentage < 80) return 'var(--warning-color)'
  return 'var(--danger-color)'
}

// 返回上一页
const goBack = () => {
  router.push('/enrollment-plan/list')
}

// 获取名额列表
const fetchQuotas = async () => {
  loading.value = true
  try {
    const params = {
      ...queryParams,
      planId: planId.value
    }
    
    const response = await get(ENROLLMENT_QUOTA_ENDPOINTS.LIST, params)
    
    if (response.success && response.data) {
      quotaList.value = response.data.items || response.data.list || []
      total.value = response.data.total || 0
    } else {
      const errorInfo = ErrorHandler.handle(new Error(response.message || '获取名额列表失败'), true)
      quotaList.value = []
      total.value = 0
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, true)
    quotaList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 重置查询条件
const resetQuery = () => {
  queryParams.className = ''
  queryParams.ageRange = ''
  queryParams.page = 1
  fetchQuotas()
}

// 处理选择变化
const handleSelectionChange = (selection: EnrollmentQuota[]) => {
  selectedRows.value = selection
}

// 处理页码变化
const handleCurrentChange = (page: number) => {
  queryParams.page = page
  fetchQuotas()
}

// 处理每页数量变化
const handleSizeChange = (size: number) => {
  queryParams.pageSize = size
  queryParams.page = 1
  fetchQuotas()
}

// 打开添加对话框
const openAddQuotaDialog = () => {
  dialogType.value = 'add'
  quotaForm.id = undefined
  quotaForm.className = ''
  quotaForm.ageRange = ''
  quotaForm.totalQuota = 30
  dialogVisible.value = true
}

// 打开编辑对话框
const openEditDialog = (row: EnrollmentQuota) => {
  dialogType.value = 'edit'
  quotaForm.id = row.id
  quotaForm.className = row.className
  quotaForm.ageRange = row.ageRange
  quotaForm.totalQuota = row.totalQuota
  dialogVisible.value = true
}

// 打开调整对话框（单个）
const openAdjustDialog = (row: EnrollmentQuota) => {
  isMultipleAdjust.value = false
  adjustForm.quotaIds = [row.id]
  adjustForm.adjustmentType = 'increase'
  adjustForm.adjustmentValue = 1
  adjustForm.reason = ''
  adjustDialogVisible.value = true
}

// 打开批量调整对话框
const openBatchAdjustDialog = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要调整的班级')
    return
  }
  
  isMultipleAdjust.value = true
  adjustForm.quotaIds = selectedRows.value.map(row => row.id)
  adjustForm.adjustmentType = 'increase'
  adjustForm.adjustmentValue = 1
  adjustForm.reason = ''
  adjustDialogVisible.value = true
}

// 打开批量添加对话框
const openBatchAddDialog = () => {
  batchForm.quotas = [{ className: '', ageRange: '', totalQuota: 30 }]
  batchDialogVisible.value = true
}

// 添加一行批量表单
const addQuotaItem = () => {
  batchForm.quotas.push({ className: '', ageRange: '', totalQuota: 30 })
}

// 移除一行批量表单
const removeQuota = (index: number) => {
  if (batchForm.quotas.length > 1) {
    batchForm.quotas.splice(index, 1)
  } else {
    ElMessage.warning('至少保留一个班级')
  }
}

// 计划总名额限制
const planTotalLimit = ref(0)

// 计算当前已分配的总名额
const calculateCurrentTotalQuota = () => {
  return quotaList.value.reduce((sum, quota) => sum + quota.totalQuota, 0)
}

// 提交名额表单
const submitQuotaForm = async () => {
  if (!quotaFormRef.value) return
  
  try {
    const valid = await quotaFormRef.value.validate()
    if (!valid) return
    
    // 检查名额总量是否超出计划总名额
    const currentTotalQuota = calculateCurrentTotalQuota()
    const newQuotaValue = dialogType.value === 'edit' 
      ? quotaForm.totalQuota - (quotaList.value.find(q => q.id === quotaForm.id)?.totalQuota || 0)
      : quotaForm.totalQuota
    
    if (planTotalLimit.value > 0 && currentTotalQuota + newQuotaValue > planTotalLimit.value) {
      try {
        await ElMessageBox.confirm(
          `添加此名额后将超出招生计划总名额(${planTotalLimit.value})，是否继续？`,
          '名额超出提醒',
          {
            confirmButtonText: '继续添加',
            cancelButtonText: '取消',
          type: 'warning'
          }
        )
      } catch (err) {
        return // 用户取消操作
      }
    }
    
    if (dialogType.value === 'add') {
      await createEnrollmentQuota({
        planId: planId.value,
        className: quotaForm.className,
        ageRange: quotaForm.ageRange,
        totalQuota: quotaForm.totalQuota
      })
      ElMessage.success('添加成功')
    } else if (quotaForm.id) {
      await updateEnrollmentQuota(quotaForm.id, {
        planId: planId.value,
        className: quotaForm.className,
        ageRange: quotaForm.ageRange,
        totalQuota: quotaForm.totalQuota
      })
      ElMessage.success('更新成功')
    }
    
    dialogVisible.value = false
    fetchQuotas()
  } catch (error: any) {
    if (error?.message === '用户取消操作') return
    console.error('操作失败:', error)
    ElMessage.error('操作失败')
  }
}

// 提交批量添加表单
const submitBatchForm = async () => {
  if (!batchFormRef.value) return
  
  try {
    const valid = await batchFormRef.value.validate()
    if (!valid) return
    
    // 检查批量名额总和是否超出计划总名额
    const currentTotalQuota = calculateCurrentTotalQuota()
    const batchTotalQuota = batchForm.quotas.reduce((sum, quota) => sum + quota.totalQuota, 0)
    
    if (planTotalLimit.value > 0 && currentTotalQuota + batchTotalQuota > planTotalLimit.value) {
      try {
        await ElMessageBox.confirm(
          `批量添加的名额总和(${batchTotalQuota})将导致总名额超出招生计划限制(${planTotalLimit.value})，是否继续？`,
          '名额超出提醒',
          {
            confirmButtonText: '继续添加',
            cancelButtonText: '取消',
          type: 'warning'
          }
        )
      } catch (err) {
        return // 用户取消操作
      }
    }
    
    const request: BatchEnrollmentQuotaRequest = {
      planId: planId.value,
      quotas: batchForm.quotas
    }
    
    await batchCreateEnrollmentQuotas(request)
    ElMessage.success('批量添加成功')
    batchDialogVisible.value = false
    fetchQuotas()
  } catch (error: any) {
    if (error?.message === '用户取消操作') return
    console.error('批量添加失败:', error)
    ElMessage.error('批量添加失败')
  }
}

// 提交调整表单
const submitAdjustForm = async () => {
  if (!adjustFormRef.value) return
  
  try {
    const valid = await adjustFormRef.value.validate()
    if (!valid) return
    
    const adjustment = adjustForm.adjustmentType === 'increase' 
      ? adjustForm.adjustmentValue 
      : -adjustForm.adjustmentValue
      
    const request = {
      quotaIds: adjustForm.quotaIds,
      adjustmentType: adjustForm.adjustmentType,
      adjustmentValue: adjustForm.adjustmentValue,
      reason: adjustForm.reason,
      adjustment
    }
    
    await batchAdjustEnrollmentQuota(request)
    ElMessage.success('调整成功')
    adjustDialogVisible.value = false
    fetchQuotas()
  } catch (error) {
    console.error('调整失败:', error)
    ElMessage.error('调整失败')
  }
}

// 处理单个删除
const handleDelete = (row: EnrollmentQuota) => {
  ElMessageBox.confirm(
    `确定要删除班级"${row.className}"的名额吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
          type: 'warning'
    }
  )
    .then(async () => {
      try {
        await deleteEnrollmentQuota(row.id)
        ElMessage.success('删除成功')
        fetchQuotas()
      } catch (error) {
        console.error('删除失败:', error)
        ElMessage.error('删除失败')
      }
    })
    .catch(() => {
      // 取消操作
    })
}

// 处理批量删除
const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的班级')
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除已选择的${selectedRows.value.length}个班级名额吗？`,
    '批量删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
          type: 'warning'
    }
  )
    .then(async () => {
      try {
        // 实际开发中可能需要调用批量删除接口
        // 这里简化为循环调用单个删除
        const promises = selectedRows.value.map(row => deleteEnrollmentQuota(row.id))
        await Promise.all(promises)
        ElMessage.success('批量删除成功')
        fetchQuotas()
      } catch (error) {
        console.error('批量删除失败:', error)
        ElMessage.error('批量删除失败')
      }
    })
    .catch(() => {
      // 取消操作
    })
}

// 导出名额数据
const handleExport = async () => {
  try {
    const res = await exportEnrollmentQuotas(planId.value)
    
    if (res && res.data) {
      const blob = new Blob([res.data], { type: 'application/vnd.ms-excel' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `招生名额_计划${planId.value}_${new Date().toISOString().split('T')[0]}.xlsx`
      link.click()
      window.URL.revokeObjectURL(url)
      ElMessage.success('导出成功')
    } else {
      ElMessage.error('导出失败：未获取到数据')
    }
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// 获取计划详情
const fetchPlanDetail = async () => {
  try {
    const res: ApiResponse = await request.get(ENROLLMENT_PLAN_ENDPOINTS.GET_BY_ID(planId.value))
    if (res && res.data) {
      planTotalLimit.value = res.data.targetCount || 0
    }
  } catch (error) {
    console.error('获取计划详情失败:', error)
  }
}

onMounted(() => {
  fetchQuotas()
  fetchPlanDetail()
})
</script>

<style lang="scss" scoped>
@import '@/styles/index.scss';

/* 使用全局CSS变量，确保主题切换兼容性，完成三重修复 */
.page-container {
  padding: var(--app-gap);
}

.page-title {
  font-size: var(--text-xl);
  font-weight: bold;
  color: var(--text-primary); /* 白色区域修复：使用主题文字色 */
  background: var(--gradient-blue); /* 硬编码修复：使用蓝色渐变 */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
}

.page-title::after {
  content: '';
  position: absolute;
  bottom: var(--position-offset-sm);
  left: 0;
  width: var(--spacing-3xl);
  height: var(--spacing-xs);
  background: var(--gradient-blue);
  border-radius: var(--radius-sm);
}

.content-section {
  margin-top: var(--app-gap-lg); /* 硬编码修复：使用统一间距变量 */
  display: flex;
  flex-direction: column;
  gap: var(--app-gap-lg); /* 硬编码修复：使用统一间距变量 */
}

/* 筛选卡片样式 */
.filter-card {
  background: var(--bg-card); /* 白色区域修复：使用主题卡片背景 */
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */
  border-radius: var(--radius-lg); /* 硬编码修复：使用统一圆角变量 */
  box-shadow: var(--shadow-md); /* 硬编码修复：使用统一阴影变量 */
  transition: all var(--transition-normal);
  overflow: hidden;
}

.filter-card:hover {
  box-shadow: var(--shadow-lg); /* 硬编码修复：使用统一阴影变量 */
  transform: var(--transform-hover-sm);
  border-color: var(--primary-color); /* 白色区域修复：使用主题主色 */
}

/* 表格卡片样式 */
.table-card {
  background: var(--bg-card); /* 白色区域修复：使用主题卡片背景 */
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */
  border-radius: var(--radius-lg); /* 硬编码修复：使用统一圆角变量 */
  box-shadow: var(--shadow-md); /* 硬编码修复：使用统一阴影变量 */
  transition: all var(--transition-normal);
  overflow: hidden;
}

.table-card:hover {
  box-shadow: var(--shadow-lg); /* 硬编码修复：使用统一阴影变量 */
  transform: var(--transform-hover-sm);
}

/* 按钮排版修复：分页容器优化 */
.pagination-container {
  margin-top: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  padding: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  background: var(--bg-tertiary); /* 白色区域修复：使用主题三级背景 */
  border-top: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 批量操作项样式 */
.batch-item {
  margin-bottom: var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */
  border-bottom: var(--border-width-base) dashed var(--border-color); /* 白色区域修复：使用主题边框色 */
  padding-bottom: var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */
  background: var(--bg-tertiary); /* 白色区域修复：使用主题三级背景 */
  border-radius: var(--radius-md); /* 硬编码修复：使用统一圆角变量 */
  padding: var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */
  transition: all var(--transition-normal);
}

.batch-item:hover {
  background: var(--bg-hover); /* 白色区域修复：使用主题悬停背景 */
  transform: var(--transform-slide);
  box-shadow: var(--shadow-sm); /* 硬编码修复：使用统一阴影变量 */
}

.batch-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

/* 按钮排版修复：批量操作按钮优化 */
.batch-actions {
  margin-top: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */
  background: var(--bg-tertiary); /* 白色区域修复：使用主题三级背景 */
  border-radius: var(--radius-md); /* 硬编码修复：使用统一圆角变量 */
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */
}

.batch-actions .el-button {
  min-width: 120px;
  height: var(--spacing-2xl);
  font-weight: 500; /* 语义化字重，保持一致性 */
}

.batch-actions .el-button .el-icon {
  margin-right: var(--app-gap-xs);
}

.batch-actions .el-button:hover {
  transform: translateY(calc(var(--spacing-xs) * -0.25));
  box-shadow: var(--shadow-sm);
}

/* 对话框底部按钮样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */
  align-items: center;
}

.dialog-footer .el-button {
  min-width: var(--spacing-4xl);
  height: var(--spacing-2xl);
  font-weight: 500; /* 语义化字重，保持一致性 */
}

.dialog-footer .el-button:hover {
  transform: translateY(calc(var(--spacing-xs) * -0.25));
  box-shadow: var(--shadow-sm);
}

/* 白色区域修复：Element Plus组件主题化 */
:deep(.el-page-header) {
  background: var(--bg-card) !important;
  border: var(--border-width-base) solid var(--border-color) !important;
  border-radius: var(--radius-lg) !important;
  box-shadow: var(--shadow-md) !important;
  padding: var(--app-gap) !important;
  margin-bottom: var(--app-gap-lg) !important;

:deep(.el-page-header__header) {
  color: var(--text-primary) !important;
}

:deep(.el-page-header__title) {
  color: var(--text-primary) !important;
  font-weight: 600 !important; /* 语义化字重，保持一致性 */
}

:deep(.el-page-header__content) {
  color: var(--text-primary) !important;
}

:deep(.el-button-group) {
  display: flex;
  gap: var(--app-gap-xs) !important;
  flex-wrap: wrap;
}

:deep(.el-button-group .el-button) {
  margin: 0 !important;
  min-width: var(--spacing-5xl);
  height: var(--spacing-2xl);
  font-weight: 500; /* 语义化字重，保持一致性 */
}

:deep(.el-button-group .el-button .el-icon) {
  margin-right: var(--app-gap-xs);
}

:deep(.el-button-group .el-button:hover) {
  transform: translateY(calc(var(--spacing-xs) * -0.25));
  box-shadow: var(--shadow-sm);
}

:deep(.el-card) {
  background: var(--bg-card) !important;
  border-color: var(--border-color) !important;
}

:deep(.el-card__body) {
  background: var(--bg-card) !important;
  color: var(--text-primary) !important;
  padding: var(--app-gap) !important;
}

:deep(.el-form) {
  background: var(--bg-card) !important;
}

:deep(.el-form-item__label) {
  color: var(--text-primary) !important;
  font-weight: 500; /* 语义化字重，保持一致性 */
}

:deep(.el-input .el-input__wrapper) {
  background: var(--bg-tertiary) !important;
  border-color: var(--border-color) !important;
}

:deep(.el-input .el-input__wrapper:hover) {
  border-color: var(--border-light) !important;
}

:deep(.el-input .el-input__wrapper.is-focus) {
  border-color: var(--primary-color) !important;
}

:deep(.el-input .el-input__inner) {
  background: transparent !important;
  color: var(--text-primary) !important;
}

:deep(.el-input .el-input__inner::placeholder) {
  color: var(--text-muted) !important;
}

:deep(.el-select .el-input__wrapper) {
  background: var(--bg-tertiary) !important;
  border-color: var(--border-color) !important;
}

:deep(.el-select .el-input__wrapper:hover) {
  border-color: var(--border-light) !important;
}

:deep(.el-select .el-input__wrapper.is-focus) {
  border-color: var(--primary-color) !important;
}

:deep(.el-select .el-input__inner) {
  background: transparent !important;
  color: var(--text-primary) !important;
}

:deep(.el-input-number .el-input__wrapper) {
  background: var(--bg-tertiary) !important;
  border-color: var(--border-color) !important;
}

:deep(.el-input-number .el-input__wrapper:hover) {
  border-color: var(--border-light) !important;
}

:deep(.el-input-number .el-input__wrapper.is-focus) {
  border-color: var(--primary-color) !important;
}

:deep(.el-input-number .el-input__inner) {
  background: transparent !important;
  color: var(--text-primary) !important;
}

:deep(.el-button.el-button--primary) {
  background: var(--primary-color) !important;
  border-color: var(--primary-color) !important;
}

:deep(.el-button.el-button--primary:hover) {
  background: var(--primary-light) !important;
  border-color: var(--primary-light) !important;
}

:deep(.el-button.el-button--warning) {
  background: var(--warning-color) !important;
  border-color: var(--warning-color) !important;
}

:deep(.el-button.el-button--warning:hover) {
  background: var(--warning-light) !important;
  border-color: var(--warning-light) !important;
}

:deep(.el-button.el-button--danger) {
  background: var(--danger-color) !important;
  border-color: var(--danger-color) !important;
}

:deep(.el-button.el-button--danger:hover) {
  background: var(--danger-light) !important;
  border-color: var(--danger-light) !important;
}

:deep(.el-button.el-button--default) {
  background: var(--bg-tertiary) !important;
  border-color: var(--border-color) !important;
  color: var(--text-primary) !important;
}

:deep(.el-button.el-button--default:hover) {
  background: var(--bg-hover) !important;
  border-color: var(--border-light) !important;
}

:deep(.el-button.is-link) {
  color: var(--primary-color) !important;
  background: transparent !important;
  border: none !important;
}

:deep(.el-button.is-link:hover) {
  color: var(--primary-light) !important;
}

:deep(.el-button.is-link.el-button--danger) {
  color: var(--danger-color) !important;
}

:deep(.el-button.is-link.el-button--danger:hover) {
  color: var(--danger-light) !important;
}

:deep(.el-table) {
  background: var(--bg-card) !important;
  color: var(--text-primary) !important;
}

:deep(.el-table .el-table__header-wrapper .el-table__header th) {
  background: var(--bg-tertiary) !important;
  color: var(--text-primary) !important;
  border-bottom-color: var(--border-color) !important;
  font-weight: 600;
}

:deep(.el-table .el-table__body-wrapper .el-table__body tr) {
  background: var(--bg-card) !important;
}

:deep(.el-table .el-table__body-wrapper .el-table__body tr:hover) {
  background: var(--bg-hover) !important;
}

:deep(.el-table .el-table__body-wrapper .el-table__body tr td) {
  border-bottom-color: var(--border-color) !important;
  color: var(--text-primary) !important;
}

:deep(.el-table .el-table__border-left-patch),
:deep(.el-table .el-table__border-bottom-patch) {
  background: var(--border-color) !important;
}

:deep(.el-table.el-table--border) {
  border-color: var(--border-color) !important;
}

:deep(.el-table.el-table--border::after) {
  background: var(--border-color) !important;
}

:deep(.el-table.el-table--border::before) {
  background: var(--border-color) !important;
}

:deep(.el-progress) {
  background: var(--bg-tertiary) !important;
}

:deep(.el-progress__text) {
  color: var(--text-primary) !important;
}

:deep(.el-pagination) {
  background: transparent !important;
}

:deep(.el-pagination .el-pagination__total),
:deep(.el-pagination .el-pagination__jump) {
  color: var(--text-primary) !important;
}

:deep(.el-pagination .el-pager li) {
  background: var(--bg-tertiary) !important;
  color: var(--text-primary) !important;
  border: var(--border-width-base) solid var(--border-color) !important;
}

:deep(.el-pagination .el-pager li:hover) {
  color: var(--primary-color) !important;
}

:deep(.el-pagination .el-pager li.is-active) {
  background: var(--primary-color) !important;
  color: var(--bg-card) !important;
}

:deep(.el-pagination .btn-prev),
:deep(.el-pagination .btn-next) {
  background: var(--bg-tertiary) !important;
  color: var(--text-primary) !important;
  border: var(--border-width-base) solid var(--border-color) !important;
}

:deep(.el-pagination .btn-prev:hover),
:deep(.el-pagination .btn-next:hover) {
  color: var(--primary-color) !important;
}

:deep(.el-dialog) {
  background: var(--bg-card) !important;
  border: var(--border-width-base) solid var(--border-color) !important;
  box-shadow: var(--shadow-xl) !important;
}

:deep(.el-dialog__header) {
  background: var(--bg-tertiary) !important;
  border-bottom: var(--border-width-base) solid var(--border-color) !important;
  color: var(--text-primary) !important;
}

:deep(.el-dialog__title) {
  color: var(--text-primary) !important;
  font-weight: 600;
}

:deep(.el-dialog__body) {
  background: var(--bg-card) !important;
  color: var(--text-primary) !important;
}

:deep(.el-dialog__footer) {
  background: var(--bg-tertiary) !important;
  border-top: var(--border-width-base) solid var(--border-color) !important;
}

:deep(.el-loading-mask) {
  background: var(--bg-overlay) !important;
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .page-container {
    padding: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
  }
  
  .page-title {
    font-size: var(--text-lg);
  }
  
  .content-section {
    margin-top: var(--app-gap); /* 硬编码修复：移动端间距优化 */;
  gap: var(--app-gap); /* 硬编码修复：移动端间距优化 */
  }
  
  .pagination-container {
    padding: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
  }
  
  .batch-item {
    padding: var(--app-gap-xs); /* 硬编码修复：移动端间距优化 */
  }
  
  .batch-actions {
    padding: var(--app-gap-xs); /* 硬编码修复：移动端间距优化 */
  }
  
  .batch-actions .el-button {
    min-width: var(--spacing-5xl);
    height: var(--spacing-2xl);
    font-size: var(--text-sm);
  }
  
  .dialog-footer .el-button {
    min-width: 70px;
    height: var(--spacing-2xl);
    font-size: var(--text-sm);
  }
  
  :deep(.el-page-header) {
    padding: var(--app-gap-sm) !important;
    margin-bottom: var(--app-gap) !important;
  }
  
  :deep(.el-button-group) {
    flex-direction: column;
    gap: var(--app-gap-xs) !important;
  }
  
  :deep(.el-button-group .el-button) {
    min-width: var(--spacing-4xl);
    height: var(--spacing-2xl);
    font-size: var(--text-sm);
  }
  
  :deep(.el-card__body) {
    padding: var(--app-gap-sm) !important;
  }
  
  :deep(.el-form--inline .el-form-item) {
    display: block;
    margin-bottom: var(--app-gap-sm);
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .page-container {
    padding: var(--app-gap-xs); /* 硬编码修复：小屏幕间距优化 */
  }
  
  .page-title {
    font-size: var(--text-lg);
  }
  
  .content-section {
    gap: var(--app-gap-sm); /* 硬编码修复：小屏幕间距优化 */
  }
  
  .pagination-container {
    padding: var(--app-gap-xs); /* 硬编码修复：小屏幕间距优化 */
  }
  
  .batch-actions .el-button {
    min-width: var(--spacing-4xl);
    height: var(--spacing-xl);
    font-size: var(--text-xs);
  }
  
  .dialog-footer .el-button {
    min-width: var(--spacing-3xl);
    height: var(--spacing-xl);
    font-size: var(--text-xs);
  }
  
  :deep(.el-page-header) {
    padding: var(--app-gap-xs) !important;
  }
  
  :deep(.el-button-group .el-button) {
    min-width: 70px;
    height: var(--spacing-xl);
    font-size: var(--text-xs);
  }
  
  :deep(.el-card__body) {
    padding: var(--app-gap-xs) !important;
  }
  
  :deep(.el-table .el-table__cell) {
    padding: var(--app-gap-xs) !important;
    font-size: var(--text-sm);
  }
}
</style> 