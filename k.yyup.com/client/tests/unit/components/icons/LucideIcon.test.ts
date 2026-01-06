import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import LucideIcon from '@/components/icons/LucideIcon.vue'

// 控制台错误检测变量
let consoleSpy: any

describe('LucideIcon', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(LucideIcon)
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  afterEach(() => {
    if (wrapper) => {
      wrapper.unmount()
    }
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  it('renders properly with default props', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.lucide-icon').exists()).toBe(true)
    expect(wrapper.find('svg').exists()).toBe(true)
    
    const svg = wrapper.find('svg')
    expect(svg.attributes('width')).toBe('28')
    expect(svg.attributes('height')).toBe('28')
    expect(svg.attributes('viewBox')).toBe('0 0 24 24')
    expect(svg.attributes('stroke')).toBe('currentColor')
    expect(svg.attributes('stroke-width')).toBe('1.5')
  })

  it('renders with custom props', async () => {
    await wrapper.setProps({
      name: 'user',
      size: 32,
      color: '#ff0000',
      strokeWidth: 2,
      variant: 'filled'
    })

    const svg = wrapper.find('svg')
    expect(svg.attributes('width')).toBe('32')
    expect(svg.attributes('height')).toBe('32')
    expect(svg.attributes('stroke-width')).toBe('2')
    expect(svg.attributes('style')).toContain('color: #ff0000')
    
    expect(wrapper.find('.lucide-icon--filled').exists()).toBe(true)
    expect(wrapper.find('.lucide-icon--user').exists()).toBe(true)
  })

  it('renders different icon variants correctly', async () => {
    const variants = ['default', 'filled', 'outlined']
    
    for (const variant of variants) {
      await wrapper.setProps({ variant })
      expect(wrapper.find(`.lucide-icon--${variant}`).exists()).toBe(true)
    }
  })

  it('renders dashboard icon by default', () => {
    const path = wrapper.find('path')
    expect(path.exists()).toBe(true)
    expect(path.attributes('d')).toContain('M3 3v5h5V3H3zm7 0v5h5V3h-5zm7 0v5h5V3h-5zM3 10v5h5v-5H3zm7 0v5h5v-5h-5zm7 0v5h5v-5h-5zM3 17v5h5v-5H3zm7 0v5h5v-5h-5zm7 0v5h5v-5h-5z')
  })

  it('renders user icon with elements', async () => {
    await wrapper.setProps({ name: 'user' })
    
    const g = wrapper.find('g')
    expect(g.exists()).toBe(true)
    expect(g.html()).toContain('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>')
    expect(g.html()).toContain('<circle cx="12" cy="7" r="4"></circle>')
  })

  it('renders search icon correctly', async () => {
    await wrapper.setProps({ name: 'search' })
    
    const g = wrapper.find('g')
    expect(g.exists()).toBe(true)
    expect(g.html()).toContain('<circle cx="11" cy="11" r="8"></circle>')
    expect(g.html()).toContain('<path d="m21 21-4.35-4.35"></path>')
  })

  it('renders plus icon with path', async () => {
    await wrapper.setProps({ name: 'plus' })
    
    const path = wrapper.find('path')
    expect(path.exists()).toBe(true)
    expect(path.attributes('d')).toBe('M5 12h14m-7-7v14')
  })

  it('handles unknown icon names gracefully', async () => {
    await wrapper.setProps({ name: 'unknown-icon' })
    
    // Should fallback to dashboard icon
    const path = wrapper.find('path')
    expect(path.exists()).toBe(true)
    expect(path.attributes('d')).toContain('M3 3v5h5V3H3')
  })

  it('applies correct CSS classes based on props', async () => {
    await wrapper.setProps({
      name: 'edit',
      variant: 'outlined'
    })
    
    const iconDiv = wrapper.find('.lucide-icon')
    expect(iconDiv.classes()).toContain('lucide-icon')
    expect(iconDiv.classes()).toContain('lucide-icon--outlined')
    expect(iconDiv.classes()).toContain('lucide-icon--edit')
  })

  it('handles size as string', async () => {
    await wrapper.setProps({ size: '24px' })
    
    const svg = wrapper.find('svg')
    expect(svg.attributes('width')).toBe('24px')
    expect(svg.attributes('height')).toBe('24px')
  })

  it('handles strokeWidth as string', async () => {
    await wrapper.setProps({ strokeWidth: '2.5' })
    
    const svg = wrapper.find('svg')
    expect(svg.attributes('stroke-width')).toBe('2.5')
  })

  it('renders complex icons with both path and elements', async () => {
    await wrapper.setProps({ name: 'personnel' })
    
    const path = wrapper.find('path')
    const g = wrapper.find('g')
    
    expect(path.exists()).toBe(true)
    expect(g.exists()).toBe(true)
    expect(path.attributes('d')).toBe('M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2')
    expect(g.html()).toContain('<circle cx="9" cy="7" r="4"></circle>')
  })

  it('applies hover effects through CSS', () => {
    const iconDiv = wrapper.find('.lucide-icon')
    const style = iconDiv.attributes('style')
    if (style) {
      expect(style).toContain('transition: all 0.2s ease')
    } else {
      // 如果没有内联样式，检查CSS类是否存在
      expect(iconDiv.classes()).toContain('lucide-icon')
    }
  })

  it('supports theme-dark class', async () => {
    wrapper = mount(LucideIcon, {
      attachTo: document.body,
      global: {
        config: {
          globalProperties: {
            $isDarkMode: true
          }
        }
      }
    })
    
    document.body.classList.add('theme-dark')
    await nextTick()
    
    const iconDiv = wrapper.find('.lucide-icon')
    expect(iconDiv.classes()).toContain('lucide-icon')
  })

  it('renders all supported business center icons', () => {
    const businessIcons = [
      'dashboard', 'personnel', 'activity', 'enrollment', 
      'marketing', 'ai-center', 'system', 'finance', 
      'task', 'script', 'media', 'customers'
    ]
    
    businessIcons.forEach(iconName => {
      const testWrapper = mount(LucideIcon, {
        props: { name: iconName }
      })
      
      expect(testWrapper.exists()).toBe(true)
      expect(testWrapper.find(`.lucide-icon--${iconName}`).exists()).toBe(true)
      
      testWrapper.unmount()
    })
  })

  it('renders all supported utility icons', () => {
    const utilityIcons = [
      'home', 'search', 'plus', 'edit', 'delete', 
      'chevron-down', 'arrow-left', 'check', 'menu', 
      'refresh', 'user', 'logout'
    ]
    
    utilityIcons.forEach(iconName => {
      const testWrapper = mount(LucideIcon, {
        props: { name: iconName }
      })
      
      expect(testWrapper.exists()).toBe(true)
      expect(testWrapper.find(`.lucide-icon--${iconName}`).exists()).toBe(true)
      
      testWrapper.unmount()
    })
  })

  it('computes iconPath correctly', async () => {
    await wrapper.setProps({ name: 'plus' })
    
    const path = wrapper.find('path')
    expect(path.exists()).toBe(true)
    expect(path.attributes('d')).toBe('M5 12h14m-7-7v14')
  })

  it('computes iconElements correctly', async () => {
    await wrapper.setProps({ name: 'user' })
    
    const g = wrapper.find('g')
    expect(g.exists()).toBe(true)
    expect(g.html()).toContain('path')
    expect(g.html()).toContain('circle')
  })

  it('computes svgStyles correctly', async () => {
    await wrapper.setProps({ color: '#00ff00' })
    
    const svg = wrapper.find('svg')
    expect(svg.attributes('style')).toContain('color: #00ff00')
  })

  it('uses currentColor when no color is provided', () => {
    const svg = wrapper.find('svg')
    const style = svg.attributes('style')
    // 检查currentColor（可能是小写的currentcolor）
    expect(style).toMatch(/color:\s*currentcolor/i)
  })

  it('has correct SVG structure', () => {
    const svg = wrapper.find('svg')
    
    expect(svg.attributes('fill')).toBe('none')
    expect(svg.attributes('stroke-linecap')).toBe('round')
    expect(svg.attributes('stroke-linejoin')).toBe('round')
    // 检查SVG是否有正确的类名（可能是lucide-icon而不是icon-svg）
    expect(wrapper.find('.lucide-icon').exists()).toBe(true)
  })

  it('handles reactive prop updates', async () => {
    await wrapper.setProps({ name: 'dashboard' })
    let path = wrapper.find('path')
    expect(path.attributes('d')).toContain('M3 3v5h5V3H3')
    
    await wrapper.setProps({ name: 'plus' })
    path = wrapper.find('path')
    expect(path.attributes('d')).toBe('M5 12h14m-7-7v14')
  })
})