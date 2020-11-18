import request from '@/utils/request'

// 获取舆情列表信息
export function yqSearchInfo(id) {
  return request({
    url: `/yuqing-visualize/yqSearch/info/${id}`,
    method: 'POST'
  })
}
// 获取标签标注列表信息
export function labelInfo(id) {
  return request({
    url: `/yuqing-visualize/yqSearch/labelInfo/${id}`,
    method: 'POST'
  })
}
export function findTargetCombinationWarning(data) {
  return request({
    url: `/yuqing-visualize/yqSearch/findTargetCombinationWarning`,
    method: 'POST',
    data
  })
}
// 获取三级标签
export function getThreeLevelLabels() {
  return request({
    url: `/yuqing-configuration/conf_event/getThreeLevelLabels`,
    method: 'get',
  })
}
// 模糊匹配公司
export function listByCompanyName(data) {
  return request({
    url: `/yuqing-configuration/confcompany/listByCompanyName`,
    method: 'POST',
    data
  })
}
// 模糊三级标签
export function getAllLabelsByLikeLabel(keyword) {
  return request({
    url: `/yuqing-configuration/conf_event/getAllLabelsByLikeLabel/${keyword}`,
    method: 'get',
  })
}
// 模糊匹配事件
export function listByEventName(data) {
  return request({
    url: `/yuqing-configuration/conf_event/listByEventName`,
    method: 'POST',
    data
  })
}
// 模糊匹配事件类型
export function listByTypeName(data) {
  return request({
    url: `/yuqing-configuration/conf_event_type/listByTypeName`,
    method: 'POST',
    data
  })
}
// 导出文件
export function domnLoadFile(data) {
  return request({
    url: `/yuqing-visualize/yqSearch/exportTargetCombinationWarning`,
    responseType: 'blob',
    method: 'POST',
    data
  })
}
// 传到关系列表
export function getTransmitList() {
  return request({
    url: `/yuqing-visualize/risk_portrait/getTransmitList`,
    method: 'GET'
  })
}
