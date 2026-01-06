/**
 * 六维记忆系统数据库模型
 * 基于Sequelize ORM实现的记忆持久化
 */

import { 
  Model, 
  DataTypes, 
  Sequelize,
  Optional,
  ModelStatic,
  Association
} from 'sequelize';

// ============= 1. 核心记忆模型 =============

interface CoreMemoryAttributes {
  id: string;
  user_id: string;
  persona_value: string;
  persona_limit: number;
  human_value: string;
  human_limit: number;
  metadata: any;
  created_at: Date;
  updated_at: Date;
}

interface CoreMemoryCreationAttributes extends Optional<CoreMemoryAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class CoreMemoryModel extends Model<CoreMemoryAttributes, CoreMemoryCreationAttributes> 
  implements CoreMemoryAttributes {
  public id!: string;
  public user_id!: string;
  public persona_value!: string;
  public persona_limit!: number;
  public human_value!: string;
  public human_limit!: number;
  public metadata!: any;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// ============= 2. 情节记忆模型 =============

interface EpisodicMemoryAttributes {
  id: string;
  user_id: string;
  event_type: string;
  summary: string;
  details: string;
  actor: 'user' | 'assistant' | 'system';
  tree_path: string[];
  occurred_at: Date;
  summary_embedding?: number[];
  details_embedding?: number[];
  metadata: any;
  created_at: Date;
  updated_at: Date;
}

interface EpisodicMemoryCreationAttributes extends Optional<EpisodicMemoryAttributes, 
  'id' | 'summary_embedding' | 'details_embedding' | 'created_at' | 'updated_at'> {}

export class EpisodicMemoryModel extends Model<EpisodicMemoryAttributes, EpisodicMemoryCreationAttributes>
  implements EpisodicMemoryAttributes {
  public id!: string;
  public user_id!: string;
  public event_type!: string;
  public summary!: string;
  public details!: string;
  public actor!: 'user' | 'assistant' | 'system';
  public tree_path!: string[];
  public occurred_at!: Date;
  public summary_embedding?: number[];
  public details_embedding?: number[];
  public metadata!: any;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// ============= 3. 语义记忆模型 =============

interface SemanticMemoryAttributes {
  id: string;
  user_id: string;
  name: string;
  description: string;
  category: string;
  embedding?: number[];
  metadata: any;
  created_at: Date;
  updated_at: Date;
}

interface SemanticMemoryCreationAttributes extends Optional<SemanticMemoryAttributes, 
  'id' | 'embedding' | 'created_at' | 'updated_at'> {}

export class SemanticMemoryModel extends Model<SemanticMemoryAttributes, SemanticMemoryCreationAttributes>
  implements SemanticMemoryAttributes {
  public id!: string;
  public user_id!: string;
  public name!: string;
  public description!: string;
  public category!: string;
  public embedding?: number[];
  public metadata!: any;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // 关联
  public readonly relationships?: SemanticRelationshipModel[];

  public static associations: {
    relationships: Association<SemanticMemoryModel, SemanticRelationshipModel>;
  };
}

// 语义关系模型
interface SemanticRelationshipAttributes {
  id: string;
  source_id: string;
  target_id: string;
  relationship_type: string;
  strength: number;
  created_at: Date;
}

interface SemanticRelationshipCreationAttributes extends Optional<SemanticRelationshipAttributes, 
  'id' | 'created_at'> {}

export class SemanticRelationshipModel extends Model<SemanticRelationshipAttributes, SemanticRelationshipCreationAttributes>
  implements SemanticRelationshipAttributes {
  public id!: string;
  public source_id!: string;
  public target_id!: string;
  public relationship_type!: string;
  public strength!: number;
  public readonly created_at!: Date;
}

// ============= 4. 过程记忆模型 =============

interface ProceduralMemoryAttributes {
  id: string;
  user_id: string;
  procedure_name: string;
  step_number: number;
  description: string;
  conditions: string[];
  actions: string[];
  expected_results: string[];
  metadata: any;
  created_at: Date;
  updated_at: Date;
}

interface ProceduralMemoryCreationAttributes extends Optional<ProceduralMemoryAttributes, 
  'id' | 'created_at' | 'updated_at'> {}

export class ProceduralMemoryModel extends Model<ProceduralMemoryAttributes, ProceduralMemoryCreationAttributes>
  implements ProceduralMemoryAttributes {
  public id!: string;
  public user_id!: string;
  public procedure_name!: string;
  public step_number!: number;
  public description!: string;
  public conditions!: string[];
  public actions!: string[];
  public expected_results!: string[];
  public metadata!: any;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// ============= 5. 资源记忆模型 =============

interface ResourceMemoryAttributes {
  id: string;
  user_id: string;
  resource_type: 'file' | 'url' | 'image' | 'document';
  name: string;
  location: string;
  summary: string;
  tags: string[];
  accessed_at: Date;
  metadata: any;
  created_at: Date;
  updated_at: Date;
}

interface ResourceMemoryCreationAttributes extends Optional<ResourceMemoryAttributes, 
  'id' | 'created_at' | 'updated_at'> {}

export class ResourceMemoryModel extends Model<ResourceMemoryAttributes, ResourceMemoryCreationAttributes>
  implements ResourceMemoryAttributes {
  public id!: string;
  public user_id!: string;
  public resource_type!: 'file' | 'url' | 'image' | 'document';
  public name!: string;
  public location!: string;
  public summary!: string;
  public tags!: string[];
  public accessed_at!: Date;
  public metadata!: any;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// ============= 6. 知识库模型 =============

interface KnowledgeVaultAttributes {
  id: string;
  user_id: string;
  domain: string;
  topic: string;
  content: string;
  source: string;
  confidence: number;
  embedding?: number[];
  validated_at: Date;
  metadata: any;
  created_at: Date;
  updated_at: Date;
}

interface KnowledgeVaultCreationAttributes extends Optional<KnowledgeVaultAttributes, 
  'id' | 'embedding' | 'created_at' | 'updated_at'> {}

export class KnowledgeVaultModel extends Model<KnowledgeVaultAttributes, KnowledgeVaultCreationAttributes>
  implements KnowledgeVaultAttributes {
  public id!: string;
  public user_id!: string;
  public domain!: string;
  public topic!: string;
  public content!: string;
  public source!: string;
  public confidence!: number;
  public embedding?: number[];
  public validated_at!: Date;
  public metadata!: any;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// ============= 模型初始化函数 =============

export function initializeMemoryModels(sequelize: Sequelize): void {
  // 1. 核心记忆
  CoreMemoryModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.STRING,
        allowNull: false,

      },
      persona_value: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
      },
      persona_limit: {
        type: DataTypes.INTEGER,
        defaultValue: 2000,
      },
      human_value: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '',
      },
      human_limit: {
        type: DataTypes.INTEGER,
        defaultValue: 2000,
      },
      metadata: {
        type: DataTypes.JSON,
        defaultValue: {},
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'CoreMemory',
      tableName: 'core_memories',
      timestamps: true,
      underscored: true,
    }
  );

  // 2. 情节记忆
  EpisodicMemoryModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.STRING,
        allowNull: false,

      },
      event_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      summary: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      details: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      actor: {
        type: DataTypes.ENUM('user', 'assistant', 'system'),
        allowNull: false,
      },
      tree_path: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
      },
      occurred_at: {
        type: DataTypes.DATE,
        allowNull: false,

      },
      summary_embedding: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      details_embedding: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSON,
        defaultValue: {},
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'EpisodicMemory',
      tableName: 'episodic_memories',
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ['user_id', 'occurred_at'] },
        { fields: ['event_type'] },
      ],
    }
  );

  // 3. 语义记忆
  SemanticMemoryModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.STRING,
        allowNull: false,

      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,

      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,

      },
      embedding: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSON,
        defaultValue: {},
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'SemanticMemory',
      tableName: 'semantic_memories',
      timestamps: true,
      underscored: true,
    }
  );

  // 语义关系
  SemanticRelationshipModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      source_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: SemanticMemoryModel,
          key: 'id',
        },
      },
      target_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: SemanticMemoryModel,
          key: 'id',
        },
      },
      relationship_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      strength: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.5,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'SemanticRelationship',
      tableName: 'semantic_relationships',
      timestamps: false,
      underscored: true,
      indexes: [
        { fields: ['source_id'] },
        { fields: ['target_id'] },
        { fields: ['relationship_type'] },
      ],
    }
  );

  // 4. 过程记忆
  ProceduralMemoryModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.STRING,
        allowNull: false,

      },
      procedure_name: {
        type: DataTypes.STRING,
        allowNull: false,

      },
      step_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      conditions: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
      },
      actions: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
      },
      expected_results: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
      },
      metadata: {
        type: DataTypes.JSON,
        defaultValue: {},
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'ProceduralMemory',
      tableName: 'procedural_memories',
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ['user_id', 'procedure_name', 'step_number'] },
      ],
    }
  );

  // 5. 资源记忆
  ResourceMemoryModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.STRING,
        allowNull: false,

      },
      resource_type: {
        type: DataTypes.ENUM('file', 'url', 'image', 'document'),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,

      },
      location: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      summary: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      tags: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
      },
      accessed_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      metadata: {
        type: DataTypes.JSON,
        defaultValue: {},
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'ResourceMemory',
      tableName: 'resource_memories',
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ['resource_type'] },
        { fields: ['accessed_at'] },
      ],
    }
  );

  // 6. 知识库
  KnowledgeVaultModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.STRING,
        allowNull: false,

      },
      domain: {
        type: DataTypes.STRING,
        allowNull: false,

      },
      topic: {
        type: DataTypes.STRING,
        allowNull: false,

      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      source: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      confidence: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.5,
      },
      embedding: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      validated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      metadata: {
        type: DataTypes.JSON,
        defaultValue: {},
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'KnowledgeVault',
      tableName: 'knowledge_vault',
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ['user_id', 'domain'] },
        { fields: ['confidence'] },
      ],
    }
  );

  // 设置关联关系
  SemanticMemoryModel.hasMany(SemanticRelationshipModel, {
    foreignKey: 'source_id',
    as: 'relationships',
  });

  SemanticRelationshipModel.belongsTo(SemanticMemoryModel, {
    foreignKey: 'source_id',
    as: 'source',
  });

  SemanticRelationshipModel.belongsTo(SemanticMemoryModel, {
    foreignKey: 'target_id',
    as: 'target',
  });
}

// ============= 导出所有模型 =============

export const MemoryModels = {
  CoreMemory: CoreMemoryModel,
  EpisodicMemory: EpisodicMemoryModel,
  SemanticMemory: SemanticMemoryModel,
  SemanticRelationship: SemanticRelationshipModel,
  ProceduralMemory: ProceduralMemoryModel,
  ResourceMemory: ResourceMemoryModel,
  KnowledgeVault: KnowledgeVaultModel,
};

export default MemoryModels;