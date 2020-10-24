(function() {
  function resi() {
    var html = document.querySelector('html')
    var wW = document.body.clientWidth || document.documentElement.clientWidth
    var maxW = 640
    var minW = 320
    if (wW > maxW) wW = maxW
    var ratio = wW / minW
    html.style.fontSize = 100 * ratio + 'px'
  }
  window.addEventListener('DOMContentLoaded', function() {
    var bodys = document.querySelector('body').style
    bodys.opacity = '1'
    bodys.filter = 'alpha(opacity=100)'
    resi()
  })
  window.addEventListener('resize', resi)
})()

// const setHtmlFontSize = () => {
//   const htmlDom = document.getElementsByTagName('html')[0];
//   let htmlWidth = document.documentElement.clientWidth || document.body.clientWidth;
//   if (htmlWidth >= 750) {
//     htmlWidth = 750;
//   }
//   if (htmlWidth <= 320) {
//     htmlWidth = 320;
//   }
//   htmlDom.style.fontSize = `${htmlWidth / 7.5}px`;
// };
// window.onresize = setHtmlFontSize;
// setHtmlFontSize();

// ! function (e, t) {
//   function n() {
//     var n = l.getBoundingClientRect().width;
//     var clienH = parseInt(document.documentElement.clientHeight);
//     var num;
//     var nm;
//     if (clienH < 568) {
//       num = parseInt(document.documentElement.clientHeight) / 568;
//       nm = num > 1 ? 1 : num;
//       console.log("5s");
//     } else if (568 <= clienH < 667) {
//       num = parseInt(document.documentElement.clientHeight) / 667;
//       nm = num > 1 ? 1 : num;
//       console.log("6 7 8");
//     } else if (667 <= clienH < 736) {
//       num = parseInt(document.documentElement.clientHeight) / 736;
//       nm = num > 1 ? 1 : num;
//       console.log("6p 7p 8p");
//     } else {
//       nm = 1
//     };
//     t = t || 540, n > t && (n = t);
//     var i = 100 * n / e * nm;
//     r.innerHTML = "html{font-size:" + i + "px;}"
//   }
//   var i, d = document,
//     o = window,
//     l = d.documentElement,
//     r = document.createElement("style");
//   if (l.firstElementChild) l.firstElementChild.appendChild(r);
//   else {
//     var a = d.createElement("div");
//     a.appendChild(r), d.write(a.innerHTML), a = null
//   }
//   n(), o.addEventListener("resize", function () {
//     clearTimeout(i), i = setTimeout(n, 300)
//   }, !1), o.addEventListener("pageshow", function (e) {
//     e.persisted && (clearTimeout(i), i = setTimeout(n, 300))
//   }, !1), "complete" === d.readyState ? d.body.style.fontSize = "16px" : d.addEventListener("DOMContentLoaded", function (e) {
//     d.body.style.fontSize = "16px"
//   }, !1)
// }(750, 750);
