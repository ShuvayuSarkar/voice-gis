import ol from 'openlayers';

export class OpenLayersAdapter {
  constructor(config) {
    this.map = new ol.Map({
      target: config.target,
      layers: this.createBaseLayers(config),
      view: new ol.View(config.view)
    });
    this.setupGPUAcceleration();
  }

  createBaseLayers(config) {
    return [
      new ol.layer.Tile({
        source: new ol.source.TileWMS({
          url: config.wmsUrl,
          params: {
            LAYERS: config.baseLayer,
            TILED: true,
            CRS: 'EPSG:4326'
          }
        })
      })
    ];
  }

  setupGPUAcceleration() {
    ol.layer.WebGLTile.registerTransformation({
      // Custom WebGL shaders
    });
  }

  zoomTo(params) {
    this.map.getView().animate({
      center: ol.proj.fromLonLat(params.coordinates),
      zoom: params.zoom
    });
  }
}