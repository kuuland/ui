import React from 'react'
import _ from 'lodash'
import { connect } from 'dva'
import withRouter from 'umi/withRouter'
import { Avatar, Menu, Dropdown, Icon, Divider, message } from 'antd'
import OrgModal from './org-modal'
import styles from './navbar.less'

class Navbar extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      orgModalVisible: false,
      menuKeyPrefix: 'menu-'
    }
    this.handleClick = this.handleClick.bind(this)
  }
  handleClick (e) {
    const { menuKeyPrefix } = this.state
    if (e.key.startsWith(menuKeyPrefix)) {
      const activeMenuIndex = parseInt(e.key.substring(menuKeyPrefix.length))
      window.g_app._store.dispatch({
        type: 'layout/SET_ACTIVE_MENU_INDEX',
        payload: activeMenuIndex
      })
    } else {
      switch (e.key) {
        case 'userinfo':
          break
        case 'password':
          break
        case 'logout':
          this.handleLogout()
          break
        case 'apikey':
          window.g_app._store.dispatch({
            type: 'layout/addOrActivatePane',
            payload: {
              ID: 'apikey',
              Icon: 'key',
              Name: window.L('APIKey', 'API & Keys'),
              URI: '/sys/apikey'
            }
          })
          break
      }
    }
  }
  handleLogout () {
    window.g_app._store.dispatch({
      type: 'user/logout'
    })
  }
  render () {
    const { menuKeyPrefix } = this.state
    const { menusTree, loginOrg, loginData } = this.props
    const activeMenuIndex = this.props.activeMenuIndex >= menusTree.length ? 0 : this.props.activeMenuIndex
    const avatarProps = {}
    if (_.get(loginData, 'Avatar')) {
      avatarProps.src = loginData.Avatar
    } else {
      avatarProps.icon = 'user'
    }
    const rawItems = []
    if (_.get(loginOrg.Name)) {
      rawItems.push(
        <div
          key={'org'}
          className={styles.item}
          onClick={e => this.setState({ orgModalVisible: true })}
        >
          <Icon type='home' style={{ fontSize: 17 }} /> {loginOrg.Name}
        </div>
      )
    }
    rawItems.push(
      <div className={styles.item} key={'username'}>
        <Dropdown
          overlay={
            <Menu onClick={this.handleClick}>
              <Menu.Item key={'userinfo'}>
                <Icon type='user' />{window.L('个人中心')}
              </Menu.Item>
              <Menu.Item key={'password'}>
                <Icon type='lock' />{window.L('修改密码')}
              </Menu.Item>
              <Menu.Item key={'apikey'}>
                <Icon type='key' />{window.L('APIKey', 'API & Keys')}
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item key={'logout'}>
                <Icon type='logout' />{window.L('退出登录')}
              </Menu.Item>
              {menusTree.length > 1 && <Menu.Divider />}
              {menusTree.length > 1 && menusTree.map((item, index) => {
                let theme = 'outlined'
                if (index === activeMenuIndex) {
                  theme = 'filled'
                }
                return (
                  <Menu.Item key={`${menuKeyPrefix}${index}`}>
                    <Icon type='check-circle' theme={theme} />{window.L(item.Name)}
                  </Menu.Item>
                )
              })}
            </Menu>
          }
          placement='bottomRight'
        >
          <div className={styles.userinfo}>
            <Avatar {...avatarProps} className={styles.avatar} />
            <span className={styles.username}>{loginData.Name}</span>
          </div>
        </Dropdown>
      </div>
    )
    const items = []
    for (let i = 0; i < rawItems.length; i++) {
      items.push(rawItems[i])
      if (i !== rawItems.length - 1) {
        items.push(<Divider key={i} type='vertical' />)
      }
    }
    return (
      <div className={styles.navbar}>
        <OrgModal
          visible={this.state.orgModalVisible}
          loginData={loginData}
          onOk={loginOrg => {
            window.g_app._store.dispatch({
              type: 'user/LOGIN_ORG',
              payload: loginOrg
            })
            this.setState({ orgModalVisible: false })
          }}
          onCancel={() => this.setState({ orgModalVisible: false })}
          onError={() => {
            message.error(window.L('当前用户未分配有效组织'))
            this.handleLogout()
          }}
        />
        {items}
      </div>
    )
  }
}

export default withRouter(connect(state => ({
  loginData: state.user.loginData || {},
  loginOrg: state.user.loginOrg || {},
  menusTree: state.layout.menusTree || [],
  activeMenuIndex: state.layout.activeMenuIndex
}))(Navbar))
