const getters = {
  sidebar: state => state.app.sidebar,
  size: state => state.app.size,
  isDot: state => state.app.isDot,
  device: state => state.app.device,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  introduction: state => state.user.introduction,
  roles: state => state.user.roles,
  bId: state => state.user.bId,
  userInfo: state => state.user.userInfo,
  permission_routes: state => state.permission.routes,
  errorLogs: state => state.errorLog.logs
}
export default getters
