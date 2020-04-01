import React from 'react'
import _ from 'lodash'
import { connect } from 'dva'
import withRouter from 'umi/withRouter'
import router from 'umi/router'
import { Avatar, Menu, Dropdown, Icon, Divider, Modal, Radio, Input, Select } from 'antd'
import { get, post, del, withLocale, config } from 'kuu-tools'
import OrgModal from './org-modal'
import styles from './navbar.less'
import moment from 'moment'

class Navbar extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      menuKeyPrefix: 'menu-'
    }
    this.handleMenuClick = this.handleMenuClick.bind(this)
    this.handleLogout = this.handleLogout.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.onKeyUp = this.onKeyUp.bind(this)
  }

  onKeyDown (e) {
    this.setState({ showEndpoint: e.altKey })
  }

  onKeyUp (e) {
    this.setState({ showEndpoint: e.altKey })
  }

  componentDidMount () {
    document.addEventListener('keydown', this.onKeyDown)
    document.addEventListener('keyup', this.onKeyUp)
  }

  componentWillUnmount () {
    document.removeEventListener('keydown', this.onKeyDown)
    document.removeEventListener('keyup', this.onKeyUp)
  }

  handleMenuClick (e) {
    const { menuKeyPrefix } = this.state
    const { loginData } = this.props
    if (e.key.startsWith(menuKeyPrefix)) {
      const activeMenuIndex = parseInt(e.key.substring(menuKeyPrefix.length))
      this.props.dispatch({
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
                const ret = await post('/lang/switch', { Lang: this.state.selectLang })
                if (ret) {
                  this.props.dispatch({
                    type: 'user/valid'
                  })
                  this.setState({ selectLang: undefined })
                }
              }
            })
          })
          break
        case 'logout':
          this.handleLogout()
          break
        case 'apikeys':
          this.props.dispatch({
            type: 'layout/openPane',
            payload: {
              ID: 'apikeys',
              Icon: 'key',
              Name: this.props.L('kuu_navbar_apikeys', 'API & Keys'),
              URI: '/sys/apikeys'
            }
          })
          break
        case 'apiendpoint':
          Modal.info({
            title: this.props.L('kuu_navbar_apiendpoint', 'API Endpoint'),
            icon: 'api',
            maskClosable: true,
            width: 460,
            content: (
              <Input
                defaultValue={_.get(config(), 'prefix')}
                onChange={e => {
                  this.setState({ apiPrefix: e.target.value })
                }}
                placeholder={this.props.L('kuu_navbar_apiendpoint_placeholder', 'Optional: e.g. https://kuu.example.com/api')}
              />
            ),
            onOk: async () => {
              config({ prefix: this.state.apiPrefix })
              this.setState({ apiPrefix: undefined })
            }
          })
          break
        case 'login_as':
          this.fetchUsers(users => {
            const style = { width: '100%' }
            Modal.info({
              title: this.props.L('kuu_navbar_loginas', 'Login As'),
              icon: 'thunderbolt',
              maskClosable: true,
              width: 400,
              content: (
                <Select
                  style={style}
                  allowClear
                  showSearch
                  placeholder={this.props.L('kuu_navbar_loginas_placeholder', 'Select a user')}
                  filterOption={(inputValue, option) => {
                    return option.props.children.includes(inputValue)
                  }}
                  onChange={v => this.setState({ loginAsUID: v })}
                >
                  {users.map(item => {
                    const content = (
                      <div>
                        <span>{item.Username + `${item.Name ? `(${item.Name})` : ''}`}</span>
                        <span style={{ color: 'rgba(34,34,34,0.3)', marginLeft: 10, fontSize: 12 }}>{moment.unix(item.Exp).fromNow()}</span>
                      </div>
                    )
                    return (
                      <Select.Option key={item.ID} title={content} value={item.ID}>{content}</Select.Option>
                    )
                  })}
                </Select>
              ),
              onOk: async () => {
                if (!this.state.loginAsUID) {
                  return
                }
                const ret = await post('/login_as', { UID: this.state.loginAsUID })
                if (ret) {
                  window.sessionStorage.setItem('login_as', '1')
                  router.go(0)
                }
              }
            })
          })
          break
      }
    }
  }

  async fetchLanguages (callback) {
    const json = await get('/language', { range: 'ALL' })
    const data = _.get(json, 'list', [])
    callback(data)
  }

  async fetchUsers (callback) {
    const data = await get('/login_as/users')
    callback(data)
  }

  handleLogout () {
    const loginAs = window.sessionStorage.getItem('login_as')
    if (loginAs) {
      del('/login_as').then(data => {
        if (data) {
          window.sessionStorage.removeItem('login_as')
          router.go(0)
        }
      })
    } else {
      this.props.dispatch({
        type: 'user/logout'
      })
    }
  }

  render () {
    const { menuKeyPrefix, orgModalVisible = false, showEndpoint } = this.state
    const { loginData } = this.props
    const menusTree = this.props.menusTree.filter(item => _.isEmpty(item.Pid))
    const activeMenuIndex = this.props.activeMenuIndex >= menusTree.length ? 0 : this.props.activeMenuIndex
    const avatarProps = {}
    if (_.get(loginData, 'Avatar')) {
      avatarProps.src = loginData.Avatar
    } else {
      avatarProps.icon = 'user'
    }
    const rawItems = []
    if (_.get(loginData, 'ActOrgName')) {
      rawItems.push(
        <div
          key='org'
          className={styles.item}
          onClick={() => this.setState({ orgModalVisible: true })}
        >
          <div className={styles.org}>
            <Icon type='apartment' />
            <span>{loginData.ActOrgName}</span>
            <Icon type='caret-down' />
          </div>
        </div>
      )
    }
    rawItems.push(
      <div className={styles.item} key='username'>
        <Dropdown
          overlay={
            <Menu onClick={this.handleMenuClick}>
              <Menu.Item key='profile'>
                <Icon type='user' />{this.props.L('kuu_navbar_profile', 'Profile')}
              </Menu.Item>
              <Menu.Item key='i18n'>
                <Icon type='global' />{this.props.L('kuu_navbar_languages', 'Languages')}
              </Menu.Item>
              <Menu.Item key='apikeys'>
                <Icon type='key' />{this.props.L('kuu_navbar_apikeys', 'API & Keys')}
              </Menu.Item>
              {showEndpoint && (
                <Menu.Item key='apiendpoint'>
                  <Icon type='api' />{this.props.L('kuu_navbar_apiendpoint', 'API Endpoint')}
                </Menu.Item>
              )}
              {this.props.isRoot && (
                <Menu.Item key='login_as' style={{ color: '#2190ff' }}>
                  <Icon type='thunderbolt' />{this.props.L('kuu_navbar_loginas', 'Login As')}
                </Menu.Item>
              )}
              <Menu.Divider />
              <Menu.Item key='logout'>
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
            <span className={styles.username}>
              {_.get(loginData, 'Name') || loginData.Username} <Icon type='caret-down' />
            </span>
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
      <div
        className={styles.navbar}
      >
        <OrgModal
          visible={orgModalVisible}
          loginData={loginData}
          onOk={() => {
            router.go(0)
          }}
          onCancel={() => this.setState({ orgModalVisible: false })}
          onError={this.handleLogout}
        />
        {items}
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    loginData: state.user.loginData || {},
    isRoot: _.get(state, 'user.loginData.Username') === 'root',
    menusTree: state.layout.menusTree || [],
    activeMenuIndex: state.layout.activeMenuIndex
  }
}

export default withLocale(connect(mapStateToProps)(withRouter(Navbar)))
