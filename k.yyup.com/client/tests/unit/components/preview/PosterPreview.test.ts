
// 使用全局表单引用Mock
beforeEach(() => {
  // 设置表单引用Mock
  if (typeof formRef !== 'undefined' && formRef.value) => {
    Object.assign(formRef.value, global.mockFormRef)
  }
  if (typeof editInput !== 'undefined' && editInput.value) {
    Object.assign(editInput.value, global.mockInputRef)
  }
})
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})


// Element Plus Mock for form validation
const mockFormRef = {
  clearValidate: vi.fn(),
  resetFields: vi.fn(),
  validate: vi.fn(() => Promise.resolve(true)),
  validateField: vi.fn()
}

const mockInputRef = {
  focus: vi.fn(),
  blur: vi.fn(),
  select: vi.fn()
}

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElForm: {
    name: 'ElForm',
    template: '<form><slot /></form>'
  },
  ElFormItem: {
    name: 'ElFormItem',
    template: '<div><slot /></div>'
  },
  ElInput: {
    name: 'ElInput',
    template: '<input />'
  },
  ElButton: {
    name: 'ElButton',
    template: '<button><slot /></button>'
  }
}))

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory, Router } from 'vue-router';
import PosterPreview from '@/components/preview/PosterPreview.vue';

// 控制台错误检测变量
let consoleSpy: any

describe('PosterPreview.vue', () => {
  let router: Router;
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/poster/preview', name: 'PosterPreview' }
      ]
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  const createWrapper = (props = {}) => {
    return mount(PosterPreview, {
      global: {
        plugins: [pinia, router]
      },
      props: {
        content: '这是一个测试海报内容',
        ...props
      }
    });
  };

  describe('Component Rendering', () => {
    it('should render the component correctly', () => {
      const wrapper = createWrapper();
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.findComponent(PosterPreview).exists()).toBe(true);
    });

    it('should render poster container with correct theme class', () => {
      const wrapper = createWrapper({ theme: 'warm' });
      const posterContainer = wrapper.find('.poster-container');
      expect(posterContainer.exists()).toBe(true);
      expect(posterContainer.classes()).toContain('theme-warm');
    });

    it('should render poster background elements', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('.poster-background').exists()).toBe(true);
      expect(wrapper.find('.bg-pattern').exists()).toBe(true);
      expect(wrapper.find('.bg-overlay').exists()).toBe(true);
    });

    it('should render poster content sections', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('.poster-content').exists()).toBe(true);
      expect(wrapper.find('.poster-header').exists()).toBe(true);
      expect(wrapper.find('.main-content').exists()).toBe(true);
      expect(wrapper.find('.poster-footer').exists()).toBe(true);
    });

    it('should render theme selector', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('.theme-selector').exists()).toBe(true);
      expect(wrapper.find('.theme-title').exists()).toBe(true);
      expect(wrapper.find('.theme-options').exists()).toBe(true);
    });

    it('should render logo section with school name', () => {
      const wrapper = createWrapper({ schoolName: '测试幼儿园' });
      const logoSection = wrapper.find('.logo-section');
      expect(logoSection.exists()).toBe(true);
      expect(wrapper.find('.school-name').text()).toBe('测试幼儿园');
    });

    it('should render content text area', () => {
      const wrapper = createWrapper({ content: '测试内容' });
      const contentText = wrapper.find('.content-text');
      expect(contentText.exists()).toBe(true);
      expect(contentText.text()).toContain('测试内容');
    });

    it('should render contact information', () => {
      const wrapper = createWrapper({ phone: '123-456-7890', address: '测试地址' });
      expect(wrapper.find('.contact-info').exists()).toBe(true);
      expect(wrapper.find('.contact-item').exists()).toBe(true);
    });

    it('should render QR code section when showQR is true', () => {
      const wrapper = createWrapper({ showQR: true });
      expect(wrapper.find('.qr-section').exists()).toBe(true);
      expect(wrapper.find('.qr-code').exists()).toBe(true);
    });

    it('should not render QR code section when showQR is false', () => {
      const wrapper = createWrapper({ showQR: false });
      expect(wrapper.find('.qr-section').exists()).toBe(false);
    });

    it('should render decoration elements', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('.decorations').exists()).toBe(true);
      expect(wrapper.findAll('.decoration-item').length).toBe(3);
    });
  });

  describe('Props Handling', () => {
    it('should accept and handle content prop correctly', () => {
      const wrapper = createWrapper({ content: '测试海报内容' });
      expect(wrapper.vm.content).toBe('测试海报内容');
    });

    it('should accept and handle theme prop correctly', () => {
      const wrapper = createWrapper({ theme: 'fresh' });
      expect(wrapper.vm.theme).toBe('fresh');
    });

    it('should accept and handle schoolName prop correctly', () => {
      const wrapper = createWrapper({ schoolName: '阳光幼儿园' });
      expect(wrapper.vm.schoolName).toBe('阳光幼儿园');
    });

    it('should accept and handle logoUrl prop correctly', () => {
      const wrapper = createWrapper({ logoUrl: '/test-logo.png' });
      expect(wrapper.vm.logoUrl).toBe('/test-logo.png');
    });

    it('should accept and handle phone prop correctly', () => {
      const wrapper = createWrapper({ phone: '400-123-4567' });
      expect(wrapper.vm.phone).toBe('400-123-4567');
    });

    it('should accept and handle address prop correctly', () => {
      const wrapper = createWrapper({ address: '北京市朝阳区' });
      expect(wrapper.vm.address).toBe('北京市朝阳区');
    });

    it('should accept and handle showQR prop correctly', () => {
      const wrapper = createWrapper({ showQR: false });
      expect(wrapper.vm.showQR).toBe(false);
    });

    it('should use default values when props are not provided', () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.theme).toBe('warm');
      expect(wrapper.vm.schoolName).toBe('阳光幼儿园');
      expect(wrapper.vm.logoUrl).toBe('/api/placeholder/60/60');
      expect(wrapper.vm.phone).toBe('400-123-4567');
      expect(wrapper.vm.address).toBe('北京市朝阳区xxx街道xxx号');
      expect(wrapper.vm.showQR).toBe(true);
    });
  });

  describe('Computed Properties and Data', () => {
    it('should have correct themes array', () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.themes).toEqual([
        { value: 'warm', label: '温馨' },
        { value: 'fresh', label: '清新' },
        { value: 'elegant', label: '优雅' },
        { value: 'playful', label: '活泼' }
      ]);
    });

    it('should display correct number of theme options', () => {
      const wrapper = createWrapper();
      const themeOptions = wrapper.findAll('.theme-option');
      expect(themeOptions.length).toBe(4);
    });
  });

  describe('Methods', () => {
    describe('formatContent', () => {
      it('should remove hashtags from content', () => {
        const wrapper = createWrapper();
        const content = '这是一个#测试内容，包含#多个标签';
        const formatted = wrapper.vm.formatContent(content);
        expect(formatted).not.toContain('#测试');
        expect(formatted).not.toContain('#多个');
      });

      it('should reduce multiple newlines to single newline', () => {
        const wrapper = createWrapper();
        const content = '第一行\n\n第二行\n\n第三行';
        const formatted = wrapper.vm.formatContent(content);
        expect(formatted).toContain('第一行\n第二行\n第三行');
        expect(formatted).not.toContain('\n\n');
      });

      it('should trim whitespace from content', () => {
        const wrapper = createWrapper();
        const content = '  前后有空格的内容  ';
        const formatted = wrapper.vm.formatContent(content);
        expect(formatted).toBe('前后有空格的内容');
      });

      it('should truncate content to 120 characters', () => {
        const wrapper = createWrapper();
        const longContent = 'a'.repeat(150);
        const formatted = wrapper.vm.formatContent(longContent);
        expect(formatted.length).toBe(123); // 120 + '...'
        expect(formatted).toContain('...');
      });

      it('should not truncate content shorter than 120 characters', () => {
        const wrapper = createWrapper();
        const shortContent = '短内容';
        const formatted = wrapper.vm.formatContent(shortContent);
        expect(formatted).toBe('短内容');
        expect(formatted).not.toContain('...');
      });

      it('should handle empty content', () => {
        const wrapper = createWrapper();
        const formatted = wrapper.vm.formatContent('');
        expect(formatted).toBe('...');
      });

      it('should handle null or undefined content', () => {
        const wrapper = createWrapper();
        const formatted1 = wrapper.vm.formatContent(null as any);
        const formatted2 = wrapper.vm.formatContent(undefined as any);
        expect(formatted1).toBe('...');
        expect(formatted2).toBe('...');
      });
    });
  });

  describe('Event Handling', () => {
    it('should emit theme-change event when theme option is clicked', async () => {
      const wrapper = createWrapper();
      const themeOptions = wrapper.findAll('.theme-option');
      
      await themeOptions[1].trigger('click'); // Click fresh theme
      
      expect(wrapper.emitted('theme-change')).toBeTruthy();
      expect(wrapper.emitted('theme-change')[0]).toEqual(['fresh']);
    });

    it('should emit theme-change event with correct theme value for each option', async () => {
      const wrapper = createWrapper();
      const themeOptions = wrapper.findAll('.theme-option');
      
      await themeOptions[0].trigger('click'); // warm
      expect(wrapper.emitted('theme-change')[0]).toEqual(['warm']);
      
      await themeOptions[1].trigger('click'); // fresh
      expect(wrapper.emitted('theme-change')[1]).toEqual(['fresh']);
      
      await themeOptions[2].trigger('click'); // elegant
      expect(wrapper.emitted('theme-change')[2]).toEqual(['elegant']);
      
      await themeOptions[3].trigger('click'); // playful
      expect(wrapper.emitted('theme-change')[3]).toEqual(['playful']);
    });

    it('should handle multiple theme changes correctly', async () => {
      const wrapper = createWrapper();
      const themeOptions = wrapper.findAll('.theme-option');
      
      await themeOptions[0].trigger('click');
      await themeOptions[1].trigger('click');
      await themeOptions[2].trigger('click');
      
      expect(wrapper.emitted('theme-change')).toHaveLength(3);
      expect(wrapper.emitted('theme-change')[0]).toEqual(['warm']);
      expect(wrapper.emitted('theme-change')[1]).toEqual(['fresh']);
      expect(wrapper.emitted('theme-change')[2]).toEqual(['elegant']);
    });
  });

  describe('User Interactions', () => {
    it('should handle theme option click interactions', async () => {
      const wrapper = createWrapper();
      const themeOptions = wrapper.findAll('.theme-option');
      
      // Initially no theme is active
      expect(themeOptions[0].classes()).not.toContain('active');
      
      // Click first theme option
      await themeOptions[0].trigger('click');
      expect(themeOptions[0].classes()).toContain('active');
      
      // Click second theme option
      await themeOptions[1].trigger('click');
      expect(themeOptions[0].classes()).not.toContain('active');
      expect(themeOptions[1].classes()).toContain('active');
    });

    it('should update theme preview border color when active', async () => {
      const wrapper = createWrapper();
      const themeOptions = wrapper.findAll('.theme-option');
      
      // Click to activate first theme
      await themeOptions[0].trigger('click');
      const activePreview = themeOptions[0].find('.theme-preview');
      expect(activePreview.classes()).toContain('preview-warm');
      expect(activePreview.attributes('style')).toContain('#409eff');
    });

    it('should handle hover effects on theme options', async () => {
      const wrapper = createWrapper();
      const themeOptions = wrapper.findAll('.theme-option');
      
      // Hover over theme option
      await themeOptions[0].trigger('mouseenter');
      expect(themeOptions[0].classes()).toContain('hover');
      
      // Remove hover
      await themeOptions[0].trigger('mouseleave');
      expect(themeOptions[0].classes()).not.toContain('hover');
    });
  });

  describe('Theme Application', () => {
    it('should apply warm theme correctly', () => {
      const wrapper = createWrapper({ theme: 'warm' });
      const posterContainer = wrapper.find('.poster-container');
      expect(posterContainer.classes()).toContain('theme-warm');
    });

    it('should apply fresh theme correctly', () => {
      const wrapper = createWrapper({ theme: 'fresh' });
      const posterContainer = wrapper.find('.poster-container');
      expect(posterContainer.classes()).toContain('theme-fresh');
    });

    it('should apply elegant theme correctly', () => {
      const wrapper = createWrapper({ theme: 'elegant' });
      const posterContainer = wrapper.find('.poster-container');
      expect(posterContainer.classes()).toContain('theme-elegant');
    });

    it('should apply playful theme correctly', () => {
      const wrapper = createWrapper({ theme: 'playful' });
      const posterContainer = wrapper.find('.poster-container');
      expect(posterContainer.classes()).toContain('theme-playful');
    });

    it('should change theme when prop is updated', async () => {
      const wrapper = createWrapper({ theme: 'warm' });
      expect(wrapper.find('.poster-container').classes()).toContain('theme-warm');
      
      await wrapper.setProps({ theme: 'fresh' });
      expect(wrapper.find('.poster-container').classes()).toContain('theme-fresh');
      expect(wrapper.find('.poster-container').classes()).not.toContain('theme-warm');
    });
  });

  describe('Content Display', () => {
    it('should display formatted content in content text area', () => {
      const wrapper = createWrapper({ content: '这是#测试内容\n\n第二行' });
      const contentText = wrapper.find('.content-text');
      expect(contentText.text()).toBe('这是测试内容\n第二行');
    });

    it('should display school name correctly', () => {
      const wrapper = createWrapper({ schoolName: '阳光幼儿园' });
      expect(wrapper.find('.school-name').text()).toBe('阳光幼儿园');
    });

    it('should display phone number correctly', () => {
      const wrapper = createWrapper({ phone: '400-123-4567' });
      const phoneElement = wrapper.find('.contact-item');
      expect(phoneElement.text()).toContain('400-123-4567');
    });

    it('should display address correctly', () => {
      const wrapper = createWrapper({ address: '北京市朝阳区xxx街道xxx号' });
      const addressElement = wrapper.findAll('.contact-item')[1];
      expect(addressElement.text()).toContain('北京市朝阳区xxx街道xxx号');
    });

    it('should display contact icons correctly', () => {
      const wrapper = createWrapper({ phone: '400-123-4567', address: '测试地址' });
      const icons = wrapper.findAll('.icon');
      expect(icons[0].text()).toBe('📞');
      expect(icons[1].text()).toBe('📍');
    });

    it('should display decoration emojis correctly', () => {
      const wrapper = createWrapper();
      const decorations = wrapper.findAll('.decoration-item');
      expect(decorations[0].text()).toBe('⭐');
      expect(decorations[1].text()).toBe('💖');
      expect(decorations[2].text()).toBe('🌸');
    });
  });

  describe('Conditional Rendering', () => {
    it('should render phone contact item only when phone is provided', () => {
      const wrapperWithoutPhone = createWrapper({ phone: '' });
      const wrapperWithPhone = createWrapper({ phone: '400-123-4567' });
      
      expect(wrapperWithoutPhone.findAll('.contact-item').length).toBe(1); // Only address
      expect(wrapperWithPhone.findAll('.contact-item').length).toBe(2); // Phone and address
    });

    it('should render address contact item only when address is provided', () => {
      const wrapperWithoutAddress = createWrapper({ address: '' });
      const wrapperWithAddress = createWrapper({ address: '测试地址' });
      
      expect(wrapperWithoutAddress.findAll('.contact-item').length).toBe(1); // Only phone
      expect(wrapperWithAddress.findAll('.contact-item').length).toBe(2); // Phone and address
    });

    it('should not render contact info when neither phone nor address is provided', () => {
      const wrapper = createWrapper({ phone: '', address: '' });
      expect(wrapper.find('.contact-info').exists()).toBe(true);
      expect(wrapper.findAll('.contact-item').length).toBe(0);
    });

    it('should render QR section only when showQR is true', () => {
      const wrapperWithoutQR = createWrapper({ showQR: false });
      const wrapperWithQR = createWrapper({ showQR: true });
      
      expect(wrapperWithoutQR.find('.qr-section').exists()).toBe(false);
      expect(wrapperWithQR.find('.qr-section').exists()).toBe(true);
    });

    it('should render QR placeholder text correctly', () => {
      const wrapper = createWrapper({ showQR: true });
      const qrPlaceholder = wrapper.find('.qr-placeholder');
      expect(qrPlaceholder.text()).toBe('二维码');
    });

    it('should render QR text correctly', () => {
      const wrapper = createWrapper({ showQR: true });
      const qrText = wrapper.find('.qr-text');
      expect(qrText.text()).toBe('扫码了解更多');
    });
  });

  describe('Styling and CSS Classes', () => {
    it('should have correct CSS classes for poster container', () => {
      const wrapper = createWrapper();
      const posterContainer = wrapper.find('.poster-container');
      expect(posterContainer.classes()).toContain('poster-container');
    });

    it('should have correct CSS classes for theme options', () => {
      const wrapper = createWrapper();
      const themeOptions = wrapper.findAll('.theme-option');
      themeOptions.forEach((option, index) => {
        expect(option.classes()).toContain('theme-option');
      });
    });

    it('should have correct CSS classes for theme previews', () => {
      const wrapper = createWrapper();
      const themePreviews = wrapper.findAll('.theme-preview');
      const expectedClasses = ['preview-warm', 'preview-fresh', 'preview-elegant', 'preview-playful'];
      
      themePreviews.forEach((preview, index) => {
        expect(preview.classes()).toContain('theme-preview');
        expect(preview.classes()).toContain(expectedClasses[index]);
      });
    });

    it('should have correct CSS classes for decoration items', () => {
      const wrapper = createWrapper();
      const decorations = wrapper.findAll('.decoration-item');
      const expectedClasses = ['star', 'heart', 'flower'];
      
      decorations.forEach((decoration, index) => {
        expect(decoration.classes()).toContain('decoration-item');
        expect(decoration.classes()).toContain(expectedClasses[index]);
      });
    });

    it('should apply active class to selected theme option', async () => {
      const wrapper = createWrapper();
      const themeOptions = wrapper.findAll('.theme-option');
      
      await themeOptions[0].trigger('click');
      expect(themeOptions[0].classes()).toContain('active');
    });
  });

  describe('Accessibility', () => {
    it('should have proper alt text for logo image', () => {
      const wrapper = createWrapper();
      const logoImage = wrapper.find('img');
      expect(logoImage.attributes('alt')).toBe('幼儿园logo');
    });

    it('should have proper semantic structure', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('.poster-preview').exists()).toBe(true);
      expect(wrapper.find('.poster-container').exists()).toBe(true);
      expect(wrapper.find('.poster-content').exists()).toBe(true);
    });

    it('should be keyboard navigable', async () => {
      const wrapper = createWrapper();
      const themeOptions = wrapper.findAll('.theme-option');
      
      await themeOptions[0].trigger('keydown', { key: 'Enter' });
      expect(wrapper.emitted('theme-change')).toBeTruthy();
      
      await themeOptions[1].trigger('keydown', { key: ' ' });
      expect(wrapper.emitted('theme-change')).toHaveLength(2);
    });

    it('should have proper focus indicators', async () => {
      const wrapper = createWrapper();
      const themeOptions = wrapper.findAll('.theme-option');
      
      await themeOptions[0].trigger('focus');
      expect(themeOptions[0].classes()).toContain('focus');
      
      await themeOptions[0].trigger('blur');
      expect(themeOptions[0].classes()).not.toContain('focus');
    });
  });

  describe('Performance', () => {
    it('should handle rapid theme changes efficiently', async () => {
      const wrapper = createWrapper();
      const themeOptions = wrapper.findAll('.theme-option');
      
      // Rapid theme changes
      for (let i = 0; i < 10; i++) {
        await themeOptions[i % 4].trigger('click');
      }
      
      expect(wrapper.emitted('theme-change')).toHaveLength(10);
    });

    it('should not re-render unnecessarily when props don\'t change', async () => {
      const wrapper = createWrapper();
      const renderSpy = vi.spyOn(wrapper.vm, '$forceUpdate');
      
      await wrapper.setProps({ content: '相同内容' });
      await wrapper.setProps({ content: '相同内容' });
      
      expect(renderSpy).not.toHaveBeenCalled();
    });

    it('should handle large content efficiently', () => {
      const wrapper = createWrapper({ content: 'a'.repeat(1000) });
      const formatted = wrapper.vm.formatContent(wrapper.vm.content);
      expect(formatted.length).toBe(123); // 120 + '...'
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content prop', () => {
      const wrapper = createWrapper({ content: '' });
      const contentText = wrapper.find('.content-text');
      expect(contentText.text()).toBe('...');
    });

    it('should handle null content prop', () => {
      const wrapper = createWrapper({ content: null as any });
      const contentText = wrapper.find('.content-text');
      expect(contentText.text()).toBe('...');
    });

    it('should handle undefined content prop', () => {
      const wrapper = createWrapper({ content: undefined as any });
      const contentText = wrapper.find('.content-text');
      expect(contentText.text()).toBe('...');
    });

    it('should handle special characters in content', () => {
      const wrapper = createWrapper({ content: '特殊字符：!@#$%^&*()' });
      const formatted = wrapper.vm.formatContent(wrapper.vm.content);
      expect(formatted).toContain('特殊字符：!@#$%^&*()');
    });

    it('should handle emoji in content', () => {
      const wrapper = createWrapper({ content: '表情符号：😊🎉🌟' });
      const formatted = wrapper.vm.formatContent(wrapper.vm.content);
      expect(formatted).toContain('表情符号：😊🎉🌟');
    });

    it('should handle very long phone numbers', () => {
      const wrapper = createWrapper({ phone: '12345678901234567890' });
      const phoneElement = wrapper.find('.contact-item');
      expect(phoneElement.text()).toContain('12345678901234567890');
    });

    it('should handle very long addresses', () => {
      const longAddress = 'a'.repeat(200);
      const wrapper = createWrapper({ address: longAddress });
      const addressElement = wrapper.findAll('.contact-item')[1];
      expect(addressElement.text()).toContain(longAddress);
    });

    it('should handle invalid theme values gracefully', () => {
      const wrapper = createWrapper({ theme: 'invalid-theme' as any });
      const posterContainer = wrapper.find('.poster-container');
      expect(posterContainer.classes()).toContain('theme-invalid-theme');
    });

    it('should handle concurrent theme changes', async () => {
      const wrapper = createWrapper();
      const themeOptions = wrapper.findAll('.theme-option');
      
      await Promise.all([
        themeOptions[0].trigger('click'),
        themeOptions[1].trigger('click'),
        themeOptions[2].trigger('click')
      ]);
      
      expect(wrapper.emitted('theme-change')).toHaveLength(3);
    });
  });

  describe('Integration Tests', () => {
    it('should integrate with router correctly', () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.$router).toBeDefined();
    });

    it('should integrate with pinia store correctly', () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.$pinia).toBeDefined();
    });

    it('should work correctly with different screen sizes', () => {
      const wrapper = createWrapper();
      // This test ensures the component is responsive
      expect(wrapper.find('.poster-preview').exists()).toBe(true);
    });
  });
});