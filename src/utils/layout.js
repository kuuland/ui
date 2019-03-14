import _ from 'lodash'

export function calcOpenKeys (activePane, menus) {
  if (!activePane) {
    return
  }
  const openKeys = []
  const menusMap = _.chain(menus, '_id').groupBy('_id').mapValues(v => _.head(v)).value()
  const pick = (menu, menusMap, openKeys) => {
    if (!menu) {
      return
    }
    openKeys.push(menu._id)
    if (menu.Pid) {
      pick(menusMap[menu.Pid], menusMap, openKeys)
    }
  }
  pick(activePane, menusMap, openKeys)
  return openKeys
}
