import { Model, DataTypes, Optional, Sequelize } from 'sequelize';
import { User } from './user.model';
import { EnrollmentConsultation } from './enrollment-consultation.model';

export interface EnrollmentConsultationFollowupAttributes {
  id: number;
  consultationId: number;
  followupUserId: number;
  followupMethod: number; // 1:电话 2:微信 3:短信 4:面谈 5:邮件 6:其他
  followupContent: string;
  followupDate: Date;
  intentionLevel: number; // 1:非常有意向 2:有意向 3:一般 4:较低 5:无意向
  followupResult: number; // 1:继续跟进 2:成功转化 3:暂无意向 4:放弃跟进
  nextFollowupDate: Date | null;
  remark: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type EnrollmentConsultationFollowupCreationAttributes = Optional<EnrollmentConsultationFollowupAttributes, 'id' | 'nextFollowupDate' | 'remark'>;

export class EnrollmentConsultationFollowup extends Model<EnrollmentConsultationFollowupAttributes, EnrollmentConsultationFollowupCreationAttributes> implements EnrollmentConsultationFollowupAttributes {
  public id!: number;
  public consultationId!: number;
  public followupUserId!: number;
  public followupMethod!: number;
  public followupContent!: string;
  public followupDate!: Date;
  public intentionLevel!: number;
  public followupResult!: number;
  public nextFollowupDate!: Date | null;
  public remark!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly consultation?: EnrollmentConsultation;
  public readonly followupUser?: User;

  static initModel(sequelize: Sequelize): void {
    EnrollmentConsultationFollowup.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          comment: '跟进记录ID'
        },
        consultationId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'consultation_id',
          comment: '咨询记录ID',
          references: {
            model: 'enrollment_consultations',
            key: 'id'
          }
        },
        followupUserId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'followup_user_id',
          comment: '跟进人ID',
          references: {
            model: 'users',
            key: 'id'
          }
        },
        followupMethod: {
          type: DataTypes.TINYINT,
          allowNull: false,
          field: 'followup_method',
          comment: '跟进方式 - 1:电话 2:微信 3:短信 4:面谈 5:邮件 6:其他'
        },
        followupContent: {
          type: DataTypes.TEXT,
          allowNull: false,
          field: 'followup_content',
          comment: '跟进内容'
        },
        followupDate: {
          type: DataTypes.DATE,
          allowNull: false,
          field: 'followup_date',
          comment: '跟进日期'
        },
        intentionLevel: {
          type: DataTypes.TINYINT,
          allowNull: false,
          field: 'intention_level',
          comment: '意向级别 - 1:非常有意向 2:有意向 3:一般 4:较低 5:无意向'
        },
        followupResult: {
          type: DataTypes.TINYINT,
          allowNull: false,
          field: 'followup_result',
          comment: '跟进结果 - 1:继续跟进 2:成功转化 3:暂无意向 4:放弃跟进'
        },
        nextFollowupDate: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'next_followup_date',
          comment: '下次跟进日期'
        },
        remark: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: '备注'
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
        }
      },
      {
        sequelize,
        tableName: 'enrollment_consultation_followups',
        timestamps: true,
        underscored: true,
      }
    );
  }

  static initAssociations(): void {
    this.belongsTo(this.sequelize!.models.EnrollmentConsultation, {
      foreignKey: 'consultationId',
      as: 'consultation'
    });
    this.belongsTo(this.sequelize!.models.User, {
      foreignKey: 'followupUserId',
      as: 'followupUser'
    });
  }
}

export default EnrollmentConsultationFollowup;
