import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';
import { vi } from 'vitest'
import * as themeUtils from '../../../src/utils/theme-utils'

// Mock localStorage
const mockLocalStorage = {
  length: 0,
  clear: vi.fn(),
  getItem: vi.fn(),
  key: vi.fn(),
  removeItem: vi.fn(),
  setItem: vi.fn()
}

// Mock document
const mockDocument = {
  documentElement: {
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
      contains: vi.fn(),
      toggle: vi.fn()
    },
    style: {
      setProperty: vi.fn(),
      removeProperty: vi.fn(),
      getPropertyValue: vi.fn()
    }
  },
  body: {
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
      contains: vi.fn(),
      toggle: vi.fn()
    },
    style: {
      setProperty: vi.fn(),
      removeProperty: vi.fn(),
      getPropertyValue: vi.fn()
    }
  }
}

// Mock window
const mockWindow = {
  matchMedia: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn()
}

// 控制台错误检测变量
let consoleSpy: any

describe('Theme Utils', () => {
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
    vi.stubGlobal('localStorage', mockLocalStorage)
    vi.stubGlobal('document', mockDocument)
    vi.stubGlobal('window', mockWindow)
    
    // Reset all mock functions
    Object.values(mockLocalStorage).forEach(value => {
      if (typeof value === 'function') => {
        value.mockReset()
      }
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    Object.values(mockDocument.documentElement.classList).forEach(value => {
      if (typeof value === 'function') {
        value.mockReset()
      }
    })
    
    Object.values(mockDocument.documentElement.style).forEach(value => {
      if (typeof value === 'function') {
        value.mockReset()
      }
    })
    
    Object.values(mockWindow).forEach(value => {
      if (typeof value === 'function') {
        value.mockReset()
      }
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('Theme Management', () => {
    describe('setTheme', () => {
      it('should set theme to light', () => {
        themeUtils.setTheme('light')
        
        expect(mockDocument.documentElement.classList.remove).toHaveBeenCalledWith('dark')
        expect(mockDocument.documentElement.classList.add).toHaveBeenCalledWith('light')
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'light')
      })

      it('should set theme to dark', () => {
        themeUtils.setTheme('dark')
        
        expect(mockDocument.documentElement.classList.remove).toHaveBeenCalledWith('light')
        expect(mockDocument.documentElement.classList.add).toHaveBeenCalledWith('dark')
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark')
      })

      it('should set theme to system', () => {
        themeUtils.setTheme('system')
        
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'system')
      })

      it('should handle invalid theme', () => {
        themeUtils.setTheme('invalid')
        
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'light')
      })
    })

    describe('getTheme', () => {
      it('should get theme from localStorage', () => {
        mockLocalStorage.getItem.mockReturnValue('dark')
        
        const result = themeUtils.getTheme()
        
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('theme')
        expect(result).toBe('dark')
      })

      it('should return light theme if not set', () => {
        mockLocalStorage.getItem.mockReturnValue(null)
        
        const result = themeUtils.getTheme()
        
        expect(result).toBe('light')
      })

      it('should return system theme if set', () => {
        mockLocalStorage.getItem.mockReturnValue('system')
        
        const result = themeUtils.getTheme()
        
        expect(result).toBe('system')
      })
    })

    describe('getCurrentTheme', () => {
      it('should return current applied theme', () => {
        mockDocument.documentElement.classList.contains.mockImplementation((className) => {
          return className === 'dark'
        })
        
        const result = themeUtils.getCurrentTheme()
        
        expect(result).toBe('dark')
      })

      it('should return light if no theme class found', () => {
        mockDocument.documentElement.classList.contains.mockReturnValue(false)
        
        const result = themeUtils.getCurrentTheme()
        
        expect(result).toBe('light')
      })
    })

    describe('toggleTheme', () => {
      it('should toggle between light and dark', () => {
        mockDocument.documentElement.classList.contains.mockReturnValue(true)
        
        themeUtils.toggleTheme()
        
        expect(mockDocument.documentElement.classList.toggle).toHaveBeenCalledWith('dark')
        expect(mockDocument.documentElement.classList.toggle).toHaveBeenCalledWith('light')
      })
    })

    describe('removeTheme', () => {
      it('should remove theme from localStorage and DOM', () => {
        themeUtils.removeTheme()
        
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('theme')
        expect(mockDocument.documentElement.classList.remove).toHaveBeenCalledWith('light')
        expect(mockDocument.documentElement.classList.remove).toHaveBeenCalledWith('dark')
      })
    })

    describe('hasTheme', () => {
      it('should return true if theme is set', () => {
        mockLocalStorage.getItem.mockReturnValue('dark')
        
        const result = themeUtils.hasTheme()
        
        expect(result).toBe(true)
      })

      it('should return false if theme is not set', () => {
        mockLocalStorage.getItem.mockReturnValue(null)
        
        const result = themeUtils.hasTheme()
        
        expect(result).toBe(false)
      })
    })

    describe('isDarkTheme', () => {
      it('should return true if dark theme is active', () => {
        mockDocument.documentElement.classList.contains.mockReturnValue(true)
        
        const result = themeUtils.isDarkTheme()
        
        expect(result).toBe(true)
      })

      it('should return false if dark theme is not active', () => {
        mockDocument.documentElement.classList.contains.mockReturnValue(false)
        
        const result = themeUtils.isDarkTheme()
        
        expect(result).toBe(false)
      })
    })

    describe('isLightTheme', () => {
      it('should return true if light theme is active', () => {
        mockDocument.documentElement.classList.contains.mockReturnValue(true)
        
        const result = themeUtils.isLightTheme()
        
        expect(result).toBe(true)
      })

      it('should return false if light theme is not active', () => {
        mockDocument.documentElement.classList.contains.mockReturnValue(false)
        
        const result = themeUtils.isLightTheme()
        
        expect(result).toBe(false)
      })
    })
  })

  describe('System Theme Detection', () => {
    describe('getSystemTheme', () => {
      it('should return dark if system prefers dark', () => {
        const mockMediaQuery = {
          matches: true
        }
        
        mockWindow.matchMedia.mockReturnValue(mockMediaQuery)
        
        const result = themeUtils.getSystemTheme()
        
        expect(mockWindow.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)')
        expect(result).toBe('dark')
      })

      it('should return light if system prefers light', () => {
        const mockMediaQuery = {
          matches: false
        }
        
        mockWindow.matchMedia.mockReturnValue(mockMediaQuery)
        
        const result = themeUtils.getSystemTheme()
        
        expect(result).toBe('light')
      })
    })

    describe('listenToSystemThemeChanges', () => {
      it('should add listener for system theme changes', () => {
        const mockMediaQuery = {
          matches: true,
          addEventListener: vi.fn()
        }
        
        mockWindow.matchMedia.mockReturnValue(mockMediaQuery)
        
        const callback = vi.fn()
        themeUtils.listenToSystemThemeChanges(callback)
        
        expect(mockMediaQuery.addEventListener).toHaveBeenCalledWith('change', callback)
      })
    })

    describe('stopListeningToSystemThemeChanges', () => {
      it('should remove listener for system theme changes', () => {
        const mockMediaQuery = {
          matches: true,
          removeEventListener: vi.fn()
        }
        
        mockWindow.matchMedia.mockReturnValue(mockMediaQuery)
        
        const callback = vi.fn()
        themeUtils.stopListeningToSystemThemeChanges(callback)
        
        expect(mockMediaQuery.removeEventListener).toHaveBeenCalledWith('change', callback)
      })
    })

    describe('applySystemTheme', () => {
      it('should apply system theme', () => {
        const mockMediaQuery = {
          matches: true
        }
        
        mockWindow.matchMedia.mockReturnValue(mockMediaQuery)
        
        themeUtils.applySystemTheme()
        
        expect(mockDocument.documentElement.classList.remove).toHaveBeenCalledWith('light')
        expect(mockDocument.documentElement.classList.add).toHaveBeenCalledWith('dark')
      })
    })
  })

  describe('Color Scheme', () => {
    describe('setColorScheme', () => {
      it('should set color scheme', () => {
        themeUtils.setColorScheme('dark')
        
        expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledWith('color-scheme', 'dark')
      })

      it('should set color scheme with important flag', () => {
        themeUtils.setColorScheme('light', true)
        
        expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledWith('color-scheme', 'light', 'important')
      })
    })

    describe('getColorScheme', () => {
      it('should get color scheme', () => {
        mockDocument.documentElement.style.getPropertyValue.mockReturnValue('dark')
        
        const result = themeUtils.getColorScheme()
        
        expect(mockDocument.documentElement.style.getPropertyValue).toHaveBeenCalledWith('color-scheme')
        expect(result).toBe('dark')
      })

      it('should return empty string if color scheme not set', () => {
        mockDocument.documentElement.style.getPropertyValue.mockReturnValue('')
        
        const result = themeUtils.getColorScheme()
        
        expect(result).toBe('')
      })
    })

    describe('removeColorScheme', () => {
      it('should remove color scheme', () => {
        themeUtils.removeColorScheme()
        
        expect(mockDocument.documentElement.style.removeProperty).toHaveBeenCalledWith('color-scheme')
      })
    })
  })

  describe('CSS Variables', () => {
    describe('setCssVariable', () => {
      it('should set CSS variable on root element', () => {
        themeUtils.setCssVariable('--primary-color', '#ff0000')
        
        expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledWith('--primary-color', '#ff0000')
      })

      it('should set CSS variable with important flag', () => {
        themeUtils.setCssVariable('--primary-color', '#ff0000', true)
        
        expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledWith('--primary-color', '#ff0000', 'important')
      })

      it('should set CSS variable on specific element', () => {
        const element = {
          style: {
            setProperty: vi.fn()
          }
        }
        
        themeUtils.setCssVariable('--primary-color', '#ff0000', false, element)
        
        expect(element.style.setProperty).toHaveBeenCalledWith('--primary-color', '#ff0000')
      })
    })

    describe('getCssVariable', () => {
      it('should get CSS variable from root element', () => {
        mockDocument.documentElement.style.getPropertyValue.mockReturnValue('#ff0000')
        
        const result = themeUtils.getCssVariable('--primary-color')
        
        expect(mockDocument.documentElement.style.getPropertyValue).toHaveBeenCalledWith('--primary-color')
        expect(result).toBe('#ff0000')
      })

      it('should get CSS variable from specific element', () => {
        const element = {
          style: {
            getPropertyValue: vi.fn().mockReturnValue('#ff0000')
          }
        }
        
        const result = themeUtils.getCssVariable('--primary-color', element)
        
        expect(element.style.getPropertyValue).toHaveBeenCalledWith('--primary-color')
        expect(result).toBe('#ff0000')
      })

      it('should return empty string if variable not found', () => {
        mockDocument.documentElement.style.getPropertyValue.mockReturnValue('')
        
        const result = themeUtils.getCssVariable('--non-existent')
        
        expect(result).toBe('')
      })
    })

    describe('removeCssVariable', () => {
      it('should remove CSS variable from root element', () => {
        themeUtils.removeCssVariable('--primary-color')
        
        expect(mockDocument.documentElement.style.removeProperty).toHaveBeenCalledWith('--primary-color')
      })

      it('should remove CSS variable from specific element', () => {
        const element = {
          style: {
            removeProperty: vi.fn()
          }
        }
        
        themeUtils.removeCssVariable('--primary-color', element)
        
        expect(element.style.removeProperty).toHaveBeenCalledWith('--primary-color')
      })
    })

    describe('setThemeVariables', () => {
      it('should set multiple theme variables', () => {
        const variables = {
          '--primary-color': '#ff0000',
          '--secondary-color': '#00ff00',
          '--background-color': '#ffffff'
        }
        
        themeUtils.setThemeVariables(variables)
        
        expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledWith('--primary-color', '#ff0000')
        expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledWith('--secondary-color', '#00ff00')
        expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledWith('--background-color', '#ffffff')
      })

      it('should set theme variables on specific element', () => {
        const element = {
          style: {
            setProperty: vi.fn()
          }
        }
        
        const variables = { '--primary-color': '#ff0000' }
        
        themeUtils.setThemeVariables(variables, element)
        
        expect(element.style.setProperty).toHaveBeenCalledWith('--primary-color', '#ff0000')
      })
    })

    describe('getThemeVariables', () => {
      it('should get all theme variables', () => {
        mockDocument.documentElement.style.getPropertyValue.mockImplementation((property) => {
          const variables: Record<string, string> = {
            '--primary-color': '#ff0000',
            '--secondary-color': '#00ff00'
          }
          return variables[property] || ''
        })
        
        const result = themeUtils.getThemeVariables(['--primary-color', '--secondary-color'])
        
        expect(result).toEqual({
          '--primary-color': '#ff0000',
          '--secondary-color': '#00ff00'
        })
      })

      it('should handle non-existent variables', () => {
        mockDocument.documentElement.style.getPropertyValue.mockReturnValue('')
        
        const result = themeUtils.getThemeVariables(['--non-existent'])
        
        expect(result).toEqual({ '--non-existent': '' })
      })
    })
  })

  describe('Theme Presets', () => {
    describe('applyThemePreset', () => {
      it('should apply theme preset', () => {
        const preset = {
          '--primary-color': '#ff0000',
          '--secondary-color': '#00ff00',
          '--background-color': '#ffffff'
        }
        
        themeUtils.applyThemePreset(preset)
        
        expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledWith('--primary-color', '#ff0000')
        expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledWith('--secondary-color', '#00ff00')
        expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledWith('--background-color', '#ffffff')
      })
    })

    describe('getThemePreset', () => {
      it('should get current theme preset', () => {
        mockDocument.documentElement.style.getPropertyValue.mockImplementation((property) => {
          const variables: Record<string, string> = {
            '--primary-color': '#ff0000',
            '--secondary-color': '#00ff00'
          }
          return variables[property] || ''
        })
        
        const result = themeUtils.getThemePreset(['--primary-color', '--secondary-color'])
        
        expect(result).toEqual({
          '--primary-color': '#ff0000',
          '--secondary-color': '#00ff00'
        })
      })
    })

    describe('saveThemePreset', () => {
      it('should save theme preset to localStorage', () => {
        const preset = {
          '--primary-color': '#ff0000',
          '--secondary-color': '#00ff00'
        }
        
        themeUtils.saveThemePreset('my-preset', preset)
        
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme-preset-my-preset', JSON.stringify(preset))
      })
    })

    describe('loadThemePreset', () => {
      it('should load theme preset from localStorage', () => {
        const preset = {
          '--primary-color': '#ff0000',
          '--secondary-color': '#00ff00'
        }
        
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(preset))
        
        const result = themeUtils.loadThemePreset('my-preset')
        
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('theme-preset-my-preset')
        expect(result).toEqual(preset)
      })

      it('should return null if preset not found', () => {
        mockLocalStorage.getItem.mockReturnValue(null)
        
        const result = themeUtils.loadThemePreset('non-existent')
        
        expect(result).toBeNull()
      })
    })

    describe('deleteThemePreset', () => {
      it('should delete theme preset from localStorage', () => {
        themeUtils.deleteThemePreset('my-preset')
        
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('theme-preset-my-preset')
      })
    })

    describe('getSavedThemePresets', () => {
      it('should get all saved theme presets', () => {
        mockLocalStorage.length = 2
        mockLocalStorage.key.mockImplementation((index) => {
          return index === 0 ? 'theme-preset-preset1' : 'theme-preset-preset2'
        })
        
        const preset1 = { '--primary-color': '#ff0000' }
        const preset2 = { '--secondary-color': '#00ff00' }
        
        mockLocalStorage.getItem.mockImplementation((key) => {
          if (key === 'theme-preset-preset1') return JSON.stringify(preset1)
          if (key === 'theme-preset-preset2') return JSON.stringify(preset2)
          return null
        })
        
        const result = themeUtils.getSavedThemePresets()
        
        expect(result).toEqual({
          'preset1': preset1,
          'preset2': preset2
        })
      })
    })
  })

  describe('Theme Utilities', () => {
    describe('generateColorPalette', () => {
      it('should generate color palette from base color', () => {
        const result = themeUtils.generateColorPalette('#ff0000')
        
        expect(result).toHaveProperty('50')
        expect(result).toHaveProperty('100')
        expect(result).toHaveProperty('200')
        expect(result).toHaveProperty('300')
        expect(result).toHaveProperty('400')
        expect(result).toHaveProperty('500')
        expect(result).toHaveProperty('600')
        expect(result).toHaveProperty('700')
        expect(result).toHaveProperty('800')
        expect(result).toHaveProperty('900')
      })
    })

    describe('getColorContrast', () => {
      it('should calculate color contrast ratio', () => {
        const result = themeUtils.getColorContrast('#ffffff', '#000000')
        
        expect(result).toBeGreaterThan(1)
        expect(result).toBeLessThan(21)
      })
    })

    describe('isColorDark', () => {
      it('should return true for dark colors', () => {
        const result = themeUtils.isColorDark('#000000')
        
        expect(result).toBe(true)
      })

      it('should return false for light colors', () => {
        const result = themeUtils.isColorDark('#ffffff')
        
        expect(result).toBe(false)
      })
    })

    describe('getReadableColor', () => {
      it('should return readable text color for background', () => {
        const result = themeUtils.getReadableColor('#000000')
        
        expect(result).toMatch(/^#[0-9a-f]{6}$/i)
      })
    })

    describe('adjustColorBrightness', () => {
      it('should adjust color brightness', () => {
        const result = themeUtils.adjustColorBrightness('#ff0000', 20)
        
        expect(result).toMatch(/^#[0-9a-f]{6}$/i)
      })

      it('should darken color with negative amount', () => {
        const result = themeUtils.adjustColorBrightness('#ff0000', -20)
        
        expect(result).toMatch(/^#[0-9a-f]{6}$/i)
      })
    })

    describe('mixColors', () => {
      it('should mix two colors', () => {
        const result = themeUtils.mixColors('#ff0000', '#0000ff', 0.5)
        
        expect(result).toMatch(/^#[0-9a-f]{6}$/i)
      })
    })

    describe('hexToRgb', () => {
      it('should convert hex to RGB', () => {
        const result = themeUtils.hexToRgb('#ff0000')
        
        expect(result).toEqual({ r: 255, g: 0, b: 0 })
      })

      it('should handle short hex format', () => {
        const result = themeUtils.hexToRgb('#f00')
        
        expect(result).toEqual({ r: 255, g: 0, b: 0 })
      })
    })

    describe('rgbToHex', () => {
      it('should convert RGB to hex', () => {
        const result = themeUtils.rgbToHex(255, 0, 0)
        
        expect(result).toBe('#ff0000')
      })
    })

    describe('isValidColor', () => {
      it('should return true for valid hex color', () => {
        const result = themeUtils.isValidColor('#ff0000')
        
        expect(result).toBe(true)
      })

      it('should return true for valid RGB color', () => {
        const result = themeUtils.isValidColor('rgb(255, 0, 0)')
        
        expect(result).toBe(true)
      })

      it('should return false for invalid color', () => {
        const result = themeUtils.isValidColor('invalid')
        
        expect(result).toBe(false)
      })
    })
  })

  describe('Theme Events', () => {
    describe('onThemeChange', () => {
      it('should add theme change listener', () => {
        const callback = vi.fn()
        
        themeUtils.onThemeChange(callback)
        
        expect(mockWindow.addEventListener).toHaveBeenCalledWith('storage', expect.any(Function))
      })
    })

    describe('offThemeChange', () => {
      it('should remove theme change listener', () => {
        const callback = vi.fn()
        
        themeUtils.offThemeChange(callback)
        
        expect(mockWindow.removeEventListener).toHaveBeenCalledWith('storage', expect.any(Function))
      })
    })

    describe('emitThemeChange', () => {
      it('should emit theme change event', () => {
        const event = new Event('theme-change')
        
        themeUtils.emitThemeChange(event)
        
        expect(mockWindow.dispatchEvent).toHaveBeenCalledWith(event)
      })
    })
  })
})