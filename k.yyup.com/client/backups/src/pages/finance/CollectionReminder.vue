<template>
  <div class="collection-reminder-page">
    <div class="page-header">
      <h1>催缴管理</h1>
      <p>管理逾期费用催缴和提醒</p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card>
          <el-statistic title="逾期总数" :value="stats.overdueCount">
            <template #suffix>笔</template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="逾期金额" :value="formatMoney(stats.overdueAmount)">
            <template #prefix>¥</template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="已催缴" :value="stats.remindedCount">
            <template #suffix>笔</template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="催缴成功率" :value="stats.successRate">
            <template #suffix>%</template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选区域 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filters">
        <el-form-item label="学生姓名">
          <el-input v-model="filters.studentName" placeholder="输入学生姓名" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="逾期天数">
          <el-select v-model="filters.overdueDays" placeholder="选择逾期天数" clearable style="width: 150px">
            <el-option label="1-7天" value="1-7" />
            <el-option label="8-15天" value="8-15" />
            <el-option label="16-30天" value="16-30" />
            <el-option label="30天以上" value="30+" />
          </el-select>
        </el-form-item>
        <el-form-item label="催缴状态">
          <el-select v-model="filters.reminderStatus" placeholder="选择状态" clearable style="width: 150px">
            <el-option label="未催缴" value="not_reminded" />
            <el-option label="已催缴" value="reminded" />
            <el-option label="已缴费" value="paid" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadOverdueList">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="resetFilters">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 逾期列表 -->
    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <span>逾期费用列表</span>
          <div class="header-actions">
            <el-button type="warning" @click="handleBatchRemind" :disabled="selectedIds.length === 0">
              <el-icon><Bell /></el-icon>
              批量催缴
            </el-button>
            <el-button type="primary" @click="showReminderSettingsDialog = true">
              <el-icon><Setting /></el-icon>
              催缴设置
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="overdueList"
        @selection-change="handleSelectionChange"
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="studentName" label="学生姓名" width="120" />
        <el-table-column prop="className" label="班级" width="120" />
        <el-table-column prop="feeItem" label="费用项目" width="150" />
        <el-table-column prop="overdueAmount" label="逾期金额" width="120">
          <template #default="{ row }">
            ¥{{ formatMoney(row.overdueAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="overdueDays" label="逾期天数" width="100">
          <template #default="{ row }">
            <el-tag :type="getOverdueDaysType(row.overdueDays)">
              {{ row.overdueDays }}天
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reminderCount" label="催缴次数" width="100" />
        <el-table-column prop="lastReminderTime" label="最后催缴时间" width="180">
          <template #default="{ row }">
            {{ row.lastReminderTime ? formatDate(row.lastReminderTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="warning"
              size="small"
              @click="handleRemind(row)"
            >
              发送催缴
            </el-button>
            <el-button
              type="info"
              size="small"
              @click="handleViewHistory(row)"
            >
              催缴记录
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 催缴设置对话框 -->
    <el-dialog
      v-model="showReminderSettingsDialog"
      title="催缴设置"
      width="600px"
    >
      <el-form :model="reminderSettings" label-width="120px">
        <el-form-item label="自动催缴">
          <el-switch v-model="reminderSettings.autoRemind" />
          <span class="form-tip">开启后系统将自动发送催缴提醒</span>
        </el-form-item>
        <el-form-item label="催缴时间">
          <el-time-picker
            v-model="reminderSettings.reminderTime"
            placeholder="选择催缴时间"
            format="HH:mm"
          />
        </el-form-item>
        <el-form-item label="催缴间隔">
          <el-input-number v-model="reminderSettings.reminderInterval" :min="1" :max="30" />
          <span class="form-tip">天</span>
        </el-form-item>
        <el-form-item label="催缴方式">
          <el-checkbox-group v-model="reminderSettings.reminderMethods">
            <el-checkbox label="sms">短信</el-checkbox>
            <el-checkbox label="wechat">微信</el-checkbox>
            <el-checkbox label="app">APP推送</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="催缴模板">
          <el-input
            v-model="reminderSettings.reminderTemplate"
            type="textarea"
            :rows="4"
            placeholder="催缴消息模板，可使用变量：{studentName}、{amount}、{overdueDays}"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showReminderSettingsDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveSettings">
          保存设置
        </el-button>
      </template>
    </el-dialog>

    <!-- 催缴记录对话框 -->
    <el-dialog
      v-model="showHistoryDialog"
      title="催缴记录"
      width="800px"
    >
      <el-timeline>
        <el-timeline-item
          v-for="record in reminderHistory"
          :key="record.id"
          :timestamp="formatDate(record.reminderTime)"
          placement="top"
        >
          <el-card>
            <h4>{{ record.reminderMethod }} 催缴</h4>
            <p>催缴内容：{{ record.reminderContent }}</p>
            <p>发送状态：
              <el-tag :type="record.status === 'success' ? 'success' : 'danger'">
                {{ record.status === 'success' ? '发送成功' : '发送失败' }}
              </el-tag>
            </p>
          </el-card>
        </el-timeline-item>
      </el-timeline>

      <template #footer>
        <el-button @click="showHistoryDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Bell, Setting } from '@element-plus/icons-vue'
import { get, post, put } from '@/utils/request'

// 数据
const loading = ref(false)
const overdueList = ref([])
const selectedIds = ref<number[]>([])
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

const stats = ref({
  overdueCount: 0,
  overdueAmount: 0,
  remindedCount: 0,
  successRate: 0
})

const filters = ref({
  studentName: '',
  overdueDays: null,
  reminderStatus: null
})

const showReminderSettingsDialog = ref(false)
const showHistoryDialog = ref(false)
const reminderHistory = ref([])

const reminderSettings = ref({
  autoRemind: false,
  reminderTime: null,
  reminderInterval: 3,
  reminderMethods: ['sms'],
  reminderTemplate: '尊敬的{studentName}家长，您的孩子有{amount}元费用已逾期{overdueDays}天，请及时缴纳。'
})

// 方法
const loadOverdueList = async () => {
  try {
    loading.value = true
    const response = await get('/finance/overdue-bills', {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      ...filters.value
    })

    if (response.success) {
      overdueList.value = response.data.items || []
      pagination.value.total = response.data.total || 0
      stats.value = response.data.stats || stats.value
    }
  } catch (error) {
    console.error('加载逾期列表失败:', error)
    ElMessage.error('加载逾期列表失败')
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.value = {
    studentName: '',
    overdueDays: null,
    reminderStatus: null
  }
  loadOverdueList()
}

const handleSelectionChange = (selection: any[]) => {
  selectedIds.value = selection.map(item => item.id)
}

const handleRemind = async (bill: any) => {
  try {
    await ElMessageBox.confirm('确定发送催缴提醒吗？', '确认', { type: 'warning' })
    
    const response = await post('/finance/send-reminder', {
      billId: bill.id
    })
    
    if (response.success) {
      ElMessage.success('催缴提醒发送成功')
      loadOverdueList()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('发送失败')
    }
  }
}

const handleBatchRemind = async () => {
  try {
    await ElMessageBox.confirm(`确定向选中的 ${selectedIds.value.length} 位学生发送催缴提醒吗？`, '批量催缴', { type: 'warning' })
    
    const response = await post('/finance/batch-send-reminder', {
      billIds: selectedIds.value
    })
    
    if (response.success) {
      ElMessage.success('批量催缴提醒发送成功')
      loadOverdueList()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('发送失败')
    }
  }
}

const handleViewHistory = async (bill: any) => {
  try {
    const response = await get(`/finance/reminder-history/${bill.id}`)
    if (response.success) {
      reminderHistory.value = response.data || []
      showHistoryDialog.value = true
    }
  } catch (error) {
    console.error('加载催缴记录失败:', error)
    ElMessage.error('加载催缴记录失败')
  }
}

const handleSaveSettings = async () => {
  try {
    const response = await put('/finance/reminder-settings', reminderSettings.value)
    if (response.success) {
      ElMessage.success('设置保存成功')
      showReminderSettingsDialog.value = false
    }
  } catch (error) {
    console.error('保存设置失败:', error)
    ElMessage.error('保存设置失败')
  }
}

const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
  loadOverdueList()
}

const handlePageChange = (page: number) => {
  pagination.value.page = page
  loadOverdueList()
}

const getOverdueDaysType = (days: number) => {
  if (days <= 7) return 'warning'
  if (days <= 15) return 'danger'
  return 'danger'
}

const formatMoney = (amount: number) => {
  return amount?.toFixed(2) || '0.00'
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

onMounted(() => {
  loadOverdueList()
})
</script>

<style scoped lang="scss">
.collection-reminder-page {
  padding: var(--text-3xl);

  .page-header {
    margin-bottom: var(--text-3xl);

    h1 {
      margin: 0 0 var(--spacing-sm) 0;
      font-size: var(--text-3xl);
      font-weight: 600;
      color: var(--text-primary);
    }

    p {
      margin: 0;
      font-size: var(--text-base);
      color: var(--info-color);
    }
  }

  .stats-row {
    margin-bottom: var(--text-lg);
  }

  .filter-card {
    margin-bottom: var(--text-lg);
  }

  .list-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-actions {
        display: flex;
        gap: var(--spacing-sm);
      }
    }
  }

  .pagination-container {
    margin-top: var(--text-2xl);
    display: flex;
    justify-content: flex-end;
  }

  .form-tip {
    margin-left: var(--spacing-sm);
    font-size: var(--text-sm);
    color: var(--info-color);
  }
}
</style>

