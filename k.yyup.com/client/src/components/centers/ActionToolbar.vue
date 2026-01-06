<template>
  <div class="action-toolbar" :class="[`action-toolbar--${size}`, `action-toolbar--${align}`]">
    <!-- 左侧操作区域 -->
    <div class="toolbar-left">
      <!-- 主要操作按钮 -->
      <div class="primary-actions">
        <slot name="primary">
          <el-button 
            v-for="action in primaryActions"
            :key="action.key"
            :type="action.type || 'primary'"
            :size="size"
            :icon="action.icon"
            :loading="action.loading"
            :disabled="action.disabled"
            @click="handleActionClick(action)"
          >
            {{ action.label }}
          </el-button>
        </slot>
      </div>

      <!-- 批量操作区域 -->
      <div v-if="selection.length > 0" class="batch-actions">
        <div class="selection-info">
          <UnifiedIcon name="default" />
          <span>已选择 {{ selection.length }} 项</span>
        </div>
        
        <el-divider direction="vertical" />
        
        <slot name="batch" :selection="selection">
          <el-button 
            v-for="action in batchActions"
            :key="action.key"
            :type="action.type || 'default'"
            :size="size"
            :icon="action.icon"
            :loading="action.loading"
            :disabled="action.disabled"
            @click="handleBatchAction(action)"
          >
            {{ action.label }}
          </el-button>
        </slot>
      </div>
    </div>

    <!-- 右侧操作区域 -->
    <div class="toolbar-right">
      <!-- 搜索框 -->
      <div v-if="searchable" class="search-box">
        <el-input
          v-model="searchKeyword"
          :placeholder="searchPlaceholder"
          :prefix-icon="Search"
          :size="size"
          clearable
          @input="handleSearch"
          @clear="handleSearchClear"
          class="search-input"
        />
      </div>

      <!-- 筛选器 -->
      <div v-if="filters.length > 0" class="filter-box">
        <el-dropdown @command="handleFilterCommand" :size="size">
          <el-button :size="size" :icon="Filter">
            筛选
            <el-badge 
              v-if="activeFilters.length > 0" 
              :value="activeFilters.length" 
              class="filter-badge"
            />
            <UnifiedIcon name="default" />
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item 
                v-for="filter in filters"
                :key="filter.key"
                :command="filter.key"
                :class="{ 'is-active': activeFilters.includes(filter.key) }"
              >
                <UnifiedIcon name="Check" />
                {{ filter.label }}
              </el-dropdown-item>
              <el-dropdown-item divided command="clear" v-if="activeFilters.length > 0">
                <UnifiedIcon name="Close" />
                清除筛选
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <!-- 排序器 -->
      <div v-if="sortable" class="sort-box">
        <el-dropdown @command="handleSortCommand" :size="size">
          <el-button :size="size" :icon="Sort">
            排序
            <UnifiedIcon name="default" />
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item 
                v-for="sort in sortOptions"
                :key="sort.key"
                :command="sort.key"
                :class="{ 'is-active': currentSort === sort.key }"
              >
                <UnifiedIcon name="Check" />
                {{ sort.label }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <!-- 次要操作按钮 -->
      <div class="secondary-actions">
        <slot name="secondary">
          <el-button 
            v-for="action in secondaryActions"
            :key="action.key"
            :type="action.type || 'default'"
            :size="size"
            :icon="action.icon"
            :loading="action.loading"
            :disabled="action.disabled"
            @click="handleActionClick(action)"
          >
            {{ action.label }}
          </el-button>
        </slot>
      </div>

      <!-- 更多操作下拉菜单 -->
      <div v-if="moreActions.length > 0" class="more-actions">
        <el-dropdown @command="handleMoreCommand" :size="size">
          <el-button :size="size" :icon="MoreFilled">
            更多
            <UnifiedIcon name="default" />
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item 
                v-for="action in moreActions"
                :key="action.key"
                :command="action.key"
                :disabled="action.disabled"
                :divided="action.divided"
              >
                <UnifiedIcon name="default" />
                {{ action.label }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <!-- 刷新按钮 -->
      <el-button 
        v-if="refreshable"
        :size="size"
        :icon="Refresh"
        :loading="refreshing"
        @click="$emit('refresh')"
      >
        刷新
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  Search, Filter, Sort, MoreFilled, Refresh
} from '@element-plus/icons-vue'
import { debounce } from 'lodash-es'

interface Action {
  key: string
  label: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text' | 'default'
  icon?: any
  loading?: boolean
  disabled?: boolean
  divided?: boolean
  permission?: string
}

interface Filter {
  key: string
  label: string
  value?: any
}

interface SortOption {
  key: string
  label: string
  field?: string
  order?: 'asc' | 'desc'
}

interface Props {
  primaryActions?: Action[]
  secondaryActions?: Action[]
  batchActions?: Action[]
  moreActions?: Action[]
  selection?: any[]
  searchable?: boolean
  searchPlaceholder?: string
  filters?: Filter[]
  activeFilters?: string[]
  sortable?: boolean
  sortOptions?: SortOption[]
  currentSort?: string
  refreshable?: boolean
  refreshing?: boolean
  size?: 'large' | 'default' | 'small'
  align?: 'left' | 'center' | 'right' | 'space-between'
}

const props = withDefaults(defineProps<Props>(), {
  primaryActions: () => [],
  secondaryActions: () => [],
  batchActions: () => [],
  moreActions: () => [],
  selection: () => [],
  searchable: false,
  searchPlaceholder: '搜索...',
  filters: () => [],
  activeFilters: () => [],
  sortable: false,
  sortOptions: () => [],
  currentSort: '',
  refreshable: true,
  refreshing: false,
  size: 'default',
  align: 'space-between'
})

const emit = defineEmits<{
  'action-click': [action: Action]
  'batch-action': [action: Action, selection: any[]]
  search: [keyword: string]
  'search-clear': []
  filter: [filterKey: string, active: boolean]
  'filter-clear': []
  sort: [sortKey: string]
  refresh: []
}>()

const searchKeyword = ref('')

// 处理操作按钮点击
const handleActionClick = (action: Action) => {
  if (action.disabled || action.loading) return
  emit('action-click', action)
}

// 处理批量操作
const handleBatchAction = (action: Action) => {
  if (action.disabled || action.loading) return
  emit('batch-action', action, props.selection)
}

// 处理搜索
const handleSearch = debounce((keyword: string) => {
  emit('search', keyword)
}, 300)

// 处理搜索清除
const handleSearchClear = () => {
  searchKeyword.value = ''
  emit('search-clear')
}

// 处理筛选命令
const handleFilterCommand = (command: string) => {
  if (command === 'clear') {
    emit('filter-clear')
  } else {
    const isActive = props.activeFilters.includes(command)
    emit('filter', command, !isActive)
  }
}

// 处理排序命令
const handleSortCommand = (command: string) => {
  emit('sort', command)
}

// 处理更多操作命令
const handleMoreCommand = (command: string) => {
  const action = props.moreActions.find(a => a.key === command)
  if (action) {
    handleActionClick(action)
  }
}
</script>

<style scoped lang="scss">
.action-toolbar {
  display: flex;
  align-items: center;
  gap: var(--text-lg);
  padding: var(--text-lg);
  background: var(--bg-color, var(--bg-white));
  border-bottom: var(--z-index-dropdown) solid var(--border-color);

  .search-input {
    max-width: 240px; width: 100%;
  }

  &--left {
    justify-content: flex-start;
  }

  &--center {
    justify-content: center;
  }

  &--right {
    justify-content: flex-end;
  }

  &--space-between {
    justify-content: space-between;
  }

  &--small {
    padding: var(--text-sm);
    gap: var(--text-sm);
  }

  &--large {
    padding: var(--spacing-xl);
    gap: var(--spacing-xl);
  }
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: var(--text-lg);
  flex: 1;

  .primary-actions {
    display: flex;
    gap: var(--spacing-sm);
  }

  .batch-actions {
    display: flex;
    align-items: center;
    gap: var(--text-sm);
    padding: var(--spacing-sm) var(--text-sm);
    background: var(--primary-light-bg);
    border: var(--border-width-thin) solid var(--primary-300);
    border-radius: var(--radius-md);

    .selection-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
      font-size: var(--text-base);
      color: var(--primary-color);
      font-weight: 500;
    }
  }
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: var(--text-sm);
  flex-shrink: 0;

  .search-box,
  .filter-box,
  .sort-box,
  .secondary-actions,
  .more-actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .filter-badge {
    margin-left: var(--spacing-xs);
  }
}

:deep(.el-dropdown-menu__item) {
  &.is-active {
    color: var(--primary-color);
    background-color: var(--primary-light-bg);

    .el-icon {
      color: var(--primary-color);
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-xl)) {
  .action-toolbar {
    flex-wrap: wrap;
    gap: var(--text-sm);

    .toolbar-left,
    .toolbar-right {
      flex: none;
      width: 100%;
    }

    .toolbar-right {
      justify-content: flex-end;
    }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .action-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: var(--text-sm);

    .toolbar-left {
      flex-direction: column;
      align-items: stretch;
      gap: var(--text-sm);

      .primary-actions {
        justify-content: center;
      }

      .batch-actions {
        justify-content: center;
      }
    }

    .toolbar-right {
      flex-direction: column;
      gap: var(--text-sm);

      .search-box {
        width: 100%;

        .el-input {
          width: 100% !important;
        }
      }

      .filter-box,
      .sort-box,
      .secondary-actions,
      .more-actions {
        justify-content: center;
      }
    }
  }
}
</style>
