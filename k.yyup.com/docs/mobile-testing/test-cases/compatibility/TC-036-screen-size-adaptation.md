# TC-036: 不同屏幕尺寸适配测试

## 测试用例标识
- **用例编号**: TC-036
- **测试组**: 兼容性和响应式测试
- **测试类型**: UI兼容性测试
- **优先级**: 高

## 测试目标
验证移动端应用在不同屏幕尺寸下的适配效果，确保界面在各种设备上都能正确显示和操作，提供一致的用户体验。

## 测试前置条件
1. 应用已正常启动并运行
2. 响应式设计已实现
3. 测试设备或模拟器已准备就绪
4. 开发者工具设备模拟功能可用

## 测试步骤

### 步骤1: 小屏幕设备测试 (< 360px)
1. **模拟iPhone 5/SE屏幕 (320x568px)**
   - 打开Chrome开发者工具
   - 选择iPhone 5/SE设备模拟
   - 访问移动端应用首页

2. **验证布局适配**
   - 检查导航栏是否折叠为汉堡菜单
   - 验证按钮和链接可点击区域足够大(最小44px)
   - 确认文字大小可读(最小16px)

3. **测试功能可用性**
   ```
   检查项目:
   - 登录表单完整显示
   - 导航菜单可正常展开/收起
   - 表单输入框可正常输入
   - 列表项目可正常滚动
   ```

### 步骤2: 中等屏幕设备测试 (360px - 414px)
1. **模拟常见手机屏幕 (375x667px - iPhone 8)**
   - 切换到iPhone 8设备模拟
   - 测试主要功能页面
   - 验证布局平衡性

2. **测试内容显示**
   - 验证卡片布局正常显示
   - 检查图片和文字比例协调
   - 确认空白区域合理利用

3. **验证交互体验**
   ```
   测试操作:
   - 滑动手势正常工作
   - 点击响应准确
   - 滚动流畅无卡顿
   - 表单提交正常
   ```

### 步骤3: 大屏幕设备测试 (414px - 768px)
1. **模拟大屏手机/小平板 (414x896px - iPhone 11 Pro Max)**
   - 使用iPhone 11 Pro Max设备模拟
   - 测试界面元素的扩展性
   - 验证内容密度优化

2. **测试布局优化**
   - 检查是否利用额外空间显示更多信息
   - 验证侧边栏或扩展导航
   - 确认内容区域合理扩展

3. **验证用户体验提升**
   ```
   检查优化:
   - 显示更多列表项
   - 更宽的表单输入框
   - 更大的图片显示
   - 更丰富的内容布局
   ```

### 步骤4: 平板设备测试 (768px - 1024px)
1. **模拟iPad屏幕 (768x1024px - iPad)**
   - 切换到iPad设备模拟
   - 测试应用的平板适配模式
   - 验证横竖屏切换

2. **验证多列布局**
   - 检查是否采用多列布局
   - 验证侧边导航栏显示
   - 确认内容区域充分利用空间

3. **测试复杂页面适配**
   ```
   测试页面:
   - 仪表板多卡片布局
   - 表格数据显示
   - 图表和统计信息
   - 复杂表单设计
   ```

### 步骤5: 超大屏幕设备测试 (> 1024px)
1. **模拟大平板设备 (1024x1366px - iPad Pro)**
   - 使用iPad Pro设备模拟
   - 测试桌面模式适配
   - 验证高级功能显示

2. **验证高级布局**
   - 检查是否支持多窗口布局
   - 验证桌面级导航体验
   - 确认高级功能可用

3. **测试极限情况**
   ```
   极限测试:
   - 最小字体可读性
   - 最大按钮点击便利性
   - 内容溢出处理
   - 空白区域利用
   ```

### 步骤6: 响应式断点测试
1. **测试关键断点**
   ```css
   /* 关键断点测试 */
   @media (max-width: 359px) { /* 极小屏幕 */ }
   @media (min-width: 360px) and (max-width: 413px) { /* 小屏幕 */ }
   @media (min-width: 414px) and (max-width: 767px) { /* 中等屏幕 */ }
   @media (min-width: 768px) and (max-width: 1023px) { /* 大屏幕 */ }
   @media (min-width: 1024px) { /* 超大屏幕 */ }
   ```

2. **验证断点切换**
   - 逐渐调整浏览器窗口宽度
   - 观察布局变化是否平滑
   - 检查是否有布局错乱或重叠

3. **测试边界情况**
   - 在断点边界测试布局稳定性
   - 验证元素不会在临界宽度消失或错位

## 预期结果

### 布局适配要求
1. **导航适配**: 小屏幕折叠菜单，大屏幕展开导航
2. **内容密度**: 随屏幕尺寸合理调整内容密度
3. **交互元素**: 按钮和链接保持合适的点击区域
4. **文字可读**: 字体大小在所有屏幕上都可读
5. **图片适配**: 图片按比例缩放不变形

### 响应式行为
1. **平滑过渡**: 布局变化平滑无闪烁
2. **功能完整**: 所有功能在各屏幕尺寸下可用
3. **性能稳定**: 不同尺寸下性能保持稳定

## 严格验证要求

### 布局验证函数
```typescript
// 验证响应式布局
const validateResponsiveLayout = (screenWidth: number, element: HTMLElement) => {
  const elementWidth = element.offsetWidth;
  const viewportWidth = window.innerWidth;

  // 验证元素宽度适应屏幕
  expect(elementWidth).toBeLessThanOrEqual(viewportWidth);

  // 验证最小字体大小
  const computedStyle = window.getComputedStyle(element);
  const fontSize = parseFloat(computedStyle.fontSize);
  expect(fontSize).toBeGreaterThanOrEqual(14); // 最小14px

  // 验证按钮最小点击区域
  if (element.tagName === 'BUTTON' || element.tagName === 'A') {
    const clickArea = elementWidth * element.offsetHeight;
    expect(clickArea).toBeGreaterThanOrEqual(44 * 44); // 最小44x44px
  }
};
```

### 媒体查询验证
```typescript
// 验证CSS媒体查询
const validateMediaQueries = () => {
  const breakpoints = [
    { max: 359, name: 'extra-small' },
    { max: 413, name: 'small' },
    { max: 767, name: 'medium' },
    { max: 1023, name: 'large' },
    { min: 1024, name: 'extra-large' }
  ];

  const currentWidth = window.innerWidth;
  const activeBreakpoint = breakpoints.find(bp => {
    if (bp.max) {
      return currentWidth <= bp.max;
    } else if (bp.min) {
      return currentWidth >= bp.min;
    }
    return false;
  });

  expect(activeBreakpoint).toBeDefined();

  // 验证对应的CSS类已应用
  const body = document.body;
  expect(body.classList.contains(`breakpoint-${activeBreakpoint?.name}`)).toBe(true);
};
```

### 性能验证
```typescript
// 验证响应式性能
const validateResponsivePerformance = async () => {
  const startTime = performance.now();

  // 模拟窗口大小变化
  window.resizeTo(window.innerWidth * 1.5, window.innerHeight);

  // 等待布局稳定
  await new Promise(resolve => setTimeout(resolve, 300));

  const endTime = performance.now();
  const layoutTime = endTime - startTime;

  // 布局调整应在300ms内完成
  expect(layoutTime).toBeLessThan(300);
};
```

## 测试数据

### 设备尺寸规范
```typescript
const deviceSpecs = [
  {
    name: 'iPhone 5/SE',
    width: 320,
    height: 568,
    density: 2,
    type: 'extra-small'
  },
  {
    name: 'Samsung Galaxy S5',
    width: 360,
    height: 640,
    density: 3,
    type: 'small'
  },
  {
    name: 'iPhone 8',
    width: 375,
    height: 667,
    density: 2,
    type: 'small'
  },
  {
    name: 'iPhone 11',
    width: 414,
    height: 896,
    density: 2,
    type: 'medium'
  },
  {
    name: 'iPad',
    width: 768,
    height: 1024,
    density: 2,
    type: 'large'
  },
  {
    name: 'iPad Pro',
    width: 1024,
    height: 1366,
    density: 2,
    type: 'extra-large'
  }
];
```

### 响应式断点
```typescript
const responsiveBreakpoints = {
  extraSmall: { max: 359, container: '100%' },
  small: { min: 360, max: 413, container: '100%' },
  medium: { min: 414, max: 767, container: '100%' },
  large: { min: 768, max: 1023, container: '750px' },
  extraLarge: { min: 1024, container: '970px' }
};
```

## 通过/失败标准

### 通过标准
- [ ] 所有测试设备上界面正常显示
- [ ] 导航和交互元素功能完整
- [ ] 文字可读，按钮可点击
- [ ] 图片和媒体内容正确适配
- [ ] 横竖屏切换正常
- [ ] 响应式断点工作正确
- [ ] 性能保持稳定

### 失败标准
- [ ] 布局错乱或元素重叠
- [ ] 按钮或链接无法点击
- [ ] 文字过小无法阅读
- [ ] 图片变形或溢出
- [ ] 功能在特定屏幕尺寸下不可用
- [ ] 响应式切换卡顿或延迟

## 测试环境要求

### 测试工具
- Chrome DevTools设备模拟器
- Safari响应式设计模式
- Firefox响应式设计视图
- 真实设备测试环境

### 设备覆盖
- iOS设备 (iPhone, iPad)
- Android设备 (各尺寸手机/平板)
- 不同像素密度设备

## 风险评估

### 中等风险
- 特定设备用户体验差
- 功能在某些设备上不可用
- 界面元素难以交互

### 缓解措施
- 提供渐进增强体验
- 优雅降级处理
- 全面的设备测试覆盖

## 相关文档
- [响应式设计指南](../../../design/responsive-design.md)
- [移动端UI规范](../../../design/mobile-ui-specs.md)
- [设备兼容性要求](../../../requirements/device-compatibility.md)

## 测试历史记录
| 测试日期 | 测试人员 | 测试结果 | 问题描述 | 解决状态 |
|----------|----------|----------|----------|----------|
| 2025-11-24 | Claude | 待测试 | - | - |