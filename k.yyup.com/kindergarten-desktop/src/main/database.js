const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

class DatabaseManager {
  constructor() {
    this.db = null;
    this.dbPath = null;
    this.initialized = false;
  }

  async init() {
    try {
      // 确保数据目录存在
      const userDataPath = app.getPath('userData');
      const dataDir = path.join(userDataPath, 'data');

      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // 数据库文件路径
      this.dbPath = path.join(dataDir, 'kindergarten.db');

      console.log('📁 数据库路径:', this.dbPath);

      // 连接数据库
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('❌ 数据库连接失败:', err.message);
          throw err;
        } else {
          console.log('✅ SQLite数据库连接成功');
        }
      });

      // 启用外键约束
      await this.run('PRAGMA foreign_keys = ON');

      // 创建表
      await this.createTables();

      // 初始化基础数据
      await this.seedData();

      this.initialized = true;
      console.log('✅ 数据库初始化完成');

    } catch (error) {
      console.error('❌ 数据库初始化失败:', error);
      throw error;
    }
  }

  async createTables() {
    console.log('🏗️ 创建数据表...');

    // 用户表
    await this.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100),
        phone VARCHAR(20),
        role ENUM('admin', 'teacher', 'parent', 'staff') DEFAULT 'staff',
        status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
        avatar_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 幼儿园表
    await this.run(`
      CREATE TABLE IF NOT EXISTS kindergartens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(200) NOT NULL,
        address TEXT,
        phone VARCHAR(20),
        email VARCHAR(100),
        principal_name VARCHAR(100),
        license_number VARCHAR(100),
        capacity INTEGER DEFAULT 100,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 班级表
    await this.run(`
      CREATE TABLE IF NOT EXISTS classes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kindergarten_id INTEGER,
        name VARCHAR(100) NOT NULL,
        type ENUM('nursery', 'k1', 'k2', 'k3', 'mixed') DEFAULT 'k1',
        capacity INTEGER DEFAULT 30,
        current_count INTEGER DEFAULT 0,
        teacher_id INTEGER,
        room_number VARCHAR(20),
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (kindergarten_id) REFERENCES kindergartens(id),
        FOREIGN KEY (teacher_id) REFERENCES users(id)
      )
    `);

    // 学生表
    await this.run(`
      CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kindergarten_id INTEGER,
        class_id INTEGER,
        student_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        gender ENUM('male', 'female'),
        birth_date DATE,
        id_number VARCHAR(50),
        admission_date DATE,
        graduation_date DATE,
        parent_id INTEGER,
        emergency_contact VARCHAR(100),
        emergency_phone VARCHAR(20),
        address TEXT,
        medical_info TEXT,
        photo_url TEXT,
        status ENUM('active', 'graduated', 'transferred') DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (kindergarten_id) REFERENCES kindergartens(id),
        FOREIGN KEY (class_id) REFERENCES classes(id),
        FOREIGN KEY (parent_id) REFERENCES users(id)
      )
    `);

    // 家长表
    await this.run(`
      CREATE TABLE IF NOT EXISTS parents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        student_ids TEXT, -- JSON数组存储多个学生ID
        relationship ENUM('father', 'mother', 'guardian', 'other'),
        occupation VARCHAR(100),
        work_phone VARCHAR(20),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // 教师表
    await this.run(`
      CREATE TABLE IF NOT EXISTS teachers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        kindergarten_id INTEGER,
        employee_id VARCHAR(50) UNIQUE NOT NULL,
        qualification VARCHAR(200),
        specialization VARCHAR(100),
        experience_years INTEGER DEFAULT 0,
        hire_date DATE,
        salary DECIMAL(10,2),
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (kindergarten_id) REFERENCES kindergartens(id)
      )
    `);

    // 考勤表
    await this.run(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        class_id INTEGER,
        date DATE NOT NULL,
        check_in_time DATETIME,
        check_out_time DATETIME,
        status ENUM('present', 'absent', 'late', 'sick_leave', 'personal_leave') DEFAULT 'present',
        notes TEXT,
        recorded_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id),
        FOREIGN KEY (class_id) REFERENCES classes(id),
        FOREIGN KEY (recorded_by) REFERENCES users(id)
      )
    `);

    // 活动表
    await this.run(`
      CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kindergarten_id INTEGER,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        type ENUM('academic', 'sports', 'art', 'music', 'field_trip', 'other') DEFAULT 'other',
        start_date DATETIME,
        end_date DATETIME,
        location VARCHAR(200),
        max_participants INTEGER,
        current_participants INTEGER DEFAULT 0,
        status ENUM('planned', 'ongoing', 'completed', 'cancelled') DEFAULT 'planned',
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (kindergarten_id) REFERENCES kindergartens(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);

    // 活动报名表
    await this.run(`
      CREATE TABLE IF NOT EXISTS activity_registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        activity_id INTEGER,
        student_id INTEGER,
        registered_by INTEGER,
        registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        status ENUM('registered', 'attended', 'cancelled') DEFAULT 'registered',
        notes TEXT,
        FOREIGN KEY (activity_id) REFERENCES activities(id),
        FOREIGN KEY (student_id) REFERENCES students(id),
        FOREIGN KEY (registered_by) REFERENCES users(id)
      )
    `);

    // 系统设置表
    await this.run(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key VARCHAR(100) UNIQUE NOT NULL,
        value TEXT,
        description TEXT,
        category VARCHAR(50) DEFAULT 'general',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 日志表
    await this.run(`
      CREATE TABLE IF NOT EXISTS system_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        action VARCHAR(100) NOT NULL,
        details TEXT,
        ip_address VARCHAR(45),
        user_agent TEXT,
        level ENUM('info', 'warning', 'error') DEFAULT 'info',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    console.log('✅ 数据表创建完成');
  }

  async seedData() {
    console.log('🌱 初始化基础数据...');

    // 检查是否已有管理员用户
    const adminUser = await this.get('SELECT COUNT(*) as count FROM users WHERE role = "admin"');

    if (adminUser.count === 0) {
      // 创建默认管理员
      const bcrypt = require('bcrypt');
      const adminPassword = await bcrypt.hash('123456', 10);

      await this.run(`
        INSERT INTO users (username, email, password_hash, full_name, role, status)
        VALUES ('admin', 'admin@kindergarten.com', ?, '系统管理员', 'admin', 'active')
      `, [adminPassword]);

      console.log('✅ 默认管理员账户创建完成 (admin/123456)');
    }

    // 初始化系统设置
    const settings = [
      ['app_name', '幼儿园管理系统', '应用名称', 'general'],
      ['app_version', '1.0.0', '应用版本', 'general'],
      ['default_page_size', '20', '默认分页大小', 'general'],
      ['session_timeout', '3600', '会话超时时间(秒)', 'security'],
      ['backup_enabled', 'true', '是否启用自动备份', 'backup'],
      ['backup_interval', '24', '备份间隔(小时)', 'backup']
    ];

    for (const [key, value, description, category] of settings) {
      await this.run(`
        INSERT OR IGNORE INTO system_settings (key, value, description, category)
        VALUES (?, ?, ?, ?)
      `, [key, value, description, category]);
    }

    console.log('✅ 基础数据初始化完成');
  }

  // 数据库操作辅助方法
  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  }

  async get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // 备份数据库
  async backup() {
    try {
      const userDataPath = app.getPath('userData');
      const backupDir = path.join(userDataPath, 'backups');

      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(backupDir, `kindergarten-backup-${timestamp}.db`);

      // 复制数据库文件
      fs.copyFileSync(this.dbPath, backupPath);

      console.log('✅ 数据库备份完成:', backupPath);
      return backupPath;

    } catch (error) {
      console.error('❌ 数据库备份失败:', error);
      throw error;
    }
  }

  // 恢复数据库
  async restore(backupPath) {
    try {
      if (!fs.existsSync(backupPath)) {
        throw new Error('备份文件不存在');
      }

      // 关闭当前数据库连接
      if (this.db) {
        this.db.close();
      }

      // 创建当前数据库的备份
      const currentBackup = await this.backup();

      // 复制备份文件到当前数据库路径
      fs.copyFileSync(backupPath, this.dbPath);

      // 重新连接数据库
      await this.init();

      console.log('✅ 数据库恢复完成');
      return { success: true, backupPath: currentBackup };

    } catch (error) {
      console.error('❌ 数据库恢复失败:', error);
      throw error;
    }
  }

  // 获取数据库统计信息
  async getStats() {
    try {
      const stats = {};

      // 获取各表的记录数
      const tables = ['users', 'students', 'classes', 'activities', 'attendance', 'system_logs'];

      for (const table of tables) {
        const result = await this.get(`SELECT COUNT(*) as count FROM ${table}`);
        stats[table] = result.count;
      }

      // 获取数据库文件大小
      const statsObj = fs.statSync(this.dbPath);
      stats.fileSize = statsObj.size;

      // 获取最后修改时间
      stats.lastModified = statsObj.mtime;

      return stats;

    } catch (error) {
      console.error('❌ 获取数据库统计失败:', error);
      throw error;
    }
  }

  async close() {
    if (this.db) {
      return new Promise((resolve) => {
        this.db.close((err) => {
          if (err) {
            console.error('❌ 数据库关闭失败:', err);
          } else {
            console.log('✅ 数据库连接已关闭');
          }
          resolve();
        });
      });
    }
  }
}

module.exports = { DatabaseManager };