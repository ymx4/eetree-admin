import request from '@/utils/request'

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