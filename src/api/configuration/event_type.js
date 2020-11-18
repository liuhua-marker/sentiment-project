import request from '@/utils/request'

// 获取列表信息
export function eventTypeList(data) {
  return request({
    url: `/yuqing-configuration/conf_event_type/list`,
    method: 'POST',
    data
  })
}
// 生效的方案
export function selectNowSolution(deptId) {
  return request({
    url: `/yuqing-configuration/confsolution/selectNowSolution/${deptId}`,
    method: 'POST'
  })
}
// 新增信息
export function eventTypeSave(data) {
  return request({
    url: `/yuqing-configuration/conf_event_type/save`,
    method: 'POST',
    data
  })
}

// 根据id删除
export function eventTypeDelete(ids) {
  return request({
    url: `/yuqing-configuration/conf_event_type/delete`,
    method: 'DELETE',
    data: ids
  })
}

// 编辑信息
export function eventTypeUpdate(data) {
  return request({
    url: `/yuqing-configuration/conf_event_type/update`,
    method: 'PUT',
    data
  })
}

// 导出模板
export function domnLoadModel() {
  return request({
    url: `/yuqing-configuration/conf_event_type/export_template`,
    responseType: 'blob',
    method: 'GET'
  })
}
