import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import * as activityPosterApi from '@/api/modules/activity-poster';
import request from '@/utils/request';
import { expectNoConsoleErrors } from '../../../setup/console-monitoring';
import {
  validateRequiredFields,
  validateFieldTypes
} from '../../../utils/data-validation';

// Mock the request module
vi.mock('@/utils/request', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn()
  }
}));

const mockedRequest = vi.mocked(request);

// 控制台错误检测变量
let consoleSpy: any

describe('Activity Poster API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    expectNoConsoleErrors();
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('generateActivityPoster', () => {
    it('should generate poster for activity', async () => {
      const mockData = {
        posterType: 'main',
        marketingConfig: { theme: 'colorful' }
      };
      const mockResponse = {
        success: true,
        data: { posterId: 123, url: 'https://example.com/poster.jpg' }
      };

      mockedRequest.post.mockResolvedValue(mockResponse);

      const result = await activityPosterApi.generateActivityPoster(1, mockData);

      expect(mockedRequest.post).toHaveBeenCalledWith('/api/activities/1/poster/generate', mockData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when generating poster', async () => {
      const mockError = new Error('Network error');
      mockedRequest.post.mockRejectedValue(mockError);

      await expect(activityPosterApi.generateActivityPoster(1, {}))
        .rejects.toThrow('Network error');
    });
  });

  describe('getActivityPosters', () => {
    it('should get all posters for activity', async () => {
      const mockResponse = {
        success: true,
        data: [
          { activityId: 1, posterId: 1, posterType: 'main', isActive: true },
          { activityId: 1, posterId: 2, posterType: 'share', isActive: false }
        ]
      };

      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await activityPosterApi.getActivityPosters(1);

      expect(mockedRequest.get).toHaveBeenCalledWith('/api/activities/1/posters');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('previewActivityPoster', () => {
    it('should preview activity poster', async () => {
      const mockResponse = {
        success: true,
        data: { previewUrl: 'https://example.com/preview.jpg' }
      };

      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await activityPosterApi.previewActivityPoster(1, 'main');

      expect(mockedRequest.get).toHaveBeenCalledWith('/api/activities/1/poster/preview', {
        params: { posterType: 'main' }
      });
      expect(result).toEqual(mockResponse);
    });

    it('should use default poster type when not provided', async () => {
      const mockResponse = { success: true, data: {} };
      mockedRequest.get.mockResolvedValue(mockResponse);

      await activityPosterApi.previewActivityPoster(1);

      expect(mockedRequest.get).toHaveBeenCalledWith('/api/activities/1/poster/preview', {
        params: { posterType: 'main' }
      });
    });
  });

  describe('publishActivity', () => {
    it('should publish activity', async () => {
      const mockData = { publishChannels: ['web', 'mobile'] };
      const mockResponse = { success: true, data: { published: true } };

      mockedRequest.post.mockResolvedValue(mockResponse);

      const result = await activityPosterApi.publishActivity(1, mockData);

      expect(mockedRequest.post).toHaveBeenCalledWith('/api/activities/1/publish', mockData);
      expect(result).toEqual(mockResponse);
    });

    it('should publish with empty data when not provided', async () => {
      const mockResponse = { success: true, data: {} };
      mockedRequest.post.mockResolvedValue(mockResponse);

      await activityPosterApi.publishActivity(1);

      expect(mockedRequest.post).toHaveBeenCalledWith('/api/activities/1/publish', {});
    });
  });

  describe('shareActivity', () => {
    it('should share activity', async () => {
      const mockData = {
        shareChannel: 'wechat',
        customMessage: 'Check out this activity!'
      };
      const mockResponse = {
        success: true,
        data: {
          shareContent: {
            title: 'Test Activity',
            description: 'Fun activity for kids',
            imageUrl: 'https://example.com/image.jpg',
            url: 'https://example.com/activity/1'
          },
          shareUrl: 'https://example.com/share/1',
          shareId: 123,
          message: 'Activity shared successfully'
        }
      };

      mockedRequest.post.mockResolvedValue(mockResponse);

      const result = await activityPosterApi.shareActivity(1, mockData);

      expect(mockedRequest.post).toHaveBeenCalledWith('/api/activities/1/share', mockData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getActivityShareStats', () => {
    it('should get activity share statistics', async () => {
      const mockResponse = {
        success: true,
        data: {
          activity: {
            id: 1,
            title: 'Test Activity',
            shareCount: 50,
            viewCount: 200
          },
          shareStats: [
            { shareChannel: 'wechat', count: 30 },
            { shareChannel: 'weibo', count: 20 }
          ],
          totalShares: 50,
          totalViews: 200
        }
      };

      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await activityPosterApi.getActivityShareStats(1);

      expect(mockedRequest.get).toHaveBeenCalledWith('/api/activities/1/share/stats');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('incrementActivityViews', () => {
    it('should increment activity views', async () => {
      const mockResponse = { success: true, data: { views: 201 } };

      mockedRequest.post.mockResolvedValue(mockResponse);

      const result = await activityPosterApi.incrementActivityViews(1);

      expect(mockedRequest.post).toHaveBeenCalledWith('/api/activities/1/view');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('generateActivityQRCode', () => {
    it('should generate QR code for activity', async () => {
      const mockResponse = {
        success: true,
        data: {
          qrCodeUrl: 'https://example.com/qrcode/1',
          shareUrl: 'https://example.com/activity/1'
        }
      };

      mockedRequest.get.mockResolvedValue(mockResponse);

      const result = await activityPosterApi.generateActivityQRCode(1);

      expect(mockedRequest.get).toHaveBeenCalledWith('/api/activities/1/qrcode');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('copyShareLink', () => {
    it('should copy share link to clipboard using modern API', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText
        }
      });
      Object.defineProperty(window, 'isSecureContext', {
        writable: true,
        value: true
      });

      const result = await activityPosterApi.copyShareLink('https://example.com/share');

      expect(mockWriteText).toHaveBeenCalledWith('https://example.com/share');
      expect(result).toBe(true);
    });

    it('should copy share link using fallback method', async () => {
      // Remove modern clipboard API
      Object.assign(navigator, { clipboard: undefined });

      const mockExecCommand = vi.fn().mockReturnValue(true);
      document.execCommand = mockExecCommand;

      const createElementSpy = vi.spyOn(document, 'createElement');
      const appendChildSpy = vi.spyOn(document.body, 'appendChild');
      const removeChildSpy = vi.spyOn(document.body, 'removeChild');

      const result = await activityPosterApi.copyShareLink('https://example.com/share');

      expect(createElementSpy).toHaveBeenCalledWith('textarea');
      expect(mockExecCommand).toHaveBeenCalledWith('copy');
      expect(removeChildSpy).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should handle errors when copying link', async () => {
      Object.assign(navigator, { clipboard: undefined });
      Object.defineProperty(window, 'isSecureContext', {
        writable: true,
        value: false
      });
      // execCommand returning false doesn't throw error, just returns false
      document.execCommand = vi.fn().mockReturnValue(false);

      const result = await activityPosterApi.copyShareLink('https://example.com/share');

      // When execCommand returns false, the function returns false without logging error
      expect(result).toBe(false);
    });
  });

  describe('openShareWindow', () => {
    it('should open share window with correct parameters', () => {
      const mockOpen = vi.fn();
      window.open = mockOpen;

      // Mock screen dimensions for consistent left/top calculation
      Object.defineProperty(window, 'screen', {
        writable: true,
        value: { width: 1200, height: 1000 }
      });

      activityPosterApi.openShareWindow('https://example.com/share', 'Test Share');

      // left = (1200 - 600) / 2 = 300, top = (1000 - 400) / 2 = 300
      expect(mockOpen).toHaveBeenCalledWith(
        'https://example.com/share',
        'Test Share',
        'width=600,height=400,left=300,top=300,resizable=yes,scrollbars=yes'
      );
    });
  });

  describe('generateWeChatShareUrl', () => {
    it('should generate WeChat share URL with correct parameters', () => {
      const url = activityPosterApi.generateWeChatShareUrl(
        'https://example.com/share',
        'Test Activity',
        'Fun activity for kids'
      );

      expect(url).toContain('https://api.weixin.qq.com/cgi-bin/message/custom/send?');
      expect(url).toContain('url=https%3A%2F%2Fexample.com%2Fshare');
      // Accept both %20 and + encoding for spaces
      expect(url).toMatch(/title=Test(%20|\+)Activity/);
      expect(url).toMatch(/desc=Fun(%20|\+)activity(%20|\+)for(%20|\+)kids/);
    });
  });

  describe('generateWeiboShareUrl', () => {
    it('should generate Weibo share URL with correct parameters', () => {
      const url = activityPosterApi.generateWeiboShareUrl(
        'https://example.com/share',
        'Test Activity'
      );

      expect(url).toContain('https://service.weibo.com/share/share.php?');
      expect(url).toContain('url=https%3A%2F%2Fexample.com%2Fshare');
      // Accept both %20 and + encoding for spaces
      expect(url).toMatch(/title=Test(%20|\+)Activity/);
      expect(url).toContain('source=%E5%B9%BC%E5%84%BF%E5%9B%AD%E6%8B%9B%E7%94%9F%E7%AE%A1%E7%90%86%E7%B3%BB%E7%BB%9F');
    });
  });

  describe('generateQQShareUrl', () => {
    it('should generate QQ share URL with correct parameters', () => {
      const url = activityPosterApi.generateQQShareUrl(
        'https://example.com/share',
        'Test Activity',
        'Fun activity for kids'
      );

      expect(url).toContain('https://connect.qq.com/widget/shareqq/index.html?');
      expect(url).toContain('url=https%3A%2F%2Fexample.com%2Fshare');
      // Accept both %20 and + encoding for spaces
      expect(url).toMatch(/title=Test(%20|\+)Activity/);
      expect(url).toMatch(/desc=Fun(%20|\+)activity(%20|\+)for(%20|\+)kids/);
    });
  });

  describe('formatShareData', () => {
    it('should format share data correctly', () => {
      const activity = {
        id: 1,
        title: 'Test Activity',
        posterId: 123
      };

      const result = activityPosterApi.formatShareData(activity, 'wechat');

      expect(result).toEqual({
        shareChannel: 'wechat',
        posterId: 123,
        customMessage: '精彩活动推荐：Test Activity，欢迎参与！'
      });
    });
  });

  describe('getShareChannelIcon', () => {
    it('should return correct icon for each channel', () => {
      expect(activityPosterApi.getShareChannelIcon('wechat')).toBe('💬');
      expect(activityPosterApi.getShareChannelIcon('weibo')).toBe('📱');
      expect(activityPosterApi.getShareChannelIcon('qq')).toBe('🐧');
      expect(activityPosterApi.getShareChannelIcon('link')).toBe('🔗');
      expect(activityPosterApi.getShareChannelIcon('qrcode')).toBe('📱');
      expect(activityPosterApi.getShareChannelIcon('unknown')).toBe('📤');
    });
  });

  describe('getShareChannelName', () => {
    it('should return correct name for each channel', () => {
      expect(activityPosterApi.getShareChannelName('wechat')).toBe('微信');
      expect(activityPosterApi.getShareChannelName('weibo')).toBe('微博');
      expect(activityPosterApi.getShareChannelName('qq')).toBe('QQ');
      expect(activityPosterApi.getShareChannelName('link')).toBe('复制链接');
      expect(activityPosterApi.getShareChannelName('qrcode')).toBe('二维码');
      expect(activityPosterApi.getShareChannelName('unknown')).toBe('其他');
    });
  });
});