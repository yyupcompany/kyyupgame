import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals'
import request from 'supertest'
import { app } from '../../src/app'
import { setupTestDatabase, cleanupTestDatabase } from '../setup/database'
import { EnrollmentApplication } from '../../src/models/enrollment-application.model'

describe('Enrollment API Integration Tests', () => {
  let authToken: string
  let createdEnrollmentId: number

  beforeAll(async () => {
    // Setup test database
    await sequelize.sync({ force: true })
    
    // Create test user and get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: 'password123'
      })
    
    authToken = loginResponse.body.token
  })

  afterAll(async () => {
    // Cleanup test database
    await sequelize.close()
  })

  beforeEach(async () => {
    // Cleanup enrollments before each test
    await Enrollment.destroy({ where: {} })
  })

  afterEach(async () => {
    // Cleanup after each test if needed
  })

  describe('POST /api/enrollment', () => {
    it('should create a new enrollment successfully', async () => {
      const enrollmentData = {
        studentName: '测试学生',
        parentName: '测试家长',
        parentPhone: '13800138000',
        parentEmail: 'test@example.com',
        address: '北京市朝阳区',
        classPreference: '小一班',
        dateOfBirth: '2020-01-01',
        gender: '男',
        notes: '测试备注'
      }

      const response = await request(app)
        .post('/api/enrollment')
        .set('Authorization', `Bearer ${authToken}`)
        .send(enrollmentData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.studentName).toBe(enrollmentData.studentName)
      expect(response.body.data.parentName).toBe(enrollmentData.parentName)
      expect(response.body.data.status).toBe('pending')
      expect(response.body.data.id).toBeDefined()
      
      createdEnrollmentId = response.body.data.id
    })

    it('should return validation error for missing required fields', async () => {
      const invalidData = {
        studentName: '', // Invalid: empty name
        parentName: '测试家长'
        // Missing required fields
      }

      const response = await request(app)
        .post('/api/enrollment')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('validation')
    })

    it('should return unauthorized error without auth token', async () => {
      const enrollmentData = {
        studentName: '测试学生',
        parentName: '测试家长',
        parentPhone: '13800138000'
      }

      const response = await request(app)
        .post('/api/enrollment')
        .send(enrollmentData)
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Unauthorized')
    })
  })

  describe('GET /api/enrollment', () => {
    beforeEach(async () => {
      // Create test data
      await Enrollment.bulkCreate([
        {
          studentName: '学生1',
          parentName: '家长1',
          parentPhone: '13800138001',
          status: 'pending',
          applicationDate: new Date('2025-01-14')
        },
        {
          studentName: '学生2',
          parentName: '家长2',
          parentPhone: '13800138002',
          status: 'approved',
          applicationDate: new Date('2025-01-13')
        },
        {
          studentName: '学生3',
          parentName: '家长3',
          parentPhone: '13800138003',
          status: 'rejected',
          applicationDate: new Date('2025-01-12')
        }
      ])
    })

    it('should return list of enrollments', async () => {
      const response = await request(app)
        .get('/api/enrollment')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toBeInstanceOf(Array)
      expect(response.body.data.length).toBe(3)
      expect(response.body.total).toBe(3)
    })

    it('should handle pagination parameters', async () => {
      const response = await request(app)
        .get('/api/enrollment?page=1&pageSize=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.length).toBe(2)
      expect(response.body.page).toBe(1)
      expect(response.body.pageSize).toBe(2)
    })

    it('should handle status filter', async () => {
      const response = await request(app)
        .get('/api/enrollment?status=pending')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.length).toBe(1)
      expect(response.body.data[0].status).toBe('pending')
    })

    it('should handle search functionality', async () => {
      const response = await request(app)
        .get('/api/enrollment?search=学生1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.length).toBe(1)
      expect(response.body.data[0].studentName).toBe('学生1')
    })
  })

  describe('GET /api/enrollment/:id', () => {
    beforeEach(async () => {
      const enrollment = await Enrollment.create({
        studentName: '查询学生',
        parentName: '查询家长',
        parentPhone: '13800138888',
        status: 'pending'
      })
      createdEnrollmentId = enrollment.id
    })

    it('should return enrollment by id', async () => {
      const response = await request(app)
        .get(`/api/enrollment/${createdEnrollmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.id).toBe(createdEnrollmentId)
      expect(response.body.data.studentName).toBe('查询学生')
    })

    it('should return 404 for non-existent enrollment', async () => {
      const response = await request(app)
        .get('/api/enrollment/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Enrollment not found')
    })

    it('should return 400 for invalid id format', async () => {
      const response = await request(app)
        .get('/api/enrollment/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Invalid enrollment ID')
    })
  })

  describe('PUT /api/enrollment/:id', () => {
    beforeEach(async () => {
      const enrollment = await Enrollment.create({
        studentName: '更新学生',
        parentName: '更新家长',
        parentPhone: '13800139999',
        status: 'pending'
      })
      createdEnrollmentId = enrollment.id
    })

    it('should update enrollment successfully', async () => {
      const updateData = {
        status: 'approved',
        classAssigned: '小一班',
        notes: '审批通过'
      }

      const response = await request(app)
        .put(`/api/enrollment/${createdEnrollmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.status).toBe('approved')
      expect(response.body.data.classAssigned).toBe('小一班')
      expect(response.body.data.notes).toBe('审批通过')
    })

    it('should return 404 for non-existent enrollment', async () => {
      const updateData = { status: 'approved' }

      const response = await request(app)
        .put('/api/enrollment/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Enrollment not found')
    })

    it('should return validation error for invalid update data', async () => {
      const invalidUpdateData = {
        status: 'invalid_status' // Invalid status value
      }

      const response = await request(app)
        .put(`/api/enrollment/${createdEnrollmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidUpdateData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('validation')
    })
  })

  describe('DELETE /api/enrollment/:id', () => {
    beforeEach(async () => {
      const enrollment = await Enrollment.create({
        studentName: '删除学生',
        parentName: '删除家长',
        parentPhone: '13800140000',
        status: 'pending'
      })
      createdEnrollmentId = enrollment.id
    })

    it('should delete enrollment successfully', async () => {
      const response = await request(app)
        .delete(`/api/enrollment/${createdEnrollmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('Enrollment deleted successfully')

      // Verify enrollment is deleted
      const getResponse = await request(app)
        .get(`/api/enrollment/${createdEnrollmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })

    it('should return 404 for non-existent enrollment', async () => {
      const response = await request(app)
        .delete('/api/enrollment/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Enrollment not found')
    })

    it('should return 409 when trying to delete approved enrollment', async () => {
      // First approve the enrollment
      await Enrollment.update(
        { status: 'approved' },
        { where: { id: createdEnrollmentId } }
      )

      const response = await request(app)
        .delete(`/api/enrollment/${createdEnrollmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(409)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Cannot delete approved enrollment')
    })
  })

  describe('POST /api/enrollment/:id/approve', () => {
    beforeEach(async () => {
      const enrollment = await Enrollment.create({
        studentName: '审批学生',
        parentName: '审批家长',
        parentPhone: '13800141111',
        status: 'pending',
        classPreference: '小一班'
      })
      createdEnrollmentId = enrollment.id
    })

    it('should approve enrollment successfully', async () => {
      const approveData = {
        classAssigned: '小一班'
      }

      const response = await request(app)
        .post(`/api/enrollment/${createdEnrollmentId}/approve`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(approveData)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('Enrollment approved successfully')
      expect(response.body.data.status).toBe('approved')
      expect(response.body.data.classAssigned).toBe('小一班')
    })

    it('should return 404 for non-existent enrollment', async () => {
      const approveData = { classAssigned: '小一班' }

      const response = await request(app)
        .post('/api/enrollment/99999/approve')
        .set('Authorization', `Bearer ${authToken}`)
        .send(approveData)
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Enrollment not found')
    })

    it('should return 400 when classAssigned is missing', async () => {
      const response = await request(app)
        .post(`/api/enrollment/${createdEnrollmentId}/approve`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Class assignment is required')
    })
  })

  describe('GET /api/enrollment/statistics', () => {
    beforeEach(async () => {
      await Enrollment.bulkCreate([
        { studentName: '统计学生1', parentName: '统计家长1', status: 'pending' },
        { studentName: '统计学生2', parentName: '统计家长2', status: 'pending' },
        { studentName: '统计学生3', parentName: '统计家长3', status: 'approved' },
        { studentName: '统计学生4', parentName: '统计家长4', status: 'approved' },
        { studentName: '统计学生5', parentName: '统计家长5', status: 'rejected' }
      ])
    })

    it('should return enrollment statistics', async () => {
      const response = await request(app)
        .get('/api/enrollment/statistics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toBeDefined()
      expect(response.body.data.total).toBe(5)
      expect(response.body.data.pending).toBe(2)
      expect(response.body.data.approved).toBe(2)
      expect(response.body.data.rejected).toBe(1)
    })
  })
})