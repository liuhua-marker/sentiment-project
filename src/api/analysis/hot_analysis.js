import request from '@/utils/request'

// 获取机构列表信息
export function system(data) {
  return request({
    url: `/yuqing-system/business/list`,
    method: 'POST',
    data
  })
}
// 根据机构获取部门列表信息
export function systemDept(data) {
  return request({
    url: `/yuqing-system/dept/list`,
    method: 'POST',
    data
  })
}
// 根据预警类型列表信息
export function confsignalList(data) {
  return request({
    url: `/yuqing-configuration/confsignal/list`,
    method: 'POST',
    data
  })
}
// 获取列表信息
export function distributeRecord(data) {
  return request({
    url: `/yuqing-visualize/hot_event/list`,
    method: 'POST',
    data
  })
}
// 获取事件详情信息
export function topicContext(topic_id) {
  return request({
    url: `/yuqing-visualize/hot_event/${topic_id}`,
    method: 'POST'
  })
}
// 获取子事件详情信息
export function details(data) {
  return request({
    url: `/yuqing-visualize/hot_event/topic_context`,
    method: 'POST',
    data
  })
}
// 获取关键词云
export function keyWordsCloud(data) {
  return request({
    url: `/yuqing-visualize/hot_event/key_words_cloud`,
    method: 'POST',
    data
  })
}
// 获取传播路径
export function spreadPath(data) {
  return request({
    url: `/yuqing-visualize/hot_event/spread_path`,
    method: 'POST',
    data
  })
}
// 获取情感占比分析
export function emotionAnalysis(data) {
  return request({
    url: `/yuqing-visualize/hot_event/emotion_analysis`,
    method: 'POST',
    data
  })
}
// 获取调性占比分析
export function tonalAnalysis(data) {
  return request({
    url: `/yuqing-visualize/hot_event/tonal_analysis`,
    method: 'POST',
    data
  })
}
// 导出文件
export function domnLoadFile(data) {
  return request({
    url: `/yuqing-visualize/hot_event/export_hot_topic_list`,
    responseType: 'blob',
    method: 'POST',
    data
  })
}
// 传播趋势
export function spreadTrend(data) {
  return request({
    url: `/yuqing-visualize/hot_event/spread_trend`,
    method: 'POST',
    data
  })
}
