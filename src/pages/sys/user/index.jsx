import React from 'react'
import { Switch, Transfer, Modal, Icon, Tooltip, Spin } from 'antd'
import Fano from 'fano-react'
import moment from 'moment'
import md5 from 'blueimp-md5'
import _ from 'lodash'
import styles from './index.less'
import { list, create, update } from '@/sdk/model'
import { get } from '@/utils/request'

class User extends React.Component {
  constructor (props) {
    super(props)
    this.init()

    this.state = {
      modalVisible: false,
      roleAssignVisible: false,
      roleAssignLoading: false
    }
    this.handleModalOk = this.handleModalOk.bind(this)
    this.handleModalCancel = this.handleModalCancel.bind(this)
    this.handleRoleAssignOk = this.handleRoleAssignOk.bind(this)
    this.handleRoleAssignCancel = this.handleRoleAssignCancel.bind(this)
  }
  init () {
    this.initTable()
    this.initModal()
  }

  initTable () {
    this.TableInst = Fano.fromJson({
      name: 'user_table',
      type: 'table',
      props: {
        urls: {
          list: '/api/user',
          remove: '/api/user'
        },
        columns: [
          {
            title: '账号',
            dataIndex: 'Username',
            render: t => {
              return (
                <div
                  title={t}
                  style={{
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {t}
                </div>
              )
            }
          },
          {
            title: '姓名',
            dataIndex: 'Name'
          },
          {
            title: '是否禁用',
            dataIndex: 'Disable'
          },
          {
            title: '是否内置',
            dataIndex: 'IsBuiltIn',
            render: t => <Switch checked={t === true} />
          },
          {
            dataIndex: 'actions',
            width: 100
          }
        ],
        onAdd: e => {
          this.ModalInst.value = {}
          this.setState({ modalVisible: true })
        },
        onEdit: r => {
          const item = _.clone(r)
          item.CreatedAt = moment(r.CreatedAt).fromNow()
          item.UpdatedAt = moment(r.UpdatedAt).fromNow()
          this.ModalInst.value = item
          this.setState({ modalVisible: true })
        },
        customRowActions: [
          (record, index) => (
            <Tooltip title={window.L('角色分配')}>
              <Icon type='key' className={styles.rolesAssign} onClick={e => {
                e.stopPropagation()
                this.setState({ roleAssignLoading: true }, async () => {
                  this.setState({ roleAssignVisible: true, roleAssignUser: record })
                  // 查询角色列表
                  const roles = (await list('role', { range: 'ALL' })).list
                  // 查询已有角色列表
                  const roleAssigns = await get(`/api/user/role_assigns/${record.ID}`)
                  const targetRolesKey = roleAssigns.map(item => item.RoleID)
                  this.setState({ roles, roleAssigns, targetRolesKey, roleAssignLoading: false })
                })
              }} />
            </Tooltip>
          )
        ]
      }
    })
    this.TableComponent = this.TableInst.render()
  }

  initModal () {
    this.ModalInst = Fano.fromJson({
      name: 'user_modal',
      type: 'form',
      container: [
        {
          name: 'ID',
          type: 'hidden'
        },
        {
          name: 'Username',
          type: 'input',
          label: '账号',
          props: {
            span: 12,
            disabled: `{{_.get(rootValue, 'IsBuiltIn') === true}}`
          }
        },
        {
          name: 'Password',
          type: 'password',
          label: '密码',
          props: {
            span: 12
          }
        },
        {
          name: 'Name',
          type: 'input',
          label: '姓名',
          props: {
            span: 12,
            disabled: `{{_.get(rootValue, 'IsBuiltIn') === true}}`
          }
        },
        {
          name: 'Disable',
          type: 'switch',
          label: '是否禁用',
          props: {
            span: 12
          }
        },
        {
          condition: `{{!_.isEmpty(_.get(rootValue, 'ID'))}}`,
          name: 'IsBuiltIn',
          type: 'switch',
          label: '系统内置',
          props: {
            span: 24,
            disabled: true
          }
        },
        {
          condition: `{{!_.isEmpty(_.get(rootValue, 'ID'))}}`,
          name: 'CreatedAt',
          type: 'text',
          label: '创建时间',
          props: {
            span: 12
          }
        },
        {
          condition: `{{!_.isEmpty(_.get(rootValue, 'ID'))}}`,
          name: 'UpdatedAt',
          type: 'text',
          label: '修改时间',
          props: {
            span: 12
          }
        }
      ]
    })
    this.ModalComponent = this.ModalInst.render()
  }

  async handleModalOk () {
    const { value, dirtyValue } = this.ModalInst
    if (_.get(value, 'ID')) {
      if (!_.isEmpty(dirtyValue)) {
        if (dirtyValue.Password) {
          dirtyValue.Password = md5(dirtyValue.Password)
        }
        await update('user', { ID: _.get(value, 'ID') }, dirtyValue)
      }
    } else if (!_.isEmpty(value)) {
      value.Password = md5(value.Password)
      await create('user', value)
    }

    this.TableInst.emit('user_table:refresh')
    this.handleModalCancel()
  }

  handleModalCancel () {
    this.setState({ modalVisible: false }, () => {
      this.ModalInst.clear()
    })
  }

  async handleRoleAssignOk () {
    const { roleAssignUser, targetRolesKey, roleAssigns: historyRoleAssigns } = this.state
    if (!_.get(roleAssignUser, 'ID') || !targetRolesKey) {
      return
    }
    const hisAssigns = _.chain(historyRoleAssigns).groupBy('RoleID').mapValues(values => _.head(values)).value()
    const assigns = targetRolesKey.map(item => {
      const assign = { UserID: roleAssignUser.ID, RoleID: item }
      if (_.get(hisAssigns, 'ID')) {
        assign.ID = _.get(hisAssigns, 'ID')
      }
      return assign
    })
    const data = await update('user', { ID: roleAssignUser.ID }, { RoleAssigns: assigns })
    if (!data) {
      return
    }
    this.handleRoleAssignCancel()
  }
  handleRoleAssignCancel () {
    this.setState({ roleAssignVisible: false, roleAssignUser: undefined, targetRolesKey: [], roles: [], roleAssigns: [] })
  }

  render () {
    const { TableComponent, ModalComponent } = this
    const { modalVisible, roleAssignVisible, roles = [], targetRolesKey = [] } = this.state
    return (
      <div className={styles.user}>
        <TableComponent />
        <Modal
          width={600}
          title={window.L('表单详情')}
          cancelText={window.L('取消')}
          okText={window.L('保存')}
          visible={modalVisible}
          onOk={this.handleModalOk}
          onCancel={this.handleModalCancel}>
          <ModalComponent />
        </Modal>
        <Modal
          width={600}
          maskClosable={false}
          title={window.L('角色分配')}
          cancelText={window.L('取消')}
          okText={window.L('保存')}
          visible={roleAssignVisible}
          onOk={this.handleRoleAssignOk}
          onCancel={this.handleRoleAssignCancel}
          className={styles.roleAssignModal}
        >
          <Spin
            indicator={<Icon type='loading' style={{ fontSize: 24 }} spin />}
            spinning={this.state.roleAssignLoading}
          >
            <Transfer
              rowKey={record => record.ID}
              dataSource={roles}
              titles={[window.L('系统角色'), window.L('已分配角色')]}
              showSearch
              filterOption={(inputValue, option) => option.Name.includes(inputValue)}
              targetKeys={targetRolesKey}
              onChange={(nextTargetKeys, direction, moveKeys) => {
                this.setState({ targetRolesKey: nextTargetKeys })
              }}
              render={item => item.Name}
            />
          </Spin>
        </Modal>
      </div>
    )
  }
}

export default User
