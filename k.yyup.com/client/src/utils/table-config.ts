/**
 * 全局表格列配置工具
 * 
 * 提供标准化的表格列配置,确保所有表格遵循统一的样式规范
 * 
 * 使用示例:
 * ```typescript
 * import { createIdColumn, createNameColumn, createPhoneColumn, createActionsColumn } from '@/utils/table-config'
 * 
 * const columns = [
 *   createIdColumn(),
 *   createNameColumn('客户姓名'),
 *   createPhoneColumn(),
 *   createActionsColumn()
 * ]
 * ```
 */

/**
 * 表格列配置接口
 */
export interface TableColumnConfig {
  prop: string
  label: string
  width?: number
  minWidth?: number
  fixed?: 'left' | 'right' | boolean
  align?: 'left' | 'center' | 'right'
  showOverflowTooltip?: boolean
  sortable?: boolean | 'custom'
  type?: string
  [key: string]: any
}

/**
 * 列类型枚举
 */
export enum ColumnType {
  ID = 'id',
  NAME = 'name',
  PHONE = 'phone',
  EMAIL = 'email',
  STATUS = 'status',
  DATE = 'date',
  DATETIME = 'datetime',
  NUMBER = 'number',
  MONEY = 'money',
  PERCENT = 'percent',
  TAG = 'tag',
  AVATAR = 'avatar',
  IMAGE = 'image',
  ACTIONS = 'actions',
  SELECTION = 'selection',
  INDEX = 'index',
  TEXT_SHORT = 'text_short',
  TEXT_MEDIUM = 'text_medium',
  TEXT_LONG = 'text_long'
}

/**
 * 标准列宽度配置
 */
export const COLUMN_WIDTHS = {
  // 固定宽度列
  ID: 80,
  INDEX: 60,
  SELECTION: 55,
  AVATAR: 80,
  GENDER: 80,
  AGE: 80,
  STATUS: 100,
  TAG: 100,
  PERCENT: 100,
  
  // 常规宽度列
  NAME_SHORT: 120,
  NAME_MEDIUM: 150,
  NAME_LONG: 180,
  
  PHONE: 130,
  EMAIL: 200,
  
  DATE: 120,
  DATETIME: 160,
  
  NUMBER_SHORT: 100,
  NUMBER_MEDIUM: 120,
  NUMBER_LONG: 150,
  
  MONEY: 120,
  
  TEXT_SHORT: 120,
  TEXT_MEDIUM: 180,
  TEXT_LONG: 250,
  
  // 操作列
  ACTIONS_SMALL: 120,
  ACTIONS_MEDIUM: 180,
  ACTIONS_LARGE: 200
}

/**
 * 基础列配置
 */
const createBaseColumn = (
  prop: string,
  label: string,
  options: Partial<TableColumnConfig> = {}
): TableColumnConfig => {
  return {
    prop,
    label,
    ...options
  }
}

/**
 * 创建ID列
 */
export const createIdColumn = (
  label: string = 'ID',
  options: Partial<TableColumnConfig> = {}
): TableColumnConfig => {
  return createBaseColumn('id', label, {
    width: COLUMN_WIDTHS.ID,
    align: 'right' as const,
    sortable: true,
    ...options
  })
}

/**
 * 创建序号列
 */
export const createIndexColumn = (
  label: string = '序号',
  options: Partial<TableColumnConfig> = {}
): TableColumnConfig => {
  return createBaseColumn('index', label, {
    type: 'index',
    width: COLUMN_WIDTHS.INDEX,
    align: 'center' as const,
    ...options
  })
}

/**
 * 创建选择列
 */
export const createSelectionColumn = (
  options: Partial<TableColumnConfig> = {}
): TableColumnConfig => {
  return createBaseColumn('selection', '', {
    type: 'selection',
    width: COLUMN_WIDTHS.SELECTION,
    align: 'center' as const,
    ...options
  })
}

/**
 * 创建姓名列
 */
export const createNameColumn = (
  label: string = '姓名',
  prop: string = 'name',
  size: 'short' | 'medium' | 'long' = 'long',
  options: Partial<TableColumnConfig> = {}
): TableColumnConfig => {
  const widthMap = {
    short: COLUMN_WIDTHS.NAME_SHORT,
    medium: COLUMN_WIDTHS.NAME_MEDIUM,
    long: COLUMN_WIDTHS.NAME_LONG
  }
  
  return createBaseColumn(prop, label, {
    width: widthMap[size],
    showOverflowTooltip: true,
    align: 'left' as const,
    ...options
  })
}

/**
 * 创建电话列
 */
export const createPhoneColumn = (
  label: string = '联系电话',
  prop: string = 'phone',
  options: Partial<TableColumnConfig> = {}
): TableColumnConfig => {
  return createBaseColumn(prop, label, {
    width: COLUMN_WIDTHS.PHONE,
    showOverflowTooltip: true,
    align: 'center' as const,
    ...options
  })
}

/**
 * 创建邮箱列
 */
export const createEmailColumn = (
  label: string = '邮箱',
  prop: string = 'email',
  options: Partial<TableColumnConfig> = {}
): TableColumnConfig => {
  return createBaseColumn(prop, label, {
    width: COLUMN_WIDTHS.EMAIL,
    showOverflowTooltip: true,
    align: 'left' as const,
    ...options
  })
}

/**
 * 创建状态列
 */
export const createStatusColumn = (
  label: string = '状态',
  prop: string = 'status',
  options: Partial<TableColumnConfig> = {}
): TableColumnConfig => {
  return createBaseColumn(prop, label, {
    width: COLUMN_WIDTHS.STATUS,
    align: 'center' as const,
    ...options
  })
}

/**
 * 创建日期列
 */
export const createDateColumn = (
  label: string,
  prop: string,
  options: Partial<TableColumnConfig> = {}
): TableColumnConfig => {
  return createBaseColumn(prop, label, {
    width: COLUMN_WIDTHS.DATE,
    align: 'center' as const,
    sortable: true,
    ...options
  })
}

/**
 * 创建日期时间列
 */
export const createDateTimeColumn = (
  label: string,
  prop: string,
  options: Partial<TableColumnConfig> = {}
): TableColumnConfig => {
  return createBaseColumn(prop, label, {
    width: COLUMN_WIDTHS.DATETIME,
    align: 'center' as const,
    sortable: true,
    showOverflowTooltip: true,
    ...options
  })
}

/**
 * 创建数字列
 */
export const createNumberColumn = (
  label: string,
  prop: string,
  size: 'short' | 'medium' | 'long' = 'medium',
  options: Partial<TableColumnConfig> = {}
): TableColumnConfig => {
  const widthMap = {
    short: COLUMN_WIDTHS.NUMBER_SHORT,
    medium: COLUMN_WIDTHS.NUMBER_MEDIUM,
    long: COLUMN_WIDTHS.NUMBER_LONG
  }
  
  return createBaseColumn(prop, label, {
    width: widthMap[size],
    align: 'right' as const,
    sortable: true,
    ...options
  })
}

/**
 * 创建金额列
 */
export const createMoneyColumn = (
  label: string,
  prop: string,
  options: Partial<TableColumnConfig> = {}
): TableColumnConfig => {
  return createBaseColumn(prop, label, {
    width: COLUMN_WIDTHS.MONEY,
    align: 'right' as const,
    sortable: true,
    ...options
  })
}

/**
 * 创建百分比列
 */
export const createPercentColumn = (
  label: string,
  prop: string,
  options: Partial<TableColumnConfig> = {}
): TableColumnConfig => {
  return createBaseColumn(prop, label, {
    width: COLUMN_WIDTHS.PERCENT,
    align: 'right' as const,
    sortable: true,
    ...options
  })
}

/**
 * 创建文本列
 */
export const createTextColumn = (
  label: string,
  prop: string,
  size: 'short' | 'medium' | 'long' = 'medium',
  options: Partial<TableColumnConfig> = {}
): TableColumnConfig => {
  const widthMap = {
    short: COLUMN_WIDTHS.TEXT_SHORT,
    medium: COLUMN_WIDTHS.TEXT_MEDIUM,
    long: COLUMN_WIDTHS.TEXT_LONG
  }
  
  return createBaseColumn(prop, label, {
    width: widthMap[size],
    showOverflowTooltip: true,
    align: 'left' as const,
    ...options
  })
}

/**
 * 创建操作列
 */
export const createActionsColumn = (
  label: string = '操作',
  size: 'small' | 'medium' | 'large' = 'medium',
  options: Partial<TableColumnConfig> = {}
): TableColumnConfig => {
  const widthMap = {
    small: COLUMN_WIDTHS.ACTIONS_SMALL,
    medium: COLUMN_WIDTHS.ACTIONS_MEDIUM,
    large: COLUMN_WIDTHS.ACTIONS_LARGE
  }
  
  return createBaseColumn('actions', label, {
    type: 'actions',
    width: widthMap[size],
    fixed: 'right' as const,
    align: 'center' as const,
    ...options
  })
}

/**
 * 批量创建列配置
 */
export const createColumns = (configs: Array<{
  type: ColumnType
  label?: string
  prop?: string
  size?: 'short' | 'medium' | 'long' | 'small' | 'large'
  options?: Partial<TableColumnConfig>
}>): TableColumnConfig[] => {
  return configs.map(config => {
    const { type, label = '', prop = '', size, options = {} } = config
    
    switch (type) {
      case ColumnType.ID:
        return createIdColumn(label, options)
      case ColumnType.INDEX:
        return createIndexColumn(label, options)
      case ColumnType.SELECTION:
        return createSelectionColumn(options)
      case ColumnType.NAME:
        return createNameColumn(label, prop, size as any, options)
      case ColumnType.PHONE:
        return createPhoneColumn(label, prop, options)
      case ColumnType.EMAIL:
        return createEmailColumn(label, prop, options)
      case ColumnType.STATUS:
        return createStatusColumn(label, prop, options)
      case ColumnType.DATE:
        return createDateColumn(label, prop, options)
      case ColumnType.DATETIME:
        return createDateTimeColumn(label, prop, options)
      case ColumnType.NUMBER:
        return createNumberColumn(label, prop, size as any, options)
      case ColumnType.MONEY:
        return createMoneyColumn(label, prop, options)
      case ColumnType.PERCENT:
        return createPercentColumn(label, prop, options)
      case ColumnType.ACTIONS:
        return createActionsColumn(label, size as any, options)
      default:
        return createTextColumn(label, prop, size as any, options)
    }
  })
}

