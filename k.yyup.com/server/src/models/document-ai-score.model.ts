import { Model, DataTypes, Sequelize } from 'sequelize';

export class DocumentAIScore extends Model {
  public id!: number;
  public documentInstanceId!: number;
  public documentTemplateId!: number;
  public templateType!: string;
  public templateName?: string;
  public promptVersion!: string;
  public aiModel!: string;
  public score?: number;
  public grade?: 'excellent' | 'good' | 'average' | 'poor' | 'unqualified';
  public analysisResult!: any;
  public categoryScores?: any;
  public suggestions?: string[];
  public risks?: any[];
  public highlights?: string[];
  public processingTime!: number;
  public status!: 'completed' | 'failed';
  public errorMessage?: string;
  public createdBy!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initModel(sequelize: Sequelize): typeof DocumentAIScore {
    DocumentAIScore.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        documentInstanceId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'document_instance_id'
        },
        documentTemplateId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'document_template_id'
        },
        templateType: {
          type: DataTypes.STRING(100),
          allowNull: false,
          field: 'template_type'
        },
        templateName: {
          type: DataTypes.STRING(200),
          allowNull: true,
          field: 'template_name'
        },
        promptVersion: {
          type: DataTypes.STRING(50),
          allowNull: false,
          defaultValue: 'v1.0',
          field: 'prompt_version'
        },
        aiModel: {
          type: DataTypes.STRING(100),
          allowNull: false,
          defaultValue: 'doubao-1.6-flash',
          field: 'ai_model'
        },
        score: {
          type: DataTypes.DECIMAL(5, 2),
          allowNull: true
        },
        grade: {
          type: DataTypes.ENUM('excellent', 'good', 'average', 'poor', 'unqualified'),
          allowNull: true
        },
        analysisResult: {
          type: DataTypes.JSON,
          allowNull: false,
          field: 'analysis_result'
        },
        categoryScores: {
          type: DataTypes.JSON,
          allowNull: true,
          field: 'category_scores'
        },
        suggestions: {
          type: DataTypes.JSON,
          allowNull: true
        },
        risks: {
          type: DataTypes.JSON,
          allowNull: true
        },
        highlights: {
          type: DataTypes.JSON,
          allowNull: true
        },
        processingTime: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          field: 'processing_time'
        },
        status: {
          type: DataTypes.ENUM('completed', 'failed'),
          allowNull: false,
          defaultValue: 'completed'
        },
        errorMessage: {
          type: DataTypes.TEXT,
          allowNull: true,
          field: 'error_message'
        },
        createdBy: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: 'created_by'
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field: 'created_at'
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field: 'updated_at'
        }
      },
      {
        sequelize,
        tableName: 'document_ai_scores',
        timestamps: true,
        underscored: true
      }
    );

    return DocumentAIScore;
  }
}

