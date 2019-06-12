import React from 'react'
import { Switch } from 'antd'
import Fano from 'fano-react'
import moment from 'moment'
import _ from 'lodash'
import styles from './index.less'

class Role extends React.Component {
  constructor (props) {
    super(props)

    this.TableComponent = Fano.fromJson({
      name: 'role_table',
      type: 'table',
      props: {
        urls: {
          list: '/api/role',
          remove: '/api/role'
        },
        columns: [
          {
            title: '角色名称',
            dataIndex: 'Name'
          },
          {
            title: '角色编码',
            dataIndex: 'Code'
          },
          {
            title: '更新时间',
            dataIndex: 'UpdatedAt',
            render: t => moment(t).fromNow()
          },
          {
            title: '是否内置',
            dataIndex: 'IsBuiltIn',
            render: t => <Switch checked={t === true} />
          }
        ],
        onAdd: e => {
          this.goDetail()
        },
        onEdit: r => {
          const item = _.clone(r)
          item.CreatedAt = moment(item.CreatedAt).fromNow()
          item.UpdatedAt = moment(item.UpdatedAt).fromNow()
          this.goDetail(item)
        }
      }
    }).render()

    this.state = {}
  }

  goDetail (record) {
    let value
    if (record) {
      value = {
        ID: `role-edit-${record.ID}`,
        Icon: 'team',
        Name: window.L('编辑角色', `编辑角色（${record.Name}）`),
        URI: `/sys/role/form/${record.ID}`,
        Record: record
      }
    } else {
      value = {
        ID: 'role-add',
        Icon: 'team',
        Name: window.L('新增角色'),
        URI: '/sys/role/form'
      }
    }
    window.g_app._store.dispatch({
      type: 'layout/addOrActivatePane',
      payload: value
    })
  }

  render () {
    const { TableComponent } = this
    return (
      <div className={styles.role}>
        <TableComponent />
      </div>
    )
  }
}

export default Role
