import request from '@/utils/request'

export function getUsers(query) {
  return request({
    url: '/admins',
    method: 'get',
    params: query
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

// role
export function getRoles(query) {
  return request({
    url: '/admin_roles',
    method: 'get',
    params: query
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

// permission
export function getPermissions(query) {
  return request({
    url: '/admin_permissions',
    method: 'get',
    params: query
  })
}

export function addPermission(data) {
  return request({
    url: '/admin_permissions',
    method: 'post',
    data
  })
}

export function updatePermission(id, data) {
  return request({
    url: '/admin_permissions/' + id,
    method: 'put',
    data
  })
}

export function deletePermission(id) {
  return request({
    url: '/admin_permissions/' + id,
    method: 'delete'
  })
}
