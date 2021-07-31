<template>
  <div
  class="context-menu"
  tabindex="-1"
  :style="styles"
  v-show="isShow"
  @blur="isShow=false;"
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
  padding: 5px 0;
  font-size: 12px;
  text-align: center;
  border-radius: 10px;
  width: 100px;
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
      this.isShow = true;
      switch(e.type){
        case 'contextmenu':
          this.styles.top = e.clientY + 'px';
          this.styles.left = e.clientX + 'px';
          break;
        case 'touchstart':
          if(e.touches.length !== 2) return;
          this.style.top = (e.touches[0].clientY + e.touches[1].clientY) / 2 + 'px';
          this.style.left = (e.touches[0].clientX + e.touches[1].clientX) / 2 + 'px';
          break;
      }
      this.$refs.domElement.focus();
    },
  }
}
</script>
