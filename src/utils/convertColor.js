/**
 * User: puti.
 * Time: 2021/1/30 3:51 下午.
 */
import {rgbaStringToObject, rgbaToHex} from 'colors-convert'

export function rgba2hex(value) {
  if (typeof value !== "string" || !value.startsWith('rgb')) return value
  try {
    let hex = rgbaToHex(rgbaStringToObject(value));
    if (hex.length === 9 && hex.endsWith('FF')) {
      return hex.substr(0, 7)
    }
    return hex
  } catch (e) {
    return value
  }
}
