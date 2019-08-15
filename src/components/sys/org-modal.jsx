import React from 'react'
import _ from 'lodash'
import arrayToTree from 'array-to-tree'
import { Modal, Spin, TreeSelect, message } from 'antd'
import { update, get, withLocale } from 'kuu-tools'

class OrgModal extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false,
      confirmLoading: false
    }

    this.handleOk = this.handleOk.bind(this)
  }

  fetchOrgs () {
    this.setState({ loading: true, orgs: undefined, orgID: undefined }, async () => {
      let orgs = await get('/org/loginable')
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
      const defaultOrgID = _.get(this.props.loginData, 'ActOrgID', _.get(_.head(orgs), 'ID'))
      orgs = _.sortBy(orgs, 'Sort').map(item => ({ title: item.Name, pid: item.Pid, value: item.ID, key: item.ID }))
      orgs = arrayToTree(orgs, {
        customID: 'value',
        parentProperty: 'pid',
        childrenProperty: 'children'
      })
      this.setState({ loading: false, orgs, orgID: defaultOrgID }, () => {
        if (total <= 1 && this.props.source === 'login') {
          this.handleOk()
        }
      })
    })
  }

  componentDidUpdate (prevProps) {
    if (this.props.visible !== prevProps.visible && this.props.visible) {
      this.fetchOrgs()
    }
  }

  handleOk () {
    if (this.state.confirmLoading) {
      return
    }
    this.setState({ confirmLoading: true }, async () => {
      if (this.state.orgID) {
        const ret = await update('user', { ID: this.props.loginData.UID }, { ActOrgID: this.state.orgID })
        if (!ret) {
          return
        }
      }
      this.setState({ orgs: undefined, orgID: undefined, confirmLoading: false })
      if (_.isFunction(this.props.onOk)) {
        this.props.onOk()
      } else {
        console.warn('组织选择框未指定 onOk 回调')
      }
    })
  }

  render () {
    const { orgID, loading, confirmLoading } = this.state
    const orgs = this.state.orgs || []
    return (
      <Modal
        width={400}
        maskClosable={false}
        confirmLoading={confirmLoading}
        visible={this.props.visible}
        title={this.props.L('kuu_org_select_login', 'Please select a login organization')}
        onCancel={() => {
          this.setState({ orgs: undefined, orgID: undefined })
          if (_.isFunction(this.props.onCancel)) {
            this.props.onCancel()
          } else {
            console.warn('组织选择框未指定 onCancel 回调')
          }
        }}
        okText={this.props.L('kuu_org_btn_login', 'Login')}
        okButtonProps={{
          disabled: !orgID
        }}
        onOk={this.handleOk}
      >
        <Spin spinning={loading}>
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
        </Spin>
      </Modal>
    )
  }
}

export default withLocale(OrgModal)
