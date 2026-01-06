import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { Sequelize } from 'sequelize'
import { DataTypes } from 'sequelize'
import EnrollmentConsultationFollowup from '../../../src/models/enrollment-consultation-followup.model'
import { User } from '../../../src/models/user.model'
import { EnrollmentConsultation } from '../../../src/models/enrollment-consultation.model'

describe('EnrollmentConsultationFollowup Model', () => {
  let sequelize: Sequelize

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false
    })

    // Initialize all dependent models first
    User.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        type: DataTypes.STRING,
        unique: true
      },
      email: {
        type: DataTypes.STRING,
        unique: true
      },
      password: DataTypes.STRING,
      role: DataTypes.STRING,
      status: DataTypes.STRING,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
    }, {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true
    })

    // Mock Kindergarten model for EnrollmentConsultation
    const Kindergarten = sequelize.define('Kindergarten', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: DataTypes.STRING,
      address: DataTypes.STRING,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
    })

    // Initialize EnrollmentConsultation model
    EnrollmentConsultation.initModel(sequelize)

    // Initialize the model we're testing
    EnrollmentConsultationFollowup.initModel(sequelize)
    
    // Initialize associations
    EnrollmentConsultation.initAssociations()
    EnrollmentConsultationFollowup.initAssociations()

    await sequelize.sync({ force: true })
  })

  afterEach(async () => {
    await sequelize.close()
  })

  it('should be defined', () => {
    expect(EnrollmentConsultationFollowup).toBeDefined()
  })

  it('should have correct model name', () => {
    expect(EnrollmentConsultationFollowup.tableName).toBe('enrollment_consultation_followups')
  })

  it('should create a new enrollment consultation followup', async () => {
    // Create dependent records
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'admin' as any,
      status: 'active'
    })

    const kindergarten = await sequelize.models.Kindergarten.create({
      name: 'Test Kindergarten',
      address: 'Test Address'
    })

    const consultation = await EnrollmentConsultation.create({
      kindergartenId: kindergarten.id,
      consultantId: user.id,
      parentName: 'Test Parent',
      childName: 'Test Child',
      childAge: 36,
      childGender: 1,
      contactPhone: '1234567890',
      sourceChannel: 1,
      consultContent: 'Test consultation content',
      consultMethod: 1,
      consultDate: new Date(),
      intentionLevel: 2,
      creatorId: user.id
    })

    const followup = await EnrollmentConsultationFollowup.create({
      consultationId: consultation.id,
      followupUserId: user.id,
      followupMethod: 1,
      followupContent: 'Follow up content',
      followupDate: new Date(),
      intentionLevel: 2,
      followupResult: 1
    })

    expect(followup.id).toBeDefined()
    expect(followup.consultationId).toBe(consultation.id)
    expect(followup.followupUserId).toBe(user.id)
    expect(followup.followupMethod).toBe(1)
    expect(followup.followupContent).toBe('Follow up content')
    expect(followup.followupDate).toBeDefined()
    expect(followup.intentionLevel).toBe(2)
    expect(followup.followupResult).toBe(1)
    expect(followup.nextFollowupDate).toBeNull()
    expect(followup.remark).toBeNull()
  })

  it('should create followup with optional fields', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'admin' as any,
      status: 'active'
    })

    const kindergarten = await sequelize.models.Kindergarten.create({
      name: 'Test Kindergarten',
      address: 'Test Address'
    })

    const consultation = await EnrollmentConsultation.create({
      kindergartenId: kindergarten.id,
      consultantId: user.id,
      parentName: 'Test Parent',
      childName: 'Test Child',
      childAge: 36,
      childGender: 1,
      contactPhone: '1234567890',
      sourceChannel: 1,
      consultContent: 'Test consultation content',
      consultMethod: 1,
      consultDate: new Date(),
      intentionLevel: 2,
      creatorId: user.id
    })

    const followup = await EnrollmentConsultationFollowup.create({
      consultationId: consultation.id,
      followupUserId: user.id,
      followupMethod: 2,
      followupContent: 'Follow up with remark',
      followupDate: new Date(),
      intentionLevel: 1,
      followupResult: 2,
      nextFollowupDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days later
      remark: 'Important followup'
    })

    expect(followup.nextFollowupDate).toBeDefined()
    expect(followup.remark).toBe('Important followup')
  })

  it('should validate required fields', async () => {
    await expect(EnrollmentConsultationFollowup.create({
      // Missing required fields
    } as any)).rejects.toThrow()
  })

  it('should validate followupMethod range', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'admin' as any,
      status: 'active'
    })

    const kindergarten = await sequelize.models.Kindergarten.create({
      name: 'Test Kindergarten',
      address: 'Test Address'
    })

    const consultation = await EnrollmentConsultation.create({
      kindergartenId: kindergarten.id,
      consultantId: user.id,
      parentName: 'Test Parent',
      childName: 'Test Child',
      childAge: 36,
      childGender: 1,
      contactPhone: '1234567890',
      sourceChannel: 1,
      consultContent: 'Test consultation content',
      consultMethod: 1,
      consultDate: new Date(),
      intentionLevel: 2,
      creatorId: user.id
    })

    const validMethods = [1, 2, 3, 4, 5, 6] // All valid followup methods
    
    for (const method of validMethods) {
      const followup = await EnrollmentConsultationFollowup.create({
        consultationId: consultation.id,
        followupUserId: user.id,
        followupMethod: method,
        followupContent: `Follow up method ${method}`,
        followupDate: new Date(),
        intentionLevel: 2,
        followupResult: 1
      })
      
      expect(followup.followupMethod).toBe(method)
    }
  })

  it('should validate intentionLevel range', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'admin' as any,
      status: 'active'
    })

    const kindergarten = await sequelize.models.Kindergarten.create({
      name: 'Test Kindergarten',
      address: 'Test Address'
    })

    const consultation = await EnrollmentConsultation.create({
      kindergartenId: kindergarten.id,
      consultantId: user.id,
      parentName: 'Test Parent',
      childName: 'Test Child',
      childAge: 36,
      childGender: 1,
      contactPhone: '1234567890',
      sourceChannel: 1,
      consultContent: 'Test consultation content',
      consultMethod: 1,
      consultDate: new Date(),
      intentionLevel: 2,
      creatorId: user.id
    })

    const validLevels = [1, 2, 3, 4, 5] // All valid intention levels
    
    for (const level of validLevels) {
      const followup = await EnrollmentConsultationFollowup.create({
        consultationId: consultation.id,
        followupUserId: user.id,
        followupMethod: 1,
        followupContent: `Follow up level ${level}`,
        followupDate: new Date(),
        intentionLevel: level,
        followupResult: 1
      })
      
      expect(followup.intentionLevel).toBe(level)
    }
  })

  it('should validate followupResult range', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'admin' as any,
      status: 'active'
    })

    const kindergarten = await sequelize.models.Kindergarten.create({
      name: 'Test Kindergarten',
      address: 'Test Address'
    })

    const consultation = await EnrollmentConsultation.create({
      kindergartenId: kindergarten.id,
      consultantId: user.id,
      parentName: 'Test Parent',
      childName: 'Test Child',
      childAge: 36,
      childGender: 1,
      contactPhone: '1234567890',
      sourceChannel: 1,
      consultContent: 'Test consultation content',
      consultMethod: 1,
      consultDate: new Date(),
      intentionLevel: 2,
      creatorId: user.id
    })

    const validResults = [1, 2, 3, 4] // All valid followup results
    
    for (const result of validResults) {
      const followup = await EnrollmentConsultationFollowup.create({
        consultationId: consultation.id,
        followupUserId: user.id,
        followupMethod: 1,
        followupContent: `Follow up result ${result}`,
        followupDate: new Date(),
        intentionLevel: 2,
        followupResult: result
      })
      
      expect(followup.followupResult).toBe(result)
    }
  })

  it('should have correct associations', () => {
    expect(EnrollmentConsultationFollowup.associations).toBeDefined()
    expect(EnrollmentConsultationFollowup.associations.consultation).toBeDefined()
    expect(EnrollmentConsultationFollowup.associations.followupUser).toBeDefined()
  })

  it('should belong to enrollment consultation', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'admin' as any,
      status: 'active'
    })

    const kindergarten = await sequelize.models.Kindergarten.create({
      name: 'Test Kindergarten',
      address: 'Test Address'
    })

    const consultation = await EnrollmentConsultation.create({
      kindergartenId: kindergarten.id,
      consultantId: user.id,
      parentName: 'Test Parent',
      childName: 'Test Child',
      childAge: 36,
      childGender: 1,
      contactPhone: '1234567890',
      sourceChannel: 1,
      consultContent: 'Test consultation content',
      consultMethod: 1,
      consultDate: new Date(),
      intentionLevel: 2,
      creatorId: user.id
    })

    const followup = await EnrollmentConsultationFollowup.create({
      consultationId: consultation.id,
      followupUserId: user.id,
      followupMethod: 1,
      followupContent: 'Test followup',
      followupDate: new Date(),
      intentionLevel: 2,
      followupResult: 1
    })

    const followupWithConsultation = await EnrollmentConsultationFollowup.findOne({
      where: { id: followup.id },
      include: ['consultation']
    })

    expect(followupWithConsultation).toBeDefined()
    expect(followupWithConsultation?.consultation).toBeDefined()
    expect(followupWithConsultation?.consultation.id).toBe(consultation.id)
  })

  it('should belong to followup user', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'admin' as any,
      status: 'active'
    })

    const kindergarten = await sequelize.models.Kindergarten.create({
      name: 'Test Kindergarten',
      address: 'Test Address'
    })

    const consultation = await EnrollmentConsultation.create({
      kindergartenId: kindergarten.id,
      consultantId: user.id,
      parentName: 'Test Parent',
      childName: 'Test Child',
      childAge: 36,
      childGender: 1,
      contactPhone: '1234567890',
      sourceChannel: 1,
      consultContent: 'Test consultation content',
      consultMethod: 1,
      consultDate: new Date(),
      intentionLevel: 2,
      creatorId: user.id
    })

    const followup = await EnrollmentConsultationFollowup.create({
      consultationId: consultation.id,
      followupUserId: user.id,
      followupMethod: 1,
      followupContent: 'Test followup',
      followupDate: new Date(),
      intentionLevel: 2,
      followupResult: 1
    })

    const followupWithUser = await EnrollmentConsultationFollowup.findOne({
      where: { id: followup.id },
      include: ['followupUser']
    })

    expect(followupWithUser).toBeDefined()
    expect(followupWithUser?.followupUser).toBeDefined()
    expect(followupWithUser?.followupUser.id).toBe(user.id)
  })

  it('should have correct table configuration', () => {
    const options = (EnrollmentConsultationFollowup as any).options
    expect(options.timestamps).toBe(true)
    expect(options.underscored).toBe(true)
    expect(options.tableName).toBe('enrollment_consultation_followups')
  })

  it('should handle date fields correctly', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'admin' as any,
      status: 'active'
    })

    const kindergarten = await sequelize.models.Kindergarten.create({
      name: 'Test Kindergarten',
      address: 'Test Address'
    })

    const consultation = await EnrollmentConsultation.create({
      kindergartenId: kindergarten.id,
      consultantId: user.id,
      parentName: 'Test Parent',
      childName: 'Test Child',
      childAge: 36,
      childGender: 1,
      contactPhone: '1234567890',
      sourceChannel: 1,
      consultContent: 'Test consultation content',
      consultMethod: 1,
      consultDate: new Date(),
      intentionLevel: 2,
      creatorId: user.id
    })

    const testDate = new Date('2023-12-25T10:30:00.000Z')
    const nextDate = new Date('2024-01-01T10:30:00.000Z')

    const followup = await EnrollmentConsultationFollowup.create({
      consultationId: consultation.id,
      followupUserId: user.id,
      followupMethod: 1,
      followupContent: 'Test followup',
      followupDate: testDate,
      intentionLevel: 2,
      followupResult: 1,
      nextFollowupDate: nextDate,
      remark: 'Test remark'
    })

    expect(followup.followupDate.toISOString()).toBe(testDate.toISOString())
    expect(followup.nextFollowupDate?.toISOString()).toBe(nextDate.toISOString())
  })

  it('should handle text fields with different lengths', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'admin' as any,
      status: 'active'
    })

    const kindergarten = await sequelize.models.Kindergarten.create({
      name: 'Test Kindergarten',
      address: 'Test Address'
    })

    const consultation = await EnrollmentConsultation.create({
      kindergartenId: kindergarten.id,
      consultantId: user.id,
      parentName: 'Test Parent',
      childName: 'Test Child',
      childAge: 36,
      childGender: 1,
      contactPhone: '1234567890',
      sourceChannel: 1,
      consultContent: 'Test consultation content',
      consultMethod: 1,
      consultDate: new Date(),
      intentionLevel: 2,
      creatorId: user.id
    })

    const longContent = 'This is a very long followup content that contains detailed information about the consultation followup process and includes multiple paragraphs of text to test the TEXT field functionality.'.repeat(10)

    const followup = await EnrollmentConsultationFollowup.create({
      consultationId: consultation.id,
      followupUserId: user.id,
      followupMethod: 1,
      followupContent: longContent,
      followupDate: new Date(),
      intentionLevel: 2,
      followupResult: 1,
      remark: 'This is also a long remark that tests the remark field length capabilities and ensures that longer text content can be stored properly in the database without any issues or truncation problems.'
    })

    expect(followup.followupContent).toBe(longContent)
    expect(followup.remark).toContain('This is also a long remark')
  })

  it('should create multiple followups for the same consultation', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'admin' as any,
      status: 'active'
    })

    const kindergarten = await sequelize.models.Kindergarten.create({
      name: 'Test Kindergarten',
      address: 'Test Address'
    })

    const consultation = await EnrollmentConsultation.create({
      kindergartenId: kindergarten.id,
      consultantId: user.id,
      parentName: 'Test Parent',
      childName: 'Test Child',
      childAge: 36,
      childGender: 1,
      contactPhone: '1234567890',
      sourceChannel: 1,
      consultContent: 'Test consultation content',
      consultMethod: 1,
      consultDate: new Date(),
      intentionLevel: 2,
      creatorId: user.id
    })

    const followup1 = await EnrollmentConsultationFollowup.create({
      consultationId: consultation.id,
      followupUserId: user.id,
      followupMethod: 1,
      followupContent: 'First followup',
      followupDate: new Date(),
      intentionLevel: 3,
      followupResult: 1
    })

    const followup2 = await EnrollmentConsultationFollowup.create({
      consultationId: consultation.id,
      followupUserId: user.id,
      followupMethod: 2,
      followupContent: 'Second followup',
      followupDate: new Date(),
      intentionLevel: 2,
      followupResult: 2
    })

    const followups = await EnrollmentConsultationFollowup.findAll({
      where: { consultationId: consultation.id }
    })

    expect(followups).toHaveLength(2)
    expect(followups.map(f => f.id)).toContain(followup1.id)
    expect(followups.map(f => f.id)).toContain(followup2.id)
  })
})