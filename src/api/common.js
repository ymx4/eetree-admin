import request from '@/utils/request'

export function getEnums(key, t = '') {
  return request({
    url: '/common/enums',
    method: 'get',
    params: { term: key, t }
  })
}

export function secret() {
  return request({
    url: '/common/secret',
    method: 'get'
  })
}
