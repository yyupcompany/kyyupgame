import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { Role } from './role.model';
import { EnrollmentPlan } from './enrollment-plan.model';
import { EnrollmentPlanAssignee } from './enrollment-plan-assignee.model';
import { UserRole as UserRoleModel } from './user-role.model';
import { Parent } from './parent.model';
import { Teacher } from './teacher.model';

export enum UserRole {
  ADMIN = 'admin',
  PRINCIPAL = 'principal',
  TEACHER = 'teacher',
  PARENT = 'parent',
  USER = 'user',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  LOCKED = 'locked',
}

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: CreationOptional<number>;
  declare global_user_id: CreationOptional<string | null>;  // 关联统一认证系统的全局用户ID
  declare username: string;
  declare password?: string;
  declare email: string;
  declare role: CreationOptional<UserRole>;
  declare realName: string;
  declare phone: string;
  declare status: UserStatus;
  declare auth_source: CreationOptional<string | null>;  // 认证来源：local/unified

  // 多园区支持字段
  declare primaryKindergartenId?: number | null;  // 主要园区ID
  declare allowedKindergartenIds?: string | null;  // 允许访问的园区ID列表 (JSON)
  declare dataScope?: string | null;  // 数据访问范围: all/single/none

  // MFA双因素认证字段（等保三级合规要求）
  declare two_fa_enabled: CreationOptional<boolean>;
  declare two_fa_secret?: string | null;
  declare two_fa_backup_codes?: string | null;
  declare two_fa_enabled_at?: Date | null;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  // Associations
  declare readonly roles?: Role[];
  declare readonly assignedPlans?: EnrollmentPlan[];
  declare readonly teacher?: Teacher;

  static initModel(sequelize: Sequelize): void {
    User.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        global_user_id: {
          type: DataTypes.STRING(64),
          allowNull: true,
          comment: '关联统一认证系统的全局用户ID',
        },
        username: {
          type: new DataTypes.STRING(128),
          allowNull: false,
          unique: true,
          comment: '用户名',
        },
        password: {
          type: new DataTypes.STRING(128),
          allowNull: true, // Allow null for cases like SSO
          comment: '密码',
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          validate: {
            isEmail: true,
          },
          comment: '邮箱',
        },
        role: {
          type: DataTypes.ENUM(...Object.values(UserRole)),
          allowNull: false,
          defaultValue: UserRole.USER,
          comment: '角色',
        },

        realName: {
          type: DataTypes.STRING,
          allowNull: false,
          comment: '真实姓名',
        },
        phone: {
          type: DataTypes.STRING,
          allowNull: false,
          comment: '手机号',
        },
        auth_source: {
          type: DataTypes.STRING(20),
          allowNull: true,
          defaultValue: 'local',
          comment: '认证来源：local/unified',
        },
        // 多园区支持字段
        primaryKindergartenId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: 'primary_kindergarten_id',
          comment: '主要园区ID',
        },
        allowedKindergartenIds: {
          type: DataTypes.TEXT,
          allowNull: true,
          field: 'allowed_kindergarten_ids',
          comment: '允许访问的园区ID列表 (JSON)',
        },
        dataScope: {
          type: DataTypes.ENUM('all', 'single', 'none'),
          allowNull: true,
          field: 'data_scope',
          comment: '数据访问范围: all/single/none',
        },
        status: {
          type: DataTypes.ENUM(...Object.values(UserStatus)),
          allowNull: false,
          defaultValue: UserStatus.ACTIVE,
          comment: '状态',
        },
        // MFA双因素认证字段（等保三级合规要求）
        two_fa_enabled: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: '是否启用双因素认证',
        },
        two_fa_secret: {
          type: DataTypes.STRING(255),
          allowNull: true,
          comment: 'TOTP密钥(加密存储)',
        },
        two_fa_backup_codes: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: '备用恢复码(JSON数组,加密存储)',
        },
        two_fa_enabled_at: {
          type: DataTypes.DATE,
          allowNull: true,
          comment: 'MFA启用时间',
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'users',
        timestamps: true,
      }
    );
  }

  static initAssociations(): void {
    // ✅ 移除重复的User-Role关联定义，该关联已在server/src/models/index.ts的setupAssociations()中定义
    // User.belongsToMany(Role, {
    //   through: UserRoleModel,
    //   foreignKey: 'userId',
    //   otherKey: 'roleId',
    //   as: 'roles',
    // });

    // Add the missing association - temporarily commented out due to model issues
    // User.belongsToMany(EnrollmentPlan, {
    //   through: EnrollmentPlanAssignee,
    //   foreignKey: 'assigneeId',
    //   otherKey: 'planId',
    //   as: 'assignedPlans',
    // });

    // Add Parent association
    User.hasMany(Parent, { foreignKey: 'userId', as: 'parentRelations' });

    // Add Teacher association
    // 注意：Teacher模型使用了underscored: true，所以数据库中的字段名是user_id
    User.hasOne(Teacher, { foreignKey: 'user_id', as: 'teacher' });
  }
}
