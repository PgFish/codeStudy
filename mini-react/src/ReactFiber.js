/*
 * @Date: 2023-03-16 07:00:16
 * @Description:
 */
import {
  ClassComponent,
  Fragment,
  FunctionComponent,
  HostComponent,
  HostText,
} from "./ReactWorkTags";
import { isFn, isStr, isUndefined, Placement } from "./utils";

export default function createFiber(vNode, returnFiber) {
  const fiber = {
    type: vNode.type,
    key: vNode.key,
    props: vNode.props,
    stateNode: null, // 原生标签时候指dom节点，类组件时候指的是实例
    child: null, // 第一个子fiber
    sibling: null, // 下一个兄弟fiber
    return: returnFiber, // 父fiber
    // 标记节点是什么类型的
    flags: Placement,
    // 老节点
    alternate: null,
    deletions: null, // 要删除子节点 null或者[]
    index: null, //当前层级下的下标，从0开始
  };

  const { type } = vNode;
  if (isStr(type)) {
    fiber.tag = HostComponent;
  } else if (isFn(type)) {
    fiber.tag = type.prototype.isReactComponent
      ? ClassComponent
      : FunctionComponent;
  } else if (isUndefined(type)) {
    fiber.tag = HostText;
    fiber.props = { children: vNode };
  } else {
    fiber.tag = Fragment;
  }

  return fiber;
}
