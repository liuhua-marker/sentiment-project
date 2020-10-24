import request from '@/utils/request'

export function findJZInternetByParams(data) {
  return request({
    url: `yuqing-visualize/yqSearch/findJZInternetByParams`,
    method: 'post',
    data
  })
}

export function findJZNoticeByParams(data) {
  return request({
    url: `yuqing-visualize/yqSearch/findJZNoticeByParams`,
    method: 'post',
    data
  })
}

export function findZHInternetByParams(data) {
  return request({
    url: `yuqing-visualize/yqSearch/findZHInternetByParams`,
    method: 'post',
    data
  })
}

export function findZHNoticeByParams(data) {
  return request({
    url: `yuqing-visualize/yqSearch/findZHNoticeByParams`,
    method: 'post',
    data
  })
}
