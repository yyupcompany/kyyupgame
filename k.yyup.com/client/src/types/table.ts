export interface TableColumn {
  /** 列字段名 */
  prop: string
  /** 列标题 */
  label: string
  /** 列宽度 */
  width?: string | number
  /** 最小列宽 */
  minWidth?: string | number
  /** 列对齐方式 */
  align?: 'left' | 'center' | 'right'
  /** 是否固定列 */
  fixed?: boolean | 'left' | 'right'
  /** 是否显示溢出提示 */
  showOverflowTooltip?: boolean
  /** 列类型 */
  type?: 'text' | 'status' | 'datetime' | 'date' | 'money' | 'phone' | 'email' | 'avatar'
  /** 状态标签映射（当type为status时使用） */
  statusMap?: Record<string, string>
  /** 标签大小（当type为status时使用） */
  tagSize?: 'large' | 'default' | 'small'
  /** 是否隐藏列 */
  hidden?: (row: any) => boolean
}

export interface TableAction {
  /** 操作键值 */
  key: string
  /** 操作标签 */
  label: string
  /** 按钮类型 */
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default'
  /** 图标 */
  icon?: string
  /** 是否禁用 */
  disabled?: (row: any) => boolean
  /** 是否隐藏 */
  hidden?: (row: any) => boolean
}

export interface TableConfig {
  /** 表格列配置 */
  columns: TableColumn[]
  /** 操作配置 */
  actions?: TableAction[]
  /** 是否显示序号 */
  showIndex?: boolean
  /** 是否可选择 */
  selectable?: boolean
  /** 操作列宽度 */
  actionsWidth?: string | number
  /** 按钮布局方式 */
  actionsLayout?: 'group' | 'separate'
  /** 最大可见操作数 */
  maxVisibleActions?: number
}

// 标准列宽度配置
export const STANDARD_COLUMN_WIDTHS = {
  id: '80px',
  index: '80px',
  avatar: '60px',
  status: '100px',
  datetime: '180px',
  date: '120px',
  time: '100px',
  money: '120px',
  phone: '140px',
  email: '180px',
  actions: {
    single: '100px',
    double: '160px',
    triple: '220px',
    multiple: '280px'
  }
} as const

// 标准操作按钮配置
export const STANDARD_ACTIONS = {
  view: {
    key: 'view',
    label: '查看',
    type: 'primary' as const,
    icon: 'View'
  },
  edit: {
    key: 'edit',
    label: '编辑',
    type: 'default' as const,
    icon: 'Edit'
  },
  delete: {
    key: 'delete',
    label: '删除',
    type: 'danger' as const,
    icon: 'Delete'
  },
  detail: {
    key: 'detail',
    label: '详情',
    type: 'primary' as const,
    icon: 'Document'
  },
  download: {
    key: 'download',
    label: '下载',
    type: 'default' as const,
    icon: 'Download'
  },
  assign: {
    key: 'assign',
    label: '分配',
    type: 'default' as const,
    icon: 'User'
  },
  followUp: {
    key: 'followUp',
    label: '跟进',
    type: 'default' as const,
    icon: 'ChatLineSquare'
  }
} as const

// 标准状态映射
export const STANDARD_STATUS_MAPS = {
  // 通用状态
  common: {
    active: { text: '激活', type: 'success' },
    inactive: { text: '未激活', type: 'info' },
    pending: { text: '待处理', type: 'warning' },
    disabled: { text: '禁用', type: 'danger' },
    deleted: { text: '已删除', type: 'danger' }
  },
  // 操作结果状态
  operation: {
    success: { text: '成功', type: 'success' },
    failed: { text: '失败', type: 'danger' },
    processing: { text: '处理中', type: 'warning' },
    waiting: { text: '等待中', type: 'info' }
  },
  // 审核状态
  approval: {
    approved: { text: '已通过', type: 'success' },
    rejected: { text: '已拒绝', type: 'danger' },
    pending: { text: '待审核', type: 'warning' },
    draft: { text: '草稿', type: 'info' }
  },
  // 招生状态
  enrollment: {
    registered: { text: '已报名', type: 'primary' },
    interviewed: { text: '已面试', type: 'warning' },
    admitted: { text: '已录取', type: 'success' },
    rejected: { text: '未录取', type: 'danger' },
    waiting: { text: '等待中', type: 'info' }
  },
  // 支付状态
  payment: {
    paid: { text: '已支付', type: 'success' },
    unpaid: { text: '未支付', type: 'warning' },
    refunded: { text: '已退款', type: 'info' },
    overdue: { text: '逾期', type: 'danger' }
  }
} as const

// 获取状态配置
export function getStatusConfig(value: string, statusType: keyof typeof STANDARD_STATUS_MAPS = 'common') {
  const statusMap = STANDARD_STATUS_MAPS[statusType]
  const config = statusMap[value as keyof typeof statusMap]
  return config || { text: value, type: 'info' as const }
}