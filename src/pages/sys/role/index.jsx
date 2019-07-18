import React from 'react'
import { Icon } from 'antd'
import { FanoTable } from 'fano-antd'
import { parseIcon } from 'kuu-tools'
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
      ],
      form: [
        {
          name: 'Name',
          type: 'input',
          label: '角色名称'
        },
        {
          name: 'Code',
          type: 'input',
          label: '角色编码'
        },
        {
          name: 'OperationPrivileges2',
          type: 'treeselect',
          label: '操作权限',
          props: {
            url: '/api/menu?range=ALL&sort=Sort',
            titleKey: 'Name',
            valueKey: 'ID',
            arrayToTree: true,
            multiple: true,
            treeCheckable: true,
            titleRender: (title, item) => <span><Icon {...parseIcon(item.Icon)} /> {title}</span>
          }
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
    const { columns, form } = this.state
    return (
      <div className={styles.role}>
        <FanoTable
          columns={columns}
          form={form}
          url={'/api/role?preload=OperationPrivileges,DataPrivileges'}
          // fillTAP={{
          //   'add': {
          //     onClick: () => {
          //       this.handleDetail()
          //     }
          //   }
          // }}
          // fillRAP={{
          //   'edit': {
          //     show: true,
          //     onClick: record => {
          //       this.handleDetail(record)
          //     }
          //   }
          // }}
        />
      </div>
    )
  }
}

export default Role
