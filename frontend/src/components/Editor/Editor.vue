<template>
  <div id="header">
    <Count ref="count" :audioCtx="audioCtx"/>
    <Rhythm ref="rhythm"/>
    <img src="../../assets/play.png"  class="play-or-pause" v-show="state === null" @click="play">
    <img src="../../assets/pause.png" class="play-or-pause" v-show="state === 'playing'"  @click="pause">
    <button type="button" id="start" @click="state === 'preparing' || state === 'recording' ? stopRecording() : startRecording()">R</button>
    <Bpm ref="bpm"/>
    <Resizer ref="resizer"/>
  </div>
  <div id="label_field" class="no-scroll-bar" @scroll="$refs.ruler_layer.scrollTop = $refs.label_field.scrollTop" ref="label_field">
    <div id="add_track_btn" title="トラックを追加" @click="audioCtx.resume();$emit('add-track');"><img src="../../assets/plus_icon.png"></div>
  </div>
  <div id="pointer_layer" class="no-scroll-bar" @click="shiftPointer" ref="pointer_layer">
    <Pointer :margin="20" @move="onPointerMove" ref="pointer"/>
    <div
    id="ruler_layer"
    class="no-scroll-bar"
    @scroll="$refs.label_field.scrollTop = $refs.ruler_layer.scrollTop"
    @touchstart="startTouches"
    @touchmove="zoomWithTouches"
    ref="ruler_layer"
    >
      <Ruler ref="ruler"/>
    </div>
  </div>
  <component
  v-for="trackData in trackParams"
  :key="trackData.id"
  :is="trackData.component"
  :trackData="trackData"
  :audioCtx="audioCtx"
  :sourceNode="sourceNode"
  :videoStream="videoStream"
  :midiInput="midiInput"
  :ref="setTrackRef"
  @track-solo="makeTracksSolo"
  @track-remove="removeTrackByUser(trackData.id)"
  ></component>
</template>

<style>
:root{
  --header-height: 80px;
  --label-field-width: 200px;
  --pointer-margin: 20px;
}
#header{
  background-color: #323232;
  width: 100vw;
  height: var(--header-height);
  border-bottom: 1px solid white;
  display: flex;
  justify-content: center;
  align-items: center;
}
#header > *{
  margin: 0 10px;
}
.play-or-pause{
  display: block;
  width: 40px;
  height: 40px;
}
.play-or-pause:hover{
  cursor: pointer;
}
#start{
  font-size: 30px;
  display: block;
  background-color: red;
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
#start:hover{
  cursor: pointer;
}
.no-scroll-bar{
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.no-scroll-bar::-webkit-scrollbar{
  display: none;
}
#label_field{
  width: var(--label-field-width);
  position: absolute;
  top: var(--header-height);
  bottom: 0;
  left: 0;
  overflow-y: scroll;
}
#add_track_btn{
  background-color: #aaaaaa;
  width: 100%;
  height: 30px;
  position: sticky;
  top: 0;
  touch-action: none;
}
#add_track_btn img{
  height: 20px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
}
#add_track_btn:hover{
  cursor: pointer;
}
#pointer_layer{
  background-color: #323232;
  position: absolute;
  top: var(--header-height);
  right: 0;
  bottom: 0;
  left: var(--label-field-width);
  overflow-x: scroll;
  overflow-y: hidden;
  font-size: 0;
  touch-action: manipulation;
}
#ruler_layer{
  background-color: #323232;
  position: absolute;
  top: 0;
  bottom: 0;
  left: var(--pointer-margin);
  overflow-x: visible;
  overflow-y: scroll;
  font-size: 0;
  touch-action: manipulation;
}
.canvas-container{
  height: 120px;
  position: relative;
}
.draft-canvas{
  position: absolute;
  z-index: 1;
}
.data-canvas{
  position: absolute;
  top: 0;
}
.data-canvas:hover{
  cursor: pointer;
}
.data-canvas:focus{
  border: 1px solid white;
  outline: none;
}
</style>

<script>
import WebMidi from 'webmidi';
import JSZip from 'jszip';

import IdManager from '../../IdManager.js';
import { WavHandler } from '../../audio.js';

import Count from './Header/Count.vue';
import Rhythm from './Header/Rhythm.vue';
import Bpm from './Header/Bpm.vue';
import Resizer from './Header/Resizer.vue';

import Ruler from './Ruler.vue';
import Pointer from './Pointer.vue';
import AudioTrack from './Track/Audio/AudioTrack.vue';
import VideoTrack from './Track/Video/VideoTrack.vue';
import MidiTrack from './Track/Midi/MidiTrack.vue';

export default {
  name: 'Editor',
  components: {
    Count,
    Rhythm,
    Bpm,
    Resizer,
    Ruler,
    Pointer,
    AudioTrack,
    VideoTrack,
    MidiTrack
  },
  emits: ['add-track'],
  inject: ['socket'],
  data(){
    return {
      trackParams: [],
      tracks: [],
      audioCtx: null,
      sourceNode: null,
      videoStream: null,
      midiInput: null,
      state: null//"playing" or "preparing" or "recording" or null
    }
  },
  async created(){
    this.trackIdManager = new IdManager(8);
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.audioCtx.onstatechange = () => {
      if(this.audioCtx.state !== 'running')
        this.audioCtx.resume();
    }
    await this.audioCtx.audioWorklet.addModule('./RecorderProcessor.js');
  },
  mounted(){
    document.ondragover = e=>{
      e.stopPropagation();
      e.preventDefault();
    }

    document.ondrop = async e=>{
      e.stopPropagation();
      e.preventDefault();

      const items = e.dataTransfer.items;

      if(items.length === 1){
        const item = items[0];
        const entry = item.getAsEntry?.() || item.webkitGetAsEntry?.();

        if(entry.isFile){
          entry.file(
            async file=>{
              if(this.isAudioFile(file)){
                this.loadAudioFile(file);
              }else if(this.isVideoFile(file)){
                this.loadVideoFile(file);
              }else if(file.type === 'application/zip'){
                const data = await this.readProjectZip(file);
                this.loadProject(data);
              }
            },
            console.error
          );
        }else if(entry.isDirectory){
          const data = await this.readProjectDirectory(entry);
          this.loadProject(data);
        }
      }
    }

    document.onkeydown = e=>{
      switch(e.key){
        case "r":
          this.state !== "recording" ? this.startRecording() : undefined;
          break;
        case "Backspace":
          this.state !== "recording" ? this.removeSelectedTracks() : undefined;
          break;
        case " ":
          e.preventDefault();
          switch(this.state){
            case "preparing":
            case "recording":
              this.stopRecording();
              break;
            case "playing":
              this.pause();
              break;
            default:
              this.play();
              break;
          }
          break;
      }
    }
  },
  methods: {
    async getAudioStream(){
      if(this.sourceNode?.mediaStream?.active){ return; }
      await navigator.mediaDevices
        .getUserMedia(
          {
            video: false,
            audio: {
              autoGainControl: false,
              echoCancellation: false,
              noiseSuppression: false,
              sampleRate: 44100
            }
          }
        )
        .then(stream=>{
          const sourceNode = this.audioCtx.createMediaStreamSource(stream);
          this.sourceNode = this.audioCtx.createChannelMerger(1);
          sourceNode.connect(this.sourceNode, 0 ,0);
        })
        .catch(err=>{
          alert("マイク入力を取得できません。");
          throw new Error();
        });
    },

    async getVideoStream(){
      if(this.videoStream?.active){ return; }
      await navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then(stream => this.videoStream = stream)
        .catch(err=>{
          alert("カメラを取得できません。");
          throw new Error();
        });
    },

    async getMidiInput(){
      if(this.midiInput){ return; }
      await new Promise(
        (resolve, reject)=>WebMidi.enable(err=>{
          if(err)
            reject("web midi error");
          resolve(WebMidi.inputs[0]);
        })
      )
      .then(midiInput => this.midiInput = midiInput)
      .catch(err=>{
        alert("MIDI入力を取得できません。");
        throw new Error();
      });
    },

    setTrackRef(el){
      if(el && !this.tracks.includes(el)){
        this.tracks.push(el);
      }
    },

    async addTrack(trackData={}){
      try{
        if(trackData.component === "AudioTrack")
          await this.getAudioStream();
        else if(trackData.component === "VideoTrack"){
          if(!MediaRecorder.isTypeSupported('video/webm;codecs=vp9')){
            alert("このブラウザではwebm形式がサポートされていないので録画ができません。")
            return;
          }
          await this.getVideoStream();
        }else if(trackData.component === "MidiTrack"){
          await this.getMidiInput();
        }else
          return;
      }catch(e){ return; }

      if(!trackData.hasOwnProperty('id'))
        trackData.id = this.trackIdManager.generateId();
      else
        this.trackIdManager.storeId(trackData.id);
      this.trackParams.push(trackData);
    },

    async addTrackByUser(trackData={}){
      await this.addTrack({ ...trackData, send: true });
    },

    removeTrack(trackId){
      this.tracks = [];
      const index = this.trackParams.findIndex(param => param.id === trackId);
      this.trackParams.splice(index, 1);
      this.trackIdManager.removeId(trackId);
    },

    removeTrackByUser(trackId){
      if(!window.confirm("選択されているトラックを削除しますか？")) return;
      this.removeTrack(trackId);
      if(this.socket.connected)
        this.socket.send({ type: "removeTrack", trackId });
    },

    removeSelectedTracks(){
      this.tracks
        .filter(track=>track.isSelected)
        .forEach(track=>this.removeTrackByUser(track.trackData.id));
    },

    makeTracksSolo(){
      if(this.tracks.every(track => !track.isSolo)){
        this.tracks.forEach(track => track.setSolo?.(true));
      }else{
        this.tracks.forEach(track => track.setSolo?.(track.isSolo));
      }
    },

    onPointerMove({ layerX, x }){
      const pointer_layer = this.$refs.pointer_layer;
      if(this.state === "recording" && layerX - pointer_layer.scrollLeft > pointer_layer.offsetWidth){
        pointer_layer.scrollLeft += pointer_layer.offsetWidth;
      }
      if(x >= this.$store.getters.ruler_width){
        this.$store.commit('addProjectDuration', 30);
      }
    },

    shiftPointer(e){
      if(this.state === "recording" || e.offsetY > 30) return;
      this.$refs.pointer.layerX = e.clientX - 200 + this.$refs.pointer_layer.scrollLeft;
      this.$refs.count.setNumberFromPointerX(this.$refs.pointer.x);
      if(this.state === "playing"){
        this.pause();
        this.play();
      }
    },

    getTouchesDiff(touches){
      const x1 = touches[0].clientX;
      const y1 = touches[0].clientY;

      const x2 = touches[1].clientX;
      const y2 = touches[1].clientY;
      return Math.sqrt(Math.pow(x2 - x1, 2), Math.pow(y2 - y1));
    },

    startTouches(e){
      if(state !== "recording" || e.touches.length === 2)
        this.oldTouchesDiff = this.getTouchesDiff(e.touches);
    },

    zoomWithTouches(e){
      if(state === "recording" || e.touches.length !== 2) return;
      e.preventDefault();
      const curDiff = this.getTouchesDiff(e.touches);
      const newVal = Math.round(this.$store.state.beat_width * curDiff / this.oldTouchesDiff);
      if(10 < newVal && newVal < 100){
        this.$refs.resizer.value = newVal;
        this.$store.commit('beat_width', newVal);
        this.oldTouchesDiff = curDiff;
      }
    },

    async startRecording(){
      this.selectedTracks = this.tracks.filter(track=>track.isSelected);
      const notSelectedTracks = this.tracks.filter(track=>!track.isSelected);
      if(!this.selectedTracks.length){return;}

      try{
        if(this.selectedTracks.filter(track=>track.component==="AudioTrack").length)
          await this.getAudioStream();
        if(this.selectedTracks.filter(track=>track.component==="VideoTrack").length)
          await this.getVideoStream();
      }catch(e){ return; }

      if(this.state === "playing"){
        this.pause();
      }

      this.$refs.pointer.prepareRecording();
      this.$refs.count.setNumberFromPointerX(this.$refs.pointer.x);
      this.$refs.count.start();
      this.$refs.pointer.start();
      notSelectedTracks.forEach(track=>track.play());

      this.state = "preparing";

      setTimeout(()=>{
        if(this.state !== "preparing") return;
        this.state = "recording";
        this.$refs.bpm.disabled = true;
        this.$refs.resizer.disabled = true;
        this.selectedTracks.forEach(track=>track.startRecording());
      }, (this.$store.getters.bar_width / this.$store.getters.second_width) * 1000);
    },

    stopRecording(){
      if(this.state === "recording"){
        this.$refs.bpm.disabled = false;
        this.$refs.resizer.disabled = false;
        this.selectedTracks.forEach(track=>track.stopRecording());
      }
      this.pause();
    },

    async play(){
      this.tracks.forEach(track=>track.play());
      const scale_width = this.$store.getters.scale_width;
      const x = this.$refs.pointer.x;
      const remain_interval = x > 0 ? scale_width - x % scale_width : -(x % scale_width);
      const start_time = remain_interval / this.$store.getters.second_width;
      this.$refs.count.start(start_time);
      this.$refs.pointer.start();
      this.state = "playing";
    },

    pause(){
      this.tracks.forEach(track=>track.pause());
      this.$refs.count.stop();
      this.$refs.pointer.stop();
      this.state = null;
    },

    isAudioFile(file){
      return file.type.split('/')[0] === "audio";
    },

    async loadAudioFile(file){
      await this.addTrackByUser({
        component: "AudioTrack",
        canvases: [
          {
            startTime: 0,
            url: URL.createObjectURL(file)
          }
        ]
      });
    },

    isVideoFile(file){;
      return file.type.split("/")[0] === "video";
    },

    async loadVideoFile(file){
      await this.addTrackByUser({
        component: "VideoTrack",
        canvases: [
          {
            startTime: 0,
            url: URL.createObjectURL(file)
          }
        ]
      });
    },

    download(url, filename){
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
    },

    downloadProject(){
      this.getDownloadData()
        .then(blob=>this.download(URL.createObjectURL(blob), 'project.zip'));
    },

    getProjectConfig(){
      const state = this.$store.state;
      return {
        rhythm: state.rhythm,
        bpm: state.bpm,
        beat_width: state.beat_width,
        project_duration: state.project_duration
      };
    },

    setProjectConfig(json){
      this.$refs.rhythm.init(json.rhythm);
      this.$refs.bpm.init(json.bpm);
      this.$refs.resizer.init(json.beat_width);
      this.$store.commit('project_duration', Number(json.project_duration));
    },

    async getDownloadData(){
      const jszip = new JSZip();
      const json = JSON.stringify({
        ...this.getProjectConfig(),
        tracks: await Promise.all(this.tracks.map((track, index)=>track.getDownloadData(jszip, index)))
      });
      jszip.file("config.json", new Blob([json], {type: "application/json"}));
      return jszip.generateAsync({type: "blob"});
    },

    async readProjectZip(file){
      const data = {};
      const promises = [];
      const zip = await JSZip.loadAsync(file);
      zip.forEach((path, file)=>{
        if(file.name === "config.json"){
          promises.push(zip.file(file.name).async("string").then(content => data["config.json"] = JSON.parse(content)));
        }else if(!file.dir){
          let lastDir = data;
          const dirs = file.name.split('/');
          const filename = dirs.pop();
          dirs.forEach(dir=>{
            if(!lastDir[dir]){
              lastDir[dir] = {};
            }
            lastDir = lastDir[dir];
          });
          promises.push(zip.file(file.name).async("blob").then(blob => lastDir[filename] = URL.createObjectURL(blob)));
        }
      });
      await Promise.all(promises);
      return data;
    },

    async readProjectDirectory(entry){
      const data = {};
      await new Promise(resolve=>(function inner(entry, parent, resolve){
        if(entry.isFile){
          entry.file(
            file=>{
              if(file.name === "config.json"){
                const reader = new FileReader();
                reader.onload = e => {
                  parent["config.json"] = JSON.parse(reader.result);
                  resolve();
                };
                reader.readAsText(file);
              }else{
                parent[file.name] = URL.createObjectURL(file);
              }
            },
            console.error
          );
        }else if(entry.isDirectory){
          parent[entry.name] = {};
          entry.createReader().readEntries(
            entries=>entries.forEach(innerEntry=>inner(innerEntry, parent[entry.name], resolve)),
            console.error
          );
        }
      })(entry, data, resolve));
      return Object.values(data)[0];
    },

    loadProject(data){
      this.trackIdManager = new IdManager(8);
      this.trackParams = [];
      this.$nextTick(async ()=>{
        const config = data["config.json"];
        this.setProjectConfig(config);
        for await(let trackData of config.tracks){
          let ext;
          if(trackData.component === "AudioTrack")
            ext = ".wav";
          else if(trackData.component === "VideoTrack")
            ext = ".webm";

          trackData.canvases.forEach(canvasData=>{
            canvasData.url = data[trackData.name][canvasData.id + ext];
          });
          await this.addTrackByUser(trackData);
        }
      });
    },

    async getUploadData(){
      return {
        ...this.getProjectConfig(),
        tracks: await Promise.all(this.tracks.map(track=>track.getUploadData()))
      };
    },

    loadSharedProject(project){
      this.trackIdManager = new IdManager(8);
      this.trackParams = [];
      this.$nextTick(async ()=>{
        this.setProjectConfig(project);
        for await(let trackData of project.tracks){
          await this.addTrack(trackData);
        }
        console.info("プロジェクトに参加しました。");
      });
    },

    getTimeFromBarAndBeat(bar_and_beat){
      const state = this.$store.state;
      const num_of_scales = bar_and_beat.bar * state.rhythm[0] + bar_and_beat.beat - 1;
      const distance = num_of_scales * this.$store.getters.scale_width;
      return distance / this.$store.getters.second_width;
    },

    writeProjectAudio(data){
      const startRecordingTime = this.getTimeFromBarAndBeat(data.start);
      const stopRecordingTime = this.getTimeFromBarAndBeat(data.stop);
      const length = (stopRecordingTime - startRecordingTime) * this.audioCtx.sampleRate;
      const offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(2, length, this.audioCtx.sampleRate);
      this.tracks.forEach(track=>track.createOffline?.(offlineCtx, startRecordingTime, stopRecordingTime));
      offlineCtx.startRendering()
        .then(buffer=>this.download(WavHandler.AudioBuffer2WavFile(buffer), 'project.wav'))
        .catch(console.error);
    }
  }
}
</script>
