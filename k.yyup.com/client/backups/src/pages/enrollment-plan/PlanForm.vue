<template>
  <div class="page-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">{{ isEdit ? '编辑招生计划' : '创建招生计划' }}</h1>
      <p class="page-description">制定详细的招生计划，包括招生目标、时间安排、宣传策略等</p>
    </div>

    <!-- 表单步骤 -->
    <el-card class="steps-card">
      <el-steps :active="currentStep" align-center>
        <el-step title="基本信息" description="计划名称、时间范围" />
        <el-step title="招生目标" description="招生人数、班级设置" />
        <el-step title="宣传策略" description="宣传渠道、预算分配" />
        <el-step title="时间安排" description="关键节点、里程碑" />
        <el-step title="预览提交" description="确认信息、提交计划" />
      </el-steps>
    </el-card>

    <!-- 表单内容 -->
    <el-card class="form-card">
      <el-form 
        :model="planForm" 
        :rules="planRules" 
        ref="planFormRef" 
        label-width="120px"
        v-loading="loading"
      >
        <!-- 步骤1：基本信息 -->
        <div v-show="currentStep === 0" class="step-content">
          <div class="step-title">
            <h3>基本信息</h3>
            <p>请填写招生计划的基本信息</p>
          </div>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="计划名称" prop="name">
                <el-input 
                  v-model="planForm.name" 
                  placeholder="请输入招生计划名称"
                  maxlength="50"
                  show-word-limit
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="计划年度" prop="year">
                <el-date-picker
                  v-model="planForm.year"
                  type="year"
                  placeholder="选择计划年度"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="开始时间" prop="startDate">
                <el-date-picker
                  v-model="planForm.startDate"
                  type="date"
                  placeholder="选择开始时间"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="结束时间" prop="endDate">
                <el-date-picker
                  v-model="planForm.endDate"
                  type="date"
                  placeholder="选择结束时间"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="计划描述" prop="description">
            <el-input
              v-model="planForm.description"
              type="textarea"
              :rows="4"
              placeholder="请输入招生计划的详细描述"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="负责人" prop="manager">
            <el-select v-model="planForm.manager" placeholder="选择负责人" style="width: 100%">
              <el-option 
                v-for="user in userList" 
                :key="user.id" 
                :label="user.name" 
                :value="user.id"
              />
            </el-select>
          </el-form-item>
        </div>

        <!-- 步骤2：招生目标 -->
        <div v-show="currentStep === 1" class="step-content">
          <div class="step-title">
            <h3>招生目标</h3>
            <p>设置招生人数和班级配置</p>
          </div>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="总招生人数" prop="totalStudents">
                <el-input-number
                  v-model="planForm.totalStudents"
                  :min="1"
                  :max="1000"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="计划班级数" prop="totalClasses">
                <el-input-number
                  v-model="planForm.totalClasses"
                  :min="1"
                  :max="50"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="每班人数" prop="studentsPerClass">
                <el-input-number
                  v-model="planForm.studentsPerClass"
                  :min="1"
                  :max="50"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="年龄段配置">
            <el-table :data="planForm.ageGroups" style="width: 100%">
              <el-table-column prop="name" label="年龄段" width="150">
                <template #default="{ row }">
                  <el-input v-model="row.name" placeholder="如：小班" />
                </template>
              </el-table-column>
              <el-table-column prop="ageRange" label="年龄范围" width="200">
                <template #default="{ row }">
                  <el-input v-model="row.ageRange" placeholder="如：3-4岁" />
                </template>
              </el-table-column>
              <el-table-column prop="targetCount" label="目标人数" width="150">
                <template #default="{ row }">
                  <el-input-number v-model="row.targetCount" :min="0" style="width: 100%" />
                </template>
              </el-table-column>
              <el-table-column prop="classCount" label="班级数" width="150">
                <template #default="{ row }">
                  <el-input-number v-model="row.classCount" :min="0" style="width: 100%" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100">
                <template #default="{ $index }">
                  <el-button 
                    type="danger" 
                    size="small" 
                    @click="removeAgeGroup($index)"
                    :disabled="planForm.ageGroups.length <= 1"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-button type="primary" @click="addAgeGroup" style="margin-top: var(--spacing-2xl)">
              <el-icon><Plus /></el-icon>
              添加年龄段
            </el-button>
          </el-form-item>
        </div>

        <!-- 步骤3：宣传策略 -->
        <div v-show="currentStep === 2" class="step-content">
          <div class="step-title">
            <h3>宣传策略</h3>
            <p>制定宣传渠道和预算分配</p>
          </div>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="总预算" prop="totalBudget">
                <el-input-number
                  v-model="planForm.totalBudget"
                  :min="0"
                  :precision="2"
                  style="width: 100%"
                />
                <span style="margin-left: var(--spacing-2xl); color: var(--el-text-color-secondary);">元</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="预期转化率" prop="conversionRate">
                <el-input-number
                  v-model="planForm.conversionRate"
                  :min="0"
                  :max="100"
                  :precision="1"
                  style="width: 100%"
                />
                <span style="margin-left: var(--spacing-2xl); color: var(--el-text-color-secondary);">%</span>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="宣传渠道">
            <el-table :data="planForm.channels" style="width: 100%">
              <el-table-column prop="name" label="渠道名称" width="200">
                <template #default="{ row }">
                  <el-select v-model="row.name" placeholder="选择渠道">
                    <el-option label="线上广告" value="online" />
                    <el-option label="社区推广" value="community" />
                    <el-option label="口碑推荐" value="referral" />
                    <el-option label="传单发放" value="flyer" />
                    <el-option label="媒体宣传" value="media" />
                    <el-option label="活动营销" value="event" />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column prop="budget" label="预算分配" width="150">
                <template #default="{ row }">
                  <el-input-number v-model="row.budget" :min="0" :precision="2" style="width: 100%" />
                </template>
              </el-table-column>
              <el-table-column prop="expectedLeads" label="预期线索" width="150">
                <template #default="{ row }">
                  <el-input-number v-model="row.expectedLeads" :min="0" style="width: 100%" />
                </template>
              </el-table-column>
              <el-table-column prop="description" label="描述">
                <template #default="{ row }">
                  <el-input v-model="row.description" placeholder="渠道描述" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100">
                <template #default="{ $index }">
                  <el-button 
                    type="danger" 
                    size="small" 
                    @click="removeChannel($index)"
                    :disabled="planForm.channels.length <= 1"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-button type="primary" @click="addChannel" style="margin-top: var(--spacing-2xl)">
              <el-icon><Plus /></el-icon>
              添加渠道
            </el-button>
          </el-form-item>
        </div>

        <!-- 步骤4：时间安排 -->
        <div v-show="currentStep === 3" class="step-content">
          <div class="step-title">
            <h3>时间安排</h3>
            <p>设置关键时间节点和里程碑</p>
          </div>

          <el-form-item label="关键节点">
            <el-table :data="planForm.milestones" style="width: 100%">
              <el-table-column prop="name" label="节点名称" width="200">
                <template #default="{ row }">
                  <el-input v-model="row.name" placeholder="如：报名开始" />
                </template>
              </el-table-column>
              <el-table-column prop="date" label="时间" width="200">
                <template #default="{ row }">
                  <el-date-picker
                    v-model="row.date"
                    type="date"
                    placeholder="选择时间"
                    style="width: 100%"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="description" label="描述">
                <template #default="{ row }">
                  <el-input v-model="row.description" placeholder="节点描述" />
                </template>
              </el-table-column>
              <el-table-column prop="responsible" label="负责人" width="150">
                <template #default="{ row }">
                  <el-select v-model="row.responsible" placeholder="选择负责人">
                    <el-option 
                      v-for="user in userList" 
                      :key="user.id" 
                      :label="user.name" 
                      :value="user.id"
                    />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100">
                <template #default="{ $index }">
                  <el-button 
                    type="danger" 
                    size="small" 
                    @click="removeMilestone($index)"
                    :disabled="planForm.milestones.length <= 1"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-button type="primary" @click="addMilestone" style="margin-top: var(--spacing-2xl)">
              <el-icon><Plus /></el-icon>
              添加节点
            </el-button>
          </el-form-item>
        </div>

        <!-- 步骤5：预览提交 -->
        <div v-show="currentStep === 4" class="step-content">
          <div class="step-title">
            <h3>预览提交</h3>
            <p>请确认招生计划信息无误后提交</p>
          </div>

          <div class="preview-content">
            <el-descriptions title="基本信息" :column="2" border>
              <el-descriptions-item label="计划名称">{{ planForm.name }}</el-descriptions-item>
              <el-descriptions-item label="计划年度">{{ formatYear(planForm.year) }}</el-descriptions-item>
              <el-descriptions-item label="开始时间">{{ formatDate(planForm.startDate) }}</el-descriptions-item>
              <el-descriptions-item label="结束时间">{{ formatDate(planForm.endDate) }}</el-descriptions-item>
              <el-descriptions-item label="负责人">{{ getUserName(planForm.manager) }}</el-descriptions-item>
              <el-descriptions-item label="计划描述" :span="2">{{ planForm.description }}</el-descriptions-item>
            </el-descriptions>

            <el-descriptions title="招生目标" :column="3" border style="margin-top: var(--text-2xl)">
              <el-descriptions-item label="总招生人数">{{ planForm.totalStudents }}人</el-descriptions-item>
              <el-descriptions-item label="计划班级数">{{ planForm.totalClasses }}个</el-descriptions-item>
              <el-descriptions-item label="每班人数">{{ planForm.studentsPerClass }}人</el-descriptions-item>
            </el-descriptions>

            <div style="margin-top: var(--text-2xl)">
              <h4>年龄段配置</h4>
              <el-table :data="planForm.ageGroups" style="width: 100%">
                <el-table-column prop="name" label="年龄段" />
                <el-table-column prop="ageRange" label="年龄范围" />
                <el-table-column prop="targetCount" label="目标人数" />
                <el-table-column prop="classCount" label="班级数" />
              </el-table>
            </div>

            <el-descriptions title="宣传策略" :column="2" border style="margin-top: var(--text-2xl)">
              <el-descriptions-item label="总预算">¥{{ planForm.totalBudget }}</el-descriptions-item>
              <el-descriptions-item label="预期转化率">{{ planForm.conversionRate }}%</el-descriptions-item>
            </el-descriptions>

            <div style="margin-top: var(--text-2xl)">
              <h4>宣传渠道</h4>
              <el-table :data="planForm.channels" style="width: 100%">
                <el-table-column prop="name" label="渠道名称" />
                <el-table-column prop="budget" label="预算分配" />
                <el-table-column prop="expectedLeads" label="预期线索" />
                <el-table-column prop="description" label="描述" />
              </el-table>
            </div>

            <div style="margin-top: var(--text-2xl)">
              <h4>关键节点</h4>
              <el-table :data="planForm.milestones" style="width: 100%">
                <el-table-column prop="name" label="节点名称" />
                <el-table-column prop="date" label="时间">
                  <template #default="{ row }">
                    {{ formatDate(row.date) }}
                  </template>
                </el-table-column>
                <el-table-column prop="description" label="描述" />
                <el-table-column prop="responsible" label="负责人">
                  <template #default="{ row }">
                    {{ getUserName(row.responsible) }}
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>
      </el-form>

      <!-- 步骤操作按钮 -->
      <div class="step-actions">
        <el-button 
          v-if="currentStep > 0" 
          @click="prevStep"
        >
          上一步
        </el-button>
        <el-button 
          v-if="currentStep < 4" 
          type="primary" 
          @click="nextStep"
        >
          下一步
        </el-button>
        <el-button 
          v-if="currentStep === 4" 
          type="success" 
          :loading="submitting"
          @click="handleSubmit"
        >
          {{ isEdit ? '更新计划' : '提交计划' }}
        </el-button>
        <el-button @click="handleCancel">
          取消
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
// 1. Vue 相关导入
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

// 2. Element Plus 导入
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

// 3. 公共工具函数导入
import request from '../../utils/request'
import { formatDate } from '../../utils/dateFormat'

// 解构request实例中的方法
const { get, post, put, del } = request

// 定义统一API响应类型
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
}

// 年龄段配置接口
interface AgeGroup {
  name: string
  ageRange: string
  targetCount: number
  classCount: number
}

// 宣传渠道接口
interface Channel {
  name: string;
  budget: number
  expectedLeads: number;
  description: string
}

// 里程碑接口
interface Milestone {
  name: string;
  date: string;
  description: string;
  responsible: string
}

// 招生计划接口
interface EnrollmentPlan {
  id?: string;
  name: string;
  year: string
  startDate: string
  endDate: string;
  description: string;
  manager: string
  totalStudents: number
  totalClasses: number
  studentsPerClass: number
  totalBudget: number
  conversionRate: number
  ageGroups: AgeGroup[];
  channels: Channel[];
  milestones: Milestone[]
}

// 用户接口
interface User {
  id: string;
  name: string
}

const router = useRouter()
const route = useRoute()

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const currentStep = ref(0)
const isEdit = ref(false)

// 表单数据
const planFormRef = ref()
const planForm = ref<EnrollmentPlan>({
  name: '',
  year: '',
  startDate: '',
  endDate: '',
  description: '',
  manager: '',
  totalStudents: 0,
  totalClasses: 0,
  studentsPerClass: 0,
  totalBudget: 0,
  conversionRate: 0,
  ageGroups: [
    { name: '小班', ageRange: '3-4岁', targetCount: 0, classCount: 0 }
  ],
  channels: [
    { name: 'online', budget: 0, expectedLeads: 0, description: '' }
  ],
  milestones: [
    { name: '报名开始', date: '', description: '', responsible: '' }
  ]
})

// 用户列表
const userList = ref<User[]>([])

// 表单验证规则
const planRules: FormRules = {
  name: [
    { required: true, message: '请输入计划名称', trigger: 'blur' }
  ],
  year: [
    { required: true, message: '请选择计划年度', trigger: 'change' }
  ],
  startDate: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  endDate: [
    { required: true, message: '请选择结束时间', trigger: 'change' }
  ],
  manager: [
    { required: true, message: '请选择负责人', trigger: 'change' }
  ],
  totalStudents: [
    { required: true, message: '请输入总招生人数', trigger: 'blur' }
  ],
  totalClasses: [
    { required: true, message: '请输入计划班级数', trigger: 'blur' }
  ],
  studentsPerClass: [
    { required: true, message: '请输入每班人数', trigger: 'blur' }
  ]
}

// 获取用户列表
const loadUserList = async () => {
  try {
    const response: ApiResponse<User[]> = await get('/users')
    if (response.success && response.data) {
      userList.value = response.data
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
  }
}

// 获取计划详情（编辑模式）
const loadPlanDetail = async (id: string) => {
  loading.value = true
  try {
    const response: ApiResponse<EnrollmentPlan> = await get(`/enrollment-plans/${id}`)
    if (response.success && response.data) {
      planForm.value = response.data
    }
  } catch (error) {
    console.error('获取计划详情失败:', error)
    ElMessage.error('获取计划详情失败')
  } finally {
    loading.value = false
  }
}

// 步骤操作
const nextStep = async () => {
  if (currentStep.value < 4) {
    // 验证当前步骤
    if (await validateCurrentStep()) {
      currentStep.value++
    }
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// 验证当前步骤
const validateCurrentStep = async (): Promise<boolean> => {
  if (!planFormRef.value) return false
  
  try {
    // 根据当前步骤验证对应字段
    const fieldsToValidate = getFieldsForStep(currentStep.value)
    if (fieldsToValidate.length > 0) {
      await planFormRef.value.validateField(fieldsToValidate)
    }
    return true
  } catch (error) {
    return false
  }
}

// 获取步骤对应的验证字段
const getFieldsForStep = (step: number): string[] => {
  const stepFields = [
    ['name', 'year', 'startDate', 'endDate', 'manager'], // 步骤0
    ['totalStudents', 'totalClasses', 'studentsPerClass'], // 步骤1
    [], // 步骤2
    [], // 步骤3
    []  // 步骤4
  ]
  return stepFields[step] || []
}

// 年龄段操作
const addAgeGroup = () => {
  planForm.value.ageGroups.push({
    name: '',
    ageRange: '',
    targetCount: 0,
    classCount: 0
  })
}

const removeAgeGroup = (index: number) => {
  planForm.value.ageGroups.splice(index, 1)
}

// 宣传渠道操作
const addChannel = () => {
  planForm.value.channels.push({
    name: '',
  budget: 0,
    expectedLeads: 0,
  description: ''
  })
}

const removeChannel = (index: number) => {
  planForm.value.channels.splice(index, 1)
}

// 里程碑操作
const addMilestone = () => {
  planForm.value.milestones.push({
    name: '',
  date: '',
  description: '',
  responsible: ''
  })
}

const removeMilestone = (index: number) => {
  planForm.value.milestones.splice(index, 1)
}

// 提交表单
const handleSubmit = async () => {
  if (!planFormRef.value) return
  
  try {
    await planFormRef.value.validate()
    submitting.value = true
    
    let response: ApiResponse
    if (isEdit.value) {
      response = await put(`/enrollment-plans/${planForm.value.id}`, planForm.value)
    } else {
      response = await post('/enrollment-plans', planForm.value)
    }
    
    if (response.success) {
      ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
      router.push('/enrollment-plan')
    } else {
      ElMessage.error(response.message || (isEdit.value ? '更新失败' : '创建失败'))
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败')
  } finally {
    submitting.value = false
  }
}

// 取消操作
const handleCancel = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要取消吗？未保存的数据将丢失。',
      '确认取消',
      {
        confirmButtonText: '确定',
        cancelButtonText: '继续编辑',
  type: 'warning'
      }
    )
    
    router.push('/enrollment-plan')
  } catch (error) {
    // 用户取消
  }
}

// 工具函数
const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}

const formatYear = (year: string) => {
  if (!year) return ''
  return new Date(year).getFullYear() + '年'
}

const getUserName = (userId: string) => {
  const user = userList.value.find(u => u.id === userId)
  return user ? user.name : ''
}

// 页面初始化
onMounted(() => {
  loadUserList()
  
  // 检查是否为编辑模式
  const planId = route.params.id as string
  if (planId) {
    isEdit.value = true
    loadPlanDetail(planId)
  }
})
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';

/* 使用全局CSS变量，确保主题切换兼容性，完成三重修复 */
.page-container {

.page-header {
  margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  text-align: center;
  padding: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  background: var(--bg-card); /* 白色区域修复：使用主题卡片背景 */
  border-radius: var(--radius-lg); /* 硬编码修复：使用统一圆角变量 */
  box-shadow: var(--shadow-sm); /* 硬编码修复：使用统一阴影变量 */
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */

.page-title {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--text-primary); /* 白色区域修复：使用主题文字色 */
  background: var(--gradient-purple); /* 硬编码修复：使用紫色渐变 */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 var(--app-gap-sm) 0; /* 硬编码修复：使用统一间距变量 */

.page-description {
  color: var(--text-secondary); /* 白色区域修复：使用主题次要文字色 */
  margin: 0;
  font-size: var(--text-lg);
}

.steps-card {
  margin-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  background: var(--bg-card) !important; /* 白色区域修复：强制使用主题卡片背景 */
  border: var(--border-width-base) solid var(--border-color) !important; /* 白色区域修复：使用主题边框色 */
  box-shadow: var(--shadow-sm); /* 硬编码修复：使用统一阴影变量 */
}

.form-card {
  background: var(--bg-card) !important; /* 白色区域修复：强制使用主题卡片背景 */
  border: var(--border-width-base) solid var(--border-color) !important; /* 白色区域修复：使用主题边框色 */
  box-shadow: var(--shadow-md); /* 硬编码修复：使用统一阴影变量 */
}

.step-content {
  min-height: 400px;
  padding: var(--app-gap) 0; /* 硬编码修复：使用统一间距变量 */
}

.step-title {
  margin-bottom: var(--spacing-xl); /* 硬编码修复：使用统一间距变量 */
  text-align: center;
  padding-bottom: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  border-bottom: var(--spacing-xs) solid var(--primary-color); /* 白色区域修复：使用主题主色 */
  
  h3 {
    font-size: var(--text-xl);
    font-weight: 600;
    color: var(--text-primary); /* 白色区域修复：使用主题文字色 */
  margin: 0 0 var(--app-gap-sm) 0; /* 硬编码修复：使用统一间距变量 */
  }
  
  p {
    color: var(--text-secondary); /* 白色区域修复：使用主题次要文字色 */
  margin: 0;
    font-size: var(--text-base);
  }
}

/* 按钮排版修复：步骤操作按钮 */
.step-actions {
  margin-top: var(--spacing-xl); /* 硬编码修复：使用统一间距变量 */
  text-align: center;
  padding-top: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  border-top: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */
  display: flex;
  justify-content: center;
  gap: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  align-items: center;
  flex-wrap: wrap;

.preview-content {
  padding: var(--app-gap); /* 硬编码修复：使用统一间距变量 */
  background: var(--bg-tertiary); /* 白色区域修复：使用主题背景 */
  border-radius: var(--radius-md); /* 硬编码修复：使用统一圆角变量 */
  border: var(--border-width-base) solid var(--border-color); /* 白色区域修复：使用主题边框色 */
  
  h4 {
    margin: var(--app-gap) 0 var(--app-gap-sm) 0; /* 硬编码修复：使用统一间距变量 */
  font-size: var(--text-lg);
    font-weight: 600;
    color: var(--text-primary); /* 白色区域修复：使用主题文字色 */
    
    &:first-child {
      margin-top: 0;
    }
  }
  
  .el-table {
    margin-top: var(--app-gap-sm); /* 硬编码修复：使用统一间距变量 */
  }
}

/* 白色区域修复：Card组件主题化 */
:deep(.el-card) {
  background: var(--bg-card) !important;
  border-color: var(--border-color) !important;
  
  .el-card__header {
    background: var(--bg-tertiary) !important;
    border-bottom-color: var(--border-color) !important;
    color: var(--text-primary) !important;
  }
  
  .el-card__body {
    background: var(--bg-card) !important;
    color: var(--text-primary) !important;
  }
}

/* 白色区域修复：Steps组件主题化 */
:deep(.el-steps) {
  .el-step__head {
    &.is-process {
      color: var(--primary-color) !important;
      border-color: var(--primary-color) !important;
    }
    
    &.is-finish {
      color: var(--success-color) !important;
      border-color: var(--success-color) !important;
    }
    
    &.is-wait {
      color: var(--text-muted) !important;
      border-color: var(--border-color) !important;
    }
  }
  
  .el-step__title {
    &.is-process {
      color: var(--primary-color) !important;
    }
    
    &.is-finish {
      color: var(--success-color) !important;
    }
    
    &.is-wait {
      color: var(--text-muted) !important;
    }
  }
  
  .el-step__description {
    &.is-process {
      color: var(--text-secondary) !important;
    }
    
    &.is-finish {
      color: var(--text-secondary) !important;
    }
    
    &.is-wait {
      color: var(--text-muted) !important;
    }
  }
  
  .el-step__line {
    background: var(--border-color) !important;
    
    &.is-finish {
      background: var(--success-color) !important;
    }
  }
}

/* 白色区域修复：表单组件主题化 */
:deep(.el-form-item__label) {
  color: var(--text-primary) !important;
}

:deep(.el-input) {
  .el-input__wrapper {
    background: var(--bg-tertiary) !important;
    border-color: var(--border-color) !important;
    
    &:hover {
      border-color: var(--border-light) !important;
    }
    
    &.is-focus {
      border-color: var(--primary-color) !important;
    }
  }
  
  .el-input__inner {
    background: transparent !important;
    color: var(--text-primary) !important;
    
    &::placeholder {
      color: var(--text-muted) !important;
    }
  }
  
  .el-input__count {
    color: var(--text-muted) !important;
  }
}

:deep(.el-textarea) {
  .el-textarea__inner {
    background: var(--bg-tertiary) !important;
    border-color: var(--border-color) !important;
    color: var(--text-primary) !important;
    
    &:hover {
      border-color: var(--border-light) !important;
    }
    
    &:focus {
      border-color: var(--primary-color) !important;
    }
    
    &::placeholder {
      color: var(--text-muted) !important;
    }
  }
  
  .el-input__count {
    color: var(--text-muted) !important;
  }
}

:deep(.el-select) {
  .el-input__wrapper {
    background: var(--bg-tertiary) !important;
    border-color: var(--border-color) !important;
  }
}

:deep(.el-input-number) {
  .el-input__wrapper {
    background: var(--bg-tertiary) !important;
    border-color: var(--border-color) !important;
  }
}

:deep(.el-date-editor) {
  .el-input__wrapper {
    background: var(--bg-tertiary) !important;
    border-color: var(--border-color) !important;
  }
}

/* 白色区域修复：按钮主题化 */
:deep(.el-button) {
  &.el-button--primary {
    background: var(--primary-color) !important;
    border-color: var(--primary-color) !important;
    
    &:hover {
      background: var(--primary-light) !important;
      border-color: var(--primary-light) !important;
    }
  }
  
  &.el-button--success {
    background: var(--success-color) !important;
    border-color: var(--success-color) !important;
    
    &:hover {
      background: var(--success-light) !important;
      border-color: var(--success-light) !important;
    }
  }
  
  &.el-button--danger {
    background: var(--danger-color) !important;
    border-color: var(--danger-color) !important;
    
    &:hover {
      background: var(--danger-light) !important;
      border-color: var(--danger-light) !important;
    }
  }
  
  &.el-button--default {
    background: var(--bg-tertiary) !important;
    border-color: var(--border-color) !important;
    color: var(--text-primary) !important;
    
    &:hover {
      background: var(--bg-hover) !important;
      border-color: var(--border-light) !important;
    }
  }
}

/* 白色区域修复：表格组件主题化 */
:deep(.el-table) {
  background: transparent !important;
  
  .el-table__header-wrapper {
    background: var(--bg-tertiary) !important;
  }
  
  tr {
    background: transparent !important;
    
    &:hover {
      background: var(--bg-hover) !important;
    }
    
    &.el-table__row--striped {
      background: var(--bg-tertiary) !important;
      
      &:hover {
        background: var(--bg-hover) !important;
      }
    }
  }
  
  th {
    background: var(--bg-tertiary) !important;
    color: var(--text-primary) !important;
    border-bottom: var(--border-width-base) solid var(--border-color) !important;
    font-weight: 600;
  }
  
  td {
    background: transparent !important;
    color: var(--text-primary) !important;
    border-bottom: var(--border-width-base) solid var(--border-color) !important;
  }
  
  .el-table__empty-block {
    background: var(--bg-card) !important;
    color: var(--text-muted) !important;
  }
}

/* 白色区域修复：Loading组件主题化 */
:deep(.el-loading-mask) {
  background: rgba(var(--bg-card-rgb), 0.8) !important;
  
  .el-loading-spinner {
    .el-loading-text {
      color: var(--text-primary) !important;
    }
    
    .circular {
      color: var(--primary-color) !important;
    }
  }
}

/* 白色区域修复：MessageBox组件主题化 */
:deep(.el-message-box) {
  background: var(--bg-card) !important;
  border: var(--border-width-base) solid var(--border-color) !important;
  
  .el-message-box__header {
    .el-message-box__title {
      color: var(--text-primary) !important;
    }
  }
  
  .el-message-box__content {
    color: var(--text-primary) !important;
  }
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .page-container {
    padding: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
  }
  
  .page-header {
    padding: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
  }
  
  .page-title {
    font-size: var(--text-xl);
  }
  
  .step-content {
    min-height: 300px;
    padding: var(--app-gap-sm) 0; /* 硬编码修复：移动端间距优化 */
  }
  
  .step-title {
    margin-bottom: var(--app-gap); /* 硬编码修复：移动端间距优化 */
    
    h3 {
      font-size: var(--text-lg);
    }
  }
  
  /* 按钮排版修复：移动端按钮优化 */
  .step-actions {
    flex-direction: column;
    align-items: stretch;
    
    .el-button {
      width: 100%;
      justify-content: center;
      margin-bottom: var(--app-gap-xs);
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  
  .preview-content {
    padding: var(--app-gap-sm); /* 硬编码修复：移动端间距优化 */
    
    h4 {
      font-size: var(--text-base);
    }
  }
  
  /* 表格在移动端的优化 */
  :deep(.el-table) {
    font-size: var(--text-sm);
    
    .el-table__cell {
      padding: var(--app-gap-xs) !important;
    }
  }
  
  /* 表单项在移动端的优化 */
  :deep(.el-form-item) {
    margin-bottom: var(--app-gap-sm);
  }
  
  :deep(.el-col) {
    margin-bottom: var(--app-gap-xs);
  }
}

@media (max-width: 992px) {
  .step-content {
    min-height: 350px;
  }
  
  /* 中等屏幕下的表格优化 */
  :deep(.el-table) {
    .el-table__cell {
      padding: var(--app-gap-xs) var(--app-gap-sm) !important;
    }
  }
}

/* 特殊样式：添加按钮的间距优化 */
:deep(.el-button) {
  &[style*="margin-top"] {
    margin-top: var(--app-gap-sm) !important;
  }
}

/* 特殊样式：内联样式的覆盖 */
:deep([style*="margin-top: var(--spacing-sm)"]) {
  margin-top: var(--app-gap-sm) !important;
}

:deep([style*="margin: 0 10px"]) {
  margin: 0 var(--app-gap-sm) !important;
}
}
}
}
}
</style> 