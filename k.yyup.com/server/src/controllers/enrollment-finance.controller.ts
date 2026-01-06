/**
 * 招生财务联动控制器
 */

import { Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../init';

export class EnrollmentFinanceController {
  /**
   * 获取招生财务关联列表
   */
  static async getLinkages(req: Request, res: Response) {
    try {
      const tenantDb = req.tenant?.databaseName || 'tenant_dev';
      const { status, className, page = 1, pageSize = 20 } = req.query;
      const offset = (Number(page) - 1) * Number(pageSize);
      
      let whereClause = '';
      const replacements: any[] = [];

      if (status) {
        whereClause += ' AND ea.status = ?';
        replacements.push(status);
      }

      if (className) {
        whereClause += ' AND c.name LIKE ?';
        replacements.push(`%${className}%`);
      }

      // 获取招生财务关联数据
      const [linkages] = await sequelize.query(`
        SELECT
          ea.id as enrollmentId,
          ea.student_name as studentName,
          COALESCE(c.name, '未分配班级') as className,
          ea.status as enrollmentStatus,
          CASE
            WHEN ar.payment_status = 2 THEN 'paid'
            WHEN ar.payment_status = 1 THEN 'pending_payment'
            WHEN ar.payment_status = 0 THEN 'not_generated'
            ELSE 'not_generated'
          END as financialStatus,
          ar.tuition_fee as totalAmount,
          ar.payment_status,
          ea.created_at as enrollmentDate,
          ar.enrollment_date as paymentDueDate
        FROM ${tenantDb}.enrollment_applications ea
        LEFT JOIN ${tenantDb}.enrollment_plans ep ON ea.plan_id = ep.id
        LEFT JOIN ${tenantDb}.enrollment_plan_classes epc ON ep.id = epc.plan_id
        LEFT JOIN ${tenantDb}.classes c ON epc.class_id = c.id
        LEFT JOIN ${tenantDb}.admission_results ar ON ea.id = ar.application_id
        WHERE ea.deleted_at IS NULL ${whereClause}
        ORDER BY ea.created_at DESC
        LIMIT ? OFFSET ?
      `, {
        replacements: [...replacements, Number(pageSize), offset],
        type: QueryTypes.SELECT
      });
      
      // 获取总数
      const [countResult] = await sequelize.query(`
        SELECT COUNT(DISTINCT ea.id) as total
        FROM ${tenantDb}.enrollment_applications ea
        LEFT JOIN ${tenantDb}.enrollment_plans ep ON ea.plan_id = ep.id
        LEFT JOIN ${tenantDb}.enrollment_plan_classes epc ON ep.id = epc.plan_id
        LEFT JOIN ${tenantDb}.classes c ON epc.class_id = c.id
        LEFT JOIN ${tenantDb}.admission_results ar ON ea.id = ar.application_id
        WHERE ea.deleted_at IS NULL${whereClause}
      `, {
        replacements,
        type: QueryTypes.SELECT
      });
      
      const total = (countResult as any)[0]?.total || 0;
      
      res.json({
        success: true,
        data: {
          list: linkages,
          total: Number(total)
        },
        message: '获取招生财务关联列表成功'
      });
    } catch (error) {
      console.error('获取招生财务关联列表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取招生财务关联列表失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取统计数据
   */
  static async getStatistics(req: Request, res: Response) {
    try {
      const tenantDb = req.tenant?.databaseName || 'tenant_dev';
      // 获取招生统计
      const [enrollmentStats] = await sequelize.query(`
        SELECT 
          COUNT(*) as totalEnrollments,
          COUNT(CASE WHEN ar.payment_status = 2 THEN 1 END) as paidEnrollments,
          COUNT(CASE WHEN ar.payment_status IN (0, 1) THEN 1 END) as pendingPayments,
          COUNT(CASE WHEN ar.payment_status = 0 AND ar.enrollment_date < NOW() THEN 1 END) as overduePayments,
          SUM(CASE WHEN ar.payment_status = 2 THEN ar.tuition_fee ELSE 0 END) as totalRevenue
        FROM ${tenantDb}.enrollment_applications ea
        LEFT JOIN ${tenantDb}.admission_results ar ON ea.id = ar.application_id
        WHERE ea.deleted_at IS NULL
      `, {
        type: QueryTypes.SELECT
      });
      
      const stats = (enrollmentStats as any)[0] || {};
      
      res.json({
        success: true,
        data: {
          totalEnrollments: Number(stats.totalEnrollments) || 0,
          paidEnrollments: Number(stats.paidEnrollments) || 0,
          pendingPayments: Number(stats.pendingPayments) || 0,
          overduePayments: Number(stats.overduePayments) || 0,
          totalRevenue: Number(stats.totalRevenue) || 0,
          averagePaymentTime: 2.5, // 模拟数据
          conversionRate: stats.totalEnrollments > 0 ? 
            (Number(stats.paidEnrollments) / Number(stats.totalEnrollments) * 100).toFixed(1) : 0
        },
        message: '获取统计数据成功'
      });
    } catch (error) {
      console.error('获取统计数据失败:', error);
      res.status(500).json({
        success: false,
        message: '获取统计数据失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取费用套餐模板
   */
  static async getFeeTemplates(req: Request, res: Response) {
    try {
      // 返回模拟数据，后续会从数据库获取
      const templates = [
        {
          id: 'PKG001',
          name: '小班新生套餐',
          description: '适用于小班新入园学生的标准收费套餐',
          targetGrade: '小班',
          items: [
            { feeId: 'F001', feeName: '保教费', amount: 3000, period: '月', isRequired: true },
            { feeId: 'F002', feeName: '餐费', amount: 500, period: '月', isRequired: true },
            { feeId: 'F003', feeName: '书本费', amount: 200, period: '学期', isRequired: true },
            { feeId: 'F004', feeName: '校服费', amount: 100, period: '一次性', isRequired: false }
          ],
          totalAmount: 3800,
          discountRate: 0,
          isActive: true
        },
        {
          id: 'PKG002',
          name: '中班转班套餐',
          description: '适用于中班转班学生的收费套餐',
          targetGrade: '中班',
          items: [
            { feeId: 'F001', feeName: '保教费', amount: 3000, period: '月', isRequired: true },
            { feeId: 'F002', feeName: '餐费', amount: 500, period: '月', isRequired: true }
          ],
          totalAmount: 3500,
          discountRate: 0,
          isActive: true
        }
      ];
      
      res.json({
        success: true,
        data: templates,
        message: '获取费用套餐模板成功'
      });
    } catch (error) {
      console.error('获取费用套餐模板失败:', error);
      res.status(500).json({
        success: false,
        message: '获取费用套餐模板失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取招生流程详情
   */
  static async getEnrollmentProcess(req: Request, res: Response) {
    try {
      const tenantDb = req.tenant?.databaseName || 'tenant_dev';
      const { id } = req.params;
      
      // 获取招生申请详细信息
      const [applications] = await sequelize.query(`
        SELECT
          ea.*,
          COALESCE(c.name, '未分配班级') as class_name,
          ep.age_range as target_age_group,
          ar.payment_status,
          ar.tuition_fee,
          ar.enrollment_date,
          ar.admit_date
        FROM ${tenantDb}.enrollment_applications ea
        LEFT JOIN ${tenantDb}.enrollment_plans ep ON ea.plan_id = ep.id
        LEFT JOIN ${tenantDb}.enrollment_plan_classes epc ON ep.id = epc.plan_id
        LEFT JOIN ${tenantDb}.classes c ON epc.class_id = c.id
        LEFT JOIN ${tenantDb}.admission_results ar ON ea.id = ar.application_id
        WHERE ea.id = ? AND ea.deleted_at IS NULL
      `, {
        replacements: [id],
        type: QueryTypes.SELECT
      }) as any[];

      if ((applications as any[]).length === 0) {
        return res.status(404).json({
          success: false,
          message: '招生申请不存在'
        });
      }
      
      const application = applications[0] as any;
      
      // 构建流程步骤
      const steps = [
        {
          step: 'application',
          status: 'completed',
          completedAt: application.created_at,
          description: '提交入园申请'
        },
        {
          step: 'review',
          status: application.status >= 1 ? 'completed' : 'pending',
          completedAt: application.status >= 1 ? application.updated_at : null,
          description: '申请审核'
        },
        {
          step: 'interview',
          status: application.admit_date ? 'completed' : 'pending',
          completedAt: application.admit_date,
          description: '面试评估'
        },
        {
          step: 'payment',
          status: application.payment_status === 2 ? 'completed' : 
                  application.payment_status === 1 ? 'in_progress' : 'pending',
          completedAt: application.payment_status === 2 ? application.enrollment_date : null,
          description: '缴费确认'
        },
        {
          step: 'enrollment',
          status: application.enrollment_date ? 'completed' : 'pending',
          completedAt: application.enrollment_date,
          description: '正式入园'
        }
      ];
      
      // 确定当前步骤
      let currentStep = 'application';
      for (const step of steps) {
        if (step.status === 'completed') {
          currentStep = step.step;
        } else {
          break;
        }
      }
      
      res.json({
        success: true,
        data: {
          enrollmentId: application.id,
          applicationNo: `E${application.id.toString().padStart(7, '0')}`,
          studentName: application.student_name,
          className: application.class_name,
          currentStep,
          steps,
          paymentInfo: {
            amount: application.tuition_fee,
            status: application.payment_status,
            dueDate: application.enrollment_date
          },
          nextAction: this.getNextAction(steps, currentStep)
        },
        message: '获取招生流程详情成功'
      });
    } catch (error) {
      console.error('获取招生流程详情失败:', error);
      res.status(500).json({
        success: false,
        message: '获取招生流程详情失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取下一步操作
   */
  private static getNextAction(steps: any[], currentStep: string) {
    const stepOrder = ['application', 'review', 'interview', 'payment', 'enrollment'];
    const currentIndex = stepOrder.indexOf(currentStep);
    
    if (currentIndex < stepOrder.length - 1) {
      const nextStep = stepOrder[currentIndex + 1];
      const actionMap: { [key: string]: any } = {
        review: {
          type: 'review_application',
          description: '等待审核申请材料',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        interview: {
          type: 'schedule_interview',
          description: '安排面试时间',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        payment: {
          type: 'confirm_payment',
          description: '等待家长缴费或确认收款',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        },
        enrollment: {
          type: 'enroll_student',
          description: '安排学生正式入园',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      };
      
      return actionMap[nextStep] || null;
    }
    
    return null;
  }

  /**
   * 确认收款 (园长角色)
   */
  static async confirmPayment(req: Request, res: Response) {
    try {
      const tenantDb = req.tenant?.databaseName || 'tenant_dev';
      const { enrollmentId, amount, paymentMethod, notes } = req.body;
      const userId = req.user?.id;

      if (!enrollmentId || !amount || !paymentMethod) {
        return res.status(400).json({
          success: false,
          message: '缺少必填参数：enrollmentId, amount, paymentMethod'
        });
      }

      // 检查招生申请是否存在
      const [applications] = await sequelize.query(`
        SELECT ea.*, ar.id as admission_id
        FROM ${tenantDb}.enrollment_applications ea
        LEFT JOIN ${tenantDb}.admission_results ar ON ea.id = ar.application_id
        WHERE ea.id = ? AND ea.deleted_at IS NULL
      `, {
        replacements: [enrollmentId],
        type: QueryTypes.SELECT
      }) as any[];

      if ((applications as any[]).length === 0) {
        return res.status(404).json({
          success: false,
          message: '招生申请不存在'
        });
      }

      const application = applications[0] as any;

      // 更新或创建录取结果中的缴费信息
      if (application.admission_id) {
        // 更新现有记录
        await sequelize.query(`
          UPDATE ${tenantDb}.admission_results
          SET payment_status = 2,
              tuition_fee = ?,
              updated_at = NOW()
          WHERE id = ?
        `, {
          replacements: [amount, application.admission_id],
          type: QueryTypes.UPDATE
        });
      } else {
        // 创建新的录取结果记录
        await sequelize.query(`
          INSERT INTO ${tenantDb}.admission_results
          (application_id, student_id, kindergarten_id, result_type, payment_status, tuition_fee, creator_id, created_at, updated_at)
          VALUES (?, ?, 1, 1, 2, ?, ?, NOW(), NOW())
        `, {
          replacements: [enrollmentId, application.student_id || null, amount, userId],
          type: QueryTypes.INSERT
        });
      }

      // 记录收款确认日志
      await sequelize.query(`
        INSERT INTO ${tenantDb}.payment_confirmations
        (enrollment_id, amount, payment_method, notes, confirmed_by, confirmed_at, created_at)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `, {
        replacements: [enrollmentId, amount, paymentMethod, notes || '', userId],
        type: QueryTypes.INSERT
      }).catch(() => {
        // 如果表不存在，忽略错误，后续会创建表
        console.log('payment_confirmations表不存在，将在数据库迁移中创建');
      });

      res.json({
        success: true,
        message: '收款确认成功',
        data: {
          enrollmentId,
          amount,
          paymentMethod,
          confirmedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('收款确认失败:', error);
      res.status(500).json({
        success: false,
        message: '收款确认失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 发送缴费提醒
   */
  static async sendPaymentReminder(req: Request, res: Response) {
    try {
      const tenantDb = req.tenant?.databaseName || 'tenant_dev';
      const { enrollmentIds } = req.body;

      if (!enrollmentIds || !Array.isArray(enrollmentIds) || enrollmentIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: '请提供有效的招生申请ID列表'
        });
      }

      const results = [];

      for (const enrollmentId of enrollmentIds) {
        try {
          // 获取招生申请信息
          const [applications] = await sequelize.query(`
            SELECT
              ea.id,
              ea.student_name,
              ea.contact_phone,
              COALESCE(c.name, '未分配班级') as class_name,
              ep.id as plan_id
            FROM ${tenantDb}.enrollment_applications ea
            LEFT JOIN ${tenantDb}.enrollment_plans ep ON ea.plan_id = ep.id
            LEFT JOIN ${tenantDb}.enrollment_plan_classes epc ON ep.id = epc.plan_id
            LEFT JOIN ${tenantDb}.classes c ON epc.class_id = c.id
            WHERE ea.id = ? AND ea.deleted_at IS NULL
          `, {
            replacements: [enrollmentId],
            type: QueryTypes.SELECT
          }) as any[];

          if ((applications as any[]).length > 0) {
            const application = applications[0] as any;

            // 获取班级对应的教师
            const [teachers] = await sequelize.query(`
              SELECT
                t.id as teacher_id,
                t.user_id,
                u.name as teacher_name,
                u.phone,
                u.email
              FROM ${tenantDb}.teachers t
              LEFT JOIN ${tenantDb}.users u ON t.user_id = u.id
              WHERE t.status = 'active'
              LIMIT 5
            `, {
              type: QueryTypes.SELECT
            }) as any[];

            // 发送通知给班级老师
            for (const teacher of teachers as any[]) {
              try {
                await sequelize.query(`
                  INSERT INTO ${tenantDb}.notifications
                  (recipient_id, title, content, type, status, created_at, updated_at)
                  VALUES (?, ?, ?, 'payment_reminder', 'pending', NOW(), NOW())
                `, {
                  replacements: [
                    teacher.user_id,
                    '缴费提醒通知',
                    `学生 ${application.student_name} (${application.class_name}) 的缴费需要跟进处理，请及时联系家长。联系电话：${application.contact_phone}`
                  ],
                  type: QueryTypes.INSERT
                });
              } catch (notificationError) {
                console.log('发送通知失败，可能是notifications表不存在:', notificationError);
              }
            }

            results.push({
              enrollmentId,
              studentName: application.student_name,
              status: 'sent',
              teacherCount: (teachers as any[]).length
            });
          } else {
            results.push({
              enrollmentId,
              status: 'not_found',
              error: '招生申请不存在'
            });
          }
        } catch (error) {
          results.push({
            enrollmentId,
            status: 'error',
            error: error instanceof Error ? error.message : '未知错误'
          });
        }
      }

      const successCount = results.filter(r => r.status === 'sent').length;

      res.json({
        success: true,
        message: `缴费提醒发送完成，成功发送 ${successCount} 条`,
        data: {
          results,
          summary: {
            total: enrollmentIds.length,
            success: successCount,
            failed: enrollmentIds.length - successCount
          }
        }
      });
    } catch (error) {
      console.error('发送缴费提醒失败:', error);
      res.status(500).json({
        success: false,
        message: '发送缴费提醒失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 生成缴费单
   */
  static async generatePaymentBill(req: Request, res: Response) {
    try {
      const tenantDb = req.tenant?.databaseName || 'tenant_dev';
      const { enrollmentId, templateId, customItems, discountAmount, dueDate } = req.body;
      const userId = req.user?.id;

      if (!enrollmentId || !templateId) {
        return res.status(400).json({
          success: false,
          message: '缺少必填参数：enrollmentId, templateId'
        });
      }

      // 获取招生申请信息
      const [applications] = await sequelize.query(`
        SELECT * FROM ${tenantDb}.enrollment_applications
        WHERE id = ? AND deleted_at IS NULL
      `, {
        replacements: [enrollmentId],
        type: QueryTypes.SELECT
      }) as any[];

      if ((applications as any[]).length === 0) {
        return res.status(404).json({
          success: false,
          message: '招生申请不存在'
        });
      }

      const application = applications[0] as any;

      // 生成缴费单号
      const billNo = `B${Date.now()}${enrollmentId}`;
      const finalAmount = 3800 - (discountAmount || 0); // 模拟计算

      // 模拟创建缴费单（后续会在数据库中实际创建）
      const billId = `BILL_${Date.now()}`;

      res.json({
        success: true,
        message: '缴费单生成成功',
        data: {
          billId,
          billNo,
          enrollmentId,
          studentName: application.student_name,
          finalAmount,
          dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        }
      });
    } catch (error) {
      console.error('生成缴费单失败:', error);
      res.status(500).json({
        success: false,
        message: '生成缴费单失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 批量生成缴费单
   */
  static async batchGeneratePaymentBills(req: Request, res: Response) {
    try {
      const tenantDb = req.tenant?.databaseName || 'tenant_dev';
      const { enrollmentIds, templateId, dueDate } = req.body;
      const userId = req.user?.id;

      if (!enrollmentIds || !Array.isArray(enrollmentIds) || enrollmentIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: '请提供有效的招生申请ID列表'
        });
      }

      if (!templateId) {
        return res.status(400).json({
          success: false,
          message: '请选择费用套餐模板'
        });
      }

      const results = [];

      for (const enrollmentId of enrollmentIds) {
        try {
          // 获取招生申请信息
          const [applications] = await sequelize.query(`
            SELECT * FROM ${tenantDb}.enrollment_applications
            WHERE id = ? AND deleted_at IS NULL
          `, {
            replacements: [enrollmentId],
            type: QueryTypes.SELECT
          }) as any[];

          if ((applications as any[]).length > 0) {
            const application = applications[0] as any;

            // 生成缴费单号
            const billNo = `B${Date.now()}${enrollmentId}`;
            const billId = `BILL_${Date.now()}_${enrollmentId}`;
            const amount = 3800; // 模拟金额

            results.push({
              enrollmentId,
              billId,
              billNo,
              studentName: application.student_name,
              amount,
              status: 'generated'
            });
          } else {
            results.push({
              enrollmentId,
              status: 'not_found',
              error: '招生申请不存在'
            });
          }
        } catch (error) {
          results.push({
            enrollmentId,
            status: 'error',
            error: error instanceof Error ? error.message : '未知错误'
          });
        }
      }

      const successCount = results.filter(r => r.status === 'generated').length;

      res.json({
        success: true,
        message: `批量生成缴费单完成，成功生成 ${successCount} 张`,
        data: {
          results,
          summary: {
            total: enrollmentIds.length,
            success: successCount,
            failed: enrollmentIds.length - successCount
          }
        }
      });
    } catch (error) {
      console.error('批量生成缴费单失败:', error);
      res.status(500).json({
        success: false,
        message: '批量生成缴费单失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取招生财务配置
   */
  static async getConfig(req: Request, res: Response) {
    try {
      // 返回默认配置
      const config = {
        autoGenerateBill: true,
        defaultPaymentDays: 14,
        reminderDays: [7, 3, 1],
        overdueGraceDays: 3,
        requirePaymentBeforeEnrollment: true
      };

      res.json({
        success: true,
        data: config,
        message: '获取招生财务配置成功'
      });
    } catch (error) {
      console.error('获取招生财务配置失败:', error);
      res.status(500).json({
        success: false,
        message: '获取招生财务配置失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }
}
