<template>
  <div class="student-assessment">
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <!-- Tab 1: 我的学生测评 -->
      <el-tab-pane label="我的学生测评" name="students">
        <div class="search-bar">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索学生姓名"
            clearable
            style="width: 300px"
            @change="filterStudents"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

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
        <el-card v-if="classStats" shadow="hover">
          <h3>{{ classStats.className }} 测评统计</h3>
          
          <el-row :gutter="20" style="margin-top: 20px">
            <el-col :xs="24" :sm="12" :lg="6">
              <div class="stat-box">
                <div class="stat-icon primary">
                  <el-icon><User /></el-icon>
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
                  <el-icon><Document /></el-icon>
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
                  <el-icon><Star /></el-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ classStats.averageScore?.toFixed(1) || '-' }}</div>
                  <div class="stat-title">班级平均分</div>
                </div>
              </div>
            </el-col>
          </el-row>

          <div style="margin-top: 30px">
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
            style="margin-bottom: 20px"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Search, User, Document, Star } from '@element-plus/icons-vue';
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

<style scoped lang="scss">
.student-assessment {
  padding: var(--spacing-lg);

  .search-bar {
    margin-bottom: 20px;
  }

  .students-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: var(--spacing-lg);
    margin-top: 20px;

    .student-card {
      background: #fff;
      border-radius: 12px;
      padding: var(--spacing-lg);
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      transition: all 0.3s;
      cursor: pointer;
      position: relative;

      &:hover {
        box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.15);
        transform: translateY(-4px);
      }

      &.focus {
        border: 2px solid #E6A23C;

        .focus-tag {
          position: absolute;
          top: 10px;
          right: 10px;
        }
      }

      .student-header {
        display: flex;
        align-items: center;
        margin-bottom: 20px;

        .student-info {
          margin-left: 15px;
          flex: 1;

          h4 {
            margin: 0 0 5px 0;
            font-size: var(--text-lg);
            font-weight: bold;
          }

          p {
            margin: 3px 0;
            font-size: var(--text-sm);
            color: #909399;

            &.class-name {
              color: #409EFF;
            }
          }
        }
      }

      .assessment-summary {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin-bottom: 15px;

        .stat-item {
          text-align: center;
          padding: 10px;
          background: #f5f7fa;
          border-radius: 8px;

          .stat-label {
            font-size: var(--text-xs);
            color: #909399;
            margin-bottom: 5px;
          }

          .stat-value {
            font-size: var(--text-lg);
            font-weight: bold;

            &.primary {
              color: #409EFF;
            }

            &.success {
              color: #67C23A;
            }

            &.info {
              font-size: var(--text-xs);
              color: #909399;
              font-weight: normal;
            }
          }
        }
      }

      .focus-reason {
        background: #fef0f0;
        padding: 10px;
        border-radius: 8px;
        margin-bottom: 15px;

        p {
          margin: 5px 0;
          font-size: var(--text-sm);

          .warning-score {
            color: #F56C6C;
            font-weight: bold;
          }
        }
      }

      .card-actions {
        display: flex;
        gap: 10px;
        justify-content: center;
      }
    }
  }

  .stat-box {
    display: flex;
    align-items: center;
    padding: var(--spacing-lg);
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .stat-icon {
      width: 50px;
      height: 50px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;

      .el-icon {
        font-size: var(--text-2xl);
        color: #fff;
      }

      &.primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      &.success {
        background: linear-gradient(135deg, #67C23A 0%, #5daf34 100%);
      }

      &.warning {
        background: linear-gradient(135deg, #E6A23C 0%, #cf9236 100%);
      }
    }

    .stat-content {
      flex: 1;

      .stat-number {
        font-size: var(--text-3xl);
        font-weight: bold;
        color: #303133;
        margin-bottom: 5px;
      }

      .stat-title {
        font-size: var(--text-sm);
        color: #909399;
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .student-assessment {
    padding: 10px;

    .students-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>











