export class Player{
  constructor(audioCtx, nextNode, data){
    this.audioCtx = audioCtx;
    this.nextNode = nextNode;
    this.data = data;
  }

  createSource(){
    this.source = this.audioCtx.createBufferSource();
    this.source.buffer = this.data.buffer;
    this.source.connect(this.nextNode);
  }

  play(start, end, onended){
    this.createSource();
    this.source.onended = onended;
    this.source.start(0, start, end - start);
  }

  pause(){
    if(!this.source) return;
    this.source.stop();
    this.source.disconnect();
  }
}

export class DrawDataProcessor{
  constructor(audioCtx){
    this.audioCtx = audioCtx;
  }

  getDrawData(buffer, start_time, end_time, peakLength){
    const chs = [];
    for(let i = 0; i < buffer.numberOfChannels; i++){
      chs[i] = this.getPeaks(this.getDrawRange(buffer.getChannelData(i), start_time, end_time), peakLength);
    }

    return chs;
  }

  getDrawRange(data, start_time, end_time){
    const startIndex = this.audioCtx.sampleRate * start_time;
    const endIndex   = this.audioCtx.sampleRate * end_time;

    return data.slice(Math.floor(startIndex), Math.floor(endIndex));
  }

  getPeaks(array, peakLength){
    if(!peakLength){
      peakLength = 4500;
    }

    let step = Math.floor(array.length / peakLength);

    if(step < 1){
      step = 1;
    }

    const peaks = [];

    for(let i = 0; i < array.length; i += step){
      const result = this.getPeak(array, i, i + step);
      peaks.push(result.max, result.min);
    }

    return peaks;
  }

  getPeak(array, startIndex, endIndex){
    const sliced = array.slice(startIndex, endIndex);
    let max = sliced[0];
    let min = max;
    for(let i = 0; i < sliced.length; i++){
      const sample = sliced[i];
      if(sample > max){
        max = sample;
      }
      if(sample < min){
        min = sample;
      }
    }
    return Object.freeze({max: max, min: min});
  }
}

export class Drawer{
  constructor(canvas, ctx, data){
    this.canvas = canvas;
    this.ctx = ctx;
    this.data = data;

    this.initCtxStyle();
  }

  initCtxStyle(){
    this.ctx.fillStyle = "#78328c";
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = "#000";
  }

  draw(chs){
    this.initCtxStyle();
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    chs.forEach(data=>this.drawData(data));
  }

  drawData(buffer){
    const sliceWidth = this.canvas.width / buffer.length;
    let drawPoint = 0;

    this.ctx.beginPath();
    for (let i = 0; i < buffer.length; i++) {
      let y = (buffer[i] + 1) / 2  * this.canvas.height;

      if (i === 0) {
        this.ctx.moveTo(drawPoint, y);
      } else {
        this.ctx.lineTo(drawPoint, y);
      }
      drawPoint += sliceWidth;
    }
    this.ctx.stroke();
  }
}
