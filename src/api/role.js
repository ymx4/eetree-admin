import request from '@/utils/request'

export function getRoles() {
  return request({
    url: '/admin_roles',
    method: 'get'
  })
}

export function addRole(data) {
  return request({
    url: '/admin_roles',
    method: 'post',
    data
  })
}

export function updateRole(id, data) {
  return request({
    url: '/admin_roles/' + id,
    method: 'put',
    data
  })
}

export function deleteRole(id) {
  return request({
    url: '/admin_roles/' + id,
    method: 'delete'
  })
}
