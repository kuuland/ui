import { get } from 'kuu-tools'
import _ from 'lodash'
import arrayToTree from 'array-to-tree'
import router from 'umi/router'
import config from '@/config'
import { isWhiteRoute } from '@/utils/tools'

export default {
  state: {
    menus: undefined,
    menusTree: undefined,
    activeMenuIndex: 0,
    activePane: undefined,
    openKeys: [],
    panes: []
  },
  reducers: {
    SET_MENUS (state, { payload: menus }) {
      const menusTree = arrayToTree(_.cloneDeep(menus), {
        customID: 'ID',
        parentProperty: 'Pid',
        childrenProperty: 'Children'
      })
      let { activeMenuIndex, openKeys } = state
      if (activeMenuIndex < 0 || activeMenuIndex >= menusTree.length) {
        activeMenuIndex = 0
      }
      if (_.isEmpty(openKeys)) {
        openKeys = _.get(menusTree, `[${activeMenuIndex}].Children`, []).map(item => `${item.ID}`)
      }
      return { ...state, menus, menusTree, openKeys, activeMenuIndex }
    },
    SET_PANES (state, { payload: panes }) {
      panes = panes.filter(pane => !!pane)
      const newState = { panes }
      if (_.isEmpty(panes)) {
        newState.activeMenuIndex = 0
        newState.activePane = undefined
      }
      return { ...state, ...newState }
    },
    SET_ACTIVE_MENU_INDEX (state, { payload: activeMenuIndex }) {
      return { ...state, activeMenuIndex }
    },
    SET_OPEN_KEYS (state, { payload: openKeys }) {
      return { ...state, openKeys }
    },
    SET_ACTIVE_PANE (state, { payload }) {
      const { activePane, openKeys, panes } = payload
      if (_.isEmpty(openKeys)) {
        return { ...state, activePane, panes }
      }
      return { ...state, activePane, openKeys, panes }
    }
  },
  effects: {
    * init ({ payload }, { put, call, select }) {
      if (window.localStorage.getItem('logout')) {
        return
      }
      const { user, layout, enums } = yield select(state => state)
      // 校验令牌
      if (!user.loginData) {
        yield put({ type: 'user/valid' })
      }
      // 加载菜单
      if (!layout.menus) {
        yield put({ type: 'loadMenus' })
        yield put({ type: 'theme/loadTheme' })
      }
      // 加载枚举
      if (_.isEmpty(enums.enumMap)) {
        yield put({ type: 'enums/loadAllEnums' })
      }
    },
    * loadMenus ({ payload }, { put, call }) {
      const data = yield call(get, '/user/menus')
      let menus = Array.isArray(data) ? data : []
      menus = _.chain(menus)
        .filter(item => {
          if (item.Disable === false) {
            return false
          }
          return item.IsVirtual !== true
        })
        .sortBy('Sort').value()
      yield put({ type: 'SET_MENUS', payload: menus })
    },
    * openPane ({ payload: value }, { put, select }) {
      const state = yield select(state => state.layout)
      const { menus, activePane: currentActivePane } = state
      const panes = state.panes.filter(pane => !!pane)
      let openKeys = state.openKeys
      let activePane = panes.find(p => `${p.ID}` === `${value.ID}`)

      if (!activePane) {
        activePane = value
        const currentIndex = _.findIndex(panes, p => `${p.ID}` === `${currentActivePane.ID}`)
        if (currentIndex > 0 && (currentIndex + 1) < panes.length) {
          panes.splice(currentIndex + 1, 0, value)
        } else {
          panes.push(value)
        }
      }
      const newOpenKeys = calcOpenKeys(activePane, menus)
      if (!_.isEmpty(newOpenKeys)) {
        openKeys = newOpenKeys
      }
      // 更新启用标签
      yield put({ type: 'SET_ACTIVE_PANE', payload: { activePane, openKeys, panes } })
      // 路由跳转
      const pathname = value.IsLink ? `/sys/iframe/${value.ID}` : value.URI
      const data = _.omit(value, 'Content')
      yield router.push({
        pathname,
        state: data
      })
    },
    * delPane ({ payload: targetKey }, { put, select }) {
      const state = yield select(state => state.layout)
      const { panes } = state
      const index = panes.findIndex(p => `${p.ID}` === targetKey)
      if (index >= 0) {
        let activePane = _.get(panes, `[${index - 1}]`) || _.get(panes, `[${index + 1}]`) || _.get(panes, '[0]') || null
        panes.splice(index, 1)
        if (_.includes(panes, state.activePane)) {
          activePane = state.activePane
        }
        yield put({ type: 'SET_PANES', payload: panes })
        if (panes.length > 0) {
          yield put({ type: 'openPane', payload: activePane })
        } else {
          yield put({ type: 'SET_ACTIVE_PANE', payload: { activePane: undefined, openKeys: [], panes } })
        }
      }
    }

  },
  subscriptions: {
    setup (ctx) {
      const { dispatch, history } = ctx
      const state = window.g_app._store.getState()
      // 查询国际化
      if (_.isEmpty(_.get(state, 'i18n.localeMessages'))) {
        dispatch({
          type: 'i18n/langmsgs'
        })
      }
      const listener = route => {
        if (route.pathname !== config.loginPathname && !isWhiteRoute(route.pathname)) {
          dispatch({ type: 'init' })
        }
      }
      history.listen(listener)
    }
  }
}

function calcOpenKeys (activePane, menus) {
  if (!activePane) {
    return
  }
  const openKeys = []
  const menusMap = _.chain(menus, 'ID').groupBy('ID').mapValues(v => _.head(v)).value()
  const pick = (menu, menusMap, openKeys) => {
    if (!menu) {
      return
    }
    if (menusMap[menu.ID]) {
      openKeys.push(`${menu.ID}`)
    }
    if (menu.Pid) {
      pick(menusMap[menu.Pid], menusMap, openKeys)
    }
  }
  pick(activePane, menusMap, openKeys)
  return openKeys
}
