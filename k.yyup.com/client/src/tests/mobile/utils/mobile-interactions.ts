/**
 * 移动端交互工具函数
 * 提供模拟移动设备操作的实用工具
 */

/**
 * 模拟移动端点击事件
 * @param selector 目标元素选择器
 * @param options 点击选项
 */
export async function tapElement(
  selector: string,
  options: {
    x?: number;
    y?: number;
    delay?: number;
  } = {}
): Promise<void> {
  const element = document.querySelector(selector) as HTMLElement;

  if (!element) {
    throw new Error(`元素 ${selector} 未找到`);
  }

  // 等待元素可见
  await waitForElementVisible(selector);

  // 计算点击坐标
  const rect = element.getBoundingClientRect();
  const x = options.x ?? rect.left + rect.width / 2;
  const y = options.y ?? rect.top + rect.height / 2;

  // 创建触摸事件
  const touchStart = new TouchEvent('touchstart', {
    bubbles: true,
    cancelable: true,
    touches: [{
      identifier: 0,
      target: element,
      clientX: x,
      clientY: y,
      pageX: x,
      pageY: y,
      screenX: x,
      screenY: y,
      radiusX: 10,
      radiusY: 10,
      rotationAngle: 0,
      force: 1
    } as Touch]
  });

  const touchEnd = new TouchEvent('touchend', {
    bubbles: true,
    cancelable: true,
    changedTouches: [{
      identifier: 0,
      target: element,
      clientX: x,
      clientY: y,
      pageX: x,
      pageY: y,
      screenX: x,
      screenY: y,
      radiusX: 10,
      radiusY: 10,
      rotationAngle: 0,
      force: 1
    } as Touch]
  });

  // 模拟点击序列
  element.dispatchEvent(touchStart);

  if (options.delay) {
    await new Promise(resolve => setTimeout(resolve, options.delay));
  }

  element.dispatchEvent(touchEnd);

  // 同时触发点击事件（兼容性）
  const clickEvent = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y
  });

  element.dispatchEvent(clickEvent);
}

/**
 * 模拟移动端滑动操作
 * @param selector 目标元素选择器
 * @param direction 滑动方向
 * @param distance 滑动距离
 * @param duration 滑动持续时间
 */
export async function swipeElement(
  selector: string,
  direction: 'up' | 'down' | 'left' | 'right',
  distance: number = 100,
  duration: number = 300
): Promise<void> {
  const element = document.querySelector(selector) as HTMLElement;

  if (!element) {
    throw new Error(`元素 ${selector} 未找到`);
  }

  await waitForElementVisible(selector);

  const rect = element.getBoundingClientRect();
  const startX = rect.left + rect.width / 2;
  const startY = rect.top + rect.height / 2;

  // 计算终点坐标
  let endX = startX;
  let endY = startY;

  switch (direction) {
    case 'up':
      endY = startY - distance;
      break;
    case 'down':
      endY = startY + distance;
      break;
    case 'left':
      endX = startX - distance;
      break;
    case 'right':
      endX = startX + distance;
      break;
  }

  // 创建滑动事件
  const touch = {
    identifier: 0,
    target: element,
    clientX: startX,
    clientY: startY,
    pageX: startX,
    pageY: startY,
    screenX: startX,
    screenY: startY,
    radiusX: 10,
    radiusY: 10,
    rotationAngle: 0,
    force: 1
  } as Touch;

  const touchStart = new TouchEvent('touchstart', {
    bubbles: true,
    cancelable: true,
    touches: [touch]
  });

  const touchMove = new TouchEvent('touchmove', {
    bubbles: true,
    cancelable: true,
    touches: [{
      ...touch,
      clientX: endX,
      clientY: endY,
      pageX: endX,
      pageY: endY,
      screenX: endX,
      screenY: endY
    } as Touch]
  });

  const touchEnd = new TouchEvent('touchend', {
    bubbles: true,
    cancelable: true,
    changedTouches: [{
      ...touch,
      clientX: endX,
      clientY: endY,
      pageX: endX,
      pageY: endY,
      screenX: endX,
      screenY: endY
    } as Touch]
  });

  // 执行滑动序列
  element.dispatchEvent(touchStart);

  // 模拟滑动过程
  const steps = 10;
  const stepDuration = duration / steps;

  for (let i = 1; i <= steps; i++) {
    const progress = i / steps;
    const currentX = startX + (endX - startX) * progress;
    const currentY = startY + (endY - startY) * progress;

    const moveEvent = new TouchEvent('touchmove', {
      bubbles: true,
      cancelable: true,
      touches: [{
        ...touch,
        clientX: currentX,
        clientY: currentY,
        pageX: currentX,
        pageY: currentY,
        screenX: currentX,
        screenY: currentY
      } as Touch]
    });

    element.dispatchEvent(moveEvent);
    await new Promise(resolve => setTimeout(resolve, stepDuration));
  }

  element.dispatchEvent(touchEnd);
}

/**
 * 模拟长按操作
 * @param selector 目标元素选择器
 * @param duration 长按持续时间（毫秒）
 */
export async function longPress(
  selector: string,
  duration: number = 1000
): Promise<void> {
  const element = document.querySelector(selector) as HTMLElement;

  if (!element) {
    throw new Error(`元素 ${selector} 未找到`);
  }

  await waitForElementVisible(selector);

  const rect = element.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  const touch = {
    identifier: 0,
    target: element,
    clientX: x,
    clientY: y,
    pageX: x,
    pageY: y,
    screenX: x,
    screenY: y,
    radiusX: 10,
    radiusY: 10,
    rotationAngle: 0,
    force: 1
  } as Touch;

  const touchStart = new TouchEvent('touchstart', {
    bubbles: true,
    cancelable: true,
    touches: [touch]
  });

  // 开始触摸
  element.dispatchEvent(touchStart);

  // 等待指定时间
  await new Promise(resolve => setTimeout(resolve, duration));

  // 结束触摸
  const touchEnd = new TouchEvent('touchend', {
    bubbles: true,
    cancelable: true,
    changedTouches: [touch]
  });

  element.dispatchEvent(touchEnd);
}

/**
 * 模拟双击操作
 * @param selector 目标元素选择器
 * @param interval 两次点击间隔（毫秒）
 */
export async function doubleTap(
  selector: string,
  interval: number = 100
): Promise<void> {
  await tapElement(selector);
  await new Promise(resolve => setTimeout(resolve, interval));
  await tapElement(selector);
}

/**
 * 模拟输入文本（移动端键盘）
 * @param selector 输入框选择器
 * @param text 要输入的文本
 * @param options 输入选项
 */
export async function typeText(
  selector: string,
  text: string,
  options: {
    clear?: boolean;
    delay?: number;
    triggerInput?: boolean;
  } = {}
): Promise<void> {
  const element = document.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement;

  if (!element) {
    throw new Error(`输入元素 ${selector} 未找到`);
  }

  await waitForElementVisible(selector);

  // 聚焦元素
  element.focus();

  // 清空现有内容
  if (options.clear !== false) {
    element.value = '';

    // 触发input事件
    const inputEvent = new Event('input', { bubbles: true, cancelable: true });
    element.dispatchEvent(inputEvent);
  }

  // 逐字符输入
  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    // 模拟键盘输入
    const keydownEvent = new KeyboardEvent('keydown', {
      key: char,
      code: `Key${char.toUpperCase()}`,
      keyCode: char.charCodeAt(0),
      bubbles: true,
      cancelable: true
    });

    const keyupEvent = new KeyboardEvent('keyup', {
      key: char,
      code: `Key${char.toUpperCase()}`,
      keyCode: char.charCodeAt(0),
      bubbles: true,
      cancelable: true
    });

    element.dispatchEvent(keydownEvent);
    element.value += char;
    element.dispatchEvent(keyupEvent);

    // 触发input事件
    if (options.triggerInput !== false) {
      const inputEvent = new Event('input', { bubbles: true, cancelable: true });
      element.dispatchEvent(inputEvent);
    }

    // 输入延迟
    if (options.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay));
    }
  }

  // 触发change事件
  const changeEvent = new Event('change', { bubbles: true, cancelable: true });
  element.dispatchEvent(changeEvent);
}

/**
 * 模拟手势操作（缩放）
 * @param selector 目标元素选择器
 * @param scale 缩放比例
 * @param centerX 缩放中心X坐标
 * @param centerY 缩放中心Y坐标
 */
export async function pinchZoom(
  selector: string,
  scale: number,
  centerX?: number,
  centerY?: number
): Promise<void> {
  const element = document.querySelector(selector) as HTMLElement;

  if (!element) {
    throw new Error(`元素 ${selector} 未找到`);
  }

  await waitForElementVisible(selector);

  const rect = element.getBoundingClientRect();
  const x = centerX ?? rect.left + rect.width / 2;
  const y = centerY ?? rect.top + rect.height / 2;

  // 创建两个触摸点
  const distance = 50;
  const touch1Start = {
    identifier: 1,
    target: element,
    clientX: x - distance,
    clientY: y,
    pageX: x - distance,
    pageY: y,
    screenX: x - distance,
    screenY: y,
    radiusX: 10,
    radiusY: 10,
    rotationAngle: 0,
    force: 1
  } as Touch;

  const touch2Start = {
    identifier: 2,
    target: element,
    clientX: x + distance,
    clientY: y,
    pageX: x + distance,
    pageY: y,
    screenX: x + distance,
    screenY: y,
    radiusX: 10,
    radiusY: 10,
    rotationAngle: 0,
    force: 1
  } as Touch;

  // 计算缩放后的触摸点
  const scaledDistance = distance * scale;
  const touch1End = {
    ...touch1Start,
    clientX: x - scaledDistance,
    pageX: x - scaledDistance,
    screenX: x - scaledDistance
  } as Touch;

  const touch2End = {
    ...touch2Start,
    clientX: x + scaledDistance,
    pageX: x + scaledDistance,
    screenX: x + scaledDistance
  } as Touch;

  // 开始缩放
  const touchStart = new TouchEvent('touchstart', {
    bubbles: true,
    cancelable: true,
    touches: [touch1Start, touch2Start]
  });

  element.dispatchEvent(touchStart);

  // 缩放过程
  const steps = 10;
  for (let i = 1; i <= steps; i++) {
    const progress = i / steps;
    const currentDistance = distance + (scaledDistance - distance) * progress;

    const touch1Move = {
      ...touch1Start,
      clientX: x - currentDistance,
      pageX: x - currentDistance,
      screenX: x - currentDistance
    } as Touch;

    const touch2Move = {
      ...touch2Start,
      clientX: x + currentDistance,
      pageX: x + currentDistance,
      screenX: x + currentDistance
    } as Touch;

    const touchMove = new TouchEvent('touchmove', {
      bubbles: true,
      cancelable: true,
      touches: [touch1Move, touch2Move]
    });

    element.dispatchEvent(touchMove);
    await new Promise(resolve => setTimeout(resolve, 20));
  }

  // 结束缩放
  const touchEnd = new TouchEvent('touchend', {
    bubbles: true,
    cancelable: true,
    changedTouches: [touch1End, touch2End]
  });

  element.dispatchEvent(touchEnd);
}

/**
 * 等待元素出现
 * @param selector 元素选择器
 * @param timeout 超时时间（毫秒）
 */
export async function waitForElement(
  selector: string,
  timeout: number = 5000
): Promise<Element> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const checkElement = () => {
      const element = document.querySelector(selector);

      if (element) {
        resolve(element);
        return;
      }

      if (Date.now() - startTime > timeout) {
        reject(new Error(`等待元素 ${selector} 超时`));
        return;
      }

      setTimeout(checkElement, 100);
    };

    checkElement();
  });
}

/**
 * 等待元素可见
 * @param selector 元素选择器
 * @param timeout 超时时间（毫秒）
 */
export async function waitForElementVisible(
  selector: string,
  timeout: number = 5000
): Promise<Element> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const checkVisibility = () => {
      const element = document.querySelector(selector);

      if (element && element.offsetParent !== null) {
        resolve(element);
        return;
      }

      if (Date.now() - startTime > timeout) {
        reject(new Error(`等待元素 ${selector} 可见超时`));
        return;
      }

      setTimeout(checkVisibility, 100);
    };

    checkVisibility();
  });
}

/**
 * 等待元素消失
 * @param selector 元素选择器
 * @param timeout 超时时间（毫秒）
 */
export async function waitForElementToDisappear(
  selector: string,
  timeout: number = 5000
): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const checkDisappearance = () => {
      const element = document.querySelector(selector);

      if (!element) {
        resolve();
        return;
      }

      if (Date.now() - startTime > timeout) {
        reject(new Error(`等待元素 ${selector} 消失超时`));
        return;
      }

      setTimeout(checkDisappearance, 100);
    };

    checkDisappearance();
  });
}

/**
 * 获取元素位置和尺寸信息
 * @param selector 元素选择器
 */
export function getElementInfo(selector: string): {
  element: Element | null;
  rect: DOMRect | null;
  visible: boolean;
  hasFocus: boolean;
  tagName: string;
  className: string;
  textContent: string;
} {
  const element = document.querySelector(selector);

  if (!element) {
    return {
      element: null,
      rect: null,
      visible: false,
      hasFocus: false,
      tagName: '',
      className: '',
      textContent: ''
    };
  }

  const rect = element.getBoundingClientRect();

  return {
    element,
    rect,
    visible: element.offsetParent !== null,
    hasFocus: document.activeElement === element,
    tagName: element.tagName.toLowerCase(),
    className: element.className,
    textContent: element.textContent || ''
  };
}

/**
 * 滚动到指定元素
 * @param selector 元素选择器
 * @param options 滚动选项
 */
export async function scrollToElement(
  selector: string,
  options: {
    behavior?: 'smooth' | 'auto';
    block?: 'start' | 'center' | 'end' | 'nearest';
    inline?: 'start' | 'center' | 'end' | 'nearest';
  } = {}
): Promise<void> {
  const element = document.querySelector(selector) as HTMLElement;

  if (!element) {
    throw new Error(`元素 ${selector} 未找到`);
  }

  element.scrollIntoView({
    behavior: options.behavior || 'smooth',
    block: options.block || 'center',
    inline: options.inline || 'nearest'
  });

  // 等待滚动完成
  await new Promise(resolve => setTimeout(resolve, 500));
}

/**
 * 模拟设备方向变化
 * @param orientation 设备方向
 */
export function simulateOrientationChange(orientation: 'portrait' | 'landscape'): void {
  // 触发方向变化事件
  const orientationChangeEvent = new Event('orientationchange', {
    bubbles: true,
    cancelable: true
  });

  // 更新窗口尺寸（模拟）
  if (orientation === 'landscape') {
    Object.defineProperty(window, 'innerWidth', { value: 812, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 375, configurable: true });
  } else {
    Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 812, configurable: true });
  }

  // 触发resize事件
  const resizeEvent = new Event('resize', {
    bubbles: true,
    cancelable: true
  });

  window.dispatchEvent(orientationChangeEvent);
  window.dispatchEvent(resizeEvent);
}

/**
 * 模拟网络状态变化
 * @param networkType 网络类型
 * @param effectiveType 有效网络类型
 */
export function simulateNetworkChange(
  networkType: 'wifi' | 'cellular' | 'none',
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g' = '4g'
): void {
  // 创建网络信息对象
  const networkInfo = {
    type: networkType,
    effectiveType: effectiveType,
    downlink: effectiveType === '4g' ? 10 : effectiveType === '3g' ? 2 : 0.5,
    rtt: effectiveType === '4g' ? 50 : effectiveType === '3g' ? 200 : 1000,
    saveData: false
  };

  // 触发网络变化事件
  const networkChangeEvent = new Event('change', {
    bubbles: true,
    cancelable: true
  });

  // 更新navigator.connection（如果支持）
  if ('connection' in navigator) {
    Object.assign(navigator.connection, networkInfo);
    (navigator.connection as any).dispatchEvent(networkChangeEvent);
  }
}

export default {
  tapElement,
  swipeElement,
  longPress,
  doubleTap,
  typeText,
  pinchZoom,
  waitForElement,
  waitForElementVisible,
  waitForElementToDisappear,
  getElementInfo,
  scrollToElement,
  simulateOrientationChange,
  simulateNetworkChange
};