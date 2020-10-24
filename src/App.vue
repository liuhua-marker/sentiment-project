<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  created() {
    this.localSocket()
  },
  beforeDestroy() {
    // window.localStorage.removeItem('isTrue')
    // this.WebSocket.ws.close()
    // this.ws.onclose = function(evt) {
    //   console.log('Connection closed.')
    // }
  },
  methods: {
    // app.vue
    localSocket() {
      const that = this
      if ('WebSocket' in window) {
        // console.log('您的浏览器支持 WebSocket!')
        that.ws = new WebSocket(
          'ws://192.168.36.171:8088/yuqing-visualize/ws/public_sentiment'
          // 'ws://192.168.2.129:11111/yuqing-visualize/ws/public_sentiment'
        )
        that.WebSocket.setWs(that.ws)
        // that.ws.onopen = function (evt) {
        // }

        that.ws.onclose = function() {
          // 关闭 websocket
          console.log('连接已关闭...')
          // setTimeout(() => {
          //   that.localSocket()
          // }, 2000)
        }
      } else {
        // 浏览器不支持 WebSocket
        alert('您的浏览器不支持 WebSocket!')
      }
    }
  }
}
</script>
