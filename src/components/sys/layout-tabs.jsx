import React, { useEffect, useState } from 'react'
import { withRouter } from 'umi'
import _ from 'lodash'
import { Menu, Dropdown, Tabs, Icon, Breadcrumb, Empty } from 'antd'
import { parseIcon, withLocale } from 'kuu-tools'
import './layout-tabs.less'
import config from '@/config'

function LayoutTabs (props) {
  const [childrenCache, setChildrenCache] = useState({})
  const pathname = _.get(props, 'location.pathname')
  const noBreadcrumbRoute = _.includes(config.noBreadcrumbsRoutes, pathname)
  const tabBarStyle = {
    paddingLeft: props.siderCollapsed ? 50 : 0,
    backgroundColor: props.topBarBgColor
  }

  useEffect(() => {
    if (!childrenCache[props.location.pathname]) {
      childrenCache[props.location.pathname] = props.children
    }
    setChildrenCache(childrenCache)
  }, [props.activeKey])

  const renderPanes = (panes) => {
    if (_.isEmpty(panes)) {
      panes = [{
        ID: 'empty',
        Closeable: false,
        Content: (
          <div style={{ padding: 30 }}>
            <Empty description={null} />
          </div>
        )
      }]
    }
    return panes.map((pane, index) => (
      <Tabs.TabPane
        tab={
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item
                  key='refresh'
                  onClick={() => props.onContext(pane, index, 'refresh')}
                >
                  <Icon type='reload' />{props.L('kuu_layout_tabs_refresh', 'Refresh')}
                </Menu.Item>
                <Menu.Item
                  key='close-others'
                  onClick={() => props.onContext(pane, index, 'close-others')}
                >
                  <Icon type='close-circle' />{props.L('kuu_layout_tabs_close_others', 'Close Others')}
                </Menu.Item>
                <Menu.Item
                  key='close-left'
                  onClick={() => props.onContext(pane, index, 'close-left')}
                >
                  <Icon type='left-circle' />{props.L('kuu_layout_tabs_close_left', 'Close All to the Left')}
                </Menu.Item>
                <Menu.Item
                  key='close-right'
                  onClick={() => props.onContext(pane, index, 'close-right')}
                >
                  <Icon type='right-circle' />{props.L('kuu_layout_tabs_close_right', 'Close All to the Right')}
                </Menu.Item>
              </Menu>
            }
            trigger={['contextMenu']}
          >
            <span className='kuu-layout-tabs-title'>
              <Icon {...parseIcon(pane.Icon)} />{props.L(pane.LocaleKey || pane.Name, pane.Name)}
            </span>
          </Dropdown>
        }
        key={pane.ID}
        closable={pane.Closeable}
      >
        {_.size(props.breadcrumbs) > 1 && !noBreadcrumbRoute && (
          <Breadcrumb className='kuu-layout-tabs-breadcrumbs'>
            {props.breadcrumbs.map(item => (
              <Breadcrumb.Item
                key={item.LocaleKey || item.Name}
              >
                {props.L(item.LocaleKey || item.Name, item.Name)}
              </Breadcrumb.Item>
            ))}
          </Breadcrumb>
        )}
        {childrenCache[pane.URI] || props.children}
      </Tabs.TabPane>
    ))
  }
  return (
    <div className={`kuu-layout-tabs ${_.isEmpty(props.panes) ? 'kuu-layout-tabs-empty' : ''}`}>
      <Tabs
        size='default'
        activeKey={_.isEmpty(props.panes) ? 'empty' : props.activeKey}
        onChange={props.onChange}
        onEdit={props.onEdit}
        type='editable-card'
        hideAdd
        tabBarGutter={0}
        tabBarExtraContent={props.tabBarExtraContent}
        tabBarStyle={tabBarStyle}
      >
        {renderPanes(props.panes)}
      </Tabs>
    </div>
  )
}

export default withLocale(withRouter(LayoutTabs))
