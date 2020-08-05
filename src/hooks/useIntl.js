import { useIntl as useReactIntl } from 'umi'

export default function useIntl (prefix) {
  const intl = useReactIntl()
  return {
    L: (id, defaultValue, ...values) => {
      if (!id.startsWith(prefix)) {
        id = `${prefix}.${id}`
      }
      return intl.formatMessage(
        {
          id: id,
          defaultMessage: defaultValue
        },
        values
      )
    }
  }
}
