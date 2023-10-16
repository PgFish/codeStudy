/*
 * @Date: 2023-03-16 07:01:30
 * @Description: 
 */
// ! flags定义为二进制，而不是字符串或者单个数字，一方面原因是因为二进制单个数字具有唯一性、某个范围内的组合同样具有唯一性，另一方原因在于简洁方便、且速度快
export const NoFlags = /*                      */ 0b00000000000000000000;

export const Placement = /*                    */ 0b0000000000000000000010; // 2
export const Update = /*                       */ 0b0000000000000000000100; // 4
export const Deletion = /*                     */ 0b0000000000000000001000; // 8

export function isStr(s) {
  return typeof s === "string";
}

export function isStringOrNumber(s) {
  return typeof s === "string" || typeof s === "number";
}

export function isFn(fn) {
  return typeof fn === "function";
}

export function isArray(arr) {
  return Array.isArray(arr);
}

export function isUndefined(s) {
  return s === undefined
}

// 更新节点
export function updateNode(node, nextVal) {
  Object.keys(nextVal).forEach(k => {
    if (k === 'children') {
      if (isStringOrNumber(nextVal[k])) {
        node.textContent = nextVal[k] + ""
      }
    } else {
      node[k] = nextVal[k]
    }
  })
}