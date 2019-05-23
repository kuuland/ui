import React from 'react'
import { Modal } from 'antd'
import Fano from 'fano-react'
import moment from 'moment'
import _ from 'lodash'
import arrayToTree from 'array-to-tree'
import styles from './index.less'
import { create, update } from '@/sdk/model'

class Org extends React.Component {
  constructor (props) {
    super(props)
    this.init()

    this.state = {
      modalVisible: false,
      preEditRecord: undefined
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
      name: 'org_table',
      type: 'table',
      defaultSort: 'Sort',
      pageMode: false,
      props: {
        urls: {
          list: '/api/org?range=ALL',
          remove: '/api/org'
        },
        height: 680,
        columns: [
          {
            dataIndex: 'rowNo',
            display: false
          },
          {
            title: '组织名称',
            dataIndex: 'Name',
            sorter: false
          },
          {
            title: '组织编码',
            dataIndex: 'Code',
            sorter: false
          },
          {
            title: '排序',
            dataIndex: 'Sort',
            filter: false,
            align: 'center'
          }
        ],
        onAdd: e => {
          const presetValue = { Sort: 100 }
          this.ModalInst.value = presetValue
          this.setState({ modalVisible: true })
        },
        onEdit: r => {
          const item = _.clone(r)
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
          this.setFullPathPid(data.list)
          return data
        }
      }
    })
    this.TableComponent = this.TableInst.render()
  }

  setFullPathPid (list) {
    const fall = (values, path = '', name) => {
      for (const item of values) {
        item.FullPathPid = path ? `${path},${item.ID}` : item.ID
        item.FullPathName = name ? `${name} > ${item.Name}` : item.Name
        if (!_.isEmpty(item.children)) {
          fall(item.children, item.FullPathPid, item.FullPathName)
        }
      }
    }
    fall(list)
  }

  initModal () {
    this.ModalInst = Fano.fromJson({
      name: 'org_modal',
      type: 'form',
      container: [
        {
          name: 'ID',
          type: 'hidden'
        },
        {
          name: 'Pid',
          type: 'treeselect',
          label: '上级组织',
          props: {
            expandAll: true,
            simpleMode: true,
            allowInput: true,
            url: '/api/org?range=ALL&sort=Sort&project=ID,Code,Name,Pid',
            span: 24,
            onFetch: data => {
              const options = data.map(item => ({
                title: item.Name,
                value: item.ID,
                pid: item.Pid || undefined,
                code: item.Code
              }))
              return options
            }
          }
        },
        {
          name: 'Code',
          type: 'input',
          label: '组织编码',
          props: {
            span: 12
          }
        },
        {
          name: 'Name',
          type: 'input',
          label: '组织名称',
          props: {
            span: 12
          }
        },
        {
          name: 'Sort',
          type: 'number',
          label: '排序',
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
        dirtyValue.FullPathPid = value.FullPathPid
        dirtyValue.FullPathName = value.FullPathName
        await update('org', { ID: _.get(value, 'ID') }, dirtyValue)
      }
    } else if (!_.isEmpty(value)) {
      await create('org', value)
    }

    this.TableInst.emit('org_table:refresh')
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
      <div className={styles.org}>
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

export default Org
