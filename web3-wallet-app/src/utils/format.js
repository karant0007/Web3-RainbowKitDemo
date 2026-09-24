export function shortenAddress(address, chars = 4) {
  if (!address) return ''
  return `${address.slice(0, 2 + chars)}…${address.slice(-chars)}`
}
