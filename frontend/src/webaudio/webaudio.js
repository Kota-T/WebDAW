import WavHandler from './WavHandler.js';

export function loadAudioBuffer(audioCtx, url){
  return fetch(url)
  .then(res=>res.arrayBuffer())
  .then(res=>audioCtx.decodeAudioData(res))
}

export class AudioRecorder{
  constructor(audioCtx, sourceNode){
    this.audioCtx = audioCtx;
    this.sourceNode = sourceNode;
    this.recorderNode = this.audioCtx.createScriptProcessor(0, 1);
    this.recorderNode.onaudioprocess = e=>{
      const inputData = e.inputBuffer.getChannelData(0);
      const array = new Float32Array(e.inputBuffer.length * 2);
      for(let sample = 0; sample < e.inputBuffer.length; sample++) {
        array[sample * 2] = array[sample * 2 + 1] = inputData[sample];
      }
      this.audioData.push(array);
    }
    this.audioData = [];
  }

  start(){
    this.sourceNode.connect(this.recorderNode).connect(this.audioCtx.destination);
    this.onstart();
  }

  stop(){
    this.sourceNode.disconnect(this.recorderNode);
    this.recorderNode.disconnect();
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
