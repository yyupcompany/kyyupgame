<template>
  <div class="class-statistics-tab">
    <el-card shadow="never" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span class="card-title">班级统计</span>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="loadStatistics"
          />
        </div>
      </template>

      <div class="table-wrapper">
<el-table class="responsive-table" :data="classList" border stripe>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="className" label="班级名称" width="150" />
        <el-table-column prop="totalStudents" label="总人数" width="100" align="center" />
        <el-table-column prop="presentCount" label="出勤" width="100" align="center" />
        <el-table-column prop="absentCount" label="缺勤" width="100" align="center" />
        <el-table-column prop="lateCount" label="迟到" width="100" align="center" />
        <el-table-column prop="earlyLeaveCount" label="早退" width="100" align="center" />
        <el-table-column prop="sickLeaveCount" label="病假" width="100" align="center" />
        <el-table-column prop="personalLeaveCount" label="事假" width="100" align="center" />
        <el-table-column label="出勤率" width="120" align="center">
          <template #default="{ row }">
            <el-progress
              :percentage="row.attendanceRate"
              :color="getProgressColor(row.attendanceRate)"
            />
          </template>
        </el-table-column>
      </el-table>
</div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getStatisticsByClass } from '@/api/modules/attendance-center';

const props = defineProps<{
  kindergartenId: number;
}>();

const loading = ref(false);
const dateRange = ref([new Date(), new Date()]);
const classList = ref<any[]>([]);

const loadStatistics = async () => {
  loading.value = true;
  try {
    const response = await getStatisticsByClass({
      kindergartenId: props.kindergartenId,
      startDate: dateRange.value[0].toISOString().split('T')[0],
      endDate: dateRange.value[1].toISOString().split('T')[0],
    });

    if (response.success && response.data) {
      // 后端返回的数据结构: { data: { classStatistics: [] } }
      // 需要提取 classStatistics 数组
      classList.value = response.data.classStatistics || [];
    }
  } catch (error) {
    console.error('加载班级统计失败:', error);
    ElMessage.error('加载班级统计失败');
  } finally {
    loading.value = false;
  }
};

const getProgressColor = (percentage: number) => {
  if (percentage >= 95) return 'var(--success-color)';
  if (percentage >= 85) return 'var(--warning-color)';
  return 'var(--danger-color)';
};

onMounted(() => {
  loadStatistics();
});
</script>

<style scoped lang="scss">
.class-statistics-tab {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .card-title {
      font-size: var(--text-lg);
      font-weight: 600;
    }
  }
}
</style>

