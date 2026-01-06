/**
 * Element Plus 兼容性修复工具
 * 解决Element Plus升级过程中的常见问题
 */

// 修复Element Plus 2.x中的一些deprecation警告

/**
 * 确保数据是数组类型
 * @param data 要检查的数据
 * @param defaultValue 默认值
 * @returns 安全的数组
 */
export function ensureArray<T>(data: any, defaultValue: T[] = []): T[] {
  if (!Array.isArray(data)) {
    console.warn('Expected array but got:', typeof data, data)
    return defaultValue
  }
  return data
}

/**
 * 安全的数组reduce操作
 * @param data 数组数据
 * @param reducer reduce函数
 * @param initialValue 初始值
 * @returns reduce结果
 */
export function safeReduce<T, R>(
  data: any, 
  reducer: (prev: R, curr: T, index: number, array: T[]) => R, 
  initialValue: R
): R {
  const safeArray = ensureArray<T>(data)
  return safeArray.reduce(reducer, initialValue)
}

/**
 * 安全的数组filter操作
 * @param data 数组数据
 * @param predicate 过滤函数
 * @returns 过滤后的数组
 */
export function safeFilter<T>(
  data: any, 
  predicate: (value: T, index: number, array: T[]) => boolean
): T[] {
  const safeArray = ensureArray<T>(data)
  return safeArray.filter(predicate)
}

/**
 * 安全的数组find操作
 * @param data 数组数据
 * @param predicate 查找函数
 * @returns 找到的元素或undefined
 */
export function safeFind<T>(
  data: any, 
  predicate: (value: T, index: number, array: T[]) => boolean
): T | undefined {
  const safeArray = ensureArray<T>(data)
  return safeArray.find(predicate)
}

/**
 * 修复Element Plus button type="text" 的问题
 * 在Element Plus 2.x中，type="text"被deprecated，应该使用link属性
 */
export function getButtonProps(type?: string, text?: boolean) {
  if (type === 'text' || text) {
    return {
      link: true,
      type: type === 'text' ? undefined : type
    }
  }
  return { type }
}

/**
 * 修复Element Plus table相关的props
 */
export function getTableProps(props: any) {
  const fixedProps = { ...props }
  
  // 修复label act as value的警告
  if (fixedProps.label && !fixedProps.value) {
    fixedProps.value = fixedProps.label
  }
  
  return fixedProps
}

/**
 * 确保组件props的类型安全
 */
export function validateComponentProps(props: any, requiredFields: string[] = []) {
  const errors: string[] = []
  
  requiredFields.forEach(field => {
    if (props[field] === undefined || props[field] === null) {
      errors.push(`Required prop '${field}' is missing`)
    }
  })
  
  if (errors.length > 0) {
    console.warn('Component prop validation errors:', errors)
  }
  
  return errors.length === 0
}

/**
 * 安全的数组方法调用包装器
 */
export class SafeArray<T> {
  private data: T[]
  
  constructor(data: any) {
    this.data = ensureArray<T>(data)
  }
  
  get value(): T[] {
    // 安全检查：确保this.data仍然是数组
    if (!Array.isArray(this.data)) {
      console.warn('SafeArray.value: data is not an array:', typeof this.data, this.data)
      this.data = ensureArray<T>(this.data)
    }
    return this.data
  }
  
  find(predicate: (value: T, index: number, array: T[]) => boolean): T | undefined {
    // 安全检查：确保this.data仍然是数组
    if (!Array.isArray(this.data)) {
      console.warn('SafeArray.find: data is not an array:', typeof this.data, this.data)
      this.data = ensureArray<T>(this.data)
    }
    return this.data.find(predicate)
  }
  
  filter(predicate: (value: T, index: number, array: T[]) => boolean): T[] {
    // 安全检查：确保this.data仍然是数组
    if (!Array.isArray(this.data)) {
      console.warn('SafeArray.filter: data is not an array:', typeof this.data, this.data)
      this.data = ensureArray<T>(this.data)
    }
    return this.data.filter(predicate)
  }
  
  reduce<R>(reducer: (prev: R, curr: T, index: number, array: T[]) => R, initialValue: R): R {
    // 安全检查：确保this.data仍然是数组
    if (!Array.isArray(this.data)) {
      console.warn('SafeArray.reduce: data is not an array:', typeof this.data, this.data)
      this.data = ensureArray<T>(this.data)
    }
    return this.data.reduce(reducer, initialValue)
  }
  
  map<R>(mapper: (value: T, index: number, array: T[]) => R): R[] {
    // 安全检查：确保this.data仍然是数组
    if (!Array.isArray(this.data)) {
      console.warn('SafeArray.map: data is not an array:', typeof this.data, this.data)
      this.data = ensureArray<T>(this.data)
    }
    return this.data.map(mapper)
  }
  
  includes(searchElement: T, fromIndex?: number): boolean {
    // 安全检查：确保this.data仍然是数组
    if (!Array.isArray(this.data)) {
      console.warn('SafeArray.includes: data is not an array:', typeof this.data, this.data)
      this.data = ensureArray<T>(this.data)
    }
    return this.data.includes(searchElement, fromIndex)
  }
  
  get length(): number {
    // 安全检查：确保this.data仍然是数组
    if (!Array.isArray(this.data)) {
      console.warn('SafeArray.length: data is not an array:', typeof this.data, this.data)
      this.data = ensureArray<T>(this.data)
    }
    return this.data.length
  }
}