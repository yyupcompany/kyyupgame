import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { AssessmentRecord } from './assessment-record.model';
import { Parent } from './parent.model';
import { Student } from './student.model';

/**
 * 成长追踪模型
 */
export class AssessmentGrowthTracking extends Model<
  InferAttributes<AssessmentGrowthTracking>,
  InferCreationAttributes<AssessmentGrowthTracking>
> {
  declare id: CreationOptional<number>;
  declare recordId: number;
  declare parentId?: number;
  declare studentId?: number;
  declare previousRecordId?: number;
  declare growthData?: any; // JSON格式
  declare readonly createdAt: CreationOptional<Date>;

  declare readonly record?: AssessmentRecord;
  declare readonly previousRecord?: AssessmentRecord;
  declare readonly parent?: Parent;
  declare readonly student?: Student;

  static initModel(sequelize: Sequelize): void {
    AssessmentGrowthTracking.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        recordId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'assessment_records',
            key: 'id',
          },
        },
        parentId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'parents',
            key: 'id',
          },
        },
        studentId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'students',
            key: 'id',
          },
        },
        previousRecordId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'assessment_records',
            key: 'id',
          },
        },
        growthData: {
          type: DataTypes.JSON,
          allowNull: true,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: 'assessment_growth_tracking',
        timestamps: false,
      }
    );
  }

  static associate(models: {
    AssessmentRecord: typeof AssessmentRecord;
    Parent: typeof Parent;
    Student: typeof Student;
  }): void {
    AssessmentGrowthTracking.belongsTo(models.AssessmentRecord, {
      foreignKey: 'recordId',
      as: 'record',
    });
    AssessmentGrowthTracking.belongsTo(models.AssessmentRecord, {
      foreignKey: 'previousRecordId',
      as: 'previousRecord',
    });
    AssessmentGrowthTracking.belongsTo(models.Parent, {
      foreignKey: 'parentId',
      as: 'parent',
    });
    AssessmentGrowthTracking.belongsTo(models.Student, {
      foreignKey: 'studentId',
      as: 'student',
    });
  }
}





