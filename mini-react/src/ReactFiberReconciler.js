import createFiber from "./ReactFiber";
import { isArray, isStringOrNumber, updateNode } from "./utils"

/*
 * @Date: 2023-03-16 07:10:58
 * @Description: 
 */
export function updateHostComponent(wip) {
  if (!wip.stateNode) {
    console.log("🚀 ~ file: ReactFiberReconciler.js:9 ~ updateHostComponent ~ wip:", wip)
    wip.stateNode = document.createElement(wip.type)
    updateNode(wip.stateNode, wip.props);
  }
  reconcileChildren(wip, wip.props.children)
}

export function updateFunctionComponent(wip) {
  const {type, props} = wip
  /** 执行函数组件 */
  const children = type(props)
  reconcileChildren(wip, children)
}

export function updateClassComponent(wip) {
  const {type, props} = wip
  /** 执行函数组件 */
  const instance = new type(props)
  const children = instance.render()
  reconcileChildren(wip, children)
}

export function updateFragmentComponent(wip) {
  reconcileChildren(wip, wip.props.children)
}

export function updateHostTextComponent(wip) {
  wip.stateNode = document.createTextNode(wip.props.children)
}


function reconcileChildren(wip, children) {
  if (isStringOrNumber(children)) {
    return
  }

  const newChildren = isArray(children) ? children : [children];
  let previousNewFiber = null; // 记录上一次fiber
  for (let i = 0; i < newChildren.length; i++) {
    const newChild = newChildren[i];
    const newFiber = createFiber(newChild, wip)
    
    if (i === 0) {
      wip.child = newFiber
    } else {
      previousNewFiber.sibling = newFiber
    }

    previousNewFiber = newFiber
  }
}