import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from 'sequelize';
import { sequelize } from '../init';

/**
 * 成长记录类型
 */
export enum GrowthRecordType {
  HEIGHT_WEIGHT = 'height_weight',   // 身高体重
  PHYSICAL = 'physical',             // 体能测试
  COGNITIVE = 'cognitive',           // 认知发展
  SOCIAL = 'social',                 // 社会情感
  LANGUAGE = 'language',             // 语言发展
  ART = 'art',                       // 艺术表现
  CUSTOM = 'custom',                 // 自定义
}

/**
 * 成长记录测量方式
 */
export enum MeasurementType {
  MANUAL = 'manual',     // 手动测量
  AUTOMATIC = 'automatic', // 自动采集
  REPORT = 'report',     // 家长报告
}

/**
 * 成长记录模型
 * 用于记录和管理儿童成长数据（身高、体重、发展评估等）
 */
export class GrowthRecord extends Model<
  InferAttributes<GrowthRecord>,
  InferCreationAttributes<GrowthRecord>
> {
  declare id: CreationOptional<number>;
  declare studentId: number;
  declare type: GrowthRecordType;

  // 身高体重数据
  declare height: number | null;        // 身高 (cm)
  declare weight: number | null;        // 体重 (kg)
  declare headCircumference: number | null; // 头围 (cm)

  // 体能数据
  declare running50m: number | null;    // 50米跑 (秒)
  declare standingJump: number | null;  // 立定跳远 (cm)
  declare ballThrow: number | null;     // 掷球 (m)
  declare sitAndReach: number | null;   // 坐位体前屈 (cm)

  // 发展评估分数 (0-100)
  declare cognitiveScore: number | null;   // 认知发展评分
  declare socialScore: number | null;      // 社会情感评分
  declare languageScore: number | null;    // 语言发展评分
  declare motorScore: number | null;       // 动作发展评分

  // 元数据
  declare measurementDate: Date;       // 测量日期
  declare measurementType: MeasurementType;
  declare ageInMonths: number;         // 月龄
  declare observerId: number | null;  // 记录人
  declare remark: string | null;       // 备注

  // 标准化百分位 (用于同龄对比)
  declare heightPercentile: number | null;   // 身高百分位
  declare weightPercentile: number | null;   // 体重百分位
  declare bmi: number | null;           // BMI指数

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

/**
 * 标准化成长数据（WHO儿童生长标准）
 */
export const WHO_GROWTH_STANDARDS = {
  // 男孩身高(cm) - 第3, 50, 97百分位
  boysHeight: {
    24: { p3: 82.3, p50: 87.8, p97: 93.4 },   // 2岁
    36: { p3: 91.0, p50: 96.1, p97: 101.2 },
    48: { p3: 96.7, p50: 102.1, p97: 107.5 },
    60: { p3: 101.5, p50: 107.2, p97: 112.9 }, // 5岁
    72: { p3: 105.7, p50: 111.8, p97: 118.0 },
  },
  // 女孩身高(cm) - 第3, 50, 97百分位
  girlsHeight: {
    24: { p3: 80.9, p50: 86.4, p97: 91.9 },
    36: { p3: 89.9, p50: 95.1, p97: 100.3 },
    48: { p3: 95.8, p50: 101.2, p97: 106.6 },
    60: { p3: 100.7, p50: 106.5, p97: 112.3 },
    72: { p3: 105.2, p50: 111.3, p97: 117.4 },
  },
  // 男孩体重(kg) - 第3, 50, 97百分位
  boysWeight: {
    24: { p3: 10.2, p50: 12.2, p97: 14.5 },
    36: { p3: 12.2, p50: 14.3, p97: 17.0 },
    48: { p3: 13.9, p50: 16.3, p97: 19.4 },
    60: { p3: 15.6, p50: 18.3, p97: 22.0 },
    72: { p3: 17.3, p50: 20.5, p97: 25.0 },
  },
  // 女孩体重(kg) - 第3, 50, 97百分位
  girlsWeight: {
    24: { p3: 9.5, p50: 11.5, p97: 14.0 },
    36: { p3: 11.8, p50: 14.0, p97: 17.0 },
    48: { p3: 13.6, p50: 16.2, p97: 19.8 },
    60: { p3: 15.4, p50: 18.6, p97: 23.0 },
    72: { p3: 17.3, p50: 21.1, p97: 26.5 },
  },
};

/**
 * 计算BMI
 */
export const calculateBMI = (heightCm: number, weightKg: number): number => {
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
};

/**
 * 计算百分位数（简化版，使用线性插值）
 */
export const calculatePercentile = (
  value: number,
  ageMonths: number,
  gender: number,
  dataType: 'height' | 'weight'
): number => {
  const standards = gender === 1
    ? (dataType === 'height' ? WHO_GROWTH_STANDARDS.boysHeight : WHO_GROWTH_STANDARDS.boysWeight)
    : (dataType === 'height' ? WHO_GROWTH_STANDARDS.girlsHeight : WHO_GROWTH_STANDARDS.girlsWeight);

  // 找到最接近的年龄段
  const ages = Object.keys(standards).map(Number).sort((a, b) => a - b);
  let lowerAge = ages[0];
  let upperAge = ages[ages.length - 1];

  for (let i = 0; i < ages.length - 1; i++) {
    if (ageMonths >= ages[i] && ageMonths <= ages[i + 1]) {
      lowerAge = ages[i];
      upperAge = ages[i + 1];
      break;
    }
  }

  const lowerData = standards[lowerAge as keyof typeof standards] as { p3: number; p50: number; p97: number };
  const upperData = standards[upperAge as keyof typeof standards] as { p3: number; p50: number; p97: number };

  // 线性插值获取该年龄的标准值
  const ratio = (ageMonths - lowerAge) / (upperAge - lowerAge);
  const p50 = lowerData.p50 + (upperData.p50 - lowerData.p50) * ratio;
  const p3 = lowerData.p3 + (upperData.p3 - lowerData.p3) * ratio;
  const p97 = lowerData.p97 + (upperData.p97 - lowerData.p97) * ratio;

  // 计算百分位
  if (value <= p3) return 3;
  if (value >= p97) return 97;
  if (value <= p50) {
    return Math.round(3 + ((value - p3) / (p50 - p3)) * 47);
  }
  return Math.round(50 + ((value - p50) / (p97 - p50)) * 47);
};

/**
 * 获取发育评估建议
 */
export const getDevelopmentAdvice = (score: number): { level: string; advice: string } => {
  if (score >= 90) {
    return { level: '优秀', advice: '发展状况优秀，继续保持良好的教育和引导。' };
  } else if (score >= 75) {
    return { level: '良好', advice: '发展状况良好，可以适当增加一些针对性的训练。' };
  } else if (score >= 60) {
    return { level: '中等', advice: '发展状况中等，建议多关注并提供适当的引导和支持。' };
  } else if (score >= 40) {
    return { level: '偏下', advice: '需要更多关注和引导，建议与老师沟通制定个性化方案。' };
  }
  return { level: '需关注', advice: '建议咨询专业医生或教育专家，进行全面评估。' };
};

// 直接初始化模型（像referralreward.model.ts一样）
GrowthRecord.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '成长记录ID - 主键',
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'student_id',
      comment: '学生ID - 外键',
    },
    type: {
      type: DataTypes.ENUM(...Object.values(GrowthRecordType)),
      allowNull: false,
      defaultValue: GrowthRecordType.HEIGHT_WEIGHT,
      comment: '成长记录类型',
    },
    // 身高体重数据
    height: {
      type: DataTypes.DECIMAL(5, 1),
      allowNull: true,
      comment: '身高 (cm)',
    },
    weight: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: '体重 (kg)',
    },
    headCircumference: {
      type: DataTypes.DECIMAL(5, 1),
      allowNull: true,
      field: 'head_circumference',
      comment: '头围 (cm)',
    },
    // 体能数据
    running50m: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: '50米跑 (秒)',
    },
    standingJump: {
      type: DataTypes.DECIMAL(5, 1),
      allowNull: true,
      field: 'standing_jump',
      comment: '立定跳远 (cm)',
    },
    ballThrow: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'ball_throw',
      comment: '掷球 (m)',
    },
    sitAndReach: {
      type: DataTypes.DECIMAL(5, 1),
      allowNull: true,
      field: 'sit_and_reach',
      comment: '坐位体前屈 (cm)',
    },
    // 发展评估分数
    cognitiveScore: {
      type: DataTypes.TINYINT,
      allowNull: true,
      field: 'cognitive_score',
      validate: { min: 0, max: 100 },
      comment: '认知发展评分 (0-100)',
    },
    socialScore: {
      type: DataTypes.TINYINT,
      allowNull: true,
      field: 'social_score',
      validate: { min: 0, max: 100 },
      comment: '社会情感评分 (0-100)',
    },
    languageScore: {
      type: DataTypes.TINYINT,
      allowNull: true,
      field: 'language_score',
      validate: { min: 0, max: 100 },
      comment: '语言发展评分 (0-100)',
    },
    motorScore: {
      type: DataTypes.TINYINT,
      allowNull: true,
      field: 'motor_score',
      validate: { min: 0, max: 100 },
      comment: '动作发展评分 (0-100)',
    },
    // 元数据
    measurementDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'measurement_date',
      comment: '测量日期',
    },
    measurementType: {
      type: DataTypes.ENUM(...Object.values(MeasurementType)),
      allowNull: false,
      field: 'measurement_type',
      defaultValue: MeasurementType.MANUAL,
      comment: '测量方式',
    },
    ageInMonths: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      field: 'age_in_months',
      comment: '测量时的月龄',
    },
    observerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'observer_id',
      comment: '记录人ID',
    },
    remark: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '备注',
    },
    // 标准化百分位
    heightPercentile: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'height_percentile',
      comment: '身高百分位 (3-97)',
    },
    weightPercentile: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'weight_percentile',
      comment: '体重百分位 (3-97)',
    },
    bmi: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'BMI指数',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: 'growth_records',
    modelName: 'GrowthRecord',
    timestamps: true,
    underscored: true,
    comment: '儿童成长记录表 - 身高体重、体能测试、发展评估等',
  }
);

// 保留initGrowthRecord函数以兼容现有代码（但实际上模型已经初始化）
export const initGrowthRecord = (seq: Sequelize) => {
  // 模型已在文件加载时初始化，此函数仅为兼容性保留
  return GrowthRecord;
};

/**
 * 设置成长记录模型的关联
 */
export const initGrowthRecordAssociations = () => {
  // 关联将在models/index.ts中统一设置，避免循环依赖
};

// 为了兼容旧代码，添加默认导出
export default GrowthRecord;
