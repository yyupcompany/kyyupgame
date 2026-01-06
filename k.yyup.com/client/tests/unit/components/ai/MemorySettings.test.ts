import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import { VueWrapper } from '@vue/test-utils';
import MemorySettings from '@/components/ai/memory/MemorySettings.vue';
import { createComponentWrapper, waitForUpdate, createTestCleanup } from '../../../utils/component-test-helper';

// Mock Element Plus components and functions
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus')
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn(() => Promise.resolve('confirm')),
      alert: vi.fn(() => Promise.resolve('confirm')),
      prompt: vi.fn(() => Promise.resolve({ value: 'test' }))
    },
  ElCard: {
    name: 'ElCard',
    template: `
      <div class="el-card">
        <div class="el-card__header" v-if="$slots.header">
          <slot name="header" />
        </div>
        <div class="el-card__body">
          <slot />
        </div>
      </div>
    `
  },
  ElIcon: {
    name: 'ElIcon',
    template: '<div class="el-icon"><component :is="$attrs.component" /></div>',
  },
  ElForm: {
    name: 'ElForm',
    template: '<form class="el-form"><slot /></form>',
    props: ['model', 'labelWidth']
  },
  ElFormItem: {
    name: 'ElFormItem',
    template: '<div class="el-form-item"><div class="el-form-item__label">{{ label }}</div><div class="el-form-item__content"><slot /></div></div>',
    props: ['label']
  },
  ElInput: {
    name: 'ElInput',
    template: `
      <div class="el-input">
        <input 
          :value="modelValue" 
          @input="$emit('update:modelValue', $event.target.value)"
          :placeholder="placeholder"
          :type="type"
          :rows="rows"
          class="el-input__inner"
        />
      </div>
    `,
    props: ['modelValue', 'placeholder', 'clearable', 'type', 'rows'],
    emits: ['update:modelValue']
  },
  ElInputNumber: {
    name: 'ElInputNumber',
    template: `
      <div class="el-input-number">
        <input 
          :value="modelValue" 
          @input="$emit('update:modelValue', Number($event.target.value))"
          :min="min"
          :max="max"
          :placeholder="placeholder"
          type="number"
          class="el-input__inner"
        />
      </div>
    `,
    props: ['modelValue', 'min', 'max', 'placeholder'],
    emits: ['update:modelValue']
  },
  ElSelect: {
    name: 'ElSelect',
    template: `
      <div class="el-select">
        <select :value="modelValue" @change="$emit('update:modelValue', $event.target.value)">
          <slot />
        </select>
      </div>
    `,
    props: ['modelValue', 'placeholder'],
    emits: ['update:modelValue']
  },
  ElOption: {
    name: 'ElOption',
    template: '<option :value="value"><slot /></option>',
    props: ['value', 'label']
  },
  ElSwitch: {
    name: 'ElSwitch',
    template: `
      <div class="el-switch">
        <input 
          type="checkbox" 
          :checked="modelValue" 
          @change="$emit('update:modelValue', $event.target.checked)"
        />
      </div>
    `,
    props: ['modelValue', 'activeText', 'inactiveText'],
    emits: ['update:modelValue']
  },
  ElSlider: {
    name: 'ElSlider',
    template: `
      <div class="el-slider">
        <input 
          type="range" 
          :value="modelValue" 
          @input="$emit('update:modelValue', Number($event.target.value))"
          :min="min"
          :max="max"
          :step="step"
        />
      </div>
    `,
    props: ['modelValue', 'min', 'max', 'step', 'showInput'],
    emits: ['update:modelValue']
  },
  ElButton: {
    name: 'ElButton',
    template: `
      <button 
        class="el-button" 
        :class="[type ? 'el-button--' + type : '']"
        :disabled="loading"
        @click="$emit('click', $event)"
      >
        <slot />
      </button>
    `,
    props: ['type', 'loading'],
    emits: ['click']
  },
  }
});

// Mock Element Plus icons
vi.mock('@element-plus/icons-vue', () => ({
  FolderOpened: { name: 'FolderOpened' },
  Delete: { name: 'Delete' },
  Setting: { name: 'Setting' },
  Upload: { name: 'Upload' },
  Check: { name: 'Check' },
  RefreshLeft: { name: 'RefreshLeft' }
}));

// 控制台错误检测变量
let consoleSpy: any

describe('MemorySettings.vue', () => {
  let wrapper: VueWrapper<any>;
  const cleanup = createTestCleanup();

  const mockProps = {
    userId: 1
  };

  const createWrapper = (props = {}) => {
    return createComponentWrapper(MemorySettings, {
      props: {
        ...mockProps,
        ...props
      },
      withPinia: true,
      withRouter: false,
      global: {
        stubs: {
          'el-card': true,
          'el-icon': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-input-number': true,
          'el-select': true,
          'el-option': true,
          'el-switch': true,
          'el-slider': true,
          'el-button': true
        }
      }
    });
  };

  beforeEach(() => {
    wrapper = createWrapper();
    cleanup.addCleanup(() => wrapper?.unmount());
    vi.clearAllMocks();
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    cleanup.cleanup();
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('Component Initialization', () => {
    it('renders properly with required props', () => {
      expect(wrapper.find('.memory-settings, .el-card').exists()).toBe(true);
    });

    it('initializes archive form with default values', () => {
      const vm = wrapper.vm as any;
      expect(vm.archiveForm).toBeDefined();
    });

    it('initializes cleanup form with default values', () => {
      wrapper = createWrapper();
      expect(wrapper.vm.cleanupForm.daysOld).toBe(30);
      expect(wrapper.vm.cleanupForm.memoryType).toBe('');
      expect(wrapper.vm.cleanupForm.dryRun).toBe(true);
    });

    it('initializes threshold form with default values', () => {
      wrapper = createWrapper();
      expect(wrapper.vm.thresholdForm.importanceThreshold).toBe(0.5);
      expect(wrapper.vm.thresholdForm.similarityThreshold).toBe(0.7);
      expect(wrapper.vm.thresholdForm.shortTermLimit).toBe(100);
      expect(wrapper.vm.thresholdForm.longTermLimit).toBe(1000);
    });

    it('initializes loading states as false', () => {
      wrapper = createWrapper();
      expect(wrapper.vm.archiveLoading).toBe(false);
      expect(wrapper.vm.cleanupLoading).toBe(false);
      expect(wrapper.vm.thresholdLoading).toBe(false);
    });
  });

  describe('Archive Functionality', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    it('shows warning when memory ID is empty', async () => {
      await wrapper.vm.handleArchive();
      
      expect(ElMessage.warning).toHaveBeenCalledWith('请输入记忆ID');
      expect(ElMessageBox.confirm).not.toHaveBeenCalled();
    });

    it('shows confirmation dialog when memory ID is provided', async () => {
      wrapper.vm.archiveForm.memoryId = '123';
      await wrapper.vm.handleArchive();
      
      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        '确定要将记忆 123 归档为长期记忆吗？',
        '确认归档',
        expect.objectContaining({
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
      );
    });

    it('emits archive event when confirmed', async () => {
      wrapper.vm.archiveForm.memoryId = '123';
      wrapper.vm.archiveForm.reason = 'Test reason';
      wrapper.vm.archiveForm.retentionPeriod = 180;
      
      await wrapper.vm.handleArchive();
      
      expect(wrapper.emitted('archive')).toBeTruthy();
      expect(wrapper.emitted('archive')[0]).toEqual([
        '123',
        {
          reason: 'Test reason',
          retentionPeriod: 180
        }
      ]);
    });

    it('resets archive form after successful archive', async () => {
      wrapper.vm.archiveForm.memoryId = '123';
      wrapper.vm.archiveForm.reason = 'Test reason';
      wrapper.vm.archiveForm.retentionPeriod = 180;
      
      await wrapper.vm.handleArchive();
      
      expect(wrapper.vm.archiveForm.memoryId).toBe('');
      expect(wrapper.vm.archiveForm.reason).toBe('');
      expect(wrapper.vm.archiveForm.retentionPeriod).toBe(365);
    });

    it('sets loading state during archive process', async () => {
      wrapper.vm.archiveForm.memoryId = '123';
      
      // Mock a delay in the confirmation
      vi.mocked(ElMessageBox.confirm).mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );
      
      const archivePromise = wrapper.vm.handleArchive();
      expect(wrapper.vm.archiveLoading).toBe(true);
      
      await archivePromise;
      expect(wrapper.vm.archiveLoading).toBe(false);
    });

    it('handles archive cancellation gracefully', async () => {
      vi.mocked(ElMessageBox.confirm).mockRejectedValueOnce('cancel');
      
      wrapper.vm.archiveForm.memoryId = '123';
      await wrapper.vm.handleArchive();
      
      expect(wrapper.emitted('archive')).toBeFalsy();
      expect(wrapper.vm.archiveLoading).toBe(false);
    });
  });

  describe('Cleanup Functionality', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('shows confirmation dialog for dry run mode', async () => {
      wrapper.vm.cleanupForm.daysOld = 30;
      wrapper.vm.cleanupForm.dryRun = true;
      
      await wrapper.vm.handleCleanup();
      
      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        '确定要预览清理 30 天前的记忆吗？',
        '确认预览清理',
        expect.objectContaining({
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        })
      );
    });

    it('shows confirmation dialog for actual cleanup mode', async () => {
      wrapper.vm.cleanupForm.daysOld = 30;
      wrapper.vm.cleanupForm.dryRun = false;
      
      await wrapper.vm.handleCleanup();
      
      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        '确定要清理 30 天前的记忆吗？此操作不可撤销！',
        '确认执行清理',
        expect.objectContaining({
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
      );
    });

    it('emits cleanup event with correct options', async () => {
      wrapper.vm.cleanupForm.daysOld = 45;
      wrapper.vm.cleanupForm.memoryType = 'short_term';
      wrapper.vm.cleanupForm.dryRun = false;
      
      await wrapper.vm.handleCleanup();
      
      expect(wrapper.emitted('cleanup')).toBeTruthy();
      expect(wrapper.emitted('cleanup')[0]).toEqual([{
        daysOld: 45,
        memoryType: 'short_term',
        dryRun: false
      }]);
    });

    it('emits cleanup event without memoryType when empty', async () => {
      wrapper.vm.cleanupForm.daysOld = 30;
      wrapper.vm.cleanupForm.memoryType = '';
      wrapper.vm.cleanupForm.dryRun = true;
      
      await wrapper.vm.handleCleanup();
      
      expect(wrapper.emitted('cleanup')).toBeTruthy();
      expect(wrapper.emitted('cleanup')[0]).toEqual([{
        daysOld: 30,
        dryRun: true
      }]);
    });

    it('sets loading state during cleanup process', async () => {
      vi.mocked(ElMessageBox.confirm).mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );
      
      const cleanupPromise = wrapper.vm.handleCleanup();
      expect(wrapper.vm.cleanupLoading).toBe(true);
      
      await cleanupPromise;
      expect(wrapper.vm.cleanupLoading).toBe(false);
    });

    it('handles cleanup cancellation gracefully', async () => {
      vi.mocked(ElMessageBox.confirm).mockRejectedValueOnce('cancel');
      
      await wrapper.vm.handleCleanup();
      
      expect(wrapper.emitted('cleanup')).toBeFalsy();
      expect(wrapper.vm.cleanupLoading).toBe(false);
    });
  });

  describe('Threshold Settings', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('saves thresholds successfully', async () => {
      await wrapper.vm.saveThresholds();
      
      expect(wrapper.vm.thresholdLoading).toBe(true);
      await nextTick();
      expect(wrapper.vm.thresholdLoading).toBe(false);
      
      expect(ElMessage.success).toHaveBeenCalledWith('设置保存成功');
    });

    it('handles threshold save error', async () => {
      // Mock the save operation to fail
      const originalSaveThresholds = wrapper.vm.saveThresholds;
      wrapper.vm.saveThresholds = async () => {
        throw new Error('Save failed');
      };
      
      await wrapper.vm.saveThresholds();
      
      expect(ElMessage.error).toHaveBeenCalledWith('设置保存失败');
      
      // Restore original method
      wrapper.vm.saveThresholds = originalSaveThresholds;
    });

    it('resets thresholds to default values', () => {
      // Change some values first
      wrapper.vm.thresholdForm.importanceThreshold = 0.8;
      wrapper.vm.thresholdForm.similarityThreshold = 0.9;
      wrapper.vm.thresholdForm.shortTermLimit = 200;
      wrapper.vm.thresholdForm.longTermLimit = 2000;
      
      wrapper.vm.resetThresholds();
      
      expect(wrapper.vm.thresholdForm.importanceThreshold).toBe(0.5);
      expect(wrapper.vm.thresholdForm.similarityThreshold).toBe(0.7);
      expect(wrapper.vm.thresholdForm.shortTermLimit).toBe(100);
      expect(wrapper.vm.thresholdForm.longTermLimit).toBe(1000);
      
      expect(ElMessage.success).toHaveBeenCalledWith('已重置为默认设置');
    });

    it('sets loading state during threshold save', async () => {
      vi.useFakeTimers();
      
      const savePromise = wrapper.vm.saveThresholds();
      expect(wrapper.vm.thresholdLoading).toBe(true);
      
      await vi.advanceTimersByTimeAsync(100);
      await savePromise;
      expect(wrapper.vm.thresholdLoading).toBe(false);
      
      vi.useRealTimers();
    });
  });

  describe('Form Interactions', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('updates archive form memory ID', async () => {
      const input = wrapper.findAllComponents({ name: 'ElInput' })[0];
      await input.setValue('test-memory-id');
      
      expect(wrapper.vm.archiveForm.memoryId).toBe('test-memory-id');
    });

    it('updates archive form reason', async () => {
      const textarea = wrapper.findAllComponents({ name: 'ElInput' })[1];
      await textarea.setValue('Test archive reason');
      
      expect(wrapper.vm.archiveForm.reason).toBe('Test archive reason');
    });

    it('updates archive form retention period', async () => {
      const inputNumber = wrapper.findAllComponents({ name: 'ElInputNumber' })[0];
      await inputNumber.setValue(180);
      
      expect(wrapper.vm.archiveForm.retentionPeriod).toBe(180);
    });

    it('updates cleanup form days old', async () => {
      const inputNumber = wrapper.findAllComponents({ name: 'ElInputNumber' })[1];
      await inputNumber.setValue(60);
      
      expect(wrapper.vm.cleanupForm.daysOld).toBe(60);
    });

    it('updates cleanup form memory type', async () => {
      const select = wrapper.findAllComponents({ name: 'ElSelect' })[0];
      await select.setValue('short_term');
      
      expect(wrapper.vm.cleanupForm.memoryType).toBe('short_term');
    });

    it('updates cleanup form dry run mode', async () => {
      const switchComponent = wrapper.findComponent({ name: 'ElSwitch' });
      await switchComponent.setValue(false);
      
      expect(wrapper.vm.cleanupForm.dryRun).toBe(false);
    });

    it('updates threshold form importance threshold', async () => {
      const slider = wrapper.findAllComponents({ name: 'ElSlider' })[0];
      await slider.setValue(0.8);
      
      expect(wrapper.vm.thresholdForm.importanceThreshold).toBe(0.8);
    });

    it('updates threshold form similarity threshold', async () => {
      const slider = wrapper.findAllComponents({ name: 'ElSlider' })[1];
      await slider.setValue(0.9);
      
      expect(wrapper.vm.thresholdForm.similarityThreshold).toBe(0.9);
    });

    it('updates threshold form short term limit', async () => {
      const inputNumber = wrapper.findAllComponents({ name: 'ElInputNumber' })[2];
      await inputNumber.setValue(200);
      
      expect(wrapper.vm.thresholdForm.shortTermLimit).toBe(200);
    });

    it('updates threshold form long term limit', async () => {
      const inputNumber = wrapper.findAllComponents({ name: 'ElInputNumber' })[3];
      await inputNumber.setValue(2000);
      
      expect(wrapper.vm.thresholdForm.longTermLimit).toBe(2000);
    });
  });

  describe('Input Validation', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('respects min/max constraints for retention period', async () => {
      const inputNumber = wrapper.findAllComponents({ name: 'ElInputNumber' })[0];
      
      await inputNumber.setValue(0);
      expect(wrapper.vm.archiveForm.retentionPeriod).toBe(1); // Should clamp to min
      
      await inputNumber.setValue(4000);
      expect(wrapper.vm.archiveForm.retentionPeriod).toBe(3650); // Should clamp to max
    });

    it('respects min/max constraints for cleanup days', async () => {
      const inputNumber = wrapper.findAllComponents({ name: 'ElInputNumber' })[1];
      
      await inputNumber.setValue(0);
      expect(wrapper.vm.cleanupForm.daysOld).toBe(1); // Should clamp to min
      
      await inputNumber.setValue(400);
      expect(wrapper.vm.cleanupForm.daysOld).toBe(365); // Should clamp to max
    });

    it('respects min/max constraints for short term limit', async () => {
      const inputNumber = wrapper.findAllComponents({ name: 'ElInputNumber' })[2];
      
      await inputNumber.setValue(5);
      expect(wrapper.vm.thresholdForm.shortTermLimit).toBe(10); // Should clamp to min
      
      await inputNumber.setValue(1500);
      expect(wrapper.vm.thresholdForm.shortTermLimit).toBe(1000); // Should clamp to max
    });

    it('respects min/max constraints for long term limit', async () => {
      const inputNumber = wrapper.findAllComponents({ name: 'ElInputNumber' })[3];
      
      await inputNumber.setValue(50);
      expect(wrapper.vm.thresholdForm.longTermLimit).toBe(100); // Should clamp to min
      
      await inputNumber.setValue(15000);
      expect(wrapper.vm.thresholdForm.longTermLimit).toBe(10000); // Should clamp to max
    });

    it('respects min/max constraints for importance threshold', async () => {
      const slider = wrapper.findAllComponents({ name: 'ElSlider' })[0];
      
      await slider.setValue(-0.1);
      expect(wrapper.vm.thresholdForm.importanceThreshold).toBe(0); // Should clamp to min
      
      await slider.setValue(1.1);
      expect(wrapper.vm.thresholdForm.importanceThreshold).toBe(1); // Should clamp to max
    });

    it('respects min/max constraints for similarity threshold', async () => {
      const slider = wrapper.findAllComponents({ name: 'ElSlider' })[1];
      
      await slider.setValue(-0.1);
      expect(wrapper.vm.thresholdForm.similarityThreshold).toBe(0); // Should clamp to min
      
      await slider.setValue(1.1);
      expect(wrapper.vm.thresholdForm.similarityThreshold).toBe(1); // Should clamp to max
    });
  });

  describe('UI Elements', () => {
    beforeEach(() => {
      wrapper = createWrapper();
    });

    it('displays correct card headers', () => {
      const cards = wrapper.findAllComponents({ name: 'ElCard' });
      
      // Archive card
      expect(cards[0].find('.card-header').text()).toContain('记忆归档管理');
      
      // Cleanup card
      expect(cards[1].find('.card-header').text()).toContain('过期记忆清理');
      
      // Threshold card
      expect(cards[2].find('.card-header').text()).toContain('记忆阈值设置');
    });

    it('displays setting descriptions', () => {
      const descriptions = wrapper.findAll('.setting-description');
      
      expect(descriptions[0].text()).toContain('将重要的短期记忆归档为长期记忆');
      expect(descriptions[1].text()).toContain('清理过期的记忆以释放存储空间');
      expect(descriptions[2].text()).toContain('配置记忆管理的各种阈值参数');
    });

    it('displays form tips', () => {
      const tips = wrapper.findAll('.form-tip');
      
      expect(tips[0].text()).toBe('天（1-3650天）');
      expect(tips[1].text()).toBe('天前的记忆');
      expect(tips[2].text()).toBe('试运行模式不会实际删除数据');
    });

    it('displays correct button text based on cleanup mode', () => {
      const cleanupButton = wrapper.findAllComponents({ name: 'ElButton' })[3];
      expect(cleanupButton.text()).toContain('预览清理');
      
      wrapper.vm.cleanupForm.dryRun = false;
      expect(cleanupButton.text()).toContain('执行清理');
    });
  });

  describe('Props Validation', () => {
    it('accepts userId prop correctly', () => {
      wrapper = createWrapper({ userId: 123 });
      expect(wrapper.props().userId).toBe(123);
    });

    it('works with different userId values', () => {
      const testCases = [1, 999, 1000];
      
      testCases.forEach(userId => {
        const wrapper = createWrapper({ userId });
        expect(wrapper.props().userId).toBe(userId);
        wrapper.unmount();
      });
    });
  });
});