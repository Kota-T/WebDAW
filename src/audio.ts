import { TrackData } from './type.d'
import { v4 as uuidv4 } from 'uuid'
import { watch } from 'vue'

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

export function createTrack(): TrackData {
  const trackData = {
    id: uuidv4(),
    type: 'audio',
    name: "新規トラック",
    gain: 0.5,
    pan: 0,
    mic: false,
    mute: false,
    solo: false,
    canvases: []
  }

  const gainNode = new GainNode(audioCtx)
  const pannerNode = new StereoPannerNode(audioCtx)
  const muteNode = new GainNode(audioCtx)
  const soloNode = new GainNode(audioCtx)

  sourceNode
    .connect(gainNode)
    .connect(pannerNode)
    .connect(muteNode)
    .connect(soloNode)
    .connect(audioCtx.destination)

  watch(() => trackData.gain, newVal => gainNode.gain.value = newVal)
  watch(() => trackData.pan, newVal => pannerNode.pan.value = newVal)
  watch(() => trackData.mute, newVal => muteNode.gain.value = newVal ? 0 : 1)
  watch(() => trackData.mic, newVal => {
    if(newVal)
      sourceNode.connect(gainNode)
    else
      sourceNode.disconnect(gainNode)
  })

  return trackData
}
