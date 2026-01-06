// 测试fixIconName函数的逻辑
const isSvgPath = (str) => {
  return typeof str === 'string' &&
         str.startsWith('M') &&
         /[MLCZH]/.test(str) &&
         str.length > 10;
};

const fixIconName = (iconValue) => {
  console.log(`🔧 修复前: "${iconValue}"`);

  if (!iconValue || typeof iconValue !== 'string') {
    console.log(`❌ 无效值，返回dashboard`);
    return 'dashboard';
  }

  // 如果已经是有效的图标名称，直接返回
  const lowerName = iconValue.toLowerCase();
  const validIcons = ['dashboard', 'enrollment', 'students', 'teachers', 'classes', 'activities', 'ai-center', 'marketing', 'system', 'statistics', 'principal', 'user', 'user-group', 'document', 'chat-square', 'menu', 'settings', 'search', 'key', 'finance', 'performance', 'analytics', 'personnel', 'task', 'messages', 'service', 'calendar', 'media', 'script', 'design', 'monitor', 'ai-robot'];

  if (validIcons.includes(lowerName)) {
    console.log(`✅ 有效图标: "${iconValue}"`);
    return iconValue;
  }

  // 如果是SVG path，转换为对应的图标名称
  if (isSvgPath(iconValue)) {
    console.log(`⚠️ 检测到SVG路径，但这里简化处理`);
    return 'dashboard';
  }

  // 其他情况返回默认值
  console.log(`⚠️ 未知图标，返回menu`);
  return 'menu';
};

// 测试各个菜单项的图标映射
const getIconByTitle = (title) => {
  const iconMap = {
    '用户管理': 'user',
    '角色管理': 'user-group',
    '权限管理': 'key',
    '总览': 'dashboard',
    '数据统计': 'statistics',
    '学生管理': 'students',
    '教师管理': 'teachers',
    '家长管理': 'user-group',
    '班级管理': 'classes',
    '招生概览': 'enrollment',
    '招生计划': 'enrollment',
    '申请管理': 'document',
    '活动列表': 'activities',
    '创建活动': 'activities',
    'AI对话': 'ai-center',
    'AI模型管理': 'ai-robot'
  };
  return iconMap[title] || 'menu';
};

const testMenuItems = [
  '用户管理', '角色管理', '权限管理', '总览', '数据统计',
  '学生管理', '教师管理', '家长管理', '班级管理', '招生概览',
  '招生计划', '申请管理', '活动列表', '创建活动', 'AI对话', 'AI模型管理'
];

console.log('🧪 测试图标名称修复逻辑\n');

testMenuItems.forEach((title, index) => {
  console.log(`\n${index + 1}. 测试菜单: "${title}"`);
  const iconName = getIconByTitle(title);
  const fixedIconName = fixIconName(iconName);
  console.log(`   结果: "${fixedIconName}"`);
});

console.log('\n✅ 测试完成');