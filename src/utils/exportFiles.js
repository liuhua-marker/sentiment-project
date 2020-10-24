import {
  MessageBox,
  Message
} from 'element-ui'
var UplodLoadFile = function(domnLoadFile, fname) {
  domnLoadFile.then(res => {
    if (res) {
      var blob = res
      var objectUrl = URL.createObjectURL(blob)
      var link = document.createElement('a')
      //   var fname = `文档` // 下载文件的名字
      link.href = objectUrl
      link.setAttribute('download', fname + '.xlsx')
      document.body.appendChild(link)
      link.click()
      Message({
        type: 'success',
        message: '导出成功'
      })
    }
  }).catch(() => {
    Message({
      type: 'error',
      message: '导出失败'
    })
  })
}
var DomnLoadFile = function(domnLoadFile, fname) {
  MessageBox({
    title: '提示',
    type: 'warning',
    message: `<p>是否确定导出文件</p>`,
    showCancelButton: true,
    closeOnClickModal: false,
    dangerouslyUseHTMLString: true,
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true
        instance.confirmButtonText = '执行中...'
        domnLoadFile.then(res => {
          if (res) {
            var blob = res
            var objectUrl = URL.createObjectURL(blob)
            var link = document.createElement('a')
            //   var fname = `舆情预警文档` // 下载文件的名字
            link.href = objectUrl
            link.setAttribute('download', fname + '.xlsx')
            document.body.appendChild(link)
            link.click()
            Message({
              type: 'success',
              message: '导出成功'
            })
          }
          setTimeout(() => {
            done()
            setTimeout(() => {
              instance.confirmButtonLoading = false
            }, 300)
          }, 1000)
        }).catch(() => {
          Message({
            type: 'error',
            message: '导出失败'
          })
        })
      } else {
        done()
        return
      }
    }
  })
}
var ExportFiles = function(domnLoadFile, fname, startTime, endTime) {
  let message = ''
  if (startTime || endTime) {
    message = `<p>导出文件的时间段为:</p><p><b>${startTime} 到 ${endTime}</b></p>`
  } else {
    message = `<p>是否确定导出</p><p>由于文件过大！最多导出前99999条</p>`
  }
  //
  MessageBox({
    title: '提示',
    type: 'warning',
    message: message,
    showCancelButton: true,
    closeOnClickModal: false,
    dangerouslyUseHTMLString: true,
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true
        instance.confirmButtonText = '执行中...'
        domnLoadFile.then(res => {
          if (res) {
            var blob = res
            var objectUrl = URL.createObjectURL(blob)
            var link = document.createElement('a')
            //   var fname = `舆情预警文档` // 下载文件的名字
            link.href = objectUrl
            link.setAttribute('download', fname + '.xlsx')
            document.body.appendChild(link)
            link.click()
            Message({
              type: 'success',
              message: '导出成功'
            })
          } else {
            Message({
              type: 'error',
              message: '导出失败'
            })
          }
          setTimeout(() => {
            done()
            setTimeout(() => {
              instance.confirmButtonLoading = false
            }, 300)
          }, 1000)
        })
      } else {
        done()
      }
    }
  })
}
export {
  UplodLoadFile,
  DomnLoadFile,
  ExportFiles
}
