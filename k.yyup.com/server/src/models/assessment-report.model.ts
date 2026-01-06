import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { AssessmentRecord } from './assessment-record.model';

/**
 * 测评报告模型
 */
export class AssessmentReport extends Model<
  InferAttributes<AssessmentReport>,
  InferCreationAttributes<AssessmentReport>
> {
  declare id: CreationOptional<number>;
  declare recordId: number;
  declare reportNo: string;
  declare content: any; // JSON格式
  declare aiGenerated: boolean;
  declare screenshotUrl?: string;
  declare qrCodeUrl?: string;
  declare shareUrl?: string;
  declare viewCount: number;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  declare readonly record?: AssessmentRecord;

  static initModel(sequelize: Sequelize): void {
    AssessmentReport.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        recordId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          unique: true,
          references: {
            model: 'assessment_records',
            key: 'id',
          },
        },
        reportNo: {
          type: DataTypes.STRING(50),
          allowNull: false,
          unique: true,
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        aiGenerated: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        screenshotUrl: {
          type: DataTypes.STRING(500),
          allowNull: true,
        },
        qrCodeUrl: {
          type: DataTypes.STRING(500),
          allowNull: true,
        },
        shareUrl: {
          type: DataTypes.STRING(500),
          allowNull: true,
        },
        viewCount: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
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
        tableName: 'assessment_reports',
        timestamps: true,
      }
    );
  }

  static associate(models: {
    AssessmentRecord: typeof AssessmentRecord;
  }): void {
    AssessmentReport.belongsTo(models.AssessmentRecord, {
      foreignKey: 'recordId',
      as: 'record',
    });
  }
}







// 为了兼容旧代码，添加默认导出
export default AssessmentReport;