#!/usr/bin/env ts-node

import { Sequelize, DataTypes } from 'sequelize';

// 数据库配置
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'kindergarten',
  logging: console.log,
  timezone: '+08:00',
});

async function seedPrincipalData() {
  try {
    console.log('开始为Principal角色添加测试数据...');
    
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('数据库连接成功');
    
    // 获取园长用户ID（假设存在一个园长用户）
    const [principals] = await sequelize.query(`
      SELECT u.id, u.username 
      FROM users u 
      JOIN user_roles ur ON u.id = ur.userId 
      JOIN roles r ON ur.roleId = r.id 
      WHERE r.name = 'principal' 
      LIMIT 1
    `);
    
    if ((principals as any[]).length === 0) {
      console.log('没有找到园长用户，跳过数据种子');
      return;
    }
    
    const principal = (principals as any[])[0];
    console.log(`为园长用户 ${principal.username} (ID: ${principal.id}) 添加测试数据`);
    
    // 1. 添加Schedule测试数据
    console.log('添加Schedule测试数据...');
    const scheduleData = [
      {
        title: '园长会议',
        description: '与教师团队讨论新学期教学计划',
        type: 'meeting',
        status: 'pending',
        start_time: new Date('2025-07-08 09:00:00'),
        end_time: new Date('2025-07-08 11:00:00'),
        all_day: false,
        location: '会议室',
        repeat_type: 'weekly',
        user_id: principal.id,
        reminder: true,
        reminder_time: new Date('2025-07-08 08:30:00'),
        color: '#4A90E2',
        priority: 1
      },
      {
        title: '家长开放日准备',
        description: '准备下周的家长开放日活动',
        type: 'task',
        status: 'in_progress',
        start_time: new Date('2025-07-09 14:00:00'),
        end_time: new Date('2025-07-09 17:00:00'),
        all_day: false,
        repeat_type: 'none',
        user_id: principal.id,
        reminder: true,
        reminder_time: new Date('2025-07-09 13:30:00'),
        color: '#F5A623',
        priority: 2
      },
      {
        title: '教师培训',
        description: '组织新教师培训活动',
        type: 'event',
        status: 'pending',
        start_time: new Date('2025-07-10 09:00:00'),
        end_time: new Date('2025-07-10 12:00:00'),
        all_day: false,
        location: '培训教室',
        repeat_type: 'monthly',
        user_id: principal.id,
        reminder: true,
        reminder_time: new Date('2025-07-10 08:00:00'),
        color: '#7ED321',
        priority: 1
      }
    ];
    
    for (const schedule of scheduleData) {
      await sequelize.query(`
        INSERT INTO schedules (title, description, type, status, start_time, end_time, all_day, location, repeat_type, user_id, reminder, reminder_time, color, priority, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, {
        replacements: [
          schedule.title, schedule.description, schedule.type, schedule.status,
          schedule.start_time, schedule.end_time, schedule.all_day, schedule.location,
          schedule.repeat_type, schedule.user_id, schedule.reminder, schedule.reminder_time,
          schedule.color, schedule.priority
        ]
      });
    }
    
    // 2. 添加Todo测试数据
    console.log('添加Todo测试数据...');
    const todoData = [
      {
        title: '审核新入园申请',
        description: '审核本周收到的5份新入园申请材料',
        priority: 1,
        status: 'pending',
        due_date: new Date('2025-07-12'),
        user_id: principal.id,
        notify: true,
        notify_time: new Date('2025-07-11 09:00:00'),
        tags: JSON.stringify(['入园审核', '高优先级'])
      },
      {
        title: '制定暑期计划',
        description: '制定暑期托管班的详细安排和课程表',
        priority: 2,
        status: 'in_progress',
        due_date: new Date('2025-07-15'),
        user_id: principal.id,
        notify: true,
        notify_time: new Date('2025-07-14 10:00:00'),
        tags: JSON.stringify(['暑期计划', '课程安排'])
      },
      {
        title: '采购教学用品',
        description: '为新学期采购必要的教学用品和玩具',
        priority: 3,
        status: 'pending',
        due_date: new Date('2025-07-20'),
        user_id: principal.id,
        notify: false,
        tags: JSON.stringify(['采购', '教学用品'])
      }
    ];
    
    for (const todo of todoData) {
      await sequelize.query(`
        INSERT INTO todos (title, description, priority, status, due_date, user_id, notify, notify_time, tags, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, {
        replacements: [
          todo.title, todo.description, todo.priority, todo.status,
          todo.due_date, todo.user_id, todo.notify, todo.notify_time, todo.tags
        ]
      });
    }
    
    // 3. 添加Notification测试数据
    console.log('添加Notification测试数据...');
    const notificationData = [
      {
        title: '新入园申请通知',
        content: '有新的入园申请需要您审核，请及时处理',
        type: 'system',
        status: 'unread',
        user_id: principal.id,
        total_count: 1,
        read_count: 0,
        send_at: new Date()
      },
      {
        title: '教师考勤异常',
        content: '张老师今日未按时打卡，请关注',
        type: 'system',
        status: 'unread',
        user_id: principal.id,
        total_count: 1,
        read_count: 0,
        send_at: new Date()
      },
      {
        title: '家长反馈',
        content: '小明家长对昨日活动表示感谢',
        type: 'message',
        status: 'read',
        user_id: principal.id,
        read_at: new Date(),
        total_count: 1,
        read_count: 1,
        send_at: new Date(Date.now() - 24 * 60 * 60 * 1000) // 昨天
      }
    ];
    
    for (const notification of notificationData) {
      await sequelize.query(`
        INSERT INTO notifications (title, content, type, status, user_id, read_at, total_count, read_count, send_at, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, {
        replacements: [
          notification.title, notification.content, notification.type, notification.status,
          notification.user_id, notification.read_at || null, notification.total_count,
          notification.read_count, notification.send_at
        ]
      });
    }
    
    // 4. 添加Approval测试数据
    console.log('添加Approval测试数据...');
    const approvalData = [
      {
        title: '教师请假申请',
        description: '李老师申请7月15日请假一天，家中有事',
        type: 'LEAVE',
        status: 'PENDING',
        urgency: 'MEDIUM',
        requestedBy: principal.id, // 假设有其他用户申请
        requestedAt: new Date(),
        deadline: new Date('2025-07-14')
      },
      {
        title: '设备采购申请',
        description: '申请购买新的投影设备',
        type: 'PURCHASE',
        status: 'PENDING',
        urgency: 'LOW',
        requestAmount: 5000.00,
        requestedBy: principal.id,
        requestedAt: new Date(),
        deadline: new Date('2025-07-25')
      }
    ];
    
    for (const approval of approvalData) {
      await sequelize.query(`
        INSERT INTO approvals (title, description, type, status, urgency, requestAmount, requestedBy, requestedAt, deadline, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, {
        replacements: [
          approval.title, approval.description, approval.type, approval.status,
          approval.urgency, approval.requestAmount || null, approval.requestedBy,
          approval.requestedAt, approval.deadline
        ]
      });
    }
    
    console.log('🎉 Principal角色测试数据添加完成');
    console.log(`添加了：
- 3条日程安排 (schedules)
- 3个待办任务 (todos)  
- 3条通知消息 (notifications)
- 2个审批申请 (approvals)`);
    
  } catch (error) {
    console.error('添加测试数据时发生错误:', error);
  } finally {
    await sequelize.close();
  }
}

seedPrincipalData();