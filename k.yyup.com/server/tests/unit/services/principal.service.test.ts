import { vi } from 'vitest'
/**
 * Principal Service Test
 * 园长服务测试
 * 
 * 测试覆盖范围：
 * - 园区概览获取
 * - 待审批列表获取
 * - 审批处理功能
 * - 重要通知管理
 * - 园长工作安排
 * - 仪表板统计
 * - 活动列表管理
 * - 招生趋势数据
 * - 客户池统计
 * - 客户池管理
 * - 绩效统计
 * - 绩效排名
 * - 绩效详情
 * - 客户详情
 * - 客户分配
 * - 批量分配
 * - 客户删除
 * - 跟进记录管理
 * - 错误处理
 * - 数据转换
 * - 分页功能
 */

import { PrincipalService } from '../../../src/services/principal.service'
import db from '../../../src/database'

// Mock dependencies
jest.mock('../../../src/database')
const mockDb = db as jest.Mocked<typeof db>


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

describe('PrincipalService', () => {
  let principalService: PrincipalService

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
    
    // Create service instance
    principalService = new PrincipalService()
  })

  describe('getCampusOverview', () => {
    it('应该成功获取园区概览', async () => {
      // Mock database responses
      mockDb.classes.count
        .mockResolvedValueOnce(10)  // classroomCount
        .mockResolvedValueOnce(8)   // occupiedClassroomCount
      mockDb.students.count.mockResolvedValue(200)
      mockDb.teachers.count.mockResolvedValue(25)
      mockDb.activities.findAll.mockResolvedValue([
        {
          id: 1,
          title: '春季运动会',
          startTime: '2024-03-15T09:00:00Z',
          endTime: '2024-03-15T17:00:00Z',
          location: '操场',
          description: '年度春季运动会'
        },
        {
          id: 2,
          title: '家长开放日',
          startTime: '2024-03-20T14:00:00Z',
          endTime: '2024-03-20T16:00:00Z',
          location: '各教室',
          description: '家长开放日活动'
        }
      ])

      const result = await principalService.getCampusOverview()

      expect(result).toEqual({
        id: "1",
        name: "阳光幼儿园",
        address: "北京市海淀区中关村大街1号",
        area: 5000,
        classroomCount: 10,
        occupiedClassroomCount: 8,
        outdoorPlaygroundArea: 2000,
        indoorPlaygroundArea: 800,
        establishedYear: 2010,
        principalName: "王园长",
        contactPhone: "010-88888888",
        email: "principal@example.com",
        description: "阳光幼儿园是一所综合性幼儿园，致力于为3-6岁儿童提供优质的学前教育。",
        images: [
          "/images/campus/1.jpg",
          "/images/campus/2.jpg",
          "/images/campus/3.jpg"
        ],
        facilities: [
          { id: "1", name: "室内游泳池", status: "正常" },
          { id: "2", name: "多功能厅", status: "正常" },
          { id: "3", name: "图书室", status: "正常" }
        ],
        events: [
          {
            id: "1",
            title: "春季运动会",
            startTime: "2024-03-15T09:00:00Z",
            endTime: "2024-03-15T17:00:00Z",
            location: "操场",
            description: "年度春季运动会"
          },
          {
            id: "2",
            title: "家长开放日",
            startTime: "2024-03-20T14:00:00Z",
            endTime: "2024-03-20T16:00:00Z",
            location: "各教室",
            description: "家长开放日活动"
          }
        ]
      })

      expect(mockDb.classes.count).toHaveBeenCalledTimes(2)
      expect(mockDb.students.count).toHaveBeenCalled()
      expect(mockDb.teachers.count).toHaveBeenCalled()
      expect(mockDb.activities.findAll).toHaveBeenCalledWith({
        limit: 5,
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'title', 'startTime', 'endTime', 'location', 'description']
      })
    })

    it('应该处理获取园区概览失败的情况', async () => {
      mockDb.classes.count.mockRejectedValue(new Error('Database error'))

      const loggerSpy = jest.spyOn(console, 'error').mockImplementation()

      await expect(principalService.getCampusOverview()).rejects.toThrow('Database error')
      expect(loggerSpy).toHaveBeenCalledWith('获取园区概览失败:', expect.any(Error))

      loggerSpy.mockRestore()
    })
  })

  describe('getApprovalList', () => {
    it('应该成功获取待审批列表', async () => {
      const mockApprovals = {
        count: 2,
        rows: [
          {
            id: 1,
            title: '请假申请',
            type: 'leave',
            status: 'PENDING',
            urgency: 'HIGH',
            description: '病假申请',
            deadline: '2024-03-20',
            requestAmount: 1000,
            requestedAt: '2024-03-15T10:00:00Z',
            requester: {
              id: 1,
              username: 'teacher1',
              realName: '张老师'
            },
            approver: {
              id: 2,
              username: 'principal',
              realName: '王园长'
            }
          },
          {
            id: 2,
            title: '采购申请',
            type: 'purchase',
            status: 'PENDING',
            urgency: 'MEDIUM',
            description: '教学用品采购',
            deadline: '2024-03-25',
            requestAmount: 5000,
            requestedAt: '2024-03-16T14:00:00Z',
            requester: {
              id: 3,
              username: 'teacher2',
              realName: '李老师'
            },
            approver: null
          }
        ]
      }

      mockDb.approvals.findAndCountAll.mockResolvedValue(mockApprovals)

      const params = {
        page: 1,
        pageSize: 10,
        status: 'PENDING'
      }

      const result = await principalService.getApprovalList(params)

      expect(result).toEqual({
        items: [
          {
            id: "1",
            title: '请假申请',
            type: 'leave',
            requestBy: '张老师',
            requestTime: '2024-03-15T10:00:00Z',
            status: 'PENDING',
            urgency: 'HIGH',
            description: '病假申请',
            deadline: '2024-03-20',
            requestAmount: 1000
          },
          {
            id: "2",
            title: '采购申请',
            type: 'purchase',
            requestBy: '李老师',
            requestTime: '2024-03-16T14:00:00Z',
            status: 'PENDING',
            urgency: 'MEDIUM',
            description: '教学用品采购',
            deadline: '2024-03-25',
            requestAmount: 5000
          }
        ],
        total: 2
      })

      expect(mockDb.approvals.findAndCountAll).toHaveBeenCalledWith({
        where: { status: 'PENDING' },
        include: [
          {
            model: mockDb.users,
            as: 'requester',
            attributes: ['id', 'username', 'realName']
          },
          {
            model: mockDb.users,
            as: 'approver',
            attributes: ['id', 'username', 'realName']
          }
        ],
        order: [['requestedAt', 'DESC']],
        limit: 10,
        offset: 0
      })
    })

    it('应该根据类型和状态过滤审批列表', async () => {
      mockDb.approvals.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: []
      })

      const params = {
        page: 1,
        pageSize: 10,
        status: 'APPROVED',
        type: 'leave'
      }

      await principalService.getApprovalList(params)

      expect(mockDb.approvals.findAndCountAll).toHaveBeenCalledWith({
        where: { status: 'APPROVED', type: 'leave' },
        include: expect.any(Array),
        order: [['requestedAt', 'DESC']],
        limit: 10,
        offset: 0
      })
    })

    it('应该处理获取审批列表失败的情况', async () => {
      mockDb.approvals.findAndCountAll.mockRejectedValue(new Error('Database error'))

      const loggerSpy = jest.spyOn(console, 'error').mockImplementation()

      await expect(principalService.getApprovalList({ page: 1, pageSize: 10 }))
        .rejects.toThrow('Database error')
      expect(loggerSpy).toHaveBeenCalledWith('获取待审批列表失败:', expect.any(Error))

      loggerSpy.mockRestore()
    })
  })

  describe('handleApproval', () => {
    it('应该成功处理审批通过', async () => {
      const mockApproval = {
        id: 1,
        title: '请假申请',
        type: 'leave',
        status: 'PENDING',
        urgency: 'HIGH',
        description: '病假申请',
        requestedAt: '2024-03-15T10:00:00Z',
        requester: {
          id: 1,
          username: 'teacher1',
          realName: '张老师'
        },
        update: jest.fn().mockResolvedValue({
          id: 1,
          title: '请假申请',
          type: 'leave',
          status: 'APPROVED',
          urgency: 'HIGH',
          description: '病假申请',
          requestedAt: '2024-03-15T10:00:00Z',
          approvedBy: 2,
          approvedAt: new Date(),
          comment: '审批通过'
        })
      }

      mockDb.approvals.findByPk.mockResolvedValue(mockApproval)

      const result = await principalService.handleApproval('1', 'approve', 2, '审批通过')

      expect(result).toEqual({
        id: "1",
        title: '请假申请',
        type: 'leave',
        requestBy: '张老师',
        requestTime: '2024-03-15T10:00:00Z',
        status: 'APPROVED',
        urgency: 'HIGH',
        description: '病假申请',
        approvedBy: 2,
        approvedAt: expect.any(String),
        comment: '审批通过'
      })

      expect(mockApproval.update).toHaveBeenCalledWith({
        status: 'APPROVED',
        approvedBy: 2,
        approvedAt: expect.any(Date),
        comment: '审批通过'
      })
    })

    it('应该成功处理审批拒绝', async () => {
      const mockApproval = {
        id: 1,
        title: '请假申请',
        type: 'leave',
        status: 'PENDING',
        urgency: 'HIGH',
        description: '病假申请',
        requestedAt: '2024-03-15T10:00:00Z',
        requester: {
          id: 1,
          username: 'teacher1',
          realName: '张老师'
        },
        update: jest.fn().mockResolvedValue({
          id: 1,
          title: '请假申请',
          type: 'leave',
          status: 'REJECTED',
          urgency: 'HIGH',
          description: '病假申请',
          requestedAt: '2024-03-15T10:00:00Z',
          approvedBy: 2,
          approvedAt: new Date(),
          comment: '审批拒绝'
        })
      }

      mockDb.approvals.findByPk.mockResolvedValue(mockApproval)

      const result = await principalService.handleApproval('1', 'reject', 2, '审批拒绝')

      expect(result.status).toBe('REJECTED')
      expect(mockApproval.update).toHaveBeenCalledWith({
        status: 'REJECTED',
        approvedBy: 2,
        approvedAt: expect.any(Date),
        comment: '审批拒绝'
      })
    })

    it('应该在审批记录不存在时抛出错误', async () => {
      mockDb.approvals.findByPk.mockResolvedValue(null)

      await expect(principalService.handleApproval('999', 'approve', 2))
        .rejects.toThrow('审批记录不存在')
    })

    it('应该在审批已处理时抛出错误', async () => {
      const mockApproval = {
        id: 1,
        title: '请假申请',
        type: 'leave',
        status: 'APPROVED', // Already processed
        urgency: 'HIGH',
        description: '病假申请',
        requestedAt: '2024-03-15T10:00:00Z',
        requester: {
          id: 1,
          username: 'teacher1',
          realName: '张老师'
        }
      }

      mockDb.approvals.findByPk.mockResolvedValue(mockApproval)

      await expect(principalService.handleApproval('1', 'approve', 2))
        .rejects.toThrow('该审批已经处理过了')
    })

    it('应该处理审批失败的情况', async () => {
      const mockApproval = {
        id: 1,
        title: '请假申请',
        type: 'leave',
        status: 'PENDING',
        urgency: 'HIGH',
        description: '病假申请',
        requestedAt: '2024-03-15T10:00:00Z',
        requester: {
          id: 1,
          username: 'teacher1',
          realName: '张老师'
        },
        update: jest.fn().mockRejectedValue(new Error('Update failed'))
      }

      mockDb.approvals.findByPk.mockResolvedValue(mockApproval)

      const loggerSpy = jest.spyOn(console, 'error').mockImplementation()

      await expect(principalService.handleApproval('1', 'approve', 2))
        .rejects.toThrow('Update failed')
      expect(loggerSpy).toHaveBeenCalledWith('处理审批失败:', expect.any(Error))

      loggerSpy.mockRestore()
    })
  })

  describe('getImportantNotices', () => {
    it('应该成功获取重要通知', async () => {
      const mockNotices = [
        {
          id: 1,
          title: '放假通知',
          content: '五一劳动节放假通知',
          createdAt: '2024-04-20T10:00:00Z'
        },
        {
          id: 2,
          title: '活动通知',
          content: '家长会活动通知',
          createdAt: '2024-04-18T14:00:00Z'
        }
      ]

      mockDb.notifications.findAll.mockResolvedValue(mockNotices)

      const result = await principalService.getImportantNotices()

      expect(result).toEqual([
        {
          id: "1",
          title: '放假通知',
          content: '五一劳动节放假通知',
          publishTime: '2024-04-20T10:00:00Z',
          expireTime: null,
          importance: 'HIGH',
          readCount: 0,
          totalCount: 24
        },
        {
          id: "2",
          title: '活动通知',
          content: '家长会活动通知',
          publishTime: '2024-04-18T14:00:00Z',
          expireTime: null,
          importance: 'HIGH',
          readCount: 0,
          totalCount: 24
        }
      ])

      expect(mockDb.notifications.findAll).toHaveBeenCalledWith({
        where: { status: 'published' },
        order: [['createdAt', 'DESC']],
        limit: 10,
        attributes: ['id', 'title', 'content', 'createdAt']
      })
    })

    it('应该处理获取重要通知失败的情况', async () => {
      mockDb.notifications.findAll.mockRejectedValue(new Error('Database error'))

      const loggerSpy = jest.spyOn(console, 'error').mockImplementation()

      await expect(principalService.getImportantNotices())
        .rejects.toThrow('Database error')
      expect(loggerSpy).toHaveBeenCalledWith('获取重要通知失败:', expect.any(Error))

      loggerSpy.mockRestore()
    })
  })

  describe('publishNotice', () => {
    it('应该成功发布通知', async () => {
      const mockNotice = {
        id: 1,
        title: '测试通知',
        content: '这是一条测试通知',
        senderId: 1,
        status: 'published',
        type: 'system',
        userId: 0,
        createdAt: '2024-04-20T10:00:00Z'
      }

      mockDb.notifications.create.mockResolvedValue(mockNotice)

      const noticeData = {
        title: '测试通知',
        content: '这是一条测试通知',
        importance: 'HIGH' as const,
        recipientType: 'ALL' as const,
        publisherId: 1
      }

      const result = await principalService.publishNotice(noticeData)

      expect(result).toEqual({
        id: "1",
        title: '测试通知',
        content: '这是一条测试通知',
        publishTime: '2024-04-20T10:00:00Z',
        expireTime: null,
        importance: 'HIGH',
        readCount: 0,
        totalCount: 24
      })

      expect(mockDb.notifications.create).toHaveBeenCalledWith({
        title: '测试通知',
        content: '这是一条测试通知',
        senderId: 1,
        status: 'published',
        type: 'system',
        userId: 0
      })
    })

    it('应该处理发布通知失败的情况', async () => {
      mockDb.notifications.create.mockRejectedValue(new Error('Database error'))

      const loggerSpy = jest.spyOn(console, 'error').mockImplementation()
      const noticeData = {
        title: '测试通知',
        content: '这是一条测试通知',
        importance: 'HIGH' as const,
        recipientType: 'ALL' as const,
        publisherId: 1
      }

      await expect(principalService.publishNotice(noticeData))
        .rejects.toThrow('Database error')
      expect(loggerSpy).toHaveBeenCalledWith('发布通知失败:', expect.any(Error))

      loggerSpy.mockRestore()
    })
  })

  describe('getPrincipalSchedule', () => {
    it('应该成功获取园长工作安排', async () => {
      const mockSchedules = [
        {
          id: 1,
          title: '园长会议',
          startTime: '2024-04-21T09:00:00Z',
          endTime: '2024-04-21T11:00:00Z',
          location: '会议室',
          description: '月度园长会议'
        },
        {
          id: 2,
          title: '家长接待',
          startTime: '2024-04-22T14:00:00Z',
          endTime: '2024-04-22T16:00:00Z',
          location: '接待室',
          description: '家长接待日'
        }
      ]

      mockDb.schedules.findAll.mockResolvedValue(mockSchedules)

      const result = await principalService.getPrincipalSchedule(1)

      expect(result).toEqual([
        {
          id: "1",
          title: '园长会议',
          startTime: '2024-04-21T09:00:00Z',
          endTime: '2024-04-21T11:00:00Z',
          location: '会议室',
          description: '月度园长会议'
        },
        {
          id: "2",
          title: '家长接待',
          startTime: '2024-04-22T14:00:00Z',
          endTime: '2024-04-22T16:00:00Z',
          location: '接待室',
          description: '家长接待日'
        }
      ])

      expect(mockDb.schedules.findAll).toHaveBeenCalledWith({
        where: {
          userId: 1,
          startTime: {
            [mockDb.Sequelize.Op.gte]: expect.any(Date)
          }
        },
        order: [['startTime', 'ASC']],
        limit: 20
      })
    })

    it('应该处理获取工作安排失败的情况', async () => {
      mockDb.schedules.findAll.mockRejectedValue(new Error('Database error'))

      const loggerSpy = jest.spyOn(console, 'error').mockImplementation()

      await expect(principalService.getPrincipalSchedule(1))
        .rejects.toThrow('Database error')
      expect(loggerSpy).toHaveBeenCalledWith('获取园长工作安排失败:', expect.any(Error))

      loggerSpy.mockRestore()
    })
  })

  describe('createPrincipalSchedule', () => {
    it('应该成功创建园长日程安排', async () => {
      const mockSchedule = {
        id: 1,
        title: '会议安排',
        startTime: new Date('2024-04-21T09:00:00Z'),
        endTime: new Date('2024-04-21T11:00:00Z'),
        location: '会议室',
        description: '重要会议',
        userId: 1,
        type: 'task',
        status: 'pending'
      }

      mockDb.schedules.create.mockResolvedValue(mockSchedule)

      const scheduleData = {
        title: '会议安排',
        startTime: '2024-04-21T09:00:00Z',
        endTime: '2024-04-21T11:00:00Z',
        location: '会议室',
        description: '重要会议',
        userId: 1
      }

      const result = await principalService.createPrincipalSchedule(scheduleData)

      expect(result).toEqual({
        id: "1",
        title: '会议安排',
        startTime: '2024-04-21T09:00:00Z',
        endTime: '2024-04-21T11:00:00Z',
        location: '会议室',
        description: '重要会议'
      })

      expect(mockDb.schedules.create).toHaveBeenCalledWith({
        title: '会议安排',
        startTime: expect.any(Date),
        endTime: expect.any(Date),
        location: '会议室',
        description: '重要会议',
        userId: 1,
        type: 'task',
        status: 'pending'
      })
    })

    it('应该处理创建日程安排失败的情况', async () => {
      mockDb.schedules.create.mockRejectedValue(new Error('Database error'))

      const loggerSpy = jest.spyOn(console, 'error').mockImplementation()
      const scheduleData = {
        title: '会议安排',
        startTime: '2024-04-21T09:00:00Z',
        endTime: '2024-04-21T11:00:00Z',
        location: '会议室',
        description: '重要会议',
        userId: 1
      }

      await expect(principalService.createPrincipalSchedule(scheduleData))
        .rejects.toThrow('Database error')
      expect(loggerSpy).toHaveBeenCalledWith('创建园长日程安排失败:', expect.any(Error))

      loggerSpy.mockRestore()
    })
  })

  describe('getDashboardStats', () => {
    it('应该成功获取仪表板统计', async () => {
      mockDb.students.count.mockResolvedValue(200)
      mockDb.teachers.count.mockResolvedValue(25)
      mockDb.classes.count.mockResolvedValue(10)
      mockDb.activities.count.mockResolvedValue(5)

      const result = await principalService.getDashboardStats()

      expect(result).toEqual({
        totalStudents: 200,
        totalTeachers: 25,
        totalClasses: 10,
        activeActivities: 5,
        statistics: {
          attendance: 95.2,
          satisfaction: 4.8,
          enrollment: 89.3
        }
      })

      expect(mockDb.students.count).toHaveBeenCalled()
      expect(mockDb.teachers.count).toHaveBeenCalled()
      expect(mockDb.classes.count).toHaveBeenCalled()
      expect(mockDb.activities.count).toHaveBeenCalledWith({ where: { status: 1 } })
    })

    it('应该处理获取仪表板统计失败的情况', async () => {
      mockDb.students.count.mockRejectedValue(new Error('Database error'))

      const loggerSpy = jest.spyOn(console, 'error').mockImplementation()

      await expect(principalService.getDashboardStats())
        .rejects.toThrow('Database error')
      expect(loggerSpy).toHaveBeenCalledWith('获取仪表板统计失败:', expect.any(Error))

      loggerSpy.mockRestore()
    })
  })

  describe('getActivities', () => {
    it('应该成功获取活动列表', async () => {
      const mockActivities = {
        count: 2,
        rows: [
          {
            id: 1,
            title: '春季运动会',
            description: '年度春季运动会',
            startTime: '2024-03-15T09:00:00Z',
            endTime: '2024-03-15T17:00:00Z',
            location: '操场',
            capacity: 100,
            registeredCount: 80,
            status: 1,
            createdAt: '2024-03-01T10:00:00Z'
          },
          {
            id: 2,
            title: '家长开放日',
            description: '家长开放日活动',
            startTime: '2024-03-20T14:00:00Z',
            endTime: '2024-03-20T16:00:00Z',
            location: '各教室',
            capacity: 50,
            registeredCount: 30,
            status: 0,
            createdAt: '2024-03-05T14:00:00Z'
          }
        ]
      }

      mockDb.activities.findAndCountAll.mockResolvedValue(mockActivities)

      const params = {
        page: 1,
        pageSize: 10,
        status: 'active'
      }

      const result = await principalService.getActivities(params)

      expect(result).toEqual({
        total: 2,
        list: [
          {
            id: "1",
            title: '春季运动会',
            description: '年度春季运动会',
            startTime: '2024-03-15T09:00:00Z',
            endTime: '2024-03-15T17:00:00Z',
            location: '操场',
            capacity: 100,
            registeredCount: 80,
            status: 'active',
            createdAt: '2024-03-01T10:00:00Z'
          },
          {
            id: "2",
            title: '家长开放日',
            description: '家长开放日活动',
            startTime: '2024-03-20T14:00:00Z',
            endTime: '2024-03-20T16:00:00Z',
            location: '各教室',
            capacity: 50,
            registeredCount: 30,
            status: 'inactive',
            createdAt: '2024-03-05T14:00:00Z'
          }
        ],
        page: 1,
        pageSize: 10
      })

      expect(mockDb.activities.findAndCountAll).toHaveBeenCalledWith({
        where: { status: 1 },
        order: [['createdAt', 'DESC']],
        offset: 0,
        limit: 10,
        attributes: ['id', 'title', 'description', 'startTime', 'endTime', 'location', 'capacity', 'registeredCount', 'status', 'createdAt']
      })
    })

    it('应该处理获取活动列表失败的情况', async () => {
      mockDb.activities.findAndCountAll.mockRejectedValue(new Error('Database error'))

      const loggerSpy = jest.spyOn(console, 'error').mockImplementation()

      await expect(principalService.getActivities({ page: 1, pageSize: 10 }))
        .rejects.toThrow('Database error')
      expect(loggerSpy).toHaveBeenCalledWith('获取活动列表失败:', expect.any(Error))

      loggerSpy.mockRestore()
    })
  })

  describe('getEnrollmentTrend', () => {
    it('应该返回周度招生趋势数据', async () => {
      const result = await principalService.getEnrollmentTrend('week')

      expect(result).toEqual([
        { period: '2024-01-01', value: 12 },
        { period: '2024-01-08', value: 15 },
        { period: '2024-01-15', value: 18 },
        { period: '2024-01-22', value: 14 },
        { period: '2024-01-29', value: 20 }
      ])
    })

    it('应该返回月度招生趋势数据', async () => {
      const result = await principalService.getEnrollmentTrend('month')

      expect(result).toEqual([
        { period: '2024-01', value: 65 },
        { period: '2024-02', value: 72 },
        { period: '2024-03', value: 58 },
        { period: '2024-04', value: 80 },
        { period: '2024-05', value: 75 }
      ])
    })

    it('应该返回年度招生趋势数据', async () => {
      const result = await principalService.getEnrollmentTrend('year')

      expect(result).toEqual([
        { period: '2021', value: 450 },
        { period: '2022', value: 520 },
        { period: '2023', value: 680 },
        { period: '2024', value: 750 }
      ])
    })

    it('应该在无效周期时返回月度数据', async () => {
      const result = await principalService.getEnrollmentTrend('invalid')

      expect(result).toEqual([
        { period: '2024-01', value: 65 },
        { period: '2024-02', value: 72 },
        { period: '2024-03', value: 58 },
        { period: '2024-04', value: 80 },
        { period: '2024-05', value: 75 }
      ])
    })

    it('应该处理获取招生趋势失败的情况', async () => {
      const loggerSpy = jest.spyOn(console, 'error').mockImplementation()

      // Mock the method to throw an error
      const originalMethod = principalService.getEnrollmentTrend
      principalService.getEnrollmentTrend = jest.fn().mockRejectedValue(new Error('Service error'))

      await expect(principalService.getEnrollmentTrend('week'))
        .rejects.toThrow('Service error')
      expect(loggerSpy).toHaveBeenCalledWith('获取招生趋势数据失败:', expect.any(Error))

      // Restore original method
      principalService.getEnrollmentTrend = originalMethod
      loggerSpy.mockRestore()
    })
  })

  describe('getCustomerPoolStats', () => {
    it('应该返回客户池统计数据', async () => {
      const result = await principalService.getCustomerPoolStats()

      expect(result).toEqual({
        totalCustomers: 1250,
        newCustomersThisMonth: 85,
        unassignedCustomers: 28,
        convertedCustomersThisMonth: 42
      })
    })

    it('应该处理获取客户池统计失败的情况', async () => {
      const loggerSpy = jest.spyOn(console, 'error').mockImplementation()

      // Mock the method to throw an error
      const originalMethod = principalService.getCustomerPoolStats
      principalService.getCustomerPoolStats = jest.fn().mockRejectedValue(new Error('Service error'))

      await expect(principalService.getCustomerPoolStats())
        .rejects.toThrow('Service error')
      expect(loggerSpy).toHaveBeenCalledWith('获取客户池统计数据失败:', expect.any(Error))

      // Restore original method
      principalService.getCustomerPoolStats = originalMethod
      loggerSpy.mockRestore()
    })
  })

  describe('getCustomerPoolList', () => {
    it('应该返回客户池列表', async () => {
      const params = {
        page: 1,
        pageSize: 10
      }

      const result = await principalService.getCustomerPoolList(params)

      expect(result).toEqual({
        items: [
          {
            id: 1,
            name: '王小明',
            phone: '13800138001',
            source: '网络推广',
            status: 'new',
            teacher: '李老师',
            createdAt: '2024-01-15',
            lastFollowUp: '2024-01-20'
          },
          {
            id: 2,
            name: '张小红',
            phone: '13800138002',
            source: '朋友推荐',
            status: 'contacted',
            teacher: '王老师',
            createdAt: '2024-01-12',
            lastFollowUp: '2024-01-18'
          }
        ],
        total: 2,
        page: 1,
        pageSize: 10
      })
    })

    it('应该处理获取客户池列表失败的情况', async () => {
      const loggerSpy = jest.spyOn(console, 'error').mockImplementation()

      // Mock the method to throw an error
      const originalMethod = principalService.getCustomerPoolList
      principalService.getCustomerPoolList = jest.fn().mockRejectedValue(new Error('Service error'))

      await expect(principalService.getCustomerPoolList({ page: 1, pageSize: 10 }))
        .rejects.toThrow('Service error')
      expect(loggerSpy).toHaveBeenCalledWith('获取客户池列表失败:', expect.any(Error))

      // Restore original method
      principalService.getCustomerPoolList = originalMethod
      loggerSpy.mockRestore()
    })
  })

  describe('getPerformanceStats', () => {
    it('应该返回绩效统计数据', async () => {
      const result = await principalService.getPerformanceStats({})

      expect(result).toEqual({
        totalEnrollments: 156,
        monthlyEnrollments: 28,
        avgConversionRate: 18.5,
        totalCommission: 45600,
        enrollmentTrend: [
          { period: '2024-01', value: 25 },
          { period: '2024-02', value: 30 },
          { period: '2024-03', value: 28 },
          { period: '2024-04', value: 35 },
          { period: '2024-05', value: 32 }
        ]
      })
    })

    it('应该处理获取绩效统计失败的情况', async () => {
      const loggerSpy = jest.spyOn(console, 'error').mockImplementation()

      // Mock the method to throw an error
      const originalMethod = principalService.getPerformanceStats
      principalService.getPerformanceStats = jest.fn().mockRejectedValue(new Error('Service error'))

      await expect(principalService.getPerformanceStats({}))
        .rejects.toThrow('Service error')
      expect(loggerSpy).toHaveBeenCalledWith('获取绩效统计数据失败:', expect.any(Error))

      // Restore original method
      principalService.getPerformanceStats = originalMethod
      loggerSpy.mockRestore()
    })
  })

  describe('getPerformanceRankings', () => {
    it('应该返回绩效排名数据', async () => {
      const result = await principalService.getPerformanceRankings({})

      expect(result).toEqual([
        { id: 1, name: '李老师', value: 45 },
        { id: 2, name: '王老师', value: 38 },
        { id: 3, name: '张老师', value: 32 },
        { id: 4, name: '陈老师', value: 28 },
        { id: 5, name: '刘老师', value: 25 }
      ])
    })

    it('应该处理获取绩效排名失败的情况', async () => {
      const loggerSpy = jest.spyOn(console, 'error').mockImplementation()

      // Mock the method to throw an error
      const originalMethod = principalService.getPerformanceRankings
      principalService.getPerformanceRankings = jest.fn().mockRejectedValue(new Error('Service error'))

      await expect(principalService.getPerformanceRankings({}))
        .rejects.toThrow('Service error')
      expect(loggerSpy).toHaveBeenCalledWith('获取绩效排名数据失败:', expect.any(Error))

      // Restore original method
      principalService.getPerformanceRankings = originalMethod
      loggerSpy.mockRestore()
    })
  })

  describe('getPerformanceDetails', () => {
    it('应该返回绩效详情数据', async () => {
      const params = {
        page: 1,
        pageSize: 10
      }

      const result = await principalService.getPerformanceDetails(params)

      expect(result).toEqual({
        items: [
          {
            id: 1,
            name: '李老师',
            leads: 120,
            followups: 85,
            visits: 45,
            applications: 28,
            enrollments: 18,
            commission: 8500
          },
          {
            id: 2,
            name: '王老师',
            leads: 98,
            followups: 72,
            visits: 38,
            applications: 22,
            enrollments: 15,
            commission: 7200
          }
        ],
        total: 2,
        page: 1,
        pageSize: 10
      })
    })

    it('应该处理获取绩效详情失败的情况', async () => {
      const loggerSpy = jest.spyOn(console, 'error').mockImplementation()

      // Mock the method to throw an error
      const originalMethod = principalService.getPerformanceDetails
      principalService.getPerformanceDetails = jest.fn().mockRejectedValue(new Error('Service error'))

      await expect(principalService.getPerformanceDetails({ page: 1, pageSize: 10 }))
        .rejects.toThrow('Service error')
      expect(loggerSpy).toHaveBeenCalledWith('获取绩效详情数据失败:', expect.any(Error))

      // Restore original method
      principalService.getPerformanceDetails = originalMethod
      loggerSpy.mockRestore()
    })
  })

  describe('getCustomerDetail', () => {
    it('应该返回客户详情', async () => {
      const result = await principalService.getCustomerDetail(1)

      expect(result).toEqual({
        id: 1,
        name: '王小明',
        phone: '13800138001',
        email: 'wangxiaoming@example.com',
        source: '网络推广',
        status: 'contacted',
        teacher: '李老师',
        createdAt: '2024-01-15',
        lastFollowUp: '2024-01-20',
        followUps: [
          {
            id: 1,
            content: '已电话联系，家长有意向',
            type: 'phone',
            createdAt: '2024-01-20'
          }
        ]
      })
    })

    it('应该处理获取客户详情失败的情况', async () => {
      const loggerSpy = jest.spyOn(console, 'error').mockImplementation()

      // Mock the method to throw an error
      const originalMethod = principalService.getCustomerDetail
      principalService.getCustomerDetail = jest.fn().mockRejectedValue(new Error('Service error'))

      await expect(principalService.getCustomerDetail(1))
        .rejects.toThrow('Service error')
      expect(loggerSpy).toHaveBeenCalledWith('获取客户详情失败:', expect.any(Error))

      // Restore original method
      principalService.getCustomerDetail = originalMethod
      loggerSpy.mockRestore()
    })
  })

  describe('assignCustomerTeacher', () => {
    it('应该成功分配客户给教师', async () => {
      const data = {
        customerId: 1,
        teacherId: 2,
        remark: '测试分配'
      }

      const result = await principalService.assignCustomerTeacher(data)

      expect(result).toEqual({
        id: 1,
        teacherId: 2,
        remark: '测试分配',
        assignedAt: expect.any(String)
      })
    })

    it('应该处理分配客户失败的情况', async () => {
      const loggerSpy = jest.spyOn(console, 'error').mockImplementation()

      // Mock the method to throw an error
      const originalMethod = principalService.assignCustomerTeacher
      principalService.assignCustomerTeacher = jest.fn().mockRejectedValue(new Error('Service error'))

      await expect(principalService.assignCustomerTeacher({ customerId: 1, teacherId: 2 }))
        .rejects.toThrow('Service error')
      expect(loggerSpy).toHaveBeenCalledWith('分配客户给教师失败:', expect.any(Error))

      // Restore original method
      principalService.assignCustomerTeacher = originalMethod
      loggerSpy.mockRestore()
    })
  })

  describe('batchAssignCustomerTeacher', () => {
    it('应该成功批量分配客户给教师', async () => {
      const data = {
        customerIds: [1, 2, 3],
        teacherId: 2,
        remark: '批量分配测试'
      }

      const result = await principalService.batchAssignCustomerTeacher(data)

      expect(result).toEqual({
        customerIds: [1, 2, 3],
        teacherId: 2,
        remark: '批量分配测试',
        assignedCount: 3,
        assignedAt: expect.any(String)
      })
    })

    it('应该处理批量分配失败的情况', async () => {
      const loggerSpy = jest.spyOn(console, 'error').mockImplementation()

      // Mock the method to throw an error
      const originalMethod = principalService.batchAssignCustomerTeacher
      principalService.batchAssignCustomerTeacher = jest.fn().mockRejectedValue(new Error('Service error'))

      await expect(principalService.batchAssignCustomerTeacher({ customerIds: [1, 2], teacherId: 2 }))
        .rejects.toThrow('Service error')
      expect(loggerSpy).toHaveBeenCalledWith('批量分配客户给教师失败:', expect.any(Error))

      // Restore original method
      principalService.batchAssignCustomerTeacher = originalMethod
      loggerSpy.mockRestore()
    })
  })

  describe('deleteCustomer', () => {
    it('应该成功删除客户', async () => {
      const result = await principalService.deleteCustomer(1)

      expect(result).toEqual({
        id: 1,
        deletedAt: expect.any(String)
      })
    })

    it('应该处理删除客户失败的情况', async () => {
      const loggerSpy = jest.spyOn(console, 'error').mockImplementation()

      // Mock the method to throw an error
      const originalMethod = principalService.deleteCustomer
      principalService.deleteCustomer = jest.fn().mockRejectedValue(new Error('Service error'))

      await expect(principalService.deleteCustomer(1))
        .rejects.toThrow('Service error')
      expect(loggerSpy).toHaveBeenCalledWith('删除客户失败:', expect.any(Error))

      // Restore original method
      principalService.deleteCustomer = originalMethod
      loggerSpy.mockRestore()
    })
  })

  describe('addCustomerFollowUp', () => {
    it('应该成功添加客户跟进记录', async () => {
      const data = {
        content: '已电话联系，家长有意向',
        type: 'phone'
      }

      const result = await principalService.addCustomerFollowUp(1, data)

      expect(result).toEqual({
        id: expect.any(Number),
        customerId: 1,
        content: '已电话联系，家长有意向',
        type: 'phone',
        createdAt: expect.any(String)
      })
    })

    it('应该处理添加跟进记录失败的情况', async () => {
      const loggerSpy = jest.spyOn(console, 'error').mockImplementation()

      // Mock the method to throw an error
      const originalMethod = principalService.addCustomerFollowUp
      principalService.addCustomerFollowUp = jest.fn().mockRejectedValue(new Error('Service error'))

      await expect(principalService.addCustomerFollowUp(1, { content: 'test', type: 'phone' }))
        .rejects.toThrow('Service error')
      expect(loggerSpy).toHaveBeenCalledWith('添加客户跟进记录失败:', expect.any(Error))

      // Restore original method
      principalService.addCustomerFollowUp = originalMethod
      loggerSpy.mockRestore()
    })
  })
})