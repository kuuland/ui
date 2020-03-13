import React from 'react'
import { connect } from 'dva'
import md5 from 'blueimp-md5'
import router from 'umi/router'
import _ from 'lodash'
import { Form, Icon, Input, Button, Checkbox } from 'antd'
import styles from './login.less'
import { get, post, withLocale } from 'kuu-tools'
import config from '@/config'

class Login extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loginLoading: false
    }

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleCaptcha = this.handleCaptcha.bind(this)
    this.handleUsernameBlur = this.handleUsernameBlur.bind(this)
  }

  componentDidMount () {
    this.ensureLogout()
  }

  ensureLogout () {
    if (this.props.loginData.Token) {
      window.g_app._store.dispatch({
        type: 'user/logout'
      })
    }
  }

  async fetchCaptcha (username) {
    if (!username) {
      username = _.get(this.props.form.getFieldsValue(['username']), 'username')
    }
    if (!username) {
      return
    }
    const data = await get(`/captcha?user=${username}`)
    this.setState({ captcha: data })
  }

  handleCaptcha () {
    this.fetchCaptcha()
  }

  handleUsernameBlur (e) {
    const value = e.target.value
    this.fetchCaptcha(value)
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
        const data = await post('/login', values)
        if (!_.get(data, 'Token')) {
          this.setState({ loginLoading: false })
          this.fetchCaptcha(values.username)
          return
        }
        this.handleRedirect()
      })
    })
  }

  handleRedirect () {
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

  render () {
    const { captcha } = this.state
    const { getFieldDecorator } = this.props.form
    const style = {}
    if (config.loginBg) {
      style.backgroundImage = `url(${config.loginBg})`
    }
    return (
      <div className={styles.login} style={style}>
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
                  onBlur={this.handleUsernameBlur}
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
                <Input.Password
                  prefix={<Icon type='lock' style={{ color: 'rgba(0,0,0,.25)' }} />}
                  placeholder={this.props.L('kuu_login_password_placeholder', 'Password')}
                />
              )}
            </Form.Item>
            {captcha && (
              <Form.Item>
                {getFieldDecorator('captcha_val', {
                  rules: [{
                    required: true,
                    message: this.props.L('kuu_login_captcha_required', 'Please enter the captcha')
                  }]
                })(
                  <Input
                    prefix={<Icon type='robot' style={{ color: 'rgba(0,0,0,.25)' }} />}
                    addonAfter={
                      <img
                        className={styles.captcha}
                        src={_.get(captcha, 'base64Str')}
                        onClick={this.handleCaptcha}
                      />
                    }
                    placeholder={this.props.L('kuu_login_captcha_placeholder', 'Captcha')}
                  />
                )}
              </Form.Item>
            )}
            <Form.Item>
              {getFieldDecorator('remember', {
                valuePropName: 'checked',
                initialValue: true
              })(
                <Checkbox>{this.props.L('kuu_login_remember', 'Remember')}</Checkbox>
              )}
              <a
                className={styles.forgot} href=''
              >{this.props.L('kuu_login_password_forgot', 'Forgot your password?')}
              </a>
              <Button
                type='primary' htmlType='submit' loading={this.state.loginLoading}
                className={styles.submit}
              >{this.props.L('kuu_login_btn_submit', 'Login')}
              </Button>
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

function mapStateToProps (state) {
  return {
    loginData: state.user.loginData || {}
  }
}

export default withLocale(connect(mapStateToProps)(Form.create({ name: 'login' })(Login)))
