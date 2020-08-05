import React, { useEffect, useRef, useState } from 'react'
import { get, withPrefix, withLocale } from 'kuu-tools'
import _ from 'lodash'
import { Popover, Radio, Upload, Button, Icon, message } from 'antd'
import { FanoTable } from 'fano-antd'
import styles from './index.less'

function Intl (props) {
  const tableRef = useRef()
  const [uploadPopoverVisible, setUploadPopoverVisible] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [updateMethod, setUpdateMethod] = useState()
  const [columns, setColumns] = useState([])
  const [form, setForm] = useState([])
  useEffect(() => {
    fetchLanguages()
  }, [])

  const fetchLanguages = () => {
    get('/intl/languages').then(data => {
      const columns = [
        {
          title: 'Key',
          dataIndex: 'key',
          render: 'copy'
        },
        {
          title: 'Description',
          dataIndex: 'default'
        },
        {
          title: 'English',
          dataIndex: 'en'
        },
        {
          title: '简体中文',
          dataIndex: 'zh-Hans'
        },
        {
          title: '繁體中文',
          dataIndex: 'zh-Hant'
        }
      ]
      for (const item of data) {
        if (['en', 'zh-Hans', 'zh-Hant'].includes(item.code)) {
          continue
        }
        columns.push({
          title: item.name,
          dataIndex: item.code
        })
      }
      const form = columns.map(item => ({
        name: item.dataIndex,
        type: 'input',
        label: item.title
      }))
      setColumns(columns)
      setForm(form)
    })
  }

  const beforeList = query => {
    if (query.cond) {
      const newQuery = {}
      const cond = JSON.parse(query.cond)
      const and = _.get(cond, '$and')
      for (const item of and) {
        for (const k in item) {
          const v = _.get(item[k], '$regex')
          if (v) {
            switch (k) {
              case 'key':
                newQuery.prefix = v
                break
              case 'default':
                newQuery.desc = v
                break
            }
          }
        }
      }
      return newQuery
    }
  }

  const afterList = data => {
    let dataSource = []
    for (const key in data) {
      const row = { key }
      const values = data[key]
      for (const lang in values) {
        row[lang] = values[lang]
      }
      dataSource.push(row)
    }
    dataSource = _.sortBy(dataSource, 'key')
    return { list: dataSource }
  }
  const filter = [
    {
      name: 'key',
      props: {
        placeholder: 'Key',
        allowClear: true
      }
    },
    {
      name: 'default',
      props: {
        placeholder: 'Description',
        allowClear: true
      }
    }
  ]
  const beforeUpdate = (body, record) => {
    return { [body.cond.key]: body.doc }
  }
  const beforeDelete = (body, record) => {
    let keys = _.get(body, 'cond.key.$in')
    if (!_.isArray(keys)) {
      const k = _.get(body, 'cond.key')
      if (k) {
        keys = [k]
      }
    }
    if (!_.isArray(keys)) {
      return false
    }
    const res = {}
    for (const k of keys) {
      res[k] = {
        _dr: 'true'
      }
    }
    return res
  }

  const uploadProps = {
    name: 'file',
    action: withPrefix('/intl/messages/upload'),
    accept: '.xls,.xlsx,application/*',
    showUploadList: false,
    data: file => ({ method: updateMethod }),
    onChange: info => {
      if (info.file.status === 'done') {
        if (_.get(info.file, 'response.code') === 0) {
          tableRef.current.handleRefresh()
        } else if (_.get(info.file, 'response.msg')) {
          message.error(_.get(info.file, 'response.msg'))
        }
        setUploadLoading(false)
      } else if (info.file.status === 'error') {
        message.error(props.L('rest_import_failed', 'Upload failed.'))
        setUploadLoading(false)
      } else {
        if (!uploadLoading) {
          setUploadLoading(true)
        }
      }
    }
  }
  const uploadMethodOptions = [
    { label: 'Full Updates', value: 'full' },
    { label: 'Incremental Updates', value: 'incr' }
  ]
  const uploadPopoverContent = (
    <div>
      <div>
        <Radio.Group
          options={uploadMethodOptions}
          onChange={e => setUpdateMethod(e.target.value)}
          value={updateMethod}
          optionType='button'
        />
      </div>
      <div style={{ marginTop: 20 }}>
        <Upload {...uploadProps}>
          <Button disabled={!updateMethod} loading={uploadLoading}>
            {!uploadLoading && <Icon type='upload' />} Click to Upload
          </Button>
        </Upload>
      </div>
    </div>
  )
  const tableActions = [
    {
      key: 'import',
      icon: 'import',
      text: props.L('fano_table_actions_import', 'Import'),
      wrapper: children => (
        <Popover
          placement='bottomLeft'
          trigger='click'
          visible={uploadPopoverVisible}
          onVisibleChange={visible => setUploadPopoverVisible(visible)}
          content={uploadPopoverContent}
        >
          {children}
        </Popover>
      )
    }
  ]
  return (
    <div className={`kuu-container ${styles.container}`}>
      <FanoTable
        ref={tableRef}
        filterReplace
        filter={filter}
        rowKey='key'
        columns={columns}
        form={form}
        tableActions={tableActions}
        listUrl='GET /intl/messages'
        beforeList={beforeList}
        afterList={afterList}
        createUrl='POST /intl/messages/save'
        updateUrl='POST /intl/messages/save'
        beforeUpdate={beforeUpdate}
        deleteUrl='POST /intl/messages/save'
        beforeDelete={beforeDelete}
      />
    </div>
  )
}
export default withLocale(Intl)
