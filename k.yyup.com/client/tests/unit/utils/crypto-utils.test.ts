import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';
import { vi } from 'vitest'
import * as cryptoUtils from '../../../src/utils/crypto-utils'

// Mock crypto API
const mockCrypto = {
  subtle: {
    digest: vi.fn(),
    encrypt: vi.fn(),
    decrypt: vi.fn(),
    sign: vi.fn(),
    verify: vi.fn(),
    generateKey: vi.fn(),
    importKey: vi.fn(),
    exportKey: vi.fn(),
    deriveKey: vi.fn(),
    deriveBits: vi.fn(),
    wrapKey: vi.fn(),
    unwrapKey: vi.fn()
  },
  getRandomValues: vi.fn(),
  randomUUID: vi.fn()
}

// Mock TextEncoder and TextDecoder
const mockTextEncoder = {
  encode: vi.fn()
}

const mockTextDecoder = {
  decode: vi.fn()
}

// 控制台错误检测变量
let consoleSpy: any

describe('Crypto Utils', () => {
    beforeEach(() => {
      startConsoleMonitoring()
      vi.clearAllMocks()
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    afterEach(() => {
      expectNoConsoleErrors()
      stopConsoleMonitoring()
    })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
  beforeEach(() => {
    vi.stubGlobal('crypto', mockCrypto)
    vi.stubGlobal('TextEncoder', vi.fn().mockImplementation(() => mockTextEncoder))
    vi.stubGlobal('TextDecoder', vi.fn().mockImplementation(() => mockTextDecoder))
    
    // Reset all mock functions
    Object.values(mockCrypto.subtle).forEach(value => {
      if (typeof value === 'function') => {
        value.mockReset()
      }
    })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    mockCrypto.getRandomValues.mockReset()
    mockCrypto.randomUUID.mockReset()
    mockTextEncoder.encode.mockReset()
    mockTextDecoder.decode.mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('Hashing Functions', () => {
    describe('sha256', () => {
      it('should hash string using SHA-256', async () => {
        const data = 'test data'
        const encodedData = new Uint8Array([116, 101, 115, 116, 32, 100, 97, 116, 97])
        const hashBuffer = new Uint8Array(32)
        
        mockTextEncoder.encode.mockReturnValue(encodedData)
        mockCrypto.subtle.digest.mockResolvedValue(hashBuffer)
        
        const result = await cryptoUtils.sha256(data)
        
        expect(mockTextEncoder.encode).toHaveBeenCalledWith(data)
        expect(mockCrypto.subtle.digest).toHaveBeenCalledWith('SHA-256', encodedData)
        expect(result).toBeDefined()
      })

      it('should handle hashing error', async () => {
        const data = 'test data'
        
        mockTextEncoder.encode.mockReturnValue(new Uint8Array())
        mockCrypto.subtle.digest.mockRejectedValue(new Error('Hashing failed'))
        
        await expect(cryptoUtils.sha256(data)).rejects.toThrow('Hashing failed')
      })
    })

    describe('sha512', () => {
      it('should hash string using SHA-512', async () => {
        const data = 'test data'
        const encodedData = new Uint8Array([116, 101, 115, 116, 32, 100, 97, 116, 97])
        const hashBuffer = new Uint8Array(64)
        
        mockTextEncoder.encode.mockReturnValue(encodedData)
        mockCrypto.subtle.digest.mockResolvedValue(hashBuffer)
        
        const result = await cryptoUtils.sha512(data)
        
        expect(mockTextEncoder.encode).toHaveBeenCalledWith(data)
        expect(mockCrypto.subtle.digest).toHaveBeenCalledWith('SHA-512', encodedData)
        expect(result).toBeDefined()
      })
    })

    describe('md5', () => {
      it('should hash string using MD5', async () => {
        const data = 'test data'
        const encodedData = new Uint8Array([116, 101, 115, 116, 32, 100, 97, 116, 97])
        const hashBuffer = new Uint8Array(16)
        
        mockTextEncoder.encode.mockReturnValue(encodedData)
        mockCrypto.subtle.digest.mockResolvedValue(hashBuffer)
        
        const result = await cryptoUtils.md5(data)
        
        expect(mockTextEncoder.encode).toHaveBeenCalledWith(data)
        expect(mockCrypto.subtle.digest).toHaveBeenCalledWith('MD5', encodedData)
        expect(result).toBeDefined()
      })
    })

    describe('hash', () => {
      it('should hash string with specified algorithm', async () => {
        const data = 'test data'
        const algorithm = 'SHA-256'
        const encodedData = new Uint8Array([116, 101, 115, 116, 32, 100, 97, 116, 97])
        const hashBuffer = new Uint8Array(32)
        
        mockTextEncoder.encode.mockReturnValue(encodedData)
        mockCrypto.subtle.digest.mockResolvedValue(hashBuffer)
        
        const result = await cryptoUtils.hash(data, algorithm)
        
        expect(mockTextEncoder.encode).toHaveBeenCalledWith(data)
        expect(mockCrypto.subtle.digest).toHaveBeenCalledWith(algorithm, encodedData)
        expect(result).toBeDefined()
      })
    })

    describe('hashFile', () => {
      it('should hash file using specified algorithm', async () => {
        const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
        const arrayBuffer = new ArrayBuffer(12)
        const hashBuffer = new Uint8Array(32)
        
        const mockFileReader = {
          readAsArrayBuffer: vi.fn(),
          onload: null as any,
          onerror: null as any
        }
        
        vi.stubGlobal('FileReader', vi.fn().mockImplementation(() => mockFileReader))
        
        mockCrypto.subtle.digest.mockResolvedValue(hashBuffer)
        
        const promise = cryptoUtils.hashFile(file, 'SHA-256')
        
        expect(mockFileReader.readAsArrayBuffer).toHaveBeenCalledWith(file)
        
        // Simulate file load
        if (mockFileReader.onload) {
          mockFileReader.onload({ target: { result: arrayBuffer } } as any)
        }
        
        const result = await promise
        
        expect(mockCrypto.subtle.digest).toHaveBeenCalledWith('SHA-256', arrayBuffer)
        expect(result).toBeDefined()
        
        vi.unstubAllGlobals()
      })
    })
  })

  describe('Random Generation', () => {
    describe('generateRandomBytes', () => {
      it('should generate random bytes', () => {
        const length = 16
        const randomBytes = new Uint8Array(length)
        
        mockCrypto.getRandomValues.mockReturnValue(randomBytes)
        
        const result = cryptoUtils.generateRandomBytes(length)
        
        expect(mockCrypto.getRandomValues).toHaveBeenCalledWith(expect.any(Uint8Array))
        expect(result).toBe(randomBytes)
      })

      it('should generate random bytes with default length', () => {
        const randomBytes = new Uint8Array(32)
        
        mockCrypto.getRandomValues.mockReturnValue(randomBytes)
        
        const result = cryptoUtils.generateRandomBytes()
        
        expect(result).toBe(randomBytes)
      })
    })

    describe('generateRandomString', () => {
      it('should generate random string', () => {
        const length = 16
        const randomBytes = new Uint8Array(length)
        
        mockCrypto.getRandomValues.mockReturnValue(randomBytes)
        
        const result = cryptoUtils.generateRandomString(length)
        
        expect(mockCrypto.getRandomValues).toHaveBeenCalledWith(expect.any(Uint8Array))
        expect(result).toHaveLength(length)
        expect(typeof result).toBe('string')
      })

      it('should generate random string with custom alphabet', () => {
        const length = 10
        const alphabet = 'ABCDEF'
        const randomBytes = new Uint8Array(length)
        
        mockCrypto.getRandomValues.mockReturnValue(randomBytes)
        
        const result = cryptoUtils.generateRandomString(length, alphabet)
        
        expect(result).toHaveLength(length)
        expect(result.split('').every(char => alphabet.includes(char))).toBe(true)
      })
    })

    describe('generateUUID', () => {
      it('should generate UUID', () => {
        const uuid = '123e4567-e89b-12d3-a456-426614174000'
        
        mockCrypto.randomUUID.mockReturnValue(uuid)
        
        const result = cryptoUtils.generateUUID()
        
        expect(mockCrypto.randomUUID).toHaveBeenCalled()
        expect(result).toBe(uuid)
      })

      it('should generate UUID v4', () => {
        const uuid = '123e4567-e89b-12d3-a456-426614174000'
        
        mockCrypto.randomUUID.mockReturnValue(uuid)
        
        const result = cryptoUtils.generateUUIDv4()
        
        expect(mockCrypto.randomUUID).toHaveBeenCalled()
        expect(result).toBe(uuid)
      })
    })

    describe('generateRandomNumber', () => {
      it('should generate random number in range', () => {
        const min = 1
        const max = 100
        const randomBytes = new Uint8Array(4)
        
        mockCrypto.getRandomValues.mockReturnValue(randomBytes)
        
        const result = cryptoUtils.generateRandomNumber(min, max)
        
        expect(mockCrypto.getRandomValues).toHaveBeenCalledWith(expect.any(Uint8Array))
        expect(result).toBeGreaterThanOrEqual(min)
        expect(result).toBeLessThanOrEqual(max)
      })

      it('should generate random integer', () => {
        const min = 1
        const max = 100
        const randomBytes = new Uint8Array(4)
        
        mockCrypto.getRandomValues.mockReturnValue(randomBytes)
        
        const result = cryptoUtils.generateRandomNumber(min, max, true)
        
        expect(Number.isInteger(result)).toBe(true)
      })
    })
  })

  describe('Encryption and Decryption', () => {
    describe('generateKey', () => {
      it('should generate encryption key', async () => {
        const algorithm = { name: 'AES-GCM', length: 256 }
        const key = { algorithm: 'AES-GCM', extractable: true, type: 'secret' }
        
        mockCrypto.subtle.generateKey.mockResolvedValue(key)
        
        const result = await cryptoUtils.generateKey(algorithm, true, ['encrypt', 'decrypt'])
        
        expect(mockCrypto.subtle.generateKey).toHaveBeenCalledWith(algorithm, true, ['encrypt', 'decrypt'])
        expect(result).toBe(key)
      })
    })

    describe('exportKey', () => {
      it('should export key to format', async () => {
        const key = { algorithm: 'AES-GCM', extractable: true, type: 'secret' }
        const exportedKey = new ArrayBuffer(32)
        
        mockCrypto.subtle.exportKey.mockResolvedValue(exportedKey)
        
        const result = await cryptoUtils.exportKey('raw', key)
        
        expect(mockCrypto.subtle.exportKey).toHaveBeenCalledWith('raw', key)
        expect(result).toBe(exportedKey)
      })
    })

    describe('importKey', () => {
      it('should import key from format', async () => {
        const keyData = new ArrayBuffer(32)
        const algorithm = { name: 'AES-GCM' }
        const key = { algorithm: 'AES-GCM', extractable: true, type: 'secret' }
        
        mockCrypto.subtle.importKey.mockResolvedValue(key)
        
        const result = await cryptoUtils.importKey('raw', keyData, algorithm, true, ['encrypt', 'decrypt'])
        
        expect(mockCrypto.subtle.importKey).toHaveBeenCalledWith('raw', keyData, algorithm, true, ['encrypt', 'decrypt'])
        expect(result).toBe(key)
      })
    })

    describe('encrypt', () => {
      it('should encrypt data with key', async () => {
        const data = 'test data'
        const key = { algorithm: 'AES-GCM', extractable: true, type: 'secret' }
        const algorithm = { name: 'AES-GCM', iv: new Uint8Array(12) }
        const encryptedData = new ArrayBuffer(32)
        
        mockTextEncoder.encode.mockReturnValue(new Uint8Array([116, 101, 115, 116, 32, 100, 97, 116, 97]))
        mockCrypto.subtle.encrypt.mockResolvedValue(encryptedData)
        
        const result = await cryptoUtils.encrypt(data, key, algorithm)
        
        expect(mockTextEncoder.encode).toHaveBeenCalledWith(data)
        expect(mockCrypto.subtle.encrypt).toHaveBeenCalledWith(algorithm, key, expect.any(Uint8Array))
        expect(result).toBe(encryptedData)
      })
    })

    describe('decrypt', () => {
      it('should decrypt data with key', async () => {
        const encryptedData = new ArrayBuffer(32)
        const key = { algorithm: 'AES-GCM', extractable: true, type: 'secret' }
        const algorithm = { name: 'AES-GCM', iv: new Uint8Array(12) }
        const decryptedData = new Uint8Array([116, 101, 115, 116, 32, 100, 97, 116, 97])
        
        mockCrypto.subtle.decrypt.mockResolvedValue(decryptedData)
        mockTextDecoder.decode.mockReturnValue('test data')
        
        const result = await cryptoUtils.decrypt(encryptedData, key, algorithm)
        
        expect(mockCrypto.subtle.decrypt).toHaveBeenCalledWith(algorithm, key, encryptedData)
        expect(mockTextDecoder.decode).toHaveBeenCalledWith(decryptedData)
        expect(result).toBe('test data')
      })
    })

    describe('encryptWithPassword', () => {
      it('should encrypt data with password', async () => {
        const data = 'test data'
        const password = 'password123'
        const salt = new Uint8Array(16)
        const key = { algorithm: 'AES-GCM', extractable: true, type: 'secret' }
        const iv = new Uint8Array(12)
        const encryptedData = new ArrayBuffer(32)
        
        mockCrypto.getRandomValues.mockReturnValueOnce(salt).mockReturnValueOnce(iv)
        mockCrypto.subtle.deriveKey.mockResolvedValue(key)
        mockCrypto.subtle.encrypt.mockResolvedValue(encryptedData)
        
        const result = await cryptoUtils.encryptWithPassword(data, password)
        
        expect(result).toBeDefined()
      })
    })

    describe('decryptWithPassword', () => {
      it('should decrypt data with password', async () => {
        const encryptedData = new ArrayBuffer(32)
        const password = 'password123'
        const salt = new Uint8Array(16)
        const iv = new Uint8Array(12)
        const key = { algorithm: 'AES-GCM', extractable: true, type: 'secret' }
        const decryptedData = new Uint8Array([116, 101, 115, 116, 32, 100, 97, 116, 97])
        
        mockCrypto.subtle.deriveKey.mockResolvedValue(key)
        mockCrypto.subtle.decrypt.mockResolvedValue(decryptedData)
        mockTextDecoder.decode.mockReturnValue('test data')
        
        const result = await cryptoUtils.decryptWithPassword(encryptedData, password, salt, iv)
        
        expect(result).toBe('test data')
      })
    })
  })

  describe('Digital Signatures', () => {
    describe('generateSignatureKeyPair', () => {
      it('should generate signature key pair', async () => {
        const algorithm = { name: 'ECDSA', namedCurve: 'P-256' }
        const keyPair = {
          privateKey: { algorithm: 'ECDSA', extractable: true, type: 'private' },
          publicKey: { algorithm: 'ECDSA', extractable: true, type: 'public' }
        }
        
        mockCrypto.subtle.generateKey.mockResolvedValue(keyPair)
        
        const result = await cryptoUtils.generateSignatureKeyPair(algorithm, true, ['sign', 'verify'])
        
        expect(mockCrypto.subtle.generateKey).toHaveBeenCalledWith(algorithm, true, ['sign', 'verify'])
        expect(result).toBe(keyPair)
      })
    })

    describe('sign', () => {
      it('should sign data with private key', async () => {
        const data = 'test data'
        const privateKey = { algorithm: 'ECDSA', extractable: true, type: 'private' }
        const algorithm = { name: 'ECDSA', hash: 'SHA-256' }
        const signature = new ArrayBuffer(64)
        
        mockTextEncoder.encode.mockReturnValue(new Uint8Array([116, 101, 115, 116, 32, 100, 97, 116, 97]))
        mockCrypto.subtle.sign.mockResolvedValue(signature)
        
        const result = await cryptoUtils.sign(data, privateKey, algorithm)
        
        expect(mockTextEncoder.encode).toHaveBeenCalledWith(data)
        expect(mockCrypto.subtle.sign).toHaveBeenCalledWith(algorithm, privateKey, expect.any(Uint8Array))
        expect(result).toBe(signature)
      })
    })

    describe('verify', () => {
      it('should verify signature with public key', async () => {
        const data = 'test data'
        const signature = new ArrayBuffer(64)
        const publicKey = { algorithm: 'ECDSA', extractable: true, type: 'public' }
        const algorithm = { name: 'ECDSA', hash: 'SHA-256' }
        
        mockTextEncoder.encode.mockReturnValue(new Uint8Array([116, 101, 115, 116, 32, 100, 97, 116, 97]))
        mockCrypto.subtle.verify.mockResolvedValue(true)
        
        const result = await cryptoUtils.verify(data, signature, publicKey, algorithm)
        
        expect(mockTextEncoder.encode).toHaveBeenCalledWith(data)
        expect(mockCrypto.subtle.verify).toHaveBeenCalledWith(algorithm, publicKey, signature, expect.any(Uint8Array))
        expect(result).toBe(true)
      })
    })
  })

  describe('Encoding and Decoding', () => {
    describe('base64Encode', () => {
      it('should encode string to base64', () => {
        const data = 'test data'
        const encodedData = new Uint8Array([116, 101, 115, 116, 32, 100, 97, 116, 97])
        
        mockTextEncoder.encode.mockReturnValue(encodedData)
        
        const result = cryptoUtils.base64Encode(data)
        
        expect(mockTextEncoder.encode).toHaveBeenCalledWith(data)
        expect(result).toBe(btoa(String.fromCharCode(...encodedData)))
      })
    })

    describe('base64Decode', () => {
      it('should decode base64 to string', () => {
        const base64 = 'dGVzdCBkYXRh'
        const decodedData = new Uint8Array([116, 101, 115, 116, 32, 100, 97, 116, 97])
        
        mockTextDecoder.decode.mockReturnValue('test data')
        
        const result = cryptoUtils.base64Decode(base64)
        
        expect(mockTextDecoder.decode).toHaveBeenCalledWith(decodedData)
        expect(result).toBe('test data')
      })
    })

    describe('hexEncode', () => {
      it('should encode string to hex', () => {
        const data = 'test data'
        const encodedData = new Uint8Array([116, 101, 115, 116, 32, 100, 97, 116, 97])
        
        mockTextEncoder.encode.mockReturnValue(encodedData)
        
        const result = cryptoUtils.hexEncode(data)
        
        expect(mockTextEncoder.encode).toHaveBeenCalledWith(data)
        expect(result).toBe('746573742064617461')
      })
    })

    describe('hexDecode', () => {
      it('should decode hex to string', () => {
        const hex = '746573742064617461'
        const decodedData = new Uint8Array([116, 101, 115, 116, 32, 100, 97, 116, 97])
        
        mockTextDecoder.decode.mockReturnValue('test data')
        
        const result = cryptoUtils.hexDecode(hex)
        
        expect(mockTextDecoder.decode).toHaveBeenCalledWith(decodedData)
        expect(result).toBe('test data')
      })
    })

    describe('arrayBufferToBase64', () => {
      it('should convert ArrayBuffer to base64', () => {
        const buffer = new Uint8Array([116, 101, 115, 116, 32, 100, 97, 116, 97]).buffer
        
        const result = cryptoUtils.arrayBufferToBase64(buffer)
        
        expect(result).toBe(btoa(String.fromCharCode(...new Uint8Array(buffer))))
      })
    })

    describe('base64ToArrayBuffer', () => {
      it('should convert base64 to ArrayBuffer', () => {
        const base64 = 'dGVzdCBkYXRh'
        const buffer = new Uint8Array([116, 101, 115, 116, 32, 100, 97, 116, 97]).buffer
        
        const result = cryptoUtils.base64ToArrayBuffer(base64)
        
        expect(result).toEqual(buffer)
      })
    })

    describe('arrayBufferToHex', () => {
      it('should convert ArrayBuffer to hex', () => {
        const buffer = new Uint8Array([116, 101, 115, 116, 32, 100, 97, 116, 97]).buffer
        
        const result = cryptoUtils.arrayBufferToHex(buffer)
        
        expect(result).toBe('746573742064617461')
      })
    })

    describe('hexToArrayBuffer', () => {
      it('should convert hex to ArrayBuffer', () => {
        const hex = '746573742064617461'
        const buffer = new Uint8Array([116, 101, 115, 116, 32, 100, 97, 116, 97]).buffer
        
        const result = cryptoUtils.hexToArrayBuffer(hex)
        
        expect(result).toEqual(buffer)
      })
    })
  })

  describe('Cryptographic Utilities', () => {
    describe('generateSalt', () => {
      it('should generate random salt', () => {
        const length = 16
        const salt = new Uint8Array(length)
        
        mockCrypto.getRandomValues.mockReturnValue(salt)
        
        const result = cryptoUtils.generateSalt(length)
        
        expect(mockCrypto.getRandomValues).toHaveBeenCalledWith(expect.any(Uint8Array))
        expect(result).toBe(salt)
      })

      it('should generate salt with default length', () => {
        const salt = new Uint8Array(16)
        
        mockCrypto.getRandomValues.mockReturnValue(salt)
        
        const result = cryptoUtils.generateSalt()
        
        expect(result).toBe(salt)
      })
    })

    describe('generateIV', () => {
      it('should generate initialization vector', () => {
        const length = 12
        const iv = new Uint8Array(length)
        
        mockCrypto.getRandomValues.mockReturnValue(iv)
        
        const result = cryptoUtils.generateIV(length)
        
        expect(mockCrypto.getRandomValues).toHaveBeenCalledWith(expect.any(Uint8Array))
        expect(result).toBe(iv)
      })

      it('should generate IV with default length', () => {
        const iv = new Uint8Array(12)
        
        mockCrypto.getRandomValues.mockReturnValue(iv)
        
        const result = cryptoUtils.generateIV()
        
        expect(result).toBe(iv)
      })
    })

    describe('pbkdf2', () => {
      it('should derive key using PBKDF2', async () => {
        const password = 'password123'
        const salt = new Uint8Array(16)
        const iterations = 100000
        const hash = 'SHA-256'
        const length = 32
        const key = new ArrayBuffer(32)
        
        mockTextEncoder.encode.mockReturnValue(new Uint8Array([112, 97, 115, 115, 119, 111, 114, 100, 49, 50, 51]))
        mockCrypto.subtle.deriveBits.mockResolvedValue(key)
        
        const result = await cryptoUtils.pbkdf2(password, salt, iterations, hash, length)
        
        expect(mockTextEncoder.encode).toHaveBeenCalledWith(password)
        expect(mockCrypto.subtle.deriveBits).toHaveBeenCalledWith(
          {
            name: 'PBKDF2',
            salt: salt,
            iterations: iterations,
            hash: hash
          },
          expect.any(Object),
          length * 8
        )
        expect(result).toBe(key)
      })
    })

    describe('hkdf', () => {
      it('should derive key using HKDF', async () => {
        const keyMaterial = new ArrayBuffer(32)
        const salt = new ArrayBuffer(32)
        const info = new ArrayBuffer(16)
        const hash = 'SHA-256'
        const length = 32
        const key = new ArrayBuffer(32)
        
        mockCrypto.subtle.deriveKey.mockResolvedValue(key)
        
        const result = await cryptoUtils.hkdf(keyMaterial, salt, info, hash, length)
        
        expect(mockCrypto.subtle.deriveKey).toHaveBeenCalledWith(
          {
            name: 'HKDF',
            hash: hash,
            salt: salt,
            info: info
          },
          expect.any(Object),
          { name: 'AES-GCM', length: length * 8 },
          true,
          ['encrypt', 'decrypt']
        )
        expect(result).toBe(key)
      })
    })

    describe('isCryptoAvailable', () => {
      it('should return true if crypto is available', () => {
        const result = cryptoUtils.isCryptoAvailable()
        
        expect(result).toBe(true)
      })

      it('should return false if crypto is not available', () => {
        vi.stubGlobal('crypto', undefined)
        
        const result = cryptoUtils.isCryptoAvailable()
        
        expect(result).toBe(false)
        
        vi.unstubAllGlobals()
      })
    })

    describe('getSupportedAlgorithms', () => {
      it('should get supported algorithms', () => {
        const result = cryptoUtils.getSupportedAlgorithms()
        
        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBeGreaterThan(0)
      })
    })

    describe('isAlgorithmSupported', () => {
      it('should return true for supported algorithm', () => {
        const result = cryptoUtils.isAlgorithmSupported('AES-GCM')
        
        expect(result).toBe(true)
      })

      it('should return false for unsupported algorithm', () => {
        const result = cryptoUtils.isAlgorithmSupported('UNSUPPORTED')
        
        expect(result).toBe(false)
      })
    })
  })
})