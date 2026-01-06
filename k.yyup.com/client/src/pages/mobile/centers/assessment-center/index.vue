<template>
  <MobileMainLayout
    title="评估中心"
    :show-back="true"
    :show-footer="true"
    content-padding="var(--app-gap)"
  >
    <!-- 头部操作按钮 -->
    <template #header-extra>
      <van-button
        type="primary"
        size="small"
        plain
        @click="handleCreateConfig"
      >
        新建配置
      </van-button>
    </template>

    <!-- 统计概览 -->
    <div class="stats-overview">
      <div class="stats-grid">
        <div class="stat-card primary">
          <div class="stat-icon">
            <van-icon name="setting-o" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.configCount }}</div>
            <div class="stat-label">测评配置数</div>
          </div>
        </div>
        <div class="stat-card success">
          <div class="stat-icon">
            <van-icon name="description" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.questionCount }}</div>
            <div class="stat-label">题目总数</div>
          </div>
        </div>
        <div class="stat-card info">
          <div class="stat-icon">
            <van-icon name="passed" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.completedCount }}</div>
            <div class="stat-label">完成测评数</div>
          </div>
        </div>
        <div class="stat-card warning">
          <div class="stat-icon">
            <van-icon name="fire-o" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.physicalItemCount }}</div>
            <div class="stat-label">体能项目数</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 功能标签页 -->
    <van-tabs v-model:active="activeTab" sticky :offset-top="46">
      <!-- 测评配置 -->
      <van-tab title="测评配置" name="configs">
        <div class="tab-content">
          <div class="tab-header">
            <span class="tab-title">配置管理</span>
            <van-button
              type="primary"
              size="small"
              @click="handleCreateConfig"
            >
              <van-icon name="plus" />
              新建配置
            </van-button>
          </div>

          <van-list
            v-model:loading="configsLoading"
            :finished="configsFinished"
            finished-text="没有更多了"
            @load="loadConfigs"
          >
            <div
              v-for="config in configs"
              :key="config.id"
              class="config-item"
            >
              <van-cell-group inset>
                <van-cell :title="config.name" :label="`ID: ${config.id}`">
                  <template #right-icon>
                    <van-tag
                      :type="config.status === 'active' ? 'success' : 'default'"
                      size="small"
                    >
                      {{ config.status === 'active' ? '启用' : '停用' }}
                    </van-tag>
                  </template>
                </van-cell>
                <van-cell title="适用年龄" :value="`${config.minAge}-${config.maxAge}个月`" />
                <van-cell title="描述" :value="config.description || '无描述'" />
                <van-cell>
                  <template #title>
                    <div class="action-buttons">
                      <van-button
                        size="small"
                        type="primary"
                        plain
                        @click="handleEditConfig(config)"
                      >
                        编辑
                      </van-button>
                      <van-button
                        size="small"
                        type="danger"
                        plain
                        @click="handleDeleteConfig(config)"
                      >
                        删除
                      </van-button>
                    </div>
                  </template>
                </van-cell>
              </van-cell-group>
            </div>
          </van-list>
        </div>
      </van-tab>

      <!-- 题目管理 -->
      <van-tab title="题目管理" name="questions">
        <div class="tab-content">
          <!-- 筛选工具栏 -->
          <div class="filter-toolbar">
            <van-field
              v-model="questionFilter.dimension"
              label="维度"
              placeholder="选择维度"
              readonly
              is-link
              @click="showDimensionPicker = true"
            />
          </div>

          <div class="tab-header">
            <span class="tab-title">题目列表</span>
            <van-button
              type="primary"
              size="small"
              @click="handleCreateQuestion"
            >
              <van-icon name="plus" />
              新建题目
            </van-button>
          </div>

          <van-list
            v-model:loading="questionsLoading"
            :finished="questionsFinished"
            finished-text="没有更多了"
            @load="loadQuestions"
          >
            <div
              v-for="question in questions"
              :key="question.id"
              class="question-item"
            >
              <van-cell-group inset>
                <van-cell :title="question.title" :label="`ID: ${question.id}`">
                  <template #icon>
                    <div class="question-image">
                      <van-image
                        v-if="question.imageUrl"
                        :src="question.imageUrl"
                        width="40"
                        height="40"
                        radius="4"
                        fit="cover"
                      />
                      <div v-else class="no-image">
                        <van-icon name="photo-o" />
                      </div>
                    </div>
                  </template>
                  <template #right-icon>
                    <van-tag
                      :type="question.status === 'active' ? 'success' : 'default'"
                      size="small"
                    >
                      {{ question.status === 'active' ? '启用' : '停用' }}
                    </van-tag>
                  </template>
                </van-cell>
                <van-cell title="维度" :value="getDimensionName(question.dimension)" />
                <van-cell title="年龄段" :value="question.ageGroup" />
                <van-cell title="类型" :value="getQuestionTypeName(question.questionType)" />
                <van-cell title="分值" :value="`${question.score}分`" />
                <van-cell>
                  <template #title>
                    <div class="action-buttons">
                      <van-button
                        size="small"
                        type="primary"
                        plain
                        @click="handleEditQuestion(question)"
                      >
                        编辑
                      </van-button>
                      <van-button
                        size="small"
                        type="danger"
                        plain
                        @click="handleDeleteQuestion(question)"
                      >
                        删除
                      </van-button>
                    </div>
                  </template>
                </van-cell>
              </van-cell-group>
            </div>
          </van-list>
        </div>
      </van-tab>

      <!-- 体能训练项目 -->
      <van-tab title="体能训练" name="physical">
        <div class="tab-content">
          <div class="tab-header">
            <span class="tab-title">体能项目</span>
            <van-button
              type="primary"
              size="small"
              @click="handleCreatePhysicalItem"
            >
              <van-icon name="plus" />
              新建项目
            </van-button>
          </div>

          <van-list
            v-model:loading="physicalItemsLoading"
            :finished="physicalItemsFinished"
            finished-text="没有更多了"
            @load="loadPhysicalItems"
          >
            <div
              v-for="item in physicalItems"
              :key="item.id"
              class="physical-item"
            >
              <van-cell-group inset>
                <van-cell :title="item.name" :label="`ID: ${item.id}`">
                  <template #right-icon>
                    <van-tag
                      :type="item.status === 'active' ? 'success' : 'default'"
                      size="small"
                    >
                      {{ item.status === 'active' ? '启用' : '停用' }}
                    </van-tag>
                  </template>
                </van-cell>
                <van-cell title="分类" :value="getCategoryName(item.category)" />
                <van-cell title="适用年龄" :value="`${item.minAge}-${item.maxAge}个月`" />
                <van-cell>
                  <template #title>
                    <div class="action-buttons">
                      <van-button
                        size="small"
                        type="primary"
                        plain
                        @click="handleEditPhysicalItem(item)"
                      >
                        编辑
                      </van-button>
                      <van-button
                        size="small"
                        type="danger"
                        plain
                        @click="handleDeletePhysicalItem(item)"
                      >
                        删除
                      </van-button>
                    </div>
                  </template>
                </van-cell>
              </van-cell-group>
            </div>
          </van-list>
        </div>
      </van-tab>

      <!-- 测评统计 -->
      <van-tab title="测评统计" name="stats">
        <div class="tab-content">
          <div class="stats-cards">
            <van-card>
              <template #title>
                <div class="stat-card-title">测评数据统计</div>
              </template>
              <template #desc>
                <div class="stats-grid-detailed">
                  <div class="stat-item-detailed">
                    <div class="stat-number">{{ stats.totalRecords }}</div>
                    <div class="stat-text">总测评数</div>
                  </div>
                  <div class="stat-item-detailed">
                    <div class="stat-number">{{ stats.completedRecords }}</div>
                    <div class="stat-text">已完成</div>
                  </div>
                  <div class="stat-item-detailed">
                    <div class="stat-number">{{ stats.inProgressRecords }}</div>
                    <div class="stat-text">进行中</div>
                  </div>
                  <div class="stat-item-detailed">
                    <div class="stat-number">{{ stats.completionRate.toFixed(1) }}%</div>
                    <div class="stat-text">完成率</div>
                  </div>
                </div>
              </template>
            </van-card>
          </div>
        </div>
      </van-tab>
    </van-tabs>

    <!-- 维度选择器 -->
    <van-popup v-model:show="showDimensionPicker" position="bottom">
      <van-picker
        :columns="dimensionColumns"
        @confirm="onDimensionConfirm"
        @cancel="showDimensionPicker = false"
      />
    </van-popup>

    <!-- 配置编辑弹窗 -->
    <van-popup
      v-model:show="configDialogVisible"
      position="bottom"
      :style="{ height: '70%' }"
      round
    >
      <div class="dialog-header">
        <van-button
          size="small"
          type="default"
          @click="configDialogVisible = false"
        >
          取消
        </van-button>
        <span class="dialog-title">{{ configDialogTitle }}</span>
        <van-button
          size="small"
          type="primary"
          @click="handleSaveConfig"
        >
          保存
        </van-button>
      </div>

      <div class="dialog-content">
        <van-form>
          <van-field
            v-model="configForm.name"
            name="name"
            label="配置名称"
            placeholder="请输入配置名称"
            required
          />
          <van-field
            v-model="configForm.description"
            name="description"
            label="描述"
            type="textarea"
            placeholder="请输入配置描述"
            rows="3"
          />
          <van-field
            v-model="configForm.minAge"
            name="minAge"
            label="最小年龄"
            type="number"
            placeholder="月"
            required
          />
          <van-field
            v-model="configForm.maxAge"
            name="maxAge"
            label="最大年龄"
            type="number"
            placeholder="月"
            required
          />
          <van-field name="status" label="状态">
            <template #input>
              <van-radio-group v-model="configForm.status" direction="horizontal">
                <van-radio name="active">启用</van-radio>
                <van-radio name="inactive">停用</van-radio>
              </van-radio-group>
            </template>
          </van-field>
        </van-form>
      </div>
    </van-popup>

    <!-- 题目编辑弹窗 -->
    <van-popup
      v-model:show="questionDialogVisible"
      position="bottom"
      :style="{ height: '90%' }"
      round
    >
      <div class="dialog-header">
        <van-button
          size="small"
          type="default"
          @click="questionDialogVisible = false"
        >
          取消
        </van-button>
        <span class="dialog-title">{{ questionDialogTitle }}</span>
        <van-button
          size="small"
          type="primary"
          @click="handleSaveQuestion"
        >
          保存
        </van-button>
      </div>

      <div class="dialog-content scrollable">
        <van-form>
          <van-field
            v-model="questionForm.configId"
            name="configId"
            label="配置"
            placeholder="选择配置"
            readonly
            is-link
            @click="showConfigPicker = true"
            required
          />
          <van-field
            v-model="questionForm.dimension"
            name="dimension"
            label="维度"
            placeholder="选择维度"
            readonly
            is-link
            @click="showQuestionDimensionPicker = true"
            required
          />
          <van-field
            v-model="questionForm.ageGroup"
            name="ageGroup"
            label="年龄段"
            placeholder="如：24-36"
            required
          />
          <van-field
            v-model="questionForm.questionType"
            name="questionType"
            label="题目类型"
            placeholder="选择类型"
            readonly
            is-link
            @click="showQuestionTypePicker = true"
            required
          />
          <van-field
            v-model="questionForm.title"
            name="title"
            label="题目标题"
            placeholder="请输入题目标题"
            required
          />
          <van-field
            v-model="questionForm.content"
            name="content"
            label="题目内容"
            type="textarea"
            placeholder='JSON格式，例如：{"question":"问题","options":[...],"correctAnswer":"..."}'
            rows="4"
            required
          />
          <van-field
            v-model="questionForm.imageUrl"
            name="imageUrl"
            label="题目配图"
            placeholder="图片URL"
          />
          <van-field
            v-if="!questionForm.imageUrl"
            v-model="questionForm.imagePrompt"
            name="imagePrompt"
            label="图片提示词"
            type="textarea"
            placeholder="AI生成图片的详细提示词（可选）"
            rows="2"
          />
          <van-field name="generateImage" label="AI生成配图">
            <template #input>
              <van-button
                size="small"
                type="primary"
                @click="handleGenerateImage"
                :loading="generatingImage"
                block
              >
                <van-icon name="fire-o" />
                AI生成图片
              </van-button>
            </template>
          </van-field>
          <van-field
            v-model="questionForm.score"
            name="score"
            label="分值"
            type="number"
            placeholder="分值"
          />
          <van-field
            v-model="questionForm.sortOrder"
            name="sortOrder"
            label="排序"
            type="number"
            placeholder="排序"
          />
        </van-form>
      </div>
    </van-popup>

    <!-- 配置选择器 -->
    <van-popup v-model:show="showConfigPicker" position="bottom">
      <van-picker
        :columns="configColumns"
        @confirm="onConfigConfirm"
        @cancel="showConfigPicker = false"
      />
    </van-popup>

    <!-- 题目维度选择器 -->
    <van-popup v-model:show="showQuestionDimensionPicker" position="bottom">
      <van-picker
        :columns="questionDimensionColumns"
        @confirm="onQuestionDimensionConfirm"
        @cancel="showQuestionDimensionPicker = false"
      />
    </van-popup>

    <!-- 题目类型选择器 -->
    <van-popup v-model:show="showQuestionTypePicker" position="bottom">
      <van-picker
        :columns="questionTypeColumns"
        @confirm="onQuestionTypeConfirm"
        @cancel="showQuestionTypePicker = false"
      />
    </van-popup>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'
import { assessmentAdminApi } from '@/api/assessment-admin'

// 响应式数据
const activeTab = ref('configs')
const configs = ref<any[]>([])
const questions = ref<any[]>([])
const physicalItems = ref<any[]>([])
const configsLoading = ref(false)
const questionsLoading = ref(false)
const physicalItemsLoading = ref(false)
const configsFinished = ref(false)
const questionsFinished = ref(false)
const physicalItemsFinished = ref(false)

// 统计数据
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

// 筛选条件
const questionFilter = ref({
  dimension: ''
})

// 弹窗控制
const showDimensionPicker = ref(false)
const showConfigPicker = ref(false)
const showQuestionDimensionPicker = ref(false)
const showQuestionTypePicker = ref(false)
const configDialogVisible = ref(false)
const questionDialogVisible = ref(false)
const generatingImage = ref(false)

// 表单数据
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

const questionDialogTitle = ref('新建题目')
const questionForm = ref({
  id: null,
  configId: '',
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

// 选择器选项
const dimensionColumns = [
  { text: '全部', value: '' },
  { text: '专注力', value: 'attention' },
  { text: '记忆力', value: 'memory' },
  { text: '逻辑思维', value: 'logic' },
  { text: '语言能力', value: 'language' },
  { text: '精细动作', value: 'motor' },
  { text: '社交能力', value: 'social' }
]

const configColumns = computed(() =>
  configs.value.map(config => ({
    text: config.name,
    value: config.id
  }))
)

const questionDimensionColumns = [
  { text: '专注力', value: 'attention' },
  { text: '记忆力', value: 'memory' },
  { text: '逻辑思维', value: 'logic' },
  { text: '语言能力', value: 'language' },
  { text: '精细动作', value: 'motor' },
  { text: '社交能力', value: 'social' }
]

const questionTypeColumns = [
  { text: '问答', value: 'qa' },
  { text: '游戏', value: 'game' },
  { text: '互动', value: 'interactive' }
]

// 工具方法
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

const getQuestionTypeName = (type: string): string => {
  const map: Record<string, string> = {
    qa: '问答',
    game: '游戏',
    interactive: '互动'
  }
  return map[type] || type
}

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

// API调用方法
const loadConfigs = async () => {
  try {
    configsLoading.value = true
    const response = await assessmentAdminApi.getConfigs()
    if (response.data?.success) {
      configs.value = response.data.data.items || []
      stats.value.configCount = response.data.data.total || 0
      configsFinished.value = true
    }
  } catch (error: any) {
    showToast('加载配置失败')
  } finally {
    configsLoading.value = false
  }
}

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
      questionsFinished.value = true
    }
  } catch (error: any) {
    showToast('加载题目失败')
  } finally {
    questionsLoading.value = false
  }
}

const loadPhysicalItems = async () => {
  try {
    physicalItemsLoading.value = true
    const response = await assessmentAdminApi.getPhysicalItems()
    if (response.data?.success) {
      physicalItems.value = response.data.data.items || []
      stats.value.physicalItemCount = response.data.data.total || 0
      physicalItemsFinished.value = true
    }
  } catch (error: any) {
    showToast('加载项目失败')
  } finally {
    physicalItemsLoading.value = false
  }
}

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

// 事件处理方法
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

const handleEditConfig = (row: any) => {
  configForm.value = { ...row }
  configDialogTitle.value = '编辑配置'
  configDialogVisible.value = true
}

const handleSaveConfig = async () => {
  try {
    if (configForm.value.id) {
      await assessmentAdminApi.updateConfig(configForm.value.id, configForm.value)
      showToast('更新成功')
    } else {
      await assessmentAdminApi.createConfig(configForm.value)
      showToast('创建成功')
    }
    configDialogVisible.value = false
    loadConfigs()
  } catch (error: any) {
    showToast('保存失败')
  }
}

const handleDeleteConfig = async (row: any) => {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '确定要删除该配置吗？'
    })
    await assessmentAdminApi.deleteConfig(row.id)
    showToast('删除成功')
    loadConfigs()
  } catch (error: any) {
    if (error !== 'cancel') {
      showToast('删除失败')
    }
  }
}

const handleCreateQuestion = () => {
  questionForm.value = {
    id: null,
    configId: configs.value[0]?.id || '',
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

const handleEditQuestion = (row: any) => {
  questionForm.value = { ...row }
  if (typeof questionForm.value.content === 'object') {
    questionForm.value.content = JSON.stringify(questionForm.value.content)
  }
  questionDialogTitle.value = '编辑题目'
  questionDialogVisible.value = true
}

const handleSaveQuestion = async () => {
  try {
    if (questionForm.value.id) {
      await assessmentAdminApi.updateQuestion(questionForm.value.id, questionForm.value)
      showToast('更新成功')
    } else {
      await assessmentAdminApi.createQuestion(questionForm.value)
      showToast('创建成功')
    }
    questionDialogVisible.value = false
    loadQuestions()
  } catch (error: any) {
    showToast('保存失败')
  }
}

const handleDeleteQuestion = async (row: any) => {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '确定要删除该题目吗？'
    })
    await assessmentAdminApi.deleteQuestion(row.id)
    showToast('删除成功')
    loadQuestions()
  } catch (error: any) {
    if (error !== 'cancel') {
      showToast('删除失败')
    }
  }
}

const handleCreatePhysicalItem = () => {
  showToast('体能项目创建功能开发中')
}

const handleEditPhysicalItem = (row: any) => {
  showToast('体能项目编辑功能开发中')
}

const handleDeletePhysicalItem = async (row: any) => {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '确定要删除该项目吗？'
    })
    await assessmentAdminApi.deletePhysicalItem(row.id)
    showToast('删除成功')
    loadPhysicalItems()
  } catch (error: any) {
    if (error !== 'cancel') {
      showToast('删除失败')
    }
  }
}

const handleGenerateImage = async () => {
  try {
    generatingImage.value = true

    let prompt = questionForm.value.imagePrompt
    if (!prompt) {
      prompt = generateImagePrompt()
    }

    showToast('正在生成图片，请稍候...')

    const response = await assessmentAdminApi.generateImage({
      prompt,
      questionId: questionForm.value.id
    })

    if (response.data?.success && response.data.data.imageUrl) {
      questionForm.value.imageUrl = response.data.data.imageUrl
      questionForm.value.imagePrompt = prompt
      showToast({
        message: `图片生成成功！模型: ${response.data.data.modelUsed || '豆包文生图'}`,
        duration: 3000
      })
    } else {
      showToast(response.data?.message || '图片生成失败')
    }
  } catch (error: any) {
    showToast('图片生成失败：' + error.message)
  } finally {
    generatingImage.value = false
  }
}

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

// 选择器确认事件
const onDimensionConfirm = ({ selectedValues }: any) => {
  questionFilter.value.dimension = selectedValues[0]
  showDimensionPicker.value = false
  loadQuestions()
}

const onConfigConfirm = ({ selectedValues }: any) => {
  questionForm.value.configId = selectedValues[0]
  showConfigPicker.value = false
}

const onQuestionDimensionConfirm = ({ selectedValues }: any) => {
  questionForm.value.dimension = selectedValues[0]
  showQuestionDimensionPicker.value = false
}

const onQuestionTypeConfirm = ({ selectedValues }: any) => {
  questionForm.value.questionType = selectedValues[0]
  showQuestionTypePicker.value = false
}

// 生命周期
onMounted(() => {
  loadConfigs()
  loadQuestions()
  loadPhysicalItems()
  loadStats()
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';
.stats-overview {
  background: var(--card-bg);
  margin-bottom: 8px;
  padding: var(--spacing-md);

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);

    .stat-card {
      display: flex;
      align-items: center;
      padding: var(--spacing-md);
      border-radius: 12px;
      color: white;

      &.primary {
        background: var(--primary-gradient);
      }

      &.success {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }

      &.info {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      }

      &.warning {
        background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
      }

      .stat-icon {
        margin-right: 12px;
        font-size: var(--text-2xl);
      }

      .stat-info {
        flex: 1;

        .stat-value {
          font-size: var(--text-2xl);
          font-weight: bold;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: var(--text-xs);
          opacity: 0.9;
        }
      }
    }
  }
}

.tab-content {
  min-height: 60vh;
  background: #f7f8fa;

  .tab-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md) 16px;
    background: var(--card-bg);
    border-bottom: 1px solid #ebedf0;

    .tab-title {
      font-size: var(--text-base);
      font-weight: 600;
      color: #323233;
    }
  }

  .filter-toolbar {
    background: var(--card-bg);
    padding: var(--spacing-md) 16px;
    border-bottom: 1px solid #ebedf0;
  }

  .config-item,
  .question-item,
  .physical-item {
    margin-bottom: 12px;

    .question-image {
      margin-right: 12px;

      .no-image {
        width: 40px;
        height: 40px;
        background: #f5f5f5;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #999;
      }
    }

    .action-buttons {
      display: flex;
      gap: var(--spacing-sm);
      justify-content: flex-end;
    }
  }
}

.stats-cards {
  padding: var(--spacing-md);

  .stat-card-title {
    font-size: var(--text-base);
    font-weight: 600;
    text-align: center;
    margin-bottom: 16px;
  }

  .stats-grid-detailed {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);

    .stat-item-detailed {
      text-align: center;
      padding: var(--spacing-md);
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      border-radius: 8px;

      .stat-number {
        font-size: var(--text-2xl);
        font-weight: bold;
        color: var(--primary-color);
        margin-bottom: 8px;
      }

      .stat-text {
        font-size: var(--text-sm);
        color: #666;
      }
    }
  }
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid #ebedf0;

  .dialog-title {
    font-size: var(--text-base);
    font-weight: 600;
    color: #323233;
  }
}

.dialog-content {
  padding: var(--spacing-md);
  max-height: calc(100% - 60px);
  overflow-y: auto;

  &.scrollable {
    overflow-y: auto;
  }
}

:deep(.van-tabs__line) {
  background-color: var(--primary-color);
}

:deep(.van-tab--active) {
  color: var(--primary-color);
}
</style>