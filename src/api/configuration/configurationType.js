import request from '@/utils/request'

// 获取列表信息
export function conflabeltypeList(data) {
  return request({
    url: `/yuqing-configuration/configuration/conflabeltype/list`,
    method: 'POST',
    data
  })
}

// 获取词库类别信息
export function getLabelTypeClassifyMap(data) {
  return request({
    url: `/yuqing-configuration/configuration/conflabeltype/getLabelTypeClassifyMap`,
    method: 'GET',
    data
  })
}

// 新增信息
export function conflabeltypeSave(data) {
  return request({
    url: `/yuqing-configuration/configuration/conflabeltype/save`,
    method: 'POST',
    data
  })
}
// 根据id删除
export function handleDelete(ids) {
  return request({
    url: `/yuqing-configuration/configuration/conflabeltype/delete`,
    method: 'DELETE',
    data: ids
  })
}
// 修改信息
export function conflabeltypeUpdate(data) {
  return request({
    url: `/yuqing-configuration/configuration/conflabeltype/update`,
    method: 'PUT',
    data
  })
}
