import React, { createElement } from 'react'
import classNames from 'classnames'
import { Button } from 'antd'
import styles from './exception.less'

class Exception extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    const config = {
      403: {
        img: 'https://gw.alipayobjects.com/zos/rmsportal/wZcnGqRDyhPOEYFcZDnb.svg',
        title: '403',
        desc: window.L('Exception-403', '抱歉，你无权访问该页面')
      },
      404: {
        img: 'https://gw.alipayobjects.com/zos/rmsportal/KpnpchXsobRgLElEozzI.svg',
        title: '404',
        desc: window.L('Exception-404', '抱歉，你访问的页面不存在')
      },
      500: {
        img: 'https://gw.alipayobjects.com/zos/rmsportal/RVRUAYdCGeYNBWoKiIwB.svg',
        title: '500',
        desc: window.L('Exception-500', '抱歉，服务器出错了')
      }
    }
    const {
      className,
      backText,
      linkElement = 'a',
      type,
      title,
      desc,
      img,
      actions,
      redirect,
      ...rest
    } = this.props
    const pageType = type in config ? type : '404'
    const clsString = classNames(styles.exception, className)
    return (
      <div className={clsString} {...rest}>
        <div className={styles.imgBlock}>
          <div
            className={styles.imgEle}
            style={{ backgroundImage: `url(${img || config[pageType].img})` }}
          />
        </div>
        <div className={styles.content}>
          <h1>{title || config[pageType].title}</h1>
          <div className={styles.desc}>{desc || config[pageType].desc}</div>
          <div className={styles.actions}>
            {actions ||
              createElement(
                linkElement,
                {
                  to: redirect,
                  href: redirect
                },
                <Button type='primary'>{backText}</Button>
              )}
          </div>
        </div>
      </div>
    )
  }
}

Exception.defaultProps = {
  backText: window.L('Exception-back', 'back to home'),
  redirect: '/'
}

export default Exception
