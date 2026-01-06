#!/usr/bin/env python3
"""
真实浏览器AI助手运行时测试
使用Selenium WebDriver进行真实DOM交互和JavaScript执行测试
"""

import time
import json
import logging
from datetime import datetime
from typing import List, Dict, Any
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'/home/devbox/project/client/tests/selenium/ai-test-{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class AIAssistantBrowserTest:
    def __init__(self, base_url: str = "https://k.yyup.cc"):
        self.base_url = base_url
        self.driver = None
        self.wait = None
        self.console_logs = []
        self.network_logs = []
        self.errors = []
        
    def setup_driver(self):
        """设置Chrome驱动器配置"""
        chrome_options = Options()
        # 添加必要的Chrome选项
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('--disable-extensions')
        chrome_options.add_argument('--disable-web-security')
        chrome_options.add_argument('--allow-running-insecure-content')
        
        # 启用控制台日志收集
        chrome_options.add_argument('--enable-logging')
        chrome_options.add_argument('--v=1')
        
        # 启用网络日志
        chrome_options.set_capability('goog:loggingPrefs', {
            'browser': 'ALL',
            'performance': 'ALL'
        })
        
        try:
            self.driver = webdriver.Chrome(options=chrome_options)
            self.wait = WebDriverWait(self.driver, 10)
            logger.info("✅ Chrome驱动器启动成功")
            return True
        except Exception as e:
            logger.error(f"❌ Chrome驱动器启动失败: {e}")
            return False
    
    def collect_console_logs(self):
        """收集浏览器控制台日志"""
        try:
            logs = self.driver.get_log('browser')
            for log in logs:
                if log not in self.console_logs:
                    self.console_logs.append(log)
                    level = log['level']
                    message = log['message']
                    
                    if level in ['SEVERE', 'ERROR']:
                        logger.error(f"🔥 Console Error: {message}")
                        self.errors.append({
                            'type': 'console_error',
                            'level': level,
                            'message': message,
                            'timestamp': log['timestamp']
                        })
                    elif level == 'WARNING':
                        logger.warning(f"⚠️ Console Warning: {message}")
        except Exception as e:
            logger.error(f"❌ 收集控制台日志失败: {e}")
    
    def collect_network_logs(self):
        """收集网络日志"""
        try:
            perf_logs = self.driver.get_log('performance')
            for log in perf_logs:
                log_message = json.loads(log['message'])
                if log_message['message']['method'] in ['Network.responseReceived', 'Network.requestWillBeSent']:
                    self.network_logs.append(log_message)
        except Exception as e:
            logger.error(f"❌ 收集网络日志失败: {e}")
    
    def navigate_to_ai_page(self):
        """导航到AI助手页面"""
        try:
            logger.info("🌐 正在导航到AI助手页面...")
            
            # 首先访问主页
            self.driver.get(self.base_url)
            self.collect_console_logs()
            
            # 等待页面加载
            self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
            
            # 检查是否需要登录
            if self.check_login_required():
                self.perform_mock_login()
            
            # 查找AI助手菜单项
            ai_menu_selectors = [
                'a[href*="/ai"]',
                'a[href="/ai/assistant"]',
                '.sidebar-menu a:contains("AI助手")',
                '.el-menu-item:contains("AI助手")',
                '[data-testid="ai-assistant-menu"]'
            ]
            
            ai_menu = None
            for selector in ai_menu_selectors:
                try:
                    if ':contains(' in selector:
                        # 使用XPath处理contains文本
                        xpath = f"//a[contains(text(), 'AI助手')]"
                        ai_menu = self.driver.find_element(By.XPATH, xpath)
                    else:
                        ai_menu = self.driver.find_element(By.CSS_SELECTOR, selector)
                    
                    if ai_menu:
                        logger.info(f"✅ 找到AI助手菜单: {selector}")
                        break
                except NoSuchElementException:
                    continue
            
            if ai_menu:
                # 滚动到元素位置
                self.driver.execute_script("arguments[0].scrollIntoView(true);", ai_menu)
                time.sleep(0.5)
                
                # 点击AI助手菜单
                ai_menu.click()
                logger.info("🖱️ 点击AI助手菜单")
                
                # 等待页面加载
                time.sleep(2)
                self.collect_console_logs()
                
                return True
            else:
                # 直接导航到AI页面
                ai_url = f"{self.base_url}/ai/assistant"
                logger.info(f"🔄 直接导航到: {ai_url}")
                self.driver.get(ai_url)
                time.sleep(2)
                self.collect_console_logs()
                
                return True
                
        except Exception as e:
            logger.error(f"❌ 导航到AI助手页面失败: {e}")
            self.errors.append({
                'type': 'navigation_error',
                'message': str(e),
                'timestamp': time.time()
            })
            return False
    
    def check_login_required(self):
        """检查是否需要登录"""
        try:
            # 检查登录页面指示器
            login_indicators = [
                '.login-form',
                '.login-container',
                'input[type="password"]',
                'button:contains("登录")',
                'a[href="/login"]'
            ]
            
            for indicator in login_indicators:
                try:
                    if ':contains(' in indicator:
                        xpath = f"//button[contains(text(), '登录')]"
                        self.driver.find_element(By.XPATH, xpath)
                    else:
                        self.driver.find_element(By.CSS_SELECTOR, indicator)
                    logger.info("🔒 检测到需要登录")
                    return True
                except NoSuchElementException:
                    continue
            
            return False
        except Exception as e:
            logger.error(f"❌ 检查登录状态失败: {e}")
            return False
    
    def perform_mock_login(self):
        """执行模拟登录"""
        try:
            logger.info("🔑 执行模拟登录...")
            
            # 查找用户名和密码输入框
            username_selectors = ['input[name="username"]', 'input[type="text"]', '#username']
            password_selectors = ['input[name="password"]', 'input[type="password"]', '#password']
            
            username_input = None
            password_input = None
            
            for selector in username_selectors:
                try:
                    username_input = self.driver.find_element(By.CSS_SELECTOR, selector)
                    break
                except NoSuchElementException:
                    continue
            
            for selector in password_selectors:
                try:
                    password_input = self.driver.find_element(By.CSS_SELECTOR, selector)
                    break
                except NoSuchElementException:
                    continue
            
            if username_input and password_input:
                # 输入测试凭据
                username_input.clear()
                username_input.send_keys("admin")
                
                password_input.clear()
                password_input.send_keys("admin123")
                
                # 查找登录按钮
                login_button = None
                login_selectors = [
                    'button[type="submit"]',
                    'input[type="submit"]',
                    '.login-button',
                    'button:contains("登录")'
                ]
                
                for selector in login_selectors:
                    try:
                        if ':contains(' in selector:
                            xpath = f"//button[contains(text(), '登录')]"
                            login_button = self.driver.find_element(By.XPATH, xpath)
                        else:
                            login_button = self.driver.find_element(By.CSS_SELECTOR, selector)
                        break
                    except NoSuchElementException:
                        continue
                
                if login_button:
                    login_button.click()
                    logger.info("✅ 登录按钮已点击")
                    time.sleep(3)  # 等待登录完成
                    self.collect_console_logs()
                    return True
            
            logger.warning("⚠️ 未找到登录表单元素")
            return False
            
        except Exception as e:
            logger.error(f"❌ 模拟登录失败: {e}")
            return False
    
    def test_ai_page_components(self):
        """测试AI页面组件"""
        try:
            logger.info("🧪 开始测试AI页面组件...")
            
            # 1. 检查页面标题
            page_title = self.driver.title
            logger.info(f"📄 页面标题: {page_title}")
            
            # 2. 检查关键元素是否存在
            key_elements = [
                ('.ai-assistant-page', 'AI助手页面容器'),
                ('.ai-tabs', 'AI标签页'),
                ('.lazy-ai-layout', 'Lazy AI布局'),
                ('.chat-main-area', '聊天主区域'),
                ('.status-sidebar', '状态侧边栏'),
                ('.chat-input', '聊天输入框'),
                ('.send-button', '发送按钮')
            ]
            
            found_elements = 0
            for selector, description in key_elements:
                try:
                    element = self.driver.find_element(By.CSS_SELECTOR, selector)
                    if element.is_displayed():
                        logger.info(f"✅ 找到并显示: {description}")
                        found_elements += 1
                    else:
                        logger.warning(f"⚠️ 元素存在但不可见: {description}")
                except NoSuchElementException:
                    logger.error(f"❌ 未找到元素: {description}")
                    self.errors.append({
                        'type': 'missing_element',
                        'element': description,
                        'selector': selector,
                        'timestamp': time.time()
                    })
            
            # 3. 检查Tab切换功能
            self.test_tab_switching()
            
            # 4. 测试聊天输入功能
            self.test_chat_input()
            
            # 5. 测试状态栏数据
            self.test_status_sidebar()
            
            self.collect_console_logs()
            logger.info(f"📊 页面组件测试完成，找到 {found_elements}/{len(key_elements)} 个关键元素")
            
            return found_elements >= len(key_elements) * 0.7  # 70%元素可见即为通过
            
        except Exception as e:
            logger.error(f"❌ AI页面组件测试失败: {e}")
            self.errors.append({
                'type': 'component_test_error',
                'message': str(e),
                'timestamp': time.time()
            })
            return False
    
    def test_tab_switching(self):
        """测试标签页切换功能"""
        try:
            logger.info("🔄 测试标签页切换功能...")
            
            # 查找所有标签页
            tab_selectors = [
                '.el-tabs__nav .el-tabs__item',
                '.ai-tabs .el-tab-pane',
                '[role="tab"]'
            ]
            
            tabs = []
            for selector in tab_selectors:
                try:
                    found_tabs = self.driver.find_elements(By.CSS_SELECTOR, selector)
                    if found_tabs:
                        tabs = found_tabs
                        break
                except:
                    continue
            
            if tabs:
                logger.info(f"📑 找到 {len(tabs)} 个标签页")
                
                for i, tab in enumerate(tabs[:3]):  # 只测试前3个标签
                    try:
                        tab_text = tab.text or f"Tab{i+1}"
                        logger.info(f"🖱️ 点击标签页: {tab_text}")
                        
                        # 滚动到标签页位置
                        self.driver.execute_script("arguments[0].scrollIntoView(true);", tab)
                        time.sleep(0.5)
                        
                        # 点击标签页
                        tab.click()
                        time.sleep(1)
                        
                        # 收集可能的错误
                        self.collect_console_logs()
                        
                    except Exception as e:
                        logger.error(f"❌ 点击标签页 {i+1} 失败: {e}")
            else:
                logger.warning("⚠️ 未找到任何标签页")
                
        except Exception as e:
            logger.error(f"❌ 标签页切换测试失败: {e}")
    
    def test_chat_input(self):
        """测试聊天输入功能"""
        try:
            logger.info("💬 测试聊天输入功能...")
            
            # 查找聊天输入框
            chat_input = None
            input_selectors = [
                '.chat-input textarea',
                '.chat-input input',
                'textarea[placeholder*="AI"]',
                'input[placeholder*="AI"]'
            ]
            
            for selector in input_selectors:
                try:
                    chat_input = self.driver.find_element(By.CSS_SELECTOR, selector)
                    if chat_input.is_displayed():
                        break
                except NoSuchElementException:
                    continue
            
            if chat_input:
                # 测试输入功能
                test_message = "Hello AI assistant, this is a test message."
                logger.info(f"⌨️ 输入测试消息: {test_message}")
                
                chat_input.clear()
                chat_input.send_keys(test_message)
                time.sleep(0.5)
                
                # 检查输入值
                input_value = chat_input.get_attribute('value')
                if input_value == test_message:
                    logger.info("✅ 聊天输入功能正常")
                else:
                    logger.error(f"❌ 输入值不匹配: 期望='{test_message}', 实际='{input_value}'")
                
                # 查找发送按钮
                send_button = None
                send_selectors = [
                    '.send-button',
                    'button:contains("Send")',
                    'button:contains("发送")',
                    '.chat-input-area button'
                ]
                
                for selector in send_selectors:
                    try:
                        if ':contains(' in selector:
                            xpath = f"//button[contains(text(), 'Send') or contains(text(), '发送')]"
                            send_button = self.driver.find_element(By.XPATH, xpath)
                        else:
                            send_button = self.driver.find_element(By.CSS_SELECTOR, selector)
                        
                        if send_button.is_displayed():
                            break
                    except NoSuchElementException:
                        continue
                
                if send_button:
                    logger.info("🖱️ 点击发送按钮")
                    send_button.click()
                    time.sleep(2)
                    
                    # 检查消息是否被清空
                    input_value_after = chat_input.get_attribute('value')
                    if not input_value_after or input_value_after.strip() == "":
                        logger.info("✅ 发送后输入框已清空")
                    else:
                        logger.warning(f"⚠️ 发送后输入框未清空: '{input_value_after}'")
                    
                    self.collect_console_logs()
                else:
                    logger.error("❌ 未找到发送按钮")
            else:
                logger.error("❌ 未找到聊天输入框")
                
        except Exception as e:
            logger.error(f"❌ 聊天输入测试失败: {e}")
    
    def test_status_sidebar(self):
        """测试状态侧边栏"""
        try:
            logger.info("📊 测试状态侧边栏...")
            
            # 查找状态侧边栏元素
            status_elements = [
                ('.status-section', '状态信息'),
                ('.ai-status-section', 'AI状态'),
                ('.tool-calls-section', '工具调用'),
                ('.task-management-section', '任务管理')
            ]
            
            for selector, description in status_elements:
                try:
                    element = self.driver.find_element(By.CSS_SELECTOR, selector)
                    if element.is_displayed():
                        logger.info(f"✅ 状态栏组件可见: {description}")
                        
                        # 检查内容是否有数据
                        text_content = element.text.strip()
                        if text_content:
                            logger.info(f"📝 {description} 内容: {text_content[:50]}...")
                        else:
                            logger.warning(f"⚠️ {description} 内容为空")
                    else:
                        logger.warning(f"⚠️ 状态栏组件不可见: {description}")
                except NoSuchElementException:
                    logger.error(f"❌ 未找到状态栏组件: {description}")
            
        except Exception as e:
            logger.error(f"❌ 状态侧边栏测试失败: {e}")
    
    def test_javascript_execution(self):
        """测试JavaScript执行"""
        try:
            logger.info("🟨 测试JavaScript执行...")
            
            # 执行基础JavaScript测试
            js_tests = [
                ("typeof Vue", "检查Vue是否可用"),
                ("typeof window.ElementPlus", "检查ElementPlus是否可用"),
                ("document.querySelectorAll('.ai-tabs').length", "检查AI标签页数量"),
                ("document.querySelectorAll('.status-sidebar').length", "检查状态栏数量"),
                ("window.location.pathname", "检查当前路径")
            ]
            
            for js_code, description in js_tests:
                try:
                    result = self.driver.execute_script(f"return {js_code}")
                    logger.info(f"✅ {description}: {result}")
                except Exception as e:
                    logger.error(f"❌ {description} 失败: {e}")
                    self.errors.append({
                        'type': 'javascript_error',
                        'test': description,
                        'error': str(e),
                        'timestamp': time.time()
                    })
            
            # 测试Vue响应式数据
            try:
                vue_data = self.driver.execute_script("""
                    const app = document.querySelector('#app').__vue_app__;
                    if (app) {
                        return {
                            hasApp: true,
                            components: Object.keys(app._container._context.components || {})
                        };
                    }
                    return { hasApp: false };
                """)
                logger.info(f"🔧 Vue应用状态: {vue_data}")
            except Exception as e:
                logger.error(f"❌ Vue状态检查失败: {e}")
            
            self.collect_console_logs()
            
        except Exception as e:
            logger.error(f"❌ JavaScript执行测试失败: {e}")
    
    def generate_test_report(self):
        """生成测试报告"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'test_summary': {
                'total_errors': len(self.errors),
                'console_logs': len(self.console_logs),
                'network_logs': len(self.network_logs)
            },
            'errors': self.errors,
            'console_logs': self.console_logs[-20:],  # 最近20条日志
            'network_logs': self.network_logs[-10:],  # 最近10条网络日志
            'url': self.driver.current_url if self.driver else None,
            'page_source_length': len(self.driver.page_source) if self.driver else 0
        }
        
        # 保存报告到文件
        report_file = f'/home/devbox/project/client/tests/selenium/ai-test-report-{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        logger.info(f"📋 测试报告已保存: {report_file}")
        
        # 打印摘要
        print("\n" + "="*60)
        print("🧪 AI助手页面浏览器测试摘要")
        print("="*60)
        print(f"📊 总错误数: {len(self.errors)}")
        print(f"📝 控制台日志: {len(self.console_logs)}")
        print(f"🌐 网络日志: {len(self.network_logs)}")
        print(f"🔗 当前URL: {report['url']}")
        
        if self.errors:
            print("\n❌ 发现的错误:")
            for i, error in enumerate(self.errors[:5], 1):
                print(f"  {i}. {error['type']}: {error.get('message', 'N/A')}")
            if len(self.errors) > 5:
                print(f"  ... 和其他 {len(self.errors) - 5} 个错误")
        else:
            print("\n✅ 未发现严重错误")
        
        print("="*60)
        
        return report
    
    def cleanup(self):
        """清理资源"""
        if self.driver:
            try:
                self.driver.quit()
                logger.info("🧹 浏览器已关闭")
            except Exception as e:
                logger.error(f"❌ 关闭浏览器失败: {e}")
    
    def run_complete_test(self):
        """运行完整测试套件"""
        try:
            logger.info("🚀 开始AI助手页面完整浏览器测试...")
            
            # 1. 设置驱动器
            if not self.setup_driver():
                return False
            
            # 2. 导航到AI页面
            if not self.navigate_to_ai_page():
                return False
            
            # 3. 测试页面组件
            self.test_ai_page_components()
            
            # 4. 测试JavaScript执行
            self.test_javascript_execution()
            
            # 5. 最终收集日志
            self.collect_console_logs()
            self.collect_network_logs()
            
            # 6. 生成报告
            report = self.generate_test_report()
            
            # 判断测试是否通过
            critical_errors = [e for e in self.errors if e['type'] in ['console_error', 'navigation_error']]
            test_passed = len(critical_errors) == 0
            
            if test_passed:
                logger.info("🎉 AI助手页面测试通过！")
            else:
                logger.error(f"💥 AI助手页面测试失败，发现 {len(critical_errors)} 个关键错误")
            
            return test_passed
            
        except Exception as e:
            logger.error(f"❌ 完整测试执行失败: {e}")
            return False
        finally:
            self.cleanup()

def main():
    """主函数"""
    print("🧪 启动AI助手页面Selenium浏览器测试...")
    
    # 检查前端服务是否运行
    import subprocess
    import socket
    
    def is_port_open(host, port):
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex((host, port))
        sock.close()
        return result == 0
    
    # Skip port check for production environment
    # if not is_port_open('localhost', 5173):
        print("❌ 前端服务未运行在端口5173，请先启动开发服务器")
        return False
    
    # 运行测试
    test = AIAssistantBrowserTest()
    success = test.run_complete_test()
    
    return success

if __name__ == "__main__":
    import sys
    success = main()
    sys.exit(0 if success else 1)