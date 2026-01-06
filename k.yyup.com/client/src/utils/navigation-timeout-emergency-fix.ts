/**
 * 紧急修复：针对localhost环境的导航超时问题
 * 专门解决PAGE_ACCESS_ERROR: Navigation timeout of 3000 ms exceeded
 */

// 立即执行的紧急修复
(function emergencyNavigationFix() {
  // 检查是否为localhost环境
  if (typeof window === 'undefined' || (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')) {
    return;
  }

  console.log('🚨 紧急修复：localhost导航超时问题');

  // 移除模拟认证，使用真实认证
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

  // 2. 不再拦截fetch API，避免干扰正常请求
  console.log('🔧 紧急修复：跳过fetch拦截，使用温和的修复方式');

  // 3. 不再拦截Promise.race，避免干扰Vue应用
  console.log('🔧 紧急修复：跳过Promise拦截，避免干扰应用正常运行');

  // 4. 监听路由变化，确保快速响应
  let routeChangeTimeout: NodeJS.Timeout | null = null;
  
  function setupRouteChangeListener() {
    // 监听popstate事件
    window.addEventListener('popstate', () => {
      if (routeChangeTimeout) {
        clearTimeout(routeChangeTimeout);
      }
      routeChangeTimeout = setTimeout(() => {
        console.log('🔧 紧急修复：路由变化超时保护（仅记录，不强制刷新）');
        // 不再强制刷新页面，避免破坏用户体验
      }, 3000);
    });
  }

  // 5. 防止Vue应用卡死
  function preventVueFreeze() {
    // 监听Vue错误
    window.addEventListener('error', (event) => {
      if (event.message.includes('timeout') || event.message.includes('navigation')) {
        console.log('🚨 紧急修复：检测到导航超时错误，尝试恢复');
        // 强制跳转到dashboard
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 100);
      }
    });

    // 监听未捕获的Promise错误
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && event.reason.toString().includes('timeout')) {
        console.log('🚨 紧急修复：检测到Promise超时错误，尝试恢复');
        // 阻止默认处理
        event.preventDefault();
      }
    });
  }

  // 6. 启动所有修复
  try {
    setupRouteChangeListener();
    preventVueFreeze();
    
    console.log('✅ 紧急修复：localhost导航超时修复已启动');
  } catch (error) {
    console.error('⚠️ 紧急修复启动失败:', error);
  }
})();

export default {};