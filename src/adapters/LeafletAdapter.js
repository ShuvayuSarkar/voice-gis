import L from 'leaflet';
import { BhuvanService } from '../services/BhuvanService';
import { Geocoder } from '../services/Geocoder';

export class LeafletAdapter {
  constructor(config) {
    this.config = config;
    this.map = null;
    this.layers = new Map();
    this.geocoder = new Geocoder();
    this.bhuvanService = new BhuvanService();
    this.initializeMap();
  }

  initializeMap() {
    this.map = L.map(this.config.target, {
      center: this.config.view.center,
      zoom: this.config.view.zoom,
      preferCanvas: true, // Optimize for performance
    });

    // Add base layer
    this.addBaseLayer();
  }

  async addBaseLayer() {
    const baseLayer = await this.bhuvanService.getLayer(
      BhuvanService.preconfiguredLayers.BASE
    );
    this.layers.set('base', baseLayer.addTo(this.map));
  }

  async zoomTo(params) {
    const { location, zoom } = params;
    const coords = await this.geocoder.geocode(location);
    this.map.setView([coords.lat, coords.lon], zoom || this.config.view.zoom);
  }

  async panTo(params) {
    const { location } = params;
    const coords = await this.geocoder.geocode(location);
    this.map.panTo([coords.lat, coords.lon]);
  }

  async addMarker(params) {
    const { location, popupText } = params;
    const coords = await this.geocoder.geocode(location);
    L.marker([coords.lat, coords.lon])
      .addTo(this.map)
      .bindPopup(popupText || location);
  }

  toggleLayer(params) {
    const { layerName, visible } = params;
    const layer = this.layers.get(layerName);
    if (layer) {
      visible ? layer.addTo(this.map) : layer.remove();
    }
  }

  setView(params) {
    const { center, zoom } = params;
    this.map.setView(center, zoom);
  }

  getCurrentView() {
    const center = this.map.getCenter();
    const zoom = this.map.getZoom();
    return { center: [center.lat, center.lng], zoom };
  }
}