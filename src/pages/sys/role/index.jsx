import React from 'react'
import { FanoTable } from 'fano-antd'
import moment from 'moment'
import styles from './index.less'

class Role extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
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
          title: '是否内置',
          dataIndex: 'IsBuiltIn',
          render: 'switch'
        },
        {
          title: '创建时间',
          dataIndex: 'CreatedAt',
          render: t => moment(t).fromNow()
        }
      ]
    }
  }

  handleDetail (record) {
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
    const { columns } = this.state
    return (
      <div className={styles.role}>
        <FanoTable
          columns={columns}
          url={'/api/role'}
          fillTAP={{
            'add': {
              onClick: () => {
                this.handleDetail()
              }
            }
          }}
          fillRAP={{
            'edit': {
              show: true,
              onClick: record => {
                this.handleDetail(record)
              }
            }
          }}
        />
      </div>
    )
  }
}

export default Role
