import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path*',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  // {
  //   path: '',
  //   component: Layout,
  //   redirect: '/doc/list'
  // },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  { path: '*', redirect: '/404', hidden: true }
]

export const mapRoutes = {
  Layout: Layout,
  admin_user: () => import('@/views/admin/user'),
  admin_role: () => import('@/views/admin/role'),
  admin_permission: () => import('@/views/admin/permission'),
  category_list: () => import('@/views/category/list'),
  tag_list: () => import('@/views/tag/list'),
  doc_list: () => import('@/views/doc/list'),
  doc_review: () => import('@/views/doc/review'),
  comment_list: () => import('@/views/comment/list'),
  user_list: () => import('@/views/user/list'),
  project_list: () => import('@/views/project/list'),
  project_review: () => import('@/views/project/review'),
  goods_list: () => import('@/views/project/goods_list'),
  goods_trial_list: () => import('@/views/project/goods_trial_list'),
  goods_trial_review: () => import('@/views/project/goods_trial_review'),
  platform_list: () => import('@/views/platform/list'),
  supplier_list: () => import('@/views/supplier/list'),
  product_list: () => import('@/views/product/list'),
  recommend_list: () => import('@/views/recommend/list'),
  order_list: () => import('@/views/order/list'),
  form_list: () => import('@/views/form/list')
}

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
