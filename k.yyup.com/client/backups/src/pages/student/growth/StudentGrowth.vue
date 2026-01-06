<template>
  <div class="page-container">
    <page-header :title="`${studentGrowth.studentName || '学生'} 的成长记录`">
      <template #actions>
        <el-button @click="addGrowthRecord" type="primary">
          <el-icon><Plus /></el-icon>
          添加记录
        </el-button>
        <el-button @click="exportGrowthReport" :loading="exporting">
          <el-icon><Download /></el-icon>
          导出报告
        </el-button>
        <el-button @click="refreshData" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </template>
    </page-header>

    <div class="student-growth" v-loading="loading" element-loading-text="正在加载成长数据...">
      <div class="growth-content">
        <div class="content-grid">
        <!-- 成长概览 -->
        <div class="growth-overview">
          <h2>成长概览</h2>
          <div class="overview-stats">
            <div class="stat-card">
              <div class="stat-icon">📈</div>
              <div class="stat-content">
                <h3>总记录数</h3>
                <div class="stat-value">{{ studentGrowth.totalRecords }}</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">🎯</div>
              <div class="stat-content">
                <h3>达成目标</h3>
                <div class="stat-value">{{ studentGrowth.achievedGoals }}</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">⭐</div>
              <div class="stat-content">
                <h3>获得奖励</h3>
                <div class="stat-value">{{ studentGrowth.totalRewards }}</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">📅</div>
              <div class="stat-content">
                <h3>记录天数</h3>
                <div class="stat-value">{{ studentGrowth.recordDays }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 成长时间线 -->
        <div class="growth-timeline">
          <h2>成长时间线</h2>
          <div class="timeline-container">
            <div 
              v-for="record in studentGrowth.growthRecords" 
              :key="record.id" 
              class="timeline-item"
            >
              <div class="timeline-date">
                <div class="date-circle"></div>
                <span>{{ formatDate(record.date) }}</span>
              </div>
              <div class="timeline-content">
                <div class="record-header">
                  <h3>{{ record.title }}</h3>
                  <div class="record-category">{{ record.category }}</div>
                </div>
                <p class="record-description">{{ record.description }}</p>
                <div class="record-details">
                  <div class="record-tags">
                    <span 
                      v-for="tag in record.tags" 
                      :key="tag" 
                      class="tag"
                    >
                      {{ tag }}
                    </span>
                  </div>
                  <div class="record-score" v-if="record.score">
                    评分: {{ record.score }}/10
                  </div>
                </div>
                <div class="record-media" v-if="record.images">
                  <img 
                    v-for="image in record.images" 
                    :key="image" 
                    :src="image" 
                    :alt="record.title"
                    class="record-image"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 能力发展图表 -->
        <div class="ability-development">
          <h2>能力发展趋势</h2>
          <div class="chart-container">
            <div class="chart-placeholder">
              <p>📊 能力发展趋势图表</p>
              <p>显示各项能力随时间的发展变化</p>
            </div>
          </div>
          
          <div class="ability-summary">
            <div class="ability-item">
              <span class="ability-name">语言表达</span>
              <div class="ability-progress">
                <div class="progress-bar">
                  <div class="progress" :style="{ width: studentGrowth.abilities.language + '%' }"></div>
                </div>
                <span class="ability-value">{{ studentGrowth.abilities.language }}%</span>
              </div>
            </div>
            
            <div class="ability-item">
              <span class="ability-name">数学思维</span>
              <div class="ability-progress">
                <div class="progress-bar">
                  <div class="progress" :style="{ width: studentGrowth.abilities.math + '%' }"></div>
                </div>
                <span class="ability-value">{{ studentGrowth.abilities.math }}%</span>
              </div>
            </div>
            
            <div class="ability-item">
              <span class="ability-name">艺术创作</span>
              <div class="ability-progress">
                <div class="progress-bar">
                  <div class="progress" :style="{ width: studentGrowth.abilities.art + '%' }"></div>
                </div>
                <span class="ability-value">{{ studentGrowth.abilities.art }}%</span>
              </div>
            </div>
            
            <div class="ability-item">
              <span class="ability-name">社交能力</span>
              <div class="ability-progress">
                <div class="progress-bar">
                  <div class="progress" :style="{ width: studentGrowth.abilities.social + '%' }"></div>
                </div>
                <span class="ability-value">{{ studentGrowth.abilities.social }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 成长目标 -->
        <div class="growth-goals">
          <h2>成长目标</h2>
          <div class="goals-list">
            <div 
              v-for="goal in studentGrowth.growthGoals" 
              :key="goal.id" 
              :class="['goal-item', goal.status]"
            >
              <div class="goal-header">
                <h3>{{ goal.title }}</h3>
                <div class="goal-status">{{ getGoalStatusText(goal.status) }}</div>
              </div>
              <p class="goal-description">{{ goal.description }}</p>
              <div class="goal-progress">
                <div class="progress-bar">
                  <div class="progress" :style="{ width: goal.progress + '%' }"></div>
                </div>
                <span class="progress-text">{{ goal.progress }}%</span>
              </div>
              <div class="goal-deadline">
                目标日期: {{ formatDate(goal.deadline) }}
              </div>
            </div>
          </div>
        </div>

        <!-- 家长评价 -->
        <div class="parent-feedback">
          <h2>家长评价</h2>
          <div class="feedback-list">
            <div 
              v-for="feedback in studentGrowth.parentFeedbacks" 
              :key="feedback.id" 
              class="feedback-item"
            >
              <div class="feedback-header">
                <div class="parent-info">
                  <img :src="feedback.parentAvatar" :alt="feedback.parentName" class="parent-avatar" />
                  <div class="parent-details">
                    <h3>{{ feedback.parentName }}</h3>
                    <span class="feedback-date">{{ formatDate(feedback.date) }}</span>
                  </div>
                </div>
                <div class="feedback-rating">
                  <span v-for="i in 5" :key="i" :class="['star', i <= feedback.rating ? 'filled' : '']">
                    ⭐
                  </span>
                </div>
              </div>
              <p class="feedback-content">{{ feedback.content }}</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Download, Refresh } from '@element-plus/icons-vue'
import { get, post } from '@/utils/request'
import { STUDENT_ENDPOINTS } from '@/api/endpoints'
import { ErrorHandler } from '@/utils/errorHandler'
import PageHeader from '@/components/common/PageHeader.vue'

// 接口定义
interface GrowthRecord {
  id: string
  date: string
  title: string
  category: string
  description: string
  tags: string[]
  score?: number
  images?: string[]
}

interface GrowthGoal {
  id: string
  title: string
  description: string
  progress: number
  status: 'completed' | 'in-progress' | 'pending'
  deadline: string
}

interface ParentFeedback {
  id: string
  parentName: string
  parentAvatar: string
  date: string
  rating: number
  content: string
}

interface StudentGrowthData {
  studentId: string
  studentName: string
  totalRecords: number
  achievedGoals: number
  totalRewards: number
  recordDays: number
  abilities: {
    language: number
    math: number
    art: number
    social: number
  }
  growthRecords: GrowthRecord[]
  growthGoals: GrowthGoal[]
  parentFeedbacks: ParentFeedback[]
}

// 路由
const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(false)
const exporting = ref(false)
const studentId = route.params.id as string

const studentGrowth = ref<StudentGrowthData>({
  studentId: '',
  studentName: '',
  totalRecords: 0,
  achievedGoals: 0,
  totalRewards: 0,
  recordDays: 0,
  abilities: {
    language: 0,
    math: 0,
    art: 0,
    social: 0
  },
  growthRecords: [],
  growthGoals: [],
  parentFeedbacks: []
})


// 方法
const loadGrowthData = async () => {
  if (!studentId) {
    ElMessage.error('学生ID不能为空')
    router.back()
    return
  }

  loading.value = true
  try {
    const response = await get(STUDENT_ENDPOINTS.GROWTH_RECORDS(studentId))
    
    if (response.success && response.data) {
      studentGrowth.value = response.data
    } else {
      const errorInfo = ErrorHandler.handle(new Error(response.message || '获取学生成长数据失败'), true)
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, true)
    router.back()
  } finally {
    loading.value = false
  }
}

const refreshData = async () => {
  await loadGrowthData()
  ElMessage.success('数据刷新成功')
}

const addGrowthRecord = () => {
  ElMessage.info('跳转到添加成长记录页面')
  // TODO: 跳转到添加记录页面
}

const exportGrowthReport = async () => {
  exporting.value = true
  try {
    const response = await post(STUDENT_ENDPOINTS.EXPORT_GROWTH_REPORT(studentId), {
      includeImages: true,
      format: 'pdf'
    })
    
    if (response.success) {
      ElMessage.success('成长报告导出成功')
      // TODO: 处理文件下载
    } else {
      const errorInfo = ErrorHandler.handle(new Error(response.message || '导出失败'), true)
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, true)
  } finally {
    exporting.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getGoalStatusText = (status: string) => {
  const statusMap = {
    'completed': '已完成',
    'in-progress': '进行中',
    'pending': '待开始'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

// 生命周期
onMounted(() => {
  loadGrowthData()
})
</script>

<style lang="scss" scoped>
@import '@/styles/index.scss';

.student-growth {
  padding: var(--spacing-lg);
}

.content-grid {
  display: grid;
  gap: var(--spacing-xl);
  max-width: 1200px;
  margin: 0 auto;
}

.growth-overview,
.growth-timeline,
.ability-development,
.growth-goals,
.parent-feedback {
  background: var(--bg-card);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
}

.growth-overview h2,
.growth-timeline h2,
.ability-development h2,
.growth-goals h2,
.parent-feedback h2 {
  font-size: var(--text-xl);
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
  font-weight: 600;
}

.overview-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: var(--border-width-base) solid var(--border-color);
  transition: all var(--transition-fast);

  &:hover {
    background: var(--bg-hover);
    border-color: var(--primary-color);
  }
}

.stat-icon {
  font-size: var(--text-3xl);
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-sm);
}

.stat-content h3 {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--text-primary);
}

.timeline-container {
  position: relative;
  padding-left: var(--spacing-8xl);
}

.timeline-container::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e8e8e8;
}

.timeline-item {
  position: relative;
  margin-bottom: var(--spacing-3xl);
}

.timeline-date {
  display: flex;
  align-items: center;
  gap: var(--text-xs);
  margin-bottom: var(--text-sm);
}

.date-circle {
  position: absolute;
  left: -23px;
  width: var(--text-sm);
  height: var(--text-sm);
  background: var(--primary-color);
  border-radius: var(--radius-full);
  border: 3px solid white;
  box-shadow: 0 0 0 2px #e8e8e8;
}

.timeline-date span {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin-left: var(--text-2xl);
}

.timeline-content {
  background: var(--bg-tertiary);
  padding: var(--text-base);
  border-radius: var(--radius-md);
  border-left: var(--spacing-xs) solid var(--primary-color);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.record-header h3 {
  font-size: var(--text-base);
  color: var(--text-primary);
  margin: 0;
}

.record-category {
  padding: var(--spacing-sm) var(--spacing-sm);
  background: #e6f7ff;
  color: var(--primary-color);
  border-radius: var(--text-xs);
  font-size: var(--text-xs);
}

.record-description {
  color: var(--text-secondary);
  margin-bottom: var(--text-sm);
  line-height: 1.5;
}

.record-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-sm);
}

.record-tags {
  display: flex;
  gap: var(--spacing-sm);
}

.tag {
  padding: var(--spacing-sm) var(--spacing-sm);
  background: var(--bg-gray-light);
  color: var(--text-secondary);
  border-radius: var(--text-xs);
  font-size: var(--text-xs);
}

.record-score {
  font-size: var(--text-xs);
  color: var(--success-color);
  font-weight: 500;
}

.record-media {
  display: flex;
  gap: var(--spacing-sm);
}

.record-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: var(--spacing-xs);
  border: var(--border-width-base) solid #e8e8e8;
}

.chart-container {
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border-radius: var(--spacing-xs);
  border: 2px dashed var(--border-base);
  margin-bottom: var(--text-2xl);
}

.chart-placeholder {
  text-align: center;
  color: var(--text-tertiary);
}

.ability-summary {
  display: grid;
  gap: var(--text-base);
}

.ability-item {
  display: grid;
  grid-template-columns: 100px 1fr 60px;
  align-items: center;
  gap: var(--text-base);
}

.ability-name {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.ability-progress {
  display: flex;
  align-items: center;
  gap: var(--text-xs);
}

.progress-bar {
  flex: 1;
  height: var(--spacing-sm);
  background: var(--bg-gray-light);
  border-radius: var(--spacing-xs);
  overflow: hidden;
}

.progress {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--success-color));
  transition: width 0.3s ease;
}

.ability-value {
  font-size: var(--text-sm);
  font-weight: bold;
  color: var(--text-primary);
}

.goals-list {
  display: grid;
  gap: var(--text-base);
}

.goal-item {
  padding: var(--text-base);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  border-left: var(--spacing-xs) solid var(--primary-color);
}

.goal-item.completed {
  border-left-color: var(--success-color);
}

.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.goal-header h3 {
  font-size: var(--text-base);
  color: var(--text-primary);
  margin: 0;
}

.goal-status {
  padding: var(--spacing-sm) var(--spacing-sm);
  border-radius: var(--text-xs);
  font-size: var(--text-xs);
}

.goal-item .goal-status {
  background: #e6f7ff;
  color: var(--primary-color);
}

.goal-item.completed .goal-status {
  background: #f6ffed;
  color: var(--success-color);
}

.goal-description {
  color: var(--text-secondary);
  margin-bottom: var(--text-sm);
}

.goal-progress {
  display: flex;
  align-items: center;
  gap: var(--text-xs);
  margin-bottom: var(--spacing-sm);
}

.progress-text {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.goal-deadline {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.feedback-list {
  display: grid;
  gap: var(--text-base);
}

.feedback-item {
  padding: var(--text-base);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  border: var(--border-width-base) solid #e8e8e8;
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-sm);
}

.parent-info {
  display: flex;
  align-items: center;
  gap: var(--text-xs);
}

.parent-avatar {
  width: var(--icon-size); height: var(--icon-size);
  border-radius: var(--radius-full);
  object-fit: cover;
}

.parent-details h3 {
  font-size: var(--text-sm);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.feedback-date {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.feedback-rating {
  display: flex;
  gap: var(--spacing-sm);
}

.star {
  font-size: var(--text-base);
  filter: grayscale(100%);
}

.star.filled {
  filter: none;
}

.feedback-content {
  color: var(--text-secondary);
  line-height: 1.5;
}

/* Element Plus 组件样式覆盖 */
:deep(.el-button) {
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

:deep(.el-card__header) {
  background-color: var(--bg-secondary);
  border-bottom-color: var(--border-color);
}

:deep(.el-loading-mask) {
  background-color: var(--bg-card-overlay);
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .student-growth {
    padding: var(--spacing-md);
  }
  
  .content-grid {
    gap: var(--spacing-md);
  }
  
  .overview-stats {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: var(--spacing-md);
  }
  
  .stat-card {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-sm);
  }
  
  .timeline-container {
    padding-left: var(--spacing-lg);
  }
  
  .ability-item {
    grid-template-columns: 80px 1fr 50px;
    gap: var(--spacing-sm);
  }
}
</style>
