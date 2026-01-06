<template>
  <div class="health-monitoring-tab">
    <el-row :gutter="16">
      <!-- 体温异常 -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span class="card-title">体温异常记录</span>
          </template>
          <div class="table-wrapper">
<el-table class="responsive-table" :data="healthData.abnormalTemperature" max-height="400">
            <el-table-column prop="studentName" label="姓名" width="100" />
            <el-table-column prop="className" label="班级" width="120" />
            <el-table-column prop="temperature" label="体温(°C)" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getTemperatureType(row.temperature)">
                  {{ row.temperature }}°C
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="date" label="日期" width="120" />
          </el-table>
</div>
        </el-card>
      </el-col>

      <!-- 病假统计 -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span class="card-title">病假统计</span>
          </template>
          <el-table class="responsive-table" :data="healthData.sickLeaveStats" max-height="400">
            <el-table-column prop="studentName" label="姓名" width="100" />
            <el-table-column prop="className" label="班级" width="120" />
            <el-table-column prop="sickLeaveDays" label="病假天数" width="100" align="center">
              <template #default="{ row }">
                <el-tag type="info">{{ row.sickLeaveDays }}天</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="lastSickLeaveDate" label="最近病假" width="120" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getHealthMonitoring, type HealthMonitoring } from '@/api/modules/attendance-center';

const props = defineProps<{
  kindergartenId: number;
}>();

const healthData = ref<HealthMonitoring>({
  abnormalTemperature: [],
  sickLeaveStats: [],
});

const loadHealthData = async () => {
  try {
    const response = await getHealthMonitoring({
      kindergartenId: props.kindergartenId,
    });

    if (response.success && response.data) {
      healthData.value = response.data;
    }
  } catch (error) {
    console.error('加载健康监测失败:', error);
    ElMessage.error('加载健康监测失败');
  }
};

const getTemperatureType = (temp: number) => {
  if (temp >= 38.5) return 'danger';
  if (temp >= 37.3) return 'warning';
  return 'success';
};

onMounted(() => {
  loadHealthData();
});
</script>

<style scoped lang="scss">
.health-monitoring-tab {
  .card-title {
    font-size: var(--text-lg);
    font-weight: 600;
  }
}
</style>

