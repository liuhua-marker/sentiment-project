import request from '@/utils/request'

// 根据预警类型列表信息
export function confsignalList(data) {
  return request({
    url: `/yuqing-configuration/confsignal/list`,
    method: 'POST',
    data
  })
}
// 获取源数据预警列表信息
export function findEsAllSentimentWarning(data) {
  return request({
    url: `/yuqing-visualize/yuqing_search/findEsAllSentimentWarning`,
    method: 'POST',
    data
  })
}
// 获取舆情预警列表信息
export function distributeRecord(data) {
  return request({
    url: `/yuqing-visualize/yqSearch/findESSentimentWarning`,
    method: 'POST',
    data
  })
}
// 获取舆情事件脉络信息
export function getPublicSentimentEventContext(yqId) {
  return request({
    url: `/yuqing-visualize/yqSearch/getPublicSentimentEventContext/${yqId}`,
    method: 'POST'
  })
}
// 标注极性
export function evaluationResultList(data) {
  return request({
    url: `/yuqing-visualize/yuqingevaluation/evaluation_result_list`,
    method: 'POST',
    data
  })
}

// 导出文件
export function domnLoadFile(data) {
  return request({
    url: `/yuqing-visualize/yqSearch/exportPublicSentimentWarning`,
    responseType: 'blob',
    method: 'POST',
    data
  })
}
