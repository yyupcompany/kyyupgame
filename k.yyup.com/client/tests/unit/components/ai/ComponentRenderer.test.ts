import { describe, it, expect, beforeEach, vi } from 'vitest';
import { vi } from 'vitest'
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ComponentRenderer from '@/components/ai/ComponentRenderer.vue';

// Mock the child components
vi.mock('@/components/ai/TodoList.vue', () => ({
  default: {
    name: 'AiTodoList',
    template: '<div class="mock-todo-list">{{ title }} - {{ value.length }} items</div>',
    props: ['value', 'title', 'editable', 'showProgress']
  }
}));

vi.mock('@/components/ai/DataTable.vue', () => ({
  default: {
    name: 'AiDataTable',
    template: '<div class="mock-data-table">{{ title }} - {{ data.length }} rows</div>',
    props: ['data', 'columns', 'title', 'searchable', 'pagination', 'pageSize', 'showToolbar', 'exportable', 'emptyText']
  }
}));

vi.mock('@/components/ai/ReportChart.vue', () => ({
  default: {
    name: 'AiReportChart',
    template: '<div class="mock-chart">{{ title }} - {{ type }}</div>',
    props: ['data', 'type', 'title', 'description', 'height', 'showToolbar', 'showLegend', 'theme', 'colors', 'allowChangeType']
  }
}));

vi.mock('@/components/ai/OperationPanel.vue', () => ({
  default: {
    name: 'OperationPanel',
    template: '<div class="mock-operation-panel">{{ title }} - Step {{ activeStep }}</div>',
    props: ['title', 'status', 'steps', 'activeStep', 'screenshot', 'highlights', 'results', 'showActions', 'canRetry', 'canContinue']
  }
}));

// 控制台错误检测变量
let consoleSpy: any

describe('ComponentRenderer.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(ComponentRenderer, {
      props: {
        jsonData: null
      }
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    if (wrapper) => {
      wrapper.unmount();
    }
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('Component Rendering', () => {
    it('renders component without crashing', () => {
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.classes()).toContain('ai-component-renderer');
    });

    it('shows parse error when jsonData is null', () => {
      expect(wrapper.find('.parse-error').exists()).toBe(true);
      expect(wrapper.find('.error-message').text()).toBe('无数据');
    });

    it('shows parse error when jsonData is empty string', async () => {
      await wrapper.setProps({ jsonData: '' });
      expect(wrapper.find('.parse-error').exists()).toBe(true);
      expect(wrapper.find('.error-message').text()).toBe('无数据');
    });
  });

  describe('JSON Parsing', () => {
    it('parses valid JSON string correctly', async () => {
      const validJson = JSON.stringify({
        type: 'todo-list',
        title: 'Test Todo',
        data: [{ id: 1, text: 'Task 1', completed: false }]
      });

      await wrapper.setProps({ jsonData: validJson });
      
      expect(wrapper.find('.parse-error').exists()).toBe(false);
      expect(wrapper.find('.mock-todo-list').exists()).toBe(true);
      expect(wrapper.find('.mock-todo-list').text()).toContain('Test Todo');
    });

    it('parses JSON object correctly', async () => {
      const jsonObject = {
        type: 'data-table',
        title: 'Test Table',
        data: [{ id: 1, name: 'Item 1' }],
        columns: [{ prop: 'id', label: 'ID' }, { prop: 'name', label: 'Name' }]
      };

      await wrapper.setProps({ jsonData: jsonObject });
      
      expect(wrapper.find('.parse-error').exists()).toBe(false);
      expect(wrapper.find('.mock-data-table').exists()).toBe(true);
      expect(wrapper.find('.mock-data-table').text()).toContain('Test Table');
    });

    it('extracts JSON from markdown code blocks', async () => {
      const markdownJson = `Here is some text:
\`\`\`json
{
  "type": "chart",
  "title": "Test Chart",
  "data": [10, 20, 30]
}
\`\`\`
More text here.`;

      await wrapper.setProps({ jsonData: markdownJson });
      
      expect(wrapper.find('.parse-error').exists()).toBe(false);
      expect(wrapper.find('.mock-chart').exists()).toBe(true);
      expect(wrapper.find('.mock-chart').text()).toContain('Test Chart');
    });

    it('extracts JSON from generic code blocks', async () => {
      const genericCodeBlock = `\`\`\`
{
  "type": "chart",
  "title": "Generic Chart",
  "data": [5, 15, 25]
}
\`\`\``;

      await wrapper.setProps({ jsonData: genericCodeBlock });
      
      expect(wrapper.find('.parse-error').exists()).toBe(false);
      expect(wrapper.find('.mock-chart').exists()).toBe(true);
      expect(wrapper.find('.mock-chart').text()).toContain('Generic Chart');
    });

    it('shows error for invalid JSON string', async () => {
      const invalidJson = '{"type": "todo-list", "data": [}'; // Invalid JSON
      
      await wrapper.setProps({ jsonData: invalidJson });
      
      expect(wrapper.find('.parse-error').exists()).toBe(true);
      expect(wrapper.find('.error-message').text()).toContain('解析失败');
      expect(wrapper.find('.json-data').text()).toBe(invalidJson);
    });

    it('displays raw JSON string in error view', async () => {
      const invalidJson = 'invalid json string';
      
      await wrapper.setProps({ jsonData: invalidJson });
      
      expect(wrapper.find('.parse-error').exists()).toBe(true);
      expect(wrapper.find('.json-data').text()).toBe(invalidJson);
    });

    it('displays formatted JSON object in error view', async () => {
      const invalidObject = { type: 'unknown', data: 'test' };
      
      await wrapper.setProps({ jsonData: invalidObject });
      
      await wrapper.setProps({ jsonData: 'invalid' }); // Trigger error state
      
      const jsonDisplay = wrapper.find('.json-data').text();
      expect(jsonDisplay).toContain('invalid');
    });
  });

  describe('Component Type Rendering', () => {
    it('renders AiTodoList for todo-list type', async () => {
      const todoData = {
        type: 'todo-list',
        title: 'My Todos',
        data: [
          { id: 1, text: 'Task 1', completed: false },
          { id: 2, text: 'Task 2', completed: true }
        ],
        editable: true,
        showProgress: true
      };

      await wrapper.setProps({ jsonData: todoData });
      
      const todoList = wrapper.findComponent({ name: 'AiTodoList' });
      expect(todoList.exists()).toBe(true);
      expect(todoList.props('value')).toEqual(todoData.data);
      expect(todoList.props('title')).toBe(todoData.title);
      expect(todoList.props('editable')).toBe(true);
      expect(todoList.props('showProgress')).toBe(true);
    });

    it('renders AiDataTable for data-table type', async () => {
      const tableData = {
        type: 'data-table',
        title: 'Student Data',
        data: [
          { id: 1, name: 'Alice', age: 5 },
          { id: 2, name: 'Bob', age: 6 }
        ],
        columns: [
          { prop: 'id', label: 'ID' },
          { prop: 'name', label: 'Name' },
          { prop: 'age', label: 'Age' }
        ],
        searchable: true,
        pagination: true,
        pageSize: 20,
        showToolbar: true,
        exportable: true,
        emptyText: 'No students found'
      };

      await wrapper.setProps({ jsonData: tableData });
      
      const dataTable = wrapper.findComponent({ name: 'AiDataTable' });
      expect(dataTable.exists()).toBe(true);
      expect(dataTable.props('data')).toEqual(tableData.data);
      expect(dataTable.props('columns')).toEqual(tableData.columns);
      expect(dataTable.props('title')).toBe(tableData.title);
      expect(dataTable.props('searchable')).toBe(true);
      expect(dataTable.props('pagination')).toBe(true);
      expect(dataTable.props('pageSize')).toBe(20);
      expect(dataTable.props('showToolbar')).toBe(true);
      expect(dataTable.props('exportable')).toBe(true);
      expect(dataTable.props('emptyText')).toBe('No students found');
    });

    it('renders AiReportChart for chart type', async () => {
      const chartData = {
        type: 'chart',
        title: 'Performance Chart',
        chartType: 'line',
        description: 'Monthly performance',
        data: [65, 59, 80, 81, 56, 55, 40],
        height: 400,
        showToolbar: true,
        showLegend: true,
        theme: 'dark',
        colors: ['#FF6384', '#36A2EB'],
        allowChangeType: true
      };

      await wrapper.setProps({ jsonData: chartData });
      
      const chart = wrapper.findComponent({ name: 'AiReportChart' });
      expect(chart.exists()).toBe(true);
      expect(chart.props('data')).toEqual(chartData.data);
      expect(chart.props('type')).toBe('line');
      expect(chart.props('title')).toBe(chartData.title);
      expect(chart.props('description')).toBe(chartData.description);
      expect(chart.props('height')).toBe(400);
      expect(chart.props('showToolbar')).toBe(true);
      expect(chart.props('showLegend')).toBe(true);
      expect(chart.props('theme')).toBe('dark');
      expect(chart.props('colors')).toEqual(['#FF6384', '#36A2EB']);
      expect(chart.props('allowChangeType')).toBe(true);
    });

    it('uses default chart type when not specified', async () => {
      const chartData = {
        type: 'chart',
        title: 'Default Chart',
        data: [10, 20, 30]
      };

      await wrapper.setProps({ jsonData: chartData });
      
      const chart = wrapper.findComponent({ name: 'AiReportChart' });
      expect(chart.exists()).toBe(true);
      expect(chart.props('type')).toBe('bar'); // Default value
    });

    it('renders OperationPanel for operation-panel type', async () => {
      const operationData = {
        type: 'operation-panel',
        title: 'System Operation',
        status: 'running',
        steps: ['Step 1', 'Step 2', 'Step 3'],
        activeStep: 1,
        screenshot: 'screenshot.png',
        highlights: ['highlight1', 'highlight2'],
        results: { success: true, message: 'Completed' },
        showActions: true,
        canRetry: true,
        canContinue: false
      };

      await wrapper.setProps({ jsonData: operationData });
      
      const operationPanel = wrapper.findComponent({ name: 'OperationPanel' });
      expect(operationPanel.exists()).toBe(true);
      expect(operationPanel.props('title')).toBe(operationData.title);
      expect(operationPanel.props('status')).toBe(operationData.status);
      expect(operationPanel.props('steps')).toEqual(operationData.steps);
      expect(operationPanel.props('activeStep')).toBe(1);
      expect(operationPanel.props('screenshot')).toBe('screenshot.png');
      expect(operationPanel.props('highlights')).toEqual(operationData.highlights);
      expect(operationPanel.props('results')).toEqual(operationData.results);
      expect(operationPanel.props('showActions')).toBe(true);
      expect(operationPanel.props('canRetry')).toBe(true);
      expect(operationPanel.props('canContinue')).toBe(false);
    });

    it('shows unknown component type for unsupported types', async () => {
      const unknownData = {
        type: 'unknown-type',
        title: 'Unknown Component',
        data: 'some data'
      };

      await wrapper.setProps({ jsonData: unknownData });
      
      expect(wrapper.find('.unknown-component').exists()).toBe(true);
      expect(wrapper.find('.unknown-header').text()).toContain('未识别的组件类型: unknown-type');
      expect(wrapper.find('.json-data').exists()).toBe(true);
    });

    it('applies default boolean props correctly', async () => {
      const todoData = {
        type: 'todo-list',
        title: 'Default Props Test',
        data: [{ id: 1, text: 'Task 1', completed: false }]
        // editable and showProgress not specified
      };

      await wrapper.setProps({ jsonData: todoData });
      
      const todoList = wrapper.findComponent({ name: 'AiTodoList' });
      expect(todoList.props('editable')).toBe(true); // Default value
      expect(todoList.props('showProgress')).toBe(true); // Default value
    });
  });

  describe('Event Handling', () => {
    it('emits component-change event when todo-list data changes', async () => {
      const todoData = {
        type: 'todo-list',
        title: 'Test Todo',
        data: [{ id: 1, text: 'Task 1', completed: false }]
      };

      await wrapper.setProps({ jsonData: todoData });
      
      const todoList = wrapper.findComponent({ name: 'AiTodoList' });
      const newData = [{ id: 1, text: 'Task 1', completed: true }];
      
      await todoList.vm.$emit('change', newData);
      
      expect(wrapper.emitted('update:jsonData')).toBeTruthy();
      expect(wrapper.emitted('component-change')).toBeTruthy();
      
      const updateCall = wrapper.emitted('update:jsonData')[0][0];
      const changeCall = wrapper.emitted('component-change')[0][0];
      
      expect(updateCall.data).toEqual(newData);
      expect(changeCall.type).toBe('todo-list');
      expect(changeCall.data).toEqual(newData);
    });

    it('emits events when chart type changes', async () => {
      const chartData = {
        type: 'chart',
        title: 'Test Chart',
        data: [10, 20, 30]
      };

      await wrapper.setProps({ jsonData: chartData });
      
      const chart = wrapper.findComponent({ name: 'AiReportChart' });
      
      await chart.vm.$emit('change-type', 'pie');
      
      expect(wrapper.emitted('update:jsonData')).toBeTruthy();
      expect(wrapper.emitted('component-change')).toBeTruthy();
      
      const updateCall = wrapper.emitted('update:jsonData')[0][0];
      const changeCall = wrapper.emitted('component-change')[0][0];
      
      expect(updateCall.chartType).toBe('pie');
      expect(changeCall.type).toBe('chart');
      expect(changeCall.chartType).toBe('pie');
    });

    it('emits retry event for operation panel', async () => {
      const operationData = {
        type: 'operation-panel',
        title: 'Test Operation',
        steps: ['Step 1'],
        activeStep: 0
      };

      await wrapper.setProps({ jsonData: operationData });
      
      const operationPanel = wrapper.findComponent({ name: 'OperationPanel' });
      
      await operationPanel.vm.$emit('retry');
      
      expect(wrapper.emitted('component-change')).toBeTruthy();
      const changeCall = wrapper.emitted('component-change')[0][0];
      
      expect(changeCall.type).toBe('operation-panel');
      expect(changeCall.action).toBe('retry');
    });

    it('emits continue event for operation panel', async () => {
      const operationData = {
        type: 'operation-panel',
        title: 'Test Operation',
        steps: ['Step 1'],
        activeStep: 0
      };

      await wrapper.setProps({ jsonData: operationData });
      
      const operationPanel = wrapper.findComponent({ name: 'OperationPanel' });
      
      await operationPanel.vm.$emit('continue');
      
      expect(wrapper.emitted('component-change')).toBeTruthy();
      const changeCall = wrapper.emitted('component-change')[0][0];
      
      expect(changeCall.type).toBe('operation-panel');
      expect(changeCall.action).toBe('continue');
    });

    it('emits close event for operation panel', async () => {
      const operationData = {
        type: 'operation-panel',
        title: 'Test Operation',
        steps: ['Step 1'],
        activeStep: 0
      };

      await wrapper.setProps({ jsonData: operationData });
      
      const operationPanel = wrapper.findComponent({ name: 'OperationPanel' });
      
      await operationPanel.vm.$emit('close');
      
      expect(wrapper.emitted('component-change')).toBeTruthy();
      const changeCall = wrapper.emitted('component-change')[0][0];
      
      expect(changeCall.type).toBe('operation-panel');
      expect(changeCall.action).toBe('close');
    });
  });

  describe('Reactivity and Updates', () => {
    it('re-renders when jsonData prop changes', async () => {
      // Initial render with todo-list
      const todoData = {
        type: 'todo-list',
        title: 'Initial Todo',
        data: [{ id: 1, text: 'Task 1', completed: false }]
      };

      await wrapper.setProps({ jsonData: todoData });
      
      expect(wrapper.findComponent({ name: 'AiTodoList' }).exists()).toBe(true);
      expect(wrapper.findComponent({ name: 'AiTodoList' }).props('title')).toBe('Initial Todo');

      // Change to chart
      const chartData = {
        type: 'chart',
        title: 'Updated Chart',
        data: [10, 20, 30]
      };

      await wrapper.setProps({ jsonData: chartData });
      
      expect(wrapper.findComponent({ name: 'AiTodoList' }).exists()).toBe(false);
      expect(wrapper.findComponent({ name: 'AiReportChart' }).exists()).toBe(true);
      expect(wrapper.findComponent({ name: 'AiReportChart' }).props('title')).toBe('Updated Chart');
    });

    it('updates component when data changes within same type', async () => {
      const initialData = {
        type: 'todo-list',
        title: 'Todo List',
        data: [{ id: 1, text: 'Task 1', completed: false }]
      };

      await wrapper.setProps({ jsonData: initialData });
      
      let todoList = wrapper.findComponent({ name: 'AiTodoList' });
      expect(todoList.props('data')).toHaveLength(1);

      const updatedData = {
        type: 'todo-list',
        title: 'Todo List Updated',
        data: [
          { id: 1, text: 'Task 1', completed: false },
          { id: 2, text: 'Task 2', completed: true }
        ]
      };

      await wrapper.setProps({ jsonData: updatedData });
      
      todoList = wrapper.findComponent({ name: 'AiTodoList' });
      expect(todoList.props('data')).toHaveLength(2);
      expect(todoList.props('title')).toBe('Todo List Updated');
    });

    it('handles rapid prop changes correctly', async () => {
      const dataSequence = [
        { type: 'todo-list', title: 'Todo 1', data: [{ id: 1, text: 'Task 1' }] },
        { type: 'chart', title: 'Chart 1', data: [10, 20] },
        { type: 'data-table', title: 'Table 1', data: [{ id: 1, name: 'Item 1' }] }
      ];

      for (const data of dataSequence) {
        await wrapper.setProps({ jsonData: data });
        await nextTick();
        
        if (data.type === 'todo-list') {
          expect(wrapper.findComponent({ name: 'AiTodoList' }).exists()).toBe(true);
        } else if (data.type === 'chart') {
          expect(wrapper.findComponent({ name: 'AiReportChart' }).exists()).toBe(true);
        } else if (data.type === 'data-table') {
          expect(wrapper.findComponent({ name: 'AiDataTable' }).exists()).toBe(true);
        }
      }
    });
  });

  describe('Error Handling', () => {
    it('handles malformed JSON gracefully', async () => {
      const malformedJsons = [
        '{"type": "todo-list", "data": [}', // Missing closing bracket
        '{type: "todo-list", data: []}', // Unquoted keys
        'not json at all',
        '{"type": "todo-list", "data": undefined}', // Undefined value
        '{"type": "todo-list", "data": null}' // Null value
      ];

      for (const malformedJson of malformedJsons) {
        await wrapper.setProps({ jsonData: malformedJson });
        
        expect(wrapper.find('.parse-error').exists()).toBe(true);
        expect(wrapper.find('.error-message').text()).toContain('解析失败');
        
        // Reset for next test
        await wrapper.setProps({ jsonData: null });
      }
    });

    it('handles circular reference objects gracefully', async () => {
      const circularObject = { type: 'todo-list' };
      circularObject.self = circularObject; // Create circular reference

      // This should be handled gracefully by the component
      await wrapper.setProps({ jsonData: circularObject });
      
      // The component should either render correctly or show an appropriate error
      const hasError = wrapper.find('.parse-error').exists();
      const hasComponent = wrapper.find('.mock-todo-list').exists();
      
      // Either error handling or successful rendering is acceptable
      expect(hasError || hasComponent).toBe(true);
    });

    it('handles very large JSON strings', async () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        text: `Task ${i}`,
        completed: i % 2 === 0
      }));

      const largeJson = JSON.stringify({
        type: 'todo-list',
        title: 'Large Todo List',
        data: largeArray
      });

      await wrapper.setProps({ jsonData: largeJson });
      
      expect(wrapper.find('.parse-error').exists()).toBe(false);
      expect(wrapper.findComponent({ name: 'AiTodoList' }).exists()).toBe(true);
    });

    it('handles special characters in JSON', async () => {
      const specialCharJson = JSON.stringify({
        type: 'todo-list',
        title: 'Special chars: 中文 🎉 "quotes" \n newlines',
        data: [{ id: 1, text: 'Task with 中文 and 🎉', completed: false }]
      });

      await wrapper.setProps({ jsonData: specialCharJson });
      
      expect(wrapper.find('.parse-error').exists()).toBe(false);
      expect(wrapper.findComponent({ name: 'AiTodoList' }).exists()).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('renders error states with proper accessibility attributes', async () => {
      await wrapper.setProps({ jsonData: 'invalid json' });
      
      const errorElement = wrapper.find('.parse-error');
      expect(errorElement.exists()).toBe(true);
      
      const errorHeader = wrapper.find('.error-header');
      expect(errorHeader.exists()).toBe(true);
      expect(errorHeader.find('i').exists()).toBe(true);
    });

    it('renders unknown component type with proper accessibility attributes', async () => {
      await wrapper.setProps({ jsonData: { type: 'unknown' } });
      
      const unknownElement = wrapper.find('.unknown-component');
      expect(unknownElement.exists()).toBe(true);
      
      const unknownHeader = wrapper.find('.unknown-header');
      expect(unknownHeader.exists()).toBe(true);
      expect(unknownHeader.find('i').exists()).toBe(true);
      expect(unknownHeader.text()).toContain('未识别的组件类型');
    });

    it('maintains proper structure for screen readers', async () => {
      const validData = {
        type: 'todo-list',
        title: 'Accessible Todo',
        data: [{ id: 1, text: 'Task 1', completed: false }]
      };

      await wrapper.setProps({ jsonData: validData });
      
      const renderer = wrapper.find('.ai-component-renderer');
      expect(renderer.exists()).toBe(true);
      expect(renderer.attributes('key')).toBeDefined(); // For re-rendering
    });
  });

  describe('Performance', () => {
    it('handles rapid component type switching', async () => {
      const types = ['todo-list', 'chart', 'data-table', 'operation-panel'];
      const startTime = performance.now();

      for (let i = 0; i < 10; i++) {
        const type = types[i % types.length];
        await wrapper.setProps({ 
          jsonData: { 
            type, 
            title: `Rapid Switch ${i}`, 
            data: [] 
          } 
        });
        await nextTick();
      }

      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (less than 1 second for 10 switches)
      expect(duration).toBeLessThan(1000);
    });

    it('efficiently handles large datasets', async () => {
      const largeDataset = Array.from({ length: 5000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        value: Math.random() * 100
      }));

      const largeData = {
        type: 'data-table',
        title: 'Large Dataset',
        data: largeDataset,
        columns: [
          { prop: 'id', label: 'ID' },
          { prop: 'name', label: 'Name' },
          { prop: 'value', label: 'Value' }
        ]
      };

      const startTime = performance.now();
      await wrapper.setProps({ jsonData: largeData });
      await nextTick();
      const endTime = performance.now();

      expect(wrapper.find('.parse-error').exists()).toBe(false);
      expect(wrapper.findComponent({ name: 'AiDataTable' }).exists()).toBe(true);
      
      // Parsing and rendering should be reasonably fast
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(500); // Less than 500ms
    });
  });

  describe('Edge Cases', () => {
    it('handles null and undefined props correctly', async () => {
      await wrapper.setProps({ jsonData: null });
      expect(wrapper.find('.parse-error').exists()).toBe(true);
      expect(wrapper.find('.error-message').text()).toBe('无数据');

      await wrapper.setProps({ jsonData: undefined });
      expect(wrapper.find('.parse-error').exists()).toBe(true);
      expect(wrapper.find('.error-message').text()).toBe('无数据');
    });

    it('handles empty object', async () => {
      await wrapper.setProps({ jsonData: {} });
      
      expect(wrapper.find('.unknown-component').exists()).toBe(true);
      expect(wrapper.find('.unknown-header').text()).toContain('未识别的组件类型: undefined');
    });

    it('handles object without type property', async () => {
      await wrapper.setProps({ jsonData: { title: 'No Type', data: [] } });
      
      expect(wrapper.find('.unknown-component').exists()).toBe(true);
      expect(wrapper.find('.unknown-header').text()).toContain('未识别的组件类型: undefined');
    });

    it('handles nested JSON structures', async () => {
      const nestedData = {
        type: 'todo-list',
        title: 'Nested Data',
        data: [
          {
            id: 1,
            text: 'Complex Task',
            metadata: {
              priority: 'high',
              tags: ['urgent', 'important'],
              subtasks: [
                { id: 1, text: 'Subtask 1', completed: false },
                { id: 2, text: 'Subtask 2', completed: true }
              ]
            },
            completed: false
          }
        ]
      };

      await wrapper.setProps({ jsonData: nestedData });
      
      expect(wrapper.find('.parse-error').exists()).toBe(false);
      expect(wrapper.findComponent({ name: 'AiTodoList' }).exists()).toBe(true);
    });

    it('handles JSON with escaped characters', async () => {
      const escapedJson = JSON.stringify({
        type: 'todo-list',
        title: 'Escaped "Quotes" and \\Backslashes\\',
        data: [{ id: 1, text: 'Task with "quotes" and \\backslashes\\', completed: false }]
      });

      await wrapper.setProps({ jsonData: escapedJson });
      
      expect(wrapper.find('.parse-error').exists()).toBe(false);
      expect(wrapper.findComponent({ name: 'AiTodoList' }).exists()).toBe(true);
    });
  });
});