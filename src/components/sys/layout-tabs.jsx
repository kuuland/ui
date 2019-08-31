import React from 'react'
import _ from 'lodash'
import { Menu, Dropdown, Tabs, Icon, Breadcrumb, Empty } from 'antd'
import { parseIcon, withLocale } from 'kuu-tools'
import styles from './layout-tabs.less'

class LayoutTabs extends React.PureComponent {
  render () {
    const { props } = this
    let { panes, activeKey, empty = false } = props
    if (_.isEmpty(panes)) {
      empty = true
      panes = [{
        ID: 'empty',
        Closeable: false,
        Content: <Empty description={null} />
      }]
      activeKey = panes[0].ID
    }
    return (
      <div className={`${styles.layoutTabs} ${empty ? 'kuu-layout-tabs-empty' : ''}`}>
        <Tabs
          size='default'
          activeKey={activeKey}
          onChange={props.onChange}
          onEdit={props.onEdit}
          type='editable-card'
          hideAdd
          tabBarGutter={0}
          tabBarExtraContent={props.tabBarExtraContent}
          tabBarStyle={{ paddingLeft: props.siderCollapsed ? 50 : 0 }}
        >
          {panes.map((pane, index) => (
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
                <span className={styles.title}>
                  <Icon {...parseIcon(pane.Icon)} />{props.L(pane.LocaleKey || pane.Name, pane.Name)}
                </span>
                </Dropdown>
              }
              key={pane.ID}
              closable={pane.Closeable}
            >
              {_.size(props.breadcrumbs) > 1 && (
                <Breadcrumb className={styles.breadcrumbs}>
                  {props.breadcrumbs.map(item => <Breadcrumb.Item
                    key={item.LocaleKey || item.Name}
                  >{props.L(item.LocaleKey || item.Name, item.Name)}</Breadcrumb.Item>)}
                </Breadcrumb>
              )}
              <div className={styles.container}>
                <div className={styles.content}>
                  {pane.Content}
                </div>
              </div>
            </Tabs.TabPane>
          ))}
        </Tabs>
      </div>
    )
  }
}

export default withLocale(LayoutTabs)
