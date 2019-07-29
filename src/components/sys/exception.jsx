import React, { createElement } from 'react'
import classNames from 'classnames'
import { Button } from 'antd'
import { withLocale } from 'kuu-tools'
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
        desc: this.props.L('kuu_pages_exception_403', 'Sorry, you don\'t have access to this page.')
      },
      404: {
        img: 'https://gw.alipayobjects.com/zos/rmsportal/KpnpchXsobRgLElEozzI.svg',
        title: '404',
        desc: this.props.L('kuu_pages_exception_404', 'Sorry, the page you visited does not exist.')
      },
      500: {
        img: 'https://gw.alipayobjects.com/zos/rmsportal/RVRUAYdCGeYNBWoKiIwB.svg',
        title: '500',
        desc: this.props.L('kuu_pages_exception_500', 'Sorry, the server is reporting an error.')
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
              <Button type='primary'>{backText || this.props.L('kuu_pages_exception_back', 'back to home')}</Button>
            )}
          </div>
        </div>
      </div>
    )
  }
}

Exception.defaultProps = {
  redirect: '/'
}

export default withLocale(Exception)
