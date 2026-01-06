// 主题检测功能测试
console.log('🎨 开始测试主题检测功能...\n');

// 模拟DOM环境
const mockDocument = {
    documentElement: {
        classList: {
            contains: function(className) {
                console.log(`   检测 html 元素是否有类名: ${className}`);
                return this.classes.includes(className);
            },
            classes: []
        }
    },
    body: {
        classList: {
            contains: function(className) {
                console.log(`   检测 body 元素是否有类名: ${className}`);
                return this.classes.includes(className);
            },
            classes: []
        }
    }
};

// 模拟主题检测函数
function detectTheme() {
    console.log('🔍 执行主题检测逻辑...');

    const htmlElement = mockDocument.documentElement;
    const bodyElement = mockDocument.body;

    // 检查主题类名
    const hasDarkTheme = htmlElement.classList.contains('theme-dark') ||
                       bodyElement.classList.contains('theme-dark') ||
                       htmlElement.classList.contains('glass-dark') ||
                       bodyElement.classList.contains('glass-dark');

    const theme = hasDarkTheme ? 'dark' : 'light';
    console.log(`   检测结果: ${hasDarkTheme ? '发现暗黑主题' : '使用明亮主题'}`);
    console.log(`✅ 当前主题: ${theme}\n`);

    return theme;
}

// 模拟组件选择函数
function getAnimationComponent(theme) {
    console.log('🎬 选择动画组件...');
    if (theme === 'dark') {
        console.log('   选择 DarkStarfield 组件');
        return 'DarkStarfield';
    } else {
        console.log('   选择 LightRipple 组件');
        return 'LightRipple';
    }
}

// 测试场景
console.log('📋 测试场景 1: 默认明亮主题');
mockDocument.documentElement.classes = [];
mockDocument.body.classes = [];
const theme1 = detectTheme();
const component1 = getAnimationComponent(theme1);

console.log('📋 测试场景 2: 明亮主题类名');
mockDocument.documentElement.classes = ['theme-light'];
mockDocument.body.classes = [];
const theme2 = detectTheme();
const component2 = getAnimationComponent(theme2);

console.log('📋 测试场景 3: 暗黑主题 - html 元素');
mockDocument.documentElement.classes = ['theme-dark'];
mockDocument.body.classes = [];
const theme3 = detectTheme();
const component3 = getAnimationComponent(theme3);

console.log('📋 测试场景 4: 暗黑主题 - body 元素');
mockDocument.documentElement.classes = [];
mockDocument.body.classes = ['theme-dark'];
const theme4 = detectTheme();
const component4 = getAnimationComponent(theme4);

console.log('📋 测试场景 5: 暗黑主题 - glass 暗黑模式');
mockDocument.documentElement.classes = ['glass-dark'];
mockDocument.body.classes = [];
const theme5 = detectTheme();
const component5 = getAnimationComponent(theme5);

console.log('📋 测试场景 6: 混合类名');
mockDocument.documentElement.classes = ['theme-light', 'other-class'];
mockDocument.body.classes = ['another-class'];
const theme6 = detectTheme();
const component6 = getAnimationComponent(theme6);

// 测试总结
console.log('📊 测试结果总结:');
console.log(`   场景1: ${theme1} → ${component1}`);
console.log(`   场景2: ${theme2} → ${component2}`);
console.log(`   场景3: ${theme3} → ${component3}`);
console.log(`   场景4: ${theme4} → ${component4}`);
console.log(`   场景5: ${theme5} → ${component5}`);
console.log(`   场景6: ${theme6} → ${component6}`);

const darkCount = [theme3, theme4, theme5].filter(t => t === 'dark').length;
const lightCount = [theme1, theme2, theme6].filter(t => t === 'light').length;

console.log(`\n✅ 暗黑主题检测: ${darkCount}/3 通过`);
console.log(`✅ 明亮主题检测: ${lightCount}/3 通过`);

if (darkCount === 3 && lightCount === 3) {
    console.log('🎉 所有测试通过！主题检测功能正常工作。');
} else {
    console.log('❌ 部分测试失败，请检查主题检测逻辑。');
}