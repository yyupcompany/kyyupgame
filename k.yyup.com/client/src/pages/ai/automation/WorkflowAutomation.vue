<template>
  <div class="workflow-automation-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <el-icon class="title-icon">⚙️</el-icon>
            AI工作流自动化
          </h1>
          <p class="page-description">智能化工作流程设计与自动化执行管理</p>
        </div>
        <div class="action-section">
          <el-button type="primary" @click="showCreateDialog = true">
            <el-icon>➕</el-icon>
            创建工作流
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
            <el-icon>📊</el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalWorkflows }}</div>
            <div class="stat-label">总工作流</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon success">
            <el-icon>▶️</el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.activeWorkflows }}</div>
            <div class="stat-label">运行中</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon warning">
            <el-icon>⏸️</el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.pausedWorkflows }}</div>
            <div class="stat-label">已暂停</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon info">
            <el-icon>📈</el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.successRate }}%</div>
            <div class="stat-label">成功率</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧：工作流列表 -->
      <div class="workflow-list">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>工作流列表</span>
              <el-select v-model="filterStatus" placeholder="筛选状态" style="max-width: 120px; width: 100%">
                <el-option label="全部" value="" />
                <el-option label="运行中" value="running" />
                <el-option label="已暂停" value="paused" />
                <el-option label="已停止" value="stopped" />
              </el-select>
            </div>
          </template>
          
          <div class="list-content">
            <el-empty v-if="filteredWorkflows.length === 0" description="暂无工作流数据">
              <el-button type="primary" @click="showCreateDialog = true">创建第一个工作流</el-button>
            </el-empty>
            
            <div v-else class="workflow-items">
              <div 
                v-for="workflow in filteredWorkflows" 
                :key="workflow.id"
                class="workflow-item"
                :class="{ active: selectedWorkflow?.id === workflow.id }"
                @click="selectWorkflow(workflow)"
              >
                <div class="item-header">
                  <h3 class="item-title">{{ workflow.name }}</h3>
                  <div class="item-status">
                    <el-tag :type="getStatusType(workflow.status)">{{ workflow.status }}</el-tag>
                    <el-dropdown @command="handleWorkflowAction">
                      <el-button type="text" size="small">
                        <el-icon>⋮</el-icon>
                      </el-button>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item :command="{action: 'start', workflow}">启动</el-dropdown-item>
                          <el-dropdown-item :command="{action: 'pause', workflow}">暂停</el-dropdown-item>
                          <el-dropdown-item :command="{action: 'stop', workflow}">停止</el-dropdown-item>
                          <el-dropdown-item :command="{action: 'edit', workflow}">编辑</el-dropdown-item>
                          <el-dropdown-item :command="{action: 'delete', workflow}" divided>删除</el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>
                </div>
                <div class="item-meta">
                  <span class="meta-item">
                    <el-icon>📅</el-icon>
                    {{ formatDate(workflow.createdAt) }}
                  </span>
                  <span class="meta-item">
                    <el-icon>👤</el-icon>
                    {{ workflow.creator }}
                  </span>
                  <span class="meta-item">
                    <el-icon>🔄</el-icon>
                    执行{{ workflow.executionCount }}次
                  </span>
                </div>
                <div class="item-description">{{ workflow.description }}</div>
                <div class="item-progress" v-if="workflow.status === 'running'">
                  <el-progress :percentage="workflow.progress" :show-text="false" />
                  <span class="progress-text">{{ workflow.progress }}%</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 右侧：工作流详情 -->
      <div class="workflow-detail">
        <el-card v-if="selectedWorkflow">
          <template #header>
            <div class="card-header">
              <span>{{ selectedWorkflow.name }}</span>
              <div class="header-actions">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="executeWorkflow"
                  :disabled="selectedWorkflow.status === 'running'"
                >
                  {{ selectedWorkflow.status === 'running' ? '运行中' : '执行工作流' }}
                </el-button>
                <el-button size="small" @click="editWorkflow">编辑</el-button>
                <el-button type="danger" size="small" @click="deleteWorkflow">删除</el-button>
              </div>
            </div>
          </template>
          
          <div class="detail-content">
            <div class="detail-section">
              <h4>工作流概述</h4>
              <p>{{ selectedWorkflow.description }}</p>
              <div class="workflow-metrics">
                <div class="metric-item">
                  <span class="metric-label">触发方式</span>
                  <span class="metric-value">{{ selectedWorkflow.triggerType }}</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">执行次数</span>
                  <span class="metric-value">{{ selectedWorkflow.executionCount }}</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">成功率</span>
                  <span class="metric-value">{{ selectedWorkflow.successRate }}%</span>
                </div>
                <div class="metric-item">
                  <span class="metric-label">平均耗时</span>
                  <span class="metric-value">{{ selectedWorkflow.avgDuration }}s</span>
                </div>
              </div>
            </div>
            
            <div class="detail-section">
              <h4>工作流步骤</h4>
              <div class="workflow-steps">
                <div 
                  v-for="(step, index) in selectedWorkflow.steps" 
                  :key="index"
                  class="step-item"
                  :class="{ 
                    completed: step.status === 'completed',
                    running: step.status === 'running',
                    failed: step.status === 'failed'
                  }"
                >
                  <div class="step-number">{{ index + 1 }}</div>
                  <div class="step-content">
                    <div class="step-title">{{ step.name }}</div>
                    <div class="step-description">{{ step.description }}</div>
                    <div class="step-config" v-if="step.config">
                      <el-tag size="small" v-for="(value, key) in step.config" :key="key">
                        {{ key }}: {{ value }}
                      </el-tag>
                    </div>
                  </div>
                  <div class="step-status">
                    <el-icon v-if="step.status === 'completed'">✅</el-icon>
                    <el-icon v-else-if="step.status === 'running'">⏳</el-icon>
                    <el-icon v-else-if="step.status === 'failed'">❌</el-icon>
                    <el-icon v-else>⏸️</el-icon>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="detail-section">
              <h4>执行历史</h4>
              <div class="execution-history">
                <div 
                  v-for="execution in selectedWorkflow.executions" 
                  :key="execution.id"
                  class="execution-item"
                >
                  <div class="execution-time">{{ formatDateTime(execution.startTime) }}</div>
                  <div class="execution-status">
                    <el-tag :type="getStatusType(execution.status)">{{ execution.status }}</el-tag>
                  </div>
                  <div class="execution-duration">{{ execution.duration }}s</div>
                  <div class="execution-result">{{ execution.result }}</div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
        
        <el-card v-else class="empty-detail">
          <el-empty description="请选择一个工作流查看详情" />
        </el-card>
      </div>
    </div>

    <!-- 创建工作流对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="创建AI工作流"
      width="800px"
      @close="resetCreateForm"
    >
      <el-form :model="createForm" :rules="createRules" ref="createFormRef" label-width="120px">
        <el-form-item label="工作流名称" prop="name">
          <el-input v-model="createForm.name" placeholder="请输入工作流名称" />
        </el-form-item>
        <el-form-item label="工作流描述" prop="description">
          <el-input
            v-model="createForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入工作流描述"
          />
        </el-form-item>
        <el-form-item label="触发方式" prop="triggerType">
          <el-select v-model="createForm.triggerType" placeholder="请选择触发方式">
            <el-option label="手动触发" value="manual" />
            <el-option label="定时触发" value="scheduled" />
            <el-option label="事件触发" value="event" />
            <el-option label="API触发" value="api" />
          </el-select>
        </el-form-item>
        <el-form-item label="工作流类型" prop="type">
          <el-select v-model="createForm.type" placeholder="请选择工作流类型">
            <el-option label="数据处理" value="data-processing" />
            <el-option label="通知发送" value="notification" />
            <el-option label="报告生成" value="report-generation" />
            <el-option label="系统维护" value="system-maintenance" />
            <el-option label="用户管理" value="user-management" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createWorkflow" :loading="creating">
          {{ creating ? '创建中...' : '创建工作流' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 响应式数据
const stats = reactive({
  totalWorkflows: 15,
  activeWorkflows: 8,
  pausedWorkflows: 4,
  successRate: 92
})

const workflowList = ref([])
const selectedWorkflow = ref(null)
const showCreateDialog = ref(false)
const creating = ref(false)
const filterStatus = ref('')

// 创建表单
const createForm = reactive({
  name: '',
  description: '',
  triggerType: 'manual',
  type: 'data-processing'
})

const createRules = {
  name: [{ required: true, message: '请输入工作流名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入工作流描述', trigger: 'blur' }],
  triggerType: [{ required: true, message: '请选择触发方式', trigger: 'change' }],
  type: [{ required: true, message: '请选择工作流类型', trigger: 'change' }]
}

const createFormRef = ref()

// 计算属性
const filteredWorkflows = computed(() => {
  if (!filterStatus.value) return workflowList.value
  return workflowList.value.filter(workflow => workflow.status === filterStatus.value)
})

// 方法
const refreshData = () => {
  loadWorkflowData()
  ElMessage.success('数据已刷新')
}

const selectWorkflow = (workflow) => {
  selectedWorkflow.value = workflow
}

const getStatusType = (status) => {
  const statusMap = {
    'running': 'success',
    'paused': 'warning',
    'stopped': 'info',
    'failed': 'danger',
    'completed': 'success'
  }
  return statusMap[status] || 'info'
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const formatDateTime = (date) => {
  return new Date(date).toLocaleString('zh-CN')
}

const handleWorkflowAction = ({ action, workflow }) => {
  switch (action) {
    case 'start':
      startWorkflow(workflow)
      break
    case 'pause':
      pauseWorkflow(workflow)
      break
    case 'stop':
      stopWorkflow(workflow)
      break
    case 'edit':
      editWorkflow(workflow)
      break
    case 'delete':
      deleteWorkflow(workflow)
      break
  }
}

const startWorkflow = (workflow) => {
  ElMessage.success(`启动工作流: ${workflow.name}`)
  workflow.status = 'running'
  workflow.progress = 0
}

const pauseWorkflow = (workflow) => {
  ElMessage.success(`暂停工作流: ${workflow.name}`)
  workflow.status = 'paused'
}

const stopWorkflow = (workflow) => {
  ElMessage.success(`停止工作流: ${workflow.name}`)
  workflow.status = 'stopped'
  workflow.progress = 0
}

const executeWorkflow = () => {
  if (selectedWorkflow.value) {
    startWorkflow(selectedWorkflow.value)
  }
}

const editWorkflow = (workflow = selectedWorkflow.value) => {
  ElMessage.success(`编辑工作流功能开发中: ${workflow?.name}`)
}

const deleteWorkflow = (workflow = selectedWorkflow.value) => {
  ElMessageBox.confirm(`确定要删除工作流"${workflow?.name}"吗？`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = workflowList.value.findIndex(w => w.id === workflow.id)
    if (index > -1) {
      workflowList.value.splice(index, 1)
      if (selectedWorkflow.value?.id === workflow.id) {
        selectedWorkflow.value = null
      }
      stats.totalWorkflows--
      ElMessage.success('删除成功')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const createWorkflow = async () => {
  if (!createFormRef.value) return
  
  try {
    await createFormRef.value.validate()
    creating.value = true
    
    // 模拟创建过程
    setTimeout(() => {
      const newWorkflow = {
        id: Date.now(),
        name: createForm.name,
        description: createForm.description,
        triggerType: createForm.triggerType,
        type: createForm.type,
        status: 'stopped',
        creator: 'admin',
        createdAt: new Date(),
        executionCount: 0,
        successRate: 100,
        avgDuration: 0,
        progress: 0,
        steps: [
          {
            name: '初始化',
            description: '工作流初始化步骤',
            status: 'pending',
            config: { timeout: '30s' }
          },
          {
            name: '数据处理',
            description: '处理输入数据',
            status: 'pending',
            config: { batchSize: '100' }
          },
          {
            name: '结果输出',
            description: '输出处理结果',
            status: 'pending',
            config: { format: 'json' }
          }
        ],
        executions: []
      }
      
      workflowList.value.unshift(newWorkflow)
      stats.totalWorkflows++
      
      creating.value = false
      showCreateDialog.value = false
      resetCreateForm()
      
      ElMessage.success('AI工作流创建成功')
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
    triggerType: 'manual',
    type: 'data-processing'
  })
  createFormRef.value?.resetFields()
}

const loadWorkflowData = () => {
  // 模拟加载数据
  workflowList.value = [
    {
      id: 1,
      name: '每日数据备份',
      description: '自动备份系统重要数据到云存储',
      triggerType: 'scheduled',
      type: 'system-maintenance',
      status: 'running',
      creator: 'admin',
      createdAt: new Date('2024-01-01'),
      executionCount: 45,
      successRate: 98,
      avgDuration: 120,
      progress: 75,
      steps: [
        { name: '数据收集', description: '收集需要备份的数据', status: 'completed', config: { source: 'database' } },
        { name: '数据压缩', description: '压缩数据以节省空间', status: 'completed', config: { compression: 'gzip' } },
        { name: '上传云端', description: '上传到云存储服务', status: 'running', config: { provider: 'aws-s3' } },
        { name: '验证完整性', description: '验证备份文件完整性', status: 'pending', config: { checksum: 'md5' } }
      ],
      executions: [
        { id: 1, startTime: new Date('2024-01-20 02:00:00'), status: 'completed', duration: 118, result: '备份成功' },
        { id: 2, startTime: new Date('2024-01-19 02:00:00'), status: 'completed', duration: 125, result: '备份成功' }
      ]
    },
    {
      id: 2,
      name: '招生通知发送',
      description: '向潜在家长发送招生信息和活动通知',
      triggerType: 'event',
      type: 'notification',
      status: 'paused',
      creator: 'admin',
      createdAt: new Date('2024-01-10'),
      executionCount: 12,
      successRate: 95,
      avgDuration: 30,
      progress: 0,
      steps: [
        { name: '获取目标用户', description: '筛选符合条件的家长', status: 'pending', config: { criteria: 'age_range' } },
        { name: '生成通知内容', description: '根据模板生成个性化内容', status: 'pending', config: { template: 'enrollment' } },
        { name: '发送通知', description: '通过多渠道发送通知', status: 'pending', config: { channels: 'email,sms' } }
      ],
      executions: [
        { id: 1, startTime: new Date('2024-01-15 10:00:00'), status: 'completed', duration: 28, result: '发送成功，到达率92%' }
      ]
    }
  ]
}

// 生命周期
onMounted(() => {
  loadWorkflowData()
})
</script>

<style scoped>
.workflow-automation-container {
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

.workflow-list,
.workflow-detail {
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

.workflow-items {
  display: flex;
  flex-direction: column;
  gap: var(--text-sm);
}

.workflow-item {
  padding: var(--text-lg);
  border: var(--border-width-base) solid var(--border-color-light);
  border-radius: var(--spacing-sm);
  cursor: pointer;
  transition: all 0.3s;
}

.workflow-item:hover {
  border-color: var(--primary-color);
  box-shadow: 0 2px var(--spacing-sm) rgba(64, 158, 255, 0.1);
}

.workflow-item.active {
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

.item-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
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
  margin-bottom: var(--spacing-sm);
}

.item-progress {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.progress-text {
  font-size: var(--text-sm);
  color: var(--info-color);
  min-width: auto;
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

.workflow-metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--text-lg);
  margin-top: var(--text-sm);
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

.workflow-steps {
  display: flex;
  flex-direction: column;
  gap: var(--text-sm);
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: var(--text-sm);
  padding: var(--text-lg);
  border: var(--border-width-base) solid var(--border-color-light);
  border-radius: var(--spacing-sm);
  transition: all 0.3s;
}

.step-item.completed {
  border-color: var(--success-color);
  background: #f0f9ff;
}

.step-item.running {
  border-color: var(--primary-color);
  background: #ecf5ff;
}

.step-item.failed {
  border-color: var(--danger-color);
  background: #fef0f0;
}

.step-number {
  width: var(--text-3xl);
  height: var(--text-3xl);
  border-radius: var(--radius-full);
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-sm);
  font-weight: 600;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.step-description {
  font-size: var(--text-base);
  color: var(--text-regular);
  margin-bottom: var(--spacing-sm);
}

.step-config {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.step-status {
  font-size: var(--text-xl);
  flex-shrink: 0;
}

.execution-history {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.execution-item {
  display: grid;
  grid-template-columns: 1fr auto auto 2fr;
  gap: var(--text-lg);
  align-items: center;
  padding: var(--text-sm);
  background: var(--bg-gray-light);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
}

.execution-time {
  color: var(--text-regular);
}

.execution-duration {
  color: var(--info-color);
}

.execution-result {
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
  
  .workflow-metrics {
    grid-template-columns: 1fr;
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
  
  .execution-item {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }
}
</style>
