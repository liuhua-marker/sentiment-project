import request from '@/utils/request'

export function findCompNames(data) {
  return request({
    url: `yuqing-visualize/yqSearch/findCompNames`,
    method: 'post',
    data
  })
}

export function uploadCompanys(data) {
  return request({
    url: `yuqing-visualize/yqSearch/uploadCompanys`,
    method: 'post',
    data
  })
}
