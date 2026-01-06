<template>
  <el-dialog
    v-model="dialogVisible"
    title="📅 检查计划时间调整"
    width="1400px"
    :close-on-click-modal="false"
    fullscreen
    class="timeline-editor-dialog"
  >
    <!-- 头部控制区 -->
    <div class="editor-header">
      <div class="header-left">
        <el-radio-group v-model="editorMode" size="large">
          <el-radio-button label="calendar">
            <UnifiedIcon name="default" />
            日历拖拽
          </el-radio-button>
          <el-radio-button label="list">
            <UnifiedIcon name="default" />
            列表编辑
          </el-radio-button>
        </el-radio-group>

        <el-tag v-if="changedPlans.length > 0" type="warning" size="large" style="margin-left: var(--text-lg);">
          <UnifiedIcon name="Edit" />
          已修改 {{ changedPlans.length }} 个计划
        </el-tag>
      </div>

      <div class="header-right">
        <el-button @click="resetChanges" :disabled="changedPlans.length === 0">
          重置更改
        </el-button>
      </div>
    </div>

    <!-- 日历拖拽模式 -->
    <div v-if="editorMode === 'calendar'" class="calendar-editor">
      <!-- 月份导航 -->
      <div class="month-navigator">
        <el-button @click="previousMonth" :icon="ArrowLeft">上月</el-button>
        <div class="current-month-label">
          <UnifiedIcon name="default" />
          <span>{{ currentYear }}年 {{ currentMonthName }}</span>
          <el-tag type="info" size="small">{{ currentMonthPlansCount }}个检查</el-tag>
        </div>
        <el-button @click="nextMonth">
          下月
          <UnifiedIcon name="ArrowRight" />
        </el-button>
      </div>

      <!-- 日历网格 -->
      <div class="calendar-grid">
        <!-- 星期标题 -->
        <div class="weekday-header">
          <div class="weekday">日</div>
          <div class="weekday">一</div>
          <div class="weekday">二</div>
          <div class="weekday">三</div>
          <div class="weekday">四</div>
          <div class="weekday">五</div>
          <div class="weekday">六</div>
        </div>

        <!-- 日历天数 -->
        <div class="calendar-body">
          <div
            v-for="day in calendarDays"
            :key="day.date"
            class="calendar-day"
            :class="{ 
              'current-month': day.isCurrentMonth,
              'today': day.isToday,
              'weekend': day.isWeekend,
              'has-plan': day.plans.length > 0,
              'drag-over': dragOverDate === day.date
            }"
            @drop="handleDrop($event, day)"
            @dragover="handleDragOver($event, day)"
            @dragleave="handleDragLeave"
          >
            <div class="day-number">{{ day.dayNumber }}</div>
            
            <!-- 检查计划卡片（可拖拽） -->
            <draggable
              v-model="day.plans"
              :group="{ name: 'plans', pull: true, put: true }"
              item-key="id"
              class="plans-container"
              @start="handleDragStart"
              @end="handleDragEnd"
              @change="(e) => handlePlanMove(e, day.date)"
            >
              <template #item="{ element: plan }">
                <div
                  class="plan-card"
                  :class="{ 
                    'dragging': draggingPlanId === plan.id,
                    'changed': isChanged(plan.id)
                  }"
                >
                  <div class="plan-header">
                    <UnifiedIcon name="ArrowRight" />
                    <span class="plan-name">{{ plan.inspectionType?.name }}</span>
                  </div>
                  <div class="plan-footer">
                    <el-tag :type="getStatusTagType(plan.status)" size="small">
                      {{ getStatusLabel(plan.status) }}
                    </el-tag>
                    <span v-if="isChanged(plan.id)" class="changed-badge">
                      <UnifiedIcon name="default" />
                      已修改
                    </span>
                  </div>
                </div>
              </template>
            </draggable>
          </div>
        </div>
      </div>

      <!-- 操作提示 -->
      <div class="operation-hint">
        <el-alert type="info" :closable="false">
          <template #title>
            💡 操作提示：拖拽检查计划卡片到新的日期即可调整时间。同一天可以有多个检查。
          </template>
        </el-alert>
      </div>
    </div>

    <!-- 列表编辑模式 -->
    <div v-else class="list-editor">
      <!-- 批量操作工具栏 -->
      <div class="batch-toolbar">
        <div class="batch-selection">
          <el-checkbox v-model="selectAll" @change="handleSelectAll">
            全选
          </el-checkbox>
          <span class="selected-info">
            已选择: <strong>{{ selectedPlansInList.length }}</strong> 个检查计划
          </span>
        </div>

        <div v-if="selectedPlansInList.length > 0" class="batch-actions">
          <el-divider direction="vertical" />
          
          <span>批量操作：</span>
          
          <el-input-number 
            v-model="batchDays" 
            :min="1" 
            :max="365"
            size="small"
            controls-position="right"
            style="max-width: 120px; width: 100%;"
          />
          
          <el-button 
            size="small" 
            type="primary"
            @click="batchDelay"
          >
            延后天数
          </el-button>
          
          <el-button 
            size="small" 
            type="primary"
            @click="batchAdvance"
          >
            提前天数
          </el-button>

          <el-divider direction="vertical" />
          
          <span>移到月份：</span>
          <el-select 
            v-model="batchTargetMonth" 
            placeholder="选择月份"
            size="small"
            style="max-width: 100px; width: 100%;"
          >
            <el-option 
              v-for="m in 12" 
              :key="m" 
              :label="`${m}月`" 
              :value="m"
            />
          </el-select>
          <el-button 
            size="small" 
            type="success"
            @click="batchMoveToMonth"
            :disabled="!batchTargetMonth"
          >
            应用
          </el-button>
        </div>
      </div>

      <!-- 树形列表 -->
      <div class="tree-container">
        <el-collapse v-model="activeMonths" accordion>
          <el-collapse-item
            v-for="month in 12"
            :key="month"
            :name="month"
          >
            <template #title>
              <div class="month-title">
                <el-checkbox 
                  :model-value="isMonthSelected(month)"
                  @change="(val) => handleMonthSelect(month, val)"
                  @click.stop
                />
                <span class="month-label">{{ month }}月</span>
                <el-tag size="small">{{ getMonthPlansCount(month) }}个检查</el-tag>
              </div>
            </template>

            <div class="month-plans">
              <div
                v-for="(plan, index) in getMonthPlans(month)"
                :key="plan.id"
                class="plan-item"
                :class="{ 'is-changed': isChanged(plan.id) }"
              >
                <div class="plan-checkbox">
                  <el-checkbox 
                    :model-value="isPlanSelected(plan.id)"
                    @change="(val) => handlePlanSelect(plan, val)"
                  />
                </div>

                <div class="plan-date-display">
                  <el-tag type="primary" size="small">{{ formatDate(plan.planDate) }}</el-tag>
                </div>

                <div class="plan-info">
                  <span class="plan-name">{{ plan.inspectionType?.name }}</span>
                  <el-tag :type="getStatusTagType(plan.status)" size="small">
                    {{ getStatusLabel(plan.status) }}
                  </el-tag>
                  <el-tag v-if="isChanged(plan.id)" type="warning" size="small">
                    <UnifiedIcon name="Edit" />
                    已修改
                  </el-tag>
                </div>

                <div class="plan-actions">
                  <!-- 日期选择器 -->
                  <el-date-picker
                    v-model="plan.newDate"
                    type="date"
                    size="small"
                    placeholder="修改日期"
                    @change="handleDateChange(plan)"
                    value-format="YYYY-MM-DD"
                    style="max-width: 150px; width: 100%;"
                  />

                  <!-- 上下移动 -->
                  <el-button-group size="small">
                    <el-tooltip content="上移">
                      <el-button 
                        @click="moveUp(plan, month)"
                        :disabled="index === 0"
                      >
                        <UnifiedIcon name="ArrowUp" />
                      </el-button>
                    </el-tooltip>
                    <el-tooltip content="下移">
                      <el-button 
                        @click="moveDown(plan, month)"
                        :disabled="index === getMonthPlans(month).length - 1"
                      >
                        <UnifiedIcon name="ArrowDown" />
                      </el-button>
                    </el-tooltip>
                  </el-button-group>
                </div>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>

    <!-- 底部操作 -->
    <template #footer>
      <div class="editor-footer">
        <div class="footer-left">
          <el-alert 
            v-if="changedPlans.length > 0"
            :title="`您有 ${changedPlans.length} 个计划尚未保存`"
            type="warning"
            :closable="false"
            show-icon
          />
        </div>
        <div class="footer-right">
          <el-button @click="handleClose" size="large">取消</el-button>
          <el-button 
            type="primary" 
            @click="saveChanges"
            :disabled="changedPlans.length === 0"
            :loading="saving"
            size="large"
          >
            <UnifiedIcon name="Check" />
            保存所有更改 ({{ changedPlans.length }})
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  Calendar, List, Edit, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, 
  Check, Warning, DArrowRight
} from '@element-plus/icons-vue';
import draggable from 'vuedraggable';
import { request } from '@/utils/request';

interface Props {
  visible: boolean;
  plans: any[];
  year: number;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const dialogVisible = ref(false);
const editorMode = ref<'calendar' | 'list'>('calendar');
const saving = ref(false);

// 日历模式数据
const currentYear = ref(new Date().getFullYear());
const currentMonth = ref(new Date().getMonth() + 1);
const dragOverDate = ref<string | null>(null);
const draggingPlanId = ref<number | null>(null);

// 列表模式数据
const selectAll = ref(false);
const selectedPlansInList = ref<any[]>([]);
const activeMonths = ref<number[]>([new Date().getMonth() + 1]);
const batchDays = ref(7);
const batchTargetMonth = ref<number | null>(null);

// 计划数据（本地副本，用于编辑）
const editablePlans = ref<any[]>([]);
const changedPlans = ref<Array<{
  planId: number;
  oldDate: string;
  newDate: string;
  plan: any;
}>>([]);

// 监听对话框显示
watch(() => props.visible, (val) => {
  dialogVisible.value = val;
  if (val) {
    initEditor();
  }
});

watch(dialogVisible, (val) => {
  emit('update:visible', val);
});

// 初始化编辑器
const initEditor = () => {
  // 深拷贝计划数据，避免直接修改原数据
  editablePlans.value = JSON.parse(JSON.stringify(props.plans)).map((plan: any) => ({
    ...plan,
    originalDate: plan.planDate,
    newDate: plan.planDate
  }));
  
  // 重置状态
  changedPlans.value = [];
  selectedPlansInList.value = [];
  selectAll.value = false;
  currentYear.value = props.year;
  currentMonth.value = new Date().getMonth() + 1;
};

// 当前月份名称
const currentMonthName = computed(() => {
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', 
                      '七月', '八月', '九月', '十月', '十一月', '十二月'];
  return monthNames[currentMonth.value - 1];
});

// 当前月份的检查数量
const currentMonthPlansCount = computed(() => {
  return getMonthPlans(currentMonth.value).length;
});

// 生成日历天数
const calendarDays = computed(() => {
  const year = currentYear.value;
  const month = currentMonth.value;
  
  // 当月第一天和最后一天
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  
  // 第一天是星期几
  const firstDayOfWeek = firstDay.getDay();
  
  const days: any[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 上月的天数（补齐）
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, -i);
    const dateStr = formatDateStr(date);
    days.push({
      date: dateStr,
      dayNumber: date.getDate(),
      isCurrentMonth: false,
      isToday: dateStr === formatDateStr(today),
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      plans: getPlansForDate(dateStr)
    });
  }
  
  // 当月的天数
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month - 1, day);
    const dateStr = formatDateStr(date);
    days.push({
      date: dateStr,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: dateStr === formatDateStr(today),
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      plans: getPlansForDate(dateStr)
    });
  }
  
  // 下月的天数（补齐到42天）
  const remainingDays = 42 - days.length;
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month, day);
    const dateStr = formatDateStr(date);
    days.push({
      date: dateStr,
      dayNumber: day,
      isCurrentMonth: false,
      isToday: dateStr === formatDateStr(today),
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      plans: getPlansForDate(dateStr)
    });
  }
  
  return days;
});

// 格式化日期字符串
const formatDateStr = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 格式化显示日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};

// 获取指定日期的计划
const getPlansForDate = (date: string) => {
  return editablePlans.value.filter(plan => plan.planDate === date);
};

// 获取指定月份的计划
const getMonthPlans = (month: number) => {
  return editablePlans.value.filter(plan => {
    const planMonth = new Date(plan.planDate).getMonth() + 1;
    return planMonth === month;
  }).sort((a, b) => {
    return new Date(a.planDate).getTime() - new Date(b.planDate).getTime();
  });
};

// 获取月份计划数量
const getMonthPlansCount = (month: number) => {
  return getMonthPlans(month).length;
};

// 月份导航
const previousMonth = () => {
  if (currentMonth.value === 1) {
    currentYear.value--;
    currentMonth.value = 12;
  } else {
    currentMonth.value--;
  }
};

const nextMonth = () => {
  if (currentMonth.value === 12) {
    currentYear.value++;
    currentMonth.value = 1;
  } else {
    currentMonth.value++;
  }
};

// 拖拽处理
const handleDragStart = (evt: any) => {
  draggingPlanId.value = evt.item._underlying_vm_?.id;
};

const handleDragEnd = () => {
  draggingPlanId.value = null;
  dragOverDate.value = null;
};

const handleDragOver = (event: DragEvent, day: any) => {
  event.preventDefault();
  dragOverDate.value = day.date;
};

const handleDragLeave = () => {
  dragOverDate.value = null;
};

const handleDrop = (event: DragEvent, day: any) => {
  event.preventDefault();
  dragOverDate.value = null;
};

const handlePlanMove = (event: any, targetDate: string) => {
  if (event.added) {
    const plan = event.added.element;
    const oldDate = plan.planDate;
    plan.planDate = targetDate;
    plan.newDate = targetDate;
    
    markAsChanged(plan, oldDate, targetDate);
    
    ElMessage.success(`已将 ${plan.inspectionType?.name} 从 ${formatDate(oldDate)} 移动到 ${formatDate(targetDate)}`);
  }
};

// 标记为已修改
const markAsChanged = (plan: any, oldDate: string, newDate: string) => {
  const existing = changedPlans.value.find(c => c.planId === plan.id);
  
  if (existing) {
    // 更新已有记录
    existing.newDate = newDate;
  } else {
    // 添加新记录
    changedPlans.value.push({
      planId: plan.id,
      oldDate,
      newDate,
      plan
    });
  }
};

// 检查是否已修改
const isChanged = (planId: number) => {
  return changedPlans.value.some(c => c.planId === planId);
};

// 列表模式 - 全选
const handleSelectAll = (val: boolean) => {
  if (val) {
    selectedPlansInList.value = [...editablePlans.value];
  } else {
    selectedPlansInList.value = [];
  }
};

// 列表模式 - 月份全选
const isMonthSelected = (month: number) => {
  const monthPlans = getMonthPlans(month);
  if (monthPlans.length === 0) return false;
  return monthPlans.every(plan => 
    selectedPlansInList.value.some(s => s.id === plan.id)
  );
};

const handleMonthSelect = (month: number, val: boolean) => {
  const monthPlans = getMonthPlans(month);
  if (val) {
    // 添加该月所有计划
    monthPlans.forEach(plan => {
      if (!selectedPlansInList.value.some(s => s.id === plan.id)) {
        selectedPlansInList.value.push(plan);
      }
    });
  } else {
    // 移除该月所有计划
    selectedPlansInList.value = selectedPlansInList.value.filter(s => {
      return !monthPlans.some(p => p.id === s.id);
    });
  }
};

// 列表模式 - 单个选择
const isPlanSelected = (planId: number) => {
  return selectedPlansInList.value.some(p => p.id === planId);
};

const handlePlanSelect = (plan: any, val: boolean) => {
  if (val) {
    selectedPlansInList.value.push(plan);
  } else {
    selectedPlansInList.value = selectedPlansInList.value.filter(p => p.id !== plan.id);
  }
};

// 日期修改
const handleDateChange = (plan: any) => {
  const oldDate = plan.originalDate;
  const newDate = plan.newDate;
  
  if (oldDate !== newDate) {
    plan.planDate = newDate;
    markAsChanged(plan, oldDate, newDate);
  }
};

// 批量延后
const batchDelay = () => {
  if (selectedPlansInList.value.length === 0) {
    ElMessage.warning('请先选择要调整的检查计划');
    return;
  }

  selectedPlansInList.value.forEach(plan => {
    const oldDate = plan.planDate;
    const date = new Date(oldDate);
    date.setDate(date.getDate() + batchDays.value);
    const newDate = formatDateStr(date);
    
    plan.planDate = newDate;
    plan.newDate = newDate;
    markAsChanged(plan, oldDate, newDate);
  });
  
  ElMessage.success(`已将 ${selectedPlansInList.value.length} 个检查延后 ${batchDays.value} 天`);
};

// 批量提前
const batchAdvance = () => {
  if (selectedPlansInList.value.length === 0) {
    ElMessage.warning('请先选择要调整的检查计划');
    return;
  }

  selectedPlansInList.value.forEach(plan => {
    const oldDate = plan.planDate;
    const date = new Date(oldDate);
    date.setDate(date.getDate() - batchDays.value);
    const newDate = formatDateStr(date);
    
    plan.planDate = newDate;
    plan.newDate = newDate;
    markAsChanged(plan, oldDate, newDate);
  });
  
  ElMessage.success(`已将 ${selectedPlansInList.value.length} 个检查提前 ${batchDays.value} 天`);
};

// 批量移动到指定月份
const batchMoveToMonth = () => {
  if (selectedPlansInList.value.length === 0) {
    ElMessage.warning('请先选择要调整的检查计划');
    return;
  }

  if (!batchTargetMonth.value) {
    ElMessage.warning('请选择目标月份');
    return;
  }

  selectedPlansInList.value.forEach(plan => {
    const oldDate = plan.planDate;
    const date = new Date(oldDate);
    date.setMonth(batchTargetMonth.value! - 1);
    
    // 处理月份天数差异（例如1月31日移到2月 → 2月28日）
    if (date.getMonth() !== batchTargetMonth.value! - 1) {
      date.setDate(0); // 设为上月最后一天
    }
    
    const newDate = formatDateStr(date);
    plan.planDate = newDate;
    plan.newDate = newDate;
    markAsChanged(plan, oldDate, newDate);
  });
  
  ElMessage.success(`已将 ${selectedPlansInList.value.length} 个检查移动到 ${batchTargetMonth.value} 月`);
};

// 上移
const moveUp = (plan: any, month: number) => {
  const monthPlans = getMonthPlans(month);
  const index = monthPlans.findIndex(p => p.id === plan.id);
  
  if (index > 0) {
    // 交换日期
    const prevPlan = monthPlans[index - 1];
    const tempDate = plan.planDate;
    const oldPlanDate = plan.planDate;
    const oldPrevDate = prevPlan.planDate;
    
    plan.planDate = prevPlan.planDate;
    plan.newDate = prevPlan.planDate;
    prevPlan.planDate = tempDate;
    prevPlan.newDate = tempDate;
    
    markAsChanged(plan, oldPlanDate, plan.planDate);
    markAsChanged(prevPlan, oldPrevDate, prevPlan.planDate);
    
    ElMessage.success('已上移');
  }
};

// 下移
const moveDown = (plan: any, month: number) => {
  const monthPlans = getMonthPlans(month);
  const index = monthPlans.findIndex(p => p.id === plan.id);
  
  if (index < monthPlans.length - 1) {
    const nextPlan = monthPlans[index + 1];
    const tempDate = plan.planDate;
    const oldPlanDate = plan.planDate;
    const oldNextDate = nextPlan.planDate;
    
    plan.planDate = nextPlan.planDate;
    plan.newDate = nextPlan.planDate;
    nextPlan.planDate = tempDate;
    nextPlan.newDate = tempDate;
    
    markAsChanged(plan, oldPlanDate, plan.planDate);
    markAsChanged(nextPlan, oldNextDate, nextPlan.planDate);
    
    ElMessage.success('已下移');
  }
};

// 重置更改
const resetChanges = () => {
  ElMessageBox.confirm('确定要重置所有更改吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    initEditor();
    ElMessage.success('已重置所有更改');
  }).catch(() => {});
};

// 保存更改
const saveChanges = async () => {
  if (changedPlans.value.length === 0) {
    ElMessage.warning('没有需要保存的更改');
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确定要保存 ${changedPlans.value.length} 个计划的时间调整吗？`,
      '确认保存',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    saving.value = true;
    
    // 批量更新
    let successCount = 0;
    for (const change of changedPlans.value) {
      try {
        await request.put(`/inspection/plans/${change.planId}`, {
          planDate: change.newDate
        });
        successCount++;
      } catch (error) {
        console.error(`更新计划 ${change.planId} 失败:`, error);
      }
    }
    
    if (successCount === changedPlans.value.length) {
      ElMessage.success(`成功保存 ${successCount} 个计划的时间调整`);
      emit('success');
      handleClose();
    } else {
      ElMessage.warning(`保存了 ${successCount}/${changedPlans.value.length} 个计划`);
    }
  } catch (error) {
    // 用户取消
  } finally {
    saving.value = false;
  }
};

// 状态相关方法
const getStatusTagType = (status: string) => {
  const types: Record<string, any> = {
    pending: 'info',
    preparing: 'warning',
    in_progress: 'primary',
    completed: 'success',
    overdue: 'danger'
  };
  return types[status] || '';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: '待开始',
    preparing: '准备中',
    in_progress: '进行中',
    completed: '已完成',
    overdue: '已逾期'
  };
  return labels[status] || status;
};

// 关闭对话框
const handleClose = () => {
  if (changedPlans.value.length > 0) {
    ElMessageBox.confirm('有未保存的更改，确定要关闭吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      dialogVisible.value = false;
    }).catch(() => {});
  } else {
    dialogVisible.value = false;
  }
};
</script>

<style scoped lang="scss">
.timeline-editor-dialog {
  :deep(.el-dialog__body) {
    padding: var(--text-2xl);
    background: var(--bg-hover);
    height: calc(100vh - 200px);
    overflow-y: auto;
  }
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-2xl);
  padding: var(--text-lg);
  background: white;
  border-radius: var(--spacing-sm);
  box-shadow: 0 2px var(--spacing-xs) var(--black-alpha-5);
}

// 日历拖拽模式样式
.calendar-editor {
  .month-navigator {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--text-2xl);
    margin-bottom: var(--text-2xl);
    padding: var(--text-lg);
    background: white;
    border-radius: var(--spacing-sm);

    .current-month-label {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: var(--text-xl);
      font-weight: bold;
      color: var(--text-primary);
    }
  }

  .calendar-grid {
    background: white;
    border-radius: var(--spacing-sm);
    padding: var(--text-lg);

    .weekday-header {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: var(--spacing-xs);
      margin-bottom: var(--spacing-sm);

      .weekday {
        padding: var(--text-sm);
        text-align: center;
        font-weight: bold;
        color: var(--text-regular);
        background: var(--bg-hover);
      }
    }

    .calendar-body {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: var(--spacing-xs);
      background: var(--border-color);
      border: var(--border-width-base) solid var(--border-color);

      .calendar-day {
        min-min-height: 60px; height: auto;
        padding: var(--spacing-lg);
        background: white;
        position: relative;

        &.current-month {
          background: var(--bg-color);
        }

        &:not(.current-month) {
          background: var(--bg-hover);
          
          .day-number {
            color: var(--text-placeholder);
          }
        }

        &.today {
          .day-number {
            background: var(--primary-color);
            color: white;
            border-radius: var(--radius-full);
            width: var(--icon-size); height: var(--icon-size);
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }
        }

        &.weekend {
          background: #fef0f0;
        }

        &.drag-over {
          background: #ecf5ff;
          border: 2px dashed var(--primary-color);
        }

        .day-number {
          font-size: var(--text-base);
          font-weight: 500;
          margin-bottom: var(--spacing-lg);
          text-align: right;
        }

        .plans-container {
          min-height: var(--button-height-lg);
        }

        .plan-card {
          background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
          border-radius: var(--radius-md);
          padding: var(--spacing-sm);
          margin-bottom: var(--spacing-xs);
          cursor: move;
          box-shadow: 0 2px var(--spacing-xs) var(--black-alpha-10);
          transition: all 0.3s;

          &:hover {
            transform: translateY(var(--transform-hover-lift));
            box-shadow: 0 var(--spacing-xs) var(--spacing-sm) var(--black-alpha-15);
          }

          &.dragging {
            opacity: 0.5;
          }

          &.changed {
            border: 2px solid var(--warning-color);
            animation: pulse 2s infinite;
          }

          .plan-header {
            display: flex;
            align-items: center;
            gap: var(--spacing-lg);
            margin-bottom: var(--spacing-xs);

            .drag-handle {
              color: var(--white-alpha-80);
              font-size: var(--text-base);
            }

            .plan-name {
              color: white;
              font-size: var(--text-sm);
              font-weight: 500;
              flex: 1;
              overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }

          .plan-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .changed-badge {
              color: var(--warning-color);
              font-size: var(--text-sm);
              display: flex;
              align-items: center;
              gap: var(--spacing-xs);
              background: rgba(230, 162, 60, 0.1);
              padding: var(--spacing-sm) 6px;
              border-radius: var(--spacing-xs);
            }
          }
        }
      }
    }
  }

  .operation-hint {
    margin-top: var(--text-lg);
  }
}

// 列表编辑模式样式
.list-editor {
  .batch-toolbar {
    padding: var(--text-lg);
    background: white;
    border-radius: var(--spacing-sm);
    margin-bottom: var(--text-lg);

    .batch-selection {
      display: flex;
      align-items: center;
      gap: var(--text-lg);
      margin-bottom: var(--text-sm);

      .selected-info {
        color: var(--text-regular);
        
        strong {
          color: var(--primary-color);
          font-size: var(--text-lg);
        }
      }
    }

    .batch-actions {
      display: flex;
      align-items: center;
      gap: var(--text-sm);
      flex-wrap: wrap;
      padding: var(--text-sm);
      background: var(--bg-hover);
      border-radius: var(--radius-md);
    }
  }

  .tree-container {
    background: white;
    border-radius: var(--spacing-sm);
    padding: var(--text-lg);

    .month-title {
      display: flex;
      align-items: center;
      gap: var(--text-sm);
      width: 100%;

      .month-label {
        font-size: var(--text-lg);
        font-weight: bold;
        color: var(--text-primary);
      }
    }

    .month-plans {
      .plan-item {
        display: flex;
        align-items: center;
        gap: var(--text-lg);
        padding: var(--text-sm);
        border-bottom: var(--z-index-dropdown) solid #ebeef5;
        transition: background 0.3s;

        &:hover {
          background: var(--bg-hover);
        }

        &.is-changed {
          background: #fdf6ec;
          border-left: 3px solid var(--warning-color);
        }

        .plan-checkbox {
          flex-shrink: 0;
        }

        .plan-date-display {
          flex-shrink: 0;
          width: auto;
        }

        .plan-info {
          flex: 1;
          display: flex;
          align-items: center;
          gap: var(--text-sm);

          .plan-name {
            font-weight: 500;
            color: var(--text-primary);
          }
        }

        .plan-actions {
          display: flex;
          align-items: center;
          gap: var(--text-sm);
          flex-shrink: 0;
        }
      }
    }
  }
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--text-lg) 0;

  .footer-left {
    flex: 1;
  }

  .footer-right {
    display: flex;
    gap: var(--text-sm);
  }
}

@keyframes pulse {
  0%, 100% {
    border-color: var(--warning-color);
  }
  50% {
    border-color: var(--danger-color);
  }
}
</style>

