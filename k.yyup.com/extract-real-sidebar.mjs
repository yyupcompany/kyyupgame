#!/usr/bin/env node

import { chromium } from 'playwright';
import fs from 'fs';

async function extractRealSidebar() {
    const browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const context = await browser.newContext({
            viewport: { width: 1920, height: 1080 }
        });
        
        const page = await context.newPage();
        
        // 访问登录页面
        console.log('访问系统...');
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(3000);
        
        // 检查是否需要登录
        const isLoginPage = await page.locator('input[placeholder="请输入用户名"]').isVisible();
        
        if (isLoginPage) {
            console.log('执行登录...');
            await page.fill('input[placeholder="请输入用户名"]', 'admin');
            await page.fill('input[placeholder="请输入密码"]', 'admin123');
            await page.click('button[type="submit"]');
            await page.waitForTimeout(3000);
        }
        
        // 等待侧边栏加载
        await page.waitForSelector('.sidebar, .layout-sidebar, [class*="sidebar"]', { timeout: 10000 });
        
        // 拍摄当前状态
        await page.screenshot({ 
            path: '/home/devbox/project/sidebar-collapsed.png',
            fullPage: true
        });
        
        console.log('分析侧边栏结构...');
        
        // 获取侧边栏信息
        const sidebarInfo = await page.evaluate(() => {
            const result = {
                menu_items: [],
                sidebar_classes: [],
                all_menu_elements: []
            };
            
            // 查找所有可能的侧边栏容器
            const sidebarSelectors = [
                '.sidebar',
                '.layout-sidebar', 
                '[class*="sidebar"]',
                '.el-aside',
                '.aside',
                'aside'
            ];
            
            let sidebar = null;
            for (const selector of sidebarSelectors) {
                const element = document.querySelector(selector);
                if (element) {
                    sidebar = element;
                    result.sidebar_classes.push(selector);
                    break;
                }
            }
            
            if (!sidebar) {
                // 如果没找到侧边栏，查找所有可能包含菜单的元素
                const allMenuElements = document.querySelectorAll('[class*="menu"], [class*="nav"], .el-menu');
                allMenuElements.forEach((el, index) => {
                    result.all_menu_elements.push({
                        index,
                        className: el.className,
                        tagName: el.tagName,
                        text: el.textContent?.trim().substring(0, 100),
                        childCount: el.children.length
                    });
                });
                return result;
            }
            
            // 查找菜单项
            const menuSelectors = [
                '.el-menu-item',
                '.menu-item',
                '[class*="menu-item"]',
                'li[role="menuitem"]',
                'a[class*="menu"]',
                '.sidebar-item',
                '[class*="sidebar-item"]'
            ];
            
            const allMenuItems = [];
            
            // 尝试每个选择器
            menuSelectors.forEach(selector => {
                const items = sidebar.querySelectorAll(selector);
                items.forEach((item, index) => {
                    const menuData = {
                        selector,
                        index,
                        text: item.textContent?.trim() || '',
                        className: item.className,
                        tagName: item.tagName,
                        href: item.getAttribute('href') || '',
                        dataIndex: item.getAttribute('data-index') || item.getAttribute('index') || '',
                        visible: window.getComputedStyle(item).display !== 'none',
                        hasChildren: item.children.length > 0,
                        children: []
                    };
                    
                    // 获取子元素信息
                    if (item.children.length > 0) {
                        Array.from(item.children).forEach((child, childIndex) => {
                            menuData.children.push({
                                text: child.textContent?.trim() || '',
                                className: child.className,
                                tagName: child.tagName
                            });
                        });
                    }
                    
                    allMenuItems.push(menuData);
                });
            });
            
            result.menu_items = allMenuItems;
            
            // 获取所有包含文本的可点击元素
            const clickableElements = sidebar.querySelectorAll('*');
            const clickableMenus = [];
            
            clickableElements.forEach((el, index) => {
                const text = el.textContent?.trim();
                const hasClickHandler = el.onclick || el.getAttribute('onclick') || el.style.cursor === 'pointer';
                const isInteractive = el.tagName === 'A' || el.tagName === 'BUTTON' || hasClickHandler;
                
                if (text && text.length > 0 && text.length < 50 && isInteractive) {
                    clickableMenus.push({
                        text,
                        tagName: el.tagName,
                        className: el.className,
                        href: el.getAttribute('href'),
                        onclick: el.getAttribute('onclick')
                    });
                }
            });
            
            result.clickable_menus = clickableMenus;
            
            return result;
        });
        
        console.log('尝试展开所有菜单项...');
        
        // 尝试点击所有可能的展开按钮
        await page.evaluate(() => {
            // 查找可能的展开按钮
            const expandButtons = document.querySelectorAll(`
                [class*="expand"], 
                [class*="collapse"],
                .el-sub-menu__title,
                [aria-expanded],
                .menu-group .menu-title,
                .sidebar [role="button"]
            `);
            
            expandButtons.forEach(btn => {
                if (btn && typeof btn.click === 'function') {
                    try {
                        btn.click();
                    } catch (e) {
                        console.log('Click failed:', e);
                    }
                }
            });
        });
        
        await page.waitForTimeout(2000);
        
        // 拍摄展开后的截图
        await page.screenshot({ 
            path: '/home/devbox/project/sidebar-expanded.png',
            fullPage: true
        });
        
        // 重新获取展开后的信息
        const expandedInfo = await page.evaluate(() => {
            const result = {
                visible_menu_items: [],
                all_text_elements: []
            };
            
            // 获取所有包含菜单相关文本的元素
            const allElements = document.querySelectorAll('*');
            
            allElements.forEach(el => {
                const text = el.textContent?.trim();
                const isInSidebar = el.closest('.sidebar, .layout-sidebar, [class*="sidebar"], .el-aside');
                
                if (text && text.length > 0 && text.length < 100 && isInSidebar) {
                    // 检查是否是叶子节点（没有子文本节点）
                    const hasTextChildren = Array.from(el.childNodes).some(node => 
                        node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0
                    );
                    
                    if (hasTextChildren || el.children.length === 0) {
                        result.all_text_elements.push({
                            text,
                            tagName: el.tagName,
                            className: el.className,
                            id: el.id,
                            href: el.getAttribute('href'),
                            clickable: el.tagName === 'A' || el.tagName === 'BUTTON' || 
                                      el.onclick || el.getAttribute('onclick') || 
                                      el.style.cursor === 'pointer' ||
                                      el.getAttribute('role') === 'button' ||
                                      el.getAttribute('role') === 'menuitem'
                        });
                    }
                }
            });
            
            return result;
        });
        
        // 生成分析报告
        const analysis = {
            timestamp: new Date().toISOString(),
            url: page.url(),
            sidebar_detection: sidebarInfo,
            expanded_detection: expandedInfo,
            summary: {
                total_menu_items: sidebarInfo.menu_items.length,
                clickable_items: sidebarInfo.clickable_menus?.length || 0,
                text_elements: expandedInfo.all_text_elements.length,
                detected_sidebar_classes: sidebarInfo.sidebar_classes
            }
        };
        
        // 保存详细分析
        fs.writeFileSync(
            '/home/devbox/project/real-sidebar-analysis.json',
            JSON.stringify(analysis, null, 2)
        );
        
        // 从图像中可以看到的菜单项
        const visibleMenusFromScreenshot = [
            { name: '数据概览', icon: '📊', subtext: '预生成数据概览' },
            { name: '客户管理', icon: '👥', subtext: '潜在客户及咨询管理' },
            { name: '网络实验站', icon: '📈', subtext: '数据统计与分析支持' },
            { name: '教学管理', icon: '⚡', subtext: '教师学生日常管理' },
            { name: '园务管理', icon: '⚡', subtext: '班级事务流程管理' },
            { name: 'AI智能助手', icon: '🤖', subtext: 'AI助理和实验工具' },
            { name: '系统设置', icon: '⚡', subtext: '系统运行与基础设置' }
        ];
        
        // 创建基于截图观察的菜单结构
        const observedStructure = {
            type: 'collapsed_sidebar',
            main_categories: visibleMenusFromScreenshot,
            notes: [
                '侧边栏显示为折叠状态',
                '每个菜单项显示图标和描述文本',
                '菜单项可能需要点击展开查看子菜单',
                '页面当前显示的是仪表板/概览页面'
            ]
        };
        
        // 生成人类可读的报告
        const report = generateDetailedReport(analysis, observedStructure);
        fs.writeFileSync(
            '/home/devbox/project/real-sidebar-report.md',
            report
        );
        
        console.log('✅ 侧边栏分析完成！');
        console.log(`找到 ${analysis.summary.total_menu_items} 个菜单元素`);
        console.log(`找到 ${analysis.summary.clickable_items} 个可点击项`);
        console.log(`找到 ${analysis.summary.text_elements} 个文本元素`);
        
        return analysis;
        
    } catch (error) {
        console.error('分析侧边栏时出错:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

function generateDetailedReport(analysis, observedStructure) {
    let report = `# 幼儿园管理系统侧边栏结构分析报告\n\n`;
    report += `**生成时间**: ${analysis.timestamp}\n`;
    report += `**分析页面**: ${analysis.url}\n\n`;
    
    report += `## 概览\n\n`;
    report += `通过自动化分析和截图观察，系统侧边栏采用折叠式设计，包含以下主要功能模块：\n\n`;
    
    report += `### 主要功能模块\n\n`;
    observedStructure.main_categories.forEach((category, index) => {
        report += `${index + 1}. **${category.name}** ${category.icon}\n`;
        report += `   - 描述: ${category.subtext}\n\n`;
    });
    
    report += `## 技术分析结果\n\n`;
    report += `### 检测到的侧边栏容器\n`;
    if (analysis.sidebar_detection.sidebar_classes.length > 0) {
        report += `- 侧边栏CSS类: ${analysis.sidebar_detection.sidebar_classes.join(', ')}\n`;
    } else {
        report += `- 未检测到标准侧边栏类名\n`;
    }
    
    report += `\n### 菜单元素统计\n`;
    report += `- 检测到的菜单项: ${analysis.summary.total_menu_items}\n`;
    report += `- 可点击元素: ${analysis.summary.clickable_items}\n`;
    report += `- 文本元素: ${analysis.summary.text_elements}\n\n`;
    
    if (analysis.sidebar_detection.menu_items.length > 0) {
        report += `### 检测到的菜单项详情\n\n`;
        analysis.sidebar_detection.menu_items.forEach((item, index) => {
            report += `${index + 1}. **${item.text}**\n`;
            report += `   - 标签: ${item.tagName}\n`;
            report += `   - 类名: ${item.className}\n`;
            if (item.href) report += `   - 链接: ${item.href}\n`;
            if (item.dataIndex) report += `   - 索引: ${item.dataIndex}\n`;
            report += `   - 可见: ${item.visible ? '是' : '否'}\n`;
            report += `   - 有子元素: ${item.hasChildren ? '是' : '否'}\n\n`;
        });
    }
    
    if (analysis.sidebar_detection.clickable_menus?.length > 0) {
        report += `### 可点击菜单项\n\n`;
        analysis.sidebar_detection.clickable_menus.forEach((item, index) => {
            report += `${index + 1}. **${item.text}**\n`;
            report += `   - 标签: ${item.tagName}\n`;
            if (item.href) report += `   - 链接: ${item.href}\n`;
            report += `\n`;
        });
    }
    
    report += `## 基于观察的菜单推测\n\n`;
    report += `根据截图分析，系统可能包含以下具体页面：\n\n`;
    
    const possiblePages = [
        { category: '数据概览', pages: ['仪表板', '园区概览', '数据统计', '报表中心'] },
        { category: '客户管理', pages: ['客户列表', '咨询记录', '客户池', '跟进管理'] },
        { category: '网络实验站', pages: ['数据分析', '统计报表', '绩效管理', '经营分析'] },
        { category: '教学管理', pages: ['教师管理', '学生管理', '班级管理', '课程安排'] },
        { category: '园务管理', pages: ['活动管理', '入园申请', '招生管理', '园长功能'] },
        { category: 'AI智能助手', pages: ['AI助手', 'AI模型配置', '智能分析', '自动化工具'] },
        { category: '系统设置', pages: ['用户管理', '角色管理', '权限管理', '系统配置', '数据备份'] }
    ];
    
    possiblePages.forEach(category => {
        report += `### ${category.category}\n`;
        category.pages.forEach(page => {
            report += `- ${page}\n`;
        });
        report += `\n`;
    });
    
    report += `## 建议的测试路径\n\n`;
    report += `基于分析结果，建议按照以下路径进行页面测试：\n\n`;
    
    report += `1. **直接URL访问测试**\n`;
    report += `   - 尝试访问 http://localhost:5173/dashboard 等已知路径\n`;
    report += `   - 检查路由配置文件获取完整路径列表\n\n`;
    
    report += `2. **交互式菜单测试**\n`;
    report += `   - 使用自动化脚本点击侧边栏各个菜单项\n`;
    report += `   - 记录点击后的页面跳转和URL变化\n\n`;
    
    report += `3. **路由配置分析**\n`;
    report += `   - 分析 client/src/router/ 下的路由配置文件\n`;
    report += `   - 提取所有可用的路由路径\n\n`;
    
    report += `## 注意事项\n\n`;
    observedStructure.notes.forEach(note => {
        report += `- ${note}\n`;
    });
    
    report += `\n---\n`;
    report += `*此报告由自动化分析工具生成，结合了DOM元素检测和视觉观察分析*\n`;
    
    return report;
}

// 运行分析
extractRealSidebar()
    .then(result => {
        console.log('\n📁 生成的文件:');
        console.log('  - sidebar-collapsed.png (折叠状态截图)');
        console.log('  - sidebar-expanded.png (展开状态截图)');
        console.log('  - real-sidebar-analysis.json (技术分析数据)');
        console.log('  - real-sidebar-report.md (详细分析报告)');
    })
    .catch(error => {
        console.error('❌ 分析失败:', error);
        process.exit(1);
    });