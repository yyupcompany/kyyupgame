/**
 * Logo Store - 管理系统 Logo 动态配置
 * 支持多租户，每个租户可以设置自己的 Logo
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import request from '@/utils/request';

export interface LogoConfig {
  logoUrl: string;      // Logo 图片 URL
  logoText: string;     // Logo 旁边的文字
  faviconUrl: string;   // 网站 Favicon URL
}

export const useLogoStore = defineStore('logo', () => {
  // 状态
  const logoUrl = ref<string>('');
  const logoText = ref<string>('幼儿园管理系统');
  const faviconUrl = ref<string>('');
  const loading = ref<boolean>(false);

  // 计算属性 - 是否有自定义 Logo
  const hasCustomLogo = computed(() => {
    return logoUrl.value && logoUrl.value.trim() !== '';
  });

  // 计算属性 - 获取 Logo URL（如果没有自定义，返回默认）
  const currentLogoUrl = computed(() => {
    return hasCustomLogo.value ? logoUrl.value : '/src/assets/logo.png';
  });

  // 计算属性 - 获取 Favicon URL
  const currentFaviconUrl = computed(() => {
    return faviconUrl.value || '/favicon.ico';
  });

  /**
   * 从服务器加载 Logo 配置
   */
  async function loadLogoConfig(): Promise<void> {
    try {
      loading.value = true;

      const response = await request.get('/api/system-configs', {
        params: {
          config_group: 'system',
          page: 1,
          pageSize: 100
        }
      });

      if (response.data.success) {
        const items = response.data.data.items || [];
        
        // 提取 Logo 相关配置
        items.forEach((item: any) => {
          switch (item.configKey) {
            case 'logo_url':
              logoUrl.value = item.configValue || '';
              break;
            case 'logo_text':
              logoText.value = item.configValue || '幼儿园管理系统';
              break;
            case 'favicon_url':
              faviconUrl.value = item.configValue || '';
              break;
          }
        });

        // 更新 Favicon
        if (faviconUrl.value) {
          updateFavicon(faviconUrl.value);
        }
      }
    } catch (error: any) {
      // 静默失败，不影响页面加载
      if (error?.response?.status !== 404) {
        console.error('加载 Logo 配置失败:', error);
      }
    } finally {
      loading.value = false;
    }
  }

  /**
   * 更新 Logo 配置
   */
  async function updateLogoConfig(config: Partial<LogoConfig>): Promise<void> {
    try {
      loading.value = true;

      const updates: Array<Promise<any>> = [];

      if (config.logoUrl !== undefined) {
        updates.push(
          request.post('/api/system-configs', {
            config_key: 'logo_url',
            config_value: config.logoUrl,
            config_type: 'string',
            config_group: 'system'
          })
        );
        logoUrl.value = config.logoUrl;
      }

      if (config.logoText !== undefined) {
        updates.push(
          request.post('/api/system-configs', {
            config_key: 'logo_text',
            config_value: config.logoText,
            config_type: 'string',
            config_group: 'system'
          })
        );
        logoText.value = config.logoText;
      }

      if (config.faviconUrl !== undefined) {
        updates.push(
          request.post('/api/system-configs', {
            config_key: 'favicon_url',
            config_value: config.faviconUrl,
            config_type: 'string',
            config_group: 'system'
          })
        );
        faviconUrl.value = config.faviconUrl;
        updateFavicon(config.faviconUrl);
      }

      await Promise.all(updates);
    } catch (error) {
      console.error('更新 Logo 配置失败:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 更新浏览器 Favicon
   */
  function updateFavicon(url: string): void {
    if (!url) return;

    // 查找或创建 favicon link 标签
    let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    
    link.href = url;
  }

  /**
   * 重置为默认 Logo
   */
  async function resetLogo(): Promise<void> {
    await updateLogoConfig({
      logoUrl: '',
      logoText: '幼儿园管理系统',
      faviconUrl: ''
    });
  }

  return {
    // 状态
    logoUrl,
    logoText,
    faviconUrl,
    loading,
    
    // 计算属性
    hasCustomLogo,
    currentLogoUrl,
    currentFaviconUrl,
    
    // 方法
    loadLogoConfig,
    updateLogoConfig,
    updateFavicon,
    resetLogo
  };
});
