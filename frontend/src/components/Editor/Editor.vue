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
  <div id="label_field" ref="label_field">
    <AddTrackBtn @add-track="addTrack"/>
  </div>
  <div id="audio_field" ref="audio_field">
    <Pointer @move="onPointerMove" ref="pointer"/>
    <Ruler ref="ruler"/>
  </div>
  <Track
  v-for="(data, index) in trackParams"
  :key="data.id"
  :data="data"
  :audioCtx="audioCtx"
  :stream="stream"
  :pointer="$refs.pointer"
  :ref="setTrackRef"
  @track-remove="removeTrack(index)"
  />
</template>

<style>
#header{
  background-color: #323232;
  width: 100vw;
  height: 80px;
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
#label_field{
  width: 200px;
  height: calc(100vh - 80px);
  position: absolute;
  top: 80px;
  left: 0;
  overflow-y: scroll;
  -ms-overflow-style: none;
  scrollbar-width: none;
}
#label_field::-webkit-scrollbar {
  display:none;
}
#audio_field{
  background-color: #323232;
  width: calc(100vw - 200px);
  height: calc(100vh - 80px);
  position: absolute;
  top: 80px;
  left: 200px;
  overflow: scroll;
  overscroll-behavior: none;
  font-size: 0;
}
</style>

<script>
import JSZip from 'jszip';

import WavHandler from '../../webaudio/WavHandler.js';

import Count from './Header/Count.vue';
import Rhythm from './Header/Rhythm.vue';
import Bpm from './Header/Bpm.vue';
import Resizer from './Header/Resizer.vue';

import AddTrackBtn from './AddTrackBtn.vue';
import Ruler from './Ruler.vue';
import Pointer from './Pointer.vue';
import Track from './Track/Track.vue';

export default {
  name: 'Editor',
  components: {
    Count,
    Rhythm,
    Bpm,
    Resizer,
    AddTrackBtn,
    Ruler,
    Pointer,
    Track
  },
  data(){
    return {
      trackParams: [],
      lastTrackId: 0,
      tracks: [],
      audioCtx: null,
      stream: null,
      state: null//"playing" or "preparing" or "recording" or null
    }
  },
  created(){
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  },
  mounted(){
    window.onpopstate = e => e.preventDefault();
    window.onbeforeunload = e=>{
      e.preventDefault();
      e.returnValue = 'ページを移動すると全てのデータが失われます。';
    }

    const label_field = this.$refs.label_field;
    const audio_field = this.$refs.audio_field;
    label_field.onscroll = e=>audio_field.scrollTop = label_field.scrollTop;
    audio_field.onscroll = e=>{
      label_field.scrollTop = audio_field.scrollTop;
      this.$refs.pointer.y = audio_field.scrollTop;
    }

    audio_field.onclick = e=>{
      if(this.state === "recording") return;
      this.$refs.pointer.x = e.clientX - 200 + e.currentTarget.scrollLeft;
      this.$refs.count.setNumberFromPointerX(this.$refs.pointer.x);
    }

    let oldDiff;
    const getDiff = touches=>{
      const x1 = touches[0].clientX;
      const y1 = touches[0].clientY;

      const x2 = touches[1].clientX;
      const y2 = touches[1].clientY;
      return Math.sqrt(Math.pow(x2 - x1, 2), Math.pow(y2 - y1));
    }
    audio_field.ontouchstart = e=>{
      if(this.state === "recording" || e.touches.length !== 2) return;
      oldDiff = getDiff(e.touches);
    }
    audio_field.ontouchmove = e=>{
      if(this.state === "recording" || e.touches.length !== 2) return;
      e.preventDefault();
      const state = this.$store.state;
      const curDiff = getDiff(e.touches);
      const newVal = Math.round(state.beat_interval * curDiff / oldDiff);
      if(newVal < 10 || newVal > 100) return;
      this.$refs.resizer.value = newVal;
      this.$store.commit('beat_interval', newVal);
      oldDiff = curDiff;
    }

    audio_field.ondragover = e=>{
      e.stopPropagation();
      e.preventDefault();
    }

    audio_field.ondrop = async e=>{
      e.stopPropagation();
      e.preventDefault();

      const items = e.dataTransfer.items;

      if(items.length === 1){
        const item = items[0];
        const entry = item.getAsEntry?.() || item.webkitGetAsEntry?.();

        if(entry.isFile){
          entry.file(
            file=>{
              if(this.isAudioFile(file)){
                this.loadAudioFile(file);
              }
            },
            console.error
          );
        }else{
          const data = {};
          await new Promise(resolve => this.readProjectDirectory(entry, data, resolve));
          console.log(data);
          await this.loadProject(data["project"]);
        }
      }
    }

    document.setDefaultOnkeydown = ()=>this.setDefaultOnkeydown();
    document.setDefaultOnkeydown();
  },
  computed: {
    scale_interval(){
      const state = this.$store.state;
      return state.beat_interval * 4 / state.rhythm[1];
    }
  },
  methods: {
    getTimeOfDistance(distance){
      const state = this.$store.state;
      return  60 / state.bpm * distance / state.beat_interval;
    },

    setTrackRef(el){
      if(el && !this.tracks.includes(el)){
        this.tracks.push(el);
      }
    },

    async addTrack(trackData){
      switch(this.audioCtx.state){
        case "suspended":
        case "interrupted":
          this.audioCtx.resume();
          break;
      }

      if(!this.stream){
        this.stream = await navigator.mediaDevices
          .getUserMedia({video: false, audio: true})
          .catch(err=>{
            console.error(err);
            window.alert("マイク入力を取得できません。");
          });
        if(!this.stream){return;}
      }

      this.tracks = [];
      if(!trackData){
        trackData = {};
      }
      trackData.id = this.lastTrackId;
      this.trackParams.push(trackData);
      this.lastTrackId++;
    },

    removeTrack(index){
      this.tracks = [];
      this.trackParams.splice(index, 1);
    },

    removeSelectedTracks(){
      this.tracks
        .filter(track=>track.isSelected)
        .map(track=>this.trackParams.findIndex(param=>param.id===track.data.id))
        .sort((a, b) => b - a)
        .forEach(index=>this.removeTrack(index));
    },

    onPointerMove(x){
      const audio_field = this.$refs.audio_field;
      if(this.state === "recording" && x - audio_field.scrollLeft > audio_field.offsetWidth){
        audio_field.scrollLeft += audio_field.offsetWidth;
      }
      if(x >= this.$refs.ruler.$refs.canvas.width){
        this.$store.commit('number_of_bars', this.$store.state.number_of_bars + 30);
      }
    },

    async startRecording(){
      this.selectedTracks = this.tracks.filter(track=>track.isSelected);
      const notSelectedTracks = this.tracks.filter(track=>!track.isSelected);
      if(!this.selectedTracks.length){return;}

      if(this.state === "playing"){
        this.pause();
      }

      this.$refs.pointer.prepareRecording();
      this.$refs.count.start();
      this.$refs.pointer.start();
      notSelectedTracks.forEach(track=>track.play());

      this.state = "preparing";

      setTimeout(()=>{
        if(this.state !== "preparing") return;
        this.state = "recording";
        this.$refs.resizer.disabled = true;
        this.selectedTracks.forEach(track=>track.startRecording());
      }, this.getTimeOfDistance(this.scale_interval * this.$store.state.rhythm[0]) * 1000);
    },

    stopRecording(){
      if(this.state === "recording"){
        this.$refs.resizer.disabled = false;
        this.selectedTracks.forEach(track=>track.stopRecording());
      }
      this.pause();
    },

    play(){
      this.tracks.forEach(track=>track.play());
      const start_time = this.getTimeOfDistance(this.scale_interval - this.$refs.pointer.x % this.scale_interval);
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

    setDefaultOnkeydown(){
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

    isAudioFile(file){
      return file.type.split('/')[0] === "audio";
    },

    async loadAudioFile(file){
      const src = window.URL.createObjectURL(file);
      await this.addTrack({
        audioStack: [
          {
            startPoint: 0,
            url: src
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

    async downloadProject(){
      const jszip = new JSZip();
      const root = jszip.folder("project");

      await this.createConfigBlob(root);

      jszip.generateAsync({type: "blob"})
        .then(blob=>this.download(URL.createObjectURL(blob), 'project.zip'));
    },

    async createConfigBlob(root){
      const state = this.$store.state;
      const json = JSON.stringify({
        rhythm: state.rhythm,
        bpm: state.bpm,
        beat_interval: state.beat_interval,
        number_of_bars: state.number_of_bars,
        tracks: await Promise.all(this.tracks.map((track, index)=>track.getDownloadData(root, index)))
      });
      root.file("config.json", new Blob([json], {type: "application/json"}));
    },

    readProjectDirectory(entry, parent, resolve){
      if(entry.isFile){
        entry.file(
          file=>{
            if(file.name === "config.json"){
              const reader = new FileReader();
              reader.onload = e => {
                parent[file.name] = JSON.parse(reader.result);
                resolve();
              };
              reader.readAsText(file);
            }else{
              parent[file.name] = window.URL.createObjectURL(file);
            }
          },
          console.error
        );
      }else if(entry.isDirectory){
        parent[entry.name] = {};
        entry.createReader().readEntries(
          entries=>entries.forEach(innerEntry=>this.readProjectDirectory(innerEntry, parent[entry.name], resolve)),
          console.error
        );
      }
    },

    async loadProject(data){
      const config = data["config.json"];
      this.setConfig(config);
      await this.setTracksData(config.tracks, data);
    },

    setConfig(json){
      this.$store.commit('rhythm', json.rhythm.map(elem=>Number(elem)));
      this.$store.commit('bpm', Number(json.bpm));
      this.$store.commit('beat_interval', Number(json.beat_interval));
      this.$store.commit('number_of_bars', Number(json.number_of_bars));
    },

    async setTracksData(tracksData, data){
      for await(let trackData of tracksData){
        trackData.audioStack.forEach((elem, i)=>{
          elem.url = data[trackData.name][i+".wav"];
        });
        await this.addTrack(trackData);
      }
    },

    getStartAndStopTime(data){
      const getTime = obj=>{
        const state = this.$store.state;
        return (obj.bar * state.rhythm[0] + obj.beat - 1) * 4 / state.rhythm[1] * 60 / state.bpm;
      }
      return {
        start_time : getTime(data.start),
        stop_time  : getTime(data.stop)
      };
    },

    writeProjectAudio(data){
      const { start_time, stop_time } = this.getStartAndStopTime(data);
      const length = (stop_time - start_time) * this.audioCtx.sampleRate;
      const offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(2, length, this.audioCtx.sampleRate);
      this.tracks.forEach(track=>track.createOffline(offlineCtx, start_time, stop_time));
      const func = buffer=>this.download(WavHandler.AudioBuffer2WavFile(buffer), 'project.wav');
      if(window.isSafari){
        offlineCtx.oncomplete = e => func(e.renderedBuffer);
        offlineCtx.startRendering();
      }else{
        offlineCtx.startRendering().then(func).catch(console.error);
      }
    },

    async getUploadData(){
      const state = this.$store.state;
      return {
        rhythm: state.rhythm,
        bpm: state.bpm,
        beat_interval: state.beat_interval,
        number_of_bars: state.number_of_bars,
        tracks: await Promise.all(this.tracks.map(track=>track.getUploadData()))
      };
    },

    async setSharedTracksData(tracksData){
      for await(let trackData of tracksData){
        trackData.audioStack.forEach(elem=>{
          const byteString = atob(elem.base64.split( "," )[1]) ;
          const mimeType = elem.base64.match( /(:)([a-z\/]+)(;)/ )[2] ;
          const content = new Uint8Array(byteString.length);
          for(let i = 0; i < byteString.length; i++){
	          content[i] = byteString.charCodeAt(i);
          }

          const blob = new Blob([content], {type: mimeType}) ;
          elem.url = URL.createObjectURL(blob);
        });
        await this.addTrack(trackData);
      }
    },

    async loadSharedProject(project){
      this.setConfig(project);
      await this.setSharedTracksData(project.tracks);
    }
  }
}
</script>
