import React from 'react'
import md5 from 'blueimp-md5'
import router from 'umi/router'
import _ from 'lodash'
import { Form, Icon, Input, Button, Checkbox, message } from 'antd'
import styles from './login.less'
import { get, post } from 'kuu-tools'
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
    // window.g_app._store.dispatch({
    //   type: 'user/LOGIN',
    //   payload: { loginData: loginData || this.state.loginData, loginOrg }
    // })
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
          onError={() => {
            message.error(window.L('当前用户未分配有效组织'))
            this.handleCancel()
          }}
        />
        <div className={styles.content}>
          <div className={styles.title}>{config.fullName}</div>
          <p className={styles.welcome} style={{ display: styles.welcome ? 'block' : 'none' }}>{config.welcome}</p>
          <Form onSubmit={this.handleSubmit} className={styles.loginForm}>
            <Form.Item>
              {getFieldDecorator('username', {
                rules: [{ required: true, message: window.L('请输入你的登录账号') }]
              })(
                <Input
                  prefix={<Icon type='user' style={{ color: 'rgba(0,0,0,.25)' }} />}
                  placeholder={window.L('账号')}
                />
              )}
            </Form.Item>
            <Form.Item>
              {getFieldDecorator('password', {
                rules: [{ required: true, message: window.L('请输入你的登录密码') }]
              })(
                <Input
                  prefix={<Icon type='lock' style={{ color: 'rgba(0,0,0,.25)' }} />}
                  type='password' placeholder={window.L('密码')}
                />
              )}
            </Form.Item>
            <Form.Item>
              {getFieldDecorator('remember', {
                valuePropName: 'checked',
                initialValue: true
              })(
                <Checkbox>{window.L('记住我')}</Checkbox>
              )}
              <a className={styles.forgot} href=''>{window.L('忘记密码')}</a>
              <Button
                type='primary' htmlType='submit' loading={this.state.loginLoading}
                className={styles.submit}
              >{window.L('登录')}</Button>
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

export default Form.create({ name: 'login' })(Login)
