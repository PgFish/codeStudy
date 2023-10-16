/*
 * @Date: 2023-03-16 07:09:07
 * @Description:
 */
import {
  updateHostComponent,
  updateFunctionComponent,
  updateClassComponent,
  updateFragmentComponent,
  updateHostTextComponent,
} from "./ReactFiberReconciler";
import {
  ClassComponent,
  FunctionComponent,
  HostComponent,
  HostText,
  Fragment,
} from "./ReactWorkTags";
import { scheduleCallback } from "./scheduler";
import { Placement } from "./utils";

let wip = null; // work in progress 当前正在工作中的
let wipRoot = null;

// 初次渲染和更新
export function scheduleUpdateOnFiber(fiber) {
  wip = fiber;
  wipRoot = fiber;
  scheduleCallback(workLoop)
}

function performUnitOfWork() {
  const { tag } = wip;

  switch (tag) {
    case HostComponent:
      updateHostComponent(wip);
      break;
    case FunctionComponent:
      updateFunctionComponent(wip);
      break;
    case ClassComponent:
      updateClassComponent(wip);
      break;
    case Fragment:
      updateFragmentComponent(wip);
      break;
    case HostText:
      updateHostTextComponent(wip);
      break;

    default:
      break;
  }

  // todo 2.下一个更新谁 深度优先遍历
  if (wip.child) {
    wip = wip.child;
    return;
  }

  let next = wip;

  while (next) {
    if (next.sibling) {
      wip = next.sibling;
      return;
    }

    next = next.return;
  }

  wip = null;
}

/** 一个更新过程可能被打断，所以 React Fiber 一个更新过程被分为两个阶段(Phase)：第一个阶段 Reconciliation Phase 和第二阶段 Commit Phase。 */
function workLoop() {
  while (wip) {
    performUnitOfWork();
  }

  /** 首次渲染提交 */
  if (!wip && wipRoot) {
    commitRoot();
  }
}
// requestHostCallback(workLoop)

function commitRoot() {
  commitWorker(wipRoot);
  wipRoot = null;
}

function commitWorker(wip) {
  if (!wip) {
    return
  }
  // 1. 更新自己
  const { flags, stateNode } = wip
  // 兼容函数组件等情况
  let parentNode = getParentNode(wip.return)
  if (flags && Placement && stateNode) {
    parentNode.appendChild(stateNode)
  }
  // 2. 更新子节点
  commitWorker(wip.child)
  // 3. 更新兄弟节点
  commitWorker(wip.sibling)
}


function getParentNode(wip) {
  let tem = wip
  while(tem) {
    if (tem.stateNode) {
      return tem.stateNode
    }
    tem = tem.return
  }
}