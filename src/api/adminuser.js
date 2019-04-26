import request from '@/utils/request'

export function getUsers() {
  return request({
    url: '/admins',
    method: 'get'
  })
}

export function addUser(data) {
  return request({
    url: '/admins',
    method: 'post',
    data
  })
}

export function updateUser(id, data) {
  return request({
    url: '/admins/' + id,
    method: 'put',
    data
  })
}

export function deleteUser(id) {
  return request({
    url: '/admins/' + id,
    method: 'delete'
  })
}
