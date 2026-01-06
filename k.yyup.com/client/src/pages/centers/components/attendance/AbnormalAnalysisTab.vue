<template>
  <div class="abnormal-analysis-tab">
    <el-row :gutter="16">
      <!-- 连续缺勤 -->
      <el-col :span="8">
        <el-card shadow="never">
          <template #header>
            <span class="card-title">连续缺勤学生</span>
          </template>
          <div class="table-wrapper">
<el-table class="responsive-table" :data="abnormalData.consecutiveAbsent" max-height="400">
            <el-table-column prop="studentName" label="姓名" width="100" />
            <el-table-column prop="className" label="班级" width="100" />
            <el-table-column prop="consecutiveDays" label="连续天数" width="80" align="center">
              <template #default="{ row }">
                <el-tag type="danger">{{ row.consecutiveDays }}天</el-tag>
              </template>
            </el-table-column>
          </el-table>
</div>
        </el-card>
      </el-col>

      <!-- 频繁迟到 -->
      <el-col :span="8">
        <el-card shadow="never">
          <template #header>
            <span class="card-title">频繁迟到学生</span>
          </template>
          <el-table class="responsive-table" :data="abnormalData.frequentLate" max-height="400">
            <el-table-column prop="studentName" label="姓名" width="100" />
            <el-table-column prop="className" label="班级" width="100" />
            <el-table-column prop="lateCount" label="迟到次数" width="80" align="center">
              <template #default="{ row }">
                <el-tag type="warning">{{ row.lateCount }}次</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 频繁早退 -->
      <el-col :span="8">
        <el-card shadow="never">
          <template #header>
            <span class="card-title">频繁早退学生</span>
          </template>
          <el-table class="responsive-table" :data="abnormalData.frequentEarlyLeave" max-height="400">
            <el-table-column prop="studentName" label="姓名" width="100" />
            <el-table-column prop="className" label="班级" width="100" />
            <el-table-column prop="earlyLeaveCount" label="早退次数" width="80" align="center">
              <template #default="{ row }">
                <el-tag type="warning">{{ row.earlyLeaveCount }}次</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getAbnormalAnalysis, type AbnormalAnalysis } from '@/api/modules/attendance-center';

const props = defineProps<{
  kindergartenId: number;
}>();

const abnormalData = ref<AbnormalAnalysis>({
  consecutiveAbsent: [],
  frequentLate: [],
  frequentEarlyLeave: [],
});

const loadAbnormalData = async () => {
  try {
    const response = await getAbnormalAnalysis({
      kindergartenId: props.kindergartenId,
    });

    if (response.success && response.data) {
      abnormalData.value = response.data;
    }
  } catch (error) {
    console.error('加载异常分析失败:', error);
    ElMessage.error('加载异常分析失败');
  }
};

onMounted(() => {
  loadAbnormalData();
});
</script>

<style scoped lang="scss">
.abnormal-analysis-tab {
  .card-title {
    font-size: var(--text-lg);
    font-weight: 600;
  }
}
</style>

