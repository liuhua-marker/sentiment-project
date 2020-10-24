import request from '@/utils/request'

// 获取列表信息
export function publicSentimentMonitor(data) {
  return request({
    url: `/yuqing-visualize/monitor/publicSentimentMonitor`,
    method: 'POST',
    data
  })
}
