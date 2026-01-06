<template>
  <div class="page-container">
    <app-card>
      <template #header>
        <app-card-header>
          <div class="app-card-title">
            <el-icon><Calendar /></el-icon>
            {{ isEdit ? '编辑招生计划' : '新增招生计划' }}
          </div>
          <div class="card-actions">
            <el-button @click="goBack">
              <el-icon><Back /></el-icon>
              返回
            </el-button>
            <el-button type="primary" @click="handleSubmit" :loading="submitting">
              <el-icon><Check /></el-icon>
              保存
            </el-button>
          </div>
        </app-card-header>
      </template>
      
      <app-card-content>
        <el-form 
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-width="100px"
          label-position="right"
          class="plan-form"
        >
          <div class="form-section">
            <div class="section-title">基本信息</div>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="计划名称" prop="title">
                  <el-input v-model="formData.title" placeholder="请输入招生计划名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="计划状态" prop="status">
                  <el-select v-model="formData.status" placeholder="请选择计划状态" style="width: 100%">
                    <el-option label="草稿" value="draft" />
                    <el-option label="招生中" value="active" />
                    <el-option label="已完成" value="completed" />
                    <el-option label="已取消" value="cancelled" />
                    <el-option label="已暂停" value="paused" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="开始日期" prop="startDate">
                  <el-date-picker 
                    v-model="formData.startDate" 
                    type="date" 
                    placeholder="选择开始日期"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="结束日期" prop="endDate">
                  <el-date-picker 
                    v-model="formData.endDate" 
                    type="date" 
                    placeholder="选择结束日期"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    :disabled-date="disabledEndDate"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="目标人数" prop="targetCount">
                  <el-input-number 
                    v-model="formData.targetCount" 
                    :min="1" 
                    :max="1000" 
                    :step="1" 
                    controls-position="right"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="年龄要求" prop="ageRequirement">
                  <el-input v-model="formData.ageRequirement" placeholder="请输入年龄要求，例如：3-6岁" />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-form-item label="计划描述" prop="description">
              <el-input 
                v-model="formData.description" 
                type="textarea" 
                :rows="4" 
                placeholder="请输入招生计划描述"
              />
            </el-form-item>
          </div>
          
          <!-- 班级关联 (仅编辑模式显示) -->
          <div v-if="isEdit" class="form-section">
            <div class="section-title">
              关联班级
              <el-button type="primary" size="small" @click="showClassSelectDialog">
                {{ selectedClasses.length ? '修改关联班级' : '关联班级' }}
              </el-button>
            </div>
            
            <div v-if="selectedClasses.length === 0" class="empty-tip">
              尚未关联班级，请点击"关联班级"按钮进行关联
            </div>
            
            <el-table v-else :data="selectedClasses" border style="width: 100%">
              <el-table-column prop="className" label="班级名称" min-width="120" />
              <el-table-column prop="ageGroup" label="年龄段" width="120" />
              <el-table-column prop="totalQuota" label="名额数量" width="100" />
              <el-table-column prop="teacherName" label="班主任" width="120" />
              <el-table-column label="操作" width="100">
                <template #default="{ row, $index }">
                  <el-button type="danger" link @click="removeClass($index)">移除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-form>
      </app-card-content>
    </app-card>
    
    <!-- 班级选择对话框 -->
    <el-dialog
      v-model="classDialogVisible"
      title="选择关联班级"
      width="650px"
    >
      <el-table
        :data="classesList"
        border
        style="width: 100%"
        @selection-change="handleClassSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="className" label="班级名称" min-width="120" />
        <el-table-column prop="ageGroup" label="年龄段" width="120" />
        <el-table-column prop="capacity" label="班级容量" width="100" />
        <el-table-column prop="teacherName" label="班主任" width="120" />
      </el-table>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="classDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmClassSelection">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { 
  Calendar,
  Back,
  Check,
  Plus,
  Delete
} from '@element-plus/icons-vue'
import request from '@/utils/request'

// 接口定义
interface EnrollmentPlan {
  id?: number;
  title: string;
  description: string;
  status: string
  startDate: string
  endDate: string
  targetCount: number
  ageRequirement: string
}

interface ClassInfo {
  id: number
  className: string
  ageGroup: string
  totalQuota: number;
  capacity: number
  teacherName: string
}

// 响应式数据
const route = useRoute()
const router = useRouter()
const formRef = ref<FormInstance>()
const submitting = ref(false)
const classDialogVisible = ref(false)

// 判断是否为编辑模式
const isEdit = computed(() => !!route.params.id)

// 表单数据
const formData = reactive<EnrollmentPlan>({
  title: '',
  description: '',
  status: 'draft',
  startDate: '',
  endDate: '',
  targetCount: 50,
  ageRequirement: '3-6岁'
})

// 班级相关数据
const selectedClasses = ref<ClassInfo[]>([])
const classesList = ref<ClassInfo[]>([])
const tempSelectedClasses = ref<ClassInfo[]>([])

// 表单验证规则
const rules: FormRules = {
  title: [
    { required: true, message: '请输入计划名称', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择计划状态', trigger: 'change' }
  ],
  startDate: [
    { required: true, message: '请选择开始日期', trigger: 'change' }
  ],
  endDate: [
    { required: true, message: '请选择结束日期', trigger: 'change' }
  ],
  targetCount: [
    { required: true, message: '请输入目标人数', trigger: 'blur' }
  ]
}

// API方法
const fetchPlanDetail = async () => {
  if (!isEdit.value) return

  try {
    const planId = route.params.id
    const response = await request.get(`/enrollment-plans/${planId}`)

    if (response.success) {
      Object.assign(formData, response.data)
    } else {
      ElMessage.error(response.message || '获取招生计划详情失败')
    }
  } catch (error) {
    console.error('获取招生计划详情失败:', error)
    ElMessage.error('获取招生计划详情失败')
  }
}

const fetchClassesList = async () => {
  try {
    const response = await request.get('/classes')

    if (response.success) {
      classesList.value = response.data.items || []
    }
  } catch (error) {
    console.error('获取班级列表失败:', error)
  }
}

const savePlan = async () => {
  try {
    submitting.value = true
    
    const url = isEdit.value
      ? `/enrollment-plans/${route.params.id}`
      : '/enrollment-plans'

    const response = isEdit.value
      ? await request.put(url, formData)
      : await request.post(url, formData)
    
    if (response.success) {
      ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
      
      // 如果是编辑模式且有关联班级，保存班级关联
      if (isEdit.value && selectedClasses.value.length > 0) {
        await saveClassAssociation(response.data.id || route.params.id)
      }
      
      router.push('/enrollment-plan')
    } else {
      ElMessage.error(response.message || '保存失败')
    }
  } catch (error) {
    console.error('保存招生计划失败:', error)
    ElMessage.error('保存失败')
  } finally {
    submitting.value = false
  }
}

const saveClassAssociation = async (planId: string | number) => {
  try {
    const classIds = selectedClasses.value.map(cls => cls.id)

    const response = await request.post(`/enrollment-plans/${planId}/classes`, { classIds })

    if (!response.success) {
      ElMessage.warning('班级关联保存失败')
    }
  } catch (error) {
    console.error('保存班级关联失败:', error)
    ElMessage.warning('班级关联保存失败')
  }
}

// 工具方法
const disabledEndDate = (time: Date) => {
  if (!formData.startDate) return false
  return time.getTime() < new Date(formData.startDate).getTime()
}

// 事件处理方法
const goBack = () => {
  router.back()
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    await savePlan()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const showClassSelectDialog = () => {
  tempSelectedClasses.value = [...selectedClasses.value]
  classDialogVisible.value = true
}

const handleClassSelectionChange = (selection: ClassInfo[]) => {
  tempSelectedClasses.value = selection
}

const confirmClassSelection = () => {
  selectedClasses.value = [...tempSelectedClasses.value]
  classDialogVisible.value = false
  ElMessage.success('班级关联更新成功')
}

const removeClass = (index: number) => {
  selectedClasses.value.splice(index, 1)
  ElMessage.success('移除班级成功')
}

// 组件挂载时加载数据
onMounted(async () => {
  await fetchPlanDetail()
  await fetchClassesList()
})
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';
.page-container {
  
  .form-section {
    margin-bottom: var(--app-margin-lg);
    
    .section-title {
      font-size: var(--el-font-size-large);
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin-bottom: var(--app-margin);
      padding-bottom: var(--app-padding-sm);
      border-bottom: 2px solid var(--el-color-primary);
      display: flex;
      justify-content: space-between;
      align-items: center;
  }
  
  .plan-form {
    .el-form-item {
      margin-bottom: var(--app-margin);
    }
  }
  
  .empty-tip {
    text-align: center;
    color: var(--el-text-color-secondary);
    padding: var(--app-padding-lg);
    background: var(--el-bg-color-page);
    border-radius: var(--el-border-radius-base);
    border: var(--border-width-base) dashed var(--el-border-color);
  }
}

/* 深度选择器确保Element Plus组件主题一致 */
:deep(.el-form-item__label) {
  color: var(--el-text-color-primary);
  font-weight: 500;
}

:deep(.el-input__inner) {
  background-color: var(--el-bg-color);
  border-color: var(--el-border-color);
  color: var(--el-text-color-primary);
}

:deep(.el-select) {
  .el-input__inner {
    background-color: var(--el-bg-color);
    border-color: var(--el-border-color);
    color: var(--el-text-color-primary);
  }
}

:deep(.el-date-editor) {
  .el-input__inner {
    background-color: var(--el-bg-color);
    border-color: var(--el-border-color);
    color: var(--el-text-color-primary);
  }
}

:deep(.el-textarea__inner) {
  background-color: var(--el-bg-color);
  border-color: var(--el-border-color);
  color: var(--el-text-color-primary);
}

:deep(.el-input-number) {
  .el-input__inner {
    background-color: var(--el-bg-color);
    border-color: var(--el-border-color);
    color: var(--el-text-color-primary);
  }
}

:deep(.el-table) {
  .el-table__header {
    background-color: var(--el-bg-color-page);
  }
  
  .el-table__body {
    background-color: var(--el-bg-color);
  }
  
  .el-table__row {
    background-color: var(--el-bg-color);
    
    &:hover {
      background-color: var(--el-bg-color-page);
    }
  }
  
  .el-table__cell {
    border-color: var(--el-border-color-lighter);
  }
}

:deep(.el-dialog) {
  .el-dialog__header {
    background-color: var(--el-bg-color-page);
    border-bottom: var(--border-width-base) solid var(--el-border-color-lighter);
  }
  
  .el-dialog__body {
    background-color: var(--el-bg-color);
  }
  
  .el-dialog__footer {
    background-color: var(--el-bg-color-page);
    border-top: var(--border-width-base) solid var(--el-border-color-lighter);
  }
}

/* 暗黑主题适配 */
[data-theme="dark"] {
  .empty-tip {
    background: var(--el-bg-color-page);
    border-color: var(--el-border-color-darker);
  }
}
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .page-container {
    padding: var(--app-padding-sm);
    
    .plan-form {
      .el-row {
        .el-col {
          margin-bottom: var(--app-margin);
        }
      }
    }
    
    .form-section {
      .section-title {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--app-gap);
      }
    }
  }
}
</style> 