import request from '@/utils/request'

// 获取列表信息
export function confsourcelabelList(data) {
  return request({
    url: `/yuqing-configuration/configuration/confsourcelabel/list`,
    method: 'POST',
    data
  })
}

// 新增信息
export function confsourcelabelSave(data) {
  return request({
    url: `/yuqing-configuration/configuration/confsourcelabel/save`,
    method: 'POST',
    data
  })
}
// 根据id删除
export function handleDelete(ids) {
  return request({
    url: `/yuqing-configuration/configuration/confsourcelabel/delete`,
    method: 'DELETE',
    data: ids
  })
}
// 修改信息
export function confsourcelabelUpdate(data) {
  return request({
    url: `/yuqing-configuration/configuration/confsourcelabel/update`,
    method: 'PUT',
    data
  })
}
// 导出文件
export function domnLoadFile(solution_id, words_type_id) {
  return request({
    url: `/yuqing-configuration/confinferencewords/export/${solution_id}/${words_type_id}`,
    responseType: 'blob',
    method: 'GET'
  })
}
// 导出模板
export function domnLoadModel() {
  return request({
    url: `/yuqing-configuration/confinferencewords/exportTemplate`,
    responseType: 'blob',
    method: 'GET'
  })
}
