import React from 'react'
import _ from 'lodash'
import arrayToTree from 'array-to-tree'
import { Modal, Button, TreeSelect, message } from 'antd'
import { get, post, withLocale } from 'kuu-tools'

class OrgModal extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false,
      visible: false
    }

    this.handleOk = this.handleOk.bind(this)
  }

  fetchOrgs () {
    this.setState({ orgs: undefined, orgID: undefined }, async () => {
      let orgs = await get('/api/org/list')
      const total = _.size(orgs)
      if (_.isEmpty(orgs) && !_.get(this.props.loginData, 'IsBuiltIn', false)) {
        if (_.isFunction(this.props.onError)) {
          message.error(this.props.L('kuu_org_unorganized', 'You have not assigned any organization'))
          this.props.onError()
        } else {
          console.warn('组织选择框未指定 onError 回调')
        }
        return
      }
      const defaultOrgID = _.get(this.props.loginOrg, 'ID', _.get(_.head(orgs), 'ID'))
      let visible = _.size(orgs) > 1
      if (this.props.source !== 'login') {
        visible = true
      }
      orgs = _.sortBy(orgs, 'Sort').map(item => ({ title: item.Name, pid: item.Pid, value: item.ID, key: item.ID }))
      orgs = arrayToTree(orgs, {
        customID: 'value',
        parentProperty: 'pid',
        childrenProperty: 'children'
      })
      this.setState({ orgs, orgID: defaultOrgID, visible: visible }, () => {
        if (total <= 1 && this.props.source === 'login') {
          this.handleOk()
        }
      })
    })
  }

  componentDidUpdate (prevProps) {
    if (this.props.visible && this.props.visible !== prevProps.visible) {
      this.fetchOrgs()
    }
  }

  handleOk () {
    if (this.state.loading) {
      return
    }
    this.setState({ loading: true }, async () => {
      let loginOrg = {}
      if (this.state.orgID) {
        loginOrg = await post('/api/org/login', { org_id: this.state.orgID })
        if (!loginOrg) {
          return
        }
      }
      this.setState({ orgs: undefined, orgID: undefined, loading: false, visible: false })
      if (_.isFunction(this.props.onOk)) {
        this.props.onOk(loginOrg)
      } else {
        console.warn('组织选择框未指定 onOk 回调')
      }
    })
  }

  render () {
    const { orgID, loading, visible } = this.state
    const orgs = this.state.orgs || []
    return (
      <Modal
        width={400}
        maskClosable={false}
        visible={visible}
        title={this.props.L('kuu_org_select_login', 'Please select a login organization')}
        onCancel={() => {
          this.setState({ orgs: undefined, orgID: undefined, visible: false })
          if (_.isFunction(this.props.onCancel)) {
            this.props.onCancel()
          } else {
            console.warn('组织选择框未指定 onCancel 回调')
          }
        }}
        footer={[
          <Button
            key='submit'
            type='primary'
            disabled={!orgID}
            loading={loading}
            onClick={this.handleOk}
          >
            {this.props.L('kuu_org_btn_login', 'Login')}
          </Button>
        ]}
      >
        <TreeSelect
          value={orgID}
          style={{ width: '100%' }}
          onChange={orgID => this.setState({ orgID })}
          placeholder={this.props.L('kuu_org_select_login', 'Please select a login organization')}
          treeDefaultExpandAll
          showSearch
          treeNodeFilterProp={'title'}
          treeData={orgs}
        />
      </Modal>
    )
  }
}

export default withLocale(OrgModal)
