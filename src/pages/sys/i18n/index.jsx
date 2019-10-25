import React from 'react'
import _ from 'lodash'
import { Icon, Input, Modal, List, Button } from 'antd'
import { FanoTable } from 'fano-antd'
import { list, post, withLocale } from 'kuu-tools'
import styles from './index.less'

class I18n extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  async componentDidMount () {
    await this.fetchLanguages()
  }

  async fetchLanguages (cb) {
    const json = await list('language', { range: 'ALL' })
    const arr = _.get(json, 'list', [])
    this.setState({ languages: arr }, cb)
  }

  filterProps (dataIndex) {
    return {
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => {
        return (
          <div style={{ padding: 8 }}>
            <Input
              allowClear
              ref={node => {
                this.searchInput = node
              }}
              placeholder={this.props.L('kuu_i18n_keyword_placeholder', 'Search keywords')}
              value={selectedKeys[0]}
              onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              onPressEnter={confirm}
            />
          </div>
        )
      },
      filterIcon: filtered => (
        <Icon type='search' style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      onFilter: (value, record) => record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
    }
  }

  render () {
    const { languages = [], languagesModalList = [], languagesModalVisible = false } = this.state
    const columns = [
      {
        title: this.props.L('kuu_i18n_key', 'Key'),
        dataIndex: 'Key',
        ...this.filterProps('Key')
      }
    ]
    const form = [
      {
        name: 'Key',
        type: 'input',
        label: this.props.L('kuu_i18n_key', 'Key'),
        props: {
          fieldOptions: {
            rules: [
              {
                required: true,
                message: this.props.L('kuu_i18n_key_required', 'Key is required')
              }
            ]
          }
        }
      }
    ]
    languages.map(lang => {
      const dataIndex = `Lang_${lang.LangCode}_Value`
      columns.push({
        title: lang.LangName,
        dataIndex,
        width: 160,
        ...this.filterProps(dataIndex)
      })
      form.push({
        name: `Lang_${lang.LangCode}_Value`,
        type: 'input',
        label: lang.LangName,
        props: {
          fieldOptions: {
            rules: [
              {
                required: true,
                message: this.props.L('kuu_i18n_key_required', 'Value is required')
              }
            ]
          }
        }
      })
    })
    return (
      <div className={styles.i18n}>
        <FanoTable
          ref={instance => {
            this.table = instance
          }}
          columns={columns}
          form={form}
          rowKey='Key'
          listUrl='GET /langtrans'
          createUrl='POST /langtrans'
          deleteUrl='DELETE /languagemessage'
          updateUrl='POST /langtrans'
          importUrl='/langtrans/import'
          beforeUpdate={(body, formRecord) => {
            return { ...formRecord, ...body.doc }
          }}
          beforeDelete={body => {
            body.multi = true
          }}
          fillTAP={{
            sort: false,
            filter: false,
            import: true
          }}
          tableActions={[
            {
              key: 'languages',
              icon: 'global',
              text: this.props.L('kuu_i18n_actions_languages', 'Languages'),
              onClick: () => this.setState({ languagesModalVisible: true, languagesModalList: _.cloneDeep(languages) })
            }
          ]}
        />
        <Modal
          title={this.props.L('kuu_i18n_actions_languages', 'Languages')}
          icon='global'
          maskClosable
          width={420}
          visible={languagesModalVisible}
          onOk={async () => {
            const ret = await post('/langlist', languagesModalList)
            if (ret) {
              this.fetchLanguages()
              this.table.handleRefresh()
              this.setState({ languagesModalVisible: false })
            }
          }}
          onCancel={() => this.setState({ languagesModalVisible: false })}
        >
          <List
            size='small'
            dataSource={languagesModalList}
            footer={
              <Button
                type='primary' icon='plus'
                onClick={() => {
                  languagesModalList.push({
                    LangCode: undefined,
                    LangName: undefined
                  })
                  this.setState({ languagesModalList })
                }}
              />
            }
            renderItem={(item, index) => (
              <List.Item>
                <Input.Group compact>
                  <Input
                    style={{ width: '40%' }} value={item.LangCode}
                    onChange={e => {
                      item.LangCode = e.target.value
                      languagesModalList[index] = item
                      this.setState({ languagesModalList })
                    }}
                    placeholder={this.props.L('kuu_i18n_languages_langcode', 'Language code')}
                  />
                  <Input
                    style={{ width: '50%' }} value={item.LangName}
                    onChange={e => {
                      item.LangName = e.target.value
                      languagesModalList[index] = item
                      this.setState({ languagesModalList })
                    }}
                    placeholder={this.props.L('kuu_i18n_languages_langname', 'Language name')}
                  />
                  <Button
                    style={{ width: '10%' }}
                    type='danger' icon='minus'
                    onClick={() => {
                      languagesModalList.splice(index, 1)
                      this.setState({ languagesModalList })
                    }}
                  />
                </Input.Group>
              </List.Item>
            )}
          />
        </Modal>
      </div>
    )
  }
}

export default withLocale(I18n)
