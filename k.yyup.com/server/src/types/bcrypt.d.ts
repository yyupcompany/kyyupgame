declare module 'bcrypt' {
  /**
   * 生成盐值
   * @param rounds 盐轮数，默认为10
   * @param callback 可选回调函数
   */
  export function genSalt(rounds?: number): Promise<string>;
  export function genSalt(rounds: number, callback: (err: Error, salt: string) => void): void;
  export function genSalt(callback: (err: Error, salt: string) => void): void;
  
  /**
   * 哈希密码
   * @param data 要哈希的数据
   * @param saltOrRounds 盐或轮数
   * @param callback 可选回调函数
   */
  export function hash(data: string, saltOrRounds: string | number): Promise<string>;
  export function hash(data: string, saltOrRounds: string | number, callback: (err: Error, encrypted: string) => void): void;
  
  /**
   * 比较原始值和哈希值
   * @param data 原始数据
   * @param encrypted 加密后的哈希数据
   * @param callback 可选回调函数
   */
  export function compare(data: string, encrypted: string): Promise<boolean>;
  export function compare(data: string, encrypted: string, callback: (err: Error, same: boolean) => void): void;
  
  /**
   * 获取哈希中的盐值
   * @param encrypted 加密的哈希字符串
   * @param callback 可选回调函数
   */
  export function getSalt(encrypted: string): Promise<string>;
  export function getSalt(encrypted: string, callback: (err: Error, salt: string) => void): void;
} 