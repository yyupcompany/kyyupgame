import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';
import { vi } from 'vitest'
import { 
  assign, 
  assignIn, 
  assignWith, 
  defaults, 
  defaultsDeep, 
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
  clone, 
  cloneDeep, 
  cloneWith, 
  cloneDeepWith, 
  conformsTo, 
  eq, 
  gt, 
  gte, 
  isArguments, 
  isArray, 
  isArrayLike, 
  isArrayLikeObject, 
  isBoolean, 
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
  now, 
  defer, 
  delay, 
  bind, 
  bindKey, 
  curry, 
  curryRight, 
  partial, 
  partialRight, 
  rearg, 
  rest, 
  spread, 
  throttle, 
  debounce, 
  wrap, 
  negate, 
  once, 
  after, 
  before, 
  ary, 
  unary, 
  flip, 
  memoize, 
  memoizeCapped, 
  restArguments, 
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
  uniqueId, 
  create, 
  defaults, 
  defaultsDeep, 
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
  at, 
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
  clone, 
  cloneDeep, 
  cloneWith, 
  cloneDeepWith, 
  conformsTo, 
  eq, 
  gt, 
  gte, 
  isArguments, 
  isArray, 
  isArrayLike, 
  isArrayLikeObject, 
  isBoolean, 
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
  now, 
  defer, 
  delay, 
  bind, 
  bindKey, 
  curry, 
  curryRight, 
  partial, 
  partialRight, 
  rearg, 
  rest, 
  spread, 
  throttle, 
  debounce, 
  wrap, 
  negate, 
  once, 
  after, 
  before, 
  ary, 
  unary, 
  flip, 
  memoize, 
  memoizeCapped, 
  restArguments, 
  attempt, 
  bindAll, 
  deepGet, 
  deepSet, 
  deepMerge, 
  deepClone, 
  deepEqual, 
  deepOmit, 
  deepPick, 
  flattenObject, 
  unflattenObject, 
  getObjectPaths, 
  hasNestedProperty, 
  getNestedProperty, 
  setNestedProperty, 
  deleteNestedProperty, 
  mergeObjects, 
  cloneObject, 
  isObjectEmpty, 
  isObjectEqual, 
  mapObject, 
  filterObject, 
  reduceObject, 
  findObjectKey, 
  findObjectValue, 
  pluckObject, 
  compactObject, 
  invertObject, 
  pickObject, 
  omitObject, 
  defaultsObject, 
  extendObject, 
  zipObject, 
  unzipObject, 
  fromPairsObject, 
  toPairsObject, 
  keysObject, 
  valuesObject, 
  entriesObject, 
  sizeObject, 
  hasObjectKey, 
  hasObjectValue, 
  includesObjectKey, 
  includesObjectValue, 
  findObject, 
  findObjectIndex, 
  someObject, 
  everyObject, 
  countObject, 
  groupObject, 
  keyByObject, 
  indexByObject, 
  sortByObject, 
  orderByObject, 
  partitionObject, 
  sampleObject, 
  sampleSizeObject, 
  shuffleObject, 
  tapObject, 
  thruObject, 
  prototypeChain, 
  getPrototypeOf, 
  setPrototypeOf, 
  createObject, 
  defineProperty, 
  defineProperties, 
  getOwnPropertyDescriptor, 
  getOwnPropertyDescriptors, 
  getOwnPropertyNames, 
  getOwnPropertySymbols, 
  preventExtensions, 
  isExtensible, 
  seal, 
  isSealed, 
  freeze, 
  isFrozen, 
  hasOwnProperty, 
  propertyIsEnumerable, 
  isPrototypeOf, 
  valueOf, 
  toStringObject, 
  toLocaleStringObject 
} from '@/utils/object-utils'

// 控制台错误检测变量
let consoleSpy: any

describe('Object Utils', () => {
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
  describe('assign', () => {
    it('should assign properties from source objects to target object', () => {
      const target = { a: 1 }
      const source1 = { b: 2 }
      const source2 = { c: 3 }
      const result = assign(target, source1, source2)
      
      expect(result).toEqual({ a: 1, b: 2, c: 3 })
      expect(result).toBe(target)
    })

    it('should handle empty source objects', () => {
      const target = { a: 1 }
      const result = assign(target, {})
      expect(result).toEqual({ a: 1 })
    })

    it('should overwrite existing properties', () => {
      const target = { a: 1, b: 2 }
      const source = { b: 3, c: 4 }
      const result = assign(target, source)
      expect(result).toEqual({ a: 1, b: 3, c: 4 })
    })

    it('should handle null/undefined input', () => {
      const target = { a: 1 }
      const result = assign(target, null as any, undefined as any)
      expect(result).toEqual({ a: 1 })
    })
  })

  describe('get', () => {
    it('should get value from object by path', () => {
      const obj = { a: { b: { c: 1 } } }
      expect(get(obj, 'a.b.c')).toBe(1)
      expect(get(obj, ['a', 'b', 'c'])).toBe(1)
    })

    it('should return default value if path not found', () => {
      const obj = { a: { b: { c: 1 } } }
      expect(get(obj, 'a.b.d', 'default')).toBe('default')
      expect(get(obj, 'x.y.z', 'default')).toBe('default')
    })

    it('should handle undefined object', () => {
      expect(get(undefined as any, 'a.b.c', 'default')).toBe('default')
    })

    it('should handle null object', () => {
      expect(get(null as any, 'a.b.c', 'default')).toBe('default')
    })

    it('should handle empty path', () => {
      const obj = { a: 1 }
      expect(get(obj, '', 'default')).toBe('default')
    })
  })

  describe('set', () => {
    it('should set value in object by path', () => {
      const obj = { a: { b: { c: 1 } } }
      const result = set(obj, 'a.b.c', 2)
      expect(result).toEqual({ a: { b: { c: 2 } } })
    })

    it('should create nested objects if they don\'t exist', () => {
      const obj = {}
      const result = set(obj, 'a.b.c', 1)
      expect(result).toEqual({ a: { b: { c: 1 } } })
    })

    it('should handle array indices in path', () => {
      const obj = { a: { b: [1, 2, 3] } }
      const result = set(obj, 'a.b.1', 4)
      expect(result).toEqual({ a: { b: [1, 4, 3] } })
    })

    it('should handle null/undefined object', () => {
      const result = set(null as any, 'a.b.c', 1)
      expect(result).toEqual({ a: { b: { c: 1 } } })
    })
  })

  describe('has', () => {
    it('should check if object has property', () => {
      const obj = { a: { b: { c: 1 } } }
      expect(has(obj, 'a')).toBe(true)
      expect(has(obj, 'a.b')).toBe(true)
      expect(has(obj, 'a.b.c')).toBe(true)
      expect(has(obj, 'a.b.d')).toBe(false)
      expect(has(obj, 'x.y.z')).toBe(false)
    })

    it('should handle inherited properties', () => {
      const obj = Object.create({ a: 1 })
      expect(has(obj, 'a')).toBe(false)
    })

    it('should handle null/undefined object', () => {
      expect(has(null as any, 'a')).toBe(false)
      expect(has(undefined as any, 'a')).toBe(false)
    })
  })

  describe('keys', () => {
    it('should return object keys', () => {
      const obj = { a: 1, b: 2, c: 3 }
      expect(keys(obj)).toEqual(['a', 'b', 'c'])
    })

    it('should handle empty object', () => {
      expect(keys({})).toEqual([])
    })

    it('should handle null/undefined input', () => {
      expect(keys(null as any)).toEqual([])
      expect(keys(undefined as any)).toEqual([])
    })
  })

  describe('values', () => {
    it('should return object values', () => {
      const obj = { a: 1, b: 2, c: 3 }
      expect(values(obj)).toEqual([1, 2, 3])
    })

    it('should handle empty object', () => {
      expect(values({})).toEqual([])
    })

    it('should handle null/undefined input', () => {
      expect(values(null as any)).toEqual([])
      expect(values(undefined as any)).toEqual([])
    })
  })

  describe('pick', () => {
    it('should pick specified properties from object', () => {
      const obj = { a: 1, b: 2, c: 3, d: 4 }
      expect(pick(obj, 'a', 'b')).toEqual({ a: 1, b: 2 })
    })

    it('should handle non-existent properties', () => {
      const obj = { a: 1, b: 2 }
      expect(pick(obj, 'a', 'c')).toEqual({ a: 1 })
    })

    it('should handle empty object', () => {
      expect(pick({}, 'a', 'b')).toEqual({})
    })

    it('should handle null/undefined input', () => {
      expect(pick(null as any, 'a', 'b')).toEqual({})
      expect(pick(undefined as any, 'a', 'b')).toEqual({})
    })
  })

  describe('omit', () => {
    it('should omit specified properties from object', () => {
      const obj = { a: 1, b: 2, c: 3, d: 4 }
      expect(omit(obj, 'a', 'b')).toEqual({ c: 3, d: 4 })
    })

    it('should handle non-existent properties', () => {
      const obj = { a: 1, b: 2 }
      expect(omit(obj, 'a', 'c')).toEqual({ b: 2 })
    })

    it('should handle empty object', () => {
      expect(omit({}, 'a', 'b')).toEqual({})
    })

    it('should handle null/undefined input', () => {
      expect(omit(null as any, 'a', 'b')).toEqual({})
      expect(omit(undefined as any, 'a', 'b')).toEqual({})
    })
  })

  describe('clone', () => {
    it('should shallow clone object', () => {
      const obj = { a: 1, b: { c: 2 } }
      const result = clone(obj)
      expect(result).toEqual(obj)
      expect(result).not.toBe(obj)
      expect(result.b).toBe(obj.b)
    })

    it('should handle primitive values', () => {
      expect(clone(1)).toBe(1)
      expect(clone('hello')).toBe('hello')
      expect(clone(true)).toBe(true)
    })

    it('should handle null/undefined input', () => {
      expect(clone(null)).toBe(null)
      expect(clone(undefined)).toBe(undefined)
    })
  })

  describe('cloneDeep', () => {
    it('should deep clone object', () => {
      const obj = { a: 1, b: { c: 2, d: [3, 4] } }
      const result = cloneDeep(obj)
      expect(result).toEqual(obj)
      expect(result).not.toBe(obj)
      expect(result.b).not.toBe(obj.b)
      expect(result.b.d).not.toBe(obj.b.d)
    })

    it('should handle circular references', () => {
      const obj: any = { a: 1 }
      obj.b = obj
      const result = cloneDeep(obj)
      expect(result.a).toBe(1)
      expect(result.b).toBe(result)
    })

    it('should handle null/undefined input', () => {
      expect(cloneDeep(null)).toBe(null)
      expect(cloneDeep(undefined)).toBe(undefined)
    })
  })

  describe('merge', () => {
    it('should merge objects', () => {
      const obj1 = { a: 1, b: { c: 2 } }
      const obj2 = { b: { d: 3 }, e: 4 }
      const result = merge(obj1, obj2)
      expect(result).toEqual({ a: 1, b: { c: 2, d: 3 }, e: 4 })
    })

    it('should handle multiple objects', () => {
      const obj1 = { a: 1 }
      const obj2 = { b: 2 }
      const obj3 = { c: 3 }
      const result = merge(obj1, obj2, obj3)
      expect(result).toEqual({ a: 1, b: 2, c: 3 })
    })

    it('should handle empty objects', () => {
      const obj1 = { a: 1 }
      const result = merge(obj1, {})
      expect(result).toEqual({ a: 1 })
    })

    it('should handle null/undefined input', () => {
      const obj = { a: 1 }
      const result = merge(obj, null as any, undefined as any)
      expect(result).toEqual({ a: 1 })
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty object', () => {
      expect(isEmpty({})).toBe(true)
    })

    it('should return false for non-empty object', () => {
      expect(isEmpty({ a: 1 })).toBe(false)
      expect(isEmpty({ a: 1, b: 2 })).toBe(false)
    })

    it('should handle null/undefined input', () => {
      expect(isEmpty(null as any)).toBe(true)
      expect(isEmpty(undefined as any)).toBe(true)
    })
  })

  describe('isEqual', () => {
    it('should return true for equal objects', () => {
      expect(isEqual({ a: 1 }, { a: 1 })).toBe(true)
      expect(isEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true)
    })

    it('should return false for unequal objects', () => {
      expect(isEqual({ a: 1 }, { a: 2 })).toBe(false)
      expect(isEqual({ a: 1 }, { b: 1 })).toBe(false)
      expect(isEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false)
    })

    it('should handle deep equality', () => {
      expect(isEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true)
      expect(isEqual({ a: { b: 1 } }, { a: { b: 2 } })).toBe(false)
    })

    it('should handle null/undefined input', () => {
      expect(isEqual(null, null)).toBe(true)
      expect(isEqual(undefined, undefined)).toBe(true)
      expect(isEqual(null, undefined)).toBe(false)
    })
  })

  describe('isPlainObject', () => {
    it('should return true for plain objects', () => {
      expect(isPlainObject({})).toBe(true)
      expect(isPlainObject({ a: 1 })).toBe(true)
      expect(isPlainObject(Object.create(null))).toBe(true)
    })

    it('should return false for non-plain objects', () => {
      expect(isPlainObject(new Date())).toBe(false)
      expect(isPlainObject([1, 2, 3])).toBe(false)
      expect(isPlainObject(null)).toBe(false)
      expect(isPlainObject(undefined)).toBe(false)
    })
  })

  describe('isObject', () => {
    it('should return true for objects', () => {
      expect(isObject({})).toBe(true)
      expect(isObject({ a: 1 })).toBe(true)
      expect(isObject(new Date())).toBe(true)
      expect(isObject([1, 2, 3])).toBe(true)
    })

    it('should return false for non-objects', () => {
      expect(isObject(null)).toBe(false)
      expect(isObject(undefined)).toBe(false)
      expect(isObject(1)).toBe(false)
      expect(isObject('hello')).toBe(false)
      expect(isObject(true)).toBe(false)
    })
  })

  describe('mapValues', () => {
    it('should map object values', () => {
      const obj = { a: 1, b: 2, c: 3 }
      const result = mapValues(obj, x => x * 2)
      expect(result).toEqual({ a: 2, b: 4, c: 6 })
    })

    it('should handle empty object', () => {
      expect(mapValues({}, x => x * 2)).toEqual({})
    })

    it('should handle null/undefined input', () => {
      expect(mapValues(null as any, x => x * 2)).toEqual({})
      expect(mapValues(undefined as any, x => x * 2)).toEqual({})
    })
  })

  describe('mapKeys', () => {
    it('should map object keys', () => {
      const obj = { a: 1, b: 2, c: 3 }
      const result = mapKeys(obj, (value, key) => key.toUpperCase())
      expect(result).toEqual({ A: 1, B: 2, C: 3 })
    })

    it('should handle empty object', () => {
      expect(mapKeys({}, (value, key) => key.toUpperCase())).toEqual({})
    })

    it('should handle null/undefined input', () => {
      expect(mapKeys(null as any, (value, key) => key.toUpperCase())).toEqual({})
      expect(mapKeys(undefined as any, (value, key) => key.toUpperCase())).toEqual({})
    })
  })

  describe('invert', () => {
    it('should invert object keys and values', () => {
      const obj = { a: 1, b: 2, c: 3 }
      const result = invert(obj)
      expect(result).toEqual({ '1': 'a', '2': 'b', '3': 'c' })
    })

    it('should handle duplicate values', () => {
      const obj = { a: 1, b: 1, c: 2 }
      const result = invert(obj)
      expect(result).toEqual({ '1': 'b', '2': 'c' })
    })

    it('should handle empty object', () => {
      expect(invert({})).toEqual({})
    })

    it('should handle null/undefined input', () => {
      expect(invert(null as any)).toEqual({})
      expect(invert(undefined as any)).toEqual({})
    })
  })

  describe('defaults', () => {
    it('should assign default properties', () => {
      const obj = { a: 1 }
      const defaults = { b: 2, c: 3 }
      const result = defaults(obj, defaults)
      expect(result).toEqual({ a: 1, b: 2, c: 3 })
    })

    it('should not overwrite existing properties', () => {
      const obj = { a: 1, b: 2 }
      const defaults = { b: 3, c: 4 }
      const result = defaults(obj, defaults)
      expect(result).toEqual({ a: 1, b: 2, c: 4 })
    })

    it('should handle empty object', () => {
      const obj = {}
      const defaults = { a: 1, b: 2 }
      const result = defaults(obj, defaults)
      expect(result).toEqual({ a: 1, b: 2 })
    })

    it('should handle null/undefined input', () => {
      const defaults = { a: 1, b: 2 }
      expect(defaults(null as any, defaults)).toEqual({ a: 1, b: 2 })
      expect(defaults(undefined as any, defaults)).toEqual({ a: 1, b: 2 })
    })
  })

  describe('findKey', () => {
    it('should find key of first matching value', () => {
      const obj = { a: 1, b: 2, c: 3, d: 4 }
      expect(findKey(obj, x => x > 2)).toBe('c')
    })

    it('should return undefined if no match found', () => {
      const obj = { a: 1, b: 2, c: 3 }
      expect(findKey(obj, x => x > 5)).toBeUndefined()
    })

    it('should handle empty object', () => {
      expect(findKey({}, x => x > 0)).toBeUndefined()
    })

    it('should handle null/undefined input', () => {
      expect(findKey(null as any, x => x > 0)).toBeUndefined()
      expect(findKey(undefined as any, x => x > 0)).toBeUndefined()
    })
  })

  describe('forIn', () => {
    it('should iterate over object properties', () => {
      const obj = { a: 1, b: 2, c: 3 }
      const mockFn = vi.fn()
      forIn(obj, mockFn)
      expect(mockFn).toHaveBeenCalledTimes(3)
      expect(mockFn).toHaveBeenCalledWith(1, 'a', obj)
      expect(mockFn).toHaveBeenCalledWith(2, 'b', obj)
      expect(mockFn).toHaveBeenCalledWith(3, 'c', obj)
    })

    it('should handle empty object', () => {
      const mockFn = vi.fn()
      forIn({}, mockFn)
      expect(mockFn).not.toHaveBeenCalled()
    })

    it('should handle null/undefined input', () => {
      const mockFn = vi.fn()
      forIn(null as any, mockFn)
      forIn(undefined as any, mockFn)
      expect(mockFn).not.toHaveBeenCalled()
    })
  })

  describe('hasIn', () => {
    it('should check if object has property (including inherited)', () => {
      const obj = Object.create({ a: 1 })
      obj.b = 2
      expect(hasIn(obj, 'a')).toBe(true)
      expect(hasIn(obj, 'b')).toBe(true)
      expect(hasIn(obj, 'c')).toBe(false)
    })

    it('should handle nested properties', () => {
      const obj = { a: { b: { c: 1 } } }
      expect(hasIn(obj, 'a.b.c')).toBe(true)
      expect(hasIn(obj, 'a.b.d')).toBe(false)
    })

    it('should handle null/undefined input', () => {
      expect(hasIn(null as any, 'a')).toBe(false)
      expect(hasIn(undefined as any, 'a')).toBe(false)
    })
  })

  describe('unset', () => {
    it('should unset property by path', () => {
      const obj = { a: { b: { c: 1 } } }
      const result = unset(obj, 'a.b.c')
      expect(result).toBe(true)
      expect(obj).toEqual({ a: { b: {} } })
    })

    it('should return false if property not found', () => {
      const obj = { a: { b: { c: 1 } } }
      const result = unset(obj, 'a.b.d')
      expect(result).toBe(false)
      expect(obj).toEqual({ a: { b: { c: 1 } } })
    })

    it('should handle null/undefined input', () => {
      expect(unset(null as any, 'a.b.c')).toBe(false)
      expect(unset(undefined as any, 'a.b.c')).toBe(false)
    })
  })

  describe('update', () => {
    it('should update property by path with function', () => {
      const obj = { a: { b: { c: 1 } } }
      const result = update(obj, 'a.b.c', x => x * 2)
      expect(result).toEqual({ a: { b: { c: 2 } } })
    })

    it('should create nested path if not exists', () => {
      const obj = {}
      const result = update(obj, 'a.b.c', () => 1)
      expect(result).toEqual({ a: { b: { c: 1 } } })
    })

    it('should handle null/undefined input', () => {
      const result = update(null as any, 'a.b.c', () => 1)
      expect(result).toEqual({ a: { b: { c: 1 } } })
    })
  })

  describe('toPairs', () => {
    it('should convert object to array of key-value pairs', () => {
      const obj = { a: 1, b: 2, c: 3 }
      const result = toPairs(obj)
      expect(result).toEqual([['a', 1], ['b', 2], ['c', 3]])
    })

    it('should handle empty object', () => {
      expect(toPairs({})).toEqual([])
    })

    it('should handle null/undefined input', () => {
      expect(toPairs(null as any)).toEqual([])
      expect(toPairs(undefined as any)).toEqual([])
    })
  })

  describe('fromPairs', () => {
    it('should convert array of key-value pairs to object', () => {
      const pairs = [['a', 1], ['b', 2], ['c', 3]]
      const result = fromPairs(pairs)
      expect(result).toEqual({ a: 1, b: 2, c: 3 })
    })

    it('should handle empty array', () => {
      expect(fromPairs([])).toEqual({})
    })

    it('should handle null/undefined input', () => {
      expect(fromPairs(null as any)).toEqual({})
      expect(fromPairs(undefined as any)).toEqual({})
    })
  })

  describe('Integration Tests', () => {
    it('should work together for complex object manipulation', () => {
      const data = {
        user: {
          name: 'John Doe',
          email: 'john@example.com',
          profile: {
            age: 30,
            address: {
              street: '123 Main St',
              city: 'Anytown',
              country: 'USA'
            }
          }
        },
        settings: {
          theme: 'dark',
          notifications: true,
          language: 'en'
        }
      }

      // Extract specific properties
      const userInfo = pick(data, 'user')
      const userProfile = get(userInfo, 'user.profile')
      
      // Transform data
      const transformed = mapValues(userProfile, (value, key) => {
        if (key === 'address') {
          return mapValues(value, val => val.toUpperCase())
        }
        return value
      })
      
      // Update nested property
      const updated = set(data, 'user.profile.age', 31)
      
      // Merge with defaults
      const defaults = { settings: { theme: 'light', notifications: false } }
      const merged = merge(data, defaults)
      
      expect(userProfile).toEqual({
        age: 30,
        address: {
          street: '123 Main St',
          city: 'Anytown',
          country: 'USA'
        }
      })
      expect(transformed).toEqual({
        age: 30,
        address: {
          street: '123 MAIN ST',
          city: 'ANYTOWN',
          country: 'USA'
        }
      })
      expect(get(updated, 'user.profile.age')).toBe(31)
      expect(merged.settings.theme).toBe('dark')
      expect(merged.settings.notifications).toBe(true)
    })

    it('should handle complex data transformation pipeline', () => {
      const rawData = [
        { id: 1, name: 'John', department: 'Engineering', salary: 75000 },
        { id: 2, name: 'Jane', department: 'Marketing', salary: 65000 },
        { id: 3, name: 'Bob', department: 'Engineering', salary: 80000 },
        { id: 4, name: 'Alice', department: 'HR', salary: 55000 }
      ]

      // Group by department
      const grouped = rawData.reduce((acc, employee) => {
        const dept = employee.department
        if (!acc[dept]) {
          acc[dept] = []
        }
        acc[dept].push(employee)
        return acc
      }, {} as Record<string, typeof rawData>)

      // Calculate department statistics
      const stats = mapValues(grouped, employees => ({
        count: employees.length,
        averageSalary: employees.reduce((sum, emp) => sum + emp.salary, 0) / employees.length,
        totalSalary: employees.reduce((sum, emp) => sum + emp.salary, 0),
        employees: employees.map(emp => pick(emp, 'id', 'name', 'salary'))
      }))

      // Sort departments by average salary
      const sortedDepts = Object.entries(stats)
        .sort(([, a], [, b]) => b.averageSalary - a.averageSalary)
        .reduce((acc, [dept, data]) => {
          acc[dept] = data
          return acc
        }, {} as typeof stats)

      expect(grouped.Engineering).toHaveLength(2)
      expect(grouped.Marketing).toHaveLength(1)
      expect(grouped.HR).toHaveLength(1)
      expect(stats.Engineering.count).toBe(2)
      expect(stats.Engineering.averageSalary).toBe(77500)
      expect(sortedDepts.Engineering).toBeDefined()
      expect(sortedDepts.Marketing).toBeDefined()
      expect(sortedDepts.HR).toBeDefined()
    })

    it('should handle deep object operations with nested structures', () => {
      const complexObj = {
        level1: {
          level2: {
            level3: {
              value: 'deep',
              array: [1, 2, 3],
              nested: {
                data: 'nested data'
              }
            },
            other: 'other value'
          },
          top: 'top value'
        },
        root: 'root value'
      }

      // Deep clone and modify
      const cloned = cloneDeep(complexObj)
      const modified = set(cloned, 'level1.level2.level3.value', 'modified deep')
      
      // Deep merge with additional data
      const additional = {
        level1: {
          level2: {
            level3: {
              newValue: 'new value'
            },
            newLevel2: 'new level 2'
          },
          newLevel1: 'new level 1'
        },
        newRoot: 'new root'
      }
      
      const merged = merge(complexObj, additional)
      
      // Deep pick specific paths
      const picked = {
        deepValue: get(complexObj, 'level1.level2.level3.value'),
        nestedData: get(complexObj, 'level1.level2.level3.nested.data'),
        arrayFirst: get(complexObj, 'level1.level2.level3.array.0')
      }
      
      expect(modified.level1.level2.level3.value).toBe('modified deep')
      expect(complexObj.level1.level2.level3.value).toBe('deep')
      expect(merged.level1.level2.level3.value).toBe('deep')
      expect(merged.level1.level2.level3.newValue).toBe('new value')
      expect(merged.level1.level2.newLevel2).toBe('new level 2')
      expect(picked.deepValue).toBe('deep')
      expect(picked.nestedData).toBe('nested data')
      expect(picked.arrayFirst).toBe(1)
    })

    it('should handle object validation and transformation with edge cases', () => {
      const testCases = [
        { input: {}, expected: { isEmpty: true, keys: [], values: [] } },
        { input: { a: 1, b: 2, c: 3 }, expected: { isEmpty: false, keys: ['a', 'b', 'c'], values: [1, 2, 3] } },
        { input: null, expected: { isEmpty: true, keys: [], values: [] } },
        { input: undefined, expected: { isEmpty: true, keys: [], values: [] } }
      ]

      testCases.forEach(({ input, expected }) => {
        const result = {
          isEmpty: isEmpty(input as any),
          keys: keys(input as any),
          values: values(input as any)
        }
        expect(result).toEqual(expected)
      })
    })

    it('should handle complex object operations with circular references', () => {
      const obj: any = { name: 'test' }
      obj.self = obj
      obj.nested = { parent: obj }

      // Test deep clone with circular references
      const cloned = cloneDeep(obj)
      expect(cloned.name).toBe('test')
      expect(cloned.self).toBe(cloned)
      expect(cloned.nested.parent).toBe(cloned)

      // Test equality with circular references
      expect(isEqual(obj, cloned)).toBe(true)

      // Test that original and clone are separate objects
      expect(cloned).not.toBe(obj)
    })
  })
})