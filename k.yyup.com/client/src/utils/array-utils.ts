/**
 * Array utility functions
 * Provides lodash-style array manipulation functions
 */

/**
 * Creates an array of elements split into groups the length of size
 */
export function chunk<T>(array: T[], size: number): T[][] {
  if (!Array.isArray(array) || size <= 0) return []
  
  const result: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size))
  }
  return result
}

/**
 * Creates an array with all falsy values removed
 */
export function compact<T>(array: (T | null | undefined | false | 0 | '')[]): T[] {
  if (!Array.isArray(array)) return []
  return array.filter(Boolean) as T[]
}

/**
 * Creates a new array concatenating array with any additional arrays and/or values
 */
export function concat<T>(...arrays: (T | T[])[]): T[] {
  const result: T[] = []
  for (const item of arrays) {
    if (Array.isArray(item)) {
      result.push(...item)
    } else if (item != null) { // 过滤掉null和undefined
      result.push(item)
    }
  }
  return result
}

/**
 * Creates an array of array values not included in the other given arrays
 */
export function difference<T>(array: T[], ...values: T[][]): T[] {
  if (!Array.isArray(array)) return []
  const excludeSet = new Set(values.flat())
  return array.filter(item => !excludeSet.has(item))
}

/**
 * This method is like difference except that it accepts iteratee which is invoked for each element
 */
export function differenceBy<T>(array: T[], values: T[], iteratee: (value: T) => any): T[] {
  const excludeSet = new Set(values.map(iteratee))
  return array.filter(item => !excludeSet.has(iteratee(item)))
}

/**
 * This method is like difference except that it accepts comparator which is invoked to compare elements
 */
export function differenceWith<T>(array: T[], values: T[], comparator: (a: T, b: T) => boolean): T[] {
  return array.filter(a => !values.some(b => comparator(a, b)))
}

/**
 * Creates a slice of array with n elements dropped from the beginning
 */
export function drop<T>(array: T[], n: number = 1): T[] {
  if (!Array.isArray(array)) return []
  if (n < 0) return array.slice() // 负数时返回整个数组的副本
  return array.slice(n)
}

/**
 * Creates a slice of array with n elements dropped from the end
 */
export function dropRight<T>(array: T[], n: number = 1): T[] {
  return array.slice(0, -n || array.length)
}

/**
 * Creates a slice of array excluding elements dropped from the beginning
 */
export function dropWhile<T>(array: T[], predicate: (value: T, index: number, array: T[]) => boolean): T[] {
  let index = 0
  while (index < array.length && predicate(array[index], index, array)) {
    index++
  }
  return array.slice(index)
}

/**
 * Creates a slice of array excluding elements dropped from the end
 */
export function dropRightWhile<T>(array: T[], predicate: (value: T, index: number, array: T[]) => boolean): T[] {
  let index = array.length - 1
  while (index >= 0 && predicate(array[index], index, array)) {
    index--
  }
  return array.slice(0, index + 1)
}

/**
 * Fills elements of array with value from start up to, but not including, end
 */
export function fill<T>(array: T[], value: any, start: number = 0, end?: number): T[] {
  if (!Array.isArray(array)) return []
  const actualEnd = end !== undefined ? end : array.length
  const result = [...array]
  for (let i = start; i < Math.min(actualEnd, result.length); i++) {
    result[i] = value
  }
  return result
}

/**
 * Iterates over elements of collection, returning the first element predicate returns truthy for
 */
export function find<T>(array: T[], predicate: (value: T, index: number, array: T[]) => boolean): T | undefined {
  if (!Array.isArray(array)) return undefined
  return array.find(predicate)
}

/**
 * This method is like find except that it returns the index of the first element predicate returns truthy for
 */
export function findIndex<T>(array: T[], predicate: (value: T, index: number, array: T[]) => boolean): number {
  if (!Array.isArray(array)) return -1
  return array.findIndex(predicate)
}

/**
 * This method is like find except that it iterates over elements of collection from right to left
 */
export function findLast<T>(array: T[], predicate: (value: T, index: number, array: T[]) => boolean): T | undefined {
  for (let i = array.length - 1; i >= 0; i--) {
    if (predicate(array[i], i, array)) {
      return array[i]
    }
  }
  return undefined
}

/**
 * This method is like findIndex except that it iterates over elements of collection from right to left
 */
export function findLastIndex<T>(array: T[], predicate: (value: T, index: number, array: T[]) => boolean): number {
  for (let i = array.length - 1; i >= 0; i--) {
    if (predicate(array[i], i, array)) {
      return i
    }
  }
  return -1
}

/**
 * Gets the first element of array
 */
export function first<T>(array: T[]): T | undefined {
  if (!Array.isArray(array) || array.length === 0) return undefined
  return array[0]
}

/**
 * Alias for first
 */
export const head = first

/**
 * Flattens array a single level deep
 */
export function flatten<T>(array: (T | T[])[]): T[] {
  if (!Array.isArray(array)) return []
  return array.flat() as T[]
}

/**
 * Recursively flattens array
 */
export function flattenDeep<T>(array: any[]): T[] {
  if (!Array.isArray(array)) return []
  return array.flat(Infinity) as T[]
}

/**
 * Recursively flatten array up to depth times
 */
export function flattenDepth<T>(array: any[], depth: number = 1): T[] {
  return array.flat(depth) as T[]
}

/**
 * The inverse of toPairs; this method returns an object composed from key-value pairs
 */
export function fromPairs<T>(pairs: [string, T][]): Record<string, T> {
  const result: Record<string, T> = {}
  for (const [key, value] of pairs) {
    result[key] = value
  }
  return result
}

/**
 * Gets the index at which the first occurrence of value is found in array
 */
export function indexOf<T>(array: T[], value: T, fromIndex: number = 0): number {
  if (!Array.isArray(array)) return -1
  return array.indexOf(value, fromIndex)
}

/**
 * Gets all but the last element of array
 */
export function initial<T>(array: T[]): T[] {
  if (!Array.isArray(array)) return []
  return array.slice(0, -1)
}

/**
 * Creates an array of unique values that are included in all given arrays
 */
export function intersection<T>(...arrays: T[][]): T[] {
  if (arrays.length === 0) return []
  if (arrays.some(arr => !Array.isArray(arr))) return []
  if (arrays.length === 1) return [...arrays[0]]
  
  const [first, ...rest] = arrays
  return first.filter(item => rest.every(arr => arr.includes(item)))
}

/**
 * This method is like intersection except that it accepts iteratee which is invoked for each element
 */
export function intersectionBy<T>(arrays: T[][], iteratee: (value: T) => any): T[] {
  if (arrays.length === 0) return []
  if (arrays.length === 1) return [...arrays[0]]
  
  const [first, ...rest] = arrays
  const restMapped = rest.map(arr => new Set(arr.map(iteratee)))
  
  return first.filter(item => {
    const mappedItem = iteratee(item)
    return restMapped.every(set => set.has(mappedItem))
  })
}

/**
 * This method is like intersection except that it accepts comparator which is invoked to compare elements
 */
export function intersectionWith<T>(arrays: T[][], comparator: (a: T, b: T) => boolean): T[] {
  if (arrays.length === 0) return []
  if (arrays.length === 1) return [...arrays[0]]
  
  const [first, ...rest] = arrays
  return first.filter(item => rest.every(arr => arr.some(arrItem => comparator(item, arrItem))))
}

/**
 * Converts all elements in array into a string separated by separator
 */
export function join<T>(array: T[], separator: string = ','): string {
  if (!Array.isArray(array)) return ''
  return array.join(separator)
}

/**
 * Gets the last element of array
 */
export function last<T>(array: T[]): T | undefined {
  if (!Array.isArray(array) || array.length === 0) return undefined
  return array[array.length - 1]
}

/**
 * This method is like indexOf except that it iterates over elements of array from right to left
 */
export function lastIndexOf<T>(array: T[], value: T, fromIndex: number = array?.length - 1 || 0): number {
  if (!Array.isArray(array)) return -1
  return array.lastIndexOf(value, fromIndex)
}

/**
 * Gets the element at index n of array
 */
export function nth<T>(array: T[], n: number): T | undefined {
  if (!Array.isArray(array)) return undefined
  const length = array.length
  if (n < 0) {
    n = length + n
  }
  return array[n]
}

/**
 * Removes all given values from array using SameValueZero for equality comparisons
 */
export function pull<T>(array: T[], ...values: T[]): T[] {
  const valueSet = new Set(values)
  return array.filter(item => !valueSet.has(item))
}

/**
 * This method is like pull except that it accepts an array of values to remove
 */
export function pullAll<T>(array: T[], values: T[]): T[] {
  const valueSet = new Set(values)
  return array.filter(item => !valueSet.has(item))
}

/**
 * This method is like pullAll except that it accepts iteratee which is invoked for each element
 */
export function pullAllBy<T>(array: T[], values: T[], iteratee: (value: T) => any): T[] {
  const valueSet = new Set(values.map(iteratee))
  return array.filter(item => !valueSet.has(iteratee(item)))
}

/**
 * This method is like pullAll except that it accepts comparator which is invoked to compare elements
 */
export function pullAllWith<T>(array: T[], values: T[], comparator: (a: T, b: T) => boolean): T[] {
  return array.filter(a => !values.some(b => comparator(a, b)))
}

/**
 * Removes elements from array corresponding to indexes and returns an array of removed elements
 */
export function pullAt<T>(array: T[], ...indexes: number[]): T[] {
  const result: T[] = []
  const sortedIndexes = [...indexes].sort((a, b) => b - a) // Sort in descending order

  for (const index of sortedIndexes) {
    if (index >= 0 && index < array.length) {
      result.unshift(array.splice(index, 1)[0])
    }
  }

  return result.reverse()
}

/**
 * Removes all elements from array that predicate returns truthy for
 */
export function remove<T>(array: T[], predicate: (value: T, index: number, array: T[]) => boolean): T[] {
  if (!Array.isArray(array)) return []
  const result: T[] = []
  for (let i = array.length - 1; i >= 0; i--) {
    if (predicate(array[i], i, array)) {
      result.unshift(array.splice(i, 1)[0])
    }
  }
  return result
}

/**
 * Reverses array so that the first element becomes the last, the second element becomes the second to last, and so on
 */
export function reverse<T>(array: T[]): T[] {
  if (!Array.isArray(array)) return []
  return array.reverse()
}

/**
 * Creates a slice of array from start up to, but not including, end
 */
export function slice<T>(array: T[], start: number = 0, end: number = array?.length || 0): T[] {
  if (!Array.isArray(array)) return []
  return array.slice(start, end)
}

/**
 * Uses a binary search to determine the lowest index at which value should be inserted into array
 */
export function sortedIndex<T>(array: T[], value: T): number {
  let low = 0
  let high = array.length

  while (low < high) {
    const mid = Math.floor((low + high) / 2)
    if (array[mid] < value) {
      low = mid + 1
    } else {
      high = mid
    }
  }

  return low
}

/**
 * This method is like sortedIndex except that it accepts iteratee
 */
export function sortedIndexBy<T>(array: T[], value: T, iteratee: (value: T) => any): number {
  const mappedValue = iteratee(value)
  let low = 0
  let high = array.length

  while (low < high) {
    const mid = Math.floor((low + high) / 2)
    if (iteratee(array[mid]) < mappedValue) {
      low = mid + 1
    } else {
      high = mid
    }
  }

  return low
}

/**
 * This method is like indexOf except that it performs a binary search on a sorted array
 */
export function sortedIndexOf<T>(array: T[], value: T): number {
  const index = sortedIndex(array, value)
  return index < array.length && array[index] === value ? index : -1
}

/**
 * This method is like sortedIndex except that it returns the highest index at which value should be inserted
 */
export function sortedLastIndex<T>(array: T[], value: T): number {
  let low = 0
  let high = array.length

  while (low < high) {
    const mid = Math.floor((low + high) / 2)
    if (array[mid] <= value) {
      low = mid + 1
    } else {
      high = mid
    }
  }

  return low
}

/**
 * This method is like sortedLastIndex except that it accepts iteratee
 */
export function sortedLastIndexBy<T>(array: T[], value: T, iteratee: (value: T) => any): number {
  const mappedValue = iteratee(value)
  let low = 0
  let high = array.length

  while (low < high) {
    const mid = Math.floor((low + high) / 2)
    if (iteratee(array[mid]) <= mappedValue) {
      low = mid + 1
    } else {
      high = mid
    }
  }

  return low
}

/**
 * This method is like lastIndexOf except that it performs a binary search on a sorted array
 */
export function sortedLastIndexOf<T>(array: T[], value: T): number {
  const index = sortedLastIndex(array, value) - 1
  return index >= 0 && array[index] === value ? index : -1
}

/**
 * This method is like uniq except that it's designed and optimized for sorted arrays
 */
export function sortedUniq<T>(array: T[]): T[] {
  const result: T[] = []
  let prev: T | undefined

  for (const item of array) {
    if (item !== prev) {
      result.push(item)
      prev = item
    }
  }

  return result
}

/**
 * This method is like sortedUniq except that it accepts iteratee
 */
export function sortedUniqBy<T>(array: T[], iteratee: (value: T) => any): T[] {
  const result: T[] = []
  let prevMapped: any

  for (const item of array) {
    const mapped = iteratee(item)
    if (mapped !== prevMapped) {
      result.push(item)
      prevMapped = mapped
    }
  }

  return result
}

/**
 * Gets all but the first element of array
 */
export function tail<T>(array: T[]): T[] {
  if (!Array.isArray(array)) return []
  return array.slice(1)
}

/**
 * Creates a slice of array with n elements taken from the beginning
 */
export function take<T>(array: T[], n: number = 1): T[] {
  if (!Array.isArray(array) || n <= 0) return []
  return array.slice(0, n)
}

/**
 * Creates a slice of array with n elements taken from the end
 */
export function takeRight<T>(array: T[], n: number = 1): T[] {
  if (!Array.isArray(array) || n <= 0) return []
  return array.slice(-n)
}

/**
 * Creates a slice of array with elements taken from the beginning
 */
export function takeWhile<T>(array: T[], predicate: (value: T, index: number, array: T[]) => boolean): T[] {
  const result: T[] = []
  for (let i = 0; i < array.length; i++) {
    if (!predicate(array[i], i, array)) break
    result.push(array[i])
  }
  return result
}

/**
 * Creates a slice of array with elements taken from the end
 */
export function takeRightWhile<T>(array: T[], predicate: (value: T, index: number, array: T[]) => boolean): T[] {
  const result: T[] = []
  for (let i = array.length - 1; i >= 0; i--) {
    if (!predicate(array[i], i, array)) break
    result.unshift(array[i])
  }
  return result
}

/**
 * Creates an array of unique values, in order, from all given arrays
 */
export function union<T>(...arrays: T[][]): T[] {
  const validArrays = arrays.filter(arr => Array.isArray(arr))
  return [...new Set(validArrays.flat())]
}

/**
 * This method is like union except that it accepts iteratee
 */
export function unionBy<T>(arrays: T[][], iteratee: (value: T) => any): T[] {
  const seen = new Set()
  const result: T[] = []

  for (const array of arrays) {
    for (const item of array) {
      const mapped = iteratee(item)
      if (!seen.has(mapped)) {
        seen.add(mapped)
        result.push(item)
      }
    }
  }

  return result
}

/**
 * This method is like union except that it accepts comparator
 */
export function unionWith<T>(arrays: T[][], comparator: (a: T, b: T) => boolean): T[] {
  const result: T[] = []

  for (const array of arrays) {
    for (const item of array) {
      if (!result.some(resultItem => comparator(item, resultItem))) {
        result.push(item)
      }
    }
  }

  return result
}

/**
 * Creates a duplicate-free version of an array
 */
export function uniq<T>(array: T[]): T[] {
  return [...new Set(array)]
}

/**
 * This method is like uniq except that it accepts iteratee
 */
export function uniqBy<T>(array: T[], iteratee: (value: T) => any): T[] {
  const seen = new Set()
  const result: T[] = []

  for (const item of array) {
    const mapped = iteratee(item)
    if (!seen.has(mapped)) {
      seen.add(mapped)
      result.push(item)
    }
  }

  return result
}

/**
 * This method is like uniq except that it accepts comparator
 */
export function uniqWith<T>(array: T[], comparator: (a: T, b: T) => boolean): T[] {
  const result: T[] = []

  for (const item of array) {
    if (!result.some(resultItem => comparator(item, resultItem))) {
      result.push(item)
    }
  }

  return result
}

/**
 * This method is like zip except that it accepts an array of grouped elements
 */
export function unzip<T>(array: T[][]): T[][] {
  if (array.length === 0) return []

  const maxLength = Math.max(...array.map(arr => arr.length))
  const result: T[][] = []

  for (let i = 0; i < maxLength; i++) {
    result.push(array.map(arr => arr[i]))
  }

  return result
}

/**
 * This method is like unzip except that it accepts iteratee
 */
export function unzipWith<T, R>(array: T[][], iteratee: (...values: T[]) => R): R[] {
  const unzipped = unzip(array)
  return unzipped.map(group => iteratee(...group))
}

/**
 * Creates an array excluding all given values
 */
export function without<T>(array: T[], ...values: T[]): T[] {
  if (!Array.isArray(array)) return []
  const valueSet = new Set(values)
  return array.filter(item => !valueSet.has(item))
}

/**
 * Creates an array of unique values that is the symmetric difference of the given arrays
 */
export function xor<T>(...arrays: T[][]): T[] {
  const allItems = arrays.flat()
  const counts = new Map<T, number>()

  for (const item of allItems) {
    counts.set(item, (counts.get(item) || 0) + 1)
  }

  return [...counts.entries()]
    .filter(([, count]) => count === 1)
    .map(([item]) => item)
}

/**
 * This method is like xor except that it accepts iteratee
 */
export function xorBy<T>(arrays: T[][], iteratee: (value: T) => any): T[] {
  const itemMap = new Map<any, T>()
  const counts = new Map<any, number>()

  for (const array of arrays) {
    for (const item of array) {
      const mapped = iteratee(item)
      itemMap.set(mapped, item)
      counts.set(mapped, (counts.get(mapped) || 0) + 1)
    }
  }

  return [...counts.entries()]
    .filter(([, count]) => count === 1)
    .map(([mapped]) => itemMap.get(mapped)!)
}

/**
 * This method is like xor except that it accepts comparator
 */
export function xorWith<T>(arrays: T[][], comparator: (a: T, b: T) => boolean): T[] {
  const result: T[] = []
  const allItems = arrays.flat()

  for (const item of allItems) {
    const occurrences = allItems.filter(other => comparator(item, other)).length
    if (occurrences === 1 && !result.some(resultItem => comparator(item, resultItem))) {
      result.push(item)
    }
  }

  return result
}

/**
 * Creates an array of grouped elements
 */
export function zip<T>(...arrays: T[][]): T[][] {
  if (arrays.length === 0) return []
  
  // Check if any array is null/undefined
  if (arrays.some(arr => !Array.isArray(arr))) return []

  // Check if any array is empty
  if (arrays.some(arr => arr.length === 0)) return []

  const minLength = Math.min(...arrays.map(arr => arr.length))
  const result: T[][] = []

  for (let i = 0; i < minLength; i++) {
    result.push(arrays.map(arr => arr[i]))
  }

  return result
}

/**
 * This method is like fromPairs except that it accepts two arrays
 */
export function zipObject<T>(props: string[], values: T[]): Record<string, T> {
  const result: Record<string, T> = {}
  for (let i = 0; i < props.length; i++) {
    result[props[i]] = values[i]
  }
  return result
}

/**
 * This method is like zipObject except that it supports property paths
 */
export function zipObjectDeep<T>(props: string[], values: T[]): Record<string, any> {
  const result: Record<string, any> = {}

  for (let i = 0; i < props.length; i++) {
    const path = props[i].split('.')
    let current = result

    for (let j = 0; j < path.length - 1; j++) {
      if (!(path[j] in current)) {
        current[path[j]] = {}
      }
      current = current[path[j]]
    }

    current[path[path.length - 1]] = values[i]
  }

  return result
}

/**
 * This method is like zip except that it accepts iteratee
 */
export function zipWith<T, R>(...args: [...T[][], ((...values: T[]) => R)]): R[] {
  const arrays = args.slice(0, -1) as T[][]
  const iteratee = args[args.length - 1] as (...values: T[]) => R

  if (arrays.length === 0) return []

  const maxLength = Math.max(...arrays.map(arr => arr.length))
  const result: R[] = []

  for (let i = 0; i < maxLength; i++) {
    const values = arrays.map(arr => arr[i])
    result.push(iteratee(...values))
  }

  return result
}

// Additional utility functions

/**
 * Creates an array of elements, sorted in ascending order by the results of running each element through iteratee
 */
export function sortBy<T>(array: T[], iteratee: ((value: T) => any) | string): T[] {
  if (!Array.isArray(array)) return []

  const getKey = typeof iteratee === 'function' ? iteratee : (obj: any) => obj[iteratee]

  return [...array].sort((a, b) => {
    const aVal = getKey(a)
    const bVal = getKey(b)
    if (aVal < bVal) return -1
    if (aVal > bVal) return 1
    return 0
  })
}

/**
 * Checks if array is empty
 */
export function isEmpty<T>(array: T[]): boolean {
  return !Array.isArray(array) || array.length === 0
}

// Missing functions that tests expect

/**
 * Creates an object composed of keys generated from the results of running each element through iteratee
 */
export function countBy<T>(array: T[], iteratee: ((value: T) => any) | string): Record<string, number> {
  if (!Array.isArray(array)) return {}

  const result: Record<string, number> = {}
  const getKey = typeof iteratee === 'function' ? iteratee : (obj: any) => obj[iteratee]

  for (const item of array) {
    const key = String(getKey(item))
    result[key] = (result[key] || 0) + 1
  }

  return result
}

/**
 * Iterates over elements of array and invokes iteratee for each element
 */
export function each<T>(array: T[], iteratee: (value: T, index: number, array: T[]) => void): T[] {
  if (!Array.isArray(array)) return []

  for (let i = 0; i < array.length; i++) {
    iteratee(array[i], i, array)
  }

  return array
}

/**
 * Checks if predicate returns truthy for all elements of array
 */
export function every<T>(array: T[], predicate: (value: T) => boolean): boolean {
  if (!Array.isArray(array)) return true

  return array.every(predicate)
}

/**
 * Iterates over elements of array, returning an array of all elements predicate returns truthy for
 */
export function filter<T>(array: T[], predicate: (value: T) => boolean): T[] {
  if (!Array.isArray(array)) return []

  return array.filter(predicate)
}

/**
 * Creates an object composed of keys generated from the results of running each element through iteratee
 */
export function groupBy<T>(array: T[], iteratee: ((value: T) => any) | string): Record<string, T[]> {
  if (!Array.isArray(array)) return {}

  const result: Record<string, T[]> = {}
  const getKey = typeof iteratee === 'function' ? iteratee : (obj: any) => obj[iteratee]

  for (const item of array) {
    const key = String(getKey(item))
    if (!result[key]) result[key] = []
    result[key].push(item)
  }

  return result
}

/**
 * Checks if value is in array
 */
export function includes<T>(array: T[], value: T, fromIndex: number = 0): boolean {
  if (!Array.isArray(array)) return false

  return array.includes(value, fromIndex)
}

/**
 * Creates an array of values by running each element in collection thru iteratee
 */
export function map<T, R>(array: T[], iteratee: (value: T) => R): R[]
export function map<T, R>(obj: Record<string, T>, iteratee: (value: T, key: string, obj: Record<string, T>) => R): R[]
export function map<T, R>(collection: T[] | Record<string, T>, iteratee: any): R[] {
  if (Array.isArray(collection)) {
    return collection.map(iteratee)
  } else if (typeof collection === 'object' && collection !== null) {
    return Object.entries(collection).map(([key, value]) => iteratee(value, key, collection as Record<string, T>))
  }
  return []
}

/**
 * Reduces array to a value which is the accumulated result of running each element through iteratee
 */
export function reduce<T, R>(array: T[], iteratee: (accumulator: R, value: T) => R, initialValue?: R): R {
  if (!Array.isArray(array)) {
    if (initialValue !== undefined) return initialValue
    throw new TypeError('Reduce of empty array with no initial value')
  }

  if (initialValue !== undefined) {
    return array.reduce(iteratee, initialValue)
  } else {
    return array.reduce(iteratee as any)
  }
}

/**
 * Checks if predicate returns truthy for any element of array
 */
export function some<T>(array: T[], predicate: (value: T) => boolean): boolean {
  if (!Array.isArray(array)) return false

  return array.some(predicate)
}

/**
 * Gets the size of array
 */
export function size<T>(array: T[]): number {
  if (!Array.isArray(array)) return 0

  return array.length
}

/**
 * Creates an array of shuffled values
 */
export function shuffle<T>(array: T[]): T[] {
  if (!Array.isArray(array)) return []

  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }

  return result
}

/**
 * Gets a random element from array
 */
export function sample<T>(array: T[]): T | undefined {
  if (!Array.isArray(array) || array.length === 0) return undefined

  return array[Math.floor(Math.random() * array.length)]
}

/**
 * Gets n random elements from array
 */
export function sampleSize<T>(array: T[], n: number): T[] {
  if (!Array.isArray(array)) return []
  if (n <= 0) return []
  if (n >= array.length) return shuffle(array)

  const shuffled = shuffle(array)
  return shuffled.slice(0, n)
}

/**
 * Creates an array of elements split into two groups
 */
export function partition<T>(array: T[], predicate: (value: T) => boolean): [T[], T[]] {
  if (!Array.isArray(array)) return [[], []]

  const truthy: T[] = []
  const falsy: T[] = []

  for (const item of array) {
    if (predicate(item)) {
      truthy.push(item)
    } else {
      falsy.push(item)
    }
  }

  return [truthy, falsy]
}

/**
 * Creates an object composed of keys generated from the results of running each element through iteratee
 */
export function keyBy<T>(array: T[], iteratee: ((value: T) => any) | string): Record<string, T> {
  if (!Array.isArray(array)) return {}

  const result: Record<string, T> = {}
  const getKey = typeof iteratee === 'function' ? iteratee : (obj: any) => obj[iteratee]

  for (const item of array) {
    const key = String(getKey(item))
    result[key] = item
  }

  return result
}

/**
 * Creates an array of elements, sorted in ascending order by the results of running each element through each iteratee
 */
export function orderBy<T>(array: T[], iteratees: string[], orders: ('asc' | 'desc')[]): T[] {
  if (!Array.isArray(array)) return []

  return [...array].sort((a, b) => {
    // If no iteratees specified, sort by value directly
    if (iteratees.length === 0) {
      const order = orders[0] || 'asc'
      if (a < b) return order === 'asc' ? -1 : 1
      if (a > b) return order === 'asc' ? 1 : -1
      return 0
    }

    for (let i = 0; i < iteratees.length; i++) {
      const iteratee = iteratees[i]
      const order = orders[i] || 'asc'

      const aVal = (a as any)[iteratee]
      const bVal = (b as any)[iteratee]

      if (aVal < bVal) return order === 'asc' ? -1 : 1
      if (aVal > bVal) return order === 'asc' ? 1 : -1
    }
    return 0
  })
}
