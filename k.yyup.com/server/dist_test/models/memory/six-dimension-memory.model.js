"use strict";
/**
 * 六维记忆系统数据库模型
 * 基于Sequelize ORM实现的记忆持久化
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.MemoryModels = exports.initializeMemoryModels = exports.KnowledgeVaultModel = exports.ResourceMemoryModel = exports.ProceduralMemoryModel = exports.SemanticRelationshipModel = exports.SemanticMemoryModel = exports.EpisodicMemoryModel = exports.CoreMemoryModel = void 0;
var sequelize_1 = require("sequelize");
var CoreMemoryModel = /** @class */ (function (_super) {
    __extends(CoreMemoryModel, _super);
    function CoreMemoryModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return CoreMemoryModel;
}(sequelize_1.Model));
exports.CoreMemoryModel = CoreMemoryModel;
var EpisodicMemoryModel = /** @class */ (function (_super) {
    __extends(EpisodicMemoryModel, _super);
    function EpisodicMemoryModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return EpisodicMemoryModel;
}(sequelize_1.Model));
exports.EpisodicMemoryModel = EpisodicMemoryModel;
var SemanticMemoryModel = /** @class */ (function (_super) {
    __extends(SemanticMemoryModel, _super);
    function SemanticMemoryModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return SemanticMemoryModel;
}(sequelize_1.Model));
exports.SemanticMemoryModel = SemanticMemoryModel;
var SemanticRelationshipModel = /** @class */ (function (_super) {
    __extends(SemanticRelationshipModel, _super);
    function SemanticRelationshipModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return SemanticRelationshipModel;
}(sequelize_1.Model));
exports.SemanticRelationshipModel = SemanticRelationshipModel;
var ProceduralMemoryModel = /** @class */ (function (_super) {
    __extends(ProceduralMemoryModel, _super);
    function ProceduralMemoryModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ProceduralMemoryModel;
}(sequelize_1.Model));
exports.ProceduralMemoryModel = ProceduralMemoryModel;
var ResourceMemoryModel = /** @class */ (function (_super) {
    __extends(ResourceMemoryModel, _super);
    function ResourceMemoryModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ResourceMemoryModel;
}(sequelize_1.Model));
exports.ResourceMemoryModel = ResourceMemoryModel;
var KnowledgeVaultModel = /** @class */ (function (_super) {
    __extends(KnowledgeVaultModel, _super);
    function KnowledgeVaultModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return KnowledgeVaultModel;
}(sequelize_1.Model));
exports.KnowledgeVaultModel = KnowledgeVaultModel;
// ============= 模型初始化函数 =============
function initializeMemoryModels(sequelize) {
    // 1. 核心记忆
    CoreMemoryModel.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true
        },
        user_id: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        persona_value: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
            defaultValue: ''
        },
        persona_limit: {
            type: sequelize_1.DataTypes.INTEGER,
            defaultValue: 2000
        },
        human_value: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
            defaultValue: ''
        },
        human_limit: {
            type: sequelize_1.DataTypes.INTEGER,
            defaultValue: 2000
        },
        metadata: {
            type: sequelize_1.DataTypes.JSON,
            defaultValue: {}
        },
        created_at: {
            type: sequelize_1.DataTypes.DATE,
            defaultValue: sequelize_1.DataTypes.NOW
        },
        updated_at: {
            type: sequelize_1.DataTypes.DATE,
            defaultValue: sequelize_1.DataTypes.NOW
        }
    }, {
        sequelize: sequelize,
        modelName: 'CoreMemory',
        tableName: 'core_memories',
        timestamps: true,
        underscored: true
    });
    // 2. 情节记忆
    EpisodicMemoryModel.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true
        },
        user_id: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        event_type: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        summary: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false
        },
        details: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false
        },
        actor: {
            type: sequelize_1.DataTypes.ENUM('user', 'assistant', 'system'),
            allowNull: false
        },
        tree_path: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: false,
            defaultValue: []
        },
        occurred_at: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false
        },
        summary_embedding: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true
        },
        details_embedding: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true
        },
        metadata: {
            type: sequelize_1.DataTypes.JSON,
            defaultValue: {}
        },
        created_at: {
            type: sequelize_1.DataTypes.DATE,
            defaultValue: sequelize_1.DataTypes.NOW
        },
        updated_at: {
            type: sequelize_1.DataTypes.DATE,
            defaultValue: sequelize_1.DataTypes.NOW
        }
    }, {
        sequelize: sequelize,
        modelName: 'EpisodicMemory',
        tableName: 'episodic_memories',
        timestamps: true,
        underscored: true,
        indexes: [
            { fields: ['user_id', 'occurred_at'] },
            { fields: ['event_type'] },
        ]
    });
    // 3. 语义记忆
    SemanticMemoryModel.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true
        },
        user_id: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        name: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false
        },
        category: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        embedding: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true
        },
        metadata: {
            type: sequelize_1.DataTypes.JSON,
            defaultValue: {}
        },
        created_at: {
            type: sequelize_1.DataTypes.DATE,
            defaultValue: sequelize_1.DataTypes.NOW
        },
        updated_at: {
            type: sequelize_1.DataTypes.DATE,
            defaultValue: sequelize_1.DataTypes.NOW
        }
    }, {
        sequelize: sequelize,
        modelName: 'SemanticMemory',
        tableName: 'semantic_memories',
        timestamps: true,
        underscored: true
    });
    // 语义关系
    SemanticRelationshipModel.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true
        },
        source_id: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: SemanticMemoryModel,
                key: 'id'
            }
        },
        target_id: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: SemanticMemoryModel,
                key: 'id'
            }
        },
        relationship_type: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        strength: {
            type: sequelize_1.DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0.5
        },
        created_at: {
            type: sequelize_1.DataTypes.DATE,
            defaultValue: sequelize_1.DataTypes.NOW
        }
    }, {
        sequelize: sequelize,
        modelName: 'SemanticRelationship',
        tableName: 'semantic_relationships',
        timestamps: false,
        underscored: true,
        indexes: [
            { fields: ['source_id'] },
            { fields: ['target_id'] },
            { fields: ['relationship_type'] },
        ]
    });
    // 4. 过程记忆
    ProceduralMemoryModel.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true
        },
        user_id: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        procedure_name: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        step_number: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false
        },
        description: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false
        },
        conditions: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: false,
            defaultValue: []
        },
        actions: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: false,
            defaultValue: []
        },
        expected_results: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: false,
            defaultValue: []
        },
        metadata: {
            type: sequelize_1.DataTypes.JSON,
            defaultValue: {}
        },
        created_at: {
            type: sequelize_1.DataTypes.DATE,
            defaultValue: sequelize_1.DataTypes.NOW
        },
        updated_at: {
            type: sequelize_1.DataTypes.DATE,
            defaultValue: sequelize_1.DataTypes.NOW
        }
    }, {
        sequelize: sequelize,
        modelName: 'ProceduralMemory',
        tableName: 'procedural_memories',
        timestamps: true,
        underscored: true,
        indexes: [
            { fields: ['user_id', 'procedure_name', 'step_number'] },
        ]
    });
    // 5. 资源记忆
    ResourceMemoryModel.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true
        },
        user_id: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        resource_type: {
            type: sequelize_1.DataTypes.ENUM('file', 'url', 'image', 'document'),
            allowNull: false
        },
        name: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        location: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false
        },
        summary: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false
        },
        tags: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: false,
            defaultValue: []
        },
        accessed_at: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW
        },
        metadata: {
            type: sequelize_1.DataTypes.JSON,
            defaultValue: {}
        },
        created_at: {
            type: sequelize_1.DataTypes.DATE,
            defaultValue: sequelize_1.DataTypes.NOW
        },
        updated_at: {
            type: sequelize_1.DataTypes.DATE,
            defaultValue: sequelize_1.DataTypes.NOW
        }
    }, {
        sequelize: sequelize,
        modelName: 'ResourceMemory',
        tableName: 'resource_memories',
        timestamps: true,
        underscored: true,
        indexes: [
            { fields: ['resource_type'] },
            { fields: ['accessed_at'] },
        ]
    });
    // 6. 知识库
    KnowledgeVaultModel.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true
        },
        user_id: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        domain: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        topic: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        content: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false
        },
        source: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        confidence: {
            type: sequelize_1.DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0.5
        },
        embedding: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true
        },
        validated_at: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW
        },
        metadata: {
            type: sequelize_1.DataTypes.JSON,
            defaultValue: {}
        },
        created_at: {
            type: sequelize_1.DataTypes.DATE,
            defaultValue: sequelize_1.DataTypes.NOW
        },
        updated_at: {
            type: sequelize_1.DataTypes.DATE,
            defaultValue: sequelize_1.DataTypes.NOW
        }
    }, {
        sequelize: sequelize,
        modelName: 'KnowledgeVault',
        tableName: 'knowledge_vault',
        timestamps: true,
        underscored: true,
        indexes: [
            { fields: ['user_id', 'domain'] },
            { fields: ['confidence'] },
        ]
    });
    // 设置关联关系
    SemanticMemoryModel.hasMany(SemanticRelationshipModel, {
        foreignKey: 'source_id',
        as: 'relationships'
    });
    SemanticRelationshipModel.belongsTo(SemanticMemoryModel, {
        foreignKey: 'source_id',
        as: 'source'
    });
    SemanticRelationshipModel.belongsTo(SemanticMemoryModel, {
        foreignKey: 'target_id',
        as: 'target'
    });
}
exports.initializeMemoryModels = initializeMemoryModels;
// ============= 导出所有模型 =============
exports.MemoryModels = {
    CoreMemory: CoreMemoryModel,
    EpisodicMemory: EpisodicMemoryModel,
    SemanticMemory: SemanticMemoryModel,
    SemanticRelationship: SemanticRelationshipModel,
    ProceduralMemory: ProceduralMemoryModel,
    ResourceMemory: ResourceMemoryModel,
    KnowledgeVault: KnowledgeVaultModel
};
exports["default"] = exports.MemoryModels;
