class RecorderProcessor extends AudioWorkletProcessor {
  process(inputs){
    const input = inputs[0][0];
    if(!(input instanceof Float32Array))
      return true;
    const array = new Float32Array(input.length * 2);
    for(let sample = 0; sample < input.length; sample++) {
      array[sample * 2] = array[sample * 2 + 1] = input[sample];
    }
    this.port.postMessage(array);
    return true;
  }
}

registerProcessor('recorder-processor', RecorderProcessor);
