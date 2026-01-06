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

describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createWebHistory, Router } from 'vue-router';
import ActivityActions from '@/components/activity/ActivityActions.vue';

describe('ActivityActions.vue', () => {
  let router: Router;

  beforeEach(() => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        {
          path: '/',
          name: 'home',
          component: { template: '<div>Home</div>' }
        }
      ]
    });
  });

  it('renders correctly with default props', () => {
    const wrapper = mount(ActivityActions, {
      global: {
        plugins: [router]
      },
      props: {
        activity: {
          id: 1,
          title: 'Test Activity',
          status: 1
        }
      }
    });

    expect(wrapper.find('.activity-actions').exists()).toBe(true);
    expect(wrapper.findAll('.el-button').length).toBe(4);
  });

  it('renders view button with correct text', () => {
    const wrapper = mount(ActivityActions, {
      global: {
        plugins: [router]
      },
      props: {
        activity: {
          id: 1,
          title: 'Test Activity',
          status: 1
        }
      }
    });

    const viewButton = wrapper.find('.el-button--primary');
    expect(viewButton.text()).toBe('查看');
  });

  it('renders edit button with correct text', () => {
    const wrapper = mount(ActivityActions, {
      global: {
        plugins: [router]
      },
      props: {
        activity: {
          id: 1,
          title: 'Test Activity',
          status: 1
        }
      }
    });

    const editButton = wrapper.findAll('.el-button')[1];
    expect(editButton.text()).toBe('编辑');
  });

  it('renders delete button with correct text', () => {
    const wrapper = mount(ActivityActions, {
      global: {
        plugins: [router]
      },
      props: {
        activity: {
          id: 1,
          title: 'Test Activity',
          status: 1
        }
      }
    });

    const deleteButton = wrapper.findAll('.el-button')[2];
    expect(deleteButton.text()).toBe('删除');
  });

  it('renders status change button with correct text', () => {
    const wrapper = mount(ActivityActions, {
      global: {
        plugins: [router]
      },
      props: {
        activity: {
          id: 1,
          title: 'Test Activity',
          status: 1
        }
      }
    });

    const statusButton = wrapper.findAll('.el-button')[3];
    expect(statusButton.text()).toBe('更改状态');
  });

  it('emits view event when view button is clicked', async () => {
    const wrapper = mount(ActivityActions, {
      global: {
        plugins: [router]
      },
      props: {
        activity: {
          id: 1,
          title: 'Test Activity',
          status: 1
        }
      }
    });

    const viewButton = wrapper.find('.el-button--primary');
    await viewButton.trigger('click');

    expect(wrapper.emitted('view')).toBeTruthy();
    expect(wrapper.emitted('view')).toHaveLength(1);
    expect(wrapper.emitted('view')[0]).toEqual([1]);
  });

  it('emits edit event when edit button is clicked', async () => {
    const wrapper = mount(ActivityActions, {
      global: {
        plugins: [router]
      },
      props: {
        activity: {
          id: 1,
          title: 'Test Activity',
          status: 1
        }
      }
    });

    const editButton = wrapper.findAll('.el-button')[1];
    await editButton.trigger('click');

    expect(wrapper.emitted('edit')).toBeTruthy();
    expect(wrapper.emitted('edit')).toHaveLength(1);
    expect(wrapper.emitted('edit')[0]).toEqual([1]);
  });

  it('emits delete event when delete button is clicked', async () => {
    const wrapper = mount(ActivityActions, {
      global: {
        plugins: [router]
      },
      props: {
        activity: {
          id: 1,
          title: 'Test Activity',
          status: 1
        }
      }
    });

    const deleteButton = wrapper.findAll('.el-button')[2];
    await deleteButton.trigger('click');

    expect(wrapper.emitted('delete')).toBeTruthy();
    expect(wrapper.emitted('delete')).toHaveLength(1);
    expect(wrapper.emitted('delete')[0]).toEqual([1]);
  });

  it('emits change-status event when status button is clicked', async () => {
    const wrapper = mount(ActivityActions, {
      global: {
        plugins: [router]
      },
      props: {
        activity: {
          id: 1,
          title: 'Test Activity',
          status: 1
        }
      }
    });

    const statusButton = wrapper.findAll('.el-button')[3];
    await statusButton.trigger('click');

    expect(wrapper.emitted('change-status')).toBeTruthy();
    expect(wrapper.emitted('change-status')).toHaveLength(1);
    expect(wrapper.emitted('change-status')[0]).toEqual([1]);
  });

  it('handles disabled view button correctly', () => {
    const wrapper = mount(ActivityActions, {
      global: {
        plugins: [router]
      },
      props: {
        activity: {
          id: 1,
          title: 'Test Activity',
          status: 1
        },
        disabledActions: ['view']
      }
    });

    const viewButton = wrapper.find('.el-button--primary');
    expect(viewButton.classes()).toContain('is-disabled');
  });

  it('handles disabled edit button correctly', () => {
    const wrapper = mount(ActivityActions, {
      global: {
        plugins: [router]
      },
      props: {
        activity: {
          id: 1,
          title: 'Test Activity',
          status: 1
        },
        disabledActions: ['edit']
      }
    });

    const editButton = wrapper.findAll('.el-button')[1];
    expect(editButton.classes()).toContain('is-disabled');
  });

  it('handles disabled delete button correctly', () => {
    const wrapper = mount(ActivityActions, {
      global: {
        plugins: [router]
      },
      props: {
        activity: {
          id: 1,
          title: 'Test Activity',
          status: 1
        },
        disabledActions: ['delete']
      }
    });

    const deleteButton = wrapper.findAll('.el-button')[2];
    expect(deleteButton.classes()).toContain('is-disabled');
  });

  it('handles disabled status button correctly', () => {
    const wrapper = mount(ActivityActions, {
      global: {
        plugins: [router]
      },
      props: {
        activity: {
          id: 1,
          title: 'Test Activity',
          status: 1
        },
        disabledActions: ['change-status']
      }
    });

    const statusButton = wrapper.findAll('.el-button')[3];
    expect(statusButton.classes()).toContain('is-disabled');
  });

  it('does not emit events when buttons are disabled', async () => {
    const wrapper = mount(ActivityActions, {
      global: {
        plugins: [router]
      },
      props: {
        activity: {
          id: 1,
          title: 'Test Activity',
          status: 1
        },
        disabledActions: ['view', 'edit', 'delete', 'change-status']
      }
    });

    const buttons = wrapper.findAll('.el-button');
    
    for (const button of buttons) {
      await button.trigger('click');
    }

    expect(wrapper.emitted('view')).toBeFalsy();
    expect(wrapper.emitted('edit')).toBeFalsy();
    expect(wrapper.emitted('delete')).toBeFalsy();
    expect(wrapper.emitted('change-status')).toBeFalsy();
  });

  it('handles missing activity prop gracefully', () => {
    const wrapper = mount(ActivityActions, {
      global: {
        plugins: [router]
      },
      props: {
        activity: null
      }
    });

    expect(wrapper.find('.activity-actions').exists()).toBe(true);
    expect(wrapper.findAll('.el-button').length).toBe(0);
  });

  it('handles activity with missing id', () => {
    const wrapper = mount(ActivityActions, {
      global: {
        plugins: [router]
      },
      props: {
        activity: {
          title: 'Test Activity',
          status: 1
        }
      }
    });

    const buttons = wrapper.findAll('.el-button');
    
    for (const button of buttons) {
      await button.trigger('click');
    }

    expect(wrapper.emitted('view')).toBeTruthy();
    expect(wrapper.emitted('view')[0]).toEqual([undefined]);
  });

  it('applies correct CSS classes', () => {
    const wrapper = mount(ActivityActions, {
      global: {
        plugins: [router]
      },
      props: {
        activity: {
          id: 1,
          title: 'Test Activity',
          status: 1
        }
      }
    });

    const actionsContainer = wrapper.find('.activity-actions');
    expect(actionsContainer.classes()).toContain('activity-actions');
  });

  it('is a Vue instance', () => {
    const wrapper = mount(ActivityActions, {
      global: {
        plugins: [router]
      },
      props: {
        activity: {
          id: 1,
          title: 'Test Activity',
          status: 1
        }
      }
    });

    expect(wrapper.vm).toBeTruthy();
    expect(wrapper.findComponent(ActivityActions).exists()).toBe(true);
  });

  it('has correct prop types', () => {
    const wrapper = mount(ActivityActions, {
      global: {
        plugins: [router]
      },
      props: {
        activity: {
          id: 1,
          title: 'Test Activity',
          status: 1
        },
        disabledActions: ['view', 'edit']
      }
    });

    expect(wrapper.props().activity).toEqual({
      id: 1,
      title: 'Test Activity',
      status: 1
    });
    expect(wrapper.props().disabledActions).toEqual(['view', 'edit']);
  });

  it('handles empty disabledActions array', () => {
    const wrapper = mount(ActivityActions, {
      global: {
        plugins: [router]
      },
      props: {
        activity: {
          id: 1,
          title: 'Test Activity',
          status: 1
        },
        disabledActions: []
      }
    });

    const buttons = wrapper.findAll('.el-button');
    for (const button of buttons) {
      expect(button.classes()).not.toContain('is-disabled');
    }
  });
});