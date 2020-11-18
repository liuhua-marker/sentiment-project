import request from '@/utils/request'

// 通过公司检索新闻
export function searchByCompany(data) {
  return request({
    url: `/yuqing-visualize/yuqing_search/searchByCompany`,
    method: 'post',
    data
  })
}

// 通过全部检索新闻
export function findEsOriginalAll(data) {
  return request({
    url: `/yuqing-visualize/yuqing_search/findEsOriginalAll`,
    method: 'post',
    data
  })
}

// 最热的10条事件
export function findHotTopicTop(data) {
  return request({
    url: `/yuqing-visualize/hot_event/findHotTopicTop`,
    method: 'get',
    data
  })
}
