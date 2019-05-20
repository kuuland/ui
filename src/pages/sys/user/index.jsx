import React from 'react'
import qs from 'qs'
import { Switch, Transfer, Modal, Icon, Tooltip, Spin } from 'antd'
import Fano from 'fano-react'
import moment from 'moment'
import md5 from 'blueimp-md5'
import _ from 'lodash'
import TableConfig from './table.json'
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

  formatUnix (t, defaultValue = '-') {
    if (!t) {
      return t
    }
    const u = moment.unix(t)
    return u && u.isValid() ? u.format('YYYY-MM-DD HH:mm:ss') : defaultValue
  }

  initTable () {
    this.TableInst = Fano.fromJson(TableConfig).enhance({
      user_table: {
        onColumnsRender: {
          IsBuiltIn: t => <Switch checked={t === true} />
        },
        onAdd: e => {
          this.ModalInst.value = {}
          this.setState({ modalVisible: true })
        },
        onEdit: r => {
          const item = _.clone(r)
          item.CreatedAt = this.formatUnix(r.CreatedAt)
          item.UpdatedAt = this.formatUnix(r.UpdatedAt)
          this.ModalInst.value = item
          this.setState({ modalVisible: true })
        },
        customRowActions: [
          (record, index) => (
            <Tooltip title={window.L('角色分配')} key={record.ID + index}>
              <Icon type='key' className={styles.rolesAssign} onClick={e => {
                e.stopPropagation()
                this.setState({ roleAssignLoading: true }, async () => {
                  this.setState({ roleAssignVisible: true, roleAssignUID: record.ID })
                  // 查询角色列表
                  const data = await list('role')
                  const roles = data.list || []
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
    const { roleAssignUID, targetRolesKey } = this.state
    if (!roleAssignUID || !targetRolesKey) {
      return
    }
    const assigns = targetRolesKey.map(item => ({ RoleID: item }))
    const data = await update('user', { ID: roleAssignUID }, { RoleAssigns: assigns })
    if (!data) {
      return
    }
    this.handleRoleAssignCancel()
  }
  handleRoleAssignCancel () {
    this.setState({ roleAssignVisible: false, roleAssignUID: undefined, targetRolesKey: [], roles: [] })
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
