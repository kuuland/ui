import XLSX from 'xlsx'
import moment from 'moment'
import _ from 'lodash'

export async function exportTable (
  columns,
  dataSource,
  filename = moment().format('YYYY-MM-DDTHH:mm:ss'),
  ext = 'xlsx'
) {
  const headers = []
  for (const column of columns) {
    if (['actions'].includes(column.dataIndex)) {
      continue
    }
    headers.push(column.title)
  }
  const rows = [headers]
  for (const record of dataSource) {
    const row = []
    for (const column of columns) {
      let value = _.get(record, column.dataIndex)
      const exporter = _.isFunction(column.exporter) ? column.exporter : column.render
      if (_.isFunction(exporter)) {
        value = exporter(value, record, column)
      }
      row.push(value)
    }
    rows.push(row)
  }
  const ws = XLSX.utils.aoa_to_sheet(rows)
  const wb = XLSX.utils.book_new()

  // 设置表格的宽度
  ws['!cols'] = []
  columns.length > 0 && columns.map(() => {
    ws['!cols'].push({ wpx: 200 })
  })

  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
  XLSX.writeFile(wb, filename.endsWith(ext) ? filename : `${filename}.${ext}`)
}
