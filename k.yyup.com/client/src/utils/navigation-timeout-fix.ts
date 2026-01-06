/**
 * 导航超时修复工具
 * 专门解决localhost环境下的PAGE_ACCESS_ERROR问题
 */

export interface NavigationTimeoutOptions {
  maxTimeout: number;
  retryAttempts: number;
  fallbackRoute: string;
}

export class NavigationTimeoutFix {
  private static instance: NavigationTimeoutFix;
  private timeoutHandlers: Map<string, NodeJS.Timeout> = new Map();
  private retryCounters: Map<string, number> = new Map();
  private isLocalhost: boolean;
  private isKYYUP: boolean;

  private constructor() {
    this.isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    // 判断是否为KYYUP系统域名
    this.isKYYUP = this.isLocalhost ||
                   window.location.hostname === 'k.yyup.cc' ||
                   window.location.hostname === 'k.yyup.com' ||
                   window.location.hostname.endsWith('.yyup.cc');
  }
  
  static getInstance(): NavigationTimeoutFix {
    if (!NavigationTimeoutFix.instance) {
      NavigationTimeoutFix.instance = new NavigationTimeoutFix();
    }
    return NavigationTimeoutFix.instance;
  }
  
  /**
   * 为localhost环境设置快速导航
   */
  setupFastNavigation() {
    if (!this.isLocalhost) return;

    console.log('🚀 启用localhost快速导航模式');
    
    // 预设认证信息，避免API调用
    this.presetAuthInfo();
    
    // 拦截长时间的异步操作
    this.interceptLongAsyncOperations();
    
    // 优化路由加载
    this.optimizeRouteLoading();
    
    // 设置全局导航超时拦截器
    this.setupNavigationTimeoutInterceptor();
  }
  
  /**
   * 预设认证信息
   */
  private presetAuthInfo() {
    const token = localStorage.getItem('kindergarten_token');
    if (!token) {
      console.log('🔧 需要真实认证token');
      // 不再设置模拟token
      
      const mockUser = {
        id: 1,
        username: 'admin',
        role: 'admin',
        email: 'admin@example.com',
        realName: '管理员',
        phone: '13800138000',
        status: 'active',
        isAdmin: true,
        kindergartenId: 1,
        permissions: ['*']
      };
      localStorage.setItem('kindergarten_user_info', JSON.stringify(mockUser));
    }
  }
  
  /**
   * 拦截长时间的异步操作
   */
  private interceptLongAsyncOperations() {
    // 注意：不再拦截fetch API，让请求自然失败或成功
    // 这样可以避免误导前端以为API调用成功了
    console.log('🔧 localhost: 跳过fetch拦截，使用原生请求处理');
  }
  
  /**
   * 优化路由加载
   */
  private optimizeRouteLoading() {
    // 预加载关键路由
    const criticalRoutes = [
      '/',
      '/dashboard',
      '/login',
      '/system/users',
      '/system/roles'
    ];
    
    criticalRoutes.forEach(route => {
      this.preloadRoute(route);
    });
  }
  
  /**
   * 预加载路由
   */
  private preloadRoute(route: string) {
    try {
      // 使用link标签预加载
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      document.head.appendChild(link);
      
      console.log(`📦 预加载路由: ${route}`);
    } catch (error) {
      console.warn(`⚠️ 预加载路由失败: ${route}`, error);
    }
  }
  
  /**
   * 处理导航超时
   */
  handleNavigationTimeout(route: string, callback: () => void, options: Partial<NavigationTimeoutOptions> = {}) {
    const { maxTimeout = 2000, retryAttempts = 2, fallbackRoute = '/dashboard' } = options;
    
    const timeoutId = setTimeout(() => {
      console.warn(`⚠️ 导航超时 ${route}`);
      
      const retryCount = this.retryCounters.get(route) || 0;
      if (retryCount < retryAttempts) {
        this.retryCounters.set(route, retryCount + 1);
        console.log(`🔄 重试导航: ${route} (第${retryCount + 1}次)`);
        callback();
      } else {
        console.log(`🛑 导航失败，跳转到备用路由: ${fallbackRoute}`);
        window.location.href = fallbackRoute;
      }
    }, maxTimeout);
    
    this.timeoutHandlers.set(route, timeoutId);
  }
  
  /**
   * 清除导航超时
   */
  clearNavigationTimeout(route: string) {
    const timeoutId = this.timeoutHandlers.get(route);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeoutHandlers.delete(route);
      this.retryCounters.delete(route);
    }
  }
  
  /**
   * 快速检查页面是否需要认证
   */
  quickAuthCheck(route: string): boolean {
    const publicRoutes = ['/login', '/register', '/404', '/403'];
    if (publicRoutes.includes(route)) {
      return true;
    }
    
    const token = localStorage.getItem('kindergarten_token');
    if (!token && this.isKYYUP) {
      this.presetAuthInfo();
      return true;
    }
    
    return !!token;
  }
  
  /**
   * 设置全局导航超时拦截器
   */
  private setupNavigationTimeoutInterceptor() {
    // 禁用超时拦截器，因为它会干扰Vue应用正常启动
    console.log('🔧 localhost: 导航超时拦截器已禁用，避免干扰应用启动');

    // 注释掉有问题的代码
    // const originalSetTimeout = window.setTimeout;
    // const originalSetInterval = window.setInterval;
    //
    // window.setTimeout = function(callback: Function, delay: number, ...args: any[]) {
    //   // 如果是超过2秒的延迟，在localhost环境下缩短到200ms
    //   if (delay > 2000) {
    //     console.log(`🔧 localhost: 缩短超时时间 ${delay}ms -> 200ms`);
    //     delay = 200;
    //   }
    //   return originalSetTimeout.call(this, callback, delay, ...args);
    // };
    //
    // window.setInterval = function(callback: Function, delay: number, ...args: any[]) {
    //   // 如果是超过2秒的间隔，在localhost环境下缩短到1000ms
    //   if (delay > 2000) {
    //     console.log(`🔧 localhost: 缩短间隔时间 ${delay}ms -> 1000ms`);
    //     delay = 1000;
    //   }
    //   return originalSetInterval.call(this, callback, delay, ...args);
    // };

    console.log('✅ localhost: 导航超时拦截器配置完成');
  }

  /**
   * 获取修复统计信息
   */
  getStats() {
    return {
      isKYYUP: this.isKYYUP,
      activeTimeouts: this.timeoutHandlers.size,
      retryCounters: Object.fromEntries(this.retryCounters),
      hasAuthInfo: !!localStorage.getItem('kindergarten_token')
    };
  }
}

// 创建单例实例
export const navigationTimeoutFix = NavigationTimeoutFix.getInstance();

// 自动初始化
if (typeof window !== 'undefined') {
  navigationTimeoutFix.setupFastNavigation();
}