<template>
  <div class="smart-planning-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <el-icon class="title-icon">⚡</el-icon>
            智能规划
          </h1>
          <p class="page-description">基于AI算法的招生计划智能制定与优化</p>
        </div>
        <div class="action-section">
          <el-button type="primary" @click="generatePlan">
            <el-icon>🪄</el-icon>
            生成智能规划
          </el-button>
          <el-button @click="refreshData">
            <el-icon>🔄</el-icon>
            刷新数据
          </el-button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon primary">
            <el-icon>📈</el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalPlans }}</div>
            <div class="stat-label">总规划数</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon success">
            <el-icon>✅</el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.activePlans }}</div>
            <div class="stat-label">活跃规划</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon warning">
            <el-icon>⏰</el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.pendingPlans }}</div>
            <div class="stat-label">待执行</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon info">
            <el-icon>📊</el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.accuracy }}%</div>
            <div class="stat-label">预测准确率</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧：规划列表 -->
      <div class="planning-list">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>智能规划列表</span>
              <el-button type="text" @click="showCreateDialog = true">
                <el-icon>➕</el-icon>
                新建规划
              </el-button>
            </div>
          </template>
          
          <div class="list-content">
            <el-empty v-if="planningList.length === 0" description="暂无智能规划数据">
              <el-button type="primary" @click="showCreateDialog = true">创建第一个规划</el-button>
            </el-empty>
            
            <div v-else class="planning-items">
              <div 
                v-for="plan in planningList" 
                :key="plan.id"
                class="planning-item"
                :class="{ active: selectedPlan?.id === plan.id }"
                @click="selectPlan(plan)"
              >
                <div class="item-header">
                  <h3 class="item-title">{{ plan.name }}</h3>
                  <el-tag :type="getStatusType(plan.status)">{{ plan.status }}</el-tag>
                </div>
                <div class="item-meta">
                  <span class="meta-item">
                    <el-icon>📅</el-icon>
                    {{ formatDate(plan.createdAt) }}
                  </span>
                  <span class="meta-item">
                    <el-icon>👤</el-icon>
                    {{ plan.creator }}
                  </span>
                </div>
                <div class="item-description">{{ plan.description }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 右侧：规划详情 -->
      <div class="planning-detail">
        <el-card v-if="selectedPlan">
          <template #header>
            <div class="card-header">
              <span>{{ selectedPlan.name }}</span>
              <div class="header-actions">
                <el-button type="primary" size="small" @click="executePlan">执行规划</el-button>
                <el-button size="small" @click="editPlan">编辑</el-button>
                <el-button type="danger" size="small" @click="deletePlan">删除</el-button>
              </div>
            </div>
          </template>
          
          <div class="detail-content">
            <div class="detail-section">
              <h4>规划概述</h4>
              <p>{{ selectedPlan.description }}</p>
            </div>
            
            <div class="detail-section">
              <h4>关键指标</h4>
              <div class="metrics-grid">
                <div class="metric-item">
                  <span class="metric-label">目标招生数</span>
                  <span class="metric-value">{{ selectedPlan.targetEnrollment }}</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">预计完成率</span>
                  <span class="metric-value">{{ selectedPlan.expectedCompletion }}%</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">执行周期</span>
                  <span class="metric-value">{{ selectedPlan.duration }}天</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">优先级</span>
                  <span class="metric-value">{{ selectedPlan.priority }}</span>
                </div>
              </div>
            </div>
            
            <div class="detail-section">
              <h4>执行步骤</h4>
              <el-timeline>
                <el-timeline-item
                  v-for="(step, index) in selectedPlan.steps"
                  :key="index"
                  :timestamp="step.date"
                  :type="step.status === 'completed' ? 'success' : 'primary'"
                >
                  <h4>{{ step.title }}</h4>
                  <p>{{ step.description }}</p>
                </el-timeline-item>
              </el-timeline>
            </div>
          </div>
        </el-card>
        
        <el-card v-else class="empty-detail">
          <el-empty description="请选择一个规划查看详情" />
        </el-card>
      </div>
    </div>

    <!-- 创建规划对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="创建智能规划"
      width="600px"
      @close="resetCreateForm"
    >
      <el-form :model="createForm" :rules="createRules" ref="createFormRef" label-width="100px">
        <el-form-item label="规划名称" prop="name">
          <el-input v-model="createForm.name" placeholder="请输入规划名称" />
        </el-form-item>
        <el-form-item label="规划描述" prop="description">
          <el-input
            v-model="createForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入规划描述"
          />
        </el-form-item>
        <el-form-item label="目标招生数" prop="targetEnrollment">
          <el-input-number
            v-model="createForm.targetEnrollment"
            :min="1"
            :max="1000"
            placeholder="目标招生数"
          />
        </el-form-item>
        <el-form-item label="执行周期" prop="duration">
          <el-input-number
            v-model="createForm.duration"
            :min="1"
            :max="365"
            placeholder="执行周期（天）"
          />
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="createForm.priority" placeholder="请选择优先级">
            <el-option label="高" value="高" />
            <el-option label="中" value="中" />
            <el-option label="低" value="低" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createPlan" :loading="creating">
          {{ creating ? '创建中...' : '创建规划' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 响应式数据
const stats = reactive({
  totalPlans: 12,
  activePlans: 8,
  pendingPlans: 3,
  accuracy: 85
})

const planningList = ref([])
const selectedPlan = ref(null)
const showCreateDialog = ref(false)
const creating = ref(false)

// 创建表单
const createForm = reactive({
  name: '',
  description: '',
  targetEnrollment: 100,
  duration: 30,
  priority: '中'
})

const createRules = {
  name: [{ required: true, message: '请输入规划名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入规划描述', trigger: 'blur' }],
  targetEnrollment: [{ required: true, message: '请输入目标招生数', trigger: 'blur' }],
  duration: [{ required: true, message: '请输入执行周期', trigger: 'blur' }],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }]
}

const createFormRef = ref()

// 方法
const generatePlan = () => {
  ElMessage.success('智能规划生成功能开发中...')
}

const refreshData = () => {
  loadPlanningData()
  ElMessage.success('数据已刷新')
}

const selectPlan = (plan) => {
  selectedPlan.value = plan
}

const getStatusType = (status) => {
  const statusMap = {
    '活跃': 'success',
    '待执行': 'warning',
    '已完成': 'info',
    '已暂停': 'danger'
  }
  return statusMap[status] || 'info'
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const executePlan = () => {
  ElMessage.success('规划执行功能开发中...')
}

const editPlan = () => {
  ElMessage.success('编辑规划功能开发中...')
}

const deletePlan = () => {
  ElMessageBox.confirm('确定要删除这个规划吗？', '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const createPlan = async () => {
  if (!createFormRef.value) return
  
  try {
    await createFormRef.value.validate()
    creating.value = true
    
    // 模拟创建过程
    setTimeout(() => {
      const newPlan = {
        id: Date.now(),
        name: createForm.name,
        description: createForm.description,
        targetEnrollment: createForm.targetEnrollment,
        duration: createForm.duration,
        priority: createForm.priority,
        status: '待执行',
        creator: 'admin',
        createdAt: new Date(),
        expectedCompletion: Math.floor(Math.random() * 20) + 80,
        steps: [
          {
            title: '数据收集与分析',
            description: '收集历史招生数据，分析招生趋势',
            date: '2024-01-01',
            status: 'pending'
          },
          {
            title: '制定招生策略',
            description: '基于数据分析结果制定具体招生策略',
            date: '2024-01-05',
            status: 'pending'
          },
          {
            title: '执行招生活动',
            description: '按照策略执行各项招生活动',
            date: '2024-01-10',
            status: 'pending'
          }
        ]
      }
      
      planningList.value.unshift(newPlan)
      stats.totalPlans++
      stats.pendingPlans++
      
      creating.value = false
      showCreateDialog.value = false
      resetCreateForm()
      
      ElMessage.success('智能规划创建成功')
    }, 1500)
  } catch (error) {
    creating.value = false
    console.error('表单验证失败:', error)
  }
}

const resetCreateForm = () => {
  Object.assign(createForm, {
    name: '',
    description: '',
    targetEnrollment: 100,
    duration: 30,
    priority: '中'
  })
  createFormRef.value?.resetFields()
}

const loadPlanningData = () => {
  // 模拟加载数据
  planningList.value = [
    {
      id: 1,
      name: '2024春季招生智能规划',
      description: '基于历史数据和市场分析的春季招生计划',
      targetEnrollment: 150,
      duration: 45,
      priority: '高',
      status: '活跃',
      creator: 'admin',
      createdAt: new Date('2024-01-01'),
      expectedCompletion: 92,
      steps: [
        {
          title: '市场调研',
          description: '分析周边竞争对手和市场需求',
          date: '2024-01-01',
          status: 'completed'
        },
        {
          title: '制定策略',
          description: '基于调研结果制定招生策略',
          date: '2024-01-05',
          status: 'completed'
        },
        {
          title: '执行推广',
          description: '执行线上线下推广活动',
          date: '2024-01-10',
          status: 'pending'
        }
      ]
    },
    {
      id: 2,
      name: '暑期班招生规划',
      description: '针对暑期班的专项招生规划',
      targetEnrollment: 80,
      duration: 30,
      priority: '中',
      status: '待执行',
      creator: 'admin',
      createdAt: new Date('2024-01-15'),
      expectedCompletion: 88,
      steps: [
        {
          title: '需求分析',
          description: '分析暑期班需求和家长期望',
          date: '2024-01-15',
          status: 'pending'
        }
      ]
    }
  ]
}

// 生命周期
onMounted(() => {
  loadPlanningData()
})
</script>

<style scoped>
.smart-planning-container {
  padding: var(--text-2xl);
  background: var(--bg-hover);
  min-height: 100vh;
}

.page-header {
  background: white;
  border-radius: var(--spacing-sm);
  padding: var(--text-3xl);
  margin-bottom: var(--text-2xl);
  box-shadow: 0 2px var(--spacing-xs) var(--shadow-light);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section {
  flex: 1;
}

.page-title {
  display: flex;
  align-items: center;
  margin: 0 0 var(--spacing-sm) 0;
  font-size: var(--text-3xl);
  font-weight: 600;
  color: var(--text-primary);
}

.title-icon {
  margin-right: var(--spacing-sm);
  color: var(--primary-color);
}

.page-description {
  margin: 0;
  color: var(--info-color);
  font-size: var(--text-base);
}

.action-section {
  display: flex;
  gap: var(--text-sm);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--text-2xl);
  margin-bottom: var(--text-2xl);
}

.stat-card {
  border: none;
  box-shadow: 0 2px var(--spacing-xs) var(--shadow-light);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: var(--text-lg);
}

.stat-icon {
  width: var(--icon-size); height: var(--icon-size);
  border-radius: var(--spacing-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-2xl);
}

.stat-icon.primary {
  background: #e3f2fd;
  color: #1976d2;
}

.stat-icon.success {
  background: #e8f5e8;
  color: #4caf50;
}

.stat-icon.warning {
  background: var(--bg-white)3e0;
  color: #ff9800;
}

.stat-icon.info {
  background: #f3e5f5;
  color: #9c27b0;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: var(--text-3xl);
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1;
}

.stat-label {
  font-size: var(--text-base);
  color: var(--info-color);
  margin-top: var(--spacing-xs);
}

.main-content {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: var(--text-2xl);
}

.planning-list,
.planning-detail {
  height: fit-content;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list-content {
  max-min-height: 60px; height: auto;
  overflow-y: auto;
}

.planning-items {
  display: flex;
  flex-direction: column;
  gap: var(--text-sm);
}

.planning-item {
  padding: var(--text-lg);
  border: var(--border-width-base) solid var(--border-color-light);
  border-radius: var(--spacing-sm);
  cursor: pointer;
  transition: all 0.3s;
}

.planning-item:hover {
  border-color: var(--primary-color);
  box-shadow: 0 2px var(--spacing-sm) rgba(64, 158, 255, 0.1);
}

.planning-item.active {
  border-color: var(--primary-color);
  background: #f0f9ff;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.item-title {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.item-meta {
  display: flex;
  gap: var(--text-lg);
  margin-bottom: var(--spacing-sm);
  font-size: var(--text-sm);
  color: var(--info-color);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.item-description {
  font-size: var(--text-base);
  color: var(--text-regular);
  line-height: 1.4;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: var(--text-3xl);
}

.detail-section h4 {
  margin: 0 0 var(--text-sm) 0;
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--text-lg);
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--text-sm);
  background: var(--bg-gray-light);
  border-radius: var(--radius-md);
}

.metric-label {
  font-size: var(--text-base);
  color: var(--text-regular);
}

.metric-value {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.empty-detail {
  display: flex;
  align-items: center;
  justify-content: center;
  min-min-height: 60px; height: auto;
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
}

@media (max-width: var(--breakpoint-xl)) {
  .main-content {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: var(--breakpoint-md)) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--text-lg);
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
