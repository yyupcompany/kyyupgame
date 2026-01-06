import { DATABASE_SCHEMA } from '../../../src/utils/database-schema';
import { vi } from 'vitest'


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

describe('Database Schema', () => {
  describe('Schema Structure', () => {
    it('应该包含admin角色的表结构', () => {
      expect(DATABASE_SCHEMA).toHaveProperty('admin');
      expect(DATABASE_SCHEMA.admin).toHaveProperty('tables');
    });

    it('应该包含activities表结构', () => {
      const activities = DATABASE_SCHEMA.admin.tables.activities;
      
      expect(activities).toBeDefined();
      expect(activities).toHaveProperty('description');
      expect(activities).toHaveProperty('fields');
      expect(activities).toHaveProperty('relationships');
      
      expect(activities.description).toBe('活动表');
    });

    it('应该包含activity_registrations表结构', () => {
      const registrations = DATABASE_SCHEMA.admin.tables.activity_registrations;
      
      expect(registrations).toBeDefined();
      expect(registrations).toHaveProperty('description');
      expect(registrations).toHaveProperty('fields');
      
      expect(registrations.description).toBe('活动报名表');
    });

    it('应该包含students表结构', () => {
      const students = DATABASE_SCHEMA.admin.tables.students;
      
      expect(students).toBeDefined();
      expect(students).toHaveProperty('description');
      expect(students).toHaveProperty('fields');
      
      expect(students.description).toBe('学生信息表');
    });
  });

  describe('Activities Table Fields', () => {
    const activities = DATABASE_SCHEMA.admin.tables.activities;

    it('应该包含所有必需的字段', () => {
      const requiredFields = [
        'id', 'title', 'type', 'description', 'start_time', 'end_time',
        'location', 'max_participants', 'current_participants', 'fee',
        'status', 'satisfaction_score', 'budget', 'user_id',
        'created_at', 'updated_at'
      ];

      requiredFields.forEach(field => {
        expect(activities.fields).toHaveProperty(field);
      });
    });

    it('应该包含正确的字段类型信息', () => {
      expect(activities.fields.id).toContain('int');
      expect(activities.fields.title).toContain('varchar');
      expect(activities.fields.type).toContain('tinyint');
      expect(activities.fields.description).toContain('text');
      expect(activities.fields.start_time).toContain('datetime');
      expect(activities.fields.end_time).toContain('datetime');
      expect(activities.fields.fee).toContain('decimal');
      expect(activities.fields.status).toContain('enum');
      expect(activities.fields.created_at).toContain('timestamp');
    });

    it('应该包含字段描述信息', () => {
      expect(activities.fields.id).toContain('活动ID');
      expect(activities.fields.title).toContain('活动标题');
      expect(activities.fields.location).toContain('活动地点');
      expect(activities.fields.max_participants).toContain('最大参与人数');
      expect(activities.fields.satisfaction_score).toContain('满意度评分');
    });

    it('应该包含枚举值信息', () => {
      expect(activities.fields.status).toContain('draft');
      expect(activities.fields.status).toContain('published');
      expect(activities.fields.status).toContain('ongoing');
      expect(activities.fields.status).toContain('completed');
      expect(activities.fields.status).toContain('cancelled');
    });

    it('应该包含活动类型信息', () => {
      expect(activities.fields.type).toContain('1:教育');
      expect(activities.fields.type).toContain('2:娱乐');
      expect(activities.fields.type).toContain('3:文体');
      expect(activities.fields.type).toContain('4:社交');
      expect(activities.fields.type).toContain('5:节日');
      expect(activities.fields.type).toContain('6:科学');
    });
  });

  describe('Activities Table Relationships', () => {
    const activities = DATABASE_SCHEMA.admin.tables.activities;

    it('应该包含关系信息', () => {
      expect(activities.relationships).toBeDefined();
      expect(Array.isArray(activities.relationships)).toBe(true);
      expect(activities.relationships.length).toBeGreaterThan(0);
    });

    it('应该包含与activity_registrations的关系', () => {
      const hasRegistrationRelation = activities.relationships.some(rel =>
        rel.includes('activity_registrations') && rel.includes('activity_id')
      );
      expect(hasRegistrationRelation).toBe(true);
    });

    it('应该包含与activity_evaluations的关系', () => {
      const hasEvaluationRelation = activities.relationships.some(rel =>
        rel.includes('activity_evaluations') && rel.includes('activity_id')
      );
      expect(hasEvaluationRelation).toBe(true);
    });

    it('应该包含与users的关系', () => {
      const hasUserRelation = activities.relationships.some(rel =>
        rel.includes('users') && rel.includes('user_id')
      );
      expect(hasUserRelation).toBe(true);
    });
  });

  describe('Activity Registrations Table Fields', () => {
    const registrations = DATABASE_SCHEMA.admin.tables.activity_registrations;

    it('应该包含所有必需的字段', () => {
      const requiredFields = [
        'id', 'activity_id', 'user_id', 'student_id', 'status',
        'registration_time', 'payment_status', 'notes'
      ];

      requiredFields.forEach(field => {
        expect(registrations.fields).toHaveProperty(field);
      });
    });

    it('应该包含正确的字段类型信息', () => {
      expect(registrations.fields.id).toContain('int');
      expect(registrations.fields.activity_id).toContain('int');
      expect(registrations.fields.user_id).toContain('int');
      expect(registrations.fields.student_id).toContain('int');
      expect(registrations.fields.status).toContain('enum');
      expect(registrations.fields.registration_time).toContain('timestamp');
      expect(registrations.fields.payment_status).toContain('enum');
      expect(registrations.fields.notes).toContain('text');
    });

    it('应该包含状态枚举值', () => {
      expect(registrations.fields.status).toContain('pending');
      expect(registrations.fields.status).toContain('confirmed');
      expect(registrations.fields.status).toContain('cancelled');
    });

    it('应该包含支付状态枚举值', () => {
      expect(registrations.fields.payment_status).toContain('unpaid');
      expect(registrations.fields.payment_status).toContain('paid');
      expect(registrations.fields.payment_status).toContain('refunded');
    });
  });

  describe('Students Table Fields', () => {
    const students = DATABASE_SCHEMA.admin.tables.students;

    it('应该包含基本字段', () => {
      expect(students.fields).toHaveProperty('id');
      expect(students.fields.id).toContain('int');
      expect(students.fields.id).toContain('学生ID');
    });

    it('应该包含字段描述', () => {
      Object.values(students.fields).forEach(fieldInfo => {
        expect(typeof fieldInfo).toBe('string');
        expect(fieldInfo.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Schema Validation', () => {
    it('所有表都应该有description字段', () => {
      const tables = DATABASE_SCHEMA.admin.tables;
      
      Object.keys(tables).forEach(tableName => {
        expect(tables[tableName]).toHaveProperty('description');
        expect(typeof tables[tableName].description).toBe('string');
        expect(tables[tableName].description.length).toBeGreaterThan(0);
      });
    });

    it('所有表都应该有fields字段', () => {
      const tables = DATABASE_SCHEMA.admin.tables;
      
      Object.keys(tables).forEach(tableName => {
        expect(tables[tableName]).toHaveProperty('fields');
        expect(typeof tables[tableName].fields).toBe('object');
        expect(Object.keys(tables[tableName].fields).length).toBeGreaterThan(0);
      });
    });

    it('所有字段都应该有类型和描述信息', () => {
      const tables = DATABASE_SCHEMA.admin.tables;
      
      Object.keys(tables).forEach(tableName => {
        const fields = tables[tableName].fields;
        
        Object.keys(fields).forEach(fieldName => {
          const fieldInfo = fields[fieldName];
          expect(typeof fieldInfo).toBe('string');
          expect(fieldInfo).toMatch(/\w+\s*-\s*.+/); // 格式: "type - description"
        });
      });
    });

    it('包含关系信息的表应该有relationships字段', () => {
      const activities = DATABASE_SCHEMA.admin.tables.activities;
      
      expect(activities).toHaveProperty('relationships');
      expect(Array.isArray(activities.relationships)).toBe(true);
    });
  });

  describe('Schema Completeness', () => {
    it('应该包含足够的表结构信息', () => {
      const tables = DATABASE_SCHEMA.admin.tables;
      const tableNames = Object.keys(tables);
      
      expect(tableNames.length).toBeGreaterThan(2);
      expect(tableNames).toContain('activities');
      expect(tableNames).toContain('activity_registrations');
      expect(tableNames).toContain('students');
    });

    it('每个表都应该有合理数量的字段', () => {
      const tables = DATABASE_SCHEMA.admin.tables;
      
      Object.keys(tables).forEach(tableName => {
        const fieldCount = Object.keys(tables[tableName].fields).length;
        expect(fieldCount).toBeGreaterThan(0);
        expect(fieldCount).toBeLessThan(50); // 合理的字段数量上限
      });
    });
  });

  describe('Field Type Validation', () => {
    it('应该包含常见的数据库字段类型', () => {
      const tables = DATABASE_SCHEMA.admin.tables;
      const allFields = [];
      
      Object.keys(tables).forEach(tableName => {
        Object.values(tables[tableName].fields).forEach(fieldInfo => {
          allFields.push(fieldInfo);
        });
      });
      
      const fieldTypes = allFields.join(' ');
      
      expect(fieldTypes).toContain('int');
      expect(fieldTypes).toContain('varchar');
      expect(fieldTypes).toContain('text');
      expect(fieldTypes).toContain('datetime');
      expect(fieldTypes).toContain('timestamp');
      expect(fieldTypes).toContain('decimal');
      expect(fieldTypes).toContain('enum');
    });
  });
});
