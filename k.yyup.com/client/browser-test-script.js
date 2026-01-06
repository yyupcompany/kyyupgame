
// 在浏览器控制台中执行此脚本
(function() {
    console.log('🔍 开始页面深度检查...');
    
    // 收集页面信息
    const pageInfo = {
        url: window.location.href,
        title: document.title,
        hasVueApp: !!document.querySelector('#app'),
        bodyText: document.body.innerText.trim(),
        
        // 检查各种状态
        hasLoading: !!document.querySelector('.el-loading-mask, .loading, .v-loading'),
        hasError: !!document.querySelector('.el-message--error, .error, .el-alert--error'),
        hasEmptyState: !!document.querySelector('.el-empty, .empty, .no-data'),
        
        // 检查表格和表单
        tables: document.querySelectorAll('.el-table, table').length,
        tableRows: document.querySelectorAll('.el-table__row, tbody tr').length,
        forms: document.querySelectorAll('.el-form, form').length,
        inputs: document.querySelectorAll('input, select, textarea').length,
        buttons: document.querySelectorAll('button, .el-button').length,
        
        // 检查菜单
        menuItems: document.querySelectorAll('.el-menu-item, .menu-item, .sidebar-menu a').length,
        activeMenu: document.querySelector('.el-menu-item.is-active, .menu-item.active')?.innerText,
        
        // 控制台错误
        consoleErrors: [],
        
        // API请求
        networkErrors: []
    };
    
    // 检查内容是否为空
    pageInfo.hasContent = pageInfo.bodyText.length > 100;
    pageInfo.isLoginPage = window.location.pathname.includes('login');
    
    // 生成报告
    console.group('📊 页面检查报告');
    console.log('URL:', pageInfo.url);
    console.log('标题:', pageInfo.title);
    console.log('Vue应用:', pageInfo.hasVueApp ? '✅ 是' : '❌ 否');
    console.log('页面内容:', pageInfo.hasContent ? '✅ 有内容' : '❌ 无内容/内容过少');
    
    console.group('状态检查');
    console.log('加载中:', pageInfo.hasLoading ? '⏳ 是' : '✅ 否');
    console.log('错误状态:', pageInfo.hasError ? '❌ 有错误' : '✅ 无错误');
    console.log('空数据:', pageInfo.hasEmptyState ? '📭 是' : '✅ 否');
    console.groupEnd();
    
    console.group('元素统计');
    console.log('表格数:', pageInfo.tables);
    console.log('表格行数:', pageInfo.tableRows);
    console.log('表单数:', pageInfo.forms);
    console.log('输入框数:', pageInfo.inputs);
    console.log('按钮数:', pageInfo.buttons);
    console.log('菜单项数:', pageInfo.menuItems);
    console.log('当前菜单:', pageInfo.activeMenu || '未选中');
    console.groupEnd();
    
    // 测试API连接
    console.group('🔌 API连接测试');
    fetch('/api/health')
        .then(res => {
            console.log('API健康检查:', res.ok ? '✅ 正常' : '❌ 异常');
            return res.json();
        })
        .then(data => console.log('响应数据:', data))
        .catch(err => console.error('API错误:', err));
    console.groupEnd();
    
    // 检查问题
    const issues = [];
    
    if (!pageInfo.hasVueApp) {
        issues.push('❌ Vue应用未正确加载');
    }
    
    if (!pageInfo.hasContent && !pageInfo.isLoginPage) {
        issues.push('❌ 页面内容为空或过少');
    }
    
    if (pageInfo.hasError) {
        issues.push('❌ 页面显示错误状态');
    }
    
    if (pageInfo.hasLoading) {
        issues.push('⚠️ 页面持续显示加载状态');
    }
    
    if (pageInfo.tables > 0 && pageInfo.tableRows === 0) {
        issues.push('📭 表格存在但无数据');
    }
    
    if (pageInfo.menuItems === 0) {
        issues.push('❌ 未找到菜单项');
    }
    
    // 显示问题汇总
    if (issues.length > 0) {
        console.group('⚠️ 发现的问题');
        issues.forEach(issue => console.log(issue));
        console.groupEnd();
    } else {
        console.log('✅ 页面状态正常');
    }
    
    console.groupEnd();
    
    // 返回结果供进一步处理
    return pageInfo;
})();

// 测试所有菜单项
function testAllMenuItems() {
    console.log('🔍 测试所有菜单项...');
    const menuItems = document.querySelectorAll('.el-menu-item, .menu-item');
    const results = [];
    
    menuItems.forEach((item, index) => {
        const text = item.innerText.trim();
        const link = item.querySelector('a')?.href || item.getAttribute('href');
        const isActive = item.classList.contains('is-active') || item.classList.contains('active');
        const isDisabled = item.classList.contains('disabled') || item.hasAttribute('disabled');
        
        results.push({
            index,
            text,
            link,
            isActive,
            isDisabled
        });
        
        console.log(`菜单 ${index + 1}: ${text} - ${isDisabled ? '❌ 禁用' : '✅ 可用'}`);
    });
    
    return results;
}

// 检查当前页面的数据加载
function checkDataLoading() {
    console.log('🔍 检查数据加载...');
    
    // 检查所有的API请求
    const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (entry.name.includes('/api/')) {
                console.log(`API请求: ${entry.name} - 耗时: ${entry.duration}ms`);
            }
        }
    });
    
    observer.observe({ entryTypes: ['resource'] });
    
    // 检查axios请求（如果存在）
    if (window.axios) {
        const originalRequest = window.axios.request;
        window.axios.request = function(...args) {
            console.log('Axios请求:', args[0]);
            return originalRequest.apply(this, args);
        };
    }
}

// 生成页面截图建议
function screenshotGuide() {
    console.log('📸 截图建议:');
    console.log('1. 整个页面截图 - 显示整体布局');
    console.log('2. 控制台截图 - 显示错误信息');
    console.log('3. 网络标签截图 - 显示失败的API请求');
    console.log('4. 空数据区域截图 - 显示空状态');
    console.log('5. 错误提示截图 - 显示具体错误');
}
