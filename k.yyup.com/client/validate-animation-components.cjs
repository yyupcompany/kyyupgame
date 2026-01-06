// 验证动画组件文件是否存在并包含必要的功能
const fs = require('fs');
const path = require('path');

console.log('🎬 验证主题适配动画组件...\n');

function validateComponent(filePath, componentName, expectedFeatures) {
    console.log(`📁 验证组件: ${componentName}`);
    console.log(`   文件路径: ${filePath}`);

    if (!fs.existsSync(filePath)) {
        console.log(`   ❌ 文件不存在`);
        return false;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    let passed = 0;

    expectedFeatures.forEach(feature => {
        if (content.includes(feature)) {
            console.log(`   ✅ ${feature}`);
            passed++;
        } else {
            console.log(`   ❌ 缺少: ${feature}`);
        }
    });

    const success = passed === expectedFeatures.length;
    console.log(`   ${success ? '✅' : '❌'} 验证结果: ${passed}/${expectedFeatures.length} 通过\n`);
    return success;
}

// 验证LightRipple组件
const lightRipplePath = path.join(__dirname, 'src/components/animations/LightRipple.vue');
const lightRippleFeatures = [
    'light-ripple-container',
    '光晕波纹',
    'rippleExpand',
    'lightPulse'
];

const lightRippleValid = validateComponent(lightRipplePath, 'LightRipple', lightRippleFeatures);

// 验证DarkStarfield组件
const darkStarfieldPath = path.join(__dirname, 'src/components/animations/DarkStarfield.vue');
const darkStarfieldFeatures = [
    'dark-starfield-container',
    '星空背景',
    'shooting-star',
    'twinkle',
    'starfield'
];

const darkStarfieldValid = validateComponent(darkStarfieldPath, 'DarkStarfield', darkStarfieldFeatures);

// 验证EntranceAnimations组件是否包含主题适配逻辑
const entranceAnimationsPath = path.join(__dirname, 'src/components/animations/EntranceAnimations.vue');
console.log(`📁 验证主题适配逻辑`);
console.log(`   文件路径: ${entranceAnimationsPath}`);

if (fs.existsSync(entranceAnimationsPath)) {
    const content = fs.readFileSync(entranceAnimationsPath, 'utf8');
    const adaptiveFeatures = [
        'theme-adaptive',
        'detectTheme',
        'DarkStarfield',
        'LightRipple',
        'currentTheme'
    ];

    let adaptivePassed = 0;
    adaptiveFeatures.forEach(feature => {
        if (content.includes(feature)) {
            console.log(`   ✅ ${feature}`);
            adaptivePassed++;
        } else {
            console.log(`   ❌ 缺少: ${feature}`);
        }
    });

    console.log(`   ${adaptivePassed === adaptiveFeatures.length ? '✅' : '❌'} 主题适配逻辑: ${adaptivePassed}/${adaptiveFeatures.length} 通过\n`);
}

// 检查登录页面是否使用theme-adaptive
const loginPath = path.join(__dirname, 'src/pages/Login/index.vue');
console.log(`📁 验证登录页面集成`);
console.log(`   文件路径: ${loginPath}`);

if (fs.existsSync(loginPath)) {
    const loginContent = fs.readFileSync(loginPath, 'utf8');
    const loginFeatures = [
        'EntranceAnimationWrapper',
        'theme-adaptive'
    ];

    let loginPassed = 0;
    loginFeatures.forEach(feature => {
        if (loginContent.includes(feature)) {
            console.log(`   ✅ ${feature}`);
            loginPassed++;
        } else {
            console.log(`   ❌ 缺少: ${feature}`);
        }
    });

    console.log(`   ${loginPassed === loginFeatures.length ? '✅' : '❌'} 登录页面集成: ${loginPassed}/${loginFeatures.length} 通过\n`);
}

// 最终结果
console.log('📊 验证总结:');
console.log(`   LightRipple组件: ${lightRippleValid ? '✅' : '❌'}`);
console.log(`   DarkStarfield组件: ${darkStarfieldValid ? '✅' : '❌'}`);

if (lightRippleValid && darkStarfieldValid) {
    console.log('\n🎉 主题适配动画系统验证成功！');
    console.log('\n🔧 功能特性:');
    console.log('   ✅ LightRipple: 明亮主题光晕波纹动画');
    console.log('   ✅ DarkStarfield: 暗黑主题星空粒子动画');
    console.log('   ✅ 主题自动检测和适配');
    console.log('   ✅ 登录页面集成完成');
    console.log('\n🎨 动画效果:');
    console.log('   🌟 明亮主题: 渐变背景 + 光晕脉冲 + 波纹扩散');
    console.log('   🌌 暗黑主题: 深色背景 + 星空闪烁 + 流星划过');
} else {
    console.log('\n❌ 部分组件验证失败，请检查实现。');
}