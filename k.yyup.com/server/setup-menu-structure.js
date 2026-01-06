const { Sequelize } = require('sequelize');

// 数据库配置 - 使用与后端相同的MySQL配置
const sequelize = new Sequelize({
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  database: 'kargerdensales',
  username: 'root',
  password: 'pwk5ls7j',
  dialect: 'mysql',
  timezone: '+08:00',
  logging: false
});

async function setupMenuStructure() {
  try {
    console.log('🔄 开始设置菜单结构...');

    // 清空现有菜单数据（保留系统权限）
    await sequelize.query('DELETE FROM permissions WHERE type IN ("category", "menu") AND id >= 1000');
    console.log('✅ 清空现有菜单数据');

    // 定义菜单结构
    const menuStructure = [
      {
        // 园长功能分类
        id: 1000,
        name: 'principal-functions',
        chinese_name: '园长功能',
        code: 'principal-functions',
        type: 'category',
        path: '#principal',
        icon: 'UserCheck',
        sort: 1,
        parent_id: null,
        status: 1,
        children: [
          {
            id: 1001,
            name: 'dashboard',
            chinese_name: '仪表板',
            code: 'principal-dashboard',
            type: 'menu',
            path: '/principal/dashboard',
            component: 'pages/principal/Dashboard.vue',
            icon: 'BarChart3',
            sort: 1,
            status: 1
          },
          {
            id: 1002,
            name: '基本资料',
            type: 'menu',
            path: '/principal/basic-info',
            component: 'pages/principal/basic-info',
            icon: 'FileText',
            sort_order: 2
          },
          {
            id: 1003,
            name: '绩效管理',
            type: 'menu',
            path: '/principal/performance',
            component: 'pages/principal/Performance.vue',
            icon: 'TrendingUp',
            sort_order: 3
          },
          {
            id: 1004,
            name: '绩效规则',
            type: 'menu',
            path: '/principal/performance-rules',
            component: 'pages/principal/PerformanceRules.vue',
            icon: 'Settings',
            sort_order: 4
          },
          {
            id: 1005,
            name: '营销分析',
            type: 'menu',
            path: '/principal/marketing-analysis',
            component: 'pages/principal/MarketingAnalysis.vue',
            icon: 'PieChart',
            sort_order: 5
          },
          {
            id: 1006,
            name: '客户池',
            type: 'menu',
            path: '/principal/customer-pool',
            component: 'pages/principal/CustomerPool.vue',
            icon: 'Users',
            sort_order: 6
          },
          {
            id: 1007,
            name: '智能决策',
            type: 'menu',
            path: '/principal/intelligent-dashboard',
            component: 'pages/principal/decision-support/intelligent-dashboard.vue',
            icon: 'Brain',
            sort_order: 7
          }
        ]
      },
      {
        // 招生管理分类
        id: 2000,
        name: '招生管理',
        type: 'category',
        path: '#enrollment',
        icon: 'GraduationCap',
        sort_order: 2,
        parent_id: null,
        children: [
          {
            id: 2001,
            name: '招生计划',
            type: 'menu',
            path: '/enrollment/plans',
            component: 'pages/enrollment/PlanList.vue',
            icon: 'Calendar',
            sort_order: 1
          },
          {
            id: 2002,
            name: '申请管理',
            type: 'menu',
            path: '/enrollment/applications',
            component: 'pages/enrollment/ApplicationList.vue',
            icon: 'FileCheck',
            sort_order: 2
          },
          {
            id: 2003,
            name: '招生统计',
            type: 'menu',
            path: '/enrollment/statistics',
            component: 'pages/enrollment/Statistics.vue',
            icon: 'BarChart',
            sort_order: 3
          }
        ]
      },
      {
        // 学生管理分类
        id: 3000,
        name: '学生管理',
        type: 'category',
        path: '#students',
        icon: 'Users',
        sort_order: 3,
        parent_id: null,
        children: [
          {
            id: 3001,
            name: '学生列表',
            type: 'menu',
            path: '/students',
            component: 'pages/student/StudentList.vue',
            icon: 'User',
            sort_order: 1
          },
          {
            id: 3002,
            name: '班级管理',
            type: 'menu',
            path: '/students/classes',
            component: 'pages/student/ClassList.vue',
            icon: 'Users',
            sort_order: 2
          },
          {
            id: 3003,
            name: '学生档案',
            type: 'menu',
            path: '/students/profiles',
            component: 'pages/student/StudentProfiles.vue',
            icon: 'FileText',
            sort_order: 3
          }
        ]
      },
      {
        // 教师管理分类
        id: 4000,
        name: '教师管理',
        type: 'category',
        path: '#teachers',
        icon: 'UserCheck',
        sort_order: 4,
        parent_id: null,
        children: [
          {
            id: 4001,
            name: '教师列表',
            type: 'menu',
            path: '/teachers',
            component: 'pages/teacher/TeacherList.vue',
            icon: 'User',
            sort_order: 1
          },
          {
            id: 4002,
            name: '教师绩效',
            type: 'menu',
            path: '/teachers/performance',
            component: 'pages/teacher/TeacherPerformance.vue',
            icon: 'TrendingUp',
            sort_order: 2
          },
          {
            id: 4003,
            name: '培训管理',
            type: 'menu',
            path: '/teachers/training',
            component: 'pages/teacher/TrainingManagement.vue',
            icon: 'BookOpen',
            sort_order: 3
          }
        ]
      },
      {
        // 家长管理分类
        id: 5000,
        name: '家长管理',
        type: 'category',
        path: '#parents',
        icon: 'Heart',
        sort_order: 5,
        parent_id: null,
        children: [
          {
            id: 5001,
            name: '家长列表',
            type: 'menu',
            path: '/parents',
            component: 'pages/parent/ParentList.vue',
            icon: 'User',
            sort_order: 1
          },
          {
            id: 5002,
            name: '家长沟通',
            type: 'menu',
            path: '/parents/communication',
            component: 'pages/parent/Communication.vue',
            icon: 'MessageCircle',
            sort_order: 2
          },
          {
            id: 5003,
            name: '反馈管理',
            type: 'menu',
            path: '/parents/feedback',
            component: 'pages/parent/FeedbackManagement.vue',
            icon: 'MessageSquare',
            sort_order: 3
          }
        ]
      },
      {
        // 系统管理分类
        id: 6000,
        name: '系统管理',
        type: 'category',
        path: '#system',
        icon: 'Settings',
        sort_order: 6,
        parent_id: null,
        children: [
          {
            id: 6001,
            name: '用户管理',
            type: 'menu',
            path: '/system/users',
            component: 'pages/system/UserManagement.vue',
            icon: 'Users',
            sort_order: 1
          },
          {
            id: 6002,
            name: '角色管理',
            type: 'menu',
            path: '/system/roles',
            component: 'pages/system/RoleManagement.vue',
            icon: 'Shield',
            sort_order: 2
          },
          {
            id: 6003,
            name: '权限管理',
            type: 'menu',
            path: '/system/permissions',
            component: 'pages/system/PermissionManagement.vue',
            icon: 'Key',
            sort_order: 3
          },
          {
            id: 6004,
            name: '系统日志',
            type: 'menu',
            path: '/system/logs',
            component: 'pages/system/SystemLogs.vue',
            icon: 'FileText',
            sort_order: 4
          }
        ]
      }
    ];

    // 插入菜单数据
    for (const category of menuStructure) {
      // 插入分类
      await sequelize.query(`
        INSERT INTO permissions (id, name, type, path, icon, sort_order, parent_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `, {
        replacements: [category.id, category.name, category.type, category.path, category.icon, category.sort_order, category.parent_id]
      });

      console.log(`✅ 创建分类: ${category.name}`);

      // 插入子菜单
      for (const child of category.children) {
        await sequelize.query(`
          INSERT INTO permissions (id, name, type, path, component, icon, sort_order, parent_id, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `, {
          replacements: [child.id, child.name, child.type, child.path, child.component, child.icon, child.sort_order, category.id]
        });

        console.log(`  ✅ 创建菜单: ${child.name}`);
      }
    }

    console.log('🎉 菜单结构设置完成！');

  } catch (error) {
    console.error('❌ 设置菜单结构失败:', error);
  } finally {
    await sequelize.close();
  }
}

setupMenuStructure();
