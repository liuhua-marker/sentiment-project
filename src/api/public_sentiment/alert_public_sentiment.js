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
// 舆情预警
export function distributeRecord(data) {
  return request({
    url: `/yuqing-visualize/yqSearch/findESSentimentWarning`,
    method: 'POST',
    data
  })
}
// 标签标注 标签舆情
export function findEventSentimentWarning(data) {
  return request({
    url: `/yuqing-visualize/yqSearch/findEventSentimentWarning`,
    method: 'POST',
    data
  })
}

// 获取舆情事件脉络信息
export function getPublicSentimentEventContext(yqId) {
  return request({
    url: `/yuqing-visualize/publicSentimentEvent/getPublicSentimentEventContext/${yqId}`,
    method: 'get'
  })
}
// 获取舆情事件热度表
export function getEventHotAnalysisRes(yqId) {
  return request({
    url: `/yuqing-visualize/publicSentimentEvent/getEventHotAnalysisRes/${yqId}`,
    method: 'GET'
  })
}
// 获取舆情事件热度
export function getEventHot(yqId) {
  return request({
    url: `/yuqing-visualize/publicSentimentEvent/getEventHot/${yqId}`,
    method: 'GET'
  })
}
// 获取舆情事件调性分析图
export function getEventTonalAnalysisRes(yqId) {
  return request({
    url: `/yuqing-visualize/publicSentimentEvent/getEventTonalAnalysisRes/${yqId}`,
    method: 'GET'
  })
}
// 获取舆情词云图
export function eventWordsCloud(yqId) {
  return request({
    url: `/yuqing-visualize/publicSentimentEvent/eventWordsCloud/${yqId}`,
    method: 'post'
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
