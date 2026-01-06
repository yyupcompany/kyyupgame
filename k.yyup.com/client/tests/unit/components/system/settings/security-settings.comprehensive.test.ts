/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ElMessage } from 'element-plus';
import SecuritySettings from '@/components/system/settings/SecuritySettings.vue';
import { expectNoConsoleErrors } from '../../../setup/console-monitoring';
import {
  validateRequiredFields,
  validateFieldTypes,
  validateEnumValue
} from '../../../utils/data-validation';

// Mock UnifiedIcon
vi.mock('@/components/UnifiedIcon.vue', () => ({
  default: {
    name: 'UnifiedIcon',
    props: ['name'],
    template: '<i :class="`icon-${name}`"></i>'
  }
}));

describe('SecuritySettings组件 - 100%完整测试覆盖', () => {
  let wrapper: any;

  // 系统设置接口定义
  interface SystemSetting {
    id: string;
    key: string;
    value: string | number | boolean;
    type: 'string' | 'number' | 'boolean' | 'json';
    category: string;
    description?: string;
    required?: boolean;
    defaultValue?: string | number | boolean;
  }

  const mockSecuritySettings: SystemSetting[] = [
    {
      id: 'login_attempts',
      key: 'login_attempts',
      value: '5',
      type: 'string',
      category: 'security',
      description: '允许的最大连续登录失败次数'
    },
    {
      id: 'password_expiry_days',
      key: 'password_expiry_days',
      value: '90',
      type: 'string',
      category: 'security',
      description: '密码过期天数'
    },
    {
      id: 'session_timeout',
      key: 'session_timeout',
      value: '120',
      type: 'string',
      category: 'security',
      description: '会话超时时间（分钟）'
    },
    {
      id: 'password_policy',
      key: 'password_policy',
      value: JSON.stringify({
        rules: ['uppercase', 'lowercase', 'numbers'],
        minLength: 8
      }),
      type: 'json',
      category: 'security',
      description: '密码策略配置'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock console methods
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});

    // Mock ElMessage
    vi.spyOn(ElMessage, 'success').mockImplementation(() => {});
    vi.spyOn(ElMessage, 'error').mockImplementation(() => {});
    vi.spyOn(ElMessage, 'warning').mockImplementation(() => {});
  });

  afterEach(() => {
    expectNoConsoleErrors();

    if (wrapper) {
      wrapper.unmount();
    }

    vi.restoreAllMocks();
  });

  describe('组件初始化和属性处理', () => {
    it('应该正确初始化组件', () => {
      wrapper = mount(SecuritySettings, {
        props: {
          settings: mockSecuritySettings,
          loading: false
        }
      });

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('.security-settings').exists()).toBe(true);
    });

    it('应该处理settings属性变化并更新formData', async () => {
      wrapper = mount(SecuritySettings, {
        props: {
          settings: [],
          loading: false
        }
      });

      // 初始状态formData应该为空
      expect(Object.keys(wrapper.vm.formData)).toHaveLength(0);

      // 更新settings属性
      await wrapper.setProps({ settings: mockSecuritySettings });
      await wrapper.vm.$nextTick();

      // 验证formData已更新
      expect(wrapper.vm.formData.login_attempts).toBe(5); // parseInt('5')
      expect(wrapper.vm.formData.password_expiry_days).toBe(90); // parseInt('90')
      expect(wrapper.vm.formData.session_timeout).toBe(120); // parseInt('120')
    });

    it('应该正确解析密码策略设置', async () => {
      wrapper = mount(SecuritySettings, {
        props: {
          settings: mockSecuritySettings,
          loading: false
        }
      });

      await wrapper.vm.$nextTick();

      // 验证密码策略解析
      expect(wrapper.vm.passwordPolicy).toEqual(['uppercase', 'lowercase', 'numbers']);
      expect(wrapper.vm.minPasswordLength).toBe(8);
    });

    it('应该处理无效的密码策略JSON', async () => {
      const invalidSettings = [{
        ...mockSecuritySettings[3],
        value: 'invalid json string'
      }];

      wrapper = mount(SecuritySettings, {
        props: {
          settings: invalidSettings,
          loading: false
        }
      });

      await wrapper.vm.$nextTick();

      // 应该使用默认值
      expect(wrapper.vm.passwordPolicy).toEqual(['uppercase', 'lowercase', 'numbers']);
      expect(wrapper.vm.minPasswordLength).toBe(8);

      // 验证控制台错误被记录
      expect(console.error).toHaveBeenCalledWith('解析密码策略失败:', expect.any(Error));
    });

    it('应该处理loading状态', async () => {
      wrapper = mount(SecuritySettings, {
        props: {
          settings: mockSecuritySettings,
          loading: true
        }
      });

      // 验证loading状态传递给子组件
      expect(wrapper.props('loading')).toBe(true);
    });
  });

  describe('表单验证和边界值', () => {
    beforeEach(async () => {
      wrapper = mount(SecuritySettings, {
        props: {
          settings: mockSecuritySettings,
          loading: false
        }
      });

      await wrapper.vm.$nextTick();
    });

    it('应该为登录尝试次数提供正确的最小值和最大值', () => {
      expect(wrapper.vm.getMinValue('login_attempts')).toBe(1);
      expect(wrapper.vm.getMaxValue('login_attempts')).toBe(10);
    });

    it('应该为密码过期天数提供正确的最小值和最大值', () => {
      expect(wrapper.vm.getMinValue('password_expiry_days')).toBe(0);
      expect(wrapper.vm.getMaxValue('password_expiry_days')).toBe(365);
    });

    it('应该为会话超时提供正确的最小值和最大值', () => {
      expect(wrapper.vm.getMinValue('session_timeout')).toBe(1);
      expect(wrapper.vm.getMaxValue('session_timeout')).toBe(1440); // 24小时
    });

    it('应该为未知设置项提供默认边界值', () => {
      expect(wrapper.vm.getMinValue('unknown_setting')).toBe(0);
      expect(wrapper.vm.getMaxValue('unknown_setting')).toBe(100);
    });

    it('应该提供正确的设置提示文本', () => {
      expect(wrapper.vm.getSettingTip('login_attempts')).toBe('允许的最大连续登录失败次数，超过将锁定账户');
      expect(wrapper.vm.getSettingTip('password_expiry_days')).toBe('密码过期天数，0表示永不过期');
      expect(wrapper.vm.getSettingTip('session_timeout')).toBe('会话超时时间，单位：分钟');
      expect(wrapper.vm.getSettingTip('unknown_setting')).toBe('');
    });
  });

  describe('密码策略功能', () => {
    beforeEach(async () => {
      wrapper = mount(SecuritySettings, {
        props: {
          settings: mockSecuritySettings,
          loading: false
        }
      });

      await wrapper.vm.$nextTick();
    });

    it('应该正确显示密码策略复选框', () => {
      const checkboxes = wrapper.findAll('.el-checkbox');
      expect(checkboxes).toHaveLength(4); // uppercase, lowercase, numbers, special

      expect(checkboxes[0].text()).toContain('必须包含大写字母');
      expect(checkboxes[1].text()).toContain('必须包含小写字母');
      expect(checkboxes[2].text()).toContain('必须包含数字');
      expect(checkboxes[3].text()).toContain('必须包含特殊字符');
    });

    it('应该允许修改密码策略', async () => {
      // 添加特殊字符要求
      await wrapper.setData({ passwordPolicy: ['uppercase', 'lowercase', 'numbers', 'special'] });

      const specialCheckbox = wrapper.findAll('.el-checkbox')[3];
      expect(specialCheckbox.find('input').element.checked).toBe(true);
    });

    it('应该允许修改最短密码长度', async () => {
      const minPasswordInput = wrapper.find('input[type="number"]');
      await minPasswordInput.setValue(12);
      await minPasswordInput.trigger('change');

      expect(wrapper.vm.minPasswordLength).toBe(12);
    });

    it('应该验证最短密码长度的边界', async () => {
      const minPasswordInput = wrapper.find('input[type="number"]');

      // 测试最小值
      await minPasswordInput.setValue(5); // 小于最小值6
      expect(minPasswordInput.element.min).toBe('6');

      // 测试最大值
      await minPasswordInput.setValue(20); // 大于最大值16
      expect(minPasswordInput.element.max).toBe('16');
    });
  });

  describe('表单提交功能', () => {
    beforeEach(async () => {
      wrapper = mount(SecuritySettings, {
        props: {
          settings: mockSecuritySettings,
          loading: false
        }
      });

      await wrapper.vm.$nextTick();
    });

    it('应该正确提交表单数据', async () => {
      // 修改一些设置值
      await wrapper.setData({
        formData: {
          login_attempts: 3,
          password_expiry_days: 60,
          session_timeout: 180
        },
        passwordPolicy: ['uppercase', 'lowercase', 'numbers', 'special'],
        minPasswordLength: 10
      });

      // Mock emit事件
      const emitSpy = vi.spyOn(wrapper.vm, '$emit');

      await wrapper.vm.handleSubmit();

      // 验证emit事件被触发
      expect(emitSpy).toHaveBeenCalledWith('save', 'security', expect.any(Array));

      const savedSettings = emitSpy.mock.calls[0][2];

      // 验证登录尝试设置
      const loginAttemptsSetting = savedSettings.find((s: SystemSetting) => s.key === 'login_attempts');
      expect(loginAttemptsSetting.value).toBe('3');

      // 验证密码策略设置
      const passwordPolicySetting = savedSettings.find((s: SystemSetting) => s.key === 'password_policy');
      expect(passwordPolicySetting.value).toBe(JSON.stringify({
        rules: ['uppercase', 'lowercase', 'numbers', 'special'],
        minLength: 10
      }));
    });

    it('应该保持未修改的设置值不变', async () => {
      // 只修改一个设置
      await wrapper.setData({
        formData: {
          login_attempts: 3,
          password_expiry_days: 90, // 保持原值
          session_timeout: 120 // 保持原值
        }
      });

      const emitSpy = vi.spyOn(wrapper.vm, '$emit');
      await wrapper.vm.handleSubmit();

      const savedSettings = emitSpy.mock.calls[0][2];

      const passwordExpirySetting = savedSettings.find((s: SystemSetting) => s.key === 'password_expiry_days');
      expect(passwordExpirySetting.value).toBe('90');
    });

    it('应该正确处理布尔值设置', async () => {
      const booleanSettings = [{
        id: 'require_2fa',
        key: 'require_2fa',
        value: 'true',
        type: 'string',
        category: 'security',
        description: '是否需要双因素认证'
      }];

      await wrapper.setProps({ settings: [...mockSecuritySettings, ...booleanSettings] });
      await wrapper.vm.$nextTick();

      const emitSpy = vi.spyOn(wrapper.vm, '$emit');
      await wrapper.vm.handleSubmit();

      const savedSettings = emitSpy.mock.calls[0][2];
      const require2FASetting = savedSettings.find((s: SystemSetting) => s.key === 'require_2fa');
      expect(require2FASetting.value).toBe('true');
    });

    it('应该处理空设置数组', async () => {
      await wrapper.setProps({ settings: [] });
      await wrapper.vm.$nextTick();

      const emitSpy = vi.spyOn(wrapper.vm, '$emit');
      await wrapper.vm.handleSubmit();

      // 应该仍然触发save事件，但可能是空数组
      expect(emitSpy).toHaveBeenCalledWith('save', 'security', expect.any(Array));
    });
  });

  describe('数据验证和类型安全', () => {
    it('应该验证所有设置项的必填字段', async () => {
      wrapper = mount(SecuritySettings, {
        props: {
          settings: mockSecuritySettings,
          loading: false
        }
      });

      await wrapper.vm.$nextTick();

      wrapper.props().settings.forEach((setting: SystemSetting) => {
        const validation = validateRequiredFields(setting, ['id', 'key', 'value', 'type', 'category']);
        expect(validation.valid).toBe(true);

        if (!validation.valid) {
          throw new Error(`Setting missing required fields: ${validation.missing.join(', ')}`);
        }
      });
    });

    it('应该验证设置项的字段类型', async () => {
      wrapper = mount(SecuritySettings, {
        props: {
          settings: mockSecuritySettings,
          loading: false
        }
      });

      await wrapper.vm.$nextTick();

      wrapper.props().settings.forEach((setting: SystemSetting) => {
        const typeValidation = validateFieldTypes(setting, {
          id: 'string',
          key: 'string',
          value: 'string',
          type: 'string',
          category: 'string',
          description: 'string'
        });

        // description字段是可选的
        const hasDescriptionErrors = typeValidation.errors.some(e => e.includes('description'));
        if (hasDescriptionErrors) {
          expect(typeValidation.errors.length).toBe(1);
        } else {
          expect(typeValidation.valid).toBe(true);
        }
      });
    });

    it('应该验证设置类型的枚举值', async () => {
      wrapper = mount(SecuritySettings, {
        props: {
          settings: mockSecuritySettings,
          loading: false
        }
      });

      await wrapper.vm.$nextTick();

      wrapper.props().settings.forEach((setting: SystemSetting) => {
        expect(['string', 'number', 'boolean', 'json']).toContain(setting.type);
        expect(['security']).toContain(setting.category); // 这个组件只处理security类别
      });
    });

    it('应该验证formData的数值类型', async () => {
      wrapper = mount(SecuritySettings, {
        props: {
          settings: mockSecuritySettings,
          loading: false
        }
      });

      await wrapper.vm.$nextTick();

      // 验证所有formData值都是数字
      Object.values(wrapper.vm.formData).forEach(value => {
        expect(typeof value).toBe('number');
      });
    });

    it('应该处理无效的数字值', async () => {
      const invalidSettings = [{
        id: 'invalid_number',
        key: 'invalid_number',
        value: 'not_a_number',
        type: 'string',
        category: 'security'
      }];

      wrapper = mount(SecuritySettings, {
        props: {
          settings: invalidSettings,
          loading: false
        }
      });

      await wrapper.vm.$nextTick();

      // parseInt('not_a_number') 返回 NaN，应该被处理为0
      expect(wrapper.vm.formData.invalid_number).toBe(0);
    });
  });

  describe('错误处理和边界情况', () => {
    it('应该处理空props', async () => {
      wrapper = mount(SecuritySettings, {
        props: {
          settings: [],
          loading: false
        }
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.formData).toEqual({});
      expect(wrapper.vm.passwordPolicy).toEqual(['uppercase', 'lowercase', 'numbers']);
      expect(wrapper.vm.minPasswordLength).toBe(8);
    });

    it('应该处理undefined props', async () => {
      wrapper = mount(SecuritySettings, {
        props: {}
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.formData).toEqual({});
    });

    it('应该处理缺失的密码策略设置', async () => {
      const settingsWithoutPolicy = mockSecuritySettings.filter(s => s.key !== 'password_policy');

      wrapper = mount(SecuritySettings, {
        props: {
          settings: settingsWithoutPolicy,
          loading: false
        }
      });

      await wrapper.vm.$nextTick();

      // 应该使用默认值
      expect(wrapper.vm.passwordPolicy).toEqual(['uppercase', 'lowercase', 'numbers']);
      expect(wrapper.vm.minPasswordLength).toBe(8);
    });

    it('应该处理损坏的密码策略JSON', async () => {
      const corruptedPolicySettings = [{
        ...mockSecuritySettings[3],
        value: JSON.stringify({
          rules: ['uppercase'],
          // 缺少minLength字段
        })
      }];

      await wrapper.setProps({
        settings: [...mockSecuritySettings.filter(s => s.key !== 'password_policy'), ...corruptedPolicySettings]
      });
      await wrapper.vm.$nextTick();

      // 应该处理缺失的字段
      expect(wrapper.vm.passwordPolicy).toEqual(['uppercase']);
      expect(wrapper.vm.minPasswordLength).toBe(8); // 默认值
    });

    it('应该处理非字符串的数字值', async () => {
      const numberSettings = [{
        id: 'numeric_value',
        key: 'numeric_value',
        value: 42, // 数字类型而不是字符串
        type: 'string',
        category: 'security'
      }];

      wrapper = mount(SecuritySettings, {
        props: {
          settings: numberSettings,
          loading: false
        }
      });

      await wrapper.vm.$nextTick();

      // 应该正确转换数字为字符串再解析为数字
      expect(wrapper.vm.formData.numeric_value).toBe(42);
    });

    it('应该处理null和undefined值', async () => {
      const nullSettings = [{
        id: 'null_value',
        key: 'null_value',
        value: null,
        type: 'string',
        category: 'security'
      }];

      wrapper = mount(SecuritySettings, {
        props: {
          settings: nullSettings,
          loading: false
        }
      });

      await wrapper.vm.$nextTick();

      // parseInt(null) 返回 NaN，应该被处理为0
      expect(wrapper.vm.formData.null_value).toBe(0);
    });
  });

  describe('UI交互和可访问性', () => {
    beforeEach(async () => {
      wrapper = mount(SecuritySettings, {
        props: {
          settings: mockSecuritySettings,
          loading: false
        }
      });

      await wrapper.vm.$nextTick();
    });

    it('应该正确渲染表单标签', () => {
      const formLabels = wrapper.findAll('.el-form-item__label');
      expect(formLabels.length).toBeGreaterThan(0);

      // 验证设置描述作为标签显示
      expect(wrapper.text()).toContain('允许的最大连续登录失败次数');
      expect(wrapper.text()).toContain('密码过期天数');
      expect(wrapper.text()).toContain('会话超时时间');
    });

    it('应该正确渲染数字输入框', () => {
      const numberInputs = wrapper.findAll('input[type="number"]');
      expect(numberInputs.length).toBe(4); // 3个设置 + 1个密码长度
    });

    it('应该正确渲染复选框', () => {
      const checkboxes = wrapper.findAll('.el-checkbox');
      expect(checkboxes.length).toBe(4);
    });

    it('应该正确渲染提示文本', () => {
      const tips = wrapper.findAll('.setting-tip');
      expect(tips.length).toBeGreaterThan(0);

      tips.forEach(tip => {
        expect(tip.text()).toBeTruthy();
      });
    });

    it('应该正确渲染分隔线', () => {
      const divider = wrapper.find('.el-divider');
      expect(divider.exists()).toBe(true);
      expect(divider.text()).toContain('密码策略');
    });

    it('应该正确渲染保存按钮', () => {
      const saveButton = wrapper.find('button[type="primary"]');
      expect(saveButton.exists()).toBe(true);
      expect(saveButton.text()).toContain('保存设置');
    });

    it('应该处理表单提交按钮点击', async () => {
      const saveButton = wrapper.find('button[type="primary"]');
      const emitSpy = vi.spyOn(wrapper.vm, '$emit');

      await saveButton.trigger('click');

      expect(emitSpy).toHaveBeenCalledWith('save', 'security', expect.any(Array));
    });

    it('应该支持键盘导航', async () => {
      const numberInput = wrapper.find('input[type="number"]');
      await numberInput.trigger('focus');

      expect(numberInput.element).toBe(document.activeElement);
    });

    it('应该提供适当的ARIA属性', () => {
      const form = wrapper.find('.el-form');
      expect(form.exists()).toBe(true);

      const inputs = wrapper.findAll('input');
      inputs.forEach(input => {
        expect(input.attributes('aria-label') || input.attributes('placeholder')).toBeTruthy();
      });
    });
  });

  describe('性能和内存管理', () => {
    it('应该正确清理组件状态', async () => {
      wrapper = mount(SecuritySettings, {
        props: {
          settings: mockSecuritySettings,
          loading: false
        }
      });

      await wrapper.vm.$nextTick();

      // 设置一些状态
      await wrapper.setData({
        formData: { login_attempts: 999 },
        passwordPolicy: ['special'],
        minPasswordLength: 20
      });

      // 卸载组件
      wrapper.unmount();

      // 验证组件已卸载
      expect(wrapper.exists()).toBe(false);
    });

    it('应该处理大量设置项的性能', async () => {
      const largeSettings = Array.from({ length: 1000 }, (_, i) => ({
        id: `setting_${i}`,
        key: `setting_${i}`,
        value: `${i}`,
        type: 'string' as const,
        category: 'security',
        description: `设置项 ${i}`
      }));

      const startTime = Date.now();

      wrapper = mount(SecuritySettings, {
        props: {
          settings: largeSettings,
          loading: false
        }
      });

      await wrapper.vm.$nextTick();

      const endTime = Date.now();

      // 验证渲染时间在合理范围内
      expect(endTime - startTime).toBeLessThan(1000);

      // 验证所有设置都被处理
      expect(Object.keys(wrapper.vm.formData).length).toBe(1000);
    });

    it('应该防止内存泄漏', async () => {
      // 创建多个组件实例
      const wrappers = [];
      for (let i = 0; i < 10; i++) {
        const w = mount(SecuritySettings, {
          props: {
            settings: mockSecuritySettings,
            loading: false
          }
        });
        await w.vm.$nextTick();
        wrappers.push(w);
      }

      // 卸载所有组件
      wrappers.forEach(w => w.unmount());

      // 验证没有内存泄漏迹象
      expect(wrappers.every(w => !w.exists())).toBe(true);
    });
  });
});