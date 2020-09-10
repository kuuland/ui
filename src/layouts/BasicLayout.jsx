import React, { useEffect, useState } from 'react'
import _ from 'lodash'
import router from 'umi/router'
import { connect } from 'dva'
import withRouter from 'umi/withRouter'
import { Layout, Menu, Icon, Badge } from 'antd'
import { parseIcon, withLocale } from 'kuu-tools'
import styles from './index.less'
import LayoutTabs from '@/components/sys/layout-tabs'
import Navbar from '@/components/sys/navbar'
import config from '@/config'

const { Sider } = Layout

const loginAs = window.sessionStorage.getItem('login_as')

let latestMessageInterval
const clearLatestMessageInterval = () => {
  // @ts-ignore
  if (latestMessageInterval) {
    // @ts-ignore
    clearInterval(latestMessageInterval)
  }
}

function BasicLayout (props) {
  const [collapsed, setCollapsed] = useState(false)
  const toggleSider = () => {
    setCollapsed(!collapsed)
  }
  useEffect(() => {
    const isDebug = _.get(process, 'env.NODE_ENV', _.get(window, 'process.env.NODE_ENV', 'development')) === 'development'
    if (_.get(props, 'location.pathname') !== _.get(props, 'activePane.URI') && !isDebug) {
      console.warn('权限拦截：请新增菜单并分配权限，通过点击菜单跳转至页面')
      router.replace(_.get(props, 'activePane.URI'))
    }
  }, [])

  useEffect(() => {
    if (props.loginData.UID > 0) {
      clearLatestMessageInterval()
      latestMessageInterval = setInterval(() => {
        props.dispatch({ type: 'message/getLatestMessages' })
      }, 10 * 1000)
    }
    return () => {
      clearLatestMessageInterval()
    }
  }, [props.loginData])

  const renderMenuChildren = (values, breadcrumbs = []) => {
    const groups = _.groupBy(values, 'Group')
    let arr = []
    let hasCount = false
    for (const key in groups) {
      const data = _.sortBy(groups[key], 'Sort')
      const name = ['undefined', 'null', ''].includes(key) ? null : key
      let ret = []
      for (const value of data) {
        const iconStyle = {}
        if (collapsed) {
          iconStyle.paddingLeft = 0
        }
        let title = props.L(value.LocaleKey || value.Name, value.Name)
        const badgeCount = props.menuBadgeCount[`${value.Code || value.ID}`]
        value.breadcrumbs = breadcrumbs.concat([_.pick(value, ['LocaleKey', 'Name'])])
        if (value.Children) {
          const [sub, hasSubCount] = renderMenuChildren(value.Children, value.breadcrumbs)
          hasCount = hasCount || hasSubCount
          if (hasSubCount) {
            title = <Badge dot offset={[2, 0]}>{title}</Badge>
          }
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
          if (_.isNumber(badgeCount) && _.isFinite(badgeCount) && badgeCount > 0) {
            title = <Badge count={badgeCount} offset={[9, 0]}>{title}</Badge>
            hasCount = true
          }
          ret.push(
            <Menu.Item
              key={value.ID}
              onClick={() => handleMenuItemClick(value)}
              className={styles.menuTitle}
            >
              <Icon {...parseIcon(value.Icon)} style={iconStyle} />
              <span>{title}</span>
            </Menu.Item>
          )
        }
      }
      if (name) {
        ret = <Menu.ItemGroup title={props.L(name)} key={name}>{ret}</Menu.ItemGroup>
      }
      arr = arr.concat(ret)
    }
    return [arr, hasCount]
  }

  const handleMenuItemClick = (value) => {
    if (!value) {
      return
    }
    props.dispatch({ type: 'layout/openPane', payload: value })
  }

  const handleTabsChange = (targetKey) => {
    const activePane = props.panes.find(p => `${p.ID}` === targetKey)
    handleMenuItemClick(activePane)
  }

  const handleTabsRemove = (targetKey, action) => {
    if (action !== 'remove') {
      return
    }
    props.dispatch({ type: 'layout/delPane', payload: targetKey })
  }

  const handleTabsContext = (pane, index, action) => {
    let newPanes
    switch (action) {
      case 'refresh':
        router.go(0)
        break
      case 'close-others':
        newPanes = props.panes.filter(item => item.Closeable !== true || item.ID === pane.ID)
        break
      case 'close-left':
        newPanes = props.panes.filter((item, i) => item.Closeable !== true || i >= index)
        break
      case 'close-right':
        newPanes = props.panes.filter((item, i) => item.Closeable !== true || i <= index)
        break
    }
    if (Array.isArray(newPanes)) {
      props.dispatch({ type: 'layout/SET_PANES', payload: newPanes })
    }
    props.dispatch({ type: 'layout/openPane', payload: pane })
  }
  const { menusTree = [], activeMenuIndex, activePane, openKeys = [] } = props
  const currentTree = _.cloneDeep(menusTree)
  const [menuChildren] = renderMenuChildren(_.get(currentTree, `[${activeMenuIndex}].Children`, []))
  const selectedKeys = []
  if (_.get(activePane, 'ID')) {
    selectedKeys.push(`${_.get(activePane, 'ID')}`)
  }
  const headerStyle = {
    opacity: collapsed ? 0 : 1,
    backgroundColor: _.get(props.theme, 'topBarBgColor')
  }
  return (
    <>
      {loginAs && <div className={`${styles.loginAs}`} />}
      <Layout className={`${styles.layout}`}>
        <Icon
          className='kuu-sider-trigger'
          type={collapsed ? 'menu-unfold' : 'menu-fold'}
          onClick={() => toggleSider()}
        />
        <Sider
          collapsedWidth={0}
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={config.siderWidth || 260}
          className={styles.sider}
        >
          <div className={`${styles.header}`} style={headerStyle}>
            <div className={`${styles.appName}`}>{config.shortName}</div>
          </div>
          <Menu
            className={`${styles.menu}`}
            mode='inline'
            inlineIndent={6}
            selectedKeys={selectedKeys}
            openKeys={openKeys}
            onOpenChange={openKeys => {
              props.dispatch({ type: 'layout/SET_OPEN_KEYS', payload: openKeys })
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
            topBarBgColor={_.get(props.theme, 'topBarBgColor')}
            activeKey={`${_.get(activePane, 'ID', '')}`}
            panes={props.panes || []}
            onChange={handleTabsChange}
            onContext={handleTabsContext}
            onEdit={handleTabsRemove}
            breadcrumbs={_.get(activePane, 'breadcrumbs')}
            siderCollapsed={collapsed}
          >
            {props.children}
          </LayoutTabs>
        </Layout>
      </Layout>
    </>
  )
}

function mapStateToProps (state) {
  return {
    ...state.layout,
    ...state.badge,
    theme: state.theme,
    loginData: state.user.loginData || {}
  }
}

export default withLocale(connect(mapStateToProps)(withRouter(BasicLayout)))
