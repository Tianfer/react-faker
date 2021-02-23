import { ELEMENT_TEXT } from './constants'

/**
 * 创建Dom的方法
 * @param {*} type 元素类型
 * @param {*} config 配置对象，如属性，key，ref等
 * @param  {...any} children 所有子类
 */
function createElement(type, config, ...children) {
  delete config.__self
  delete config.__source
  
  return {
    type,
    props: {
      ...config,
      children: children.map((child) => {
        return typeof child === 'object'
          ? child
          : {
            type: ELEMENT_TEXT,
            props: {
              text: child,
              children: [],
            },
          }
      }),
    }
  }
}

const React = {
  createElement,
}

export default React
