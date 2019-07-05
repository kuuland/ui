import React from 'react'
import { Switch, Modal } from 'antd'
import Fano from 'fano-react'
import moment from 'moment'
import _ from 'lodash'
import styles from './index.less'
import { create, update } from 'kuu-tools'

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
    this.TableInst = Fano.fromJson({
      name: 'param_table',
      type: 'table',
      props: {
        urls: {
          list: '/api/param',
          remove: '/api/param'
        },
        columns: [
          {
            title: '参数编码',
            dataIndex: 'Code'
          },
          {
            title: '参数名称',
            dataIndex: 'Name'
          },
          {
            title: '参数值',
            dataIndex: 'Value'
          },
          {
            title: '是否系统内置',
            dataIndex: 'IsBuiltIn',
            render: t => <Switch checked={t === true} />
          }
        ],
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
    this.ModalInst = Fano.fromJson({
      name: 'param_modal',
      type: 'form',
      container: [
        {
          name: 'ID',
          type: 'hidden'
        },
        {
          name: 'Code',
          type: 'input',
          label: '参数编码',
          props: {
            span: 12,
            disabled: `{{_.get(rootValue, 'IsBuiltIn') === true}}`
          }
        },
        {
          name: 'Name',
          type: 'input',
          label: '参数名称',
          props: {
            span: 12,
            disabled: `{{_.get(rootValue, 'IsBuiltIn') === true}}`
          }
        },
        {
          name: 'Value',
          type: 'textarea',
          label: '参数值',
          props: {
            span: 24,
            disabled: `{{_.get(rootValue, 'IsBuiltIn') === true}}`
          }
        },
        {
          condition: `{{!_.isEmpty(_.get(rootValue, 'ID'))}}`,
          name: 'IsBuiltIn',
          type: 'switch',
          label: '系统内置',
          props: {
            span: 24,
            disabled: true
          }
        },
        {
          condition: `{{!_.isEmpty(_.get(rootValue, 'ID'))}}`,
          name: 'CreatedBy.Name',
          type: 'text',
          label: '创建人',
          props: {
            span: 12
          }
        },
        {
          condition: `{{!_.isEmpty(_.get(rootValue, 'ID'))}}`,
          name: 'CreatedAt',
          type: 'text',
          label: '创建时间',
          props: {
            span: 12
          }
        },
        {
          condition: `{{!_.isEmpty(_.get(rootValue, 'ID'))}}`,
          name: 'UpdatedBy.Name',
          type: 'text',
          label: '修改人',
          props: {
            span: 12
          }
        },
        {
          condition: `{{!_.isEmpty(_.get(rootValue, 'ID'))}}`,
          name: 'UpdatedAt',
          type: 'text',
          label: '修改时间',
          props: {
            span: 12
          }
        }
      ]
    })
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
          onCancel={this.handleModalCancel}
        >
          <ModalComponent />
        </Modal>
      </div>
    )
  }
}

export default Param
