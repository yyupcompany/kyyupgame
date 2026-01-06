import { Model, DataTypes, Optional, Sequelize } from 'sequelize';
import { User } from './user.model';
import { Student } from './student.model';

export interface ParentAttributes {
  id: number;
  userId: number;
  studentId: number;
  relationship: string;
  isPrimaryContact: number;
  isLegalGuardian: number;
  idCardNo: string | null;
  workUnit: string | null;
  occupation: string | null;
  education: string | null;
  address: string | null;
  remark: string | null;
  creatorId: number | null;
  updaterId: number | null;
  // 🎯 新增教师权限相关字段
  assignedTeacherId: number | null;
  isPublic: boolean;
  followStatus: '待跟进' | '跟进中' | '已转化' | '已放弃';
  priority: number;
  lastFollowupAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type ParentCreationAttributes = Optional<ParentAttributes, 'id' | 'idCardNo' | 'workUnit' | 'occupation' | 'education' | 'address' | 'remark' | 'creatorId' | 'updaterId' | 'assignedTeacherId' | 'isPublic' | 'followStatus' | 'priority' | 'lastFollowupAt' | 'createdAt' | 'updatedAt' | 'deletedAt'>;

export class Parent extends Model<ParentAttributes, ParentCreationAttributes> implements ParentAttributes {
  public id!: number;
  public userId!: number;
  public studentId!: number;
  public relationship!: string;
  public isPrimaryContact!: number;
  public isLegalGuardian!: number;
  public idCardNo!: string | null;
  public workUnit!: string | null;
  public occupation!: string | null;
  public education!: string | null;
  public address!: string | null;
  public remark!: string | null;
  public creatorId!: number | null;
  public updaterId!: number | null;
  // 🎯 新增教师权限相关属性
  public assignedTeacherId!: number | null;
  public isPublic!: boolean;
  public followStatus!: '待跟进' | '跟进中' | '已转化' | '已放弃';
  public priority!: number;
  public lastFollowupAt!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  // 虚拟属性，从关联的用户模型获取
  public readonly user?: User;
  public readonly student?: Student;

  static initModel(sequelize: Sequelize): void {
    Parent.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
          comment: '关联的用户ID',
        },
        studentId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'students',
            key: 'id',
          },
          comment: '关联的学生ID',
        },
        relationship: {
          type: DataTypes.STRING(20),
          allowNull: false,
          comment: '与学生的关系',
        },
        isPrimaryContact: {
          type: DataTypes.TINYINT,
          allowNull: false,
          defaultValue: 0,
          comment: '是否为主要联系人',
        },
        isLegalGuardian: {
          type: DataTypes.TINYINT,
          allowNull: false,
          defaultValue: 0,
          comment: '是否为法定监护人',
        },
        idCardNo: {
          type: DataTypes.STRING(18),
          allowNull: true,
          comment: '身份证号',
        },
        workUnit: {
          type: DataTypes.STRING(100),
          allowNull: true,
          comment: '工作单位',
        },
        occupation: {
          type: DataTypes.STRING(50),
          allowNull: true,
          comment: '职业',
        },
        education: {
          type: DataTypes.STRING(50),
          allowNull: true,
          comment: '学历',
        },
        address: {
          type: DataTypes.STRING(200),
          allowNull: true,
          comment: '家庭住址',
        },
        remark: {
          type: DataTypes.STRING(500),
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
        // 🎯 新增教师权限相关字段
        assignedTeacherId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: 'assigned_teacher_id',
          comment: '分配的教师ID',
          references: {
            model: 'users',
            key: 'id',
          },
        },
        isPublic: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          field: 'is_public',
          comment: '是否为公开客户（所有教师可见）',
        },
        followStatus: {
          type: DataTypes.ENUM('待跟进', '跟进中', '已转化', '已放弃'),
          allowNull: false,
          defaultValue: '待跟进',
          field: 'follow_status',
          comment: '跟进状态',
        },
        priority: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 3,
          comment: '客户优先级：1-高，2-中，3-低',
        },
        lastFollowupAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'last_followup_at',
          comment: '最后跟进时间',
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          field: 'created_at'
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          field: 'updated_at'
        },
        deletedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'deleted_at'
        }
      },
      {
        sequelize,
        tableName: 'parents',
        timestamps: true,
        paranoid: true,
        underscored: true,
      }
    );
  }

  static initAssociations(): void {
    Parent.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    // 注释掉直接的belongsTo关联，使用多对多关系
    // Parent.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
  }
}

export default Parent;
