#!/usr/bin/env node

/**
 * 按钮测试运行脚本
 * 提供简化的测试运行接口
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

function showUsage() {
    console.log(`
按钮点击测试工具
================

使用方法:
  node run-button-test.cjs [选项]

选项:
  --help, -h     显示帮助信息
  --quick        快速测试模式（只测试前5个页面）
  --full         完整测试模式（测试所有页面）
  --report       只生成上次测试的报告
  --clean        清理测试文件
  --verbose      详细输出模式

示例:
  node run-button-test.cj              # 默认测试模式
  node run-button-test.cj --quick      # 快速测试
  node run-button-test.cj --full       # 完整测试
  node run-button-test.cj --clean      # 清理测试文件

注意:
- 确保前端和后端服务都已启动
- 前端地址: http://localhost:5173
- 后端地址: http://localhost:3000
- 默认登录账号: admin/admin123
`);
}

function checkServices() {
    console.log('检查服务状态...');

    const http = require('http');

    // 检查前端服务
    function checkService(port, name, callback) {
        const req = http.request({
            hostname: 'localhost',
            port: port,
            path: '/',
            method: 'HEAD',
            timeout: 3000
        }, (res) => {
            console.log(`✓ ${name} 服务运行正常 (端口 ${port})`);
            callback(true);
        });

        req.on('error', () => {
            console.log(`✗ ${name} 服务未运行 (端口 ${port})`);
            callback(false);
        });

        req.on('timeout', () => {
            console.log(`✗ ${name} 服务响应超时 (端口 ${port})`);
            callback(false);
        });

        req.end();
    }

    return new Promise((resolve) => {
        let frontendRunning = false;
        let backendRunning = false;

        checkService(5173, '前端', (running) => {
            frontendRunning = running;
            if (frontendRunning && backendRunning) resolve(frontendRunning && backendRunning);
        });

        checkService(3000, '后端', (running) => {
            backendRunning = running;
            if (frontendRunning && backendRunning) resolve(frontendRunning && backendRunning);
        });
    });
}

function cleanTestFiles() {
    console.log('清理测试文件...');

    const dirs = ['./test-screenshots', './test-reports'];
    let cleanedCount = 0;

    dirs.forEach(dir => {
        if (fs.existsSync(dir)) {
            try {
                const files = fs.readdirSync(dir);
                files.forEach(file => {
                    fs.unlinkSync(path.join(dir, file));
                    cleanedCount++;
                });
                console.log(`✓ 清理了 ${files.length} 个文件在 ${dir}`);
            } catch (error) {
                console.log(`✗ 清理 ${dir} 失败: ${error.message}`);
            }
        }
    });

    console.log(`总共清理了 ${cleanedCount} 个测试文件`);
}

async function runTest(mode = 'default', verbose = false) {
    console.log(`启动按钮测试 (模式: ${mode})...`);

    // 检查服务
    const servicesRunning = await checkServices();
    if (!servicesRunning) {
        console.log('\n错误: 请确保前端和后端服务都已启动');
        console.log('启动命令:');
        console.log('  npm run start:all    # 并发启动前后端');
        console.log('  或者分别启动:');
        console.log('    npm run start:frontend   # 前端 (5173端口)');
        console.log('    npm run start:backend    # 后端 (3000端口)');
        process.exit(1);
    }

    // 运行测试
    const args = [path.join(__dirname, 'button-click-tester.cjs')];

    if (mode === 'quick') {
        // 快速模式通过环境变量传递
        process.env.BUTTON_TEST_QUICK = 'true';
        console.log('快速测试模式: 将测试前5个页面');
    } else if (mode === 'full') {
        process.env.BUTTON_TEST_FULL = 'true';
        console.log('完整测试模式: 将测试所有页面');
    }

    if (verbose) {
        args.push('--verbose');
        console.log('详细输出模式已启用');
    }

    const testProcess = spawn('node', args, {
        stdio: 'inherit',
        env: { ...process.env }
    });

    testProcess.on('close', (code) => {
        if (code === 0) {
            console.log('\n✓ 测试完成');

            // 显示测试结果文件
            const reportsDir = './test-reports';
            if (fs.existsSync(reportsDir)) {
                const files = fs.readdirSync(reportsDir);
                const latestReport = files
                    .filter(f => f.endsWith('.md'))
                    .sort()
                    .pop();

                if (latestReport) {
                    console.log(`\n📊 查看测试报告:`);
                    console.log(`   ${path.join(reportsDir, latestReport)}`);
                }
            }
        } else {
            console.log(`\n✗ 测试失败 (退出码: ${code})`);
            process.exit(code);
        }
    });

    testProcess.on('error', (error) => {
        console.log(`\n✗ 测试进程错误: ${error.message}`);
        process.exit(1);
    });
}

function showLatestReport() {
    const reportsDir = './test-reports';

    if (!fs.existsSync(reportsDir)) {
        console.log('未找到测试报告目录');
        return;
    }

    const files = fs.readdirSync(reportsDir);
    const latestReport = files
        .filter(f => f.endsWith('.md'))
        .sort()
        .pop();

    if (latestReport) {
        const reportPath = path.join(reportsDir, latestReport);
        console.log(`显示最新测试报告: ${reportPath}\n`);

        const content = fs.readFileSync(reportPath, 'utf8');
        console.log(content);
    } else {
        console.log('未找到测试报告文件');
    }
}

// 主逻辑
async function main() {
    const args = process.argv.slice(2);

    if (args.includes('--help') || args.includes('-h')) {
        showUsage();
        return;
    }

    if (args.includes('--clean')) {
        cleanTestFiles();
        return;
    }

    if (args.includes('--report')) {
        showLatestReport();
        return;
    }

    let mode = 'default';
    let verbose = false;

    if (args.includes('--quick')) {
        mode = 'quick';
    } else if (args.includes('--full')) {
        mode = 'full';
    }

    if (args.includes('--verbose')) {
        verbose = true;
    }

    await runTest(mode, verbose);
}

// 处理 Ctrl+C
process.on('SIGINT', () => {
    console.log('\n\n测试被用户中断');
    process.exit(0);
});

// 运行主函数
main().catch(error => {
    console.log(`\n✗ 运行错误: ${error.message}`);
    process.exit(1);
});