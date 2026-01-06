<template>
  <aside
    class="sidebar"
    :class="sidebarClasses"
    id="improved-sidebar"
  >
    <div class="sidebar-header">
      <div class="sidebar-logo">
        <div class="logo-icon floating-animation">
          <img src="@/assets/logo.png" alt="婴婴向上智能招生系统" class="logo-image" />
        </div>
        <span class="logo-text" v-show="!collapsed">婴婴向上</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <!-- 动态菜单：从后台获取的各种中心 -->
      <el-tooltip
        v-for="section in filteredNavigation"
        :key="section.id"
        :content="section.title"
        placement="right"
        :show-after="200"
        :hide-after="0"
        :disabled="!collapsed"
      >
        <a
          :href="section.route"
          class="nav-item center-item"
          :class="{ 'active': isActiveSection(section) }"
          @click.prevent="handleSectionClick(section)"
        >
          <UnifiedIcon
            :name="getSectionIcon(section.icon, section.title)"
            :size="collapsed ? 28 : 20"
            class="nav-icon"
          />
          <div class="nav-content" v-if="!collapsed">
            <span class="nav-text">{{ section.title }}</span>
          </div>
        </a>
      </el-tooltip>

    </nav>

    <!-- 用户区域已移除 -->
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usePermissionsStore } from '@/stores/permissions'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'

// 动态菜单项类型
interface DynamicNavigationItem {
  id: string;
  title: string;
  route: string;
  icon: string;
  component?: string;
  children?: DynamicNavigationItem[];
}

interface DynamicNavigationSection {
  id: string;
  title: string;
  items: DynamicNavigationItem[];
  order: number;
}

// Props
interface Props {
  collapsed?: boolean
  isMobile?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
  isMobile: false
})

// Emits
const emit = defineEmits<{
  toggle: []
  menuClick: []
}>()

// 路由和状态
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const permissionsStore = usePermissionsStore()

// 导航状态
const activeItemId = ref<string>('')
const expandedItems = ref<string[]>([]) // 默认所有分组都收缩

// 计算属性
const sidebarClasses = computed(() => {
  return {
    'sidebar-open': !props.collapsed,
    'collapsed': props.collapsed,
    'show': !props.collapsed && props.isMobile
  }
})

// 用户相关计算属性已移除

// 图标映射
const sectionIconMap: Record<string, string> = {
  '⚡': 'lightning',
  '👨‍💼': 'principal',
  '👥': 'customers',
  '🎯': 'activities',
  '📊': 'analytics',
  '🤖': 'ai-robot'
}

const itemIconMap: Record<string, string> = {
  'dashboard': 'dashboard',
  'Dashboard': 'dashboard',
  'basic-info': 'profile',
  'performance': 'performance',
  'marketing-analysis': 'marketing',
  'customer-pool': 'customers',
  'intelligent-dashboard': 'ai-brain',
  'PosterEditor': 'design',
  'PosterGenerator': 'design',
  'PosterTemplates': 'design',
  'School': 'dashboard',
  'User': 'profile',
  'UserFilled': 'profile',
  'Avatar': 'customers',
  'Calendar': 'activities',
  'DocumentAdd': 'design',
  'VideoCamera': 'media'
}

// Lucide Icons 映射表 - 更现代、美观的图标（在函数外部定义）
const lucideIconMapping: Record<string, string> = {
    // 直接映射 (新的 Lucide 图标名称)
    'enrollment': 'GraduationCap',    // 招生中心 -> 毕业帽图标
    'activity': 'Calendar',          // 活动中心 -> 日历图标
    'marketing': 'Megaphone',        // 营销中心 -> 扩音器图标
    'ai-center': 'Brain',            // AI中心 -> 大脑图标
    'system': 'Settings',            // 系统中心 -> 设置图标
    'personnel': 'Users',            // 人员中心 -> 用户组图标
    'dashboard': 'LayoutDashboard',  // 工作台 -> 仪表板图标
    'finance': 'DollarSign',         // 财务中心 -> 美元符号图标
    'task': 'CheckSquare',           // 任务中心 -> 勾选框图标
    'script': 'MessageSquare',       // 话术中心 -> 消息方块图标
    'media': 'Video',                // 媒体中心 -> 视频图标
    'customers': 'UserCheck',        // 客户池中心 -> 用户勾选图标
    'data-analysis': 'BarChart3',    // 用量中心 -> 柱状图图标
    'teaching': 'BookOpen',          // 教学中心 -> 书本打开图标
    'attendance': 'Clock',           // 考勤中心 -> 时钟图标
    'inspection': 'CheckCircle2',    // 督查中心 -> 检查圆形图标
    'call-center': 'Phone',          // 呼叫中心 -> 电话图标
    'group': 'Building2',            // 集团管理 -> 建筑图标

    // Element Plus 图标到 Lucide 图标的映射
    'School': 'GraduationCap',       // 学校 -> 招生
    'Calendar': 'Calendar',          // 日历 -> 活动
    'TrendingUp': 'Megaphone',       // 趋势上升 -> 营销
    'Brain': 'Brain',                // 大脑 -> AI中心
    'Settings': 'Settings',          // 设置 -> 系统
    'Users': 'Users',                // 用户群 -> 人员
    'Dashboard': 'LayoutDashboard',  // 仪表板 -> 工作台
    'Grid': 'LayoutDashboard',       // 网格 -> 工作台
    'MessageSquare': 'MessageSquare', // 消息方块 -> 话术
    'Money': 'DollarSign',           // 金钱 -> 财务
    'CreditCard': 'DollarSign',      // 信用卡 -> 财务
    'DollarSign': 'DollarSign',      // 美元符号 -> 财务
    'Task': 'CheckSquare',           // 任务 -> 任务中心
    'CheckSquare': 'CheckSquare',    // 勾选框 -> 任务
    'VideoCamera': 'Video',          // 摄像机 -> 媒体
    'UserCheck': 'UserCheck',        // 用户勾选 -> 客户池
    'BookOpen': 'BookOpen',          // 书本打开 -> 教学中心
    'Bell': 'Bell',                  // 铃铛 -> 通知中心
    'Briefcase': 'Briefcase',        // 公文包 -> 业务中心
    'BarChart3': 'BarChart3',        // 柱状图 -> 用量中心
    'Clock': 'Clock',                // 时钟 -> 考勤中心
    'DocumentChecked': 'CheckCircle2', // 文档检查 -> 督查中心
    'Document': 'FileText',          // 文档 -> 文件
    'Files': 'Files',                // 文件 -> 文件
    'DataAnalysis': 'BarChart3',     // 数据分析 -> 柱状图
    'List': 'List',                  // 列表 -> 列表
    'Checked': 'CheckCircle2',       // 检查 -> 检查圆形
    'Phone': 'Phone',                // 电话 -> 呼叫中心
    'Building2': 'Building2',        // 建筑 -> 集团管理

    // 小写图标名称映射（数据库中可能使用小写）
    'user': 'Users',                 // 用户 -> 人员中心
    'calendar': 'Calendar',          // 日历 -> 活动中心
    'trending-up': 'Megaphone',      // 趋势 -> 营销中心
    'school': 'GraduationCap',       // 学校 -> 招生中心
    'money': 'DollarSign',           // 金钱 -> 财务中心
    'cog': 'Settings',               // 齿轮 -> 系统中心
    'users': 'Users',                // 用户组 -> 人员中心
    'chart-line': 'LineChart',       // 折线图 -> 图表
    'chart-pie': 'PieChart',         // 饼图 -> 图表
    'user-tie': 'Users',             // 用户领带 -> 用户
    'id-card': 'CreditCard',         // 身份证 -> 卡片
    'user-friends': 'Users',         // 用户朋友 -> 用户
    'users-cog': 'Settings',         // 用户齿轮 -> 设置
    'key': 'Key',                    // 钥匙 -> 权限
    'user-tag': 'Tag',               // 用户标签 -> 标签
    'cogs': 'Settings',              // 多个齿轮 -> 设置
    'inspection': 'CheckCircle2',    // 检查 -> 督查中心
    'message-square': 'MessageSquare', // 消息方块 -> 话术中心
    'video-camera': 'Video',         // 摄像机 -> 媒体中心
    'magic-stick': 'Wand2'           // 魔法棒 -> AI中心
};

// 图标映射函数 - 支持中心图标 (使用 UnifiedIcon)
const getSectionIcon = (icon: string, name?: string): string => {
  // 如果icon为空或未定义，尝试根据名称映射
  if (!icon) {
    if (name) {
      const nameToIconMap: Record<string, string> = {
        '人员中心': 'personnel',
        '活动中心': 'activity',
        '营销中心': 'marketing',
        '业务中心': 'customers',
        '客户池中心': 'customers',
        '系统中心': 'system',
        '财务中心': 'finance',
        '招生中心': 'enrollment',
        '督查中心': 'inspection',
        '任务中心': 'task',
        '教学中心': 'teaching',
        '话术中心': 'script',
        '新媒体中心': 'media',
        '考勤中心': 'attendance',
        '集团管理': 'group',
        '用量中心': 'analytics',
        '呼叫中心': 'call-center',
        '工作台': 'dashboard'
      };
      const mappedIcon = nameToIconMap[name];
      if (mappedIcon) {
        return mappedIcon;
      }
    }
    return 'dashboard';
  }

  // 直接返回图标名称，UnifiedIcon组件会自动处理
  return icon;
};

const getItemIcon = (icon: string): string => {
  return itemIconMap[icon] || 'dashboard'
}

// 🔧 使用权限store获取动态菜单 (已在上方声明)

// 静态菜单配置（fallback）
const staticMenuItems = [
  {
    id: 'dashboard',
    title: '工作台',
    route: '/dashboard',
    icon: 'Dashboard',
    type: 'menu'
  },
  {
    id: 'business-center',
    title: '业务中心',
    route: '/centers/business',
    icon: 'Briefcase',
    type: 'menu'
  },
  {
    id: 'business-centers',
    title: '业务中心',
    route: '#centers',
    icon: 'Grid',
    type: 'category',
    children: [
      {
        id: 'personnel-center',
        title: '人员中心',
        route: '/centers/personnel',
        icon: 'Users',
        type: 'menu'
      },
      {
        id: 'enrollment-center',
        title: '招生中心',
        route: '/centers/enrollment',
        icon: 'School',
        type: 'menu'
      },
      {
        id: 'marketing-center',
        title: '营销中心',
        route: '/centers/marketing',
        icon: 'TrendingUp',
        type: 'menu'
      },
      {
        id: 'activity-center',
        title: '活动中心',
        route: '/centers/activity',
        icon: 'Calendar',
        type: 'menu'
      },
      {
        id: 'media-center',
        title: '新媒体中心',
        route: '/principal/media-center',
        icon: 'VideoCamera',
        type: 'menu'
      },
      {
        id: 'task-center',
        title: '任务中心',
        route: '/centers/task',
        icon: 'CheckSquare',
        type: 'menu'
      },
      {
        id: 'script-center',
        title: '话术中心',
        route: '/centers/script',
        icon: 'MessageSquare',
        type: 'menu'
      },
      {
        id: 'finance-center',
        title: '财务中心',
        route: '/centers/finance',
        icon: 'Money',
        type: 'menu'
      },
      {
        id: 'ai-center',
        title: 'AI中心',
        route: '/centers/ai',
        icon: 'Brain',
        type: 'menu'
      },
      {
        id: 'system-center',
        title: '系统中心',
        route: '/centers/system',
        icon: 'Settings',
        type: 'menu'
      }
    ]
  },
  {
    id: 'dashboard',
    title: '仪表板',
    route: '/dashboard',
    icon: 'Dashboard',
    type: 'menu',
    children: []
  },
  {
    id: 'class',
    title: '班级管理',
    route: '/class',
    icon: 'School',
    type: 'menu',
    children: []
  },
  {
    id: 'student',
    title: '学生管理',
    route: '/student',
    icon: 'User',
    type: 'category',
    children: [
      {
        id: 'student-list',
        title: '学生列表',
        route: '/student',
        icon: 'User',
        type: 'menu'
      }
    ]
  },
  {
    id: 'teacher',
    title: '教师管理',
    route: '/teacher',
    icon: 'UserFilled',
    type: 'category',
    children: [
      {
        id: 'teacher-list',
        title: '教师列表',
        route: '/teacher',
        icon: 'UserFilled',
        type: 'menu'
      }
    ]
  },
  {
    id: 'parent',
    title: '家长管理',
    route: '/parent',
    icon: 'Avatar',
    type: 'category',
    children: [
      {
        id: 'parent-list',
        title: '家长列表',
        route: '/parent',
        icon: 'Avatar',
        type: 'menu'
      }
    ]
  },
  {
    id: 'enrollment-plan',
    title: '招生计划',
    route: '/enrollment-plan',
    icon: 'Calendar',
    type: 'menu',
    children: []
  },
  {
    id: 'enrollment',
    title: '招生管理',
    route: '/enrollment',
    icon: 'DocumentAdd',
    type: 'menu',
    children: []
  },
  {
    id: 'activity',
    title: '活动管理',
    route: '/activity',
    icon: 'Calendar',
    type: 'menu',
    children: []
  },
  {
    id: 'application',
    title: '申请管理',
    route: '/application',
    icon: 'Document',
    type: 'menu',
    children: []
  },
  {
    id: 'customer',
    title: '客户管理',
    route: '/customer',
    icon: 'User',
    type: 'menu',
    children: []
  },
  {
    id: 'system',
    title: '系统管理',
    route: '/system',
    icon: 'Setting',
    type: 'category',
    children: [
      {
        id: 'system-users',
        title: '用户管理',
        route: '/system/users',
        icon: 'User',
        type: 'menu'
      },
      {
        id: 'system-roles',
        title: '角色管理',
        route: '/system/roles',
        icon: 'UserFilled',
        type: 'menu'
      },
      {
        id: 'system-permissions',
        title: '权限管理',
        route: '/system/permissions',
        icon: 'Lock',
        type: 'menu'
      }
    ]
  }
]

// 需要过滤的测试页面和开发页面
const TEST_PAGES_TO_FILTER = [
  '403', '404', 'ExamplePage', 'Login', 'StandardTemplate',
  'GlobalStyleTest', 'ImageUploaderDemo', 'TemplateDemo',
  'Application', 'Marketing', 'Enrollment-plan'
];

// 需要过滤的技术性页面（包含特殊字符或技术路径）
// 注意：现在我们保留一些合理的详情页面，只过滤真正无用的技术路径
const TECHNICAL_PATHS_TO_FILTER = [
  '/demo/', '/students/id', '/teachers/id'
];

// 🎯 默认菜单配置 - 当服务器数据获取失败时使用
const defaultMenuItems = [
  {
    id: 'dashboard',
    name: '工作台',
    icon: 'dashboard',
    route: '/dashboard',
    items: []
  },
  {
    id: 'student',
    name: '学生管理',
    icon: 'user',
    route: '/student',
    items: []
  },
  {
    id: 'teacher',
    name: '教师管理',
    icon: 'user-tie',
    route: '/teacher',
    items: []
  },
  {
    id: 'parent',
    name: '家长管理',
    icon: 'users',
    route: '/parent',
    items: []
  },
  {
    id: 'activity',
    name: '活动管理',
    icon: 'calendar',
    route: '/activity',
    items: []
  },
  {
    id: 'enrollment',
    name: '招生管理',
    icon: 'user-plus',
    route: '/enrollment',
    items: []
  },
  {
    id: 'finance',
    name: '财务管理',
    icon: 'dollar-sign',
    route: '/finance',
    items: []
  },
  {
    id: 'system',
    name: '系统管理',
    icon: 'settings',
    route: '/system',
    items: []
  }
];

// 🎯 响应式菜单数据引用
const dynamicMenuItems = ref([]);

// ✅ 修复：删除前端过滤配置，权限控制完全由后端负责
// 教师角色的菜单权限已在后端 role-mapping.ts 中配置

// 🎯 监听权限store的菜单数据变化
watch(
  () => permissionsStore.menuItems,
  (newMenuItems) => {
    console.log('🔄 权限菜单数据更新:', newMenuItems?.length || 0, '项');
    if (Array.isArray(newMenuItems) && newMenuItems.length > 0) {
      dynamicMenuItems.value = newMenuItems;
      console.log('✅ 动态菜单数据已更新');
    }
  },
  { immediate: true, deep: true }
);

// 🎯 生成教师中心专用菜单
const generateTeacherCenterMenu = () => {
  // 按照开发计划的7个核心模块（除工作台外的6个中心）
  // 使用与管理员角色相同的中心图标
  const teacherCenterMenus = [
    {
      id: 'teacher-notifications',
      title: '通知中心',
      route: '/teacher-center/notifications',
      icon: 'Bell', // 保持通知专用图标
      type: 'menu'
    },
    {
      id: 'teacher-tasks',
      title: '任务中心',
      route: '/teacher-center/tasks',
      icon: 'CheckSquare', // 使用与管理员任务中心相同的图标
      type: 'menu'
    },
    {
      id: 'teacher-activities',
      title: '活动中心',
      route: '/teacher-center/activities',
      icon: 'Calendar', // 使用与管理员活动中心相同的图标
      type: 'menu'
    },
    {
      id: 'teacher-enrollment',
      title: '招生中心',
      route: '/teacher-center/enrollment',
      icon: 'School', // 使用与管理员招生中心相同的图标
      type: 'menu'
    },
    {
      id: 'teacher-teaching',
      title: '教学中心',
      route: '/teacher-center/teaching',
      icon: 'BookOpen', // 使用教学专用图标
      type: 'menu'
    },
    {
      id: 'teacher-customer-tracking',
      title: '客户跟踪',
      route: '/teacher-center/customer-tracking',
      icon: 'UserCheck', // 使用与管理员客户池相同的图标
      type: 'menu'
    },
    {
      id: 'teacher-creative-curriculum',
      title: '创意课程',
      route: '/teacher-center/creative-curriculum',
      icon: 'Star', // 创意课程专用图标
      type: 'menu'
    }
  ];

  console.log('✅ 教师专用菜单生成完成:', teacherCenterMenus.map(m => m.title).join(', '));
  return teacherCenterMenus;
};

// 🎯 生成家长中心专用菜单
const generateParentCenterMenu = () => {
  // 家长中心菜单配置（使用LucideIcon中存在的图标名称）
  const parentCenterMenus = [
    {
      id: 'parent-dashboard',
      title: '我的首页',
      route: '/parent-center/dashboard',
      icon: 'Home',  // ✅ 修复：使用LucideIcon中的图标
      type: 'menu'
    },
    {
      id: 'my-children',
      title: '我的孩子',
      route: '/parent-center/children',
      icon: 'GraduationCap',  // ✅ 修复：毕业帽图标
      type: 'menu'
    },
    {
      id: 'child-growth',
      title: '成长报告',
      route: '/parent-center/child-growth',
      icon: 'TrendingUp',  // ✅ 修复：上升趋势图标
      type: 'menu'
    },
    {
      id: 'assessment',
      title: '能力测评',
      route: '/parent-center/assessment',
      icon: 'FileText',  // ✅ 修复：文档图标
      type: 'menu'
    },
    {
      id: 'games',
      title: '游戏大厅',
      route: '/parent-center/games',
      icon: 'Gamepad2',  // ✅ 修复：游戏手柄图标
      type: 'menu'
    },
    {
      id: 'ai-assistant',
      title: 'AI育儿助手',
      route: '/parent-center/ai-assistant',
      icon: 'Brain',  // ✅ 修复：大脑/AI图标
      type: 'menu'
    },
    {
      id: 'activities',
      title: '活动列表',
      route: '/parent-center/activities',
      icon: 'Calendar',  // ✅ 正确：日历图标
      type: 'menu'
    },
    {
      id: 'parent-communication',
      title: '智能沟通',
      route: '/parent-center/communication',
      icon: 'MessageSquare',  // ✅ 修复：消息框图标
      type: 'menu'
    },
    {
      id: 'feedback',
      title: '意见反馈',
      route: '/parent-center/feedback',
      icon: 'Edit3',  // ✅ 修复：编辑图标
      type: 'menu'
    },
    {
      id: 'parent-profile',
      title: '我的信息',
      route: '/parent-center/profile',
      icon: 'UserCircle',  // ✅ 修复：用户图标
      type: 'menu'
    }
  ];

  console.log('✅ 家长专用菜单生成完成:', parentCenterMenus.map(m => m.title).join(', '));
  return parentCenterMenus;
};

// 🎯 动态菜单配置 - 基于角色权限的中心菜单
const filteredNavigation = computed(() => {
  console.log('🔍 Sidebar filteredNavigation 重新计算 - 角色权限模式');

  // 🎯 检查当前路径是否为教师中心或家长中心
  const currentPath = route.path;
  const isTeacherCenter = currentPath.startsWith('/teacher-center');
  const isParentCenter = currentPath.startsWith('/parent-center');
  console.log('🎯 当前路径:', currentPath, '教师中心:', isTeacherCenter, '家长中心:', isParentCenter);

  // 如果是教师中心，返回教师中心专用菜单
  if (isTeacherCenter) {
    console.log('🏫 生成教师中心专用菜单');
    return generateTeacherCenterMenu();
  }

  // 如果是家长中心，返回家长中心专用菜单
  if (isParentCenter) {
    console.log('👨‍👩‍👧‍👦 生成家长中心专用菜单');
    return generateParentCenterMenu();
  }

  // 🎯 使用本地响应式菜单数据
  const menuItems = dynamicMenuItems.value;
  console.log('📋 权限菜单数据:', menuItems?.length || 0, '项');

  // 🎯 强制检查权限store的hasMenuItems计算属性
  const hasMenuItems = permissionsStore.hasMenuItems;
  console.log('📋 hasMenuItems状态:', hasMenuItems);
  console.log('📋 menuItems.length:', menuItems?.length || 0);
  console.log('📋 menuItems类型:', typeof menuItems, Array.isArray(menuItems));

  // 🎯 检查是否有权限数据 - 修复响应式检查逻辑
  if (!menuItems || !Array.isArray(menuItems) || menuItems.length === 0) {
    console.log('⚠️ 权限数据未加载，使用静态中心菜单');
    // 只返回中心类型的菜单项
    const centerMenus = staticMenuItems.find(section => section.id === 'business-centers')?.children || [];
    // 添加工作台
    const dashboardItem = {
      id: 'dashboard',
      title: '工作台',
      route: '/dashboard',
      icon: 'Dashboard',
      type: 'menu'
    };
    // 添加业务中心
    const businessCenterItem = {
      id: 'business-center',
      title: '业务中心',
      route: '/centers/business',
      icon: 'Briefcase',
      type: 'menu'
    };
    const allCenterMenus = [dashboardItem, businessCenterItem, ...centerMenus];
    console.log('📋 使用静态中心菜单:', allCenterMenus.map(m => m.title).join(', '));
    return allCenterMenus;
  }

  // ✅ 修复：前端不应该过滤菜单，直接使用后端返回的数据
  // 后端已经根据角色返回了正确的菜单，前端只需要显示
  console.log('✅ 使用后端返回的完整菜单数据，不进行前端过滤');

  // 🎯 过滤出category类型的菜单项（一级分类）
  const centerCategories = menuItems.filter(item => item.type === 'category');

  console.log('🏢 找到菜单分类:', centerCategories.length, '个', centerCategories.map(c => c.name).join(', '));

  // 🎯 中文名称映射 - 优先使用 chineseName 或 chinese_name 字段
  const getChineseName = (item: any): string => {
    // 优先使用 chineseName 或 chinese_name 字段（兼容驼峰和蛇形命名）
    if (item && (item.chineseName || item.chinese_name)) {
      return item.chineseName || item.chinese_name;
    }

    // 如果传入的是字符串，使用映射表
    const name = typeof item === 'string' ? item : (item?.name || '');
    const nameMap: Record<string, string> = {
      'Personnel Center': '人员中心',
      'Activity Center': '活动中心',
      'Enrollment Center': '招生中心',
      'Marketing Center': '营销中心',
      'Business Center': '业务中心',
      'Customer Pool Center': '客户池中心',
      'System Center': '系统中心',
      'Finance Center': '财务中心',
      'Task Center': '任务中心',
      'Teaching Center': '教学中心',
      'Script Center': '话术中心',
      'Media Center': '新媒体中心',
      // 已禁用的中心（保留映射以防缓存问题）
      'AI Center': '智能中心',
      'Analytics Center': '数据分析中心',
      'Inspection Center': '督查中心',
      // 其他可能的变体
      'FinanceCenter': '财务中心',
      'System Management': '系统中心',
      'Dashboard Center': '仪表板中心',
      '任务中心': '任务中心',
      '系统管理': '系统中心',
      '话术中心': '话术中心',
      'Personnel Management': '人员中心',
      'Activity Management': '活动中心',
      'Enrollment Management': '招生中心',
      'Marketing Management': '营销中心',
      'AI Management': '智能中心',
      'Finance Management': '财务中心',
      'System Settings': '系统中心'
    };
    return nameMap[name] || name;
  };

  // 🎯 路由映射
  const getRouteForCenter = (name: string): string => {
    const routeMap: Record<string, string> = {
      'Personnel Center': '/centers/personnel',
      'Activity Center': '/centers/activity',
      'Enrollment Center': '/centers/enrollment',
      'Marketing Center': '/centers/marketing',
      'AI Center': '/centers/ai',
      'FinanceCenter': '/centers/finance',
      'Finance Center': '/centers/finance',
      'Teaching Center': '/centers/teaching',
      '任务中心': '/centers/task',
      '系统管理': '/centers/system',
      '客户池中心': '/centers/customer-pool',
      '话术中心': '/centers/script',
      'Script Center': '/centers/script',
      'Media Center': '/principal/media-center',
      '新媒体中心': '/principal/media-center'
    };
    return routeMap[name] || '/centers/personnel';
  };

  // 🎯 转换为前端菜单格式
  const centerMenus = centerCategories.map(category => {
    // 查找对应的页面权限
    const centerPage = menuItems.find(item =>
      item.type === 'menu' &&
      item.parentId === category.id
    );

    return {
      id: category.code || `center-${category.id}`,
      title: getChineseName(category),
      route: (centerPage && centerPage.path) || category.path || getRouteForCenter(category.name),
      icon: getCenterIcon(category.code, getChineseName(category)),
      description: getCenterDescription(category.code),
      order: category.sort || 1,
      items: [] // 中心菜单不需要二级菜单
    };
  });

  // ✅ 修复：删除前端角色过滤逻辑，直接使用后端返回的菜单
  // 后端已根据用户角色返回准确的菜单权限
  const currentUserRole = userStore.userRole;
  console.log('👤 当前用户角色:', currentUserRole);
  console.log('✅ 使用后端权限菜单:', centerMenus.length, '个中心');
  console.log('📋 菜单列表:', centerMenus.map(m => m.title).join(', '));

  // 添加工作台到动态菜单
  const dashboardItem = {
    id: 'dashboard',
    title: '工作台',
    route: '/dashboard',
    icon: 'Dashboard',
    description: '系统概览与数据统计',
    order: 0
  };

  // 🎯 不再硬编码业务中心，完全由后端API控制
  // 业务中心已经包含在后端返回的centerMenus中
  // ✅ 修复：直接使用后端返回的菜单，不再前端过滤
  return [dashboardItem, ...centerMenus];
});

// 🎯 获取中心图标的辅助函数 - 更有针对性的图标映射
const getCenterIcon = (centerCode: string, categoryName?: string): string => {
  // 如果 centerCode 有效，使用 code 映射 - 更有针对性的图标
  const iconMap: Record<string, string> = {
    'BUSINESS_CENTER_VIEW': 'Briefcase',  // 业务中心图标
    'PERSONNEL_CENTER': 'personnel',      // 人员图标
    'ACTIVITY_CENTER': 'activity',        // 活动图标
    'ENROLLMENT_CENTER': 'enrollment',    // 招生图标
    'MARKETING_CENTER': 'marketing',      // 营销图标
    'AI_CENTER': 'ai-center',            // AI图标
    'FINANCE_CENTER': 'finance',         // 财务图标
    'SYSTEM_CENTER': 'system',           // 系统图标
    'TASK_CENTER_CATEGORY': 'task',      // 任务图标(改为task)
    'SCRIPT_CENTER': 'script',           // 话术图标(改为script)
    'MEDIA_CENTER': 'media',             // 媒体图标
    'USAGE_CENTER': 'data-analysis',     // 用量中心图标
    'CUSTOMER_POOL_CENTER': 'customers', // 客户池中心图标
    'TEACHING_CENTER': 'teaching',       // 教学中心图标
    'ATTENDANCE_CENTER': 'attendance',   // 考勤中心图标
    'INSPECTION_CENTER': 'inspection',   // 督查中心图标
    'CALL_CENTER': 'call-center',        // 呼叫中心图标
    'GROUP_MANAGEMENT': 'group'          // 集团管理图标
  };

  // 如果 centerCode 有效且在映射中，直接返回
  if (centerCode && centerCode !== 'undefined' && iconMap[centerCode]) {
    return iconMap[centerCode];
  }

  // 如果 centerCode 无效，根据名称映射 - 更精确的映射
  if (categoryName) {
    const nameIconMap: Record<string, string> = {
      '工作台': 'dashboard',         // 仪表板图标
      '人员中心': 'personnel',       // 人员管理图标
      '人事中心': 'personnel',       // 人员管理图标
      '活动中心': 'activity',        // 活动日历图标
      '招生中心': 'enrollment',      // 学校招生图标
      '营销中心': 'marketing',       // 营销趋势图标
      'AI中心': 'ai-center',        // AI大脑图标
      '财务中心': 'finance',         // 财务金钱图标
      '系统中心': 'system',          // 系统设置图标
      '系统管理': 'system',          // 系统设置图标
      '任务中心': 'task',           // 任务清单图标
      '客户池中心': 'customers',     // 客户群体图标
      '话术中心': 'script',         // 话术脚本图标
      '新媒体中心': 'media',        // 媒体视频图标
      '用量中心': 'data-analysis',   // 用量中心图标
      '仪表板中心': 'dashboard',    // 仪表板图标
      '教学中心': 'teaching',       // 教学中心图标
      '考勤中心': 'attendance',     // 考勤中心图标
      '业务中心': 'Briefcase',      // 业务中心图标
      '督查中心': 'inspection',     // 督查中心图标
      '检查中心': 'inspection',     // 检查中心图标
      '呼叫中心': 'call-center',    // 呼叫中心图标
      '集团管理': 'group'           // 集团管理图标
    };

    return nameIconMap[categoryName] || 'dashboard';
  }

  return 'dashboard';
};

// 🎯 获取中心描述的辅助函数
const getCenterDescription = (centerCode: string): string => {
  const descMap: Record<string, string> = {
    'PERSONNEL_CENTER': '教师与学生管理',
    'ACTIVITY_CENTER': '活动计划与管理',
    'ENROLLMENT_CENTER': '招生计划与申请管理',
    'MARKETING_CENTER': '营销活动与推广',
    'AI_CENTER': 'AI智能助手与工具',
    'TASK_CENTER_CATEGORY': '任务管理与协作',
    'SYSTEM_CENTER': '系统管理与配置',
    'CUSTOMER_POOL_CENTER': '客户池管理与跟进',
    'MEDIA_CENTER': 'AI智能新媒体创作平台'
  };
  return descMap[centerCode] || '';
};

// 🎯 备用中心菜单（当权限数据异常时使用）
const getBackupCenterMenus = () => {
  return [
    {
      id: 'personnel-center',
      title: '人员中心',
      route: '/centers/personnel',
      icon: 'personnel',
      description: '教师与学生管理',
      order: 1,
      items: []
    },
    {
      id: 'enrollment-center',
      title: '招生中心',
      route: '/centers/enrollment',
      icon: 'enrollment',
      description: '招生计划与申请管理',
      order: 2,
      items: []
    },
    {
      id: 'marketing-center',
      title: '营销中心',
      route: '/centers/marketing',
      icon: 'marketing',
      description: '营销活动与推广管理',
      order: 3,
      items: []
    },
    {
      id: 'activity-center',
      title: '活动中心',
      route: '/centers/activity',
      icon: 'activity',
      description: '活动计划与管理',
      order: 4,
      items: []
    },
    {
      id: 'media-center',
      title: '新媒体中心',
      route: '/principal/media-center',
      icon: 'media',
      description: 'AI智能新媒体创作平台',
      order: 5,
      items: []
    },
    {
      id: 'task-center',
      title: '任务中心',
      route: '/centers/task',
      icon: 'task',
      description: '任务分配与跟踪管理',
      order: 6,
      items: []
    },
    {
      id: 'script-center',
      title: '话术中心',
      route: '/centers/script',
      icon: 'script',
      description: '销售话术与培训管理',
      order: 7,
      items: []
    },
    {
      id: 'finance-center',
      title: '财务中心',
      route: '/centers/finance',
      icon: 'finance',
      description: '财务管理与统计分析',
      order: 8,
      items: []
    },
    {
      id: 'ai-center',
      title: 'AI中心',
      route: '/centers/ai',
      icon: 'ai',
      description: 'AI智能助手与专家咨询',
      order: 9,
      items: []
    },
    {
      id: 'system-center',
      title: '系统中心',
      route: '/centers/system',
      icon: 'system',
      description: '系统设置与管理',
      order: 10,
      items: []
    }
  ];
};

// 🎯 旧的复杂权限逻辑已移除，现在使用简化的角色权限菜单








// 展开状态管理已在上面声明

// 判断菜单项是否激活
function isActiveItem(item: DynamicNavigationItem): boolean {
  const currentPath = route.path
  
  // 精确匹配
  if (currentPath === item.route) {
    return true
  }
  
  // 处理动态路由参数 (如 /student/:id)
  const routeRegex = item.route.replace(/:[^/]+/g, '[^/]+')
  const regex = new RegExp(`^${routeRegex}$`)
  
  if (regex.test(currentPath)) {
    return true
  }
  
  // 处理嵌套路由 (如 /dashboard 匹配 /dashboard/schedule)
  if (item.route !== '/' && currentPath.startsWith(item.route + '/')) {
    return true
  }
  
  return false
}

// 处理父菜单项点击
function handleParentItemClick(item: DynamicNavigationItem) {
  // 切换展开状态
  const index = expandedItems.value.indexOf(item.id)
  if (index > -1) {
    expandedItems.value.splice(index, 1)
  } else {
    expandedItems.value.push(item.id)
  }

  // 父菜单项（有子菜单的项）只展开/收起，不进行导航
  // 这样可以避免一级菜单被点击时跳转到404页面
}


// 新增：处理section(中心)点击
const handleSectionClick = (section: any) => {
  console.log('点击中心:', section.title, '路由:', section.route)
  
  // 直接跳转到对应的center页面
  if (section.route) {
    router.push(section.route)
  }
  
  // 在移动端点击后关闭侧边栏
  if (props.isMobile) {
    emit('menuClick')
  }
}

// 新增：判断section是否为当前活动项
const isActiveSection = (section: any): boolean => {
  const currentPath = route.path
  return currentPath === section.route || currentPath.startsWith(section.route + '/')
}

// 方法
const handleItemClick = (item: DynamicNavigationItem) => {
  activeItemId.value = item.id
  
  // 在移动端点击项目后关闭侧边栏
  if (props.isMobile) {
    emit('menuClick')
  }
  
  // 路由跳转
  router.push(item.route)
  emit('menuClick')
}


// 切换分组展开/收缩状态
const toggleSection = (sectionId: string) => {
  const index = expandedItems.value.indexOf(sectionId)
  if (index > -1) {
    expandedItems.value.splice(index, 1)
  } else {
    expandedItems.value.push(sectionId)
  }
}

// 用户区域处理函数已移除


// 初始化和路由变化监听
onMounted(async () => {
  // 初始化权限数据
  await permissionsStore.initializePermissions()
  updateActiveState()
})

watch(() => route.path, () => {
  updateActiveState()
})

// 监听权限变化
watch(() => permissionsStore.hasMenuItems, (hasItems) => {
  if (hasItems) {
    updateActiveState()
  }
})

// 更新激活状态
function updateActiveState() {
  // 找到当前激活的菜单项
  for (const item of filteredNavigation.value) {
    if (isActiveItem(item)) {
      activeItemId.value = item.id
      return
    }

    // 检查子菜单（如果存在）
    if (item.children && Array.isArray(item.children)) {
      for (const child of item.children) {
        if (isActiveItem(child)) {
          activeItemId.value = child.id
          // 展开父菜单
          if (!expandedItems.value.includes(item.id)) {
            expandedItems.value.push(item.id)
          }
          return
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.sidebar {
  position: relative;
  width: 240px !important; // 展开状态的默认宽度
  min-width: 240px;
  max-width: 240px;
  height: 100vh;
  background: var(--sidebar-bg) !important; // 强制使用不透明背景
  border-right: var(--border-width-base) solid var(--sidebar-border);
  box-shadow: var(--sidebar-shadow);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  z-index: 1001;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  backdrop-filter: none !important; // 移除任何背景滤镜效果
}

.sidebar.collapsed {
  width: 100px !important; // 收缩状态：100px 宽度，图标更清晰可见
  min-width: 100px !important;
  max-width: 100px !important;
  
  // 收缩状态下的图标样式 - 100px 宽度设计，Builder.io风格
  .nav-icon {
    width: 2var(--spacing-sm) !important;  // 收缩状态图标尺寸，更大更清晰
    height: var(--button-height-sm) !important;
    font-size: var(--text-3xl) !important;
    transform: none !important;  // 移除任何变换动画
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;  // 更平滑的过渡
  }

  .center-item {
    padding: var(--text-lg) !important;  // 100px 宽度下的舒适内边距
    justify-content: center !important;
    border: var(--border-width-base) solid var(--white-alpha-8) !important;  // Builder.io 标准边框
    border-radius: var(--radius-md) !important;  // 统一的圆角

    &:hover {
      border-color: rgba(139, 92, 246, 0.6) !important;  // hover时的紫色边框
      background: var(--white-alpha-5) !important;  // 轻微的背景变化
    }
  }
}

.sidebar.show {
  width: 240px; // 展开状态宽度
}

.sidebar-header {
  padding: var(--text-sm);
  border-bottom: var(--border-width-base) solid var(--sidebar-border);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--sidebar-bg);
  height: 6var(--spacing-xs);
  min-height: 6var(--spacing-xs);

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: var(--text-sm);
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
  width: 100%;
  justify-content: center;
}

.logo-icon {
  width: var(--icon-size); height: var(--icon-size);
  border-radius: var(--radius-xl);
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(124, 127, 245, 0.25);
  flex-shrink: 0;
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--radius-full);
}

.logo-text {
  font-size: var(--unified-font-size-large) !important;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
}

.sidebar-nav {
  flex: 1;
  padding: var(--spacing-xs) var(--spacing-sm);
  overflow-y: auto;
  overflow-x: hidden;

  /* 自定义滚动条样式 - var(--border-width-base) 宽度 */
  &::-webkit-scrollbar {
    width: var(--border-width-base);
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--white-alpha-20);
    border-radius: var(--border-width-base);
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--white-alpha-30);
  }
}

.nav-section {
  margin-bottom: 0.75rem;
}

.primary-section {
  position: relative;
  margin-bottom: 1rem;
  padding: 0;
  cursor: pointer;

  &::before {
    content: '';
    position: absolute;
    left: -1rem;
    top: 0;
    bottom: 0;
    width: var(--spacing-xs);
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    border-radius: 0 2px 2px 0;
    opacity: 0;
    transform: scaleY(0);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover::before {
    opacity: 1;
    transform: scaleY(1);
  }

  &.expanded::before {
    opacity: 1;
    transform: scaleY(1);
    background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  }
}

// 中心导航项样式 - Builder.io 风格设计
.center-item {
  display: flex;
  align-items: center;
  gap: var(--text-sm);  // 展开状态下图标和文字的间距
  padding: var(--text-sm) var(--text-lg);  // 展开状态的内边距
  margin: var(--spacing-2xs) var(--spacing-sm);
  background: transparent;
  border-radius: var(--radius-md);  // 更细腻的圆角
  border: var(--border-width-base) solid var(--white-alpha-8);  // 非常淡的边框，几乎看不见
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);  // 更平滑的过渡
  text-decoration: none;
  color: var(--sidebar-text);
  position: relative;
  overflow: hidden;
  min-height: var(--button-height-xl);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, var(--white-alpha-10), transparent);
    transition: left 0.6s ease;
  }

  &:hover {
    background: var(--white-alpha-5);  // 非常轻微的背景变化
    border-color: rgba(139, 92, 246, 0.6);  // 淡紫色边框高亮，类似Builder.io
    color: var(--white-alpha-95);  // 轻微提亮文字
    text-decoration: none;
    transform: translateY(-var(--border-width-base));  // 轻微上移效果

    .nav-icon {
      color: var(--white-alpha-95);  // 图标也轻微提亮
    }

    .nav-text {
      color: var(--white-alpha-95);  // 文字也轻微提亮
    }
  }

  &.active {
    background: rgba(139, 92, 246, 0.15);  // 淡紫色背景
    border-color: rgba(139, 92, 246, 0.8);  // 更明显的紫色边框
    color: rgba(255, 255, 255, 1);  // 白色文字
    box-shadow: var(--sidebar-shadow);

    .nav-icon {
      color: var(--sidebar-item-active-text) !important;
    }

    .nav-text {
      color: var(--sidebar-item-active-text);
      font-weight: 600;
    }

    .nav-desc {
      color: var(--sidebar-item-active-text);
      opacity: 0.85;
    }
  }
  
}

  .nav-icon {
    flex-shrink: 0;
    width: var(--text-2xl);  // 展开状态下的图标尺寸
    height: var(--text-2xl);
    color: var(--sidebar-text) !important;  // 强制设置图标颜色
    transition: all 0.2s ease;  // 平滑过渡效果
    opacity: 0.8;  // 默认透明度
  }

  // 悬停效果增强
  &:hover .nav-icon {
    opacity: 1;
    transform: scale(1.05);  // 轻微放大效果
  }

  .nav-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .nav-text {
    font-weight: 500;
    font-size: var(--text-lg) !important;
    color: var(--sidebar-text) !important;
    transition: all 0.2s ease;
  }

  .nav-desc {
    font-size: var(--text-sm);
    color: var(--text-muted);
    line-height: 1.3;
    margin-top: var(--spacing-sm);
  }
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: var(--sidebar-item-bg);
  border-radius: var(--text-sm);
  border: var(--border-width-base) solid var(--sidebar-item-border);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, var(--white-alpha-10), transparent);
    transition: left 0.6s ease;
  }

  &:hover {
    background: var(--sidebar-item-hover-bg);
    border-color: var(--sidebar-item-hover-border);
    transform: translateY(-2px);
    box-shadow: 0 var(--spacing-sm) 25px var(--shadow-medium);

    &::before {
      left: 100%;
    }
  }

  &:focus-within {
    outline: 2px solid var(--accent-primary, #3182ce);
    outline-offset: 2px;
  }
}

.section-icon {
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: var(--sidebar-item-bg);
  border-radius: var(--spacing-sm);
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.primary-section:hover .section-icon {
  background: var(--primary-color);
  color: white;
  transform: scale(1.1);
}

.section-info {
  flex: 1;
  min-width: 0;
}

.section-name {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.2;
  transition: color 0.3s ease;
}

.section-desc {
  display: block;
  font-size: 0.75rem;
  color: var(--text-muted);
  line-height: 1.2;
  margin-top: 0.125rem;
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.primary-section:hover .section-name {
  color: var(--primary-color);
}

.primary-section:hover .section-desc {
  opacity: 1;
}

.section-arrow {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0.6;
  margin-left: auto;
}

.section-arrow.rotated {
  transform: rotate(180deg);
}

.secondary-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  margin-bottom: 0.25rem;
  margin-left: 0.5rem;
  border-radius: var(--radius-md);  // 统一的圆角
  border: var(--border-width-base) solid var(--white-alpha-8);  // 细腻的边框
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);  // 更平滑的过渡
  position: relative;

  &:hover {
    background: var(--white-alpha-5);  // 轻微的背景变化
    border-color: rgba(139, 92, 246, 0.6);  // 紫色边框高亮
    color: var(--text-primary);
    transform: translateY(-var(--border-width-base));  // 轻微上移
  }

  &.active {
    background: var(--primary-color);
    color: white;
    box-shadow: 0 var(--spacing-xs) var(--text-sm) rgba(99, 102, 241, 0.3);
    border-left-color: var(--primary-color);
    transform: translateX(var(--spacing-xs));
  }

  &:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }
}

.tertiary-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.125rem;
  margin-left: 2rem;
  border-radius: var(--spacing-xs);  // 更小的圆角
  border: var(--border-width-base) solid var(--white-alpha-8);  // Builder.io 标准边框
  color: var(--text-muted);
  text-decoration: none;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);  // 平滑过渡
  position: relative;
  font-size: 0.875rem;
  opacity: 0.9;

  &:hover {
    background: var(--white-alpha-4);  // 轻微背景变化
    border-color: rgba(139, 92, 246, 0.6);  // Builder.io 标准紫色边框
    color: var(--text-secondary);
    opacity: 1;
    transform: translateY(-var(--border-width-base));  // 轻微上移
  }

  &.active {
    background: rgba(99, 102, 241, 0.1);
    color: var(--primary-color);
    border-left-color: var(--primary-color);
    border-left-width: 2px;
    opacity: 1;
    transform: translateX(2px);
  }
}

.nav-icon {
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.secondary-item:hover .nav-icon {
  transform: scale(1.1);
}

.nav-text {
  font-weight: 500;
  color: inherit;
}


/* 用户区域样式已移除 */

.nav-submenu {
  margin-top: 0.5rem;
  padding-left: 1rem;
  border-left: 2px solid var(--border-color);
  animation: slideDown 0.3s ease-out;
}

.nav-item-parent {
  justify-content: space-between;
}

.nav-arrow {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0.6;
  margin-left: auto;

  &.rotated {
    transform: rotate(180deg);
  }
}

@media (max-width: var(--breakpoint-lg)) {
  .sidebar {
    width: 280px;
  }

  .sidebar.collapsed {
    width: 80px;
  }
}

@media (max-width: var(--breakpoint-md)) {
  .sidebar {
    position: fixed;
    width: 240px;  // 移动端展开时的宽度
    transform: translateX(-100%);
    z-index: 1050;
    transition: transform 0.3s ease;

  }

  .sidebar.show {
    transform: translateX(0);
  }

  .sidebar.collapsed {
    transform: translateX(-100%);
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .sidebar {
    width: 100vw;
  }

  .sidebar-header {
    padding: 0.5rem;
  }

  .sidebar-nav {
    padding: 0.5rem;
  }

  .section-header {
    padding: 0.75rem;
  }

  .secondary-item {
    padding: 0.5rem 0.75rem;
    margin-left: 0.25rem;
  }

  .tertiary-item {
    padding: 0.375rem 0.5rem;
    margin-left: 1.5rem;
    font-size: 0.8125rem;
  }
}

.floating-animation {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

</style>