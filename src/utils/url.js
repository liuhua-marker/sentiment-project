var api = '/api'
export function getURL() {
  return `http://192.168.36.171:8088/${api}`
}
// 数据管理
export function confDataSource() {
  return `${api}/yuqing-configuration/confDataSource/inputExcel` // 导入
}
// 企业管理
export function confcompany() {
  return `${api}/yuqing-configuration/confcompany/inputExcel` // 导入
}
// 企业管理上传补充关键字
export function uploadKeyWords() {
  return `${api}/yuqing-configuration/confcompany/uploadKeyWords` // 导入
}
// // 部门企业管理
// export function deptInputExcel() {
//   return `${api}/yuqing-configuration/confcompany/deptInputExcel` // 导入
// }
// 信号管理
// export function confsignal() {
//   return `${api}/yuqing-configuration/confsignal/importExcel` // 导入
// }
// // 负面词管理
// export function confnegativewords() {
//   return `${api}/yuqing-configuration/confnegativewords/importExcel/` // 导入
// }
// 正面词管理
// export function confactivewords() {
//   return `${api}/yuqing-configuration/confactivewords/importExcel/` // 导入
// }
// 公司名称管理
export function companyModelUpload() {
  return `${api}/yuqing-configuration/conf_company_comb_sub_relation/companyModelUpload/` // 导入
}
// 目标规则
export function conftargetrules() {
  return `${api}/yuqing-configuration/conftargetrules/importExcel/` // 导入
}
// 数据源规则
export function confsourcerules() {
  return `${api}/yuqing-configuration/conf_source_rules/importExcel/` // 导入
}
// 词规则
export function confnegativewordrules() {
  return `${api}/yuqing-configuration/confnegativewordrules/importExcel/` // 导入
}
// 领域规则
export function confdomainrules() {
  return `${api}/yuqing-configuration/conf_domain_rules/importExcel/` // 导入
}
// 事件管理
export function confEventImportExcel() {
  return `${api}/yuqing-configuration/conf_event/import_excel/` // 导入
}
// 事件词管理
export function confEventWordImportExcel() {
  return `${api}/yuqing-configuration/conf_event_word/import_excel/` // 导入
}
// 事件类型管理
export function EventTypeImportExcel() {
  return `${api}/yuqing-configuration/conf_event_type/import_excel` // 导入
}
