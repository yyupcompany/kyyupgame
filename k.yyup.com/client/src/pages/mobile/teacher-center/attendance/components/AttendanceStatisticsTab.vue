<template>
  <div class="attendance-statistics-tab">
    <!-- 筛选区域 -->
    <div class="filter-section">
      <van-card>
        <template #title>
          <div class="filter-title">
            <van-icon name="chart-trending-o" />
            统计分析
          </div>
        </template>
        
        <div class="filter-content">
          <van-field
            v-model="filterForm.typeText"
            name="type"
            label="统计类型"
            placeholder="请选择统计类型"
            readonly
            is-link
            @click="showTypePicker = true"
          />
          
          <van-field
            v-if="filterForm.type === 'class'"
            v-model="filterForm.classIdText"
            name="classId"
            label="班级"
            placeholder="请选择班级"
            readonly
            is-link
            @click="showClassPicker = true"
          />
          
          <van-field
            v-model="filterForm.dateRangeText"
            name="dateRange"
            label="时间范围"
            placeholder="选择时间范围"
            readonly
            is-link
            @click="showDatePicker = true"
          />
          
          <div class="filter-actions">
            <van-button type="primary" size="small" @click="loadStatistics" :loading="loading">
              查询统计
            </van-button>
            <van-button size="small" @click="resetFilter">
              重置
            </van-button>
          </div>
        </div>
      </van-card>
    </div>

    <!-- 教师个人统计 -->
    <div v-if="filterForm.type === 'teacher'" class="teacher-stats">
      <!-- 统计卡片 -->
      <div class="stats-cards">
        <van-row gutter="16">
          <van-col span="6">
            <van-card class="stat-card stat-days">
              <div class="stat-content">
                <div class="stat-icon">
                  <van-icon name="calendar-check-o" />
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ teacherStats.attendanceDays }}</div>
                  <div class="stat-label">出勤天数</div>
                </div>
              </div>
            </van-card>
          </van-col>

          <van-col span="6">
            <van-card class="stat-card stat-late">
              <div class="stat-content">
                <div class="stat-icon">
                  <van-icon name="clock-o" />
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ teacherStats.lateCount }}</div>
                  <div class="stat-label">迟到次数</div>
                </div>
              </div>
            </van-card>
          </van-col>

          <van-col span="6">
            <van-card class="stat-card stat-early">
              <div class="stat-content">
                <div class="stat-icon">
                  <van-icon name="logistics" />
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ teacherStats.earlyLeaveCount }}</div>
                  <div class="stat-label">早退次数</div>
                </div>
              </div>
            </van-card>
          </van-col>

          <van-col span="6">
            <van-card class="stat-card stat-rate">
              <div class="stat-content">
                <div class="stat-icon">
                  <van-icon name="chart-trending-o" />
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ teacherStats.attendanceRate }}%</div>
                  <div class="stat-label">出勤率</div>
                </div>
              </div>
            </van-card>
          </van-col>
        </van-row>
      </div>

      <!-- 出勤趋势图表 -->
      <div class="chart-section">
        <van-card>
          <template #title>
            <div class="chart-title">
              <van-icon name="bar-chart-o" />
              出勤趋势
            </div>
          </template>
          <div class="chart-content">
            <div class="simple-chart">
              <div class="chart-container">
                <canvas ref="teacherChart" width="300" height="200"></canvas>
              </div>
            </div>
          </div>
        </van-card>
      </div>

      <!-- 考勤分布 -->
      <div class="distribution-section">
        <van-card>
          <template #title>
            <div class="distribution-title">
              <van-icon name="pie-chart-o" />
              考勤分布
            </div>
          </template>
          <div class="distribution-content">
            <div class="distribution-item">
              <div class="distribution-label">
                <span>正常出勤</span>
                <span class="distribution-value">{{ teacherStats.presentCount }}天</span>
              </div>
              <van-progress
                :percentage="getPercentage(teacherStats.presentCount, teacherStats.totalDays)"
                color="#67c23a"
                stroke-width="8"
              />
            </div>
            
            <div class="distribution-item">
              <div class="distribution-label">
                <span>迟到</span>
                <span class="distribution-value">{{ teacherStats.lateCount }}天</span>
              </div>
              <van-progress
                :percentage="getPercentage(teacherStats.lateCount, teacherStats.totalDays)"
                color="#e6a23c"
                stroke-width="8"
              />
            </div>
            
            <div class="distribution-item">
              <div class="distribution-label">
                <span>早退</span>
                <span class="distribution-value">{{ teacherStats.earlyLeaveCount }}天</span>
              </div>
              <van-progress
                :percentage="getPercentage(teacherStats.earlyLeaveCount, teacherStats.totalDays)"
                color="#f56c6c"
                stroke-width="8"
              />
            </div>
            
            <div class="distribution-item">
              <div class="distribution-label">
                <span>请假</span>
                <span class="distribution-value">{{ teacherStats.leaveCount }}天</span>
              </div>
              <van-progress
                :percentage="getPercentage(teacherStats.leaveCount, teacherStats.totalDays)"
                color="#909399"
                stroke-width="8"
              />
            </div>
          </div>
        </van-card>
      </div>
    </div>

    <!-- 班级学生统计 -->
    <div v-if="filterForm.type === 'class'" class="class-stats">
      <!-- 班级统计卡片 -->
      <div class="stats-cards">
        <van-row gutter="16">
          <van-col span="6">
            <van-card class="stat-card stat-total">
              <div class="stat-content">
                <div class="stat-icon">
                  <van-icon name="friends-o" />
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ classStats.totalStudents }}</div>
                  <div class="stat-label">班级人数</div>
                </div>
              </div>
            </van-card>
          </van-col>

          <van-col span="6">
            <van-card class="stat-card stat-present">
              <div class="stat-content">
                <div class="stat-icon">
                  <van-icon name="checked" />
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ classStats.avgAttendance }}</div>
                  <div class="stat-label">平均出勤</div>
                </div>
              </div>
            </van-card>
          </van-col>

          <van-col span="6">
            <van-card class="stat-card stat-rate">
              <div class="stat-content">
                <div class="stat-icon">
                  <van-icon name="chart-trending-o" />
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ classStats.attendanceRate }}%</div>
                  <div class="stat-label">出勤率</div>
                </div>
              </div>
            </van-card>
          </van-col>

          <van-col span="6">
            <van-card class="stat-card stat-abnormal">
              <div class="stat-content">
                <div class="stat-icon">
                  <van-icon name="warning-o" />
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ classStats.abnormalCount }}</div>
                  <div class="stat-label">异常次数</div>
                </div>
              </div>
            </van-card>
          </van-col>
        </van-row>
      </div>

      <!-- 学生出勤排行 -->
      <div class="ranking-section">
        <van-card>
          <template #title>
            <div class="ranking-title">
              <van-icon name="medal-o" />
              学生出勤排行
              <van-button size="mini" type="primary" @click="showRankingDetail">
                查看详情
              </van-button>
            </div>
          </template>
          <div class="ranking-content">
            <div v-if="studentRanking.length === 0" class="empty-state">
              <van-empty description="暂无排行数据" />
            </div>
            
            <div v-else class="ranking-list">
              <van-cell-group>
                <van-cell
                  v-for="(student, index) in studentRanking.slice(0, 10)"
                  :key="student.studentName"
                  :title="student.studentName"
                  :label="`出勤${student.attendanceDays}天 | 缺勤${student.absentDays}天`"
                >
                  <template #icon>
                    <div class="rank-badge" :class="getRankClass(index)">
                      {{ index + 1 }}
                    </div>
                  </template>
                  
                  <template #value>
                    <van-tag
                      :type="getRateType(student.attendanceRate)"
                      size="medium"
                    >
                      {{ student.attendanceRate }}%
                    </van-tag>
                  </template>
                </van-cell>
              </van-cell-group>
            </div>
          </div>
        </van-card>
      </div>

      <!-- 异常学生列表 -->
      <div class="abnormal-section">
        <van-card>
          <template #title>
            <div class="abnormal-title">
              <van-icon name="warning" />
              异常学生
              <van-tag type="danger" size="small">{{ abnormalStudents.length }}人</van-tag>
            </div>
          </template>
          <div class="abnormal-content">
            <div v-if="abnormalStudents.length === 0" class="empty-state">
              <van-empty description="暂无异常学生" />
            </div>
            
            <div v-else class="abnormal-list">
              <van-cell-group>
                <van-cell
                  v-for="student in abnormalStudents"
                  :key="student.studentName"
                  :title="student.studentName"
                  :label="`${student.abnormalType} - ${student.count}次 - ${student.lastDate}`"
                >
                  <template #icon>
                    <van-icon name="warning-o" color="#ee0a24" size="20" />
                  </template>
                  
                  <template #value>
                    <van-button
                      size="mini"
                      type="primary"
                      @click="viewStudentDetail(student)"
                    >
                      查看
                    </van-button>
                  </template>
                </van-cell>
              </van-cell-group>
            </div>
          </div>
        </van-card>
      </div>
    </div>

    <!-- 选择器弹窗 -->
    <!-- 统计类型选择器 -->
    <van-popup v-model:show="showTypePicker" position="bottom">
      <van-picker
        :columns="typeColumns"
        @confirm="onTypeConfirm"
        @cancel="showTypePicker = false"
      />
    </van-popup>

    <!-- 班级选择器 -->
    <van-popup v-model:show="showClassPicker" position="bottom">
      <van-picker
        :columns="classColumns"
        @confirm="onClassConfirm"
        @cancel="showClassPicker = false"
      />
    </van-popup>

    <!-- 日期范围选择器 -->
    <van-popup v-model:show="showDatePicker" position="bottom">
      <van-calendar
        v-model="filterForm.dateRange"
        type="range"
        :max-date="maxDate"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>

    <!-- 排行榜详情对话框 -->
    <AttendanceRankingDetailDialog
      v-model="rankingDetailVisible"
      :rankings="studentRanking"
      :loading="loading"
      @view-detail="handleViewStudentDetail"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { showToast } from 'vant'
import { getTeacherClasses, type ClassInfo } from '@/api/modules/attendance'
import { getTeacherStatistics } from '@/api/modules/teacher-checkin'
import AttendanceRankingDetailDialog from './AttendanceRankingDetailDialog.vue'

// ==================== 数据定义 ====================

const emit = defineEmits<{
  refresh: []
}>()

const loading = ref(false)
const showTypePicker = ref(false)
const showClassPicker = ref(false)
const showDatePicker = ref(false)

// 最大日期（今天）
const maxDate = ref(new Date())

// 筛选表单
const filterForm = reactive({
  type: 'teacher' as 'teacher' | 'class',
  typeText: '教师个人',
  classId: null as number | null,
  classIdText: '',
  dateRange: [] as Date[],
  dateRangeText: '',
})

// 统计类型选项
const typeColumns = [
  { text: '教师个人', value: 'teacher' },
  { text: '班级学生', value: 'class' },
]

// 班级列表
const classList = ref<ClassInfo[]>([])
const classColumns = computed(() => 
  classList.value.map(cls => ({ text: cls.name, value: cls.id }))
)

// 教师统计数据
const teacherStats = ref({
  totalDays: 0,
  attendanceDays: 0,
  presentCount: 0,
  lateCount: 0,
  earlyLeaveCount: 0,
  leaveCount: 0,
  attendanceRate: 0,
})

// 班级统计数据
const classStats = ref({
  totalStudents: 0,
  avgAttendance: 0,
  attendanceRate: 0,
  abnormalCount: 0,
})

// 学生排行
const studentRanking = ref<any[]>([])

// 排行榜详情对话框
const rankingDetailVisible = ref(false)

// 异常学生
const abnormalStudents = ref<any[]>([])

// 图表引用
const teacherChart = ref()

// ==================== 计算属性 ====================

// ==================== 方法 ====================

// 获取百分比
const getPercentage = (value: number, total: number) => {
  return total > 0 ? Math.round((value / total) * 100) : 0
}

// 获取排名样式类
const getRankClass = (index: number) => {
  if (index === 0) return 'rank-gold'
  if (index === 1) return 'rank-silver'
  if (index === 2) return 'rank-bronze'
  return 'rank-normal'
}

// 获取出勤率类型
const getRateType = (rate: number) => {
  if (rate >= 95) return 'success'
  if (rate >= 85) return 'warning'
  return 'danger'
}

// 加载班级列表
const loadClasses = async () => {
  try {
    const response = await getTeacherClasses()
    if (response.success && response.data) {
      classList.value = response.data
      if (classList.value.length > 0) {
        filterForm.classId = classList.value[0].id
        filterForm.classIdText = classList.value[0].name
      }
    }
  } catch (error) {
    console.error('加载班级列表失败:', error)
    showToast('加载班级列表失败')
  }
}

// 加载统计数据
const loadStatistics = async () => {
  if (filterForm.type === 'teacher') {
    await loadTeacherStatistics()
  } else {
    await loadClassStatistics()
  }
}

// 加载教师统计
const loadTeacherStatistics = async () => {
  loading.value = true
  try {
    // TODO: 调用API加载教师统计数据
    // const response = await getTeacherStatistics(teacherId, startDate, endDate)
    
    // Mock数据
    teacherStats.value = {
      totalDays: 30,
      attendanceDays: 28,
      presentCount: 25,
      lateCount: 2,
      earlyLeaveCount: 1,
      leaveCount: 2,
      attendanceRate: 93.3,
    }
    
    // 绘制图表
    await nextTick()
    drawTeacherChart()
  } catch (error) {
    console.error('加载教师统计失败:', error)
    showToast('加载教师统计失败')
  } finally {
    loading.value = false
  }
}

// 加载班级统计
const loadClassStatistics = async () => {
  if (!filterForm.classId) {
    showToast('请先选择班级')
    return
  }

  loading.value = true
  try {
    // TODO: 调用API加载班级统计数据
    // Mock数据
    classStats.value = {
      totalStudents: 30,
      avgAttendance: 28,
      attendanceRate: 93.3,
      abnormalCount: 5,
    }

    studentRanking.value = [
      { studentName: '张小明', attendanceDays: 28, absentDays: 2, attendanceRate: 93.3 },
      { studentName: '李小红', attendanceDays: 29, absentDays: 1, attendanceRate: 96.7 },
      { studentName: '王小刚', attendanceDays: 27, absentDays: 3, attendanceRate: 90.0 },
      { studentName: '赵小美', attendanceDays: 30, absentDays: 0, attendanceRate: 100.0 },
      { studentName: '刘小强', attendanceDays: 25, absentDays: 5, attendanceRate: 83.3 },
    ]

    abnormalStudents.value = [
      { studentName: '王小刚', abnormalType: '频繁缺勤', count: 3, lastDate: '2024-01-15' },
      { studentName: '刘小强', abnormalType: '体温异常', count: 2, lastDate: '2024-01-14' },
    ]
  } catch (error) {
    console.error('加载班级统计失败:', error)
    showToast('加载班级统计失败')
  } finally {
    loading.value = false
  }
}

// 绘制教师出勤趋势图
const drawTeacherChart = () => {
  const canvas = teacherChart.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 设置画布大小
  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  ctx.scale(dpr, dpr)

  // 清除画布
  ctx.clearRect(0, 0, rect.width, rect.height)

  // 模拟数据
  const data = [90, 92, 88, 95, 93, 89, 94, 91, 93, 96, 92, 94]
  const labels = ['1日', '2日', '3日', '4日', '5日', '6日', '7日', '8日', '9日', '10日', '11日', '12日']

  const padding = 40
  const chartWidth = rect.width - padding * 2
  const chartHeight = rect.height - padding * 2
  const barWidth = chartWidth / data.length - 10

  // 绘制坐标轴
  ctx.strokeStyle = '#e0e0e0'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(padding, padding)
  ctx.lineTo(padding, rect.height - padding)
  ctx.lineTo(rect.width - padding, rect.height - padding)
  ctx.stroke()

  // 绘制柱状图
  data.forEach((value, index) => {
    const barHeight = (value / 100) * chartHeight
    const x = padding + index * (chartWidth / data.length) + 5
    const y = rect.height - padding - barHeight

    // 绘制柱子
    ctx.fillStyle = value >= 95 ? '#67c23a' : value >= 85 ? '#e6a23c' : '#f56c6c'
    ctx.fillRect(x, y, barWidth, barHeight)

    // 绘制数值
    ctx.fillStyle = '#333'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(value + '%', x + barWidth / 2, y - 5)

    // 绘制标签
    ctx.fillText(labels[index], x + barWidth / 2, rect.height - padding + 20)
  })
}

// 统计类型确认
const onTypeConfirm = ({ selectedValues }: any) => {
  filterForm.type = selectedValues[0]
  const column = typeColumns.find(c => c.value === selectedValues[0])
  filterForm.typeText = column?.text || ''
  showTypePicker.value = false
}

// 班级确认
const onClassConfirm = ({ selectedValues }: any) => {
  filterForm.classId = selectedValues[0]
  const column = classColumns.value.find(c => c.value === selectedValues[0])
  filterForm.classIdText = column?.text || ''
  showClassPicker.value = false
}

// 日期确认
const onDateConfirm = (dates: Date[]) => {
  filterForm.dateRange = dates
  if (dates.length === 2) {
    const startText = dates[0].toLocaleDateString('zh-CN')
    const endText = dates[1].toLocaleDateString('zh-CN')
    filterForm.dateRangeText = `${startText} - ${endText}`
  }
  showDatePicker.value = false
}

// 重置筛选
const resetFilter = () => {
  filterForm.type = 'teacher'
  filterForm.typeText = '教师个人'
  filterForm.classId = null
  filterForm.classIdText = ''
  filterForm.dateRange = []
  filterForm.dateRangeText = ''
  loadStatistics()
}

// 显示排行详情
const showRankingDetail = () => {
  rankingDetailVisible.value = true
}

// 查看学生详情
const handleViewStudentDetail = (student: any) => {
  showToast(`${student.studentName} - 出勤率 ${student.attendanceRate}%`)
}

// 查看学生详情
const viewStudentDetail = (student: any) => {
  showToast(`${student.studentName} - ${student.abnormalType}`)
}

// ==================== 生命周期 ====================

onMounted(() => {
  // 设置默认时间范围（最近30天）
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - 30)
  filterForm.dateRange = [startDate, endDate]
  filterForm.dateRangeText = `${startDate.toLocaleDateString('zh-CN')} - ${endDate.toLocaleDateString('zh-CN')}`
  
  loadClasses()
  loadStatistics()
})
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';

.attendance-statistics-tab {
  padding: var(--van-padding-md);

  .filter-section,
  .stats-cards,
  .chart-section,
  .distribution-section,
  .ranking-section,
  .abnormal-section {
    margin-bottom: var(--van-padding-md);
  }

  .filter-title,
  .chart-title,
  .distribution-title,
  .ranking-title,
  .abnormal-title {
    display: flex;
    align-items: center;
    font-size: var(--van-font-size-lg);
    font-weight: var(--van-font-weight-bold);
    
    .van-icon {
      margin-right: var(--van-padding-xs);
      color: var(--van-primary-color);
    }
    
    .van-button,
    .van-tag {
      margin-left: var(--van-padding-sm);
    }
  }

  .filter-content {
    .filter-actions {
      display: flex;
      gap: var(--van-padding-sm);
      margin-top: var(--van-padding-md);
    }
  }

  .stat-card {
    .stat-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--van-padding-sm);
      background: var(--van-background-color-light);
      border-radius: var(--van-radius-sm);
      height: 100px;

      .stat-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: var(--van-padding-xs);
        
        .van-icon {
          color: white;
          font-size: var(--van-font-size-lg);
        }
      }

      .stat-info {
        text-align: center;

        .stat-value {
          font-size: var(--van-font-size-xl);
          font-weight: var(--van-font-weight-bold);
          margin-bottom: var(--van-padding-xs);
          color: var(--van-text-color);
        }

        .stat-label {
          font-size: var(--van-font-size-sm);
          color: var(--van-gray-6);
        }
      }
    }

    &.stat-days .stat-icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    &.stat-late .stat-icon {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    &.stat-early .stat-icon {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    &.stat-rate .stat-icon {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }

    &.stat-total .stat-icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    &.stat-present .stat-icon {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    &.stat-abnormal .stat-icon {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    }
  }

  .chart-content {
    .simple-chart {
      .chart-container {
        width: 100%;
        height: 200px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }

  .distribution-content {
    .distribution-item {
      margin-bottom: var(--van-padding-md);

      .distribution-label {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--van-padding-xs);

        .distribution-value {
          font-weight: var(--van-font-weight-bold);
          color: var(--van-primary-color);
        }
      }
    }
  }

  .ranking-content,
  .abnormal-content {
    .empty-state {
      padding: var(--van-padding-xl) 0;
      text-align: center;
    }

    .ranking-list,
    .abnormal-list {
      .rank-badge {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--van-font-size-sm);
        font-weight: var(--van-font-weight-bold);
        margin-right: var(--van-padding-sm);

        &.rank-gold {
          background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
          color: var(--text-primary);
        }

        &.rank-silver {
          background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
          color: var(--text-primary);
        }

        &.rank-bronze {
          background: linear-gradient(135deg, #cd7f32 0%, #e4a853 100%);
          color: var(--text-primary);
        }

        &.rank-normal {
          background: var(--van-gray-2);
          color: var(--van-gray-6);
        }
      }
    }
  }
}

// 响应式适配
@media (min-width: 768px) {
  .attendance-statistics-tab {
    max-width: 768px;
    margin: 0 auto;

    .stat-card {
      .stat-content {
        .stat-value {
          font-size: var(--van-font-size-2xl);
        }
      }
    }
  }
}
</style>