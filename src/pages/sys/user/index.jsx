import React from 'react'
import _ from 'lodash'
import moment from 'moment'
import { Transfer, Modal, Icon, Tooltip, Spin } from 'antd'
import md5 from 'blueimp-md5'
import { get, list, update } from 'kuu-tools'
import { FanoTable } from 'fano-antd'
import styles from '@/pages/sys/user/index.less'

export default class User extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      columns: [
        {
          title: window.L('账号'),
          dataIndex: 'Username'
        },
        {
          title: window.L('姓名'),
          dataIndex: 'Name'
        },
        {
          title: window.L('是否禁用'),
          dataIndex: 'Disable',
          render: 'switch'
        },
        {
          title: window.L('是否内置'),
          dataIndex: 'IsBuiltIn',
          render: 'switch'
        },
        {
          title: window.L('创建时间'),
          dataIndex: 'CreatedAt',
          render: t => moment(t).fromNow()
        }
      ],
      form: [
        {
          name: 'Username',
          type: 'input',
          label: window.L('账号'),
          props: {
            disabled: `{{_.get(rootValue, 'IsBuiltIn') === true}}`
          }
        },
        {
          name: 'Name',
          type: 'input',
          label: window.L('姓名'),
          props: {
            disabled: `{{_.get(rootValue, 'IsBuiltIn') === true}}`
          }
        },
        {
          name: 'Password',
          type: 'input',
          label: window.L('密码'),
          props: {
            type: 'password'
          }
        },
        {
          name: 'Disable',
          type: 'switch',
          label: window.L('是否禁用')
        },
        {
          condition: `{{!_.isEmpty(_.get(rootValue, 'ID'))}}`,
          name: 'IsBuiltIn',
          type: 'switch',
          label: window.L('系统内置'),
          props: {
            disabled: true
          }
        }
      ],
      assignLoading: true
    }

    this.handleAssignOk = this.handleAssignOk.bind(this)
    this.handleAssignCancel = this.handleAssignCancel.bind(this)
  }

  componentDidMount () {
    this.fetchRoles()
  }

  async fetchRoles () {
    const data = await list('role', { range: 'ALL' })
    this.setState({ roles: _.get(data, 'list', []) })
  }

  fetchUserAssigns () {
    this.setState({ assignLoading: true }, async () => {
      const userAssigns = await get(`/api/user/role_assigns/${_.get(this.state.assignRecord, 'ID')}`)
      const userAssignsRolesKey = userAssigns.map(item => item.RoleID)
      this.setState({ userAssigns, userAssignsRolesKey, assignLoading: false })
    })
  }

  async handleAssignOk () {
    const { assignRecord, userAssignsRolesKey, userAssigns } = this.state
    // 统计历史
    const hisAssigns = _.chain(userAssigns)
      .groupBy('RoleID')
      .mapValues(values => _.head(values))
      .value()
    // 统计新的
    const newAssigns = userAssignsRolesKey.map(item => {
      const assign = { UserID: assignRecord.ID, RoleID: item }
      if (_.get(hisAssigns, 'ID')) {
        assign.ID = _.get(hisAssigns, 'ID')
      }
      return assign
    })
    // 执行修改
    const data = await update(
      'user',
      { ID: assignRecord.ID },
      { RoleAssigns: newAssigns }
    )
    if (!data) {
      return
    }
    // 关闭弹窗
    this.handleAssignCancel()
  }

  handleAssignCancel () {
    this.setState({
      assignRecord: undefined,
      userAssigns: undefined,
      userAssignsRolesKey: undefined
    })
  }

  render () {
    const {
      columns,
      form,
      roles = [],
      userAssignsRolesKey = [],
      assignRecord
    } = this.state
    return (
      <div className={styles.user}>
        <FanoTable
          columns={columns}
          form={form}
          url={'/api/user'}
          rowActions={[
            {
              icon: 'key',
              onClick: record => {
                this.setState({
                  assignRecord: record
                }, this.fetchUserAssigns)
              },
              wrapper: children => (
                <Tooltip title={window.L('角色分配')}>
                  {children}
                </Tooltip>
              )
            }
          ]}
          beforeSave={values => {
            if (values.Password) {
              values.Password = md5(values.Password)
            }
          }}
        />
        <Modal
          width={600}
          maskClosable={false}
          title={window.L('角色分配')}
          visible={!!assignRecord}
          onOk={this.handleAssignOk}
          onCancel={this.handleAssignCancel}
          className={styles.assignModal}
        >
          <Spin
            indicator={<Icon type='loading' style={{ fontSize: 24 }} spin />}
            spinning={this.state.assignLoading}
          >
            <Transfer
              rowKey={record => record.ID}
              dataSource={roles}
              titles={[window.L('系统角色'), window.L('已分配角色')]}
              showSearch
              filterOption={(inputValue, option) => option.Name.includes(inputValue)}
              targetKeys={userAssignsRolesKey}
              onChange={(nextTargetKeys) => {
                this.setState({ userAssignsRolesKey: nextTargetKeys })
              }}
              render={item => item.Name}
            />
          </Spin>
        </Modal>
      </div>
    )
  }
}
