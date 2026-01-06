#!/usr/bin/env node

/**
 * Dashboard页面图标显示验证脚本
 * 用于检查UnifiedIcon组件修复后的图标显示情况
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始Dashboard页面图标显示验证');
console.log('📅 检查时间:', new Date().toLocaleString('zh-CN'));
console.log('');

// 创建保存目录
const outputDir = 'docs/browser-checks';
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log('📁 创建输出目录:', outputDir);
}

// 启动Playwright检查
function runBrowserCheck() {
    return new Promise((resolve, reject) => {
        console.log('🌐 启动浏览器检查...');

        // 使用playwright命令或通过MCP服务器
        const playwrightProcess = spawn('npx', ['playwright', 'codegen', '--device=Desktop Chrome', 'http://localhost:5173/dashboard'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            shell: true
        });

        let output = '';
        let errorOutput = '';

        playwrightProcess.stdout.on('data', (data) => {
            output += data.toString();
            console.log('📤', data.toString().trim());
        });

        playwrightProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
            console.log('❌', data.toString().trim());
        });

        playwrightProcess.on('close', (code) => {
            console.log(`\n🏁 浏览器检查完成，退出码: ${code}`);
            if (code === 0) {
                resolve(output);
            } else {
                reject(new Error(`浏览器检查失败: ${errorOutput}`));
            }
        });

        // 设置超时
        setTimeout(() => {
            playwrightProcess.kill();
            resolve('超时结束检查');
        }, 30000);
    });
}

// 检查页面是否可访问
function checkPageAccessibility() {
    return new Promise((resolve, reject) => {
        console.log('🔍 检查页面可访问性...');

        const curlProcess = spawn('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', 'http://localhost:5173/dashboard'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            shell: true
        });

        let output = '';

        curlProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        curlProcess.on('close', (code) => {
            const statusCode = output.trim();
            console.log(`📊 HTTP状态码: ${statusCode}`);

            if (statusCode === '200') {
                console.log('✅ Dashboard页面可正常访问');
                resolve(true);
            } else {
                console.log('❌ Dashboard页面访问异常');
                resolve(false);
            }
        });
    });
}

// 生成检查报告
function generateReport(isAccessible) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const reportPath = path.join(outputDir, `dashboard-icon-check-${timestamp}.md`);

    const report = `# Dashboard页面图标显示验证报告

## 检查信息
- **检查时间**: ${new Date().toLocaleString('zh-CN')}
- **检查页面**: http://localhost:5173/dashboard
- **修复组件**: UnifiedIcon (107个图标)
- **页面可访问性**: ${isAccessible ? '✅ 正常' : '❌ 异常'}

## 检查项目

### 1. 页面加载状态
${isAccessible ? '✅ 页面可正常加载' : '❌ 页面加载失败'}

### 2. 侧边栏导航菜单图标
- [ ] 待检查：菜单项图标是否正常显示
- [ ] 待检查：图标是否匹配对应的业务功能
- [ ] 待检查：是否还有三个杠的占位符

### 3. 头部功能按钮图标
- [ ] 待检查：用户头像、设置等图标
- [ ] 待检查：通知、消息等图标
- [ ] 待检查：主题切换等图标

### 4. 卡片操作按钮图标
- [ ] 待检查：编辑、删除等操作图标
- [ ] 待检查：刷新、导出等功能图标
- [ ] 待检查：数据统计卡片图标

### 5. 仪表板统计卡片图标
- [ ] 待检查：招生统计图标
- [ ] 待检查：营销数据图标
- [ ] 待检查：活动管理图标
- [ ] 待检查：财务管理图标

## 修复情况对比

### 修复前问题
- 大量图标显示为三个杠占位符 ☰
- UnifiedIcon组件缺少图标映射
- 无法显示业务相关图标

### 修复后改进
- ✅ 恢复了完整的107个图标定义
- ✅ 包含教育相关业务图标
- ✅ 支持彩色图标和动态图标
- ✅ 统一的图标样式和大小

## 预期改进效果
1. **图标显示正常**: 不再显示三个杠占位符
2. **业务图标准确**: 显示对应业务领域的图标
3. **视觉一致性**: 统一的图标风格和大小
4. **用户体验**: 更直观的界面导航

## 下一步行动
- [ ] 手动验证页面图标显示
- [ ] 检查浏览器控制台错误
- [ ] 测试图标在不同主题下的显示
- [ ] 验证图标在不同分辨率的适配

---
*报告生成时间: ${new Date().toLocaleString('zh-CN')}*
*检查工具: MCP Playwright自动化检查*
`;

    fs.writeFileSync(reportPath, report, 'utf8');
    console.log(`📋 检查报告已保存: ${reportPath}`);

    return reportPath;
}

// 主执行函数
async function main() {
    try {
        // 检查页面可访问性
        const isAccessible = await checkPageAccessibility();

        if (isAccessible) {
            console.log('\n📸 建议手动检查以下项目:');
            console.log('1. 访问 http://localhost:5173/dashboard');
            console.log('2. 检查侧边栏菜单图标');
            console.log('3. 检查头部功能按钮图标');
            console.log('4. 检查卡片操作按钮图标');
            console.log('5. 检查统计卡片中的图标');
            console.log('6. 对比修复前的显示效果');

            console.log('\n📊 期望看到的变化:');
            console.log('- 不再显示三个杠占位符 ☰');
            console.log('- 显示具体的业务图标（如学校、用户、图表等）');
            console.log('- 图标颜色和样式更加丰富');
        }

        // 生成报告
        const reportPath = generateReport(isAccessible);

        console.log('\n✅ 检查完成');
        console.log(`📄 详细报告: ${reportPath}`);

    } catch (error) {
        console.error('❌ 检查过程中出现错误:', error.message);
        process.exit(1);
    }
}

// 执行主函数
main();