<template>
<svg id="menu-btn" @click.stop="isShow=!isShow">
  <use
  href="../assets/hamburger.svg#hamburger"
  :fill="isShow ? '#323232' : 'white'"
  :stroke="isShow ? '#323232' : 'white'"
  />
</svg>
<div id="side-menu" v-show="isShow" @click.stop @keydown.stop>
  <slot></slot>
</div>
</template>

<style>
#menu-btn{
  width: 36px;
  height: 36px;
  position: fixed;
  top: 5px;
  right: 5px;
  z-index: 5;
}
#menu-btn:hover{
  cursor: pointer;
}
#side-menu{
  background-color: rgba(255,255,255,0.8);
  color: #323232;
  text-align: center;
  width: 200px;
  padding: 55px 10px 0 10px;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 4;
}
#side-menu a{
  display: block;
  color: black;
  text-decoration: none;
  margin-bottom: 10px;
}
#side-menu a:hover{
  cursor: pointer;
}
#side-menu a:visited{
  color: black;
}
#side-menu a > input{
  border: 1px solid;
  padding: 3px;
  text-align: center;
  vertical-align: middle;
}
</style>

<script>
export default {
  name: 'SideMenu',
  data(){
    return {
      isShow: false
    }
  },
  mounted(){
    document.onclick = e => this.isShow = false;
  }
}
</script>
