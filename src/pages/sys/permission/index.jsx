import React from 'react'
import { Icon } from 'antd'
import { FanoTable } from 'fano-antd'
import { parseIcon, withLocale } from 'kuu-tools'
import styles from './index.less'
import _ from 'lodash'

class Permission extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}

    this.handleAddSub = this.handleAddSub.bind(this)
  }

  handleAddSub (record) {
    this.table.handleAdd({ ParentCode: _.get(record, 'Code') })
  }

  // 处理菜单页直接跳转
  handleOpenPane (pane) {
    window.g_app._store.dispatch({
      type: 'layout/openPane',
      payload: {
        ...pane
      }
    })
  }

  render () {
    const columns = [
      {
        title: this.props.L('kuu_permission_name', 'Name'),
        dataIndex: 'Name',
        width: 300,
        render: (t, r) => {
          t = this.props.L(r.LocaleKey, t)

          let children
          if (r.IsLink) {
            if (r.URI) {
              if (r.Icon) {
                children = (
                  <span title={r.URI}>
                    <a onClick={() => this.handleOpenPane(r)}><Icon {...parseIcon(r.Icon)} /> {t}</a>
                  </span>
                )
              } else {
                children = (
                  <span title={r.URI}>
                    <a onClick={() => this.handleOpenPane(r)}>{t}</a>
                  </span>
                )
              }
            } else {
              children = r.Icon ? <span><Icon {...parseIcon(r.Icon)} />{t}</span> : t
            }
          } else {
            children = r.Icon ? <span><Icon {...parseIcon(r.Icon)} /> {t}</span> : t
          }

          return children
        }
      },
      {
        title: this.props.L('kuu_permission_code', 'Permission Code'),
        width: 200,
        dataIndex: 'Code'
      },
      {
        title: this.props.L('kuu_permission_disable', 'Disable'),
        dataIndex: 'Disable',
        width: 150,
        align: 'center',
        render: t => t ? <Icon type='eye-invisible' style={{ fontSize: 18 }} />
          : <Icon type='eye' style={{ color: '#52c41a', fontSize: 18 }} />
      }
    ]
    const form = [
      {
        name: 'ParentCode',
        type: 'treeselect',
        label: this.props.L('kuu_permission_parent', 'Parent'),
        props: {
          url: '/user/menus',
          titleKey: 'Name',
          valueKey: 'Code',
          titleRender: (title, item) => {
            title = this.props.L(item.LocaleKey, title)
            return item.Icon ? <span><Icon {...parseIcon(item.Icon)} /> {title}</span> : title
          },
          arrayToTree: {
            customID: 'Code',
            parentProperty: 'ParentCode',
            childrenProperty: 'children'
          }
        }
      },
      {
        name: 'Name',
        type: 'input',
        props: {
          fieldOptions: {
            rules: [
              {
                required: true,
                message: this.props.L('kuu_permission_name_required', 'Please enter a permission name')
              }
            ]
          }
        }
      },
      {
        name: 'Code',
        type: 'input',
        props: {
          fieldOptions: {
            rules: [
              {
                required: true
              }
            ]
          }
        }
      }
    ]

    const fillRAP = {
      edit: {
        show: (record) => record.IsVirtual
      },
      del: {
        show: (record) => record.IsVirtual
      }
    }
    const arrayToTree = {
      customID: 'Code',
      parentProperty: 'ParentCode',
      childrenProperty: 'children'
    }
    return (
      <div className={`kuu-container ${styles.menu}`}>
        <FanoTable
          columns={columns}
          form={form}
          url='/menu'
          listUrl='/user/menus?default=false'
          ref={instance => {
            this.table = instance
          }}
          beforeCreate={values => {
            values.IsVirtual = true
          }}
          fillTAP={{
            add: false,
            del: false,
            filter: false,
            sort: false
          }}
          fillRAP={fillRAP}
          rowActions={[
            {
              key: 'add_sub',
              icon: 'apartment',
              onClick: this.handleAddSub,
              text: this.props.L('kuu_permission_add_sub', 'Add Sub')
            }
          ]}
          pagination={false}
          expandAllRows
          arrayToTree={arrayToTree}
        />
      </div>
    )
  }
}

export default withLocale(Permission)
