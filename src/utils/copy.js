import React from 'react'
import _ from 'lodash'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { message } from 'antd'

export default function (copyText, renderChildren, forceChildren) {
  const style = { color: '#1890ff', cursor: 'pointer' }
  let children = renderChildren || copyText
  if (!forceChildren) {
    children = <span style={style} title={_.isString(children) ? children : copyText}>{children}</span>
  }
  return (
    <CopyToClipboard
      text={copyText}
      onCopy={() => message.success(_.get(window.localeMessages, 'kuu_company_copysuccess') || '复制成功', 0.2)}
    >
      {children}
    </CopyToClipboard>
  )
}
