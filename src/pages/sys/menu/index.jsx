import React from 'react'
import { Icon, Checkbox, Button } from 'antd'
import { FanoTable } from 'fano-antd'
import { parseIcon, withLocale } from 'kuu-tools'
import styles from './index.less'

class Menu extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      columns: [
        {
          title: this.props.L('kuu_menu_name', 'Name'),
          dataIndex: 'Name',
          width: 280,
          render: (t, r) => r.Icon ? <span><Icon {...parseIcon(r.Icon)} /> {t}</span> : t
        },
        {
          title: this.props.L('kuu_menu_uri', 'URI'),
          dataIndex: 'URI',
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
          width: 60,
          align: 'center',
          render: t => t ? <Icon type='eye-invisible' style={{ fontSize: 18 }} />
            : <Icon type='eye' style={{ color: '#52c41a', fontSize: 18 }} />
        },
        {
          title: this.props.L('kuu_menu_detail', 'Detail'),
          dataIndex: 'Detail',
          width: 300,
          align: 'center',
          render: (t, r) => {
            return (
              <div>
                <Checkbox checked={!!r.IsLink}>{this.props.L('kuu_menu_external', 'External link')}</Checkbox>
                <Checkbox
                  checked={!!r.IsDefaultOpen}
                >{this.props.L('kuu_menu_defaultopen', 'Open by default')}</Checkbox>
                <Checkbox
                  checked={r.Closeable === undefined || !!r.Closeable}
                >{this.props.L('kuu_menu_closeable', 'Closeable')}</Checkbox>
              </div>
            )
          }
        },
        {
          title: this.props.L('kuu_menu_code', 'Permission Code'),
          dataIndex: 'Code'
        }
      ],
      form: [
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
    }
  }

  render () {
    const { columns, form } = this.state
    return (
      <div className={styles.menu}>
        <FanoTable
          columns={columns}
          form={form}
          url={'/menu?range=ALL&sort=Sort'}
          pagination={false}
          expandAllRows
          arrayToTree
        />
      </div>
    )
  }
}

export default withLocale(Menu)
