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
  constructor(audioCtx, stream, nextNode){
    this.audioCtx = audioCtx;
    this.source = this.audioCtx.createMediaStreamSource(stream);
    this.sp = this.audioCtx.createScriptProcessor(0, 1, 2);
    this.nextNode = nextNode;
    this.audioData = [];
  }

  start(){
    this.source.connect(this.sp).connect(this.nextNode);
    this.sp.onaudioprocess = e=>{
      for(let channel = 0; channel < e.outputBuffer.numberOfChannels; channel++) {
        const inputData = e.inputBuffer.getChannelData(0);
        const outputData = e.outputBuffer.getChannelData(channel);
        for(let sample = 0; sample < e.inputBuffer.length; sample++) {
          outputData[sample] = inputData[sample];
        }
      }
      this.audioData.push(WavHandler.AudioBuffer2WavData(e.outputBuffer));
    }
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

  mergeBuffers(audioData){
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
  }
}
