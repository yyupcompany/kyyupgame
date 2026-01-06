import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import MemorySettings from '@/components/ai/memory/MemorySettings.vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// Mock Element Plus
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus');
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn()
    }
  };
});

describe('MemorySettings', () => {
  let wrapper: any;
  const mockUserId = 1;

  const createWrapper = (props = {}) => {
    return mount(MemorySettings, {
      props: {
        userId: mockUserId,
        ...props
      },
      global: {
        stubs: {
          'el-card': true,
          'el-icon': true,
          'el-input': true,
          'el-input-number': true,
          'el-button': true,
          'el-form': true,
          'el-form-item': true,
          'el-select': true,
          'el-option': true,
          'el-switch': true,
          'el-slider': true,
          'el-date-picker': true,
          'el-row': true,
          'el-col': true
        }
      }
    });
  };

  beforeEach(async () => {
    wrapper = createWrapper();
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render correctly with default props', () => {
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('.memory-settings').exists()).toBe(true);
    });

    it('should render three setting cards', () => {
      const cards = wrapper.findAll('.setting-card');
      expect(cards.length).toBe(3);
    });

    it('should render memory archive card', () => {
      const archiveCard = wrapper.findAll('.setting-card')[0];
      expect(archiveCard.find('.card-header').text()).toContain('记忆归档管理');
    });

    it('should render cleanup card', () => {
      const cleanupCard = wrapper.findAll('.setting-card')[1];
      expect(cleanupCard.find('.card-header').text()).toContain('过期记忆清理');
    });

    it('should render threshold card', () => {
      const thresholdCard = wrapper.findAll('.setting-card')[2];
      expect(thresholdCard.find('.card-header').text()).toContain('记忆阈值设置');
    });

    it('should render card headers with icons', () => {
      const headers = wrapper.findAll('.card-header');
      headers.forEach(header => {
        expect(header.find('.el-icon').exists()).toBe(true);
      });
    });
  });

  describe('Memory Archive Settings', () => {
    it('should render archive form with correct fields', () => {
      const archiveCard = wrapper.findAll('.setting-card')[0];
      const form = archiveCard.find('el-form');
      
      expect(form.exists()).toBe(true);
      
      // Check form fields
      const memoryIdInput = archiveCard.find('el-input[placeholder="请输入要归档的记忆ID"]');
      const reasonTextarea = archiveCard.find('el-input[type="textarea"]');
      const retentionInput = archiveCard.find('el-input-number');
      const archiveButton = archiveCard.find('el-button[type="primary"]');
      
      expect(memoryIdInput.exists()).toBe(true);
      expect(reasonTextarea.exists()).toBe(true);
      expect(retentionInput.exists()).toBe(true);
      expect(archiveButton.exists()).toBe(true);
      expect(archiveButton.text()).toContain('归档记忆');
    });

    it('should update archive form data', async () => {
      const archiveCard = wrapper.findAll('.setting-card')[0];
      
      const memoryIdInput = archiveCard.find('el-input[placeholder="请输入要归档的记忆ID"]');
      await memoryIdInput.setValue('123');
      
      const reasonTextarea = archiveCard.find('el-input[type="textarea"]');
      await reasonTextarea.setValue('Test archive reason');
      
      const retentionInput = archiveCard.find('el-input-number');
      await retentionInput.setValue(180);
      
      expect(wrapper.vm.archiveForm.memoryId).toBe('123');
      expect(wrapper.vm.archiveForm.reason).toBe('Test archive reason');
      expect(wrapper.vm.archiveForm.retentionPeriod).toBe(180);
    });

    it('should validate memory ID before archiving', async () => {
      const archiveCard = wrapper.findAll('.setting-card')[0];
      const archiveButton = archiveCard.find('el-button[type="primary"]');
      
      await archiveButton.trigger('click');
      
      expect(ElMessage.warning).toHaveBeenCalledWith('请输入记忆ID');
      expect(wrapper.emitted('archive')).toBeFalsy();
    });

    it('should show confirmation dialog before archiving', async () => {
      wrapper.vm.archiveForm.memoryId = '123';
      (ElMessageBox.confirm as any).mockResolvedValue(true);
      
      const archiveCard = wrapper.findAll('.setting-card')[0];
      const archiveButton = archiveCard.find('el-button[type="primary"]');
      
      await archiveButton.trigger('click');
      
      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        '确定要将记忆 123 归档为长期记忆吗？',
        '确认归档',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      );
    });

    it('should emit archive event when confirmed', async () => {
      wrapper.vm.archiveForm.memoryId = '123';
      wrapper.vm.archiveForm.reason = 'Test reason';
      wrapper.vm.archiveForm.retentionPeriod = 180;
      (ElMessageBox.confirm as any).mockResolvedValue(true);
      
      const archiveCard = wrapper.findAll('.setting-card')[0];
      const archiveButton = archiveCard.find('el-button[type="primary"]');
      
      await archiveButton.trigger('click');
      
      expect(wrapper.emitted('archive')).toBeTruthy();
      expect(wrapper.emitted('archive')[0]).toEqual([
        '123',
        {
          reason: 'Test reason',
          retentionPeriod: 180
        }
      ]);
    });

    it('should reset archive form after successful archiving', async () => {
      wrapper.vm.archiveForm.memoryId = '123';
      wrapper.vm.archiveForm.reason = 'Test reason';
      wrapper.vm.archiveForm.retentionPeriod = 180;
      (ElMessageBox.confirm as any).mockResolvedValue(true);
      
      const archiveCard = wrapper.findAll('.setting-card')[0];
      const archiveButton = archiveCard.find('el-button[type="primary"]');
      
      await archiveButton.trigger('click');
      
      expect(wrapper.vm.archiveForm.memoryId).toBe('');
      expect(wrapper.vm.archiveForm.reason).toBe('');
      expect(wrapper.vm.archiveForm.retentionPeriod).toBe(365);
    });

    it('should cancel archive operation when user cancels', async () => {
      wrapper.vm.archiveForm.memoryId = '123';
      (ElMessageBox.confirm as any).mockRejectedValue('cancel');
      
      const archiveCard = wrapper.findAll('.setting-card')[0];
      const archiveButton = archiveCard.find('el-button[type="primary"]');
      
      await archiveButton.trigger('click');
      
      expect(wrapper.emitted('archive')).toBeFalsy();
      expect(wrapper.vm.archiveLoading).toBe(false);
    });
  });

  describe('Memory Cleanup Settings', () => {
    it('should render cleanup form with correct fields', () => {
      const cleanupCard = wrapper.findAll('.setting-card')[1];
      
      const daysOldInput = cleanupCard.find('el-input-number');
      const memoryTypeSelect = cleanupCard.find('el-select');
      const dryRunSwitch = cleanupCard.find('el-switch');
      const cleanupButton = cleanupCard.find('el-button[type="danger"]');
      
      expect(daysOldInput.exists()).toBe(true);
      expect(memoryTypeSelect.exists()).toBe(true);
      expect(dryRunSwitch.exists()).toBe(true);
      expect(cleanupButton.exists()).toBe(true);
    });

    it('should have default cleanup values', () => {
      expect(wrapper.vm.cleanupForm.daysOld).toBe(30);
      expect(wrapper.vm.cleanupForm.memoryType).toBe('');
      expect(wrapper.vm.cleanupForm.dryRun).toBe(true);
    });

    it('should update cleanup form data', async () => {
      const cleanupCard = wrapper.findAll('.setting-card')[1];
      
      const daysOldInput = cleanupCard.find('el-input-number');
      await daysOldInput.setValue(60);
      
      const memoryTypeSelect = cleanupCard.find('el-select');
      await memoryTypeSelect.setValue('short_term');
      
      const dryRunSwitch = cleanupCard.find('el-switch');
      await dryRunSwitch.setValue(false);
      
      expect(wrapper.vm.cleanupForm.daysOld).toBe(60);
      expect(wrapper.vm.cleanupForm.memoryType).toBe('short_term');
      expect(wrapper.vm.cleanupForm.dryRun).toBe(false);
    });

    it('should show confirmation dialog for cleanup', async () => {
      (ElMessageBox.confirm as any).mockResolvedValue(true);
      
      const cleanupCard = wrapper.findAll('.setting-card')[1];
      const cleanupButton = cleanupCard.find('el-button[type="danger"]');
      
      await cleanupButton.trigger('click');
      
      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        '确定要预览清理 30 天前的记忆吗？',
        '确认预览清理',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }
      );
    });

    it('should show different confirmation message for actual cleanup', async () => {
      wrapper.vm.cleanupForm.dryRun = false;
      (ElMessageBox.confirm as any).mockResolvedValue(true);
      
      const cleanupCard = wrapper.findAll('.setting-card')[1];
      const cleanupButton = cleanupCard.find('el-button[type="danger"]');
      
      await cleanupButton.trigger('click');
      
      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        '确定要清理 30 天前的记忆吗？此操作不可撤销！',
        '确认执行清理',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      );
    });

    it('should emit cleanup event when confirmed', async () => {
      wrapper.vm.cleanupForm.daysOld = 60;
      wrapper.vm.cleanupForm.memoryType = 'short_term';
      wrapper.vm.cleanupForm.dryRun = false;
      (ElMessageBox.confirm as any).mockResolvedValue(true);
      
      const cleanupCard = wrapper.findAll('.setting-card')[1];
      const cleanupButton = cleanupCard.find('el-button[type="danger"]');
      
      await cleanupButton.trigger('click');
      
      expect(wrapper.emitted('cleanup')).toBeTruthy();
      expect(wrapper.emitted('cleanup')[0]).toEqual([
        {
          daysOld: 60,
          memoryType: 'short_term',
          dryRun: false
        }
      ]);
    });

    it('should update button text based on dry run mode', async () => {
      const cleanupCard = wrapper.findAll('.setting-card')[1];
      const cleanupButton = cleanupCard.find('el-button[type="danger"]');
      
      // Dry run mode
      expect(cleanupButton.text()).toContain('预览清理');
      
      // Actual execution mode
      await wrapper.setData({ 'cleanupForm.dryRun': false });
      expect(cleanupButton.text()).toContain('执行清理');
    });

    it('should cancel cleanup operation when user cancels', async () => {
      (ElMessageBox.confirm as any).mockRejectedValue('cancel');
      
      const cleanupCard = wrapper.findAll('.setting-card')[1];
      const cleanupButton = cleanupCard.find('el-button[type="danger"]');
      
      await cleanupButton.trigger('click');
      
      expect(wrapper.emitted('cleanup')).toBeFalsy();
      expect(wrapper.vm.cleanupLoading).toBe(false);
    });
  });

  describe('Memory Threshold Settings', () => {
    it('should render threshold form with correct fields', () => {
      const thresholdCard = wrapper.findAll('.setting-card')[2];
      
      const importanceSlider = thresholdCard.find('.el-slider');
      const similaritySlider = thresholdCard.findAll('.el-slider')[1];
      const shortTermInput = thresholdCard.findAll('el-input-number')[0];
      const longTermInput = thresholdCard.findAll('el-input-number')[1];
      const saveButton = thresholdCard.find('el-button[type="primary"]');
      const resetButton = thresholdCard.find('el-button:not([type])');
      
      expect(importanceSlider.exists()).toBe(true);
      expect(similaritySlider.exists()).toBe(true);
      expect(shortTermInput.exists()).toBe(true);
      expect(longTermInput.exists()).toBe(true);
      expect(saveButton.exists()).toBe(true);
      expect(resetButton.exists()).toBe(true);
    });

    it('should have default threshold values', () => {
      expect(wrapper.vm.thresholdForm.importanceThreshold).toBe(0.5);
      expect(wrapper.vm.thresholdForm.similarityThreshold).toBe(0.7);
      expect(wrapper.vm.thresholdForm.shortTermLimit).toBe(100);
      expect(wrapper.vm.thresholdForm.longTermLimit).toBe(1000);
    });

    it('should update threshold form data', async () => {
      const thresholdCard = wrapper.findAll('.setting-card')[2];
      
      const importanceSlider = thresholdCard.find('.el-slider');
      await importanceSlider.setValue(0.8);
      
      const similaritySlider = thresholdCard.findAll('.el-slider')[1];
      await similaritySlider.setValue(0.9);
      
      const shortTermInput = thresholdCard.findAll('el-input-number')[0];
      await shortTermInput.setValue(200);
      
      const longTermInput = thresholdCard.findAll('el-input-number')[1];
      await longTermInput.setValue(2000);
      
      expect(wrapper.vm.thresholdForm.importanceThreshold).toBe(0.8);
      expect(wrapper.vm.thresholdForm.similarityThreshold).toBe(0.9);
      expect(wrapper.vm.thresholdForm.shortTermLimit).toBe(200);
      expect(wrapper.vm.thresholdForm.longTermLimit).toBe(2000);
    });

    it('should validate slider ranges', async () => {
      const thresholdCard = wrapper.findAll('.setting-card')[2];
      
      const importanceSlider = thresholdCard.find('.el-slider');
      expect(importanceSlider.props('min')).toBe(0);
      expect(importanceSlider.props('max')).toBe(1);
      expect(importanceSlider.props('step')).toBe(0.1);
      
      const similaritySlider = thresholdCard.findAll('.el-slider')[1];
      expect(similaritySlider.props('min')).toBe(0);
      expect(similaritySlider.props('max')).toBe(1);
      expect(similaritySlider.props('step')).toBe(0.1);
    });

    it('should validate input number ranges', async () => {
      const thresholdCard = wrapper.findAll('.setting-card')[2];
      
      const shortTermInput = thresholdCard.findAll('el-input-number')[0];
      expect(shortTermInput.props('min')).toBe(10);
      expect(shortTermInput.props('max')).toBe(1000);
      
      const longTermInput = thresholdCard.findAll('el-input-number')[1];
      expect(longTermInput.props('min')).toBe(100);
      expect(longTermInput.props('max')).toBe(10000);
    });

    it('should reset threshold settings to defaults', async () => {
      // Change values first
      wrapper.vm.thresholdForm.importanceThreshold = 0.8;
      wrapper.vm.thresholdForm.similarityThreshold = 0.9;
      wrapper.vm.thresholdForm.shortTermLimit = 200;
      wrapper.vm.thresholdForm.longTermLimit = 2000;
      
      const thresholdCard = wrapper.findAll('.setting-card')[2];
      const resetButton = thresholdCard.find('el-button:not([type])');
      
      await resetButton.trigger('click');
      
      expect(wrapper.vm.thresholdForm.importanceThreshold).toBe(0.5);
      expect(wrapper.vm.thresholdForm.similarityThreshold).toBe(0.7);
      expect(wrapper.vm.thresholdForm.shortTermLimit).toBe(100);
      expect(wrapper.vm.thresholdForm.longTermLimit).toBe(1000);
      
      expect(ElMessage.success).toHaveBeenCalledWith('已重置为默认设置');
    });
  });

  describe('Loading States', () => {
    it('should show loading state during archive operation', async () => {
      wrapper.vm.archiveForm.memoryId = '123';
      (ElMessageBox.confirm as any).mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve(true), 100);
        });
      });
      
      const archiveCard = wrapper.findAll('.setting-card')[0];
      const archiveButton = archiveCard.find('el-button[type="primary"]');
      
      archiveButton.trigger('click');
      
      expect(wrapper.vm.archiveLoading).toBe(true);
    });

    it('should show loading state during cleanup operation', async () => {
      (ElMessageBox.confirm as any).mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve(true), 100);
        });
      });
      
      const cleanupCard = wrapper.findAll('.setting-card')[1];
      const cleanupButton = cleanupCard.find('el-button[type="danger"]');
      
      cleanupButton.trigger('click');
      
      expect(wrapper.vm.cleanupLoading).toBe(true);
    });

    it('should show loading state during threshold save', async () => {
      // Mock API call
      wrapper.vm.saveThresholds = vi.fn().mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve(), 100);
        });
      });
      
      const thresholdCard = wrapper.findAll('.setting-card')[2];
      const saveButton = thresholdCard.find('el-button[type="primary"]');
      
      await saveButton.trigger('click');
      
      expect(wrapper.vm.thresholdLoading).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle archive API errors', async () => {
      wrapper.vm.archiveForm.memoryId = '123';
      (ElMessageBox.confirm as any).mockResolvedValue(true);
      
      // Mock API error
      wrapper.vm.$emit = vi.fn().mockImplementation((event, ...args) => {
        if (event === 'archive') {
          throw new Error('Archive API failed');
        }
      });
      
      const archiveCard = wrapper.findAll('.setting-card')[0];
      const archiveButton = archiveCard.find('el-button[type="primary"]');
      
      await archiveButton.trigger('click');
      
      expect(ElMessage.error).not.toHaveBeenCalled(); // Error is handled by parent component
    });

    it('should handle cleanup API errors', async () => {
      (ElMessageBox.confirm as any).mockResolvedValue(true);
      
      // Mock API error
      wrapper.vm.$emit = vi.fn().mockImplementation((event, ...args) => {
        if (event === 'cleanup') {
          throw new Error('Cleanup API failed');
        }
      });
      
      const cleanupCard = wrapper.findAll('.setting-card')[1];
      const cleanupButton = cleanupCard.find('el-button[type="danger"]');
      
      await cleanupButton.trigger('click');
      
      expect(ElMessage.error).not.toHaveBeenCalled(); // Error is handled by parent component
    });

    it('should handle threshold save errors', async () => {
      // Mock API error
      wrapper.vm.saveThresholds = vi.fn().mockRejectedValue(new Error('Save failed'));
      
      const thresholdCard = wrapper.findAll('.setting-card')[2];
      const saveButton = thresholdCard.find('el-button[type="primary"]');
      
      await saveButton.trigger('click');
      
      expect(ElMessage.error).toHaveBeenCalledWith('设置保存失败');
    });
  });

  describe('Form Validation', () => {
    it('should validate memory ID is not empty', async () => {
      const archiveCard = wrapper.findAll('.setting-card')[0];
      const archiveButton = archiveCard.find('el-button[type="primary"]');
      
      await archiveButton.trigger('click');
      
      expect(ElMessage.warning).toHaveBeenCalledWith('请输入记忆ID');
    });

    it('should validate memory ID is trimmed', async () => {
      wrapper.vm.archiveForm.memoryId = '   ';
      (ElMessageBox.confirm as any).mockResolvedValue(true);
      
      const archiveCard = wrapper.findAll('.setting-card')[0];
      const archiveButton = archiveCard.find('el-button[type="primary"]');
      
      await archiveButton.trigger('click');
      
      expect(ElMessage.warning).toHaveBeenCalledWith('请输入记忆ID');
    });

    it('should validate retention period range', async () => {
      const thresholdCard = wrapper.findAll('.setting-card')[2];
      const shortTermInput = thresholdCard.findAll('el-input-number')[0];
      
      // Test minimum value
      await shortTermInput.setValue(5); // Below minimum
      expect(shortTermInput.props('min')).toBe(10);
      
      // Test maximum value
      await shortTermInput.setValue(1500); // Above maximum
      expect(shortTermInput.props('max')).toBe(1000);
    });
  });

  describe('Props Handling', () => {
    it('should accept userId prop', () => {
      expect(wrapper.props('userId')).toBe(mockUserId);
    });

    it('should handle userId changes', async () => {
      await wrapper.setProps({ userId: 2 });
      
      expect(wrapper.props('userId')).toBe(2);
      // Component should update internal references if needed
    });
  });

  describe('Styling and Layout', () => {
    it('should have proper CSS classes', () => {
      expect(wrapper.find('.memory-settings').classes()).toContain('memory-settings');
      
      const cards = wrapper.findAll('.setting-card');
      cards.forEach(card => {
        expect(card.classes()).toContain('setting-card');
      });
    });

    it('should have proper form styling', () => {
      const forms = wrapper.findAll('el-form');
      forms.forEach(form => {
        expect(form.classes()).toBeDefined();
      });
    });

    it('should have proper button styling', () => {
      const buttons = wrapper.findAll('el-button');
      buttons.forEach(button => {
        expect(button.classes()).toBeDefined();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const buttons = wrapper.findAll('el-button');
      buttons.forEach(button => {
        expect(button.attributes('aria-label')).toBeDefined();
      });
    });

    it('should have proper form labels', () => {
      const formItems = wrapper.findAll('el-form-item');
      formItems.forEach(item => {
        expect(item.attributes('label')).toBeDefined();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large retention period values', async () => {
      const archiveCard = wrapper.findAll('.setting-card')[0];
      const retentionInput = archiveCard.find('el-input-number');
      
      await retentionInput.setValue(9999);
      expect(wrapper.vm.archiveForm.retentionPeriod).toBe(9999);
    });

    it('should handle very small retention period values', async () => {
      const archiveCard = wrapper.findAll('.setting-card')[0];
      const retentionInput = archiveCard.find('el-input-number');
      
      await retentionInput.setValue(1);
      expect(wrapper.vm.archiveForm.retentionPeriod).toBe(1);
    });

    it('should handle empty memory type in cleanup', async () => {
      wrapper.vm.cleanupForm.memoryType = '';
      (ElMessageBox.confirm as any).mockResolvedValue(true);
      
      const cleanupCard = wrapper.findAll('.setting-card')[1];
      const cleanupButton = cleanupCard.find('el-button[type="danger"]');
      
      await cleanupButton.trigger('click');
      
      expect(wrapper.emitted('cleanup')[0][0].memoryType).toBeUndefined();
    });

    it('should handle threshold values at boundaries', async () => {
      const thresholdCard = wrapper.findAll('.setting-card')[2];
      
      const importanceSlider = thresholdCard.find('.el-slider');
      await importanceSlider.setValue(0); // Minimum
      
      const similaritySlider = thresholdCard.findAll('.el-slider')[1];
      await similaritySlider.setValue(1); // Maximum
      
      expect(wrapper.vm.thresholdForm.importanceThreshold).toBe(0);
      expect(wrapper.vm.thresholdForm.similarityThreshold).toBe(1);
    });
  });

  describe('Performance', () => {
    it('should handle rapid form updates without errors', async () => {
      const thresholdCard = wrapper.findAll('.setting-card')[2];
      const importanceSlider = thresholdCard.find('.el-slider');
      
      for (let i = 0; i < 10; i++) {
        await importanceSlider.setValue(i * 0.1);
      }
      
      expect(wrapper.vm.thresholdForm.importanceThreshold).toBe(0.9);
    });
  });
});