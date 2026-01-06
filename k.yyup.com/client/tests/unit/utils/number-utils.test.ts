import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';
import { vi } from 'vitest'
import { 
  add, 
  subtract, 
  multiply, 
  divide, 
  round, 
  ceil, 
  floor, 
  abs, 
  min, 
  max, 
  clamp, 
  random, 
  randomInt, 
  randomFloat, 
  isNumber, 
  isInteger, 
  isFloat, 
  isPositive, 
  isNegative, 
  isZero, 
  isNaN, 
  isFinite, 
  isInfinite, 
  isEven, 
  isOdd, 
  isPrime, 
  isDivisible, 
  gcd, 
  lcm, 
  factorial, 
  fibonacci, 
  power, 
  sqrt, 
  cbrt, 
  log, 
  log10, 
  log2, 
  exp, 
  sin, 
  cos, 
  tan, 
  asin, 
  acos, 
  atan, 
  atan2, 
  sinh, 
  cosh, 
  tanh, 
  asinh, 
  acosh, 
  atanh, 
  degrees, 
  radians, 
  normalize, 
  lerp, 
  mapRange, 
  constrain, 
  wrap, 
  angle, 
  distance, 
  magnitude, 
  normalizeVector, 
  dotProduct, 
  crossProduct, 
  formatNumber, 
  formatCurrency, 
  formatPercentage, 
  formatBytes, 
  formatTime, 
  formatDuration, 
  parseNumber, 
  parseCurrency, 
  parsePercentage, 
  parseBytes, 
  parseTime, 
  parseDuration, 
  toNumber, 
  toInt, 
  toFloat, 
  toFixed, 
  toPrecision, 
  toExponential, 
  toRadians, 
  toDegrees, 
  clampNumber, 
  wrapNumber, 
  lerpNumber, 
  mapRangeNumber, 
  normalizeNumber, 
  randomInRange, 
  randomIntInRange, 
  randomFloatInRange, 
  isInRange, 
  isInRangeExclusive, 
  isInRangeInclusive, 
  average, 
  mean, 
  median, 
  mode, 
  sum, 
  product, 
  variance, 
  standardDeviation, 
  percentile, 
  quartile, 
  quantile, 
  range, 
  midrange, 
  harmonicMean, 
  geometricMean, 
  rootMeanSquare, 
  roundTo, 
  roundUpTo, 
  roundDownTo, 
  roundNearest, 
  floorTo, 
  ceilTo, 
  truncate, 
  sign, 
  copysign, 
  nextAfter, 
  nextUp, 
  nextDown, 
  ulp, 
  scale, 
  hypot, 
  hypot3, 
  fma, 
  remainder, 
  fmod, 
  mod, 
  div, 
  rem, 
  quot, 
  imul, 
  clz32, 
  cbrt, 
  expm1, 
  log1p, 
  log10, 
  log2, 
  log, 
  sin, 
  cos, 
  tan, 
  asin, 
  acos, 
  atan, 
  atan2, 
  sinh, 
  cosh, 
  tanh, 
  asinh, 
  acosh, 
  atanh, 
  degrees, 
  radians, 
  normalize, 
  lerp, 
  mapRange, 
  constrain, 
  wrap, 
  angle, 
  distance, 
  magnitude, 
  normalizeVector, 
  dotProduct, 
  crossProduct, 
  formatNumber, 
  formatCurrency, 
  formatPercentage, 
  formatBytes, 
  formatTime, 
  formatDuration, 
  parseNumber, 
  parseCurrency, 
  parsePercentage, 
  parseBytes, 
  parseTime, 
  parseDuration, 
  toNumber, 
  toInt, 
  toFloat, 
  toFixed, 
  toPrecision, 
  toExponential, 
  toRadians, 
  toDegrees, 
  clampNumber, 
  wrapNumber, 
  lerpNumber, 
  mapRangeNumber, 
  normalizeNumber, 
  randomInRange, 
  randomIntInRange, 
  randomFloatInRange, 
  isInRange, 
  isInRangeExclusive, 
  isInRangeInclusive, 
  average, 
  mean, 
  median, 
  mode, 
  sum, 
  product, 
  variance, 
  standardDeviation, 
  percentile, 
  quartile, 
  quantile, 
  range, 
  midrange, 
  harmonicMean, 
  geometricMean, 
  rootMeanSquare, 
  roundTo, 
  roundUpTo, 
  roundDownTo, 
  roundNearest, 
  floorTo, 
  ceilTo, 
  truncate, 
  sign, 
  copysign, 
  nextAfter, 
  nextUp, 
  nextDown, 
  ulp, 
  scale, 
  hypot, 
  hypot3, 
  fma, 
  remainder, 
  fmod, 
  mod, 
  div, 
  rem, 
  quot, 
  imul, 
  clz32 
} from '@/utils/number-utils'

// 控制台错误检测变量
let consoleSpy: any

describe('Number Utils', () => {
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
  describe('Basic Arithmetic', () => {
    describe('add', () => {
      it('should add two numbers', () => {
        expect(add(2, 3)).toBe(5)
        expect(add(-1, 1)).toBe(0)
        expect(add(0, 0)).toBe(0)
      })

      it('should handle decimal numbers', () => {
        expect(add(2.5, 3.5)).toBe(6)
        expect(add(-1.5, 1.5)).toBe(0)
      })

      it('should handle null/undefined input', () => {
        expect(add(null as any, 2)).toBe(2)
        expect(add(undefined as any, 2)).toBe(2)
        expect(add(2, null as any)).toBe(2)
        expect(add(2, undefined as any)).toBe(2)
      })
    })

    describe('subtract', () => {
      it('should subtract two numbers', () => {
        expect(subtract(5, 3)).toBe(2)
        expect(subtract(1, 1)).toBe(0)
        expect(subtract(0, 0)).toBe(0)
      })

      it('should handle decimal numbers', () => {
        expect(subtract(5.5, 3.5)).toBe(2)
        expect(subtract(1.5, 1.5)).toBe(0)
      })

      it('should handle null/undefined input', () => {
        expect(subtract(null as any, 2)).toBe(-2)
        expect(subtract(undefined as any, 2)).toBe(-2)
        expect(subtract(2, null as any)).toBe(2)
        expect(subtract(2, undefined as any)).toBe(2)
      })
    })

    describe('multiply', () => {
      it('should multiply two numbers', () => {
        expect(multiply(2, 3)).toBe(6)
        expect(multiply(0, 5)).toBe(0)
        expect(multiply(-2, 3)).toBe(-6)
      })

      it('should handle decimal numbers', () => {
        expect(multiply(2.5, 4)).toBe(10)
        expect(multiply(-1.5, 2)).toBe(-3)
      })

      it('should handle null/undefined input', () => {
        expect(multiply(null as any, 2)).toBe(0)
        expect(multiply(undefined as any, 2)).toBe(0)
        expect(multiply(2, null as any)).toBe(0)
        expect(multiply(2, undefined as any)).toBe(0)
      })
    })

    describe('divide', () => {
      it('should divide two numbers', () => {
        expect(divide(6, 3)).toBe(2)
        expect(divide(10, 2)).toBe(5)
        expect(divide(-6, 3)).toBe(-2)
      })

      it('should handle decimal numbers', () => {
        expect(divide(5, 2)).toBe(2.5)
        expect(divide(-7.5, 2.5)).toBe(-3)
      })

      it('should handle division by zero', () => {
        expect(divide(5, 0)).toBe(Infinity)
        expect(divide(-5, 0)).toBe(-Infinity)
      })

      it('should handle null/undefined input', () => {
        expect(divide(null as any, 2)).toBe(0)
        expect(divide(undefined as any, 2)).toBe(0)
        expect(divide(2, null as any)).toBe(Infinity)
        expect(divide(2, undefined as any)).toBe(Infinity)
      })
    })
  })

  describe('Rounding Functions', () => {
    describe('round', () => {
      it('should round numbers', () => {
        expect(round(2.3)).toBe(2)
        expect(round(2.7)).toBe(3)
        expect(round(2.5)).toBe(3)
        expect(round(-2.3)).toBe(-2)
        expect(round(-2.7)).toBe(-3)
      })

      it('should handle precision parameter', () => {
        expect(round(2.345, 2)).toBe(2.35)
        expect(round(2.344, 2)).toBe(2.34)
        expect(round(2.3456, 3)).toBe(2.346)
      })

      it('should handle null/undefined input', () => {
        expect(round(null as any)).toBe(0)
        expect(round(undefined as any)).toBe(0)
      })
    })

    describe('ceil', () => {
      it('should ceil numbers', () => {
        expect(ceil(2.3)).toBe(3)
        expect(ceil(2.7)).toBe(3)
        expect(ceil(2.0)).toBe(2)
        expect(ceil(-2.3)).toBe(-2)
        expect(ceil(-2.7)).toBe(-2)
      })

      it('should handle null/undefined input', () => {
        expect(ceil(null as any)).toBe(0)
        expect(ceil(undefined as any)).toBe(0)
      })
    })

    describe('floor', () => {
      it('should floor numbers', () => {
        expect(floor(2.3)).toBe(2)
        expect(floor(2.7)).toBe(2)
        expect(floor(2.0)).toBe(2)
        expect(floor(-2.3)).toBe(-3)
        expect(floor(-2.7)).toBe(-3)
      })

      it('should handle null/undefined input', () => {
        expect(floor(null as any)).toBe(0)
        expect(floor(undefined as any)).toBe(0)
      })
    })

    describe('abs', () => {
      it('should return absolute value', () => {
        expect(abs(5)).toBe(5)
        expect(abs(-5)).toBe(5)
        expect(abs(0)).toBe(0)
      })

      it('should handle null/undefined input', () => {
        expect(abs(null as any)).toBe(0)
        expect(abs(undefined as any)).toBe(0)
      })
    })
  })

  describe('Comparison Functions', () => {
    describe('min', () => {
      it('should return minimum value', () => {
        expect(min(2, 3)).toBe(2)
        expect(min(-1, 1)).toBe(-1)
        expect(min(0, 0)).toBe(0)
      })

      it('should handle multiple arguments', () => {
        expect(min(5, 2, 8, 1, 9)).toBe(1)
        expect(min(-1, -5, -3)).toBe(-5)
      })

      it('should handle null/undefined input', () => {
        expect(min(null as any, 2)).toBe(0)
        expect(min(undefined as any, 2)).toBe(0)
      })
    })

    describe('max', () => {
      it('should return maximum value', () => {
        expect(max(2, 3)).toBe(3)
        expect(max(-1, 1)).toBe(1)
        expect(max(0, 0)).toBe(0)
      })

      it('should handle multiple arguments', () => {
        expect(max(5, 2, 8, 1, 9)).toBe(9)
        expect(max(-1, -5, -3)).toBe(-1)
      })

      it('should handle null/undefined input', () => {
        expect(max(null as any, 2)).toBe(2)
        expect(max(undefined as any, 2)).toBe(2)
      })
    })

    describe('clamp', () => {
      it('should clamp value between min and max', () => {
        expect(clamp(5, 0, 10)).toBe(5)
        expect(clamp(-5, 0, 10)).toBe(0)
        expect(clamp(15, 0, 10)).toBe(10)
        expect(clamp(0, 0, 10)).toBe(0)
        expect(clamp(10, 0, 10)).toBe(10)
      })

      it('should handle null/undefined input', () => {
        expect(clamp(null as any, 0, 10)).toBe(0)
        expect(clamp(undefined as any, 0, 10)).toBe(0)
      })
    })
  })

  describe('Random Functions', () => {
    describe('random', () => {
      it('should return random number between 0 and 1', () => {
        const result = random()
        expect(result).toBeGreaterThanOrEqual(0)
        expect(result).toBeLessThan(1)
      })

      it('should return random number in range', () => {
        const result = random(5, 10)
        expect(result).toBeGreaterThanOrEqual(5)
        expect(result).toBeLessThan(10)
      })

      it('should handle single parameter', () => {
        const result = random(5)
        expect(result).toBeGreaterThanOrEqual(0)
        expect(result).toBeLessThan(5)
      })
    })

    describe('randomInt', () => {
      it('should return random integer in range', () => {
        const result = randomInt(1, 10)
        expect(Number.isInteger(result)).toBe(true)
        expect(result).toBeGreaterThanOrEqual(1)
        expect(result).toBeLessThanOrEqual(10)
      })

      it('should handle single parameter', () => {
        const result = randomInt(10)
        expect(Number.isInteger(result)).toBe(true)
        expect(result).toBeGreaterThanOrEqual(0)
        expect(result).toBeLessThan(10)
      })
    })

    describe('randomFloat', () => {
      it('should return random float in range', () => {
        const result = randomFloat(1.5, 5.5)
        expect(result).toBeGreaterThanOrEqual(1.5)
        expect(result).toBeLessThan(5.5)
      })
    })
  })

  describe('Type Checking Functions', () => {
    describe('isNumber', () => {
      it('should return true for numbers', () => {
        expect(isNumber(5)).toBe(true)
        expect(isNumber(-3.14)).toBe(true)
        expect(isNumber(0)).toBe(true)
        expect(isNumber(Infinity)).toBe(true)
        expect(isNumber(-Infinity)).toBe(true)
      })

      it('should return false for non-numbers', () => {
        expect(isNumber('5')).toBe(false)
        expect(isNumber(true)).toBe(false)
        expect(isNumber(null)).toBe(false)
        expect(isNumber(undefined)).toBe(false)
        expect(isNumber({})).toBe(false)
        expect(isNumber([])).toBe(false)
      })

      it('should handle NaN', () => {
        expect(isNumber(NaN)).toBe(false)
      })
    })

    describe('isInteger', () => {
      it('should return true for integers', () => {
        expect(isInteger(5)).toBe(true)
        expect(isInteger(-3)).toBe(true)
        expect(isInteger(0)).toBe(true)
        expect(isInteger(Number.MAX_SAFE_INTEGER)).toBe(true)
        expect(isInteger(Number.MIN_SAFE_INTEGER)).toBe(true)
      })

      it('should return false for non-integers', () => {
        expect(isInteger(3.14)).toBe(false)
        expect(isInteger(-3.14)).toBe(false)
        expect(isInteger(Infinity)).toBe(false)
        expect(isInteger(-Infinity)).toBe(false)
      })
    })

    describe('isFloat', () => {
      it('should return true for floating point numbers', () => {
        expect(isFloat(3.14)).toBe(true)
        expect(isFloat(-3.14)).toBe(true)
        expect(isFloat(0.0)).toBe(true)
      })

      it('should return false for non-floating point numbers', () => {
        expect(isFloat(5)).toBe(false)
        expect(isFloat(-3)).toBe(false)
        expect(isFloat(Infinity)).toBe(false)
        expect(isFloat(-Infinity)).toBe(false)
      })
    })

    describe('isPositive', () => {
      it('should return true for positive numbers', () => {
        expect(isPositive(5)).toBe(true)
        expect(isPositive(3.14)).toBe(true)
        expect(isPositive(0.0001)).toBe(true)
      })

      it('should return false for non-positive numbers', () => {
        expect(isPositive(-5)).toBe(false)
        expect(isPositive(-3.14)).toBe(false)
        expect(isPositive(0)).toBe(false)
      })
    })

    describe('isNegative', () => {
      it('should return true for negative numbers', () => {
        expect(isNegative(-5)).toBe(true)
        expect(isNegative(-3.14)).toBe(true)
        expect(isNegative(-0.0001)).toBe(true)
      })

      it('should return false for non-negative numbers', () => {
        expect(isNegative(5)).toBe(false)
        expect(isNegative(3.14)).toBe(false)
        expect(isNegative(0)).toBe(false)
      })
    })

    describe('isZero', () => {
      it('should return true for zero', () => {
        expect(isZero(0)).toBe(true)
        expect(isZero(-0)).toBe(true)
        expect(isZero(0.0)).toBe(true)
      })

      it('should return false for non-zero numbers', () => {
        expect(isZero(5)).toBe(false)
        expect(isZero(-3.14)).toBe(false)
        expect(isZero(0.0001)).toBe(false)
      })
    })

    describe('isNaN', () => {
      it('should return true for NaN', () => {
        expect(isNaN(NaN)).toBe(true)
      })

      it('should return false for non-NaN values', () => {
        expect(isNaN(5)).toBe(false)
        expect(isNaN(-3.14)).toBe(false)
        expect(isNaN(0)).toBe(false)
        expect(isNaN(Infinity)).toBe(false)
        expect(isNaN(-Infinity)).toBe(false)
      })
    })

    describe('isFinite', () => {
      it('should return true for finite numbers', () => {
        expect(isFinite(5)).toBe(true)
        expect(isFinite(-3.14)).toBe(true)
        expect(isFinite(0)).toBe(true)
      })

      it('should return false for infinite numbers', () => {
        expect(isFinite(Infinity)).toBe(false)
        expect(isFinite(-Infinity)).toBe(false)
        expect(isFinite(NaN)).toBe(false)
      })
    })

    describe('isEven', () => {
      it('should return true for even numbers', () => {
        expect(isEven(2)).toBe(true)
        expect(isEven(0)).toBe(true)
        expect(isEven(-4)).toBe(true)
      })

      it('should return false for odd numbers', () => {
        expect(isEven(1)).toBe(false)
        expect(isEven(3)).toBe(false)
        expect(isEven(-3)).toBe(false)
      })

      it('should handle non-integers', () => {
        expect(isEven(2.5)).toBe(false)
        expect(isEven(3.1)).toBe(false)
      })
    })

    describe('isOdd', () => {
      it('should return true for odd numbers', () => {
        expect(isOdd(1)).toBe(true)
        expect(isOdd(3)).toBe(true)
        expect(isOdd(-3)).toBe(true)
      })

      it('should return false for even numbers', () => {
        expect(isOdd(2)).toBe(false)
        expect(isOdd(0)).toBe(false)
        expect(isOdd(-4)).toBe(false)
      })

      it('should handle non-integers', () => {
        expect(isOdd(2.5)).toBe(false)
        expect(isOdd(3.1)).toBe(false)
      })
    })
  })

  describe('Mathematical Functions', () => {
    describe('gcd', () => {
      it('should calculate greatest common divisor', () => {
        expect(gcd(12, 18)).toBe(6)
        expect(gcd(48, 18)).toBe(6)
        expect(gcd(17, 23)).toBe(1)
        expect(gcd(0, 5)).toBe(5)
        expect(gcd(5, 0)).toBe(5)
      })
    })

    describe('lcm', () => {
      it('should calculate least common multiple', () => {
        expect(lcm(12, 18)).toBe(36)
        expect(lcm(4, 6)).toBe(12)
        expect(lcm(17, 23)).toBe(391)
        expect(lcm(0, 5)).toBe(0)
        expect(lcm(5, 0)).toBe(0)
      })
    })

    describe('factorial', () => {
      it('should calculate factorial', () => {
        expect(factorial(0)).toBe(1)
        expect(factorial(1)).toBe(1)
        expect(factorial(5)).toBe(120)
        expect(factorial(10)).toBe(3628800)
      })

      it('should handle negative numbers', () => {
        expect(() => factorial(-1)).toThrow()
      })
    })

    describe('fibonacci', () => {
      it('should calculate fibonacci number', () => {
        expect(fibonacci(0)).toBe(0)
        expect(fibonacci(1)).toBe(1)
        expect(fibonacci(2)).toBe(1)
        expect(fibonacci(3)).toBe(2)
        expect(fibonacci(4)).toBe(3)
        expect(fibonacci(5)).toBe(5)
        expect(fibonacci(10)).toBe(55)
      })

      it('should handle negative numbers', () => {
        expect(() => fibonacci(-1)).toThrow()
      })
    })

    describe('power', () => {
      it('should calculate power', () => {
        expect(power(2, 3)).toBe(8)
        expect(power(3, 2)).toBe(9)
        expect(power(4, 0.5)).toBe(2)
        expect(power(2, -2)).toBe(0.25)
      })
    })

    describe('sqrt', () => {
      it('should calculate square root', () => {
        expect(sqrt(4)).toBe(2)
        expect(sqrt(9)).toBe(3)
        expect(sqrt(2)).toBeCloseTo(1.41421356237, 10)
      })

      it('should handle negative numbers', () => {
        expect(sqrt(-4)).toBe(NaN)
      })
    })

    describe('cbrt', () => {
      it('should calculate cube root', () => {
        expect(cbrt(8)).toBe(2)
        expect(cbrt(27)).toBe(3)
        expect(cbrt(-8)).toBe(-2)
      })
    })
  })

  describe('Trigonometric Functions', () => {
    describe('sin', () => {
      it('should calculate sine', () => {
        expect(sin(0)).toBeCloseTo(0, 10)
        expect(sin(Math.PI / 2)).toBeCloseTo(1, 10)
        expect(sin(Math.PI)).toBeCloseTo(0, 10)
      })
    })

    describe('cos', () => {
      it('should calculate cosine', () => {
        expect(cos(0)).toBeCloseTo(1, 10)
        expect(cos(Math.PI / 2)).toBeCloseTo(0, 10)
        expect(cos(Math.PI)).toBeCloseTo(-1, 10)
      })
    })

    describe('tan', () => {
      it('should calculate tangent', () => {
        expect(tan(0)).toBeCloseTo(0, 10)
        expect(tan(Math.PI / 4)).toBeCloseTo(1, 10)
      })
    })

    describe('degrees', () => {
      it('should convert radians to degrees', () => {
        expect(degrees(0)).toBe(0)
        expect(degrees(Math.PI)).toBe(180)
        expect(degrees(Math.PI / 2)).toBe(90)
      })
    })

    describe('radians', () => {
      it('should convert degrees to radians', () => {
        expect(radians(0)).toBe(0)
        expect(radians(180)).toBeCloseTo(Math.PI, 10)
        expect(radians(90)).toBeCloseTo(Math.PI / 2, 10)
      })
    })
  })

  describe('Range and Interpolation Functions', () => {
    describe('normalize', () => {
      it('should normalize number to 0-1 range', () => {
        expect(normalize(5, 0, 10)).toBe(0.5)
        expect(normalize(0, 0, 10)).toBe(0)
        expect(normalize(10, 0, 10)).toBe(1)
        expect(normalize(-5, 0, 10)).toBe(-0.5)
      })
    })

    describe('lerp', () => {
      it('should linear interpolate between two values', () => {
        expect(lerp(0, 10, 0.5)).toBe(5)
        expect(lerp(0, 10, 0)).toBe(0)
        expect(lerp(0, 10, 1)).toBe(10)
        expect(lerp(0, 10, 0.25)).toBe(2.5)
      })
    })

    describe('mapRange', () => {
      it('should map number from one range to another', () => {
        expect(mapRange(5, 0, 10, 0, 100)).toBe(50)
        expect(mapRange(0, 0, 10, 0, 100)).toBe(0)
        expect(mapRange(10, 0, 10, 0, 100)).toBe(100)
        expect(mapRange(5, 0, 10, 100, 200)).toBe(150)
      })
    })

    describe('constrain', () => {
      it('should constrain value to range', () => {
        expect(constrain(5, 0, 10)).toBe(5)
        expect(constrain(-5, 0, 10)).toBe(0)
        expect(constrain(15, 0, 10)).toBe(10)
      })
    })

    describe('wrap', () => {
      it('should wrap value within range', () => {
        expect(wrap(15, 0, 10)).toBe(5)
        expect(wrap(-5, 0, 10)).toBe(5)
        expect(wrap(25, 0, 10)).toBe(5)
      })
    })
  })

  describe('Vector Functions', () => {
    describe('magnitude', () => {
      it('should calculate vector magnitude', () => {
        expect(magnitude([3, 4])).toBe(5)
        expect(magnitude([1, 1, 1])).toBeCloseTo(1.73205080757, 10)
      })
    })

    describe('normalizeVector', () => {
      it('should normalize vector', () => {
        expect(normalizeVector([3, 4])).toEqual([0.6, 0.8])
        expect(normalizeVector([0, 0])).toEqual([0, 0])
      })
    })

    describe('dotProduct', () => {
      it('should calculate dot product', () => {
        expect(dotProduct([1, 2], [3, 4])).toBe(11)
        expect(dotProduct([1, 2, 3], [4, 5, 6])).toBe(32)
      })
    })

    describe('crossProduct', () => {
      it('should calculate cross product for 3D vectors', () => {
        expect(crossProduct([1, 2, 3], [4, 5, 6])).toEqual([-3, 6, -3])
      })
    })
  })

  describe('Formatting Functions', () => {
    describe('formatNumber', () => {
      it('should format number with default settings', () => {
        expect(formatNumber(1234.56)).toBe('1,234.56')
        expect(formatNumber(1000)).toBe('1,000')
        expect(formatNumber(0)).toBe('0')
      })

      it('should format number with custom locale', () => {
        expect(formatNumber(1234.56, 'de-DE')).toBe('1.234,56')
      })

      it('should handle decimal places', () => {
        expect(formatNumber(1234.5678, 'en-US', 2)).toBe('1,234.57')
        expect(formatNumber(1234.5678, 'en-US', 0)).toBe('1,235')
      })
    })

    describe('formatCurrency', () => {
      it('should format currency with default settings', () => {
        expect(formatCurrency(1234.56)).toBe('$1,234.56')
        expect(formatCurrency(1000)).toBe('$1,000.00')
      })

      it('should format currency with custom currency', () => {
        expect(formatCurrency(1234.56, 'EUR')).toBe('€1,234.56')
        expect(formatCurrency(1000, 'GBP')).toBe('£1,000.00')
      })
    })

    describe('formatPercentage', () => {
      it('should format percentage', () => {
        expect(formatPercentage(0.1234)).toBe('12.34%')
        expect(formatPercentage(0.5)).toBe('50%')
        expect(formatPercentage(1)).toBe('100%')
      })

      it('should handle decimal places', () => {
        expect(formatPercentage(0.1234, 1)).toBe('12.3%')
        expect(formatPercentage(0.1234, 3)).toBe('12.340%')
      })
    })

    describe('formatBytes', () => {
      it('should format bytes', () => {
        expect(formatBytes(500)).toBe('500 B')
        expect(formatBytes(1024)).toBe('1 KB')
        expect(formatBytes(1048576)).toBe('1 MB')
        expect(formatBytes(1073741824)).toBe('1 GB')
      })

      it('should handle decimal places', () => {
        expect(formatBytes(1536, 1)).toBe('1.5 KB')
      })
    })
  })

  describe('Parsing Functions', () => {
    describe('parseNumber', () => {
      it('should parse number from string', () => {
        expect(parseNumber('1234.56')).toBe(1234.56)
        expect(parseNumber('1,234.56')).toBe(1234.56)
        expect(parseNumber('-123.45')).toBe(-123.45)
      })

      it('should handle invalid input', () => {
        expect(parseNumber('invalid')).toBe(NaN)
        expect(parseNumber('')).toBe(NaN)
      })
    })

    describe('parseCurrency', () => {
      it('should parse currency from string', () => {
        expect(parseCurrency('$1,234.56')).toBe(1234.56)
        expect(parseCurrency('€1.234,56')).toBe(1234.56)
        expect(parseCurrency('£1,000')).toBe(1000)
      })

      it('should handle invalid input', () => {
        expect(parseCurrency('invalid')).toBe(NaN)
        expect(parseCurrency('')).toBe(NaN)
      })
    })

    describe('parsePercentage', () => {
      it('should parse percentage from string', () => {
        expect(parsePercentage('12.34%')).toBe(0.1234)
        expect(parsePercentage('50%')).toBe(0.5)
        expect(parsePercentage('100%')).toBe(1)
      })

      it('should handle invalid input', () => {
        expect(parsePercentage('invalid')).toBe(NaN)
        expect(parsePercentage('')).toBe(NaN)
      })
    })
  })

  describe('Conversion Functions', () => {
    describe('toNumber', () => {
      it('should convert value to number', () => {
        expect(toNumber('123')).toBe(123)
        expect(toNumber('123.45')).toBe(123.45)
        expect(toNumber(true)).toBe(1)
        expect(toNumber(false)).toBe(0)
      })

      it('should handle invalid input', () => {
        expect(toNumber('invalid')).toBe(NaN)
        expect(toNumber(null)).toBe(0)
        expect(toNumber(undefined)).toBe(NaN)
      })
    })

    describe('toInt', () => {
      it('should convert value to integer', () => {
        expect(toInt('123')).toBe(123)
        expect(toInt('123.45')).toBe(123)
        expect(toInt(123.45)).toBe(123)
        expect(toInt(true)).toBe(1)
      })

      it('should handle invalid input', () => {
        expect(toInt('invalid')).toBe(0)
        expect(toInt(null)).toBe(0)
        expect(toInt(undefined)).toBe(0)
      })
    })

    describe('toFloat', () => {
      it('should convert value to float', () => {
        expect(toFloat('123')).toBe(123)
        expect(toFloat('123.45')).toBe(123.45)
        expect(toFloat(123)).toBe(123)
        expect(toFloat(true)).toBe(1)
      })

      it('should handle invalid input', () => {
        expect(toFloat('invalid')).toBe(NaN)
        expect(toFloat(null)).toBe(0)
        expect(toFloat(undefined)).toBe(NaN)
      })
    })

    describe('toFixed', () => {
      it('should format number to fixed decimal places', () => {
        expect(toFixed(123.456, 2)).toBe('123.46')
        expect(toFixed(123.456, 0)).toBe('123')
        expect(toFixed(123.456, 4)).toBe('123.4560')
      })
    })

    describe('toPrecision', () => {
      it('should format number to precision', () => {
        expect(toPrecision(123.456, 3)).toBe('123')
        expect(toPrecision(123.456, 5)).toBe('123.46')
        expect(toPrecision(123.456, 7)).toBe('123.4560')
      })
    })
  })

  describe('Statistical Functions', () => {
    describe('average', () => {
      it('should calculate average', () => {
        expect(average([1, 2, 3, 4, 5])).toBe(3)
        expect(average([10, 20, 30])).toBe(20)
      })

      it('should handle empty array', () => {
        expect(average([])).toBe(0)
      })
    })

    describe('sum', () => {
      it('should calculate sum', () => {
        expect(sum([1, 2, 3, 4, 5])).toBe(15)
        expect(sum([10, 20, 30])).toBe(60)
      })

      it('should handle empty array', () => {
        expect(sum([])).toBe(0)
      })
    })

    describe('product', () => {
      it('should calculate product', () => {
        expect(product([2, 3, 4])).toBe(24)
        expect(product([1, 2, 3, 4])).toBe(24)
      })

      it('should handle empty array', () => {
        expect(product([])).toBe(1)
      })
    })

    describe('median', () => {
      it('should calculate median', () => {
        expect(median([1, 2, 3, 4, 5])).toBe(3)
        expect(median([1, 2, 3, 4])).toBe(2.5)
        expect(median([5, 2, 1, 3, 4])).toBe(3)
      })

      it('should handle empty array', () => {
        expect(median([])).toBe(0)
      })
    })

    describe('mode', () => {
      it('should calculate mode', () => {
        expect(mode([1, 2, 2, 3, 3, 3, 4])).toBe(3)
        expect(mode([1, 1, 2, 2, 3])).toEqual([1, 2])
      })

      it('should handle empty array', () => {
        expect(mode([])).toEqual([])
      })
    })

    describe('variance', () => {
      it('should calculate variance', () => {
        expect(variance([1, 2, 3, 4, 5])).toBe(2)
        expect(variance([10, 20, 30])).toBeCloseTo(66.6666666667, 10)
      })

      it('should handle empty array', () => {
        expect(variance([])).toBe(0)
      })
    })

    describe('standardDeviation', () => {
      it('should calculate standard deviation', () => {
        expect(standardDeviation([1, 2, 3, 4, 5])).toBeCloseTo(1.41421356237, 10)
        expect(standardDeviation([10, 20, 30])).toBeCloseTo(8.16496580928, 10)
      })

      it('should handle empty array', () => {
        expect(standardDeviation([])).toBe(0)
      })
    })
  })

  describe('Range Functions', () => {
    describe('randomInRange', () => {
      it('should return random number in range', () => {
        const result = randomInRange(5, 10)
        expect(result).toBeGreaterThanOrEqual(5)
        expect(result).toBeLessThan(10)
      })
    })

    describe('randomIntInRange', () => {
      it('should return random integer in range', () => {
        const result = randomIntInRange(1, 10)
        expect(Number.isInteger(result)).toBe(true)
        expect(result).toBeGreaterThanOrEqual(1)
        expect(result).toBeLessThanOrEqual(10)
      })
    })

    describe('randomFloatInRange', () => {
      it('should return random float in range', () => {
        const result = randomFloatInRange(1.5, 5.5)
        expect(result).toBeGreaterThanOrEqual(1.5)
        expect(result).toBeLessThan(5.5)
      })
    })

    describe('isInRange', () => {
      it('should check if number is in range', () => {
        expect(isInRange(5, 0, 10)).toBe(true)
        expect(isInRange(0, 0, 10)).toBe(true)
        expect(isInRange(10, 0, 10)).toBe(true)
        expect(isInRange(-5, 0, 10)).toBe(false)
        expect(isInRange(15, 0, 10)).toBe(false)
      })
    })

    describe('isInRangeExclusive', () => {
      it('should check if number is in exclusive range', () => {
        expect(isInRangeExclusive(5, 0, 10)).toBe(true)
        expect(isInRangeExclusive(0, 0, 10)).toBe(false)
        expect(isInRangeExclusive(10, 0, 10)).toBe(false)
        expect(isInRangeExclusive(-5, 0, 10)).toBe(false)
        expect(isInRangeExclusive(15, 0, 10)).toBe(false)
      })
    })

    describe('isInRangeInclusive', () => {
      it('should check if number is in inclusive range', () => {
        expect(isInRangeInclusive(5, 0, 10)).toBe(true)
        expect(isInRangeInclusive(0, 0, 10)).toBe(true)
        expect(isInRangeInclusive(10, 0, 10)).toBe(true)
        expect(isInRangeInclusive(-5, 0, 10)).toBe(false)
        expect(isInRangeInclusive(15, 0, 10)).toBe(false)
      })
    })
  })

  describe('Integration Tests', () => {
    it('should work together for complex number calculations', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      
      // Calculate statistics
      const avg = average(data)
      const total = sum(data)
      const stdDev = standardDeviation(data)
      const medianVal = median(data)
      
      // Generate random values within range
      const randomVal = randomInRange(avg - stdDev, avg + stdDev)
      const clampedVal = clamp(randomVal, min(data), max(data))
      
      // Format results
      const formattedAvg = formatNumber(avg, 'en-US', 2)
      const formattedTotal = formatNumber(total, 'en-US', 0)
      const formattedStdDev = formatNumber(stdDev, 'en-US', 3)
      
      expect(avg).toBe(5.5)
      expect(total).toBe(55)
      expect(medianVal).toBe(5.5)
      expect(clampedVal).toBeGreaterThanOrEqual(1)
      expect(clampedVal).toBeLessThanOrEqual(10)
      expect(formattedAvg).toBe('5.50')
      expect(formattedTotal).toBe('55')
    })

    it('should handle complex mathematical operations', () => {
      const a = 3
      const b = 4
      const c = 5
      
      // Pythagorean theorem
      const hypotenuse = sqrt(power(a, 2) + power(b, 2))
      expect(hypotenuse).toBe(c)
      
      // Trigonometric calculations
      const angleRad = atan2(b, a)
      const angleDeg = degrees(angleRad)
      expect(sin(angleRad)).toBeCloseTo(0.6, 10)
      expect(cos(angleRad)).toBeCloseTo(0.8, 10)
      expect(angleDeg).toBeCloseTo(53.13010235416, 10)
      
      // Vector operations
      const vector1 = [a, b]
      const vector2 = [b, a]
      const dot = dotProduct(vector1, vector2)
      const mag1 = magnitude(vector1)
      const mag2 = magnitude(vector2)
      
      expect(dot).toBe(24)
      expect(mag1).toBe(5)
      expect(mag2).toBe(5)
    })

    it('should handle complex data transformation and formatting', () => {
      const financialData = [
        { amount: 1234.56, currency: 'USD' },
        { amount: 789.12, currency: 'EUR' },
        { amount: 3456.78, currency: 'GBP' },
        { amount: 567.89, currency: 'USD' }
      ]
      
      // Calculate totals and statistics
      const amounts = financialData.map(item => item.amount)
      const totalAmount = sum(amounts)
      const averageAmount = average(amounts)
      const maxAmount = max(...amounts)
      const minAmount = min(...amounts)
      
      // Format financial data
      const formattedData = financialData.map(item => ({
        ...item,
        formattedAmount: formatCurrency(item.amount, item.currency),
        percentage: formatPercentage(item.amount / totalAmount)
      }))
      
      // Generate summary
      const summary = {
        total: formatCurrency(totalAmount, 'USD'),
        average: formatCurrency(averageAmount, 'USD'),
        max: formatCurrency(maxAmount, 'USD'),
        min: formatCurrency(minAmount, 'USD'),
        count: financialData.length
      }
      
      expect(totalAmount).toBeCloseTo(6048.35, 2)
      expect(averageAmount).toBeCloseTo(1512.0875, 4)
      expect(maxAmount).toBe(3456.78)
      expect(minAmount).toBe(567.89)
      expect(formattedData[0].formattedAmount).toBe('$1,234.56')
      expect(formattedData[0].percentage).toBe('20.41%')
      expect(summary.total).toBe('$6,048.35')
      expect(summary.count).toBe(4)
    })

    it('should handle complex range and interpolation operations', () => {
      const minValue = 0
      const maxValue = 100
      const currentValue = 75
      
      // Normalize and interpolate
      const normalized = normalize(currentValue, minValue, maxValue)
      const interpolated = lerp(minValue, maxValue, normalized)
      
      // Map to different range
      const mappedValue = mapRange(currentValue, minValue, maxValue, -10, 10)
      
      // Generate random values and constrain
      const randomVal = randomInRange(minValue, maxValue)
      const constrainedVal = constrain(randomVal, minValue + 20, maxValue - 20)
      
      // Wrap values
      const wrappedVal = wrap(currentValue + 50, minValue, maxValue)
      
      expect(normalized).toBe(0.75)
      expect(interpolated).toBe(75)
      expect(mappedValue).toBe(5)
      expect(constrainedVal).toBeGreaterThanOrEqual(20)
      expect(constrainedVal).toBeLessThanOrEqual(80)
      expect(wrappedVal).toBe(25)
    })

    it('should handle complex mathematical calculations with edge cases', () => {
      const testCases = [
        { input: 0, expected: { isEven: true, isOdd: false, isZero: true, isPositive: false, isNegative: false } },
        { input: 1, expected: { isEven: false, isOdd: true, isZero: false, isPositive: true, isNegative: false } },
        { input: -1, expected: { isEven: false, isOdd: true, isZero: false, isPositive: false, isNegative: true } },
        { input: 2.5, expected: { isEven: false, isOdd: false, isZero: false, isPositive: true, isNegative: false } },
        { input: Infinity, expected: { isEven: false, isOdd: false, isZero: false, isPositive: true, isNegative: false } },
        { input: -Infinity, expected: { isEven: false, isOdd: false, isZero: false, isPositive: false, isNegative: true } },
        { input: NaN, expected: { isEven: false, isOdd: false, isZero: false, isPositive: false, isNegative: false } }
      ]

      testCases.forEach(({ input, expected }) => {
        const result = {
          isEven: isEven(input),
          isOdd: isOdd(input),
          isZero: isZero(input),
          isPositive: isPositive(input),
          isNegative: isNegative(input)
        }
        expect(result).toEqual(expected)
      })
    })
  })
})