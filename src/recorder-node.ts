export class RecorderNode extends AudioWorkletNode {
  constructor(audioCtx: AudioContext){
    super(audioCtx, 'recorder-processor');
    this.buffers = [];
    this.port.onmessage = e => this.buffers.push(e.data);
  }

  mergeBuffers(buffers): Float32Array {
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
