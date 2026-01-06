# 硬编码数据检测报告

生成时间: 2025-11-25T09:41:33.259Z

## 检测统计

- 检测组件总数: 61
- 发现问题总数: 73

## 问题详情

### client/src/components/PageLoadingGuard.vue

- **Hardcoded Config** (medium): 8 处
  ```javascript
  localhost
  ```
  ```javascript
  localhost
  ```
  ```javascript
  127.0.0.1
  ```

### client/src/components/testing/RoleSwitcher.vue

- **Static Array Data** (high): 1 处
  ```javascript
  const availableRoles = [
  { value: 'principal', label: '园长', icon: 'star' },
  { value: 'admin', label: '管理员', icon: 'UserFilled' },
  { value: 'teacher', label: '教师', icon: 'Avatar' },
  { value: 'user', label: '普通用户', icon: 'User' }
]
  ```

- **Hardcoded Config** (medium): 1 处
  ```javascript
  localhost
  ```

### client/src/components/testing/PerformanceMonitor.vue

- **Hardcoded Config** (medium): 1 处
  ```javascript
  localhost
  ```

### client/src/components/testing/MobileTestSuite.vue

- **Static Array Data** (high): 1 处
  ```javascript
  const devices = [
  { name: 'iPhone 12', width: 390, height: 844, userAgent: 'iPhone' },
  { name: 'iPhone SE', width: 375, height: 667, userAgent: 'iPhone' },
  { name: 'Samsung Galaxy S21', width: 384, height: 854, userAgent: 'Android' },
  { name: 'iPad', width: 768, height: 1024, userAgent: 'iPad' },
  { name: 'Desktop', width: 1920, height: 1080, userAgent: 'Desktop' }
]
  ```

- **Hardcoded Config** (medium): 1 处
  ```javascript
  localhost
  ```

### client/src/components/system/UserRoles.vue

- **Mock API Calls** (high): 2 处
  ```javascript
  // 模拟API
  ```
  ```javascript
  setTimeout(resolve
  ```

### client/src/components/system/UserForm.vue

- **Mock API Calls** (high): 2 处
  ```javascript
  // 模拟API
  ```
  ```javascript
  setTimeout(resolve
  ```

- **Hardcoded Role Options** (high): 1 处
  ```javascript
  模拟角色选项数据
  ```

### client/src/components/system/RolePermission.vue

- **Mock API Calls** (high): 2 处
  ```javascript
  // 模拟API
  ```
  ```javascript
  setTimeout(resolve
  ```

### client/src/components/system/RoleForm.vue

- **Mock API Calls** (high): 2 处
  ```javascript
  // 模拟API
  ```
  ```javascript
  setTimeout(resolve
  ```

### client/src/components/student/StudentDetail.vue

- **Mock API Calls** (high): 3 处
  ```javascript
  // 获取学生成长记录 (暂时使用模拟数据，等待后端API
  ```
  ```javascript
  mockRecordsData
  ```
  ```javascript
  mockRecordsData.data
  ```

### client/src/components/statistics/StatCard.vue

- **Hardcoded Statistics** (medium): 41 处
  ```javascript
  60
  ```
  ```javascript
  40
  ```
  ```javascript
  99
  ```

### client/src/components/sidebar/TeacherCenterSidebar.vue

- **Static Array Data** (high): 1 处
  ```javascript
  const teacherMenuItems = [
  {
    id: 'teacher-dashboard',
    title: '教师工作台',
    route: '/teacher-center/dashboard',
    icon: 'dashboard'
  },
  {
    id: 'teacher-notifications',
    title: '通知中心',
    route: '/teacher-center/notifications',
    icon: 'bell'
  },
  {
    id: 'teacher-tasks',
    title: '任务中心',
    route: '/teacher-center/tasks',
    icon: 'task'
  },
  {
    id: 'teacher-activities',
    title: '活动中心',
    route: '/teacher-center/activities',
    icon: 'calendar'
  },
  {
    id: 'teacher-enrollment',
    title: '招生中心',
    route: '/teacher-center/enrollment',
    icon: 'school'
  },
  {
    id: 'teacher-teaching',
    title: '教学中心',
    route: '/teacher-center/teaching',
    icon: 'book-open'
  },
  {
    id: 'teacher-customer-tracking',
    title: '客户跟踪',
    route: '/teacher-center/customer-tracking',
    icon: 'user-check'
  },
  {
    id: 'teacher-creative-curriculum',
    title: '创意课程',
    route: '/teacher-center/creative-curriculum',
    icon: 'star'
  },
  {
    id: 'teacher-performance',
    title: '绩效中心',
    route: '/teacher-center/performance-rewards',
    icon: 'trophy'
  }
]
  ```

### client/src/components/sidebar/ParentCenterSidebar.vue

- **Static Array Data** (high): 1 处
  ```javascript
  const parentMenuItems = [
  {
    id: 'parent-dashboard',
    title: '我的首页',
    route: '/parent-center/dashboard',
    icon: 'home'
  },
  {
    id: 'my-children',
    title: '我的孩子',
    route: '/parent-center/children',
    icon: 'school'
  },
  {
    id: 'child-growth',
    title: '成长报告',
    route: '/parent-center/child-growth',
    icon: 'growth'
  },
  {
    id: 'assessment',
    title: '能力测评',
    route: '/parent-center/assessment',
    icon: 'document'
  },
  {
    id: 'games',
    title: '游戏大厅',
    route: '/parent-center/games',
    icon: 'star'
  },
  {
    id: 'ai-assistant',
    title: 'AI育儿助手',
    route: '/parent-center/ai-assistant',
    icon: 'ai-brain'
  },
  {
    id: 'activities',
    title: '活动列表',
    route: '/parent-center/activities',
    icon: 'calendar'
  },
  {
    id: 'parent-communication',
    title: '家园沟通',
    route: '/parent-center/communication',
    icon: 'chat-square'
  },
  {
    id: 'photo-album',
    title: '相册中心',
    route: '/parent-center/photo-album',
    icon: 'picture'
  },
  {
    id: 'promotion-center',
    title: '园所奖励',
    route: '/parent-center/kindergarten-rewards',
    icon: 'gift'
  },
  {
    id: 'notifications',
    title: '最新通知',
    route: '/parent-center/notifications',
    icon: 'bell'
  }
]
  ```

### client/src/components/preview/PosterPreview.vue

- **Static Array Data** (high): 1 处
  ```javascript
  const themes = [
  { value: 'warm', label: '温馨' },
  { value: 'fresh', label: '清新' },
  { value: 'elegant', label: '优雅' },
  { value: 'playful', label: '活泼' }
]
  ```

### client/src/components/performance/PerformanceRulesList.vue

- **Static Array Data** (high): 1 处
  ```javascript
  const calculationMethodOptions = [
      { value: 'ENROLLMENT_COUNT', label: '招生数量' },
      { value: 'TRIAL_CONVERSION', label: '体验课转化' },
      { value: 'ORDER_COUNT', label: '采单数量' },
      { value: 'PRE_REGISTRATION', label: '预报名转化' }
    ]
  ```

### client/src/components/performance/PerformanceRuleForm.vue

- **Static Array Data** (high): 2 处
  ```javascript
  const ruleTypeOptions = [
      { value: 'ENROLLMENT', label: '招生绩效' },
      { value: 'TRIAL_CLASS', label: '体验课绩效' },
      { value: 'ORDER', label: '采单绩效' },
      { value: 'PRE_REGISTRATION', label: '预报名绩效' }
    ]
  ```
  ```javascript
  const classOptions = [
      { value: 'PREMIUM', label: '高级班' },
      { value: 'STANDARD', label: '标准班' },
      { value: 'BASIC', label: '基础班' },
      { value: 'SPECIAL', label: '特色班' }
    ]
  ```

### client/src/components/marketing/CreateCampaignDialog.vue

- **Mock API Calls** (high): 2 处
  ```javascript
  // 模拟API
  ```
  ```javascript
  setTimeout(resolve
  ```

### client/src/components/layout/RoleBasedMobileLayout.vue

- **Static Array Data** (high): 1 处
  ```javascript
  const baseItems = [
    {
      name: 'home',
      icon: 'home-o',
      text: '首页',
      to: '/mobile/centers'
    }
  ]
  ```

### client/src/components/kindergarten/KindergartenImageGenerator.vue

- **Static Array Data** (high): 1 处
  ```javascript
  const quickTemplates = [
  {
    key: 'morning-exercise',
    name: '晨间锻炼',
    icon: '🏃‍♀️',
    prompt: '3-6岁的小朋友们在幼儿园操场上做晨间锻炼，大家排成整齐的队伍，跟着老师一起做体操，阳光明媚，充满活力'
  },
  {
    key: 'art-class',
    name: '美术课堂',
    icon: '🎨',
    prompt: '幼儿园美术教室里，小朋友们正在专心致志地画画，桌上摆满了彩色画笔和颜料，孩子们脸上洋溢着创作的快乐'
  },
  {
    key: 'story-time',
    name: '故事时间',
    icon: '📚',
    prompt: '温馨的图书角，老师正在给围坐成圆圈的小朋友们讲故事，孩子们聚精会神地听着，眼中充满好奇和想象'
  },
  {
    key: 'lunch-time',
    name: '快乐用餐',
    icon: '🍽️',
    prompt: '幼儿园餐厅里，小朋友们坐在小桌子旁安静地用餐，餐具摆放整齐，营养丰富的饭菜，培养良好的用餐习惯'
  },
  {
    key: 'outdoor-play',
    name: '户外游戏',
    icon: '🌳',
    prompt: '幼儿园花园里，孩子们在滑梯、秋千等游乐设施上快乐地玩耍，绿树成荫，安全的游戏环境，充满欢声笑语'
  },
  {
    key: 'music-dance',
    name: '音乐舞蹈',
    icon: '🎵',
    prompt: '音乐教室里，小朋友们跟着老师学习唱歌跳舞，手拉手围成圆圈，音符在空中飞舞，培养艺术素养'
  }
]
  ```

### client/src/components/forms/StudentForm.vue

- **Mock API Calls** (high): 2 处
  ```javascript
  // 模拟API
  ```
  ```javascript
  setTimeout(resolve
  ```

### client/src/components/examples/AsyncDataExample.vue

- **Mock API Calls** (high): 4 处
  ```javascript
  // 模拟API
  ```
  ```javascript
  setTimeout(resolve
  ```
  ```javascript
  setTimeout(resolve
  ```

### client/src/components/enrollment/QuestionList.vue

- **Static Array Data** (high): 2 处
  ```javascript
  const questionActions = [
  { name: '编辑', value: 'edit' },
  { name: '预览', value: 'preview' },
  { name: '复制', value: 'copy' },
  { name: '删除', value: 'delete' }
]
  ```
  ```javascript
  const mockQuestions = [
      {
        id: '1',
        title: '自我介绍',
        difficulty: 'easy',
        content: '请小朋友介绍一下自己，包括名字、年龄和兴趣爱好。',
        expectedAnswer: '能够清晰地说出自己的名字、年龄，简单介绍1-2个兴趣爱好。',
        scoringCriteria: '表达清晰度(40分)，内容完整性(30分)，语言流畅性(30分)',
        category: props.category,
        tags: ['基础', '表达'],
        usageCount: 45,
        createdAt: '2024-01-15'
      },
      {
        id: '2',
        title: '家庭介绍',
        difficulty: 'medium',
        content: '请介绍一下你的家庭成员，说说你最喜欢和谁一起玩。',
        expectedAnswer: '能够说出家庭成员的基本情况，表达对家人的感情。',
        scoringCriteria: '家庭认知(30分)，情感表达(40分)，语言组织(30分)',
        category: props.category,
        tags: ['家庭', '情感'],
        usageCount: 32,
        createdAt: '2024-01-20'
      }
    ]
  ```

- **Mock API Calls** (high): 1 处
  ```javascript
  // 模拟API
  ```

### client/src/components/dialogs/StudentEditDialog.vue

- **Mock API Calls** (high): 2 处
  ```javascript
  // 模拟API
  ```
  ```javascript
  setTimeout(resolve
  ```

### client/src/components/demo/StreamingChat.vue

- **Mock API Calls** (high): 1 处
  ```javascript
  setTimeout(resolve
  ```

### client/src/components/customer/FollowupAnalysisPanel.vue

- **Hardcoded Statistics** (medium): 20 处
  ```javascript
  80
  ```
  ```javascript
  120
  ```
  ```javascript
  100
  ```

### client/src/components/customer/CustomerBatchImportPreview.vue

- **Hardcoded Statistics** (medium): 21 处
  ```javascript
  90
  ```
  ```javascript
  300
  ```
  ```javascript
  150
  ```

### client/src/components/common/StatCard.vue

- **Hardcoded Statistics** (medium): 41 处
  ```javascript
  60
  ```
  ```javascript
  40
  ```
  ```javascript
  99
  ```

### client/src/components/common/ErrorBoundary.vue

- **Mock API Calls** (high): 1 处
  ```javascript
  setTimeout(resolve
  ```

### client/src/components/common/AsyncComponentWrapper.vue

- **Mock API Calls** (high): 1 处
  ```javascript
  setTimeout(resolve
  ```

### client/src/components/circuit/CircuitPractice.vue

- **Hardcoded Options** (high): 1 处
  ```javascript
  [
      { label: '各处电流相等', value: 'same'
  ```

- **Hardcoded Statistics** (medium): 118 处
  ```javascript
  400
  ```
  ```javascript
  300
  ```
  ```javascript
  200
  ```

### client/src/components/centers/StatCard.vue

- **Hardcoded Statistics** (medium): 114 处
  ```javascript
  60
  ```
  ```javascript
  40
  ```
  ```javascript
  99
  ```

### client/src/components/centers/ChartContainer.vue

- **Mock API Calls** (high): 6 处
  ```javascript
  setTimeout(resolve
  ```
  ```javascript
  setTimeout(resolve
  ```
  ```javascript
  setTimeout(resolve
  ```

### client/src/components/centers/activity/RegistrationManagement.vue

- **Static Array Data** (high): 1 处
  ```javascript
  const tableColumns = [
  { type: 'selection', width: 55 },
  { prop: 'activity', label: '活动信息', slot: 'activity', minWidth: 200 },
  { prop: 'student', label: '学生信息', slot: 'student', width: 120 },
  { prop: 'parent', label: '家长信息', slot: 'parent', width: 140 },
  { prop: 'status', label: '状态', slot: 'status', width: 100 },
  { prop: 'registeredAt', label: '报名时间', slot: 'registeredAt', width: 140 },
  { prop: 'actions', label: '操作', slot: 'actions', width: 200, fixed: 'right' }
]
  ```

### client/src/components/centers/activity/NotificationTemplates.vue

- **Mock API Calls** (high): 1 处
  ```javascript
  setTimeout(resolve
  ```

### client/src/components/centers/activity/NotificationSettings.vue

- **Mock API Calls** (high): 1 处
  ```javascript
  setTimeout(resolve
  ```

### client/src/components/centers/activity/NotificationManagement.vue

- **Static Array Data** (high): 1 处
  ```javascript
  const tableColumns = [
  { prop: 'type', label: '类型', slot: 'type', width: 120 },
  { prop: 'content', label: '通知内容', slot: 'content', minWidth: 300 },
  { prop: 'activity', label: '关联活动', slot: 'activity', width: 180 },
  { prop: 'recipients', label: '接收人数', slot: 'recipients', width: 100 },
  { prop: 'status', label: '状态', slot: 'status', width: 100 },
  { prop: 'sentAt', label: '发送时间', slot: 'sentAt', width: 140 },
  { prop: 'actions', label: '操作', slot: 'actions', width: 200, fixed: 'right' }
]
  ```

### client/src/components/centers/activity/ActivityManagement.vue

- **Static Array Data** (high): 1 处
  ```javascript
  const tableColumns = [
  { type: 'selection', width: 55 },
  { prop: 'coverImage', label: '封面图片', slot: 'coverImage', width: 100 },
  { prop: 'title', label: '活动标题', slot: 'title', minWidth: 200 },
  { prop: 'activityType', label: '活动类型', slot: 'activityType', width: 100 },
  { prop: 'status', label: '状态', slot: 'status', width: 100 },
  { prop: 'startTime', label: '开始时间', width: 160, formatter: formatDateTime },
  { prop: 'endTime', label: '结束时间', width: 160, formatter: formatDateTime },
  { prop: 'location', label: '地点', width: 120 },
  { prop: 'registration', label: '报名情况', slot: 'registration', width: 120 },
  { prop: 'fee', label: '价格', width: 80, formatter: formatPrice },
  { prop: 'actions', label: '操作', slot: 'actions', width: 280, fixed: 'right' }
]
  ```

### client/src/components/centers/activity/ActivityAnalytics.vue

- **Hardcoded Statistics** (medium): 35 处
  ```javascript
  300
  ```
  ```javascript
  300
  ```
  ```javascript
  400
  ```

### client/src/components/call-center/SIPSettingsDialog.vue

- **Mock API Calls** (high): 2 处
  ```javascript
  setTimeout(resolve
  ```
  ```javascript
  setTimeout(resolve
  ```

### client/src/components/call-center/MakeCallDialog.vue

- **Static Array Data** (high): 1 处
  ```javascript
  const keypadKeys = [
  { main: '1', sub: '' },
  { main: '2', sub: 'ABC' },
  { main: '3', sub: 'DEF' },
  { main: '4', sub: 'GHI' },
  { main: '5', sub: 'JKL' },
  { main: '6', sub: 'MNO' },
  { main: '7', sub: 'PQRS' },
  { main: '8', sub: 'TUV' },
  { main: '9', sub: 'WXYZ' },
  { main: '*', sub: '' },
  { main: '0', sub: '+' },
  { main: '#', sub: '' }
]
  ```

### client/src/components/animations-more/NeonGrid.vue

- **Static Array Data** (high): 1 处
  ```javascript
  const positions = [
    { x: 25, y: 25, connections: [45, 135, 225] },
    { x: 75, y: 25, connections: [135, 225, 315] },
    { x: 50, y: 50, connections: [0, 90, 180, 270] },
    { x: 25, y: 75, connections: [45, 315, 225] },
    { x: 75, y: 75, connections: [135, 315, 45] },
    { x: 50, y: 10, connections: [90, 180, 270] }
  ]
  ```

### client/src/components/animations-more/CubeExplosion.vue

- **Static Array Data** (high): 1 处
  ```javascript
  const gridPositions = [
    { x: -150, y: -100, z: 0 },
    { x: 150, y: -100, z: 0 },
    { x: -150, y: 100, z: 0 },
    { x: 150, y: 100, z: 0 },
    { x: 0, y: 0, z: -100 },
    { x: 0, y: 0, z: 100 }
  ]
  ```

### client/src/components/animations/MatrixBlocks.vue

- **Static Array Data** (high): 1 处
  ```javascript
  const modulePositions = [
    { row: 3, col: 2 },
    { row: 3, col: 5 },
    { row: 3, col: 8 },
    { row: 7, col: 2 },
    { row: 7, col: 5 },
    { row: 7, col: 8 }
  ]
  ```

### client/src/components/ai-assistant/NewAIAssistant.vue

- **Static Array Data** (high): 2 处
  ```javascript
  const sidebarItems = [
  { id: 1, label: '聊天', icon: 'fa-comments' },
  { id: 2, label: '历史记录', icon: 'fa-history' },
  { id: 3, label: '保存的提示词', icon: 'fa-bookmark' },
  { id: 4, label: '设置', icon: 'fa-cog' },
]
  ```
  ```javascript
  const quickActions = [
  { id: 1, label: '创建活动', icon: 'fa-calendar-plus' },
  { id: 2, label: '检查考勤', icon: 'fa-chart-line' },
  { id: 3, label: '生成报告', icon: 'fa-file-alt' },
  { id: 4, label: '查询学生', icon: 'fa-user-friends' },
]
  ```

### client/src/components/ai-assistant/layout/full-page/EXAMPLES.vue

- **Static Array Data** (high): 1 处
  ```javascript
  const customActions = [
  { index: '2', label: '自定义操作', icon: 'star', action: 'custom' }
]
  ```

### client/src/components/ai-assistant/dialogs/AIStatistics.vue

- **Hardcoded Statistics** (medium): 32 处
  ```javascript
  750
  ```
  ```javascript
  20
  ```
  ```javascript
  12
  ```

### client/src/components/ai-assistant/components/WeatherWidget.vue

- **Mock API Calls** (high): 6 处
  ```javascript
  // 使用免费天气API（这里使用模拟数据，实际项目中可以替换为真实API
  ```
  ```javascript
  setTimeout(resolve
  ```
  ```javascript
  // 模拟天气数据（实际项目中调用真实天气API
  ```

### client/src/components/ai-assistant/backup_duplicates/OperationPanel-fixed.vue

- **Hardcoded Statistics** (medium): 7 处
  ```javascript
  100
  ```
  ```javascript
  100
  ```
  ```javascript
  100
  ```

### client/src/components/ai-assistant/backup_duplicates/NewAIAssistant.vue

- **Static Array Data** (high): 2 处
  ```javascript
  const sidebarItems = [
  { id: 1, label: '聊天', icon: 'fa-comments' },
  { id: 2, label: '历史记录', icon: 'fa-history' },
  { id: 3, label: '保存的提示词', icon: 'fa-bookmark' },
  { id: 4, label: '设置', icon: 'fa-cog' },
]
  ```
  ```javascript
  const quickActions = [
  { id: 1, label: '创建活动', icon: 'fa-calendar-plus' },
  { id: 2, label: '检查考勤', icon: 'fa-chart-line' },
  { id: 3, label: '生成报告', icon: 'fa-file-alt' },
  { id: 4, label: '查询学生', icon: 'fa-user-friends' },
]
  ```

### client/src/components/ai-assistant/backup_duplicates/MediaGallery-fixed.vue

- **Static Array Data** (high): 1 处
  ```javascript
  const mediaTypeOptions = [
      { label: '班级照片', value: 'class_photo' },
      { label: '班级视频', value: 'class_video' },
      { label: '学生照片', value: 'student_photo' },
      { label: '学生视频', value: 'student_video' }
    ]
  ```

- **Hardcoded Options** (high): 1 处
  ```javascript
  [
      { label: '班级照片', value: 'class_photo'
  ```

- **Hardcoded Config** (medium): 6 处
  ```javascript
  localhost
  ```
  ```javascript
  localhost
  ```
  ```javascript
  localhost
  ```

### client/src/components/ai/OperationPanel.vue

- **Hardcoded Statistics** (medium): 7 处
  ```javascript
  100
  ```
  ```javascript
  100
  ```
  ```javascript
  100
  ```

### client/src/components/ai/OperationPanel-fixed.vue

- **Hardcoded Statistics** (medium): 7 处
  ```javascript
  100
  ```
  ```javascript
  100
  ```
  ```javascript
  100
  ```

### client/src/components/ai/MemorySearchComponent.vue

- **Mock API Calls** (high): 1 处
  ```javascript
  // 模拟API函数，实际应从@/api
  ```

### client/src/components/ai/MemoryListComponent.vue

- **Mock API Calls** (high): 1 处
  ```javascript
  // 模拟API函数，实际应从@/api
  ```

### client/src/components/ai/MediaGallery.vue

- **Static Array Data** (high): 1 处
  ```javascript
  const mediaTypeOptions = [
      { label: '班级照片', value: 'class_photo' },
      { label: '班级视频', value: 'class_video' },
      { label: '学生照片', value: 'student_photo' },
      { label: '学生视频', value: 'student_video' }
    ]
  ```

- **Hardcoded Options** (high): 1 处
  ```javascript
  [
      { label: '班级照片', value: 'class_photo'
  ```

- **Hardcoded Config** (medium): 6 处
  ```javascript
  localhost
  ```
  ```javascript
  localhost
  ```
  ```javascript
  localhost
  ```

### client/src/components/ai/MediaGallery-fixed.vue

- **Static Array Data** (high): 1 处
  ```javascript
  const mediaTypeOptions = [
      { label: '班级照片', value: 'class_photo' },
      { label: '班级视频', value: 'class_video' },
      { label: '学生照片', value: 'student_photo' },
      { label: '学生视频', value: 'student_video' }
    ]
  ```

- **Hardcoded Options** (high): 1 处
  ```javascript
  [
      { label: '班级照片', value: 'class_photo'
  ```

- **Hardcoded Config** (medium): 6 处
  ```javascript
  localhost
  ```
  ```javascript
  localhost
  ```
  ```javascript
  localhost
  ```

### client/src/components/ai/ComponentRenderer.vue

- **Hardcoded Statistics** (medium): 18 处
  ```javascript
  10
  ```
  ```javascript
  300
  ```
  ```javascript
  12
  ```

### client/src/components/ai/model/ModelManagement.vue

- **Mock API Calls** (high): 1 处
  ```javascript
  setTimeout(resolve
  ```

### client/src/components/ai/memory/MemoryVisualization.vue

- **Mock API Calls** (high): 1 处
  ```javascript
  // 模拟数据，实际应从API
  ```

- **Hardcoded Statistics** (medium): 49 处
  ```javascript
  20
  ```
  ```javascript
  24
  ```
  ```javascript
  12
  ```

### client/src/components/ai/memory/MemoryStatistics.vue

- **Hardcoded Statistics** (medium): 15 处
  ```javascript
  20
  ```
  ```javascript
  20
  ```
  ```javascript
  12
  ```

### client/src/components/activity/DetailPanel.vue

- **Hardcoded Statistics** (medium): 26 处
  ```javascript
  32
  ```
  ```javascript
  24
  ```
  ```javascript
  18
  ```

### client/src/components/activity/ActivityDetailPanel.vue

- **Hardcoded Statistics** (medium): 26 处
  ```javascript
  32
  ```
  ```javascript
  24
  ```
  ```javascript
  18
  ```

