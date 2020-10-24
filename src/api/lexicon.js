import request from '@/utils/request'

export function warningWords(type) {
  return request({
    url: `/yuqing-configuration/confNegativeWordMapping/getWarningIndexList/${type}`,
    method: 'get'
  })
}

export function mappingWords(data) {
  return request({
    url: `/yuqing-configuration/confNegativeWordMapping/page`,
    method: 'post',
    data
  })
}

