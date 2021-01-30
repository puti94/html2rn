/**
 * User: puti.
 * Time: 2021/1/27 2:04 下午.
 */
const transform = require('css-to-react-native').default;
const _ = require('lodash');
const parse = require('./parse/index');

function removeShadowExpand(value) {
  const [x, y, r, e, c] = value.split(' ')
  return [x, y, r, c ? c : e].filter(t => typeof t !== "undefined").join(' ')
}

export default function transformCSS(cssStr) {
  const nodes = parse(cssStr);
  return nodes.stylesheet.rules.reduce((memo, item) => {
    let handlerCss = item.declarations
        .map(t => {
          if (t.property === 'box-shadow') {
            return [t.property, removeShadowExpand(t.value)]
          }
          return [t.property, t.value]
        })
        .filter(t => !_.isEmpty(t[1]))
        // .filter(t => !['background-image', 'background-size', 'background-repeat'].includes(t[0]))
        .filter(t => !(t[0] === 'z-index' && t[1] === 'auto'))
        .filter(t => !(t[0] === 'box-sizing' && t[1] === 'border-box'))
        .filter(t => !(t[0] === 'display' && ['flex', 'block'].includes(t[1])));
    memo[item.selectors[0].replace('.', '')] = transform(handlerCss)
    return memo
  }, {})
}

const CSS_LIST = [
  'width',
  'height',
  'top',
  'left',
  'bottom',
  'right',
  'marginLeft',
  'marginTop',
  'marginRight',
  'marginBottom',
  'paddingLeft',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'lineHeight',
  'borderRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomRightRadius',
  'borderBottomLeftRadius',
  'borderTopWidth',
  'borderLeftWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderWidth',
  'shadowRadius',
]

function getSizeValue(value, css, hairline) {
  if (typeof value === 'string') return value
  if (css && value !== 0) {
    return (value === 1 && hairline) ? 'StyleSheet.hairlineWidth' : `PX2DP(${value})`
  } else {
    return value
  }
}

const IGNORE_LIST = ['backgroundSize', 'backgroundRepeat', 'backgroundImage']

export function printJSONValue(obj, {css = true, hairline = true} = {}) {
  return _.keys(obj).reduce((memo, styleName) => {
    let style = obj[styleName];
    const mergeKeys = ['borderTopLeftRadius',
      'borderTopRightRadius',
      'borderBottomRightRadius',
      'borderBottomLeftRadius'];
    // 合并radius
    if (mergeKeys.every(t => style[t] === '50%')) {
      style['borderRadius'] = Math.min(style.width, style.height) / 2
      style = _.omit(style, mergeKeys)
    }
    return `${memo} ${styleName}:{${_.keys(style).reduce((_memo, prop) => {
      const value = style[prop];
      if (_.includes(IGNORE_LIST, prop)) {
        return _memo;
      } else if (_.includes(CSS_LIST, prop)) {
        return `${_memo}  ${prop}: ${getSizeValue(value, css, hairline)},`
      } else if (typeof value === "string") {
        return `${_memo}  ${prop}:'${value}',`
      } else if (css && prop === 'fontSize') {
        return `${_memo}  fontSize:FontSize(${value}),`
      } else if (prop === 'shadowOffset') {
        try {
          return `${_memo} shadowOffset:{width:${getSizeValue(value.width, css, hairline)},height:${getSizeValue(value.height, css, hairline)}},`
        } catch (e) {
          return _memo;
        }
      } else {
        return `${_memo}  ${prop}:${value},`
      }
    }, '')}},`
  }, '{') + '}'
}
