import { Todo, TodoPriority, TodoStatus } from '../../../src/models/todo.model';
import { vi } from 'vitest'
import { User } from '../../../src/models/user.model';
import { sequelize } from '../../../src/config/database';

// Mock User model
jest.mock('../../../src/models/user.model', () => ({
  User: {
    belongsTo: jest.fn(),
  },
}));


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

describe('Todo Model', () => {
  beforeAll(async () => {
    // Initialize the Todo model
    Todo.initModel(sequelize);
    Todo.initAssociations();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Model Definition', () => {
    it('should have correct model name', () => {
      expect(Todo.tableName).toBe('todos');
    });

    it('should have correct attributes', () => {
      const attributes = Todo.getAttributes();
      
      expect(attributes.id).toBeDefined();
      expect(attributes.id.primaryKey).toBe(true);
      expect(attributes.id.autoIncrement).toBe(true);
      
      expect(attributes.title).toBeDefined();
      expect(attributes.title.allowNull).toBe(false);
      
      expect(attributes.description).toBeDefined();
      expect(attributes.description.allowNull).toBe(true);
      
      expect(attributes.priority).toBeDefined();
      expect(attributes.priority.allowNull).toBe(false);
      expect(attributes.priority.defaultValue).toBe(TodoPriority.MEDIUM);
      
      expect(attributes.status).toBeDefined();
      expect(attributes.status.allowNull).toBe(false);
      expect(attributes.status.defaultValue).toBe(TodoStatus.PENDING);
      
      expect(attributes.userId).toBeDefined();
      expect(attributes.userId.allowNull).toBe(false);
      
      expect(attributes.assignedTo).toBeDefined();
      expect(attributes.assignedTo.allowNull).toBe(true);
      
      expect(attributes.notify).toBeDefined();
      expect(attributes.notify.allowNull).toBe(false);
      expect(attributes.notify.defaultValue).toBe(false);
    });
  });

  describe('Model Options', () => {
    it('should have correct table configuration', () => {
      expect(Todo.options.tableName).toBe('todos');
      expect(Todo.options.timestamps).toBe(true);
      expect(Todo.options.paranoid).toBe(true);
      expect(Todo.options.underscored).toBe(true);
    });
  });

  describe('Enum Values', () => {
    it('should have correct TodoPriority enum values', () => {
      expect(TodoPriority.HIGHEST).toBe(1);
      expect(TodoPriority.HIGH).toBe(2);
      expect(TodoPriority.MEDIUM).toBe(3);
      expect(TodoPriority.LOW).toBe(4);
      expect(TodoPriority.LOWEST).toBe(5);
    });

    it('should have correct TodoStatus enum values', () => {
      expect(TodoStatus.PENDING).toBe('pending');
      expect(TodoStatus.IN_PROGRESS).toBe('in_progress');
      expect(TodoStatus.COMPLETED).toBe('completed');
      expect(TodoStatus.CANCELLED).toBe('cancelled');
      expect(TodoStatus.OVERDUE).toBe('overdue');
    });
  });

  describe('Model Associations', () => {
    it('should belong to user', () => {
      expect(User.belongsTo).toHaveBeenCalledWith(Todo, {
        foreignKey: 'userId',
        as: 'user'
      });
    });

    it('should belong to assignee', () => {
      expect(User.belongsTo).toHaveBeenCalledWith(Todo, {
        foreignKey: 'assignedTo',
        as: 'assignee'
      });
    });
  });

  describe('Static Methods', () => {
    describe('cleanUndefinedValues', () => {
      it('should convert undefined values to null', () => {
        const testData = {
          title: 'Test Todo',
          description: undefined,
          priority: 1,
          tags: ['tag1', 'tag2'],
          dueDate: undefined,
        };

        const cleanedData = Todo.cleanUndefinedValues(testData);

        expect(cleanedData.title).toBe('Test Todo');
        expect(cleanedData.description).toBe(null);
        expect(cleanedData.priority).toBe(1);
        expect(cleanedData.tags).toEqual(['tag1', 'tag2']);
        expect(cleanedData.dueDate).toBe(null);
      });

      it('should not modify defined values', () => {
        const testData = {
          title: 'Test Todo',
          description: 'Test Description',
          priority: 2,
          status: 'pending',
        };

        const cleanedData = Todo.cleanUndefinedValues(testData);

        expect(cleanedData.title).toBe('Test Todo');
        expect(cleanedData.description).toBe('Test Description');
        expect(cleanedData.priority).toBe(2);
        expect(cleanedData.status).toBe('pending');
      });

      it('should handle empty objects', () => {
        const testData = {};
        const cleanedData = Todo.cleanUndefinedValues(testData);
        expect(cleanedData).toEqual({});
      });
    });
  });

  describe('Model Validation', () => {
    it('should validate required fields', async () => {
      const todo = Todo.build({
        title: 'Test Todo',
        userId: 1,
      });

      const validationErrors = await todo.validate();
      expect(validationErrors).toBeUndefined();
    });

    it('should fail validation without required fields', async () => {
      const todo = Todo.build({});

      await expect(todo.validate()).rejects.toThrow();
    });

    it('should validate priority field', async () => {
      const todo = Todo.build({
        title: 'Test Todo',
        userId: 1,
        priority: TodoPriority.HIGH,
      });

      const validationErrors = await todo.validate();
      expect(validationErrors).toBeUndefined();
    });

    it('should validate status field', async () => {
      const todo = Todo.build({
        title: 'Test Todo',
        userId: 1,
        status: TodoStatus.IN_PROGRESS,
      });

      const validationErrors = await todo.validate();
      expect(validationErrors).toBeUndefined();
    });

    it('should validate tags as JSON field', async () => {
      const todo = Todo.build({
        title: 'Test Todo',
        userId: 1,
        tags: ['urgent', 'important'],
      });

      const validationErrors = await todo.validate();
      expect(validationErrors).toBeUndefined();
    });
  });

  describe('Model Instance Methods', () => {
    it('should create instance with correct attributes', () => {
      const todoData = {
        title: 'Test Todo',
        description: 'Test Description',
        priority: TodoPriority.HIGH,
        status: TodoStatus.IN_PROGRESS,
        userId: 1,
        assignedTo: 2,
        tags: ['test'],
        notify: true,
      };

      const todo = Todo.build(todoData);

      expect(todo.title).toBe('Test Todo');
      expect(todo.description).toBe('Test Description');
      expect(todo.priority).toBe(TodoPriority.HIGH);
      expect(todo.status).toBe(TodoStatus.IN_PROGRESS);
      expect(todo.userId).toBe(1);
      expect(todo.assignedTo).toBe(2);
      expect(todo.tags).toEqual(['test']);
      expect(todo.notify).toBe(true);
    });
  });

  describe('Timestamps', () => {
    it('should have createdAt and updatedAt', () => {
      const todo = Todo.build({
        title: 'Test Todo',
        userId: 1,
      });

      expect(todo.createdAt).toBeDefined();
      expect(todo.updatedAt).toBeDefined();
    });
  });

  describe('Soft Delete', () => {
    it('should support soft delete with deletedAt', () => {
      const todo = Todo.build({
        title: 'Test Todo',
        userId: 1,
      });

      expect(todo.deletedAt).toBeDefined();
      expect(todo.deletedAt).toBeNull();
    });
  });
});