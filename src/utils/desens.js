
export function desensIDNumber (str, placeholder = '*') {
  return desensitization(str, 6, 4, placeholder)
}

export function desensRealName (str, placeholder = '*') {
  return desensitization(str, 1, 1, placeholder)
}

export function desensMobile (str, placeholder = '*') {
  return desensitization(str, 3, 4, placeholder)
}

export function desensBankAccountNumber (str, placeholder = '*') {
  return desensitization(str, 6, 4, placeholder)
}

export function desensitization (str, keepStartLength, keepEndLength, placeholder = '*') {
  if (!str || typeof str !== 'string') {
    return str
  }
  if (str.length === 2 && keepStartLength > 0) {
    if (keepStartLength > 0) {
      keepEndLength = undefined
    } else if (keepEndLength > 0) {
      keepStartLength = undefined
    }
  }
  const n = []
  const keepIndexes = {}
  if (keepStartLength >= 0) {
    for (let i = 0; i < keepStartLength; i++) {
      keepIndexes[i] = true
    }
  }
  if (keepEndLength >= 0 && keepEndLength < str.length) {
    for (let i = str.length - 1; i >= str.length - keepEndLength; i--) {
      keepIndexes[i] = true
    }
  }
  for (let i = 0; i < str.length; i++) {
    const c = keepIndexes[i] ? str[i] : placeholder
    n.push(c)
  }
  return n.join('')
}
