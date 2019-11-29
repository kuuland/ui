import React from 'react'
import styles from './index.less'
import Exception from '@/components/sys/exception'

export default function () {
  return (
    <div className={`kuu-container ${styles.exception}`}>
      <Exception />
    </div>
  )
}
