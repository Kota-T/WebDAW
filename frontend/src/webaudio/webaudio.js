import WavHandler from './WavHandler.js';

export function loadAudioBuffer(audioCtx, url){
  return fetch(url)
  .then(res=>res.arrayBuffer())
  .then(res=>audioCtx.decodeAudioData(res))
}

class RecorderNode extends AudioWorkletNode {
  constructor(audioCtx){
    super(audioCtx, 'recorder-processor');
    this.buffers = [];
    this.port.onmessage = e => this.buffers.push(e.data);
  }

  mergeBuffers(buffers){
    const sampleLength = buffers.reduce((acc, buf) => acc + buf.length, 0);
    const samples = new Float32Array(sampleLength);
    let sampleIdx = 0;
    for (let i = 0; i < buffers.length; i++) {
      for (let j = 0; j < buffers[i].length; j++) {
        samples[sampleIdx] = buffers[i][j];
        sampleIdx++;
      }
    }

    return samples;
  }

  getData(){
    const samples = this.mergeBuffers(this.buffers);
    this.buffers = [];
    return samples;
  }
}

export class AudioRecorder{
  constructor(audioCtx, sourceNode){
    this.audioCtx = audioCtx;
    this.sourceNode = sourceNode;
    this.recorderNode = new RecorderNode(audioCtx);
  }

  start(){
    this.onstart();
    this.sourceNode.connect(this.recorderNode).connect(this.audioCtx.destination);
  }

  stop(){
    this.sourceNode.disconnect(this.recorderNode);
    this.recorderNode.disconnect();
    this.onstop(
      WavHandler.writeWav(
        this.recorderNode.getData(),
        this.audioCtx.sampleRate
      )
    );
  }
}
