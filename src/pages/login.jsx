import React from 'react'
import md5 from 'blueimp-md5'
import router from 'umi/router'
import _ from 'lodash'
import { Form, Icon, Input, Button, Checkbox } from 'antd'
import styles from './login.less'
import { get, post, withLocale } from 'kuu-tools'
import OrgModal from '@/components/sys/org-modal'
import config from '@/config'

class Login extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loginLoading: false,
      orgModalVisible: false,
      orgLoginLoading: false
    }

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.handleOk = this.handleOk.bind(this)
    this.ensureLogout()
  }

  ensureLogout () {
    if (window.localStorage.getItem(config.storageTokenKey)) {
      window.g_app._store.dispatch({
        type: 'user/logout'
      })
    }
  }

  handleSubmit (e) {
    e.preventDefault()
    if (this.state.loginLoading) {
      return
    }
    this.props.form.validateFields((err, values) => {
      if (err) {
        return
      }
      this.setState({ loginLoading: true }, async () => {
        values.password = md5(values.password)
        const data = await post('/api/login', values)
        if (!_.get(data, 'Token')) {
          this.setState({ loginLoading: false })
          return
        }
        // 配合后端组织自动登录
        const loginOrg = await this.checkAutoOrgLogin()
        if (loginOrg && loginOrg.ID) {
          this.handleOk(loginOrg, data)
          return
        }
        this.setState({ loginData: data, orgModalVisible: true })
      })
    })
  }

  async checkAutoOrgLogin () {
    const data = await get('/api/org/current')
    return data
  }

  handleLoginRedirect () {
    const redirectUri = _.get(this.props, 'location.query.redirect_uri')
    if (!redirectUri) {
      router.push('/')
    } else if (redirectUri.startsWith('http')) {
      window.location.href = window.decodeURIComponent(redirectUri)
    } else if (redirectUri.startsWith('/')) {
      router.push(redirectUri)
    } else {
      console.warn(`wrong 'redirect_uri' parameter: ${redirectUri}`)
      router.push('/')
    }
  }

  async handleCancel () {
    await post('/api/logout')
    this.setState({
      orgModalVisible: false,
      loginLoading: false,
      loginData: undefined
    })
  }

  handleOk (loginOrg, loginData) {
    this.handleLoginRedirect()
  }

  render () {
    const { getFieldDecorator } = this.props.form
    const style = {}
    if (config.loginBg) {
      style.backgroundImage = `url(${config.loginBg})`
    }
    return (
      <div className={styles.login} style={style}>
        <OrgModal
          source='login'
          visible={this.state.orgModalVisible}
          loginData={this.state.loginData}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          onError={this.handleCancel}
        />
        <div className={styles.content}>
          <div className={styles.title}>{config.fullName}</div>
          <p className={styles.welcome} style={{ display: styles.welcome ? 'block' : 'none' }}>{config.welcome}</p>
          <Form onSubmit={this.handleSubmit} className={styles.loginForm}>
            <Form.Item>
              {getFieldDecorator('username', {
                rules: [{
                  required: true,
                  message: this.props.L('kuu_login_username_required', 'Please enter your username')
                }]
              })(
                <Input
                  prefix={<Icon type='user' style={{ color: 'rgba(0,0,0,.25)' }} />}
                  placeholder={this.props.L('kuu_login_username_placeholder', 'Username')}
                />
              )}
            </Form.Item>
            <Form.Item>
              {getFieldDecorator('password', {
                rules: [{
                  required: true,
                  message: this.props.L('kuu_login_password_required', 'Please enter your password')
                }]
              })(
                <Input
                  prefix={<Icon type='lock' style={{ color: 'rgba(0,0,0,.25)' }} />}
                  type='password' placeholder={this.props.L('kuu_login_password_placeholder', 'Password')}
                />
              )}
            </Form.Item>
            <Form.Item>
              {getFieldDecorator('remember', {
                valuePropName: 'checked',
                initialValue: true
              })(
                <Checkbox>{this.props.L('kuu_login_remember', 'Remember')}</Checkbox>
              )}
              <a
                className={styles.forgot} href=''
              >{this.props.L('kuu_login_password_forgot', 'Forgot your password?')}</a>
              <Button
                type='primary' htmlType='submit' loading={this.state.loginLoading}
                className={styles.submit}
              >{this.props.L('kuu_login_btn_submit', 'Login')}</Button>
            </Form.Item>
          </Form>
        </div>
        <div className={styles.footer}>
          {config.copyright}
        </div>
      </div>
    )
  }
}

export default Form.create({ name: 'login' })(withLocale(Login))
