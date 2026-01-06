<template>
  <div class="unified-table">
    <el-table
      :data="data"
      :loading="loading"
      stripe
      border
      :height="height || 'auto'"
      :size="size || 'default'"
      v-bind="$attrs"
      @selection-change="handleSelectionChange"
    >
      <!-- 复选框列 -->
      <el-table-column
        v-if="selectable"
        type="selection"
        width="55"
        align="center"
      />

      <!-- 序号列 -->
      <el-table-column
        v-if="showIndex"
        type="index"
        label="序号"
        width="80"
        align="center"
      />

      <!-- 动态列 -->
      <el-table-column
        v-for="column in normalizedColumns"
        :key="column.prop"
        :prop="column.prop"
        :label="column.label"
        :width="column.width"
        :min-width="column.minWidth"
        :fixed="column.fixed"
        :align="column.align || 'left'"
        :show-overflow-tooltip="column.showOverflowTooltip !== false"
      >
        <template #default="{ row, column: tableColumn, $index }">
          <!-- 自定义插槽内容 -->
          <slot
            v-if="$slots[`column-${column.prop}`]"
            :name="`column-${column.prop}`"
            :row="row"
            :column="tableColumn"
            :value="row[column.prop]"
            :index="$index"
          />
          <!-- 状态标签 -->
          <el-tag
            v-else-if="column.type === 'status'"
            :type="getStatusType(row[column.prop], column.statusMap)"
            :size="column.tagSize || 'small'"
          >
            {{ getStatusText(row[column.prop], column.statusMap) }}
          </el-tag>
          <!-- 时间格式化 -->
          <span v-else-if="column.type === 'datetime'">
            {{ formatDateTime(row[column.prop]) }}
          </span>
          <!-- 金额格式化 -->
          <span v-else-if="column.type === 'money'" class="money-text">
            ¥{{ formatMoney(row[column.prop]) }}
          </span>
          <!-- 默认文本 -->
          <span v-else>{{ row[column.prop] }}</span>
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column
        v-if="showActions && actions.length > 0"
        label="操作"
        :width="actionsWidth"
        fixed="right"
        align="center"
      >
        <template #default="{ row, $index }">
          <div class="table-actions">
            <!-- 按钮组模式 -->
            <el-button-group v-if="actionsLayout === 'group'">
              <el-button
                v-for="action in visibleActions(row)"
                :key="action.key"
                :type="action.type || 'default'"
                :size="actionsSize"
                :disabled="action.disabled && action.disabled(row)"
                @click="handleAction(action.key, row, $index)"
              >
                <el-icon v-if="action.icon" class="action-icon">
                  <component :is="action.icon" />
                </el-icon>
                {{ action.label }}
              </el-button>
            </el-button-group>

            <!-- 分散按钮模式 -->
            <template v-else>
              <el-button
                v-for="action in visibleActions(row)"
                :key="action.key"
                :type="action.type || 'default'"
                :size="actionsSize"
                :disabled="action.disabled && action.disabled(row)"
                @click="handleAction(action.key, row, $index)"
                class="action-button"
              >
                <el-icon v-if="action.icon" class="action-icon">
                  <component :is="action.icon" />
                </el-icon>
                {{ action.label }}
              </el-button>
            </template>

            <!-- 更多操作下拉菜单 -->
            <el-dropdown
              v-if="moreActions.length > 0"
              @command="(command) => handleAction(command, row, $index)"
              class="more-actions"
            >
              <el-button :size="actionsSize" type="default">
                更多
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-for="action in moreActions"
                    :key="action.key"
                    :command="action.key"
                    :disabled="action.disabled && action.disabled(row)"
                  >
                    <el-icon v-if="action.icon" class="action-icon">
                      <component :is="action.icon" />
                    </el-icon>
                    {{ action.label }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <div v-if="showPagination" class="table-pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="pageSizes"
        :total="total"
        :layout="paginationLayout"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { formatDateTime, formatMoney } from '@/utils/format'
import type { TableAction, TableColumn } from '@/types/table'

interface Props {
  // 表格数据
  data: any[]
  loading?: boolean
  height?: string | number
  size?: 'large' | 'default' | 'small'

  // 列配置
  columns: TableColumn[]

  // 选择功能
  selectable?: boolean
  showIndex?: boolean

  // 操作列配置
  showActions?: boolean
  actions?: TableAction[]
  actionsWidth?: string | number
  actionsSize?: 'large' | 'default' | 'small'
  actionsLayout?: 'group' | 'separate' // 按钮组织方式
  maxVisibleActions?: number // 最大显示按钮数，超出的放入更多菜单

  // 分页配置
  showPagination?: boolean
  currentPage?: number
  pageSize?: number
  total?: number
  pageSizes?: number[]
  paginationLayout?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  size: 'default',
  selectable: false,
  showIndex: false,
  showActions: true,
  actions: () => [],
  actionsWidth: 'auto',
  actionsSize: 'small',
  actionsLayout: 'separate',
  maxVisibleActions: 3,
  showPagination: false,
  currentPage: 1,
  pageSize: 20,
  total: 0,
  pageSizes: () => [10, 20, 50, 100],
  paginationLayout: 'total, sizes, prev, pager, next, jumper'
})

const emit = defineEmits<{
  action: [key: string, row: any, index: number]
  selectionChange: [selection: any[]]
  sizeChange: [size: number]
  currentChange: [page: number]
}>()

// 标准化列配置
const normalizedColumns = computed(() => {
  return props.columns.map(column => ({
    width: getColumnWidth(column),
    minWidth: getColumnMinWidth(column),
    align: column.align || 'left',
    showOverflowTooltip: column.showOverflowTooltip !== false,
    ...column
  }))
})

// 列宽度标准化
function getColumnWidth(column: TableColumn): string | undefined {
  if (column.width) return column.width

  // 标准列宽度映射
  const standardWidths: Record<string, string> = {
    'id': '80px',
    'index': '80px',
    'status': '100px',
    'datetime': '180px',
    'date': '120px',
    'money': '120px',
    'phone': '140px',
    'email': '180px',
    'avatar': '60px'
  }

  return standardWidths[column.type || ''] || column.width
}

// 最小列宽度
function getColumnMinWidth(column: TableColumn): string | undefined {
  if (column.minWidth) return column.minWidth
  if (column.width) return undefined
  return '100px' // 默认最小宽度
}

// 计算操作列宽度
const actionsWidth = computed(() => {
  if (props.actionsWidth !== 'auto') return props.actionsWidth

  const baseWidth = 80 // 基础宽度
  const buttonWidth = props.actionsSize === 'small' ? 60 : 80
  const maxActions = Math.min(props.actions.length, props.maxVisibleActions)
  const spacing = 8 * Math.max(0, maxActions - 1) // 按钮间距

  return `${baseWidth + buttonWidth * maxActions + spacing}px`
})

// 可见操作按钮
function visibleActions(row: any) {
  const available = props.actions.filter(action =>
    !action.hidden || !action.hidden(row)
  )
  return available.slice(0, props.maxVisibleActions)
}

// 更多操作菜单
const moreActions = computed(() => {
  return props.actions.slice(props.maxVisibleActions)
})

// 状态类型映射
function getStatusType(value: any, statusMap?: Record<string, string>): string {
  if (!statusMap) {
    // 默认状态映射
    const defaultMap: Record<string, string> = {
      'active': 'success',
      'inactive': 'info',
      'pending': 'warning',
      'disabled': 'danger',
      'success': 'success',
      'failed': 'danger',
      'processing': 'warning'
    }
    return defaultMap[value] || 'info'
  }
  return statusMap[value] || 'info'
}

// 状态文本映射
function getStatusText(value: any, statusMap?: Record<string, string>): string {
  if (!statusMap) {
    // 默认文本映射
    const defaultMap: Record<string, string> = {
      'active': '激活',
      'inactive': '未激活',
      'pending': '待处理',
      'disabled': '禁用',
      'success': '成功',
      'failed': '失败',
      'processing': '处理中'
    }
    return defaultMap[value] || value
  }
  return statusMap[value] || value
}

// 处理操作
function handleAction(key: string, row: any, index: number) {
  emit('action', key, row, index)
}

// 处理选择变化
function handleSelectionChange(selection: any[]) {
  emit('selectionChange', selection)
}

// 处理分页大小变化
function handleSizeChange(size: number) {
  emit('sizeChange', size)
}

// 处理页码变化
function handleCurrentChange(page: number) {
  emit('currentChange', page)
}
</script>

<style lang="scss" scoped>
.unified-table {
  .table-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);

    .action-button {
      margin-right: var(--spacing-sm);

      &:last-child {
        margin-right: 0;
      }
    }

    .action-icon {
      margin-right: var(--spacing-xs);
    }

    .more-actions {
      margin-left: var(--spacing-sm);
    }
  }

  .table-pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: var(--text-lg);
    padding: var(--text-lg) 0;
  }

  .money-text {
    color: var(--el-color-success);
    font-weight: 500;
  }
}

// 操作列按钮样式统一
:deep(.el-table) {
  .el-table__cell {
    .table-actions {
      .el-button-group {
        .el-button {
          border-radius: 0;

          &:first-child {
            border-top-left-radius: var(--el-border-radius-base);
            border-bottom-left-radius: var(--el-border-radius-base);
          }

          &:last-child {
            border-top-right-radius: var(--el-border-radius-base);
            border-bottom-right-radius: var(--el-border-radius-base);
          }
        }
      }
    }
  }
}
</style>