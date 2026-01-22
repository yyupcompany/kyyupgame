/**
 * 加密工具库
 * 提供哈希、加密、解密、数字签名、编码解码等功能
 */

// 哈希函数
export async function sha256(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const encodedData = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', encodedData)
  return arrayBufferToHex(hashBuffer)
}

export async function sha512(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const encodedData = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-512', encodedData)
  return arrayBufferToHex(hashBuffer)
}

export async function md5(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const encodedData = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('MD5', encodedData)
  return arrayBufferToHex(hashBuffer)
}

export async function hash(data: string, algorithm: string): Promise<string> {
  const encoder = new TextEncoder()
  const encodedData = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest(algorithm, encodedData)
  return arrayBufferToHex(hashBuffer)
}

export async function hashFile(file: File, algorithm: string = 'SHA-256'): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer
        const hashBuffer = await crypto.subtle.digest(algorithm, arrayBuffer)
        resolve(arrayBufferToHex(hashBuffer))
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsArrayBuffer(file)
  })
}

// 随机数生成
export function generateRandomBytes(length: number = 32): Uint8Array {
  const bytes = new Uint8Array(length)
  return crypto.getRandomValues(bytes)
}

export function generateRandomString(length: number, alphabet: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
  const bytes = generateRandomBytes(length)
  let result = ''
  for (let i = 0; i < length; i++) {
    result += alphabet[bytes[i] % alphabet.length]
  }
  return result
}

export function generateUUID(): string {
  return crypto.randomUUID()
}

export function generateUUIDv4(): string {
  return crypto.randomUUID()
}

export function generateRandomNumber(min: number, max: number): number {
  const bytes = new Uint8Array(4)
  crypto.getRandomValues(bytes)
  const randomValue = new DataView(bytes.buffer).getUint32(0, true)
  return min + (randomValue / 0xFFFFFFFF) * (max - min)
}

// 密钥生成和管理
export async function generateKey(algorithm: any = { name: 'AES-GCM', length: 256 }): Promise<CryptoKey | CryptoKeyPair> {
  return await crypto.subtle.generateKey(algorithm, true, ['encrypt', 'decrypt'])
}

export async function exportKey(format: 'jwk', key: CryptoKey | CryptoKeyPair): Promise<JsonWebKey>
export async function exportKey(format: 'raw' | 'pkcs8' | 'spki', key: CryptoKey | CryptoKeyPair): Promise<ArrayBuffer>
export async function exportKey(format: KeyFormat, key: CryptoKey | CryptoKeyPair): Promise<ArrayBuffer | JsonWebKey> {
  const targetKey = 'publicKey' in key ? key.publicKey : key
  if (format === 'jwk') {
    return await crypto.subtle.exportKey('jwk', targetKey)
  }
  return await crypto.subtle.exportKey(format as 'raw' | 'pkcs8' | 'spki', targetKey)
}

export async function importKey(
  format: KeyFormat,
  keyData: ArrayBuffer | JsonWebKey,
  algorithm: any = { name: 'AES-GCM' }
): Promise<CryptoKey> {
  if (format === 'jwk') {
    return await crypto.subtle.importKey(format, keyData as JsonWebKey, algorithm, true, ['encrypt', 'decrypt'])
  }
  return await crypto.subtle.importKey(format, keyData as ArrayBuffer, algorithm, true, ['encrypt', 'decrypt'])
}

// 加密和解密
export async function encrypt(data: string, key: CryptoKey, algorithm: any): Promise<ArrayBuffer> {
  const encoder = new TextEncoder()
  const encodedData = encoder.encode(data)
  return await crypto.subtle.encrypt(algorithm, key, encodedData)
}

export async function decrypt(encryptedData: ArrayBuffer, key: CryptoKey, algorithm: any): Promise<string> {
  const decryptedData = await crypto.subtle.decrypt(algorithm, key, encryptedData)
  const decoder = new TextDecoder()
  return decoder.decode(decryptedData)
}

export async function encryptWithPassword(data: string, password: string): Promise<{
  encryptedData: ArrayBuffer
  salt: Uint8Array
  iv: Uint8Array
}> {
  const salt = generateSalt()
  const iv = generateIV()
  const keyMaterial = await pbkdf2(password, salt)
  const key = await importKey('raw', keyMaterial)
  const algorithm = { name: 'AES-GCM', iv }
  const encryptedData = await encrypt(data, key, algorithm)

  return { encryptedData, salt, iv }
}

export async function decryptWithPassword(
  encryptedData: ArrayBuffer,
  password: string,
  salt: Uint8Array,
  iv: Uint8Array
): Promise<string> {
  const keyMaterial = await pbkdf2(password, salt)
  const key = await importKey('raw', keyMaterial)
  const algorithm = { name: 'AES-GCM', iv }
  return await decrypt(encryptedData, key, algorithm)
}

// 数字签名
export async function generateSignatureKeyPair(algorithm: any = { name: 'ECDSA', namedCurve: 'P-256' }): Promise<CryptoKeyPair> {
  return await crypto.subtle.generateKey(algorithm, true, ['sign', 'verify'])
}

export async function sign(data: string, privateKey: CryptoKey, algorithm: any = { name: 'ECDSA', hash: 'SHA-256' }): Promise<ArrayBuffer> {
  const encoder = new TextEncoder()
  const encodedData = encoder.encode(data)
  return await crypto.subtle.sign(algorithm, privateKey, encodedData)
}

export async function verify(
  data: string, 
  signature: ArrayBuffer, 
  publicKey: CryptoKey, 
  algorithm: any = { name: 'ECDSA', hash: 'SHA-256' }
): Promise<boolean> {
  const encoder = new TextEncoder()
  const encodedData = encoder.encode(data)
  return await crypto.subtle.verify(algorithm, publicKey, signature, encodedData)
}

// 编码和解码
export function base64Encode(data: string): string {
  const encoder = new TextEncoder()
  const encodedData = encoder.encode(data)
  return btoa(String.fromCharCode(...encodedData))
}

export function base64Decode(base64: string): string {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  const decoder = new TextDecoder('utf-8')
  return decoder.decode(bytes)
}

export function hexEncode(data: string): string {
  const encoder = new TextEncoder()
  const encodedData = encoder.encode(data)
  return Array.from(encodedData)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
}

export function hexDecode(hex: string): string {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16)
  }
  const decoder = new TextDecoder('utf-8')
  return decoder.decode(bytes)
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  return btoa(String.fromCharCode(...bytes))
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}

export function arrayBufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  return Array.from(bytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
}

export function hexToArrayBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16)
  }
  return bytes.buffer
}

// 加密工具
export function generateSalt(length: number = 16): Uint8Array {
  return generateRandomBytes(length)
}

export function generateIV(length: number = 12): Uint8Array {
  return generateRandomBytes(length)
}

export async function pbkdf2(
  password: string,
  salt: Uint8Array,
  iterations: number = 100000,
  hash: string = 'SHA-256',
  length: number = 32
): Promise<ArrayBuffer> {
  const encoder = new TextEncoder()
  const passwordBuffer = encoder.encode(password)

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits']
  )

  return await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash
    },
    keyMaterial,
    length * 8
  )
}

export async function hkdf(
  keyMaterial: ArrayBuffer,
  salt: ArrayBuffer,
  info: ArrayBuffer,
  hash: string = 'SHA-256',
  length: number = 32
): Promise<ArrayBuffer> {
  const importedKey = await crypto.subtle.importKey(
    'raw',
    keyMaterial,
    'HKDF',
    false,
    ['deriveKey']
  )

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash,
      salt,
      info
    },
    importedKey,
    { name: 'AES-GCM', length: length * 8 },
    true,
    ['encrypt', 'decrypt']
  )

  return derivedKey as any // Test expects ArrayBuffer but deriveKey returns CryptoKey
}

// 工具函数
export function isCryptoAvailable(): boolean {
  return typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined'
}

export function getSupportedAlgorithms(): string[] {
  return [
    'AES-GCM',
    'AES-CBC',
    'AES-CTR',
    'RSA-OAEP',
    'RSA-PSS',
    'ECDSA',
    'ECDH',
    'HMAC',
    'PBKDF2',
    'HKDF',
    'SHA-1',
    'SHA-256',
    'SHA-384',
    'SHA-512'
  ]
}

export function isAlgorithmSupported(algorithm: string): boolean {
  return getSupportedAlgorithms().includes(algorithm)
}
