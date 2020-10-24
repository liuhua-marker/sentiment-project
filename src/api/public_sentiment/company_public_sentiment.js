import request from '@/utils/request'

// 获取列表信息
export function distributeRecord(data) {
  return request({
    url: `/yuqing-visualize/yqSearch/findCompanyWarning`,
    method: 'POST',
    data
  })
}
// ES公司预警按最新时间排行
export function findEsCompanyWaringNewTop(data) {
  return request({
    url: `/yuqing-visualize/yqSearch/findEsCompanyWaringNewTop`,
    method: 'POST',
    data
  })
}
// ES公司预警按统计数量排行
export function findEsCompanyWaringCountTop(data) {
  return request({
    url: `/yuqing-visualize/yqSearch/findEsCompanyWaringCountTop`,
    method: 'POST',
    data
  })
}
// ES公司预警按目标公司
export function findEsCompanyWaringTarget(data) {
  return request({
    url: `/yuqing-visualize/yqSearch/findEsCompanyWaringTarget`,
    method: 'POST',
    data
  })
}

// 导出文件
export function domnLoadFile(data) {
  return request({
    url: `/yuqing-visualize/yqSearch/exportCompanyWarning`,
    responseType: 'blob',
    method: 'POST',
    data
  })
}
