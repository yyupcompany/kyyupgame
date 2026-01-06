import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../init';

interface CustomerSOPProgressAttributes {
  id: number;
  customerId: number;
  teacherId: number;
  currentStageId: number;
  stageProgress?: number;
  completedTasks?: number[];
  estimatedCloseDate?: Date;
  successProbability?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CustomerSOPProgressCreationAttributes extends Optional<CustomerSOPProgressAttributes, 'id'> {}

class CustomerSOPProgress extends Model<CustomerSOPProgressAttributes, CustomerSOPProgressCreationAttributes> 
  implements CustomerSOPProgressAttributes {
  public id!: number;
  public customerId!: number;
  public teacherId!: number;
  public currentStageId!: number;
  public stageProgress?: number;
  public completedTasks?: number[];
  public estimatedCloseDate?: Date;
  public successProbability?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CustomerSOPProgress.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'customer_id'
    },
    teacherId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'teacher_id'
    },
    currentStageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'current_stage_id'
    },
    stageProgress: {
      type: DataTypes.DECIMAL(5, 2),
      field: 'stage_progress'
    },
    completedTasks: {
      type: DataTypes.JSON,
      field: 'completed_tasks'
    },
    estimatedCloseDate: {
      type: DataTypes.DATE,
      field: 'estimated_close_date'
    },
    successProbability: {
      type: DataTypes.DECIMAL(5, 2),
      field: 'success_probability'
    }
  },
  {
    sequelize,
    tableName: 'customer_sop_progress',
    underscored: true,
    timestamps: true
  }
);

export default CustomerSOPProgress;

