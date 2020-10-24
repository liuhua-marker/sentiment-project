import {
  constantRoutes
} from '@/router'
import {
  userMenu
} from '@/api/user'
import Layout from '@/layout'

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
// function hasPermission(roles, route) {
//   if (route.meta && route.meta.roles) {
//     return roles.some(role => route.meta.roles.includes(role))
//   } else {
//     return true
//   }
// }

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(menuTree, name, parentMenuCategory) {
  const routerArr = []
  const buttonArr = []
  menuTree.forEach(mEl => {
    // const { menuName: title, attributes: { icon: iconfont, url: path } } = mEl
    if (mEl.menuCategory === 'button') {
      buttonArr.push(mEl)
      sessionStorage.setItem(name, JSON.stringify(buttonArr))
      return
    }
    const routerObj = {
      path: mEl.menuUrl || mEl.menuName,
      component: () => import(`@/views${mEl.menuUrl}`),
      name: mEl.menuName || mEl.menuUrl,
      meta: {
        title: mEl.menuName,
        icon: mEl.menuIcon || '',
        menuCode: mEl.menuCode
      }
    }
    if (mEl.children && mEl.children.length !== 0) {
      if (mEl.menuCategory === 'directory') {
        routerObj.showChild = true
        routerObj.alwaysShow = true
        if (!parentMenuCategory) {
          routerObj.component = Layout
        }
      }
      routerObj.children = filterAsyncRoutes(mEl.children, mEl.menuUrl || mEl.menuName, mEl.menuCategory)
    } else {
      routerObj.children = []
    }
    routerArr.push(routerObj)
  })
  return routerArr
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes({
    commit
  }, roles) {
    return new Promise(resolve => {
      userMenu().then(res => {
        const accessedRoutes = filterAsyncRoutes(res.data)
        accessedRoutes.push({ path: '*', redirect: '/login', hidden: true })
        commit('SET_ROUTES', accessedRoutes)
        resolve(accessedRoutes)
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
