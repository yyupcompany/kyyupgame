# TC-040: 设备方向变化测试

## 测试用例标识
- **用例编号**: TC-040
- **测试组**: 兼容性和响应式测试
- **测试类型**: 设备方向测试
- **优先级**: 中等

## 测试目标
验证移动端应用在设备方向变化时的适应性和稳定性，确保应用在横屏和竖屏切换过程中能够正确调整布局、保持功能完整性，并提供良好的用户体验。

## 测试前置条件
1. 应用已正常启动并运行
2. 设备方向传感器正常工作
3. 响应式布局已实现
4. 屏幕旋转功能已启用

## 测试步骤

### 步骤1: 基础方向切换测试
1. **竖屏到横屏切换**
   - 应用在竖屏模式下正常启动
   - 将设备顺时针旋转90度到横屏
   - 观察界面布局变化过程
   - 验证切换完成后的显示状态

2. **横屏到竖屏切换**
   - 应用在横屏模式下正常运行
   - 将设备逆时针旋转90度到竖屏
   - 观察布局重新调整过程
   - 验证切换完成后的界面状态

3. **快速连续切换**
   - 快速连续旋转设备多次
   - 观察应用是否保持稳定
   - 验证不会出现布局错乱或崩溃

### 步骤2: 主要页面方向适配测试
1. **登录页面方向测试**
   ```
   测试场景:
   - 竖屏登录表单布局
   - 横屏登录表单适配
   - 输入框焦点状态保持
   - 键盘弹出时方向变化
   ```

2. **家长中心页面测试**
   ```
   页面组件:
   - 顶部导航栏适配
   - 侧边菜单展开状态
   - 子女信息卡片布局
   - 功能按钮排列
   - 底部导航栏适配
   ```

3. **列表页面方向测试**
   ```
   列表适配:
   - 学生列表多列显示
   - 活动列表网格布局
   - 通知列表宽屏利用
   - 搜索框位置调整
   - 筛选条件布局
   ```

### 步骤3: 表单和输入方向测试
1. **表单输入方向变化**
   - 在竖屏模式下开始填写表单
   - 输入过程中旋转到横屏
   - 验证输入数据不丢失
   - 检查输入焦点状态保持
   - 确认键盘适配正确

2. **复杂表单适配**
   ```
   复杂表单测试:
   - 多步骤表单进度保持
   - 图片上传组件适配
   - 日期时间选择器位置
   - 下拉选择框展开状态
   - 表单验证消息位置
   ```

3. **输入法适配**
   - 测试不同输入法的方向适配
   - 验证虚拟键盘显示正确
   - 检查输入法切换不影响布局

### 步骤4: 媒体内容方向测试
1. **图片和视频方向适配**
   - 查看图片时的方向切换
   - 视频播放时的方向变化
   - 图片轮播组件适配
   - 视频播放器控制按钮位置

2. **相机和拍照功能**
   ```
   相机功能测试:
   - 拍照界面的方向适配
   - 前后摄像头切换时的方向
   - 拍摄后图片的方向保持
   - 相机预览窗口适配
   ```

3. **图表和数据可视化**
   - 统计图表的方向适配
   - 数据表格的横屏优化
   - 图例和标签位置调整
   - 交互操作区域适配

### 步骤5: 导航和菜单方向测试
1. **导航栏方向适配**
   - 顶部导航栏元素布局
   - 面包屑导航显示
   - 返回按钮位置
   - 用户菜单展开方向

2. **侧边菜单适配**
   ```
   侧边菜单测试:
   - 竖屏时垂直菜单
   - 横屏时可能水平展开
   - 菜单项图标和文字布局
   - 菜单关闭时的状态保持
   - 滑动手势方向适应
   ```

3. **底部导航适配**
   - 底部标签栏图标大小
   - 文字标签显示/隐藏
   - 徽章和通知位置
   - 快速操作按钮位置

### 步骤6: 游戏和交互方向测试
1. **游戏界面方向适配**
   - 游戏画布方向调整
   - 控制按钮位置变化
   - 得分和状态信息位置
   - 游戏暂停时的方向处理

2. **手势交互适配**
   ```
   手势操作测试:
   - 滑动手势方向适应
   - 缩放手势中心点
   - 长按操作区域适配
   - 双击缩放行为
   - 拖拽操作方向变化
   ```

3. **触摸反馈适配**
   - 触摸反馈区域位置
   - 震动反馈方向无影响
   - 触摸涟漪效果适配
   - 按钮按压状态保持

### 步骤7: 特殊方向场景测试
1. **反向横屏测试**
   - 左横屏(Home键在右侧)
   - 右横屏(Home键在左侧)
   - 180度旋转测试
   - 倒竖屏模式测试

2. **多窗口模式测试**
   ```
   分屏场景:
   - 上下分屏时的应用方向
   - 左右分屏时的布局适应
   - 分屏大小调整时的响应
   - 另一个应用方向变化的影响
   ```

3. **折叠屏设备测试**
   - 折叠状态的方向适配
   - 展开时的布局切换
   - 折叠过程中的状态保持
   - 多角度支撑时的显示

### 步骤8: 性能和状态保持测试
1. **方向变化性能测试**
   - 测量布局切换时间
   - 检查内存使用变化
   - 验证CPU使用峰值
   - 确认动画流畅度

2. **应用状态保持**
   ```
   状态保持测试:
   - 当前页面位置保持
   - 表单数据不丢失
   - 用户选择状态保留
   - 滚动位置记忆
   - 网络请求状态保持
   ```

3. **错误处理和恢复**
   - 方向切换失败时的处理
   - 布局错乱时的自动修复
   - 状态丢失时的恢复机制
   - 异常情况的降级处理

## 预期结果

### 方向适配要求
1. **布局正确**: 横竖屏下布局都正确显示
2. **功能完整**: 所有功能在两种方向下都可用
3. **状态保持**: 方向切换时应用状态不丢失
4. **性能稳定**: 方向切换过程流畅无卡顿
5. **用户体验**: 切换过程自然，无明显延迟

### 交互要求
1. **焦点保持**: 输入焦点在方向变化后保持
2. **数据保护**: 用户输入的数据不丢失
3. **导航连续**: 当前页面和位置保持不变
4. **操作连续**: 正在进行的操作不被中断

## 严格验证要求

### 方向变化检测
```typescript
// 监测和验证设备方向变化
const validateOrientationChange = () => {
  const orientationTypes = [
    'portrait-primary',
    'portrait-secondary',
    'landscape-primary',
    'landscape-secondary'
  ];

  // 检查方向API可用性
  expect(window.screen.orientation).toBeDefined();
  expect(typeof window.screen.orientation.lock).toBe('function');
  expect(typeof window.screen.orientation.unlock).toBe('function');

  // 监听方向变化事件
  const orientationHandler = jest.fn();
  window.screen.orientation.addEventListener('change', orientationHandler);

  // 验证当前方向
  const currentOrientation = window.screen.orientation.type;
  expect(orientationTypes).toContain(currentOrientation);

  // 验证角度值
  const angle = window.screen.orientation.angle;
  expect([0, 90, 180, 270]).toContain(angle);

  return {
    currentOrientation,
    angle,
    availableOrientations: orientationTypes
  };
};
```

### 布局适配验证
```typescript
// 验证布局在不同方向下的正确性
const validateLayoutAdaptation = async (orientation: string) => {
  // 获取关键布局元素
  const elements = {
    header: document.querySelector('header'),
    navigation: document.querySelector('nav'),
    content: document.querySelector('main'),
    sidebar: document.querySelector('.sidebar'),
    footer: document.querySelector('footer')
  };

  // 验证元素存在
  Object.values(elements).forEach(element => {
    if (element) {
      expect(element).toBeInTheDocument();
    }
  });

  // 验证视口尺寸适配
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight
  };

  if (orientation.includes('landscape')) {
    expect(viewport.width).toBeGreaterThan(viewport.height);
  } else {
    expect(viewport.height).toBeGreaterThan(viewport.width);
  }

  // 验证CSS媒体查询应用
  const computedStyle = window.getComputedStyle(document.body);
  const orientationClass = orientation.includes('landscape') ? 'landscape' : 'portrait';
  expect(document.body.classList.contains(orientationClass)).toBe(true);

  // 验证关键尺寸不超过视口
  if (elements.content) {
    const contentWidth = elements.content.offsetWidth;
    const contentHeight = elements.content.offsetHeight;
    expect(contentWidth).toBeLessThanOrEqual(viewport.width);
    expect(contentHeight).toBeLessThanOrEqual(viewport.height);
  }

  return { viewport, elements };
};
```

### 状态保持验证
```typescript
// 验证方向变化时的状态保持
const validateStatePreservation = async () => {
  // 创建测试表单并填写数据
  const testForm = document.createElement('form');
  testForm.innerHTML = `
    <input type="text" name="username" value="testuser" />
    <input type="email" name="email" value="test@example.com" />
    <textarea name="message">Test message content</textarea>
    <select name="role">
      <option value="parent" selected>Parent</option>
      <option value="teacher">Teacher</option>
    </select>
  `;

  document.body.appendChild(testForm);

  // 记录初始状态
  const initialState = {
    username: testForm.username.value,
    email: testForm.email.value,
    message: testForm.message.value,
    role: testForm.role.value,
    scrollPosition: window.pageYOffset
  };

  // 模拟方向变化
  const originalOrientation = window.screen.orientation.type;

  // 设置变化监听器
  let orientationChanged = false;
  const changeHandler = () => {
    orientationChanged = true;
  };

  window.screen.orientation.addEventListener('change', changeHandler);

  // 等待方向变化完成
  await new Promise(resolve => {
    if (orientationChanged) {
      resolve(undefined);
    } else {
      setTimeout(resolve, 1000);
    }
  });

  // 验证状态保持
  const finalState = {
    username: testForm.username.value,
    email: testForm.email.value,
    message: testForm.message.value,
    role: testForm.role.value,
    scrollPosition: window.pageYOffset
  };

  expect(finalState).toEqual(initialState);

  // 清理
  document.body.removeChild(testForm);
  window.screen.orientation.removeEventListener('change', changeHandler);

  return { initialState, finalState };
};
```

## 测试数据

### 方向类型定义
```typescript
const orientationTypes = {
  'portrait-primary': {
    description: '竖屏正向',
    width: 'less-than-height',
    angle: 0,
    common: true
  },
  'portrait-secondary': {
    description: '竖屏倒置',
    width: 'less-than-height',
    angle: 180,
    common: false
  },
  'landscape-primary': {
    description: '横屏正向',
    width: 'greater-than-height',
    angle: 90,
    common: true
  },
  'landscape-secondary': {
    description: '横屏倒置',
    width: 'greater-than-height',
    angle: 270,
    common: true
  }
};
```

### 布局断点数据
```typescript
const layoutBreakpoints = {
  portrait: {
    small: { maxWidth: 359 },
    medium: { minWidth: 360, maxWidth: 413 },
    large: { minWidth: 414, maxWidth: 767 },
    xlarge: { minWidth: 768 }
  },
  landscape: {
    small: { maxWidth: 479 },
    medium: { minWidth: 480, maxWidth: 767 },
    large: { minWidth: 768, maxWidth: 1023 },
    xlarge: { minWidth: 1024 }
  }
};
```

### 性能基准数据
```typescript
const performanceBenchmarks = {
  orientationChange: {
    fast: { time: 100, description: '优秀' },
    normal: { time: 300, description: '良好' },
    slow: { time: 500, description: '可接受' },
    verySlow: { time: 1000, description: '需要优化' }
  },
  layoutAdjustment: {
    fast: { time: 50, description: '优秀' },
    normal: { time: 150, description: '良好' },
    slow: { time: 300, description: '可接受' },
    verySlow: { time: 500, description: '需要优化' }
  }
};
```

## 通过/失败标准

### 通过标准
- [ ] 横竖屏切换流畅无明显延迟
- [ ] 布局在两种方向下都正确显示
- [ ] 所有功能在方向变化后保持可用
- [ ] 用户输入数据在方向切换时不丢失
- [ ] 页面滚动位置在方向变化后保持
- [ ] 媒体内容正确适配方向变化
- [ ] 导航和菜单在两种方向下都易用
- [ ] 性能在方向变化过程中保持稳定

### 失败标准
- [ ] 方向切换导致应用崩溃
- [ ] 布局在某种方向下严重错乱
- [ ] 用户数据在方向变化时丢失
- [ ] 功能在方向变化后不可用
- [ ] 方向切换过程卡顿或延迟过长
- [ ] 媒体内容方向适配错误

## 测试环境要求

### 设备要求
- 支持方向旋转的移动设备
- 屏幕旋转功能正常
- 重力传感器工作正常

### 浏览器支持
- 支持Screen Orientation API
- 支持CSS媒体查询
- 支持方向变化事件

## 风险评估

### 低风险
- 方向切换时用户体验下降
- 布局在某种方向下不够美观
- 功能在方向变化时暂时不可用

### 缓解措施
- 完善的响应式设计
- 状态保持机制
- 优雅的降级处理

## 相关文档
- [响应式设计指南](../../../design/responsive-design.md)
- [移动端交互规范](../../../design/mobile-interaction.md)
- [设备API使用指南](../../../api/device-apis.md)

## 测试历史记录
| 测试日期 | 测试人员 | 测试结果 | 问题描述 | 解决状态 |
|----------|----------|----------|----------|----------|
| 2025-11-24 | Claude | 待测试 | - | - |