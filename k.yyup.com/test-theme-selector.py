#!/usr/bin/env python3
"""
主题选择器测试脚本
使用Playwright自动化测试新添加的主题切换功能
"""

import asyncio
from playwright.async_api import async_playwright
import json
import time

async def test_theme_selector():
    """测试主题选择器功能"""
    async with async_playwright() as p:
        # 启动浏览器（无头模式）
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        try:
            print("🌐 访问应用主页...")
            await page.goto("http://localhost:5173")
            await page.wait_for_load_state("networkidle")

            print("📸 截取初始页面...")
            await page.screenshot(path="theme-test-initial.png")

            # 等待页面完全加载
            await asyncio.sleep(2)

            # 查找主题切换器按钮
            theme_button = None
            try:
                theme_button = await page.query_selector('.theme-toggle-btn, [title*="主题"], button:has-text("主题")')
                if not theme_button:
                    # 尝试其他选择器
                    theme_button = await page.query_selector('button[title*="当前主题"]')
                if not theme_button:
                    # 查找包含图标的所有圆形按钮
                    buttons = await page.query_selector_all('button.el-button--circle')
                    print(f"找到 {len(buttons)} 个圆形按钮")

                    for btn in buttons:
                        title = await btn.get_attribute('title')
                        if title and ('主题' in title or 'theme' in title.lower()):
                            theme_button = btn
                            break
            except Exception as e:
                print(f"查找主题按钮时出错: {e}")

            if theme_button:
                print("✅ 找到主题切换器按钮")
                print(f"按钮标题: {await theme_button.get_attribute('title')}")

                # 点击主题切换器
                print("🖱️ 点击主题切换器...")
                await theme_button.click()
                await asyncio.sleep(1)

                # 截取下拉菜单
                await page.screenshot(path="theme-test-dropdown.png")

                # 查找主题选项
                theme_options = await page.query_selector_all('.theme-option, .el-dropdown-item')
                print(f"📋 找到 {len(theme_options)} 个主题选项")

                # 测试每个主题选项
                theme_names = []
                for i, option in enumerate(theme_options):
                    try:
                        # 获取主题名称
                        text = await option.text_content()
                        if text:
                            theme_names.append(text.strip())
                            print(f"   {i+1}. {text.strip()}")

                        # 点击前5个主题选项进行测试
                        if i < 5:
                            print(f"🎨 测试切换到主题: {text.strip() if text else f'选项{i+1}'}")

                            # 点击主题选项
                            await option.click()
                            await asyncio.sleep(2)  # 等待主题应用

                            # 截图保存
                            filename = f"theme-test-{i+1}.png"
                            await page.screenshot(path=filename)
                            print(f"   📸 已保存截图: {filename}")

                            # 重新打开下拉菜单
                            await theme_button.click()
                            await asyncio.sleep(1)
                    except Exception as e:
                        print(f"   ⚠️ 测试选项 {i+1} 时出错: {e}")

                # 输出找到的主题
                print(f"\n🎨 发现的主题选项:")
                for name in theme_names:
                    print(f"   - {name}")

                # 检查是否包含新添加的主题
                expected_themes = ['赛博朋克', '自然森林', '深海海洋', '夕阳余晖', '午夜星空']
                new_themes_found = [name for name in theme_names if any(theme in name for theme in expected_themes)]

                if new_themes_found:
                    print(f"\n✅ 发现新添加的主题:")
                    for theme in new_themes_found:
                        print(f"   🎉 {theme}")
                else:
                    print(f"\n⚠️ 未发现新添加的主题")
                    print(f"期望的主题: {expected_themes}")
                    print(f"实际找到的主题: {theme_names}")

            else:
                print("❌ 未找到主题切换器按钮")

                # 尝试截图帮助调试
                await page.screenshot(path="theme-test-debug.png")
                print("📸 已保存调试截图: theme-test-debug.png")

                # 输出页面上所有按钮
                buttons = await page.query_selector_all('button')
                print(f"页面上共有 {len(buttons)} 个按钮:")
                for i, btn in enumerate(buttons[:10]):  # 只显示前10个
                    try:
                        text = await btn.text_content()
                        title = await btn.get_attribute('title')
                        classes = await btn.get_attribute('class')
                        print(f"   按钮{i+1}: text='{text}', title='{title}', class='{classes}'")
                    except:
                        print(f"   按钮{i+1}: 无法获取信息")

        except Exception as e:
            print(f"❌ 测试过程中出错: {e}")
            await page.screenshot(path="theme-test-error.png")

        finally:
            await browser.close()

if __name__ == "__main__":
    print("🚀 开始主题选择器测试...")
    asyncio.run(test_theme_selector())
    print("✅ 测试完成")