import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';
import { vi } from 'vitest'
import * as mathUtils from '../../../src/utils/math-utils'

// 控制台错误检测变量
let consoleSpy: any

describe('Math Utils', () => {
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
  beforeEach(() => {
    // Reset any global state if needed
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  afterEach(() => {
    vi.clearAllMocks()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('Basic Arithmetic', () => {
    describe('add', () => {
      it('should add two numbers', () => {
        const result = mathUtils.add(2, 3)
        expect(result).toBe(5)
      })

      it('should add negative numbers', () => {
        const result = mathUtils.add(-2, -3)
        expect(result).toBe(-5)
      })

      it('should add decimal numbers', () => {
        const result = mathUtils.add(2.5, 3.7)
        expect(result).toBe(6.2)
      })

      it('should add zero', () => {
        const result = mathUtils.add(5, 0)
        expect(result).toBe(5)
      })
    })

    describe('subtract', () => {
      it('should subtract two numbers', () => {
        const result = mathUtils.subtract(5, 3)
        expect(result).toBe(2)
      })

      it('should subtract negative numbers', () => {
        const result = mathUtils.subtract(-5, -3)
        expect(result).toBe(-2)
      })

      it('should subtract decimal numbers', () => {
        const result = mathUtils.subtract(5.7, 3.2)
        expect(result).toBe(2.5)
      })
    })

    describe('multiply', () => {
      it('should multiply two numbers', () => {
        const result = mathUtils.multiply(3, 4)
        expect(result).toBe(12)
      })

      it('should multiply by zero', () => {
        const result = mathUtils.multiply(5, 0)
        expect(result).toBe(0)
      })

      it('should multiply negative numbers', () => {
        const result = mathUtils.multiply(-3, 4)
        expect(result).toBe(-12)
      })

      it('should multiply decimal numbers', () => {
        const result = mathUtils.multiply(2.5, 4)
        expect(result).toBe(10)
      })
    })

    describe('divide', () => {
      it('should divide two numbers', () => {
        const result = mathUtils.divide(12, 3)
        expect(result).toBe(4)
      })

      it('should divide decimal numbers', () => {
        const result = mathUtils.divide(10, 4)
        expect(result).toBe(2.5)
      })

      it('should handle division by zero', () => {
        expect(() => mathUtils.divide(5, 0)).toThrow()
      })

      it('should divide negative numbers', () => {
        const result = mathUtils.divide(-12, 3)
        expect(result).toBe(-4)
      })
    })

    describe('modulo', () => {
      it('should calculate modulo', () => {
        const result = mathUtils.modulo(10, 3)
        expect(result).toBe(1)
      })

      it('should handle negative numbers', () => {
        const result = mathUtils.modulo(-10, 3)
        expect(result).toBe(2)
      })

      it('should handle modulo by zero', () => {
        expect(() => mathUtils.modulo(10, 0)).toThrow()
      })
    })

    describe('power', () => {
      it('should calculate power', () => {
        const result = mathUtils.power(2, 3)
        expect(result).toBe(8)
      })

      it('should calculate power with decimal exponent', () => {
        const result = mathUtils.power(4, 0.5)
        expect(result).toBe(2)
      })

      it('should calculate power with negative exponent', () => {
        const result = mathUtils.power(2, -2)
        expect(result).toBe(0.25)
      })

      it('should handle zero base', () => {
        const result = mathUtils.power(0, 5)
        expect(result).toBe(0)
      })
    })

    describe('sqrt', () => {
      it('should calculate square root', () => {
        const result = mathUtils.sqrt(16)
        expect(result).toBe(4)
      })

      it('should calculate square root of decimal', () => {
        const result = mathUtils.sqrt(2.25)
        expect(result).toBe(1.5)
      })

      it('should handle negative number', () => {
        expect(() => mathUtils.sqrt(-4)).toThrow()
      })
    })

    describe('cbrt', () => {
      it('should calculate cube root', () => {
        const result = mathUtils.cbrt(27)
        expect(result).toBe(3)
      })

      it('should calculate cube root of negative number', () => {
        const result = mathUtils.cbrt(-27)
        expect(result).toBe(-3)
      })
    })
  })

  describe('Rounding and Precision', () => {
    describe('round', () => {
      it('should round number', () => {
        const result = mathUtils.round(3.7)
        expect(result).toBe(4)
      })

      it('should round down', () => {
        const result = mathUtils.round(3.2)
        expect(result).toBe(3)
      })

      it('should round half up', () => {
        const result = mathUtils.round(3.5)
        expect(result).toBe(4)
      })
    })

    describe('floor', () => {
      it('should floor number', () => {
        const result = mathUtils.floor(3.7)
        expect(result).toBe(3)
      })

      it('should floor negative number', () => {
        const result = mathUtils.floor(-3.7)
        expect(result).toBe(-4)
      })
    })

    describe('ceil', () => {
      it('should ceil number', () => {
        const result = mathUtils.ceil(3.2)
        expect(result).toBe(4)
      })

      it('should ceil negative number', () => {
        const result = mathUtils.ceil(-3.2)
        expect(result).toBe(-3)
      })
    })

    describe('truncate', () => {
      it('should truncate number', () => {
        const result = mathUtils.truncate(3.7)
        expect(result).toBe(3)
      })

      it('should truncate negative number', () => {
        const result = mathUtils.truncate(-3.7)
        expect(result).toBe(-3)
      })
    })

    describe('toFixed', () => {
      it('should fix decimal places', () => {
        const result = mathUtils.toFixed(3.14159, 2)
        expect(result).toBe('3.14')
      })

      it('should handle zero decimal places', () => {
        const result = mathUtils.toFixed(3.14159, 0)
        expect(result).toBe('3')
      })

      it('should handle rounding up', () => {
        const result = mathUtils.toFixed(3.149, 2)
        expect(result).toBe('3.15')
      })
    })

    describe('toPrecision', () => {
      it('should set precision', () => {
        const result = mathUtils.toPrecision(123.456, 3)
        expect(result).toBe('123')
      })

      it('should handle decimal precision', () => {
        const result = mathUtils.toPrecision(123.456, 5)
        expect(result).toBe('123.46')
      })
    })

    describe('clamp', () => {
      it('should clamp number within range', () => {
        const result = mathUtils.clamp(5, 1, 10)
        expect(result).toBe(5)
      })

      it('should clamp number above range', () => {
        const result = mathUtils.clamp(15, 1, 10)
        expect(result).toBe(10)
      })

      it('should clamp number below range', () => {
        const result = mathUtils.clamp(-5, 1, 10)
        expect(result).toBe(1)
      })
    })
  })

  describe('Number Properties', () => {
    describe('isInteger', () => {
      it('should return true for integer', () => {
        const result = mathUtils.isInteger(5)
        expect(result).toBe(true)
      })

      it('should return false for decimal', () => {
        const result = mathUtils.isInteger(5.5)
        expect(result).toBe(false)
      })

      it('should return true for negative integer', () => {
        const result = mathUtils.isInteger(-5)
        expect(result).toBe(true)
      })
    })

    describe('isFloat', () => {
      it('should return true for float', () => {
        const result = mathUtils.isFloat(5.5)
        expect(result).toBe(true)
      })

      it('should return false for integer', () => {
        const result = mathUtils.isFloat(5)
        expect(result).toBe(false)
      })
    })

    describe('isEven', () => {
      it('should return true for even number', () => {
        const result = mathUtils.isEven(4)
        expect(result).toBe(true)
      })

      it('should return false for odd number', () => {
        const result = mathUtils.isEven(5)
        expect(result).toBe(false)
      })

      it('should return true for zero', () => {
        const result = mathUtils.isEven(0)
        expect(result).toBe(true)
      })
    })

    describe('isOdd', () => {
      it('should return true for odd number', () => {
        const result = mathUtils.isOdd(5)
        expect(result).toBe(true)
      })

      it('should return false for even number', () => {
        const result = mathUtils.isOdd(4)
        expect(result).toBe(false)
      })

      it('should return false for zero', () => {
        const result = mathUtils.isOdd(0)
        expect(result).toBe(false)
      })
    })

    describe('isPositive', () => {
      it('should return true for positive number', () => {
        const result = mathUtils.isPositive(5)
        expect(result).toBe(true)
      })

      it('should return false for negative number', () => {
        const result = mathUtils.isPositive(-5)
        expect(result).toBe(false)
      })

      it('should return false for zero', () => {
        const result = mathUtils.isPositive(0)
        expect(result).toBe(false)
      })
    })

    describe('isNegative', () => {
      it('should return true for negative number', () => {
        const result = mathUtils.isNegative(-5)
        expect(result).toBe(true)
      })

      it('should return false for positive number', () => {
        const result = mathUtils.isNegative(5)
        expect(result).toBe(false)
      })

      it('should return false for zero', () => {
        const result = mathUtils.isNegative(0)
        expect(result).toBe(false)
      })
    })

    describe('isZero', () => {
      it('should return true for zero', () => {
        const result = mathUtils.isZero(0)
        expect(result).toBe(true)
      })

      it('should return false for non-zero', () => {
        const result = mathUtils.isZero(5)
        expect(result).toBe(false)
      })
    })

    describe('isNaN', () => {
      it('should return true for NaN', () => {
        const result = mathUtils.isNaN(NaN)
        expect(result).toBe(true)
      })

      it('should return false for number', () => {
        const result = mathUtils.isNaN(5)
        expect(result).toBe(false)
      })
    })

    describe('isFinite', () => {
      it('should return true for finite number', () => {
        const result = mathUtils.isFinite(5)
        expect(result).toBe(true)
      })

      it('should return false for Infinity', () => {
        const result = mathUtils.isFinite(Infinity)
        expect(result).toBe(false)
      })

      it('should return false for NaN', () => {
        const result = mathUtils.isFinite(NaN)
        expect(result).toBe(false)
      })
    })

    describe('isPrime', () => {
      it('should return true for prime number', () => {
        const result = mathUtils.isPrime(7)
        expect(result).toBe(true)
      })

      it('should return false for non-prime number', () => {
        const result = mathUtils.isPrime(8)
        expect(result).toBe(false)
      })

      it('should return false for numbers less than 2', () => {
        const result = mathUtils.isPrime(1)
        expect(result).toBe(false)
      })
    })
  })

  describe('Number Conversion', () => {
    describe('toRadians', () => {
      it('should convert degrees to radians', () => {
        const result = mathUtils.toRadians(180)
        expect(result).toBeCloseTo(Math.PI, 5)
      })

      it('should convert 90 degrees to radians', () => {
        const result = mathUtils.toRadians(90)
        expect(result).toBeCloseTo(Math.PI / 2, 5)
      })
    })

    describe('toDegrees', () => {
      it('should convert radians to degrees', () => {
        const result = mathUtils.toDegrees(Math.PI)
        expect(result).toBeCloseTo(180, 5)
      })

      it('should convert PI/2 radians to degrees', () => {
        const result = mathUtils.toDegrees(Math.PI / 2)
        expect(result).toBeCloseTo(90, 5)
      })
    })

    describe('toBinary', () => {
      it('should convert decimal to binary', () => {
        const result = mathUtils.toBinary(10)
        expect(result).toBe('1010')
      })

      it('should convert zero to binary', () => {
        const result = mathUtils.toBinary(0)
        expect(result).toBe('0')
      })
    })

    describe('fromBinary', () => {
      it('should convert binary to decimal', () => {
        const result = mathUtils.fromBinary('1010')
        expect(result).toBe(10)
      })

      it('should convert zero binary to decimal', () => {
        const result = mathUtils.fromBinary('0')
        expect(result).toBe(0)
      })
    })

    describe('toHex', () => {
      it('should convert decimal to hex', () => {
        const result = mathUtils.toHex(255)
        expect(result).toBe('ff')
      })

      it('should convert zero to hex', () => {
        const result = mathUtils.toHex(0)
        expect(result).toBe('0')
      })
    })

    describe('fromHex', () => {
      it('should convert hex to decimal', () => {
        const result = mathUtils.fromHex('ff')
        expect(result).toBe(255)
      })

      it('should convert zero hex to decimal', () => {
        const result = mathUtils.fromHex('0')
        expect(result).toBe(0)
      })
    })

    describe('toOctal', () => {
      it('should convert decimal to octal', () => {
        const result = mathUtils.toOctal(8)
        expect(result).toBe('10')
      })
    })

    describe('fromOctal', () => {
      it('should convert octal to decimal', () => {
        const result = mathUtils.fromOctal('10')
        expect(result).toBe(8)
      })
    })
  })

  describe('Advanced Mathematics', () => {
    describe('factorial', () => {
      it('should calculate factorial', () => {
        const result = mathUtils.factorial(5)
        expect(result).toBe(120)
      })

      it('should calculate factorial of zero', () => {
        const result = mathUtils.factorial(0)
        expect(result).toBe(1)
      })

      it('should calculate factorial of one', () => {
        const result = mathUtils.factorial(1)
        expect(result).toBe(1)
      })

      it('should handle negative number', () => {
        expect(() => mathUtils.factorial(-1)).toThrow()
      })
    })

    describe('fibonacci', () => {
      it('should calculate fibonacci number', () => {
        const result = mathUtils.fibonacci(10)
        expect(result).toBe(55)
      })

      it('should calculate fibonacci of zero', () => {
        const result = mathUtils.fibonacci(0)
        expect(result).toBe(0)
      })

      it('should calculate fibonacci of one', () => {
        const result = mathUtils.fibonacci(1)
        expect(result).toBe(1)
      })
    })

    describe('gcd', () => {
      it('should calculate greatest common divisor', () => {
        const result = mathUtils.gcd(48, 18)
        expect(result).toBe(6)
      })

      it('should calculate gcd with zero', () => {
        const result = mathUtils.gcd(5, 0)
        expect(result).toBe(5)
      })
    })

    describe('lcm', () => {
      it('should calculate least common multiple', () => {
        const result = mathUtils.lcm(12, 18)
        expect(result).toBe(36)
      })

      it('should calculate lcm with zero', () => {
        const result = mathUtils.lcm(5, 0)
        expect(result).toBe(0)
      })
    })

    describe('log', () => {
      it('should calculate natural logarithm', () => {
        const result = mathUtils.log(Math.E)
        expect(result).toBeCloseTo(1, 5)
      })

      it('should handle negative number', () => {
        expect(() => mathUtils.log(-1)).toThrow()
      })
    })

    describe('log10', () => {
      it('should calculate base-10 logarithm', () => {
        const result = mathUtils.log10(100)
        expect(result).toBeCloseTo(2, 5)
      })
    })

    describe('log2', () => {
      it('should calculate base-2 logarithm', () => {
        const result = mathUtils.log2(8)
        expect(result).toBeCloseTo(3, 5)
      })
    })

    describe('sin', () => {
      it('should calculate sine', () => {
        const result = mathUtils.sin(Math.PI / 2)
        expect(result).toBeCloseTo(1, 5)
      })
    })

    describe('cos', () => {
      it('should calculate cosine', () => {
        const result = mathUtils.cos(0)
        expect(result).toBeCloseTo(1, 5)
      })
    })

    describe('tan', () => {
      it('should calculate tangent', () => {
        const result = mathUtils.tan(Math.PI / 4)
        expect(result).toBeCloseTo(1, 5)
      })
    })

    describe('asin', () => {
      it('should calculate arcsine', () => {
        const result = mathUtils.asin(1)
        expect(result).toBeCloseTo(Math.PI / 2, 5)
      })
    })

    describe('acos', () => {
      it('should calculate arccosine', () => {
        const result = mathUtils.acos(1)
        expect(result).toBeCloseTo(0, 5)
      })
    })

    describe('atan', () => {
      it('should calculate arctangent', () => {
        const result = mathUtils.atan(1)
        expect(result).toBeCloseTo(Math.PI / 4, 5)
      })
    })
  })

  describe('Statistics', () => {
    describe('sum', () => {
      it('should calculate sum of array', () => {
        const result = mathUtils.sum([1, 2, 3, 4, 5])
        expect(result).toBe(15)
      })

      it('should handle empty array', () => {
        const result = mathUtils.sum([])
        expect(result).toBe(0)
      })
    })

    describe('average', () => {
      it('should calculate average of array', () => {
        const result = mathUtils.average([1, 2, 3, 4, 5])
        expect(result).toBe(3)
      })

      it('should handle empty array', () => {
        const result = mathUtils.average([])
        expect(result).toBe(0)
      })
    })

    describe('median', () => {
      it('should calculate median of odd-length array', () => {
        const result = mathUtils.median([1, 2, 3, 4, 5])
        expect(result).toBe(3)
      })

      it('should calculate median of even-length array', () => {
        const result = mathUtils.median([1, 2, 3, 4])
        expect(result).toBe(2.5)
      })
    })

    describe('mode', () => {
      it('should calculate mode of array', () => {
        const result = mathUtils.mode([1, 2, 2, 3, 4])
        expect(result).toBe(2)
      })

      it('should handle multiple modes', () => {
        const result = mathUtils.mode([1, 2, 2, 3, 3, 4])
        expect(result).toEqual([2, 3])
      })
    })

    describe('min', () => {
      it('should find minimum value in array', () => {
        const result = mathUtils.min([1, 2, 3, 4, 5])
        expect(result).toBe(1)
      })

      it('should handle empty array', () => {
        const result = mathUtils.min([])
        expect(result).toBe(Infinity)
      })
    })

    describe('max', () => {
      it('should find maximum value in array', () => {
        const result = mathUtils.max([1, 2, 3, 4, 5])
        expect(result).toBe(5)
      })

      it('should handle empty array', () => {
        const result = mathUtils.max([])
        expect(result).toBe(-Infinity)
      })
    })

    describe('range', () => {
      it('should calculate range of array', () => {
        const result = mathUtils.range([1, 2, 3, 4, 5])
        expect(result).toBe(4)
      })
    })

    describe('variance', () => {
      it('should calculate variance of array', () => {
        const result = mathUtils.variance([1, 2, 3, 4, 5])
        expect(result).toBe(2)
      })
    })

    describe('stdDev', () => {
      it('should calculate standard deviation of array', () => {
        const result = mathUtils.stdDev([1, 2, 3, 4, 5])
        expect(result).toBeCloseTo(Math.sqrt(2), 5)
      })
    })
  })

  describe('Random Numbers', () => {
    describe('random', () => {
      it('should generate random number between 0 and 1', () => {
        const result = mathUtils.random()
        expect(result).toBeGreaterThanOrEqual(0)
        expect(result).toBeLessThan(1)
      })
    })

    describe('randomInt', () => {
      it('should generate random integer in range', () => {
        const result = mathUtils.randomInt(1, 10)
        expect(result).toBeGreaterThanOrEqual(1)
        expect(result).toBeLessThanOrEqual(10)
        expect(Number.isInteger(result)).toBe(true)
      })

      it('should generate random integer with single argument', () => {
        const result = mathUtils.randomInt(10)
        expect(result).toBeGreaterThanOrEqual(0)
        expect(result).toBeLessThan(10)
      })
    })

    describe('randomFloat', () => {
      it('should generate random float in range', () => {
        const result = mathUtils.randomFloat(1.5, 5.5)
        expect(result).toBeGreaterThanOrEqual(1.5)
        expect(result).toBeLessThan(5.5)
      })
    })

    describe('randomBool', () => {
      it('should generate random boolean', () => {
        const result = mathUtils.randomBool()
        expect(typeof result).toBe('boolean')
      })
    })

    describe('randomElement', () => {
      it('should select random element from array', () => {
        const array = [1, 2, 3, 4, 5]
        const result = mathUtils.randomElement(array)
        expect(array).toContain(result)
      })

      it('should handle empty array', () => {
        const result = mathUtils.randomElement([])
        expect(result).toBeUndefined()
      })
    })

    describe('shuffle', () => {
      it('should shuffle array', () => {
        const array = [1, 2, 3, 4, 5]
        const result = mathUtils.shuffle(array)
        expect(result).toHaveLength(5)
        expect(result).toEqual(expect.arrayContaining(array))
      })
    })
  })

  describe('Utility Functions', () => {
    describe('abs', () => {
      it('should return absolute value', () => {
        const result = mathUtils.abs(-5)
        expect(result).toBe(5)
      })

      it('should return positive number unchanged', () => {
        const result = mathUtils.abs(5)
        expect(result).toBe(5)
      })
    })

    describe('sign', () => {
      it('should return sign of positive number', () => {
        const result = mathUtils.sign(5)
        expect(result).toBe(1)
      })

      it('should return sign of negative number', () => {
        const result = mathUtils.sign(-5)
        expect(result).toBe(-1)
      })

      it('should return sign of zero', () => {
        const result = mathUtils.sign(0)
        expect(result).toBe(0)
      })
    })

    describe('percent', () => {
      it('should calculate percentage', () => {
        const result = mathUtils.percent(25, 100)
        expect(result).toBe(25)
      })

      it('should calculate percentage with decimal', () => {
        const result = mathUtils.percent(33.33, 100)
        expect(result).toBeCloseTo(33.33, 2)
      })
    })

    describe('percentChange', () => {
      it('should calculate percentage change', () => {
        const result = mathUtils.percentChange(150, 100)
        expect(result).toBe(50)
      })

      it('should calculate negative percentage change', () => {
        const result = mathUtils.percentChange(50, 100)
        expect(result).toBe(-50)
      })
    })

    describe('interpolate', () => {
      it('should interpolate between two values', () => {
        const result = mathUtils.interpolate(0, 100, 0.5)
        expect(result).toBe(50)
      })

      it('should interpolate at start', () => {
        const result = mathUtils.interpolate(0, 100, 0)
        expect(result).toBe(0)
      })

      it('should interpolate at end', () => {
        const result = mathUtils.interpolate(0, 100, 1)
        expect(result).toBe(100)
      })
    })

    describe('normalize', () => {
      it('should normalize value to range', () => {
        const result = mathUtils.normalize(50, 0, 100)
        expect(result).toBe(0.5)
      })

      it('should normalize value outside range', () => {
        const result = mathUtils.normalize(150, 0, 100)
        expect(result).toBe(1.5)
      })
    })

    describe('map', () => {
      it('should map value from one range to another', () => {
        const result = mathUtils.map(50, 0, 100, 0, 10)
        expect(result).toBe(5)
      })

      it('should map value with different ranges', () => {
        const result = mathUtils.map(5, 0, 10, 0, 100)
        expect(result).toBe(50)
      })
    })
  })
})