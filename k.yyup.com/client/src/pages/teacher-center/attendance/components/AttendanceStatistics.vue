<template>
  <div class="attendance-statistics-tab">
    <!-- 筛选区域 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="统计类型">
          <el-radio-group v-model="filterForm.type" @change="loadStatistics">
            <el-radio-button label="teacher">教师个人</el-radio-button>
            <el-radio-button label="class">班级学生</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="班级" v-if="filterForm.type === 'class'">
          <el-select
            v-model="filterForm.classId"
            placeholder="请选择班级"
            @change="loadStatistics"
            style="max-width: 200px; width: 100%"
          >
            <el-option
              v-for="cls in classList"
              :key="cls.id"
              :label="cls.name"
              :value="cls.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="loadStatistics"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 教师个人统计 -->
    <div v-if="filterForm.type === 'teacher'">
      <!-- 统计卡片 -->
      <el-row :gutter="16" class="stats-row">
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon stat-days">
                <UnifiedIcon name="default" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ teacherStats.attendanceDays }}</div>
                <div class="stat-label">出勤天数</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon stat-late">
                <UnifiedIcon name="default" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ teacherStats.lateCount }}</div>
                <div class="stat-label">迟到次数</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon stat-early">
                <UnifiedIcon name="default" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ teacherStats.earlyLeaveCount }}</div>
                <div class="stat-label">早退次数</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon stat-rate">
                <UnifiedIcon name="default" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ teacherStats.attendanceRate }}%</div>
                <div class="stat-label">出勤率</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 出勤趋势图 -->
      <el-card class="chart-card" shadow="never">
        <template #header>
          <span class="card-title">出勤趋势</span>
        </template>
        <div ref="teacherTrendChart" style="min-min-height: 60px; height: auto; height: auto"></div>
      </el-card>
    </div>

    <!-- 班级学生统计 -->
    <div v-if="filterForm.type === 'class'">
      <!-- 班级统计卡片 -->
      <el-row :gutter="16" class="stats-row">
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon stat-total">
                <UnifiedIcon name="default" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ classStats.totalStudents }}</div>
                <div class="stat-label">班级人数</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon stat-present">
                <UnifiedIcon name="Check" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ classStats.avgAttendance }}</div>
                <div class="stat-label">平均出勤</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon stat-rate">
                <UnifiedIcon name="default" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ classStats.attendanceRate }}%</div>
                <div class="stat-label">出勤率</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon stat-abnormal">
                <UnifiedIcon name="default" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ classStats.abnormalCount }}</div>
                <div class="stat-label">异常次数</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 学生出勤排行 -->
      <el-card class="ranking-card" shadow="never">
        <template #header>
          <span class="card-title">学生出勤排行</span>
        </template>
        <div class="table-wrapper">
<el-table class="responsive-table" :data="studentRanking" border stripe>
          <el-table-column type="index" label="排名" width="80" align="center" />
          <el-table-column prop="studentName" label="学生姓名" width="120" />
          <el-table-column prop="attendanceDays" label="出勤天数" width="100" align="center" />
          <el-table-column prop="absentDays" label="缺勤天数" width="100" align="center" />
          <el-table-column prop="lateCount" label="迟到次数" width="100" align="center" />
          <el-table-column prop="attendanceRate" label="出勤率" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.attendanceRate >= 90 ? 'success' : row.attendanceRate >= 80 ? 'warning' : 'danger'">
                {{ row.attendanceRate }}%
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="notes" label="备注" min-width="150" />
        </el-table>
</div>
      </el-card>

      <!-- 异常学生列表 -->
      <el-card class="abnormal-card" shadow="never">
        <template #header>
          <span class="card-title">异常学生列表</span>
        </template>
        <el-table class="responsive-table" :data="abnormalStudents" border stripe>
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="studentName" label="学生姓名" width="120" />
          <el-table-column prop="abnormalType" label="异常类型" width="120">
            <template #default="{ row }">
              <el-tag :type="row.abnormalType === 'FREQUENT_ABSENT' ? 'danger' : 'warning'">
                {{ row.abnormalType === 'FREQUENT_ABSENT' ? '频繁缺勤' : '体温异常' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="count" label="次数" width="80" align="center" />
          <el-table-column prop="lastDate" label="最近日期" width="120" />
          <el-table-column prop="notes" label="备注" min-width="200" />
        </el-table>
      </el-card>

      <!-- 班级出勤趋势图 -->
      <el-card class="chart-card" shadow="never">
        <template #header>
          <span class="card-title">班级出勤趋势</span>
        </template>
        <div ref="classTrendChart" style="min-height: 60px; height: auto"></div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Calendar,
  Warning,
  Clock,
  TrendCharts,
  User,
  CircleCheck,
  WarnTriangleFilled,
} from '@element-plus/icons-vue';
import { getTeacherClasses, type ClassInfo } from '@/api/modules/attendance';

// ==================== 数据定义 ====================

const emit = defineEmits<{
  refresh: [];
}>();

const filterForm = reactive({
  type: 'teacher' as 'teacher' | 'class',
  classId: null as number | null,
  dateRange: [new Date(new Date().setDate(new Date().getDate() - 30)), new Date()] as Date[],
});

const classList = ref<ClassInfo[]>([]);

// 教师统计数据
const teacherStats = ref({
  attendanceDays: 0,
  lateCount: 0,
  earlyLeaveCount: 0,
  attendanceRate: 0,
});

// 班级统计数据
const classStats = ref({
  totalStudents: 0,
  avgAttendance: 0,
  attendanceRate: 0,
  abnormalCount: 0,
});

// 学生排行
const studentRanking = ref<any[]>([]);

// 异常学生
const abnormalStudents = ref<any[]>([]);

// 图表引用
const teacherTrendChart = ref();
const classTrendChart = ref();

// ==================== 方法 ====================

// 加载班级列表
const loadClasses = async () => {
  try {
    const response = await getTeacherClasses();
    if (response.success && response.data) {
      classList.value = response.data;
      if (classList.value.length > 0) {
        filterForm.classId = classList.value[0].id;
      }
    }
  } catch (error) {
    console.error('加载班级列表失败:', error);
    ElMessage.error('加载班级列表失败');
  }
};

// 加载统计数据
const loadStatistics = async () => {
  if (filterForm.type === 'teacher') {
    await loadTeacherStatistics();
  } else {
    await loadClassStatistics();
  }
};

// 加载教师统计
const loadTeacherStatistics = async () => {
  try {
    // TODO: 调用API加载教师统计数据
    // Mock数据
    teacherStats.value = {
      attendanceDays: 22,
      lateCount: 2,
      earlyLeaveCount: 1,
      attendanceRate: 95.5,
    };
  } catch (error) {
    console.error('加载教师统计失败:', error);
    ElMessage.error('加载教师统计失败');
  }
};

// 加载班级统计
const loadClassStatistics = async () => {
  try {
    // TODO: 调用API加载班级统计数据
    // Mock数据
    classStats.value = {
      totalStudents: 30,
      avgAttendance: 28,
      attendanceRate: 93.3,
      abnormalCount: 5,
    };

    studentRanking.value = [];
    abnormalStudents.value = [];
  } catch (error) {
    console.error('加载班级统计失败:', error);
    ElMessage.error('加载班级统计失败');
  }
};

// ==================== 生命周期 ====================

onMounted(() => {
  loadClasses();
  loadStatistics();
});
</script>

<style scoped lang="scss">
.attendance-statistics-tab {
  .filter-card {
    margin-bottom: var(--text-2xl);
  }

  .stats-row {
    margin-bottom: var(--text-2xl);

    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        gap: var(--text-lg);

        .stat-icon {
          width: auto;
          height: 60px;
          border-radius: var(--text-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;

          &.stat-days {
            background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
          }

          &.stat-late {
            background: var(--gradient-pink);
          }

          &.stat-early {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          }

          &.stat-rate {
            background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
          }

          &.stat-total {
            background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
          }

          &.stat-present {
            background: var(--gradient-pink);
          }

          &.stat-abnormal {
            background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
          }
        }

        .stat-info {
          flex: 1;

          .stat-value {
            font-size: var(--text-3xl);
            font-weight: 600;
            margin-bottom: var(--spacing-xs);
          }

          .stat-label {
            font-size: var(--text-base);
            color: var(--info-color);
          }
        }
      }
    }
  }

  .card-title {
    font-size: var(--text-lg);
    font-weight: 600;
  }

  .chart-card,
  .ranking-card,
  .abnormal-card {
    margin-bottom: var(--text-2xl);
  }
}
</style>

