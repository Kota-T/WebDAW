<template>
  <div
  class="track_audio_container"
  @pointerdown="e=>$emit('track-selected', e.shiftKey)"
  ref="domElement"
  >
    <DraftCanvas :audioCtx="audioCtx" :sourceNode="sourceNode" ref="draftCanvas"/>
    <AudioCanvas
    v-for="data in audioParamStack"
    :key="data.id"
    :data="data"
    :audioCtx="audioCtx"
    :nextNode="nextNode"
    :ref="setAudioRef"
    @track-selected="shiftKey=>$emit('track-selected', shiftKey)"
    @remove="removeAudioCanvasByUser(data.id)"
    />
  </div>
</template>

<style>
.track_audio_container{
  height: 120px;
  position: relative;
}
</style>

<script>
import IdManager from '../../../../IdManager.js';

import { AudioRecorder } from '../../../../webaudio/webaudio.js';

import DraftCanvas from './DraftCanvas.vue';
import AudioCanvas from './AudioCanvas.vue';

export default {
  name: 'TrackAudioContainer',
  components: {
    DraftCanvas,
    AudioCanvas
  },
  props: ['audioCtx', 'sourceNode', 'nextNode', 'pointer'],
  emits: ['track-selected', 'audio-remove'],
  data(){
    return {
      audioParamStack: [],
      audioStack: []
    }
  },
  created(){
    this.audioIdManager = new IdManager(8);
    this.initRecorder();
  },
  methods: {
    setAudioRef(el){
      if(el && !this.audioStack.includes(el)){
        this.audioStack.push(el);
      }
    },

    createAudioCanvas(audioData){
      if(!audioData.hasOwnProperty('id'))
        audioData.id = this.audioIdManager.generateId();
      else
        this.audioIdManager.storeId(audioData.id);
      this.audioParamStack.push(audioData);
    },

    removeAudioCanvas(audioId){
      this.audioStack = [];
      const index = this.audioParamStack.findIndex(audio => audio.id === audioId);
      this.audioParamStack.splice(index, 1);
      this.audioIdManager.removeId(audioId);
    },

    removeAudioCanvasByUser(audioId){
      if(!window.confirm("選択されているオーディオを削除しますか？")) return;
      this.$emit('audio-remove', audioId);
      this.removeAudioCanvas(audioId);
    },

    initRecorder(){
      this.recorder = new AudioRecorder(this.audioCtx, this.sourceNode);

      let startPoint;
      let recordingId;

      this.recorder.onstart = ()=>{
        startPoint = this.pointer.x;
        this.$refs.draftCanvas.show(startPoint);
        let loop = ()=>{
          this.$refs.draftCanvas.draw();
          recordingId = requestAnimationFrame(loop);
        }
        recordingId = requestAnimationFrame(loop);
      }

      this.recorder.onstop = url=>{
        cancelAnimationFrame(recordingId);
        this.createAudioCanvas({startPoint: startPoint, url: url});
        this.$refs.draftCanvas.hide();
      }
    },

    startRecording(){
      this.recorder.start();
    },

    stopRecording(){
      this.recorder.stop();
    },

    getCurrentAudio(startPoint){
      return this.audioStack.find(
        audio => audio && audio.startPoint <= startPoint && audio.endPoint >= startPoint
      );
    },

    play(){
      const loop = ()=>{
        const startPoint = this.pointer.x;
        const audio = this.getCurrentAudio(startPoint);
        if(audio && audio !== this.currentAudio){
          this.currentAudio?.pause();
          this.currentAudio = audio;
          this.currentAudio.play(startPoint, () => this.currentAudio = null);
        }
        this.playId = requestAnimationFrame(loop);
      }
      this.playId = requestAnimationFrame(loop);
    },

    pause(){
      cancelAnimationFrame(this.playId);
      this.currentAudio?.pause();
      this.currentAudio = null;
    },

    getDownloadData(folder){
      return this.audioStack.map((audioCanvas, index)=>audioCanvas.getDownloadData(folder, index));
    },

    getUploadData(){
      return this.audioStack.map(audioCanvas=>audioCanvas.getUploadData());
    },

    createOffline(offlineCtx, nextNode, startRecordingTime, stopRecordingTime){
      this.audioStack.forEach(audioCanvas=>audioCanvas.createOfflineSource(offlineCtx, nextNode, startRecordingTime, stopRecordingTime));
    }
  }
}
</script>
