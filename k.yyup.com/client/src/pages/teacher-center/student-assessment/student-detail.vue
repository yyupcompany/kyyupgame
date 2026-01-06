<template>
  <div class="student-detail">
    <el-page-header @back="goBack" title="返回">
      <template #content>
        <span class="page-title">学生测评详情</span>
      </template>
    </el-page-header>

    <div v-if="studentDetail" v-loading="loading" class="detail-content">
      <!-- 学生基本信息 -->
      <el-card class="info-card" shadow="hover">
        <div class="student-profile">
          <el-avatar :size="80" :src="studentDetail.student.avatar || '/default-avatar.png'">
            {{ studentDetail.student.name.charAt(0) }}
          </el-avatar>
          <div class="profile-info">
            <h2>{{ studentDetail.student.name }}</h2>
            <el-descriptions :column="3" border>
              <el-descriptions-item label="年龄">
                {{ studentDetail.student.age }}岁
              </el-descriptions-item>
              <el-descriptions-item label="性别">
                {{ studentDetail.student.gender === 'male' ? '男' : '女' }}
              </el-descriptions-item>
              <el-descriptions-item label="班级">
                {{ studentDetail.student.className }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
      </el-card>

      <!-- 成长趋势图 -->
      <el-card class="chart-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>成长趋势图</span>
          </div>
        </template>
        <GrowthChart :history="studentDetail.assessmentHistory" />
      </el-card>

      <!-- 最新维度雷达图 -->
      <el-card class="chart-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>最新五大维度评分</span>
          </div>
        </template>
        <DimensionRadar
          v-if="studentDetail.latestDimensions"
          :dimension-scores="studentDetail.latestDimensions"
        />
      </el-card>

      <!-- 测评历史记录 -->
      <el-card class="history-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>测评历史记录</span>
          </div>
        </template>
        <el-timeline>
          <el-timeline-item
            v-for="record in studentDetail.assessmentHistory"
            :key="record.id"
            :timestamp="formatDate(record.createdAt)"
            placement="top"
          >
            <el-card>
              <h4>{{ getAssessmentTypeName(record.type) }}</h4>
              <p><strong>总分：</strong><span class="score-value">{{ record.totalScore }}</span></p>
              <div class="dimension-scores">
                <el-tag v-for="(value, key) in record.dimensionScores" :key="key" class="dimension-tag">
                  {{ getDimensionName(key) }}: {{ value }}
                </el-tag>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </el-card>

      <!-- 教师备注 -->
      <el-card class="notes-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>教师备注</span>
            <el-button type="primary" @click="showNoteDialog = true">
              <el-icon><Plus /></el-icon>
              添加备注
            </el-button>
          </div>
        </template>
        <div class="notes-list">
          <div
            v-for="note in studentDetail.teacherNotes"
            :key="note.id"
            class="note-item"
          >
            <div class="note-header">
              <span class="note-teacher">{{ note.teacherName }}</span>
              <span class="note-date">{{ formatDate(note.createdAt) }}</span>
            </div>
            <div class="note-content">{{ note.content }}</div>
          </div>
          <el-empty
            v-if="studentDetail.teacherNotes.length === 0"
            description="暂无备注"
          />
        </div>
      </el-card>
    </div>

    <!-- 添加备注对话框 -->
    <el-dialog
      v-model="showNoteDialog"
      title="添加教师备注"
      width="600px"
      @close="resetNoteForm"
    >
      <el-form :model="noteForm" label-width="100px">
        <el-form-item label="备注内容">
          <el-input
            v-model="noteForm.content"
            type="textarea"
            :rows="6"
            placeholder="请输入观察记录或指导建议..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showNoteDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitNote">
          提交
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import dayjs from 'dayjs';
import {
  getStudentAssessmentDetail,
  addTeacherNote,
  type StudentAssessmentDetail,
} from '@/api/modules/teacher-assessment';
import DimensionRadar from '@/pages/assessment-analytics/components/DimensionRadar.vue';
import GrowthChart from './components/GrowthChart.vue';

const router = useRouter();
const route = useRoute();

const loading = ref(false);
const submitting = ref(false);
const studentDetail = ref<StudentAssessmentDetail | null>(null);
const showNoteDialog = ref(false);

const noteForm = ref({
  content: '',
});

/**
 * 加载学生详情
 */
const loadStudentDetail = async () => {
  loading.value = true;
  try {
    const studentId = Number(route.params.id);
    const response = await getStudentAssessmentDetail(studentId);
    
    if (response.success) {
      studentDetail.value = response.data;
    } else {
      ElMessage.error(response.message || '加载学生详情失败');
    }
  } catch (error: any) {
    console.error('加载学生详情失败:', error);
    ElMessage.error(error.message || '加载学生详情失败');
  } finally {
    loading.value = false;
  }
};

/**
 * 提交备注
 */
const submitNote = async () => {
  if (!noteForm.value.content.trim()) {
    ElMessage.warning('请输入备注内容');
    return;
  }

  submitting.value = true;
  try {
    const studentId = Number(route.params.id);
    const latestRecordId = studentDetail.value?.assessmentHistory[0]?.id || 0;

    const response = await addTeacherNote({
      studentId,
      recordId: latestRecordId,
      content: noteForm.value.content,
    });

    if (response.success) {
      ElMessage.success('备注添加成功');
      showNoteDialog.value = false;
      resetNoteForm();
      loadStudentDetail(); // 重新加载数据
    } else {
      ElMessage.error(response.message || '添加备注失败');
    }
  } catch (error: any) {
    console.error('添加备注失败:', error);
    ElMessage.error(error.message || '添加备注失败');
  } finally {
    submitting.value = false;
  }
};

/**
 * 重置备注表单
 */
const resetNoteForm = () => {
  noteForm.value.content = '';
};

/**
 * 返回上一页
 */
const goBack = () => {
  router.back();
};

/**
 * 获取测评类型名称
 */
const getAssessmentTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    'school-readiness': '入学准备',
    'development': '发展测评',
    'physical': '体能测评',
    'cognitive': '认知测评',
  };
  return typeMap[type] || type;
};

/**
 * 获取维度名称
 */
const getDimensionName = (key: string) => {
  const nameMap: Record<string, string> = {
    cognitive: '认知',
    physical: '身体',
    social: '社交',
    emotional: '情感',
    language: '语言',
  };
  return nameMap[key] || key;
};

/**
 * 格式化日期
 */
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm');
};

onMounted(() => {
  loadStudentDetail();
});
</script>

<style scoped lang="scss">
.student-detail {
  padding: var(--spacing-lg);

  .page-title {
    font-size: var(--text-lg);
    font-weight: bold;
  }

  .detail-content {
    margin-top: 20px;

    .info-card {
      margin-bottom: 20px;

      .student-profile {
        display: flex;
        align-items: center;
        gap: var(--spacing-lg);

        .profile-info {
          flex: 1;

          h2 {
            margin: 0 0 15px 0;
          }
        }
      }
    }

    .chart-card {
      margin-bottom: 20px;

      .card-header {
        font-weight: bold;
        font-size: var(--text-base);
      }

      :deep(.el-card__body) {
        min-height: 300px;
      }
    }

    .history-card {
      margin-bottom: 20px;

      .card-header {
        font-weight: bold;
        font-size: var(--text-base);
      }

      .score-value {
        font-weight: bold;
        color: #409EFF;
        font-size: var(--text-lg);
      }

      .dimension-scores {
        margin-top: 10px;

        .dimension-tag {
          margin-right: 10px;
          margin-bottom: 5px;
        }
      }
    }

    .notes-card {
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: bold;
        font-size: var(--text-base);
      }

      .notes-list {
        .note-item {
          padding: 15px;
          background: #f5f7fa;
          border-radius: 8px;
          margin-bottom: 15px;

          .note-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: var(--text-sm);

            .note-teacher {
              font-weight: bold;
              color: #409EFF;
            }

            .note-date {
              color: #909399;
            }
          }

          .note-content {
            line-height: 1.6;
            color: #606266;
          }
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .student-detail {
    padding: 10px;

    .info-card .student-profile {
      flex-direction: column;
      text-align: center;
    }
  }
}
</style>











