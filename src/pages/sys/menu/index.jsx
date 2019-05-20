import React from 'react'
import { Icon, Checkbox, Modal, Popover } from 'antd'
import iconManifest from '@ant-design/icons/lib/manifest'
import Fano from 'fano-react'
import moment from 'moment'
import _ from 'lodash'
import TableConfig from './table.json'
import ModalConfig from './modal.json'
import arrayToTree from 'array-to-tree'
import styles from './index.less'
import { create, update } from '@/sdk/model'
import { getDict } from '@/sdk/dict'

class Menu extends React.Component {
  constructor (props) {
    super(props)
    this.init()

    this.state = {
      modalVisible: false,
      preEditRecord: undefined,
      iconList: this.getIconList()
    }
    this.handleModalOk = this.handleModalOk.bind(this)
    this.handleModalCancel = this.handleModalCancel.bind(this)
  }
  init () {
    this.initTable()
    this.initModal()
  }

  getIconList () {
    const arr = []
    for (const key in iconManifest) {
      const themeKeyMap = {
        'fill': 'filled',
        'outline': 'outlined',
        'twotone': 'twoTone'
      }
      const theme = themeKeyMap[key]
      const list = iconManifest[key]
      for (const item of list) {
        arr.push(
          <Icon
            key={`${theme}-${item}`}
            theme={theme}
            type={item}
            style={{ margin: 3, cursor: 'pointer', fontSize: 16 }}
            onClick={e => {
              const value = this.ModalInst.value
              value.Icon = item
              this.ModalInst.value = value
            }}
          />
        )
      }
    }
    return arr
  }

  async componentDidMount () {
    const dict = await getDict('sys_menu_type')
    if (dict && Array.isArray(dict.Values)) {
      this.setState({
        menuType: dict,
        menuTypeValues: _.chain(dict.Values).groupBy('Value').mapValues(v => _.head(v)).value()
      })
    }
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
      menu_table: {
        onColumnsRender: {
          Name: (t, r) => r.Icon ? <span><Icon type={r.Icon} /> {t}</span> : t,
          Disable: t => t ? <Icon type='eye-invisible' style={{ fontSize: 16, color: '#52c41a' }} /> : <Icon type='eye' style={{ fontSize: 16, color: '#52c41a' }} />,
          Type: t => {
            const { menuTypeValues } = this.state
            const label = _.get(menuTypeValues, `${t}.Label`, '')
            return <span style={{ color: t === 'menu' ? '#179aff' : '#f16cb7' }}>{label}</span>
          },
          Detail: (t, r) => {
            return (
              <div>
                <Checkbox checked={!!r.IsLink}>{window.L('是否外链')}</Checkbox>
                <Checkbox checked={!!r.IsDefaultOpen}>{window.L('默认打开')}</Checkbox>
                <Checkbox checked={r.Closeable === undefined || !!r.Closeable}>{window.L('可关闭')}</Checkbox>
              </div>
            )
          }
        },
        onAdd: e => {
          const presetValue = { Type: 'menu', Disable: '1', Sort: 100, Icon: 'fire', Closeable: true }
          // if (this.state.preEditRecord) {
          //   presetValue.Pid = this.state.preEditRecord.ID
          // }
          this.ModalInst.value = presetValue
          this.setState({ modalVisible: true })
        },
        onEdit: r => {
          const item = _.clone(r)
          item.Disable = item.Disable ? '2' : '1'
          item.Closeable = item.Closeable === undefined || !!item.Closeable
          this.ModalInst.value = item
          this.setState({ modalVisible: true, preEditRecord: item })
        },
        afterList: data => {
          data.list = data.list || []
          data.list = arrayToTree(data.list, {
            customID: 'ID',
            parentProperty: 'Pid',
            childrenProperty: 'children'
          })
          return data
        }
      }
    })
    this.TableComponent = this.TableInst.render()
  }

  initModal () {
    this.ModalInst = Fano.fromJson(ModalConfig).enhance({
      'menu_modal.Pid': {
        onFetch: data => {
          const options = data.map(item => {
            return { title: item.Name, value: item.ID, pid: item.Pid, icon: item.Icon }
          })
          return options
        },
        titleRender: item => item.icon ? <span><Icon type={item.icon} /> {item.title}</span> : item.title
      },
      'menu_modal.Type': {
        onFetch: data => {
          const options = _.get(data, '[0].Values', []).map(item => {
            return { label: item.Label, value: item.Value }
          })
          return options
        }
      },
      'menu_modal.Icon': {
        onRender: v => {
          if (v) {
            v = <Icon type={v} style={{ fontSize: 16 }} />
          } else {
            v = <span style={{ cursor: 'pointer', color: '#179aff' }}>{window.L('请选择图标')}</span>
          }
          v = (
            <Popover
              placement='bottom'
              content={<div>{this.state.iconList}</div>}
            >
              {v}
            </Popover>
          )
          return v
        }
      }
    })
    this.ModalComponent = this.ModalInst.render()
  }

  async handleModalOk () {
    const { value, dirtyValue } = this.ModalInst
    dirtyValue.Icon = value.Icon
    if (_.get(value, 'ID')) {
      if (dirtyValue.Disable) {
        dirtyValue.Disable = dirtyValue.Disable === '2'
      }
      if (!_.isEmpty(dirtyValue)) {
        await update('menu', { _id: _.get(value, 'ID') }, dirtyValue)
      }
    } else if (!_.isEmpty(value)) {
      value.Disable = value.Disable === '2'
      await create('menu', value)
    }

    this.TableInst.emit('menu_table:refresh')
    this.handleModalCancel()
  }

  handleModalCancel () {
    this.setState({ modalVisible: false }, () => {
      this.ModalInst.clear()
    })
  }

  render () {
    const { TableComponent, ModalComponent } = this
    const { modalVisible } = this.state
    return (
      <div className={styles.menu}>
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
      </div>
    )
  }
}

export default Menu
