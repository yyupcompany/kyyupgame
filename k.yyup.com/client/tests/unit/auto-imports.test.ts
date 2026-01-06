import { 
// 控制台错误检测
let consoleSpy: any

beforeEach(() => {
  // 监听控制台错误
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  // 验证没有控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
})

describe, it, expect } from 'vitest';

describe('Auto-imports.d.ts', () => {
  it('should have Vue composition API functions available globally', () => {
    // Test that Vue composition API functions are available
    expect(typeof ref).toBe('function');
    expect(typeof reactive).toBe('function');
    expect(typeof computed).toBe('function');
    expect(typeof watch).toBe('function');
    expect(typeof watchEffect).toBe('function');
    expect(typeof onMounted).toBe('function');
    expect(typeof onUnmounted).toBe('function');
    expect(typeof defineProps).toBe('function');
    expect(typeof defineEmits).toBe('function');
    expect(typeof defineExpose).toBe('function');
    expect(typeof withDefaults).toBe('function');
  });

  it('should have Vue router functions available globally', () => {
    // Test that Vue router functions are available
    expect(typeof useRoute).toBe('function');
    expect(typeof useRouter).toBe('function');
    expect(typeof onBeforeRouteUpdate).toBe('function');
    expect(typeof onBeforeRouteLeave).toBe('function');
  });

  it('should have Pinia store functions available globally', () => {
    // Test that Pinia store functions are available
    expect(typeof useStore).toBe('function');
    expect(typeof defineStore).toBe('function');
  });

  it('should have utility functions available globally', () => {
    // Test that utility functions are available
    expect(typeof toRef).toBe('function');
    expect(typeof toRefs).toBe('function');
    expect(typeof isRef).toBe('function');
    expect(typeof unref).toBe('function');
    expect(typeof toValue).toBe('function');
    expect(typeof nextTick).toBe('function');
  });

  it('should have component functions available globally', () => {
    // Test that component functions are available
    expect(typeof resolveComponent).toBe('function');
    expect(typeof resolveDirective).toBe('function');
    expect(typeof withDirectives).toBe('function');
    expect(typeof createVNode).toBe('function');
    expect(typeof h).toBe('function');
  });

  it('should have lifecycle hooks available globally', () => {
    // Test that lifecycle hooks are available
    expect(typeof onBeforeMount).toBe('function');
    expect(typeof onMounted).toBe('function');
    expect(typeof onBeforeUpdate).toBe('function');
    expect(typeof onUpdated).toBe('function');
    expect(typeof onBeforeUnmount).toBe('function');
    expect(typeof onUnmounted).toBe('function');
    expect(typeof onErrorCaptured).toBe('function');
    expect(typeof onRenderTracked).toBe('function');
    expect(typeof onRenderTriggered).toBe('function');
    expect(typeof onActivated).toBe('function');
    expect(typeof onDeactivated).toBe('function');
  });

  it('should have provide/inject available globally', () => {
    // Test that provide/inject functions are available
    expect(typeof provide).toBe('function');
    expect(typeof inject).toBe('function');
  });

  it('should have template ref functions available globally', () => {
    // Test that template ref functions are available
    expect(typeof toRaw).toBe('function');
    expect(typeof markRaw).toBe('function');
    expect(typeof shallowRef).toBe('function');
    expect(typeof triggerRef).toBe('function');
    expect(typeof customRef).toBe('function');
    expect(typeof shallowReactive).toBe('function');
    expect(typeof readonly).toBe('function');
    expect(typeof shallowReadonly).toBe('function');
    expect(typeof toReactive).toBe('function');
    expect(typeof isReactive).toBe('function');
    expect(typeof isReadonly).toBe('function');
    expect(typeof isShallow).toBe('function');
    expect(typeof isProxy).toBe('function');
  });

  it('should have effect scope functions available globally', () => {
    // Test that effect scope functions are available
    expect(typeof effectScope).toBe('function');
    expect(typeof getCurrentScope).toBe('function');
    expect(typeof onScopeDispose).toBe('function');
  });

  it('should have CSS variables functions available globally', () => {
    // Test that CSS variables functions are available
    expect(typeof useCssModule).toBe('function');
    expect(typeof useCssVars).toBe('function');
  });

  it('should have transition functions available globally', () => {
    // Test that transition functions are available
    expect(typeof Transition).toBe('function');
    expect(typeof TransitionGroup).toBe('function');
  });

  it('should have teleport component available globally', () => {
    // Test that teleport component is available
    expect(typeof Teleport).toBe('function');
  });

  it('should have suspense component available globally', () => {
    // Test that suspense component is available
    expect(typeof Suspense).toBe('function');
  });

  it('should have keep-alive component available globally', () => {
    // Test that keep-alive component is available
    expect(typeof KeepAlive).toBe('function');
  });

  it('should have base transition available globally', () => {
    // Test that base transition is available
    expect(typeof BaseTransition).toBe('function');
  });
});