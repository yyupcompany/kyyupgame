#!/usr/bin/env node

/**
 * Playwright 自动登录和页面修复演示
 * 这个脚本展示了如何使用Playwright完全模拟用户操作
 * 比编写脚本效率高太多！
 */

import { chromium } from 'playwright';
import fs from 'fs';

class PlaywrightAutoFixer {
    constructor() {
        this.browser = null;
        this.page = null;
        this.baseUrl = 'http://localhost:5173';
        this.apiUrl = 'http://localhost:3000';
    }

    async init() {
        console.log('🚀 启动Playwright浏览器...');
        this.browser = await chromium.launch({ 
            headless: false,  // 显示浏览器界面，方便调试
            slowMo: 1000      // 减慢操作速度，方便观察
        });
        this.page = await this.browser.newPage();
        
        // 设置视口大小
        await this.page.setViewportSize({ width: 1920, height: 1080 });
        
        console.log('✅ 浏览器启动成功');
    }

    async autoLogin() {
        console.log('🔐 开始自动登录...');
        
        try {
            // 访问登录页面
            await this.page.goto(`${this.baseUrl}/login`);
            await this.page.waitForLoadState('networkidle');
            
            // 等待登录表单加载
            await this.page.waitForSelector('input[type="text"], input[type="email"]', { timeout: 10000 });
            
            // 填写用户名（管理员账号）
            const usernameInput = await this.page.locator('input[type="text"], input[type="email"]').first();
            await usernameInput.fill('admin');
            
            // 填写密码
            const passwordInput = await this.page.locator('input[type="password"]');
            await passwordInput.fill('123456');
            
            // 点击登录按钮
            const loginButton = await this.page.locator('button[type="submit"], button:has-text("登录")').first();
            await loginButton.click();
            
            // 等待登录成功，跳转到仪表板
            await this.page.waitForURL('**/dashboard', { timeout: 15000 });
            
            console.log('✅ 自动登录成功！');
            return true;
            
        } catch (error) {
            console.error('❌ 自动登录失败:', error.message);
            return false;
        }
    }

    async navigateToPage(pagePath) {
        console.log(`🧭 导航到页面: ${pagePath}`);
        
        try {
            await this.page.goto(`${this.baseUrl}${pagePath}`);
            await this.page.waitForLoadState('networkidle');
            
            // 等待页面内容加载
            await this.page.waitForTimeout(2000);
            
            console.log(`✅ 成功导航到: ${pagePath}`);
            return true;
            
        } catch (error) {
            console.error(`❌ 导航失败: ${error.message}`);
            return false;
        }
    }

    async checkPageProblems() {
        console.log('🔍 检查页面问题...');
        
        const problems = [];
        
        try {
            // 检查控制台错误
            const consoleErrors = [];
            this.page.on('console', msg => {
                if (msg.type() === 'error') {
                    consoleErrors.push(msg.text());
                }
            });
            
            // 检查网络错误
            const networkErrors = [];
            this.page.on('response', response => {
                if (response.status() >= 400) {
                    networkErrors.push(`${response.status()} - ${response.url()}`);
                }
            });
            
            // 检查是否有空白内容
            const emptyElements = await this.page.locator('[data-testid*="empty"], .empty-state, .no-data').count();
            if (emptyElements > 0) {
                problems.push(`发现 ${emptyElements} 个空白内容区域`);
            }
            
            // 检查是否有硬编码数据
            const hardcodedData = await this.page.locator('text=/测试数据|示例|demo|test/i').count();
            if (hardcodedData > 0) {
                problems.push(`发现 ${hardcodedData} 个可能的硬编码数据`);
            }
            
            // 检查是否有加载状态
            const loadingElements = await this.page.locator('.loading, [loading], .el-loading').count();
            if (loadingElements === 0) {
                problems.push('缺少加载状态指示器');
            }
            
            // 检查是否有错误处理
            const errorElements = await this.page.locator('.error, .el-alert--error, [role="alert"]').count();
            if (errorElements === 0) {
                problems.push('缺少错误处理界面');
            }
            
            console.log(`🔍 检查完成，发现 ${problems.length} 个问题:`);
            problems.forEach((problem, index) => {
                console.log(`  ${index + 1}. ${problem}`);
            });
            
            return problems;
            
        } catch (error) {
            console.error('❌ 页面检查失败:', error.message);
            return ['页面检查过程中出现错误'];
        }
    }

    async simulateUserInteractions() {
        console.log('👆 模拟用户交互...');
        
        try {
            // 模拟点击各种按钮和链接
            const buttons = await this.page.locator('button, .el-button').all();
            for (let i = 0; i < Math.min(buttons.length, 3); i++) {
                try {
                    await buttons[i].click();
                    await this.page.waitForTimeout(1000);
                    console.log(`✅ 点击按钮 ${i + 1}`);
                } catch (e) {
                    console.log(`⚠️ 按钮 ${i + 1} 点击失败: ${e.message}`);
                }
            }
            
            // 模拟填写表单
            const inputs = await this.page.locator('input[type="text"], input[type="search"], .el-input__inner').all();
            for (let i = 0; i < Math.min(inputs.length, 2); i++) {
                try {
                    await inputs[i].fill('测试数据');
                    await this.page.waitForTimeout(500);
                    console.log(`✅ 填写输入框 ${i + 1}`);
                } catch (e) {
                    console.log(`⚠️ 输入框 ${i + 1} 填写失败: ${e.message}`);
                }
            }
            
            // 模拟滚动页面
            await this.page.evaluate(() => {
                window.scrollTo(0, document.body.scrollHeight / 2);
            });
            await this.page.waitForTimeout(1000);
            
            console.log('✅ 用户交互模拟完成');
            
        } catch (error) {
            console.error('❌ 用户交互模拟失败:', error.message);
        }
    }

    async takeScreenshot(filename) {
        try {
            await this.page.screenshot({ 
                path: `screenshots/${filename}`,
                fullPage: true 
            });
            console.log(`📸 截图保存: screenshots/${filename}`);
        } catch (error) {
            console.error('❌ 截图失败:', error.message);
        }
    }

    async testPageFlow() {
        console.log('🧪 开始页面流程测试...');
        
        const testPages = [
            '/ai/memory',
            '/principal/activity',
            '/dashboard'
        ];
        
        for (const pagePath of testPages) {
            console.log(`\n📄 测试页面: ${pagePath}`);
            
            // 导航到页面
            const navigated = await this.navigateToPage(pagePath);
            if (!navigated) continue;
            
            // 截图
            const filename = `${pagePath.replace(/\//g, '_')}_${Date.now()}.png`;
            await this.takeScreenshot(filename);
            
            // 检查问题
            const problems = await this.checkPageProblems();
            
            // 模拟用户交互
            await this.simulateUserInteractions();
            
            // 等待一段时间观察页面变化
            await this.page.waitForTimeout(3000);
            
            console.log(`✅ 页面 ${pagePath} 测试完成\n`);
        }
    }

    async generateReport() {
        console.log('📊 生成测试报告...');
        
        const report = {
            timestamp: new Date().toISOString(),
            baseUrl: this.baseUrl,
            testResults: [],
            summary: {
                totalPages: 0,
                passedPages: 0,
                failedPages: 0,
                issues: []
            }
        };
        
        // 这里可以添加更详细的报告生成逻辑
        
        console.log('✅ 测试报告生成完成');
        return report;
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
            console.log('🧹 浏览器已关闭');
        }
    }
}

// 主执行函数
async function main() {
    const fixer = new PlaywrightAutoFixer();
    
    try {
        // 创建截图目录
        if (!fs.existsSync('screenshots')) {
            fs.mkdirSync('screenshots');
        }
        
        // 初始化
        await fixer.init();
        
        // 自动登录
        const loginSuccess = await fixer.autoLogin();
        if (!loginSuccess) {
            console.error('❌ 登录失败，无法继续测试');
            return;
        }
        
        // 执行页面流程测试
        await fixer.testPageFlow();
        
        // 生成报告
        await fixer.generateReport();
        
        console.log('🎉 自动化测试完成！');
        
    } catch (error) {
        console.error('❌ 执行失败:', error);
    } finally {
        await fixer.cleanup();
    }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export default PlaywrightAutoFixer;
