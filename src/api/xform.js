import request from '@/utils/request'

export function getXforms(query) {
  return request({
    url: '/xforms',
    method: 'get',
    params: query
  })
}

export function addXform(data) {
  return request({
    url: '/xforms',
    method: 'post',
    data
  })
}

export function updateXform(id, data) {
  return request({
    url: '/xforms/' + id,
    method: 'put',
    data
  })
}

export function deleteXform(id) {
  return request({
    url: '/xforms/' + id,
    method: 'delete'
  })
}
