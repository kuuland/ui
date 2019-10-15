import React from 'react'
import { Icon, Checkbox, Button } from 'antd'
import { FanoTable } from 'fano-antd'
import { parseIcon, withLocale } from 'kuu-tools'
import styles from './index.less'

class Menu extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}

    this.handleAddSubmenu = this.handleAddSubmenu.bind(this)
  }

  handleAddSubmenu (record) {
    this.table.handleAdd({ Pid: _.get(record, 'ID') })
  }

  render () {
    const columns = [
      {
        title: this.props.L('kuu_menu_name', 'Name'),
        dataIndex: 'Name',
        width: 300,
        render: (t, r) => {
          t = this.props.L(r.LocaleKey, t)
          return r.Icon ? <span><Icon {...parseIcon(r.Icon)} /> {t}</span> : t
        }
      },
      {
        title: this.props.L('kuu_menu_uri', 'URI'),
        dataIndex: 'URI',
        width: 300,
        render: t => <Button type={'link'} size={'small'}>{t}</Button>
      },
      {
        title: this.props.L('kuu_menu_sort', 'Sort'),
        dataIndex: 'Sort',
        show: false
      },
      {
        title: this.props.L('kuu_menu_disable', 'Disable'),
        dataIndex: 'Disable',
        width: 150,
        align: 'center',
        render: t => t ? <Icon type='eye-invisible' style={{ fontSize: 18 }} />
          : <Icon type='eye' style={{ color: '#52c41a', fontSize: 18 }} />
      },
      {
        title: this.props.L('kuu_menu_code', 'Permission Code'),
        width: 120,
        dataIndex: 'Code'
      }
    ]
    const form = [
      {
        name: 'Pid',
        type: 'treeselect',
        label: this.props.L('kuu_menu_parent', 'Parent Menu'),
        props: {
          url: '/user/menus',
          titleKey: 'Name',
          valueKey: 'ID',
          titleRender: (title, item) => {
            title = this.props.L(item.LocaleKey, title)
            return item.Icon ? <span><Icon {...parseIcon(item.Icon)} /> {title}</span> : title
          }
        }
      },
      {
        name: 'Name',
        type: 'input',
        label: this.props.L('kuu_menu_name', 'Name'),
        props: {
          fieldOptions: {
            rules: [
              {
                required: true,
                message: this.props.L('kuu_menu_name_required', 'Please enter a menu name')
              }
            ]
          }
        }
      },
      {
        name: 'URI',
        type: 'input',
        label: this.props.L('kuu_menu_uri', 'URI')
      },
      {
        name: 'LocaleKey',
        type: 'input',
        label: this.props.L('kuu_menu_localekey', 'Locale Key')
      },
      {
        name: 'IsLink',
        type: 'switch',
        label: this.props.L('kuu_menu_external', 'External link')
      },
      {
        name: 'Sort',
        type: 'number',
        label: this.props.L('kuu_menu_sort', 'Sort')
      },
      {
        name: 'Code',
        type: 'input',
        label: this.props.L('kuu_menu_code', 'Permission Code')
      },
      {
        name: 'Icon',
        type: 'icon',
        label: this.props.L('kuu_menu_icon', 'Icon')
      },
      {
        name: 'Disable',
        type: 'switch',
        label: this.props.L('kuu_menu_disable', 'Disable')
      },
      {
        name: 'IsDefaultOpen',
        type: 'switch',
        label: this.props.L('kuu_menu_defaultopen', 'Open by default')
      },
      {
        name: 'Closeable',
        type: 'switch',
        label: this.props.L('kuu_menu_closeable', 'Closeable')
      }
    ]
    return (
      <div className={styles.menu}>
        <FanoTable
          columns={columns}
          form={form}
          url={'/menu'}
          listUrl={'/user/menus?range=ALL'}
          ref={table => this.table = table}
          rowActions={[
            {
              key: 'add_submenu',
              icon: 'apartment',
              onClick: this.handleAddSubmenu,
              text: this.props.L('kuu_menu_add_submenu', 'Add Submenu')
            }
          ]}
          pagination={false}
          expandAllRows
          arrayToTree
        />
      </div>
    )
  }
}

export default withLocale(Menu)
