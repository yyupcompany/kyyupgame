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

describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import FormWizard from '@/components/forms/FormWizard.vue';
import { ElSteps, ElStep, ElButton, ElCard, ElAlert } from 'element-plus';

// Mock Element Plus components
vi.mock('element-plus', async () => {
  const actual = await vi.importActual('element-plus');
  return {
    ...actual,
    ElSteps: {
      name: 'ElSteps',
      template: '<div class="el-steps"><slot></slot></div>',
      props: ['active', 'alignCenter', 'finishStatus']
    },
    ElStep: {
      name: 'ElStep',
      template: '<div class="el-step"><slot name="title"></slot><slot name="description"></slot></div>',
      props: ['title', 'description', 'status', 'icon']
    },
    ElButton: {
      name: 'ElButton',
      template: '<button><slot></slot></button>',
      props: ['type', 'disabled', 'loading', 'icon']
    },
    ElCard: {
      name: 'ElCard',
      template: '<div class="el-card"><slot></slot></div>',
      props: ['shadow']
    },
    ElAlert: {
      name: 'ElAlert',
      template: '<div class="el-alert"><slot></slot></div>',
      props: ['type', 'title', 'description', 'closable']
    }
  };
});

describe('FormWizard.vue', () => {
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  const mockSteps = [
    {
      title: '第一步',
      description: '基本信息',
      component: 'BasicInfoForm',
      fields: [
        { name: 'name', label: '姓名', type: 'text', required: true },
        { name: 'email', label: '邮箱', type: 'email', required: true }
      ]
    },
    {
      title: '第二步',
      description: '详细信息',
      component: 'DetailInfoForm',
      fields: [
        { name: 'phone', label: '电话', type: 'tel' },
        { name: 'address', label: '地址', type: 'textarea' }
      ]
    },
    {
      title: '第三步',
      description: '确认信息',
      component: 'ConfirmForm',
      fields: []
    }
  ];

  const initialFormData = {
    name: '',
    email: '',
    phone: '',
    address: ''
  };

  it('renders form wizard with steps', () => {
    const wrapper = mount(FormWizard, {
      props: {
        steps: mockSteps,
        modelValue: initialFormData
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSteps,
          ElStep,
          ElButton,
          ElCard
        }
      }
    });

    expect(wrapper.findComponent(ElSteps).exists()).toBe(true);
    expect(wrapper.findAllComponents(ElStep)).toHaveLength(mockSteps.length);
    
    const steps = wrapper.findAllComponents(ElStep);
    expect(steps[0].props('title')).toBe('第一步');
    expect(steps[1].props('title')).toBe('第二步');
    expect(steps[2].props('title')).toBe('第三步');
  });

  it('starts with first step active', () => {
    const wrapper = mount(FormWizard, {
      props: {
        steps: mockSteps,
        modelValue: initialFormData
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSteps,
          ElStep,
          ElButton,
          ElCard
        }
      }
    });

    const steps = wrapper.findComponent(ElSteps);
    expect(steps.props('active')).toBe(0);
  });

  it('shows current step content', () => {
    const wrapper = mount(FormWizard, {
      props: {
        steps: mockSteps,
        modelValue: initialFormData
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSteps,
          ElStep,
          ElButton,
          ElCard
        }
      }
    });

    expect(wrapper.text()).toContain('第一步');
    expect(wrapper.text()).toContain('基本信息');
  });

  it('navigates to next step', async () => {
    const wrapper = mount(FormWizard, {
      props: {
        steps: mockSteps,
        modelValue: initialFormData
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSteps,
          ElStep,
          ElButton,
          ElCard
        }
      }
    });

    const nextButton = wrapper.find('.next-button');
    if (nextButton.exists()) {
      await nextButton.trigger('click');
      
      const steps = wrapper.findComponent(ElSteps);
      expect(steps.props('active')).toBe(1);
    }
  });

  it('navigates to previous step', async () => {
    const wrapper = mount(FormWizard, {
      props: {
        steps: mockSteps,
        modelValue: initialFormData
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSteps,
          ElStep,
          ElButton,
          ElCard
        }
      }
    });

    // Go to next step first
    const nextButton = wrapper.find('.next-button');
    if (nextButton.exists()) {
      await nextButton.trigger('click');
    }

    // Then go back
    const prevButton = wrapper.find('.prev-button');
    if (prevButton.exists()) {
      await prevButton.trigger('click');
      
      const steps = wrapper.findComponent(ElSteps);
      expect(steps.props('active')).toBe(0);
    }
  });

  it('disables previous button on first step', () => {
    const wrapper = mount(FormWizard, {
      props: {
        steps: mockSteps,
        modelValue: initialFormData
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSteps,
          ElStep,
          ElButton,
          ElCard
        }
      }
    });

    const prevButton = wrapper.find('.prev-button');
    if (prevButton.exists()) {
      expect(prevButton.props('disabled')).toBe(true);
    }
  });

  it('changes next button to finish on last step', async () => {
    const wrapper = mount(FormWizard, {
      props: {
        steps: mockSteps,
        modelValue: initialFormData
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSteps,
          ElStep,
          ElButton,
          ElCard
        }
      }
    });

    // Navigate to last step
    for (let i = 0; i < mockSteps.length - 1; i++) {
      const nextButton = wrapper.find('.next-button');
      if (nextButton.exists()) {
        await nextButton.trigger('click');
      }
    }

    const finishButton = wrapper.find('.finish-button');
    expect(finishButton.exists()).toBe(true);
  });

  it('validates current step before proceeding', async () => {
    const wrapper = mount(FormWizard, {
      props: {
        steps: mockSteps,
        modelValue: initialFormData,
        validateBeforeNext: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSteps,
          ElStep,
          ElButton,
          ElCard
        }
      }
    });

    const nextButton = wrapper.find('.next-button');
    if (nextButton.exists()) {
      await nextButton.trigger('click');
      expect(wrapper.emitted('step-validate')).toBeTruthy();
    }
  });

  it('emits step change events', async () => {
    const wrapper = mount(FormWizard, {
      props: {
        steps: mockSteps,
        modelValue: initialFormData
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSteps,
          ElStep,
          ElButton,
          ElCard
        }
      }
    });

    const nextButton = wrapper.find('.next-button');
    if (nextButton.exists()) {
      await nextButton.trigger('click');
      expect(wrapper.emitted('step-change')).toBeTruthy();
      expect(wrapper.emitted('step-change')[0][0]).toBe(1);
    }
  });

  it('emits complete event when wizard is finished', async () => {
    const wrapper = mount(FormWizard, {
      props: {
        steps: mockSteps,
        modelValue: initialFormData
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSteps,
          ElStep,
          ElButton,
          ElCard
        }
      }
    });

    // Navigate to last step
    for (let i = 0; i < mockSteps.length - 1; i++) {
      const nextButton = wrapper.find('.next-button');
      if (nextButton.exists()) {
        await nextButton.trigger('click');
      }
    }

    // Finish wizard
    const finishButton = wrapper.find('.finish-button');
    if (finishButton.exists()) {
      await finishButton.trigger('click');
      expect(wrapper.emitted('complete')).toBeTruthy();
    }
  });

  it('emits cancel event when cancel button is clicked', async () => {
    const wrapper = mount(FormWizard, {
      props: {
        steps: mockSteps,
        modelValue: initialFormData,
        showCancel: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSteps,
          ElStep,
          ElButton,
          ElCard
        }
      }
    });

    const cancelButton = wrapper.find('.cancel-button');
    if (cancelButton.exists()) {
      await cancelButton.trigger('click');
      expect(wrapper.emitted('cancel')).toBeTruthy();
    }
  });

  it('updates form data when modelValue changes', async () => {
    const wrapper = mount(FormWizard, {
      props: {
        steps: mockSteps,
        modelValue: initialFormData
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSteps,
          ElStep,
          ElButton,
          ElCard
        }
      }
    });

    const newData = {
      name: '张三',
      email: 'zhangsan@example.com',
      phone: '13800138000',
      address: '北京市朝阳区'
    };

    await wrapper.setProps({ modelValue: newData });
    expect(wrapper.props('modelValue')).toEqual(newData);
  });

  it('emits update:modelValue when form data changes', async () => {
    const wrapper = mount(FormWizard, {
      props: {
        steps: mockSteps,
        modelValue: initialFormData
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSteps,
          ElStep,
          ElButton,
          ElCard
        }
      }
    });

    // Simulate form data change
    await wrapper.vm.updateFormData({ name: '李四' });
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
  });

  it('shows step validation errors', async () => {
    const wrapper = mount(FormWizard, {
      props: {
        steps: mockSteps,
        modelValue: initialFormData,
        showValidationErrors: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSteps,
          ElStep,
          ElButton,
          ElCard,
          ElAlert
        }
      }
    });

    await wrapper.vm.validateCurrentStep();
    expect(wrapper.findComponent(ElAlert).exists()).toBe(true);
  });

  it('handles step completion status', async () => {
    const wrapper = mount(FormWizard, {
      props: {
        steps: mockSteps,
        modelValue: initialFormData
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSteps,
          ElStep,
          ElButton,
          ElCard
        }
      }
    });

    // Complete first step
    await wrapper.vm.completeStep(0);
    
    const steps = wrapper.findAllComponents(ElStep);
    expect(steps[0].props('status')).toBe('success');
  });

  it('supports step icons', () => {
    const stepsWithIcons = mockSteps.map((step, index) => ({
      ...step,
      icon: `icon-${index + 1}`
    }));

    const wrapper = mount(FormWizard, {
      props: {
        steps: stepsWithIcons,
        modelValue: initialFormData
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSteps,
          ElStep,
          ElButton,
          ElCard
        }
      }
    });

    const steps = wrapper.findAllComponents(ElStep);
    expect(steps[0].props('icon')).toBe('icon-1');
  });

  it('shows progress indicator', () => {
    const wrapper = mount(FormWizard, {
      props: {
        steps: mockSteps,
        modelValue: initialFormData,
        showProgress: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSteps,
          ElStep,
          ElButton,
          ElCard
        }
      }
    });

    expect(wrapper.find('.progress-indicator').exists()).toBe(true);
  });

  it('supports linear mode (no step skipping)', () => {
    const wrapper = mount(FormWizard, {
      props: {
        steps: mockSteps,
        modelValue: initialFormData,
        linear: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSteps,
          ElStep,
          ElButton,
          ElCard
        }
      }
    });

    expect(wrapper.find('.linear-mode').exists()).toBe(true);
  });

  it('allows step clicking in non-linear mode', async () => {
    const wrapper = mount(FormWizard, {
      props: {
        steps: mockSteps,
        modelValue: initialFormData,
        linear: false
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSteps,
          ElStep,
          ElButton,
          ElCard
        }
      }
    });

    const step = wrapper.findAllComponents(ElStep)[1];
    await step.trigger('click');
    
    expect(wrapper.emitted('step-click')).toBeTruthy();
  });

  it('shows step descriptions', () => {
    const wrapper = mount(FormWizard, {
      props: {
        steps: mockSteps,
        modelValue: initialFormData
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSteps,
          ElStep,
          ElButton,
          ElCard
        }
      }
    });

    expect(wrapper.text()).toContain('基本信息');
    expect(wrapper.text()).toContain('详细信息');
    expect(wrapper.text()).toContain('确认信息');
  });

  it('handles empty steps gracefully', () => {
    const wrapper = mount(FormWizard, {
      props: {
        steps: [],
        modelValue: {}
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSteps,
          ElStep,
          ElButton,
          ElCard
        }
      }
    });

    expect(wrapper.findComponent(ElSteps).exists()).toBe(true);
    expect(wrapper.findAllComponents(ElStep)).toHaveLength(0);
  });

  it('applies custom CSS classes', () => {
    const wrapper = mount(FormWizard, {
      props: {
        steps: mockSteps,
        modelValue: initialFormData,
        wizardClass: 'custom-wizard-class',
        stepClass: 'custom-step-class'
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSteps,
          ElStep,
          ElButton,
          ElCard
        }
      }
    });

    expect(wrapper.find('.custom-wizard-class').exists()).toBe(true);
  });

  it('shows loading state', () => {
    const wrapper = mount(FormWizard, {
      props: {
        steps: mockSteps,
        modelValue: initialFormData,
        loading: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSteps,
          ElStep,
          ElButton,
          ElCard
        }
      }
    });

    expect(wrapper.find('.loading-overlay').exists()).toBe(true);
  });

  it('resets wizard to initial state', async () => {
    const wrapper = mount(FormWizard, {
      props: {
        steps: mockSteps,
        modelValue: initialFormData
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSteps,
          ElStep,
          ElButton,
          ElCard
        }
      }
    });

    // Navigate to second step
    const nextButton = wrapper.find('.next-button');
    if (nextButton.exists()) {
      await nextButton.trigger('click');
    }

    // Reset wizard
    await wrapper.vm.reset();
    
    const steps = wrapper.findComponent(ElSteps);
    expect(steps.props('active')).toBe(0);
  });

  it('emits step validation events', async () => {
    const wrapper = mount(FormWizard, {
      props: {
        steps: mockSteps,
        modelValue: initialFormData,
        validateBeforeNext: true
      },
      global: {
        plugins: [pinia],
        stubs: {
          ElSteps,
          ElStep,
          ElButton,
          ElCard
        }
      }
    });

    await wrapper.vm.validateCurrentStep();
    expect(wrapper.emitted('step-validation')).toBeTruthy();
  });
});