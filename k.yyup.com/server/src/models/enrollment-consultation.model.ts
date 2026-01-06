import { Model, DataTypes, Optional, Sequelize } from 'sequelize';
import { Kindergarten } from './kindergarten.model';
import { User } from './user.model';
import { EnrollmentConsultationFollowup } from './enrollment-consultation-followup.model';

export interface EnrollmentConsultationAttributes {
  id: number;
  kindergartenId: number;
  consultantId: number;
  parentName: string;
  childName: string;
  childAge: number;
  childGender: number; // 1:男 2:女
  contactPhone: string;
  contactAddress: string | null;
  sourceChannel: number; // 1:线上广告 2:线下活动 3:朋友介绍 4:电话咨询 5:自主访问 6:其他
  sourceDetail: string | null;
  consultContent: string;
  consultMethod: number; // 1:电话 2:线下到访 3:线上咨询 4:微信 5:其他
  consultDate: Date;
  intentionLevel: number; // 1:非常有意向 2:有意向 3:一般 4:较低 5:无意向
  followupStatus: number; // 1:待跟进 2:跟进中 3:已转化 4:已放弃
  nextFollowupDate: Date | null;
  remark: string | null;
  creatorId: number;
  updaterId: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type EnrollmentConsultationCreationAttributes = Optional<EnrollmentConsultationAttributes, 'id' | 'contactAddress' | 'sourceDetail' | 'nextFollowupDate' | 'remark' | 'updaterId' | 'deletedAt'>;

export class EnrollmentConsultation extends Model<EnrollmentConsultationAttributes, EnrollmentConsultationCreationAttributes> implements EnrollmentConsultationAttributes {
  public id!: number;
  public kindergartenId!: number;
  public consultantId!: number;
  public parentName!: string;
  public childName!: string;
  public childAge!: number;
  public childGender!: number;
  public contactPhone!: string;
  public contactAddress!: string | null;
  public sourceChannel!: number;
  public sourceDetail!: string | null;
  public consultContent!: string;
  public consultMethod!: number;
  public consultDate!: Date;
  public intentionLevel!: number;
  public followupStatus!: number;
  public nextFollowupDate!: Date | null;
  public remark!: string | null;
  public creatorId!: number;
  public updaterId!: number | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  public readonly kindergarten?: Kindergarten;
  public readonly consultant?: User;
  public readonly creator?: User;
  public readonly updater?: User;
  public readonly followups?: EnrollmentConsultationFollowup[];

  static initModel(sequelize: Sequelize): void {
    EnrollmentConsultation.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          comment: '咨询记录ID'
        },
        kindergartenId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'kindergarten_id',
          comment: '幼儿园ID',
          references: {
            model: 'kindergartens',
            key: 'id'
          }
        },
        consultantId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'consultant_id',
          comment: '咨询师ID',
          references: {
            model: 'users',
            key: 'id'
          }
        },
        parentName: {
          type: DataTypes.STRING(50),
          allowNull: false,
          field: 'parent_name',
          comment: '家长姓名'
        },
        childName: {
          type: DataTypes.STRING(50),
          allowNull: false,
          field: 'child_name',
          comment: '孩子姓名'
        },
        childAge: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'child_age',
          comment: '孩子年龄(月)'
        },
        childGender: {
          type: DataTypes.TINYINT,
          allowNull: false,
          field: 'child_gender',
          comment: '孩子性别 - 1:男 2:女'
        },
        contactPhone: {
          type: DataTypes.STRING(20),
          allowNull: false,
          field: 'contact_phone',
          comment: '联系电话'
        },
        contactAddress: {
          type: DataTypes.STRING(200),
          allowNull: true,
          field: 'contact_address',
          comment: '联系地址'
        },
        sourceChannel: {
          type: DataTypes.TINYINT,
          allowNull: false,
          field: 'source_channel',
          comment: '来源渠道 - 1:线上广告 2:线下活动 3:朋友介绍 4:电话咨询 5:自主访问 6:其他'
        },
        sourceDetail: {
          type: DataTypes.STRING(100),
          allowNull: true,
          field: 'source_detail',
          comment: '来源详情'
        },
        consultContent: {
          type: DataTypes.TEXT,
          allowNull: false,
          field: 'consult_content',
          comment: '咨询内容'
        },
        consultMethod: {
          type: DataTypes.TINYINT,
          allowNull: false,
          field: 'consult_method',
          comment: '咨询方式 - 1:电话 2:线下到访 3:线上咨询 4:微信 5:其他'
        },
        consultDate: {
          type: DataTypes.DATE,
          allowNull: false,
          field: 'consult_date',
          comment: '咨询日期'
        },
        intentionLevel: {
          type: DataTypes.TINYINT,
          allowNull: false,
          field: 'intention_level',
          comment: '意向级别 - 1:非常有意向 2:有意向 3:一般 4:较低 5:无意向'
        },
        followupStatus: {
          type: DataTypes.TINYINT,
          allowNull: false,
          defaultValue: 1,
          field: 'followup_status',
          comment: '跟进状态 - 1:待跟进 2:跟进中 3:已转化 4:已放弃'
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
        creatorId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'creator_id',
          comment: '创建人ID'
        },
        updaterId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: 'updater_id',
          comment: '更新人ID'
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
        tableName: 'enrollment_consultations',
        timestamps: true,
        paranoid: true,
        underscored: true,
      }
    );
  }

  static initAssociations(): void {
    this.belongsTo(Kindergarten, {
      foreignKey: 'kindergartenId',
      as: 'kindergarten'
    });
    this.belongsTo(User, {
      foreignKey: 'consultantId',
      as: 'consultant'
    });
    this.belongsTo(User, {
      foreignKey: 'creatorId',
      as: 'creator'
    });
    this.hasMany(EnrollmentConsultationFollowup, {
      sourceKey: 'id',
      foreignKey: 'consultationId',
      as: 'followups'
    });
  }
}

export default EnrollmentConsultation;
