import * as tf from '@tensorflow/tfjs';
import * as speechCommands from '@tensorflow-models/speech-commands';

export class VoiceEngine {
  constructor() {
    this.recognizer = null;
    this.wakeWordDetector = null;
  }

  async initialize() {
    await tf.ready();
    this.recognizer = speechCommands.create('BROWSER_FFT');
    await this.recognizer.ensureModelLoaded();
    
    // Wake word detection
    this.wakeWordDetector = await this.loadWakeWordModel();
  }

  async processAudioStream(stream) {
    const predictions = await this.recognizer.listen(
      () => this.processAudio(stream),
      { includeSpectrogram: true, probabilityThreshold: 0.85 }
    );
    return this.processPredictions(predictions);
  }
}