import { Model, DataTypes, Optional, Sequelize } from 'sequelize';
import { ParentStudentRelation } from './parent-student-relation.model';
import { User } from './user.model';

export interface ParentFollowupAttributes {
  id: number;
  parentId: number;
  content: string;
  followupDate: Date;
  followupType: string;
  result: string | null;
  nextFollowupDate: Date | null;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type ParentFollowupCreationAttributes = Optional<ParentFollowupAttributes, 'id' | 'result' | 'nextFollowupDate' | 'deletedAt'>;

export class ParentFollowup extends Model<ParentFollowupAttributes, ParentFollowupCreationAttributes> implements ParentFollowupAttributes {
  public id!: number;
  public parentId!: number;
  public content!: string;
  public followupDate!: Date;
  public followupType!: string;
  public result!: string | null;
  public nextFollowupDate!: Date | null;
  public createdBy!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  // Associations
  public readonly parent?: ParentStudentRelation;
  public readonly creator?: User;

  public needsFollowup(): boolean {
    if (!this.nextFollowupDate) {
      return false;
    }
    return new Date(this.nextFollowupDate) > new Date();
  }

  public daysUntilNextFollowup(): number | null {
    if (!this.nextFollowupDate) {
      return null;
    }
    const diffTime = new Date(this.nextFollowupDate).getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : null;
  }

  static initModel(sequelize: Sequelize): void {
    ParentFollowup.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          comment: '跟进记录ID - 主键'
        },
        parentId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'parent_id',
          comment: '家长ID - 关联家长学生关系表',
          references: {
            model: 'parent_student_relations',
            key: 'id'
          }
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: false,
          comment: '跟进内容'
        },
        followupDate: {
          type: DataTypes.DATEONLY,
          allowNull: false,
          field: 'followup_date',
          comment: '跟进日期'
        },
        followupType: {
          type: DataTypes.STRING(50),
          allowNull: false,
          field: 'followup_type',
          comment: '跟进类型 - 如：电话联系、家访、会议等'
        },
        result: {
          type: DataTypes.STRING(500),
          allowNull: true,
          comment: '跟进结果'
        },
        nextFollowupDate: {
          type: DataTypes.DATEONLY,
          allowNull: true,
          field: 'next_followup_date',
          comment: '下次跟进日期'
        },
        createdBy: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'created_by',
          comment: '创建人ID - 外键关联用户表',
          references: {
            model: 'users',
            key: 'id'
          }
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          field: 'created_at',
          comment: '创建时间'
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          field: 'updated_at',
          comment: '更新时间'
        },
        deletedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'deleted_at',
          comment: '删除时间'
        }
      },
      {
        sequelize,
        tableName: 'parent_followups',
        timestamps: true,
        paranoid: true,
        underscored: true,
      }
    );
  }

  static initAssociations(): void {
    ParentFollowup.belongsTo(ParentStudentRelation, {
      foreignKey: 'parentId',
      as: 'parent',
      onDelete: 'CASCADE'
    });
    ParentFollowup.belongsTo(User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
  }
}

export default ParentFollowup;
