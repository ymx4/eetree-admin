import request from '@/utils/request'

export function getArticleDrafts(query) {
  return request({
    url: '/articleDrafts',
    method: 'get',
    params: query
  })
}

export function pass(id) {
  const data = { status: 9 }
  return request({
    url: '/articleDrafts/' + id + '/review',
    method: 'put',
    data
  })
}

export function refuse(id, data) {
  data.status = 8
  return request({
    url: '/articleDrafts/' + id + '/review',
    method: 'put',
    data
  })
}
