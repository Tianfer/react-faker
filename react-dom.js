import { TAG_ROOT } from './constant'

function render(element, container) {
  const rootFiber = {
    tag: TAG_ROOT,
    stateNode: container,
    props: {
      children: [element],
    }
  }

  scheduleRoot(rootFiber)
}

const ReactDOM = {
  render,
}

export default ReactDOM
