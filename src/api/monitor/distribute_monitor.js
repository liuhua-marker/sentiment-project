import request from '@/utils/request'

// 获取列表信息
export function distributeRecord(data) {
  return request({
    url: `/yuqing-visualize/monitor/distributeRecord`,
    method: 'POST',
    data
  })
}

// 获取数据类型列表
export function configuration_list() {
  return request({
    url: `/yuqing-configuration/confdatasourcetype/configuration_list`,
    method: 'POST'
  })
}
// 导出文件
export function domnLoadFile(data) {
  return request({
    url: `/yuqing-visualize/monitor/export_distributeRecord`,
    responseType: 'blob',
    method: 'POST',
    data
  })
}
