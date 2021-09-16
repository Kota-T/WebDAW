class AudioRecordingProcessor extends AudioWorkletProcessor{
  constructor(){
    super();
  }

  process(inputs, outputs){
    outputs[0].forEach(channel=>{
      for(let i = 0; i < channel.length; i++){
        channel[i] = inputs[0][0][i];
      }
    });
    return true;
  }
}
