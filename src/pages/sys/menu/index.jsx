import React from 'react'
import { Icon, Checkbox } from 'antd'
import { FanoTable } from 'fano-antd'
import { parseIcon } from 'kuu-tools'
import styles from './index.less'

class Menu extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      columns: [
        {
          title: '菜单名称',
          dataIndex: 'Name',
          width: 280,
          render: (t, r) => r.Icon ? <span><Icon {...parseIcon(r.Icon)} /> {t}</span> : t
        },
        {
          title: '菜单地址',
          dataIndex: 'URI'
        },
        {
          title: '排序',
          dataIndex: 'Sort',
          show: false
        },
        {
          title: '可见',
          dataIndex: 'Disable',
          width: 60,
          align: 'center',
          render: t => t ? <Icon type='eye-invisible' style={{ fontSize: 18 }} />
            : <Icon type='eye' style={{ color: '#52c41a', fontSize: 18 }} />
        },
        {
          title: '菜单详情',
          dataIndex: 'Detail',
          width: 300,
          align: 'center',
          render: (t, r) => {
            return (
              <div>
                <Checkbox checked={!!r.IsLink}>{window.L('是否外链')}</Checkbox>
                <Checkbox checked={!!r.IsDefaultOpen}>{window.L('默认打开')}</Checkbox>
                <Checkbox checked={r.Closeable === undefined || !!r.Closeable}>{window.L('可关闭')}</Checkbox>
              </div>
            )
          }
        },
        {
          title: '权限标识',
          dataIndex: 'Code'
        }
      ],
      form: [
        {
          name: 'Pid',
          type: 'treeselect',
          label: '上级菜单',
          props: {
            url: '/api/user/menus',
            titleKey: 'Name',
            valueKey: 'ID',
            titleRender: (title, item) => item.Icon ? <span><Icon {...parseIcon(item.Icon)} /> {title}</span> : title
          }
        },
        {
          name: 'Name',
          type: 'input',
          label: '菜单名称'
        },
        {
          name: 'URI',
          type: 'input',
          label: '菜单链接'
        },
        {
          name: 'IsLink',
          type: 'switch',
          label: '是否外链'
        },
        {
          name: 'Sort',
          type: 'number',
          label: '排序'
        },
        {
          name: 'Code',
          type: 'input',
          label: '权限标识'
        },
        {
          name: 'Icon',
          type: 'icon',
          label: '菜单图标'
        },
        {
          name: 'Disable',
          type: 'switch',
          label: '禁用'
        },
        {
          name: 'IsDefaultOpen',
          type: 'switch',
          label: '默认打开'
        },
        {
          name: 'Closeable',
          type: 'switch',
          label: '可关闭'
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
          url={'/api/menu?range=ALL&sort=Sort'}
          pagination={false}
          expandAllRows
          arrayToTree
        />
      </div>
    )
  }
}

export default Menu
