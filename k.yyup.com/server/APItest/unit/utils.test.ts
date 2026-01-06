import { TestDataFactory } from '../helpers/testUtils';

describe('Utility Functions Unit Tests', () => {
  describe('Date Utilities', () => {
    class DateUtils {
      static formatDate(date: Date, format: string = 'YYYY-MM-DD'): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return format
          .replace('YYYY', String(year))
          .replace('MM', month)
          .replace('DD', day)
          .replace('HH', hours)
          .replace('mm', minutes)
          .replace('ss', seconds);
      }

      static parseDate(dateString: string): Date {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date string');
        }
        return date;
      }

      static addDays(date: Date, days: number): Date {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
      }

      static subtractDays(date: Date, days: number): Date {
        return this.addDays(date, -days);
      }

      static getDaysBetween(startDate: Date, endDate: Date): number {
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      static isWeekend(date: Date): boolean {
        const day = date.getDay();
        return day === 0 || day === 6; // Sunday = 0, Saturday = 6
      }

      static getAge(birthDate: Date, referenceDate: Date = new Date()): number {
        let age = referenceDate.getFullYear() - birthDate.getFullYear();
        const monthDiff = referenceDate.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < birthDate.getDate())) {
          age--;
        }
        
        return age;
      }

      static isBusinessDay(date: Date): boolean {
        return !this.isWeekend(date);
      }

      static getNextBusinessDay(date: Date): Date {
        let nextDay = this.addDays(date, 1);
        while (this.isWeekend(nextDay)) {
          nextDay = this.addDays(nextDay, 1);
        }
        return nextDay;
      }
    }

    it('should format date correctly', () => {
      const date = new Date('2023-12-13T14:30:45');

      expect(DateUtils.formatDate(date, 'YYYY-MM-DD')).toBe('2023-12-13');
      expect(DateUtils.formatDate(date, 'DD/MM/YYYY')).toBe('13/12/2023');
      expect(DateUtils.formatDate(date, 'YYYY-MM-DD HH:mm:ss')).toBe('2023-12-13 14:30:45');
    });

    it('should parse date string correctly', () => {
      const dateString = '2023-12-13';
      const parsed = DateUtils.parseDate(dateString);

      expect(parsed.getFullYear()).toBe(2023);
      expect(parsed.getMonth()).toBe(11); // December = 11
      expect(parsed.getDate()).toBe(13);
    });

    it('should throw error for invalid date string', () => {
      expect(() => DateUtils.parseDate('invalid-date')).toThrow('Invalid date string');
      expect(() => DateUtils.parseDate('')).toThrow('Invalid date string');
    });

    it('should add days correctly', () => {
      const date = new Date('2023-12-13');
      const result = DateUtils.addDays(date, 5);

      expect(result.getDate()).toBe(18);
      expect(result.getMonth()).toBe(11); // December
    });

    it('should subtract days correctly', () => {
      const date = new Date('2023-12-13');
      const result = DateUtils.subtractDays(date, 5);

      expect(result.getDate()).toBe(8);
      expect(result.getMonth()).toBe(11); // December
    });

    it('should calculate days between dates', () => {
      const startDate = new Date('2023-12-01');
      const endDate = new Date('2023-12-13');

      expect(DateUtils.getDaysBetween(startDate, endDate)).toBe(12);
    });

    it('should identify weekend days', () => {
      const saturday = new Date('2023-12-16'); // Saturday
      const sunday = new Date('2023-12-17'); // Sunday
      const monday = new Date('2023-12-18'); // Monday

      expect(DateUtils.isWeekend(saturday)).toBe(true);
      expect(DateUtils.isWeekend(sunday)).toBe(true);
      expect(DateUtils.isWeekend(monday)).toBe(false);
    });

    it('should calculate age correctly', () => {
      const birthDate = new Date('2020-06-15');
      const referenceDate = new Date('2023-12-13');

      expect(DateUtils.getAge(birthDate, referenceDate)).toBe(3);
    });

    it('should calculate age before birthday', () => {
      const birthDate = new Date('2020-12-25');
      const referenceDate = new Date('2023-12-13'); // Before birthday

      expect(DateUtils.getAge(birthDate, referenceDate)).toBe(2);
    });

    it('should identify business days', () => {
      const saturday = new Date('2023-12-16');
      const monday = new Date('2023-12-18');

      expect(DateUtils.isBusinessDay(saturday)).toBe(false);
      expect(DateUtils.isBusinessDay(monday)).toBe(true);
    });

    it('should find next business day', () => {
      const friday = new Date('2023-12-15');
      const nextBusinessDay = DateUtils.getNextBusinessDay(friday);

      expect(nextBusinessDay.getDate()).toBe(18); // Monday
      expect(nextBusinessDay.getDay()).toBe(1); // Monday = 1
    });
  });

  describe('String Utilities', () => {
    class StringUtils {
      static capitalize(str: string): string {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      }

      static camelCase(str: string): string {
        return str
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
      }

      static kebabCase(str: string): string {
        return str
          .replace(/([a-z])([A-Z])/g, '$1-$2')
          .replace(/[\s_]+/g, '-')
          .toLowerCase();
      }

      static snakeCase(str: string): string {
        return str
          .replace(/([a-z])([A-Z])/g, '$1_$2')
          .replace(/[\s-]+/g, '_')
          .toLowerCase();
      }

      static truncate(str: string, maxLength: number, suffix: string = '...'): string {
        if (str.length <= maxLength) return str;
        return str.slice(0, maxLength - suffix.length) + suffix;
      }

      static slugify(str: string): string {
        return str
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }

      static isEmail(str: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(str);
      }

      static isPhoneNumber(str: string): boolean {
        const phoneRegex = /^1[3-9]\d{9}$/; // Chinese mobile number format
        return phoneRegex.test(str);
      }

      static sanitizeHTML(str: string): string {
        return str
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
          .replace(/\//g, '&#x2F;');
      }

      static generateRandomString(length: number = 8): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      }

      static removeExtraSpaces(str: string): string {
        return str.trim().replace(/\s+/g, ' ');
      }

      static wordCount(str: string): number {
        return str.trim().split(/\s+/).filter(word => word.length > 0).length;
      }
    }

    it('should capitalize strings correctly', () => {
      expect(StringUtils.capitalize('hello')).toBe('Hello');
      expect(StringUtils.capitalize('HELLO')).toBe('Hello');
      expect(StringUtils.capitalize('hELLO')).toBe('Hello');
      expect(StringUtils.capitalize('')).toBe('');
    });

    it('should convert to camelCase', () => {
      expect(StringUtils.camelCase('hello world')).toBe('helloWorld');
      expect(StringUtils.camelCase('Hello World')).toBe('helloWorld');
      expect(StringUtils.camelCase('HELLO WORLD')).toBe('helloWorld');
    });

    it('should convert to kebab-case', () => {
      expect(StringUtils.kebabCase('HelloWorld')).toBe('hello-world');
      expect(StringUtils.kebabCase('hello world')).toBe('hello-world');
      expect(StringUtils.kebabCase('hello_world')).toBe('hello-world');
    });

    it('should convert to snake_case', () => {
      expect(StringUtils.snakeCase('HelloWorld')).toBe('hello_world');
      expect(StringUtils.snakeCase('hello world')).toBe('hello_world');
      expect(StringUtils.snakeCase('hello-world')).toBe('hello_world');
    });

    it('should truncate strings', () => {
      expect(StringUtils.truncate('Hello World', 10)).toBe('Hello W...');
      expect(StringUtils.truncate('Hello', 10)).toBe('Hello');
      expect(StringUtils.truncate('Hello World', 10, '---')).toBe('Hello W---');
    });

    it('should create URL slugs', () => {
      expect(StringUtils.slugify('Hello World!')).toBe('hello-world');
      expect(StringUtils.slugify('  Hello   World  ')).toBe('hello-world');
      expect(StringUtils.slugify('Hello_World-Test')).toBe('hello-world-test');
    });

    it('should validate email addresses', () => {
      expect(StringUtils.isEmail('test@example.com')).toBe(true);
      expect(StringUtils.isEmail('user.name+tag@example.com')).toBe(true);
      expect(StringUtils.isEmail('invalid-email')).toBe(false);
      expect(StringUtils.isEmail('@example.com')).toBe(false);
      expect(StringUtils.isEmail('test@')).toBe(false);
    });

    it('should validate Chinese phone numbers', () => {
      expect(StringUtils.isPhoneNumber('13900139000')).toBe(true);
      expect(StringUtils.isPhoneNumber('15812345678')).toBe(true);
      expect(StringUtils.isPhoneNumber('12345678901')).toBe(false); // Invalid prefix
      expect(StringUtils.isPhoneNumber('1390013900')).toBe(false); // Too short
      expect(StringUtils.isPhoneNumber('139001390001')).toBe(false); // Too long
    });

    it('should sanitize HTML', () => {
      expect(StringUtils.sanitizeHTML('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
      expect(StringUtils.sanitizeHTML('Hello <b>World</b>')).toBe('Hello &lt;b&gt;World&lt;&#x2F;b&gt;');
    });

    it('should generate random strings', () => {
      const randomString1 = StringUtils.generateRandomString(8);
      const randomString2 = StringUtils.generateRandomString(8);

      expect(randomString1).toHaveLength(8);
      expect(randomString2).toHaveLength(8);
      expect(randomString1).not.toBe(randomString2);
    });

    it('should remove extra spaces', () => {
      expect(StringUtils.removeExtraSpaces('  hello   world  ')).toBe('hello world');
      expect(StringUtils.removeExtraSpaces('hello\n\nworld')).toBe('hello world');
    });

    it('should count words', () => {
      expect(StringUtils.wordCount('hello world')).toBe(2);
      expect(StringUtils.wordCount('  hello   world  ')).toBe(2);
      expect(StringUtils.wordCount('')).toBe(0);
      expect(StringUtils.wordCount('word')).toBe(1);
    });
  });

  describe('Validation Utilities', () => {
    class ValidationUtils {
      static isRequired(value: any): boolean {
        if (value === null || value === undefined) return false;
        if (typeof value === 'string') return value.trim().length > 0;
        if (Array.isArray(value)) return value.length > 0;
        return true;
      }

      static isMinLength(value: string, minLength: number): boolean {
        return value && value.length >= minLength;
      }

      static isMaxLength(value: string, maxLength: number): boolean {
        return !value || value.length <= maxLength;
      }

      static isNumeric(value: string): boolean {
        return !isNaN(Number(value)) && !isNaN(parseFloat(value));
      }

      static isInteger(value: string | number): boolean {
        const num = Number(value);
        return Number.isInteger(num);
      }

      static isInRange(value: number, min: number, max: number): boolean {
        return value >= min && value <= max;
      }

      static isValidAge(age: number, minAge: number = 3, maxAge: number = 7): boolean {
        return this.isInteger(age) && this.isInRange(age, minAge, maxAge);
      }

      static isValidGender(gender: string): boolean {
        return ['男', '女'].includes(gender);
      }

      static isValidGrade(grade: string): boolean {
        return ['小班', '中班', '大班'].includes(grade);
      }

      static isValidRole(role: string): boolean {
        return ['admin', 'principal', 'teacher', 'parent'].includes(role);
      }

      static isValidURL(url: string): boolean {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      }

      static isValidDate(dateString: string): boolean {
        const date = new Date(dateString);
        return !isNaN(date.getTime());
      }

      static isFutureDate(dateString: string): boolean {
        const date = new Date(dateString);
        return date > new Date();
      }

      static isPastDate(dateString: string): boolean {
        const date = new Date(dateString);
        return date < new Date();
      }

      static validateStudentData(data: any): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!this.isRequired(data.name)) {
          errors.push('Student name is required');
        }

        if (!this.isValidGender(data.gender)) {
          errors.push('Valid gender is required (男/女)');
        }

        if (!this.isValidDate(data.birthDate)) {
          errors.push('Valid birth date is required');
        } else {
          const age = new Date().getFullYear() - new Date(data.birthDate).getFullYear();
          if (!this.isValidAge(age)) {
            errors.push('Student age must be between 3 and 7 years');
          }
        }

        if (!this.isInteger(data.parentId) || Number(data.parentId) <= 0) {
          errors.push('Valid parent ID is required');
        }

        return {
          isValid: errors.length === 0,
          errors
        };
      }

      static validateActivityData(data: any): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!this.isRequired(data.title)) {
          errors.push('Activity title is required');
        }

        if (!this.isRequired(data.type)) {
          errors.push('Activity type is required');
        }

        if (!this.isValidDate(data.startTime)) {
          errors.push('Valid start time is required');
        } else if (this.isPastDate(data.startTime)) {
          errors.push('Start time cannot be in the past');
        }

        if (!this.isValidDate(data.endTime)) {
          errors.push('Valid end time is required');
        } else if (data.startTime && new Date(data.endTime) <= new Date(data.startTime)) {
          errors.push('End time must be after start time');
        }

        if (data.capacity !== undefined) {
          const capacity = Number(data.capacity);
          if (!this.isInteger(capacity) || !this.isInRange(capacity, 1, 100)) {
            errors.push('Capacity must be between 1 and 100');
          }
        }

        return {
          isValid: errors.length === 0,
          errors
        };
      }
    }

    it('should validate required fields', () => {
      expect(ValidationUtils.isRequired('hello')).toBe(true);
      expect(ValidationUtils.isRequired('  hello  ')).toBe(true);
      expect(ValidationUtils.isRequired('')).toBe(false);
      expect(ValidationUtils.isRequired('   ')).toBe(false);
      expect(ValidationUtils.isRequired(null)).toBe(false);
      expect(ValidationUtils.isRequired(undefined)).toBe(false);
      expect(ValidationUtils.isRequired([])).toBe(false);
      expect(ValidationUtils.isRequired([1, 2, 3])).toBe(true);
    });

    it('should validate string length', () => {
      expect(ValidationUtils.isMinLength('hello', 3)).toBe(true);
      expect(ValidationUtils.isMinLength('hi', 3)).toBe(false);
      expect(ValidationUtils.isMaxLength('hello', 10)).toBe(true);
      expect(ValidationUtils.isMaxLength('hello world!', 10)).toBe(false);
    });

    it('should validate numeric values', () => {
      expect(ValidationUtils.isNumeric('123')).toBe(true);
      expect(ValidationUtils.isNumeric('123.45')).toBe(true);
      expect(ValidationUtils.isNumeric('abc')).toBe(false);
      expect(ValidationUtils.isNumeric('')).toBe(false);
    });

    it('should validate integers', () => {
      expect(ValidationUtils.isInteger('123')).toBe(true);
      expect(ValidationUtils.isInteger(123)).toBe(true);
      expect(ValidationUtils.isInteger('123.45')).toBe(false);
      expect(ValidationUtils.isInteger(123.45)).toBe(false);
    });

    it('should validate ranges', () => {
      expect(ValidationUtils.isInRange(5, 1, 10)).toBe(true);
      expect(ValidationUtils.isInRange(1, 1, 10)).toBe(true);
      expect(ValidationUtils.isInRange(10, 1, 10)).toBe(true);
      expect(ValidationUtils.isInRange(0, 1, 10)).toBe(false);
      expect(ValidationUtils.isInRange(11, 1, 10)).toBe(false);
    });

    it('should validate ages', () => {
      expect(ValidationUtils.isValidAge(5)).toBe(true);
      expect(ValidationUtils.isValidAge(3)).toBe(true);
      expect(ValidationUtils.isValidAge(7)).toBe(true);
      expect(ValidationUtils.isValidAge(2)).toBe(false);
      expect(ValidationUtils.isValidAge(8)).toBe(false);
    });

    it('should validate gender', () => {
      expect(ValidationUtils.isValidGender('男')).toBe(true);
      expect(ValidationUtils.isValidGender('女')).toBe(true);
      expect(ValidationUtils.isValidGender('male')).toBe(false);
      expect(ValidationUtils.isValidGender('')).toBe(false);
    });

    it('should validate grades', () => {
      expect(ValidationUtils.isValidGrade('小班')).toBe(true);
      expect(ValidationUtils.isValidGrade('中班')).toBe(true);
      expect(ValidationUtils.isValidGrade('大班')).toBe(true);
      expect(ValidationUtils.isValidGrade('一年级')).toBe(false);
    });

    it('should validate roles', () => {
      expect(ValidationUtils.isValidRole('admin')).toBe(true);
      expect(ValidationUtils.isValidRole('teacher')).toBe(true);
      expect(ValidationUtils.isValidRole('student')).toBe(false);
    });

    it('should validate URLs', () => {
      expect(ValidationUtils.isValidURL('https://example.com')).toBe(true);
      expect(ValidationUtils.isValidURL('http://localhost:3000')).toBe(true);
      expect(ValidationUtils.isValidURL('invalid-url')).toBe(false);
    });

    it('should validate dates', () => {
      expect(ValidationUtils.isValidDate('2023-12-13')).toBe(true);
      expect(ValidationUtils.isValidDate('2023-12-13T10:30:00')).toBe(true);
      expect(ValidationUtils.isValidDate('invalid-date')).toBe(false);
    });

    it('should check future dates', () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      expect(ValidationUtils.isFutureDate(futureDate)).toBe(true);
      expect(ValidationUtils.isFutureDate(pastDate)).toBe(false);
    });

    it('should validate student data', () => {
      const validStudent = {
        name: '测试学生',
        gender: '男',
        birthDate: '2020-06-15',
        parentId: 1
      };

      const invalidStudent = {
        name: '',
        gender: 'invalid',
        birthDate: 'invalid-date',
        parentId: 'invalid'
      };

      const validResult = ValidationUtils.validateStudentData(validStudent);
      expect(validResult.isValid).toBe(true);
      expect(validResult.errors).toHaveLength(0);

      const invalidResult = ValidationUtils.validateStudentData(invalidStudent);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors.length).toBeGreaterThan(0);
    });

    it('should validate activity data', () => {
      const validActivity = {
        title: '测试活动',
        type: '户外活动',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        capacity: 20
      };

      const invalidActivity = {
        title: '',
        type: '',
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Past date
        endTime: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // Before start
        capacity: 150 // Too high
      };

      const validResult = ValidationUtils.validateActivityData(validActivity);
      expect(validResult.isValid).toBe(true);

      const invalidResult = ValidationUtils.validateActivityData(invalidActivity);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Array Utilities', () => {
    class ArrayUtils {
      static unique<T>(array: T[]): T[] {
        return [...new Set(array)];
      }

      static groupBy<T, K extends keyof T>(array: T[], key: K): Record<string, T[]> {
        return array.reduce((groups, item) => {
          const groupKey = String(item[key]);
          if (!groups[groupKey]) {
            groups[groupKey] = [];
          }
          groups[groupKey].push(item);
          return groups;
        }, {} as Record<string, T[]>);
      }

      static sortBy<T, K extends keyof T>(array: T[], key: K, direction: 'asc' | 'desc' = 'asc'): T[] {
        return [...array].sort((a, b) => {
          const aVal = a[key];
          const bVal = b[key];
          
          if (aVal < bVal) return direction === 'asc' ? -1 : 1;
          if (aVal > bVal) return direction === 'asc' ? 1 : -1;
          return 0;
        });
      }

      static chunk<T>(array: T[], size: number): T[][] {
        const chunks: T[][] = [];
        for (let i = 0; i < array.length; i += size) {
          chunks.push(array.slice(i, i + size));
        }
        return chunks;
      }

      static flatten<T>(array: any[]): T[] {
        return array.reduce((flat: T[], item: any) => {
          return flat.concat(Array.isArray(item) ? this.flatten(item) : item);
        }, []);
      }

      static intersection<T>(array1: T[], array2: T[]): T[] {
        return array1.filter(item => array2.includes(item));
      }

      static difference<T>(array1: T[], array2: T[]): T[] {
        return array1.filter(item => !array2.includes(item));
      }

      static sum(array: number[]): number {
        return array.reduce((sum, num) => sum + num, 0);
      }

      static average(array: number[]): number {
        if (array.length === 0) return 0;
        return this.sum(array) / array.length;
      }

      static max(array: number[]): number {
        return Math.max(...array);
      }

      static min(array: number[]): number {
        return Math.min(...array);
      }

      static shuffle<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      }

      static sample<T>(array: T[], count: number = 1): T[] {
        const shuffled = this.shuffle(array);
        return shuffled.slice(0, count);
      }
    }

    it('should remove duplicates', () => {
      expect(ArrayUtils.unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
      expect(ArrayUtils.unique(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c']);
      expect(ArrayUtils.unique([])).toEqual([]);
    });

    it('should group by key', () => {
      const students = [
        { name: 'Alice', grade: '小班' },
        { name: 'Bob', grade: '中班' },
        { name: 'Charlie', grade: '小班' }
      ];

      const grouped = ArrayUtils.groupBy(students, 'grade');

      expect(grouped['小班']).toHaveLength(2);
      expect(grouped['中班']).toHaveLength(1);
    });

    it('should sort by key', () => {
      const items = [
        { name: 'Charlie', age: 5 },
        { name: 'Alice', age: 4 },
        { name: 'Bob', age: 6 }
      ];

      const sortedByName = ArrayUtils.sortBy(items, 'name');
      expect(sortedByName[0].name).toBe('Alice');

      const sortedByAge = ArrayUtils.sortBy(items, 'age', 'desc');
      expect(sortedByAge[0].age).toBe(6);
    });

    it('should chunk arrays', () => {
      const array = [1, 2, 3, 4, 5, 6, 7];
      const chunks = ArrayUtils.chunk(array, 3);

      expect(chunks).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
    });

    it('should flatten arrays', () => {
      const nested = [1, [2, 3], [4, [5, 6]]];
      const flattened = ArrayUtils.flatten(nested);

      expect(flattened).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('should find intersection', () => {
      const array1 = [1, 2, 3, 4];
      const array2 = [3, 4, 5, 6];

      expect(ArrayUtils.intersection(array1, array2)).toEqual([3, 4]);
    });

    it('should find difference', () => {
      const array1 = [1, 2, 3, 4];
      const array2 = [3, 4, 5, 6];

      expect(ArrayUtils.difference(array1, array2)).toEqual([1, 2]);
    });

    it('should calculate mathematical operations', () => {
      const numbers = [1, 2, 3, 4, 5];

      expect(ArrayUtils.sum(numbers)).toBe(15);
      expect(ArrayUtils.average(numbers)).toBe(3);
      expect(ArrayUtils.max(numbers)).toBe(5);
      expect(ArrayUtils.min(numbers)).toBe(1);
    });

    it('should shuffle arrays', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = ArrayUtils.shuffle(original);

      expect(shuffled).toHaveLength(5);
      expect(shuffled).toEqual(expect.arrayContaining(original));
      // Note: There's a small chance shuffled === original, but very unlikely
    });

    it('should sample from arrays', () => {
      const array = [1, 2, 3, 4, 5];
      const sample = ArrayUtils.sample(array, 3);

      expect(sample).toHaveLength(3);
      sample.forEach(item => {
        expect(array).toContain(item);
      });
    });
  });

  describe('Object Utilities', () => {
    class ObjectUtils {
      static pick<T extends object, K extends keyof T>(object: T, keys: K[]): Pick<T, K> {
        const result = {} as Pick<T, K>;
        keys.forEach(key => {
          if (key in object) {
            result[key] = object[key];
          }
        });
        return result;
      }

      static omit<T extends object, K extends keyof T>(object: T, keys: K[]): Omit<T, K> {
        const result = { ...object };
        keys.forEach(key => {
          delete result[key];
        });
        return result;
      }

      static deepClone<T>(object: T): T {
        if (object === null || typeof object !== 'object') {
          return object;
        }

        if (object instanceof Date) {
          return new Date(object.getTime()) as unknown as T;
        }

        if (Array.isArray(object)) {
          return object.map(item => this.deepClone(item)) as unknown as T;
        }

        const cloned = {} as T;
        Object.keys(object).forEach(key => {
          (cloned as any)[key] = this.deepClone((object as any)[key]);
        });

        return cloned;
      }

      static merge<T, U>(target: T, source: U): T & U {
        return { ...target, ...source };
      }

      static deepMerge(target: any, source: any): any {
        const result = { ...target };

        Object.keys(source).forEach(key => {
          if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            result[key] = this.deepMerge(target[key] || {}, source[key]);
          } else {
            result[key] = source[key];
          }
        });

        return result;
      }

      static isEmpty(object: any): boolean {
        if (!object) return true;
        if (Array.isArray(object)) return object.length === 0;
        if (typeof object === 'object') return Object.keys(object).length === 0;
        return false;
      }

      static hasProperty(object: any, path: string): boolean {
        const keys = path.split('.');
        let current = object;

        for (const key of keys) {
          if (current === null || current === undefined || !(key in current)) {
            return false;
          }
          current = current[key];
        }

        return true;
      }

      static getProperty(object: any, path: string, defaultValue?: any): any {
        const keys = path.split('.');
        let current = object;

        for (const key of keys) {
          if (current === null || current === undefined || !(key in current)) {
            return defaultValue;
          }
          current = current[key];
        }

        return current;
      }

      static setProperty(object: any, path: string, value: any): void {
        const keys = path.split('.');
        let current = object;

        for (let i = 0; i < keys.length - 1; i++) {
          const key = keys[i];
          if (!(key in current) || typeof current[key] !== 'object') {
            current[key] = {};
          }
          current = current[key];
        }

        current[keys[keys.length - 1]] = value;
      }
    }

    it('should pick properties', () => {
      const object = { a: 1, b: 2, c: 3, d: 4 };
      const picked = ObjectUtils.pick(object, ['a', 'c']);

      expect(picked).toEqual({ a: 1, c: 3 });
    });

    it('should omit properties', () => {
      const object = { a: 1, b: 2, c: 3, d: 4 };
      const omitted = ObjectUtils.omit(object, ['b', 'd']);

      expect(omitted).toEqual({ a: 1, c: 3 });
    });

    it('should deep clone objects', () => {
      const original = {
        a: 1,
        b: {
          c: 2,
          d: [3, 4, { e: 5 }]
        },
        f: new Date('2023-12-13')
      };

      const cloned = ObjectUtils.deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.b).not.toBe(original.b);
      expect(cloned.b.d).not.toBe(original.b.d);
    });

    it('should merge objects', () => {
      const target = { a: 1, b: 2 };
      const source = { b: 3, c: 4 };
      const merged = ObjectUtils.merge(target, source);

      expect(merged).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('should deep merge objects', () => {
      const target = {
        a: 1,
        b: {
          c: 2,
          d: 3
        }
      };

      const source = {
        b: {
          d: 4,
          e: 5
        },
        f: 6
      };

      const merged = ObjectUtils.deepMerge(target, source);

      expect(merged).toEqual({
        a: 1,
        b: {
          c: 2,
          d: 4,
          e: 5
        },
        f: 6
      });
    });

    it('should check if object is empty', () => {
      expect(ObjectUtils.isEmpty({})).toBe(true);
      expect(ObjectUtils.isEmpty([])).toBe(true);
      expect(ObjectUtils.isEmpty(null)).toBe(true);
      expect(ObjectUtils.isEmpty(undefined)).toBe(true);
      expect(ObjectUtils.isEmpty({ a: 1 })).toBe(false);
      expect(ObjectUtils.isEmpty([1])).toBe(false);
    });

    it('should check property existence', () => {
      const object = {
        a: {
          b: {
            c: 'value'
          }
        }
      };

      expect(ObjectUtils.hasProperty(object, 'a.b.c')).toBe(true);
      expect(ObjectUtils.hasProperty(object, 'a.b.d')).toBe(false);
      expect(ObjectUtils.hasProperty(object, 'x.y.z')).toBe(false);
    });

    it('should get nested properties', () => {
      const object = {
        a: {
          b: {
            c: 'value'
          }
        }
      };

      expect(ObjectUtils.getProperty(object, 'a.b.c')).toBe('value');
      expect(ObjectUtils.getProperty(object, 'a.b.d', 'default')).toBe('default');
      expect(ObjectUtils.getProperty(object, 'x.y.z')).toBeUndefined();
    });

    it('should set nested properties', () => {
      const object = {};

      ObjectUtils.setProperty(object, 'a.b.c', 'value');

      expect(object).toEqual({
        a: {
          b: {
            c: 'value'
          }
        }
      });
    });
  });
});