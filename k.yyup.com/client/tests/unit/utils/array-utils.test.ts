import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring'
import { 
  chunk, 
  compact, 
  concat, 
  difference, 
  differenceBy, 
  differenceWith, 
  drop, 
  dropRight, 
  dropWhile, 
  dropRightWhile, 
  fill, 
  find, 
  findIndex, 
  findLast, 
  findLastIndex, 
  first, 
  flatten, 
  flattenDeep, 
  flattenDepth, 
  fromPairs, 
  head, 
  indexOf, 
  initial, 
  intersection, 
  intersectionBy, 
  intersectionWith, 
  join, 
  last, 
  lastIndexOf, 
  nth, 
  pull, 
  pullAll, 
  pullAllBy, 
  pullAllWith, 
  pullAt, 
  remove, 
  reverse, 
  slice, 
  sortedIndex, 
  sortedIndexBy, 
  sortedIndexOf, 
  sortedLastIndex, 
  sortedLastIndexBy, 
  sortedLastIndexOf, 
  sortedUniq, 
  sortedUniqBy, 
  tail, 
  take, 
  takeRight, 
  takeRightWhile, 
  takeWhile, 
  union, 
  unionBy, 
  unionWith, 
  uniq, 
  uniqBy, 
  uniqWith, 
  unzip, 
  unzipWith, 
  without, 
  xor, 
  xorBy, 
  xorWith, 
  zip, 
  zipObject, 
  zipObjectDeep, 
  zipWith, 
  countBy, 
  each, 
  eachRight, 
  every, 
  filter, 
  findKey, 
  findLastKey, 
  forEach, 
  forEachRight, 
  forIn, 
  forInRight, 
  forOwn, 
  forOwnRight, 
  groupBy, 
  includes, 
  invokeMap, 
  keyBy, 
  map, 
  orderBy, 
  partition, 
  reduce, 
  reduceRight, 
  reject, 
  sample, 
  sampleSize, 
  shuffle, 
  size, 
  some, 
  sortBy, 
  defer, 
  delay, 
  castArray, 
  clone, 
  cloneDeep, 
  cloneDeepWith, 
  cloneWith, 
  conformsTo, 
  eq, 
  gt, 
  gte, 
  isArguments, 
  isArray, 
  isArrayBuffer, 
  isArrayLike, 
  isArrayLikeObject, 
  isBoolean, 
  isBuffer, 
  isDate, 
  isElement, 
  isEmpty, 
  isEqual, 
  isEqualWith, 
  isError, 
  isFinite, 
  isFunction, 
  isInteger, 
  isLength, 
  isMap, 
  isMatch, 
  isMatchWith, 
  isNaN, 
  isNative, 
  isNil, 
  isNull, 
  isNumber, 
  isObject, 
  isObjectLike, 
  isPlainObject, 
  isRegExp, 
  isSafeInteger, 
  isSet, 
  isString, 
  isSymbol, 
  isTypedArray, 
  isUndefined, 
  isWeakMap, 
  isWeakSet, 
  lt, 
  lte, 
  toArray, 
  toFinite, 
  toInteger, 
  toLength, 
  toNumber, 
  toPlainObject, 
  toSafeInteger, 
  toString, 
  add, 
  ceil, 
  divide, 
  floor, 
  max, 
  maxBy, 
  mean, 
  meanBy, 
  min, 
  minBy, 
  multiply, 
  round, 
  subtract, 
  sum, 
  sumBy, 
  clamp, 
  inRange, 
  random, 
  assign, 
  assignIn, 
  assignInWith, 
  assignWith, 
  at, 
  create, 
  defaults, 
  defaultsDeep, 
  entries, 
  entriesIn, 
  extend, 
  extendWith, 
  findKey, 
  findLastKey, 
  forIn, 
  forInRight, 
  forOwn, 
  forOwnRight, 
  functions, 
  functionsIn, 
  get, 
  has, 
  hasIn, 
  invert, 
  invertBy, 
  invoke, 
  keys, 
  keysIn, 
  mapKeys, 
  mapValues, 
  merge, 
  mergeWith, 
  omit, 
  omitBy, 
  pick, 
  pickBy, 
  result, 
  set, 
  setWith, 
  toPairs, 
  toPairsIn, 
  transform, 
  unset, 
  update, 
  updateWith, 
  values, 
  valuesIn, 
  defaults, 
  defaultsDeep, 
  find, 
  findIndex, 
  findLast, 
  findLastIndex, 
  head, 
  indexOf, 
  initial, 
  last, 
  lastIndexOf, 
  nth, 
  pull, 
  pullAll, 
  pullAllBy, 
  pullAllWith, 
  pullAt, 
  remove, 
  reverse, 
  slice, 
  sortedIndex, 
  sortedIndexBy, 
  sortedIndexOf, 
  sortedLastIndex, 
  sortedLastIndexBy, 
  sortedLastIndexOf, 
  sortedUniq, 
  sortedUniqBy, 
  tail, 
  take, 
  takeRight, 
  takeRightWhile, 
  takeWhile, 
  uniq, 
  uniqBy, 
  uniqWith, 
  without, 
  zip, 
  zipObject, 
  zipObjectDeep, 
  zipWith, 
  countBy, 
  each, 
  eachRight, 
  every, 
  filter, 
  findKey, 
  findLastKey, 
  forEach, 
  forEachRight, 
  forIn, 
  forInRight, 
  forOwn, 
  forOwnRight, 
  groupBy, 
  includes, 
  invokeMap, 
  keyBy, 
  map, 
  orderBy, 
  partition, 
  reduce, 
  reduceRight, 
  reject, 
  sample, 
  sampleSize, 
  shuffle, 
  size, 
  some, 
  sortBy, 
  defer, 
  delay, 
  castArray, 
  clone, 
  cloneDeep, 
  cloneDeepWith, 
  cloneWith, 
  conformsTo, 
  eq, 
  gt, 
  gte, 
  isArguments, 
  isArray, 
  isArrayBuffer, 
  isArrayLike, 
  isArrayLikeObject, 
  isBoolean, 
  isBuffer, 
  isDate, 
  isElement, 
  isEmpty, 
  isEqual, 
  isEqualWith, 
  isError, 
  isFinite, 
  isFunction, 
  isInteger, 
  isLength, 
  isMap, 
  isMatch, 
  isMatchWith, 
  isNaN, 
  isNative, 
  isNil, 
  isNull, 
  isNumber, 
  isObject, 
  isObjectLike, 
  isPlainObject, 
  isRegExp, 
  isSafeInteger, 
  isSet, 
  isString, 
  isSymbol, 
  isTypedArray, 
  isUndefined, 
  isWeakMap, 
  isWeakSet, 
  lt, 
  lte, 
  toArray, 
  toFinite, 
  toInteger, 
  toLength, 
  toNumber, 
  toPlainObject, 
  toSafeInteger, 
  toString, 
  add, 
  ceil, 
  divide, 
  floor, 
  max, 
  maxBy, 
  mean, 
  meanBy, 
  min, 
  minBy, 
  multiply, 
  round, 
  subtract, 
  sum, 
  sumBy, 
  clamp, 
  inRange, 
  random, 
  assign, 
  assignIn, 
  assignInWith, 
  assignWith, 
  at, 
  create, 
  defaults, 
  defaultsDeep, 
  entries, 
  entriesIn, 
  extend, 
  extendWith, 
  findKey, 
  findLastKey, 
  forIn, 
  forInRight, 
  forOwn, 
  forOwnRight, 
  functions, 
  functionsIn, 
  get, 
  has, 
  hasIn, 
  invert, 
  invertBy, 
  invoke, 
  keys, 
  keysIn, 
  mapKeys, 
  mapValues, 
  merge, 
  mergeWith, 
  omit, 
  omitBy, 
  pick, 
  pickBy, 
  result, 
  set, 
  setWith, 
  toPairs, 
  toPairsIn, 
  transform, 
  unset, 
  update, 
  updateWith, 
  values, 
  valuesIn 
} from '@/utils/array-utils'

// 控制台错误检测变量
let consoleSpy: any

describe('Array Utils - 完整错误检测', () => {
  beforeEach(() => {
    startConsoleMonitoring()
    vi.clearAllMocks()
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  afterEach(() => {
    expectNoConsoleErrors()
    stopConsoleMonitoring()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('chunk', () => {
    it('should split array into chunks of specified size', () => {
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
      expect(chunk(['a', 'b', 'c', 'd', 'e'], 3)).toEqual([['a', 'b', 'c'], ['d', 'e']])
    })

    it('should handle chunk size larger than array', () => {
      expect(chunk([1, 2, 3], 5)).toEqual([[1, 2, 3]])
    })

    it('should handle empty array', () => {
      expect(chunk([], 2)).toEqual([])
    })

    it('should handle chunk size of 1', () => {
      expect(chunk([1, 2, 3], 1)).toEqual([[1], [2], [3]])
    })

    it('should handle invalid chunk size', () => {
      expect(chunk([1, 2, 3], 0)).toEqual([])
      expect(chunk([1, 2, 3], -1)).toEqual([])
    })

    it('should handle null/undefined input', () => {
      expect(chunk(null as any, 2)).toEqual([])
      expect(chunk(undefined as any, 2)).toEqual([])
    })
  })

  describe('compact', () => {
    it('should remove falsy values from array', () => {
      expect(compact([0, 1, false, 2, '', 3])).toEqual([1, 2, 3])
      expect(compact([null, undefined, NaN, 'hello', true, 42])).toEqual(['hello', true, 42])
    })

    it('should handle empty array', () => {
      expect(compact([])).toEqual([])
    })

    it('should handle array with only falsy values', () => {
      expect(compact([0, false, '', null, undefined, NaN])).toEqual([])
    })

    it('should handle null/undefined input', () => {
      expect(compact(null as any)).toEqual([])
      expect(compact(undefined as any)).toEqual([])
    })
  })

  describe('concat', () => {
    it('should concatenate arrays', () => {
      expect(concat([1, 2], [3, 4])).toEqual([1, 2, 3, 4])
      expect(concat(['a', 'b'], ['c', 'd'], ['e', 'f'])).toEqual(['a', 'b', 'c', 'd', 'e', 'f'])
    })

    it('should concatenate arrays with values', () => {
      expect(concat([1, 2], 3, [4, 5])).toEqual([1, 2, 3, 4, 5])
      expect(concat(['a'], 'b', ['c'])).toEqual(['a', 'b', 'c'])
    })

    it('should handle empty arrays', () => {
      expect(concat([], [])).toEqual([])
      expect(concat([1, 2], [])).toEqual([1, 2])
      expect(concat([], [3, 4])).toEqual([3, 4])
    })

    it('should handle null/undefined input', () => {
      expect(concat(null as any, [1, 2])).toEqual([1, 2])
      expect(concat([1, 2], undefined as any)).toEqual([1, 2])
    })
  })

  describe('difference', () => {
    it('should return difference between arrays', () => {
      expect(difference([1, 2, 3], [2, 3])).toEqual([1])
      expect(difference(['a', 'b', 'c'], ['b', 'c'])).toEqual(['a'])
    })

    it('should handle empty arrays', () => {
      expect(difference([], [1, 2])).toEqual([])
      expect(difference([1, 2], [])).toEqual([1, 2])
      expect(difference([], [])).toEqual([])
    })

    it('should handle no difference', () => {
      expect(difference([1, 2, 3], [1, 2, 3])).toEqual([])
    })

    it('should handle null/undefined input', () => {
      expect(difference(null as any, [1, 2])).toEqual([])
      expect(difference([1, 2], undefined as any)).toEqual([1, 2])
    })
  })

  describe('drop', () => {
    it('should drop first n elements', () => {
      expect(drop([1, 2, 3, 4, 5], 2)).toEqual([3, 4, 5])
      expect(drop(['a', 'b', 'c'], 1)).toEqual(['b', 'c'])
    })

    it('should handle drop count larger than array length', () => {
      expect(drop([1, 2, 3], 5)).toEqual([])
    })

    it('should handle drop count of 0', () => {
      expect(drop([1, 2, 3], 0)).toEqual([1, 2, 3])
    })

    it('should handle negative drop count', () => {
      expect(drop([1, 2, 3], -1)).toEqual([1, 2, 3])
    })

    it('should handle empty array', () => {
      expect(drop([], 2)).toEqual([])
    })

    it('should handle null/undefined input', () => {
      expect(drop(null as any, 2)).toEqual([])
      expect(drop(undefined as any, 2)).toEqual([])
    })
  })

  describe('fill', () => {
    it('should fill array with value', () => {
      expect(fill([1, 2, 3, 4, 5], 0)).toEqual([0, 0, 0, 0, 0])
      expect(fill(['a', 'b', 'c'], 'x')).toEqual(['x', 'x', 'x'])
    })

    it('should fill array with value in range', () => {
      expect(fill([1, 2, 3, 4, 5], 0, 1, 3)).toEqual([1, 0, 0, 4, 5])
      expect(fill(['a', 'b', 'c', 'd'], 'x', 1, 3)).toEqual(['a', 'x', 'x', 'd'])
    })

    it('should handle empty array', () => {
      expect(fill([], 0)).toEqual([])
    })

    it('should handle invalid range', () => {
      expect(fill([1, 2, 3], 0, 5, 2)).toEqual([1, 2, 3])
    })

    it('should handle null/undefined input', () => {
      expect(fill(null as any, 0)).toEqual([])
      expect(fill(undefined as any, 0)).toEqual([])
    })
  })

  describe('find', () => {
    it('should find first element matching predicate', () => {
      expect(find([1, 2, 3, 4, 5], x => x > 3)).toBe(4)
      expect(find(['a', 'b', 'c', 'd'], x => x === 'c')).toBe('c')
    })

    it('should return undefined if no element found', () => {
      expect(find([1, 2, 3], x => x > 5)).toBeUndefined()
      expect(find(['a', 'b', 'c'], x => x === 'd')).toBeUndefined()
    })

    it('should handle empty array', () => {
      expect(find([], x => x > 0)).toBeUndefined()
    })

    it('should handle null/undefined input', () => {
      expect(find(null as any, x => x > 0)).toBeUndefined()
      expect(find(undefined as any, x => x > 0)).toBeUndefined()
    })
  })

  describe('findIndex', () => {
    it('should find index of first element matching predicate', () => {
      expect(findIndex([1, 2, 3, 4, 5], x => x > 3)).toBe(3)
      expect(findIndex(['a', 'b', 'c', 'd'], x => x === 'c')).toBe(2)
    })

    it('should return -1 if no element found', () => {
      expect(findIndex([1, 2, 3], x => x > 5)).toBe(-1)
      expect(findIndex(['a', 'b', 'c'], x => x === 'd')).toBe(-1)
    })

    it('should handle empty array', () => {
      expect(findIndex([], x => x > 0)).toBe(-1)
    })

    it('should handle null/undefined input', () => {
      expect(findIndex(null as any, x => x > 0)).toBe(-1)
      expect(findIndex(undefined as any, x => x > 0)).toBe(-1)
    })
  })

  describe('first', () => {
    it('should return first element', () => {
      expect(first([1, 2, 3])).toBe(1)
      expect(first(['a', 'b', 'c'])).toBe('a')
    })

    it('should handle empty array', () => {
      expect(first([])).toBeUndefined()
    })

    it('should handle null/undefined input', () => {
      expect(first(null as any)).toBeUndefined()
      expect(first(undefined as any)).toBeUndefined()
    })
  })

  describe('flatten', () => {
    it('should flatten array one level deep', () => {
      expect(flatten([1, [2, 3], [4, [5]]])).toEqual([1, 2, 3, 4, [5]])
      expect(flatten(['a', ['b', 'c'], ['d', ['e']]])).toEqual(['a', 'b', 'c', 'd', ['e']])
    })

    it('should handle empty array', () => {
      expect(flatten([])).toEqual([])
    })

    it('should handle already flat array', () => {
      expect(flatten([1, 2, 3])).toEqual([1, 2, 3])
    })

    it('should handle null/undefined input', () => {
      expect(flatten(null as any)).toEqual([])
      expect(flatten(undefined as any)).toEqual([])
    })
  })

  describe('flattenDeep', () => {
    it('should flatten array recursively', () => {
      expect(flattenDeep([1, [2, [3, [4]]]])).toEqual([1, 2, 3, 4])
      expect(flattenDeep(['a', ['b', ['c', ['d']]]])).toEqual(['a', 'b', 'c', 'd'])
    })

    it('should handle empty array', () => {
      expect(flattenDeep([])).toEqual([])
    })

    it('should handle already flat array', () => {
      expect(flattenDeep([1, 2, 3])).toEqual([1, 2, 3])
    })

    it('should handle null/undefined input', () => {
      expect(flattenDeep(null as any)).toEqual([])
      expect(flattenDeep(undefined as any)).toEqual([])
    })
  })

  describe('head', () => {
    it('should return first element', () => {
      expect(head([1, 2, 3])).toBe(1)
      expect(head(['a', 'b', 'c'])).toBe('a')
    })

    it('should handle empty array', () => {
      expect(head([])).toBeUndefined()
    })

    it('should handle null/undefined input', () => {
      expect(head(null as any)).toBeUndefined()
      expect(head(undefined as any)).toBeUndefined()
    })
  })

  describe('indexOf', () => {
    it('should return index of element', () => {
      expect(indexOf([1, 2, 3, 4, 5], 3)).toBe(2)
      expect(indexOf(['a', 'b', 'c', 'd'], 'c')).toBe(2)
    })

    it('should return -1 if element not found', () => {
      expect(indexOf([1, 2, 3], 4)).toBe(-1)
      expect(indexOf(['a', 'b', 'c'], 'd')).toBe(-1)
    })

    it('should handle fromIndex parameter', () => {
      expect(indexOf([1, 2, 3, 2, 1], 2, 2)).toBe(3)
    })

    it('should handle empty array', () => {
      expect(indexOf([], 1)).toBe(-1)
    })

    it('should handle null/undefined input', () => {
      expect(indexOf(null as any, 1)).toBe(-1)
      expect(indexOf(undefined as any, 1)).toBe(-1)
    })
  })

  describe('intersection', () => {
    it('should return intersection of arrays', () => {
      expect(intersection([1, 2, 3], [2, 3, 4])).toEqual([2, 3])
      expect(intersection(['a', 'b', 'c'], ['b', 'c', 'd'])).toEqual(['b', 'c'])
    })

    it('should handle empty arrays', () => {
      expect(intersection([], [1, 2])).toEqual([])
      expect(intersection([1, 2], [])).toEqual([])
      expect(intersection([], [])).toEqual([])
    })

    it('should handle no intersection', () => {
      expect(intersection([1, 2, 3], [4, 5, 6])).toEqual([])
    })

    it('should handle null/undefined input', () => {
      expect(intersection(null as any, [1, 2])).toEqual([])
      expect(intersection([1, 2], undefined as any)).toEqual([])
    })
  })

  describe('join', () => {
    it('should join array elements with separator', () => {
      expect(join([1, 2, 3], '-')).toBe('1-2-3')
      expect(join(['a', 'b', 'c'], ',')).toBe('a,b,c')
      expect(join(['a', 'b', 'c'], ', ')).toBe('a, b, c')
    })

    it('should handle default separator', () => {
      expect(join([1, 2, 3])).toBe('1,2,3')
    })

    it('should handle empty array', () => {
      expect(join([], '-')).toBe('')
    })

    it('should handle single element array', () => {
      expect(join([1], '-')).toBe('1')
    })

    it('should handle null/undefined input', () => {
      expect(join(null as any, '-')).toBe('')
      expect(join(undefined as any, '-')).toBe('')
    })
  })

  describe('last', () => {
    it('should return last element', () => {
      expect(last([1, 2, 3])).toBe(3)
      expect(last(['a', 'b', 'c'])).toBe('c')
    })

    it('should handle empty array', () => {
      expect(last([])).toBeUndefined()
    })

    it('should handle null/undefined input', () => {
      expect(last(null as any)).toBeUndefined()
      expect(last(undefined as any)).toBeUndefined()
    })
  })

  describe('lastIndexOf', () => {
    it('should return last index of element', () => {
      expect(lastIndexOf([1, 2, 3, 2, 1], 2)).toBe(3)
      expect(lastIndexOf(['a', 'b', 'c', 'b', 'a'], 'b')).toBe(3)
    })

    it('should return -1 if element not found', () => {
      expect(lastIndexOf([1, 2, 3], 4)).toBe(-1)
      expect(lastIndexOf(['a', 'b', 'c'], 'd')).toBe(-1)
    })

    it('should handle fromIndex parameter', () => {
      expect(lastIndexOf([1, 2, 3, 2, 1], 2, 2)).toBe(1)
    })

    it('should handle empty array', () => {
      expect(lastIndexOf([], 1)).toBe(-1)
    })

    it('should handle null/undefined input', () => {
      expect(lastIndexOf(null as any, 1)).toBe(-1)
      expect(lastIndexOf(undefined as any, 1)).toBe(-1)
    })
  })

  describe('nth', () => {
    it('should return element at index', () => {
      expect(nth([1, 2, 3, 4, 5], 2)).toBe(3)
      expect(nth(['a', 'b', 'c', 'd'], 1)).toBe('b')
    })

    it('should handle negative index', () => {
      expect(nth([1, 2, 3, 4, 5], -1)).toBe(5)
      expect(nth(['a', 'b', 'c', 'd'], -2)).toBe('c')
    })

    it('should return undefined if index out of bounds', () => {
      expect(nth([1, 2, 3], 5)).toBeUndefined()
      expect(nth(['a', 'b', 'c'], -5)).toBeUndefined()
    })

    it('should handle empty array', () => {
      expect(nth([], 0)).toBeUndefined()
    })

    it('should handle null/undefined input', () => {
      expect(nth(null as any, 0)).toBeUndefined()
      expect(nth(undefined as any, 0)).toBeUndefined()
    })
  })

  describe('remove', () => {
    it('should remove elements matching predicate', () => {
      const arr = [1, 2, 3, 4, 5]
      const removed = remove(arr, x => x > 3)
      expect(removed).toEqual([4, 5])
      expect(arr).toEqual([1, 2, 3])
    })

    it('should handle empty array', () => {
      const arr: number[] = []
      const removed = remove(arr, x => x > 3)
      expect(removed).toEqual([])
      expect(arr).toEqual([])
    })

    it('should handle no matching elements', () => {
      const arr = [1, 2, 3]
      const removed = remove(arr, x => x > 5)
      expect(removed).toEqual([])
      expect(arr).toEqual([1, 2, 3])
    })

    it('should handle null/undefined input', () => {
      const removed = remove(null as any, x => x > 3)
      expect(removed).toEqual([])
    })
  })

  describe('reverse', () => {
    it('should reverse array in place', () => {
      const arr = [1, 2, 3, 4, 5]
      const result = reverse(arr)
      expect(result).toBe(arr)
      expect(arr).toEqual([5, 4, 3, 2, 1])
    })

    it('should handle empty array', () => {
      const arr: number[] = []
      const result = reverse(arr)
      expect(result).toBe(arr)
      expect(arr).toEqual([])
    })

    it('should handle single element array', () => {
      const arr = [1]
      const result = reverse(arr)
      expect(result).toBe(arr)
      expect(arr).toEqual([1])
    })

    it('should handle null/undefined input', () => {
      expect(reverse(null as any)).toEqual([])
      expect(reverse(undefined as any)).toEqual([])
    })
  })

  describe('slice', () => {
    it('should slice array', () => {
      expect(slice([1, 2, 3, 4, 5], 1, 3)).toEqual([2, 3])
      expect(slice(['a', 'b', 'c', 'd'], 1, -1)).toEqual(['b', 'c'])
    })

    it('should handle default parameters', () => {
      expect(slice([1, 2, 3, 4, 5], 1)).toEqual([2, 3, 4, 5])
      expect(slice([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle negative indices', () => {
      expect(slice([1, 2, 3, 4, 5], -3)).toEqual([3, 4, 5])
      expect(slice([1, 2, 3, 4, 5], -3, -1)).toEqual([3, 4])
    })

    it('should handle empty array', () => {
      expect(slice([], 1, 3)).toEqual([])
    })

    it('should handle null/undefined input', () => {
      expect(slice(null as any, 1, 3)).toEqual([])
      expect(slice(undefined as any, 1, 3)).toEqual([])
    })
  })

  describe('tail', () => {
    it('should return all elements except first', () => {
      expect(tail([1, 2, 3, 4, 5])).toEqual([2, 3, 4, 5])
      expect(tail(['a', 'b', 'c', 'd'])).toEqual(['b', 'c', 'd'])
    })

    it('should handle empty array', () => {
      expect(tail([])).toEqual([])
    })

    it('should handle single element array', () => {
      expect(tail([1])).toEqual([])
    })

    it('should handle null/undefined input', () => {
      expect(tail(null as any)).toEqual([])
      expect(tail(undefined as any)).toEqual([])
    })
  })

  describe('take', () => {
    it('should take first n elements', () => {
      expect(take([1, 2, 3, 4, 5], 2)).toEqual([1, 2])
      expect(take(['a', 'b', 'c', 'd'], 3)).toEqual(['a', 'b', 'c'])
    })

    it('should handle take count larger than array length', () => {
      expect(take([1, 2, 3], 5)).toEqual([1, 2, 3])
    })

    it('should handle take count of 0', () => {
      expect(take([1, 2, 3], 0)).toEqual([])
    })

    it('should handle negative take count', () => {
      expect(take([1, 2, 3], -1)).toEqual([])
    })

    it('should handle empty array', () => {
      expect(take([], 2)).toEqual([])
    })

    it('should handle null/undefined input', () => {
      expect(take(null as any, 2)).toEqual([])
      expect(take(undefined as any, 2)).toEqual([])
    })
  })

  describe('takeRight', () => {
    it('should take last n elements', () => {
      expect(takeRight([1, 2, 3, 4, 5], 2)).toEqual([4, 5])
      expect(takeRight(['a', 'b', 'c', 'd'], 3)).toEqual(['b', 'c', 'd'])
    })

    it('should handle take count larger than array length', () => {
      expect(takeRight([1, 2, 3], 5)).toEqual([1, 2, 3])
    })

    it('should handle take count of 0', () => {
      expect(takeRight([1, 2, 3], 0)).toEqual([])
    })

    it('should handle negative take count', () => {
      expect(takeRight([1, 2, 3], -1)).toEqual([])
    })

    it('should handle empty array', () => {
      expect(takeRight([], 2)).toEqual([])
    })

    it('should handle null/undefined input', () => {
      expect(takeRight(null as any, 2)).toEqual([])
      expect(takeRight(undefined as any, 2)).toEqual([])
    })
  })

  describe('union', () => {
    it('should return union of arrays', () => {
      expect(union([1, 2, 3], [2, 3, 4])).toEqual([1, 2, 3, 4])
      expect(union(['a', 'b', 'c'], ['b', 'c', 'd'])).toEqual(['a', 'b', 'c', 'd'])
    })

    it('should handle empty arrays', () => {
      expect(union([], [1, 2])).toEqual([1, 2])
      expect(union([1, 2], [])).toEqual([1, 2])
      expect(union([], [])).toEqual([])
    })

    it('should handle no duplicates', () => {
      expect(union([1, 2, 3], [4, 5, 6])).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('should handle null/undefined input', () => {
      expect(union(null as any, [1, 2])).toEqual([1, 2])
      expect(union([1, 2], undefined as any)).toEqual([1, 2])
    })
  })

  describe('uniq', () => {
    it('should remove duplicate values', () => {
      expect(uniq([1, 2, 2, 3, 4, 4, 5])).toEqual([1, 2, 3, 4, 5])
      expect(uniq(['a', 'b', 'a', 'c', 'b'])).toEqual(['a', 'b', 'c'])
    })

    it('should handle empty array', () => {
      expect(uniq([])).toEqual([])
    })

    it('should handle array with no duplicates', () => {
      expect(uniq([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle null/undefined input', () => {
      expect(uniq(null as any)).toEqual([])
      expect(uniq(undefined as any)).toEqual([])
    })
  })

  describe('without', () => {
    it('should remove specified values', () => {
      expect(without([1, 2, 3, 4, 5], 2, 4)).toEqual([1, 3, 5])
      expect(without(['a', 'b', 'c', 'd'], 'b', 'd')).toEqual(['a', 'c'])
    })

    it('should handle values not in array', () => {
      expect(without([1, 2, 3], 4, 5)).toEqual([1, 2, 3])
    })

    it('should handle empty array', () => {
      expect(without([], 1, 2)).toEqual([])
    })

    it('should handle no values to remove', () => {
      expect(without([1, 2, 3])).toEqual([1, 2, 3])
    })

    it('should handle null/undefined input', () => {
      expect(without(null as any, 1, 2)).toEqual([])
      expect(without(undefined as any, 1, 2)).toEqual([])
    })
  })

  describe('zip', () => {
    it('should zip arrays together', () => {
      expect(zip([1, 2, 3], ['a', 'b', 'c'])).toEqual([[1, 'a'], [2, 'b'], [3, 'c']])
      expect(zip([1, 2], ['a', 'b', 'c'], [true, false, true])).toEqual([[1, 'a', true], [2, 'b', false]])
    })

    it('should handle empty arrays', () => {
      expect(zip([], [])).toEqual([])
      expect(zip([1, 2], [])).toEqual([])
      expect(zip([], [1, 2])).toEqual([])
    })

    it('should handle arrays of different lengths', () => {
      expect(zip([1, 2, 3], ['a', 'b'])).toEqual([[1, 'a'], [2, 'b']])
    })

    it('should handle single array', () => {
      expect(zip([1, 2, 3])).toEqual([[1], [2], [3]])
    })

    it('should handle null/undefined input', () => {
      expect(zip(null as any, [1, 2])).toEqual([])
      expect(zip([1, 2], undefined as any)).toEqual([])
    })
  })

  describe('countBy', () => {
    it('should count occurrences by key function', () => {
      expect(countBy([1, 2, 3, 4, 5], Math.floor)).toEqual({ '1': 1, '2': 1, '3': 1, '4': 1, '5': 1 })
      expect(countBy(['one', 'two', 'three'], 'length')).toEqual({ '3': 2, '5': 1 })
    })

    it('should handle empty array', () => {
      expect(countBy([], Math.floor)).toEqual({})
    })

    it('should handle null/undefined input', () => {
      expect(countBy(null as any, Math.floor)).toEqual({})
      expect(countBy(undefined as any, Math.floor)).toEqual({})
    })
  })

  describe('each', () => {
    it('should iterate over array elements', () => {
      const mockFn = vi.fn()
      each([1, 2, 3], mockFn)
      expect(mockFn).toHaveBeenCalledTimes(3)
      expect(mockFn).toHaveBeenCalledWith(1, 0, [1, 2, 3])
      expect(mockFn).toHaveBeenCalledWith(2, 1, [1, 2, 3])
      expect(mockFn).toHaveBeenCalledWith(3, 2, [1, 2, 3])
    })

    it('should handle empty array', () => {
      const mockFn = vi.fn()
      each([], mockFn)
      expect(mockFn).not.toHaveBeenCalled()
    })

    it('should handle null/undefined input', () => {
      const mockFn = vi.fn()
      each(null as any, mockFn)
      each(undefined as any, mockFn)
      expect(mockFn).not.toHaveBeenCalled()
    })
  })

  describe('every', () => {
    it('should return true if all elements match predicate', () => {
      expect(every([1, 2, 3, 4, 5], x => x > 0)).toBe(true)
      expect(every(['a', 'b', 'c'], x => x.length === 1)).toBe(true)
    })

    it('should return false if any element does not match predicate', () => {
      expect(every([1, 2, 3, 4, 5], x => x > 3)).toBe(false)
      expect(every(['a', 'bb', 'c'], x => x.length === 1)).toBe(false)
    })

    it('should handle empty array', () => {
      expect(every([], x => x > 0)).toBe(true)
    })

    it('should handle null/undefined input', () => {
      expect(every(null as any, x => x > 0)).toBe(true)
      expect(every(undefined as any, x => x > 0)).toBe(true)
    })
  })

  describe('filter', () => {
    it('should filter elements matching predicate', () => {
      expect(filter([1, 2, 3, 4, 5], x => x > 3)).toEqual([4, 5])
      expect(filter(['a', 'bb', 'ccc', 'd'], x => x.length > 1)).toEqual(['bb', 'ccc'])
    })

    it('should handle empty array', () => {
      expect(filter([], x => x > 0)).toEqual([])
    })

    it('should handle no matching elements', () => {
      expect(filter([1, 2, 3], x => x > 5)).toEqual([])
    })

    it('should handle null/undefined input', () => {
      expect(filter(null as any, x => x > 0)).toEqual([])
      expect(filter(undefined as any, x => x > 0)).toEqual([])
    })
  })

  describe('groupBy', () => {
    it('should group elements by key function', () => {
      expect(groupBy([1, 2, 3, 4, 5], Math.floor)).toEqual({
        '1': [1],
        '2': [2],
        '3': [3],
        '4': [4],
        '5': [5]
      })
      expect(groupBy(['one', 'two', 'three'], 'length')).toEqual({
        '3': ['one', 'two'],
        '5': ['three']
      })
    })

    it('should handle empty array', () => {
      expect(groupBy([], Math.floor)).toEqual({})
    })

    it('should handle null/undefined input', () => {
      expect(groupBy(null as any, Math.floor)).toEqual({})
      expect(groupBy(undefined as any, Math.floor)).toEqual({})
    })
  })

  describe('includes', () => {
    it('should return true if array includes value', () => {
      expect(includes([1, 2, 3, 4, 5], 3)).toBe(true)
      expect(includes(['a', 'b', 'c', 'd'], 'c')).toBe(true)
    })

    it('should return false if array does not include value', () => {
      expect(includes([1, 2, 3], 4)).toBe(false)
      expect(includes(['a', 'b', 'c'], 'd')).toBe(false)
    })

    it('should handle fromIndex parameter', () => {
      expect(includes([1, 2, 3, 2, 1], 2, 2)).toBe(true)
    })

    it('should handle empty array', () => {
      expect(includes([], 1)).toBe(false)
    })

    it('should handle null/undefined input', () => {
      expect(includes(null as any, 1)).toBe(false)
      expect(includes(undefined as any, 1)).toBe(false)
    })
  })

  describe('map', () => {
    it('should map array elements', () => {
      expect(map([1, 2, 3, 4, 5], x => x * 2)).toEqual([2, 4, 6, 8, 10])
      expect(map(['a', 'b', 'c'], x => x.toUpperCase())).toEqual(['A', 'B', 'C'])
    })

    it('should handle empty array', () => {
      expect(map([], x => x * 2)).toEqual([])
    })

    it('should handle null/undefined input', () => {
      expect(map(null as any, x => x * 2)).toEqual([])
      expect(map(undefined as any, x => x * 2)).toEqual([])
    })
  })

  describe('reduce', () => {
    it('should reduce array to single value', () => {
      expect(reduce([1, 2, 3, 4, 5], (acc, x) => acc + x, 0)).toBe(15)
      expect(reduce(['a', 'b', 'c'], (acc, x) => acc + x, '')).toBe('abc')
    })

    it('should handle without initial value', () => {
      expect(reduce([1, 2, 3, 4, 5], (acc, x) => acc + x)).toBe(15)
      expect(reduce(['a', 'b', 'c'], (acc, x) => acc + x)).toBe('abc')
    })

    it('should handle empty array with initial value', () => {
      expect(reduce([], (acc, x) => acc + x, 0)).toBe(0)
    })

    it('should handle empty array without initial value', () => {
      expect(() => reduce([], (acc, x) => acc + x)).toThrow()
    })

    it('should handle null/undefined input', () => {
      expect(() => reduce(null as any, (acc, x) => acc + x)).toThrow()
      expect(() => reduce(undefined as any, (acc, x) => acc + x)).toThrow()
    })
  })

  describe('some', () => {
    it('should return true if any element matches predicate', () => {
      expect(some([1, 2, 3, 4, 5], x => x > 3)).toBe(true)
      expect(some(['a', 'bb', 'c'], x => x.length > 1)).toBe(true)
    })

    it('should return false if no element matches predicate', () => {
      expect(some([1, 2, 3], x => x > 5)).toBe(false)
      expect(some(['a', 'b', 'c'], x => x.length > 1)).toBe(false)
    })

    it('should handle empty array', () => {
      expect(some([], x => x > 0)).toBe(false)
    })

    it('should handle null/undefined input', () => {
      expect(some(null as any, x => x > 0)).toBe(false)
      expect(some(undefined as any, x => x > 0)).toBe(false)
    })
  })

  describe('sortBy', () => {
    it('should sort array by iteratee', () => {
      expect(sortBy([3, 1, 4, 1, 5, 9, 2, 6], x => x)).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
      expect(sortBy(['banana', 'apple', 'cherry'], x => x)).toEqual(['apple', 'banana', 'cherry'])
    })

    it('should sort array by property', () => {
      const users = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
        { name: 'Bob', age: 35 }
      ]
      expect(sortBy(users, 'age')).toEqual([
        { name: 'Jane', age: 25 },
        { name: 'John', age: 30 },
        { name: 'Bob', age: 35 }
      ])
    })

    it('should handle empty array', () => {
      expect(sortBy([], x => x)).toEqual([])
    })

    it('should handle null/undefined input', () => {
      expect(sortBy(null as any, x => x)).toEqual([])
      expect(sortBy(undefined as any, x => x)).toEqual([])
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty array', () => {
      expect(isEmpty([])).toBe(true)
    })

    it('should return false for non-empty array', () => {
      expect(isEmpty([1, 2, 3])).toBe(false)
      expect(isEmpty(['a', 'b', 'c'])).toBe(false)
    })

    it('should handle null/undefined input', () => {
      expect(isEmpty(null as any)).toBe(true)
      expect(isEmpty(undefined as any)).toBe(true)
    })
  })

  describe('size', () => {
    it('should return array size', () => {
      expect(size([1, 2, 3, 4, 5])).toBe(5)
      expect(size(['a', 'b', 'c'])).toBe(3)
    })

    it('should handle empty array', () => {
      expect(size([])).toBe(0)
    })

    it('should handle null/undefined input', () => {
      expect(size(null as any)).toBe(0)
      expect(size(undefined as any)).toBe(0)
    })
  })

  describe('shuffle', () => {
    it('should shuffle array', () => {
      const arr = [1, 2, 3, 4, 5]
      const result = shuffle(arr)
      expect(result).toHaveLength(5)
      expect(result).toEqual(expect.arrayContaining([1, 2, 3, 4, 5]))
      expect(result).not.toBe(arr)
    })

    it('should handle empty array', () => {
      expect(shuffle([])).toEqual([])
    })

    it('should handle single element array', () => {
      expect(shuffle([1])).toEqual([1])
    })

    it('should handle null/undefined input', () => {
      expect(shuffle(null as any)).toEqual([])
      expect(shuffle(undefined as any)).toEqual([])
    })
  })

  describe('sample', () => {
    it('should return random element from array', () => {
      const arr = [1, 2, 3, 4, 5]
      const result = sample(arr)
      expect(arr).toContain(result)
    })

    it('should handle empty array', () => {
      expect(sample([])).toBeUndefined()
    })

    it('should handle single element array', () => {
      expect(sample([1])).toBe(1)
    })

    it('should handle null/undefined input', () => {
      expect(sample(null as any)).toBeUndefined()
      expect(sample(undefined as any)).toBeUndefined()
    })
  })

  describe('sampleSize', () => {
    it('should return random elements from array', () => {
      const arr = [1, 2, 3, 4, 5]
      const result = sampleSize(arr, 3)
      expect(result).toHaveLength(3)
      expect(arr).toEqual(expect.arrayContaining(result))
    })

    it('should handle sample size larger than array', () => {
      const arr = [1, 2, 3]
      const result = sampleSize(arr, 5)
      expect(result).toHaveLength(3)
      expect(result).toEqual(expect.arrayContaining([1, 2, 3]))
    })

    it('should handle sample size of 0', () => {
      expect(sampleSize([1, 2, 3], 0)).toEqual([])
    })

    it('should handle empty array', () => {
      expect(sampleSize([], 3)).toEqual([])
    })

    it('should handle null/undefined input', () => {
      expect(sampleSize(null as any, 3)).toEqual([])
      expect(sampleSize(undefined as any, 3)).toEqual([])
    })
  })

  describe('partition', () => {
    it('should partition array into two groups', () => {
      const arr = [1, 2, 3, 4, 5]
      const result = partition(arr, x => x > 3)
      expect(result).toEqual([[4, 5], [1, 2, 3]])
    })

    it('should handle empty array', () => {
      expect(partition([], x => x > 3)).toEqual([[], []])
    })

    it('should handle all elements matching predicate', () => {
      expect(partition([1, 2, 3], x => x > 0)).toEqual([[1, 2, 3], []])
    })

    it('should handle no elements matching predicate', () => {
      expect(partition([1, 2, 3], x => x > 5)).toEqual([[], [1, 2, 3]])
    })

    it('should handle null/undefined input', () => {
      expect(partition(null as any, x => x > 3)).toEqual([[], []])
      expect(partition(undefined as any, x => x > 3)).toEqual([[], []])
    })
  })

  describe('keyBy', () => {
    it('should create object with keys from iteratee', () => {
      const arr = [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
        { id: 3, name: 'Bob' }
      ]
      expect(keyBy(arr, 'id')).toEqual({
        '1': { id: 1, name: 'John' },
        '2': { id: 2, name: 'Jane' },
        '3': { id: 3, name: 'Bob' }
      })
    })

    it('should handle function iteratee', () => {
      const arr = [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
        { id: 3, name: 'Bob' }
      ]
      expect(keyBy(arr, x => x.name)).toEqual({
        'John': { id: 1, name: 'John' },
        'Jane': { id: 2, name: 'Jane' },
        'Bob': { id: 3, name: 'Bob' }
      })
    })

    it('should handle empty array', () => {
      expect(keyBy([], 'id')).toEqual({})
    })

    it('should handle null/undefined input', () => {
      expect(keyBy(null as any, 'id')).toEqual({})
      expect(keyBy(undefined as any, 'id')).toEqual({})
    })
  })

  describe('orderBy', () => {
    it('should sort array by multiple criteria', () => {
      const users = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
        { name: 'Bob', age: 35 },
        { name: 'Alice', age: 25 }
      ]
      expect(orderBy(users, ['age', 'name'], ['asc', 'asc'])).toEqual([
        { name: 'Alice', age: 25 },
        { name: 'Jane', age: 25 },
        { name: 'John', age: 30 },
        { name: 'Bob', age: 35 }
      ])
    })

    it('should handle descending order', () => {
      expect(orderBy([3, 1, 4, 1, 5, 9, 2, 6], [], ['desc'])).toEqual([9, 6, 5, 4, 3, 2, 1, 1])
    })

    it('should handle empty array', () => {
      expect(orderBy([], ['name'], ['asc'])).toEqual([])
    })

    it('should handle null/undefined input', () => {
      expect(orderBy(null as any, ['name'], ['asc'])).toEqual([])
      expect(orderBy(undefined as any, ['name'], ['asc'])).toEqual([])
    })
  })

  describe('Integration Tests', () => {
    it('should work together for complex array processing', () => {
      const data = [
        { id: 1, name: 'John', age: 30, active: true },
        { id: 2, name: 'Jane', age: 25, active: false },
        { id: 3, name: 'Bob', age: 35, active: true },
        { id: 4, name: 'Alice', age: 25, active: true }
      ]

      // Filter active users
      const activeUsers = filter(data, user => user.active)
      
      // Sort by age then name
      const sortedUsers = orderBy(activeUsers, ['age', 'name'], ['asc', 'asc'])
      
      // Extract names
      const names = map(sortedUsers, user => user.name)
      
      // Chunk into groups
      const nameGroups = chunk(names, 2)
      
      expect(activeUsers).toHaveLength(3)
      expect(sortedUsers).toHaveLength(3)
      expect(sortedUsers[0].name).toBe('Alice')
      expect(names).toEqual(['Alice', 'John', 'Bob'])
      expect(nameGroups).toEqual([['Alice', 'John'], ['Bob']])
    })

    it('should handle complex data transformation pipeline', () => {
      const rawData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      
      const result = pipe(
        rawData,
        arr => filter(arr, x => x % 2 === 0),
        arr => map(arr, x => x * 2),
        arr => reduce(arr, (acc, x) => acc + x, 0),
        sum => sum / 5
      )
      
      expect(result).toBe(12) // (2+4+6+8+10) * 2 / 5 = 60 / 5 = 12
    })

    it('should handle complex grouping and aggregation', () => {
      const sales = [
        { product: 'A', category: 'Electronics', amount: 100 },
        { product: 'B', category: 'Electronics', amount: 200 },
        { product: 'C', category: 'Clothing', amount: 150 },
        { product: 'D', category: 'Clothing', amount: 250 },
        { product: 'E', category: 'Electronics', amount: 300 }
      ]

      // Group by category
      const grouped = groupBy(sales, 'category')
      
      // Calculate totals per category
      const categoryTotals = map(grouped, (items, category) => ({
        category,
        total: reduce(items, (acc, item) => acc + item.amount, 0),
        count: items.length
      }))
      
      // Sort by total amount
      const sorted = sortBy(categoryTotals, 'total')
      
      expect(grouped.Electronics).toHaveLength(3)
      expect(grouped.Clothing).toHaveLength(2)
      expect(sorted[0].category).toBe('Clothing')
      expect(sorted[0].total).toBe(400)
      expect(sorted[1].category).toBe('Electronics')
      expect(sorted[1].total).toBe(600)
    })

    it('should handle complex filtering and transformation', () => {
      const users = [
        { id: 1, name: 'John Doe', email: 'john@example.com', roles: ['admin', 'user'] },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', roles: ['user'] },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', roles: ['admin'] },
        { id: 4, name: 'Alice Brown', email: 'alice@example.com', roles: ['user', 'editor'] }
      ]

      // Find admin users
      const adminUsers = filter(users, user => includes(user.roles, 'admin'))
      
      // Extract relevant info
      const adminInfo = map(adminUsers, user => ({
        id: user.id,
        name: user.name,
        email: user.email
      }))
      
      // Sort by name
      const sortedAdmins = sortBy(adminInfo, 'name')
      
      // Create lookup by ID
      const adminLookup = keyBy(sortedAdmins, 'id')
      
      expect(adminUsers).toHaveLength(2)
      expect(adminInfo).toHaveLength(2)
      expect(sortedAdmins[0].name).toBe('Bob Johnson')
      expect(sortedAdmins[1].name).toBe('John Doe')
      expect(adminLookup['1']).toEqual({ id: 1, name: 'John Doe', email: 'john@example.com' })
      expect(adminLookup['3']).toEqual({ id: 3, name: 'Bob Johnson', email: 'bob@example.com' })
    })

    it('should handle complex array operations with edge cases', () => {
      const testData = [
        null,
        undefined,
        0,
        '',
        false,
        1,
        'hello',
        true,
        [1, 2, 3],
        { a: 1 }
      ]

      // Remove falsy values
      const cleaned = compact(testData)
      
      // Filter for truthy values
      const truthy = filter(testData, x => !!x)
      
      // Get unique values
      const unique = uniq(cleaned)
      
      // Check if all are truthy
      const allTruthy = every(truthy, x => !!x)
      
      expect(cleaned).toHaveLength(5)
      expect(truthy).toHaveLength(5)
      expect(unique).toHaveLength(5)
      expect(allTruthy).toBe(true)
    })
  })
})

// Helper function for pipeline testing
function pipe<T>(value: T, ...fns: Array<(arg: T) => any>): any {
  return fns.reduce((acc, fn) => fn(acc), value)
}