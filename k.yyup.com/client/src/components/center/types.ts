export interface Column {
  key: string
  label: string
  width?: string
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  cellClassName?: string | ((row: any) => string)
}
