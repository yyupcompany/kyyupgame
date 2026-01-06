<template>
  <UnifiedCenterLayout
    title="测评中心"
    description="管理测评配置、题目和体能训练项目"
    icon="grid"
  >
    <!-- 头部操作按钮 -->
    <template #header-actions>
      <el-button type="primary" size="large" @click="handleCreateConfig">
        <UnifiedIcon name="Plus" />
        新建配置
      </el-button>
    </template>

    <!-- 统计卡片 -->
    <template #stats>
      <el-row :gutter="16">
        <el-col :xs="12" :sm="12" :md="6" :lg="6">
          <StatCard
            title="测评配置数"
            :value="stats.configCount"
            unit="个"
            type="primary"
            icon-name="setting"
          />
        </el-col>
        <el-col :xs="12" :sm="12" :md="6" :lg="6">
          <StatCard
            title="题目总数"
            :value="stats.questionCount"
            unit="题"
            type="success"
            icon-name="document"
          />
        </el-col>
        <el-col :xs="12" :sm="12" :md="6" :lg="6">
          <StatCard
            title="完成测评数"
            :value="stats.completedCount"
            unit="次"
            type="info"
            icon-name="check"
          />
        </el-col>
        <el-col :xs="12" :sm="12" :md="6" :lg="6">
          <StatCard
            title="体能项目数"
            :value="stats.physicalItemCount"
            unit="个"
            type="warning"
            icon-name="activity"
          />
        </el-col>
      </el-row>
    </template>

    <!-- 主要内容区域 -->
    <el-tabs v-model="activeTab" class="content-tabs">
      <!-- 测评配置标签页 -->
      <el-tab-pane label="测评配置" name="configs">
        <div class="table-container">
          <div class="table-wrapper">
<el-table class="responsive-table" :data="configs" v-loading="configsLoading" border>
            <el-table-column prop="id" label="ID" width="var(--table-column-width-xs)" />
            <el-table-column prop="name" label="配置名称" />
            <el-table-column prop="minAge" label="最小年龄" width="var(--table-column-width-sm)">
              <template #default="{ row }">
                {{ row.minAge }}个月
              </template>
            </el-table-column>
            <el-table-column prop="maxAge" label="最大年龄" width="var(--table-column-width-sm)">
              <template #default="{ row }">
                {{ row.maxAge }}个月
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="var(--table-column-width-sm)">
              <template #default="{ row }">
                <el-tag :type="row.status === 'active' ? 'success' : 'info'">
                  {{ row.status === 'active' ? '启用' : '停用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="var(--table-column-width-lg)">
              <template #default="{ row }">
                <el-button size="small" @click="handleEditConfig(row)">编辑</el-button>
                <el-button size="small" type="danger" @click="handleDeleteConfig(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
</div>
        </div>
      </el-tab-pane>

      <!-- 题目管理标签页 -->
      <el-tab-pane label="题目管理" name="questions">
        <div class="table-toolbar">
          <el-button type="primary" @click="handleCreateQuestion">
            <UnifiedIcon name="Plus" />
            新建题目
          </el-button>
          <el-select v-model="questionFilter.dimension" placeholder="选择维度" clearable style="width: var(--form-width-xs)">
            <el-option label="专注力" value="attention" />
            <el-option label="记忆力" value="memory" />
            <el-option label="逻辑思维" value="logic" />
            <el-option label="语言能力" value="language" />
            <el-option label="精细动作" value="motor" />
            <el-option label="社交能力" value="social" />
          </el-select>
        </div>
        <div class="table-container">
          <el-table class="responsive-table" :data="questions" v-loading="questionsLoading" border>
            <el-table-column prop="id" label="ID" width="var(--table-column-width-xs)" />
            <el-table-column prop="title" label="题目标题" show-overflow-tooltip />
            <el-table-column label="配图" width="100">
              <template #default="{ row }">
                <el-image
                  v-if="row.imageUrl"
                  :src="row.imageUrl"
                  fit="cover"
                  style="width: var(--image-size-sm); height: var(--image-size-sm); border-radius: var(--radius-sm);"
                  :preview-src-list="[row.imageUrl]"
                >
                  <template #error>
                    <div style="width: var(--image-size-sm); height: var(--image-size-sm); display: flex; align-items: center; justify-content: center; background: var(--bg-hover); border-radius: var(--radius-sm);">
                      <UnifiedIcon name="default" />
                    </div>
                  </template>
                </el-image>
                <div v-else style="width: var(--image-size-sm); height: var(--image-size-sm); display: flex; align-items: center; justify-content: center; background: var(--bg-hover); border-radius: var(--radius-sm); color: var(--text-placeholder);">
                  <UnifiedIcon name="default" />
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="dimension" label="维度" width="100">
              <template #default="{ row }">
                <el-tag size="small">{{ getDimensionName(row.dimension) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="ageGroup" label="年龄段" width="100" />
            <el-table-column prop="questionType" label="类型" width="100">
              <template #default="{ row }">
                {{ row.questionType === 'qa' ? '问答' : row.questionType === 'game' ? '游戏' : '互动' }}
              </template>
            </el-table-column>
            <el-table-column prop="score" label="分值" width="var(--table-column-width-xs)" />
            <el-table-column prop="status" label="状态" width="var(--table-column-width-sm)">
              <template #default="{ row }">
                <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
                  {{ row.status === 'active' ? '启用' : '停用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="var(--table-column-width-lg)">
              <template #default="{ row }">
                <el-button size="small" @click="handleEditQuestion(row)">编辑</el-button>
                <el-button size="small" type="danger" @click="handleDeleteQuestion(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- 体能训练项目标签页 -->
      <el-tab-pane label="体能训练项目" name="physical">
        <div class="table-toolbar">
          <el-button type="primary" @click="handleCreatePhysicalItem">
            <UnifiedIcon name="Plus" />
            新建项目
          </el-button>
        </div>
        <div class="table-container">
          <el-table class="responsive-table" :data="physicalItems" v-loading="physicalItemsLoading" border>
            <el-table-column prop="id" label="ID" width="var(--table-column-width-xs)" />
            <el-table-column prop="name" label="项目名称" />
            <el-table-column prop="category" label="分类" width="120">
              <template #default="{ row }">
                {{ getCategoryName(row.category) }}
              </template>
            </el-table-column>
            <el-table-column prop="minAge" label="最小年龄" width="var(--table-column-width-sm)">
              <template #default="{ row }">
                {{ row.minAge }}个月
              </template>
            </el-table-column>
            <el-table-column prop="maxAge" label="最大年龄" width="var(--table-column-width-sm)">
              <template #default="{ row }">
                {{ row.maxAge }}个月
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="var(--table-column-width-sm)">
              <template #default="{ row }">
                <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
                  {{ row.status === 'active' ? '启用' : '停用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="var(--table-column-width-lg)">
              <template #default="{ row }">
                <el-button size="small" @click="handleEditPhysicalItem(row)">编辑</el-button>
                <el-button size="small" type="danger" @click="handleDeletePhysicalItem(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- 测评统计标签页 -->
      <el-tab-pane label="测评统计" name="stats">
        <div class="stats-container">
          <el-card>
            <template #header>
              <h3>测评数据统计</h3>
            </template>
            <el-row :gutter="48">
              <el-col :span="6">
                <div class="stat-item">
                  <div class="stat-value">{{ stats.totalRecords }}</div>
                  <div class="stat-label">总测评数</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-item">
                  <div class="stat-value">{{ stats.completedRecords }}</div>
                  <div class="stat-label">已完成</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-item">
                  <div class="stat-value">{{ stats.inProgressRecords }}</div>
                  <div class="stat-label">进行中</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-item">
                  <div class="stat-value">{{ stats.completionRate.toFixed(1) }}%</div>
                  <div class="stat-label">完成率</div>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 配置编辑对话框 -->
    <el-dialog v-model="configDialogVisible" :title="configDialogTitle" width="var(--dialog-width-lg)">
      <el-form :model="configForm" label-width="var(--form-label-width)">
        <el-form-item label="配置名称" required>
          <el-input v-model="configForm.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="configForm.description" type="textarea" />
        </el-form-item>
        <el-form-item label="最小年龄" required>
          <el-input-number v-model="configForm.minAge" :min="24" :max="72" />
        </el-form-item>
        <el-form-item label="最大年龄" required>
          <el-input-number v-model="configForm.maxAge" :min="24" :max="72" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="configForm.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="configDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveConfig">保存</el-button>
      </template>
    </el-dialog>

    <!-- 题目编辑对话框 -->
    <el-dialog v-model="questionDialogVisible" :title="questionDialogTitle" width="var(--dialog-width-xl)">
      <el-form :model="questionForm" label-width="var(--form-label-width)">
        <el-form-item label="配置" required>
          <el-select v-model="questionForm.configId" placeholder="选择配置">
            <el-option
              v-for="config in configs"
              :key="config.id"
              :label="config.name"
              :value="config.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="维度" required>
          <el-select v-model="questionForm.dimension">
            <el-option label="专注力" value="attention" />
            <el-option label="记忆力" value="memory" />
            <el-option label="逻辑思维" value="logic" />
            <el-option label="语言能力" value="language" />
            <el-option label="精细动作" value="motor" />
            <el-option label="社交能力" value="social" />
          </el-select>
        </el-form-item>
        <el-form-item label="年龄段" required>
          <el-input v-model="questionForm.ageGroup" placeholder="如：24-36" />
        </el-form-item>
        <el-form-item label="题目类型" required>
          <el-select v-model="questionForm.questionType">
            <el-option label="问答" value="qa" />
            <el-option label="游戏" value="game" />
            <el-option label="互动" value="interactive" />
          </el-select>
        </el-form-item>
        <el-form-item label="题目标题" required>
          <el-input v-model="questionForm.title" />
        </el-form-item>
        <el-form-item label="题目内容" required>
          <el-input v-model="questionForm.content" type="textarea" :rows="4" placeholder='JSON格式，例如：{"question":"问题","options":[...],"correctAnswer":"..."}' />
        </el-form-item>
        <el-form-item label="题目配图">
          <div class="image-upload-container">
            <div v-if="questionForm.imageUrl" class="image-preview">
              <el-image
                :src="questionForm.imageUrl"
                fit="cover"
                style="width: var(--image-size-md); height: var(--image-size-md); border-radius: var(--radius-sm);"
                :preview-src-list="[questionForm.imageUrl]"
              />
              <el-button size="small" type="danger" @click="questionForm.imageUrl = ''" style="margin-top: var(--spacing-2xl);">删除图片</el-button>
            </div>
            <div v-else class="upload-placeholder">
              <el-input v-model="questionForm.imageUrl" placeholder="图片URL（可直接输入或生成）" style="margin-bottom: var(--spacing-2xl);" />
              <el-button type="primary" @click="handleGenerateImage" :loading="generatingImage">
                <UnifiedIcon name="default" />
                AI生成图片
              </el-button>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="图片提示词" v-if="!questionForm.imageUrl">
          <el-input v-model="questionForm.imagePrompt" type="textarea" :rows="2" placeholder="AI生成图片的详细提示词（可选，留空则自动生成）" />
        </el-form-item>
        <el-form-item label="分值">
          <el-input-number v-model="questionForm.score" :min="1" :max="100" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="questionForm.sortOrder" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="questionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveQuestion">保存</el-button>
      </template>
    </el-dialog>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, Plus, CircleCheck, Setting, Promotion, Picture, MagicStick } from '@element-plus/icons-vue'
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'
import StatCard from '@/components/centers/StatCard.vue'
import { assessmentAdminApi } from '@/api/assessment-admin'

const activeTab = ref('configs')
const configs = ref<any[]>([])
const questions = ref<any[]>([])
const physicalItems = ref<any[]>([])
const configsLoading = ref(false)
const questionsLoading = ref(false)
const physicalItemsLoading = ref(false)

const stats = ref({
  configCount: 0,
  questionCount: 0,
  completedCount: 0,
  physicalItemCount: 0,
  totalRecords: 0,
  completedRecords: 0,
  inProgressRecords: 0,
  completionRate: 0
})

const questionFilter = ref({
  dimension: ''
})

const configDialogVisible = ref(false)
const configDialogTitle = ref('新建配置')
const configForm = ref({
  id: null,
  name: '',
  description: '',
  minAge: 36,
  maxAge: 48,
  dimensions: ['attention', 'memory', 'logic', 'language', 'motor', 'social'],
  status: 'active'
})

const questionDialogVisible = ref(false)
const questionDialogTitle = ref('新建题目')
const questionForm = ref({
  id: null,
  configId: null,
  dimension: '',
  ageGroup: '',
  questionType: 'qa',
  title: '',
  content: '',
  gameConfig: '',
  imageUrl: '',
  imagePrompt: '',
  difficulty: 1,
  score: 10,
  sortOrder: 0,
  status: 'active'
})

const generatingImage = ref(false)

// 获取维度名称
const getDimensionName = (dimension: string): string => {
  const map: Record<string, string> = {
    attention: '专注力',
    memory: '记忆力',
    logic: '逻辑思维',
    language: '语言能力',
    motor: '精细动作',
    social: '社交能力'
  }
  return map[dimension] || dimension
}

// 获取分类名称
const getCategoryName = (category: string): string => {
  const map: Record<string, string> = {
    running: '跑步',
    jumping: '跳跃',
    balancing: '平衡',
    climbing: '攀爬',
    throwing: '投掷',
    coordination: '协调',
    agility: '敏捷'
  }
  return map[category] || category
}

// 加载配置列表
const loadConfigs = async () => {
  try {
    configsLoading.value = true
    const response = await assessmentAdminApi.getConfigs()
    if (response.data?.success) {
      configs.value = response.data.data.items || []
      stats.value.configCount = response.data.data.total || 0
    }
  } catch (error: any) {
    ElMessage.error('加载配置失败')
  } finally {
    configsLoading.value = false
  }
}

// 加载题目列表
const loadQuestions = async () => {
  try {
    questionsLoading.value = true
    const params: any = {}
    if (questionFilter.value.dimension) {
      params.dimension = questionFilter.value.dimension
    }
    const response = await assessmentAdminApi.getQuestions(params)
    if (response.data?.success) {
      questions.value = response.data.data.items || []
      stats.value.questionCount = response.data.data.total || 0
    }
  } catch (error: any) {
    ElMessage.error('加载题目失败')
  } finally {
    questionsLoading.value = false
  }
}

// 加载体能项目列表
const loadPhysicalItems = async () => {
  try {
    physicalItemsLoading.value = true
    const response = await assessmentAdminApi.getPhysicalItems()
    if (response.data?.success) {
      physicalItems.value = response.data.data.items || []
      stats.value.physicalItemCount = response.data.data.total || 0
    }
  } catch (error: any) {
    ElMessage.error('加载项目失败')
  } finally {
    physicalItemsLoading.value = false
  }
}

// 加载统计
const loadStats = async () => {
  try {
    const response = await assessmentAdminApi.getStats()
    if (response.data?.success) {
      const data = response.data.data
      stats.value.totalRecords = data.totalRecords || 0
      stats.value.completedRecords = data.completedRecords || 0
      stats.value.inProgressRecords = data.inProgressRecords || 0
      stats.value.completionRate = data.completionRate || 0
    }
  } catch (error: any) {
    console.error('加载统计失败:', error)
  }
}

// 创建配置
const handleCreateConfig = () => {
  configForm.value = {
    id: null,
    name: '',
    description: '',
    minAge: 36,
    maxAge: 48,
    dimensions: ['attention', 'memory', 'logic', 'language', 'motor', 'social'],
    status: 'active'
  }
  configDialogTitle.value = '新建配置'
  configDialogVisible.value = true
}

// 编辑配置
const handleEditConfig = (row: any) => {
  configForm.value = { ...row }
  configDialogTitle.value = '编辑配置'
  configDialogVisible.value = true
}

// 保存配置
const handleSaveConfig = async () => {
  try {
    if (configForm.value.id) {
      await assessmentAdminApi.updateConfig(configForm.value.id, configForm.value)
      ElMessage.success('更新成功')
    } else {
      await assessmentAdminApi.createConfig(configForm.value)
      ElMessage.success('创建成功')
    }
    configDialogVisible.value = false
    loadConfigs()
  } catch (error: any) {
    ElMessage.error('保存失败')
  }
}

// 删除配置
const handleDeleteConfig = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该配置吗？', '提示', {
      type: 'warning'
    })
    await assessmentAdminApi.deleteConfig(row.id)
    ElMessage.success('删除成功')
    loadConfigs()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// AI生成图片
const handleGenerateImage = async () => {
  try {
    generatingImage.value = true
    
    // 生成提示词（如果用户没有提供）
    let prompt = questionForm.value.imagePrompt
    if (!prompt) {
      prompt = generateImagePrompt()
    }
    
    ElMessage.info('正在生成图片，请稍候...')
    
    // 调用 AI 生成图片 API（使用 AIBridge 统计用量）
    const response = await assessmentAdminApi.generateImage({
      prompt,
      questionId: questionForm.value.id
    })
    
    if (response.data?.success && response.data.data.imageUrl) {
      questionForm.value.imageUrl = response.data.data.imageUrl
      questionForm.value.imagePrompt = prompt
      ElMessage.success({
        message: `图片生成成功！模型: ${response.data.data.modelUsed || '豆包文生图'}`,
        duration: 3000
      })
    } else {
      ElMessage.error(response.data?.message || '图片生成失败')
    }
  } catch (error: any) {
    ElMessage.error('图片生成失败：' + error.message)
  } finally {
    generatingImage.value = false
  }
}

// 生成图片提示词
const generateImagePrompt = (): string => {
  const dimensionScenes: Record<string, string> = {
    attention: '专注力训练场景，孩子正在仔细观察和比较',
    memory: '记忆力训练场景，孩子正在回忆和记住',
    logic: '逻辑思维训练场景，孩子正在分类和推理',
    language: '语言能力训练场景，孩子正在表达和沟通',
    motor: '精细动作训练场景，孩子正在动手操作',
    social: '社交能力训练场景，孩子正在与他人互动'
  }
  
  let prompt = `高质量儿童教育插画，幼儿，${dimensionScenes[questionForm.value.dimension] || '学习场景'}，`
  prompt += '卡通风格，色彩明亮温暖，线条简洁清晰，背景简单不复杂，适合幼儿视觉感知，教育性强，安全友好的画面氛围'
  
  return prompt
}

// 创建题目
const handleCreateQuestion = () => {
  questionForm.value = {
    id: null,
    configId: configs.value[0]?.id || null,
    dimension: '',
    ageGroup: '',
    questionType: 'qa',
    title: '',
    content: '',
    gameConfig: '',
    imageUrl: '',
    imagePrompt: '',
    difficulty: 1,
    score: 10,
    sortOrder: 0,
    status: 'active'
  }
  questionDialogTitle.value = '新建题目'
  questionDialogVisible.value = true
}

// 编辑题目
const handleEditQuestion = (row: any) => {
  questionForm.value = { ...row }
  if (typeof questionForm.value.content === 'object') {
    questionForm.value.content = JSON.stringify(questionForm.value.content)
  }
  questionDialogTitle.value = '编辑题目'
  questionDialogVisible.value = true
}

// 保存题目
const handleSaveQuestion = async () => {
  try {
    if (questionForm.value.id) {
      await assessmentAdminApi.updateQuestion(questionForm.value.id, questionForm.value)
      ElMessage.success('更新成功')
    } else {
      await assessmentAdminApi.createQuestion(questionForm.value)
      ElMessage.success('创建成功')
    }
    questionDialogVisible.value = false
    loadQuestions()
  } catch (error: any) {
    ElMessage.error('保存失败')
  }
}

// 删除题目
const handleDeleteQuestion = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该题目吗？', '提示', {
      type: 'warning'
    })
    await assessmentAdminApi.deleteQuestion(row.id)
    ElMessage.success('删除成功')
    loadQuestions()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 创建体能项目
const handleCreatePhysicalItem = () => {
  ElMessage.info('体能项目创建功能开发中')
}

// 编辑体能项目
const handleEditPhysicalItem = (row: any) => {
  ElMessage.info('体能项目编辑功能开发中')
}

// 删除体能项目
const handleDeletePhysicalItem = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该项目吗？', '提示', {
      type: 'warning'
    })
    await assessmentAdminApi.deletePhysicalItem(row.id)
    ElMessage.success('删除成功')
    loadPhysicalItems()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadConfigs()
  loadQuestions()
  loadPhysicalItems()
  loadStats()
})
</script>

<style scoped lang="scss">
// 工具栏样式
.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
  gap: var(--spacing-md);
  
  .el-select {
    flex-shrink: 0;
  }
}

// 表格容器样式 - 改进版
.table-container {
  background: var(--bg-card);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  
  .table-wrapper {
    overflow-x: auto;
  }
  
  // 响应式表格
  .responsive-table {
    min-width: 100%;
    
    :deep(.el-table__header-wrapper) {
      th {
        background: var(--bg-hover);
        color: var(--text-primary);
        font-weight: var(--font-weight-semibold);
      }
    }
    
    :deep(.el-table__row) {
      &:hover > td {
        background: var(--bg-hover);
      }
      
      td {
        padding: var(--spacing-md) var(--spacing-sm);
      }
    }
    
    // 操作按钮样式
    :deep(.cell) {
      .el-button {
        margin-right: var(--spacing-xs);
        padding: var(--spacing-xs) var(--spacing-sm);
        
        &:last-child {
          margin-right: 0;
        }
      }
    }
  }
}

// 统计容器样式
.stats-container {
  .stat-item {
    text-align: center;
    padding: var(--spacing-xl);
    background: var(--bg-hover);
    border-radius: var(--radius-md);
    transition: all var(--transition-fast);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .stat-value {
      font-size: var(--text-2xl);
      font-weight: var(--font-weight-bold);
      color: var(--primary-color);
      margin-bottom: var(--spacing-sm);
    }

    .stat-label {
      font-size: var(--text-base);
      color: var(--text-secondary);
    }
  }
}

// 图片上传容器样式
.image-upload-container {
  .image-preview {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  
  .upload-placeholder {
    width: 100%;
  }
}

// 标签页样式
.content-tabs {
  margin-top: var(--spacing-xl);
  
  :deep(.el-tabs__header) {
    margin-bottom: var(--spacing-lg);
    
    .el-tabs__nav-wrap::after {
      height: 1px;
      background: var(--border-color);
    }
    
    .el-tabs__item {
      font-size: var(--text-base);
      padding: 0 var(--spacing-lg);
      
      &.is-active {
        color: var(--primary-color);
        font-weight: var(--font-weight-semibold);
      }
      
      &:hover {
        color: var(--primary-hover);
      }
    }
    
    .el-tabs__active-bar {
      background: var(--primary-color);
      height: 2px;
    }
  }
  
  :deep(.el-tabs__content) {
    padding: 0 var(--spacing-xs);
  }
}

// 对话框样式
.el-dialog {
  :deep(.el-dialog__header) {
    padding: var(--spacing-lg);
    border-bottom: 1px solid var(--border-color);
    
    .el-dialog__title {
      font-size: var(--text-lg);
      font-weight: var(--font-weight-semibold);
    }
  }
  
  :deep(.el-dialog__body) {
    padding: var(--spacing-lg);
    max-height: 60vh;
    overflow-y: auto;
  }
  
  :deep(.el-dialog__footer) {
    padding: var(--spacing-md) var(--spacing-lg);
    border-top: 1px solid var(--border-color);
  }
}

// 表单样式
.el-form {
  :deep(.el-form-item) {
    margin-bottom: var(--spacing-lg);
    
    .el-form-item__label {
      font-weight: var(--font-weight-medium);
    }
  }
}

// 响应式适配
@media (max-width: var(--breakpoint-md)) {
  .table-toolbar {
    flex-direction: column;
    align-items: stretch;
    
    .el-button {
      width: 100%;
      margin-bottom: var(--spacing-sm);
    }
    
    .el-select {
      width: 100%;
    }
  }
  
  .table-container {
    padding: var(--spacing-md);
  }
  
  .stats-container {
    .stat-item {
      padding: var(--spacing-md);
      
      .stat-value {
        font-size: var(--text-xl);
      }
    }
  }
}
</style>

