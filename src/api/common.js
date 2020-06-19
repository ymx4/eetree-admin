import request from '@/utils/request'

export function getEnums(key) {
  return request({
    url: '/common/enums',
    method: 'get',
    params: { term: key }
  })
}
