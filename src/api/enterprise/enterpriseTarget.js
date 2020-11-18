import request from '@/utils/request'

// 获取列表信息
export function confcompanyList(data) {
  return request({
    url: `/yuqing-configuration/confcompany/list`,
    method: 'POST',
    data
  })
}
// 获取关键词列表信息
export function confcompanyKeywordList(data) {
  return request({
    url: `/yuqing-configuration/conf_target_keywords/list`,
    method: 'POST',
    data
  })
}
// 获取类型
export function list(data) {
  return request({
    url: `/yuqing-configuration/confcompanytype/list`,
    method: 'POST',
    data
  })
}
// 判断关键词对错
export function affirm(keyword_id, data) {
  return request({
    url: `/yuqing-configuration/conf_target_keywords/affirm/${keyword_id}/?affirm=${data}`,
    method: 'POST'
  })
}
// 保存关键词
export function companykeywordSave(data) {
  return request({
    url: `/yuqing-configuration/conf_target_keywords/save`,
    method: 'POST',
    data
  })
}

// 历史数据分发
export function informAICompanyAdd(days) {
  return request({
    url: `/yuqing-configuration/confcompany/informAICompanyAdd/${days}`,
    method: 'GET'
  })
}

// 查询上传文件进度
export function selectUploadInfo(uploadId) {
  return request({
    url: `/yuqing-configuration/common/selectUploadInfo/${uploadId}`,
    method: 'GET'
  })
}
// 查询是否正在上传
export function selectUploadInfoByType(upload_type) {
  return request({
    url: `/yuqing-configuration/common/selectUploadInfoByType/${upload_type}`,
    method: 'POST'
  })
}
// 查询补充关键词excel是否生成
export function selectExcelIsExist(title) {
  return request({
    url: `/yuqing-configuration/common/selectExcelIsExist/${title}`,
    method: 'POST'
  })
}
// 获取公司简称
// export function getAbb(companyName) {
//   return request({
//     url: `/yuqing-configuration/confcompany/getCompanyAdd/${companyName}`,
//     method: 'GET'
//   })
// }
// 新增信息
export function confcompanySave(data) {
  return request({
    url: `/yuqing-configuration/confcompany/save`,
    method: 'POST',
    data
  })
}
// 根据id删除
export function handleDelete(ids) {
  return request({
    url: `/yuqing-configuration/confcompany/delete`,
    method: 'DELETE',
    data: ids
  })
}
// 编辑信息
export function confcompanyUpdate(data) {
  return request({
    url: `/yuqing-configuration/confcompany/update`,
    method: 'PUT',
    data
  })
}
// 导出文件
export function domnLoadFile() {
  return request({
    url: `/yuqing-configuration/confcompany/export`,
    method: 'GET'
  })
}
// 查询excle是否已生成
export function downloadExcel(data) {
  return request({
    url: `/yuqing-configuration/common/downloadExcel/${data}`,
    responseType: 'blob',
    method: 'POST'
  })
}
// 导出模板
export function domnLoadModel() {
  return request({
    url: `/yuqing-configuration/confcompany/toTemplateDownload`,
    responseType: 'blob',
    method: 'GET'
  })
}
