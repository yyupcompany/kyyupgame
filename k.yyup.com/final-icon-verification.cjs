const { chromium } = require('playwright');

async function finalIconVerification() {
    console.log('🎯 最终验证图标修复效果');
    console.log('📅 检查时间:', new Date().toLocaleString('zh-CN'));

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    try {
        // 访问仪表板并登录
        console.log('📍 访问并登录仪表板...');
        await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });

        if (page.url().includes('login')) {
            await page.fill('input[placeholder*="用户名"]', 'admin');
            await page.fill('input[placeholder*="密码"]', '123456');
            await page.click('button:has-text("登录")');
            await page.waitForTimeout(5000);
        }

        await page.waitForTimeout(3000);

        // 详细检查所有菜单项的图标
        console.log('\n🔍 详细检查所有菜单项图标:');
        const iconVerification = await page.evaluate(() => {
            const menuItems = Array.from(document.querySelectorAll('.nav-item'));

            return menuItems.map((item, index) => {
                const textEl = item.querySelector('.nav-text');
                const svgPathEl = item.querySelector('.nav-icon svg path');
                const unifiedIconEl = item.querySelector('.nav-icon');

                const text = textEl ? textEl.textContent.trim() : '';
                const svgPath = svgPathEl ? svgPathEl.getAttribute('d') : '';
                const iconClasses = unifiedIconEl ? unifiedIconEl.className : '';

                // 根据SVG路径识别图标类型
                let iconType = 'unknown';
                if (svgPath.includes('M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2')) {
                    iconType = 'user';
                } else if (svgPath.includes('M3 3v5h5V3H3zm7 0v5h5V3h-5zm7 0v5h5V3h-5')) {
                    iconType = 'grid';
                } else if (svgPath.includes('M18 20V10M12 20V4M6 20v-6')) {
                    iconType = 'statistics';
                } else if (svgPath.includes('M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z')) {
                    iconType = 'menu';
                } else if (svgPath.includes('M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2')) {
                    iconType = 'calendar';
                } else if (svgPath.includes('M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88')) {
                    iconType = 'enrollment';
                } else if (svgPath.includes('M19 14l-7 7-7-7')) {
                    iconType = 'arrow-left';
                }

                return {
                    index: index + 1,
                    text,
                    svgPath: svgPath.substring(0, 60) + '...',
                    iconType,
                    iconClasses,
                    hasValidIcon: iconType !== 'unknown' && iconType !== 'menu'
                };
            });
        });

        console.log('\n📊 图标验证结果:');
        console.log('=' .repeat(80));

        iconVerification.forEach(item => {
            const status = item.hasValidIcon ? '✅' : '⚠️';
            console.log(`\n${status} 菜单项 ${item.index}: "${item.text}"`);
            console.log(`   图标类型: ${item.iconType}`);
            console.log(`   SVG路径: ${item.svgPath}`);
            console.log(`   有效图标: ${item.hasValidIcon ? '是' : '否'}`);
        });

        // 统计结果
        const totalItems = iconVerification.length;
        const validIcons = iconVerification.filter(item => item.hasValidIcon).length;
        const menuIcons = iconVerification.filter(item => item.iconType === 'menu').length;
        const iconTypes = [...new Set(iconVerification.map(item => item.iconType))];

        console.log('\n📈 修复效果统计:');
        console.log('=' .repeat(50));
        console.log(`   总菜单项: ${totalItems}`);
        console.log(`   有效图标: ${validIcons} (${((validIcons/totalItems)*100).toFixed(1)}%)`);
        console.log(`   仍为menu图标: ${menuIcons} (${((menuIcons/totalItems)*100).toFixed(1)}%)`);
        console.log(`   图标种类: ${iconTypes.length} 种`);

        console.log('\n🎯 图标类型分布:');
        const typeCounts = {};
        iconVerification.forEach(item => {
            typeCounts[item.iconType] = (typeCounts[item.iconType] || 0) + 1;
        });
        Object.entries(typeCounts).forEach(([type, count]) => {
            const percentage = ((count / totalItems) * 100).toFixed(1);
            console.log(`   ${type}: ${count} 个 (${percentage}%)`);
        });

        // 判断修复是否成功
        const successRate = (validIcons / totalItems) * 100;
        console.log('\n🎯 修复结果评估:');
        if (successRate >= 80) {
            console.log('   ✅ 修复成功！大部分图标已正确显示');
        } else if (successRate >= 50) {
            console.log('   🔄 部分修复成功，需要进一步优化');
        } else {
            console.log('   ❌ 修复效果不佳，需要重新检查问题');
        }

        // 截图保存最终结果
        console.log('\n📸 保存最终验证截图...');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T');
        await page.screenshot({
            path: `docs/浏览器检查/final-verification-${timestamp[0]}-${timestamp[1].substring(0, 8)}.png`,
            fullPage: true
        });

        // 生成修复报告
        const reportContent = `# 侧边栏图标修复验证报告

## 检查时间
${new Date().toLocaleString('zh-CN')}

## 修复统计
- 总菜单项: ${totalItems}
- 有效图标: ${validIcons} (${((validIcons/totalItems)*100).toFixed(1)}%)
- 仍为menu图标: ${menuIcons} (${((menuIcons/totalItems)*100).toFixed(1)}%)
- 图标种类: ${iconTypes.length} 种

## 图标类型分布
${Object.entries(typeCounts).map(([type, count]) => {
    const percentage = ((count / totalItems) * 100).toFixed(1);
    return `- ${type}: ${count} 个 (${percentage}%)`;
}).join('\n')}

## 详细结果
${iconVerification.map(item => {
    const status = item.hasValidIcon ? '✅' : '⚠️';
    return `${status} ${item.text} -> ${item.iconType}`;
}).join('\n')}

## 修复结果
${successRate >= 80 ? '✅ 修复成功！大部分图标已正确显示' :
  successRate >= 50 ? '🔄 部分修复成功，需要进一步优化' :
  '❌ 修复效果不佳，需要重新检查问题'}
`;

        const reportPath = `docs/浏览器检查/icon-fix-report-${timestamp[0]}-${timestamp[1].substring(0, 8)}.md`;
        await fs.promises.writeFile(reportPath, reportContent);

        console.log(`\n📋 修复报告已保存: ${reportPath}`);
        console.log('\n✅ 最终验证完成!');
        console.log('⏳ 保持浏览器打开20秒供手动检查...');
        await page.waitForTimeout(20000);

    } catch (error) {
        console.error('❌ 验证出错:', error.message);
    } finally {
        await browser.close();
    }
}

const fs = require('fs');

finalIconVerification();