import WavHandler from './WavHandler.js';

export class Loader{
  constructor(audioCtx, url, data){
    this.audioCtx = audioCtx;
    this.url = url;
    this.data = data;
  }

  async load(){
    return await fetch(this.url)
    .then(res=>res.arrayBuffer())
    .then(res=>this.audioCtx.decodeAudioData(res))
    .then(buf=>this.data.buffer = buf)
    .catch(console.error);
  }
}

export class AudioRecorder{
  constructor(audioCtx, stream){
    this.audioCtx = audioCtx;
    this.source = this.audioCtx.createMediaStreamSource(stream);
    this.pannerNode = this.audioCtx.createStereoPanner();
    this.sp = this.audioCtx.createScriptProcessor(0, 2, 2);
    this.audioData = [];
  }

  start(){
    this.source.connect(this.pannerNode).connect(this.sp).connect(this.audioCtx.destination);
    this.sp.onaudioprocess = e=>this.audioData.push(WavHandler.AudioBuffer2WavData(e.inputBuffer));
    this.onstart();
  }

  stop(){
    this.source.disconnect();
    this.sp.disconnect();
    this.onstop(
      WavHandler.writeWav(
        this.mergeBuffers(this.audioData),
        this.audioCtx.sampleRate
      )
    );
    this.audioData = [];
  }

  mergeBuffers(audioData) {
    let sampleLength = 0;
    for (let i = 0; i < audioData.length; i++) {
      sampleLength += audioData[i].length;
    }
    let samples = new Float32Array(sampleLength);
    let sampleIdx = 0;
    for (let i = 0; i < audioData.length; i++) {
      for (let j = 0; j < audioData[i].length; j++) {
        samples[sampleIdx] = audioData[i][j];
        sampleIdx++;
      }
    }
    return samples;
  };
}
