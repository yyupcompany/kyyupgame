import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../init';

interface SOPTaskAttributes {
  id: number;
  stageId: number;
  name: string;
  description?: string;
  isRequired: boolean;
  estimatedTime?: number;
  orderNum: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SOPTaskCreationAttributes extends Optional<SOPTaskAttributes, 'id'> {}

class SOPTask extends Model<SOPTaskAttributes, SOPTaskCreationAttributes> implements SOPTaskAttributes {
  public id!: number;
  public stageId!: number;
  public name!: string;
  public description?: string;
  public isRequired!: boolean;
  public estimatedTime?: number;
  public orderNum!: number;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SOPTask.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    stageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'stage_id'
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    isRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_required'
    },
    estimatedTime: {
      type: DataTypes.INTEGER,
      field: 'estimated_time'
    },
    orderNum: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'order_num'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    }
  },
  {
    sequelize,
    tableName: 'sop_tasks',
    underscored: true,
    timestamps: true
  }
);

export default SOPTask;

