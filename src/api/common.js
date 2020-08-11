import request from '@/utils/request'

export function getEnums(key, t = '') {
  return request({
    url: '/common/enums',
    method: 'get',
    params: { term: key, t }
  })
}

export function getStatus() {
  return {
    draft: 0,
    submit: 1,
    refuse: 8,
    pass: 9
  }
}
