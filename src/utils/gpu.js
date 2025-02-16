export class GPUHelper {
  static enableWebGL() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('experimental-webgl');
    
    if (gl) {
      tf.setBackend('webgl');
      gl.enable(gl.DEBUG_OUTPUT);
    }
  }

  static optimizeTileRendering() {
    ol.source.TileWMS.prototype.tileCache = new ol.Cache({
      maxSize: 512
    });
  }
}