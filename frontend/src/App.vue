<template>
  <SideMenu>
    <a @click="$refs.editor.downloadProject">プロジェクトファイルをダウンロード</a>
    <a @click="isShowPopup=true;popUpType='WriteRange';">選択範囲を書き出す</a>
    <template v-if="projectId === null">
      <a @click="startProject">プロジェクトを共有</a>
      <a>プロジェクトに参加:<textarea cols="2" rows="1" @keydown.enter="joinProject" ref="projectIdField"></textarea></a>
    </template>
    <a v-else-if="projectId === 'loading'">Loading...</a>
    <template v-else>
      <a>プロジェクトID: {{ projectId }}</a>
      <a @click="socket.close()">共有を停止する</a>
    </template>
    <a href="/docs/" target="_blank">ヘルプ</a>
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
import Popup from './components/Popup.vue';
import WriteRange from './components/WriteRange.vue';
import Editor from './components/Editor/Editor.vue';

export default {
  name: 'App',
  components: {
    SideMenu,
    Popup,
    WriteRange,
    Editor
  },
  data(){
    return {
      isShowPopup: false,
      popUpType: null,
      projectId: null,
      socket: null
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

    startProject(){
      this.projectId = "loading";
      this.socket.connect();
      this.socket.onclose = e=>this.projectId = null;
      this.socket.onerror = e=>this.projectId = null;
      this.socket.onopen = async () => this.socket.send({type: "startProject"});
      this.socket.onmessage = data=>{
        if(data.type === 'id'){
          this.projectId = data.id;
          console.info("プロジェクトを共有しました。id: " + this.projectId);
        }
        this.socket.setDefault();
      }
    },

    joinProject(){
      this.projectId = "loading";
      const id = this.$refs.projectIdField.value;
      this.socket.connect();
      this.socket.onclose = e=>this.projectId = null;
      this.socket.onerror = e=>this.projectId = null;
      this.socket.onopen = async () => this.socket.send({
        type: "joinProject",
        id: id
      });
      this.socket.onmessage = async data=>{
        if(data.type === 'shareProject'){
            this.projectId = id;
            await this.$refs.editor.loadSharedProject(data.projectData);
            console.info("プロジェクトに参加しました。id: " + this.projectId);
        }
        this.socket.setDefault();
      }
    }
  }
}
</script>
