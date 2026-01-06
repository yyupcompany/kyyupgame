
// 使用全局表单引用Mock
beforeEach(() => {
  // 设置表单引用Mock
  if (typeof formRef !== 'undefined' && formRef.value) => {
    Object.assign(formRef.value, global.mockFormRef)
  }
  if (typeof editInput !== 'undefined' && editInput.value) {
    Object.assign(editInput.value, global.mockInputRef)
  }
})
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})


// Element Plus Mock for form validation
const mockFormRef = {
  clearValidate: vi.fn(),
  resetFields: vi.fn(),
  validate: vi.fn(() => Promise.resolve(true)),
  validateField: vi.fn()
}

const mockInputRef = {
  focus: vi.fn(),
  blur: vi.fn(),
  select: vi.fn()
}

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElForm: {
    name: 'ElForm',
    template: '<form><slot /></form>'
  },
  ElFormItem: {
    name: 'ElFormItem',
    template: '<div><slot /></div>'
  },
  ElInput: {
    name: 'ElInput',
    template: '<input />'
  },
  ElButton: {
    name: 'ElButton',
    template: '<button><slot /></button>'
  }
}))

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import TodoList from '@/components/ai/TodoList.vue';

// 控制台错误检测变量
let consoleSpy: any

describe('TodoList', () => {
  let wrapper: any;

  const mockTodos = [
    {
      text: 'Complete project documentation',
      completed: false,
      priority: 'high',
      dueDate: '2024-01-15'
    },
    {
      text: 'Review code changes',
      completed: true,
      priority: 'normal',
      dueDate: '2024-01-10'
    },
    {
      text: 'Update dependencies',
      completed: false,
      priority: 'low',
      dueDate: '2024-01-20'
    }
  ];

  const createWrapper = (props = {}) => {
    return mount(TodoList, {
      props: {
        value: [],
        title: '待办事项',
        editable: true,
        showProgress: true,
        ...props
      }
    });
  };

  beforeEach(() => {
    wrapper = createWrapper();
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    wrapper.unmount();
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('Component Rendering', () => {
    it('should render correctly with default props', () => {
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('.ai-todo-list').exists()).toBe(true);
      expect(wrapper.find('.todo-header').exists()).toBe(true);
    });

    it('should display correct title', () => {
      const title = wrapper.find('.todo-header h3');
      expect(title.exists()).toBe(true);
      expect(title.text()).toBe('待办事项');
    });

    it('should render todos container', () => {
      expect(wrapper.find('.todos-container').exists()).toBe(true);
    });

    it('should display empty state when no todos', () => {
      const emptyState = wrapper.find('.empty-state');
      expect(emptyState.exists()).toBe(true);
      expect(emptyState.text()).toBe('暂无待办事项');
    });

    it('should render add button when editable', () => {
      const addButton = wrapper.find('.add-todo-btn');
      expect(addButton.exists()).toBe(true);
    });

    it('should not render add button when not editable', async () => {
      await wrapper.setProps({ editable: false });
      
      const addButton = wrapper.find('.add-todo-btn');
      expect(addButton.exists()).toBe(false);
    });
  });

  describe('Todo Items', () => {
    beforeEach(async () => {
      await wrapper.setProps({ value: mockTodos });
    });

    it('should render correct number of todo items', () => {
      const todoItems = wrapper.findAll('.todo-item');
      expect(todoItems.length).toBe(3);
    });

    it('should display todo text correctly', () => {
      const todoItems = wrapper.findAll('.todo-item');
      
      expect(todoItems[0].find('.todo-text').text()).toBe('Complete project documentation');
      expect(todoItems[1].find('.todo-text').text()).toBe('Review code changes');
      expect(todoItems[2].find('.todo-text').text()).toBe('Update dependencies');
    });

    it('should apply completed class to completed todos', () => {
      const todoItems = wrapper.findAll('.todo-item');
      
      expect(todoItems[0].classes()).not.toContain('completed');
      expect(todoItems[1].classes()).toContain('completed');
      expect(todoItems[2].classes()).not.toContain('completed');
    });

    it('should display completed todos with line-through', () => {
      const completedTodo = wrapper.findAll('.todo-item')[1];
      const todoText = completedTodo.find('.todo-text');
      
      expect(todoText.classes()).toContain('completed');
    });

    it('should render todo checkbox for each item', () => {
      const checkboxes = wrapper.findAll('.todo-checkbox');
      expect(checkboxes.length).toBe(3);
    });

    it('should render check icon for completed todos', () => {
      const todoItems = wrapper.findAll('.todo-item');
      
      expect(todoItems[0].find('.todo-checkbox i').exists()).toBe(false);
      expect(todoItems[1].find('.todo-checkbox i').exists()).toBe(true);
      expect(todoItems[2].find('.todo-checkbox i').exists()).toBe(false);
    });

    it('should render todo actions when editable', () => {
      const todoItems = wrapper.findAll('.todo-item');
      
      todoItems.forEach(item => {
        expect(item.find('.todo-actions').exists()).toBe(true);
        expect(item.find('.todo-edit-btn').exists()).toBe(true);
        expect(item.find('.todo-delete-btn').exists()).toBe(true);
      });
    });

    it('should not render todo actions when not editable', async () => {
      await wrapper.setProps({ editable: false });
      
      const todoItems = wrapper.findAll('.todo-item');
      
      todoItems.forEach(item => {
        expect(item.find('.todo-actions').exists()).toBe(false);
      });
    });
  });

  describe('Todo Meta Information', () => {
    beforeEach(async () => {
      await wrapper.setProps({ value: mockTodos });
    });

    it('should display due date when provided', () => {
      const todoItems = wrapper.findAll('.todo-item');
      
      expect(todoItems[0].find('.due-date').exists()).toBe(true);
      expect(todoItems[0].find('.due-date').text()).toContain('2024-01-15');
    });

    it('should display priority when provided', () => {
      const todoItems = wrapper.findAll('.todo-item');
      
      expect(todoItems[0].find('.priority').exists()).toBe(true);
      expect(todoItems[0].find('.priority').text()).toBe('高');
      
      expect(todoItems[1].find('.priority').exists()).toBe(true);
      expect(todoItems[1].find('.priority').text()).toBe('中');
      
      expect(todoItems[2].find('.priority').exists()).toBe(true);
      expect(todoItems[2].find('.priority').text()).toBe('低');
    });

    it('should apply correct priority classes', () => {
      const todoItems = wrapper.findAll('.todo-item');
      
      expect(todoItems[0].find('.priority').classes()).toContain('priority-high');
      expect(todoItems[1].find('.priority').classes()).toContain('priority-normal');
      expect(todoItems[2].find('.priority').classes()).toContain('priority-low');
    });

    it('should not display meta information when not provided', async () => {
      const todosWithoutMeta = [
        { text: 'Simple todo', completed: false }
      ];
      
      await wrapper.setProps({ value: todosWithoutMeta });
      
      const todoItem = wrapper.find('.todo-item');
      expect(todoItem.find('.todo-meta').exists()).toBe(false);
    });
  });

  describe('Todo Progress', () => {
    it('should render progress section when showProgress is true and todos exist', async () => {
      await wrapper.setProps({ value: mockTodos });
      
      expect(wrapper.find('.todo-progress').exists()).toBe(true);
      expect(wrapper.find('.progress-bar').exists()).toBe(true);
      expect(wrapper.find('.progress-text').exists()).toBe(true);
    });

    it('should not render progress section when showProgress is false', async () => {
      await wrapper.setProps({ 
        value: mockTodos,
        showProgress: false 
      });
      
      expect(wrapper.find('.todo-progress').exists()).toBe(false);
    });

    it('should not render progress section when no todos', () => {
      expect(wrapper.find('.todo-progress').exists()).toBe(false);
    });

    it('should calculate progress correctly', async () => {
      await wrapper.setProps({ value: mockTodos });
      
      expect(wrapper.vm.completedCount).toBe(1);
      expect(wrapper.vm.progressPercentage).toBe(33);
    });

    it('should display correct progress text', async () => {
      await wrapper.setProps({ value: mockTodos });
      
      const progressText = wrapper.find('.progress-text');
      expect(progressText.text()).toBe('1/3 已完成 (33%)');
    });

    it('should update progress bar width', async () => {
      await wrapper.setProps({ value: mockTodos });
      
      const progressFill = wrapper.find('.progress-fill');
      expect(progressFill.attributes('style')).toContain('width: 33%');
    });

    it('should handle 0% progress', async () => {
      const incompleteTodos = [
        { text: 'Todo 1', completed: false },
        { text: 'Todo 2', completed: false }
      ];
      
      await wrapper.setProps({ value: incompleteTodos });
      
      expect(wrapper.vm.completedCount).toBe(0);
      expect(wrapper.vm.progressPercentage).toBe(0);
    });

    it('should handle 100% progress', async () => {
      const completedTodos = [
        { text: 'Todo 1', completed: true },
        { text: 'Todo 2', completed: true }
      ];
      
      await wrapper.setProps({ value: completedTodos });
      
      expect(wrapper.vm.completedCount).toBe(2);
      expect(wrapper.vm.progressPercentage).toBe(100);
    });
  });

  describe('Todo Interactions', () => {
    beforeEach(async () => {
      await wrapper.setProps({ value: mockTodos });
    });

    it('should toggle todo completion when checkbox clicked', async () => {
      const firstTodo = wrapper.findAll('.todo-item')[0];
      const checkbox = firstTodo.find('.todo-checkbox');
      
      await checkbox.trigger('click');
      
      expect(wrapper.vm.todos[0].completed).toBe(true);
      expect(wrapper.emitted('update:value')).toBeTruthy();
      expect(wrapper.emitted('change')).toBeTruthy();
    });

    it('should start editing when edit button clicked', async () => {
      const firstTodo = wrapper.findAll('.todo-item')[0];
      const editButton = firstTodo.find('.todo-edit-btn');
      
      await editButton.trigger('click');
      
      expect(wrapper.vm.editingIndex).toBe(0);
      expect(wrapper.vm.editingText).toBe('Complete project documentation');
    });

    it('should save edit when input loses focus', async () => {
      const firstTodo = wrapper.findAll('.todo-item')[0];
      const editButton = firstTodo.find('.todo-edit-btn');
      
      await editButton.trigger('click');
      expect(wrapper.vm.editingIndex).toBe(0);
      
      const editInput = wrapper.find('.todo-edit input');
      await editInput.setValue('Updated todo text');
      await editInput.trigger('blur');
      
      expect(wrapper.vm.editingIndex).toBe(-1);
      expect(wrapper.vm.todos[0].text).toBe('Updated todo text');
      expect(wrapper.emitted('update:value')).toBeTruthy();
    });

    it('should save edit when enter key pressed', async () => {
      const firstTodo = wrapper.findAll('.todo-item')[0];
      const editButton = firstTodo.find('.todo-edit-btn');
      
      await editButton.trigger('click');
      
      const editInput = wrapper.find('.todo-edit input');
      await editInput.setValue('Updated todo text');
      await editInput.trigger('keyup.enter');
      
      expect(wrapper.vm.editingIndex).toBe(-1);
      expect(wrapper.vm.todos[0].text).toBe('Updated todo text');
    });

    it('should delete todo when delete button clicked', async () => {
      const firstTodo = wrapper.findAll('.todo-item')[0];
      const deleteButton = firstTodo.find('.todo-delete-btn');
      
      await deleteButton.trigger('click');
      
      expect(wrapper.vm.todos.length).toBe(2);
      expect(wrapper.vm.todos[0].text).toBe('Review code changes');
      expect(wrapper.emitted('update:value')).toBeTruthy();
    });

    it('should start editing new todo when add button clicked', async () => {
      const addButton = wrapper.find('.add-todo-btn');
      await addButton.trigger('click');
      
      expect(wrapper.vm.todos.length).toBe(1);
      expect(wrapper.vm.todos[0].text).toBe('');
      expect(wrapper.vm.todos[0].completed).toBe(false);
      expect(wrapper.vm.todos[0].priority).toBe('normal');
      expect(wrapper.vm.editingIndex).toBe(0);
    });

    it('should focus edit input when editing starts', async () => {
      const firstTodo = wrapper.findAll('.todo-item')[0];
      const editButton = firstTodo.find('.todo-edit-btn');
      
      const focusSpy = vi.fn();
      wrapper.vm.editInput = { focus: focusSpy };
      
      await editButton.trigger('click');
      
      expect(focusSpy).toHaveBeenCalled();
    });
  });

  describe('Todo Utilities', () => {
    it('should format date correctly', () => {
      const formattedDate = wrapper.vm.formatDate('2024-01-15T10:30:00Z');
      expect(formattedDate).toBe('2024-01-15');
    });

    it('should handle invalid date format', () => {
      const formattedDate = wrapper.vm.formatDate('invalid-date');
      expect(formattedDate).toBe('NaN-NaN-NaN');
    });

    it('should get priority labels correctly', () => {
      expect(wrapper.vm.getPriorityLabel('high')).toBe('高');
      expect(wrapper.vm.getPriorityLabel('normal')).toBe('中');
      expect(wrapper.vm.getPriorityLabel('low')).toBe('低');
      expect(wrapper.vm.getPriorityLabel('unknown')).toBe('中');
    });
  });

  describe('Props Handling', () => {
    it('should update todos when value prop changes', async () => {
      const newTodos = [
        { text: 'New todo 1', completed: false },
        { text: 'New todo 2', completed: true }
      ];
      
      await wrapper.setProps({ value: newTodos });
      
      expect(wrapper.vm.todos).toEqual(newTodos);
    });

    it('should handle empty value prop', async () => {
      await wrapper.setProps({ value: [] });
      
      expect(wrapper.vm.todos).toEqual([]);
    });

    it('should handle null value prop', async () => {
      await wrapper.setProps({ value: null as any });
      
      expect(wrapper.vm.todos).toEqual([]);
    });

    it('should handle undefined value prop', async () => {
      await wrapper.setProps({ value: undefined as any });
      
      expect(wrapper.vm.todos).toEqual([]);
    });
  });

  describe('Event Emission', () => {
    beforeEach(async () => {
      await wrapper.setProps({ value: mockTodos });
    });

    it('should emit update:value event when todos change', async () => {
      const firstTodo = wrapper.findAll('.todo-item')[0];
      const checkbox = firstTodo.find('.todo-checkbox');
      
      await checkbox.trigger('click');
      
      expect(wrapper.emitted('update:value')).toBeTruthy();
      expect(wrapper.emitted('update:value')[0]).toEqual(wrapper.vm.todos);
    });

    it('should emit change event when todos change', async () => {
      const firstTodo = wrapper.findAll('.todo-item')[0];
      const checkbox = firstTodo.find('.todo-checkbox');
      
      await checkbox.trigger('click');
      
      expect(wrapper.emitted('change')).toBeTruthy();
      expect(wrapper.emitted('change')[0]).toEqual(wrapper.vm.todos);
    });

    it('should emit events with correct data', async () => {
      const deleteButton = wrapper.findAll('.todo-item')[0].find('.todo-delete-btn');
      await deleteButton.trigger('click');
      
      const emittedValue = wrapper.emitted('update:value')[0];
      expect(emittedValue).toHaveLength(2);
      expect(emittedValue[0].text).toBe('Review code changes');
    });
  });

  describe('Edge Cases', () => {
    it('should handle todos without priority property', async () => {
      const todosWithoutPriority = [
        { text: 'Todo 1', completed: false },
        { text: 'Todo 2', completed: true }
      ];
      
      await wrapper.setProps({ value: todosWithoutPriority });
      
      const todoItems = wrapper.findAll('.todo-item');
      expect(todoItems[0].find('.priority').exists()).toBe(false);
    });

    it('should handle todos without dueDate property', async () => {
      const todosWithoutDueDate = [
        { text: 'Todo 1', completed: false, priority: 'high' },
        { text: 'Todo 2', completed: true, priority: 'normal' }
      ];
      
      await wrapper.setProps({ value: todosWithoutDueDate });
      
      const todoItems = wrapper.findAll('.todo-item');
      expect(todoItems[0].find('.due-date').exists()).toBe(false);
    });

    it('should handle empty todo text', async () => {
      const todosWithEmptyText = [
        { text: '', completed: false },
        { text: 'Valid todo', completed: false }
      ];
      
      await wrapper.setProps({ value: todosWithEmptyText });
      
      const todoItems = wrapper.findAll('.todo-item');
      expect(todoItems[0].find('.todo-text').text()).toBe('');
    });

    it('should handle todos with only required properties', async () => {
      const minimalTodos = [
        { text: 'Simple todo', completed: false }
      ];
      
      await wrapper.setProps({ value: minimalTodos });
      
      const todoItem = wrapper.find('.todo-item');
      expect(todoItem.find('.todo-text').text()).toBe('Simple todo');
      expect(todoItem.find('.todo-checkbox').exists()).toBe(true);
    });

    it('should handle large number of todos', async () => {
      const manyTodos = Array.from({ length: 100 }, (_, i) => ({
        text: `Todo ${i + 1}`,
        completed: i % 2 === 0
      }));
      
      await wrapper.setProps({ value: manyTodos });
      
      const todoItems = wrapper.findAll('.todo-item');
      expect(todoItems.length).toBe(100);
      
      expect(wrapper.vm.completedCount).toBe(50);
      expect(wrapper.vm.progressPercentage).toBe(50);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', async () => {
      await wrapper.setProps({ value: mockTodos });
      
      const todoItems = wrapper.findAll('.todo-item');
      
      todoItems.forEach((item, index) => {
        const checkbox = item.find('.todo-checkbox');
        expect(checkbox.attributes('role')).toBeDefined();
        
        const todoText = item.find('.todo-text');
        expect(todoText.attributes('tabindex')).toBeDefined();
      });
    });

    it('should be keyboard navigable', async () => {
      await wrapper.setProps({ value: mockTodos });
      
      const editInput = wrapper.find('.todo-edit input');
      if (editInput.exists()) {
        expect(editInput.attributes('tabindex')).toBeDefined();
      }
    });
  });
});