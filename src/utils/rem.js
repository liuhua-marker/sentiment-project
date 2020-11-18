// (function() {
//   function resi() {
//     var html = document.querySelector('html')
//     var wW = document.body.clientWidth || document.documentElement.clientWidth
//     var maxW = 640
//     var minW = 320
//     if (wW > maxW) wW = maxW
//     var ratio = wW / minW
//     html.style.fontSize = 100 * ratio + 'px'
//   }
//   window.addEventListener('DOMContentLoaded', function() {
//     var bodys = document.querySelector('body').style
//     bodys.opacity = '1'
//     bodys.filter = 'alpha(opacity=100)'
//     resi()
//   })
//   window.addEventListener('resize', resi)
// })()

fnResize();
window.onresize = function () {
  fnResize();
}

function fnResize() {
  var deviceWidth = document.documentElement.clientWidth || window.innerWidth;
  // if (deviceWidth >= 750) {
  //   deviceWidth = 750;
  // }
  // if (deviceWidth <= 320) {
  //   deviceWidth = 320;
  // }
  document.documentElement.style.fontSize = (deviceWidth / 19.2) + 'px';
}