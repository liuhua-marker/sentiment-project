<template>
  <div>
    <div class="backgroundImg" :style="{backgroundImage: 'url(' + bgImg + ')' }" />
  </div>
</template>

<script>
import bgImg from '@/assets/backtwo.jpg'
export default {
  name: 'DashboardEditor',

  data() {
    return {
      bgImg: bgImg
    }
  }
}
</script>

<style lang="scss" scoped>
.title {
  width: 100%;
  height: 50px;
  background: #f2f8f8;
  color: #000000;
  line-height: 50px;
  font-size: 24px;
}
.backgroundImg {
  width: 90vw;
  height: 90vh;
  background-position: center center;
  background-repeat: no-repeat;
  background-size: 99%;
}

li {
  float: left;
  list-style: none;
  width: 250px;
  height: 400px;
  margin: 10px;
  text-align: center;
  line-height: 40px;
  font-family: 微软雅黑;
  padding: 5px;
}
.topImg {
  width: 40px;
  height: 40px;
}
.icon {
  margin-top: 15px;
  padding-bottom: 20px;
}

.yellow {
  color: black;
  background: #f7f7f7;
}
.black {
  color: black;
  background: #f7f7f7;
}
.detailp {
  padding: 0px 15px 15px 15px;
}
</style>
