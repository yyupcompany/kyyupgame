import { ref } from 'vue'

// 支持的主题类型
export type ThemeType = 'default' | 'dark' | 'custom';

// 当前激活的主题（响应式）
const __savedTheme1 = localStorage.getItem('app_theme') as ThemeType | null;
const __savedTheme2 = localStorage.getItem('app-theme') as ThemeType | null;
export const currentTheme = ref<ThemeType>(__savedTheme1 || __savedTheme2 || 'default');

// 特别处理侧边栏Logo区域 - 简化版本，避免死循环
const updateSidebarLogo = (theme: ThemeType): void => {
  console.log(`[主题] 尝试查找侧边栏Logo元素 - 主题: ${theme}`);
  
  // 尝试不同的选择器
  let sidebarLogos = document.querySelectorAll('.sidebar-logo');
  if (sidebarLogos.length === 0) {
    sidebarLogos = document.querySelectorAll('.sidebar .sidebar-logo');
  }
  if (sidebarLogos.length === 0) {
    sidebarLogos = document.querySelectorAll('[class*="sidebar-logo"]');
  }
  
  if (sidebarLogos.length > 0) {
    console.log(`[主题] 找到${sidebarLogos.length}个侧边栏Logo元素`);
    
    sidebarLogos.forEach(logo => {
      if (logo instanceof HTMLElement) {
        console.log(`[主题] 应用样式到Logo元素: `, logo);
        
        // 根据主题应用不同的样式
        if (theme === 'dark') {
          // 使用setProperty方法确保!important生效
          logo.style.setProperty('background-color', '#0f172a', 'important');
          logo.style.setProperty('border-bottom-color', '#374151', 'important');
          
          // 查找并处理Logo中的子元素
          const logoText = logo.querySelector('.logo-text');
          if (logoText instanceof HTMLElement) {
            logoText.style.setProperty('color', '#f9fafb', 'important');
          }
          
          const logoImg = logo.querySelector('.logo-img');
          if (logoImg instanceof HTMLElement) {
            logoImg.style.setProperty('filter', 'brightness(1.2) contrast(1.1)', 'important');
          }
          
          const collapseIcon = logo.querySelector('.collapse-icon');
          if (collapseIcon instanceof HTMLElement) {
            collapseIcon.style.setProperty('color', '#9ca3af', 'important');
          }
          
          // 添加专门的类名
          logo.classList.add('sidebar-logo-dark');
          logo.classList.remove('sidebar-logo-custom', 'sidebar-logo-default');
        } else if (theme === 'custom') {
          // 自定义主题样式 - 现在使用白色背景
          logo.style.setProperty('background-color', '#ffffff', 'important');
          logo.style.setProperty('border-bottom-color', '#e0e0e0', 'important');
          
          const logoText = logo.querySelector('.logo-text');
          if (logoText instanceof HTMLElement) {
            logoText.style.setProperty('color', '#333333', 'important');
          }
          
          const logoImg = logo.querySelector('.logo-img');
          if (logoImg instanceof HTMLElement) {
            logoImg.style.removeProperty('filter');
          }
          
          const collapseIcon = logo.querySelector('.collapse-icon');
          if (collapseIcon instanceof HTMLElement) {
            collapseIcon.style.setProperty('color', '#666666', 'important');
          }
          
          // 添加专门的类名
          logo.classList.add('sidebar-logo-custom');
          logo.classList.remove('sidebar-logo-dark', 'sidebar-logo-default');
        } else {
          // 默认主题样式 - 现在使用白色背景
          logo.style.setProperty('background-color', '#ffffff', 'important');
          logo.style.setProperty('border-bottom-color', '#e0e0e0', 'important');
          
          const logoText = logo.querySelector('.logo-text');
          if (logoText instanceof HTMLElement) {
            logoText.style.setProperty('color', '#333333', 'important');
          }
          
          const logoImg = logo.querySelector('.logo-img');
          if (logoImg instanceof HTMLElement) {
            logoImg.style.removeProperty('filter');
          }
          
          const collapseIcon = logo.querySelector('.collapse-icon');
          if (collapseIcon instanceof HTMLElement) {
            collapseIcon.style.setProperty('color', '#666666', 'important');
          }
          
          // 添加专门的类名
          logo.classList.add('sidebar-logo-default');
          logo.classList.remove('sidebar-logo-dark', 'sidebar-logo-custom');
        }
        
        console.log(`[主题] 已应用Logo样式 - 主题: ${theme}, 背景色: ${logo.style.backgroundColor}`);
      }
    });
    console.log(`[主题] 已直接应用侧边栏Logo区域样式 - ${theme}`);
  } else {
    console.warn(`[主题] 未找到侧边栏Logo元素 (使用了多种选择器尝试)`);
    // 完全移除任何递归调用，避免死循环
  }
};

// 设置主题
export const setTheme = (theme: ThemeType): void => {
  // 更新当前主题状态
  currentTheme.value = theme;

  // 保存到本地存储（两个key保持兼容）
  localStorage.setItem('app-theme', theme);
  localStorage.setItem('app_theme', theme);

  // 完全清除所有主题类名和属性（避免残留叠加）
  document.documentElement.classList.remove(
    'default-theme',
    'dark-theme',
    'custom-theme',
    'glassmorphism-theme',
    'cyberpunk-theme',
    'nature-theme',
    'ocean-theme',
    'sunset-theme',
    'midnight-theme',
    'dark-mode-debug',
    'glass-light',
    'glass-dark'
  );
  document.documentElement.removeAttribute('data-theme');
  document.body.classList.remove('el-theme-dark', 'theme-dark', 'theme-light');
  document.body.removeAttribute('data-el-theme');

  /**
   * ⚠️ 不再全局清理所有元素的 style 属性
   * 之前的实现会把 Element Plus 文本域等组件的内联高度样式移除，
   * 在主题切换后导致输入框高度为 0、无法输入。这里保持各组件的内联样式，
   * 仅依赖 CSS 变量完成主题切换。
   */

  // 对于特殊主题，添加data-theme属性和类名
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.classList.add('dark-theme');

    // 强制应用Element Plus组件的主题样式
    document.body.setAttribute('data-el-theme', 'dark');
    document.body.classList.add('el-theme-dark');

    // 添加暗黑模式调试类，使样式更容易识别
    if (process.env.NODE_ENV === 'development') {
      document.documentElement.classList.add('dark-mode-debug');
    }
  } else if (theme === 'custom') {
    document.documentElement.setAttribute('data-theme', 'custom');
    document.documentElement.classList.add('custom-theme');
    document.body.classList.remove('el-theme-dark');
    document.body.removeAttribute('data-el-theme');
  } else {
    // 默认主题 (default)
    document.documentElement.classList.add('default-theme');
    document.body.classList.remove('el-theme-dark');
    document.body.removeAttribute('data-el-theme');
  }

  // 统一：为工作台添加作用域类，并切换body的明暗主题类，确保样式生效
  document.body.classList.add('theme-workbench');
  document.body.classList.toggle('theme-dark', theme === 'dark');
  document.body.classList.toggle('theme-light', theme !== 'dark');

  // 简化的主题应用，避免复杂的DOM操作导致死循环
  console.log(`[主题] 已切换到 ${theme} 主题`);
  console.log(`[主题] HTML classes: ${document.documentElement.className}`);
  console.log(`[主题] data-theme: ${document.documentElement.getAttribute('data-theme')}`);
  console.log(`[主题] body classes: ${document.body.className}`);

  // 主题切换事件
  window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme } }));

  // 延迟调用updateSidebarLogo，避免死循环
  setTimeout(() => {
    updateSidebarLogo(theme);
  }, 100);
};

// 初始化主题
export const initTheme = (): void => {
  let savedTheme = localStorage.getItem('app-theme') as ThemeType | string || 'default';
  
  // 如果保存的主题是玻璃台主题，自动迁移到默认主题
  if (savedTheme === 'glass-light' || savedTheme === 'glass-dark') {
    console.log('[主题] 检测到已废弃的玻璃台主题，自动迁移到默认主题');
    savedTheme = 'default';
    localStorage.setItem('app-theme', 'default');
    localStorage.setItem('app_theme', 'default');
  }
  
  // 确保主题类型正确
  const validTheme = (savedTheme === 'default' || savedTheme === 'dark' || savedTheme === 'custom')
    ? savedTheme as ThemeType
    : 'default';
  
  console.log('[主题] 初始化主题:', validTheme);
  
  // 更新当前主题状态
  currentTheme.value = validTheme;
  
  // 为确保主题正确应用，先设置一些必要的CSS类
  if (savedTheme === 'dark') {
    // 先添加必要的类和属性，以避免闪烁
    document.documentElement.classList.add('dark-theme');
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.classList.add('el-theme-dark');
  } else if (savedTheme === 'custom') {
    document.documentElement.classList.add('custom-theme');
    document.documentElement.setAttribute('data-theme', 'custom');
    document.body.classList.remove('el-theme-dark');
    document.body.removeAttribute('data-el-theme');
  } else {
    // 确保没有暗黑主题的类名
    document.documentElement.classList.remove('dark-theme', 'dark-mode-debug');
    document.documentElement.removeAttribute('data-theme');
    document.body.classList.remove('el-theme-dark');
    document.body.removeAttribute('data-el-theme');
    document.documentElement.classList.add(`${savedTheme}-theme`);
  }

  // 统一：初始化body的主题类，保证样式覆盖生效
  document.body.classList.add('theme-workbench');
  document.body.classList.toggle('theme-dark', savedTheme === 'dark');
  document.body.classList.toggle('theme-light', savedTheme !== 'dark');

  console.log('[主题] 主题初始化完成，避免调用setTheme防止死循环');
};

// 切换到下一个主题
export const toggleTheme = (): void => {
  const themes: ThemeType[] = ['default', 'dark', 'custom'];
  const currentIndex = themes.indexOf(currentTheme.value);
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  const nextIndex = (safeIndex + 1) % themes.length;

  // 切换到下一个主题
  const nextTheme = themes[nextIndex];

  // 不再做隐藏/恢复强刷，避免布局抖动（CLS）

  setTheme(nextTheme);
};

// 获取主题名称
export const getThemeName = (theme: ThemeType): string => {
  const nameMap: Record<ThemeType, string> = {
    default: '明亮主题',
    dark: '暗黑主题',
    custom: '自定义主题'
  };

  return nameMap[theme] || '未知主题';
};

// 判断是否为暗黑模式
export const isDarkMode = (): boolean => {
  return currentTheme.value === 'dark';
};

// 获取当前主题
export const getCurrentTheme = (): ThemeType => {
  return currentTheme.value;
};

// 移除自动监听，避免死循环
// watchEffect(() => {
//   setTheme(currentTheme.value);
// }); 