/**
 * 静态菜单配置 - 基于2025-11-15提取的实际菜单数据
 *
 * 说明：
 * 1. 已清理重复菜单项
 * 2. 已修复图标缺失问题
 * 3. 已优化排序值
 * 4. 保留完整的树形结构
 */

export interface MenuItem {
  id: number;
  name: string;
  chinese_name: string;
  path: string;
  component: string | null;
  icon: string;
  sort: number;
  type: 'category' | 'menu';
  parentId: number | null;
  children?: MenuItem[];
}

/**
 * 静态菜单配置
 */
export const STATIC_MENU_CONFIG: MenuItem[] = [
  // 1. 仪表板
  {
    id: 6118,
    name: '仪表板',
    chinese_name: '仪表板',
    path: '#dashboard',
    component: null,
    icon: 'Monitor',
    sort: 1,
    type: 'category',
    parentId: null,
    children: [
      {
        id: 6119,
        name: '总览',
        chinese_name: '总览',
        path: '/dashboard',
        component: 'pages/dashboard/index.vue',
        icon: 'Monitor',
        sort: 1,
        type: 'menu',
        parentId: 6118,
        children: []
      },
      {
        id: 6120,
        name: '数据统计',
        chinese_name: '数据统计',
        path: '/dashboard/data-statistics',
        component: 'pages/dashboard/DataStatistics.vue',
        icon: 'DataAnalysis',
        sort: 2,
        type: 'menu',
        parentId: 6118,
        children: []
      }
    ]
  },

  // 2. 用户管理
  {
    id: 6121,
    name: '用户管理',
    chinese_name: '用户管理',
    path: '#user',
    component: null,
    icon: 'User',
    sort: 10,
    type: 'category',
    parentId: null,
    children: [
      {
        id: 6122,
        name: '学生管理',
        chinese_name: '学生管理',
        path: '/student',
        component: 'pages/student/index.vue',
        icon: 'User',
        sort: 1,
        type: 'menu',
        parentId: 6121,
        children: []
      },
      {
        id: 6123,
        name: '教师管理',
        chinese_name: '教师管理',
        path: '/teacher',
        component: 'pages/teacher/index.vue',
        icon: 'Avatar',
        sort: 2,
        type: 'menu',
        parentId: 6121,
        children: []
      },
      {
        id: 6124,
        name: '家长管理',
        chinese_name: '家长管理',
        path: '/parent',
        component: 'pages/parent/index.vue',
        icon: 'UserFilled', // 修复：原为 'parent'
        sort: 3,
        type: 'menu',
        parentId: 6121,
        children: []
      },
      {
        id: 6125,
        name: '班级管理',
        chinese_name: '班级管理',
        path: '/class',
        component: 'pages/class/index.vue',
        icon: 'School',
        sort: 4,
        type: 'menu',
        parentId: 6121,
        children: []
      }
    ]
  },

  // 3. 招生管理
  {
    id: 6126,
    name: '招生管理',
    chinese_name: '招生管理',
    path: '#enrollment',
    component: null,
    icon: 'School',
    sort: 20,
    type: 'category',
    parentId: null,
    children: [
      {
        id: 6127,
        name: '招生概览',
        chinese_name: '招生概览',
        path: '/enrollment',
        component: 'pages/enrollment/index.vue',
        icon: 'School',
        sort: 1,
        type: 'menu',
        parentId: 6126,
        children: []
      },
      {
        id: 6128,
        name: '招生计划',
        chinese_name: '招生计划',
        path: '/enrollment-plan',
        component: 'pages/enrollment-plan/PlanList.vue',
        icon: 'Document', // 修复：原为 'plan'
        sort: 2,
        type: 'menu',
        parentId: 6126,
        children: []
      },
      {
        id: 6129,
        name: '申请管理',
        chinese_name: '申请管理',
        path: '/application',
        component: 'pages/application/ApplicationList.vue',
        icon: 'Files',
        sort: 3,
        type: 'menu',
        parentId: 6126,
        children: []
      }
    ]
  },

  // 4. 活动管理
  {
    id: 6130,
    name: '活动管理',
    chinese_name: '活动管理',
    path: '#activity',
    component: null,
    icon: 'Calendar',
    sort: 30,
    type: 'category',
    parentId: null,
    children: [
      {
        id: 6131,
        name: '活动列表',
        chinese_name: '活动列表',
        path: '/activity',
        component: 'pages/activity/index.vue',
        icon: 'Calendar',
        sort: 1,
        type: 'menu',
        parentId: 6130,
        children: []
      },
      {
        id: 6132,
        name: '创建活动',
        chinese_name: '创建活动',
        path: '/activity/create',
        component: 'pages/activity/ActivityCreate.vue',
        icon: 'Plus',
        sort: 2,
        type: 'menu',
        parentId: 6130,
        children: []
      }
    ]
  },

  // 5. AI助手
  {
    id: 6133,
    name: 'AI助手',
    chinese_name: 'AI助手',
    path: '#ai',
    component: null,
    icon: 'ChatDotRound',
    sort: 40,
    type: 'category',
    parentId: null,
    children: [
      {
        id: 6134,
        name: 'AI对话',
        chinese_name: 'AI对话',
        path: '/ai',
        component: 'pages/ai/ChatInterface.vue',
        icon: 'ChatDotRound',
        sort: 1,
        type: 'menu',
        parentId: 6133,
        children: []
      },
      {
        id: 6135,
        name: 'AI模型管理',
        chinese_name: 'AI模型管理',
        path: '/ai/model-management',
        component: 'pages/ai/ModelManagementPage.vue',
        icon: 'Setting',
        sort: 2,
        type: 'menu',
        parentId: 6133,
        children: []
      }
    ]
  },

  // 6. 系统管理
  {
    id: 6114,
    name: '系统管理',
    chinese_name: '系统管理',
    path: '#system',
    component: null,
    icon: 'Setting',
    sort: 90,
    type: 'category',
    parentId: null,
    children: [
      {
        id: 6115,
        name: '用户管理',
        chinese_name: '用户管理',
        path: '/system/User',
        component: 'pages/system/User.vue',
        icon: 'User',
        sort: 1,
        type: 'menu',
        parentId: 6114,
        children: []
      },
      {
        id: 6116,
        name: '角色管理',
        chinese_name: '角色管理',
        path: '/system/Role',
        component: 'pages/system/Role.vue',
        icon: 'Avatar',
        sort: 2,
        type: 'menu',
        parentId: 6114,
        children: []
      },
      {
        id: 6117,
        name: '权限管理',
        chinese_name: '权限管理',
        path: '/system/Permission',
        component: 'pages/system/Permission.vue',
        icon: 'Key', // 注意：需要确保这个图标在Element Plus中存在
        sort: 3,
        type: 'menu',
        parentId: 6114,
        children: []
      }
    ]
  }
];

/**
 * 获取静态菜单配置
 */
export function getStaticMenuConfig(): MenuItem[] {
  return STATIC_MENU_CONFIG;
}

/**
 * 根据角色过滤菜单
 * @param role 用户角色
 */
export function getMenuByRole(role: string): MenuItem[] {
  // TODO: 根据角色过滤菜单
  // 目前返回所有菜单
  return STATIC_MENU_CONFIG;
}

/**
 * 将菜单转换为路由配置
 */
export function convertMenuToRoutes(menus: MenuItem[]) {
  const routes: any[] = [];

  function processMenu(menu: MenuItem) {
    // 跳过分类菜单
    if (menu.type === 'category') {
      if (menu.children && menu.children.length > 0) {
        menu.children.forEach(child => processMenu(child));
      }
      return;
    }

    // 处理实际菜单项
    if (menu.component) {
      routes.push({
        path: menu.path,
        name: menu.name,
        component: () => import(`@/${menu.component}`),
        meta: {
          title: menu.chinese_name,
          icon: menu.icon,
          id: menu.id
        }
      });
    }

    // 处理子菜单
    if (menu.children && menu.children.length > 0) {
      menu.children.forEach(child => processMenu(child));
    }
  }

  menus.forEach(menu => processMenu(menu));
  return routes;
}

/**
 * 获取扁平化的菜单列表
 */
export function getFlatMenuList(menus: MenuItem[]): MenuItem[] {
  const result: MenuItem[] = [];

  function flatten(menu: MenuItem) {
    result.push(menu);
    if (menu.children && menu.children.length > 0) {
      menu.children.forEach(child => flatten(child));
    }
  }

  menus.forEach(menu => flatten(menu));
  return result;
}

/**
 * 根据ID查找菜单项
 */
export function findMenuById(id: number, menus: MenuItem[] = STATIC_MENU_CONFIG): MenuItem | null {
  for (const menu of menus) {
    if (menu.id === id) {
      return menu;
    }
    if (menu.children && menu.children.length > 0) {
      const found = findMenuById(id, menu.children);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

/**
 * 根据路径查找菜单项
 */
export function findMenuByPath(path: string, menus: MenuItem[] = STATIC_MENU_CONFIG): MenuItem | null {
  for (const menu of menus) {
    if (menu.path === path) {
      return menu;
    }
    if (menu.children && menu.children.length > 0) {
      const found = findMenuByPath(path, menu.children);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

/**
 * 菜单统计信息
 */
export const MENU_STATISTICS = {
  totalMenus: 6,           // 顶级菜单数量
  totalSubMenus: 17,       // 子菜单总数
  totalItems: 23,          // 总菜单项数
  categories: [
    { name: '仪表板', count: 2 },
    { name: '用户管理', count: 4 },
    { name: '招生管理', count: 3 },
    { name: '活动管理', count: 2 },
    { name: 'AI助手', count: 2 },
    { name: '系统管理', count: 3 }
  ]
};

export default STATIC_MENU_CONFIG;
