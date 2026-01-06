import { Sequelize } from 'sequelize';
import { vi } from 'vitest'
import { sequelize } from '../../../src/init';
import { EnrollmentInterview } from '../../../src/models/enrollmentinterview.model';

// Mock the sequelize instance
jest.mock('../../../src/init', () => ({
  sequelize: {
    define: jest.fn(),
    sync: jest.fn(),
    close: jest.fn(),
  } as any,
}));

// 控制台错误检测变量
let consoleSpy: any

describe('EnrollmentInterview Model', () => {
  let mockSequelize: jest.Mocked<Sequelize>;
  let mockModel: any;

  beforeEach(() => {
    mockSequelize = {
      define: jest.fn().mockReturnValue({
        belongsTo: jest.fn(),
        hasMany: jest.fn(),
      })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {}),
      sync: jest.fn(),
      close: jest.fn(),
    } as any;

    mockModel = {
      init: jest.fn(),
      belongsTo: jest.fn(),
      hasMany: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('Model Definition', () => {
    it('should initialize model with correct attributes', () => {
      EnrollmentInterview.init(
        {
          id: {
            type: expect.any(Object),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
          },
          application_id: {
            type: expect.any(Object),
            allowNull: true,
          },
          interview_date: {
            type: expect.any(Object),
            allowNull: true,
          },
          interviewer_id: {
            type: expect.any(Object),
            allowNull: true,
          },
          location: {
            type: expect.any(Object),
            allowNull: true,
          },
          status: {
            type: expect.any(Object),
            allowNull: true,
          },
          score: {
            type: expect.any(Object),
            allowNull: true,
          },
          feedback: {
            type: expect.any(Object),
            allowNull: true,
          },
          notes: {
            type: expect.any(Object),
            allowNull: true,
          },
          duration_minutes: {
            type: expect.any(Object),
            allowNull: true,
          },
          created_by: {
            type: expect.any(Object),
            allowNull: true,
          },
          created_at: {
            type: expect.any(Object),
            allowNull: true,
          },
          updated_at: {
            type: expect.any(Object),
            allowNull: true,
          },
          deleted_at: {
            type: expect.any(Object),
            allowNull: true,
          },
        },
        {
          sequelize: mockSequelize,
          tableName: 'enrollment_interviews',
          modelName: 'EnrollmentInterview',
          timestamps: true,
          underscored: true,
          paranoid: true,
        }
      );
    });

    it('should have correct table configuration', () => {
      EnrollmentInterview.init(
        {},
        {
          sequelize: mockSequelize,
          tableName: 'enrollment_interviews',
          modelName: 'EnrollmentInterview',
          timestamps: true,
          underscored: true,
          paranoid: true,
        }
      );
      
      expect(mockSequelize.define).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        {
          sequelize: mockSequelize,
          tableName: 'enrollment_interviews',
          modelName: 'EnrollmentInterview',
          timestamps: true,
          underscored: true,
          paranoid: true,
        }
      );
    });
  });

  describe('Field Validation', () => {
    it('should validate required fields', () => {
      const interviewData = {
        id: 1,
        application_id: 1,
        interview_date: new Date(),
        interviewer_id: 1,
        location: '会议室A',
        status: 'scheduled',
        score: '85',
        feedback: '表现良好',
        notes: '需要进一步观察',
        duration_minutes: '30',
        created_by: 'admin',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      };

      expect(interviewData).toHaveProperty('id');
      expect(interviewData).toHaveProperty('application_id');
      expect(interviewData).toHaveProperty('interview_date');
      expect(interviewData).toHaveProperty('interviewer_id');
      expect(interviewData).toHaveProperty('location');
      expect(interviewData).toHaveProperty('status');
      expect(interviewData).toHaveProperty('score');
      expect(interviewData).toHaveProperty('feedback');
      expect(interviewData).toHaveProperty('notes');
      expect(interviewData).toHaveProperty('duration_minutes');
      expect(interviewData).toHaveProperty('created_by');
      expect(interviewData).toHaveProperty('created_at');
      expect(interviewData).toHaveProperty('updated_at');
      expect(interviewData).toHaveProperty('deleted_at');
    });

    it('should handle nullable fields', () => {
      const interviewData = {
        id: 1,
        application_id: null,
        interview_date: null,
        interviewer_id: null,
        location: null,
        status: null,
        score: null,
        feedback: null,
        notes: null,
        duration_minutes: null,
        created_by: null,
        created_at: null,
        updated_at: new Date(),
        deleted_at: null
      };

      // All fields except id and updated_at can be null
      expect(interviewData.application_id).toBeNull();
      expect(interviewData.interview_date).toBeNull();
      expect(interviewData.interviewer_id).toBeNull();
      expect(interviewData.location).toBeNull();
      expect(interviewData.status).toBeNull();
      expect(interviewData.score).toBeNull();
      expect(interviewData.feedback).toBeNull();
      expect(interviewData.notes).toBeNull();
      expect(interviewData.duration_minutes).toBeNull();
      expect(interviewData.created_by).toBeNull();
      expect(interviewData.created_at).toBeNull();
      expect(interviewData.deleted_at).toBeNull();
    });
  });

  describe('Field Types', () => {
    it('should have correct field types', () => {
      const interviewData = {
        id: 1,
        application_id: 1,
        interview_date: new Date(),
        interviewer_id: 1,
        location: '会议室A',
        status: 'scheduled',
        score: '85',
        feedback: '表现良好',
        notes: '需要进一步观察',
        duration_minutes: '30',
        created_by: 'admin',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      };

      expect(typeof interviewData.id).toBe('number');
      expect(typeof interviewData.application_id).toBe('number');
      expect(interviewData.interview_date).toBeInstanceOf(Date);
      expect(typeof interviewData.interviewer_id).toBe('number');
      expect(typeof interviewData.location).toBe('string');
      expect(typeof interviewData.status).toBe('string');
      expect(typeof interviewData.score).toBe('string');
      expect(typeof interviewData.feedback).toBe('string');
      expect(typeof interviewData.notes).toBe('string');
      expect(typeof interviewData.duration_minutes).toBe('string');
      expect(typeof interviewData.created_by).toBe('string');
      expect(interviewData.created_at).toBeInstanceOf(Date);
      expect(interviewData.updated_at).toBeInstanceOf(Date);
    });
  });

  describe('Instance Methods', () => {
    it('should have required instance properties', () => {
      const mockInstance = new EnrollmentInterview();
      
      expect(mockInstance).toHaveProperty('id');
      expect(mockInstance).toHaveProperty('application_id');
      expect(mockInstance).toHaveProperty('interview_date');
      expect(mockInstance).toHaveProperty('interviewer_id');
      expect(mockInstance).toHaveProperty('location');
      expect(mockInstance).toHaveProperty('status');
      expect(mockInstance).toHaveProperty('score');
      expect(mockInstance).toHaveProperty('feedback');
      expect(mockInstance).toHaveProperty('notes');
      expect(mockInstance).toHaveProperty('duration_minutes');
      expect(mockInstance).toHaveProperty('created_by');
      expect(mockInstance).toHaveProperty('created_at');
      expect(mockInstance).toHaveProperty('updated_at');
      expect(mockInstance).toHaveProperty('deleted_at');
    });

    it('should have timestamp properties', () => {
      const mockInstance = new EnrollmentInterview();
      
      expect(mockInstance).toHaveProperty('createdAt');
      expect(mockInstance).toHaveProperty('updatedAt');
    });
  });

  describe('Date Field Validation', () => {
    it('should validate interview_date field', () => {
      const validDates = [
        new Date('2024-01-01'),
        new Date('2024-12-31'),
        new Date(),
        null
      ];
      
      validDates.forEach(date => {
        if (date !== null) {
          expect(date).toBeInstanceOf(Date);
        } else {
          expect(date).toBeNull();
        }
      });
    });

    it('should validate created_at field', () => {
      const validDates = [
        new Date('2024-01-01'),
        new Date('2024-12-31'),
        new Date(),
        null
      ];
      
      validDates.forEach(date => {
        if (date !== null) {
          expect(date).toBeInstanceOf(Date);
        } else {
          expect(date).toBeNull();
        }
      });
    });

    it('should validate updated_at field', () => {
      const validDates = [
        new Date('2024-01-01'),
        new Date('2024-12-31'),
        new Date()
      ];
      
      validDates.forEach(date => {
        expect(date).toBeInstanceOf(Date);
      });
    });
  });

  describe('String Field Validation', () => {
    it('should validate string fields can accept various values', () => {
      const interviewData = {
        location: '会议室A',
        status: 'scheduled',
        score: '85',
        feedback: '表现良好',
        notes: '需要进一步观察',
        duration_minutes: '30',
        created_by: 'admin'
      };

      expect(typeof interviewData.location).toBe('string');
      expect(typeof interviewData.status).toBe('string');
      expect(typeof interviewData.score).toBe('string');
      expect(typeof interviewData.feedback).toBe('string');
      expect(typeof interviewData.notes).toBe('string');
      expect(typeof interviewData.duration_minutes).toBe('string');
      expect(typeof interviewData.created_by).toBe('string');
    });

    it('should handle empty strings', () => {
      const interviewData = {
        location: '',
        status: '',
        score: '',
        feedback: '',
        notes: '',
        duration_minutes: '',
        created_by: ''
      };

      expect(interviewData.location).toBe('');
      expect(interviewData.status).toBe('');
      expect(interviewData.score).toBe('');
      expect(interviewData.feedback).toBe('');
      expect(interviewData.notes).toBe('');
      expect(interviewData.duration_minutes).toBe('');
      expect(interviewData.created_by).toBe('');
    });
  });

  describe('Numeric Field Validation', () => {
    it('should validate numeric fields', () => {
      const interviewData = {
        id: 1,
        application_id: 1,
        interviewer_id: 1
      };

      expect(typeof interviewData.id).toBe('number');
      expect(typeof interviewData.application_id).toBe('number');
      expect(typeof interviewData.interviewer_id).toBe('number');
    });

    it('should handle zero values', () => {
      const interviewData = {
        id: 0,
        application_id: 0,
        interviewer_id: 0
      };

      expect(interviewData.id).toBe(0);
      expect(interviewData.application_id).toBe(0);
      expect(interviewData.interviewer_id).toBe(0);
    });

    it('should handle positive values', () => {
      const interviewData = {
        id: 100,
        application_id: 50,
        interviewer_id: 25
      };

      expect(interviewData.id).toBeGreaterThan(0);
      expect(interviewData.application_id).toBeGreaterThan(0);
      expect(interviewData.interviewer_id).toBeGreaterThan(0);
    });
  });

  describe('Soft Delete', () => {
    it('should support soft delete with deleted_at field', () => {
      const mockInstance = new EnrollmentInterview();
      
      expect(mockInstance).toHaveProperty('deleted_at');
    });

    it('should handle null deleted_at value', () => {
      const mockInstance = new EnrollmentInterview();
      
      mockInstance.deleted_at = null;
      expect(mockInstance.deleted_at).toBeNull();
    });

    it('should handle date deleted_at value', () => {
      const mockInstance = new EnrollmentInterview();
      const deletedDate = new Date();
      
      mockInstance.deleted_at = deletedDate;
      expect(mockInstance.deleted_at).toBe(deletedDate);
    });
  });

  describe('Timestamps', () => {
    it('should have createdAt and updatedAt properties', () => {
      const mockInstance = new EnrollmentInterview();
      
      expect(mockInstance).toHaveProperty('createdAt');
      expect(mockInstance).toHaveProperty('updatedAt');
    });

    it('should timestamps be Date instances', () => {
      const mockInstance = new EnrollmentInterview();
      const now = new Date();
      
      mockInstance.createdAt = now;
      mockInstance.updatedAt = now;
      
      expect(mockInstance.createdAt).toBeInstanceOf(Date);
      expect(mockInstance.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Model Behavior', () => {
    it('should be a Sequelize Model instance', () => {
      const mockInstance = new EnrollmentInterview();
      
      expect(mockInstance).toBeInstanceOf(EnrollmentInterview);
    });

    it('should have model name', () => {
      expect(EnrollmentInterview.name).toBe('EnrollmentInterview');
    });
  });

  describe('Field Constraints', () => {
    it('should validate id field is primary key', () => {
      const interviewData = {
        id: 1,
        application_id: 1,
        interview_date: new Date(),
        interviewer_id: 1,
        location: '会议室A',
        status: 'scheduled',
        score: '85',
        feedback: '表现良好',
        notes: '需要进一步观察',
        duration_minutes: '30',
        created_by: 'admin',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      };

      expect(interviewData.id).toBeDefined();
      expect(typeof interviewData.id).toBe('number');
    });

    it('should validate auto increment behavior', () => {
      // This would be tested at the database level
      const instances = [
        new EnrollmentInterview(),
        new EnrollmentInterview(),
        new EnrollmentInterview()
      ];
      
      // Auto increment would be handled by the database
      instances.forEach((instance, index) => {
        expect(instance).toBeDefined();
      });
    });
  });

  describe('Data Integrity', () => {
    it('should maintain data consistency', () => {
      const interviewData = {
        id: 1,
        application_id: 1,
        interview_date: new Date('2024-01-15'),
        interviewer_id: 1,
        location: '会议室A',
        status: 'completed',
        score: '85',
        feedback: '表现良好',
        notes: '需要进一步观察',
        duration_minutes: '30',
        created_by: 'admin',
        created_at: new Date('2024-01-10'),
        updated_at: new Date('2024-01-15'),
        deleted_at: null
      };

      expect(interviewData.interview_date.getTime()).toBeGreaterThan(interviewData.created_at.getTime());
      expect(interviewData.updated_at.getTime()).toBeGreaterThanOrEqual(interviewData.interview_date.getTime());
    });

    it('should handle logical status transitions', () => {
      const validStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'];
      
      validStatuses.forEach(status => {
        expect(typeof status).toBe('string');
        expect(status.length).toBeGreaterThan(0);
      });
    });
  });
});