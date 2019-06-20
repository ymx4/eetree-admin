import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}

export function getInfo() {
  return request({
    url: '/info',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/logout',
    method: 'get'
  })
}

export function getUsers(query) {
  return request({
    url: '/users',
    method: 'get',
    params: query
  })
}

export function addUser(data) {
  return request({
    url: '/users',
    method: 'post',
    data
  })
}

export function updateUser(id, data) {
  return request({
    url: '/users/' + id,
    method: 'put',
    data
  })
}

export function deleteUser(id) {
  return request({
    url: '/users/' + id,
    method: 'delete'
  })
}
