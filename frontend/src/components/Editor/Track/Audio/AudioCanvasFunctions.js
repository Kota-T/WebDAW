export class DrawDataProcessor{
  getDrawData(audioBuffer, start_time, end_time, peakLength){
    const startIndex = Math.floor(audioBuffer.sampleRate * start_time);
    const endIndex   = Math.floor(audioBuffer.sampleRate * end_time);

    const chs = [];
    for(let i = 0; i < audioBuffer.numberOfChannels; i++){
      chs[i] = this.getPeaks(audioBuffer.getChannelData(i), startIndex, endIndex, peakLength);
    }

    return chs;
  }

  getPeaks(array, startIndex, endIndex, peakLength=4500){
    let step = Math.floor((endIndex - startIndex) / peakLength);

    if(step < 2){
      return array.slice(startIndex, endIndex);
    }

    const peaks = [];

    for(let i = startIndex; i < endIndex; i += step){
      const result = this.getPeak(array, i, i + step);
      peaks.push(result[0], result[1]);
    }

    return peaks;
  }

  getPeak(array, startIndex, endIndex){
    let max = array[startIndex];
    let min = max;
    for(let i = startIndex + 1; i < endIndex; i++){
      const sample = array[i];
      if(sample > max){
        max = sample;
      }
      if(sample < min){
        min = sample;
      }
    }
    return [max, min];
  }
}

export class Drawer{
  initCtxStyle(ctx){
    ctx.fillStyle = "#78328c";
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000";
  }

  draw(canvas, ctx, channels){
    this.initCtxStyle(ctx);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.drawData(canvas, ctx, channels);
  }

  drawData(canvas, ctx, channels){
    channels.forEach(buffer=>{
      const sliceWidth = canvas.width / buffer.length;
      let drawPoint = 0;

      ctx.beginPath();
      for (let i = 0; i < buffer.length; i++) {
        const y = (buffer[i] + 1) * canvas.height / 2;

        if (i === 0) {
          ctx.moveTo(drawPoint, y);
        } else {
          ctx.lineTo(drawPoint, y);
        }
        drawPoint += sliceWidth;
      }
      ctx.stroke();
    });
  }
}
