import request from '@/utils/request'

// 获取列表信息
export function confCompanyCombinationSubscribe(data) {
  return request({
    url: `/yuqing-configuration/confCompanyCombinationSubscribe/list`,
    method: 'POST',
    data
  })
}
// 获取公司名列表信息
export function confcompanyNameList(data) {
  return request({
    url: `/yuqing-configuration/conf_company_comb_sub_relation/queryCombSubRelation`,
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
export function confCompanyCombinationSubscribeSave(data) {
  return request({
    url: `/yuqing-configuration/confCompanyCombinationSubscribe/save`,
    method: 'POST',
    data
  })
}
// 根据id删除
export function confCompanyCombinationSubscribeDelete(ids) {
  return request({
    url: `/yuqing-configuration/confCompanyCombinationSubscribe/delete`,
    method: 'DELETE',
    data: ids
  })
}
// 编辑信息
export function confCompanyCombinationSubscribeUpdate(data) {
  return request({
    url: `/yuqing-configuration/confCompanyCombinationSubscribe/update`,
    method: 'PUT',
    data
  })
}
// 公司名新增信息
export function confcompanyNameSave(data) {
  return request({
    url: `/yuqing-configuration/conf_company_comb_sub_relation/save`,
    method: 'POST',
    data
  })
}
// 公司名根据id删除
export function confcompanyNameDelete(ids) {
  return request({
    url: `/yuqing-configuration/conf_company_comb_sub_relation/delete`,
    method: 'DELETE',
    data: ids
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
// 导出模板公司名
export function companyNameDomnLoadModel() {
  return request({
    url: `/yuqing-configuration/conf_company_comb_sub_relation/companyModelDownload`,
    responseType: 'blob',
    method: 'GET'
  })
}
