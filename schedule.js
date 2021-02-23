import { ELEMENT_TEXT, TAG_ROOT, TAG_TEXT, TAG_HOST, PLACEMENT } from './constants'
import { setProps } from './utils'

let nextUnitOfWork = null
let workInProgressRoot = null

export function scheduleRoot(rootFiber) {
  workInProgressRoot = nextUnitOfWork = rootFiber
}

function reconcileChildren(currentFiber, newChildren) {
  let newChildIndex = 0
  let prevSibling = null
  while(newChildIndex < newChildren.length) {
    let newChild = newChildren[newChildIndex]
    let tag = null

    if (newChild.type === ELEMENT_TEXT) {
      tag = TAG_TEXT
    } else if (typeof newChild.type === 'string') {
      tag = TAG_HOST
    }

    let newFiber = {
      tag,
      type: newChild.type,
      props: newChild.props,
      stateNode: null,
      return: currentFiber,
      effectTag: PLACEMENT, // 副作用：增加、删除、更新
      nextEffect: null, // 单链表
    }

    if (newFiber) {
      if (newChildIndex === 0) {
        currentFiber.child = newFiber
      } else {
        prevSibling.next = newFiber // 前一个指向下一个形成链表
      }
      prevSibling = newFiber
    }

    newChildIndex++
  }
}

function updateHostRoot(currentFiber) {
  let newChildren = currentFiber.props.children
  reconcileChildren(currentFiber, newChildren)
}

function updateDOM(stateNode, oldProps, newProps) {
  setProps(stateNode, oldProps, newProps)
}

function createDOM(currentFiber) {
  if (currentFiber.tag === TAG_TEXT) {
    return document.createTextNode(currentFiber.props.text)
  } else if (currentFiber.tag === TAG_HOST) {
    let stateNode = document.createElement(currentFiber.type)
    updateDOM(stateNode, {}, currentFiber.props)
    return stateNode
  }
}

function updateHostText(currentFiber) {
  if (!currentFiber.stateNode) {
    currentFiber.stateNode = createDOM(currentFiber)
  }
}

function updateHost(currentFiber) {
  if (!currentFiber.stateNode) {
    currentFiber.stateNode = createDOM(currentFiber)
  }
  let newChildren = currentFiber.props.children
  reconcileChildren(currentFiber, newChildren)
}

function completeUnitOfWork(currentFiber) {
  let returnFiber = currentFiber.return
  if (returnFiber) {
    const effectTag = currentFiber.effectTag
    if (!returnFiber.firstEffect) {
      returnFiber.firstEffect = currentFiber.firstEffect
    }
    if (currentFiber.lastEffect) {
      if (returnFiber.lastEffect) {
        returnFiber.lastEffect.nextEffect = currentFiber.firstEffect
      } else {
        returnFiber.lastEffect = currentFiber.lastEffect
      }
    }

    if (effectTag) { // 有副作用
      if (returnFiber.lastEffect) {
        returnFiber.lastEffect.nextEffect = currentFiber 
      } else {
        returnFiber.firstEffect = currentFiber
      }
      returnFiber.lastEffect = currentFiber
    }
  }
}

function beginWork(currentFiber) {
  if (currentFiber.tag === TAG_ROOT) {
    updateHostRoot(currentFiber)
  } else if (currentFiber.tag === TAG_TEXT) {
    updateHostText(currentFiber)
  } else if (currentFiber.tag === TAG_HOST) {
    updateHost(currentFiber)
  }
}

function performUnitOfWork(currentFiber) {
  beginWork(currentFiber)
  if (currentFiber.child) {
    return currentFiber.child // 子节点
  }

  while(currentFiber) {
    completeUnitOfWork(currentFiber) // 完成当前节点
    if (currentFiber.sibling) {
      return currentFiber.sibling // 兄弟节点
    }
    currentFiber = currentFiber.return // 父节点
  }
}

function workLoop() {
  let shouldYield = false
  while(nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining() < 1
  }

  if (!nextUnitOfWork && workInProgressRoot) {
    console.log('render阶段结束')
    commitRoot()
  }

  requestIdleCallback(workLoop, { timeout: 500 }) // 每一帧都要执行workLoop
}

function commitRoot() {
  let currentFiber = workInProgressRoot.firstEffect
  while(currentFiber) {
    commitWork(currentFiber)
    currentFiber = currentFiber.nextEffect
  }
  workInProgressRoot = null
}

function commitWork(currentFiber) {
  if (!currentFiber) {
    return
  }
  let returnFiber = currentFiber.return
  let returnDOM = returnFiber.stateNode
  if (returnFiber.effectTag === PLACEMENT) {
    returnDOM.appendChild(currentFiber.stateNode)
  }
  returnDOM = null
}

requestIdleCallback(workLoop, { timeout: 500 })
