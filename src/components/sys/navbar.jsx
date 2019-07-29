import React from 'react'
import _ from 'lodash'
import { connect } from 'dva'
import withRouter from 'umi/withRouter'
import { Avatar, Menu, Dropdown, Icon, Divider, Modal, Radio, message } from 'antd'
import { get, update, withLocale } from 'kuu-tools'
import OrgModal from './org-modal'
import styles from './navbar.less'

class Navbar extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      menuKeyPrefix: 'menu-'
    }
    this.handleMenuClick = this.handleMenuClick.bind(this)
  }

  handleMenuClick (e) {
    const { menuKeyPrefix } = this.state
    const { loginData } = this.props
    if (e.key.startsWith(menuKeyPrefix)) {
      const activeMenuIndex = parseInt(e.key.substring(menuKeyPrefix.length))
      window.g_app._store.dispatch({
        type: 'layout/SET_ACTIVE_MENU_INDEX',
        payload: activeMenuIndex
      })
    } else {
      switch (e.key) {
        case 'profile':
          break
        case 'i18n':
          this.fetchLanguages(languages => {
            Modal.info({
              title: this.props.L('kuu_navbar_languages', 'Languages'),
              icon: 'global',
              maskClosable: true,
              width: 400,
              content: (
                <Radio.Group
                  onChange={e => {
                    this.setState({ selectLang: e.target.value })
                  }}
                  defaultValue={_.get(loginData, 'Lang')}
                >
                  {languages.map(item => (
                    <Radio
                      key={item.LangCode}
                      value={item.LangCode}
                    >
                      {item.LangName}
                    </Radio>)
                  )}
                </Radio.Group>
              ),
              onOk: async () => {
                if (!loginData.UID || !this.state.selectLang) {
                  return
                }
                const ret = await update('user', { ID: loginData.UID }, { Lang: this.state.selectLang })
                if (ret) {
                  window.g_app._store.dispatch({
                    type: 'user/valid'
                  })
                  this.setState({ selectLang: undefined })
                }
                // window.g_app._store.dispatch({ type: 'layout/SET_PANES', payload: [] })
              }
            })
          })
          break
        case 'logout':
          window.g_app._store.dispatch({
            type: 'user/logout'
          })
          break
        case 'apikey':
          window.g_app._store.dispatch({
            type: 'layout/addPane',
            payload: {
              ID: 'apikey',
              Icon: 'key',
              Name: this.props.L('APIKey', 'API & Keys'),
              URI: '/sys/apikey'
            }
          })
          break
      }
    }
  }

  async fetchLanguages (callback) {
    const json = await get('/language', { range: 'ALL' })
    const languages = _.get(json, 'list', [])
    callback(languages)
  }

  render () {
    const { menuKeyPrefix, orgModalVisible = false } = this.state
    const { menusTree, loginOrg, loginData } = this.props
    const activeMenuIndex = this.props.activeMenuIndex >= menusTree.length ? 0 : this.props.activeMenuIndex
    const avatarProps = {}
    if (_.get(loginData, 'Avatar')) {
      avatarProps.src = loginData.Avatar
    } else {
      avatarProps.icon = 'user'
    }
    const rawItems = []
    if (_.get(loginOrg, 'Name')) {
      rawItems.push(
        <div
          key={'org'}
          className={styles.item}
          onClick={() => this.setState({ orgModalVisible: true })}
        >
          <Icon type='home' style={{ fontSize: 17 }} /> {loginOrg.Name}
        </div>
      )
    }
    rawItems.push(
      <div className={styles.item} key={'username'}>
        <Dropdown
          overlay={
            <Menu onClick={this.handleMenuClick}>
              <Menu.Item key={'profile'}>
                <Icon type='user' />{this.props.L('kuu_navbar_profile', 'Profile')}
              </Menu.Item>
              <Menu.Item key={'i18n'}>
                <Icon type='global' />{this.props.L('kuu_navbar_languages', 'Languages')}
              </Menu.Item>
              <Menu.Item key={'apikey'}>
                <Icon type='key' />{this.props.L('kuu_navbar_apikeys', 'API & Keys')}
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item key={'logout'}>
                <Icon type='logout' />{this.props.L('kuu_navbar_logout', 'Logout')}
              </Menu.Item>
              {menusTree.length > 1 && <Menu.Divider />}
              {menusTree.length > 1 && menusTree.map((item, index) => {
                let theme = 'outlined'
                if (index === activeMenuIndex) {
                  theme = 'filled'
                }
                return (
                  <Menu.Item key={`${menuKeyPrefix}${index}`}>
                    <Icon type='check-circle' theme={theme} />{this.props.L(item.LocaleKey || item.Name, item.Name)}
                  </Menu.Item>
                )
              })}
            </Menu>
          }
          placement='bottomRight'
        >
          <div className={styles.userinfo}>
            <Avatar {...avatarProps} className={styles.avatar} />
            <span className={styles.username}>{loginData.Name} <Icon type='down' style={{ fontSize: 12 }} /></span>
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
          visible={orgModalVisible}
          loginData={loginData}
          loginOrg={loginOrg}
          onOk={loginOrg => {
            window.g_app._store.dispatch({
              type: 'user/LOGIN_ORG',
              payload: loginOrg
            })
            this.setState({ orgModalVisible: false })
          }}
          onCancel={() => this.setState({ orgModalVisible: false })}
          onError={() => {
            message.error(this.props.L('当前用户未分配有效组织'))
            this.handleLogout()
          }}
        />
        {items}
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    loginData: state.user.loginData || {},
    loginOrg: state.user.loginOrg || {},
    menusTree: state.layout.menusTree || [],
    activeMenuIndex: state.layout.activeMenuIndex
  }
}

export default withRouter(connect(mapStateToProps)(withLocale(Navbar)))
