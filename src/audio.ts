export const audioCtx = new AudioContext()
audioCtx.audioWorklet.addModule('./RecorderProcessor.js');

export const sourceNode = await navigator.mediaDevices
  .getUserMedia({
    video: false,
    audio: true
  })
  .then(mediaStream=>{
    const sourceNode = new MediaStreamAudioSourceNode(audioCtx, { mediaStream });
    const mergerNode = new ChannelMergerNode(audioCtx, { numberOfInputs: 1 });
    sourceNode.connect(mergerNode, 0 ,0);
    return mergerNode
  })
  .catch(err=>{
    alert("マイク入力を取得できません。");
    throw new Error();
  });
