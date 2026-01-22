import { Request, Response } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import { GrowthRecord, GrowthRecordType, MeasurementType, calculateBMI, calculatePercentile, getDevelopmentAdvice } from '../models/growth-record.model';
import { Student } from '../models/student.model';
import { Op } from 'sequelize';
import { sequelize } from '../init';

/**
 * 成长记录控制器
 * 专门处理身高、体重、体能等成长数据的CRUD
 */

/**
 * 获取学生的成长记录列表
 */
export const getGrowthRecords = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, type, startDate, endDate, limit, offset } = req.query;

    const where: any = {};
    if (studentId) {
      where.studentId = parseInt(studentId as string);
    }
    if (type) {
      where.type = type;
    }
    if (startDate || endDate) {
      where.measurementDate = {};
      if (startDate) where.measurementDate[Op.gte] = startDate;
      if (endDate) where.measurementDate[Op.lte] = endDate;
    }

    // 先获取成长记录（不使用include避免关联加载顺序问题）
    const records = await GrowthRecord.findAll({
      where,
      order: [['measurementDate', 'DESC']],
      limit: parseInt(limit as string) || 50,
      offset: parseInt(offset as string) || 0
    });

    // 获取相关学生信息
    const studentIds = [...new Set(records.map(r => r.studentId))];
    const students = studentIds.length > 0 ? await Student.findAll({
      where: { id: studentIds },
      attributes: ['id', 'name', 'gender', 'birthDate']
    }) : [];
    const studentMap = new Map(students.map(s => [s.id, s]));

    // 组合结果
    const result = records.map(r => {
      const record = r.toJSON();
      record.student = studentMap.get(r.studentId) || null;
      return record;
    });

    ApiResponse.success(res, result, '获取成长记录成功');
  } catch (error: any) {
    ApiResponse.handleError(res, error);
  }
};

/**
 * 获取单个成长记录详情
 */
export const getGrowthRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const record = await GrowthRecord.findByPk(id);

    if (!record) {
      throw new ApiError(404, '成长记录不存在');
    }

    // 获取关联的学生信息（避免使用include）
    const student = await Student.findByPk(record.studentId, {
      attributes: ['id', 'name', 'gender', 'birthDate']
    });

    const result = {
      ...record.toJSON(),
      student: student || null
    };

    ApiResponse.success(res, result, '获取成长记录成功');
  } catch (error: any) {
    ApiResponse.handleError(res, error);
  }
};

/**
 * 创建成长记录
 */
export const createGrowthRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const {
      studentId,
      type = GrowthRecordType.HEIGHT_WEIGHT,
      height,
      weight,
      headCircumference,
      running50m,
      standingJump,
      ballThrow,
      sitAndReach,
      cognitiveScore,
      socialScore,
      languageScore,
      motorScore,
      measurementDate,
      measurementType = MeasurementType.MANUAL,
      remark
    } = req.body;

    // 验证学生存在
    const student = await Student.findByPk(studentId);
    if (!student) {
      throw new ApiError(404, '学生不存在');
    }

    // 计算月龄
    const measureDate = new Date(measurementDate);
    const birthDate = new Date(student.birthDate);
    const ageInMonths = Math.floor((measureDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30));

    // 计算百分位和BMI
    let heightPercentile: number | null = null;
    let weightPercentile: number | null = null;
    let bmi: number | null = null;

    if (height && weight && ageInMonths > 0) {
      heightPercentile = calculatePercentile(height, ageInMonths, student.gender, 'height');
      weightPercentile = calculatePercentile(weight, ageInMonths, student.gender, 'weight');
      bmi = calculateBMI(height, weight);
    }

    const record = await GrowthRecord.create({
      studentId,
      type,
      height,
      weight,
      headCircumference,
      running50m,
      standingJump,
      ballThrow,
      sitAndReach,
      cognitiveScore,
      socialScore,
      languageScore,
      motorScore,
      measurementDate,
      measurementType,
      ageInMonths,
      observerId: userId,
      remark,
      heightPercentile,
      weightPercentile,
      bmi
    });

    ApiResponse.success(res, record, '创建成长记录成功', 201);
  } catch (error: any) {
    ApiResponse.handleError(res, error);
  }
};

/**
 * 更新成长记录
 */
export const updateGrowthRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const record = await GrowthRecord.findByPk(id);
    if (!record) {
      throw new ApiError(404, '成长记录不存在');
    }

    await record.update(updateData);

    ApiResponse.success(res, record, '更新成长记录成功');
  } catch (error: any) {
    ApiResponse.handleError(res, error);
  }
};

/**
 * 删除成长记录
 */
export const deleteGrowthRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const record = await GrowthRecord.findByPk(id);
    if (!record) {
      throw new ApiError(404, '成长记录不存在');
    }

    await record.destroy();

    ApiResponse.success(res, null, '删除成长记录成功');
  } catch (error: any) {
    ApiResponse.handleError(res, error);
  }
};

/**
 * 获取成长曲线数据（用于图表展示）
 */
export const getGrowthChart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, type = GrowthRecordType.HEIGHT_WEIGHT } = req.query;
    const recordType = String(type) as GrowthRecordType;

    if (!studentId) {
      throw new ApiError(400, '学生ID不能为空');
    }

    // 获取该类型的所有记录，按日期排序
    const records = await GrowthRecord.findAll({
      where: {
        studentId: parseInt(studentId as string),
        type: recordType
      },
      order: [['measurementDate', 'ASC']],
      attributes: ['id', 'measurementDate', 'height', 'weight', 'ageInMonths', 'heightPercentile', 'weightPercentile', 'bmi']
    });

    // 获取学生信息用于计算百分位
    const student = await Student.findByPk(studentId as string);
    if (!student) {
      throw new ApiError(404, '学生不存在');
    }

    // 补充百分位数据（如果记录中没有）
    const chartData = records.map(r => {
      const record = r.toJSON();
      // 重新计算百分位（如果有新的身高体重数据）
      if (record.height && record.weight && record.ageInMonths) {
        if (!record.heightPercentile) {
          record.heightPercentile = calculatePercentile(record.height, record.ageInMonths, student.gender, 'height');
        }
        if (!record.weightPercentile) {
          record.weightPercentile = calculatePercentile(record.weight, record.ageInMonths, student.gender, 'weight');
        }
      }
      return record;
    });

    ApiResponse.success(res, {
      records: chartData,
      student: {
        id: student.id,
        name: student.name,
        gender: student.gender,
        birthDate: student.birthDate
      }
    }, '获取成长曲线成功');
  } catch (error: any) {
    ApiResponse.handleError(res, error);
  }
};

/**
 * 获取成长评估报告
 */
export const getGrowthReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const { months = 6 } = req.query; // 默认获取6个月的数据

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months as string));

    // 获取最近的身高体重记录
    const latestRecord = await GrowthRecord.findOne({
      where: {
        studentId: parseInt(studentId),
        type: GrowthRecordType.HEIGHT_WEIGHT
      },
      order: [['measurementDate', 'DESC']]
    });

    // 获取指定时间段内的所有记录
    const records = await GrowthRecord.findAll({
      where: {
        studentId: parseInt(studentId),
        measurementDate: { [Op.gte]: startDate }
      },
      order: [['measurementDate', 'ASC']]
    });

    // 获取学生信息
    const student = await Student.findByPk(studentId);
    if (!student) {
      throw new ApiError(404, '学生不存在');
    }

    // 计算发展趋势
    const trends: any = {
      height: { values: [], dates: [], change: 0 },
      weight: { values: [], dates: [], change: 0 }
    };

    if (records.length >= 2) {
      const heightRecords = records.filter(r => r.height);
      const weightRecords = records.filter(r => r.weight);

      if (heightRecords.length >= 2) {
        const first = heightRecords[0].height!;
        const last = heightRecords[heightRecords.length - 1].height!;
        trends.height.values = heightRecords.map(r => r.height);
        trends.height.dates = heightRecords.map(r => r.measurementDate.toISOString().split('T')[0]);
        trends.height.change = Number((last - first).toFixed(1));
      }

      if (weightRecords.length >= 2) {
        const first = weightRecords[0].weight!;
        const last = weightRecords[weightRecords.length - 1].weight!;
        trends.weight.values = weightRecords.map(r => r.weight);
        trends.weight.dates = weightRecords.map(r => r.measurementDate.toISOString().split('T')[0]);
        trends.weight.change = Number((last - first).toFixed(2));
      }
    }

    // 生成评估建议
    const advice: any = {};
    if (latestRecord) {
      if (latestRecord.heightPercentile) {
        const { level, advice: heightAdvice } = getDevelopmentAdvice(
          (latestRecord.heightPercentile - 3) / 94 * 100 + 5 // 转换为100分制
        );
        advice.height = { percentile: latestRecord.heightPercentile, level, advice: heightAdvice };
      }
      if (latestRecord.weightPercentile) {
        const { level, advice: weightAdvice } = getDevelopmentAdvice(
          (latestRecord.weightPercentile - 3) / 94 * 100 + 5
        );
        advice.weight = { percentile: latestRecord.weightPercentile, level, advice: weightAdvice };
      }
      if (latestRecord.bmi) {
        // BMI评估（简化版）
        if (latestRecord.bmi < 14) {
          advice.bmi = { value: latestRecord.bmi, level: '偏瘦', advice: '建议适当增加营养摄入' };
        } else if (latestRecord.bmi > 18) {
          advice.bmi = { value: latestRecord.bmi, level: '偏胖', advice: '建议增加体育锻炼，控制饮食' };
        } else {
          advice.bmi = { value: latestRecord.bmi, level: '正常', advice: '体型发育良好，继续保持' };
        }
      }
    }

    ApiResponse.success(res, {
      student: {
        id: student.id,
        name: student.name,
        gender: student.gender,
        birthDate: student.birthDate,
        ageInMonths: latestRecord?.ageInMonths
      },
      latestRecord: latestRecord ? {
        date: latestRecord.measurementDate,
        height: latestRecord.height,
        weight: latestRecord.weight,
        bmi: latestRecord.bmi,
        heightPercentile: latestRecord.heightPercentile,
        weightPercentile: latestRecord.weightPercentile
      } : null,
      trends,
      advice,
      recordsCount: records.length
    }, '获取成长评估报告成功');
  } catch (error: any) {
    ApiResponse.handleError(res, error);
  }
};

/**
 * 同龄对比数据
 */
export const getPeerComparison = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;

    const student = await Student.findByPk(studentId);
    if (!student) {
      throw new ApiError(404, '学生不存在');
    }

    // 获取最新的身高体重记录
    const latestRecord = await GrowthRecord.findOne({
      where: {
        studentId: parseInt(studentId),
        type: GrowthRecordType.HEIGHT_WEIGHT
      },
      order: [['measurementDate', 'DESC']]
    });

    if (!latestRecord || !latestRecord.height || !latestRecord.weight) {
      throw new ApiError(400, '没有找到身高体重数据');
    }

    // 计算百分位
    const heightPercentile = latestRecord.heightPercentile ||
      calculatePercentile(latestRecord.height, latestRecord.ageInMonths, student.gender, 'height');
    const weightPercentile = latestRecord.weightPercentile ||
      calculatePercentile(latestRecord.weight, latestRecord.ageInMonths, student.gender, 'weight');

    // 生成对比结果
    const comparison = {
      height: {
        value: latestRecord.height,
        percentile: Math.round(heightPercentile * 10) / 10,
        level: heightPercentile >= 50 ? '中等偏上' : heightPercentile >= 25 ? '中等' : '中等偏下',
        percent: heightPercentile,
        description: `身高超过了 ${Math.round(heightPercentile)}% 的同龄儿童`
      },
      weight: {
        value: latestRecord.weight,
        percentile: Math.round(weightPercentile * 10) / 10,
        level: weightPercentile >= 50 ? '中等偏上' : weightPercentile >= 25 ? '中等' : '中等偏下',
        percent: weightPercentile,
        description: `体重超过了 ${Math.round(weightPercentile)}% 的同龄儿童`
      },
      bmi: {
        value: latestRecord.bmi,
        description: latestRecord.bmi
          ? `BMI指数为 ${latestRecord.bmi}，${latestRecord.bmi >= 15 && latestRecord.bmi <= 17 ? '处于正常范围' : '建议关注'}`
          : '暂无BMI数据'
      }
    };

    ApiResponse.success(res, {
      student: {
        id: student.id,
        name: student.name,
        ageInMonths: latestRecord.ageInMonths,
        gender: student.gender === 1 ? '男' : '女'
      },
      measurementDate: latestRecord.measurementDate,
      comparison
    }, '获取同龄对比成功');
  } catch (error: any) {
    ApiResponse.handleError(res, error);
  }
};

/**
 * 批量导入成长记录（简化版）
 */
export const bulkCreateGrowthRecords = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { studentId, records } = req.body;

    if (!studentId || !Array.isArray(records) || records.length === 0) {
      throw new ApiError(400, '参数不完整');
    }

    const student = await Student.findByPk(studentId);
    if (!student) {
      throw new ApiError(404, '学生不存在');
    }

    const results: any[] = [];
    const errors: any[] = [];

    for (const [index, recordData] of records.entries()) {
      try {
        const measureDate = new Date(recordData.measurementDate);
        const ageInMonths = Math.floor((measureDate.getTime() - new Date(student.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 30));

        let heightPercentile: number | null = null;
        let weightPercentile: number | null = null;
        let bmi: number | null = null;

        if (recordData.height && recordData.weight && ageInMonths > 0) {
          heightPercentile = calculatePercentile(recordData.height, ageInMonths, student.gender, 'height');
          weightPercentile = calculatePercentile(recordData.weight, ageInMonths, student.gender, 'weight');
          bmi = calculateBMI(recordData.height, recordData.weight);
        }

        const record = await GrowthRecord.create({
          studentId,
          type: recordData.type || GrowthRecordType.HEIGHT_WEIGHT,
          height: recordData.height,
          weight: recordData.weight,
          headCircumference: recordData.headCircumference,
          measurementDate: recordData.measurementDate,
          measurementType: recordData.measurementType || MeasurementType.MANUAL,
          ageInMonths,
          observerId: userId,
          remark: recordData.remark,
          heightPercentile,
          weightPercentile,
          bmi
        });

        results.push({ index, success: true, id: record.id });
      } catch (err: any) {
        errors.push({ index, success: false, error: err.message });
      }
    }

    ApiResponse.success(res, {
      total: records.length,
      success: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined
    }, `批量创建完成，成功${results.length}条，失败${errors.length}条`);
  } catch (error: any) {
    ApiResponse.handleError(res, error);
  }
};
