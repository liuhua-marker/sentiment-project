import request from '@/utils/request'

// 通过公司检索新闻
export function searchByCompany(data) {
  return request({
    url: `/yuqing-visualize/yuqing_search/searchByCompany`,
    method: 'post',
    data
  })
}

// 通过公司检索事件
export function searchEventByEvent(data) {
  return request({
    url: `/yuqing-visualize/yuqing_search/searchEventByEvent`,
    method: 'post',
    data
  })
}

// 通过公司检索新闻
export function getYuqingListByCondition(data) {
  return request({
    url: `/yuqing-visualize/risk_portrait/getYuqingListByCondition`,
    method: 'post',
    data
  })
}
