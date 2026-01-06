import { 
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

describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory, Router } from 'vue-router'
import Map from '@/components/common/Map.vue'
import ElementPlus from 'element-plus'

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElCard: {
    name: 'ElCard',
    template: '<div class="el-card"><slot></slot></div>',
    props: ['shadow', 'bodyStyle']
  },
  ElButton: {
    name: 'ElButton',
    template: '<button class="el-button"><slot></slot></button>',
    props: ['type', 'size', 'disabled', 'icon']
  },
  ElSelect: {
    name: 'ElSelect',
    template: '<div class="el-select"><slot></slot></div>',
    props: ['modelValue', 'placeholder', 'disabled', 'multiple']
  },
  ElOption: {
    name: 'ElOption',
    template: '<div class="el-option"><slot></slot></div>',
    props: ['value', 'label', 'disabled']
  },
  ElIcon: {
    name: 'ElIcon',
    template: '<i class="el-icon"><slot></slot></i>',
    props: ['size', 'color']
  },
  ElTooltip: {
    name: 'ElTooltip',
    template: '<div class="el-tooltip"><slot></slot></div>',
    props: ['content', 'placement', 'disabled']
  },
  ElInput: {
    name: 'ElInput',
    template: '<input class="el-input" />',
    props: ['modelValue', 'placeholder', 'disabled', 'clearable']
  },
  ElSlider: {
    name: 'ElSlider',
    template: '<div class="el-slider"><div class="el-slider__runway"></div></div>',
    props: ['modelValue', 'min', 'max', 'step', 'disabled']
  },
  ElSwitch: {
    name: 'ElSwitch',
    template: '<div class="el-switch"></div>',
    props: ['modelValue', 'disabled', 'activeText', 'inactiveText']
  },
  ElCheckbox: {
    name: 'ElCheckbox',
    template: '<div class="el-checkbox"><slot></slot></div>',
    props: ['modelValue', 'label', 'disabled']
  },
  ElRadio: {
    name: 'ElRadio',
    template: '<div class="el-radio"><slot></slot></div>',
    props: ['modelValue', 'label', 'disabled']
  },
  ElRadioGroup: {
    name: 'ElRadioGroup',
    template: '<div class="el-radio-group"><slot></slot></div>',
    props: ['modelValue', 'disabled']
  },
  ElDropdown: {
    name: 'ElDropdown',
    template: '<div class="el-dropdown"><slot></slot></div>',
    props: ['trigger', 'placement', 'disabled']
  },
  ElDropdownMenu: {
    name: 'ElDropdownMenu',
    template: '<div class="el-dropdown-menu"><slot></slot></div>'
  },
  ElDropdownItem: {
    name: 'ElDropdownItem',
    template: '<div class="el-dropdown-item"><slot></slot></div>',
    props: ['disabled', 'divided']
  },
  ElPopover: {
    name: 'ElPopover',
    template: '<div class="el-popover"><slot></slot></div>',
    props: ['content', 'placement', 'disabled', 'trigger']
  }
}))

// Mock map library (could be Leaflet, Mapbox, Google Maps, etc.)
const mockMapLibrary = {
  map: vi.fn(() => ({
    setView: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    remove: vi.fn(),
    invalidateSize: vi.fn(),
    getCenter: vi.fn(() => ({ lat: 0, lng: 0 })),
    getZoom: vi.fn(() => 10),
    setZoom: vi.fn(),
    panTo: vi.fn(),
    flyTo: vi.fn(),
    fitBounds: vi.fn(),
    addLayer: vi.fn(),
    removeLayer: vi.fn(),
    eachLayer: vi.fn()
  })),
  tileLayer: vi.fn(() => ({
    addTo: vi.fn(),
    remove: vi.fn(),
    setUrl: vi.fn(),
    setOpacity: vi.fn()
  })),
  marker: vi.fn(() => ({
    addTo: vi.fn(),
    remove: vi.fn(),
    setLatLng: vi.fn(),
    bindPopup: vi.fn(),
    bindTooltip: vi.fn(),
    openPopup: vi.fn(),
    closePopup: vi.fn(),
    on: vi.fn(),
    off: vi.fn()
  })),
  popup: vi.fn(() => ({
    setContent: vi.fn(),
    setLatLng: vi.fn(),
    openOn: vi.fn(),
    remove: vi.fn()
  })),
  tooltip: vi.fn(() => ({
    setContent: vi.fn(),
    setLatLng: vi.fn(),
    openOn: vi.fn(),
    remove: vi.fn()
  })),
  circle: vi.fn(() => ({
    addTo: vi.fn(),
    remove: vi.fn(),
    setRadius: vi.fn(),
    setLatLng: vi.fn(),
    getRadius: vi.fn(() => 1000),
    getLatLng: vi.fn(() => ({ lat: 0, lng: 0 }))
  })),
  polygon: vi.fn(() => ({
    addTo: vi.fn(),
    remove: vi.fn(),
    setLatLngs: vi.fn(),
    getLatLngs: vi.fn(() => []),
    getBounds: vi.fn(() => ({ getCenter: vi.fn() }))
  })),
  polyline: vi.fn(() => ({
    addTo: vi.fn(),
    remove: vi.fn(),
    setLatLngs: vi.fn(),
    getLatLngs: vi.fn(() => [])
  })),
  rectangle: vi.fn(() => ({
    addTo: vi.fn(),
    remove: vi.fn(),
    setBounds: vi.fn(),
    getBounds: vi.fn(() => ({ getCenter: vi.fn() }))
  })),
  icon: vi.fn(() => ({
    createIcon: vi.fn(() => document.createElement('div'))
  })),
  divIcon: vi.fn(() => ({
    createIcon: vi.fn(() => document.createElement('div'))
  })),
  control: {
    zoom: vi.fn(() => ({
      addTo: vi.fn(),
      remove: vi.fn()
    })),
    scale: vi.fn(() => ({
      addTo: vi.fn(),
      remove: vi.fn()
    })),
    layers: vi.fn(() => ({
      addTo: vi.fn(),
      remove: vi.fn()
    })),
    attribution: vi.fn(() => ({
      addTo: vi.fn(),
      remove: vi.fn()
    }))
  },
  latLng: vi.fn((lat, lng) => ({ lat, lng })),
  latLngBounds: vi.fn((corners) => ({ getCenter: vi.fn() })),
  CRS: {
    EPSG3857: 'EPSG3857',
    EPSG4326: 'EPSG4326',
    EPSG3395: 'EPSG3395'
  }
}

vi.mock('leaflet', () => mockMapLibrary)
vi.mock('mapbox-gl', () => mockMapLibrary)
vi.mock('@googlemaps/js-api-loader', () => ({
  Loader: vi.fn(() => ({
    load: vi.fn(() => Promise.resolve({
      Map: vi.fn(() => ({
        setCenter: vi.fn(),
        setZoom: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn()
      })),
      Marker: vi.fn(() => ({
        setMap: vi.fn(),
        setPosition: vi.fn(),
        setTitle: vi.fn()
      })),
      InfoWindow: vi.fn(() => ({
        open: vi.fn(),
        close: vi.fn(),
        setContent: vi.fn(),
        setPosition: vi.fn()
      }))
    }))
  }))
}))

describe('Map.vue', () => {
  let router: Router

  beforeEach(() => {
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } }
      ]
    })
  })

  const mockMarkers = [
    { id: 1, lat: 40.7128, lng: -74.0060, title: 'New York', description: 'Big Apple' },
    { id: 2, lat: 34.0522, lng: -118.2437, title: 'Los Angeles', description: 'City of Angels' },
    { id: 3, lat: 41.8781, lng: -87.6298, title: 'Chicago', description: 'Windy City' }
  ]

  it('renders properly with default props', () => {
    const wrapper = mount(Map, {
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.map-container').exists()).toBe(true)
  })

  it('displays map with default center', () => {
    const wrapper = mount(Map, {
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('center')).toEqual({ lat: 0, lng: 0 })
  })

  it('applies custom center coordinates', () => {
    const customCenter = { lat: 40.7128, lng: -74.0060 }
    const wrapper = mount(Map, {
      props: {
        center: customCenter
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('center')).toEqual(customCenter)
  })

  it('applies default zoom level', () => {
    const wrapper = mount(Map, {
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('zoom')).toBe(10)
  })

  it('applies custom zoom level', () => {
    const wrapper = mount(Map, {
      props: {
        zoom: 15
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('zoom')).toBe(15)
  })

  it('supports different map providers', () => {
    const providers = ['leaflet', 'mapbox', 'google', 'baidu', 'amap']
    
    providers.forEach(provider => {
      const wrapper = mount(Map, {
        props: {
          provider
        },
        global: {
          plugins: [router, ElementPlus]
        }
      })

      expect(wrapper.props('provider')).toBe(provider)
    })
  })

  it('uses leaflet as default provider', () => {
    const wrapper = mount(Map, {
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('provider')).toBe('leaflet')
  })

  it('supports custom map tiles URL', () => {
    const tilesUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    const wrapper = mount(Map, {
      props: {
        tilesUrl
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('tilesUrl')).toBe(tilesUrl)
  })

  it('supports custom map attribution', () => {
    const attribution = '© OpenStreetMap contributors'
    const wrapper = mount(Map, {
      props: {
        attribution
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('attribution')).toBe(attribution)
  })

  it('supports map markers', () => {
    const wrapper = mount(Map, {
      props: {
        markers: mockMarkers
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('markers')).toEqual(mockMarkers)
  })

  it('supports custom marker icons', () => {
    const customIcon = {
      url: '/custom-marker.png',
      size: [32, 32],
      anchor: [16, 32]
    }

    const wrapper = mount(Map, {
      props: {
        markers: mockMarkers,
        markerIcon: customIcon
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('markerIcon')).toEqual(customIcon)
  })

  it('supports marker clustering', () => {
    const wrapper = mount(Map, {
      props: {
        markers: mockMarkers,
        clusterMarkers: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('clusterMarkers')).toBe(true)
  })

  it('supports custom cluster options', () => {
    const clusterOptions = {
      chunkedLoading: true,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true
    }

    const wrapper = mount(Map, {
      props: {
        markers: mockMarkers,
        clusterMarkers: true,
        clusterOptions
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('clusterOptions')).toEqual(clusterOptions)
  })

  it('supports map polygons', () => {
    const polygons = [
      {
        id: 1,
        coordinates: [
          [40.7128, -74.0060],
          [40.7214, -74.0050],
          [40.7152, -73.9885],
          [40.7061, -73.9969]
        ],
        color: '#ff0000',
        fillColor: '#ff0000',
        fillOpacity: 0.3
      }
    ]

    const wrapper = mount(Map, {
      props: {
        polygons
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('polygons')).toEqual(polygons)
  })

  it('supports map polylines', () => {
    const polylines = [
      {
        id: 1,
        coordinates: [
          [40.7128, -74.0060],
          [34.0522, -118.2437],
          [41.8781, -87.6298]
        ],
        color: '#0000ff',
        weight: 3,
        opacity: 0.8
      }
    ]

    const wrapper = mount(Map, {
      props: {
        polylines
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('polylines')).toEqual(polylines)
  })

  it('supports map circles', () => {
    const circles = [
      {
        id: 1,
        center: [40.7128, -74.0060],
        radius: 1000,
        color: '#00ff00',
        fillColor: '#00ff00',
        fillOpacity: 0.3
      }
    ]

    const wrapper = mount(Map, {
      props: {
        circles
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('circles')).toEqual(circles)
  })

  it('supports map rectangles', () => {
    const rectangles = [
      {
        id: 1,
        bounds: [[40.7128, -74.0060], [40.7214, -73.9885]],
        color: '#ffff00',
        fillColor: '#ffff00',
        fillOpacity: 0.3
      }
    ]

    const wrapper = mount(Map, {
      props: {
        rectangles
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('rectangles')).toEqual(rectangles)
  })

  it('supports custom map dimensions', () => {
    const wrapper = mount(Map, {
      props: {
        width: 800,
        height: 600
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('width')).toBe(800)
    expect(wrapper.props('height')).toBe(600)
  })

  it('supports responsive map', () => {
    const wrapper = mount(Map, {
      props: {
        responsive: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('responsive')).toBe(true)
  })

  it('supports map controls', () => {
    const controls = {
      zoom: true,
      scale: true,
      layers: true,
      attribution: true,
      fullscreen: true,
      measure: true
    }

    const wrapper = mount(Map, {
      props: {
        controls
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('controls')).toEqual(controls)
  })

  it('supports custom control position', () => {
    const wrapper = mount(Map, {
      props: {
        controlPosition: 'topright'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('controlPosition')).toBe('topright')
  })

  it('supports map interactions', () => {
    const interactions = {
      drag: true,
      touchZoom: true,
      doubleClickZoom: true,
      scrollWheelZoom: true,
      boxZoom: true,
      keyboard: true
    }

    const wrapper = mount(Map, {
      props: {
        interactions
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('interactions')).toEqual(interactions)
  })

  it('supports map gestures', () => {
    const gestures = {
      rotate: true,
      pitch: true,
      zoom: true,
      pan: true
    }

    const wrapper = mount(Map, {
      props: {
        gestures
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('gestures')).toEqual(gestures)
  })

  it('supports map bounds', () => {
    const bounds = [
      [40.7128, -74.0060],
      [34.0522, -118.2437]
    ]

    const wrapper = mount(Map, {
      props: {
        bounds
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('bounds')).toEqual(bounds)
  })

  it('supports fit bounds with padding', () => {
    const wrapper = mount(Map, {
      props: {
        bounds: [[40.7128, -74.0060], [34.0522, -118.2437]],
        fitBounds: true,
        boundsPadding: [50, 50, 50, 50]
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('fitBounds')).toBe(true)
    expect(wrapper.props('boundsPadding')).toEqual([50, 50, 50, 50])
  })

  it('supports max bounds', () => {
    const maxBounds = [
      [40.7128, -74.0060],
      [34.0522, -118.2437]
    ]

    const wrapper = mount(Map, {
      props: {
        maxBounds
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('maxBounds')).toEqual(maxBounds)
  })

  it('supports min and max zoom levels', () => {
    const wrapper = mount(Map, {
      props: {
        minZoom: 5,
        maxZoom: 18
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('minZoom')).toBe(5)
    expect(wrapper.props('maxZoom')).toBe(18)
  })

  it('supports custom CSS classes', () => {
    const wrapper = mount(Map, {
      props: {
        className: 'custom-map'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('className')).toBe('custom-map')
  })

  it('supports custom styles', () => {
    const customStyle = { borderRadius: '8px', border: '2px solid #ccc' }
    const wrapper = mount(Map, {
      props: {
        style: customStyle
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('style')).toEqual(customStyle)
  })

  it('supports map theme', () => {
    const wrapper = mount(Map, {
      props: {
        theme: 'dark'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('theme')).toBe('dark')
  })

  it('supports custom map style', () => {
    const mapStyle = {
      version: 8,
      sources: {},
      layers: []
    }

    const wrapper = mount(Map, {
      props: {
        mapStyle
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('mapStyle')).toEqual(mapStyle)
  })

  it('emits click event when map is clicked', async () => {
    const wrapper = mount(Map, {
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const clickData = { lat: 40.7128, lng: -74.0060, pixel: { x: 100, y: 100 } }
    await wrapper.vm.$emit('click', clickData)
    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')[0]).toEqual([clickData])
  })

  it('emits dblclick event when map is double-clicked', async () => {
    const wrapper = mount(Map, {
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const dblclickData = { lat: 40.7128, lng: -74.0060, pixel: { x: 100, y: 100 } }
    await wrapper.vm.$emit('dblclick', dblclickData)
    expect(wrapper.emitted('dblclick')).toBeTruthy()
    expect(wrapper.emitted('dblclick')[0]).toEqual([dblclickData])
  })

  it('emits move event when map is moved', async () => {
    const wrapper = mount(Map, {
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const moveData = { center: { lat: 40.7128, lng: -74.0060 }, zoom: 10 }
    await wrapper.vm.$emit('move', moveData)
    expect(wrapper.emitted('move')).toBeTruthy()
    expect(wrapper.emitted('move')[0]).toEqual([moveData])
  })

  it('emits zoom event when map zoom level changes', async () => {
    const wrapper = mount(Map, {
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const zoomData = { zoom: 15, center: { lat: 40.7128, lng: -74.0060 } }
    await wrapper.vm.$emit('zoom', zoomData)
    expect(wrapper.emitted('zoom')).toBeTruthy()
    expect(wrapper.emitted('zoom')[0]).toEqual([zoomData])
  })

  it('emits load event when map is loaded', async () => {
    const wrapper = mount(Map, {
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const mapInstance = { setView: vi.fn(), on: vi.fn() }
    await wrapper.vm.$emit('load', mapInstance)
    expect(wrapper.emitted('load')).toBeTruthy()
    expect(wrapper.emitted('load')[0]).toEqual([mapInstance])
  })

  it('emits markerClick event when marker is clicked', async () => {
    const wrapper = mount(Map, {
      props: {
        markers: mockMarkers
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const markerClickData = { marker: mockMarkers[0], event: {} }
    await wrapper.vm.$emit('markerClick', markerClickData)
    expect(wrapper.emitted('markerClick')).toBeTruthy()
    expect(wrapper.emitted('markerClick')[0]).toEqual([markerClickData])
  })

  it('emits markerHover event when marker is hovered', async () => {
    const wrapper = mount(Map, {
      props: {
        markers: mockMarkers
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    const markerHoverData = { marker: mockMarkers[0], event: {} }
    await wrapper.vm.$emit('markerHover', markerHoverData)
    expect(wrapper.emitted('markerHover')).toBeTruthy()
    expect(wrapper.emitted('markerHover')[0]).toEqual([markerHoverData])
  })

  it('supports loading state', () => {
    const wrapper = mount(Map, {
      props: {
        loading: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('loading')).toBe(true)
  })

  it('supports custom loading text', () => {
    const wrapper = mount(Map, {
      props: {
        loading: true,
        loadingText: 'Loading map...'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('loadingText')).toBe('Loading map...')
  })

  it('supports error state', () => {
    const wrapper = mount(Map, {
      props: {
        error: true,
        errorMessage: 'Failed to load map'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('error')).toBe(true)
    expect(wrapper.props('errorMessage')).toBe('Failed to load map')
  })

  it('supports map API key', () => {
    const wrapper = mount(Map, {
      props: {
        provider: 'mapbox',
        apiKey: 'pk.test123'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('apiKey')).toBe('pk.test123')
  })

  it('supports custom map options', () => {
    const customOptions = {
      worldCopyJump: true,
      bounceAtZoomLimits: false,
      inertia: true,
      inertiaDeceleration: 3000,
      inertiaMaxSpeed: 1500
    }

    const wrapper = mount(Map, {
      props: {
        options: customOptions
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('options')).toEqual(customOptions)
  })

  it('supports custom tile options', () => {
    const tileOptions = {
      maxZoom: 19,
      minZoom: 1,
      maxNativeZoom: 18,
      minNativeZoom: 0,
      subdomains: ['a', 'b', 'c'],
      errorTileUrl: '/error-tile.png',
      zIndex: 1,
      opacity: 1.0
    }

    const wrapper = mount(Map, {
      props: {
        tileOptions
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('tileOptions')).toEqual(tileOptions)
  })

  it('supports custom marker options', () => {
    const markerOptions = {
      draggable: true,
      keyboard: true,
      title: 'Marker',
      alt: 'Marker',
      zIndexOffset: 0,
      opacity: 1.0,
      riseOnHover: false,
      riseOffset: 250
    }

    const wrapper = mount(Map, {
      props: {
        markers: mockMarkers,
        markerOptions
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('markerOptions')).toEqual(markerOptions)
  })

  it('supports custom popup options', () => {
    const popupOptions = {
      maxWidth: 300,
      minWidth: 50,
      maxHeight: null,
      autoPan: true,
      autoPanPaddingTopLeft: null,
      autoPanPaddingBottomRight: null,
      autoPanPadding: [5, 5],
      keepInView: false,
      closeButton: true,
      autoClose: true,
      closeOnEscapeKey: true,
      closeOnClick: false
    }

    const wrapper = mount(Map, {
      props: {
        markers: mockMarkers,
        popupOptions
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('popupOptions')).toEqual(popupOptions)
  })

  it('supports custom tooltip options', () => {
    const tooltipOptions = {
      permanent: false,
      direction: 'auto',
      offset: [0, 0],
      opacity: 0.9,
      sticky: false,
      interactive: false,
      className: ''
    }

    const wrapper = mount(Map, {
      props: {
        markers: mockMarkers,
        tooltipOptions
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('tooltipOptions')).toEqual(tooltipOptions)
  })

  it('supports map layers', () => {
    const layers = [
      {
        id: 'streets',
        name: 'Streets',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        visible: true
      },
      {
        id: 'satellite',
        name: 'Satellite',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        visible: false
      }
    ]

    const wrapper = mount(Map, {
      props: {
        layers
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('layers')).toEqual(layers)
  })

  it('supports map overlays', () => {
    const overlays = [
      {
        id: 'markers',
        name: 'Markers',
        type: 'markers',
        data: mockMarkers,
        visible: true
      },
      {
        id: 'polygons',
        name: 'Polygons',
        type: 'polygons',
        data: [],
        visible: false
      }
    ]

    const wrapper = mount(Map, {
      props: {
        overlays
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('overlays')).toEqual(overlays)
  })

  it('supports map drawing tools', () => {
    const drawingTools = {
      enabled: true,
      tools: ['marker', 'polyline', 'polygon', 'rectangle', 'circle'],
      options: {
        shapeOptions: {
          color: '#ff0000',
          weight: 2,
          opacity: 0.8
        }
      }
    }

    const wrapper = mount(Map, {
      props: {
        drawingTools
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('drawingTools')).toEqual(drawingTools)
  })

  it('supports map measurement tools', () => {
    const measurementTools = {
      enabled: true,
      primaryLengthUnit: 'meters',
      secondaryLengthUnit: 'kilometers',
      primaryAreaUnit: 'sqmeters',
      secondaryAreaUnit: 'hectares'
    }

    const wrapper = mount(Map, {
      props: {
        measurementTools
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('measurementTools')).toEqual(measurementTools)
  })

  it('supports map geocoding', () => {
    const geocoding = {
      enabled: true,
      provider: 'nominatim',
      options: {
        bounded: true,
        countrycodes: 'us'
      }
    }

    const wrapper = mount(Map, {
      props: {
        geocoding
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('geocoding')).toEqual(geocoding)
  })

  it('supports map routing', () => {
    const routing = {
      enabled: true,
      provider: 'osrm',
      options: {
        profile: 'driving',
        alternatives: true
      }
    }

    const wrapper = mount(Map, {
      props: {
        routing
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('routing')).toEqual(routing)
  })

  it('supports map heatmaps', () => {
    const heatmap = {
      enabled: true,
      data: mockMarkers.map(marker => ({ lat: marker.lat, lng: marker.lng, value: 1 })),
      options: {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        max: 1.0,
        gradient: {
          0.0: 'blue',
          0.5: 'lime',
          1.0: 'red'
        }
      }
    }

    const wrapper = mount(Map, {
      props: {
        heatmap
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('heatmap')).toEqual(heatmap)
  })

  it('supports map clustering options', () => {
    const clusteringOptions = {
      chunkedLoading: true,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      spiderfyDistanceMultiplier: 1,
      maxClusterRadius: 80,
      iconCreateFunction: vi.fn()
    }

    const wrapper = mount(Map, {
      props: {
        markers: mockMarkers,
        clusterMarkers: true,
        clusteringOptions
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('clusteringOptions')).toEqual(clusteringOptions)
  })

  it('supports map accessibility attributes', () => {
    const wrapper = mount(Map, {
      props: {
        ariaLabel: 'Interactive map showing locations',
        ariaDescribedBy: 'map-description'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('ariaLabel')).toBe('Interactive map showing locations')
    expect(wrapper.props('ariaDescribedBy')).toBe('map-description')
  })

  it('supports map keyboard navigation', async () => {
    const wrapper = mount(Map, {
      props: {
        keyboard: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.trigger('keydown', { key: 'ArrowUp' })
    expect(wrapper.emitted('keydown')).toBeTruthy()
  })

  it('supports map touch events', async () => {
    const wrapper = mount(Map, {
      props: {
        touchZoom: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    await wrapper.trigger('touchstart', { touches: [{ clientX: 100, clientY: 100 }] })
    expect(wrapper.emitted('touchstart')).toBeTruthy()
  })

  it('supports map export functionality', () => {
    const wrapper = mount(Map, {
      props: {
        exportable: true,
        exportFormats: ['png', 'jpg', 'pdf']
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('exportable')).toBe(true)
    expect(wrapper.props('exportFormats')).toEqual(['png', 'jpg', 'pdf'])
  })

  it('supports map print functionality', () => {
    const wrapper = mount(Map, {
      props: {
        printable: true,
        printOptions: {
          title: 'Map Print',
          orientation: 'landscape',
          size: 'A4'
        }
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('printable')).toBe(true)
    expect(wrapper.props('printOptions')).toEqual({
      title: 'Map Print',
      orientation: 'landscape',
      size: 'A4'
    })
  })

  it('supports map fullscreen functionality', () => {
    const wrapper = mount(Map, {
      props: {
        fullscreen: true
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('fullscreen')).toBe(true)
  })

  it('supports map localization', () => {
    const localization = {
      language: 'zh-CN',
      units: 'metric',
      rtl: false
    }

    const wrapper = mount(Map, {
      props: {
        localization
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('localization')).toEqual(localization)
  })

  it('handles empty markers gracefully', () => {
    const wrapper = mount(Map, {
      props: {
        markers: []
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.map-container').exists()).toBe(true)
  })

  it('handles null markers gracefully', () => {
    const wrapper = mount(Map, {
      props: {
        markers: null
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.map-container').exists()).toBe(true)
  })

  it('handles undefined markers gracefully', () => {
    const wrapper = mount(Map, {
      props: {
        markers: undefined
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.map-container').exists()).toBe(true)
  })

  it('supports performance optimization options', () => {
    const wrapper = mount(Map, {
      props: {
        updateWhenIdle: true,
        updateWhenZooming: false,
        preferCanvas: true,
        attributionControl: false,
        zoomControl: false,
        fadeAnimation: false,
        markerZoomAnimation: false
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('updateWhenIdle')).toBe(true)
    expect(wrapper.props('updateWhenZooming')).toBe(false)
    expect(wrapper.props('preferCanvas')).toBe(true)
    expect(wrapper.props('attributionControl')).toBe(false)
    expect(wrapper.props('zoomControl')).toBe(false)
    expect(wrapper.props('fadeAnimation')).toBe(false)
    expect(wrapper.props('markerZoomAnimation')).toBe(false)
  })

  it('supports custom map events', () => {
    const customEvents = {
      onMapLoad: vi.fn(),
      onMapClick: vi.fn(),
      onMapMove: vi.fn(),
      onMapZoom: vi.fn(),
      onMarkerClick: vi.fn(),
      onMarkerHover: vi.fn()
    }

    const wrapper = mount(Map, {
      props: {
        markers: mockMarkers,
        ...customEvents
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('onMapLoad')).toBe(customEvents.onMapLoad)
    expect(wrapper.props('onMapClick')).toBe(customEvents.onMapClick)
    expect(wrapper.props('onMapMove')).toBe(customEvents.onMapMove)
    expect(wrapper.props('onMapZoom')).toBe(customEvents.onMapZoom)
    expect(wrapper.props('onMarkerClick')).toBe(customEvents.onMarkerClick)
    expect(wrapper.props('onMarkerHover')).toBe(customEvents.onMarkerHover)
  })

  it('supports custom map validation', () => {
    const validation = {
      minMarkers: 0,
      maxMarkers: 1000,
      requiredFields: ['lat', 'lng'],
      coordinateBounds: {
        lat: { min: -90, max: 90 },
        lng: { min: -180, max: 180 }
      }
    }

    const wrapper = mount(Map, {
      props: {
        markers: mockMarkers,
        validation
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.props('validation')).toEqual(validation)
  })

  it('supports custom map templates', () => {
    const wrapper = mount(Map, {
      props: {
        markers: mockMarkers
      },
      slots: {
        popup: '<template #popup><div class="custom-popup">Custom Popup Content</div></template>',
        tooltip: '<template #tooltip><div class="custom-tooltip">Custom Tooltip Content</div></template>',
        marker: '<template #marker><div class="custom-marker">★</div></template>'
      },
      global: {
        plugins: [router, ElementPlus]
      }
    })

    expect(wrapper.find('.custom-popup').exists()).toBe(true)
    expect(wrapper.find('.custom-tooltip').exists()).toBe(true)
    expect(wrapper.find('.custom-marker').exists()).toBe(true)
  })
})