import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { Sequelize } from 'sequelize'
import { DataTypes } from 'sequelize'
import { EnrollmentApplicationMaterial, initEnrollmentApplicationMaterial, initEnrollmentApplicationMaterialAssociations, MaterialStatus } from '../../../src/models/enrollment-application-material.model'
import { EnrollmentApplication } from '../../../src/models/enrollment-application.model'
import { User } from '../../../src/models/user.model'

describe('EnrollmentApplicationMaterial Model', () => {
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

    EnrollmentApplication.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      studentName: DataTypes.STRING,
      parentName: DataTypes.STRING,
      contactPhone: DataTypes.STRING,
      status: DataTypes.STRING,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
    }, {
      sequelize,
      modelName: 'EnrollmentApplication',
      tableName: 'enrollment_applications',
      timestamps: true
    })

    // Initialize the model we're testing
    initEnrollmentApplicationMaterial(sequelize)
    
    // Initialize associations
    initEnrollmentApplicationMaterialAssociations()

    await sequelize.sync({ force: true })
  })

  afterEach(async () => {
    await sequelize.close()
  })

  it('should be defined', () => {
    expect(EnrollmentApplicationMaterial).toBeDefined()
  })

  it('should have correct model name', () => {
    expect(EnrollmentApplicationMaterial.tableName).toBe('enrollment_application_materials')
  })

  it('should create a new enrollment application material', async () => {
    // Create dependent records
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'admin' as any,
      status: 'active'
    })

    const application = await EnrollmentApplication.create({
      studentName: 'Test Student',
      parentName: 'Test Parent',
      contactPhone: '1234567890',
      status: 'pending'
    })

    const material = await EnrollmentApplicationMaterial.create({
      applicationId: application.id,
      materialType: 1,
      materialName: 'Birth Certificate',
      fileUrl: 'https://example.com/file.pdf',
      fileSize: 1024,
      fileType: 'application/pdf',
      status: MaterialStatus.PENDING,
      uploadDate: new Date(),
      uploaderId: user.id,
      isVerified: false,
      createdBy: user.id
    })

    expect(material.id).toBeDefined()
    expect(material.applicationId).toBe(application.id)
    expect(material.materialType).toBe(1)
    expect(material.materialName).toBe('Birth Certificate')
    expect(material.fileUrl).toBe('https://example.com/file.pdf')
    expect(material.fileSize).toBe(1024)
    expect(material.fileType).toBe('application/pdf')
    expect(material.status).toBe(MaterialStatus.PENDING)
    expect(material.uploaderId).toBe(user.id)
    expect(material.isVerified).toBe(false)
    expect(material.createdBy).toBe(user.id)
  })

  it('should have correct default values', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'admin' as any,
      status: 'active'
    })

    const application = await EnrollmentApplication.create({
      studentName: 'Test Student',
      parentName: 'Test Parent',
      contactPhone: '1234567890',
      status: 'pending'
    })

    const material = await EnrollmentApplicationMaterial.create({
      applicationId: application.id,
      materialType: 2,
      materialName: 'ID Card',
      fileUrl: 'https://example.com/id.pdf',
      uploadDate: new Date(),
      uploaderId: user.id,
      createdBy: user.id
    })

    expect(material.status).toBe(MaterialStatus.PENDING)
    expect(material.isVerified).toBe(false)
    expect(material.fileSize).toBeNull()
    expect(material.fileType).toBeNull()
    expect(material.verifierId).toBeNull()
    expect(material.verificationTime).toBeNull()
    expect(material.verificationComment).toBeNull()
    expect(material.updatedBy).toBeNull()
  })

  it('should validate required fields', async () => {
    await expect(EnrollmentApplicationMaterial.create({
      // Missing required fields
    } as any)).rejects.toThrow()
  })

  it('should validate materialType range', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'admin' as any,
      status: 'active'
    })

    const application = await EnrollmentApplication.create({
      studentName: 'Test Student',
      parentName: 'Test Parent',
      contactPhone: '1234567890',
      status: 'pending'
    })

    const material = await EnrollmentApplicationMaterial.create({
      applicationId: application.id,
      materialType: 6, // Valid type (other)
      materialName: 'Other Document',
      fileUrl: 'https://example.com/other.pdf',
      uploadDate: new Date(),
      uploaderId: user.id,
      createdBy: user.id
    })

    expect(material.materialType).toBe(6)
  })

  it('should validate status enum values', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'admin' as any,
      status: 'active'
    })

    const application = await EnrollmentApplication.create({
      studentName: 'Test Student',
      parentName: 'Test Parent',
      contactPhone: '1234567890',
      status: 'pending'
    })

    const validStatuses = Object.values(MaterialStatus)
    
    for (const status of validStatuses) {
      const material = await EnrollmentApplicationMaterial.create({
        applicationId: application.id,
        materialType: 1,
        materialName: `Document ${status}`,
        fileUrl: `https://example.com/${status}.pdf`,
        status,
        uploadDate: new Date(),
        uploaderId: user.id,
        createdBy: user.id
      })
      
      expect(material.status).toBe(status)
    }
  })

  it('should have correct associations', () => {
    expect(EnrollmentApplicationMaterial.associations).toBeDefined()
    expect(EnrollmentApplicationMaterial.associations.application).toBeDefined()
    expect(EnrollmentApplicationMaterial.associations.verifier).toBeDefined()
    expect(EnrollmentApplicationMaterial.associations.uploader).toBeDefined()
    expect(EnrollmentApplicationMaterial.associations.creator).toBeDefined()
  })

  it('should belong to enrollment application', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'admin' as any,
      status: 'active'
    })

    const application = await EnrollmentApplication.create({
      studentName: 'Test Student',
      parentName: 'Test Parent',
      contactPhone: '1234567890',
      status: 'pending'
    })

    const material = await EnrollmentApplicationMaterial.create({
      applicationId: application.id,
      materialType: 1,
      materialName: 'Test Document',
      fileUrl: 'https://example.com/test.pdf',
      uploadDate: new Date(),
      uploaderId: user.id,
      createdBy: user.id
    })

    const materialWithApplication = await EnrollmentApplicationMaterial.findOne({
      where: { id: material.id },
      include: ['application']
    })

    expect(materialWithApplication).toBeDefined()
    expect(materialWithApplication?.application).toBeDefined()
    expect(materialWithApplication?.application.id).toBe(application.id)
  })

  it('should belong to uploader user', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'admin' as any,
      status: 'active'
    })

    const application = await EnrollmentApplication.create({
      studentName: 'Test Student',
      parentName: 'Test Parent',
      contactPhone: '1234567890',
      status: 'pending'
    })

    const material = await EnrollmentApplicationMaterial.create({
      applicationId: application.id,
      materialType: 1,
      materialName: 'Test Document',
      fileUrl: 'https://example.com/test.pdf',
      uploadDate: new Date(),
      uploaderId: user.id,
      createdBy: user.id
    })

    const materialWithUploader = await EnrollmentApplicationMaterial.findOne({
      where: { id: material.id },
      include: ['uploader']
    })

    expect(materialWithUploader).toBeDefined()
    expect(materialWithUploader?.uploader).toBeDefined()
    expect(materialWithUploader?.uploader.id).toBe(user.id)
  })

  it('should support soft delete', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'admin' as any,
      status: 'active'
    })

    const application = await EnrollmentApplication.create({
      studentName: 'Test Student',
      parentName: 'Test Parent',
      contactPhone: '1234567890',
      status: 'pending'
    })

    const material = await EnrollmentApplicationMaterial.create({
      applicationId: application.id,
      materialType: 1,
      materialName: 'Test Document',
      fileUrl: 'https://example.com/test.pdf',
      uploadDate: new Date(),
      uploaderId: user.id,
      createdBy: user.id
    })

    await material.destroy()

    const deletedMaterial = await EnrollmentApplicationMaterial.findByPk(material.id, { paranoid: false })
    expect(deletedMaterial).toBeDefined()
    expect(deletedMaterial?.deletedAt).toBeDefined()

    const activeMaterial = await EnrollmentApplicationMaterial.findByPk(material.id)
    expect(activeMaterial).toBeNull()
  })

  it('should have correct indexes', () => {
    const options = (EnrollmentApplicationMaterial as any).options
    expect(options.indexes).toBeDefined()
    expect(options.indexes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ fields: ['application_id'] }),
        expect.objectContaining({ fields: ['material_type'] })
      ])
    )
  })

  it('should have correct table configuration', () => {
    const options = (EnrollmentApplicationMaterial as any).options
    expect(options.timestamps).toBe(true)
    expect(options.paranoid).toBe(true)
    expect(options.underscored).toBe(true)
    expect(options.comment).toBe('招生申请提交的材料表')
  })

  it('should handle verification fields', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'admin' as any,
      status: 'active'
    })

    const verifier = await User.create({
      username: 'verifier',
      email: 'verifier@example.com',
      password: 'hashedpassword',
      role: 'admin' as any,
      status: 'active'
    })

    const application = await EnrollmentApplication.create({
      studentName: 'Test Student',
      parentName: 'Test Parent',
      contactPhone: '1234567890',
      status: 'pending'
    })

    const material = await EnrollmentApplicationMaterial.create({
      applicationId: application.id,
      materialType: 1,
      materialName: 'Test Document',
      fileUrl: 'https://example.com/test.pdf',
      status: MaterialStatus.VERIFIED,
      uploadDate: new Date(),
      uploaderId: user.id,
      isVerified: true,
      verifierId: verifier.id,
      verificationTime: new Date(),
      verificationComment: 'Verified successfully',
      createdBy: user.id,
      updatedBy: verifier.id
    })

    expect(material.isVerified).toBe(true)
    expect(material.verifierId).toBe(verifier.id)
    expect(material.verificationTime).toBeDefined()
    expect(material.verificationComment).toBe('Verified successfully')
    expect(material.updatedBy).toBe(verifier.id)
  })

  it('should handle file metadata correctly', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'admin' as any,
      status: 'active'
    })

    const application = await EnrollmentApplication.create({
      studentName: 'Test Student',
      parentName: 'Test Parent',
      contactPhone: '1234567890',
      status: 'pending'
    })

    const material = await EnrollmentApplicationMaterial.create({
      applicationId: application.id,
      materialType: 1,
      materialName: 'Large Document.pdf',
      fileUrl: 'https://example.com/large.pdf',
      fileSize: 2048576, // 2MB
      fileType: 'application/pdf',
      uploadDate: new Date(),
      uploaderId: user.id,
      createdBy: user.id
    })

    expect(material.materialName).toBe('Large Document.pdf')
    expect(material.fileSize).toBe(2048576)
    expect(material.fileType).toBe('application/pdf')
  })
})