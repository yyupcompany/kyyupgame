import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from 'sequelize';
import { Class } from './class.model';
import { User } from './user.model';
import { EnrollmentPlan } from './enrollment-plan.model';
import { Teacher } from './teacher.model';
import { Student } from './student.model';
import { Activity } from './activity.model';
import { MarketingCampaign } from './marketing-campaign.model';

/**
 * 幼儿园类型
 */
export enum KindergartenType {
  PUBLIC = 1, // 公办
  PRIVATE = 2, // 民办
  INCLUSIVE = 3, // 普惠
}

/**
 * 幼儿园等级
 */
export enum KindergartenLevel {
  LEVEL_1 = 1, // 一级
  LEVEL_2 = 2, // 二级
  LEVEL_3 = 3, // 三级
}

/**
 * 幼儿园状态
 */
export enum KindergartenStatus {
  DISABLED = 0, // 禁用
  NORMAL = 1, // 正常
}

export class Kindergarten extends Model<
  InferAttributes<Kindergarten>,
  InferCreationAttributes<Kindergarten>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare code: string;
  declare type: KindergartenType;
  declare level: KindergartenLevel;
  declare address: string;
  declare longitude: number;
  declare latitude: number;
  declare phone: string;
  declare email: string;
  declare principal: string;
  declare establishedDate: Date;
  declare area: number;
  declare buildingArea: number;
  declare classCount: CreationOptional<number>;
  declare teacherCount: CreationOptional<number>;
  declare studentCount: CreationOptional<number>;
  declare description: string | null;
  declare features: string | null;
  declare philosophy: string | null;
  declare feeDescription: string | null;
  declare logoUrl: string | null;
  declare coverImages: string | null;
  declare contactPerson: string | null;
  declare consultationPhone: string | null;
  declare status: CreationOptional<KindergartenStatus>;
  declare creatorId: ForeignKey<User['id']> | null;
  declare updaterId: ForeignKey<User['id']> | null;

  // 集团管理扩展字段
  declare groupId: number | null;
  declare isGroupHeadquarters: CreationOptional<number>;
  declare groupRole: number | null;
  declare joinGroupDate: Date | null;
  declare leaveGroupDate: Date | null;
  declare groupJoinReason: string | null;

  // 统一租户系统关联字段
  declare tenantPhoneNumber: string | null;
  declare tenantId: string | null;
  declare isPrimaryBranch: CreationOptional<number>;

  // 检查中心扩展字段 - 证照信息
  declare licenseNumber: string | null;
  declare licenseIssueDate: Date | null;
  declare licenseExpiryDate: Date | null;
  declare businessLicenseNumber: string | null;
  declare organizationCode: string | null;
  declare taxNumber: string | null;

  // 检查中心扩展字段 - 办园条件
  declare outdoorArea: number | null;
  declare indoorArea: number | null;
  declare greenArea: number | null;
  declare playgroundArea: number | null;

  // 检查中心扩展字段 - 设施设备
  declare classroomCount: number | null;
  declare activityRoomCount: number | null;
  declare dormitoryCount: number | null;
  declare kitchenArea: number | null;
  declare medicalRoomArea: number | null;

  // 检查中心扩展字段 - 人员配置
  declare principalQualification: string | null;
  declare principalEducation: string | null;
  declare principalWorkYears: number | null;
  declare qualifiedTeacherCount: number | null;
  declare bachelorTeacherCount: number | null;
  declare nurseCount: number | null;
  declare cookCount: number | null;
  declare securityCount: number | null;
  declare doctorCount: number | null;

  // 检查中心扩展字段 - 财务信息
  declare registeredCapital: number | null;
  declare annualRevenue: number | null;
  declare annualExpenditure: number | null;
  declare tuitionFee: number | null;
  declare boardingFee: number | null;
  declare mealFee: number | null;

  // 检查中心扩展字段 - 安全管理
  declare fireControlCertified: boolean | null;
  declare foodLicenseNumber: string | null;
  declare foodLicenseExpiryDate: Date | null;
  declare hasSchoolBus: boolean | null;
  declare schoolBusCount: number | null;

  // 检查中心扩展字段 - 行政信息
  declare cityLevel: string | null;
  declare educationBureau: string | null;
  declare supervisorName: string | null;
  declare supervisorPhone: string | null;

  // 检查中心扩展字段 - 其他信息
  declare isPuhuiKindergarten: boolean | null;
  declare puhuiRecognitionDate: Date | null;
  declare lastInspectionDate: Date | null;
  declare lastInspectionResult: string | null;
  declare currentGrade: string | null;
  declare gradeEvaluationDate: Date | null;

  // 检查中心扩展字段 - 完善度标记
  declare infoCompleteness: CreationOptional<number>;
  declare infoLastUpdatedAt: Date | null;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date | null>;

  // Associations
  public readonly classes?: Class[];
  public readonly teachers?: Teacher[];
  public readonly students?: Student[];
  public readonly enrollmentPlans?: EnrollmentPlan[];
  public readonly activities?: Activity[];
  public readonly marketingCampaigns?: MarketingCampaign[];
  public readonly creator?: User;
  public readonly updater?: User;
}

export const initKindergarten = (sequelize: Sequelize) => {
  Kindergarten.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: '幼儿园ID - 主键',
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '幼儿园名称 - 幼儿园的正式名称',
      },
      code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: '幼儿园编码 - 标识符',
      },
      type: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: '幼儿园类型 - 1:公办 2:民办 3:普惠',
      },
      level: {
        type: DataTypes.TINYINT,
        allowNull: false,
        comment: '幼儿园等级 - 1:一级 2:二级 3:三级',
      },
      address: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: '幼儿园地址 - 详细地址',
      },
      longitude: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: false,
        comment: '经度 - 地理位置经度',
      },
      latitude: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: false,
        comment: '纬度 - 地理位置纬度',
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: '联系电话 - 幼儿园联系电话',
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '电子邮箱 - 幼儿园联系邮箱',
      },
      principal: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '园长姓名 - 幼儿园负责人',
      },
      establishedDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'established_date',
        comment: '成立时间 - 幼儿园成立日期',
      },
      area: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'area',
        comment: '占地面积 - 单位：平方米',
      },
      buildingArea: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'building_area',
        comment: '建筑面积 - 单位：平方米',
      },
      classCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'class_count',
        comment: '班级数量 - 幼儿园班级总数',
      },
      teacherCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'teacher_count',
        comment: '教师数量 - 幼儿园教师总数',
      },
      studentCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'student_count',
        comment: '学生数量 - 幼儿园学生总数',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '幼儿园简介 - 详细介绍',
      },
      features: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '特色课程 - 幼儿园特色课程介绍',
      },
      philosophy: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '办学理念 - 幼儿园教育理念',
      },
      feeDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'fee_description',
        comment: '收费标准 - 学费标准说明',
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: KindergartenStatus.NORMAL,
        field: 'status',
        comment: '状态 - 0:禁用 1:正常',
      },
      creatorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'creator_id',
        comment: '创建人ID',
      },
      updaterId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'updater_id',
        comment: '更新人ID',
      },
      logoUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'logo_url',
        comment: '幼儿园logo图片URL',
      },
      coverImages: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'cover_images',
        comment: '园区配图URLs，JSON格式存储多张图片',
      },
      contactPerson: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'contact_person',
        comment: '联系人姓名',
      },
      consultationPhone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'consultation_phone',
        comment: '咨询电话',
      },

      // 检查中心扩展字段 - 证照信息
      licenseNumber: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: '办学许可证号',
      },
      licenseIssueDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: '许可证发证日期',
      },
      licenseExpiryDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: '许可证有效期',
      },
      businessLicenseNumber: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: '营业执照号（民办园）',
      },
      organizationCode: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: '组织机构代码',
      },
      taxNumber: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: '税务登记号',
      },

      // 检查中心扩展字段 - 办园条件
      outdoorArea: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '户外活动面积（平方米）',
      },
      indoorArea: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '室内活动面积（平方米）',
      },
      greenArea: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '绿化面积（平方米）',
      },
      playgroundArea: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '运动场地面积（平方米）',
      },

      // 检查中心扩展字段 - 设施设备
      classroomCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '教室数量',
      },
      activityRoomCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '活动室数量',
      },
      dormitoryCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '寝室数量',
      },
      kitchenArea: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '厨房面积（平方米）',
      },
      medicalRoomArea: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '保健室面积（平方米）',
      },

      // 检查中心扩展字段 - 人员配置
      principalQualification: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: '园长资格证号',
      },
      principalEducation: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '园长学历',
      },
      principalWorkYears: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '园长工作年限',
      },
      qualifiedTeacherCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '持证教师数',
      },
      bachelorTeacherCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '本科学历教师数',
      },
      nurseCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '保育员数',
      },
      cookCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '厨师数',
      },
      securityCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '保安数',
      },
      doctorCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '保健医生数',
      },

      // 检查中心扩展字段 - 财务信息
      registeredCapital: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        comment: '注册资金（元）',
      },
      annualRevenue: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        comment: '年度收入（元）',
      },
      annualExpenditure: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        comment: '年度支出（元）',
      },
      tuitionFee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: '保教费标准（元/月）',
      },
      boardingFee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: '住宿费标准（元/月）',
      },
      mealFee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: '伙食费标准（元/月）',
      },

      // 检查中心扩展字段 - 安全管理
      fireControlCertified: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
        comment: '消防验收合格',
      },
      foodLicenseNumber: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: '食品经营许可证号',
      },
      foodLicenseExpiryDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: '食品许可证有效期',
      },
      hasSchoolBus: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
        comment: '是否有校车',
      },
      schoolBusCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: '校车数量',
      },

      // 检查中心扩展字段 - 行政信息
      cityLevel: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: '城市级别：tier1/tier2/tier3/county/township',
      },
      educationBureau: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: '主管教育局',
      },
      supervisorName: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '责任督学姓名',
      },
      supervisorPhone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: '责任督学电话',
      },

      // 检查中心扩展字段 - 其他信息
      isPuhuiKindergarten: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
        comment: '是否普惠园',
      },
      puhuiRecognitionDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: '普惠认定日期',
      },
      lastInspectionDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: '上次年检日期',
      },
      lastInspectionResult: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '上次年检结果',
      },
      currentGrade: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: '当前等级：一级/二级/三级',
      },
      gradeEvaluationDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: '等级评定日期',
      },

      // 检查中心扩展字段 - 完善度标记
      infoCompleteness: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: '信息完整度（0-100）',
      },
      infoLastUpdatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '信息最后更新时间',
      },

      // 集团管理扩展字段
      groupId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'group_id',
        comment: '所属集团ID',
      },
      isGroupHeadquarters: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        field: 'is_group_headquarters',
        comment: '是否为集团总部: 0-否 1-是',
      },
      groupRole: {
        type: DataTypes.TINYINT,
        allowNull: true,
        field: 'group_role',
        comment: '集团角色: 1-总部 2-旗舰园 3-标准园 4-加盟园',
      },
      joinGroupDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'join_group_date',
        comment: '加入集团日期',
      },
      leaveGroupDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'leave_group_date',
        comment: '退出集团日期',
      },
      groupJoinReason: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'group_join_reason',
        comment: '加入集团原因',
      },

      // 统一租户系统关联字段
      tenantPhoneNumber: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'tenant_phone_number',
        comment: '租户手机号（统一租户管理系统）',
      },
      tenantId: {
        type: DataTypes.STRING(64),
        allowNull: true,
        field: 'tenant_id',
        comment: '租户ID（统一租户管理系统的全局租户ID）',
      },
      isPrimaryBranch: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        field: 'is_primary_branch',
        comment: '是否为主园区（总部）：0-否，1-是',
      },

      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'kindergartens',
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );
  return Kindergarten;
};

export const initKindergartenAssociations = () => {
  Kindergarten.hasMany(Class, {
    foreignKey: 'kindergartenId',
    as: 'classes',
  });
  Kindergarten.hasMany(Teacher, {
    foreignKey: 'kindergartenId',
    as: 'teachers'
  });
  Kindergarten.hasMany(Student, {
    foreignKey: 'kindergartenId',
    as: 'allStudents'
  });
  Kindergarten.hasMany(EnrollmentPlan, {
    foreignKey: 'kindergartenId',
    as: 'enrollmentPlans'
  });
   Kindergarten.hasMany(Activity, {
    foreignKey: 'kindergartenId',
    as: 'activities'
  });
  Kindergarten.hasMany(MarketingCampaign, {
    foreignKey: 'kindergartenId',
    as: 'marketingCampaigns'
  });
  Kindergarten.belongsTo(User, {
      foreignKey: 'creatorId',
      as: 'creator'
  });
  Kindergarten.belongsTo(User, {
      foreignKey: 'updaterId',
      as: 'updater'
  });
};
