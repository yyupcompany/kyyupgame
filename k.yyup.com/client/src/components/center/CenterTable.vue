<template>
  <div class="center-table-wrapper">
    <div v-if="title || $slots.header" class="center-table__header">
      <div v-if="title" class="center-table__title">{{ title }}</div>
      <div v-if="$slots.header" class="center-table__header-extra">
        <slot name="header" />
      </div>
    </div>

    <div class="center-table-container" :class="{ 'center-table-container--bordered': bordered }">
      <table class="center-table">
        <thead v-if="showHeader">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              :class="{ 'center-table__th--sortable': column.sortable }"
              :style="{ width: column.width }"
              @click="handleSort(column)"
            >
              <div class="center-table__th-content">
                <span>{{ column.label }}</span>
                <span v-if="column.sortable" class="center-table__sort-icon">
                  <UnifiedIcon
                    :name="getSortIcon(column.key)"
                    :size="14"
                  />
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, index) in dataSource"
            :key="getRowKey(row, index)"
            :class="{ 'center-table__row--clickable': rowClickable }"
            @click="handleRowClick(row, index)"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              :class="getCellClass(row, column)"
            >
              <slot
                :name="column.key"
                :row="row"
                :column="column"
                :index="index"
              >
                {{ getCellValue(row, column.key) }}
              </slot>
            </td>
          </tr>
          <tr v-if="dataSource.length === 0">
            <td :colspan="columns.length" class="center-table__empty">
              <slot name="empty">
                <div class="center-table__empty-content">
                  <UnifiedIcon name="inbox" :size="48" />
                  <p>暂无数据</p>
                </div>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="pagination || $slots.footer" class="center-table__footer">
      <slot name="footer" />
      <div v-if="pagination" class="center-table__pagination">
        <slot name="pagination">
          <CenterButton
            :disabled="currentPage <= 1"
            @click="handlePageChange(currentPage - 1)"
          >
            上一页
          </CenterButton>
          <span class="center-table__page-info">
            {{ currentPage }} / {{ totalPages }}
          </span>
          <CenterButton
            :disabled="currentPage >= totalPages"
            @click="handlePageChange(currentPage + 1)"
          >
            下一页
          </CenterButton>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Column } from './types'
import UnifiedIcon from './CenterIcon.vue'
import CenterButton from './CenterButton.vue'

interface Props {
  columns: Column[]
  dataSource: any[]
  rowKey?: string | ((row: any) => string)
  title?: string
  bordered?: boolean
  showHeader?: boolean
  rowClickable?: boolean
  pagination?: boolean
  total?: number
  pageSize?: number
  currentPage?: number
}

const props = withDefaults(defineProps<Props>(), {
  rowKey: 'id',
  bordered: false,
  showHeader: true,
  rowClickable: false,
  pagination: false,
  total: 0,
  pageSize: 10,
  currentPage: 1
})

const emit = defineEmits<{
  sort: [column: Column, order: 'asc' | 'desc' | null]
  rowClick: [row: any, index: number]
  pageChange: [page: number]
}>()

const sortState = computed<Record<string, 'asc' | 'desc'>>(() => ({}))

const totalPages = computed(() => {
  return Math.ceil(props.total / props.pageSize)
})

const getRowKey = (row: any, index: number) => {
  if (typeof props.rowKey === 'function') {
    return props.rowKey(row)
  }
  return row[props.rowKey] || index
}

const getCellValue = (row: any, key: string) => {
  return key.split('.').reduce((obj, k) => obj?.[k], row)
}

const getCellClass = (row: any, column: Column) => {
  if (typeof column.cellClassName === 'function') {
    return column.cellClassName(row)
  }
  return column.cellClassName || ''
}

const getSortIcon = (key: string) => {
  const order = sortState.value[key]
  if (order === 'asc') return 'arrow-up'
  if (order === 'desc') return 'arrow-down'
  return 'arrow-up-down'
}

const handleSort = (column: Column) => {
  if (!column.sortable) return

  const currentOrder = sortState.value[column.key]
  let newOrder: 'asc' | 'desc' | null = 'asc'

  if (currentOrder === 'asc') {
    newOrder = 'desc'
  } else if (currentOrder === 'desc') {
    newOrder = null
  }

  if (newOrder) {
    sortState.value[column.key] = newOrder
  } else {
    delete sortState.value[column.key]
  }

  emit('sort', column, newOrder)
}

const handleRowClick = (row: any, index: number) => {
  if (props.rowClickable) {
    emit('rowClick', row, index)
  }
}

const handlePageChange = (page: number) => {
  emit('pageChange', page)
}
</script>

<style lang="scss" scoped>
@import '@/styles/design-tokens.scss';

.center-table-wrapper {
  background: var(--bg-color, #ffffff);
  border-radius: var(--radius-xl, 12px);
  box-shadow: var(--shadow-sm, 0 1px 3px 0 rgba(0, 0, 0, 0.1));
  overflow: hidden;
}

.center-table__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md, 16px) var(--spacing-lg, 24px);
  border-bottom: 1px solid var(--border-color, #dcdfe6);
}

.center-table__title {
  font-size: var(--text-lg, 18px);
  font-weight: var(--font-semibold, 600);
  color: var(--text-primary, #2c3e50);
}

.center-table-container {
  overflow-x: auto;

  &--bordered {
    border-top: 1px solid var(--border-color, #dcdfe6);
    border-bottom: 1px solid var(--border-color, #dcdfe6);
  }
}

.center-table {
  width: 100%;
  border-collapse: collapse;

  thead {
    background: var(--bg-color-page, #f7f8fa);
  }

  th {
    padding: var(--spacing-md, 16px);
    text-align: left;
    font-weight: var(--font-semibold, 600);
    font-size: var(--text-sm, 14px);
    color: var(--text-primary, #2c3e50);
    border-bottom: 1px solid var(--border-color, #dcdfe6);
    white-space: nowrap;
    user-select: none;

    &.center-table__th--sortable {
      cursor: pointer;
      transition: background-color var(--transition-fast, 150ms ease-in-out);

      &:hover {
        background: rgba(91, 141, 239, 0.05);
      }
    }
  }

  td {
    padding: var(--spacing-md, 16px);
    font-size: var(--text-sm, 14px);
    color: var(--text-secondary, #5a6c7d);
    border-bottom: 1px solid var(--border-color, #dcdfe6);
  }

  tbody tr {
    transition: background-color var(--transition-fast, 150ms ease-in-out);

    &:hover {
      background: var(--bg-color-page, #f7f8fa);
    }

    &.center-table__row--clickable {
      cursor: pointer;
    }

    &:last-child td {
      border-bottom: none;
    }
  }

  th,
  td {
    &:empty {
      padding: 0;
    }
  }
}

.center-table__th-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs, 4px);
}

.center-table__sort-icon {
  display: flex;
  align-items: center;
  color: var(--text-tertiary, #8492a6);
}

.center-table__empty {
  padding: var(--spacing-3xl, 64px) var(--spacing-lg, 24px);
  text-align: center;
}

.center-table__empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md, 16px);
  color: var(--text-tertiary, #8492a6);

  p {
    margin: 0;
    font-size: var(--text-base, 16px);
  }
}

.center-table__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md, 16px) var(--spacing-lg, 24px);
  border-top: 1px solid var(--border-color, #dcdfe6);
}

.center-table__pagination {
  display: flex;
  align-items: center;
  gap: var(--spacing-md, 16px);
}

.center-table__page-info {
  font-size: var(--text-sm, 14px);
  color: var(--text-secondary, #5a6c7d);
}

// 暗黑模式适配
@media (prefers-color-scheme: dark) {
  html[data-theme="dark"] {
    .center-table-wrapper {
      background: var(--bg-card-dark, #1e293b);
    }

    .center-table__header,
    .center-table__footer {
      border-color: var(--border-color-dark, rgba(255, 255, 255, 0.08));
    }

    .center-table__title {
      color: var(--text-primary-dark, #f8fafc);
    }

    .center-table {
      thead {
        background: var(--bg-secondary-dark, #1e293b);
      }

      th {
        color: var(--text-primary-dark, #f8fafc);
        border-color: var(--border-color-dark, rgba(255, 255, 255, 0.08));

        &:hover {
          background: rgba(139, 92, 246, 0.1);
        }
      }

      td {
        color: var(--text-secondary-dark, #cbd5e1);
        border-color: var(--border-color-dark, rgba(255, 255, 255, 0.08));
      }

      tbody tr:hover {
        background: var(--bg-secondary-dark, #1e293b);
      }
    }

    .center-table__empty-content {
      color: var(--text-muted-dark, #94a3b8);
    }

    .center-table__page-info {
      color: var(--text-secondary-dark, #cbd5e1);
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .center-table__header,
  .center-table__footer {
    padding: var(--spacing-sm, 12px) var(--spacing-md, 16px);
  }

  .center-table th,
  .center-table td {
    padding: var(--spacing-sm, 12px) var(--spacing-md, 16px);
  }

  .center-table__empty {
    padding: var(--spacing-xl, 32px) var(--spacing-md, 16px);
  }
}
</style>
