import { describe, it, expect } from 'vitest'
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';
import { vi } from 'vitest'
import {
  normalizeResponse,
  transformUserData,
  transformUserStatus,
  transformUserRole,
  formatDate,
  calculateAge,
  transformStudentData,
  transformStudentStatus,
  transformTeacherPosition,
  transformTeacherData,
  transformTeacherStatus,
  transformGender,
  transformClassData,
  transformStudentList,
  transformTeacherList,
  transformClassList,
  transformListResponse,
  transformStudentFormData,
  transformStudentStatusToBackend,
  transformTeacherPositionToBackend,
  transformTeacherStatusToBackend,
  transformTeacherFormData,
  transformRoleData,
  transformPermissionData,
  transformUserList,
  transformRoleList,
  transformPermissionList,
  transformUserFormData,
  transformRoleFormData,
  transformPermissionFormData,
  transformActivityData,
  transformActivityRegistrationData,
  transformActivityList,
  transformActivityRegistrationList,
  transformActivityFormData,
  transformActivityRegistrationFormData,
  transformParentData,
  transformParentFollowUpData,
  transformParentList,
  transformParentFollowUpList,
  transformParentFormData,
  transformParentFollowUpFormData,
  transformDashboardStats,
  transformDashboardOverview,
  transformTodoData,
  transformScheduleData,
  transformEnrollmentPlanData,
  transformEnrollmentPlanList,
  transformEnrollmentPlanFormData,
  transformKindergartenData,
  transformAIMemoryData,
  transformMarketingCampaignData,
  transformKindergartenList,
  transformAIMemoryList,
  transformMarketingCampaignList
} from '@/utils/dataTransform'

// 控制台错误检测变量
let consoleSpy: any

describe('Data Transform Utils', () => {
    beforeEach(() => {
      startConsoleMonitoring()
      vi.clearAllMocks()
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    afterEach(() => {
      expectNoConsoleErrors()
      stopConsoleMonitoring()
    })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
  describe('normalizeResponse', () => {
    it('should handle null/undefined response', () => {
      expect(normalizeResponse(null)).toEqual({ items: [], total: 0, success: false })
      expect(normalizeResponse(undefined)).toEqual({ items: [], total: 0, success: false })
    })

    it('should handle direct array response', () => {
      const array = [{ id: 1 }, { id: 2 }, { id: 3 }]
      const result = normalizeResponse(array)
      
      expect(result).toEqual({
        items: array,
        total: array.length,
        success: true
      })
    })

    it('should handle response with data array', () => {
      const response = {
        data: [{ id: 1 }, { id: 2 }],
        total: 2,
        success: true
      }
      const result = normalizeResponse(response)
      
      expect(result).toEqual({
        items: response.data,
        total: response.total,
        success: response.success
      })
    })

    it('should handle response with data.items', () => {
      const response = {
        data: {
          items: [{ id: 1 }, { id: 2 }],
          total: 2
        },
        success: true
      }
      const result = normalizeResponse(response)
      
      expect(result).toEqual({
        items: response.data.items,
        total: response.data.total,
        success: response.success
      })
    })

    it('should handle response with data.list (converts to items)', () => {
      const response = {
        data: {
          list: [{ id: 1 }, { id: 2 }],
          total: 2
        },
        success: true
      }
      const result = normalizeResponse(response)
      
      expect(result).toEqual({
        items: response.data.list,
        total: response.data.total,
        success: response.success
      })
    })

    it('should handle response with direct items', () => {
      const response = {
        items: [{ id: 1 }, { id: 2 }],
        total: 2,
        success: true
      }
      const result = normalizeResponse(response)
      
      expect(result).toEqual({
        items: response.items,
        total: response.total,
        success: response.success
      })
    })

    it('should handle response with direct list (converts to items)', () => {
      const response = {
        list: [{ id: 1 }, { id: 2 }],
        total: 2,
        success: true
      }
      const result = normalizeResponse(response)
      
      expect(result).toEqual({
        items: response.list,
        total: response.total,
        success: response.success
      })
    })

    it('should handle empty response', () => {
      const response = {}
      const result = normalizeResponse(response)
      
      expect(result).toEqual({
        items: [],
        total: 0,
        success: true
      })
    })
  })

  describe('transformUserData', () => {
    it('should handle null/undefined input', () => {
      expect(transformUserData(null)).toBeNull()
      expect(transformUserData(undefined)).toBeNull()
    })

    it('should transform user data correctly', () => {
      const backendData = {
        id: 1,
        username: 'john_doe',
        email: 'john@example.com',
        real_name: 'John Doe',
        phone: '13800138000',
        avatar_url: 'avatar.jpg',
        status: 1,
        role: 1,
        department: 'IT',
        position: 'Developer',
        kindergarten_id: 1,
        created_at: '2023-01-01',
        updated_at: '2023-01-02',
        last_login_at: '2023-01-03'
      }
      
      const result = transformUserData(backendData)
      
      expect(result).toEqual({
        id: 1,
        username: 'john_doe',
        email: 'john@example.com',
        realName: 'John Doe',
        phone: '13800138000',
        avatarUrl: 'avatar.jpg',
        status: 'ACTIVE',
        role: 'ADMIN',
        department: 'IT',
        position: 'Developer',
        kindergartenId: 1,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-02',
        lastLoginAt: '2023-01-03',
        real_name: undefined,
        avatar_url: undefined,
        kindergarten_id: undefined,
        created_at: undefined,
        updated_at: undefined,
        last_login_at: undefined
      })
    })

    it('should handle missing fields gracefully', () => {
      const backendData = {
        id: 1,
        username: 'john_doe'
      }
      
      const result = transformUserData(backendData)
      
      expect(result).toEqual({
        id: 1,
        username: 'john_doe',
        email: undefined,
        realName: undefined,
        phone: undefined,
        avatarUrl: undefined,
        status: 'INACTIVE',
        role: 'STAFF',
        department: undefined,
        position: undefined,
        kindergartenId: undefined,
        createdAt: '',
        updatedAt: '',
        lastLoginAt: '',
        real_name: undefined,
        avatar_url: undefined,
        kindergarten_id: undefined,
        created_at: undefined,
        updated_at: undefined,
        last_login_at: undefined
      })
    })
  })

  describe('transformUserStatus', () => {
    it('should transform numeric status to string', () => {
      expect(transformUserStatus(1)).toBe('ACTIVE')
      expect(transformUserStatus(0)).toBe('INACTIVE')
      expect(transformUserStatus(2)).toBe('LOCKED')
      expect(transformUserStatus(3)).toBe('SUSPENDED')
    })

    it('should return string status as-is', () => {
      expect(transformUserStatus('ACTIVE')).toBe('ACTIVE')
      expect(transformUserStatus('INACTIVE')).toBe('INACTIVE')
    })

    it('should handle unknown numeric status', () => {
      expect(transformUserStatus(99)).toBe('INACTIVE')
      expect(transformUserStatus(-1)).toBe('INACTIVE')
    })
  })

  describe('transformUserRole', () => {
    it('should transform numeric role to string', () => {
      expect(transformUserRole(1)).toBe('ADMIN')
      expect(transformUserRole(2)).toBe('PRINCIPAL')
      expect(transformUserRole(3)).toBe('TEACHER')
      expect(transformUserRole(4)).toBe('PARENT')
      expect(transformUserRole(5)).toBe('STAFF')
    })

    it('should return string role as-is', () => {
      expect(transformUserRole('ADMIN')).toBe('ADMIN')
      expect(transformUserRole('TEACHER')).toBe('TEACHER')
    })

    it('should handle unknown numeric role', () => {
      expect(transformUserRole(99)).toBe('STAFF')
      expect(transformUserRole(-1)).toBe('STAFF')
    })
  })

  describe('formatDate', () => {
    it('should format date string correctly', () => {
      expect(formatDate('2023-01-01T00:00:00Z')).toBe('2023-01-01')
      expect(formatDate('2023-12-31T23:59:59Z')).toBe('2023-12-31')
    })

    it('should format Date object correctly', () => {
      const date = new Date('2023-01-01T00:00:00Z')
      expect(formatDate(date)).toBe('2023-01-01')
    })

    it('should handle null/undefined input', () => {
      expect(formatDate(null)).toBe('')
      expect(formatDate(undefined)).toBe('')
    })

    it('should handle invalid date gracefully', () => {
      expect(formatDate('invalid-date')).toBe('')
    })
  })

  describe('calculateAge', () => {
    beforeEach(() => {
      // 固定测试时间为2023年6月15日
      vi.setSystemTime(new Date(2023, 5, 15))
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    afterEach(() => {
      // 恢复系统时间
      vi.useRealTimers()
    })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

    it('should calculate age correctly', () => {
      const birthDate = new Date(1998, 5, 15) // 1998年6月15日，正好25岁

      expect(calculateAge(birthDate.toISOString())).toBe(25)
    })

    it('should handle birthday not yet occurred this year', () => {
      const birthDate = new Date(2000, 7, 20) // 2000年8月20日，生日还没到

      expect(calculateAge(birthDate.toISOString())).toBe(22)
    })

    it('should handle birthday already occurred this year', () => {
      const birthDate = new Date(2000, 3, 20) // 2000年4月20日，生日已过

      expect(calculateAge(birthDate.toISOString())).toBe(23)
    })

    it('should handle empty/invalid input', () => {
      expect(calculateAge('')).toBe(0)
      expect(calculateAge('invalid-date')).toBe(0)
    })
  })

  describe('transformStudentData', () => {
    it('should transform student data correctly', () => {
      const backendData = {
        id: 1,
        name: '张三',
        gender: 1,
        birth_date: '2018-01-01',
        enrollment_date: '2023-01-01',
        graduation_date: '2024-01-01',
        status: 1,
        class_id: 1,
        class: { name: '小一班' },
        kindergarten_id: 1,
        kindergarten: { name: '实验幼儿园' },
        parent: {
          name: '张爸爸',
          relationship: '父亲',
          phone: '13800138000',
          email: 'zhang@example.com',
          address: '北京市朝阳区'
        },
        student_no: 'STU001',
        photo_url: 'student.jpg',
        health_condition: '良好',
        allergy_history: '无',
        special_needs: '无',
        created_at: '2023-01-01',
        updated_at: '2023-01-02'
      }
      
      const result = transformStudentData(backendData)
      
      expect(result).toEqual({
        id: 1,
        name: '张三',
        gender: 'MALE',
        birthDate: '2018-01-01',
        age: expect.any(Number),
        enrollmentDate: '2023-01-01',
        graduationDate: '2024-01-01',
        status: 'ACTIVE',
        currentClassId: 1,
        currentClassName: '小一班',
        kindergartenId: 1,
        kindergartenName: '实验幼儿园',
        guardian: {
          name: '张爸爸',
          relationship: '父亲',
          phone: '13800138000',
          email: 'zhang@example.com',
          address: '北京市朝阳区'
        },
        studentNo: 'STU001',
        avatar: 'student.jpg',
        healthCondition: '良好',
        allergyHistory: '无',
        specialNeeds: '无',
        createdAt: '2023-01-01',
        updatedAt: '2023-01-02',
        birth_date: undefined,
        student_no: undefined,
        kindergarten_id: undefined,
        class_name: undefined,
        kindergarten_name: undefined,
        enrollment_date: undefined,
        graduation_date: undefined,
        health_condition: undefined,
        allergy_history: undefined,
        special_needs: undefined,
        photo_url: undefined,
        created_at: undefined,
        updated_at: undefined,
        class: undefined,
        kindergarten: undefined,
        parent: undefined
      })
    })

    it('should handle female student', () => {
      const backendData = {
        id: 1,
        name: '李四',
        gender: 2,
        birth_date: '2018-01-01'
      }
      
      const result = transformStudentData(backendData)
      
      expect(result.gender).toBe('FEMALE')
    })

    it('should handle missing parent data', () => {
      const backendData = {
        id: 1,
        name: '王五',
        gender: 1,
        birth_date: '2018-01-01'
      }
      
      const result = transformStudentData(backendData)
      
      expect(result.guardian).toBeUndefined()
    })
  })

  describe('transformStudentStatus', () => {
    it('should transform numeric status to string', () => {
      expect(transformStudentStatus(1)).toBe('ACTIVE')
      expect(transformStudentStatus(3)).toBe('GRADUATED')
      expect(transformStudentStatus(0)).toBe('INACTIVE')
      expect(transformStudentStatus(2)).toBe('SUSPENDED')
      expect(transformStudentStatus(4)).toBe('PRE_ADMISSION')
    })

    it('should handle unknown status', () => {
      expect(transformStudentStatus(99)).toBe('INACTIVE')
    })
  })

  describe('transformTeacherPosition', () => {
    it('should transform numeric position to string', () => {
      expect(transformTeacherPosition(1)).toBe('PRINCIPAL')
      expect(transformTeacherPosition(2)).toBe('VICE_PRINCIPAL')
      expect(transformTeacherPosition(3)).toBe('RESEARCH_DIRECTOR')
      expect(transformTeacherPosition(4)).toBe('HEAD_TEACHER')
      expect(transformTeacherPosition(5)).toBe('REGULAR_TEACHER')
      expect(transformTeacherPosition(6)).toBe('ASSISTANT_TEACHER')
    })

    it('should return string position as-is', () => {
      expect(transformTeacherPosition('PRINCIPAL')).toBe('PRINCIPAL')
      expect(transformTeacherPosition('TEACHER')).toBe('TEACHER')
    })

    it('should handle unknown numeric position', () => {
      expect(transformTeacherPosition(99)).toBe('REGULAR_TEACHER')
    })
  })

  describe('transformTeacherData', () => {
    it('should transform teacher data correctly', () => {
      const backendData = {
        id: 1,
        user: {
          name: '赵老师',
          gender: 1,
          phone: '13800138000',
          email: 'zhao@example.com'
        },
        teacherNo: 'TCH001',
        status: 1,
        position: 4,
        type: 'FULL_TIME',
        department: '教学部',
        entryDate: '2020-01-01',
        kindergarten_id: 1,
        kindergarten: { name: '实验幼儿园' },
        classes: [
          { id: 1, name: '小一班' },
          { id: 2, name: '小二班' }
        ],
        work_experience: '5年教学经验',
        emergency_contact: '钱老师',
        emergency_phone: '13900139000',
        created_at: '2023-01-01',
        updated_at: '2023-01-02'
      }
      
      const result = transformTeacherData(backendData)
      
      expect(result).toEqual({
        id: 1,
        name: '赵老师',
        gender: 'MALE',
        phone: '13800138000',
        email: 'zhao@example.com',
        employeeId: 'TCH001',
        status: 'ACTIVE',
        position: 'HEAD_TEACHER',
        title: 'HEAD_TEACHER',
        type: 'FULL_TIME',
        department: '教学部',
        hireDate: '2020-01-01',
        kindergartenId: 1,
        kindergartenName: '实验幼儿园',
        classes: [
          { id: 1, name: '小一班' },
          { id: 2, name: '小二班' }
        ],
        classIds: [1, 2],
        classNames: ['小一班', '小二班'],
        createdAt: '2023-01-01',
        updatedAt: '2023-01-02',
        workExperience: '5年教学经验',
        emergencyContact: '钱老师',
        emergencyPhone: '13900139000',
        user: undefined,
        kindergarten: undefined,
        teacherNo: undefined,
        hire_date: undefined,
        work_experience: undefined,
        emergency_contact: undefined,
        emergency_phone: undefined,
        created_at: undefined,
        updated_at: undefined
      })
    })

    it('should handle missing user data', () => {
      const backendData = {
        id: 1,
        name: '孙老师',
        gender: 2,
        phone: '13800138000',
        email: 'sun@example.com'
      }
      
      const result = transformTeacherData(backendData)
      
      expect(result.name).toBe('孙老师')
      expect(result.gender).toBe('FEMALE')
    })
  })

  describe('transformTeacherStatus', () => {
    it('should transform numeric status to string', () => {
      expect(transformTeacherStatus(1)).toBe('ACTIVE')
      expect(transformTeacherStatus(2)).toBe('ON_LEAVE')
      expect(transformTeacherStatus(0)).toBe('RESIGNED')
      expect(transformTeacherStatus(3)).toBe('PROBATION')
    })

    it('should return string status as-is', () => {
      expect(transformTeacherStatus('ACTIVE')).toBe('ACTIVE')
      expect(transformTeacherStatus('ON_LEAVE')).toBe('ON_LEAVE')
    })

    it('should handle unknown numeric status', () => {
      expect(transformTeacherStatus(99)).toBe('ACTIVE')
    })
  })

  describe('transformGender', () => {
    it('should transform numeric gender to string', () => {
      expect(transformGender(1)).toBe('MALE')
      expect(transformGender(2)).toBe('FEMALE')
    })

    it('should return string gender as-is', () => {
      expect(transformGender('MALE')).toBe('MALE')
      expect(transformGender('FEMALE')).toBe('FEMALE')
    })

    it('should handle unknown numeric gender', () => {
      expect(transformGender(0)).toBe('MALE')
      expect(transformGender(3)).toBe('MALE')
    })
  })

  describe('transformClassData', () => {
    it('should transform class data correctly', () => {
      const backendData = {
        id: 1,
        name: '小一班',
        kindergarten_id: 1,
        head_teacher_id: 1,
        assistant_teacher_id: 2,
        current_student_count: 25,
        image_url: 'class.jpg',
        created_at: '2023-01-01',
        updated_at: '2023-01-02'
      }
      
      const result = transformClassData(backendData)
      
      expect(result).toEqual({
        id: 1,
        name: '小一班',
        kindergartenId: 1,
        headTeacherId: 1,
        assistantTeacherId: 2,
        currentStudentCount: 25,
        imageUrl: 'class.jpg',
        createdAt: '2023-01-01',
        updatedAt: '2023-01-02'
      })
    })
  })

  describe('transformStudentList', () => {
    it('should transform array of students', () => {
      const students = [
        { id: 1, name: '张三', gender: 1, birth_date: '2018-01-01' },
        { id: 2, name: '李四', gender: 2, birth_date: '2018-02-01' }
      ]
      
      const result = transformStudentList(students)
      
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        id: 1,
        name: '张三',
        gender: 'MALE',
        birthDate: '2018-01-01',
        age: expect.any(Number),
        enrollmentDate: '',
        graduationDate: '',
        status: 'INACTIVE',
        currentClassId: undefined,
        currentClassName: undefined,
        kindergartenId: undefined,
        kindergartenName: undefined,
        guardian: undefined,
        studentNo: undefined,
        avatar: undefined,
        healthCondition: undefined,
        allergyHistory: undefined,
        specialNeeds: undefined,
        createdAt: '',
        updatedAt: '',
        birth_date: undefined,
        student_no: undefined,
        kindergarten_id: undefined,
        class_name: undefined,
        kindergarten_name: undefined,
        enrollment_date: undefined,
        graduation_date: undefined,
        health_condition: undefined,
        allergy_history: undefined,
        special_needs: undefined,
        photo_url: undefined,
        created_at: undefined,
        updated_at: undefined,
        class: undefined,
        kindergarten: undefined,
        parent: undefined
      })
    })

    it('should handle empty array', () => {
      expect(transformStudentList([])).toEqual([])
    })

    it('should handle non-array input', () => {
      expect(transformStudentList(null as any)).toEqual([])
      expect(transformStudentList(undefined as any)).toEqual([])
      expect(transformStudentList({} as any)).toEqual([])
    })
  })

  describe('transformTeacherList', () => {
    it('should transform array of teachers', () => {
      const teachers = [
        { id: 1, name: '赵老师', gender: 1, position: 4 },
        { id: 2, name: '钱老师', gender: 2, position: 5 }
      ]
      
      const result = transformTeacherList(teachers)
      
      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('赵老师')
      expect(result[0].gender).toBe('MALE')
      expect(result[0].position).toBe('HEAD_TEACHER')
      expect(result[1].name).toBe('钱老师')
      expect(result[1].gender).toBe('FEMALE')
      expect(result[1].position).toBe('REGULAR_TEACHER')
    })
  })

  describe('transformClassList', () => {
    it('should transform array of classes', () => {
      const classes = [
        { id: 1, name: '小一班', kindergarten_id: 1 },
        { id: 2, name: '小二班', kindergarten_id: 1 }
      ]
      
      const result = transformClassList(classes)
      
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        id: 1,
        name: '小一班',
        kindergartenId: 1,
        headTeacherId: undefined,
        assistantTeacherId: undefined,
        currentStudentCount: undefined,
        imageUrl: undefined,
        createdAt: undefined,
        updatedAt: undefined
      })
    })
  })

  describe('transformListResponse', () => {
    it('should apply data transformer to items', () => {
      const response = {
        data: {
          list: [{ id: 1, name: 'test' }, { id: 2, name: 'test2' }],
          total: 2
        },
        success: true
      }
      
      const transformer = (item: any) => ({ ...item, transformed: true })
      
      const result = transformListResponse(response, transformer)
      
      expect(result).toEqual({
        items: [
          { id: 1, name: 'test', transformed: true },
          { id: 2, name: 'test2', transformed: true }
        ],
        total: 2,
        success: true
      })
    })

    it('should work without transformer', () => {
      const response = {
        data: {
          list: [{ id: 1, name: 'test' }],
          total: 1
        },
        success: true
      }
      
      const result = transformListResponse(response)
      
      expect(result).toEqual({
        items: [{ id: 1, name: 'test' }],
        total: 1,
        success: true
      })
    })
  })

  describe('transformStudentFormData', () => {
    it('should transform frontend data to backend format', () => {
      const frontendData = {
        name: '张三',
        gender: 'MALE',
        birthDate: '2018-01-01',
        studentNo: 'STU001',
        kindergartenId: 1,
        enrollmentDate: '2023-01-01',
        graduationDate: '2024-01-01',
        healthCondition: '良好',
        allergyHistory: '无',
        specialNeeds: '无',
        photoUrl: 'student.jpg',
        status: 'ACTIVE'
      }
      
      const result = transformStudentFormData(frontendData)
      
      expect(result).toEqual({
        name: '张三',
        gender: 1,
        birth_date: '2018-01-01',
        student_no: 'STU001',
        kindergarten_id: 1,
        enrollment_date: '2023-01-01',
        graduation_date: '2024-01-01',
        health_condition: '良好',
        allergy_history: '无',
        special_needs: '无',
        photo_url: 'student.jpg',
        status: 1,
        birthDate: undefined,
        studentNo: undefined,
        kindergartenId: undefined,
        enrollmentDate: undefined,
        graduationDate: undefined,
        healthCondition: undefined,
        allergyHistory: undefined,
        specialNeeds: undefined,
        photoUrl: undefined
      })
    })

    it('should handle female gender', () => {
      const frontendData = {
        name: '李四',
        gender: 'FEMALE'
      }
      
      const result = transformStudentFormData(frontendData)
      
      expect(result.gender).toBe(2)
    })
  })

  describe('transformStudentStatusToBackend', () => {
    it('should transform string status to numeric', () => {
      expect(transformStudentStatusToBackend('ACTIVE')).toBe(1)
      expect(transformStudentStatusToBackend('GRADUATED')).toBe(3)
      expect(transformStudentStatusToBackend('INACTIVE')).toBe(0)
      expect(transformStudentStatusToBackend('SUSPENDED')).toBe(2)
      expect(transformStudentStatusToBackend('PRE_ADMISSION')).toBe(4)
    })

    it('should handle unknown status', () => {
      expect(transformStudentStatusToBackend('UNKNOWN')).toBe(0)
    })
  })

  describe('transformTeacherPositionToBackend', () => {
    it('should transform string position to numeric', () => {
      expect(transformTeacherPositionToBackend('PRINCIPAL')).toBe(1)
      expect(transformTeacherPositionToBackend('VICE_PRINCIPAL')).toBe(2)
      expect(transformTeacherPositionToBackend('RESEARCH_DIRECTOR')).toBe(3)
      expect(transformTeacherPositionToBackend('HEAD_TEACHER')).toBe(4)
      expect(transformTeacherPositionToBackend('REGULAR_TEACHER')).toBe(5)
      expect(transformTeacherPositionToBackend('ASSISTANT_TEACHER')).toBe(6)
    })

    it('should handle unknown position', () => {
      expect(transformTeacherPositionToBackend('UNKNOWN')).toBe(5)
    })
  })

  describe('transformTeacherStatusToBackend', () => {
    it('should transform string status to numeric', () => {
      expect(transformTeacherStatusToBackend('ACTIVE')).toBe(1)
      expect(transformTeacherStatusToBackend('ON_LEAVE')).toBe(2)
      expect(transformTeacherStatusToBackend('RESIGNED')).toBe(0)
      expect(transformTeacherStatusToBackend('PROBATION')).toBe(3)
    })

    it('should handle unknown status', () => {
      expect(transformTeacherStatusToBackend('UNKNOWN')).toBe(1)
    })
  })

  describe('transformTeacherFormData', () => {
    it('should transform frontend data to backend format', () => {
      const frontendData = {
        realName: '赵老师',
        phone: '13800138000',
        employeeId: 'TCH001',
        kindergartenId: 1,
        hireDate: '2020-01-01',
        workExperience: '5年教学经验',
        emergencyContact: '钱老师',
        emergencyPhone: '13900139000',
        gender: 'MALE',
        position: 'HEAD_TEACHER',
        status: 'ACTIVE'
      }
      
      const result = transformTeacherFormData(frontendData)
      
      expect(result).toEqual({
        real_name: '赵老师',
        phone_number: '13800138000',
        employee_id: 'TCH001',
        kindergarten_id: 1,
        hire_date: '2020-01-01',
        work_experience: '5年教学经验',
        emergency_contact: '钱老师',
        emergency_phone: '13900139000',
        gender: 1,
        position: 4,
        status: 1,
        realName: undefined,
        phoneNumber: undefined,
        employeeId: undefined,
        kindergartenId: undefined,
        hireDate: undefined,
        workExperience: undefined,
        emergencyContact: undefined,
        emergencyPhone: undefined
      })
    })
  })

  describe('transformRoleData', () => {
    it('should transform role data correctly', () => {
      const backendData = {
        id: 1,
        name: '管理员',
        is_system: true,
        created_at: '2023-01-01',
        updated_at: '2023-01-02'
      }
      
      const result = transformRoleData(backendData)
      
      expect(result).toEqual({
        id: 1,
        name: '管理员',
        isSystem: true,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-02',
        is_system: undefined,
        created_at: undefined,
        updated_at: undefined
      })
    })
  })

  describe('transformPermissionData', () => {
    it('should transform permission data correctly', () => {
      const backendData = {
        id: 1,
        name: '用户管理',
        parent_id: 0,
        created_at: '2023-01-01',
        updated_at: '2023-01-02'
      }
      
      const result = transformPermissionData(backendData)
      
      expect(result).toEqual({
        id: 1,
        name: '用户管理',
        parentId: 0,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-02',
        parent_id: undefined,
        created_at: undefined,
        updated_at: undefined
      })
    })
  })

  describe('transformActivityData', () => {
    it('should transform dashboard activity data', () => {
      const backendData = {
        activityName: '春季运动会',
        participantCount: 100,
        completionRate: 85
      }
      
      const result = transformActivityData(backendData)
      
      expect(result).toEqual({
        activityName: '春季运动会',
        participantCount: 100,
        completionRate: 85
      })
    })

    it('should transform full activity data', () => {
      const backendData = {
        id: 1,
        name: '春季运动会',
        activity_type: 'SPORTS',
        cover_image: 'sports.jpg',
        start_time: '2023-03-01T09:00:00Z',
        end_time: '2023-03-01T17:00:00Z',
        registration_start_time: '2023-02-01T00:00:00Z',
        registration_end_time: '2023-02-28T23:59:59Z',
        needs_approval: true,
        registered_count: 50,
        kindergarten_id: 1,
        plan_id: 1,
        created_at: '2023-01-01',
        updated_at: '2023-01-02'
      }
      
      const result = transformActivityData(backendData)
      
      expect(result).toEqual({
        id: 1,
        name: '春季运动会',
        activityType: 'SPORTS',
        coverImage: 'sports.jpg',
        startTime: '2023-03-01T09:00:00Z',
        endTime: '2023-03-01T17:00:00Z',
        registrationStartTime: '2023-02-01T00:00:00Z',
        registrationEndTime: '2023-02-28T23:59:59Z',
        needsApproval: true,
        registeredCount: 50,
        kindergartenId: 1,
        planId: 1,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-02',
        activity_type: undefined,
        cover_image: undefined,
        start_time: undefined,
        end_time: undefined,
        registration_start_time: undefined,
        registration_end_time: undefined,
        needs_approval: undefined,
        registered_count: undefined,
        kindergarten_id: undefined,
        plan_id: undefined,
        created_at: undefined,
        updated_at: undefined
      })
    })
  })

  describe('transformDashboardStats', () => {
    it('should transform dashboard stats correctly', () => {
      const backendData = {
        userCount: 100,
        kindergartenCount: 5,
        studentCount: 500,
        enrollmentCount: 50,
        activityCount: 20,
        teacherCount: 30,
        classCount: 15,
        enrollmentRate: 85.5,
        attendanceRate: 92.3,
        graduationRate: 95.0
      }
      
      const result = transformDashboardStats(backendData)
      
      expect(result).toEqual({
        userCount: 100,
        kindergartenCount: 5,
        studentCount: 500,
        enrollmentCount: 50,
        activityCount: 20,
        teacherCount: 30,
        classCount: 15,
        enrollmentRate: 85.5,
        attendanceRate: 92.3,
        graduationRate: 95.0
      })
    })

    it('should handle missing fields with defaults', () => {
      const backendData = {
        userCount: 100
      }
      
      const result = transformDashboardStats(backendData)
      
      expect(result).toEqual({
        userCount: 100,
        kindergartenCount: 0,
        studentCount: 0,
        enrollmentCount: 0,
        activityCount: 0,
        teacherCount: 100,
        classCount: 0,
        enrollmentRate: 0,
        attendanceRate: 0,
        graduationRate: 0
      })
    })
  })

  describe('transformTodoData', () => {
    it('should transform todo data correctly', () => {
      const backendData = {
        id: 1,
        title: '完成报告',
        description: '需要完成月度报告',
        status: 'PENDING',
        priority: 1,
        dueDate: '2023-01-31',
        userId: 1,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-02'
      }
      
      const result = transformTodoData(backendData)
      
      expect(result).toEqual({
        id: 1,
        title: '完成报告',
        description: '需要完成月度报告',
        status: 'pending',
        priority: 'low',
        dueDate: '2023-01-31',
        userId: 1,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-02',
        completedDate: undefined,
        assignedTo: undefined,
        tags: undefined,
        relatedId: undefined,
        relatedType: undefined,
        notify: undefined,
        notifyTime: undefined,
        deletedAt: undefined
      })
    })

    it('should handle different priority levels', () => {
      const priorities = [0, 1, 2, 3]
      const expectedPriorities = ['low', 'medium', 'high', 'high']
      
      priorities.forEach((priority, index) => {
        const backendData = {
          id: 1,
          title: 'Task',
          status: 'PENDING',
          priority: priority
        }
        
        const result = transformTodoData(backendData)
        expect(result.priority).toBe(expectedPriorities[index])
      })
    })

    it('should handle different status values', () => {
      const statuses = ['PENDING', 'COMPLETED', 'IN_PROGRESS']
      const expectedStatuses = ['pending', 'completed', 'in_progress']
      
      statuses.forEach((status, index) => {
        const backendData = {
          id: 1,
          title: 'Task',
          status: status,
          priority: 1
        }
        
        const result = transformTodoData(backendData)
        expect(result.status).toBe(expectedStatuses[index])
      })
    })
  })

  describe('Integration Tests', () => {
    it('should handle complete data transformation workflow', () => {
      const backendResponse = {
        data: {
          list: [
            {
              id: 1,
              name: '张三',
              gender: 1,
              birth_date: '2018-01-01',
              status: 1,
              class: { name: '小一班' }
            },
            {
              id: 2,
              name: '李四',
              gender: 2,
              birth_date: '2018-02-01',
              status: 3,
              class: { name: '小二班' }
            }
          ],
          total: 2
        },
        success: true
      }
      
      const normalized = normalizeResponse(backendResponse)
      const transformed = transformListResponse(normalized, transformStudentData)
      
      expect(transformed.items).toHaveLength(2)
      expect(transformed.items[0].name).toBe('张三')
      expect(transformed.items[0].gender).toBe('MALE')
      expect(transformed.items[0].status).toBe('ACTIVE')
      expect(transformed.items[1].name).toBe('李四')
      expect(transformed.items[1].gender).toBe('FEMALE')
      expect(transformed.items[1].status).toBe('GRADUATED')
    })

    it('should handle form data round trip transformation', () => {
      const originalData = {
        name: '张三',
        gender: 'MALE',
        birthDate: '2018-01-01',
        status: 'ACTIVE'
      }
      
      const backendData = transformStudentFormData(originalData)
      const frontendData = transformStudentData(backendData)
      
      expect(frontendData.name).toBe(originalData.name)
      expect(frontendData.gender).toBe(originalData.gender)
      expect(frontendData.birthDate).toBe(originalData.birthDate)
      expect(frontendData.status).toBe(originalData.status)
    })

    it('should handle complex nested data structures', () => {
      const complexData = {
        users: [
          {
            id: 1,
            username: 'admin',
            real_name: '管理员',
            role: 1,
            status: 1
          }
        ],
        students: [
          {
            id: 1,
            name: '张三',
            gender: 1,
            status: 1,
            class: { name: '小一班' }
          }
        ],
        teachers: [
          {
            id: 1,
            user: { name: '赵老师', gender: 1 },
            position: 4,
            status: 1
          }
        ]
      }
      
      const transformedUsers = transformUserList(complexData.users)
      const transformedStudents = transformStudentList(complexData.students)
      const transformedTeachers = transformTeacherList(complexData.teachers)
      
      expect(transformedUsers[0].role).toBe('ADMIN')
      expect(transformedUsers[0].status).toBe('ACTIVE')
      expect(transformedStudents[0].gender).toBe('MALE')
      expect(transformedStudents[0].status).toBe('ACTIVE')
      expect(transformedTeachers[0].position).toBe('HEAD_TEACHER')
      expect(transformedTeachers[0].status).toBe('ACTIVE')
    })
  })

  describe('Performance Tests', () => {
    it('should handle large datasets efficiently', () => {
      const largeStudentList = Array(1000).fill(null).map((_, i) => ({
        id: i + 1,
        name: `学生${i + 1}`,
        gender: i % 2 === 0 ? 1 : 2,
        birth_date: '2018-01-01',
        status: 1
      }))
      
      const startTime = performance.now()
      const result = transformStudentList(largeStudentList)
      const endTime = performance.now()
      
      expect(result).toHaveLength(1000)
      expect(endTime - startTime).toBeLessThan(100) // Should complete in under 100ms
    })

    it('should handle complex nested transformations efficiently', () => {
      const complexData = {
        data: {
          list: Array(100).fill(null).map((_, i) => ({
            id: i + 1,
            name: `学生${i + 1}`,
            gender: i % 2 === 0 ? 1 : 2,
            birth_date: '2018-01-01',
            status: 1,
            class: { name: `班级${Math.floor(i / 20) + 1}` },
            parent: {
              name: `家长${i + 1}`,
              phone: '13800138000'
            }
          })),
          total: 100
        },
        success: true
      }
      
      const startTime = performance.now()
      const normalized = normalizeResponse(complexData)
      const transformed = transformListResponse(normalized, transformStudentData)
      const endTime = performance.now()
      
      expect(transformed.items).toHaveLength(100)
      expect(endTime - startTime).toBeLessThan(200) // Should complete in under 200ms
    })
  })

  describe('Error Handling Tests', () => {
    it('should handle malformed data gracefully', () => {
      const malformedData = {
        invalid: 'data',
        nested: {
          invalid: true
        }
      }
      
      expect(() => transformUserData(malformedData as any)).not.toThrow()
      expect(() => transformStudentData(malformedData as any)).not.toThrow()
      expect(() => transformTeacherData(malformedData as any)).not.toThrow()
    })

    it('should handle null values in nested objects', () => {
      const dataWithNulls = {
        id: 1,
        name: 'Test',
        user: null,
        class: null,
        parent: null
      }
      
      expect(() => transformTeacherData(dataWithNulls as any)).not.toThrow()
      expect(() => transformStudentData(dataWithNulls as any)).not.toThrow()
    })

    it('should handle undefined values in arrays', () => {
      const arrayWithUndefined = [
        { id: 1, name: 'Test1' },
        undefined,
        { id: 2, name: 'Test2' },
        null
      ] as any[]
      
      const result = transformUserList(arrayWithUndefined)
      
      expect(result).toHaveLength(4)
      expect(result[1]).toBeNull()
      expect(result[3]).toBeNull()
    })
  })

  describe('Security Tests', () => {
    it('should sanitize input data', () => {
      const maliciousData = {
        id: 1,
        name: '<script>alert("xss")</script>',
        description: 'javascript:alert("xss")',
        email: 'test@example.com',
        __proto__: { polluted: true },
        constructor: { prototype: { polluted: true } }
      }
      
      const result = transformUserData(maliciousData as any)
      
      // Should not execute scripts or pollute prototypes
      expect(result.name).toBe('<script>alert("xss")</script>')
      expect((global as any).polluted).toBeUndefined()
    })

    it('should handle prototype pollution attempts', () => {
      const maliciousData = {
        id: 1,
        name: 'Test',
        __proto__: { malicious: true },
        constructor: { prototype: { malicious: true } }
      }
      
      const result = transformUserData(maliciousData as any)
      
      // Should not pollute prototypes
      expect(({} as any).malicious).toBeUndefined()
      expect(result.name).toBe('Test')
    })

    it('should validate data types', () => {
      const invalidData = {
        id: 'invalid',
        name: 123,
        gender: 'invalid',
        status: 'invalid'
      }
      
      const result = transformStudentData(invalidData as any)
      
      // Should handle invalid types gracefully
      expect(result.id).toBe('invalid')
      expect(result.name).toBe(123)
      expect(result.gender).toBe('invalid')
      expect(result.status).toBe('INACTIVE') // Default for invalid
    })
  })
})