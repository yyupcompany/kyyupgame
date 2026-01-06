<template>
  <div class="page-container">
    <page-header :title="`${studentAnalytics.studentName || '学生'} 的学习数据分析`">
      <template #actions>
        <el-button @click="exportAnalytics" :loading="exporting">
          <el-icon><Download /></el-icon>
          导出分析报告
        </el-button>
        <el-button @click="refreshData" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </template>
    </page-header>

    <div class="student-analytics" v-loading="loading" element-loading-text="正在加载分析数据...">

    <div class="analytics-grid">
      <!-- 学习表现概览 -->
      <div class="performance-overview">
        <h2>学习表现概览</h2>
        <div class="overview-cards">
          <div class="overview-card">
            <div class="card-icon">📚</div>
            <div class="card-content">
              <h3>综合评分</h3>
              <div class="card-value">{{ studentAnalytics.overallScore }}</div>
              <div class="card-trend positive">+5.2%</div>
            </div>
          </div>
          
          <div class="overview-card">
            <div class="card-icon">🎯</div>
            <div class="card-content">
              <h3>学习目标完成率</h3>
              <div class="card-value">{{ studentAnalytics.goalCompletion }}%</div>
              <div class="card-trend positive">+8.1%</div>
            </div>
          </div>
          
          <div class="overview-card">
            <div class="card-icon">⏱️</div>
            <div class="card-content">
              <h3>专注时长</h3>
              <div class="card-value">{{ studentAnalytics.focusTime }}分钟</div>
              <div class="card-trend neutral">持平</div>
            </div>
          </div>
          
          <div class="overview-card">
            <div class="card-icon">🏆</div>
            <div class="card-content">
              <h3>排名</h3>
              <div class="card-value">第{{ studentAnalytics.ranking }}名</div>
              <div class="card-trend positive">↑2</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 能力雷达图 -->
      <div class="ability-radar">
        <h2>能力分析</h2>
        <div class="radar-chart">
          <div class="chart-placeholder">
            <p>🕸️ 能力雷达图</p>
            <p>显示各项能力发展水平</p>
          </div>
        </div>
        <div class="ability-scores">
          <div class="ability-item">
            <span class="ability-name">语言表达</span>
            <div class="ability-bar">
              <div class="ability-progress" :style="{ width: studentAnalytics.abilities.language + '%' }"></div>
            </div>
            <span class="ability-score">{{ studentAnalytics.abilities.language }}</span>
          </div>
          
          <div class="ability-item">
            <span class="ability-name">数学思维</span>
            <div class="ability-bar">
              <div class="ability-progress" :style="{ width: studentAnalytics.abilities.math + '%' }"></div>
            </div>
            <span class="ability-score">{{ studentAnalytics.abilities.math }}</span>
          </div>
          
          <div class="ability-item">
            <span class="ability-name">艺术创作</span>
            <div class="ability-bar">
              <div class="ability-progress" :style="{ width: studentAnalytics.abilities.art + '%' }"></div>
            </div>
            <span class="ability-score">{{ studentAnalytics.abilities.art }}</span>
          </div>
          
          <div class="ability-item">
            <span class="ability-name">体能发展</span>
            <div class="ability-bar">
              <div class="ability-progress" :style="{ width: studentAnalytics.abilities.physical + '%' }"></div>
            </div>
            <span class="ability-score">{{ studentAnalytics.abilities.physical }}</span>
          </div>
          
          <div class="ability-item">
            <span class="ability-name">社交能力</span>
            <div class="ability-bar">
              <div class="ability-progress" :style="{ width: studentAnalytics.abilities.social + '%' }"></div>
            </div>
            <span class="ability-score">{{ studentAnalytics.abilities.social }}</span>
          </div>
        </div>
      </div>

      <!-- 学习趋势 -->
      <div class="learning-trends">
        <h2>学习趋势</h2>
        <div class="trend-chart">
          <div class="chart-placeholder">
            <p>📈 学习趋势图表</p>
            <p>显示过去30天的学习表现变化</p>
          </div>
        </div>
      </div>

      <!-- 强项与弱项分析 -->
      <div class="strengths-weaknesses">
        <h2>强项与弱项分析</h2>
        <div class="analysis-grid">
          <div class="strengths-section">
            <h3>优势领域</h3>
            <div class="strength-list">
              <div class="strength-item">
                <div class="strength-icon">🎨</div>
                <div class="strength-content">
                  <h4>艺术创作</h4>
                  <p>在绘画和手工制作方面表现突出</p>
                  <div class="strength-score">92分</div>
                </div>
              </div>
              
              <div class="strength-item">
                <div class="strength-icon">🗣️</div>
                <div class="strength-content">
                  <h4>语言表达</h4>
                  <p>词汇量丰富，表达清晰流畅</p>
                  <div class="strength-score">88分</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="weaknesses-section">
            <h3>待提升领域</h3>
            <div class="weakness-list">
              <div class="weakness-item">
                <div class="weakness-icon">🔢</div>
                <div class="weakness-content">
                  <h4>数学思维</h4>
                  <p>逻辑推理能力需要加强</p>
                  <div class="weakness-score">72分</div>
                </div>
              </div>
              
              <div class="weakness-item">
                <div class="weakness-icon">🏃</div>
                <div class="weakness-content">
                  <h4>体能发展</h4>
                  <p>大肌肉群协调性有待提高</p>
                  <div class="weakness-score">75分</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 学习建议 -->
      <div class="learning-suggestions">
        <h2>个性化学习建议</h2>
        <div class="suggestions-list">
          <div class="suggestion-item">
            <div class="suggestion-priority high">高优先级</div>
            <div class="suggestion-content">
              <h3>数学思维训练</h3>
              <p>建议增加逻辑游戏和数学启蒙活动，通过趣味性的方式提升数学思维能力</p>
              <div class="suggestion-actions">
                <button class="btn btn-primary">查看详细计划</button>
              </div>
            </div>
          </div>
          
          <div class="suggestion-item">
            <div class="suggestion-priority medium">中优先级</div>
            <div class="suggestion-content">
              <h3>体能锻炼计划</h3>
              <p>安排更多户外活动和体感游戏，提升大肌肉群的协调性和力量</p>
              <div class="suggestion-actions">
                <button class="btn btn-primary">查看详细计划</button>
              </div>
            </div>
          </div>
          
          <div class="suggestion-item">
            <div class="suggestion-priority low">低优先级</div>
            <div class="suggestion-content">
              <h3>艺术天赋培养</h3>
              <p>继续发挥艺术创作优势，可以考虑参加更高级的艺术活动</p>
              <div class="suggestion-actions">
                <button class="btn btn-primary">查看详细计划</button>
              </div>
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
import { ElMessage } from 'element-plus'
import { Download, Refresh } from '@element-plus/icons-vue'
import { get, post } from '@/utils/request'
import { STUDENT_ENDPOINTS } from '@/api/endpoints'
import { ErrorHandler } from '@/utils/errorHandler'
import PageHeader from '@/components/common/PageHeader.vue'

// 接口定义
interface StudentAnalyticsData {
  studentId: string
  studentName: string
  overallScore: number
  goalCompletion: number
  focusTime: number
  ranking: number
  abilities: {
    language: number
    math: number
    art: number
    physical: number
    social: number
  }
  strengths: Array<{
    name: string
    score: number
    description: string
  }>
  weaknesses: Array<{
    name: string
    score: number
    description: string
  }>
  suggestions: Array<{
    priority: 'high' | 'medium' | 'low'
    title: string
    description: string
  }>
}

// 路由
const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(false)
const exporting = ref(false)
const studentId = route.params.id as string

const studentAnalytics = ref<StudentAnalyticsData>({
  studentId: '',
  studentName: '',
  overallScore: 0,
  goalCompletion: 0,
  focusTime: 0,
  ranking: 0,
  abilities: {
    language: 0,
    math: 0,
    art: 0,
    physical: 0,
    social: 0
  },
  strengths: [],
  weaknesses: [],
  suggestions: []
})

// 方法
const loadStudentAnalytics = async () => {
  if (!studentId) {
    ElMessage.error('学生ID不能为空')
    router.back()
    return
  }

  loading.value = true
  try {
    const response = await get(STUDENT_ENDPOINTS.ANALYTICS(studentId))
    
    if (response.success && response.data) {
      studentAnalytics.value = response.data
    } else {
      const errorInfo = ErrorHandler.handle(new Error(response.message || '获取学生分析数据失败'), true)
    }
  } catch (error) {
    const errorInfo = ErrorHandler.handle(error, true)
    router.back()
  } finally {
    loading.value = false
  }
}

const refreshData = async () => {
  await loadStudentAnalytics()
  ElMessage.success('数据刷新成功')
}

const exportAnalytics = async () => {
  exporting.value = true
  try {
    const response = await post(STUDENT_ENDPOINTS.EXPORT_ANALYTICS(studentId), {
      includeCharts: true,
      format: 'pdf'
    })
    
    if (response.success) {
      ElMessage.success('分析报告导出成功')
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

const viewDetailedPlan = (type: string) => {
  ElMessage.info(`查看详细计划: ${type}`)
  // TODO: 跳转到详细计划页面
}

// 工具方法
const getPriorityText = (priority: string) => {
  const priorityMap = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级'
  }
  return priorityMap[priority as keyof typeof priorityMap] || priority
}

// 生命周期
onMounted(() => {
  loadStudentAnalytics()
})
</script>

<style lang="scss" scoped>
@import '@/styles/index.scss';

.student-analytics {
  padding: var(--spacing-lg);
}

.analytics-header {
  margin-bottom: var(--spacing-xl);
  text-align: center;

  h1 {
    font-size: var(--text-2xl);
    color: var(--text-primary);
    margin-bottom: var(--spacing-sm);
    font-weight: 600;
  }

  p {
    color: var(--text-secondary);
    font-size: var(--text-base);
  }
}

.analytics-grid {
  display: grid;
  gap: var(--spacing-xl);
  max-width: 1200px;
  margin: 0 auto;
}

.performance-overview,
.ability-radar,
.learning-trends,
.strengths-weaknesses,
.learning-suggestions {
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

.performance-overview h2,
.ability-radar h2,
.learning-trends h2,
.strengths-weaknesses h2,
.learning-suggestions h2 {
  font-size: var(--spacing-lg);
  color: var(--text-primary);
  margin-bottom: var(--text-lg);
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--text-base);
}

.overview-card {
  display: flex;
  align-items: center;
  gap: var(--text-base);
  padding: var(--spacing-lg);
  background: var(--bg-tertiary);
  border-radius: var(--spacing-sm);
  border: var(--border-width-base) solid #e8e8e8;
}

.card-icon {
  font-size: var(--text-4xl);
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: var(--radius-full);
}

.card-content h3 {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.card-value {
  font-size: var(--text-2xl);
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.card-trend {
  font-size: var(--text-xs);
  font-weight: 500;
}

.card-trend.positive {
  color: var(--success-color);
}

.card-trend.negative {
  color: var(--brand-danger);
}

.card-trend.neutral {
  color: var(--text-secondary);
}

.radar-chart {
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

.ability-scores {
  display: grid;
  gap: var(--text-xs);
}

.ability-item {
  display: grid;
  grid-template-columns: 100px 1fr 50px;
  align-items: center;
  gap: var(--text-xs);
}

.ability-name {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.ability-bar {
  height: var(--spacing-sm);
  background: var(--bg-gray-light);
  border-radius: var(--spacing-xs);
  overflow: hidden;
}

.ability-progress {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--success-color));
  transition: width 0.3s ease;
}

.ability-score {
  font-size: var(--text-sm);
  font-weight: bold;
  color: var(--text-primary);
  text-align: right;
}

.trend-chart {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border-radius: var(--spacing-xs);
  border: 2px dashed var(--border-base);
}

.analysis-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--text-2xl);
}

.strengths-section h3,
.weaknesses-section h3 {
  font-size: var(--text-base);
  color: var(--text-primary);
  margin-bottom: var(--text-lg);
}

.strength-list,
.weakness-list {
  display: grid;
  gap: var(--text-base);
}

.strength-item,
.weakness-item {
  display: flex;
  align-items: center;
  gap: var(--text-xs);
  padding: var(--text-base);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.strength-item {
  border-left: var(--spacing-xs) solid var(--success-color);
}

.weakness-item {
  border-left: var(--spacing-xs) solid #fa8c16;
}

.strength-icon,
.weakness-icon {
  font-size: var(--text-2xl);
  width: var(--icon-size); height: var(--icon-size);
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: var(--radius-full);
}

.strength-content,
.weakness-content {
  flex: 1;
}

.strength-content h4,
.weakness-content h4 {
  font-size: var(--text-sm);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.strength-content p,
.weakness-content p {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.strength-score,
.weakness-score {
  font-size: var(--text-sm);
  font-weight: bold;
  color: var(--text-primary);
}

.suggestions-list {
  display: grid;
  gap: var(--text-base);
}

.suggestion-item {
  padding: var(--spacing-lg);
  background: var(--bg-tertiary);
  border-radius: var(--spacing-sm);
  border-left: var(--spacing-xs) solid var(--primary-color);
}

.suggestion-priority {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--text-xs);
  font-size: var(--text-xs);
  font-weight: 500;
  margin-bottom: var(--text-sm);
}

.suggestion-priority.high {
  background: var(--bg-white)2e8;
  color: #fa8c16;
}

.suggestion-priority.medium {
  background: #f6ffed;
  color: var(--success-color);
}

.suggestion-priority.low {
  background: var(--bg-gray-light);
  color: var(--text-secondary);
}

.suggestion-content h3 {
  font-size: var(--text-base);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.suggestion-content p {
  color: var(--text-secondary);
  margin-bottom: var(--text-lg);
}

.suggestion-actions {
  display: flex;
  gap: var(--text-xs);
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
  .analytics-grid {
    gap: var(--spacing-md);
  }
  
  .overview-cards {
    grid-template-columns: 1fr;
  }
  
  .analysis-grid {
    grid-template-columns: 1fr;
  }
  
  .analytics-header h1 {
    font-size: var(--text-xl);
  }
}
</style>
