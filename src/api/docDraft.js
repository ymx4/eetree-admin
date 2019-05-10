import request from '@/utils/request'

export function getDocDrafts(query) {
  return request({
    url: '/docDrafts',
    method: 'get',
    params: query
  })
}

export function pass(id, data) {
  data.status = 9
  return request({
    url: '/docDrafts/' + id + '/review',
    method: 'put',
    data
  })
}

export function refuse(id, data) {
  data.status = 8
  return request({
    url: '/docDrafts/' + id + '/review',
    method: 'put',
    data
  })
}
