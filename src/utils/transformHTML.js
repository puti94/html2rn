/**
 * User: puti.
 * Time: 2021/1/27 11:56 上午.
 */
/**
 * User: puti.
 * Time: 2020/11/25 5:39 下午.
 */
const {parse} = require('node-html-parser');
const _ = require('lodash');


function getJsValue(value) {
  if (typeof value === 'string') {
    if (value.startsWith('require')) {
      return value
    }
    return `'${value}'`
  } else if (typeof value === 'object') {
    return JSON.stringify(value)
  } else {
    return value
  }
}

function renderProps(props) {
  return _.keys(props).reduce((memo, t) => {
    if (t === 'style') return memo + `${t}={${props[t]}}`
    return memo + `${t}={${getJsValue(props[t])}}`
  }, '')
}

function parseHTML(html, selector = 'body') {
  let root = parse(html);
  if (selector) {
    root = root.querySelector(selector);
  }
  if (!root || !root.rawTagName) {
    return null
  }
  
  function analysisSingleTag(node) {
    return {
      ...node,
      tag: node.rawTagName,
      props: {
        ...node.attributes,
        children: node.childNodes.filter(t => t.rawTagName || t.nodeType === 3).map(analysisSingleTag)
      }
    }
  }
  
  return analysisSingleTag(root)
}

function getUrl(url) {
  try {
    return url.match(/url\(.*\)/)[0].replace('url(', '').replace(')', '')
  } catch (e) {
    return null
  }
}

export default function transformHTML(html, selector, styles, {requireImage = false} = {}) {
  const metadata = {
    text: '',
    styles: {},
    images: {},
    node: {},
    components: {}
  }
  if (typeof html !== "string") {
    return metadata;
  }
  const root = parseHTML(html, selector);
  if (!root) {
    return metadata
  }
  
  function renderTagWithProps({tag, nodeType, rawText, props: {class: className, children, ...props}}) {
    if (nodeType === 3) return String(rawText).trim()
    let _tag = tag;
    if (className) {
      props.style = `styles.${className}`;
      metadata.styles[className] = true;
      if (styles[className] && styles[className].backgroundImage) {
        const {backgroundImage} = styles[className]
        const url = getUrl(backgroundImage)
        if (url) {
          console.log('背景图', props, styles[className])
          _tag = 'ImageBackground'
          props.source = requireImage ? `require('./images/${className}.png')` : {uri: url};
          metadata.images[url] = className;
          metadata.components['ImageBackground'] = true;
        }
      }
    }
    switch (_tag) {
      case 'br':
        return '\n';
      case 'div':
      case 'body':
        _tag = 'View';
        metadata.components['View'] = true
        break;
      case 'img':
        _tag = 'Image';
        if (props.src) {
          props.source = requireImage ? `require('./images/${className}.png')` : {uri: props.src};
          metadata.images[props.src] = className;
          delete props.src;
        }
        metadata.components['Image'] = true
        delete props.referrerpolicy;
        break;
      case 'span':
        _tag = 'Text';
        metadata.components['Text'] = true
        break;
      default:
        break;
    }
    return `<${_tag} ${renderProps(props)} ${children.length === 0 ? '/>' : `>${children.map(renderTagWithProps).join('')}</${_tag}>`}`
  }
  
  metadata.text = renderTagWithProps(root);
  metadata.node = root;
  return metadata
}
