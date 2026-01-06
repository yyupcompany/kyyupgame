import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../init';

interface SOPStageAttributes {
  id: number;
  name: string;
  description?: string;
  orderNum: number;
  keyPoints?: string[];
  expectedDuration?: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SOPStageCreationAttributes extends Optional<SOPStageAttributes, 'id'> {}

class SOPStage extends Model<SOPStageAttributes, SOPStageCreationAttributes> implements SOPStageAttributes {
  public id!: number;
  public name!: string;
  public description?: string;
  public orderNum!: number;
  public keyPoints?: string[];
  public expectedDuration?: number;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SOPStage.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    orderNum: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'order_num'
    },
    keyPoints: {
      type: DataTypes.JSON,
      field: 'key_points'
    },
    expectedDuration: {
      type: DataTypes.INTEGER,
      field: 'expected_duration'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    }
  },
  {
    sequelize,
    tableName: 'sop_stages',
    underscored: true,
    timestamps: true
  }
);

export default SOPStage;

