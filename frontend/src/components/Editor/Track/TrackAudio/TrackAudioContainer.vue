<template>
  <div
  class="track_audio_container"
  @pointerdown="$emit('track-selected')"
  ref="domElement">
    <DraftCanvas :audioCtx="audioCtx" :stream="stream" ref="draftCanvas"/>
    <AudioCanvas
    v-for="(initConfig, index) in audioParamStack"
    :key="initConfig.id"
    :initConfig="initConfig"
    :audioCtx="audioCtx"
    :audioNode="audioNode"
    :ref="setAudioRef"
    @track-selected="$emit('track-selected')"
    @remove="removeAudioCanvas(index)"
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
import { AudioRecorder } from '../../../../webaudio/webaudio.js';

import DraftCanvas from './DraftCanvas.vue';
import AudioCanvas from './AudioCanvas.vue';

export default {
  name: 'TrackAudioContainer',
  components: {
    DraftCanvas, AudioCanvas
  },
  props: ['audioCtx', 'audioNode', 'stream', 'pointer'],
  emits: ['track-selected'],
  data(){
    return {
      audioParamStack: [],
      lastAudioId: 0,
      audioStack: []
    }
  },
  created(){
    this.initRecorder();
  },
  methods: {
    setAudioRef(el){
      if(!this.audioStack.includes(el)){
        this.audioStack.push(el);
      }
    },

    createAudioCanvas(initConfig){
      this.audioStack = [];
      initConfig.id = this.lastAudioId;
      this.audioParamStack.push(initConfig);
      this.lastAudioId++;
    },

    removeAudioCanvas(index){
      this.audioStack = [];
      this.audioParamStack.splice(index, 1);
    },

    initRecorder(){
      this.recorder = new AudioRecorder(this.audioCtx, this.stream);

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

    remove(){
      this.$refs.domElement.remove();
    },

    getDownloadData(folder){
      return this.audioStack.map((audioCanvas, index)=>audioCanvas.getDownloadData(folder, index));
    },

    getUploadData(){
      return this.audioStack.map(audioCanvas=>audioCanvas.getUploadData());
    },

    createOffline(offlineCtx, gainNode, start_time, stop_time){
      this.audioStack.forEach(audioCanvas=>audioCanvas.createOfflineSource(offlineCtx, gainNode, start_time, stop_time));
    }
  }
}
</script>
