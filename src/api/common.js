import request from '@/utils/request'

export function getEnums(key, t = '') {
  return request({
    url: '/common/enums',
    method: 'get',
    params: { term: key, t }
  })
}
