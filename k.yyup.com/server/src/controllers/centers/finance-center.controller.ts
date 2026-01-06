/**
 * 财务中心控制器
 */

import { Request, Response } from 'express';
import { Op, QueryTypes } from 'sequelize';
import { FeeItem, FeePackageTemplate, PaymentBill, PaymentRecord } from '../../models/finance.model';
import db from '../../database';

export class FinanceCenterController {

  /**
   * 获取财务概览数据
   */
  static async getOverview(req: Request, res: Response) {
    try {
      const currentDate = new Date();
      const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);

      // 获取本月收入统计
      const currentMonthPayments = await PaymentRecord.findAll({
        where: {
          paymentDate: {
            [Op.gte]: currentMonth,
            [Op.lt]: nextMonth
          },
          status: 'success'
        }
      });

      // 获取上月收入统计
      const lastMonthPayments = await PaymentRecord.findAll({
        where: {
          paymentDate: {
            [Op.gte]: lastMonth,
            [Op.lt]: currentMonth
          },
          status: 'success'
        }
      });

      // 计算本月收入
      const monthlyRevenue = currentMonthPayments.reduce((sum, payment) =>
        sum + parseFloat(payment.paymentAmount.toString()), 0
      );

      // 计算上月收入
      const lastMonthRevenue = lastMonthPayments.reduce((sum, payment) =>
        sum + parseFloat(payment.paymentAmount.toString()), 0
      );

      // 计算收入增长率
      const revenueGrowth = lastMonthRevenue > 0
        ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue * 100)
        : 0;

      // 获取待缴费统计
      const pendingBills = await PaymentBill.findAll({
        where: {
          status: ['pending', 'partial']
        }
      });

      const pendingAmount = pendingBills.reduce((sum, bill) =>
        sum + parseFloat(bill.remainingAmount.toString()), 0
      );
      const pendingCount = pendingBills.length;

      // 获取总缴费单统计
      const totalBills = await PaymentBill.count();
      const paidBills = await PaymentBill.count({
        where: { status: 'paid' }
      });

      const collectionRate = totalBills > 0 ? (paidBills / totalBills * 100) : 0;

      // 获取逾期统计
      const overdueBills = await PaymentBill.findAll({
        where: {
          status: 'overdue'
        }
      });

      const overdueAmount = overdueBills.reduce((sum, bill) =>
        sum + parseFloat(bill.remainingAmount.toString()), 0
      );
      const overdueCount = overdueBills.length;

      // 辅助函数：限制百分比在0-100范围内
      const clampPercentage = (value: number): number => {
        return Math.min(100, Math.max(0, value));
      };

      const overview = {
        monthlyRevenue: Math.max(0, Math.round(monthlyRevenue)),
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,  // 增长率可以为负数，不限制
        pendingAmount: Math.max(0, Math.round(pendingAmount)),
        pendingCount: Math.max(0, pendingCount),
        collectionRate: Math.round(clampPercentage(collectionRate) * 10) / 10,
        paidCount: Math.max(0, paidBills),
        totalCount: Math.max(0, totalBills),
        overdueAmount: Math.max(0, Math.round(overdueAmount)),
        overdueCount: Math.max(0, overdueCount)
      };

      res.json({
        success: true,
        data: overview,
        message: '获取财务概览成功'
      });
    } catch (error) {
      console.error('获取财务概览失败:', error);
      res.status(500).json({
        success: false,
        message: '获取财务概览失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }
  /**
   * 获取收费项目列表
   */
  static async getFeeItems(req: Request, res: Response) {
    try {
      const { category, status } = req.query;

      // 构建查询条件
      const whereCondition: any = {};
      if (category) {
        whereCondition.category = category;
      }
      if (status) {
        whereCondition.status = status;
      } else {
        whereCondition.status = 'active'; // 默认只返回活跃的收费项目
      }

      // 从数据库查询收费项目
      const feeItems = await FeeItem.findAll({
        where: whereCondition,
        order: [['category', 'ASC'], ['name', 'ASC']]
      });

      // 转换数据格式
      const formattedItems = feeItems.map(item => ({
        id: item.id.toString(),
        name: item.name,
        category: item.category,
        amount: parseFloat(item.amount.toString()),
        period: item.period,
        isRequired: item.isRequired,
        description: item.description,
        status: item.status
      }));

      res.json({
        success: true,
        data: formattedItems,
        message: '获取收费项目成功'
      });
    } catch (error) {
      console.error('获取收费项目失败:', error);
      res.status(500).json({
        success: false,
        message: '获取收费项目失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取费用套餐模板列表
   */
  static async getFeePackageTemplates(req: Request, res: Response) {
    try {
      const { targetGrade, status } = req.query;

      // 构建查询条件
      const whereCondition: any = {};
      if (targetGrade) {
        whereCondition.targetGrade = targetGrade;
      }
      if (status) {
        whereCondition.status = status;
      } else {
        whereCondition.status = 'active'; // 默认只返回活跃的套餐
      }

      // 从数据库查询费用套餐模板
      const templates = await FeePackageTemplate.findAll({
        where: whereCondition,
        order: [['targetGrade', 'ASC'], ['name', 'ASC']]
      });

      // 转换数据格式
      const formattedTemplates = templates.map(template => ({
        id: template.id.toString(),
        name: template.name,
        description: template.description,
        items: template.items,
        totalAmount: parseFloat(template.totalAmount.toString()),
        discountRate: template.discountRate ? parseFloat(template.discountRate.toString()) : 0,
        finalAmount: parseFloat(template.finalAmount.toString()),
        validPeriod: template.validPeriod,
        targetGrade: template.targetGrade,
        status: template.status
      }));

      res.json({
        success: true,
        data: formattedTemplates,
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
   * 获取缴费记录列表
   */
  static async getPaymentRecords(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, status, studentName, startDate, endDate } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      // 构建查询条件
      const whereCondition: any = {};
      if (status) {
        whereCondition.status = status;
      }
      if (startDate && endDate) {
        whereCondition.paymentDate = {
          [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
        };
      }

      // 构建缴费单查询条件
      const billWhereCondition: any = {};
      if (studentName) {
        billWhereCondition.studentName = {
          [Op.like]: `%${studentName}%`
        };
      }

      // 从数据库查询缴费记录，关联缴费单信息
      const { rows: paymentRecords, count: total } = await PaymentRecord.findAndCountAll({
        where: whereCondition,
        include: [{
          model: PaymentBill,
          as: 'bill',
          where: billWhereCondition,
          required: true
        }],
        order: [['paymentDate', 'DESC']],
        limit: Number(limit),
        offset
      });

      // 转换数据格式
      const formattedRecords = paymentRecords.map(record => {
        const bill = (record as any).bill;
        return {
          id: record.id.toString(),
          billId: record.billId.toString(),
          billNo: bill?.billNo || '',
          studentName: bill?.studentName || '',
          className: bill?.className || '',
          feeItems: bill?.items ? bill.items.map((item: any) => item.feeName) : [],
          paymentAmount: parseFloat(record.paymentAmount.toString()),
          paymentDate: record.paymentDate.toISOString().split('T')[0],
          paymentMethod: record.paymentMethod,
          transactionNo: record.transactionNo,
          receiptNo: record.receiptNo,
          payerName: record.payerName,
          payerPhone: record.payerPhone,
          status: record.status,
          remarks: record.remarks
        };
      });

      res.json({
        success: true,
        data: {
          records: formattedRecords,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
          }
        },
        message: '获取缴费记录成功'
      });
    } catch (error) {
      console.error('获取缴费记录失败:', error);
      res.status(500).json({
        success: false,
        message: '获取缴费记录失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取财务报表数据
   */
  static async getFinancialReports(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      // 设置默认时间范围（当前月）
      const currentDate = new Date();
      const defaultStartDate = startDate ? new Date(startDate as string) : new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const defaultEndDate = endDate ? new Date(endDate as string) : new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      // 上个月的时间范围
      const prevStartDate = new Date(defaultStartDate.getFullYear(), defaultStartDate.getMonth() - 1, 1);
      const prevEndDate = new Date(defaultStartDate.getFullYear(), defaultStartDate.getMonth(), 0);

      // 获取当前时间段的收入
      const currentPayments = await PaymentRecord.findAll({
        where: {
          paymentDate: {
            [Op.between]: [defaultStartDate, defaultEndDate]
          },
          status: 'success'
        }
      });

      // 获取上个时间段的收入
      const previousPayments = await PaymentRecord.findAll({
        where: {
          paymentDate: {
            [Op.between]: [prevStartDate, prevEndDate]
          },
          status: 'success'
        }
      });

      // 计算收入统计
      const currentIncome = currentPayments.reduce((sum, payment) =>
        sum + parseFloat(payment.paymentAmount.toString()), 0
      );
      const previousIncome = previousPayments.reduce((sum, payment) =>
        sum + parseFloat(payment.paymentAmount.toString()), 0
      );
      const growth = previousIncome > 0 ? ((currentIncome - previousIncome) / previousIncome * 100) : 0;

      // 获取收费完成率统计
      const totalBills = await PaymentBill.count({
        where: {
          createdAt: {
            [Op.between]: [defaultStartDate, defaultEndDate]
          }
        }
      });
      const paidBills = await PaymentBill.count({
        where: {
          status: 'paid',
          createdAt: {
            [Op.between]: [defaultStartDate, defaultEndDate]
          }
        }
      });

      const collectionRate = totalBills > 0 ? (paidBills / totalBills * 100) : 0;
      const pendingRate = 100 - collectionRate;

      // 获取费用类别分析
      const feeItems = await FeeItem.findAll({
        where: { status: 'active' }
      });

      // 计算各类别收入
      const categoryStats = await Promise.all(
        feeItems.map(async (feeItem) => {
          const categoryPayments = await db.sequelize.query(`
            SELECT SUM(pr.payment_amount) as total_amount
            FROM payment_records pr
            JOIN payment_bills pb ON pr.bill_id = pb.id
            WHERE pr.payment_date BETWEEN :startDate AND :endDate
            AND pr.status = 'success'
            AND JSON_SEARCH(pb.items, 'one', :feeName) IS NOT NULL
          `, {
            replacements: {
              startDate: defaultStartDate,
              endDate: defaultEndDate,
              feeName: feeItem.name
            },
            type: QueryTypes.SELECT
          });

          const amount = (categoryPayments[0] as any)?.total_amount || 0;
          return {
            category: feeItem.name,
            amount: parseFloat(amount.toString()),
            percentage: currentIncome > 0 ? (parseFloat(amount.toString()) / currentIncome * 100) : 0
          };
        })
      );

      // 按金额排序并过滤掉金额为0的类别
      const filteredCategoryStats = categoryStats
        .filter(stat => stat.amount > 0)
        .sort((a, b) => b.amount - a.amount);

      const reports = {
        monthlyIncome: {
          current: Math.round(currentIncome),
          previous: Math.round(previousIncome),
          growth: Math.round(growth * 10) / 10
        },
        feeCollection: {
          collected: Math.round(collectionRate * 10) / 10,
          pending: Math.round(pendingRate * 10) / 10
        },
        categoryBreakdown: filteredCategoryStats.map(stat => ({
          category: stat.category,
          amount: Math.round(stat.amount),
          percentage: Math.round(stat.percentage * 10) / 10
        }))
      };

      res.json({
        success: true,
        data: reports,
        message: '获取财务报表成功'
      });
    } catch (error) {
      console.error('获取财务报表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取财务报表失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取招生财务联动数据
   */
  static async getEnrollmentFinanceData(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      // 设置默认时间范围（当前月）
      const currentDate = new Date();
      const defaultStartDate = startDate ? new Date(startDate as string) : new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const defaultEndDate = endDate ? new Date(endDate as string) : new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      // 获取招生相关的收费项目
      const enrollmentFeeItems = await FeeItem.findAll({
        where: {
          name: {
            [Op.in]: ['报名费', '入园费', '押金', '注册费']
          },
          status: 'active'
        }
      });

      // 计算招生费用统计
      let registrationFee = 0;
      let depositFee = 0;
      let totalCollected = 0;

      for (const feeItem of enrollmentFeeItems) {
        const payments = await db.sequelize.query(`
          SELECT SUM(pr.payment_amount) as total_amount
          FROM payment_records pr
          JOIN payment_bills pb ON pr.bill_id = pb.id
          WHERE pr.payment_date BETWEEN :startDate AND :endDate
          AND pr.status = 'success'
          AND JSON_SEARCH(pb.items, 'one', :feeName) IS NOT NULL
        `, {
          replacements: {
            startDate: defaultStartDate,
            endDate: defaultEndDate,
            feeName: feeItem.name
          },
          type: QueryTypes.SELECT
        });

        const amount = parseFloat((payments[0] as any)?.total_amount || '0');
        totalCollected += amount;

        if (feeItem.name.includes('报名') || feeItem.name.includes('注册')) {
          registrationFee += amount;
        } else if (feeItem.name.includes('押金') || feeItem.name.includes('入园')) {
          depositFee += amount;
        }
      }

      // 获取新学生缴费记录
      const newStudentPayments = await db.sequelize.query(`
        SELECT
          pb.student_name,
          pb.created_at as enrollment_date,
          SUM(pr.payment_amount) as fees_collected,
          CASE
            WHEN pb.status = 'paid' THEN 'completed'
            WHEN pb.status = 'partial' THEN 'partial'
            ELSE 'pending'
          END as status
        FROM payment_bills pb
        JOIN payment_records pr ON pr.bill_id = pb.id
        WHERE pb.created_at BETWEEN :startDate AND :endDate
        AND pr.status = 'success'
        GROUP BY pb.id, pb.student_name, pb.created_at, pb.status
        ORDER BY pb.created_at DESC
        LIMIT 10
      `, {
        replacements: {
          startDate: defaultStartDate,
          endDate: defaultEndDate
        },
        type: QueryTypes.SELECT
      });

      const formattedPayments = newStudentPayments.map((payment: any) => ({
        studentName: payment.student_name,
        enrollmentDate: new Date(payment.enrollment_date).toISOString().split('T')[0],
        feesCollected: Math.round(parseFloat(payment.fees_collected)),
        status: payment.status
      }));

      const data = {
        enrollmentFees: {
          registrationFee: Math.round(registrationFee),
          depositFee: Math.round(depositFee),
          totalCollected: Math.round(totalCollected)
        },
        newStudentPayments: formattedPayments
      };

      res.json({
        success: true,
        data: data,
        message: '获取招生财务联动数据成功'
      });
    } catch (error) {
      console.error('获取招生财务联动数据失败:', error);
      res.status(500).json({
        success: false,
        message: '获取招生财务联动数据失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 获取今日缴费数据
   */
  static async getTodayPayments(req: Request, res: Response) {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      // 获取今日缴费记录
      const todayPayments = await PaymentRecord.findAll({
        where: {
          paymentDate: {
            [Op.gte]: startOfDay,
            [Op.lt]: endOfDay
          },
          status: 'success'
        },
        order: [['paymentDate', 'DESC']],
        limit: 20
      });

      // 统计今日数据
      const todayAmount = todayPayments.reduce((sum, payment) =>
        sum + parseFloat(payment.paymentAmount.toString()), 0
      );
      const todayCount = todayPayments.length;

      const data = {
        todayAmount,
        todayCount,
        payments: todayPayments
      };

      res.json({
        success: true,
        data,
        message: '今日缴费数据获取成功'
      });
    } catch (error) {
      console.error('获取今日缴费数据失败:', error);
      res.status(500).json({
        success: false,
        message: '获取今日缴费数据失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }
}
