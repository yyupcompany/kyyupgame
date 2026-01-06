import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { startConsoleMonitoring, stopConsoleMonitoring, expectNoConsoleErrors } from '../../setup/console-monitoring';
import { vi } from 'vitest'
import * as geoUtils from '../../../src/utils/geo-utils'

// Mock navigator.geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn()
}

// Mock window
const mockWindow = {
  navigator: {
    geolocation: mockGeolocation
  }
}

// 控制台错误检测变量
let consoleSpy: any

describe('Geo Utils', () => {
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
    vi.stubGlobal('window', mockWindow)
    vi.stubGlobal('navigator', mockWindow.navigator)
    
    // Reset all mock functions
    mockGeolocation.getCurrentPosition.mockReset()
    mockGeolocation.watchPosition.mockReset()
    mockGeolocation.clearWatch.mockReset()
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()

  describe('Geolocation Availability', () => {
    describe('isGeolocationAvailable', () => {
      it('should return true if geolocation is available', () => {
        const result = geoUtils.isGeolocationAvailable()
        
        expect(result).toBe(true)
      })

      it('should return false if geolocation is not available', () => {
        vi.stubGlobal('navigator', { geolocation: undefined })
        
        const result = geoUtils.isGeolocationAvailable()
        
        expect(result).toBe(false)
        
        vi.unstubAllGlobals()
      })
    })

    describe('getGeolocationPermission', () => {
      it('should get geolocation permission status', async () => {
        const mockPermission = { state: 'granted' }
        
        vi.stubGlobal('navigator', {
          ...mockWindow.navigator,
          permissions: {
            query: vi.fn().mockResolvedValue(mockPermission)
          }
        })
        
        const result = await geoUtils.getGeolocationPermission()
        
        expect(result).toBe('granted')
        
        vi.unstubAllGlobals()
      })

      it('should handle permission query error', async () => {
        vi.stubGlobal('navigator', {
          ...mockWindow.navigator,
          permissions: {
            query: vi.fn().mockRejectedValue(new Error('Permission denied'))
          }
        })
        
        const result = await geoUtils.getGeolocationPermission()
        
        expect(result).toBe('prompt')
        
        vi.unstubAllGlobals()
      })

      it('should return prompt if permissions API is not available', async () => {
        vi.stubGlobal('navigator', {
          ...mockWindow.navigator,
          permissions: undefined
        })
        
        const result = await geoUtils.getGeolocationPermission()
        
        expect(result).toBe('prompt')
        
        vi.unstubAllGlobals()
      })
    })
  })

  describe('Current Position', () => {
    describe('getCurrentPosition', () => {
      it('should get current position', async () => {
        const position = {
          coords: {
            latitude: 37.7749,
            longitude: -122.4194,
            altitude: 100,
            accuracy: 10,
            altitudeAccuracy: 5,
            heading: 90,
            speed: 5
          },
          timestamp: Date.now()
        }
        
        mockGeolocation.getCurrentPosition.mockImplementation((success) => {
          success(position as any)
        })
        
        const result = await geoUtils.getCurrentPosition()
        
        expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled()
        expect(result).toEqual(position)
      })

      it('should get current position with options', async () => {
        const position = {
          coords: {
            latitude: 37.7749,
            longitude: -122.4194
          },
          timestamp: Date.now()
        }
        
        const options = {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
        
        mockGeolocation.getCurrentPosition.mockImplementation((success) => {
          success(position as any)
        })
        
        const result = await geoUtils.getCurrentPosition(options)
        
        expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledWith(
          expect.any(Function),
          expect.any(Function),
          options
        )
        expect(result).toEqual(position)
      })

      it('should handle geolocation error', async () => {
        const error = {
          code: 1,
          message: 'User denied geolocation'
        }
        
        mockGeolocation.getCurrentPosition.mockImplementation((success, failure) => {
          failure(error as any)
        })
        
        await expect(geoUtils.getCurrentPosition()).rejects.toThrow('User denied geolocation')
      })
    })

    describe('getCurrentPositionCoords', () => {
      it('should get current position coordinates', async () => {
        const position = {
          coords: {
            latitude: 37.7749,
            longitude: -122.4194,
            accuracy: 10
          },
          timestamp: Date.now()
        }
        
        mockGeolocation.getCurrentPosition.mockImplementation((success) => {
          success(position as any)
        })
        
        const result = await geoUtils.getCurrentPositionCoords()
        
        expect(result).toEqual({
          latitude: 37.7749,
          longitude: -122.4194,
          accuracy: 10
        })
      })
    })
  })

  describe('Position Watching', () => {
    describe('watchPosition', () => {
      it('should watch position changes', () => {
        const callback = vi.fn()
        const watchId = 123
        
        mockGeolocation.watchPosition.mockReturnValue(watchId)
        
        const result = geoUtils.watchPosition(callback)
        
        expect(mockGeolocation.watchPosition).toHaveBeenCalledWith(
          expect.any(Function),
          expect.any(Function)
        )
        expect(result).toBe(watchId)
      })

      it('should watch position with options', () => {
        const callback = vi.fn()
        const watchId = 123
        const options = {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
        
        mockGeolocation.watchPosition.mockReturnValue(watchId)
        
        const result = geoUtils.watchPosition(callback, options)
        
        expect(mockGeolocation.watchPosition).toHaveBeenCalledWith(
          expect.any(Function),
          expect.any(Function),
          options
        )
        expect(result).toBe(watchId)
      })
    })

    describe('clearWatch', () => {
      it('should clear position watch', () => {
        const watchId = 123
        
        geoUtils.clearWatch(watchId)
        
        expect(mockGeolocation.clearWatch).toHaveBeenCalledWith(watchId)
      })
    })

    describe('watchPositionCoords', () => {
      it('should watch position coordinates changes', () => {
        const callback = vi.fn()
        const watchId = 123
        
        mockGeolocation.watchPosition.mockReturnValue(watchId)
        
        const result = geoUtils.watchPositionCoords(callback)
        
        expect(mockGeolocation.watchPosition).toHaveBeenCalled()
        expect(result).toBe(watchId)
      })
    })
  })

  describe('Distance Calculations', () => {
    describe('calculateDistance', () => {
      it('should calculate distance between two points', () => {
        const point1 = { latitude: 37.7749, longitude: -122.4194 } // San Francisco
        const point2 = { latitude: 34.0522, longitude: -118.2437 } // Los Angeles
        
        const result = geoUtils.calculateDistance(point1, point2)
        
        expect(result).toBeGreaterThan(0)
        expect(result).toBeLessThan(1000) // Distance should be around 600km
      })

      it('should calculate distance with units', () => {
        const point1 = { latitude: 37.7749, longitude: -122.4194 }
        const point2 = { latitude: 34.0522, longitude: -118.2437 }
        
        const resultMeters = geoUtils.calculateDistance(point1, point2, 'meters')
        const resultKilometers = geoUtils.calculateDistance(point1, point2, 'kilometers')
        const resultMiles = geoUtils.calculateDistance(point1, point2, 'miles')
        
        expect(resultMeters).toBeGreaterThan(0)
        expect(resultKilometers).toBeGreaterThan(0)
        expect(resultMiles).toBeGreaterThan(0)
        
        // Check unit conversions
        expect(resultKilometers).toBeCloseTo(resultMeters / 1000, 2)
        expect(resultMiles).toBeCloseTo(resultMeters / 1609.34, 2)
      })

      it('should handle same point', () => {
        const point = { latitude: 37.7749, longitude: -122.4194 }
        
        const result = geoUtils.calculateDistance(point, point)
        
        expect(result).toBe(0)
      })

      it('should handle invalid coordinates', () => {
        const point1 = { latitude: 91, longitude: -122.4194 } // Invalid latitude
        const point2 = { latitude: 34.0522, longitude: -118.2437 }
        
        const result = geoUtils.calculateDistance(point1, point2)
        
        expect(result).toBeNaN()
      })
    })

    describe('calculateDistanceHaversine', () => {
      it('should calculate distance using Haversine formula', () => {
        const point1 = { latitude: 37.7749, longitude: -122.4194 }
        const point2 = { latitude: 34.0522, longitude: -118.2437 }
        
        const result = geoUtils.calculateDistanceHaversine(point1, point2)
        
        expect(result).toBeGreaterThan(0)
        expect(result).toBeLessThan(1000)
      })
    })

    describe('calculateDistanceVincenty', () => {
      it('should calculate distance using Vincenty formula', () => {
        const point1 = { latitude: 37.7749, longitude: -122.4194 }
        const point2 = { latitude: 34.0522, longitude: -118.2437 }
        
        const result = geoUtils.calculateDistanceVincenty(point1, point2)
        
        expect(result).toBeGreaterThan(0)
        expect(result).toBeLessThan(1000)
      })
    })
  })

  describe('Coordinate Utilities', () => {
    describe('validateCoordinates', () => {
      it('should return true for valid coordinates', () => {
        const coords = { latitude: 37.7749, longitude: -122.4194 }
        
        const result = geoUtils.validateCoordinates(coords)
        
        expect(result).toBe(true)
      })

      it('should return false for invalid latitude', () => {
        const coords = { latitude: 91, longitude: -122.4194 }
        
        const result = geoUtils.validateCoordinates(coords)
        
        expect(result).toBe(false)
      })

      it('should return false for invalid longitude', () => {
        const coords = { latitude: 37.7749, longitude: 181 }
        
        const result = geoUtils.validateCoordinates(coords)
        
        expect(result).toBe(false)
      })

      it('should return false for missing coordinates', () => {
        const coords = { latitude: 37.7749 }
        
        const result = geoUtils.validateCoordinates(coords)
        
        expect(result).toBe(false)
      })
    })

    describe('formatCoordinates', () => {
      it('should format coordinates as decimal degrees', () => {
        const coords = { latitude: 37.7749, longitude: -122.4194 }
        
        const result = geoUtils.formatCoordinates(coords, 'decimal')
        
        expect(result).toBe('37.7749, -122.4194')
      })

      it('should format coordinates as degrees minutes seconds', () => {
        const coords = { latitude: 37.7749, longitude: -122.4194 }
        
        const result = geoUtils.formatCoordinates(coords, 'dms')
        
        expect(result).toContain('°')
        expect(result).toContain("'")
        expect(result).toContain('"')
      })

      it('should format coordinates with custom precision', () => {
        const coords = { latitude: 37.7749, longitude: -122.4194 }
        
        const result = geoUtils.formatCoordinates(coords, 'decimal', 2)
        
        expect(result).toBe('37.77, -122.42')
      })
    })

    describe('parseCoordinates', () => {
      it('should parse decimal coordinates', () => {
        const coordsString = '37.7749, -122.4194'
        
        const result = geoUtils.parseCoordinates(coordsString)
        
        expect(result).toEqual({
          latitude: 37.7749,
          longitude: -122.4194
        })
      })

      it('should parse DMS coordinates', () => {
        const coordsString = '37°46\'30" N, 122°25\'10" W'
        
        const result = geoUtils.parseCoordinates(coordsString)
        
        expect(result).toBeDefined()
        expect(typeof result.latitude).toBe('number')
        expect(typeof result.longitude).toBe('number')
      })

      it('should handle invalid coordinate string', () => {
        const coordsString = 'invalid coordinates'
        
        const result = geoUtils.parseCoordinates(coordsString)
        
        expect(result).toBeNull()
      })
    })

    describe('coordinateToDMS', () => {
      it('should convert decimal degrees to DMS', () => {
        const decimal = 37.7749
        
        const result = geoUtils.coordinateToDMS(decimal)
        
        expect(result).toHaveProperty('degrees')
        expect(result).toHaveProperty('minutes')
        expect(result).toHaveProperty('seconds')
        expect(result).toHaveProperty('direction')
      })

      it('should convert negative decimal degrees to DMS', () => {
        const decimal = -122.4194
        
        const result = geoUtils.coordinateToDMS(decimal)
        
        expect(result.direction).toBe('W')
      })
    })

    describe('dmsToDecimal', () => {
      it('should convert DMS to decimal degrees', () => {
        const dms = {
          degrees: 37,
          minutes: 46,
          seconds: 30,
          direction: 'N'
        }
        
        const result = geoUtils.dmsToDecimal(dms)
        
        expect(result).toBeCloseTo(37.775, 2)
      })
    })
  })

  describe('Geocoding', () => {
    describe('geocode', () => {
      it('should geocode address to coordinates', async () => {
        const address = 'San Francisco, CA'
        const coords = { latitude: 37.7749, longitude: -122.4194 }
        
        // Mock fetch for geocoding API
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: vi.fn().mockResolvedValue({
            results: [{
              geometry: {
                location: {
                  lat: 37.7749,
                  lng: -122.4194
                }
              }
            }]
          })
        } as any)
        
        const result = await geoUtils.geocode(address)
        
        expect(result).toEqual(coords)
        
        vi.restoreAllMocks()
      })

      it('should handle geocoding error', async () => {
        const address = 'Invalid Address'
        
        global.fetch = vi.fn().mockResolvedValue({
          ok: false,
          status: 400
        } as any)
        
        await expect(geoUtils.geocode(address)).rejects.toThrow()
        
        vi.restoreAllMocks()
      })
    })

    describe('reverseGeocode', () => {
      it('should reverse geocode coordinates to address', async () => {
        const coords = { latitude: 37.7749, longitude: -122.4194 }
        const address = 'San Francisco, CA'
        
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: vi.fn().mockResolvedValue({
            results: [{
              formatted_address: address
            }]
          })
        } as any)
        
        const result = await geoUtils.reverseGeocode(coords)
        
        expect(result).toBe(address)
        
        vi.restoreAllMocks()
      })
    })
  })

  describe('Geofencing', () => {
    describe('isPointInCircle', () => {
      it('should return true if point is within circle', () => {
        const center = { latitude: 37.7749, longitude: -122.4194 }
        const point = { latitude: 37.775, longitude: -122.419 }
        const radius = 1000 // 1km
        
        const result = geoUtils.isPointInCircle(point, center, radius)
        
        expect(result).toBe(true)
      })

      it('should return false if point is outside circle', () => {
        const center = { latitude: 37.7749, longitude: -122.4194 }
        const point = { latitude: 37.7849, longitude: -122.4294 }
        const radius = 1000 // 1km
        
        const result = geoUtils.isPointInCircle(point, center, radius)
        
        expect(result).toBe(false)
      })
    })

    describe('isPointInPolygon', () => {
      it('should return true if point is within polygon', () => {
        const polygon = [
          { latitude: 37.7749, longitude: -122.4194 },
          { latitude: 37.7849, longitude: -122.4094 },
          { latitude: 37.7849, longitude: -122.4294 },
          { latitude: 37.7749, longitude: -122.4194 }
        ]
        const point = { latitude: 37.7799, longitude: -122.4194 }
        
        const result = geoUtils.isPointInPolygon(point, polygon)
        
        expect(result).toBe(true)
      })

      it('should return false if point is outside polygon', () => {
        const polygon = [
          { latitude: 37.7749, longitude: -122.4194 },
          { latitude: 37.7849, longitude: -122.4094 },
          { latitude: 37.7849, longitude: -122.4294 },
          { latitude: 37.7749, longitude: -122.4194 }
        ]
        const point = { latitude: 37.7949, longitude: -122.4194 }
        
        const result = geoUtils.isPointInPolygon(point, polygon)
        
        expect(result).toBe(false)
      })
    })

    describe('isPointInBoundingBox', () => {
      it('should return true if point is within bounding box', () => {
        const bounds = {
          north: 37.7849,
          south: 37.7649,
          east: -122.4094,
          west: -122.4294
        }
        const point = { latitude: 37.7749, longitude: -122.4194 }
        
        const result = geoUtils.isPointInBoundingBox(point, bounds)
        
        expect(result).toBe(true)
      })

      it('should return false if point is outside bounding box', () => {
        const bounds = {
          north: 37.7849,
          south: 37.7649,
          east: -122.4094,
          west: -122.4294
        }
        const point = { latitude: 37.7949, longitude: -122.4194 }
        
        const result = geoUtils.isPointInBoundingBox(point, bounds)
        
        expect(result).toBe(false)
      })
    })
  })

  describe('Location Utilities', () => {
    describe('getBoundingBox', () => {
      it('should get bounding box for center and radius', () => {
        const center = { latitude: 37.7749, longitude: -122.4194 }
        const radius = 1000 // 1km
        
        const result = geoUtils.getBoundingBox(center, radius)
        
        expect(result).toHaveProperty('north')
        expect(result).toHaveProperty('south')
        expect(result).toHaveProperty('east')
        expect(result).toHaveProperty('west')
        
        expect(result.north).toBeGreaterThan(center.latitude)
        expect(result.south).toBeLessThan(center.latitude)
        expect(result.east).toBeGreaterThan(center.longitude)
        expect(result.west).toBeLessThan(center.longitude)
      })
    })

    describe('getCenterPoint', () => {
      it('should get center point of multiple coordinates', () => {
        const coordinates = [
          { latitude: 37.7749, longitude: -122.4194 },
          { latitude: 37.7849, longitude: -122.4094 },
          { latitude: 37.7649, longitude: -122.4294 }
        ]
        
        const result = geoUtils.getCenterPoint(coordinates)
        
        expect(result.latitude).toBeCloseTo(37.7749, 2)
        expect(result.longitude).toBeCloseTo(-122.4194, 2)
      })
    })

    describe('getArea', () => {
      it('should calculate area of polygon', () => {
        const polygon = [
          { latitude: 37.7749, longitude: -122.4194 },
          { latitude: 37.7849, longitude: -122.4094 },
          { latitude: 37.7849, longitude: -122.4294 },
          { latitude: 37.7749, longitude: -122.4194 }
        ]
        
        const result = geoUtils.getArea(polygon)
        
        expect(result).toBeGreaterThan(0)
      })
    })

    describe('getPerimeter', () => {
      it('should calculate perimeter of polygon', () => {
        const polygon = [
          { latitude: 37.7749, longitude: -122.4194 },
          { latitude: 37.7849, longitude: -122.4094 },
          { latitude: 37.7849, longitude: -122.4294 },
          { latitude: 37.7749, longitude: -122.4194 }
        ]
        
        const result = geoUtils.getPerimeter(polygon)
        
        expect(result).toBeGreaterThan(0)
      })
    })
  })

  describe('Map Utilities', () => {
    describe('createMapLink', () => {
      it('should create Google Maps link', () => {
        const coords = { latitude: 37.7749, longitude: -122.4194 }
        
        const result = geoUtils.createMapLink(coords, 'google')
        
        expect(result).toBe('https://www.google.com/maps?q=37.7749,-122.4194')
      })

      it('should create Apple Maps link', () => {
        const coords = { latitude: 37.7749, longitude: -122.4194 }
        
        const result = geoUtils.createMapLink(coords, 'apple')
        
        expect(result).toBe('https://maps.apple.com/?q=37.7749,-122.4194')
      })

      it('should create OpenStreetMap link', () => {
        const coords = { latitude: 37.7749, longitude: -122.4194 }
        
        const result = geoUtils.createMapLink(coords, 'osm')
        
        expect(result).toBe('https://www.openstreetmap.org/?mlat=37.7749&mlon=-122.4194')
      })
    })

    describe('createDirectionsLink', () => {
      it('should create Google Maps directions link', () => {
        const origin = { latitude: 37.7749, longitude: -122.4194 }
        const destination = { latitude: 34.0522, longitude: -118.2437 }
        
        const result = geoUtils.createDirectionsLink(origin, destination, 'google')
        
        expect(result).toContain('google.com/maps/dir')
        expect(result).toContain('37.7749,-122.4194')
        expect(result).toContain('34.0522,-118.2437')
      })
    })

    describe('getStaticMapUrl', () => {
      it('should get static map URL', () => {
        const center = { latitude: 37.7749, longitude: -122.4194 }
        const options = {
          width: 400,
          height: 300,
          zoom: 12
        }
        
        const result = geoUtils.getStaticMapUrl(center, options)
        
        expect(result).toContain('staticmap')
        expect(result).toContain('center=37.7749,-122.4194')
        expect(result).toContain('size=400x300')
        expect(result).toContain('zoom=12')
      })
    })
  })

  describe('Time Zone Utilities', () => {
    describe('getTimeZone', () => {
      it('should get time zone for coordinates', async () => {
        const coords = { latitude: 37.7749, longitude: -122.4194 }
        const timeZone = 'America/Los_Angeles'
        
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: vi.fn().mockResolvedValue({
            timeZoneName: timeZone
          })
        } as any)
        
        const result = await geoUtils.getTimeZone(coords)
        
        expect(result).toBe(timeZone)
        
        vi.restoreAllMocks()
      })
    })

    describe('getLocalTime', () => {
      it('should get local time for coordinates', async () => {
        const coords = { latitude: 37.7749, longitude: -122.4194 }
        const localTime = new Date()
        
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: vi.fn().mockResolvedValue({
            time: localTime.toISOString()
          })
        } as any)
        
        const result = await geoUtils.getLocalTime(coords)
        
        expect(result).toBeInstanceOf(Date)
        
        vi.restoreAllMocks()
      })
    })
  })
})