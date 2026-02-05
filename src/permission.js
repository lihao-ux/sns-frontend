import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
import { isPathMatch } from '@/utils/validate'
import { isRelogin } from '@/utils/request'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/register']

const isWhiteList = (path) => {
  return whiteList.some(pattern => isPathMatch(pattern, path))
}

router.beforeEach((to, from, next) => {
  NProgress.start()
  if (getToken()) {
    to.meta.title && store.dispatch('settings/setTitle', to.meta.title)
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else if (isWhiteList(to.path)) {
      next()
    } else {
      if (store.getters.roles.length === 0) {
        isRelogin.show = true
        store.dispatch('GetInfo').then(() => {
          isRelogin.show = false
          store.dispatch('GenerateRoutes').then(accessRoutes => {
            router.addRoutes(accessRoutes)
            
            const roles = store.getters.roles
            // 首次加载/刷新后的处理
            if (to.path === '/' || to.path === '/index') {
              // 如果是 admin，直接放行到默认首页，不要用 { ...to } 触发重定向循环
              if (roles.includes('admin')) {
                next({ path: '/index', replace: true }) 
              } else {
                handleRoleRedirect(roles, next)
              }
            } else {
              // 刷新的是非首页（如案件详细），正常放行
              next({ ...to, replace: true })
            }
          })
        }).catch(err => {
          store.dispatch('LogOut').then(() => {
            Message.error(err)
            next({ path: '/' })
          })
        })
      } else {
        const roles = store.getters.roles
        // 已有角色信息时的跳转处理
        if (to.path === '/' || to.path === '/index') {
          if (roles.includes('admin')) {
            next() // admin 直接进，不再拦截
          } else {
            handleRoleRedirect(roles, next)
          }
        } else {
          next()
        }
      }
    }
  } else {
    if (isWhiteList(to.path)) {
      next()
    } else {
      next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
      NProgress.done()
    }
  }
})

/**
 * 提取公共的重定向逻辑
 * 注意：只有确定要改变 path 的时候才调用这个函数
 */
function handleRoleRedirect(roles, next) {
  // 根据你的截图，manger 拼写可能少了个 a，请务必保持和数据库一致
  if (roles.includes('manger') || roles.includes('commpany_admin')) {
    next({ path: '/caseInfo/case', replace: true })
  } else if (roles.includes('staff')) {
    next({ path: '/staffInfo', replace: true })
  } else {
    // 兜底：如果都没有匹配到，直接放行，避免死循环
    next()
  }
}

router.afterEach(() => {
  NProgress.done()
})