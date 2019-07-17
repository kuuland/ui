import React from 'react'
import { Menu, Dropdown, Tabs, Icon, Breadcrumb } from 'antd'
import styles from './layout-tabs.less'

export default props => {
  return (
    <div className={styles.layoutTabs}>
      {props.siderCollapsed && (
        <Icon
          className={`kuu-sider-trigger`}
          type={'menu-unfold'}
          onClick={props.toggleSider}
        />
      )}
      <Tabs
        size='default'
        activeKey={props.activeKey}
        onChange={props.onChange}
        onEdit={props.onEdit}
        type='editable-card'
        hideAdd
        tabBarGutter={0}
        tabBarExtraContent={props.tabBarExtraContent}
        tabBarStyle={{ paddingLeft: props.siderCollapsed ? 60 : 0 }}
      >
        {props.panes.map((pane, index) => (
          <Tabs.TabPane
            tab={
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item key='refresh' onClick={() => props.onContext(pane, index, 'refresh')}><Icon
                      type='reload'
                    />{window.L('刷新')}</Menu.Item>
                    <Menu.Item key='close-others' onClick={() => props.onContext(pane, index, 'close-others')}><Icon
                      type='close-circle'
                    />{window.L('关闭其他')}</Menu.Item>
                    <Menu.Item key='close-left' onClick={() => props.onContext(pane, index, 'close-left')}><Icon
                      type='left-circle'
                    />{window.L('关闭左侧')}</Menu.Item>
                    <Menu.Item key='close-right' onClick={() => props.onContext(pane, index, 'close-right')}><Icon
                      type='right-circle'
                    />{window.L('关闭右侧')}</Menu.Item>
                  </Menu>
                }
                trigger={['contextMenu']}
              >
                <span className={styles.title}>
                  <Icon type={pane.Icon} />{pane.Name}
                </span>
              </Dropdown>
            }
            key={pane.ID}
            closable={pane.Closeable !== false}
          >
            <Breadcrumb className={styles.breadcrumbs}>
              {(props.breadcrumbs || []).map(item => <Breadcrumb.Item key={item}>{item}</Breadcrumb.Item>)}
            </Breadcrumb>
            <div className={styles.content}>
              {pane.Content}
            </div>
          </Tabs.TabPane>
        ))}
      </Tabs>
    </div>
  )
}
