import request from '@/utils/request'

export function getPlatforms() {
  return request({
    url: '/platforms',
    method: 'get'
  })
}

export function addPlatform(data) {
  return request({
    url: '/platforms',
    method: 'post',
    data
  })
}

export function updatePlatform(id, data) {
  return request({
    url: '/platforms/' + id,
    method: 'put',
    data
  })
}

export function deletePlatform(id) {
  return request({
    url: '/platforms/' + id,
    method: 'delete'
  })
}

export function changeOrder(id, moveId) {
  const data = { move_id: moveId }
  return request({
    url: '/platforms/' + id,
    method: 'put',
    data
  })
}
