import { TestDataFactory, DatabaseCleaner } from '../helpers/testUtils';

describe('Database Unit Tests', () => {
  describe('Database Connection Tests', () => {
    class MockConnection {
      private isConnected: boolean = false;
      private config: any;

      constructor(config: any) {
        this.config = config;
      }

      async connect() {
        if (!this.config.host || !this.config.database) {
          throw new Error('Database configuration is incomplete');
        }

        if (this.config.host === 'invalid_host') {
          throw new Error('ECONNREFUSED: Connection refused');
        }

        if (this.config.database === 'nonexistent_db') {
          throw new Error('Database does not exist');
        }

        this.isConnected = true;
        return { connectionId: Math.floor(Math.random() * 1000) };
      }

      async disconnect() {
        this.isConnected = false;
      }

      getConnectionStatus() {
        return this.isConnected;
      }

      async query(sql: string, params?: any[]) {
        if (!this.isConnected) {
          throw new Error('Database connection is not established');
        }

        // Mock query responses based on SQL
        if (sql.includes('SELECT 1')) {
          return { rows: [{ result: 1 }] };
        }

        if (sql.includes('SELECT COUNT(*)')) {
          return { rows: [{ count: 5 }] };
        }

        if (sql.includes('INSERT INTO')) {
          return { insertId: Math.floor(Math.random() * 1000), affectedRows: 1 };
        }

        if (sql.includes('UPDATE')) {
          return { affectedRows: 1 };
        }

        if (sql.includes('DELETE')) {
          return { affectedRows: 1 };
        }

        return { rows: [] };
      }
    }

    it('should connect to database successfully', async () => {
      const config = {
        host: 'localhost',
        port: 3306,
        database: 'test_db',
        username: 'root',
        password: 'password'
      };

      const connection = new MockConnection(config);
      const result = await connection.connect();

      expect(result).toHaveProperty('connectionId');
      expect(connection.getConnectionStatus()).toBe(true);
    });

    it('should fail with invalid configuration', async () => {
      const config = {
        host: '',
        database: ''
      };

      const connection = new MockConnection(config);

      await expect(connection.connect()).rejects.toThrow('Database configuration is incomplete');
    });

    it('should fail with connection refused', async () => {
      const config = {
        host: 'invalid_host',
        database: 'test_db'
      };

      const connection = new MockConnection(config);

      await expect(connection.connect()).rejects.toThrow('ECONNREFUSED: Connection refused');
    });

    it('should fail with nonexistent database', async () => {
      const config = {
        host: 'localhost',
        database: 'nonexistent_db'
      };

      const connection = new MockConnection(config);

      await expect(connection.connect()).rejects.toThrow('Database does not exist');
    });

    it('should disconnect successfully', async () => {
      const config = {
        host: 'localhost',
        database: 'test_db'
      };

      const connection = new MockConnection(config);
      await connection.connect();
      expect(connection.getConnectionStatus()).toBe(true);

      await connection.disconnect();
      expect(connection.getConnectionStatus()).toBe(false);
    });
  });

  describe('Model Definition Tests', () => {
    class MockModel {
      static tableName: string;
      static attributes: any;
      static associations: any[] = [];

      static define(tableName: string, attributes: any) {
        this.tableName = tableName;
        this.attributes = attributes;
        return this;
      }

      static hasMany(model: any, options?: any) {
        this.associations.push({ type: 'hasMany', model, options });
      }

      static belongsTo(model: any, options?: any) {
        this.associations.push({ type: 'belongsTo', model, options });
      }

      static belongsToMany(model: any, options: any) {
        this.associations.push({ type: 'belongsToMany', model, options });
      }

      static validate() {
        const errors: string[] = [];

        if (!this.tableName) {
          errors.push('Table name is required');
        }

        if (!this.attributes || Object.keys(this.attributes).length === 0) {
          errors.push('At least one attribute is required');
        }

        // Check for required primary key
        const hasId = this.attributes && this.attributes.id;
        if (!hasId) {
          errors.push('Primary key (id) is required');
        }

        return {
          isValid: errors.length === 0,
          errors
        };
      }
    }

    class MockUserModel extends MockModel {
      static {
        this.define('users', {
          id: {
            type: 'INTEGER',
            primaryKey: true,
            autoIncrement: true
          },
          username: {
            type: 'STRING',
            allowNull: false,
            unique: true
          },
          email: {
            type: 'STRING',
            allowNull: false,
            unique: true,
            validate: {
              isEmail: true
            }
          },
          password: {
            type: 'STRING',
            allowNull: false
          },
          role: {
            type: 'ENUM',
            values: ['admin', 'principal', 'teacher', 'parent'],
            defaultValue: 'parent'
          },
          createdAt: {
            type: 'DATE',
            allowNull: false
          },
          updatedAt: {
            type: 'DATE',
            allowNull: false
          }
        });
      }
    }

    class MockStudentModel extends MockModel {
      static {
        this.define('students', {
          id: {
            type: 'INTEGER',
            primaryKey: true,
            autoIncrement: true
          },
          name: {
            type: 'STRING',
            allowNull: false
          },
          gender: {
            type: 'ENUM',
            values: ['男', '女'],
            allowNull: false
          },
          birthDate: {
            type: 'DATE',
            allowNull: false
          },
          parentId: {
            type: 'INTEGER',
            allowNull: false,
            references: {
              model: 'users',
              key: 'id'
            }
          },
          classId: {
            type: 'INTEGER',
            allowNull: true,
            references: {
              model: 'classes',
              key: 'id'
            }
          }
        });

        this.belongsTo(MockUserModel, { as: 'parent', foreignKey: 'parentId' });
      }
    }

    it('should define User model correctly', () => {
      const validation = MockUserModel.validate();

      expect(validation.isValid).toBe(true);
      expect(MockUserModel.tableName).toBe('users');
      expect(MockUserModel.attributes).toHaveProperty('id');
      expect(MockUserModel.attributes).toHaveProperty('username');
      expect(MockUserModel.attributes).toHaveProperty('email');
      expect(MockUserModel.attributes).toHaveProperty('password');
      expect(MockUserModel.attributes).toHaveProperty('role');
    });

    it('should define Student model with associations', () => {
      const validation = MockStudentModel.validate();

      expect(validation.isValid).toBe(true);
      expect(MockStudentModel.tableName).toBe('students');
      expect(MockStudentModel.attributes).toHaveProperty('id');
      expect(MockStudentModel.attributes).toHaveProperty('name');
      expect(MockStudentModel.attributes).toHaveProperty('gender');
      expect(MockStudentModel.attributes).toHaveProperty('parentId');
      expect(MockStudentModel.associations).toHaveLength(1);
      expect(MockStudentModel.associations[0].type).toBe('belongsTo');
    });

    it('should validate model constraints', () => {
      class InvalidModel extends MockModel {
        static {
          this.define('', {}); // Invalid definition
        }
      }

      const validation = InvalidModel.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Table name is required');
      expect(validation.errors).toContain('At least one attribute is required');
      expect(validation.errors).toContain('Primary key (id) is required');
    });
  });

  describe('Database Query Tests', () => {
    class MockQueryBuilder {
      private tableName: string;
      private selectFields: string[] = ['*'];
      private whereConditions: any[] = [];
      private joinClauses: any[] = [];
      private orderByClause: string = '';
      private limitClause: number = 0;
      private offsetClause: number = 0;

      constructor(tableName: string) {
        this.tableName = tableName;
      }

      select(fields: string | string[]) {
        this.selectFields = Array.isArray(fields) ? fields : [fields];
        return this;
      }

      where(field: string, operator: string, value: any) {
        this.whereConditions.push({ field, operator, value });
        return this;
      }

      join(table: string, on: string) {
        this.joinClauses.push({ type: 'INNER JOIN', table, on });
        return this;
      }

      leftJoin(table: string, on: string) {
        this.joinClauses.push({ type: 'LEFT JOIN', table, on });
        return this;
      }

      orderBy(field: string, direction: 'ASC' | 'DESC' = 'ASC') {
        this.orderByClause = `${field} ${direction}`;
        return this;
      }

      limit(count: number) {
        this.limitClause = count;
        return this;
      }

      offset(count: number) {
        this.offsetClause = count;
        return this;
      }

      toSQL() {
        let sql = `SELECT ${this.selectFields.join(', ')} FROM ${this.tableName}`;

        if (this.joinClauses.length > 0) {
          sql += ' ' + this.joinClauses.map(join => `${join.type} ${join.table} ON ${join.on}`).join(' ');
        }

        if (this.whereConditions.length > 0) {
          const whereClause = this.whereConditions.map(condition => 
            `${condition.field} ${condition.operator} ${typeof condition.value === 'string' ? `'${condition.value}'` : condition.value}`
          ).join(' AND ');
          sql += ` WHERE ${whereClause}`;
        }

        if (this.orderByClause) {
          sql += ` ORDER BY ${this.orderByClause}`;
        }

        if (this.limitClause > 0) {
          sql += ` LIMIT ${this.limitClause}`;
        }

        if (this.offsetClause > 0) {
          sql += ` OFFSET ${this.offsetClause}`;
        }

        return sql;
      }

      async execute() {
        const sql = this.toSQL();
        
        // Mock query execution
        const mockResults = [];
        const recordCount = Math.min(this.limitClause || 10, 10);
        
        for (let i = 0; i < recordCount; i++) {
          mockResults.push({
            id: i + 1,
            name: `Record ${i + 1}`,
            createdAt: new Date().toISOString()
          });
        }

        return {
          sql,
          results: mockResults,
          rowCount: mockResults.length
        };
      }
    }

    it('should build SELECT query correctly', () => {
      const query = new MockQueryBuilder('users')
        .select(['id', 'name', 'email'])
        .where('status', '=', 'active')
        .orderBy('createdAt', 'DESC')
        .limit(10);

      const sql = query.toSQL();

      expect(sql).toBe("SELECT id, name, email FROM users WHERE status = 'active' ORDER BY createdAt DESC LIMIT 10");
    });

    it('should build JOIN query correctly', () => {
      const query = new MockQueryBuilder('students')
        .select(['students.name', 'users.email'])
        .join('users', 'students.parentId = users.id')
        .where('students.classId', '=', 1);

      const sql = query.toSQL();

      expect(sql).toBe("SELECT students.name, users.email FROM students INNER JOIN users ON students.parentId = users.id WHERE students.classId = 1");
    });

    it('should build complex query with multiple conditions', () => {
      const query = new MockQueryBuilder('activities')
        .select('*')
        .leftJoin('activity_registrations', 'activities.id = activity_registrations.activityId')
        .where('activities.status', '=', 'active')
        .where('activities.startTime', '>', '2023-01-01')
        .orderBy('activities.startTime', 'ASC')
        .limit(20)
        .offset(10);

      const sql = query.toSQL();

      expect(sql).toBe("SELECT * FROM activities LEFT JOIN activity_registrations ON activities.id = activity_registrations.activityId WHERE activities.status = 'active' AND activities.startTime > '2023-01-01' ORDER BY activities.startTime ASC LIMIT 20 OFFSET 10");
    });

    it('should execute query and return results', async () => {
      const query = new MockQueryBuilder('users')
        .select(['id', 'name'])
        .limit(5);

      const result = await query.execute();

      expect(result).toHaveProperty('sql');
      expect(result).toHaveProperty('results');
      expect(result).toHaveProperty('rowCount');
      expect(result.results).toHaveLength(5);
      expect(result.results[0]).toHaveProperty('id');
      expect(result.results[0]).toHaveProperty('name');
    });
  });

  describe('Database Transaction Tests', () => {
    class MockTransaction {
      private operations: any[] = [];
      private isCommitted: boolean = false;
      private isRolledBack: boolean = false;

      async begin() {
        this.operations = [];
        this.isCommitted = false;
        this.isRolledBack = false;
      }

      async insert(table: string, data: any) {
        if (this.isCommitted || this.isRolledBack) {
          throw new Error('Transaction is already finished');
        }

        this.operations.push({
          type: 'INSERT',
          table,
          data,
          id: Math.floor(Math.random() * 1000)
        });

        return { insertId: this.operations[this.operations.length - 1].id };
      }

      async update(table: string, data: any, where: any) {
        if (this.isCommitted || this.isRolledBack) {
          throw new Error('Transaction is already finished');
        }

        this.operations.push({
          type: 'UPDATE',
          table,
          data,
          where
        });

        return { affectedRows: 1 };
      }

      async delete(table: string, where: any) {
        if (this.isCommitted || this.isRolledBack) {
          throw new Error('Transaction is already finished');
        }

        this.operations.push({
          type: 'DELETE',
          table,
          where
        });

        return { affectedRows: 1 };
      }

      async commit() {
        if (this.isCommitted || this.isRolledBack) {
          throw new Error('Transaction is already finished');
        }

        // Simulate potential commit failure
        if (this.operations.some(op => op.data && op.data.forceError)) {
          throw new Error('Commit failed: constraint violation');
        }

        this.isCommitted = true;
        return { success: true, operationsCount: this.operations.length };
      }

      async rollback() {
        if (this.isCommitted || this.isRolledBack) {
          throw new Error('Transaction is already finished');
        }

        this.isRolledBack = true;
        this.operations = [];
        return { success: true };
      }

      getStatus() {
        if (this.isCommitted) return 'COMMITTED';
        if (this.isRolledBack) return 'ROLLED_BACK';
        return 'PENDING';
      }

      getOperations() {
        return this.operations;
      }
    }

    it('should execute transaction successfully', async () => {
      const transaction = new MockTransaction();
      await transaction.begin();

      const insertResult = await transaction.insert('users', {
        name: 'John Doe',
        email: 'john@example.com'
      });

      const updateResult = await transaction.update('users', {
        lastLogin: new Date()
      }, { id: insertResult.insertId });

      const commitResult = await transaction.commit();

      expect(insertResult).toHaveProperty('insertId');
      expect(updateResult.affectedRows).toBe(1);
      expect(commitResult.success).toBe(true);
      expect(commitResult.operationsCount).toBe(2);
      expect(transaction.getStatus()).toBe('COMMITTED');
    });

    it('should rollback transaction on error', async () => {
      const transaction = new MockTransaction();
      await transaction.begin();

      await transaction.insert('users', {
        name: 'Test User',
        email: 'test@example.com'
      });

      const rollbackResult = await transaction.rollback();

      expect(rollbackResult.success).toBe(true);
      expect(transaction.getStatus()).toBe('ROLLED_BACK');
      expect(transaction.getOperations()).toHaveLength(0);
    });

    it('should fail commit with constraint violation', async () => {
      const transaction = new MockTransaction();
      await transaction.begin();

      await transaction.insert('users', {
        name: 'Invalid User',
        email: 'invalid@example.com',
        forceError: true
      });

      await expect(transaction.commit()).rejects.toThrow('Commit failed: constraint violation');
      expect(transaction.getStatus()).toBe('PENDING');
    });

    it('should prevent operations on finished transaction', async () => {
      const transaction = new MockTransaction();
      await transaction.begin();

      await transaction.insert('users', {
        name: 'Test User',
        email: 'test@example.com'
      });

      await transaction.commit();

      await expect(transaction.insert('users', { name: 'Another User' }))
        .rejects.toThrow('Transaction is already finished');

      await expect(transaction.update('users', { name: 'Updated' }, { id: 1 }))
        .rejects.toThrow('Transaction is already finished');

      await expect(transaction.delete('users', { id: 1 }))
        .rejects.toThrow('Transaction is already finished');
    });
  });

  describe('Database Migration Tests', () => {
    class MockMigration {
      private version: string;
      private operations: any[] = [];

      constructor(version: string) {
        this.version = version;
      }

      createTable(tableName: string, columns: any) {
        this.operations.push({
          type: 'CREATE_TABLE',
          tableName,
          columns
        });
        return this;
      }

      dropTable(tableName: string) {
        this.operations.push({
          type: 'DROP_TABLE',
          tableName
        });
        return this;
      }

      addColumn(tableName: string, columnName: string, definition: any) {
        this.operations.push({
          type: 'ADD_COLUMN',
          tableName,
          columnName,
          definition
        });
        return this;
      }

      dropColumn(tableName: string, columnName: string) {
        this.operations.push({
          type: 'DROP_COLUMN',
          tableName,
          columnName
        });
        return this;
      }

      addIndex(tableName: string, columns: string[], options?: any) {
        this.operations.push({
          type: 'ADD_INDEX',
          tableName,
          columns,
          options
        });
        return this;
      }

      dropIndex(tableName: string, indexName: string) {
        this.operations.push({
          type: 'DROP_INDEX',
          tableName,
          indexName
        });
        return this;
      }

      async up() {
        // Execute all operations
        for (const operation of this.operations) {
          await this.executeOperation(operation);
        }
        return { success: true, version: this.version, operations: this.operations.length };
      }

      async down() {
        // Reverse all operations
        const reversedOperations = this.operations.slice().reverse();
        for (const operation of reversedOperations) {
          await this.executeReverseOperation(operation);
        }
        return { success: true, version: this.version, operations: reversedOperations.length };
      }

      private async executeOperation(operation: any) {
        // Mock operation execution
        switch (operation.type) {
          case 'CREATE_TABLE':
            if (!operation.tableName) {
              throw new Error('Table name is required for CREATE_TABLE');
            }
            break;
          case 'DROP_TABLE':
            if (!operation.tableName) {
              throw new Error('Table name is required for DROP_TABLE');
            }
            break;
          case 'ADD_COLUMN':
            if (!operation.tableName || !operation.columnName) {
              throw new Error('Table name and column name are required for ADD_COLUMN');
            }
            break;
          default:
            break;
        }
      }

      private async executeReverseOperation(operation: any) {
        // Mock reverse operation execution
        switch (operation.type) {
          case 'CREATE_TABLE':
            // Reverse: DROP_TABLE
            break;
          case 'DROP_TABLE':
            // Reverse: CREATE_TABLE (would need schema backup)
            break;
          case 'ADD_COLUMN':
            // Reverse: DROP_COLUMN
            break;
          case 'DROP_COLUMN':
            // Reverse: ADD_COLUMN (would need column definition backup)
            break;
          default:
            break;
        }
      }

      getOperations() {
        return this.operations;
      }

      getVersion() {
        return this.version;
      }
    }

    it('should create migration with table creation', async () => {
      const migration = new MockMigration('20231213_001_create_users_table');

      migration.createTable('users', {
        id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },
        username: { type: 'STRING', allowNull: false },
        email: { type: 'STRING', allowNull: false, unique: true },
        createdAt: { type: 'DATE', allowNull: false },
        updatedAt: { type: 'DATE', allowNull: false }
      });

      const result = await migration.up();

      expect(result.success).toBe(true);
      expect(result.version).toBe('20231213_001_create_users_table');
      expect(result.operations).toBe(1);
      expect(migration.getOperations()).toHaveLength(1);
      expect(migration.getOperations()[0].type).toBe('CREATE_TABLE');
    });

    it('should create migration with multiple operations', async () => {
      const migration = new MockMigration('20231213_002_modify_users_table');

      migration
        .addColumn('users', 'phone', { type: 'STRING', allowNull: true })
        .addColumn('users', 'avatar', { type: 'STRING', allowNull: true })
        .addIndex('users', ['email'], { unique: true })
        .addIndex('users', ['phone']);

      const result = await migration.up();

      expect(result.success).toBe(true);
      expect(result.operations).toBe(4);
      expect(migration.getOperations()).toHaveLength(4);
      expect(migration.getOperations().map(op => op.type)).toEqual([
        'ADD_COLUMN',
        'ADD_COLUMN',
        'ADD_INDEX',
        'ADD_INDEX'
      ]);
    });

    it('should rollback migration successfully', async () => {
      const migration = new MockMigration('20231213_003_test_rollback');

      migration
        .createTable('test_table', {
          id: { type: 'INTEGER', primaryKey: true }
        })
        .addColumn('users', 'test_column', { type: 'STRING' });

      await migration.up();
      expect(migration.getOperations()).toHaveLength(2);

      const rollbackResult = await migration.down();

      expect(rollbackResult.success).toBe(true);
      expect(rollbackResult.operations).toBe(2);
    });

    it('should fail migration with invalid operations', async () => {
      const migration = new MockMigration('20231213_004_invalid_migration');

      migration.createTable('', {}); // Invalid table name

      await expect(migration.up()).rejects.toThrow('Table name is required for CREATE_TABLE');
    });
  });

  describe('Database Performance Tests', () => {
    class MockPerformanceMonitor {
      private queryTimes: number[] = [];
      private connectionPool = {
        active: 0,
        idle: 0,
        total: 0
      };

      measureQuery(queryFn: () => Promise<any>) {
        return async () => {
          const startTime = Date.now();
          const result = await queryFn();
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          this.queryTimes.push(duration);
          return { result, duration };
        };
      }

      getAverageQueryTime() {
        if (this.queryTimes.length === 0) return 0;
        return this.queryTimes.reduce((sum, time) => sum + time, 0) / this.queryTimes.length;
      }

      getMaxQueryTime() {
        return Math.max(...this.queryTimes, 0);
      }

      getMinQueryTime() {
        if (this.queryTimes.length === 0) return 0;
        return Math.min(...this.queryTimes);
      }

      getSlowQueries(threshold: number = 1000) {
        return this.queryTimes.filter(time => time > threshold);
      }

      simulateConnectionPool(activeConnections: number, idleConnections: number) {
        this.connectionPool = {
          active: activeConnections,
          idle: idleConnections,
          total: activeConnections + idleConnections
        };
      }

      getConnectionPoolStatus() {
        return this.connectionPool;
      }

      getConnectionPoolUtilization() {
        const total = this.connectionPool.total;
        if (total === 0) return 0;
        return (this.connectionPool.active / total) * 100;
      }

      reset() {
        this.queryTimes = [];
        this.connectionPool = { active: 0, idle: 0, total: 0 };
      }
    }

    it('should measure query performance', async () => {
      const monitor = new MockPerformanceMonitor();

      const mockQuery = async () => {
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate 100ms query
        return { rows: [], count: 0 };
      };

      const measuredQuery = monitor.measureQuery(mockQuery);
      const result = await measuredQuery();

      expect(result.duration).toBeGreaterThanOrEqual(100);
      expect(result.result).toEqual({ rows: [], count: 0 });
      expect(monitor.getAverageQueryTime()).toBeGreaterThanOrEqual(100);
    });

    it('should track multiple query performances', async () => {
      const monitor = new MockPerformanceMonitor();

      const queries = [
        async () => { await new Promise(resolve => setTimeout(resolve, 50)); return {}; },
        async () => { await new Promise(resolve => setTimeout(resolve, 150)); return {}; },
        async () => { await new Promise(resolve => setTimeout(resolve, 100)); return {}; }
      ];

      for (const query of queries) {
        const measuredQuery = monitor.measureQuery(query);
        await measuredQuery();
      }

      expect(monitor.getAverageQueryTime()).toBeGreaterThan(0);
      expect(monitor.getMaxQueryTime()).toBeGreaterThanOrEqual(100);
      expect(monitor.getMinQueryTime()).toBeGreaterThan(0);
    });

    it('should identify slow queries', async () => {
      const monitor = new MockPerformanceMonitor();

      const fastQuery = async () => { await new Promise(resolve => setTimeout(resolve, 50)); return {}; };
      const slowQuery = async () => { await new Promise(resolve => setTimeout(resolve, 1200)); return {}; };

      await monitor.measureQuery(fastQuery)();
      await monitor.measureQuery(slowQuery)();

      const slowQueries = monitor.getSlowQueries(1000);
      expect(slowQueries).toHaveLength(1);
      expect(slowQueries[0]).toBeGreaterThanOrEqual(1200);
    });

    it('should monitor connection pool status', () => {
      const monitor = new MockPerformanceMonitor();

      monitor.simulateConnectionPool(8, 12);

      const status = monitor.getConnectionPoolStatus();
      expect(status.active).toBe(8);
      expect(status.idle).toBe(12);
      expect(status.total).toBe(20);

      const utilization = monitor.getConnectionPoolUtilization();
      expect(utilization).toBe(40); // 8/20 * 100
    });

    it('should handle empty performance data', () => {
      const monitor = new MockPerformanceMonitor();

      expect(monitor.getAverageQueryTime()).toBe(0);
      expect(monitor.getMaxQueryTime()).toBe(0);
      expect(monitor.getMinQueryTime()).toBe(0);
      expect(monitor.getSlowQueries()).toHaveLength(0);
    });

    it('should reset performance metrics', async () => {
      const monitor = new MockPerformanceMonitor();

      const mockQuery = async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return {};
      };

      await monitor.measureQuery(mockQuery)();
      monitor.simulateConnectionPool(5, 5);

      expect(monitor.getAverageQueryTime()).toBeGreaterThan(0);
      expect(monitor.getConnectionPoolStatus().total).toBe(10);

      monitor.reset();

      expect(monitor.getAverageQueryTime()).toBe(0);
      expect(monitor.getConnectionPoolStatus().total).toBe(0);
    });
  });
});