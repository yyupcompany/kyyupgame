import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional
} from 'sequelize';

/**
 * 话术模板模型
 */
export default class ScriptTemplate extends Model<
  InferAttributes<ScriptTemplate>,
  InferCreationAttributes<ScriptTemplate>
> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare content: string;
  declare category: string;
  declare keywords: string | null;
  declare status: CreationOptional<'active' | 'inactive'>;
  declare priority: CreationOptional<number>;
  declare usageCount: CreationOptional<number>;
  declare successRate?: number;

  getKeywordsArray(): string[] {
    if (!this.keywords) return [];
    return this.keywords
      .split(',')
      .map(keyword => keyword.trim())
      .filter(Boolean);
  }

  async incrementUsage(): Promise<void> {
    await this.increment('usageCount', { by: 1 });
  }

  async updateSuccessRate(_isSuccess: boolean): Promise<void> {
    const hasSuccessRate = (this.constructor as typeof ScriptTemplate).rawAttributes?.successRate;
    if (!hasSuccessRate) return;
    const current = this.successRate ?? 0;
    const next = _isSuccess ? Math.min(100, current + 1) : Math.max(0, current - 1);
    await this.update({ successRate: next });
  }

  static initModel(sequelize: Sequelize): typeof ScriptTemplate {
    ScriptTemplate.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true
        },
        title: {
          type: DataTypes.STRING(255),
          allowNull: false
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: false
        },
        category: {
          type: DataTypes.STRING(100),
          allowNull: false
        },
        keywords: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        status: {
          type: DataTypes.ENUM('active', 'inactive'),
          allowNull: false,
          defaultValue: 'active'
        },
        priority: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        usageCount: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0
        }
      },
      {
        sequelize,
        tableName: 'script_templates',
        timestamps: true,
        underscored: true
      }
    );

    return ScriptTemplate;
  }
}
