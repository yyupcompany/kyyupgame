import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory, Router } from 'vue-router';
import WeChatMomentsPreview from '@/components/preview/WeChatMomentsPreview.vue';

// 控制台错误检测变量
let consoleSpy: any

describe('WeChatMomentsPreview.vue', () => {
  let router: Router;
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/wechat/moments-preview', name: 'WeChatMomentsPreview' }
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
    return mount(WeChatMomentsPreview, {
      global: {
        plugins: [pinia, router]
      },
      props: {
        content: '这是一个测试朋友圈内容',
        ...props
      }
    });
  };

  describe('Component Rendering', () => {
    it('should render the component correctly', () => {
      const wrapper = createWrapper();
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.findComponent(WeChatMomentsPreview).exists()).toBe(true);
    });

    it('should render moments header with status bar', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('.moments-header').exists()).toBe(true);
      expect(wrapper.find('.status-bar').exists()).toBe(true);
      expect(wrapper.find('.time').exists()).toBe(true);
      expect(wrapper.find('.status-icons').exists()).toBe(true);
    });

    it('should render navigation bar', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('.nav-bar').exists()).toBe(true);
      expect(wrapper.find('.nav-left').exists()).toBe(true);
      expect(wrapper.find('.nav-title').exists()).toBe(true);
      expect(wrapper.find('.nav-right').exists()).toBe(true);
    });

    it('should render moments content', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('.moments-content').exists()).toBe(true);
      expect(wrapper.find('.cover-section').exists()).toBe(true);
      expect(wrapper.find('.post-item').exists()).toBe(true);
    });

    it('should render cover section with image', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('.cover-image').exists()).toBe(true);
      expect(wrapper.find('.cover-image img').exists()).toBe(true);
    });

    it('should render user info section', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('.user-info').exists()).toBe(true);
      expect(wrapper.find('.avatar').exists()).toBe(true);
      expect(wrapper.find('.username').exists()).toBe(true);
    });

    it('should render post header with avatar and info', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('.post-header').exists()).toBe(true);
      expect(wrapper.find('.post-avatar').exists()).toBe(true);
      expect(wrapper.find('.post-info').exists()).toBe(true);
    });

    it('should render post content with text', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('.text-content').exists()).toBe(true);
      expect(wrapper.find('.text-content').text()).toBe('这是一个测试朋友圈内容');
    });

    it('should render post meta information', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('.post-meta').exists()).toBe(true);
      expect(wrapper.find('.post-time').exists()).toBe(true);
      expect(wrapper.find('.post-actions').exists()).toBe(true);
    });

    it('should render action buttons', () => {
      const wrapper = createWrapper();
      const actionButtons = wrapper.findAll('.action-btn');
      expect(actionButtons.length).toBe(2);
      expect(actionButtons[0].text()).toBe('👍');
      expect(actionButtons[1].text()).toBe('💬');
    });
  });

  describe('Props Handling', () => {
    it('should accept and handle content prop correctly', () => {
      const wrapper = createWrapper({ content: '测试朋友圈内容' });
      expect(wrapper.vm.content).toBe('测试朋友圈内容');
    });

    it('should accept and handle userName prop correctly', () => {
      const wrapper = createWrapper({ userName: '测试用户' });
      expect(wrapper.vm.userName).toBe('测试用户');
    });

    it('should accept and handle userAvatar prop correctly', () => {
      const wrapper = createWrapper({ userAvatar: '/test-avatar.png' });
      expect(wrapper.vm.userAvatar).toBe('/test-avatar.png');
    });

    it('should accept and handle images prop correctly', () => {
      const testImages = ['/image1.jpg', '/image2.jpg', '/image3.jpg'];
      const wrapper = createWrapper({ images: testImages });
      expect(wrapper.vm.images).toEqual(testImages);
    });

    it('should accept and handle postTime prop correctly', () => {
      const testTime = new Date('2024-01-01T12:00:00Z');
      const wrapper = createWrapper({ postTime: testTime });
      expect(wrapper.vm.postTime).toEqual(testTime);
    });

    it('should use default values when props are not provided', () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.userName).toBe('阳光幼儿园');
      expect(wrapper.vm.userAvatar).toBe('/api/placeholder/40/40');
      expect(wrapper.vm.images).toEqual([]);
      expect(wrapper.vm.postTime).toBeInstanceOf(Date);
    });

    it('should use default empty array for images prop', () => {
      const wrapper = createWrapper({ images: undefined });
      expect(wrapper.vm.images).toEqual([]);
    });
  });

  describe('Image Display', () => {
    it('should not render post images when images array is empty', () => {
      const wrapper = createWrapper({ images: [] });
      expect(wrapper.find('.post-images').exists()).toBe(false);
    });

    it('should render post images when images array is not empty', () => {
      const testImages = ['/image1.jpg', '/image2.jpg'];
      const wrapper = createWrapper({ images: testImages });
      expect(wrapper.find('.post-images').exists()).toBe(true);
    });

    it('should render correct number of image items', () => {
      const testImages = ['/image1.jpg', '/image2.jpg', '/image3.jpg'];
      const wrapper = createWrapper({ images: testImages });
      const imageItems = wrapper.findAll('.image-item');
      expect(imageItems.length).toBe(3);
    });

    it('should apply correct grid class for different image counts', () => {
      const testCases = [
        { images: ['/image1.jpg'], expectedClass: 'grid-1' },
        { images: ['/image1.jpg', '/image2.jpg'], expectedClass: 'grid-2' },
        { images: ['/image1.jpg', '/image2.jpg', '/image3.jpg'], expectedClass: 'grid-3' },
        { images: Array(4).fill('/image.jpg'), expectedClass: 'grid-4' },
        { images: Array(5).fill('/image.jpg'), expectedClass: 'grid-3' },
        { images: Array(9).fill('/image.jpg'), expectedClass: 'grid-3' },
        { images: Array(10).fill('/image.jpg'), expectedClass: 'grid-9' }
      ];

      testCases.forEach(({ images, expectedClass }) => {
        const wrapper = createWrapper({ images });
        const postImages = wrapper.find('.post-images');
        if (images.length > 0) {
          expect(postImages.classes()).toContain(expectedClass);
        }
      });
    });

    it('should display correct alt text for images', () => {
      const testImages = ['/image1.jpg', '/image2.jpg', '/image3.jpg'];
      const wrapper = createWrapper({ images: testImages });
      const imageItems = wrapper.findAll('.image-item img');
      
      imageItems.forEach((img, index) => {
        expect(img.attributes('alt')).toBe(`图片${index + 1}`);
      });
    });
  });

  describe('Methods', () => {
    describe('formatTime', () => {
      it('should return "刚刚" for time less than 1 minute ago', () => {
        const wrapper = createWrapper();
        const now = new Date();
        const testTime = new Date(now.getTime() - 30000); // 30 seconds ago
        
        const result = wrapper.vm.formatTime(testTime);
        expect(result).toBe('刚刚');
      });

      it('should return "X分钟前" for time less than 1 hour ago', () => {
        const wrapper = createWrapper();
        const now = new Date();
        const testTime = new Date(now.getTime() - 30 * 60 * 1000); // 30 minutes ago
        
        const result = wrapper.vm.formatTime(testTime);
        expect(result).toBe('30分钟前');
      });

      it('should return "X小时前" for time less than 1 day ago', () => {
        const wrapper = createWrapper();
        const now = new Date();
        const testTime = new Date(now.getTime() - 3 * 60 * 60 * 1000); // 3 hours ago
        
        const result = wrapper.vm.formatTime(testTime);
        expect(result).toBe('3小时前');
      });

      it('should return formatted date for time older than 1 day', () => {
        const wrapper = createWrapper();
        const testTime = new Date('2024-01-01T12:00:00Z');
        
        const result = wrapper.vm.formatTime(testTime);
        expect(result).toBe(testTime.toLocaleDateString());
      });

      it('should handle edge case for exactly 1 minute', () => {
        const wrapper = createWrapper();
        const now = new Date();
        const testTime = new Date(now.getTime() - 60 * 1000); // exactly 1 minute ago
        
        const result = wrapper.vm.formatTime(testTime);
        expect(result).toBe('1分钟前');
      });

      it('should handle edge case for exactly 1 hour', () => {
        const wrapper = createWrapper();
        const now = new Date();
        const testTime = new Date(now.getTime() - 60 * 60 * 1000); // exactly 1 hour ago
        
        const result = wrapper.vm.formatTime(testTime);
        expect(result).toBe('1小时前');
      });

      it('should handle edge case for exactly 1 day', () => {
        const wrapper = createWrapper();
        const now = new Date();
        const testTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // exactly 1 day ago
        
        const result = wrapper.vm.formatTime(testTime);
        expect(result).toBe(testTime.toLocaleDateString());
      });
    });
  });

  describe('User Interface Display', () => {
    it('should display correct username in user info section', () => {
      const wrapper = createWrapper({ userName: '测试幼儿园' });
      expect(wrapper.find('.username').text()).toBe('测试幼儿园');
    });

    it('should display correct username in post header', () => {
      const wrapper = createWrapper({ userName: '测试幼儿园' });
      expect(wrapper.find('.post-username').text()).toBe('测试幼儿园');
    });

    it('should display correct content text', () => {
      const wrapper = createWrapper({ content: '这是朋友圈内容测试' });
      expect(wrapper.find('.text-content').text()).toBe('这是朋友圈内容测试');
    });

    it('should display formatted time in post meta', () => {
      const testTime = new Date('2024-01-01T12:00:00Z');
      const wrapper = createWrapper({ postTime: testTime });
      const formattedTime = wrapper.vm.formatTime(testTime);
      expect(wrapper.find('.post-time').text()).toBe(formattedTime);
    });

    it('should display correct time in status bar', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('.time').text()).toBe('9:41');
    });

    it('should display correct status icons', () => {
      const wrapper = createWrapper();
      const statusIcons = wrapper.find('.status-icons');
      expect(statusIcons.text()).toContain('●●●●');
      expect(statusIcons.text()).toContain('📶');
      expect(statusIcons.text()).toContain('🔋');
    });

    it('should display correct navigation title', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('.nav-title').text()).toBe('朋友圈');
    });

    it('should display correct navigation buttons', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('.back-btn').text()).toBe('‹');
      expect(wrapper.find('.camera-btn').text()).toBe('📷');
    });
  });

  describe('Image Handling', () => {
    it('should display cover image with correct src', () => {
      const wrapper = createWrapper();
      const coverImage = wrapper.find('.cover-image img');
      expect(coverImage.attributes('src')).toBe('/api/placeholder/375/200');
    });

    it('should display user avatar with correct src', () => {
      const wrapper = createWrapper({ userAvatar: '/test-avatar.png' });
      const userAvatars = wrapper.findAll('img[alt="头像"]');
      expect(userAvatars.length).toBe(2); // Cover section and post header
      userAvatars.forEach(avatar => {
        expect(avatar.attributes('src')).toBe('/test-avatar.png');
      });
    });

    it('should display post images with correct src', () => {
      const testImages = ['/image1.jpg', '/image2.jpg'];
      const wrapper = createWrapper({ images: testImages });
      const postImages = wrapper.findAll('.image-item img');
      
      postImages.forEach((img, index) => {
        expect(img.attributes('src')).toBe(testImages[index]);
      });
    });

    it('should handle empty image array gracefully', () => {
      const wrapper = createWrapper({ images: [] });
      expect(wrapper.find('.post-images').exists()).toBe(false);
    });

    it('should handle null or undefined images prop gracefully', () => {
      const wrapper1 = createWrapper({ images: null as any });
      const wrapper2 = createWrapper({ images: undefined });
      
      expect(wrapper1.find('.post-images').exists()).toBe(false);
      expect(wrapper2.find('.post-images').exists()).toBe(false);
    });

    it('should limit image display to maximum 9 images', () => {
      const testImages = Array(12).fill('/image.jpg').map((_, i) => `/image${i}.jpg`);
      const wrapper = createWrapper({ images: testImages });
      const imageItems = wrapper.findAll('.image-item');
      expect(imageItems.length).toBe(9);
    });
  });

  describe('Styling and CSS Classes', () => {
    it('should have correct CSS classes for main container', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('.wechat-moments-preview').exists()).toBe(true);
    });

    it('should have correct CSS classes for header sections', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('.moments-header').exists()).toBe(true);
      expect(wrapper.find('.status-bar').exists()).toBe(true);
      expect(wrapper.find('.nav-bar').exists()).toBe(true);
    });

    it('should have correct CSS classes for content sections', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('.moments-content').exists()).toBe(true);
      expect(wrapper.find('.cover-section').exists()).toBe(true);
      expect(wrapper.find('.post-item').exists()).toBe(true);
    });

    it('should have correct CSS classes for post sections', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('.post-header').exists()).toBe(true);
      expect(wrapper.find('.post-avatar').exists()).toBe(true);
      expect(wrapper.find('.post-info').exists()).toBe(true);
    });

    it('should have correct CSS classes for user interface elements', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('.user-info').exists()).toBe(true);
      expect(wrapper.find('.avatar').exists()).toBe(true);
      expect(wrapper.find('.username').exists()).toBe(true);
    });

    it('should have correct CSS classes for action elements', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('.post-meta').exists()).toBe(true);
      expect(wrapper.find('.post-actions').exists()).toBe(true);
      expect(wrapper.find('.action-btn').exists()).toBe(true);
    });
  });

  describe('Layout and Structure', () => {
    it('should have correct dimensions for main container', () => {
      const wrapper = createWrapper();
      const container = wrapper.find('.wechat-moments-preview');
      expect(container.attributes('style')).toContain('width: 375px');
      expect(container.attributes('style')).toContain('height: 667px');
    });

    it('should have correct content height calculation', () => {
      const wrapper = createWrapper();
      const content = wrapper.find('.moments-content');
      expect(content.attributes('style')).toContain('height: calc(100% - 88px)');
    });

    it('should have correct cover section dimensions', () => {
      const wrapper = createWrapper();
      const coverSection = wrapper.find('.cover-section');
      expect(coverSection.attributes('style')).toContain('height: 200px');
    });

    it('should have correct avatar dimensions in cover section', () => {
      const wrapper = createWrapper();
      const coverAvatar = wrapper.find('.user-info .avatar');
      expect(coverAvatar.attributes('style')).toContain('width: 60px');
      expect(coverAvatar.attributes('style')).toContain('height: 60px');
    });

    it('should have correct avatar dimensions in post header', () => {
      const wrapper = createWrapper();
      const postAvatar = wrapper.find('.post-avatar');
      expect(postAvatar.attributes('style')).toContain('width: 40px');
      expect(postAvatar.attributes('style')).toContain('height: 40px');
    });
  });

  describe('Accessibility', () => {
    it('should have proper alt text for all images', () => {
      const testImages = ['/image1.jpg', '/image2.jpg'];
      const wrapper = createWrapper({ images: testImages });
      const images = wrapper.findAll('img');
      
      images.forEach(img => {
        expect(img.attributes('alt')).toBeDefined();
        expect(img.attributes('alt')).not.toBe('');
      });
    });

    it('should have proper alt text for cover image', () => {
      const wrapper = createWrapper();
      const coverImage = wrapper.find('.cover-image img');
      expect(coverImage.attributes('alt')).toBe('封面');
    });

    it('should have proper alt text for avatar images', () => {
      const wrapper = createWrapper();
      const avatarImages = wrapper.findAll('img[alt="头像"]');
      expect(avatarImages.length).toBe(2);
    });

    it('should have proper semantic structure', () => {
      const wrapper = createWrapper();
      expect(wrapper.find('.wechat-moments-preview').exists()).toBe(true);
      expect(wrapper.find('.moments-header').exists()).toBe(true);
      expect(wrapper.find('.moments-content').exists()).toBe(true);
    });

    it('should be keyboard navigable', async () => {
      const wrapper = createWrapper();
      const actionButtons = wrapper.findAll('.action-btn');
      
      await actionButtons[0].trigger('keydown', { key: 'Enter' });
      expect(actionButtons[0].exists()).toBe(true);
      
      await actionButtons[1].trigger('keydown', { key: ' ' });
      expect(actionButtons[1].exists()).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should handle large number of images efficiently', () => {
      const testImages = Array(100).fill('/image.jpg').map((_, i) => `/image${i}.jpg`);
      const wrapper = createWrapper({ images: testImages });
      const imageItems = wrapper.findAll('.image-item');
      expect(imageItems.length).toBe(9); // Limited to 9 images
    });

    it('should handle long content text efficiently', () => {
      const longContent = 'a'.repeat(1000);
      const wrapper = createWrapper({ content: longContent });
      expect(wrapper.find('.text-content').text()).toBe(longContent);
    });

    it('should not re-render unnecessarily when props don\'t change', async () => {
      const wrapper = createWrapper();
      const renderSpy = vi.spyOn(wrapper.vm, '$forceUpdate');
      
      await wrapper.setProps({ content: '相同内容' });
      await wrapper.setProps({ content: '相同内容' });
      
      expect(renderSpy).not.toHaveBeenCalled();
    });

    it('should handle rapid prop changes efficiently', async () => {
      const wrapper = createWrapper();
      
      for (let i = 0; i < 10; i++) {
        await wrapper.setProps({ content: `内容${i}` });
      }
      
      expect(wrapper.find('.text-content').text()).toBe('内容9');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content prop', () => {
      const wrapper = createWrapper({ content: '' });
      expect(wrapper.find('.text-content').text()).toBe('');
    });

    it('should handle null content prop', () => {
      const wrapper = createWrapper({ content: null as any });
      expect(wrapper.find('.text-content').text()).toBe('');
    });

    it('should handle undefined content prop', () => {
      const wrapper = createWrapper({ content: undefined as any });
      expect(wrapper.find('.text-content').text()).toBe('');
    });

    it('should handle special characters in content', () => {
      const wrapper = createWrapper({ content: '特殊字符：!@#$%^&*()' });
      expect(wrapper.find('.text-content').text()).toBe('特殊字符：!@#$%^&*()');
    });

    it('should handle emoji in content', () => {
      const wrapper = createWrapper({ content: '表情符号：😊🎉🌟' });
      expect(wrapper.find('.text-content').text()).toBe('表情符号：😊🎉🌟');
    });

    it('should handle newlines in content', () => {
      const wrapper = createWrapper({ content: '第一行\n第二行\n第三行' });
      const textContent = wrapper.find('.text-content');
      expect(textContent.attributes('style')).toContain('white-space: pre-line');
    });

    it('should handle very long username', () => {
      const longUsername = 'a'.repeat(100);
      const wrapper = createWrapper({ userName: longUsername });
      expect(wrapper.find('.username').text()).toBe(longUsername);
    });

    it('should handle invalid image URLs', () => {
      const invalidImages = ['invalid-url', '://invalid', ''];
      const wrapper = createWrapper({ images: invalidImages });
      const imageItems = wrapper.findAll('.image-item img');
      
      imageItems.forEach((img, index) => {
        expect(img.attributes('src')).toBe(invalidImages[index]);
      });
    });

    it('should handle future post time', () => {
      const futureTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day in future
      const wrapper = createWrapper({ postTime: futureTime });
      const formattedTime = wrapper.vm.formatTime(futureTime);
      expect(formattedTime).toBe(futureTime.toLocaleDateString());
    });

    it('should handle very old post time', () => {
      const oldTime = new Date('2000-01-01T12:00:00Z');
      const wrapper = createWrapper({ postTime: oldTime });
      const formattedTime = wrapper.vm.formatTime(oldTime);
      expect(formattedTime).toBe(oldTime.toLocaleDateString());
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

    it('should work correctly with different prop combinations', () => {
      const propsCombinations = [
        { content: '内容1', userName: '用户1', images: ['/img1.jpg'] },
        { content: '内容2', userName: '用户2', images: ['/img1.jpg', '/img2.jpg'] },
        { content: '内容3', userName: '用户3', images: Array(5).fill('/img.jpg') }
      ];

      propsCombinations.forEach(props => {
        const wrapper = createWrapper(props);
        expect(wrapper.find('.text-content').text()).toBe(props.content);
        expect(wrapper.find('.username').text()).toBe(props.userName);
        if (props.images.length > 0) {
          expect(wrapper.find('.post-images').exists()).toBe(true);
        }
      });
    });

    it('should maintain correct state when props are updated', async () => {
      const wrapper = createWrapper({ content: '初始内容' });
      
      await wrapper.setProps({ content: '更新内容' });
      expect(wrapper.find('.text-content').text()).toBe('更新内容');
      
      await wrapper.setProps({ userName: '新用户' });
      expect(wrapper.find('.username').text()).toBe('新用户');
      
      await wrapper.setProps({ images: ['/new-image.jpg'] });
      expect(wrapper.find('.post-images').exists()).toBe(true);
    });
  });
});