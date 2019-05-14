import request from '@/utils/request'

export function getDocPublishs(query) {
  return request({
    url: '/docPublishs',
    method: 'get',
    params: query
  })
}

export function docShow(id) {
  return request({
    url: '/docPublishs/' + id + '/previewKey',
    method: 'get'
  })
}

export function pass(id, data) {
  data.status = 9
  return request({
    url: '/docPublishs/' + id + '/review',
    method: 'put',
    data
  })
}

export function refuse(id, data) {
  data.status = 8
  return request({
    url: '/docPublishs/' + id + '/review',
    method: 'put',
    data
  })
}
