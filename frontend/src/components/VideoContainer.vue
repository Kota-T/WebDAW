<template>
<div id="video-container">
  <video id="local-video" autoplay muted playsinline ref="localVideo"></video>
  <button type="button" class="video-btn" :class="{active: videoOn}" @click="videoOn=!videoOn" ref="videoBtn">video</button>
  <button type="button" class="video-btn" :class="{active: audioOn}" @click="audioOn=!audioOn" ref="audioBtn">audio</button>
  <video class="member-video" autoplay playsinline v-for="data in videoParams" :key="data.peerId" :ref="setVideoRef"></video>
</div>
</template>

<style>
#video-container video{
  display: block;
  background-color: black;
  width: 100%;
  height: 120px;
}
#local-video{
  transform: scaleX(-1);
}
.video-btn{
  width: 50%;
  color: gray;
}
.video-btn.active{
  color: black;
}
.member-video{
  margin-top: 20px;
}
</style>

<script>
import Peer from 'skyway-js';
const __SKYWAY_KEY__ = "8ce51882-3317-4964-99cc-a7e50809042a";

export default {
  name: 'VideoContainer',
  props: ['roomId'],
  data(){
    return {
      videoOn: true,
      audioOn: true,
      videoParams: [],
      videos: [],
      stream: null,
      room: null
    }
  },
  async mounted(){
    this.stream = await this.getStream();
    this.$refs.localVideo.srcObject = this.stream;

    const peer = new Peer({ key: __SKYWAY_KEY__, debug: 3 });

    peer.on('open', ()=>{
      this.room = peer.joinRoom(this.roomId, {mode: 'sfu', stream: this.stream});

      this.room.once('open', ()=>console.log('=== You joined ==='));
      this.room.on('peerJoin', peerId=>console.log(`=== ${peerId} joined ===`));

      this.room.on('stream', async stream => {
        this.videoParams.push({peerId: stream.peerId});
        this.$nextTick(function(){
          this.videos[this.videos.length - 1].srcObject = stream;
          this.videos[this.videos.length - 1].peerId = stream.peerId;
        });
      });

      this.room.on('data', ({ data, src })=>console.log(`${src}: ${data}`));

      this.room.on('peerLeave', peerId => {
        const remoteVideo = this.videos.find(video => video.peerId === peerId);
        remoteVideo.srcObject.getTracks().forEach(track => track.stop());
        remoteVideo.srcObject = null;

        this.videos = [];
        const index = this.videoParams.indexOf(param => param.peerId === peerId);
        this.videoParams.splice(index, 1);

        console.log(`=== ${peerId} left ===`);
      });

      // for closing myself
      this.room.once('close', () => {
        console.log('== You left ===');
        this.videos.forEach(remoteVideo => {
          remoteVideo.srcObject.getTracks().forEach(track => track.stop());
          remoteVideo.srcObject = null;
        });
        this.$refs.localVideo.srcObject = null;
        this.videoParams = [];
      });
    });

    peer.on('error', console.error);
  },
  watch: {
    videoOn(value){
      this.stream.getVideoTracks()[0].enabled = value;
    },
    audioOn(value){
      this.stream.getAudioTracks()[0].enabled = value;
    }
  },
  methods: {
    getStream(){
      return navigator.mediaDevices.getUserMedia(
          {
            video: { aspectRatio: 1920/1080 },
            audio: true
          }
        )
        .catch(err=>window.alert("マイク入力を取得できません。"));
    },

    setVideoRef(el){
      if(el && !this.videos.includes(el)){
        this.videos.push(el);
      }
    }
  }
}
</script>
