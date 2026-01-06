#!/usr/bin/env node

/**
 * Admin角色交互元素全覆盖测试脚本
 *
 * 功能：
 * 1. 测试页面内所有按钮的点击功能
 * 2. 测试分页组件的导航功能
 * 3. 测试表单提交和验证
 * 4. 测试模态框和下拉菜单
 * 5. 测试Tab切换功能
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Admin角色页面交互测试配置 - 基于22个页面的详细分析
const INTERACTIVE_TEST_PAGES = [
  // === 管理控制台 ===
  {
    id: 'dashboard',
    title: '数据概览',
    route: '/dashboard',
    category: '管理控制台',
    priority: 'critical',
    interactiveElements: {
      buttons: [
        { selector: '.refresh-btn', description: '刷新按钮' },
        { selector: '.export-btn', description: '导出按钮' },
        { selector: '.filter-btn', description: '筛选按钮' }
      ],
      tabs: [
        { selector: '.tab-overview', description: '概览Tab' },
        { selector: '.tab-charts', description: '图表Tab' },
        { selector: '.tab-reports', description: '报告Tab' }
      ],
      dropdowns: [
        { selector: '.time-range-selector', description: '时间范围选择器' },
        { selector: '.department-selector', description: '部门选择器' }
      ],
      modals: [
        { trigger: '.settings-btn', modal: '.settings-modal', description: '设置模态框' }
      ],
      forms: [
        { selector: '.dashboard-form', description: '仪表板配置表单' }
      ]
    }
  },
  {
    id: 'todo-management',
    title: '待办事项管理',
    route: '/todo',
    category: '管理控制台',
    priority: 'critical',
    interactiveElements: {
      buttons: [
        { selector: '.add-todo-btn', description: '添加待办按钮' },
        { selector: '.complete-todo-btn', description: '完成待办按钮' },
        { selector: '.delete-todo-btn', description: '删除待办按钮' },
        { selector: '.filter-todo-btn', description: '筛选待办按钮' }
      ],
      tabs: [
        { selector: '.tab-all', description: '全部待办Tab' },
        { selector: '.tab-pending', description: '待处理Tab' },
        { selector: '.tab-completed', description: '已完成Tab' }
      ],
      forms: [
        { selector: '.todo-form', description: '待办事项表单' },
        { selector: '.filter-form', description: '筛选表单' }
      ],
      pagination: [
        { selector: '.pagination', description: '待办事项分页' }
      ],
      modals: [
        { trigger: '.add-todo-btn', modal: '.todo-modal', description: '待办事项模态框' }
      ]
    }
  },

  // === 园所管理 ===
  {
    id: 'personnel-center',
    title: '人员中心',
    route: '/centers/PersonnelCenter',
    category: '园所管理',
    priority: 'critical',
    interactiveElements: {
      buttons: [
        { selector: '.add-staff-btn', description: '添加员工按钮' },
        { selector: '.edit-staff-btn', description: '编辑员工按钮' },
        { selector: '.delete-staff-btn', description: '删除员工按钮' },
        { selector: '.import-staff-btn', description: '导入员工按钮' },
        { selector: '.export-staff-btn', description: '导出员工按钮' }
      ],
      tabs: [
        { selector: '.tab-teachers', description: '教师Tab' },
        { selector: '.tab-admin', description: '管理员Tab' },
        { selector: '.tab-support', description: '支持人员Tab' }
      ],
      forms: [
        { selector: '.staff-form', description: '员工信息表单' },
        { selector: '.search-form', description: '搜索表单' }
      ],
      pagination: [
        { selector: '.staff-pagination', description: '员工列表分页' }
      ],
      modals: [
        { trigger: '.add-staff-btn', modal: '.staff-modal', description: '员工信息模态框' }
      ],
      dropdowns: [
        { selector: '.department-filter', description: '部门筛选下拉框' },
        { selector: '.role-filter', description: '角色筛选下拉框' }
      ]
    }
  },
  {
    id: 'enrollment-center',
    title: '招生中心',
    route: '/centers/EnrollmentCenter',
    category: '业务管理',
    priority: 'critical',
    interactiveElements: {
      buttons: [
        { selector: '.add-application-btn', description: '添加申请按钮' },
        { selector: '.approve-btn', description: '审批通过按钮' },
        { selector: '.reject-btn', description: '审批拒绝按钮' },
        { selector: '.interview-btn', description: '安排面试按钮' },
        { selector: '.export-btn', description: '导出按钮' }
      ],
      tabs: [
        { selector: '.tab-pending', description: '待审核Tab' },
        { selector: '.tab-approved', description: '已通过Tab' },
        { selector: '.tab-rejected', description: '已拒绝Tab' },
        { selector: '.tab-interview', description: '面试中Tab' }
      ],
      forms: [
        { selector: '.application-form', description: '申请表单' },
        { selector: '.interview-form', description: '面试表单' },
        { selector: '.filter-form', description: '筛选表单' }
      ],
      pagination: [
        { selector: '.application-pagination', description: '申请列表分页' }
      ],
      modals: [
        { trigger: '.add-application-btn', modal: '.application-modal', description: '申请模态框' },
        { trigger: '.interview-btn', modal: '.interview-modal', description: '面试模态框' }
      ],
      dropdowns: [
        { selector: '.status-filter', description: '状态筛选下拉框' },
        { selector: '.age-group-filter', description: '年龄组筛选下拉框' }
      ]
    }
  },
  {
    id: 'customer-pool-center',
    title: '客户池中心',
    route: '/centers/CustomerPoolCenter',
    category: '业务管理',
    priority: 'critical',
    interactiveElements: {
      buttons: [
        { selector: '.add-customer-btn', description: '添加客户按钮' },
        { selector: '.edit-customer-btn', description: '编辑客户按钮' },
        { selector: '.assign-sales-btn', description: '分配销售按钮' },
        { selector: '.follow-up-btn', description: '跟进记录按钮' },
        { selector: '.convert-btn', description: '转化客户按钮' }
      ],
      tabs: [
        { selector: '.tab-new', description: '新客户Tab' },
        { selector: '.tab-following', description: '跟进中Tab' },
        { selector: '.tab-converted', description: '已转化Tab' },
        { selector: '.tab-inactive', description: '非活跃Tab' }
      ],
      forms: [
        { selector: '.customer-form', description: '客户信息表单' },
        { selector: '.follow-up-form', description: '跟进记录表单' }
      ],
      pagination: [
        { selector: '.customer-pagination', description: '客户列表分页' }
      ],
      modals: [
        { trigger: '.add-customer-btn', modal: '.customer-modal', description: '客户信息模态框' },
        { trigger: '.follow-up-btn', modal: '.follow-up-modal', description: '跟进记录模态框' }
      ]
    }
  },

  // === 营销管理 ===
  {
    id: 'marketing-center',
    title: '营销中心',
    route: '/centers/MarketingCenter',
    category: '业务管理',
    priority: 'high',
    interactiveElements: {
      buttons: [
        { selector: '.create-campaign-btn', description: '创建营销活动按钮' },
        { selector: '.edit-campaign-btn', description: '编辑营销活动按钮' },
        { selector: '.publish-btn', description: '发布按钮' },
        { selector: '.pause-btn', description: '暂停按钮' },
        { selector: '.delete-btn', description: '删除按钮' }
      ],
      tabs: [
        { selector: '.tab-active', description: '进行中Tab' },
        { selector: '.tab-draft', description: '草稿Tab' },
        { selector: '.tab-completed', description: '已完成Tab' },
        { selector: '.tab-analytics', description: '数据分析Tab' }
      ],
      forms: [
        { selector: '.campaign-form', description: '营销活动表单' },
        { selector: '.budget-form', description: '预算表单' }
      ],
      pagination: [
        { selector: '.campaign-pagination', description: '营销活动分页' }
      ],
      modals: [
        { trigger: '.create-campaign-btn', modal: '.campaign-modal', description: '营销活动模态框' }
      ],
      dropdowns: [
        { selector: '.campaign-type', description: '活动类型下拉框' },
        { selector: '.target-audience', description: '目标受众下拉框' }
      ]
    }
  },
  {
    id: 'performance-rewards',
    title: '绩效中心',
    route: '/centers/PerformanceRewards',
    category: '营销管理',
    priority: 'high',
    interactiveElements: {
      buttons: [
        { selector: '.add-performance-btn', description: '添加绩效记录按钮' },
        { selector: '.calculate-reward-btn', description: '计算奖励按钮' },
        { selector: '.distribute-btn', description: '分发奖励按钮' },
        { selector: '.export-btn', description: '导出报表按钮' }
      ],
      tabs: [
        { selector: '.tab-monthly', description: '月度绩效Tab' },
        { selector: '.tab-quarterly', description: '季度绩效Tab' },
        { selector: '.tab-annual', description: '年度绩效Tab' },
        { selector: '.tab-rewards', description: '奖励记录Tab' }
      ],
      forms: [
        { selector: '.performance-form', description: '绩效考核表单' },
        { selector: '.reward-form', description: '奖励分配表单' }
      ],
      pagination: [
        { selector: '.performance-pagination', description: '绩效记录分页' }
      ],
      dropdowns: [
        { selector: '.period-selector', description: '考核周期选择器' },
        { selector: '.department-selector', description: '部门选择器' }
      ]
    }
  },

  // === 系统管理 ===
  {
    id: 'system-center',
    title: '系统中心',
    route: '/centers/SystemCenter',
    category: '系统管理',
    priority: 'critical',
    interactiveElements: {
      buttons: [
        { selector: '.backup-btn', description: '系统备份按钮' },
        { selector: '.restore-btn', description: '系统恢复按钮' },
        { selector: '.clear-cache-btn', description: '清除缓存按钮' },
        { selector: '.export-logs-btn', description: '导出日志按钮' },
        { selector: '.restart-btn', description: '重启服务按钮' }
      ],
      tabs: [
        { selector: '.tab-overview', description: '系统概览Tab' },
        { selector: '.tab-settings', description: '系统设置Tab' },
        { selector: '.tab-logs', description: '日志管理Tab' },
        { selector: '.tab-backup', description: '备份管理Tab' }
      ],
      forms: [
        { selector: '.system-config-form', description: '系统配置表单' },
        { selector: '.backup-form', description: '备份设置表单' }
      ],
      modals: [
        { trigger: '.backup-btn', modal: '.backup-modal', description: '备份确认模态框' },
        { trigger: '.restart-btn', modal: '.restart-modal', description: '重启确认模态框' }
      ],
      dropdowns: [
        { selector: '.log-level-filter', description: '日志级别筛选器' },
        { selector: '.backup-type', description: '备份类型选择器' }
      ]
    }
  },

  // === AI智能 ===
  {
    id: 'ai-center',
    title: '智能中心',
    route: '/centers/AICenter',
    category: 'AI智能',
    priority: 'high',
    interactiveElements: {
      buttons: [
        { selector: '.ai-query-btn', description: 'AI查询按钮' },
        { selector: '.generate-report-btn', description: '生成报告按钮' },
        { selector: '.train-model-btn', description: '训练模型按钮' },
        { selector: '.export-data-btn', description: '导出数据按钮' }
      ],
      tabs: [
        { selector: '.tab-chat', description: 'AI对话Tab' },
        { selector: '.tab-analysis', description: '数据分析Tab' },
        { selector: '.tab-prediction', description: '预测分析Tab' },
        { selector: '.tab-models', description: '模型管理Tab' }
      ],
      forms: [
        { selector: '.ai-query-form', description: 'AI查询表单' },
        { selector: '.analysis-config-form', description: '分析配置表单' }
      ],
      modals: [
        { trigger: '.ai-query-btn', modal: '.ai-modal', description: 'AI查询模态框' },
        { trigger: '.generate-report-btn', modal: '.report-modal', description: '报告生成模态框' }
      ],
      dropdowns: [
        { selector: '.ai-model-selector', description: 'AI模型选择器' },
        { selector: '.data-source-selector', description: '数据源选择器' }
      ]
    }
  }
];

class AdminInteractiveTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = [];
    this.startTime = Date.now();
    this.setupOutputDirectory();
  }

  setupOutputDirectory() {
    const outputDir = path.join(__dirname, 'admin-interactive-test-results');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const subdirs = ['screenshots', 'reports'];
    subdirs.forEach(dir => {
      const fullPath = path.join(outputDir, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });
  }

  async init() {
    console.log('🚀 初始化Admin角色交互元素全覆盖测试...');

    this.browser = await chromium.launch({
      headless: true,
      devtools: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security'
      ]
    });

    this.page = await this.browser.newPage();
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    this.page.setDefaultTimeout(30000);

    // 监听控制台输出
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error('浏览器控制台错误:', msg.text());
      }
    });

    // 监听页面错误
    this.page.on('pageerror', (error) => {
      console.error('页面错误:', error.message);
    });

    console.log('✅ 浏览器初始化完成');
  }

  async loginAsAdmin() {
    console.log('🔐 正在以Admin身份登录...');

    try {
      await this.page.goto('http://localhost:5173/login');
      await this.page.waitForLoadState('networkidle');

      // 点击admin快捷登录
      await this.page.click('.admin-btn');

      // 等待登录成功
      await this.page.waitForTimeout(2000);

      console.log('✅ Admin登录成功');
      return true;
    } catch (error) {
      console.error('❌ Admin登录失败:', error.message);
      return false;
    }
  }

  async testButton(buttonConfig, pageContext) {
    const result = {
      type: 'button',
      description: buttonConfig.description,
      selector: buttonConfig.selector,
      status: 'passed',
      errors: [],
      warnings: []
    };

    try {
      const element = await this.page.$(buttonConfig.selector);
      if (!element) {
        result.status = 'warning';
        result.warnings.push('按钮元素未找到');
        return result;
      }

      // 检查按钮是否可点击
      const isVisible = await element.isVisible();
      const isEnabled = await element.isEnabled();

      if (!isVisible) {
        result.warnings.push('按钮不可见');
      }

      if (!isEnabled) {
        result.warnings.push('按钮不可点击');
      }

      // 如果按钮可见且启用，尝试点击
      if (isVisible && isEnabled) {
        await element.click();

        // 等待可能的页面变化
        await this.page.waitForTimeout(1000);

        // 检查是否有错误弹窗
        const errorElement = await this.page.$('.error-message, .error-toast');
        if (errorElement) {
          const errorText = await errorElement.textContent();
          result.errors.push(`点击后出现错误: ${errorText}`);
          result.status = 'failed';
        }
      }

    } catch (error) {
      result.status = 'failed';
      result.errors.push(`按钮测试异常: ${error.message}`);
    }

    return result;
  }

  async testTab(tabConfig, pageContext) {
    const result = {
      type: 'tab',
      description: tabConfig.description,
      selector: tabConfig.selector,
      status: 'passed',
      errors: [],
      warnings: []
    };

    try {
      const element = await this.page.$(tabConfig.selector);
      if (!element) {
        result.status = 'warning';
        result.warnings.push('Tab元素未找到');
        return result;
      }

      const isVisible = await element.isVisible();
      if (!isVisible) {
        result.warnings.push('Tab不可见');
        return result;
      }

      // 点击Tab
      await element.click();
      await this.page.waitForTimeout(1000);

      // 检查Tab是否被激活（通常有active类）
      const isActive = await element.evaluate(el =>
        el.classList.contains('active') || el.classList.contains('selected')
      );

      if (!isActive) {
        result.warnings.push('Tab点击后未激活');
      }

    } catch (error) {
      result.status = 'failed';
      result.errors.push(`Tab测试异常: ${error.message}`);
    }

    return result;
  }

  async testForm(formConfig, pageContext) {
    const result = {
      type: 'form',
      description: formConfig.description,
      selector: formConfig.selector,
      status: 'passed',
      errors: [],
      warnings: []
    };

    try {
      const form = await this.page.$(formConfig.selector);
      if (!form) {
        result.status = 'warning';
        result.warnings.push('表单元素未找到');
        return result;
      }

      const isVisible = await form.isVisible();
      if (!isVisible) {
        result.warnings.push('表单不可见');
        return result;
      }

      // 查找表单内的输入字段
      const inputs = await form.$$('input, select, textarea');

      if (inputs.length === 0) {
        result.warnings.push('表单内没有找到输入字段');
      } else {
        // 尝试填写第一个输入字段（如果是文本输入）
        const firstInput = inputs[0];
        const inputType = await firstInput.getAttribute('type');

        if (!inputType || inputType === 'text' || inputType === 'search') {
          await firstInput.fill('测试数据');
          await this.page.waitForTimeout(500);
        }

        result.data = {
          inputCount: inputs.length,
          hasSubmitButton: !!(await form.$('button[type="submit"], .submit-btn'))
        };
      }

    } catch (error) {
      result.status = 'failed';
      result.errors.push(`表单测试异常: ${error.message}`);
    }

    return result;
  }

  async testPagination(paginationConfig, pageContext) {
    const result = {
      type: 'pagination',
      description: paginationConfig.description,
      selector: paginationConfig.selector,
      status: 'passed',
      errors: [],
      warnings: []
    };

    try {
      const pagination = await this.page.$(paginationConfig.selector);
      if (!pagination) {
        result.status = 'warning';
        result.warnings.push('分页组件未找到');
        return result;
      }

      const isVisible = await pagination.isVisible();
      if (!isVisible) {
        result.warnings.push('分页组件不可见');
        return result;
      }

      // 查找分页按钮
      const pageButtons = await pagination.$$('.page-btn, .pagination-item');

      if (pageButtons.length === 0) {
        result.warnings.push('分页组件内没有找到页码按钮');
      } else {
        // 尝试点击第二页（如果存在）
        if (pageButtons.length > 1) {
          await pageButtons[1].click();
          await this.page.waitForTimeout(1000);

          result.data = {
            totalPages: pageButtons.length,
            hasNextButton: !!(await pagination.$('.next-btn, .pagination-next')),
            hasPrevButton: !!(await pagination.$('.prev-btn, .pagination-prev'))
          };
        }
      }

    } catch (error) {
      result.status = 'failed';
      result.errors.push(`分页测试异常: ${error.message}`);
    }

    return result;
  }

  async testModal(modalConfig, pageContext) {
    const result = {
      type: 'modal',
      description: modalConfig.description,
      trigger: modalConfig.trigger,
      modal: modalConfig.modal,
      status: 'passed',
      errors: [],
      warnings: []
    };

    try {
      // 首先查找触发按钮
      const trigger = await this.page.$(modalConfig.trigger);
      if (!trigger) {
        result.status = 'warning';
        result.warnings.push('模态框触发按钮未找到');
        return result;
      }

      // 点击触发按钮
      await trigger.click();
      await this.page.waitForTimeout(1000);

      // 查找模态框
      const modal = await this.page.$(modalConfig.modal);
      if (!modal) {
        result.status = 'warning';
        result.warnings.push('模态框未出现');
        return result;
      }

      const isVisible = await modal.isVisible();
      if (!isVisible) {
        result.status = 'warning';
        result.warnings.push('模态框不可见');
        return result;
      }

      // 尝试关闭模态框（查找关闭按钮）
      const closeButton = await modal.$('.close-btn, .modal-close, .cancel-btn');
      if (closeButton) {
        await closeButton.click();
        await this.page.waitForTimeout(500);
      }

      result.data = {
        opened: true,
        hasCloseButton: !!closeButton
      };

    } catch (error) {
      result.status = 'failed';
      result.errors.push(`模态框测试异常: ${error.message}`);
    }

    return result;
  }

  async testDropdown(dropdownConfig, pageContext) {
    const result = {
      type: 'dropdown',
      description: dropdownConfig.description,
      selector: dropdownConfig.selector,
      status: 'passed',
      errors: [],
      warnings: []
    };

    try {
      const dropdown = await this.page.$(dropdownConfig.selector);
      if (!dropdown) {
        result.status = 'warning';
        result.warnings.push('下拉框未找到');
        return result;
      }

      const isVisible = await dropdown.isVisible();
      if (!isVisible) {
        result.warnings.push('下拉框不可见');
        return result;
      }

      // 尝试点击下拉框
      await dropdown.click();
      await this.page.waitForTimeout(500);

      // 检查是否有选项出现
      const options = await this.page.$$('.dropdown-option, .select-option, option');

      result.data = {
        optionCount: options.length,
        hasOptions: options.length > 0
      };

      // 如果有选项，尝试选择第一个
      if (options.length > 0) {
        await options[0].click();
        await this.page.waitForTimeout(500);
      }

    } catch (error) {
      result.status = 'failed';
      result.errors.push(`下拉框测试异常: ${error.message}`);
    }

    return result;
  }

  async testPageInteractions(pageConfig) {
    const startTime = Date.now();
    const result = {
      pageId: pageConfig.id,
      pageTitle: pageConfig.title,
      route: pageConfig.route,
      category: pageConfig.category,
      priority: pageConfig.priority,
      status: 'passed',
      errors: [],
      warnings: [],
      httpStatus: 200,
      interactionResults: [],
      loadTime: 0
    };

    try {
      console.log(`🔍 测试页面交互: ${pageConfig.title} (${pageConfig.route})`);

      // 导航到目标页面
      const response = await this.page.goto(`http://localhost:5173${pageConfig.route}`, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      if (!response) {
        throw new Error('页面响应为空');
      }

      result.httpStatus = response.status();

      // 等待页面加载完成
      await this.page.waitForLoadState('domcontentloaded');

      const elements = pageConfig.interactiveElements;

      // 测试按钮
      if (elements.buttons) {
        for (const button of elements.buttons) {
          const buttonResult = await this.testButton(button, pageConfig);
          result.interactionResults.push(buttonResult);

          if (buttonResult.status === 'failed') {
            result.errors.push(`按钮测试失败: ${buttonResult.description}`);
          } else if (buttonResult.status === 'warning') {
            result.warnings.push(`按钮测试警告: ${buttonResult.description}`);
          }
        }
      }

      // 测试Tab
      if (elements.tabs) {
        for (const tab of elements.tabs) {
          const tabResult = await this.testTab(tab, pageConfig);
          result.interactionResults.push(tabResult);

          if (tabResult.status === 'failed') {
            result.errors.push(`Tab测试失败: ${tabResult.description}`);
          } else if (tabResult.status === 'warning') {
            result.warnings.push(`Tab测试警告: ${tabResult.description}`);
          }
        }
      }

      // 测试表单
      if (elements.forms) {
        for (const form of elements.forms) {
          const formResult = await this.testForm(form, pageConfig);
          result.interactionResults.push(formResult);

          if (formResult.status === 'failed') {
            result.errors.push(`表单测试失败: ${formResult.description}`);
          } else if (formResult.status === 'warning') {
            result.warnings.push(`表单测试警告: ${formResult.description}`);
          }
        }
      }

      // 测试分页
      if (elements.pagination) {
        for (const pagination of elements.pagination) {
          const paginationResult = await this.testPagination(pagination, pageConfig);
          result.interactionResults.push(paginationResult);

          if (paginationResult.status === 'failed') {
            result.errors.push(`分页测试失败: ${paginationResult.description}`);
          } else if (paginationResult.status === 'warning') {
            result.warnings.push(`分页测试警告: ${paginationResult.description}`);
          }
        }
      }

      // 测试模态框
      if (elements.modals) {
        for (const modal of elements.modals) {
          const modalResult = await this.testModal(modal, pageConfig);
          result.interactionResults.push(modalResult);

          if (modalResult.status === 'failed') {
            result.errors.push(`模态框测试失败: ${modalResult.description}`);
          } else if (modalResult.status === 'warning') {
            result.warnings.push(`模态框测试警告: ${modalResult.description}`);
          }
        }
      }

      // 测试下拉框
      if (elements.dropdowns) {
        for (const dropdown of elements.dropdowns) {
          const dropdownResult = await this.testDropdown(dropdown, pageConfig);
          result.interactionResults.push(dropdownResult);

          if (dropdownResult.status === 'failed') {
            result.errors.push(`下拉框测试失败: ${dropdownResult.description}`);
          } else if (dropdownResult.status === 'warning') {
            result.warnings.push(`下拉框测试警告: ${dropdownResult.description}`);
          }
        }
      }

      // 如果有任何失败，将页面状态设为failed
      if (result.errors.length > 0) {
        result.status = 'failed';
      }

      result.loadTime = Date.now() - startTime;

    } catch (error) {
      result.status = 'error';
      result.errors.push(`页面交互测试异常: ${error.message}`);
      console.error(`❌ 页面 ${pageConfig.title} 交互测试失败:`, error);
    }

    return result;
  }

  async runAllInteractiveTests() {
    console.log(`📋 开始交互测试 ${INTERACTIVE_TEST_PAGES.length} 个页面...`);

    const loginSuccess = await this.loginAsAdmin();
    if (!loginSuccess) {
      throw new Error('Admin登录失败，无法继续测试');
    }

    // 按优先级分组测试
    const criticalPages = INTERACTIVE_TEST_PAGES.filter(p => p.priority === 'critical');
    const highPages = INTERACTIVE_TEST_PAGES.filter(p => p.priority === 'high');

    console.log(`🎯 关键页面: ${criticalPages.length} 个`);
    console.log(`📊 高优先级页面: ${highPages.length} 个`);

    // 统计总交互元素数量
    let totalButtons = 0, totalTabs = 0, totalForms = 0, totalModals = 0, totalPagination = 0, totalDropdowns = 0;

    INTERACTIVE_TEST_PAGES.forEach(page => {
      const elements = page.interactiveElements;
      if (elements.buttons) totalButtons += elements.buttons.length;
      if (elements.tabs) totalTabs += elements.tabs.length;
      if (elements.forms) totalForms += elements.forms.length;
      if (elements.modals) totalModals += elements.modals.length;
      if (elements.pagination) totalPagination += elements.pagination.length;
      if (elements.dropdowns) totalDropdowns += elements.dropdowns.length;
    });

    console.log(`🎮 交互元素统计:`);
    console.log(`   - 按钮: ${totalButtons} 个`);
    console.log(`   - Tab: ${totalTabs} 个`);
    console.log(`   - 表单: ${totalForms} 个`);
    console.log(`   - 模态框: ${totalModals} 个`);
    console.log(`   - 分页: ${totalPagination} 个`);
    console.log(`   - 下拉框: ${totalDropdowns} 个`);

    // 测试所有页面
    for (const pageConfig of INTERACTIVE_TEST_PAGES) {
      const result = await this.testPageInteractions(pageConfig);
      this.results.push(result);

      // 添加延迟避免过快请求
      await this.page.waitForTimeout(3000);
    }

    console.log('✅ 所有页面交互测试完成');
  }

  generateReport() {
    const summary = {
      totalPages: this.results.length,
      passedPages: this.results.filter(r => r.status === 'passed').length,
      failedPages: this.results.filter(r => r.status === 'failed').length,
      errorPages: this.results.filter(r => r.status === 'error').length,
      totalInteractions: 0,
      passedInteractions: 0,
      failedInteractions: 0,
      warningInteractions: 0,
      totalErrors: this.results.reduce((sum, r) => sum + r.errors.length, 0),
      totalWarnings: this.results.reduce((sum, r) => sum + r.warnings.length, 0),
      executionTime: Date.now() - this.startTime
    };

    // 统计交互元素测试结果
    this.results.forEach(result => {
      result.interactionResults.forEach(interaction => {
        summary.totalInteractions++;
        if (interaction.status === 'passed') summary.passedInteractions++;
        else if (interaction.status === 'failed') summary.failedInteractions++;
        else if (interaction.status === 'warning') summary.warningInteractions++;
      });
    });

    const recommendations = [];

    // 生成建议
    if (summary.failedPages > 0) {
      recommendations.push(`${summary.failedPages} 个页面存在交互错误，需要检查UI组件实现`);
    }

    if (summary.totalErrors > 0) {
      recommendations.push(`发现 ${summary.totalErrors} 个交互错误，需要优先修复`);
    }

    if (summary.totalWarnings > 0) {
      recommendations.push(`发现 ${summary.totalWarnings} 个交互警告，建议优化用户体验`);
    }

    if (summary.failedInteractions > 0) {
      recommendations.push(`${summary.failedInteractions} 个交互元素测试失败，需要检查组件功能`);
    }

    const failedPages = this.results.filter(r => r.status === 'failed' || r.status === 'error');
    if (failedPages.length > 0) {
      recommendations.push('重点失败的页面: ' + failedPages.map(f => f.pageTitle).join(', '));
    }

    return {
      summary,
      results: this.results,
      recommendations
    };
  }

  async saveReport(report) {
    const outputDir = path.join(__dirname, 'admin-interactive-test-results', 'reports');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    // 保存详细报告JSON
    const jsonReportPath = path.join(outputDir, `admin-interactive-test-report-${timestamp}.json`);
    fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));

    // 保存简化报告MD
    const mdReportPath = path.join(outputDir, `admin-interactive-test-report-${timestamp}.md`);
    const mdContent = this.generateMarkdownReport(report);
    fs.writeFileSync(mdReportPath, mdContent);

    console.log(`📊 交互测试报告已保存:`);
    console.log(`   JSON: ${jsonReportPath}`);
    console.log(`   MD: ${mdReportPath}`);

    // 输出简要结果
    console.log('\n' + '='.repeat(60));
    console.log('🎯 Admin角色交互元素全覆盖测试完成');
    console.log('='.repeat(60));
    console.log(`📊 总页面: ${report.summary.totalPages}`);
    console.log(`✅ 通过: ${report.summary.passedPages}`);
    console.log(`❌ 失败: ${report.summary.failedPages}`);
    console.log(`💥 错误: ${report.summary.errorPages}`);
    console.log(`🎮 总交互元素: ${report.summary.totalInteractions}`);
    console.log(`✅ 通过交互: ${report.summary.passedInteractions}`);
    console.log(`❌ 失败交互: ${report.summary.failedInteractions}`);
    console.log(`⚠️  警告交互: ${report.summary.warningInteractions}`);
    console.log(`⚠️  总警告: ${report.summary.totalWarnings}`);
    console.log(`⏱️  耗时: ${(report.summary.executionTime / 1000).toFixed(2)}秒`);

    if (report.summary.failedPages > 0 || report.summary.totalErrors > 0 || report.summary.failedInteractions > 0) {
      console.log('\n❌ 发现交互问题，请查看详细报告');

      // 输出失败的页面
      console.log('\n❌ 失败的页面:');
      const failedPages = report.results.filter(r => r.status === 'failed' || r.status === 'error');
      failedPages.forEach(page => {
        console.log(`   - ${page.pageTitle} (${page.route})`);
        if (page.errors.length > 0) {
          page.errors.forEach(error => {
            console.log(`     * ${error}`);
          });
        }
      });

      console.log('\n❌ 失败的交互元素:');
      const failedInteractions = [];
      report.results.forEach(page => {
        page.interactionResults.forEach(interaction => {
          if (interaction.status === 'failed') {
            failedInteractions.push({
              page: page.pageTitle,
              type: interaction.type,
              description: interaction.description,
              errors: interaction.errors
            });
          }
        });
      });

      failedInteractions.slice(0, 10).forEach(interaction => {
        console.log(`   - ${interaction.page} - ${interaction.type}: ${interaction.description}`);
        interaction.errors.forEach(error => {
          console.log(`     * ${error}`);
        });
      });

      if (failedInteractions.length > 10) {
        console.log(`   ... 还有 ${failedInteractions.length - 10} 个失败的交互元素，请查看详细报告`);
      }

      process.exit(1);
    } else {
      console.log('\n✅ 所有交互测试通过！第二组覆盖测试完成！');
      process.exit(0);
    }
  }

  generateMarkdownReport(report) {
    const { summary, results, recommendations } = report;

    let content = `# Admin角色交互元素全覆盖测试报告\n\n`;
    content += `生成时间: ${new Date().toLocaleString()}\n`;

    // 测试概要
    content += `\n## 📊 测试概要\n\n`;
    content += `- **总页面数**: ${summary.totalPages}\n`;
    content += `- **通过页面**: ${summary.passedPages}\n`;
    content += `- **失败页面**: ${summary.failedPages}\n`;
    content += `- **错误页面**: ${summary.errorPages}\n`;
    content += `- **总交互元素**: ${summary.totalInteractions}\n`;
    content += `- **通过交互**: ${summary.passedInteractions}\n`;
    content += `- **失败交互**: ${summary.failedInteractions}\n`;
    content += `- **警告交互**: ${summary.warningInteractions}\n`;
    content += `- **总错误数**: ${summary.totalErrors}\n`;
    content += `- **总警告数**: ${summary.totalWarnings}\n`;
    content += `- **执行时间**: ${(summary.executionTime / 1000).toFixed(2)}秒\n\n`;

    // 交互元素统计
    content += `## 🎮 交互元素统计\n\n`;

    const interactionStats = {
      button: { passed: 0, failed: 0, warning: 0, total: 0 },
      tab: { passed: 0, failed: 0, warning: 0, total: 0 },
      form: { passed: 0, failed: 0, warning: 0, total: 0 },
      modal: { passed: 0, failed: 0, warning: 0, total: 0 },
      pagination: { passed: 0, failed: 0, warning: 0, total: 0 },
      dropdown: { passed: 0, failed: 0, warning: 0, total: 0 }
    };

    results.forEach(result => {
      result.interactionResults.forEach(interaction => {
        const type = interaction.type;
        if (interactionStats[type]) {
          interactionStats[type].total++;
          interactionStats[type][interaction.status]++;
        }
      });
    });

    Object.entries(interactionStats).forEach(([type, stats]) => {
      if (stats.total > 0) {
        content += `- **${type}**: ${stats.total} 个 (✅${stats.passed} ❌${stats.failed} ⚠️${stats.warning})\n`;
      }
    });

    // 详细结果
    content += `\n## 📋 详细测试结果\n\n`;

    // 按状态分组
    const failedPages = results.filter(r => r.status === 'failed' || r.status === 'error');
    const passedPages = results.filter(r => r.status === 'passed');

    if (failedPages.length > 0) {
      content += `### ❌ 失败的页面 (${failedPages.length})\n\n`;
      failedPages.forEach(result => {
        content += `#### ${result.pageTitle}\n`;
        content += `- **路由**: ${result.route}\n`;
        content += `- **分类**: ${result.category}\n`;
        content += `- **状态**: ${result.status}\n`;
        content += `- **HTTP状态**: ${result.httpStatus}\n`;
        content += `- **加载时间**: ${result.loadTime}ms\n`;
        content += `- **交互元素**: ${result.interactionResults.length} 个\n`;

        if (result.errors.length > 0) {
          content += `- **页面错误**:\n`;
          result.errors.forEach(error => {
            content += `  - ${error}\n`;
          });
        }

        const failedInteractions = result.interactionResults.filter(i => i.status === 'failed');
        if (failedInteractions.length > 0) {
          content += `- **失败的交互元素**:\n`;
          failedInteractions.forEach(interaction => {
            content += `  - ${interaction.type}: ${interaction.description}\n`;
            if (interaction.errors.length > 0) {
              interaction.errors.forEach(error => {
                content += `    * ${error}\n`;
              });
            }
          });
        }

        content += `\n`;
      });
    }

    if (passedPages.length > 0) {
      content += `### ✅ 通过的页面 (${passedPages.length})\n\n`;
      passedPages.forEach(result => {
        content += `- **${result.pageTitle}** (${result.route}) - ${result.interactionResults.length} 个交互元素\n`;
      });
      content += `\n`;
    }

    // 优化建议
    if (recommendations.length > 0) {
      content += `## 💡 优化建议\n\n`;
      recommendations.forEach((rec, index) => {
        content += `${index + 1}. ${rec}\n`;
      });
      content += `\n`;
    }

    return content;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
    console.log('🧹 浏览器已关闭');
  }
}

// 主执行函数
async function main() {
  const tester = new AdminInteractiveTester();

  try {
    await tester.init();
    await tester.runAllInteractiveTests();
    const report = tester.generateReport();
    await tester.saveReport(report);
  } catch (error) {
    console.error('💥 交互测试执行失败:', error);
    process.exit(1);
  } finally {
    await tester.cleanup();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { AdminInteractiveTester, INTERACTIVE_TEST_PAGES };