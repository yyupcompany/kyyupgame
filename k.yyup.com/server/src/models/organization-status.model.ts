import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey
} from 'sequelize';
import { Kindergarten } from './kindergarten.model';

/**
 * 机构现状模型
 * 存储幼儿园的实时运营数据和现状信息
 */
export class OrganizationStatus extends Model<
  InferAttributes<OrganizationStatus>,
  InferCreationAttributes<OrganizationStatus>
> {
  declare id: CreationOptional<number>;
  declare kindergartenId: ForeignKey<Kindergarten['id']>;
  
  // 基本情况
  declare totalClasses: number; // 总班级数
  declare totalStudents: number; // 在园学生总数
  declare totalTeachers: number; // 教师总数
  declare teacherStudentRatio: number; // 师生比
  
  // 生源情况
  declare currentEnrollment: number; // 当前在园人数
  declare enrollmentCapacity: number; // 招生容量
  declare enrollmentRate: number; // 招生率(%)
  declare waitingListCount: number; // 等待名单人数
  
  // 师资情况
  declare fullTimeTeachers: number; // 全职教师数
  declare partTimeTeachers: number; // 兼职教师数
  declare seniorTeachers: number; // 高级教师数
  declare averageTeachingYears: number; // 平均教龄
  
  // 招生情况
  declare monthlyEnrollmentFrequency: number; // 月招生频次
  declare quarterlyEnrollmentFrequency: number; // 季度招生频次
  declare yearlyEnrollmentFrequency: number; // 年度招生频次
  declare enrollmentConversionRate: number; // 招生转化率(%)
  declare averageEnrollmentCycle: number; // 平均招生周期(天)
  
  // 客户跟进情况
  declare totalLeads: number; // 总线索数
  declare activeLeads: number; // 活跃线索数
  declare convertedLeads: number; // 已转化线索数
  declare averageFollowupCount: number; // 平均跟进次数
  declare averageResponseTime: number; // 平均响应时间(小时)
  declare teacherFollowupLoad: number; // 教师跟进负载(人均线索数)
  
  // 财务情况
  declare monthlyRevenue: number | null; // 月度营收
  declare averageTuitionFee: number | null; // 平均学费
  declare outstandingPayments: number | null; // 待收款金额
  
  // 活动情况
  declare monthlyActivityCount: number | null; // 月度活动次数
  declare activityParticipationRate: number | null; // 活动参与率(%)
  
  // 数据更新时间
  declare dataUpdatedAt: Date; // 数据更新时间
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export const initOrganizationStatus = (sequelize: Sequelize) => {
  OrganizationStatus.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: '主键ID',
      },
      kindergartenId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '幼儿园ID',
        references: {
          model: 'kindergartens',
          key: 'id',
        },
      },
      
      // 基本情况
      totalClasses: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '总班级数',
      },
      totalStudents: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '在园学生总数',
      },
      totalTeachers: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '教师总数',
      },
      teacherStudentRatio: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        comment: '师生比',
      },
      
      // 生源情况
      currentEnrollment: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '当前在园人数',
      },
      enrollmentCapacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '招生容量',
      },
      enrollmentRate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        comment: '招生率(%)',
      },
      waitingListCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '等待名单人数',
      },
      
      // 师资情况
      fullTimeTeachers: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '全职教师数',
      },
      partTimeTeachers: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '兼职教师数',
      },
      seniorTeachers: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '高级教师数',
      },
      averageTeachingYears: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        comment: '平均教龄',
      },
      
      // 招生情况
      monthlyEnrollmentFrequency: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '月招生频次',
      },
      quarterlyEnrollmentFrequency: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '季度招生频次',
      },
      yearlyEnrollmentFrequency: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '年度招生频次',
      },
      enrollmentConversionRate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        comment: '招生转化率(%)',
      },
      averageEnrollmentCycle: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '平均招生周期(天)',
      },
      
      // 客户跟进情况
      totalLeads: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '总线索数',
      },
      activeLeads: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '活跃线索数',
      },
      convertedLeads: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '已转化线索数',
      },
      averageFollowupCount: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        comment: '平均跟进次数',
      },
      averageResponseTime: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        comment: '平均响应时间(小时)',
      },
      teacherFollowupLoad: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        comment: '教师跟进负载(人均线索数)',
      },
      
      // 财务情况
      monthlyRevenue: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        comment: '月度营收',
      },
      averageTuitionFee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: '平均学费',
      },
      outstandingPayments: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        comment: '待收款金额',
      },
      
      // 活动情况
      monthlyActivityCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '月度活动次数',
      },
      activityParticipationRate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        comment: '活动参与率(%)',
      },
      
      // 数据更新时间
      dataUpdatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '数据更新时间',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'organization_status',
      timestamps: true,
      indexes: [
        {
          name: 'kindergarten_id_idx',
          fields: ['kindergartenId'],
        },
        {
          name: 'data_updated_at_idx',
          fields: ['dataUpdatedAt'],
        },
      ],
      comment: '机构现状数据表',
    }
  );

  return OrganizationStatus;
};

export const initOrganizationStatusAssociations = () => {
  OrganizationStatus.belongsTo(Kindergarten, {
    foreignKey: 'kindergartenId',
    as: 'kindergarten',
  });
};

