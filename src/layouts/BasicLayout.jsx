import React from 'react'
import _ from 'lodash'
import router from 'umi/router'
import { connect } from 'dva'
import withRouter from 'umi/withRouter'
import { Layout, Menu, Icon, Skeleton } from 'antd'
import { parseIcon, withLocale } from 'kuu-tools'
import styles from './index.less'
import LayoutTabs from '@/components/sys/layout-tabs'
import Navbar from '@/components/sys/navbar'
import config from '@/config'

const { Sider } = Layout

class BasicLayout extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      collapsed: false
    }
    this.panesContent = {}
    this.toggleSider = this.toggleSider.bind(this)
    this.handleTabsChange = this.handleTabsChange.bind(this)
    this.handleTabsRemove = this.handleTabsRemove.bind(this)
    this.handleTabsContext = this.handleTabsContext.bind(this)
  }

  toggleSider () {
    this.setState({
      collapsed: !this.state.collapsed
    })
  }

  componentDidMount () {
    const isDebug = _.get(process, 'env.NODE_ENV', _.get(window, 'process.env.NODE_ENV', 'development')) === 'development'
    if (_.get(this.props, 'location.pathname') !== _.get(this.props, 'activePane.URI') && !isDebug) {
      console.warn('权限拦截：请新增菜单并分配权限，通过点击菜单跳转至页面')
      router.replace(_.get(this.props, 'activePane.URI'))
    }
  }

  renderMenuChildren (values, breadcrumbs = []) {
    values = _.chain(values)
      .filter(item => !!item.Disable !== true || item.IsVirtual === true)
      .sortBy('Sort').value()
    const groups = _.groupBy(values, 'Group')
    let arr = []
    for (const key in groups) {
      const data = groups[key]
      const name = key !== 'undefined' ? key : null
      let ret = []
      for (const value of data) {
        const iconStyle = {}
        if (this.state.collapsed) {
          iconStyle.paddingLeft = 0
        }
        const title = this.props.L(value.LocaleKey || value.Name, value.Name)
        value.breadcrumbs = breadcrumbs.concat([_.pick(value, ['LocaleKey', 'Name'])])
        if (value.Children) {
          const sub = this.renderMenuChildren(value.Children, value.breadcrumbs)
          if (Array.isArray(sub) && sub.length > 0) {
            ret.push(
              <Menu.SubMenu
                key={value.ID}
                title={
                  <span className={styles.menuTitle}>
                    <Icon {...parseIcon(value.Icon)} style={iconStyle} />
                    <span>{title}</span>
                  </span>
                }
              >
                {sub}
              </Menu.SubMenu>
            )
          }
        } else {
          ret.push(
            <Menu.Item
              key={value.ID}
              onClick={() => this.handleMenuItemClick(value)}
              className={styles.menuTitle}
            >
              <Icon {...parseIcon(value.Icon)} style={iconStyle} />
              <span>{title}</span>
            </Menu.Item>
          )
        }
      }
      if (name) {
        ret = <Menu.ItemGroup title={this.props.L(name)} key={name}>{ret}</Menu.ItemGroup>
      }
      arr = arr.concat(ret)
    }
    return arr
  }

  handleMenuItemClick (value) {
    if (!value) {
      return
    }
    this.props.dispatch({ type: 'layout/addPane', payload: value })
  }

  cacheMenuPaneContent (activePane) {
    for (const pane of this.props.panes) {
      if (pane.ID === activePane.ID) {
        pane.Content = this.props.children
        this.panesContent[pane.key] = pane.Content
        break
      }
    }
  }

  handleTabsChange (targetKey) {
    const activePane = this.props.panes.find(p => `${p.ID}` === targetKey)
    this.handleMenuItemClick(activePane)
  }

  handleTabsRemove (targetKey, action) {
    if (action !== 'remove') {
      return
    }
    this.props.dispatch({ type: 'layout/delPane', payload: targetKey })
  }

  handleTabsContext (pane, index, action) {
    let newPanes
    switch (action) {
      case 'refresh':
        router.go(0)
        break
      case 'close-others':
        newPanes = this.props.panes.filter(item => item.ID === pane.ID || item.Closeable === false)
        break
      case 'close-left':
        newPanes = []
        for (let i = 0; i < this.props.panes.length; i++) {
          const item = this.props.panes[i]
          if (i >= index || item.Closeable === false) {
            newPanes.push(item)
          }
        }
        break
      case 'close-right':
        newPanes = []
        for (let i = 0; i < this.props.panes.length; i++) {
          const item = this.props.panes[i]
          if (i <= index || item.Closeable === false) {
            newPanes.push(item)
          }
        }
        break
    }
    if (Array.isArray(newPanes)) {
      this.props.dispatch({ type: 'layout/SET_PANES', payload: newPanes })
    }
    this.props.dispatch({ type: 'layout/addPane', payload: pane })
  }

  componentWillReceiveProps (nextProps) {
    // 处理直接输入地址进入页面的情况
    if (this.props.location.pathname !== nextProps.location.pathname || !this.props.activePane) {
      const nextActivePane = this.props.panes.find(p => {
        if (p.IsLink) {
          return p.ID === _.get(/^\/sys\/iframe\/(\w*).*$/i.exec(nextProps.location.pathname), '[1]')
        } else {
          return p.URI === nextProps.location.pathname
        }
      })
      if (nextActivePane && nextActivePane.URI) {
        if (_.get(this.props.activePane, 'URI') !== nextActivePane.URI) {
          this.props.dispatch({ type: 'layout/addPane', payload: nextActivePane })
        }
      }
    }
    if (this.props.menus === undefined && nextProps.menus !== undefined) {
      // 菜单初始化完成
      const menus = nextProps.menus
      if (_.isEmpty(menus)) {
        return
      }
      const needOpenMenus = menus.filter(item => !!item.IsDefaultOpen).map(item => _.cloneDeep(item))
      const firstPane = _.get(needOpenMenus, '[0]')
      if (firstPane && !this.props.hasCache) {
        this.props.dispatch({ type: 'layout/SET_PANES', payload: needOpenMenus })
        this.handleMenuItemClick(firstPane)
      }
    }
  }

  render () {
    const { menusTree = [], activeMenuIndex, activePane, openKeys = [], logged } = this.props
    if (activePane && activePane.ID && !this.panesContent[activePane.ID]) {
      this.cacheMenuPaneContent(activePane)
    }
    const currentTree = _.cloneDeep(menusTree)
    const menuChildren = this.renderMenuChildren(_.get(currentTree, `[${activeMenuIndex}].Children`, []))
    const selectedKeys = []
    if (_.get(activePane, 'ID')) {
      selectedKeys.push(`${_.get(activePane, 'ID')}`)
    }
    return (
      <Layout className={`${styles.layout}`}>
        <Skeleton
          active
          loading={logged !== 1}
          paragraph={{ rows: 10 }}
          className={styles.loadingMask}
        >
          <Icon
            className={'kuu-sider-trigger'}
            type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
            onClick={this.toggleSider}
          />
          <Sider
            collapsedWidth={0}
            trigger={null}
            collapsible
            collapsed={this.state.collapsed}
            width={config.siderWidth || 260}
            className={styles.sider}
          >
            <div className={`${styles.header}`}>
              <div className={`${styles.logo}`}>
                <div className={`${styles.appName}`}>{config.shortName}</div>
              </div>
            </div>
            <Menu
              className={`${styles.menu}`}
              mode='inline'
              selectedKeys={selectedKeys}
              inlineIndent={6}
              openKeys={openKeys}
              onOpenChange={openKeys => {
                this.props.dispatch({ type: 'layout/SET_OPEN_KEYS', payload: openKeys })
              }}
            >
              {menuChildren}
            </Menu>
          </Sider>
          <Layout>
            <LayoutTabs
              tabBarExtraContent={
                <Navbar />
              }
              activeKey={`${_.get(activePane, 'ID', '')}`}
              panes={this.props.panes || []}
              onChange={this.handleTabsChange}
              onContext={this.handleTabsContext}
              onEdit={this.handleTabsRemove}
              breadcrumbs={_.get(activePane, 'breadcrumbs')}
              siderCollapsed={this.state.collapsed}
            />
          </Layout>
        </Skeleton>
      </Layout>
    )
  }
}

function mapStateToProps (state) {
  return {
    ...state.layout,
    logged: (window.localStorage.getItem(config.storageTokenKey) || _.get(state, 'user.loginData')) ? 1 : 2
  }
}

export default withRouter(connect(mapStateToProps)(withLocale(BasicLayout)))
