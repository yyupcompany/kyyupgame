import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from 'sequelize';
import { User } from './user.model';
import { Activity } from './activity.model';
import { Student } from './student.model';
import { ParentStudentRelation } from './parent-student-relation.model';

export enum ChildGender {
  MALE = 1,
  FEMALE = 2,
}

export enum RegistrationStatus {
  PENDING = 0, // 待审核
  CONFIRMED = 1, // 已确认
  REJECTED = 2, // 已拒绝
  CANCELLED = 3, // 已取消
  CHECKED_IN = 4, // 已签到
  NO_SHOW = 5, // 未出席
}

export class ActivityRegistration extends Model<
  InferAttributes<ActivityRegistration>,
  InferCreationAttributes<ActivityRegistration>
> {
  declare id: CreationOptional<number>;
  declare activityId: ForeignKey<Activity['id']>;
  declare parentId: ForeignKey<ParentStudentRelation['id']> | null;
  declare studentId: ForeignKey<Student['id']> | null;
  declare contactName: string;
  declare contactPhone: string;
  declare childName: string | null;
  declare childAge: number | null;
  declare childGender: ChildGender | null;
  declare registrationTime: CreationOptional<Date>;
  declare attendeeCount: CreationOptional<number>;
  declare specialNeeds: string | null;
  declare source: string | null;
  declare status: CreationOptional<RegistrationStatus>;
  declare checkInTime: Date | null;
  declare checkInLocation: string | null;
  declare feedback: string | null;
  declare isConversion: CreationOptional<boolean>;
  declare remark: string | null;
  declare creatorId: ForeignKey<User['id']> | null;
  declare updaterId: ForeignKey<User['id']> | null;

  // 新增：客户来源追踪字段
  declare shareBy: number | null;
  declare shareType: string | null;
  declare sourceType: string | null;
  declare sourceDetail: any | null;
  declare autoAssigned: CreationOptional<boolean>;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare readonly deletedAt: CreationOptional<Date | null>;

  // Associations
  public readonly activity?: Activity;
  public readonly parent?: ParentStudentRelation;
  public readonly student?: Student;
  public readonly creator?: User;
  public readonly updater?: User;

  // 统计相关的虚拟属性（用于查询结果）
  declare totalCount?: number;
  declare pendingCount?: number;
  declare confirmedCount?: number;
  declare todayCount?: number;
  declare weekCount?: number;

  public async checkIn(location: string): Promise<void> {
    if (this.status !== RegistrationStatus.CONFIRMED) {
      throw new Error('只有已确认的报名才能签到');
    }
    this.checkInTime = new Date();
    this.checkInLocation = location;
    this.status = RegistrationStatus.CHECKED_IN;
    await this.save();
  }
}

// 导出用于创建模型实例的类型定义
export type ActivityRegistrationCreationAttributes = InferCreationAttributes<ActivityRegistration>;
// 导出模型属性的类型定义
export type ActivityRegistrationAttributes = InferAttributes<ActivityRegistration>;

export const initActivityRegistration = (sequelize: Sequelize) => {
  ActivityRegistration.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '报名记录ID',
      },
      activityId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '活动ID',
      },
      parentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '家长ID',
      },
      studentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '学生ID',
      },
      contactName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '联系人姓名',
      },
      contactPhone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: '联系电话',
      },
      childName: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '孩子姓名',
      },
      childAge: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '孩子年龄(月)',
      },
      childGender: {
        type: DataTypes.TINYINT,
        allowNull: true,
        comment: '孩子性别 - 1:男 2:女',
      },
      registrationTime: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: '报名时间',
      },
      attendeeCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: '参与人数',
      },
      specialNeeds: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: '特殊需求',
      },
      source: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '报名来源',
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: RegistrationStatus.PENDING,
        comment: '状态 - 0:待审核 1:已确认 2:已拒绝 3:已取消 4:已签到 5:未出席',
      },
      checkInTime: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '签到时间',
      },
      checkInLocation: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: '签到地点',
      },
      feedback: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '活动反馈',
      },
      isConversion: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '是否转化为报名',
      },
      remark: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '备注',
      },
      creatorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '创建人ID',
      },
      updaterId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '更新人ID',
      },
      // 新增：客户来源追踪字段
      shareBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '分享者ID（老师或园长）',
      },
      shareType: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: '分享类型: teacher/principal/wechat/qrcode',
      },
      sourceType: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '来源类型: ACTIVITY_ONLINE/ACTIVITY_OFFLINE/TEACHER_REFERRAL等',
      },
      sourceDetail: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: '来源详情（JSON格式）',
      },
      autoAssigned: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '是否自动分配给老师',
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
      tableName: 'activity_registrations',
      timestamps: true,
      paranoid: true,
      underscored: true,
    }
  );
  return ActivityRegistration;
};

export const initActivityRegistrationAssociations = () => {
  ActivityRegistration.belongsTo(Activity, {
    foreignKey: 'activityId',
    as: 'activity',
  });
  ActivityRegistration.belongsTo(ParentStudentRelation, {
    foreignKey: 'parentId',
    as: 'parent',
  });
  ActivityRegistration.belongsTo(Student, {
    foreignKey: 'studentId',
    as: 'student',
  });
  ActivityRegistration.belongsTo(User, {
    foreignKey: 'creatorId',
    as: 'creator',
  });
  ActivityRegistration.belongsTo(User, {
    foreignKey: 'updaterId',
    as: 'updater',
  });
};
