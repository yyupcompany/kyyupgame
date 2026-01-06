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
import { ActivityRegistration } from './activity-registration.model';

/**
 * 活动参与者访问级别
 */
export enum ParticipantAccessLevel {
  READ_ONLY = 1,    // 只读权限：可查看基本信息
  MANAGE = 2,       // 管理权限：可管理报名信息
  FULL_ACCESS = 3   // 完全访问：可查看所有数据和分析
}

/**
 * 活动参与者表 - 用于教师权限分层
 * 实现教师对活动的不同访问级别控制
 */
export class ActivityParticipant extends Model<
  InferAttributes<ActivityParticipant>,
  InferCreationAttributes<ActivityParticipant>
> {
  declare id: CreationOptional<number>;
  declare activityId: ForeignKey<Activity['id']>;
  declare teacherId: ForeignKey<User['id']>;
  declare accessLevel: ParticipantAccessLevel;
  declare assignedBy: ForeignKey<User['id']>;
  declare assignedAt: CreationOptional<Date>;
  declare canViewRegistrations: CreationOptional<boolean>;
  declare canManageRegistrations: CreationOptional<boolean>;
  declare canViewAnalytics: CreationOptional<boolean>;
  declare canExportData: CreationOptional<boolean>;
  declare remark: string | null;
  declare isActive: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: Date | null;

  // 关联属性
  declare readonly activity?: Activity;
  declare readonly teacher?: User;
  declare readonly assigner?: User;

  static initModel(sequelize: Sequelize): void {
    ActivityParticipant.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        activityId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'activity_id',
          comment: '活动ID',
          references: {
            model: 'activities',
            key: 'id',
          },
        },
        teacherId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'teacher_id',
          comment: '教师ID（用户表中role为teacher的用户）',
          references: {
            model: 'users',
            key: 'id',
          },
        },
        accessLevel: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: ParticipantAccessLevel.READ_ONLY,
          field: 'access_level',
          comment: '访问级别：1-只读，2-管理，3-完全访问',
        },
        assignedBy: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'assigned_by',
          comment: '分配人ID',
          references: {
            model: 'users',
            key: 'id',
          },
        },
        assignedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field: 'assigned_at',
          comment: '分配时间',
        },
        canViewRegistrations: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
          field: 'can_view_registrations',
          comment: '是否可查看报名信息',
        },
        canManageRegistrations: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          field: 'can_manage_registrations',
          comment: '是否可管理报名信息',
        },
        canViewAnalytics: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          field: 'can_view_analytics',
          comment: '是否可查看数据分析',
        },
        canExportData: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          field: 'can_export_data',
          comment: '是否可导出数据',
        },
        remark: {
          type: DataTypes.STRING(500),
          allowNull: true,
          comment: '备注说明',
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
          field: 'is_active',
          comment: '是否启用',
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
        deletedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'deleted_at',
        },
      },
      {
        sequelize,
        tableName: 'activity_participants',
        timestamps: true,
        paranoid: true,
        underscored: true,
        indexes: [
          {
            fields: ['activity_id', 'teacher_id'],
            unique: true,
            name: 'uk_activity_teacher',
          },
          {
            fields: ['teacher_id'],
            name: 'idx_teacher_id',
          },
          {
            fields: ['activity_id'],
            name: 'idx_activity_id',
          },
          {
            fields: ['access_level'],
            name: 'idx_access_level',
          },
        ],
      }
    );
  }

  static initAssociations(): void {
    // 与Activity的关联
    ActivityParticipant.belongsTo(Activity, {
      foreignKey: 'activityId',
      as: 'activity',
    });

    // 与User（教师）的关联
    ActivityParticipant.belongsTo(User, {
      foreignKey: 'teacherId',
      as: 'teacher',
    });

    // 与User（分配人）的关联
    ActivityParticipant.belongsTo(User, {
      foreignKey: 'assignedBy',
      as: 'assigner',
    });
  }

  /**
   * 检查教师是否有特定活动的访问权限
   */
  static async checkTeacherAccess(
    teacherId: number,
    activityId: number,
    requiredLevel: ParticipantAccessLevel = ParticipantAccessLevel.READ_ONLY
  ): Promise<boolean> {
    const participant = await ActivityParticipant.findOne({
      where: {
        teacherId,
        activityId,
        isActive: true,
      },
    });

    if (!participant) return false;
    return participant.accessLevel >= requiredLevel;
  }

  /**
   * 获取教师可访问的活动列表
   */
  static async getTeacherAccessibleActivities(
    teacherId: number,
    accessLevel?: ParticipantAccessLevel
  ): Promise<Activity[]> {
    const whereCondition: any = {
      teacherId,
      isActive: true,
    };

    if (accessLevel) {
      whereCondition.accessLevel = accessLevel;
    }

    const participants = await ActivityParticipant.findAll({
      where: whereCondition,
      include: [
        {
          model: Activity,
          as: 'activity',
        },
      ],
    });

    return participants.map(p => p.activity!).filter(Boolean);
  }

  /**
   * 分配教师到活动
   */
  static async assignTeacherToActivity(
    activityId: number,
    teacherId: number,
    accessLevel: ParticipantAccessLevel,
    assignedBy: number,
    permissions: {
      canViewRegistrations?: boolean;
      canManageRegistrations?: boolean;
      canViewAnalytics?: boolean;
      canExportData?: boolean;
    } = {},
    remark?: string
  ): Promise<ActivityParticipant> {
    return await ActivityParticipant.create({
      activityId,
      teacherId,
      accessLevel,
      assignedBy,
      canViewRegistrations: permissions.canViewRegistrations ?? true,
      canManageRegistrations: permissions.canManageRegistrations ?? (accessLevel >= ParticipantAccessLevel.MANAGE),
      canViewAnalytics: permissions.canViewAnalytics ?? (accessLevel >= ParticipantAccessLevel.FULL_ACCESS),
      canExportData: permissions.canExportData ?? (accessLevel >= ParticipantAccessLevel.FULL_ACCESS),
      remark,
    });
  }
}

export default ActivityParticipant;