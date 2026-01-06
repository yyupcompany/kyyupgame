import { Model, DataTypes, Optional, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { User } from './user.model';
import { Kindergarten } from './kindergarten.model';

export interface PerformanceRuleAttributes {
  id: number;
  name: string;
  description: string;
  calculationMethod: string;
  targetValue: number;
  bonusAmount: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  kindergartenId: number;
  creatorId: number;
  updaterId?: number;
}

interface PerformanceRuleCreationAttributes extends Optional<PerformanceRuleAttributes, 'id' | 'createdAt' | 'updatedAt' | 'updaterId'> {
  name: string;
  description: string;
  calculationMethod: string;
  targetValue: number;
  bonusAmount: number;
  startDate: Date;
  endDate: Date;
  kindergartenId: number;
  creatorId: number;
}

export class PerformanceRule extends Model<
  InferAttributes<PerformanceRule>,
  InferCreationAttributes<PerformanceRule>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare description: string;
  declare calculationMethod: string;
  declare targetValue: number;
  declare bonusAmount: number;
  declare startDate: Date;
  declare endDate: Date;
  declare isActive: CreationOptional<boolean>;
  
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  
  declare kindergartenId: number;
  declare creatorId: number;
  declare updaterId: number | null;
}

export const initPerformanceRule = (sequelize: Sequelize) => {
  PerformanceRule.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    calculationMethod: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    targetValue: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    bonusAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    kindergartenId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'kindergartens',
        key: 'id',
      },
    },
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    updaterId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
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
  }, {
    sequelize,
    tableName: 'performance_rules',
    timestamps: true,
    underscored: true,
  });

  return PerformanceRule;
};

// 关联关系
export function initPerformanceRuleAssociations() {
  PerformanceRule.belongsTo(Kindergarten, {
    foreignKey: 'kindergartenId',
    as: 'kindergarten',
  });

  PerformanceRule.belongsTo(User, {
    foreignKey: 'creatorId',
    as: 'creator',
  });

  PerformanceRule.belongsTo(User, {
    foreignKey: 'updaterId',
    as: 'updater',
  });
} 