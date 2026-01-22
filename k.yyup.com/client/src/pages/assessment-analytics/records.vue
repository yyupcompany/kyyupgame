<template>
  <div class="assessment-records">
    <el-card shadow="hover">
      <!-- 搜索筛选区 -->
      <div class="filter-section">
        <el-form :model="filters" label-width="100px">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :lg="6">
              <el-form-item label="关键词">
                <el-input
                  v-model="filters.keyword"
                  placeholder="搜索学生姓名"
                  clearable
                  @clear="handleSearch"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :lg="6">
              <el-form-item label="测评类型">
                <el-select
                  v-model="filters.assessmentType"
                  placeholder="选择类型"
                  multiple
                  collapse-tags
                  clearable
                >
                  <el-option label="入学准备" value="school-readiness" />
                  <el-option label="发展测评" value="development" />
                  <el-option label="体能测评" value="physical" />
                  <el-option label="认知测评" value="cognitive" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :lg="6">
              <el-form-item label="时间范围">
                <el-date-picker
                  v-model="dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12" :lg="6">
              <el-form-item label=" " label-width="10px">
                <el-button type="primary" @click="handleSearch">
                  <el-icon><Search /></el-icon>
                  搜索
                </el-button>
                <el-button @click="handleReset">
                  <el-icon><RefreshRight /></el-icon>
                  重置
                </el-button>
              </el-form-item>
            </el-col>
          </el-row>
          
          <!-- 高级筛选 -->
          <el-collapse v-model="activeCollapse">
            <el-collapse-item title="高级筛选" name="advanced">
              <el-row :gutter="20">
                <el-col :xs="24" :sm="12" :lg="6">
                  <el-form-item label="分数区间">
                    <el-slider
                      v-model="scoreRange"
                      range
                      :min="0"
                      :max="100"
                      :marks="{ 0: '0', 50: '50', 100: '100' }"
                    />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12" :lg="6">
                  <el-form-item label="年龄范围">
                    <el-slider
                      v-model="ageRange"
                      range
                      :min="2"
                      :max="7"
                      :marks="{ 2: '2岁', 7: '7岁' }"
                    />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12" :lg="6">
                  <el-form-item label="状态">
                    <el-select v-model="filters.status" placeholder="选择状态" clearable>
                      <el-option label="已完成" value="completed" />
                      <el-option label="进行中" value="in_progress" />
                      <el-option label="待开始" value="pending" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-collapse-item>
          </el-collapse>
        </el-form>
      </div>

      <!-- 操作按钮区 -->
      <div class="action-section">
        <el-button type="primary" @click="handleExport">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </div>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="recordsList"
        stripe
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="studentName" label="学生姓名" width="120" fixed />
        <el-table-column prop="age" label="年龄" width="80">
          <template #default="{ row }">
            {{ row.age }}岁
          </template>
        </el-table-column>
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="{ row }">
            {{ row.gender === 'male' ? '男' : '女' }}
          </template>
        </el-table-column>
        <el-table-column prop="assessmentType" label="测评类型" width="120">
          <template #default="{ row }">
            <el-tag>{{ getAssessmentTypeName(row.assessmentType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="totalScore" label="总分" width="100" sortable>
          <template #default="{ row }">
            <span class="score-value">{{ row.totalScore }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="dq" label="发育商" width="100" sortable>
          <template #default="{ row }">
            <el-tag :type="getDQType(row.dq)">{{ row.dq }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="测评时间" width="180" sortable>
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewDetail(row)">
              查看详情
            </el-button>
            <el-button type="success" link @click="viewReport(row)">
              查看报告
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination
          v-model:current-page="filters.page"
          v-model:page-size="filters.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSearch"
          @current-change="handleSearch"
        />
      </div>
    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      title="测评记录详情"
      width="800px"
      destroy-on-close
    >
      <div v-if="currentRecord" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="学生姓名">
            {{ currentRecord.studentName }}
          </el-descriptions-item>
          <el-descriptions-item label="年龄">
            {{ currentRecord.age }}岁
          </el-descriptions-item>
          <el-descriptions-item label="性别">
            {{ currentRecord.gender === 'male' ? '男' : '女' }}
          </el-descriptions-item>
          <el-descriptions-item label="测评类型">
            {{ getAssessmentTypeName(currentRecord.assessmentType) }}
          </el-descriptions-item>
          <el-descriptions-item label="总分">
            <span class="score-value">{{ currentRecord.totalScore }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="发育商">
            <el-tag :type="getDQType(currentRecord.dq)">{{ currentRecord.dq }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="测评时间" :span="2">
            {{ formatDate(currentRecord.createdAt) }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 维度得分 -->
        <h4 style="margin-top: 20px">五大维度得分</h4>
        <el-row :gutter="20">
          <el-col :span="12">
            <DimensionRadar
              v-if="currentRecord.dimensionScores"
              :dimension-scores="currentRecord.dimensionScores"
            />
          </el-col>
          <el-col :span="12">
            <div class="dimension-list">
              <div class="dimension-item">
                <span>认知发展：</span>
                <el-progress
                  :percentage="currentRecord.dimensionScores?.cognitive || 0"
                  :color="'#5470c6'"
                />
              </div>
              <div class="dimension-item">
                <span>身体发展：</span>
                <el-progress
                  :percentage="currentRecord.dimensionScores?.physical || 0"
                  :color="'#91cc75'"
                />
              </div>
              <div class="dimension-item">
                <span>社交发展：</span>
                <el-progress
                  :percentage="currentRecord.dimensionScores?.social || 0"
                  :color="'#fac858'"
                />
              </div>
              <div class="dimension-item">
                <span>情感发展：</span>
                <el-progress
                  :percentage="currentRecord.dimensionScores?.emotional || 0"
                  :color="'#ee6666'"
                />
              </div>
              <div class="dimension-item">
                <span>语言发展：</span>
                <el-progress
                  :percentage="currentRecord.dimensionScores?.language || 0"
                  :color="'#73c0de'"
                />
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Search, RefreshRight, Download } from '@element-plus/icons-vue';
import dayjs from 'dayjs';
import {
  getAssessmentRecords,
  getAssessmentRecordDetail,
  exportAssessmentData,
  type RecordFilters,
} from '@/api/modules/assessment-analytics';
import DimensionRadar from './components/DimensionRadar.vue';

const loading = ref(false);
const recordsList = ref<any[]>([]);
const total = ref(0);
const detailVisible = ref(false);
const currentRecord = ref<any>(null);
const activeCollapse = ref<string[]>([]);

const dateRange = ref<[string, string]>(['', '']);
const scoreRange = ref<[number, number]>([0, 100]);
const ageRange = ref<[number, number]>([2, 7]);

const filters = reactive<RecordFilters>({
  keyword: '',
  assessmentType: [],
  startDate: '',
  endDate: '',
  minScore: 0,
  maxScore: 100,
  minAge: 2,
  maxAge: 7,
  status: '',
  page: 1,
  pageSize: 20,
});

/**
 * 加载记录列表
 */
const loadRecords = async () => {
  loading.value = true;
  try {
    // 更新过滤条件
    if (dateRange.value && dateRange.value.length === 2) {
      filters.startDate = dateRange.value[0];
      filters.endDate = dateRange.value[1];
    }
    filters.minScore = scoreRange.value[0];
    filters.maxScore = scoreRange.value[1];
    filters.minAge = ageRange.value[0];
    filters.maxAge = ageRange.value[1];

    const response = await getAssessmentRecords(filters);
    if (response.success) {
      recordsList.value = response.data.records || [];
      total.value = response.data.total || 0;
    } else {
      ElMessage.error(response.message || '加载数据失败');
    }
  } catch (error: any) {
    console.error('加载测评记录失败:', error);
    ElMessage.error(error.message || '加载数据失败');
  } finally {
    loading.value = false;
  }
};

/**
 * 搜索
 */
const handleSearch = () => {
  filters.page = 1;
  loadRecords();
};

/**
 * 重置
 */
const handleReset = () => {
  filters.keyword = '';
  filters.assessmentType = [];
  filters.status = '';
  dateRange.value = ['', ''];
  scoreRange.value = [0, 100];
  ageRange.value = [2, 7];
  filters.page = 1;
  loadRecords();
};

/**
 * 查看详情
 */
const viewDetail = async (record: any) => {
  try {
    const response = await getAssessmentRecordDetail(record.id);
    if (response.success) {
      currentRecord.value = response.data;
      detailVisible.value = true;
    } else {
      ElMessage.error(response.message || '加载详情失败');
    }
  } catch (error: any) {
    console.error('加载详情失败:', error);
    ElMessage.error(error.message || '加载详情失败');
  }
};

/**
 * 查看报告
 */
const viewReport = (record: any) => {
  // 跳转到报告页面或打开报告预览
  window.open(`/assessment-analytics/reports?recordId=${record.id}`, '_blank');
};

/**
 * 导出数据
 */
const handleExport = async () => {
  try {
    ElMessage.info('功能开发中...');
    // const response = await exportAssessmentData({
    //   format: 'excel',
    //   recordIds: selectedRecords.value,
    // });
  } catch (error: any) {
    console.error('导出失败:', error);
    ElMessage.error(error.message || '导出失败');
  }
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
 * 获取DQ类型
 */
const getDQType = (dq: number) => {
  if (dq >= 85) return 'success';
  if (dq >= 75) return 'warning';
  return 'danger';
};

/**
 * 获取状态类型
 */
const getStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    completed: 'success',
    in_progress: 'warning',
    pending: 'info',
  };
  return typeMap[status] || '';
};

/**
 * 获取状态文本
 */
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    completed: '已完成',
    in_progress: '进行中',
    pending: '待开始',
  };
  return textMap[status] || status;
};

/**
 * 格式化日期
 */
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm');
};

onMounted(() => {
  loadRecords();
});
</script>

<style scoped lang="scss">
.assessment-records {
  padding: var(--spacing-lg);

  .filter-section {
    :deep(.el-form-item) {
      margin-bottom: 15px;
    }

    :deep(.el-date-editor) {
      width: 100%;
    }
  }

  .action-section {
    margin-top: 20px;
    text-align: right;
  }

  .score-value {
    font-weight: bold;
    color: #409EFF;
  }

  .pagination-section {
    margin-top: 20px;
    text-align: right;
  }

  .detail-content {
    .dimension-list {
      .dimension-item {
        margin-bottom: 20px;

        span {
          display: inline-block;
          width: 100px;
          font-weight: 500;
        }

        :deep(.el-progress) {
          display: inline-block;
          width: calc(100% - 110px);
          vertical-align: middle;
        }
      }
    }
  }
}
</style>
















