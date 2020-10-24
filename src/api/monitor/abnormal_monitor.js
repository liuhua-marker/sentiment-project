import request from '@/utils/request'

// 根据异常类型列表信息
export function getErrorMonitorErrorType() {
  return request({
    url: `/yuqing-visualize/monitor/getErrorMonitorErrorType`,
    method: 'POST'
  })
}
// 获取列表信息
export function distributeRecord(data) {
  return request({
    url: `/yuqing-visualize/monitor/errorMonitoring`,
    method: 'POST',
    data
  })
}

// 导出文件
export function domnLoadFile(data) {
  return request({
    url: `/yuqing-visualize/monitor/export_errorMonitoring`,
    responseType: 'blob',
    method: 'POST',
    data
  })
}
