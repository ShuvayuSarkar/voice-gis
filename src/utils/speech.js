import * as tf from '@tensorflow/tfjs';
import * as speechCommands from '@tensorflow-models/speech-commands';
import { Porcupine } from '@picovoice/porcupine-web';

export class SpeechUtils {
  static async initializeSpeechModel() {
    await tf.ready();
    const recognizer = speechCommands.create('BROWSER_FFT');
    await recognizer.ensureModelLoaded();
    return recognizer;
  }

  static async createWakeWordEngine(wakeWords = ['map', 'navigate']) {
    const accessKey = 'YOUR_PICOVOICE_ACCESS_KEY'; // Get from Picovoice Console
    const keywordPaths = wakeWords.map(word => 
      `${process.env.PUBLIC_URL}/assets/models/wake-words/${word}_ppn.js`
    );

    return Porcupine.create(
      accessKey,
      keywordPaths,
      (keywordIndex) => this.handleWakeWord(keywordIndex)
    );
  }

  static handleWakeWord(keywordIndex) {
    const wakeWords = ['map', 'navigate'];
    console.log(`Wake word detected: ${wakeWords[keywordIndex]}`);
    this.toggleVoiceProcessing(true);
  }

  static async processAudioStream(stream, callback) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);

    source.connect(processor);
    processor.connect(audioContext.destination);

    processor.onaudioprocess = (e) => {
      const audioData = e.inputBuffer.getChannelData(0);
      callback(audioData);
    };

    return { audioContext, processor, source };
  }

  static createVoiceVisualizer(canvasId) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const analyzer = new AnalyserNode(audioContext, { fftSize: 2048 });
    
    return {
      update() {
        const dataArray = new Uint8Array(analyzer.frequencyBinCount);
        analyzer.getByteTimeDomainData(dataArray);
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        dataArray.forEach((value, i) => {
          const x = (i * canvas.width) / dataArray.length;
          const y = (value / 255) * canvas.height;
          ctx.lineTo(x, y);
        });
        ctx.stroke();
      }
    };
  }

  static animateMicButton(state) {
    const mic = document.getElementById('mic-button');
    mic.style.transform = state === 'listening' 
      ? 'scale(1.2)' 
      : 'scale(1)';
    mic.style.filter = state === 'processing'
      ? 'drop-shadow(0 0 8px #00ff88)'
      : 'none';
  }
}