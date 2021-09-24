<template>
  <div
  class="context-menu"
  tabindex="-1"
  :style="styles"
  v-show="isShow"
  @blur="isShow=false;"
  @click.stop
  ref="domElement"
  >
    <ul>
      <slot></slot>
    </ul>
  </div>
</template>

<style>
.context-menu{
  background-color: white;
  font-size: 12px;
  width: 100px;
  padding: 5px 0;
  border-radius: 10px;
  text-align: center;
  position: fixed;
  z-index: 4;
}
.context-menu ul{
  list-style: none;
}
.context-menu li:hover{
  color: white;
  background-color: blue;
  cursor: pointer;
}
</style>

<script>
export default {
  name: 'ContextMenu',
  data(){
    return {
      styles: {
        top  : '0px',
        left : '0px'
      },
      isShow: false
    }
  },
  methods: {
    show(e){
      switch(e.type){
        case 'contextmenu':
          e.preventDefault();
          this.styles.top = e.clientY + 'px';
          this.styles.left = e.clientX + 'px';
          break;
        case 'touchstart':
          if(e.touches.length !== 2) return;
          this.styles.top = (e.touches[0].clientY + e.touches[1].clientY) / 2 + 'px';
          this.styles.left = (e.touches[0].clientX + e.touches[1].clientX) / 2 + 'px';
          break;
      }
      this.isShow = true;
      setTimeout(()=>this.$refs.domElement.focus());
    },
  }
}
</script>
