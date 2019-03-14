import styles from './index.less'
import { Input } from 'antd'

export default function () {
  return (
    <div className={styles.about}>
      <h4>About</h4>
      <Input placeholder='About Page' />
    </div>
  )
}
