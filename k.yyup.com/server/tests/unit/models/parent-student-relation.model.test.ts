import { Sequelize } from 'sequelize';
import { vi } from 'vitest'
import { 
  ParentStudentRelation, 
  initParentStudentRelation, 
  initParentStudentRelationAssociations 
} from '../../../src/models/parent-student-relation.model';
import { User } from '../../../src/models/user.model';
import { Student } from '../../../src/models/student.model';


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

describe('ParentStudentRelation Model', () => {
  let sequelize: Sequelize;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    // Initialize related models
    User.initModel(sequelize);
    Student.initModel(sequelize);
    initParentStudentRelation(sequelize);
    
    // Initialize associations
    initParentStudentRelationAssociations();
    
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await ParentStudentRelation.destroy({ where: {} });
    await User.destroy({ where: {} });
    await Student.destroy({ where: {} });
  });

  describe('Model Definition', () => {
    it('should have correct model name', () => {
      expect(ParentStudentRelation.tableName).toBe('parent_student_relations');
    });

    it('should have correct attributes', () => {
      const attributes = Object.keys(ParentStudentRelation.getAttributes());
      expect(attributes).toContain('id');
      expect(attributes).toContain('userId');
      expect(attributes).toContain('studentId');
      expect(attributes).toContain('relationship');
      expect(attributes).toContain('isPrimaryContact');
      expect(attributes).toContain('isLegalGuardian');
      expect(attributes).toContain('idCardNo');
      expect(attributes).toContain('workUnit');
      expect(attributes).toContain('occupation');
      expect(attributes).toContain('education');
      expect(attributes).toContain('address');
      expect(attributes).toContain('remark');
      expect(attributes).toContain('creatorId');
      expect(attributes).toContain('updaterId');
    });
  });

  describe('Field Validation', () => {
    it('should require userId', async () => {
      const relation = ParentStudentRelation.build({
        studentId: 1,
        relationship: 'father',
      } as any);

      await expect(relation.save()).rejects.toThrow();
    });

    it('should require studentId', async () => {
      const relation = ParentStudentRelation.build({
        userId: 1,
        relationship: 'father',
      } as any);

      await expect(relation.save()).rejects.toThrow();
    });

    it('should require relationship', async () => {
      const relation = ParentStudentRelation.build({
        userId: 1,
        studentId: 1,
      } as any);

      await expect(relation.save()).rejects.toThrow();
    });

    it('should create ParentStudentRelation with valid data', async () => {
      const user = await User.create({
        username: 'parent',
        email: 'parent@test.com',
        password: 'password123',
        role: 'parent',
      });

      const student = await Student.create({
        name: 'Test Student',
        studentId: 'STU001',
        classId: 1,
      });

      const creator = await User.create({
        username: 'creator',
        email: 'creator@test.com',
        password: 'password123',
        role: 'admin' as any,
      });

      const relation = await ParentStudentRelation.create({
        userId: user.id,
        studentId: student.id,
        relationship: 'father',
        isPrimaryContact: 1,
        isLegalGuardian: 1,
        idCardNo: '123456789012345678',
        workUnit: 'Test Company',
        occupation: 'Engineer',
        education: 'Bachelor',
        address: 'Test Address 123',
        remark: 'Test remark',
        creatorId: creator.id,
        updaterId: creator.id,
      });

      expect(relation.id).toBeDefined();
      expect(relation.userId).toBe(user.id);
      expect(relation.studentId).toBe(student.id);
      expect(relation.relationship).toBe('father');
      expect(relation.isPrimaryContact).toBe(1);
      expect(relation.isLegalGuardian).toBe(1);
      expect(relation.idCardNo).toBe('123456789012345678');
      expect(relation.workUnit).toBe('Test Company');
      expect(relation.occupation).toBe('Engineer');
      expect(relation.education).toBe('Bachelor');
      expect(relation.address).toBe('Test Address 123');
      expect(relation.remark).toBe('Test remark');
      expect(relation.creatorId).toBe(creator.id);
      expect(relation.updaterId).toBe(creator.id);
    });

    it('should create ParentStudentRelation with minimal data', async () => {
      const user = await User.create({
        username: 'parent',
        email: 'parent@test.com',
        password: 'password123',
        role: 'parent',
      });

      const student = await Student.create({
        name: 'Test Student',
        studentId: 'STU001',
        classId: 1,
      });

      const relation = await ParentStudentRelation.create({
        userId: user.id,
        studentId: student.id,
        relationship: 'mother',
      });

      expect(relation.id).toBeDefined();
      expect(relation.userId).toBe(user.id);
      expect(relation.studentId).toBe(student.id);
      expect(relation.relationship).toBe('mother');
      expect(relation.isPrimaryContact).toBe(0);
      expect(relation.isLegalGuardian).toBe(0);
      expect(relation.idCardNo).toBeNull();
      expect(relation.workUnit).toBeNull();
      expect(relation.occupation).toBeNull();
      expect(relation.education).toBeNull();
      expect(relation.address).toBeNull();
      expect(relation.remark).toBeNull();
      expect(relation.creatorId).toBeNull();
      expect(relation.updaterId).toBeNull();
    });
  });

  describe('Data Types', () => {
    it('should handle relationship values', async () => {
      const user = await User.create({
        username: 'parent',
        email: 'parent@test.com',
        password: 'password123',
        role: 'parent',
      });

      const student = await Student.create({
        name: 'Test Student',
        studentId: 'STU001',
        classId: 1,
      });

      const relationships = [
        'father',
        'mother',
        'grandfather',
        'grandmother',
        'uncle',
        'aunt',
        'other',
      ];

      for (const relationship of relationships) {
        const relation = await ParentStudentRelation.create({
          userId: user.id,
          studentId: student.id,
          relationship,
        });

        expect(relation.relationship).toBe(relationship);
      }
    });

    it('should handle isPrimaryContact values', async () => {
      const user = await User.create({
        username: 'parent',
        email: 'parent@test.com',
        password: 'password123',
        role: 'parent',
      });

      const student = await Student.create({
        name: 'Test Student',
        studentId: 'STU001',
        classId: 1,
      });

      const primaryContactValues = [0, 1];

      for (const isPrimaryContact of primaryContactValues) {
        const relation = await ParentStudentRelation.create({
          userId: user.id,
          studentId: student.id,
          relationship: 'father',
          isPrimaryContact,
        });

        expect(relation.isPrimaryContact).toBe(isPrimaryContact);
      }
    });

    it('should handle isLegalGuardian values', async () => {
      const user = await User.create({
        username: 'parent',
        email: 'parent@test.com',
        password: 'password123',
        role: 'parent',
      });

      const student = await Student.create({
        name: 'Test Student',
        studentId: 'STU001',
        classId: 1,
      });

      const legalGuardianValues = [0, 1];

      for (const isLegalGuardian of legalGuardianValues) {
        const relation = await ParentStudentRelation.create({
          userId: user.id,
          studentId: student.id,
          relationship: 'father',
          isLegalGuardian,
        });

        expect(relation.isLegalGuardian).toBe(isLegalGuardian);
      }
    });

    it('should handle idCardNo values', async () => {
      const user = await User.create({
        username: 'parent',
        email: 'parent@test.com',
        password: 'password123',
        role: 'parent',
      });

      const student = await Student.create({
        name: 'Test Student',
        studentId: 'STU001',
        classId: 1,
      });

      const idCardNumbers = [
        '123456789012345678', // 18 digits
        '123456789012345',     // 15 digits
        null,                  // Optional
      ];

      for (const idCardNo of idCardNumbers) {
        const relation = await ParentStudentRelation.create({
          userId: user.id,
          studentId: student.id,
          relationship: 'father',
          idCardNo,
        });

        expect(relation.idCardNo).toBe(idCardNo);
      }
    });

    it('should handle workUnit values', async () => {
      const user = await User.create({
        username: 'parent',
        email: 'parent@test.com',
        password: 'password123',
        role: 'parent',
      });

      const student = await Student.create({
        name: 'Test Student',
        studentId: 'STU001',
        classId: 1,
      });

      const workUnits = [
        'Test Company',
        'Government Office',
        'School',
        'Hospital',
        'a'.repeat(100), // Max length
        null,           // Optional
      ];

      for (const workUnit of workUnits) {
        const relation = await ParentStudentRelation.create({
          userId: user.id,
          studentId: student.id,
          relationship: 'father',
          workUnit,
        });

        expect(relation.workUnit).toBe(workUnit);
      }
    });

    it('should handle occupation values', async () => {
      const user = await User.create({
        username: 'parent',
        email: 'parent@test.com',
        password: 'password123',
        role: 'parent',
      });

      const student = await Student.create({
        name: 'Test Student',
        studentId: 'STU001',
        classId: 1,
      });

      const occupations = [
        'Engineer',
        'Teacher',
        'Doctor',
        'Business Owner',
        'a'.repeat(50), // Max length
        null,          // Optional
      ];

      for (const occupation of occupations) {
        const relation = await ParentStudentRelation.create({
          userId: user.id,
          studentId: student.id,
          relationship: 'father',
          occupation,
        });

        expect(relation.occupation).toBe(occupation);
      }
    });

    it('should handle education values', async () => {
      const user = await User.create({
        username: 'parent',
        email: 'parent@test.com',
        password: 'password123',
        role: 'parent',
      });

      const student = await Student.create({
        name: 'Test Student',
        studentId: 'STU001',
        classId: 1,
      });

      const educationLevels = [
        'Primary School',
        'Middle School',
        'High School',
        'Bachelor',
        'Master',
        'PhD',
        'a'.repeat(50), // Max length
        null,          // Optional
      ];

      for (const education of educationLevels) {
        const relation = await ParentStudentRelation.create({
          userId: user.id,
          studentId: student.id,
          relationship: 'father',
          education,
        });

        expect(relation.education).toBe(education);
      }
    });

    it('should handle address values', async () => {
      const user = await User.create({
        username: 'parent',
        email: 'parent@test.com',
        password: 'password123',
        role: 'parent',
      });

      const student = await Student.create({
        name: 'Test Student',
        studentId: 'STU001',
        classId: 1,
      });

      const addresses = [
        '123 Test Street',
        '456 Sample Avenue',
        'a'.repeat(200), // Max length
        null,           // Optional
      ];

      for (const address of addresses) {
        const relation = await ParentStudentRelation.create({
          userId: user.id,
          studentId: student.id,
          relationship: 'father',
          address,
        });

        expect(relation.address).toBe(address);
      }
    });

    it('should handle remark values', async () => {
      const user = await User.create({
        username: 'parent',
        email: 'parent@test.com',
        password: 'password123',
        role: 'parent',
      });

      const student = await Student.create({
        name: 'Test Student',
        studentId: 'STU001',
        classId: 1,
      });

      const remarks = [
        'Short remark',
        'This is a longer remark with more details about the parent student relationship',
        'a'.repeat(500), // Max length
        null,           // Optional
      ];

      for (const remark of remarks) {
        const relation = await ParentStudentRelation.create({
          userId: user.id,
          studentId: student.id,
          relationship: 'father',
          remark,
        });

        expect(relation.remark).toBe(remark);
      }
    });
  });

  describe('String Field Lengths', () => {
    it('should handle relationship within length limit', async () => {
      const user = await User.create({
        username: 'parent',
        email: 'parent@test.com',
        password: 'password123',
        role: 'parent',
      });

      const student = await Student.create({
        name: 'Test Student',
        studentId: 'STU001',
        classId: 1,
      });

      const longRelationship = 'a'.repeat(20); // Max length for relationship

      const relation = await ParentStudentRelation.create({
        userId: user.id,
        studentId: student.id,
        relationship: longRelationship,
      });

      expect(relation.relationship).toBe(longRelationship);
    });

    it('should handle workUnit within length limit', async () => {
      const user = await User.create({
        username: 'parent',
        email: 'parent@test.com',
        password: 'password123',
        role: 'parent',
      });

      const student = await Student.create({
        name: 'Test Student',
        studentId: 'STU001',
        classId: 1,
      });

      const longWorkUnit = 'a'.repeat(100); // Max length for workUnit

      const relation = await ParentStudentRelation.create({
        userId: user.id,
        studentId: student.id,
        relationship: 'father',
        workUnit: longWorkUnit,
      });

      expect(relation.workUnit).toBe(longWorkUnit);
    });

    it('should handle occupation within length limit', async () => {
      const user = await User.create({
        username: 'parent',
        email: 'parent@test.com',
        password: 'password123',
        role: 'parent',
      });

      const student = await Student.create({
        name: 'Test Student',
        studentId: 'STU001',
        classId: 1,
      });

      const longOccupation = 'a'.repeat(50); // Max length for occupation

      const relation = await ParentStudentRelation.create({
        userId: user.id,
        studentId: student.id,
        relationship: 'father',
        occupation: longOccupation,
      });

      expect(relation.occupation).toBe(longOccupation);
    });

    it('should handle education within length limit', async () => {
      const user = await User.create({
        username: 'parent',
        email: 'parent@test.com',
        password: 'password123',
        role: 'parent',
      });

      const student = await Student.create({
        name: 'Test Student',
        studentId: 'STU001',
        classId: 1,
      });

      const longEducation = 'a'.repeat(50); // Max length for education

      const relation = await ParentStudentRelation.create({
        userId: user.id,
        studentId: student.id,
        relationship: 'father',
        education: longEducation,
      });

      expect(relation.education).toBe(longEducation);
    });

    it('should handle address within length limit', async () => {
      const user = await User.create({
        username: 'parent',
        email: 'parent@test.com',
        password: 'password123',
        role: 'parent',
      });

      const student = await Student.create({
        name: 'Test Student',
        studentId: 'STU001',
        classId: 1,
      });

      const longAddress = 'a'.repeat(200); // Max length for address

      const relation = await ParentStudentRelation.create({
        userId: user.id,
        studentId: student.id,
        relationship: 'father',
        address: longAddress,
      });

      expect(relation.address).toBe(longAddress);
    });

    it('should handle remark within length limit', async () => {
      const user = await User.create({
        username: 'parent',
        email: 'parent@test.com',
        password: 'password123',
        role: 'parent',
      });

      const student = await Student.create({
        name: 'Test Student',
        studentId: 'STU001',
        classId: 1,
      });

      const longRemark = 'a'.repeat(500); // Max length for remark

      const relation = await ParentStudentRelation.create({
        userId: user.id,
        studentId: student.id,
        relationship: 'father',
        remark: longRemark,
      });

      expect(relation.remark).toBe(longRemark);
    });

    it('should handle idCardNo within length limit', async () => {
      const user = await User.create({
        username: 'parent',
        email: 'parent@test.com',
        password: 'password123',
        role: 'parent',
      });

      const student = await Student.create({
        name: 'Test Student',
        studentId: 'STU001',
        classId: 1,
      });

      const idCardNo = 'a'.repeat(18); // Max length for idCardNo

      const relation = await ParentStudentRelation.create({
        userId: user.id,
        studentId: student.id,
        relationship: 'father',
        idCardNo,
      });

      expect(relation.idCardNo).toBe(idCardNo);
    });
  });

  describe('Associations', () => {
    it('should belong to user', async () => {
      const user = await User.create({
        username: 'parent',
        email: 'parent@test.com',
        password: 'password123',
        role: 'parent',
      });

      const student = await Student.create({
        name: 'Test Student',
        studentId: 'STU001',
        classId: 1,
      });

      const relation = await ParentStudentRelation.create({
        userId: user.id,
        studentId: student.id,
        relationship: 'father',
      });

      const relationWithUser = await ParentStudentRelation.findByPk(relation.id, {
        include: ['user'],
      });

      expect(relationWithUser?.user).toBeDefined();
      expect(relationWithUser?.user?.id).toBe(user.id);
      expect(relationWithUser?.user?.username).toBe('parent');
    });

    it('should belong to student', async () => {
      const user = await User.create({
        username: 'parent',
        email: 'parent@test.com',
        password: 'password123',
        role: 'parent',
      });

      const student = await Student.create({
        name: 'Test Student',
        studentId: 'STU001',
        classId: 1,
      });

      const relation = await ParentStudentRelation.create({
        userId: user.id,
        studentId: student.id,
        relationship: 'father',
      });

      const relationWithStudent = await ParentStudentRelation.findByPk(relation.id, {
        include: ['student'],
      });

      expect(relationWithStudent?.student).toBeDefined();
      expect(relationWithStudent?.student?.id).toBe(student.id);
      expect(relationWithStudent?.student?.name).toBe('Test Student');
    });

    it('should belong to creator', async () => {
      const user = await User.create({
        username: 'parent',
        email: 'parent@test.com',
        password: 'password123',
        role: 'parent',
      });

      const student = await Student.create({
        name: 'Test Student',
        studentId: 'STU001',
        classId: 1,
      });

      const creator = await User.create({
        username: 'creator',
        email: 'creator@test.com',
        password: 'password123',
        role: 'admin' as any,
      });

      const relation = await ParentStudentRelation.create({
        userId: user.id,
        studentId: student.id,
        relationship: 'father',
        creatorId: creator.id,
      });

      const relationWithCreator = await ParentStudentRelation.findByPk(relation.id, {
        include: ['creator'],
      });

      expect(relationWithCreator?.creator).toBeDefined();
      expect(relationWithCreator?.creator?.id).toBe(creator.id);
      expect(relationWithCreator?.creator?.username).toBe('creator');
    });

    it('should belong to updater', async () => {
      const user = await User.create({
        username: 'parent',
        email: 'parent@test.com',
        password: 'password123',
        role: 'parent',
      });

      const student = await Student.create({
        name: 'Test Student',
        studentId: 'STU001',
        classId: 1,
      });

      const updater = await User.create({
        username: 'updater',
        email: 'updater@test.com',
        password: 'password123',
        role: 'admin' as any,
      });

      const relation = await ParentStudentRelation.create({
        userId: user.id,
        studentId: student.id,
        relationship: 'father',
        updaterId: updater.id,
      });

      const relationWithUpdater = await ParentStudentRelation.findByPk(relation.id, {
        include: ['updater'],
      });

      expect(relationWithUpdater?.updater).toBeDefined();
      expect(relationWithUpdater?.updater?.id).toBe(updater.id);
      expect(relationWithUpdater?.updater?.username).toBe('updater');
    });

    it('should handle null creator and updater', async () => {
      const user = await User.create({
        username: 'parent',
        email: 'parent@test.com',
        password: 'password123',
        role: 'parent',
      });

      const student = await Student.create({
        name: 'Test Student',
        studentId: 'STU001',
        classId: 1,
      });

      const relation = await ParentStudentRelation.create({
        userId: user.id,
        studentId: student.id,
        relationship: 'father',
      });

      const relationWithAssociations = await ParentStudentRelation.findByPk(relation.id, {
        include: ['creator', 'updater'],
      });

      expect(relationWithAssociations?.creator).toBeNull();
      expect(relationWithAssociations?.updater).toBeNull();
    });
  });

  describe('CRUD Operations', () => {
    it('should create ParentStudentRelation successfully', async () => {
      const user = await User.create({
        username: 'parent',
        email: 'parent@test.com',
        password: 'password123',
        role: 'parent',
      });

      const student = await Student.create({
        name: 'Test Student',
        studentId: 'STU001',
        classId: 1,
      });

      const relation = await ParentStudentRelation.create({
        userId: user.id,
        studentId: student.id,
        relationship: 'father',
      });

      expect(relation.id).toBeDefined();
      expect(relation.userId).toBe(user.id);
      expect(relation.studentId).toBe(student.id);
      expect(relation.relationship).toBe('father');
    });

    it('should read ParentStudentRelation successfully', async () => {
      const user = await User.create({
        username: 'parent',
        email: 'parent@test.com',
        password: 'password123',
        role: 'parent',
      });

      const student = await Student.create({
        name: 'Test Student',
        studentId: 'STU001',
        classId: 1,
      });

      const relation = await ParentStudentRelation.create({
        userId: user.id,
        studentId: student.id,
        relationship: 'father',
      });

      const foundRelation = await ParentStudentRelation.findByPk(relation.id);

      expect(foundRelation).toBeDefined();
      expect(foundRelation?.id).toBe(relation.id);
      expect(foundRelation?.userId).toBe(user.id);
      expect(foundRelation?.studentId).toBe(student.id);
      expect(foundRelation?.relationship).toBe('father');
    });

    it('should update ParentStudentRelation successfully', async () => {
      const user = await User.create({
        username: 'parent',
        email: 'parent@test.com',
        password: 'password123',
        role: 'parent',
      });

      const student = await Student.create({
        name: 'Test Student',
        studentId: 'STU001',
        classId: 1,
      });

      const creator = await User.create({
        username: 'creator',
        email: 'creator@test.com',
        password: 'password123',
        role: 'admin' as any,
      });

      const updater = await User.create({
        username: 'updater',
        email: 'updater@test.com',
        password: 'password123',
        role: 'admin' as any,
      });

      const relation = await ParentStudentRelation.create({
        userId: user.id,
        studentId: student.id,
        relationship: 'father',
        isPrimaryContact: 0,
        isLegalGuardian: 0,
        creatorId: creator.id,
        updaterId: creator.id,
      });

      await relation.update({
        relationship: 'mother',
        isPrimaryContact: 1,
        isLegalGuardian: 1,
        idCardNo: '123456789012345678',
        workUnit: 'Updated Company',
        occupation: 'Updated Occupation',
        education: 'Updated Education',
        address: 'Updated Address',
        remark: 'Updated remark',
        updaterId: updater.id,
      });

      const updatedRelation = await ParentStudentRelation.findByPk(relation.id);

      expect(updatedRelation?.relationship).toBe('mother');
      expect(updatedRelation?.isPrimaryContact).toBe(1);
      expect(updatedRelation?.isLegalGuardian).toBe(1);
      expect(updatedRelation?.idCardNo).toBe('123456789012345678');
      expect(updatedRelation?.workUnit).toBe('Updated Company');
      expect(updatedRelation?.occupation).toBe('Updated Occupation');
      expect(updatedRelation?.education).toBe('Updated Education');
      expect(updatedRelation?.address).toBe('Updated Address');
      expect(updatedRelation?.remark).toBe('Updated remark');
      expect(updatedRelation?.updaterId).toBe(updater.id);
    });

    it('should delete ParentStudentRelation successfully', async () => {
      const user = await User.create({
        username: 'parent',
        email: 'parent@test.com',
        password: 'password123',
        role: 'parent',
      });

      const student = await Student.create({
        name: 'Test Student',
        studentId: 'STU001',
        classId: 1,
      });

      const relation = await ParentStudentRelation.create({
        userId: user.id,
        studentId: student.id,
        relationship: 'father',
      });

      await relation.destroy();

      const deletedRelation = await ParentStudentRelation.findByPk(relation.id);

      expect(deletedRelation).toBeNull();
    });
  });

  describe('Query Methods', () => {
    it('should find ParentStudentRelation by userId', async () => {
      const user1 = await User.create({
        username: 'parent1',
        email: 'parent1@test.com',
        password: 'password123',
        role: 'parent',
      });

      const user2 = await User.create({
        username: 'parent2',
        email: 'parent2@test.com',
        password: 'password123',
        role: 'parent',
      });

      const student1 = await Student.create({
        name: 'Student 1',
        studentId: 'STU001',
        classId: 1,
      });

      const student2 = await Student.create({
        name: 'Student 2',
        studentId: 'STU002',
        classId: 1,
      });

      await ParentStudentRelation.create({
        userId: user1.id,
        studentId: student1.id,
        relationship: 'father',
      });

      await ParentStudentRelation.create({
        userId: user2.id,
        studentId: student2.id,
        relationship: 'mother',
      });

      const user1Relations = await ParentStudentRelation.findAll({
        where: { userId: user1.id },
      });

      const user2Relations = await ParentStudentRelation.findAll({
        where: { userId: user2.id },
      });

      expect(user1Relations.length).toBe(1);
      expect(user2Relations.length).toBe(1);
      expect(user1Relations[0].relationship).toBe('father');
      expect(user2Relations[0].relationship).toBe('mother');
    });

    it('should find ParentStudentRelation by studentId', async () => {
      const user1 = await User.create({
        username: 'parent1',
        email: 'parent1@test.com',
        password: 'password123',
        role: 'parent',
      });

      const user2 = await User.create({
        username: 'parent2',
        email: 'parent2@test.com',
        password: 'password123',
        role: 'parent',
      });

      const student = await Student.create({
        name: 'Test Student',
        studentId: 'STU001',
        classId: 1,
      });

      await ParentStudentRelation.create({
        userId: user1.id,
        studentId: student.id,
        relationship: 'father',
      });

      await ParentStudentRelation.create({
        userId: user2.id,
        studentId: student.id,
        relationship: 'mother',
      });

      const studentRelations = await ParentStudentRelation.findAll({
        where: { studentId: student.id },
      });

      expect(studentRelations.length).toBe(2);
      const relationships = studentRelations.map(r => r.relationship).sort();
      expect(relationships).toEqual(['father', 'mother']);
    });

    it('should find ParentStudentRelation by relationship', async () => {
      const user1 = await User.create({
        username: 'parent1',
        email: 'parent1@test.com',
        password: 'password123',
        role: 'parent',
      });

      const user2 = await User.create({
        username: 'parent2',
        email: 'parent2@test.com',
        password: 'password123',
        role: 'parent',
      });

      const user3 = await User.create({
        username: 'parent3',
        email: 'parent3@test.com',
        password: 'password123',
        role: 'parent',
      });

      const student1 = await Student.create({
        name: 'Student 1',
        studentId: 'STU001',
        classId: 1,
      });

      const student2 = await Student.create({
        name: 'Student 2',
        studentId: 'STU002',
        classId: 1,
      });

      const student3 = await Student.create({
        name: 'Student 3',
        studentId: 'STU003',
        classId: 1,
      });

      await ParentStudentRelation.create({
        userId: user1.id,
        studentId: student1.id,
        relationship: 'father',
      });

      await ParentStudentRelation.create({
        userId: user2.id,
        studentId: student2.id,
        relationship: 'mother',
      });

      await ParentStudentRelation.create({
        userId: user3.id,
        studentId: student3.id,
        relationship: 'father',
      });

      const fatherRelations = await ParentStudentRelation.findAll({
        where: { relationship: 'father' },
      });

      const motherRelations = await ParentStudentRelation.findAll({
        where: { relationship: 'mother' },
      });

      expect(fatherRelations.length).toBe(2);
      expect(motherRelations.length).toBe(1);
    });

    it('should find ParentStudentRelation by isPrimaryContact', async () => {
      const user1 = await User.create({
        username: 'parent1',
        email: 'parent1@test.com',
        password: 'password123',
        role: 'parent',
      });

      const user2 = await User.create({
        username: 'parent2',
        email: 'parent2@test.com',
        password: 'password123',
        role: 'parent',
      });

      const student1 = await Student.create({
        name: 'Student 1',
        studentId: 'STU001',
        classId: 1,
      });

      const student2 = await Student.create({
        name: 'Student 2',
        studentId: 'STU002',
        classId: 1,
      });

      await ParentStudentRelation.create({
        userId: user1.id,
        studentId: student1.id,
        relationship: 'father',
        isPrimaryContact: 1,
      });

      await ParentStudentRelation.create({
        userId: user2.id,
        studentId: student2.id,
        relationship: 'mother',
        isPrimaryContact: 0,
      });

      const primaryContacts = await ParentStudentRelation.findAll({
        where: { isPrimaryContact: 1 },
      });

      const nonPrimaryContacts = await ParentStudentRelation.findAll({
        where: { isPrimaryContact: 0 },
      });

      expect(primaryContacts.length).toBe(1);
      expect(nonPrimaryContacts.length).toBe(1);
      expect(primaryContacts[0].relationship).toBe('father');
      expect(nonPrimaryContacts[0].relationship).toBe('mother');
    });

    it('should find ParentStudentRelation by isLegalGuardian', async () => {
      const user1 = await User.create({
        username: 'parent1',
        email: 'parent1@test.com',
        password: 'password123',
        role: 'parent',
      });

      const user2 = await User.create({
        username: 'parent2',
        email: 'parent2@test.com',
        password: 'password123',
        role: 'parent',
      });

      const student1 = await Student.create({
        name: 'Student 1',
        studentId: 'STU001',
        classId: 1,
      });

      const student2 = await Student.create({
        name: 'Student 2',
        studentId: 'STU002',
        classId: 1,
      });

      await ParentStudentRelation.create({
        userId: user1.id,
        studentId: student1.id,
        relationship: 'father',
        isLegalGuardian: 1,
      });

      await ParentStudentRelation.create({
        userId: user2.id,
        studentId: student2.id,
        relationship: 'grandmother',
        isLegalGuardian: 0,
      });

      const legalGuardians = await ParentStudentRelation.findAll({
        where: { isLegalGuardian: 1 },
      });

      const nonLegalGuardians = await ParentStudentRelation.findAll({
        where: { isLegalGuardian: 0 },
      });

      expect(legalGuardians.length).toBe(1);
      expect(nonLegalGuardians.length).toBe(1);
      expect(legalGuardians[0].relationship).toBe('father');
      expect(nonLegalGuardians[0].relationship).toBe('grandmother');
    });

    it('should find ParentStudentRelation with complex conditions', async () => {
      const user1 = await User.create({
        username: 'parent1',
        email: 'parent1@test.com',
        password: 'password123',
        role: 'parent',
      });

      const user2 = await User.create({
        username: 'parent2',
        email: 'parent2@test.com',
        password: 'password123',
        role: 'parent',
      });

      const user3 = await User.create({
        username: 'parent3',
        email: 'parent3@test.com',
        password: 'password123',
        role: 'parent',
      });

      const student1 = await Student.create({
        name: 'Student 1',
        studentId: 'STU001',
        classId: 1,
      });

      const student2 = await Student.create({
        name: 'Student 2',
        studentId: 'STU002',
        classId: 1,
      });

      const student3 = await Student.create({
        name: 'Student 3',
        studentId: 'STU003',
        classId: 1,
      });

      await ParentStudentRelation.create({
        userId: user1.id,
        studentId: student1.id,
        relationship: 'father',
        isPrimaryContact: 1,
        isLegalGuardian: 1,
      });

      await ParentStudentRelation.create({
        userId: user2.id,
        studentId: student2.id,
        relationship: 'mother',
        isPrimaryContact: 0,
        isLegalGuardian: 1,
      });

      await ParentStudentRelation.create({
        userId: user3.id,
        studentId: student3.id,
        relationship: 'father',
        isPrimaryContact: 1,
        isLegalGuardian: 0,
      });

      const primaryLegalGuardians = await ParentStudentRelation.findAll({
        where: {
          isPrimaryContact: 1,
          isLegalGuardian: 1,
        },
      });

      const primaryFathers = await ParentStudentRelation.findAll({
        where: {
          relationship: 'father',
          isPrimaryContact: 1,
        },
      });

      expect(primaryLegalGuardians.length).toBe(1);
      expect(primaryFathers.length).toBe(2);
      expect(primaryLegalGuardians[0].relationship).toBe('father');
    });
  });

  describe('Business Logic Scenarios', () => {
    it('should handle multiple parents for one student', async () => {
      const father = await User.create({
        username: 'father',
        email: 'father@test.com',
        password: 'password123',
        role: 'parent',
      });

      const mother = await User.create({
        username: 'mother',
        email: 'mother@test.com',
        password: 'password123',
        role: 'parent',
      });

      const grandfather = await User.create({
        username: 'grandfather',
        email: 'grandfather@test.com',
        password: 'password123',
        role: 'parent',
      });

      const student = await Student.create({
        name: 'Test Student',
        studentId: 'STU001',
        classId: 1,
      });

      await ParentStudentRelation.create({
        userId: father.id,
        studentId: student.id,
        relationship: 'father',
        isPrimaryContact: 1,
        isLegalGuardian: 1,
      });

      await ParentStudentRelation.create({
        userId: mother.id,
        studentId: student.id,
        relationship: 'mother',
        isPrimaryContact: 0,
        isLegalGuardian: 1,
      });

      await ParentStudentRelation.create({
        userId: grandfather.id,
        studentId: student.id,
        relationship: 'grandfather',
        isPrimaryContact: 0,
        isLegalGuardian: 0,
      });

      const studentRelations = await ParentStudentRelation.findAll({
        where: { studentId: student.id },
        include: ['user'],
        order: [['isPrimaryContact', 'DESC']],
      });

      expect(studentRelations.length).toBe(3);
      expect(studentRelations[0].relationship).toBe('father');
      expect(studentRelations[1].relationship).toBe('mother');
      expect(studentRelations[2].relationship).toBe('grandfather');
    });

    it('should handle one parent with multiple students', async () => {
      const parent = await User.create({
        username: 'parent',
        email: 'parent@test.com',
        password: 'password123',
        role: 'parent',
      });

      const student1 = await Student.create({
        name: 'Student 1',
        studentId: 'STU001',
        classId: 1,
      });

      const student2 = await Student.create({
        name: 'Student 2',
        studentId: 'STU002',
        classId: 1,
      });

      const student3 = await Student.create({
        name: 'Student 3',
        studentId: 'STU003',
        classId: 1,
      });

      await ParentStudentRelation.create({
        userId: parent.id,
        studentId: student1.id,
        relationship: 'mother',
        isPrimaryContact: 1,
        isLegalGuardian: 1,
      });

      await ParentStudentRelation.create({
        userId: parent.id,
        studentId: student2.id,
        relationship: 'mother',
        isPrimaryContact: 1,
        isLegalGuardian: 1,
      });

      await ParentStudentRelation.create({
        userId: parent.id,
        studentId: student3.id,
        relationship: 'mother',
        isPrimaryContact: 1,
        isLegalGuardian: 1,
      });

      const parentRelations = await ParentStudentRelation.findAll({
        where: { userId: parent.id },
        include: ['student'],
      });

      expect(parentRelations.length).toBe(3);
      const studentNames = parentRelations.map(r => r.student?.name).sort();
      expect(studentNames).toEqual(['Student 1', 'Student 2', 'Student 3']);
    });

    it('should identify primary contacts and legal guardians', async () => {
      const users = await Promise.all([
        User.create({
          username: 'father',
          email: 'father@test.com',
          password: 'password123',
          role: 'parent',
        }),
        User.create({
          username: 'mother',
          email: 'mother@test.com',
          password: 'password123',
          role: 'parent',
        }),
        User.create({
          username: 'grandmother',
          email: 'grandmother@test.com',
          password: 'password123',
          role: 'parent',
        }),
      ]);

      const student = await Student.create({
        name: 'Test Student',
        studentId: 'STU001',
        classId: 1,
      });

      await ParentStudentRelation.create({
        userId: users[0].id,
        studentId: student.id,
        relationship: 'father',
        isPrimaryContact: 1,
        isLegalGuardian: 1,
      });

      await ParentStudentRelation.create({
        userId: users[1].id,
        studentId: student.id,
        relationship: 'mother',
        isPrimaryContact: 0,
        isLegalGuardian: 1,
      });

      await ParentStudentRelation.create({
        userId: users[2].id,
        studentId: student.id,
        relationship: 'grandmother',
        isPrimaryContact: 0,
        isLegalGuardian: 0,
      });

      const allRelations = await ParentStudentRelation.findAll({
        where: { studentId: student.id },
      });

      const primaryContacts = allRelations.filter(r => r.isPrimaryContact === 1);
      const legalGuardians = allRelations.filter(r => r.isLegalGuardian === 1);
      const both = allRelations.filter(r => r.isPrimaryContact === 1 && r.isLegalGuardian === 1);

      expect(primaryContacts.length).toBe(1);
      expect(legalGuardians.length).toBe(2);
      expect(both.length).toBe(1);
      expect(primaryContacts[0].relationship).toBe('father');
    });

    it('should handle different relationship types properly', async () => {
      const relationshipTypes = [
        'father',
        'mother',
        'grandfather',
        'grandmother',
        'uncle',
        'aunt',
        'other',
      ];

      const users = await Promise.all(
        relationshipTypes.map((type, index) =>
          User.create({
            username: `${type}_${index}`,
            email: `${type}@test.com`,
            password: 'password123',
            role: 'parent',
          })
        )
      );

      const student = await Student.create({
        name: 'Test Student',
        studentId: 'STU001',
        classId: 1,
      });

      for (let i = 0; i < relationshipTypes.length; i++) {
        await ParentStudentRelation.create({
          userId: users[i].id,
          studentId: student.id,
          relationship: relationshipTypes[i],
          isPrimaryContact: i === 0 ? 1 : 0, // First one is primary
          isLegalGuardian: i < 2 ? 1 : 0, // First two are legal guardians
        });
      }

      const allRelations = await ParentStudentRelation.findAll({
        where: { studentId: student.id },
        order: [['isPrimaryContact', 'DESC']],
      });

      expect(allRelations.length).toBe(relationshipTypes.length);
      
      const actualRelationships = allRelations.map(r => r.relationship);
      expect(actualRelationships).toEqual(relationshipTypes);

      const primaryContact = allRelations.find(r => r.isPrimaryContact === 1);
      expect(primaryContact?.relationship).toBe('father');

      const legalGuardians = allRelations.filter(r => r.isLegalGuardian === 1);
      expect(legalGuardians.length).toBe(2);
      expect(legalGuardians.map(r => r.relationship)).toEqual(['father', 'mother']);
    });
  });
});