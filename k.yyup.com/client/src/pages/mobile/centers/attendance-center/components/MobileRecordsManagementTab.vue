<template>
  <div class="mobile-records-management-tab">
    <!-- 搜索和筛选 -->
    <van-card class="filter-card">
      <van-cell-group inset>
        <van-field
          v-model="searchKeyword"
          placeholder="搜索学生姓名或班级"
          left-icon="search"
          @input="handleSearch"
        />
        <van-field
          v-model="filterText"
          readonly
          label="筛选条件"
          placeholder="选择筛选条件"
          @click="showFilterPopup = true"
        />
      </van-cell-group>
    </van-card>

    <!-- 快速操作 -->
    <van-card class="actions-card">
      <template #title>
        <span class="card-title">快速操作</span>
      </template>

      <van-grid :column-num="3" :border="false">
        <van-grid-item @click="showAddRecord = true">
          <div class="action-item">
            <van-icon name="plus" size="24" />
            <span class="action-text">添加记录</span>
          </div>
        </van-grid-item>
        <van-grid-item @click="batchImport">
          <div class="action-item">
            <van-icon name="down" size="24" />
            <span class="action-text">批量导入</span>
          </div>
        </van-grid-item>
        <van-grid-item @click="showBatchEdit = true">
          <div class="action-item">
            <van-icon name="edit" size="24" />
            <span class="action-text">批量编辑</span>
          </div>
        </van-grid-item>
      </van-grid>
    </van-card>

    <!-- 考勤记录列表 -->
    <van-card class="records-card">
      <template #title>
        <div class="records-header">
          <span class="card-title">考勤记录</span>
          <span class="records-count">共{{ totalCount }}条</span>
        </div>
      </template>

      <div class="records-list">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="loadRecords"
        >
          <van-card
            v-for="record in records"
            :key="record.id"
            class="record-item"
            :class="{ 'selected': selectedRecords.includes(record.id) }"
            @click="toggleSelectRecord(record.id)"
          >
            <template #title>
              <div class="record-header">
                <div class="student-info">
                  <span class="student-name">{{ record.studentName }}</span>
                  <van-tag
                    :type="getStatusTagType(record.status)"
                    size="small"
                  >
                    {{ getStatusText(record.status) }}
                  </van-tag>
                </div>
                <van-checkbox
                  :model-value="selectedRecords.includes(record.id)"
                  @click.stop
                  @change="(checked) => toggleSelectRecord(record.id)"
                />
              </div>
            </template>

            <template #desc>
              <div class="record-details">
                <van-row gutter="12">
                  <van-col span="8">
                    <div class="detail-item">
                      <span class="label">班级</span>
                      <span class="value">{{ record.className }}</span>
                    </div>
                  </van-col>
                  <van-col span="8">
                    <div class="detail-item">
                      <span class="label">日期</span>
                      <span class="value">{{ formatDate(record.attendanceDate) }}</span>
                    </div>
                  </van-col>
                  <van-col span="8">
                    <div class="detail-item">
                      <span class="label">体温</span>
                      <span class="value">{{ record.temperature || '--' }}°C</span>
                    </div>
                  </van-col>
                </van-row>

                <van-row gutter="12" style="margin-top: 8px">
                  <van-col span="8">
                    <div class="detail-item">
                      <span class="label">签到</span>
                      <span class="value">{{ record.checkInTime || '--' }}</span>
                    </div>
                  </van-col>
                  <van-col span="8">
                    <div class="detail-item">
                      <span class="label">签退</span>
                      <span class="value">{{ record.checkOutTime || '--' }}</span>
                    </div>
                  </van-col>
                  <van-col span="8">
                    <div class="detail-item">
                      <span class="label">健康状态</span>
                      <span class="value">{{ record.healthStatus || '正常' }}</span>
                    </div>
                  </van-col>
                </van-row>

                <div v-if="record.notes" class="record-notes">
                  <span class="notes-label">备注:</span>
                  <span class="notes-content">{{ record.notes }}</span>
                </div>

                <div class="record-actions">
                  <van-button
                    size="mini"
                    type="primary"
                    plain
                    @click.stop="editRecord(record)"
                  >
                    编辑
                  </van-button>
                  <van-button
                    size="mini"
                    type="danger"
                    plain
                    @click.stop="deleteRecord(record)"
                  >
                    删除
                  </van-button>
                  <van-button
                    size="mini"
                    type="success"
                    plain
                    @click.stop="viewRecordDetail(record)"
                  >
                    详情
                  </van-button>
                </div>
              </div>
            </template>
          </van-card>
        </van-list>
      </div>

      <van-empty v-if="!loading && records.length === 0" description="暂无考勤记录" />
    </van-card>

    <!-- 批量操作栏 -->
    <div v-if="selectedRecords.length > 0" class="batch-actions">
      <van-row gutter="12">
        <van-col span="8">
          <van-button
            type="danger"
            block
            @click="batchDelete"
          >
            删除 ({{ selectedRecords.length }})
          </van-button>
        </van-col>
        <van-col span="8">
          <van-button
            type="primary"
            block
            @click="batchExport"
          >
            导出
          </van-button>
        </van-col>
        <van-col span="8">
          <van-button
            type="default"
            block
            @click="clearSelection"
          >
            取消选择
          </van-button>
        </van-col>
      </van-row>
    </div>

    <!-- 筛选弹窗 -->
    <van-popup v-model:show="showFilterPopup" position="bottom" :style="{ height: '70%' }">
      <div class="filter-popup">
        <div class="popup-header">
          <van-button plain @click="resetFilter">重置</van-button>
          <span class="popup-title">筛选条件</span>
          <van-button type="primary" @click="applyFilter">确定</van-button>
        </div>
        <div class="popup-content">
          <van-cell-group inset title="考勤状态">
            <van-checkbox-group v-model="tempFilter.status">
              <van-cell title="出勤" clickable @click="toggleStatusFilter('present')">
                <template #right-icon>
                  <van-checkbox name="present" />
                </template>
              </van-cell>
              <van-cell title="缺勤" clickable @click="toggleStatusFilter('absent')">
                <template #right-icon>
                  <van-checkbox name="absent" />
                </template>
              </van-cell>
              <van-cell title="迟到" clickable @click="toggleStatusFilter('late')">
                <template #right-icon>
                  <van-checkbox name="late" />
                </template>
              </van-cell>
              <van-cell title="早退" clickable @click="toggleStatusFilter('early')">
                <template #right-icon>
                  <van-checkbox name="early" />
                </template>
              </van-cell>
            </van-checkbox-group>
          </van-cell-group>

          <van-cell-group inset title="时间范围">
            <van-field
              v-model="tempFilter.startDate"
              readonly
              label="开始日期"
              placeholder="选择开始日期"
              @click="showStartDatePicker = true"
            />
            <van-field
              v-model="tempFilter.endDate"
              readonly
              label="结束日期"
              placeholder="选择结束日期"
              @click="showEndDatePicker = true"
            />
          </van-cell-group>

          <van-cell-group inset title="班级筛选">
            <van-field
              v-model="tempFilter.className"
              label="班级名称"
              placeholder="输入班级名称"
            />
          </van-cell-group>
        </div>
      </div>
    </van-popup>

    <!-- 日期选择器 -->
    <van-popup v-model:show="showStartDatePicker" position="bottom">
      <van-date-picker
        v-model="tempStartDate"
        @confirm="onStartDateConfirm"
        @cancel="showStartDatePicker = false"
        :max-date="tempEndDate || new Date()"
        title="选择开始日期"
      />
    </van-popup>

    <van-popup v-model:show="showEndDatePicker" position="bottom">
      <van-date-picker
        v-model="tempEndDate"
        @confirm="onEndDateConfirm"
        @cancel="showEndDatePicker = false"
        :min-date="tempStartDate"
        :max-date="new Date()"
        title="选择结束日期"
      />
    </van-popup>

    <!-- 添加/编辑记录弹窗 -->
    <van-popup v-model:show="showAddRecord" position="bottom" :style="{ height: '80%' }">
      <div class="record-form-popup">
        <div class="popup-header">
          <van-button plain @click="showAddRecord = false">取消</van-button>
          <span class="popup-title">添加考勤记录</span>
          <van-button type="primary" @click="saveRecord">保存</van-button>
        </div>
        <div class="popup-content">
          <van-form ref="recordForm">
            <van-cell-group inset>
              <van-field
                v-model="recordForm.studentName"
                label="学生姓名"
                placeholder="请输入学生姓名"
                required
              />
              <van-field
                v-model="recordForm.className"
                label="班级"
                placeholder="请选择班级"
                readonly
                @click="showClassPicker = true"
              />
              <van-field
                v-model="recordForm.attendanceDate"
                label="考勤日期"
                placeholder="选择日期"
                readonly
                @click="showAttendanceDatePicker = true"
              />
              <van-field
                v-model="recordForm.status"
                label="考勤状态"
                placeholder="选择状态"
                readonly
                @click="showStatusPicker = true"
              />
              <van-field
                v-model="recordForm.checkInTime"
                label="签到时间"
                placeholder="选择时间"
                readonly
                @click="showCheckInTimePicker = true"
              />
              <van-field
                v-model="recordForm.checkOutTime"
                label="签退时间"
                placeholder="选择时间"
                readonly
                @click="showCheckOutTimePicker = true"
              />
              <van-field
                v-model.number="recordForm.temperature"
                label="体温"
                placeholder="请输入体温"
                type="number"
              />
              <van-field
                v-model="recordForm.healthStatus"
                label="健康状态"
                placeholder="请输入健康状态"
              />
              <van-field
                v-model="recordForm.notes"
                label="备注"
                placeholder="请输入备注"
                type="textarea"
                rows="3"
              />
            </van-cell-group>
          </van-form>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { showToast, showLoadingToast, closeToast, showConfirmDialog } from 'vant'
import {
  getAllRecords,
  updateRecord,
  deleteRecord,
  type AttendanceRecord,
} from '@/api/modules/attendance-center'

interface Props {
  kindergartenId: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  refresh: []
}>()

// 响应式数据
const loading = ref(false)
const finished = ref(false)
const records = ref<AttendanceRecord[]>([])
const selectedRecords = ref<number[]>([])
const totalCount = ref(0)
const currentPage = ref(1)
const pageSize = 10

// 搜索和筛选
const searchKeyword = ref('')
const filterText = ref('选择筛选条件')
const showFilterPopup = ref(false)
const tempFilter = reactive({
  status: [] as string[],
  startDate: '',
  endDate: '',
  className: '',
})
const currentFilter = reactive({ ...tempFilter })

// 表单相关
const showAddRecord = ref(false)
const showBatchEdit = ref(false)
const editingRecord = ref<AttendanceRecord | null>(null)
const recordForm = reactive({
  studentName: '',
  className: '',
  attendanceDate: '',
  status: '',
  checkInTime: '',
  checkOutTime: '',
  temperature: null as number | null,
  healthStatus: '',
  notes: '',
})

// 日期选择器
const showStartDatePicker = ref(false)
const showEndDatePicker = ref(false)
const showAttendanceDatePicker = ref(false)
const showCheckInTimePicker = ref(false)
const showCheckOutTimePicker = ref(false)
const showClassPicker = ref(false)
const showStatusPicker = ref(false)
const tempStartDate = ref(new Date())
const tempEndDate = ref(new Date())

// 计算属性
const hasSelectedRecords = computed(() => selectedRecords.value.length > 0)

// 方法
const loadRecords = async () => {
  if (finished.value) return

  try {
    loading.value = true
    const params: any = {
      kindergartenId: props.kindergartenId,
      page: currentPage.value,
      pageSize: pageSize,
    }

    // 应用筛选条件
    if (currentFilter.status.length > 0) {
      params.status = currentFilter.status.join(',')
    }
    if (currentFilter.startDate) {
      params.startDate = currentFilter.startDate
    }
    if (currentFilter.endDate) {
      params.endDate = currentFilter.endDate
    }
    if (currentFilter.className) {
      params.className = currentFilter.className
    }
    if (searchKeyword.value) {
      params.keyword = searchKeyword.value
    }

    const response = await getAllRecords(params)

    if (response.success && response.data) {
      if (currentPage.value === 1) {
        records.value = response.data.rows
      } else {
        records.value.push(...response.data.rows)
      }
      totalCount.value = response.data.count
      finished.value = records.value.length >= totalCount.value
      currentPage.value++
    }
  } catch (error) {
    console.error('加载考勤记录失败:', error)
    showToast('加载考勤记录失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  finished.value = false
  records.value = []
  loadRecords()
}

const toggleSelectRecord = (recordId: number) => {
  const index = selectedRecords.value.indexOf(recordId)
  if (index > -1) {
    selectedRecords.value.splice(index, 1)
  } else {
    selectedRecords.value.push(recordId)
  }
}

const clearSelection = () => {
  selectedRecords.value = []
}

const getStatusTagType = (status: string) => {
  switch (status) {
    case 'present': return 'success'
    case 'absent': return 'danger'
    case 'late': return 'warning'
    case 'early': return 'primary'
    default: return 'default'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'present': return '出勤'
    case 'absent': return '缺勤'
    case 'late': return '迟到'
    case 'early': return '早退'
    default: return '未知'
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const editRecord = (record: AttendanceRecord) => {
  editingRecord.value = record
  Object.assign(recordForm, {
    studentName: record.studentName,
    className: record.className,
    attendanceDate: record.attendanceDate,
    status: record.status,
    checkInTime: record.checkInTime,
    checkOutTime: record.checkOutTime,
    temperature: record.temperature,
    healthStatus: record.healthStatus,
    notes: record.notes,
  })
  showAddRecord.value = true
}

const deleteRecord = async (record: AttendanceRecord) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: `确定要删除${record.studentName}的考勤记录吗？`,
    })

    const response = await deleteRecord(record.id)
    if (response.success) {
      showToast('删除成功')
      // 重新加载记录
      currentPage.value = 1
      finished.value = false
      records.value = []
      loadRecords()
      emit('refresh')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除记录失败:', error)
      showToast('删除失败')
    }
  }
}

const viewRecordDetail = (record: AttendanceRecord) => {
  // TODO: 实现查看记录详情
  showToast(`查看${record.studentName}的详情`)
}

const batchDelete = async () => {
  try {
    await showConfirmDialog({
      title: '批量删除',
      message: `确定要删除选中的${selectedRecords.value.length}条记录吗？`,
    })

    showLoadingToast({ message: '删除中...', forbidClick: true })

    // TODO: 实现批量删除API调用
    // const response = await batchDeleteRecords(selectedRecords.value)

    showToast('批量删除成功')
    selectedRecords.value = []
    currentPage.value = 1
    finished.value = false
    records.value = []
    loadRecords()
    emit('refresh')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      showToast('批量删除失败')
    }
  } finally {
    closeToast()
  }
}

const batchExport = () => {
  showToast(`导出${selectedRecords.value.length}条记录`)
  // TODO: 实现批量导出功能
}

const batchImport = () => {
  showToast('打开批量导入')
  // TODO: 实现批量导入功能
}

const saveRecord = async () => {
  try {
    showLoadingToast({ message: '保存中...', forbidClick: true })

    if (editingRecord.value) {
      // 编辑现有记录
      const response = await updateRecord(editingRecord.value.id, recordForm)
      if (response.success) {
        showToast('修改成功')
      }
    } else {
      // 添加新记录
      // TODO: 实现添加记录API
      showToast('添加成功')
    }

    showAddRecord.value = false
    currentPage.value = 1
    finished.value = false
    records.value = []
    loadRecords()
    emit('refresh')
  } catch (error) {
    console.error('保存记录失败:', error)
    showToast('保存失败')
  } finally {
    closeToast()
  }
}

const toggleStatusFilter = (status: string) => {
  const index = tempFilter.status.indexOf(status)
  if (index > -1) {
    tempFilter.status.splice(index, 1)
  } else {
    tempFilter.status.push(status)
  }
}

const resetFilter = () => {
  tempFilter.status = []
  tempFilter.startDate = ''
  tempFilter.endDate = ''
  tempFilter.className = ''
  tempStartDate.value = new Date()
  tempEndDate.value = new Date()
}

const applyFilter = () => {
  Object.assign(currentFilter, tempFilter)
  filterText.value = getFilterText()
  showFilterPopup.value = false
  currentPage.value = 1
  finished.value = false
  records.value = []
  loadRecords()
}

const getFilterText = () => {
  const parts = []
  if (currentFilter.status.length > 0) {
    parts.push(`状态(${currentFilter.status.length})`)
  }
  if (currentFilter.startDate || currentFilter.endDate) {
    parts.push('时间范围')
  }
  if (currentFilter.className) {
    parts.push('班级')
  }
  return parts.length > 0 ? parts.join(', ') : '选择筛选条件'
}

const onStartDateConfirm = () => {
  tempFilter.startDate = tempStartDate.value.toISOString().split('T')[0]
  showStartDatePicker.value = false
}

const onEndDateConfirm = () => {
  tempFilter.endDate = tempEndDate.value.toISOString().split('T')[0]
  showEndDatePicker.value = false
}

// 生命周期
onMounted(() => {
  loadRecords()
})
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';

.mobile-records-management-tab {
  padding-bottom: 80px;

  .filter-card,
  .actions-card,
  .records-card {
    margin: 0 0 12px 0;

    :deep(.van-card__header) {
      padding: var(--spacing-md) 16px 0;
    }

    :deep(.van-card__content) {
      padding: 0 16px 16px;
    }

    .card-title {
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--van-text-color);
    }
  }

  .actions-card {
    .action-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--spacing-md);
      border-radius: 8px;
      background: var(--van-background-color);

      .van-icon {
        color: var(--van-primary-color);
        margin-bottom: 8px;
      }

      .action-text {
        font-size: var(--text-xs);
        color: var(--van-text-color);
      }
    }
  }

  .records-card {
    .records-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;

      .records-count {
        font-size: var(--text-xs);
        color: var(--van-text-color-2);
      }
    }

    .records-list {
      .record-item {
        margin: 0 0 8px 0;
        border: 1px solid var(--van-border-color);
        border-radius: 8px;
        transition: all 0.3s;

        &.selected {
          border-color: var(--van-primary-color);
          background: var(--van-primary-color-light);
        }

        .record-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;

          .student-info {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);

            .student-name {
              font-size: var(--text-base);
              font-weight: 600;
              color: var(--van-text-color);
            }
          }
        }

        .record-details {
          .detail-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: var(--spacing-sm);
            background: var(--van-background-color);
            border-radius: 6px;

            .label {
              font-size: 11px;
              color: var(--van-text-color-2);
              margin-bottom: 4px;
            }

            .value {
              font-size: var(--text-sm);
              font-weight: 500;
              color: var(--van-text-color);
            }
          }

          .record-notes {
            margin-top: 8px;
            padding: var(--spacing-sm);
            background: var(--van-background-color-light);
            border-radius: 6px;
            font-size: var(--text-xs);

            .notes-label {
              color: var(--van-text-color-2);
              margin-right: 4px;
            }

            .notes-content {
              color: var(--van-text-color);
            }
          }

          .record-actions {
            display: flex;
            gap: var(--spacing-sm);
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid var(--van-border-color);

            .van-button {
              flex: 1;
            }
          }
        }
      }
    }
  }

  .batch-actions {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--card-bg);
    padding: var(--spacing-md);
    border-top: 1px solid var(--van-border-color);
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    z-index: 100;
  }

  .filter-popup {
    height: 100%;
    display: flex;
    flex-direction: column;

    .popup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md);
      border-bottom: 1px solid var(--van-border-color);

      .popup-title {
        font-size: var(--text-base);
        font-weight: 600;
        color: var(--van-text-color);
      }
    }

    .popup-content {
      flex: 1;
      overflow-y: auto;
      padding: var(--spacing-md) 0;
    }
  }

  .record-form-popup {
    height: 100%;
    display: flex;
    flex-direction: column;

    .popup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md);
      border-bottom: 1px solid var(--van-border-color);

      .popup-title {
        font-size: var(--text-base);
        font-weight: 600;
        color: var(--van-text-color);
      }
    }

    .popup-content {
      flex: 1;
      overflow-y: auto;
      padding: var(--spacing-md) 0;
    }
  }
}
</style>