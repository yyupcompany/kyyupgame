/**
 * 前端权限调试脚本
 * 在浏览器控制台中运行
 */

// 检查权限store状态
function checkPermissionsStore() {
  console.log('🔍 检查权限store状态...');
  
  // 尝试访问Vue应用实例
  if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('✅ Vue DevTools 可用');
  }
  
  // 检查Pinia store
  const app = document.querySelector('#app')?.__vue_app__;
  if (app) {
    console.log('✅ Vue应用实例找到');
    
    // 获取所有store
    const stores = app.config.globalProperties.$pinia._s;
    console.log('📦 可用的stores:', Object.keys(stores));
    
    // 检查权限store
    const permissionsStore = stores.get('permissions');
    if (permissionsStore) {
      console.log('✅ 权限store找到');
      console.log('菜单项数量:', permissionsStore.menuItems?.length || 0);
      console.log('权限数量:', permissionsStore.permissions?.length || 0);
      console.log('角色数量:', permissionsStore.roles?.length || 0);
      console.log('加载状态:', permissionsStore.loading);
      console.log('错误信息:', permissionsStore.error);
      
      if (permissionsStore.menuItems?.length > 0) {
        console.log('🔍 前3个菜单项:', permissionsStore.menuItems.slice(0, 3));
      }
    } else {
      console.log('❌ 权限store未找到');
    }
  } else {
    console.log('❌ Vue应用实例未找到');
  }
  
  // 检查DOM中的侧边栏
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    console.log('✅ 侧边栏DOM元素找到');
    
    const navItems = sidebar.querySelectorAll('.nav-item');
    console.log('导航项数量:', navItems.length);
    
    const navTexts = Array.from(navItems).map(item => {
      const textEl = item.querySelector('.nav-text');
      return textEl ? textEl.textContent : '无文本';
    });
    
    console.log('导航项文本:', navTexts);
  } else {
    console.log('❌ 侧边栏DOM元素未找到');
  }
  
  // 检查用户store
  const userStore = stores?.get('user');
  if (userStore) {
    console.log('✅ 用户store找到');
    console.log('用户信息:', userStore.userInfo);
    console.log('登录状态:', userStore.isLoggedIn);
  }
}

// 定时检查
console.log('🚀 开始权限调试...');
checkPermissionsStore();

// 5秒后再次检查
setTimeout(() => {
  console.log('🔄 5秒后再次检查...');
  checkPermissionsStore();
}, 5000);