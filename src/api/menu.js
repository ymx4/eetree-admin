import request from '@/utils/request'

export function getMenus() {
  return request({
    url: '/admin_menus',
    method: 'get'
  })
}
