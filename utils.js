export function setProps(dom, oldProps, newProps) {
  for (let key in newProps) {
    if (key !== 'children') {
      setProps(dom, key, newProps[key])
    }
  }
}

function setProps(dom, key, value) {
  if (/^on/.test(key)) {
    dom[key.toLowerCase()] = value
  } else if (key === 'style') {
    if (value) {
      for (let styleName in value) {
        dom.style[styleName] = value[styleName]
      }
    }
  } else {
    dom.setAttribute(key, value)
  }
}
