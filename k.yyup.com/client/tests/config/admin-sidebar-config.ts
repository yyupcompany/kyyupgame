/**
 * Admin角色侧边栏配置
 *
 * 包含所有Admin角色可访问的页面和验证规则
 */

export interface NavigationItem {
  name: string;
  selector: string;
  expectedUrl: string;
  pageSelector: string;
  expectedTitle?: string;
  coreElements: string[];
  module: 'system' | 'advanced' | 'admin-only';
  priority: 'high' | 'medium' | 'low';
}

export interface ModuleGroup {
  name: string;
  description: string;
  items: NavigationItem[];
}

class AdminSidebarConfig {
  private navigationItems: NavigationItem[] = [];
  private moduleGroups: Map<string, ModuleGroup> = new Map();

  constructor() {
    this.initializeNavigationItems();
    this.initializeModuleGroups();
  }

  /**
   * 初始化所有导航项配置
   */
  private initializeNavigationItems(): void {
    // 系统管理模块
    const systemManagementItems: NavigationItem[] = [
      {
        name: '系统概览',
        selector: '[data-testid="nav-system-dashboard"]',
        expectedUrl: '**/system/dashboard',
        pageSelector: '[data-testid="system-dashboard-page"]',
        expectedTitle: '系统概览',
        coreElements: [
          '[data-testid="stats-card-users"]',
          '[data-testid="stats-card-roles"]',
          '[data-testid="stats-card-logs"]',
          '[data-testid="refresh-stats-btn"]',
          '[data-testid="ai-monitoring-section"]'
        ],
        module: 'system',
        priority: 'high'
      },
      {
        name: '用户管理',
        selector: '[data-testid="nav-user-management"]',
        expectedUrl: '**/system/user',
        pageSelector: '[data-testid="user-management-page"]',
        expectedTitle: '用户管理',
        coreElements: [
          '[data-testid="username-search-input"]',
          '[data-testid="role-search-select"]',
          '[data-testid="add-user-btn"]',
          '[data-testid="user-table"]',
          '[data-testid="user-pagination"]'
        ],
        module: 'system',
        priority: 'high'
      },
      {
        name: '角色管理',
        selector: '[data-testid="nav-role-management"]',
        expectedUrl: '**/system/role',
        pageSelector: '[data-testid="role-management-page"]',
        expectedTitle: '角色管理',
        coreElements: [
          '[data-testid="role-name-input"]',
          '[data-testid="add-role-btn"]',
          '[data-testid="role-table"]',
          '[data-testid="role-pagination"]'
        ],
        module: 'system',
        priority: 'high'
      },
      {
        name: '权限管理',
        selector: '[data-testid="nav-permission-management"]',
        expectedUrl: '**/system/permission',
        pageSelector: '[data-testid="permission-management-page"]',
        expectedTitle: '权限管理',
        coreElements: [
          '[data-testid="permission-name-input"]',
          '[data-testid="permission-code-input"]',
          '[data-testid="add-permission-btn"]',
          '[data-testid="permission-table"]'
        ],
        module: 'system',
        priority: 'high'
      },
      {
        name: '系统日志',
        selector: '[data-testid="nav-system-log"]',
        expectedUrl: '**/system/log',
        pageSelector: '[data-testid="system-log-page"]',
        expectedTitle: '系统日志',
        coreElements: [
          '[data-testid="log-level-select"]',
          '[data-testid="log-category-select"]',
          '[data-testid="log-keyword-input"]',
          '[data-testid="system-log-table"]',
          '[data-testid="export-log-btn"]'
        ],
        module: 'system',
        priority: 'medium'
      },
      {
        name: '系统设置',
        selector: '[data-testid="nav-system-settings"]',
        expectedUrl: '**/system/settings',
        pageSelector: '[data-testid="system-settings-page"]',
        expectedTitle: '系统设置',
        coreElements: [
          '[data-testid="basic-settings-tab"]',
          '[data-testid="email-settings-tab"]',
          '[data-testid="security-settings-tab"]',
          '[data-testid="storage-settings-tab"]',
          '[data-testid="ai-shortcuts-tab"]'
        ],
        module: 'system',
        priority: 'high'
      },
      {
        name: '备份管理',
        selector: '[data-testid="nav-backup-management"]',
        expectedUrl: '**/system/backup',
        pageSelector: '[data-testid="backup-management-page"]',
        expectedTitle: '备份管理',
        coreElements: [
          '[data-testid="create-backup-btn"]',
          '[data-testid="restore-backup-btn"]',
          '[data-testid="download-backup-btn"]',
          '[data-testid="backup-list"]'
        ],
        module: 'system',
        priority: 'medium'
      },
      {
        name: '消息模板',
        selector: '[data-testid="nav-message-template"]',
        expectedUrl: '**/system/message-template',
        pageSelector: '[data-testid="message-template-page"]',
        expectedTitle: '消息模板',
        coreElements: [
          '[data-testid="add-template-btn"]',
          '[data-testid="template-list"]',
          '[data-testid="template-editor"]'
        ],
        module: 'system',
        priority: 'low'
      },
      {
        name: '安全管理',
        selector: '[data-testid="nav-security-management"]',
        expectedUrl: '**/system/security',
        pageSelector: '[data-testid="security-management-page"]',
        expectedTitle: '安全管理',
        coreElements: [
          '[data-testid="security-policy-config"]',
          '[data-testid="access-control-config"]',
          '[data-testid="audit-log-config"]'
        ],
        module: 'system',
        priority: 'high'
      }
    ];

    // 高级管理模块
    const advancedManagementItems: NavigationItem[] = [
      {
        name: 'AI模型配置',
        selector: '[data-testid="nav-ai-model-config"]',
        expectedUrl: '**/system/ai-model-config',
        pageSelector: '[data-testid="ai-model-config-page"]',
        expectedTitle: 'AI模型配置',
        coreElements: [
          '[data-testid="model-select"]',
          '[data-testid="api-key-input"]',
          '[data-testid="save-ai-config-btn"]',
          '[data-testid="test-model-btn"]'
        ],
        module: 'advanced',
        priority: 'medium'
      },
      {
        name: 'VOS配置管理',
        selector: '[data-testid="nav-vos-config"]',
        expectedUrl: '**/system/vos-config',
        pageSelector: '[data-testid="vos-config-page"]',
        expectedTitle: 'VOS配置管理',
        coreElements: [
          '[data-testid="vos-server-input"]',
          '[data-testid="vos-port-input"]',
          '[data-testid="save-vos-config-btn"]',
          '[data-testid="test-connection-btn"]'
        ],
        module: 'advanced',
        priority: 'medium'
      },
      {
        name: '来电账户管理',
        selector: '[data-testid="nav-caller-account"]',
        expectedUrl: '**/system/caller-account',
        pageSelector: '[data-testid="caller-account-page"]',
        expectedTitle: '来电账户管理',
        coreElements: [
          '[data-testid="add-caller-account-btn"]',
          '[data-testid="caller-account-list"]',
          '[data-testid="account-status-toggle"]'
        ],
        module: 'advanced',
        priority: 'low'
      },
      {
        name: '语音配置管理',
        selector: '[data-testid="nav-voice-config"]',
        expectedUrl: '**/system/voice-config',
        pageSelector: '[data-testid="voice-config-page"]',
        expectedTitle: '语音配置管理',
        coreElements: [
          '[data-testid="voice-provider-select"]',
          '[data-testid="save-voice-config-btn"]',
          '[data-testid="test-voice-btn"]'
        ],
        module: 'advanced',
        priority: 'low'
      },
      {
        name: '扩展配置管理',
        selector: '[data-testid="nav-extension-config"]',
        expectedUrl: '**/system/extension-config',
        pageSelector: '[data-testid="extension-config-page"]',
        expectedTitle: '扩展配置管理',
        coreElements: [
          '[data-testid="add-extension-btn"]',
          '[data-testid="extension-list"]',
          '[data-testid="extension-status-toggle"]'
        ],
        module: 'advanced',
        priority: 'low'
      },
      {
        name: '维护调度器',
        selector: '[data-testid="nav-maintenance-scheduler"]',
        expectedUrl: '**/system/maintenance',
        pageSelector: '[data-testid="maintenance-scheduler-page"]',
        expectedTitle: '维护调度器',
        coreElements: [
          '[data-testid="schedule-maintenance-btn"]',
          '[data-testid="maintenance-tasks-list"]',
          '[data-testid="maintenance-history"]'
        ],
        module: 'advanced',
        priority: 'medium'
      },
      {
        name: 'AI快捷方式',
        selector: '[data-testid="nav-ai-shortcuts"]',
        expectedUrl: '**/system/ai-shortcuts',
        pageSelector: '[data-testid="ai-shortcuts-page"]',
        expectedTitle: 'AI快捷方式配置',
        coreElements: [
          '[data-testid="add-shortcut-btn"]',
          '[data-testid="shortcuts-list"]',
          '[data-testid="shortcut-editor"]'
        ],
        module: 'advanced',
        priority: 'low'
      }
    ];

    // Admin专用页面
    const adminOnlyItems: NavigationItem[] = [
      {
        name: '图片替换管理器',
        selector: '[data-testid="nav-image-replacement-manager"]',
        expectedUrl: '**/admin/image-replacement-manager',
        pageSelector: '[data-testid="image-replacement-manager-page"]',
        expectedTitle: '图片替换管理器',
        coreElements: [
          '[data-testid="upload-image-btn"]',
          '[data-testid="image-preview"]',
          '[data-testid="replace-image-btn"]',
          '[data-testid="image-replacement-history"]'
        ],
        module: 'admin-only',
        priority: 'medium'
      },
      {
        name: '图片替换',
        selector: '[data-testid="nav-image-replacement"]',
        expectedUrl: '**/admin/image-replacement',
        pageSelector: '[data-testid="image-replacement-page"]',
        expectedTitle: '图片替换',
        coreElements: [
          '[data-testid="image-source-select"]',
          '[data-testid="image-target-select"]',
          '[data-testid="execute-replacement-btn"]',
          '[data-testid="replacement-preview"]'
        ],
        module: 'admin-only',
        priority: 'medium'
      }
    ];

    // 合并所有导航项
    this.navigationItems = [
      ...systemManagementItems,
      ...advancedManagementItems,
      ...adminOnlyItems
    ];
  }

  /**
   * 初始化模块分组
   */
  private initializeModuleGroups(): void {
    // 系统管理模块组
    this.moduleGroups.set('system', {
      name: '系统管理',
      description: '核心系统管理功能，包括用户、角色、权限等基础管理',
      items: this.navigationItems.filter(item => item.module === 'system')
    });

    // 高级管理模块组
    this.moduleGroups.set('advanced', {
      name: '高级管理',
      description: '高级配置和扩展功能，包括AI配置、VOS配置等',
      items: this.navigationItems.filter(item => item.module === 'advanced')
    });

    // Admin专用模块组
    this.moduleGroups.set('admin-only', {
      name: 'Admin专用',
      description: '仅限Admin角色访问的特殊功能',
      items: this.navigationItems.filter(item => item.module === 'admin-only')
    });
  }

  /**
   * 获取所有导航项
   */
  getAllNavigationItems(): NavigationItem[] {
    return [...this.navigationItems];
  }

  /**
   * 按模块获取导航项
   */
  getNavigationItemsByModule(module: 'system' | 'advanced' | 'admin-only'): NavigationItem[] {
    return this.navigationItems.filter(item => item.module === module);
  }

  /**
   * 按优先级获取导航项
   */
  getNavigationItemsByPriority(priority: 'high' | 'medium' | 'low'): NavigationItem[] {
    return this.navigationItems.filter(item => item.priority === priority);
  }

  /**
   * 获取模块分组
   */
  getModuleGroups(): Map<string, ModuleGroup> {
    return new Map(this.moduleGroups);
  }

  /**
   * 获取特定模块组
   */
  getModuleGroup(module: 'system' | 'advanced' | 'admin-only'): ModuleGroup | undefined {
    return this.moduleGroups.get(module);
  }

  /**
   * 根据选择器查找导航项
   */
  findNavigationItemBySelector(selector: string): NavigationItem | undefined {
    return this.navigationItems.find(item => item.selector === selector);
  }

  /**
   * 根据名称查找导航项
   */
  findNavigationItemByName(name: string): NavigationItem | undefined {
    return this.navigationItems.find(item => item.name === name);
  }

  /**
   * 获取高优先级导航项（核心功能）
   */
  getHighPriorityNavigationItems(): NavigationItem[] {
    return this.getNavigationItemsByPriority('high');
  }

  /**
   * 获取核心系统管理导航项
   */
  getCoreSystemManagementItems(): NavigationItem[] {
    return this.navigationItems.filter(item =>
      item.module === 'system' && item.priority === 'high'
    );
  }

  /**
   * 获取统计信息
   */
  getStatistics(): {
    total: number;
    byModule: Record<string, number>;
    byPriority: Record<string, number>;
  } {
    const byModule = {
      system: this.getNavigationItemsByModule('system').length,
      advanced: this.getNavigationItemsByModule('advanced').length,
      'admin-only': this.getNavigationItemsByModule('admin-only').length
    };

    const byPriority = {
      high: this.getNavigationItemsByPriority('high').length,
      medium: this.getNavigationItemsByPriority('medium').length,
      low: this.getNavigationItemsByPriority('low').length
    };

    return {
      total: this.navigationItems.length,
      byModule,
      byPriority
    };
  }

  /**
   * 验证导航项配置完整性
   */
  validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const item of this.navigationItems) {
      // 检查必填字段
      const requiredFields = ['name', 'selector', 'expectedUrl', 'pageSelector', 'module', 'priority'];
      for (const field of requiredFields) {
        if (!item[field as keyof NavigationItem]) {
          errors.push(`导航项 "${item.name}" 缺少必填字段: ${field}`);
        }
      }

      // 检查URL格式
      if (!item.expectedUrl.startsWith('**/')) {
        errors.push(`导航项 "${item.name}" 的URL格式不正确: ${item.expectedUrl}`);
      }

      // 检查选择器格式
      if (!item.selector.startsWith('[data-testid=')) {
        errors.push(`导航项 "${item.name}" 的选择器格式不正确: ${item.selector}`);
      }

      // 检查页面选择器格式
      if (!item.pageSelector.startsWith('[data-testid=')) {
        errors.push(`导航项 "${item.name}" 的页面选择器格式不正确: ${item.pageSelector}`);
      }

      // 检查核心元素
      if (!item.coreElements || item.coreElements.length === 0) {
        errors.push(`导航项 "${item.name}" 没有配置核心元素`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// 创建默认实例
export const adminSidebarConfig = new AdminSidebarConfig();

// 导出类型
export { NavigationItem, ModuleGroup };