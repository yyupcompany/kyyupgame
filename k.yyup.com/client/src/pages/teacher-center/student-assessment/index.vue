<template>
  <UnifiedCenterLayout
    title="学生测评"
    description="查看学生发展评估记录和班级统计分析"
    icon="Chart"
  >
    <!-- 头部操作按钮 -->
    <template #header-actions>
      <el-input
        v-model="searchKeyword"
        placeholder="搜索学生姓名"
        clearable
        style="width: 300px"
        @change="filterStudents"
        @clear="filterStudents"
      >
        <template #prefix>
          <UnifiedIcon name="search" :size="16" />
        </template>
      </el-input>
      <el-button type="primary" @click="refreshData">
        <UnifiedIcon name="refresh" :size="16" />
        刷新
      </el-button>
    </template>

    <!-- 统计卡片 - 直接使用 UnifiedCenterLayout 提供的网格容器 -->
    <template #stats>
      <StatCard
        icon="user"
        title="学生总数"
        :value="studentsList.length"
        subtitle="我负责的学生"
        type="primary"
        :trend="studentsList.length > 0 ? 'up' : 'stable'"
        clickable
      />
      <StatCard
        icon="document"
        title="测评总数"
        :value="assessmentStats.totalCount"
        subtitle="已完成测评"
        type="success"
        :trend="assessmentStats.totalCount > 0 ? 'up' : 'stable'"
        clickable
      />
      <StatCard
        icon="star"
        title="平均分"
        :value="assessmentStats.averageScore"
        subtitle="班级平均分"
        type="warning"
        :trend="assessmentStats.averageScore >= 80 ? 'up' : 'stable'"
        clickable
      />
      <StatCard
        icon="alert"
        title="需关注"
        :value="focusStudents.length"
        subtitle="低于平均分学生"
        type="danger"
        :trend="focusStudents.length > 0 ? 'down' : 'stable'"
        clickable
        @click="activeTab = 'focus'"
      />
    </template>

    <!-- Tab切换 -->
    <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="assessment-tabs">
      <!-- Tab 1: 我的学生测评 -->
      <el-tab-pane label="我的学生" name="students">
        <div v-loading="loading" class="students-grid">
          <div
            v-for="student in filteredStudents"
            :key="student.id"
            class="student-card"
            @click="viewStudentDetail(student)"
          >
            <div class="student-header">
              <el-avatar :size="60" :src="student.avatar || '/default-avatar.png'">
                {{ student.name.charAt(0) }}
              </el-avatar>
              <div class="student-info">
                <h4>{{ student.name }}</h4>
                <p>{{ student.age }}岁 | {{ student.gender === 'male' ? '男' : '女' }}</p>
                <p v-if="student.className" class="class-name">{{ student.className }}</p>
              </div>
            </div>

            <div class="assessment-summary">
              <div class="stat-item">
                <div class="stat-label">测评次数</div>
                <div class="stat-value primary">{{ student.assessmentCount || 0 }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">平均分</div>
                <div class="stat-value success">
                  {{ student.averageScore ? student.averageScore.toFixed(1) : '-' }}
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-label">最近测评</div>
                <div class="stat-value info">
                  {{ student.lastAssessmentDate ? formatDate(student.lastAssessmentDate) : '暂无' }}
                </div>
              </div>
            </div>

            <div class="card-actions">
              <el-button type="primary" size="small" @click.stop="viewStudentDetail(student)">
                查看详情
              </el-button>
            </div>
          </div>

          <el-empty
            v-if="filteredStudents.length === 0 && !loading"
            description="暂无学生数据"
          />
        </div>
      </el-tab-pane>

      <!-- Tab 2: 班级统计 -->
      <el-tab-pane label="班级统计" name="statistics">
        <el-card v-if="classStats" shadow="hover" class="class-stats-card">
          <h3>{{ classStats.className }} 测评统计</h3>

          <el-row :gutter="20" class="stats-row">
            <el-col :xs="24" :sm="12" :lg="6">
              <div class="stat-box">
                <div class="stat-icon primary">
                  <UnifiedIcon name="user" :size="24" />
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ classStats.studentCount }}</div>
                  <div class="stat-title">学生总数</div>
                </div>
              </div>
            </el-col>
            <el-col :xs="24" :sm="12" :lg="6">
              <div class="stat-box">
                <div class="stat-icon success">
                  <UnifiedIcon name="document" :size="24" />
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ classStats.assessmentCount }}</div>
                  <div class="stat-title">测评总数</div>
                </div>
              </div>
            </el-col>
            <el-col :xs="24" :sm="12" :lg="6">
              <div class="stat-box">
                <div class="stat-icon warning">
                  <UnifiedIcon name="star" :size="24" />
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ classStats.averageScore?.toFixed(1) || '-' }}</div>
                  <div class="stat-title">班级平均分</div>
                </div>
              </div>
            </el-col>
          </el-row>

          <div class="radar-section">
            <h4>班级五大维度平均分</h4>
            <DimensionRadar
              v-if="classStats.dimensionAverages"
              :dimension-scores="classStats.dimensionAverages"
            />
          </div>
        </el-card>
      </el-tab-pane>

      <!-- Tab 3: 重点关注 -->
      <el-tab-pane label="重点关注" name="focus">
        <div v-loading="loading" class="focus-students">
          <el-alert
            title="重点关注学生"
            type="warning"
            :closable="false"
            show-icon
            class="focus-alert"
          >
            以下学生的测评得分低于平均水平，建议给予更多关注和指导
          </el-alert>

          <div class="students-grid">
            <div
              v-for="student in focusStudents"
              :key="student.id"
              class="student-card focus"
            >
              <el-tag type="warning" class="focus-tag">需关注</el-tag>
              <div class="student-header">
                <el-avatar :size="60" :src="student.avatar || '/default-avatar.png'">
                  {{ student.name.charAt(0) }}
                </el-avatar>
                <div class="student-info">
                  <h4>{{ student.name }}</h4>
                  <p>{{ student.age }}岁 | {{ student.gender === 'male' ? '男' : '女' }}</p>
                </div>
              </div>

              <div class="focus-reason">
                <p><strong>关注原因：</strong>{{ student.focusReason || '测评分数偏低' }}</p>
                <p><strong>平均分：</strong><span class="warning-score">{{ student.averageScore }}</span></p>
              </div>

              <div class="card-actions">
                <el-button type="primary" size="small" @click="viewStudentDetail(student)">
                  查看详情
                </el-button>
                <el-button type="success" size="small" @click="addNote(student)">
                  添加备注
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue';
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue';
import StatCard from '@/components/centers/StatCard.vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';
import {
  getTeacherStudents,
  getClassStatistics,
  getFocusStudents,
  type StudentAssessmentSummary,
  type ClassStatistics,
} from '@/api/modules/teacher-assessment';
import DimensionRadar from '@/pages/assessment-analytics/components/DimensionRadar.vue';

const router = useRouter();

const activeTab = ref('students');
const loading = ref(false);
const searchKeyword = ref('');
const studentsList = ref<StudentAssessmentSummary[]>([]);
const classStats = ref<ClassStatistics | null>(null);
const focusStudents = ref<any[]>([]);

// 统计数据
const assessmentStats = reactive({
  totalCount: 0,
  averageScore: 0,
});

/**
 * 过滤后的学生列表
 */
const filteredStudents = computed(() => {
  if (!searchKeyword.value) {
    return studentsList.value;
  }
  return studentsList.value.filter((student) =>
    student.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  );
});

/**
 * 加载学生列表
 */
const loadStudents = async () => {
  loading.value = true;
  try {
    const response = await getTeacherStudents();
    if (response.success) {
      studentsList.value = response.data || [];
      // 更新统计
      assessmentStats.totalCount = studentsList.value.reduce(
        (sum, s) => sum + (s.assessmentCount || 0), 0
      );
      assessmentStats.averageScore = studentsList.value.length > 0
        ? studentsList.value.reduce((sum, s) => sum + (s.averageScore || 0), 0) / studentsList.value.length
        : 0;
    } else {
      ElMessage.error(response.message || '加载学生列表失败');
    }
  } catch (error: any) {
    console.error('加载学生列表失败:', error);
    ElMessage.error(error.message || '加载学生列表失败');
  } finally {
    loading.value = false;
  }
};

/**
 * 加载班级统计
 */
const loadClassStats = async () => {
  loading.value = true;
  try {
    const response = await getClassStatistics();
    if (response.success) {
      classStats.value = response.data;
    } else {
      ElMessage.error(response.message || '加载班级统计失败');
    }
  } catch (error: any) {
    console.error('加载班级统计失败:', error);
    ElMessage.error(error.message || '加载班级统计失败');
  } finally {
    loading.value = false;
  }
};

/**
 * 加载重点关注学生
 */
const loadFocusStudents = async () => {
  loading.value = true;
  try {
    const response = await getFocusStudents();
    if (response.success) {
      focusStudents.value = response.data || [];
    } else {
      ElMessage.error(response.message || '加载重点关注学生失败');
    }
  } catch (error: any) {
    console.error('加载重点关注学生失败:', error);
    ElMessage.error(error.message || '加载重点关注学生失败');
  } finally {
    loading.value = false;
  }
};

/**
 * Tab切换处理
 */
const handleTabChange = (tabName: string) => {
  if (tabName === 'students') {
    loadStudents();
  } else if (tabName === 'statistics') {
    loadClassStats();
  } else if (tabName === 'focus') {
    loadFocusStudents();
  }
};

/**
 * 过滤学生
 */
const filterStudents = () => {
  // 自动触发computed
};

/**
 * 刷新数据
 */
const refreshData = () => {
  handleTabChange(activeTab.value);
  ElMessage.success('数据已刷新');
};

/**
 * 查看学生详情
 */
const viewStudentDetail = (student: StudentAssessmentSummary) => {
  router.push(`/teacher-center/student-assessment/detail/${student.id}`);
};

/**
 * 添加备注
 */
const addNote = (student: any) => {
  router.push(`/teacher-center/student-assessment/detail/${student.id}?tab=notes`);
};

/**
 * 格式化日期
 */
const formatDate = (date: string) => {
  return dayjs(date).format('MM-DD');
};

onMounted(() => {
  loadStudents();
});
</script>

<style lang="scss" scoped>
@use "@/styles/design-tokens.scss" as *;

// ==================== 选项卡样式 ====================
.assessment-tabs {
  width: 100%;

  :deep(.el-tabs__header) {
    margin-bottom: var(--spacing-xl);
    background-color: var(--bg-card);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-color);
    padding: var(--spacing-sm) var(--spacing-md);
  }

  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }

  :deep(.el-tabs__item) {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    padding: 0 var(--spacing-lg);
    height: var(--spacing-3xl);

    &:hover {
      color: var(--primary-color);
    }

    &.is-active {
      color: var(--primary-color);
      font-weight: 600;
    }
  }

  :deep(.el-tabs__active-bar) {
    background-color: var(--primary-color);
    height: var(--spacing-xs);
  }

  :deep(.el-tabs__content) {
    padding: 0;
  }
}

// ==================== 学生卡片网格 ====================
.students-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-lg);

  .student-card {
    position: relative;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    cursor: pointer;
    transition: all var(--transition-base);

    &:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-4px);
      border-color: var(--primary-light);
    }

    &.focus {
      border: 2px solid var(--warning-color);

      .focus-tag {
        position: absolute;
        top: var(--spacing-sm);
        right: var(--spacing-sm);
      }
    }

    .student-header {
      display: flex;
      align-items: center;
      margin-bottom: var(--spacing-lg);

      :deep(.el-avatar) {
        flex-shrink: 0;
        background: var(--primary-light);
        color: white;
        font-size: var(--text-xl);
        font-weight: 600;
      }

      .student-info {
        flex: 1;
        margin-left: var(--spacing-md);
        min-width: 0;

        h4 {
          margin: 0 0 var(--spacing-xs) 0;
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        p {
          margin: var(--spacing-2xs) 0;
          font-size: var(--text-xs);
          color: var(--text-secondary);

          &.class-name {
            color: var(--primary-color);
            font-weight: 500;
          }
        }
      }
    }

    .assessment-summary {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-md);
      padding: var(--spacing-sm) 0;
      border-top: 1px solid var(--border-color);
      border-bottom: 1px solid var(--border-color);

      .stat-item {
        text-align: center;
        padding: var(--spacing-sm);
        background: var(--bg-secondary);
        border-radius: var(--radius-sm);

        .stat-label {
          font-size: var(--text-xs);
          color: var(--text-secondary);
          margin-bottom: var(--spacing-xs);
        }

        .stat-value {
          font-size: var(--text-base);
          font-weight: 600;

          &.primary {
            color: var(--primary-color);
          }

          &.success {
            color: var(--success-color);
          }

          &.info {
            font-size: var(--text-xs);
            color: var(--text-secondary);
            font-weight: normal;
          }
        }
      }
    }

    .focus-reason {
      padding: var(--spacing-sm);
      margin-bottom: var(--spacing-md);
      background: var(--warning-light);
      border-radius: var(--radius-sm);

      p {
        margin: var(--spacing-2xs) 0;
        font-size: var(--text-sm);
        color: var(--text-primary);

        .warning-score {
          color: var(--danger-color);
          font-weight: 600;
        }
      }
    }

    .card-actions {
      display: flex;
      gap: var(--spacing-sm);
      justify-content: center;

      :deep(.el-button) {
        flex: 1;
        border-radius: var(--radius-sm);
      }
    }
  }

  :deep(.el-empty) {
    padding: var(--spacing-5xl);
    grid-column: 1 / -1;
  }
}

// ==================== 班级统计卡片 ====================
.class-stats-card {
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  background: var(--bg-card);

  h3 {
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 var(--spacing-lg) 0;
    padding-bottom: var(--spacing-md);
    border-bottom: 1px solid var(--border-color);
  }

  .stats-row {
    margin-bottom: var(--spacing-xl);

    :deep(.el-row) {
      margin: 0;
    }

    :deep(.el-col) {
      padding: var(--spacing-sm);
    }
  }

  .radar-section {
    margin-top: var(--spacing-xl);

    h4 {
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-md) 0;
    }
  }
}

// ==================== 统计盒子 ====================
.stat-box {
  display: flex;
  align-items: center;
  padding: var(--spacing-lg);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);

  &:hover {
    box-shadow: var(--shadow-sm);
  }

  .stat-icon {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: var(--spacing-md);
    color: white;

    &.primary {
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
    }

    &.success {
      background: linear-gradient(135deg, var(--success-color) 0%, var(--success-light) 100%);
    }

    &.warning {
      background: linear-gradient(135deg, var(--warning-color) 0%, var(--warning-light) 100%);
    }
  }

  .stat-content {
    flex: 1;

    .stat-number {
      font-size: var(--text-2xl);
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1;
      margin-bottom: var(--spacing-xs);
    }

    .stat-title {
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }
  }
}

// ==================== 重点关注区域 ====================
.focus-students {
  .focus-alert {
    margin-bottom: var(--spacing-lg);
    border-radius: var(--radius-md);
  }
}

// ==================== 响应式设计 ====================
@media (max-width: var(--breakpoint-md)) {
  .assessment-tabs {
    :deep(.el-tabs__header) {
      padding: var(--spacing-xs) var(--spacing-sm);
    }

    :deep(.el-tabs__item) {
      padding: 0 var(--spacing-md);
      height: var(--spacing-2xl);
    }
  }

  .students-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);

    .student-card {
      padding: var(--spacing-md);

      .assessment-summary {
        grid-template-columns: repeat(3, 1fr);
        gap: var(--spacing-xs);
      }
    }
  }

  .class-stats-card {
    .stats-row {
      :deep(.el-col) {
        margin-bottom: var(--spacing-sm);
      }
    }
  }
}
</style>
