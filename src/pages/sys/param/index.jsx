import React from 'react'
import { Switch, Modal } from 'antd'
import Fano from 'fano-react'
import moment from 'moment'
import _ from 'lodash'
import TableConfig from './table.json'
import ModalConfig from './modal.json'
import styles from './index.less'
import { create, update } from '@/sdk/model'

class Param extends React.Component {
  constructor (props) {
    super(props)
    this.init()

    this.state = {
      modalVisible: false
    }
    this.handleModalOk = this.handleModalOk.bind(this)
    this.handleModalCancel = this.handleModalCancel.bind(this)
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
      param_table: {
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
        }
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
        await update('param', { ID: _.get(value, 'ID') }, dirtyValue)
      }
    } else if (!_.isEmpty(value)) {
      await create('param', value)
    }

    this.TableInst.emit('param_table:refresh')
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
      <div className={styles.param}>
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

export default Param
