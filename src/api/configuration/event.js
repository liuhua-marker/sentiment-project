import request from '@/utils/request'

// 获取列表信息
export function confeventList(data) {
  return request({
    url: `/yuqing-configuration/conf_event/list`,
    method: 'POST',
    data
  })
}
// 获取事件词列表信息
export function confeventwordList(data) {
  return request({
    url: `/yuqing-configuration/conf_event_word/list`,
    method: 'POST',
    data
  })
}
// 获取事件类型信息
export function getEventTypeMap(data) {
  return request({
    url: `/yuqing-configuration/conf_event/getEventEmotionMap`,
    method: 'GET',
    data
  })
}
// 新增信息
export function confeventSave(data) {
  return request({
    url: `/yuqing-configuration/conf_event/save`,
    method: 'POST',
    data
  })
}
// 根据id删除
export function confeventDelete(ids) {
  return request({
    url: `/yuqing-configuration/conf_event/delete`,
    method: 'DELETE',
    data: ids
  })
}
// 修改信息
export function confeventUpdate(data) {
  return request({
    url: `/yuqing-configuration/conf_event/update`,
    method: 'PUT',
    data
  })
}
// 事件词新增信息
export function confeventwordSave(data) {
  return request({
    url: `/yuqing-configuration/conf_event_word/save`,
    method: 'POST',
    data
  })
}
// 事件词根据id删除
export function confeventwordDelete(ids) {
  return request({
    url: `/yuqing-configuration/conf_event_word/delete`,
    method: 'DELETE',
    data: ids
  })
}
// 事件词修改信息
export function confeventwordUpdate(data) {
  return request({
    url: `/yuqing-configuration/conf_event_word/update`,
    method: 'PUT',
    data
  })
}
// 导出文件
export function domnLoadFile(solution_id) {
  return request({
    url: `/yuqing-configuration/confsignal/export/${solution_id}`,
    responseType: 'blob',
    method: 'GET'
  })
}
// 导出模板
export function domnLoadModel() {
  return request({
    url: `/yuqing-configuration/conf_event/export_template`,
    responseType: 'blob',
    method: 'GET'
  })
}
// 导出模板
export function eventWordDomnLoadModel() {
  return request({
    url: `/yuqing-configuration/conf_event_word/export_template`,
    responseType: 'blob',
    method: 'GET'
  })
}
