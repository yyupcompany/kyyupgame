// 主题调试工具
console.log('🎨 主题调试工具启动');

// 检查当前应用的主题类
function checkCurrentTheme() {
    const htmlElement = document.documentElement;
    const classes = Array.from(htmlElement.classList);
    const themeClasses = classes.filter(cls => cls.startsWith('theme-'));
    
    console.log('📋 当前HTML类名:', classes);
    console.log('🎭 当前主题类:', themeClasses);
    
    return themeClasses[0] || '无主题类';
}

// 检查CSS变量是否正确应用
function checkCSSVariables() {
    const testVars = [
        '--primary-color',
        '--bg-primary', 
        '--bg-card',
        '--text-primary',
        '--border-color'
    ];
    
    const computed = getComputedStyle(document.documentElement);
    
    console.log('🎨 CSS变量检查:');
    testVars.forEach(varName => {
        const value = computed.getPropertyValue(varName).trim();
        console.log(`  ${varName}: ${value || '❌ 未定义'}`);
    });
}

// 手动切换主题测试
function testThemeSwitch(themeName) {
    console.log(`🔄 测试切换到主题: ${themeName}`);
    
    // 移除所有主题类
    document.documentElement.classList.remove('theme-light', 'theme-dark', 'theme-blue', 'theme-purple', 'theme-green');
    
    // 添加新主题类
    document.documentElement.classList.add(themeName);
    
    // 等待一下让样式应用
    setTimeout(() => {
        console.log(`✅ 主题切换完成: ${themeName}`);
        checkCurrentTheme();
        checkCSSVariables();
    }, 100);
}

// 检查样式表是否加载
function checkStylesheets() {
    const stylesheets = Array.from(document.styleSheets);
    console.log('📄 已加载的样式表:');
    
    stylesheets.forEach((sheet, index) => {
        try {
            const href = sheet.href || '内联样式';
            console.log(`  ${index + 1}. ${href}`);
            
            // 检查是否包含主题相关的规则
            if (sheet.cssRules) {
                const themeRules = Array.from(sheet.cssRules).filter(rule => 
                    rule.selectorText && rule.selectorText.includes('theme-')
                );
                if (themeRules.length > 0) {
                    console.log(`    🎨 包含 ${themeRules.length} 个主题规则`);
                }
            }
        } catch (e) {
            console.log(`    ⚠️ 无法访问样式表规则 (CORS限制)`);
        }
    });
}

// 主函数
function debugTheme() {
    console.log('🔍 开始主题调试...');
    console.log('');
    
    checkCurrentTheme();
    console.log('');
    
    checkCSSVariables();
    console.log('');
    
    checkStylesheets();
    console.log('');
    
    console.log('🧪 主题切换测试:');
    console.log('使用以下命令测试主题切换:');
    console.log('  testThemeSwitch("theme-blue")');
    console.log('  testThemeSwitch("theme-green")');
    console.log('  testThemeSwitch("theme-purple")');
    console.log('  testThemeSwitch("theme-light")');
    console.log('  testThemeSwitch("theme-dark")');
}

// 导出函数到全局
window.debugTheme = debugTheme;
window.testThemeSwitch = testThemeSwitch;
window.checkCurrentTheme = checkCurrentTheme;
window.checkCSSVariables = checkCSSVariables;

// 自动执行调试
debugTheme();