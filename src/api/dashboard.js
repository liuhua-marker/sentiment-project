import request from '@/utils/request'
// 根据机构获取部门信息
export function queryAllDept(bid) {
  return request({
    url: `/yuqing-system/dept/queryAllDept`,
    method: 'GET',
    bid
  })
}
// 获取数据类型列表
export function confdatasourcetype(data) {
  return request({
    url: `/yuqing-configuration/confdatasourcetype/list`,
    method: 'POST',
    data
  })
}
// 获取机构列表信息
export function system() {
  return request({
    url: `/yuqing-system/api/dept/getOrgAndDept`,
    method: 'POST'
  })
}

// 获取首页数量信息
export function homePageIndex(data) {
  return request({
    url: `/yuqing-visualize/index/homePageIndex`,
    method: 'POST',
    data
  })
}
// 获取部门用户首页数量信息
export function targetCombinationHomePageIndex(data) {
  return request({
    url: `/yuqing-visualize/index/targetCombinationHomePageIndex?companyCombSubId=${data.companyCombSubId}`,
    method: 'GET'
  })
}

// 关注部门
export function confdeptfollow(data) {
  return request({
    url: `/yuqing-configuration/confdeptfollow/follow`,
    method: 'POST',
    data
  })
}

// // 获取关注部门信息
// export function confdeptfollowList() {
//   return request({
//     url: `/yuqing-configuration/confdeptfollow/follow_list`,
//     method: 'POST'
//   })
// }

// 获取数据源类型柱状图
export function dataSourceTypeBarChart(data) {
  return request({
    url: `/yuqing-visualize/index/dataSourceTypeBarChart`,
    method: 'POST',
    data
  })
}
// 获取数据源类型饼图
export function dataSourceTypePie(data) {
  return request({
    url: `/yuqing-visualize/index/dataSourceTypePie`,
    method: 'POST',
    data
  })
}
