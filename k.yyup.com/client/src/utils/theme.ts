// Mock Vue ref function for TypeScript compilation
const ref = (value: any) => ({ value })

// 支持的主题类型
export type ThemeType = 'default' | 'dark' | 'glass-light' | 'glass-dark';

// 当前激活的主题（响应式）
const __savedTheme1 = localStorage.getItem('app_theme') as ThemeType | null;
const __savedTheme2 = localStorage.getItem('app-theme') as ThemeType | null;
export const currentTheme = ref(__savedTheme1 || __savedTheme2 || 'default');

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

  // 完全清除所有主题类名和属性
  document.documentElement.classList.remove('default-theme', 'dark-theme', 'custom-theme', 'glassmorphism-theme',
    'cyberpunk-theme', 'nature-theme', 'ocean-theme', 'sunset-theme', 'midnight-theme', 'dark-mode-debug',
    'glass-light', 'glass-dark');
  document.documentElement.removeAttribute('data-theme');
  document.body.classList.remove('el-theme-dark');
  document.body.removeAttribute('data-el-theme');

  // 清除内联样式
  const allElements = document.querySelectorAll('*');
  allElements.forEach(el => {
    if (el instanceof HTMLElement) {
      el.removeAttribute('style');
    }
  });

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
  } else if (theme === 'glass-light') {
    // 明亮玻璃台主题
    document.documentElement.setAttribute('data-theme', 'glass-light');
    document.documentElement.classList.add('glass-light');
    document.body.setAttribute('data-theme', 'glass-light');
  } else if (theme === 'glass-dark') {
    // 暗黑玻璃台主题
    document.documentElement.setAttribute('data-theme', 'glass-dark');
    document.documentElement.classList.add('glass-dark');
    document.body.setAttribute('data-theme', 'glass-dark');

    // 暗黑模式标记
    document.body.setAttribute('data-el-theme', 'dark');
    document.body.classList.add('el-theme-dark');
  } else {
    // 默认主题 (default)
    document.documentElement.classList.add('default-theme');
    document.body.classList.remove('el-theme-dark');
    document.body.removeAttribute('data-el-theme');
  }

  // 统一：为工作台添加作用域类，并切换body的明暗主题类，确保样式生效
  document.body.classList.add('theme-workbench');
  document.body.classList.toggle('theme-dark', theme === 'dark' || theme === 'glass-dark');
  document.body.classList.toggle('theme-light', theme !== 'dark' && theme !== 'glass-dark');

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
  const savedTheme = localStorage.getItem('app-theme') as ThemeType || 'default';
  console.log('[主题] 初始化主题:', savedTheme);
  
  // 更新当前主题状态
  currentTheme.value = savedTheme;
  
  // 为确保主题正确应用，先设置一些必要的CSS类
  if (savedTheme === 'dark') {
    // 先添加必要的类和属性，以避免闪烁
    document.documentElement.classList.add('dark-theme');
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.classList.add('el-theme-dark');
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
  const themes: ThemeType[] = ['default', 'dark', 'glass-light', 'glass-dark'];
  const currentIndex = themes.indexOf(currentTheme.value);
  const nextIndex = (currentIndex + 1) % themes.length;

  // 切换到下一个主题
  const nextTheme = themes[nextIndex];

  // 如果要切换回默认主题，先删除所有可能的暗黑主题样式
  if (nextTheme === 'default' && (currentTheme.value === 'dark' || currentTheme.value === 'glass-dark')) {
    // 完全清除暗黑主题设置
    document.documentElement.classList.remove('dark-theme', 'dark-mode-debug', 'glass-dark');
    document.documentElement.removeAttribute('data-theme');
    document.body.classList.remove('el-theme-dark');
    document.body.removeAttribute('data-el-theme');

    // 强制刷新页面(只在开发环境)
    if (process.env.NODE_ENV === 'development') {
      console.log('[主题] 强制刷新页面以完全清除暗黑主题样式');
      // 使用更温和的方式刷新样式，不重载整个页面
      document.body.style.display = 'none';
      setTimeout(() => {
        document.body.style.display = '';
      }, 50);
    }
  }

  setTheme(nextTheme);
};

// 获取主题名称
export const getThemeName = (theme: ThemeType): string => {
  const nameMap: Record<ThemeType, string> = {
    default: '明亮主题',
    dark: '暗黑主题',
    'glass-light': '明亮玻璃台',
    'glass-dark': '暗黑玻璃台'
  };

  return nameMap[theme] || '未知主题';
};

// 判断是否为暗黑模式
export const isDarkMode = (): boolean => {
  return currentTheme.value === 'dark';
};

// 移除自动监听，避免死循环
// watchEffect(() => {
//   setTheme(currentTheme.value);
// }); 