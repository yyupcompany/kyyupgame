/**
 * 家长工作台路由配置
 * 
 * 功能说明:
 * - 家长角色的专属工作台
 * - 我的孩子、成长报告、测评中心(发育测评、幼小衔接、学科测评、成长轨迹)
 * - 游戏大厅(10个益智游戏)
 * - AI育儿助手、活动列表、家校沟通、意见反馈
 * - 相册中心、园所奖励、最新通知、我的信息
 * 
 * 权限说明:
 * - 需要家长角色 (parent)
 * - 管理员也可以访问
 */

import { RouteRecordRaw } from 'vue-router'

// 布局组件导入
const Layout = () => import('@/layouts/MainLayout.vue')

export const parentCenterRoutes: RouteRecordRaw[] = [
  // 🔧 修复：修正路径（去掉重复斜杠）
  {
    path: '/parent-center',
    name: 'ParentCenter',
    component: Layout,
    redirect: '/parent-center/dashboard',
    meta: {
      title: '家长中心',
      requiresAuth: true,
      roles: ['parent', 'admin'],
      icon: 'User'
    },
    children: [
      // 我的首页
      {
        path: 'dashboard',
        name: 'ParentDashboard',
        component: () => import('@/pages/parent-center/dashboard/index.vue'),
        meta: {
          title: '我的首页',
          requiresAuth: true,
          roles: ['parent', 'admin'],
          icon: 'HomeFilled'
        }
      },

      // 我的孩子
      {
        path: 'children',
        name: 'ParentChildren',
        component: () => import('@/pages/parent-center/children/index.vue'),
        meta: {
          title: '我的孩子',
          requiresAuth: true,
          roles: ['parent', 'admin'],
          icon: 'School'
        }
      },

      // 成长报告
      {
        path: 'child-growth',
        name: 'ParentChildGrowthReport',
        component: () => import('@/pages/parent-center/child-growth/index.vue'),
        meta: {
          title: '成长报告',
          requiresAuth: true,
          roles: ['parent', 'admin'],
          icon: 'TrendCharts'
        }
      },

      // 测评中心 - 开始测评
      {
        path: 'assessment/start',
        name: 'ParentAssessmentStart',
        component: () => import('@/pages/parent-center/assessment/Start.vue'),
        meta: {
          title: '开始测评',
          requiresAuth: false,
          hideInMenu: true
        }
      },

      // 测评中心主模块
      {
        path: 'assessment',
        name: 'ParentAssessment',
        component: () => import('@/pages/parent-center/assessment/Layout.vue'),
        redirect: '/parent-center/assessment/development',
        meta: {
          title: '测评中心',
          requiresAuth: true,
          roles: ['parent', 'admin'],
          icon: 'Document'
        },
        children: [
          // 2-6岁发育测评
          {
            path: 'development',
            name: 'ParentDevelopmentAssessment',
            component: () => import('@/pages/parent-center/assessment/index.vue'),
            meta: {
              title: '2-6岁发育测评',
              requiresAuth: true,
              roles: ['parent', 'admin'],
              icon: 'TrendCharts'
            }
          },
          // 幼小衔接测评
          {
            path: 'school-readiness',
            name: 'ParentSchoolReadinessAssessment',
            component: () => import('@/pages/parent-center/assessment/SchoolReadiness.vue'),
            meta: {
              title: '幼小衔接',
              requiresAuth: true,
              roles: ['parent', 'admin'],
              icon: 'Notebook'
            }
          },
          // 学科测评
          {
            path: 'academic',
            name: 'ParentAcademicAssessment',
            component: () => import('@/pages/parent-center/assessment/Academic.vue'),
            meta: {
              title: '学科测评',
              requiresAuth: true,
              roles: ['parent', 'admin'],
              icon: 'Reading'
            }
          },
          // 测评进行中
          {
            path: 'doing/:recordId',
            name: 'ParentAssessmentDoing',
            component: () => import('@/pages/parent-center/assessment/Doing.vue'),
            meta: {
              title: '测评进行中',
              requiresAuth: false,
              hideInMenu: true
            }
          },
          // 测评报告
          {
            path: 'report/:recordId',
            name: 'ParentAssessmentReport',
            component: () => import('@/pages/parent-center/assessment/Report.vue'),
            meta: {
              title: '测评报告',
              requiresAuth: false,
              hideInMenu: true
            }
          },
          // 成长轨迹
          {
            path: 'growth-trajectory',
            name: 'ParentGrowthTrajectory',
            component: () => import('@/pages/parent-center/assessment/GrowthTrajectory.vue'),
            meta: {
              title: '成长轨迹',
              requiresAuth: true,
              roles: ['parent', 'admin'],
              hideInMenu: true
            }
          }
        ]
      },

      // 游戏大厅
      {
        path: 'games',
        name: 'ParentGames',
        component: () => import('@/pages/parent-center/games/index.vue'),
        meta: {
          title: '游戏大厅',
          requiresAuth: false,
          icon: 'Cpu'
        }
      },

      // 游戏1: 水果记忆大师
      {
        path: 'games/play/fruit-sequence',
        name: 'FruitSequenceGame',
        component: () => import('@/pages/parent-center/games/play/FruitSequence.vue'),
        meta: {
          title: '水果记忆大师',
          requiresAuth: false,
          hideInMenu: true
        }
      },

      // 游戏2: 公主花园找不同
      {
        path: 'games/play/princess-garden',
        name: 'PrincessGardenGame',
        component: () => import('@/pages/parent-center/games/play/PrincessGarden.vue'),
        meta: {
          title: '公主花园找不同',
          requiresAuth: false,
          hideInMenu: true
        }
      },

      // 游戏3: 太空寻宝大冒险
      {
        path: 'games/play/space-treasure',
        name: 'SpaceTreasureGame',
        component: () => import('@/pages/parent-center/games/play/SpaceTreasure.vue'),
        meta: {
          title: '太空寻宝大冒险',
          requiresAuth: false,
          hideInMenu: true
        }
      },

      // 游戏4: 动物观察员
      {
        path: 'games/play/animal-observer',
        name: 'AnimalObserverGame',
        component: () => import('@/pages/parent-center/games/play/AnimalObserver.vue'),
        meta: {
          title: '动物观察员',
          requiresAuth: false,
          hideInMenu: true
        }
      },

      // 游戏5: 公主记忆宝盒
      {
        path: 'games/play/princess-memory',
        name: 'PrincessMemoryGame',
        component: () => import('@/pages/parent-center/games/play/PrincessMemory.vue'),
        meta: {
          title: '公主记忆宝盒',
          requiresAuth: false,
          hideInMenu: true
        }
      },

      // 游戏6: 恐龙记忆挑战
      {
        path: 'games/play/dinosaur-memory',
        name: 'DinosaurMemoryGame',
        component: () => import('@/pages/parent-center/games/play/DinosaurMemory.vue'),
        meta: {
          title: '恐龙记忆挑战',
          requiresAuth: false,
          hideInMenu: true
        }
      },

      // 游戏7: 颜色分类达人
      {
        path: 'games/play/color-sorting',
        name: 'ColorSortingGame',
        component: () => import('@/pages/parent-center/games/play/ColorSorting.vue'),
        meta: {
          title: '颜色分类达人',
          requiresAuth: false,
          hideInMenu: true
        }
      },

      // 游戏8: 娃娃屋整理大师
      {
        path: 'games/play/dollhouse-tidy',
        name: 'DollhouseTidyGame',
        component: () => import('@/pages/parent-center/games/play/DollhouseTidy.vue'),
        meta: {
          title: '娃娃屋整理大师',
          requiresAuth: false,
          hideInMenu: true
        }
      },

      // 游戏9: 机器人工厂
      {
        path: 'games/play/robot-factory',
        name: 'RobotFactoryGame',
        component: () => import('@/pages/parent-center/games/play/RobotFactory.vue'),
        meta: {
          title: '机器人工厂',
          requiresAuth: false,
          hideInMenu: true
        }
      },

      // AI育儿助手
      {
        path: 'ai-assistant',
        name: 'ParentAIAssistant',
        component: () => import('@/pages/parent-center/ai-assistant/index.vue'),
        meta: {
          title: 'AI育儿助手',
          requiresAuth: true,
          roles: ['parent', 'admin'],
          icon: 'ChatDotRound'
        }
      },

      // 活动列表
      {
        path: 'activities',
        name: 'ParentActivities',
        component: () => import('@/pages/parent-center/activities/index.vue'),
        meta: {
          title: '活动列表',
          requiresAuth: true,
          roles: ['parent', 'admin'],
          icon: 'Calendar'
        }
      },

      // 家校沟通
      {
        path: 'communication',
        name: 'ParentCommunication',
        component: () => import('@/pages/parent-center/communication/index.vue'),
        meta: {
          title: '家校沟通',
          requiresAuth: true,
          roles: ['parent', 'admin'],
          icon: 'Chat'
        }
      },

      // 智能沟通
      {
        path: 'communication/smart-hub',
        name: 'ParentSmartHub',
        component: () => import('@/pages/parent-center/communication/smart-hub.vue'),
        meta: {
          title: '智能沟通',
          requiresAuth: true,
          roles: ['parent', 'admin'],
          icon: 'Chat'
        }
      },

      // 意见反馈
      {
        path: 'feedback',
        name: 'ParentFeedback',
        component: () => import('@/pages/parent-center/feedback/ParentFeedback.vue'),
        meta: {
          title: '意见反馈',
          requiresAuth: true,
          roles: ['parent', 'admin'],
          icon: 'Edit'
        }
      },

      // 相册中心
      {
        path: 'photo-album',
        name: 'ParentPhotoAlbum',
        component: () => import('@/pages/parent-center/photo-album/index.vue'),
        meta: {
          title: '相册中心',
          requiresAuth: true,
          roles: ['parent', 'admin'],
          icon: 'picture'
        }
      },

      // 园所奖励
      {
        path: 'kindergarten-rewards',
        name: 'ParentKindergartenRewards',
        component: () => import('@/pages/parent-center/kindergarten-rewards.vue'),
        meta: {
          title: '园所奖励',
          requiresAuth: true,
          roles: ['parent', 'admin'],
          icon: 'gift'
        }
      },

      // 最新通知
      {
        path: 'notifications',
        name: 'ParentNotifications',
        component: () => import('@/pages/parent-center/notifications/index.vue'),
        meta: {
          title: '最新通知',
          requiresAuth: true,
          roles: ['parent', 'admin'],
          icon: 'bell'
        }
      },

      // 我的信息
      {
        path: 'profile',
        name: 'ParentProfile',
        component: () => import('@/pages/parent-center/profile/index.vue'),
        meta: {
          title: '我的信息',
          requiresAuth: true,
          roles: ['parent', 'admin'],
          icon: 'User'
        }
      }
    ]
  }
]

export default parentCenterRoutes
