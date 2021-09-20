<template>
  <SideMenu>
    <a @click="$refs.editor.downloadProject">プロジェクトファイルをダウンロード</a>
    <a @click="isShowPopup=true;popUpType='WriteRange';">選択範囲を書き出す</a>
    <template v-if="projectId === null">
      <a>プロジェクトを共有<br>
        <input size="8" @keydown.enter.prevent="startProject">
      </a>
      <a>プロジェクトに参加<br>
        <input size="8" @keydown.enter.prevent="joinProject">
      </a>
    </template>
    <a v-else-if="projectId === 'loading'">Loading...</a>
    <template v-else>
      <a>プロジェクトID: {{ projectId }}</a>
      <a @click="endProject">共有を停止する</a>
    </template>
    <a href="/docs/" target="_blank">ヘルプ</a>
    <VideoContainer v-if="projectId !== 'loading' && projectId !== null" :stream="stream" :roomId="projectId" ref="videoContainer"/>
  </SideMenu>
  <Popup v-show="isShowPopup" @hide-popup="isShowPopup=false">
    <WriteRange v-if="popUpType === 'WriteRange'" @hide-popup="isShowPopup=false" @write-project="$refs.editor.writeProjectAudio"/>
  </Popup>
  <Editor :socket="socket" ref="editor"/>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto&family=Sawarabi+Gothic&display=swap');
*{
  font-family: 'Roboto', 'Sawarabi Gothic', sans-serif;
  font-weight: normal;
  font-size: 1rem;
  margin: 0;
  border: 0;
  padding: 0;
  box-sizing: border-box;
}
body{
  overflow: hidden;
}
</style>

<script>
import WebDAWSocket from './socket.js';

import SideMenu from './components/SideMenu.vue';
import VideoContainer from './components/VideoContainer.vue';
import Popup from './components/Popup.vue';
import WriteRange from './components/WriteRange.vue';
import Editor from './components/Editor/Editor.vue';

export default {
  name: 'App',
  components: {
    SideMenu,
    VideoContainer,
    Popup,
    WriteRange,
    Editor
  },
  data(){
    return {
      isShowPopup: false,
      popUpType: null,
      projectId: null,
      socket: null,
      stream: null
    }
  },
  created(){
    this.socket = new WebDAWSocket();
  },
  mounted(){
    window.onpopstate = e => e.preventDefault();
    window.onbeforeunload = e=>{
      e.preventDefault();
      e.returnValue = 'ページを移動すると全てのデータが失われます。';
    }
    window.onorientationchange = this.alertScreenOrientation;
    window.onload = this.alertScreenOrientation;

    window.ontouchmove = e=>e.preventDefault();

    this.socket.init(async data=>{
      switch(data.type){
        case 'joinProject':
          this.socket.send({
            type: 'shareProject',
            target: data.target,
            projectData: await this.$refs.editor.getUploadData()
          });
          break;
        case 'addTrack':
          this.$refs.editor.addTrack(data.trackData);
          break;
        case 'removeTrack':
          this.$refs.editor.removeTrack(data.index);
          break;
        case 'addAudio':
          this.$refs.editor.acceptAudioDataArray(data.audioDataArray);
          break;
      }
    });
  },
  methods: {
    alertScreenOrientation(){
      const angle = window.screen?.orientaion?.angle || window.orientation;
      if(window.screen.width < 550 && angle === 0)
        alert("画面を横向きにしてください。")
    },

    async startProject(e){
      this.projectId = "loading";
      if(!this.stream)
        await this.$refs.editor.getStream();
      if(!this.stream)
        this.projectId = null;
      const id = e.target.value;
      this.socket.connect();
      this.socket.onclose = e=>this.projectId = null;
      this.socket.onerror = e=>this.projectId = null;
      this.socket.onopen = () => {
        this.socket.send({ type: "startProject", id: id });
        this.socket.onmessage = data=>{
          if(data.type === 'startProject'){
            this.projectId = id;
            console.info("プロジェクトを共有しました。id: " + this.projectId);
          }
          this.socket.setDefault();
        }
      }
    },

    async joinProject(e){
      this.projectId = "loading";
      if(!this.stream)
        await this.$refs.editor.getStream();
      if(!this.stream)
        this.projectId = null;
      const id = e.target.value;
      this.socket.connect();
      this.socket.onclose = e=>this.projectId = null;
      this.socket.onerror = e=>this.projectId = null;
      this.socket.onopen = () => {
        this.socket.send({ type: "joinProject", id: id });
        this.socket.onmessage = data=>{
          if(data.type === 'shareProject'){
            this.projectId = id;
            this.$refs.editor.loadSharedProject(data.projectData);
          }
          this.socket.setDefault();
        }
      }
    },

    endProject(){
      this.socket.close();
      this.$refs.videoContainer.room.close();
    }
  }
}
</script>
