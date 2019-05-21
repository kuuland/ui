import React from 'react'
import qs from 'qs'
import { Switch, Transfer, Modal, Icon, Tooltip, Spin } from 'antd'
import Fano from 'fano-react'
import moment from 'moment'
import md5 from 'blueimp-md5'
import _ from 'lodash'
import ModalConfig from './modal.json'
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
            dataIndex: 'Username'
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
            <Tooltip title={window.L('角色分配')} key={record.ID + index}>
              <Icon type='key' className={styles.rolesAssign} onClick={e => {
                e.stopPropagation()
                this.setState({ roleAssignLoading: true }, async () => {
                  this.setState({ roleAssignVisible: true, roleAssignUser: record })
                  // 查询角色列表
                  const roles = (await list('role', { range: 'ALL' })).list
                  // 查询已有角色列表
                  const userRoles = await get(`/api/user/roles?${qs.stringify({ uid: record.ID })}`)
                  const targetRolesKey = userRoles.map(item => item.ID)
                  this.setState({ roles, targetRolesKey, roleAssignLoading: false })
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
    this.ModalInst = Fano.fromJson(ModalConfig)
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
    const { roleAssignUser, targetRolesKey } = this.state
    if (!_.get(roleAssignUser, 'ID') || !targetRolesKey) {
      return
    }
    const hisAssigns = _.groupBy(roleAssignUser.RoleAssigns, 'RoleID')
    const assigns = targetRolesKey.map(item => {
      const assign = { UserID: roleAssignUser.ID, RoleID: item }
      if (_.size(hisAssigns[item]) > 0 && hisAssigns[item][0].ID) {
        assign.ID = hisAssigns[item][0].ID
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
    this.setState({ roleAssignVisible: false, roleAssignUser: undefined, targetRolesKey: [], roles: [] })
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
