<template>
  <div class="records-management-tab">
    <!-- 筛选区域 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>

        <el-form-item label="考勤状态">
          <el-select v-model="filterForm.status" placeholder="全部" clearable>
            <el-option label="出勤" value="PRESENT" />
            <el-option label="缺勤" value="ABSENT" />
            <el-option label="迟到" value="LATE" />
            <el-option label="早退" value="EARLY_LEAVE" />
            <el-option label="病假" value="SICK_LEAVE" />
            <el-option label="事假" value="PERSONAL_LEAVE" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="loadRecords">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 记录列表 -->
    <el-card shadow="never">
      <div class="table-wrapper">
<el-table class="responsive-table" :data="recordsList" border stripe v-loading="loading">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="studentName" label="学生姓名" width="100" />
        <el-table-column prop="className" label="班级" width="120" />
        <el-table-column prop="attendanceDate" label="日期" width="120" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="checkInTime" label="签到时间" width="100" />
        <el-table-column prop="checkOutTime" label="签退时间" width="100" />
        <el-table-column prop="temperature" label="体温" width="80" />
        <el-table-column prop="notes" label="备注" width="180" show-overflow-tooltip />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
</div>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadRecords"
        @current-change="loadRecords"
        style="margin-top: var(--text-lg); justify-content: flex-end"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  getAllRecords,
  deleteRecord,
  type AttendanceRecord,
} from '@/api/modules/attendance-center';

const props = defineProps<{
  kindergartenId: number;
}>();

const emit = defineEmits<{
  refresh: [];
}>();

const loading = ref(false);

const filterForm = reactive({
  dateRange: [new Date(), new Date()],
  status: '',
});

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
});

const recordsList = ref<AttendanceRecord[]>([]);

const loadRecords = async () => {
  loading.value = true;
  try {
    const response = await getAllRecords({
      kindergartenId: props.kindergartenId,
      startDate: filterForm.dateRange[0].toISOString().split('T')[0],
      endDate: filterForm.dateRange[1].toISOString().split('T')[0],
      status: filterForm.status as any,
      page: pagination.page,
      pageSize: pagination.pageSize,
    });

    if (response.success && response.data) {
      recordsList.value = response.data.rows;
      pagination.total = response.data.count;
    }
  } catch (error) {
    console.error('加载记录失败:', error);
    ElMessage.error('加载记录失败');
  } finally {
    loading.value = false;
  }
};

const resetFilter = () => {
  filterForm.dateRange = [new Date(), new Date()];
  filterForm.status = '';
  pagination.page = 1;
  loadRecords();
};

const handleEdit = (row: AttendanceRecord) => {
  ElMessage.info('编辑功能待实现');
};

const handleDelete = async (row: AttendanceRecord) => {
  try {
    await ElMessageBox.confirm('确定要删除这条考勤记录吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    const response = await deleteRecord(row.id);
    if (response.success) {
      ElMessage.success('删除成功');
      loadRecords();
      emit('refresh');
    }
  } catch (error) {
    // 用户取消
  }
};

const getStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    PRESENT: 'success',
    ABSENT: 'danger',
    LATE: 'warning',
    EARLY_LEAVE: 'warning',
    SICK_LEAVE: 'info',
    PERSONAL_LEAVE: 'info',
  };
  return typeMap[status] || '';
};

const getStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    PRESENT: '出勤',
    ABSENT: '缺勤',
    LATE: '迟到',
    EARLY_LEAVE: '早退',
    SICK_LEAVE: '病假',
    PERSONAL_LEAVE: '事假',
  };
  return labelMap[status] || status;
};

onMounted(() => {
  loadRecords();
});
</script>

<style scoped lang="scss">
.records-management-tab {
  .filter-card {
    margin-bottom: var(--text-2xl);
  }
}
</style>

