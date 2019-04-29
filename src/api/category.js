import request from '@/utils/request'

export function list() {
  return request({
    url: '/categories',
    method: 'get'
  })
}

export function add(data) {
  return request({
    url: '/categories',
    method: 'post',
    data
  })
}

export function edit(id, data) {
  return request({
    url: '/categories/' + id,
    method: 'put',
    data
  })
}

export function del(id) {
  return request({
    url: '/categories/' + id,
    method: 'delete'
  })
}

export function moveDown(id, data) {
  return request({
    url: '/categories/' + id,
    method: 'put',
    data
  })
}

export function moveUp(id, data) {
  return request({
    url: '/categories/' + id,
    method: 'put',
    data
  })
}
