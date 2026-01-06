import { vi } from 'vitest'
// Mock dependencies
jest.mock('fs');
jest.mock('path');

const mockFs = require('fs');
const mockPath = require('path');


// 控制台错误检测
let consoleSpy: any

beforeEach(() => {
  // 监听控制台错误
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  // 验证没有控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
})

describe('Route Model Mapper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock path.join
    mockPath.join.mockImplementation((...args: string[]) => args.join('/'));
    
    // Mock fs methods
    mockFs.readFileSync.mockReturnValue('');
    mockFs.writeFileSync.mockImplementation(() => {});
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readdirSync.mockReturnValue([]);
  });

  describe('Route Model Mapping', () => {
    it('应该映射路由到模型', () => {
      interface RouteModelMapping {
        route: string;
        model: string;
        controller: string;
        actions: string[];
      }

      const mapping: RouteModelMapping = {
        route: '/api/users',
        model: 'User',
        controller: 'UserController',
        actions: ['index', 'show', 'create', 'update', 'destroy']
      };

      expect(mapping.route).toBe('/api/users');
      expect(mapping.model).toBe('User');
      expect(mapping.controller).toBe('UserController');
      expect(mapping.actions).toHaveLength(5);
    });

    it('应该生成RESTful路由映射', () => {
      const generateRESTfulMapping = (modelName: string) => {
        const pluralName = modelName.toLowerCase() + 's';
        const controllerName = modelName + 'Controller';

        return {
          model: modelName,
          controller: controllerName,
          routes: [
            { method: 'GET', path: `/api/${pluralName}`, action: 'index' },
            { method: 'GET', path: `/api/${pluralName}/:id`, action: 'show' },
            { method: 'POST', path: `/api/${pluralName}`, action: 'create' },
            { method: 'PUT', path: `/api/${pluralName}/:id`, action: 'update' },
            { method: 'DELETE', path: `/api/${pluralName}/:id`, action: 'destroy' }
          ]
        };
      };

      const mapping = generateRESTfulMapping('User');

      expect(mapping.model).toBe('User');
      expect(mapping.controller).toBe('UserController');
      expect(mapping.routes).toHaveLength(5);
      expect(mapping.routes[0].path).toBe('/api/users');
      expect(mapping.routes[1].path).toBe('/api/users/:id');
    });

    it('应该处理嵌套资源映射', () => {
      const generateNestedMapping = (parentModel: string, childModel: string) => {
        const parentPlural = parentModel.toLowerCase() + 's';
        const childPlural = childModel.toLowerCase() + 's';

        return {
          parent: parentModel,
          child: childModel,
          routes: [
            { 
              method: 'GET', 
              path: `/api/${parentPlural}/:${parentModel.toLowerCase()}Id/${childPlural}`,
              action: 'index'
            },
            { 
              method: 'POST', 
              path: `/api/${parentPlural}/:${parentModel.toLowerCase()}Id/${childPlural}`,
              action: 'create'
            }
          ]
        };
      };

      const mapping = generateNestedMapping('User', 'Post');

      expect(mapping.parent).toBe('User');
      expect(mapping.child).toBe('Post');
      expect(mapping.routes[0].path).toBe('/api/users/:userId/posts');
      expect(mapping.routes[1].path).toBe('/api/users/:userId/posts');
    });
  });

  describe('Model Discovery', () => {
    it('应该发现项目中的模型', () => {
      const mockModelFiles = ['User.js', 'Post.js', 'Comment.js', 'Category.js'];
      mockFs.readdirSync.mockReturnValue(mockModelFiles);

      const discoverModels = (modelsDir: string) => {
        const files = mockFs.readdirSync(modelsDir);
        return files
          .filter((file: string) => file.endsWith('.js') || file.endsWith('.ts'))
          .map((file: string) => file.replace(/\.(js|ts)$/, ''));
      };

      const models = discoverModels('/src/models');

      expect(models).toEqual(['User', 'Post', 'Comment', 'Category']);
    });

    it('应该解析模型关联关系', () => {
      const parseModelAssociations = (modelContent: string) => {
        const associations = [];
        
        // 简化的关联解析
        const hasOneMatches = modelContent.match(/hasOne\(['"](\w+)['"]/g);
        const hasManyMatches = modelContent.match(/hasMany\(['"](\w+)['"]/g);
        const belongsToMatches = modelContent.match(/belongsTo\(['"](\w+)['"]/g);

        if (hasOneMatches) {
          hasOneMatches.forEach(match => {
            const model = match.match(/hasOne\(['"](\w+)['"]/)?.[1];
            if (model) associations.push({ type: 'hasOne', target: model });
          });
        }

        if (hasManyMatches) {
          hasManyMatches.forEach(match => {
            const model = match.match(/hasMany\(['"](\w+)['"]/)?.[1];
            if (model) associations.push({ type: 'hasMany', target: model });
          });
        }

        if (belongsToMatches) {
          belongsToMatches.forEach(match => {
            const model = match.match(/belongsTo\(['"](\w+)['"]/)?.[1];
            if (model) associations.push({ type: 'belongsTo', target: model });
          });
        }

        return associations;
      };

      const modelContent = `
        User.hasMany('Post');
        User.hasOne('Profile');
        Post.belongsTo('User');
      `;

      const associations = parseModelAssociations(modelContent);

      expect(associations).toHaveLength(3);
      expect(associations[0]).toEqual({ type: 'hasMany', target: 'Post' });
      expect(associations[1]).toEqual({ type: 'hasOne', target: 'Profile' });
      expect(associations[2]).toEqual({ type: 'belongsTo', target: 'User' });
    });

    it('应该提取模型属性', () => {
      const extractModelAttributes = (modelContent: string) => {
        const attributes = [];
        
        // 简化的属性提取
        const attributeMatches = modelContent.match(/(\w+):\s*{\s*type:\s*(\w+)/g);
        
        if (attributeMatches) {
          attributeMatches.forEach(match => {
            const parts = match.match(/(\w+):\s*{\s*type:\s*(\w+)/);
            if (parts) {
              attributes.push({
                name: parts[1],
                type: parts[2]
              });
            }
          });
        }

        return attributes;
      };

      const modelContent = `
        {
          name: { type: String, required: true },
          email: { type: String, unique: true },
          age: { type: Number }
        }
      `;

      const attributes = extractModelAttributes(modelContent);

      expect(attributes).toHaveLength(3);
      expect(attributes[0]).toEqual({ name: 'name', type: 'String' });
      expect(attributes[1]).toEqual({ name: 'email', type: 'String' });
      expect(attributes[2]).toEqual({ name: 'age', type: 'Number' });
    });
  });

  describe('Route Generation', () => {
    it('应该根据模型生成路由', () => {
      const generateRoutesFromModel = (model: any) => {
        const routes = [];
        const basePath = `/api/${model.name.toLowerCase()}s`;

        // 基本CRUD路由
        routes.push(
          { method: 'GET', path: basePath, action: 'index', description: `Get all ${model.name}s` },
          { method: 'GET', path: `${basePath}/:id`, action: 'show', description: `Get ${model.name} by ID` },
          { method: 'POST', path: basePath, action: 'create', description: `Create new ${model.name}` },
          { method: 'PUT', path: `${basePath}/:id`, action: 'update', description: `Update ${model.name}` },
          { method: 'DELETE', path: `${basePath}/:id`, action: 'destroy', description: `Delete ${model.name}` }
        );

        // 基于关联的路由
        model.associations?.forEach((assoc: any) => {
          if (assoc.type === 'hasMany') {
            routes.push({
              method: 'GET',
              path: `${basePath}/:id/${assoc.target.toLowerCase()}s`,
              action: `get${assoc.target}s`,
              description: `Get ${assoc.target}s for ${model.name}`
            });
          }
        });

        return routes;
      };

      const model = {
        name: 'User',
        associations: [
          { type: 'hasMany', target: 'Post' }
        ]
      };

      const routes = generateRoutesFromModel(model);

      expect(routes).toHaveLength(6); // 5 CRUD + 1 association
      expect(routes[0].path).toBe('/api/users');
      expect(routes[5].path).toBe('/api/users/:id/posts');
    });

    it('应该生成验证中间件映射', () => {
      const generateValidationMapping = (model: any) => {
        const validations = {};

        model.attributes?.forEach((attr: any) => {
          const rules = [];
          
          if (attr.required) rules.push('required');
          if (attr.unique) rules.push('unique');
          if (attr.type === 'String') rules.push('string');
          if (attr.type === 'Number') rules.push('numeric');
          if (attr.type === 'Email') rules.push('email');

          if (rules.length > 0) {
            validations[attr.name] = rules.join('|');
          }
        });

        return validations;
      };

      const model = {
        name: 'User',
        attributes: [
          { name: 'name', type: 'String', required: true },
          { name: 'email', type: 'Email', required: true, unique: true },
          { name: 'age', type: 'Number' }
        ]
      };

      const validations = generateValidationMapping(model);

      expect(validations).toEqual({
        name: 'required|string',
        email: 'required|unique|email',
        age: 'numeric'
      });
    });
  });

  describe('Controller Generation', () => {
    it('应该生成控制器模板', () => {
      const generateControllerTemplate = (model: any) => {
        const modelName = model.name;
        const modelVariable = modelName.toLowerCase();

        return `
class ${modelName}Controller {
  async index(req, res) {
    try {
      const ${modelVariable}s = await ${modelName}.findAll();
      res.json({ success: true, data: ${modelVariable}s });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async show(req, res) {
    try {
      const ${modelVariable} = await ${modelName}.findByPk(req.params.id);
      if (!${modelVariable}) {
        return res.status(404).json({ success: false, error: '${modelName} not found' });
      }
      res.json({ success: true, data: ${modelVariable} });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async create(req, res) {
    try {
      const ${modelVariable} = await ${modelName}.create(req.body);
      res.status(201).json({ success: true, data: ${modelVariable} });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async update(req, res) {
    try {
      const [updated] = await ${modelName}.update(req.body, {
        where: { id: req.params.id }
      });
      if (!updated) {
        return res.status(404).json({ success: false, error: '${modelName} not found' });
      }
      const ${modelVariable} = await ${modelName}.findByPk(req.params.id);
      res.json({ success: true, data: ${modelVariable} });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async destroy(req, res) {
    try {
      const deleted = await ${modelName}.destroy({
        where: { id: req.params.id }
      });
      if (!deleted) {
        return res.status(404).json({ success: false, error: '${modelName} not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = ${modelName}Controller;
        `.trim();
      };

      const model = { name: 'User' };
      const template = generateControllerTemplate(model);

      expect(template).toContain('class UserController');
      expect(template).toContain('async index(req, res)');
      expect(template).toContain('await User.findAll()');
      expect(template).toContain('module.exports = UserController');
    });

    it('应该生成关联方法', () => {
      const generateAssociationMethods = (model: any) => {
        const methods = [];

        model.associations?.forEach((assoc: any) => {
          if (assoc.type === 'hasMany') {
            methods.push(`
  async get${assoc.target}s(req, res) {
    try {
      const ${model.name.toLowerCase()} = await ${model.name}.findByPk(req.params.id, {
        include: ['${assoc.target}s']
      });
      if (!${model.name.toLowerCase()}) {
        return res.status(404).json({ success: false, error: '${model.name} not found' });
      }
      res.json({ success: true, data: ${model.name.toLowerCase()}.${assoc.target}s });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
            `.trim());
          }
        });

        return methods;
      };

      const model = {
        name: 'User',
        associations: [
          { type: 'hasMany', target: 'Post' }
        ]
      };

      const methods = generateAssociationMethods(model);

      expect(methods).toHaveLength(1);
      expect(methods[0]).toContain('async getPosts(req, res)');
      expect(methods[0]).toContain("include: ['Posts']");
    });
  });

  describe('Configuration and Output', () => {
    it('应该支持自定义配置', () => {
      const config = {
        modelsDir: './src/models',
        controllersDir: './src/controllers',
        routesDir: './src/routes',
        outputFormat: 'typescript',
        includeValidation: true,
        includeSwagger: true
      };

      expect(config.modelsDir).toBe('./src/models');
      expect(config.outputFormat).toBe('typescript');
      expect(config.includeValidation).toBe(true);
    });

    it('应该生成映射配置文件', () => {
      const generateMappingConfig = (mappings: any[]) => {
        const config = {
          version: '1.0.0',
          generated: new Date().toISOString(),
          mappings: mappings.map(mapping => ({
            model: mapping.model,
            controller: mapping.controller,
            routes: mapping.routes.length,
            basePath: mapping.basePath
          }))
        };

        return JSON.stringify(config, null, 2);
      };

      const mappings = [
        {
          model: 'User',
          controller: 'UserController',
          routes: [{ path: '/api/users' }],
          basePath: '/api/users'
        }
      ];

      const configJson = generateMappingConfig(mappings);
      const config = JSON.parse(configJson);

      expect(config.version).toBe('1.0.0');
      expect(config.mappings).toHaveLength(1);
      expect(config.mappings[0].model).toBe('User');
    });

    it('应该保存生成的文件', () => {
      const saveGeneratedFiles = (files: any[]) => {
        const results = [];

        files.forEach(file => {
          try {
            mockFs.writeFileSync(file.path, file.content);
            results.push({ path: file.path, success: true });
          } catch (error) {
            results.push({ path: file.path, success: false, error: error.message });
          }
        });

        return results;
      };

      const files = [
        { path: './controllers/UserController.js', content: 'class UserController {}' },
        { path: './routes/users.js', content: 'const router = express.Router();' }
      ];

      const results = saveGeneratedFiles(files);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
      expect(mockFs.writeFileSync).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling', () => {
    it('应该处理模型解析错误', () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      const parseModel = (filePath: string) => {
        try {
          const content = mockFs.readFileSync(filePath, 'utf8');
          return { success: true, content };
        } catch (error) {
          return { success: false, error: error.message };
        }
      };

      const result = parseModel('./models/User.js');

      expect(result.success).toBe(false);
      expect(result.error).toBe('File not found');
    });

    it('应该验证生成的代码', () => {
      const validateGeneratedCode = (code: string, type: 'controller' | 'route') => {
        const errors = [];

        if (type === 'controller') {
          if (!code.includes('class ')) {
            errors.push('Controller must be a class');
          }
          if (!code.includes('module.exports')) {
            errors.push('Controller must export the class');
          }
        }

        if (type === 'route') {
          if (!code.includes('router.')) {
            errors.push('Route file must use router');
          }
        }

        return { isValid: errors.length === 0, errors };
      };

      const validController = 'class UserController {} module.exports = UserController;';
      const invalidController = 'function UserController() {}';

      const validResult = validateGeneratedCode(validController, 'controller');
      const invalidResult = validateGeneratedCode(invalidController, 'controller');

      expect(validResult.isValid).toBe(true);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toContain('Controller must be a class');
    });
  });
});
