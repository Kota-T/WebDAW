class RecorderProcessor extends AudioWorkletProcessor {
  process(inputs){
    const inputData = inputs[0][0];
    if(!(inputData instanceof Float32Array))
      return true;
    const array = new Float32Array(inputData.length * 2);
    for(let sample = 0; sample < inputData.length; sample++) {
      array[sample * 2] = array[sample * 2 + 1] = inputData[sample];
    }
    this.port.postMessage(array);
    return true;
  }
}

registerProcessor('recorder-processor', RecorderProcessor);
