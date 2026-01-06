// 教师模拟数据
export const teacherList = [
  {
    id: 1,
    name: '张老师',
    subject: '语文',
    phone: '13800138001',
    email: 'zhang@example.com',
    status: 'active',
    classes: ['小班A', '中班B'],
    joinDate: '2023-09-01',
    experience: '5年教学经验'
  },
  {
    id: 2,
    name: '李老师',
    subject: '数学',
    phone: '13800138002',
    email: 'li@example.com',
    status: 'active',
    classes: ['大班A'],
    joinDate: '2023-08-15',
    experience: '3年教学经验'
  },
  {
    id: 3,
    name: '王老师',
    subject: '英语',
    phone: '13800138003',
    email: 'wang@example.com',
    status: 'active',
    classes: ['中班A', '中班C'],
    joinDate: '2024-01-10',
    experience: '2年教学经验'
  },
  {
    id: 4,
    name: '赵老师',
    subject: '美术',
    phone: '13800138004',
    email: 'zhao@example.com',
    status: 'active',
    classes: ['小班B'],
    joinDate: '2023-10-20',
    experience: '4年教学经验'
  },
  {
    id: 5,
    name: '陈老师',
    subject: '音乐',
    phone: '13800138005',
    email: 'chen@example.com',
    status: 'active',
    classes: ['大班B'],
    joinDate: '2024-02-01',
    experience: '6年教学经验'
  }
];

export const teacherStats = {
  total: 5,
  active: 5,
  onLeave: 0,
  newThisMonth: 1
};