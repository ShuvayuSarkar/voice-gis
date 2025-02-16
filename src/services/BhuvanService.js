import axios from 'axios';
import { GPUHelper } from '../utils/gpu.js';

export class BhuvanService {
  constructor() {
    this.baseURL = 'https://bhuvan-app1.nrsc.gov.in/bhuvan/wms';
    this.token = null;
    this.cache = new Map();
  }

  async authenticate(apiKey) {
    try {
      const response = await axios.post(`${this.baseURL}/auth`, {
        key: apiKey
      });
      this.token = response.data.token;
      return true;
    } catch (error) {
      console.error('Bhuvan authentication failed:', error);
      return false;
    }
  }

  async getLayer(layerName, params = {}) {
    const cacheKey = `${layerName}_${JSON.stringify(params)}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const wmsParams = {
      service: 'WMS',
      version: '1.3.0',
      request: 'GetMap',
      layers: layerName,
      crs: 'EPSG:4326',
      format: 'image/png',
      transparent: true,
      width: 512,
      height: 512,
      ...params
    };

    try {
      const response = await axios.get(this.baseURL, {
        params: wmsParams,
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : {}
      });

      const tileLayer = this.createOptimizedLayer(response.data);
      this.cache.set(cacheKey, tileLayer);
      return tileLayer;
    } catch (error) {
      console.error('Failed to fetch Bhuvan layer:', error);
      throw new Error('Layer request failed');
    }
  }

  createOptimizedLayer(data) {
    return {
      source: new ol.source.TileWMS({
        url: this.baseURL,
        params: {
          LAYERS: data.layers,
          TILED: true
        },
        transition: 0,
        cacheSize: 512,
        crossOrigin: 'anonymous'
      }),
      renderer: GPUHelper.isWebGLAvailable() ? 'webgl' : 'canvas'
    };
  }

  static get preconfiguredLayers() {
    return {
      BASE: 'INDIA_BASE',
      SATELLITE: 'INDIA_HR_IMAGERY',
      TOPO: 'INDIA_TOPO',
      ROADS: 'INDIA_ROAD_NETWORK'
    };
  }
}