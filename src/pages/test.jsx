import SwaggerUI from 'swagger-ui-react'
import styles from './index.less'

export default function () {
  return (
    <div className={styles.test}>
      <SwaggerUI url='https://petstore.swagger.io/v2/swagger.json' />
    </div>
  )
}
