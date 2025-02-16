import { MapBridge } from './core/MapBridge';
import { VoiceEngine } from './core/VoiceEngine';
import { BhuvanService } from './services/BhuvanService';

class GISApplication {
  constructor() {
    this.mapBridge = null;
    this.voiceEngine = new VoiceEngine();
    this.bhuvanService = new BhuvanService();
  }

  async initialize() {
    await this.bhuvanService.authenticate();
    await this.voiceEngine.initialize();
    
    this.mapBridge = new MapBridge('openlayers', {
      target: 'map',
      wmsUrl: 'https://bhuvan-app1.nrsc.gov.in/bhuvan/wms',
      baseLayer: 'INDIA_BASE',
      view: {
        center: [78.9629, 20.5937],
        zoom: 4
      }
    });

    this.setupUI();
  }

  setupUI() {
    // Voice interface controls
    this.micButton = document.getElementById('mic-button');
    this.micButton.addEventListener('click', () => this.toggleRecording());
  }

  async toggleRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const command = await this.voiceEngine.processAudioStream(stream);
    await this.mapBridge.executeCommand(command);
  }
}

// Initialize application
window.app = new GISApplication();
window.app.initialize();