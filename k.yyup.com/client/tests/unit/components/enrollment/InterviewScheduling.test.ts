import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import InterviewScheduling from '@/components/enrollment/InterviewScheduling.vue'
import { useInterviewStore } from '@/stores/interview'
import { useEnrollmentStore } from '@/stores/enrollment'

// Mock the interview store
vi.mock('@/stores/interview', () => ({
  useInterviewStore: vi.fn(() => ({
    interviews: [],
    availableSlots: [],
    interviewers: [],
    scheduleInterview: vi.fn(),
    getAvailableSlots: vi.fn(),
    assignInterviewer: vi.fn(),
    evaluateInterview: vi.fn(),
    loading: false,
    error: null
  }))
}))

// Mock the enrollment store
vi.mock('@/stores/enrollment', () => ({
  useEnrollmentStore: vi.fn(() => ({
    applications: [],
    getApplicationById: vi.fn(),
    updateApplicationStatus: vi.fn(),
    loading: false,
    error: null
  }))
}))

// 控制台错误检测变量
let consoleSpy: any

describe('InterviewScheduling', () => {
  let wrapper: any
  let interviewStore: any
  let enrollmentStore: any

  beforeEach(() => {
    interviewStore = useInterviewStore()
    enrollmentStore = useEnrollmentStore()
    wrapper = mount(InterviewScheduling)
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  afterEach(() => {
    wrapper.unmount()
    vi.clearAllMocks()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('Component Rendering', () => {
    it('should render interview scheduling component correctly', () => {
      expect(wrapper.find('[data-testid="interview-scheduling"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="calendar-view"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="interviewer-list"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="interview-form"]').exists()).toBe(true)
    })

    it('should display loading state when scheduling interviews', async () => {
      interviewStore.loading = true
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('[data-testid="loading-spinner"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="interview-form"]').exists()).toBe(false)
    })

    it('should display error message when scheduling fails', async () => {
      interviewStore.error = 'Failed to schedule interview'
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('[data-testid="error-message"]').text()).toContain('Failed to schedule interview')
    })
  })

  describe('Interview Time Scheduling', () => {
    it('should schedule interview times intelligently', async () => {
      const mockApplication = {
        id: 1,
        studentName: 'John Doe',
        parentName: 'Jane Doe',
        preferredDates: ['2024-01-15', '2024-01-16', '2024-01-17'],
        preferredTimes: ['morning', 'afternoon']
      }

      const mockAvailableSlots = [
        { date: '2024-01-15', time: '09:00', available: true },
        { date: '2024-01-15', time: '10:00', available: true },
        { date: '2024-01-16', time: '14:00', available: true },
        { date: '2024-01-16', time: '15:00', available: true }
      ]

      vi.mocked(enrollmentStore.getApplicationById).mockResolvedValue(mockApplication)
      vi.mocked(interviewStore.getAvailableSlots).mockResolvedValue(mockAvailableSlots)

      // Load application
      await wrapper.vm.loadApplication(1)
      
      // Get available slots
      const getSlotsButton = wrapper.find('[data-testid="get-slots-btn"]')
      await getSlotsButton.trigger('click')

      expect(interviewStore.getAvailableSlots).toHaveBeenCalledWith({
        preferredDates: mockApplication.preferredDates,
        preferredTimes: mockApplication.preferredTimes
      })

      await wrapper.vm.$nextTick()
      
      const availableSlotsList = wrapper.findAll('[data-testid="available-slot"]')
      expect(availableSlotsList.length).toBe(4)
      
      expect(availableSlotsList[0].text()).toContain('2024-01-15')
      expect(availableSlotsList[0].text()).toContain('09:00')
    })

    it('should optimize interview scheduling based on interviewer availability', async () => {
      const mockInterviewers = [
        { id: 1, name: 'Teacher A', availability: ['monday', 'tuesday', 'wednesday'], maxInterviews: 5 },
        { id: 2, name: 'Teacher B', availability: ['thursday', 'friday'], maxInterviews: 4 },
        { id: 3, name: 'Teacher C', availability: ['monday', 'wednesday', 'friday'], maxInterviews: 6 }
      ]

      const mockInterviewRequests = [
        { id: 1, preferredDate: '2024-01-15', preferredTime: 'morning', priority: 'high' },
        { id: 2, preferredDate: '2024-01-15', preferredTime: 'afternoon', priority: 'medium' },
        { id: 3, preferredDate: '2024-01-16', preferredTime: 'morning', priority: 'high' }
      ]

      interviewStore.interviewers = mockInterviewers
      wrapper.vm.interviewRequests = mockInterviewRequests

      const optimizeButton = wrapper.find('[data-testid="optimize-schedule-btn"]')
      await optimizeButton.trigger('click')

      await wrapper.vm.$nextTick()
      
      const optimizedSchedule = wrapper.vm.optimizedSchedule
      expect(optimizedSchedule).toBeDefined()
      expect(optimizedSchedule.length).toBe(3)
      
      // Check if high priority requests are scheduled first
      expect(optimizedSchedule[0].priority).toBe('high')
      
      // Check if interviewer availability is respected
      expect(optimizedSchedule.every((slot: any) => 
        mockInterviewers.some((interviewer: any) => 
          interviewer.id === slot.interviewerId
        )
      )).toBe(true)
    })

    it('should handle scheduling conflicts gracefully', async () => {
      const mockConflictingSlots = [
        { date: '2024-01-15', time: '09:00', available: false, reason: 'Already booked' },
        { date: '2024-01-15', time: '10:00', available: false, reason: 'Interviewer unavailable' }
      ]

      vi.mocked(interviewStore.getAvailableSlots).mockResolvedValue(mockConflictingSlots)

      const getSlotsButton = wrapper.find('[data-testid="get-slots-btn"]')
      await getSlotsButton.trigger('click')

      await wrapper.vm.$nextTick()
      
      const conflictMessages = wrapper.findAll('[data-testid="conflict-message"]')
      expect(conflictMessages.length).toBe(2)
      
      expect(conflictMessages[0].text()).toContain('Already booked')
      expect(conflictMessages[1].text()).toContain('Interviewer unavailable')
      
      const alternativeSlotsButton = wrapper.find('[data-testid="show-alternatives-btn"]')
      expect(alternativeSlotsButton.exists()).toBe(true)
    })
  })

  describe('Interviewer Assignment', () => {
    it('should assign interviewers based on expertise and availability', async () => {
      const mockInterviewers = [
        { 
          id: 1, 
          name: 'Teacher A', 
          expertise: ['mathematics', 'science'], 
          availability: ['monday', 'tuesday'],
          currentLoad: 3,
          maxLoad: 5
        },
        { 
          id: 2, 
          name: 'Teacher B', 
          expertise: ['language', 'arts'], 
          availability: ['wednesday', 'thursday'],
          currentLoad: 2,
          maxLoad: 4
        },
        { 
          id: 3, 
          name: 'Teacher C', 
          expertise: ['mathematics', 'language'], 
          availability: ['friday'],
          currentLoad: 1,
          maxLoad: 6
        }
      ]

      const mockInterview = {
        id: 1,
        applicationId: 1,
        studentInterests: ['mathematics', 'science'],
        scheduledDate: '2024-01-15',
        scheduledTime: '09:00'
      }

      interviewStore.interviewers = mockInterviewers
      wrapper.vm.selectedInterview = mockInterview

      const assignButton = wrapper.find('[data-testid="assign-interviewer-btn"]')
      await assignButton.trigger('click')

      expect(interviewStore.assignInterviewer).toHaveBeenCalledWith(
        mockInterview.id,
        expect.objectContaining({
          expertise: expect.arrayContaining(['mathematics']),
          availability: expect.arrayContaining(['monday', 'tuesday'])
        })
      )

      await wrapper.vm.$nextTick()
      
      const assignedInterviewer = wrapper.find('[data-testid="assigned-interviewer"]')
      expect(assignedInterviewer.exists()).toBe(true)
      expect(assignedInterviewer.text()).toContain('Teacher A') // Best match based on expertise
    })

    it('should balance interviewer workload distribution', async () => {
      const mockInterviewers = [
        { id: 1, name: 'Teacher A', currentLoad: 4, maxLoad: 5 },
        { id: 2, name: 'Teacher B', currentLoad: 2, maxLoad: 5 },
        { id: 3, name: 'Teacher C', currentLoad: 1, maxLoad: 5 }
      ]

      const mockInterviews = [
        { id: 1, date: '2024-01-15', time: '09:00' },
        { id: 2, date: '2024-01-15', time: '10:00' },
        { id: 3, date: '2024-01-15', time: '11:00' }
      ]

      interviewStore.interviewers = mockInterviewers
      wrapper.vm.interviewsToAssign = mockInterviews

      const balanceButton = wrapper.find('[data-testid="balance-workload-btn"]')
      await balanceButton.trigger('click')

      await wrapper.vm.$nextTick()
      
      const balancedAssignments = wrapper.vm.balancedAssignments
      
      // Check that assignments are distributed to balance workload
      const teacherALoad = balancedAssignments.filter((a: any) => a.interviewerId === 1).length
      const teacherBLoad = balancedAssignments.filter((a: any) => a.interviewerId === 2).length
      const teacherCLoad = balancedAssignments.filter((a: any) => a.interviewerId === 3).length

      expect(teacherALoad).toBeLessThanOrEqual(1) // Teacher A already has high load
      expect(teacherBLoad + teacherCLoad).toBe(2) // Remaining interviews distributed
    })

    it('should handle interviewer unavailability', async () => {
      const mockInterviewers = [
        { id: 1, name: 'Teacher A', availability: ['monday', 'tuesday'], available: false },
        { id: 2, name: 'Teacher B', availability: ['wednesday', 'thursday'], available: true }
      ]

      const mockInterview = {
        id: 1,
        scheduledDate: '2024-01-15', // Monday
        scheduledTime: '09:00'
      }

      interviewStore.interviewers = mockInterviewers
      wrapper.vm.selectedInterview = mockInterview

      const assignButton = wrapper.find('[data-testid="assign-interviewer-btn"]')
      await assignButton.trigger('click')

      await wrapper.vm.$nextTick()
      
      const unavailabilityMessage = wrapper.find('[data-testid="unavailability-message"]')
      expect(unavailabilityMessage.exists()).toBe(true)
      expect(unavailabilityMessage.text()).toContain('No available interviewers')
    })
  })

  describe('Interview Evaluation', () => {
    it('should evaluate interviews based on standardized criteria', async () => {
      const mockInterview = {
        id: 1,
        applicationId: 1,
        studentName: 'John Doe',
        scheduledDate: '2024-01-15',
        scheduledTime: '09:00',
        status: 'completed'
      }

      const mockEvaluationCriteria = [
        { id: 1, name: 'Academic Readiness', weight: 0.3, score: 4 },
        { id: 2, name: 'Social Development', weight: 0.25, score: 5 },
        { id: 3, name: 'Parent Engagement', weight: 0.2, score: 3 },
        { id: 4, name: 'Special Needs', weight: 0.15, score: 4 },
        { id: 5, name: 'Overall Impression', weight: 0.1, score: 4 }
      ]

      wrapper.vm.selectedInterview = mockInterview
      wrapper.vm.evaluationCriteria = mockEvaluationCriteria

      const evaluateButton = wrapper.find('[data-testid="evaluate-interview-btn"]')
      await evaluateButton.trigger('click')

      expect(interviewStore.evaluateInterview).toHaveBeenCalledWith(
        mockInterview.id,
        expect.objectContaining({
          criteria: mockEvaluationCriteria,
          totalScore: expect.any(Number)
        })
      )

      await wrapper.vm.$nextTick()
      
      const evaluationResults = wrapper.find('[data-testid="evaluation-results"]')
      expect(evaluationResults.exists()).toBe(true)
      
      const totalScore = wrapper.find('[data-testid="total-score"]')
      expect(totalScore.text()).toMatch(/4\.0/) // Weighted average
    })

    it('should provide interview feedback and recommendations', async () => {
      const mockEvaluationResults = {
        totalScore: 4.2,
        criteria: [
          { name: 'Academic Readiness', score: 4, feedback: 'Strong academic foundation' },
          { name: 'Social Development', score: 5, feedback: 'Excellent social skills' },
          { name: 'Parent Engagement', score: 3, feedback: 'Could improve parent involvement' }
        ],
        recommendations: [
          'Accept with conditions',
          'Provide additional academic support',
          'Schedule follow-up parent meeting'
        ],
        overallAssessment: 'Good candidate with potential for growth'
      }

      vi.mocked(interviewStore.evaluateInterview).mockResolvedValue(mockEvaluationResults)

      const evaluateButton = wrapper.find('[data-testid="evaluate-interview-btn"]')
      await evaluateButton.trigger('click')

      await wrapper.vm.$nextTick()
      
      const feedbackItems = wrapper.findAll('[data-testid="feedback-item"]')
      expect(feedbackItems.length).toBe(3)
      
      expect(feedbackItems[0].text()).toContain('Strong academic foundation')
      
      const recommendationItems = wrapper.findAll('[data-testid="recommendation-item"]')
      expect(recommendationItems.length).toBe(3)
      
      expect(recommendationItems[0].text()).toContain('Accept with conditions')
      
      const overallAssessment = wrapper.find('[data-testid="overall-assessment"]')
      expect(overallAssessment.text()).toContain('Good candidate with potential for growth')
    })

    it('should handle incomplete evaluations', async () => {
      const incompleteCriteria = [
        { id: 1, name: 'Academic Readiness', weight: 0.3, score: 4 },
        { id: 2, name: 'Social Development', weight: 0.25, score: null }, // Missing score
        { id: 3, name: 'Parent Engagement', weight: 0.2, score: 3 }
      ]

      wrapper.vm.evaluationCriteria = incompleteCriteria

      const evaluateButton = wrapper.find('[data-testid="evaluate-interview-btn"]')
      await evaluateButton.trigger('click')

      const validationError = wrapper.find('[data-testid="evaluation-error"]')
      expect(validationError.exists()).toBe(true)
      expect(validationError.text()).toContain('Please complete all evaluation criteria')
    })
  })

  describe('Interview Statistics and Analytics', () => {
    it('should generate interview performance statistics', async () => {
      const mockInterviewStats = {
        totalInterviews: 150,
        completedInterviews: 120,
        averageDuration: 25,
        acceptanceRate: 65,
        interviewerPerformance: [
          { name: 'Teacher A', interviews: 40, avgScore: 4.2 },
          { name: 'Teacher B', interviews: 35, avgScore: 3.8 },
          { name: 'Teacher C', interviews: 45, avgScore: 4.5 }
        ],
        timeSlotAnalysis: [
          { time: '09:00', utilization: 85 },
          { time: '10:00', utilization: 92 },
          { time: '14:00', utilization: 78 }
        ]
      }

      wrapper.vm.interviewStats = mockInterviewStats

      const statsButton = wrapper.find('[data-testid="show-stats-btn"]')
      await statsButton.trigger('click')

      await wrapper.vm.$nextTick()
      
      const statsModal = wrapper.find('[data-testid="interview-stats-modal"]')
      expect(statsModal.exists()).toBe(true)
      
      const totalInterviews = wrapper.find('[data-testid="total-interviews"]')
      expect(totalInterviews.text()).toContain('150')
      
      const acceptanceRate = wrapper.find('[data-testid="acceptance-rate"]')
      expect(acceptanceRate.text()).toContain('65%')
      
      const interviewerTable = wrapper.find('[data-testid="interviewer-performance-table"]')
      expect(interviewerTable.exists()).toBe(true)
    })

    it('should analyze interview scheduling patterns', async () => {
      const mockSchedulingPatterns = {
        peakTimes: ['09:00-10:00', '14:00-15:00'],
        peakDays: ['monday', 'tuesday'],
        seasonalTrends: {
          '2024-Q1': { interviews: 45, acceptance: 70 },
          '2024-Q2': { interviews: 52, acceptance: 68 },
          '2024-Q3': { interviews: 38, acceptance: 72 }
        },
        efficiencyMetrics: {
          schedulingEfficiency: 85,
          interviewerUtilization: 78,
          noShowRate: 12
        }
      }

      wrapper.vm.schedulingPatterns = mockSchedulingPatterns

      const patternsButton = wrapper.find('[data-testid="analyze-patterns-btn"]')
      await patternsButton.trigger('click')

      await wrapper.vm.$nextTick()
      
      const peakTimes = wrapper.find('[data-testid="peak-times"]')
      expect(peakTimes.text()).toContain('09:00-10:00')
      expect(peakTimes.text()).toContain('14:00-15:00')
      
      const seasonalTrendChart = wrapper.find('[data-testid="seasonal-trend-chart"]')
      expect(seasonalTrendChart.exists()).toBe(true)
    })
  })

  describe('Notification and Communication', () => {
    it('should send interview confirmation notifications', async () => {
      const mockInterview = {
        id: 1,
        studentName: 'John Doe',
        parentEmail: 'parent@example.com',
        parentPhone: '+1234567890',
        scheduledDate: '2024-01-15',
        scheduledTime: '09:00',
        interviewer: 'Teacher A'
      }

      wrapper.vm.selectedInterview = mockInterview

      const notifyButton = wrapper.find('[data-testid="send-notification-btn"]')
      await notifyButton.trigger('click')

      const notificationModal = wrapper.find('[data-testid="notification-modal"]')
      expect(notificationModal.exists()).toBe(true)

      const emailCheckbox = wrapper.find('[data-testid="notify-email"]')
      await emailCheckbox.setChecked(true)

      const smsCheckbox = wrapper.find('[data-testid="notify-sms"]')
      await smsCheckbox.setChecked(true)

      const sendButton = wrapper.find('[data-testid="send-notifications-btn"]')
      await sendButton.trigger('click')

      expect(wrapper.vm.notificationConfig.sendEmail).toBe(true)
      expect(wrapper.vm.notificationConfig.sendSMS).toBe(true)
    })

    it('should handle interview rescheduling and notifications', async () => {
      const mockInterview = {
        id: 1,
        studentName: 'John Doe',
        scheduledDate: '2024-01-15',
        scheduledTime: '09:00',
        status: 'scheduled'
      }

      wrapper.vm.selectedInterview = mockInterview

      const rescheduleButton = wrapper.find('[data-testid="reschedule-btn"]')
      await rescheduleButton.trigger('click')

      const rescheduleModal = wrapper.find('[data-testid="reschedule-modal"]')
      expect(rescheduleModal.exists()).toBe(true)

      const newDateInput = wrapper.find('[data-testid="new-date-input"]')
      await newDateInput.setValue('2024-01-16')

      const newTimeInput = wrapper.find('[data-testid="new-time-input"]')
      await newTimeInput.setValue('14:00')

      const reasonInput = wrapper.find('[data-testid="reschedule-reason"]')
      await reasonInput.setValue('Teacher unavailable')

      const confirmButton = wrapper.find('[data-testid="confirm-reschedule-btn"]')
      await confirmButton.trigger('click')

      expect(wrapper.vm.rescheduleData.newDate).toBe('2024-01-16')
      expect(wrapper.vm.rescheduleData.newTime).toBe('14:00')
      expect(wrapper.vm.rescheduleData.reason).toBe('Teacher unavailable')
    })
  })

  describe('Data Validation and Error Handling', () => {
    it('should validate interview scheduling data', async () => {
      const invalidInterviewData = {
        applicationId: null, // Missing application ID
        scheduledDate: '2024-01-15',
        scheduledTime: '09:00'
      }

      wrapper.vm.interviewData = invalidInterviewData

      const scheduleButton = wrapper.find('[data-testid="schedule-interview-btn"]')
      await scheduleButton.trigger('click')

      const validationError = wrapper.find('[data-testid="validation-error"]')
      expect(validationError.exists()).toBe(true)
      expect(validationError.text()).toContain('Application ID is required')
    })

    it('should handle date and time conflicts', async () => {
      const conflictingInterview = {
        applicationId: 1,
        scheduledDate: '2024-01-15',
        scheduledTime: '09:00',
        interviewerId: 1
      }

      vi.mocked(interviewStore.scheduleInterview).mockRejectedValue(
        new Error('Time slot already booked')
      )

      wrapper.vm.interviewData = conflictingInterview

      const scheduleButton = wrapper.find('[data-testid="schedule-interview-btn"]')
      await scheduleButton.trigger('click')

      await wrapper.vm.$nextTick()
      
      const conflictError = wrapper.find('[data-testid="conflict-error"]')
      expect(conflictError.exists()).toBe(true)
      expect(conflictError.text()).toContain('Time slot already booked')
    })

    it('should validate evaluation criteria completeness', async () => {
      const incompleteEvaluation = {
        criteria: [
          { id: 1, score: 4 },
          { id: 2, score: null }, // Missing score
          { id: 3, score: 3 }
        ]
      }

      wrapper.vm.evaluationData = incompleteEvaluation

      const submitButton = wrapper.find('[data-testid="submit-evaluation-btn"]')
      await submitButton.trigger('click')

      const validationError = wrapper.find('[data-testid="evaluation-validation-error"]')
      expect(validationError.exists()).toBe(true)
      expect(validationError.text()).toContain('All criteria must be scored')
    })
  })

  describe('User Interface Interactions', () => {
    it('should provide calendar view for interview scheduling', async () => {
      const calendarView = wrapper.find('[data-testid="calendar-view"]')
      expect(calendarView.exists()).toBe(true)

      const calendarDays = wrapper.findAll('[data-testid="calendar-day"]')
      expect(calendarDays.length).toBeGreaterThan(0)

      // Simulate clicking on a calendar day
      const availableDay = wrapper.find('[data-testid="calendar-day-15"]')
      await availableDay.trigger('click')

      expect(wrapper.vm.selectedDate).toBe('2024-01-15')
      
      const timeSlots = wrapper.find('[data-testid="time-slots"]')
      expect(timeSlots.exists()).toBe(true)
    })

    it('should allow drag-and-drop interview rescheduling', async () => {
      const mockInterview = {
        id: 1,
        studentName: 'John Doe',
        scheduledDate: '2024-01-15',
        scheduledTime: '09:00'
      }

      wrapper.vm.interviews = [mockInterview]

      const interviewElement = wrapper.find('[data-testid="interview-1"]')
      const targetSlot = wrapper.find('[data-testid="time-slot-14-00"]')

      // Simulate drag and drop
      await interviewElement.trigger('dragstart')
      await targetSlot.trigger('dragover')
      await targetSlot.trigger('drop')

      expect(wrapper.vm.draggedInterview).toBeDefined()
      expect(wrapper.vm.targetSlot).toBeDefined()
    })

    it('should provide interview status filtering and search', async () => {
      const mockInterviews = [
        { id: 1, studentName: 'John Doe', status: 'scheduled' },
        { id: 2, studentName: 'Jane Smith', status: 'completed' },
        { id: 3, studentName: 'Bob Johnson', status: 'cancelled' }
      ]

      wrapper.vm.interviews = mockInterviews

      const statusFilter = wrapper.find('[data-testid="status-filter"]')
      await statusFilter.setValue('completed')

      const filteredInterviews = wrapper.findAll('[data-testid="interview-item"]')
      expect(filteredInterviews.length).toBe(1)
      expect(filteredInterviews[0].text()).toContain('Jane Smith')

      const searchInput = wrapper.find('[data-testid="search-input"]')
      await searchInput.setValue('John')

      const searchResults = wrapper.findAll('[data-testid="interview-item"]')
      expect(searchResults.length).toBe(1)
      expect(searchResults[0].text()).toContain('John Doe')
    })
  })

  describe('Performance Optimization', () => {
    it('should handle large numbers of interview requests efficiently', async () => {
      // Create large dataset
      const largeInterviewDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        studentName: `Student ${i + 1}`,
        scheduledDate: `2024-01-${String((i % 30) + 1).padStart(2, '0')}`,
        scheduledTime: `${String(Math.floor(i % 12) + 8).padStart(2, '0')}:00`,
        status: ['scheduled', 'completed', 'cancelled'][i % 3]
      }))

      wrapper.vm.interviews = largeInterviewDataset

      const startTime = performance.now()
      
      const filterButton = wrapper.find('[data-testid="filter-interviews-btn"]')
      await filterButton.trigger('click')

      const endTime = performance.now()
      const processingTime = endTime - startTime

      expect(processingTime).toBeLessThan(2000) // Should process within 2 seconds
    })

    it('should implement caching for interview data', async () => {
      const mockInterviewData = { id: 1, studentName: 'John Doe' }

      // First load
      await wrapper.vm.loadInterview(1)
      
      // Second load should use cache
      await wrapper.vm.loadInterview(1)

      expect(wrapper.vm.interviewCache.has(1)).toBe(true)
      expect(wrapper.vm.cacheHits).toBeGreaterThan(0)
    })
  })
})