import React from 'react'
import { Switch } from 'antd'
import Fano from 'fano-react'
import moment from 'moment'
import _ from 'lodash'
import TableConfig from './table.json'
import styles from './index.less'

class Role extends React.Component {
  constructor (props) {
    super(props)
    this.init()

    this.state = {}
  }
  init () {
    this.initTable()
  }

  formatUnix (t, defaultValue = '-') {
    if (!t) {
      return t
    }
    const u = moment.unix(t)
    return u && u.isValid() ? u.format('YYYY-MM-DD HH:mm:ss') : defaultValue
  }

  goDetail (record) {
    let value
    if (record) {
      value = {
        _id: `role-edit-${record._id}`,
        Icon: 'team',
        Name: window.L('编辑角色', `编辑角色（${record.Name}）`),
        URI: `/sys/role/edit/${record._id}`,
        Record: record
      }
    } else {
      value = {
        _id: 'role-add',
        Icon: 'team',
        Name: window.L('新增角色'),
        URI: '/sys/role/add'
      }
    }
    window.g_app._store.dispatch({
      type: 'layout/addPane',
      payload: value
    })
  }

  initTable () {
    this.TableInst = Fano.fromJson(TableConfig).enhance({
      role_table: {
        onColumnsRender: {
          UpdatedAt: t => this.formatUnix(t),
          IsBuiltIn: t => <Switch checked={t === true} />
        },
        onAdd: e => {
          this.goDetail()
        },
        onEdit: r => {
          const item = _.clone(r)
          item.CreatedAt = this.formatUnix(r.CreatedAt)
          item.UpdatedAt = this.formatUnix(r.UpdatedAt)
          this.goDetail(item)
        }
      }
    })
    this.TableComponent = this.TableInst.render()
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
