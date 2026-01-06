import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

// 检查类别枚举
export enum InspectionCategory {
  ANNUAL = 'annual',      // 年度检查
  SPECIAL = 'special',    // 专项检查
  ROUTINE = 'routine'     // 常态化督导
}

// 城市级别枚举
export enum CityLevel {
  TIER1 = 'tier1',       // 一线城市
  TIER2 = 'tier2',       // 二线城市
  TIER3 = 'tier3',       // 三线城市
  COUNTY = 'county',     // 县级
  TOWNSHIP = 'township'  // 乡镇
}

// 检查类型属性接口
export interface InspectionTypeAttributes {
  id: number;
  name: string;
  category: InspectionCategory;
  description?: string;
  department?: string;
  frequency?: string;
  duration?: number;
  cityLevel?: CityLevel;
  requiredDocuments?: string[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// 创建时的可选属性
interface InspectionTypeCreationAttributes extends Optional<InspectionTypeAttributes, 'id' | 'isActive'> {}

// 检查类型模型
class InspectionType extends Model<InspectionTypeAttributes, InspectionTypeCreationAttributes>
  implements InspectionTypeAttributes {
  public id!: number;
  public name!: string;
  public category!: InspectionCategory;
  public description?: string;
  public department?: string;
  public frequency?: string;
  public duration?: number;
  public cityLevel?: CityLevel;
  public requiredDocuments?: string[];
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 初始化模型
  static initModel(sequelize: Sequelize): void {
    InspectionType.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(100),
          allowNull: false,
          comment: '检查类型名称',
        },
        category: {
          type: DataTypes.ENUM(...Object.values(InspectionCategory)),
          allowNull: false,
          comment: '检查类别',
        },
        description: {
          type: DataTypes.TEXT,
          comment: '检查描述',
        },
        department: {
          type: DataTypes.STRING(200),
          comment: '检查部门',
        },
        frequency: {
          type: DataTypes.STRING(50),
          comment: '检查频次',
        },
        duration: {
          type: DataTypes.INTEGER,
          comment: '检查时长(天)',
        },
        cityLevel: {
          type: DataTypes.ENUM(...Object.values(CityLevel)),
          field: 'city_level',
          comment: '适用城市级别',
        },
        requiredDocuments: {
          type: DataTypes.JSON,
          field: 'required_documents',
          comment: '所需文档列表',
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          field: 'is_active',
          defaultValue: true,
          comment: '是否启用',
        },
      },
      {
        sequelize,
        tableName: 'inspection_types',
        underscored: true,
        timestamps: true,
        indexes: [
          { fields: ['category'] },
          { fields: ['city_level'] },
          { fields: ['is_active'] },
        ],
      }
    );
  }
}

export default InspectionType;

