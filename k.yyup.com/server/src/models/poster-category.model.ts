import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

export interface PosterCategoryAttributes {
  id: number;
  name: string;
  code: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  sortOrder: number;
  status: number;
  parentId: number | null;
  level: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PosterCategoryCreationAttributes 
  extends Optional<PosterCategoryAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class PosterCategory extends Model<PosterCategoryAttributes, PosterCategoryCreationAttributes>
  implements PosterCategoryAttributes {
  public id!: number;
  public name!: string;
  public code!: string;
  public description!: string | null;
  public icon!: string | null;
  public color!: string | null;
  public sortOrder!: number;
  public status!: number;
  public parentId!: number | null;
  public level!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 关联属性
  public children?: PosterCategory[];
  public parent?: PosterCategory;

  static initModel(sequelize: Sequelize): void {
    PosterCategory.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        name: {
          type: DataTypes.STRING(50),
          allowNull: false,
          comment: '分类名称'
        },
        code: {
          type: DataTypes.STRING(30),
          allowNull: false,
          unique: true,
          comment: '分类代码'
        },
        description: {
          type: DataTypes.STRING(200),
          allowNull: true,
          comment: '分类描述'
        },
        icon: {
          type: DataTypes.STRING(50),
          allowNull: true,
          comment: '分类图标'
        },
        color: {
          type: DataTypes.STRING(20),
          allowNull: true,
          comment: '分类颜色'
        },
        sortOrder: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          comment: '排序',
          field: 'sort_order'
        },
        status: {
          type: DataTypes.TINYINT,
          allowNull: false,
          defaultValue: 1,
          comment: '状态：0-禁用，1-启用'
        },
        parentId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          comment: '父分类ID',
          field: 'parent_id'
        },
        level: {
          type: DataTypes.TINYINT,
          allowNull: false,
          defaultValue: 1,
          comment: '分类层级'
        },
        createdAt: {
          type: DataTypes.DATE,
          field: 'created_at',
        },
        updatedAt: {
          type: DataTypes.DATE,
          field: 'updated_at',
        }
      },
      {
        sequelize,
        tableName: 'poster_categories',
        timestamps: true,
        underscored: true,
      }
    );
  }

  static initAssociations(): void {
    // 自关联：父子分类关系
    this.hasMany(this, {
      foreignKey: 'parentId',
      as: 'children'
    });
    this.belongsTo(this, {
      foreignKey: 'parentId',
      as: 'parent'
    });
  }

  /**
   * 获取树形结构的分类数据
   */
  static async getCategoryTree(): Promise<PosterCategory[]> {
    const categories = await this.findAll({
      where: { status: 1 },
      order: [['level', 'ASC'], ['sortOrder', 'ASC']],
      include: [{
        model: this,
        as: 'children',
        where: { status: 1 },
        required: false,
        order: [['sortOrder', 'ASC']]
      }]
    });

    // 构建树形结构
    const rootCategories = categories.filter(cat => cat.level === 1);
    return rootCategories;
  }

  /**
   * 获取指定父分类下的子分类
   */
  static async getChildCategories(parentId: number): Promise<PosterCategory[]> {
    return this.findAll({
      where: { 
        parentId,
        status: 1 
      },
      order: [['sortOrder', 'ASC']]
    });
  }

  /**
   * 根据代码获取分类
   */
  static async getCategoryByCode(code: string): Promise<PosterCategory | null> {
    return this.findOne({
      where: { 
        code,
        status: 1 
      }
    });
  }
}

export default PosterCategory;
