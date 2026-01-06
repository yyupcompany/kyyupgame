import { TestDataFactory, DatabaseCleaner } from '../helpers/testUtils';

// Mock controller classes
class MockUserController {
  async getUserProfile(req: any, res: any) {
    const userId = req.user.id;
    const user = TestDataFactory.createUser({ id: userId });
    
    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: {
          avatar: (user as any).avatar || 'default-avatar.png',
          displayName: (user as any).displayName || user.username,
          phone: (user as any).phone || '13800000000'
        }
      }
    });
  }

  async updateUserProfile(req: any, res: any) {
    const userId = req.user.id;
    const updateData = req.body;
    
    // Validate input
    if (!updateData.username && !updateData.email && !updateData.phone) {
      return res.status(400).json({
        success: false,
        message: 'At least one field must be updated'
      });
    }

    // Simulate validation errors
    if (updateData.email && !updateData.email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    const updatedUser = {
      id: userId,
      ...updateData,
      updatedAt: new Date()
    };

    return res.status(200).json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
    });
  }

  async changePassword(req: any, res: any) {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All password fields are required'
      });
    }

    // Validate password confirmation
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirmation do not match'
      });
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Mock current password validation
    if (currentPassword !== 'correct_password') {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  }

  async deleteUser(req: any, res: any) {
    const userId = parseInt(req.params.id);
    const currentUserId = req.user.id;

    // Prevent self-deletion
    if (userId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Check admin permissions
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can delete users'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  }
}

class MockStudentController {
  async getStudentDetails(req: any, res: any) {
    const studentId = parseInt(req.params.id);
    const student = TestDataFactory.createStudent({ id: studentId });

    return res.status(200).json({
      success: true,
      data: {
        ...student,
        class: {
          id: 1,
          name: '大班A',
          grade: '大班',
          teacher: {
            id: 1,
            name: '张老师'
          }
        },
        parent: {
          id: 1,
          name: '学生家长',
          phone: '13900139000'
        },
        academicRecord: {
          attendance: 95,
          behavior: 'excellent',
          lastEvaluation: new Date()
        }
      }
    });
  }

  async createStudent(req: any, res: any) {
    const studentData = req.body;

    // Validate required fields
    const requiredFields = ['name', 'gender', 'birthDate', 'parentId'];
    for (const field of requiredFields) {
      if (!studentData[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }

    // Validate age
    const birthDate = new Date(studentData.birthDate);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    if (age < 3 || age > 6) {
      return res.status(400).json({
        success: false,
        message: 'Student age must be between 3 and 6 years'
      });
    }

    const newStudent = {
      id: Math.floor(Math.random() * 1000),
      ...studentData,
      enrollmentDate: new Date(),
      status: 'active'
    };

    return res.status(201).json({
      success: true,
      data: newStudent,
      message: 'Student created successfully'
    });
  }

  async updateStudent(req: any, res: any) {
    const studentId = parseInt(req.params.id);
    const updateData = req.body;

    // Check if student exists (mock)
    if (studentId === 99999) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Validate class assignment
    if (updateData.classId && updateData.classId === 99999) {
      return res.status(400).json({
        success: false,
        message: 'Invalid class assignment'
      });
    }

    const updatedStudent = {
      id: studentId,
      ...updateData,
      updatedAt: new Date()
    };

    return res.status(200).json({
      success: true,
      data: updatedStudent,
      message: 'Student updated successfully'
    });
  }

  async transferStudent(req: any, res: any) {
    const studentId = parseInt(req.params.id);
    const { fromClassId, toClassId, reason } = req.body;

    // Validate transfer data
    if (!fromClassId || !toClassId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Transfer requires fromClassId, toClassId, and reason'
      });
    }

    if (fromClassId === toClassId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot transfer student to the same class'
      });
    }

    // Check class capacity (mock)
    if (toClassId === 999) {
      return res.status(400).json({
        success: false,
        message: 'Target class is at full capacity'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        studentId,
        fromClassId,
        toClassId,
        transferDate: new Date(),
        reason,
        status: 'completed'
      },
      message: 'Student transferred successfully'
    });
  }
}

class MockTeacherController {
  async getTeacherSchedule(req: any, res: any) {
    const teacherId = parseInt(req.params.id);
    const { date } = req.query;

    const schedule = {
      teacherId,
      date: date || new Date().toISOString().split('T')[0],
      classes: [
        {
          id: 1,
          name: '大班A',
          time: '08:30-09:30',
          subject: '数学',
          room: '教室101'
        },
        {
          id: 2,
          name: '中班B',
          time: '10:00-11:00',
          subject: '语言',
          room: '教室102'
        }
      ],
      activities: [
        {
          id: 1,
          title: '户外活动',
          time: '14:30-15:30',
          location: '操场'
        }
      ]
    };

    return res.status(200).json({
      success: true,
      data: schedule
    });
  }

  async updateTeacherSchedule(req: any, res: any) {
    const teacherId = parseInt(req.params.id);
    const scheduleData = req.body;

    // Validate schedule conflicts
    if (scheduleData.classes && scheduleData.classes.length > 0) {
      const times = scheduleData.classes.map((c: any) => c.time);
      const uniqueTimes = new Set(times);
      
      if (times.length !== uniqueTimes.size) {
        return res.status(400).json({
          success: false,
          message: 'Schedule contains time conflicts'
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        teacherId,
        ...scheduleData,
        updatedAt: new Date()
      },
      message: 'Schedule updated successfully'
    });
  }

  async getTeacherPerformance(req: any, res: any) {
    const teacherId = parseInt(req.params.id);
    const { startDate, endDate } = req.query;

    // Check permissions
    if (req.user.role !== 'admin' && req.user.role !== 'principal' && req.user.id !== teacherId) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to view performance data'
      });
    }

    const performance = {
      teacherId,
      period: {
        startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: endDate || new Date().toISOString().split('T')[0]
      },
      metrics: {
        attendanceRate: 98.5,
        classPreparation: 4.8,
        studentEngagement: 4.6,
        parentSatisfaction: 4.7,
        professionalDevelopment: 4.5
      },
      feedback: [
        {
          type: 'parent',
          rating: 5,
          comment: '老师很负责任，孩子进步很大'
        },
        {
          type: 'admin',
          rating: 4,
          comment: '教学方法有创新，建议多参与培训'
        }
      ]
    };

    return res.status(200).json({
      success: true,
      data: performance
    });
  }
}

class MockActivityController {
  async createActivity(req: any, res: any) {
    const activityData = req.body;
    const organizerId = req.user.id;

    // Validate required fields
    const requiredFields = ['title', 'type', 'startTime', 'endTime'];
    for (const field of requiredFields) {
      if (!activityData[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }

    // Validate time constraints
    const startTime = new Date(activityData.startTime);
    const endTime = new Date(activityData.endTime);
    
    if (endTime <= startTime) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    // Check for scheduling conflicts
    if (activityData.location === 'conflict_location') {
      return res.status(400).json({
        success: false,
        message: 'Location is already booked for this time slot'
      });
    }

    const newActivity = {
      id: Math.floor(Math.random() * 1000),
      ...activityData,
      organizerId,
      status: activityData.fee > 300 ? '待审核' : '开放报名',
      currentRegistrations: 0,
      createdAt: new Date()
    };

    return res.status(201).json({
      success: true,
      data: newActivity,
      message: 'Activity created successfully'
    });
  }

  async registerForActivity(req: any, res: any) {
    const activityId = parseInt(req.params.id);
    const { studentId } = req.body;
    const parentId = req.user.id;

    // Check activity capacity (mock)
    if (activityId === 999) {
      return res.status(400).json({
        success: false,
        message: 'Activity is at full capacity'
      });
    }

    // Check if already registered
    if (studentId === 999) {
      return res.status(400).json({
        success: false,
        message: 'Student is already registered for this activity'
      });
    }

    // Check age requirements
    if (studentId === 888) {
      return res.status(400).json({
        success: false,
        message: 'Student does not meet age requirements for this activity'
      });
    }

    const registration = {
      id: Math.floor(Math.random() * 1000),
      activityId,
      studentId,
      parentId,
      registrationDate: new Date(),
      status: 'confirmed',
      paymentStatus: 'pending'
    };

    return res.status(201).json({
      success: true,
      data: registration,
      message: 'Registration successful'
    });
  }

  async cancelActivityRegistration(req: any, res: any) {
    const activityId = parseInt(req.params.activityId);
    const studentId = parseInt(req.params.studentId);

    // Check if registration exists
    if (studentId === 99999) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    // Calculate cancellation fees
    const now = new Date();
    const activityStart = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days from now
    const hoursUntilActivity = (activityStart.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    let cancellationFee = 0;
    let refundAmount = 100; // Original fee

    if (hoursUntilActivity < 24) {
      cancellationFee = 50; // 50% cancellation fee
      refundAmount = 50;
    } else if (hoursUntilActivity < 72) {
      cancellationFee = 20; // 20% cancellation fee
      refundAmount = 80;
    }

    return res.status(200).json({
      success: true,
      data: {
        activityId,
        studentId,
        cancellationDate: new Date(),
        cancellationFee,
        refundAmount,
        refundMethod: 'original_payment'
      },
      message: 'Registration cancelled successfully'
    });
  }
}

class MockEnrollmentController {
  async createEnrollmentPlan(req: any, res: any) {
    const planData = req.body;

    // Check admin permissions
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can create enrollment plans'
      });
    }

    // Validate required fields
    const requiredFields = ['title', 'startDate', 'endDate', 'targetCount'];
    for (const field of requiredFields) {
      if (!planData[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }

    // Validate date constraints
    const startDate = new Date(planData.startDate);
    const endDate = new Date(planData.endDate);
    
    if (endDate <= startDate) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    const newPlan = {
      id: Math.floor(Math.random() * 1000),
      ...planData,
      currentCount: 0,
      status: '进行中',
      createdAt: new Date()
    };

    return res.status(201).json({
      success: true,
      data: newPlan,
      message: 'Enrollment plan created successfully'
    });
  }

  async submitApplication(req: any, res: any) {
    const applicationData = req.body;
    const parentId = req.user.id;

    // Validate required fields
    const requiredFields = ['enrollmentPlanId', 'studentName', 'studentBirthDate', 'parentName', 'parentPhone'];
    for (const field of requiredFields) {
      if (!applicationData[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }

    // Validate student age
    const birthDate = new Date(applicationData.studentBirthDate);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    
    if (age < 3 || age > 6) {
      return res.status(400).json({
        success: false,
        message: 'Student age must be between 3 and 6 years old'
      });
    }

    // Check enrollment plan availability
    if (applicationData.enrollmentPlanId === 999) {
      return res.status(400).json({
        success: false,
        message: 'Enrollment plan is no longer accepting applications'
      });
    }

    const application = {
      id: Math.floor(Math.random() * 1000),
      ...applicationData,
      parentId,
      status: '待审核',
      submissionDate: new Date(),
      applicationNumber: `APP${new Date().getFullYear()}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
    };

    return res.status(201).json({
      success: true,
      data: application,
      message: 'Application submitted successfully'
    });
  }

  async reviewApplication(req: any, res: any) {
    const applicationId = parseInt(req.params.id);
    const reviewData = req.body;

    // Check admin permissions
    if (req.user.role !== 'admin' && req.user.role !== 'principal') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to review applications'
      });
    }

    // Validate review data
    if (!reviewData.status || !reviewData.reviewNotes) {
      return res.status(400).json({
        success: false,
        message: 'Review status and notes are required'
      });
    }

    // Validate class assignment for approved applications
    if (reviewData.status === '已通过' && !reviewData.assignedClassId) {
      return res.status(400).json({
        success: false,
        message: 'Class assignment is required for approved applications'
      });
    }

    const review = {
      applicationId,
      ...reviewData,
      reviewerId: req.user.id,
      reviewDate: new Date()
    };

    return res.status(200).json({
      success: true,
      data: review,
      message: 'Application review completed successfully'
    });
  }

  async getEnrollmentStatistics(req: any, res: any) {
    const { planId, startDate, endDate } = req.query;

    // Check permissions
    if (req.user.role !== 'admin' && req.user.role !== 'principal') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to view enrollment statistics'
      });
    }

    const statistics = {
      totalApplications: 150,
      approvedApplications: 120,
      pendingApplications: 20,
      rejectedApplications: 10,
      enrollmentRate: 80, // (approved / total) * 100
      averageProcessingTime: 3.5, // days
      ageDistribution: {
        '3岁': 25,
        '4岁': 35,
        '5岁': 40,
        '6岁': 50
      },
      classDistribution: {
        '小班': 45,
        '中班': 50,
        '大班': 55
      },
      monthlyTrend: [
        { month: '2024-01', applications: 30 },
        { month: '2024-02', applications: 45 },
        { month: '2024-03', applications: 75 }
      ]
    };

    return res.status(200).json({
      success: true,
      data: statistics
    });
  }
}

describe('Controller Layer Tests', () => {
  let userController: MockUserController;
  let studentController: MockStudentController;
  let teacherController: MockTeacherController;
  let activityController: MockActivityController;
  let enrollmentController: MockEnrollmentController;

  beforeAll(() => {
    userController = new MockUserController();
    studentController = new MockStudentController();
    teacherController = new MockTeacherController();
    activityController = new MockActivityController();
    enrollmentController = new MockEnrollmentController();
  });

  beforeEach(async () => {
    await DatabaseCleaner.cleanAll();
  });

  describe('UserController Tests', () => {
    it('should get user profile successfully', async () => {
      const req = {
        user: { id: 1, role: 'teacher' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await userController.getUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            id: 1,
            username: expect.any(String),
            email: expect.any(String),
            role: expect.any(String)
          })
        })
      );
    });

    it('should update user profile with validation', async () => {
      const req = {
        user: { id: 1 },
        body: {
          username: 'updated_user',
          email: 'updated@test.com',
          phone: '13900139001'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await userController.updateUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            id: 1,
            username: 'updated_user',
            email: 'updated@test.com'
          }),
          message: 'Profile updated successfully'
        })
      );
    });

    it('should validate email format in profile update', async () => {
      const req = {
        user: { id: 1 },
        body: {
          email: 'invalid-email'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await userController.updateUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Invalid email format'
        })
      );
    });

    it('should change password with proper validation', async () => {
      const req = {
        body: {
          currentPassword: 'correct_password',
          newPassword: 'new_secure_password',
          confirmPassword: 'new_secure_password'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await userController.changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Password changed successfully'
        })
      );
    });

    it('should validate password confirmation', async () => {
      const req = {
        body: {
          currentPassword: 'correct_password',
          newPassword: 'new_password',
          confirmPassword: 'different_password'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await userController.changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'New password and confirmation do not match'
        })
      );
    });

    it('should prevent self-deletion', async () => {
      const req = {
        params: { id: '1' },
        user: { id: 1, role: 'admin' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await userController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Cannot delete your own account'
        })
      );
    });
  });

  describe('StudentController Tests', () => {
    it('should get student details with relationships', async () => {
      const req = {
        params: { id: '1' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await studentController.getStudentDetails(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            id: 1,
            class: expect.objectContaining({
              name: '大班A',
              teacher: expect.objectContaining({
                name: '张老师'
              })
            }),
            parent: expect.any(Object),
            academicRecord: expect.any(Object)
          })
        })
      );
    });

    it('should create student with age validation', async () => {
      const req = {
        body: {
          name: '新学生',
          gender: '男',
          birthDate: '2020-06-15',
          parentId: 1
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await studentController.createStudent(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            name: '新学生',
            status: 'active'
          }),
          message: 'Student created successfully'
        })
      );
    });

    it('should validate student age range', async () => {
      const req = {
        body: {
          name: '年龄不符',
          gender: '女',
          birthDate: '2022-01-01', // Too young
          parentId: 1
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await studentController.createStudent(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Student age must be between 3 and 6 years'
        })
      );
    });

    it('should transfer student between classes', async () => {
      const req = {
        params: { id: '1' },
        body: {
          fromClassId: 1,
          toClassId: 2,
          reason: '学生要求转班'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await studentController.transferStudent(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            studentId: 1,
            fromClassId: 1,
            toClassId: 2,
            status: 'completed'
          }),
          message: 'Student transferred successfully'
        })
      );
    });

    it('should validate class capacity for transfers', async () => {
      const req = {
        params: { id: '1' },
        body: {
          fromClassId: 1,
          toClassId: 999, // Full capacity class
          reason: '转班申请'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await studentController.transferStudent(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Target class is at full capacity'
        })
      );
    });
  });

  describe('TeacherController Tests', () => {
    it('should get teacher schedule', async () => {
      const req = {
        params: { id: '1' },
        query: { date: '2024-07-15' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await teacherController.getTeacherSchedule(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            teacherId: 1,
            date: '2024-07-15',
            classes: expect.arrayContaining([
              expect.objectContaining({
                name: '大班A',
                subject: '数学'
              })
            ]),
            activities: expect.any(Array)
          })
        })
      );
    });

    it('should update teacher schedule with conflict validation', async () => {
      const req = {
        params: { id: '1' },
        body: {
          classes: [
            { name: '大班A', time: '09:00-10:00', subject: '数学' },
            { name: '中班B', time: '10:30-11:30', subject: '语言' }
          ]
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await teacherController.updateTeacherSchedule(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Schedule updated successfully'
        })
      );
    });

    it('should detect schedule time conflicts', async () => {
      const req = {
        params: { id: '1' },
        body: {
          classes: [
            { name: '大班A', time: '09:00-10:00', subject: '数学' },
            { name: '中班B', time: '09:00-10:00', subject: '语言' } // Conflict
          ]
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await teacherController.updateTeacherSchedule(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Schedule contains time conflicts'
        })
      );
    });

    it('should get teacher performance with proper permissions', async () => {
      const req = {
        params: { id: '1' },
        query: {},
        user: { id: 1, role: 'teacher' } // Teacher viewing own performance
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await teacherController.getTeacherPerformance(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            teacherId: 1,
            metrics: expect.objectContaining({
              attendanceRate: expect.any(Number),
              classPreparation: expect.any(Number)
            }),
            feedback: expect.any(Array)
          })
        })
      );
    });

    it('should restrict performance access to authorized users', async () => {
      const req = {
        params: { id: '1' },
        query: {},
        user: { id: 2, role: 'teacher' } // Different teacher
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await teacherController.getTeacherPerformance(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Insufficient permissions to view performance data'
        })
      );
    });
  });

  describe('ActivityController Tests', () => {
    it('should create activity with proper validation', async () => {
      const req = {
        body: {
          title: '春季户外活动',
          type: '户外活动',
          startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
          location: '公园',
          capacity: 20,
          fee: 100
        },
        user: { id: 1, role: 'teacher' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await activityController.createActivity(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            title: '春季户外活动',
            organizerId: 1,
            status: '开放报名'
          }),
          message: 'Activity created successfully'
        })
      );
    });

    it('should validate activity time constraints', async () => {
      const req = {
        body: {
          title: '测试活动',
          type: '室内活动',
          startTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(), // Before start time
        },
        user: { id: 1, role: 'teacher' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await activityController.createActivity(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'End time must be after start time'
        })
      );
    });

    it('should register student for activity', async () => {
      const req = {
        params: { id: '1' },
        body: { studentId: 1 },
        user: { id: 1, role: 'parent' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await activityController.registerForActivity(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            activityId: 1,
            studentId: 1,
            status: 'confirmed'
          }),
          message: 'Registration successful'
        })
      );
    });

    it('should check activity capacity before registration', async () => {
      const req = {
        params: { id: '999' }, // Full capacity activity
        body: { studentId: 1 },
        user: { id: 1, role: 'parent' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await activityController.registerForActivity(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Activity is at full capacity'
        })
      );
    });

    it('should calculate cancellation fees correctly', async () => {
      const req = {
        params: { activityId: '1', studentId: '1' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await activityController.cancelActivityRegistration(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            cancellationFee: expect.any(Number),
            refundAmount: expect.any(Number)
          }),
          message: 'Registration cancelled successfully'
        })
      );
    });
  });

  describe('EnrollmentController Tests', () => {
    it('should create enrollment plan with admin permissions', async () => {
      const req = {
        body: {
          title: '2024年秋季招生',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          targetCount: 100
        },
        user: { id: 1, role: 'admin' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await enrollmentController.createEnrollmentPlan(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            title: '2024年秋季招生',
            status: '进行中'
          }),
          message: 'Enrollment plan created successfully'
        })
      );
    });

    it('should validate enrollment plan dates', async () => {
      const req = {
        body: {
          title: '测试计划',
          startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(), // Before start date
          targetCount: 50
        },
        user: { id: 1, role: 'admin' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await enrollmentController.createEnrollmentPlan(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'End date must be after start date'
        })
      );
    });

    it('should submit enrollment application', async () => {
      const req = {
        body: {
          enrollmentPlanId: 1,
          studentName: '申请学生',
          studentBirthDate: '2020-06-15',
          parentName: '申请家长',
          parentPhone: '13900139000'
        },
        user: { id: 1, role: 'parent' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await enrollmentController.submitApplication(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            studentName: '申请学生',
            status: '待审核',
            applicationNumber: expect.stringMatching(/^APP\d{4}\d{3}$/)
          }),
          message: 'Application submitted successfully'
        })
      );
    });

    it('should review application with proper permissions', async () => {
      const req = {
        params: { id: '1' },
        body: {
          status: '已通过',
          reviewNotes: '材料齐全，符合要求',
          assignedClassId: 1
        },
        user: { id: 1, role: 'admin' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await enrollmentController.reviewApplication(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            applicationId: 1,
            status: '已通过',
            reviewerId: 1
          }),
          message: 'Application review completed successfully'
        })
      );
    });

    it('should get enrollment statistics with admin permissions', async () => {
      const req = {
        query: {},
        user: { id: 1, role: 'admin' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await enrollmentController.getEnrollmentStatistics(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            totalApplications: expect.any(Number),
            enrollmentRate: expect.any(Number),
            ageDistribution: expect.any(Object),
            monthlyTrend: expect.any(Array)
          })
        })
      );
    });
  });

  describe('Controller Error Handling Tests', () => {
    it('should handle missing required fields', async () => {
      const req = {
        body: {}, // Empty body
        user: { id: 1, role: 'teacher' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await activityController.createActivity(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('is required')
        })
      );
    });

    it('should handle permission denied scenarios', async () => {
      const req = {
        body: {
          title: '测试计划',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          targetCount: 50
        },
        user: { id: 1, role: 'teacher' } // Non-admin user
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await enrollmentController.createEnrollmentPlan(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('administrator')
        })
      );
    });

    it('should handle resource not found scenarios', async () => {
      const req = {
        params: { id: '99999' } // Non-existent student
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await studentController.updateStudent(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Student not found'
        })
      );
    });

    it('should handle business logic violations', async () => {
      const req = {
        params: { id: '1' },
        body: {
          fromClassId: 1,
          toClassId: 1, // Same class transfer
          reason: '测试转班'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await studentController.transferStudent(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Cannot transfer student to the same class'
        })
      );
    });
  });

  describe('Controller Integration Tests', () => {
    it('should handle complex enrollment workflow', async () => {
      // Create enrollment plan
      const planReq = {
        body: {
          title: '测试招生计划',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          targetCount: 100
        },
        user: { id: 1, role: 'admin' }
      };
      const planRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await enrollmentController.createEnrollmentPlan(planReq, planRes);
      expect(planRes.status).toHaveBeenCalledWith(201);

      // Submit application
      const appReq = {
        body: {
          enrollmentPlanId: 1,
          studentName: '测试学生',
          studentBirthDate: '2020-06-15',
          parentName: '测试家长',
          parentPhone: '13900139000'
        },
        user: { id: 2, role: 'parent' }
      };
      const appRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await enrollmentController.submitApplication(appReq, appRes);
      expect(appRes.status).toHaveBeenCalledWith(201);

      // Review application
      const reviewReq = {
        params: { id: '1' },
        body: {
          status: '已通过',
          reviewNotes: '符合要求',
          assignedClassId: 1
        },
        user: { id: 1, role: 'admin' }
      };
      const reviewRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await enrollmentController.reviewApplication(reviewReq, reviewRes);
      expect(reviewRes.status).toHaveBeenCalledWith(200);
    });

    it('should handle activity lifecycle workflow', async () => {
      // Create activity
      const createReq = {
        body: {
          title: '测试活动',
          type: '室内活动',
          startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
          capacity: 20,
          fee: 50
        },
        user: { id: 1, role: 'teacher' }
      };
      const createRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await activityController.createActivity(createReq, createRes);
      expect(createRes.status).toHaveBeenCalledWith(201);

      // Register for activity
      const registerReq = {
        params: { id: '1' },
        body: { studentId: 1 },
        user: { id: 2, role: 'parent' }
      };
      const registerRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await activityController.registerForActivity(registerReq, registerRes);
      expect(registerRes.status).toHaveBeenCalledWith(201);

      // Cancel registration
      const cancelReq = {
        params: { activityId: '1', studentId: '1' }
      };
      const cancelRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await activityController.cancelActivityRegistration(cancelReq, cancelRes);
      expect(cancelRes.status).toHaveBeenCalledWith(200);
    });
  });
});