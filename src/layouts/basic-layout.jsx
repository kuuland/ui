import React from 'react'
import _ from 'lodash'
import router from 'umi/router'
import { connect } from 'dva'
import withRouter from 'umi/withRouter'
import { Layout, Menu, Icon } from 'antd'
import styles from './index.less'
import LayoutTabs from '@/components/layout-tabs'
import Navbar from '@/components/navbar'
import config from '@/config'
const { Header, Sider, Content } = Layout

class BasicLayout extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      collapsed: false
    }
    this.panesContent = {}
    this.toggle = this.toggle.bind(this)
    this.handleTabsChange = this.handleTabsChange.bind(this)
    this.handleTabsRemove = this.handleTabsRemove.bind(this)
    this.handleTabsContext = this.handleTabsContext.bind(this)
  }

  toggle () {
    this.setState({
      collapsed: !this.state.collapsed
    })
  }

  renderMenuChildren (values) {
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
        if (value.Children) {
          const sub = this.renderMenuChildren(value.Children)
          if (Array.isArray(sub) && sub.length > 0) {
            ret.push(
              <Menu.SubMenu
                key={value._id}
                title={
                  <span className={styles.menuTitle}>
                    <Icon type={value.Icon} style={iconStyle} />
                    <span>{window.L(value.Name)}</span>
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
              key={value._id}
              onClick={() => this.handleMenuItemClick(value)}
              className={styles.menuTitle}
            >
              <Icon type={value.Icon} style={iconStyle} />
              <span>{window.L(value.Name)}</span>
            </Menu.Item>
          )
        }
      }
      if (name) {
        ret = <Menu.ItemGroup title={window.L(name)} key={name}>{ret}</Menu.ItemGroup>
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
      if (pane._id === activePane._id) {
        pane.Content = this.props.children
        this.panesContent[pane.key] = pane.Content
        break
      }
    }
  }

  handleTabsChange (targetKey) {
    const activePane = this.props.panes.find(p => p._id === targetKey)
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
        newPanes = this.props.panes.filter(item => item._id === pane._id || item.Closeable === false)
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
          return p._id === _.get(/^\/sys\/iframe\/(\w*).*$/i.exec(nextProps.location.pathname), '[1]')
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
    const { menusTree = [], activeMenuIndex, activePane, openKeys = [] } = this.props
    if (activePane && activePane._id && !this.panesContent[activePane._id]) {
      this.cacheMenuPaneContent(activePane)
    }
    const currentTree = _.cloneDeep(menusTree)
    const menuChildren = this.renderMenuChildren(_.get(currentTree, `[${activeMenuIndex}].Children`, []))
    const theme = 'light' // light、dark
    return (
      <Layout className={`${styles.layout} theme-${theme}`}>
        <Header className={`${styles.header} theme-header`}>
          <div className={`${styles.logo} theme-logo`}>
            <div>
              <span className={`${styles.appName}`}>{config.appName}</span>
              <Icon
                className={`${styles.trigger} theme-trigger`}
                type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                onClick={this.toggle}
              />
            </div>
          </div>
          <Navbar />
        </Header>
        <Layout>
          <Sider
            theme={theme}
            collapsedWidth={0}
            trigger={null}
            collapsible
            collapsed={this.state.collapsed}
            className={styles.sider}
          >
            <Menu
              className={`${styles.menu}`}
              theme={theme}
              mode='inline'
              selectedKeys={[_.get(activePane, '_id')]}
              inlineIndent={6}
              inlineCollapsed={this.state.collapsed}
              openKeys={openKeys}
              onOpenChange={openKeys => {
                this.props.dispatch({ type: 'layout/SET_OPEN_KEYS', payload: openKeys })
              }}
            >
              {menuChildren}
            </Menu>
          </Sider>
          <Layout>
            <Content className={styles.content}>
              <LayoutTabs
                activeKey={_.get(activePane, '_id')}
                panes={this.props.panes || []}
                onChange={this.handleTabsChange}
                onContext={this.handleTabsContext}
                onEdit={this.handleTabsRemove}
              />
            </Content>
          </Layout>
        </Layout>
      </Layout>
    )
  }
}

export default withRouter(connect(state => state.layout || {})(BasicLayout))
