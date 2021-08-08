import WavHandler from './WavHandler.js';

export class Loader{
  constructor(audioCtx, url, data){
    this.audioCtx = audioCtx;
    this.url = url;
    this.data = data;
  }

  async load(){
    return await new Promise((resolve, reject)=>{
      const xhr = new XMLHttpRequest();
      xhr.open('GET', this.url);
      xhr.responseType = 'arraybuffer';
      xhr.onload = () => this.decodeAudioData(xhr.response, resolve);
      xhr.onerror = console.error;
      xhr.send();
    });
  }

  decodeAudioData(data, resolve){
    if(window.isSafari){
      this.audioCtx.decodeAudioData(
        data,
        buffer=>{
          this.data.buffer = buffer;
          resolve();
        },
        console.error
      );
    }else{
      this.audioCtx.decodeAudioData(data)
        .then(buffer=>{
          this.data.buffer = buffer;
          resolve();
        })
        .catch(console.error);
    }
  }
}

export class AudioRecorder{
  constructor(audioCtx, stream){
    this.audioCtx = audioCtx;
    this.source = this.audioCtx.createMediaStreamSource(stream);
    this.sp = this.audioCtx.createScriptProcessor(0, 2, 2);
    this.audioData = [];
  }

  start(){
    this.source.connect(this.sp).connect(this.audioCtx.destination);
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
