<template>
  <div class="mobile-schedule-builder">
    <!-- 头部工具栏 -->
    <div class="builder-header">
      <div class="header-title">
        <van-icon name="calendar-o" size="24" />
        <span>课程表构建器</span>
      </div>
      <van-button
        type="primary"
        size="small"
        @click="addScheduleItem"
        icon="plus"
      >
        添加课程
      </van-button>
    </div>

    <!-- 课程表显示模式切换 -->
    <div class="view-mode-selector">
      <van-tabs v-model:active="viewMode">
        <van-tab title="列表" name="list"></van-tab>
        <van-tab title="日历" name="calendar"></van-tab>
        <van-tab title="时间轴" name="timeline"></van-tab>
      </van-tabs>
    </div>

    <!-- 列表视图 -->
    <div v-if="viewMode === 'list'" class="list-view">
      <van-swipe-cell
        v-for="(item, index) in scheduleItems"
        :key="index"
        class="schedule-item"
      >
        <van-cell-group inset>
          <van-cell
            :title="getDayName(item.dayOfWeek)"
            :label="getTimeRange(item.startTime, item.endTime)"
            :value="item.curriculumName || '未选择课程'"
            is-link
            @click="editScheduleItem(index)"
          >
            <template #icon>
              <van-icon
                :name="getDayIcon(item.dayOfWeek)"
                size="20"
                :color="getDayColor(item.dayOfWeek)"
              />
            </template>
            <template #right-icon>
              <div class="item-info">
                <van-tag v-if="item.classroom" type="primary" size="small">
                  {{ item.classroom }}
                </van-tag>
                <van-tag v-if="item.notes" type="default" size="small">
                  备注
                </van-tag>
              </div>
            </template>
          </van-cell>
        </van-cell-group>

        <!-- 滑动操作按钮 -->
        <template #right>
          <van-button
            square
            type="danger"
            text="删除"
            @click="confirmDelete(index)"
          />
          <van-button
            square
            type="primary"
            text="编辑"
            @click="editScheduleItem(index)"
          />
        </template>
      </van-swipe-cell>

      <!-- 空状态 -->
      <van-empty
        v-if="scheduleItems.length === 0"
        image="default"
        description="还没有添加课程"
      >
        <van-button
          type="primary"
          size="small"
          @click="addScheduleItem"
          icon="plus"
        >
          添加第一节课
        </van-button>
      </van-empty>
    </div>

    <!-- 日历视图 -->
    <div v-if="viewMode === 'calendar'" class="calendar-view">
      <van-calendar
        v-model="currentDate"
        :show-confirm="false"
        :max-date="maxDate"
        :min-date="minDate"
        :formatter="calendarFormatter"
        @select="onDateSelect"
      />

      <!-- 选中日期的课程 -->
      <div v-if="selectedDateSchedule.length > 0" class="date-schedule">
        <van-cell-group inset>
          <van-cell
            v-for="item in selectedDateSchedule"
            :key="item.id"
            :title="item.curriculumName"
            :label="`${item.startTime} - ${item.endTime}`"
            @click="editScheduleItem(item.index)"
          >
            <template #icon>
              <van-icon name="clock-o" size="16" />
            </template>
          </van-cell>
        </van-cell-group>
      </div>
    </div>

    <!-- 时间轴视图 -->
    <div v-if="viewMode === 'timeline'" class="timeline-view">
      <div class="timeline-container">
        <div
          v-for="hour in timeRange"
          :key="hour"
          class="timeline-hour"
        >
          <div class="hour-label">{{ hour }}:00</div>
          <div class="hour-content">
            <div
              v-for="item in getScheduleByHour(hour)"
              :key="item.id"
              class="schedule-block"
              :style="{
                backgroundColor: getDayColor(item.dayOfWeek),
                height: getBlockHeight(item)
              }"
              @click="editScheduleItem(item.index)"
            >
              <div class="block-time">{{ item.startTime }} - {{ item.endTime }}</div>
              <div class="block-title">{{ item.curriculumName || '未命名课程' }}</div>
              <div v-if="item.classroom" class="block-room">{{ item.classroom }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑/添加课程弹窗 -->
    <van-popup
      v-model:show="showEditDialog"
      position="bottom"
      :style="{ height: '90vh', borderRadius: '20px 20px 0 0' }"
      closeable
      close-icon="cross"
      @close="resetEditForm"
    >
      <div class="edit-dialog">
        <div class="dialog-header">
          <h3>{{ editingIndex >= 0 ? '编辑课程' : '添加课程' }}</h3>
        </div>

        <div class="dialog-content">
          <!-- 星期选择 -->
          <van-cell-group inset>
            <van-field
              v-model="editForm.dayOfWeek"
              label="星期"
              placeholder="请选择星期"
              readonly
              is-link
              @click="showDayPicker = true"
            />
            <van-field
              v-model="editForm.startTime"
              label="开始时间"
              placeholder="请选择开始时间"
              readonly
              is-link
              @click="showStartTimePicker = true"
            />
            <van-field
              v-model="editForm.endTime"
              label="结束时间"
              placeholder="请选择结束时间"
              readonly
              is-link
              @click="showEndTimePicker = true"
            />
            <van-field
              v-model="editForm.curriculumName"
              label="课程名称"
              placeholder="请选择或输入课程名称"
              readonly
              is-link
              @click="showCurriculumPicker = true"
            />
            <van-field
              v-model="editForm.classroom"
              label="教室"
              placeholder="请输入教室"
            />
            <van-field
              v-model="editForm.notes"
              label="备注"
              type="textarea"
              placeholder="请输入备注信息"
              :autosize="{ minHeight: 60 }"
            />
          </van-cell-group>
        </div>

        <div class="dialog-actions">
          <van-button-group>
            <van-button
              type="default"
              @click="showEditDialog = false"
            >
              取消
            </van-button>
            <van-button
              type="primary"
              @click="saveScheduleItem"
              :loading="saving"
            >
              保存
            </van-button>
          </van-button-group>
        </div>
      </div>
    </van-popup>

    <!-- 选择器弹窗 -->
    <van-popup v-model:show="showDayPicker" position="bottom">
      <van-picker
        :columns="dayOptions"
        @confirm="onDayConfirm"
        @cancel="showDayPicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showStartTimePicker" position="bottom">
      <van-time-picker
        v-model="startTimeValue"
        @confirm="onStartTimeConfirm"
        @cancel="showStartTimePicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showEndTimePicker" position="bottom">
      <van-time-picker
        v-model="endTimeValue"
        @confirm="onEndTimeConfirm"
        @cancel="showEndTimePicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showCurriculumPicker" position="bottom">
      <van-picker
        :columns="curriculumOptions"
        @confirm="onCurriculumConfirm"
        @cancel="showCurriculumPicker = false"
        show-toolbar
      />
    </van-popup>

    <!-- 统计信息 -->
    <van-cell-group inset class="stats-section">
      <van-cell title="课程总数" :value="scheduleItems.length.toString()" />
      <van-cell title="本周课程" :value="thisWeekScheduleCount.toString()" />
      <van-cell title="涉及教室" :value="uniqueClassrooms.length.toString()" />
    </van-cell-group>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { showToast, showSuccessToast, showConfirmDialog } from 'vant'
import { request } from '@/utils/request'

interface ScheduleItem {
  id?: string
  dayOfWeek: number
  startTime: string
  endTime: string
  curriculumId?: string
  curriculumName?: string
  classroom: string
  notes: string
}

interface Curriculum {
  id: string
  name: string
  description?: string
}

interface Props {
  items?: ScheduleItem[]
}

interface Emits {
  (e: 'update:items', value: ScheduleItem[]): void
  (e: 'change', value: ScheduleItem[]): void
}

const props = withDefaults(defineProps<Props>(), {
  items: () => []
})

const emit = defineEmits<Emits>()

// 响应式数据
const viewMode = ref<'list' | 'calendar' | 'timeline'>('list')
const scheduleItems = ref<ScheduleItem[]>(props.items || [])
const curriculumList = ref<Curriculum[]>([])
const showEditDialog = ref(false)
const editingIndex = ref(-1)
const saving = ref(false)

// 选择器状态
const showDayPicker = ref(false)
const showStartTimePicker = ref(false)
const showEndTimePicker = ref(false)
const showCurriculumPicker = ref(false)

// 日历状态
const currentDate = ref(new Date())
const minDate = ref(new Date())
const maxDate = computed(() => {
  const date = new Date()
  date.setMonth(date.getMonth() + 3)
  return date
})

// 编辑表单
const editForm = ref<ScheduleItem>({
  dayOfWeek: 1,
  startTime: '09:00',
  endTime: '10:00',
  curriculumName: '',
  classroom: '',
  notes: ''
})

const startTimeValue = ref(['09', '00'])
const endTimeValue = ref(['10', '00'])

// 选项数据
const dayOptions = [
  { text: '周一', value: 1 },
  { text: '周二', value: 2 },
  { text: '周三', value: 3 },
  { text: '周四', value: 4 },
  { text: '周五', value: 5 },
  { text: '周六', value: 6 },
  { text: '周日', value: 0 }
]

const curriculumOptions = computed(() => {
  return curriculumList.value.map(item => ({
    text: item.name,
    value: item.id
  }))
})

// 计算属性
const thisWeekScheduleCount = computed(() => {
  return scheduleItems.value.filter(item => item.dayOfWeek >= 1 && item.dayOfWeek <= 5).length
})

const uniqueClassrooms = computed(() => {
  const classrooms = scheduleItems.value
    .map(item => item.classroom)
    .filter(room => room.trim() !== '')
  return [...new Set(classrooms)]
})

const selectedDateSchedule = computed(() => {
  const dayOfWeek = currentDate.value.getDay()
  return scheduleItems.value
    .map((item, index) => ({ ...item, index, id: item.id || `item-${index}` }))
    .filter(item => item.dayOfWeek === dayOfWeek)
})

const timeRange = computed(() => {
  return Array.from({ length: 14 }, (_, i) => i + 7) // 7:00 - 20:00
})

// 工具函数
function getDayName(dayOfWeek: number): string {
  const dayMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return dayMap[dayOfWeek] || ''
}

function getDayIcon(dayOfWeek: number): string {
  const iconMap = ['calendar-o', 'bookmark-o', 'clock-o', 'bulb-o', 'fire-o', 'star-o', 'like-o']
  return iconMap[dayOfWeek] || 'calendar-o'
}

function getDayColor(dayOfWeek: number): string {
  const colorMap = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff']
  return colorMap[dayOfWeek] || '#1989fa'
}

function getTimeRange(startTime: string, endTime: string): string {
  return `${startTime} - ${endTime}`
}

function getScheduleByHour(hour: number): any[] {
  return scheduleItems.value
    .map((item, index) => ({ ...item, index, id: item.id || `item-${index}` }))
    .filter(item => {
      const startHour = parseInt(item.startTime.split(':')[0])
      const endHour = parseInt(item.endTime.split(':')[0])
      return startHour <= hour && hour < endHour
    })
}

function getBlockHeight(item: ScheduleItem): string {
  const startMinutes = parseInt(item.startTime.split(':')[0]) * 60 + parseInt(item.startTime.split(':')[1])
  const endMinutes = parseInt(item.endTime.split(':')[0]) * 60 + parseInt(item.endTime.split(':')[1])
  const duration = (endMinutes - startMinutes) / 60
  return `${Math.max(duration * 40, 40)}px` // 最小高度40px
}

// 日历格式化
function calendarFormatter(day: any) {
  const dayOfWeek = day.date.getDay()
  const hasSchedule = scheduleItems.value.some(item => item.dayOfWeek === dayOfWeek)

  if (hasSchedule) {
    day.bottomInfo = '有课'
    day.className = 'schedule-day'
  }

  return day
}

// 事件处理
function onDateSelect(date: Date) {
  currentDate.value = date
}

function addScheduleItem() {
  editingIndex.value = -1
  editForm.value = {
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '10:00',
    curriculumName: '',
    classroom: '',
    notes: ''
  }
  startTimeValue.value = ['09', '00']
  endTimeValue.value = ['10', '00']
  showEditDialog.value = true
}

function editScheduleItem(index: number) {
  const item = scheduleItems.value[index]
  editingIndex.value = index
  editForm.value = { ...item }

  const startParts = item.startTime.split(':')
  const endParts = item.endTime.split(':')
  startTimeValue.value = [startParts[0], startParts[1]]
  endTimeValue.value = [endParts[0], endParts[1]]

  showEditDialog.value = true
}

async function saveScheduleItem() {
  try {
    saving.value = true

    // 验证表单
    if (!editForm.value.curriculumName?.trim()) {
      showToast('请选择课程名称')
      return
    }

    if (!editForm.value.startTime || !editForm.value.endTime) {
      showToast('请选择上课时间')
      return
    }

    const item: ScheduleItem = {
      ...editForm.value,
      id: editingIndex.value >= 0 ? scheduleItems.value[editingIndex.value].id : undefined
    }

    if (editingIndex.value >= 0) {
      scheduleItems.value[editingIndex.value] = item
    } else {
      scheduleItems.value.push(item)
    }

    emitUpdate()
    showEditDialog.value = false
    showSuccessToast(editingIndex.value >= 0 ? '课程已更新' : '课程已添加')
  } catch (error) {
    console.error('保存课程失败:', error)
    showToast('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

async function confirmDelete(index: number) {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: '确定要删除这个课程吗？',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      confirmButtonColor: '#ee0a24'
    })

    scheduleItems.value.splice(index, 1)
    emitUpdate()
    showSuccessToast('课程已删除')
  } catch {
    // 用户取消删除
  }
}

function resetEditForm() {
  editingIndex.value = -1
  editForm.value = {
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '10:00',
    curriculumName: '',
    classroom: '',
    notes: ''
  }
}

// 选择器确认事件
function onDayConfirm({ selectedValues }: any) {
  editForm.value.dayOfWeek = selectedValues[0]
  showDayPicker.value = false
}

function onStartTimeConfirm({ selectedValues }: any) {
  const [hour, minute] = selectedValues
  editForm.value.startTime = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
  showStartTimePicker.value = false
}

function onEndTimeConfirm({ selectedValues }: any) {
  const [hour, minute] = selectedValues
  editForm.value.endTime = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
  showEndTimePicker.value = false
}

function onCurriculumConfirm({ selectedOptions }: any) {
  const curriculum = curriculumList.value.find(c => c.id === selectedOptions[0]?.value)
  if (curriculum) {
    editForm.value.curriculumId = curriculum.id
    editForm.value.curriculumName = curriculum.name
  }
  showCurriculumPicker.value = false
}

function emitUpdate() {
  emit('update:items', scheduleItems.value)
  emit('change', scheduleItems.value)
}

// 获取课程列表
async function fetchAllCurriculums() {
  try {
    const response = await request.get('/teacher-center/creative-curriculum', {
      params: { limit: 100 }
    })

    if (response.data.code === 200 && response.data.data?.rows) {
      curriculumList.value = response.data.data.rows.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description
      }))
    }
  } catch (error) {
    console.error('获取课程列表失败:', error)
  }
}

// 监听props变化
watch(() => props.items, (newItems) => {
  scheduleItems.value = newItems || []
}, { deep: true })

// 组件挂载
onMounted(() => {
  fetchAllCurriculums()
})

// 暴露方法给父组件
defineExpose({
  addScheduleItem,
  scheduleItems: computed(() => scheduleItems.value)
})
</script>

<style scoped lang="scss">
.mobile-schedule-builder {
  padding: var(--van-padding-sm);
  background: var(--van-background-color);

  .builder-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--van-padding-md);
    background: var(--van-background-2);
    border-radius: var(--van-radius-lg);
    margin-bottom: var(--van-padding-md);

    .header-title {
      display: flex;
      align-items: center;
      gap: var(--van-padding-sm);
      font-size: var(--van-font-size-lg);
      font-weight: 600;
      color: var(--van-text-color-1);

      .van-icon {
        color: var(--van-primary-color);
      }
    }
  }

  .view-mode-selector {
    padding: var(--van-padding-sm) var(--van-padding-md);
    background: var(--van-background-2);
    border-radius: var(--van-radius-lg);
    margin-bottom: var(--van-padding-md);
  }

  .list-view {
    .schedule-item {
      margin-bottom: var(--van-padding-sm);

      .item-info {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs);
        align-items: flex-end;
      }
    }
  }

  .calendar-view {
    .van-calendar {
      margin-bottom: var(--van-padding-md);

      :deep(.schedule-day) {
        .van-calendar__day {
          background: var(--van-primary-color-light);
          color: var(--van-primary-color);
          font-weight: 600;
        }
      }
    }

    .date-schedule {
      margin-top: var(--van-padding-md);
    }
  }

  .timeline-view {
    .timeline-container {
      background: var(--van-background-2);
      border-radius: var(--van-radius-lg);
      padding: var(--van-padding-sm);
      max-height: 500px;
      overflow-y: auto;

      .timeline-hour {
        display: flex;
        border-bottom: 1px solid var(--van-border-color);
        min-height: 40px;

        &:last-child {
          border-bottom: none;
        }

        .hour-label {
          width: 60px;
          padding: var(--van-padding-xs);
          text-align: center;
          font-size: var(--van-font-size-xs);
          color: var(--van-text-color-2);
          border-right: 1px solid var(--van-border-color);
          flex-shrink: 0;
        }

        .hour-content {
          flex: 1;
          padding: 2px;
          position: relative;

          .schedule-block {
            position: relative;
            margin: 2px 4px;
            padding: var(--spacing-xs) 8px;
            border-radius: var(--van-radius-sm);
            color: white;
            font-size: var(--van-font-size-xs);
            cursor: pointer;
            overflow: hidden;
            transition: transform 0.2s ease;

            &:active {
              transform: scale(0.98);
            }

            .block-time {
              font-weight: 600;
              margin-bottom: 2px;
            }

            .block-title {
              margin-bottom: 2px;
            }

            .block-room {
              opacity: 0.8;
              font-size: 10px;
            }
          }
        }
      }
    }
  }

  .edit-dialog {
    height: 100%;
    display: flex;
    flex-direction: column;

    .dialog-header {
      padding: var(--van-padding-lg) var(--van-padding-md);
      border-bottom: 1px solid var(--van-border-color);

      h3 {
        margin: 0;
        text-align: center;
        font-size: var(--van-font-size-lg);
        font-weight: 600;
        color: var(--van-text-color-1);
      }
    }

    .dialog-content {
      flex: 1;
      overflow-y: auto;
      padding: var(--van-padding-sm);
    }

    .dialog-actions {
      padding: var(--van-padding-md);
      background: var(--van-background-2);
      border-top: 1px solid var(--van-border-color);

      :deep(.van-button-group) {
        display: flex;

        .van-button {
          flex: 1;
        }
      }
    }
  }

  .stats-section {
    margin-top: var(--van-padding-md);
  }
}

// 响应式适配
@media (max-width: var(--breakpoint-xs)) {
  .mobile-schedule-builder {
    padding: var(--van-padding-xs);

    .builder-header {
      padding: var(--van-padding-sm);

      .header-title {
        font-size: var(--van-font-size-md);
      }
    }

    .timeline-view {
      .timeline-container {
        .timeline-hour {
          .hour-label {
            width: 50px;
            font-size: 10px;
          }

          .hour-content {
            .schedule-block {
              margin: 1px 2px;
              padding: 2px 4px;

              .block-title {
                display: -webkit-box;
                -webkit-line-clamp: 1;
                -webkit-box-orient: vertical;
                overflow: hidden;
              }
            }
          }
        }
      }
    }
  }
}

// 深色主题适配
@media (prefers-color-scheme: dark) {
  .mobile-schedule-builder {
    background: var(--van-background-1);

    .builder-header,
    .view-mode-selector {
      background: var(--van-background-2);
    }

    .timeline-view {
      .timeline-container {
        background: var(--van-background-2);
      }
    }
  }
}
</style>